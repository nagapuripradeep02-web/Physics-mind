"""DeepSeek V4.1 Flash probe: a photo of a printed EAPCET question + a one-line student ask,
at thinking off / low / high / max, graded against the official key.

The official crops carry the key's green tick, so the photo is RENDERED from the bank text
onto paper (slight tilt, blur, JPEG) - what a student's phone sees of a printed page.

usage (from the repo root, DS_PROBE_OUT=<run> selects the run directory):
       python scripts/model_probes/ds_probe.py render          # sample + render the photos, write sample.json
       python ds_probe.py run [workers]   # call the API for every (question, condition), append results.jsonl
       python ds_probe.py report          # grade + table
"""
import base64, collections, datetime, io, json, os, random, re, sys, textwrap, threading, time, urllib.request
from concurrent.futures import ThreadPoolExecutor
from PIL import Image, ImageDraw, ImageFilter, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(os.path.dirname(HERE))
RUN = os.environ.get('DS_PROBE_OUT', 'eapcet_text_2026_09_10')
OUT = os.path.join(REPO, 'docs', 'reports', 'model_probes', 'data', RUN)   # sample.json + results.jsonl (committed text)
IMG = os.path.join(REPO, 'pdfs', 'probes', RUN, 'photos')                    # the photos (gitignored under /pdfs/)
BANK = 'C:/Tutor/physics-mind-eapcet-corpus/eapcet/bank/%s_v1.json'
ENV = 'C:/Tutor/physics-mind/.env.local'
SUBJECTS = ('physics', 'chemistry', 'maths')
PER_SUBJECT = 30
SEED = 20260910
CONDITIONS = [('off', None), ('low', 'low'), ('high', 'high'), ('max', 'max')]
ASKS = ['Please solve this question', 'Please explain and solve this question',
        'Please solve and explain the question', 'What is the answer?']
MODEL = 'deepseek-flash'
# off-peak / peak USD per million (DeepSeek pricing page, 2026-09-10)
PRICE = {'off': {'miss': 0.15, 'hit': 0.003, 'out': 0.60}, 'peak': {'miss': 0.30, 'hit': 0.006, 'out': 1.20}}


def key():
    for line in io.open(ENV, encoding='utf-8'):
        if line.startswith('DEEPSEEK_API_KEY='):
            return line.split('=', 1)[1].strip().strip('"')
    sys.exit('no DEEPSEEK_API_KEY in .env.local')


def font(size):
    for c in [r'C:\Windows\Fonts\DejaVuSans.ttf', r'C:\Windows\Fonts\segoeui.ttf', r'C:\Windows\Fonts\arial.ttf']:
        if os.path.exists(c):
            return ImageFont.truetype(c, size), c
    try:
        import matplotlib
        p = os.path.join(os.path.dirname(matplotlib.__file__), 'mpl-data', 'fonts', 'ttf', 'DejaVuSans.ttf')
        return ImageFont.truetype(p, size), p
    except Exception:
        return ImageFont.load_default(), 'default'


def sample():
    rnd = random.Random(SEED)
    picked = []
    for s in SUBJECTS:
        qs = json.load(io.open(BANK % s, encoding='utf-8'))['questions']
        ok = [q for q in qs if q.get('answer') in (1, 2, 3, 4) and not q.get('needs_figure') and not q.get('answer_disputed')
              and not q.get('key_disputed_by_working') and q.get('transcription_confidence') != 'low'
              and all((o or '').strip() for o in q['options_en']) and len(q['question_en']) < 700]
        rnd.shuffle(ok)
        for q in ok[:PER_SUBJECT]:
            picked.append({'id': q['id'], 'subject': s, 'chapter': q.get('chapter'), 'year': q['year'],
                           'question_en': q['question_en'], 'options_en': q['options_en'], 'answer': q['answer']})
    return picked


