"""JEE Main 2024 FIGURE-question selector: the questions whose crop carries a diagram, circuit,
graph or structure. Builds on jee_extract.py (same PDFs, same column parsing, same crop effect).

Two changes to the extractor: an 'Ans.' that sits as a later LINE inside a merged text block no
longer drops the question - the crop ends just above that line (still no key, no solution ink);
and each crop rect is scanned for ink clusters. A figure is a connected cluster of vector
drawing rects (>2x2 pt, merged with 6 pt padding) at least 45x38 pt, or a cluster of raster
image bboxes (>8x8 pt) at least 70x45 pt - the thresholds that keep out inline vector-hat
bitmaps, braces and radicals. Questions used in Run 2 are excluded so the sets are independent.

usage: python scripts/model_probes/jee_figure_select.py [select|sheet]
"""
import collections, io, json, os, random, re, sys
import pymupdf
from PIL import Image, ImageDraw

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import jee_extract as JX

REPO = os.path.dirname(os.path.dirname(HERE))
RUN = os.environ.get('DS_PROBE_OUT', 'jee_figures')
OUT = os.path.join(REPO, 'docs', 'reports', 'model_probes', 'data', RUN)
IMG = os.path.join(REPO, 'pdfs', 'probes', RUN, 'photos')
PRIOR = os.path.join(REPO, 'docs', 'reports', 'model_probes', 'data', 'jee_main_2026_09_10', 'sample.json')
SUBJECTS = ('physics', 'chemistry')
PER_SUBJECT = 30
SEED = 20260912
PAD = 6
VEC_MIN = {'physics': (45, 38), 'maths': (45, 38), 'chemistry': (26, 22)}   # structures are small vector clusters
RAS_MIN = {'physics': (70, 45), 'maths': (70, 45), 'chemistry': (40, 30)}
LEAK = re.compile(r'^\s*(Ans|Sol|NTA Ans)\.?\s*[:(]', re.I)


def merge_clusters(rects):
    rs = [pymupdf.Rect(r) for r in rects]
    changed = True
    while changed:
        changed = False
        out = []
        while rs:
            a = rs.pop()
            ap = pymupdf.Rect(a.x0 - PAD, a.y0 - PAD, a.x1 + PAD, a.y1 + PAD)
            keep = []
            for b in rs:
                if ap.intersects(b):
                    a = a | b
                    ap = pymupdf.Rect(a.x0 - PAD, a.y0 - PAD, a.x1 + PAD, a.y1 + PAD)
                    changed = True
                else:
                    keep.append(b)
            rs = keep
            out.append(a)
        rs = out
    return rs


def figure_in(page, clip, drawings, images, subj):
    vec = [d['rect'] for d in drawings if d['rect'].intersects(clip) and d['rect'].width > 2 and d['rect'].height > 2]
    ras = [pymupdf.Rect(i['bbox']) for i in images if pymupdf.Rect(i['bbox']).intersects(clip)
           and pymupdf.Rect(i['bbox']).width > 8 and pymupdf.Rect(i['bbox']).height > 8]
    vm, rm = VEC_MIN[subj], RAS_MIN[subj]
    vc = [c for c in merge_clusters(vec) if c.width >= vm[0] and c.height >= vm[1]]
    rc = [c for c in merge_clusters(ras) if c.width >= rm[0] and c.height >= rm[1]]
    return bool(vc or rc), len(vc), len(rc)


def extract(pdf):
    """jee_extract.extract with the merged-block 'Ans.' fix and a figure flag per question."""
    doc = pymupdf.open(pdf)
    paper = os.path.basename(pdf)[:-4]
    subject = None
    items = []
    for pno, page in enumerate(doc):
        blocks = [b for b in page.get_text('blocks') if b[4].strip()]
        lines = [(pymupdf.Rect(l['bbox']), ''.join(s['text'] for s in l['spans']))
                 for b in page.get_text('dict')['blocks'] for l in b.get('lines', [])]
        drawings = page.get_drawings()
        images = page.get_image_info()
        for col in (0, 1):
            cb = sorted([b for b in blocks if JX.column(page, b) == col], key=lambda b: b[1])
            starts = []
            for i, b in enumerate(cb):
                t = b[4].strip()
                up = t.upper().replace(' ', '')
                for h, s in JX.HEAD.items():
                    if up.startswith(h):
                        subject = s
                m = JX.QSTART.match(t)
                if m and b[0] < page.rect.width * (0.12 if col == 0 else 0.62):
                    starts.append((i, int(m.group(1)), b, subject))
            for k, (i, qno, b, subj) in enumerate(starts):
                limit = starts[k + 1][0] if k + 1 < len(starts) else len(cb)
                ans = None
                for j in range(i, limit):
                    t = cb[j][4].strip()
                    m = JX.ANS.match(t)
                    if m:
                        ans = (j, m.group(1), m.group(2), cb[j][1]); break
                    for line in t.split('\n')[1:]:
                        mm = JX.ANS.match(line)
                        if mm:
                            # the Ans. line inside a merged block: find that line's own y
                            br = pymupdf.Rect(cb[j][:4])
                            ly = [r.y0 for r, lt in lines if br.intersects(r) and JX.ANS.match(lt.strip())]
                            ans = (j, mm.group(1), mm.group(2), min(ly)) if ly else 'unlocatable'
                            break
                    if ans:
                        break
                if not ans or ans == 'unlocatable' or not subj:
                    continue
                j, opt, num, ans_y = ans
                y0 = b[1] - 3
                y1 = ans_y - 2
                if y1 - y0 < 30:
                    continue
                x0 = 0 if col == 0 else page.rect.width / 2
                x1 = page.rect.width / 2 if col == 0 else page.rect.width
                region_text = '\n'.join(cb[t][4] for t in range(i, j + 1))
                if qno in range(21, 31) or qno in range(51, 61) or qno in range(81, 91):
                    qtype, key = 'integer', (str(opt) if opt else num)
                else:
                    qtype, key = 'mcq', (int(opt) if opt else None)
                    if key is None:
                        continue
                clip = pymupdf.Rect(x0 + 6, y0, x1 - 6, y1)
                # LEAK GATE: no Ans./Sol. line may touch the crop
                if any(r.intersects(clip) and LEAK.match(lt) for r, lt in lines):
                    continue
                fig, nv, nr = figure_in(page, clip, drawings, images, subj)
                items.append({'paper': paper, 'page': pno, 'col': col, 'qno': qno, 'subject': subj, 'qtype': qtype,
                              'answer': key, 'clip': [clip.x0, clip.y0, clip.x1, clip.y1], 'figure': fig,
                              'vec_clusters': nv, 'ras_clusters': nr, 'text_len': len(region_text)})
    return doc, items


