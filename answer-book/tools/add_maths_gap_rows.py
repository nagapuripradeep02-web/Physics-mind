"""add_maths_gap_rows.py — add the manifest rows for the Maths-1A/1B gap-fill cards.

    python answer-book/tools/add_maths_gap_rows.py            # dry run: report only
    python answer-book/tools/add_maths_gap_rows.py --write    # edit units.json in place

Why a script. The catalog is driven by the manifest ROW, not by the card
(`notebook.js` filters, counts, groups and labels from the row), so a row typed by
hand can disagree with its card and the build still passes. This derives every field
from the two files that already hold the truth:

  * `answer-book/sources/chaitanya_m1{a,b}_ch*.json`  — ref, section, number, stem
  * `answer-book/questions/<question_id>.json`        — the authored card

and it refuses to write a row whose section disagrees with its card's `qtype`.

Two rules from docs/ORIGINALITY_MATHS.md are enforced here rather than trusted:

  * `stars: 0` on every row — R1, the book's priority ranking is not ours to publish.
    On a `chaitanya_fastrack` row 0 means NOT PUBLISHED, not "the book gave it no star"
    (notebook.js UNSPLIT_SOURCES).
  * `source: "chaitanya_fastrack"` — the third source branch, which tells the player the
    book asked the question but printed no per-step mark split, so the split is ours.

Rows are appended to their unit and the unit is then ordered VSAQ, SAQ, LAQ and by book
question number inside each section — the syllabus order, never the book's arrangement (R2).
"""
import io
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
UNITS = os.path.join(ROOT, 'answer-book', 'units.json')
QDIR = os.path.join(ROOT, 'answer-book', 'questions')
SRCDIR = os.path.join(ROOT, 'answer-book', 'sources')
GAP = os.path.join(ROOT, 'answer-book', 'wip', 'maths_gap')

# work-order key -> (source index basename, subject, unit number)
CHAPTERS = {
    'chaitanya_m1a_ch02': ('chaitanya_m1a_ch02_functions', 'mathematics', 2),
    'chaitanya_m1a_ch04': ('chaitanya_m1a_ch04_mathematical_induction', 'mathematics', 4),
    'chaitanya_m1a_ch05': ('chaitanya_m1a_ch05_matrices', 'mathematics', 5),
    'chaitanya_m1a_ch06': ('chaitanya_m1a_ch06_addition_of_vectors', 'mathematics', 6),
    'chaitanya_m1a_ch07': ('chaitanya_m1a_ch07_product_of_vectors', 'mathematics', 7),
    'chaitanya_m1a_ch08': ('chaitanya_m1a_ch08_trig_ratios_and_transformations', 'mathematics', 8),
    'chaitanya_m1a_ch09': ('chaitanya_m1a_ch09_trigonometric_equations', 'mathematics', 9),
    'chaitanya_m1a_ch10': ('chaitanya_m1a_ch10_inverse_trigonometric_functions', 'mathematics', 10),
    'chaitanya_m1a_ch11': ('chaitanya_m1a_ch11_hyperbolic_functions', 'mathematics', 11),
    'chaitanya_m1a_ch12': ('chaitanya_m1a_ch12_properties_of_triangles', 'mathematics', 12),
    'chaitanya_m1b_ch01': ('chaitanya_m1b_ch01_locus', 'mathematics_1b', 1),
    'chaitanya_m1b_ch03': ('chaitanya_m1b_ch03_the_straight_line', 'mathematics_1b', 3),
    'chaitanya_m1b_ch04': ('chaitanya_m1b_ch04_pair_of_straight_lines', 'mathematics_1b', 4),
    'chaitanya_m1b_ch05': ('chaitanya_m1b_ch05_three_dimensional_coordinates', 'mathematics_1b', 5),
    'chaitanya_m1b_ch06': ('chaitanya_m1b_ch06_direction_cosines_and_ratios', 'mathematics_1b', 6),
    'chaitanya_m1b_ch07': ('chaitanya_m1b_ch07_the_plane', 'mathematics_1b', 7),
}

