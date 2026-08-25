"""Figures A (alimentary canal) and B (salivary apparatus). Writes figs_1.json."""
import json, io, math
from figlib import *

FIGS = {}

# ───────────────────────── A. alimentary canal (520 x 384), canal axis x = 260 ─────────────────
def fig_alimentary():
    W, H, cx = 520, 384, 260
    E = []
    E.append(pause('p1', 'Step 1 — foregut: pharynx, oesophagus and crop'))
    E.append(stroke('mouth', 'M 250 27 Q 260 21 270 27'))
    E.append(stroke('pharynx_l', 'M 250 27 L 251 48 L 254 53 L 254 100'))
    E.append(stroke('pharynx_r', 'M 270 27 L 269 48 L 266 53 L 266 100'))
    E.append(stroke('crop_l', 'M 254 100 C 226 118 216 172 240 200'))
    E.append(stroke('crop_r', 'M 266 100 C 294 118 304 172 280 200'))

    E.append(pause('p2', 'Step 2 — gizzard and midgut with hepatic caecae'))
    E.append(stroke('gizzard_l', 'M 240 200 C 231 210 232 229 250 236'))
    E.append(stroke('gizzard_r', 'M 280 200 C 289 210 288 229 270 236'))
    E.append(stroke('gizzard_teeth', 'M 253 207 L 252 228 M 260 205 L 260 229 M 267 207 L 268 228', w=1.4))
    E.append(stroke('midgut_l', 'M 250 236 L 252 300'))
    E.append(stroke('midgut_r', 'M 270 236 L 268 300'))
    # hepatic caecae: 3 fingers per side, from the top of the midgut
    fingers = [((252, 242), (224, 226)), ((252, 247), (218, 244)), ((252, 252), (224, 262))]
    for i, (b, t) in enumerate(fingers):
        bx, by = b; tx, ty = t
        ux, uy = tx - bx, ty - by; m = math.hypot(ux, uy); nx, ny = -uy/m, ux/m
        mx, my = (bx+tx)/2, (by+ty)/2
        d = (f"M {f(bx-3*nx)} {f(by-3*ny)} Q {f(mx-4.5*nx)} {f(my-4.5*ny)} {f(tx)} {f(ty)} "
             f"Q {f(mx+4.5*nx)} {f(my+4.5*ny)} {f(bx+3*nx)} {f(by+3*ny)}")
        E.append(stroke(f'caecum_l{i+1}', d))
    for i in range(3):
        E.append(mirror_el(E[-3+i] if False else [e for e in E if e['id'] == f'caecum_l{i+1}'][0], cx, suffix='')
                 | {'id': f'caecum_r{i+1}'})

    E.append(pause('p3', 'Step 3 — Malpighian tubules and the hindgut'))
    tub_l = ('M 252 300 Q 238 296 232 284 Q 228 274 218 272 '
             'M 252 300 Q 236 302 226 296 Q 216 290 208 292 '
             'M 252 301 Q 242 310 236 318 Q 230 326 220 324')
    E.append(stroke('malpighian_l', tub_l, w=1.3))
    E.append(stroke('malpighian_r', mirror(tub_l, cx), w=1.3))
    E.append(stroke('ileum_l', 'M 252 300 C 249 306 249 316 251 322'))
    E.append(stroke('ileum_r', 'M 268 300 C 271 306 271 316 269 322'))
    colon_ctrl = [(260, 322), (254, 334), (244, 344), (238, 356), (250, 364), (270, 362), (290, 354), (312, 348)]
    cl, cr = tube(colon_ctrl, 9, n=6)
    E.append(stroke('colon_a', cl))
    E.append(stroke('colon_b', cr))
    E.append(stroke('rectum_top', 'M 312 337 L 364 332'))
    E.append(stroke('rectum_bot', 'M 312 359 L 364 354'))
    E.append(stroke('anus', 'M 364 332 Q 373 343 364 354'))

    E.append(pause('p4', 'Step 4 — salivary glands and reservoirs beside the crop'))
    lobe1 = scallop(183, 124, 15, 12, n=8)
    lobe2 = scallop(172, 148, 13, 10, n=8, phase=0.4)
    E.append(stroke('sal_lobe1_l', lobe1))
    E.append(stroke('sal_lobe2_l', lobe2))
    E.append(stroke('sal_res_l', ellipse(205, 172, 8, 17)))
    E.append(stroke('sal_duct_l', 'M 197 126 C 214 118 236 96 253 74', w=1.3))
    E.append(stroke('sal_duct2_l', 'M 184 146 C 192 138 200 132 208 126', w=1.3))
    E.append(stroke('sal_resduct_l', 'M 207 155 C 216 136 232 108 253 82', w=1.3))
    for id_ in ['sal_lobe1_l', 'sal_lobe2_l', 'sal_res_l', 'sal_duct_l', 'sal_duct2_l', 'sal_resduct_l']:
        e = [x for x in E if x['id'] == id_][0]
        E.append(mirror_el(e, cx, suffix='') | {'id': id_[:-2] + '_r'})

    E.append(pause('p5', 'Step 5 — leader lines and labels'))
    left = [('oesophagus', 74, 'Oesophagus', (252, 76)),
            ('salivary_gland', 116, 'Salivary gland', (168, 122)),
            ('salivary_reservoir', 160, 'Salivary reservoir', (197, 172)),
            ('crop', 202, 'Crop', (236, 188)),
            ('gizzard', 242, 'Gizzard', (233, 214)),
            ('hepatic_caecae', 282, 'Hepatic caecae', (222, 254)),
            ('colon', 336, 'Colon', (240, 350))]
    for id_, y, text, (tx, ty) in left:
        E.append(label('lbl_' + id_, 8, y, text))
        x1 = 8 + 6.8 * len(text) + 4
        E.append(leader('ld_' + id_, x1, y - 4, tx, ty))
    right = [('mesenteron', 252, 'Mesenteron', (269, 282)),
             ('malpighian', 292, 'Malpighian tubules', (298, 288)),
             ('ileum', 332, 'Ileum', (271, 312))]
    for id_, y, text, (tx, ty) in right:
        E.append(label('lbl_' + id_, 372, y, text))
        E.append(leader('ld_' + id_, 368, y - 4, tx, ty))
    E.append(label('lbl_rectum', 386, 378, 'Rectum'))
    E.append(leader('ld_rectum', 384, 372, 368, 352))
    return {'id': 'pa_alimentary_canal', 'width': W, 'height': H, 'elements': E}

