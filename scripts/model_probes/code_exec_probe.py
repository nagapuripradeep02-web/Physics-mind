"""Run 11: does giving the model a Python sandbox fix the misses? Gemini 3.7 Flash with its built-in
`code_execution` tool ON, same photos, same one-line ask, against the same model with it OFF.

Sets:
  hard148  - the 148 figure/organic questions of Run 9 (code OFF baseline = data/chem_reader_37 gem_direct)
  maths    - JEE Main 2024 maths 30 + EAPCET maths 30 (Gemini never ran on these: both OFF and ON here)
  (the six of Run 10 are all inside those two sets; the report lists them separately against their Run 10 code-OFF row)
Every executed snippet and its output is kept in the row (`code`), so the report can show the working.

usage: python scripts/model_probes/code_exec_probe.py run [workers]   |   report [--list]
"""
import base64, collections, io, json, os, sys, threading, time, urllib.request
from concurrent.futures import ThreadPoolExecutor
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
ARGV = sys.argv[1:]; sys.argv = ['x']
os.environ.setdefault('GEMINI_MODEL', 'gemini-3.7-flash')
import ds_probe as P
import gemini_probe as G

DATA = os.path.join(P.REPO, 'docs', 'reports', 'model_probes', 'data')
OUT = os.path.join(DATA, 'code_exec')
ASK = P.ASKS[0]
STOP = threading.Event()


def questions():
    out = []
    for run, subj in [('jee_main_2026_09_10', 'chemistry'), ('jee_figures', 'chemistry'), ('eapcet_figures', 'chemistry'), ('eapcet_figures', 'physics'), ('jee_figures', 'physics'),
                      ('jee_main_2026_09_10', 'maths'), ('eapcet_text_2026_09_10', 'maths')]:
        hp = os.path.join(DATA, run, 'hand.json')
        excluded = json.load(io.open(hp, encoding='utf-8')).get('excluded', {}) if os.path.exists(hp) else {}
        if run == 'jee_main_2026_09_10':
            excluded = dict(excluded, **{'jm2024-09-apr-shift-2_che_q70': 'cut-off crop'})
        for q in json.load(io.open(os.path.join(DATA, run, 'sample.json'), encoding='utf-8')):
            if q['subject'] != subj or q['id'] in excluded:
                continue
            q = dict(q, set=run, group='maths' if subj == 'maths' else 'hard148', conds=['gem_direct', 'gem_code'] if subj == 'maths' else ['gem_code'])
            q['photo_path'] = os.path.join(P.REPO, 'pdfs', 'probes', run, 'photos', os.path.basename(q['photo']))
            out.append(q)
    return out


def gemini(key, parts, code, max_out=16000):
    body = {'contents': [{'parts': parts}], 'generationConfig': {'maxOutputTokens': max_out}}
    if code:
        body['tools'] = [{'code_execution': {}}]
    req = urllib.request.Request('https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent?key=%s' % (G.GEMINI, key),
                                 data=json.dumps(body).encode(), headers={'Content-Type': 'application/json'})
    for attempt in range(6):
        t = time.time()
        try:
            with urllib.request.urlopen(req, timeout=600) as r:
                j = json.load(r)
            c = j['candidates'][0]
            txt, snippets = [], []
            for p in c.get('content', {}).get('parts', []):
                if p.get('thought'):
                    continue
                if 'text' in p:
                    txt.append(p['text'])
                elif 'executableCode' in p:
                    snippets.append({'code': p['executableCode'].get('code', ''), 'lang': p['executableCode'].get('language')})
                elif 'codeExecutionResult' in p:
                    (snippets[-1] if snippets else snippets.append({}) or snippets[-1]).update(outcome=p['codeExecutionResult'].get('outcome'), output=p['codeExecutionResult'].get('output', ''))
            u = j.get('usageMetadata', {})
            return {'content': ''.join(txt), 'code': snippets, 'finish': c.get('finishReason'), 'ms': int((time.time() - t) * 1000), 'model': j.get('modelVersion'),
                    'usage': {'prompt_tokens': u.get('promptTokenCount', 0), 'completion_tokens': u.get('candidatesTokenCount', 0) + u.get('thoughtsTokenCount', 0),
                              'thoughts': u.get('thoughtsTokenCount', 0), 'candidates': u.get('candidatesTokenCount', 0), 'tool_prompt': u.get('toolUsePromptTokenCount', 0)}}
        except urllib.error.HTTPError as e:
            msg = e.read().decode()
            if e.code == 429 and 'PerDay' in msg:
                STOP.set()
                return {'error': 'HTTP 429 daily quota'}
            if e.code in (429, 503, 500) and attempt < 5:
                time.sleep(15 * (attempt + 1)); continue
            return {'error': 'HTTP %d %s' % (e.code, msg[:300].replace('\n', ' '))}
        except Exception as e:  # noqa
            if attempt < 5:
                time.sleep(10); continue
            return {'error': repr(e)}