SECTION_ORDER = {'VSAQ': 0, 'SAQ': 1, 'LAQ': 2}

# Refs deliberately NOT authored as new cards. Both are SCOPE GAPS in cards the bank
# already ships -- the book asks for more than the existing card delivers -- and both are
# already on the "flagged for a teacher, not for an author" list in
# docs/MATHS_1AB_GAP_START_HERE.md §7. The repair the handoff prescribes for the identical
# Straight Line cases is to EXTEND the existing card, not to add a second one, which would
# put two catalog entries against one book question (founder: ONE ENTRY = ONE QUESTION AT
# ONE LENGTH). Listed here so the generator reports them as a decision rather than as an
# unauthored card, and so the next session sees them instead of rediscovering them.
SCOPE_GAP_REFS = {
    ('chaitanya_m1a_ch02', 'vsaq20iii'):
        'ts_ipe_m1a_fn_domain_root_9_minus_x2 gives the domain; the book also asks the range',
    ('chaitanya_m1a_ch02', 'saq3'):
        'ts_ipe_m1a_fn_inverse_5x_plus_4 finds f-inverse; the book also asks for the bijection proof',
}


def work_order_pairs(key):
    """[(ref, question_id)] from a work-order file, in book order."""
    path = os.path.join(GAP, key + '__work.md')
    if not os.path.exists(path):
        return []
    pairs, qids = [], []
    for line in open(path, encoding='utf-8'):
        m = re.match(r'^###\s+(.+?)\s*$', line)
        if m:
            # A heading may list SEVERAL ids for one ref: the book asks one linear system
            # by Cramer's rule, by matrix inversion and by Gauss-Jordan, and this bank's
            # convention is one card -- and one catalog entry -- per named method (see the
            # existing laq7..laq17 rows in units.json). Strip any trailing "(see NOTES ...)".
            head = re.sub(r'\s*\(.*$', '', m.group(1))
            qids = [x.strip() for x in head.split(',') if x.strip().startswith('ts_ipe_')]
            continue
        m = re.match(r'^-\s+ref\s+`([^`]+)`', line)
        if m and qids:
            pairs.append((m.group(1), qids))
    return pairs


# A ref answered by more than one card needs a distinct ref per row, because the catalog
# renders one entry per card. The method name in the id is the honest discriminator.
METHOD_TOKENS = ('cramer', 'inverse', 'gauss')


# Every new row is namespaced "ct" (Chaitanya). `ref` must be unique inside its unit --
# build_answer_book.ts hard-fails on a duplicate, and `notebook.js` uses ref as a LOOKUP KEY
# (`inWeak[e.ref]`), so a collision would cross-wire two cards' weak-topic state, not merely
# fail a gate. Both source books number their questions from 1 inside each chapter, so the
# Chaitanya "vsaq3" and the Baby Bullet-Q "vsaq3" collide in 14 of these units (91 rows).
# Prefixing is honest -- the row already carries source: "chaitanya_fastrack" -- and matches
# the bank's existing prefixed shapes (sv1, tn1, rm1, mm1).
def row_ref(ref, qid, many):
    ref = 'ct' + ref
    if not many:
        return ref
    # One book question answered by several method cards needs one ref per card.
    for t in METHOD_TOKENS:
        if f'_mat_{t}_' in qid:
            return f'{ref}-{t}'
    return ref


