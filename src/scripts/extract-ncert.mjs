#!/usr/bin/env node
// extract-ncert.mjs — NCERT PDF extraction pipeline
// Reads 5 PDFs → chunks text → generates embeddings → stores in Supabase
//
// Run:  npm run extract:ncert
// Force re-run on existing data:  npm run extract:ncert -- --force
//
// One-time script. Takes ~20 minutes. Do NOT interrupt.
//
// NOTE: Run this from PowerShell or CMD on Windows.
//       Git Bash (MINGW64) causes an async crash on shutdown — use PowerShell.

// ── Windows graceful shutdown ──────────────────────────────────────────────
// Node on Windows throws UV_HANDLE errors if process.exit() is called while
// Supabase/fetch keep-alive connections are still open. We catch those here.
process.on("uncaughtException", (err) => {
    if (
        err.message?.includes("UV_HANDLE_CLOSING") ||
        err.message?.includes("UV_HANDLE") ||
        err.message?.includes("UV_CLOSING")
    ) {
        // Known Windows shutdown artifact — not a real error
        process.exit(0);
    }
    console.error("Uncaught error:", err);
    process.exit(1);
});

import { createRequire } from "module";
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { config } from "dotenv";

// ESM workaround: pdf-parse is CommonJS
const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../..");

// Load .env.local (fallback if --env-file flag not used)
config({ path: path.join(ROOT, ".env.local") });

// ── Clients ────────────────────────────────────────────────────────────────

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error("❌  Missing Supabase env vars (NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)");
    process.exit(1);
}
if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    console.error("❌  Missing GOOGLE_GENERATIVE_AI_API_KEY");
    process.exit(1);
}

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ── PDF Manifest ───────────────────────────────────────────────────────────
// Chapter lists used for attribution — matches NCERT chapter headings.

const PDF_FILES = [
    {
        path: path.join(ROOT, "ncert", "NCERT-Class-12-Physics-Part-1.pdf"),
        class_level: "12",
        part: "1",
        chapters: [
            { number: 1,  name: "Electric Charges and Fields" },
            { number: 2,  name: "Electrostatic Potential and Capacitance" },
            { number: 3,  name: "Current Electricity" },
            { number: 4,  name: "Moving Charges and Magnetism" },
            { number: 5,  name: "Magnetism and Matter" },
            { number: 6,  name: "Electromagnetic Induction" },
            { number: 7,  name: "Alternating Current" },
        ],
    },
    {
        path: path.join(ROOT, "ncert", "NCERT-Class-12-Physics-Part-2.pdf"),
        class_level: "12",
        part: "2",
        chapters: [
            { number: 8,  name: "Electromagnetic Waves" },
            { number: 9,  name: "Ray Optics and Optical Instruments" },
            { number: 10, name: "Wave Optics" },
            { number: 11, name: "Dual Nature of Radiation and Matter" },
            { number: 12, name: "Atoms" },
            { number: 13, name: "Nuclei" },
            { number: 14, name: "Semiconductor Electronics" },
        ],
    },
    {
        path: path.join(ROOT, "ncert", "NCERT-Class-11-Physics-Part-1.pdf"),
        class_level: "11",
        part: "1",
        chapters: [
            { number: 1,  name: "Physical World" },
            { number: 2,  name: "Units and Measurements" },
            { number: 3,  name: "Motion in a Straight Line" },
            { number: 4,  name: "Motion in a Plane" },
            { number: 5,  name: "Laws of Motion" },
            { number: 6,  name: "Work, Energy and Power" },
            { number: 7,  name: "System of Particles and Rotational Motion" },
            { number: 8,  name: "Gravitation" },
        ],
    },
    {
        path: path.join(ROOT, "ncert", "NCERT-Class-11-Physics-Part-2.pdf"),
        class_level: "11",
        part: "2",
        chapters: [
            { number: 9,  name: "Mechanical Properties of Solids" },
            { number: 10, name: "Mechanical Properties of Fluids" },
            { number: 11, name: "Thermal Properties of Matter" },
            { number: 12, name: "Thermodynamics" },
            { number: 13, name: "Kinetic Theory" },
            { number: 14, name: "Oscillations" },
            { number: 15, name: "Waves" },
        ],
    },
    {
        path: path.join(ROOT, "ncert", "NCERT-Class-10-Science.pdf"),
        class_level: "10",
        part: "1",
        // Only physics-relevant chapters from Class 10 Science
        chapters: [
            { number: 10, name: "Light - Reflection and Refraction" },
            { number: 11, name: "Human Eye and the Colourful World" },
            { number: 12, name: "Electricity" },
            { number: 13, name: "Magnetic Effects of Electric Current" },
            { number: 14, name: "Sources of Energy" },
        ],
    },
];

