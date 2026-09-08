"""Join pool, gate, audit and spot-check into the one file the app is allowed to build from.

A question is verified when the gate passed it, an auditor whose planted controls were all
caught graded it ok or weak at the same sha, and no spot-check failed it at that sha. A chapter
is open when it holds at least OPEN_AT verified questions - ten for a run and three unseen
siblings so "strong now" can be reached - and is not blocked by the spot-check. Only verified
questions carry their solution into the release; an unverified solution never leaves this
directory.

Two numbers print every run and are the reason the release can be trusted: the auditor miss rate
on planted controls (any miss discards that auditor's verdicts) and the disagreement rates
author/key and auditor/author. A question whose two blind authors reached the same option
against the key goes to _escalate.json for the founder - that is the signal that found the four
wrong keys in this corpus.

    python scripts/eapcet/build_release.py
"""
import os, io, sys, json, glob, datetime, collections

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
sys.path.insert(0, HERE)
from gate_solutions import POOL, SOL, GATE, content_sha

AUDIT = os.path.join(SOL, "_audit")
SPOT = os.path.join(SOL, "_spot", "status.json")
ATTEMPTS = os.path.join(SOL, "_attempts")
RELEASE = POOL.replace(".json", ".release.json")
ESCALATE = os.path.join(SOL, "_escalate.json")
OPEN_AT = 13
NEVER_OPEN = {"p1-14": "asked once in 26 exams - not enough to test"}
OK = ("ok", "weak")


def load(p, default=None):
    if not os.path.exists(p):
        return default
    return json.load(io.open(p, encoding="utf-8"))


def now():
    return datetime.datetime.now().astimezone().isoformat(timespec="seconds")


