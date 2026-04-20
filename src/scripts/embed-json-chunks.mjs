/**
 * Generic JSON-chunk embed + insert script
 * ==========================================
 * Reads a pre-chunked JSON array (from any book),
 * generates 768-dim embeddings via gemini-embedding-001,
 * and upserts rows into ncert_content.
 *
 * Field mapping from source JSON → DB:
 *   chapter_number       → chapter_number
 *   chapter_name         → chapter_name
 *   section_name         → section_name  (empty string → null)
 *   content_text         → content_text
 *   chunk_index_assigned → chunk_index
 *   (computed)           → word_count    (split on whitespace)
 *   (CLI arg)            → class_level
 *   (CLI arg)            → source_book
 *   part                 → "1" (constant — override with --part=N)
 *
 * Usage:
 *   node src/scripts/embed-json-chunks.mjs <file.json> \
 *     --source-book=dc_pandey --class-level=11 \
 *     [--dry-run] [--batch=10] [--delay=250] [--part=1]
 *
 * Safety:
 *   - Checks existing rows for this source_book at startup.
 *   - Uses upsert with ignoreDuplicates on (source_book, chapter_name, chunk_index).
 *   - Safe to re-run if interrupted.
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync, createReadStream } from "node:fs";
import { createInterface } from "node:readline";
import { resolve } from "node:path";

// ── Load .env.local ────────────────────────────────────────────────────────────
try {
    const { config } = await import("dotenv");
    config({ path: ".env.local" });
} catch {
    // dotenv not installed — rely on process env
}

// ── Parse CLI args ─────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const jsonPath    = args.find((a) => !a.startsWith("--"));
const isDryRun    = args.includes("--dry-run");
const batchArg    = args.find((a) => a.startsWith("--batch="));
const delayArg    = args.find((a) => a.startsWith("--delay="));
const bookArg     = args.find((a) => a.startsWith("--source-book="));
const levelArg    = args.find((a) => a.startsWith("--class-level="));
const partArg     = args.find((a) => a.startsWith("--part="));

const BATCH_SIZE  = batchArg  ? parseInt(batchArg.split("=")[1])  : 10;
const DELAY_MS    = delayArg  ? parseInt(delayArg.split("=")[1])  : 250;
const SOURCE_BOOK = bookArg   ? bookArg.split("=")[1]             : null;
const CLASS_LEVEL = levelArg  ? levelArg.split("=")[1]            : null;
const PART        = partArg   ? partArg.split("=")[1]             : "1";

if (!jsonPath || !SOURCE_BOOK || !CLASS_LEVEL) {
    console.error(
        "Usage: node embed-json-chunks.mjs <file.json> " +
        "--source-book=<book> --class-level=<level> " +
        "[--dry-run] [--batch=10] [--delay=250] [--part=1]"
    );
    process.exit(1);
}

const fullPath = resolve(jsonPath);
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

// ── Load existing (chapter_name, chunk_index) pairs to skip re-embedding ──────
const existingKeys = new Set(); // "chapter_name::chunk_index"

if (!isDryRun) {
    console.log("Checking existing rows in DB...");
    let page = 0;
    const PAGE = 1000;
    while (true) {
        const { data, error } = await supabase
            .from("ncert_content")
            .select("chapter_name, chunk_index")
            .eq("source_book", SOURCE_BOOK)
            .range(page * PAGE, (page + 1) * PAGE - 1);

        if (error) {
            console.error("Could not fetch existing rows:", error.message);
            process.exit(1);
        }

        for (const row of data) {
            existingKeys.add(`${row.chapter_name}::${row.chunk_index}`);
        }

        if (data.length < PAGE) break;
        page++;
    }

    if (existingKeys.size > 0) {
        console.log(`Found ${existingKeys.size} existing rows — will skip re-embedding those.`);
    }
}

// ── Embedding ──────────────────────────────────────────────────────────────────
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

    const { error } = await supabase.from("ncert_content").upsert(rows, {
        onConflict: "source_book,chapter_name,chunk_index",
        ignoreDuplicates: true,
    });

    if (error) {
        console.error(`\n  Upsert error: ${error.message}`);
        throw error;
    }
}

// ── Sleep ──────────────────────────────────────────────────────────────────────
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ── Word count helper ──────────────────────────────────────────────────────────
function wordCount(text) {
    return text.trim().split(/\s+/).filter(Boolean).length;
}

// ── Main ───────────────────────────────────────────────────────────────────────
async function main() {
    console.log(`\n${SOURCE_BOOK} — embed + insert`);
    console.log(`  Input:       ${fullPath}`);
    console.log(`  source_book: ${SOURCE_BOOK}`);
    console.log(`  class_level: ${CLASS_LEVEL}`);
    console.log(`  part:        ${PART}`);
    console.log(`  Batch size:  ${BATCH_SIZE}`);
    console.log(`  Delay:       ${DELAY_MS}ms`);
    console.log(`  Mode:        ${isDryRun ? "DRY RUN (no DB writes)" : "LIVE"}`);
    console.log();

    // Parse input — supports both .json (array) and .jsonl (one object per line)
    const isJsonl = fullPath.toLowerCase().endsWith(".jsonl");
    let chunks;
    if (isJsonl) {
        chunks = [];
        const rl = createInterface({ input: createReadStream(fullPath) });
        for await (const line of rl) {
            const t = line.trim();
            if (!t) continue;
            try {
                chunks.push(JSON.parse(t));
            } catch (err) {
                console.warn(`  Skipping invalid JSONL line: ${t.slice(0, 60)}`);
            }
        }
    } else {
        try {
            const raw = readFileSync(fullPath, "utf8");
            chunks = JSON.parse(raw);
            if (!Array.isArray(chunks)) throw new Error("Expected a JSON array at root level");
        } catch (err) {
            console.error("Failed to parse JSON:", err.message);
            process.exit(1);
        }
    }

    console.log(`Total chunks in file: ${chunks.length} (format: ${isJsonl ? "JSONL" : "JSON array"})`);

    // Inspect first chunk to report actual fields
    if (chunks.length > 0) {
        console.log(`Fields in source: ${Object.keys(chunks[0]).join(", ")}`);
        const missing = [];
        for (const f of ["chapter_number", "chapter_name", "content_text"]) {
            if (!(f in chunks[0])) missing.push(f);
        }
        // Accept either chunk_index or chunk_index_assigned
        if (!("chunk_index" in chunks[0]) && !("chunk_index_assigned" in chunks[0])) {
            missing.push("chunk_index (or chunk_index_assigned)");
        }
        if (missing.length > 0) {
            console.error(`\nERROR: Expected fields missing: ${missing.join(", ")}`);
            process.exit(1);
        }
    }

    // Per-chapter summary for dry-run verification
    const chapterSummary = new Map(); // chapter_name → { chunks, words }

    let processed = 0;
    let skipped   = 0;
    let errors    = 0;
    let batch     = [];

    for (const chunk of chunks) {
        const content = (chunk.content_text ?? "").trim();

        if (content.length < 50) {
            skipped++;
            continue;
        }

        // Skip chunks already in the DB (avoids re-embedding on re-runs)
        const chunkIdx = chunk.chunk_index ?? chunk.chunk_index_assigned ?? null;
        const chunkKey = `${chunk.chapter_name}::${chunkIdx}`;
        if (existingKeys.has(chunkKey)) {
            skipped++;
            continue;
        }

        // Generate embedding
        let embedding;
        try {
            embedding = await embed(content);
        } catch (err) {
            console.error(`  Embed error (chunk ${processed + errors}): ${err.message}`);
            errors++;
            await sleep(1500);
            continue;
        }

        const wc = wordCount(content);
        const chName = chunk.chapter_name ?? "Unknown";

        if (!chapterSummary.has(chName)) {
            chapterSummary.set(chName, { chunks: 0, words: 0 });
        }
        const cs = chapterSummary.get(chName);
        cs.chunks++;
        cs.words += wc;

        batch.push({
            content_text:   content,
            class_level:    CLASS_LEVEL,
            part:           PART,
            chapter_number: chunk.chapter_number ?? null,
            chapter_name:   chName,
            section_name:   chunk.section_name?.trim() || null,
            word_count:     wc,
            chunk_index:    chunk.chunk_index ?? chunk.chunk_index_assigned ?? null,
            source_book:    SOURCE_BOOK,
            embedding,
        });

        processed++;

        if (batch.length >= BATCH_SIZE) {
            try {
                await insertBatch(batch);
                process.stdout.write(
                    `\r  Inserted: ${processed} / ${chunks.length} chunks (${errors} errors)`
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
            process.stdout.write(
                `\r  Inserted: ${processed} / ${chunks.length} chunks (${errors} errors)`
            );
        } catch {
            errors += batch.length;
        }
    }

    console.log(`\n\nDone.`);
    console.log(`  Embedded:  ${processed}`);
    console.log(`  Skipped:   ${skipped}  (too short < 50 chars)`);
    console.log(`  Errors:    ${errors}`);

    // Verification table
    console.log(`\nChapter verification table:`);
    console.log(`${"chapter_name".padEnd(55)} | chunks | words`);
    console.log(`${"-".repeat(55)}-+--------+-------`);
    for (const [name, { chunks: c, words: w }] of [...chapterSummary.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
        console.log(`${name.padEnd(55)} | ${String(c).padStart(6)} | ${w}`);
    }
    console.log(`\nTotal: ${processed} chunks across ${chapterSummary.size} chapters`);
}

main().catch((err) => {
    console.error("Fatal:", err);
    process.exit(1);
});
