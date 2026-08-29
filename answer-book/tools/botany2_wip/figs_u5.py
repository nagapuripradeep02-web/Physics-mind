# -*- coding: utf-8 -*-
"""Unit 5 figures — the glycolysis chain and the Krebs cycle ring.
These are the two biggest drawings in the paper and both are 8-mark LAQ content.

Glycolysis is laid out in THREE vertical lanes on one row per step — compound,
enzyme, side reaction — so ten steps fit in 512 units instead of the 864 a
stacked layout would need. A figure costs whole 32px rules of page, so height is
a pagination decision as much as a drawing one."""
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'zoology_wip'))
import figlib as F

# ══════════════════════ 1. GLYCOLYSIS ═══════════════════════════════════════
GW, GH = 660, 544
g = []
X_ARROW = 44           # the chain runs down this lane, LEFT of every label
Y0, DY = 40, 48        # first compound baseline, and one row
GAP = 28               # extra space opened between the two phases, for the divider

STEPS = [
    # compound at the row, then the enzyme and side reaction of the arrow BELOW it
    ('Glucose (6C)',                 'Hexokinase',              'ATP → ADP'),
    ('Glucose-6-P (6C)',             'Phosphohexose isomerase', None),
    ('Fructose-6-P (6C)',            'Phosphofructokinase',     'ATP → ADP'),
    ('Fructose 1,6-bisP (6C)',       'Aldolase',                None),
    ('G-3-P (3C) ⇌ DHAP (3C)',       'G-3-P dehydrogenase',     'NAD⁺ → NADH'),
    ('1,3-bisPGA (3C)',              'Phosphoglycerokinase',    'ADP → ATP'),
    ('3-PGA (3C)',                   'Phosphoglyceromutase',    None),
    ('2-PGA (3C)',                   'Enolase',                 '→ H₂O'),
    ('PEP (3C)',                     'Pyruvate kinase',         'ADP → ATP'),
    ('2 × Pyruvic acid (3C)',        None,                      None),
]

def row_y(i):
    """Row baselines. Rows 5-9 sit GAP lower, which is where the phase divider goes."""
    return Y0 + i * DY + (GAP if i >= 5 else 0)


g.append(F.pause('g_p1', 'Step 1 — the ten compounds, top to bottom'))
for i, (cmpd, _, _) in enumerate(STEPS):
    g.append(F.label(f'gl_c{i}', 62, row_y(i), cmpd))        # lane 1: 62-280 (measured)

g.append(F.pause('g_p2', 'Step 2 — the arrows joining them'))
for i in range(len(STEPS) - 1):
    y, y2 = row_y(i), row_y(i + 1)
    g.append(F.stroke(f'g_arr{i}', F.line(X_ARROW, y + 8, X_ARROW, y2 - 16), w=1.8))
    g.append(F.stroke(f'g_arr{i}_h', F.arrow_head(X_ARROW, y2 - 16, X_ARROW, y + 8)))

g.append(F.pause('g_p3', 'Step 3 — the enzyme on every arrow'))
for i, (_, enz, _) in enumerate(STEPS):
    if enz:
        g.append(F.label(f'gl_e{i}', 292, row_y(i) + 24, enz))      # lane 2: 292-520 (measured)

g.append(F.pause('g_p4', 'Step 4 — what is spent and what is made'))
for i, (_, _, side) in enumerate(STEPS):
    if side:
        y = row_y(i) + 24
        # the side hook curls LEFT of the chain lane, into empty margin
        g.append(F.stroke(f'g_s{i}', f'M {X_ARROW} {y - 8} C 22 {y - 14} 12 {y + 4} 30 {y + 8}', w=1.4))
        g.append(F.label(f'gl_s{i}', 532, y, side))                 # lane 3: 532-641 (measured)

g.append(F.pause('g_p5', 'Step 5 — the two halves of the pathway'))
g.append(F.stroke('g_divider', F.line(16, 284, 644, 284), w=1.4, pen='pencil', wipe='x'))
g += [
    F.label('gl_phase1', 422, 20, 'Energy acquiring phase'),
    F.label('gl_phase2', 422, 532, 'Energy releasing phase'),
]
GLYCOLYSIS = {'id': 'b2_rp_glycolysis', 'width': GW, 'height': GH, 'elements': g}

