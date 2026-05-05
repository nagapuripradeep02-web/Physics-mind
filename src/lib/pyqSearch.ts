/**
 * pyqSearch — semantic search over pyq_questions.
 *
 * Mirrors the ncertSearch.ts shape but for past-year exam questions
 * (JEE Adv, JEE Mains, NEET) ingested across multiple sources
 * (jeebench / reja1_benchmark / nta_official, expanding over time).
 *
 * Pure additive: ncertSearch.ts is untouched. Consumers opt into PYQ search.
 *
 * Vector path: gemini-embedding-001 768-dim → match_pyq_questions RPC.
 * Returns rows ordered by cosine similarity, with optional filters for
 * subject / exam / year range / concept / source / difficulty.
 *
 * The same pyqSearch.ts powers both the standalone "show me a similar JEE
 * problem" UI flow and the cross-source searchAll() fan-out helper.
 */

import { supabaseAdmin } from "./supabaseAdmin";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface PYQResult {
    id: number;
    source_repo: string;
    external_id: string | null;
    exam: string;
    paper: string | null;
    year: number | null;
    subject: string;
    question_type: string | null;
    question_text: string;
    gold_answer: string | null;
    options: string[] | null;
    topic_tags: string[] | null;
    concept_ids: string[] | null;
    difficulty: string | null;
    source_url: string | null;
    similarity: number;
}

export interface SearchPYQOptions {
    /** Filter by subject (default 'physics'). */
    subjectFilter?: "physics" | "chemistry" | "mathematics";
    /** Filter to one exam (e.g. 'jee_advanced', 'jee_mains', 'neet'). */
    examFilter?: string;
    /** Inclusive year range (omit for no bound). */
    yearMinFilter?: number;
    yearMaxFilter?: number;
    /** Match rows that include this concept_id in their concept_ids[] array. */
    conceptIdFilter?: string;
    /** Filter to one ingest source (e.g. 'nta_official'). */
    sourceRepoFilter?: string;
    /** Filter by Sonnet-tagged difficulty. */
    difficultyFilter?: "easy" | "medium" | "hard";
    /** Max results to return (default 5). */
    maxResults?: number;
    /** Cosine similarity threshold (default 0.30 — same as ncertSearch). */
    matchThreshold?: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Embedding helper — duplicated from ncertSearch.ts intentionally to keep
// these two modules independent (changing one must not break the other).
// ─────────────────────────────────────────────────────────────────────────────

async function generatePYQEmbedding(text: string): Promise<number[]> {
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) throw new Error("GOOGLE_GENERATIVE_AI_API_KEY not set");

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${apiKey}`;
    const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            model: "models/gemini-embedding-001",
            content: { parts: [{ text }] },
            outputDimensionality: 768,
        }),
    });

    if (!res.ok) {
        const body = await res.text();
        throw new Error(`Embedding API ${res.status}: ${body}`);
    }

    const data = (await res.json()) as { embedding: { values: number[] } };
    return data.embedding.values;
}

// ─────────────────────────────────────────────────────────────────────────────
// searchPYQ — main entry point
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Semantic search over pyq_questions (multi-source PYQ corpus).
 *
 * @example
 *   await searchPYQ("photoelectric effect")
 *   await searchPYQ("Bernoulli", { examFilter: "jee_mains", maxResults: 3 })
 *   await searchPYQ("Newton third law", { conceptIdFilter: "free_body_diagram" })
 */
export async function searchPYQ(
    query: string,
    options: SearchPYQOptions = {}
): Promise<PYQResult[]> {
    const {
        subjectFilter = "physics",
        examFilter,
        yearMinFilter,
        yearMaxFilter,
        conceptIdFilter,
        sourceRepoFilter,
        difficultyFilter,
        maxResults = 5,
        matchThreshold = 0.30,
    } = options;

    if (!query || query.trim().length === 0) {
        console.warn("[pyqSearch] empty query — returning []");
        return [];
    }

    let embedding: number[];
    try {
        embedding = await generatePYQEmbedding(query);
    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error("[pyqSearch] embedding failed:", msg);
        return [];
    }

    const { data, error } = await supabaseAdmin.rpc("match_pyq_questions", {
        query_embedding:    embedding,
        match_threshold:    matchThreshold,
        match_count:        maxResults,
        filter_subject:     subjectFilter,
        filter_exam:        examFilter ?? null,
        filter_year_min:    yearMinFilter ?? null,
        filter_year_max:    yearMaxFilter ?? null,
        filter_concept_id:  conceptIdFilter ?? null,
        filter_source_repo: sourceRepoFilter ?? null,
        filter_difficulty:  difficultyFilter ?? null,
    });

    if (error) {
        console.error("[pyqSearch] RPC error:", error.message);
        return [];
    }

    const rows = (data ?? []) as Array<Record<string, unknown>>;
    const results: PYQResult[] = rows.map((row) => ({
        id:            row.id as number,
        source_repo:   (row.source_repo ?? "") as string,
        external_id:   (row.external_id ?? null) as string | null,
        exam:          (row.exam ?? "") as string,
        paper:         (row.paper ?? null) as string | null,
        year:          (row.year ?? null) as number | null,
        subject:       (row.subject ?? "") as string,
        question_type: (row.question_type ?? null) as string | null,
        question_text: (row.question_text ?? "") as string,
        gold_answer:   (row.gold_answer ?? null) as string | null,
        options:       (row.options as string[] | null) ?? null,
        topic_tags:    (row.topic_tags as string[] | null) ?? null,
        concept_ids:   (row.concept_ids as string[] | null) ?? null,
        difficulty:    (row.difficulty ?? null) as string | null,
        source_url:    (row.source_url ?? null) as string | null,
        similarity:    (row.similarity ?? 0) as number,
    }));

    console.log(
        `[pyqSearch] "${query.substring(0, 60)}" | ${results.length} hit(s) | ` +
        `top=${results[0]?.similarity?.toFixed(3) ?? "none"} | ` +
        `filters=${[
            subjectFilter,
            examFilter,
            conceptIdFilter,
            sourceRepoFilter,
            yearMinFilter && `y≥${yearMinFilter}`,
            yearMaxFilter && `y≤${yearMaxFilter}`,
            difficultyFilter,
        ].filter(Boolean).join(",") || "none"}`
    );

    return results;
}
