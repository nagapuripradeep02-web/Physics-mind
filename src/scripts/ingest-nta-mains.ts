/**
 * JEE Mains physics-only ingest into pyq_questions
 * ============================================================================
 * Reads JEE Mains question paper PDFs from a directory, loads pre-extracted
 * physics questions from per-paper cache JSONs (.cache/nta-pdf/<label>.json),
 * generates 768-dim embeddings via gemini-embedding-001, and INSERTs rows
 * into pyq_questions.
 *
 * Two source formats are supported via --source-format:
 *   nta-direct      — pristine official NTA PDFs (image-based, no embedded
 *                     solutions). source_repo='nta_official'.
 *                     Filename: B-Tech-{D}{nd|rd|th}-Apr-2026-Shift-{N}.pdf
 *   allen-reformat  — coaching-institute typed reformats from selfstudys.com
 *                     (text-extractable, "Ans." + "Sol." blocks interleaved).
 *                     source_repo='selfstudys_allen'.
 *                     Filename: jee-mains-{YYYY}-{DD}-{mmm}-shift-{N}.pdf
 *
 * Cache-only design (session 48): this script does NOT call the Anthropic API.
 * Cache misses throw an error pointing to the sub-agent fan-out workflow.
 * Spawn one Claude Code Agent per uncached paper; the agent reads the PDF via
 * the Read tool and writes the JSON cache, then re-run this script to embed
 * + insert. See extractPhysicsFromPdf() for the sub-agent brief template.
 *
 * Per-PDF caching: physics-mind/.cache/nta-pdf/<paper-label>.json. Schema is
 * { physics_questions: PhysicsQuestion[] }. Delete a cache file to force
 * re-extraction by the next sub-agent run.
 *
 * Prerequisites:
 *   1. PDF files placed in --dir (default: C:\Tutor\nta-source\jee-mains-2026-april\)
 *   2. Per-paper cache JSONs populated under physics-mind/.cache/nta-pdf/
 *   3. .env.local has GOOGLE_GENERATIVE_AI_API_KEY + SUPABASE_SERVICE_ROLE_KEY +
 *      NEXT_PUBLIC_SUPABASE_URL.
 *
 * Usage:
 *   npx tsx src/scripts/ingest-nta-mains.ts                                       # full ingest (nta-direct default)
 *   npx tsx src/scripts/ingest-nta-mains.ts --dry-run                             # extract + log, no DB writes
 *   npx tsx src/scripts/ingest-nta-mains.ts --limit-papers 1                      # smoke test
 *   npx tsx src/scripts/ingest-nta-mains.ts --paper "B-Tech-4th-Apr-2026-Shift-1.pdf"
 *   npx tsx src/scripts/ingest-nta-mains.ts --dir C:/Tutor/nta-source/jee-mains-2024 --source-format allen-reformat
 *
 * Safety:
 *   UNIQUE (source_repo, external_id) protects against re-run duplicates.
 *   external_id format: <source_repo>_jee_mains_<YYYY>_<mmm><DD>_S<shift>_Q<question_number>
 */

// Load .env.local FIRST — repo's .env.local has mixed CRLF/LF line endings;
// dotenv with override:true is the robust pattern (see tag-pyq-topics.ts +
// ingest-reja1.ts).
// eslint-disable-next-line @typescript-eslint/no-require-imports
require("dotenv").config({ path: ".env.local", override: true });

import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync, mkdirSync, readdirSync } from "node:fs";
import { resolve, join } from "node:path";
import { z } from "zod";

// ── Args ──────────────────────────────────────────────────────────────────────
function getArg(name: string, fallback: string): string {
    const idx = process.argv.indexOf(`--${name}`);
    if (idx === -1) return fallback;
    const next = process.argv[idx + 1];
    return next && !next.startsWith("--") ? next : fallback;
}

