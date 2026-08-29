# -*- coding: utf-8 -*-
"""Unit 11 figure — the steps of recombinant DNA technology, drawn as the book draws it:
two starting materials, cut with the same enzyme, joined, and put into a host."""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'zoology_wip'))
import figlib as F
from crosslib import centred, arrow

W, H = 560, 512
e = []
XL, XR, XM = 110, 440, 280

# Every caption here is centred on XM while the flow arrows run down XL, XR and XM, so a
# first draft had all three captions struck through by their own arrows. The lanes are now
# pushed OUT to 110 and 440 and the captions shortened, so no arrow crosses any text —
# check() cannot see this, only a render can.

e.append(F.pause('r_p1', 'Step 1 — the vector and the source DNA'))
e.append(F.stroke('rd_plasmid', F.circle(XL, 96, 28)))
e.append(F.stroke('rd_dna_t', F.line(384, 88, 496, 88), w=1.8))
e.append(F.stroke('rd_dna_b', F.line(384, 104, 496, 104), w=1.8))
for i, x in enumerate(range(396, 496, 18)):
    e.append(F.stroke(f'rd_rung{i}', F.line(x, 88, x, 104), w=1.4))
e.append(centred('rd_lp', XL, 44, 'Plasmid (vector)'))
e.append(centred('rd_ld', XR, 44, 'Foreign DNA'))

e.append(F.pause('r_p2', 'Step 2 — cut BOTH with the same restriction enzyme'))
e.append(centred('rd_c1', XM, 148, 'Cut with the SAME enzyme'))
e += arrow('rd_a1', XL, 126, XL, 172)
e += arrow('rd_a2', XR, 112, XR, 172)
# the opened plasmid: a circle with a gap on its right, so the sticky ends show
e.append(F.stroke('rd_open', 'M 126 186 A 28 28 0 1 0 126 222'))
for i, x in enumerate((392, 440, 488)):
    e.append(F.stroke(f'rd_fr{i}_t', F.line(x - 18, 196, x + 18, 196), w=1.8))
    e.append(F.stroke(f'rd_fr{i}_b', F.line(x - 18, 208, x + 18, 208), w=1.8))

e.append(F.pause('r_p3', 'Step 3 — DNA ligase joins the gene into the vector'))
e.append(centred('rd_c2', XM, 250, 'DNA ligase joins them'))
e += arrow('rd_a3', 130, 236, 244, 288)
e += arrow('rd_a4', 432, 224, 316, 288)
# the recombinant circle is drawn as TWO arcs: the vector stretch at normal weight and
# the inserted gene heavy, so the insert is visible as an insert.
e.append(F.stroke('rd_rdna', 'M 280 274 A 30 30 0 1 1 254 318'))
e.append(F.stroke('rd_insert', 'M 254 318 A 30 30 0 0 1 280 274', w=5))
e.append(centred('rd_lr', XM, 366, 'Recombinant DNA'))

e.append(F.pause('r_p4', 'Step 4 — transformation, and the host copies the gene'))
e.append(F.label('rd_c3', 320, 406, 'Transformation'))
e += arrow('rd_a5', XM, 372, XM, 418)
e.append(F.stroke('rd_cell', 'M 238 432 L 322 432 C 344 432 344 470 322 470 '
                             'L 238 470 C 216 470 216 432 238 432'))
for i, cxx in enumerate((252, 272, 292, 312)):
    e.append(F.stroke(f'rd_copy{i}', F.circle(cxx, 451, 5), w=1.4))
e.append(centred('rd_lh', XM, 500, 'The host multiplies, copying the gene'))

RDNA = {'id': 'b2_bpp_rdna_steps', 'width': W, 'height': H, 'elements': e}

if __name__ == '__main__':
    bad = F.check(e, W, H, 'rdna')
    print('\n'.join(bad) if bad else 'rdna: clean (%d elements, %d phases)'
          % (len(e), sum(1 for x in e if x['type'] == 'pause')))
