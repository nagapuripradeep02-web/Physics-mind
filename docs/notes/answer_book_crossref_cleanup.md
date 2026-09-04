# Book answer-number cross-references in student-facing text

Found by the 2026-08-30 Vidi audit. The product never shows the source book’s
answer numbers, so a pointer like “as in answer 22” names something the reader
cannot look up. Vidi is grounded on these fields and can repeat them verbatim.

Three were fixed in commit 42cf9048 (the ones graders caught in replies). The rest
need reading, not a regex — each pointer has to be replaced by what it points AT.

| subject | card | field | pointer |
|---|---|---|---|
| mathematics | ts_ipe_m1a_fn_domain_one_over_root_x2_minus_a2 | s2_domain.why | from question 95.1 |
| mathematics | ts_ipe_m1a_pt_a_cos_sq_half | s3_use_the_sin2a_identity.why | Unit 6 answer 26.1 |
| mathematics | ts_ipe_m1a_pt_a_eq_b_plus_c_cos | s3_introduce_the_half_angle.why | answer 34.2 |
| mathematics | ts_ipe_m1a_pt_r1_over_bc | s3_use_the_half_angle_sum_ide.why | Unit 6 answer 27.1 |
| mathematics | ts_ipe_m1a_pv_distance_ab_cd | s2_lines.why | from answer 23 |
| mathematics | ts_ipe_m1a_tr_cos_half_squares | s4_factor.why | answer 26.2 |
| mathematics | ts_ipe_m1a_tr_cos_s_minus_a | s4_factor.why | used in answers 26.2 |
| mathematics | ts_ipe_m1a_tr_sin_s_minus_a | s5_final.why | as in answer 29 |
| mathematics | ts_ipe_m1a_tr_vsaq_tan160_tan110 | s2_answer.why | answers 132.1 |
| mathematics_1b | ts_ipe_m1b_pl_check_2x2_minus_13xy | s2_delta.why | proved in answer 10 |
| mathematics_1b | ts_ipe_m1b_pl_check_3x2_7xy_2y2 | s2_delta.why | proved in answer 10 |
| mathematics_1b | ts_ipe_m1b_pl_sqp_product_perpendiculars_origin | s2_both_distances.why | chapter answer 8 |
| mathematics_1b | ts_ipe_m1b_pl_sqp_product_perpendiculars_origin | s3_multiply.why | chapter answer 8 |
| mathematics_1b | ts_ipe_m1b_pl_sqp_product_perpendiculars_origin | s4_convert.margin_note | chapter answer 8 |
| mathematics_2a | ts_ipe_m2a_pb_union_0_65_intersection_0_15_complements_sum | insider_note | answer 1.2 |
| mathematics_2a | ts_ipe_m2a_pc_vsaq_9c3_9c5_10cr_find_r | s2_pascal.why | answer 143.1 |
| mathematics_2b | ts_ipe_m2b_de_separable_x_plus_ydydx_eq0 | insider_note | used in answer 186 |
| mathematics_2b | ts_ipe_m2b_de_separable_x_plus_ydydx_eq0 | s2_integrate_finish.memory_tip | used in answer 186 |
| mathematics_2b | ts_ipe_m2b_di_laq_log_1plusx_over_1plusx2_0_to_1 | s3_final.common_mistakes | question 36.1 |
| mathematics_2b | ts_ipe_m2b_int_laq_2cosx_plus_3sinx_over_4cosx_plus_5sinx | insider_note | answer 24.1 |
| mathematics_2b | ts_ipe_m2b_int_laq_2cosx_plus_3sinx_over_4cosx_plus_5sinx | s1_setup.why | answer 24.1 |
| mathematics_2b | ts_ipe_m2b_int_laq_3x_minus_2_sqrt_2x2_minus_x_plus_1 | s2_split.memory_tip | from answer 27 |
| mathematics_2b | ts_ipe_m2b_int_laq_6x_plus_5_sqrt_6_minus_2x2_plus_x | insider_note | used in answer 29 |
| mathematics_2b | ts_ipe_m2b_int_laq_6x_plus_5_sqrt_6_minus_2x2_plus_x | s3_square.memory_tip | as in answer 29 |
| mathematics_2b | ts_ipe_m2b_int_laq_cosx_plus_3sinx_plus_7_over_cosx_plus_sinx_plus_1 | s1_setup.why | from answer 25 |
| mathematics_2b | ts_ipe_m2b_int_laq_cosx_plus_3sinx_plus_7_over_cosx_plus_sinx_plus_1 | s2_split.why | as in answer 25 |
| mathematics_2b | ts_ipe_m2b_int_laq_dx_over_3cosx_plus_4sinx_plus_6 | s1_sub.common_mistakes | as in answer 22 |
| mathematics_2b | ts_ipe_m2b_int_laq_dx_over_4cosx_plus_3sinx | s3_square.why | like answer 20 |
| mathematics_2b | ts_ipe_m2b_int_laq_dx_over_4x2_minus_4x_minus_7 | insider_note | used in answer 19 |
| mathematics_2b | ts_ipe_m2b_int_laq_practice_dx_over_5_minus_2x2_plus_4x | s3_formula.common_mistakes | from answer 20 |
| mathematics_2b | ts_ipe_m2b_int_laq_sqrt_5_minus_x_over_x_minus_2 | s2_setup.why | from answer 27 |
| mathematics_2b | ts_ipe_m2b_int_laq_x_plus_1_over_x2_plus_3x_plus_12 | insider_note | like answer 27 |
| mathematics_2b | ts_ipe_m2b_int_laq_x_plus_1_over_x2_plus_3x_plus_12 | s2_split.memory_tip | from answer 27 |
| mathematics_2b | ts_ipe_m2b_int_vsaq_1_over_sqrt_sin_inv_x_sqrt_1_minus_x2 | insider_note | from answer 154 |
| mathematics_2b | ts_ipe_m2b_int_vsaq_dx_over_xlogx_loglogx | insider_note | from answer 150 |
| mathematics_2b | ts_ipe_m2b_int_vsaq_ex_sin_ex | s2_final.memory_tip | answers 149.1 |
| mathematics_2b | ts_ipe_m2b_int_vsaq_sin_tan_inv_x_over_1_plus_x2 | s2_final.memory_tip | answer 149.1 |
| mathematics_2b | ts_ipe_m2b_par_area_triangle_tangent_points | s3_final.common_mistakes | as in answer 14 |
| mathematics_2b | ts_ipe_m2b_sc_circle_through_two_points_orthogonal | insider_note | answer 53.2 |
| mathematics_2b | ts_ipe_m2b_sc_circle_through_two_points_orthogonal | s3_orthogonal_condition.memory_tip | answer 53.2 |
| mathematics_2b | ts_ipe_m2b_sc_find_k_given_angle_45 | s1_centres_radii_distance.memory_tip | answer 119.2 |
| mathematics_2b | ts_ipe_m2b_sc_orthogonal_circle_through_1_1 | insider_note | answers 57.1 |
| physics_2 | ts_ipe_p2_mag_earth_field_from_h | insider_note | answer 1.3 |

Total: 43 sites across 35 cards.
