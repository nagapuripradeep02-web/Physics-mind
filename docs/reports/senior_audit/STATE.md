# Senior audit — working state (updated at every phase boundary)

Branch `fix/senior-book-audit` off master `846ccebf`. Plan: `~/.claude/plans/please-analyze-the-second-precious-acorn.md`.
Scratchpad: `C:\Users\PRADEEEP\AppData\Local\Temp\claude\C--Tutor-physics-mind\98cbf4ad-9e7c-46d3-834e-139ecd3b20af\scratchpad\`
(`groups/` = 100 examiner group dumps + GROUPS.json; `figs/<prefix>/` = PNG per figure; `make_groups.mjs`, `sweeps.mjs`).

## Phase 0 — DONE 2026-09-02
- package.json: `ts_ipe_p2` added to `check:figure-pace --strict`; new scripts `check:p2cards`, `figcheck:m2b`.
- Baseline: see BASELINE.md. Only pre-existing failure: `check:papers` (first-year `mathematics_1b-10` source `chaitanya_fastrack` unregistered).
- Vidi mirror on :8110 was a STALE process from 30 Aug 22:18 (persona commit 0630a8fe is 23:43) — killed by PID, fresh mirror started (log `.answerbook_logs/vidi_server_r1.log`).
- Contexts re-dumped from fresh offline dist (`vidi_contexts.json`, 2026-09-02); widest second-year 10,423 (p2 torque card).

## Phase 1 — examiners (100 groups: P2-01..24, C2-01..32, M2A-01..21, M2B-01..23)
Dispatched batch 1: C2-01..C2-10 (opus). Reports land in this folder as `<GROUP>.md`.
Remaining: C2-11..32, P2-01..24, M2A-01..21, M2B-01..23.

## Phase 2 — figures
Dispatched: FIG-P2-1..4 (pngs.txt lines 1-21, 22-42, 43-62, 63-83), FIG-C2-1..2 (1-17, 18-34), FIG-M2 (all 2A+2B).

## Phase 3 — Vidi
- 3c round-1 battery RUNNING detached (started ~2026-09-02): `.answerbook_logs/audit_r1_ts_ipe_{c2,p2,m2a,m2b}.jsonl`, logs `audit_r1_<p>.log`, sentinel `audit_r1_ALL_DONE.txt`. Order c2 → p2 → m2a → m2b.
- 3b DONE: deployed `answerbook-vidi-chat` is version 16, updated 2026-08-30T21:43:28Z (24 s after the last repo commit `0630a8fe`); all 7 load-bearing markers (14,000 slice, stepHuman, second-year subject ladder + term lists, offer-to-help clause, 800-token Telugu cap, app-around-you line) present in the deployed source. Live probe from `Origin: https://answers.viditra.co` on `ts_ipe_m2a_bt_c0_c1x_by_2_series_sum`: HTTP 200 in 4.4 s, coherent 7-mark answer, `ai_usage_log` row written (session `senior_audit_probe`, $0.0013).
- Examiners batch 2 dispatched: C2-11..C2-13 (concurrency cap = 20 subagents; C2-14..C2-20 queued).
- Dispatch queue order after that: C2-21..32 → P2-01..24 → M2A-01..21 → M2B-01..23.
- Progress: all C2 groups dispatched; P2-01..08 dispatched; figure reviews FIG-P2-1..4, FIG-C2-1..2, FIG-M2 all DONE.
- HARMFUL so far (from agent replies): C2-01 ss_schottky_defect · C2-04 sol_relative_lowering_molar_mass · C2-11 met_matte, met_alloy_compositions · C2-14 va_uses_of_ammonia · C2-25 cel_antacids.
- Figures needing repair: P2 ray_critical_angle_total_internal_reflection (i≠r), ray_formation_of_rainbow (bows swapped); C2 df_colour_of_transition_metal_ions (CFT barycentre inverted); M2B ell_tangent_intercepts_cm_cn_identity, ell_tangent_normal_end_latus_rectum (tangents drawn as secants), par_standard_form_derivation (flat vertex + labels); plus ~24 label faults listed in FIG-*.md.

## BLOCKER FOR THE FOUNDER — the DeepSeek balance is EXHAUSTED (found 2026-09-02 ~11:20)

