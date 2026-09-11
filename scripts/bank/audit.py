"""Dispatch ledger, audit queue with planted controls, and the release build for the bank.

    python scripts/bank/audit.py plan --role author --wave 1 [--size 15]   # slices (gitignored, verbatim) + ledger rows
    python scripts/bank/audit.py queue --wave 1 [--no-controls]            # audit input over gate-pass + restated items, one control per slice
    python scripts/bank/audit.py plan --role audit --wave 1                # audit slices (restatement only) + .questions.json twins
    python scripts/bank/audit.py mark-dispatched --wave 1 [--role audit]
    python scripts/bank/audit.py audit-disk                                # the ledger learns what actually landed
    python scripts/bank/audit.py status
    python scripts/bank/audit.py release                                   # items/ + release.json + the numbers

The ledger is written BEFORE any agent runs (the corpus lesson: a duplicate dispatch happened when the
list of what was out lived in a head). Coverage of audits is by ITEM SHA, never by id. An auditor that
passes a planted control is discredited for the whole wave.
"""
import os, io, re, sys, json, glob, copy, hashlib, argparse, collections

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import _lib as L      # noqa: E402
import gate as G      # noqa: E402
import solve as S     # noqa: E402
import gate_run as R  # noqa: E402
import roles          # noqa: E402  (the subscription-only roles: reader, keyreader, solveB, fidelity, fidelity2, judge, syllabus)

LEDGER = os.path.join(L.BANK, "_dispatch.json")
SLICES = os.path.join(L.EVIDENCE, "_slices")               # verbatim text -> gitignored
AUDIT = os.path.join(L.BANK, "_audit")
AUDIT_IN = os.path.join(L.BANK, "_audit_input")
AUDIT_SLICES = os.path.join(L.BANK, "_audit_slices")
CONTROLS = os.path.join(L.GATE, "controls.json")
RELEASE = os.path.join(L.BANK, "release.json")
SHOWN = ("approach", "steps", "final_answer", "common_mistakes", "concept_tags", "difficulty", "mistake_type_hint")
LETTER = {"author": "A", "audit": "U", "rework": "K"}
OK = ("ok", "weak")
NUM = re.compile(r"(?<![\d.])(\d+(?:\.\d+)?)(?![\d.])")
TIER_ORDER = ["EX", "IE", "L1 AR", "L1 SC", "L1 SUB"]


def label(wave, role, k, rnd=None):
    base = "W%02d-%s-%s-%02d" % (wave, LETTER.get(role, "U"), L.PREFIX, k)
    return base if rnd is None else base + "-R%d" % rnd


def ledger():
    return L.load(LEDGER, [])


# ---------------------------------------------------------------- author slices
def author_view(wid, t):
    opts = t.get("options") or []
    if not opts and t.get("format") == "assertion_reason":
        opts = [{"label": "(%s)" % "abcd"[i], "text": x} for i, x in enumerate(S.AR_OPTIONS)]
    v = {"item_id": wid, "kind": t.get("kind"), "format": t.get("format"), "question_text": t["question_text"],
         "options": opts, "parts": t.get("parts") or [],
         "figure": {"description": (t.get("figure") or {}).get("description", ""), "values_read": (t.get("figure") or {}).get("values_read", [])}
         if (t.get("figure") or {}).get("present") else None}
    if t.get("kind") != "worked_example" and t.get("crop"):
        v["crop"] = os.path.join(L.EVIDENCE, t["crop"]).replace("/", os.sep)
    if re.search(r"\b(?:above|previous|preceding)\s+(?:problem|question)", t.get("question_text") or "", re.I):
        prev = previous_item(t)
        if prev:
            v["context_from_previous_item"] = {"question_text": prev["question_text"], "options": prev.get("options") or [],
                                               "figure": prev.get("figure") if (prev.get("figure") or {}).get("present") else None,
                                               "note": "this item says 'the above problem'; that problem is quoted here"}
    return v


def previous_item(t):
    """The transcript printed immediately before this one in the same section (for 'in the above problem')."""
    m = re.match(r"(.*) Q(\d+)$", t["label"])
    if not m:
        return None
    want = "%s Q%d" % (m.group(1), int(m.group(2)) - 1)
    for r in L.jsonl_read(S.ingest.TRANSCRIPTS):
        if r["label"] == want:
            return r
    return None


