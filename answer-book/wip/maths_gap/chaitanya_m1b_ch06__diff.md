# Diff report — mathematics_1b unit 6: D.C's & D.R's (Maths-1B)

Source: `answer-book/sources/chaitanya_m1b_ch06_direction_cosines_and_ratios.json` (7 questions)
Ours: `answer-book/wip/maths_gap/chaitanya_m1b_ch06_direction_cosines_and_ratios__ours.txt` (7 cards)

## Tally

7 source questions = 6 matched + 0 elsewhere + 1 missing + 0 uncertain

(Earlier pass reported MISSING = 1 — confirmed, same count.)

## MISSING

| ref | book section | stars | printed_page | stem (verbatim) | proposed_qtype | proposed question_id |
|---|---|---|---|---|---|---|
| laq5 | LAQ | 3 | 181 | The vertices of △ABC are A(1, 4, 2), B(−2, 1, 2) and C(2, 3, −4). Find ∠A, ∠B and ∠C. | LAQ | `ts_ipe_m1b_dc_angles_of_triangle_1_4_2` |

Proposed id verified against `ls answer-book/questions/ | grep m1b_dc` — no collision.

## MATCHED

| ref | question_id |
|---|---|
| laq1 | `ts_ipe_m1b_dc_four_diagonals_cos_squares` |
| laq2 | `ts_ipe_m1b_dc_angle_between_cube_diagonals` |
| laq3i | `ts_ipe_m1b_dc_angle_l_plus_m_plus_n` |
| laq3ii | `ts_ipe_m1b_dc_angle_3l_plus_m_plus_5n` |
| laq4i | `ts_ipe_m1b_dc_dcs_l_minus_5m_plus_3n` |
| laq4ii | `ts_ipe_m1b_dc_dcs_l_plus_m_plus_n_mn` |

## ELSEWHERE

None.

## UNCERTAIN

None.

## NOTES

- `ts_ipe_m1b_dc_perpendicular_proof` (d.c's satisfy l+m+n=0, 2mn+3nl−5lm=0, show perpendicular) is an extra
  card in our bank matching none of this chapter's 7 source refs. Left alone; not part of this diff's scope.
- Confirmed by direct grep (`(1,4,2)` / `1, 4, 2`) that no card anywhere in the bank answers the triangle-ABC
  angle problem — laq5 is genuinely missing from the whole bank, not just this unit.
- No mathematically wrong or ill-posed stems spotted in this chapter's source questions.
