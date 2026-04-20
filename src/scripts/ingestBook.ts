/**
 * Book Ingestion Script
 * =====================
 * Reads a JSON or JSONL file of book chunks, generates 768-dim embeddings via
 * gemini-embedding-001, and inserts them into the book_content table in Supabase.
 *
 * Prerequisites:
 *   - GOOGLE_GENERATIVE_AI_API_KEY in environment (or .env.local)
 *   - NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY in environment (or .env.local)
 *
 * Usage:
 *   npx tsx src/scripts/ingestBook.ts --source hc_verma --file ./chunks.json --class 11
 *   npx tsx src/scripts/ingestBook.ts --source dc_pandey --file ./chunks.jsonl --class 12
 *
 * Options:
 *   --source   hc_verma | dc_pandey (required)
 *   --file     Path to JSON array or JSONL chunks file (required)
 *   --class    11 | 12 (required)
 *   --dry-run  Embed but do not write to Supabase
 *   --delay    Ms between embedding API calls (default: 200)
 *
 * Input chunk schema (each chunk must have):
 *   chapter_number: number
 *   chapter_name:   string
 *   section_name:   string
 *   content_text:   string
 *   page_number:    number
 *
 * chunk_index is assigned automatically as the 0-based position of each chunk
 * within the (source_book, chapter_number) group.
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";
import { createInterface } from "readline";
import { createReadStream } from "fs";

// ── Load .env.local ────────────────────────────────────────────────────────────
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { config } = require("dotenv");
  config({ path: ".env.local" });
} catch {
  // dotenv not installed — rely on pre-set environment variables
}

// ── Arg parsing ───────────────────────────────────────────────────────────────
function getArg(name: string): string | undefined {
  const idx = process.argv.indexOf(`--${name}`);
  return idx !== -1 ? process.argv[idx + 1] : undefined;
}

const sourceBook = getArg("source");
const filePath   = getArg("file");
const classStr   = getArg("class");
const isDryRun   = process.argv.includes("--dry-run");
const delayArg   = getArg("delay");
const DELAY_MS   = delayArg ? parseInt(delayArg, 10) : 200;
const BATCH_SIZE = 50;

if (!sourceBook || !filePath || !classStr) {
  console.error("Usage: npx tsx src/scripts/ingestBook.ts --source hc_verma --file ./chunks.json --class 11");
  console.error("  --source   hc_verma | dc_pandey");
  console.error("  --file     path to JSON array or JSONL file");
  console.error("  --class    11 | 12");
  process.exit(1);
}

if (!["hc_verma", "dc_pandey"].includes(sourceBook)) {
  console.error(`--source must be hc_verma or dc_pandey, got: ${sourceBook}`);
  process.exit(1);
}

const classLevel = classStr; // kept as string — book_content.class_level is type text
if (classLevel !== "11" && classLevel !== "12") {
  console.error(`--class must be 11 or 12, got: ${classStr}`);
  process.exit(1);
}

const absFilePath = resolve(process.cwd(), filePath);
if (!existsSync(absFilePath)) {
  console.error(`File not found: ${absFilePath}`);
  process.exit(1);
}

// ── Env checks ────────────────────────────────────────────────────────────────
const GOOGLE_API_KEY = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
if (!GOOGLE_API_KEY) {
  console.error("Missing GOOGLE_GENERATIVE_AI_API_KEY environment variable");
  process.exit(1);
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!isDryRun && (!SUPABASE_URL || !SUPABASE_KEY)) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = isDryRun ? null : createClient(SUPABASE_URL!, SUPABASE_KEY!);

// ── Types ─────────────────────────────────────────────────────────────────────
interface InputChunk {
  chapter_number: number;
  chapter_name:   string;
  section_name:   string;
  content_text:   string;
  page_number:    number;
}

interface BookRow {
  source_book:    string;
  class_level:    string;
  chapter_number: number;
  chapter_name:   string;
  section_name:   string | null;
  content_text:   string;
  page_number:    number | null;
  chunk_index:    number;
  embedding:      number[];
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

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
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Embedding API ${res.status}: ${body}`);
  }
  const data = await res.json();
  return data.embedding.values as number[];
}

// ON CONFLICT DO NOTHING via upsert with ignoreDuplicates: true
async function upsertBatch(rows: BookRow[]): Promise<void> {
  if (isDryRun) {
    console.log(`[DRY RUN] Would upsert ${rows.length} row(s):`);
    rows.slice(0, 2).forEach((r) => {
      console.log(
        `  ch${r.chapter_number} idx=${r.chunk_index} "${r.chapter_name}" | ${r.content_text.length} chars`
      );
    });
    return;
  }

  const { error } = await supabase!.from("book_content").upsert(rows, {
    onConflict: "source_book,chapter_number,chunk_index",
    ignoreDuplicates: true,
  });

  if (error) {
    throw new Error(`Supabase upsert error: ${error.message}`);
  }
}

// ── Load input file ───────────────────────────────────────────────────────────
async function loadChunks(): Promise<InputChunk[]> {
  const raw = readFileSync(absFilePath, "utf-8").trim();

  // Try JSON array first
  if (raw.startsWith("[")) {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) throw new Error("JSON file is not an array");
    return parsed as InputChunk[];
  }

  // Fall back to JSONL (one JSON object per line)
  const chunks: InputChunk[] = [];
  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    chunks.push(JSON.parse(trimmed) as InputChunk);
  }
  return chunks;
}

function validateChunk(chunk: InputChunk, idx: number): string | null {
  if (typeof chunk.chapter_number !== "number") return `chunk[${idx}]: chapter_number must be a number`;
  if (!chunk.chapter_name?.trim())               return `chunk[${idx}]: chapter_name is required`;
  if (!chunk.content_text?.trim())               return `chunk[${idx}]: content_text is required`;
  return null;
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log(`\nBook Ingestion`);
  console.log(`  Source:     ${sourceBook}`);
  console.log(`  Class:      ${classLevel}`);
  console.log(`  File:       ${absFilePath}`);
  console.log(`  Batch size: ${BATCH_SIZE}`);
  console.log(`  Delay:      ${DELAY_MS}ms`);
  console.log(`  Mode:       ${isDryRun ? "DRY RUN (no DB writes)" : "LIVE"}\n`);

  // Load + validate all chunks up front
  let rawChunks: InputChunk[];
  try {
    rawChunks = await loadChunks();
  } catch (err: any) {
    console.error("Failed to parse input file:", err.message);
    process.exit(1);
  }

  console.log(`Total chunks in file: ${rawChunks.length}`);

  // Validate and filter
  const validChunks: Array<InputChunk & { globalIdx: number }> = [];
  for (let i = 0; i < rawChunks.length; i++) {
    const err = validateChunk(rawChunks[i], i);
    if (err) {
      console.warn(`  SKIP: ${err}`);
      continue;
    }
    if (rawChunks[i].content_text.trim().length < 30) {
      console.warn(`  SKIP chunk[${i}]: content_text too short (<30 chars)`);
      continue;
    }
    validChunks.push({ ...rawChunks[i], globalIdx: i });
  }

  console.log(`Valid chunks to process: ${validChunks.length}\n`);

  // Assign chunk_index per (chapter_number) group
  const chapterCounters = new Map<number, number>();
  const indexedChunks = validChunks.map((c) => {
    const counter = chapterCounters.get(c.chapter_number) ?? 0;
    chapterCounters.set(c.chapter_number, counter + 1);
    return { chunk: c, chunk_index: counter };
  });

  let processed  = 0;
  let errorCount = 0;
  let batch: BookRow[] = [];

  for (const { chunk, chunk_index } of indexedChunks) {
    // Generate embedding
    let embedding: number[];
    try {
      embedding = await embed(chunk.content_text);
    } catch (err: any) {
      console.error(`\n  Embed error (chunk ${processed + errorCount}):`, err.message);
      errorCount++;
      await sleep(1000);
      continue;
    }

    batch.push({
      source_book:    sourceBook!,
      class_level:    classLevel!,
      chapter_number: chunk.chapter_number,
      chapter_name:   chunk.chapter_name.trim(),
      section_name:   chunk.section_name?.trim() || null,
      content_text:   chunk.content_text.trim(),
      page_number:    typeof chunk.page_number === "number" ? chunk.page_number : null,
      chunk_index,
      embedding,
    });

    processed++;

    if (batch.length >= BATCH_SIZE) {
      try {
        await upsertBatch(batch);
        console.log(`  Progress: ${processed} / ${validChunks.length} embedded and inserted (${errorCount} errors)`);
      } catch (err: any) {
        console.error(`\n  Upsert error:`, err.message);
        errorCount += batch.length;
        processed  -= batch.length;
      }
      batch = [];
    }

    await sleep(DELAY_MS);
  }

  // Flush remaining
  if (batch.length > 0) {
    try {
      await upsertBatch(batch);
      console.log(`  Progress: ${processed} / ${validChunks.length} embedded and inserted (${errorCount} errors)`);
    } catch (err: any) {
      console.error(`\n  Final upsert error:`, err.message);
      errorCount += batch.length;
    }
  }

  console.log(`\nDone.`);
  console.log(`  Processed: ${processed}`);
  console.log(`  Skipped:   ${rawChunks.length - validChunks.length}`);
  console.log(`  Errors:    ${errorCount}`);
  if (!isDryRun) {
    console.log(
      `\n  Verify: SELECT count(*) FROM book_content WHERE source_book = '${sourceBook}';`
    );
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
