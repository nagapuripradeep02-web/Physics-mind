# -*- coding: utf-8 -*-
"""Unit 9 figures — the five genetics crosses, all built from crosslib.

Vertical rhythm is fixed at 50-ish units per band because check() rejects any two
labels closer than 40 units when their x ranges overlap, and in a cross diagram almost
everything is centred on the same axis. The block headings the first draft carried
("P generation", "Selfing of F1") are dropped: the phase CAPTIONS already say exactly
that, and they were the labels colliding with the parent line."""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'zoology_wip'))
import figlib as F
from crosslib import centred, gamete, arrow, square

L, R = 150, 370
MID = (L + R) / 2
Y_PAR, Y_GAM, Y_F1, Y_SELF = 40, 92, 146, 196
Y_HEAD, Y_SQ = 246, 260
Y_R1, Y_R2 = 392, 432


def _parents(e, pfx, left, right, gl, gr):
    e.append(centred(f'{pfx}_pl', L, Y_PAR, left))
    e.append(centred(f'{pfx}_x', MID, Y_PAR, '×'))
    e.append(centred(f'{pfx}_pr', R, Y_PAR, right))
    e += arrow(f'{pfx}_al', L, Y_PAR + 10, L, Y_GAM - 20)
    e += arrow(f'{pfx}_ar', R, Y_PAR + 10, R, Y_GAM - 20)
    e += gamete(f'{pfx}_gl', L, Y_GAM, gl)
    e += gamete(f'{pfx}_gr', R, Y_GAM, gr)


def _f1(e, pfx, text):
    e += arrow(f'{pfx}_f1l', L + 22, Y_GAM + 12, MID - 26, Y_F1 - 22)
    e += arrow(f'{pfx}_f1r', R - 22, Y_GAM + 12, MID + 26, Y_F1 - 22)
    e.append(centred(f'{pfx}_f1', MID, Y_F1, text))


def _self(e, pfx, geno):
    e += arrow(f'{pfx}_sd', MID, Y_F1 + 10, MID, Y_SELF - 22)
    e.append(centred(f'{pfx}_sl', L, Y_SELF, geno))
    e.append(centred(f'{pfx}_sx', MID, Y_SELF, '×'))
    e.append(centred(f'{pfx}_sr', R, Y_SELF, geno))


def four_block(pfx, fid, width, parents, gametes, f1, geno, heads, cells, r1, r2,
               captions, cw=72):
    e = []
    e.append(F.pause(f'{pfx}_p1', captions[0]))
    _parents(e, pfx, parents[0], parents[1], gametes[0], gametes[1])
    e.append(F.pause(f'{pfx}_p2', captions[1]))
    _f1(e, pfx, f1)
    e.append(F.pause(f'{pfx}_p3', captions[2]))
    _self(e, pfx, geno)
    e.append(F.pause(f'{pfx}_p4', captions[3]))
    e += square(f'{pfx}_sq', round(width / 2 - cw), Y_SQ, cw, 44, heads, heads, cells)
    e.append(F.pause(f'{pfx}_p5', captions[4]))
    e.append(centred(f'{pfx}_r1', width / 2, Y_R1, r1))
    e.append(centred(f'{pfx}_r2', width / 2, Y_R2, r2))
    return {'id': fid, 'width': width, 'height': 448, 'elements': e}


MONOHYBRID = four_block(
    'mo', 'b2_piv_monohybrid_cross', 520,
    ('Tall (TT)', 'Dwarf (tt)'), ('T', 't'), 'F₁ — Tt, all Tall', 'Tt',
    ['T', 't'], ['TT', 'Tt', 'Tt', 'tt'],
    'Phenotypic ratio  3 Tall : 1 Dwarf', 'Genotypic ratio  1 : 2 : 1',
    ['Step 1 — the two parents and their gametes',
     'Step 2 — the F₁ plants, all tall',
     'Step 3 — self the F₁',
     'Step 4 — the Punnett square',
     'Step 5 — read the two ratios off the square'])

CODOMINANCE = four_block(
    'cd', 'b2_piv_codominance', 560,
    ('Spotted (CˢCˢ)', 'Dotted (CᴰCᴰ)'), ('Cˢ', 'Cᴰ'),
    'F₁ — CˢCᴰ, spotted AND dotted', 'CˢCᴰ',
    ['Cˢ', 'Cᴰ'], ['CˢCˢ', 'CˢCᴰ', 'CˢCᴰ', 'CᴰCᴰ'],
    '1 spotted : 2 spotted and dotted : 1 dotted',
    'Phenotypic ratio = genotypic ratio = 1 : 2 : 1',
    ['Step 1 — a spotted parent and a dotted parent',
     'Step 2 — the F₁ shows BOTH parent patterns',
     'Step 3 — self the F₁',
     'Step 4 — the Punnett square',
     'Step 5 — one spotted, two both, one dotted'], cw=84)

