/**
 * tag-pyq-topics — generic LLM topic-tagger for pyq_questions
 * ============================================================
 * Operates on `WHERE topic_tags IS NULL` so the same script tags any future
 * source (jeebench, reja1_benchmark, nta_official, ncert_exemplar) without
 * code changes — just re-run after a new ingest.
 *
 * Uses Claude Sonnet 4.6 to read each question, emit:
 *   - topic_tags[]  — short physics topic phrases ("photoelectric_effect",
 *                     "kinematics_1d", "rotational_inertia", etc.)
 *   - concept_ids[] — strict subset of VALID_CONCEPT_IDS from intentClassifier.ts
 *
 * Batches 5 questions per Sonnet call for efficiency. Validates concept_ids[]
 * against VALID_CONCEPT_IDS at update time — fail-loud if Sonnet hallucinates.
 *
 * Usage:
 *   npx tsx --env-file=.env.local src/scripts/tag-pyq-topics.ts                # tag all NULL rows
 *   npx tsx --env-file=.env.local src/scripts/tag-pyq-topics.ts --limit 5      # try a small batch first
 *   npx tsx --env-file=.env.local src/scripts/tag-pyq-topics.ts --dry-run      # parse + LLM-call but skip UPDATE
 *
 * Re-run safety: only UPDATEs rows where topic_tags IS NULL, so re-runs are
 * idempotent and pick up any newly-ingested untagged rows.
 */

// Load .env.local FIRST — `npx tsx --env-file` is fragile on this repo's mixed
// CRLF/LF .env.local; dotenv handles both cleanly.
// eslint-disable-next-line @typescript-eslint/no-require-imports
require("dotenv").config({ path: ".env.local", override: true });

import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

// VALID_CONCEPT_IDS + CONCEPT_SYNONYMS inlined from src/lib/intentClassifier.ts
// (NOT imported because intentClassifier transitively pulls in supabaseAdmin
// which validates env at module-load time — happens BEFORE dotenv runs.)
// Keep in sync with intentClassifier.ts when new concepts are added.
const VALID_CONCEPT_IDS: ReadonlySet<string> = new Set([
    'ohms_law', 'parallel_resistance', 'series_resistance',
    'kirchhoffs_voltage_law', 'kirchhoffs_current_law', 'kirchhoffs_laws',
    'wheatstone_bridge', 'meter_bridge', 'internal_resistance',
    'electric_power_heating', 'drift_velocity', 'resistivity', 'resistance',
    'temperature_dependence_of_resistance', 'resistance_temperature_dependence',
    'potentiometer',
    'vector_resolution',
    'unit_vector', 'angle_between_vectors', 'scalar_multiplication',
    'negative_vector', 'equal_vs_parallel',
    'current_not_vector', 'parallelogram_law_test', 'pressure_scalar', 'area_vector',
    'resultant_formula', 'special_cases', 'range_inequality', 'direction_of_resultant',
    'unit_vector_form', 'inclined_plane_components', 'negative_components', 'dot_product',
    'distance_displacement_basics', 'average_speed_velocity',
    'instantaneous_velocity', 'sign_convention', 's_in_equations',
    'three_cases', 'free_fall', 'sth_formula', 'negative_time',
    'a_function_of_t', 'a_function_of_x', 'a_function_of_v', 'initial_conditions',
    'xt_graph', 'vt_graph', 'at_graph', 'direction_reversal',
    'vab_formula', 'relative_1d_cases', 'time_to_meet',
    'upstream_downstream', 'shortest_time_crossing', 'shortest_path_crossing',
    'apparent_rain_velocity', 'umbrella_tilt_angle',
    'ground_velocity_vector', 'heading_correction',
    'time_of_flight', 'max_height', 'range_formula',
    'up_incline_projectile', 'down_incline_projectile',
    'two_projectile_meeting', 'two_projectile_never_meet',
    'field_forces', 'contact_forces', 'normal_reaction', 'tension_in_string',
    'hinge_force', 'free_body_diagram',
    'friction_static_kinetic',
]);

const CONCEPT_SYNONYMS: Readonly<Record<string, string>> = {
    normal_force: 'normal_reaction', normal_forces: 'normal_reaction',
    tension: 'tension_in_string', rope_tension: 'tension_in_string',
    atwood_machine: 'tension_in_string',
    contact_force: 'contact_forces', field_force: 'field_forces',
    weight: 'field_forces', gravitational_force: 'field_forces',
    fbd: 'free_body_diagram', laws_of_motion: 'free_body_diagram',
    friction: 'friction_static_kinetic',
    static_friction: 'friction_static_kinetic',
    kinetic_friction: 'friction_static_kinetic',
    coefficient_of_friction: 'friction_static_kinetic',
    mu_s: 'friction_static_kinetic', mu_k: 'friction_static_kinetic',
    kirchhoffs_law: 'kirchhoffs_laws',
};

