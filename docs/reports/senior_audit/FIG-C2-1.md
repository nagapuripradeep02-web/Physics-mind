# FIG-C2-1 — Chemistry-II figure review (pngs.txt lines 1–17)

Reviewer share: the 17 lexically-sorted PNGs `fig_1`, `fig_10`–`fig_24`, `fig_2`, `fig_20`
(16 distinct cards; `ng_structures_of_xef6_and_xeof4` contributes two diagram steps).
Rendered PNGs: `…\scratchpad\figs\ts_ipe_c2\`. Cards: `C:\Tutor\physics-mind\answer-book\questions\`.

| png | question_id | step_id | verdict | what is wrong | what it should show |
|---|---|---|---|---|---|
| fig_1 | ts_ipe_c2_bio_saq_peptide_linkage_primary_structure_denaturation | s2_figure | OK | — | Box encloses the whole –CO–NH– group: C=O from the first residue, N–H from the second, R₁ and R₂ left outside on the two α-carbons. Matches the step's `why` exactly. |
| fig_2 | ts_ipe_c2_bio_saq_structure_of_glucose | s3_figure_open | OK | — | Fischer projection of D-glucose: CHO top, CH₂OH bottom, OH right / OH **left** at C3 / OH right / OH right. Matches the memory tip "OH right, OH left, OH right, OH right". |
| fig_10 | ts_ipe_c2_ck_activation_energy | s4_exothermic_profile | OK | Very minor: the `ER` label sits on the y-axis line (the axis crosses the R), still legible. | Exothermic profile: EP below ER, peak = ET above both, Eₐ arrow ER→ET, Eₐ' arrow EP→ET and visibly the longer of the two. All correct. |
| fig_11 | ts_ipe_c2_ck_catalyst_effect_on_rate | s5_diagram | WRONG-LABEL | Both activation-energy arrow shafts (`cat_arrow_with` x=430, `cat_arrow_without` x=460) run vertically straight **through the words "Eₐ with catalyst"** (label anchored x=350, y=108; the label extends past x=460). Two dark strokes cut the word "catalyst". Secondary: the "Reactants" label at (100,115) is crossed by both the reactant dashed level (y=125) and the catalysed curve. | Chemistry is right — two curves from one reactant level to one product level, only the peak height differing, two Eₐ arrows. The label needs to move left of x≈420 (or above the "without" label) so neither arrow crosses it, and "Reactants" needs to clear the y=125 level line. |
| fig_12 | ts_ipe_c2_df_colour_of_transition_metal_ions | s3_splitting_figure | WRONG-CHEMISTRY | The barycentre is drawn inverted. Free-ion level y=160; `cfs_eg_level` y=108 (52 px **above**), `cfs_t2g_level` y=236 (76 px **below**). Crystal-field theory requires the eg set to be **raised by 0.6 Δo** and the t2g set **lowered by 0.4 Δo** — the rise must be 1.5× the drop. As drawn the drop is 1.46× the rise, i.e. exactly backwards. (Everything else — eg above t2g, 2 lines vs 3 lines, Δo spanning t2g→eg — is correct, and the card's own text never states the 0.6/0.4 split, so this is a drawing-only defect.) | Keep the free-ion level as the reference and place eg at 0.6 Δo above it and t2g at 0.4 Δo below it — e.g. with the gap kept at 128 px, eg ≈ y 83 and t2g ≈ y 211 for a free-ion line at y=160. |
| fig_13 | ts_ipe_c2_df_isomerism_in_coordination_compounds | s4_cis_trans_figure | OK | — | Square-planar [Pt(NH₃)₂Cl₂]: cis has both Cl on the same edge (top-left + bottom-left), trans has them diagonal (top-left + bottom-right) with the two ammines between. Four bonds ~90° apart, as the step's `common_mistakes` demands. |
| fig_14 | ts_ipe_c2_ec_galvanic_cell_daniel_cell | s3_diagram | OK | Very minor: the closing ")" of "Zinc anode (−)" (x=10, y=88) is clipped by the external wire's left riser at x=129; still legible. | Two beakers with Zn rod in ZnSO₄ and Cu rod in CuSO₄, salt bridge with **both arms dipping below the solution line** (arms at x=175/385 reach y=200 vs level y=185 — verified), external wire through a voltmeter (not a battery), e⁻ → drawn leaving the zinc. All correct; the marked (2-mark) labels are all present. |
| fig_15 | ts_ipe_c2_ec_she_construction_working | s3_diagram | OK | Very minor: the tail of the `she_leader_foil` arrow (x=224, ends y=264) grazes the top of the "Pt foil coated with Pt black" text at y=268. | Pt foil at y=210–226, i.e. **below** the solution level y=165 as the `common_mistakes` requires; Pt wire in the glass tube; H₂ in at 1 bar; bubbles at the foil; 1 M H⁺ solution; salt-bridge side tube leaving below the surface. All five required labels present. |
| fig_16 | ts_ipe_c2_ec_types_of_batteries | s3_dry_cell_diagram | OK | Minor: the `dry_seal` line (y=118) crosses the carbon rod; and the "porous paper" and "MnO₂ + carbon black" leaders both terminate on the two walls of the same inner rectangle, so the separator and the MnO₂ layer are only distinguishable from which side the leader comes. | Dry cell cut-away: zinc can (anode, −) outside, NH₄Cl + ZnCl₂ paste in the annulus, porous paper, MnO₂ + carbon black around the central graphite rod (cathode, +) which does **not** touch the can. Layer order and polarity all correct. |
| fig_17 | ts_ipe_c2_met_froth_flotation | s2_diagram | OK | — | Flotation cell with three layers: mineral-bearing froth on top (particles drawn in the froth, not at the bottom), pulp of ore + oil in the middle, gangue settled at the bottom; rotating paddle and an air feed into the hollow shaft (the standard Denver-cell arrangement). Matches the `common_mistakes` on both counts. |
| fig_18 | ts_ipe_c2_ng_structures_of_xef2_and_xef4 | s3_shapes_drawn | OK | Minor geometry: the three XeF₂ equatorial lone pairs are drawn at roughly 180°/−23°/+38° rather than a clean 120° fan. Reads correctly as three equatorial pairs. | XeF₂ linear with two axial F and three equatorial lone pairs (sp³d, TBP parent); XeF₄ square planar with four coplanar F and one lone pair above and one below (sp³d², octahedral parent). Both correct, and XeF₄ is not drawn as a tetrahedron. |
| fig_19 | ts_ipe_c2_ng_structures_of_xef6_and_xeof4 | s2_xef6_drawn | OK | — | Six Xe–F bonds at deliberately **unequal** spacing with the single lone pair (dashed leader + two dots) pushed out through the open face — the distorted octahedron the card's boxed line and `common_mistakes` require. Exactly six F, no seventh atom where the lone pair sits. |
| fig_20 | ts_ipe_c2_ng_structures_of_xef6_and_xeof4 | s4_xeof4_drawn | OK | — | Square pyramidal XeOF₄: Xe=O drawn as a **double** line at the apex, four F in the flat square, lone pair directly opposite the oxygen below the square. Matches both `common_mistakes`. |
| fig_21 | ts_ipe_c2_sc_dialysis_purification | s3_diagram | WRONG-LABEL | The "colloidal solution" label is anchored at (300, 200) — outside the bag, out in the water, and the vessel's **right wall** (`dl_vessel`, x=400, spanning y=100–250) runs vertically through the word "solution". Two faults in one: the text is struck through by a structural line, and the label sits over the water rather than over the bag it names (its pencil leader stops at x=294, well short of the text, so nothing visually connects them). This step is worth **1 mark for the diagram**, so the label matters. | The label should sit clear of the vessel wall with a leader that actually reaches it from the interior of the membrane bag (bag walls x=232–292), so a reader cannot take "colloidal solution" to mean the water in the tank. The apparatus itself is right: bag suspended (not resting on the bottom), water in low-left / out high-right, outward diffusion arrows through the membrane. |
| fig_22 | ts_ipe_c2_sc_micelle_cleaning_action | s3_diagram | WRONG-LABEL | Two leader faults. (1) `mc_leader_heads` (202,190)→(202,202) ends **inside** the topmost head circle (centre 200,205, r=8), so the leader strikes through the very circle it points at. (2) `mc_leader_tails` (78,237)→(170,239) is a long bare line that ends inside the micelle ring with no arrowhead — it reads as a ninth soap-ion tail crossing the aggregate rather than as a leader. | Chemistry is correct: heads outward in the water, tails inward, oil drop at the centre, plus a single soap ion drawn above with head and tail named. The two leaders should stop short of the head circle and of the ring respectively (and carry arrowheads) so neither is mistaken for part of the structure. |
| fig_23 | ts_ipe_c2_ss_band_conductor_insulator | s4_diagram | OK | Minor: the "bands touch" caption sits ~90 px below the conductor column, far from what it describes. | Conductor = filled and empty bands touching with no gap; insulator = filled valence band, empty (unshaded) conduction band, large gap arrow between them. Gap sizes differ as the `common_mistakes` requires, and the insulator's conduction band is correctly left unshaded. |
| fig_24 | ts_ipe_c2_ss_band_conductor_semiconductor | s4_diagram | OK | Minor: same detached "bands touch" caption. | Conductor bands touching; semiconductor with a **completely filled** valence band and a narrow gap (20 px) to an empty conduction band — visibly much smaller than fig_23's insulator gap (80 px), which is the whole point of the pair. |

## Clean figures

- fig_1 — peptide linkage (`s2_figure`)
- fig_2 — glucose open-chain Fischer projection (`s3_figure_open`)
- fig_10 — exothermic energy profile (`s4_exothermic_profile`)
- fig_13 — cis/trans [Pt(NH₃)₂Cl₂] (`s4_cis_trans_figure`)
- fig_14 — Daniel cell (`s3_diagram`)
- fig_15 — standard hydrogen electrode (`s3_diagram`)
- fig_16 — dry cell cut-away (`s3_dry_cell_diagram`)
- fig_17 — froth flotation cell (`s2_diagram`)
- fig_18 — XeF₂ / XeF₄ shapes (`s3_shapes_drawn`)
- fig_19 — XeF₆ distorted octahedron (`s2_xef6_drawn`)
- fig_20 — XeOF₄ square pyramid (`s4_xeof4_drawn`)
- fig_23 — conductor vs insulator bands (`s4_diagram`)
- fig_24 — conductor vs semiconductor bands (`s4_diagram`)

## Counts

| verdict | count |
|---|---|
| OK | 13 |
| WRONG-CHEMISTRY | 1 |
| WRONG-LABEL | 3 |
| CLIPPED | 0 |
| UNCLEAR | 0 |
| **total** | **17** |
