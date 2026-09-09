#!/usr/bin/env python3
"""
mark_expansion.py — give a card the data the "Simplify" button needs.

    python3 answer-book/tools/mark_expansion.py <question_id> [--base <commit>] [--dry]
    python3 answer-book/tools/mark_expansion.py ts_ipe_m2a_bt_terms_240_720_1080

A card that was "written out in full" holds only the EXPANDED working. Each mark
that has an expansion carries its own Simplify button, so the card has to carry
both lengths PER STEP, and has to know which lines the expansion ADDED:

    step.lines_compact[]   the pre-expansion lines, verbatim
    step.lines[i].added    true where that line is new working

The SETUP steps are the exception (founder, 2026-09-09). A solution opens by
writing down what is given and the formula it will use; there is nothing there to
unfold on demand, and offering to is noise. So the leading `--promote` steps keep
their fuller working as the ONLY version — written in ink like the rest of the
answer, with no button and no second pen. Promotion is why those steps end up
with no lines_compact and therefore no button: the renderer needs no rule for it.

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


def strip_added(raw):
    """The line with any previous run's `added` verdict removed."""
    if isinstance(raw, str):
        return raw
    if 'added' not in raw:
        return raw
    o = {k: v for k, v in raw.items() if k != 'added'}
    # A line that was ONLY ever an object to carry the flag goes back to a plain
    # string, so a re-run leaves the card as the author would have written it.
    return o['text'] if set(o) == {'text'} else o


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
    ap.add_argument('--promote', type=int, default=1, metavar='N',
                    help='leading steps whose expansion becomes the permanent '
                         'answer in ink, with no button (default 1: the setup '
                         'step that writes the given and the formula). 0 = none.')
    args = ap.parse_args()

    rel = f'answer-book/questions/{args.question_id}.json'
    path = ROOT / rel
    if not path.exists():
        sys.exit(f'no such card: {rel}')

    new = json.loads(path.read_text(encoding='utf-8'))
    old = git_show(args.base, rel)
    old_steps = {s['id']: s for s in old['answer']['steps']}

    total_added = total_compact = 0
    promoted = 0
    for step in new['answer']['steps']:
        # Idempotent: a re-run must not inherit the last run's verdict, so every
        # flag and compact copy is cleared before this run decides again.
        step.pop('lines_compact', None)
        # Only where there ARE lines: a diagram step carries no `lines` key at
        # all, and writing one back as null is a schema violation the validator
        # catches one card later, a long way from the cause.
        if step.get('lines'):
            step['lines'] = [strip_added(l) for l in step['lines']]
        elif 'lines' in step and step['lines'] is None:
            step.pop('lines')

        if step.get('kind') == 'diagram':
            print(f'  {step["id"]}: diagram — skipped')
            continue
        if promoted < args.promote:
            promoted += 1
            n = len(step.get('lines') or [])
            print(f'  {step["id"]}: SETUP — the full working stays, in ink ({n} lines)')
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

        # A step with nothing NEW to show gets no button. The early-exit above
        # only catches a step the expansion left byte-identical; this catches the
        # one it merely reworded — `1·2·3·4` respaced to `1 · 2 · 3 · 4` is not
        # working a student can be shown, and a Simplify that swaps four lines for
        # four differently-spaced lines, none of them in the second pen, is a
        # button that does nothing. Both conditions mirror the schema's guards, so
        # this tool and the validator can never disagree about a card.
        if not any(added) or len(new_lines) <= len(old_lines):
            print(f'  {step["id"]}: reworded, not expanded '
                  f'({len(old_lines)} -> {len(new_lines)} lines, {sum(added)} new) — no button')
            continue

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

    print(f'{args.question_id}: {promoted} setup step(s) in ink · compact '
          f'{total_compact} lines · {total_added} lines marked as added')
    if args.dry:
        print('(dry run — nothing written)')
        return
    path.write_text(json.dumps(new, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(f'written: {rel}')


if __name__ == '__main__':
    main()
