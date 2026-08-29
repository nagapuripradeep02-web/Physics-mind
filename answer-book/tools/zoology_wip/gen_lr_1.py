"""Unit 5 (Locomotion & Reproduction) figures, part 1:
   A. T.S. of flagellum (9 + 2)      -> lr_ts_flagellum
   B. Paramecium                     -> lr_paramecium
   C. Euglena                        -> lr_euglena
Writes figs_lr_1.json. Every repeated placement is COMPUTED, never hand-typed."""
import json, io, math
from figlib import *

FIGS = {}


def closed_catmull(pts, n=10):
    """Catmull-Rom through a CLOSED loop of points (figlib.catmull is open)."""
    P = [pts[-1]] + list(pts) + [pts[0], pts[1]]
    out = []
    for i in range(1, len(P) - 2):
        p0, p1, p2, p3 = P[i - 1], P[i], P[i + 1], P[i + 2]
        for k in range(n):
            t = k / n
            t2, t3 = t * t, t * t * t
            x = 0.5 * ((2 * p1[0]) + (-p0[0] + p2[0]) * t + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3)
            y = 0.5 * ((2 * p1[1]) + (-p0[1] + p2[1]) * t + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3)
            out.append((x, y))
    out.append(out[0])
    return out


def ticks(samples, centroid, step, length, start=0):
    """Short outward ticks (cilia) along a sampled closed outline."""
    d = ""
    for i in range(start, len(samples) - 1, step):
        x, y = samples[i]
        ux, uy = x - centroid[0], y - centroid[1]
        m = math.hypot(ux, uy) or 1
        ux, uy = ux / m, uy / m
        d += f" M {f(x)} {f(y)} L {f(x + ux * length)} {f(y + uy * length)}"
    return d.strip()


def right_labels(E, rows, x_lab, dx=4):
    """rows = [(id, y, text, (tx, ty))]; label at x_lab, leader from just left of it."""
    for id_, y, text, (tx, ty) in rows:
        E.append(label('lbl_' + id_, x_lab, y, text))
        E.append(leader('ld_' + id_, x_lab - dx, y - 4, tx, ty))


def left_labels(E, rows, x_lab=6, pad=5):
    for id_, y, text, (tx, ty) in rows:
        E.append(label('lbl_' + id_, x_lab, y, text))
        x1 = x_lab + label_w(text, sm=True) + pad
        E.append(leader('ld_' + id_, x1, y - 4, tx, ty))


