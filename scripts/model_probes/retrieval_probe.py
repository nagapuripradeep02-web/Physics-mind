"""Run 12: retrieval-augmented solving. Gemini 3.7 Flash direct on the 148 hard figure/organic questions, with the
three most similar EAPCET bank questions (question + options + official key; the bank holds no worked solutions)
placed in the prompt as "similar past questions", against the plain-photo baseline of Run 9 (144/148).

Similarity: BM25 over the bank's question_en + options_en within the same subject. Query text = the sample's
question_en (EAPCET) or the Run 9 Gemini transcript (JEE, whose crops carry no text). The query's own bank row is
excluded; a neighbour that is a near-verbatim copy of the query (another year's repeat) is flagged exact_hit and
reported separately, since that is a bank hit rather than pattern help.

usage: python scripts/model_probes/retrieval_probe.py run [workers]   |   report [--list]
"""
import base64, collections, io, json, math, os, re, sys, threading
from concurrent.futures import ThreadPoolExecutor
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
ARGV = sys.argv[1:]; sys.argv = ['x']
os.environ.setdefault('GEMINI_MODEL', 'gemini-3.7-flash')
import ds_probe as P
import gemini_probe as G
import code_exec_probe as C

DATA = os.path.join(P.REPO, 'docs', 'reports', 'model_probes', 'data')
OUT = os.path.join(DATA, 'retrieval')
BANK = 'C:/Tutor/physics-mind-eapcet-corpus/eapcet/bank/%s_v1.json'
K = 3
STOP = ('the', 'of', 'a', 'an', 'is', 'in', 'to', 'and', 'are', 'for', 'with', 'which', 'that', 'be', 'by', 'on', 'at', 'as', 'from', 'it', 'its', 'this', 'then', 'if', 'or', 'will', 'given', 'following')


def toks(s):
    return [t for t in re.findall(r'[a-z0-9]+', (s or '').lower()) if len(t) > 1 and t not in STOP]


class BM25:
    def __init__(self, docs):
        self.docs = docs; self.tf = [collections.Counter(toks(d['text'])) for d in docs]
        self.len = [sum(c.values()) for c in self.tf]; self.avg = sum(self.len) / max(1, len(self.len))
        df = collections.Counter()
        for c in self.tf:
            df.update(c.keys())
        n = len(docs); self.idf = {t: math.log(1 + (n - f + 0.5) / (f + 0.5)) for t, f in df.items()}

    def top(self, query, k, exclude, subject):
        q = toks(query); out = []
        for i, d in enumerate(self.docs):
            if d['subject'] != subject or d['id'] in exclude:
                continue
            s = 0.0
            for t in q:
                f = self.tf[i].get(t)
                if f:
                    s += self.idf[t] * f * 2.2 / (f + 1.2 * (0.25 + 0.75 * self.len[i] / self.avg))
            if s > 0:
                out.append((s, i))
        out.sort(reverse=True)
        return [(s, self.docs[i]) for s, i in out[:k]]


def bank():
    docs = []
    for subj in ('physics', 'chemistry', 'maths'):
        b = json.load(io.open(BANK % subj, encoding='utf-8'))
        rows = b if isinstance(b, list) else next(v for v in b.values() if isinstance(v, list))
        for x in rows:
            if x.get('answer_disputed') or x.get('key_disputed_by_working') or not x.get('question_en'):
                continue
            docs.append({'id': x['id'], 'subject': subj, 'chapter': x.get('chapter'), 'q': x['question_en'], 'options': x.get('options_en') or [], 'answer': x['answer'],
                         'text': x['question_en'] + ' ' + ' '.join(x.get('options_en') or [])})
    return docs


def jaccard(a, b):
    A, B = set(toks(a)), set(toks(b))
    return len(A & B) / max(1, len(A | B))


def queries():
    qs = [q for q in C.questions() if q['group'] == 'hard148']
    reads = {}
    for l in io.open(os.path.join(DATA, 'chem_reader_37', 'results.jsonl'), encoding='utf-8'):
        r = json.loads(l)
        if r.get('cond') == 'gem_read' and not r.get('error'):
            reads[r['id']] = r['content'] or ''
    for q in qs:
        q['query'] = (q.get('question_en') or '') + ' ' + ' '.join(q.get('options_en') or []) if q.get('question_en') else reads.get(q['id'], '')[:1500]
    return qs


def examples_block(nbrs):
    lines = ['Here are similar past EAPCET questions with their official keys, as a reference for the style, level and conventions this exam expects:', '']
    for j, (s, d) in enumerate(nbrs, 1):
        lines.append('Example %d: %s' % (j, d['q'].strip()))
        for i, o in enumerate(d['options'], 1):
            lines.append('  (%d) %s' % (i, o))
        lines.append('  Official key: option %s' % d['answer'])
        lines.append('')
    lines.append('Now the actual question is in the photo. Please solve this question')
    return '\n'.join(lines)


