# -*- coding: utf-8 -*-
"""Unit 1 figures. Phased per the founder's "watch it drawn" contract: outline first,
internal structures next, arrows, then leaders and labels last — the order a student draws in.
All ms are 0; pace_figures.ts fills them at 70 figure units per second."""
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'zoology_wip'))
import figlib as F

# ── stomatal opening and closing: two panels of the SAME guard-cell pair ──────
# Panel A (open, centre x=150) is bowed apart with a wide lens pore; panel B
# (closed, centre x=410) is straight with a hairline slit. The pore-side (inner)
# wall is drawn at w=4 and the outer wall at the default 2.25 — the thickness
# difference is the whole mechanism and an automated gate cannot see it.
W, H = 560, 320
_e = []
A = lambda: _e


def _pair(pfx, cx, top_out, top_in, bot_in, bot_out, dots_y):
    """One guard-cell pair. Control-point y values decide how far the pair bows."""
    L, R, cy = cx - 55, cx + 55, 150
    _e.append(F.stroke(f'{pfx}_upper_outer',
        f'M {L} {cy} C {L+10} {top_out} {R-10} {top_out} {R} {cy}'))
    _e.append(F.stroke(f'{pfx}_upper_inner',
        f'M {R} {cy} C {R-9} {top_in} {L+9} {top_in} {L} {cy}', w=4))
    _e.append(F.stroke(f'{pfx}_lower_outer',
        f'M {L} {cy} C {L+10} {bot_out} {R-10} {bot_out} {R} {cy}'))
    _e.append(F.stroke(f'{pfx}_lower_inner',
        f'M {R} {cy} C {R-9} {bot_in} {L+9} {bot_in} {L} {cy}', w=4))


def _dots(pfx, cx, y_up, y_lo):
    for i, dx in enumerate((-22, 0, 22)):
        _e.append(F.stroke(f'{pfx}_chl_u{i}', F.circle(cx + dx, y_up + (2 if dx == 0 else 0), 2.5)))
        _e.append(F.stroke(f'{pfx}_chl_l{i}', F.circle(cx + dx, y_lo - (2 if dx == 0 else 0), 2.5)))


def _arrow(id_, x1, y1, x2, y2):
    _e.append(F.stroke(id_, F.line(x1, y1, x2, y2), w=1.8))
    _e.append(F.stroke(id_ + '_h', F.arrow_head(x2, y2, x1, y1)))


# phase 1 — the open pair
_e.append(F.pause('p1', 'Step 1 — draw the open guard cell pair'))
_pair('op', 150, 108, 128, 172, 192, None)
# phase 2 — chloroplasts
_e.append(F.pause('p2', 'Step 2 — chloroplasts inside the guard cells'))
_dots('op', 150, 126, 174)
# phase 3 — the ions that open it
_e.append(F.pause('p3', 'Step 3 — potassium in, protons out'))
_arrow('op_k_in', 52, 110, 96, 128)
_arrow('op_cl_in', 52, 190, 96, 172)
_arrow('op_h_out', 206, 130, 250, 114)
# phase 4 — the same pair, closed
_e.append(F.pause('p4', 'Step 4 — the same pair, now closed'))
_pair('cl', 410, 118, 148, 152, 182, None)
_dots('cl', 410, 137, 163)
# phase 5 — the ions reverse
_e.append(F.pause('p5', 'Step 5 — every arrow reverses'))
_arrow('cl_k_out', 464, 130, 508, 114)
_arrow('cl_cl_out', 464, 170, 508, 186)
_arrow('cl_h_in', 312, 172, 356, 158)
# phase 6 — leaders and labels LAST
_e.append(F.pause('p6', 'Step 6 — leader lines and labels'))
_e += [
    F.leader('ld_outer', 150, 62, 150, 116),
    F.leader('ld_guard', 250, 62, 196, 126),
    F.leader('ld_pore', 246, 144, 178, 150),
    F.leader('ld_inner', 230, 206, 176, 170),
    F.leader('ld_chl', 110, 244, 128, 176),
    F.label('lb_outer', 30, 56, 'Thin outer wall'),
    F.label('lb_guard', 238, 56, 'Guard cell'),
    F.label('lb_pore', 248, 146, 'Pore'),
    F.label('lb_inner', 196, 212, 'Thick inner wall'),
    F.label('lb_chl', 26, 250, 'Chloroplasts'),
    F.label('lb_k_in', 30, 106, 'K⁺'),
    F.label('lb_cl_in', 26, 198, 'Cl⁻'),
    F.label('lb_h_out', 254, 104, 'H⁺'),
    F.label('lb_k_out', 512, 110, 'K⁺'),
    F.label('lb_cl_out', 512, 192, 'Cl⁻'),
    F.label('lb_h_in', 288, 168, 'H⁺'),
    F.label('lb_open', 88, 296, 'Stomatal opening'),
    F.label('lb_closed', 348, 296, 'Stomatal closing'),
]

STOMATA = {'id': 'b2_tp_stomata_open_close', 'width': W, 'height': H, 'elements': _e}

if __name__ == '__main__':
    bad = F.check(_e, W, H, 'stomata')
    print('\n'.join(bad) if bad else 'stomata: clean (%d elements, %d phases)'
          % (len(_e), sum(1 for e in _e if e['type'] == 'pause')))
