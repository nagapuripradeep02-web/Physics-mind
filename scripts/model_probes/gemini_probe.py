"""Run 6: a stronger READER for drawings. Gemini 3.8 Flash on the chemistry crops (and the EAPCET physics
figures) three ways:
  gem_direct  - Gemini solves from the photo with the one-line student ask (its own default thinking)
  gem_read    - Gemini only TRANSCRIBES the photo: question text, every structure as SMILES + name exactly as
                drawn, every option (no solving)
  ds_on_read  - DeepSeek V4.1 Flash at `high` solves the g38_read transcript with the student ask

Same sets as Runs 2-4 (chemistry from jee_main / jee_figures / eapcet_figures, physics from eapcet_figures),
same asks, same grading (regex + hand.json). Resumable JSONL. Prices: Gemini 3.8 Flash $0.75 in / $3.75 out
per million (thinking billed as output; through 2026-12-31), DeepSeek as in ds_probe.PRICE.

usage: python scripts/model_probes/gemini_probe.py run [workers]   |   report   (DS_PROBE_OUT is fixed to chem_reader)
"""
import base64, collections, io, json, os, random, sys, threading, time, urllib.request
from concurrent.futures import ThreadPoolExecutor
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
ARGV = sys.argv[1:]; sys.argv = ['x']
import ds_probe as P

RUN = 'chem_reader'
OUT = os.path.join(P.REPO, 'docs', 'reports', 'model_probes', 'data', RUN)
GEMINI = os.environ.get('GEMINI_MODEL', 'gemini-3.8-flash')   # 3.6 / 3.7 / 3.8 Flash share one price
GPRICE = {'in': 0.75, 'out': 3.75}
SETS = [('jee_main_2026_09_10', 'chemistry'), ('jee_figures', 'chemistry'), ('eapcet_figures', 'chemistry'), ('eapcet_figures', 'physics')]
CONDS = ['gem_direct', 'gem_read', 'ds_on_read']
STOP = threading.Event()
# the items DeepSeek missed from the photo go first, so a small free-tier quota still answers the question
PRIORITY = ['08-apr-shift-1_che_q73', '30-jan-shift-2_che_q86', '09-apr-shift-2_che_q88', '29-jan-shift-1_che_q89', '31-jan-shift-2_che_q63',
            '30-jan-shift-2_che_q81', '04-apr-shift-2_che_q75', '01-feb-shift-2_che_q87', '01-feb-shift-1_che_q74',
            '08-apr-shift-2_che_q86', '30-jan-shift-1_che_q65', '27-jan-shift-1_che_q86', '08-apr-shift-2_che_q83', '04-apr-shift-2_che_q62', '04-apr-shift-2_che_q65',
            '2021_20210805_an_q128', '2022_20220718_an_q155', '2023_20230512_fn_q159', '2024_20240509_fn_q140', '2022_20220720_fn_q138', '2022_20220719_fn_q154', '2023_20230514_fn_q160',
            '2023_20230514_an_q108', '2023_20230514_an_q119', '2021_20210805_an_q107', '2022_20220718_an_q107', '2022_20220720_fn_q119', '2024_20240509_an_q107']
READ_PROMPT = ('Transcribe this exam question photo for a solver that cannot see images. Write, in order: '
               '(1) the question text exactly as printed; (2) every drawing as precise text - for a chemical structure give a SMILES string '
               'and a systematic name that states exactly what is drawn (count the double bonds, sp3 CH2 groups, charges, lone pairs and '
               'substituents as drawn; do not assume a ring is aromatic unless it is drawn with alternating double bonds); for a graph give the '
               'axes, every curve and every label; for a circuit or apparatus list every element, value and connection; for a table copy it; '
               '(3) every option with its printed label, transcribing any drawing in it the same way. Do not solve the question and do not '
               'give an answer.')


def gkey():
    for line in io.open(P.ENV, encoding='utf-8'):
        if line.startswith('GOOGLE_GENERATIVE_AI_API_KEY='):
            return line.split('=', 1)[1].strip().strip('"')
    sys.exit('no GOOGLE_GENERATIVE_AI_API_KEY')