INCOMPLETE = four_block(
    'id', 'b2_piv_incomplete_dominance', 560,
    ('Red (RR)', 'White (rr)'), ('R', 'r'), 'F₁ — Rr, all PINK', 'Rr',
    ['R', 'r'], ['RR', 'Rr', 'Rr', 'rr'],
    '1 Red : 2 Pink : 1 White',
    'Phenotypic ratio = genotypic ratio = 1 : 2 : 1',
    ['Step 1 — a red parent and a white parent',
     'Step 2 — the F₁ is a NEW colour: pink',
     'Step 3 — self the F₁',
     'Step 4 — the Punnett square',
     'Step 5 — here the two ratios are the SAME'])

# ══════════════ TEST CROSS — the F1 has TWO kinds of gamete ═════════════════
t = []
t.append(F.pause('t_p1', 'Step 1 — the F₁ crossed with the recessive parent'))
t.append(centred('tc_pl', L, 40, 'Violet (Ww)'))
t.append(centred('tc_x', MID, 40, '×'))
t.append(centred('tc_pr', R, 40, 'white (ww)'))
t += arrow('tc_al1', L - 6, 50, L - 40, 74)
t += arrow('tc_al2', L + 6, 50, L + 40, 74)
t += arrow('tc_ar', R, 50, R, 74)
t += gamete('tc_g1', L - 40, 96, 'W')
t += gamete('tc_g2', L + 40, 96, 'w')
t += gamete('tc_g3', R, 96, 'w')
t.append(F.pause('t_p2', 'Step 2 — the square: the recessive parent gives one gamete only'))
t += square('tc_sq', 188, 164, 72, 44, ['W', 'w'], ['w'], ['Ww', 'ww'])
t.append(F.pause('t_p3', 'Step 3 — the progeny and the ratio'))
t += [
    centred('tc_o0', 224, 252, 'Violet'),
    centred('tc_o1', 296, 252, 'white'),
    centred('tc_r1', 260, 300, 'Phenotypic ratio  1 : 1'),
    centred('tc_r2', 260, 340, 'Genotypic ratio  1 : 1'),
]
TESTCROSS = {'id': 'b2_piv_test_cross', 'width': 520, 'height': 384, 'elements': t}

# ══════════════ GAMETE FORMATION ════════════════════════════════════════════
g = []
g.append(F.pause('g_p1', 'Step 1 — a heterozygote for ONE gene'))
g.append(centred('gm_p1', 260, 46, 'Tt — heterozygous plant'))
g += arrow('gm_a1', 236, 58, 200, 96)
g += arrow('gm_a2', 284, 58, 320, 96)
g += gamete('gm_g1', 200, 118, 'T')
g += gamete('gm_g2', 320, 118, 't')
g.append(centred('gm_c1', 260, 172, 'Two kinds of gamete, in equal numbers'))

g.append(F.pause('g_p2', 'Step 2 — a heterozygote for TWO genes'))
g.append(centred('gm_p2', 260, 230, 'YyRr — dihybrid'))
for n, (gx, tx) in enumerate([(110, 'YR'), (210, 'Yr'), (310, 'yR'), (410, 'yr')]):
    g += arrow(f'gm_b{n}', 260, 242, gx, 282)
    g += gamete(f'gm_h{n}', gx, 304, tx)
g.append(centred('gm_c2', 260, 358, 'Four kinds of gamete, in equal numbers'))
GAMETES = {'id': 'b2_piv_gamete_formation', 'width': 520, 'height': 384, 'elements': g}

FIGS = [('monohybrid', MONOHYBRID), ('testcross', TESTCROSS), ('codominance', CODOMINANCE),
        ('incomplete', INCOMPLETE), ('gametes', GAMETES)]

if __name__ == '__main__':
    for name, fig in FIGS:
        bad = F.check(fig['elements'], fig['width'], fig['height'], name)
        print('\n'.join(bad) if bad else '%s: clean (%d elements, %d phases)'
              % (name, len(fig['elements']), sum(1 for e in fig['elements'] if e['type'] == 'pause')))
