"""Figures C-F for unit 7: circulatory, tracheal, mouthparts, ommatidium.
Writes figs_2.json. Run from this directory."""
import json, io, math
from figlib import *

FIGS = {}


def edge_fn(ctrl, n=10):
    """Return (path_d, x_at_y) for a catmull edge that is monotone-ish in y."""
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


# ───────────────── C. blood circulatory system (520 x 352) ─────────────────
def fig_circulatory():
    W, H = 520, 352
    cx = 158                      # long view axis
    hx_l, hx_r = 146, 170         # heart walls
    top, bot = 72, 316            # heart tube
    nch = 13
    step = (bot - top) / nch
    E = []

    E.append(pause('p1', 'Step 1 — body outline, aorta and the dorsal heart'))
    body_ctrl = [(149, 62), (127, 70), (115, 96), (111, 130), (110, 180),
                 (111, 230), (116, 278), (131, 312), (158, 328)]
    body_d, wall_x = edge_fn(body_ctrl)
    E.append(stroke('body_l', body_d))
    E.append(mirror_el(E[-1], cx, suffix='') | {'id': 'body_r'})
    E.append(stroke('aorta_l', 'M 152 34 L 152 70'))
    E.append(stroke('aorta_r', 'M 164 34 L 164 70'))
    E.append(stroke('aorta_cap', 'M 152 34 Q 158 28 164 34'))
    E.append(stroke('heart_l', f'M {hx_l} {top} L {hx_l} {bot}'))
    E.append(stroke('heart_r', f'M {hx_r} {top} L {hx_r} {bot}'))
    E.append(stroke('heart_end', f'M {hx_l} {bot} Q {cx} {bot + 9} {hx_r} {bot}'))

    E.append(pause('p2', 'Step 2 — the 13 chambers and the pairs of ostia'))
    for part, ks in (('a', range(1, 7)), ('b', range(7, 13))):
        d = ' '.join(f'M {hx_l} {f(top + k*step)} L {hx_r} {f(top + k*step)}' for k in ks)
        E.append(stroke(f'chambers_{part}', d, w=1.6))
    ost = ' '.join(f'M {hx_l - 7} {f(top + k*step - 4)} L {hx_l} {f(top + k*step - 4)}'
                   for k in range(1, 13))
    E.append(stroke('ostia_l', ost, w=1.6))
    E.append(mirror_el(E[-1], cx, suffix='') | {'id': 'ostia_r'})

    E.append(pause('p3', 'Step 3 — alary muscles on both sides'))
    for part, ks in (('a', range(0, 11)), ('b', range(10, 21))):
        pts = []
        for k in ks:
            y = 98 + k * 9.6
            pts.append((wall_x(y) + 4, y) if k % 2 == 0 else (hx_l - 1, y))
        E.append(stroke(f'alary_l{part}', poly(pts), w=1.6))
        E.append(mirror_el(E[-1], cx, suffix='') | {'id': f'alary_r{part}'})

    E.append(pause('p4', 'Step 4 — cross section: body wall and the two diaphragms'))
    E.append(stroke('sec_wall', ellipse(310, 196, 54, 48)))
    E.append(stroke('dorsal_diaphragm', 'M 264 171 L 356 171', w=2.0))
    E.append(stroke('ventral_diaphragm', 'M 264 221 L 356 221', w=2.0))

    E.append(pause('p5', 'Step 5 — heart, gut and nerve cord in the section'))
    E.append(stroke('sec_heart', circle(310, 159, 7.5)))
    E.append(stroke('sec_gut', circle(310, 196, 14.5)))
    E.append(stroke('sec_cord', circle(310, 233, 5)))

    E.append(pause('p6', 'Step 6 — leader lines and labels'))
    left = [('aorta', 62, 'Anterior aorta', (150, 52)),
            ('chamber', 122, 'Heart chamber', (146, 128)),
            ('alary', 186, 'Alary muscles', (126, 187)),
            ('ostia', 246, 'Ostia', (139, 243))]
    for id_, y, text, tip in left:
        E.append(label('lbl_' + id_, 6, y, text))
        E.append(leader('ld_' + id_, 6 + label_w(text, sm=True) + 5, y - 4, tip[0], tip[1]))
    right = [('pericardial', 108, 'Pericardial sinus', (326, 154)),
             ('dorsaldia', 150, 'Dorsal diaphragm', (344, 171)),
             ('perivisceral', 192, 'Perivisceral sinus', (338, 196)),
             ('ventraldia', 234, 'Ventral diaphragm', (342, 221)),
             ('cord', 276, 'Ventral nerve cord', (316, 235)),
             ('perineural', 318, 'Perineural sinus', (288, 235))]
    for id_, y, text, tip in right:
        E.append(label('lbl_' + id_, 378, y, text))
        E.append(leader('ld_' + id_, 374, y - 4, tip[0], tip[1]))
    return {'id': 'pa_circulatory_system', 'width': W, 'height': H, 'elements': E}


