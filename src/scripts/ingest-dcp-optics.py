"""
DC Pandey — Optics & Modern Physics  ingestion script
=======================================================
Extracts text from the DC Pandey Optics PDF, splits into ~350-word chunks,
detects section headings, and writes a JSONL file ready for
embed-json-chunks.mjs to embed + insert into ncert_content.

PDF structure (559 pages, 0-indexed PDF page ranges):
  Electromagnetic Waves              : idx   6 –  34
  Reflection of Light                : idx  35 –  84
  Refraction of Light                : idx  85 – 203
  Interference and Diffraction       : idx 204 – 264
  Modern Physics - I                 : idx 265 – 337
  Modern Physics - II                : idx 338 – 387
  Semiconductors                     : idx 388 – 427
  Communication System               : idx 428 – 445
  Back matter (hints/exercises)      : idx 446+     → EXCLUDED

Usage:
    python src/scripts/ingest-dcp-optics.py \\
        --pdf "C:/Tutor/books/DC Pandey - Understanding Physics - Optics & Modern Physics.pdf" \\
        --output dcp_optics_chunks.jsonl

    # dry-run:
    python src/scripts/ingest-dcp-optics.py --pdf <path> --dry-run

Then embed + insert:
    node src/scripts/embed-json-chunks.mjs dcp_optics_chunks.jsonl \\
        --source-book=dc_pandey --class-level=12

Setup:
    pip install pdfplumber
"""

import argparse
import json
import re
import sys

try:
    import pdfplumber
except ImportError:
    print("ERROR: pdfplumber not installed.  Run: pip install pdfplumber", file=sys.stderr)
    sys.exit(1)


# ── Chapter PDF page index ranges (0-indexed) ────────────────────────────────
# (start_idx, end_idx_inclusive, chapter_number, chapter_name)
CHAPTER_RANGES: list[tuple[int, int, int, str]] = [
    (   6,   34, 39, "Electromagnetic Waves"),
    (  35,   84, 33, "Reflection of Light"),
    (  85,  203, 34, "Refraction of Light"),
    ( 204,  264, 38, "Interference and Diffraction of Light"),
    ( 265,  337, 40, "Modern Physics - I"),
    ( 338,  387, 42, "Modern Physics - II"),
    ( 388,  427, 43, "Semiconductors"),
    ( 428,  445, 44, "Communication System"),
]

MAX_PDF_IDX = 445   # page 446 in 1-indexed → back matter begins at 446

# ── Chunking parameters ────────────────────────────────────────────────────────
CHUNK_WORDS     = 350
OVERLAP_WORDS   = 30
MIN_CHUNK_CHARS = 80
MAX_PAGE_CHARS  = 3000   # truncate runaway pages

# ── Junk-line filters ──────────────────────────────────────────────────────────
JUNK_PATTERNS = [
    r"^\s*\d{1,3}\s*$",
    r"^\s*(DC\s+Pandey|Pandey)\s*$",
    r"^\s*Physics\s*$",
    r"^\s*Optics\s*[&and]*\s*Modern\s*Physics\s*$",
    r"^\s*Understanding\s+Physics\s*$",
    r"^\s*www\.\S+\s*$",
    r"^\s*[©]\s*",
    r"^\s*Electricity\s*[&and]*\s*Magnetism\s*$",
]


def is_junk_line(line: str) -> bool:
    stripped = line.strip()
    if not stripped:
        return True
    garbage = sum(1 for c in stripped if ord(c) > 0x2000 or (ord(c) < 32 and c not in "\t"))
    if stripped and garbage / max(len(stripped), 1) > 0.15:
        return True
    for pat in JUNK_PATTERNS:
        if re.match(pat, stripped, re.IGNORECASE):
            return True
    return False


