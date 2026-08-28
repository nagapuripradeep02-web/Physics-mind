#!/usr/bin/env python
"""Merge one subject's unit fragments into answer-book/units.json.

Orchestrator-only. Chapter/unit agents write fragments (`unit_<NN>.json`, one
per unit, in a scratch directory); this merges them sequentially — parallel
writes to units.json would collide. It validates BOTH directions (listed-but-
missing, authored-but-unlisted), cross-bank question_id collisions, per-file
subject/unit agreement, and refuses to write unless re-serialising the CURRENT
units.json reproduces it byte-for-byte — so it can only ever touch this
subject's units.

Usage:
  python answer-book/tools/merge_units.py --subject zoology --prefix ts_ipe_z1 \
      --suffix "(Zoology)" --fragments <dir> [--stars-zero] [--no-appearances] [--write]

Without --write it is a dry run that reports and changes nothing.
  --stars-zero      the book prints no per-question star ranks: every entry must have stars 0
  --no-appearances  the book cites no years: every file must have appearances []
"""
import json, io, os, sys, glob, re, argparse

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
UNITS = os.path.join(ROOT, 'answer-book', 'units.json')
QDIR = os.path.join(ROOT, 'answer-book', 'questions')

ap = argparse.ArgumentParser()
ap.add_argument('--subject', required=True)
ap.add_argument('--prefix', required=True, help='question_id prefix, e.g. ts_ipe_z1')
ap.add_argument('--suffix', required=True, help='unit-name suffix, e.g. "(Zoology)"')
ap.add_argument('--fragments', required=True, help='directory holding unit_*.json fragments')
ap.add_argument('--stars-zero', action='store_true')
ap.add_argument('--no-appearances', action='store_true')
ap.add_argument('--write', action='store_true')
A = ap.parse_args()

def load(p):
    return json.load(io.open(p, encoding='utf-8'))

errs, warns = [], []

# ── 0. units.json must round-trip byte-identically, or we cannot touch it ────
raw = io.open(UNITS, 'rb').read()
existing = json.loads(raw.decode('utf-8'))
rt = (json.dumps(existing, indent=2, ensure_ascii=False) + '\n').replace('\n', '\r\n').encode('utf-8')
if rt != raw:
    # try LF endings before giving up
    rt_lf = (json.dumps(existing, indent=2, ensure_ascii=False) + '\n').encode('utf-8')
    if rt_lf == raw:
        NEWLINE = '\n'
    else:
        print('units.json does not round-trip byte-identically through json.dumps(indent=2) — refusing: '
              'a merge would rewrite units that are not ours.')
        sys.exit(1)
else:
    NEWLINE = '\r\n'

# ── 1. load fragments ────────────────────────────────────────────────────────
frags = []
for p in sorted(glob.glob(os.path.join(A.fragments, 'unit_*.json'))):
    try:
        frags.append((os.path.basename(p), load(p)))
    except Exception as e:
        errs.append(f'{os.path.basename(p)}: unreadable JSON — {e}')
if not frags:
    print('no fragments found in', A.fragments)
    sys.exit(1)
print(f'fragments found: {len(frags)}')

# ── 2. per-fragment shape + file existence ───────────────────────────────────
seen_ids, seen_units = {}, {}
total_entries = 0
id_re = re.compile(r'^' + re.escape(A.prefix) + r'_[a-z0-9_]+$')
for name, u in frags:
    for k in ('number', 'name', 'subject', 'questions'):
        if k not in u:
            errs.append(f'{name}: missing key "{k}"')
    if u.get('subject') != A.subject:
        errs.append(f'{name}: subject is {u.get("subject")!r}, expected {A.subject!r}')
    n = u.get('number')
    if n in seen_units:
        errs.append(f'{name}: unit number {n} already used by {seen_units[n]}')
    seen_units[n] = name
    if not str(u.get('name', '')).endswith(A.suffix):
        warns.append(f'{name}: unit name {u.get("name")!r} does not end with {A.suffix!r}')

    refs = set()
    for e in u.get('questions', []):
        total_entries += 1
        for k in ('ref', 'section', 'number', 'stars', 'text'):
            if k not in e:
                errs.append(f'{name}/{e.get("ref","?")}: missing "{k}"')
        if A.stars_zero and e.get('stars') != 0:
            errs.append(f'{name}/{e.get("ref")}: stars={e.get("stars")} — this book prints no per-question star ranks, must be 0')
        if e.get('section') not in ('VSAQ', 'SAQ', 'LAQ'):
            errs.append(f'{name}/{e.get("ref")}: bad section {e.get("section")!r}')
        r = e.get('ref')
        if r in refs:
            errs.append(f'{name}: duplicate ref {r!r}')
        refs.add(r)
        qid = e.get('question_id')
        if not qid:
            warns.append(f'{name}/{r}: no question_id (renders as coming-soon)')
            continue
        if not id_re.match(qid):
            errs.append(f'{name}/{r}: question_id {qid!r} does not match {A.prefix}_*')
        if qid in seen_ids:
            errs.append(f'question_id {qid!r} claimed twice: {seen_ids[qid]} and {name}')
        seen_ids[qid] = name
        if not os.path.exists(os.path.join(QDIR, qid + '.json')):
            errs.append(f'{name}/{r}: listed {qid} but {qid}.json does not exist')

