# -*- coding: utf-8 -*-
"""Unit 4 figures — the chloroplast (a DRAW question, so it carries the marks) and
the Calvin cycle ring."""
import sys, os, math
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'zoology_wip'))
import figlib as F

# ══════════════════════ 1. CHLOROPLAST ══════════════════════════════════════
CW, CH = 560, 320
c = []
CXo, CYo, RXo, RYo = 250, 140, 140, 76          # outer membrane
RXi, RYi = 133, 69                               # inner membrane

def half(id_, cx, cy, rx, ry, top):
    """Half an ellipse. A full 560-wide chloroplast outline measures ~672 units, over the
    pace gate's 650 cap, so both membranes are drawn as an upper and a lower sweep."""
    a, b = (cx - rx, cx + rx) if top else (cx + rx, cx - rx)
    return F.stroke(id_, f'M {a} {cy} A {rx} {ry} 0 0 1 {b} {cy}')


c.append(F.pause('c_p1', 'Step 1 — the outer and inner membranes'))
c.append(half('cp_outer_top', CXo, CYo, RXo, RYo, True))
c.append(half('cp_outer_bot', CXo, CYo, RXo, RYo, False))
c.append(half('cp_inner_top', CXo, CYo, RXi, RYi, True))
c.append(half('cp_inner_bot', CXo, CYo, RXi, RYi, False))

c.append(F.pause('c_p2', 'Step 2 — the grana, three stacks of discs'))
for si, (sx, y0, rx) in enumerate([(180, 108, 24), (262, 150, 24), (330, 100, 22)]):
    for d in range(5):
        c.append(F.stroke(f'cp_g{si}_{d}', F.ellipse(sx, y0 + d * 10, rx, 4), w=1.8))

c.append(F.pause('c_p3', 'Step 3 — the stromal lamellae joining the stacks'))
for li, (x1, y1, x2, y2) in enumerate([(204, 138, 238, 163), (286, 158, 308, 132)]):
    dx, dy = x2 - x1, y2 - y1
    L = math.hypot(dx, dy)
    nx, ny = -dy / L * 2.5, dx / L * 2.5
    c.append(F.stroke(f'cp_lam{li}_a', F.line(x1 + nx, y1 + ny, x2 + nx, y2 + ny), w=1.8))
    c.append(F.stroke(f'cp_lam{li}_b', F.line(x1 - nx, y1 - ny, x2 - nx, y2 - ny), w=1.8))

c.append(F.pause('c_p4', 'Step 4 — ribosomes, starch grain and lipid droplet'))
for i, (rx, ry) in enumerate([(150, 175), (162, 192), (215, 200), (300, 175), (345, 165), (210, 90), (290, 84)]):
    c.append(F.stroke(f'cp_rib{i}', F.circle(rx, ry, 2.5), w=1.4))
c.append(F.stroke('cp_starch', F.ellipse(185, 190, 22, 13)))
c.append(F.stroke('cp_starch_r1', 'M 168 187 C 176 180 194 180 202 187', w=1.4))
c.append(F.stroke('cp_starch_r2', 'M 170 194 C 178 199 192 199 200 194', w=1.4))
c.append(F.stroke('cp_lipid', F.circle(310, 192, 8)))

c.append(F.pause('c_p5', 'Step 5 — leader lines and labels'))
c += [
    F.leader('cl_outer', 100, 50, 180, 72),
    F.leader('cl_inner', 400, 84, 374, 113),
    F.leader('cl_grana', 398, 138, 350, 122),
    F.leader('cl_rib', 398, 198, 304, 176),
    F.leader('cl_lam', 140, 250, 216, 152),
    F.leader('cl_starch', 140, 294, 180, 204),
    F.leader('cl_stroma', 250, 294, 250, 206),
    F.leader('cl_lipid', 358, 294, 318, 200),
    F.label('clb_outer', 10, 44, 'Outer membrane'),
    F.label('clb_inner', 402, 72, 'Inner membrane'),
    F.label('clb_grana', 402, 140, 'Grana'),
    F.label('clb_rib', 402, 200, 'Ribosomes'),
    F.label('clb_lam', 10, 256, 'Stromal lamella'),
    F.label('clb_starch', 60, 300, 'Starch granule'),
    F.label('clb_stroma', 216, 300, 'Stroma'),
    F.label('clb_lipid', 330, 300, 'Lipid droplet'),
]
CHLOROPLAST = {'id': 'b2_ph_chloroplast', 'width': CW, 'height': CH, 'elements': c}

