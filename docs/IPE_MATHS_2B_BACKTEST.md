# Senior Inter Maths-2B — Back-test against the book's five Guess Papers

**Scope.** 5 "Guess Papers" (Model Paper 1–5), printed pages 118–127 of
`DocScanner 01-Nov-2022 5-56 am.pdf` (Baby Bullet-Q, Sri Publishers), each 24 questions
(Q1–10 VSAQ/2, Q11–17 SAQ/4, Q18–24 LAQ/7) = **120 slots**, diffed against the 271 authored
cards in `answer-book/questions/ts_ipe_m2b_*.json` (manifest: `answer-book/units.json`,
8 units, `subject: "mathematics_2b"`). Matching key = the `Ans-Page` pointer printed beside
each question (`P <page>(<book-answer-number>)`), cross-checked against each card's
`verification.note` (which cites the same page/answer), then independently verified by
comparing the actual mathematics — not just the pointer — between the paper's question text
and the matched card's `question_text`.

## 1. Coverage summary

- **120 / 120 slots resolve to a real authored card.** Zero MISSING slots.
- **119 distinct cards** answer the 120 slots — one card
  (`ts_ipe_m2b_hyp_tangents_parallel_perp_line_y_eq_x_minus7_3x2_minus4y2_12`) legitimately
  answers two slots, because Paper 1 Q15 and Paper 5 Q15 print the *identical* question
  verbatim ("Find the equations of the tangents to the hyperbola 3x²−4y²=12 which are
  (a) Parallel to and (b) Perpendicular to the line y=x−7").
- **Unit weight on the model papers** (slot count / unit's total card count):

  | Unit | Slots hit | Unit bank size | Coverage of unit by model papers |
  |---|---|---|---|
  | Circle | 25 | 57 | 43.9% |
  | Integration | 20 | 51 | 39.2% |
  | Definite Integrals | 20 | 47 | 42.6% |
  | Differential Equations | 15 | 36 | 41.7% |
  | System of Circles | 10 | 23 | 43.5% |
  | Parabola | 10 | 20 | 50.0% |
  | Hyperbola | 10 (9 distinct) | 16 | 56.3% |
  | Ellipse | 10 | 21 | 47.6% |

  Circle carries the most raw model-paper weight (25/120 = ~21% of every paper), which
  tracks the book's own Blueprint — Circle is the biggest chapter in both VSAQ and LAQ.
  Hyperbola gets the highest *proportional* coverage of its own bank (9 of 16 cards, 56%).

- **Star Questions Plus (pp.96–102) slots**: exactly 4, as expected — Paper 4 Q1 (P97/199),
  Paper 5 Q2 (P97/201), Paper 5 Q9 (P102/217), Paper 5 Q19 (P96/196). All 4 resolve to real
  cards; Paper 5 Q9 carries a section/marks defect (see §4).
- **The missing-page-23 slot** (Paper 2 Q20, `P 23(10)`) resolves. Printed page 23 does not
  exist in this scan (numbering jumps 22 → 24), so the book's own hit-list answer 10 could not
  be read directly. The authored card `ts_ipe_m2b_par_through_points_axis_parallel_x_v1`
  reconstructs it independently and says so explicitly in its `verification.note` ("THE WORKED
  SOLUTION COULD NOT BE READ ... the solution below is independently derived"). Its sibling
  slot (`v2`, presumed answer 11, sourced from the Bullet Model Paper p.113 instead) is not a
  Guess-Paper-2 slot but is worth knowing about: it carries an honest `PRESUMED` flag for the
  same missing-page-23 reason.

## 2. MISSING slots

**None.** All 120 slots resolve to an authored card.

## 3. Wrong pointers found (verified against the mathematics, not just the page)

The task brief named three known-wrong pointers in the book; independent verification against
every matched card's actual question text confirms all three, with no others found beyond them:

| Slot | Printed pointer | Problem | Correct location | Card that answers it |
|---|---|---|---|---|
| **Paper 4 Q7** | `P 88(152)` | Wrong entirely. P88(152) is a *different* question — `∫[log(1+x)/(1+x)]dx` (which is genuinely what Paper 5 Q7 asks, and Paper 5's `P88(152)` pointer is correct). Paper 4 Q7 itself asks `∫eˣ(1+x·logx)/x dx`. | `P 86(141)` | `ts_ipe_m2b_int_vsaq_ex_1_plus_xlogx_over_x` — question text matches Paper 4 Q7 exactly. A correct card exists; only the printed pointer is wrong. |
| **Paper 2 Q2** | `P 69(110.1)` | Answer number right, page wrong. Page 69 in the authored set holds unrelated Definite-Integrals SAQ cards (√sinx/(√sinx+√cosx) family), nothing about a tangent length. | `P 79(110.1)` | `ts_ipe_m2b_cir_tangent_length_5_4_is_1_find_k` — "Find the value of k if the length of the tangent from (5,4) to x²+y²+2ky=0 is 1", exact match, correctly indexed at book p.79. |
| **Paper 3 Q7** | `P 87(140.1)` | Answer number right, page wrong. Page 87 holds Integration-VSAQ answers 145–151 (a different sub-range); 140.1 actually sits on page 86 next to its twin 140.2 (Paper 2 Q7). | `P 86(140.1)` | `ts_ipe_m2b_int_vsaq_ex_tanx_plus_log_secx` — "Evaluate ∫eˣ(tanx+logsecx)dx", exact match, correctly indexed at book p.86. |

All three have a correct card in the bank; the defect lives only in the printed Guess-Paper
pointer, and every one of the book's own cross-references inside the corresponding card's
`verification.note` already carries the correct page — i.e. the authoring pass got these three
right independently of the (wrong) Guess Paper pointer.

**One additional phrasing-variant worth flagging (not a hard error):** Paper 1 Q13 asks "Find
the length of major axis, minor axis, latus rectum, eccentricity of the ellipse of
9x²+16y²=144" and its pointer `P 57(58)` resolves correctly by page/answer number to
`ts_ipe_m2b_ell_ecc_foci_lr_directrices_9x2_16y2_144` — but that card's own headline final
answers are "eccentricity, coordinates of foci, length of latus rectum and equations of
directrices" (confirmed by its own `mark_split`: Eccentricity/Foci/LR/Directrices, 1 mark
each — the book's own printed split). Major-axis and minor-axis lengths are **not** an output
of this card; only `a` and `b` appear as intermediate working. No other card in the bank asks
for major/minor axis + latus rectum + eccentricity as final outputs, so this is either (a) the
Guess Paper's own loose paraphrase of chapter answer 58's stem, reusing the same worked
derivation, or (b) a genuine content gap — the model paper's literal final-answer set (major
axis, minor axis) is not what the matched card outputs. Flagging for a teacher to confirm
whether Paper 1 Q13 needs its own card or whether "same computation, different headline
labels" is acceptable.

## 4. Section / marks mismatches

**One real defect found**, at exactly the slot the task flagged for special attention
(the Star Questions Plus reconstructed slot):

| Slot | Expected (paper) | Card | Card's actual | Card question_id |
|---|---|---|---|---|
| **Paper 5 Q9**, `P 102(217)` | VSAQ, 2 marks | — | **SAQ, 4 marks** | `ts_ipe_m2b_di_saq_area_y_eq_x2_neg1_to_2` |

Detail: the question ("Find the area enclosed between the curve y=x², x-axis, x=−1, x=2") is
printed by the Guess Paper in **Section A** (VSAQ, 2 marks, all-compulsory). The book's own
page carries a `'DEFINITE INTEGRALS-VSAQ'` banner over this Star-Q+ answer too (per the card's
own `verification.note`). But the card was **deliberately authored as SAQ/4 marks** — the
note says explicitly: *"We classify this answer as SAQ shape, not VSAQ, for the same reason as
the neighbouring answer 216 — this classification is OURS."* That authorial reclassification
contradicts both the book's own banner and this Guess Paper's placement. This is a genuine
section/marks defect: either the card should be re-cut to VSAQ/2 (matching the book banner and
every Guess Paper that cites it), or — if the SAQ shape is intentional — the discrepancy with
the book's own banner should be documented in the note rather than silently overridden.

No other section/marks mismatches were found across the remaining 119 resolved slots — every
VSAQ slot (Q1–10 across all 5 papers) matched a card with `qtype: "VSAQ"` / `marks_total: 2`,
every SAQ slot (Q11–17) matched `qtype: "SAQ"` / `marks_total: 4`, and every LAQ slot (Q18–24)
matched `qtype: "LAQ"` / `marks_total: 7`, except the one row above.

## 5. Full slot-by-slot table (all 120)

| Paper | Q | Section | Pointer (as printed) | Card question_id | Flag |
|---|---|---|---|---|---|
| 1 | Q1 | VSAQ | P 77(103.1) | ts_ipe_m2b_cir_radius_4_find_a | - |
| 1 | Q2 | VSAQ | P 78(109.1) | ts_ipe_m2b_cir_concentric_through_minus2_14 | - |
| 1 | Q3 | VSAQ | P 80(117.1) | ts_ipe_m2b_sc_show_orthogonal_one | - |
| 1 | Q4 | VSAQ | P 82(121.1) | ts_ipe_m2b_par_point_focal_distance_y2_8x | - |
| 1 | Q5 | VSAQ | P 84(130) | ts_ipe_m2b_hyp_conjugate_eccentricity_reciprocal_identity | - |
| 1 | Q6 | VSAQ | P 87(145) | ts_ipe_m2b_int_vsaq_sec2x_csc2x | - |
| 1 | Q7 | VSAQ | P 86(139.1) | ts_ipe_m2b_int_vsaq_ex_sinx_plus_cosx | - |
| 1 | Q8 | VSAQ | P 90(169) | ts_ipe_m2b_di_vsaq_x2_over_1plusx2_0_to_1 | - |
| 1 | Q9 | VSAQ | P 92(176) | ts_ipe_m2b_di_vsaq_sin5xcos4x_0_to_pi2 | - |
| 1 | Q10 | VSAQ | P 93(181) | ts_ipe_m2b_de_orderdegree_d2y_dy3_pow65 | - |
| 1 | Q11 | SAQ | P 53(51.1) | ts_ipe_m2b_cir_pole_of_x_y_2_wrt_4x_6y_minus12 | - |
| 1 | Q12 | SAQ | P 54(53.2) | ts_ipe_m2b_sc_radical_centre_three_circles_two | - |
| 1 | Q13 | SAQ | P 57(58) | ts_ipe_m2b_ell_ecc_foci_lr_directrices_9x2_16y2_144 | see §3 phrasing note |
| 1 | Q14 | SAQ | P 59(63) | ts_ipe_m2b_ell_tangents_equal_intercepts_9x2_16y2_144 | - |
| 1 | Q15 | SAQ | P 66(79.2) | ts_ipe_m2b_hyp_tangents_parallel_perp_line_y_eq_x_minus7_3x2_minus4y2_12 | - |
| 1 | Q16 | SAQ | P 68(82) | ts_ipe_m2b_di_saq_a_sinx_plus_b_cosx_over_sinx_plus_cosx | - |
| 1 | Q17 | SAQ | P 72(92) | ts_ipe_m2b_de_separable_xy2_plus_x_dx | - |
| 1 | Q18 | LAQ | P 14(1.1) | ts_ipe_m2b_cir_circle_through_1_2_3_minus4_5_minus6 | - |
| 1 | Q19 | LAQ | P 19(5.3) | ts_ipe_m2b_cir_touch_externally_6x_2y_plus1 | - |
| 1 | Q20 | LAQ | P 22(9) | ts_ipe_m2b_par_standard_form_derivation | - |
| 1 | Q21 | LAQ | P 26(16.1) | ts_ipe_m2b_int_laq_reduction_sinn_hence_sin4 | - |
| 1 | Q22 | LAQ | P 31(24.2) | ts_ipe_m2b_int_laq_2cosx_plus_3sinx_over_4cosx_plus_5sinx | - |
| 1 | Q23 | LAQ | P 38(32.1) | ts_ipe_m2b_di_laq_xsinx_over_1plus_cos2x_0_to_pi | - |
| 1 | Q24 | LAQ | P 44(39.1) | ts_ipe_m2b_de_homogeneous_x2y2_dx_2xydy | - |
| 2 | Q1 | VSAQ | P 77(104.1) | ts_ipe_m2b_cir_centre_minus4_minus3_find_g_f_radius | - |
| 2 | Q2 | VSAQ | P 69(110.1) | ts_ipe_m2b_cir_tangent_length_5_4_is_1_find_k | **POINTER WRONG** — printed P69, correct P79; answer number correct (see §3) |
| 2 | Q3 | VSAQ | P 80(118.1) | ts_ipe_m2b_sc_radical_axis_one | - |
| 2 | Q4 | VSAQ | P 82(122) | ts_ipe_m2b_par_tangent_k_line_2y_5x_k | - |
| 2 | Q5 | VSAQ | P 84(131) | ts_ipe_m2b_hyp_conjugate_eccentricity_given_5_by_4 | - |
| 2 | Q6 | VSAQ | P 87(147) | ts_ipe_m2b_int_vsaq_dx_over_1_plus_cosx | - |
| 2 | Q7 | VSAQ | P 86(139.2) | ts_ipe_m2b_int_vsaq_ex_secx_plus_secx_tanx | - |
| 2 | Q8 | VSAQ | P 90(170) | ts_ipe_m2b_di_vsaq_x2_over_1plusx_0_to_4 | - |
| 2 | Q9 | VSAQ | P 92(179) | ts_ipe_m2b_di_vsaq_sin2xcos4x_neg_pi2_to_pi2 | - |
| 2 | Q10 | VSAQ | P 94(184) | ts_ipe_m2b_de_formde_acos3x_bsin3x | - |
| 2 | Q11 | SAQ | P 53(52) | ts_ipe_m2b_cir_conjugate_lines_find_k_kx_3y_minus1 | - |
| 2 | Q12 | SAQ | P 54(54.1) | ts_ipe_m2b_sc_common_chord_length_one | - |
| 2 | Q13 | SAQ | P 57(59) | ts_ipe_m2b_ell_ecc_foci_lr_directrices_shifted_center_2_neg1 | - |
| 2 | Q14 | SAQ | P 63(72) | ts_ipe_m2b_ell_director_circle_perpendicular_tangents | - |
| 2 | Q15 | SAQ | P 67(80) | ts_ipe_m2b_hyp_director_circle_perpendicular_tangents | - |
| 2 | Q16 | SAQ | P 70(86) | ts_ipe_m2b_di_saq_dx_over_4plus5cosx | - |
| 2 | Q17 | SAQ | P 72(93) | ts_ipe_m2b_de_substitution_y_minus_x_tan | - |
| 2 | Q18 | LAQ | P 17(4) | ts_ipe_m2b_cir_concyclic_find_c_2_0_0_1_4_5 | - |
| 2 | Q19 | LAQ | P 20(6) | ts_ipe_m2b_cir_direct_common_tangents_22x_minus4y | - |
| 2 | Q20 | LAQ | P 23(10) | ts_ipe_m2b_par_through_points_axis_parallel_x_v1 | reconstructed answer (printed p.23 missing from scan) — confirmed present |
| 2 | Q21 | LAQ | P 26(16.2) | ts_ipe_m2b_int_laq_reduction_cosn_hence_cos4 | - |
| 2 | Q22 | LAQ | P 30(23) | ts_ipe_m2b_int_laq_dx_over_3cosx_plus_4sinx_plus_6 | - |
| 2 | Q23 | LAQ | P 38(32.2) | ts_ipe_m2b_di_laq_xsin3x_over_1plus_cos2x_0_to_pi | - |
| 2 | Q24 | LAQ | P 46(41.1) | ts_ipe_m2b_de_homogeneous_x2y_minus_2xy2_dx | - |
| 3 | Q1 | VSAQ | P 78(106.1) | ts_ipe_m2b_cir_parametric_6x_4y_minus12 | - |
| 3 | Q2 | VSAQ | P 79(113.1) | ts_ipe_m2b_cir_conjugate_points_1_3_and_2_k | - |
| 3 | Q3 | VSAQ | P 81(119.2) | ts_ipe_m2b_sc_angle_between_circles_find | - |
| 3 | Q4 | VSAQ | P 82(125) | ts_ipe_m2b_par_focal_chord_other_extremity | - |
| 3 | Q5 | VSAQ | P 85(137) | ts_ipe_m2b_hyp_tangent_find_k_3x_minus4y_plus_k_x2_minus4y2_5 | - |
| 3 | Q6 | VSAQ | P 87(149.1) | ts_ipe_m2b_int_vsaq_sin_logx_over_x | - |
| 3 | Q7 | VSAQ | P 87(140.1) | ts_ipe_m2b_int_vsaq_ex_tanx_plus_log_secx | **POINTER WRONG** — printed P87, correct P86; answer number correct (see §3) |
| 3 | Q8 | VSAQ | P 91(173.1) | ts_ipe_m2b_di_vsaq_abs_1_minusx_0_to_2 | - |
| 3 | Q9 | VSAQ | P 92(180.2) | ts_ipe_m2b_di_vsaq_sin2xcos4x_0_to_2pi | - |
| 3 | Q10 | VSAQ | P 93(182) | ts_ipe_m2b_de_orderdegree_x12_d2y13 | - |
| 3 | Q11 | SAQ | P 50(45.2) | ts_ipe_m2b_cir_chord_length_x_3y_minus22_on_y_x_minus3 | - |
| 3 | Q12 | SAQ | P 55(55.1) | ts_ipe_m2b_sc_circle_on_chord_as_diameter_one | - |
| 3 | Q13 | SAQ | P 59(62) | ts_ipe_m2b_ell_tangents_parallel_perp_45deg_2x2_y2_8 | - |
| 3 | Q14 | SAQ | P 62(71) | ts_ipe_m2b_ell_tangent_normal_end_latus_rectum | - |
| 3 | Q15 | SAQ | P 66(78.1) | ts_ipe_m2b_hyp_centre_ecc_foci_lr_directrices_x2_minus4y2_4 | - |
| 3 | Q16 | SAQ | P 68(83) | ts_ipe_m2b_di_saq_cos_5by2x_over_sin_plus_cos_5by2x | - |
| 3 | Q17 | SAQ | P 72(94) | ts_ipe_m2b_de_linear_y_tanx_eq_cos3x | - |
| 3 | Q18 | LAQ | P 18(5.1) | ts_ipe_m2b_cir_centre_on_4x_3y_minus24_through_4_1_6_5 | - |
| 3 | Q19 | LAQ | P 21(7) | ts_ipe_m2b_cir_transverse_common_tangents_4x_10y_28 | - |
| 3 | Q20 | LAQ | P 25(14) | ts_ipe_m2b_par_area_triangle_inscribed_vertices | - |
| 3 | Q21 | LAQ | P 27(17.1) | ts_ipe_m2b_int_laq_reduction_tann_hence_tan5_tan6 | - |
| 3 | Q22 | LAQ | P 34(28) | ts_ipe_m2b_int_laq_x_plus_1_over_x2_plus_3x_plus_12 | - |
| 3 | Q23 | LAQ | P 40(34) | ts_ipe_m2b_di_laq_sin2x_over_cosx_plus_sinx | - |
| 3 | Q24 | LAQ | P 48(44.2) | ts_ipe_m2b_de_reducible_x_minus_y_plus3_over_2x_minus2y_plus5 | - |
| 4 | Q1 | VSAQ | P 97(199) | ts_ipe_m2b_cir_diameter_ends_4_2_and_1_5 | Star Q+ slot |
| 4 | Q2 | VSAQ | P 79(111) | ts_ipe_m2b_cir_power_of_point_minus1_1 | - |
| 4 | Q3 | VSAQ | P 80(116.1) | ts_ipe_m2b_sc_orthogonal_find_k_one | - |
| 4 | Q4 | VSAQ | P 82(124) | ts_ipe_m2b_par_tangent_inclined_60_degrees | - |
| 4 | Q5 | VSAQ | P 84(132) | ts_ipe_m2b_hyp_angle_between_asymptotes_general | - |
| 4 | Q6 | VSAQ | P 89(160) | ts_ipe_m2b_int_vsaq_x8_over_1_plus_x18 | - |
| 4 | Q7 | VSAQ | P 88(152) | ts_ipe_m2b_int_vsaq_ex_1_plus_xlogx_over_x | **POINTER WRONG** — printed P88(152) names a different question; correct is P86(141) (see §3) |
| 4 | Q8 | VSAQ | P 91(173.2) | ts_ipe_m2b_di_vsaq_abs_2_minusx_0_to_4 | - |
| 4 | Q9 | VSAQ | P 92(177) | ts_ipe_m2b_di_vsaq_sin6xcos4x_0_to_pi2 | - |
| 4 | Q10 | VSAQ | P 94(188) | ts_ipe_m2b_de_separable_dydx_exy | - |
| 4 | Q11 | SAQ | P 50(46) | ts_ipe_m2b_cir_midpoint_and_length_of_chord_2x_10y_1 | - |
| 4 | Q12 | SAQ | P 56(57.1) | ts_ipe_m2b_sc_orthogonal_circle_through_origin | - |
| 4 | Q13 | SAQ | P 60(64) | ts_ipe_m2b_ell_standard_form_foci_dist_2_lr_15by2 | - |
| 4 | Q14 | SAQ | P 61(67) | ts_ipe_m2b_ell_focus_1_neg1_e_2by3_directrix_xyplus2 | - |
| 4 | Q15 | SAQ | P 66(78.2) | ts_ipe_m2b_hyp_centre_ecc_foci_lr_directrices_16y2_minus9x2_144 | - |
| 4 | Q16 | SAQ | P 70(88) | ts_ipe_m2b_di_saq_x2_a2_minus_x2_3by2_neg_a_to_a | - |
| 4 | Q17 | SAQ | P 73(98) | ts_ipe_m2b_de_linear_1plusx2_dy_y_etaninvx | - |
| 4 | Q18 | LAQ | P 16(3) | ts_ipe_m2b_cir_concyclic_1_1_minus6_0_minus2_2_minus2_minus8 | - |
| 4 | Q19 | LAQ | P 19(5.4) | ts_ipe_m2b_cir_touch_internally_6x_9y_plus13 | - |
| 4 | Q20 | LAQ | P 25(15) | ts_ipe_m2b_par_area_triangle_tangent_points | - |
| 4 | Q21 | LAQ | P 27(17.2) | ts_ipe_m2b_int_laq_reduction_cotn_hence_cot4 | - |
| 4 | Q22 | LAQ | P 34(27) | ts_ipe_m2b_int_laq_2x_plus_5_over_sqrt_x2_minus_2x_plus_10 | - |
| 4 | Q23 | LAQ | P 41(35) | ts_ipe_m2b_di_laq_x_over_sinx_plus_cosx | - |
| 4 | Q24 | LAQ | P 48(44.1) | ts_ipe_m2b_de_reducible_2x_y_1_4x_2y_minus1 | - |
| 5 | Q1 | VSAQ | P 78(108.2) | ts_ipe_m2b_cir_centre_minus1_2_through_5_6 | - |
| 5 | Q2 | VSAQ | P 97(201) | ts_ipe_m2b_cir_polar_of_3_minus1_wrt_2x2_2y2_11 | Star Q+ slot |
| 5 | Q3 | VSAQ | P 80(116.2) | ts_ipe_m2b_sc_orthogonal_find_k_two | - |
| 5 | Q4 | VSAQ | P 83(126.1) | ts_ipe_m2b_par_vertex_focus_upward_3_minus2_3_1 | - |
| 5 | Q5 | VSAQ | P 84(133) | ts_ipe_m2b_hyp_eccentricity_given_asymptote_angle_30deg | - |
| 5 | Q6 | VSAQ | P 87(148) | ts_ipe_m2b_int_vsaq_1_plus_cos2x_over_1_minus_cos2x | - |
| 5 | Q7 | VSAQ | P 88(152) | ts_ipe_m2b_int_vsaq_log_1_plus_x_over_1_plus_x | pointer correct (confirms P88(152) is genuinely this question, not Paper 4 Q7's) |
| 5 | Q8 | VSAQ | P 91(171) | ts_ipe_m2b_di_vsaq_dx_over_x2_plusa2_0_to_a | - |
| 5 | Q9 | VSAQ | P 102(217) | ts_ipe_m2b_di_saq_area_y_eq_x2_neg1_to_2 | **SECTION+MARKS MISMATCH** — card is SAQ/4, slot is VSAQ/2 (see §4); Star Q+ slot |
| 5 | Q10 | VSAQ | P 94(189) | ts_ipe_m2b_de_substitution_dydx_plus1_exy | - |
| 5 | Q11 | SAQ | P 52(49) | ts_ipe_m2b_cir_tangent_at_3_minus1_and_parallel_tangent | - |
| 5 | Q12 | SAQ | P 55(56) | ts_ipe_m2b_sc_circle_through_intersection_and_point | - |
| 5 | Q13 | SAQ | P 63(73) | ts_ipe_m2b_ell_auxiliary_circle_foot_of_perpendicular | - |
| 5 | Q14 | SAQ | P 65(77) | ts_ipe_m2b_ell_stb_equilateral_triangle_eccentricity | - |
| 5 | Q15 | SAQ | P 66(79.2) | ts_ipe_m2b_hyp_tangents_parallel_perp_line_y_eq_x_minus7_3x2_minus4y2_12 | same card as Paper 1 Q15 (identical question, legitimate reuse) |
| 5 | Q16 | SAQ | P 69(85) | ts_ipe_m2b_di_saq_sqrt_sinx_over_sqrt_sinx_plus_sqrt_cosx | - |
| 5 | Q17 | SAQ | P 75(102) | ts_ipe_m2b_de_linear_xlogx_dy_y_eq_2logx | - |
| 5 | Q18 | LAQ | P 14(1.2) | ts_ipe_m2b_cir_circle_through_3_4_3_2_1_4 | - |
| 5 | Q19 | LAQ | P 96(196) | ts_ipe_m2b_cir_centre_on_x_axis_through_minus2_3_4_5 | Star Q+ slot |
| 5 | Q20 | LAQ | P 24(13) | ts_ipe_m2b_par_common_tangents_circle_2a2 | - |
| 5 | Q21 | LAQ | P 28(18.1) | ts_ipe_m2b_int_laq_reduction_secn_hence_sec5 | - |
| 5 | Q22 | LAQ | P 37(31) | ts_ipe_m2b_int_laq_sqrt_5_minus_x_over_x_minus_2 | - |
| 5 | Q23 | LAQ | P 42(36.2) | ts_ipe_m2b_di_laq_log_1plusx_over_1plusx2_0_to_1 | - |
| 5 | Q24 | LAQ | P 45(40.2) | ts_ipe_m2b_de_curve_xsin2_yx_dx_ydx_minus_xdy | - |

## 6. Judgement

**Structurally, this paper is complete against its own five model papers.** All 120
question slots that the book's Guess Papers put in front of a Telangana IPE Maths-2B student
resolve to a real, matching authored card — zero MISSING slots, and independent verification
of the mathematics (not just the printed pointer) confirms every match is a genuine same-question
pairing, with one legitimate cross-paper reuse (the Q15 hyperbola-tangent question appears
verbatim in two of the five papers).

Two things keep this from being an unqualified pass:

1. **One real defect**: Paper 5 Q9 / `P 102(217)` — the matched card
   (`ts_ipe_m2b_di_saq_area_y_eq_x2_neg1_to_2`) is authored SAQ/4-marks, but both this Guess
   Paper and the book's own printed VSAQ banner over that answer place it at VSAQ/2-marks. This
   is the one slot this back-test flags for a fix — the card should either move to VSAQ/2 marks
   or the note should explain why it deliberately overrides the book's own section banner.
2. **Three pointer errors in the source book itself**, all pre-flagged by the task brief and
   all confirmed here by checking the mathematics: Paper 4 Q7's pointer is wrong outright
   (names a different question); Paper 2 Q2's and Paper 3 Q7's pointers have the right answer
   number but the wrong page. None of these are authoring defects — a correct card exists for
   all three, correctly indexed at the true page in every case — but they are worth recording
   so nobody re-derives the "book is wrong here" finding from scratch. A fourth, softer case
   (Paper 1 Q13's "major axis/minor axis" phrasing vs. the matched card's "foci/directrices"
   headline outputs) is flagged as a phrasing variant for a teacher to confirm, not a hard
   defect, since the pointer itself resolves correctly.

This back-test corpus has real limits the task brief already named: it is the book's own
guess-paper compilation, not an independent board paper, so it cannot catch an error the book
and the authored card share, and it says nothing about the ~57–79% of each unit's bank the
five model papers never touch. Within those limits, the paper passes.
