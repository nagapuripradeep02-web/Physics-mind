"""Preview generated figures (before they are in question files): cumulative per-phase SVGs.
usage: python preview.py figs.json out.html [fig_id ...]"""
import json, sys, html, io
figs = json.load(io.open(sys.argv[1], encoding='utf-8'))
out = sys.argv[2]
only = sys.argv[3:]
def svg_for(fg, upto):
    W, H = fg['width'], fg['height']
    parts = [f'<svg width="{W}" height="{H}" viewBox="0 0 {W} {H}" xmlns="http://www.w3.org/2000/svg">']
    for e in fg['elements'][:upto]:
        if e['type'] == 'stroke':
            pen = e.get('pen') == 'pencil'
            col = '#7D8CA8' if pen else '#1A2F6B'
            dash = ' stroke-dasharray="6 5"' if pen else ''
            wdt = e.get('w', 1.6 if pen else 2.25)
            parts.append(f'<path d="{e["d"]}" fill="none" stroke="{col}" stroke-width="{wdt}" stroke-linecap="round" stroke-linejoin="round"{dash}/>')
        elif e['type'] == 'label':
            size = 25 if e.get('em') else (17 if e.get('sm') else 22)
            wt = '700' if e.get('em') else '400'
            parts.append(f'<text x="{e["x"]}" y="{e["y"]}" font-size="{size}" font-weight="{wt}" fill="#1A2F6B">{html.escape(e["text"])}</text>')
    parts.append('</svg>')
    return '\n'.join(parts)
parts = ['<meta charset="utf-8"><style>body{background:#fdfdf8;font:14px system-ui;margin:16px}',
         '.f{margin:0 0 24px;padding:10px;border:1px solid #ddd;background:#fff}',
         '.ph{display:inline-block;vertical-align:top;margin:0 12px 8px 0}.cap{font:15px Kalam,cursive;color:#7D8CA8}',
         'svg{border:1px dashed #bbb;background:#fff}text{font-family:Kalam,cursive}</style>',
         '<link href="https://fonts.googleapis.com/css2?family=Kalam:wght@400;700&display=swap" rel="stylesheet">']
for fid, fg in figs.items():
    if only and fid not in only: continue
    els = fg['elements']
    bounds = [i for i, e in enumerate(els) if e['type'] == 'pause']
    ends = [b for b in bounds if b > 0] + [len(els)]
    caps = [els[b].get('caption') or '' for b in bounds]
    parts.append(f'<div class="f"><b>{fid}</b> {fg["width"]}x{fg["height"]} · {len(els)-len(bounds)} drawn<br>')
    for k, upto in enumerate(ends):
        parts.append(f'<div class="ph"><div class="cap">{html.escape(caps[k] if k < len(caps) else "")}</div>{svg_for(fg, upto)}</div>')
    parts.append('</div>')
io.open(out, 'w', encoding='utf-8').write('\n'.join(parts))
print('wrote', out)
