# Diff report — Maths-1A Chapter 6, Addition of Vectors (unit 6, `ts_ipe_m1a_vec_*` / `ts_ipe_m1a_av_*`)

Source: `answer-book/sources/chaitanya_m1a_ch06_addition_of_vectors.json` (34 questions)
Ours: `answer-book/wip/maths_gap/chaitanya_m1a_ch06_addition_of_vectors__ours.txt` (21 cards)

## Tally

**34 source questions = 18 matched + 0 elsewhere + 16 missing + 0 uncertain**

This agrees with the earlier independent pass's count of 16 MISSING — no disagreement to report.

Method note: for every unmatched source question I grepped the whole bank (`answer-book/questions/*.json`)
for the question's distinctive vector expression (e.g. `orthocentre`, `centroid`, `pentagon`, `AB = `,
`intercepts`, `1/3)(a + b + c`, etc.) and specifically checked unit 7 (Product of Vectors,
`ts_ipe_m1a_pv_*`) as the likely neighbour. No hits corresponded to any of the 16 missing questions —
all 16 are genuinely absent from the bank, not misfiled elsewhere.

## MISSING (16)

| ref | book section | stars | printed_page | stem (verbatim) | proposed_qtype | proposed question_id |
|---|---|---|---|---|---|---|
| vsaq4 | VSAQ | 1 | 60 | Find a unit vector in the direction of the sum of the vectors a = 2i + 2j − 5k and b = 2i + j + 3k. | VSAQ (2M) | `ts_ipe_m1a_vec_vsaq_unit_vector_sum_a_2i_2j_minus5k` |
| vsaq10 | VSAQ | 3 | 61 | The points A, B and C have position vectors −2i + j − k, −4i + 2j + 2k and 6i − 3j − 13k respectively, and AB = λ AC. Find the value of λ. | VSAQ (2M) | `ts_ipe_m1a_vec_vsaq_ab_lambda_ac` |
| vsaq11 | VSAQ | 3 | 61 | ABCDE is a pentagon. If the sum of the vectors AB, AE, BC, DC, ED and AC is λ AC, find the value of λ. | VSAQ (2M) | `ts_ipe_m1a_vec_vsaq_pentagon_lambda_ac` |
| vsaq12 | VSAQ | 1 | 61 | Find the position vector of the point C on AB produced such that AC = 3AB, where a and b are the position vectors of A and B respectively. | VSAQ (2M) | `ts_ipe_m1a_vec_vsaq_point_c_ac_3ab` |
| vsaq13 | VSAQ | 1 | 61 | Show that the points whose position vectors are −2a + 3b + 5c, a + 2b + 3c and 7a − c are collinear, where a, b, c are non-coplanar vectors. | VSAQ (2M) | `ts_ipe_m1a_vec_vsaq_collinear_minus2a_3b_5c` |
| vsaq14 | VSAQ | 0 | 61 | If a, b, c are the position vectors of the vertices A, B, C respectively of triangle ABC, find the vector equation of the median through the vertex A. | VSAQ (2M) | `ts_ipe_m1a_vec_vsaq_median_through_a` |
| vsaq16 | VSAQ | 3 | 62 | If G is the centroid of triangle ABC, show that GA + GB + GC = 0. | VSAQ (2M) | `ts_ipe_m1a_vec_vsaq_centroid_ga_gb_gc_zero` |
| saq2i | SAQ | 0 | 63 | If a, b, c are non-coplanar, test the collinearity of the points a − 2b + 3c, 2a + 3b − 4c and −7b + 10c. | SAQ (4M) | `ts_ipe_m1a_vec_collinear_test_a_minus2b_3c` |
| saq2ii | SAQ | 0 | 63 | If a, b, c are non-coplanar, test the collinearity of the points 3a − 4b + 3c, −4a + 5b − 6c and 4a − 7b + 6c. | SAQ (4M) | `ts_ipe_m1a_vec_collinear_test_3a_minus4b_3c` |
| saq5i | SAQ | 3 | 64 | In triangle ABC, O is the circumcentre and H is the orthocentre. Show that OA + OB + OC = OH. | SAQ (4M) | `ts_ipe_m1a_vec_circumcentre_orthocentre_sum` |
| saq5ii | SAQ | 3 | 64 | In triangle ABC, O is the circumcentre and H is the orthocentre. Show that HA + HB + HC = 2HO. | SAQ (4M) | `ts_ipe_m1a_vec_orthocentre_ha_hb_hc_2ho` |
| saq6ii | SAQ | 0 | 64 | Is the triangle formed by the vectors 3i + 5j + 2k, 2i − 3j − 5k and −5i − 2j + 3k equilateral? Explain. | SAQ (4M) | `ts_ipe_m1a_vec_equilateral_triangle_test` |
| saq6iii | SAQ | 1 | 64 | Find the angles made by the straight line passing through the points (1, −3, 2) and (3, −5, 1) with the coordinate axes. | SAQ (4M) | `ts_ipe_m1a_vec_direction_angles_two_points` |
| saq8 | SAQ | 3 | 65 | Using the vector method, prove that in the two-dimensional plane the equation of the line whose intercepts on the axes are a and b is x/a + y/b = 1. | SAQ (4M) | `ts_ipe_m1a_vec_intercept_form_line_proof` |
| saq9 | SAQ | 1 | 65 | Find the point of intersection of the line r = 2a + b + t(b − c) and the plane r = a + x(b + c) + y(a + 2b − c), where a, b, c are non-coplanar vectors. | SAQ (4M) | `ts_ipe_m1a_vec_line_plane_intersection` |
| saq10 | SAQ | 0 | 66 | In triangle ABC, a, b, c are the position vectors of the vertices A, B and C. Prove that the position vector of the centroid is (1/3)(a + b + c). | SAQ (4M) | `ts_ipe_m1a_vec_centroid_position_vector_proof` |

