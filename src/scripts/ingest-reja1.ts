/**
 * Reja1/jee-neet-benchmark — physics-only ingest into pyq_questions
 * ===================================================================
 * Reads metadata.jsonl from a local clone of the HF dataset, filters to
 * subject='Physics', OCRs each PNG via Claude Sonnet 4.6 vision, generates
 * 768-dim embeddings via gemini-embedding-001, and INSERTs rows into
 * pyq_questions with source_repo='reja1_benchmark'.
 *
 * Coverage after this ingest: JEE Adv 2024+2025 + NEET 2024+2025, ~161 physics rows.
 *
 * License: Reja1/jee-neet-benchmark is MIT (Hugging Face dataset).
 *
 * OCR caching: each image's OCR output is cached to
 *   physics-mind/.cache/reja1-ocr/<file_name_slug>.json
 * Re-runs skip the OCR step when a cache hit exists. Delete the cache dir to
 * force re-OCR (e.g. if the prompt changes).
 *
 * Prerequisites:
 *   1. git clone https://huggingface.co/datasets/Reja1/jee-neet-benchmark C:\Tutor\reja1-source
 *   2. (Repo has invalid Windows paths under results/; use sparse checkout
 *      to skip — see PROGRESS.md session 45 for the workaround.)
 *   3. .env.local has ANTHROPIC_API_KEY + GOOGLE_GENERATIVE_AI_API_KEY +
 *      SUPABASE_SERVICE_ROLE_KEY + NEXT_PUBLIC_SUPABASE_URL.
 *
 * Usage:
 *   npx tsx src/scripts/ingest-reja1.ts                              # default paths, full ingest
 *   npx tsx src/scripts/ingest-reja1.ts --metadata <path/to/metadata.jsonl>
 *   npx tsx src/scripts/ingest-reja1.ts --dry-run                    # OCR + log, no DB writes
 *   npx tsx src/scripts/ingest-reja1.ts --limit 3                    # ingest only first N physics rows
 *
 * Safety:
 *   UNIQUE (source_repo, external_id) protects against re-run duplicates.
 *   external_id format: ${exam_name_lc}_${exam_year}_${question_id}
 */

// Load .env.local FIRST — repo's .env.local has mixed CRLF/LF line endings;
// dotenv with override:true is the robust pattern (see tag-pyq-topics.ts).
// eslint-disable-next-line @typescript-eslint/no-require-imports
require("dotenv").config({ path: ".env.local", override: true });

import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve, join, dirname, basename } from "node:path";
import { z } from "zod";

// ── Args ──────────────────────────────────────────────────────────────────────
function getArg(name: string, fallback: string): string {
    const idx = process.argv.indexOf(`--${name}`);
    if (idx === -1) return fallback;
    const next = process.argv[idx + 1];
    return next && !next.startsWith("--") ? next : fallback;
}

const METADATA_PATH = resolve(getArg("metadata", "../reja1-source/images/metadata.jsonl"));
const IMAGES_DIR    = dirname(METADATA_PATH);
const CACHE_DIR     = resolve(".cache/reja1-ocr");
const IS_DRY_RUN    = process.argv.includes("--dry-run");
const LIMIT         = parseInt(getArg("limit", "0"), 10) || 0;
const delayArg      = process.argv.find((a) => a.startsWith("--delay="));
const DELAY_MS      = delayArg ? parseInt(delayArg.split("=")[1]) : 800;

// ── Constants ─────────────────────────────────────────────────────────────────
const SOURCE_REPO   = "reja1_benchmark";
const SOURCE_URL    = "https://huggingface.co/datasets/Reja1/jee-neet-benchmark";
const LICENSE       = "MIT";
const SONNET_MODEL  = "claude-sonnet-4-6";

// Reja1 exam_name → canonical exam string in pyq_questions
const EXAM_MAP: Record<string, string> = {
    JEE_ADVANCED: "jee_advanced",
    NEET:         "neet",
};

