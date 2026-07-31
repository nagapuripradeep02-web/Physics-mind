## THE EYE frame-read — `ac_voltage_inductor` (Ch.7 concept 2/8)

**Run:** `.visual_runs/ac_voltage_inductor/20260723-014804/` — 9 states, all frozen + dense (~1s cadence) + contact sheets read; STATE_9 keyframes also read for explore-continuity.

**Deterministic gate summary (echoed as given by dispatcher):** `📊 39 deterministic checks · 39 passed · 0 failed · $0.00` — engine_bug_queue pre-walk consultation (`--field3d --open`) returned **no matching OPEN rows** for `ac_voltage_inductor`, so no prior scars to carry into the walk.

### Per-state verdict table

| state | reveal (frozen) | motion (dense) | delta visible? | Rule 24/29 | note |
|---|---|---|---|---|---|
| S1 `heater_out_coil_in`("Heater out, coil in") | ✓ | ✓ (current arrow flips w/ sine, no static frame) | ✓ (vs black baseline: apparatus + source) | ✓ | none |
| S2 `current_lags_quarter_cycle` | ✓ | ✓ | ✓ (ghost overlay legend new) | ✓ | ghost dashed trace confirmed to appear FIRST (t=0/3000ms, before amber sweeps in), amber peaks visibly ~¼-cycle after ghost's peak (t=9000ms); "1.0 s = ¼ cycle = 90°" annotation legible, no collision |
| S3 `coil_fights_every_change` | ✗ | ✓ | ✓ (v-arrow + ε_back arrow/HUD row new) | ✗ | **ε_back arrow flips direction correctly, HUD v/ε_back opposite-signed exactly as expected — BUT the "ε_back (opposes the change)" label is clipped behind the v/i/p/ε_back HUD box in every single frame (frozen + all dense samples), reading only "...opposes the ch"** |
| S4 `voltage_sets_the_slope` (**PRIMARY AHA**) | ✗ | ✗ | ✓ (tangent icon + vm slider new) | ✗ | **tangent-stop captions ("steepest climb"/"flattest"/"steepest fall") render clean individually through t=4000ms, then overlap into unreadable garbled text ("steepestflattesteepest") from t=6000ms onward — persists through end-of-state AND the frozen H2 baseline. Obscures the "flat at crest" claim, the concept's money moment.** vm slider present + visibly a live control (good). |
| S5 `faster_swing_stronger_choke` | ✓ | ⚠ | ✓ (Xₗ formula/HUD row new) | ✓ | Xₗ subscript renders correctly (not ASCII/tofu). Frequency sweeps 0.25→0.50 Hz (Xₗ 5.0→10.0 Ω, consistent w/ "faster/stronger" caption) then **reverses past its own starting value down to 0.10 Hz (Xₗ 2.0 Ω) by end-of-state** — contradicts the caption for the second half; flagging for founder judgment, not a hard defect |
| S6 `power_swings_both_ways` | ✓ | ✓ | ✓ (p-strip + U-gauge new) | ✓ | p-strip visibly crosses zero both directions (unambiguous, unlike resistor sibling); U-gauge liquid level rises/falls in sync w/ "storing"/"returning" labels — clean |
| S7 `nothing_consumed` | ✓ | ✓ | ✓ (⟨p⟩ needle gauge new) | ✓ | needle parked dead at 0.00 W in every frame while beads/U-gauge/p-strip visibly still move; coil stays cool grey/blue (no warm emissive) in every frame of the whole concept, confirmed contrast-checked against the resistor sibling's heater-glow behavior |
| S8 `one_integral_both_results` (advanced ring) | ✓ | ✓ | ✓ (derivation surface + sample dots new) | ✓ | 4-line Cambria-Math derivation clean Unicode (no ASCII math anywhere); fades in from t=0; v/i/p HUD intentionally absent here (replaced by area-cancellation sample dots) — not a defect |
| S9 `interaction_complete` (explore) | ✓ | ✓ | N/A (explore) | ✓ | formula surface shows ONLY "i lags v by ¼ cycle (90°)" — no Xₗ/p/U-gauge leakage, Rule 38b compliant; bead positions + HUD differ across keyframes (t=424ms→7886ms), confirms genuinely live/continuous motion per Rule 37 |