// English number words for "CHAPTER ONE" style headings
const NUMBER_WORDS = [
    "", "ONE", "TWO", "THREE", "FOUR", "FIVE",
    "SIX", "SEVEN", "EIGHT", "NINE", "TEN",
    "ELEVEN", "TWELVE", "THIRTEEN", "FOURTEEN", "FIFTEEN",
];

// ── Text processing ────────────────────────────────────────────────────────

/** Strip control chars, lone surrogates, and collapse excess newlines */
function sanitizeText(text) {
    return text
        .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
        .replace(/[\uD800-\uDFFF]/g, "")
        .replace(/\n{3,}/g, "\n\n")
        .replace(/ {3,}/g, "  ");
}

/**
 * Find approximate character positions of each chapter in the full text.
 * Tries three patterns for each chapter:
 *   1. "CHAPTER TWO" style (number as word)
 *   2. Chapter name (first 25 chars, case-insensitive)
 *   3. "CHAPTER 2" style (number as digit)
 * Returns array sorted by text position.
 */
function findChapterPositions(fullText, chapters) {
    const positions = [];

    for (const ch of chapters) {
        let found = -1;

        // Pattern 1: "CHAPTER ONE" / "Chapter One"
        if (ch.number < NUMBER_WORDS.length) {
            const word = NUMBER_WORDS[ch.number];
            const idx = fullText.search(new RegExp(`CHAPTER\\s+${word}\\b`, "i"));
            if (idx >= 0) found = idx;
        }

        // Pattern 2: Chapter name (partial, first 25 chars)
        if (found < 0) {
            const shortName = ch.name.substring(0, 25).replace(/[()[\]]/g, "\\$&");
            const pattern = new RegExp(shortName.replace(/\s+/g, "\\s+"), "i");
            const idx = fullText.search(pattern);
            if (idx >= 0) found = idx;
        }

        // Pattern 3: "CHAPTER 3" / "Chapter 3"
        if (found < 0) {
            const idx = fullText.search(
                new RegExp(`CHAPTER\\s+${ch.number}(?:\\s|\\b)`, "i")
            );
            if (idx >= 0) found = idx;
        }

        if (found >= 0) {
            positions.push({ start: found, chapter: ch });
        } else {
            console.warn(`     ⚠️  Could not locate Chapter ${ch.number}: "${ch.name}"`);
        }
    }

    positions.sort((a, b) => a.start - b.start);
    return positions;
}

/**
 * Given a character position in the full text, return the chapter it belongs to.
 * Returns null if no chapter detected before this position.
 */
function getChapterAtPosition(pos, sortedPositions) {
    let current = null;
    for (const cp of sortedPositions) {
        if (cp.start <= pos) {
            current = cp.chapter;
        } else {
            break;
        }
    }
    return current;
}

/**
 * Split text into chunks of ~targetWords words.
 * Splits on double newlines (paragraph boundaries).
 * Skips very short paragraphs (headers, page numbers, etc.).
 * Returns array of { content, word_count, text_position }.
 */
