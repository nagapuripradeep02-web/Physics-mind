# Vidi audit — slice 1 of 11 — Maths 2A (ts_ipe_m2a)

Grading reader pass over `audit_r1_ts_ipe_m2a.slice-01.md`. Rubric followed exactly as printed at
the top of the slice (0–3 scale, graded against the ANSWER FACTS shown above each group, never
against my own knowledge). 24 cards × 10 templates = 240 replies. All 240 graded; none sampled.
This paper's LAQs are 7-mark questions (75-mark pre-reform Maths 2A paper), confirmed consistent
throughout the slice — no reply anywhere claimed 8 marks for an LAQ.

## 1. Per-template table

| Template | Mean | 0 | 1 | 2 | 3 |
|---|---|---|---|---|---|
| marks | 3.000 | 0 | 0 | 0 | 23 (excl. 1 guard) |
| whystep | 2.917 | 0 | 1 | 0 | 23 |
| remember | 3.000 | 0 | 0 | 0 | 24 |
| explain | 3.000 | 0 | 0 | 0 | 24 |
| mistakes | 3.000 | 0 | 0 | 0 | 24 |
| important | 3.000 | 0 | 0 | 0 | 24 |
| skiplast | 3.000 | 0 | 0 | 0 | 24 |
| why | 3.000 | 0 | 0 | 0 | 24 |
| outofbank | 2.833 | 0 | 0 | 4 | 20 |
| telugu | 3.000 | 0 | 0 | 0 | 24 |

## 2. Overall mean

**Overall mean: 2.975** (711 points / 239 scored replies), reply count **240** total in the slice.
**Guard replies: 1** — excluded from the mean, counted separately here. It appeared on
`ts_ipe_m2a_bt_c0_c1_by_2_corollary` template `marks`: *"I could not answer just now. The answer
book still works — keep going, and try me again in a moment."* (flagged `GUARD_REPLY`).

## 3. Every reply scored 0 or 1

Exactly one reply scored below 2 in this slice — a **1 (weak/misleading)**:

