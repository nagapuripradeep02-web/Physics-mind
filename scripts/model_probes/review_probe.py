"""Run 15: the Solution Reviewer harness - labelled handwritten pages through the deployed `ep-review`
edge function, scored for the shipping-gate numbers: false-error on correct pages, localisation of a
planted error (+-1 line), error-class agreement, UNSURE rate, cost, latency, and the reader's
over-correction rate (a transcript that silently "fixes" the student's slip).

Pages come from FERMAT (ai4bharat/FERMAT on Hugging Face, gated; arXiv 2501.07244 - handwritten
perturbed solutions on five axes: CO computational, CP conceptual, NO notational, PR presentation,
SU superficial = the dataset's native "correct" control) and from the founder's own labelled folder
(`local`). The reference the reviewer compares against is built from the GOLD solution only and
travels as the inline `reference` (probe token); no label ever leaves the machine - `gate` proves it
before any paid call, and a scoring negative control (an always-ERROR / always-CORRECT dummy
condition) proves the scorer can see what it scores.

usage (repo root; REVIEW_RUN=<run> selects the data directory, default review_probe):
  python scripts/model_probes/review_probe.py env                     # which secrets/tools exist (names only), endpoint host, origin
  python scripts/model_probes/review_probe.py inspect [--shard N]     # download ONE FERMAT shard, print its schema -> fill FERMAT_COLS
  python scripts/model_probes/review_probe.py fermat [--shard N] [--n-per-class CO=15,CP=15,NO=10,PR=10,correct=30,messy=10]
  python scripts/model_probes/review_probe.py local [--dir DIR]       # the founder's pages from labels.csv (appends to sample.json)
  python scripts/model_probes/review_probe.py gate [--live]           # label-leak + image + scoring control ($0); --live = one page per condition (~$0.10)
  python scripts/model_probes/review_probe.py run [conds] [workers] [--max-usd 12] [--ids a,b] [--twice K]
  python scripts/model_probes/review_probe.py report [--list]         # tables + every page verbatim -> docs/reports/model_probes/review_probe_<date>.md

Conditions: product (no overrides) | full (judge_a always, s2 on) | judge_b_only | judge_a_only | no_s2 |
reader_<name> (reader override + full) | dummy_error / dummy_correct (offline, $0 - the scoring controls).
A paid run needs BANK_ALLOW_API=1 (the corpus `_lib._post` refusal) and EP_PROBE_TOKEN; the endpoint is
EP_REVIEW_BASE, or EP_SOLVE_BASE with /ep-solve -> /ep-review. REVIEW_ORIGIN must be an origin the function
allows (the preview origin for the full run: localhost sits under the 20/day device cap and the 4/min IP cap).

labels.csv (local): id, photo, question_text, key, gold_steps, label, planted_line, planted_class,
student_line_text_at_error [, options, gold_line_text, planted_lines, final_matches_key].
gold_steps = the reference lines separated by " || " (or newlines inside the quoted cell); key 1-4 = the
option number, anything else = the final value; options = " | "-separated; label = correct | planted |
alt_method | messy; a planted row needs planted_line + planted_class + student_line_text_at_error.
"""
import base64, collections, csv, datetime, difflib, hashlib, io, json, os, random, re, sys, threading, time, uuid
import urllib.error, urllib.request
from concurrent.futures import ThreadPoolExecutor
from PIL import Image, ImageOps

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(os.path.dirname(HERE))
CORPUS_BANK = 'C:/Tutor/physics-mind-eapcet-corpus/scripts/bank'
sys.path.insert(0, CORPUS_BANK)
import _lib  # noqa: E402  (env_key, _post with the BANK_ALLOW_API refusal, latex_to_unicode, norm_text, numeric_signature, json_of, jsonl_*)

RUN = os.environ.get('REVIEW_RUN', 'review_probe')
OUT = os.path.join(REPO, 'docs', 'reports', 'model_probes', 'data', RUN)     # sample.json + results.jsonl + hand.json (committed text)
IMG = os.path.join(REPO, 'pdfs', 'probes', RUN, 'photos')                     # the downscaled pages (gitignored under /pdfs/)
FERMAT_DIR = os.path.join(REPO, 'pdfs', 'probes', RUN, 'fermat')              # the parquet shard(s) (gitignored)
LOCAL_DIR = os.environ.get('REVIEW_LOCAL') or os.path.join(REPO, 'pdfs', 'probes', RUN, 'local')
REPORT_DIR = os.path.join(REPO, 'docs', 'reports', 'model_probes')
ORIGIN = os.environ.get('REVIEW_ORIGIN', 'http://localhost:8120')
DEVICE_ID = str(uuid.uuid5(uuid.NAMESPACE_URL, 'physics-mind/review_probe'))
SESSION_ID = 'review_probe'
MAX_SIDE, QUALITY, SEED = 1600, 80, 20260916
MAX_BYTES = int(1.5 * 1024 * 1024)
EST_USD = 0.014                        # the plan's per-review estimate, used only when a reply carries no cost_usd (flagged)
TARGET = {'CO': 15, 'CP': 15, 'NO': 10, 'PR': 10, 'correct': 30, 'messy': 10}   # alt_method (10) comes only from `local`
HF_SHARD = 'https://huggingface.co/datasets/ai4bharat/FERMAT/resolve/main/data/train-%05d-of-00010.parquet'
HF_ACCOUNT = 'Pradeep-143'
DEFAULT_READER = 'gemini'              # EP_REVIEW_READER default in the function; reader_<name> conditions override it

CONDS = ['product', 'full', 'judge_b_only', 'judge_a_only', 'no_s2']
DUMMIES = ('dummy_error', 'dummy_correct')
LABELS = ('correct', 'planted', 'alt_method', 'messy')
CLASSES = ('concept', 'method', 'calculation', 'reading', 'convention', 'presentation')
# `local` rows: accept-set by class (the FERMAT axis map is fermat_class(); presentation takes the union of NO and PR)
CLASS_ACCEPT = {'calculation': ['calculation'], 'reading': ['reading', 'calculation'], 'concept': ['concept', 'method'],
                'method': ['method', 'concept'], 'presentation': ['presentation', 'calculation', 'convention'],
                'convention': ['convention', 'presentation']}
BODY_KEYS = {'action', 'device_id', 'probe_token', 'image', 'media_type', 'reference', 'probe_overrides', 'session_id'}
LABEL_KEYS = ('label', 'planted_line', 'planted_lines', 'planted_class', 'planted_class_accept', 'student_line_text_at_error',
              'gold_line_text', 'line_source', 'fermat', 'final_matches_key_expected', 'labels_sha', 'source')
REPLY_KEYS = ('ok', 'verdict', 'first_error_line', 'error_class', 'what_should_be', 'concept_tag', 'evidence_line', 'transcript',
              'final_value_read', 'final_matches_key', 'judges_ran', 'escalated', 'escalation_reason', 'ask', 'ask_line', 'method',
              'attempt_no', 'review_id', 'reads_left', 'cost_usd', 'ms', 'reason', 'locked')
LIVE_REPLY_REQUIRED = ('verdict', 'first_error_line', 'error_class', 'evidence_line', 'transcript', 'judges_ran', 'escalated',
                       'cost_usd', 'ms', 'review_id')

# ---- FERMAT columns: FILL AFTER `inspect` -----------------------------------------------------------------------
# The parquet column names are unknown until `inspect` has run on a real shard (the dataset is gated). `inspect`
# prints a proposal in this exact shape; paste it here. `fermat` refuses to run while a required entry is None.
FERMAT_COLS = {
    'image': None,        # required - the page image (HF image struct {bytes, path} or raw bytes)
    'question': None,     # required - the question text
    'gold': None,         # required - the original correct solution (LaTeX)
    'perturbed': None,    # required - the perturbed solution that was handwritten on the page (LaTeX)
    'axis': None,         # required - CO / CP / NO / PR / SU in any spelling (axis_of() maps it)
    'subtype': None,      # optional - e.g. 'Copy Error', 'Non-Propagated Step Error'
    'problem_id': None,   # optional - one page per problem where possible
    'writer': None,       # optional
    'legibility': None,   # optional - drives the `messy` cell (lowest values)
    'quality': None,      # optional
    'orientation': None,  # optional
    'explanation': None,  # optional - the annotator's description of the change (a LABEL: must never leave the machine)
    'line_field': None,   # optional - the dataset's own error-line localisation, cross-checked against the diff
    'grade': None,        # optional
}
FERMAT_REQUIRED = ('image', 'question', 'gold', 'perturbed', 'axis')
COL_HINTS = {   # name fragments `inspect` uses to PROPOSE the mapping; a proposal is not a fact
    'image': ['image', 'img', 'photo', 'page'], 'question': ['question', 'problem_text', 'problem_statement', 'problem'],
    'gold': ['gold', 'original', 'correct_sol', 'ground', 'reference'], 'perturbed': ['perturb', 'wrong', 'incorrect', 'handwritten', 'error_sol'],
    'axis': ['axis', 'error_type', 'perturbation_type', 'category', 'type'], 'subtype': ['subtype', 'sub_type', 'subcategory', 'sub_category'],
    'problem_id': ['problem_id', 'question_id', 'pid', 'qid'], 'writer': ['writer', 'annotator', 'author'], 'legibility': ['legib'],
    'quality': ['quality'], 'orientation': ['orient'], 'explanation': ['explanation', 'description', 'rationale', 'reason'],
    'line_field': ['error_line', 'line', 'location', 'localis', 'localiz', 'step_no', 'step'], 'grade': ['grade', 'level', 'class'],
}


