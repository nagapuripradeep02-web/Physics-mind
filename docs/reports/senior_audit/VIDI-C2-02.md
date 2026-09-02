# Vidi Audit — Chemistry-II, slice 2 of 14

Source: `.answerbook_logs\audit_r1_ts_ipe_c2.slice-02.md`
25 question cards × 10 templates (marks, whystep, remember, mistakes, skiplast, explain,
important, outofbank, why, telugu) = 250 replies. Every reply graded, none sampled.

## 1. Per-template table

| Template | Mean | 0 | 1 | 2 | 3 |
|---|---|---|---|---|---|
| marks | 3.000 | 0 | 0 | 0 | 25 |
| whystep | 3.000 | 0 | 0 | 0 | 25 |
| remember | 3.000 | 0 | 0 | 0 | 25 |
| explain | 3.000 | 0 | 0 | 0 | 25 |
| mistakes | 3.000 | 0 | 0 | 0 | 25 |
| important | 3.000 | 0 | 0 | 0 | 25 |
| skiplast | 2.960 | 0 | 0 | 1 | 24 |
| why | 3.000 | 0 | 0 | 0 | 25 |
| outofbank | 2.880 | 0 | 0 | 3 | 22 |
| telugu | 3.000 | 0 | 0 | 0 | 25 |

## 2. Overall mean

**Overall mean: 2.984** (sum 746 / 250 replies). Total reply count: **250**.
Guard replies ("I could not answer just now" / "Give me a short moment"): **0** — none
occurred anywhere in this slice, so none were excluded.

## 3. Every reply scored 0 or 1

**None.** Every one of the 250 replies in this slice graded 2 or 3 against its ANSWER FACTS.
No falsehood, invented mark/step, or wrong-question answer was found.

## 4. Four explicit counts

- **WRONG-STEP: 0 of 25.** Every `whystep` reply explained exactly the step named in the ask
  and attributed the mark to the correct step (cross-checked each against the card's
  `EARNS THE MARK FOR` line).
- **SCOPE-CREEP: 3 of 25.** All 25 `outofbank` replies correctly declined the Henderson–
  Hasselbalch question, but three then volunteered the actual content of the open card
  instead of a bare offer to help:
  - `ts_ipe_c2_ape_reagents_phenol_from_chlorobenzene`: "...For the question I do have open,
    the two reagents for phenol from chlorobenzene are NaOH at 623 K and 300 atm, then dilute
    HCl to acidify the sodium phenoxide."
  - `ts_ipe_c2_bio_bonding_in_alpha_helix`: "...For the α-helix question I do have, the answer
    is hydrogen bonding between the –NH and >C=O groups of the same chain."
  - `ts_ipe_c2_bio_hydrolysis_of_sucrose_and_lactose`: "...For the question I can see, remember
    sucrose gives α-D-glucose and β-D-fructose, while lactose gives β-D-galactose and
    β-D-glucose — four names in total."
  All 22 other `outofbank` replies stopped at a bare offer ("I can help you with the X
  question that is open here if you want") and were not counted as creep — two borderline
  cases (`ts_ipe_c2_bio_classification_of_vitamins`, `ts_ipe_c2_bio_monosaccharides`) name the
  open topic's sub-parts ("the vitamin K part", "the definition and examples") without
  actually stating their content, so they were left as bare offers, not creep.
- **LITERAL-MARKDOWN: 1 of 250.** The `explain` reply on
  `ts_ipe_c2_ape_steam_distillation_of_nitrophenols` uses `**bold**` five times (already
  self-flagged in the transcript as `_flags: MARKDOWN:**bold**_`). No other reply in the
  slice contains `**`, a leading `- ` bullet, a `#` heading, or a backtick.
- **TRUNCATED: 0 of 250.** Every reply ends on a complete sentence.

## 5. Mechanical flags judged wrong

Only one flag fires anywhere in this slice: `_flags: MARKDOWN:**bold**_` on the
`steam_distillation_of_nitrophenols` `explain` reply (item 4 above). It is a true positive —
the reply genuinely contains bold markdown — so there is nothing to report here as a wrong
flag.

## 6. ANSWER FACTS defects

**None found in this slice.** Checked all 25 cards for: equation atom/charge balance, MARK
SPLIT summing to the card's total marks, and WHY/NOTE/MARK-SPLIT internal consistency.
Specifically verified (all correct):
- Oxidation equations for alcohol→acid, alcohol→aldehyde, phenol→benzene (Zn),
  phenol→cyclohexanol (Ni/H₂, 3H₂ needed for 3 ring double bonds), phenol→benzoquinone (2[O])
  all balance atom-for-atom.
- Dow's-process and diazotisation/hydrolysis equations for phenol preparation balance,
  including the "two NaOH" and "two H₂O" stoichiometry the WHY fields explain.
- C–halogen bond-enthalpy ordering (I<Br<Cl) and SN2/SN1 reactivity-order contrast are
  self-consistent between WRITE, WHY and MISTAKES fields across both SN2 sub-parts.
- Steam-distillation melting points (o-nitrophenol 318 K, p-nitrophenol 387 K) and the
  intramolecular/intermolecular H-bond contrast are self-consistent.
- Invert-sugar optical-rotation arithmetic (glucose ≈ +52°, fructose ≈ −92°, equimolar mixture
  ≈ −20°, sucrose +66.5°) is internally consistent between the WRITE and WHY fields.
- Zwitterion charge balance for the amphoteric-behaviour equations is correct.
- Every 2-mark VSAQ card's MARK SPLIT sums to 2M and every 4-mark SAQ card's sums to 4M.
No sentence-level self-contradiction (a NOTE/WHY reversing its own MARK SPLIT, or a rule
stated one way and applied the other) was found anywhere in the slice.
