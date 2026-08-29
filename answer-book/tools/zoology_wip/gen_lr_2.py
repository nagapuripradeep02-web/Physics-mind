"""Unit 5 (Locomotion & Reproduction) figures, part 2:
   D. transverse binary fission in Paramecium -> lr_transverse_fission
   E. longitudinal binary fission in Euglena  -> lr_longitudinal_fission
   F. the five types of flagella              -> lr_flagella_types
   G. the four types of pseudopodia           -> lr_pseudopodia_types
Writes figs_lr_2.json. Every repeated placement is COMPUTED, never hand-typed."""
import json, io, math
from figlib import *

FIGS = {}

# normalised outlines, y = -1 at the ANTERIOR end, +1 at the POSTERIOR end
SLIPPER = [(0.00, -1.00), (0.48, -0.88), (0.80, -0.58), (0.90, -0.18), (0.96, 0.28),
           (0.82, 0.66), (0.44, 0.93), (0.00, 1.00), (-0.44, 0.93), (-0.82, 0.66),
           (-0.96, 0.28), (-0.90, -0.18), (-0.80, -0.58), (-0.48, -0.88)]
SPINDLE = [(0.00, -1.00), (0.42, -0.78), (0.72, -0.40), (0.86, 0.00), (0.80, 0.40),
           (0.58, 0.72), (0.22, 0.94), (0.00, 1.00), (-0.22, 0.94), (-0.58, 0.72),
           (-0.80, 0.40), (-0.86, 0.00), (-0.72, -0.40), (-0.42, -0.78)]


def closed_catmull(pts, n=8):
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


def body(norm, cx, cy, hw, hh, pinch=0.0, rot=0.0, pivot=(0.0, 1.0)):
    """World points of a normalised outline, with an optional waist pinch and rotation."""
    pts = []
    px, py = cx + pivot[0] * hw, cy + pivot[1] * hh
    a = math.radians(rot)
    for nx, ny in norm:
        if pinch:
            nx = nx * (1.0 - pinch * math.exp(-(ny / 0.24) ** 2))
        x, y = cx + nx * hw, cy + ny * hh
        if rot:
            dx, dy = x - px, y - py
            x, y = px + dx * math.cos(a) - dy * math.sin(a), py + dx * math.sin(a) + dy * math.cos(a)
        pts.append((x, y))
    return closed_catmull(pts)


def cilia_of(samples, cen, step, length, start=0, ):
    d = ""
    for i in range(start, len(samples) - 1, step):
        x, y = samples[i]
        ux, uy = x - cen[0], y - cen[1]
        m = math.hypot(ux, uy) or 1
        d += f" M {f(x)} {f(y)} L {f(x + ux / m * length)} {f(y + uy / m * length)}"
    return d.strip()


def auto_label(E, id_, x, y, text, tgt, pad=5):
    """Label plus a leader started on whichever side of the text faces the target."""
    w = label_w(text, sm=True)
    x1 = x + w + pad if tgt[0] >= x + w / 2 else x - pad
    E.append(label('lbl_' + id_, x, y, text))
    E.append(leader('ld_' + id_, x1, y - 4, tgt[0], tgt[1]))


