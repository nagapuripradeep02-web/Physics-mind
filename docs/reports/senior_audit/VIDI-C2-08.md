# Vidi Audit — Chemistry-II, slice 8 of 14

Grader: fresh reading, every reply graded (no sampling). 25 question cards × 10 templates = 250 replies. Cards 1–11 are Noble Gases (`ts_ipe_c2_ng_*`); cards 12–25 are Organic Compounds Containing Nitrogen (`ts_ipe_c2_ocn_*`).

## 1. Per-template table

| Template | Mean | 0 | 1 | 2 | 3 |
|---|---|---|---|---|---|
| marks | 3.000 | 0 | 0 | 0 | 25 |
| whystep | 3.000 | 0 | 0 | 0 | 25 |
| remember | 2.160 | 0 | 0 | 21 | 4 |
| explain | 3.000 | 0 | 0 | 0 | 25 |
| mistakes | 3.000 | 0 | 0 | 0 | 25 |
| important | 3.000 | 0 | 0 | 0 | 25 |
| skiplast | 3.000 | 0 | 0 | 0 | 25 |
| why | 3.000 | 0 | 0 | 0 | 25 |
| outofbank | 3.000 | 0 | 0 | 0 | 25 |
| telugu | 3.000 | 0 | 0 | 0 | 25 |

## 2. Overall mean

**2.916** across all 250 replies. Reply count: **250**. Guard replies ("I could not answer just now" / "Give me a short moment"): **0** — none appeared anywhere in this slice, so the mean above is over the full 250 with nothing excluded.

## 3. Replies scored 0 or 1

**None.** Every reply in this slice scored either 2 or 3. No falsehoods, invented marks/steps, or misleading content were found anywhere in the 250 replies.

## 4. Four explicit counts

- **WRONG-STEP:** 0 of 25 `whystep` replies. Every `whystep` reply correctly explained the step named in the open-step context (e.g. asked about `s2_solubility`, it answered about `s2_solubility`'s mark, not a neighbouring step's).
- **SCOPE-CREEP:** 0 of 25 `outofbank` replies. Every reply declined the Henderson–Hasselbalch question cleanly and, when it offered to help further, referred back to the open card by name only — never volunteered any Henderson–Hasselbalch content (steps, formula, or marks).
- **LITERAL-MARKDOWN:** 0 of 250 replies. Confirmed by a regex sweep (`**`, leading `- `, `#` headings, backticks) restricted to the blockquoted reply lines — no matches. All replies are plain prose.
- **TRUNCATED:** 0 of 250 replies. Every reply ends on a complete sentence or a complete formula/value.

## 5. Mechanical flags

Only two flags fired anywhere in this slice (`grep _flags:` confirms), and both are on replies I judge **correct**, i.e. both read as false positives:

- Line 417, `ts_ipe_c2_ng_preparation_of_xenon_fluorides` → `[explain]`, flag `MARK_SUM:3`. The reply actually states "Writing this opening line earns you 1 mark" for the method step and "For the other 3 marks..." for the three fluoride preparations — 1 + 3 = 4, which is the correct total for this 4-mark SAQ. The flag appears to have picked up only the literal digit in "the other 3 marks" and missed the earlier "1 mark," undercounting the true sum. The reply itself is accurate.
- Line 3373, `ts_ipe_c2_ocn_fourteen_named_reactions` → `[why]`, flag `OVER_BUDGET(157w/150)`. The reply is 7 words over a 150-word soft budget, but the card is an 8-mark LAQ covering fourteen named reactions across four mechanistic families — a "why does this happen chemically" answer that touches all four families in brief is appropriately scoped for a question this large, not padded or repetitive. Content is accurate throughout. Flagging a fixed word budget on the biggest card in the slice looks like a length heuristic that doesn't scale with question size.

No flag fired on a reply I judged wrong, because no reply was judged wrong.

## 6. Cards with defective ANSWER FACTS

**None found.** I checked every one of the 25 fact blocks for internal contradictions (a WHY/NOTE disagreeing with its own MARK SPLIT, sibling statements reaching opposite conclusions) and, given how equation-dense this slice is (Noble Gases preparation/hydrolysis chemistry, eight amine/nitrogen conversion and named-reaction cards), hand-balanced every written equation atom-by-atom. All balanced correctly, including the dense ones most likely to hide an error:
- `ts_ipe_c2_ng_preparation_of_xeof4_and_xeo2f2` — the three hydrolysis equations (XeF₆ + nH₂O → products, n = 1, 2, 3) all balance.
- `ts_ipe_c2_ocn_amines_with_nitrous_acid` — both diazotisation equations and the aliphatic decomposition/overall equations balance.
- `ts_ipe_c2_ocn_ethyl_cyanide_and_isocyanide_from_alkyl_halide` — KCN/AgCN equations balance, and the "carbon is the stronger nucleophile in the free ion / AgCN is largely covalent" reasoning is internally consistent with the two named products.
- `ts_ipe_c2_ocn_fourteen_named_reactions` (8-mark LAQ, 14 reactions, the largest and most error-prone card in the slice) — all fourteen equations (iodoform, aldol, Clemmensen, Wolff-Kishner, carbylamine, Hoffmann bromamide, Gabriel three-step, HVZ, Rosenmund, Gattermann-Koch, Finkelstein, Swarts, Wurtz-Fittig, Fittig) balance correctly, and the block's own internal cross-references (e.g. "Clemmensen and Wolff-Kishner give exactly the same product," "Fittig uses two aryl halides; Wurtz-Fittig uses one aryl and one alkyl") are consistent with the written equations.
- Numeric values cross-checked against standard reference figures (pKb 9.38/3.38 for aniline/methylamine, pKb 9.38/9.30/3.29/3.02 for the four-base ordering, XeF₆'s 573 K, argon ≈0.93% of air, aniline solubility ≈3.4 g/100 g water) — all plausible and none contradicted within their own card.

## Pattern worth flagging (not one of the four hard counts, but systemic)

21 of 25 `remember` replies were opened on a specific step (e.g. `step s1_formula`) but the reply's content spilled into the OTHER step(s) of the same card as well — e.g. asked "how do I remember this" with only the formula step open, the reply also gave a memory tip for the name step. Content was never wrong, so this cost a grade of 2 ("padded / over the length the ask deserved") rather than 3, not a 0/1. The 4 exceptions that stayed correctly scoped to only the open step were `ts_ipe_c2_ng_structures_of_xef6_and_xeof4`, `ts_ipe_c2_ocn_amines_less_acidic_than_alcohols`, `ts_ipe_c2_ocn_basicity_order_gaseous_vs_aqueous`, and `ts_ipe_c2_ocn_conversions_benzamide_and_p_bromoaniline`. This is worth a prompt-level look since it is the one consistent, repeatable deviation in an otherwise very clean slice.
