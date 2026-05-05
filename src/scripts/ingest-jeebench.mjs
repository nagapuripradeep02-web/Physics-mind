/**
 * JEEBench (dair-iitd/jeebench) — physics-only ingest into pyq_questions
 * =======================================================================
 * Reads dataset.json from a local clone of dair-iitd/jeebench, filters to
 * subject='phy', generates 768-dim embeddings via gemini-embedding-001, and
 * INSERTs rows into pyq_questions with source_repo='jeebench'.
 *
 * License: dair-iitd/jeebench is MIT (Copyright 2023 DAIR Group, IIT Delhi).
 * Citation: Arora et al., "Have LLMs Advanced Enough? A Challenging Problem
 * Solving Benchmark For Large Language Models" (EMNLP 2023).
 *
 * Prerequisites:
 *   1. git clone https://github.com/dair-iitd/jeebench C:\Tutor\jeebench-source
 *   2. cd C:\Tutor\jeebench-source && unzip data.zip -d ./extracted
 *   3. .env.local has GOOGLE_GENERATIVE_AI_API_KEY + SUPABASE service-role keys.
 *
 * Usage:
 *   node src/scripts/ingest-jeebench.mjs                                 # default paths
 *   node src/scripts/ingest-jeebench.mjs --dataset <path/to/dataset.json>
 *   node src/scripts/ingest-jeebench.mjs --dry-run                       # parse + validate, no embeds, no DB writes
 *   node src/scripts/ingest-jeebench.mjs --limit 5                       # ingest only first N physics rows
 *   node src/scripts/ingest-jeebench.mjs --batch=10 --delay=600
 *
 * Safety:
 *   UNIQUE (source_repo, external_id) constraint protects against duplicates
 *   on a re-run (re-runs will fail-fast via insert error; clear with
 *   DELETE FROM pyq_questions WHERE source_repo = 'jeebench').
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

// ── Load .env.local ───────────────────────────────────────────────────────────
try {
    const { config } = await import("dotenv");
    config({ path: ".env.local" });
} catch {
    // dotenv not installed — rely on process env
}

// ── Args ──────────────────────────────────────────────────────────────────────
function getArg(name, fallback) {
    const idx = process.argv.indexOf(`--${name}`);
    if (idx === -1) return fallback;
    const next = process.argv[idx + 1];
    return next && !next.startsWith("--") ? next : fallback;
}

const DATASET_PATH = resolve(getArg("dataset", "../jeebench-source/extracted/data/dataset.json"));
const IS_DRY_RUN   = process.argv.includes("--dry-run");
const LIMIT        = parseInt(getArg("limit", "0"), 10) || 0;
const batchArg     = process.argv.find((a) => a.startsWith("--batch="));
const delayArg     = process.argv.find((a) => a.startsWith("--delay="));
const BATCH_SIZE   = batchArg ? parseInt(batchArg.split("=")[1]) : 10;
const DELAY_MS     = delayArg ? parseInt(delayArg.split("=")[1]) : 600;

// ── Constants ─────────────────────────────────────────────────────────────────
const SOURCE_REPO = "jeebench";
const SOURCE_URL  = "https://github.com/dair-iitd/jeebench";
const LICENSE     = "MIT";
const EXAM        = "jee_advanced";

// JEEBench `subject` field → canonical subject string in pyq_questions
const SUBJECT_MAP = {
    phy:  "physics",
    chem: "chemistry",
    math: "mathematics",
};

// JEEBench `type` field → canonical question_type
const TYPE_MAP = {
    "MCQ":           "mcq_single",
    "MCQ(multiple)": "mcq_multiple",
    "Integer":       "integer",
    "Numeric":       "numeric",
};

// ── Env checks ────────────────────────────────────────────────────────────────
const GOOGLE_API_KEY = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
if (!GOOGLE_API_KEY) {
    console.error("Missing GOOGLE_GENERATIVE_AI_API_KEY");
    process.exit(1);
}

const SUPABASE_URL = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!IS_DRY_RUN && (!SUPABASE_URL || !SUPABASE_KEY)) {
    console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
}

const supabase = IS_DRY_RUN ? null : createClient(SUPABASE_URL, SUPABASE_KEY);

// ── Parse description: "JEE Adv 2016 Paper 1" → { year, paper } ──────────────
const DESCRIPTION_RE = /^JEE\s+Adv\s+(\d{4})\s+(Paper\s+\d+)/i;

function parseDescription(desc) {
    const m = DESCRIPTION_RE.exec(desc ?? "");
    if (!m) return { year: null, paper: null };
    return { year: parseInt(m[1], 10), paper: m[2] };
}

// ── Embedding ────────────────────────────────────────────────────────────────
async function embed(text) {
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
    if (!res.ok) {
        const body = await res.text();
        throw new Error(`Embedding API ${res.status}: ${body}`);
    }
    const data = await res.json();
    return data.embedding.values;
}

// ── Insert batch ──────────────────────────────────────────────────────────────
async function insertBatch(rows) {
    if (IS_DRY_RUN) {
        console.log(`[DRY RUN] Would insert ${rows.length} row(s):`);
        rows.slice(0, 3).forEach((r) => {
            console.log(
                `  ${r.exam} ${r.year} ${r.paper} idx=${r.external_id} type=${r.question_type} | gold=${r.gold_answer}`
            );
        });
        return;
    }

    const { error } = await supabase.from("pyq_questions").insert(rows);
    if (error) {
        console.error(`\n  Insert error: ${error.message}`);
        throw error;
    }
}

// ── Sleep ─────────────────────────────────────────────────────────────────────
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
    console.log("\nJEEBench — physics-only ingest");
    console.log(`  Dataset:    ${DATASET_PATH}`);
    console.log(`  Batch size: ${BATCH_SIZE}`);
    console.log(`  Delay:      ${DELAY_MS}ms`);
    console.log(`  Mode:       ${IS_DRY_RUN ? "DRY RUN (no DB writes)" : "LIVE"}`);
    if (LIMIT) console.log(`  Limit:      ${LIMIT} rows`);
    console.log();

    if (!existsSync(DATASET_PATH)) {
        console.error(`Cannot find dataset.json at ${DATASET_PATH}`);
        console.error(`Run: cd C:\\Tutor\\jeebench-source && unzip data.zip -d ./extracted`);
        process.exit(1);
    }

    // Safety check: warn if jeebench rows already exist
    if (!IS_DRY_RUN) {
        const { count, error } = await supabase
            .from("pyq_questions")
            .select("*", { count: "exact", head: true })
            .eq("source_repo", "jeebench");

        if (error) {
            console.error("Could not check existing jeebench rows:", error.message);
            process.exit(1);
        }
        if (count > 0) {
            console.warn(`\nWARNING: ${count} jeebench rows already exist in pyq_questions.`);
            console.warn("Re-running will FAIL on UNIQUE (source_repo, external_id).");
            console.warn("To start fresh: DELETE FROM pyq_questions WHERE source_repo = 'jeebench';");
            console.warn("Continuing in 5 seconds... (Ctrl+C to abort)\n");
            await sleep(5000);
        }
    }

    // Load dataset
    const raw = JSON.parse(readFileSync(DATASET_PATH, "utf-8"));
    console.log(`dataset.json: ${raw.length} total questions`);

    const physics = raw.filter((q) => q.subject === "phy");
    console.log(`Physics-only: ${physics.length} questions`);

    if (LIMIT && physics.length > LIMIT) {
        console.log(`Limiting to first ${LIMIT}`);
    }
    const queue = LIMIT ? physics.slice(0, LIMIT) : physics;

    let processed = 0;
    let skipped   = 0;
    let errors    = 0;
    let batch     = [];

    for (const q of queue) {
        // Validate required fields
        if (!q.question || typeof q.question !== "string" || q.question.trim().length < 30) {
            console.warn(`  SKIP idx=${q.index}: question text too short or missing`);
            skipped++;
            continue;
        }
        if (!q.type || !TYPE_MAP[q.type]) {
            console.warn(`  SKIP idx=${q.index}: unknown type "${q.type}"`);
            skipped++;
            continue;
        }

        const { year, paper } = parseDescription(q.description);
        if (!year) {
            console.warn(`  SKIP idx=${q.index}: cannot parse year from "${q.description}"`);
            skipped++;
            continue;
        }

        // external_id includes year + paper + index so re-imports are idempotent
        // and an index that's repeated across years (unlikely but possible) does
        // not collide.
        const paperSlug   = (paper ?? "p1").toLowerCase().replace(/\s+/g, "");
        const externalId  = `${year}_${paperSlug}_idx${q.index}`;

        // Generate embedding (one retry on transient failure)
        let embedding;
        for (let attempt = 0; attempt < 2; attempt++) {
            try {
                embedding = await embed(q.question);
                break;
            } catch (err) {
                if (attempt === 1) {
                    console.error(`  Embed error (idx=${q.index}): ${err.message}`);
                    errors++;
                    embedding = null;
                } else {
                    await sleep(2000);
                }
            }
        }
        if (!embedding) continue;

        batch.push({
            source_repo:    SOURCE_REPO,
            external_id:    externalId,
            exam:           EXAM,
            paper:          paper,
            year:           year,
            subject:        SUBJECT_MAP[q.subject],
            question_type:  TYPE_MAP[q.type],
            question_text:  q.question,
            gold_answer:    q.gold ?? null,
            options:        null,                       // future: parse out (A)/(B)/(C)/(D) into JSON
            topic_tags:     null,                       // future: LLM-tag in a separate session
            concept_ids:    null,                       // future: map to PhysicsMind VALID_CONCEPT_IDS
            difficulty:     null,                       // not provided by JEEBench
            embedding:      embedding,
            license:        LICENSE,
            source_url:     SOURCE_URL,
        });

        processed++;

        if (batch.length >= BATCH_SIZE) {
            try {
                await insertBatch(batch);
                process.stdout.write(`\r  Inserted: ${processed} / ${queue.length} (${errors} errors, ${skipped} skipped)`);
            } catch {
                errors += batch.length;
            }
            batch = [];
        }

        await sleep(DELAY_MS);
    }

    // Flush remaining
    if (batch.length > 0) {
        try {
            await insertBatch(batch);
        } catch {
            errors += batch.length;
        }
    }

    console.log(`\n\nDone.`);
    console.log(`  Embedded:  ${processed}`);
    console.log(`  Skipped:   ${skipped}`);
    console.log(`  Errors:    ${errors}`);

    if (!IS_DRY_RUN) {
        console.log(`\nVerification queries:`);
        console.log(`  -- count by year + paper`);
        console.log(`  SELECT year, paper, COUNT(*) FROM pyq_questions WHERE source_repo='jeebench' GROUP BY year, paper ORDER BY year, paper;`);
        console.log(`  -- count by type`);
        console.log(`  SELECT question_type, COUNT(*) FROM pyq_questions WHERE source_repo='jeebench' GROUP BY question_type;`);
    }
}

main().catch((err) => {
    console.error("Fatal:", err);
    process.exit(1);
});