`[vidi dev] DeepSeek 402 {"message":"Insufficient Balance"}`. Consequences, both verified:
1. **Vidi is DOWN on the LIVE site.** A probe of the deployed Edge Function from
   `Origin: https://answers.viditra.co` returns the fallback string
   *"I could not answer just now…"* — every student free-text question is failing right now.
   This is the recorded scar reproducing ([[feedback_measure_the_ai_before_improving_it]] trap 2).
2. The **Maths-2B battery died**: 2,710 calls, 2,504 failed, only **206 usable replies over 21 of
   271 cards**. Must be re-run after a top-up (fresh `--out`, the JSONL resumes by id).
Batteries that DID complete and are graded from disk: c2 3,400 ($0.85), p2 2,560 ($0.63),
m2a 2,570 ($1.41). Total spend so far ≈ $2.95 ≈ ₹282.

## Phase 1 — Chemistry-II COMPLETE: all 340 cards, 32 of 32 groups

**HARMFUL 11 · WRONG 97 · WEAK 167** (275 findings). Per-group counts in each `C2-NN.md`.
This is the first truth audit this paper has ever had.

Cards implicated by HARMFUL rows: ss_schottky_defect, ss_frenkel_defect, sol_relative_lowering_molar_mass,
met_matte, met_alloy_compositions, met_copper_from_copper_pyrites, va_uses_of_ammonia,
bio_saq_starch_vs_cellulose, bio_reactions_against_open_chain_structure, cel_antacids,
cel_antihistamines, hal_conversions_ethane_and_toluene.

## Phase 2 result — figures, COMPLETE (146 reviewed)

Drawn-wrong (not just labels): `p2_ray_critical_angle_total_internal_reflection` (i ≠ r),
`p2_ray_formation_of_rainbow` (primary/secondary bows swapped), `c2_df_colour_of_transition_metal_ions`
(CFT barycentre inverted), `m2b_ell_tangent_intercepts_cm_cn_identity`,
`m2b_ell_tangent_normal_end_latus_rectum` (tangents drawn as secants),
`m2b_par_standard_form_derivation` (flat vertex + mislabelled). ~24 label defects listed in FIG-*.md.

## Phase 4 — repairs, WAVE 1 dispatched (2026-09-02)

Partitioned by CARD via `REPAIR_QUEUE.json` (built by scratchpad/build_repair_queue.mjs) so no two
agents touch one file. Brief: `REPAIR_BRIEF.md`. Wave 1 = the 6 Chemistry-II units carrying HARMFUL
findings: ss, sol, met, va, bio, ck (ck also fixes its figure).
Wave 2 (audited, not yet dispatched): ec, sc, via, viia, ng, df, pol.
Wave 3 (needs its audit first): cel, hal, ape, akc, ocn.
Wave 4: the p2/m2a/m2b FIGURE-only repairs (24 cards) — no prose findings for those papers yet.

## Phase 3d — grading, WAVE 1 dispatched

36 slices exist (`.answerbook_logs/audit_r1_ts_ipe_{c2,p2,m2a}.slice-NN.md`; 14/11/11).
Dispatched: C2 01-04, P2 01-02, M2A 01-02 → `VIDI-<PAPER>-NN.md`. Model sonnet, frozen rubric.

## Phase 1b — P2 / M2A / M2B get a PROSE-AND-CONSISTENCY pass (decided 2026-09-02)

Those three papers already had an ANSWER-level examiner pass at authoring time (commits `ec4efa2f`,
`6a633877`, `0040b469`); what they have never had is the prose audit. So they get a chapter-aligned
pass (model sonnet) that checks the printed working + every number, then audits every prose field —
NOT a full independent re-derivation. **Report it that way; do not claim P2/M2A/M2B were
re-derived in this session.** Packets: `scratchpad/groups26/{P2-01..16,M2A-01..13,M2B-01..13}.txt`
(chapter-aligned, ≤26 cards). Reports use the same ids: `P2-01.md` etc.
Dispatched so far: P2-01, P2-02.

## Grading — measured so far (frozen rubric, /3)

C2 s01 2.992 · s02 2.984 · s03 2.964 · s04 2.964 | P2 s01 2.962 · s02 2.963 | M2A s01 2.975 · s02 2.963.
Flat at ~9.9/10, consistent with every prior paper. **Wrong-step 2 in 8 slices (~0.1%)** — the best
recorded. **Scope creep 29 of ~197 outofbank replies (~15%)**, confirming the open fleet-wide defect
and its cause (the "offer to help" grant in the situation block). Literal markdown 3 of ~1,960.
Zero truncations. Item-6 card defects found by graders: `ts_ipe_c2_ck_activation_energy`,
`ts_ipe_c2_ck_catalyst_effect_on_rate` (relayed to the ck repair agent).