def cmd_select():
    os.makedirs(IMG, exist_ok=True)
    prior = {q['id'] for q in json.load(io.open(PRIOR, encoding='utf-8'))}
    all_items, docs = [], {}
    for pdf in JX.PDFS:
        doc, items = extract(pdf)
        docs[os.path.basename(pdf)[:-4]] = doc
        all_items += items
    c = collections.Counter((i['subject'], i['figure']) for i in all_items)
    print('extracted', len(all_items), 'figure-flagged per subject:', {s: c[(s, True)] for s in ('maths', 'physics', 'chemistry')},
          'total per subject:', {s: c[(s, True)] + c[(s, False)] for s in ('maths', 'physics', 'chemistry')})
    rnd = random.Random(SEED)
    out = []
    for s in SUBJECTS:
        pool = [i for i in all_items if i['subject'] == s and i['figure']]
        pool = [i for i in pool if '%s_%s_q%02d' % (i['paper'].replace('jee-mains-', 'jm'), s[:3], i['qno']) not in prior]
        rnd.shuffle(pool)
        take = PER_SUBJECT + (25 if s == 'chemistry' else 10)
        print('%-10s figure pool %d (after excluding Run 2 ids), taking %d' % (s, len(pool), min(take, len(pool))))
        for it in pool[:take]:      # spares for the eye check
            qid = '%s_%s_q%02d' % (it['paper'].replace('jee-mains-', 'jm'), s[:3], it['qno'])
            path = os.path.join(IMG, qid + '.jpg')
            it['bytes'], size = JX.crop(docs[it['paper']], it, path)
            it.update({'id': qid, 'photo': path, 'size': size, 'question_en': '', 'options_en': [], 'spare': len([o for o in out if o['subject'] == s]) >= PER_SUBJECT})
            out.append(it)
    os.makedirs(OUT, exist_ok=True)
    io.open(os.path.join(OUT, 'candidates.json'), 'w', encoding='utf-8').write(json.dumps(out, ensure_ascii=False, indent=1))
    print('wrote', len(out), 'candidates (30 + 10 spares per subject) to candidates.json; run sheet, eye-check, then finalize')


def cmd_sheet():
    cands = json.load(io.open(os.path.join(OUT, 'candidates.json'), encoding='utf-8'))
    for s in SUBJECTS:
        items = [q for q in cands if q['subject'] == s]
        cols, tw, th = 6, 350, 380
        rows = (len(items) + cols - 1) // cols
        sheet = Image.new('RGB', (cols * tw, rows * th), (40, 40, 40))
        d = ImageDraw.Draw(sheet)
        for i, q in enumerate(items):
            im = Image.open(q['photo']); im.thumbnail((tw - 10, th - 30))
            x, y = (i % cols) * tw, (i // cols) * th
            sheet.paste(im, (x + 5, y + 22))
            d.text((x + 6, y + 4), '%d %s%s' % (i + 1, q['id'].replace('jm2024-', ''), ' SPARE' if q['spare'] else ''), fill=(255, 255, 120))
        p = os.path.join(os.path.dirname(IMG), 'sheet_%s.png' % s)
        sheet.save(p)
        print('sheet', p, sheet.size)


def cmd_finalize(drop):
    """Write sample.json = first 30 non-dropped candidates per subject (drop = ids judged not figures)."""
    cands = json.load(io.open(os.path.join(OUT, 'candidates.json'), encoding='utf-8'))
    out = []
    for s in SUBJECTS:
        keep = [q for q in cands if q['subject'] == s and q['id'] not in drop][:PER_SUBJECT]
        print('%-10s kept %d (dropped %d)' % (s, len(keep), sum(1 for q in cands if q['subject'] == s and q['id'] in drop)))
        out += keep
    for q in out:
        q.pop('spare', None)
    io.open(os.path.join(OUT, 'sample.json'), 'w', encoding='utf-8').write(json.dumps(out, ensure_ascii=False, indent=1))
    print('wrote sample.json', len(out), collections.Counter((q['subject'], q['qtype']) for q in out))


if __name__ == '__main__':
    cmd = sys.argv[1] if len(sys.argv) > 1 else 'select'
    if cmd == 'select':
        cmd_select()
    elif cmd == 'sheet':
        cmd_sheet()
    elif cmd == 'finalize':
        cmd_finalize(set(sys.argv[2:]))
