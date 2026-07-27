# eye_walker report -- newton_first_law
Run dir: .visual_runs/newton_first_law/20260725-191906/ (frames read exhaustively: 4 contact sheets,
4 frozen, 4 panel_a static, dense frames sampled at ~1s cadence across all four states, 5 STATE_4 KEYFRAMES).

## Deterministic gate summary (verbatim)
19 deterministic checks - 19 passed - 0 failed - 0.00 cost.
This run is exactly why THE EYE needs a human/agent frame-read: the physics defect below is
invisible to D1p/D5/D6/D7/H1/H2 because it manifests as an HUD-numeric readout discrepancy plus a
too-early-stopped position, not a pixel-diff regression against a prior baseline (there is no prior
baseline for a NEW concept) and not a no-motion false positive.

## Per-state verdict table

state | reveal (frozen) | motion (dense) | delta visible | Rule 24/29 | note
--- | --- | --- | --- | --- | ---
STATE_1 coast_no_force | OK: mg+N arrows present, balanced, net correctly absent (0-magnitude hidden by design) | FAIL | OK (vs black baseline, first state) | OK | v and F_net readout snaps 1.00 to 0.00 between the t=15000 and t=16000/frozen dense samples. The never-slows claim is visually contradicted at the exact moment a teacher would freeze the sim (state-end hold). Root cause traced to the engine, see Candidate 1.
STATE_2 coast_with_friction | OK: friction arrow present, N/mg balanced, formula legible | FAIL | OK (contrast pair vs STATE_1, but see note) | OK | The deceleration itself is never shown. Even the FIRST captured frame (panel_a static, effectively t about 0) already reads v=0.02 m/s and F_net=-0.49 N, i.e. already about 98 percent decelerated before the dense series own t=0 sample. By t=1000 ms the block is fully at rest (v=0.00) and stays visually frozen in place through t=14000/frozen. A teacher watching this state sees a static block the entire time, never the dies-within-a-couple-of-metres motion the aha_moment promises. Same root cause as STATE_1, see Candidate 1.
STATE_3 rest_equilibrium | OK: N=19.60 N (m=2kg times 9.8, correct), F_net=0.00 pinned, mg/N full-length equal-opposite arrows | n/a (static state by design) | OK | OK | The authored phases handoff_to_normal glow handoff at 4000ms is not visually perceptible -- mg and N arrows read at the same brightness/colour in t=3000 (pre-handoff) vs t=4000/5000 (post-handoff) frames. Cannot confirm Rule 32e exactly-one-glow-focal is actually rendering a visible brightness delta. Minor to moderate, see Candidate 2.
STATE_4 sandbox | OK: all 5 sliders (m, F, mu_s, mu_k, v0), NO theta row (correct for a flat-ground concept) | OK | n/a (explore, exempt) | OK | idle_auto_sweep on F drives real ongoing motion plus live numeric HUD across all 5 KEYFRAMES (t=94 to 10111ms). Rule 37 free-run confirmed working. No defects found.

## Frames for founder eyes (5)

1. .visual_runs/newton_first_law/20260725-191906/STATE_1__dense_t15000.png -- last frame with the correct v=1.00 reading.
2. .visual_runs/newton_first_law/20260725-191906/STATE_1__frozen.png -- the H2-baseline pin: shows v=0.00, block apparently stopped. This is the frame the founder will actually see on approval.
3. .visual_runs/newton_first_law/20260725-191906/STATE_2__panel_a.png -- the very first STATE_2 capture already shows v=0.02 (98 percent decelerated). Proves the stop happens before the reveal clock own t=0.
4. .visual_runs/newton_first_law/20260725-191906/STATE_2__dense_t00000.png -- for side-by-side against STATE_1 dense_t00000.png (same camera, same launch, should look like STATE_1 t=0 but already reads v=0.02).
5. .visual_runs/newton_first_law/20260725-191906/STATE_3__dense_t03000.png vs STATE_3__dense_t04000.png -- pre/post the authored glow handoff at 4000ms; arrows look identically dim in both, for a founder judgment call on whether the handoff is perceptible enough.

## Candidate engine_bug_queue rows (report only -- SQL TEXT for docs/loop_runs/lom/_engine/scar_candidates.sql; I do not insert)