# ───────────────── D. tracheal (respiratory) system (520 x 384) ─────────────────
def fig_tracheal():
    W, H, cx = 520, 384, 260
    E = []

    E.append(pause('p1', 'Step 1 — body outline and the head'))
    body_ctrl = [(240, 62), (222, 70), (216, 92), (212, 118), (210, 150),
                 (209, 190), (211, 230), (217, 268), (230, 298), (250, 313)]
    body_d, edge_x = edge_fn(body_ctrl)
    E.append(stroke('body_l', body_d))
    E.append(mirror_el(E[-1], cx, suffix='') | {'id': 'body_r'})
    E.append(stroke('head', ellipse(260, 46, 26, 17)))
    E.append(stroke('thorax_line', 'M 213 122 L 307 122', w=1.4))

    E.append(pause('p2', 'Step 2 — ten pairs of spiracles: 2 thoracic, 8 abdominal'))
    sp_y = [86, 110, 142, 164, 186, 208, 230, 252, 274, 294]
    sp = ' '.join(circle(edge_x(y), y, 3.5) for y in sp_y)
    E.append(stroke('spiracles_l', sp, w=1.6))
    E.append(mirror_el(E[-1], cx, suffix='') | {'id': 'spiracles_r'})

    E.append(pause('p3', 'Step 3 — atria and the three longitudinal trunks'))
    for name, x in (('lat', 224), ('dor', 236), ('ven', 248)):
        E.append(stroke(f'trunk_{name}_l', f'M {x} 100 L {x} 298', w=1.8))
        E.append(mirror_el(E[-1], cx, suffix='') | {'id': f'trunk_{name}_r'})
    conn = ' '.join(f'M {f(edge_x(y) + 3.5)} {y} L 224 {y}' for y in sp_y)
    E.append(stroke('connect_l', conn, w=1.4))
    E.append(mirror_el(E[-1], cx, suffix='') | {'id': 'connect_r'})

    E.append(pause('p4', 'Step 4 — cephalic trunks and commissural tracheae'))
    E.append(stroke('ceph_dor_l', 'M 236 100 C 234 82 244 68 252 60', w=1.8))
    E.append(mirror_el(E[-1], cx, suffix='') | {'id': 'ceph_dor_r'})
    E.append(stroke('ceph_ven_l', 'M 248 100 C 248 84 252 72 258 64', w=1.8))
    E.append(mirror_el(E[-1], cx, suffix='') | {'id': 'ceph_ven_r'})
    for i, y in enumerate((152, 214, 276)):
        E.append(stroke(f'commissure{i+1}', f'M 224 {y} L 296 {y}', w=1.4))

    E.append(pause('p5', 'Step 5 — a trachea ending in tracheoles'))
    E.append(stroke('trachea_top', 'M 150 336 L 246 336'))
    E.append(stroke('trachea_bot', 'M 150 350 L 246 350'))
    E.append(stroke('taenidia', ' '.join(f'M {x} 337 L {x} 349' for x in range(162, 243, 12)), w=1.2))
    E.append(stroke('tracheoblast', ellipse(258, 343, 13, 10)))
    tips = [(308, 318), (314, 330), (316, 343), (314, 356), (308, 368)]
    E.append(stroke('tracheoles', ' '.join(f'M 270 343 L {x} {y}' for x, y in tips), w=1.2))

    E.append(pause('p6', 'Step 6 — leader lines and labels'))
    left = [('venceph', 76, 'Ventral cephalic trunk', (254, 66)),
            ('thoracic', 120, 'Thoracic spiracles', (211, 110)),
            ('abdominal', 170, 'Abdominal spiracles', (209, 172)),
            ('atrium', 222, 'Atrium', (223, 208)),
            ('lattrunk', 272, 'Lateral longitudinal trunk', (224, 262)),
            ('trachea', 336, 'Trachea', (172, 340))]
    for id_, y, text, tip in left:
        E.append(label('lbl_' + id_, 6, y, text))
        E.append(leader('ld_' + id_, 6 + label_w(text, sm=True) + 5, y - 4, tip[0], tip[1]))
    right = [('dorceph', 76, 'Dorsal cephalic trunk', (268, 64)),
             ('dortrunk', 124, 'Dorsal longitudinal trunk', (284, 132)),
             ('ventrunk', 172, 'Ventral longitudinal trunk', (272, 166)),
             ('commissure', 220, 'Commissural trachea', (282, 214)),
             ('tracheole', 336, 'Tracheoles', (314, 332))]
    for id_, y, text, tip in right:
        x0 = 336 if id_ == 'tracheole' else 318
        E.append(label('lbl_' + id_, x0, y, text))
        E.append(leader('ld_' + id_, x0 - 4, y - 4, tip[0], tip[1]))
    return {'id': 'pa_tracheal_system', 'width': W, 'height': H, 'elements': E}


