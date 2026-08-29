"""
emit.py — the Botany-II (Sr. Botany) card emitter.

Every ts_ipe_b2_* card shares an identical header block, an identical verification
preamble and an identical unit table. Authoring 167 cards as 167 hand-written JSON
files would repeat that boilerplate 167 times and make a header change a 167-file
edit. So the CONTENT is authored as compact Python (one Q(...) per question, one
S(...) per step) and this module emits the schema-conformant JSON.

Run a unit file directly to write its cards plus its manifest FRAGMENT:
    python answer-book/tools/botany2_wip/unit_01.py --write

Agents/units never touch answer-book/units.json — the orchestrator merges the
fragments with answer-book/tools/merge_units.py (same contract as zoology).
"""
import json, os, sys, re

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
QDIR = os.path.join(ROOT, 'answer-book', 'questions')
FRAGDIR = os.environ.get('B2_FRAGDIR', os.path.join(ROOT, 'answer-book', 'tools', 'botany2_wip', 'fragments'))

PREFIX = 'ts_ipe_b2'
SUBJECT = 'botany_2'

# ── the fourteen units (the 2022 BIE blueprint's own chapter list, book p.3) ──
# Unit identity is subject-number; botany_2 owns 1-14 and cannot collide with
# botany's 1-13, which live under a different subject value.
UNITS = {
    1:  ('Transport in Plants (Botany-II)',                        'tp',  'Transport in Plants'),
    2:  ('Mineral Nutrition (Botany-II)',                          'mn',  'Mineral Nutrition'),
    3:  ('Enzymes (Botany-II)',                                    'en',  'Enzymes'),
    4:  ('Photosynthesis in Higher Plants (Botany-II)',            'ph',  'Photosynthesis in Higher Plants'),
    5:  ('Respiration in Plants (Botany-II)',                      'rp',  'Respiration in Plants'),
    6:  ('Plant Growth and Development (Botany-II)',               'pgd', 'Plant Growth and Development'),
    7:  ('Bacteria (Botany-II)',                                   'ba',  'Bacteria'),
    8:  ('Viruses (Botany-II)',                                    'vi',  'Viruses'),
    9:  ('Principles of Inheritance and Variation (Botany-II)',    'piv', 'Principles of Inheritance and Variation'),
    10: ('Molecular Basis of Inheritance (Botany-II)',             'mbi', 'Molecular Basis of Inheritance'),
    11: ('Biotechnology: Principles and Processes (Botany-II)',    'bpp', 'Biotechnology: Principles and Processes'),
    12: ('Biotechnology and its Applications (Botany-II)',         'bia', 'Biotechnology and its Applications'),
    13: ('Strategies for Enhancement in Food Production (Botany-II)', 'sef', 'Strategies for Enhancement in Food Production'),
    14: ('Microbes in Human Welfare (Botany-II)',                  'mhw', 'Microbes in Human Welfare'),
}

QTYPE = {'VSAQ': (2, 'Section A', 4), 'SAQ': (4, 'Section B', 8), 'LAQ': (8, 'Section C', 15)}
HEADER = {'VSAQ': 'Section A — Very Short Answer Question',
          'SAQ':  'Section B — Short Answer Question',
          'LAQ':  'Section C — Long Answer Question'}

# The two checks that are STRUCTURALLY IMPOSSIBLE for this paper, recorded on every
# single card so no later session can read "not checked" as "checked and clean".
VERIFY_BASE = (
    'Sourced from "Sr. Botany — My Baby Bullet-Q" (Sri Publishers, STAR-Q Pass Track), '
    'book p.{page}, printed question {gno}. Botany-II holds only ONE source book: the TSBIE '
    'Basic Learning Material in hand covers physics only, and no Telangana Botany-II board '
    'paper is in the corpus, so the two-book union check and the board back-test are BOTH '
    'structurally impossible for this card — "not checked" does NOT mean "checked and clean". '
    'Run both the moment a second source or a real paper arrives. The mark split is a claim '
    'until a Telangana IPE teacher confirms it.'
)


def S(id_, kind, label, marks, mark_note=None, lines=None, figure=None,
      why=None, mistakes=None, tip=None, note=None):
    """One answer step. `mistakes` -> common_mistakes, `tip` -> memory_tip, `note` -> margin_note."""
    d = {'id': id_, 'kind': kind, 'label': label, 'marks': marks}
    if marks > 0:
        assert mark_note, f'step {id_}: a {marks}M step needs a mark_note'
        d['mark_note'] = mark_note
    else:
        assert not mark_note, f'step {id_}: mark_note on a 0-mark step is a schema error'
    assert note, f'step {id_}: margin_note is all-or-none across a question — author it'
    d['margin_note'] = note
    if kind == 'diagram':
        assert figure, f'step {id_}: a diagram step needs a figure'
        d['figure'] = figure
    else:
        assert lines, f'step {id_}: {kind} needs lines'
        d['lines'] = lines
    assert why, f'step {id_}: `why` is build-enforced'
    assert mistakes, f'step {id_}: `common_mistakes` is build-enforced'
    assert len(mistakes) <= 3, f'step {id_}: at most 3 common_mistakes'
    d['why'] = why
    d['common_mistakes'] = list(mistakes)
    assert tip, f'step {id_}: memory_tip is all-or-none across a question — author it'
    d['memory_tip'] = tip
    return d