```sql
-- Candidate 1 (CRITICAL) -- newtons_laws_body physics clock desyncs from the state-local reveal clock
INSERT INTO engine_bug_queue (bug_class, severity, owner_cluster, prevention_rule, status, notes)
VALUES (
  "nlb_physics_clock_not_state_local",
  "CRITICAL",
  "peter_parker:renderer_primitives",
  "updateNewtonsLawsBodyFrame integrates eng.t_ms via a per-tick real-wall-clock dtStep that is
   never rebased by RESET_TRAJECTORY, unlike every other reveal timeline in field_3d_renderer.ts,
   which is a pure function of (time minus stateStartTime) and IS rebased by RESET_TRAJECTORY. The
   body starts integrating the instant applyNewtonsLawsBodyState builds a fresh eng object at
   SET_STATE, before the harness or player has sent RESET_TRAJECTORY and begun the state-local
   reveal window. Any real-time gap between state entry and reveal start (THE EYE per-frame
   screenshot and encode overhead observed here, roughly 1 to 4 seconds; potentially also a real
   teacher pausing before pressing Play) causes the block to have already silently moved or
   decelerated by an uncontrolled amount. Symptom A: STATE_1 coast_no_force, frictionless, a=0 --
   the v and F_net readouts are correct throughout, but the LAST captured frame (H2 frozen pin,
   t=16000ms nominal) reads v=0.00, meaning the position hit the plus-10-metre bound, contradicting
   never slows at the exact moment a teacher would leave it frozen. Symptom B, worse, same root
   cause: STATE_2 coast_with_friction -- the FIRST captured frame (panel_a static, nominal t about 0)
   already reads v=0.02 m/s, 98 percent decelerated from v0=1.0, meaning the entire roughly 4 second
   deceleration the state exists to teach happens invisibly before the reveal clock even starts
   counting; the state then reads as a static block for its whole roughly 14 second duration. Fix:
   gate updateNewtonsLawsBodyFrame accumulation on the same state-local basis (time minus
   stateStartTime) the other reveal systems use, or explicitly hold the nlb engine at dt=0 from
   SET_STATE until the first RESET_TRAJECTORY or Play fires.",
  "OPEN",
  "Found by eye_walker on newton_first_law 20260725-191906 dense-frame walk; deterministic gates
   19 of 19 did not catch it -- HUD-numeric plus position-vs-caption contradiction, not a pixel
   regression."
);

-- Candidate 2 (MODERATE) -- STATE_3 glow handoff not visually perceptible
INSERT INTO engine_bug_queue (bug_class, severity, owner_cluster, prevention_rule, status, notes)
VALUES (
  "nlb_phase_glow_handoff_not_visible",
  "MODERATE",
  "ambiguous",
  "newtons_laws_body phases glow_focal handoff (rest_equilibrium handoff_to_normal at 4000ms,
   nlb_arrow_A_weight to nlb_arrow_A_normal) fires per nlbRunPhases (phase_fired and glow_focal
   swap confirmed in code) but produces no discernible brightness delta between the mg and N
   arrows in frames before vs after the handoff (STATE_3 dense_t03000 vs dense_t04000, t05000,
   frozen look identical). Either applyNewtonsLawsBodyGlow does not actually differentiate
   brightness for these two arrow kinds, or the effect is too subtle at this render scale or
   exposure to read as exactly-one-glow-focal per Rule 32e. Needs renderer-side verification --
   owner ambiguous between renderer_primitives if it is a genuine glow-application gap vs
   json_author if the phase timing or magnitude needs tuning.",
  "OPEN",
  "Found by eye_walker on newton_first_law 20260725-191906 dense-frame walk."
);
```

## Known false-positive classes checked against -- none applicable here
- Not a stale-H2 regression (this is a brand-new concept, no prior baseline).
- Not a panel-sync timing DOM complaint (F1/F4 territory) -- this is a physics-integration and
  HUD-numeric contradiction inside a single panel, confirmed by reading the raw b.v-driven readout
  values, not a cross-panel sync artifact.
- Not the Anchor-tie-relaxed amber note class, not a sliders/control-panel-per-state difference
  (Rule 31 contextual controls confirmed correct: STATE_1/2 show no controls, STATE_3 shows only m,
  STATE_4 shows all 5, as authored).

## Overall read

EYE VERDICT: 2 CANDIDATE(S)

1. CRITICAL -- nlb_physics_clock_not_state_local (STATE_1 premature stop-at-bound at the frozen pin;
   STATE_2 deceleration entirely invisible, already stopped from its first captured frame). This is
   the dominant finding -- it undermines the PRIMARY aha of the whole concept (STATE_2 is the
   declared contrast pair for STATE_1 never-slows claim, and right now STATE_2 shows no motion to
   contrast against).
2. MODERATE -- nlb_phase_glow_handoff_not_visible (STATE_3 weight-to-normal glow handoff not visibly
   differentiable across frames).