def questions():
    out = []
    for run, subj in SETS:
        d = os.path.join(P.REPO, 'docs', 'reports', 'model_probes', 'data', run)
        hp = os.path.join(d, 'hand.json')
        excluded = json.load(io.open(hp, encoding='utf-8')).get('excluded', {}) if os.path.exists(hp) else {}
        if run == 'jee_main_2026_09_10':
            excluded = dict(excluded, **{'jm2024-09-apr-shift-2_che_q70': 'cut-off crop'})
        for q in json.load(io.open(d, 'sample.json') if False else io.open(os.path.join(d, 'sample.json'), encoding='utf-8')):
            if q['subject'] != subj or q['id'] in excluded:
                continue
            q = dict(q); q['set'] = run
            q['photo_path'] = os.path.join(P.REPO, 'pdfs', 'probes', run, 'photos', os.path.basename(q['photo']))
            out.append(q)
    def rank(q):
        for i, suf in enumerate(PRIORITY):
            if q['id'].endswith(suf):
                return i
        return len(PRIORITY)
    out.sort(key=rank)
    return out


def gemini(key, parts, max_out):
    body = {'contents': [{'parts': parts}], 'generationConfig': {'maxOutputTokens': max_out}}
    req = urllib.request.Request('https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent?key=%s' % (GEMINI, key),
                                 data=json.dumps(body).encode(), headers={'Content-Type': 'application/json'})
    for attempt in range(6):
        t = time.time()
        try:
            with urllib.request.urlopen(req, timeout=600) as r:
                j = json.load(r)
            c = j['candidates'][0]
            txt = ''.join(p.get('text', '') for p in c.get('content', {}).get('parts', []) if not p.get('thought'))
            u = j.get('usageMetadata', {})
            return {'content': txt, 'finish': c.get('finishReason'), 'ms': int((time.time() - t) * 1000), 'model': j.get('modelVersion'),
                    'usage': {'prompt_tokens': u.get('promptTokenCount', 0), 'completion_tokens': u.get('candidatesTokenCount', 0) + u.get('thoughtsTokenCount', 0),
                              'thoughts': u.get('thoughtsTokenCount', 0), 'candidates': u.get('candidatesTokenCount', 0)}}
        except urllib.error.HTTPError as e:
            msg = e.read().decode()
            if e.code == 429 and 'PerDay' in msg:
                STOP.set()
                return {'error': 'HTTP 429 daily quota: ' + ' '.join(sorted(set(w for w in msg.replace('"', ' ').split() if 'PerDay' in w)))}
            msg = msg[:300]
            if e.code in (429, 503, 500) and attempt < 5:
                time.sleep(15 * (attempt + 1)); continue
            return {'error': 'HTTP %d %s' % (e.code, msg.replace('\n', ' '))}
        except Exception as e:  # noqa
            if attempt < 5:
                time.sleep(10); continue
            return {'error': repr(e)}


def deepseek(key, text):
    body = {'model': P.MODEL, 'max_tokens': 32000, 'messages': [{'role': 'user', 'content': text}], 'thinking': {'type': 'enabled'}, 'reasoning_effort': 'high'}
    req = urllib.request.Request('https://api.deepseek.com/chat/completions', data=json.dumps(body).encode(),
                                 headers={'Authorization': 'Bearer ' + key, 'Content-Type': 'application/json'})
    for attempt in range(4):
        t = time.time()
        try:
            with urllib.request.urlopen(req, timeout=600) as r:
                j = json.load(r)
            m = j['choices'][0]['message']
            return {'content': m.get('content'), 'finish': j['choices'][0].get('finish_reason'), 'ms': int((time.time() - t) * 1000), 'usage': j['usage'], 'model': j.get('model')}
        except Exception as e:  # noqa
            if attempt < 3:
                time.sleep(10); continue
            return {'error': repr(e)}


