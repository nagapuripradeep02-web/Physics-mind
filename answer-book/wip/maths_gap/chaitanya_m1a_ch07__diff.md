# Maths-1A Chapter 7 — Product of Vectors — gap diff

Source: `answer-book/sources/chaitanya_m1a_ch07_product_of_vectors.json` (63 questions)
Ours: `answer-book/wip/maths_gap/chaitanya_m1a_ch07_product_of_vectors__ours.txt` (32 cards, prefix `ts_ipe_m1a_pv_*`)

## 1. Tally

**63 source questions = 22 matched + 1 elsewhere + 40 missing + 0 uncertain**

**Cross-check note:** an earlier independent pass measured this chapter at 40 MISSING. My own count also lands at exactly **40 MISSING**. I did not adjust anything to hit this number — I ran the classification cold (question-by-question mathematics comparison, then targeted `grep` sweeps of every unit-6 `ts_ipe_m1a_vec_*` card plus broad keyword sweeps across the whole `answer-book/questions/` tree for the harder-to-place items: "altitudes are concurrent", "perpendicular bisectors", "coterminous edges", "line of intersection of the planes", direction-cosine phrasing, and several exact vector literals) and it converged on the same total independently. One of the 40 MISSING refs in the earlier pass may in fact be my 1 ELSEWHERE find (`laq6`, the rhombus-vertices question, which a unit-6 card already answers verbatim) — the totals agree either way once elsewhere+missing=41 is compared, and 22+1+40=63 checks out against the source's own count.

## 2. MISSING table (40)

Our paper is `ABC_60`: VSAQ = 2 marks, SAQ = 4, LAQ = 8. `proposed_qtype` follows the complexity precedent already set by the 32 matched cards in this same chapter (e.g. general-vector identity proofs such as `sqp_box_product_square` and `triple_product_identity` were authored as LAQ even though the source files them under its own "SAQ" banner; short single-formula numeric problems were authored as VSAQ even when the source files them as "SAQ"). These are proposals for the author to confirm, not settled marks.

