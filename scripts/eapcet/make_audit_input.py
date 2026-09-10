"""Build what an auditor is allowed to see, and plant the controls that measure the auditor.

An auditor sees the question, the options and the solution's content fields. Not the key, not
the gate's verdict, not who wrote it, not the author's confidence. It solves first and reads
second, so its option is a third independent reading of the key (the author's was the second).

One item per chapter batch is a planted control: a gate-passing solution copied and given a
deliberate error, sent in place of the real one. The auditor is told controls exist and not
which items they are. An auditor that marks a control `ok` has shown that its `ok`s are not
evidence; build_release.py prints that rate every wave and ignores that auditor's verdicts.
The real solution behind a control is simply not audited yet, so the next run of this script
queues it again.

Audit files are named <question_id>.<first 8 of item_sha>.json, so a verdict can never attach
to content other than what the auditor read.

    python scripts/eapcet/make_audit_input.py [--wave N] [--no-controls]
    python scripts/eapcet/make_audit_input.py --role routes [--wave N] [--no-controls]
        # the routes sidecars: queue _audit_input_routes/, controls in _gate/routes_controls.json,
        # audits expected in _audit_routes/. A routes control swaps one mistake's type or puts a
        # wrong route where the right one belongs; the auditor is expected to grade it wrong.
"""
import os, io, re, sys, json, copy, glob, hashlib, argparse, datetime, collections

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from gate_solutions import content_sha, routes_sha, POOL, SOL, GATE, ROUTES, STRICT_CHAPTERS     # one sha function, one place

AUDIT = os.path.join(SOL, "_audit")
AUDIT_IN = os.path.join(SOL, "_audit_input")
LEDGER = os.path.join(SOL, "_dispatch.json")
CONTROLS = os.path.join(GATE, "controls.json")
SHOWN = ("approach", "steps", "final_answer", "common_mistakes", "concept_tags", "difficulty", "mistake_type_hint")
NUM = re.compile(r"(?<![\d.])(\d+(?:\.\d+)?)(?![\d.])")
# the routes track keeps its own queue, audit directory and controls ledger
AUDIT_ROUTES = os.path.join(SOL, "_audit_routes")
AUDIT_IN_ROUTES = os.path.join(SOL, "_audit_input_routes")
ROUTES_CONTROLS = os.path.join(GATE, "routes_controls.json")


def load(p, default=None):
    if not os.path.exists(p):
        return default
    return json.load(io.open(p, encoding="utf-8"))


def save(p, obj):
    os.makedirs(os.path.dirname(p), exist_ok=True)
    io.open(p, "w", encoding="utf-8").write(json.dumps(obj, indent=1, ensure_ascii=False))


def now():
    return datetime.datetime.now().astimezone().isoformat(timespec="seconds")


def audited_shas(qid):
    """Every sha prefix this question has an audit file for."""
    return {os.path.basename(f).split(".")[1] for f in glob.glob(os.path.join(AUDIT, qid + ".*.json"))}


def item_for(q, sol, sha):
    return {"question_id": q["id"], "audit_file": "%s.%s.json" % (q["id"], sha[:8]), "item_sha": sha,
            "chapter": q["chapter"], "year": q["year"], "question_en": q["question_en"],
            "options_en": q["options_en"], "solution": {k: sol[k] for k in SHOWN if k in sol}}


