"""Score the vision transcripts against the official key extracted from the PDF.

Every transcript records which option the agent SAW carrying the green tick. The key
extractor read the same answer a completely different way - from the fill colour of the
option-label text span. Two independent methods reading the same fact means a disagreement
names a real defect in one of them, and the agreement rate is a measured accuracy number
rather than a self-assessment.

    python scripts/eapcet/check_transcripts.py
"""
import os, io, json, glob, re, collections

PLACEHOLDER = re.compile(
    r"not\s+visible|not\s+legible|unreadable|illegible|cropped|not\s+shown|"
    r"could\s+not\s+read|placeholder|not\s+transcribed|missing\s+text|TODO|N/?A",
    re.I)

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
TDIR = os.path.join(ROOT, "eapcet", "transcripts")
KEYS = os.path.join(ROOT, "eapcet", "keys", "_extracted.json")
INDEX = os.path.join(ROOT, "eapcet", "crops", "_index.json")

CH_ORDER = [
    "Physical World and Measurement", "Motion in a Straight Line", "Motion in a Plane",
    "Laws of Motion", "Work Power Energy", "System of Particles and Rotational Motion",
    "Oscillations", "Gravitation", "Mechanical Properties of Solids",
    "Mechanical Properties of Fluids", "Thermal Properties of Matter", "Thermodynamics",
    "Kinetic Theory", "Physics of Emerging Technologies",
    "Waves", "Ray Optics and Optical Instruments", "Wave Optics",
    "Electric Charges and Fields", "Electric Potential and Capacitance", "Current Electricity",
    "Moving Charges and Magnetism", "Magnetism and Matter", "Electromagnetic Induction",
    "Alternating Current", "Electromagnetic Waves", "Dual Nature of Radiation and Matter",
    "Atoms", "Nuclei", "Semiconductor Electronics", "Communication System",
]


def load(p):
    return json.load(io.open(p, encoding="utf-8"))


def main():
    keys = load(KEYS)
    idx = load(INDEX)
    src = {i["paper_id"]: i["source_pdf"] for i in idx}
    nfiles = {(i["paper_id"], m["q_no"]): len(m["files"]) for i in idx for m in i["questions"]}

    files = sorted(glob.glob(os.path.join(TDIR, "*.json")))
    if not files:
        print("no transcripts yet in", TDIR)
        return

    chap = collections.Counter()
    conf = collections.Counter()
    tot = agree = scored = 0
    unknown_ch, flagged, mismatches, broken, doubted = [], [], [], [], []

    print("%-32s %4s %5s %6s  %s" % ("paper", "q", "key", "agree", "confidence"))
    for f in files:
        d = load(f)
        pid = d.get("paper_id") or os.path.basename(f)[:-5]
        qs = d.get("questions", [])
        k = keys.get(src.get(pid, ""), {})
        a = s = 0
        seen = collections.Counter(q.get("q_no") for q in qs)
        for dup, c in seen.items():
            if c > 1:
                broken.append((pid, dup, "appears %d times" % c))
        for want in range(81, 121):
            if want not in seen:
                broken.append((pid, want, "missing from the transcript"))
        for q in qs:
            tot += 1
            conf[q.get("confidence", "?")] += 1
            c = q.get("chapter")
            if c in CH_ORDER:
                chap[c] += 1
            else:
                unknown_ch.append((pid, q.get("q_no"), c))
            note = q.get("note") or ""
            if note:
                flagged.append((pid, q.get("q_no"), note))
            low = note.lower()
            claims_absent = any(w in low for w in ("no _1", "no continuation", "not exist",
                                                   "missing image", "no second image",
                                                   "unreadable", "unconfirmed", "could not read",
                                                   "cut off", "cropped off"))
            if claims_absent:
                have = nfiles.get((pid, q.get("q_no")), 0)
                doubted.append((pid, q.get("q_no"), have, note[:110]))
            opts = q.get("options_en")
            why = None
            if not isinstance(opts, list) or len(opts) != 4:
                why = "options_en is not 4 items"
            elif any(not str(o).strip() for o in opts):
                why = "an option is empty"
            elif [o for o in opts if PLACEHOLDER.search(str(o))]:
                # Placeholder prose passes every emptiness check and then reaches a student as
                # a real choice. Non-empty is not the same as read.
                why = "an option is placeholder prose, not transcribed text: %r" % (
                    [o for o in opts if PLACEHOLDER.search(str(o))][0][:60])
            elif not str(q.get("question_en", "")).strip():
                why = "question_en is empty"
            elif q.get("marked_correct") not in (1, 2, 3, 4):
                why = "marked_correct is %r" % q.get("marked_correct")
            elif not (81 <= (q.get("q_no") or 0) <= 120):
                why = "q_no out of the physics range"
            if why:
                broken.append((pid, q.get("q_no"), why))
            official = k.get(str(q.get("q_no")))
            if official:
                s += 1
                if q.get("marked_correct") == official:
                    a += 1
                else:
                    mismatches.append((pid, q.get("q_no"), q.get("marked_correct"),
                                       official, q.get("confidence")))
        agree += a
        scored += s
        pct = (100.0 * a / s) if s else 0.0
        print("%-32s %4d %5d %5.1f%%  %s"
              % (pid, len(qs), s, pct,
                 " ".join("%s=%d" % (x, y) for x, y in
                          sorted(collections.Counter(q.get("confidence") for q in qs).items()))))

    print("")
    print("questions transcribed : %d" % tot)
    print("scored against the key: %d" % scored)
    print("green tick agrees     : %d  (%.1f%%)" % (agree, 100.0 * agree / max(1, scored)))
    print("confidence            : %s" % dict(sorted(conf.items())))

    if broken:
        print("")
        print("STRUCTURAL DEFECTS: %d" % len(broken))
        for pid, q, why in broken[:40]:
            print("  %-32s Q%-4s %s" % (pid, q, why))
    else:
        print("structure            : every paper has 81-120 once, 4 non-empty options each")

    if mismatches:
        print("")
        print("DISAGREEMENTS (agent read vs official key) - each is a real defect somewhere:")
        for pid, q, saw, off, cf in mismatches:
            print("  %-32s Q%-4s agent=%s key=%s  confidence=%s" % (pid, q, saw, off, cf))

    if doubted:
        print("")
        print("NOTES CLAIMING SOMETHING WAS UNREADABLE OR ABSENT: %d" % len(doubted))
        print("  'crops' is how many images that question actually has. A note claiming a")
        print("  missing continuation on a question with 2 crops means the agent did not look.")
        for pid, q, have, n in doubted:
            print("  %-32s Q%-4s crops=%d  %s" % (pid, q, have, n))

    if unknown_ch:
        print("")
        print("chapters not on the list: %d" % len(unknown_ch))
        for pid, q, c in unknown_ch[:20]:
            print("  %-32s Q%-4s %r" % (pid, q, c))

    if flagged:
        print("")
        print("questions carrying a note: %d" % len(flagged))
        for pid, q, n in flagged[:25]:
            print("  %-32s Q%-4s %s" % (pid, q, n[:90]))

    print("")
    print("=== chapter frequency (Physics, %d questions) ===" % sum(chap.values()))
    n = max(1, sum(chap.values()))
    for c in CH_ORDER:
        v = chap.get(c, 0)
        print("  %-42s %4d  %5.1f%%  %s" % (c, v, 100.0 * v / n, "#" * int(round(40.0 * v / n))))


if __name__ == "__main__":
    main()