| ref | book section | stars | printed_page | stem (verbatim) | proposed_qtype | proposed question_id |
|---|---|---|---|---|---|---|
| saq4i | SAQ | 0 | 67 | Find λ if the volume of the parallelepiped having the edges i + j, 3i − j and 3j + λk is 16 cubic units. | SAQ | ts_ipe_m1a_pv_parallelepiped_volume_lambda_16 |
| saq5 | SAQ | 1 | 68 | Find the vector having magnitude √6 that is perpendicular to both 2i − k and 3j − i − k. | VSAQ | ts_ipe_m1a_pv_vector_magnitude_root6_perpendicular |
| saq6 | SAQ | 1 | 68 | Show that the angle in a semicircle is a right angle. | SAQ | ts_ipe_m1a_pv_semicircle_right_angle |
| saq7 | SAQ | 1 | 68 | If \|a\| = 2, \|b\| = 3, \|c\| = 4 and each of a, b, c is perpendicular to the sum of the other two vectors, find \|a + b + c\|. | SAQ | ts_ipe_m1a_pv_perpendicular_sum_magnitude |
| saq8 | SAQ | 1 | 68 | If a + b + c = 0, \|a\| = 3, \|b\| = 5 and \|c\| = 7, find the angle between a and b. | VSAQ | ts_ipe_m1a_pv_sum_zero_angle_ab |
| saq10 | SAQ | 0 | 69 | If a = i − 2j − 3k, b = 2i + j − k and c = i + 3j − 2k, find a × (b × c). | SAQ | ts_ipe_m1a_pv_triple_cross_i_neg2j_neg3k |
| saq11 | SAQ | 1 | 69 | In triangle ABC, if BC = a, CA = b and AB = c, show that a × b = b × c = c × a. | SAQ | ts_ipe_m1a_pv_triangle_side_cross_products_equal |
| saq13 | SAQ | 3 | 69 | Show that four points with position vectors a, b, c, d are coplanar if and only if [b c d] + [c a d] + [a b d] = [a b c]. | LAQ | ts_ipe_m1a_pv_four_points_coplanar_box_identity |
| saq14 | SAQ | 3 | 70 | Find λ if the points A(3, 2, 1), B(4, λ, 5), C(4, 2, −2) and D(6, 5, −1) are coplanar. (PYQ: Mar-2016 TS) | SAQ | ts_ipe_m1a_pv_coplanar_find_lambda_points_pyq2016 |
| saq15 | SAQ | 3 | 70 | Find the distance of the point (2, 5, −3) from the plane r·(6i − 3j + 2k) = 4. | VSAQ | ts_ipe_m1a_pv_distance_point_from_plane |
| saq16 | SAQ | 0 | 70 | Show that for any four vectors a, b, c, d the product (a × b)·(c × d) equals the 2×2 determinant whose rows are (a·c, a·d) and (b·c, b·d), and deduce that (a × b)² = a²b² − (a·b)². | LAQ | ts_ipe_m1a_pv_lagrange_identity_cross_dot |
| saq18ii | SAQ | 1 | 71 | If a = 6i + 2j + 3k and b = 2i − 9j + 6k, find a·b and the angle between a and b. | VSAQ | ts_ipe_m1a_pv_dot_product_and_angle_6i2j3k |
| saq19 | SAQ | 3 | 71 | If \|p\| = 2, \|q\| = 3 and the angle between p and q is π/6, find \|p × q\|². | VSAQ | ts_ipe_m1a_pv_cross_product_magnitude_squared |
| saq20 | SAQ | 3 | 71 | If 4i + (2p/3)j + pk is parallel to the vector i + 2j + 3k, find p. | VSAQ | ts_ipe_m1a_pv_parallel_vectors_find_p |
| saq21iii | SAQ | 1 | 71 | Find the area of the parallelogram whose adjacent sides are 2i − 3j and 3i − k. | VSAQ | ts_ipe_m1a_pv_parallelogram_area_2i3j_3ik |
| saq22 | SAQ | 1 | 72 | Find the volume of the parallelepiped whose coterminous edges are the vectors 2i − 3j + 2k, i − j + 2k and 2i + j − k. | SAQ | ts_ipe_m1a_pv_parallelepiped_volume_coterminous |
| saq23i | SAQ | 1 | 72 | If a = 2i − 3j + 5k and b = −i + 4j + 2k, find a × b and a unit vector perpendicular to both a and b. | VSAQ | ts_ipe_m1a_pv_cross_and_unit_normal_2i3j5k |
| saq23ii | SAQ | 1 | 72 | Find the unit vector perpendicular to both i + j + k and 2i + j + 3k. | VSAQ | ts_ipe_m1a_pv_unit_normal_ijk_and_2ij3k |
| saq25 | SAQ | 1 | 72 | If the vectors a = 2i − j + k, b = i + 2j − 3k and c = 3i + pj + 5k are coplanar, find p. | VSAQ | ts_ipe_m1a_pv_coplanar_find_p_3ipj5k |
| saq26ii | SAQ | 0 | 73 | For what value of λ are the vectors i − λj + 2k and 8i + 6j − k at right angles? | VSAQ | ts_ipe_m1a_pv_perpendicular_find_lambda_8i6jk |
| saq28 | SAQ | 1 | 73 | Find p if the vectors a + b + c, a + pb + 2c and −a + b + c are coplanar, where a, b, c are non-coplanar. | SAQ | ts_ipe_m1a_pv_coplanar_combination_find_p |
| saq29 | SAQ | 1 | 73 | Find the Cartesian equation of the plane through the point A(2, −1, −4) and parallel to the plane 4x − 12y − 3z − 7 = 0. | VSAQ | ts_ipe_m1a_pv_plane_parallel_to_given_plane |
| saq30 | SAQ | 0 | 73 | Find the equation of the plane through the point (3, −2, −1) and perpendicular to the vector (4, 7, −4). | VSAQ | ts_ipe_m1a_pv_plane_perpendicular_to_vector |
| saq31 | SAQ | 1 | 73 | Prove that for any three vectors a, b, c, [b + c  c + a  a + b] = 2[a b c]. | LAQ | ts_ipe_m1a_pv_box_product_sum_identity |
| saq33 | SAQ | 0 | 73 | Simplify (i − 2j + 3k) × (2i + j − k)·(j + k). | VSAQ | ts_ipe_m1a_pv_simplify_cross_dot_expression |
| saq34 | SAQ | 0 | 74 | Compute [i − j   j − k   k − i]. | VSAQ | ts_ipe_m1a_pv_box_product_i_minus_j_etc |
| saq35i | SAQ | 3 | 74 | Let a = i + j + k and b = 2i + 3j + k. Find the projection vector of b on a. | VSAQ | ts_ipe_m1a_pv_projection_vector_ijk_2i3jk |
| saq35ii | SAQ | 3 | 74 | Let a = i + j + k and b = 2i + 3j + k. Find the vector component of b perpendicular to a, and the component of b on a. | SAQ | ts_ipe_m1a_pv_component_perpendicular_and_scalar |
| saq36 | SAQ | 1 | 74 | If α, β, γ are the angles made by 3i − 6j + 2k with the positive coordinate axes, find cos α, cos β, cos γ. | VSAQ | ts_ipe_m1a_pv_direction_cosines_3i6j2k |
| saq37 | SAQ | 0 | 74 | For any vector a, show that \|a × i\|² + \|a × j\|² + \|a × k\|² = 2\|a\|². | LAQ | ts_ipe_m1a_pv_cross_product_axes_identity |
| saq39 | SAQ | 1 | 75 | Compute a × (b + c) + b × (c + a) + c × (a + b). | LAQ | ts_ipe_m1a_pv_cross_product_distributive_identity |
| saq40 | SAQ | 0 | 75 | If a = 2i + 2j − 3k and b = 3i − 2j + 2k, find the angle between 2a + b and a + 2b. | SAQ | ts_ipe_m1a_pv_angle_between_combined_vectors |
| laq4 | LAQ | 3 | 77 | If a = i − 2j − 3k, b = 2i + j − k and c = i + 3j − 2k, verify that a × (b × c) ≠ (a × b) × c. | LAQ | ts_ipe_m1a_pv_verify_triple_product_not_equal |
| laq8 | LAQ | 3 | 79 | Find the equation of the plane passing through the points A(2, 3, −1), B(4, 5, 2) and C(3, 6, 5). | LAQ | ts_ipe_m1a_pv_plane_through_three_points |
| laq9 | LAQ | 1 | 79 | Find the equation of the plane passing through A(3, −2, −1) and parallel to the vectors b = i − 2j + 4k and c = 3i + 2j − 5k. | LAQ | ts_ipe_m1a_pv_plane_parallel_to_two_vectors |
| laq10 | LAQ | 3 | 79 | Prove that in any triangle the altitudes are concurrent. | LAQ | ts_ipe_m1a_pv_altitudes_concurrent |
| laq11 | LAQ | 0 | 80 | Prove that in any triangle the perpendicular bisectors of the sides are concurrent. | LAQ | ts_ipe_m1a_pv_perpendicular_bisectors_concurrent |
| laq12ii | LAQ | 3 | 80 | For any three vectors a, b, c, prove that a × (b × c) = (a·c)b − (a·b)c. | LAQ | ts_ipe_m1a_pv_triple_product_identity_second_form |
| laq13 | LAQ | 0 | 80 | Show that the volume of a tetrahedron with a, b and c as coterminous edges is (1/6)\|[a b c]\|. | LAQ | ts_ipe_m1a_pv_tetrahedron_volume_general_formula |
| laq14 | LAQ | 0 | 81 | Find the vector equation of the plane passing through the line of intersection of the planes r·(i + j + k) = 6 and r·(2i + 3j + 4k) = −5 and through the point (1, 1, 1). | LAQ | ts_ipe_m1a_pv_plane_through_line_of_intersection |