const PDFS_DIR       = resolve(getArg("dir", "C:/Tutor/nta-source/jee-mains-2026-april"));
const CACHE_DIR      = resolve(".cache/nta-pdf");
const IS_DRY_RUN     = process.argv.includes("--dry-run");
const LIMIT_PAPERS   = parseInt(getArg("limit-papers", "0"), 10) || 0;
const SINGLE_PAPER   = getArg("paper", "");
const SOURCE_FORMAT  = getArg("source-format", "nta-direct") as "nta-direct" | "allen-reformat";
const delayArg       = process.argv.find((a) => a.startsWith("--delay="));
const DELAY_MS       = delayArg ? parseInt(delayArg.split("=")[1]) : 800;

// ── Source profile ────────────────────────────────────────────────────────────
// Two PDF source formats are supported. NTA-direct is the pristine official PDF
// from jeemain.nta.nic.in (image-based, no embedded solutions). Allen-reformat
// is the coaching-institute-typed version distributed by aggregators like
// selfstudys.com (typed text, "Ans. (X)" + "Sol. ..." blocks interleaved).
interface SourceProfile {
    repo:    string;
    url:     string;
    license: string;
}
const SOURCE_PROFILES: Record<string, SourceProfile> = {
    "nta-direct": {
        repo:    "nta_official",
        url:     "https://jeemain.nta.nic.in/document-category/archive/",
        license: "NTA-public",
    },
    "allen-reformat": {
        repo:    "selfstudys_allen",
        url:     "https://www.selfstudys.com/books/jee-previous-year-paper",
        license: "fair-use-academic",
    },
};
if (!(SOURCE_FORMAT in SOURCE_PROFILES)) {
    console.error(`Invalid --source-format: ${SOURCE_FORMAT}. Expected: nta-direct | allen-reformat`);
    process.exit(1);
}
const PROFILE      = SOURCE_PROFILES[SOURCE_FORMAT];
const SOURCE_REPO  = PROFILE.repo;
const SOURCE_URL   = PROFILE.url;
const LICENSE      = PROFILE.license;

// ── Env checks ────────────────────────────────────────────────────────────────
// ANTHROPIC_API_KEY is no longer required by this script (extraction happens via
// sub-agent fan-out — see extractPhysicsFromPdf). Only Gemini for embeddings
// and Supabase for inserts are needed at runtime.
const GOOGLE_API_KEY = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
const SUPABASE_URL   = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY   = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!GOOGLE_API_KEY) { console.error("Missing GOOGLE_GENERATIVE_AI_API_KEY"); process.exit(1); }
if (!IS_DRY_RUN && (!SUPABASE_URL || !SUPABASE_KEY)) {
    console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
}

const supabase  = IS_DRY_RUN ? null : createClient(SUPABASE_URL!, SUPABASE_KEY!);

// ── Filename → paper metadata ─────────────────────────────────────────────────
interface PaperMeta {
    file: string;
    label: string;     // canonical label for cache + external_id
    date: string;      // e.g., "2026-04-04"
    year: number;      // e.g., 2026
    shift: 1 | 2;
    dateSlug: string;  // e.g., "apr04"
}

const MONTH_TO_NUM: Record<string, string> = {
    jan: "01", feb: "02", mar: "03", apr: "04", may: "05", jun: "06",
    jul: "07", aug: "08", sep: "09", oct: "10", nov: "11", dec: "12",
};