# ═══════════════ D. transverse binary fission in Paramecium — 520 x 352 ═══════════════
def fig_transverse():
    W, H = 520, 352
    XS = [82, 200, 318, 436]
    CY, HW, HH = 130, 26, 90
    E = []

    def outline(cx, pinch=0.0, hh=HH, cy=CY, hw=HW):
        S = body(SLIPPER, cx, cy, hw, hh, pinch=pinch)
        cen = (sum(p[0] for p in S) / len(S), sum(p[1] for p in S) / len(S))
        return S, cen

    # ── stage A: the parent
    E.append(pause('p1', 'Step 1 — stage A: the parent Paramecium'))
    S, cen = outline(XS[0])
    E.append(stroke('a_body', poly(S)))
    E.append(stroke('a_cilia', cilia_of(S, cen, 8, 8), w=1.4))
    E.append(stroke('a_groove', f'M {XS[0] + 20} 84 C {XS[0] + 13} 96 {XS[0] + 5} 106 {XS[0] - 3} 112', w=1.6))
    E.append(stroke('a_groove2', f'M {XS[0] + 12} 72 C {XS[0] + 4} 86 {XS[0] - 4} 98 {XS[0] - 11} 104', w=1.6))
    E.append(stroke('a_macro', ellipse(XS[0] + 2, 140, 15, 10)))
    E.append(stroke('a_micro', circle(XS[0] + 6, 118, 6)))
    E.append(stroke('a_cv1', circle(XS[0] - 10, 78, 7)))
    E.append(stroke('a_cv2', circle(XS[0] - 8, 190, 7)))

    # ── stage B: the nuclei divide
    E.append(pause('p2', 'Step 2 — stage B: both nuclei divide'))
    S, cen = outline(XS[1])
    E.append(stroke('b_body', poly(S)))
    E.append(stroke('b_cilia', cilia_of(S, cen, 8, 8), w=1.4))
    E.append(stroke('b_macro1', ellipse(XS[1] + 2, 106, 14, 9)))
    E.append(stroke('b_macro2', ellipse(XS[1] + 2, 168, 14, 9)))
    E.append(stroke('b_micro1', circle(XS[1] + 8, 86, 6)))
    E.append(stroke('b_micro2', circle(XS[1] + 8, 190, 6)))
    E.append(stroke('b_cv1', circle(XS[1] - 10, 74, 7)))
    E.append(stroke('b_cv2', circle(XS[1] - 8, 192, 7)))

    # ── stage C: the transverse constriction
    E.append(pause('p3', 'Step 3 — stage C: a constriction across the middle'))
    S, cen = outline(XS[2], pinch=0.62)
    E.append(stroke('c_body', poly(S)))
    E.append(stroke('c_cilia', cilia_of(S, cen, 8, 8), w=1.4))
    E.append(stroke('c_macro1', ellipse(XS[2] + 2, 98, 14, 9)))
    E.append(stroke('c_macro2', ellipse(XS[2] + 2, 172, 14, 9)))
    E.append(stroke('c_micro1', circle(XS[2] + 8, 78, 6)))
    E.append(stroke('c_micro2', circle(XS[2] + 8, 194, 6)))
    E.append(stroke('c_cv1', circle(XS[2] - 10, 72, 7)))
    E.append(stroke('c_cv2', circle(XS[2] - 8, 196, 7)))
    E.append(stroke('c_arrows', f'M {XS[2] - 34} 130 L {XS[2] - 22} 130 M {XS[2] + 34} 130 L {XS[2] + 22} 130', w=1.6))
    E.append(stroke('c_arrowheads', arrow_head(XS[2] - 22, 130, XS[2] - 34, 130, 6) + ' ' +
                    arrow_head(XS[2] + 22, 130, XS[2] + 34, 130, 6), w=1.6))

    # ── stage D: proter and opisthe
    E.append(pause('p4', 'Step 4 — stage D: proter and opisthe separate'))
    S1, cen1 = outline(XS[3], hh=41, cy=79)
    S2, cen2 = outline(XS[3], hh=41, cy=181)
    E.append(stroke('d_body1', poly(S1)))
    E.append(stroke('d_cilia1', cilia_of(S1, cen1, 7, 8), w=1.4))
    E.append(stroke('d_body2', poly(S2)))
    E.append(stroke('d_cilia2', cilia_of(S2, cen2, 7, 8), w=1.4))
    E.append(stroke('d_macro1', ellipse(XS[3] + 2, 82, 13, 8)))
    E.append(stroke('d_macro2', ellipse(XS[3] + 2, 184, 13, 8)))
    E.append(stroke('d_micro1', circle(XS[3] + 9, 62, 6)))
    E.append(stroke('d_micro2', circle(XS[3] + 9, 164, 6)))
    E.append(stroke('d_cv1', circle(XS[3] - 11, 62, 6)))
    E.append(stroke('d_cv2', circle(XS[3] - 11, 96, 6)))
    E.append(stroke('d_cv3', circle(XS[3] - 11, 164, 6)))
    E.append(stroke('d_cv4', circle(XS[3] - 11, 198, 6)))

    # ── labels
    E.append(pause('p5', 'Step 5 — stage letters and labels'))
    for i, ch in enumerate('ABCD'):
        E.append(label(f'stage_{ch}', XS[i] - 7, 250, ch, sm=False, em=True))
    auto_label(E, 'micro', 6, 296, 'Micronucleus', (XS[0] + 6, 118))
    auto_label(E, 'macro', 6, 342, 'Macronucleus', (XS[0] + 2, 142))
    auto_label(E, 'constriction', 180, 296, 'Constriction', (XS[2] - 20, 130))
    auto_label(E, 'groove', 180, 342, 'Oral groove', (XS[0] + 6, 96))
    auto_label(E, 'proter', 420, 296, 'Proter', (XS[3] + 20, 62))
    auto_label(E, 'opisthe', 420, 342, 'Opisthe', (XS[3] + 20, 200))
    return {'id': 'lr_transverse_fission', 'width': W, 'height': H, 'elements': E}


