# Diff report — Maths-1A ch.10 Inverse Trigonometric Functions

Source: `answer-book/sources/chaitanya_m1a_ch10_inverse_trigonometric_functions.json` (17 questions)
Ours: `answer-book/wip/maths_gap/chaitanya_m1a_ch10_inverse_trigonometric_functions__ours.txt` (10 cards)

## Tally

**17 source questions = 8 matched + 0 elsewhere + 9 missing + 0 uncertain**

The chapter has only one printed section (Short Answer Questions) — every ref below is SAQ.
My missing count (9) matches the earlier pass's number.

## MATCHED

| ref | question_id |
|---|---|
| saq1i | ts_ipe_m1a_it_sqp_tan_inverse_zero |
| saq1ii | ts_ipe_m1a_it_tan_half_fifth_eighth |
| saq1iii | ts_ipe_m1a_it_tan_three_quarters |
| saq2ii | ts_ipe_m1a_it_sin_plus_two_tan |
| saq3i | ts_ipe_m1a_it_sin_sin_sin |
| saq4i | ts_ipe_m1a_it_sin_cos_cos |
| saq4ii | ts_ipe_m1a_it_cos_sin_tan |
| saq6 | ts_ipe_m1a_it_cos_two_tan_four_tan |

## MISSING

| ref | book section | stars | printed_page | stem (verbatim) | proposed_qtype | proposed question_id |
|---|---|---|---|---|---|---|
| saq1iv | SAQ | 1 | 111 | Find the value of tan[cos⁻¹(4/5) + tan⁻¹(2/3)]. | SAQ (4m) | ts_ipe_m1a_it_tan_cos_plus_tan_value |
| saq2i | SAQ | 3 | 112 | Prove that 2 sin⁻¹(3/5) − cos⁻¹(5/13) = cos⁻¹(323/325). | SAQ (4m) | ts_ipe_m1a_it_two_sin_minus_cos_325 |
| saq2iii | SAQ | 3 | 112 | Prove that sin⁻¹(3/5) + sin⁻¹(8/17) = cos⁻¹(36/85). | SAQ (4m) | ts_ipe_m1a_it_sin_three_fifth_eight_seventeenth |
| saq4iii | SAQ | 0 | 113 | Prove that cos[2(tan⁻¹(1/4) + tan⁻¹(2/9))] = 3/5. | SAQ (4m) | ts_ipe_m1a_it_cos_two_tan_quarter_ninth |
| saq5 | SAQ | 3 | 113 | Show that cot(sin⁻¹√(13/17)) = sin(tan⁻¹(2/3)). | SAQ (4m) | ts_ipe_m1a_it_cot_sin_root_13_17 |
| saq7 | SAQ | 3 | 114 | If cos⁻¹(p/a) + cos⁻¹(q/b) = α, prove that p²/a² − (2pq/(ab)) cosα + q²/b² = sin²α. | SAQ (4m) | ts_ipe_m1a_it_cos_inverse_p_a_q_b_identity |
| saq8i | SAQ | 0 | 115 | Solve for x: tan⁻¹((x − 1)/(x − 2)) + tan⁻¹((x + 1)/(x + 2)) = π/4. | SAQ (4m) | ts_ipe_m1a_it_solve_x_tan_ratio_pi4 |
| saq8ii | SAQ | 0 | 115 | Solve for x: 3 sin⁻¹(2x/(1 + x²)) − 4 cos⁻¹((1 − x²)/(1 + x²)) + 2 tan⁻¹(2x/(1 − x²)) = π/3. | SAQ (4m) | ts_ipe_m1a_it_solve_x_triple_arc_identity |
| saq9 | SAQ | 1 | 115 | Solve arcsin(5/x) + arcsin(12/x) = π/2. | SAQ (4m) | ts_ipe_m1a_it_arcsin_5x_12x_sum |

All 9 proposed ids checked against `ls answer-book/questions/` — no collisions. All existing
`ts_ipe_m1a_it_*` cards are SAQ/4-marks, so the 9 new ones follow the same qtype/marks.

## ELSEWHERE

None. Grepped the bank for each candidate's distinctive expression (`cos⁻¹(4/5) + tan⁻¹(2/3)`,
`323/325`, `8/17`/`36/85`, `tan⁻¹(1/4)`, `√(13/17)`, `p/a`/`q/b`, `(x − 1)/(x − 2)`,
`2x/(1 + x²)`, `5/x`/`12/x`) — zero hits anywhere in the bank for any of the 9.

## UNCERTAIN

None.

## NOTES

- **Duplicate identity inside our own bank, not the source**: `ts_ipe_m1a_it_cos_two_tan_seventh`
  ("cos(2 Tan⁻¹(1/7)) = sin(2 Tan⁻¹(3/4))") and `ts_ipe_m1a_it_cos_two_tan_four_tan`
  ("cos(2 Tan⁻¹(1/7)) = sin(4 Tan⁻¹(1/3))") state the SAME identity twice. Verified: tan⁻¹(3/4) =
  2·tan⁻¹(1/3) exactly (tan(2·tan⁻¹(1/3)) = 2·(1/3)/(1−1/9) = 3/4, and both angles lie in the
  principal branch), so 2·Tan⁻¹(3/4) ≡ 4·Tan⁻¹(1/3) — the two cards' right-hand sides name the
  identical angle, just via two different-but-equal expressions. `_four_tan` is word-for-word the
  source's saq6 and is the card credited as MATCHED above; `_seventh` is a redundant restatement
  of the same result, not a second distinct source question. Recommend the author reconcile these
  two cards on next touch (not part of this diff task).
- One of our existing 10 cards, `ts_ipe_m1a_it_xy_yz_zx_one` ("If Tan⁻¹x + Tan⁻¹y + Tan⁻¹z = π/2,
  prove xy + yz + zx = 1"), does not correspond to any of this source's 17 questions — likely a
  general corollary theorem sourced from elsewhere (e.g. an LAQ/theorem section not captured in
  this SAQ-only excerpt). This, together with the duplicate above, is why only 8 of our 10 cards
  land as MATCHED, not 10.
- Scan/print quirks noted by the source (cropped left-gutter labels on saq1i and the "***j)" →
  "4i)" repair on saq4i) are OCR artifacts, not mathematical defects.
- No mathematically wrong or ill-posed stems found in this chapter's source excerpt.
- No duplicate questions within the source excerpt itself.
