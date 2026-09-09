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
import os, io, sys, json, glob, copy, hashlib, datetime, collections

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
sys.path.insert(0, HERE)
from gate_solutions import POOL, SOL, GATE, ROUTES, content_sha, routes_sha, idioms_from_ts, idioms_in

AUDIT = os.path.join(SOL, "_audit")
AUDIT_ROUTES = os.path.join(SOL, "_audit_routes")
SHAPES = os.path.join(ROOT, "eapcet", "pool", "shapes.json")
SHAPES_MAX = 12
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

    # the routes sidecars: their own audits, their own controls, their own discredit list
    audits_routes = {}
    for f in glob.glob(os.path.join(AUDIT_ROUTES, "*.json")):
        au = load(f)
        if au and au.get("item_sha"):
            audits_routes[au["item_sha"]] = au
    routes_controls = load(os.path.join(GATE, "routes_controls.json"), {})
    routes_status = load(os.path.join(GATE, "routes_status.json"), {})
    misses_routes = collections.defaultdict(list)
    routes_seen, routes_caught = 0, 0
    for sha, c in routes_controls.items():
        au = audits_routes.get(sha)
        if not au:
            continue
        routes_seen += 1
        if au.get("verdict") in OK:
            misses_routes[au.get("audited_by", {}).get("agent", "?")].append(c["question_id"])
        else:
            routes_caught += 1
    discredited_routes = set(misses_routes)

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

    # routes: attached to the RELEASE COPY of a verified solution only. The file on disk is never
    # touched, so a verified solution keeps its sha and its verdict whether or not routes exist.
    routes_verified, routes_unaudited, routes_rework = set(), [], []
    for qid in list(verified):
        rs = routes_status.get(qid)
        if not rs or rs.get("verdict") != "pass" or rs.get("solution_sha") != verified[qid]["verified"]["gate_sha"]:
            continue
        rau = audits_routes.get(rs["routes_sha"])
        if not rau:
            routes_unaudited.append(qid)
            continue
        agent = rau.get("audited_by", {}).get("agent", "?")
        if rau.get("verdict") not in OK or agent in discredited_routes:
            if agent not in discredited_routes:
                routes_rework.append({"question_id": qid, "chapter_key": byid[qid]["chapter_key"], "verdict": rau.get("verdict"),
                                      "findings": [f.get("field", "") + ": " + (f.get("note") or "")[:120] for f in rau.get("findings", [])]})
            continue
        side = load(os.path.join(ROUTES, qid + ".json"))
        if not side or routes_sha(side) != rs["routes_sha"]:
            continue
        sol_rel = copy.deepcopy(verified[qid]["solution"])
        sol_rel["right_route"] = side["right_route"]
        for m in side["mistakes"]:
            sol_rel["common_mistakes"][m["index"]]["type"] = m["type"]
            sol_rel["common_mistakes"][m["index"]]["route"] = m["route"]
        verified[qid]["solution"] = sol_rel
        verified[qid]["verified"]["routes"] = {"routes_sha": rs["routes_sha"], "audit_verdict": rau["verdict"], "audited_by": agent}
        routes_verified.add(qid)
    rework_routes_path = os.path.join(SOL, "_rework_routes.json")
    if routes_status or os.path.exists(rework_routes_path):
        io.open(rework_routes_path, "w", encoding="utf-8").write(json.dumps(routes_rework, indent=1, ensure_ascii=False))

    # shapes: authored per chapter in eapcet/pool/shapes.json; a chapter absent from it has none yet
    shapes = load(SHAPES, {}) if os.path.exists(SHAPES) else {}
    shapes_sha = None
    if shapes:
        shapes_sha = hashlib.sha256(open(SHAPES, "rb").read()).hexdigest()
        idioms = idioms_from_ts()
        bych = {c["key"]: c for c in pool["chapters"]}
        bad = []
        for ck, entry in shapes.items():
            c = bych.get(ck)
            if not c:
                bad.append("%s: not a chapter key" % ck)
                continue
            lst = entry.get("shapes") or []
            asg = entry.get("assignments") or {}
            keys = [s.get("key") for s in lst]
            if not lst:
                bad.append("%s: no shapes" % ck)
            if len(lst) > SHAPES_MAX:
                bad.append("%s: %d shapes, at most %d" % (ck, len(lst), SHAPES_MAX))
            if len(set(keys)) != len(keys):
                bad.append("%s: duplicate shape keys" % ck)
            for s in lst:
                if not s.get("key") or not isinstance(s["key"], str):
                    bad.append("%s: a shape without a key" % ck)
                    continue
                lab = s.get("label") or ""
                if not lab.strip() or len(lab.split()) > 6:
                    bad.append("%s: shape %s label missing or over six words" % (ck, s["key"]))
                if idioms_in(lab, idioms):
                    bad.append("%s: shape %s label carries an idiom" % (ck, s["key"]))
                if not any(v == s["key"] for v in asg.values()):
                    bad.append("%s: shape %s has no pool question" % (ck, s["key"]))
            for qid, k in asg.items():
                if qid not in c["question_ids"]:
                    bad.append("%s: assignment %s is not in the pool" % (ck, qid))
                if k not in keys:
                    bad.append("%s: assignment %s names unknown shape %s" % (ck, qid, k))
            for qid in c["question_ids"]:
                if qid in verified and qid not in asg:
                    bad.append("%s: verified %s has no shape" % (ck, qid))
        if bad:
            print("SHAPES GATE FAILED - refusing to build a release on a wrong shape list:")
            for b in bad:
                print("  " + b)
            sys.exit(1)

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
        ch = {"key": c["key"], "name": c["name"], "paper": c["paper"], "order": c["order"],
              "answer_book_unit": c["answer_book_unit"], "asked_total": c["asked_total"],
              "share_pct": c["share_pct"], "per_exam": c["per_exam"], "eligible": c["eligible"],
              "pool_ids": c["question_ids"], "verified_ids": vids,
              "open": len(vids) >= OPEN_AT and not blocked and not never,
              "closed_because": never or ("spot-check blocked" if blocked else
                                          None if len(vids) >= OPEN_AT else "%d of %d verified" % (len(vids), OPEN_AT))}
        if c["key"] in shapes:
            ch["shapes"] = [{"key": s["key"], "label": s["label"]} for s in shapes[c["key"]]["shapes"]]
        chapters.append(ch)

    questions = {}
    for q in pool["questions"]:
        row = {k: q[k] for k in ("id", "chapter_key", "chapter", "year", "date", "session", "q_no", "asked_label",
                                 "question_en", "options_en", "answer", "recurrence", "twin_of", "grounding")}
        if q["id"] in verified:
            row.update(verified[q["id"]])
        sh = shapes.get(q["chapter_key"])
        if sh and q["id"] in (sh.get("assignments") or {}):
            k = sh["assignments"][q["id"]]
            row["shape"] = {"key": k, "label": next((s["label"] for s in sh["shapes"] if s["key"] == k), k)}
        questions[q["id"]] = row

    rel = {"schema": "eapcet_physics_pool_v1",
           "built_from": dict(pool["built_from"], release_at=now(), open_at=OPEN_AT,
                              gated=gated, verified=len(verified),
                              **({"shapes_sha256": shapes_sha} if shapes_sha else {})),
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
    for c in chapters:
        rv = [i for i in c["verified_ids"] if i in routes_verified]
        if rv or c["key"] in shapes:
            labelled = sum(1 for i in c["verified_ids"]
                           for m in verified[i]["solution"].get("common_mistakes", []) if m.get("option"))
            wrong = 3 * len(c["verified_ids"])
            print("    %-6s routes verified %2d/%2d  shapes %2d  labelled wrong options %d/%d (%d%%)"
                  % (c["key"], len(rv), len(c["verified_ids"]), len(c.get("shapes", [])),
                     labelled, wrong, 100 * labelled // max(1, wrong)))
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
    if routes_status:
        print("")
        print("routes: verified %d, unaudited %d, rework %d -> eapcet/solutions/_rework_routes.json"
              % (len(routes_verified), len(routes_unaudited), len(routes_rework)))
        print("routes controls: %d audited, %d caught, %d missed" % (routes_seen, routes_caught, routes_seen - routes_caught))
        for agent, ids in sorted(misses_routes.items()):
            print("  MISSED by %s: %s  -> every routes verdict by this auditor discarded; re-audit its slice" % (agent, ids))
        for r in routes_rework:
            print("  %s %s %s: %s" % (r["question_id"], r["chapter_key"], r["verdict"], "; ".join(r["findings"])[:110]))


if __name__ == "__main__":
    main()