# ───────────────────────── B. salivary apparatus (520 x 320), axis x = 260 ─────────────────────
def fig_salivary():
    W, H, cx = 520, 320, 260
    E = []
    E.append(pause('p1', 'Step 1 — hypopharynx and the efferent salivary duct'))
    E.append(stroke('hypopharynx', 'M 250 24 C 254 16 266 16 270 24 L 273 58 C 274 70 266 76 260 78 C 254 76 246 70 247 58 Z'))
    E.append(stroke('hypo_line', 'M 260 34 L 260 66', w=1.4))
    E.append(stroke('efferent_l', 'M 256 78 L 256 116'))
    E.append(stroke('efferent_r', 'M 264 78 L 264 116'))

    E.append(pause('p2', 'Step 2 — median duct, receptacular duct and their branches'))
    E.append(stroke('median_l', 'M 256 116 L 256 178'))
    E.append(stroke('median_r', 'M 264 116 L 264 178'))
    E.append(stroke('comrecept_a', 'M 264 106 C 276 116 286 128 294 140'))
    E.append(stroke('comrecept_b', 'M 264 118 C 274 126 282 136 288 148'))
    E.append(stroke('recept_duct_r', 'M 291 145 C 306 156 322 170 336 184', w=2.6))
    E.append(stroke('recept_duct_l', 'M 291 145 C 270 160 236 150 214 160 C 200 166 190 176 184 184', w=2.6))
    E.append(stroke('comsal_l', 'M 256 178 C 236 200 200 226 142 246', w=2.6))
    E.append(stroke('comsal_r', mirror('M 256 178 C 236 200 200 226 142 246', cx), w=2.6))

    E.append(pause('p3', 'Step 3 — the two salivary receptacles'))
    E.append(stroke('receptacle_l', ellipse(166, 196, 32, 12)))
    E.append(stroke('receptacle_r', ellipse(354, 196, 32, 12)))

    E.append(pause('p4', 'Step 4 — salivary gland lobes on each side'))
    lobeA = scallop(108, 246, 32, 14, n=12, phase=0.2)
    lobeB = scallop(150, 274, 30, 13, n=12, phase=0.5)
    E.append(stroke('lobeA_l', lobeA))
    E.append(stroke('lobeA_rib_l', 'M 80 246 L 138 246', w=1.3))
    E.append(stroke('lobeB_l', lobeB))
    E.append(stroke('lobeB_rib_l', 'M 124 274 L 178 274', w=1.3))
    E.append(stroke('lobe_join_l', 'M 142 246 C 150 254 156 262 160 272', w=1.3))
    for id_ in ['lobeA_l', 'lobeA_rib_l', 'lobeB_l', 'lobeB_rib_l', 'lobe_join_l']:
        e = [x for x in E if x['id'] == id_][0]
        E.append(mirror_el(e, cx, suffix='') | {'id': id_[:-2] + '_r'})

    E.append(pause('p5', 'Step 5 — leader lines and labels'))
    labs = [('hypopharynx', 300, 36, 'Hypopharynx', (296, 32), (274, 36)),
            ('efferent', 300, 96, 'Efferent salivary duct', (296, 92), (265, 96)),
            ('comrecept', 312, 136, 'Common receptacular duct', (308, 132), (290, 133)),
            ('median', 8, 110, 'Median salivary duct', (146, 106), (255, 150)),
            ('receptduct', 8, 150, 'Receptacular duct', (124, 146), (216, 159)),
            ('receptacle', 8, 190, 'Receptacle', (78, 186), (136, 194)),
            ('comsal', 8, 232, 'Common salivary duct', (146, 228), (198, 225)),
            ('lobe', 176, 312, 'Lobe of salivary gland', (176, 306), (160, 287))]
    for id_, x, y, text, (x1, y1), (x2, y2) in labs:
        E.append(label('lbl_' + id_, x, y, text))
        E.append(leader('ld_' + id_, x1, y1, x2, y2))
    return {'id': 'pa_salivary_apparatus', 'width': W, 'height': H, 'elements': E}

for fn in (fig_alimentary, fig_salivary):
    fg = fn()
    FIGS[fg['id']] = fg
    for b in check(fg['elements'], fg['width'], fg['height'], fg['id']):
        print('!!', b)
    print(fg['id'], len(fg['elements']), 'elements')
io.open('figs_1.json', 'w', encoding='utf-8').write(json.dumps(FIGS, indent=1))
