# -*- coding: utf-8 -*-
"""Unit 8 figures: lake ecosystem, the three food chains, energy flow,
summer stratification. Writes figs_ee.json. Run from this directory."""
import json, io, sys, os, math
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')))
from figlib import *

FIGS = {}


def edge_fn(ctrl, n=10):
    """(path_d, x_at_y) for a catmull edge that is monotone-ish in y."""
    s = catmull(ctrl, n)
    d = poly(s)

    def x_at(y):
        for i in range(len(s) - 1):
            y0, y1 = s[i][1], s[i + 1][1]
            if (y0 - y) * (y1 - y) <= 0 and y0 != y1:
                t = (y - y0) / (y1 - y0)
                return s[i][0] + t * (s[i + 1][0] - s[i][0])
        return s[0][0] if y < s[0][1] else s[-1][0]

    return d, x_at


def lrow(E, id_, x, y, text, tip, side='right'):
    """Margin label + its leader line to tip."""
    E.append(label('lbl_' + id_, x, y, text))
    w = label_w(text, sm=True)
    sx = x + w + 5 if side == 'right' else x - 4
    E.append(leader('ld_' + id_, sx, y - 4, tip[0], tip[1]))


# ═══════════ A. lake as an ecosystem (520 x 384) ════════════════════════════
def fig_lake():
    W, H = 520, 384
    SURF = 126           # water surface
    LIM = 222            # zone of compensation (effective light limit)
    E = []

    E.append(pause('p1', 'Step 1 — the lake basin and the water surface'))
    lb_d, lb_x = edge_fn([(14, 96), (48, 106), (84, 132), (118, 164), (146, 196),
                          (168, 222), (190, 252), (212, 278), (230, 294)])
    rb_d, rb_x = edge_fn([(492, 98), (482, 112), (472, 132), (456, 160), (438, 192),
                          (420, 222), (406, 244), (388, 270), (364, 296)])
    # the zone dividers must MEET the bank at the compensation depth — compute,
    # never guess, or the littoral wedge leaks into the limnetic zone.
    XL, XR = round(lb_x(LIM), 1), round(rb_x(LIM), 1)
    E.append(stroke('bank_l', lb_d))
    E.append(stroke('bank_r', rb_d))
    E.append(stroke('lake_bed', poly(catmull([(230, 294), (272, 302), (320, 303),
                                              (364, 296)], 8))))
    sx, ex = lb_x(SURF), rb_x(SURF)
    E.append(stroke('surface', line(sx, SURF, ex, SURF), w=2.0))

    E.append(pause('p2', 'Step 2 — the zone lines and the compensation level'))
    E.append(stroke('div_l', line(XL, SURF, XL, LIM), w=1.6))
    E.append(stroke('div_r', line(XR, SURF, XR, LIM), w=1.6))
    E.append(stroke('compensation', line(XL, LIM, XR, LIM), w=1.6))

    E.append(pause('p3', 'Step 3 — rooted plants in the littoral zone'))
    E.append(stroke('float_plant', ellipse(88, SURF, 12, 5)))
    # rooted hydrophytes standing in the littoral wedge: base ON the bank,
    # stem up to a floating leaf at the surface.
    for i, by in enumerate((156, 186, 212)):
        bx = round(lb_x(by), 1)
        # lean the stem SHORESIDE (tx < bx): a leaf drawn to the lake side of a
        # deep root crosses the littoral/limnetic divider and reads as limnetic.
        tx = round(bx - 6, 1)
        E.append(stroke(f'stem{i+1}', f'M {f(bx)} {f(by)} Q {f(bx - 2)} '
                                      f'{f((by + SURF) / 2)} {f(tx)} {f(SURF + 2)}', w=1.6))
        E.append(stroke(f'leaf{i+1}', ellipse(tx, SURF - 1, 10, 4.5)))
    assert lb_x(212) - 6 + 10 < XL, 'littoral plants must stay inside the zone'

    E.append(pause('p4', 'Step 4 — plankton, nekton and the decomposers'))
    plk = [(200, 150), (232, 168), (258, 142), (288, 178),
           (312, 152), (340, 172), (372, 148), (398, 176)]
    E.append(stroke('plankton', ' '.join(circle(x, y, 3.2) for x, y in plk), w=1.6))
    for i, (fx, fy, r) in enumerate(((300, 196, 22), (222, 204, 15))):
        E.append(stroke(f'fish{i+1}', ellipse(fx, fy, r, r * 0.45)))
        E.append(stroke(f'tail{i+1}', poly([(fx + r, fy), (fx + r + 13, fy - 9),
                                            (fx + r + 13, fy + 9)], close=True)))
    dec = [(250, 262), (276, 274), (300, 266), (324, 278), (266, 286), (298, 288)]
    E.append(stroke('decomposers', ' '.join(circle(x, y, 2.6) for x, y in dec), w=1.6))

    E.append(pause('p5', 'Step 5 — leader lines and labels'))
    lrow(E, 'littoral', 6, 40, 'Littoral zone', (126, 178))
    lrow(E, 'limnetic', 196, 40, 'Limnetic zone', (286, 160))
    lrow(E, 'watersurface', 380, 40, 'Water surface', (452, 127))
    lrow(E, 'rooted', 6, 84, 'Rooted plants', (152, 186))
    lrow(E, 'plankton', 196, 84, 'Plankton', (258, 145))
    lrow(E, 'nekton', 386, 84, 'Nekton', (324, 190), side='left')
    # Bottom four: the compensation leader runs nearly straight up the LEFT to
    # the near end of its own line, and the profundal label sits on the RIGHT.
    # Putting both on the left made their leaders cross at about y = 325.
    lrow(E, 'compensation', 6, 332, 'Zone of compensation', (178, 226))
    lrow(E, 'benthic', 354, 332, 'Benthic region', (334, 300), side='left')
    lrow(E, 'decomposers', 6, 374, 'Decomposers', (262, 288))
    lrow(E, 'profundal', 354, 374, 'Profundal zone', (280, 268), side='left')
    return {'id': 'ee_lake_ecosystem', 'width': W, 'height': H, 'elements': E}


