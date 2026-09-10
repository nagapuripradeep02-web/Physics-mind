"""Precompute the concept grounding for every pooled question: which Answer Book cards explain it.

The 30 EAPCET physics chapters are the 30 Answer Book physics units, same names, same order,
so "explain the concept behind this question" can lean on ~700 authored, audited cards with no
new taxonomy. This script picks, for each pooled question, the two cards of its own unit whose
text is most like the question. It runs once; the product never searches at runtime.

What it does well: chapters where the exam asks definitional or single-formula questions, and
units with many cards. What it does badly: a multi-step numerical MCQ rarely shares words with a
board VSAQ, so the unit restriction is doing most of the work and the ranking mostly finds the
card that names the same formula. Thin units (Communication 8 cards, Wave Optics 10) will
surface the same two cards for many questions. `weak_match` says so, per question, and an
optional anchors file lets the founder name 2-3 cards per chapter to use in that case.

    python scripts/eapcet/ground_pool.py [--anchors eapcet/pool/chapter_anchors.json]
"""
import os, io, re, sys, json, glob, argparse, collections, statistics

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
POOL = os.path.join(ROOT, "eapcet", "pool", "physics_pool_v1.json")
SOL = os.path.join(ROOT, "eapcet", "solutions")
CARDS = os.path.join(ROOT, "answer-book", "questions")
SHAPES = os.path.join(ROOT, "eapcet", "pool", "shapes.json")
TOP = 2
WEAK = 0.12


def load(p):
    return json.load(io.open(p, encoding="utf-8"))


def norm(s):
    s = " ".join((s or "").lower().split())
    return "".join("#" if c.isdigit() else c for c in s)


def grams(s, n=3):
    return {s[i:i + n] for i in range(len(s) - n + 1)}


def jac(a, b):
    if not a or not b:
        return 0.0
    i = len(a & b)
    return i / float(len(a) + len(b) - i)


def line_text(line):
    if isinstance(line, str):
        return line
    if isinstance(line, dict):
        return str(line.get("text") or line.get("katex") or "")
    return ""


def card_text(card):
    parts = [card.get("question_text", "")]
    for st in (card.get("answer") or {}).get("steps", []):
        parts.append(st.get("label", ""))
        parts += [line_text(l) for l in st.get("lines", [])]
        parts.append(st.get("why", ""))
    return " ".join(p for p in parts if p)


def load_cards():
    by_unit = collections.defaultdict(list)
    for f in glob.glob(os.path.join(CARDS, "*.json")):
        c = load(f)
        if c.get("subject") not in ("physics", "physics_2") or c.get("status") == "retired":
            continue
        unit = c.get("unit") or {}
        by_unit[(c["subject"], int(unit.get("number", 0)))].append(
            {"id": c["question_id"], "grams": grams(norm(card_text(c)))})
    return by_unit


def query_text(q):
    t = q["question_en"]
    sp = os.path.join(SOL, q["id"] + ".json")
    if os.path.exists(sp):
        try:
            s = load(sp)
            t += " " + s.get("approach", "") + " " + " ".join(s.get("concept_tags", []))
        except Exception:
            pass
    return t


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--anchors", default=None)
    a = ap.parse_args()
    anchors = load(a.anchors if os.path.isabs(a.anchors) else os.path.join(ROOT, a.anchors)) if a.anchors else {}

    pool = load(POOL)
    bych = {c["key"]: c for c in pool["chapters"]}
    cards = load_cards()
    # shape-first: a question whose shape names its cards (shapes.json `cards`) is grounded
    # by the shape — the two or three cards a teacher would open — and the trigram picks only
    # fill the list when the shape has fewer than TOP
    shapes = load(SHAPES) if os.path.exists(SHAPES) else {}
    shape_cards = {}
    for ck, entry in (shapes or {}).items():
        by_key = {s["key"]: s.get("cards") or [] for s in entry.get("shapes", [])}
        for qid, k in (entry.get("assignments") or {}).items():
            if by_key.get(k):
                shape_cards[qid] = (k, by_key[k])
    by_shape = 0

    per = collections.defaultdict(list)
    for q in pool["questions"]:
        c = bych[q["chapter_key"]]
        unit = (c["answer_book_unit"]["subject"], c["answer_book_unit"]["number"])
        cands = cards.get(unit, [])
        g = grams(norm(query_text(q)))
        scored = sorted(((jac(g, k["grams"]), k["id"]) for k in cands), key=lambda t: (-t[0], t[1]))
        best = scored[0][0] if scored else 0.0
        weak = best < WEAK
        picks = [{"question_id": i, "score": round(s, 3)} for s, i in scored[:TOP]]
        if weak and anchors.get(q["chapter_key"]):
            picks = [{"question_id": i, "score": None, "anchor": True} for i in anchors[q["chapter_key"]][:3]]
        if q["id"] in shape_cards:
            k, ids = shape_cards[q["id"]]
            picks = [{"question_id": i, "score": None, "shape": k} for i in ids]
            for s, i in scored:
                if len(picks) >= TOP:
                    break
                if i not in ids:
                    picks.append({"question_id": i, "score": round(s, 3)})
            weak = False
            by_shape += 1
        q["grounding"]["answer_book_cards"] = picks
        q["grounding"]["weak_match"] = weak
        q["grounding"]["unit_cards"] = len(cands)
        per[q["chapter_key"]].append(best)

    print("%-40s %5s %6s %5s" % ("chapter", "cards", "median", "weak"))
    for c in pool["chapters"]:
        b = per.get(c["key"], [])
        unit = (c["answer_book_unit"]["subject"], c["answer_book_unit"]["number"])
        if b:
            print("%-40s %5d %6.3f %5d" % (c["name"][:40], len(cards.get(unit, [])),
                                           statistics.median(b), sum(1 for x in b if x < WEAK)))
    io.open(POOL, "w", encoding="utf-8").write(json.dumps(pool, indent=1, ensure_ascii=False))
    total = sum(len(v) for v in per.values())
    weak = sum(1 for v in per.values() for x in v if x < WEAK)
    print("")
    print("grounded %d questions; weak_match on %d (%.0f%%); %d grounded by shape; pool rewritten" % (total, weak, 100.0 * weak / max(1, total), by_shape))


if __name__ == "__main__":
    main()
