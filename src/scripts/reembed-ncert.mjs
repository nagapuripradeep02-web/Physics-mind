/**
 * NCERT Re-embedding Script
 * ==========================
 * Reads the clean JSONL from reextract-ncert.py, generates 768-dim embeddings
 * via gemini-embedding-001, and upserts rows into ncert_content in Supabase.
 *
 * Prerequisites:
 *   - GOOGLE_GENERATIVE_AI_API_KEY in environment (or .env.local)
 *   - SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY in environment (or .env.local)
 *
 * Usage:
 *   node src/scripts/reembed-ncert.mjs ncert_chunks.jsonl [--dry-run]
 *
 * Options:
 *   --dry-run    Embed but do not write to Supabase (prints first 3 rows)
 *   --batch N    Upsert batch size (default: 20)
 *   --delay N    Ms to wait between embedding requests (default: 200)
 */

import { createClient } from "@supabase/supabase-js";
import { createReadStream } from "node:fs";
import { createInterface } from "node:readline";
import { resolve } from "node:path";
import { existsSync } from "node:fs";

// ── Load env from .env.local if dotenv not available ──────────────────────────
try {
    const { config } = await import("dotenv");
    config({ path: ".env.local" });
} catch {
    // dotenv not installed — rely on environment variables
}

// ── Args ─────────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const jsonlPath = args.find((a) => !a.startsWith("--"));
const isDryRun = args.includes("--dry-run");
const batchArg = args.find((a) => a.startsWith("--batch="));
const delayArg = args.find((a) => a.startsWith("--delay="));
const BATCH_SIZE = batchArg ? parseInt(batchArg.split("=")[1]) : 20;
const DELAY_MS = delayArg ? parseInt(delayArg.split("=")[1]) : 200;

if (!jsonlPath) {
    console.error("Usage: node reembed-ncert.mjs <chunks.jsonl> [--dry-run] [--batch=20] [--delay=200]");
    process.exit(1);
}

const fullPath = resolve(jsonlPath);
if (!existsSync(fullPath)) {
    console.error(`File not found: ${fullPath}`);
    process.exit(1);
}

// ── Clients ───────────────────────────────────────────────────────────────────
const GOOGLE_API_KEY = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
if (!GOOGLE_API_KEY) {
    console.error("Missing GOOGLE_GENERATIVE_AI_API_KEY environment variable");
    process.exit(1);
}

const SUPABASE_URL = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!isDryRun && (!SUPABASE_URL || !SUPABASE_KEY)) {
    console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
}

const supabase = isDryRun
    ? null
    : createClient(SUPABASE_URL, SUPABASE_KEY);

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

// ── Upsert batch ──────────────────────────────────────────────────────────────
async function upsertBatch(rows) {
    if (isDryRun) {
        console.log("[DRY RUN] Would upsert", rows.length, "row(s):");
        rows.slice(0, 2).forEach((r) => {
            console.log(
                `  chapter="${r.chapter_name}" | class=${r.class_level} | chars=${r.content_text.length}`
            );
        });
        return;
    }

    const { error } = await supabase.from("ncert_content").upsert(rows, {
        onConflict: "id",
        ignoreDuplicates: false,
    });

    if (error) {
        throw new Error(`Supabase upsert error: ${error.message}`);
    }
}

// ── Sleep helper ──────────────────────────────────────────────────────────────
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {
    console.log(`\nNCERT Re-embedding`);
    console.log(`  Input:      ${fullPath}`);
    console.log(`  Batch size: ${BATCH_SIZE}`);
    console.log(`  Delay:      ${DELAY_MS}ms`);
    console.log(`  Mode:       ${isDryRun ? "DRY RUN (no DB writes)" : "LIVE"}`);
    console.log();

    // Read all lines first (to show total count)
    const lines = [];
    const rl = createInterface({ input: createReadStream(fullPath) });
    for await (const line of rl) {
        const trimmed = line.trim();
        if (trimmed) lines.push(trimmed);
    }

    console.log(`Total chunks to embed: ${lines.length}`);
    if (isDryRun) console.log("(DRY RUN — will embed but skip Supabase writes)\n");

    let processed = 0;
    let errors = 0;
    let batch = [];

    for (const line of lines) {
        let chunk;
        try {
            chunk = JSON.parse(line);
        } catch {
            console.warn(`  Skipping invalid JSON line: ${line.slice(0, 60)}`);
            errors++;
            continue;
        }

        if (!chunk.content_text || chunk.content_text.trim().length < 50) {
            continue; // skip tiny fragments
        }

        // Generate embedding
        let embedding;
        try {
            embedding = await embed(chunk.content_text);
        } catch (err) {
            console.error(`  Embed error (chunk ${processed}):`, err.message);
            errors++;
            await sleep(1000); // back off on error
            continue;
        }

        batch.push({
            content_text: chunk.content_text,
            class_level: chunk.class_level,
            chapter_name: chunk.chapter_name,
            section_name: chunk.section_name ?? null,
            embedding,
        });

        processed++;

        // Flush batch
        if (batch.length >= BATCH_SIZE) {
            try {
                await upsertBatch(batch);
                process.stdout.write(
                    `\r  Upserted: ${processed} / ${lines.length} (${errors} errors)`
                );
            } catch (err) {
                console.error(`\n  Upsert error:`, err.message);
                errors += batch.length;
            }
            batch = [];
        }

        await sleep(DELAY_MS);
    }

    // Flush remaining
    if (batch.length > 0) {
        try {
            await upsertBatch(batch);
        } catch (err) {
            console.error(`\n  Final upsert error:`, err.message);
            errors += batch.length;
        }
    }

    console.log(`\n\nDone.`);
    console.log(`  Embedded: ${processed}`);
    console.log(`  Errors:   ${errors}`);
    if (!isDryRun) {
        console.log(`  Check Supabase: SELECT count(*) FROM ncert_content;`);
    }
}

main().catch((err) => {
    console.error("Fatal error:", err);
    process.exit(1);
});