function parseFileName(file: string): PaperMeta | null {
    // Format 1 (legacy NTA-direct): B-Tech-{D}{st|nd|rd|th}-Apr-2026-Shift-{1|2}.pdf
    const ntaMatch = file.match(/^B-Tech-(\d+)(?:st|nd|rd|th)-Apr-2026-Shift-([12])\.pdf$/);
    if (ntaMatch) {
        const day = parseInt(ntaMatch[1], 10);
        const shift = parseInt(ntaMatch[2], 10) as 1 | 2;
        return {
            file,
            label:    file.replace(/\.pdf$/i, ""),
            date:     `2026-04-${String(day).padStart(2, "0")}`,
            year:     2026,
            shift,
            dateSlug: `apr${String(day).padStart(2, "0")}`,
        };
    }
    // Format 2 (multi-year canonical): jee-mains-{YYYY}-{DD}-{mmm}-shift-{N}.pdf
    // e.g. jee-mains-2024-01-feb-shift-1.pdf, jee-mains-2025-22-jan-shift-2.pdf
    const canonMatch = file.match(/^jee-mains-(\d{4})-(\d{1,2})-([a-z]{3})-shift-([12])\.pdf$/i);
    if (canonMatch) {
        const year  = parseInt(canonMatch[1], 10);
        const day   = parseInt(canonMatch[2], 10);
        const mon   = canonMatch[3].toLowerCase();
        const shift = parseInt(canonMatch[4], 10) as 1 | 2;
        const monNum = MONTH_TO_NUM[mon];
        if (!monNum) return null;
        return {
            file,
            label:    file.replace(/\.pdf$/i, ""),
            date:     `${year}-${monNum}-${String(day).padStart(2, "0")}`,
            year,
            shift,
            dateSlug: `${mon}${String(day).padStart(2, "0")}`,
        };
    }
    return null;
}

// ── Sonnet extraction output schema ───────────────────────────────────────────
const PhysicsQuestionSchema = z.object({
    question_number: z.number().int(),         // global Q# in the paper (1-75 typically)
    section:         z.enum(["A", "B"]),
    question_type:   z.enum(["mcq_single", "integer", "numeric"]),
    question_text:   z.string(),
    options:         z.array(z.string()).nullable(),
    question_id:     z.string().nullable().optional(),  // NTA's internal ID if visible in PDF
});
type PhysicsQuestion = z.infer<typeof PhysicsQuestionSchema>;

const ExtractionResponseSchema = z.object({
    physics_questions: z.array(PhysicsQuestionSchema),
});

// ── PDF extraction (Sonnet 4.6 with native PDF input + per-PDF cache) ─────────
function cachePathFor(label: string): string {
    return join(CACHE_DIR, `${label}.json`);
}

