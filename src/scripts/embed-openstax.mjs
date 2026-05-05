/**
 * OpenStax College Physics — embed + insert script
 * ===================================================
 * Reads openstax_cp_chunks.jsonl (from ingest-openstax.mjs),
 * generates 768-dim embeddings via gemini-embedding-001, and INSERTs rows
 * into ncert_content with source_book = 'openstax_cp'.
 *
 * Mirrors embed-dc-pandey.mjs almost exactly. Differences: source_book is
 * 'openstax_cp', existing-row check looks for 'openstax_cp', default delay
 * is 600ms (Gemini free-tier 100 RPM cap; embed-dc-pandey used 250ms because
 * paid keys were assumed).
 *
 * Prerequisites:
 *   - GOOGLE_GENERATIVE_AI_API_KEY in environment (or .env.local)
 *   - SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY in environment (or .env.local)
 *
 * Usage:
 *   node src/scripts/embed-openstax.mjs openstax_cp_chunks.jsonl
 *   node src/scripts/embed-openstax.mjs openstax_cp_chunks.jsonl --dry-run
 *   node src/scripts/embed-openstax.mjs openstax_cp_chunks.jsonl --batch=10 --delay=600
 *
 * Options:
 *   --dry-run     Embed but skip Supabase inserts (prints first 3 rows)
 *   --batch=N     Insert batch size (default: 10)
 *   --delay=N     Ms between embedding requests (default: 600)
 *
 * Safety:
 *   Checks for existing openstax_cp rows before inserting.
 *   Unique constraint (source_book, chapter_name, chunk_index) protects
 *   against duplicates on a re-run; safe to re-run if interrupted.
 */

import { createClient } from "@supabase/supabase-js";
import { createReadStream } from "node:fs";
import { createInterface } from "node:readline";
import { resolve } from "node:path";
import { existsSync } from "node:fs";

// ── Load .env.local ───────────────────────────────────────────────────────────
try {
    const { config } = await import("dotenv");
    config({ path: ".env.local" });
} catch {
    // dotenv not installed — rely on process env
}

// ── Args ──────────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const jsonlPath = args.find((a) => !a.startsWith("--"));
const isDryRun  = args.includes("--dry-run");
const batchArg  = args.find((a) => a.startsWith("--batch="));
const delayArg  = args.find((a) => a.startsWith("--delay="));
const BATCH_SIZE = batchArg ? parseInt(batchArg.split("=")[1]) : 10;
const DELAY_MS   = delayArg ? parseInt(delayArg.split("=")[1]) : 600;

if (!jsonlPath) {
    console.error("Usage: node embed-openstax.mjs <chunks.jsonl> [--dry-run] [--batch=10] [--delay=600]");
    process.exit(1);
}

const fullPath = resolve(jsonlPath);
if (!existsSync(fullPath)) {
    console.error(`File not found: ${fullPath}`);
    process.exit(1);
}

// ── Clients ────────────────────────────────────────────────────────────────────
const GOOGLE_API_KEY = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
if (!GOOGLE_API_KEY) {
    console.error("Missing GOOGLE_GENERATIVE_AI_API_KEY");
    process.exit(1);
}

const SUPABASE_URL = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!isDryRun && (!SUPABASE_URL || !SUPABASE_KEY)) {
    console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
}

const supabase = isDryRun ? null : createClient(SUPABASE_URL, SUPABASE_KEY);

// ── Safety check: warn if openstax_cp rows already exist ──────────────────────
if (!isDryRun) {
    const { count, error } = await supabase
        .from("ncert_content")
        .select("*", { count: "exact", head: true })
        .eq("source_book", "openstax_cp");

    if (error) {
        console.error("Could not check existing openstax_cp rows:", error.message);
        process.exit(1);
    }

    if (count > 0) {
        console.warn(`\nWARNING: ${count} openstax_cp rows already exist in ncert_content.`);
        console.warn("Re-running will INSERT new rows (unique constraint may dedupe; check status after).");
        console.warn("To start fresh: DELETE FROM ncert_content WHERE source_book = 'openstax_cp';");
        console.warn("Continuing in 5 seconds... (Ctrl+C to abort)\n");
        await new Promise((r) => setTimeout(r, 5000));
    }
}

