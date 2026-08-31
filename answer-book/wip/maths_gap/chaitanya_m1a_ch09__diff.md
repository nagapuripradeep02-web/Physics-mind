# Diff report — Maths-1A ch.9 Trigonometric Equations

Source: `answer-book/sources/chaitanya_m1a_ch09_trigonometric_equations.json` (14 questions)
Ours: `answer-book/wip/maths_gap/chaitanya_m1a_ch09_trigonometric_equations__ours.txt` (10 cards)

## Tally

**14 source questions = 6 matched + 0 elsewhere + 8 missing + 0 uncertain**

The chapter has only one printed section (Short Answer Questions) — every ref below is SAQ.
My missing count (8) matches the earlier pass's number.

## MATCHED

| ref | question_id |
|---|---|
| saq1ii | ts_ipe_m1a_te_two_cos_sq_minus_root3 |
| saq1v | ts_ipe_m1a_te_one_plus_sin_sq |
| saq2ii | ts_ipe_m1a_te_root3_sin_minus_cos |
| saq2iii | ts_ipe_m1a_te_sqp_sin_plus_root3_cos |
| saq4ii | ts_ipe_m1a_te_sqp_cot_quadratic |
| saq5 | ts_ipe_m1a_te_sin_sin5_sin3 |

## MISSING

| ref | book section | stars | printed_page | stem (verbatim) | proposed_qtype | proposed question_id |
|---|---|---|---|---|---|---|
| saq1i | SAQ | 0 | 106 | Solve 7 sin²θ + 3 cos²θ = 4. | SAQ (4m) | ts_ipe_m1a_te_seven_sin_sq_three_cos_sq |
| saq1iii | SAQ | 1 | 106 | Solve tanθ + 3 cotθ = 5 secθ. | SAQ (4m) | ts_ipe_m1a_te_tan_plus_3cot_5sec |
| saq1iv | SAQ | 1 (floor) | 107 | Solve 2 cos²θ + 11 sinθ = 7. | SAQ (4m) | ts_ipe_m1a_te_two_cos_sq_11sin |
| saq2i | SAQ | 3 | 107 | Solve 4 cos²θ + √3 = 2(√3 + 1) cosθ. | SAQ (4m) | ts_ipe_m1a_te_four_cos_sq_root3 |
| saq3 | SAQ | 3 | 108 | Find all values of x ≠ 0 in (−π, π) satisfying 8^(1 + cos x + cos²x + … ∞) = 4³. | SAQ (4m) | ts_ipe_m1a_te_infinite_exponent_series |
| saq4i | SAQ | 0 | 108 | Solve tanθ + secθ = √3 for 0 ≤ θ ≤ 2π. | SAQ (4m) | ts_ipe_m1a_te_tan_plus_sec_root3 |
| saq6 | SAQ | 0 | 109 | If x is acute and sin(x + 10°) = cos(3x − 68°), find x in degrees. | SAQ (4m) | ts_ipe_m1a_te_sin_x10_cos_3x68 |
| saq7 | SAQ | 0 | 109 | If x + y = 2π/3 and sin x + sin y = 3/2, find x and y. | SAQ (4m) | ts_ipe_m1a_te_sum_x_y_sin_sum |

All 8 proposed ids checked against `ls answer-book/questions/` — no collisions. All existing
`ts_ipe_m1a_te_*` cards are SAQ/4-marks, so the 8 new ones follow the same qtype/marks.

## ELSEWHERE

None. Grepped the bank for each candidate's distinctive expression (`7 sin²`, `3 cotθ`/`5 secθ`,
`11 sinθ`, `2(√3 + 1)`, the `8^…` exponent, `tanθ + secθ`, `x + 10`/`3x − 68`, `2π/3`). A few hits
came back as false positives — `2π/3` and the cot/sec fragments each turn up only inside the
WORKED-SOLUTION steps of already-matched cards (`ts_ipe_m1a_te_sin_sin5_sin3`,
`ts_ipe_m1a_te_sqp_cot_quadratic`, and the unrelated `ts_ipe_m1a_tr_vsaq_period_cos_3x`), never as
the question being asked. No genuine elsewhere-match found for any of the 8.

## UNCERTAIN

None.

## NOTES

- **saq1iii**: the source index flags a printed typesetting slip (the "Sol:" working label is set
  twice under this part) — cosmetic, does not affect the stem or the mathematics.
- **saq5**: the source index flags that the printed label "5." is itself absent — the stem appears
  right after question 4(ii) with only a stray "*ii)" prefix, and the book's own numbering resumes
  at "6." next. Numbered saq5 here by position only; not a math defect. (This ref is already
  MATCHED to `ts_ipe_m1a_te_sin_sin5_sin3`.)
- Four of our existing 10 cards do not correspond to any of this source's 14 questions:
  `ts_ipe_m1a_te_root2_sin_plus_cos` (√2(sinx+cosx)=√3 — a genuinely different coefficient pairing
  from saq2iii's sinx+√3cosx=√2), `ts_ipe_m1a_te_cos2t_cos8t_cos5t`, `ts_ipe_m1a_te_roots_tan_theta`,
  and `ts_ipe_m1a_te_roots_sin_alpha_beta` (the latter two are general "roots θ₁,θ₂" corollary
  theorems, likely from a different, uncaptured section of the book). None of their stems appear
  in this 14-question excerpt, so they must be sourced elsewhere. This is why only 6 of our 10
  cards land as MATCHED above, not 10.
- No mathematically wrong or ill-posed stems found in this chapter's source excerpt.
- No duplicate questions within the source excerpt.
