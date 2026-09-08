"""The founder's 10% spot-check: a printed sheet to tick, and a strict reader of the ticks.

Gate and audit are both machines or agents. This is the one human look, on a sample the human
did not choose. The sheet shows everything the student will see plus the key and the audit's
findings, and one line to tick per item. Ingest refuses a sheet with any item unticked; a fail
pulls the item and asks for a resample of that chapter; a second fail in the same chapter blocks
the chapter until every audit-ok solution in it is re-audited by a different agent.

    python scripts/eapcet/spot_check.py --wave 1              # writes eapcet/solutions/_spot/wave_01.md
    python scripts/eapcet/spot_check.py --ingest --wave 1     # reads the ticks into _spot/status.json
"""
import os, io, re, sys, json, math, glob, random, hashlib, argparse, datetime, collections

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from gate_solutions import POOL, SOL, GATE

AUDIT = os.path.join(SOL, "_audit")
SPOT = os.path.join(SOL, "_spot")
LEDGER = os.path.join(SOL, "_dispatch.json")
OK_VERDICTS = ("ok", "weak")
TICK = re.compile(r"^VERDICT:\s*\[(?P<p>[ xX])\]\s*pass\s*\[(?P<f>[ xX])\]\s*fail\s*NOTE:(?P<note>.*)$")
HEAD = re.compile(r"^## (?P<n>\d+)\. (?P<id>tg_eapcet_\S+)\s+sha=(?P<sha>[0-9a-f]{8})")


def load(p, default=None):
    if not os.path.exists(p):
        return default
    return json.load(io.open(p, encoding="utf-8"))


def save(p, obj):
    os.makedirs(os.path.dirname(p), exist_ok=True)
    io.open(p, "w", encoding="utf-8").write(json.dumps(obj, indent=1, ensure_ascii=False))


def now():
    return datetime.datetime.now().astimezone().isoformat(timespec="seconds")


def audit_at(qid, sha):
    return load(os.path.join(AUDIT, "%s.%s.json" % (qid, sha[:8])))


def wave_ids(wave):
    ids = set()
    for r in load(LEDGER, []):
        if r["wave"] == wave and r["role"] == "author":
            ids.update(r["question_ids"])
    return ids


def eligible(wave, byid, status, spot):
    """Gate pass + audit ok/weak at the same sha + not already spot-checked at that sha."""
    out = collections.defaultdict(list)
    for qid in sorted(wave_ids(wave)):
        st = status.get(qid)
        if not st or st["verdict"] != "pass":
            continue
        au = audit_at(qid, st["content_sha"])
        if not au or au.get("verdict") not in OK_VERDICTS:
            continue
        done = spot["items"].get(qid)
        if done and done["sha"] == st["content_sha"]:
            continue
        out[byid[qid]["chapter_key"]].append((qid, st["content_sha"], au))
    return out


def render(n, q, sol, sha, au):
    L = ["## %d. %s  sha=%s" % (n, q["id"], sha[:8]), "", "**%s** — %s" % (q["asked_label"], q["chapter"]), "",
         q["question_en"], ""]
    for i, o in enumerate(q["options_en"], 1):
        L.append("%s (%d) %s" % ("**KEY**" if i == q["answer"] else "     ", i, o))
    L += ["", "**Approach:** " + sol["approach"], ""]
    for k, st in enumerate(sol["steps"], 1):
        L.append("%d. %s" % (k, st["text"]))
        if st.get("equation"):
            L.append("       %s" % st["equation"])
        if st.get("why_this_step"):
            L.append("       why: %s" % st["why_this_step"])
    L += ["", "**Final:** option %d — %s" % (sol["final_answer"]["option"], sol["final_answer"]["value"])]
    for m in sol.get("common_mistakes", []):
        L.append("- mistake%s: %s" % (" (option %d)" % m["option"] if m.get("option") else "", m["text"]))
    L += ["", "audit: verdict **%s**, auditor picked option %s (%s)" % (au["verdict"], au.get("auditor_option"),
                                                                      au.get("audited_by", {}).get("agent"))]
    for f in au.get("findings", []):
        L.append("- %s @ %s: \"%s\" — %s" % (f["grade"].upper(), f["field"], f.get("quote", ""), f.get("note", "")))
    L += ["", "VERDICT: [ ] pass [ ] fail NOTE:", "", "---", ""]
    return L


