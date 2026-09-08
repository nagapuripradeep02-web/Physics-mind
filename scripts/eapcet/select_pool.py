"""Select the V1 physics pool: which corpus questions may face a student, chapter by chapter.

A pure function of the bank file. Nothing here is random, and the bank's sha256 is recorded in
the output, so a rebuilt bank is visible and a rerun on the same bank is byte-identical.

Agents never receive this file. It carries the official answer, and an author who can see the
answer is not an independent reader of it. Authors get slices cut by dispatch.py.

What it decides, in order:
  1. Exclusions. A question the key cannot vouch for, or that we cannot show whole, is out:
     the four rows where the physics disputes the official key, the rows where the two readings
     of the green tick disagreed or a human had to adjudicate, anything not transcribed at high
     confidence, and every question whose figure carries information the text does not (the
     crops carry the exam's own green tick and red crosses, so a figure cannot be shown as-is).
  2. Twins. The forenoon and afternoon shifts of one day draw from one pool, so the same
     question appears twice in the bank. Near-identical text collapses to one row, forenoon
     first, earlier year first; the dropped ids are kept on the survivor as twin_of.
  3. Recurrence. How many questions on OTHER dates in the same chapter share this one's shape
     (same text with the numbers changed). A tiebreaker for selection, never a filter: a shape
     the exam re-asks is worth a solution more than one it asked once.
  4. Selection. Per chapter, sort by recurrence then id, then round-robin across the five years
     so a pool is never all one year, until the target is met.
  5. Siblings. For each pooled question, the six most similar-shaped questions in its own pool,
     so a student who misses one can be handed another of the same kind.

    python scripts/eapcet/select_pool.py                       # defaults
    python scripts/eapcet/select_pool.py --target 25           # grow the pools later
"""
import os, io, re, sys, json, hashlib, argparse, collections, datetime

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from chapters import PHYSICS_1, PHYSICS_2

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))

SELECTOR_VERSION = 1
TWIN_J = 0.85      # literal near-identity, digits kept
RECUR_J = 0.50     # same shape, digits masked
SIBLINGS = 6
SHIFTS = 26
YEARS = [2021, 2022, 2023, 2024, 2025]
MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August",
          "September", "October", "November", "December"]


def load(p):
    return json.load(io.open(p, encoding="utf-8"))