def plan_authors(led, wave, size, model, only=None):
    tr = S.transcripts()
    if any(r["wave"] == wave and r["role"] == "author" and not r.get("redispatch_of") for r in led):
        sys.exit("wave %d authors already planned - use --redispatch" % wave)
    have = S.solutions()
    order = sorted(tr, key=lambda w: (TIER_ORDER.index(tr[w]["tier"]) if tr[w]["tier"] in TIER_ORDER else 9, tr[w]["page"], tr[w]["label"]))
    order = [w for w in order if w not in have and (not only or w in only)]
    rows, k = [], 0
    for i in range(0, len(order), size):
        k += 1
        ids = order[i:i + size]
        path = os.path.join(SLICES, "W%02d_%s_%02d.json" % (wave, L.PREFIX, k))
        L.save(path, {"wave": wave, "role": "author", "chapter": L.CHAPTER, "slice": k, "agent_label": label(wave, "author", k),
                      "items": [author_view(w, tr[w]) for w in ids]})
        rows.append({"wave": wave, "role": "author", "chapter": L.CHAPTER, "slice": k, "question_ids": ids, "model": model,
                     "agent_label": label(wave, "author", k), "slice_path": path.replace(os.sep, "/"),
                     "planned_at": L.now(), "dispatched_at": None, "status": "planned",
                     "files_expected": len(ids), "files_present": 0})
        print("  planned %-14s %2d items  (%s)" % (rows[-1]["agent_label"], len(ids), ", ".join(sorted({tr[w]["tier"] for w in ids}))))
    return rows


# ---------------------------------------------------------------- audit queue + controls
def item_sha(q_text, options, sol):
    return L.sha256(json.dumps({"q": q_text, "o": options, "s": {k: sol.get(k) for k in SHOWN}}, sort_keys=True, ensure_ascii=False))


def item_for(wid, rt, sol, sha):
    return {"question_id": wid, "audit_file": "%s.%s.json" % (wid, sha[:8]), "item_sha": sha,
            "question_text": S.restatement_text(rt, with_options=False, with_figure=False), "options": rt.get("options") or [],
            "figure_description": rt.get("figure_description") or "",
            "solution": {k: sol[k] for k in SHOWN if k in sol}}


def audited_shas(wid, restated_at=None):
    """Audit shas on file for an item - only those written AFTER its latest restatement row, since the figure
    description the auditor read is served text that the item sha does not cover."""
    out = set()
    for f in glob.glob(os.path.join(AUDIT, wid + ".*.json")):
        if restated_at and _written_before(f, restated_at):
            continue
        out.add(os.path.basename(f).split(".")[1])
    return out


def _written_before(path, iso):
    """File mtime against an ISO timestamp - the auditors fill their own `at` field and some wrote it wrong."""
    import datetime
    try:
        return os.path.getmtime(path) < datetime.datetime.fromisoformat(iso).timestamp()
    except (ValueError, OSError):
        return False


def audit_is_stale(au, rt):
    f = os.path.join(AUDIT, "%s.%s.json" % (au.get("question_id"), (au.get("item_sha") or "")[:8]))
    return bool(rt and rt.get("at") and os.path.exists(f) and _written_before(f, rt["at"]))


