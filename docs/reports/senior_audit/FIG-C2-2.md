# FIG-C2-2 — Chemistry-II figure review (pngs.txt lines 18–34)

Reviewer pass over 17 rendered figures. Every card JSON was read for `question_text`, the `diagram`
step's `figure.elements`, `why`, `common_mistakes` and `memory_tip`, and the path/label coordinates
were checked against the rendered PNG.

| png | question_id | step_id | verdict | what is wrong | what it should show |
|---|---|---|---|---|---|
| fig_25 | ts_ipe_c2_ss_bragg_equation | s2_diagram | OK | Nothing substantive. Geometry verified numerically: both rays are parallel on the way in (slope 0.700 vs 0.702) and on the way out; C(187,177) and D(253,177) both lie exactly on ray 2; AC is perpendicular to the incident ray 2 and AD to the reflected ray 2 (dot products 0.0 and 0.1 px). C and D sit BETWEEN the planes, not on them, which is what `common_mistakes` demands. Only nit: the theta glyph sits directly on the incident ray so the stroke crosses it, and it is crowded against the bold A — still readable. | — |
| fig_26 | ts_ipe_c2_ss_formula_pq_body_centred | s2_diagram | OK | Nothing. Eight corner dots present (the "only four corners" trap avoided); the P dot at (145,132) is the exact geometric centre of the drawn cube (mean of x 60 to 230, y 55 to 210 = 145, 132.5), i.e. a true body centre and not a face centre. Legend text carries the Q assignment. | — |
| fig_27 | ts_ipe_c2_ss_frenkel_defect | s3_diagram | OK | Nothing. Lattice alternates correctly (row0 `+ − +`, row1 `− [box] −`, row2 `+ − +`), so the vacated col-1/row-1 site is a CATION site and the displaced ion is correctly drawn as `+`. The displaced `+` at (152,96) sits in the diagonal gap between four sites, not on a site — exactly the distinction `common_mistakes` names. Exactly ONE vacancy (not two), which is what separates it from Schottky. Both leader arrows land on their targets. | — |
| fig_28 | ts_ipe_c2_ss_schottky_defect | s3_diagram | OK | Nothing. Charge parity checks out in both directions: column 0 reads `+ − +` downward and row 2 reads `+ − +` across, so the empty square at row0/col1 is genuinely an ANION site and the one at row1/col1 a CATION site — the two leader labels are therefore correct. Two vacancies, equal and opposite; no interstitial ion (the Frenkel confusion avoided). | — |
| fig_29 | ts_ipe_c2_va_h3po3_diprotic_h3po2_monoprotic | s3_diagram | OK | Nothing. Left: H–P(=O)(OH)–OH — one P–H, one P=O, two P–OH, so diprotic. Right: H–P(=O)(OH)–H — two P–H, one P=O, one P–OH, so monoprotic. Both P=O double bonds are drawn (the omission trap in `common_mistakes` avoided) and no hydrogen is wrongly placed on the doubly bonded oxygen. Captions match the drawn O–H count. | — |
| fig_3 | ts_ipe_c2_bio_saq_structure_of_glucose | s5_figure_cyclic | OK | Nothing. Fischer cyclic form reads C1 H/OH(right), C2 H/OH(right), C3 HO(left)/H, C4 H/OH(right), C5 H/ring-O, C6 CH2OH. Anomeric OH on the right = alpha, matching the caption "alpha-D-glucose". The bracket closes C1 to O to C5 (a six-membered pyranose), not C1 to C6, which is the exact error `common_mistakes` warns about, and C1 no longer carries a –CHO. Ring oxygen is labelled. | — |
| fig_30 | ts_ipe_c2_va_nitrogen_diatomic_phosphorus_p4 | s3_diagram | OK | Nothing. N≡N drawn with three lines (bond order 3). P4 drawn as a triangle with the fourth P inside joined to all three corners by dashed receding bonds: 3 solid + 3 dashed = six P–P bonds, matching the caption; four P labels present. Not a square, so the `common_mistakes` trap is avoided. The inner P at (388,146) lies inside the triangle whose centroid is (387,157). | — |
| fig_31 | ts_ipe_c2_via_sf4_sf6_structures | s2_sf4_figure | OK | Correct shape class: see-saw, not tetrahedral and not T-shape, with the lone pair in an EQUATORIAL position (left) and both axial bonds leaning away from it — the point of the step. Two nits, neither a chemistry error: (a) the drawn axial F–S–F angle is about 147° (computed from the two path vectors) where SF4 is about 173°, so the lean is exaggerated well beyond the textbook sketch; (b) the lone-pair diamonds sit about 42 px from S, roughly a full bond length away, so they read as slightly detached from the sulphur. | Axial pair drawn nearly linear with only a small bend away from the lone pair; lone-pair dots tucked against the S. |
| fig_32 | ts_ipe_c2_via_sf4_sf6_structures | s4_sf6_figure | OK | Six S–F bonds present, one dashed (receding) and one plain front bond, so the sketch is three-dimensional and not a flat hexagon — both `common_mistakes` traps avoided. The `90°` label sits in the correct quadrant between the up bond and the left bond. One text-vs-figure mismatch worth noting: `memory_tip` says "A plus sign for the four planar bonds, then one bond up and one down", but in the drawing the plus sign IS the up/down/left/right set and the two extra bonds are front (solid, down-left) and back (dashed, up-right) — a student following the tip literally would draw a different arrangement. | The tip should read "then one bond toward you and one away", matching the wedge/dash pair actually drawn. |
| fig_33 | ts_ipe_c2_viia_oxoacids_of_chlorine | s3_figure_1 | OK | Nothing. HOCl drawn bent at O (H–O–Cl, not a straight three-atom line). HClO2 drawn HO–Cl=O, angular at Cl, with the Cl=O rendered as two parallel lines — the "single line for the Cl–O bond" trap avoided. Captions match the drawings. | — |
| fig_34 | ts_ipe_c2_viia_oxoacids_of_chlorine | s5_figure_2 | WRONG-LABEL | The step's own `why` tells the reader to see "two [oxygens] for HClO3 **with a lone pair in the fourth position**, three for HClO4 with none" — but the HClO3 drawing contains NO lone-pair element. There are only three things around Cl (two `=O`, one `–OH`) and nothing in the fourth position, so the feature the card names as the distinguishing one is absent from the page, and the caption "pyramidal" is left unsupported: as drawn, the three bonds fan out symmetrically and read as trigonal planar. The atom counts themselves are correct (HClO3 = 3 O with one –OH; HClO4 = 4 O with three Cl=O and one –OH). | A pair of lone-pair dots on Cl in the fourth position of the HClO3 structure (opposite the OH, behind the Cl), so both the "pyramidal" caption and the `why` sentence have something on the page to point at. |
| fig_4 | ts_ipe_c2_bio_saq_zwitter_ion | s3_figure | OK | Nothing. Three forms stacked in one column: H3N+–CHR–COOH (cation), H3N+–CHR–COO− (zwitterion, both charges present and net neutral), H2N–CHR–COO− (anion). The up arrow is labelled "add H+" and the down arrow "add OH−", so the two arrows point in opposite directions as `common_mistakes` requires. All three captions sit level with the species they name. | — |
| fig_5 | ts_ipe_c2_cel_drug_structures | s2_serotonin | OK | Nothing. Correct indole skeleton (benzene fused to a five-membered N ring) with the N–H drawn. Positions verified by walking the ring: the fused edge is (140,85)–(140,125), so the OH-bearing vertex (70,85) is C5 and the side-chain vertex (178,73) is C3 — i.e. 5-hydroxytryptamine, matching the caption. The CH2CH2NH2 is on the five-membered ring, not the benzene, avoiding the named mistake. Kekule pattern valid (C3a=C4, C5=C6, C7=C7a, C2=C3). | — |
| fig_6 | ts_ipe_c2_cel_drug_structures | s3_bithionol | OK | Nothing. Both rings are phenols with the S bridge on the carbon ADJACENT to the OH (position 2) and the two Cl atoms at positions 4 and 6, checked vertex by vertex on both rings — i.e. 2,2'-thiobis(4,6-dichlorophenol). The bridge atom is labelled S, not O. Two OH labels and four Cl labels are all present and all attached to a ring vertex. Kekule pattern valid on both rings. | — |
| fig_7 | ts_ipe_c2_cel_drug_structures | s4_chloramphenicol | OK | Nothing. The O2N group is on ring vertex (72,110) and the chain leaves from (148,110) — opposite corners, so genuinely para. The chain reads Ar–CH(OH)–CH(NHCOCHCl2)–CH2OH: OH on the first carbon, the dichloroacetamide on the middle carbon, CH2OH last — the correct chloramphenicol connectivity. The amide is written with TWO chlorines, avoiding the named NHCOCH2Cl error. | — |
| fig_8 | ts_ipe_c2_cel_drug_structures | s5_saccharin | OK | Nothing. Benzene fused to the five-membered ring; going round it the order is C(=O), then NH, then SO2, with both the carbonyl carbon and the sulphur attached to the benzene and the NH between them — i.e. the NH is not next to the benzene, which is the named mistake. Three oxygens in all: one C=O and two S=O, every one drawn as a double bond. | — |
| fig_9 | ts_ipe_c2_ck_activation_energy | s3_endothermic_profile | OK | Nothing. Genuinely endothermic: the product level (y=110) sits ABOVE the reactant level (y=165; larger y is lower on canvas) and the transition-state peak (y=55) is above both. The Ea double-headed arrow runs from the ER level up to the ET level, NOT from the x-axis baseline — exactly the error `common_mistakes` names. Axes labelled "Potential energy" and "Reaction coordinate". Only nit: the `ER` label butts up against the y-axis, which just grazes the R. | — |

