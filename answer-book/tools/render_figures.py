#!/usr/bin/env python
"""Render every figure under an id prefix to one standalone HTML gallery — the
visual pass the automated gates cannot do.

The e2e gates catch label OVERLAP and clipped construction lines. They do NOT
catch a wrong shape, an off-canvas label, or a label pointing at the wrong
structure: chemistry shipped a wrong-shaped orbital and botany a DNA helix that
read as stacked lenses, and every gate passed both. So: render, screenshot, LOOK.

A PHASED figure (pause elements) is rendered once per phase, cumulatively —
"Step 1", "Step 1+2", ... — so a reviewer sees exactly what a student sees at
each tap, and a phase that draws the wrong things first is visible here.

Usage:  python answer-book/tools/render_figures.py <id_prefix> [--out DIR]
        python answer-book/tools/render_figures.py ts_ipe_z1        # all zoology
        python answer-book/tools/render_figures.py ts_ipe_z1_pa     # one unit
Writes: <out>/figures_<prefix>.html  (default out: answer-book/tools/out/)
"""
import json, io, os, sys, glob, html

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
QDIR = os.path.join(ROOT, 'answer-book', 'questions')

args = [a for a in sys.argv[1:]]
if not args or args[0].startswith('--'):
    print(__doc__); sys.exit(2)
prefix = args[0]
out_dir = os.path.join(HERE, 'out')
if '--out' in args:
    out_dir = args[args.index('--out') + 1]
os.makedirs(out_dir, exist_ok=True)

figs = []          # (question_id, step_id, figure, question_text)
for p in sorted(glob.glob(os.path.join(QDIR, prefix + '*.json'))):
    q = json.load(io.open(p, encoding='utf-8'))
    for s in q['answer']['steps']:
        if s.get('figure'):
            figs.append((q['question_id'], s['id'], s['figure'], q.get('question_text', '')))

if not figs:
    print('no figures found for prefix', prefix)
    sys.exit(0)

# ── bounds report: a label outside the canvas passes every gate and looks broken ──
problems = []
for qid, sid, f, _ in figs:
    W, H = f['width'], f['height']
    for e in f['elements']:
        if e['type'] == 'label':
            x, y = e['x'], e['y']
            w = 8.5 * len(e['text']) * (1.15 if e.get('em') else (0.8 if e.get('sm') else 1.0))
            if x < 0 or y < 20 or y > H - 2 or x + w > W:
                problems.append(f'{qid}/{sid}: label {e["id"]!r} "{e["text"]}" at ({x},{y}) '
                                f'est. right edge {x + w:.0f} — canvas {W}x{H}')

def svg_for(f, upto):
    """SVG markup of elements[:upto] (pauses skipped)."""
    W, H = f['width'], f['height']
    parts = [f'<svg width="{W}" height="{H}" viewBox="0 0 {W} {H}" xmlns="http://www.w3.org/2000/svg">']
    for e in f['elements'][:upto]:
        if e['type'] == 'stroke':
            pen = e.get('pen') == 'pencil'
            col = '#7D8CA8' if pen else '#1A2F6B'
            dash = ' stroke-dasharray="6 5"' if pen else ''
            wdt = e.get('w', 1.6 if pen else 2.25)
            parts.append(f'<path d="{e["d"]}" fill="none" stroke="{col}" stroke-width="{wdt}"'
                         f' stroke-linecap="round" stroke-linejoin="round"{dash}/>')
        elif e['type'] == 'label':
            size = 25 if e.get('em') else (17 if e.get('sm') else 22)
            wt = '700' if e.get('em') else '400'
            parts.append(f'<text x="{e["x"]}" y="{e["y"]}" font-size="{size}" font-weight="{wt}"'
                         f' fill="#1A2F6B">{html.escape(e["text"])}</text>')
    parts.append('</svg>')
    return '\n'.join(parts)