# ══════════════════════ 2. CALVIN CYCLE ═════════════════════════════════════
VW, VH = 520, 384
v = []
X, Y, R = 250, 180, 88
TOP, RIGHT, BOT, LEFT = (X, Y - R), (X + R, Y), (X, Y + R), (X - R, Y)


def arc(id_, a, b):
    return F.stroke(id_, f'M {a[0]} {a[1]} A {R} {R} 0 0 1 {b[0]} {b[1]}')


def badge(id_, bx, by):
    return F.stroke(id_, F.circle(bx, by, 11), w=1.6)


def arrow(id_, x1, y1, x2, y2):
    return [F.stroke(id_, F.line(x1, y1, x2, y2), w=1.8),
            F.stroke(id_ + '_h', F.arrow_head(x2, y2, x1, y1))]


v.append(F.pause('v_p1', 'Step 1 — carbon fixation: CO2 joins RuBP'))
v.append(arc('cv_arc1', TOP, RIGHT))
v += arrow('cv_head1', 330, 168, 338, 180)
v += arrow('cv_co2', 300, 60, 284, 96)
v.append(badge('cv_b1', 326, 124))

v.append(F.pause('v_p2', 'Step 2 — reduction: ATP and NADPH make triose phosphate'))
v.append(arc('cv_arc2', RIGHT, BOT))
v += arrow('cv_head2', 262, 264, 250, 268)
v += arrow('cv_atp_nadph', 402, 288, 330, 252)
v.append(badge('cv_b2', 322, 238))

v.append(F.pause('v_p3', 'Step 3 — regeneration: RuBP is built again'))
v.append(arc('cv_arc3', BOT, LEFT))
v.append(arc('cv_arc4', LEFT, TOP))
v += arrow('cv_head3', 238, 100, 250, 92)
v += arrow('cv_atp', 60, 180, 156, 180)
v.append(badge('cv_b3', 172, 236))

v.append(F.pause('v_p4', 'Step 4 — the sugar that leaves the cycle'))
v += arrow('cv_out', 250, 272, 250, 330)

v.append(F.pause('v_p5', 'Step 5 — leader lines and labels'))
v += [
    F.leader('cvl_rubp', 170, 116, 186, 118),
    F.leader('cvl_pga', 344, 200, 336, 190),
    F.leader('cvl_triose', 230, 290, 248, 270),
    F.label('cvb_co2', 300, 50, 'CO₂'),
    F.label('cvb_carbox', 346, 90, 'Carboxylation'),
    F.label('cvb_1', 322, 130, '1'),
    F.label('cvb_rubp', 84, 116, 'RuBP (5C)'),
    F.label('cvb_pga', 348, 206, '3-PGA (3C)'),
    F.label('cvb_red', 352, 252, 'Reduction'),
    F.label('cvb_2', 318, 244, '2'),
    F.label('cvb_atpnadph', 392, 296, 'ATP + NADPH'),
    F.label('cvb_regen', 30, 226, 'Regeneration'),
    F.label('cvb_3', 168, 242, '3'),
    F.label('cvb_atp', 24, 174, 'ATP'),
    F.label('cvb_triose', 96, 296, 'Triose phosphate'),
    F.label('cvb_out', 244, 346, 'Sucrose, starch'),
]
CALVIN = {'id': 'b2_ph_calvin_cycle', 'width': VW, 'height': VH, 'elements': v}

if __name__ == '__main__':
    for name, fig in (('chloroplast', CHLOROPLAST), ('calvin', CALVIN)):
        bad = F.check(fig['elements'], fig['width'], fig['height'], name)
        print('\n'.join(bad) if bad else '%s: clean (%d elements, %d phases)'
              % (name, len(fig['elements']), sum(1 for e in fig['elements'] if e['type'] == 'pause')))
