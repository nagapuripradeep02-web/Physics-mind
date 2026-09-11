"""Subscription-only model roles for the bank. A role is PLANNED into slices (gitignored, verbatim),
DISPATCHED as Claude Code sub-agents that each write one file per item, and COLLECTED into the JSONL
the gate already reads (transcripts.jsonl, work/restate|givens|examplekey|solveB|fidelity|
fidelity_gemini|syllabus.jsonl, key.json, hints.json, work/equiv.jsonl). No paid API call lives here.

    python scripts/bank/audit.py plan --role reader|keyreader|solveB|fidelity|fidelity2|judge|syllabus --wave N [--size K] [--model M] [--only ID ...]
    python scripts/bank/solve.py collect --role <role> [--force]

Every agent writes to the `out` path named in its slice; the collector computes ids and shas (an
agent never does), applies the LaTeX→Unicode normaliser, and skips what is already collected.
"""
import os, io, re, sys, json, glob, random, collections

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import _lib as L      # noqa: E402
import ingest as I    # noqa: E402
import solve as S     # noqa: E402

LETTER = {"reader": "RD", "keyreader": "KY", "solveB": "B", "fidelity": "F", "fidelity2": "F2", "judge": "J", "syllabus": "SY"}
ROLES = tuple(LETTER)
TIER_ORDER = ["EX", "IE", "L1 AR", "L1 SC", "L1 SUB"]
DEFAULT_SIZE = {"reader": 12, "keyreader": 7, "solveB": 12, "fidelity": 15, "fidelity2": 15, "judge": 50, "syllabus": 40}
DEFAULT_MODEL = {"reader": "sonnet", "keyreader": "sonnet", "solveB": "opus", "fidelity": "sonnet", "fidelity2": "opus",
                 "judge": "sonnet", "syllabus": "sonnet"}
JSONL_OF = {"solveB": "solveB", "fidelity": "fidelity", "fidelity2": "fidelity_gemini", "syllabus": "syllabus"}
PENDING = os.path.join(L.GATE, "_judge_pending.jsonl")
EQUIV_CACHE = os.path.join(L.WORK, "equiv.jsonl")
SLICES = os.path.join(L.EVIDENCE, "_slices")


def out_dir(role):
    return os.path.join(L.WORK, role)


def label(wave, role, k):
    return "W%02d-%s-%s-%02d" % (wave, LETTER[role], L.PREFIX, k)


def spath(wave, role, k):
    return os.path.join(SLICES, "W%02d_%s_%s_%02d.json" % (wave, L.PREFIX, role, k))


def _chunks(xs, n):
    return [xs[i:i + n] for i in range(0, len(xs), n)]


def _tier_key(t):
    return (TIER_ORDER.index(t["tier"]) if t["tier"] in TIER_ORDER else 9, t["page"], t.get("label", ""))


def _rows(wave, role, model, chunks, id_key, extra=None):
    """Save one slice file per chunk and return the ledger rows (written BEFORE any agent runs)."""
    rows = []
    for k, chunk in enumerate(chunks, 1):
        path, lab = spath(wave, role, k), label(wave, role, k)
        L.save(path, {"wave": wave, "role": role, "chapter": L.CHAPTER, "slice": k, "agent_label": lab, "items": chunk})
        outs = sorted({v["out"] for v in chunk})
        row = {"wave": wave, "role": role, "chapter": L.CHAPTER, "slice": k, "question_ids": [v.get(id_key) for v in chunk],
               "outputs": outs, "model": model, "agent_label": lab, "slice_path": path.replace(os.sep, "/"),
               "planned_at": L.now(), "dispatched_at": None, "status": "planned", "files_expected": len(outs), "files_present": 0}
        if extra:
            row.update(extra(k, chunk))
        rows.append(row)
        print("  planned %-18s %2d items, %2d files -> %s" % (lab, len(chunk), len(outs), path))
    return rows


def _open_rows(led, role):
    return [r for r in led if r["role"] == role and r["status"] in ("planned", "dispatched", "partial")]


