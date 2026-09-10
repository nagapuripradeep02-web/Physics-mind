"""Run 10: the six toughest questions (one per exam x subject), solved by DeepSeek V4.1 Flash at every thinking
level and by Gemini 3.7 Flash, every worked solution kept in full.

"Toughest" = the question in each cell that the most model conditions missed across Runs 1-9 (disputed keys and
defective crops excluded; tiebreak = most thinking tokens). The six ids are fixed below with the run they came from.
Same student ask for all five calls of a question so the solutions are comparable.

usage: python scripts/model_probes/toughest_six.py run      -> docs/reports/model_probes/data/toughest_six/{sample.json,results.jsonl}
       python scripts/model_probes/toughest_six.py report   -> docs/reports/model_probes/toughest_six_2026_09_10.md (+ grid on stdout)
"""
import base64, io, json, os, sys
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
ARGV = sys.argv[1:]; sys.argv = ['x']
os.environ.setdefault('GEMINI_MODEL', 'gemini-3.7-flash')
import ds_probe as P
import gemini_probe as G

DATA = os.path.join(P.REPO, 'docs', 'reports', 'model_probes', 'data')
OUT = os.path.join(DATA, 'toughest_six')
REPORT = os.path.join(P.REPO, 'docs', 'reports', 'model_probes', 'toughest_six_2026_09_10.md')
PICKS = [  # (exam, subject, source run, id)
    ('EAPCET', 'physics', 'eapcet_figures', 'tg_eapcet_2021_20210805_an_q107'),
    ('EAPCET', 'chemistry', 'eapcet_figures', 'tg_eapcet_2021_20210805_an_q128'),
    ('EAPCET', 'maths', 'eapcet_text_2026_09_10', 'tg_eapcet_2023_20230513_fn_q051'),
    ('JEE Main 2024', 'physics', 'jee_figures', 'jm2024-01-feb-shift-1_phy_q34'),
    ('JEE Main 2024', 'chemistry', 'jee_figures', 'jm2024-04-apr-shift-2_che_q62'),
    ('JEE Main 2024', 'maths', 'jee_main_2026_09_10', 'jm2024-29-jan-shift-1_mat_q15'),   # mat_q03 ranked higher but its crop is cut off at the top
]
# cond names deliberately differ from Runs 1-9 so ds_probe.HAND (keyed by id|off/low/high/max) never applies here
CONDS = [('ds_off', None), ('ds_low', 'low'), ('ds_high', 'high'), ('ds_max', 'max'), ('gem37', None)]
ASK = P.ASKS[0]   # 'Please solve this question'


def sample():
    out = []
    for exam, subj, run, qid in PICKS:
        q = next(x for x in json.load(io.open(os.path.join(DATA, run, 'sample.json'), encoding='utf-8')) if x['id'] == qid)
        q = dict(q, exam=exam, set=run, photo_path=os.path.join(P.REPO, 'pdfs', 'probes', run, 'photos', os.path.basename(q['photo'])))
        assert q['subject'] == subj and os.path.exists(q['photo_path']), qid
        out.append(q)
    return out


