/**
 * chunkBook.ts
 * ============
 * Extracts and chunks a physics textbook PDF into a JSON array ready for
 * ingestBook.ts. Works with HC Verma and DC Pandey formatting conventions.
 *
 * Usage:
 *   npx tsx src/scripts/chunkBook.ts --file ./hc_verma_vol1.pdf \
 *     --source hc_verma --class 11 --output ./hc_verma_chunks.json
 *
 *   npx tsx src/scripts/chunkBook.ts --file ./dc_pandey_mechanics.pdf \
 *     --source dc_pandey --class 11 --output ./dc_pandey_chunks.json
 *
 * Output schema (array of):
 *   { chapter_number, chapter_name, section_name, content_text, page_number }
 */

import pdfParse from "pdf-parse";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { resolve } from "path";

// ── CLI args ──────────────────────────────────────────────────────────────────
function getArg(name: string): string | undefined {
  const idx = process.argv.indexOf(`--${name}`);
  return idx !== -1 ? process.argv[idx + 1] : undefined;
}

const filePath    = getArg("file");
const sourceArg   = getArg("source");
const classArg    = getArg("class");
const outputArg   = getArg("output");
const debugChapters = process.argv.includes("--debug-chapters");
const dumpPages     = process.argv.includes("--dump-pages");

if (!filePath || !sourceArg || !classArg || !outputArg) {
  console.error(
    "Usage: npx tsx src/scripts/chunkBook.ts --file <pdf> --source hc_verma|dc_pandey --class 11|12 --output <out.json>"
  );
  process.exit(1);
}

if (!["hc_verma", "dc_pandey"].includes(sourceArg)) {
  console.error(`--source must be hc_verma or dc_pandey, got: ${sourceArg}`);
  process.exit(1);
}
if (classArg !== "11" && classArg !== "12") {
  console.error(`--class must be 11 or 12, got: ${classArg}`);
  process.exit(1);
}

const absFile   = resolve(process.cwd(), filePath);
const absOutput = resolve(process.cwd(), outputArg);

if (!existsSync(absFile)) {
  console.error(`File not found: ${absFile}`);
  process.exit(1);
}

// ── Output chunk type ─────────────────────────────────────────────────────────
interface OutputChunk {
  chapter_number: number;
  chapter_name:   string;
  section_name:   string;
  content_text:   string;
  page_number:    number;
}

// ── Constants ─────────────────────────────────────────────────────────────────
const TARGET_WORDS     = 450; // aim for ~450 words per chunk
const MAX_WORDS        = 500; // hard cap before forcing a split

// ── Manual chapter overrides ──────────────────────────────────────────────────
// Chapters whose headers are completely absent from the PDF text (e.g. rendered
// as images, or the PDF extractor misses them entirely).  After chunking, any
// gap in the detected chapter sequence is filled from this table and the
// swallowed content is re-assigned by page-range midpoint split.
const MANUAL_CHAPTER_OVERRIDES: Record<string, Record<number, string>> = {
  hc_verma: {
    30: "GAUSS'S LAW",
    35: "MAGNETIC FIELD DUE TO A CURRENT",
  },
  dc_pandey: {
    9: "Work, Energy and Power",
  },
};

// ── Skip-page detection ───────────────────────────────────────────────────────
// Pages where the majority of lines match these patterns have no teaching value
const SKIP_PAGE_PATTERNS = [
  /^\s*index\s*$/i,
  /^\s*bibliography\s*$/i,
  /^\s*appendix\s*$/i,
  /^\s*answers?\s*(to\s+)?(exercises?|problems?|questions?)?\s*$/i,
  /^\s*answer\s+key\s*$/i,
  /^\s*table\s+of\s+contents?\s*$/i,
  /^\s*contents?\s*$/i,
  /^\s*further\s+reading\s*$/i,
  /^\s*references?\s*$/i,
  /^\s*acknowledgements?\s*$/i,
  /^\s*preface\s*$/i,
  /^\s*foreword\s*$/i,
  /^\s*about\s+(the\s+)?author\s*$/i,
  /^\s*hints?\s*(&|and)\s*solutions?\s*$/i,        // "Hints & Solutions" / "Hints and Solutions"
  /^\s*previous\s+years?'?\s+questions?\s*/i,      // "Previous Years' Questions"
];