All 16 proposed ids were checked against `ls answer-book/questions/ | grep m1a_vec` and `grep m1a_av`
(20 existing `vec_*` ids + 1 `av_*` id, listed below under NOTES) — no collisions.

## MATCHED (18)

| ref | question_id |
|---|---|
| vsaq1 | `ts_ipe_m1a_vec_vsaq_collinear_m_n` |
| vsaq2 | `ts_ipe_m1a_vec_vsaq_collinear_lambda_mu` |
| vsaq3 | `ts_ipe_m1a_vec_vsaq_unit_vector_2i_3j_k` |
| vsaq5 | `ts_ipe_m1a_vec_vsaq_opposite_unit_vector` |
| vsaq6 | `ts_ipe_m1a_av_sqp_chain_od` |
| vsaq7 | `ts_ipe_m1a_vec_vsaq_line_two_points` |
| vsaq8 | `ts_ipe_m1a_vec_vsaq_plane_origin_points` |
| vsaq9 | `ts_ipe_m1a_vec_vsaq_plane_three_points` |
| vsaq15 | `ts_ipe_m1a_vec_vsaq_magnitude_seven` |
| saq1i | `ts_ipe_m1a_vec_coplanar_four_points_abc` |
| saq1ii | `ts_ipe_m1a_vec_coplanar_four_points_ijk` |
| saq1iii | `ts_ipe_m1a_vec_coplanar_6a_2b_minus_c` |
| saq1iv | `ts_ipe_m1a_vec_coplanar_2a_3b_minus_c` |
| saq3 | `ts_ipe_m1a_vec_coplanar_find_lambda` |
| saq4 | `ts_ipe_m1a_vec_hexagon_sum` |
| saq6i | `ts_ipe_m1a_vec_right_angled_triangle` |
| saq7 | `ts_ipe_m1a_vec_lines_intersect_minus_4c` |
| saq11 | `ts_ipe_m1a_vec_lines_intersect_a_plus_2b` |

## ELSEWHERE (0)

None. Unit 7 (`ts_ipe_m1a_pv_*`, Product of Vectors) was checked by keyword (orthocentre, centroid,
pentagon, collinearity, intercepts, skew lines, coordinate axes) — no unit-6 question surfaced there.

## UNCERTAIN (0)

None — every one of the 34 source refs classified cleanly as MATCHED or MISSING.

## NOTES

- **Printed defect on vsaq6 (MATCHED, not actionable):** the source book prints `BC = i + 2j − k`, but
  the source-index file itself flags this as a probable defect and records that our existing card
  `ts_ipe_m1a_av_sqp_chain_od` already carries the Telugu-Akademi value `BC = i + 2j − 2k`. No fix
  needed — the card already holds the corrected value; just don't "fix" it back to the printed one.
- **No duplicate source questions found.** Q1 (coplanarity, 4 point-sets) and Q2 (collinearity, 2
  point-sets) each carry genuinely distinct vector values across their parts.
- **No mathematically wrong or ill-posed stems found** among the 16 missing questions — spot-checked
  vsaq10 (AB = −¼AC, so λ is well-defined) and vsaq4's companion `ts_ipe_m1a_vec_ratio_789`-style
  ratio checks in the neighbouring chapter came back consistent; nothing here looked internally
  contradictory.
- **No triangle diagrams needed.** All 16 missing questions are algebraic vector-identity/position-vector
  problems (collinearity tests, section formula, centroid/median/circumcentre-orthocentre identities,
  line–plane intersection, intercept-form proof) — none depend on a drawn figure.
- **Three existing `vec_*` cards in our bank don't correspond to any of these 34 source refs** and were
  excluded from the matching (their vector values differ from every source stem, not just their
  wording): `ts_ipe_m1a_vec_rhombus_vertices`, `ts_ipe_m1a_vec_vsaq_unit_vector_a_plus_b` (different
  vector components than vsaq4 — a = i+2j+3k, b = 3i+j, vs. the source's a = 2i+2j−5k, b = 2i+j+3k),
  and `ts_ipe_m1a_vec_vsaq_line_point_parallel` (a different question type — line through a point
  parallel to a given vector — not a restatement of any printed vsaq7/8/9). These are presumably
  authored from a different source and are left untouched; they simply don't reduce the MISSING count.