# ---- small helpers ----------------------------------------------------------------------------------------------

def env_opt(name):
    """`_lib.env_key` (environment, then the two .env.local files) without its sys.exit on an absent name."""
    try:
        return _lib.env_key(name)
    except SystemExit:
        return None


def endpoint():
    base = env_opt('EP_REVIEW_BASE')
    if not base:
        solve = env_opt('EP_SOLVE_BASE')
        if solve and '/ep-solve' in solve:
            base = solve.replace('/ep-solve', '/ep-review')
    return (base or '').strip() or None


def host_of(url):
    return url.split('/')[2] if url and '//' in url else None


def opt(rest, name, default=None):
    """`--name value` or `--name=value` from an argv tail."""
    for i, a in enumerate(rest):
        if a == name and i + 1 < len(rest):
            return rest[i + 1]
        if a.startswith(name + '='):
            return a.split('=', 1)[1]
    return default


def now_iso():
    return datetime.datetime.now(datetime.timezone.utc).isoformat(timespec='seconds').replace('+00:00', 'Z')


def sha(s):
    return hashlib.sha256(s.encode('utf-8')).hexdigest()


def load_sample():
    p = os.path.join(OUT, 'sample.json')
    if not os.path.exists(p):
        sys.exit('no %s - run `fermat` or `local` first' % p)
    return json.load(io.open(p, encoding='utf-8'))


def save_sample(rows):
    os.makedirs(OUT, exist_ok=True)
    io.open(os.path.join(OUT, 'sample.json'), 'w', encoding='utf-8').write(json.dumps(rows, ensure_ascii=False, indent=1))


def load_hand():
    p = os.path.join(OUT, 'hand.json')
    H = json.load(io.open(p, encoding='utf-8')) if os.path.exists(p) else {}
    return {'hand': H.get('hand', {}), 'disputed': H.get('disputed', {}), 'excluded': H.get('excluded', {})}


def photo_path(q):
    return os.path.join(IMG, os.path.basename(q['photo']))


def labels_sha(rows):
    """One hash over every label in the sample; stamped on every row and every result so a relabel is visible."""
    key = sorted((r['id'], r['label'], r.get('planted_line'), r.get('planted_class'), r.get('student_line_text_at_error') or '') for r in rows)
    return sha(json.dumps(key, ensure_ascii=False))


def stamp(rows):
    h = labels_sha(rows)
    for r in rows:
        r['labels_sha'] = h
    return h


def downscale(src, dst):
    """bytes or path -> RGB -> longest side <= MAX_SIDE -> JPEG q80 at dst; returns (bytes, [w, h])."""
    im = Image.open(io.BytesIO(src) if isinstance(src, (bytes, bytearray)) else src)
    im = ImageOps.exif_transpose(im).convert('RGB')
    im.thumbnail((MAX_SIDE, MAX_SIDE))
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    im.save(dst, 'JPEG', quality=QUALITY)
    n = os.path.getsize(dst)
    assert n < MAX_BYTES, '%s is %d bytes (limit %d)' % (dst, n, MAX_BYTES)
    return n, list(im.size)


def need_pyarrow():
    try:
        import pyarrow.parquet as pq   # noqa
        import pyarrow as pa           # noqa
        return pa, pq
    except ImportError:
        sys.exit('pyarrow is not installed: run `pip install pyarrow` (needed only by `inspect` and `fermat`)')


# ---- conditions --------------------------------------------------------------------------------------------------

def overrides(cond):
    if cond in ('product',) or cond in DUMMIES:
        return None
    if cond == 'full':
        return {'judge_a': 'always', 's2': True}
    if cond == 'judge_b_only':
        return {'judge_a': 'never'}
    if cond == 'judge_a_only':
        return {'judge_a': 'always', 'judge_b': 'never'}
    if cond == 'no_s2':
        return {'judge_a': 'always', 's2': False}
    if cond.startswith('reader_') and len(cond) > 7:
        return {'reader': cond[7:], 'judge_a': 'always', 's2': True}
    sys.exit('unknown condition %r (product | full | judge_b_only | judge_a_only | no_s2 | reader_<name> | dummy_error | dummy_correct)' % cond)


def expected_judges(cond):
    """(must run, must not run) - the reply's judges_ran is the proof an ablation happened."""
    if cond in DUMMIES:
        return set(), set()
    if cond == 'product':
        return {'B'}, set()
    if cond == 'judge_b_only':
        return {'B'}, {'A'}
    if cond == 'judge_a_only':
        return {'A'}, {'B'}
    return {'A', 'B'}, set()     # full, no_s2, reader_*


def supported(cond, judges_ran):
    must, must_not = expected_judges(cond)
    ran = set(judges_ran or [])
    return must <= ran and not (must_not & ran)


def reader_of(cond):
    return cond[7:] if cond.startswith('reader_') else DEFAULT_READER


def build_body(q, cond, token, image_b64):
    body = {'action': 'review', 'device_id': DEVICE_ID, 'probe_token': token, 'image': image_b64, 'media_type': 'image/jpeg',
            'reference': q['reference'], 'session_id': SESSION_ID}
    ov = overrides(cond)
    if ov:
        body['probe_overrides'] = ov
    return body


def request_sha(body):
    """The body minus the image and the token - the identity of a request, never its secrets."""
    return sha(json.dumps({k: v for k, v in body.items() if k not in ('image', 'probe_token')}, sort_keys=True, ensure_ascii=False))


# ---- normalisers + metrics (the same normaliser on both sides of every comparison) -------------------------------

def N(s):
    return re.sub(r'\s+', '', _lib.norm_text(_lib.latex_to_unicode(s or '')))


def sim(a, b):
    return difflib.SequenceMatcher(None, a, b, autojunk=False).ratio() if a and b else 0.0


def sig(s):
    return _lib.numeric_signature(_lib.latex_to_unicode(s or ''))


def line_texts(line):
    return [t for t in (line.get('text'), line.get('tex')) if t]


def line_sim(line, n_target):
    return max([sim(N(t), n_target) for t in line_texts(line)] or [0.0])


def question_offset(transcript, question_text):
    """Leading transcript lines that are the question copied onto the page (FERMAT writes it on the same page)."""
    nq = N(question_text)
    if not nq:
        return 0
    k = 0
    for line in transcript:
        nl = N(' '.join(line_texts(line)))
        if len(nl) >= 4 and (nl in nq or sim(nl, nq) >= 0.6):
            k += 1
        else:
            break
    return k


def verdict_of(r, q, H, cond):
    """excluded -> disputed -> no_answer (error or !ok) -> hand override -> the reply's verdict."""
    k = '%s|%s' % (q['id'], cond)
    if q['id'] in H['excluded']:
        return 'excluded'
    if k in H['disputed']:
        return 'disputed'
    if r is None or r.get('error') or not r.get('ok'):
        return 'no_answer'
    hv = (H['hand'].get(k) or {}).get('verdict') if isinstance(H['hand'].get(k), dict) else None
    if hv:
        return hv
    return r.get('verdict') if r.get('verdict') in ('CORRECT', 'ERROR', 'UNSURE') else 'no_answer'


def localise(r, q, hand):
    """label planted, verdict ERROR -> 'anchor' | 'integer' | 'hand' | 'late_hit' | 'miss'.
    anchor: a transcript line within +-1 of the named line reads like the student's erroneous line;
    integer: |(named line - question offset) - planted_line| <= 1; late_hit: a LATER planted line was named."""
    if isinstance(hand, dict) and 'loc' in hand:
        return 'hand' if hand['loc'] else 'miss'
    L = r.get('first_error_line')
    if not isinstance(L, int):
        return 'miss'
    tr = r.get('transcript') or []
    ns = N(q.get('student_line_text_at_error'))
    if ns:
        for line in tr:
            if isinstance(line.get('n'), int) and abs(line['n'] - L) <= 1 and line_sim(line, ns) >= 0.6:
                return 'anchor'
    pl = q.get('planted_line')
    qoff = question_offset(tr, q['reference'].get('question_text', ''))
    if isinstance(pl, int) and abs((L - qoff) - pl) <= 1:
        return 'integer'
    if any(isinstance(p, int) and p != pl and abs((L - qoff) - p) <= 1 for p in (q.get('planted_lines') or [])):
        return 'late_hit'
    return 'miss'


def over_correction(r, q, hand_value):
    """Per planted page: did the reader transcribe the student's erroneous line (faithful) or the gold form
    (over_corrected)? -> 'faithful' | 'over_corrected' | 'ambiguous' | 'unmatched' | 'unreadable' | None (n/a)."""
    if hand_value in ('faithful', 'over_corrected', 'unreadable'):
        return hand_value
    S, G = q.get('student_line_text_at_error'), q.get('gold_line_text')
    if not S or not G:
        return None
    if r is None or r.get('error') or not r.get('ok') or not r.get('transcript'):
        return 'unreadable'
    ns, ng = N(S), N(G)
    best = None
    for line in r['transcript']:
        for t in line_texts(line):
            s1, s2 = sim(N(t), ns), sim(N(t), ng)
            if best is None or max(s1, s2) > best[0]:
                best = (max(s1, s2), s1, s2, t)
    if best is None or best[0] < 0.5:
        return 'unmatched'
    _, s_s, s_g, text = best
    sig_s, sig_g = set(sig(S)), set(sig(G))
    if sig_s != sig_g:
        sig_l = set(sig(text))
        has_g, has_s = bool((sig_g - sig_s) & sig_l), bool((sig_s - sig_g) & sig_l)
        if has_g and not has_s:
            return 'over_corrected'
        if has_s and not has_g:
            return 'faithful'
    d = s_g - s_s
    if d >= 0.15:
        return 'over_corrected'
    if d <= -0.15:
        return 'faithful'
    return 'ambiguous'


