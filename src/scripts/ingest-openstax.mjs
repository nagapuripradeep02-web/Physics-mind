/**
 * OpenStax College Physics — chunker + JSONL writer
 * ==================================================
 * Reads the philschatz/physics-book repository (OpenStax College Physics,
 * CC-BY 3.0 Unported), strips CNXML / MathML / Kramdown attributes, converts
 * MathML to inline LaTeX, chunks per NCERT-aligned chapter group with the
 * 350-word sliding window used for DC Pandey, and emits a JSONL file ready for
 * embed-openstax.mjs to embed into ncert_content with source_book='openstax_cp'.
 *
 * Usage:
 *   node src/scripts/ingest-openstax.mjs                            # default paths
 *   node src/scripts/ingest-openstax.mjs --summary <p> --contents <p> --output <p>
 *   node src/scripts/ingest-openstax.mjs --dry-run                  # print summary, no file
 *   node src/scripts/ingest-openstax.mjs --limit 5                  # process only first N files
 *
 * Defaults assume the repo was cloned to C:\Tutor\physics-book-source
 * (sibling of physics-mind/), per the session plan.
 *
 * Output JSONL schema matches DC Pandey (one record per line):
 *   { content_text, class_level, part: "1", chapter_number, chapter_name,
 *     section_name, word_count, chunk_index, source_book: "openstax_cp" }
 *
 * Attribution (per CC-BY 3.0): output of this pipeline is derived from
 *   "OpenStax College Physics" (https://github.com/philschatz/physics-book),
 *   Copyright 2014 OpenStax College, licensed CC BY 3.0 Unported.
 */

import { readFileSync, existsSync } from "node:fs";
import { resolve, join } from "node:path";
import { writeFileSync } from "node:fs";

// ── Args ──────────────────────────────────────────────────────────────────────
function getArg(name, fallback) {
  const idx = process.argv.indexOf(`--${name}`);
  if (idx === -1) return fallback;
  const next = process.argv[idx + 1];
  return next && !next.startsWith("--") ? next : fallback;
}

const SUMMARY_PATH  = resolve(getArg("summary",  "../physics-book-source/SUMMARY.md"));
const CONTENTS_PATH = resolve(getArg("contents", "../physics-book-source/contents"));
const OUTPUT_PATH   = resolve(getArg("output",   "openstax_cp_chunks.jsonl"));
const IS_DRY_RUN    = process.argv.includes("--dry-run");
const LIMIT         = parseInt(getArg("limit", "0"), 10) || 0;

// ── Chunking parameters (mirror ingest-dc-pandey.py) ──────────────────────────
const CHUNK_WORDS    = 350;
const OVERLAP_WORDS  = 30;
const MIN_CHUNK_CHARS = 80;

// ── Scope (OpenStax chapter numbers covering NCERT Class 11/12 mechanics+thermo) ─
const SCOPE_CHAPTERS = new Set([5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17]);

// ── Chapter mapping (OpenStax → NCERT) ────────────────────────────────────────
// Each value MUST substring-match a value in CONCEPT_CHAPTER_MAP in
// src/lib/ncertSearch.ts so getChapterHint() filtering does not silently drop
// OpenStax results. SPLIT means use SECTION_OVERRIDES below.
const OPENSTAX_TO_NCERT = {
  5:  { class_level: "11", number: 5,  name: "Laws of Motion" },                                    // Dynamics: Force and Newton's Laws
  6:  { class_level: "11", number: 5,  name: "Laws of Motion" },                                    // Friction, Drag, Elasticity (LoM-adjacent)
  7:  "SPLIT",                                                                                       // Circular Motion + Gravitation
  8:  { class_level: "11", number: 6,  name: "Work, Energy and Power" },                            // Work, Energy, Energy Resources
  9:  { class_level: "11", number: 5,  name: "Laws of Motion" },                                    // Linear Momentum & Collisions (NCERT keeps in LoM)
  10: { class_level: "11", number: 7,  name: "System of Particles and Rotational Motion" },         // Statics + Torque
  11: { class_level: "11", number: 7,  name: "System of Particles and Rotational Motion" },         // Rotational Motion + Angular Momentum
  12: { class_level: "11", number: 10, name: "Mechanical Properties of Fluids" },                   // Fluid Statics
  13: { class_level: "11", number: 10, name: "Mechanical Properties of Fluids" },                   // Fluid Dynamics
  14: "SPLIT",                                                                                       // Temperature + Kinetic Theory + Gas Laws
  15: { class_level: "11", number: 11, name: "Thermal Properties of Matter" },                      // Heat + Heat Transfer
  16: { class_level: "11", number: 12, name: "Thermodynamics" },                                    // Thermodynamics
  17: "SPLIT",                                                                                       // Oscillatory Motion + Waves
};

