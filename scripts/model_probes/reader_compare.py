"""Side-by-side of every reader run against the photo-only baseline.

For each question that at least one reader run covered, print what the model answered:
  ds_photo_<eff>  - DeepSeek V4.1 Flash straight from the photo (runs 2-4, the baseline)
  <reader>_direct - the Gemini reader answering from the photo itself
  <reader>_split  - Gemini transcribes, DeepSeek solves the transcript

Reader runs are directories named chem_reader* under docs/reports/model_probes/data/.
Grades: regex (ds_probe.grade) with each run's hand.json applied on top.

usage: python scripts/model_probes/reader_compare.py [--list]
"""
import collections, glob, io, json, os, sys
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
ARGV = sys.argv[1:]; sys.argv = ['x']
import ds_probe as P

DATA = os.path.join(P.REPO, 'docs', 'reports', 'model_probes', 'data')
BASE = ['jee_main_2026_09_10', 'jee_figures', 'eapcet_figures']


def load(run):
    p = os.path.join(DATA, run, 'results.jsonl')
    if not os.path.exists(p):
        return [], {}
    rows = [json.loads(l) for l in io.open(p, encoding='utf-8') if '"error"' not in l]
    hp = os.path.join(DATA, run, 'hand.json')
    H = json.load(io.open(hp, encoding='utf-8')) if os.path.exists(hp) else {'hand': {}, 'disputed': {}, 'excluded': {}}
    return rows, H


def verdict(r, q, H, cond=None):
    c = cond or r['cond']
    k = '%s|%s' % (r['id'], c)
    if r['id'] in H.get('excluded', {}):
        return 'excl', None
    if k in H.get('disputed', {}):
        return 'disp', None
    got = H['hand'][k] if k in H.get('hand', {}) else P.grade(dict(r, cond=c), q)[0]
    if got is None:
        return 'none', None
    return ('OK' if str(got) == str(q['answer']) else 'XX'), got


def main():
    qs, base = {}, {}
    for run in BASE:
        rows, H = load(run)
        for x in json.load(io.open(os.path.join(DATA, run, 'sample.json'), encoding='utf-8')):
            x['set'] = run; qs[x['id']] = x
        for r in rows:
            base.setdefault(r['id'], {})[r['cond']] = (r, H)
    readers = {}
    for d in sorted(glob.glob(os.path.join(DATA, 'chem_reader*'))):
        run = os.path.basename(d)
        rows, H = load(run)
        model = next((r.get('reader') for r in rows if r.get('reader')), run)
        for r in rows:
            readers.setdefault(run, {}).setdefault(r['id'], {})[r['cond']] = (r, H)
        readers.setdefault(run, {})['_model'] = model
    names = [n for n in readers if readers[n]]
    ids = sorted({i for n in names for i in readers[n] if i != '_model'}, key=lambda i: (qs[i]['set'], i))
    hdr = '%-34s %-4s %-26s' % ('question', 'key', 'DeepSeek from photo off/low/high/max')
    for n in names:
        hdr += ' | %-22s' % (readers[n]['_model'] + ' direct/split')
    print(hdr)
    tally = collections.Counter()
    for i in ids:
        q = qs[i]
        ph = ''.join((verdict(base[i][c][0], q, base[i][c][1])[0] if c in base.get(i, {}) else '--').ljust(5) for c in ('off', 'low', 'high', 'max'))
        line = '%-34s %-4s %-26s' % (i.replace('tg_eapcet_', 'ep_').replace('jm2024-', ''), q['answer'], ph)
        for n in names:
            d = readers[n].get(i, {})
            cells = []
            for c in ('gem_direct', 'ds_on_read'):
                if c not in d:
                    cells.append('--'); continue
                v, got = verdict(d[c][0], q, d[c][1])
                cells.append(v)
                tally[(n, c, v)] += 1
            line += ' | %-22s' % ('%-6s %-6s' % tuple(cells))
        print(line)
    print()
    for n in names:
        for c in ('gem_direct', 'ds_on_read'):
            t = {v: tally[(n, c, v)] for v in ('OK', 'XX', 'none', 'disp')}
            n_tot = sum(t.values())
            if n_tot:
                print('%-22s %-11s right %2d / %2d   wrong %2d   no-answer %d   disputed %d' % (readers[n]['_model'], c, t['OK'], n_tot, t['XX'], t['none'], t['disp']))
    # the same questions, DeepSeek from the photo, for a fair denominator
    covered = [i for i in ids]
    for c in ('off', 'low', 'high', 'max'):
        vs = [verdict(base[i][c][0], qs[i], base[i][c][1])[0] for i in covered if c in base.get(i, {})]
        if vs:
            print('%-22s %-11s right %2d / %2d' % ('deepseek-flash photo', c, vs.count('OK'), len(vs)))


if __name__ == '__main__':
    main()