def clean_text(raw: str) -> str:
    text = raw.replace("\x00", "").replace("\ufffd", "")
    text = re.sub(r"[\x01-\x08\x0b\x0c\x0e-\x1f\x7f]", "", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def pdf_idx_to_chapter(pdf_idx: int) -> tuple[int, str] | None:
    for start, end, num, name in CHAPTER_RANGES:
        if start <= pdf_idx <= end:
            return (num, name)
    return None


# ── Section-heading detection ─────────────────────────────────────────────────
_SECTION_RE_TEMPLATES = [
    r"(Introductory\s+Exercise\s+\d{2}\.\d{1,2}[^\n]{0,60})",
    r"(\d{2}\.\d{1,2}\s+[A-Z][^\n]{0,60})",
    r"(Type\s+\d+\s*[:\-–—][^\n]{0,60})",
    r"(Solved\s+Examples?)",
    r"(Extra\s+Points?\s+to\s+Remember[^\n]{0,40})",
    r"(Exercise\s+\d+[^\n]{0,40})",
    r"(Note\s*[:\-–]\s*[A-Z][^\n]{0,60})",
]
_SECTION_PATTERNS = [re.compile(p) for p in _SECTION_RE_TEMPLATES]


def detect_section_name(chunk_text: str) -> str | None:
    head = chunk_text[:600]
    for pat in _SECTION_PATTERNS:
        m = pat.search(head)
        if m:
            result = m.group(1).strip()
            result = re.sub(r"[\s,;:]+$", "", result)
            return result[:120]
    return None


# ── Chunking ──────────────────────────────────────────────────────────────────
def chunk_text(text: str, chunk_words: int = CHUNK_WORDS,
               overlap: int = OVERLAP_WORDS) -> list[str]:
    words = text.split()
    if not words:
        return []

    chunks: list[str] = []
    start = 0
    while start < len(words):
        end = min(start + chunk_words, len(words))
        if end < len(words):
            candidate = " ".join(words[start:end])
            para_end = candidate.rfind("\n\n", max(0, len(candidate) - 300))
            if para_end == -1:
                para_end = candidate.rfind(". ", max(0, len(candidate) - 200))
            if para_end != -1:
                trimmed = candidate[:para_end + 1].strip()
                if len(trimmed.split()) >= 200:
                    end = start + len(trimmed.split())

        chunk = " ".join(words[start:end])
        if len(chunk) >= MIN_CHUNK_CHARS:
            chunks.append(chunk)
        advance = max(1, (end - start) - overlap)
        start += advance

    return chunks


# ── Main extraction ────────────────────────────────────────────────────────────
def extract(pdf_path: str) -> list[dict]:
    chapter_pages: dict[str, list[str]] = {}
    chapter_meta:  dict[str, tuple[int, str]] = {}
    chapter_order: list[str] = []
    pages_skipped = 0

    with pdfplumber.open(pdf_path) as pdf:
        total_pdf_pages = len(pdf.pages)
        print(f"  PDF has {total_pdf_pages} pages")

        for pdf_idx, page in enumerate(pdf.pages):
            if pdf_idx > MAX_PDF_IDX:
                pages_skipped += 1
                continue

            chapter_info = pdf_idx_to_chapter(pdf_idx)
            if chapter_info is None:
                continue

            ch_num, ch_name = chapter_info

            raw = page.extract_text() or ""
            clean_lines = [l for l in raw.splitlines() if not is_junk_line(l)]
            cleaned = clean_text("\n".join(clean_lines))
            if not cleaned:
                continue

            if ch_name not in chapter_pages:
                chapter_pages[ch_name] = []
                chapter_meta[ch_name] = (ch_num, ch_name)
                chapter_order.append(ch_name)

            if len(cleaned) > MAX_PAGE_CHARS:
                cleaned = cleaned[:MAX_PAGE_CHARS]

            chapter_pages[ch_name].append(cleaned)

    if pages_skipped:
        print(f"  Skipped {pages_skipped} PDF pages (back matter after idx {MAX_PDF_IDX})")

    records: list[dict] = []
    for ch_name in chapter_order:
        ch_num, _name = chapter_meta[ch_name]
        combined = "\n\n".join(chapter_pages[ch_name])
        chunks = chunk_text(combined)

        print(f"    Ch {ch_num:2d}  {ch_name:<45s}  {len(chapter_pages[ch_name]):3d} pages -> {len(chunks):3d} chunks")

        for idx, chunk in enumerate(chunks):
            wc = len(chunk.split())
            section = detect_section_name(chunk)
            records.append({
                "content_text":   chunk,
                "class_level":    "12",
                "part":           "1",
                "chapter_number": ch_num,
                "chapter_name":   ch_name,
                "section_name":   section,
                "word_count":     wc,
                "chunk_index":    idx,
                "source_book":    "dc_pandey",
            })

    return records


# ── CLI ────────────────────────────────────────────────────────────────────────
def main():
    parser = argparse.ArgumentParser(
        description="Extract DC Pandey Optics & Modern Physics PDF into JSONL"
    )
    parser.add_argument(
        "--pdf",
        default="C:/Tutor/books/DC Pandey - Understanding Physics - Optics & Modern Physics.pdf",
        help="Path to DC Pandey Optics PDF",
    )
    parser.add_argument("--output", default="dcp_optics_chunks.jsonl")
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    print(f"\nDC Pandey — Optics & Modern Physics  extraction")
    print(f"  PDF:    {args.pdf}")
    print(f"  Output: {args.output if not args.dry_run else '(dry run — no file)'}")
    print()

    records = extract(args.pdf)

    print(f"\n{'='*60}")
    print(f"Total chunks extracted: {len(records)}")
    print(f"\nChapter summary:")

    from collections import Counter
    by_chapter = Counter(r["chapter_name"] for r in records)
    for ch_name, count in sorted(by_chapter.items(), key=lambda x: x[0]):
        total_words = sum(r["word_count"] for r in records if r["chapter_name"] == ch_name)
        ch_num = next(r["chapter_number"] for r in records if r["chapter_name"] == ch_name)
        print(f"  Ch {ch_num:2d}  {ch_name:<45s}  {count:3d} chunks  (~{total_words:,} words)")

    if args.dry_run:
        print("\n[DRY RUN] No file written.")
        return

    with open(args.output, "w", encoding="utf-8") as f:
        for rec in records:
            f.write(json.dumps(rec, ensure_ascii=False) + "\n")

    print(f"\nWritten: {args.output}  ({len(records)} chunks)")
    print(f"\nNext step:")
    print(f"  node src/scripts/embed-json-chunks.mjs {args.output} --source-book=dc_pandey --class-level=12")


if __name__ == "__main__":
    main()
