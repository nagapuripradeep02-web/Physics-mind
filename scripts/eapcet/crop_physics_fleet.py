"""Crop the Physics section (questions 81-120) of every distinct engineering shift.

Subject ranges were confirmed by reading real questions: Mathematics 1-80, Physics 81-120,
Chemistry 121-160.

Writes eapcet/crops/<paper_id>/qNNN_M.png plus an index the transcription agents read.
The PDFs live in the gitignored pdfs/ tree; the crops go to eapcet/crops/, also gitignored,
because they are re-derivable from the PDFs in one command.
"""
import os, io, json, sys
import pymupdf

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
sys.path.insert(0, HERE)
from crop_questions import markers, crop, DEST

LO, HI, DPI = 81, 120, 150
OUTDIR = os.path.join(ROOT, "eapcet", "crops")


def distinct_shifts():
    """31 files collapse to 26 shifts. Prefer a non-Urdu, larger file per (date, session)."""
    man = json.load(io.open(os.path.join(DEST, "_manifest.json"), encoding="utf-8"))
    eng = [r for r in man if r["stream"] == "engineering" and r["kind"] == "paper"
           and (r["year"] or 0) >= 2021]
    best = {}
    for r in eng:
        k = (r["year"], r["date"], r["session"])
        cur = best.get(k)
        better = (cur is None
                  or (cur["lang"] == "urdu" and r["lang"] != "urdu")
                  or (cur["lang"] == r["lang"] and r["bytes"] > cur["bytes"]))
        if better and not (cur and cur["lang"] != "urdu" and r["lang"] == "urdu"):
            best[k] = r
    return [best[k] for k in sorted(best, key=lambda k: (k[0], k[1] or "", k[2] or ""))]


def paper_id(r):
    return "tg_eapcet_%s_%s_%s" % (r["year"], (r["date"] or "na").replace("-", ""),
                                   (r["session"] or "na").lower())


def main():
    shifts = distinct_shifts()
    only = sys.argv[1:]
    print("distinct engineering shifts:", len(shifts))
    index = []
    for r in shifts:
        pid = paper_id(r)
        if only and pid not in only:
            continue
        d = os.path.join(OUTDIR, pid)
        os.makedirs(d, exist_ok=True)
        doc = pymupdf.open(os.path.join(DEST, r["file"]))
        mk = markers(doc)
        pos = {q: i for i, (q, _, _) in enumerate(mk)}
        made = []
        for q in range(LO, HI + 1):
            if q not in pos:
                print("   %s: Q%d MISSING" % (pid, q))
                continue
            files = []
            for j, px in enumerate(crop(doc, mk, pos[q], dpi=DPI)):
                fn = "q%03d_%d.png" % (q, j)
                px.save(os.path.join(d, fn))
                files.append(fn)
            made.append({"q_no": q, "files": files})
        doc.close()
        index.append({"paper_id": pid, "source_pdf": r["file"], "year": r["year"],
                      "date": r["date"], "session": r["session"], "dir": "eapcet/crops/" + pid,
                      "questions": made})
        print("  %-28s %-11s %-3s  %d questions, %d images"
              % (pid, r["date"] or "-", r["session"] or "-", len(made),
                 sum(len(m["files"]) for m in made)))

    os.makedirs(OUTDIR, exist_ok=True)
    p = os.path.join(OUTDIR, "_index.json")
    if only and os.path.exists(p):
        old = json.load(io.open(p, encoding="utf-8"))
        have = {i["paper_id"] for i in index}
        index = [o for o in old if o["paper_id"] not in have] + index
    io.open(p, "w", encoding="utf-8").write(json.dumps(index, indent=1))
    print("")
    print("papers: %d   questions: %d   images: %d"
          % (len(index), sum(len(i["questions"]) for i in index),
             sum(len(m["files"]) for i in index for m in i["questions"])))
    print("index:", p)


if __name__ == "__main__":
    main()
