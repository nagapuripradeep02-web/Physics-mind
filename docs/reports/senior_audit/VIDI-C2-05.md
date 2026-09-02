# Vidi audit — slice 5 of 14 — Chemistry-II (TS IPE second year)

Slice file: `.answerbook_logs\audit_r1_ts_ipe_c2.slice-05.md`
Cards in this slice: 25 (all Chemical Kinetics / d-and-f-Block Elements). Templates per card: `marks, whystep, remember, explain, mistakes, important, skiplast, why, outofbank, telugu` — 250 replies total, every one graded, none sampled.

## 1. Per-template table

| Template | Mean | 0 | 1 | 2 | 3 |
|---|---|---|---|---|---|
| marks | 3.000 | 0 | 0 | 0 | 25 |
| whystep | 3.000 | 0 | 0 | 0 | 25 |
| remember | 3.000 | 0 | 0 | 0 | 25 |
| explain | 3.000 | 0 | 0 | 0 | 25 |
| mistakes | 3.000 | 0 | 0 | 0 | 25 |
| important | 2.960 | 0 | 0 | 1 | 24 |
| skiplast | 3.000 | 0 | 0 | 0 | 25 |
| why | 2.880 | 0 | 0 | 3 | 22 |
| outofbank | 2.920 | 0 | 0 | 2 | 23 |
| telugu | 3.000 | 0 | 0 | 0 | 25 |

## 2. Overall mean

**Overall mean: 2.976** (744 points / 250 replies). **Reply count: 250.** **Guard replies: 0** — no "I could not answer just now" / "Give me a short moment" replies appeared anywhere in this slice, so nothing was excluded from the mean.

## 3. Replies scored 0 or 1

**None.** Every one of the 250 replies in this slice scored 2 or 3. No falsehoods, invented marks/steps, or off-bank answers-instead-of-declining were found.

## 4. The four counts

- **WRONG-STEP** (a `whystep` reply that explains a different step than the one named, or misattributes that step's marks): **0 of 25.** Every `whystep` reply in this slice correctly matched the step named in its own heading (e.g. `ts_ipe_c2_df_colour_of_transition_metal_ions` step `s3_splitting_figure` correctly explained the 0-mark splitting diagram and said so; `ts_ipe_c2_df_iupac_formulae_from_names` step `s3_group_two` correctly explained the K₄→K₃ trap between formulae 3 and 4).
- **SCOPE-CREEP** (an `outofbank` reply that declines the off-bank question but then volunteers content of the open question): **2 of 25.**
  1. `ts_ipe_c2_ck_temperature_effect_rate_constant` — outofbank reply ends "...the book gives 2 marks: 1 for the effect and 1 for the temperature coefficient" — states the open question's mark split unprompted.
  2. `ts_ipe_c2_df_iupac_formulae_from_names` — outofbank reply ends "...the important step is to write square brackets and the charge on every formula, since that carries all four marks" — volunteers open-question exam guidance unprompted.
  (All other 23 outofbank replies were a bare "I don't have that open, here's the catalog note, want help with the open one instead?" with no open-question content — not creep.)
- **LITERAL-MARKDOWN** (`**`, leading `- `, `#`, or backticks in a reply): **0 of 250.** No reply used markdown syntax; all math is plain Unicode (μ, Δo, ⁻, ³⁺, etc.), consistent with the rest of the corpus.
- **TRUNCATED** (ends mid-sentence or mid-formula): **0 of 250.** Every reply ends on a complete sentence/formula.

## 5. Mechanical flags on replies judged wrong

Only two mechanical flags fired anywhere in this slice, both `OVER_BUDGET`:
- `ts_ipe_c2_df_hydrated_copper_sulphate_colour` — `important` reply — `OVER_BUDGET(145w/120)`.
- `ts_ipe_c2_df_isomerism_in_coordination_compounds` — `why` reply — `OVER_BUDGET(176w/150)`.

Both flags fired correctly (both replies genuinely ran long) and both replies are chemically accurate — I scored them 2 for length/padding, not for being wrong. **No flag in this slice fired on a reply I judge chemically wrong, and no wrong reply escaped un-flagged (because there were no wrong replies).** So there is nothing to report as a flag *error* here — I list the two firings above only because the rubric asks for any flag on a reply I score below 3.

## 6. Cards whose ANSWER FACTS are themselves wrong, self-contradictory, or ambiguous

**None found.** I checked every one of the 25 cards' MARK SPLIT totals against the marks-question value, re-balanced every equation and every complex-ion charge given (CoCl₃+3AgNO₃→3AgCl+Co(NO₃)₃; K₄/K₃[Fe(CN)₆] vs Fe(II)/Fe(III); [Co(NH₃)₆]₂(SO₄)₃; Fe₄[Fe(CN)₆]₃ = 4(+3) vs 3(−4); nichrome 60+25+15=100; etc.), and cross-checked every WHY/NOTE against its own MARK SPLIT and against sibling steps for opposite conclusions. All of it balances and is internally consistent, including the electron configurations that are the usual exam traps (Cr = [Ar]3d⁵4s¹, Cu = [Ar]3d¹⁰4s¹, Sc = [Ar]3d¹4s², Zn²⁺ = 3d¹⁰, Fe²⁺ = 3d⁶ giving n=4 and μ=√24=4.90 BM).

One place is worth flagging as a **near-miss, not a defect**: `ts_ipe_c2_ck_temperature_effect_on_rate`, step `s1_observed`'s INSIDER POINT says "The book's own line that the rate is proportional to temperature contradicts the Arrhenius equation printed under it." Read in isolation this sounds like a self-contradiction inside the card. It is not — the step's own WRITE text already contains the corrective line ("The increase is not proportional to the temperature") and lists "rate is proportional to temperature" only under MISTAKES. The INSIDER POINT is referring to the external source textbook's error (a pattern used elsewhere in this corpus, e.g. "book prints hexacyano; cyanido is the current form"), not to anything actually printed in the ANSWER FACTS given to Vidi. No reply was misled by it — the `mistakes` reply for that card correctly explained the distinction. Reporting it here only so a future round can confirm it reads the same way.

## Secondary observation (not requested but load-bearing for calibration)

Two `why` replies scored 2 for a different reason than length: `ts_ipe_c2_df_alloy_definition` (invents a "disturbs the crystal lattice / changes how electrons move and how it responds to stress" mechanism not present anywhere in the ANSWER FACTS) and `ts_ipe_c2_df_chelate_ligand` (invents "this ring formation is called the chelate effect, and it makes the complex more stable" — also not present in the ANSWER FACTS). Both statements happen to be true chemistry, so I did not score them 0/1 (a student is not misled), but per the instruction to grade against the ANSWER FACTS and not against my own knowledge, they are ungrounded elaboration rather than precise answers, so they scored 2, not 3.
