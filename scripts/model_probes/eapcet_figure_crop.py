"""EAPCET figure-question probe: sample, clean-crop, leak-gate, contact sheet.

The official crops under the corpus desk (eapcet/crops/) LEAK THE KEY twice: the green tick /
red cross icons beside each option, and the fill colour of the option-label text span (green
for the key, red for the rest). So this script re-crops the question from the source PDF after
REDACTING both on an in-memory copy: every coloured label span is replaced by the same label in
black, the icon image beside it is blanked, and any 'Chosen Option' span is removed. The result
is rendered, stitched across page breaks, and given the same phone-photo effect as the JEE crops.

Nothing is sent anywhere until `gate` passes: a pixel scan for key-green / key-red blobs on every
final JPEG, a text-layer scan for surviving coloured spans, and a NEGATIVE CONTROL - the same
pixel gate run on the ORIGINAL official crops must flag every one of them, or the gate is blind.

usage (repo root):
  python scripts/model_probes/eapcet_figure_crop.py sample   # 30 physics + 30 chemistry -> sample.json
  python scripts/model_probes/eapcet_figure_crop.py crop     # clean crops -> pdfs/probes/eapcet_figures/photos/
  python scripts/model_probes/eapcet_figure_crop.py gate     # leak gate + negative control (exit 1 on any leak)
  python scripts/model_probes/eapcet_figure_crop.py sheet    # contact sheet per subject for the eye check
"""
import collections, io, json, os, random, re, sys
import numpy as np
import pymupdf
from PIL import Image, ImageDraw, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(os.path.dirname(HERE))
CORPUS = 'C:/Tutor/physics-mind-eapcet-corpus'
sys.path.insert(0, os.path.join(CORPUS, 'scripts', 'eapcet'))
from crop_questions import markers, DEST            # noqa: E402  (marker finder + source PDF dir)
from crop_fleet import distinct_shifts, paper_id    # noqa: E402  (paper_id -> file)
from extract_key import classify, LBL_ANY, norm     # noqa: E402  (green/red by channel dominance)

RUN = os.environ.get('DS_PROBE_OUT', 'eapcet_figures')
OUT = os.path.join(REPO, 'docs', 'reports', 'model_probes', 'data', RUN)
IMG = os.path.join(REPO, 'pdfs', 'probes', RUN, 'photos')
SHEETS = os.path.join(REPO, 'pdfs', 'probes', RUN)
BANK = os.path.join(CORPUS, 'eapcet', 'bank', '%s_v1.json')
CROPS = os.path.join(CORPUS, 'eapcet', 'crops')
SUBJECTS = ('physics', 'chemistry')
PER_SUBJECT = 30
SEED = 20260911
DPI = 170
ICON_MAX = 22      # pt, long side of the tick / cross image (2025 crosses are 16.3 pt, ticks 10.9 pt)
PAPER = (247, 244, 236)


def eligible(q):
    """select_pool.exclusion_reason() minus the needs_figure drop, plus second-reader agreement."""
    return (q.get('needs_figure') and q.get('transcription_confidence') == 'high'
            and not q.get('answer_disputed') and not q.get('key_disputed_by_working') and not q.get('adjudication')
            and q.get('answer') in (1, 2, 3, 4) and q.get('answer') == q.get('vision_marked_correct')
            and isinstance(q.get('options_en'), list) and len(q['options_en']) == 4
            and all(str(o).strip() for o in q['options_en']) and str(q.get('question_en') or '').strip())


def cmd_sample():
    rnd = random.Random(SEED)
    out = []
    for s in SUBJECTS:
        qs = json.load(io.open(BANK % s, encoding='utf-8'))['questions']
        ok = [q for q in qs if eligible(q)]
        rnd.shuffle(ok)
        for q in ok[:PER_SUBJECT]:
            out.append({'id': q['id'], 'subject': s, 'chapter': q.get('chapter'), 'year': q['year'],
                        'paper_id': q['paper_id'], 'q_no': q['q_no'], 'crops': q['crops'],
                        'question_en': q['question_en'], 'options_en': q['options_en'], 'answer': q['answer'],
                        'photo': os.path.join(IMG, q['id'] + '.jpg')})
        print('%-10s eligible %3d  sampled %d  years %s' % (s, len(ok), min(PER_SUBJECT, len(ok)),
                                                             dict(collections.Counter(q['year'] for q in ok[:PER_SUBJECT]))))
        print('  chapters:', collections.Counter(q.get('chapter') for q in ok[:PER_SUBJECT]).most_common(6))
    os.makedirs(OUT, exist_ok=True)
    io.open(os.path.join(OUT, 'sample.json'), 'w', encoding='utf-8').write(json.dumps(out, ensure_ascii=False, indent=1))
    print('wrote', len(out), 'to', os.path.join(OUT, 'sample.json'))


