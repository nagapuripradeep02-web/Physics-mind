"""Every model role of the bank, one resumable JSONL per role under the evidence work/ folder.

    python scripts/bank/solve.py solveB     # Gemini: independent second reading (crop for exercises, text for examples)
    python scripts/bank/solve.py syllabus   # DeepSeek judge (thinking off) over every author solution; plants first
    python scripts/bank/solve.py restate    # Gemini: OUR wording of the question (+ conditions, figure) - what the bank serves
    python scripts/bank/solve.py givens     # DeepSeek (thinking off): {givens, conditions} of the original AND the restatement
    python scripts/bank/solve.py fidelity   # DeepSeek high: re-solve the RESTATEMENT alone (the model that did not solve the original)
    [--only ID ...] [--force] [--limit N]

Keyed by the working id `kin_<sha8>` (sha of the verbatim transcript), the same key the author
sub-agents use. Nothing here ever sees key.json or hints.json.
"""
import os, re, io, re, sys, json, argparse, collections, threading, concurrent.futures

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import _lib as L  # noqa: E402
import ingest     # noqa: E402

SOLUTIONS = os.path.join(L.BANK, "_solutions")
AR_OPTIONS = [
    "If both Assertion and Reason are true and the Reason is the correct explanation of the Assertion.",
    "If both Assertion and Reason are true but the Reason is not the correct explanation of the Assertion.",
    "If the Assertion is true, but the Reason is false.",
    "If the Assertion is false but the Reason is true."]
SYLLABUS_CLAUSE = ("Use only methods from the Indian Class 11-12 syllabus (NCERT) plus the standard JEE Main coaching "
                   "techniques: equations of motion, graphs, relative velocity, vectors, calculus as taught in Class 11-12. "
                   "Never Lagrangian or Hamiltonian mechanics, Laplace or Fourier transforms, Jacobians, tensors, or any "
                   "university theorem by name.")


def wid_of(tr):
    return "kin_" + tr["sha"][:8]


def transcripts():
    """In-scope transcripts keyed by working id (latest row per label wins)."""
    rows = {}
    for r in L.jsonl_read(ingest.TRANSCRIPTS):
        rows[r["label"]] = r
    return {wid_of(r): r for r in rows.values()}


def options_block(tr):
    opts = tr.get("options") or []
    if not opts and tr.get("format") == "assertion_reason":
        opts = [{"label": "(%s)" % "abcd"[i], "text": t} for i, t in enumerate(AR_OPTIONS)]
    return "\n".join("%s %s" % (o.get("label", ""), o.get("text", "")) for o in opts)


def figure_block(tr):
    f = tr.get("figure") or {}
    if not f.get("present"):
        return ""
    vals = f.get("values_read") or []
    return "Figure: %s%s" % (f.get("description", ""), ("\nValues on the figure: " + "; ".join(vals)) if vals else "")


def restatement_text(rt, with_options=True, with_figure=True):
    """The whole served question: main text + lettered parts (+ options, figure). Every gate and
    every re-solver must read this, never question_text alone - 65 of 183 items carry parts."""
    out = [rt.get("question_text") or ""]
    for i, ptxt in enumerate(rt.get("parts") or []):
        ptxt = re.sub(r"^\s*\(?[a-hivx]{1,4}[\)\.]\s*", "", ptxt or "")     # the restater often labels the part itself
        out.append("(%s) %s" % ("abcdefgh"[i] if i < 8 else str(i + 1), ptxt))
    if with_options and rt.get("options"):
        out.append("Options:\n" + "\n".join("%s %s" % (o.get("label", i + 1), o.get("text", "")) for i, o in enumerate(rt["options"])))
    if with_figure and rt.get("figure_description"):
        out.append("Figure: " + rt["figure_description"])
    return "\n".join(out)


def restatement_sha(rt):
    return L.sha256(restatement_text(rt))


def question_block(tr):
    parts = [tr["question_text"]]
    ob = options_block(tr)
    if ob:
        parts.append("Options:\n" + ob)
    fb = figure_block(tr)
    if fb:
        parts.append(fb)
    return "\n".join(parts)


def work_path(role):
    return os.path.join(L.WORK, role + ".jsonl")


def done_ids(role):
    return {r["id"]: r for r in L.jsonl_read(work_path(role))}


def select(a, role, universe):
    done = done_ids(role)
    ids = [i for i in universe if (i not in done or a.force) and (not a.only or i in a.only)]
    if a.limit:
        ids = ids[:a.limit]
    print("%s: %d to do, %d done" % (role, len(ids), len(done)))
    return ids


_LOCK = threading.Lock()