# ═══════════════════ A. T.S. of flagellum — 520 x 384 ═══════════════════
def fig_flagellum():
    """9 peripheral DOUBLETS + 2 central singlets. The two tubules of a doublet
    overlap (centres 17 apart, r 13) while consecutive doublets sit 43 units
    apart, so the ring reads as NINE pairs and not as eighteen tubules."""
    W, H = 520, 384
    CX, CY = 150.0, 192.0
    R_OUT, R_DOU, R_TUB, SEP = 118.0, 86.0, 13.0, 17.0
    R_SHEATH, R_SING = 30.0, 12.0
    N = 9
    E = []

    def u(deg):
        r = math.radians(deg)
        return math.cos(r), math.sin(r)

    def pt(deg, rad):
        cx, cy = u(deg)
        return CX + rad * cx, CY + rad * cy

    ang = [-90.0 + 40.0 * k for k in range(N)]          # 9 doublets, 40 deg apart
    A_c, B_c, TAN, RAD = [], [], [], []
    for th in ang:
        rx, ry = u(th)
        tx, ty = -math.sin(math.radians(th)), math.cos(math.radians(th))   # clockwise tangent
        px, py = CX + R_DOU * rx, CY + R_DOU * ry
        A_c.append((px + SEP / 2 * tx, py + SEP / 2 * ty))   # A leads clockwise
        B_c.append((px - SEP / 2 * tx, py - SEP / 2 * ty))
        TAN.append((tx, ty)); RAD.append((rx, ry))

    E.append(pause('p1', 'Step 1 — plasma membrane and the central pair'))
    E.append(stroke('membrane_a', f"M {f(CX - R_OUT)} {f(CY)} A {f(R_OUT)} {f(R_OUT)} 0 0 1 {f(CX + R_OUT)} {f(CY)}"))
    E.append(stroke('membrane_b', f"M {f(CX + R_OUT)} {f(CY)} A {f(R_OUT)} {f(R_OUT)} 0 0 1 {f(CX - R_OUT)} {f(CY)}"))
    E.append(stroke('inner_sheath', circle(CX, CY, R_SHEATH)))
    E.append(stroke('singlet_l', circle(CX - 14, CY, R_SING)))
    E.append(stroke('singlet_r', circle(CX + 14, CY, R_SING)))

    E.append(pause('p2', 'Step 2 — the nine A tubules on a ring'))
    for k, (ax, ay) in enumerate(A_c):
        E.append(stroke(f'tub_a{k + 1}', circle(ax, ay, R_TUB)))

    E.append(pause('p3', 'Step 3 — the B tubule beside every A tubule'))
    for k, (bx, by) in enumerate(B_c):
        E.append(stroke(f'tub_b{k + 1}', circle(bx, by, R_TUB)))

    E.append(pause('p4', 'Step 4 — dynein arms and the nexin links'))
    d_arms = ""
    for k in range(N):
        tx, ty = TAN[k]; rx, ry = RAD[k]
        ax, ay = A_c[k]
        for s in (5.5, -5.5):
            # start ON the A circle, point clockwise towards the next doublet's B
            bx, by = ax + (R_TUB - 1) * tx + s * rx, ay + (R_TUB - 1) * ty + s * ry
            d_arms += f" M {f(bx)} {f(by)} L {f(bx + 9 * tx)} {f(by + 9 * ty)}"
    E.append(stroke('dynein_arms', d_arms.strip(), w=1.7))
    d_nex = ""
    for k in range(N):
        x0, y0 = pt(ang[k] + 12, 108)
        x1, y1 = pt(ang[k] + 28, 108)
        d_nex += f" M {f(x0)} {f(y0)} L {f(x1)} {f(y1)}"
    E.append(stroke('nexin_links', d_nex.strip(), w=1.7))

    E.append(pause('p5', 'Step 5 — the nine radial spokes'))
    d_sp = ""
    for th in ang:
        x0, y0 = pt(th + 5, 70)
        x1, y1 = pt(th + 5, 32)
        d_sp += f" M {f(x0)} {f(y0)} L {f(x1)} {f(y1)}"
    E.append(stroke('radial_spokes', d_sp.strip(), w=1.7))

    E.append(pause('p6', 'Step 6 — leader lines and labels'))
    rows = [
        ('outer_sheath', 40, 'Outer sheath', pt(-68, R_OUT)),
        ('nexin', 83, 'Nexin', pt(-34, 108)),
        ('doublets', 126, 'Peripheral doublets', A_c[2]),
        ('singlets', 169, 'Central singlets', (CX + 14, CY)),
        ('inner_sheath', 212, 'Inner sheath', pt(45, R_SHEATH)),
        ('spokes', 255, 'Radial spokes', pt(ang[3] + 5, 52)),
        ('b_tubule', 298, 'B (β) tubule', B_c[3]),
        ('a_tubule', 341, 'A (α) tubule', A_c[3]),
        ('dynein', 381, 'Dynein arms', (A_c[4][0] + 18 * TAN[4][0], A_c[4][1] + 18 * TAN[4][1])),
    ]
    right_labels(E, rows, 300)
    return {'id': 'lr_ts_flagellum', 'width': W, 'height': H, 'elements': E}


