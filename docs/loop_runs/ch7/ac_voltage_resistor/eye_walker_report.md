# eye-walker frame-read — ac_voltage_resistor (2026-07-22)

Run dir: `.visual_runs/ac_voltage_resistor/20260722-201049/` (deterministic gate: 39/39 checks passed,
0 failed — this report is the visual read on top of that, not a re-run of the gate).

Engine bug queue pre-walk: `query_engine_bug_queue.ts ac_voltage_resistor --field3d --open` → no
matching rows. No prior scars to carry in; `ac_resistor` scenario type has no fleet baseline.

## Per-state verdict

| state | reveal (frozen) | motion (dense) | delta visible? | Rule 24/29 | note |
|---|---|---|---|---|---|
| S1 "Voltage swings both ways" | possible desync | OK | OK (vs black baseline) | OK | frozen heater bright-white at p=0.4W; same p in dense_t0/2000/4000 shows dim gold — desync |
| S2 "Current copies voltage instantly" | OK | OK | OK | OK | heater tracks p(t) correctly across dense samples |
| S3 "Reversed current heats equally" | OK | OK | OK | OK | — |
| S4 "Power never goes negative" | OK | OK | OK | OK | p(t) triangular-fold graph pane added and animates |
| S5 "Average current: exactly zero" | OK | OK | OK | OK | ammeter needle correctly stays pinned at 0 (that IS the lesson) |
| S6 "Match lands below peak" | OK | partial | OK | OK | AC side clearly animates (arrow flip/heater/scope); DC-twin wire+dots pixel-static t0→t18000, only numeric V_dc/P_dc/E_dc ticks — no visible drift cue |
| S7 "Square, average, root" | OK | OK | OK | OK | i² curve visibly reshapes from flat→double-frequency-always-positive humps over ~2s; heater tracks p(t) |
| S8 "Humps fill the troughs" | EMPTY | EMPTY | caption/formula only | OK | "p vs t — folding to ½" pane is EMPTY (only dashed ½-line + baseline) across all 19 dense samples + contact sheet — the promised point-symmetry fold never draws |
| S9 "All yours" (explore) | OK | OK | n/a | OK | all 3 sliders live, continuous free-run confirmed via 3 keyframes, heater tracks p(t) |

## Frames for founder eyes

1. `STATE_1__frozen.png` — heater bright-white at p=0.4W.
2. `STATE_1__dense_t00000.png` — same v/i/p, heater correctly dim — the contradiction pair.
3. `STATE_8__contact_sheet.png` — 19-sample grid showing the fold pane never draws a curve.
4. `STATE_6__dense_t00000.png` — DC-twin baseline.
5. `STATE_6__dense_t18000.png` — same DC-twin frame, 18s later, pixel-identical.

(full paths: `C:\Tutor\physics-mind-ch7\.visual_runs\ac_voltage_resistor\20260722-201049\<name>`)

## Candidate engine_bug_queue rows (report only — not filed to DB; trial forbids DB writes)

1. **`heater_glow_freeze_pin_desync`** — MAJOR — owner_cluster ambiguous (renderer heater-material
   update vs. `SET_TIME_FREEZE` pin ordering, or json_author's chosen freeze instant). Prevention: the
   `SET_TIME_FREEZE` pin must snapshot the heater emissive color from the exact same simTime as the
   numeric v/i/p readout it freezes, not a stale/prior value.
2. **`point_symmetry_fold_curve_not_rendered`** — CRITICAL — owner_cluster
   `peter_parker:renderer_primitives` (new `ac_resistor` scenario's dual-graph pane). Prevention: a
   declared derivation-graph pane (e.g. "folding to ½") needs a THE EYE check confirming ≥1
   non-baseline curve pixel across the dense timeline; a pane showing only static reference lines
   silently fails its pedagogical job. Directly fails Checkpoint-A item ② (S8 must visibly differ from
   S7's squaring, not just be coded differently).
3. **`twin_circuit_no_visible_drift_cue`** — MODERATE — owner_cluster ambiguous (physics_author
   under-specified DC bead-drift speed, or renderer never wired bead motion for the compare twin).
   Prevention: a Rule-32 contrast-pair state must give BOTH apparatuses a visibly distinct motion
   signature within the dense sampling window, not numeric-only convergence for one side.

## Overall read: FINDINGS (3)