def cmd_run(workers):
    os.makedirs(OUT, exist_ok=True)
    B = BM25(bank()); qs = queries()
    for q in qs:
        nb = B.top(q['query'], K, {q['id']}, q['subject'])
        q['neighbors'] = [{'id': d['id'], 'score': round(s, 2), 'chapter': d['chapter'], 'jaccard': round(jaccard(q['query'], d['text']), 2)} for s, d in nb]
        q['exact_hit'] = any(n['jaccard'] >= 0.6 for n in q['neighbors'])
        q['_nb'] = nb
    json.dump([{k: v for k, v in q.items() if k != '_nb'} for q in qs], io.open(os.path.join(OUT, 'sample.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print('queries', len(qs), 'with neighbours', sum(1 for q in qs if q['neighbors']), 'exact hits', sum(q['exact_hit'] for q in qs), 'empty query', sum(1 for q in qs if not q['query'].strip()))
    path = os.path.join(OUT, 'results.jsonl')
    done = {json.loads(l)['id'] for l in io.open(path, encoding='utf-8') if '"error"' not in l} if os.path.exists(path) else set()
    gk = G.gkey(); lock = threading.Lock(); out = io.open(path, 'a', encoding='utf-8')

    def work(q):
        if q['id'] in done:
            return
        img = base64.b64encode(open(q['photo_path'], 'rb').read()).decode()
        prompt = examples_block(q['_nb']) if q['_nb'] else P.ASKS[0]
        r = G.gemini(gk, [{'text': prompt}, {'inline_data': {'mime_type': 'image/jpeg', 'data': img}}], 16000)
        row = dict(id=q['id'], set=q['set'], subject=q['subject'], cond='gem_rag', answer=q['answer'], neighbors=q['neighbors'], exact_hit=q['exact_hit'], **r)
        with lock:
            out.write(json.dumps(row, ensure_ascii=False) + '\n'); out.flush()
            print('%-9s %-36s %7dms think=%-5s nb=%d %s' % (q['subject'], q['id'], r.get('ms', 0), (r.get('usage') or {}).get('thoughts'), len(q['neighbors']), r.get('error', '')[:80]))

    with ThreadPoolExecutor(workers) as ex:
        list(ex.map(work, qs))
    print('run complete')


def cmd_report():
    qs = {q['id']: q for q in json.load(io.open(os.path.join(OUT, 'sample.json'), encoding='utf-8'))}
    rows = [json.loads(l) for l in io.open(os.path.join(OUT, 'results.jsonl'), encoding='utf-8') if '"error"' not in l]
    hp = os.path.join(OUT, 'hand.json')
    H = json.load(io.open(hp, encoding='utf-8')) if os.path.exists(hp) else {'hand': {}, 'disputed': {}, 'excluded': {}}
    BH = json.load(io.open(os.path.join(DATA, 'chem_reader_37', 'hand.json'), encoding='utf-8'))
    base = {}
    for l in io.open(os.path.join(DATA, 'chem_reader_37', 'results.jsonl'), encoding='utf-8'):
        r = json.loads(l)
        if r.get('cond') == 'gem_direct' and not r.get('error') and r['id'] in qs:
            base[r['id']] = C.verdict(r, qs[r['id']], BH)[0]
    listing = '--list' in ARGV
    print('%-22s %-9s %3s | %-22s | %-22s | %6s %8s %5s' % ('set', 'subject', 'n', 'photo only (Run 9)', 'with 3 bank examples', 'think', '$/q', 'exact'))
    tot = collections.Counter()
    for set_ in ('jee_main_2026_09_10', 'jee_figures', 'eapcet_figures'):
        for subj in ('physics', 'chemistry'):
            rs = [r for r in rows if r['set'] == set_ and r['subject'] == subj]
            if not rs:
                continue
            a = collections.Counter(base.get(r['id'], '-') for r in rs)
            vs = [C.verdict(r, qs[r['id']], H) for r in rs]
            b = collections.Counter(v[0] for v in vs)
            print('%-22s %-9s %3d | right %3d wrong %2d disp %d | right %3d wrong %2d disp %d | %6.0f %8.5f %5d' % (set_, subj, len(rs), a['OK'], a['XX'] + a['none'], a['disp'], b['OK'], b['XX'] + b['none'], b['disp'],
                  sum(r['usage']['thoughts'] for r in rs) / len(rs), sum(G.gcost(r['usage']) for r in rs) / len(rs), sum(1 for r in rs if r['exact_hit'])))
            tot['base'] += a['OK']; tot['rag'] += b['OK']; tot['n'] += len(rs)
            for r, v in zip(rs, vs):
                if listing and v[0] != 'OK':
                    print('   NONRIGHT %-36s key=%-4s got=%-6s prev=%-4s exact=%d nb=%s | %s' % (r['id'], qs[r['id']]['answer'], v[1], base.get(r['id'], '-'), r['exact_hit'], [n['id'][-24:] for n in r['neighbors']], (r.get('content') or '')[-160:].replace('\n', ' ')))
    print('TOTAL photo only %d / %d   with examples %d / %d' % (tot['base'], tot['n'], tot['rag'], tot['n']))
    fixed = [r['id'] for r in rows if C.verdict(r, qs[r['id']], H)[0] == 'OK' and base.get(r['id']) == 'XX']
    broken = [r['id'] for r in rows if C.verdict(r, qs[r['id']], H)[0] == 'XX' and base.get(r['id']) == 'OK']
    print('fixed by examples:', fixed); print('broken by examples:', broken)


if __name__ == '__main__':
    cmd = ARGV[0] if ARGV else 'report'
    if cmd == 'run':
        cmd_run(int(ARGV[1]) if len(ARGV) > 1 else 3)
    else:
        cmd_report()