def corrupt(sol, q, kind):
    """Return a copy with one deliberate, gradable error, or (None, None) if this kind cannot apply."""
    s = copy.deepcopy(sol)
    if kind == "line":
        middle = s["steps"][1:-1] or s["steps"][:1]
        for st in middle:
            eq = st.get("equation") or ""
            for m in NUM.finditer(eq):
                v = m.group(1)
                if float(v) == 0:                   # doubling zero changes nothing
                    continue
                new = str(int(v) * 2) if v.isdigit() else "%g" % (float(v) * 2)
                st["equation"] = eq[:m.start()] + new + eq[m.end():]
                return s, "a number in a printed line doubled (%s -> %s); final answer untouched" % (v, new)
        return None, None
    if kind == "mistake_swap":
        # the strict-chapter control: the mistakes are what a rework wave changed, so the planted
        # error lives there. Two computed slips trade options (each text now lands on the other's
        # option), or, with one computed slip only, that slip is relabelled a distractor.
        ms = s.get("common_mistakes") or []
        real = [m for m in ms if m.get("option") and not m.get("distractor")]
        if len(real) >= 2:
            a_, b_ = real[0], real[1]
            a_["option"], b_["option"] = b_["option"], a_["option"]
            return s, "two mistake entries swapped options (%d <-> %d); each text now names the wrong option" % (b_["option"], a_["option"])
        if len(real) == 1:
            m = real[0]
            m["distractor"] = True
            m["text"] = "No method a student would use lands on this option; it is a filler value."
            return s, "a computed slip on option %d relabelled as a distractor with a filler reason" % m["option"]
        return None, None
    opt = s["final_answer"]["option"]
    new_opt = opt % 4 + 1
    value = q["options_en"][new_opt - 1]
    s["final_answer"] = {"option": new_opt, "value": value}
    last = s["steps"][-1]
    eq = last.get("equation") or ""
    last["equation"] = (eq.rsplit("=", 1)[0] + "= " + value) if "=" in eq else ("= " + value)
    s["common_mistakes"] = [m for m in s.get("common_mistakes", []) if m.get("option") != new_opt]
    return s, "final option changed %d -> %d and the last line made to end in that option's text" % (opt, new_opt)


def audited_route_shas(qid):
    return {os.path.basename(f).split(".")[1] for f in glob.glob(os.path.join(AUDIT_ROUTES, qid + ".*.json"))}


def item_for_routes(q, sol, side, sha):
    """The routes auditor sees the question, the solution's content fields AND the sidecar: this
    audit is sighted by design, since the routes are derived from a solution the key gate passed."""
    return {"question_id": q["id"], "audit_file": "%s.%s.json" % (q["id"], sha[:8]), "item_sha": sha,
            "chapter": q["chapter"], "year": q["year"], "question_en": q["question_en"],
            "options_en": q["options_en"], "solution": {k: sol[k] for k in SHOWN if k in sol},
            "routes": {k: v for k, v in side.items() if k != "authored_by"}}


def corrupt_routes(side, kind):
    """A routes control: one deliberate, gradable error, or (None, None) if this kind cannot apply."""
    s = copy.deepcopy(side)
    if kind == "type_swap":
        for m in s["mistakes"]:
            if m["type"] in ("concept", "application"):
                old = m["type"]
                m["type"], m["route"] = "calculation", None
                return s, "mistakes[%d] retyped %s -> calculation and its route dropped" % (m["index"], old)
        return None, None
    routed = [m for m in s["mistakes"] if m.get("route")]
    if s.get("right_route") and routed:
        s["right_route"] = routed[0]["route"]
        return s, "right_route replaced by the wrong route of mistakes[%d]" % routed[0]["index"]
    return None, None