# ───────────────── E. mouthparts (520 x 384) ─────────────────
def fig_mouthparts():
    W, H, cx = 520, 384, 260
    E = []

    E.append(pause('p1', 'Step 1 — labrum and the pair of mandibles'))
    E.append(stroke('labrum', 'M 232 30 C 236 20 284 20 288 30 C 290 46 280 58 260 60 '
                              'C 240 58 230 46 232 30 Z'))
    E.append(stroke('mandible_l', 'M 226 70 C 204 68 192 82 194 96 C 196 110 210 118 226 112 '
                                  'L 220 104 L 226 96 L 220 88 L 226 80 Z'))
    E.append(mirror_el(E[-1], cx, suffix='') | {'id': 'mandible_r'})

    E.append(pause('p2', 'Step 2 — the hypopharynx in the middle'))
    E.append(stroke('hypopharynx', 'M 250 78 C 246 96 248 118 254 132 C 258 137 262 137 266 132 '
                                   'C 272 118 274 96 270 78 C 266 71 254 71 250 78 Z'))
    E.append(stroke('hypo_line', 'M 260 88 L 260 126', w=1.4))

    E.append(pause('p3', 'Step 3 — the pair of maxillae: cardo, stipes, galea, lacinia'))
    E.append(stroke('cardo_l', 'M 176 258 L 202 252 L 206 230 L 178 234 Z'))
    E.append(stroke('stipes_l', 'M 178 234 L 206 230 L 210 190 L 176 194 Z'))
    E.append(stroke('galea_l', ellipse(176, 152, 14, 34)))
    E.append(stroke('lacinia_l', ellipse(206, 154, 11, 32)))
    E.append(stroke('lacinia_teeth_l', 'M 200 126 L 197 116 M 210 127 L 213 117', w=1.4))
    for id_ in ['cardo_l', 'stipes_l', 'galea_l', 'lacinia_l', 'lacinia_teeth_l']:
        e = [x for x in E if x['id'] == id_][0]
        E.append(mirror_el(e, cx, suffix='') | {'id': id_[:-2] + '_r'})

    E.append(pause('p4', 'Step 4 — the jointed maxillary palps'))
    palp = [(174, 200), (154, 178), (138, 148), (130, 114), (132, 86), (138, 64)]
    pa, pb = tube(palp, 6, n=6)
    E.append(stroke('mxpalp_a_l', pa))
    E.append(stroke('mxpalp_b_l', pb))
    s = catmull(palp, 6)
    joints = []
    for t in (0.22, 0.42, 0.62, 0.82):
        i = int(t * (len(s) - 1))
        x0, y0 = s[max(i - 1, 0)]; x1, y1 = s[min(i + 1, len(s) - 1)]
        dx, dy = x1 - x0, y1 - y0
        m = math.hypot(dx, dy) or 1
        nx, ny = -dy / m, dx / m
        px, py = s[i]
        joints.append(f'M {f(px - nx*6)} {f(py - ny*6)} L {f(px + nx*6)} {f(py + ny*6)}')
    E.append(stroke('mxpalp_joints_l', ' '.join(joints), w=1.4))
    for id_ in ['mxpalp_a_l', 'mxpalp_b_l', 'mxpalp_joints_l']:
        e = [x for x in E if x['id'] == id_][0]
        E.append(mirror_el(e, cx, suffix='') | {'id': id_[:-2] + '_r'})

    E.append(pause('p5', 'Step 5 — the labium and its palps'))
    E.append(stroke('submentum', 'M 226 344 L 294 344 L 300 314 L 220 314 Z'))
    E.append(stroke('mentum', 'M 220 314 L 300 314 L 296 284 L 224 284 Z'))
    E.append(stroke('prementum', 'M 224 284 L 296 284 L 292 250 L 228 250 Z'))
    E.append(stroke('glossa_l', ellipse(250, 234, 8, 16)))
    E.append(mirror_el(E[-1], cx, suffix='') | {'id': 'glossa_r'})
    E.append(stroke('paraglossa_l', ellipse(228, 230, 10, 20)))
    E.append(mirror_el(E[-1], cx, suffix='') | {'id': 'paraglossa_r'})
    lp = [(226, 266), (208, 278), (194, 296), (186, 320)]
    la, lb = tube(lp, 5.5, n=6)
    E.append(stroke('lbpalp_a_l', la))
    E.append(stroke('lbpalp_b_l', lb))
    E.append(stroke('lbpalp_joints_l', 'M 208 272 L 216 282 M 196 288 L 204 300', w=1.4))
    for id_ in ['lbpalp_a_l', 'lbpalp_b_l', 'lbpalp_joints_l']:
        e = [x for x in E if x['id'] == id_][0]
        E.append(mirror_el(e, cx, suffix='') | {'id': id_[:-2] + '_r'})

    E.append(pause('p6', 'Step 6 — leader lines and labels'))
    left = [('mxpalp', 40, 'Maxillary palp', (137, 66)),
            ('lacinia', 96, 'Lacinia', (204, 124)),
            ('galea', 144, 'Galea', (164, 152)),
            ('stipes', 192, 'Stipes', (180, 206)),
            ('cardo', 236, 'Cardo', (182, 244)),
            ('lbpalp', 288, 'Labial palp', (194, 296)),
            ('submentum', 332, 'Submentum', (234, 332))]
    for id_, y, text, tip in left:
        E.append(label('lbl_' + id_, 6, y, text))
        E.append(leader('ld_' + id_, 6 + label_w(text, sm=True) + 5, y - 4, tip[0], tip[1]))
    right = [('labrum', 40, 'Labrum', (286, 34)),
             ('mandible', 88, 'Mandible', (300, 88)),
             ('hypopharynx', 136, 'Hypopharynx', (272, 116)),
             ('paraglossa', 184, 'Paraglossa', (300, 222)),
             ('glossa', 228, 'Glossa', (277, 232)),
             ('prementum', 272, 'Prementum', (294, 266)),
             ('mentum', 320, 'Mentum', (298, 300))]
    for id_, y, text, tip in right:
        E.append(label('lbl_' + id_, 400, y, text))
        E.append(leader('ld_' + id_, 396, y - 4, tip[0], tip[1]))
    return {'id': 'pa_mouthparts', 'width': W, 'height': H, 'elements': E}


