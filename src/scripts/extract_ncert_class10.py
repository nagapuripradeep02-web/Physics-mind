"""
NCERT Class 10 Science — Physics Chapter Extractor (OCR via Gemini Vision)
===========================================================================
Standard PDF text extraction fails on the NCERT Class 10 Science PDF because
it uses CID-mapped fonts that produce symbol garbage with all extractors
(pypdf, pdfplumber, pymupdf).

This script:
1. Renders PDF pages as images using pymupdf
2. Sends page images to Gemini Vision API for OCR text extraction
3. Chunks the extracted text (400-500 words, 50-word overlap)
4. Outputs JSON ready for embed-json-chunks.mjs

Usage:
    python src/scripts/extract_ncert_class10.py

Output:
    ncert_class10_chunks.json
"""

import json
import re
import sys
import os
import time
import base64
import fitz  # pymupdf

# Try to load .env.local
try:
    from dotenv import load_dotenv
    load_dotenv('.env.local')
except ImportError:
    pass

PDF_PATH = "ncert/NCERT-Class-10-Science.pdf"
OUTPUT_PATH = "ncert_class10_chunks.json"
PAGE_IMAGES_DIR = "ncert/page_images_hires"

# Google AI API key
API_KEY = os.environ.get("GOOGLE_GENERATIVE_AI_API_KEY") or os.environ.get("GOOGLE_AI_API_KEY")
if not API_KEY:
    print("ERROR: No Google AI API key found. Set GOOGLE_GENERATIVE_AI_API_KEY or GOOGLE_AI_API_KEY")
    sys.exit(1)

# Chapter page ranges (0-indexed)
# Determined by visual inspection of rendered pages
CHAPTERS = {
    10: {
        "name": "Light - Reflection and Refraction",
        "start_page": 160,  # 0-indexed (page 161 in PDF)
        "end_page": 187,    # exclusive (up to page 187)
    },
    12: {
        "name": "Electricity",
        "start_page": 199,  # page 200
        "end_page": 222,    # up to page 222
    },
    13: {
        "name": "Magnetic Effects of Electric Current",
        "start_page": 223,  # page 224
        "end_page": 244,    # up to page 244
    },
}

# Chunking config
TARGET_WORDS = 450
MIN_WORDS = 350
MAX_WORDS = 550
OVERLAP_WORDS = 50


def render_pages_to_images(pdf_path: str, start: int, end: int) -> list[str]:
    """Render PDF pages to PNG images, return list of file paths."""
    os.makedirs(PAGE_IMAGES_DIR, exist_ok=True)
    doc = fitz.open(pdf_path)
    paths = []
    for i in range(start, end):
        if i < len(doc):
            page = doc[i]
            # Use 150 DPI for good OCR quality without being too large
            pix = page.get_pixmap(dpi=150)
            path = os.path.join(PAGE_IMAGES_DIR, f"page_{i+1:03d}.png")
            pix.save(path)
            paths.append(path)
    doc.close()
    return paths


def ocr_page_with_gemini(image_path: str, page_num: int) -> str:
    """Send a page image to Gemini Vision API and get OCR text back."""
    import urllib.request

    # Read and base64-encode the image
    with open(image_path, "rb") as f:
        image_data = base64.b64encode(f.read()).decode("utf-8")

    # Build Gemini API request
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={API_KEY}"

    prompt = """Extract ALL the text from this textbook page image. 
Rules:
- Extract the text exactly as written, preserving paragraphs
- Include section headings, numbered lists, bullet points
- For mathematical equations/formulas, write them in plain text (e.g. "1/v - 1/u = 1/f")
- Skip figure captions and diagram labels unless they contain important information
- Skip page numbers, headers, and footers
- Skip "Activity" boxes but include their text content
- Do not add any commentary or formatting markers
- Separate paragraphs with blank lines
- If text is in a "More to Know" or info box, include it but mark it as [INFO BOX]
- Output ONLY the extracted text, nothing else"""

    payload = {
        "contents": [{
            "parts": [
                {"text": prompt},
                {
                    "inline_data": {
                        "mime_type": "image/png",
                        "data": image_data
                    }
                }
            ]
        }],
        "generationConfig": {
            "temperature": 0.1,
            "maxOutputTokens": 4096
        }
    }

    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json"})

    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            result = json.loads(resp.read().decode("utf-8"))
            # Extract text from response
            candidates = result.get("candidates", [])
            if candidates:
                parts = candidates[0].get("content", {}).get("parts", [])
                if parts:
                    return parts[0].get("text", "")
    except Exception as e:
        print(f"  ⚠️  OCR failed for page {page_num}: {e}")
        return ""

    return ""


