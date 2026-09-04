# FIG-M2 — figure review, IPE second-year Maths 2A + 2B

29 rendered figures reviewed (26 from `ts_ipe_m2b`, 3 from `ts_ipe_m2a`) against each card's
diagram step, question text and boxed answer. Geometry was recomputed from the SVG path data in
`figure.elements[].d` (technique per `answer-book/tools/figcheck_m2b.py`), then every PNG was
looked at.

Verdict counts: **OK 21 · WRONG-GEOMETRY 3 · WRONG-LABEL 4 · UNCLEAR 1 · CLIPPED 0**

| png | question_id | step_id | verdict | what is wrong | what it should show |
|---|---|---|---|---|---|
| fig_1 | ts_ipe_m2b_cir_all_common_tangents_2x_6y_6 | s6_diagram | WRONG-LABEL | Caption reads "I is inside, E is outside both circles". The drawing (correctly) puts I at x=240, which is 100 px from C₁ (r=72) and 50 px from C₂ (r=36) — i.e. **outside both circles**, in the gap between them. The picture contradicts its own caption. Geometry itself is exact: radii 72:36 = 2:1, I and E land on the exact internal/external section points. | Caption should say I divides C₁C₂ **internally** (it lies between the circles) and E divides it **externally** (beyond the smaller circle) — neither point is inside a circle. |
| fig_2 | ts_ipe_m2b_cir_chord_length_8x_2y_minus8_on_x_y_1 | s4_diagram | OK | — | Chord endpoints sit exactly on the circle (half-chord 64, p=48, r=80), right angle at D, r and p labelled. Schematic rather than to the card's r=5, p=3√2 scale, which is fine for a formula picture. |
| fig_3 | ts_ipe_m2b_cir_chord_length_x_3y_minus22_on_y_x_minus3 | s4_diagram | OK | — | Same verified template as fig_2. |
| fig_4 | ts_ipe_m2b_cir_direct_common_tangents_22x_minus4y | s7_diagram | OK | — | Both lines are true tangents (distance to C₁ = 75.2 vs r=75; to C₂ = 24.9 vs r=25) meeting at E = 352.5, the exact external section point; radii 75:25 = 3:1 matches r₁:r₂ = 15:5. |
| fig_5 | ts_ipe_m2b_cir_line_touches_3x_7y_14_point_of_contact | s5_diagram | OK | — | Line is tangent (distance 63.6 vs r=64); P = (205,63) is the exact foot of the perpendicular; right angle marked; the line-equation label is not clipped. |
| fig_6 | ts_ipe_m2b_cir_midpoint_and_length_of_chord_2x_10y_1 | s4_diagram | OK | Minor: the "D" label sits ~20 px left of the true foot, so it reads slightly off-centre of AB while the caption calls D the mid point. | Same verified chord template; move the D label under the perpendicular foot. |
| fig_7 | ts_ipe_m2b_cir_perpendicular_tangents_from_origin_condition | s4_diagram | WRONG-LABEL | Caption says "the line to C halves the angle θ", but **the segment OC is never drawn** — the figure has only the two tangents, the angle arc at O and the radius to the touch point. The `why` text likewise describes a right-angled triangle that is not on the page. Secondary: the drawn angle is ≈38°, while the question is about θ = 90°. | Draw OC (dashed) so the bisector the caption names exists, or reword the caption to describe only what is drawn. Better still, draw θ near 90°, the case actually being solved. |
| fig_8 | ts_ipe_m2b_cir_tangent_and_normal_at_3_2 | s3_diagram | OK | — | P=(194,71) lies on the circle; the normal passes through both C and P; tangent perpendicular to the normal at P with the right angle marked. |
| fig_9 | ts_ipe_m2b_cir_tangent_at_3_minus1_and_parallel_tangent | s3_diagram | OK | Minor: a free-floating dashed line labelled "same slope" sits outside the circle (template shared with fig_10, where it is the given line). A student could read it as a third tangent. | The two solid lines are genuine tangents on opposite sides of C (distance 62.2 vs r=62 each) — correct. Consider dropping the stray dashed line here, or marking the point (3,−1). |
| fig_10 | ts_ipe_m2b_cir_tangents_parallel_to_x_y_minus8 | s4_diagram | OK | — | Two true tangents on opposite sides of C, both parallel to the dashed given line, which is labelled "x + y − 8 = 0". |
| fig_11 | ts_ipe_m2b_cir_touch_externally_4x_6y_minus12 | s6_diagram | OK | Minor scale: drawn radii 55:63, whereas the card has r₁:r₂ = 5:8. P is still correctly nearer C₁. | Exact external tangency (C₁C₂ = 118 = 55+63), P on the centre line, common tangent perpendicular to C₁C₂ through P. |
| fig_12 | ts_ipe_m2b_cir_touch_externally_6x_2y_plus1 | s6_diagram | OK | — | Radii 66:44 = 3:2, exactly the card's r₁:r₂; tangency exact; tangent perpendicular to C₁C₂ at P. |
| fig_13 | ts_ipe_m2b_cir_touch_internally_6x_9y_plus13 | s6_diagram | WRONG-LABEL | **C₁ and C₂ are swapped.** The BIG circle (r=90) is labelled C₁ and the small one (r=45) C₂, so the picture asserts r₁:r₂ = 2:1. The card has C₁=(3,9/2) with r₁=√65/2 (the **smaller**) and C₂=(1,8) with r₂=√65, and divides externally in the ratio **1:2**. A student reading the ratio off the figure gets the section formula backwards. Minor: the C₁ label is drawn over its own centre dot. | Label the small circle's centre C₁ and the large one C₂ (swap the two labels, or swap the radii to 45 and 90), keeping P beyond both centres as drawn. |
| fig_14 | ts_ipe_m2b_cir_transverse_common_tangents_4x_10y_28 | s5_diagram | OK | Minor scale: drawn radii 30:60 = 1:2 while the card has r₁:r₂ = 1:3 (the drawn I at 183 is consistent with the drawn radii, not with 1:3). | Both lines are true transverse tangents (distances 29.7/60.3 vs r=30/60, on opposite sides) crossing at I between the circles; C₁ correctly the smaller. |
| fig_15 | ts_ipe_m2b_di_saq_area_ellipse_deduce_circle | s2_figure | OK | Minor: the "A(a,0)" label is struck through by the ellipse's lower-right arc. | Axes present, both vertices labelled, and the first-quadrant region OAB highlighted — matching "Area = 4 × area of OAB". |
| fig_16 | ts_ipe_m2b_di_saq_area_y2_eq_4ax_x2_eq_4by | s2_boundary | OK | Internal only, invisible to a reader: the element **ids** are crossed — `curve2_y2_4ax` holds the flat-nosed path (which is x²=4by) and vice versa. The rendered labels nevertheless sit on the correct curves. | As rendered: the y-axis-hugging upper curve is labelled y²=4ax and the flat lower curve x²=4by, matching "Upper curve: y²=4ax"; hatching lies inside the enclosed lens. Rename the ids if the file is touched. |
| fig_17 | ts_ipe_m2b_di_saq_area_y2_eq_4x_x2_eq_4y | s2_boundary | OK | Same crossed element ids as fig_16; rendered labels correct. Minor: "O(0,0)" is overprinted by the y-axis. | Upper curve labelled y²=4x, lower x²=4y, shaded lens between O and the second intersection. |
| fig_18 | ts_ipe_m2b_ell_auxiliary_circle_foot_of_perpendicular | s5_diagram | OK | Minor: the tangent dips ~16 px inside the ellipse (normalised distance 0.995 instead of 1.000); the words "ellipse" and "auxiliary" are each struck through by their own curve; S is a bare letter with no dot and no axis drawn. | Right where it counts: the circle radius 90 = a and is concentric with the 90×55 ellipse; the perpendicular starts at x=231, the exact focus (c = 71.2); P=(245,82) is on the auxiliary circle (89.5 ≈ 90) and meets the tangent to within 0.4° of a right angle. |
| fig_19 | ts_ipe_m2b_ell_director_circle_perpendicular_tangents | s5_diagram | OK | Minor: the two tangent segments meet at ≈84°, not 90°, and are short stubs that stop at the ellipse rather than crossing their touch points; no right-angle mark; "ellipse" struck through by the ellipse. | Director-circle radius 99 vs √(a²+b²) = 98.6, concentric, P on it (99.4); both lines touch near the top and right vertices, where the tangents genuinely are perpendicular. |
| fig_20 | ts_ipe_m2b_ell_stb_equilateral_triangle_eccentricity | s5_diagram | OK | — | Foci inside at c=45 with a=90, so the drawing itself reads e = c/a = 0.500, exactly the card's answer; b=78 ≈ a√3/2; the three sides measure 90.0/90.05/90.05, genuinely equilateral; B at the minor-axis end. |
| fig_21 | ts_ipe_m2b_ell_tangent_intercepts_cm_cn_identity | s5_diagram | **WRONG-GEOMETRY** | The line NM is **not a tangent — it is a secant**. It slices a ≈35 px chord through the upper right of the ellipse (plainly visible in the render); normalised distance 0.967 instead of 1.000. Measured off the drawing, a²/(CM)² + b²/(CN)² = **1.070**, so the picture contradicts the very identity the card proves. P is labelled outside the ellipse with no touch point marked. | With the ellipse 90×55 centred at (150,150), use a real tangent: the intercepts must satisfy a²/CM² + b²/CN² = 1 — e.g. CM = 127, CN = 76 (M=(277,150), N=(150,74)) gives 1.000. Mark the tangency point P on the curve. |
| fig_22 | ts_ipe_m2b_ell_tangent_normal_end_latus_rectum | s4_diagram | **WRONG-GEOMETRY** | The "tangent" **cuts straight through the ellipse** — a 62 px chord (normalised distance 0.935). Its drawn screen slope is 0.28, whereas the true tangent at L has screen slope 0.66; the normal is perpendicular to that wrong tangent, so it too points the wrong way. Everything else is exact: b/a = 68/90 = 0.756 ≈ 3/4, the latus rectum is at x=209 (the focus, c = 0.6614a) with half-length 51 = b²/a, and L=(209,79) is on the ellipse. | Rotate the tangent to slope ≈0.666 through L (e.g. (159,46) → (259,113)) so it touches at L only, then re-lay the normal perpendicular to it through L. |
| fig_23 | ts_ipe_m2b_hyp_director_circle_perpendicular_tangents | s5_diagram | OK | Minor: the upper tangent stops ~6 px short of the branch, so it runs alongside rather than visibly touching; the word "hyperbola" is struck through by the branch. | Director circle r=57 is correctly **smaller** than a=70 (the hyperbola case, the opposite of the ellipse's), concentric at (140,140); P lies on it (57.6); the two tangents are perpendicular to within 0.2° with the right angle marked; the lower one lands exactly on the branch. |
| fig_24 | ts_ipe_m2b_par_standard_form_derivation | s1b_figure | **WRONG-GEOMETRY** | Two faults. (1) Both branches leave the vertex **along the axis** (the control point (175,150) is level with the vertex), so the parabola has a flat beak instead of the vertical tangent y²=4ax has at its vertex; in the render the curve runs along the x-axis for ~35 px, so the vertex looks as if it sits near S rather than at A. (2) Labels: "A(0,0)" is dropped 55 px below the axis and lands **on the directrix**, not under the vertex at x=130, and "S(a,0)" is struck through by the lower branch; neither A, S nor Z carries a dot. | Draw the branches leaving the vertex vertically (control points at (130, 150±k)) so the nose is round, and put A(0,0) directly under (130,150) and S(a,0) under (165,150), each with a dot on the axis. |
| fig_25 | ts_ipe_m2b_par_vertex_focus_directrix_axis_x2_minus4y | s1b_figure | UNCLEAR | The curve and axis are right (downward parabola, horizontal tangent at the vertex, arrow down the axis, A(0,0) at the vertex), but the focus is only a floating letter "S" 80 px down and 8 px off the axis with **no dot**, so its position asserts nothing; there are no coordinate axes and **no directrix is drawn**, even though the directrix is one of the four answers the card says this sketch lets you check. | Put a dot for S on the axis a short distance below A, and draw the directrix as a horizontal line the same distance above A, so the sketch actually verifies vertex / focus / directrix / axis. |
| fig_26 | ts_ipe_m2b_sc_radical_centre_three_circles_one | s5_diagram | OK | Minor: only two of the three radical axes are drawn, so the concurrency the `why` claims is not really demonstrated (two lines always meet); the "S″" label is struck through by its own circle. | Both drawn lines are correct radical axes for the schematic equal-radius circles — the S/S′ axis is their perpendicular bisector at x=185, the S/S″ axis passes through their midpoint — and P is at their intersection. Adding the third axis would show the concurrency. |
| fig_1 (m2a) | ts_ipe_m2a_cn_argand_equilateral_triangle | s2_figure | WRONG-LABEL | The long "C(−2√3, 2√3)" label runs into the y-axis label, whose "y" is overprinted by the closing bracket and is effectively unreadable. Nothing is clipped by the canvas. | Plotting is exact — at 24 px/unit the points are A(2,2), B(−2,−2), C(−3.46,3.46), and the three sides measure 135.8/135.6/135.6, genuinely equilateral. Move the C label (or the y label) so they do not overlap. |
| fig_2 (m2a) | ts_ipe_m2a_cn_argand_rhombus | s2_figure | OK | — | All four points exact at 16 px/unit: A(−2,7), B(−1.5,0.5), C(4,−3), D(3.5,3.5); four sides all 104.3 px; diagonals 186.6 and 93.3 (ratio 2, matching √136 : √34) and exactly perpendicular — a true rhombus, not a square. |
| fig_3 (m2a) | ts_ipe_m2a_cn_argand_square | s2_figure | OK | — | Exact at 28 px/unit: A(2,1), B(4,3), C(2,5), D(0,3) with D on the y-axis; four equal sides (79.2 px) and two equal perpendicular diagonals (112 px each) — a square, with sides and diagonals distinguished as the `why` intends. |

## Clean figures

These 21 agree with their card's answer and are correctly labelled (parenthesised items are
cosmetic notes only):

