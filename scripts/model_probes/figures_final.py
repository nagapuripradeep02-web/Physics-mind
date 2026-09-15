"""Final table for a probe run: regex grade + the hand grades recorded in <run>/hand.json.

hand.json = {"hand": {"<id>|<cond>": <answer>}, "disputed": {"<id>|<cond>": "<why>"}, "excluded": {"<id>": "<why>"}}
A disputed row is one where the model's answer is defensible and the key is not; an excluded
question is a defective crop. Neither is ever counted as wrong.

usage: DS_PROBE_OUT=<run> python scripts/model_probes/figures_final.py [--list]   (--list prints every non-right row for the hand pass)
"""
import io, json, os, statistics as st, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
argv = sys.argv[1:]
sys.argv = ['x']
import ds_probe as P

qs = {q['id']: q for q in json.load(io.open(os.path.join(P.OUT, 'sample.json'), encoding='utf-8'))}
rows = [json.loads(l) for l in io.open(os.path.join(P.OUT, 'results.jsonl'), encoding='utf-8') if '"error"' not in l]
hp = os.path.join(P.OUT, 'hand.json')
H = json.load(io.open(hp, encoding='utf-8')) if os.path.exists(hp) else {'hand': {}, 'disputed': {}, 'excluded': {}}
CONDS = ['off', 'low', 'high', 'max']
SUBJECTS = [s for s in ('physics', 'chemistry', 'maths') if any(q['subject'] == s for q in qs.values())]


def verdict(r, q):
    k = '%s|%s' % (r['id'], r['cond'])
    if r['id'] in H['excluded']:
        return 'excluded', None
    if k in H['disputed']:
        return 'disputed', None
    got = H['hand'][k] if k in H['hand'] else P.grade(r, q)[0]
    if got is None:
        return 'noanswer', None
    return ('right' if str(got) == str(q['answer']) else 'wrong'), got


if '--list' in argv:
    for r in sorted(rows, key=lambda r: (qs[r['id']]['subject'], r['id'], r['cond'])):
        q = qs[r['id']]
        v, got = verdict(r, q)
        if v != 'right':
            print('%-36s %-4s key=%-5s got=%-6s %-9s | %s' % (r['id'], r['cond'], q['answer'], got, v, (r.get('content') or '')[-160:].replace('\n', ' ')))
    sys.exit()

print('%-10s %-5s %3s %5s %5s %4s | %6s %6s | %6s %6s | %9s %9s' % ('subject', 'mode', 'n', 'right', 'wrong', 'disp', 'think', 'out', 'avg s', 'p95 s', '$/q off', '$/q peak'))
tot = {c: dict(n=0, right=0, wrong=0, disp=0, cost_off=0, cost_pk=0, think=[], lat=[]) for c in CONDS}
wrongs = []
for s in SUBJECTS:
    for c in CONDS:
        rs = [r for r in rows if r['cond'] == c and qs[r['id']]['subject'] == s and r['id'] not in H['excluded']]
        v = [verdict(r, qs[r['id']]) for r in rs]
        n = len(rs)
        if not n:
            continue
        right = sum(1 for x in v if x[0] == 'right'); wrong = sum(1 for x in v if x[0] in ('wrong', 'noanswer')); disp = sum(1 for x in v if x[0] == 'disputed')
        think = [r['usage'].get('completion_tokens_details', {}).get('reasoning_tokens', 0) for r in rs]
        out = [r['usage']['completion_tokens'] for r in rs]
        lat = [r['ms'] / 1000 for r in rs]
        co = sum(P.cost_usd(r['usage'], 'off') for r in rs) / n; cp = sum(P.cost_usd(r['usage'], 'peak') for r in rs) / n
        print('%-10s %-5s %3d %5d %5d %4d | %6.0f %6.0f | %6.1f %6.1f | %9.5f %9.5f' % (s, c, n, right, wrong, disp, st.mean(think), st.mean(out), st.mean(lat), sorted(lat)[int(0.95 * (n - 1))], co, cp))
        t = tot[c]; t['n'] += n; t['right'] += right; t['wrong'] += wrong; t['disp'] += disp; t['cost_off'] += co * n; t['cost_pk'] += cp * n; t['think'] += think; t['lat'] += lat
        for r, (vv, got) in zip(rs, v):
            if vv in ('wrong', 'noanswer'):
                wrongs.append((s, c, r['id'], qs[r['id']]['answer'], got, vv))
    print()
n0 = tot['off']['n']
print('TOTAL per mode (of %d questions; excluded %d):' % (n0, len(H['excluded'])))
for c in CONDS:
    t = tot[c]; n = t['n']
    if n:
        print('  %-5s right %3d  wrong %2d  disputed %d | think avg %5.0f | p95 %5.1f s | per 600 q: $%.2f off-peak / $%.2f peak' % (c, t['right'], t['wrong'], t['disp'], st.mean(t['think']), sorted(t['lat'])[int(0.95 * (n - 1))], t['cost_off'] / n * 600, t['cost_pk'] / n * 600))
print('\nmodel errors:')
for w in wrongs:
    print('  ', w)
