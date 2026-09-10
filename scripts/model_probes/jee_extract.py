"""Cut JEE Main 2024 questions out of the Allen-typed papers as images, with the key from
the 'Ans.' line that follows each question. The crop stops ABOVE the Ans. line, so the
photo the model sees carries no answer. Questions that run across a column or page
break are skipped (their crop would be incomplete).

writes ds_probe_jee/sample.json + ds_probe_jee/photos/*.jpg
"""
import glob, io, json, os, random, re, sys
import pymupdf
from PIL import Image, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(os.path.dirname(HERE))
RUN = os.environ.get('DS_PROBE_OUT', 'jee_main_2026_09_10')
OUT = os.path.join(REPO, 'docs', 'reports', 'model_probes', 'data', RUN)
IMG = os.path.join(REPO, 'pdfs', 'probes', RUN, 'photos')
PDFS = sorted(glob.glob('C:/Tutor/nta-source/jee-mains-2024/*.pdf'))
PER_SUBJECT = int(sys.argv[1]) if len(sys.argv) > 1 and sys.argv[1].isdigit() else 30
SEED = 20260910
DPI = 220
HEAD = {'MATHEMATICS': 'maths', 'PHYSICS': 'physics', 'CHEMISTRY': 'chemistry'}
QSTART = re.compile(r'^\s*(\d{1,2})\.\s')
ANS = re.compile(r'^\s*Ans\.?\s*[:\-]?\s*(?:\(\s*([1-4])\s*\)|([\-]?\d+(?:\.\d+)?))', re.I)


def column(page, b):
    mid = page.rect.width / 2
    return 0 if b[0] < mid else 1


def extract(pdf):
    doc = pymupdf.open(pdf)
    paper = os.path.basename(pdf)[:-4]
    subject = None
    items = []
    # reading order: page, column, y
    for pno, page in enumerate(doc):
        blocks = [b for b in page.get_text('blocks') if b[4].strip()]
        for col in (0, 1):
            cb = sorted([b for b in blocks if column(page, b) == col], key=lambda b: b[1])
            starts = []
            for i, b in enumerate(cb):
                t = b[4].strip()
                up = t.upper().replace(' ', '')
                for h, s in HEAD.items():
                    if up.startswith(h):
                        subject = s
                m = QSTART.match(t)
                if m and b[0] < page.rect.width * (0.12 if col == 0 else 0.62):
                    starts.append((i, int(m.group(1)), b, subject))
            for k, (i, qno, b, subj) in enumerate(starts):
                # the Ans. block must come before the next question start in this column
                limit = starts[k + 1][0] if k + 1 < len(starts) else len(cb)
                ans = None
                for j in range(i, limit):
                    t = cb[j][4].strip()
                    m = ANS.match(t)
                    if m:
                        ans = (j, m.group(1), m.group(2)); break
                    # an 'Ans.' that starts a later line inside a merged block
                    for line in t.split('\n'):
                        mm = ANS.match(line)
                        if mm and line is not t.split('\n')[0]:
                            ans = (j, mm.group(1), mm.group(2), line); break
                    if ans: break
                if not ans or not subj:
                    continue
                j, opt, num = ans[0], ans[1], ans[2]
                # crop from the question start to the top of the Ans. block; if Ans. is a later
                # line inside a merged block, the crop is unsafe -> skip
                if len(ans) == 4:
                    continue
                y0 = b[1] - 3
                y1 = cb[j][1] - 2
                if y1 - y0 < 30:
                    continue
                x0 = 0 + (0 if col == 0 else page.rect.width / 2)
                x1 = page.rect.width / 2 if col == 0 else page.rect.width
                region_text = '\n'.join(cb[t][4] for t in range(i, j))
                qtype = 'mcq' if re.search(r'\(\s*[1-4]\s*\)', region_text) else 'integer'
                key = int(opt) if opt else num
                if qtype == 'mcq' and not opt:
                    continue
                if qtype == 'integer' and opt:
                    qtype = 'mcq'
                items.append({'paper': paper, 'page': pno, 'col': col, 'qno': qno, 'subject': subj, 'qtype': qtype,
                              'answer': key, 'clip': [x0 + 6, y0, x1 - 6, y1], 'text_len': len(region_text)})
    return doc, items


def crop(doc, it, path):
    page = doc[it['page']]
    pix = page.get_pixmap(dpi=DPI, clip=pymupdf.Rect(*it['clip']))
    img = Image.frombytes('RGB', (pix.width, pix.height), pix.samples)
    # a phone photo of the page: warm paper, slight tilt, soft focus
    bg = Image.new('RGB', img.size, (247, 244, 236))
    bg.paste(img, (0, 0), None)
    img = Image.blend(img, bg, 0.12)
    img = img.rotate(random.Random(path).uniform(-1.2, 1.2), resample=Image.BICUBIC, expand=True, fillcolor=(225, 220, 210))
    img = img.filter(ImageFilter.GaussianBlur(0.4))
    img.save(path, 'JPEG', quality=82)
    return os.path.getsize(path), img.size


def main():
    os.makedirs(IMG, exist_ok=True)
    all_items = []
    docs = {}
    for pdf in PDFS:
        doc, items = extract(pdf)
        docs[os.path.basename(pdf)[:-4]] = doc
        all_items += items
    import collections
    c = collections.Counter((i['subject'], i['qtype']) for i in all_items)
    print('extracted', len(all_items), dict(c))
    rnd = random.Random(SEED)
    sample = []
    for s in ('physics', 'chemistry', 'maths'):
        pool = [i for i in all_items if i['subject'] == s]
        rnd.shuffle(pool)
        sample += pool[:PER_SUBJECT]
    out = []
    for it in sample:
        qid = '%s_%s_q%02d' % (it['paper'].replace('jee-mains-', 'jm'), it['subject'][:3], it['qno'])
        path = os.path.join(IMG, qid + '.jpg')
        it['bytes'], size = crop(docs[it['paper']], it, path)
        it.update({'id': qid, 'photo': path, 'size': size, 'question_en': '', 'options_en': []})
        out.append(it)
    io.open(os.path.join(OUT, 'sample.json'), 'w', encoding='utf-8').write(json.dumps(out, ensure_ascii=False, indent=1))
    print('sampled', len(out), collections.Counter((i['subject'], i['qtype']) for i in out))
    for it in out[:3] + out[30:33] + out[60:63]:
        print(it['id'], it['qtype'], 'key', it['answer'], it['size'], it['photo'])


if __name__ == '__main__':
    main()
