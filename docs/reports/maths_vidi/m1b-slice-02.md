# Vidi audit — Maths 1B slice 2

Replies graded: 50 (guard replies excluded: 0)
Mean score: 2.96 / 3        (= 9.87 / 10)
Grade counts: 3 -> 48 · 2 -> 2 · 1 -> 0 · 0 -> 0

Five templates-worth of questions, ten student-ask templates each (`marks`, `whystep`, `remember`,
`important`, `mistakes`, `skiplast`, `outofbank`, `explain`, `why`, `telugu`):

1. `ts_ipe_m1b_dc_four_diagonals_cos_squares` — D.C's & D.R's, LAQ 8M
2. `ts_ipe_m1b_dif_cos_inverse_a_cos_x_plus_b` — Differentiation, LAQ 8M (widest 1B context)
3. `ts_ipe_m1b_dif_first_principle_root_x_plus_1` — Differentiation, SAQ 4M
4. `ts_ipe_m1b_dif_sin_inverse_and_tan_inverse_equal_derivatives` — Differentiation, LAQ 8M
5. `ts_ipe_m1b_dif_tan_inverse_log_x` — Differentiation, VSAQ 2M

**Headline: zero 0s and zero 1s.** No reply invented a mark value, a wrong total, a wrong step, or
a wrong formula/final answer anywhere in this 50-reply slice. Every `skiplast` reply's arithmetic
(total marks minus the skipped step) was verified correct against the MARK SPLIT line on all five
questions. Every `important` reply correctly used the required "no frequency rank is published"
phrasing instead of the forbidden "the book gives it no star" on the four questions where STARS
was unpublished, and Q1's 3-star + Asked-years claim was quoted exactly as given.

## Per-template means
| template | n | mean | notes |
|---|---|---|---|
| marks | 5 | 2.8 | one reply (Q4) omits the numeric split every sibling gives |
| whystep | 5 | 3.0 | — |
| remember | 5 | 3.0 | — |
| important | 5 | 3.0 | all correctly avoided the banned "no star" phrasing |
| mistakes | 5 | 3.0 | every MISTAKES-field claim traced back to a real card field |
| skiplast | 5 | 3.0 | arithmetic verified correct on all 5 |
| outofbank | 5 | 3.0 | all declined cleanly, redirected to the open question |
| explain | 5 | 2.8 | one reply (Q2) is the !TRUNCATED cut, see below |
| why | 5 | 3.0 | — |
| telugu | 5 | 3.0 | — |

## Every reply scored 0 or 1
None. All 50 replies scored 2 or 3.

## Two replies scored 2 (for completeness, since nothing scored 0/1)
- **Q4 `[marks]`** (`ts_ipe_m1b_dif_sin_inverse_and_tan_inverse_equal_derivatives`): *"For full
  marks, write all five steps exactly as the answer shows. The two mark steps need their working
  lines, not just the final result. The last two one-mark steps are short sentences, so do not
  over-write them."* Nothing here is wrong — the "two mark steps"/"last two one-mark steps"
  grouping matches the 2M+2M+2M+1M+1M split exactly — but unlike the `[marks]` reply on every
  other question in this slice, it never states the actual point values or the 8-mark total.
  Model defect, not a card defect: the fact block carries the numbers plainly, so this is the
  model choosing to summarize rather than a gap in the ANSWER FACTS.
- **Q2 `[explain]`** (`ts_ipe_m1b_dif_cos_inverse_a_cos_x_plus_b`): the `!TRUNCATED` reply — see
  below. Everything stated before the cut is accurate; it is marked down only for never reaching
  its own conclusion.

## Mechanical flags that were wrong
None in this slice. Two flags fired and both were accurate hits, not false positives:
- `!TRUNCATED` on Q2 `[explain]` — genuine max_tokens cut (confirmed by reading the reply).
- `IDIOM:the whole trick` on Q4 `[explain]` — the reply does use the informal phrase "the whole
  trick of the question." It is not one of Rule 41's listed examples (fate/grip/ceiling/personified
  forces) but it is colloquial register rather than plain literal English, so the flag is a fair
  catch, not a false one.

## Truncated replies
**Q2 `[explain]`** on `ts_ipe_m1b_dif_cos_inverse_a_cos_x_plus_b` (the widest 1B context in the
bank) was cut by max_tokens. Everything the reply says up to the cut is correct and grounded in
the ANSWER FACTS (half-angle substitution, the k-simplification, the s = tan φ / cos 2φ trick,
the chain-rule differentiation with the factor-2 cancellation). It stops mid-sentence here:

> "...Using cos² + sin² = 1 and cos² − sin² = cos x, the denominator becomes a + b cos x. The
> constant k(a +"

**What the student loses:** the reply never finishes explaining that k(a+b) = √(a²−b²), so the
leading constant cancels to exactly 1 — and it never restates the final result f′(x) =
1/(a + b cos x), which is the entire point of the question ("show that..."). A student reading
this reply for the first time (their own stated context: "I am seeing it for the first time")
is left one sentence short of the actual proof closing. Nothing stated is wrong, but the answer
never arrives.

## Anything else worth the founder's attention
- **No exam-costing errors found in this slice.** Across 50 replies spanning 5 questions (one of
  them the widest 1B context in the bank) and every ask-template including `marks` and `skiplast`
  — the two templates most likely to misstate a mark value — nothing did.
- The `[marks]` template is the only one with a real quality gap (2.8 mean, driven by the single
  vague Q4 reply). Every other `[marks]` reply in this slice explicitly enumerated the per-step
  point values; Q4's did not. Worth a prompt nudge if this pattern repeats in other slices.
- The Telugu replies (10/10 correct) stayed on-topic, kept technical terms in Latin script per the
  code-mix convention, and did not introduce any new claims not present in the English replies.
