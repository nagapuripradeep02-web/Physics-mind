"""The dispatch ledger: what has been handed to which agent, written to disk BEFORE any agent runs.

A duplicate dispatch happened on the transcription pass because the list of what was out was
held in my head. This file is the only list. Plan a wave, and the ledger rows and the slices
exist before a single agent is launched; audit the disk, and the ledger learns what actually
got written, so an agent's failure notice never triggers a rerun of work that is sitting there.

Author slices carry NO answer. An author who can see the key is not an independent reader of
it, and the key gate stops being a test.

    python scripts/eapcet/dispatch.py --plan --wave 1 --chapter-keys p1-11 p1-10 p1-05 ...
    python scripts/eapcet/dispatch.py --plan --wave 1 --role audit          # after make_audit_input.py
    python scripts/eapcet/dispatch.py --redispatch --wave 1 --ids <id> ... --reason "key miss"
    python scripts/eapcet/dispatch.py --mark-dispatched --wave 1 [--role author]
    python scripts/eapcet/dispatch.py --plan --wave 1 --role routes --chapter-keys p1-02      # after build_release.py
    python scripts/eapcet/dispatch.py --plan --wave 1 --role routes_audit    # after make_audit_input.py --role routes
    python scripts/eapcet/dispatch.py --redispatch --wave 1 --role routes --ids <id> ... --reason "audit wrong"
    python scripts/eapcet/dispatch.py --audit-disk
    python scripts/eapcet/dispatch.py --status

Routes slices carry the question AND the verified solution's content fields: the routes author is
sighted by design (its routes are derived from a solution the key gate already passed). It still
never sees the key file, the bank, or the gate's verdict.
"""
import os, io, sys, json, argparse, datetime, collections

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
POOL = os.path.join(ROOT, "eapcet", "pool", "physics_pool_v1.json")
SOL = os.path.join(ROOT, "eapcet", "solutions")
LEDGER = os.path.join(SOL, "_dispatch.json")
SLICES = os.path.join(SOL, "_slices")
AUDIT_IN = os.path.join(SOL, "_audit_input")
AUDIT_SLICES = os.path.join(SOL, "_audit_slices")
SPLIT_WORDS = ("split", "join", "continu", "second image")
ROUTES = os.path.join(SOL, "_routes")
AUDIT_ROUTES = os.path.join(SOL, "_audit_routes")
AUDIT_IN_ROUTES = os.path.join(SOL, "_audit_input_routes")
RELEASE = POOL.replace(".json", ".release.json")
SHOWN = ("approach", "steps", "final_answer", "common_mistakes", "concept_tags", "difficulty", "mistake_type_hint")
LETTER = {"author": "A", "audit": "U", "routes": "R", "routes_audit": "V", "rework": "K"}


def now():
    return datetime.datetime.now().astimezone().isoformat(timespec="seconds")


def load(p, default=None):
    if not os.path.exists(p):
        return default
    return json.load(io.open(p, encoding="utf-8"))


def save(p, obj):
    os.makedirs(os.path.dirname(p), exist_ok=True)
    io.open(p, "w", encoding="utf-8").write(json.dumps(obj, indent=1, ensure_ascii=False))


def pool_index():
    p = load(POOL)
    if not p:
        sys.exit("no pool file - run select_pool.py first")
    return p, {q["id"]: q for q in p["questions"]}, {c["key"]: c for c in p["chapters"]}


def author_view(q):
    """What an author is allowed to see. Never the answer, never the vision reading."""
    v = {"id": q["id"], "chapter": q["chapter"], "year": q["year"],
         "question_en": q["question_en"], "options_en": q["options_en"]}
    note = q.get("note") or ""
    if any(w in note.lower() for w in SPLIT_WORDS):
        v["note"] = note
    return v


def routes_view(q, sol):
    """What the routes author sees: the question and the verified solution's content fields.
    Sighted by design - the routes are derived from a solution the key gate already passed - but
    still never the key file, never the bank, never the gate verdict."""
    return {"id": q["id"], "chapter": q["chapter"], "year": q["year"],
            "question_en": q["question_en"], "options_en": q["options_en"],
            "solution": {k: sol[k] for k in SHOWN if k in sol}}