def run_parallel(a, role, ids, one):
    """one(wid) -> (row, line). Rows are appended as they complete; a crash in one item never loses the others."""
    workers = max(1, a.workers)
    with concurrent.futures.ThreadPoolExecutor(max_workers=workers) as ex:
        futs = {ex.submit(one, wid): wid for wid in ids}
        for f in concurrent.futures.as_completed(futs):
            wid = futs[f]
            try:
                row, line = f.result()
            except Exception as e:  # noqa
                row, line = {"id": wid, "error": "crash " + repr(e)[:200], "at": L.now()}, "  %-13s CRASH %s" % (wid, repr(e)[:80])
            with _LOCK:
                L.jsonl_append(work_path(role), row)
                print(line, flush=True)


def solutions():
    out = {}
    if os.path.isdir(SOLUTIONS):
        for f in os.listdir(SOLUTIONS):
            if f.endswith(".json"):
                s = L.load(os.path.join(SOLUTIONS, f))
                if s:
                    out[f[:-5]] = s
    return out


# ---------------------------------------------------------------- solveB
SOLVE_SCHEMA = {"type": "OBJECT", "properties": {
    "final_option": {"type": "INTEGER", "description": "1-4 when the item has options, else 0", "nullable": True},
    "final_value": {"type": "STRING", "description": "the final result with its unit; every part of a multi-part answer as '(a) ..., (b) ...'; for a conceptual item the statement"},
    "method": {"type": "STRING", "description": "one line naming the method used"},
    "solvable": {"type": "BOOLEAN", "description": "false if the item cannot be solved from what is given"}},
    "required": ["final_value", "method", "solvable"]}
SOLVE_PROMPT = ("Solve this Class 11 physics (kinematics) problem. " + SYLLABUS_CLAUSE +
                " Work it out fully in your reasoning, then report only the final result. If the item has options, "
                "give the option number (1-4) whose text equals your result; if none does, give 0 and your value. "
                "For an assertion-reason item the options are: (1) both true and the reason explains the assertion; "
                "(2) both true but the reason does not explain it; (3) assertion true, reason false; (4) assertion false, "
                "reason true. Return JSON only.")


def cmd_solveB(a):
    tr = transcripts()
    for wid in select(a, "solveB", sorted(tr)):
        t = tr[wid]
        parts = [{"text": SOLVE_PROMPT}]
        if t.get("kind") == "worked_example" or not t.get("crop"):
            parts.append({"text": "PROBLEM:\n" + question_block(t)})
        else:
            parts.append({"text": "PROBLEM (transcribed; the image is the printed original):\n" + question_block(t)})
            parts.append(L.image_part(os.path.join(L.EVIDENCE, t["crop"])))
        r = L.gemini(parts, max_out=8000, json_schema=SOLVE_SCHEMA)
        j = L.json_of(r.get("content")) or {}
        row = {"id": wid, "final_option": j.get("final_option"), "final_value": L.latex_to_unicode(j.get("final_value", "")),
               "method": j.get("method"), "solvable": j.get("solvable"), "error": r.get("error"), "usage": r.get("usage"),
               "ms": r.get("ms"), "model": r.get("model"), "at": L.now()}
        L.jsonl_append(work_path("solveB"), row)
        print("  %-13s opt %-4s %-40s %s" % (wid, j.get("final_option"), (row["final_value"] or "")[:40], r.get("error", "")[:60] if r.get("error") else ""))


# ---------------------------------------------------------------- syllabus judge over author solutions
def cmd_syllabus(a):
    import gate
    sols = solutions()
    sy = L.load(os.path.join(gate.FIX, "syllabus_plants.json"))
    bad = 0
    for p in sy["plants"]:
        v, beyond, err = gate.syllabus_judge(p["solution"])
        bad += v != p["expect"]
    if bad:
        sys.exit("syllabus judge missed %d of %d plants - not believed this run" % (bad, len(sy["plants"])))
    print("syllabus plants: %d/%d" % (len(sy["plants"]), len(sy["plants"])))

    def one(wid):
        sol = sols[wid]
        v, beyond, err = gate.syllabus_judge(gate.solution_text(sol))
        return ({"id": wid, "content_sha": L.sha_of(sol), "verdict": v, "beyond": beyond, "error": err, "at": L.now()},
                "  %-13s %-7s %s" % (wid, v, "; ".join(beyond)[:80]))
    run_parallel(a, "syllabus", select(a, "syllabus", sorted(sols)), one)


