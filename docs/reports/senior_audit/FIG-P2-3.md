# FIG-P2-3 — Physics-II figure review (pngs.txt lines 43–62)

Reviewer share: 20 PNGs / 13 cards. Source images: `…/scratchpad/figs/ts_ipe_p2/`.
Cards: `C:\Tutor\physics-mind\answer-book\questions\<question_id>.json`.

Handwriting font and small aesthetic differences were NOT flagged.

## Verdict table

| png | question_id | step_id | verdict | what is wrong | what it should show |
|---|---|---|---|---|---|
| fig_48 | ts_ipe_p2_ray_focal_length_concave_mirror_r_2f | s2_figure | OK | — | Verified: concave arc opens toward C; the normal is the line CM (dashed from C through M), not a perpendicular drawn by eye; angle MCD = θ at C and angle MFD = 2θ at F (the exterior-angle relation); D is the foot of the perpendicular from M; reflected ray M→F is arrowed. Matches steps s3–s5 exactly. |
| fig_49 | ts_ipe_p2_ray_formation_of_mirage | s2_figure | WRONG-LABEL | The ray path and the air layers are physically right, but the image point is neither marked nor reachable. Step s5 says the observer "sees it as coming from a point **I** below the tree" and s4 says the ray leaves "the top **O** of a tree"; the figure labels neither O nor I. The dashed back-extension (`virtual_ray`, `M 282 120 L 176 197`) stops at x=176 — well to the RIGHT of the tree at x=62 and only 12 units below the ground line — so it points at empty ground, not at a point below the tree. Extending it to x=62 would land at y≈280, off a 215-high canvas. | Label the tree top **O**, and end the dashed back-extension at a marked image point **I** with a small inverted tree, below the ground line. Re-plan the canvas height (or shorten the tree–observer separation) so I actually falls under the tree as the answer states. |
| fig_5 | ts_ipe_p2_atm_thomson_model_limitations | s2_figure | OK | — | Plum-pudding sphere with five electrons drawn INSIDE the positive sphere, not on its surface — the exact error the step's `common_mistakes` warns about. Both leader lines terminate on the structures they name. |
| fig_50 | ts_ipe_p2_ray_formation_of_rainbow | s2_figure | **WRONG-PHYSICS** | **The secondary bow is drawn BELOW the primary bow.** The one-reflection drop (`drop1`, centre 215,55, labelled "Primary") sits ABOVE the two-reflection drop (`drop2`, centre 250,130, labelled "Secondary"). Measured from the eye at (103,170), the "Primary" drop subtends ≈46° above the horizontal and the "Secondary" drop only ≈15° — the figure puts the secondary INSIDE the primary. This contradicts the card's own text: s4 says "The **inner** bow is the primary rainbow… violet emerges at about 40° and red at about 42°", s5 says "The **outer** bow is the secondary rainbow… between about 50° and 53°". A larger angle from the anti-solar direction means higher in the sky, so the two-reflection drop MUST be drawn above the one-reflection drop. Secondary evidence: the secondary drop's ray enters the UPPER-left of the drop (230,118 against centre 250,130); in the textbook secondary figure the ray enters the LOWER part of the drop and emerges from the upper part. The inversion also forces the second incident sunlight ray to cross the primary drop's emergent ray, giving an unexplained X in the middle of the figure. | Swap the two drops vertically: the two-internal-reflection drop on top (seen at 50°–53°) and the one-internal-reflection drop below it (40°–42°), both feeding the same eye, with the two incident sunlight rays parallel and non-crossing. Enter the secondary drop on its lower half. Optionally mark the ≈42° and ≈51° angles at the eye, since those are the numbers s4/s5 quote. |
| fig_51 | ts_ipe_p2_ray_setting_sun_appears_red | s3_figure | OK | — | Both suns are drawn OUTSIDE the dashed atmosphere boundary; the overhead path crosses ≈177 units of atmosphere and the slant path ≈290, so the slant path is visibly the longer one — the requirement in the step's `common_mistakes`. Not flagged: the "Sun near horizon" is drawn at ≈37° elevation rather than genuinely near the horizon, but the comparison it has to make still reads correctly. |
| fig_52 | ts_ipe_p2_ray_simple_microscope_image_formation | s2_figure | WRONG-LABEL | The ray geometry is exactly right (checked numerically: `ray1b` crosses the axis at x≈270 so f=+60; u=−40 gives v=−120, image at x=90 with m=3 and height 84 — the drawn image is 84 tall at x=90; both the parallel ray and the optical-centre ray back-extend to the same tip, so the image is virtual, erect, magnified and on the object side). The labels are the problem. (1) **"Eye" @(310,170) names a structure that is not drawn** — there is no eye symbol anywhere, and the two emergent rays terminate 50 units apart at (306,137) and (306,187), so no eye placed there could receive both; s1 also says the eye sits "close to the lens", but the label is 100 units from the lens, farther out than F. (2) **"F" @(272,110) has no tick or dot on the principal axis** at x≈270, so it floats between the two rays. | Draw a small eye symbol on the axis just beyond the lens, with both emergent rays converging into its pupil, and put a tick or dot on the principal axis at the focus before labelling it F. |
| fig_53 | ts_ipe_p2_ray_snells_law_prism_refractive_index | s2_figure_prism | WRONG-LABEL | The ray path is correct and self-consistent (both normals are true perpendiculars, bisected at Q and R; they meet at T=(250,211) giving angle QTR = 120° = 180° − A, exactly what step s4 needs; QR is parallel to the base and the entry/exit angles are symmetric, giving i₁≈48.8°, r₁=30°=A/2, μ≈1.50). But the derivation names points the figure never marks: **B and C** (s3: "Let ABC be the principal section"), **P and S** (s3: "PQ is the incident ray… leaves as the emergent ray RS"), **T** (s4: "Let the two normals meet at T" — the step's own `why` calls T the whole reason both normals are drawn), and **δ** (s3 defines it as the angle between PQ produced forward and RS produced backward; neither production line nor the angle is drawn, yet s5, s7 and s8 are all built on δ). Only A is labelled. Additionally the **Q and R labels are pulled inward off their points**: Q is at (179,170) with its label at (205,162), and R is at (321,170) with its label at (280,162) — 41 units, 29% of the length of QR, to the left of R — so both read as labelling the middle of the internal ray rather than the points on the faces. | Label vertices B and C, mark P on the incident ray and S on the emergent ray, mark T where the normals meet, and add the two dashed production lines meeting at the deviation angle δ. Move the Q and R labels beside their own points on faces AB and AC. |
| fig_54 | ts_ipe_p2_ray_snells_law_prism_refractive_index | s6_figure_curve | OK | — | Verified numerically: the drawn minimum marker (155,104) matches the curve's true minimum (159,104), and the D₁ horizontal at y=70 meets the curve at x=95.5 and x=229.6 — the two construction verticals are drawn at exactly 96 and 230. The curve falls, bottoms and rises; one deviation cuts it twice, single at the minimum, exactly as s7 argues. Axes D and i labelled. Not flagged: δ marks the minimum here while s3/s5 use δ for the general deviation — s7 re-defines it, so the figure is internally coherent. |
| fig_55 | ts_ipe_p2_sem_n_and_p_type_and_junction_formation | s3_junction_figure | OK | — | Negative acceptor ions on the p side and positive donor ions on the n side (both listed `common_mistakes` avoided); the depletion region's dashed boundaries straddle the junction on BOTH sides and the double-headed arrow spans exactly that region. |
| fig_56 | ts_ipe_p2_sem_nand_and_nor_gates | s2_nand_symbol | OK | — | AND body (straight back, round nose) plus the output bubble = NAND; two inputs A and B, output Y. Matches the caption and s1. |
| fig_57 | ts_ipe_p2_sem_nand_and_nor_gates | s5_nor_symbol | OK | — | OR body (curved back, pointed nose) plus the output bubble = NOR; the input leads stop on the curved back. Matches the caption and s4. |
| fig_58 | ts_ipe_p2_sem_not_gate_operation | s2_symbol | OK | — | Triangle with the bubble at the tip, one input and one output — both listed `common_mistakes` avoided. |
| fig_59 | ts_ipe_p2_sem_not_gate_operation | s3_circuit | OK | — | npn transistor (emitter arrow points OUT of the base bar, correct for a grounded-emitter inverter), emitter to ground, collector up through R to +V, input A on the base, output Y taken at the collector — matching s4/s5 and both `common_mistakes`. |
| fig_6 | ts_ipe_p2_cur_colour_code_red_red_red_silver | s1_figure | OK | — | Four bands with the tolerance band set off by the conventional wider gap; the digit/digit/multiplier/tolerance labels (2, 2, ×10², 10%) sit above their own bands and the colour names below them. Consistent with 22 × 10² Ω ± 10% in s2/s3. |
| fig_60 | ts_ipe_p2_sem_rectification_full_wave_rectifier | s2_circuit | OK | — | Centre-tap topology verified from the paths: the tap leaves the secondary at its midpoint (136,106); D₁ and D₂ both point toward the load and their cathodes join at (330,106) together with the load's far end, so the load runs from the joined cathodes back to the centre tap. Both listed `common_mistakes` avoided. P, S, C, D₁, D₂ and Load all labelled. |
| fig_61 | ts_ipe_p2_sem_rectification_full_wave_rectifier | s3_waveforms | OK | — | Input is two full sine cycles; output is four positive humps with NO gaps, on the same x-span and the same half-cycle boundaries — two pulses per cycle. Axes V, t and O labelled on both graphs; the "output" label clears the fourth hump. |
| fig_62 | ts_ipe_p2_sem_rectifier_half_and_full_wave | s2_hw_circuit | OK | — | Diode in SERIES with the load (not parallel), cathode toward the load, load across the output, transformer P/S and the ~ source labelled, and the diode labelled D as the working refers to it. |
| fig_63 | ts_ipe_p2_sem_rectifier_half_and_full_wave | s4_hw_waveform | OK | — | Output humps occupy x 46–106 and 166–226; the flat gaps occupy 106–166 and 226–286 — exactly the input's positive and negative half-cycles. The negative halves are removed, not flipped (the step's `common_mistakes`). |
| fig_64 | ts_ipe_p2_sem_rectifier_half_and_full_wave | s5_fw_circuit | OK | — | Identical geometry to fig_60 and correct for the same reasons; the centre tap C is marked, which this step's `why` calls the defining feature. |
| fig_65 | ts_ipe_p2_sem_rectifier_half_and_full_wave | s7_fw_waveform | OK | — | Identical to fig_61, and drawn on the same scale as fig_63 so the doubled pulse count is directly comparable — which is what this step's `why` claims. |

