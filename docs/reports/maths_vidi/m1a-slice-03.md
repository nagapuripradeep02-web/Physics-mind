# Vidi audit — Maths 1A slice 3

Replies graded: 50 (guard replies excluded: 0)
Mean score: 2.88 / 3        (= 9.6 / 10)
Grade counts: 3 -> 44 · 2 -> 6 · 1 -> 0 · 0 -> 0

Five question cards in this slice, each probed with the same 10 chat templates
(marks, whystep, mistakes, remember, important, explain, skiplast, why,
outofbank, telugu): `pv_skew_lines_distance` (LAQ 8M, 6 steps), `pv_sqp_unit_normal_pqr`
(SAQ 4M, 3 steps), `sr_parallel_lines_equivalence` (VSAQ 2M, 2 steps, predicted),
`sr_relation_2x_plus_y_41_properties` (VSAQ 2M, 2 steps, predicted),
`ss_am_gm_ratio_m_n` (VSAQ 2M, 2 steps, predicted).

## Per-template means
| template | n | mean | notes |
|---|---|---|---|
| marks | 5 | 3.00 | Every reply correctly quoted the bank's mark split (8/4/2/2/2 totals all right) and named which step earns which mark. |
| whystep | 5 | 2.80 | Content always accurate. One reply (relation_2x_plus_y_41, s2_properties) is flagged `OVER_BUDGET(172w/140)` — flag is correct, reply is genuinely padded, scored 2. |
| mistakes | 5 | 3.00 | Consistently reproduces the bank's MISTAKES fields faithfully across every step of every card. |
| remember | 5 | 2.20 | **Weakest template.** 4 of 5 replies answer for the ENTIRE question's step sequence regardless of which single step the student had open (e.g. student has step 1 of 2 open, reply gives memory tips for both steps + the full solution flow). Only `pv_sqp_unit_normal_pqr`'s reply stayed scoped to the open step and scored 3. Content itself is never wrong — this is a padding/scope pattern, not a correctness one. |
| important | 5 | 3.00 | Correctly separates "asked in real exams" (skew_lines: TS 2019/2017, AP 2020/2016) from "predicted by this answer book, no exam history" (the 3 predicted cards) — and for `unit_normal_pqr` (starred but with no Asked line) correctly said "the book does not list any specific exam years... I cannot say it appeared" rather than concluding it was never asked, exactly per the card's own instruction. |
| explain | 5 | 3.00 | Thorough, accurate walkthroughs; every final number (9, ±(2i+j+k)/√6, "R has 20 pairs", the m±√(m²−n²) ratio) matches the bank. |
| skiplast | 5 | 3.00 | Correctly arithmetic'd remaining marks after dropping the last step in every case: 8−3=5, 4−1=3, 2−1=1 (×3). |
| why | 5 | 2.80 | One reply (relation_2x_plus_y_41) flagged `OVER_BUDGET(210w/150)`, ~40% over — flag correct, content correct but padded, scored 2. |
| outofbank | 5 | 3.00 | Never invents an "integration by parts" answer; consistently declines and redirects to the open card. |
| telugu | 5 | 3.00 | Content is numerically accurate in all 5 Telugu replies (verified the 108/12=9, the four relation counterexamples, etc.). Flagged below as a policy question, not a content defect. |

## Every reply scored 0 or 1
None. Zero replies in this 50-reply slice scored 0 or 1 — no wrong mark value, no wrong total, no invented step, no wrong formula, and no wrong final answer anywhere in the sample. Every numeric claim I hand-checked against the ANSWER FACTS (108/12=9; |PQ×PR|=4√6; the 20-pair relation and its three counterexamples 3≠41, 79≠41, 31≠41; the m±√(m²−n²) derivation) was correct.

## Mechanical flags that were wrong
None found wrong in this slice. Two `OVER_BUDGET` flags fired (both on the `relation_2x_plus_y_41` card: whystep 172w/140, why 210w/150) and both were legitimate — the flagged replies were genuinely the two longest, most padded replies in the sample. Worth noting as a contrast to other slices: the flag mechanism worked correctly here.

## Truncated replies
None. No reply in this slice stops mid-sentence or mid-formula; every reply (including the two over-budget ones) ends on a complete thought.

## Anything else worth the founder's attention
1. **The `remember` template systematically over-answers.** Across 4 of 5 cards, when a student has only ONE step open and asks "how do I remember this," Vidi replies with memory tips for the WHOLE solution (all steps), not just the open one. For the 6-step LAQ this means a tip dump covering formula → identify → cross → dot → magnitude → divide when only "the formula" step was open. This never states anything wrong, so it never drops below 2, but it's a real length-discipline gap distinct from the two OVER_BUDGET-flagged replies (which the flag catches) — this one isn't flagged by the mechanical check at all, meaning the flag system misses template-level scope creep that isn't raw word count.
2. **Telugu replies exist in this transcript.** All 5 `[telugu]` replies answer fully in Telugu on request ("idi telugu lo simple ga cheppu"). Content is accurate, but CLAUDE.md Rule 30i states the PhysicsMind product is English-only with Telugu retired and no language picker. Worth confirming with the founder whether that rule is scoped to the physics simulation product only, or whether the Maths answer-book chat companion (Vidi) is meant to refuse/redirect non-English requests too — this reads like a live policy gap rather than a grading defect.
3. On the correctness axis this is a clean slice — the only drag on the mean is verbosity/scope discipline on `remember` and, in one card, `whystep`/`why`.
