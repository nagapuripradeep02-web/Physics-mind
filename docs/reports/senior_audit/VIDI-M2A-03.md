# Vidi audit — TS IPE Maths-2A, slice 3 of 11

Slice file: `.answerbook_logs\audit_r1_ts_ipe_m2a.slice-03.md`
Subject: Maths-2A (Complex Numbers chapter). Paper is the 75-mark pre-reform paper
(w.e.f. 2026-27): Section B SAQ = 4 marks, Section C LAQ = 7 marks (none of this
chapter's cards are LAQ — every card in this slice is either a 2-mark VSAQ or a
4-mark SAQ). No 8-mark LAQ value appears anywhere in this slice.

24 question cards × 10 templates = **240 replies**, every one graded (no sampling).
0 guard replies ("I could not answer just now" / "Give me a short moment") found.

## 1. Per-template table

| Template | Mean | 0 | 1 | 2 | 3 |
|---|---|---|---|---|---|
| marks | 3.000 | 0 | 0 | 0 | 24 |
| whystep | 3.000 | 0 | 0 | 0 | 24 |
| remember | 3.000 | 0 | 0 | 0 | 24 |
| explain | 3.000 | 0 | 0 | 0 | 24 |
| mistakes | 3.000 | 0 | 0 | 0 | 24 |
| important | 3.000 | 0 | 0 | 0 | 24 |
| skiplast | 3.000 | 0 | 0 | 0 | 24 |
| why | 3.000 | 0 | 0 | 0 | 24 |
| outofbank | 2.833 | 0 | 0 | 4 | 20 |
| telugu | 3.000 | 0 | 0 | 0 | 24 |

## 2. Overall mean

**Overall mean: 2.983** (sum of scores 716 ÷ 240 replies). Reply count: **240**.
Guard replies excluded from the mean: **0**.

## 3. Every reply scored 0 or 1

**None.** No reply in this slice states a falsehood, invents a mark value or a
step, answers an off-bank question instead of declining it, or leaves a student
with something factually wrong. The four replies marked down (item 4 below) were
docked to 2, not 0/1, because their added content was itself correct — the
defect is that it was unsolicited, not that it was wrong.

## 4. The four explicit counts

**WRONG-STEP: 0 of 24.** Every `whystep` reply explains the step actually named
in its "step s..." field and attributes that step's own mark value to it
correctly. Checked all 24 individually (e.g. card
`ts_ipe_m2a_cn_z_3_minus_5i_cubic`'s whystep opens on `s2_factor` and correctly
calls out the 2-mark factorisation, not the 1-mark quadratic-building step or
the 1-mark conclusion step; card `ts_ipe_m2a_cn_sqp_conjugate_5i_over_7_plus_i`'s
whystep opens on `s2_conjugate` and, while it recaps step 1's simplification as
necessary context, its actual "why is this step here" answer and mark
attribution are for step 2, not a misattribution).

**SCOPE-CREEP: 4 of 24.** All four are `outofbank` replies that correctly
decline the off-paper "integration by parts" question, then go on to volunteer
steps/marks/exam-history of the OPEN question the student did not ask for
(the rubric's "a bare one-sentence offer to help is NOT creep; content is"
line is what these cross):

- `ts_ipe_m2a_cn_modamp_minus_root3_plus_i` — outofbank: "*For the question that
  is open — the complex number −√3 + i — the marks are: modulus r = 2 for the
  first mark, and θ = 5π/6 from the second quadrant for the second mark.*" —
  hands over the full numeric answer and mark breakdown unprompted.
- `ts_ipe_m2a_cn_sqp_conjugate_5i_over_7_plus_i` — outofbank: "*For the question
  that is open, the important step is to simplify 5i/(7 + i) to a single a + ib
  form first, then flip only the sign of the imaginary part to write the
  conjugate.*" — volunteers the method, not just an offer to help.
- `ts_ipe_m2a_cn_sqp_root3_plus_i_power_100` — outofbank: "*For the question I
  can see, the key steps are taking the modulus of both sides and then
  squaring...*" — names both steps unprompted (milder than the two above, but
  still content, not a bare offer).
- `ts_ipe_m2a_cn_sqp_z_minus_1_over_z_cos_sin` — outofbank: "*That one is a
  2-mark question and has been asked in TS 2022 and 2019.*" — volunteers marks
  and exam history, both explicitly named in the rubric's content list.

  All four are factually accurate (nothing false is added), which is why they
  were graded 2 rather than 0/1, but they are genuine scope-creep by the
  rubric's own test.

**LITERAL-MARKDOWN: 0 of 240.** Searched every blockquoted Vidi reply line for
`**`, backticks, leading `- ` bullets, and `#` headings — no matches inside any
reply (the only markdown in the file is the audit rubric text and the file's
own `###`/`##` section structure, neither of which is reply content).

**TRUNCATED: 0 of 240.** Every reply read in full ends on a complete sentence
(or, for the math-heavy ones, a complete final line/equation); none stop
mid-formula.

## 5. Mechanical flags on replies judged WRONG

None — no reply in this slice was judged wrong (0/1).

One mechanical flag fires in this slice, and it is worth reporting per the
instruction that a flag firing on a CORRECT reply is itself a finding:
`ts_ipe_m2a_cn_sqp_root3_plus_i_power_100`'s `[why]` reply carries
`_flags: IDIOM:the whole trick_` for the closing line "*So the whole trick is
that the modulus removes the complicated power, and the rest is just
arithmetic.*" The physics/maths content of that reply is fully correct and
grounded in the facts (graded 3 under this rubric, which scores correctness
against the ANSWER FACTS, not register) — so this flag is a true positive on
plain-language grounds (informal idiom, consistent with the platform's
separate Rule-41 plain-language concern) but NOT a correctness defect under
this audit's rubric. Worth flagging to whoever owns wording/register review,
not a grading mark-down here.

## 6. Cards whose ANSWER FACTS are themselves wrong, self-contradictory, or ambiguous

**None found in this slice.** All 24 cards' model answers were independently
re-derived and checked for internal consistency:

- Every MARK SPLIT total matches the card's stated marks (4M SAQ cards split
  as 1+2+1 or 1+1+1+1; 2M VSAQ cards split as 1+1), and every step's own
  EARNS-THE-MARK-FOR / NOTE / WHY agree with that split — no step's narrative
  contradicts its own mark weight.
- Every final numeric/symbolic answer was re-derived from the question and
  checked to match the WRITE block: e.g. `cn_real_x_y_3_plus_i_3_minus_i`'s
  x = −4, y = 6 was verified by substituting back into the original equation
  (z = i, checks exactly); `cn_z_3_minus_5i_cubic`'s factorisation
  (z − 4)(z² − 6z + 34) = z³ − 10z² + 58z − 136 was verified by expansion;
  every modulus-amplitude card's r/θ pair was verified against the quadrant
  of the actual point.
- One card, `ts_ipe_m2a_cn_modamp_minus_1_minus_i`, deliberately documents a
  SOURCE-BOOK error (the book prints θ = 3π/4, which is wrong — that angle is
  the point (−1, 1), not (−1, −1)) — but the ANSWER FACTS themselves correctly
  identify and correct the slip (θ = −3π/4), so the facts as authored are NOT
  self-contradictory; they are internally consistent and the Vidi replies for
  that card correctly use the corrected value throughout.
- No sibling-statement conflicts, no unbalanced equations, and no "no Asked
  line" card was misread as "never asked" by the facts themselves (this trap
  is explicitly guarded against in the facts' own phrasing on every such card,
  and it holds up).

If a defect exists in this chapter's bank, it is not in the 24 cards covered
by this slice.