// Per-section overrides for SPLIT chapters. Key is "<chapter>.<section>".
const SECTION_OVERRIDES = {
  // OpenStax Ch.7 — Uniform Circular Motion AND Gravitation (split)
  "7.1": { class_level: "11", number: 4, name: "Motion in a Plane" },        // Rotation Angle and Angular Velocity
  "7.2": { class_level: "11", number: 4, name: "Motion in a Plane" },        // Centripetal Acceleration
  "7.3": { class_level: "11", number: 4, name: "Motion in a Plane" },        // Centripetal Force
  "7.4": { class_level: "11", number: 4, name: "Motion in a Plane" },        // Coriolis (non-inertial frames)
  "7.5": { class_level: "11", number: 8, name: "Gravitation" },              // Newton's Universal Law of Gravitation
  "7.6": { class_level: "11", number: 8, name: "Gravitation" },              // Satellites and Kepler's Laws

  // OpenStax Ch.14 — Temperature, Kinetic Theory, Gas Laws (split)
  "14.1": { class_level: "11", number: 11, name: "Thermal Properties of Matter" },  // Temperature
  "14.2": { class_level: "11", number: 11, name: "Thermal Properties of Matter" },  // Thermal Expansion
  "14.3": { class_level: "11", number: 13, name: "Kinetic Theory" },                // The Ideal Gas Law
  "14.4": { class_level: "11", number: 13, name: "Kinetic Theory" },                // Kinetic Theory: Atomic/Molecular Pressure & Temp
  "14.5": { class_level: "11", number: 11, name: "Thermal Properties of Matter" },  // Phase Changes
  "14.6": { class_level: "11", number: 11, name: "Thermal Properties of Matter" },  // Humidity, Evaporation, Boiling

  // OpenStax Ch.17 — Oscillatory Motion AND Waves (split)
  "17.1":  { class_level: "11", number: 14, name: "Oscillations" },          // Hooke's Law
  "17.2":  { class_level: "11", number: 14, name: "Oscillations" },          // Period & Frequency
  "17.3":  { class_level: "11", number: 14, name: "Oscillations" },          // SHM
  "17.4":  { class_level: "11", number: 14, name: "Oscillations" },          // Simple Pendulum
  "17.5":  { class_level: "11", number: 14, name: "Oscillations" },          // Energy & SHO
  "17.6":  { class_level: "11", number: 14, name: "Oscillations" },          // Uniform Circular Motion ↔ SHM
  "17.7":  { class_level: "11", number: 14, name: "Oscillations" },          // Damped Harmonic Motion
  "17.8":  { class_level: "11", number: 14, name: "Oscillations" },          // Forced Oscillations & Resonance
  "17.9":  { class_level: "11", number: 15, name: "Waves" },                 // Waves
  "17.10": { class_level: "11", number: 15, name: "Waves" },                 // Superposition & Interference
  "17.11": { class_level: "11", number: 15, name: "Waves" },                 // Energy in Waves: Intensity
};

