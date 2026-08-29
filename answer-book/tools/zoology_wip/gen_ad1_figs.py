# -*- coding: utf-8 -*-
"""Unit 3 — Animal Diversity-I: the ONE figure the book prints in this unit.

The source book prints a shaded drawing of Nereis beside SAQ 25 (polychaetes,
book p.35). No other figure appears anywhere in this unit's SAQ chapter, VSAQ
chapter or Star-Q entries. SAQ 25 does NOT ask for a diagram, so the diagram
step carries marks: 0 and the four marks sit on the written steps.

All placements are COMPUTED here (segment pitch, parapodium bases and tips,
seta fans, leader targets) — never guessed.
"""
import math, json, io, os, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from figlib import stroke, label, pause, leader, line, poly, circle, finger, check, f, path_len, label_w

CX = 260.0
W, H = 520, 352

# ── vertical plan ─────────────────────────────────────────────────────────────
PRO_TOP, PRO_BOT = 22.0, 52.0        # prostomium
PER_TOP, PER_BOT = 52.0, 80.0        # peristomium
TRUNK_TOP, TRUNK_BOT = 80.0, 304.0   # segmented trunk
NSEG = 7
SEG = (TRUNK_BOT - TRUNK_TOP) / NSEG          # 32.0
HW_TOP, HW_BOT = 15.0, 10.0
PARA_LEN = 26.0
PARA_HW = 7.0
SETA_LEN = 17.0     # must clear PARA_HW, or the fan hides inside the parapodium
SETA_SPREAD = 9.0   # ditto: the outer bristles spread WIDER than the parapodium


def hw(y):
    """Half-width of the tapering trunk at height y."""
    t = (y - TRUNK_TOP) / (TRUNK_BOT - TRUNK_TOP)
    return HW_TOP + (HW_BOT - HW_TOP) * t


SEG_Y = [TRUNK_TOP + SEG * k for k in range(NSEG + 1)]        # 80 .. 304
BOUND_Y = SEG_Y[1:-1]                                          # 112 .. 272
PARA_Y = [TRUNK_TOP + SEG * (k + 0.5) for k in range(NSEG)]    # 96 .. 288

els = []

# ── phase 1: the body ─────────────────────────────────────────────────────────
els.append(pause('p1', 'Step 1 — the long body and its segments'))

left_edge = [(CX - hw(y), y) for y in SEG_Y]
right_edge = [(CX + hw(y), y) for y in SEG_Y]
els.append(stroke('body_left', poly(left_edge)))
els.append(stroke('body_right', poly(right_edge)))
els.append(stroke('tail_cap',
                  f"M {f(CX - hw(TRUNK_BOT))} {f(TRUNK_BOT)} "
                  f"C {f(CX - hw(TRUNK_BOT))} {f(TRUNK_BOT + 14)} "
                  f"{f(CX + hw(TRUNK_BOT))} {f(TRUNK_BOT + 14)} "
                  f"{f(CX + hw(TRUNK_BOT))} {f(TRUNK_BOT)}"))

seg_lines = [line(CX - hw(y), y, CX + hw(y), y) for y in BOUND_Y]
els.append(stroke('seg_lines_a', ' '.join(seg_lines[:3])))
els.append(stroke('seg_lines_b', ' '.join(seg_lines[3:])))

# ── phase 2: the head ─────────────────────────────────────────────────────────
els.append(pause('p2', 'Step 2 — the head: eyes, antennae and palps'))

# The prostomium is drawn WIDER than the peristomium behind it, and a transverse
# line is ruled at each of their boundaries. Without those two lines the head
# renders as one continuous neck and the "Prostomium" / "Peristomium" leaders
# both land on the same undifferentiated shape.
els.append(stroke('prostomium',
                  "M 246 52 C 241 42 246 24 260 19 C 274 24 279 42 274 52 Z"))
els.append(stroke('eyes',
                  ' '.join([circle(255, 32, 3), circle(265, 32, 3),
                            circle(252, 44, 3), circle(268, 44, 3)])))
els.append(stroke('antennae', line(256, 21, 247, 7) + ' ' + line(264, 21, 273, 7)))
els.append(stroke('palp_l', finger(246, 40, 226, 22, hw=4.0)))
els.append(stroke('palp_r', finger(274, 40, 294, 22, hw=4.0)))
els.append(stroke('peristomium',
                  line(246, PRO_BOT, CX - hw(TRUNK_TOP), TRUNK_TOP) + ' ' +
                  line(274, PRO_BOT, CX + hw(TRUNK_TOP), TRUNK_TOP)))
els.append(stroke('head_dividers',
                  line(246, PRO_BOT, 274, PRO_BOT) + ' ' +
                  line(CX - hw(TRUNK_TOP), TRUNK_TOP, CX + hw(TRUNK_TOP), TRUNK_TOP)))

# ── phase 3: the parapodia ────────────────────────────────────────────────────
els.append(pause('p3', 'Step 3 — a pair of parapodia on every segment'))


def para(y, side):
    """One parapodium: base on the trunk edge, tip PARA_LEN units out."""
    bx = CX + side * hw(y)
    tx = bx + side * PARA_LEN
    return finger(bx, y, tx, y, hw=PARA_HW)