def rework_view(q, sol):
    """What a rework author sees: the question, its own gate-passed solution, and which wrong
    options still carry no mistake entry. Sighted on the solution (its option passed the key
    gate, so the author effectively knows the answer) - the audit that follows is still blind,
    and the key gate still runs on the file that comes back."""
    named = {m.get("option") for m in sol.get("common_mistakes", []) if m.get("option")}
    wrong = [o for o in (1, 2, 3, 4) if o != sol["final_answer"]["option"]]
    v = routes_view(q, sol)
    v["unmapped_options"] = [o for o in wrong if o not in named]
    return v


def label(wave, role, chapter_key, k=None):
    base = "W%02d-%s-%s" % (wave, LETTER.get(role, "U"), chapter_key)
    return base if k is None else base + "-R%d" % k


def plan_rework(ledger, wave, chapter_keys, model):
    """One rework slice per STRICT chapter over its gate-passed solutions that leave a wrong option
    unmapped: the author fills the missing common_mistakes entries and touches nothing else. A
    changed file moves its content_sha, so the solution audit runs again on what comes back."""
    pool, byid, bych = pool_index()
    planned = {(r["wave"], r["role"], r["chapter_key"]) for r in ledger if not r.get("redispatch_of")}
    rows = []
    for ck in chapter_keys:
        c = bych.get(ck)
        if not c:
            sys.exit("unknown chapter key %r" % ck)
        if (wave, "rework", ck) in planned:
            sys.exit("chapter %s rework already planned in wave %d" % (ck, wave))
        ids, views = [], []
        for i in c["question_ids"]:
            sol = load(os.path.join(SOL, i + ".json"))
            if not sol:
                continue
            v = rework_view(byid[i], sol)
            if v["unmapped_options"]:
                ids.append(i)
                views.append(v)
        if not ids:
            print("  %s has no half-mapped solutions - skipped" % ck)
            continue
        slice_path = os.path.join(SLICES, "W%02d_%s_rework.json" % (wave, ck))
        save(slice_path, {"wave": wave, "role": "rework", "chapter_key": ck, "chapter": c["name"], "questions": views})
        rows.append({"wave": wave, "role": "rework", "chapter_key": ck, "chapter": c["name"],
                     "question_ids": ids, "model": model, "agent_label": label(wave, "rework", ck),
                     "slice_path": os.path.relpath(slice_path, ROOT).replace(os.sep, "/"),
                     "planned_at": now(), "dispatched_at": None, "status": "planned",
                     "files_expected": len(ids), "files_present": 0})
        print("  planned %-14s %-40s %2d half-mapped solutions -> %s" % (rows[-1]["agent_label"], c["name"][:40],
                                                                        len(ids), rows[-1]["slice_path"]))
    return rows


def plan_authors(ledger, wave, chapter_keys, model):
    pool, byid, bych = pool_index()
    planned = {(r["wave"], r["role"], r["chapter_key"]) for r in ledger if not r.get("redispatch_of")}
    rows = []
    for ck in chapter_keys:
        c = bych.get(ck)
        if not c:
            sys.exit("unknown chapter key %r" % ck)
        if (wave, "author", ck) in planned:
            sys.exit("chapter %s already planned in wave %d - use --redispatch --reason" % (ck, wave))
        if not c["question_ids"]:
            print("  %s has no pooled questions - skipped" % ck)
            continue
        slice_path = os.path.join(SLICES, "W%02d_%s.json" % (wave, ck))
        save(slice_path, {"wave": wave, "role": "author", "chapter_key": ck, "chapter": c["name"],
                          "questions": [author_view(byid[i]) for i in c["question_ids"]]})
        rows.append({"wave": wave, "role": "author", "chapter_key": ck, "chapter": c["name"],
                     "question_ids": list(c["question_ids"]), "model": model,
                     "agent_label": label(wave, "author", ck),
                     "slice_path": os.path.relpath(slice_path, ROOT).replace(os.sep, "/"),
                     "planned_at": now(), "dispatched_at": None, "status": "planned",
                     "files_expected": len(c["question_ids"]), "files_present": 0})
        print("  planned %-14s %-40s %2d questions -> %s" % (rows[-1]["agent_label"], c["name"][:40],
                                                             len(c["question_ids"]), rows[-1]["slice_path"]))
    return rows