def _years(spec):
    """('ts',2019) -> {'year':2019,'board':'ts_ipe'};  2014 (bare, pre-bifurcation) -> {'year':2014}."""
    out = []
    for y in spec or []:
        if isinstance(y, int):
            out.append({'year': y})
        else:
            b, yr = y
            out.append({'year': yr, 'board': {'ts': 'ts_ipe', 'ap': 'ap_ipe'}[b]})
    return out


def Q(unit, slug, qtype, ref, gno, page, text, split, steps,
      years=None, insider=None, note_extra=None, time_min=None):
    """One card. `ref` is the manifest ref (e.g. 'saq1'); `gno` the book's GLOBAL question
    number — what every hit list and guess paper cites as P <page>(<gno>)."""
    # Guard against the one authoring slip that bit this track three times: writing
    # `note_extra=` in the middle of a call, before the positional `insider`, which
    # Python rejects as a SyntaxError with an unhelpful pointer at the LAST line.
    assert isinstance(text, str), f'{slug}: question_text must be a string'
    assert insider is None or isinstance(insider, str), f'{slug}: insider must be a string'
    assert isinstance(steps, list), f'{slug}: steps must be a list'
    assert isinstance(split, list), f'{slug}: mark_split must be a list of (label, marks)'
    uname, abbr, chapter = UNITS[unit]
    marks, section, tmin = QTYPE[qtype]
    qid = f'{PREFIX}_{abbr}_{slug}'
    assert sum(s['marks'] for s in steps) == marks, \
        f'{qid}: steps sum to {sum(s["marks"] for s in steps)}, marks_total is {marks}'
    assert sum(x[1] for x in split) == marks, f'{qid}: mark_split sums to {sum(x[1] for x in split)}'
    ids = [s['id'] for s in steps]
    assert len(ids) == len(set(ids)), f'{qid}: duplicate step id'
    assert re.fullmatch(r'[a-z0-9_]+', qid), qid
    note = VERIFY_BASE.format(page=page, gno=gno)
    if note_extra:
        note = note + ' ' + note_extra
    q = {
        'schema_version': 'answer_book_v1',
        'question_id': qid,
        'board': 'ts_ipe',
        'board_label': 'Telangana — Board of Intermediate Education',
        'subject': SUBJECT,
        'year_cycle': 'second_year',
        'class_label': 'Intermediate II Year (Class 12)',
        'unit': {'number': unit, 'name': uname},
        'chapter': chapter,
        'qtype': qtype,
        'marks_total': marks,
        'paper_section': section,
        'expected_time_min': time_min or tmin,
        'question_text': text,
        'appearances': _years(years),
        'mark_split': [{'label': l, 'marks': m} for l, m in split],
        'verification': {'status': 'unverified', 'needs_teacher_verification': True, 'note': note},
    }
    if insider:
        q['insider_note'] = insider
    q['answer'] = {'page_header': [HEADER[qtype], f'{uname} \u00b7 {marks} marks'], 'steps': steps}
    # the manifest fragment row. stars is 0 on EVERY botany-II entry: this book ranks
    # CHAPTERS (the ** / *** on section headers), never individual questions, exactly
    # as the junior zoology book does. Do not invent a per-question rank.
    row = {'ref': ref, 'section': qtype, 'number': gno, 'stars': 0,
           'text': text, 'question_id': qid}
    return q, row, unit


def write(cards, unit_no, dry=True):
    uname, abbr, _ = UNITS[unit_no]
    os.makedirs(FRAGDIR, exist_ok=True)
    rows = []
    for q, row, u in cards:
        assert u == unit_no, f'{q["question_id"]} is unit {u}, not {unit_no}'
        rows.append(row)
        p = os.path.join(QDIR, q['question_id'] + '.json')
        if not dry:
            with open(p, 'w', encoding='utf8') as fh:
                json.dump(q, fh, indent=2, ensure_ascii=False)
                fh.write('\n')
    refs = [r['ref'] for r in rows]
    assert len(refs) == len(set(refs)), f'unit {unit_no}: duplicate ref'
    frag = {'number': unit_no, 'name': uname, 'subject': SUBJECT, 'questions': rows}
    fp = os.path.join(FRAGDIR, f'unit_{unit_no:02d}.json')
    if not dry:
        with open(fp, 'w', encoding='utf8') as fh:
            json.dump(frag, fh, indent=2, ensure_ascii=False)
            fh.write('\n')
    n_v = sum(1 for r in rows if r['section'] == 'VSAQ')
    n_s = sum(1 for r in rows if r['section'] == 'SAQ')
    n_l = sum(1 for r in rows if r['section'] == 'LAQ')
    print(f'unit {unit_no:2d} {uname:52s} {len(rows):3d} cards '
          f'({n_v} VSAQ, {n_s} SAQ, {n_l} LAQ)' + ('' if dry else '  — WRITTEN'))
    return frag


def main(cards, unit_no):
    write(cards, unit_no, dry='--write' not in sys.argv)
