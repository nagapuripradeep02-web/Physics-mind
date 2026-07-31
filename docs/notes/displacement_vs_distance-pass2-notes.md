# Pass-2 notes — displacement_vs_distance

Renderer family: field_3d, NEW scenario `kinematics_1d_track` (not yet built —
see `field_3d_config.engine_build_spec` in the concept JSON). Per the
Pass-2 lens instructions for field_3d concepts: Q3 motion is authored via
`field_3d_config.states.STATE_N.track.phases[].at_ms` (absolute ms after
state-enter); this is a NEW (Rule-31) concept, so there are no
`pause_after_ms` Socratic pauses to carry — every beat lives in the
per-state `track` block on the state's own clock.

## STATE_1 — Position needs an origin

1. **What's invisible right now?** That a bare number like "+30 m" has no meaning without a declared reference point. A student who has only ever heard "the block is at 30" doesn't yet see that 30 is *relative to something*.
2. **Feel the confusion first?** The state opens with the track and ticks wiping in *before* the origin flag drops — for a beat there's a track with no zero marked, so "30 m from where?" is the natural question the student is left holding for ~1s before the flag answers it.
3. **What moves/appears?** Track+ticks wipe in (0–1200ms) → origin flag drops (1000–1600ms) → runner steps O→+30m (1800–3600ms) → THEN (0.5s readable gap) the dx_readout digit-rolls up. The position number is never asserted before the runner has visibly walked it.
4. **Where does the eye go?** `focal_primitive_id: "origin_label"` — the O/origin annotation, not the state title. The runner's motion is the loudest visual event, and the origin_label callout is what explains *why* that motion is the thing to watch. Fix already applied (not a title label).

## STATE_2 — One-way motion: distance and displacement match

1. **Invisible:** That two differently-defined quantities (an odometer vs. a signed position-change) can produce the *same number* — students expect "two different formulas" to mean "two different numbers," always.
2. **Feel it first:** The runner jogs at constant, un-eased speed specifically so the two readouts climb in visible lockstep — the student watches both numbers race up together in real time before any sentence claims they're equal.
3. **What moves:** `disp_arrow` tip + `d_readout` + `dx_readout` all update on the same frame as the runner's x(t) (continuous tracker, per `continuous_tracker_note`) — nothing is static, nothing is asserted only in text.
4. **Eye:** `focal_primitive_id: "equal_label"` — the readout-equality callout, positioned where the two live numbers are compared, not the top title.

## STATE_3 — The turnaround (PRIMARY aha, misconception_confrontation)

1. **Invisible:** That distance and displacement, having agreed in STATE_2, are about to violently diverge — the student's naive extrapolation from STATE_2 is "they'll always match."
2. **Feel it first (Rule 31 delivery — motion creates the curiosity beat, no predict-pause):** The outbound leg (500–3500ms) repeats STATE_2's lockstep pattern one more time — deliberately reinforcing the wrong expectation — THEN the pivot (3500–3900ms) and the return leg (4100–7100ms) show the odometer *still climbing* while the arrow *visibly shrinks*, for a full 3s before the reveal resolves it. The ghost arrow (dim, growing at the "wrong" rate, in a separate lane) makes the wrong-belief's consequence a literal on-screen object, not a lecture.
3. **What moves:** disp_arrow shrinks live; ghost_arrow grows live in an offset lane; d_readout climbs 0→40→80; then the ghost gets struck through and dx_readout locks at 0 with an emphasis pulse. Every quantity the narration names (ghost's growth, the strike-out, the arrow's collapse) is a rendered object per `engine_build_spec.constraints` (last item).
4. **Eye:** `focal_primitive_id: "displacement_zero_label"` — the Δx-shrinks-to-0 callout. Glow sequence is exactly one focal at a time: `kt_disp_arrow` → `kt_turnaround_post` (pivot) → `kt_ghost_arrow` (return) → `kt_dx_readout` (reveal) — never simultaneous, per Rule 32e.

