# Vidi audit — Maths 1B slice 3

Replies graded: 47 (guard replies excluded: 3)
Mean score: 2.98 / 3        (= 9.9 / 10)
Grade counts: 3 -> 46 · 2 -> 1 · 1 -> 0 · 0 -> 0

Source file: `.answerbook_logs/audit_sample_m1b.slice-03.md` — 5 cards ×10 templates = 50 replies,
of which 3 (all in the locus card) were the transient-network GUARD reply and excluded per instructions.

## Per-template means
| template | n | mean | notes |
|---|---|---|---|
| marks | 4 | 3.00 | one occurrence (locus card) was a GUARD reply, excluded |
| whystep | 5 | 3.00 | |
| remember | 5 | 3.00 | |
| explain | 5 | 3.00 | |
| skiplast | 5 | 3.00 | mark arithmetic (marks lost vs. marks retained) checked correct in all 5 |
| mistakes | 5 | 3.00 | |
| important | 4 | 2.75 | one GUARD reply excluded; the lim-card reply scored 2 (see below) |
| why | 4 | 3.00 | one occurrence (locus card) was a GUARD reply, excluded |
| outofbank | 5 | 3.00 | correctly declined every time, never fabricated an answer |
| telugu | 5 | 3.00 | code-mixed Telugu summaries all matched the facts |

Every card (tan_inverse_root, three_tan_inverse_sum, lim_x2_minus_8x..., locus, pl_check) scored a
perfect run except one reply on the limits card.

## Every reply scored 0 or 1
None. Zero replies in this slice scored 0 or 1 — no invented steps, no wrong mark values or totals,
no wrong final answers, no wrong formulas found anywhere in the 47 graded replies.

## The one reply scored 2 (for completeness, since it's the only non-3)
Card: `ts_ipe_m1b_lim_x2_minus_8x_plus_15_over_x2_minus_9` · template `[important]` (no step open)
**Student asks:** is this question important? did it come in previous exams?
**Vidi replies:**
> I don't have that question open, and I can't see its past exam record. I've noted it, and you can open it from the catalog if it is in the book.
>
> For the question you do have open — the limit question — no frequency rank is published for it, and the book does not list any past exam years for it. So I can't say whether it appeared before.
>
> What I can say: it is a 2-mark Section A question, and the important step is to factorise both parts, cancel (x − 3), then substitute to get −1/3.

Why it scored 2, not 3: the opening sentence ("I don't have that question open, and I can't see its
past exam record") is a leftover **outofbank-decline** framing bolted onto an in-bank answer — the
limits question plainly IS the open card (that's what the ANSWER FACTS are for), so telling the
student "I don't have that question open" before immediately reversing to "For the question you do
have open — the limit question —" is internally contradictory. Every fact stated afterward (no
frequency rank published, no exam years listed, 2-mark Section A, correct method summary, correct
−1/3) is accurate, so this is not exam-unsafe — just confusing framing that could make a student
think Vidi lost track of their question. **This looks like a card/CARD defect, not a fact-grounding
defect** — the model had the right facts and used them correctly once it got past the confusing
opener, so it would not have produced the error even with a perfect reading of the facts; the defect
is in how the [important] template composes its opening line when "no step open," not in physics or
mark-scheme content.

## Mechanical flags that were wrong
None found wrong. The only flag type present in this slice was `GUARD_REPLY`, which fired 3 times
(all three on the locus card: `[marks]`, `[important]`, `[why]`), and all 3 were genuine — the reply
text matched the guard string exactly ("I could not answer just now. The answer book still works —
keep going, and try me again in a moment."). No other regex flags appear anywhere in this slice's 50
replies, so there is nothing else to audit for false positives/negatives here.

## Truncated replies
None. Every one of the 47 graded replies (and all 3 guard replies) ends on a complete sentence with
terminal punctuation — no reply in this slice was cut off by the max_tokens cap.

## Anything else worth the founder's attention
1. **The `[important]` template confuses itself when the open card has no exam history to report**
   (see the scored-2 reply above). Worth checking whether the prompt/template for `[important]`
   sometimes reuses out-of-bank decline language even when the currently open card IS the one being
   asked about. Low severity (content stays correct) but worth a copy fix — a student re-reading it
   could momentarily doubt whether Vidi is even looking at their question.
2. **Card-authoring artifact, not a model defect:** in the locus card
   (`ts_ipe_m1b_loc_right_angle_2_3_minus1_5`), step `s4_simplify_to_the_locus`'s MISTAKES text reads
   "Losing a sign when expanding a bracket like (y − 4)²" — but this problem's actual brackets are
   (y − 3)² and (y − 5)² (point B is (−1, 5)); "(y − 4)²" doesn't occur anywhere in this question's
   real working, and looks like a copy-paste leftover from a different card. Vidi's `[mistakes]` reply
   silently used the mathematically-relevant "(y−5)²" instead of parroting the card's own (wrong for
   this problem) illustrative bracket — the right call for the student, but it means the underlying
   card text has a small authoring bug worth fixing at the source so future replies (or a student
   reading the raw card) don't see the mismatched "(y − 4)²".
3. Both the "this answer book's split, not the book's" cards (tan_inverse_root,
   three_tan_inverse_sum, lim) and the "this is the source book's split" card (pl_check) were narrated
   with the correct attribution in every reply that touched mark-split provenance — no card
   mis-attributed a split to the wrong source.
4. Star/frequency-rank phrasing was handled correctly across all three distinct cases in this slice:
   "none published, don't say zero" (tan_inverse_root, three_tan_inverse_sum), "3 of 3, has an Asked
   line" (locus — not directly asked about in the non-guard replies), and "0 of 3, book genuinely
   gives it no star" (pl_check) — Vidi never conflated "unpublished" with "published zero" in either
   direction.
