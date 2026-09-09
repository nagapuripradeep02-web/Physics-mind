"""The shapes input for one chapter: the kept bank, clustered, for an agent to name.

Shapes cannot be derived. Measured on the release, trigram similarity leaves 122 of 146 pooled
questions as singletons at the recurrence threshold, because the pool was selected to take the
most-recurring question of each shape and no other. So a shape is authored: an agent reads the
chapter's WHOLE kept bank (every question the exam asked that the key can vouch for, twins
collapsed - 30 to 50 questions, not the 15-pool), sees which stems the machine already groups,
and writes 5 to 12 shapes with a student-facing label each, assigning every pool question.

This script only prepares that reading. It never writes shapes.json.

    python scripts/eapcet/propose_shapes.py --chapter p1-02
        # prints the clusters and singletons; writes eapcet/pool/_shapes_input/p1-02.json
    python scripts/eapcet/propose_shapes.py --accept p1-02
        # after the founder has read the labels: copies eapcet/pool/_shapes_proposed/p1-02.json
        # into eapcet/pool/shapes.json under its key; build_release.py gates it

The input file carries no answer. A shape author names what is asked, and an author who has
seen the key is one more reader who is not independent of it.
"""
import os, io, sys, json, argparse, collections

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
sys.path.insert(0, HERE)
from select_pool import (load, norm, grams, jac, RECUR_J, date_of, session_of, chapter_plan,
                         exclusion_reason, collapse_twins, sha256_of)

POOL = os.path.join(ROOT, "eapcet", "pool", "physics_pool_v1.json")
BANK = os.path.join(ROOT, "eapcet", "bank", "physics_v1.json")
SHAPES = os.path.join(ROOT, "eapcet", "pool", "shapes.json")
INPUT_DIR = os.path.join(ROOT, "eapcet", "pool", "_shapes_input")
PROPOSED_DIR = os.path.join(ROOT, "eapcet", "pool", "_shapes_proposed")


def view(q, pool_ids):
    """What the shapes agent may see of a bank row: the stem and the options, never the key,
    never the adjudication notes."""
    return {"id": q["id"], "year": q["year"], "date": date_of(q), "session": session_of(q),
            "in_pool": q["id"] in pool_ids, "twin_of": q.get("twin_of", []),
            "question_en": q["question_en"], "options_en": q["options_en"]}


def kept_bank(bank):
    """The same reading select_pool.py makes: exclusions, then twins collapsed over the whole
    bank, so the chapter's kept rows are exactly the rows the pool was chosen from."""
    eligible = [dict(q) for q in bank["questions"] if not exclusion_reason(q)]
    kept, _ = collapse_twins(eligible)
    return kept


def cluster(rows, threshold):
    """Union-find at the recurrence threshold over digit-masked trigrams of the stem: the
    machine's reading of 'same question with the numbers changed'. Returns (clusters, singletons),
    clusters largest first, members and singletons in year-then-id order."""
    masked = [grams(norm(r["question_en"], mask_digits=True)) for r in rows]
    parent = list(range(len(rows)))

    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x

    for i in range(len(rows)):
        for j in range(i + 1, len(rows)):
            if jac(masked[i], masked[j]) >= threshold:
                a, b = find(i), find(j)
                if a != b:
                    parent[a] = b
    groups = collections.defaultdict(list)
    for i in range(len(rows)):
        groups[find(i)].append(rows[i])
    order = lambda r: (r["year"], r["id"])
    clusters = sorted((sorted(g, key=order) for g in groups.values() if len(g) > 1),
                      key=lambda g: (-len(g), g[0]["id"]))
    singletons = sorted((g[0] for g in groups.values() if len(g) == 1), key=order)
    return clusters, singletons