# ---------------------------------------------------------------- plans
def plan_reader(led, wave, size, model, only):
    man = L.load(I.MANIFEST) or sys.exit("run ingest locate + crop first")
    done = {r["label"] for r in L.jsonl_read(I.TRANSCRIPTS)}
    open_labels = {i for r in _open_rows(led, "reader") for i in r["question_ids"]}
    # a context block ("Directions" shared by several items) is labelled "<block> DIRECTIONS", e.g. "L1 AR DIRECTIONS"
    ctx = [(c["label"], os.path.join(L.EVIDENCE, c["crop"]).replace("/", os.sep)) for c in man["markers"] if c["kind"] == "context" and c.get("crop")]
    # context_overrides.json (evidence folder): [{"applies": [labels], "crop_of": label}] - a note printed inside one
    # item's crop that later items depend on ("in exercises 16 to 18 ..."), or the item a "repeat the above" refers to
    crop_of = {m["label"]: os.path.join(L.EVIDENCE, m["crop"]).replace("/", os.sep) for m in man["markers"] if m.get("crop")}
    over = {lab: crop_of[o["crop_of"]] for o in (L.load(os.path.join(L.EVIDENCE, "context_overrides.json")) or []) for lab in o["applies"]}
    views = []
    for m in sorted([m for m in man["markers"] if m["kind"] == "item" and m.get("crop")], key=_tier_key):
        out = os.path.join(out_dir("reader"), I.slug(m["label"]) + ".json")
        if only and m["label"] not in only:
            continue
        if not only and (m["label"] in done or m["label"] in open_labels or os.path.exists(out)):
            continue
        cc = over.get(m["label"]) or next((p for lab, p in ctx if m["tier"].startswith("L1") and lab.startswith(m["tier"])), None)
        views.append({"label": m["label"], "tier": m["tier"], "page": m["page"], "worked_example": m["tier"] == "EX",
                      "crop": os.path.join(L.EVIDENCE, m["crop"]).replace("/", os.sep), "context_crop": cc, "out": out})
    return _rows(wave, "reader", model, _chunks(views, size), "label")


def plan_keyreader(led, wave, size, model, only):
    d = I.doc()
    views_a = [{"page": p, "kind": "answers", "image": os.path.join(L.PAGES, "p%04d.png" % p),
                "out": os.path.join(out_dir("keyreader"), "p%04d.json" % p)} for p in range(I.ANSWERS[0], I.ANSWERS[1] + 1)]
    views_h = [{"page": p, "kind": "hints", "image": os.path.join(L.PAGES, "p%04d.png" % p),
                "out": os.path.join(out_dir("keyreader"), "p%04d.json" % p)} for p in range(I.HINTS_START, I.hints_end(d) + 1)]
    views_a = [v for v in views_a if not os.path.exists(v["out"])]
    views_h = [v for v in views_h if not os.path.exists(v["out"])]
    chunks = ([views_a] if views_a else []) + _chunks(views_h, size)
    return _rows(wave, "keyreader", model, chunks, "page")


def plan_solveB(led, wave, size, model, only):
    import audit
    tr = S.transcripts()
    done = S.done_ids("solveB")
    open_ids = {i for r in _open_rows(led, "solveB") for i in r["question_ids"]}
    views = []
    for wid in sorted(tr, key=lambda w: _tier_key(tr[w])):
        out = os.path.join(out_dir("solveB"), wid + ".json")
        if only and wid not in only:
            continue
        if not only and (wid in done or wid in open_ids or os.path.exists(out)):
            continue
        v = audit.author_view(wid, tr[wid])
        v["out"] = out
        views.append(v)
    return _rows(wave, "solveB", model, _chunks(views, size), "item_id")


def plan_fidelity(led, wave, size, model, only, role="fidelity"):
    rs = S.done_ids("restate")
    done = S.done_ids(JSONL_OF[role])
    open_ids = {i for r in _open_rows(led, role) for i in r["question_ids"]}
    if role == "fidelity2" and not only:
        # the second re-solve runs only on items the first one failed (the gate names them)
        st = L.load(os.path.join(L.GATE, "status.json"), {})
        only = [w for w, r in st.items() if "fidelity" in (r.get("restatement_reason") or "")]
        print("  fidelity2 candidates from the gate: %d" % len(only))
        if not only:
            return []
    views = []
    for wid in sorted(rs):
        rt = rs[wid]
        out = os.path.join(out_dir(role), wid + ".json")
        if not rt.get("question_text"):
            continue
        sha = S.restatement_sha(rt)
        if only:
            # a re-solve already on file counts only if it read THIS restatement; a restated item is re-solved afresh
            if wid not in only or (role == "fidelity" and wid in done and done[wid].get("restatement_sha") == sha):
                continue
        elif wid in done or wid in open_ids or os.path.exists(out):
            continue
        views.append({"item_id": wid, "restatement_sha": sha, "problem": S.restatement_text(rt), "out": out})
    return _rows(wave, role, model, _chunks(views, size), "item_id")