# ═══════════════════ B. Paramecium — 520 x 384 ═══════════════════
def fig_paramecium():
    W, H = 520, 384
    E = []
    # slipper outline: blunt anterior (top), pointed posterior (bottom), 104 wide
    outline = [(318, 56), (348, 76), (366, 116), (370, 165), (352, 200),
               (364, 248), (370, 296), (350, 332), (318, 352), (288, 334),
               (272, 292), (268, 232), (272, 170), (286, 110), (300, 74)]
    S = closed_catmull(outline, n=10)
    cen = (sum(p[0] for p in S) / len(S), sum(p[1] for p in S) / len(S))
    half = len(S) // 2

    E.append(pause('p1', 'Step 1 — the slipper-shaped body outline'))
    E.append(stroke('body_r', poly(S[:half + 1])))
    E.append(stroke('body_l', poly(S[half:])))

    E.append(pause('p2', 'Step 2 — cilia all round the body'))
    for i in range(4):
        E.append(stroke(f'cilia{i + 1}', ticks(S, cen, 16, 9, start=i * 4), w=1.5))

    E.append(pause('p3', 'Step 3 — oral groove, cytostome and cytopharynx'))
    E.append(stroke('groove_a', 'M 364 112 C 350 138 336 164 322 190'))
    E.append(stroke('groove_b', 'M 346 96 C 332 122 318 152 306 178'))
    E.append(stroke('cytostome', 'M 322 190 L 306 178'))
    E.append(stroke('pharynx_a', 'M 322 190 C 318 204 312 216 304 226'))
    E.append(stroke('pharynx_b', 'M 306 178 C 300 192 294 204 288 214'))
    E.append(stroke('pharynx_end', 'M 304 226 C 296 228 290 222 288 214'))

    E.append(pause('p4', 'Step 4 — the two nuclei and the food vacuoles'))
    E.append(stroke('macronucleus', ellipse(344, 212, 20, 13)))
    E.append(stroke('micronucleus', circle(352, 184, 7)))
    for i, (fx, fy) in enumerate([(326, 248), (338, 278), (320, 306), (302, 242)]):
        E.append(stroke(f'foodvac{i + 1}', circle(fx, fy, 10)))

    E.append(pause('p5', 'Step 5 — contractile vacuoles and the cytopyge'))
    for tag, (vx, vy) in [('ant', (304, 112)), ('post', (294, 300))]:
        E.append(stroke(f'cv_{tag}', circle(vx, vy, 9)))
        d = ""
        for j in range(6):
            a = math.radians(60 * j + 15)
            d += (f" M {f(vx + 10 * math.cos(a))} {f(vy + 10 * math.sin(a))}"
                  f" L {f(vx + 17 * math.cos(a))} {f(vy + 17 * math.sin(a))}")
        E.append(stroke(f'cv_{tag}_canals', d.strip(), w=1.5))
    E.append(stroke('cytopyge', 'M 344 306 L 356 300 M 346 320 L 358 324', w=1.7))

    E.append(pause('p6', 'Step 6 — leader lines and labels'))
    left_labels(E, [
        ('acv', 44, 'Anterior contractile vacuole', (296, 106)),
        ('groove', 100, 'Oral groove', (340, 146)),
        ('cytostome', 156, 'Cytostome', (312, 186)),
        ('pharynx', 212, 'Cytopharynx', (298, 212)),
        ('foodvac', 268, 'Food vacuole', (316, 250)),
        ('pcv', 356, 'Posterior contractile vacuole', (286, 306)),
    ])
    right_labels(E, [
        ('cilia', 60, 'Cilia', (358, 88)),
        ('pellicle', 112, 'Pellicle', (368, 148)),
        ('micro', 220, 'Micronucleus', (357, 182)),
        ('macro', 272, 'Macronucleus', (358, 214)),
        ('cytopyge', 324, 'Cytopyge', (352, 318)),
    ], 380)
    return {'id': 'lr_paramecium', 'width': W, 'height': H, 'elements': E}


