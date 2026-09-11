"""Run 13: how often do the stored solutions use methods beyond Class 11-12? A cheap judge (DeepSeek V4.1 Flash,
thinking off) reads each stored worked solution and lists the techniques used, flagging anything outside the
NCERT 11-12 syllabus plus the standard coaching techniques for JEE Main / EAPCET / NEET. Flagged rows are then
hand-checked (the judge over-flags; the report lists every flag with its reason).

Solutions swept: Gemini 3.7 Flash direct on the 148 hard questions (Run 9) and the 59 maths (Run 11, code OFF);
DeepSeek `high` on the four base runs (EAPCET text 90, JEE Main 90, EAPCET figures 60, JEE figures 60).

usage: python scripts/model_probes/syllabus_sweep.py run [workers]   |   report [--list]
"""
import collections, io, json, os, sys, threading, time, urllib.request
from concurrent.futures import ThreadPoolExecutor
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
ARGV = sys.argv[1:]; sys.argv = ['x']
import ds_probe as P

DATA = os.path.join(P.REPO, 'docs', 'reports', 'model_probes', 'data')
OUT = os.path.join(DATA, 'syllabus_sweep')
SOURCES = [('chem_reader_37', 'gem_direct', 'gemini-3.7-flash'), ('code_exec', 'gem_direct', 'gemini-3.7-flash'),
           ('eapcet_text_2026_09_10', 'high', 'deepseek-flash high'), ('jee_main_2026_09_10', 'high', 'deepseek-flash high'),
           ('eapcet_figures', 'high', 'deepseek-flash high'), ('jee_figures', 'high', 'deepseek-flash high')]
PROMPT = """You are checking whether a worked solution to an Indian Class 11-12 entrance-exam question (JEE Main / EAPCET / NEET level) stays within the syllabus a Class 12 student is taught.

ALLOWED: everything in the NCERT Class 11 and 12 syllabus for physics, chemistry and mathematics, plus the standard coaching techniques these exams expect: L'Hopital's rule, Leibniz rule for differentiating integrals, King's rule / symmetry properties of definite integrals, Feynman-style parameter differentiation, vector methods, dimensional analysis, standard approximations (binomial for small x), determinant/matrix properties up to 3x3, complex numbers as taught in Class 11, standard organic mechanisms and reagents of NCERT, the mole concept, and all shortcut formulas coaching institutes teach.

BEYOND SYLLABUS (flag these): Lagrangian or Hamiltonian mechanics, tensors, Laplace or Fourier transforms, contour integration or residues, matrix exponentials or eigen-decomposition beyond Class 12, multivariable calculus with Jacobians or partial-derivative chain rules, differential equations beyond first-order/simple second-order, group theory, advanced organic reagents or named reactions not in NCERT (e.g. Grubbs, Buchwald, Suzuki, Swern), molecular-orbital arguments beyond NCERT MOT, statistical mechanics, quantum mechanics beyond Bohr/de Broglie/photoelectric, and any university-level theorem invoked by name.

Read the solution below. Reply with JSON only:
{"techniques": ["short name of each method used"], "beyond": ["each beyond-syllabus technique actually USED to reach the answer, with 5-10 words why"], "verdict": "within" | "beyond"}
Mentioning a method in passing without using it is NOT beyond. Be strict about the list above and do not invent flags.

SOLUTION:
"""


def gather():
    items = []
    for run, cond, model in SOURCES:
        sp = os.path.join(DATA, run, 'sample.json'); rp = os.path.join(DATA, run, 'results.jsonl')
        subj = {q['id']: q['subject'] for q in json.load(io.open(sp, encoding='utf-8'))} if os.path.exists(sp) else {}   # the Gemini runs carry subject on each row
        for l in io.open(rp, encoding='utf-8'):
            r = json.loads(l)
            if r.get('cond') != cond or r.get('error') or not (r.get('content') or '').strip():
                continue
            if run == 'code_exec' and r.get('group') != 'maths':
                continue
            items.append({'key': '%s|%s|%s' % (run, r['id'], cond), 'run': run, 'id': r['id'], 'subject': subj.get(r['id'], r.get('subject')), 'model': model, 'content': r['content']})
    return items