def plan_audits(ledger, wave, model):
    """One audit slice per chapter, over every audit-input view that exists for that wave's ids."""
    pool, byid, bych = pool_index()
    wave_ids = set()
    for r in ledger:
        if r["wave"] == wave and r["role"] in ("author", "rework"):
            wave_ids.update(r["question_ids"])
    if not wave_ids:
        sys.exit("wave %d has no author rows" % wave)
    have = {f[:-5] for f in os.listdir(AUDIT_IN)} if os.path.isdir(AUDIT_IN) else set()
    missing = sorted(wave_ids - have)
    if missing:
        print("  %d ids of wave %d have no audit input yet (run make_audit_input.py): first %s"
              % (len(missing), wave, missing[:3]))
    # coverage is by ITEM SHA, read from the slices themselves: the real solution behind a
    # planted control shares its question id with the control and must still get its audit
    covered = set()
    rounds = collections.Counter()
    for r in ledger:
        if r["wave"] == wave and r["role"] == "audit":
            rounds[r["chapter_key"]] += 1
            for it in (load(os.path.join(ROOT, r["slice_path"])) or {}).get("items", []):
                covered.add(it.get("item_sha"))
    rows = []
    by_ch = collections.defaultdict(list)
    for i in sorted(wave_ids & have):
        if (load(os.path.join(AUDIT_IN, i + ".json")) or {}).get("item_sha") in covered:
            continue
        by_ch[byid[i]["chapter_key"]].append(i)
    for ck, ids in sorted(by_ch.items()):
        k = rounds[ck] or None
        suffix = "" if k is None else "_R%d" % k
        slice_path = os.path.join(AUDIT_SLICES, "W%02d_%s%s.json" % (wave, ck, suffix))
        items = [load(os.path.join(AUDIT_IN, i + ".json")) for i in ids]
        save(slice_path, {"wave": wave, "role": "audit", "chapter_key": ck, "chapter": bych[ck]["name"],
                          "round": k, "items": items})
        # the questions-only twin: what the auditor opens FIRST, so the blind solve has a file
        # to be blind with, not only an instruction
        save(slice_path.replace(".json", ".questions.json"),
             {"wave": wave, "role": "audit", "chapter_key": ck, "chapter": bych[ck]["name"], "round": k,
              "items": [{k2: it[k2] for k2 in ("question_id", "chapter", "year", "question_en", "options_en")} for it in items]})
        rows.append({"wave": wave, "role": "audit", "chapter_key": ck, "chapter": bych[ck]["name"],
                     "question_ids": ids, "model": model, "agent_label": label(wave, "audit", ck, k),
                     "slice_path": os.path.relpath(slice_path, ROOT).replace(os.sep, "/"),
                     "planned_at": now(), "dispatched_at": None, "status": "planned",
                     "files_expected": len(ids), "files_present": 0})
        print("  planned %-14s %-40s %2d items" % (rows[-1]["agent_label"], bych[ck]["name"][:40], len(ids)))
    return rows


