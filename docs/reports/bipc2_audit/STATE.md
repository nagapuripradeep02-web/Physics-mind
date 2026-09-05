# BiPC-II audit — working state (final, 2026-09-05)

Desk `feat/ipe-answerbook-zoology-2` (PR #173), holding both the Zoology-II content it always
carried and this audit. Platform PR #200 (Vidi subject ladder) merged into this desk before the
audit ran, so the chatbot battery ran against the corrected mirror.

## Phase 0 — desk sync — DONE
`origin/master` merged in (five files resolved additively: `units.json`, `answerBook.ts` enum +
`PAPER_PATTERNS`, `build_answer_book.ts` `SUBJECTS`, `notebook.js` `SUBJ_LABEL`, `package.json`
`check:figure-pace`). Ten pre-existing `check:xrefs` strings on Zoology-II reworded.

## Phase 1 — Vidi subject ladder — DONE (PR #200, merged)
Four rungs added (botany/botany_2/zoology/zoology_2) to the Edge Function, its local mirror, and
`vidi_audit.ts`; four new out-of-bank probes with positive/negative controls in `vidiChecker.test.ts`.

## Phase 2 — baseline + materials — DONE
`BASELINE.md` recorded. 37 examiner group dumps (`groups/*.txt`), 31 figures rendered to PNG
galleries, `BRIEF.md` and `REPAIR_BRIEF.md` written.

## Phase 3 — examiner audit — DONE
All 22 Botany-II + 15 Zoology-II groups (314 cards) examined. 24 HARMFUL, 244 WRONG, 436 WEAK.
Both figure reads done: 8/17 (b2) and 13/14 (z2) figures defective.

## Phase 4 — Vidi battery + grading — DONE
1,670 (b2) + 1,470 (z2) = 3,140 calls, ₹128 total. All 13 grading slices (7+6) graded blind.
Botany-II 9.69/10, Zoology-II 9.73/10.

## Phase 5 — repair — DONE
- 18 text HARMFUL fixes applied directly (commit `c46edaf9`), verified `check_cards` + `measure_wrap`.
- 20 figure defects repaired by two dispatched agents (commit `690547f3`), each SHAPE change
  re-rendered and visually confirmed; `check_figure_pace --strict` PASS on all twenty.
- All 24 HARMFUL findings from the examiner audit are now fixed — verified against the final
  per-group counts (11 b2 + 13 z2 = 24).

## Phase 6 — whole-book gates — DONE
`tsc` 0 · `vitest` 459/459 · `check_cards` 167+147 · `check_figure_pace --strict` (7 prefixes) PASS ·
`backtest:botany2`/`backtest:zoology2` PASS · `check:papers`/`check:xrefs`/`check:originality` PASS ·
`build:answers` 3,290 cards · `find_label_clashes` whole book 4→1 (remainder pre-existing, outside
this audit) · `measure_wrap` zero regressions · 5-card Playwright spot-check on the built page,
zero console errors. `bipc_2` stream added and verified standalone; `mpc,mpc_2` build unaffected;
`mpc_2,bipc_2` correctly refused by the two-streams guard (open founder decision, not fixed here).

## Phase 7 — reports, memory, PR — IN PROGRESS
`SUMMARY.md`, `STATE.md` (this file), `BASELINE.md` done. Remaining: `PROGRESS.md` entry,
`BOTANY_2_START_HERE.md` / `ZOOLOGY_START_HERE.md` audit addenda, memory updates, final push,
PR #173 body update.

## Not done, deliberately

Recall rubric authoring (blocked bank-wide on the grader endpoint, same as Chemistry-II/Maths-2B).
The teacher gate itself (all 314 cards stay `needs_teacher_verification: true`). Any deploy
(`deploy:answers`, Edge Function redeploy, `content:push`) — founder's gate. The combined-door
shared-subject stream engine change — founder decision, flagged not solved.