### Frames for founder eyes (5)

1. `C:\Tutor\physics-mind-ch7\.visual_runs\ac_voltage_inductor\20260723-014804\STATE_3__frozen.png` — ε_back label clipped behind the HUD box, reproducible every frame of S3.
2. `C:\Tutor\physics-mind-ch7\.visual_runs\ac_voltage_inductor\20260723-014804\STATE_4__dense_t02000.png` — clean baseline: "steepest climb" caption reads correctly (for contrast with #3).
3. `C:\Tutor\physics-mind-ch7\.visual_runs\ac_voltage_inductor\20260723-014804\STATE_4__dense_t06000.png` — the garbled overlapping caption bug at the PRIMARY AHA state, persists to frozen baseline.
4. `C:\Tutor\physics-mind-ch7\.visual_runs\ac_voltage_inductor\20260723-014804\STATE_5__dense_t06000.png` — frequency sweep at its peak (f=0.50 Hz, Xₗ=10.0 Ω), consistent with "faster/stronger" caption.
5. `C:\Tutor\physics-mind-ch7\.visual_runs\ac_voltage_inductor\20260723-014804\STATE_5__dense_t15000.png` — same state at end-of-timeline, f has reversed down to 0.10 Hz (below its own starting value) — the caption-vs-motion mismatch in question.

### Candidate `engine_bug_queue` rows (report only — not inserted)

1. **bug_class:** `field3d_hud_label_clipped_by_readout_box`
   **severity:** MAJOR
   **owner_cluster:** `peter_parker:renderer_primitives`
   **prevention_rule:** when a scenario's HUD gains a 4th row (e.g. `ε_back`), re-measure the HUD box width/position before placing any adjacent canvas annotation — never let a fixed-position label assume a fixed HUD width; verify no overlay text is cut off behind the readout box background at every state that changes HUD row count.

2. **bug_class:** `field3d_canvas_caption_text_not_cleared_between_sequential_reveals`
   **severity:** CRITICAL (obscures the PRIMARY AHA's core claim)
   **owner_cluster:** `peter_parker:renderer_primitives`
   **prevention_rule:** sequential canvas-drawn captions within one state (e.g. successive tangent-stop labels "steepest climb"→"flattest"→"steepest fall") MUST clear/redraw their background region before the next label is written, else stacked fillText calls concatenate into unreadable garbled text that persists for the remainder of the state including the frozen H2 baseline.

3. **bug_class:** `field3d_single_variable_sweep_reverses_past_start_within_one_state` (ambiguous — founder judgment needed)
   **severity:** MODERATE
   **owner_cluster:** `ambiguous` (alex:json_author reveal-timeline authoring vs renderer parametric-sweep script)
   **prevention_rule:** a guided state's declared motion archetype (e.g. "frequency rises → Xₗ rises → current shrinks") should either hold monotonic through the state's full narrated duration or the caption should acknowledge a return sweep — verify the swept variable's end-of-state value is consistent with the state's delta-cue caption, not just its peak value.

### Overall read: **FINDINGS (3)**

Two reproducible legibility defects (S3 HUD-clip, S4 caption-garble — the second on the concept's PRIMARY AHA state) plus one ambiguous motion-design question (S5 frequency-sweep reversal) that needs a founder call, not a fix cycle. Everything else — the S2 ghost-compare mechanics, S3 back-emf arrow flip + opposite-sign HUD, S6 power-crosses-zero, S7 dead-meter/cold-coil, S8 derivation Unicode, S9 core-ring-only explore — verified clean and matches the concept's load-bearing claims.