def plan_routes(ledger, wave, chapter_keys, model):
    """One routes slice per chapter over its VERIFIED solutions: the release's verified_ids when a
    release exists, else every gate-pass solution. The author reads the solution, never the key."""
    pool, byid, bych = pool_index()
    rel = load(RELEASE)
    if rel:
        verified = {c["key"]: set(c["verified_ids"]) for c in rel["chapters"]}
    else:
        verified = collections.defaultdict(set)
        for qid, row in (load(os.path.join(SOL, "_gate", "status.json"), {}) or {}).items():
            if row.get("verdict") == "pass":
                verified[row["chapter_key"]].add(qid)
    planned = {(r["wave"], r["role"], r["chapter_key"]) for r in ledger if not r.get("redispatch_of")}
    rows = []
    for ck in chapter_keys:
        c = bych.get(ck)
        if not c:
            sys.exit("unknown chapter key %r" % ck)
        if (wave, "routes", ck) in planned:
            sys.exit("chapter %s routes already planned in wave %d - use --redispatch --role routes --reason" % (ck, wave))
        ids = [i for i in c["question_ids"] if i in verified.get(ck, set())]
        if not ids:
            print("  %s has no verified solutions - skipped" % ck)
            continue
        slice_path = os.path.join(SLICES, "W%02d_%s_routes.json" % (wave, ck))
        save(slice_path, {"wave": wave, "role": "routes", "chapter_key": ck, "chapter": c["name"],
                          "questions": [routes_view(byid[i], load(os.path.join(SOL, i + ".json"))) for i in ids]})
        rows.append({"wave": wave, "role": "routes", "chapter_key": ck, "chapter": c["name"],
                     "question_ids": ids, "model": model,
                     "agent_label": label(wave, "routes", ck),
                     "slice_path": os.path.relpath(slice_path, ROOT).replace(os.sep, "/"),
                     "planned_at": now(), "dispatched_at": None, "status": "planned",
                     "files_expected": len(ids), "files_present": 0})
        print("  planned %-14s %-40s %2d verified solutions -> %s" % (rows[-1]["agent_label"], c["name"][:40],
                                                                      len(ids), rows[-1]["slice_path"]))
    return rows


def plan_route_audits(ledger, wave, model):
    """One routes-audit slice per chapter over every routes audit input for that wave's ids.
    Coverage is by item sha, as for plan_audits: the real sidecar behind a control shares its id."""
    pool, byid, bych = pool_index()
    wave_ids = set()
    for r in ledger:
        if r["wave"] == wave and r["role"] == "routes":
            wave_ids.update(r["question_ids"])
    if not wave_ids:
        sys.exit("wave %d has no routes rows" % wave)
    have = {f[:-5] for f in os.listdir(AUDIT_IN_ROUTES)} if os.path.isdir(AUDIT_IN_ROUTES) else set()
    missing = sorted(wave_ids - have)
    if missing:
        print("  %d ids of wave %d have no routes audit input yet (run make_audit_input.py --role routes): first %s"
              % (len(missing), wave, missing[:3]))
    covered = set()
    rounds = collections.Counter()
    for r in ledger:
        if r["wave"] == wave and r["role"] == "routes_audit":
            rounds[r["chapter_key"]] += 1
            for it in (load(os.path.join(ROOT, r["slice_path"])) or {}).get("items", []):
                covered.add(it.get("item_sha"))
    rows = []
    by_ch = collections.defaultdict(list)
    for i in sorted(wave_ids & have):
        if (load(os.path.join(AUDIT_IN_ROUTES, i + ".json")) or {}).get("item_sha") in covered:
            continue
        by_ch[byid[i]["chapter_key"]].append(i)
    for ck, ids in sorted(by_ch.items()):
        k = rounds[ck] or None
        suffix = "" if k is None else "_R%d" % k
        slice_path = os.path.join(AUDIT_SLICES, "W%02d_%s_routes%s.json" % (wave, ck, suffix))
        items = [load(os.path.join(AUDIT_IN_ROUTES, i + ".json")) for i in ids]
        save(slice_path, {"wave": wave, "role": "routes_audit", "chapter_key": ck, "chapter": bych[ck]["name"],
                          "round": k, "items": items})
        rows.append({"wave": wave, "role": "routes_audit", "chapter_key": ck, "chapter": bych[ck]["name"],
                     "question_ids": ids, "model": model, "agent_label": label(wave, "routes_audit", ck, k),
                     "slice_path": os.path.relpath(slice_path, ROOT).replace(os.sep, "/"),
                     "planned_at": now(), "dispatched_at": None, "status": "planned",
                     "files_expected": len(ids), "files_present": 0})
        print("  planned %-14s %-40s %2d items" % (rows[-1]["agent_label"], bych[ck]["name"][:40], len(ids)))
    return rows


