"""
DC Pandey — Waves & Thermodynamics  ingestion script
=====================================================
Extracts text from the DC Pandey PDF, splits into ~300-word chunks,
detects section headings, and writes a JSONL file ready for
embed-dc-pandey.mjs to embed + insert into ncert_content.

Usage:
    python src/scripts/ingest-dc-pandey.py \\
        --pdf /mnt/user-data/uploads/DC_Pandey_-_Understanding_Physics_-_Waves___Thermodynamics.pdf \\
        --output dc_pandey_chunks.jsonl

    # dry-run (print chapter summary only, no file written):
    python src/scripts/ingest-dc-pandey.py --pdf <path> --dry-run

Then embed + insert:
    node src/scripts/embed-dc-pandey.mjs dc_pandey_chunks.jsonl

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


# ── Chapter page-range table ──────────────────────────────────────────────────
# (start_page, end_page, chapter_number, chapter_name)
# Page numbers are the BOOK page numbers printed in the DC Pandey PDF.
# Content beyond page 364 (hints/answers section) is excluded.

CHAPTER_RANGES: list[tuple[int, int, int, str]] = [
    (14,  63,  17, "Wave Motion"),
    (64,  111, 18, "Superposition of Waves"),
    (112, 183, 19, "Sound Waves"),
    (184, 215, 20, "Thermometry and Thermal Expansion"),
    (216, 249, 20, "Kinetic Theory of Gases"),
    (250, 319, 21, "Laws of Thermodynamics"),
    (320, 364, 22, "Calorimetry and Heat Transfer"),
]

MAX_BOOK_PAGE = 364   # hard stop — do not ingest hints/answers after this

# ── Chunking parameters ────────────────────────────────────────────────────────
CHUNK_WORDS   = 350   # target chunk size (within 300-400 band)
OVERLAP_WORDS = 30    # sentence-level overlap between adjacent chunks
MIN_CHUNK_CHARS = 80

# ── Junk-line filters ──────────────────────────────────────────────────────────
JUNK_PATTERNS = [
    r"^\s*\d{1,3}\s*$",                  # bare page numbers
    r"^\s*(DC\s+Pandey|Pandey)\s*$",     # book/author name alone
    r"^\s*Physics\s*$",
    r"^\s*Waves?\s*&?\s*Thermodynamics\s*$",
    r"^\s*Understanding\s+Physics\s*$",
    r"^\s*www\.\S+\s*$",                 # URLs
    r"^\s*[©]\s*",
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


# ── Book-page-number detection ────────────────────────────────────────────────

def extract_book_page_number(text: str) -> int | None:
    """
    DC Pandey prints the book page number at the very top-left or bottom-right
    of each page.  We scan the first 5 and last 5 non-empty lines for a bare
    integer in a plausible book-page range (10–400).
    """
    lines = [l.strip() for l in text.splitlines() if l.strip()]
    candidates = lines[:5] + lines[-5:]
    for line in candidates:
        m = re.match(r"^(\d{1,3})\s*$", line)
        if m:
            n = int(m.group(1))
            if 10 <= n <= 400:
                return n
    return None


def book_page_to_chapter(book_page: int) -> tuple[int, str] | None:
    """Return (chapter_number, chapter_name) for a given book page, or None."""
    for start, end, num, name in CHAPTER_RANGES:
        if start <= book_page <= end:
            return (num, name)
    return None


# ── Section-heading detection ─────────────────────────────────────────────────

# Ordered by specificity — first match wins.
_SECTION_RE_TEMPLATES = [
    r"(Introductory\s+Exercise\s+\d{2}\.\d{1,2}[^\n]{0,60})",
    r"(\d{2}\.\d{1,2}\s+[A-Z][^\n]{0,60})",            # e.g. "17.3 Speed of Wave"
    r"(Type\s+\d+\s*[:\-–—][^\n]{0,60})",              # e.g. "Type 1 : Based on…"
    r"(Solved\s+Examples?)",
    r"(Extra\s+Points?\s+to\s+Remember[^\n]{0,40})",
    r"(Exercise\s+\d+[^\n]{0,40})",
    r"(Note\s*[:\-–]\s*[A-Z][^\n]{0,60})",             # "Note : ..."
]

_SECTION_PATTERNS = [re.compile(p) for p in _SECTION_RE_TEMPLATES]


def detect_section_name(chunk_text: str) -> str | None:
    """Return the first section heading found in the opening 600 chars of a chunk."""
    head = chunk_text[:600]
    for pat in _SECTION_PATTERNS:
        m = pat.search(head)
        if m:
            # Trim to 120 chars max; strip trailing punctuation
            result = m.group(1).strip()
            result = re.sub(r"[\s,;:]+$", "", result)
            return result[:120]
    return None


# ── Chunking ─────────────────────────────────────────────────────────────────

def chunk_text(text: str, chunk_words: int = CHUNK_WORDS,
               overlap: int = OVERLAP_WORDS) -> list[str]:
    """
    Split `text` into chunks of ~`chunk_words` words with `overlap` word
    overlap between consecutive chunks.  Never splits mid-sentence when a
    nearby paragraph break is available.
    """
    words = text.split()
    if not words:
        return []

    chunks: list[str] = []
    start = 0
    while start < len(words):
        end = min(start + chunk_words, len(words))

        # Try to end at a paragraph break (double-newline in the joined text)
        # by scanning ±30 words around the target boundary.
        if end < len(words):
            candidate = " ".join(words[start:end])
            # Look for a sentence/paragraph end near the boundary
            para_end = candidate.rfind("\n\n", max(0, len(candidate) - 300))
            if para_end == -1:
                para_end = candidate.rfind(". ", max(0, len(candidate) - 200))
            if para_end != -1:
                # Trim to that boundary
                trimmed = candidate[:para_end + 1].strip()
                if len(trimmed.split()) >= 200:   # don't trim too aggressively
                    words_in_trimmed = len(trimmed.split())
                    end = start + words_in_trimmed

        chunk = " ".join(words[start:end])
        if len(chunk) >= MIN_CHUNK_CHARS:
            chunks.append(chunk)
        start = start + (end - start) - overlap

    return chunks


# ── Main extraction ────────────────────────────────────────────────────────────

def extract_dc_pandey(pdf_path: str) -> list[dict]:
    """
    Extract DC Pandey PDF into a list of chunk dicts ready for embedding.

    Strategy:
      1. For each PDF page, extract text and detect the BOOK page number.
      2. Map the book page to a chapter via CHAPTER_RANGES.
      3. Pages whose book number is > MAX_BOOK_PAGE are skipped.
      4. Pages with no detectable book number are assigned to the current chapter
         (carry-forward).
      5. After all pages, each chapter's text is chunked independently.
    """
    # chapter_key → ordered list of (book_page_num, cleaned_text)
    # Use chapter_name as key to preserve Chapter-20 split.
    chapter_pages: dict[str, list[tuple[int, str]]] = {}
    chapter_meta: dict[str, tuple[int, str]] = {}   # chapter_name → (number, name)
    chapter_order: list[str] = []

    current_chapter_name: str | None = None
    current_chapter_number: int | None = None
    pages_skipped_after_max = 0
    pages_no_book_num = 0

    with pdfplumber.open(pdf_path) as pdf:
        total_pdf_pages = len(pdf.pages)
        print(f"  PDF has {total_pdf_pages} pages")

        for pdf_idx, page in enumerate(pdf.pages):
            raw = page.extract_text() or ""
            book_page = extract_book_page_number(raw)

            # Hard stop at end of physics content
            if book_page is not None and book_page > MAX_BOOK_PAGE:
                pages_skipped_after_max += 1
                continue

            # Determine chapter
            chapter_info = book_page_to_chapter(book_page) if book_page else None

            if chapter_info:
                ch_num, ch_name = chapter_info
                current_chapter_number = ch_num
                current_chapter_name = ch_name
            elif current_chapter_name is None:
                # Pre-content pages (cover, TOC) — skip
                continue
            else:
                pages_no_book_num += 1
                # Carry forward current chapter

            # Clean text
            clean_lines = [l for l in raw.splitlines() if not is_junk_line(l)]
            cleaned = clean_text("\n".join(clean_lines))
            if not cleaned:
                continue

            key = current_chapter_name  # unique per Chapter-20 split because name differs
            if key not in chapter_pages:
                chapter_pages[key] = []
                chapter_meta[key] = (current_chapter_number, current_chapter_name)
                chapter_order.append(key)

            chapter_pages[key].append((book_page or 0, cleaned))

    if pages_skipped_after_max:
        print(f"  Skipped {pages_skipped_after_max} PDF pages after book page {MAX_BOOK_PAGE} (hints/answers)")
    if pages_no_book_num:
        print(f"  {pages_no_book_num} pages had no detectable book-page number (chapter carried forward)")

    # ── Chunk each chapter independently ──────────────────────────────────────
    records: list[dict] = []

    for ch_name in chapter_order:
        pages_data = chapter_pages[ch_name]
        ch_num, _name = chapter_meta[ch_name]

        # Combine all pages in this chapter into one text block
        combined = "\n\n".join(text for _, text in pages_data)
        chunks = chunk_text(combined)

        print(f"    Ch {ch_num:2d}  {ch_name:<45s}  {len(pages_data):3d} pages  →  {len(chunks):3d} chunks")

        for idx, chunk in enumerate(chunks):
            wc = len(chunk.split())
            section = detect_section_name(chunk)

            records.append({
                "content_text": chunk,
                "class_level":  "11",
                "part":         "1",
                "chapter_number": ch_num,
                "chapter_name":   ch_name,
                "section_name":   section,
                "word_count":     wc,
                "chunk_index":    idx,
                "source_book":    "dc_pandey",
            })

    return records


# ── CLI ───────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(
        description="Extract DC Pandey Waves & Thermodynamics PDF into JSONL"
    )
    parser.add_argument(
        "--pdf",
        default="/mnt/user-data/uploads/DC_Pandey_-_Understanding_Physics_-_Waves___Thermodynamics.pdf",
        help="Path to DC Pandey PDF",
    )
    parser.add_argument(
        "--output",
        default="dc_pandey_chunks.jsonl",
        help="Output JSONL file (default: dc_pandey_chunks.jsonl)",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Print chapter summary only; do not write JSONL",
    )
    args = parser.parse_args()

    print(f"\nDC Pandey — Waves & Thermodynamics  extraction")
    print(f"  PDF:    {args.pdf}")
    print(f"  Output: {args.output if not args.dry_run else '(dry run — no file)'}")
    print()

    records = extract_dc_pandey(args.pdf)

    print(f"\n{'='*60}")
    print(f"Total chunks extracted: {len(records)}")
    print(f"\nChapter summary:")

    from collections import Counter
    by_chapter = Counter(r["chapter_name"] for r in records)
    for ch_name, count in sorted(by_chapter.items(), key=lambda x: x[0]):
        total_words = sum(r["word_count"] for r in records if r["chapter_name"] == ch_name)
        print(f"  {ch_name:<45s}  {count:3d} chunks  (~{total_words:,} words)")

    if args.dry_run:
        print("\n[DRY RUN] No file written.")
        return

    with open(args.output, "w", encoding="utf-8") as f:
        for rec in records:
            f.write(json.dumps(rec, ensure_ascii=False) + "\n")

    print(f"\nWritten: {args.output}")
    print(f"\nNext step:")
    print(f"  node src/scripts/embed-dc-pandey.mjs {args.output}")


if __name__ == "__main__":
    main()
