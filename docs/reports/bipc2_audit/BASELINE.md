# Baseline — every gate before any repair (2026-09-04, desk `feat/ipe-answerbook-zoology-2` at `d382b0c2`)

Measured on the desk AFTER `origin/master` (2f50eb01, twelve papers) and `fix/vidi-bipc-subject-ladder`
(50a44822) were merged in, and after the ten Zoology-II `check:xrefs` strings were reworded — i.e. the
tree the examiners and the chatbot battery actually saw. Logs under `.answerbook_logs/` (gitignored).

| Gate | Exit | Result |
|---|---|---|
| `tsc --noEmit` | 0 | 0 errors |
| `vitest run` | 0 | 38 files, 455/455 before the ladder merge; +4 probe tests with it |
| `check_cards --prefix ts_ipe_b2` | 0 | 167 cards, 0 katex lines, all per-card gates pass |
| `check_cards --prefix ts_ipe_z2` | 0 | 147 cards, 0 katex |
| `check:figure-pace --strict` (c2, z1, b2, z2, m2a, m2b, p2) | 0 | pace gate PASS |
| `backtest:botany2` | 0 | every citation of the five guess papers resolves (105) |
| `backtest:zoology2` | 0 | every citation of the five model papers resolves |
| `check:papers` | 0 | 7 papers, 154 answerable slots clean |
| `check:xrefs` | **1 → 0** | 10 Zoology-II strings (8 insider notes, 1 `why`, 1 printed line) predated the gate; reworded in `11ddf110`, now passes |
| `check:originality` | 0 | passes |
| `build:answers` (offline) | 0 | **3,290 cards / 142 units**; memory_tip 100%, margin_note 100%, insider_note 88% bank-wide, 100% on both BiPC papers |
| `build --stream=bipc_2` | 0 | 910 cards (Botany-II, Zoology-II, Physics-II, Chemistry-II), one live door cell |
| `build --stream=mpc,mpc_2` | 0 | 2,592 cards — unchanged by the new stream |
| `build --stream=mpc_2,bipc_2` | **1** | by design: `streams "mpc_2" and "bipc_2" both claim subject "physics_2"` |
| `measure:wrap ts_ipe_b2` | 0 | 2,702 lines measured, **0** wrapping |
| `measure:wrap ts_ipe_z2` | — | 2,061 lines, **7 wrapping (0.3%)** in 6 cards: abio_prolonged_pr_interval, bfc_double_circulation, exc_renin_vs_rennin, hrs_capacitation, hrs_parturition, oev_genetic_drift_founder_effect |
| `find_label_clashes dist` | — | 278 figure questions of 3,330; **4 with colliding labels**: `ts_ipe_z2_exc_laq_excretory_system_nephron`, `ts_ipe_z2_gen_colour_blind_daughters_probability`, `ts_ipe_z2_ncc_spinal_cord_ts_diagram` (Zoology-II, never label-swept — the last two were added by the back-test after the sweep), and `ts_ipe_m2a_cn_argand_equilateral_triangle` (Maths-2A, pre-existing on master, outside this audit) |
| `vidi:contexts` | 0 | b2: 167 contexts, widest 9,771, median 2,317 · z2: 147, widest 8,586, median 2,278 · none within the 12,000 warn line, slice is 14,000 |

## Chatbot battery (local mirror, fresh process on :8110 from the desk's own code, key present)

| paper | contexts × asks | calls | spend | mechanical flags | critical |
|---|---|---|---|---|---|
| Botany-II | 167 × 10 | 1,670 | $0.7279 (≈ ₹70) | 16 | 1 |
| Zoology-II | 147 × 10 | 1,470 | see STATE.md | | |

## What was NOT measured, and why

- **No board-paper back-test** — no Telangana Botany-II or Zoology-II paper is in `answer-book/papers/`. Both
  papers' back-tests are against their own guide-book's model/guess papers only.
- **No two-book union check** — one source book per paper.
- **`recall`** — neither paper carries rubrics (nor do Chemistry-II or Maths-2B); the grader endpoint is
  founder-blocked and nothing about it is student-visible.
- **`smoke:answers`** (Playwright) runs once after the repair wave, not here.