def archive_attempt(qid, role="author"):
    """Keep the attempt being replaced. Two blind attempts reaching the same option against the
    key is the escalation signal, and build_release.py needs both to see it."""
    attempts = os.path.join(SOL, "_attempts")
    sources = ((os.path.join(ROUTES, qid + ".json"), "routes"),) if role == "routes" else \
        ((os.path.join(SOL, qid + ".json"), "attempt"), (os.path.join(SOL, "_refusals", qid + ".json"), "refusal"))
    for src, tag in sources:
        if os.path.exists(src):
            n = 1 + len([f for f in os.listdir(attempts) if f.startswith(qid + ".")]) if os.path.isdir(attempts) else 1
            os.makedirs(attempts, exist_ok=True)
            os.replace(src, os.path.join(attempts, "%s.%d.%s.json" % (qid, n, tag)))
            print("  archived %s -> _attempts/%s.%d.%s.json" % (tag, qid, n, tag))


def redispatch(ledger, wave, ids, reason, model, role="author"):
    """Re-author specific ids (key misses, refusals, audit failures) - grouped by chapter, a
    fresh agent, still blind. With --role routes: re-phrase specific sidecars, a fresh agent."""
    pool, byid, bych = pool_index()
    bad = [i for i in ids if i not in byid]
    if bad:
        sys.exit("ids not in the pool: %s" % bad)
    by_ch = collections.defaultdict(list)
    for i in ids:
        by_ch[byid[i]["chapter_key"]].append(i)
        archive_attempt(i, role)
    rows = []
    for ck, group in sorted(by_ch.items()):
        k = 1 + sum(1 for r in ledger if r["wave"] == wave and r["chapter_key"] == ck and r["role"] == role and r.get("redispatch_of"))
        suffix = "_routes" if role == "routes" else ""
        slice_path = os.path.join(SLICES, "W%02d_%s%s_R%d.json" % (wave, ck, suffix, k))
        view = [routes_view(byid[i], load(os.path.join(SOL, i + ".json"))) for i in group] if role == "routes" \
            else [author_view(byid[i]) for i in group]
        save(slice_path, {"wave": wave, "role": role, "chapter_key": ck, "chapter": bych[ck]["name"],
                          "redispatch": k, "questions": view})
        rows.append({"wave": wave, "role": role, "chapter_key": ck, "chapter": bych[ck]["name"],
                     "question_ids": group, "model": model, "agent_label": label(wave, role, ck, k),
                     "slice_path": os.path.relpath(slice_path, ROOT).replace(os.sep, "/"),
                     "planned_at": now(), "dispatched_at": None, "status": "planned",
                     "files_expected": len(group), "files_present": 0,
                     "redispatch_of": k, "reason": reason})
        print("  planned %-16s %-36s %2d ids  (%s)" % (rows[-1]["agent_label"], bych[ck]["name"][:36],
                                                       len(group), reason))
    return rows


def audit_disk(ledger):
    """What is actually on disk, per row. A refusal counts as written: the agent did its job."""
    for r in ledger:
        if r["role"] == "rework":
            # a rework is written when the file's sha moved past the slice's copy of it
            sl = load(os.path.join(ROOT, r["slice_path"])) or {"questions": []}
            before = {v["id"]: v["solution"] for v in sl.get("questions", [])}
            present = []
            for i in r["question_ids"]:
                sol = load(os.path.join(SOL, i + ".json"))
                if sol and {k: sol.get(k) for k in SHOWN} != {k: before.get(i, {}).get(k) for k in SHOWN}:
                    present.append(i)
        elif r["role"] == "author":
            present = [i for i in r["question_ids"]
                       if os.path.exists(os.path.join(SOL, i + ".json"))
                       or os.path.exists(os.path.join(SOL, "_refusals", i + ".json"))]
        elif r["role"] == "routes":
            present = [i for i in r["question_ids"] if os.path.exists(os.path.join(ROUTES, i + ".json"))]
        else:
            # audit files are named <qid>.<sha8>.json: the slice knows which sha each row judged
            audit_dir = AUDIT_ROUTES if r["role"] == "routes_audit" else os.path.join(SOL, "_audit")
            sl = load(os.path.join(ROOT, r["slice_path"])) if os.path.exists(os.path.join(ROOT, r["slice_path"])) else {"items": []}
            present = [it["question_id"] for it in sl.get("items", [])
                       if os.path.exists(os.path.join(audit_dir, it["audit_file"]))]
        r["files_present"] = len(present)
        if r["status"] in ("dispatched", "partial", "written"):
            r["status"] = "written" if len(present) == r["files_expected"] else "partial" if present else "dispatched"
        r["audited_disk_at"] = now()