parts = ['<meta charset="utf-8"><style>',
         'body{background:#fdfdf8;font:14px system-ui;margin:24px;color:#222}',
         '.f{margin:0 0 34px;padding:14px;border:1px solid #ddd;border-radius:8px;background:#fff}',
         '.h{font:600 13px system-ui;margin-bottom:2px}',
         '.q{font:12px system-ui;color:#666;margin-bottom:8px}',
         '.ph{display:inline-block;vertical-align:top;margin:0 14px 10px 0}',
         '.cap{font:15px Kalam,cursive;color:#7D8CA8;margin:4px 0 2px}',
         'svg{border:1px dashed #bbb;background:#fff}',
         'text{font-family:Kalam,cursive}', '</style>',
         '<link href="https://fonts.googleapis.com/css2?family=Kalam:wght@400;700&display=swap" rel="stylesheet">',
         f'<h2>Figures — {len(figs)} figure(s), prefix {html.escape(prefix)}</h2>']

phase_rows = []
for qid, sid, f, qtext in figs:
    W, H = f['width'], f['height']
    els = f['elements']
    n_drawn = sum(1 for e in els if e['type'] != 'pause')
    total_ms = sum(e.get('ms', 0) + 110 for e in els if e['type'] != 'pause')
    parts.append(f'<div class="f"><div class="h">{qid} / {sid} &nbsp;·&nbsp; {W}×{H} &nbsp;·&nbsp; '
                 f'{n_drawn} elements &nbsp;·&nbsp; ~{total_ms/1000:.1f} s</div>')
    parts.append(f'<div class="q">{html.escape(qtext[:150])}</div>')
    # phase boundaries: indices of pause elements
    bounds = [i for i, e in enumerate(els) if e['type'] == 'pause']
    if bounds:
        # cumulative snapshot at the END of each phase, plus the final figure
        ends = [b for b in bounds if b > 0] + [len(els)]
        caps = []
        for i, b in enumerate(bounds):
            caps.append(els[b].get('caption') or f'(phase {i + 1})')
        if bounds[0] != 0:
            caps.insert(0, '(phase 1 — no caption)')
        for k, upto in enumerate(ends):
            cap = caps[k] if k < len(caps) else f'(phase {k + 1})'
            n_in = sum(1 for e in els[:upto] if e['type'] != 'pause')
            parts.append(f'<div class="ph"><div class="cap">{html.escape(cap)} &nbsp;·&nbsp; {n_in} drawn</div>')
            parts.append(svg_for(f, upto))
            parts.append('</div>')
        phase_rows.append((qid, sid, len(ends), caps))
    else:
        parts.append(svg_for(f, len(els)))
    parts.append('</div>')

tag = prefix.replace('ts_ipe_', '')
path = os.path.join(out_dir, f'figures_{tag}.html')
io.open(path, 'w', encoding='utf-8').write('\n'.join(parts))

print(f'{len(figs)} figure(s) -> {path}')
by_q = {}
for qid, sid, f, _ in figs:
    by_q.setdefault(qid, []).append(sid)
for qid in sorted(by_q):
    print(f'  {qid}: {", ".join(by_q[qid])}')
if phase_rows:
    print(f'\nphased figures: {len(phase_rows)} of {len(figs)}')
    for qid, sid, n, caps in phase_rows:
        print(f'  {qid}/{sid}: {n} phases — ' + ' | '.join(caps))
unphased_big = [(qid, sid) for qid, sid, f, _ in figs
                if not any(e['type'] == 'pause' for e in f['elements'])
                and sum(1 for e in f['elements'] if e['type'] != 'pause') >= 16]
if unphased_big:
    print(f'\n{len(unphased_big)} complex figure(s) with NO phases (the pace gate fails these under --strict):')
    for qid, sid in unphased_big:
        print('  !', qid, '/', sid)
if problems:
    print(f'\n{len(problems)} possible out-of-bounds label(s) — verify by eye:')
    for p in problems:
        print('  !', p)
else:
    print('\nno out-of-bounds labels estimated.')