# ═══════════════ E. longitudinal binary fission in Euglena — 520 x 352 ═══════════════
def fig_longitudinal():
    W, H = 520, 352
    XS = [82, 200, 318, 436]
    CY, HW, HH = 132, 24, 90
    E = []

    def spindle(cx, hw=HW, hh=HH, cy=CY, rot=0.0):
        return body(SPINDLE, cx, cy, hw, hh, rot=rot)

    # ── stage A: the parent
    E.append(pause('p1', 'Step 1 — stage A: the parent Euglena'))
    E.append(stroke('a_body', poly(spindle(XS[0]))))
    E.append(stroke('a_flag', f'M {XS[0]} 42 C {XS[0] - 6} 26 {XS[0] - 14} 14 {XS[0] - 22} 6'))
    E.append(stroke('a_res', ellipse(XS[0], 58, 8, 9)))
    E.append(stroke('a_stigma', ellipse(XS[0] - 11, 66, 6, 4)))
    E.append(stroke('a_nucleus', ellipse(XS[0], 150, 14, 11)))
    E.append(stroke('a_chrom1', ellipse(XS[0] - 10, 108, 9, 5)))
    E.append(stroke('a_chrom2', ellipse(XS[0] + 10, 194, 9, 5)))

    # ── stage B: the nucleus divides
    E.append(pause('p2', 'Step 2 — stage B: the nucleus divides'))
    E.append(stroke('b_body', poly(spindle(XS[1]))))
    E.append(stroke('b_flag', f'M {XS[1]} 42 C {XS[1] - 6} 26 {XS[1] - 14} 14 {XS[1] - 22} 6'))
    E.append(stroke('b_res', ellipse(XS[1], 58, 8, 9)))
    E.append(stroke('b_nuc1', ellipse(XS[1] - 11, 146, 11, 9)))
    E.append(stroke('b_nuc2', ellipse(XS[1] + 11, 156, 11, 9)))
    E.append(stroke('b_spindle', f'M {XS[1] - 4} 140 L {XS[1] + 4} 162 M {XS[1] - 4} 152 L {XS[1] + 4} 150', w=1.4))
    E.append(stroke('b_chrom1', ellipse(XS[1] - 10, 108, 9, 5)))
    E.append(stroke('b_chrom2', ellipse(XS[1] + 10, 194, 9, 5)))

    # ── stage C: the longitudinal furrow
    E.append(pause('p3', 'Step 3 — stage C: a furrow opens at the front'))
    E.append(stroke('c_body', poly(spindle(XS[2]))))
    E.append(stroke('c_furrow_l', f'M {XS[2] - 5} 44 C {XS[2] - 14} 78 {XS[2] - 14} 116 {XS[2] - 5} 150'))
    E.append(stroke('c_furrow_r', f'M {XS[2] + 5} 44 C {XS[2] + 14} 78 {XS[2] + 14} 116 {XS[2] + 5} 150'))
    E.append(stroke('c_flag1', f'M {XS[2] - 6} 50 C {XS[2] - 12} 32 {XS[2] - 20} 18 {XS[2] - 28} 8'))
    E.append(stroke('c_flag2', f'M {XS[2] + 6} 50 C {XS[2] + 12} 34 {XS[2] + 18} 24 {XS[2] + 24} 18'))
    E.append(stroke('c_nuc1', ellipse(XS[2] - 12, 172, 10, 9)))
    E.append(stroke('c_nuc2', ellipse(XS[2] + 12, 172, 10, 9)))
    E.append(stroke('c_chrom', ellipse(XS[2] + 10, 202, 9, 5)))

    # ── stage D: two daughter euglenae
    E.append(pause('p4', 'Step 4 — stage D: two daughter euglenae'))
    E.append(stroke('d_body_l', poly(spindle(XS[3], hw=15, hh=88, rot=-10))))
    E.append(stroke('d_body_r', poly(spindle(XS[3], hw=15, hh=88, rot=10))))
    E.append(stroke('d_flag_l', f'M {XS[3] - 20} 48 C {XS[3] - 28} 32 {XS[3] - 36} 20 {XS[3] - 44} 12'))
    E.append(stroke('d_flag_r', f'M {XS[3] + 20} 48 C {XS[3] + 26} 36 {XS[3] + 32} 28 {XS[3] + 38} 22'))
    E.append(stroke('d_nuc_l', ellipse(XS[3] - 18, 152, 9, 8)))
    E.append(stroke('d_nuc_r', ellipse(XS[3] + 18, 152, 9, 8)))

    # ── labels
    E.append(pause('p5', 'Step 5 — stage letters and labels'))
    for i, ch in enumerate('ABCD'):
        E.append(label(f'stage_{ch}', XS[i] - 7, 250, ch, sm=False, em=True))
    auto_label(E, 'flagellum', 20, 296, 'Flagellum', (XS[0] - 22, 6))
    auto_label(E, 'nucleus', 6, 342, 'Nucleus', (XS[0] - 12, 152))
    auto_label(E, 'divnuc', 140, 296, 'Dividing nucleus', (XS[1] + 4, 152))
    auto_label(E, 'furrow', 140, 342, 'Longitudinal furrow', (XS[2], 100))
    auto_label(E, 'daughters', 310, 296, 'Daughter euglenae', (458, 145))
    return {'id': 'lr_longitudinal_fission', 'width': W, 'height': H, 'elements': E}