# ---------------------------------------------------------------- restate
RESTATE_SCHEMA = {"type": "OBJECT", "properties": {
    "question_text": {"type": "STRING"},
    "options": {"type": "ARRAY", "items": {"type": "OBJECT", "properties": {"label": {"type": "STRING"}, "text": {"type": "STRING"}}, "required": ["label", "text"]}},
    "parts": {"type": "ARRAY", "items": {"type": "STRING"}},
    "conditions": {"type": "ARRAY", "items": {"type": "STRING"}, "description": "every physical condition the problem states or relies on, as short phrases: 'starts from rest', 'uniform acceleration', 'air resistance neglected', 'g = 10 m/s²', 'upward taken positive'"},
    "figure_description": {"type": "STRING", "description": "our own description of the figure with every value on it, or empty"},
    "figure_required": {"type": "BOOLEAN", "description": "true if the problem cannot be stated in words with all its data (a curve that must be read by eye)"}},
    "required": ["question_text", "options", "parts", "conditions", "figure_description", "figure_required"]}
RESTATE_PROMPT = ("Rewrite this physics problem in your own words for a student, as a fresh problem statement. Rules: keep EVERY "
                  "given quantity with its exact value and unit, every condition, and the exact question asked; change the "
                  "sentence structure and vocabulary substantially (do not keep any run of five or more words from the original); "
                  "use the same option letters in the same order, and keep option texts unchanged where they are pure numbers or "
                  "formulas; plain literal English a Class-11 student reads without a dictionary - no idioms, no metaphors; "
                  "Unicode maths (², ⁻¹, √, π, ½, −, ×, °, θ), never LaTeX; for an assertion-reason item keep the form "
                  "'Assertion: ... Reason: ...'; if a figure is essential, describe it in words with every value on it so the "
                  "problem can be solved from the text. Never mention any book, author, page or example number. Return JSON only.")


def cmd_restate(a):
    tr = transcripts()
    for wid in select(a, "restate", sorted(tr)):
        t = tr[wid]
        parts = [{"text": RESTATE_PROMPT}, {"text": "ORIGINAL (transcribed):\n" + question_block(t)}]
        if t.get("kind") != "worked_example" and t.get("crop"):
            parts.append({"text": "The printed original (for the figure):"})
            parts.append(L.image_part(os.path.join(L.EVIDENCE, t["crop"])))
        r = L.gemini(parts, max_out=4000, json_schema=RESTATE_SCHEMA, temperature=0.7)
        j = L.json_of(r.get("content")) or {}
        if j.get("question_text"):
            j["question_text"] = L.latex_to_unicode(j["question_text"])
            for o in j.get("options") or []:
                o["text"] = L.latex_to_unicode(o.get("text", ""))
            j["figure_description"] = L.latex_to_unicode(j.get("figure_description", ""))
        row = {"id": wid, **j, "error": r.get("error"), "usage": r.get("usage"), "model": r.get("model"), "at": L.now()}
        L.jsonl_append(work_path("restate"), row)
        print("  %-13s %-70s fig_req %s" % (wid, (j.get("question_text") or "")[:70], j.get("figure_required")))


# ---------------------------------------------------------------- givens (both texts)
GIVENS_PROMPT = ("List the GIVEN DATA of this physics problem and the CONDITIONS it states. Reply with JSON only: "
                 "{\"givens\": [{\"quantity\": \"<what>\", \"value\": \"<number>\", \"unit\": \"<unit or ''>\"}], "
                 "\"conditions\": [\"<short phrase>\"], \"asked\": \"<what is asked, 5-10 words>\"}. "
                 "Quantities include every number in the statement, the options excluded. Conditions are phrases like "
                 "'starts from rest', 'constant acceleration', 'air resistance neglected', 'g = 10 m/s²'.\n\nPROBLEM:\n")


def extract_givens(text):
    r = L.deepseek([{"role": "user", "content": GIVENS_PROMPT + text}], thinking=False, json_mode=True, max_tokens=800)
    j = L.json_of(r.get("content")) or {}
    return {"givens": j.get("givens") or [], "conditions": j.get("conditions") or [], "asked": j.get("asked"), "error": r.get("error")}


def cmd_givens(a):
    tr = transcripts()
    rs = done_ids("restate")
    ids = [i for i in sorted(tr) if i in rs and rs[i].get("question_text")]
    def one(wid):
        t, rt = tr[wid], rs[wid]
        orig = t["question_text"] + ("\n" + figure_block(t) if figure_block(t) else "")
        rest = restatement_text(rt, with_options=False)
        go, gr = extract_givens(orig), extract_givens(rest)
        return ({"id": wid, "restatement_sha": restatement_sha(rt), "original": go, "restatement": gr, "at": L.now()},
                "  %-13s givens %d vs %d  conditions %d vs %d" % (wid, len(go["givens"]), len(gr["givens"]), len(go["conditions"]), len(gr["conditions"])))
    run_parallel(a, "givens", select(a, "givens", ids), one)


# ---------------------------------------------------------------- fidelity (crossed model on the restatement alone)
FID_PROMPT = ("Solve this Class 11 physics problem. " + SYLLABUS_CLAUSE + " Reply with JSON only: "
              "{\"final_option\": <1-4 or null>, \"final_value\": \"<result with unit; all parts of a multi-part answer>\", "
              "\"method\": \"<one line>\"}.\n\nPROBLEM:\n")


