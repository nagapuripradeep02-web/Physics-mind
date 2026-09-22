#!/usr/bin/env python3
"""check_formula_notes.py — sweep the authored `formula_note` field.

    python3 answer-book/tools/check_formula_notes.py                 # whole bank
    python3 answer-book/tools/check_formula_notes.py ts_ipe_m1a_     # one prefix
    python3 answer-book/tools/check_formula_notes.py ts_ipe_m1a_ -v  # print every note

REPORT-ONLY by design, like register_scan.mjs and find_wide_katex.mjs. The build
already hard-fails on the schema and runs the Rule 41 idiom list over this field;
what it cannot see is the things that make a formula note specifically wrong:

  1. FILE DAMAGE. These files round-trip byte-identically through
     json.dumps(indent=2, ensure_ascii=False). A bulk authoring pass that
     reformats one is a diff nobody can review, so fidelity is checked first.
  2. KEY ORDER. The schema is order-free, but a reader is not: formula_note
     belongs immediately before `cuts`/`answer`, where the schema declares it.
  3. NOTATION. The cards write Unicode maths in plain text. LaTeX and ASCII
     transcriptions (\\frac, sqrt, pi, ->) reach the student as literal
     characters — the same scar Rule 34c records for the sims, in a new field.
     The commonest slip is a HYPHEN where a minus belongs: they look almost
     identical here and completely different on the page.
  4. LENGTH. Authored tips run 60-120 chars; a formula note is a paragraph at
     200-350. Well outside that band usually means a stub or an essay.

Coverage is printed per unit but never graded: the field is OPTIONAL and SPARSE,
so "12 of 19" is a fact, not a failure. A unit at 100% is more suspicious than
one at 60% — it usually means someone padded every card to finish the list.
"""
import json
import io
import sys
import glob
import os
import re
import collections

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
QDIR = os.path.join(ROOT, 'answer-book', 'questions')

MIN_LEN, MAX_LEN = 200, 350

# Backslash commands and ASCII stand-ins for symbols the cards write as Unicode.
LATEX = re.compile(r'\\[a-zA-Z]+|\$\$?|\{|\}')
ASCII_MATH = [
    (re.compile(r'\bsqrt\b', re.I), 'sqrt', '√'),
    (re.compile(r'\bpi\b'), 'pi', 'π'),
    (re.compile(r'\btheta\b', re.I), 'theta', 'θ'),
    (re.compile(r'\balpha\b|\bbeta\b', re.I), 'alpha/beta', 'α / β'),
    (re.compile(r'->|=>'), '->', '→'),
    (re.compile(r'\+/-|\+-'), '+-', '±'),
    (re.compile(r'\^-?1|\^2|\^n'), '^n', '⁻¹ / ² / ⁿ'),
    (re.compile(r'<=|>='), '<=', '≤ / ≥'),
    (re.compile(r'\bdeg\b', re.I), 'deg', '°'),
]
# A hyphen with maths either side is almost always a minus that should be U+2212.
HYPHEN_MINUS = re.compile(r'(?<=[0-9A-Za-zθπ\)\]])\s-\s(?=[0-9A-Za-zθπ\(\[])')


def issues_in(note):
    out = []
    n = len(note)
    if n < MIN_LEN:
        out.append('SHORT (%d chars, floor %d)' % (n, MIN_LEN))
    elif n > MAX_LEN:
        out.append('LONG (%d chars, cap %d)' % (n, MAX_LEN))
    if '\n' in note:
        out.append('has a line break')
    m = LATEX.search(note)
    if m:
        out.append('LaTeX or braces: %r' % m.group(0))
    for rx, got, want in ASCII_MATH:
        if rx.search(note):
            out.append('ASCII maths %r — write %s' % (got, want))
    if HYPHEN_MINUS.search(note):
        out.append('HYPHEN between maths terms — write the minus sign −')
    return out


def main():
    args = [a for a in sys.argv[1:] if not a.startswith('-')]
    verbose = '-v' in sys.argv or '--verbose' in sys.argv
    prefix = args[0] if args else ''

    per_unit = collections.defaultdict(lambda: {'n': 0, 'noted': 0, 'name': ''})
    problems = []
    checked = 0

    for path in sorted(glob.glob(os.path.join(QDIR, '%s*.json' % prefix))):
        raw = io.open(path, encoding='utf-8').read()
        qid = os.path.basename(path)[:-5]
        try:
            q = json.loads(raw, object_pairs_hook=collections.OrderedDict)
        except Exception as e:
            problems.append((qid, ['unreadable JSON: %s' % e]))
            continue
        checked += 1

        key = '%s-%s' % (q.get('subject', 'physics'), q['unit']['number'])
        per_unit[key]['n'] += 1
        per_unit[key]['name'] = q['unit']['name']

        note = q.get('formula_note')
        if not note:
            continue
        per_unit[key]['noted'] += 1

        found = issues_in(note)

        # round-trip fidelity — a reformatted file is an unreviewable diff
        if json.dumps(q, indent=2, ensure_ascii=False) + '\n' != raw:
            found.append('FILE REFORMATTED — does not round-trip byte-identically')

        keys = list(q.keys())
        anchor = 'cuts' if 'cuts' in keys else 'answer'
        if anchor in keys and keys.index('formula_note') != keys.index(anchor) - 1:
            found.append('key order: formula_note should sit immediately before %r' % anchor)

        if found:
            problems.append((qid, found))
        if verbose:
            print('\n--- %s\n%s' % (qid, note))

    print('\ncoverage (the field is OPTIONAL and SPARSE — a low number is not a failure)')
    print('  %-22s %-40s %s' % ('unit', 'name', 'with a note'))
    for key in sorted(per_unit, key=lambda k: (k.split('-')[0], int(k.split('-')[1]))):
        u = per_unit[key]
        if not u['noted'] and not prefix:
            continue
        print('  %-22s %-40s %d / %d' % (key, u['name'][:40], u['noted'], u['n']))

    total = sum(u['noted'] for u in per_unit.values())
    print('\n%d card(s) scanned, %d carry a formula note.' % (checked, total))

    if problems:
        print('\n%d card(s) to look at:' % len(problems))
        for qid, found in problems:
            print('  %s' % qid)
            for f in found:
                print('      - %s' % f)
    else:
        print('No notation, length, ordering or formatting problems found.')

    # Report-only on purpose: this is judgement, not a gate. Always exit 0.
    return 0


if __name__ == '__main__':
    sys.exit(main())
