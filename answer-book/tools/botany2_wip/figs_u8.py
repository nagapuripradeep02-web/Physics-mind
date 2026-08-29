# -*- coding: utf-8 -*-
"""Unit 8 figures — TMV and the T-even bacteriophage."""
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'zoology_wip'))
import figlib as F

# ══════════════════════ 1. TMV ══════════════════════════════════════════════
TW, TH = 520, 320
t = []
CX, RX, RY = 260, 60, 11
DISC_Y = [100, 122, 144, 166, 188, 210, 232, 254]

t.append(F.pause('t_p1', 'Step 1 — the stack of protein discs'))
for i, y in enumerate(DISC_Y):
    t.append(F.stroke(f'tv_disc{i}', F.ellipse(CX, y, RX, RY), w=1.8))
t.append(F.stroke('tv_side_l', F.line(CX - RX, 100, CX - RX, 254), w=1.8))
t.append(F.stroke('tv_side_r', F.line(CX + RX, 100, CX + RX, 254), w=1.8))

t.append(F.pause('t_p2', 'Step 2 — the hollow core down the middle'))
t.append(F.stroke('tv_core', F.ellipse(CX, 100, 10, 4)))

t.append(F.pause('t_p3', 'Step 3 — the single RNA strand coiled inside'))
t.append(F.stroke('tv_rna', 'M 260 96 C 242 86 278 76 260 66 C 242 56 278 46 260 36'))

t.append(F.pause('t_p4', 'Step 4 — the measurements'))
t += [
    F.stroke('tv_dim_v', F.line(160, 96, 160, 258), w=1.4),
    F.stroke('tv_dim_v_t', F.arrow_head(160, 96, 160, 130)),
    F.stroke('tv_dim_v_b', F.arrow_head(160, 258, 160, 224)),
    F.stroke('tv_dim_h', F.line(200, 288, 320, 288), w=1.4),
    F.stroke('tv_dim_h_l', F.arrow_head(200, 288, 236, 288)),
    F.stroke('tv_dim_h_r', F.arrow_head(320, 288, 284, 288)),
]

t.append(F.pause('t_p5', 'Step 5 — leader lines and labels'))
t += [
    F.leader('tl_rna', 326, 46, 274, 54),
    F.leader('tl_core', 332, 98, 272, 100),
    F.leader('tl_prot', 332, 168, 320, 166),
    F.label('tb_rna', 330, 44, 'RNA'),
    F.label('tb_core', 336, 100, 'Hollow core'),
    F.label('tb_prot', 336, 170, 'Protein subunits'),
    F.label('tb_len', 86, 180, '300 nm'),
    F.label('tb_dia', 232, 306, '18 nm'),
]
TMV = {'id': 'b2_vi_tmv', 'width': TW, 'height': TH, 'elements': t}

# ══════════════════════ 2. T-EVEN BACTERIOPHAGE ═════════════════════════════
PW, PH = 520, 384
p = []
HEAD = [(250, 64), (305, 88), (305, 132), (250, 156), (195, 132), (195, 88)]

p.append(F.pause('p_p1', 'Step 1 — the six sided head'))
p.append(F.stroke('bp_head', F.poly(HEAD, close=True)))

p.append(F.pause('p_p2', 'Step 2 — the DNA coiled inside the head'))
p.append(F.stroke('bp_dna', 'M 216 100 C 236 88 264 88 284 100 C 264 112 236 112 216 124 '
                            'C 236 136 264 136 284 124'))

p.append(F.pause('p_p3', 'Step 3 — the collar and the tail sheath'))
p += [
    F.stroke('bp_collar_t', F.line(230, 158, 270, 158), w=1.8),
    F.stroke('bp_collar_b', F.line(230, 170, 270, 170), w=1.8),
    F.stroke('bp_collar_l', F.line(230, 158, 230, 170), w=1.8),
    F.stroke('bp_collar_r', F.line(270, 158, 270, 170), w=1.8),
    F.stroke('bp_sheath_l', F.line(234, 170, 234, 250)),
    F.stroke('bp_sheath_r', F.line(266, 170, 266, 250)),
]
for i, y in enumerate(range(184, 250, 12)):
    p.append(F.stroke(f'bp_stria{i}', F.line(234, y, 266, y), w=1.4))

p.append(F.pause('p_p4', 'Step 4 — the hollow core inside the sheath'))
p.append(F.stroke('bp_core', F.line(250, 172, 250, 262), w=1.6, pen='pencil', wipe='y'))

p.append(F.pause('p_p5', 'Step 5 — the base plate, pins and tail fibres'))
p.append(F.stroke('bp_plate', F.poly([(212, 252), (288, 252), (280, 266), (220, 266)], close=True), w=1.8))
for i, px in enumerate((224, 238, 250, 262, 276)):
    p.append(F.stroke(f'bp_pin{i}', F.line(px, 266, px, 280), w=1.6))
# six fibres, three each side and NONE down the axis: a vertical middle fibre rendered as
# the hollow core carrying on below the base plate, which is not what a phage looks like.
for i, (x0, x1, x2) in enumerate([(220, 190, 174), (232, 210, 192), (242, 232, 220),
                                  (258, 268, 280), (268, 290, 308), (280, 310, 326)]):
    p.append(F.stroke(f'bp_fib{i}', f'M {x0} 266 L {x1} 306 L {x2} 342', w=1.8))

p.append(F.pause('p_p6', 'Step 6 — leader lines and labels'))
p += [
    F.leader('pl_head', 108, 98, 196, 100),
    F.leader('pl_collar', 122, 162, 228, 162),
    F.leader('pl_sheath', 128, 208, 232, 208),
    F.leader('pl_plate', 152, 258, 212, 258),
    F.leader('pl_dna', 326, 86, 272, 96),
    F.leader('pl_core', 326, 208, 254, 208),
    F.leader('pl_pins', 316, 284, 278, 274),
    F.leader('pl_fib', 316, 328, 300, 320),
    F.label('pb_head', 60, 100, 'Head'),
    F.label('pb_collar', 60, 164, 'Collar'),
    F.label('pb_sheath', 60, 210, 'Sheath'),
    F.label('pb_plate', 36, 262, 'Base plate'),
    F.label('pb_dna', 330, 88, 'DNA'),
    F.label('pb_core', 330, 210, 'Core'),
    F.label('pb_pins', 320, 286, 'Tail pins'),
    F.label('pb_fib', 320, 330, 'Tail fibres'),
]
PHAGE = {'id': 'b2_vi_t_even_phage', 'width': PW, 'height': PH, 'elements': p}

if __name__ == '__main__':
    for name, fig in (('tmv', TMV), ('phage', PHAGE)):
        bad = F.check(fig['elements'], fig['width'], fig['height'], name)
        print('\n'.join(bad) if bad else '%s: clean (%d elements, %d phases)'
              % (name, len(fig['elements']), sum(1 for e in fig['elements'] if e['type'] == 'pause')))
