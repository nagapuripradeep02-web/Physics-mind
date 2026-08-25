# -*- coding: utf-8 -*-
"""Unit 6 (bhw) figures. Writes figs_bhw.json for inject_fig.py."""
import json, io, math
from figlib import *
from wheellib import *

FIGS = {}
W, H = 520, 384

# ═════ shared wheel geometry ════════════════════════════════════════════════
CX, CY, RX, RY, PAD = 260, 196, 76, 120, 30


def build_wheel(fig_id, names, glyph_fns, captions, extra=None, extra_phase=None):
    """One life-cycle wheel: stage glyphs at computed elliptical positions,
    curved arrows with separate arrowheads, numbered names outside."""
    ang = wheel(CX, CY, RX, RY, len(names), start_deg=-67.5)
    E = []
    groups = len(captions) - 2          # captions[-2] = arrows, captions[-1] = labels
    per = -(-len(names) // groups)      # ceil
    ci = 0
    E.append(pause('p1', captions[0]))
    for k, (a, fn) in enumerate(zip(ang, glyph_fns)):
        if k and k % per == 0 and ci + 1 < groups:
            ci += 1
            E.append(pause('p%d' % (ci + 1), captions[ci]))
        x, y = pt(CX, CY, RX, RY, a)
        E += fn('g%d' % (k + 1), round(x, 1), round(y, 1))
    E.append(pause('pa', captions[-2]))
    E += wheel_arrows('w', CX, CY, RX, RY, ang, pad=0.24)
    E.append(pause('pl', captions[-1]))
    if extra:
        E += extra
    E += wheel_labels('n', CX, CY, RX, RY, ang, names, pad=PAD, W=W, H=H)
    return {'id': fig_id, 'width': W, 'height': H, 'elements': E}


# ═════ 1. Entamoeba — the three stages ══════════════════════════════════════
def fig_entamoeba_stages():
    E = []
    CY = 176
    E.append(pause('p1', 'Step 1 — the trophozoite outline and pseudopodium'))
    tx, ty = 120, CY
    pts = []
    for k in range(20):
        a = 2 * math.pi * k / 20
        rr = 1 + 0.08 * math.sin(3 * a + 0.6) + 0.05 * math.cos(5 * a)
        d = abs(((math.degrees(a) - 202 + 180) % 360) - 180)
        if d < 36:
            rr += 0.46 * math.cos(math.radians(d * 90 / 36))
        pts.append((tx + 54 * rr * math.cos(a), ty + 47 * rr * math.sin(a)))
    pts.append(pts[0])
    sc = catmull(pts, 4)
    E.append(stroke('tro_out_a', poly(sc[:len(sc) // 2 + 1])))
    E.append(stroke('tro_out_b', poly(sc[len(sc) // 2:])))
    inner = [(tx + (q[0] - tx) * 0.84, ty + (q[1] - ty) * 0.84) for q in pts]
    si = catmull(inner, 4)
    E.append(stroke('tro_endo_a', poly(si[:len(si) // 2 + 1]), w=1.4))
    E.append(stroke('tro_endo_b', poly(si[len(si) // 2:]), w=1.4))

    E.append(pause('p2', 'Step 2 — inside it: nucleus and food vacuoles'))
    nx, ny, nr = 108, CY + 28, 13
    E.append(stroke('tro_nuc', circle(nx, ny, nr), w=1.5))
    E.append(stroke('tro_kar', circle(nx, ny, 3.2), w=1.5))
    spokes = ""
    for k in range(8):
        a = 2 * math.pi * k / 8 + 0.2
        spokes += " M %s %s L %s %s" % (f(nx + 3.6 * math.cos(a)), f(ny + 3.6 * math.sin(a)),
                                        f(nx + (nr - 1.6) * math.cos(a)), f(ny + (nr - 1.6) * math.sin(a)))
    E.append(stroke('tro_spokes', spokes.strip(), w=1.2))
    E.append(stroke('tro_fv1', circle(154, CY + 4, 10), w=1.5))
    E.append(stroke('tro_rbc', circle(154, CY + 4, 5.4), w=1.5))
    E.append(stroke('tro_fv2', circle(102, CY - 26, 8), w=1.5))
    E.append(stroke('tro_bact', poly([(98, CY - 26), (106, CY - 28)]), w=2.6))
    E.append(stroke('tro_fv3', circle(142, CY + 34, 6.5), w=1.5))
    E.append(stroke('tro_fv4', circle(134, CY - 30, 6), w=1.5))

    E.append(pause('p3', 'Step 3 — the precystic stage: oval with granules'))
    px, py = 280, CY
    E.append(stroke('pre_out', ellipse(px, py, 38, 50)))
    E.append(stroke('pre_nuc', circle(px, py - 22, 10), w=1.5))
    E.append(stroke('pre_kar', circle(px, py - 22, 2.8), w=1.5))
    for i, (gx, gy, gr) in enumerate([(-18, -6, 5), (18, 0, 4.4), (-14, 14, 4.6), (16, 20, 4)]):
        E.append(stroke('pre_gr%d' % i, circle(px + gx, py + gy, gr), w=1.5))
    E.append(stroke('pre_bar1', poly([(px - 16, py + 30), (px + 4, py + 26)]), w=4.2))
    E.append(stroke('pre_bar2', poly([(px - 6, py + 40), (px + 14, py + 36)]), w=4.2))

    E.append(pause('p4', 'Step 4 — the cystic stage: thick wall, four nuclei'))
    cx2, cy2 = 440, CY
    E.append(stroke('cys_out', circle(cx2, cy2, 46)))
    E.append(stroke('cys_wall', circle(cx2, cy2, 40), w=1.5))
    for i, (dx, dy) in enumerate([(-20, -18), (20, -18), (-20, 18), (20, 18)]):
        E.append(stroke('cys_n%d' % i, circle(cx2 + dx, cy2 + dy, 8.5), w=1.5))
        E.append(stroke('cys_k%d' % i, circle(cx2 + dx, cy2 + dy, 2.6), w=1.5))
    E.append(stroke('cys_bar', poly([(cx2 - 12, cy2), (cx2 + 12, cy2 - 4)]), w=4.2))

    E.append(pause('p5', 'Step 5 — leader lines and labels'))
    # top row (y 40) and second row (y 84): leaders drop DOWN onto each stage
    top = [('pseudopodium', 4, 40, 'Pseudopodium', (62, 150)),
           ('glycogen', 210, 40, 'Glycogen granules', (296, 152)),
           ('cystwall', 420, 40, 'Cyst wall', (450, 134))]
    for id_, x, y, text, (ex, ey) in top:
        E.append(label('lbl_' + id_, x, y, text))
        E.append(leader('ld_' + id_, x + label_w(text, sm=True) / 2, y + 10, ex, ey))
    row2 = [('ectoplasm', 4, 84, 'Ectoplasm', (76, 152)),
            ('fournuclei', 400, 84, 'Four nuclei', (422, 156))]
    for id_, x, y, text, (ex, ey) in row2:
        E.append(label('lbl_' + id_, x, y, text))
        E.append(leader('ld_' + id_, x + label_w(text, sm=True) / 2, y + 10, ex, ey))
    # lower rows (y 290, 334): leaders rise UP onto each stage
    low = [('endoplasm', 4, 290, 'Endoplasm', (74, 202)),
           ('chromatoid', 215, 290, 'Chromatoid bar', (280, 214)),
           ('cartwheel', 4, 334, 'Cart-wheel nucleus', (104, 216)),
           ('vacrbc', 200, 334, 'Vacuole with RBC', (158, 190))]
    for id_, x, y, text, (ex, ey) in low:
        E.append(label('lbl_' + id_, x, y, text))
        E.append(leader('ld_' + id_, x + label_w(text, sm=True) / 2, y - 20, ex, ey))
    E.append(label('lbl_st1', 50, 376, 'TROPHOZOITE', sm=False))
    E.append(label('lbl_st2', 222, 376, 'PRECYSTIC', sm=False))
    E.append(label('lbl_st3', 401, 376, 'CYSTIC', sm=False))
    return {'id': 'bhw_entamoeba_stages', 'width': W, 'height': H, 'elements': E}


# ═════ 2. Entamoeba life cycle ══════════════════════════════════════════════
def fig_entamoeba_cycle():
    names = ['1. Trophozoite', '2. Fission', '3. Precystic', '4. Mature cyst',
             '5. In faeces', '6. Food, water', '7. Metacyst', '8. Eight amoebae']
    g = [lambda p, x, y: g_blob(p, x, y, r=16, seed=0.4),
         lambda p, x, y: g_two_blobs(p, x, y, r=11),
         lambda p, x, y: g_oval(p, x, y, rx=11, ry=16, granules=3, bars=1),
         lambda p, x, y: g_cyst(p, x, y, r=15, n=4),
         lambda p, x, y: g_cyst(p, x, y, r=13, n=4, wall=False),
         lambda p, x, y: (g_cyst(p, x, y, r=13, n=4, wall=False)
                          + [stroke(p + '_wv', "M %s %s Q %s %s %s %s Q %s %s %s %s" % (
                              f(x - 18), f(y + 20), f(x - 9), f(y + 15), f(x), f(y + 20),
                              f(x + 9), f(y + 25), f(x + 18), f(y + 20)), w=1.4)]),
         lambda p, x, y: (g_blob(p, x, y, r=15, seed=1.4, nuc=False)
                          + [stroke(p + '_n%d' % i, circle(x - 6 + 8 * (i % 2), y - 5 + 10 * (i // 2), 3.4), w=1.4)
                             for i in range(4)]),
         lambda p, x, y: g_cluster(p, x, y, n=8, r=15, er=3.8)]
    caps = ['Step 1 — trophozoite, binary fission and the precystic stage',
            'Step 2 — the cyst and its journey out with the faeces',
            'Step 3 — the metacyst and the eight daughter amoebae',
            'Step 4 — the arrows that close the ring',
            'Step 5 — numbered stage names']
    return build_wheel('bhw_entamoeba_life_cycle', names, g, caps)


# ═════ 3. Plasmodium in man ═════════════════════════════════════════════════
def fig_plasmodium_man():
    names = ['1. Sporozoite', '2. Liver cell', '3. Schizont', '4. Cryptozoites',
             '5. Signet ring', '6. Amoeboid', '7. Schizogony', '8. Gametocytes']
    g = [lambda p, x, y: g_sickle(p, x, y, L=34, w=9, tilt=-0.5),
         lambda p, x, y: (g_liver_cell(p, x, y, r=15)
                          + g_blob(p + 'b', x - 4, y + 3, r=7, seed=0.9)),
         lambda p, x, y: g_schizont(p, x, y, r=15, n=10),
         lambda p, x, y: g_cluster(p, x, y, n=8, r=14, er=3.6),
         lambda p, x, y: g_signet(p, x, y, r=16),
         lambda p, x, y: ([stroke(p + '_rbc', circle(x, y, 17))]
                          + g_blob(p + 'b', x, y, r=10, seed=1.7, spiky=0.22)),
         lambda p, x, y: (g_schizont(p, x, y, r=15, n=12)
                          + [stroke(p + '_br', "M %s %s L %s %s M %s %s L %s %s" % (
                              f(x + 11), f(y - 11), f(x + 20), f(y - 20),
                              f(x + 13), f(y + 9), f(x + 22), f(y + 17)), w=1.4)]),
         lambda p, x, y: ([stroke(p + '_m', circle(x - 9, y - 4, 9)),
                           stroke(p + '_mn', circle(x - 9, y - 4, 3.2), w=1.4),
                           stroke(p + '_f', circle(x + 9, y + 5, 11)),
                           stroke(p + '_fn', circle(x + 9, y + 5, 3.8), w=1.4)])]
    caps = ['Step 1 — sporozoite, liver cell, schizont and cryptozoites',
            'Step 2 — the stages inside the red blood cell',
            'Step 3 — schizogony and the two gametocytes',
            'Step 4 — the arrows that close the ring',
            'Step 5 — numbered stage names']
    return build_wheel('bhw_plasmodium_man_cycle', names, g, caps)


# ═════ 4. Plasmodium in mosquito ════════════════════════════════════════════
def fig_plasmodium_mosquito():
    names = ['1. Gametocytes', '2. Male gametes', '3. Female gamete', '4. Fertilization',
             '5. Zygote', '6. Ookinete', '7. Oocyst', '8. Sporozoites']
    g = [lambda p, x, y: ([stroke(p + '_m', circle(x - 9, y - 4, 9)),
                           stroke(p + '_mn', circle(x - 9, y - 4, 3.2), w=1.4),
                           stroke(p + '_f', circle(x + 9, y + 5, 11)),
                           stroke(p + '_fn', circle(x + 9, y + 5, 3.8), w=1.4)]),
         lambda p, x, y: g_star(p, x, y, r=11, n=8),
         lambda p, x, y: g_cone(p, x, y, r=14),
         lambda p, x, y: (g_cone(p, x, y, r=14)
                          + g_threads(p + 't', x + 26, y, n=2, L=16)),
         lambda p, x, y: ([stroke(p + '_z', circle(x, y, 14)),
                           stroke(p + '_zn', circle(x, y, 4.2), w=1.4)]),
         lambda p, x, y: g_ookinete(p, x, y, L=34, w=7, tilt=-0.7),
         lambda p, x, y: g_oocyst(p, x, y, r=15),
         lambda p, x, y: g_sickles(p, x, y, n=3, L=24)]
    caps = ['Step 1 — gametocytes and the male and female gametes',
            'Step 2 — fertilization, the zygote and the ookinete',
            'Step 3 — the oocyst on the crop wall and the sporozoites',
            'Step 4 — the arrows that close the ring',
            'Step 5 — numbered stage names']
    return build_wheel('bhw_plasmodium_mosquito_cycle', names, g, caps)


# ═════ 5. Ascaris — male and female ═════════════════════════════════════════
def fig_ascaris_bodies():
    E = []

    def body(pfx, ctrl, hw, n):
        pl = catmull(ctrl, n)
        L, R = offset(pl, hw)
        tip0 = (pl[0][0] + (pl[0][0] - pl[1][0]) * 2.2, pl[0][1] + (pl[0][1] - pl[1][1]) * 2.2)
        tip1 = (pl[-1][0] + (pl[-1][0] - pl[-2][0]) * 2.2, pl[-1][1] + (pl[-1][1] - pl[-2][1]) * 2.2)
        return [stroke(pfx + '_a', poly(L)), stroke(pfx + '_b', poly(R)),
                stroke(pfx + '_head', "M %s %s Q %s %s %s %s" % (
                    f(L[0][0]), f(L[0][1]), f(tip0[0]), f(tip0[1]), f(R[0][0]), f(R[0][1])), w=2.0),
                stroke(pfx + '_tip', "M %s %s Q %s %s %s %s" % (
                    f(L[-1][0]), f(L[-1][1]), f(tip1[0]), f(tip1[1]), f(R[-1][0]), f(R[-1][1])), w=2.0)]

    E.append(pause('p1', 'Step 1 — the male body and its curved tail'))
    E += body('male', [(170, 52), (175, 104), (167, 152), (175, 202), (186, 238), (176, 266), (152, 268), (147, 244)], 8.5, 7)

    E.append(pause('p2', 'Step 2 — the female body and its straight tail'))
    E += body('fem', [(340, 52), (347, 112), (337, 176), (346, 240), (338, 300), (344, 346)], 9.5, 8)

    E.append(pause('p3', 'Step 3 — mouth lips, the pores and the spicules'))
    for pfx, mx in (('m', 170), ('f', 340)):
        E.append(stroke(pfx + '_lip1', "M %s 52 Q %s 40 %s 52" % (f(mx - 8), f(mx - 4), f(mx)), w=1.5))
        E.append(stroke(pfx + '_lip2', "M %s 52 Q %s 40 %s 52" % (f(mx), f(mx + 4), f(mx + 8)), w=1.5))
        E.append(stroke(pfx + '_lip3', "M %s 56 Q %s 44 %s 56" % (f(mx - 4), f(mx), f(mx + 4)), w=1.5))
    E.append(stroke('m_expore', circle(162, 74, 3.4), w=1.5))
    E.append(stroke('f_expore', circle(332, 74, 3.4), w=1.5))
    E.append(stroke('f_genpore', "M 328 144 L 331 150 L 328 156", w=2.2))
    E.append(stroke('m_spic', "M 168 250 L 174 268 M 174 250 L 180 267", w=2.0))
    E.append(stroke('m_cloaca', circle(166, 272, 3.4), w=1.5))
    E.append(stroke('f_anus', "M 336 340 L 345 342", w=2.4))

    E.append(pause('p4', 'Step 4 — leader lines and labels'))
    E.append(label('lbl_male', 145, 32, 'MALE', sm=False))
    E.append(label('lbl_female', 302, 32, 'FEMALE', sm=False))
    left = [('mouth', 88, 'Mouth (3 lips)', (176, 50)),
            ('expore', 132, 'Excretory pore', (160, 76)),
            ('spicules', 280, 'Pineal spicules', (168, 256)),
            ('curved', 324, 'Curved tail', (150, 266)),
            ('cloaca', 368, 'Cloacal aperture', (164, 276))]
    for id_, y, text, (ex, ey) in left:
        E.append(label('lbl_' + id_, 4, y, text))
        E.append(leader('ld_' + id_, 4 + label_w(text, sm=True) + 5, y - 4, ex, ey))
    right = [('genpore', 132, 'Genital pore', (330, 150)),
             ('straight', 324, 'Straight tail', (348, 326)),
             ('anus', 368, 'Anus', (346, 344))]
    for id_, y, text, (ex, ey) in right:
        x = W - label_w(text, sm=True) - 4
        E.append(label('lbl_' + id_, round(x, 1), y, text))
        E.append(leader('ld_' + id_, round(x - 4, 1), y - 4, ex, ey))
    return {'id': 'bhw_ascaris_male_female', 'width': W, 'height': H, 'elements': E}


# ═════ 6. Ascaris life cycle ════════════════════════════════════════════════
def fig_ascaris_cycle():
    names = ['1. Adult worms', '2. Egg in faeces', '3. 1st larva', '4. Infective larva',
             '5. Small intestine', '6. Liver, heart', '7. Lungs', '8. Young worm']
    g = [lambda p, x, y: g_pair_ma_fe(p, x, y, r=17),
         lambda p, x, y: g_egg(p, x, y, rx=13, ry=17),
         lambda p, x, y: g_egg(p, x, y, rx=13, ry=17, inner='coil'),
         lambda p, x, y: g_egg(p, x, y, rx=13, ry=17, inner='larva'),
         lambda p, x, y: (g_egg(p, x, y, rx=13, ry=17, inner='larva')
                          + [stroke(p + '_crack', "M %s %s L %s %s M %s %s L %s %s" % (
                              f(x + 9), f(y - 10), f(x + 20), f(y - 18),
                              f(x + 11), f(y + 8), f(x + 21), f(y + 15)), w=1.4)]),
         lambda p, x, y: g_worm(p, x, y, L=26, amp=5.0, hw=2.6),
         lambda p, x, y: g_worm(p, x, y, L=32, amp=6.0, hw=3.0),
         lambda p, x, y: g_worm(p, x, y, L=38, amp=7.0, hw=3.6)]
    caps = ['Step 1 — the adult worms and the mammillated egg',
            'Step 2 — the two larval stages inside the egg',
            'Step 3 — the larva through liver, heart and lungs',
            'Step 4 — the arrows that close the ring',
            'Step 5 — numbered stage names']
    return build_wheel('bhw_ascaris_life_cycle', names, g, caps)


# ═════ 7. Wuchereria life cycle ═════════════════════════════════════════════
def fig_wuchereria_cycle():
    names = ['1. Adult worms', '2. Microfilaria', '3. Culex bites', '4. Sheath lost',
             '5. 1st stage', '6. 2nd stage', '7. 3rd stage', '8. Back in man']
    g = [lambda p, x, y: g_coiled_pair(p, x, y, r=15),
         lambda p, x, y: g_sheathed(p, x, y, L=32),
         lambda p, x, y: (g_sheathed(p, x, y, L=28)
                          + [stroke(p + '_bite', "M %s %s L %s %s" % (
                              f(x + 16), f(y - 18), f(x + 26), f(y - 28)), w=1.6),
                             stroke(p + '_bh', arrow_head(x + 16, y - 18, x + 26, y - 28, size=7), w=1.6)]),
         lambda p, x, y: g_worm(p, x, y, L=32, amp=5.0, hw=2.6),
         lambda p, x, y: g_worm(p, x, y, L=22, amp=4.0, hw=3.4),
         lambda p, x, y: g_worm(p, x, y, L=28, amp=5.0, hw=3.2),
         lambda p, x, y: g_worm(p, x, y, L=36, amp=5.5, hw=2.6),
         lambda p, x, y: g_coil_one(p, x, y, r=14)]
    caps = ['Step 1 — the adult worms and the sheathed microfilaria',
            'Step 2 — inside the mosquito: sheath lost, larva moults',
            'Step 3 — the infective larva and the return to man',
            'Step 4 — the arrows that close the ring',
            'Step 5 — numbered stage names and the two hosts']
    extra = [label('lbl_inman', 230, 170, 'IN MAN'),
             label('lbl_inmos', 205, 214, 'IN MOSQUITO')]
    return build_wheel('bhw_wuchereria_life_cycle', names, g, caps, extra=extra)


# ═════ 8. Sporozoite structure ══════════════════════════════════════════════
def fig_sporozoite():
    w2, h2 = 460, 352
    E = []
    E.append(pause('p1', 'Step 1 — the sickle-shaped body'))
    # both edges bow the SAME way: a crescent, swollen in the middle,
    # pointed at both ends — never the symmetric lens a mirrored pair gives
    E.append(stroke('body_l', 'M 170 46 C 104 104 92 232 160 314'))
    E.append(stroke('body_r', 'M 170 46 C 152 110 140 244 160 314'))

    E.append(pause('p2', 'Step 2 — the pellicle and its microtubules'))
    E.append(stroke('pellicle', 'M 169 58 C 110 112 100 230 160 302', w=1.4))
    ticks = ""
    for i in range(9):
        t = 0.14 + i * 0.085
        u = 1 - t
        x0 = 170 * u ** 3 + 104 * 3 * u * u * t + 92 * 3 * u * t * t + 160 * t ** 3
        y0 = 46 * u ** 3 + 104 * 3 * u * u * t + 232 * 3 * u * t * t + 314 * t ** 3
        ticks += " M %s %s L %s %s" % (f(x0 + 2), f(y0), f(x0 + 10), f(y0 - 1))
    E.append(stroke('microtubules', ticks.strip(), w=1.2))

    E.append(pause('p3', 'Step 3 — apical cup and secretory organelles'))
    E.append(stroke('apical', 'M 143 86 Q 154 74 165 82', w=1.6))
    E.append(stroke('secr1', ellipse(152, 68, 3.6, 6.5)))
    E.append(stroke('secr2', ellipse(162, 66, 3.6, 6.5)))

    E.append(pause('p4', 'Step 4 — Golgi complex, nucleus and mitochondrion'))
    E.append(stroke('golgi', 'M 122 128 Q 136 122 150 130 M 122 136 Q 136 130 149 138 M 123 144 Q 136 138 148 146', w=1.4))
    E.append(stroke('nucleus', ellipse(133, 200, 14, 21)))
    E.append(stroke('nucleolus', circle(133, 200, 5), w=1.5))
    E.append(stroke('mito', ellipse(140, 252, 8, 14)))
    E.append(stroke('mito_c', 'M 136 245 Q 144 249 137 254 Q 145 258 138 263', w=1.3))
    E.append(stroke('tubule', 'M 141 280 Q 150 287 143 293 Q 137 299 145 305', w=1.5))

    E.append(pause('p5', 'Step 5 — leader lines and labels'))
    right = [('apical', 48, 'Apical cup', (163, 82)),
             ('secretory', 92, 'Secretory organelles', (165, 66)),
             ('golgi', 136, 'Golgi complex', (150, 138)),
             ('pellicle', 180, 'Pellicle', (124, 170)),
             ('nucleus', 224, 'Nucleus', (147, 202)),
             ('mito', 268, 'Mitochondrion', (148, 252)),
             ('tubule', 312, 'Convoluted tubule', (148, 292))]
    for id_, y, text, (ex, ey) in right:
        x = 290 if label_w(text, sm=True) + 290 <= w2 - 4 else w2 - label_w(text, sm=True) - 4
        E.append(label('lbl_' + id_, round(x, 1), y, text))
        E.append(leader('ld_' + id_, round(x - 4, 1), y - 4, ex, ey))
    E.append(label('lbl_micro', 4, 92, 'Microtubules'))
    E.append(leader('ld_micro', 4 + label_w('Microtubules', sm=True) + 5, 88, 116, 126))
    return {'id': 'bhw_sporozoite', 'width': w2, 'height': h2, 'elements': E}


for fn in (fig_entamoeba_stages, fig_entamoeba_cycle, fig_plasmodium_man,
           fig_plasmodium_mosquito, fig_ascaris_bodies, fig_ascaris_cycle,
           fig_wuchereria_cycle, fig_sporozoite):
    fg = fn()
    FIGS[fg['id']] = fg
    bad = check(fg['elements'], fg['width'], fg['height'], fg['id'])
    drawn = len([e for e in fg['elements'] if e['type'] != 'pause'])
    ph = len([e for e in fg['elements'] if e['type'] == 'pause'])
    print(('OK ' if not bad else '!! ') + fg['id'], f'{drawn} drawn, {ph} phases')
    for b in bad:
        print('   !!', b)

io.open('figs_bhw.json', 'w', encoding='utf-8').write(json.dumps(FIGS, indent=1))
print('\nwrote figs_bhw.json')
