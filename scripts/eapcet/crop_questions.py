"""Crop one image per question from a CBT paper.

A question's region runs from its 'Question Number' marker down to the next one, across a page
break when needed. Cropping the page preserves layout and maths, which is what a vision model
needs; pulling individual image XObjects would shred it.
"""
import os, re, io, json, sys
import pymupdf

DEST = os.path.join("C:" + os.sep, "Tutor", "physics-mind", "pdfs", "eapcet", "ts")
OUT = os.path.dirname(os.path.abspath(__file__))
Q_LONG = re.compile(r"Question Number\s*:\s*(\d+)")
Q_SHORT = re.compile(r"^Q\.(\d+)$")
DIGITS = re.compile(r"^\d{1,2}$")


def markers(doc):
    """[(q_no, page_index, y)] in document order."""
    out, expected = [], 1
    for page in doc:
        spans = []
        for b in page.get_text("dict")["blocks"]:
            for l in b.get("lines", []):
                for s in l["spans"]:
                    t = s["text"].strip()
                    if t:
                        spans.append((round(s["bbox"][1], 2), round(s["bbox"][0], 2), t))
        spans.sort(key=lambda t: (t[0], t[1]))
        i = 0
        while i < len(spans):
            y, x, t = spans[i]
            n = re.sub(r"\s+", "", t)
            q = None
            m = Q_LONG.search(t)
            if m:
                q = int(m.group(1))
            else:
                m = Q_SHORT.match(n)
                if m:
                    q = int(m.group(1))
                    if q != expected and i + 1 < len(spans):
                        nxt = re.sub(r"\s+", "", spans[i + 1][2])
                        if DIGITS.match(nxt) and int(str(q) + nxt) == expected:
                            q = expected
                            i += 1
            if q is not None:
                out.append((q, page.number, y))
                expected = q + 1
            i += 1
    return out


def crop(doc, mk, idx, dpi=150, pad=6, tail_pages=2):
    """Images covering one question, from its marker down to the next marker.

    The LAST question of a paper has no next marker. Ending it at the bottom of its own page
    silently drops whatever continues overleaf, which on these papers is usually most of its
    options: question 160 came out with option 1 and three blanks on every chemistry paper.
    So a question with no successor spills through the next `tail_pages` pages instead.
    """
    q, pi, y = mk[idx]
    if idx + 1 < len(mk):
        nq, npi, ny = mk[idx + 1]
    else:
        nq, npi, ny = None, min(doc.page_count - 1, pi + tail_pages), None
    page = doc[pi]
    top = max(0, y - pad)
    if npi == pi and ny is not None:
        bot = min(page.rect.height, ny - 2)
    else:
        bot = page.rect.height
    clip = pymupdf.Rect(0, top, page.rect.width, bot)
    parts = [page.get_pixmap(dpi=dpi, clip=clip)]
    # spill onto following pages up to the next marker
    p = pi + 1
    while npi is not None and p <= npi and p < doc.page_count:
        pg2 = doc[p]
        b2 = (ny - 2) if p == npi and ny is not None else pg2.rect.height
        if b2 > 2:
            parts.append(pg2.get_pixmap(dpi=dpi, clip=pymupdf.Rect(0, 0, pg2.rect.width, b2)))
        p += 1
    return parts


def main():
    f = sys.argv[1] if len(sys.argv) > 1 else "ts_eapcet_engineering_9th_may_2024_s1_qp__12FJmVbvXc.pdf"
    want = [int(x) for x in sys.argv[2:]] or [1, 80, 81, 120, 121, 160]
    doc = pymupdf.open(os.path.join(DEST, f))
    mk = markers(doc)
    print("markers:", len(mk), "range", mk[0][0], "..", mk[-1][0])
    pos = {q: i for i, (q, _, _) in enumerate(mk)}
    d = os.path.join(OUT, "qcrops")
    os.makedirs(d, exist_ok=True)
    for q in want:
        if q not in pos:
            print("  Q%-4d not found" % q)
            continue
        parts = crop(doc, mk, pos[q])
        for j, px in enumerate(parts):
            p = os.path.join(d, "q%03d_%d.png" % (q, j))
            px.save(p)
            print("  Q%-4d part %d -> %s  (%dx%d, %.0f KB)"
                  % (q, j, os.path.basename(p), px.width, px.height, os.path.getsize(p) / 1024))
    doc.close()


if __name__ == "__main__":
    main()