// ── SUMMARY.md parser ─────────────────────────────────────────────────────────
// SUMMARY.md format excerpt:
//   5.  {: .chapter} [Dynamics: Force and Newton's Laws of Motion](contents/m42129.md)
//       1.  [Development of Force Concept](contents/m42069.md)
//       2.  [Newton's First Law of Motion: Inertia](contents/m42130.md)
//
// Returns array of { chapter_num, chapter_title, section_num | null,
//                    section_title, file_id (e.g. "m42069") }.
// Chapter intro rows have section_num === null and section_title === chapter_title.
function parseSummary(summaryPath) {
  const raw = readFileSync(summaryPath, "utf8");
  const lines = raw.split(/\r?\n/);

  // Top-level chapter line: "5.  {: .chapter} [Title](contents/m42129.md)"
  const chapterRe = /^(\d+)\.\s+\{:\s*\.chapter\}\s+\[([^\]]+)\]\(contents\/(m\d+)\.md\)/;
  // Section line: "    1.  [Title](contents/m42069.md)"
  const sectionRe = /^\s+(\d+)\.\s+\[([^\]]+)\]\(contents\/(m\d+)\.md\)/;

  const records = [];
  let currentChapter = null;
  let currentChapterTitle = null;

  for (const line of lines) {
    const chMatch = chapterRe.exec(line);
    if (chMatch) {
      currentChapter = parseInt(chMatch[1], 10);
      currentChapterTitle = chMatch[2].replace(/\\'/g, "'");
      records.push({
        chapter_num: currentChapter,
        chapter_title: currentChapterTitle,
        section_num: null,
        section_title: currentChapterTitle,  // chapter intro reuses chapter title
        file_id: chMatch[3],
      });

      // SUMMARY.md sometimes has a duplicated chapter link on the same line
      // e.g. "9.  {: .chapter} [Linear Momentum](contents/m42155.md)[Linear Momentum](contents/m42166.md)"
      // Capture the second link too as a chapter-level intro.
      const dupRe = /\]\(contents\/(m\d+)\.md\)\[([^\]]+)\]\(contents\/(m\d+)\.md\)/;
      const dup = dupRe.exec(line);
      if (dup) {
        records.push({
          chapter_num: currentChapter,
          chapter_title: currentChapterTitle,
          section_num: null,
          section_title: dup[2].replace(/\\'/g, "'"),
          file_id: dup[3],
        });
      }
      continue;
    }

    const secMatch = sectionRe.exec(line);
    if (secMatch && currentChapter !== null) {
      records.push({
        chapter_num: currentChapter,
        chapter_title: currentChapterTitle,
        section_num: parseInt(secMatch[1], 10),
        section_title: secMatch[2].replace(/\\'/g, "'"),
        file_id: secMatch[3],
      });
    }
  }

  return records;
}

// ── HTML entity decoder ───────────────────────────────────────────────────────
const NAMED_ENTITIES = {
  amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ",
  ndash: "-", mdash: "-", hellip: "...", times: "x", divide: "/",
  copy: "(c)", reg: "(R)", trade: "(TM)",
};
function decodeEntities(s) {
  return s
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(parseInt(dec, 10)))
    .replace(/&([a-zA-Z]+);/g, (m, name) => NAMED_ENTITIES[name] ?? m);
}