def cmd_run(workers):
    os.makedirs(OUT, exist_ok=True)
    qs = questions()
    path = os.path.join(OUT, 'results.jsonl')
    done = {}
    if os.path.exists(path):
        for l in io.open(path, encoding='utf-8'):
            r = json.loads(l)
            if not r.get('error'):
                done[(r['id'], r['cond'])] = r
    gk, dk = gkey(), P.key()
    lock = threading.Lock()
    out = io.open(path, 'a', encoding='utf-8')
    print('questions', len(qs), collections.Counter((q['set'], q['subject']) for q in qs), 'already done', len(done))

    def work(q):
        if STOP.is_set():
            return
        img = base64.b64encode(open(q['photo_path'], 'rb').read()).decode()
        idx = qs.index(q)
        ask = P.ASKS[idx % len(P.ASKS)]
        image = {'inline_data': {'mime_type': 'image/jpeg', 'data': img}}
        rows = []
        if (q['id'], 'gem_direct') not in done:
            r = gemini(gk, [{'text': ask}, image], 16000)
            rows.append(dict(id=q['id'], set=q['set'], subject=q['subject'], cond='gem_direct', ask=ask, answer=q['answer'], reader=GEMINI, **r))
        if (q['id'], 'gem_read') in done:
            transcript = done[(q['id'], 'gem_read')]['content']
        else:
            r = gemini(gk, [{'text': READ_PROMPT}, image], 8000)
            rows.append(dict(id=q['id'], set=q['set'], subject=q['subject'], cond='gem_read', answer=q['answer'], reader=GEMINI, **r))
            transcript = r.get('content')
        if transcript and (q['id'], 'ds_on_read') not in done:
            r = deepseek(dk, ask + '\n\n' + transcript)
            rows.append(dict(id=q['id'], set=q['set'], subject=q['subject'], cond='ds_on_read', ask=ask, answer=q['answer'], **r))
        with lock:
            for row in rows:
                row['at'] = time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime())
                out.write(json.dumps(row, ensure_ascii=False) + '\n')
                print('%-9s %-11s %-38s %s' % (q['subject'], row['cond'], q['id'][-38:], row.get('error') or '%6dms out=%d' % (row['ms'], row['usage']['completion_tokens'])), flush=True)
            out.flush()

    with ThreadPoolExecutor(max_workers=workers) as ex:
        list(ex.map(work, qs))
    print('run complete' if not STOP.is_set() else 'run STOPPED on the daily quota')


def gcost(u):
    return (u['prompt_tokens'] * GPRICE['in'] + u['completion_tokens'] * GPRICE['out']) / 1e6


def cmd_report():
    qs = {q['id']: q for q in questions()}
    rows = [json.loads(l) for l in io.open(os.path.join(OUT, 'results.jsonl'), encoding='utf-8')]
    rows = [r for r in rows if not r.get('error')]
    hp = os.path.join(OUT, 'hand.json')
    H = json.load(io.open(hp, encoding='utf-8')) if os.path.exists(hp) else {'hand': {}, 'disputed': {}}
    listing = '--list' in ARGV
    print('%-22s %-9s %-11s %3s %5s %5s %4s | %6s %6s | %6s | %8s' % ('set', 'subject', 'cond', 'n', 'right', 'wrong', 'disp', 'think', 'out', 'avg s', '$/q'))
    for run, subj in SETS:
        for c in ('gem_direct', 'ds_on_read'):
            rs = [r for r in rows if r['set'] == run and r['subject'] == subj and r['cond'] == c]
            if not rs:
                continue
            right = wrong = disp = 0
            for r in rs:
                q = qs[r['id']]; k = '%s|%s' % (r['id'], c)
                if k in H['disputed']:
                    disp += 1; continue
                got = H['hand'][k] if k in H['hand'] else P.grade(dict(r, cond=c), q)[0]
                ok = got is not None and str(got) == str(q['answer'])
                right += ok; wrong += (not ok)
                if listing and not ok:
                    print('   NONRIGHT %-36s %-11s key=%-4s got=%-6s | %s' % (r['id'], c, q['answer'], got, (r.get('content') or '')[-170:].replace('\n', ' ')))
            think = sum((r['usage'].get('thoughts') if c == 'gem_direct' else r['usage'].get('completion_tokens_details', {}).get('reasoning_tokens', 0)) or 0 for r in rs) / len(rs)
            outt = sum(r['usage']['completion_tokens'] for r in rs) / len(rs)
            cost = sum(gcost(r['usage']) if c == 'gem_direct' else P.cost_usd(r['usage'], 'off') for r in rs) / len(rs)
            if c == 'ds_on_read':   # add the reader's cost
                reads = [r for r in rows if r['set'] == run and r['subject'] == subj and r['cond'] == 'gem_read']
                cost += sum(gcost(r['usage']) for r in reads) / max(1, len(reads))
            print('%-22s %-9s %-11s %3d %5d %5d %4d | %6.0f %6.0f | %6.1f | %8.5f' % (run, subj, c, len(rs), right, wrong, disp, think, outt, sum(r['ms'] for r in rs) / len(rs) / 1000, cost))


if __name__ == '__main__':
    cmd = ARGV[0] if ARGV else 'report'
    if cmd == 'run':
        cmd_run(int(ARGV[1]) if len(ARGV) > 1 else 2)
    else:
        cmd_report()
