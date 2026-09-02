# Vidi audit — Maths-2A, slice 2 of 11

Grading followed the frozen rubric printed at the top of
`.answerbook_logs\audit_r1_ts_ipe_m2a.slice-02.md` (3-point scale, graded against the ANSWER
FACTS shown above each group, never against my own maths knowledge). Every reply in the slice
was graded; none were sampled. All 24 question groups in this slice are Section A VSAQ (2 marks)
or Section B SAQ (4 marks) — no LAQ (7-mark) cards appear in this slice, so the "8 marks for an
LAQ" trap named in the grading brief does not arise here.

Slice contents: 24 question groups × 10 templates (`marks`, `whystep`, `remember`, `explain`,
`mistakes`, `important`, `skiplast`, `why`, `outofbank`, `telugu`) = 240 replies. Zero guard
replies ("I could not answer just now" / "Give me a short moment") appeared.

## 1. Per-template table

| Template | Mean | 0 | 1 | 2 | 3 |
|---|---|---|---|---|---|
| marks | 3.000 | 0 | 0 | 0 | 24 |
| whystep | 3.000 | 0 | 0 | 0 | 24 |
| remember | 3.000 | 0 | 0 | 0 | 24 |
| explain | 3.000 | 0 | 0 | 0 | 24 |
| mistakes | 3.000 | 0 | 0 | 0 | 24 |
| important | 2.958 | 0 | 0 | 1 | 23 |
| skiplast | 3.000 | 0 | 0 | 0 | 24 |
| why | 3.000 | 0 | 0 | 0 | 24 |
| outofbank | 2.667 | 0 | 1 | 6 | 17 |
| telugu | 3.000 | 0 | 0 | 0 | 24 |

## 2. Overall mean

**Overall mean: 2.963** (sum 711 / 240 replies, to three decimals: 711/240 = 2.9625 → 2.963).
Reply count: **240**. Guard replies excluded from the mean: **0**.

The score is dragged down entirely by the `outofbank` template's habit of volunteering content
of the *open* question after correctly declining the off-bank one (see item 4), plus one
`important` reply that leaked a full worked numeric answer. Every other template scored a clean
3.000 across all 24 instances — this is an unusually strong slice on raw correctness; the content
`marks`/`whystep`/`remember`/`explain`/`mistakes`/`skiplast`/`why`/`telugu` replies were checked
line-by-line against the ANSWER FACTS (mark arithmetic, sign handling, formula direction, exam-year
citation, "no Asked line" phrasing) and I found no falsehoods, no invented steps, and no invented
mark values anywhere in those 216 replies.

## 3. Every reply scored 0 or 1

Only one reply fell below 2. No reply scored 0.

**`ts_ipe_m2a_bt_vsaq_largest_22cr_find_13cr` — `outofbank` (no step open) — scored 1**

> I don't have that question open right now — integration by parts is not in the Maths 2A
> syllabus I can see, so I cannot outline it or give its steps.
>
> I have noted your question. If it is in the book, you can open it from the catalog.
>
> For the question I do have open — the binomial coefficient problem — I can help you with that
> whenever you are ready.

Reason: this asserts a curriculum-scope claim — "integration by parts is not in the Maths 2A
syllabus" — that is nowhere in the ANSWER FACTS given for this card. It happens to be broadly
true (integration by parts is a Maths-2B/calculus topic), but Vidi has no grounding to assert it
from this card's facts, and every other `outofbank` reply in the slice correctly limits itself to
"I don't have that question open" without inventing a syllabus verdict. A confidently wrong
version of this same move (asserting a topic is out-of-syllabus when it is not) would misdirect a
student's revision with no way for them to catch it.

## 4. Four explicit counts

- **WRONG-STEP: 0 of 24.** Every `whystep` reply addressed the exact step named in the ask
  (`s2_evaluate`, `s2_add`, `s3_sides`, etc.) and attributed marks to the correct step. No
  misattribution found.
- **SCOPE-CREEP: 6 of 24.** All 24 `outofbank` replies correctly declined the off-bank question
  (integration by parts). Six then volunteered unsolicited steps/formulas/answers of the *open*
  question beyond a bare offer to help:
  - `ts_ipe_m2a_bt_vsaq_coefficient_x11_2x2` — volunteers "the first step is to write the general
    term and set 26 − 5r = 11."
  - `ts_ipe_m2a_bt_vsaq_largest_coefficient_24_19` — volunteers "even n gives one middle
    coefficient, while odd n gives two equal middle ones."
  - `ts_ipe_m2a_bt_vsaq_validity_3_minus_4x` — volunteers the actual final answer: "the validity
    set E for (3 − 4x)^(3/4) is the open interval (−3/4, 3/4)."
  - `ts_ipe_m2a_cn_1_minus_i_cubed_times_1_plus_i` — volunteers "pair one (1 − i) with (1 + i)
    first, since that conjugate pair gives the real number 2."
  - `ts_ipe_m2a_cn_arg_product_minus_1_minus_i` — volunteers the complete worked answer: "the two
    marks come from writing Arg(−1) = π and Arg(−i) = −π/2, then adding them to get π/2."
  - `ts_ipe_m2a_cn_argand_square` — volunteers "the square proof needs six distances: four sides
    and two diagonals."
  None of these are factually wrong, so they were graded 2 (acceptable but over the length the
  ask deserved), not lower — but they are a real, repeated pattern worth a prompt fix: the
  `outofbank` instruction should decline-and-stop, or decline-and-offer without previewing content.
- **LITERAL-MARKDOWN: 0 of 240.** No reply in this slice contains `**`, a leading `- ` bullet, a
  `#` heading, or backticks. All replies are plain prose in blockquote form.
- **TRUNCATED: 0 of 240.** Every reply ends on a complete sentence and a complete formula/value;
  none cut off mid-word or mid-expression.

## 5. Mechanical flags shown under a reply I judge wrong

None. This slice's raw file does not display any mechanical/regex flag annotations under any of
the 240 replies, so there is nothing to report here.

## 6. Cards whose ANSWER FACTS are themselves wrong, self-contradictory, or ambiguous

**None found in this slice.** I independently re-derived the mathematics of all 24 cards from
scratch against their WRITE lines (binomial general-term/middle-term/independent-term/validity
algebra, complex-number multiplication/conjugation/argument arithmetic, and all three
Argand-plane distance proofs) and checked every MARK SPLIT sums correctly against its card's
stated total (2 marks for VSAQ, 4 for SAQ), every WHY/NOTE field for internal consistency with its
own MARK SPLIT label, and every STARS/Asked block for consistency with its own "no Asked line"
disclaimer where applicable. All 24 cards checked out: no unbalanced equation, no step that
doesn't follow, no NOTE contradicting its own MARK SPLIT, no sign error, and no self-contradiction
between sibling statements. This is a genuinely clean slice on the bank-defect axis — worth
flagging as a positive data point for round-to-round comparison, since most prior audit rounds in
this corpus have surfaced at least one bank defect per slice.