// ── Args ──────────────────────────────────────────────────────────────────────
function getArg(name: string, fallback: string): string {
    const idx = process.argv.indexOf(`--${name}`);
    if (idx === -1) return fallback;
    const next = process.argv[idx + 1];
    return next && !next.startsWith("--") ? next : fallback;
}

const IS_DRY_RUN = process.argv.includes("--dry-run");
const LIMIT      = parseInt(getArg("limit", "0"), 10) || 0;
const BATCH_SIZE = 5;          // questions per Sonnet call
const MAX_TOPIC_TAGS = 5;      // Sonnet returns at most 5 topic tags per question
const SONNET_MODEL = "claude-sonnet-4-6";

// ── Env ───────────────────────────────────────────────────────────────────────
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;
if (!ANTHROPIC_KEY) {
    console.error("Missing ANTHROPIC_API_KEY");
    process.exit(1);
}

const SUPABASE_URL = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
}

const anthropic = new Anthropic({ apiKey: ANTHROPIC_KEY });
const supabase  = createClient(SUPABASE_URL, SUPABASE_KEY);

// ── Sonnet output schema ──────────────────────────────────────────────────────
const TaggingResponseSchema = z.object({
    questions: z.array(z.object({
        id:           z.union([z.number(), z.string()]).transform((v) => Number(v)),
        topic_tags:   z.array(z.string()).max(MAX_TOPIC_TAGS),
        concept_ids:  z.array(z.string()),
        difficulty:   z.enum(["easy", "medium", "hard"]).nullable().optional(),
    })),
});

type TaggingResponse = z.infer<typeof TaggingResponseSchema>;

// ── System prompt (Sonnet) ────────────────────────────────────────────────────
const VALID_IDS_SORTED = [...VALID_CONCEPT_IDS].sort().join(", ");

function buildSystemPrompt(): string {
    return `You are a physics curriculum tagger for an Indian-context AI tutor. You receive past-year exam questions (JEE Advanced, JEE Mains, NEET) and assign:

1. **topic_tags** (1-5 short physics phrases in snake_case) — describe the physics topics the question tests. Examples: "photoelectric_effect", "rotational_inertia", "circular_motion", "thermodynamics_first_law", "newton_third_law". Use plain physics vocabulary; not specific chapter names.

2. **concept_ids** (0-3 IDs strictly from the allowed vocabulary below) — map to PhysicsMind's atomic concept registry. ONLY return IDs that exactly match the vocabulary. If no concept_id fits, return [] — do NOT invent or approximate.

3. **difficulty** ("easy" | "medium" | "hard" | null) — your judgment of question difficulty for an Indian Class 12 / JEE aspirant. JEE Advanced questions skew "medium" or "hard"; NEET skews "easy" or "medium". Return null if unsure.

ALLOWED concept_ids (return only these, exactly as written, or []):
${VALID_IDS_SORTED}

You will receive a JSON array of questions. Reply with a JSON object: {"questions": [{"id": <id>, "topic_tags": [...], "concept_ids": [...], "difficulty": "..."}]}.

Critical: NO prose, NO markdown fences, NO commentary — JSON only. Every input id must appear exactly once in your output. Concept_ids that aren't in the vocabulary above must NOT appear in your response.`;
}

// ── Pull a JSON object out of Sonnet's response (defensive) ──────────────────
function extractJsonObject(text: string): unknown | null {
    const firstBrace = text.indexOf("{");
    const lastBrace  = text.lastIndexOf("}");
    if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) return null;
    const snippet = text.slice(firstBrace, lastBrace + 1);
    try { return JSON.parse(snippet); } catch { return null; }
}

// ── Tag one batch of questions ────────────────────────────────────────────────
interface PyqRow {
    id: number;
    question_text: string;
    exam: string;
    year: number | null;
    question_type: string | null;
}

async function tagBatch(rows: PyqRow[]): Promise<TaggingResponse> {
    const userContent = rows.map((r) => ({
        id: r.id,
        exam: r.exam,
        year: r.year,
        type: r.question_type,
        // Truncate very long questions to keep prompt tokens predictable
        question: r.question_text.length > 1500 ? r.question_text.slice(0, 1500) + "..." : r.question_text,
    }));

    const response = await anthropic.messages.create({
        model: SONNET_MODEL,
        max_tokens: 1500,
        system: buildSystemPrompt(),
        messages: [{
            role: "user",
            content: JSON.stringify(userContent, null, 2),
        }],
    });

    let text = "";
    for (const block of response.content) {
        if (block.type === "text") {
            text += block.text + "\n";
        }
    }

    const parsed = extractJsonObject(text);
    if (!parsed) {
        throw new Error(`Sonnet returned non-JSON: ${text.slice(0, 200)}`);
    }
    return TaggingResponseSchema.parse(parsed);
}