def render(q, path):
    f, _ = font(38)
    fs, _ = font(34)
    W = 1240
    lines = []
    for para in q['question_en'].split('\n'):
        lines += textwrap.wrap(para, 62) or ['']
    body_h = 60 + len(lines) * 54 + 40 + 4 * 62 + 80
    img = Image.new('RGB', (W, max(700, body_h)), (247, 244, 236))
    d = ImageDraw.Draw(img)
    y = 60
    d.text((80, y), '%d.' % (random.Random(q['id']).randint(1, 160)), font=f, fill=(25, 25, 35))
    for ln in lines:
        d.text((150, y), ln, font=f, fill=(25, 25, 35))
        y += 54
    y += 30
    for i, o in enumerate(q['options_en'], 1):
        for k, ln in enumerate(textwrap.wrap('(%d)  %s' % (i, o), 60) or ['']):
            d.text((170 if k == 0 else 240, y), ln, font=fs, fill=(25, 25, 35))
            y += 52
        y += 10
    img = img.rotate(random.Random(q['id'] + 'r').uniform(-1.5, 1.5), resample=Image.BICUBIC, expand=True, fillcolor=(225, 220, 210))
    img = img.filter(ImageFilter.GaussianBlur(0.5))
    img.save(path, 'JPEG', quality=80)
    return os.path.getsize(path)


def cmd_render():
    os.makedirs(IMG, exist_ok=True)
    qs = sample()
    for q in qs:
        q['photo'] = os.path.join(IMG, q['id'] + '.jpg')
        q['bytes'] = render(q, q['photo'])
    io.open(os.path.join(OUT, 'sample.json'), 'w', encoding='utf-8').write(json.dumps(qs, ensure_ascii=False, indent=1))
    c = collections.Counter(q['subject'] for q in qs)
    print('rendered', len(qs), dict(c), 'font', font(10)[1])


def call(api_key, q, cond, ask):
    b64 = base64.b64encode(open(os.path.join(IMG, os.path.basename(q['photo'])), 'rb').read()).decode()
    body = {'model': MODEL, 'max_tokens': 32000,
            'messages': [{'role': 'user', 'content': [
                {'type': 'text', 'text': ask},
                {'type': 'image_url', 'image_url': {'url': 'data:image/jpeg;base64,' + b64}}]}]}
    name, effort = cond
    if effort is None:
        body['thinking'] = {'type': 'disabled'}
    else:
        body['thinking'] = {'type': 'enabled'}
        body['reasoning_effort'] = effort
    req = urllib.request.Request('https://api.deepseek.com/chat/completions', data=json.dumps(body).encode(),
                                 headers={'Authorization': 'Bearer ' + api_key, 'Content-Type': 'application/json'})
    t0 = time.time()
    last = None
    for attempt in range(4):
        try:
            with urllib.request.urlopen(req, timeout=900) as r:
                j = json.loads(r.read().decode('utf-8'))
            break
        except urllib.error.HTTPError as e:
            last = 'http %d %s' % (e.code, e.read()[:200].decode('utf-8', 'replace'))
            if e.code in (429, 500, 502, 503, 504):
                time.sleep(10 * (attempt + 1)); continue
            return {'error': last, 'ms': int(1000 * (time.time() - t0))}
        except Exception as e:
            last = str(e)[:200]; time.sleep(10 * (attempt + 1))
    else:
        return {'error': last, 'ms': int(1000 * (time.time() - t0))}
    msg = j['choices'][0]['message']
    u = j.get('usage', {})
    return {'ms': int(1000 * (time.time() - t0)), 'content': msg.get('content') or '',
            'reasoning_chars': len(msg.get('reasoning_content') or ''),
            'usage': u, 'finish': j['choices'][0].get('finish_reason'), 'model': j.get('model')}