def extract_chapter_text(pdf_path: str, ch_num: int, ch_info: dict) -> str:
    """Extract all text from a chapter using Gemini Vision OCR."""
    start = ch_info["start_page"]
    end = ch_info["end_page"]
    total_pages = end - start

    print(f"\n  Rendering {total_pages} pages to images...")
    image_paths = render_pages_to_images(pdf_path, start, end)

    print(f"  OCR-ing {len(image_paths)} pages with Gemini Vision...")
    all_text = []

    for idx, img_path in enumerate(image_paths):
        page_num = start + idx + 1
        sys.stdout.write(f"\r  Processing page {page_num} ({idx+1}/{len(image_paths)})...")
        sys.stdout.flush()

        text = ocr_page_with_gemini(img_path, page_num)
        if text.strip():
            all_text.append(text.strip())

        # Rate limiting: 15 RPM for free tier, so ~4 seconds between calls
        # With paid tier this can be faster
        if idx < len(image_paths) - 1:
            time.sleep(2)

    print(f"\n  ✓ Extracted text from {len(all_text)} pages")

    return "\n\n".join(all_text)


def quality_check(text: str, label: str) -> bool:
    """Check that text is readable English, not symbol garbage."""
    alpha = sum(1 for c in text if c.isalnum() or c.isspace())
    total = len(text) if text else 1
    ratio = alpha / total

    symbol_chars = sum(1 for c in text if c in "✞✒✆☞❩❻❹❝❷⑥⑦❸➮➱✃➴❐❒❮")

    print(f"  [{label}] Length: {len(text)} chars, alpha ratio: {ratio:.2%}, symbol chars: {symbol_chars}")
    print(f"  First 200 chars: {text[:200]}")
    print()

    if ratio < 0.7:
        print(f"  ⚠️  WARNING: Low alpha ratio ({ratio:.2%}) — may be symbol garbage!")
        return False
    if symbol_chars > 5:
        print(f"  ⚠️  WARNING: Found {symbol_chars} symbol characters — may be garbage!")
        return False
    return True


def detect_sections(text: str, chapter_num: int) -> list[tuple[str | None, str]]:
    """
    Split text into sections based on section headings like "10.1 Reflection of Light".
    Returns list of (section_name, section_text) pairs.
    """
    pattern = rf'({chapter_num}\.\d+(?:\.\d+)?\s+[A-Z][^\n]{{3,80}})'

    parts = re.split(pattern, text)

    sections = []
    current_section = None
    current_text = ""

    for part in parts:
        if re.match(pattern, part):
            if current_text.strip():
                sections.append((current_section, current_text.strip()))
            current_section = part.strip()
            current_text = ""
        else:
            current_text += part

    if current_text.strip():
        sections.append((current_section, current_text.strip()))

    return sections


def clean_text(text: str) -> str:
    """Clean OCR-extracted text."""
    # Remove [INFO BOX] markers
    text = re.sub(r'\[INFO BOX\]\s*', '', text)

    # Normalize whitespace
    text = re.sub(r'[ \t]+', ' ', text)
    text = re.sub(r'\n{3,}', '\n\n', text)

    return text.strip()


