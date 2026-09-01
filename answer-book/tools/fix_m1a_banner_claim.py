"""fix_m1a_banner_claim.py — remove an unsupported claim about the Maths-1A volume.

    python answer-book/tools/fix_m1a_banner_claim.py           # dry run
    python answer-book/tools/fix_m1a_banner_claim.py --write

The gap-fill authoring brief handed every agent one `verification.note` template, and
its provenance sentence read:

    THE MARK SPLIT IS OURS, NOT THE BOOK'S: the volume prints a chapter-level marks
    banner over this section but no per-step allocation on any answer.

That is true of the **Mathematics-IB** volume — 204 shipped `ts_ipe_m1b_*` cards cite a
specific printed banner. It is NOT supported for **Mathematics-IA**: `docs/ORIGINALITY_MATHS.md`
§7 records that a full read of the scans found "no mark splits anywhere in the 1A volume",
and zero committed 1A cards make a banner claim. The sentence was a 1B template carried
across, and nobody on this desk can open the book to settle it.

`verification.note` is internal (never rendered, never sent to Vidi), but it is the
evidentiary record the originality dossier rests on, so a claim we cannot support does not
belong in it. This rewrites the clause on 1A cards to the narrower statement both records
agree on, and leaves 1B cards alone.

Scoped to UNTRACKED files by default: the defect was introduced by this session's agents,
and a committed card is somebody else's provenance to change.
"""
import os
import re
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
QDIR = os.path.join(ROOT, 'answer-book', 'questions')

OLD = ("the volume prints a chapter-level marks banner over this section "
       "but no per-step allocation on any answer")
NEW = "the Mathematics-IA volume prints no per-step mark allocation on any answer"


def tracked(path):
    return subprocess.run(['git', 'ls-files', '--error-unmatch', path],
                          cwd=ROOT, capture_output=True).returncode == 0


def main():
    write = '--write' in sys.argv
    allow_tracked = '--include-tracked' in sys.argv
    hits, skipped = [], []
    for name in sorted(os.listdir(QDIR)):
        if not name.startswith('ts_ipe_m1a_') or not name.endswith('.json'):
            continue
        path = os.path.join(QDIR, name)
        rel = os.path.relpath(path, ROOT).replace('\\', '/')
        raw = open(path, 'rb').read().decode('utf-8')
        if OLD not in raw:
            continue
        if tracked(rel) and not allow_tracked:
            skipped.append(name)
            continue
        hits.append(name)
        if write:
            # Byte-level replace so CRLF and every other byte survive untouched.
            open(path, 'wb').write(raw.replace(OLD, NEW).encode('utf-8'))

    print(f'1A cards carrying the unsupported banner claim: {len(hits)}')
    for h in hits:
        print('  - ' + h)
    if skipped:
        print(f'\nskipped {len(skipped)} TRACKED card(s) — rerun with --include-tracked '
              f'only if the founder wants committed provenance rewritten:')
        for s in skipped:
            print('  - ' + s)
    print(f"\n{'rewritten' if write else 'dry run — pass --write to rewrite'}")
    return 0


if __name__ == '__main__':
    sys.exit(main())