def main_routes(a):
    """The routes audit queue: every gate-passing sidecar not yet audited at its sha, one planted
    control per chapter batch. The same shape as main(), over the routes directories."""
    pool = load(POOL) or sys.exit("no pool")
    byid = {q["id"]: q for q in pool["questions"]}
    rstatus = load(os.path.join(GATE, "routes_status.json"), {})
    controls = load(ROUTES_CONTROLS, {})
    sliced = set()
    for f in glob.glob(os.path.join(SOL, "_audit_slices", "*_routes*.json")):
        for it in (load(f) or {}).get("items", []):
            sliced.add(it.get("item_sha"))
    for sha in list(controls):
        c = controls[sha]
        audited = os.path.exists(os.path.join(AUDIT_ROUTES, "%s.%s.json" % (c["question_id"], sha[:8])))
        if not audited and sha not in sliced:
            del controls[sha]
    controlled_qids = {c["question_id"] for c in controls.values()}
    pending = {c["chapter_key"] for sha, c in controls.items()
               if not os.path.exists(os.path.join(AUDIT_ROUTES, "%s.%s.json" % (c["question_id"], sha[:8])))}

    scope = set(rstatus)
    if a.wave is not None:
        scope = set()
        for r in load(LEDGER, []):
            if r["wave"] == a.wave and r["role"] == "routes":
                scope.update(r["question_ids"])
        if not scope:
            sys.exit("wave %d has no routes rows" % a.wave)

    cands = collections.defaultdict(list)
    skipped = collections.Counter()
    for qid in sorted(scope):
        st = rstatus.get(qid)
        if not st:
            skipped["no routes sidecar gated"] += 1
            continue
        if st["verdict"] != "pass":
            skipped["routes gate " + st.get("reason", st["verdict"])] += 1
            continue
        if st["routes_sha"][:8] in audited_route_shas(qid):
            skipped["already audited at this sha"] += 1
            continue
        cands[byid[qid]["chapter_key"]].append(qid)

    if os.path.isdir(AUDIT_IN_ROUTES):
        for f in glob.glob(os.path.join(AUDIT_IN_ROUTES, "*.json")):
            os.remove(f)
    os.makedirs(AUDIT_IN_ROUTES, exist_ok=True)

    written, planted, no_control = 0, [], []
    for ck, ids in sorted(cands.items()):
        control_qid, h = None, 0
        if not a.no_controls and len(ids) >= 2 and ck not in pending:
            h = int(hashlib.sha256(("routes" + str(a.wave) + ck + "|".join(ids)).encode()).hexdigest(), 16)
            order = sorted(ids, key=lambda i: hashlib.sha256((str(h) + i).encode()).hexdigest())
            for cand in order:
                if cand in controlled_qids:
                    continue
                # a sidecar with nothing to corrupt (every route null) cannot carry the
                # control: the next candidate in the seeded order takes it
                probe = load(os.path.join(ROUTES, cand + ".json"))
                if probe and (corrupt_routes(probe, "type_swap")[0] is not None or corrupt_routes(probe, "right_route_swap")[0] is not None):
                    control_qid = cand
                    break
        for qid in ids:
            q = byid[qid]
            sol = load(os.path.join(SOL, qid + ".json"))
            side = load(os.path.join(ROUTES, qid + ".json"))
            real_sha = rstatus[qid]["routes_sha"]
            if routes_sha(side) != real_sha:
                sys.exit("%s routes changed since the last routes gate run - run gate_solutions.py --routes first" % qid)
            if content_sha(sol) != rstatus[qid]["solution_sha"]:
                sys.exit("%s solution changed since its routes were gated - run both gates first" % qid)
            if qid == control_qid:
                kind = "type_swap" if (h // 7) % 2 == 0 else "right_route_swap"
                bad, how = corrupt_routes(side, kind)
                if bad is None:
                    bad, how = corrupt_routes(side, "right_route_swap" if kind == "type_swap" else "type_swap")
                if bad is None:
                    no_control.append((ck, qid))
                    save(os.path.join(AUDIT_IN_ROUTES, qid + ".json"), item_for_routes(q, sol, side, real_sha))
                else:
                    sha = routes_sha(bad)
                    save(os.path.join(AUDIT_IN_ROUTES, qid + ".json"), item_for_routes(q, sol, bad, sha))
                    controls[sha] = {"question_id": qid, "chapter_key": ck, "wave": a.wave, "corruption": how,
                                     "real_sha": real_sha, "expected": "wrong", "planted_at": now()}
                    planted.append((ck, qid, how))
            else:
                save(os.path.join(AUDIT_IN_ROUTES, qid + ".json"), item_for_routes(q, sol, side, real_sha))
            written += 1

    save(ROUTES_CONTROLS, controls)
    print("routes audit inputs written: %d in %d chapters (%d planted controls)" % (written, len(cands), len(planted)))
    for ck, qid, how in planted:
        print("  control %-6s %s: %s" % (ck, qid, how))
    for ck, qid in no_control:
        print("  no control possible in %s: %s has nothing to corrupt" % (ck, qid))
    for k, n in sorted(skipped.items()):
        print("  skipped %-36s %d" % (k, n))
    print("routes controls ledger: %s (never show it to an auditor)" % os.path.relpath(ROUTES_CONTROLS, os.path.dirname(os.path.dirname(HERE))))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--wave", type=int, default=None, help="only ids in this wave's author rows")
    ap.add_argument("--no-controls", action="store_true")
    ap.add_argument("--role", default="solutions", choices=["solutions", "routes"],
                    help="routes: queue the _routes/ sidecars for their own audit")
    a = ap.parse_args()
    if a.role == "routes":
        main_routes(a)
        return

    pool = load(POOL) or sys.exit("no pool")
    byid = {q["id"]: q for q in pool["questions"]}
    status = load(os.path.join(GATE, "status.json"), {})
    controls = load(CONTROLS, {})
    # a control is orphaned when its corrupted item sits in no audit slice on disk (the round
    # was un-planned): drop it, or the chapter never gets a control again
    sliced = set()
    for f in glob.glob(os.path.join(SOL, "_audit_slices", "*.json")):
        for it in (load(f) or {}).get("items", []):
            sliced.add(it.get("item_sha"))
    for sha in list(controls):
        c = controls[sha]
        audited = os.path.exists(os.path.join(AUDIT, "%s.%s.json" % (c["question_id"], sha[:8])))
        if not audited and sha not in sliced:
            del controls[sha]
    controlled_qids = {c["question_id"] for c in controls.values()}
    # one control in flight per chapter: a second would only pile up unaudited entries
    pending = {c["chapter_key"] for sha, c in controls.items()
               if not os.path.exists(os.path.join(AUDIT, "%s.%s.json" % (c["question_id"], sha[:8])))}

    scope = set(byid)
    if a.wave is not None:
        scope = set()
        for r in load(LEDGER, []):
            if r["wave"] == a.wave and r["role"] in ("author", "rework"):
                scope.update(r["question_ids"])
        if not scope:
            sys.exit("wave %d has no author or rework rows" % a.wave)

    # a candidate: gate-pass now, and no audit file at this exact sha
    cands = collections.defaultdict(list)
    skipped = collections.Counter()
    for qid in sorted(scope):
        st = status.get(qid)
        if not st:
            skipped["not gated"] += 1
            continue
        if st["verdict"] != "pass":
            skipped["gate " + st.get("reason", st["verdict"])] += 1
            continue
        if st["content_sha"][:8] in audited_shas(qid):
            skipped["already audited at this sha"] += 1
            continue
        cands[byid[qid]["chapter_key"]].append(qid)

    # the input directory is a queue, not a record: rebuild it from scratch
    if os.path.isdir(AUDIT_IN):
        for f in glob.glob(os.path.join(AUDIT_IN, "*.json")):
            os.remove(f)
    os.makedirs(AUDIT_IN, exist_ok=True)

    written, planted = 0, []
    for ck, ids in sorted(cands.items()):
        control_qid, h = None, 0
        if not a.no_controls and len(ids) >= 2 and ck not in pending:     # a control needs one real item beside it
            h = int(hashlib.sha256((str(a.wave) + ck + "|".join(ids)).encode()).hexdigest(), 16)
            order = sorted(ids, key=lambda i: hashlib.sha256((str(h) + i).encode()).hexdigest())
            for cand in order:                      # the first one never controlled before
                if cand not in controlled_qids:
                    control_qid = cand
                    break
        for qid in ids:
            q = byid[qid]
            sol = load(os.path.join(SOL, qid + ".json"))
            real_sha = status[qid]["content_sha"]
            if content_sha(sol) != real_sha:
                sys.exit("%s changed since the last gate run - run gate_solutions.py first" % qid)
            if qid == control_qid:
                kind = "line" if (h // 7) % 2 == 0 else "final_option"
                if ck in STRICT_CHAPTERS:
                    kind = "mistake_swap"
                bad, how = corrupt(sol, q, kind)
                if bad is None:
                    bad, how = corrupt(sol, q, "final_option")
                sha = content_sha(bad)
                save(os.path.join(AUDIT_IN, qid + ".json"), item_for(q, bad, sha))
                controls[sha] = {"question_id": qid, "chapter_key": ck, "wave": a.wave, "corruption": how,
                                 "real_sha": real_sha, "expected": "harmful", "planted_at": now()}
                planted.append((ck, qid, how))
            else:
                save(os.path.join(AUDIT_IN, qid + ".json"), item_for(q, sol, real_sha))
            written += 1

    save(CONTROLS, controls)
    print("audit inputs written: %d in %d chapters (%d planted controls)" % (written, len(cands), len(planted)))
    for ck, qid, how in planted:
        print("  control %-6s %s: %s" % (ck, qid, how))
    for k, n in sorted(skipped.items()):
        print("  skipped %-36s %d" % (k, n))
    print("controls ledger: %s (never show it to an auditor)" % os.path.relpath(CONTROLS, os.path.dirname(os.path.dirname(HERE))))


if __name__ == "__main__":
    main()