## Clean figures

- fig_25_ts_ipe_c2_ss_bragg_equation.png
- fig_26_ts_ipe_c2_ss_formula_pq_body_centred.png
- fig_27_ts_ipe_c2_ss_frenkel_defect.png
- fig_28_ts_ipe_c2_ss_schottky_defect.png
- fig_29_ts_ipe_c2_va_h3po3_diprotic_h3po2_monoprotic.png
- fig_3_ts_ipe_c2_bio_saq_structure_of_glucose.png
- fig_30_ts_ipe_c2_va_nitrogen_diatomic_phosphorus_p4.png
- fig_31_ts_ipe_c2_via_sf4_sf6_structures.png (clean; see the exaggerated axial-angle note)
- fig_32_ts_ipe_c2_via_sf4_sf6_structures.png (clean; the mismatch is in `memory_tip` wording, not the drawing)
- fig_33_ts_ipe_c2_viia_oxoacids_of_chlorine.png
- fig_4_ts_ipe_c2_bio_saq_zwitter_ion.png
- fig_5_ts_ipe_c2_cel_drug_structures.png
- fig_6_ts_ipe_c2_cel_drug_structures.png
- fig_7_ts_ipe_c2_cel_drug_structures.png
- fig_8_ts_ipe_c2_cel_drug_structures.png
- fig_9_ts_ipe_c2_ck_activation_energy.png

Not clean: **fig_34_ts_ipe_c2_viia_oxoacids_of_chlorine.png** — WRONG-LABEL, missing lone pair on HClO3.

## Counts

| verdict | count |
|---|---|
| OK | 16 |
| WRONG-CHEMISTRY | 0 |
| WRONG-LABEL | 1 |
| CLIPPED | 0 |
| UNCLEAR | 0 |