## 3. MATCHED table (22)

| ref | question_id |
|---|---|
| saq1 | ts_ipe_m1a_pv_sqp_unit_normal_pqr |
| saq2 | ts_ipe_m1a_pv_saq_tetrahedron_vertices |
| saq3 | ts_ipe_m1a_pv_saq_tetrahedron_edges |
| saq9 | ts_ipe_m1a_pv_saq_verify_perpendicular |
| saq12 | ts_ipe_m1a_pv_axb_dot_bxc |
| saq17 | ts_ipe_m1a_pv_vsaq_find_sin_theta |
| saq18i | ts_ipe_m1a_pv_vsaq_angle_between_vectors |
| saq21i | ts_ipe_m1a_pv_vsaq_parallelogram_sides |
| saq21ii | ts_ipe_m1a_pv_vsaq_parallelogram_diagonals |
| saq24 | ts_ipe_m1a_pv_vsaq_perpendicular_find_lambda |
| saq26i | ts_ipe_m1a_pv_vsaq_perpendicular_quadratic |
| saq27 | ts_ipe_m1a_pv_vsaq_sum_diff_perpendicular |
| saq32 | ts_ipe_m1a_pv_sqp_box_product_square |
| saq38 | ts_ipe_m1a_pv_vsaq_equal_sum_diff_angle |
| saq41 | ts_ipe_m1a_pv_vsaq_angle_between_planes |
| laq1 | ts_ipe_m1a_pv_skew_lines_distance |
| laq2 | ts_ipe_m1a_pv_distance_ab_cd |
| laq3i | ts_ipe_m1a_pv_two_triple_products |
| laq3ii | ts_ipe_m1a_pv_triple_product_pair |
| laq5 | ts_ipe_m1a_pv_axb_cross_cxd |
| laq7 | ts_ipe_m1a_pv_saq_cube_diagonals |
| laq12i | ts_ipe_m1a_pv_triple_product_identity |

