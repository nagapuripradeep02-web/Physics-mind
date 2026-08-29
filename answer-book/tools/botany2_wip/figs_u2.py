# -*- coding: utf-8 -*-
"""Unit 2 figures — root nodule formation, four stages in a 2x2 grid.
A 2x2 grid, not a row of four: four stages across 520 units leaves ~120 per stage,
which is too narrow for a root segment plus a curled hair plus its label.

Fixed after rendering and looking (2026-08-28): the first draft drew the root as two
bare parallel lines that read as a corridor, not a root, and ran stage 3's infection
thread straight out through the LEFT wall into empty space — the thread must travel
INWARD, into the cortex, which is the whole point of that stage. Neither is visible to
any automated gate."""
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'zoology_wip'))
import figlib as F

W, H = 520, 384
_e = []

CX = {1: 118, 2: 368, 3: 118, 4: 368}
CY = {1: 100, 2: 100, 3: 268, 4: 268}
HW = 16          # half-width of the root segment


def root(n):
    """The root segment: two walls, a rounded lower end, and cortical cell lines so the
    band reads as tissue rather than as a pair of rails."""
    cx, cy = CX[n], CY[n]
    L, R, TOP, BOT = cx - HW, cx + HW, cy - 62, cy + 44
    out = [
        F.stroke(f's{n}_root_l', F.line(L, TOP, L, BOT)),
        F.stroke(f's{n}_root_r', F.line(R, TOP, R, BOT)),
        F.stroke(f's{n}_root_tip', f'M {L} {BOT} C {L} {BOT+12} {R} {BOT+12} {R} {BOT}', w=1.8),
    ]
    for i, dy in enumerate((-34, -6, 22)):
        out.append(F.stroke(f's{n}_cell{i}', F.line(L, cy + dy, R, cy + dy), w=1.4))
    return out


def bacteria(n, bx, by, tag=''):
    off = [(0, 0), (9, 5), (3, 11)]
    return [F.stroke(f's{n}_bac{tag}_{i}', F.circle(bx + dx, by + dy, 3))
            for i, (dx, dy) in enumerate(off)]


_e.append(F.pause('p1', 'Step 1 — a root hair, with bacteria in the soil'))
_e += root(1)
_e.append(F.stroke('s1_hair', 'M 134 78 C 156 68 176 60 196 54'))
_e += bacteria(1, 202, 44)
for i, (sx, sy) in enumerate([(150, 42), (168, 34), (186, 28), (140, 28), (208, 66), (196, 74)]):
    _e.append(F.stroke(f's1_soil_{i}', F.circle(sx, sy, 2), w=1.4))

_e.append(F.pause('p2', 'Step 2 — the root hair curls into a hook'))
_e += root(2)
_e.append(F.stroke('s2_hook', 'M 384 78 C 408 66 436 58 444 74 C 450 86 440 94 430 90 C 422 87 421 78 428 74'))
_e += bacteria(2, 432, 68)

# stage 3 — the thread turns INWARD at the wall and runs DOWN INSIDE the cortex band
_e.append(F.pause('p3', 'Step 3 — the infection thread enters the cortex'))
_e += root(3)
_e.append(F.stroke('s3_hook', 'M 134 246 C 158 234 186 226 194 242 C 200 254 190 262 180 258 C 172 255 171 246 178 242'))
_e.append(F.stroke('s3_thread', 'M 178 250 C 160 256 146 258 134 260 C 124 264 118 278 116 300', w=1.8))
_e += bacteria(3, 108, 272, 't')

_e.append(F.pause('p4', 'Step 4 — the mature nodule on the root'))
_e += root(4)
_e.append(F.stroke('s4_nodule', F.ellipse(416, 272, 30, 22)))
_e.append(F.stroke('s4_neck_t', F.line(384, 258, 392, 262), w=1.8))
_e.append(F.stroke('s4_neck_b', F.line(384, 286, 392, 282), w=1.8))
for i, (sx, sy) in enumerate([(408, 266), (422, 264), (414, 280), (428, 278), (402, 278)]):
    _e.append(F.stroke(f's4_cells_{i}', F.circle(sx, sy, 4), w=1.4))

_e.append(F.pause('p5', 'Step 5 — leader lines and labels'))
_e += [
    F.leader('ld_soil', 118, 28, 136, 28),
    F.leader('ld_bac1', 236, 42, 214, 46),
    F.leader('ld_hair', 236, 90, 186, 60),
    F.leader('ld_hook', 470, 60, 446, 72),
    F.leader('ld_thread', 192, 296, 124, 290),
    F.leader('ld_nodule', 410, 338, 416, 296),
    F.label('lb_soil', 26, 28, 'Soil particles'),
    F.label('lb_bac1', 240, 42, 'Bacteria'),
    F.label('lb_hair', 240, 90, 'Root hair'),
    F.label('lb_hook', 474, 60, 'Hook'),
    F.label('lb_thread', 196, 300, 'Infection thread'),
    F.label('lb_nodule', 356, 344, 'Mature nodule'),
    F.label('lb_n1', 26, 158, '1'),
    F.label('lb_n2', 276, 158, '2'),
    F.label('lb_n3', 26, 344, '3'),
    F.label('lb_n4', 306, 344, '4'),
]

NODULE = {'id': 'b2_mn_root_nodule_stages', 'width': W, 'height': H, 'elements': _e}

if __name__ == '__main__':
    bad = F.check(_e, W, H, 'root_nodule')
    print('\n'.join(bad) if bad else 'root_nodule: clean (%d elements, %d phases)'
          % (len(_e), sum(1 for e in _e if e['type'] == 'pause')))