// Per-source extraction prompts. NTA-direct expects pristine 75-question NTA PDFs
// (no embedded solutions). Allen-reformat expects Allen-typed PDFs with "Ans. (X)"
// + "Sol. ..." blocks interleaved between questions; the prompt instructs the
// extractor to strip those.
const SYSTEM_PROMPTS: Record<string, string> = {
    "nta-direct": `You are an OCR + extraction system for NTA JEE Mains question papers (Indian engineering entrance exam).

The PDF you receive contains 75 questions across 6 sections in this exact order:
  1. Mathematics Section A — 20 MCQ_SINGLE questions (Q1-Q20)
  2. Mathematics Section B — 5 INTEGER questions (Q21-Q25)
  3. Physics Section A     — 20 MCQ_SINGLE questions (Q26-Q45 typically)
  4. Physics Section B     — 5 INTEGER questions (Q46-Q50 typically)
  5. Chemistry Section A   — 20 MCQ_SINGLE questions
  6. Chemistry Section B   — 5 INTEGER questions

The exact global question numbers for Physics may vary slightly per paper. Identify the Physics sections by the section headers ("Physics Section A", "Physics Section B") in the PDF.

Your job: extract ONLY the Physics Section A + Physics Section B questions. Skip Math and Chemistry entirely.

For each physics question, output:
  - "question_number": global Q# in the paper (the actual number printed in the PDF, e.g. 41)
  - "section": "A" for MCQ, "B" for Integer
  - "question_type": "mcq_single" for Section A, "integer" for Section B
  - "question_text": the verbatim question prose with mathematical equations rendered as inline LaTeX ($...$). If the question references a diagram, figure, or graph, describe it briefly in brackets, e.g. "[diagram: ray of light hitting a prism at angle 45°]" or "[graph: x-t with parabolic curve from origin]". Do NOT solve the question — just extract the text + brief diagram description.
  - "options": for Section A, an array of 4 strings like ["(1) 5 m/s", "(2) 10 m/s", "(3) 15 m/s", "(4) 20 m/s"] preserving the (1)/(2)/(3)/(4) NTA labelling. For Section B, return null.
  - "question_id": NTA's internal Question Id from the PDF metadata if visible (e.g. "695278242"), else null.

Reply with ONLY valid JSON in this exact shape:
{"physics_questions": [{"question_number": 41, "section": "A", "question_type": "mcq_single", "question_text": "...", "options": ["(1) ...", "(2) ...", "(3) ...", "(4) ..."], "question_id": "695278242"}, ...]}

No prose, no markdown fences, no commentary. Expect exactly 25 physics questions per paper (20 from Section A + 5 from Section B). If you find more or fewer, still extract what's actually present.`,

    "allen-reformat": `You are an OCR + extraction system for Allen-coaching reformatted JEE Mains question papers (Indian engineering entrance exam).

The PDF you receive is a typed coaching-institute reformat of a single shift's paper, structured as:
  1. MATHEMATICS — SECTION-A (20 MCQs) then SECTION-B (5 Integer)
  2. PHYSICS    — SECTION-A (20 MCQs) then SECTION-B (5 Integer)
  3. CHEMISTRY  — SECTION-A (20 MCQs) then SECTION-B (5 Integer)

Identify the PHYSICS section by the "PHYSICS" header in the PDF.

CRITICAL: Allen interleaves "Ans. (X)" lines and "Sol. ..." derivation blocks AFTER each question's options. Your job is to extract ONLY the question prose + the four options. SKIP Ans. lines, SKIP Sol. blocks, SKIP any solution working.

Your job: extract ONLY the Physics Section A + Physics Section B questions. Skip Math and Chemistry entirely.

For each physics question, output:
  - "question_number": the Q# printed in the PDF (e.g. 31, 32, ..., 55 — Allen often numbers physics questions starting at 31 after Math 1-30, but the actual number in the PDF wins)
  - "section": "A" for MCQ, "B" for Integer
  - "question_type": "mcq_single" for Section A, "integer" for Section B
  - "question_text": the verbatim question prose with mathematical equations rendered as inline LaTeX ($...$). If the question references a diagram, figure, or graph, describe it briefly in brackets, e.g. "[diagram: ray of light hitting a prism at angle 45°]". Do NOT include "Ans." or "Sol." text. Do NOT include answer letters or solution derivations.
  - "options": for Section A, an array of 4 strings like ["(1) 5 m/s", "(2) 10 m/s", "(3) 15 m/s", "(4) 20 m/s"] preserving the (1)/(2)/(3)/(4) labelling. For Section B, return null.
  - "question_id": null — Allen reformats strip NTA's internal IDs.

Reply with ONLY valid JSON in this exact shape:
{"physics_questions": [{"question_number": 31, "section": "A", "question_type": "mcq_single", "question_text": "...", "options": ["(1) ...", "(2) ...", "(3) ...", "(4) ..."], "question_id": null}, ...]}

No prose, no markdown fences, no commentary. Expect 20-30 physics questions per paper. Section A is consistently 20 MCQs. Section B may be 5 (older format) or 10 ("attempt 5 of 10" optional format used in many post-2023 shifts) — extract whatever is actually printed in the PDF; do NOT force a count.`,
};

