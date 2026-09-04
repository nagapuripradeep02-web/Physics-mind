# Diff report — mathematics_1b unit 1: Locus (Maths-1B)

Source: `answer-book/sources/chaitanya_m1b_ch01_locus.json` (13 questions)
Ours: `answer-book/wip/maths_gap/chaitanya_m1b_ch01_locus__ours.txt` (12 cards)

## Tally

13 source questions = 8 matched + 0 elsewhere + 5 missing + 0 uncertain

(Earlier pass reported MISSING = 5 — confirmed, same count.)

## MISSING

| ref | book section | stars | printed_page | stem (verbatim) | proposed_qtype | proposed question_id |
|---|---|---|---|---|---|---|
| saq3 | SAQ | 3 | 134 | Find the equation of locus of P, if the ratio of the distance from P to (5, −4) and (7, 6) is 2 : 3. | SAQ | `ts_ipe_m1b_loc_ratio_5_minus4_7_6_two_three` |
| saq9 | SAQ | 2 | 136 | Find the equation of locus of a point P such that the distance of P from the origin is twice the distance of P from A(1, 2). | SAQ | `ts_ipe_m1b_loc_distance_twice_origin_1_2` |
| saq10i | SAQ | 1 | 136 | Find the equation to the locus of the point which is at a distance of 5 units from (−2, 3) in the xy-plane. | SAQ | `ts_ipe_m1b_loc_distance_five_minus2_3` |
| saq10ii | SAQ | 1 | 136 | Find the equation of locus of the point which is equidistant from A(2, 0) and the y-axis. | SAQ | `ts_ipe_m1b_loc_equidistant_2_0_y_axis` |
| saq11 | SAQ | 0 | 137 | Find the equation of the locus of a point P such that PA² + PB² = 2c², where A = (a, 0), B = (−a, 0) and 0 < \|a\| < \|c\|. | SAQ | `ts_ipe_m1b_loc_pa2_pb2_2c2_general` |

All five proposed ids verified against `ls answer-book/questions/ | grep m1b_loc` — no collision.

## MATCHED

| ref | question_id |
|---|---|
| saq1 | `ts_ipe_m1b_loc_right_angle_2_3_minus1_5` |
| saq2i | `ts_ipe_m1b_loc_right_angle_4_0_0_4` |
| saq2ii | `ts_ipe_m1b_loc_right_angle_hypotenuse_0_6_6_0` |
| saq4 | `ts_ipe_m1b_loc_ratio_2_3_2_minus3_two_three` |
| saq5 | `ts_ipe_m1b_loc_area_5_3_3_minus2_nine` |
| saq6 | `ts_ipe_m1b_loc_area_2_3_minus3_4_eight_point_five` |
| saq7 | `ts_ipe_m1b_loc_pa2_pb2_twice_pc2` |
| saq8 | `ts_ipe_m1b_loc_distance_twice_3_0_minus3_0` |

## ELSEWHERE

None.

## UNCERTAIN

None.

## NOTES

- Our bank carries 4 cards in this unit (`sum_distances_2_3_2_minus3_eight`, `sum_distances_0_2_0_minus2_six`,
  `diff_distances_minus5_0_5_0_eight`, `diff_distances_4_0_minus4_0_four`) that answer no question in this
  13-item Chaitanya source index at all — sum/difference-of-distances locus problems (ellipse/hyperbola-shape
  loci) that this particular source book does not print for chapter 1. Left alone; not part of this diff's
  scope (only extra coverage, no gap).
- saq4 and saq9/saq10i/saq10ii's star counts are recorded by the source as possibly understated (clipped
  spine gutter / page-number box cut on scan) — doesn't affect the diff, noted here only for anyone re-checking
  star weight later.
- No mathematically wrong or ill-posed stems spotted in this chapter's source questions.
