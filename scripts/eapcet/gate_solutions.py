"""The mechanical gate: what a solution must satisfy before any human reads it.

Whole-pool, every run, read-only over the solutions. It never edits a solution; it writes
sidecars. A gate that fixes what it finds becomes a second author, and then nothing is
checking the gate.

The one load-bearing check is the second: the option the author reached must be the official
key. The author never saw the key, so agreement is evidence and disagreement is a finding -
either the author slipped or the key is wrong, and the corpus already holds four wrong keys.

Every verdict records the sha of the content it judged. Edit a solution and its verdict is
stale by construction; the release build refuses a stale verdict.

    python scripts/eapcet/gate_solutions.py                      # gate everything, write sidecars
    python scripts/eapcet/gate_solutions.py --baseline           # also diff against the frozen run
    python scripts/eapcet/gate_solutions.py --freeze-baseline    # after the diff has been read
"""
import os, io, re, sys, json, hashlib, argparse, datetime, collections

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
sys.path.insert(0, HERE)
from check_transcripts import PLACEHOLDER          # the same phrases that hid holes in transcripts

POOL = os.path.join(ROOT, "eapcet", "pool", "physics_pool_v1.json")
SOL = os.path.join(ROOT, "eapcet", "solutions")
GATE = os.path.join(SOL, "_gate")
VIDI_CHECKS = os.path.join(ROOT, "src", "lib", "answerBook", "vidiChecks.ts")

SCHEMA = "eapcet_solution_v1"
REQUIRED = {"schema", "question_id", "approach", "steps", "final_answer", "confidence",
            "common_mistakes", "concept_tags", "difficulty", "mistake_type_hint", "authored_by"}
STEP_KEYS = {"text", "equation", "why_this_step"}
MISTAKE_KEYS = {"option", "text"}
LIMITS = {"approach": 30, "step_text": 60, "mistake": 35, "steps_min": 2, "steps_max": 8, "mistakes_max": 3}
DIFFICULTY = {"easy", "medium", "hard"}
MISTAKE_TYPES = {"concept", "calculation", "application"}

EXTRA_PLACEHOLDER = re.compile(r"assume the figure|cannot determine|not enough information|figure not|"
                               r"insufficient data|would need the figure", re.I)
MARKDOWN = [(re.compile(r"\*\*[^*]+\*\*"), "**bold**"), (re.compile(r"^\s{0,3}#{1,6}\s", re.M), "# heading"),
            (re.compile(r"^\s{0,3}[-*+]\s", re.M), "- bullet"), (re.compile(r"`"), "`code`"),
            (re.compile(r"\\(frac|sqrt|begin|times|cdot)"), "LaTeX")]
# Reported, never rejected: a broad register list that fires on real content trains you to
# skim the gate's output, and the next real defect goes past unread.
PERSONIFY = ["wants to", "the formula knows", "tries to", "the trick", "simply", "obviously", "of course"]
SUP = "⁰¹²³⁴⁵⁶⁷⁸⁹⁻⁺"
SUP_MAP = str.maketrans(SUP, "0123456789-+")


def load(p):
    return json.load(io.open(p, encoding="utf-8"))


def words(s):
    return len(re.findall(r"\S+", s or ""))


def idioms_from_ts():
    """The Rule 41 list lives in TypeScript. Read it at run time rather than copying it: a copy
    drifts, and a gate running an old list passes what the product's own checker rejects."""
    try:
        src = io.open(VIDI_CHECKS, encoding="utf-8").read()
    except OSError as e:
        sys.exit("cannot read %s (%s) - the gate will not run without the Rule 41 list" % (VIDI_CHECKS, e))
    m = re.search(r"export const IDIOMS\s*=\s*\[(.*?)\];", src, re.S)
    if not m:
        sys.exit("IDIOMS array not found in vidiChecks.ts - its shape changed; update the gate")
    items = [a or b for a, b in re.findall(r"'([^']*)'|\"([^\"]*)\"", m.group(1))]
    if len(items) < 5:
        sys.exit("IDIOMS parsed to %d items - refusing to run on a broken list" % len(items))
    return items