## Counts

| verdict | count |
|---|---|
| OK | 16 |
| WRONG-PHYSICS | 1 |
| WRONG-LABEL | 3 |
| CLIPPED | 0 |
| UNCLEAR | 0 |

## Clean figures

- fig_48 — ts_ipe_p2_ray_focal_length_concave_mirror_r_2f / s2_figure
- fig_5 — ts_ipe_p2_atm_thomson_model_limitations / s2_figure
- fig_51 — ts_ipe_p2_ray_setting_sun_appears_red / s3_figure
- fig_54 — ts_ipe_p2_ray_snells_law_prism_refractive_index / s6_figure_curve
- fig_55 — ts_ipe_p2_sem_n_and_p_type_and_junction_formation / s3_junction_figure
- fig_56 — ts_ipe_p2_sem_nand_and_nor_gates / s2_nand_symbol
- fig_57 — ts_ipe_p2_sem_nand_and_nor_gates / s5_nor_symbol
- fig_58 — ts_ipe_p2_sem_not_gate_operation / s2_symbol
- fig_59 — ts_ipe_p2_sem_not_gate_operation / s3_circuit
- fig_6 — ts_ipe_p2_cur_colour_code_red_red_red_silver / s1_figure
- fig_60 — ts_ipe_p2_sem_rectification_full_wave_rectifier / s2_circuit
- fig_61 — ts_ipe_p2_sem_rectification_full_wave_rectifier / s3_waveforms
- fig_62 — ts_ipe_p2_sem_rectifier_half_and_full_wave / s2_hw_circuit
- fig_63 — ts_ipe_p2_sem_rectifier_half_and_full_wave / s4_hw_waveform
- fig_64 — ts_ipe_p2_sem_rectifier_half_and_full_wave / s5_fw_circuit
- fig_65 — ts_ipe_p2_sem_rectifier_half_and_full_wave / s7_fw_waveform
