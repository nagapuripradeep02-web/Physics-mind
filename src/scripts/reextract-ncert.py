"""
NCERT PDF Re-extraction Script  (v3 — running-header chapter detection)
=======================================================================
Extracts clean, chapter-aware chunks from NCERT Physics PDFs.

Key improvements over v1/v2:
  - Chapter detection uses RUNNING HEADERS (appear on every content page),
    not chapter-start pages (which are garbled/split in multi-column PDFs).
  - Class 11 pattern:  "PHYSICAL WORLD 11"  -> chapter = "Physical World"
  - Class 12 pattern:  "Current" / "Electricity" (2-line split) -> "Current Electricity"
  - Class 10 PDFs use custom font encoding -- skip them (keep existing DB data).

Setup:
    pip install pdfplumber

Usage:
    python reextract-ncert.py --pdfs ./pdfs --output ncert_chunks.jsonl
    node src/scripts/reembed-ncert.mjs ncert_chunks.jsonl
"""

import argparse
import json
import os
import re
import sys

try:
    import pdfplumber
except ImportError:
    print("ERROR: pdfplumber not installed. Run: pip install pdfplumber", file=sys.stderr)
    sys.exit(1)


# ── Known chapter tables ───────────────────────────────────────────────────────

CLASS_12_CHAPTERS: dict[int, str] = {
    1:  "Electric Charges and Fields",
    2:  "Electrostatic Potential and Capacitance",
    3:  "Current Electricity",
    4:  "Moving Charges and Magnetism",
    5:  "Magnetism and Matter",
    6:  "Electromagnetic Induction",
    7:  "Alternating Current",
    8:  "Electromagnetic Waves",
    9:  "Ray Optics and Optical Instruments",
    10: "Wave Optics",
    11: "Dual Nature of Radiation and Matter",
    12: "Atoms",
    13: "Nuclei",
    14: "Semiconductor Electronics",
}

CLASS_11_CHAPTERS: dict[int, str] = {
    1:  "Physical World",
    2:  "Units and Measurements",
    3:  "Motion in a Straight Line",
    4:  "Motion in a Plane",
    5:  "Laws of Motion",
    6:  "Work, Energy and Power",
    7:  "System of Particles and Rotational Motion",
    8:  "Gravitation",
    9:  "Mechanical Properties of Solids",
    10: "Mechanical Properties of Fluids",
    11: "Thermal Properties of Matter",
    12: "Thermodynamics",
    13: "Kinetic Theory",
    14: "Oscillations",
    15: "Waves",
}


# ── Configuration ──────────────────────────────────────────────────────────────

CHUNK_WORDS   = 400
OVERLAP_WORDS = 40
MIN_CHUNK_CHARS = 80

JUNK_PATTERNS = [
    r"^\s*NCERT\s*$",
    r"^\s*PHYSICS\s*$",
    r"^\s*SCIENCE\s*$",
    r"^\s*\d+\s*$",                    # bare page numbers
    r"^\s*[A-Z ]{3,40}\s*$",           # short all-caps lines (running headers already extracted)
    r"^\s*www\.ncert\.nic\.in\s*$",
    r"^\s*Free\s+distribution\s*",
    r"^\s*not\s+for\s+sale\s*",
    r"^\s*Reprint\s+\d{4}",
    r"^\s*[©]\s*NCERT",
    r"^\s*\(i+\)\s*$",
]


# ── Class / PDF detection ──────────────────────────────────────────────────────

def detect_class(filename: str) -> str:
    name = os.path.basename(filename).lower()
    m = re.search(r"class[-_]?(\d{2})", name)
    if m:
        return m.group(1)
    return "unknown"


def is_class10_pdf(filename: str) -> bool:
    """Class 10 PDFs use custom font encoding — unreadable by pdfplumber."""
    name = os.path.basename(filename).lower()
    return "class-10" in name or "class_10" in name or "class10" in name


# ── Text cleaning ──────────────────────────────────────────────────────────────

def is_junk_line(line: str) -> bool:
    stripped = line.strip()
    if not stripped:
        return True
    # High proportion of non-printable / symbol characters -> garbled custom font
    garbage = sum(1 for c in stripped if ord(c) > 0x2000 or (ord(c) < 32 and c not in "\t\n"))
    if stripped and garbage / len(stripped) > 0.12:
        return True
    for pattern in JUNK_PATTERNS:
        if re.match(pattern, stripped, re.IGNORECASE):
            return True
    return False


