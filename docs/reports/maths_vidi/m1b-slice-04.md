# Vidi audit — Maths 1B slice 4

Replies graded: 47 (guard replies excluded: 3)
Mean score: 2.98 / 3        (= 9.9 / 10)
Grade counts: 3 -> 46 · 2 -> 1 · 1 -> 0 · 0 -> 0

## Per-template means
| template | n | mean | notes |
|---|---|---|---|
| ts_ipe_m1b_pln_parallel_through_1_2_minus3 | 10 | 3.00 | plane-through-point, 2M. Clean. |
| ts_ipe_m1b_sl_concurrent_find_k | 10 | 3.00 | k=−7, 2M. Clean, correctly separated STARS (0/3) from Asked (TS 2018). |
| ts_ipe_m1b_sl_image_of_point_proof | 10 | 2.90 | 8M LAQ. One reply (skiplast) has an internal step-numbering slip — see below. |
| ts_ipe_m1b_ta_angle_removing_xy_term | 7 (3 guard excluded) | 3.00 | 4M SAQ. Guard fired on 3 of 10 asks (network error to DeepSeek), all correctly formatted. |
| ts_ipe_m1b_td_fourth_vertex_parallelogram | 10 | 3.00 | D=(3,3,1), 2M. Clean. |

Every graded reply carried the correct final numeric/symbolic answer for its question
(22 in 2x−3y+6z+22=0, k=−7, θ=½Tan⁻¹(2h/(a−b)) with the a=b→π/4 branch, D=(3,3,1)), the
correct mark split, and the correct stars-vs-asked-year distinction (Section STARS and
Asked are genuinely separate facts in this bank and Vidi never conflated them). No
invented steps, no wrong formulas, no wrong mark values, nothing a student could copy
into an exam and lose marks for.

## Every reply scored 0 or 1
None. No reply in this slice scored 0 or 1.

## The one reply scored 2 (for completeness, since it's the only non-3)
`ts_ipe_m1b_sl_image_of_point_proof` · [skiplast] step s4_find_r · ask: "if i skip this
last step how many marks will i lose? what is the minimum i must write"

> If you skip step 5, you lose the 3 marks it earns. The minimum you must write is
> steps 1, 2, and 3, which together earn 5 marks. Step 1 gives the two slopes for 1
> mark, step 2 uses perpendicularity for 2 marks, and step 3 writes h and k through r
> for 2 marks. Without step 5, you cannot reach the final result, so you would lose
> the 3 marks for the solution.

Why 2, not 3: the mark arithmetic is entirely correct (1+2+2=5 minimum, 3 lost, 8
total) — but the step numbers are internally inconsistent. Earlier in the same reply
it labels the perpendicularity step "step 2" and the h/k-via-r step "step 3", i.e. it
is NOT counting the zero-mark figure sub-step (`s1b_figure`) in the numbering. But it
then calls the final step (`s4_find_r`) "step 5", which only makes sense if the figure
sub-step IS counted. That's an off-by-one within one reply, not a marks or physics
error — a student following it would write the right things and know the right mark
counts, just be told an inconsistent step number. Not exam-costly, so 2 not 1. This is
a MODEL defect (numbering drift), not a card defect — the source JSON's own step ids
(`s1_both_slopes`, `s1b_figure`, `s2_use_the_perpendicularity`, `s3_write_h_and_k`,
`s4_find_r`) are self-consistent; Vidi mis-translated them into spoken step numbers.

## Mechanical flags that were wrong
None found. The only flag type present in this slice is `GUARD_REPLY`, applied to
exactly the 3 replies that read the verbatim guard string (see below) — all 3 flags
are correct. No other mechanical flags (e.g. an idiom flag) appear anywhere in this
slice's file.

**On the "the whole trick" idiom flag named in the brief:** that phrase does not occur
anywhere in this slice. The only occurrence of "trick" at all is inside the STUDENT'S
own question text ("...any tips or tricks") in the five `[remember]` templates —
never in a Vidi reply. So there is nothing to judge here for this slice; the flagged
reply must be in a different slice.

## Truncated replies
None. Every reply in this slice (guard replies included) ends on a complete sentence.
No mid-formula or mid-sentence cutoffs from the max_tokens cap were found.

## Guard replies (excluded from scoring, counted here)
3 guard replies, all in `ts_ipe_m1b_ta_angle_removing_xy_term`: [marks] (no step
open), [remember] (step s1_write_the_rotation_formulas), and [skiplast] (step
s4_solve_for_theta). All three are the exact verbatim string "I could not answer just
now. The answer book still works — keep going, and try me again in a moment." and are
correctly tagged `_flags: GUARD_REPLY_`. Nothing to grade — this is a DeepSeek
network-error rate, not a content defect, but 3/10 asks failing for one question is
worth the founder knowing about if it recurs elsewhere.

## Anything else worth the founder's attention
- **Telugu chat replies exist in every template** (the `[telugu]` ask, "idi telugu lo
  simple ga cheppu"), and all five are mathematically correct and well-grounded. This
  is Vidi answering a live, student-typed request for Telugu, not authored/shipped
  narration — a different surface than the TTS pipeline Rule 30i governs (English-only
  audio, no language picker on the sim player). Flagging only because 30i reads as a
  broad English-only product stance; worth the founder confirming Vidi-chat Telugu
  replies are an intentional, in-scope exception rather than an oversight.
- The `[outofbank]` handling (a student asking for "integration by parts" while a
  different question is open) was clean across all 5 templates: Vidi never fabricated
  an answer, always declined and redirected to the open question. No defects.
- The stars-vs-asked-year distinction (a trap the ANSWER FACTS explicitly call out —
  "report each only from the line that states it") was handled correctly in all 5
  `[important]` replies, including the two edge cases: STARS 3/3 with NO Asked line
  (template 1, correctly said it cannot name a year) and STARS 0/3 WITH an Asked line
  (template 2, correctly reported TS 2018 without inflating it into a frequency claim).
- Overall this slice is unusually clean — no wrong formulas, no wrong marks, no
  invented steps, across all four question types (2M VSAQ ×3, 4M SAQ, 8M LAQ).