def chunk_text(text: str, section_name: str | None, chapter_num: int, chapter_name: str) -> list[dict]:
    """
    Chunk text into 400-500 word segments with 50-word overlap.
    Split on paragraph boundaries, never mid-sentence.
    """
    paragraphs = [p.strip() for p in text.split('\n\n') if p.strip()]

    chunks = []
    current_words = []
    current_text_parts = []

    for para in paragraphs:
        para_words = para.split()

        if current_words and len(current_words) + len(para_words) > MAX_WORDS:
            chunk_text_str = '\n\n'.join(current_text_parts)
            if len(current_words) >= MIN_WORDS:
                chunks.append({
                    "chapter_number": chapter_num,
                    "chapter_name": chapter_name,
                    "section_name": section_name,
                    "content_text": chunk_text_str,
                    "chunk_index": len(chunks),
                })

            overlap_text = ' '.join(current_words[-OVERLAP_WORDS:])
            current_words = overlap_text.split()
            current_text_parts = [overlap_text]

        current_words.extend(para_words)
        current_text_parts.append(para)

    # Flush remaining
    if current_words:
        chunk_text_str = '\n\n'.join(current_text_parts)
        word_count = len(current_words)

        if chunks and word_count < MIN_WORDS:
            prev = chunks[-1]
            prev["content_text"] += '\n\n' + chunk_text_str
        else:
            chunks.append({
                "chapter_number": chapter_num,
                "chapter_name": chapter_name,
                "section_name": section_name,
                "content_text": chunk_text_str,
                "chunk_index": len(chunks),
            })

    return chunks


def main():
    print("=" * 60)
    print("NCERT Class 10 Science — Physics Chapter Extractor")
    print("Using Gemini Vision OCR (CID font workaround)")
    print("=" * 60)
    print(f"\nPDF: {PDF_PATH}")
    print(f"Output: {OUTPUT_PATH}\n")

    all_chunks = []

    for ch_num in sorted(CHAPTERS.keys()):
        ch_info = CHAPTERS[ch_num]
        ch_name = ch_info["name"]

        print(f"\n{'=' * 60}")
        print(f"Chapter {ch_num}: {ch_name}")
        print(f"Pages {ch_info['start_page']+1}-{ch_info['end_page']}")
        print(f"{'=' * 60}")

        # Extract text via OCR
        raw_text = extract_chapter_text(PDF_PATH, ch_num, ch_info)

        if not raw_text.strip():
            print(f"ERROR: No text extracted for Chapter {ch_num}!")
            sys.exit(1)

        # Clean and quality check
        cleaned = clean_text(raw_text)
        ok = quality_check(cleaned, f"Ch{ch_num}")

        if not ok:
            print(f"WARNING: Quality check failed for Chapter {ch_num}, but continuing with OCR text")

        # Detect sections and chunk
        sections = detect_sections(cleaned, ch_num)

        if not sections:
            sections = [(None, cleaned)]

        chapter_chunks = []
        for section_name, section_text in sections:
            section_chunks = chunk_text(section_text, section_name, ch_num, ch_name)
            chapter_chunks.extend(section_chunks)

        # Re-index
        for i, chunk in enumerate(chapter_chunks):
            chunk["chunk_index"] = i

        print(f"  Chunks: {len(chapter_chunks)}")
        total_words = sum(len(c["content_text"].split()) for c in chapter_chunks)
        print(f"  Total words: {total_words}")
        avg_words = total_words // len(chapter_chunks) if chapter_chunks else 0
        print(f"  Avg words/chunk: {avg_words}")

        all_chunks.extend(chapter_chunks)

    # Write output
    print(f"\n{'=' * 60}")
    print(f"Writing {len(all_chunks)} chunks to {OUTPUT_PATH}...")

    with open(OUTPUT_PATH, 'w', encoding='utf-8') as f:
        json.dump(all_chunks, f, indent=2, ensure_ascii=False)

    print(f"  ✓ Written {len(all_chunks)} chunks")

    # Summary
    print(f"\n{'=' * 60}")
    print("SUMMARY")
    print(f"{'=' * 60}")

    from collections import Counter
    ch_counts = Counter(c["chapter_name"] for c in all_chunks)
    for name, count in sorted(ch_counts.items()):
        print(f"  {name}: {count} chunks")

    print(f"\n  Total: {len(all_chunks)} chunks")
    print(f"\nNext step: Run embedding + insertion:")
    print(f"  node src/scripts/embed-json-chunks.mjs {OUTPUT_PATH} \\")
    print(f"    --source-book=ncert --class-level=10 --batch=10 --delay=250")


if __name__ == "__main__":
    main()