def status(ledger):
    print("%-16s %-6s %-28s %-9s %5s/%-5s %s" % ("agent", "role", "chapter", "status", "have", "want", "slice"))
    for r in ledger:
        print("%-16s %-6s %-28s %-9s %5d/%-5d %s" % (r["agent_label"], r["role"], r["chapter"][:28],
                                                     r["status"], r["files_present"], r["files_expected"],
                                                     r["slice_path"]))
    c = collections.Counter((r["role"], r["status"]) for r in ledger)
    print("")
    for (role, st), n in sorted(c.items()):
        print("  %-6s %-9s %d" % (role, st, n))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--plan", action="store_true")
    ap.add_argument("--redispatch", action="store_true")
    ap.add_argument("--mark-dispatched", action="store_true")
    ap.add_argument("--audit-disk", action="store_true")
    ap.add_argument("--unplan", action="store_true", help="drop rows still 'planned' (never dispatched) for --wave/--role, and their slices")
    ap.add_argument("--status", action="store_true")
    ap.add_argument("--wave", type=int)
    ap.add_argument("--role", default="author", choices=["author", "audit", "routes", "routes_audit", "rework"])
    ap.add_argument("--chapter-keys", nargs="*", default=[])
    ap.add_argument("--ids", nargs="*", default=[])
    ap.add_argument("--reason", default="")
    ap.add_argument("--model", default=None)
    a = ap.parse_args()

    ledger = load(LEDGER, [])
    model = a.model or ("opus" if a.role in ("audit", "routes_audit") else "sonnet")

    if a.plan:
        if a.wave is None:
            sys.exit("--plan needs --wave")
        if a.role == "author":
            if not a.chapter_keys:
                sys.exit("--plan --role author needs --chapter-keys")
            ledger += plan_authors(ledger, a.wave, a.chapter_keys, model)
        elif a.role == "routes":
            if not a.chapter_keys:
                sys.exit("--plan --role routes needs --chapter-keys")
            ledger += plan_routes(ledger, a.wave, a.chapter_keys, model)
        elif a.role == "routes_audit":
            ledger += plan_route_audits(ledger, a.wave, model)
        elif a.role == "rework":
            if not a.chapter_keys:
                sys.exit("--plan --role rework needs --chapter-keys")
            ledger += plan_rework(ledger, a.wave, a.chapter_keys, model)
        else:
            ledger += plan_audits(ledger, a.wave, model)
        save(LEDGER, ledger)
    elif a.redispatch:
        if a.wave is None or not a.ids or not a.reason:
            sys.exit("--redispatch needs --wave, --ids and --reason")
        if a.role not in ("author", "routes"):
            sys.exit("--redispatch is for --role author or --role routes")
        ledger += redispatch(ledger, a.wave, a.ids, a.reason, model, a.role)
        save(LEDGER, ledger)
    elif a.mark_dispatched:
        n = 0
        for r in ledger:
            if r["wave"] == a.wave and r["role"] == a.role and r["status"] == "planned":
                r["status"], r["dispatched_at"] = "dispatched", now()
                n += 1
        save(LEDGER, ledger)
        print("marked %d rows dispatched" % n)
    elif a.unplan:
        if a.wave is None:
            sys.exit("--unplan needs --wave")
        keep, dropped = [], 0
        for r in ledger:
            if r["wave"] == a.wave and r["role"] == a.role and r["status"] == "planned":
                p = os.path.join(ROOT, r["slice_path"])
                if os.path.exists(p):
                    os.remove(p)
                dropped += 1
                print("  unplanned %s (%s)" % (r["agent_label"], r["slice_path"]))
            else:
                keep.append(r)
        save(LEDGER, keep)
        print("unplanned %d rows" % dropped)
    elif a.audit_disk:
        audit_disk(ledger)
        save(LEDGER, ledger)
        status(ledger)
    elif a.status:
        status(ledger)
    else:
        ap.print_help()


if __name__ == "__main__":
    main()
