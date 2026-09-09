#!/usr/bin/env python3
"""
mark_expansion.py — give a card the data the "Simplify" button needs.

    python3 answer-book/tools/mark_expansion.py <question_id> [--base <commit>] [--dry]
    python3 answer-book/tools/mark_expansion.py ts_ipe_m2a_bt_terms_240_720_1080

A card that was "written out in full" holds only the EXPANDED working. The
Simplify button shows the short answer first and the expansion on demand, so the
card has to carry both, and has to know which lines the expansion ADDED:

    step.lines_compact[]   the pre-expansion lines, verbatim
    step.lines[i].added    true where that line is new working

Both are derived here, from git, and never hand-authored: the short answer IS
the version that shipped before the expansion commit, so the honest source for
it is the commit before the expansion — not a re-compression written by hand.

`--base` is the commit the card is read from (default c67c6e11, the commit
Maths-2A's expansion branched from). A step whose lines did not change gets no
lines_compact: the renderer falls back to `lines`, so identical data is never
stored twice. A diagram step is skipped outright — it has no lines.

Which lines count as ADDED is an anchored diff, not a set difference: lines the
expansion left alone anchor the alignment, and a line that was only lightly
reworded (x -> x¹) is matched to its old self rather than flagged. Everything
else — every genuinely new step of working — is flagged, and the page draws it
in the second pen.
"""
import argparse
import difflib
import json
import pathlib
import re
import subprocess
import sys

ROOT = pathlib.Path(__file__).resolve().parents[2]
QDIR = ROOT / 'answer-book' / 'questions'

# A rewrite this close to its old line is the SAME line, not new working.
NEAR = 0.85


def spec(raw):
    """A line in object form. A plain string takes the step's default style."""
    return {'text': raw} if isinstance(raw, str) else dict(raw)


def norm(raw):
    """The comparison key: text alone, whitespace collapsed."""
    return re.sub(r'\s+', ' ', spec(raw).get('text', '')).strip()


def mark_added(old_lines, new_lines):
    """Per new line, True where the expansion added it. Anchored on what survived."""
    o = [norm(l) for l in old_lines]
    n = [norm(l) for l in new_lines]
    added = [True] * len(n)

    for tag, i1, i2, j1, j2 in difflib.SequenceMatcher(None, o, n, autojunk=False).get_opcodes():
        if tag == 'equal':
            for j in range(j1, j2):
                added[j] = False
        elif tag == 'replace':
            # A replaced block may still hold a lightly reworded survivor. Match
            # each new line to its closest unused old line and keep it if it is
            # close enough; the rest of the block is new working.
            used = set()
            for j in range(j1, j2):
                best, best_i = 0.0, -1
                for i in range(i1, i2):
                    if i in used:
                        continue
                    r = difflib.SequenceMatcher(None, o[i], n[j]).ratio()
                    if r > best:
                        best, best_i = r, i
                if best >= NEAR:
                    added[j] = False
                    used.add(best_i)
        # 'insert' -> new working, already True. 'delete' -> nothing to mark.
    return added


def git_show(base, rel):
    r = subprocess.run(['git', 'show', f'{base}:{rel}'], cwd=ROOT,
                       capture_output=True, text=True)
    if r.returncode != 0:
        sys.exit(f'cannot read {rel} at {base}: {r.stderr.strip()}')
    return json.loads(r.stdout)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('question_id')
    ap.add_argument('--base', default='c67c6e11',
                    help='the commit holding the pre-expansion card')
    ap.add_argument('--dry', action='store_true', help='report, write nothing')
    args = ap.parse_args()

    rel = f'answer-book/questions/{args.question_id}.json'
    path = ROOT / rel
    if not path.exists():
        sys.exit(f'no such card: {rel}')

    new = json.loads(path.read_text(encoding='utf-8'))
    old = git_show(args.base, rel)
    old_steps = {s['id']: s for s in old['answer']['steps']}

    total_added = total_compact = 0
    for step in new['answer']['steps']:
        if step.get('kind') == 'diagram':
            print(f'  {step["id"]}: diagram — skipped')
            continue
        was = old_steps.get(step['id'])
        if not was:
            print(f'  {step["id"]}: not in {args.base} — skipped')
            continue

        old_lines = was.get('lines') or []
        new_lines = step.get('lines') or []
        if [norm(l) for l in old_lines] == [norm(l) for l in new_lines]:
            step.pop('lines_compact', None)
            print(f'  {step["id"]}: unchanged ({len(new_lines)} lines) — no compact copy')
            continue

        added = mark_added(old_lines, new_lines)
        rebuilt = []
        for raw, is_added in zip(new_lines, added):
            if not is_added:
                # untouched: keep the authored form, string or object
                rebuilt.append(raw)
                continue
            s = spec(raw)
            s['added'] = True
            rebuilt.append(s)
        step['lines'] = rebuilt
        step['lines_compact'] = old_lines
        total_added += sum(added)
        total_compact += len(old_lines)
        print(f'  {step["id"]}: {len(old_lines)} -> {len(new_lines)} lines, '
              f'{sum(added)} added')

    print(f'{args.question_id}: compact {total_compact} lines · '
          f'{total_added} lines marked as added')
    if args.dry:
        print('(dry run — nothing written)')
        return
    path.write_text(json.dumps(new, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(f'written: {rel}')


if __name__ == '__main__':
    main()