# ═══════════════ F. types of flagella — 520 x 352 ═══════════════
def fig_flagella_types():
    W, H = 520, 352
    XS = [60, 118, 176, 234, 292]
    TOP, BASE = 70, 230
    E = []

    E.append(pause('p1', 'Step 1 — five bare shafts on their cell bases'))
    for i, x in enumerate(XS):
        E.append(stroke(f'shaft{i + 1}', f'M {x} {BASE} L {x} {TOP}'))
        E.append(stroke(f'base{i + 1}',
                        f'M {x - 13} 254 L {x - 4} {BASE} M {x + 4} {BASE} L {x + 13} 254 '
                        f'M {x - 13} 254 Q {x} 262 {x + 13} 254', w=1.8))

    def row(x, side):
        d = ""
        y = TOP + 12
        while y <= BASE - 10:
            d += f" M {f(x)} {f(y)} L {f(x + side * 11)} {f(y - 4)}"
            y += 11
        return d.strip()

    E.append(pause('p2', 'Step 2 — A stichonematic: one row of mastigonemes'))
    E.append(stroke('mast_a', row(XS[0], -1), w=1.3))

    E.append(pause('p3', 'Step 3 — B pantonematic: two rows of mastigonemes'))
    E.append(stroke('mast_b_l', row(XS[1], -1), w=1.3))
    E.append(stroke('mast_b_r', row(XS[1], 1), w=1.3))

    E.append(pause('p4', 'Step 4 — C acronematic: a naked terminal filament'))
    E.append(stroke('filament_c', f'M {XS[2]} {TOP} L {XS[2]} 46', w=1.2))

    E.append(pause('p5', 'Step 5 — D pantacronematic: two rows and a naked tip'))
    E.append(stroke('mast_d_l', row(XS[3], -1), w=1.3))
    E.append(stroke('mast_d_r', row(XS[3], 1), w=1.3))
    E.append(stroke('filament_d', f'M {XS[3]} {TOP} L {XS[3]} 46', w=1.2))

    E.append(pause('p6', 'Step 6 — type names and labels; E stays plain'))
    for i, ch in enumerate('ABCDE'):
        E.append(label(f'stage_{ch}', XS[i] - 7, 290, ch, sm=False, em=True))
    names = ['A — Stichonematic', 'B — Pantonematic', 'C — Acronematic',
             'D — Pantacronematic', 'E — Anematic']
    for i, t in enumerate(names):
        E.append(label(f'name{i + 1}', 330, 60 + 44 * i, t))
    # Axoneme points at shaft E (nearest the legend); Mastigonemes runs BELOW the
    # cell bases to reach shaft D, so neither leader crosses a drawn shaft.
    E.append(label('lbl_axo', 330, 280, 'Axoneme'))
    E.append(leader('ld_axo', 326, 276, XS[4], 180))
    E.append(label('lbl_mast', 330, 324, 'Mastigonemes'))
    E.append(leader('ld_mast', 326, 320, XS[3] + 11, 222))
    E.append(label('title', 80, 334, 'TYPES OF FLAGELLA', sm=False))
    return {'id': 'lr_flagella_types', 'width': W, 'height': H, 'elements': E}