def sanitize(page, icon_sizes, prev_labels):
    """Redact every key leak on one page. Returns [[label_rect, had_icon]], icons, chosen.

    icon_sizes: (w, h) of icons matched so far in this document; prev_labels: the previous page's
    label list, so an icon that wrapped to the top of this page is credited to its label."""
    labels, chosen_rects, digit_spans = [], [], []
    for b in page.get_text('dict')['blocks']:
        for l in b.get('lines', []):
            for s in l['spans']:
                t = s['text'].strip()
                if not t:
                    continue
                n = norm(t)
                r = pymupdf.Rect(s['bbox'])
                if n.lower().startswith('chosenoption'):
                    page.add_redact_annot(r, fill=(1, 1, 1))
                    chosen_rects.append(r)
                    continue
                if re.fullmatch(r'[1-4]', n):
                    digit_spans.append(r)
                k = classify(s['color'])
                if k and LBL_ANY.match(n):
                    page.add_redact_annot(r, text=t, fontname='helv', fontsize=s['size'],
                                          text_color=(0, 0, 0), fill=(1, 1, 1), align=0)
                    labels.append([r, False])
    # the VALUE of 'Chosen Option' is its own span: a bare digit just below / beside the label
    for cr in chosen_rects:
        for d in digit_spans:
            if cr.x0 - 150 <= d.x0 <= cr.x1 + 150 and cr.y0 - 4 <= d.y0 <= cr.y1 + 30:
                page.add_redact_annot(d, fill=(1, 1, 1))
    # the tick / cross icon: a small raster image hugging the label span on the same line band
    icons = 0
    small = [pymupdf.Rect(im['bbox']) for im in page.get_image_info()]
    small = [bb for bb in small if max(bb.width, bb.height) <= ICON_MAX]
    unmatched = []
    for bb in small:
        cy = (bb.y0 + bb.y1) / 2
        hit = False
        for lab in labels:
            r = lab[0]
            if abs(cy - (r.y0 + r.y1) / 2) <= 8 and (r.x1 - 3 <= bb.x0 <= r.x1 + 8 or r.x0 - 8 <= bb.x1 <= r.x0 + 3):
                page.add_redact_annot(bb, fill=(1, 1, 1))
                lab[1] = True
                icons += 1
                icon_sizes.add((round(bb.width, 1), round(bb.height, 1)))
                hit = True
                break
        if not hit:
            unmatched.append(bb)
    # an icon that WRAPPED to the top of the page: same size as the document's icons, sitting in the
    # label margin with nothing to its left on its line - it belongs to the previous page's last label
    spans_x = [(pymupdf.Rect(s['bbox'])) for b in page.get_text('dict')['blocks'] for l in b.get('lines', []) for s in l['spans'] if s['text'].strip()]
    for bb in unmatched:
        if (round(bb.width, 1), round(bb.height, 1)) not in icon_sizes or bb.x0 > 60:
            continue
        cy = (bb.y0 + bb.y1) / 2
        if any(abs((r.y0 + r.y1) / 2 - cy) <= 8 and r.x0 < bb.x0 for r in spans_x):
            continue
        page.add_redact_annot(bb, fill=(1, 1, 1))
        icons += 1
        owner = [lab for lab in prev_labels if not lab[1]]
        if owner:
            owner[-1][1] = True
    if labels or icons or chosen_rects:
        page.apply_redactions(images=pymupdf.PDF_REDACT_IMAGE_PIXELS)
    return labels, icons, len(chosen_rects)