function isSkippablePage(text: string): boolean {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  if (lines.length === 0) return true;

  // If the first substantive line matches a skip pattern, skip the whole page
  for (const line of lines.slice(0, 5)) {
    if (SKIP_PAGE_PATTERNS.some((p) => p.test(line))) return true;
  }

  // Pages that are purely answer keys: many lines matching "N. (a)" or "N. x.xx"
  const answerLineRe = /^\d+[\.\)]\s+[\(a-dA-D\)\d\.\-\+]+\s*$/;
  const answerLines  = lines.filter((l) => answerLineRe.test(l));
  if (lines.length > 4 && answerLines.length / lines.length > 0.6) return true;

  // TOC pages: the same chapter number appears on more than one line of the page.
  // e.g. "CHAPTER 1 ..... 1" and "CHAPTER 2 ..... 15" both on the same page.
  const chapterNumsOnPage: number[] = [];
  for (const line of lines) {
    const m = line.match(/\bCHAPTER\s+(\d+)\b/i);
    if (m) chapterNumsOnPage.push(parseInt(m[1], 10));
  }
  const uniqueChapterNums = new Set(chapterNumsOnPage);
  if (uniqueChapterNums.size >= 2) return true;

  return false;
}

// ── Header/footer noise removal ────────────────────────────────────────────────
// Tracks lines that repeat on many pages and strips them
function buildNoiseSet(pages: string[], minRepeat = 5): Set<string> {
  const freq = new Map<string, number>();
  for (const page of pages) {
    const lines = page.split("\n").map((l) => l.trim()).filter(Boolean);
    // Only consider very short lines (headers/footers are typically short)
    const candidates = [
      ...lines.slice(0, 3),
      ...lines.slice(-3),
    ].filter((l) => l.length < 80);
    for (const line of candidates) {
      freq.set(line, (freq.get(line) ?? 0) + 1);
    }
  }
  const noise = new Set<string>();
  for (const [line, count] of freq) {
    if (count >= minRepeat) noise.add(line);
  }
  return noise;
}

function stripNoise(text: string, noise: Set<string>): string {
  return text
    .split("\n")
    .filter((l) => !noise.has(l.trim()))
    .join("\n");
}

// ── Chapter boundary detection ────────────────────────────────────────────────
/**
 * Returns { chapterNumber, chapterName } if the line is a chapter heading,
 * otherwise null.
 *
 * Patterns handled:
 *   HC Verma:  "CHAPTER 1"  followed next non-blank line by the title
 *              "CHAPTER 1 — Introduction to Physics"
 *              "CHAPTER 1: Introduction to Physics"
 *   DC Pandey: "Chapter 1  Introduction to Physics"
 *              "1 Introduction to Physics"  (standalone numbered title line)
 *              "CHAPTER 1" or "Chapter 1" alone (title on next line)
 */
interface ChapterMatch {
  chapterNumber: number;
  chapterName:   string;  // may be empty if title is on the next line
  titlePending:  boolean; // true when title must come from the next non-blank line
}

const CHAPTER_HEADING_RE = [
  // "CHAPTER 12 — Title" or "CHAPTER 12: Title" (any dash variant)
  /^CHAPTER\s+(\d+)\s*[:\-–—]\s*(.+)$/i,
  // "CHAPTER 12  Title" (two+ spaces as separator, no punctuation)
  /^CHAPTER\s+(\d+)\s{2,}(.+)$/i,
  // "CHAPTER 12" alone (title follows on next line)
  /^CHAPTER\s+(\d+)\s*$/i,
  // "Chapter 12  Some Title" (DC Pandey style)
  /^Chapter\s+(\d+)\s{2,}(.+)$/i,
  // "Chapter 12" alone
  /^Chapter\s+(\d+)\s*$/i,
  // Apostrophe/special-char variants: "CHAPTER 30" where PDF renders "CHAPTER" split
  // Handle "C H A P T E R  3 0" (spaced letters from some PDF renderers)
  /^C\s*H\s*A\s*P\s*T\s*E\s*R\s+(\d+)\s*(.*)$/i,
];

function detectChapter(line: string): ChapterMatch | null {
  const trimmed = line.trim();

  for (const re of CHAPTER_HEADING_RE) {
    const m = trimmed.match(re);
    if (m) {
      const num   = parseInt(m[1], 10);
      const title = m[2]?.trim() ?? "";
      return {
        chapterNumber: num,
        chapterName:   title,
        titlePending:  title === "",
      };
    }
  }
  return null;
}

// ── Chapter name cleanup ──────────────────────────────────────────────────────
// Normalise Unicode quotes → straight apostrophe, collapse spaces.
function cleanName(raw: string): string {
  return raw
    .replace(/[\u2018\u2019\u201A\u201B\u02BC]/g, "'") // curly/modifier apostrophes
    .replace(/[\u201C\u201D\u201E\u201F]/g, '"')        // curly double quotes
    .replace(/\s+/g, " ")
    .trim();
}

// Returns true ONLY when the last word of the title is a preposition or
// conjunction — meaning the title was split mid-phrase across two lines.
// Word count is NOT checked: "CALORIMETRY", "MAGNETIC FIELD", etc. are complete.
const TRAILING_PREPOSITION_RE = /\b(TO|OF|IN|ON|BY|FOR|AND|DUE|THE)\s*$/i;
function needsTitleContinuation(name: string): boolean {
  return TRAILING_PREPOSITION_RE.test(name.trim());
}