def idioms_in(text, idioms):
    low = (text or "").lower()
    return [i for i in idioms if re.search(r"\b" + re.escape(i) + r"\b", low)]


def norm_value(s):
    s = (s or "").strip().lower()
    s = s.replace("−", "-").replace("–", "-").replace("×", "x").replace("·", "x").replace("÷", "/")
    out, in_sup = [], False
    for ch in s:
        if ch in SUP:
            if not in_sup:
                out.append("^")
            out.append(ch.translate(SUP_MAP))
            in_sup = True
        else:
            out.append(ch)
            in_sup = False
    return re.sub(r"\s+", "", "".join(out))


NUM = re.compile(r"^[-+]?\d+(?:\.\d+)?(?:x10\^[-+]?\d+|e[-+]?\d+)?")


def num_of(s):
    m = NUM.match(s)
    if not m:
        return None
    t = m.group(0).replace("x10^", "e")
    try:
        return float(t)
    except ValueError:
        return None


def all_text(sol):
    parts = [sol.get("approach", "")]
    for st in sol.get("steps", []):
        if isinstance(st, dict):
            parts += [str(st.get("text", "")), str(st.get("equation", "")), str(st.get("why_this_step", ""))]
    for m in sol.get("common_mistakes", []):
        if isinstance(m, dict):
            parts.append(str(m.get("text", "")))
    return "\n".join(parts)


def content_sha(sol):
    body = {k: v for k, v in sol.items() if k != "authored_by"}
    return hashlib.sha256(json.dumps(body, sort_keys=True, ensure_ascii=False).encode("utf-8")).hexdigest()


