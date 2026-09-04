# Vidi audit — Maths 1B slice 1

Replies graded: 50 (guard replies excluded: 0)
Mean score: 2.98 / 3        (= 9.93 / 10)
Grade counts: 3 -> 49 · 2 -> 1 · 1 -> 0 · 0 -> 0

## Per-template means
| template | n | mean | notes |
|---|---|---|---|
| marks | 5 | 3.00 | consistently states the correct per-step mark split and total |
| remember | 5 | 3.00 | matches the authored REMEMBER line each time |
| whystep | 5 | 3.00 | grounds the "why this step" answer in the WHY field, no invention |
| mistakes | 5 | 3.00 | reproduces the authored MISTAKES lines accurately |
| why | 5 | 3.00 | correct conceptual framing every time, no drift into invented theory |
| important | 5 | 3.00 | correctly handles both the "no rank published" cards (4 of 5) and the one real 3-star card, and follows the "do not say the book gives it no star" instruction every time |
| explain | 5 | 3.00 | full worked walkthroughs, every number checked against the ANSWER FACTS and correct |
| outofbank | 5 | 3.00 | cleanly declines the integration-by-parts ask and redirects to the open card every time |
| skiplast | 5 | 2.80 | 4 of 5 clean; 1 (cycloid, Q2) has redundant/confusing phrasing though its final numbers are correct — see below |
| telugu | 5 | 3.00 | all five are accurate simplified restatements of the method, no numeric errors found |

## Every reply scored 0 or 1
None. No reply in this slice scored 0 or 1 — no falsehood, invented mark value, invented step, wrong formula, or wrong final answer was found anywhere in the 50 graded replies.

## The one reply scored 2 (not 0/1, but worth flagging)
`ts_ipe_m1b_ad_cycloid_tangent_normal_subtangent_subnormal|full` · template `[skiplast]` · step `s4_lengths`

**The ask:** "if i skip this last step how many marks will i lose? what is the minimum i must write"

**The reply:** "If you skip step 4, you lose the 1 mark that step earns, and you also lose the final answer mark, because the question asks for all four lengths. The minimum you must write is steps 1, 2, and 3, which together earn 3 marks. Those steps give you the slope, the four formulas, and the subtangent and subnormal. Your final answer would be incomplete without the lengths of the tangent and the normal."

**Why 2, not 3:** The opening clause reads as if two separate marks are lost ("the 1 mark that step earns, AND you also lose the final answer mark"), which momentarily contradicts the concrete total given two sentences later (steps 1–3 = 3 of the 4 total marks, i.e. only 1 mark lost). The card's mark split is a flat 1M×4 with step 4 tagged `EARNS THE MARK FOR: Answer` — so "the final answer mark" is the SAME mark as "the 1 mark step 4 earns," not a second one. The reply never states a wrong total (3/4 is correct and is the number a student would act on), so this is padding/redundant wording, not a falsehood — hence 2 (acceptable but padded), not 1. **This is a model defect, not a card defect** — the card's own mark split is unambiguous (1M per step); the model just phrased the loss twice.

## Mechanical flags that were wrong
None to report. This slice's markdown carries no inline mechanical-flag annotations on any of the 50 replies (verified by grep for "flag"/"FLAG" in the source file) — either none fired on this slice, or the flag rendering isn't present in this file format. Nothing to grade as wrong.

## Truncated replies
None. Every one of the 50 replies ends on a complete sentence (checked each reply's final characters); none show a max_tokens cutoff mid-sentence or mid-formula.

## Anything else worth the founder's attention
- The 5 "important" replies handling the no-published-star cards (4 of the 5 questions in this slice) all correctly avoid the trap phrase "the book gives it no star" and instead say some form of "no frequency rank is published" — the exact instruction embedded in the ANSWER FACTS. Worth noting as a positive signal on that specific compliance point, since it's flagged as a known trap in the ANSWER FACTS text itself.
- The one real 3-star card in this slice (`dc_dcs_l_plus_m_plus_n_mn`, direction cosines LAQ) was reported with completely correct star count (3/3) and exam history (TS 2016, AP 2022/2018/2016) — no fabrication of exam years beyond what was given.
- All five `[telugu]` replies are accurate restatements with correct numbers carried through in code-mixed Telugu — no numeric drift introduced by the language switch.
- All five `[outofbank]` replies correctly decline the out-of-bank "integration by parts" ask rather than answering it from general knowledge, and correctly redirect to the open card.
- Overall this slice is unusually clean: every mark-arithmetic statement across all 5 "marks"/"skiplast" replies checks out against the authored MARK SPLIT except the one flagged phrasing issue above. No wrong formula, no invented step, no wrong final numeric answer anywhere in the 50 replies.