def main():
    write = '--write' in sys.argv
    manifest = json.load(open(UNITS, encoding='utf-8'))
    problems, scope_gaps, added, skipped = [], [], 0, 0

    for key, (srcname, subject, unum) in CHAPTERS.items():
        pairs = work_order_pairs(key)
        if not pairs:
            continue
        src = json.load(open(os.path.join(SRCDIR, srcname + '.json'), encoding='utf-8'))
        byref = {q['ref']: q for q in src['questions']}
        unit = next((u for u in manifest['units']
                     if u.get('subject') == subject and u.get('number') == unum), None)
        if unit is None:
            problems.append(f'{key}: no unit {subject}-{unum} in units.json')
            continue
        have = {e.get('question_id') for e in unit['questions']}

        for ref, qidlist in pairs:
          many = len(qidlist) > 1
          for qid in qidlist:
            if (key, ref) in SCOPE_GAP_REFS:
                scope_gaps.append(f'{key} {ref}: {SCOPE_GAP_REFS[(key, ref)]}')
                continue
            card_path = os.path.join(QDIR, qid + '.json')
            if not os.path.exists(card_path):
                problems.append(f'{key} {ref}: card {qid}.json not authored yet')
                continue
            if qid in have:
                # A source duplicate authored ONCE legitimately hits this (m1a ch8
                # vsaq22 / vsaq32i are the same identity). One card, one row.
                skipped += 1
                continue
            card = json.load(open(card_path, encoding='utf-8'))
            q = byref.get(ref)
            if q is None:
                problems.append(f'{key} {ref}: not in the source index')
                continue
            # The book files most questions under a VSAQ/SAQ/LAQ banner, and where it does
            # that is what we file by -- a card whose qtype disagrees is the defect the
            # 2026-08-28 re-cut repaired 61 times. But a few items sit under a THEOREMS
            # banner instead, which is not a marks section at all; there the card's own
            # qtype is the only source of truth and the row takes it.
            book_section = q['section'] if q['section'] in SECTION_ORDER else None
            if book_section is not None and card['qtype'] != book_section:
                problems.append(
                    f'{key} {ref} ({qid}): card qtype {card["qtype"]} '
                    f'but the book prints it under {q["section"]}')
                continue
            row_section = book_section or card['qtype']
            if card['subject'] != subject or card['unit']['number'] != unum:
                problems.append(
                    f'{key} {ref} ({qid}): card says {card["subject"]}-'
                    f'{card["unit"]["number"]}, expected {subject}-{unum}')
                continue
            unit['questions'].append({
                'ref': row_ref(ref, qid, many),
                'section': row_section,
                'number': q['number'],
                'stars': 0,                      # R1 — never republish the book's ranking
                'text': card['question_text'],   # the CARD's wording, so row and card agree
                'question_id': qid,
                'source': 'chaitanya_fastrack',
            })
            have.add(qid)
            added += 1

        unit['questions'].sort(key=lambda e: (SECTION_ORDER.get(e.get('section'), 9),
                                              e.get('number') or 0,
                                              str(e.get('ref'))))

    print(f'rows to add: {added} · already present: {skipped} · problems: {len(problems)}')
    if scope_gaps:
        print('')
        print(f'{len(scope_gaps)} ref(s) deliberately NOT authored — scope gaps in cards the'
              f' bank already ships (see SCOPE_GAP_REFS and'
              f' docs/MATHS_1AB_GAP_START_HERE.md §7):')
        for g in scope_gaps:
            print('  - ' + g)
    for p in problems:
        print('  - ' + p)
    if problems:
        print('\nNOT writing — fix the problems above first.')
        return 1
    if write:
        # units.json is CRLF with indent=2. Verified byte-identical on a no-op round
        # trip, so a run that adds N rows produces a diff of N rows and nothing else —
        # write it back the same way rather than letting Python normalise every line.
        buf = io.StringIO()
        json.dump(manifest, buf, ensure_ascii=False, indent=2)
        buf.write('\n')
        with open(UNITS, 'wb') as f:
            f.write(buf.getvalue().replace('\n', '\r\n').encode('utf-8'))
        print(f'\nwrote {UNITS}')
    else:
        print('\ndry run — pass --write to edit units.json')
    return 0


if __name__ == '__main__':
    sys.exit(main())