FID_SCHEMA = {"type": "OBJECT", "properties": {"final_option": {"type": "INTEGER", "nullable": True}, "final_value": {"type": "STRING"},
                                               "method": {"type": "STRING"}}, "required": ["final_option", "final_value", "method"]}


def cmd_fidelity(a):
    rs = done_ids("restate")
    ids = [i for i in sorted(rs) if rs[i].get("question_text")]
    role = "fidelity_gemini" if getattr(a, "model", "") == "gemini" else "fidelity"
    def one(wid):
        rt = rs[wid]
        text = restatement_text(rt)
        if role == "fidelity_gemini":
            r = L.gemini([{"text": FID_PROMPT + text}], max_out=8000, json_schema=FID_SCHEMA)
        else:
            r = L.deepseek([{"role": "user", "content": FID_PROMPT + text}], effort="high", json_mode=True, max_tokens=12000)
        j = L.json_of(r.get("content")) or {}
        return ({"id": wid, "restatement_sha": restatement_sha(rt), "final_option": j.get("final_option"),
                 "final_value": L.latex_to_unicode(j.get("final_value", "")), "method": j.get("method"),
                 "error": r.get("error"), "finish": r.get("finish"), "usage": r.get("usage"), "ms": r.get("ms"), "at": L.now()},
                "  %-13s opt %-4s %-40s %s" % (wid, j.get("final_option"), (j.get("final_value") or "")[:40], (r.get("error") or "")[:50]))
    run_parallel(a, role, select(a, role, ids), one)


# ---------------------------------------------------------------- examplekey: the printed final result of a worked example
EXKEY_PROMPT = ("Below is a textbook's printed worked solution to a physics problem. Extract ONLY the final result it reaches "
                "(value with unit, or an option letter, or a one-line statement; every part of a multi-part answer as "
                "'(a) ..., (b) ...'). Do not solve anything. Reply with JSON only: {\"final_value\": \"...\"}.\n\nPRINTED SOLUTION:\n")


def cmd_examplekey(a):
    tr = transcripts()
    ids = [i for i in sorted(tr) if tr[i].get("kind") == "worked_example" and tr[i].get("printed_solution")]
    for wid in select(a, "examplekey", ids):
        t = tr[wid]
        r = L.deepseek([{"role": "user", "content": EXKEY_PROMPT + "PROBLEM: " + t["question_text"] + "\n\n" + t["printed_solution"][:6000]}],
                       thinking=False, json_mode=True, max_tokens=300)
        j = L.json_of(r.get("content")) or {}
        L.jsonl_append(work_path("examplekey"), {"id": wid, "final_value": L.latex_to_unicode(j.get("final_value", "")), "error": r.get("error"), "at": L.now()})
        print("  %-13s %s" % (wid, (j.get("final_value") or "")[:70]))


# ---------------------------------------------------------------- chapter: the syllabus chapter tag (one book chapter spans two)
CHAPTER_PROMPT = ("Classify this kinematics problem into exactly one syllabus chapter: 'Motion in a Straight Line' (one-dimensional "
                  "motion, graphs of x-t / v-t / a-t, free fall, relative motion along a line) or 'Motion in a Plane' (vectors, "
                  "two-dimensional motion, relative velocity in a plane, river-boat, rain-man, circular motion). Reply with JSON only: "
                  "{\"chapter\": \"<one of the two>\", \"why\": \"<8 words>\"}.\n\nPROBLEM:\n")


def cmd_chapter(a):
    import chapters
    tr = transcripts()
    allowed = set(chapters.PHYSICS_1)
    for wid in select(a, "chapter", sorted(tr)):
        r = L.deepseek([{"role": "user", "content": CHAPTER_PROMPT + question_block(tr[wid])}], thinking=False, json_mode=True, max_tokens=120)
        j = L.json_of(r.get("content")) or {}
        ch = j.get("chapter") if j.get("chapter") in allowed else None
        L.jsonl_append(work_path("chapter"), {"id": wid, "chapter": ch, "why": j.get("why"), "error": r.get("error"), "at": L.now()})
        print("  %-13s %s" % (wid, ch))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("role", choices=["solveB", "syllabus", "restate", "givens", "fidelity", "examplekey", "chapter"])
    ap.add_argument("--model", default="")
    ap.add_argument("--only", nargs="*")
    ap.add_argument("--force", action="store_true")
    ap.add_argument("--limit", type=int)
    ap.add_argument("--workers", type=int, default=6)
    a = ap.parse_args()
    globals()["cmd_" + a.role](a)


if __name__ == "__main__":
    main()