// ── MathML → LaTeX (2-tier: simple recursive walker, fallback to placeholder) ─
// Handles common cases; complex constructs fall back to "[equation]".
function mathmlToLatex(mathmlString) {
  // Strip outer namespace declarations and <semantics> wrapper noise
  let s = mathmlString
    .replace(/<math[^>]*>/g, "")
    .replace(/<\/math>/g, "")
    .replace(/<semantics[^>]*>/g, "")
    .replace(/<\/semantics>/g, "")
    .replace(/<annotation[^>]*>[\s\S]*?<\/annotation>/g, "")
    .replace(/<annotation-xml[^>]*>[\s\S]*?<\/annotation-xml>/g, "");

  // Bail out only on truly rare constructs we can't reasonably approximate.
  // Common constructs handled below: mfenced (parens), mover (vector arrows),
  // mtable / mtr / mtd (aligned multi-line derivations — flattened with " ; ").
  if (/<m(under|munderover|menclose)/i.test(s)) {
    return "[equation]";
  }

  // Flatten <mtable> aligned-equation blocks: rows joined with " ; ", cells
  // joined with spaces. Self-closing <mtd /> becomes empty.
  s = s.replace(/<mtable[^>]*>([\s\S]*?)<\/mtable>/g, (_, body) => {
    const rows = [];
    const rowRe = /<mtr[^>]*>([\s\S]*?)<\/mtr>/g;
    let m;
    while ((m = rowRe.exec(body)) !== null) {
      const cells = m[1]
        .replace(/<mtd[^>]*\/>/g, " ")                              // self-closing empty cell
        .replace(/<mtd[^>]*>/g, "")
        .replace(/<\/mtd>/g, " ")
        .trim();
      if (cells) rows.push(cells);
    }
    return rows.join(" ; ");
  });

  // Recursively process from the deepest tags outward by repeated regex passes.
  // Order matters — handle 2-arg constructs (msup/msub/mfrac) before single-tag wrappers.
  let prev;
  let iter = 0;
  do {
    prev = s;
    iter++;

    // <mfenced open=X close=Y separators=Z>...</mfenced> → wraps children in
    // open/close brackets (default parentheses). For multi-child mfenced, join
    // children with comma (per MathML spec) — good enough for embedding.
    s = s.replace(/<mfenced([^>]*)>\s*([\s\S]*?)\s*<\/mfenced>/g, (_, attrs, inner) => {
      const open  = (/(?:^|\s)open\s*=\s*"([^"]*)"/i.exec(attrs)?.[1])  ?? "(";
      const close = (/(?:^|\s)close\s*=\s*"([^"]*)"/i.exec(attrs)?.[1]) ?? ")";
      const children = splitNChildren(inner, 99) || [];
      if (children.length === 0) return `${open}${inner.trim()}${close}`;
      return `${open}${children.join(", ")}${close}`;
    });

    // <mover>BASE ACCENT</mover> — typically vector arrows. If accent looks
    // like an arrow / overbar, emit \vec{BASE}; otherwise just emit BASE.
    s = s.replace(/<mover[^>]*>\s*([\s\S]*?)\s*<\/mover>/g, (_, inner) => {
      const parts = splitTwoChildren(inner);
      if (!parts) return inner;
      const accent = parts[1];
      const isArrow = /[→↑↔←↗↘─‐‑‒–—¯]/.test(accent) || /\barrow\b|\bvec\b|\bbar\b/i.test(accent);
      return isArrow ? `\\vec{${parts[0]}}` : parts[0];
    });

    // <msup>BASE EXPONENT</msup> → BASE^{EXPONENT}
    s = s.replace(/<msup>\s*([\s\S]*?)\s*<\/msup>/g, (_, inner) => {
      const parts = splitTwoChildren(inner);
      return parts ? `${parts[0]}^{${parts[1]}}` : "[equation]";
    });

    // <msub>BASE SUB</msub> → BASE_{SUB}
    s = s.replace(/<msub>\s*([\s\S]*?)\s*<\/msub>/g, (_, inner) => {
      const parts = splitTwoChildren(inner);
      return parts ? `${parts[0]}_{${parts[1]}}` : "[equation]";
    });

    // <msubsup>BASE SUB SUP</msubsup> → BASE_{SUB}^{SUP}
    s = s.replace(/<msubsup>\s*([\s\S]*?)\s*<\/msubsup>/g, (_, inner) => {
      const parts = splitNChildren(inner, 3);
      return parts ? `${parts[0]}_{${parts[1]}}^{${parts[2]}}` : "[equation]";
    });

    // <mfrac>NUM DEN</mfrac> → \frac{NUM}{DEN}
    s = s.replace(/<mfrac[^>]*>\s*([\s\S]*?)\s*<\/mfrac>/g, (_, inner) => {
      const parts = splitTwoChildren(inner);
      return parts ? `\\frac{${parts[0]}}{${parts[1]}}` : "[equation]";
    });

    // <msqrt>X</msqrt> → \sqrt{X}
    s = s.replace(/<msqrt>\s*([\s\S]*?)\s*<\/msqrt>/g, (_, inner) => `\\sqrt{${inner.trim()}}`);

    // <mroot>RADICAND INDEX</mroot> → \sqrt[INDEX]{RADICAND}
    s = s.replace(/<mroot>\s*([\s\S]*?)\s*<\/mroot>/g, (_, inner) => {
      const parts = splitTwoChildren(inner);
      return parts ? `\\sqrt[${parts[1]}]{${parts[0]}}` : "[equation]";
    });

    // <mrow>...</mrow> → just inner (groups are implicit in our string form)
    s = s.replace(/<mrow[^>]*>\s*([\s\S]*?)\s*<\/mrow>/g, (_, inner) => inner);

    // Self-closing or content tags reduced to plain text:
    s = s.replace(/<mn[^>]*>([^<]*)<\/mn>/g, "$1");
    s = s.replace(/<mi[^>]*>([^<]*)<\/mi>/g, "$1");
    s = s.replace(/<mo[^>]*>([^<]*)<\/mo>/g, "$1");
    s = s.replace(/<mtext[^>]*>([^<]*)<\/mtext>/g, "$1");
    s = s.replace(/<mspace[^>]*\/>/g, " ");
    s = s.replace(/<mspace[^>]*><\/mspace>/g, " ");
  } while (s !== prev && iter < 20);

  // If anything MathML-like is left, give up
  if (/<m[a-z]+/i.test(s)) {
    return "[equation]";
  }

  // Cleanup whitespace inside the equation
  const cleaned = decodeEntities(s).replace(/\s+/g, " ").trim();
  return cleaned ? `$${cleaned}$` : "";
}

