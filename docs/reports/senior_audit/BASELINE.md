# Baseline — every gate before any repair (2026-09-02, master `846ccebf`, branch `fix/senior-book-audit`)

Logs: `.answerbook_logs/baseline/*.log` (gitignored).

| Gate | Exit | Result |
|---|---|---|
| `check:cards -- --prefix ts_ipe_p2` | 0 | 256 cards, 25 katex lines, all per-card gates pass |
| `check:cards -- --prefix ts_ipe_c2` | 0 | 340 cards, 0 katex |
| `check:cards -- --prefix ts_ipe_m2a` | 0 | 257 cards, 40 katex |
| `check:cards -- --prefix ts_ipe_m2b` | 0 | 271 cards, 26 katex |
| `check:p2cards ts_ipe_{p2,c2,m2a,m2b}_` | 0 ×4 | schema, paper shape, mark sums, header all pass |
| `check:xrefs` | 0 | no unresolvable cross-references |
| `check:originality` | 0 | passes |
| `check:papers` | **1** | PRE-EXISTING on master: `units.json mathematics_1b-10 rl12: unknown source "chaitanya_fastrack"` (first-year, from PR #183; `KNOWN_SOURCES` is a closed list) |
| `check:figure-pace` (strict list now includes `ts_ipe_p2`) | 0 | pace gate PASS; p2 = 83 figures / 634 strokes |
| `figcheck:m2b` | 0 | 12 checked, 0 failing |
| `tsc --noEmit` | 0 | 0 errors |
| `vitest run` | 0 | 37 files, 443/443 |
| `build:answers` (offline) | 0 | 3,045 cards; memory_tip 100%, margin_note 100%, insider_note 88% bank-wide |
| `labels:clashes` | 0 | 264 figure questions of 3,045 — no collisions |
| `vidi:contexts` | 0 | 2,741 contexts; every context clears 14,000 (widest 10,423 = `ts_ipe_p2_mcm_torque_on_loop_and_galvanometer`, 74%) |
| `measure:wrap` p2 / c2 / m2a / m2b | 0 | 0 / 0 / 0 / 1 wrapping lines (4,141 / 6,838 / 2,834 / 3,441 measured) |

Second-year context widths: c2 max 10,154 (`ocn_fourteen_named_reactions`), m2a 8,156, m2b 7,967, p2 10,423.
PAPER line check on the dump: 0 of 528 Maths-2A/2B contexts fail to say "75 marks written"; 0 of 126 2A/2B LAQ contexts lack "7 marks"; 0 of 596 P2/C2 contexts fail to say "60 marks written".

## Mechanical sweeps (scratchpad `sweeps.mjs`, self-tested on an injected positive)

- **A. Mark TOTAL in prose ≠ `marks_total`:** 9 regex hits, all of the shape "the two marks here" — on inspection these
  read as a STEP's own marks, not the card total; handed to the examiners with the card list rather than filed.
  The "the seven are already spent" shape (no "marks" token) is not machine-detectable and stays a human check.
- **B. `mark_split` label ≠ any >0-mark step label:** 266 cards, all paraphrases (split label longer/more
  descriptive than the rail label). `mark_split` is display-only and validated by sum; no gate pairs labels.
  Not a defect class; examiners check semantic agreement per card.
- **C. `expected_time_min` convention:** uniform per qtype in c2 (4/8/15), m2a (4/8/12), m2b (4/9/15);
  p2 has 3 VSAQ at 5 (162 at 4) and 6 SAQ at 9 (61 at 8) — listed for the P2 examiners.
- **D. `verification.note` claiming an independent re-derivation found no error:** m2b 271/271, c2 2/340,
  m2a 0, p2 0. The 2B claim was present on all four cards later proved wrong — examiners told to ignore it.

## Vidi mirror

Port 8110 was held by a process started 2026-08-30 22:18, BEFORE the last persona commit (`0630a8fe`, 23:43) —
i.e. the old mirror was serving stale code. Killed by PID (20656), fresh mirror started (PID 34808),
startup line read: `vidi dev server on http://localhost:8110 (model deepseek-chat, key present)`.