// ── Embedding ─────────────────────────────────────────────────────────────────
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

// ── Insert batch ───────────────────────────────────────────────────────────────
async function insertBatch(rows) {
    if (isDryRun) {
        console.log("[DRY RUN] Would insert", rows.length, "row(s):");
        rows.slice(0, 3).forEach((r) => {
            console.log(
                `  ch${r.chapter_number} "${r.chapter_name}" | idx=${r.chunk_index} | ${r.word_count}w | section="${r.section_name ?? "—"}"`
            );
        });
        return;
    }

    // Plain insert — unique constraint (source_book, chapter_name, chunk_index)
    // prevents duplicates on re-run. DELETE openstax_cp rows first if re-ingesting.
    const { error } = await supabase.from("ncert_content").insert(rows);

    if (error) {
        console.error(`\n  Insert error: ${error.message}`);
        throw error;
    }
}

// ── Sleep ─────────────────────────────────────────────────────────────────────
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
    console.log("\nOpenStax College Physics — embed + insert");
    console.log(`  Input:      ${fullPath}`);
    console.log(`  Batch size: ${BATCH_SIZE}`);
    console.log(`  Delay:      ${DELAY_MS}ms`);
    console.log(`  Mode:       ${isDryRun ? "DRY RUN (no DB writes)" : "LIVE"}`);
    console.log();

    // Read all lines first to show total
    const lines = [];
    const rl = createInterface({ input: createReadStream(fullPath) });
    for await (const line of rl) {
        const t = line.trim();
        if (t) lines.push(t);
    }
    console.log(`Total chunks to embed: ${lines.length}`);

    let processed = 0;
    let skipped   = 0;
    let errors    = 0;
    let batch     = [];

    for (const line of lines) {
        let chunk;
        try {
            chunk = JSON.parse(line);
        } catch {
            console.warn(`  Skipping invalid JSON: ${line.slice(0, 60)}`);
            errors++;
            continue;
        }

        if (!chunk.content_text || chunk.content_text.trim().length < 50) {
            skipped++;
            continue;
        }

        // Generate embedding (with one retry on 429 / transient failures)
        let embedding;
        let attempt = 0;
        while (attempt < 2) {
            try {
                embedding = await embed(chunk.content_text);
                break;
            } catch (err) {
                attempt++;
                if (attempt >= 2) {
                    console.error(`  Embed error (chunk ${processed + errors}): ${err.message}`);
                    errors++;
                    embedding = null;
                    await sleep(2000);
                } else {
                    await sleep(2000);
                }
            }
        }
        if (!embedding) continue;

        batch.push({
            content_text:   chunk.content_text,
            class_level:    chunk.class_level,      // "11"
            part:           chunk.part,             // "1"
            chapter_number: chunk.chapter_number,
            chapter_name:   chunk.chapter_name,
            section_name:   chunk.section_name ?? null,
            word_count:     chunk.word_count,
            chunk_index:    chunk.chunk_index,
            source_book:    "openstax_cp",
            embedding,
        });

        processed++;

        if (batch.length >= BATCH_SIZE) {
            try {
                await insertBatch(batch);
                process.stdout.write(
                    `\r  Inserted: ${processed} / ${lines.length} chunks (${errors} errors)`
                );
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
    console.log(`  Skipped:   ${skipped}  (too short)`);
    console.log(`  Errors:    ${errors}`);

    if (!isDryRun) {
        console.log(`\nVerification query:`);
        console.log(`  SELECT source_book, chapter_name, COUNT(*) AS chunks, SUM(word_count) AS total_words`);
        console.log(`  FROM ncert_content`);
        console.log(`  WHERE source_book = 'openstax_cp'`);
        console.log(`  GROUP BY source_book, chapter_name`);
        console.log(`  ORDER BY MIN(chapter_number), chapter_name;`);
    }
}

main().catch((err) => {
    console.error("Fatal:", err);
    process.exit(1);
});
