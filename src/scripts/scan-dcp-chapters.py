"""
DC Pandey chapter scanner
=========================
Scans a DC Pandey PDF and prints:
  - All pages where a chapter heading is detected
  - All pages where "Hints" / answer-section text is detected
  - A suggested CHAPTER_RANGES table

Usage:
    python src/scripts/scan-dcp-chapters.py --pdf "C:/Tutor/books/DC Pandey ....pdf"
"""

import argparse
import re
import sys

try:
    import pdfplumber
except ImportError:
    print("ERROR: pdfplumber not installed.  Run: pip install pdfplumber", file=sys.stderr)
    sys.exit(1)


# ── Chapter heading patterns for DC Pandey Class-12 books ─────────────────────
# These match headings like:
#   "Chapter 23  Electric Charges and Coulomb's Law"
#   "23  Electric Charges and Coulomb's Law"
#   "CHAPTER 23" alone on a line
CHAPTER_HEADING_RE = re.compile(
    r"""
    (?:Chapter\s*)?           # optional "Chapter" prefix
    \b(\d{2})\b               # two-digit chapter number (23-43)
    [\s\.\:–—]+               # separator
    ([A-Z][A-Za-z\s\'\'\-\&]+)  # title starting with capital
    """,
    re.VERBOSE,
)

# Section headers that look like chapter starts (e.g., first line of chapter content)
SECTION_START_RE = re.compile(r"^\s*(\d{2})\.\d\s+[A-Z]")

# Hints / answers section marker
HINTS_RE = re.compile(
    r"Hints?\s+(?:and\s+)?(?:Solutions?|Answers?)|"
    r"^Answers?\s*$|"
    r"^\s*H\s*i\s*n\s*t\s*s?\s*$",   # spaced letters
    re.IGNORECASE | re.MULTILINE,
)

# Page number: bare integer at start/end of page text
PAGE_NUM_RE = re.compile(r"(?:^|\n)\s*(\d{1,3})\s*(?:\n|$)")


def extract_book_page(text: str) -> int | None:
    lines = [l.strip() for l in text.splitlines() if l.strip()]
    candidates = lines[:5] + lines[-5:]
    for line in candidates:
        m = re.match(r"^(\d{1,3})$", line)
        if m:
            n = int(m.group(1))
            if 5 <= n <= 600:
                return n
    return None


def scan_pdf(pdf_path: str):
    print(f"\nScanning: {pdf_path}\n")

    chapter_hits: list[tuple[int, int, str]] = []   # (pdf_page, book_page, heading)
    hints_hits:   list[tuple[int, int]]       = []  # (pdf_page, book_page)

    with pdfplumber.open(pdf_path) as pdf:
        total = len(pdf.pages)
        print(f"Total PDF pages: {total}\n")

        for pdf_idx, page in enumerate(pdf.pages):
            raw = page.extract_text() or ""
            book_page = extract_book_page(raw)

            # Hints/answers detection
            if HINTS_RE.search(raw):
                hints_hits.append((pdf_idx + 1, book_page or 0))

            # Chapter heading detection — check first 600 chars of page
            head = raw[:600]
            m = CHAPTER_HEADING_RE.search(head)
            if m:
                ch_num = int(m.group(1))
                ch_title = m.group(2).strip()[:60]
                if 20 <= ch_num <= 50:   # plausible range
                    chapter_hits.append((pdf_idx + 1, book_page or 0, f"Ch {ch_num}: {ch_title}"))

            # Also check section-start headers as chapter boundary indicators
            if not m:
                sm = SECTION_START_RE.search(head)
                if sm:
                    ch_num = int(sm.group(1))
                    if 20 <= ch_num <= 50:
                        # Only report if book_page is a new chapter start
                        pass  # reduce noise — only report full headings

    # ── Print results ─────────────────────────────────────────────────────────
    print("=== CHAPTER HEADINGS DETECTED ===")
    print(f"{'PDF page':>8}  {'Book page':>9}  Heading")
    print("-" * 70)
    for pdf_p, book_p, heading in chapter_hits:
        print(f"{pdf_p:>8}  {book_p:>9}  {heading}")

    print()
    print("=== HINTS/ANSWERS SECTION DETECTED ===")
    if hints_hits:
        for pdf_p, book_p in hints_hits[:10]:
            print(f"  PDF page {pdf_p}  (book page {book_p})")
    else:
        print("  (none detected — check manually)")

    # ── Suggested chapter ranges ───────────────────────────────────────────────
    print()
    print("=== SUGGESTED CHAPTER_RANGES (review & adjust) ===")
    if chapter_hits:
        # Deduplicate by chapter number (keep first hit per chapter)
        seen_ch = {}
        for pdf_p, book_p, heading in chapter_hits:
            # Extract chapter number from heading
            m = re.match(r"Ch (\d+):", heading)
            if m:
                ch_num = int(m.group(1))
                if ch_num not in seen_ch:
                    seen_ch[ch_num] = (book_p, heading)

        sorted_chapters = sorted(seen_ch.items())
        print("CHAPTER_RANGES: list[tuple[int, int, int, str]] = [")
        for i, (ch_num, (book_p, heading)) in enumerate(sorted_chapters):
            # Estimate end page = next chapter start - 1
            if i + 1 < len(sorted_chapters):
                next_book_p = sorted_chapters[i + 1][1][0]
                end_p = next_book_p - 1 if next_book_p > 0 else book_p + 40
            else:
                # Last chapter before hints
                end_p = hints_hits[0][1] - 1 if hints_hits else book_p + 40
            # Extract title from heading
            title = re.sub(r"^Ch \d+:\s*", "", heading)
            print(f"    ({book_p:>3}, {end_p:>3}, {ch_num:>2}, \"{title}\"),")
        print("]")

    hints_page = hints_hits[0][1] if hints_hits else "???"
    print(f"\nMAX_BOOK_PAGE = {hints_page}  # set to book page just before hints section")


def main():
    parser = argparse.ArgumentParser(description="Scan DC Pandey PDF for chapter headings")
    parser.add_argument("--pdf", required=True, help="Path to DC Pandey PDF")
    args = parser.parse_args()

    scan_pdf(args.pdf)


if __name__ == "__main__":
    main()
