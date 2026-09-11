"""The per-item gate (stage 3 onward): three readers + the printed hint, the syllabus verdict, and
the restatement checks. Invoked as `python scripts/bank/gate.py run [--baseline|--freeze-baseline]`.

Writes bank/physics/<chapter>/_gate/status.json (keyed by working id, every verdict with the
content sha it judged), _gate/_rejected.json, and _escalate.json for the founder. Read-only over
solutions and transcripts. Never edits anything it checks.
"""
import os, io, re, sys, json, collections

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import _lib as L      # noqa: E402
import gate as G      # noqa: E402
import ingest         # noqa: E402
import solve as S     # noqa: E402

STATUS = os.path.join(L.GATE, "status.json")
REJECTED = os.path.join(L.GATE, "_rejected.json")
BASELINE = os.path.join(L.GATE, "baseline.json")
ESCALATE = os.path.join(L.BANK, "_escalate.json")
FD2 = {}
EQUIV_CACHE = os.path.join(L.WORK, "equiv.jsonl")

REQUIRED = {"schema", "question_id", "approach", "steps", "final_answer", "confidence", "common_mistakes",
            "concept_tags", "difficulty", "mistake_type_hint", "authored_by"}
STEP_KEYS = {"text", "equation", "why_this_step"}
MISTAKE_KEYS = {"option", "text", "distractor"}
LIMITS = {"approach": 30, "step_text": 60, "mistake": 35, "steps_min": 2, "steps_max": 8, "mistakes_max": 3}
IDENTITY = re.compile(r"\b(?:pandey|arihant|verma|cengage|resonance|allen|narayana|chaitanya)\b|understanding physics|"
                      r"\bexample\s*\d|\bexercise\s*\d|\bpage\s*\d|\bchapter\s*\d|\bfig\.?\s*\d|\bDCP\b|\bHCV\b|level\s*[12]\b", re.I)
SEQ_SECTIONS = ["IE 6.1", "IE 6.2", "IE 6.3", "IE 6.4", "IE 6.5", "IE 6.6", "IE 6.7", "IE 6.8", "IE 6.9",
                "L1 AR", "L1 SC", "L1 SUB", "L2 SC", "L2 MC", "L2 CB", "L2 MT", "L2 SUB"]


# ---------------------------------------------------------------- readers
def hint_index(hints):
    """Hints carry unreliable section labels (the model copied page headers). Re-section by SEQUENCE:
    a specific label jumps to it; an item number that drops advances to the next section."""
    out, cur, prev = {}, -1, 0
    for e in sorted(hints.get("entries", []), key=lambda e: (e["page"], 0)):
        s = e.get("section", "").lower()
        m = re.search(r"(\d\.\d)", s) if "introductory" in s or "exercise" in s else None
        jump = None
        if m and "IE " + m.group(1) in SEQ_SECTIONS:
            jump = SEQ_SECTIONS.index("IE " + m.group(1))
        elif "assertion" in s:
            jump = SEQ_SECTIONS.index("L1 AR")
        elif "more than one" in s:
            jump = SEQ_SECTIONS.index("L2 MC")
        elif "comprehension" in s:
            jump = SEQ_SECTIONS.index("L2 CB")
        elif "match" in s:
            jump = SEQ_SECTIONS.index("L2 MT")
        elif "single correct" in s or "objective" in s:
            jump = SEQ_SECTIONS.index("L1 SC") if cur < SEQ_SECTIONS.index("L1 SC") else SEQ_SECTIONS.index("L2 SC")
        elif "subjective" in s:
            jump = SEQ_SECTIONS.index("L1 SUB") if cur < SEQ_SECTIONS.index("L1 SUB") else SEQ_SECTIONS.index("L2 SUB")
        n = e.get("item_no") or 0
        if jump is not None and jump >= cur:
            if jump != cur:
                cur, prev = jump, 0
        elif n < prev and cur + 1 < len(SEQ_SECTIONS):
            cur, prev = cur + 1, 0
        if cur < 0:
            cur = 0
        out.setdefault((SEQ_SECTIONS[cur], n), e)
        prev = n
    return out