def judge(key, text):
    body = {'model': P.MODEL, 'max_tokens': 1200, 'messages': [{'role': 'user', 'content': PROMPT + text[:12000]}], 'thinking': {'type': 'disabled'}, 'response_format': {'type': 'json_object'}}
    req = urllib.request.Request('https://api.deepseek.com/chat/completions', data=json.dumps(body).encode(), headers={'Authorization': 'Bearer ' + key, 'Content-Type': 'application/json'})
    for attempt in range(4):
        try:
            with urllib.request.urlopen(req, timeout=300) as r:
                j = json.load(r)
            c = j['choices'][0]['message'].get('content') or ''
            try:
                v = json.loads(c)
            except Exception:
                v = {'techniques': [], 'beyond': [], 'verdict': 'unparsed', 'raw': c[:500]}
            return {'judge': v, 'usage': j.get('usage', {})}
        except urllib.error.HTTPError as e:
            if e.code in (429, 500, 502, 503) and attempt < 3:
                time.sleep(10 * (attempt + 1)); continue
            return {'error': 'http %d' % e.code}
        except Exception as e:  # noqa
            if attempt < 3:
                time.sleep(10); continue
            return {'error': repr(e)[:200]}


def cmd_run(workers):
    os.makedirs(OUT, exist_ok=True)
    items = gather(); path = os.path.join(OUT, 'results.jsonl')
    done = {json.loads(l)['key'] for l in io.open(path, encoding='utf-8') if '"error"' not in l} if os.path.exists(path) else set()
    todo = [it for it in items if it['key'] not in done]
    print('solutions', len(items), 'to judge', len(todo), collections.Counter((it['model'], it['subject']) for it in todo))
    dk = P.key(); lock = threading.Lock(); out = io.open(path, 'a', encoding='utf-8')

    def work(it):
        r = judge(dk, it['content'])
        row = dict({k: v for k, v in it.items() if k != 'content'}, **r)
        with lock:
            out.write(json.dumps(row, ensure_ascii=False) + '\n'); out.flush()
            v = r.get('judge', {})
            print('%-22s %-9s %-36s %-8s %s' % (it['model'], it['subject'], it['id'], v.get('verdict', r.get('error', '?')), '; '.join(v.get('beyond') or [])[:90]))

    with ThreadPoolExecutor(workers) as ex:
        list(ex.map(work, todo))
    print('run complete')


def cmd_report():
    rows = [json.loads(l) for l in io.open(os.path.join(OUT, 'results.jsonl'), encoding='utf-8') if '"error"' not in l]
    hp = os.path.join(OUT, 'hand.json')
    H = json.load(io.open(hp, encoding='utf-8')) if os.path.exists(hp) else {'confirmed': {}, 'dismissed': {}}
    print('%-22s %-9s %4s %7s %9s %9s' % ('model', 'subject', 'n', 'flagged', 'confirmed', 'dismissed'))
    for model in sorted({r['model'] for r in rows}):
        for subj in ('physics', 'chemistry', 'maths'):
            rs = [r for r in rows if r['model'] == model and r['subject'] == subj]
            if not rs:
                continue
            fl = [r for r in rs if r['judge'].get('verdict') == 'beyond']
            print('%-22s %-9s %4d %7d %9d %9d' % (model, subj, len(rs), len(fl), sum(1 for r in fl if r['key'] in H['confirmed']), sum(1 for r in fl if r['key'] in H['dismissed'])))
    if '--list' in ARGV:
        for r in rows:
            if r['judge'].get('verdict') == 'beyond':
                tag = 'CONFIRMED' if r['key'] in H['confirmed'] else ('dismissed' if r['key'] in H['dismissed'] else 'unchecked')
                print('   FLAG %-10s %-22s %-9s %-36s %s' % (tag, r['model'], r['subject'], r['id'], ' | '.join(r['judge'].get('beyond') or [])[:200]))
    print('cost $%.3f' % sum(P.cost_usd(r['usage'], 'off') for r in rows))


if __name__ == '__main__':
    cmd = ARGV[0] if ARGV else 'report'
    if cmd == 'run':
        cmd_run(int(ARGV[1]) if len(ARGV) > 1 else 4)
    else:
        cmd_report()