// ── Section detection ──────────────────────────────────────────────────────────
/**
 * Returns the section label if the line looks like a section heading,
 * otherwise null.  We only mark high-confidence matches to avoid noise.
 *
 * Examples: "1.3 Units of Measurement", "3.4. Newton's Laws"
 * We do NOT match bare "1." or single digits — too many false positives.
 */
const SECTION_RE = /^(\d+\.\d+\.?)\s+([A-Z][^\n]{3,60})$/;

function detectSection(line: string): string | null {
  const m = line.trim().match(SECTION_RE);
  if (!m) return null;
  // Reject if the title part is all-caps and very short (likely a label, not a title)
  const title = m[2].trim();
  if (title.length < 5) return null;
  return `${m[1]} ${title}`;
}

// ── Solved example header skip ────────────────────────────────────────────────
// "Example 3.1" or "EXAMPLE 3.1" ALONE on a line — skip the heading but keep content
const EXAMPLE_HEADER_RE = /^(EXAMPLE|Example|example)\s+\d+[\.\d]*\s*$/;

// ── Word counting ─────────────────────────────────────────────────────────────
function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

// ── Sentence-boundary split ───────────────────────────────────────────────────
/**
 * Given a paragraph string, finds the last sentence-ending position
 * that keeps the result under maxWords words.  Falls back to the full
 * paragraph if no sentence boundary exists.
 */
function splitAtSentence(
  text: string,
  maxWords: number
): { head: string; tail: string } {
  const words = text.trim().split(/\s+/);
  if (words.length <= maxWords) return { head: text.trim(), tail: "" };

  // Work backwards from maxWords to find a sentence end
  let splitIdx = maxWords;
  for (let i = maxWords - 1; i >= Math.floor(maxWords * 0.5); i--) {
    const w = words[i];
    if (/[.!?]"?$/.test(w)) {
      splitIdx = i + 1;
      break;
    }
  }

  const head = words.slice(0, splitIdx).join(" ");
  const tail = words.slice(splitIdx).join(" ");
  return { head, tail };
}

// ── Main chunking logic ───────────────────────────────────────────────────────
interface AccumulatedChapter {
  chapterNumber: number;
  chapterName:   string;
  lines:         Array<{ text: string; pageNumber: number; section: string }>;
}

function buildChunks(chapter: AccumulatedChapter): OutputChunk[] {
  const chunks: OutputChunk[] = [];
  let buffer       = "";
  let bufferPage   = chapter.lines[0]?.pageNumber ?? 0;
  let bufferSection= chapter.lines[0]?.section    ?? "";

  function flushBuffer(overrideSection?: string) {
    const text = buffer.trim();
    if (countWords(text) < 10) { buffer = ""; return; } // drop tiny fragments
    chunks.push({
      chapter_number: chapter.chapterNumber,
      chapter_name:   chapter.chapterName,
      section_name:   overrideSection ?? bufferSection,
      content_text:   text,
      page_number:    bufferPage,
    });
    buffer = "";
  }

  for (const { text, pageNumber, section } of chapter.lines) {
    // When section changes, flush current buffer
    if (section !== bufferSection && buffer.trim()) {
      flushBuffer();
      bufferSection = section;
      bufferPage    = pageNumber;
    }

    const incoming = text.trim();
    if (!incoming) continue;

    const combinedWords = countWords(buffer + " " + incoming);

    if (combinedWords <= TARGET_WORDS) {
      buffer += (buffer ? " " : "") + incoming;
      if (pageNumber > bufferPage) bufferPage = pageNumber;
    } else if (combinedWords <= MAX_WORDS) {
      // Still under hard cap — append and then flush
      buffer += (buffer ? " " : "") + incoming;
      if (pageNumber > bufferPage) bufferPage = pageNumber;
      flushBuffer();
      bufferPage    = pageNumber;
      bufferSection = section;
    } else {
      // Over MAX_WORDS — need to split at a sentence boundary
      if (buffer.trim()) {
        // Try to fit part of `incoming` into current buffer
        const available = MAX_WORDS - countWords(buffer);
        if (available > 20) {
          const { head, tail } = splitAtSentence(incoming, available);
          buffer += " " + head;
          flushBuffer();
          bufferPage    = pageNumber;
          bufferSection = section;
          // Remaining tail becomes seed of next buffer
          buffer = tail;
        } else {
          flushBuffer();
          bufferPage    = pageNumber;
          bufferSection = section;
          buffer        = incoming;
        }
      } else {
        // Buffer empty but incoming alone exceeds MAX_WORDS — split it
        let remainder = incoming;
        while (countWords(remainder) > MAX_WORDS) {
          const { head, tail } = splitAtSentence(remainder, MAX_WORDS);
          chunks.push({
            chapter_number: chapter.chapterNumber,
            chapter_name:   chapter.chapterName,
            section_name:   section,
            content_text:   head,
            page_number:    pageNumber,
          });
          remainder = tail;
          if (!tail) break;
        }
        buffer        = remainder;
        bufferPage    = pageNumber;
        bufferSection = section;
      }
    }
  }

  if (buffer.trim()) flushBuffer();
  return chunks;
}