def label_section(label):
    m = re.match(r"(IE \d\.\d) Q(\d+)", label)
    if m:
        return m.group(1), int(m.group(2))
    m = re.match(r"(L1 (?:AR|SC|SUB)) Q(\d+)", label)
    if m:
        return m.group(1), int(m.group(2))
    return None, None


def author_answer(sol):
    fa = sol.get("final_answer") or {}
    return fa.get("option"), fa.get("value")


def same(a_opt, a_val, b_opt, b_val, kind, cache):
    """Compare two readings. Options first when both have one; else values via the comparator, then the judge."""
    if a_opt and b_opt:
        return a_opt == b_opt, "option"
    if a_opt and not b_opt and b_val and G.letter_of(b_val):
        return a_opt == G.letter_of(b_val), "option~letter"
    if b_opt and not a_opt and a_val and G.letter_of(a_val):
        return b_opt == G.letter_of(a_val), "letter~option"
    if not a_val or not b_val:
        return None, "missing"
    ok, how = G.answers_equal(a_val, b_val, kind)
    if ok is None:
        k = L.sha256(a_val + "|" + b_val)
        if k in cache:
            return cache[k]["equivalent"], "judge(cached)"
        eq, why = G.equiv_judge(a_val, b_val)
        L.jsonl_append(EQUIV_CACHE, {"k": k, "a": a_val, "b": b_val, "equivalent": eq, "why": why})
        cache[k] = {"equivalent": eq}
        return eq, "judge"
    return ok, how


# ---------------------------------------------------------------- schema + prose checks
def schema_check(sol, wid, idioms):
    if not isinstance(sol, dict):
        return "not_an_object", []
    if sol.get("schema") != "eapcet_solution_v1":
        return "wrong_schema", []
    if set(sol) - REQUIRED:
        return "unknown_keys " + ",".join(sorted(set(sol) - REQUIRED)), []
    if REQUIRED - set(sol):
        return "missing_keys " + ",".join(sorted(REQUIRED - set(sol))), []
    if sol["question_id"] != wid:
        return "id_mismatch", []
    if sol.get("confidence") != "sure":
        return "not_sure", []
    if L.words(sol["approach"]) > LIMITS["approach"]:
        return "approach_length", []
    steps = sol["steps"]
    if not isinstance(steps, list) or not LIMITS["steps_min"] <= len(steps) <= LIMITS["steps_max"]:
        return "step_count", []
    for st in steps:
        if not isinstance(st, dict) or set(st) - STEP_KEYS or not st.get("text"):
            return "bad_step", []
        if L.words(st["text"]) > LIMITS["step_text"]:
            return "step_length", []
    fa = sol["final_answer"]
    if not isinstance(fa, dict) or set(fa) != {"option", "value"} or (fa["option"] is not None and fa["option"] not in (1, 2, 3, 4)):
        return "bad_final_answer", []
    if fa["option"] is None and not (fa.get("value") or "").strip():
        return "empty_value", []
    cm = sol["common_mistakes"]
    if not isinstance(cm, list) or len(cm) > LIMITS["mistakes_max"]:
        return "mistakes_shape", []
    for m in cm:
        if not isinstance(m, dict) or set(m) - MISTAKE_KEYS or not m.get("text"):
            return "bad_mistake", []
        if L.words(m["text"]) > LIMITS["mistake"]:
            return "mistake_length", []
    if sol["difficulty"] not in ("easy", "medium", "hard") or sol["mistake_type_hint"] not in ("concept", "calculation", "application"):
        return "bad_enum", []
    ab = sol["authored_by"]
    if not isinstance(ab, dict) or {"model", "wave", "agent", "at"} - set(ab):
        return "bad_provenance", []
    for st in steps:
        for k in ("text", "why_this_step", "equation"):
            if st.get(k) is None:
                st[k] = ""
    texts = [sol["approach"]] + [st.get("text", "") + " " + st.get("why_this_step", "") for st in steps] + [m["text"] for m in cm]
    joined = " ".join(texts)
    warnings = []
    if L.PLACEHOLDER.search(joined) or L.EXTRA_PLACEHOLDER.search(joined):
        return "placeholder", []
    for rx, name in L.MARKDOWN:
        if rx.search(joined + " " + " ".join(st.get("equation", "") for st in steps)):
            return "markdown " + name, []
    hits = L.idioms_in(joined, idioms)
    if hits:
        return "idiom " + hits[0], []
    if IDENTITY.search(joined):
        return "source_identity " + IDENTITY.search(joined).group(0), []
    for p in L.PERSONIFY:
        if re.search(r"\b" + re.escape(p) + r"\b", joined.lower()):
            warnings.append("register: " + p)
    asc = L.ascii_maths_in(joined + " " + " ".join(st.get("equation", "") for st in steps))
    if asc:
        warnings.append("ascii maths " + " ".join(asc))
    # the last two steps must state the final value
    if fa["value"]:
        tail = " ".join((st.get("text", "") + " " + st.get("equation", "")) for st in steps[-2:])
        v = G.number_of(G.split_unit(fa["value"])[0])
        if v is not None:
            nums = [G.number_of(x) for x in re.findall(r"[-−]?\d+(?:\.\d+)?(?:/\d+)?", tail.replace("−", "-"))]
            if not any(n is not None and G.close(abs(n), abs(v)) for n in nums):
                warnings.append("ending_unverified")
    return None, warnings


