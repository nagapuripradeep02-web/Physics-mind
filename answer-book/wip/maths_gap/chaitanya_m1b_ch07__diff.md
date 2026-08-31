# Diff report — mathematics_1b unit 7: The Plane (Maths-1B)

Source: `answer-book/sources/chaitanya_m1b_ch07_the_plane.json` (13 questions)
Ours: `answer-book/wip/maths_gap/chaitanya_m1b_ch07_the_plane__ours.txt` (11 cards)

## Tally

13 source questions = 8 matched + 0 elsewhere + 5 missing + 0 uncertain

(Earlier pass reported MISSING = 5 — confirmed, same count.)

## MISSING

| ref | book section | stars | printed_page | stem (verbatim) | proposed_qtype | proposed question_id |
|---|---|---|---|---|---|---|
| vsaq8 | VSAQ | 2 | 183 | Find the equation of the plane passing through the point (−2, 1, 3) and having (3, −5, 4) as the direction ratios of its normal. | VSAQ | `ts_ipe_m1b_pln_through_minus2_1_3_normal_dr` |
| vsaq9 | VSAQ | 0 | 183 | Find the equation of the plane if the foot of the perpendicular from the origin to the plane is (1, 3, −5). | VSAQ | `ts_ipe_m1b_pln_foot_of_perpendicular_1_3_minus5` |
| vsaq10 | VSAQ | 0 | 183 | Find the equation of the plane parallel to the ZX-plane and passing through (0, 4, 4). | VSAQ | `ts_ipe_m1b_pln_parallel_zx_plane_0_4_4` |
| vsaq11 | VSAQ | 0 | 183 | Find the equation of the plane passing through (2, 3, 4) and perpendicular to the x-axis. | VSAQ | `ts_ipe_m1b_pln_perpendicular_x_axis_2_3_4` |
| vsaq12 | VSAQ | 1 | 183 | Define the angle between two planes. | VSAQ | `ts_ipe_m1b_pln_define_angle_between_planes` |

All five proposed ids verified against `ls answer-book/questions/ | grep m1b_pln` — no collision.

## MATCHED

| ref | question_id |
|---|---|
| vsaq1i | `ts_ipe_m1b_pln_angle_x_2y_2z` |
| vsaq1ii | `ts_ipe_m1b_pln_angle_2x_minus_y_plus_z` |
| vsaq2 | `ts_ipe_m1b_pln_intercepts_4x_3y_2z` |
| vsaq3 | `ts_ipe_m1b_pln_from_intercepts_1_2_4` |
| vsaq4 | `ts_ipe_m1b_pln_intercept_form_4x_4y_2z` |
| vsaq5 | `ts_ipe_m1b_pln_normal_form_x_2y_3z` |
| vsaq6 | `ts_ipe_m1b_pln_dcs_of_normal` |
| vsaq7 | `ts_ipe_m1b_pln_parallel_through_1_1_1` |

## ELSEWHERE

None.

## UNCERTAIN

None.

## NOTES

- vsaq12 ("Define the angle between two planes") is the chapter's one definitional question, called out as
  such by the source ("not a computation — the only one of its kind in this chapter"). No card in our bank
  states this definition as a standalone question; genuinely missing, not merely an unasked restatement of a
  computed-angle card.
- Three extra cards in this unit (`ts_ipe_m1b_pln_intercepts_x_minus_3y_2z`,
  `ts_ipe_m1b_pln_from_intercepts_2_3_4`, `ts_ipe_m1b_pln_parallel_through_1_2_minus3`) match none of this
  chapter's 13 source refs — different numeric cases of the same problem types. Left alone; not part of this
  diff's scope.
- No mathematically wrong or ill-posed stems spotted beyond the OCR/print typo the source file already flags
  ("in to intercept form" for vsaq4).
