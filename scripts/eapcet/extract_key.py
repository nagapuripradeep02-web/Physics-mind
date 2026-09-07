"""Green-marker key extractor for TG EAPCET computer-based-test PDFs.

The official answer is not artwork. It is the FILL COLOUR OF THE OPTION-LABEL TEXT SPAN: the label
of the correct option is drawn green, the other three red. The green tick and red cross icons
beside each option are separate images and are a red herring.

Requires pymupdf. pypdf cannot do this - it neither renders nor exposes span colour.

Layout profiles seen in the corpus, all handled here:

  2021 / 2022 / 2024   'Question Number : N'   labels '1.'-'4.'         #008000 / #ff0000
  2023                 'Question Number : N'   labels '<optionId>N.'    #008000 / #ff0000
  2025                 'Q.N'                   labels '1.'-'4.'         #40c64b / #f61818

Three rules make one extractor cover all of them:
  1. classify colour by RGB dominance, never by exact hex;
  2. when the printed label is not a bare 1-4, use the ORDINAL position of the coloured spans;
  3. a 'Q.N' marker SPLITS across spans for three-digit numbers - 'Q.100' renders as 'Q.10'
     followed by a bare '0' - so glue on a following bare-digit span when that restores the
     expected sequence.

'Chosen Option :' is the CANDIDATE's own answer, not the key. It is ignored.

Usage:
    python scripts/eapcet/extract_key.py                 # the whole engineering fleet
    python scripts/eapcet/extract_key.py <file.pdf> ...  # named papers
"""
import os, re, io, json, sys
import pymupdf

DEST = os.path.join("C:" + os.sep, "Tutor", "physics-mind", "pdfs", "eapcet", "ts")

Q_LONG = re.compile(r"Question Number\s*:\s*(\d+)")
Q_SHORT = re.compile(r"^Q\.(\d+)$")
QID_LONG = re.compile(r"Question Id\s*:\s*(\d+)")
QID_TIGHT = re.compile(r"QuestionI[dD]:?(\d+)")
DIGITS = re.compile(r"^\d{1,2}$")
LBL_PLAIN = re.compile(r"^([1-4])\.$")
LBL_ANY = re.compile(r"^\d+\.$")


def norm(t):
    return re.sub(r"\s+", "", t)


def classify(c):
    """Green or red by channel dominance, so #008000 and #40c64b both read as green."""
    r, g, b = (c >> 16) & 255, (c >> 8) & 255, c & 255
    if g > 90 and g > r + 40 and g > b + 40:
        return "G"
    if r > 120 and r > g + 60 and r > b + 60:
        return "R"
    return None


def page_spans(page):
    out = []
    for b in page.get_text("dict")["blocks"]:
        for l in b.get("lines", []):
            for s in l["spans"]:
                t = s["text"].strip()
                if t:
                    out.append((round(s["bbox"][1], 2), round(s["bbox"][0], 2), t, s["color"]))
    out.sort(key=lambda t: (t[0], t[1]))
    return out


def extract(path):
    doc = pymupdf.open(path)
    qs, order, cur, expected = {}, [], None, 1

    for page in doc:
        spans = page_spans(page)
        i = 0
        while i < len(spans):
            y, x, t, col = spans[i]
            n = norm(t)

            qno = None
            m = Q_LONG.search(t)
            if m:
                qno = int(m.group(1))
            else:
                m = Q_SHORT.match(n)
                if m:
                    qno = int(m.group(1))
                    if qno != expected and i + 1 < len(spans):
                        nxt = norm(spans[i + 1][2])
                        if DIGITS.match(nxt) and int(str(qno) + nxt) == expected:
                            qno = expected
                            i += 1

            if qno is not None:
                cur = qno
                expected = qno + 1
                if cur not in qs:
                    qs[cur] = {"q_no": cur, "q_id": None, "page": page.number + 1, "marks": []}
                    order.append(cur)
                mi = QID_LONG.search(t) or QID_TIGHT.search(n)
                if mi and not qs[cur]["q_id"]:
                    qs[cur]["q_id"] = mi.group(1)
                i += 1
                continue

            if cur is not None and not n.lower().startswith(("questionid", "chosenoption")):
                k = classify(col)
                if k and LBL_ANY.match(n):
                    pm = LBL_PLAIN.match(n)
                    qs[cur]["marks"].append({"y": y, "colour": k,
                                             "printed": int(pm.group(1)) if pm else None})
            i += 1

    doc.close()

    out = []
    for num in order:
        q = qs[num]
        marks = sorted(q["marks"], key=lambda m: m["y"])
        ded, lasty = [], None
        for m in marks:
            if lasty is not None and abs(m["y"] - lasty) < 1.0:
                continue
            ded.append(m)
            lasty = m["y"]
        greens = [k for k, m in enumerate(ded) if m["colour"] == "G"]
        answer = None
        if len(ded) == 4 and len(greens) == 1:
            gm = ded[greens[0]]
            answer = gm["printed"] if gm["printed"] else greens[0] + 1
        out.append({"q_no": num, "q_id": q["q_id"], "page": q["page"],
                    "n_opts": len(ded), "n_green": len(greens), "answer": answer})
    return out


def main():
    here = os.path.dirname(os.path.abspath(__file__))
    args = sys.argv[1:]
    if args:
        files = [(f, {"year": "?", "date": "-", "session": "-"}) for f in args]
    else:
        man = json.load(io.open(os.path.join(DEST, "_manifest.json"), encoding="utf-8"))
        eng = [r for r in man if r["stream"] == "engineering" and r["kind"] == "paper"
               and (r["year"] or 0) >= 2021 and r["lang"] != "urdu"]
        eng.sort(key=lambda r: (r["year"], r["date"] or "", r["session"] or ""))
        files = [(r["file"], r) for r in eng]

    keys, summary, tq, tk, perfect = {}, [], 0, 0, 0
    for f, meta in files:
        p = os.path.join(DEST, f)
        if not os.path.exists(p):
            print("MISSING", f)
            continue
        qs = extract(p)
        ok = [q for q in qs if q["answer"] and q["n_opts"] == 4 and q["n_green"] == 1]
        dist = {}
        for q in ok:
            dist[q["answer"]] = dist.get(q["answer"], 0) + 1
        good = len(qs) == 160 and len(ok) == 160
        perfect += 1 if good else 0
        tq += len(qs)
        tk += len(ok)
        print("%s %-5s %-11s %-3s Q=%-4d keys=%-4d dist=%s"
              % ("OK " if good else "!! ", meta["year"], meta["date"] or "-",
                 meta["session"] or "-", len(qs), len(ok), dict(sorted(dist.items()))))
        keys[f] = {str(q["q_no"]): q["answer"] for q in qs}
        summary.append({"file": f, "year": meta["year"], "date": meta["date"],
                        "session": meta["session"], "questions": len(qs), "keys": len(ok)})

    root = os.path.dirname(os.path.dirname(here))
    kd = os.path.join(root, "eapcet", "keys")
    os.makedirs(kd, exist_ok=True)
    io.open(os.path.join(kd, "_extracted.json"), "w", encoding="utf-8").write(json.dumps(keys, indent=1))
    io.open(os.path.join(kd, "_summary.json"), "w", encoding="utf-8").write(json.dumps(summary, indent=1))
    print("")
    print("papers: %d   perfect(160/160): %d   questions: %d   keys: %d (%.1f%%)"
          % (len(summary), perfect, tq, tk, 100.0 * tk / max(1, tq)))


if __name__ == "__main__":
    main()
