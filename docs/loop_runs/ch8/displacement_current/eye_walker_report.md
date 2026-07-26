# Eye-walker report — `displacement_current` (Ch.8 #1, field_3d)

**Run read:** `.visual_runs/displacement_current/20260724-191902/` (all 10 contact sheets + 10 frozen frames + ~180 dense frames spot-checked, every STATE_4/5 anomaly-window frame, 5 STATE_9 keyframes). Deterministic (per commit 59cdd53): **43/43 checks, 0 failed, $0** (H2 skipped — new concept, no baseline).

**Overall: 2 MODERATE findings, neither blocking.** 8 of 10 states fully clean; all captions/HUD/formula truthfulness, Rule 32 delta-visibility across all 10, S6 charger on/off sync, S9 ledger invariant across the actual mid-sweep, Rule 34 uncluttered/Unicode/single-formula, Rule 35 culture-neutrality — clean.

## Per-state verdict
| state | reveal | motion | delta visible? | note |
|---|---|---|---|---|
| S1 charge_the_gap | ✓ beads stop at plates, gap bead-free, I_c=1.20A, Q climbing | ✓ dot pools grow | ✓ | clean |
| S2 field_grows_in_gap | ✓ Φ_E HUD + `Φ_E=E·A` + dc_ic_row | ✓ E-lines brighten | ✓ | clean |
| S3 loop_and_disk | ✓ loop+dl+disk, I_enc=1.2A | ✓ bead transits disk | ✓ | clean |
| S4 same_loop_two_answers | ✓ morph 0→1, I_enc flips 1.2→0 at s=1 | ✓ **one anomalous frame t≈2000ms** | ✓ | **Finding #1** |
| S5 b_lives_in_the_gap | ✓ **B=2.4µT confirmed non-zero throughout** (S5 sustained-charge fix holds); probe genuinely glides x819→639px ms2000–10000 | ✓ | ✓ | **Finding #2 (ghost tag absent)** |
| S6 flux_acts_as_current | ✓ dual meters, ghost column, I_d=I_c | ✓ throttle off→I_c=I_d=0 at t9000 then back | ✓ | clean |
| S7 where_is_b_strongest | ✓ R=6.0cm tag, peak 4.0µT marker | ✓ probe sweeps, dc_probe_row live | ✓ | clean |
| S8 why_epsilon0_dphi_dt | ✓ chain closes "≈1.2 A" (no 1.204 artifact) | ✓ declared reveal_hold, glow walks 3-line chain | ✓ | clean |
| S9 ampere_maxwell_ledger | ✓ sum frozen μ₀×1.20A | ✓ **keyframes confirm mid-morph clean**: s=0.72/0.15/0.06 → 0.34+0.86, 1.02+0.18, 1.13+0.07 all sum 1.20A | ✓ | clean (better than expected) |
| S10 displacement_sandbox | ✓ 3 sliders, I_d=I_c only (core-ring correct) | ✓ auto-oscillating (Rule 37) | ✓ | clean; trusted-drag untestable headless |

## Finding #1 — STATE_4 surface-morph single-frame geometry desync (MODERATE)
Frame-by-frame: t=0000 (s=0.00 flat) → t=1000 (s=0.00 flat) → **t=2000 (s=0.00 but mesh renders FULLY-INFLATED balloon, identical to s=1.00)** → t=3000 (s=0.07 flat) → t=4000+ ramps 0.26→1.00 smoothly. Only t≈2000ms is non-monotonic. Genuine vertex-buffer/geometry update race in the new paraboloid vertex-morph primitive (slider text + mesh shape both computed from `s`, should never disagree). Frozen/H2 baseline unaffected (pinned later). Pedagogical throughline lands at endpoints.
- Frames: `STATE_4__dense_t01000.png` (correct flat) vs `STATE_4__dense_t02000.png` (anomalous full balloon at s=0.00).
- Candidate row: `dc_surface_morph_frame_desync` | MODERATE | peter_parker:renderer_primitives | prevention: vertex-morph primitives must be a monotonic single-valued function of reported s at every sampled ms; verify via THE EYE dense-series frame-by-frame (invisible to frozen/H2 pin).

## Finding #2 — scene_composition annotation labels never render (MODERATE, ambiguous — pre-existing fleet pattern)
The 27 authored annotation ids (s1_charger_label … s9_sum_label) listed in field_3d_config visible_elements return ZERO renderer matches — silent no-op fleet-wide (the known field_3d on-canvas-text-source pattern: only field_3d_config.states captions/formula render, not scene_composition/epic_l annotations). Pedagogically relevant consequence: **STATE_5's misconception ghost tag "B should be 0 here" (misconception_watch.visual_counter, ghost_tag_at_ms:0) is absent from panel_a + every dense frame + the frozen pin.** The probe's 2.4µT reading is correct and glides in, but nothing on-canvas states WHAT wrong expectation is being disproven — a teacher sound-off (Rule 24 default) has no visual cue for the Rule 16a confrontation, only narration carries it. Not a new regression; surfaced for founder-proxy judgment on whether Rule 16a needs the ghost tag to actually render.
- Frame: `STATE_5__frozen.png` (B=2.4µT holds, ghost tag absent).
- Candidate row: `epic_l_scene_composition_annotation_silent_noop` | MODERATE (ambiguous owner: alex:json_author stop authoring dead refs, OR peter_parker:renderer_primitives implement a generic on-canvas annotation primitive, OR accept-as-designed narration-only).

## Frames for founder eyes
1. `.visual_runs/displacement_current/20260724-191902/STATE_4__dense_t02000.png` — morph glitch (vs _t01000/_t03000 either side).
2. `.visual_runs/displacement_current/20260724-191902/STATE_5__frozen.png` — B=2.4µT holds (fix good) + absent ghost tag.

## Tooling nicety (not a bug)
visual_eyes.ts prints the 43/43 line to stdout only — no log file in the run dir. Consider tee-ing stdout into the run dir so the deterministic count doesn't require archaeology next time.