def cmd_run(workers):
    api_key = key()
    qs = json.load(io.open(os.path.join(OUT, 'sample.json'), encoding='utf-8'))
    path = os.path.join(OUT, 'results.jsonl')
    done = set()
    if os.path.exists(path):
        for line in io.open(path, encoding='utf-8'):
            r = json.loads(line); done.add((r['id'], r['cond']))
    jobs = [(q, c, i) for i, q in enumerate(qs) for c in CONDITIONS if (q['id'], c[0]) not in done]
    print('jobs', len(jobs), 'done before', len(done), 'workers', workers, flush=True)
    lock = threading.Lock()

    def one(job):
        q, c, i = job
        ask = ASKS[i % len(ASKS)]
        r = call(api_key, q, c, ask)
        r.update({'id': q['id'], 'subject': q['subject'], 'cond': c[0], 'ask': ask, 'answer': q['answer'],
                  'at': datetime.datetime.utcnow().isoformat(timespec='seconds') + 'Z'})
        with lock:
            io.open(path, 'a', encoding='utf-8').write(json.dumps(r, ensure_ascii=False) + '\n')
            u = r.get('usage', {})
            print('%-9s %-5s %-38s %6dms out=%s %s' % (q['subject'], c[0], q['id'][-24:], r['ms'], u.get('completion_tokens', '-'), r.get('error', '')[:60]), flush=True)
    with ThreadPoolExecutor(max_workers=workers) as ex:
        list(ex.map(one, jobs))
    print('run complete', flush=True)


NUM = r'\(?\s*([1-4])\s*\)?'
PATTERNS = [r'boxed\{\s*(?:\\text\{)?\s*\(\s*([1-4])\s*\)',          # \boxed{(2) ...} / \boxed{\text{(2) ...
            r'boxed\{\s*([1-4])\s*\}',                                # \boxed{2}
            r'(?:option|choice|answer)\s*(?:is|:|=)?\s*(?:\*\*)?\s*\(\s*([1-4])\s*\)',   # option (2) / answer: (2) / option **(2)
            r'(?:option|choice|answer)\s*(?:is|:|=)?\s*(?:\*\*)?\s*([1-4])\b(?![./])',   # option 2 / answer 2
            r'\*\*\s*\(\s*([1-4])\s*\)',                              # **(2) ...**
            r'correct\s*(?:option|answer|choice)?\s*(?:is|:)?\s*(?:\*\*)?\s*\(?\s*([1-4])\s*\)?']


def norm(s):
    s = re.sub(r'[\s\u200b]+', '', s.lower())
    s = s.replace('−', '-').replace('×', 'x').replace('·', '.')
    return re.sub(r'[^0-9a-z\-\./:+=√π∞°]', '', s)


HAND = {('tg_eapcet_2024_20240511_fn_q088','max'):2, ('tg_eapcet_2021_20210806_fn_q085','max'):1,
        ('tg_eapcet_2025_20250503_an_q136','off'):1, ('tg_eapcet_2023_20230514_fn_q152','high'):4,
        ('tg_eapcet_2021_20210804_an_q134','off'):3, ('tg_eapcet_2021_20210804_an_q157','low'):2,
        ('tg_eapcet_2025_20250503_an_q141','off'):4, ('tg_eapcet_2023_20230513_fn_q051','off'):0,
        ('tg_eapcet_2022_20220720_an_q040','max'):4}


def grade_integer(r, q):
    c = r.get('content') or ''
    if r.get('error') or not c:
        return None, 'error'
    tail = c[-500:]
    nums = re.findall(r'boxed\{[^0-9\-]*(-?\d+(?:\.\d+)?)', tail) or re.findall(r'(?:answer|is|=)\s*\**\s*(-?\d+(?:\.\d+)?)\s*\**\s*\.?\s*$', tail.strip()) or re.findall(r'-?\d+(?:\.\d+)?', tail)
    if not nums:
        return None, 'unclear'
    got = float(nums[-1]); want = float(str(q['answer']).strip('()'))
    ok = abs(got - want) <= max(0.01 * abs(want), 1e-9)
    return (q['answer'] if ok else got), 'pattern'