# ---------------------------------------------------------------- restatement checks
def shingles(text, n=12):
    """12-token runs; a run counts only when at least 8 of its tokens are English words - the given formula
    (v = 3t² − 6t m/s) must survive a restatement verbatim and is not copied prose."""
    t = L.norm_text(text).split()
    out = set()
    for i in range(len(t) - n + 1):
        run = t[i:i + n]
        if sum(1 for w in run if re.fullmatch(r"[a-z]{2,}", w)) < 8:
            continue
        if "reason" in run and ("assertion" in run or "explanation" in run):
            continue                    # the assertion-reason option boilerplate every exam prints
        out.add(" ".join(run))
    return out


def masked(text):
    toks = [("#" if (re.search(r"\d", w) or len(w) == 1) else w) for w in L.norm_text(text).split()]
    return " ".join(toks)


def lev_ratio(a, b):
    a, b = a[:500], b[:500]          # a prefix is enough to tell a paraphrase from a copy; the full DP is O(n·m) in pure Python
    if not a and not b:
        return 0.0
    prev = list(range(len(b) + 1))
    for i, ca in enumerate(a, 1):
        cur = [i]
        for j, cb in enumerate(b, 1):
            cur.append(min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (ca != cb)))
        prev = cur
    return prev[-1] / max(len(a), len(b), 1)


def givens_set(g):
    out = collections.Counter()
    for x in g.get("givens") or []:
        v = G.number_of(str(x.get("value", "")))
        if v is None:
            continue
        u = G.unit_canon(str(x.get("unit", ""))) or ""
        out[("%g" % v, G._U[u][0] if u in G._U else u)] += 1
    return out


