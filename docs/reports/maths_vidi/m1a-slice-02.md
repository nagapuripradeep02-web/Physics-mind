# Vidi audit — Maths 1A slice 2

Replies graded: 50 (guard replies excluded: 0)
Mean score: 2.92 / 3        (= 9.7 / 10)
Grade counts: 3 -> 48 · 2 -> 1 · 1 -> 0 · 0 -> 1

## Per-template means
| template | n | mean | notes |
|---|---|---|---|
| whystep | 5 | 3.00 | all precise |
| marks | 5 | 3.00 | all precise, mark arithmetic checked against MARK SPLIT in every case |
| remember | 5 | 3.00 | all precise |
| important | 5 | 3.00 | correctly hedges "no Asked line ≠ never asked" on both 0-Asked cards |
| mistakes | 5 | 3.00 | all precise |
| skiplast | 5 | 2.40 | 4×3, 1×0 — the one 0 is the confirmed `!MARK_NOT_IN_BANK:7` arithmetic error |
| explain | 5 | 3.00 | all precise |
| outofbank | 5 | 3.00 | all correctly decline and redirect to the open question |
| why | 5 | 2.80 | 4×3, 1×2 — the 2 is a verbatim-duplicated paragraph, not a factual error |
| telugu | 5 | 3.00 | all precise; notably the Q2 Telugu reply states the mark total CORRECTLY (8) where the English skiplast reply on the same card got it wrong (7) |

## Every reply scored 0 or 1

**ts_ipe_m1a_mat_det_square_cyclic|full · [skiplast] step s6_conclude**

The ask: "if i skip this last step how many marks will i lose? what is the minimum i must write"

The reply (quoted in full):

> If you skip the last step, you do not lose any marks for it, because it carries 0 marks on its own. The marks are already spent on the earlier steps: 3 for expanding Δ, 2 for the column interchange, and 3 for the row-by-row multiplication. So the minimum you must write is steps 2, 4, and 5, which together earn all 7 marks that the book assigns. But do write the joining line anyway, because it is what makes the answer complete for the examiner.

Why it scored 0: the reply's own numbers are 3 + 2 + 3 = 8, but it then states the total as "7 marks." The ANSWER FACTS give this question as 8 marks (`SECTION: ... 8 marks`) and the MARK SPLIT sums to 8 (3M expand/square + 5M multiply, or equivalently 3+2+3 in the step-level breakdown). A student trusting "7" would misjudge how much of the question they've covered and could misreport the question's own total mark value on paper — a wrong mark value copied straight into an exam-strategy decision. This is a pure arithmetic slip inside the reply, not a bank/fact problem: a correct reading of the ANSWER FACTS (or even correct addition of the reply's own three numbers) gives 8, not 7. **Defect is the MODEL's, not the CARD's.**

This confirms the founder's `!MARK_NOT_IN_BANK:7` reading exactly: the model did say "all 7 marks" on a card the facts mark at 8.

## Mechanical flags that were wrong

None. The single flag present in this slice (`!MARK_NOT_IN_BANK:7` on `ts_ipe_m1a_mat_det_square_cyclic|full`, skiplast) is a **true positive** — see the confirmation above. No other flags appear anywhere in this slice (grepped for `_flags:`, one hit total).

## Truncated replies

None. All 50 replies end on a complete sentence/formula; no mid-token or max_tokens cutoffs observed.

## Anything else worth the founder's attention

- **Duplicated paragraph** — `ts_ipe_m1a_pt_r1_over_bc|full` · [why] · no step open. The reply's entire final paragraph is pasted twice verbatim back-to-back ("The idea is that this identity only works cleanly in half angles... falls into place." appears twice with no separator). Content is correct both times, so it's scored 2 (padded) rather than 0/1, but it reads as a generation/assembly glitch worth a founder look — a student would just see a garbled repeat, not a wrong fact.
- **No guard replies in this slice** — worth noting since the audit brief calls them out specially; this sample happened to contain zero transient-DeepSeek-error events, so 50/50 replies are real model output to grade.
- **Good hedging behavior, consistently**: both 0-star / no-"Asked"-line cards (`mat_det_powers_abc` has no such gap, but `mi_sum_cubes_over_odds` STARS=0/no-Asked and `pt_r1_over_bc` STARS=3/no-Asked) got the "important" reply right every time — Vidi said "the book does not list any past exam years, so I cannot say it appeared" rather than wrongly concluding "it was never asked," exactly as the ANSWER FACTS instruct.
- **Telugu replies tracked the English content well** and in one case (Q2) were actually more accurate than the parallel English reply — the Telugu [telugu] reply for the square-cyclic-determinant card states the total as 8 marks correctly, while the English [skiplast] reply on the same card got the total wrong (7). This suggests the arithmetic slip is local to that one reply's generation, not a systemic language-specific issue.