def grade(r, q):
    c = r.get('content') or ''
    if q.get('qtype') == 'integer':
        return grade_integer(r, q)
    if (r['id'], r['cond']) in HAND:
        h = HAND[(r['id'], r['cond'])]
        return (h or None), ('hand' if h else 'no_answer')
    if r.get('error') or not c:
        return None, 'error'
    tail = c[-600:]
    found = []
    for p in PATTERNS:
        for m in re.finditer(p, tail, flags=re.I):
            found.append((m.end(), int(m.group(1))))
    if found:
        # the option stated LAST in the text wins, whatever pattern caught it
        return max(found)[1], 'pattern'
    # match option text against the tail
    hits = []
    for i, o in enumerate(q['options_en'], 1):
        no = norm(o)
        if len(no) >= 2 and no in norm(tail):
            hits.append(i)
    hits = sorted(set(hits))
    if len(hits) == 1:
        return hits[0], 'text'
    return None, 'unclear'


def cost_usd(u, tier):
    p = PRICE[tier]
    hit = u.get('prompt_cache_hit_tokens', 0) or 0
    miss = u.get('prompt_cache_miss_tokens', u.get('prompt_tokens', 0)) or 0
    return (hit * p['hit'] + miss * p['miss'] + (u.get('completion_tokens', 0) or 0) * p['out']) / 1e6


def cmd_report():
    qs = {q['id']: q for q in json.load(io.open(os.path.join(OUT, 'sample.json'), encoding='utf-8'))}
    rows = [json.loads(l) for l in io.open(os.path.join(OUT, 'results.jsonl'), encoding='utf-8')]
    agg = collections.defaultdict(lambda: collections.Counter())
    tok = collections.defaultdict(list)
    wrong = collections.defaultdict(list)
    for r in rows:
        q = qs[r['id']]
        pick, how = grade(r, q)
        k = (r['subject'], r['cond'])
        agg[k]['n'] += 1
        if how == 'error': agg[k]['error'] += 1
        elif how == 'no_answer': agg[k]['wrong'] += 1; wrong[k].append((r['id'], 'none', q['answer']))
        elif pick is None: agg[k]['unclear'] += 1
        elif pick == q['answer']: agg[k]['right'] += 1
        else:
            agg[k]['wrong'] += 1
            wrong[k].append((r['id'], pick, q['answer']))
        u = r.get('usage') or {}
        if u:
            tok[k].append((u.get('completion_tokens', 0), r['ms'], cost_usd(u, 'off'), cost_usd(u, 'peak')))
    print('%-10s %-5s %3s %5s %5s %7s %5s %9s %8s %9s %9s' % ('subject', 'mode', 'n', 'right', 'wrong', 'unclear', 'err', 'out_tok', 'sec', 'usd_off', 'usd_peak'))
    for s in SUBJECTS:
        for c, _ in CONDITIONS:
            k = (s, c); a = agg[k]; t = tok[k]
            if not a['n']: continue
            avg = lambda i: (sum(x[i] for x in t) / len(t)) if t else 0
            print('%-10s %-5s %3d %5d %5d %7d %5d %9.0f %8.1f %9.5f %9.5f' % (s, c, a['n'], a['right'], a['wrong'], a['unclear'], a['error'], avg(0), avg(1) / 1000, avg(2), avg(3)))
    print()
    for k, lst in sorted(wrong.items()):
        print(k, 'wrong:', ', '.join('%s picked %s key %s' % (i[-18:], p, a) for i, p, a in lst))
    unclear = [(r['id'], r['cond'], (r.get('content') or '')[-160:].replace('\n', ' ')) for r in rows if grade(r, qs[r['id']])[1] == 'unclear']
    if unclear:
        print('\nunclear (hand-check):')
        for u in unclear: print(' ', u)
    errs = [(r['id'], r['cond'], r.get('error')) for r in rows if r.get('error')]
    if errs:
        print('\nerrors:'); [print(' ', e) for e in errs]


if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    cmd = sys.argv[1] if len(sys.argv) > 1 else 'report'
    if cmd == 'render': cmd_render()
    elif cmd == 'run': cmd_run(int(sys.argv[2]) if len(sys.argv) > 2 else 6)
    else: cmd_report()