def plan_judge(led, wave, size, model, only):
    cache = {r["k"] for r in L.jsonl_read(EQUIV_CACHE)}
    open_ks = {i for r in _open_rows(led, "judge") for i in r["question_ids"]}
    seen, views = set(), []
    for r in L.jsonl_read(PENDING):
        if r["k"] in cache or r["k"] in seen or r["k"] in open_ks:
            continue
        seen.add(r["k"])
        views.append({"k": r["k"], "a": r["a"], "b": r["b"]})
    chunks = _chunks(views, size)
    for k, chunk in enumerate(chunks, 1):
        out = os.path.join(out_dir("judge"), label(wave, "judge", k) + ".json")
        for v in chunk:
            v["out"] = out
    return _rows(wave, "judge", model, chunks, "k")


def plan_syllabus(led, wave, size, model, only):
    import gate
    sols = S.solutions()
    done = {(r["id"], r.get("content_sha")) for r in L.jsonl_read(S.work_path("syllabus"))}
    open_ids = {i for r in _open_rows(led, "syllabus") for i in r["question_ids"]}
    views = []
    for wid in sorted(sols):
        if only and wid not in only:
            continue
        sha = L.sha_of(sols[wid])
        if not only and ((wid, sha) in done or wid in open_ids):
            continue
        views.append({"id": wid, "content_sha": sha, "solution": gate.solution_text(sols[wid])})
    plants = (L.load(os.path.join(gate.FIX, "syllabus_plants.json")) or {}).get("plants") or []
    chunks, plant_maps = [], []
    for k, chunk in enumerate(_chunks(views, size), 1):
        rnd = random.Random(label(wave, "syllabus", k))
        pm = {}
        for i, p in enumerate(plants):
            pid = "%s_%s" % (L.PREFIX, L.sha256(label(wave, "syllabus", k) + p["name"])[:8])     # looks like a working id
            pm[pid] = p["expect"]
            chunk.append({"id": pid, "content_sha": None, "solution": p["solution"]})
        rnd.shuffle(chunk)
        out = os.path.join(out_dir("syllabus"), label(wave, "syllabus", k) + ".json")
        for v in chunk:
            v["out"] = out
        chunks.append(chunk)
        plant_maps.append(pm)
    return _rows(wave, "syllabus", model, chunks, "id", extra=lambda k, chunk: {"plants": plant_maps[k - 1]})


PLANNERS = {"reader": plan_reader, "keyreader": plan_keyreader, "solveB": plan_solveB, "fidelity": plan_fidelity,
            "fidelity2": lambda led, w, s, m, o: plan_fidelity(led, w, s, m, o, role="fidelity2"), "judge": plan_judge,
            "syllabus": plan_syllabus}


def plan(led, role, wave, size, model, only):
    size = size or DEFAULT_SIZE[role]
    model = model or DEFAULT_MODEL[role]
    return PLANNERS[role](led, wave, size, model, only)


# ---------------------------------------------------------------- collectors
def _slice_items(led, role):
    """(ledger row, slice item) for every planned item of the role, latest plan of an item last."""
    out = []
    for r in led:
        if r["role"] != role:
            continue
        sl = L.load(r["slice_path"]) or {"items": []}
        for it in sl["items"]:
            out.append((r, it))
    return out


def _load_out(path):
    j = L.load(path)
    if j is None and os.path.exists(path):
        print("  UNREADABLE %s" % path)
    return j


TEXT_KEYS = ("question_text", "printed_solution", "printed_answer", "printed_final")