def last_rows(results):
    """(id, cond, rep) -> the row that counts: the last row without an error, else the last row."""
    out = {}
    for r in results:
        k = (r['id'], r['cond'], r.get('rep', 1))
        if k not in out or not r.get('error') or out[k].get('error'):
            out[k] = r
    return out


def score(sample, results, H):
    """Per-condition metrics over rep=1 rows, plus one scored record per (page, condition).
    false_error = ERROR on label in {correct, alt_method} / scored pages of those labels; unsure_rate = UNSURE / scored;
    localised, class_strict, class_accept share the denominator caught = ERROR among planted pages."""
    last = last_rows(results)
    conds = [c for c in CONDS if any(k[1] == c for k in last)] + sorted({k[1] for k in last if k[1] not in CONDS})
    per, recs = {}, []
    for c in conds:
        m = collections.Counter()
        costs, lat, jr, over = [], [], collections.Counter(), collections.Counter()
        m['cost_missing'] = 0
        for q in sample:
            r = last.get((q['id'], c, 1))
            if r is None:
                continue
            hk = '%s|%s' % (q['id'], c)
            hand = H['hand'].get(hk) if isinstance(H['hand'].get(hk), dict) else {}
            v = verdict_of(r, q, H, c)
            rec = {'id': q['id'], 'cond': c, 'label': q['label'], 'verdict': v, 'loc': None, 'cls_strict': None, 'cls_accept': None,
                   'over': None, 'supported': supported(c, r.get('judges_ran')) if v not in ('no_answer', 'excluded', 'disputed') else None,
                   'first_error_line': r.get('first_error_line'), 'error_class': r.get('error_class')}
            m['n'] += 1
            if v in ('excluded', 'disputed', 'no_answer'):
                m[v] += 1
            else:
                m['scored'] += 1
                if rec['supported'] is False:
                    m['unsupported'] += 1
                if v == 'UNSURE':
                    m['unsure'] += 1
                if q['label'] in ('correct', 'alt_method'):
                    m['n_correct'] += 1
                    if v == 'ERROR':
                        m['false_error'] += 1
                if q['label'] == 'planted':
                    m['n_planted'] += 1
                    if v == 'ERROR':
                        m['caught'] += 1
                        rec['loc'] = localise(r, q, hand)
                        m['loc_' + rec['loc']] += 1
                        cls = hand.get('cls') or r.get('error_class')
                        rec['cls_strict'] = cls == q.get('planted_class')
                        rec['cls_accept'] = cls in (q.get('planted_class_accept') or [])
                        m['class_strict'] += rec['cls_strict']
                        m['class_accept'] += rec['cls_accept']
                if r.get('escalated'):
                    m['escalated'] += 1
                jr[','.join(r.get('judges_ran') or ['-'])] += 1
                if r.get('cost_usd') is None:
                    m['cost_missing'] += 1
                else:
                    costs.append(float(r['cost_usd']))
                lat.append((r.get('ms') if isinstance(r.get('ms'), (int, float)) else r.get('ms_wall', 0)) / 1000.0)
            if q['label'] in ('planted', 'messy') and q.get('student_line_text_at_error') and c not in DUMMIES:
                rec['over'] = over_correction(r, q, H['hand'].get('%s|transcribe' % q['id']))
                if rec['over']:
                    over[rec['over']] += 1
            recs.append(rec)
        m['localised'] = m['loc_anchor'] + m['loc_integer'] + m['loc_hand']
        m['localised_strict'] = m['loc_anchor']
        per[c] = {'m': m, 'costs': costs, 'lat': sorted(lat), 'judges_ran': jr, 'over': over,
                  'supported': m['scored'] > 0 and m['unsupported'] == 0}
    return per, recs


def pct(a, b):
    return '-' if not b else '%d/%d (%.0f%%)' % (a, b, 100.0 * a / b)


def mean(xs):
    return sum(xs) / len(xs) if xs else 0.0


def p95(xs):
    return xs[int(0.95 * (len(xs) - 1))] if xs else 0.0


# ---- dummy conditions (offline, $0): the scoring negative control -----------------------------------------------

def dummy_reply(q, cond):
    lines = [{'n': i, 'text': 'dummy line %d' % i, 'tex': None, 'kind': 'equation', 'legible': 1.0} for i in (1, 2, 3)]
    base = {'ok': True, 'transcript': lines, 'final_value_read': None, 'judges_ran': ['dummy'], 'escalated': False,
            'escalation_reason': None, 'ask': None, 'ask_line': None, 'attempt_no': 1, 'review_id': None, 'reads_left': None,
            'cost_usd': 0.0, 'ms': 0, 'concept_tag': None}
    if cond == 'dummy_error':
        base.update({'verdict': 'ERROR', 'first_error_line': 1, 'error_class': 'calculation', 'what_should_be': 'dummy',
                     'evidence_line': lines[0], 'final_matches_key': False, 'method': None})
    else:
        base.update({'verdict': 'CORRECT', 'first_error_line': None, 'error_class': None, 'what_should_be': None,
                     'evidence_line': None, 'final_matches_key': True, 'method': 'dummy'})
    return base


def dummy_row(q, cond, rep=1):
    body = build_body(q, cond, None, None)
    row = {'id': q['id'], 'cond': cond, 'rep': rep, 'at': now_iso(), 'labels_sha': q.get('labels_sha'), 'request_sha': request_sha(body),
           'origin': 'offline', 'endpoint_host': 'dummy', 'http_status': None, 'ms_wall': 0}
    row.update(dummy_reply(q, cond))
    return row


# ---- commands ----------------------------------------------------------------------------------------------------

def cmd_env(rest):
    for name in ('EP_PROBE_TOKEN', 'EP_REVIEW_BASE', 'EP_SOLVE_BASE', 'HF_TOKEN', 'BANK_ALLOW_API'):
        v = os.environ.get(name) if name == 'BANK_ALLOW_API' else env_opt(name)
        print('%-16s %s' % (name, 'set' if v else 'absent'))
    try:
        import pyarrow  # noqa
        print('%-16s %s' % ('pyarrow', 'available'))
    except ImportError:
        print('%-16s %s' % ('pyarrow', 'MISSING - pip install pyarrow (inspect / fermat only)'))
    import PIL
    print('%-16s %s' % ('PIL', PIL.__version__))
    ep = endpoint()
    print('%-16s %s' % ('endpoint host', host_of(ep) or 'none (set EP_REVIEW_BASE, or EP_SOLVE_BASE with /ep-solve)'))
    print('%-16s %s' % ('origin', ORIGIN))
    print('%-16s %s' % ('run', RUN))
    print('%-16s %s' % ('data', OUT))
    print('%-16s %s' % ('photos', IMG))
    print('%-16s %s' % ('device_id', DEVICE_ID))
    return 0


def shard_path(shard):
    return os.path.join(FERMAT_DIR, os.path.basename(HF_SHARD % shard))


def hf_download(shard):
    """ONE parquet shard with Range resume. Not a metered model call - bypasses _lib._post on purpose."""
    dst = shard_path(shard)
    if os.path.exists(dst):
        print('shard present', dst, os.path.getsize(dst), 'bytes')
        return dst
    tok = env_opt('HF_TOKEN')
    if not tok:
        sys.exit('HF_TOKEN is absent: request access to ai4bharat/FERMAT on Hugging Face (account %s), then add HF_TOKEN= to .env.local' % HF_ACCOUNT)
    os.makedirs(FERMAT_DIR, exist_ok=True)
    part = dst + '.part'
    have = os.path.getsize(part) if os.path.exists(part) else 0
    headers = {'Authorization': 'Bearer ' + tok, 'User-Agent': 'physics-mind review_probe'}
    if have:
        headers['Range'] = 'bytes=%d-' % have
    req = urllib.request.Request(HF_SHARD % shard, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=120) as r:
            mode = 'ab' if r.status == 206 else 'wb'
            if r.status == 200 and have:
                print('server ignored Range - restarting the download')
            total = r.headers.get('Content-Length')
            got = have if mode == 'ab' else 0
            with open(part, mode) as f:
                while True:
                    chunk = r.read(1 << 20)
                    if not chunk:
                        break
                    f.write(chunk)
                    got += len(chunk)
                    print('\r  %d MB%s' % (got >> 20, (' of ~%d' % ((have + int(total)) >> 20)) if total else ''), end='', flush=True)
            print()
    except urllib.error.HTTPError as e:
        if e.code in (401, 403):
            sys.exit('HTTP %d from Hugging Face: request access to ai4bharat/FERMAT with account %s (gated dataset) and check HF_TOKEN' % (e.code, HF_ACCOUNT))
        if e.code == 416:
            print('range not satisfiable - the partial file is complete')
        else:
            raise
    os.replace(part, dst)
    print('downloaded', dst, os.path.getsize(dst), 'bytes')
    return dst


def propose_cols(names):
    prop, taken = {}, set()
    for key, hints in COL_HINTS.items():
        prop[key] = None
        for h in hints:
            hit = next((n for n in names if h in n.lower() and n not in taken), None)
            if hit:
                prop[key] = hit
                taken.add(hit)
                break
    return prop


def image_bytes(v):
    if isinstance(v, dict):
        if v.get('bytes'):
            return bytes(v['bytes'])
        if v.get('path') and os.path.exists(v['path']):
            return open(v['path'], 'rb').read()
        return None
    if isinstance(v, (bytes, bytearray)):
        return bytes(v)
    return None


