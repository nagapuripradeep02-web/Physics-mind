"""Merge the transcripts and the official keys into one question bank per subject.

The ANSWER OF RECORD is the key extracted from the PDF, never the agent's reading of the
green tick. The two are produced by different processes; where they disagree the key wins and
the row is flagged so a human can look. Keeping the agent's reading in the row is what makes
that disagreement visible at all - drop it and the bank looks certain when it is not.

Subject comes from the question number, so a paper transcribed in halves merges by itself.
A question whose transcript is incomplete is EXCLUDED from the bank and listed in the gaps
file. A bank that quietly carries a blank option is worse than a bank that is honestly short.

    python scripts/eapcet/build_bank.py
"""
import os, io, json, glob, re, sys, collections

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from chapters import CHAPTERS, SUBJECTS, subject_of
from check_transcripts import structural_defect

# The transcribing agent recomputes the physics and says so when its result contradicts the
# option the paper marked. Four of the 1,040 physics questions tripped this, and by hand all
# four were right: two are typos in the printed question or option, two are outright wrong
# official keys. A wrong official key is still the answer that scored marks in the real exam,
# so the row keeps it - but it must never reach a student unreviewed.
DISPUTE = re.compile(
    r"does\s*n.t\s+match|inconsist|discrepan|contradict|may\s+be\s+an\s+error|"
    r"error\s+in\s+the\s+paper|answer[- ]key\s+(?:error|discrepan)|"
    r"but\s+comput|gives\s+\S+\s+\(option",
    re.I)

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
TDIR = os.path.join(ROOT, "eapcet", "transcripts")
BANK = os.path.join(ROOT, "eapcet", "bank")


def load(p):
    return json.load(io.open(p, encoding="utf-8"))


def main():
    keys = load(os.path.join(ROOT, "eapcet", "keys", "_extracted.json"))
    idx = {i["paper_id"]: i for i in load(os.path.join(ROOT, "eapcet", "crops", "_index.json"))}

    rows, gaps = [], []
    for f in sorted(glob.glob(os.path.join(TDIR, "tg_*.json"))):
        d = load(f)
        pid = d["paper_id"]
        meta = idx.get(pid, {})
        k = keys.get(meta.get("source_pdf", ""), {})
        for q in d["questions"]:
            # Subject normally comes from the question number. One question breaks that: the
            # 3 May 2025 afternoon paper prints a photoelectric-effect physics question at
            # number 122, inside the chemistry block. Verified by reading the page - the paper
            # is wrong, not the numbering - so the transcript carries an explicit override.
            subject = q.get("subject_override") or subject_of(q.get("q_no") or 0)
            if not subject:
                continue
            official = k.get(str(q["q_no"]))
            saw = q.get("marked_correct")
            note = q.get("note") or ""
            broken = structural_defect(q)
            row = {
                "id": "%s_q%03d" % (pid, q["q_no"]),
                "paper_id": pid,
                "year": meta.get("year"),
                "date": meta.get("date"),
                "session": meta.get("session"),
                "subject": subject,
                "q_no": q["q_no"],
                "question_en": q.get("question_en"),
                "options_en": q.get("options_en"),
                "answer": official,                 # from the PDF, the answer of record
                "answer_source": "official_key_pdf",
                "vision_marked_correct": saw,       # the independent second reading
                "answer_disputed": bool(official and saw and official != saw),
                "chapter": q.get("chapter"),
                "year_cycle": q.get("year_cycle"),
                "needs_figure": note.startswith("has diagram"),
                "key_disputed_by_working": bool(DISPUTE.search(note)),
                "transcription_confidence": q.get("confidence"),
                "note": note,
                "crops": "eapcet/crops/%s" % pid,
            }
            if broken:
                gaps.append(dict(row, defect=broken))
            else:
                rows.append(row)

    os.makedirs(BANK, exist_ok=True)
    io.open(os.path.join(BANK, "_gaps.json"), "w", encoding="utf-8").write(json.dumps(
        {"why": ("These questions were transcribed but are incomplete, so they are held OUT of "
                 "the bank rather than shipped with a hole in them. Fix the transcript, or "
                 "re-crop the source, then rebuild."),
         "questions": gaps}, indent=1, ensure_ascii=False))

    review = [r for r in rows if r["key_disputed_by_working"] or r["answer_disputed"]]
    io.open(os.path.join(BANK, "_review_queue.json"), "w", encoding="utf-8").write(json.dumps(
        {"why": ("Every row here needs a human before it is shown to a student. Either the "
                 "recomputed working contradicts the answer the paper marked, or the two "
                 "independent readings of the green tick disagreed."),
         "questions": review}, indent=1, ensure_ascii=False))

    print("%-10s %7s %7s %7s %7s %7s %7s"
          % ("subject", "papers", "quest", "answer", "figure", "dispute", "held"))
    for subject in ("maths", "physics", "chemistry"):
        rs = [r for r in rows if r["subject"] == subject]
        if not rs:
            continue
        g = [x for x in gaps if x["subject"] == subject]
        out = os.path.join(BANK, "%s_v1.json" % subject)
        io.open(out, "w", encoding="utf-8").write(json.dumps(
            {"schema": "eapcet_%s_bank_v1" % subject, "subject": subject,
             "answer_of_record":
                 "the key extracted from the official CBT PDF, not the vision pass",
             "questions": rs}, indent=1, ensure_ascii=False))
        print("%-10s %7d %7d %7d %7d %7d %7d"
              % (subject, len({r["paper_id"] for r in rs}), len(rs),
                 len([r for r in rs if r["answer"]]),
                 len([r for r in rs if r["needs_figure"]]),
                 len([r for r in rs if r["key_disputed_by_working"] or r["answer_disputed"]]),
                 len(g)))
        missing = set(CHAPTERS[subject]) - {r["chapter"] for r in rs}
        if missing:
            print("           chapters with no question yet: %s" % ", ".join(sorted(missing)))

    print("")
    print("total in the bank : %d" % len(rows))
    print("held out as gaps  : %d  -> eapcet/bank/_gaps.json" % len(gaps))
    print("needing a human   : %d  -> eapcet/bank/_review_queue.json" % len(review))


if __name__ == "__main__":
    main()
