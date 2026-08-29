# -*- coding: utf-8 -*-
"""Unit 13 figure — the plant tissue culture flow chart. Boxes are sized from the
MEASURED width of the words in them, so no box can ever be narrower than its own text."""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'zoology_wip'))
import figlib as F
from crosslib import centred, arrow, box

W, H = 560, 576
e = []
XM = 280

CHAIN = [
    (32,  '1. Prepare the nutrient medium'),
    (92,  '2. Sterilise it in an autoclave'),
    (152, '3. Take the explant from a plant'),
    (212, '4. Inoculate, under sterile air'),
    (272, '5. Incubate 3-4 weeks: CALLUS forms'),
    (332, 'Add auxins and cytokinins'),
]

e.append(F.pause('tc_p1', 'Step 1 — medium, explant, inoculation, callus'))
prev_bottom = None
for n, (y, text) in enumerate(CHAIN):
    els, _ = box(f'tc_b{n}', XM, y, text)
    e += els
    if prev_bottom is not None:
        e += arrow(f'tc_a{n}', XM, prev_bottom, XM, y - 2)
    prev_bottom = y + 36
    if n == 3:
        e.append(F.pause('tc_p2', 'Step 2 — incubate: the callus forms'))

e.append(F.pause('tc_p3', 'Step 3 — the callus takes one of two paths'))
els_l, wl = box('tc_org', 148, 396, 'Organogenesis')
els_r, wr = box('tc_emb', 412, 396, 'Somatic embryos')
e += els_l + els_r
e += arrow('tc_al', 250, 368, 168, 394)
e += arrow('tc_ar', 310, 368, 392, 394)
e.append(centred('tc_note', XM, 460, 'roots and shoots, or embryoids'))

e.append(F.pause('tc_p4', 'Step 4 — both paths give plantlets, then a field crop'))
els_p, _ = box('tc_pl', XM, 486, 'Plantlets')
e += els_p
e += arrow('tc_ml', 168, 466, 248, 488)
e += arrow('tc_mr', 392, 466, 312, 488)
els_f, _ = box('tc_fld', XM, 538, '6. Harden off, then to the field')
e += els_f
e += arrow('tc_af', XM, 522, XM, 536)

TISSUE_CULTURE = {'id': 'b2_sef_tissue_culture', 'width': W, 'height': H, 'elements': e}

if __name__ == '__main__':
    bad = F.check(e, W, H, 'tissue_culture')
    print('\n'.join(bad) if bad else 'tissue_culture: clean (%d elements, %d phases)'
          % (len(e), sum(1 for x in e if x['type'] == 'pause')))
