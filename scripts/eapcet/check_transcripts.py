"""Score every transcript against the official key, gate its structure, print the frequency table.

Two processes read the same fact a different way. The extractor reads the fill colour of the
option-label text span inside the PDF; the transcribing agent reads the rendered green tick. Where
they disagree, one of them is wrong and a human has to look. That disagreement rate is the only
honest accuracy number available, because a measure computed from the same reading cannot audit
that reading. It is what caught a page-ordering bug that had a quarter of every 2023 key wrong
while every self-check reported perfection.

Subject comes from the question number, not the filename, so a paper transcribed in halves by two
agents scores exactly like one transcribed whole.

    python scripts/eapcet/check_transcripts.py            # every subject
    python scripts/eapcet/check_transcripts.py chemistry  # one subject
"""
import os, io, json, glob, re, sys, collections

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from chapters import CHAPTERS, SUBJECTS, subject_of

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
TDIR = os.path.join(ROOT, "eapcet", "transcripts")

# Placeholder prose passes every emptiness check and then reaches a student as a real choice.
# Non-empty is not the same as read.
PLACEHOLDER = re.compile(
    r"not\s+visible|not\s+legible|unreadable|illegible|cropped|not\s+shown|could\s+not\s+read|"
    r"placeholder|not\s+transcribed|missing\s+text|not\s+captured|not\s+recoverable|"
    r"not\s+in\s+(?:the\s+)?source|source\s+image|re-?crop|no\s+option\s+text|"
    r"blank\s+in\s+source|see\s+note|unverified", re.I)
# The list above grew twice, each time because a phrasing slipped through and a row with a hole
# in it reached the bank: first "(option 3 not visible)", then "NOT CAPTURED IN SOURCE IMAGE".
# Agents invent new ways to say "I could not read this", so match the intent broadly, and keep
# every phrase here impossible to find in a genuine chemistry, physics or maths option.

# A bare refusal token, compared against the WHOLE trimmed option. Matching "N/A" loosely inside
# an option flagged the sodium ion Na+ on the first chemistry paper that landed. A gate that
# fires on real chemistry is worse than no gate, because it trains you to skim its output.
BARE_REFUSAL = {"n/a", "na", "todo", "tbd", "-", "--", "?", "none", "blank", "unknown"}

# A note claiming an image was absent is checked against how many crops that question really has.
ABSENT = ("no _1", "no continuation", "not exist", "missing image", "no second image",
          "unreadable", "unconfirmed", "could not read", "cut off", "cropped off",
          "is the only image")


def load(p):
    return json.load(io.open(p, encoding="utf-8"))


def structural_defect(q):
    opts = q.get("options_en")
    if not isinstance(opts, list) or len(opts) != 4:
        return "options_en is not 4 items"
    if any(not str(o).strip() for o in opts):
        return "an option is empty"
    bad = [o for o in opts if PLACEHOLDER.search(str(o))]
    if bad:
        return "an option is placeholder prose, not transcribed text: %r" % str(bad[0])[:60]
    bare = [o for o in opts if str(o).strip().lower() in BARE_REFUSAL]
    if bare:
        return "an option is a bare refusal token: %r" % str(bare[0])[:60]
    if not str(q.get("question_en", "")).strip():
        return "question_en is empty"
    if q.get("marked_correct") not in (1, 2, 3, 4):
        return "marked_correct is %r" % q.get("marked_correct")
    return None