# ═══════════════ G. types of pseudopodia — 520 x 320 ═══════════════
def fig_pseudopodia():
    W, H = 520, 320
    XS = [70, 195, 320, 445]
    CY = 130
    E = []

    E.append(pause('p1', 'Step 1 — four cell bodies in a row'))
    for i, x in enumerate(XS):
        E.append(stroke(f'cell{i + 1}', ellipse(x, CY, 21, 18)))

    def ray_pts(cx, n, r0, r1, phase=0.0):
        out = []
        for k in range(n):
            a = phase + 2 * math.pi * k / n
            ca, sa = math.cos(a), math.sin(a)
            out.append(((cx + r0 * 21 * ca, CY + r0 * 18 * sa), (cx + r1 * ca, CY + r1 * sa)))
        return out

    E.append(pause('p2', 'Step 2 — lobopodia: blunt finger-like lobes'))
    for i, (b, t) in enumerate(ray_pts(XS[0], 4, 0.92, 46, phase=-0.5)):
        E.append(stroke(f'lobo{i + 1}', finger(b[0], b[1], t[0], t[1], hw=6.5)))

    E.append(pause('p3', 'Step 3 — filopodia: fine separate threads'))
    d = ""
    for b, t in ray_pts(XS[1], 9, 0.95, 48, phase=0.2):
        d += f" M {f(b[0])} {f(b[1])} L {f(t[0])} {f(t[1])}"
    E.append(stroke('filo', d.strip(), w=1.3))

    E.append(pause('p4', 'Step 4 — reticulopodia: threads joined into a network'))
    outer = ray_pts(XS[2], 9, 0.95, 48, phase=0.2)
    d = ""
    for b, t in outer:
        d += f" M {f(b[0])} {f(b[1])} L {f(t[0])} {f(t[1])}"
    E.append(stroke('retic', d.strip(), w=1.3))
    d = ""
    for k in range(9):
        for frac in (0.45, 0.80):
            (b0, t0), (b1, t1) = outer[k], outer[(k + 1) % 9]
            p0 = (b0[0] + (t0[0] - b0[0]) * frac, b0[1] + (t0[1] - b0[1]) * frac)
            p1 = (b1[0] + (t1[0] - b1[0]) * frac, b1[1] + (t1[1] - b1[1]) * frac)
            d += f" M {f(p0[0])} {f(p0[1])} L {f(p1[0])} {f(p1[1])}"
    E.append(stroke('retic_net', d.strip(), w=1.3))

    E.append(pause('p5', 'Step 5 — axopodia: straight rays with an axial rod'))
    d = ""
    for b, t in ray_pts(XS[3], 8, 0.95, 50, phase=0.0):
        d += f" M {f(b[0])} {f(b[1])} L {f(t[0])} {f(t[1])}"
    E.append(stroke('axo_rays', d.strip(), w=1.6))
    d = ""
    for b, t in ray_pts(XS[3], 8, 0.9, 6, phase=0.0):
        d += f" M {f(b[0])} {f(b[1])} L {f(t[0])} {f(t[1])}"
    E.append(stroke('axo_rods', d.strip(), w=1.2))
    E.append(stroke('axo_centre', circle(XS[3], CY, 5)))

    E.append(pause('p6', 'Step 6 — the four names and their examples'))
    for i, (x, t) in enumerate([(20, 'Lobopodium'), (145, 'Filopodium'),
                                (250, 'Reticulopodium'), (400, 'Axopodium')]):
        E.append(label(f'name{i + 1}', x, 240, t))
    for i, (x, t) in enumerate([(42, 'Amoeba'), (155, 'Euglypha'),
                                (276, 'Elphidium'), (390, 'Actinophrys')]):
        E.append(label(f'eg{i + 1}', x, 284, t))
    return {'id': 'lr_pseudopodia_types', 'width': W, 'height': H, 'elements': E}


for fn in (fig_transverse, fig_longitudinal, fig_flagella_types, fig_pseudopodia):
    fig = fn()
    bad = check(fig['elements'], fig['width'], fig['height'], fig['id'])
    n_drawn = sum(1 for e in fig['elements'] if e['type'] != 'pause')
    n_ph = sum(1 for e in fig['elements'] if e['type'] == 'pause')
    print(f"{fig['id']}: {n_drawn} drawn, {n_ph} phases, {fig['width']}x{fig['height']}")
    for b in bad:
        print('   !', b)
    FIGS[fig['id']] = fig

io.open('figs_lr_2.json', 'w', encoding='utf-8').write(json.dumps(FIGS, indent=1, ensure_ascii=False))
print('-> figs_lr_2.json')