def cell_repr(v):
    b = image_bytes(v)
    if b is not None:
        try:
            im = Image.open(io.BytesIO(b))
            return '<image %d bytes, %sx%s %s>' % (len(b), im.size[0], im.size[1], im.mode)
        except Exception:  # noqa
            return '<binary %d bytes>' % len(b)
    s = json.dumps(v, ensure_ascii=False) if not isinstance(v, str) else v
    return s if len(s) <= 300 else s[:300] + '...(%d chars)' % len(s)


def cmd_inspect(rest):
    pa, pq = need_pyarrow()
    shard = int(opt(rest, '--shard', 0))
    path = hf_download(shard)
    tbl = pq.read_table(path)
    print('schema_arrow:')
    for f in tbl.schema:
        print('  %-28s %s' % (f.name, f.type))
    print('num_rows', tbl.num_rows)
    names = tbl.column_names
    simple = [n for n in names if not (pa.types.is_struct(tbl.schema.field(n).type) or pa.types.is_binary(tbl.schema.field(n).type)
                                       or pa.types.is_large_binary(tbl.schema.field(n).type))]
    print('\nfirst 3 rows:')
    for i, row in enumerate(tbl.slice(0, 3).to_pylist()):
        print('-- row', i)
        for n in names:
            print('  %-24s %s' % (n, cell_repr(row[n])))
    print('\nhistograms (columns with <= 40 distinct values):')
    for n in simple:
        vals = tbl.column(n).to_pylist()
        try:
            c = collections.Counter(json.dumps(v, ensure_ascii=False) if not isinstance(v, (str, int, float, type(None))) else v for v in vals)
        except TypeError:
            continue
        if len(c) <= 40:
            print('  %-24s %s' % (n, dict(c.most_common())))
    prop = propose_cols(names)
    if prop['gold'] and prop['perturbed']:
        g, p = tbl.column(prop['gold']).to_pylist(), tbl.column(prop['perturbed']).to_pylist()
        print('\nrows with identical gold/perturbed text: %d of %d' % (sum(1 for a, b in zip(g, p) if (a or '').strip() == (b or '').strip()), len(g)))
    if prop['line_field']:
        lf = tbl.column(prop['line_field']).to_pylist()
        print('rows with empty localisation (%s): %d of %d' % (prop['line_field'], sum(1 for v in lf if v in (None, '', [], 0)), len(lf)))
    if prop['axis']:
        ax = tbl.column(prop['axis']).to_pylist()
        print('axis mapping check:', dict(collections.Counter('%s->%s' % (v, axis_of(v)) for v in ax)))
    print('\nPROPOSAL (verify against the rows above, then paste into FERMAT_COLS):')
    print('FERMAT_COLS = {')
    for k in FERMAT_COLS:
        print("    %r: %r," % (k, prop.get(k)))
    print('}')
    return 0


def axis_of(v):
    s = str(v or '').strip().lower()
    if not s:
        return None
    if s in ('co', 'cp', 'no', 'pr', 'su'):
        return s.upper()
    for code, keys in (('CO', ('comput', 'calcul')), ('CP', ('concep',)), ('NO', ('notat',)), ('PR', ('present',)), ('SU', ('superf',))):
        if any(k in s for k in keys):
            return code
    return None


def fermat_class(axis, subtype):
    st = (subtype or '').lower()
    if axis == 'CO':
        return ('reading', ['reading', 'calculation']) if 'copy' in st else ('calculation', ['calculation'])
    if axis == 'CP':
        return 'concept', ['concept', 'method']
    if axis == 'NO':
        return 'presentation', ['presentation', 'calculation']
    if axis == 'PR':
        return 'presentation', ['presentation', 'convention']
    return None, []


def split_lines(latex):
    s = latex or ''
    s = re.sub(r'\\(?:begin|end)\{[a-zA-Z*]+\}', '\n', s)
    s = s.replace('\\\\', '\n').replace('\\newline', '\n')
    s = re.sub(r'\\\[|\\\]|\$\$', '\n', s)
    out = []
    for l in s.split('\n'):
        l = re.sub(r'\s*&\s*', ' ', l)          # align-environment column markers carry no content
        l = re.sub(r'\s+', ' ', l).strip()
        if l and l != '\\':
            out.append(l)
    return out


def diff_lines(gold_lines, pert_lines):
    """-> (planted_lines 1-based on the perturbed side, (gold_index, pert_index) of the first difference) or None."""
    a, b = [N(l) for l in gold_lines], [N(l) for l in pert_lines]
    smx = difflib.SequenceMatcher(None, a, b, autojunk=False)
    changed, first = [], None
    for tag, i1, i2, j1, j2 in smx.get_opcodes():
        if tag == 'equal':
            continue
        js = list(range(j1, j2)) if j2 > j1 else [max(0, min(j1, len(b) - 1))]
        changed += [j + 1 for j in js]
        if first is None:
            first = (max(0, min(i1, len(a) - 1)), js[0])
    if not changed or not b:
        return None
    return sorted(set(changed)), first


def parse_key(last_line):
    m = re.findall(r'=\s*(?:\\boxed\{)?\s*([-+]?\d+(?:\.\d+)?(?:/\d+)?)', last_line or '')
    if not m:
        return None
    v = m[-1]
    try:
        return float(v) if '/' not in v else float(v.split('/')[0]) / float(v.split('/')[1])
    except (ValueError, ZeroDivisionError):
        return None


def parse_int(v):
    try:
        return int(str(v).strip()) if v not in (None, '', []) else None
    except ValueError:
        m = re.search(r'\d+', str(v))
        return int(m.group(0)) if m else None


def fermat_row(i, m, label, img, shard):
    C = FERMAT_COLS
    col = lambda k: m.get(C[k]) if C.get(k) else None   # noqa: E731
    axis, subtype = axis_of(col('axis')), col('subtype')
    gold_l, pert_l = split_lines(col('gold')), split_lines(col('perturbed'))
    planted_line = planted_lines = student = goldline = line_source = None
    if axis != 'SU':
        d = diff_lines(gold_l, pert_l)
        ds_line = parse_int(col('line_field'))
        if d:
            planted_lines, (gi, pj) = d
            planted_line, student, goldline = planted_lines[0], pert_l[pj], (gold_l[gi] if gold_l else None)
            line_source = ('both_agree' if ds_line == planted_line else 'disagree') if ds_line else 'diff'
        elif ds_line and 0 < ds_line <= len(pert_l):
            planted_line, planted_lines, line_source = ds_line, [ds_line], 'dataset'
            student, goldline = pert_l[ds_line - 1], (gold_l[ds_line - 1] if ds_line <= len(gold_l) else None)
        if label == 'planted' and not (planted_line and student):
            return None, 'no error line derivable (gold == perturbed after normalisation, no dataset line)'
    cls, accept = fermat_class(axis, subtype)
    if label == 'planted' and not cls:
        return None, 'axis %r has no class' % axis
    qid = 'fm_%d_%d' % (shard, i)
    dst = os.path.join(IMG, qid + '.jpg')
    n, size = downscale(img, dst)
    if axis == 'SU':
        final_expected = True
    else:
        final_expected = (sig(gold_l[-1]) == sig(pert_l[-1])) if (gold_l and pert_l) else None
    return {'id': qid, 'source': 'fermat', 'label': label, 'photo': dst, 'bytes': n, 'size': size,
            'reference': {'question_text': (col('question') or '').strip(), 'key_value': parse_key(gold_l[-1] if gold_l else ''),
                          'steps': [{'text': _lib.latex_to_unicode(l), 'tex': l} for l in gold_l]},
            'fermat': {'axis': axis, 'subtype': subtype, 'problem_id': col('problem_id'), 'writer': col('writer'), 'legibility': col('legibility'),
                       'quality': col('quality'), 'orientation': col('orientation'), 'exp': col('explanation'), 'line_field': col('line_field'),
                       'shard': shard, 'row': i},
            'planted_line': planted_line, 'planted_lines': planted_lines or [], 'line_source': line_source,
            'planted_class': cls, 'planted_class_accept': accept, 'student_line_text_at_error': student, 'gold_line_text': goldline,
            'final_matches_key_expected': final_expected, 'labels_sha': None}, None


def legibility_rank(v):
    try:
        return float(v)
    except (TypeError, ValueError):
        order = {'very low': 0, 'low': 0, 'poor': 0, 'bad': 0, 'medium': 1, 'moderate': 1, 'average': 1, 'high': 2, 'good': 2, 'very high': 3, 'excellent': 3}
        return order.get(str(v or '').strip().lower(), 1)