- fig_2 · ts_ipe_m2b_cir_chord_length_8x_2y_minus8_on_x_y_1
- fig_3 · ts_ipe_m2b_cir_chord_length_x_3y_minus22_on_y_x_minus3
- fig_4 · ts_ipe_m2b_cir_direct_common_tangents_22x_minus4y
- fig_5 · ts_ipe_m2b_cir_line_touches_3x_7y_14_point_of_contact
- fig_6 · ts_ipe_m2b_cir_midpoint_and_length_of_chord_2x_10y_1 (D label slightly off the foot)
- fig_8 · ts_ipe_m2b_cir_tangent_and_normal_at_3_2
- fig_9 · ts_ipe_m2b_cir_tangent_at_3_minus1_and_parallel_tangent (stray "same slope" dashed line)
- fig_10 · ts_ipe_m2b_cir_tangents_parallel_to_x_y_minus8
- fig_11 · ts_ipe_m2b_cir_touch_externally_4x_6y_minus12 (radii 55:63, card 5:8)
- fig_12 · ts_ipe_m2b_cir_touch_externally_6x_2y_plus1
- fig_14 · ts_ipe_m2b_cir_transverse_common_tangents_4x_10y_28 (radii 1:2, card 1:3)
- fig_15 · ts_ipe_m2b_di_saq_area_ellipse_deduce_circle (A label over the curve)
- fig_16 · ts_ipe_m2b_di_saq_area_y2_eq_4ax_x2_eq_4by (element ids crossed; rendering correct)
- fig_17 · ts_ipe_m2b_di_saq_area_y2_eq_4x_x2_eq_4y (element ids crossed; rendering correct)
- fig_18 · ts_ipe_m2b_ell_auxiliary_circle_foot_of_perpendicular (tangent grazes 16 px inside; label strikethroughs)
- fig_19 · ts_ipe_m2b_ell_director_circle_perpendicular_tangents (tangents meet at 84°, not 90°)
- fig_20 · ts_ipe_m2b_ell_stb_equilateral_triangle_eccentricity
- fig_23 · ts_ipe_m2b_hyp_director_circle_perpendicular_tangents (upper tangent 6 px short)
- fig_26 · ts_ipe_m2b_sc_radical_centre_three_circles_one (only 2 of the 3 axes drawn)
- fig_2 (m2a) · ts_ipe_m2a_cn_argand_rhombus
- fig_3 (m2a) · ts_ipe_m2a_cn_argand_square

## Cross-cutting patterns worth one pass

1. **Ellipse "tangents" placed by eye come out as secants.** Three ellipse figures set a straight
   line by hand instead of solving for tangency: fig_21 (0.967), fig_22 (0.935) and, harmlessly,
   fig_18 (0.995). The number is the distance from the centre to the line after the ellipse is
   normalised to the unit circle; 1.000 means tangent, below 1 means it cuts. Any new
   ellipse-tangent figure should be built from a parameter θ — touch point (a cos θ, b sin θ),
   screen slope −(b/a)·cot θ — rather than eyeballed endpoints.
2. **Sideways parabolas are drawn with a horizontal tangent at the vertex** (fig_24; the same path
   shape appears benignly in figs 16/17, where the labels still land correctly). A y² = 4ax nose
   must leave the vertex vertically.
3. **Captions asserting what the drawing does not show** — fig_1 ("I is inside"), fig_7 ("the line
   to C") — are worth a sweep across the wider figure set.