def leftover_colour(page, y0, y1):
    """Coloured label spans or 'Chosen Option' text still present between y0 and y1 after redaction."""
    bad = []
    for b in page.get_text('dict')['blocks']:
        for l in b.get('lines', []):
            for s in l['spans']:
                t = s['text'].strip()
                if not t or s['bbox'][3] < y0 or s['bbox'][1] > y1:
                    continue
                if classify(s['color']) or norm(t).lower().startswith('chosenoption'):
                    bad.append(t[:20])
    return bad


def photo_effect(img, seed):
    bg = Image.new('RGB', img.size, PAPER)
    img = Image.blend(img, bg, 0.12)
    img = img.rotate(random.Random(seed).uniform(-1.2, 1.2), resample=Image.BICUBIC, expand=True, fillcolor=(225, 220, 210))
    return img.filter(ImageFilter.GaussianBlur(0.4))


def cmd_crop():
    qs = json.load(io.open(os.path.join(OUT, 'sample.json'), encoding='utf-8'))
    files = {paper_id(r): r['file'] for r in distinct_shifts()}
    os.makedirs(IMG, exist_ok=True)
    by_paper = collections.defaultdict(list)
    for q in qs:
        by_paper[q['paper_id']].append(q)
    stats = collections.Counter()
    report = {}
    for pid, items in sorted(by_paper.items()):
        doc = pymupdf.open(os.path.join(DEST, files[pid]))
        mk = markers(doc)
        pos = {m[0]: i for i, m in enumerate(mk)}
        page_labels, icon_sizes, prev = {}, set(), []
        for p in doc:
            a, b, c = sanitize(p, icon_sizes, prev)
            page_labels[p.number] = a
            prev = a
            stats['labels'] += len(a); stats['icons'] += b; stats['chosen'] += c
        for q in items:
            idx = pos.get(q['q_no'])
            if idx is None:
                report[q['id']] = 'no_marker'; continue
            qn, pi, y = mk[idx]
            if idx + 1 < len(mk):
                nq, npi, ny = mk[idx + 1]
            else:
                nq, npi, ny = None, min(doc.page_count - 1, pi + 2), None
            parts, leftovers, icon_flags = [], [], []
            page = doc[pi]
            top = max(0, y - 6)
            bot = min(page.rect.height, ny - 2) if (npi == pi and ny is not None) else page.rect.height
            parts.append(page.get_pixmap(dpi=DPI, clip=pymupdf.Rect(0, top, page.rect.width, bot)))
            leftovers += leftover_colour(page, top, bot)
            icon_flags += [had for r, had in page_labels[pi] if top <= r.y0 <= bot]
            p = pi + 1
            while npi is not None and p <= npi and p < doc.page_count:
                pg2 = doc[p]
                b2 = (ny - 2) if (p == npi and ny is not None) else pg2.rect.height
                if b2 > 2:
                    parts.append(pg2.get_pixmap(dpi=DPI, clip=pymupdf.Rect(0, 0, pg2.rect.width, b2)))
                    leftovers += leftover_colour(pg2, 0, b2)
                    icon_flags += [had for r, had in page_labels[p] if 0 <= r.y0 <= b2]
                p += 1
            ims = [Image.frombytes('RGB', (px.width, px.height), px.samples) for px in parts]
            W = max(im.width for im in ims)
            H = sum(im.height for im in ims)
            canvas = Image.new('RGB', (W, H), (255, 255, 255))
            yy = 0
            for im in ims:
                canvas.paste(im, (0, yy)); yy += im.height
            # trim white margins so the photo is mostly question
            arr = np.asarray(canvas.convert('L'))
            rows = np.where(arr.min(axis=1) < 235)[0]
            cols = np.where(arr.min(axis=0) < 235)[0]
            if len(rows) and len(cols):
                canvas = canvas.crop((max(0, cols[0] - 20), max(0, rows[0] - 20), min(W, cols[-1] + 20), min(H, rows[-1] + 20)))
            img = photo_effect(canvas, q['id'])
            img.save(q['photo'], 'JPEG', quality=82)
            q['parts'] = len(parts); q['size'] = img.size; q['bytes'] = os.path.getsize(q['photo'])
            problems = []
            if leftovers:
                problems.append('leftover:' + ','.join(leftovers))
            if len(icon_flags) != 4:
                problems.append('labels=%d' % len(icon_flags))
            if len(set(icon_flags)) > 1:
                problems.append('icons_uneven:%s' % icon_flags)   # an option WITHOUT an icon would name the key by absence
            q['labels'] = len(icon_flags); q['icons_removed'] = sum(icon_flags)
            report[q['id']] = ' '.join(problems) if problems else 'ok'
        doc.close()
    io.open(os.path.join(OUT, 'sample.json'), 'w', encoding='utf-8').write(json.dumps(qs, ensure_ascii=False, indent=1))
    print('redacted: %d coloured labels, %d icons, %d chosen-option spans across %d papers' % (stats['labels'], stats['icons'], stats['chosen'], len(by_paper)))
    bad = {k: v for k, v in report.items() if v != 'ok'}
    print('crops written %d, multi-part %d, problems %d' % (len(qs), sum(1 for q in qs if q.get('parts', 1) > 1), len(bad)))
    for k, v in bad.items():
        print('  ', k, v)
    return 1 if bad else 0