def collect_reader(led, force):
    have = {r["label"] for r in L.jsonl_read(I.TRANSCRIPTS)}
    rs, gv, ek = S.done_ids("restate"), S.done_ids("givens"), S.done_ids("examplekey")
    n = collections.Counter()
    seen = set()
    for row, it in _slice_items(led, "reader"):
        lab = it["label"]
        if lab in seen:
            continue
        j = _load_out(it["out"])
        if not j:
            n["missing"] += 1
            continue
        seen.add(lab)
        if lab in have and not force:
            n["already"] += 1
            continue
        req = {"kind", "format", "question_text", "options", "figure", "restatement"}
        if req - set(j):
            print("  %-12s INCOMPLETE: missing %s" % (lab, sorted(req - set(j))))
            n["incomplete"] += 1
            continue
        t = {k: j.get(k) for k in ("label_seen", "kind", "format", "question_text", "options", "parts", "figure", "printed_solution",
                                   "printed_answer", "truncated", "extra_items_visible")}
        for k in TEXT_KEYS:
            if t.get(k):
                t[k] = L.latex_to_unicode(t[k])
        t["options"] = [{"label": o.get("label", ""), "text": L.latex_to_unicode(o.get("text", ""))} for o in (t.get("options") or [])]
        t["parts"] = t.get("parts") or []
        if not (t.get("figure") or {}).get("present"):
            t["figure"] = {"present": False}
        trow = {"label": lab, "tier": it["tier"], "page": it["page"], "crop": os.path.relpath(it["crop"], L.EVIDENCE).replace(os.sep, "/"), **t,
                "sha": L.transcript_sha(t),
                "model": row["model"], "agent": row["agent_label"], "at": L.now()}
        L.jsonl_append(I.TRANSCRIPTS, trow)
        have.add(lab)
        n["transcripts"] += 1
        wid = S.wid_of(trow)
        r = j["restatement"]
        rrow = {"id": wid, "question_text": L.latex_to_unicode(r.get("question_text", "")),
                "options": [{"label": o.get("label", ""), "text": L.latex_to_unicode(o.get("text", ""))} for o in (r.get("options") or [])],
                "parts": [L.latex_to_unicode(p) for p in (r.get("parts") or [])], "conditions": r.get("conditions") or [],
                "figure_description": L.latex_to_unicode(r.get("figure_description") or ""), "figure_required": bool(r.get("figure_required")),
                "error": None, "model": row["model"], "agent": row["agent_label"], "at": L.now()}
        if wid not in rs or force:
            L.jsonl_append(S.work_path("restate"), rrow)
            n["restate"] += 1
        go, gr = j.get("givens_original") or {}, j.get("givens_restatement") or {}
        if wid not in gv or force:
            L.jsonl_append(S.work_path("givens"), {"id": wid, "restatement_sha": S.restatement_sha(rrow),
                                                   "original": {"givens": go.get("givens") or [], "conditions": go.get("conditions") or [], "asked": go.get("asked"), "error": None},
                                                   "restatement": {"givens": gr.get("givens") or [], "conditions": gr.get("conditions") or [], "asked": gr.get("asked"), "error": None},
                                                   "at": L.now()})
            n["givens"] += 1
        if t.get("kind") == "worked_example" and j.get("printed_final") and (wid not in ek or force):
            L.jsonl_append(S.work_path("examplekey"), {"id": wid, "final_value": L.latex_to_unicode(j["printed_final"]), "error": None, "at": L.now()})
            n["examplekey"] += 1
    print("reader collected: %s" % dict(n))


def collect_keyreader(led, force):
    d = I.doc()
    entries, hints, pages_a, pages_h = [], [], [], []
    for row, it in _slice_items(led, "keyreader"):
        j = _load_out(it["out"])
        if not j:
            print("  page %d: no file yet" % it["page"])
            continue
        for e in j.get("entries", []):
            e = dict(e)
            e["page"] = it["page"]
            if it["kind"] == "answers":
                e["answer"] = L.latex_to_unicode(e.get("answer", ""))
                entries.append(e)
            else:
                e["final_value"] = L.latex_to_unicode(e.get("final_value", ""))
                hints.append(e)
        (pages_a if it["kind"] == "answers" else pages_h).append(it["page"])
    tl = I.text_layer_key(d)
    disagree = []
    for e in entries:
        for (sec, n), ans in tl.items():
            if n == e["item_no"] and sec.lower().replace("level 1 ", "") in e["section"].lower().replace("level 1 ", ""):
                if L.norm_text(ans) not in L.norm_text(e["answer"]):
                    disagree.append({"section": e["section"], "item_no": n, "agent": e["answer"], "text_layer": ans})
    if entries:
        L.save(I.KEY, {"entries": entries, "text_layer_reader": {"%s|%d" % k: v for k, v in tl.items()}, "disagreements": disagree, "at": L.now()})
        print("key: %d entries from pages %s, text-layer reader %d, disagreements %d -> %s" % (len(entries), sorted(pages_a), len(tl), len(disagree), I.KEY))
        for x in disagree[:20]:
            print("   DISAGREE", x)
    if hints:
        L.save(I.HINTS, {"entries": hints, "pages": [I.HINTS_START, I.hints_end(d)], "at": L.now()})
        print("hints: %d entries from %d pages -> %s" % (len(hints), len(pages_h), I.HINTS))