# ───────────────── F. ommatidium L.S. (480 x 384) ─────────────────
def fig_ommatidium():
    W, H, cx = 480, 384, 240
    E = []

    E.append(pause('p1', 'Step 1 — the lens and the two corneagen cells'))
    E.append(stroke('lens_top', 'M 206 62 Q 240 32 274 62'))
    E.append(stroke('lens_bot', 'M 206 62 Q 240 80 274 62'))
    E.append(stroke('corneagen_l', 'M 210 74 L 236 72 L 236 93 L 208 93 Z'))
    E.append(mirror_el(E[-1], cx, suffix='') | {'id': 'corneagen_r'})

    E.append(pause('p2', 'Step 2 — the crystalline cone made of cone cells'))
    E.append(stroke('cone_l', 'M 210 96 L 228 152'))
    E.append(stroke('cone_r', 'M 270 96 L 252 152'))
    E.append(stroke('cone_top', 'M 210 96 L 270 96', w=1.6))
    E.append(stroke('cone_bot', 'M 228 152 L 252 152', w=1.6))
    E.append(stroke('cone_mid', 'M 240 96 L 240 152', w=1.4))

    E.append(pause('p3', 'Step 3 — the iris pigment sheath on both sides'))
    E.append(stroke('iris_out_l', 'M 186 80 L 200 156'))
    E.append(stroke('iris_in_l', 'M 200 80 L 214 156'))
    E.append(stroke('iris_dots_l', 'M 190 96 L 197 95 M 192 112 L 199 111 '
                                   'M 195 128 L 202 127 M 198 144 L 205 143', w=1.4))
    for id_ in ['iris_out_l', 'iris_in_l', 'iris_dots_l']:
        e = [x for x in E if x['id'] == id_][0]
        E.append(mirror_el(e, cx, suffix='') | {'id': id_[:-2] + '_r'})

    E.append(pause('p4', 'Step 4 — retinular cells around the rhabdom'))
    E.append(stroke('retin_wall_l', 'M 212 158 L 208 306'))
    E.append(mirror_el(E[-1], cx, suffix='') | {'id': 'retin_wall_r'})
    E.append(stroke('rhabdom_l', 'M 232 162 L 232 300'))
    E.append(stroke('rhabdom_r', 'M 248 162 L 248 300'))
    E.append(stroke('rhabdom_bars', ' '.join(f'M 232 {y} L 248 {y}' for y in range(176, 297, 20)), w=1.2))
    E.append(stroke('retin_nucleus_l', circle(220, 204, 6)))
    E.append(mirror_el(E[-1], cx, suffix='') | {'id': 'retin_nucleus_r'})

    E.append(pause('p5', 'Step 5 — pigment sheath, basement membrane, nerve fibres'))
    E.append(stroke('rpig_l', 'M 198 158 L 194 306'))
    E.append(mirror_el(E[-1], cx, suffix='') | {'id': 'rpig_r'})
    E.append(stroke('rpig_dots_l', 'M 200 178 L 208 178 M 199 210 L 207 210 '
                                   'M 198 242 L 206 242 M 197 274 L 205 274', w=1.4))
    E.append(mirror_el(E[-1], cx, suffix='') | {'id': 'rpig_dots_r'})
    E.append(stroke('basement', 'M 188 312 L 292 312', w=2.4))
    E.append(stroke('nerve', 'M 208 314 C 206 330 212 342 208 358 '
                             'M 226 314 C 224 330 230 342 226 358 '
                             'M 254 314 C 252 330 258 342 254 358 '
                             'M 272 314 C 270 330 276 342 272 358', w=1.4))

    E.append(pause('p6', 'Step 6 — leader lines and labels'))
    left = [('lens', 56, 'Lens (facet)', (218, 52)),
            ('corneagen', 104, 'Corneagen cell', (216, 84)),
            ('irispig', 156, 'Iris pigment sheath', (196, 120)),
            ('retinular', 214, 'Retinular cell', (220, 216)),
            ('rpigsheath', 266, 'Retinular pigment sheath', (200, 250)),
            ('basement', 322, 'Basement membrane', (200, 312)),
            ('nerve', 366, 'Nerve fibres', (210, 348))]
    for id_, y, text, tip in left:
        E.append(label('lbl_' + id_, 6, y, text))
        E.append(leader('ld_' + id_, 6 + label_w(text, sm=True) + 5, y - 4, tip[0], tip[1]))
    right = [('cone', 90, 'Crystalline cone', (262, 118)),
             ('conecell', 140, 'Cone cell', (250, 130)),
             ('rhabdom', 200, 'Rhabdom', (249, 200))]
    for id_, y, text, tip in right:
        E.append(label('lbl_' + id_, 302, y, text))
        E.append(leader('ld_' + id_, 298, y - 4, tip[0], tip[1]))
    return {'id': 'pa_ommatidium', 'width': W, 'height': H, 'elements': E}


for fn in (fig_circulatory, fig_tracheal, fig_mouthparts, fig_ommatidium):
    fg = fn()
    FIGS[fg['id']] = fg
    for b in check(fg['elements'], fg['width'], fg['height'], fg['id']):
        print('!!', b)
    drawn = len([e for e in fg['elements'] if e['type'] != 'pause'])
    phases = len([e for e in fg['elements'] if e['type'] == 'pause'])
    print(fg['id'], f'{drawn} drawn, {phases} phases')
io.open('figs_2.json', 'w', encoding='utf-8').write(json.dumps(FIGS, indent=1))