def clean_text(raw: str) -> str:
    text = raw.replace("\x00", "").replace("\ufffd", "")
    text = re.sub(r"[\x01-\x08\x0b\x0c\x0e-\x1f\x7f]", "", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


# ── Running-header chapter detection ──────────────────────────────────────────

def detect_chapter_from_header(raw_lines: list[str]) -> str | None:
    """
    Detect the current chapter from a page's running header.

    Class 12 PDFs (Part 1 and Part 2):
      Odd  pages: chapter title split across lines 1-2
                  e.g. ['Current', 'Electricity', 'body text...']
                  e.g. ['Ray Optics and', 'Optical Instruments', ...]
                  e.g. ['Electrostatic Potential', 'and Capacitance', ...]
      Even pages: ['Physics', ...]  -> skip

    Class 11 PDFs (Part 1 and Part 2):
      Odd  pages: 'CHAPTER_NAME PAGE_NUM'
                  e.g. 'PHYSICAL WORLD 11'  -> 'Physical World'
                  e.g. 'UNITS AND MEASUREMENTS 15' -> 'Units And Measurements'
      Even pages: 'N PHYSICS'  -> skip

    Chapter-start pages (both classes):
      'Chapter Three', 'Chapter Nine', 'CHAPTER ONE' etc. -> skip
      (These pages are garbled in the PDF anyway.)
    """
    # Filter to non-empty, non-garbage lines
    lines = [l.strip() for l in raw_lines if l.strip() and not is_junk_line(l)]
    if not lines:
        return None

    first = lines[0]

    # ── Skip generic headers ──────────────────────────────────────────────────
    generic = {"physics", "science", "ncert", "contents", "foreword", "preface"}
    if first.lower() in generic:
        return None

    # "14 PHYSICS" or "6 SCIENCE" (Class 11 even pages)
    if re.match(r"^\d+\s+(PHYSICS|SCIENCE)\s*$", first, re.IGNORECASE):
        return None

    # Chapter-start pages: "Chapter Three" / "Chapter 3" / "CHAPTER ONE"
    if re.match(
        r"^CHAPTER\s+(ONE|TWO|THREE|FOUR|FIVE|SIX|SEVEN|EIGHT|NINE|TEN|"
        r"ELEVEN|TWELVE|THIRTEEN|FOURTEEN|FIFTEEN|\d+)\s*$",
        first, re.IGNORECASE,
    ):
        return None
    if re.match(
        r"^Chapter\s+(One|Two|Three|Four|Five|Six|Seven|Eight|Nine|Ten|"
        r"Eleven|Twelve|Thirteen|Fourteen|Fifteen|\d+)",
        first, re.IGNORECASE,
    ):
        return None

    # ── Class 11: "CHAPTER_NAME PAGE_NUMBER" ─────────────────────────────────
    # e.g. "PHYSICAL WORLD 11", "UNITS AND MEASUREMENTS 15"
    m11 = re.match(r"^([A-Z][A-Z\s\-]+)\s+(\d+)\s*$", first)
    if m11:
        name = m11.group(1).strip()
        if name.upper() not in ("PHYSICS", "SCIENCE", "NCERT"):
            # Title-case: "PHYSICAL WORLD" -> "Physical World"
            return name.title()

    # ── Class 12: two-line split header ──────────────────────────────────────
    # Running headers on odd pages: chapter title split across lines 1-2.
    # Must be strict to avoid picking up body-text sentence fragments.
    second = lines[1] if len(lines) > 1 else ""

    # Body-text sentinel words — these never appear in NCERT chapter titles
    _BODY_WORDS = {
        "can", "make", "made", "have", "has", "had", "was", "were", "is",
        "are", "as", "if", "when", "which", "where", "such", "also", "then",
        "thus", "however", "note", "between", "caused", "given", "taken",
        "used", "based", "shown", "called", "using", "find", "from", "into",
        "only", "both", "each", "other", "than", "after", "before", "while",
        "since", "because", "though", "although", "but", "so", "yet",
    }

    def _looks_like_title_word(w: str) -> bool:
        """True if word could appear in a physics chapter title."""
        if w.lower() in _BODY_WORDS:
            return False
        # Allow short connectives in titles: and, of, the, in, on, at, by, to
        if w.lower() in {"and", "of", "the", "in", "on", "at", "by", "to", "or"}:
            return True
        # Content words: must start with uppercase OR be all-caps abbreviation
        return bool(re.match(r"^[A-Z]", w))

    def _is_title_phrase(line: str) -> bool:
        """True if line looks like a chapter-title phrase, not body text."""
        if not line:
            return False
        # Must start with uppercase
        if not re.match(r"^[A-Z]", line):
            return False
        # Must not end with sentence punctuation
        if line.rstrip().endswith((".", ",", ";", ":", "?")):
            return False
        words = line.split()
        # Short enough (chapter titles rarely exceed 7 words per line)
        if len(words) > 7:
            return False
        # No body-text sentinel words
        if any(w.lower() in _BODY_WORDS for w in words):
            return False
        # Must contain only alpha + allowed punctuation (no digits in body)
        if not re.match(r"^[A-Za-z][A-Za-z\s\-,()]+$", line):
            return False
        return True

    if _is_title_phrase(first) and _is_title_phrase(second):
        combined = f"{first} {second}".strip()
        # Combined must be a plausible chapter title (pure word phrase)
        if re.match(r"^[A-Za-z][A-Za-z\s\-,()]+$", combined):
            return combined

    # ── Class 12: single-line chapter name ───────────────────────────────────
    if _is_title_phrase(first) and len(first) < 60:
        return first

    return None


# ── Chunking ───────────────────────────────────────────────────────────────────

def chunk_text(text: str, chunk_size: int, overlap: int) -> list[str]:
    word_list = text.split()
    if not word_list:
        return []
    chunks = []
    start = 0
    while start < len(word_list):
        end = min(start + chunk_size, len(word_list))
        chunk = " ".join(word_list[start:end])
        if len(chunk) >= MIN_CHUNK_CHARS:
            chunks.append(chunk)
        start += chunk_size - overlap
    return chunks


# ── Main extraction ────────────────────────────────────────────────────────────

def normalize_chapter_name(name: str, class_level: str) -> str:
    """
    Map a detected chapter name to the canonical spelling from the known tables.
    Handles capitalization variants like 'Mechanical Properties Of Solids' vs
    'Mechanical Properties of Solids'.
    Returns the canonical name if found; otherwise returns the original name.
    """
    if class_level == "12":
        table = CLASS_12_CHAPTERS
    elif class_level == "11":
        table = CLASS_11_CHAPTERS
    else:
        return name

    name_lower = name.lower().strip()
    for canonical in table.values():
        if canonical.lower() == name_lower:
            return canonical
    return name


def detect_chapter_from_section_num(raw_text: str, class_level: str) -> str | None:
    """
    Detect chapter from section numbers embedded in body text.
    e.g. "3.1 Introduction" -> "Current Electricity" (Class 12, ch 3)
         "9.3 Refraction"   -> "Ray Optics and Optical Instruments" (Class 12, ch 9)
    Only accepts chapter numbers that exist in the known chapter tables.
    """
    m = re.search(r"\b(\d{1,2})\.(\d{1,2})\s+[A-Z]", raw_text)
    if not m:
        return None
    ch_num = int(m.group(1))
    sec_num = int(m.group(2))
    if sec_num < 1 or sec_num > 20:  # sanity: unlikely to have >20 sections
        return None
    if class_level == "12":
        return CLASS_12_CHAPTERS.get(ch_num)
    elif class_level == "11":
        return CLASS_11_CHAPTERS.get(ch_num)
    return None


def detect_chapter_from_page(page, class_level: str) -> str | None:
    """
    Extract chapter name using coordinate-based header region detection.
    Looks only at text in the top ~8% of the page (the running-header band).
    Falls back to full-page line detection for Class 11 (which uses inline headers).
    """
    # For Class 11, try running-header detection first, then section-number fallback.
    if class_level == "11":
        raw = page.extract_text() or ""
        result = detect_chapter_from_header(raw.splitlines())
        if result:
            return normalize_chapter_name(result, class_level)
        return detect_chapter_from_section_num(raw, class_level)

    # For Class 12: look at the top margin only (first 8% of page height).
    # Running headers sit in this region; body text starts below.
    try:
        margin_h = page.height * 0.08
        header_box = page.within_bbox((0, 0, page.width, margin_h))
        header_text = header_box.extract_text() or ""
        if header_text.strip():
            result = detect_chapter_from_header(header_text.splitlines())
            if result:
                return normalize_chapter_name(result, class_level)
    except Exception:
        pass

    # Try slightly larger region (12%) in case of larger margins
    try:
        margin_h2 = page.height * 0.12
        header_box2 = page.within_bbox((0, 0, page.width, margin_h2))
        header_text2 = header_box2.extract_text() or ""
        if header_text2.strip():
            result2 = detect_chapter_from_header(header_text2.splitlines())
            if result2:
                return normalize_chapter_name(result2, class_level)
    except Exception:
        pass

    # Fallback: detect chapter from section numbers in full page text
    try:
        full_text = page.extract_text() or ""
        result3 = detect_chapter_from_section_num(full_text, class_level)
        if result3:
            return result3
    except Exception:
        pass

    return None


def extract_pdf(pdf_path: str, class_level: str) -> list[dict]:
    filename = os.path.basename(pdf_path)
    print(f"  Processing: {filename} (Class {class_level})")

    # Default chapter = cleaned filename (covers front-matter pages)
    default_chapter = (
        filename.replace(".pdf", "")
               .replace("-", " ")
               .replace("_", " ")
               .strip()
    )
    current_chapter = default_chapter

    # chapter_name -> [(page_num, cleaned_text)]
    chapter_groups: dict[str, list[tuple[int, str]]] = {}
    chapter_order: list[str] = []

    with pdfplumber.open(pdf_path) as pdf:
        for page_num, page in enumerate(pdf.pages, start=1):
            raw = page.extract_text() or ""
            raw_lines = raw.splitlines()

            # Try to detect chapter from running header (coordinate-aware for Class 12)
            new_chapter = detect_chapter_from_page(page, class_level)
            if new_chapter and new_chapter != current_chapter:
                current_chapter = new_chapter

            # Clean content lines
            clean_lines = [l for l in raw_lines if not is_junk_line(l)]
            cleaned = clean_text("\n".join(clean_lines))

            if cleaned:
                if current_chapter not in chapter_groups:
                    chapter_groups[current_chapter] = []
                    chapter_order.append(current_chapter)
                chapter_groups[current_chapter].append((page_num, cleaned))

    # Chunk each chapter's content independently
    records: list[dict] = []
    for chapter_name in chapter_order:
        pages = chapter_groups[chapter_name]
        combined = "\n".join(text for _, text in pages)
        chunks = chunk_text(combined, CHUNK_WORDS, OVERLAP_WORDS)

        for i, chunk in enumerate(chunks):
            section_match = re.match(r"^(\d+\.\d+\s+\w[^\n]{0,60})", chunk)
            section_name = section_match.group(1).strip() if section_match else None

            records.append({
                "content_text": chunk,
                "class_level": class_level,
                "chapter_name": chapter_name,
                "section_name": section_name,
                "page_number": pages[min(i, len(pages) - 1)][0],
                "source_file": filename,
                "chunk_index": i,
            })

    # Print chapter summary
    print(f"    -> {len(records)} chunks across {len(chapter_order)} chapter(s):")
    for ch in chapter_order:
        n_pages = len(chapter_groups[ch])
        n_chunks = len(chunks := chunk_text(
            "\n".join(t for _, t in chapter_groups[ch]), CHUNK_WORDS, OVERLAP_WORDS
        ))
        print(f"       [{class_level}] {ch}: {n_pages} pages, {n_chunks} chunks")

    return records


# ── CLI ────────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(
        description="Extract clean chapter-aware chunks from NCERT Physics PDFs"
    )
    parser.add_argument("--pdfs", default="./pdfs",
                        help="Directory containing NCERT PDF files (default: ./pdfs)")
    parser.add_argument("--output", default="ncert_chunks.jsonl",
                        help="Output JSONL file path (default: ncert_chunks.jsonl)")
    args = parser.parse_args()

    pdf_dir = args.pdfs
    if not os.path.isdir(pdf_dir):
        print(f"ERROR: PDF directory not found: {pdf_dir}", file=sys.stderr)
        sys.exit(1)

    pdf_files = [
        os.path.join(pdf_dir, f)
        for f in sorted(os.listdir(pdf_dir))
        if f.lower().endswith(".pdf")
    ]

    if not pdf_files:
        print(f"No PDF files found in {pdf_dir}", file=sys.stderr)
        sys.exit(1)

    print(f"Found {len(pdf_files)} PDF(s) in {pdf_dir}\n")
    all_records: list[dict] = []

    for pdf_path in pdf_files:
        class_level = detect_class(pdf_path)

        if class_level == "unknown":
            print(f"  SKIP: could not detect class level for {os.path.basename(pdf_path)}")
            continue

        if is_class10_pdf(pdf_path):
            print(f"  SKIP: {os.path.basename(pdf_path)} (Class 10 PDFs use unreadable custom font)")
            print(f"        Keep existing Class 10 data in DB -- do not truncate class_level='10'")
            continue

        try:
            records = extract_pdf(pdf_path, class_level)
            all_records.extend(records)
        except Exception as e:
            print(f"  ERROR processing {pdf_path}: {e}", file=sys.stderr)

    print(f"\n{'='*60}")
    print(f"Total chunks: {len(all_records)}")

    # Summary by class + chapter
    from collections import Counter
    counts: Counter = Counter(
        f"Class {r['class_level']} | {r['chapter_name']}" for r in all_records
    )
    print("\nChunks per chapter:")
    for label, count in sorted(counts.items()):
        print(f"  {label}: {count}")

    with open(args.output, "w", encoding="utf-8") as f:
        for record in all_records:
            f.write(json.dumps(record, ensure_ascii=False) + "\n")

    print(f"\nWritten to: {args.output}")
    print(f"\nNext steps:")
    print(f"  1. Review the chapter list above -- verify all chapters look correct")
    print(f"  2. Delete ONLY Class 11+12 data (keeps Class 10):")
    print(f"     DELETE FROM ncert_content WHERE class_level IN ('11', '12');")
    print(f"  3. Embed + upsert:")
    print(f"     node src/scripts/reembed-ncert.mjs {args.output}")


if __name__ == "__main__":
    main()
