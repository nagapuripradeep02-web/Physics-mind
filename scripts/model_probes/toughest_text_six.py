"""Run 14: the two toughest FIGURE-FREE JEE Main questions per subject, solved by DeepSeek V4.1 Flash in every
mode (thinking off, low, medium, high, max) and by Gemini 3.7 Flash, every worked solution kept in full.

Founder ask (2026-09-12): "test DeepSeek V4.1 Flash in all modes and Gemini 3.7 Flash; two problems from physics,
two from chemistry, two from mathematics, all without figures, the real toughest questions from JEE Main."

"Toughest" here is a teacher's judgment, not a model's: every figure-free question of the twenty JEE Main 2024
papers on disk (Allen-typed, key on the Ans. line, figure flag from jee_figure_select) is offered to a Claude
sub-agent per subject on the subscription, which shortlists the hardest and solves each shortlisted item
independently; a pick whose independent answer disagrees with the printed key is out (a disputed key is not a
hard question). The six ids are then fixed in PICKS. The question goes to the models as the paper crop (the way
Runs 1-10 measured; the crop stops above the Ans. line), with the one-line student ask.

usage: python scripts/model_probes/toughest_text_six.py candidates -> data/toughest_text_six/candidates_<subject>.json
       python scripts/model_probes/toughest_text_six.py crops      -> data/toughest_text_six/sample.json + pdfs/probes/toughest_text_six/photos/*.jpg
       python scripts/model_probes/toughest_text_six.py run        -> data/toughest_text_six/results.jsonl
       python scripts/model_probes/toughest_text_six.py report     -> docs/reports/model_probes/toughest_text_six_2026_09_12.md (+ grid on stdout)
"""
import base64, glob, io, json, os, sys, time
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
ARGV = sys.argv[1:]; sys.argv = ['x']
os.environ.setdefault('GEMINI_MODEL', 'gemini-3.7-flash')
import pymupdf
from PIL import Image
import ds_probe as P
import gemini_probe as G
import jee_figure_select as F

DATA = os.path.join(P.REPO, 'docs', 'reports', 'model_probes', 'data')
OUT = os.path.join(DATA, 'toughest_text_six')
IMG = os.path.join(P.REPO, 'pdfs', 'probes', 'toughest_text_six', 'photos')
REPORT = os.path.join(P.REPO, 'docs', 'reports', 'model_probes', 'toughest_text_six_2026_09_12.md')
PDFS = sorted(glob.glob('C:/Tutor/nta-source/jee-mains-2024/*.pdf'))
DPI = 220

# Filled after the teacher pass (see candidates -> the sub-agents' shortlists in the report).
PICKS = [   # (subject, id) — the two each teacher-agent recommended; key agreed on an independent solve, crop complete, no figure
    ('physics', 'jm2024-06-apr-shift-2_phy_q33'),    # travelling microscope: least count 0.001 cm, three vernier readings, real/apparent depth -> mu = 1.42
    ('physics', 'jm2024-04-apr-shift-1_phy_q45'),    # potentiometer with no open-circuit length: the memorised formula lands between two options; r = 0.3 ohm
    ('chemistry', 'jm2024-31-jan-shift-2_che_q62'),  # CaCO3 + MgCO3 mixture by loss of CO2: two equations, distractor swaps the masses
    ('chemistry', 'jm2024-06-apr-shift-1_che_q72'),  # order of absorbed wavenumber for four complexes: metal, oxidation state, CN and ligand strength combined
    ('maths', 'jm2024-01-feb-shift-1_mat_q14'),      # DE hiding a Bernoulli equation behind u = x + y; y at x = 1/sqrt2
    ('maths', 'jm2024-29-jan-shift-1_mat_q10'),      # integrand collapses to (1+t^2)/(1+t^4) in t = sin x; a limit condition fixes C
]

CONDS = [('ds_off', None), ('ds_low', 'low'), ('ds_medium', 'medium'), ('ds_high', 'high'), ('ds_max', 'max'), ('gem37', None)]
ASK = P.ASKS[0]   # 'Please solve this question'


def qid_of(it):
    return '%s_%s_q%02d' % (it['paper'].replace('jee-mains-', 'jm'), it['subject'][:3], it['qno'])