def main():
    want = sys.argv[1] if len(sys.argv) > 1 else None
    keys = load(os.path.join(ROOT, "eapcet", "keys", "_extracted.json"))
    idx = load(os.path.join(ROOT, "eapcet", "crops", "_index.json"))
    src = {i["paper_id"]: i["source_pdf"] for i in idx}
    nfiles = {(i["paper_id"], m["q_no"]): len(m["files"]) for i in idx for m in i["questions"]}
    cropped = collections.defaultdict(set)
    for i in idx:
        cropped[i.get("subject", "physics")].add(i["paper_id"])

    # (paper_id, subject) -> [question, ...], merged across however many files produced it
    groups = collections.defaultdict(list)
    for f in sorted(glob.glob(os.path.join(TDIR, "*.json"))):
        d = load(f)
        pid = d.get("paper_id")
        if not pid:
            print("SKIP (no paper_id):", os.path.basename(f))
            continue
        for q in d.get("questions", []):
            s = subject_of(q.get("q_no") or 0)
            if s:
                groups[(pid, s)].append(q)

    subjects = [want] if want else sorted({s for _, s in groups})
    grand = {}
    for subject in subjects:
        lo, hi = SUBJECTS[subject]
        allowed = set(CHAPTERS[subject])
        chap, conf = collections.Counter(), collections.Counter()
        tot = agree = scored = 0
        unknown_ch, mismatches, broken, doubted, tainted = [], [], [], [], []

        rows = sorted([k for k in groups if k[1] == subject])
        if not rows:
            continue
        print("")
        print("=" * 78)
        print("%s  (questions %d-%d)" % (subject.upper(), lo, hi))
        print("%-32s %4s %5s %6s  %s" % ("paper", "q", "key", "agree", "confidence"))
        for pid, _ in rows:
            qs = groups[(pid, subject)]
            k = keys.get(src.get(pid, ""), {})
            a = s = 0
            seen = collections.Counter(q.get("q_no") for q in qs)
            for dup, c in seen.items():
                if c > 1:
                    broken.append((pid, dup, "appears %d times" % c))
            for miss in range(lo, hi + 1):
                if miss not in seen:
                    broken.append((pid, miss, "missing from the transcript"))

            for q in qs:
                tot += 1
                conf[q.get("confidence", "?")] += 1
                c = q.get("chapter")
                if c in allowed:
                    chap[c] += 1
                else:
                    unknown_ch.append((pid, q.get("q_no"), c))

                why = structural_defect(q)
                if why:
                    broken.append((pid, q.get("q_no"), why))

                note = (q.get("note") or "")
                if any(w in note.lower() for w in ABSENT):
                    doubted.append((pid, q.get("q_no"),
                                    nfiles.get((pid, q.get("q_no")), 0), note[:110]))

                official = k.get(str(q.get("q_no")))
                if q.get("independence") == "compromised":
                    # The agent admitted consulting the extracted key for this question, so its
                    # agreement proves nothing. Counting it would inflate the one number in this
                    # whole pipeline that is supposed to be earned.
                    tainted.append((pid, q.get("q_no")))
                elif official:
                    s += 1
                    if q.get("marked_correct") == official:
                        a += 1
                    else:
                        mismatches.append((pid, q.get("q_no"), q.get("marked_correct"),
                                           official, q.get("confidence")))
            agree += a
            scored += s
            print("%-32s %4d %5d %5.1f%%  %s"
                  % (pid, len(qs), s, (100.0 * a / s) if s else 0.0,
                     " ".join("%s=%d" % (x, y) for x, y in
                              sorted(collections.Counter(
                                  q.get("confidence") for q in qs).items()))))

        missing_papers = sorted(cropped[subject] - {p for p, _ in rows})
        print("")
        print("papers transcribed    : %d of %d cropped" % (len(rows), len(cropped[subject])))
        if missing_papers:
            print("  not yet transcribed : %s" % ", ".join(missing_papers))
        print("questions transcribed : %d" % tot)
        print("scored against the key: %d" % scored)
        print("green tick agrees     : %d  (%.1f%%)" % (agree, 100.0 * agree / max(1, scored)))
        print("confidence            : %s" % dict(sorted(conf.items())))
        if tainted:
            print("EXCLUDED, agent consulted the key: %s"
                  % ", ".join("%s Q%s" % t for t in tainted))
        grand[subject] = (tot, scored, agree, len(broken), len(mismatches))

        if broken:
            print("")
            print("STRUCTURAL DEFECTS: %d" % len(broken))
            for pid, q, w in broken[:40]:
                print("  %-32s Q%-4s %s" % (pid, q, w))
        else:
            print("structure             : every paper has %d-%d once, 4 real options each"
                  % (lo, hi))

        if mismatches:
            print("")
            print("DISAGREEMENTS (agent read vs official key) - each is a real defect somewhere:")
            for pid, q, saw, off, cf in mismatches:
                print("  %-32s Q%-4s agent=%s key=%s  confidence=%s" % (pid, q, saw, off, cf))

        if doubted:
            print("")
            print("NOTES CLAIMING SOMETHING WAS UNREADABLE OR ABSENT: %d" % len(doubted))
            print("  'crops' is the real image count. A note claiming a missing continuation on a")
            print("  question that has 2 crops means the agent did not look.")
            for pid, q, have, n in doubted:
                print("  %-32s Q%-4s crops=%d  %s" % (pid, q, have, n))

        if unknown_ch:
            print("")
            print("CHAPTERS NOT ON THE LIST: %d questions" % len(unknown_ch))
            for c, n in collections.Counter(c for _, _, c in unknown_ch).most_common(15):
                print("  %-50s %d" % (repr(c)[:50], n))

        print("")
        print("--- %s chapter frequency (%d questions) ---" % (subject, sum(chap.values())))
        n = max(1, sum(chap.values()))
        for c in CHAPTERS[subject]:
            v = chap.get(c, 0)
            print("  %-46s %4d  %4.1f%%  %s"
                  % (c, v, 100.0 * v / n, "#" * int(round(60.0 * v / n))))

    if len(grand) > 1:
        print("")
        print("=" * 78)
        print("%-12s %8s %8s %8s %8s %8s"
              % ("subject", "quest", "scored", "agree", "broken", "differ"))
        for s, (t, sc, a, b, m) in grand.items():
            print("%-12s %8d %8d %7.1f%% %8d %8d"
                  % (s, t, sc, 100.0 * a / max(1, sc), b, m))


if __name__ == "__main__":
    main()