async function extractPhysicsFromPdf(meta: PaperMeta): Promise<PhysicsQuestion[]> {
    if (!existsSync(CACHE_DIR)) mkdirSync(CACHE_DIR, { recursive: true });

    const cachePath = cachePathFor(meta.label);
    if (existsSync(cachePath)) {
        const cached = JSON.parse(readFileSync(cachePath, "utf-8"));
        return ExtractionResponseSchema.parse(cached).physics_questions;
    }

    // Sub-agent fan-out workflow: this script does NOT call the Anthropic API
    // directly anymore (credit-pool exhaustion in session 46). Cache misses must
    // be populated by spawning a Claude Code sub-agent per paper, which uses the
    // user's subscription quota rather than direct API credits. The sub-agent
    // reads the PDF via the Read tool (page-chunked for >10-page PDFs), follows
    // the system prompt for SOURCE_FORMAT below, and writes the JSON to
    // .cache/nta-pdf/<label>.json. After all caches are populated, re-run this
    // script and the cache-hit path will embed via Gemini and insert to DB.
    throw new Error(
`Cache miss for "${meta.label}".

This script is cache-only as of session 48 — populate the cache via a sub-agent before running.

Sub-agent brief (paste into a fresh Agent call):
─────────────────────────────────────────────────────────────────────────────
You are extracting physics questions from a JEE Mains question paper PDF.

1. Read the PDF: ${join(PDFS_DIR, meta.file)}
   The file is more than 10 pages. Use the Read tool's "pages" parameter to read it in chunks
   (e.g. pages: "1-10", then pages: "11-20", etc.). Inspect each chunk to locate the PHYSICS
   section header, then read only the physics pages.

2. Apply this extraction system prompt verbatim:

${SYSTEM_PROMPTS[SOURCE_FORMAT]}

3. Validate your JSON output against this schema:
   { physics_questions: [ { question_number: int, section: "A"|"B", question_type: "mcq_single"|"integer"|"numeric", question_text: string, options: string[]|null, question_id: string|null } ] }

4. Write the validated JSON to: ${cachePath}
─────────────────────────────────────────────────────────────────────────────

After the sub-agent writes the cache file, re-run this script.`
    );
}

// ── Embedding (gemini-embedding-001 768-dim) ──────────────────────────────────
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

// ── Insert helper ─────────────────────────────────────────────────────────────
async function insertRow(row: Record<string, unknown>): Promise<void> {
    if (IS_DRY_RUN || !supabase) return;
    const { error } = await supabase.from("pyq_questions").insert(row);
    if (error) throw new Error(`Insert error: ${error.message}`);
}