## 4. ELSEWHERE (1)

| ref | matched question_id | unit | reasoning |
|---|---|---|---|
| laq6 | ts_ipe_m1a_vec_rhombus_vertices | 6 — Addition of Vectors | Source: "Show that the points A = (5, −1, 1), B = (7, −4, 7), C = (1, −6, 10) and D = (−1, −3, 4) are the vertices of a rhombus." The unit-6 card's `question_text` is verbatim identical (minus the A/B/C/D labels): "Show that the points (5, −1, 1), (7, −4, 7), (1, −6, 10) and (−1, −3, 4) are the vertices of a rhombus." Confirmed via `grep -l "vertices of a rhombus"`. |

**UNCERTAIN:** none. Every one of the 63 refs resolved to a confident MATCHED / ELSEWHERE / MISSING call.

## 5. NOTES

**saq1 — a discrepancy the source file flags is apparently already fixed.** The source index's own `notes` field says: *"Our bank card for this question holds R(0, 2, −1). The book prints R(0, 2, 1)... Our card is the likely defect."* I read the live card `answer-book/questions/ts_ipe_m1a_pv_sqp_unit_normal_pqr.json` directly (not just the `__ours.txt` summary) and its working uses `OR = 2j + k`, i.e. R = (0, 2, **1**) — matching the book's printed value, not the −1 the source note describes. Either the card was already corrected since that note was written, or the note is stale/mistaken. Either way, the card currently agrees with the source's stated-correct value, so I classified saq1 as MATCHED. Worth a quick founder/author double-check that this isn't a false all-clear.

