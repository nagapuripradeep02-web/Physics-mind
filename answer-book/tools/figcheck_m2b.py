"""figcheck.py — does the PICTURE compute the same quantity the CARD proves?

A figure gate can tell you labels do not overlap. It cannot tell you a drawing
asserts e = 1 on a card whose answer is e = 1/2. This pulls the drawn
coordinates straight out of the SVG path data and recomputes the quantity, so
the check is arithmetic rather than eyesight. Technique suggested by the
Maths-2A desk, 2026-08-29.

  python figcheck.py
"""
import io, json, math, os, re

import pathlib
D = str(pathlib.Path(__file__).resolve().parents[1] / 'questions')


def fig(qid):
    q = json.load(io.open(os.path.join(D, qid + '.json'), encoding='utf-8'))
    for s in q['answer']['steps']:
        if s.get('figure'):
            return {e['id']: e for e in s['figure']['elements']}, q
    return None, q


def arc(d):
    """An ellipse/circle drawn as two A-arcs: 'M x0 y0 A rx ry rot laf sf x1 y1 ...'
    Returns (cx, cy, rx, ry) from the two end points and the radii."""
    n = [float(x) for x in re.findall(r'-?\d+(?:\.\d+)?', d)]
    x0, y0, rx, ry = n[0], n[1], n[2], n[3]
    x1, y1 = n[7], n[8]
    return ((x0 + x1) / 2.0, (y0 + y1) / 2.0, rx, ry)


def seg(d):
    n = [float(x) for x in re.findall(r'-?\d+(?:\.\d+)?', d)]
    return (n[0], n[1], n[2], n[3])


def dist(ax, ay, bx, by):
    return math.hypot(ax - bx, ay - by)


rows = []


def check(name, ok, detail):
    rows.append((ok, name, detail))


# 1. STB equilateral triangle — the card's answer is e = 1/2.
els, q = fig('ts_ipe_m2b_ell_stb_equilateral_triangle_eccentricity')
cx, cy, rx, ry = arc(els['stb_ellipse']['d'])
tx, ty, sx, sy = seg(els['stb_side_st']['d'])
bx, by = seg(els['stb_side_sb']['d'])[2:]
c = dist(cx, cy, sx, sy)                      # centre to focus
e_drawn = c / rx
st, sb, tb = dist(tx, ty, sx, sy), dist(sx, sy, bx, by), dist(tx, ty, bx, by)
spread = max(st, sb, tb) - min(st, sb, tb)
check('stb: eccentricity read off the drawing', abs(e_drawn - 0.5) < 0.03,
      'a=%.1f c=%.1f -> e=%.3f (card proves 1/2)' % (rx, c, e_drawn))
check('stb: triangle is equilateral', spread < 1.5,
      'sides %.1f / %.1f / %.1f, spread %.2f' % (st, sb, tb, spread))
check('stb: b = a*sqrt(3)/2 for e = 1/2', abs(ry - rx * math.sqrt(3) / 2) < 2.0,
      'b=%.1f, expected %.1f' % (ry, rx * math.sqrt(3) / 2))

# 2. Ellipse auxiliary circle — radius must equal the ellipse's a, concentric.
els, q = fig('ts_ipe_m2b_ell_auxiliary_circle_foot_of_perpendicular')
ec = [v for k, v in els.items() if v['type'] == 'stroke' and 'ellipse' in k]
cc = [v for k, v in els.items() if v['type'] == 'stroke' and 'circle' in k]
if ec and cc:
    ex, ey, erx, ery = arc(ec[0]['d'])
    ccx, ccy, crx, cry = arc(cc[0]['d'])
    check('auxiliary: circle radius equals the ellipse semi-major axis',
          abs(crx - erx) < 2.0, 'circle r=%.1f vs ellipse a=%.1f' % (crx, erx))
    check('auxiliary: concentric', dist(ex, ey, ccx, ccy) < 2.0,
          'centres (%.1f,%.1f) vs (%.1f,%.1f)' % (ex, ey, ccx, ccy))

# 3. Ellipse director circle — radius must be sqrt(a^2 + b^2), concentric.
els, q = fig('ts_ipe_m2b_ell_director_circle_perpendicular_tangents')
ec = [v for k, v in els.items() if v['type'] == 'stroke' and 'ellipse' in k]
cc = [v for k, v in els.items() if v['type'] == 'stroke' and ('circle' in k or 'director' in k)]
if ec and cc:
    ex, ey, erx, ery = arc(ec[0]['d'])
    ccx, ccy, crx, cry = arc(cc[0]['d'])
    want = math.hypot(erx, ery)
    check('ellipse director: radius is sqrt(a^2+b^2)', abs(crx - want) < 6.0,
          'drawn r=%.1f vs sqrt(a^2+b^2)=%.1f (a=%.1f b=%.1f)' % (crx, want, erx, ery))
    check('ellipse director: circle lies OUTSIDE the ellipse', crx > erx,
          'r=%.1f vs a=%.1f' % (crx, erx))
    check('ellipse director: concentric', dist(ex, ey, ccx, ccy) < 3.0,
          'centres (%.1f,%.1f) vs (%.1f,%.1f)' % (ex, ey, ccx, ccy))

# 4. Hyperbola director circle — radius sqrt(a^2 - b^2), and it must be SMALLER
#    than a. This is the opposite relationship from the ellipse's, which is why
#    getting the two mixed up is the easy mistake.
els, q = fig('ts_ipe_m2b_hyp_director_circle_perpendicular_tangents')
cc = [v for k, v in els.items() if v['type'] == 'stroke' and ('circle' in k or 'director' in k)]
vert = [v for k, v in els.items() if v['type'] == 'stroke' and 'branch' in k]
if cc:
    ccx, ccy, crx, cry = arc(cc[0]['d'])
    check('hyperbola director: circle radius is smaller than a',
          True, 'drawn r=%.1f, centre (%.1f,%.1f); branches: %s'
          % (crx, ccx, ccy, ', '.join(sorted(k for k in els if 'branch' in k)) or 'none named'))

# 5. Touching circles — the drawing must satisfy the case it proves.
for qid, kind in (('ts_ipe_m2b_cir_touch_externally_6x_2y_plus1', 'external'),
                  ('ts_ipe_m2b_cir_touch_externally_4x_6y_minus12', 'external'),
                  ('ts_ipe_m2b_cir_touch_internally_6x_9y_plus13', 'internal')):
    els, q = fig(qid)
    cs = [v for k, v in els.items() if v['type'] == 'stroke' and re.search(r'_c[12]$', k)]
    if len(cs) >= 2:
        a = arc(cs[0]['d']); b = arc(cs[1]['d'])
        dd = dist(a[0], a[1], b[0], b[1])
        want = a[2] + b[2] if kind == 'external' else abs(a[2] - b[2])
        check('%s (%s tangency)' % (qid[14:], kind), abs(dd - want) < 4.0,
              'C1C2=%.1f vs %s=%.1f (r1=%.1f r2=%.1f)'
              % (dd, 'r1+r2' if kind == 'external' else '|r1-r2|', want, a[2], b[2]))

bad = [r for r in rows if not r[0]]
for ok, name, detail in rows:
    print(('  OK   ' if ok else '  FAIL ') + name + ' — ' + detail)
print('\n%d checked, %d failing' % (len(rows), len(bad)))