## Repairs DONE (Chemistry-II) — 2026-09-02

ss (17 applied) · sol (20) · met (18) · va (15) · bio (26) · ck (13+3 partial) · ec (15) · via (10) ·
ng (9) · ape (12) · pol (13) · cel (18) · hal (8) · viia (11) · df (18, incl. the CFT figure).
Running: sc, akc, ocn. Every one verified `check:cards` exit 0 on its own prefix.
Figures repaired so far: `c2_ck_catalyst_effect_on_rate`, `c2_df_colour_of_transition_metal_ions`
(barycentre now 0.6/0.4, rise/drop 1.51), `c2_viia_oxoacids_of_chlorine` (lone pair added; the card
needed two phase markers to stay inside the 16-element pace rule), `c2_ec_she_construction_working`,
plus label fixes in sc.

**Repair-agent quality note worth keeping:** agents rejected or rewrote an auditor suggestion in
roughly one row in eight, exactly as the brief warned. Two would have introduced NEW errors —
the Lucas-reagent suggestion on `c2_hal_pcl5_reactions_vsaq` had primary/tertiary inverted, and the
proposed German-silver `why` would have rebuilt the contradiction facing the other way. One agent
also correctly disputed a premise in its own dispatch (`cel_antihistamines` is clean; it appeared in
REPAIR_QUEUE.json only because another card's HARMFUL row mentions it). **REPAIR_QUEUE.json severity
counts are a routing aid, not a finding count — the report headers are authoritative.**

## CHEMISTRY-II IS COMPLETE AND GREEN (2026-09-02)

All 340 cards audited, all 18 units repaired, and the full gate chain passes on the paper:
`check:cards` 340 exit 0 · `check:p2cards` exit 0 · `check:xrefs` exit 0 · `check:figure-pace` PASS.

**One gate catch worth recording:** `check:xrefs` went RED after the repairs. Cause was the halogens
repair rewriting a `margin_note` from "That wording earns both structure marks" to "…carries this
mark and the next one", which trips the gate's `the (previous|next) (question|answer|card|part|one)`
pattern. The gate was right to fire even though the phrase meant the next MARK, not the next
question — the replacement was also vaguer. Restored the content-naming wording; CRLF verified
intact (415 CRLF == 415 LF, trailing newline present). **A repair can turn a gate red; run the whole
chain after a repair wave, not just the per-prefix card check each agent runs.**

## AUDIT COMPLETE — all 1,124 second-year cards, 73 group reports

| Paper | Cards | HARMFUL | WRONG | WEAK |
|---|---|---|---|---|
| Chemistry-II | 340 | 11 | 97 | 167 |
| Physics-II | 256 | 3 | 15 | 40 |
| Maths-2A | 257 | 1 | 30 | 9 |
| Maths-2B | 271 | 7 | 37 | 16 |
| **Total** | **1,124** | **22** | **179** | **232** |

Chemistry-II was a full truth audit (first ever). P2/M2A/M2B were a PROSE-AND-CONSISTENCY pass on top
of their existing answer-level examiner passes — say it that way, do not claim they were re-derived
from scratch this session.

**The dominant harmful shape in the maths papers is the `insider_note`** — the line Vidi speaks to
the student FIRST — contradicting its own card's working: a point of contact with the wrong signs, a
"doubles every coefficient" claim that is not what happens, a focal-chord exception that does not
exist, a latus rectum said to move with the centre, a fraction chain giving 3π/512 under a boxed
3π/128, and three separate notes calling a VALID alternative method a mistake.

## Phase 1b progress — the prose pass

**Physics-II COMPLETE**: 16 chapters, all reported (P2-16 Communication System is folded into
`P2-11.md` with EM Waves). Running total **HARMFUL 3 · WRONG 15 · WEAK 40**.
The 3 harmful: two `RECALL` rubrics on `p2_ray_compound_microscope_magnification` demanding a minus
sign the card's own boxed equation does not have, and `p2_dnr_photosensitive_substances` claiming
eight metals respond to visible light when four of them need ultraviolet (its own verification note
admits it).
**Maths-2A and Maths-2B**: every chapter dispatched; reports landing.

Chapters that came back completely clean (0/0/0), worth recording because they show the bar is real
and not everything is being flagged: `P2-07` Moving Charges (16 cards), `M2A-04` Quadratic
Expressions (24), `M2A-06` Permutations part 1 (25), `M2A-12` Probability (23).

## Repairs — Physics-II wave 1 dispatched

One agent owns the six chapters with no figure work (`dnr`, `atm`, `epc`, `mag`, `ac`, `emw`+`com`),
including the dnr HARMFUL. The `ray` prose repair MUST WAIT for the ray FIGURE agent (same files);
likewise `cur`/`wav`/`wop`/`ecf`/`emi`/`mcm`/`nuc`/`sem` prose must wait for the non-ray figure agent.

## Dispatch caveat to know when reading the M2B reports

The Maths-2B dispatch prompts guessed each group's chapter from its number, and some guesses were
wrong (M2B-07 was briefed as Integration and actually holds hyperbola cards). The CARD SET always
came from the group file, so coverage is correct and no card was missed or double-audited — but a
few chapter-specific hints in those prompts landed on the wrong chapter, so treat the "background"
paragraph of an M2B report as possibly irrelevant while the findings themselves stand. Group→chapter
truth is in `scratchpad/groups26/GROUPS.json`.

## REPAIRS COMPLETE — and two regressions the per-agent checks did not catch

All 4 papers audited and repaired. Gates after the wave: `check:cards` ×4 exit 0 · `check:p2cards`
×4 exit 0 · `check:xrefs` 0 · `check:originality` 0 · `check:figure-pace` PASS · `figcheck:m2b`
12/0 · `tsc` 0 · `vitest` 443/443 · `build:answers` 0.

**But two things regressed that only a whole-book check sees, and both are being fixed:**
1. **Line wrap 0/0/0/1 → 2/5/0/1.** Repairs lengthened printed lines: a rewritten boxed line on the
   photosensitivity card, a rewritten boxed line on polarisation, a five-word enzyme list 1 px over,
   and four Ostwald equations that grew when "(conc.)" was added to each.
2. **Figure label collisions 0 → 7 in 5 cards.** The figure repairs each ran `check:figure-pace`
   (which does NOT test label overlap) and their own sweeps, but the authoritative gate is
   `find_label_clashes.mjs` / the e2e label test, which measures RENDERED boxes in the built dist.

**The lesson to carry:** a per-agent, per-prefix check is not the gate. `check_figure_pace` measures
stroke speed, not overlap; `measure:wrap` is not run by any agent by default. **Run
`build:answers` → `find_label_clashes.mjs` → `measure:wrap` over the WHOLE book after any figure or
printed-line wave**, before believing a repair wave is clean.

## DISPATCH QUEUE (as slots free; cap is 20 concurrent subagents)

1. P2 ray-optics FIGURE repair — the two physically wrong drawings (critical angle i≠r; rainbow bows
   swapped) + the ray label defects. Owns `ts_ipe_p2_ray_*` figures only.
2. P2 other figure repairs: `wav`/`wop` (n/an vs N/AN label clash), `cur` (potentiometer keys +
   cell polarity), `ecf` (missing E₂ shaft, displaced "2a sin θ"), `emi`, `mcm`, `nuc`, `sem`.
3. M2B figure repair — 3 wrong-geometry conics (`ell_tangent_intercepts_cm_cn_identity`,
   `ell_tangent_normal_end_latus_rectum`, `par_standard_form_derivation`) + `cir` label defects.
   M2A figure repair — 1 label (`cn_argand_equilateral_triangle` C over the y-axis label).
4. P2 prose chapters still to audit: 07, 08, 09, 10, 11, 13, 14, 15, 16.
5. M2A prose chapters still to audit: 01, 02, 04, 05, 06, 07, 08, 09, 10, 11, 12, 13.
6. M2B prose chapters still to audit: 01–13 (packets exist in scratchpad/groups26).
7. Repairs for whatever P2/M2A/M2B prose findings come back.
8. Re-run the Maths-2B battery once DeepSeek is topped up (fresh `--out`).

Grader-found card defects are logged in `GRADER_CARD_DEFECTS.txt` — route each to the agent that owns
that card, or to its prose auditor if no repair agent exists yet.

## Cross-session note

Another session is running a 2026-27 syllabus retrofit on **first-year** physics + chemistry-I
(`project_syllabus_2027_retrofit_physics_chemistry`), desk not merged. Different cards from this
work (`physics_2` / `chemistry_2` / `mathematics_2a` / `mathematics_2b`), but check for conflicts at
merge time.

## Phase 5 — not started
