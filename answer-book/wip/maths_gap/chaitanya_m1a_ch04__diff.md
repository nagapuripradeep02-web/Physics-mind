# Diff report — Maths-1A ch.4 Mathematical Induction

Source: `answer-book/sources/chaitanya_m1a_ch04_mathematical_induction.json` (15 questions)
Ours: `answer-book/wip/maths_gap/chaitanya_m1a_ch04_mathematical_induction__ours.txt` (10 cards)

## Tally

**15 source questions = 8 matched + 0 elsewhere + 7 missing + 0 uncertain**

This chapter has only ONE printed section (Short Answer Questions, Q1–10 with sub-parts, printed
pp.25–30) — every ref below is SAQ. My missing count (7) matches the earlier pass's number.

## MATCHED

| ref | question_id |
|---|---|
| saq3 | ts_ipe_m1a_mi_sqp_gp_sum |
| saq4 | ts_ipe_m1a_mi_sum_n_np1_np2 |
| saq5i | ts_ipe_m1a_mi_sum_reciprocal_step_three |
| saq5ii | ts_ipe_m1a_mi_sum_reciprocal_odd_pairs |
| saq6 | ts_ipe_m1a_mi_sum_of_squares_series |
| saq7i | ts_ipe_m1a_mi_divisible_49n_16n_minus_1 |
| saq7ii | ts_ipe_m1a_mi_divisible_3_5_2n1_2_3n1 |
| saq8i | ts_ipe_m1a_mi_divisible_2_4_2n1_3_3n1 |

## MISSING

| ref | book section | stars | printed_page | stem (verbatim) | proposed_qtype | proposed question_id |
|---|---|---|---|---|---|---|
| saq1i | SAQ | 0 (floor) | 25 | Prove by mathematical induction that 1³ + 2³ + 3³ + … + n³ = n²(n + 1)²/4. | SAQ (4m) | ts_ipe_m1a_mi_sum_cubes_n_sq_np1_sq |
| saq1ii | SAQ | 0 (floor) | 25 | Prove by mathematical induction that 1² + 2² + 3² + … + n² = n(n + 1)(2n + 1)/6. | SAQ (4m) | ts_ipe_m1a_mi_sum_squares_n_np1_2np1 |
| saq2 | SAQ | 3 | 26 | Prove by mathematical induction that a + (a + d) + (a + 2d) + … up to n terms = (n/2)[2a + (n − 1)d]. | SAQ (4m) | ts_ipe_m1a_mi_ap_sum_induction |
| saq7iii | SAQ | 1 | 29 | Show that 4ⁿ − 3n − 1 is divisible by 9, ∀ n ∈ N. | SAQ (4m) | ts_ipe_m1a_mi_divisible_4n_3n_minus_1 |
| saq8ii | SAQ | 1 | 29 | If x and y are natural numbers with x ≠ y, show by mathematical induction that xⁿ − yⁿ is divisible by x − y, ∀ n ∈ N. | SAQ (4m) | ts_ipe_m1a_mi_divisible_xn_minus_yn |
| saq9 | SAQ | 1 | 30 | Use mathematical induction to prove that 2 + 3·2 + 4·2² + … up to n terms = n·2ⁿ, ∀ n ∈ N. | SAQ (4m) | ts_ipe_m1a_mi_sum_n_2n_series |
| saq10 | SAQ | 0 (reading) | 30 | Use mathematical induction to prove that 4³ + 8³ + 12³ + … up to n terms = 16n²(n + 1)². | SAQ (4m) | ts_ipe_m1a_mi_sum_4cube_8cube_series |

All 7 proposed ids checked against `ls answer-book/questions/` — no collisions. All existing
`ts_ipe_m1a_mi_*` cards are SAQ/4-marks, so the 7 new ones follow the same qtype/marks.

## ELSEWHERE

None. Grepped the whole bank for each candidate's distinctive expression (`n²(n + 1)²/4`,
`n(n + 1)(2n + 1)/6`, the AP-sum bracket, `divisible by 9`, `xⁿ − yⁿ`, `n·2ⁿ`, `16n²(n + 1)²`).
Two apparent hits turned out to be false positives — `n²(n+1)²/4` and `n(n+1)(2n+1)/6` each
appear only as an intermediate LEMMA inside the solution steps of `ts_ipe_m1a_mi_sum_cubes_over_odds`
and `ts_ipe_m1a_mi_sum_of_squares_series` respectively (both prove a harder, different result and
cite the classic sum formula along the way) — not as the question being asked. So saq1i/saq1ii
stay MISSING, not MATCHED.

## UNCERTAIN

None.

## NOTES

- **Printed defect, saq7ii** (already MATCHED to `ts_ipe_m1a_mi_divisible_3_5_2n1_2_3n1`): the
  source index flags that the book's own quantifier reads "∀ k ∈ N" although the statement is in
  n — should be "∀ n ∈ N". A label typo, not a math error; our card already states it correctly.
- Two of our existing 10 cards do not correspond to any of this source's 15 questions:
  `ts_ipe_m1a_mi_sum_cubes_over_odds` (1³/1 + (1³+2³)/(1+3) + … = (n/24)(2n²+9n+13)) and
  `ts_ipe_m1a_mi_sqp_product_squares` ((1+3/1)(1+5/4)(1+7/9)…(1+(2n+1)/n²) = (n+1)²). Neither
  stem appears anywhere in this 15-question excerpt, so they must be sourced elsewhere (e.g. a
  PYQ or a different reference). This is why only 8 of our 10 cards land as MATCHED above,
  not 10.
- No mathematically wrong or ill-posed stems found in this chapter's source excerpt.
- No duplicate questions within the source excerpt.