def cmd_fermat(rest):
    missing = [k for k in FERMAT_REQUIRED if not FERMAT_COLS.get(k)]
    if missing:
        print('FERMAT_COLS is not filled for %s - run `python scripts/model_probes/review_probe.py inspect` first, verify its proposal'
              ' against the printed rows, and paste it into FERMAT_COLS at the top of this file.' % missing)
        return 2
    pa, pq = need_pyarrow()
    shard = int(opt(rest, '--shard', 0))
    target = dict(TARGET)
    for kv in (opt(rest, '--n-per-class') or '').split(','):
        if '=' in kv:
            k, v = kv.split('=', 1)
            target[k.strip()] = int(v)
    tbl = pq.read_table(hf_download(shard))
    C = FERMAT_COLS
    absent = [c for c in C.values() if c and c not in tbl.column_names]
    if absent:
        sys.exit('FERMAT_COLS names columns the shard does not have: %s' % absent)
    meta_cols = sorted({c for k, c in C.items() if c and k != 'image'})
    meta = tbl.select(meta_cols).to_pylist()
    by_axis, unmapped = collections.defaultdict(list), collections.Counter()
    for i, m in enumerate(meta):
        ax = axis_of(m.get(C['axis']))
        if ax is None:
            unmapped[str(m.get(C['axis']))] += 1
        else:
            by_axis[ax].append(i)
    if unmapped:
        sys.exit('axis values axis_of() cannot map: %s - extend axis_of() first' % dict(unmapped))
    print('rows per axis:', {k: len(v) for k, v in sorted(by_axis.items())})
    rnd = random.Random(SEED)
    picked, used_problem = [], set()
    for ax in ('CO', 'CP', 'NO', 'PR'):
        idxs = by_axis.get(ax, [])[:]
        rnd.shuffle(idxs)
        take, spill = [], []
        for i in idxs:
            pid = meta[i].get(C['problem_id']) if C.get('problem_id') else None
            if pid is not None and pid in used_problem:
                spill.append(i)
                continue
            take.append(i)
            used_problem.add(pid)
            if len(take) >= target.get(ax, 0):
                break
        take += spill[:max(0, target.get(ax, 0) - len(take))]
        picked += [(i, 'planted') for i in take]
    su = by_axis.get('SU', [])[:]
    rnd.shuffle(su)
    picked += [(i, 'correct') for i in su[:target.get('correct', 0)]]
    chosen = {i for i, _ in picked}
    if C.get('legibility') and target.get('messy', 0):
        rest_idx = [i for i in range(len(meta)) if i not in chosen]
        rest_idx.sort(key=lambda i: (legibility_rank(meta[i].get(C['legibility'])), rnd.random()))
        picked += [(i, 'messy') for i in rest_idx[:target['messy']]]
    else:
        print('no legibility column in FERMAT_COLS - the messy cell comes from `local` only')
    rows, skipped = [], []
    img_col = tbl.column(C['image'])
    for i, label in picked:
        img = image_bytes(img_col[i].as_py())
        if img is None:
            skipped.append((i, label, 'no image bytes'))
            continue
        row, why = fermat_row(i, meta[i], label, img, shard)
        if row is None:
            skipped.append((i, label, why))
            continue
        rows.append(row)
    h = stamp(rows)
    save_sample(rows)
    print('sample.json: %d rows' % len(rows), dict(collections.Counter(r['label'] for r in rows)),
          'axes', dict(collections.Counter((r['fermat'] or {}).get('axis') for r in rows)))
    print('line_source:', dict(collections.Counter(r.get('line_source') for r in rows if r['label'] == 'planted')))
    print('labels_sha', h)
    for i, label, why in skipped:
        print('  skipped row %d (%s): %s' % (i, label, why))
    disagree = [r['id'] for r in rows if r.get('line_source') == 'disagree']
    if disagree:
        print('hand-pass candidates (diff vs dataset localisation disagree):', disagree)
    return 0


def cmd_local(rest):
    d = opt(rest, '--dir', LOCAL_DIR)
    p = os.path.join(d, 'labels.csv')
    if not os.path.exists(p):
        sys.exit('no %s' % p)
    old = json.load(io.open(os.path.join(OUT, 'sample.json'), encoding='utf-8')) if os.path.exists(os.path.join(OUT, 'sample.json')) else []
    rows, problems = [], []
    for k, rec in enumerate(csv.DictReader(io.open(p, encoding='utf-8-sig')), 1):
        g = lambda name: (rec.get(name) or '').strip()   # noqa: E731
        rid, label = g('id'), g('label')
        if not rid or label not in LABELS:
            problems.append('row %d: id %r label %r (need one of %s)' % (k, rid, label, LABELS))
            continue
        src = g('photo') if os.path.isabs(g('photo')) else os.path.join(d, g('photo'))
        if not os.path.exists(src):
            problems.append('row %d (%s): photo missing %s' % (k, rid, src))
            continue
        steps = [s.strip() for s in re.split(r'\s*\|\|\s*|\n', g('gold_steps') or g('reference_text')) if s.strip()]
        key = g('key')
        ref = {'question_text': g('question_text'), 'steps': [{'text': _lib.latex_to_unicode(s), 'tex': s} for s in steps]}
        if g('options'):
            ref['options'] = [o.strip() for o in g('options').split('|') if o.strip()]
        if re.fullmatch(r'[1-4]', key):
            ref['key_option'] = int(key)
        elif key:
            try:
                ref['key_value'] = float(key)
            except ValueError:
                ref['key_value'] = key
        pl, cls, student = parse_int(g('planted_line')), g('planted_class') or None, g('student_line_text_at_error') or None
        if label == 'planted' and not (pl and cls in CLASSES and student):
            problems.append('row %d (%s): a planted row needs planted_line, planted_class in %s and student_line_text_at_error' % (k, rid, CLASSES))
            continue
        if cls and cls not in CLASSES:
            problems.append('row %d (%s): planted_class %r not in %s' % (k, rid, cls, CLASSES))
            continue
        pls = [parse_int(x) for x in g('planted_lines').split(',') if parse_int(x)] if g('planted_lines') else ([pl] if pl else [])
        fmk = g('final_matches_key').lower()
        final_expected = True if fmk in ('1', 'true', 'yes') else False if fmk in ('0', 'false', 'no') else (True if label in ('correct', 'alt_method') else None)
        qid = 'loc_' + rid
        dst = os.path.join(IMG, qid + '.jpg')
        n, size = downscale(src, dst)
        rows.append({'id': qid, 'source': 'local', 'label': label, 'photo': dst, 'bytes': n, 'size': size, 'reference': ref, 'fermat': None,
                     'planted_line': pl, 'planted_lines': pls, 'line_source': 'hand' if pl else None, 'planted_class': cls,
                     'planted_class_accept': CLASS_ACCEPT.get(cls, []) if cls else [], 'student_line_text_at_error': student,
                     'gold_line_text': g('gold_line_text') or None, 'final_matches_key_expected': final_expected, 'labels_sha': None})
    if problems:
        print('labels.csv problems (nothing written):')
        for x in problems:
            print('  ', x)
        return 1
    ids = {r['id'] for r in rows}
    merged = [r for r in old if r['id'] not in ids] + rows
    h = stamp(merged)
    save_sample(merged)
    print('local: %d rows from %s -> sample.json now %d rows %s' % (len(rows), p, len(merged), dict(collections.Counter(r['label'] for r in merged))))
    print('labels_sha', h)
    return 0


def gate_offline(sample):
    """(a) label leak per row x condition, (b) image bounds, (c) the scoring negative control. Returns a failure list."""
    fails = []
    conds = CONDS + ['reader_openai']
    n_bodies = 0
    for q in sample:
        b64 = base64.b64encode(open(photo_path(q), 'rb').read()).decode()
        raw = base64.b64decode(b64)
        if raw[:2] != b'\xff\xd8':
            fails.append('%s: photo is not a JPEG' % q['id'])
        if len(raw) >= MAX_BYTES:
            fails.append('%s: photo %d bytes >= %d' % (q['id'], len(raw), MAX_BYTES))
        im = Image.open(io.BytesIO(raw))
        if max(im.size) > MAX_SIDE:
            fails.append('%s: photo max side %d > %d' % (q['id'], max(im.size), MAX_SIDE))
        exp = ((q.get('fermat') or {}).get('exp') or '')
        for c in conds:
            body = build_body(q, c, 'offline-gate-token', b64)
            n_bodies += 1
            extra = set(body) - BODY_KEYS
            if extra:
                fails.append('%s/%s: body has keys outside the contract: %s' % (q['id'], c, sorted(extra)))
            if body['image'] != b64:
                fails.append('%s/%s: image field is not the photo' % (q['id'], c))
            if body['reference'] != q['reference']:
                fails.append('%s/%s: body.reference != q.reference' % (q['id'], c))
            text = json.dumps(dict(body, image='<image>'), ensure_ascii=False)
            for k in LABEL_KEYS:
                if '"%s"' % k in text:
                    fails.append('%s/%s: label key %r in the body' % (q['id'], c, k))
            ntext = N(text)
            ns = N(q.get('student_line_text_at_error'))
            if len(ns) >= 6 and ns in ntext:
                fails.append('%s/%s: the student\'s erroneous line text appears in the body' % (q['id'], c))
            if len(N(exp)) >= 6 and N(exp) in ntext:
                fails.append('%s/%s: the FERMAT explanation appears in the body' % (q['id'], c))
    print('(a)+(b) %d bodies over %d pages x %d conditions: %s' % (n_bodies, len(sample), len(conds), 'no leak, images in bounds' if not fails else '%d failures' % len(fails)))
    # (c) the scorer must see the dummies
    H = {'hand': {}, 'disputed': {}, 'excluded': {}}
    results = [dummy_row(q, c) for c in DUMMIES for q in sample]
    per, _ = score(sample, results, H)
    planted = [q for q in sample if q['label'] == 'planted']
    n_corr = sum(1 for q in sample if q['label'] in ('correct', 'alt_method'))
    an_loc = sum(1 for q in planted if isinstance(q.get('planted_line'), int) and q['planted_line'] <= 2)
    an_acc = sum(1 for q in planted if 'calculation' in (q.get('planted_class_accept') or []))
    an_str = sum(1 for q in planted if q.get('planted_class') == 'calculation')
    me, mc = per['dummy_error']['m'], per['dummy_correct']['m']

    def check(name, got, want):
        ok = got == want
        print('  %s %-58s got %-14s want %s' % ('OK ' if ok else 'FAIL', name, got, want))
        if not ok:
            fails.append('control: %s got %r want %r' % (name, got, want))
    print('(c) scoring negative control (dummy_error = always ERROR at line 1/calculation; dummy_correct = always CORRECT):')
    if n_corr:
        check('false_error(dummy_error) = 100%', pct(me['false_error'], me['n_correct']), pct(n_corr, n_corr))
        check('false_error(dummy_correct) = 0', pct(mc['false_error'], mc['n_correct']), pct(0, n_corr))
    else:
        print('  n/a  no correct/alt_method pages in the sample - the false-error control is not exercised')
    check('unsure(dummy_error) = 0', me['unsure'], 0)
    check('unsure(dummy_correct) = 0', mc['unsure'], 0)
    if planted:
        check('caught(dummy_error) = all planted', pct(me['caught'], me['n_planted']), pct(len(planted), len(planted)))
        check('caught(dummy_correct) = 0', pct(mc['caught'], mc['n_planted']), pct(0, len(planted)))
        check('localised(dummy_error) = analytic count(planted_line <= 2)/planted', pct(me['localised'], me['caught']), pct(an_loc, len(planted)))
        check('class_accept(dummy_error) = share whose accept-set has calculation', pct(me['class_accept'], me['caught']), pct(an_acc, len(planted)))
        check('class_strict(dummy_error) = share whose class is calculation', pct(me['class_strict'], me['caught']), pct(an_str, len(planted)))
    else:
        print('  n/a  no planted pages in the sample - the localisation control is not exercised')
    return fails