def corrupt(rt, sol, kind):
    """(question_text, options, solution, how) with ONE deliberate gradable error, or None."""
    s = copy.deepcopy(sol)
    q, opts = S.restatement_text(rt, with_options=False, with_figure=False), copy.deepcopy(rt.get("options") or [])
    if kind == "line":
        middle = s["steps"][1:-1] or s["steps"][:1]
        for st in middle:
            eq = st.get("equation") or ""
            for m in NUM.finditer(eq):
                v = m.group(1)
                if float(v) == 0 or (m.start() > 0 and (eq[m.start() - 1].isalpha() or eq[m.start() - 1] == "_")):
                    continue                # a digit inside a label (F2, N_ground2) is not a number in the working
                new = str(int(v) * 2) if v.isdigit() else "%g" % (float(v) * 2)
                st["equation"] = eq[:m.start()] + new + eq[m.end():]
                return q, opts, s, "a number in a printed line doubled (%s -> %s); final answer untouched" % (v, new)
        return None
    if kind == "final_option":
        opt = s["final_answer"].get("option")
        if not opt or len(opts) < 4:
            return None
        new = opt % 4 + 1
        s["final_answer"] = {"option": new, "value": opts[new - 1]["text"]}
        last = s["steps"][-1]
        last["equation"] = (last.get("equation") or "").split("=")[0].strip() + (" = " if last.get("equation") else "") + opts[new - 1]["text"]
        s["common_mistakes"] = [m for m in s["common_mistakes"] if m.get("option") != new]
        return q, opts, s, "final option changed %d -> %d and the last line made to end in that option's text" % (opt, new)
    if kind == "final_value":
        v = s["final_answer"].get("value") or ""
        m = NUM.search(v)
        if not m or s["final_answer"].get("option"):
            return None
        new = "%g" % (float(m.group(1)) * 2)
        nv = v[:m.start()] + new + v[m.end():]
        s["final_answer"]["value"] = nv
        last = s["steps"][-1]
        last["equation"] = re.sub(re.escape(m.group(1)), new, last.get("equation") or "", count=1) or ("= " + nv)
        last["text"] = re.sub(re.escape(m.group(1)), new, last.get("text") or "", count=1)
        return q, opts, s, "final value doubled (%s -> %s) in final_answer and the last step" % (m.group(1), new)
    if kind == "restatement":
        nums = list(NUM.finditer(q))
        if not nums:
            return None
        m = nums[len(nums) // 2]
        v = m.group(1)
        if float(v) == 0:
            return None
        new = str(int(v) * 2) if v.isdigit() else "%g" % (float(v) * 2)
        q2 = q[:m.start()] + new + q[m.end():]
        return q2, opts, s, "a given quantity in the SERVED question changed (%s -> %s); solution untouched" % (v, new)
    return None


def queue(a):
    status = L.load(R.STATUS, {}) or sys.exit("run the gate first")
    RS = S.done_ids("restate")
    sols = S.solutions()
    controls = L.load(CONTROLS, {})
    sliced = set()
    for f in glob.glob(os.path.join(AUDIT_SLICES, "*.json")):
        if not f.endswith(".questions.json"):
            for it in (L.load(f) or {}).get("items", []):
                sliced.add(it.get("item_sha"))
    for sha in list(controls):
        c = controls[sha]
        if not os.path.exists(os.path.join(AUDIT, "%s.%s.json" % (c["question_id"], sha[:8]))) and sha not in sliced:
            del controls[sha]
    pending = any(not os.path.exists(os.path.join(AUDIT, "%s.%s.json" % (c["question_id"], sha[:8]))) for sha, c in controls.items())
    controlled = {c["question_id"] for c in controls.values()}
    cands, hosts, skipped = [], [], collections.Counter()
    for wid, st in sorted(status.items()):
        if st.get("verdict") != "pass":
            skipped["gate " + str(st.get("reason"))[:20]] += 1
            continue
        if not st.get("restatement_ok"):
            skipped["restatement " + str(st.get("restatement_reason", "missing"))[:24]] += 1
            continue
        rt, sol = RS.get(wid), sols.get(wid)
        sha = item_sha(S.restatement_text(rt, with_options=False, with_figure=False), rt.get("options") or [], sol)
        if sha[:8] in audited_shas(wid, rt.get("at")):
            hosts.append(wid)
            skipped["already audited at this sha"] += 1
            continue
        cands.append(wid)
    if os.path.isdir(AUDIT_IN):
        for f in glob.glob(os.path.join(AUDIT_IN, "*.json")):
            os.remove(f)
    os.makedirs(AUDIT_IN, exist_ok=True)
    items = []
    for wid in cands:
        rt, sol = RS[wid], sols[wid]
        it = item_for(wid, rt, sol, item_sha(S.restatement_text(rt, with_options=False, with_figure=False), rt.get("options") or [], sol))
        L.save(os.path.join(AUDIT_IN, wid + ".json"), it)
        items.append(it)
    planted = []
    if not a.no_controls and not pending and (len(cands) >= 2 or hosts):
        size = a.size
        n_controls = max(1, (len(cands) + size - 1) // size)
        h = int(hashlib.sha256(("bank" + str(a.wave) + "|".join(cands)).encode()).hexdigest(), 16)
        seeded = lambda i: hashlib.sha256((str(h) + i).encode()).hexdigest()
        order = sorted(hosts, key=seeded) + sorted(cands, key=seeded)
        kinds = ["restatement", "line", "final_value", "final_option"]
        ki = 0
        for cand in order:
            if len(planted) >= n_controls:
                break
            if cand in controlled:
                continue
            rt, sol = RS[cand], sols[cand]
            got = None
            for _ in range(len(kinds)):
                kind = kinds[(h + ki) % len(kinds)]
                ki += 1
                got = corrupt(rt, sol, kind)
                if got:
                    break
            if not got:
                continue
            q2, o2, s2, how = got
            sha = item_sha(q2, o2, s2)
            if sha == item_sha(S.restatement_text(rt, with_options=False, with_figure=False), rt.get("options") or [], sol):
                continue                # the corruption changed nothing (doubling a 0): not a control
            it = {"question_id": cand, "audit_file": "%s.%s.json" % (cand, sha[:8]), "item_sha": sha, "question_text": q2,
                  "options": o2, "figure_description": rt.get("figure_description") or "", "solution": {k: s2[k] for k in SHOWN if k in s2}}
            L.save(os.path.join(AUDIT_IN, "%s.control_%s.json" % (cand, sha[:8])), it)
            controls[sha] = {"question_id": cand, "wave": a.wave, "corruption": how, "kind": kind,
                             "real_sha": item_sha(S.restatement_text(rt, with_options=False, with_figure=False), rt.get("options") or [], sol), "expected": "harmful", "planted_at": L.now()}
            planted.append((cand, kind))
            controlled.add(cand)
    L.save(CONTROLS, controls)
    print("audit queue: %d real items, %d controls planted %s" % (len(items), len(planted), planted))
    for k, v in sorted(skipped.items()):
        print("  skipped %-40s %d" % (k, v))
    if pending:
        print("  (controls from an earlier round still unaudited: none planted)")


def plan_audits(led, wave, size, model):
    files = sorted(glob.glob(os.path.join(AUDIT_IN, "*.json")))
    if not files:
        sys.exit("no audit input - run queue first")
    covered = set()
    rounds = 0
    for r in led:
        if r["wave"] == wave and r["role"] == "audit":
            rounds = max(rounds, r.get("round") or 0) + 0
            for it in (L.load(r["slice_path"]) or {}).get("items", []):
                covered.add(it.get("item_sha"))
    rnd = sum(1 for r in led if r["wave"] == wave and r["role"] == "audit" and r.get("slice") == 1)
    reals = [L.load(f) for f in files if ".control_" not in os.path.basename(f)]
    ctrls = [L.load(f) for f in files if ".control_" in os.path.basename(f)]
    reals = [it for it in reals if it["item_sha"] not in covered]
    ctrls = [it for it in ctrls if it["item_sha"] not in covered]
    if not reals and not ctrls:
        print("nothing to plan: every item sha in the queue is already in a slice")
        return []
    rows, k = [], 0
    for i in range(0, len(reals), size):
        k += 1
        items = reals[i:i + size]
        if ctrls:
            items = items + [ctrls.pop(0)]
        h = int(hashlib.sha256(("order%d%d" % (wave, k)).encode()).hexdigest(), 16)
        items.sort(key=lambda it: hashlib.sha256((str(h) + it["item_sha"]).encode()).hexdigest())
        suffix = "" if rnd == 0 else "_R%d" % rnd
        path = os.path.join(AUDIT_SLICES, "W%02d_%s_%02d%s.json" % (wave, L.PREFIX, k, suffix))
        lab = label(wave, "audit", k, None if rnd == 0 else rnd)
        L.save(path, {"wave": wave, "role": "audit", "chapter": L.CHAPTER, "slice": k, "round": rnd, "agent_label": lab, "items": items})
        L.save(path.replace(".json", ".questions.json"),
               {"wave": wave, "role": "audit", "chapter": L.CHAPTER, "slice": k, "round": rnd,
                "items": [{k2: it[k2] for k2 in ("question_id", "question_text", "options", "figure_description")} for it in items]})
        rows.append({"wave": wave, "role": "audit", "chapter": L.CHAPTER, "slice": k, "round": rnd,
                     "question_ids": [it["question_id"] for it in items], "model": model, "agent_label": lab,
                     "slice_path": path.replace(os.sep, "/"), "planned_at": L.now(), "dispatched_at": None,
                     "status": "planned", "files_expected": len(items), "files_present": 0})
        print("  planned %-16s %2d items (%d controls)" % (lab, len(items), sum(1 for it in items if ".control_" in json.dumps(it.get("audit_file", "")) or it["item_sha"] in L.load(CONTROLS, {}))))
    return rows


def audit_disk(led):
    for r in led:
        if r["role"] == "author":
            present = [i for i in r["question_ids"] if os.path.exists(os.path.join(S.SOLUTIONS, i + ".json"))
                       or os.path.exists(os.path.join(S.SOLUTIONS, "_refusals", i + ".json"))]
        elif r["role"] in roles.ROLES:
            present = roles.disk(r)
        else:
            sl = L.load(r["slice_path"]) or {"items": []}
            present = [it["question_id"] for it in sl.get("items", []) if os.path.exists(os.path.join(AUDIT, it["audit_file"]))]
        r["files_present"] = len(present)
        if r["status"] in ("dispatched", "partial", "written"):
            r["status"] = "written" if len(present) == r["files_expected"] else "partial" if present else "dispatched"
        r["audited_disk_at"] = L.now()


def status(led):
    print("%-18s %-9s %-12s %5s/%-5s %s" % ("agent", "role", "status", "have", "want", "slice"))
    for r in led:
        print("%-18s %-9s %-12s %5d/%-5d %s" % (r["agent_label"], r["role"], r["status"], r["files_present"], r["files_expected"], r["slice_path"]))
    c = collections.Counter((r["role"], r["status"]) for r in led)
    for (role, st), n in sorted(c.items()):
        print("  %-7s %-9s %d" % (role, st, n))


# ---------------------------------------------------------------- release
def release(a):
    st = L.load(R.STATUS, {}) or sys.exit("run the gate first")
    RS, sols = S.done_ids("restate"), S.solutions()
    controls = L.load(CONTROLS, {})
    audits = {}
    for f in glob.glob(os.path.join(AUDIT, "*.json")):
        au = L.load(f)
        if au and au.get("item_sha"):
            audits[au["item_sha"]] = au
    misses, caught = collections.defaultdict(list), 0
    for sha, c in controls.items():
        au = audits.get(sha)
        if not au or c.get("real_sha") == sha:       # a no-op control is void, never a miss
            continue
        agent = (au.get("audited_by") or {}).get("agent", "?")
        if au.get("verdict") in OK:
            misses[agent].append((c["question_id"], c["kind"]))
        else:
            caught += 1
    discredited = set(misses)
    verified, unaudited, failed, disagreed = {}, [], [], []
    for wid, row in sorted(st.items()):
        if row.get("verdict") != "pass" or not row.get("restatement_ok") or row.get("figure_required"):
            continue
        rt, sol = RS.get(wid), sols.get(wid)
        sha = item_sha(S.restatement_text(rt, with_options=False, with_figure=False), rt.get("options") or [], sol)
        au = audits.get(sha)
        if not au or audit_is_stale(au, rt):
            unaudited.append(wid)
            continue
        agent = (au.get("audited_by") or {}).get("agent", "?")
        if au.get("verdict") not in OK or agent in discredited:
            if agent not in discredited:
                failed.append((wid, au.get("verdict")))
            else:
                unaudited.append(wid)
            continue
        a_opt, a_val = R.author_answer(sol)
        ok, how = R.same(a_opt, a_val, au.get("auditor_option"), au.get("auditor_value"), "auto", {})
        if ok is False and au.get("verdict") != "ok":
            # an "ok" verdict already asserts the auditor's answer equals the solution's (the brief makes that a
            # condition of ok); the comparator re-check only guards the weak verdicts, where nothing asserted it
            disagreed.append((wid, au.get("auditor_value")))
            continue
        verified[wid] = (sha, au, agent)
    os.makedirs(L.ITEMS, exist_ok=True)
    for f in glob.glob(os.path.join(L.ITEMS, "*.json")):
        os.remove(f)
    tr = S.transcripts()
    items = []
    for wid, (sha, au, agent) in sorted(verified.items()):
        rt, sol, t, row = RS[wid], sols[wid], tr[wid], st[wid]
        bid = "bk_phy_%s_" % L.PREFIX + S.restatement_sha(rt)[:8]
        opts = {str(i + 1): o["text"] for i, o in enumerate(rt.get("options") or [])} or None
        item = {
            "schema_version": "bank_item_v1", "id": bid, "subject": "physics",
            "chapter": row.get("chapter") or L.CFG["syllabus"][0], "shape": None,
            "kind": t.get("kind"), "level": "jee_main", "format": t.get("format"),
            "key_kind": "letter" if opts else ("words" if t.get("format") == "conceptual" else "number"),
            "figure_required": bool(rt.get("figure_required")),
            "question": {"text": rt["question_text"], "options": opts, "parts": [{"label": "abcdefgh"[i], "asks": re.sub(r"^\s*\(?[a-hivx]{1,4}[\)\.]\s*", "", p)} for i, p in enumerate(rt.get("parts") or [])] or None,
                         "conditions": rt.get("conditions") or [],
                         "figure": {"description": rt["figure_description"]} if rt.get("figure_description") else None},
            "solution": {k: sol[k] for k in SHOWN if k in sol},
            "origin": {"kind": "book", "sha": t["sha"]},
            "verification": {"key_match": row["checks"].get("key", [None])[0] is True,
                             "solvers_agreed": row["checks"].get("B", [None])[0] is True,
                             "hint_match": row["checks"].get("hint", [None])[0] is True,
                             "syllabus_ok": (row["checks"].get("syllabus") or [None])[0] == "within",
                             "restatement_faithful": True, "audit": "verified", "verified_sha": sha, "audited_by": agent},
            "authored_by": sol["authored_by"]}
        L.save(os.path.join(L.ITEMS, bid + ".json"), item)
        items.append(item)
    rel = {"schema": "bank_release_v1", "chapter": L.CHAPTER, "built_at": L.now(),
           "counts": {"transcribed": len(tr), "gated": len(st), "gate_pass": sum(1 for r in st.values() if r.get("verdict") == "pass"),
                      "verified": len(verified), "unaudited": len(unaudited), "failed_audit": len(failed), "auditor_disagreed": len(disagreed),
                      "controls_planted": len(controls), "controls_audited": caught + sum(len(v) for v in misses.values()),
                      "controls_caught": caught, "auditors_discredited": sorted(discredited)},
           "items": items}
    L.save(RELEASE, rel)
    print("release: verified %d  unaudited %d  failed-audit %d  auditor-disagreed %d" % (len(verified), len(unaudited), len(failed), len(disagreed)))
    print("controls: planted %d  audited %d  caught %d  missed %s" % (len(controls), rel["counts"]["controls_audited"], caught, dict(misses) or "none"))
    if failed:
        print("  failed audit:", failed[:10])
    if disagreed:
        print("  auditor disagreed:", disagreed[:10])
    return rel


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("cmd", choices=["plan", "queue", "mark-dispatched", "audit-disk", "status", "release"])
    ap.add_argument("--role", default="author")
    ap.add_argument("--wave", type=int, default=1)
    ap.add_argument("--size", type=int, default=0)
    ap.add_argument("--model", default="")
    ap.add_argument("--only", nargs="*")
    ap.add_argument("--no-controls", action="store_true")
    a = ap.parse_args()
    led = ledger()
    if a.cmd == "plan":
        if a.role == "author":
            rows = plan_authors(led, a.wave, a.size or 15, a.model or "sonnet", a.only or None)
        elif a.role == "audit":
            rows = plan_audits(led, a.wave, a.size or 15, a.model or "opus")
        elif a.role in roles.ROLES:
            rows = roles.plan(led, a.role, a.wave, a.size, a.model, a.only or None)
        else:
            sys.exit("unknown role %s" % a.role)
        led += rows
        L.save(LEDGER, led)
        print("ledger: %d rows -> %s" % (len(led), LEDGER))
    elif a.cmd == "queue":
        queue(a)
    elif a.cmd == "mark-dispatched":
        for r in led:
            if r["wave"] == a.wave and r["role"] == a.role and r["status"] == "planned":
                r["status"], r["dispatched_at"] = "dispatched", L.now()
        L.save(LEDGER, led)
        status(led)
    elif a.cmd == "audit-disk":
        audit_disk(led)
        L.save(LEDGER, led)
        status(led)
    elif a.cmd == "status":
        status(led)
    else:
        release(a)


if __name__ == "__main__":
    main()