// Split inner XML of a 2-child MathML construct into its top-level children.
// A "child" here means either a <m...>...</m...> tag OR a single non-tag chunk.
// Returns null if we can't identify exactly 2 children.
function splitTwoChildren(inner) {
  const parts = splitNChildren(inner, 2);
  return parts && parts.length === 2 ? parts : null;
}

function splitNChildren(inner, n) {
  const children = [];
  let i = 0;
  const s = inner.trim();
  while (i < s.length) {
    if (s[i] !== "<") {
      // text node — read until next "<"
      const next = s.indexOf("<", i);
      const end = next === -1 ? s.length : next;
      const text = s.slice(i, end).trim();
      if (text) children.push(text);
      i = end;
      continue;
    }
    // tag — find matching close
    const tagMatch = /^<([a-zA-Z][a-zA-Z0-9]*)/.exec(s.slice(i));
    if (!tagMatch) { i++; continue; }
    const tag = tagMatch[1];
    // Self-closing?
    const selfClose = s.indexOf("/>", i);
    const openEnd = s.indexOf(">", i);
    if (selfClose !== -1 && selfClose < openEnd + 1 && selfClose === openEnd - 1) {
      children.push(s.slice(i, selfClose + 2));
      i = selfClose + 2;
      continue;
    }
    // Find matching </tag> with depth tracking
    const openRe = new RegExp(`<${tag}(\\s[^>]*)?>`, "g");
    const closeRe = new RegExp(`</${tag}>`, "g");
    openRe.lastIndex = i + 1;  // skip our own open
    closeRe.lastIndex = i + 1;
    let depth = 1;
    let pos = i + tagMatch[0].length;
    let close = -1;
    while (depth > 0 && pos < s.length) {
      openRe.lastIndex = pos;
      closeRe.lastIndex = pos;
      const o = openRe.exec(s);
      const c = closeRe.exec(s);
      if (!c) break;
      if (o && o.index < c.index) { depth++; pos = o.index + o[0].length; }
      else { depth--; close = c.index; pos = c.index + c[0].length; }
    }
    if (close === -1) return null;
    const closeEnd = close + `</${tag}>`.length;
    children.push(s.slice(i, closeEnd));
    i = closeEnd;
  }
  return children.length >= n ? children.slice(0, n) : null;
}