// ── Entry point ───────────────────────────────────────────────────────────────
async function main() {
  console.log(`\nchunkBook.ts`);
  console.log(`  PDF:    ${absFile}`);
  console.log(`  Source: ${sourceArg}`);
  console.log(`  Class:  ${classArg}`);
  console.log(`  Output: ${absOutput}\n`);

  // 1. Parse PDF
  console.log("Parsing PDF...");
  const pdfBuffer = readFileSync(absFile);
  const pdf = await pdfParse(pdfBuffer, {
    // pagerender callback gives us per-page text with page numbers
  });

  // pdf-parse gives us all text in pdf.text and page count in pdf.numpages.
  // To get per-page text we re-parse with a custom pagerender.
  const pageTexts: string[] = [];
  await pdfParse(pdfBuffer, {
    pagerender: (pageData: any) => {
      return pageData.getTextContent().then((tc: any) => {
        // Reconstruct text preserving newlines between items
        let lastY: number | null = null;
        let text = "";
        for (const item of tc.items) {
          if (lastY !== null && Math.abs(item.transform[5] - lastY) > 5) {
            text += "\n";
          }
          text += item.str;
          lastY = item.transform[5];
        }
        pageTexts.push(text);
        return text;
      });
    },
  });

  const totalPages = pageTexts.length;
  console.log(`Total pages in PDF: ${totalPages}`);

  // --dump-pages: print raw lines from all pages then exit
  if (dumpPages) {
    const limit = totalPages;
    for (let i = 0; i < limit; i++) {
      console.log(`\n[PAGE ${i + 1}]`);
      const lines = pageTexts[i].split("\n").filter((l) => l.trim().length > 0);
      lines.slice(0, 20).forEach((l) => console.log(l));
    }
    process.exit(0);
  }

  // 2. Build noise set (repeating headers/footers)
  const noiseSet = buildNoiseSet(pageTexts, Math.max(5, Math.floor(totalPages * 0.1)));

  // 3. Process page by page — accumulate into chapters
  const chapters: AccumulatedChapter[] = [];
  let currentChapter: AccumulatedChapter | null = null;
  let pendingTitle             = false; // waiting for first title line after "CHAPTER N"
  let pendingTitleContinuation = false; // waiting for second line of a split title
  let pendingChapterNum        = 0;
  let currentSection      = "";
  let skippedPages        = 0;
  let processedPages      = 0;

  // DC Pandey: hints section detection.
  // The back-matter starts with a page whose first line is "N. Chapter Title" where N is
  // the FIRST chapter number of the book (1 for Vol 1, 11 for Vol 2) and the title contains
  // only letters/spaces/commas (no digits or math symbols).
  // This is computed dynamically from the minimum detected chapter number, so it
  // self-calibrates across volumes without any hardcoded chapter lists.
  let pastEndOfContent = false;

  for (let pageIdx = 0; pageIdx < pageTexts.length; pageIdx++) {
    const rawPage  = pageTexts[pageIdx];
    const pageNum  = pageIdx + 1;

    // Once hints/back-matter section begins, skip everything that follows.
    // Hints section detection: only check after 70% of the book is processed.
    // DC Pandey hints sections consistently start in the last ~25% of the PDF
    // (Vol 1: page 489/637 = 76.7%, Vol 2: page 530/686 = 77.3%).
    // This threshold prevents matching exercise problem lines like "11.Gravitational..."
    // that appear mid-book and coincidentally satisfy the pattern.
    const past70Pct = pageIdx >= Math.floor(pageTexts.length * 0.70);
    if (!pastEndOfContent && sourceArg === "dc_pandey" && chapters.length > 0 && past70Pct) {
      const firstLine = rawPage.split("\n").map((l) => l.trim()).find((l) => l.length > 0) ?? "";
      const hintsLineMatch = /^(\d+)\.\s*([A-Za-z][A-Za-z\s,'\-()]*)$/.exec(firstLine);
      const minChapterNum  = Math.min(...chapters.map((c) => c.chapterNumber));
      if (hintsLineMatch && parseInt(hintsLineMatch[1], 10) === minChapterNum) {
        pastEndOfContent = true;
        console.log(`  DC Pandey hints section detected at page ${pageNum} — skipping all remaining pages`);
      }
    }

    if (pastEndOfContent || isSkippablePage(rawPage)) {
      skippedPages++;
      continue;
    }

    const cleanPage = stripNoise(rawPage, noiseSet);
    processedPages++;

    // ── DC Pandey: page-level chapter opener detection ────────────────────────
    // Both Vol 1 and Vol 2 have "Chapter Contents" on every chapter opener page.
    // Vol 1: number at the bottom, title line(s) above it.
    // Vol 2: number at the top (first line), title derived from first section heading below.
    // Pre-scanning the whole page avoids the look-behind limitation of line-by-line processing.
    let dcPandeyChapterDetectedThisPage = false;
    if (sourceArg === "dc_pandey") {
      const rawLines = cleanPage.split("\n").map((l) => l.trim()).filter(Boolean);
      if (rawLines.includes("Chapter Contents")) {
        // Find the standalone 2-digit chapter number within the first 15 non-empty lines.
        const numIdx = rawLines.findIndex((l, i) => i < 15 && /^(0[1-9]|[1-9]\d)$/.test(l));
        if (numIdx !== -1) {
          const chapterNum = parseInt(rawLines[numIdx], 10);
          let resolvedTitle = "";

          // Vol 1 style: collect word-only lines that appear BEFORE the number.
          const before = rawLines.slice(0, numIdx).filter(
            (l) =>
              l !== "Chapter Contents" &&
              !/^(t\.me|Telegram)/i.test(l) &&
              /^[A-Za-z][A-Za-z\s,'\-()]*$/.test(l) &&
              !/\d/.test(l) &&
              l.length >= 2
          );
          if (before.length > 0) {
            resolvedTitle = before.join(" ");
          } else {
            // Vol 2 style: chapter title appears on lines AFTER the "Chapter Contents" marker.
            // e.g. "Chapter Contents" → "Gravitation" → "Telegram @neetquestionpaper"
            const ccIdx = rawLines.indexOf("Chapter Contents");
            if (ccIdx !== -1) {
              const titleLines = rawLines.slice(ccIdx + 1).filter(
                (l) =>
                  !/^(t\.me|Telegram)/i.test(l) &&
                  /^[A-Za-z][A-Za-z\s,'\-()]*$/.test(l) &&
                  !/\d/.test(l) &&
                  l.length >= 2
              );
              if (titleLines.length > 0) resolvedTitle = titleLines.join(" ");
            }
          }

          if (resolvedTitle) {
            const overrideName = (MANUAL_CHAPTER_OVERRIDES[sourceArg] ?? {})[chapterNum];
            const finalTitle   = overrideName ?? cleanName(resolvedTitle);
            if (debugChapters) {
              console.log(`[DEBUG] p${pageNum} DC Pandey ch${chapterNum} (ChapterContents pre-scan) title: ${JSON.stringify(finalTitle)}`);
            }
            currentChapter = { chapterNumber: chapterNum, chapterName: finalTitle, lines: [] };
            chapters.push(currentChapter);
            currentSection = "";
            dcPandeyChapterDetectedThisPage = true;
          }
        } else {
          // Waves/Thermodynamics style: no standalone chapter number; it's embedded in section
          // headings like "17.1  Introduction", "18.1  Principle of Superposition".
          // Extract chapter number from the first such heading, then grab title after "Chapter Contents".
          const secM = rawLines.slice(0, 15).map((l) => /^(\d+)\.\d+/.exec(l)).find((m) => m !== null);
          if (secM) {
            const chapterNum = parseInt(secM[1], 10);
            const ccIdx = rawLines.indexOf("Chapter Contents");
            if (ccIdx !== -1) {
              const titleLines = rawLines.slice(ccIdx + 1).filter(
                (l) =>
                  !/^(t\.me|Telegram)/i.test(l) &&
                  /^[A-Za-z][A-Za-z\s,'\-()]*$/.test(l) &&
                  !/\d/.test(l) &&
                  l.length >= 2
              );
              if (titleLines.length > 0) {
                const resolvedTitle = titleLines.join(" ");
                const overrideName  = (MANUAL_CHAPTER_OVERRIDES[sourceArg] ?? {})[chapterNum];
                const finalTitle    = overrideName ?? cleanName(resolvedTitle);
                if (debugChapters) {
                  console.log(`[DEBUG] p${pageNum} DC Pandey ch${chapterNum} (section-heading pre-scan) title: ${JSON.stringify(finalTitle)}`);
                }
                currentChapter = { chapterNumber: chapterNum, chapterName: finalTitle, lines: [] };
                chapters.push(currentChapter);
                currentSection = "";
                dcPandeyChapterDetectedThisPage = true;
              }
            }
          }
        }
      }
    }

    const lines = cleanPage.split("\n");
    let lastMeaningfulLine = "";     // DC Pandey inline fallback: title above a zero-padded number
    let prevMeaningfulLine = "";    // DC Pandey: line before lastMeaningfulLine (for split titles)
    let pageLineIdx = 0;            // DC Pandey: non-empty line counter within page

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line) continue;
      pageLineIdx++;

      // Strip bare page numbers (a lone number on a line).
      // For DC Pandey, preserve zero-padded chapter numbers (01–09, 10–99).
      if (/^\d+$/.test(line)) {
        if (sourceArg !== "dc_pandey" || !/^(0[1-9]|[1-9]\d)$/.test(line)) continue;
      }

      // Track last meaningful line for DC Pandey chapter title detection.
      // Skip: section refs ("1.1 …"), "Chapter Contents", t.me/ links, bare numbers.
      if (
        sourceArg === "dc_pandey" &&
        !/^\d+$/.test(line) &&
        line !== "Chapter Contents" &&
        !line.startsWith("t.me/") &&
        !/^\d+\.\d+/.test(line)
      ) {
        prevMeaningfulLine = lastMeaningfulLine;
        lastMeaningfulLine = line;
      }

      // Resolve pending chapter title — stage 2: append continuation line
      if (pendingTitleContinuation) {
        if (currentChapter) {
          currentChapter.chapterName = cleanName(currentChapter.chapterName + " " + line);
          if (debugChapters) {
            console.log(`[DEBUG] p${pageNum} ch${currentChapter.chapterNumber} title continued: ${JSON.stringify(currentChapter.chapterName)}`);
          }
        }
        pendingTitleContinuation = false;
        currentSection = "";
        continue;
      }

      // Resolve pending chapter title — stage 1: first non-blank line after "CHAPTER N"
      if (pendingTitle) {
        if (currentChapter) {
          currentChapter.chapterName = cleanName(line);
          if (needsTitleContinuation(currentChapter.chapterName)) {
            // Title likely split across two lines — grab the next line too
            pendingTitleContinuation = true;
            if (debugChapters) {
              console.log(`[DEBUG] p${pageNum} ch${currentChapter.chapterNumber} title partial (awaiting continuation): ${JSON.stringify(currentChapter.chapterName)}`);
            }
          } else {
            if (debugChapters) {
              console.log(`[DEBUG] p${pageNum} ch${currentChapter.chapterNumber} title resolved: ${JSON.stringify(currentChapter.chapterName)}`);
            }
          }
        }
        pendingTitle   = false;
        currentSection = "";
        continue;
      }

      // Check for chapter boundary
      const chapterMatch = detectChapter(line);
      if (chapterMatch) {
        if (debugChapters) {
          console.log(`[DEBUG] p${pageNum} ch${chapterMatch.chapterNumber} titlePending=${chapterMatch.titlePending} | raw: ${JSON.stringify(line)}`);
        }
        currentChapter = {
          chapterNumber: chapterMatch.chapterNumber,
          chapterName:   cleanName(chapterMatch.chapterName),
          lines:         [],
        };
        chapters.push(currentChapter);
        currentSection = "";

        if (chapterMatch.titlePending) {
          pendingTitle       = true;
          pendingChapterNum  = chapterMatch.chapterNumber;
        }
        continue;
      }

      // DC Pandey: zero-padded chapter number alone on a line (e.g. "01", "14").
      // Guards: (1) must appear within first 12 non-empty lines of the page — chapter
      // openers have the number near the top; equation content has numbers anywhere.
      // (2) lastMeaningfulLine must look like a title — starts with a letter, ≥5 chars,
      // no math operators/symbols (=, +, ∆, ∴, ⇒, …).
      // Whitelist: chapter titles contain only letters, spaces, commas, apostrophes,
      // hyphens, and parentheses — anything else (digits, math symbols, Unicode ops) is noise.
      const looksLikeTitle =
        lastMeaningfulLine.length >= 5 &&
        /^[A-Za-z][A-Za-z\s,'\-()]*$/.test(lastMeaningfulLine);
      // Inline fallback: only fires for zero-padded single-digit chapters (01-09).
      // Two-digit chapter numbers (10+) are handled exclusively by the pre-scan above,
      // since bare "10", "20" etc. are too common in equations to be safely detected inline.
      if (sourceArg === "dc_pandey" && !dcPandeyChapterDetectedThisPage && /^0[1-9]$/.test(line) && pageLineIdx <= 12 && looksLikeTitle) {
        const chapterNum = parseInt(line, 10);
        // Stitch split titles: PDF may break a chapter title across two lines.
        // Case A: last line starts with a conjunction  ("and Power" ← "Work, Energy")
        // Case B: prev line ends with a conjunction    ("Units and" + "Dimensions")
        const STARTS_WITH_CONJ  = /^(and|or|of|in|on|by|for|the|to|with|energy|power)\b/i;
        const ENDS_WITH_CONJ    = /\b(and|or|of|in|on|by|for|the|to|with|due)\s*$/i;
        const prevIsWordOnly    = prevMeaningfulLine.length >= 2 && /^[A-Za-z][A-Za-z\s,'\-()]*$/.test(prevMeaningfulLine);
        let resolvedTitle = lastMeaningfulLine;
        if (prevMeaningfulLine && prevIsWordOnly && (STARTS_WITH_CONJ.test(lastMeaningfulLine) || ENDS_WITH_CONJ.test(prevMeaningfulLine))) {
          resolvedTitle = prevMeaningfulLine + " " + lastMeaningfulLine;
        }
        if (debugChapters) {
          console.log(`[DEBUG] p${pageNum} DC Pandey ch${chapterNum} title: ${JSON.stringify(resolvedTitle)}`);
        }
        currentChapter = {
          chapterNumber: chapterNum,
          chapterName:   cleanName(resolvedTitle),
          lines:         [],
        };
        chapters.push(currentChapter);
        currentSection = "";
        continue;
      }

      // Check for section heading
      const sectionMatch = detectSection(line);
      if (sectionMatch) {
        currentSection = sectionMatch;
        // Don't skip the line — fall through so section heading text is included
      }

      // Skip bare example headers ("Example 3.1" alone) but keep the content
      if (EXAMPLE_HEADER_RE.test(line)) continue;

      // Accumulate into current chapter (or a preamble bucket if no chapter yet)
      if (!currentChapter) {
        // Content before the first detected chapter — skip (front matter)
        continue;
      }

      currentChapter.lines.push({
        text:       line,
        pageNumber: pageNum,
        section:    currentSection,
      });
    }
  }

  console.log(`Pages processed: ${processedPages}  |  Pages skipped: ${skippedPages}`);
  console.log(`Chapters detected: ${chapters.length}`);

  if (chapters.length === 0) {
    console.error("\nERROR: No chapters detected. Check that the PDF uses recognisable chapter headings.");
    console.error("Expected patterns: 'CHAPTER N', 'Chapter N', or 'CHAPTER N — Title'");
    process.exit(1);
  }

  // 4. Build output chunks
  const rawChunks: OutputChunk[] = [];
  for (const chapter of chapters) {
    const chunks = buildChunks(chapter);
    rawChunks.push(...chunks);
  }

  // Deduplicate: if the same chapter_number appears more than once (TOC leak),
  // keep only chunks from the LAST contiguous run — that is the real content.

  // Group chunks by chapter_number, discard all but the last contiguous run
  const chunksByChapter = new Map<number, OutputChunk[]>();
  for (const chunk of rawChunks) {
    if (!chunksByChapter.has(chunk.chapter_number)) {
      chunksByChapter.set(chunk.chapter_number, []);
    }
    chunksByChapter.get(chunk.chapter_number)!.push(chunk);
  }

  // For each chapter_number, split its chunks into contiguous runs (separated by
  // chunks from other chapters) and keep only the last run.
  const allChunks: OutputChunk[] = [];
  const dedupedChapters: Array<{ chapterNumber: number; chapterName: string }> = [];

  // Preserve original chapter order (by first page seen) using chapters array
  const seenChapterNums = new Set<number>();
  const orderedNums: number[] = [];
  for (const ch of chapters) {
    if (!seenChapterNums.has(ch.chapterNumber)) {
      seenChapterNums.add(ch.chapterNumber);
      orderedNums.push(ch.chapterNumber);
    }
  }

  for (const chNum of orderedNums) {
    const allForChapter = chunksByChapter.get(chNum) ?? [];
    if (allForChapter.length === 0) continue;

    // Split into runs: a new run starts when we see another chapter's chunks
    // interleaved. Since rawChunks is in page order, we just scan rawChunks
    // and collect contiguous blocks for this chapter_number.
    const runs: OutputChunk[][] = [];
    let currentRun: OutputChunk[] = [];
    for (const chunk of rawChunks) {
      if (chunk.chapter_number === chNum) {
        currentRun.push(chunk);
      } else if (currentRun.length > 0) {
        runs.push(currentRun);
        currentRun = [];
      }
    }
    if (currentRun.length > 0) runs.push(currentRun);

    // Keep the last run (actual content, not TOC mention)
    const keepRun = runs[runs.length - 1];

    // Re-assign chunk_index sequentially within this run
    keepRun.forEach((chunk, idx) => { (chunk as any).chunk_index_assigned = idx; });

    dedupedChapters.push({ chapterNumber: chNum, chapterName: keepRun[0].chapter_name });
    allChunks.push(...keepRun);
  }

  if (chapters.length !== dedupedChapters.length) {
    console.log(
      `Deduplication: removed ${chapters.length - dedupedChapters.length} duplicate chapter entry/entries (TOC leak)`
    );
  }

  // ── Gap-fill: recover chapters whose headers were never detected ────────────
  // Scan for gaps in the detected chapter sequence.  For each gap chapter N:
  //   1. Look up its name in MANUAL_CHAPTER_OVERRIDES.
  //   2. Find the "host" chapter that swallowed its content (the largest
  //      detected chapter number < N).
  //   3. Split the host's chunks at the midpoint page between the host's first
  //      page and the next-detected chapter's first page, re-assigning the
  //      upper half to chapter N.
  const detectedNums = new Set(dedupedChapters.map((c) => c.chapterNumber));
  const sourceOverrides = MANUAL_CHAPTER_OVERRIDES[sourceArg!] ?? {};

  if (Object.keys(sourceOverrides).length > 0) {
    const minCh = Math.min(...detectedNums);
    const maxCh = Math.max(...detectedNums);

    for (let n = minCh + 1; n < maxCh; n++) {
      if (detectedNums.has(n)) continue;

      const overrideName = sourceOverrides[n];
      if (!overrideName) {
        console.warn(`⚠  Chapter ${n} missing from output — no manual override defined for ${sourceArg} ch${n}`);
        continue;
      }

      // Find the closest detected chapter below and above N
      let prevNum = n - 1;
      while (prevNum >= minCh && !detectedNums.has(prevNum)) prevNum--;
      let nextNum = n + 1;
      while (nextNum <= maxCh && !detectedNums.has(nextNum)) nextNum++;

      if (prevNum < minCh) {
        console.warn(`  Cannot fill ch${n}: no detected chapter before it`);
        continue;
      }

      // Collect host chapter's chunks sorted by page
      const hostChunks = allChunks
        .filter((c) => c.chapter_number === prevNum)
        .sort((a, b) => a.page_number - b.page_number);

      if (hostChunks.length < 2) {
        console.warn(`  Cannot fill ch${n}: host ch${prevNum} has too few chunks to split`);
        continue;
      }

      // Midpoint page: halfway between host's first page and next chapter's first page
      const hostFirstPage = hostChunks[0].page_number;
      const nextFirstPage = allChunks
        .filter((c) => c.chapter_number === nextNum)
        .reduce((min, c) => Math.min(min, c.page_number), Infinity);
      const midPage = isFinite(nextFirstPage)
        ? Math.floor((hostFirstPage + nextFirstPage) / 2)
        : hostChunks[Math.floor(hostChunks.length / 2)].page_number;

      // Re-assign host chunks at or beyond midPage to chapter N
      let reassigned = 0;
      for (const chunk of allChunks) {
        if (chunk.chapter_number === prevNum && chunk.page_number >= midPage) {
          chunk.chapter_number = n;
          chunk.chapter_name   = overrideName;
          reassigned++;
        }
      }

      dedupedChapters.push({ chapterNumber: n, chapterName: overrideName });
      detectedNums.add(n);
      console.log(
        `  Gap-fill: inserted ch${n} "${overrideName}" — reassigned ${reassigned} chunk(s) from ch${prevNum} (split at page ${midPage})`
      );
    }
  }

  // Apply name overrides to all detected chapters (fixes OCR typos, canonical names).
  // MANUAL_CHAPTER_OVERRIDES doubles as a name-correction table, not only gap-fill.
  for (const chunk of allChunks) {
    const overrideName = sourceOverrides[chunk.chapter_number];
    if (overrideName) chunk.chapter_name = overrideName;
  }
  for (const ch of dedupedChapters) {
    const overrideName = sourceOverrides[ch.chapterNumber];
    if (overrideName) ch.chapterName = overrideName;
  }

  // Sort chapters and chunks by chapter_number, then page_number
  dedupedChapters.sort((a, b) => a.chapterNumber - b.chapterNumber);
  allChunks.sort((a, b) =>
    a.chapter_number !== b.chapter_number
      ? a.chapter_number - b.chapter_number
      : a.page_number - b.page_number
  );

  console.log(`Total chunks after deduplication: ${allChunks.length}\n`);

  // 5. Validation summary table
  console.log("Chapter summary:");
  console.log(
    "  " +
    "Ch#".padEnd(5) + " " +
    "Chapter Name".padEnd(45) + " " +
    "Chunks"
  );
  console.log("  " + "-".repeat(60));

  for (const { chapterNumber, chapterName } of dedupedChapters) {
    const count = allChunks.filter((c) => c.chapter_number === chapterNumber).length;
    const nameDisplay = chapterName.slice(0, 44).padEnd(44);
    const flag = count < 3 ? " ⚠ WARNING: too few chunks" : "";
    console.log(
      `  ${String(chapterNumber).padEnd(5)} ${nameDisplay}  ${String(count).padStart(4)}${flag}`
    );
  }

  const warnChapters = dedupedChapters.filter(
    (ch) => allChunks.filter((c) => c.chapter_number === ch.chapterNumber).length < 3
  );
  if (warnChapters.length > 0) {
    console.log(
      `\n⚠  ${warnChapters.length} chapter(s) have fewer than 3 chunks — chapter detection may have failed for them.`
    );
    console.log("   Affected chapters:", warnChapters.map((c) => c.chapterNumber).join(", "));
  }

  // 6. Write output
  writeFileSync(absOutput, JSON.stringify(allChunks, null, 2), "utf-8");
  console.log(`\nOutput written to: ${absOutput}`);
  console.log(`Run: npx tsx src/scripts/ingestBook.ts --source ${sourceArg} --file ${absOutput} --class ${classArg}`);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
