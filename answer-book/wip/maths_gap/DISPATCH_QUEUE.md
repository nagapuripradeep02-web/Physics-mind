# Dispatch queue — Maths-1A/1B gap-fill, session of 2026-08-31

Live state of the authoring run. **317 questions measured missing** across 16 chapters (the handoff
said 310; see `docs/MATHS_1AB_GAP_START_HERE.md` §2 and the sixteen `*__diff.md` reports here).

Every batch is dispatched with: the `AUTHORING_BRIEF.md` in this directory, a named ref list against
the chapter's `*__work.md` (stems verbatim from the source JSON, never from a diff table — the
markdown tables mangle stems through pipe-escaping), and that batch's own error cluster.

The concurrency ceiling is **20 agents** (`CLAUDE_CODE_MAX_CONCURRENT_SUBAGENTS`).

## Dispatched

| chapter | batch | cards | refs |
|---|---|---|---|
| 1A ch.6 | VSAQ | 7 | vsaq4 10 11 12 13 14 16 |
| 1A ch.6 | SAQ | 9 | saq2i 2ii 5i 5ii 6ii 6iii 8 9 10 |
| 1A ch.12 | VSAQ | 9 | vsaq3 5i 9 11 12 13 14 15 16 |
| 1A ch.12 | SAQ | 6 | saq3II 5 8 9ii 10 11 |
| 1A ch.4 | all | 7 | saq1i 1ii 2 7iii 8ii 9 10 |
| 1A ch.9 | all | 8 | saq1i 1iii 1iv 2i 3 4i 6 7 |
| 1A ch.10 | all | 9 | saq1iv 2i 2iii 4iii 5 7 8i 8ii 9 |
| 1A ch.11 | all | 7 | vsaq5 7 8i 8ii 9 10 11 |
| 1B ch.1 + ch.4 | all | 12 | loc saq3 9 10i 10ii 11 · pl saq2 14i 14ii 15i 15ii 17i 17ii |
| 1B ch.5 + ch.6 + ch.7 | all | 9 | td vsaq1 4 11 · dc laq5 · pln vsaq8 9 10 11 12 |
| 1A ch.8 | exact values | 9 | vsaq7ii 7iii 15 19 24 27 42ii 44i 44ii |
| 1A ch.8 | product identities | 9 | vsaq8 9 36i 36ii 36iii 39i 39ii 39iii 39iv |
| 1A ch.8 | conditional identities | 9 | vsaq10 12 17 20 21 23 30 40 46 |
| 1A ch.8 | triangle identities | 9 | vsaq22+32i (ONE card) 25 29 31i 31ii 32ii 47i 47ii 48 |
| 1A ch.8 | graphs + periods | 7 | vsaq1iii 4ii 4iii 5 · 28i 28ii 28iii (figures) |
| 1A ch.8 | LAQ transformations A | 7 | laq1ii 1iii 1v 1vi 2i 3ii 3iii |
| 1A ch.8 | LAQ transformations B | 7 | laq4 5i 5ii 7i 9 11 12 |
| 1A ch.7 | dot product | 10 | saq5 6 7 8 18ii 19 35i 35ii 36 40 |
| 1A ch.7 | cross product | 10 | saq10 11 16 20 21iii 23i 23ii 33 37 39 |
| 1A ch.7 | triple product | 10 | saq4i 13 14 15 22 25 26ii 28 31 34 |
| 1A ch.7 | planes + LAQ | 10 | saq29 30 · laq4 8 9 10 11 12ii 13 14 |
| 1A ch.2 | composition A | 8 | vsaq8i 8ii 9i 9ii 10i 10ii 11 12i |
| 1A ch.2 | composition B | 8 | vsaq12ii 13i 13iii 14 16i 16ii 16iii 16iv |
| 1A ch.2 | domains | 8 | vsaq19ai 19aii 19aiii 19avi 19biii 19biv 19bv 19bvi |
| 1A ch.2 | inverse + classification | 5 | vsaq17v 18i 18ii 18iii 18iv |
| 1B ch.3 | VSAQ A | 12 | vsaq4 5 8 9 10 11 16 17 20 21 22 24 |
| 1B ch.3 | VSAQ B | 12 | vsaq25 28 29 32ii 34 35i 36 38 39 40 41 42 |
| 1B ch.3 | LAQ A | 10 | laq9 10 11 12i 12ii 13 14 16iv 16v 16vi |

## Still to dispatch

**NONE — all 318 cards are dispatched** (2026-08-31). The last five batches were Matrices
(definitions 10 · algebra 10 · rank+determinants 8 · inverse+powers 9 · LAQ systems 12) and
Functions (piecewise+parity 7 · SAQ sets 4), plus Straight Line LAQ B (8).