def key_blobs(path):
    """Count 3x3 blobs of key-green or key-red pixels in an image."""
    a = np.asarray(Image.open(path).convert('RGB')).astype(int)
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    green = (g >= 110) & (g >= r + 60) & (g >= b + 60)
    red = (r >= 170) & (g <= 90) & (b <= 90)
    out = {}
    for name, m in (('green', green), ('red', red)):
        mi = Image.fromarray((m * 255).astype('uint8')).filter(ImageFilter.MinFilter(3))
        out[name] = int((np.asarray(mi) > 0).sum())
    return out


def cmd_gate():
    qs = json.load(io.open(os.path.join(OUT, 'sample.json'), encoding='utf-8'))
    leaks = []
    for q in qs:
        kb = key_blobs(q['photo'])
        if kb['green'] or kb['red']:
            leaks.append((q['id'], kb))
    # negative control: the official crops of the SAME questions must be flagged
    flagged, total = 0, 0
    for q in qs:
        d = os.path.join(CORPUS, q['crops'])
        parts = sorted(f for f in os.listdir(d) if re.match(r'q%03d_\d+\.png$' % q['q_no'], f)) if os.path.isdir(d) else []
        if not parts:
            continue
        total += 1
        if any((key_blobs(os.path.join(d, f))['green'] or key_blobs(os.path.join(d, f))['red']) for f in parts):
            flagged += 1
    print('clean crops: %d checked, %d leaking' % (len(qs), len(leaks)))
    for i, kb in leaks:
        print('  LEAK', i, kb)
    print('negative control on the official crops: flagged %d/%d' % (flagged, total))
    ok = not leaks and total and flagged == total
    print('GATE', 'PASS' if ok else 'FAIL')
    return 0 if ok else 1


def cmd_sheet():
    qs = json.load(io.open(os.path.join(OUT, 'sample.json'), encoding='utf-8'))
    for s in SUBJECTS:
        items = [q for q in qs if q['subject'] == s]
        cols, tw, th = 5, 420, 520
        rows = (len(items) + cols - 1) // cols
        sheet = Image.new('RGB', (cols * tw, rows * th), (40, 40, 40))
        d = ImageDraw.Draw(sheet)
        for i, q in enumerate(items):
            im = Image.open(q['photo']); im.thumbnail((tw - 10, th - 30))
            x, y = (i % cols) * tw, (i // cols) * th
            sheet.paste(im, (x + 5, y + 22))
            d.text((x + 6, y + 4), '%d %s' % (i + 1, q['id'].replace('tg_eapcet_', '')), fill=(255, 255, 120))
        p = os.path.join(SHEETS, 'sheet_%s.png' % s)
        sheet.save(p)
        print('sheet', p, sheet.size)


if __name__ == '__main__':
    cmd = sys.argv[1] if len(sys.argv) > 1 else 'sample'
    sys.exit({'sample': cmd_sample, 'crop': cmd_crop, 'gate': cmd_gate, 'sheet': cmd_sheet}[cmd]() or 0)
