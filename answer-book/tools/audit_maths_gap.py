"""audit_maths_gap.py — one pass over the NEW Maths-1A/1B gap-fill cards.

    python answer-book/tools/audit_maths_gap.py            # untracked cards only (the default)
    python answer-book/tools/audit_maths_gap.py --all      # every ts_ipe_m1a/m1b card

Why this exists. `check:cards` enforces the zod schema, per-step completeness and Rule 41.
`build:answers` enforces manifest/file agreement. Neither checks the things that actually
went wrong on this run, every one of which was found by reading an agent's report rather
than by a gate:

  1. A provenance claim the volume does not support (the Mathematics-IB "chapter-level marks
     banner" sentence copied onto Mathematics-IA cards — docs/ORIGINALITY_MATHS.md §7).
  2. A `verification.note` describing the SUPERSEDED 75-mark paper ("Section B … any 5 of 7")
     while `PAPER_PATTERNS` says ABC_60. 177 committed maths cards still carry this; nine NEW
     cards were caught doing it here.
  3. `page_header[1]` drifting off the fleet convention `<chapter> · N marks` (562 of 613).
  4. `expected_time_min`, which no gate reads and which drifted on 102 cards last session.
  5. An ASCII hyphen standing in for U+2212.

Reports only — it changes nothing. `fix_m1a_banner_claim.py` is the fixer for (1).
Exit 1 if anything is found.
"""
import json
import os
import re
import subprocess
import sys
from collections import defaultdict

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
QDIR = os.path.join(ROOT, 'answer-book', 'questions')

PAPER = {'VSAQ': 2, 'SAQ': 4, 'LAQ': 8}                 # both maths papers sit ABC_60
SECTION = {'VSAQ': 'Section A', 'SAQ': 'Section B', 'LAQ': 'Section C'}
HEADER0 = {'VSAQ': 'Section A — Very Short Answer Question',
           'SAQ': 'Section B — Short Answer Question',
           'LAQ': 'Section C — Long Answer Question'}
TIME_1B = {'VSAQ': 5, 'SAQ': 9, 'LAQ': 15}              # uniform across all 108 1B cards
TIME_1A_VSAQ = 4                                        # invariant across every 1A VSAQ

ORIGINALITY = ('sri chaitanya', 'only the question was taken', 'originality_maths.md')

# Wording that describes the pre-reform 75-mark paper. The 2026-27 maths paper is
# A 10x2 all · B any 6 of 8 x4 · C any 2 of 3 x8.
STALE_PAPER = [
    (r'any 5 of 7', 'any 5 of 7'),
    (r'any five of seven', 'any five of seven'),
    (r'Q11\s*[-–]\s*Q17', 'Q11-Q17 (Section B of the 75-mark paper)'),
    (r'Q18\s*[-–]\s*Q24', 'Q18-Q24 (Section C of the 75-mark paper)'),
    (r'\b7 marks each', '7 marks each'),
]

BANNER_1B_ON_1A = 'chapter-level marks banner'


def cards(all_cards):
    if all_cards:
        return [os.path.join(QDIR, f) for f in sorted(os.listdir(QDIR))
                if re.match(r'ts_ipe_m1[ab]_.*\.json$', f)]
    # Untracked AND modified: once the cards are committed they stop being '??', and an
    # audit that quietly reports "0 cards" after a commit is worse than no audit at all.
    out = subprocess.run(['git', 'status', '--porcelain', 'answer-book/questions'],
                         cwd=ROOT, capture_output=True, text=True).stdout
    paths = [os.path.join(ROOT, l[3:].strip()) for l in out.splitlines()
             if l.startswith('??') or l.startswith(' M') or l.startswith('M ')]
    if paths:
        return paths
    # Nothing dirty -- fall back to the cards the HEAD commit added or changed, which is what
    # "the work of this session" means once it is committed.
    out = subprocess.run(['git', 'show', '--stat', 'HEAD', '--name-only'],
                         cwd=ROOT, capture_output=True, text=True, encoding='utf-8').stdout
    return [os.path.join(ROOT, f) for f in out.splitlines()
            if f.startswith('answer-book/questions/') and f.endswith('.json')]


