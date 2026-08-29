# -*- coding: utf-8 -*-
"""Unit 1 figures. Phased per the founder's "watch it drawn" contract: outline first,
internal structures next, arrows, then leaders and labels last — the order a student draws in.
All ms are 0; pace_figures.ts fills them at 70 figure units per second.

PROPORTIONS (fixed after rendering and looking, 2026-08-28): the first draft made each
guard cell 15 units thick around a 33-unit pore, so the pair read as ONE cell with a hole
in it. A real stoma is the other way round — two SUBSTANTIAL guard cells around a narrow
slit. Each cell is now 26 units thick and the open pore is 22. No automated gate can see
this: check() passes both versions."""
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'zoology_wip'))
import figlib as F

W, H = 560, 320
_e = []
CY = 150


def _pair(pfx, cx, top_out, top_in, bot_in, bot_out):
    """One guard-cell pair. The control y values are chosen so the curve's MIDPOINT
    lands where the wall should be: midpoint = (2*CY + 6c) / 8."""
    L, R = cx - 55, cx + 55
    _e.append(F.stroke(f'{pfx}_upper_outer', f'M {L} {CY} C {L+10} {top_out} {R-10} {top_out} {R} {CY}'))
    _e.append(F.stroke(f'{pfx}_upper_inner', f'M {R} {CY} C {R-9} {top_in} {L+9} {top_in} {L} {CY}', w=4))
    _e.append(F.stroke(f'{pfx}_lower_outer', f'M {L} {CY} C {L+10} {bot_out} {R-10} {bot_out} {R} {CY}'))
    _e.append(F.stroke(f'{pfx}_lower_inner', f'M {R} {CY} C {R-9} {bot_in} {L+9} {bot_in} {L} {CY}', w=4))


def _dots(pfx, cx, y_up, y_lo):
    for i, dx in enumerate((-24, 0, 24)):
        _e.append(F.stroke(f'{pfx}_chl_u{i}', F.circle(cx + dx, y_up, 2.5)))
        _e.append(F.stroke(f'{pfx}_chl_l{i}', F.circle(cx + dx, y_lo, 2.5)))


def _arrow(id_, x1, y1, x2, y2):
    _e.append(F.stroke(id_, F.line(x1, y1, x2, y2), w=1.8))
    _e.append(F.stroke(id_ + '_h', F.arrow_head(x2, y2, x1, y1)))


# OPEN pair: walls at y = 112 / 138 / 160 / 186 → cells 26 thick, pore 22 wide.
_e.append(F.pause('p1', 'Step 1 — draw the open guard cell pair'))
_pair('op', 150, 99, 134, 163, 198)
_e.append(F.pause('p2', 'Step 2 — chloroplasts inside the guard cells'))
_dots('op', 150, 125, 173)
_e.append(F.pause('p3', 'Step 3 — potassium in, protons out'))
_arrow('op_k_in', 52, 112, 96, 124)
_arrow('op_cl_in', 52, 188, 96, 176)
_arrow('op_h_out', 206, 126, 250, 112)

# CLOSED pair: walls at 120 / 148 / 152 / 180 → the pore is a 4-unit slit and the whole
# pair is 14 units shorter, so the two panels differ in HEIGHT as well as in the pore.
_e.append(F.pause('p4', 'Step 4 — the same pair, now closed'))
_pair('cl', 410, 110, 147, 153, 190)
_dots('cl', 410, 134, 166)
_e.append(F.pause('p5', 'Step 5 — every arrow reverses'))
_arrow('cl_k_out', 464, 132, 508, 116)
_arrow('cl_cl_out', 464, 168, 508, 184)
_arrow('cl_h_in', 330, 190, 368, 176)

_e.append(F.pause('p6', 'Step 6 — leader lines and labels'))
_e += [
    F.leader('ld_outer', 140, 62, 150, 110),
    F.leader('ld_guard', 250, 62, 180, 124),
    F.leader('ld_pore', 246, 146, 176, 150),
    F.leader('ld_inner', 186, 238, 168, 164),
    F.leader('ld_chl', 108, 244, 128, 175),
    F.label('lb_outer', 24, 56, 'Thin outer wall'),
    F.label('lb_guard', 238, 56, 'Guard cell'),
    F.label('lb_pore', 250, 148, 'Pore'),
    F.label('lb_inner', 150, 244, 'Thick inner wall'),
    F.label('lb_chl', 24, 250, 'Chloroplasts'),
    F.label('lb_k_in', 30, 108, 'K⁺'),
    F.label('lb_cl_in', 26, 196, 'Cl⁻'),
    F.label('lb_h_out', 254, 104, 'H⁺'),
    F.label('lb_k_out', 512, 110, 'K⁺'),
    F.label('lb_cl_out', 512, 192, 'Cl⁻'),
    F.label('lb_h_in', 296, 194, 'H⁺'),
    F.label('lb_open', 88, 296, 'Stomatal opening'),
    F.label('lb_closed', 348, 296, 'Stomatal closing'),
]

STOMATA = {'id': 'b2_tp_stomata_open_close', 'width': W, 'height': H, 'elements': _e}

if __name__ == '__main__':
    bad = F.check(_e, W, H, 'stomata')
    print('\n'.join(bad) if bad else 'stomata: clean (%d elements, %d phases)'
          % (len(_e), sum(1 for e in _e if e['type'] == 'pause')))