def cmd_run():
    os.makedirs(OUT, exist_ok=True)
    qs = sample()
    json.dump(qs, io.open(os.path.join(OUT, 'sample.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    path = os.path.join(OUT, 'results.jsonl')
    done = set()
    if os.path.exists(path):
        done = {(json.loads(l)['id'], json.loads(l)['cond']) for l in io.open(path, encoding='utf-8') if '"error"' not in l}
    dk, gk = P.key(), G.gkey()
    out = io.open(path, 'a', encoding='utf-8')
    for q in qs:
        P.IMG = os.path.dirname(q['photo_path'])   # ds_probe.call() joins IMG with basename(photo)
        for cond, effort in CONDS:
            if (q['id'], cond) in done:
                continue
            if cond == 'gem37':
                img = base64.b64encode(open(q['photo_path'], 'rb').read()).decode()
                r = G.gemini(gk, [{'text': ASK}, {'inline_data': {'mime_type': 'image/jpeg', 'data': img}}], 16000)
            else:
                r = P.call(dk, q, (cond, effort), ASK)
            row = dict(id=q['id'], exam=q['exam'], subject=q['subject'], cond=cond, ask=ASK, answer=q['answer'], **r)
            out.write(json.dumps(row, ensure_ascii=False) + '\n'); out.flush()
            u = r.get('usage', {})
            think = u.get('thoughts') if cond == 'gem37' else (u.get('completion_tokens_details') or {}).get('reasoning_tokens', 0)
            print('%-9s %-8s %-36s %7dms think=%-6s out=%-6s %s' % (q['subject'], cond, q['id'], r.get('ms', 0), think, u.get('completion_tokens'), r.get('error', '')[:80]))
    print('run complete')


def verdict(r, q, H):
    k = '%s|%s' % (r['id'], r['cond'])
    if k in H.get('disputed', {}):
        return 'disputed', None
    got = H['hand'][k] if k in H.get('hand', {}) else P.grade(r, q)[0]
    if got is None:
        return 'no answer', None
    return ('RIGHT' if str(got) == str(q['answer']) else 'wrong'), got


def cost(r):
    u = r['usage']
    return G.gcost(u) if r['cond'] == 'gem37' else P.cost_usd(u, 'off')


def cmd_report():
    qs = {q['id']: q for q in json.load(io.open(os.path.join(OUT, 'sample.json'), encoding='utf-8'))}
    rows = [json.loads(l) for l in io.open(os.path.join(OUT, 'results.jsonl'), encoding='utf-8') if '"error"' not in l]
    hp = os.path.join(OUT, 'hand.json')
    H = json.load(io.open(hp, encoding='utf-8')) if os.path.exists(hp) else {'hand': {}, 'disputed': {}}
    by = {(r['id'], r['cond']): r for r in rows}
    md = ['# The six toughest questions — DeepSeek V4.1 Flash (off / low / high / max) vs Gemini 3.7 Flash (2026-09-10)', '',
          'One question per exam × subject: the item the most model conditions missed across Runs 1–9 of `docs/MODEL_PROBES.md` '
          '(disputed keys and defective crops excluded, tiebreak = most thinking tokens). Fresh draws, one call each, the same ask '
          '`"%s"` for all five, the photo as the only input. Grades: regex last-stated option + hand pass (`data/toughest_six/hand.json`). '
          'Costs off-peak; Gemini $0.75/$3.75 per M, thinking billed as output. DeepSeek worked solutions are the visible answer text '
          '(never the hidden reasoning stream).' % ASK, '']
    grid = ['| Exam | Subject | key | DS off | DS low | DS high | DS max | Gemini 3.7 |', '|---|---|---|---|---|---|---|---|']
    for exam, subj, run, qid in PICKS:
        q = qs[qid]
        cells = []
        md += ['---', '', '## %s · %s — `%s`' % (exam, subj, qid), '', 'Crop: `pdfs/probes/%s/photos/%s` · official key: **%s**' % (run, os.path.basename(q['photo']), q['answer']), '',
               '| mode | answer | verdict | thinking tokens | seconds | $ |', '|---|---|---|---|---|---|']
        for cond, _ in CONDS:
            r = by.get((qid, cond))
            if not r:
                cells.append('—'); md.append('| %s | — | not run | | | |' % cond); continue
            v, got = verdict(r, q, H)
            u = r['usage']
            think = u.get('thoughts', 0) if cond == 'gem37' else (u.get('completion_tokens_details') or {}).get('reasoning_tokens', 0)
            cells.append('%s %s' % ({'RIGHT': '✓', 'wrong': '✗', 'no answer': '∅', 'disputed': '?'}[v], got if got is not None else ''))
            md.append('| %s | %s | %s | %s | %.0f | %.4f |' % (cond, got if got is not None else '—', v, think, r['ms'] / 1000, cost(r)))
        grid.append('| %s | %s | %s | %s |' % (exam, subj, q['answer'], ' | '.join(cells)))
        for cond, _ in CONDS:
            r = by.get((qid, cond))
            if r:
                md += ['', '### %s — worked solution' % cond, '', (r.get('content') or '_(no answer — the thinking budget ran out)_').strip(), '']
    text = '\n'.join(md[:4] + grid + [''] + md[4:]) + '\n'
    io.open(REPORT, 'w', encoding='utf-8').write(text)
    print('\n'.join(grid)); print('\nwrote', REPORT)


if __name__ == '__main__':
    {'run': cmd_run, 'report': cmd_report}[ARGV[0] if ARGV else 'report']()