// Reja1 question_type → canonical question_type
const TYPE_MAP: Record<string, string> = {
    MCQ_SINGLE_CORRECT:   "mcq_single",
    MCQ_MULTIPLE_CORRECT: "mcq_multiple",
    INTEGER:              "integer",
    NUMERIC:              "numeric",
};

// ── Env checks ────────────────────────────────────────────────────────────────
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;
const GOOGLE_API_KEY = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
const SUPABASE_URL = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!ANTHROPIC_KEY)   { console.error("Missing ANTHROPIC_API_KEY"); process.exit(1); }
if (!GOOGLE_API_KEY)  { console.error("Missing GOOGLE_GENERATIVE_AI_API_KEY"); process.exit(1); }
if (!IS_DRY_RUN && (!SUPABASE_URL || !SUPABASE_KEY)) {
    console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
}

const anthropic = new Anthropic({ apiKey: ANTHROPIC_KEY });
const supabase  = IS_DRY_RUN ? null : createClient(SUPABASE_URL!, SUPABASE_KEY!);

// ── Metadata schema (Reja1 row shape) ─────────────────────────────────────────
const MetadataRowSchema = z.object({
    file_name:      z.string(),
    question_id:    z.string(),
    exam_name:      z.string(),
    exam_year:      z.number().int(),
    subject:        z.string(),
    question_type:  z.string(),
    correct_answer: z.string(),  // JSON-stringified array, e.g. '["1"]' or '["B","C"]' or '["42"]'
});
type MetadataRow = z.infer<typeof MetadataRowSchema>;

// ── OCR output schema ─────────────────────────────────────────────────────────
const OcrOutputSchema = z.object({
    question_text: z.string(),
    options:       z.array(z.string()).nullable().optional(),
});
type OcrOutput = z.infer<typeof OcrOutputSchema>;

// ── OCR helper (Sonnet 4.6 vision + local cache) ──────────────────────────────
function cachePathFor(imagePath: string): string {
    const slug = basename(imagePath).replace(/\.png$/i, ".json");
    return join(CACHE_DIR, slug);
}

async function ocrImageToText(imagePath: string): Promise<OcrOutput> {
    if (!existsSync(CACHE_DIR)) mkdirSync(CACHE_DIR, { recursive: true });

    const cachePath = cachePathFor(imagePath);
    if (existsSync(cachePath)) {
        const cached = JSON.parse(readFileSync(cachePath, "utf-8"));
        return OcrOutputSchema.parse(cached);
    }

    const imageBytes = readFileSync(imagePath);
    const imageB64 = imageBytes.toString("base64");

    const response = await anthropic.messages.create({
        model: SONNET_MODEL,
        max_tokens: 1500,
        system: `You are an OCR system for Indian competitive-exam physics questions (JEE Advanced, NEET). The image contains one question typeset in PDF / scan format with mathematical symbols, diagrams, and multiple-choice options.

Extract:
- "question_text": the full question prose with equations rendered as inline LaTeX ($...$). If the question references a diagram, describe it briefly in brackets, e.g. "[diagram: free-body diagram of block on incline]". Do NOT solve the question — just extract the verbatim text + diagram description.
- "options": array of option strings if the question has multiple-choice options, else null. Include the option label in the string, e.g. ["(A) 6.0 × 10^-34", "(B) 6.4 × 10^-34", ...]. For NEET, options are numbered (1)/(2)/(3)/(4); for JEE Advanced, lettered (A)/(B)/(C)/(D). For Integer / Numeric questions return null.

Reply with ONLY valid JSON: {"question_text": "...", "options": [...]}. No prose, no markdown fences, no commentary.`,
        messages: [{
            role: "user",
            content: [
                {
                    type: "image",
                    source: { type: "base64", media_type: "image/png", data: imageB64 },
                },
                {
                    type: "text",
                    text: "Extract the question text + options as JSON.",
                },
            ],
        }],
    });

    let text = "";
    for (const block of response.content) {
        if (block.type === "text") text += block.text + "\n";
    }

    const firstBrace = text.indexOf("{");
    const lastBrace  = text.lastIndexOf("}");
    if (firstBrace === -1 || lastBrace === -1) {
        throw new Error(`OCR returned non-JSON for ${imagePath}: ${text.slice(0, 200)}`);
    }
    const parsed = JSON.parse(text.slice(firstBrace, lastBrace + 1));
    const validated = OcrOutputSchema.parse(parsed);

    writeFileSync(cachePath, JSON.stringify(validated, null, 2), "utf-8");
    return validated;
}