// ── Markdown / CNXML cleaners ─────────────────────────────────────────────────

// Strip YAML frontmatter (--- ... ---)
function stripFrontmatter(s) {
  return s.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, "");
}

// Drop <cnx-pi data-type="..."> directives entirely (end-of-chapter pointers)
function stripCnxPi(s) {
  return s.replace(/<cnx-pi[^>]*>[\s\S]*?<\/cnx-pi>/g, "")
          .replace(/<cnx-pi[^>]*\/?>/g, "");
}

// Replace inline <math>...</math> with LaTeX `$...$`
function replaceMathMl(s) {
  return s.replace(/<math[^>]*>[\s\S]*?<\/math>/g, (m) => mathmlToLatex(m));
}

// Strip Kramdown attribute lists `{: .class #id key="val" ... }`
function stripKramdownAttrs(s) {
  return s.replace(/\{:\s*[^}]*\}/g, "");
}

// Markdown image `![alt](path "caption"){: #id ...}` → `[Figure: alt | caption]`
function stripImages(s) {
  return s.replace(/!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]+)")?\)/g, (_, alt, _path, cap) => {
    const a = (alt || "").trim();
    const c = (cap || "").trim();
    if (!a && !c) return "";
    if (a && c) return `[Figure: ${a} | ${c}]`;
    return `[Figure: ${a || c}]`;
  });
}

// Markdown link `[text](url)` → `text` (drop the URL)
function stripLinks(s) {
  return s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1");
}

// Drop `<div data-type="...">...</div>` wrappers but KEEP inner content.
// Simplification: we do this after stripping cnx-pi and after MathML replacement.
function stripDivWrappers(s) {
  let prev;
  do {
    prev = s;
    // Remove opening div tags (greedy attribute match)
    s = s.replace(/<div[^>]*>/g, "");
    s = s.replace(/<\/div>/g, "");
  } while (s !== prev);
  return s;
}

// Strip remaining HTML tags (sup/sub/em/strong/br/etc.) but KEEP their text.
function stripRemainingTags(s) {
  return s.replace(/<\/?[a-zA-Z][a-zA-Z0-9-]*[^>]*>/g, "");
}

// Collapse 3+ blank lines to 2; trim trailing whitespace per line.
function normalizeWhitespace(s) {
  return s
    .split(/\r?\n/)
    .map(line => line.replace(/[ \t]+$/g, ""))
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

// Full cleaning pipeline for one OpenStax markdown file.
function cleanMarkdown(rawMd) {
  let s = rawMd;
  s = stripFrontmatter(s);
  s = stripCnxPi(s);
  s = replaceMathMl(s);          // before tag stripping — MathML is HTML-like
  s = stripDivWrappers(s);
  s = stripImages(s);
  s = stripLinks(s);
  s = stripKramdownAttrs(s);
  s = stripRemainingTags(s);
  s = decodeEntities(s);
  s = normalizeWhitespace(s);
  return s;
}

// ── Chunker (port of ingest-dc-pandey.py:146-182) ─────────────────────────────
function chunkText(text, chunkWords = CHUNK_WORDS, overlap = OVERLAP_WORDS) {
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];
  const chunks = [];
  let start = 0;
  while (start < words.length) {
    let end = Math.min(start + chunkWords, words.length);

    // Try to end at a paragraph or sentence boundary near the target end.
    if (end < words.length) {
      const candidate = words.slice(start, end).join(" ");
      let boundary = candidate.lastIndexOf("\n\n", Math.max(0, candidate.length - 1));
      if (boundary === -1) {
        boundary = candidate.lastIndexOf(". ", Math.max(0, candidate.length - 1));
        // Only pull back to a sentence boundary if we don't have to give up too much
        if (boundary !== -1 && candidate.length - boundary > 200) boundary = -1;
      }
      if (boundary !== -1) {
        const trimmed = candidate.slice(0, boundary + 1).trim();
        const trimmedWordCount = trimmed.split(/\s+/).filter(Boolean).length;
        if (trimmedWordCount >= 200) end = start + trimmedWordCount;
      }
    }

    const chunk = words.slice(start, end).join(" ");
    if (chunk.length >= MIN_CHUNK_CHARS) chunks.push(chunk);
    if (end >= words.length) break;
    start = Math.max(end - overlap, start + 1);
  }
  return chunks;
}