def main():
    pool = load(POOL) or sys.exit("no pool")
    status = load(os.path.join(GATE, "status.json"), {})
    controls = load(os.path.join(GATE, "controls.json"), {})
    spot = load(SPOT, {"items": {}, "blocked_chapters": {}})
    byid = {q["id"]: q for q in pool["questions"]}

    # every audit, by the sha of what it read
    audits = {}
    for f in glob.glob(os.path.join(AUDIT, "*.json")):
        au = load(f)
        if au and au.get("item_sha"):
            audits[au["item_sha"]] = au

    # planted controls: an auditor that passed one has no evidential weight
    misses = collections.defaultdict(list)
    per_auditor = collections.Counter()
    caught = 0
    for sha, c in controls.items():
        au = audits.get(sha)
        if not au:
            continue
        agent = au.get("audited_by", {}).get("agent", "?")
        per_auditor[agent] += 1
        if au.get("verdict") in OK:
            misses[agent].append(c["question_id"])
        else:
            caught += 1
    discredited = set(misses)

    verified, unaudited, failed_audit, spot_failed = {}, [], [], []
    rework, defects = [], []
    author_key_miss = sum(1 for s in status.values() if s.get("reason") == "key_miss")
    gated = len(status)
    aud_vs_author, aud_vs_key, audited_real = 0, 0, 0
    for qid, st in status.items():
        if st["verdict"] != "pass":
            continue
        sha = st["content_sha"]
        au = audits.get(sha)
        if not au:
            unaudited.append(qid)
            continue
        audited_real += 1
        sol = load(os.path.join(SOL, qid + ".json"))
        if au.get("auditor_option") != sol["final_answer"]["option"]:
            aud_vs_author += 1
        if au.get("auditor_option") != byid[qid]["answer"]:
            aud_vs_key += 1
        agent = au.get("audited_by", {}).get("agent", "?")
        ok = au.get("verdict") in OK and au.get("auditor_option") == sol["final_answer"]["option"]
        if au.get("question_defect"):
            defects.append({"question_id": qid, "chapter": byid[qid]["chapter"], "auditor": agent, "note": au["question_defect"]})
        if not ok or agent in discredited:
            failed_audit.append(qid)
            if agent not in discredited:
                rework.append({"question_id": qid, "chapter_key": byid[qid]["chapter_key"], "verdict": au.get("verdict"),
                               "auditor_option": au.get("auditor_option"), "author_option": sol["final_answer"]["option"],
                               "findings": [f.get("field", "") + ": " + (f.get("note") or "")[:120] for f in au.get("findings", [])]})
            continue
        sp = spot["items"].get(qid)
        if sp and sp["sha"] == sha[:8] and sp["verdict"] == "fail":
            spot_failed.append(qid)
            continue
        verified[qid] = {"solution": sol, "verified": {"gate_sha": sha, "audit_verdict": au["verdict"],
                                                       "audited_by": agent,
                                                       "spot_checked": bool(sp and sp["sha"] == sha[:8])}}

    # escalation: two blind authors, same option, against the key
    escalate = []
    for qid, st in status.items():
        if st.get("reason") != "key_miss":
            continue
        cur = load(os.path.join(SOL, qid + ".json"))
        cur_opt = cur["final_answer"]["option"] if cur else None
        for f in sorted(glob.glob(os.path.join(ATTEMPTS, qid + ".*.json"))):
            prev = load(f)
            if prev and prev.get("final_answer", {}).get("option") == cur_opt:
                escalate.append({"question_id": qid, "key": byid[qid]["answer"], "authors_reached": cur_opt,
                                 "attempts": [os.path.basename(f), qid + ".json"], "chapter": byid[qid]["chapter"]})
                break
    io.open(ESCALATE, "w", encoding="utf-8").write(json.dumps(escalate, indent=1, ensure_ascii=False))
    io.open(os.path.join(SOL, "_rework.json"), "w", encoding="utf-8").write(json.dumps(rework, indent=1, ensure_ascii=False))
    io.open(os.path.join(SOL, "_question_defects.json"), "w", encoding="utf-8").write(json.dumps(defects, indent=1, ensure_ascii=False))

    chapters = []
    for c in pool["chapters"]:
        vids = [i for i in c["question_ids"] if i in verified]
        blocked = c["key"] in spot["blocked_chapters"]
        never = NEVER_OPEN.get(c["key"])
        chapters.append({"key": c["key"], "name": c["name"], "paper": c["paper"], "order": c["order"],
                         "answer_book_unit": c["answer_book_unit"], "asked_total": c["asked_total"],
                         "share_pct": c["share_pct"], "per_exam": c["per_exam"], "eligible": c["eligible"],
                         "pool_ids": c["question_ids"], "verified_ids": vids,
                         "open": len(vids) >= OPEN_AT and not blocked and not never,
                         "closed_because": never or ("spot-check blocked" if blocked else
                                                     None if len(vids) >= OPEN_AT else "%d of %d verified" % (len(vids), OPEN_AT))})

    questions = {}
    for q in pool["questions"]:
        row = {k: q[k] for k in ("id", "chapter_key", "chapter", "year", "date", "session", "q_no", "asked_label",
                                 "question_en", "options_en", "answer", "recurrence", "twin_of", "grounding")}
        if q["id"] in verified:
            row.update(verified[q["id"]])
        questions[q["id"]] = row

    rel = {"schema": "eapcet_physics_pool_v1",
           "built_from": dict(pool["built_from"], release_at=now(), open_at=OPEN_AT,
                              gated=gated, verified=len(verified)),
           "exam": pool["exam"], "rules": pool["rules"], "chapters": chapters, "questions": questions,
           "siblings": pool["siblings"]}
    io.open(RELEASE, "w", encoding="utf-8").write(json.dumps(rel, indent=1, ensure_ascii=False))

    print("release: %s" % os.path.relpath(RELEASE, ROOT))
    print("  gated %d  pass %d  verified %d  unaudited %d  failed-audit %d  spot-failed %d"
          % (gated, sum(1 for s in status.values() if s["verdict"] == "pass"), len(verified),
             len(unaudited), len(failed_audit), len(spot_failed)))
    print("  chapters open: %d of %d" % (sum(1 for c in chapters if c["open"]), len(chapters)))
    for c in chapters:
        if c["verified_ids"] or c["open"]:
            print("    %-6s %-40s verified %2d/%2d  %s" % (c["key"], c["name"][:40], len(c["verified_ids"]),
                                                          len(c["pool_ids"]), "OPEN" if c["open"] else c["closed_because"]))
    print("")
    seen = sum(per_auditor.values())
    print("planted controls: %d audited, %d caught, %d missed" % (seen, caught, seen - caught))
    for agent, ids in sorted(misses.items()):
        print("  MISSED by %s: %s  -> every verdict by this auditor discarded; re-audit its slice" % (agent, ids))
    print("disagreement: author vs key %d/%d (%.1f%%)  auditor vs author %d/%d (%.1f%%)  auditor vs key %d/%d (%.1f%%)"
          % (author_key_miss, gated, 100.0 * author_key_miss / max(1, gated),
             aud_vs_author, audited_real, 100.0 * aud_vs_author / max(1, audited_real),
             aud_vs_key, audited_real, 100.0 * aud_vs_key / max(1, audited_real)))
    print("escalations (two blind authors agree against the key): %d -> %s" % (len(escalate), os.path.relpath(ESCALATE, ROOT)))
    for e in escalate:
        print("  %s  key %d, both authors %d  (%s)" % (e["question_id"], e["key"], e["authors_reached"], e["chapter"]))
    print("rework (audit wrong/harmful, to re-author blind): %d -> eapcet/solutions/_rework.json" % len(rework))
    for r in rework:
        print("  %s %s %s: %s" % (r["question_id"], r["chapter_key"], r["verdict"], "; ".join(r["findings"])[:110]))
    print("question defects noted by auditors: %d -> eapcet/solutions/_question_defects.json" % len(defects))
    for d in defects:
        print("  %s (%s): %s" % (d["question_id"], d["chapter"], d["note"][:110]))


if __name__ == "__main__":
    main()