- **Question id:** `ts_ipe_m2a_bt_vsaq_4th_term_from_end_2a_5b` — **template:** `whystep` (step `s2_evaluate`)
  **Reply:**
  > "This step is here to turn the term from the end into a term from the beginning, because the
  > formula for the general term works from the start of the expansion. When you reverse the
  > bracket to (5b + 2a)⁸, the 4th term from the end of the original becomes the 4th term from the
  > start, so you can use T₄ directly. That is the whole point of this step — it saves you from
  > using the longer from-the-end formula."

  **Reason:** the student had step `s2_evaluate` open ("Evaluate — 1M", whose own WHY is "The
  examiner accepts the factored form; the number is a check that the factors were read
  correctly"). The reply instead explains step `s1_setup`'s purpose (reversing the bracket) end to
  end, and never once addresses why step 2 — actually doing the arithmetic ⁸C₃·5⁵·2³ — exists. A
  student reading this while step 2 is open would come away thinking step 2 *is* the
  bracket-reversal, which already happened in step 1. This is the slice's one clean WRONG-STEP case
  (see item 4).

No reply scored 0 anywhere in the slice — no falsehood, invented mark value, invented step, or
answered-instead-of-declined off-bank question was found.

## 4. Four explicit counts

- **WRONG-STEP:** 1 of 24 `whystep` replies — `ts_ipe_m2a_bt_vsaq_4th_term_from_end_2a_5b` (quoted
  above; explains step `s1_setup` while step `s2_evaluate` is the one open). Every other `whystep`
  reply in the slice (23/24) correctly matched the named step and its own mark(s) — including the
  other three 2-step VSAQ cards (`vsaq_6th_term…`, `vsaq_7th_term…`, `vsaq_c0_2c1_4c2_3n`), which
  all correctly distinguished step 2 ("evaluate/combine/substitute") from step 1 ("setup").

- **SCOPE-CREEP:** 4 of 24 `outofbank` replies volunteered real content of the open question beyond
  a bare offer to help, after correctly declining the off-bank ask:
  - `ts_ipe_m2a_bt_series_5_by_2fact_3_find_x2_4x` — states the open question's method: "the
    important step is rewriting each term so every denominator has a factorial and the ratio is
    (1/3)" — the actual REMEMBER content of step `s1_rewrite`, unrequested.
  - `ts_ipe_m2a_bt_successive_coefficients_36_84_126` — states "the three successive coefficients
    are ⁿCᵣ₋₁, ⁿCᵣ, ⁿCᵣ₊₁" — the actual content/answer of step `s1_terms`, unrequested.
  - `ts_ipe_m2a_bt_vsaq_7th_term_4_by_x3` — states "the important step is to use r = 6 in the
    general term, then combine the powers to get ¹⁴C₆ · 4⁵/x¹²" — hands the student the **final
    answer** to the open question, unrequested.
  - `ts_ipe_m2a_bt_vsaq_c0_2c1_4c2_3n` — writes out the full method AND final line ("Write
    (1+x)ⁿ = C₀+C₁x+…, then substitute x=2 and you get (1+2)ⁿ=3ⁿ, which is your answer") for the
    open question, unrequested; also the one instance where the mechanical `OVER_BUDGET` flag
    coincides with a real defect rather than firing on genuinely proportionate content (see item 5).
  All four were scored 2 (content itself is accurate, so not misleading/harmful, but the template's
  job is to decline + offer, not pre-empt the open question). The other 20/24 `outofbank` replies
  were clean one/two-line declines with at most a bare offer to help.

- **LITERAL-MARKDOWN:** 0 of 240. Verified by direct search — no reply line contains `**`, a
  leading `- ` bullet, a `#` heading, or a backtick.

- **TRUNCATED:** 0 of 240. Every reply in the slice ends on a complete sentence or a complete,
  closed formula; none cut off mid-word or mid-expression.

## 5. Mechanical flags I judge wrong

Four `OVER_BUDGET` flags fired in this slice (plus the one `GUARD_REPLY`, which is accurate and not
in question). I judge **three of the four `OVER_BUDGET` flags to be false positives** — the flagged
replies are correct, well-organized, and proportionate to genuinely multi-step 7-mark LAQ content,
not padded filler:

- `ts_ipe_m2a_bt_series_1_3_by_3_6_prove_9x2_24x`, template `why` — flagged `OVER_BUDGET(156w/150)`.
  6 words over a 150-word budget for a `why` explanation of a 5-step, 7-mark derivation. Content is
  tight and non-repetitive; this reads as the budget being calibrated too low for this template on
  LAQ-length cards, not as an actually padded reply.
- `ts_ipe_m2a_bt_series_4_by_5_alternating_sum`, template `marks` — flagged `OVER_BUDGET(154w/140)`.
  Same pattern: a `marks` answer for a 5-step problem that itemizes mark-by-mark; 14 words over.
- `ts_ipe_m2a_bt_sum_cr_cr_plus_k_2ncn_plus_k`, template `whystep` — flagged
  `OVER_BUDGET(148w/140)`. This is arguably the hardest single step in the whole slice (comparing
  coefficients of xⁿ⁺ʳ on both sides of a polynomial identity); 8 words over is proportionate to
  the difficulty, not padding.

The fourth, `ts_ipe_m2a_bt_vsaq_c0_2c1_4c2_3n` outofbank (`OVER_BUDGET(103w/90)`), is the one case
where the flag correctly tracks a real problem — it coincides with the SCOPE-CREEP instance listed
in item 4, where the extra length is spent giving away the open question's full solution.

Net finding: the `OVER_BUDGET` threshold looks tuned for short/VSAQ-style answers and fires
spuriously on legitimately longer LAQ-card explanations; it is a useful signal only when paired with
an actual content problem (as in the fourth case), not on its own.

## 6. Cards whose ANSWER FACTS are themselves wrong, self-contradictory, or ambiguous

**None found.** I checked every MARK SPLIT against its own step-by-step NOTE arithmetic (mark counts
sum correctly to 7 on every LAQ and to 2 on every VSAQ), checked every WHY against its own MARK
SPLIT/NOTE for internal consistency, re-derived the algebra in every multi-step proof by hand
(binomial-coefficient ratio identities, the four "missing-leading-terms" infinite series proofs,
the odd/even-terms P/Q proof, the successive-coefficients and AP-condition LAQs, and both VSAQ
term-finding cards), and found every stated identity, sign, and final result correct and consistent
with the question asked. No step's WHY or NOTE contradicts its own MARK SPLIT, no sibling
statements reach opposite conclusions, no equation fails to balance, and no rule is stated one way
and applied another. This is a clean bank for this slice.
