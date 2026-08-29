# -*- coding: utf-8 -*-
"""Unit 10 figures — the lac operon (a DRAW question: the figure carries the marks) and
the nucleosome."""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'zoology_wip'))
import figlib as F
from crosslib import centred, arrow

# ══════════════════════ 1. LAC OPERON ═══════════════════════════════════════
LW, LH = 620, 512
lo = []
BOX_W, BOX_H = 56, 26
GENES = ['i', 'p', 'o', 'z', 'y', 'a']
X0 = 40


def gene_map(pfx, y):
    """The six boxes of the operon, left to right, with the letter centred in each."""
    out = []
    for n, g in enumerate(GENES):
        x = X0 + n * BOX_W
        out += [F.stroke(f'{pfx}_b{n}_t', F.line(x, y, x + BOX_W, y), w=1.8),
                F.stroke(f'{pfx}_b{n}_b', F.line(x, y + BOX_H, x + BOX_W, y + BOX_H), w=1.8),
                F.stroke(f'{pfx}_b{n}_l', F.line(x, y, x, y + BOX_H), w=1.8)]
        out.append(centred(f'{pfx}_g{n}', x + BOX_W / 2, y + 18, g))
    out.append(F.stroke(f'{pfx}_b_end', F.line(X0 + 6 * BOX_W, y, X0 + 6 * BOX_W, y + BOX_H), w=1.8))
    return out


def cx(n):
    return X0 + n * BOX_W + BOX_W / 2


# ── PANEL A: no inducer, the repressor sits on the operator ──────────────────
lo.append(F.pause('lo_p1', 'Step 1 — the six genes of the operon, in order'))
lo.append(F.label('lo_ta', 40, 30, 'In the ABSENCE of inducer'))
lo += gene_map('la', 52)

lo.append(F.pause('lo_p2', 'Step 2 — what each letter stands for'))
lo += [
    F.label('lo_lg0', 410, 44, 'i = regulator gene'),
    F.label('lo_lg1', 410, 84, 'p = promoter'),
    F.label('lo_lg2', 410, 124, 'o = operator'),
    F.label('lo_lg3', 410, 164, 'z, y, a = structural'),
]

lo.append(F.pause('lo_p3', 'Step 3 — the regulator gene makes the repressor'))
lo += arrow('lo_a1', cx(0), 80, cx(0), 120)
lo.append(F.stroke('lo_rep_a', F.ellipse(cx(0), 138, 26, 13)))
lo.append(F.label('lo_lrep_a', 10, 172, 'Repressor'))

lo.append(F.pause('lo_p4', 'Step 4 — the repressor binds the operator and blocks it'))
lo.append(F.stroke('lo_bind', 'M 94 138 L 180 138 L 180 92', w=1.6))
lo.append(F.stroke('lo_bind_h', F.arrow_head(180, 92, 180, 130)))
lo.append(centred('lo_ca', 330, 206, 'Repressor blocks the operator'))

# ── PANEL B: inducer present, the repressor is inactivated ───────────────────
lo.append(F.pause('lo_p5', 'Step 5 — the same operon, with the inducer present'))
lo.append(F.label('lo_tb', 40, 252, 'In the PRESENCE of inducer'))
lo += gene_map('lb', 284)
lo += arrow('lo_b1', cx(0), 312, cx(0), 340)
lo.append(F.stroke('lo_rep_b', F.ellipse(cx(0), 356, 26, 13)))
lo.append(F.stroke('lo_ind', F.circle(104, 350, 9)))
lo.append(F.label('lo_lind', 140, 350, 'Inducer'))
lo.append(F.label('lo_linact', 10, 394, 'Inactive repressor'))

lo.append(F.pause('lo_p6', 'Step 6 — transcription runs, and three enzymes are made'))
lo.append(F.stroke('lo_lacmrna', 'M 208 340 C 232 330 256 350 280 340 C 304 330 328 350 352 340 '
                                 'C 364 335 372 338 380 340', w=1.8))
lo.append(F.label('lo_llac', 240, 366, 'lac mRNA'))
for n, (ey, txt) in enumerate([(360, 'β-galactosidase'), (400, 'permease'), (440, 'transacetylase')]):
    lo += arrow(f'lo_e{n}', 384, 342, 412, ey - 6)
    lo.append(F.label(f'lo_le{n}', 420, ey, txt))
lo.append(centred('lo_cb', 330, 498, 'Transcription runs: three enzymes made'))

LAC_OPERON = {'id': 'b2_mbi_lac_operon', 'width': LW, 'height': LH, 'elements': lo}

# ══════════════════════ 2. NUCLEOSOME ═══════════════════════════════════════
NW, NH = 520, 320
nu = []
OX, OY, ORD = 250, 164, 56

nu.append(F.pause('nu_p1', 'Step 1 — the histone octamer, a ball of eight proteins'))
nu.append(F.stroke('nu_oct', F.circle(250, 170, 52)))

nu.append(F.pause('nu_p2', 'Step 2 — the DNA wound almost twice around it'))
nu.append(F.stroke('nu_wrap1', 'M 198 208 A 68 68 0 1 1 302 208'))
nu.append(F.stroke('nu_wrap2', 'M 186 194 A 78 78 0 0 1 250 92'))

nu.append(F.pause('nu_p3', 'Step 3 — the linker DNA running on to the next bead'))
nu.append(F.stroke('nu_link_l', 'M 186 194 C 160 216 132 232 104 244', w=1.8))
nu.append(F.stroke('nu_link_r', 'M 302 208 C 328 224 352 236 380 246', w=1.8))

nu.append(F.pause('nu_p4', 'Step 4 — the H1 histone where the DNA enters and leaves'))
nu.append(F.stroke('nu_h1', F.ellipse(250, 222, 20, 9)))

nu.append(F.pause('nu_p5', 'Step 5 — leader lines and labels'))
nu += [
    F.leader('nl_dna', 136, 120, 198, 124),
    F.leader('nl_oct', 326, 142, 292, 158),
    F.leader('nl_bp', 326, 198, 308, 197),
    F.leader('nl_h1', 292, 252, 270, 226),
    F.leader('nl_link', 108, 256, 126, 240),
    F.label('nb_dna', 96, 116, 'DNA'),
    F.label('nb_oct', 330, 140, 'Histone octamer'),
    F.label('nb_bp', 330, 196, '146 bp of DNA'),
    F.label('nb_h1', 296, 256, 'H1 histone'),
    F.label('nb_link', 24, 262, 'Linker DNA'),
]
NUCLEOSOME = {'id': 'b2_mbi_nucleosome', 'width': NW, 'height': NH, 'elements': nu}

if __name__ == '__main__':
    for name, fig in (('lac_operon', LAC_OPERON), ('nucleosome', NUCLEOSOME)):
        bad = F.check(fig['elements'], fig['width'], fig['height'], name)
        print('\n'.join(bad) if bad else '%s: clean (%d elements, %d phases)'
              % (name, len(fig['elements']), sum(1 for e in fig['elements'] if e['type'] == 'pause')))