function chunkText(fullText, targetWords = 350) {
    // Split on paragraph boundaries, tracking positions
    const paragraphs = [];
    const paraRegex = /\n\n+/g;
    let lastIdx = 0;
    let m;

    while ((m = paraRegex.exec(fullText)) !== null) {
        const para = fullText.substring(lastIdx, m.index).trim();
        const wordCount = para.split(/\s+/).filter(Boolean).length;
        // Skip: too short, looks like a page number, or pure whitespace
        if (wordCount >= 5 && para.length > 30) {
            paragraphs.push({ text: para, startPos: lastIdx, words: wordCount });
        }
        lastIdx = m.index + m[0].length;
    }
    // Final paragraph after last separator
    const lastPara = fullText.substring(lastIdx).trim();
    if (lastPara.split(/\s+/).filter(Boolean).length >= 5) {
        paragraphs.push({ text: lastPara, startPos: lastIdx, words: lastPara.split(/\s+/).length });
    }

    // Assemble chunks
    const chunks = [];
    let currentParas = [];
    let currentWords = 0;
    let chunkStartPos = 0;

    for (const para of paragraphs) {
        // Flush if adding this para would exceed target + 100 word buffer
        if (currentWords + para.words > targetWords + 100 && currentParas.length > 0) {
            chunks.push({
                content: currentParas.map(p => p.text).join("\n\n"),
                word_count: currentWords,
                text_position: chunkStartPos,
            });
            currentParas = [];
            currentWords = 0;
        }

        if (currentParas.length === 0) chunkStartPos = para.startPos;
        currentParas.push(para);
        currentWords += para.words;
    }

    // Final chunk
    if (currentParas.length > 0) {
        chunks.push({
            content: currentParas.map(p => p.text).join("\n\n"),
            word_count: currentWords,
            text_position: chunkStartPos,
        });
    }

    return chunks;
}

// ── Embedding + DB ─────────────────────────────────────────────────────────
// Uses gemini-embedding-001 via the v1beta REST endpoint.
// outputDimensionality=768 to match our vector(768) Supabase column.