# ═══════════ B. the three food chains (520 x 320) ═══════════════════════════
def fig_food_chains():
    W, H = 520, 320
    E = []
    PAD, GAP, BH = 16, 30, 34

    def chain(tag, names, top, phase_caption):
        """One horizontal chain: boxes + names + arrows (eaten -> eater)."""
        E.append(pause('p_' + tag, phase_caption))
        widths = [label_w(n, sm=True) + PAD for n in names]
        # LEFT-aligned, not centred: all three chains start at the same x, so the
        # chain name above sits over its own first box and the reader compares
        # what each chain STARTS with.
        x = 24.0
        cy = top + BH / 2
        base = top + BH / 2 + 5          # sm baseline sits ~5 below the centre
        for i, (n, w) in enumerate(zip(names, widths)):
            E.append(stroke(f'{tag}_box{i+1}',
                            poly([(x, top), (x + w, top), (x + w, top + BH),
                                  (x, top + BH)], close=True)))
            E.append(label(f'{tag}_txt{i+1}', round(x + PAD / 2, 1), base, n))
            if i < len(names) - 1:
                a0, a1 = x + w + 5, x + w + GAP - 8
                E.append(stroke(f'{tag}_arr{i+1}', line(a0, cy, a1, cy), w=1.8))
                E.append(stroke(f'{tag}_head{i+1}',
                                arrow_head(a1 + 4, cy, a0, cy, size=8), w=1.8))
            x += w + GAP

    chain('gr', ['Grass', 'Grasshopper', 'Frog', 'Snake', 'Hawk'], 76,
          'Step 1 — the grazing food chain, from grass to hawk')
    chain('pa', ['Tree', 'Birds', 'Parasites'], 172,
          'Step 2 — the parasitic food chain, large to small')
    chain('de', ['Detritus', 'Earthworm', 'Frog', 'Snake'], 268,
          'Step 3 — the detritus food chain, from dead matter')

    E.append(pause('p4', 'Step 4 — name the three chains'))
    E.append(label('name_gr', 10, 50, '1) Grazing food chain'))
    E.append(label('name_pa', 10, 146, '2) Parasitic food chain'))
    E.append(label('name_de', 10, 242, '3) Detritus food chain'))
    return {'id': 'ee_food_chains', 'width': W, 'height': H, 'elements': E}