// ── Embedding (gemini-embedding-001 768-dim, mirrors session 41) ─────────────
async function embed(text: string): Promise<number[]> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${GOOGLE_API_KEY}`;
    const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            model: "models/gemini-embedding-001",
            content: { parts: [{ text }] },
            outputDimensionality: 768,
        }),
    });
    if (!res.ok) throw new Error(`Embedding API ${res.status}: ${await res.text()}`);
    const data = await res.json();
    return data.embedding.values as number[];
}

// ── Parse correct_answer ('["B","D"]' → "BD" / '["42"]' → "42") ──────────────
function normalizeGoldAnswer(rawJson: string, examName: string, questionType: string): string {
    let parsed: unknown;
    try { parsed = JSON.parse(rawJson); } catch { return rawJson; }
    if (!Array.isArray(parsed)) return String(parsed);
    const arr = parsed as string[];
    if (arr.length === 0) return "";
    // For JEE Advanced MCQ_MULTIPLE: "ABD" letter-concat (matches JEEBench convention).
    // For NEET MCQ_SINGLE: keep as "1" / "2" / "3" / "4".
    // For Integer / Numeric: keep the value.
    if (examName === "JEE_ADVANCED" && questionType === "MCQ_MULTIPLE_CORRECT") {
        return arr.join("");
    }
    return arr.join(",");
}

// ── Insert helper ─────────────────────────────────────────────────────────────
async function insertRow(row: Record<string, unknown>): Promise<void> {
    if (IS_DRY_RUN || !supabase) return;
    const { error } = await supabase.from("pyq_questions").insert(row);
    if (error) throw new Error(`Insert error: ${error.message}`);
}

// ── Sleep ─────────────────────────────────────────────────────────────────────
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
    console.log("\nReja1/jee-neet-benchmark — physics-only ingest");
    console.log(`  metadata:   ${METADATA_PATH}`);
    console.log(`  images dir: ${IMAGES_DIR}`);
    console.log(`  cache dir:  ${CACHE_DIR}`);
    console.log(`  Mode:       ${IS_DRY_RUN ? "DRY RUN (no DB writes)" : "LIVE"}`);
    if (LIMIT) console.log(`  Limit:      ${LIMIT} rows`);
    console.log();

    if (!existsSync(METADATA_PATH)) {
        console.error(`Cannot find metadata.jsonl at ${METADATA_PATH}`);
        process.exit(1);
    }

    const lines = readFileSync(METADATA_PATH, "utf-8")
        .split(/\r?\n/)
        .filter((l) => l.trim());
    const rows: MetadataRow[] = lines.map((l) => MetadataRowSchema.parse(JSON.parse(l)));
    console.log(`Total rows:    ${rows.length}`);

    const physics = rows.filter((r) => r.subject === "Physics");
    console.log(`Physics rows:  ${physics.length}`);

    const queue = LIMIT ? physics.slice(0, LIMIT) : physics;

    // Safety check: warn if reja1_benchmark rows already exist
    if (!IS_DRY_RUN && supabase) {
        const { count } = await supabase
            .from("pyq_questions")
            .select("*", { count: "exact", head: true })
            .eq("source_repo", "reja1_benchmark");
        if (count && count > 0) {
            console.warn(`\nWARNING: ${count} reja1_benchmark rows already exist.`);
            console.warn("Re-runs use UNIQUE (source_repo, external_id) for dedup;");
            console.warn("conflicts will fail-fast. Continuing in 5s...");
            await sleep(5000);
        }
    }

    let processed = 0;
    let cached    = 0;
    let errors    = 0;

    for (const r of queue) {
        const imagePath = join(IMAGES_DIR, r.file_name);
        if (!existsSync(imagePath)) {
            console.warn(`  SKIP ${r.question_id}: image not found at ${imagePath}`);
            errors++;
            continue;
        }

        // Cache check (for progress reporting)
        const wasCached = existsSync(cachePathFor(imagePath));

        // OCR (cached)
        let ocr: OcrOutput;
        try {
            ocr = await ocrImageToText(imagePath);
            if (wasCached) cached++;
        } catch (err) {
            console.error(`  OCR error ${r.question_id}: ${(err as Error).message}`);
            errors++;
            await sleep(2000);
            continue;
        }

        if (!ocr.question_text || ocr.question_text.trim().length < 30) {
            console.warn(`  SKIP ${r.question_id}: question_text too short after OCR`);
            errors++;
            continue;
        }

        // Build the embedding-target string: question + options for richer context
        const embedText = ocr.options && ocr.options.length > 0
            ? `${ocr.question_text}\n\nOptions:\n${ocr.options.join("\n")}`
            : ocr.question_text;

        let embedding: number[];
        try {
            embedding = await embed(embedText);
        } catch (err) {
            console.error(`  Embed error ${r.question_id}: ${(err as Error).message}`);
            errors++;
            await sleep(2000);
            continue;
        }

        const exam = EXAM_MAP[r.exam_name] ?? "jee_advanced";
        const questionType = TYPE_MAP[r.question_type] ?? null;
        const goldAnswer = normalizeGoldAnswer(r.correct_answer, r.exam_name, r.question_type);

        // Paper field: JEE Advanced PNGs encode P1/P2 in the path; NEET doesn't.
        const paperMatch = r.file_name.match(/_P([12])_/);
        const paper = paperMatch ? `Paper ${paperMatch[1]}` : null;

        const externalId = `${exam}_${r.exam_year}_${r.question_id}`;

        const row = {
            source_repo:    SOURCE_REPO,
            external_id:    externalId,
            exam:           exam,
            paper:          paper,
            year:           r.exam_year,
            subject:        "physics",
            question_type:  questionType,
            question_text:  embedText,
            gold_answer:    goldAnswer || null,
            options:        ocr.options ?? null,
            topic_tags:     null,
            concept_ids:    null,
            difficulty:     null,
            embedding:      embedding,
            license:        LICENSE,
            source_url:     SOURCE_URL,
        };

        if (IS_DRY_RUN) {
            console.log(
                `  [DRY] ${r.question_id} | ${exam} ${r.exam_year} ${paper ?? ""} | ${questionType} | gold=${goldAnswer} | qtext_len=${ocr.question_text.length} | opts=${ocr.options?.length ?? 0}`
            );
        } else {
            try {
                await insertRow(row);
            } catch (err) {
                console.error(`  Insert error ${r.question_id}: ${(err as Error).message}`);
                errors++;
                continue;
            }
        }

        processed++;
        process.stdout.write(`\r  Processed: ${processed} / ${queue.length}  (${cached} cached OCR, ${errors} errors)`);

        await sleep(DELAY_MS);
    }

    console.log(`\n\nDone.`);
    console.log(`  Processed:   ${processed}`);
    console.log(`  OCR cached:  ${cached} (skipped Sonnet calls on re-run)`);
    console.log(`  Errors:      ${errors}`);

    if (!IS_DRY_RUN) {
        console.log(`\nVerification:`);
        console.log(`  SELECT exam, year, COUNT(*) FROM pyq_questions WHERE source_repo='reja1_benchmark' GROUP BY exam, year ORDER BY exam, year;`);
        console.log(`\nNext step:`);
        console.log(`  npx tsx src/scripts/tag-pyq-topics.ts   # auto-tags the new untagged rows`);
    }
}

main().catch((err) => {
    console.error("Fatal:", err);
    process.exit(1);
});