## STATE_4 — Displacement carries a sign (misconception_confrontation)

1. **Invisible:** That a *direction* reversal maps onto a *sign* — not a magnitude change, not "distance goes negative," not "displacement loses its sign." The two live misconceptions this confronts (§4 architect table): "both should go negative" and "neither can go negative."
2. **Feel it first:** Cause-before-effect (Rule 32a) — the runner takes visible steps toward −x (600–1000ms) BEFORE the arrow flips or the readout goes negative (at 1500ms, a 0.5–0.9s readable gap later) — the student watches the *direction* happen first, then watches the *sign* answer it.
3. **What moves:** disp_arrow discretely flips orientation (a state swap, not a rotation — `engine_build_spec.constraints` bans `radians()` here); dx_readout ticks live negative to −20; d_readout ticks live positive to +20 on the SAME screen, so the asymmetry (one signed, one not) is directly comparable in one glance.
4. **Eye:** `focal_primitive_id: "sign_label"` — the "Δx carries a sign; d never does" callout, the state's one propositional claim, not the title.

## STATE_5 — Endpoints only: Δx = x_f − x₀

1. **Invisible:** That displacement is blind to the path — a student who has just watched three "watch what happens along the way" states expects the *path itself* (how many laps, how convoluted) to matter to the answer.
2. **Feel it first:** The runner sweeps multiple laps (each one a full back-and-forth, dx_readout genuinely oscillating with x(t), d_readout visibly ratcheting up every lap) BEFORE the final settle — so the student watches the "the path is busy" fact directly, then watches Δx come to rest at the same +20 m regardless of how many laps ran.
3. **What moves:** dx_readout oscillates live with x(t) during the sweep, d_readout climbs monotonically (+40 per lap, a REAL number via the lap_counter per Rule 33d), then a readable gap (0.3s) → a lap-distance callout ("extra_laps × 40 m") → glow shifts to dx_readout re-emphasizing the UNCHANGED +20 m. The live `extra_laps` slider control lets the teacher re-run the sweep with more/fewer laps and re-derive d immediately, without touching Δx.
4. **Eye:** `focal_primitive_id: "endpoint_label"` — the Δx = x_f − x₀ formula callout, the state's one idea.

## STATE_6 — Explore

1. **Invisible:** N/A — explore states consolidate, they don't introduce new physics (Rule 31, explore-last = 0/open).
2. **Feel it first:** N/A — sandbox.
3. **What moves:** Idle auto-sweep (−40↔+40m) runs continuously per Rule 37 until a trusted drag seizes control; all readouts + the arrow track live under every control (target_x, turnaround_x, speed, extra_laps) and direct drag.
4. **Eye:** `focal_primitive_id: "explore_label"` — the "drag the runner" instruction callout.

## Re-entry orientation check

Every state's first ~300–600ms is a quiet "home pose" reset (runner snaps to O, track/ticks/flag persist, turnaround_post/sweep_markers fade in only where that state needs them) BEFORE any new content — a returning student sees the full apparatus in a recognizable pose before anything new happens. No state has a `reveal_at_ms > 2000` leaving a bare/static object on screen — the latest first-reveal is STATE_1's readout count at 4100ms, but STATE_1's runner has already been visibly walking since 1800ms, so the screen is never bare during the wait.

## RHR / FBD / gesture check

N/A — this is pure 1D translational kinematics along a straight track. No cross products, no circulation, no hand gesture is taught or implied (declared not omitted, per architect DoD (c)).

## DC Pandey check

Scope only (distance-vs-displacement is standard Ch.3 Motion in a Straight Line content). Teaching method (the fitness-tracker anchor, the ghost-arrow misconception confrontation, the odometer/lap-counter framing, the per-state motion archetypes) is first-principles, not mirrored from any DC Pandey worked example or figure.