# ── 3. authored-but-unlisted (the other direction) ───────────────────────────
on_disk = {os.path.basename(p)[:-5] for p in glob.glob(os.path.join(QDIR, A.prefix + '_*.json'))}
for qid in sorted(on_disk - set(seen_ids)):
    errs.append(f'{qid}.json exists on disk but no fragment lists it')

# ── 4. cross-bank collision against the existing bank ────────────────────────
bank_ids = set()
for u in existing['units']:
    if u.get('subject') == A.subject:
        continue   # our own units are replaced wholesale on merge
    for e in u['questions']:
        if e.get('question_id'):
            bank_ids.add(e['question_id'])
for c in sorted(bank_ids & set(seen_ids)):
    errs.append(f'question_id {c!r} already exists in another subject of the bank')

# ── 5. per-file sanity ───────────────────────────────────────────────────────
unit_of = {}
for name, u in frags:
    for e in u.get('questions', []):
        if e.get('question_id'):
            unit_of[e['question_id']] = (u['number'], u['name'], name)
for qid in sorted(on_disk):
    try:
        q = load(os.path.join(QDIR, qid + '.json'))
    except Exception as e:
        errs.append(f'{qid}.json: unreadable — {e}')
        continue
    if q.get('question_id') != qid:
        errs.append(f'{qid}.json: question_id field is {q.get("question_id")!r}')
    if q.get('subject') != A.subject:
        errs.append(f'{qid}.json: subject is {q.get("subject")!r}')
    if qid in unit_of:
        n, nm, frag = unit_of[qid]
        if q.get('unit', {}).get('number') != n:
            errs.append(f'{qid}.json: unit.number {q.get("unit", {}).get("number")} != fragment {n} ({frag})')
    if not q.get('verification', {}).get('needs_teacher_verification'):
        errs.append(f'{qid}.json: needs_teacher_verification must be true')
    if A.no_appearances and q.get('appearances'):
        errs.append(f'{qid}.json: appearances must be [] — this book cites no years')

# ── report ───────────────────────────────────────────────────────────────────
print(f'units: {len(frags)}   entries: {total_entries}   files on disk: {len(on_disk)}')
if warns:
    print(f'\n{len(warns)} warning(s):')
    for w in warns[:40]:
        print('  ~', w)
if errs:
    print(f'\n{len(errs)} ERROR(s):')
    for e in errs[:80]:
        print('  -', e)
    print('\nrefusing to merge.')
    sys.exit(1)

print('\nall checks pass.')
if not A.write:
    print('(dry run — pass --write to merge)')
    sys.exit(0)

# ── merge: replace this subject's units wholesale, leave every other byte alone ──
existing['units'] = [u for u in existing['units'] if u.get('subject') != A.subject]
for name, u in sorted(frags, key=lambda t: t[1]['number']):
    existing['units'].append({
        'number': u['number'], 'name': u['name'], 'subject': A.subject,
        'questions': u['questions'],
    })
io.open(UNITS, 'w', encoding='utf-8', newline=NEWLINE).write(
    json.dumps(existing, indent=2, ensure_ascii=False) + '\n')
print(f'merged {len(frags)} {A.subject} units / {total_entries} entries into units.json')
