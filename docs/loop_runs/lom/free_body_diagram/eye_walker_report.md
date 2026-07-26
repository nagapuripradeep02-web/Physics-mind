# EYE_WALKER REPORT — free_body_diagram
Run: `.visual_runs/free_body_diagram/20260725-191730/` (7 states) · engine_bug_queue: no matching OPEN/DEFERRED rows for free_body_diagram (field3d) at time of walk.

## 1. Deterministic gate summary (verbatim)
📊 31 deterministic checks · 31 passed · 0 failed · $0.00 · (from quality_auditor's prior run — the pixel/motion judgment below is what those gates cannot see.)

## 2. Per-state verdict table

| state | reveal (frozen) | motion (dense) | delta visible? | Rule 24/29 | note |
|---|---|---|---|---|---|
| S1 fbd_isolate | ✓ G1/G2 dimmed ~0.40, no arrows on ghosts, `mg` drawn on A | ✓ (no motion visible across dense series — reveal already settled by t=0, a documented non-finding class) | ✓ vs black baseline, "One body at a time" reads | ✓ | none |
| S2 rest_equilibrium | ✓ N=19.60N mg=19.60N, net genuinely absent, no stub | ✓ static equilibrium, correct | ✓ (contact→arrow, N=mg caption) | ✓ | none |
| S3 coast_no_force | ✗ frozen frame shows body PARKED at platform's right edge, v=0.00 | ✗ **CRITICAL** — body reaches the platform edge by ~t=2000ms and STOPS DEAD (v drops 2.00→0.00, position frozen) for the remaining ~8s of the 10s state; G3 ghost correctly stays frozen throughout | ✓ (A does traverse past G3 before hitting the wall) | ✓ | see Finding 1 |
| S4 coast_with_friction | ✗ frozen frame shows body parked at right edge (F/fₖ arrows fully drawn, ΣF=0.00) | ✗ same edge-clamp as S3 — body glides smoothly t=0→~t6000 then halts at the edge and stays static through t=10000/frozen | ✓ contrast with S3 visible while moving | ✓ | see Finding 1 |
| S5 incline_decompose | ✗ frozen frame shows θ=14°, N=18.99N — NOT the swept endpoint | ✗ **MAJOR** — θ is non-monotonic across dense frames: t0=23°→t1000=22°→t2000=7°→t4000=22°→t6000=8°→t8000=22°→t10000=8°→frozen=14°. This is a fast back-and-forth oscillation, not a single 0°→30° pass; `mg` does stay vertical (correct) but N bounces up/down (18.07→19.43→18.13→19.41…) instead of falling monotonically | ✗ no clean single delta — the misconception counter ("N falls smoothly as tilt grows") is undermined by the oscillation | ✓ | see Finding 3 |
| S6 fbd_isolate (hanging) | ✗ **CRITICAL** — `tension` arrow NEVER appears in any frame including frozen; `T` readout is stuck at **0.00 N** the entire state (should reach 19.60 N); no anchor/cable geometry visible; body H floats off-center in the bottom-right corner of frame, not on-axis under an anchor | ✗ no motion at all — static broken scene throughout | ✗ nothing happens; S2↔S6 "N becomes T" payoff (both should read 19.60N) is invisible — T never leaves 0 | ✓ (surface correctly absent — that half works) | see Finding 2 |
| S7 sandbox | n/a (explore) | ✗ same edge-clamp recurs — body reaches platform edge by ~t6000 and freezes (v=0.00 despite a=1.79–3.10 m/s² reported, a genuine physics contradiction: nonzero acceleration with static position/zero velocity) | n/a (explore) | ✓ | see Finding 1 |

## 3. Frames for founder eyes (5)
1. `.visual_runs/free_body_diagram/20260725-191730/STATE_3__dense_t02000.png` — v drops to 0.00 the instant A reaches the platform edge, directly contradicting the "constant velocity, no force" caption/formula on screen.
2. `.visual_runs/free_body_diagram/20260725-191730/STATE_3__frozen.png` — reveal-complete baseline still shows A dead-stopped at the edge — this is the H2 baseline that will get locked in by `visual:approve` if not caught now.
3. `.visual_runs/free_body_diagram/20260725-191730/STATE_6__frozen.png` — tension arrow completely absent, T=0.00N, body floating off-center with no anchor/cable — the state's entire taught content is missing.
4. `.visual_runs/free_body_diagram/20260725-191730/STATE_5__dense_t00000.png` — literal state-clock t=0 already shows θ=23°, N=18.07N — nowhere near the authored start value.
5. `.visual_runs/free_body_diagram/20260725-191730/STATE_5__dense_t02000.png` — θ has dropped to 7°, N=19.43N — proves the sweep is oscillating back and forth, not a single monotonic 0°→30° pass.

## 4. Candidate engine_bug_queue rows (3)

1. **bug_class:** `coast_body_halts_at_platform_edge`
   **severity:** CRITICAL
   **owner_cluster:** peter_parker:renderer_primitives
   **prevention_rule:** In the `newtons_laws_body` scenario, any state whose scripted `v0 × duration` can carry the body past the platform's physical extent must either author a platform long enough for the full state duration or the engine must NOT silently zero velocity/clamp position on edge contact — a "coast" or "sandbox" state freezing mid-duration with the applied/net-force caption still reading "no forward force needed" / "ΣF=ma" visibly contradicts the displayed physics (nonzero `a` with static position was observed in S7). Recurs in S3, S4, S7 — all three states that involve horizontal translation on this scenario.

2. **bug_class:** `hanging_body_tension_arrow_and_readout_missing`
   **severity:** CRITICAL
   **owner_cluster:** peter_parker:renderer_primitives
   **prevention_rule:** A `hanging: true` body with `arrows: [tension]` must render the tension arrow (and an anchor/cable) and the `T` readout must track computed T — never stay pinned at 0.00 for the entire state including the frozen/reveal-complete baseline. This is the FIRST authored concept exercising the `surface.hidden`/hanging-body path (commit `04aa6fa`) beyond bring-up bench-testing — the hanging-body arrow/readout wiring itself appears incomplete even though `surface.hidden` (no table) works correctly.

3. **bug_class:** `idle_auto_sweep_non_monotonic_oscillation_on_guided_state`
   **severity:** MAJOR
   **owner_cluster:** peter_parker:renderer_primitives
   **prevention_rule:** `idle_auto_sweep` on a GUIDED (non-explore) state must traverse its authored range ONCE and hold at the end value — not run a short-period back-and-forth triangle that produces a non-monotonic reading sequence (observed: θ 23°→22°→7°→22°→8°→22°→8° across a single 10s state). This breaks Rule 32a's single readable cause-then-effect motion and the misconception counter that depends on `N` falling monotonically. Verify dense-frame monotonicity on any concept authoring `idle_auto_sweep` on a guided state (S7's sandbox explore-state triangle sweep is correctly exempt — Rule 37 free-run).

## 5. Overall read
**FINDINGS (3)** — do not auto-approve. Two CRITICAL (S3/S4/S7 shared edge-clamp; S6 tension entirely missing) and one MAJOR (S5 theta oscillation) are genuine motion/physics-correctness defects invisible to the deterministic gates. Recommend routing to `peter_parker:renderer_primitives` before re-running THE EYE; `quality_auditor` PASS + this report do NOT together satisfy the Amendment 6 auto-trigger given these findings.