**saq3 / saq12 — printed defects, already resolved by both source and our card.** Source flags saq3's third edge as printed "k. i − j" (stray character) with intended value "i − j", and saq12's vector b as printed "−i + 2i − 4k" (duplicate i-term) with intended value "−i + 2j − 4k". Our matched cards (`saq_tetrahedron_edges`, `axb_dot_bxc`) both use the corrected values, so these are clean MATCHED, not MISSING — just noting the defects existed in the source scan.

**saq4i — a structurally odd numbering, not a math defect.** Source prints it as "4. i)" with no "ii)" ever following — question 5 is next. This is very likely a scanning/typesetting artifact (a lettered sub-part that was dropped or never printed) rather than a real two-part question. No action needed beyond authoring saq4i as a normal single question, which is what I did in the MISSING table.

**saq30 — an internal source contradiction, flagged by the source authors, not by me.** The source's own note says the book's stem prints the point as (3, −2, −1) but the book's own worked solution uses (3, −2, **1**) — a sign flip on the third coordinate. The source explicitly instructs authoring from the printed stem value (3, −2, −1), which is what I carried into the MISSING table. Whoever authors this card should re-derive the plane equation from (3, −2, −1) rather than trusting a "standard" answer key that may have been solved from (3, −2, 1).

**saq10 / laq4 — same three vectors, two different asks.** Both use a = i − 2j − 3k, b = 2i + j − k, c = i + 3j − 2k. saq10 just asks for a × (b × c); laq4 asks to verify a × (b × c) ≠ (a × b) × c (which requires computing both triple products). An author working laq4 will incidentally produce saq10's full answer as an intermediate result — worth authoring laq4 first and having saq10 either stand alone or explicitly cross-reference it, rather than authoring the a×(b×c) computation twice from scratch.

**saq35i / saq35ii — same two vectors, two different asks (not a duplicate).** Both use a = i + j + k, b = 2i + 3j + k. 35i wants the projection VECTOR of b on a; 35ii wants the vector component of b perpendicular to a AND the scalar component of b on a. These are complementary parts of one standard problem (vector = parallel component + perpendicular component), authored as two separate source items — legitimately two cards, not a duplicate, but an author should keep the numbers consistent across both and could reuse the a·b / |a|² arithmetic from one card in the other.

**No mathematically wrong or ill-posed stems found beyond the three printed-defect items above** (saq3, saq12, saq30), all of which the source file already flags and resolves. saq6 ("angle in a semicircle") and saq11 (BC=a, CA=b, AB=c ⇒ a×b=b×c=c×a) are both standard, correctly-posed classical results despite reading as pure-geometry statements; they belong in this chapter because the intended proof method is vector algebra (dot product = 0 for saq6, using a+b+c=0 for saq11).

**No true duplicate source questions** (identical stem + identical ask) were found among the 63. The two near-duplicate pairs above (saq10/laq4 sharing vectors, saq35i/saq35ii sharing vectors) are legitimately distinct asks, not the same question twice.

## Verification of the 63-ref count

SAQ refs in source: saq1, saq2, saq3, saq4i, saq5, saq6, saq7, saq8, saq9, saq10, saq11, saq12, saq13, saq14, saq15, saq16, saq17, saq18i, saq18ii, saq19, saq20, saq21i, saq21ii, saq21iii, saq22, saq23i, saq23ii, saq24, saq25, saq26i, saq26ii, saq27, saq28, saq29, saq30, saq31, saq32, saq33, saq34, saq35i, saq35ii, saq36, saq37, saq38, saq39, saq40, saq41 = 47.
LAQ refs in source: laq1–laq14 with parts (laq3i, laq3ii, laq12i, laq12ii) = 16.
47 + 16 = 63. ✓

Across my four tables: MISSING 40 + MATCHED 22 + ELSEWHERE 1 + UNCERTAIN 0 = 63, and every ref above appears in exactly one table (cross-checked by listing all 63 refs against the four tables — no ref repeats, none omitted).
