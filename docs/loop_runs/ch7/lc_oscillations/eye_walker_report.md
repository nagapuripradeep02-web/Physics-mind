# THE EYE walk — `lc_oscillations` (Ch.7 #7) — run 20260724-142012

**Deterministic gate summary:** 39/39 deterministic checks passed · 0 failed. Pre-walk bug-queue check: `query_engine_bug_queue.ts lc_oscillations --field3d --open` → no matching rows (clean history).

The deterministic gate is clean, but the pixels tell a different story on two states — one is the concept's PRIMARY AHA.

## Per-state verdict table

| State | Correct (physics) | Order OK | Labels/Unicode | Reads sound-off | Clearly different | How a teacher uses it | Problem / missing | Priority |
|---|---|---|---|---|---|---|---|---|
| S1 charge_the_plates | Yes — V:0→10V, E_C tracks ½CV² | Yes | Clean (`E=½CV₀²`) but duplicated bottom-right | Yes | Yes (charging-marker fill) | Point at +/− markers accumulating while V rises | Duplicate formula echo (minor) | P3 |
| S2 throw_the_switch | Yes — q/i/E_C/E_B track | Yes | Clean, no dup here | Yes | Yes (switch flips, dots flow) | Point at switch throwing + dots starting | Minor rounding seam (3.19+3.18=6.37≠6.36) | P3 |
| S3 empty_is_not_over (PIVOT#1/PRIMARY AHA) | Motion correct (dense t=3000: q=0.00C, i=2.00A unsigned) but **frozen reference frame wrong** | Yes | No ASCII issues | **NO** — caption "empty — yet current peaks" but frozen frame shows q=−0.90C | Yes | Meant to pause exactly at the crossing — the DEFAULT held frame doesn't | **reveal_hold (2500ms) ends before the crossing (~3000ms)** — the most important frame in the concept is captured pre-event | **P1** |
| S4 its_own_rhythm | Yes — f₀=0.25Hz/T₀=4.00s self-consistent | Yes | Top formula clean; bottom-right duplicate shows **broken √→"V"** | Mostly | Yes (period-annotated graph) | Point at 4.00s swing → f₀ formula | Duplicate + broken-glyph formula echo | P2 |
| S5 the_energy_slosh (PIVOT#2) | Physics correct (antiphase SHM trade) | Yes | Bottom-right formula clean (single surface) | Caption accurate | Yes (bar chart) | Point at green/purple bars trading under flat total | **Bar-chart total-label collides with rightmost bar's label** (garbled "4636 J"); **2.20+4.17=6.37≠6.36 seam at the total line**; no glow/brightness differential on gauges (height-only) | **P1** |
| S6 a_block_on_a_spring | Yes — analogy mapping correct | Yes | Top formula clean (↔); bottom-right duplicate **clipped** (missing "q↔x · i" prefix) | Yes | Yes (mass-spring inset) | Compare sine waves to spring-block | Same bar-chart collision (recurring); duplicate+clipped formula | P2 |
| S7 real_coils_leak | **NO** — R stays 0.0Ω, oscillation undamped across ENTIRE timeline (t=0→18000ms, past the 8500ms reveal_hold) | Placement fine, content broken | Bar-chart collision persists | **NO** — caption promises decay/heat that never appears | **NO** — near-identical to S6 (same undamped waveform + twin panel, inert slider added) | Intended to show heat shrinking the swing — currently unusable | **CRITICAL — the state's entire teaching point never renders** | **P1** |
| S8 the_shm_equation (advanced) | Yes — full derivation, minus/√/²/subscripts correct Unicode | Yes | Clean, single surface, no dup | Yes | Yes (static derivation vs live motion) | Walk the board-style derivation | None found | — |
| S9 lc_sandbox (explore) | Sliders live, continuous motion (Rule 37 OK) | Yes | Same bar-chart collision + broken-√ duplicate | Yes | Yes (full control panel) | Hand control to teacher/student | Recurring collision/dup; **unverified whether dragging R drives decay** (THE EYE can't fire trusted drags) | **P1 (contingent — founder hand-test)** |

## Frames for founder eyes (5)
1. `.visual_runs/lc_oscillations/20260724-142012/STATE_3__frozen.png` — PRIMARY AHA's held frame reads q=−0.90C while caption says "empty — yet current peaks."
2. `.visual_runs/lc_oscillations/20260724-142012/STATE_3__dense_t03000.png` — the actual crossing (q=0.00C, i=2.00A unsigned) that should have been the frozen reference.
3. `.visual_runs/lc_oscillations/20260724-142012/STATE_7__dense_t18000.png` — R still 0.0Ω / undamped 18s into a decay state.
4. `.visual_runs/lc_oscillations/20260724-142012/STATE_5__frozen.png` — bar-chart total-J label collides with rightmost bar label ("4636 J") + the 2.20+4.17=6.37≠6.36 seam on the flat-total pivot.
5. `.visual_runs/lc_oscillations/20260724-142012/STATE_4__frozen.png` — duplicate bottom-right formula renders √ as bare "V" (`1/(2πV(LC))`).

## Candidate engine_bug_queue rows (report only — not inserted)

| bug_class | severity | suggested owner_cluster | prevention_rule |
|---|---|---|---|
| `pivot_frozen_frame_precedes_crossing_event` | CRITICAL | alex:json_author | When a state's payload is one instantaneous crossing (q=0/i-max), author reveal_hold ≥ the in-state timestamp of that event — the SET_TIME_FREEZE pin is the default resting frame; here it fires 2500ms while the crossing lands ~3000ms, so the held frame contradicts its caption. |
| `s7_damping_never_renders` | CRITICAL | ambiguous (alex:json_author STATE_7 R-ramp cue AND peter_parker ODE damped-branch solve) | For any state whose caption claims a parameter "eases in" during reveal, dense-sample the driven slider + dependent energy readout across the FULL reveal window before shipping — static slider + zero dependent readout across every dense frame = the binding never touched live physics. |
| `energy_bar_chart_total_label_collides_with_last_bar_label` | MAJOR | peter_parker:renderer_primitives | The bar-chart's fixed "Etotal J" label and the rightmost bar's live value label anchor at the same top-right position in both 2-bar (S5/S6) and 3-bar (S7/S9) variants — reserve distinct offsets. |
| `duplicate_formula_surface_bottom_right_broken_sqrt` | MAJOR | peter_parker:renderer_primitives | A canvas-drawn bottom-right formula echo duplicates the authored formula surface (Rule 34b), renders √ as bare "V" (Rule 34c — text path the Unicode sweep missed), and clips long formulas (34d, S6). Remove the duplicate or route it through the Unicode-safe font with non-colliding bounds. |
| `energy_readout_rounding_seam_vs_displayed_total` | MODERATE | peter_parker:renderer_primitives | Round the last displayed component as (total − sum of already-rounded others), not independently, so component sums never seam against the displayed total (2.20+4.17=6.37≠6.36). |
| `energy_gauge_no_glow_emphasis_no_op` | MODERATE | peter_parker:renderer_primitives (needs source confirmation) | E_C/E_B/E_R bars + mass-spring inset use identical unmodulated colors regardless of dominance — height/marker only, no brightness differential. Add applyGlowEmphasis-style highlight to the momentarily-dominant gauge (Rule 32e single-focal). |

## Overall read: **FINDINGS (6)**
Two CRITICAL on the concept's two pivots (S3 PRIMARY AHA freezes pre-crossing; S7 "real coils leak" never animates — static R=0Ω across full 18s dense-capture, past its 8.5s reveal_hold). Four are a recurring renderer-primitive collision/duplication pattern (bar-chart label collision + duplicate/broken-√/clipped formula echo) across 4–5 of 9 states, plus a display-rounding seam. S1/S2/S8 clean; S9 sandbox inherits the corner-overlay bugs + an open question on whether manual R-drag drives decay (founder hand-test).