def cond_match(c, others):
    tc = set(L.tokens(c))
    return any(len(tc & set(L.tokens(o))) >= max(1, len(tc) // 2) for o in others)


def restatement_checks(wid, tr, rt, gv, fd, sol, cache):
    """Returns (reject_reason|None, warnings, facts)."""
    facts, warn = {}, []
    q = S.restatement_text(rt, with_options=False, with_figure=False)
    all_text = S.restatement_text(rt)
    orig_text = tr["question_text"] + " " + " ".join(p for p in (tr.get("parts") or []) if isinstance(p, str))
    book_text = orig_text + " " + " ".join(o.get("text", "") for o in tr.get("options") or []) + " " + (tr.get("printed_solution") or "")
    m = IDENTITY.search(all_text)
    if m:
        return "restatement_identity " + m.group(0), warn, facts
    sh = shingles(book_text) & shingles(all_text)
    facts["shingle_hits"] = len(sh)
    if sh:
        return "restatement_shingle", warn, facts
    # the solution's prose must not carry the book's wording either (the printed worked solution above all)
    served = " ".join([sol.get("approach") or ""] + [(st.get("text") or "") + " " + (st.get("why_this_step") or "") for st in sol.get("steps") or []]
                      + [m.get("text") or "" for m in sol.get("common_mistakes") or []] + [(sol.get("final_answer") or {}).get("value") or ""])
    sh2 = shingles(book_text) & shingles(served)
    if sh2:
        facts["solution_shingle"] = sorted(sh2)[0]
        return "solution_shingle", warn, facts
    facts["edit_ratio"] = round(lev_ratio(masked(orig_text), masked(q)), 3)
    if facts["edit_ratio"] < 0.4:
        return "restatement_too_close %.2f" % facts["edit_ratio"], warn, facts
    orig_for_sig = re.sub(r"\b(?:table|fig\.?|figure|eq\.?|equation|example|exercise)\s*\d+(?:\.\d+)?", " ", orig_text, flags=re.I)
    so, sq = collections.Counter(L.numeric_signature(orig_for_sig)), collections.Counter(L.numeric_signature(q))
    if so != sq:
        facts["signature"] = [sorted(so.elements()), sorted(sq.elements())]
        f = tr.get("figure") or {}
        missing = sorted(x for x in (so - sq).elements() if x != "0")      # "initial velocity = 0" -> "from rest"
        if missing and not f.get("present"):
            return "restatement_numbers_changed (missing %s)" % " ".join(missing), warn, facts
        if missing:
            warn.append("numbers differ (figure item: values may have moved between text and figure)")
        else:
            warn.append("numbers added by the restatement: " + " ".join(sorted((sq - so).elements())))
    if gv:
        go, gr = givens_set(gv["original"]), givens_set(gv["restatement"])
        if go != gr:
            facts["givens"] = [sorted(go.items()), sorted(gr.items())]
            warn.append("givens differ")
        # two independent extractions word the same condition differently ("straight line" / "straight path"),
        # so a condition also counts as kept when its content words appear in the other side's full text
        fig_vals = " ".join((tr.get("figure") or {}).get("values_read") or [])
        rest_pool = (gv["restatement"].get("conditions") or []) + [all_text]
        orig_pool = (gv["original"].get("conditions") or []) + [orig_text + " " + fig_vals]
        dropped = [c for c in gv["original"].get("conditions") or [] if not cond_match(c, rest_pool)]
        added = [c for c in gv["restatement"].get("conditions") or [] if not cond_match(c, orig_pool)]
        facts["conditions_dropped"], facts["conditions_added"] = dropped, added
    else:
        dropped, added = [], []
        warn.append("no givens extraction yet")
    fid_ok = None
    if fd:
        a_opt, a_val = author_answer(sol)
        fid_ok, how = same(a_opt, a_val, fd.get("final_option"), fd.get("final_value"), "auto", cache)
        facts["fidelity"] = [fd.get("final_option"), fd.get("final_value"), how]
        fd2 = FD2.get(wid)
        if fid_ok is not True and fd2 and fd2.get("restatement_sha") == S.restatement_sha(rt):
            ok2, how2 = same(a_opt, a_val, fd2.get("final_option"), fd2.get("final_value"), "auto", cache)
            facts["fidelity2"] = [fd2.get("final_option"), fd2.get("final_value"), how2]
            if ok2 is True:
                warn.append("fidelity: the first crossed re-solve disagreed (%s); the second (Gemini) agrees" % how)
                fid_ok = True
        if fid_ok is False:
            return "restatement_fidelity", warn, facts
        if fid_ok is None:
            warn.append("fidelity undecided")
    else:
        warn.append("no fidelity re-solve yet")
    # a condition the two extractions disagree on is decisive only when the crossed re-solve could not
    # confirm the answer; with fidelity confirmed it is a wording difference, kept as a warning for the auditor
    if dropped and fid_ok is not True:
        return "restatement_condition_dropped: " + dropped[0], warn, facts
    if added and fid_ok is not True:
        return "restatement_condition_added: " + added[0], warn, facts
    if dropped:
        warn.append("conditions dropped (fidelity ok): " + "; ".join(dropped)[:80])
    if added:
        warn.append("conditions added (fidelity ok): " + "; ".join(added)[:80])
    return None, warn, facts


# ---------------------------------------------------------------- run
def run(a):
    idioms = L.idioms_from_ts()
    tr = S.transcripts()
    sols = S.solutions()
    refusals = {f[:-5] for f in os.listdir(os.path.join(S.SOLUTIONS, "_refusals"))} if os.path.isdir(os.path.join(S.SOLUTIONS, "_refusals")) else set()
    B = S.done_ids("solveB")
    RS = S.done_ids("restate")
    GV = S.done_ids("givens")
    FD = S.done_ids("fidelity")
    global FD2
    FD2 = S.done_ids("fidelity_gemini")          # the second crossed re-solve, run only on items the first one failed
    SY = S.done_ids("syllabus")
    EK = S.done_ids("examplekey")
    CH = S.done_ids("chapter")
    key = L.load(ingest.KEY, {"entries": []})
    hints = hint_index(L.load(ingest.HINTS, {"entries": []}))
    cache = {r["k"]: r for r in L.jsonl_read(EQUIV_CACHE)}
    status, rejected, escalate = {}, {}, []
    buckets = collections.Counter()
    import time
    for wid in sorted(tr):
        t = tr[wid]
        sol = sols.get(wid)
        if getattr(a, "verbose", False):
            print("  gating %s %s" % (wid, t.get("format")), flush=True)
            t_start = time.time()
        if not sol:
            if wid in refusals:
                buckets["refused"] += 1
            else:
                buckets["unauthored"] += 1
            continue
        row = {"content_sha": L.sha_of(sol), "format": t.get("format"), "kind": t.get("kind"), "checks": {}, "warnings": []}
        reason, warns = schema_check(sol, wid, idioms)
        row["warnings"] += warns
        if reason:
            row.update(verdict="reject", reason=reason, bucket="schema")
            status[wid] = row; rejected[wid] = reason; buckets["schema"] += 1
            continue
        a_opt, a_val = author_answer(sol)
        kind = "auto"
        # reader 3: the printed key (Level 1 + intro exercises); worked examples carry their printed answer in the transcript
        if t.get("kind") != "worked_example":
            key_val = ingest.find_key(key, t["label"])
        else:
            key_val = t.get("printed_answer") or (EK.get(wid) or {}).get("final_value") or None
        row["chapter"] = (CH.get(wid) or {}).get("chapter")
        if key_val and re.fullmatch(r"\[?\s*(?:graph|sketch|see (?:the )?hints?|figure)\s*\]?\.?", key_val.strip(), re.I):
            row["warnings"].append("printed answer is a sketch (%s): only the second reader confirms" % key_val.strip())
            key_val = None
        sec, n = label_section(t["label"])
        hint = hints.get((sec, n)) if sec else None
        hint_val = (hint or {}).get("final_value") or None
        b = B.get(wid) or {}
        k_ok, k_how = same(a_opt, a_val, None, key_val, kind, cache) if key_val else (None, "no_key")
        b_ok, b_how = same(a_opt, a_val, b.get("final_option") or None, b.get("final_value"), kind, cache) if b else (None, "no_B")
        h_ok, h_how = same(a_opt, a_val, None, hint_val, kind, cache) if hint_val else (None, "no_hint")
        bk_ok, _ = same(b.get("final_option") or None, b.get("final_value"), None, key_val, kind, cache) if (b and key_val) else (None, "")
        # the printed answer and hint are evidence: the tracked status keeps only a short hash of each
        hv = lambda v: None if v in (None, "") else "sha:" + L.sha256(str(v))[:8]
        row["checks"].update(key=[k_ok, k_how, hv(key_val)], B=[b_ok, b_how, b.get("final_option"), b.get("final_value")],
                             hint=[h_ok, h_how, hv(hint_val)], B_vs_key=bk_ok)
        sy = SY.get(wid)
        if sy and sy.get("content_sha") == row["content_sha"]:
            row["checks"]["syllabus"] = [sy.get("verdict"), sy.get("beyond")]
            if sy.get("verdict") == "beyond":
                row.update(verdict="reject", reason="syllabus " + "; ".join(sy.get("beyond") or [])[:80], bucket="syllabus")
                status[wid] = row; rejected[wid] = row["reason"]; buckets["syllabus"] += 1
                continue
        else:
            row["warnings"].append("no syllabus verdict at this sha")
        # the three-reader rule
        if t.get("format") == "assertion_reason":
            if k_ok is True and b_ok is True:
                bucket = "pass"
            else:
                bucket = "dropped_ar"
        elif k_ok is True and (b_ok is True or h_ok is True):
            bucket = "pass"
        elif k_ok is True:
            bucket = "pass_unconfirmed"          # author = key, but neither B nor the hint could confirm
        elif k_ok is False and b_ok is True:
            bucket = "escalate_key"              # two blind readers agree against the printed answer
        elif k_ok is False and (bk_ok is True or h_ok is False):
            bucket = "author_miss"
        elif k_ok is None and b_ok is True:
            bucket = "pass_no_key" if not key_val else "undecided"
        else:
            bucket = "undecided"
        row["bucket"] = bucket
        if hint_val and key_val:
            hk, _ = same(None, hint_val, None, key_val, kind, cache)
            if hk is False:
                row["warnings"].append("hint disagrees with printed answer")
        # restatement
        rt = RS.get(wid)
        if rt and rt.get("question_text"):
            if rt.get("figure_required"):
                row["figure_required"] = True
            rr, rw, facts = restatement_checks(wid, t, rt, GV.get(wid), FD.get(wid), sol, cache)
            row["warnings"] += rw
            row["restatement"] = facts
            row["restatement_sha"] = S.restatement_sha(rt)
            row["restatement_ok"] = rr is None
            if rr:
                row["restatement_reason"] = rr
        else:
            row["restatement_ok"] = False
            row["warnings"].append("no restatement yet")
        if bucket == "pass":
            row.update(verdict="pass", reason=None)
        elif bucket == "pass_no_key":
            row.update(verdict="pass", reason=None)
            row["warnings"].append("no usable printed answer: author and second reader agree; the auditor is the third reader")
        elif bucket == "pass_unconfirmed":
            row.update(verdict="pass", reason=None)
            row["warnings"].append("author = printed answer; the second reader could not confirm (%s); the auditor is the third reader" % b_how)
        else:
            row.update(verdict="reject", reason=bucket)
            rejected[wid] = bucket
        if bucket == "escalate_key":
            escalate.append({"id": wid, "author": [a_opt, a_val], "second_reader": [b.get("final_option"), b.get("final_value")],
                             "printed": key_val, "hint": hint_val, "format": t.get("format")})
        buckets[bucket] += 1
        status[wid] = row
        if getattr(a, "verbose", False):
            print("    -> %s %s (%.1fs)" % (bucket, row.get("restatement_reason", "rest-ok" if row.get("restatement_ok") else ""), time.time() - t_start), flush=True)
    print("gate over %d transcripts: %s" % (len(tr), dict(buckets)))
    rr = collections.Counter(r.get("restatement_reason", "ok" if r.get("restatement_ok") else "none") for r in status.values())
    print("restatement: %s" % dict(rr))
    warned = sum(1 for r in status.values() if r["warnings"])
    print("warnings on %d items (see _gate/status.json)" % warned)
    if a.baseline and os.path.exists(BASELINE):
        base = L.load(BASELINE)
        new_pass = sorted(i for i, r in status.items() if r["verdict"] == "pass" and base.get(i, {}).get("verdict") != "pass")
        new_rej = sorted(i for i, r in status.items() if r["verdict"] == "reject" and base.get(i, {}).get("verdict") == "pass")
        flipped = sorted(i for i, r in status.items() if i in base and base[i].get("content_sha") == r.get("content_sha")
                         and base[i].get("verdict") != r["verdict"])
        print("vs baseline: newly passing %d, newly rejected %d, verdict changed on UNCHANGED content %d" % (len(new_pass), len(new_rej), len(flipped)))
        for i in flipped:
            print("   ", i, base[i].get("verdict"), "->", status[i]["verdict"], status[i].get("reason"))
    elif a.baseline:
        print("no baseline yet - run with --freeze-baseline after reading this output")
    L.save(STATUS, status)
    L.save(REJECTED, rejected)
    L.save(ESCALATE, escalate)
    if a.freeze_baseline:
        L.save(BASELINE, status)
        print("baseline frozen")
    if escalate:
        print("ESCALATE %d: %s" % (len(escalate), [e["id"] for e in escalate]))