for name, side, lo, hi in [('para_l_a', -1, 0, 4), ('para_l_b', -1, 4, 7),
                           ('para_r_a', 1, 0, 4), ('para_r_b', 1, 4, 7)]:
    els.append(stroke(name, ' '.join(para(PARA_Y[k], side) for k in range(lo, hi))))

# ── phase 4: the setae and the anal cirri ─────────────────────────────────────
els.append(pause('p4', 'Step 4 — the setae, and the cirri at the tail'))


def setae(y, side):
    """Three bristles fanning OUT of one parapodium tip, spreading wider than it."""
    tx = CX + side * (hw(y) + PARA_LEN)
    bx = tx - side * 3.0
    out = []
    for dy0, dy1 in ((-4, -SETA_SPREAD), (0, 0), (4, SETA_SPREAD)):
        out.append(line(bx, y + dy0, tx + side * SETA_LEN, y + dy1))
    return ' '.join(out)


def seta_tip_x_at(y):
    return CX - hw(y) - PARA_LEN - SETA_LEN


for name, side, lo, hi in [('setae_l_a', -1, 0, 4), ('setae_l_b', -1, 4, 7),
                           ('setae_r_a', 1, 0, 4), ('setae_r_b', 1, 4, 7)]:
    els.append(stroke(name, ' '.join(setae(PARA_Y[k], side) for k in range(lo, hi)), w=1.1))

els.append(stroke('anal_cirri', line(254, 313, 236, 342) + ' ' + line(266, 313, 284, 342), w=1.4))

# ── phase 5: leaders and labels ───────────────────────────────────────────────
els.append(pause('p5', 'Step 5 — leader lines and labels'))

# left column
LEFTX = 6


def add_left(idx, text, y, tx, ty):
    els.append(label('lbl_' + idx, LEFTX, y, text))
    els.append(leader('ld_' + idx, LEFTX + label_w(text, sm=True) + 2, y - 4, tx, ty))


def add_right(idx, text, y, tx, ty):
    els.append(label('lbl_' + idx, 340, y, text))
    els.append(leader('ld_' + idx, 338, y - 4, tx, ty))


# targets computed from the geometry above
k_para = 2                                   # the parapodium the leader names
k_seta = 4                                   # the parapodium whose setae it names

# The "Parapodium" leader has to cross the wall of seta tips. Aim it through the
# MIDDLE of the gap between two seta fans (the gap is centred on the segment
# boundary), then solve back for the label height — never eyeball it.
para_target = (240.0, PARA_Y[k_para] - PARA_HW + 1)
gap_pt = (seta_tip_x_at(PARA_Y[k_para]), BOUND_Y[k_para - 1])   # y = 144
slope = (para_target[1] - gap_pt[1]) / (para_target[0] - gap_pt[0])
para_x0 = LEFTX + label_w('Parapodium', sm=True) + 2
para_y = round(para_target[1] - (para_target[0] - para_x0) * slope) + 4

seta_target = (seta_tip_x_at(PARA_Y[k_seta]) - 1, PARA_Y[k_seta] - SETA_SPREAD)

add_left('prostomium', 'Prostomium', 32, 246, 48)
add_left('peristomium', 'Peristomium', 74, 246, 70)
add_left('parapodium', 'Parapodium', para_y, para_target[0], para_target[1])
add_left('setae', 'Setae', 198, seta_target[0], seta_target[1])
add_left('anal_cirri', 'Anal cirri', 320, 245, 328)

add_right('antenna', 'Antenna (tentacle)', 22, 273, 11)
add_right('palp', 'Palp', 64, 292, 25)
add_right('eye', 'Eye', 106, 272, 46)

FIG = {"id": "ad1_nereis", "width": W, "height": H, "elements": els}


def report():
    bad = check(els, W, H, 'ad1_nereis')
    drawn = [e for e in els if e['type'] != 'pause']
    phases = [e for e in els if e['type'] == 'pause']
    total = 0.0
    longest = 0
    for e in els:
        if e['type'] == 'stroke':
            L = path_len(e['d'])
            longest = max(longest, L)
            total += min(max(L / 70.0, 0.3), 4.5)
        elif e['type'] == 'label':
            total += 0.45
    print(f"ad1_nereis  {W}x{H}  drawn={len(drawn)}  phases={len(phases)}  "
          f"~{total:.1f}s  longest stroke {longest:.0f}u")
    print(f"  parapodium label y={para_y}  leader crosses the seta wall at "
          f"x={gap_pt[0]:.1f}, y={gap_pt[1]:.1f} (gap centre); "
          f"leftmost drawn x={CX - hw(PARA_Y[0]) - PARA_LEN - SETA_LEN:.2f}")
    fan_half = SETA_SPREAD
    print(f"  seta fan half-height {fan_half} vs segment pitch {SEG} -> "
          f"gap between fans {SEG - 2 * fan_half:.1f} u "
          f"({(SEG - 2 * fan_half) / 2:.1f} u each side of the leader)")
    for b in bad:
        print('  BAD ' + b)
    return bad


if __name__ == '__main__':
    report()
    with io.open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'figs_ad1.json'),
                 'w', encoding='utf-8') as fh:
        json.dump({"ad1_nereis": FIG}, fh, ensure_ascii=False, indent=1)