// ── Sleep ─────────────────────────────────────────────────────────────────────
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// ── Main ──────────────────────────────────────────────────────────────────────
async function main(): Promise<void> {
    console.log(`\nJEE Mains physics-only ingest [source: ${SOURCE_FORMAT} → ${SOURCE_REPO}]`);
    console.log(`  PDFs dir:  ${PDFS_DIR}`);
    console.log(`  Cache dir: ${CACHE_DIR}`);
    console.log(`  Mode:      ${IS_DRY_RUN ? "DRY RUN (no DB writes)" : "LIVE"}`);
    if (LIMIT_PAPERS) console.log(`  Limit:     ${LIMIT_PAPERS} paper(s)`);
    if (SINGLE_PAPER) console.log(`  Filter:    ${SINGLE_PAPER}`);
    console.log();

    if (!existsSync(PDFS_DIR)) {
        console.error(`PDFs dir does not exist: ${PDFS_DIR}`);
        process.exit(1);
    }

    const allFiles = readdirSync(PDFS_DIR).filter((f) => f.toLowerCase().endsWith(".pdf"));
    let papers: PaperMeta[] = [];
    for (const file of allFiles) {
        const meta = parseFileName(file);
        if (!meta) {
            console.warn(`  SKIP ${file}: filename does not match expected pattern`);
            continue;
        }
        if (SINGLE_PAPER && file !== SINGLE_PAPER) continue;
        papers.push(meta);
    }
    if (LIMIT_PAPERS > 0) papers = papers.slice(0, LIMIT_PAPERS);

    console.log(`Found ${papers.length} paper(s) to process.`);

    // Safety check: warn if rows for this source_repo already exist
    if (!IS_DRY_RUN && supabase) {
        const { count } = await supabase
            .from("pyq_questions")
            .select("*", { count: "exact", head: true })
            .eq("source_repo", SOURCE_REPO);
        if (count && count > 0) {
            console.warn(`\nWARNING: ${count} ${SOURCE_REPO} rows already exist.`);
            console.warn("Re-runs use UNIQUE (source_repo, external_id) for dedup;");
            console.warn("conflicts will fail-fast. Continuing in 5s...");
            await sleep(5000);
        }
    }

    let totalQuestions = 0;
    let totalInserted  = 0;
    let totalErrors    = 0;
    let papersProcessed = 0;

    for (const paper of papers) {
        console.log(`\n[${papersProcessed + 1}/${papers.length}] ${paper.label}`);
        const wasCached = existsSync(cachePathFor(paper.label));
        console.log(`  Extracting physics questions ${wasCached ? "(cached)" : "via Sonnet 4.6 PDF"}...`);

        let questions: PhysicsQuestion[];
        try {
            questions = await extractPhysicsFromPdf(paper);
        } catch (err) {
            console.error(`  ✗ Extraction failed: ${(err as Error).message}`);
            totalErrors++;
            papersProcessed++;
            continue;
        }

        console.log(`  Extracted ${questions.length} physics questions (${questions.filter(q => q.section === "A").length} MCQ + ${questions.filter(q => q.section === "B").length} Integer)`);
        totalQuestions += questions.length;

        for (const q of questions) {
            const idPrefix = SOURCE_FORMAT === "allen-reformat" ? "allen" : "nta";
            const externalId = `${idPrefix}_jee_mains_${paper.year}_${paper.dateSlug}_S${paper.shift}_Q${q.question_number}`;

            if (!q.question_text || q.question_text.trim().length < 30) {
                console.warn(`    SKIP Q${q.question_number}: question_text too short`);
                totalErrors++;
                continue;
            }

            const embedText = q.options && q.options.length > 0
                ? `${q.question_text}\n\nOptions:\n${q.options.join("\n")}`
                : q.question_text;

            let embedding: number[];
            try {
                embedding = await embed(embedText);
            } catch (err) {
                console.error(`    Embed error Q${q.question_number}: ${(err as Error).message}`);
                totalErrors++;
                await sleep(2000);
                continue;
            }

            const row = {
                source_repo:    SOURCE_REPO,
                external_id:    externalId,
                exam:           "jee_mains",
                paper:          `${paper.date} Shift ${paper.shift}`,
                year:           paper.year,
                subject:        "physics",
                question_type:  q.question_type,
                question_text:  embedText,
                gold_answer:    null,                    // NTA answer keys ship in separate PDFs
                options:        q.options ?? null,
                topic_tags:     null,                    // tag-pyq-topics.ts fills these later
                concept_ids:    null,
                difficulty:     null,
                embedding:      embedding,
                license:        LICENSE,
                source_url:     SOURCE_URL,
            };

            if (IS_DRY_RUN) {
                console.log(
                    `    [DRY] ${externalId} | ${q.question_type} | qtext_len=${q.question_text.length} | opts=${q.options?.length ?? 0}`
                );
            } else {
                try {
                    await insertRow(row);
                    totalInserted++;
                } catch (err) {
                    console.error(`    Insert error Q${q.question_number}: ${(err as Error).message}`);
                    totalErrors++;
                    continue;
                }
            }

            await sleep(DELAY_MS);
        }

        papersProcessed++;
    }

    console.log("\n══════════════════════════════════════════════════════════════════");
    console.log(`Done.  Papers: ${papersProcessed}/${papers.length}  Questions found: ${totalQuestions}  Inserted: ${totalInserted}  Errors: ${totalErrors}`);
    console.log("══════════════════════════════════════════════════════════════════");

    if (!IS_DRY_RUN) {
        console.log("\nVerification:");
        console.log(`  SELECT paper, COUNT(*) FROM pyq_questions WHERE source_repo='${SOURCE_REPO}' GROUP BY paper ORDER BY paper;`);
        console.log("\nNext step:");
        console.log(`  npx tsx src/scripts/tag-pyq-topics.ts   # auto-tags the new untagged rows`);
    }
}

main().catch((err: unknown) => {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Fatal:", message);
    process.exit(1);
});