# ═══════════════════ C. Euglena — 520 x 384 ═══════════════════
def fig_euglena():
    W, H = 520, 384
    E = []
    # spindle: blunt anterior (top, carrying the reservoir), pointed posterior
    outline = [(250, 90), (286, 106), (306, 152), (308, 210), (300, 266),
               (284, 312), (264, 342), (250, 356), (236, 342), (216, 312),
               (200, 266), (192, 210), (194, 152), (214, 106)]
    S = closed_catmull(outline, n=10)
    half = len(S) // 2

    E.append(pause('p1', 'Step 1 — the spindle body and the pellicle'))
    E.append(stroke('body_r', poly(S[:half + 1])))
    E.append(stroke('body_l', poly(S[half:])))
    E.append(stroke('pellicle_lines',
                    'M 304 180 C 300 190 295 197 288 202 M 306 226 C 302 236 297 243 290 248 '
                    'M 300 272 C 296 282 291 289 284 294', w=1.4))

    E.append(pause('p2', 'Step 2 — cytostome, cytopharynx and the reservoir'))
    E.append(stroke('cytostome', 'M 238 92 C 242 84 258 84 262 92'))
    E.append(stroke('pharynx_l', 'M 240 94 L 240 126'))
    E.append(stroke('pharynx_r', 'M 260 94 L 260 126'))
    E.append(stroke('reservoir', 'M 240 126 C 218 130 212 158 220 176 C 232 196 268 196 280 176 '
                                 'C 288 158 282 130 260 126 Z'))

    E.append(pause('p3', 'Step 3 — the two flagella and the blepharoplasts'))
    E.append(stroke('flag_long', 'M 242 178 C 238 134 232 82 220 44'))
    E.append(stroke('flag_short', 'M 258 178 C 264 168 270 158 274 150'))
    E.append(stroke('blepharo_1', circle(242, 180, 5)))
    E.append(stroke('blepharo_2', circle(258, 180, 5)))

    E.append(pause('p4', 'Step 4 — stigma, paraflagellar body, contractile vacuole'))
    E.append(stroke('stigma', ellipse(214, 134, 9, 6)))
    E.append(stroke('paraflag', circle(238, 140, 6)))
    E.append(stroke('cont_vac', circle(224, 210, 13)))
    E.append(stroke('acc_vac1', circle(205, 202, 6)))
    E.append(stroke('acc_vac2', circle(208, 228, 5)))

    E.append(pause('p5', 'Step 5 — chromatophores, paramylum granules, nucleus'))
    for i, (x, y) in enumerate([(212, 242), (288, 214), (222, 290), (288, 264), (238, 316), (266, 304)]):
        E.append(stroke(f'chrom{i + 1}', ellipse(x, y, 12, 7)))
    for i, (x, y) in enumerate([(256, 216), (248, 228), (284, 238), (246, 290), (250, 330)]):
        E.append(stroke(f'para{i + 1}', ellipse(x, y, 8, 5)))
    E.append(stroke('nucleus', ellipse(252, 258, 22, 18)))
    E.append(stroke('endosome', circle(252, 258, 7)))

    E.append(pause('p6', 'Step 6 — leader lines and labels'))
    left_labels(E, [
        ('flag_long', 44, 'Long flagellum', (226, 62)),
        ('cytostome', 96, 'Cytostome', (250, 88)),
        ('pharynx', 148, 'Cytopharynx', (238, 116)),
        ('stigma', 200, 'Stigma', (206, 134)),
        ('reservoir', 252, 'Reservoir', (221, 152)),
        ('blepharo', 304, 'Blepharoplast', (240, 182)),
        ('pellicle', 356, 'Pellicle', (204, 292)),
    ])
    right_labels(E, [
        ('paraflag', 60, 'Paraflagellar body', (242, 140)),
        ('short_flag', 112, 'Short flagellum', (272, 152)),
        ('cont_vac', 164, 'Contractile vacuole', (236, 208)),
        ('chrom', 216, 'Chromatophores', (298, 214)),
        ('paramylum', 268, 'Paramylum', (290, 238)),
        ('nucleus', 320, 'Nucleus', (274, 258)),
    ], 330)
    return {'id': 'lr_euglena', 'width': W, 'height': H, 'elements': E}


for fn in (fig_flagellum, fig_paramecium, fig_euglena):
    fig = fn()
    bad = check(fig['elements'], fig['width'], fig['height'], fig['id'])
    n_drawn = sum(1 for e in fig['elements'] if e['type'] != 'pause')
    n_ph = sum(1 for e in fig['elements'] if e['type'] == 'pause')
    print(f"{fig['id']}: {n_drawn} drawn, {n_ph} phases, {fig['width']}x{fig['height']}")
    for b in bad:
        print('   !', b)
    FIGS[fig['id']] = fig

io.open('figs_lr_1.json', 'w', encoding='utf-8').write(json.dumps(FIGS, indent=1, ensure_ascii=False))
print('-> figs_lr_1.json')
