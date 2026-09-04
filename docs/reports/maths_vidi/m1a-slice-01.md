# Vidi audit — Maths 1A slice 1

Replies graded: 50 (guard replies excluded: 0)
Mean score: 2.98 / 3        (= 9.9 / 10)
Grade counts: 3 -> 49 · 2 -> 1 · 1 -> 0 · 0 -> 0

## Per-template means
| template | n | mean | notes |
|---|---|---|---|
| ts_ipe_m1a_av_sqp_chain_od (vector chain OD, 2M) | 10 | 3.00 | all precise; every mark value, sign, and component sum matched the facts |
| ts_ipe_m1a_fn_gof_bijective (gof bijective proof, 8M) | 10 | 2.90 | 9 precise; one Telugu reply scored 2 (see below) |
| ts_ipe_m1a_hf_sinh_three_quarters (cosh2x/sinh2x, 2M) | 10 | 3.00 | all precise, incl. correctly rejecting the circular (cos-style) formula every time |
| ts_ipe_m1a_it_sin_plus_two_tan (inverse-trig proof, 4M) | 10 | 3.00 | all precise, incl. correct mark grouping (3M "Method" across s1–s3, 1M "Conclusion" for s4) |
| ts_ipe_m1a_mat_det_1_a2_a3 (determinant proof, 8M) | 10 | 3.00 | all precise, incl. correct 5×1M + 1×3M split and the two-sign-flip ordering fix at the end |

## Every reply scored 0 or 1
None. No reply in this slice states a wrong mark value, wrong total, an invented step, a wrong
formula, or a wrong final answer. Nothing here would cost a student marks if copied into an exam.

## The one reply scored 2
**Template:** ts_ipe_m1a_fn_gof_bijective | **[telugu]**, no step open
**Student asked:** "idi telugu lo simple ga cheppu" (explain this simply in Telugu)
**Vidi replied:**
> సరే, ఈ ప్రశ్న చాలా సింపుల్. ఇందులో రెండు భాగాలు మాత్రమే చేయాలి: ముందుగా gof ఒక one one function
> అని నిరూపించాలి, తర్వాత అది onto function అని నిరూపించాలి. ఈ రెండూ నిరూపించాక, gof ఒక bijective
> function అని రాస్తే సరిపోతుంది.
(Translation: "This question is very simple. Only two parts need doing: first prove gof is
one-one, then prove it's onto. After proving both, write that gof is bijective — that's enough.")

**Why it scored 2, not 3:** nothing stated is false, so it clears the 0/1 bar cleanly. But this is
an 8-mark proof whose whole difficulty is technique (peel g off before f in the one-one half; walk
backwards from c→b→a in the onto half — both called out explicitly by name in the ANSWER FACTS'
REMEMBER lines). The Telugu reply gives the two-part *shape* only and none of the mechanics — a
student asking "cheppu" (explain it to me) on this specific proof gets nothing they didn't already
know from the question itself. Every other Telugu reply in this slice (4 of 5 templates) carries
the actual formulas/method; this is the one outlier that reads as padding rather than teaching.
**Defect attribution:** the model's, not the card's — the ANSWER FACTS for this question do carry
the technique detail (WHY/REMEMBER fields for s2 and s3), so a correct reading of the facts would
have supported a fuller answer. This looks like the model choosing brevity for the Telugu-request
path specifically, not a gap in the source material.

## Mechanical flags that were wrong
None to report — this slice carries no inline mechanical flags (only the generic scoring-rubric
text at the top of the file mentions that flags exist elsewhere in the audit set). Nothing to
grade against here.

## Truncated replies
None. Every reply in this slice ends on a complete sentence/formula; nothing was cut by the
max_tokens cap.

## Anything else worth the founder's attention
- This slice is clean on the metric that matters most: zero replies a student could copy into an
  exam and lose marks for. Every quoted mark split, sign convention (hyperbolic vs. circular
  double-angle formulas — a classic trap this paper tests twice), row-operation order, and final
  answer matched the ANSWER FACTS exactly across all 5 templates.
- `[outofbank]` behaved correctly in every instance (5/5): Vidi declined the "integration by
  parts" off-topic ask, pointed to the catalog, and offered to continue with the open question —
  never hallucinated an answer to a question the bank doesn't hold open.
- `[skiplast]` correctly recomputed partial-credit totals against the authored mark split in all 5
  instances, including the two 8-mark questions where the arithmetic (8 − 3 = 5, 8 − 0 = 8) takes
  an extra step. Worth spot-checking more `[skiplast]` replies on questions with uneven mark
  splits in later slices, since this is where a model is most likely to silently drop a mark.
- The one 2-grade above is a Telugu-specific vagueness, not a factual defect — worth watching
  across slices to see if Telugu replies are systematically thinner than English ones for
  higher-mark/multi-technique questions, since that would be a pattern rather than a one-off.