def call_review(q, cond, token, ep):
    """One page through the deployed function. Returns the results row (an `error` key = not done, retried on resume)."""
    b64 = base64.b64encode(open(photo_path(q), 'rb').read()).decode()
    body = build_body(q, cond, token, b64)
    meta = {'id': q['id'], 'cond': cond, 'labels_sha': q.get('labels_sha'), 'request_sha': request_sha(body), 'origin': ORIGIN,
            'endpoint_host': host_of(ep)}
    headers = {'Content-Type': 'application/json', 'Origin': ORIGIN}
    for attempt in range(7):
        t0 = time.time()
        j, err = _lib._post(ep, body, headers, timeout=180, retries=2)
        ms_wall = int(1000 * (time.time() - t0))
        row = dict(meta, at=now_iso(), ms_wall=ms_wall)
        if err:
            m = re.match(r'HTTP (\d+)', err)
            row['http_status'] = int(m.group(1)) if m else None
            row['error'] = err[:300]
            if row['http_status'] == 403:
                row['stop'] = '403: put REVIEW_ORIGIN (%s) in EP_ALLOWED_ORIGINS / EP_OPEN_ORIGINS of ep-review' % ORIGIN
            return row
        row['http_status'] = 200
        if j.get('locked'):
            row.update(error='locked (device not entitled on this origin)', stop='locked: use the preview origin (EP_OPEN_ORIGINS)')
            return row
        if j.get('ok') is False and j.get('reason') == 'busy' and attempt < 6:
            time.sleep(20)
            continue
        break
    for k, v in j.items():
        if k in ('image',) or k in LABEL_KEYS:
            continue
        row[k] = v
    if j.get('ok') is False:
        reason = j.get('reason')
        if reason in ('quiet', 'down'):
            row.update(error='reply %s' % reason, stop='reply %s - stop (daily USD cap / unconfigured / ledger down)' % reason)
        elif reason == 'cap':
            row.update(error='reply cap', stop='device cap - use the preview origin (REVIEW_ORIGIN in EP_OPEN_ORIGINS)')
        elif reason == 'busy':
            row['error'] = 'busy after 6 retries'
    return row


def gate_live(sample):
    fails = []
    if os.environ.get('BANK_ALLOW_API') != '1':
        return ['--live needs BANK_ALLOW_API=1 (about $0.10)']
    token, ep = env_opt('EP_PROBE_TOKEN'), endpoint()
    if not token or not ep:
        return ['--live needs EP_PROBE_TOKEN and an endpoint (EP_REVIEW_BASE / EP_SOLVE_BASE)']
    H = load_hand()
    pages = [q for q in sample if q['id'] not in H['excluded']]
    if not pages:
        return ['no pages']
    q = pages[0]
    log = os.path.join(OUT, 'gate_live.jsonl')
    print('(live) one page (%s) per condition against %s from origin %s' % (q['id'], host_of(ep), ORIGIN))
    twice = []
    for c in CONDS + ['full']:
        row = call_review(q, c, token, ep)
        _lib.jsonl_append(log, row)
        if row.get('stop'):
            return [row['stop']]
        if row.get('error') or not row.get('ok'):
            fails.append('%s: %s' % (c, row.get('error') or 'ok:false reason %s' % row.get('reason')))
            print('  %-13s %s' % (c, row.get('error') or row.get('reason')))
            continue
        missing = [k for k in LIVE_REPLY_REQUIRED if k not in row]
        if missing:
            fails.append('%s: reply lacks %s' % (c, missing))
        if not supported(c, row.get('judges_ran')):
            fails.append('%s: judges_ran %s does not prove the ablation (unsupported)' % (c, row.get('judges_ran')))
        print('  %-13s verdict %-8s line %-4s class %-12s judges_ran %-8s escalated %-5s cost $%s ms %s review_id %s' % (
            c, row.get('verdict'), row.get('first_error_line'), row.get('error_class'), ','.join(row.get('judges_ran') or []),
            row.get('escalated'), row.get('cost_usd'), row.get('ms'), row.get('review_id')))
        if c == 'full':
            twice.append(row)
    if len(twice) == 2:
        a, b = twice
        print('  same body twice under full: verdict %s / %s, cost $%s / $%s, review_id %s / %s' % (
            a.get('verdict'), b.get('verdict'), a.get('cost_usd'), b.get('cost_usd'), a.get('review_id'), b.get('review_id')))
        if a.get('verdict') != b.get('verdict'):
            fails.append('same body twice under full gave different verdicts %s / %s' % (a.get('verdict'), b.get('verdict')))
        if a.get('review_id') is not None and a.get('review_id') == b.get('review_id'):
            fails.append('same body twice returned the same review_id')
    return fails


def cmd_gate(rest):
    sample = load_sample()
    print('gate over %d pages (%s)' % (len(sample), dict(collections.Counter(q['label'] for q in sample))))
    fails = gate_offline(sample)
    if '--live' in rest and not fails:
        fails += gate_live(sample)
    for f in fails:
        print('  FAIL', f)
    print('GATE', 'PASS' if not fails else 'FAIL (%d)' % len(fails))
    return 0 if not fails else 1


def cmd_run(rest):
    pos, skip = [], False
    for a in rest:
        if skip:
            skip = False
        elif a.startswith('--'):
            skip = '=' not in a          # `--name value` consumes the next argument
        else:
            pos.append(a)
    conds = pos[0].split(',') if pos else ['full', 'product']
    workers = int(pos[1]) if len(pos) > 1 else 2
    max_usd = float(opt(rest, '--max-usd', 12))
    ids = set((opt(rest, '--ids') or '').split(',')) - {''}
    twice = int(opt(rest, '--twice', 0))
    for c in conds:
        overrides(c)
    live = [c for c in conds if c not in DUMMIES] + (['full'] if twice else [])
    token = ep = None
    if live:
        if os.environ.get('BANK_ALLOW_API') != '1':
            sys.exit('a paid run needs BANK_ALLOW_API=1 set on purpose (the dummy conditions run without it)')
        token, ep = env_opt('EP_PROBE_TOKEN'), endpoint()
        if not token:
            sys.exit('EP_PROBE_TOKEN is absent (.env.local) - the probe token labels the actor eapcet_probe')
        if not ep:
            sys.exit('no endpoint: set EP_REVIEW_BASE (or EP_SOLVE_BASE with /ep-solve)')
    sample = load_sample()
    H = load_hand()
    qs = [q for q in sample if q['id'] not in H['excluded'] and (not ids or q['id'] in ids)]
    path = os.path.join(OUT, 'results.jsonl')
    done = {(r['id'], r['cond'], r.get('rep', 1)) for r in _lib.jsonl_read(path) if not r.get('error')}
    jobs = [(q, c, 1) for c in conds for q in qs if (q['id'], c, 1) not in done]
    if twice:
        firsts = [q for q in qs if q['label'] == 'planted'][:twice] + [q for q in qs if q['label'] == 'correct'][:twice]
        jobs += [(q, 'full', 2) for q in firsts if (q['id'], 'full', 2) not in done]
    print('run %s: %d jobs (%d done before, %d excluded), %d workers, max $%.2f, origin %s, endpoint %s' % (
        ','.join(conds), len(jobs), len(done), len(sample) - len(qs), workers, max_usd, ORIGIN if live else 'offline', host_of(ep) or 'dummy'), flush=True)
    lock, stop = threading.Lock(), threading.Event()
    spent, estimated, n_done = [0.0], [0], [0]

    def one(job):
        if stop.is_set():
            return
        q, c, rep = job
        if c in DUMMIES:
            row = dummy_row(q, c, rep)
        else:
            row = call_review(q, c, token, ep)
            row['rep'] = rep
        with lock:
            _lib.jsonl_append(path, row)
            n_done[0] += 1
            if row.get('ok'):
                if row.get('cost_usd') is None:
                    spent[0] += EST_USD
                    estimated[0] += 1
                else:
                    spent[0] += float(row['cost_usd'])
            print('%-13s %-14s rep%d %-8s line %-4s %-12s judges %-6s %6dms $%-8s | spent $%.4f%s %s' % (
                c, q['id'][-14:], rep, row.get('verdict') or (row.get('reason') or '-'), row.get('first_error_line') or '-', row.get('error_class') or '-',
                ','.join(row.get('judges_ran') or []) or '-', row.get('ms') or row.get('ms_wall', 0), row.get('cost_usd') if row.get('cost_usd') is not None else 'est',
                spent[0], (' (%d estimated)' % estimated[0]) if estimated[0] else '', (row.get('error') or '')[:70]), flush=True)
            if row.get('stop'):
                print('STOP:', row['stop'], flush=True)
                stop.set()
            elif spent[0] > max_usd:
                print('STOP: spend $%.4f past --max-usd %.2f' % (spent[0], max_usd), flush=True)
                stop.set()
    with ThreadPoolExecutor(max_workers=max(1, workers)) as ex:
        list(ex.map(one, jobs))
    print('run %s: %d rows written, $%.4f%s' % ('stopped' if stop.is_set() else 'complete', n_done[0], spent[0], ' (%d rows at the $%.3f estimate)' % (estimated[0], EST_USD) if estimated[0] else ''))
    return 0