def cmd_run(workers):
    os.makedirs(OUT, exist_ok=True)
    qs = questions()
    json.dump(qs, io.open(os.path.join(OUT, 'sample.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    path = os.path.join(OUT, 'results.jsonl')
    done = set()
    if os.path.exists(path):
        done = {(json.loads(l)['id'], json.loads(l)['cond']) for l in io.open(path, encoding='utf-8') if '"error"' not in l}
    gk = G.gkey()
    lock = threading.Lock()
    out = io.open(path, 'a', encoding='utf-8')
    todo = [(q, c) for q in qs for c in q['conds'] if (q['id'], c) not in done]
    print('calls to make', len(todo), collections.Counter((q['group'], c) for q, c in todo))

    def work(item):
        q, cond = item
        if STOP.is_set():
            return
        img = base64.b64encode(open(q['photo_path'], 'rb').read()).decode()
        r = gemini(gk, [{'text': ASK}, {'inline_data': {'mime_type': 'image/jpeg', 'data': img}}], code=(cond == 'gem_code'))
        row = dict(id=q['id'], set=q['set'], group=q['group'], subject=q['subject'], cond=cond, ask=ASK, answer=q['answer'], **r)
        with lock:
            out.write(json.dumps(row, ensure_ascii=False) + '\n'); out.flush()
            print('%-9s %-9s %-10s %-36s %7dms think=%-5s code=%d %s' % (q['group'], q['subject'], cond, q['id'], r.get('ms', 0), (r.get('usage') or {}).get('thoughts'), len(r.get('code') or []), r.get('error', '')[:80]))

    with ThreadPoolExecutor(workers) as ex:
        list(ex.map(work, todo))
    print('run complete' if not STOP.is_set() else 'run STOPPED on the daily quota')


def gcost(u):   # tool re-fed context (toolUsePromptTokenCount) is billed at the INPUT rate
    return ((u['prompt_tokens'] + u.get('tool_prompt', 0)) * G.GPRICE['in'] + u['completion_tokens'] * G.GPRICE['out']) / 1e6


def verdict(r, q, H):
    k = '%s|%s' % (r['id'], r['cond'])
    if k in H.get('disputed', {}):
        return 'disp', None
    got = H['hand'][k] if k in H.get('hand', {}) else P.grade(dict(r, cond=r['cond']), q)[0]
    if got is None:
        return 'none', None
    return ('OK' if str(got) == str(q['answer']) else 'XX'), got


def cmd_report():
    qs = {q['id']: q for q in questions()}
    rows = [json.loads(l) for l in io.open(os.path.join(OUT, 'results.jsonl'), encoding='utf-8') if '"error"' not in l]
    hp = os.path.join(OUT, 'hand.json')
    H = json.load(io.open(hp, encoding='utf-8')) if os.path.exists(hp) else {'hand': {}, 'disputed': {}}
    listing = '--list' in ARGV
    # code-OFF baselines from earlier runs
    base = {}
    for run, cond in (('chem_reader_37', 'gem_direct'),):   # Run 9, code OFF, same photos
        bp = os.path.join(DATA, run, 'results.jsonl'); bh = os.path.join(DATA, run, 'hand.json')
        BH = json.load(io.open(bh, encoding='utf-8')) if os.path.exists(bh) else {'hand': {}, 'disputed': {}}
        for l in io.open(bp, encoding='utf-8'):
            r = json.loads(l)
            if r.get('cond') == cond and not r.get('error'):
                base[r['id']] = verdict(r, qs[r['id']], BH)[0] if r['id'] in qs else None
    rows += []
    print('%-9s %-22s %-9s %-10s %3s %5s %5s %4s %4s | %6s %5s | %6s | %8s' % ('group', 'set', 'subject', 'cond', 'n', 'right', 'wrong', 'none', 'disp', 'think', 'code%', 'avg s', '$/q'))
    for group in ('hard148', 'maths'):
        for set_ in sorted({q['set'] for q in qs.values() if q['group'] == group}):
            for subj in ('physics', 'chemistry', 'maths'):
                for cond in ('gem_direct', 'gem_code'):
                    rs = [r for r in rows if r['group'] == group and r['set'] == set_ and r['subject'] == subj and r['cond'] == cond and r['id'] not in H.get('excluded', {})]
                    if cond == 'gem_direct' and not rs and group != 'maths':
                        ids = [i for i, q in qs.items() if q['group'] == group and q['set'] == set_ and q['subject'] == subj and i in base]
                        if ids:
                            vs = [base[i] for i in ids]
                            print('%-9s %-22s %-9s %-10s %3d %5d %5d %4d %4d | %6s %5s | %6s | %8s' % (group, set_, subj, 'OFF (prev)', len(vs), vs.count('OK'), vs.count('XX'), vs.count('none'), vs.count('disp'), '', '', '', ''))
                        continue
                    if not rs:
                        continue
                    vs = [verdict(r, qs[r['id']], H) for r in rs]
                    think = sum(r['usage']['thoughts'] for r in rs) / len(rs)
                    used = sum(1 for r in rs if r.get('code')) / len(rs) * 100
                    cost = sum(gcost(r['usage']) for r in rs) / len(rs)
                    c = collections.Counter(v[0] for v in vs)
                    print('%-9s %-22s %-9s %-10s %3d %5d %5d %4d %4d | %6.0f %5.0f | %6.1f | %8.5f' % (group, set_, subj, cond, len(rs), c['OK'], c['XX'], c['none'], c['disp'], think, used, sum(r['ms'] for r in rs) / len(rs) / 1000, cost))
                    if listing:
                        for r, v in zip(rs, vs):
                            if v[0] != 'OK':
                                print('   NONRIGHT %-36s %-10s key=%-4s got=%-6s prev=%-4s code=%d | %s' % (r['id'], cond, qs[r['id']]['answer'], v[1], base.get(r['id'], '-'), len(r.get('code') or []), (r.get('content') or '')[-170:].replace('\n', ' ')))

    print()
    print('the six toughest (Run 10 code OFF -> code ON):')
    six = json.load(io.open(os.path.join(DATA, 'toughest_six', 'sample.json'), encoding='utf-8'))
    sixH = json.load(io.open(os.path.join(DATA, 'toughest_six', 'hand.json'), encoding='utf-8'))
    off = {json.loads(l)['id']: json.loads(l) for l in io.open(os.path.join(DATA, 'toughest_six', 'results.jsonl'), encoding='utf-8') if '"cond": "gem37"' in l}
    on = {r['id']: r for r in rows if r['cond'] == 'gem_code'}
    for q in six:
        a = verdict(off[q['id']], q, sixH) if q['id'] in off else ('-', None)
        b = verdict(on[q['id']], q, H) if q['id'] in on else ('-', None)
        print('   %-14s %-9s %-36s key=%-3s OFF %-4s %-5s ON %-4s %-5s code=%d' % (q['exam'], q['subject'], q['id'], q['answer'], a[0], a[1], b[0], b[1], len((on.get(q['id']) or {}).get('code') or [])))


if __name__ == '__main__':
    cmd = ARGV[0] if ARGV else 'report'
    if cmd == 'run':
        cmd_run(int(ARGV[1]) if len(ARGV) > 1 else 3)
    else:
        cmd_report()