def all_items():
    """Every keyed question of every 2024 paper with its figure flag and the crop's text."""
    out, docs = [], {}
    for pdf in PDFS:
        doc, items = F.extract(pdf)
        docs[os.path.basename(pdf)[:-4]] = doc
        for it in items:
            page = doc[it['page']]
            it['text'] = page.get_text('text', clip=pymupdf.Rect(*it['clip'])).strip()
            it['id'] = qid_of(it)
            out.append(it)
    return docs, out


def cmd_candidates():
    os.makedirs(OUT, exist_ok=True)
    docs, items = all_items()
    allimg = os.path.join(os.path.dirname(IMG), 'all')
    os.makedirs(allimg, exist_ok=True)
    for s in ('physics', 'chemistry', 'maths'):
        pool = []
        for i in items:
            if i['subject'] != s or i['figure']:
                continue
            path = os.path.join(allimg, i['id'] + '.jpg')
            if not os.path.exists(path):
                crop(docs[i['paper']], i, path)
            pool.append(dict(id=i['id'], qtype=i['qtype'], key=i['answer'], text=i['text'], crop=path))
        json.dump(pool, io.open(os.path.join(OUT, 'candidates_%s.json' % s), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
        print(s, 'figure-free keyed questions:', len(pool), 'of', sum(1 for i in items if i['subject'] == s))


def crop(doc, it, path):
    page = doc[it['page']]
    pix = page.get_pixmap(dpi=DPI, clip=pymupdf.Rect(*it['clip']))
    img = Image.frombytes('RGB', (pix.width, pix.height), pix.samples)
    img.save(path, 'JPEG', quality=90)
    return os.path.getsize(path), img.size


def cmd_crops():
    assert PICKS, 'fill PICKS first'
    os.makedirs(IMG, exist_ok=True)
    docs, items = all_items()
    by = {i['id']: i for i in items}
    out = []
    for subj, qid in PICKS:
        it = by[qid]
        assert it['subject'] == subj and not it['figure'], qid
        path = os.path.join(IMG, qid + '.jpg')
        it['bytes'], size = crop(docs[it['paper']], it, path)
        out.append(dict(it, photo=path, size=size, question_en='', options_en=[], exam='JEE Main 2024'))
        print(qid, it['qtype'], 'key', it['answer'], size, it['bytes'], 'bytes')
    json.dump(out, io.open(os.path.join(OUT, 'sample.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)


def cmd_run():
    qs = json.load(io.open(os.path.join(OUT, 'sample.json'), encoding='utf-8'))
    path = os.path.join(OUT, 'results.jsonl')
    done = set()
    if os.path.exists(path):
        done = {(json.loads(l)['id'], json.loads(l)['cond']) for l in io.open(path, encoding='utf-8') if '"error"' not in l}
    dk, gk = P.key(), G.gkey()
    out = io.open(path, 'a', encoding='utf-8')
    P.IMG = IMG
    for q in qs:
        for cond, effort in CONDS:
            if (q['id'], cond) in done:
                continue
            if cond == 'gem37':
                img = base64.b64encode(open(q['photo'], 'rb').read()).decode()
                r = G.gemini(gk, [{'text': ASK}, {'inline_data': {'mime_type': 'image/jpeg', 'data': img}}], 16000)
            else:
                r = P.call(dk, q, (cond, effort), ASK)
            row = dict(id=q['id'], exam=q['exam'], subject=q['subject'], qtype=q['qtype'], cond=cond, ask=ASK, answer=q['answer'], **r)
            out.write(json.dumps(row, ensure_ascii=False) + '\n'); out.flush()
            u = r.get('usage', {}) or {}
            think = u.get('thoughts') if cond == 'gem37' else (u.get('completion_tokens_details') or {}).get('reasoning_tokens', 0)
            print('%-9s %-9s %-34s %7dms think=%-6s out=%-6s %s' % (q['subject'], cond, q['id'], r.get('ms', 0), think, u.get('completion_tokens'), (r.get('error') or '')[:100]), flush=True)
    print('run complete')


def cost(r):
    u = r.get('usage') or {}
    if r['cond'] == 'gem37':
        try:
            return G.gcost(u)
        except Exception:
            return 0.0
    return P.cost_usd(u, 'off')


# Hand grades where the automatic grader could not read a clear answer (each one read in full):
#   phy_q45 ds_off ends "the internal resistance of the battery is approximately 0.3 Ω" and never names option (4);
#   the option-text matcher also sees "0.2" inside the intermediate "0.285" and so refuses to choose.
HAND = {('jm2024-04-apr-shift-1_phy_q45', 'ds_off'): 4}


def verdict(r, q):
    if r.get('error'):
        return 'error', None
    got = HAND.get((r['id'], r['cond']), P.grade(r, q)[0])
    if got is None:
        return 'no answer', None
    return ('RIGHT' if str(got) == str(q['answer']) else 'wrong'), got


def cmd_report():
    qs = json.load(io.open(os.path.join(OUT, 'sample.json'), encoding='utf-8'))
    rows = [json.loads(l) for l in io.open(os.path.join(OUT, 'results.jsonl'), encoding='utf-8')]
    last = {}
    for r in rows:
        last[(r['id'], r['cond'])] = r
    conds = [c for c, _ in CONDS]
    grid = ['| Subject | Question | key | ' + ' | '.join(conds) + ' |', '|' + '---|' * (len(conds) + 3)]
    right = {c: 0 for c in conds}
    usd = {c: 0.0 for c in conds}; ms = {c: [] for c in conds}
    detail = []
    for q in qs:
        cells = []
        for c in conds:
            r = last.get((q['id'], c))
            if not r:
                cells.append('—'); continue
            v, got = verdict(r, q)
            u = r.get('usage') or {}
            think = u.get('thoughts') if c == 'gem37' else (u.get('completion_tokens_details') or {}).get('reasoning_tokens', 0)
            cap = (r.get('finish') == 'length') or (c == 'gem37' and r.get('finish') == 'MAX_TOKENS')
            mark = '✓' if v == 'RIGHT' else ('∅' if v in ('no answer', 'error') else '✗ %s' % got)
            cells.append('%s%s (%ds, %s think)' % (mark, ' cap' if cap else '', round(r.get('ms', 0) / 1000), think or 0))
            if v == 'RIGHT': right[c] += 1
            usd[c] += cost(r); ms[c].append(r.get('ms', 0))
            detail.append((q, c, r, v, got))
        grid.append('| %s | %s (%s) | %s | %s |' % (q['subject'], q['id'], q['qtype'], q['answer'], ' | '.join(cells)))
    grid.append('| **right of %d** | | | %s |' % (len(qs), ' | '.join('**%d**' % right[c] for c in conds)))
    costs = ['| | $ for the six | avg latency |', '|---|---|---|'] + ['| %s | $%.3f | %d s |' % (c, usd[c], (sum(ms[c]) / len(ms[c]) / 1000) if ms[c] else 0) for c in conds]
    print('\n'.join(grid)); print(); print('\n'.join(costs))
    with io.open(REPORT, 'w', encoding='utf-8') as f:
        f.write('# Run 14 — the six toughest figure-free JEE Main 2024 questions, DeepSeek V4.1 Flash in every mode and Gemini 3.7 Flash (2026-09-12)\n\n')
        f.write('Every worked solution verbatim. Script `scripts/model_probes/toughest_text_six.py`; data `docs/reports/model_probes/data/toughest_text_six/`. Ask: "%s". The models see the paper crop (no key on it).\n\n' % ASK)
        f.write('\n'.join(grid) + '\n\n' + '\n'.join(costs) + '\n\n')
        for q in qs:
            f.write('---\n\n## %s — %s (%s), key %s\n\n' % (q['subject'], q['id'], q['qtype'], q['answer']))
            f.write('```\n' + q['text'] + '\n```\n\n')
            for (qq, c, r, v, got) in detail:
                if qq['id'] != q['id']:
                    continue
                u = r.get('usage') or {}
                f.write('### %s — %s%s\n\n' % (c, v, (' (got %s)' % got) if got is not None and v != 'RIGHT' else ''))
                f.write('_%d s, finish %s, usage %s_\n\n' % (round(r.get('ms', 0) / 1000), r.get('finish'), json.dumps(u)))
                if r.get('error'):
                    f.write('ERROR: %s\n\n' % r['error'])
                f.write((r.get('content') or '').strip() + '\n\n')
    print('report', REPORT)


if __name__ == '__main__':
    cmd = ARGV[0] if ARGV else 'candidates'
    {'candidates': cmd_candidates, 'crops': cmd_crops, 'run': cmd_run, 'report': cmd_report}[cmd]()