HONESTY = [
    '30 pages per cell ~ +-5 points; a <= 2% false-error target on 30 correct pages is met only by ZERO misses; one miss (3.3%) is inside the noise and is reported as *not proven*, not *failed*; seeing 2% at all needs >= 50 correct pages.',
    'FERMAT pages are grade 7-12 maths by paid annotators copying a perturbed solution, not EAPCET physics by students; alt_method and messy cells are the founder\'s pages only; a pass here is necessary, not sufficient.',
    'over-correction denominator = over_corrected + faithful; ambiguous, unmatched and unreadable pages are shown beside it and never inside it.',
]


def is_right(q, rec):
    """The row needs no hand pass: a planted page caught, localised and classed; a correct/alt_method page CORRECT;
    a messy page answered at all (it has no single expected verdict). Excluded / disputed rows are settled already."""
    v = rec['verdict']
    if v in ('excluded', 'disputed'):
        return True
    if q['label'] == 'planted':
        return v == 'ERROR' and rec['loc'] in ('anchor', 'integer', 'hand') and bool(rec['cls_accept'])
    if q['label'] in ('correct', 'alt_method'):
        return v == 'CORRECT'
    return v != 'no_answer'


def cmd_report(rest):
    sample = load_sample()
    path = os.path.join(OUT, 'results.jsonl')
    if not os.path.exists(path):
        sys.exit('no %s - run `run` first' % path)
    results = _lib.jsonl_read(path)
    H = load_hand()
    per, recs = score(sample, results, H)
    by_id = {q['id']: q for q in sample}
    conds = list(per)
    if '--list' in rest:
        n = 0
        for rec in recs:
            q = by_id[rec['id']]
            v = rec['verdict']
            if not is_right(q, rec) or rec['over'] in ('ambiguous', 'unmatched'):
                n += 1
                print('NONRIGHT %-16s %-13s %-10s verdict %-9s line %-4s class %-12s loc %-8s cls_ok %-5s transcribe %-14s | planted %s %s | %s' % (
                    rec['id'], rec['cond'], q['label'], v, rec['first_error_line'], rec['error_class'], rec['loc'], rec['cls_accept'], rec['over'],
                    q.get('planted_line'), q.get('planted_class'), (q.get('student_line_text_at_error') or '')[:60]))
        print('%d rows for the hand pass (hand.json keys: "<id>|<cond>": {"verdict","loc","cls"}, "<id>|transcribe": "faithful|over_corrected|unreadable")' % n)
        return 0
    L = []
    date = datetime.date.today().isoformat()
    L.append('# Run 15 - the Solution Reviewer on labelled handwritten pages (%s)' % date)
    L.append('')
    L.append('Script `scripts/model_probes/review_probe.py`; data `docs/reports/model_probes/data/%s/`; %d pages %s; labels_sha `%s`; %d result rows.' % (
        RUN, len(sample), dict(collections.Counter(q['label'] for q in sample)), (sample[0].get('labels_sha') or '')[:12] if sample else '', len(results)))
    L.append('')
    L.append('## Per-condition metrics')
    L.append('')
    L.append('| condition | supported | n correct | false-error | n planted | caught | localised +-1 (strict anchor) | late_hit | class strict / accept | UNSURE | $/review | s mean / p95 | judges_ran | escalated | disputed / excluded / no-answer |')
    L.append('|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|')
    total_usd, total_calls = 0.0, 0
    for c in conds:
        m, P = per[c]['m'], per[c]
        sup = 'yes' if P['supported'] else 'NO (%d/%d judges_ran mismatch)' % (m['unsupported'], m['scored'])
        usd = ('$%.4f' % mean(P['costs'])) if P['costs'] else '-'
        if m['cost_missing']:
            usd += ' (%d missing)' % m['cost_missing']
        total_usd += sum(P['costs'])
        total_calls += m['scored']
        L.append('| %s | %s | %d | %s | %d | %s | %s (%s) | %d | %s / %s | %s | %s | %.1f / %.1f | %s | %s | %d / %d / %d |' % (
            c, sup, m['n_correct'], pct(m['false_error'], m['n_correct']), m['n_planted'], pct(m['caught'], m['n_planted']),
            pct(m['localised'], m['caught']), pct(m['localised_strict'], m['caught']), m['loc_late_hit'],
            pct(m['class_strict'], m['caught']), pct(m['class_accept'], m['caught']), pct(m['unsure'], m['scored']), usd,
            mean(P['lat']), p95(P['lat']), ', '.join('%s:%d' % kv for kv in P['judges_ran'].most_common()), pct(m['escalated'], m['scored']),
            m['disputed'], m['excluded'], m['no_answer']))
    L.append('')
    L.append('## Verdict grid (label x condition)')
    L.append('')
    L.append('| label | ' + ' | '.join(conds) + ' |')
    L.append('|---|' + '---|' * len(conds))
    for lab in LABELS:
        cells = []
        for c in conds:
            v = collections.Counter(r['verdict'] for r in recs if r['cond'] == c and r['label'] == lab)
            if not v:
                cells.append('-')
                continue
            cells.append('C %d / E %d / U %d; disp %d excl %d none %d' % (v['CORRECT'], v['ERROR'], v['UNSURE'], v['disputed'], v['excluded'], v['no_answer']))
        L.append('| %s | %s |' % (lab, ' | '.join(cells)))
    L.append('')
    L.append('## Class confusion (planted pages caught, planted_class -> error_class)')
    L.append('')
    conf = collections.Counter((by_id[r['id']].get('planted_class'), r['error_class'], r['cond']) for r in recs if r['label'] == 'planted' and r['verdict'] == 'ERROR')
    for (pc, ec, c), n in sorted(conf.items(), key=lambda kv: (kv[0][2], str(kv[0][0]), str(kv[0][1]))):
        L.append('- %s: %s -> %s: %d' % (c, pc, ec, n))
    L.append('')
    L.append('## FERMAT sub-types (Non-Propagated Step Error and Copy Error called out)')
    L.append('')
    L.append('| condition | axis / subtype | n | caught | localised | class accept |')
    L.append('|---|---|---|---|---|---|')
    for c in conds:
        st = collections.defaultdict(collections.Counter)
        for r in recs:
            q = by_id[r['id']]
            if r['cond'] != c or q['label'] != 'planted' or not q.get('fermat'):
                continue
            k = '%s / %s' % (q['fermat'].get('axis'), q['fermat'].get('subtype') or '-')
            st[k]['n'] += 1
            if r['verdict'] == 'ERROR':
                st[k]['caught'] += 1
                st[k]['loc'] += r['loc'] in ('anchor', 'integer', 'hand')
                st[k]['acc'] += bool(r['cls_accept'])
        for k, v in sorted(st.items(), key=lambda kv: ('non-propagated' not in kv[0].lower() and 'copy' not in kv[0].lower(), kv[0])):
            L.append('| %s | %s | %d | %s | %s | %s |' % (c, k, v['n'], pct(v['caught'], v['n']), pct(v['loc'], v['caught']), pct(v['acc'], v['caught'])))
    L.append('')
    L.append('## Over-correction per reader')
    L.append('')
    readers = collections.defaultdict(collections.Counter)
    for c in conds:
        if c not in DUMMIES:
            readers[reader_of(c)].update(per[c]['over'])
    over_lines = []
    for rd, o in sorted(readers.items()):
        den = o['over_corrected'] + o['faithful']
        over_lines.append('%s: over_corrected %s; ambiguous %d, unmatched %d, unreadable %d' % (rd, pct(o['over_corrected'], den), o['ambiguous'], o['unmatched'], o['unreadable']))
    L += ['- ' + x for x in over_lines] or ['- no planted page has a transcript yet']
    L.append('')
    L.append('## Idempotency (same body twice under full, rep 2 vs rep 1)')
    L.append('')
    last = last_rows(results)
    agree, tot, idem_lines = 0, 0, []
    for (qid, c, rep), r2 in sorted(last.items()):
        if rep != 2 or c != 'full':
            continue
        r1 = last.get((qid, c, 1))
        if not r1:
            continue
        tot += 1
        same = r1.get('verdict') == r2.get('verdict') and r1.get('first_error_line') == r2.get('first_error_line')
        agree += same
        idem_lines.append('| %s | %s / %s | %s / %s | $%s / $%s | %s / %s | %s |' % (qid, r1.get('verdict'), r2.get('verdict'), r1.get('first_error_line'), r2.get('first_error_line'),
                                                                                   r1.get('cost_usd'), r2.get('cost_usd'), r1.get('review_id'), r2.get('review_id'), 'same' if same else 'DIFFERENT'))
    if idem_lines:
        L += ['| page | verdict 1 / 2 | line 1 / 2 | cost 1 / 2 | review_id 1 / 2 | |', '|---|---|---|---|---|---|'] + idem_lines
    L.append('- agreement %s' % pct(agree, tot))
    L.append('')
    L.append('## Honesty')
    L.append('')
    for h in HONESTY:
        L.append('- ' + h)
    unsup = [c for c in conds if not per[c]['supported']]
    L.append('- unsupported conditions (judges_ran did not prove the ablation): %s' % (', '.join(unsup) if unsup else 'none'))
    L.append('- n per cell: ' + '; '.join('%s: %d correct / %d planted' % (c, per[c]['m']['n_correct'], per[c]['m']['n_planted']) for c in conds))
    L.append('')
    L.append('## The `## 26. Run 15` block for docs/MODEL_PROBES.md (paste after line 442)')
    L.append('')
    L += run15_block(sample, per, conds, over_lines, agree, tot, total_usd, total_calls, date)
    print('\n'.join(L))
    os.makedirs(REPORT_DIR, exist_ok=True)
    rp = os.path.join(REPORT_DIR, '%s_%s.md' % (RUN, date.replace('-', '_')))   # review_probe_<date>.md for the default run
    with io.open(rp, 'w', encoding='utf-8') as f:
        f.write('\n'.join(L) + '\n\n')
        for q in sample:
            fm = q.get('fermat') or {}
            f.write('---\n\n## %s - %s%s\n\n' % (q['id'], q['label'], (' (%s / %s)' % (fm.get('axis'), fm.get('subtype') or '-')) if fm else ''))
            f.write('**Question.** %s\n\n' % (q['reference'].get('question_text') or '').strip())
            if q['reference'].get('options'):
                f.write('Options: %s\n\n' % ' | '.join(q['reference']['options']))
            f.write('Key: %s\n\n' % (q['reference'].get('key_option') if q['reference'].get('key_option') is not None else q['reference'].get('key_value')))
            f.write('**Our reference steps (gold).**\n\n```\n' + '\n'.join(s['text'] for s in q['reference']['steps']) + '\n```\n\n')
            if q['label'] == 'planted':
                f.write('Planted: line %s (%s, source %s) — class %s (accept %s)\n\n' % (q.get('planted_line'), q.get('planted_lines'), q.get('line_source'), q.get('planted_class'), q.get('planted_class_accept')))
            for c in conds:
                r = last.get((q['id'], c, 1))
                if not r:
                    continue
                rec = next((x for x in recs if x['id'] == q['id'] and x['cond'] == c), {})
                f.write('### %s - %s\n\n' % (c, rec.get('verdict')))
                if r.get('error'):
                    f.write('ERROR: %s\n\n' % r['error'])
                    continue
                if not r.get('ok'):
                    f.write('ok:false reason %s\n\n' % r.get('reason'))
                    continue
                ev = r.get('evidence_line') or {}
                f.write('line %s · class %s · what_should_be: %s · evidence_line: %s · judges_ran %s · escalated %s (%s) · $%s · %s ms · loc %s · transcribe %s\n\n' % (
                    r.get('first_error_line'), r.get('error_class'), r.get('what_should_be'), (ev.get('text') if isinstance(ev, dict) else ev),
                    r.get('judges_ran'), r.get('escalated'), r.get('escalation_reason'), r.get('cost_usd'), r.get('ms'), rec.get('loc'), rec.get('over')))
                tr = r.get('transcript') or []
                f.write('```\n' + '\n'.join('%2s [%s %.2f] %s' % (l.get('n'), l.get('kind'), l.get('legible') or 0, l.get('text') or l.get('tex') or '') for l in tr) + '\n```\n\n')
    print('\nreport', rp)
    return 0


