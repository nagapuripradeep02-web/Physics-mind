"""Pre-commit hygiene for one chapter of the bank: nothing tracked may name the source, quote its prose,
carry its page numbers, or record a metered-API model where none was allowed.

    BANK_CHAPTER=projectile python scripts/bank/hygiene.py [--report docs/reports/bank/<file>.md]

Exit code 1 on any finding. The checks:
  identity   the gate's IDENTITY regex over every tracked file under bank/<chapter>/ (+ the report)
  shingles   12-word English runs shared with the chapter's transcripts (question, parts, options, printed
             solutions) over the same files and scripts/bank/
  pages      the chapter's page numbers (from the gitignored source.json geometry) written as "page N" /
             "p. N" in any tracked bank file
  models     "model": "gemini…" / "deepseek…" rows in the chapter's work JSONLs when the run was meant to be
             subscription-only (skipped with --allow-api-models)
"""
import os, re, sys, glob, argparse, subprocess

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import _lib as L        # noqa: E402
import solve as S       # noqa: E402
import gate_run as R    # noqa: E402


def tracked(prefix):
    out = subprocess.run(["git", "ls-files", "--cached", "--others", "--exclude-standard", prefix],
                         cwd=L.ROOT, capture_output=True, text=True).stdout.split("\n")
    return [os.path.join(L.ROOT, f) for f in out if f.strip() and not f.endswith((".png", ".jpg"))]


def read(p):
    try:
        return open(p, encoding="utf-8").read()
    except UnicodeDecodeError:
        return ""


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--report")
    ap.add_argument("--allow-api-models", action="store_true")
    a = ap.parse_args()
    bank_files = tracked(os.path.relpath(L.BANK, L.ROOT).replace("\\", "/"))
    if a.report:
        bank_files.append(os.path.join(L.ROOT, a.report))
    bad = 0

    hits = [(f, R.IDENTITY.search(read(f)).group(0)) for f in bank_files if R.IDENTITY.search(read(f))]
    print("identity: %d file(s)" % len(hits))
    for f, m in hits:
        print("   ", os.path.relpath(f, L.ROOT), repr(m))
    bad += len(hits)

    tr = S.transcripts()
    src = set()
    for t in tr.values():
        text = " ".join([t.get("question_text") or ""] + [p for p in (t.get("parts") or []) if isinstance(p, str)]
                        + [o.get("text", "") for o in t.get("options") or []] + [t.get("printed_solution") or ""])
        src |= R.shingles(text)
    files = bank_files + tracked("scripts/bank")
    sh = []
    for f in files:
        common = R.shingles(read(f)) & src
        if common:
            sh.append((f, sorted(common)[:3]))
    print("shingles (12-word English runs shared with the transcripts): %d file(s)" % len(sh))
    for f, runs in sh:
        print("   ", os.path.relpath(f, L.ROOT), runs)
    bad += len(sh)

    pages = set()
    for k in ("body", "level1", "answers", "hints_start"):
        v = L.GEOM.get(k)
        for x in (v if isinstance(v, (list, tuple)) else [v]):
            if isinstance(x, int):
                pages.add(str(x))
    rx = re.compile(r"\b(?:page|p\.|pp\.)\s*(\d{2,4})\b", re.I)
    ph = []
    for f in bank_files:
        for m in rx.finditer(read(f)):
            if m.group(1) in pages:
                ph.append((f, m.group(0)))
    print("page numbers: %d hit(s)" % len(ph))
    for f, m in ph:
        print("   ", os.path.relpath(f, L.ROOT), m)
    bad += len(ph)

    if not a.allow_api_models:
        mh = []
        for f in glob.glob(os.path.join(L.WORK, "*.jsonl")):
            n = sum(1 for r in L.jsonl_read(f) if re.match(r"gemini|deepseek", str(r.get("model") or ""), re.I))
            if n:
                mh.append((os.path.basename(f), n))
        print("metered-model rows in work JSONLs: %s" % (mh or 0))
        bad += len(mh)

    print("HYGIENE %s" % ("OK" if not bad else "FAILED (%d)" % bad))
    sys.exit(1 if bad else 0)


if __name__ == "__main__":
    main()