def sha256_of(p):
    h = hashlib.sha256()
    with open(p, "rb") as f:
        for chunk in iter(lambda: f.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def norm(s, mask_digits=False):
    s = " ".join((s or "").lower().split())
    if mask_digits:
        s = "".join("#" if c.isdigit() else c for c in s)
    return s


def grams(s, n=3):
    return {s[i:i + n] for i in range(len(s) - n + 1)}


def jac(a, b):
    if not a or not b:
        return 0.0
    i = len(a & b)
    return i / float(len(a) + len(b) - i)


def session_of(row):
    pid = row.get("paper_id") or ""
    if pid.endswith("_fn"):
        return "FN"
    if pid.endswith("_an"):
        return "AN"
    s = str(row.get("session") or "").upper()
    return "FN" if s.startswith("F") else "AN" if s.startswith("A") else "?"


def date_of(row):
    d = str(row.get("date") or "")
    if re.match(r"^\d{4}-\d{2}-\d{2}$", d):
        return d
    m = re.search(r"_(\d{4})(\d{2})(\d{2})_", row.get("paper_id") or "")
    if m:
        return "%s-%s-%s" % m.groups()
    return d


def asked_label(row):
    d = date_of(row)
    try:
        y, mo, da = d.split("-")
        when = "%d %s" % (int(da), MONTHS[int(mo) - 1])
    except Exception:
        y, when = str(row.get("year")), d
    sess = "morning" if session_of(row) == "FN" else "afternoon"
    return "TG EAPCET %s, %s, %s, Q%s" % (y, when, sess, row.get("q_no"))


def answer_book_units():
    """(subject, number) -> name from the Answer Book manifest. The worktree is a full checkout
    of the repository, so the manifest sits beside the corpus."""
    u = load(os.path.join(ROOT, "answer-book", "units.json"))
    units = u if isinstance(u, list) else u.get("units", u)
    out = {}
    for x in units:
        out[(x.get("subject") or "physics", int(x["number"]))] = x["name"]
    return out


def chapter_plan():
    """The 30 chapters in syllabus order, each mapped to its Answer Book unit and checked by name."""
    ab = answer_book_units()
    plan, bad = [], []
    for i, name in enumerate(PHYSICS_1, 1):
        unit = ("physics", i)
        plan.append(dict(key="p1-%02d" % i, name=name, paper="first_year", order=i,
                         answer_book_unit={"subject": unit[0], "number": unit[1]}))
        if ab.get(unit, "").strip().casefold() != name.strip().casefold():
            bad.append((name, unit, ab.get(unit)))
    for j, name in enumerate(PHYSICS_2, 1):
        unit = ("physics_2", j)
        plan.append(dict(key="p2-%02d" % j, name=name, paper="second_year", order=j,
                         answer_book_unit={"subject": unit[0], "number": unit[1]}))
        if ab.get(unit, "").strip().casefold() != name.strip().casefold():
            bad.append((name, unit, ab.get(unit)))
    if bad:
        print("CHAPTER / ANSWER BOOK UNIT MISMATCH - refusing to build a pool on a wrong map:")
        for name, unit, got in bad:
            print("  corpus %r  ->  %s unit %d is %r" % (name, unit[0], unit[1], got))
        sys.exit(1)
    return plan


def exclusion_reason(q):
    if q.get("key_disputed_by_working"):
        return "key_disputed"
    if q.get("answer_disputed"):
        return "answer_disputed"
    if q.get("adjudication"):
        return "adjudicated"
    if q.get("transcription_confidence") != "high":
        return "not_high"
    if q.get("needs_figure"):
        return "needs_figure"
    if q.get("answer") not in (1, 2, 3, 4):
        return "bad_answer"
    opts = q.get("options_en")
    if not isinstance(opts, list) or len(opts) != 4 or any(not str(o).strip() for o in opts):
        return "bad_options"
    if not str(q.get("question_en") or "").strip():
        return "empty_stem"
    return None


def collapse_twins(rows):
    """Union near-identical rows; keep one per cluster; return (kept rows, dropped count)."""
    lit = [grams(norm(r["question_en"] + " || " + " | ".join(r["options_en"]))) for r in rows]
    parent = list(range(len(rows)))

    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x

    for i in range(len(rows)):
        gi = lit[i]
        for j in range(i + 1, len(rows)):
            if jac(gi, lit[j]) >= TWIN_J:
                a, b = find(i), find(j)
                if a != b:
                    parent[a] = b
    clusters = collections.defaultdict(list)
    for i in range(len(rows)):
        clusters[find(i)].append(i)
    kept, dropped = [], 0
    for members in clusters.values():
        members.sort(key=lambda k: (rows[k]["year"], 0 if session_of(rows[k]) == "FN" else 1,
                                    rows[k]["q_no"], rows[k]["id"]))
        head = rows[members[0]]
        head["twin_of"] = [rows[k]["id"] for k in members[1:]]
        dropped += len(members) - 1
        kept.append(head)
    return kept, dropped


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--bank", default=os.path.join("eapcet", "bank", "physics_v1.json"))
    ap.add_argument("--target", type=int, default=15)
    ap.add_argument("--out", default=os.path.join("eapcet", "pool", "physics_pool_v1.json"))
    a = ap.parse_args()

    bank_path = a.bank if os.path.isabs(a.bank) else os.path.join(ROOT, a.bank)
    out_path = a.out if os.path.isabs(a.out) else os.path.join(ROOT, a.out)
    bank = load(bank_path)
    rows_all = bank["questions"]
    plan = chapter_plan()
    by_name = {c["name"]: c for c in plan}

    asked_total = collections.Counter(q.get("chapter") for q in rows_all)
    unknown = sorted(set(asked_total) - set(by_name))
    if unknown:
        print("bank rows carry chapters not in the taxonomy:", unknown)
        sys.exit(1)

    # 1. Exclusions
    eligible, excluded = [], collections.defaultdict(collections.Counter)
    for q in rows_all:
        why = exclusion_reason(q)
        if why:
            excluded[q["chapter"]][why] += 1
        else:
            eligible.append(dict(q))
    eligible_by_ch = collections.Counter(q["chapter"] for q in eligible)

    # 2. Twins
    kept, twins = collapse_twins(eligible)
    for q in kept:
        pass
    twin_by_ch = collections.Counter()
    for q in kept:
        twin_by_ch[q["chapter"]] += len(q["twin_of"])
    for ch, n in twin_by_ch.items():
        excluded[ch]["twins"] += n

    # 3. Recurrence, per chapter, digits masked, other dates only
    by_ch = collections.defaultdict(list)
    for q in kept:
        q["_masked"] = grams(norm(q["question_en"], mask_digits=True))
        by_ch[q["chapter"]].append(q)
    for ch, qs in by_ch.items():
        for q in qs:
            d = date_of(q)
            q["recurrence"] = sum(1 for o in qs if date_of(o) != d and jac(q["_masked"], o["_masked"]) >= RECUR_J)

    # 4. Selection: recurrence, then round-robin over years
    chapters_out, questions_out, siblings_out = [], {}, {}
    print("%-46s %5s %5s %5s %5s %4s %-15s %s" % ("chapter", "asked", "share", "elig", "twin", "pool", "years", "excluded"))
    for c in plan:
        qs = sorted(by_ch.get(c["name"], []), key=lambda q: (-q["recurrence"], q["id"]))
        queues = {y: [q for q in qs if q["year"] == y] for y in YEARS}
        pool = []
        while len(pool) < a.target and any(queues.values()):
            for y in YEARS:
                if queues[y] and len(pool) < a.target:
                    pool.append(queues[y].pop(0))
        # 5. Siblings within the pool
        for q in pool:
            others = [o for o in pool if o is not q]
            others.sort(key=lambda o: (-jac(q["_masked"], o["_masked"]), -o["year"], o["id"]))
            siblings_out[q["id"]] = [o["id"] for o in others[:SIBLINGS]]
            questions_out[q["id"]] = {
                "id": q["id"], "chapter_key": c["key"], "chapter": c["name"],
                "year": q["year"], "date": date_of(q), "session": session_of(q), "q_no": q["q_no"],
                "asked_label": asked_label(q),
                "question_en": q["question_en"], "options_en": q["options_en"],
                "answer": q["answer"], "answer_source": q.get("answer_source", "official_key_pdf"),
                "twin_of": q["twin_of"], "recurrence": q["recurrence"],
                "grounding": {"answer_book_cards": [], "concept_tags": []},
            }
        n_asked = asked_total.get(c["name"], 0)
        years = "".join(str(y)[-1] for y in YEARS if any(q["year"] == y for q in pool))
        ex = dict(excluded.get(c["name"], {}))
        chapters_out.append(dict(
            c, asked_total=n_asked,
            share_pct=round(100.0 * n_asked / len(rows_all), 1),
            per_exam=round(n_asked / float(SHIFTS), 1),
            eligible=eligible_by_ch.get(c["name"], 0),
            selected=len(pool),
            excluded=ex,
            question_ids=[q["id"] for q in pool],
            diagnostic_ready=False))
        print("%-46s %5d %4.1f%% %5d %5d %4d %-15s %s"
              % (c["name"][:46], n_asked, 100.0 * n_asked / len(rows_all),
                 eligible_by_ch.get(c["name"], 0), twin_by_ch.get(c["name"], 0), len(pool),
                 "2021-5:" + (years or "-"),
                 " ".join("%s=%d" % kv for kv in sorted(ex.items()) if kv[0] != "twins")))

    out = {
        "schema": "eapcet_physics_pool_v1",
        "built_from": {"bank": os.path.relpath(bank_path, ROOT).replace(os.sep, "/"),
                       "bank_sha256": sha256_of(bank_path), "bank_rows": len(rows_all),
                       "selector_version": SELECTOR_VERSION,
                       "built_at": datetime.datetime.now().astimezone().isoformat(timespec="seconds")},
        "exam": {"shifts": SHIFTS, "physics_per_shift": 40},
        "rules": {"exclude": ["key_disputed_by_working", "answer_disputed", "adjudication",
                              "transcription_confidence != high", "needs_figure", "bad answer",
                              "bad or empty option", "empty stem"],
                  "twin_jaccard": TWIN_J, "recurrence_jaccard_digits_masked": RECUR_J,
                  "target_per_chapter": a.target, "siblings": SIBLINGS},
        "chapters": chapters_out,
        "questions": [questions_out[i] for c in chapters_out for i in c["question_ids"]],
        "siblings": siblings_out,
    }
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    io.open(out_path, "w", encoding="utf-8").write(json.dumps(out, indent=1, ensure_ascii=False))

    total_pool = sum(c["selected"] for c in chapters_out)
    full = sum(1 for c in chapters_out if c["selected"] >= a.target)
    print("")
    print("bank rows %d -> eligible %d -> after twins %d -> pooled %d across %d chapters (%d at target %d)"
          % (len(rows_all), len(eligible), len(kept), total_pool, len(chapters_out), full, a.target))
    print("wrote", os.path.relpath(out_path, ROOT))


if __name__ == "__main__":
    main()