# ═══════════ C. flow of energy (520 x 320) ══════════════════════════════════
def fig_energy():
    W, H = 520, 320
    CX, BASE, TOPY, TIERS = 210, 270, 94, 4
    # HW1 is 42, not a true point: the top tier still has to hold "0.1 kJ"
    # inside it. A sharp apex clipped the label off the left edge of the tier.
    HW0, HW1 = 140, 42                 # half-width at the base and at the apex
    E = []
    ys = [BASE - i * (BASE - TOPY) / TIERS for i in range(TIERS + 1)]
    hw = [HW0 + (HW1 - HW0) * i / TIERS for i in range(TIERS + 1)]

    E.append(pause('p1', 'Step 1 — the four tiers of the pyramid'))
    for i in range(TIERS):
        yb, yt, wb, wt = ys[i], ys[i + 1], hw[i], hw[i + 1]
        E.append(stroke(f'tier{i+1}', poly([(CX - wb, yb), (CX + wb, yb),
                                            (CX + wt, yt), (CX - wt, yt)], close=True)))

    E.append(pause('p2', 'Step 2 — the energy stored at each level'))
    vals = ['100 kJ', '10 kJ', '1 kJ', '0.1 kJ']
    mid = [round((ys[i] + ys[i + 1]) / 2 + 5, 1) for i in range(TIERS)]
    for i, v in enumerate(vals):
        E.append(label(f'val{i+1}', round(CX - label_w(v, sm=True) / 2, 1), mid[i], v))

    E.append(pause('p3', 'Step 3 — the 10% arrows going up the pyramid'))
    for i in range(TIERS - 1):
        y0, y1 = mid[i] - 14, mid[i + 1] + 4
        E.append(stroke(f'up{i+1}', line(44, y0, 44, y1 + 8), w=1.8))
        E.append(stroke(f'uphead{i+1}', arrow_head(44, y1, 44, y0, size=8), w=1.8))
        E.append(label(f'pct{i+1}', 8, round((y0 + y1) / 2 + 6, 1), '10%'))

    E.append(pause('p4', 'Step 4 — sunlight entering the producers'))
    E.append(stroke('sun', circle(60, 44, 15)))
    rays = ' '.join(
        f'M {f(60 + 20*math.cos(math.radians(a)))} {f(44 + 20*math.sin(math.radians(a)))} '
        f'L {f(60 + 27*math.cos(math.radians(a)))} {f(44 + 27*math.sin(math.radians(a)))}'
        for a in range(0, 360, 45))
    E.append(stroke('sun_rays', rays, w=1.6))
    E.append(stroke('sun_arrow', 'M 84 62 C 118 104 132 180 116 256', w=1.8))
    E.append(stroke('sun_head', arrow_head(116, 262, 122, 220, size=8), w=1.8))
    E.append(label('lbl_sun', 96, 40, 'Sunlight'))

    E.append(pause('p5', 'Step 5 — the names of the trophic levels'))
    for i, n in enumerate(['Producers', 'Herbivores', 'Carnivores', 'Top carnivores']):
        E.append(label(f'lvl{i+1}', 362, mid[i], n))
        E.append(leader(f'ldlvl{i+1}', 358, mid[i] - 4,
                        round(CX + hw[i] - 6, 1), round(mid[i] - 6, 1)))
    return {'id': 'ee_energy_flow', 'width': W, 'height': H, 'elements': E}


# ═══════════ D. summer stratification (520 x 320) ═══════════════════════════
def fig_stratification():
    W, H = 520, 320
    SURF, D1, D2, BOT = 58, 140, 210, 284
    E = []

    E.append(pause('p1', 'Step 1 — the lake outline and the water surface'))
    E.append(stroke('wall_l', line(30, SURF, 44, BOT)))
    E.append(stroke('bed', line(44, BOT, 476, BOT)))
    E.append(stroke('wall_r', line(476, BOT, 490, SURF)))
    E.append(stroke('surface', line(30, SURF, 490, SURF), w=2.0))

    E.append(pause('p2', 'Step 2 — the two lines dividing the three layers'))
    E.append(stroke('div1', line(40, D1, 480, D1), w=1.6))
    E.append(stroke('div2', line(35, D2, 485, D2), w=1.6))

    E.append(pause('p3', 'Step 3 — the sun and the oxygen in the top layer'))
    E.append(stroke('sun', circle(60, 26, 13)))
    E.append(stroke('sun_rays', ' '.join(
        f'M {f(60 + 18*math.cos(math.radians(a)))} {f(26 + 18*math.sin(math.radians(a)))} '
        f'L {f(60 + 24*math.cos(math.radians(a)))} {f(26 + 24*math.sin(math.radians(a)))}'
        for a in range(0, 360, 45)), w=1.6))
    # dots sit BELOW their band's label row and clear of the divider lines —
    # a dot resting on a divider reads as belonging to the wrong layer.
    o2 = [(120, 124), (176, 130), (232, 122), (288, 130), (344, 124), (400, 130)]
    E.append(stroke('oxygen', ' '.join(circle(x, y, 3.2) for x, y in o2), w=1.6))
    nut = [(140, 270), (200, 276), (260, 270), (320, 276), (380, 270)]
    E.append(stroke('nutrients', ' '.join(circle(x, y, 2.6) for x, y in nut), w=1.6))

    E.append(pause('p4', 'Step 4 — name the three layers'))
    E.append(label('lbl_epi', 48, 92, 'Epilimnion'))
    E.append(label('lbl_thermo', 48, 176, 'Thermocline'))
    E.append(label('lbl_hypo', 48, 244, 'Hypolimnion'))

    E.append(pause('p5', 'Step 5 — the temperature of each layer'))
    E.append(label('tmp_epi', 300, 92, '21°C to 25°C'))
    E.append(label('tmp_thermo', 296, 176, 'falls 1°C per metre'))
    E.append(label('tmp_hypo', 300, 244, 'about 7°C'))
    return {'id': 'ee_summer_stratification', 'width': W, 'height': H, 'elements': E}


for fn in (fig_lake, fig_food_chains, fig_energy, fig_stratification):
    fg = fn()
    FIGS[fg['id']] = fg
    for b in check(fg['elements'], fg['width'], fg['height'], fg['id']):
        print('!!', b)
    drawn = len([e for e in fg['elements'] if e['type'] != 'pause'])
    phases = len([e for e in fg['elements'] if e['type'] == 'pause'])
    print(f"{fg['id']}: {drawn} drawn, {phases} phases, {fg['width']}x{fg['height']}")
io.open('figs_ee.json', 'w', encoding='utf-8').write(json.dumps(FIGS, indent=1))
print('-> figs_ee.json')