def main():
    paths = cards('--all' in sys.argv)
    bad = defaultdict(list)
    print(f'auditing {len(paths)} card(s)\n')

    for p in paths:
        d = json.load(open(p, encoding='utf-8'))
        q = d['question_id']
        subj, qt, st = d['subject'], d['qtype'], d['answer']['steps']

        # ── marks arithmetic ────────────────────────────────────────────────
        if sum(s['marks'] for s in st) != d['marks_total']:
            bad['sum(steps.marks) != marks_total'].append(q)
        if sum(s['marks'] for s in d['mark_split']) != d['marks_total']:
            bad['sum(mark_split.marks) != marks_total'].append(q)
        if d['marks_total'] != PAPER[qt]:
            bad[f'marks_total wrong for a {qt} on ABC_60'].append(q)
        if d['paper_section'] != SECTION[qt]:
            bad['paper_section does not match qtype'].append(q)

        # ── per-step completeness (check:cards covers most of this; the
        #    all-or-none fields are the ones that silently half-ship) ────────
        for s in st:
            if not s.get('why'):
                bad['step without `why`'].append(f'{q}/{s["id"]}')
            if not s.get('common_mistakes'):
                bad['step without `common_mistakes`'].append(f'{q}/{s["id"]}')
            if s['marks'] > 0 and not s.get('mark_note'):
                bad['marked step without `mark_note`'].append(f'{q}/{s["id"]}')
            if s['marks'] == 0 and s.get('mark_note'):
                bad['`mark_note` on a 0-mark step'].append(f'{q}/{s["id"]}')
        for f in ('memory_tip', 'margin_note', 'recall'):
            n = sum(1 for s in st if s.get(f))
            if 0 < n < len(st):
                bad[f'`{f}` on some steps but not all'].append(q)
        if any(s.get('recall') for s in st) and not d.get('recall_prompt'):
            bad['recall rubric without `recall_prompt`'].append(q)

        # ── provenance ──────────────────────────────────────────────────────
        note = d['verification'].get('note', '')
        low = note.lower()
        if 'sri chaitanya' in low:
            for k in ORIGINALITY[1:]:
                if k not in low:
                    bad[f'note cites Sri Chaitanya but is missing "{k}"'].append(q)
        if subj == 'mathematics' and BANNER_1B_ON_1A in low:
            bad['1B banner claim on a 1A card (fix_m1a_banner_claim.py)'].append(q)
        for pat, label in STALE_PAPER:
            if re.search(pat, note, re.I):
                bad[f'note describes the SUPERSEDED 75-mark paper: {label}'].append(q)
        if d.get('insider_note'):
            bad['insider_note (needs sourced examiner history)'].append(q)

        # ── conventions no gate reads ───────────────────────────────────────
        hdr = d['answer']['page_header']
        if hdr[0] != HEADER0[qt]:
            bad['page_header[0] off-convention'].append(q)
        if hdr[1] != f'{d["chapter"]} · {d["marks_total"]} marks':
            bad['page_header[1] off-convention (<chapter> · N marks)'].append(q)
        want = TIME_1B[qt] if subj == 'mathematics_1b' else (TIME_1A_VSAQ if qt == 'VSAQ' else None)
        if want is not None and d['expected_time_min'] != want:
            bad[f'expected_time_min != {want} ({subj} {qt})'].append(q)
        if q != os.path.basename(p)[:-5]:
            bad['question_id != filename'].append(q)

        # ── an ASCII hyphen where U+2212 belongs ────────────────────────────
        for s in st:
            for line in (s.get('lines') or []):
                t = line if isinstance(line, str) else line.get('text', '')
                if isinstance(line, dict) and line.get('render') == 'katex':
                    continue          # TeX legitimately uses "-"
                if re.search(r'\d\s*-\s*\d|[a-zA-Z]\s-\s', t):
                    bad['ASCII hyphen used as a minus sign'].append(f'{q}/{s["id"]}')

    for k in sorted(bad):
        v = sorted(set(bad[k]))
        print(f'{len(v):4d}  {k}')
        for x in v[:5]:
            print(f'        {x}')
        if len(v) > 5:
            print(f'        … and {len(v) - 5} more')
    if not bad:
        print('CLEAN — marks arithmetic, step completeness, provenance, paper description,'
              '\n        header convention, expected_time_min and minus signs all pass.')
        return 0
    return 1


if __name__ == '__main__':
    sys.exit(main())