### Card count vs question count — they are not the same number

| | |
|---|---|
| MISSING refs measured | **317** |
| less the two scope-gap extensions (below) | −2 → 315 |
| less two source duplicates authored ONCE (m1a ch8 `vsaq22`+`vsaq32i`; m1a ch2 `saq4iv`+`saq4vi`+`saq4x`) | −3 → 312 |
| plus multi-method splits (m1a ch5 `laq9ii` ×3, `laq9v` ×3, `laq9vii` ×2 — one card per named method, the bank's convention) | +5 → 317 |
| plus `laq9`/`laq10i`, the rank-test consistency framing the diff flagged UNCERTAIN | +1 → **318 cards** |

## Deliberately NOT authored as new cards

Two Functions refs are **scope gaps in existing cards**, not missing questions — `docs/MATHS_1AB_GAP_START_HERE.md` §7 already lists both, and this session's diff re-found them independently (that is the whole of the 51-vs-49 discrepancy on ch.2):

| ref | existing card | what is missing | repair |
|---|---|---|---|
| `vsaq20iii` | `ts_ipe_m1a_fn_domain_root_9_minus_x2` | book asks domain **and range**; card gives the domain | **extend the card**, do not add a second |
| `saq3` | `ts_ipe_m1a_fn_inverse_5x_plus_4` | book asks to prove **bijection** and find f⁻¹; card finds the inverse | **extend the card**, do not add a second |

The handoff's precedent for the analogous Straight Line gaps is explicit: *"The repair is to **extend** them, not to spread marks thinner."* A second card would put two catalog entries against one book question, against the founder's "ONE ENTRY = ONE QUESTION AT ONE LENGTH" rule.

## After every card is written — the closing sequence

```bash
python answer-book/tools/fix_m1a_banner_claim.py --write   # strip an unsupported 1A provenance claim
python answer-book/tools/add_maths_gap_rows.py             # dry run: must report 0 problems
python answer-book/tools/add_maths_gap_rows.py --write     # add the manifest rows
npx tsx src/scripts/check_cards.ts --prefix ts_ipe_m1a
npx tsx src/scripts/check_cards.ts --prefix ts_ipe_m1b
npm run build:answers            # the real gate: manifest <-> file drift
npm run check:originality
npm run backtest:maths
npx tsc --noEmit && npx vitest run
node answer-book/tools/measure_wrap.mjs ts_ipe_m1a         # new cards must add 0 wrapping lines
node answer-book/tools/measure_wrap.mjs ts_ipe_m1b
```

Then an **adversarial examiner pass** — split by mathematical TECHNIQUE, not by unit count, per
`docs/patterns/answer_book.md`. A card's own claim that it was "re-derived and correct" is
uncorrelated with correctness in both directions; record WHO checked it instead.

**Never deploy.** `npm run deploy:answers` is the founder's call alone (Rule 17).

## Findings for the founder — none of them in scope for this run

1. **Maths-1B line wrap is 31.3%** (1,296 of 4,138 lines), Maths-1A 10.5% — the two worst papers in
   the bank by far, against 0.0% for Maths-2A, Maths-2B, Physics-II and Chemistry-II. Spread across
   all ten 1B chapters, so it predates PR #181. One authored line is supposed to be one ruled row.
2. **177 committed maths cards describe the PRE-REFORM paper** in `verification.note` — "Section B …
   any 5 of 7", the 75-mark shape — contradicting the gated `PAPER_PATTERNS` (any 6 of 8). Internal
   text, never rendered, but wrong. This is the third layer of the 2026-08-28 re-cut miss: marks
   moved, then sections moved (the 61 re-cuts), and the prose describing the paper never did.
3. **`page_header[1]` is inconsistent inside 1A unit 8** — of 53 existing cards, 24 say
   "Trigonometric Ratios", 11 "Trigonometric Ratios and Transformations", 3 "… upto Transformations".
   This one IS student-visible (it prints at the top of the answer page). All new cards use the unit
   name; the existing split needs one decision.
4. **A duplicate inside our own bank**: `ts_ipe_m1a_it_cos_two_tan_seventh` and
   `ts_ipe_m1a_it_cos_two_tan_four_tan` state the identical identity — `2·Tan⁻¹(3/4)` and
   `4·Tan⁻¹(1/3)` are the same angle (verified: `tan(2·tan⁻¹(1/3)) = 3/4`, both in the principal
   branch). Only one is credited to a source question.