def _collect_answers(led, role, force):
    """solveB / fidelity / fidelity2: one JSON per item -> one JSONL row in the gate's shape."""
    target = JSONL_OF[role]
    done = S.done_ids(target)
    # every (item, restatement) pair ever collected - not only the latest row per item, or an older slice that
    # shares the out file with a fresh re-solve would re-append the new content under the old sha
    pairs = {(r["id"], r.get("restatement_sha")) for r in L.jsonl_read(S.work_path(target))}
    n = collections.Counter()
    seen = set()
    for row, it in _slice_items(led, role):
        wid = it["item_id"]
        # a re-solver row belongs to the restatement it read: the same item restated is a new (wid, sha) pair
        k = (wid, it.get("restatement_sha")) if role != "solveB" else wid
        if k in seen:
            continue
        j = _load_out(it["out"])
        if not j:
            n["missing"] += 1
            continue
        seen.add(k)
        if not force and (wid in done if role == "solveB" else (wid, it.get("restatement_sha")) in pairs):
            n["already"] += 1
            continue
        fo = j.get("final_option")
        try:
            fo = int(fo) if fo not in (None, "") else None
        except (TypeError, ValueError):
            fo = None
        r = {"id": wid, "final_option": fo, "final_value": L.latex_to_unicode(str(j.get("final_value") or "")),
             "method": j.get("method"), "error": None, "model": row["model"], "agent": row["agent_label"], "at": L.now()}
        if role == "solveB":
            r["solvable"] = j.get("solvable", True)
        else:
            r["restatement_sha"] = it.get("restatement_sha")
        L.jsonl_append(S.work_path(target), r)
        n["rows"] += 1
    print("%s collected: %s -> %s" % (role, dict(n), S.work_path(target)))


def collect_judge(led, force):
    cache = {r["k"] for r in L.jsonl_read(EQUIV_CACHE)}
    n = collections.Counter()
    for row in [r for r in led if r["role"] == "judge"]:
        sl = L.load(row["slice_path"]) or {"items": []}
        pairs = {it["k"]: it for it in sl["items"]}
        for out in row["outputs"]:
            j = _load_out(out)
            if not j:
                n["missing"] += 1
                continue
            for v in j.get("verdicts", []):
                k = v.get("k")
                if k not in pairs or not isinstance(v.get("equivalent"), bool):
                    n["bad"] += 1
                    continue
                if k in cache and not force:
                    n["already"] += 1
                    continue
                L.jsonl_append(EQUIV_CACHE, {"k": k, "a": pairs[k]["a"], "b": pairs[k]["b"], "equivalent": v["equivalent"],
                                             "why": v.get("why"), "judge": row["model"], "agent": row["agent_label"]})
                cache.add(k)
                n["rows"] += 1
    print("judge collected: %s -> %s" % (dict(n), EQUIV_CACHE))


def collect_syllabus(led, force):
    done = {(r["id"], r.get("content_sha")) for r in L.jsonl_read(S.work_path("syllabus"))}
    n = collections.Counter()
    for row in [r for r in led if r["role"] == "syllabus"]:
        sl = L.load(row["slice_path"]) or {"items": []}
        j = _load_out(row["outputs"][0]) if row["outputs"] else None
        if not j:
            n["missing"] += 1
            continue
        verdicts = {v.get("id"): v for v in j.get("verdicts", [])}
        plants = row.get("plants") or {}
        missed = [pid for pid, want in plants.items() if (verdicts.get(pid) or {}).get("verdict") != want]
        if missed:
            print("  %s missed %d of %d plants -> batch DISCARDED (not believed)" % (row["agent_label"], len(missed), len(plants)))
            row["status"] = "discredited"
            n["discarded"] += 1
            continue
        for it in sl["items"]:
            if it["id"] in plants:
                continue
            v = verdicts.get(it["id"])
            if not v or v.get("verdict") not in ("within", "beyond"):
                n["bad"] += 1
                continue
            if (it["id"], it["content_sha"]) in done and not force:
                n["already"] += 1
                continue
            L.jsonl_append(S.work_path("syllabus"), {"id": it["id"], "content_sha": it["content_sha"], "verdict": v["verdict"],
                                                     "beyond": v.get("beyond") or [], "error": None, "judge": row["model"],
                                                     "agent": row["agent_label"], "at": L.now()})
            done.add((it["id"], it["content_sha"]))
            n["rows"] += 1
        n["plants_ok"] += len(plants)
    print("syllabus collected: %s -> %s" % (dict(n), S.work_path("syllabus")))


COLLECTORS = {"reader": collect_reader, "keyreader": collect_keyreader, "solveB": lambda led, f: _collect_answers(led, "solveB", f),
              "fidelity": lambda led, f: _collect_answers(led, "fidelity", f), "fidelity2": lambda led, f: _collect_answers(led, "fidelity2", f),
              "judge": collect_judge, "syllabus": collect_syllabus}


def collect(led, role, force=False):
    COLLECTORS[role](led, force)


def disk(row):
    """files present for a ledger row of one of these roles"""
    return [p for p in row.get("outputs", []) if os.path.exists(p)]