// ── Section name detector for chunks ──────────────────────────────────────────
// Heuristic: the first heading-like line in the first 600 chars of a chunk.
function detectSectionName(chunkText) {
  const head = chunkText.slice(0, 600);
  // Try to find a sentence that looks like a section title (Title Case, short)
  const lines = head.split(/\n+/).map(l => l.trim()).filter(Boolean);
  for (const line of lines.slice(0, 6)) {
    if (line.length > 5 && line.length < 90 && /^[A-Z]/.test(line) && !/[.!?]$/.test(line)) {
      return line.slice(0, 120);
    }
  }
  return null;
}

// ── Resolve an OpenStax section to its NCERT bucket ───────────────────────────
function resolveBucket(record) {
  const map = OPENSTAX_TO_NCERT[record.chapter_num];
  if (!map) return null;
  if (map !== "SPLIT") return map;
  // Split chapter — need section-level override
  if (record.section_num === null) {
    // Chapter intro — assign to whichever bucket the chapter title best matches.
    // For Ch.7, default intro to "Motion in a Plane" (circular comes first).
    // For Ch.14, default intro to "Thermal Properties of Matter".
    // For Ch.17, default intro to "Oscillations".
    if (record.chapter_num === 7)  return SECTION_OVERRIDES["7.1"];
    if (record.chapter_num === 14) return SECTION_OVERRIDES["14.1"];
    if (record.chapter_num === 17) return SECTION_OVERRIDES["17.1"];
    return null;
  }
  const key = `${record.chapter_num}.${record.section_num}`;
  return SECTION_OVERRIDES[key] || null;
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log("\nOpenStax College Physics — chunker");
  console.log(`  SUMMARY:   ${SUMMARY_PATH}`);
  console.log(`  contents:  ${CONTENTS_PATH}`);
  console.log(`  output:    ${IS_DRY_RUN ? "(dry run)" : OUTPUT_PATH}`);
  if (LIMIT) console.log(`  limit:     ${LIMIT} files`);
  console.log();

  if (!existsSync(SUMMARY_PATH)) {
    console.error(`Cannot find SUMMARY.md at ${SUMMARY_PATH}`);
    process.exit(1);
  }
  if (!existsSync(CONTENTS_PATH)) {
    console.error(`Cannot find contents/ dir at ${CONTENTS_PATH}`);
    process.exit(1);
  }

  // Parse SUMMARY.md → list of (chapter, section, file_id) tuples
  const allRecords = parseSummary(SUMMARY_PATH);
  const inScope = allRecords.filter(r => SCOPE_CHAPTERS.has(r.chapter_num));
  console.log(`SUMMARY.md: ${allRecords.length} entries total, ${inScope.length} in scope (Ch.${[...SCOPE_CHAPTERS].join(",")}).`);

  // Group into NCERT buckets keyed by chapter_name
  // Each bucket accumulates (file_id, section_title, cleaned_text) across files.
  const buckets = new Map();   // chapter_name → { ncert: {class_level,number,name}, files: [...] }
  const skipped = [];
  let processed = 0;

  for (const rec of inScope) {
    if (LIMIT && processed >= LIMIT) break;

    const bucket = resolveBucket(rec);
    if (!bucket) {
      skipped.push({ rec, reason: "no NCERT mapping" });
      continue;
    }

    const filePath = join(CONTENTS_PATH, `${rec.file_id}.md`);
    if (!existsSync(filePath)) {
      skipped.push({ rec, reason: `file not found: ${filePath}` });
      continue;
    }

    const raw = readFileSync(filePath, "utf8");
    const cleaned = cleanMarkdown(raw);
    if (cleaned.length < 200) {
      skipped.push({ rec, reason: `too short after cleaning (${cleaned.length} chars)` });
      continue;
    }

    const key = `${bucket.class_level}|${bucket.number}|${bucket.name}`;
    if (!buckets.has(key)) {
      buckets.set(key, { ncert: bucket, files: [] });
    }
    buckets.get(key).files.push({
      file_id: rec.file_id,
      section_title: rec.section_title,
      text: cleaned,
    });
    processed++;
  }

  console.log(`Processed ${processed} files into ${buckets.size} NCERT chapter buckets.`);
  if (skipped.length) {
    console.log(`Skipped ${skipped.length} files. First few:`);
    skipped.slice(0, 5).forEach(s =>
      console.log(`  - Ch.${s.rec.chapter_num}${s.rec.section_num !== null ? `.${s.rec.section_num}` : ""} ${s.rec.file_id} (${s.rec.section_title}): ${s.reason}`)
    );
  }

  // Chunk per-file within each bucket so section_name comes from SUMMARY.md
  // metadata rather than heuristic detection. chunk_index is bucket-global and
  // monotonic so the (source_book, chapter_name, chunk_index) unique constraint
  // protects against re-run dupes.
  const records = [];
  for (const [key, { ncert, files }] of buckets) {
    let chunkCounter = 0;
    let totalChunks = 0;
    for (const file of files) {
      const fileChunks = chunkText(file.text);
      totalChunks += fileChunks.length;
      for (const chunk of fileChunks) {
        records.push({
          content_text:   chunk,
          class_level:    ncert.class_level,
          part:           "1",
          chapter_number: ncert.number,
          chapter_name:   ncert.name,
          section_name:   file.section_title,
          word_count:     chunk.split(/\s+/).filter(Boolean).length,
          chunk_index:    chunkCounter++,
          source_book:    "openstax_cp",
        });
      }
    }
    console.log(`  ${key.padEnd(50, " ")}  ${files.length} files → ${totalChunks} chunks`);
  }

  console.log(`\nTotal chunks: ${records.length}`);
  if (records.length) {
    const totalWords = records.reduce((sum, r) => sum + r.word_count, 0);
    console.log(`Total words:  ${totalWords.toLocaleString()}`);
    console.log(`Avg per chunk: ${Math.round(totalWords / records.length)} words`);
  }

  if (IS_DRY_RUN) {
    console.log("\n[DRY RUN] No file written. First 3 chunks preview:");
    records.slice(0, 3).forEach((r, i) => {
      console.log(`\n--- Chunk ${i + 1} (Ch.${r.chapter_number} ${r.chapter_name}, ${r.word_count}w) ---`);
      console.log(`  section: ${r.section_name ?? "(none)"}`);
      console.log(`  text:    ${r.content_text.slice(0, 200).replace(/\n/g, " / ")}...`);
    });
    return;
  }

  const lines = records.map(r => JSON.stringify(r)).join("\n") + "\n";
  writeFileSync(OUTPUT_PATH, lines, "utf8");
  console.log(`\nWritten: ${OUTPUT_PATH}`);
  console.log(`\nNext step:`);
  console.log(`  node src/scripts/embed-openstax.mjs ${OUTPUT_PATH}`);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
