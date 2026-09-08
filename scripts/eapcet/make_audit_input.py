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
"""
import os, io, re, sys, json, copy, glob, hashlib, argparse, datetime, collections

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from gate_solutions import content_sha, POOL, SOL, GATE     # one sha function, one place

AUDIT = os.path.join(SOL, "_audit")
AUDIT_IN = os.path.join(SOL, "_audit_input")
LEDGER = os.path.join(SOL, "_dispatch.json")
CONTROLS = os.path.join(GATE, "controls.json")
SHOWN = ("approach", "steps", "final_answer", "common_mistakes", "concept_tags", "difficulty", "mistake_type_hint")
NUM = re.compile(r"(?<![\d.])(\d+(?:\.\d+)?)(?![\d.])")


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
    opt = s["final_answer"]["option"]
    new_opt = opt % 4 + 1
    value = q["options_en"][new_opt - 1]
    s["final_answer"] = {"option": new_opt, "value": value}
    last = s["steps"][-1]
    eq = last.get("equation") or ""
    last["equation"] = (eq.rsplit("=", 1)[0] + "= " + value) if "=" in eq else ("= " + value)
    s["common_mistakes"] = [m for m in s.get("common_mistakes", []) if m.get("option") != new_opt]
    return s, "final option changed %d -> %d and the last line made to end in that option's text" % (opt, new_opt)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--wave", type=int, default=None, help="only ids in this wave's author rows")
    ap.add_argument("--no-controls", action="store_true")
    a = ap.parse_args()

    pool = load(POOL) or sys.exit("no pool")
    byid = {q["id"]: q for q in pool["questions"]}
    status = load(os.path.join(GATE, "status.json"), {})
    controls = load(CONTROLS, {})
    controlled_qids = {c["question_id"] for c in controls.values()}

    scope = set(byid)
    if a.wave is not None:
        scope = set()
        for r in load(LEDGER, []):
            if r["wave"] == a.wave and r["role"] == "author":
                scope.update(r["question_ids"])
        if not scope:
            sys.exit("wave %d has no author rows" % a.wave)

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
        if not a.no_controls and len(ids) >= 4:
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