// ── Filter / coerce concept_ids using VALID set + synonyms ────────────────────
function sanitizeConceptIds(rawIds: string[]): string[] {
    const out = new Set<string>();
    for (const raw of rawIds) {
        const lower = raw.toLowerCase().trim();
        const canonical = CONCEPT_SYNONYMS[lower] ?? lower;
        if (VALID_CONCEPT_IDS.has(canonical)) {
            out.add(canonical);
        }
    }
    return [...out];
}

// ── Sleep ─────────────────────────────────────────────────────────────────────
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
    console.log("\nPyQ topic-tagger");
    console.log(`  Mode:       ${IS_DRY_RUN ? "DRY RUN (no UPDATE)" : "LIVE"}`);
    console.log(`  Batch size: ${BATCH_SIZE}`);
    if (LIMIT) console.log(`  Limit:      ${LIMIT} rows`);
    console.log();

    // Load all untagged rows
    let query = supabase
        .from("pyq_questions")
        .select("id, question_text, exam, year, question_type")
        .is("topic_tags", null)
        .order("id", { ascending: true });
    if (LIMIT) query = query.limit(LIMIT);

    const { data, error } = await query;
    if (error) {
        console.error("Failed to load untagged rows:", error.message);
        process.exit(1);
    }

    const rows = (data ?? []) as PyqRow[];
    console.log(`Untagged rows to process: ${rows.length}\n`);
    if (rows.length === 0) {
        console.log("Nothing to do.");
        return;
    }

    let processed = 0;
    let invalidConceptIdCount = 0;
    let errors = 0;

    for (let i = 0; i < rows.length; i += BATCH_SIZE) {
        const batch = rows.slice(i, i + BATCH_SIZE);
        let result: TaggingResponse;
        try {
            result = await tagBatch(batch);
        } catch (err) {
            console.error(`\n  Batch ${i / BATCH_SIZE + 1} error:`, (err as Error).message);
            errors += batch.length;
            await sleep(2000);
            continue;
        }

        // Index by id for fast lookup
        const byId = new Map(result.questions.map((q) => [q.id, q]));

        for (const row of batch) {
            const tagged = byId.get(row.id);
            if (!tagged) {
                console.warn(`  No tagger output for id=${row.id}, skipping`);
                errors++;
                continue;
            }

            const cleanedConceptIds = sanitizeConceptIds(tagged.concept_ids);
            if (cleanedConceptIds.length < tagged.concept_ids.length) {
                invalidConceptIdCount += tagged.concept_ids.length - cleanedConceptIds.length;
            }

            const update = {
                topic_tags:  tagged.topic_tags,
                concept_ids: cleanedConceptIds.length > 0 ? cleanedConceptIds : null,
                difficulty:  tagged.difficulty ?? null,
            };

            if (IS_DRY_RUN) {
                console.log(
                    `  [DRY] id=${row.id} | tags=${JSON.stringify(update.topic_tags)} | concepts=${JSON.stringify(update.concept_ids)} | diff=${update.difficulty}`
                );
            } else {
                const { error: updErr } = await supabase
                    .from("pyq_questions")
                    .update(update)
                    .eq("id", row.id);
                if (updErr) {
                    console.error(`  UPDATE error id=${row.id}: ${updErr.message}`);
                    errors++;
                    continue;
                }
            }

            processed++;
        }

        process.stdout.write(`\r  Tagged: ${processed} / ${rows.length} (${errors} errors, ${invalidConceptIdCount} concept_id rejects)`);

        // Rate-limit between Sonnet calls
        await sleep(500);
    }

    console.log(`\n\nDone.`);
    console.log(`  Tagged:                 ${processed}`);
    console.log(`  Errors:                 ${errors}`);
    console.log(`  Concept_id rejects:     ${invalidConceptIdCount} (Sonnet returned IDs not in VALID_CONCEPT_IDS — silently dropped)`);

    if (!IS_DRY_RUN) {
        console.log(`\nVerification:`);
        console.log(`  SELECT COUNT(*) FROM pyq_questions WHERE topic_tags IS NOT NULL;`);
        console.log(`  -- Expected: ${processed} (or higher if previous runs tagged some)`);
    }
}

main().catch((err) => {
    console.error("Fatal:", err);
    process.exit(1);
});