# ══════════════════════ 2. KREBS CYCLE ══════════════════════════════════════
KW, KH = 660, 448
k = []
KX, KY, KR = 350, 250, 90

# Two rejected layouts, recorded so nobody rebuilds them:
#   (a) outputs floating loose inside the ring — two of them ran over the ring outline
#       and none said which step it came from;
#   (b) outputs inside with leaders to their own arcs — the leaders crossed the whole
#       ring in long diagonals and struck through each other and the labels.
# What works: the ring carries the eight NAMES outside it, and the inside carries the
# PER-TURN TALLY, which is what the final written step is marked on anyway. Both were
# clean under check() and only a render showed the difference.


def polar(ang, r):
    import math
    return KX + r * math.cos(math.radians(ang)), KY + r * math.sin(math.radians(ang))


def karc(id_, a_deg, b_deg):
    ax, ay = polar(a_deg, KR)
    bx, by = polar(b_deg, KR)
    return F.stroke(id_, f'M {F.f(ax)} {F.f(ay)} A {KR} {KR} 0 0 1 {F.f(bx)} {F.f(by)}')


def karrow(id_, x1, y1, x2, y2, w=1.8):
    return [F.stroke(id_, F.line(x1, y1, x2, y2), w=w),
            F.stroke(id_ + '_h', F.arrow_head(x2, y2, x1, y1))]


k.append(F.pause('k_p1', 'Step 1 — pyruvate enters as acetyl coenzyme A'))
k += karrow('kr_in1', 350, 44, 350, 64)
k += karrow('kr_in2', 350, 90, 350, 152)

k.append(F.pause('k_p2', 'Step 2 — the ring, drawn clockwise'))
for i, (a, b) in enumerate([(-90, -45), (-45, 0), (0, 45), (45, 90),
                            (90, 135), (135, 180), (180, 225), (225, 270)]):
    k.append(karc(f'kr_arc{i}', a, b))
k += karrow('kr_dir1', 434, 208, 440, 226)
k += karrow('kr_dir2', 306, 338, 288, 330)

k.append(F.pause('k_p3', 'Step 3 — the eight acids of the cycle'))
NODES = [
    ('citric', -100, 160, 'Citric (6C)'),
    ('iso',     -45, 142, 'Isocitric'),
    ('akg',       0, 142, 'α-KG (5C)'),
    ('succoa',   45, 142, 'Succinyl CoA'),
    ('succ',     90, 142, 'Succinic (4C)'),
    ('fum',     135, 142, 'Fumaric'),
    ('mal',     180, 142, 'Malic (4C)'),
    ('oaa',     218, 168, 'OAA (4C)'),
]
for nid, ang, rad, text in NODES:
    cx, cy = polar(ang, rad)
    w = F.label_w(text, sm=True)
    lx, ly = cx - w / 2, cy
    ax, ay = polar(ang, KR + 6)
    # anchor the leader at the label's INNER edge — the first version started it at the
    # OUTER edge, so on the left- and right-hand nodes it ran back underneath its own
    # text and rendered as an underline.
    sx = (lx + w + 6) if cx < KX else (lx - 6)
    k.append(F.leader(f'kl_{nid}', round(sx), ly - 5, ax, ay))
    k.append(F.label(f'kb_{nid}', round(lx), round(ly), text))

k.append(F.pause('k_p4', 'Step 4 — the tally for one turn, and the names'))
k += [
    F.label('kb_co2', 320, 190, '2 CO₂'),
    F.label('kb_nadh', 316, 235, '3 NADH'),
    F.label('kb_fadh', 311, 280, '1 FADH₂'),
    F.label('kb_atp', 322, 325, '1 ATP'),
    F.label('kb_pyr', 390, 36, 'Pyruvate (3C)'),
    F.label('kb_acoa', 390, 82, 'Acetyl CoA (2C)'),
    F.label('kb_title', 266, 436, 'CITRIC ACID CYCLE'),
]
KREBS = {'id': 'b2_rp_krebs_cycle', 'width': KW, 'height': KH, 'elements': k}

if __name__ == '__main__':
    for name, fig in (('glycolysis', GLYCOLYSIS), ('krebs', KREBS)):
        bad = F.check(fig['elements'], fig['width'], fig['height'], name)
        print('\n'.join(bad) if bad else '%s: clean (%d elements, %d phases)'
              % (name, len(fig['elements']), sum(1 for e in fig['elements'] if e['type'] == 'pause')))