async function generateEmbedding(text) {
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    const url =
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${apiKey}`;

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
    return data.embedding.values; // float[] of length 768
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// ── Per-PDF processing ─────────────────────────────────────────────────────

async function processPDF(fileConfig) {
    const filename = path.basename(fileConfig.path);
    console.log(`\n📖  ${filename}`);

    if (!fs.existsSync(fileConfig.path)) {
        console.warn(`   ⚠️  File not found — skipping`);
        return { success: 0, errors: 0 };
    }

    const buffer = fs.readFileSync(fileConfig.path);
    const parsed = await pdfParse(buffer);
    const fullText = sanitizeText(parsed.text);

    const totalWords = fullText.split(/\s+/).filter(Boolean).length;
    console.log(`   Pages: ${parsed.numpages} | Words: ~${totalWords.toLocaleString()}`);

    // Detect chapter positions
    const chapterPositions = findChapterPositions(fullText, fileConfig.chapters);
    console.log(`   Chapters detected: ${chapterPositions.length}/${fileConfig.chapters.length}`);
    for (const cp of chapterPositions) {
        const pct = Math.round(cp.start / fullText.length * 100);
        console.log(`     Ch.${cp.chapter.number.toString().padStart(2)} "${cp.chapter.name.substring(0, 35).padEnd(35)}" @ ${pct}%`);
    }

    // Chunk the text
    const chunks = chunkText(fullText, 350);
    console.log(`   Chunks to insert: ${chunks.length}`);

    let success = 0;
    let errors = 0;
    const startTime = Date.now();

    for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        const chapter = getChapterAtPosition(chunk.text_position, chapterPositions);

        // Prepend class+chapter context so the embedding captures subject matter
        const contextPrefix = chapter
            ? `Class ${fileConfig.class_level} Physics NCERT | Chapter ${chapter.number}: ${chapter.name} | `
            : `Class ${fileConfig.class_level} Physics NCERT | `;
        const enrichedText = contextPrefix + chunk.content;

        try {
            const embedding = await generateEmbedding(enrichedText);

            const { error } = await supabase.from("ncert_content").insert({
                class_level:    fileConfig.class_level,
                part:           fileConfig.part,
                chapter_number: chapter?.number ?? null,
                chapter_name:   chapter?.name   ?? "general",
                section_name:   null,
                content_text:   chunk.content,
                content:        chunk.content,
                chunk_index:    i,
                word_count:     chunk.word_count,
                embedding:      embedding,
            });

            if (error) {
                console.error(`   ❌ Chunk ${i}: ${error.message}`);
                errors++;
                await sleep(500);
            } else {
                success++;
            }

            // Progress every 20 chunks
            if ((i + 1) % 20 === 0 || i === chunks.length - 1) {
                const elapsed = Math.round((Date.now() - startTime) / 1000);
                const pct = Math.round((i + 1) / chunks.length * 100);
                const chName = chapter?.name?.substring(0, 25) ?? "unknown";
                console.log(`   [${pct.toString().padStart(3)}%] ${i + 1}/${chunks.length} — ch: ${chName} — ${elapsed}s elapsed`);
            }

            // Rate limit: ~6 calls/sec — well within Google's 1500 RPM limit
            await sleep(150);

        } catch (err) {
            console.error(`   ❌ Chunk ${i} exception: ${err.message}`);
            errors++;
            await sleep(500);
        }
    }

    const elapsed = Math.round((Date.now() - startTime) / 1000);
    console.log(`   ✓ Done in ${elapsed}s — ${success} saved, ${errors} errors`);
    return { success, errors };
}

// ── Main ───────────────────────────────────────────────────────────────────

async function main() {
    console.log("NCERT Extraction Pipeline");
    console.log("=========================");
    console.log(`Started: ${new Date().toISOString()}`);

    // Check existing row count
    const { count, error: countErr } = await supabase
        .from("ncert_content")
        .select("*", { count: "exact", head: true });

    if (countErr) {
        console.error("❌  Cannot reach ncert_content table:", countErr.message);
        console.error("   Did you run supabase_ncert_migration.sql first?");
        setTimeout(() => process.exit(1), 500);
        return;
    }

    console.log(`Existing rows in ncert_content: ${count}`);

    if (count > 0 && !process.argv.includes("--force")) {
        console.log(`\nncert_content has ${count} existing rows.`);
        console.log("Run with --force to clear and re-extract.");
        console.log("Exiting safely.\n");
        setTimeout(() => process.exit(0), 500);
        return;
    }

    if (count > 0 && process.argv.includes("--force")) {
        console.log("--force flag detected. Clearing existing data...");
        const { error } = await supabase
            .from("ncert_content")
            .delete()
            .neq("id", "00000000-0000-0000-0000-000000000000");

        if (error) {
            console.error("Clear failed:", error.message);
            console.log("Please run manually: TRUNCATE TABLE ncert_content;");
        } else {
            console.log("Cleared. Starting fresh extraction.");
        }
    }

    const totals = { success: 0, errors: 0 };

    for (const fileConfig of PDF_FILES) {
        try {
            const stats = await processPDF(fileConfig);
            totals.success += stats.success;
            totals.errors  += stats.errors;
        } catch (err) {
            console.error(`\n❌  Failed to process ${path.basename(fileConfig.path)}: ${err.message}`);
        }
    }

    console.log("\n=========================");
    console.log("EXTRACTION COMPLETE");
    console.log(`Finished: ${new Date().toISOString()}`);
    console.log(`Total chunks saved: ${totals.success}`);
    console.log(`Total errors:       ${totals.errors}`);

    // Final count verification
    const { count: finalCount } = await supabase
        .from("ncert_content")
        .select("*", { count: "exact", head: true });

    console.log(`Rows in ncert_content: ${finalCount}`);
    console.log("\nNext steps:");
    console.log("  1. Run in Supabase SQL Editor: ANALYZE ncert_content;");
    console.log("  2. Test: http://localhost:3000/api/test-ncert?q=capacitor+energy&class=12");

    console.log("\nExtraction complete. Closing connections...");
    // Graceful shutdown: give async handles 2 seconds to close before forcing exit.
    // Prevents the Windows UV_HANDLE_CLOSING assertion crash.
    setTimeout(() => {
        process.exit(0);
    }, 2000);
}

main().catch(err => {
    console.error("Fatal:", err.message);
    setTimeout(() => process.exit(1), 500);
});