def write_sheet(wave):
    pool = load(POOL) or sys.exit("no pool")
    byid = {q["id"]: q for q in pool["questions"]}
    bych = {c["key"]: c for c in pool["chapters"]}
    status = load(os.path.join(GATE, "status.json"), {})
    spot = load(os.path.join(SPOT, "status.json"), {"items": {}, "blocked_chapters": {}})
    el = eligible(wave, byid, status, spot)
    if not el:
        sys.exit("nothing eligible in wave %d: needs gate pass + audit ok/weak at the same sha" % wave)
    os.makedirs(SPOT, exist_ok=True)
    path = os.path.join(SPOT, "wave_%02d.md" % wave)
    if os.path.exists(path):
        sys.exit("%s exists - ingest it or delete it before writing a new sheet" % path)
    L = ["# Spot check — wave %d" % wave, "",
         "Tick ONE box per item: `[x] pass` or `[x] fail`, and write a NOTE on every fail. "
         "Then `python scripts/eapcet/spot_check.py --ingest --wave %d`." % wave, "",
         "pass = a student who copies this solution into the exam gets the mark, and every line and "
         "every mistake entry is true for this question. Anything less is a fail.", ""]
    n, per = 0, []
    for ck, items in sorted(el.items()):
        k = max(2, int(math.ceil(0.1 * len(items))))
        rnd = random.Random(hashlib.sha256(("spot%d%s%s" % (wave, ck, "|".join(i for i, _, _ in items))).encode()).hexdigest())
        pick = rnd.sample(items, min(k, len(items)))
        per.append((bych[ck]["name"], len(items), len(pick)))
        for qid, sha, au in sorted(pick):
            n += 1
            L += render(n, byid[qid], load(os.path.join(SOL, qid + ".json")), sha, au)
    io.open(path, "w", encoding="utf-8").write("\n".join(L))
    print("wrote %s: %d items" % (os.path.relpath(path, os.path.dirname(os.path.dirname(HERE))), n))
    for name, tot, k in per:
        print("  %-40s %2d eligible -> %d on the sheet" % (name[:40], tot, k))


def ingest(wave):
    pool = load(POOL) or sys.exit("no pool")
    byid = {q["id"]: q for q in pool["questions"]}
    path = os.path.join(SPOT, "wave_%02d.md" % wave)
    text = io.open(path, encoding="utf-8").read().splitlines() if os.path.exists(path) else sys.exit("no sheet " + path)
    spot = load(os.path.join(SPOT, "status.json"), {"items": {}, "blocked_chapters": {}})
    cur, results, bad = None, [], []
    for line in text:
        h = HEAD.match(line)
        if h:
            cur = (h.group("id"), h.group("sha"))
            continue
        t = TICK.match(line.strip())
        if t and cur:
            p, f = t.group("p").strip() != "", t.group("f").strip() != ""
            if p == f:
                bad.append("%s: tick exactly one box" % cur[0])
            elif f and not t.group("note").strip():
                bad.append("%s: a fail needs a NOTE" % cur[0])
            else:
                results.append((cur[0], cur[1], "fail" if f else "pass", t.group("note").strip()))
            cur = None
    if cur:
        bad.append("%s: no VERDICT line" % cur[0])
    if bad:
        sys.exit("sheet not ingested:\n  " + "\n  ".join(bad))
    if not results:
        sys.exit("no items found in the sheet")
    fails_by_ch = collections.Counter()
    for qid, sha8, v, note in results:
        spot["items"][qid] = {"sha": sha8, "verdict": v, "note": note or None, "wave": wave, "at": now()}
    for qid, rec in spot["items"].items():
        if rec["verdict"] == "fail":
            fails_by_ch[byid[qid]["chapter_key"]] += 1
    for ck, n in fails_by_ch.items():
        if n >= 2 and ck not in spot["blocked_chapters"]:
            spot["blocked_chapters"][ck] = "two spot-check fails; re-audit every audit-ok solution with a different agent, then delete this entry"
    save(os.path.join(SPOT, "status.json"), spot)
    passed = sum(1 for r in results if r[2] == "pass")
    print("ingested %d items: %d pass, %d fail" % (len(results), passed, len(results) - passed))
    for qid, sha8, v, note in results:
        if v == "fail":
            print("  FAIL %s (%s): %s" % (qid, byid[qid]["chapter_key"], note))
            print("       -> pulled from release; resample: delete the sheet and re-run --wave %d after re-authoring" % wave)
    for ck, why in spot["blocked_chapters"].items():
        print("  BLOCKED %s: %s" % (ck, why))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--wave", type=int, required=True)
    ap.add_argument("--ingest", action="store_true")
    a = ap.parse_args()
    ingest(a.wave) if a.ingest else write_sheet(a.wave)


if __name__ == "__main__":
    main()
