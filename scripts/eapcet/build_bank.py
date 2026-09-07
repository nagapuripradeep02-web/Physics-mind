"""Merge the transcripts and the official keys into one physics question bank.

The ANSWER OF RECORD is the key extracted from the PDF, never the agent's reading of the
green tick. The two are produced by different processes; where they disagree the key wins and
the row is flagged so a human can look. Keeping the agent's reading in the row is what makes
that disagreement visible at all - drop it and the bank looks certain when it is not.

    python scripts/eapcet/build_bank.py
"""
import os, io, json, glob, re, collections

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

    rows, disputed, needs_figure, review = [], 0, 0, []
    for f in sorted(glob.glob(os.path.join(TDIR, "tg_*.json"))):
        d = load(f)
        pid = d["paper_id"]
        meta = idx.get(pid, {})
        k = keys.get(meta.get("source_pdf", ""), {})
        for q in d["questions"]:
            official = k.get(str(q["q_no"]))
            saw = q.get("marked_correct")
            note = q.get("note") or ""
            figure = note.startswith("has diagram")
            key_disputed = bool(DISPUTE.search(note))
            needs_figure += 1 if figure else 0
            disputed += 1 if (official and saw and official != saw) else 0
            rows.append({
                "id": "%s_q%03d" % (pid, q["q_no"]),
                "paper_id": pid,
                "year": meta.get("year"),
                "date": meta.get("date"),
                "session": meta.get("session"),
                "subject": "physics",
                "q_no": q["q_no"],
                "question_en": q.get("question_en"),
                "options_en": q.get("options_en"),
                "answer": official,                 # from the PDF, the answer of record
                "answer_source": "official_key_pdf",
                "vision_marked_correct": saw,       # the independent second reading
                "answer_disputed": bool(official and saw and official != saw),
                "chapter": q.get("chapter"),
                "year_cycle": q.get("year_cycle"),
                "needs_figure": figure,
                "key_disputed_by_physics": key_disputed,
                "transcription_confidence": q.get("confidence"),
                "note": note,
                "crops": "eapcet/crops/%s" % pid,
            })

    review = [r for r in rows if r["key_disputed_by_physics"] or r["answer_disputed"]]

    os.makedirs(BANK, exist_ok=True)
    io.open(os.path.join(BANK, "_review_queue.json"), "w", encoding="utf-8").write(json.dumps(
        {"why": ("Every row here needs a human before it is shown to a student. Either the "
                 "recomputed physics contradicts the answer the paper marked, or the two "
                 "independent readings of the green tick disagreed."),
         "questions": review}, indent=1, ensure_ascii=False))
    out = os.path.join(BANK, "physics_v1.json")
    io.open(out, "w", encoding="utf-8").write(json.dumps(
        {"schema": "eapcet_physics_bank_v1", "subject": "physics",
         "answer_of_record": "the key extracted from the official CBT PDF, not the vision pass",
         "questions": rows}, indent=1, ensure_ascii=False))

    papers = len({r["paper_id"] for r in rows})
    ch = collections.Counter(r["chapter"] for r in rows)
    print("papers            : %d" % papers)
    print("questions         : %d" % len(rows))
    print("with an answer    : %d" % len([r for r in rows if r["answer"]]))
    print("answer disputed   : %d" % disputed)
    print("need the figure   : %d  (%.0f%%)" % (needs_figure, 100.0 * needs_figure / max(1, len(rows))))
    print("key disputed by physics: %d" % len([r for r in rows if r["key_disputed_by_physics"]]))
    print("review queue      : %d" % len(review))
    print("distinct chapters : %d of 30" % len(ch))
    print("written           :", out)


if __name__ == "__main__":
    main()