def run15_block(sample, per, conds, over_lines, agree, tot, total_usd, total_calls, date):
    cnt = collections.Counter(q['label'] for q in sample)
    axes = collections.Counter((q.get('fermat') or {}).get('axis') for q in sample if q['label'] == 'planted' and q.get('fermat'))
    n_su = sum(1 for q in sample if q['label'] == 'correct' and q.get('fermat'))
    n_loc_corr = cnt['correct'] - n_su
    B = []
    B.append('## 26. Run 15 - the Solution Reviewer on labelled handwritten pages: false-error, localisation, over-correction (%s)' % date)
    B.append('')
    B.append('Founder ask (2026-09-15/16): students upload their own working and talk to the AI instead of asking for answers; the reviewer '
             '(`ep-review`: read -> code checks -> judges -> code arbiter) is the core of the coaching loop and its biggest cost line, and nothing '
             'about handwriting had been measured on any model. Set: **%d pages** - planted %d (FERMAT axes CO %d, CP %d, NO %d, PR %d), correct %d '
             '(FERMAT SU %d + local %d), alt_method %d (local), messy %d; `labels_sha` `%s`. Script `scripts/model_probes/review_probe.py`; data '
             '`docs/reports/model_probes/data/%s/`; report `docs/reports/model_probes/%s_%s.md`. %d scored calls, **$%.2f** in total.' % (
                 len(sample), cnt['planted'], axes['CO'], axes['CP'], axes['NO'], axes['PR'], cnt['correct'], n_su, n_loc_corr, cnt['alt_method'], cnt['messy'],
                 (sample[0].get('labels_sha') or '')[:12] if sample else '', RUN, RUN, date.replace('-', '_'), total_calls, total_usd))
    B.append('')
    B.append('| condition | n correct | false-error | n planted | caught | localised +-1 | class strict / accept | UNSURE | $/review | s mean / p95 | judges_ran | escalated |')
    B.append('|---|---|---|---|---|---|---|---|---|---|---|---|')
    for c in ['product', 'full', 'judge_b_only', 'judge_a_only', 'no_s2', 'reader_openai'] + [x for x in conds if x.startswith('reader_') and x != 'reader_openai'] + ['dummy_error']:
        if c not in per:
            B.append('| %s | - | - | - | - | - | - | - | - | - | not run | - |' % c)
            continue
        m, P = per[c]['m'], per[c]
        if not P['supported']:
            B.append('| %s | %d | unsupported (judges_ran mismatch on %d/%d) | %d | - | - | - | - | - | - | %s | - |' % (
                c, m['n_correct'], m['unsupported'], m['scored'], m['n_planted'], ', '.join('%s:%d' % kv for kv in P['judges_ran'].most_common())))
            continue
        B.append('| %s | %d | **%s** | %d | %s | %s | %s / %s | %s | %s | %.1f / %.1f | %s | %s |' % (
            c + (' (control)' if c in DUMMIES else ''), m['n_correct'], pct(m['false_error'], m['n_correct']), m['n_planted'], pct(m['caught'], m['n_planted']),
            pct(m['localised'], m['caught']), pct(m['class_strict'], m['caught']), pct(m['class_accept'], m['caught']), pct(m['unsure'], m['scored']),
            ('$%.4f' % mean(P['costs'])) if P['costs'] else '-', mean(P['lat']), p95(P['lat']), ', '.join('%s:%d' % kv for kv in P['judges_ran'].most_common()),
            pct(m['escalated'], m['scored'])))
    B.append('')
    B.append('**Over-correction** (per reader; rate = over_corrected / (over_corrected + faithful), the rest beside it): %s.' % ('; '.join(over_lines) if over_lines else 'no planted page transcribed yet'))
    B.append('')
    B.append('**Class map** (FERMAT axis -> our error_class, accept-set in braces): CO -> calculation {calculation}; Copy Error -> reading {reading, calculation}; '
             'CP -> concept {concept, method}; NO -> presentation {presentation, calculation}; PR -> presentation {presentation, convention}; SU -> correct.')
    B.append('')
    de = per.get('dummy_error', {}).get('m')
    B.append('**Controls:** the always-ERROR dummy scores %s false-error and %s localisation (the analytic value for a line-1 guess) - the scorer sees what it scores; '
             'the same photo twice under `full` agreed on %s verdicts.' % (
                 pct(de['false_error'], de['n_correct']) if de else 'n/a', pct(de['localised'], de['caught']) if de else 'n/a', pct(agree, tot) if tot else 'n/a (run with --twice K)'))
    B.append('')
    for h in HONESTY:
        B.append('- ' + h)
    unsup = [c for c in conds if not per[c]['supported']]
    B.append('- unsupported conditions: %s.' % (', '.join(unsup) if unsup else 'none'))
    B.append('')
    B.append('**Reading.** _(paragraph 1 - the trust number: the false-error rate on correct + alt_method pages against the 2%% target, what zero misses on %d pages does and does not prove.)_' % (cnt['correct'] + cnt['alt_method']))
    B.append('')
    B.append('_(paragraph 2 - the ablation deltas (full vs product vs judge_b_only vs judge_a_only vs no_s2, and the reader) against +-5-point noise; what changes before shipping.)_')
    return B


def main(argv):
    sys.stdout.reconfigure(encoding='utf-8')
    cmd = argv[0] if argv else 'env'
    rest = argv[1:]
    cmds = {'env': cmd_env, 'inspect': cmd_inspect, 'fermat': cmd_fermat, 'local': cmd_local, 'gate': cmd_gate, 'run': cmd_run, 'report': cmd_report}
    if cmd not in cmds:
        print(__doc__)
        return 2
    return cmds[cmd](rest) or 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
