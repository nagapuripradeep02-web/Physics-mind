# FIG-P2-2 — Physics-II figure review (pngs.txt lines 22–42)

Reviewer share: 21 rendered figures across 18 cards. Each PNG checked against the
`kind: "diagram"` step of its card (`figure.elements`, `margin_note`, `why`,
`common_mistakes`) and against the card's `question_text` and surrounding steps.
Handwriting font and small aesthetic differences are not flagged.

| png | question_id | step_id | verdict | what is wrong | what it should show |
|---|---|---|---|---|---|
| fig_29 | ts_ipe_p2_epc_parallel_combination_derive | s2_figure | OK | — | Three branches between two vertical bus wires, C₁/C₂/C₃ on each rung, battery (long +, short −) across the bottom. Drawn exactly so. |
| fig_3 | ts_ipe_p2_atm_bohr_hydrogen_spectrum | s5_figure_infrared | OK | — | Paschen arrow n=4→n=3, Brackett arrow n=5→n=4, upper levels crowding (gaps 35/45/60 px downward). All correct; n-labels sit clear on the right of each level. |
| fig_30 | ts_ipe_p2_epc_parallel_plate_capacitance_derive | s1_figure | OK | — | Two plates, +q left / −q right, E arrows pointing from the + plate to the − plate and only between the plates, σ on the + plate, d dimensioned below. Correct. |
| fig_31 | ts_ipe_p2_epc_potential_point_charge_derive | s2_figure | OK | — | Line O(q)–P–B–A with the step dx dimensioned between B and A, out along the line away from O (not near O). Correct. (`r` floats above the O–P span with no dimension line, but reads unambiguously.) |
| fig_32 | ts_ipe_p2_epc_series_combination_derive | s2_figure | OK | — | Three capacitors in one unbroken line, battery across the ends with long/short plates and +/− marked. Correct. |
| fig_33 | ts_ipe_p2_mag_gauss_law_magnetism | s2_figure | OK | — | Closed surface S with field lines passing in and out, one patch ΔS, outward normal n, B arrow from the patch, θ arc correctly spanning n→B (checked: arc endpoints lie on the normal and on the B ray). Correct. |
| fig_34 | ts_ipe_p2_mcm_amperes_law_state_prove | s1_figure | OK | — | Closed path with four currents **through** it (⊗i₁, ⊙i₂, ⊙i₃, ⊗i₄), dl tangent to the path (verified: dl direction matches the ellipse tangent at that point to under 0.5°), B at an angle to dl as the general law requires. Correct. |
| fig_35 | ts_ipe_p2_mcm_biot_savart_law | s1_figure | OK | — | Wire with i upward, thickened element dl, r from the element's mid-point to P, θ arc spanning dl→r (≈106°), and "dB ⊗ at P". The ⊗ is right: with dl = +ŷ and r̂ down-and-right, dl × r̂ points **into** the page. Correct. |
| fig_36 | ts_ipe_p2_mcm_cyclotron_components_uses | s1_figure | OK | — | Two dees with a gap, ⊙ dots for B out of the page, alternating left/right semicircles of growing radius (a true cyclotron spiral, not one circle), oscillator across the dees, exit port. Correct; the exit line crossing the dee wall is untidy but conventional. |
| fig_37 | ts_ipe_p2_mcm_field_long_straight_conductor | s1_figure | OK | — | Wire with i up, circular field line in perspective, r perpendicular from the wire to P, B **tangent** at P and pointing up-page. Direction verified: φ̂ = ẑ × r̂ at the right extremity is the far (upper) side of the ellipse. Correct. |
| fig_38 | ts_ipe_p2_mcm_force_conductor_and_parallel_wires | s1_fig_conductor | OK | — | Wire of length l with i, uniform B at θ to the wire, θ arc spanning the wire→field direction, and F marked ⊙ with "F is out of the page". Verified: l = +x̂, B at +26.6°, so i(l × B) = +ẑ = out of the page. Correct. The θ is marked against a faint dashed copy of B translated onto the wire — correct construction, slightly cramped against the i arrowhead. |
| fig_39 | ts_ipe_p2_mcm_force_conductor_and_parallel_wires | s5_fig_parallel | OK | — | Two parallel wires, both currents up, separation r perpendicular, F₁ and F₂ pointing **towards each other** (attraction) — equal and opposite. Correct. |
| fig_4 | ts_ipe_p2_atm_bohr_postulates_radius_energy | s2_figure | OK | — | Circular orbit, nucleus **+e** (not the book's wrong +2e), electron on the orbit, rₙ from centre to electron, v along the tangent. Verified: v·r = 0, so v is exactly tangential. Correct. |
| fig_40 | ts_ipe_p2_mcm_torque_on_loop_and_galvanometer | s1_fig_loop | WRONG-LABEL | The coil side **b is not labelled anywhere**, and the arm **b sin θ is not drawn or marked** — yet the step's own margin note says "the coil appears as a line of length b" and the `why` says the whole point of this view is that "the arm of the couple is the horizontal distance between the two force arrows, which is b sin θ". Steps 3/4 derive τ from b sin θ and l b = A, so the reader has no way to connect the drawing to the algebra. Secondary: the B field ray is a dashed line with no arrowhead, so the field direction is only implied by the letter B at its right end. | The slanted coil line labelled `b`, and a marked horizontal distance between the two `F = i l B` arrows labelled `b sin θ`; an arrowhead on the B ray. The geometry itself is right — N is exactly perpendicular to the coil line, θ is correctly measured from the **normal** to B, and the two i l B forces are equal, opposite and non-collinear. |
| fig_41 | ts_ipe_p2_mcm_torque_on_loop_and_galvanometer | s6_fig_galvanometer | OK | — | Rectangular coil hung on the phosphor-bronze wire between **concave** N and S pole faces, soft-iron core inside the coil, spring below, lead to G. All five items the card's `must_convey` asks for are present and correctly shaped. |
| fig_42 | ts_ipe_p2_nuc_discovery_of_neutron | s1_figure | OK | — | α source in its chamber → Be target → neutron beam → paraffin → proton beam (dashed) → detector, in that order, with the paraffin present. Correct. |
| fig_43 | ts_ipe_p2_nuc_nuclear_reactor_principle_working | s2_diagram | WRONG-LABEL | Two labels collide with the drawing: (a) **"Fuel rods"** is pierced by the left fuel-rod stroke — the rod line runs between "Fuel" and "rods"; (b) **"Moderator"** overruns the core rectangle's right wall, its last letters crossing the border line. Also **"Coolant in" has no arrowhead** (the element list has `coolant_out_ah` but no `coolant_in_ah`), so the return leg of the loop shows no direction; and nothing is drawn for the moderator — the word floats in empty core space. This is the one figure in the share carrying diagram **marks (2)**. | Labels placed clear of the rods and not crossing the core box (leader lines if needed), an arrowhead on the coolant-in line pointing into the shielding, and some mark (hatching or a shaded region between the fuel rods) for the moderator the label names. The structure itself is right: control rod entering from **above and reaching into** the core, fuel rods inside the core, core inside the shielding. |
| fig_44 | ts_ipe_p2_nuc_radioactive_decay_law_exponential | s7_graph | OK | — | N vs t, N₀ at the intercept, curve through (T, N₀/2) and (2T, N₀/4) — verified numerically: N₀ height 160 px, N₀/2 at 80 px, N₀/4 at 40 px, T = 70 px and 2T = 140 px from the origin. Curve is asymptotic and never touches the t axis. Correct. |
| fig_45 | ts_ipe_p2_ray_compound_microscope_magnification | s2_figure_objective | WRONG-LABEL | **F₀ is not marked on the principal axis** — there is no tick, dot or foot, and the label sits ~20 px *above* the axis right beside the refracted ray, so it reads as naming the ray rather than the focal point. Because no focus is marked on the object side either, the figure cannot show the thing its own margin note claims ("the object OJ sits just outside F₀"), which is what earns the diagram mark. Also **I₁ is never labelled** — only G₁ — although the card names the image "I₁G₁" in this step and in every step after it. Minor: both rays run ~27 px past the image and cross again, leaving a stray X. | A dot/tick on the axis at the focus labelled F₀ (and ideally the object-side focus too), the image foot on the axis labelled I₁, and the rays stopped at the image. The **ray construction itself is exactly right** — parallel ray through the focus, undeviated ray through the optical centre, f = 40, u = 52 (outside F₀), v = 173 (beyond 2F₀), m = v/u = 3.3 matching the drawn heights, image inverted below the axis. |
| fig_46 | ts_ipe_p2_ray_compound_microscope_magnification | s3_figure_eyepiece | OK | — | I₁G₁ inside fₑ, the two emerging rays diverging, dashed backward extensions meeting at the enlarged virtual final image on the object side. Verified: fₑ = 70, u = 40 (inside fₑ), v = −93.3 → the final image is drawn at x = 137 against a computed 136.7, and its height 61 px matches m = 2.33 × 26 px. Correct. Minor: the virtual final image is a dashed line with no arrowhead, and the `G₁` label sits ~40 px below the arrow it names. |
| fig_47 | ts_ipe_p2_ray_critical_angle_total_internal_reflection | s2_figure | WRONG-PHYSICS | **The law of reflection is broken in the i > C half.** The incident ray runs (150,150)→(240,100), i.e. Δ = (90,−50), so the angle of incidence at the vertical normal is atan(90/50) = **61.0°**. The reflected ray runs (240,100)→(310,150), Δ = (70,+50), giving an angle of reflection of atan(70/50) = **54.5°**. Total internal reflection is still reflection: **the angle of reflection must equal the angle of incidence (i = r)**, and here they differ by 6.5°, visibly — the reflected ray is drawn noticeably steeper than the incident one. This is the one thing the right-hand half of the figure exists to show. Secondary: the label **"i = C" overlaps the left incident ray and its arrowhead** and is struck through by it, and "i > C" touches the second arrowhead. | The reflected ray mirrored about the normal — from (240,100) it must leave with Δ = (90,+50), i.e. end near (330,150) (or (326,148) to stay in the canvas), so the V made by the incident and reflected rays is symmetric about the dashed normal. Labels moved off the ray strokes. The rest is right: incidence is in the **denser** medium, the i = C ray refracts along the surface at 90°, and the i > C ray turns back into the glass. |

## Clean figures

- fig_29 — ts_ipe_p2_epc_parallel_combination_derive / s2_figure
- fig_3 — ts_ipe_p2_atm_bohr_hydrogen_spectrum / s5_figure_infrared
- fig_30 — ts_ipe_p2_epc_parallel_plate_capacitance_derive / s1_figure
- fig_31 — ts_ipe_p2_epc_potential_point_charge_derive / s2_figure
- fig_32 — ts_ipe_p2_epc_series_combination_derive / s2_figure
- fig_33 — ts_ipe_p2_mag_gauss_law_magnetism / s2_figure
- fig_34 — ts_ipe_p2_mcm_amperes_law_state_prove / s1_figure
- fig_35 — ts_ipe_p2_mcm_biot_savart_law / s1_figure
- fig_36 — ts_ipe_p2_mcm_cyclotron_components_uses / s1_figure
- fig_37 — ts_ipe_p2_mcm_field_long_straight_conductor / s1_figure
- fig_38 — ts_ipe_p2_mcm_force_conductor_and_parallel_wires / s1_fig_conductor
- fig_39 — ts_ipe_p2_mcm_force_conductor_and_parallel_wires / s5_fig_parallel
- fig_4 — ts_ipe_p2_atm_bohr_postulates_radius_energy / s2_figure
- fig_41 — ts_ipe_p2_mcm_torque_on_loop_and_galvanometer / s6_fig_galvanometer
- fig_42 — ts_ipe_p2_nuc_discovery_of_neutron / s1_figure
- fig_44 — ts_ipe_p2_nuc_radioactive_decay_law_exponential / s7_graph
- fig_46 — ts_ipe_p2_ray_compound_microscope_magnification / s3_figure_eyepiece

## Counts

| verdict | count |
|---|---|
| OK | 17 |
| WRONG-PHYSICS | 1 |
| WRONG-LABEL | 3 |
| CLIPPED | 0 |
| UNCLEAR | 0 |
| **total** | **21** |
