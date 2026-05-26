/**
 * Seed script — syncs `comprehension_quiz` field from concept JSONs in
 * src/data/concepts/ to the state_comprehension_quiz table.
 *
 * Usage:  npm run seed:comprehension-quiz
 *
 * Behavior:
 *  - Reads every *.json in src/data/concepts/.
 *  - Skips files missing a `comprehension_quiz` field (silent).
 *  - For each (concept_id, state_id, question_index): UPSERT against the
 *    unique constraint (concept_id, state_id, question_index).
 *  - Marks rows previously present but absent from the JSON as `active=false`
 *    (soft delete — preserves attempts referring to old questions).
 *
 * Spec: physics-mind/docs/COMPREHENSION_METRIC.md §7.4
 */
import { createClient } from "@supabase/supabase-js";
import { readdir, readFile } from "node:fs/promises";
import { join, basename } from "node:path";

interface QuizQuestionInput {
    question_text: string;
    question_type?: "mcq_single" | "mcq_multi" | "true_false";
    options: Array<{
        id: string;
        text: string;
        is_correct: boolean;
        distractor_label?: string;
    }>;
    correct_explanation?: string;
    difficulty?: "easy" | "medium" | "hard";
    weight?: number;
    pyq_reference?: string;
}

interface StateQuizInput {
    state_id: string;
    state_concept_tag: string;
    questions: QuizQuestionInput[];
}

interface ConceptJsonShape {
    concept_id?: string;
    comprehension_quiz?: StateQuizInput[];
}

const CONCEPTS_DIR = join(process.cwd(), "src", "data", "concepts");

async function loadConceptJsons(): Promise<Array<{ filename: string; concept: ConceptJsonShape }>> {
    const entries = await readdir(CONCEPTS_DIR);
    const out: Array<{ filename: string; concept: ConceptJsonShape }> = [];
    for (const entry of entries) {
        if (!entry.endsWith(".json")) continue;
        const filePath = join(CONCEPTS_DIR, entry);
        try {
            const raw = await readFile(filePath, "utf8");
            const parsed = JSON.parse(raw) as unknown;
            if (Array.isArray(parsed)) continue; // skip legacy bundle JSONs
            out.push({ filename: entry, concept: parsed as ConceptJsonShape });
        } catch (err) {
            console.warn(`⚠ skipping ${entry}: ${err instanceof Error ? err.message : "parse error"}`);
        }
    }
    return out;
}

async function main(): Promise<void> {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
        console.error("Missing env vars: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY");
        process.exit(1);
    }
    const supabase = createClient(url, key, { auth: { persistSession: false } });

    const files = await loadConceptJsons();
    console.log(`Found ${files.length} concept JSON files in src/data/concepts/`);

    let totalUpserted = 0;
    let totalConceptsWithQuiz = 0;
    let totalConceptsSkipped = 0;
    const activeKeysByConcept = new Map<string, Set<string>>(); // concept_id → set of "state_id|question_index"

    for (const { filename, concept } of files) {
        const conceptId = concept.concept_id ?? basename(filename, ".json");
        const quiz = concept.comprehension_quiz;

        if (!quiz || !Array.isArray(quiz) || quiz.length === 0) {
            totalConceptsSkipped += 1;
            continue;
        }

        totalConceptsWithQuiz += 1;
        const activeKeys = new Set<string>();
        activeKeysByConcept.set(conceptId, activeKeys);

        for (const stateBlock of quiz) {
            if (!stateBlock.state_id || !Array.isArray(stateBlock.questions)) continue;
            for (let i = 0; i < stateBlock.questions.length; i++) {
                const q = stateBlock.questions[i];
                if (!q.question_text || !Array.isArray(q.options) || q.options.length === 0) continue;

                const question_index = i + 1;
                const key = `${stateBlock.state_id}|${question_index}`;
                activeKeys.add(key);

                const row = {
                    concept_id: conceptId,
                    state_id: stateBlock.state_id,
                    question_index,
                    question_text: q.question_text,
                    question_type: q.question_type ?? "mcq_single",
                    options: q.options,
                    correct_explanation: q.correct_explanation ?? null,
                    difficulty: q.difficulty ?? "medium",
                    state_concept_tag: stateBlock.state_concept_tag,
                    pyq_reference: q.pyq_reference ?? null,
                    weight: q.weight ?? 1.0,
                    active: true,
                    authored_by: "seed-script",
                };

                const { error } = await supabase
                    .from("state_comprehension_quiz")
                    .upsert(row, { onConflict: "concept_id,state_id,question_index" });

                if (error) {
                    console.error(
                        `  ✗ ${conceptId} / ${stateBlock.state_id} Q${question_index}: ${error.message}`
                    );
                } else {
                    totalUpserted += 1;
                }
            }
        }

        console.log(`  ✓ ${conceptId} — ${activeKeys.size} questions upserted`);
    }

    // Soft-delete: mark rows no longer present in JSONs as inactive
    let totalDeactivated = 0;
    for (const [conceptId, activeKeys] of activeKeysByConcept.entries()) {
        const { data, error } = await supabase
            .from("state_comprehension_quiz")
            .select("id, state_id, question_index")
            .eq("concept_id", conceptId)
            .eq("active", true);
        if (error) {
            console.warn(`  ⚠ ${conceptId}: could not query existing rows for cleanup`);
            continue;
        }
        const stale = (data ?? []).filter(
            (r) => !activeKeys.has(`${r.state_id}|${r.question_index}`)
        );
        if (stale.length === 0) continue;
        const staleIds = stale.map((r) => r.id);
        const { error: deactErr } = await supabase
            .from("state_comprehension_quiz")
            .update({ active: false })
            .in("id", staleIds);
        if (deactErr) {
            console.warn(`  ⚠ ${conceptId}: deactivation failed: ${deactErr.message}`);
        } else {
            totalDeactivated += stale.length;
        }
    }

    console.log("");
    console.log("Summary:");
    console.log(`  concepts with quiz : ${totalConceptsWithQuiz}`);
    console.log(`  concepts skipped   : ${totalConceptsSkipped} (no comprehension_quiz field)`);
    console.log(`  questions upserted : ${totalUpserted}`);
    console.log(`  questions deactivated (soft delete): ${totalDeactivated}`);
}

main().catch((err) => {
    console.error("Fatal:", err);
    process.exit(1);
});