def propose(key):
    pool = load(POOL)
    chapter = next((c for c in pool["chapters"] if c["key"] == key), None)
    if not chapter:
        sys.exit("unknown chapter key %r" % key)
    pool_ids = set(chapter["question_ids"])
    bank = load(BANK)
    rows = [q for q in kept_bank(bank) if q["chapter"] == chapter["name"]]
    asked = sum(1 for q in bank["questions"] if q.get("chapter") == chapter["name"])
    kept_ids = {q["id"] for q in rows}
    missing = sorted(pool_ids - kept_ids)
    if missing:
        sys.exit("pool questions not in the kept bank - the bank moved under the pool: %s" % missing)
    clusters, singletons = cluster(rows, RECUR_J)

    def line(q):
        return "  %s %s  %d %s  %s" % ("*" if q["id"] in pool_ids else " ", q["id"], q["year"],
                                      session_of(q), " ".join(q["question_en"].split()))

    print("%s %s: %d asked, %d kept after exclusions and twins, %d in the pool (* below)"
          % (key, chapter["name"], asked, len(rows), len(pool_ids)))
    print("clustered at recurrence %.2f, digits masked: %d clusters covering %d questions, %d singletons"
          % (RECUR_J, len(clusters), sum(len(c) for c in clusters), len(singletons)))
    for n, c in enumerate(clusters, 1):
        print("")
        print("CLUSTER %d (%d questions, %d in the pool)" % (n, len(c), sum(1 for q in c if q["id"] in pool_ids)))
        for q in c:
            print(line(q))
    print("")
    print("SINGLETONS (%d, %d in the pool)" % (len(singletons), sum(1 for q in singletons if q["id"] in pool_ids)))
    for q in singletons:
        print(line(q))

    out = {"chapter_key": key, "chapter": chapter["name"], "threshold": RECUR_J,
           "bank_asked": asked, "bank_questions": len(rows), "pool_ids": chapter["question_ids"],
           "clusters": [[view(q, pool_ids) for q in c] for c in clusters],
           "singletons": [view(q, pool_ids) for q in singletons],
           "built_from": {"bank": os.path.relpath(BANK, ROOT).replace(os.sep, "/"), "bank_sha256": sha256_of(BANK)}}
    os.makedirs(INPUT_DIR, exist_ok=True)
    path = os.path.join(INPUT_DIR, key + ".json")
    io.open(path, "w", encoding="utf-8").write(json.dumps(out, indent=1, ensure_ascii=False))
    print("")
    print("wrote %s" % os.path.relpath(path, ROOT))


def accept(key):
    """Move a reviewed proposal into shapes.json under its own key and print its labels once
    more. The founder reads the labels before this runs; build_release.py gates the result."""
    path = os.path.join(PROPOSED_DIR, key + ".json")
    if not os.path.exists(path):
        sys.exit("no proposal at %s" % os.path.relpath(path, ROOT))
    entry = load(path)
    if entry.get("chapter_key") != key:
        sys.exit("proposal is for %r, not %r" % (entry.get("chapter_key"), key))
    for k in ("chapter", "shapes", "assignments", "authored_by"):
        if k not in entry:
            sys.exit("proposal lacks %r" % k)
    shapes = load(SHAPES) if os.path.exists(SHAPES) else {}
    shapes[key] = {k: entry[k] for k in ("chapter", "shapes", "assignments", "authored_by")}
    io.open(SHAPES, "w", encoding="utf-8").write(json.dumps(shapes, indent=1, ensure_ascii=False))
    print("%s accepted into %s: %d shapes, %d assignments" % (key, os.path.relpath(SHAPES, ROOT),
                                                             len(entry["shapes"]), len(entry["assignments"])))
    for s in entry["shapes"]:
        n = sum(1 for v in entry["assignments"].values() if v == s["key"])
        print("  %-24s %-40s %d question%s" % (s["key"], s["label"], n, "" if n == 1 else "s"))
    print("now run build_release.py: it gates the list and refuses a wrong one")


def main():
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    ap = argparse.ArgumentParser()
    ap.add_argument("--chapter", help="chapter key, e.g. p1-02: print and write its shapes input")
    ap.add_argument("--accept", help="chapter key: merge _shapes_proposed/<key>.json into shapes.json")
    a = ap.parse_args()
    if bool(a.chapter) == bool(a.accept):
        sys.exit("give exactly one of --chapter or --accept")
    propose(a.chapter) if a.chapter else accept(a.accept)


if __name__ == "__main__":
    main()
