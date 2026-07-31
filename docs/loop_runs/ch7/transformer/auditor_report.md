# QUALITY AUDIT — transformer (Ch.7 §7.9, concept 8/8 — CHAPTER CLOSER)

Auditor: quality-auditor (Opus) · 2026-07-24 · branch feat/ch7-alternating-current (worktree physics-mind-ch7).
Artifacts: src/data/concepts/transformer.json (11 states) · skeleton + physics_block (full read) ·
THE EYE .visual_runs/transformer/20260724-212106/ (246 frames, 0 warnings) · review site localhost:8087.

## VERDICT: FAIL — one LOW–MEDIUM cosmetic finding (S11 explore HUD↔formula overlay collision, Rule 34d).
Founder-overridable near-pass. The sim teaches correctly across all 11 states; the single defect is a few-pixel
overlay crowd in the explore sandbox only. Routing below.

## Gate results (evidence machine-extracted this session)
- Gate 0 DoD: PASS — 11 states present, ids/count match; HUD symbol labels rendered; motion every state; RHR N/A;
  conceptual-only; misconception_watch at exactly S3+S6; assessment + coverage_map present.
- Gate 1 tsc: PASS — TSC_EXIT=0.
- Gate 2 validator: PASS — PASS transformer.json, ZERO warnings; suite 132 PASS / 0 FAIL.
- Gate 3a R15/19/23: PASS — advance_mode {manual_click×10, interaction_complete×1}=2 distinct; 3 prims/state; prereqs advisory, no cycle.
- Gate 3c Socratic: N/A (no narrative_socratic).
- Gate 3d E42: PASS — physics sound; Φm=0.090 invariant across ramp; VpIp=VsIs; dΦ/dt=0→0 EMF; η=95%; loss ratio 100.0 @3dp.
- Gate 3e R31: PASS — 11 distinct archetypes, none static; S5 exposes only Ns, S11 all 4, others locked; 0 Socratic artifacts.
- Gate 3f R32+budget: PASS — words/state 49/51/49/55/48/46/54/49/46/54/25 all in [25,55]; captions all ≤5w; cause-first; one glow focal/state.
- Gate 3g R33/R34: FAIL — 34d only (S11 collision, see finding). All else PASS: S9 zoom-lens cutaway renders (keyframes t03381 eddy loops → t08375 quenched);
  4 live needle meters + numerics; ONE formula surface/state; Unicode across DOM+canvas+sprite paths verified; ASCII-math scan clean.
- Gate 3h R38+39g: PASS — rings core×8/extended×2/advanced×1(S10 contiguous before explore); explore CORE-ring only;
  curriculum_tags only CBSE verified:true, 6 others needs_teacher_verification:true; ⚙ auto-inherited (interactive label check deferred, advisory).
- Gate 4 visual walk (THE EYE): PASS — every state looked at; all watch-list numerals match EXACTLY
  (S1 0.090/10.0/open · S2 10.0/0.40/0.40/lamp · S3 dΦ/dt=0 no-numeral/0.00/3.33/flat/closed-dark · S4 tick+0.100/turn ·
   S5 Ns=200/Vs=20.0/Φ0.090/slider · S6 16.0=16.0/Ip=1.60=2×Is/ghost-struck · S7 3.200→0.032 3dp · S8 16.8/95%/6-bar ledger ·
   S9 eddy→sliver · S10 6 links+dim · S11 4 sliders+free-run). 4a/4b chat probes N/A.
- Gate 7 console: PASS(indirect) — EYE warnings=[], tsc 0, validator 0; browser console not separately opened (headless), noted.
- Gate 8 scar regression (FILE corpus, no DB writes): PASS — forward probe field3d_transformer_scenario_binding_invariants all 7 confirmed
  (two-zeros S1≠S3; no-bridge; S5 thumb-lockstep; S3 flux-numeral-hidden; S6/S8 pane-level glow; letter-subscript compose 3 paths; S7 3dp-only).
  Accumulated lc F1–F6 all satisfied. confusion_cluster_registry probe N/A-DORMANT (not routed).
- Gate 9 layout overlap: FAIL — same S11 HUD↔formula item as 3g#7; no other overlap.
- Gate 10 expression: PASS — computed_outputs resolve; no {var} leak.
- Gate 11 plain English: PASS — Hinglish/country scan = 0 hits.
- Gate 12 visual continuity: PASS — same core+2-coil apparatus, home pose persists S1→S11.
- Gate 13 animation vocab: PASS — 11 field_3d modes real (4× deriveStateMeta, 34692a5); EYE rendered motion all states.
- Gate 14 Pass-1: PASS — DoD zero-TBD; cliffs; JEE trace (14b dormant); PRIMARY aha S6 + SUPPORTING S2 both in foundational.
- Gate 15 Pass-2 4Q: PASS — every state names unknown, curiosity beat via motion, move-then-label, focal physics-bearing; none fails >2/4.
- Gates 16–18: PASS — 16 confront S3+S6 wrong-consequence-first not per-state; 17 ≤1 new var/state; 18 concrete-first, algebra last.
- Gates 19–20 (assessment present): PASS — coverage Q1–Q6 real teaches_state, agrees w/ by_state, S1–S9 covered, non_assessed [S10,S11],
  no orphan/uncovered (validator-enforced); distractors encode real misconceptions; keyed answers correct; aha hit Q1→S2,Q3→S6; parallel_form_stem ×6.
- Anti-plagiarism / R35: PASS — universal culture-neutral anchor (grid/charger/hum); plain English; no textbook prose.
- DORMANT (N/A): Gate 5 deep-dive, Gate 6 drill-down, R20/21 board, EPIC-C.

## Finding F-A — Rule 34d overlay collision, STATE_11 (explore) — LOW–MEDIUM — owner alex:json_author (durable alt peter_parker:renderer_primitives)
- What: S11 value-HUD renders 9 rows because config sets BOTH hud_show_turns:true AND hud_show_power:true (only state with both).
  The taller HUD bottom now overlaps the fixed-position tfr_formula overlay (top:40%): Vs/Vp = Ns/Np clips the HUD box bottom / Ps=16.0 W row.
- Evidence: STATE_11__frozen.png + STATE_11__dense_t01000.png — formula glyphs intersect the HUD panel border. No other state collides (≤8 rows).
- Minimal fix (json_author, no cross-state regression): set STATE_11.transformer.hud_show_turns:false (Ns is already live in its slider label);
  HUD 9→7 rows clears the formula. Text/layout de-clutter = expected H2 baseline change (R34e) → re-EYE + visual:approve on S11, not a fix cycle.
- Durable alt (peter_parker:renderer_primitives): dynamically offset tfr_formula below the actual HUD bottom (or cap HUD height) so any 9-row
  explore HUD can never collide — higher blast radius (shared field_3d layout → full regression); take only if founder wants the general invariant now.
- Founder-override: crowd is a few px, both texts still readable; may override to PASS for the trial ship. Never silently passed (report ✗ LOW, founder decides).

## Bottom line
Chapter-closing build. Every gate green with pasted evidence EXCEPT the one S11 explore overlay crowd; every locked numeral matches
the physics block and the founder watch-list exactly; misconception discipline, ring coherence, tag honesty, Unicode-across-three-paths,
and all 7 forward-probe scar invariants hold. Recommend: json_author drops hud_show_turns:false on S11 → re-EYE/approve → ship; or founder override.