def check(sol, q, idioms):
    """Return (reject_reason or None, detail, checks dict, warnings list)."""
    checks, warn = {}, []

    # 1. schema
    if not isinstance(sol, dict):
        return "not_an_object", "", checks, warn
    keys = set(sol)
    if sol.get("schema") != SCHEMA:
        return "wrong_schema", repr(sol.get("schema")), checks, warn
    if keys - REQUIRED:
        return "unknown_keys", ", ".join(sorted(keys - REQUIRED)), checks, warn
    if REQUIRED - keys:
        return "missing_keys", ", ".join(sorted(REQUIRED - keys)), checks, warn
    if sol["question_id"] != q["id"]:
        return "id_mismatch", "%s vs %s" % (sol["question_id"], q["id"]), checks, warn
    if sol.get("confidence") != "sure":
        return "not_sure", repr(sol.get("confidence")), checks, warn
    if words(sol["approach"]) > LIMITS["approach"] or not str(sol["approach"]).strip():
        return "approach_length", "%d words" % words(sol["approach"]), checks, warn
    steps = sol["steps"]
    if not isinstance(steps, list) or not (LIMITS["steps_min"] <= len(steps) <= LIMITS["steps_max"]):
        return "step_count", str(len(steps) if isinstance(steps, list) else "not a list"), checks, warn
    for i, st in enumerate(steps):
        if not isinstance(st, dict) or set(st) - STEP_KEYS or not str(st.get("text", "")).strip():
            return "bad_step", "step %d" % (i + 1), checks, warn
        if words(st["text"]) > LIMITS["step_text"]:
            return "step_length", "step %d: %d words" % (i + 1, words(st["text"])), checks, warn
    fa = sol["final_answer"]
    if not isinstance(fa, dict) or set(fa) != {"option", "value"} or fa["option"] not in (1, 2, 3, 4) \
            or not str(fa["value"]).strip():
        return "bad_final_answer", repr(fa)[:80], checks, warn
    cm = sol["common_mistakes"]
    if not isinstance(cm, list) or len(cm) > LIMITS["mistakes_max"]:
        return "mistakes_shape", "", checks, warn
    for m in cm:
        if not isinstance(m, dict) or set(m) - MISTAKE_KEYS or not str(m.get("text", "")).strip() \
                or (m.get("option") is not None and m["option"] not in (1, 2, 3, 4)):
            return "bad_mistake", repr(m)[:80], checks, warn
        if words(m["text"]) > LIMITS["mistake"]:
            return "mistake_length", "%d words" % words(m["text"]), checks, warn
    if not isinstance(sol["concept_tags"], list) or not all(isinstance(t, str) for t in sol["concept_tags"]):
        return "bad_tags", "", checks, warn
    if sol["difficulty"] not in DIFFICULTY or sol["mistake_type_hint"] not in MISTAKE_TYPES:
        return "bad_enum", "%s / %s" % (sol["difficulty"], sol["mistake_type_hint"]), checks, warn
    if not isinstance(sol["authored_by"], dict):
        return "bad_provenance", "", checks, warn
    checks["schema"] = True

    # 2. the key
    checks["key"] = fa["option"] == q["answer"]
    if not checks["key"]:
        return "key_miss", "author %d, key %d" % (fa["option"], q["answer"]), checks, warn

    # 3. the value against the option's own text
    nv, no = norm_value(str(fa["value"])), norm_value(str(q["options_en"][fa["option"] - 1]))
    a, b = num_of(nv), num_of(no)
    if nv == no or (a is not None and b is not None and abs(a - b) <= 0.01 * max(abs(b), 1e-12)):
        checks["value"] = True
    elif nv and (nv in no or no in nv):
        checks["value"] = True
        warn.append("value_partial: %r vs option %r" % (fa["value"], q["options_en"][fa["option"] - 1]))
    else:
        checks["value"] = False
        return "value_mismatch", "%r vs option %r" % (fa["value"], q["options_en"][fa["option"] - 1]), checks, warn

    # 4. the working arrives at the answer
    tail = norm_value(" ".join(str(st.get("text", "")) + " " + str(st.get("equation", "")) for st in steps[-2:]))
    key_bit = nv if a is None else NUM.match(nv).group(0)
    if key_bit and key_bit in tail:
        checks["ending"] = True
    elif a is not None:
        checks["ending"] = False
        return "ending_missing", "final number %r not in the last two steps" % key_bit, checks, warn
    else:
        checks["ending"] = True
        warn.append("ending_unverified: symbolic value %r not found in the last two steps" % fa["value"])

    # 5-7. prose
    text = all_text(sol)
    hit = PLACEHOLDER.search(text) or EXTRA_PLACEHOLDER.search(text)
    if hit:
        checks["placeholder"] = False
        return "placeholder", hit.group(0), checks, warn
    checks["placeholder"] = True
    for rx, name in MARKDOWN:
        if rx.search(text):
            checks["markdown"] = False
            return "markdown", name, checks, warn
    checks["markdown"] = True
    found = idioms_in(text, idioms)
    if found:
        checks["idioms"] = False
        return "idiom", ", ".join(found), checks, warn
    checks["idioms"] = True
    low = text.lower()
    for p in PERSONIFY:
        if re.search(r"\b" + re.escape(p) + r"\b", low):
            warn.append("register: %r" % p)
    return None, "", checks, warn


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--baseline", action="store_true")
    ap.add_argument("--freeze-baseline", action="store_true")
    ap.add_argument("--dir", default=None,
                    help="gate a different directory (the examples, a test set) instead of eapcet/solutions")
    a = ap.parse_args()
    global SOL, GATE
    if a.dir:
        SOL = a.dir if os.path.isabs(a.dir) else os.path.join(ROOT, a.dir)
        GATE = os.path.join(SOL, "_gate")

    pool = load(POOL)
    byid = {q["id"]: q for q in pool["questions"]}
    idioms = idioms_from_ts()
    os.makedirs(GATE, exist_ok=True)
    run_at = datetime.datetime.now().astimezone().isoformat(timespec="seconds")

    status, rejected = {}, []
    files = sorted(f for f in os.listdir(SOL) if f.endswith(".json") and not f.startswith("_")) if os.path.isdir(SOL) else []
    for f in files:
        qid = f[:-5]
        path = os.path.join(SOL, f)
        try:
            sol = load(path)
        except Exception as e:
            status[qid] = {"verdict": "reject", "reason": "unparseable", "detail": str(e)[:120], "gate_run": run_at}
            rejected.append({"id": qid, "reason": "unparseable", "detail": str(e)[:120]})
            continue
        q = byid.get(qid)
        if not q:
            status[qid] = {"verdict": "reject", "reason": "not_in_pool", "detail": "", "gate_run": run_at}
            rejected.append({"id": qid, "reason": "not_in_pool", "detail": ""})
            continue
        reason, detail, checks, warn = check(sol, q, idioms)
        row = {"verdict": "reject" if reason else "pass", "answer_matches_key": bool(checks.get("key")),
               "content_sha": content_sha(sol) if isinstance(sol, dict) else None,
               "checks": checks, "warnings": warn, "chapter_key": q["chapter_key"], "gate_run": run_at}
        if reason:
            row["reason"], row["detail"] = reason, detail
            rejected.append({"id": qid, "reason": reason, "detail": detail})
        status[qid] = row

    refusals = {f[:-5] for f in os.listdir(os.path.join(SOL, "_refusals"))} if os.path.isdir(os.path.join(SOL, "_refusals")) else set()

    # per-chapter table
    print("%-40s %4s %4s %4s %4s %4s %4s  %s" % ("chapter", "pool", "auth", "pass", "rej", "refu", "miss", "reject reasons"))
    tot = collections.Counter()
    for c in pool["chapters"]:
        ids = c["question_ids"]
        auth = [i for i in ids if i in status]
        ok = [i for i in auth if status[i]["verdict"] == "pass"]
        rej = [i for i in auth if status[i]["verdict"] == "reject"]
        refu = [i for i in ids if i in refusals and i not in status]
        miss = [i for i in ids if i not in status and i not in refusals]
        reasons = collections.Counter(status[i]["reason"] for i in rej)
        tot.update(pool=len(ids), auth=len(auth), ok=len(ok), rej=len(rej), refu=len(refu), miss=len(miss))
        if auth or refu:
            print("%-40s %4d %4d %4d %4d %4d %4d  %s" % (c["name"][:40], len(ids), len(auth), len(ok), len(rej),
                                                         len(refu), len(miss),
                                                         " ".join("%s=%d" % kv for kv in sorted(reasons.items()))))
    print("%-40s %4d %4d %4d %4d %4d %4d" % ("TOTAL", tot["pool"], tot["auth"], tot["ok"], tot["rej"], tot["refu"], tot["miss"]))
    warned = sum(1 for r in status.values() if r.get("warnings"))
    if warned:
        print("warnings on %d solutions (see _gate/status.json)" % warned)

    if a.baseline:
        base_path = os.path.join(GATE, "baseline.json")
        if os.path.exists(base_path):
            base = load(base_path)
            new_pass = sorted(i for i, r in status.items() if r["verdict"] == "pass" and base.get(i, {}).get("verdict") != "pass")
            new_rej = sorted(i for i, r in status.items() if r["verdict"] == "reject" and base.get(i, {}).get("verdict") == "pass")
            flipped = sorted(i for i, r in status.items() if i in base and base[i].get("content_sha") == r.get("content_sha")
                             and base[i].get("verdict") != r["verdict"])
            print("")
            print("vs baseline: newly passing %d, newly rejected %d, verdict changed on UNCHANGED content %d"
                  % (len(new_pass), len(new_rej), len(flipped)))
            if flipped:
                print("  A verdict moved without the content moving. The gate changed, not the solution. Read these:")
                for i in flipped:
                    print("   ", i, base[i].get("verdict"), "->", status[i]["verdict"])
        else:
            print("no baseline yet - run with --freeze-baseline after reading this output")

    io.open(os.path.join(GATE, "status.json"), "w", encoding="utf-8").write(json.dumps(status, indent=1, ensure_ascii=False))
    io.open(os.path.join(GATE, "_rejected.json"), "w", encoding="utf-8").write(json.dumps(rejected, indent=1, ensure_ascii=False))
    if a.freeze_baseline:
        io.open(os.path.join(GATE, "baseline.json"), "w", encoding="utf-8").write(json.dumps(status, indent=1, ensure_ascii=False))
        print("baseline frozen")


if __name__ == "__main__":
    main()
