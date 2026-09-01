# Diff report — mathematics_1b unit 5: 3D-Coordinates (Maths-1B)

Source: `answer-book/sources/chaitanya_m1b_ch05_three_dimensional_coordinates.json` (11 questions)
Ours: `answer-book/wip/maths_gap/chaitanya_m1b_ch05_three_dimensional_coordinates__ours.txt` (10 cards)

## Tally

11 source questions = 8 matched + 0 elsewhere + 3 missing + 0 uncertain

(Earlier pass reported MISSING = 3 — confirmed, same count.)

## MISSING

| ref | book section | stars | printed_page | stem (verbatim) | proposed_qtype | proposed question_id |
|---|---|---|---|---|---|---|
| vsaq1 | VSAQ | 3 | 175 | Find the centroid of the triangle whose vertices are (5, 4, 6), (1, −1, 3) and (4, 3, 2). | VSAQ | `ts_ipe_m1b_td_centroid_triangle_5_4_6` |
| vsaq4 | VSAQ | 3 | 175 | Find the centroid of the tetrahedron whose vertices are (2, 3, −4), (−3, 3, 2), (−1, 4, 2) and (3, 5, 1). | VSAQ | `ts_ipe_m1b_td_centroid_tetrahedron_2_3_minus4` |
| vsaq11 | VSAQ | 0 | 177 | If the point (1, 2, 3) is changed to the point (2, 3, 1) through translation of axes, find the new origin. | VSAQ | `ts_ipe_m1b_td_new_origin_translation_1_2_3` |

All three proposed ids verified against `ls answer-book/questions/ | grep m1b_td` — no collision.

## MATCHED

| ref | question_id |
|---|---|
| vsaq2 | `ts_ipe_m1b_td_fourth_vertex_tetrahedron` |
| vsaq3 | `ts_ipe_m1b_td_vertex_c_centroid_origin` |
| vsaq5 | `ts_ipe_m1b_td_sqp_distance_find_x` |
| vsaq6 | `ts_ipe_m1b_td_fourth_vertex_parallelogram` |
| vsaq7 | `ts_ipe_m1b_td_xz_plane_ratio` |
| vsaq8 | `ts_ipe_m1b_td_yz_plane_ratio` |
| vsaq9 | `ts_ipe_m1b_td_collinear_1_2_3` |
| vsaq10 | `ts_ipe_m1b_td_equilateral_triangle` |

## ELSEWHERE

None. (Checked specifically: vsaq11 is a translation-of-axes question printed inside this chapter — see NOTES —
but no card in `chaitanya_m1b_ch02_transformation_of_axes__ours.txt` or the live `ts_ipe_m1b_ta_*` files answers
it either, so it is genuine MISSING rather than ELSEWHERE.)

## UNCERTAIN

None.

## NOTES

- **vsaq7 scope note**: the source explicitly records that vsaq7 asks ONLY for the ratio in which the XZ-plane
  divides the segment A(−2,3,4)–B(1,2,3) — it does not ask for the point of intersection (unlike vsaq8, which
  asks for both). Our matched card `ts_ipe_m1b_td_xz_plane_ratio` answers BOTH the ratio and the point of
  intersection for these same points — a superset of what vsaq7 asks, not a gap. Classified MATCHED; flagged
  here only because a teacher cross-checking against the printed book might notice the card does more than the
  book's vsaq7 literally asks.
- **vsaq11** is a translation-of-axes problem (given how one point's coordinates change under a shift of
  origin, find the new origin) printed by the book inside the 3D-coordinates chapter rather than the
  Transformation-of-Axes chapter. Checked both `ts_ipe_m1b_td_*` and `ts_ipe_m1b_ta_*` (chapter 2) — neither
  has a card of this shape; chapter 2's cards are all "given the transformed equation of a CURVE, find the
  original/new equation," a different sub-skill (curve-equation transformation vs. a bare point-coordinate
  shift). Genuinely missing from the whole bank, not just this unit.
- Two of our cards in this unit (`ts_ipe_m1b_td_collinear_5_4_2`, points (5,4,2)/(6,2,−1)/(8,−2,−7); and
  `ts_ipe_m1b_td_sqp_collinear_and_ratio`, points A(3,2,−4)/B(5,4,−6)/C(9,8,−10)) match none of this chapter's
  11 source refs — extra coverage from elsewhere, not part of this diff's scope.
- No mathematically wrong or ill-posed stems spotted in this chapter's source questions.
