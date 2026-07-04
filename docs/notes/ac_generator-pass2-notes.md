# ac_generator — Pass-2 four-question lens (Gate 15 record)

Concept: `ac_generator` (Ch.6 §6.10, field_3d scenario `ac_generator`). Straightforward Rule-31 model,
tighter ~20s/beat pacing (founder 2026-07-04). RHR resolved WITHOUT a 3D hand — direction is the
eps-sine polarity + a flipping external-circuit current arrow (S5). PRIMARY aha = STATE_3.

Renderer-family note: motion is authored in `field_3d_config.states.STATE_N.ac_generator.*`, driven by the
SINGLE accumulated phase `theta = integral(omega dt)` on the state clock (Rule 26). Q3 motion is the coil
rotation + the live graph dots; there are NO `pause_after_ms` prediction pauses (Rule 31 — new concept, not
a legacy Socratic port, so nothing to carry forward).

## STATE_1 — machine_overview (energy: work in → electrical out)
1. **Not known yet:** that a generator does not *make* electricity — you must keep doing mechanical work, and
   the field only mediates. Invisible: the causal link "stop cranking → output dies".
2. **Feel the confusion:** the bulb pulses bright→dim twice per turn while the coil visibly spins; the beat
   ends on the fact that stopping the crank kills the bulb (misconception_watch visual_counter).
3. **Moves/appears:** the coil rotates, the slip rings turn (yellow nubs make the spin visible), the bulb
   brightness pulses ∝ sin²θ. Nothing is narrated that is not already moving.
4. **Hand/eye:** eye goes to the pulsing bulb (bottom) and the spinning coil (centre). `focal_primitive_id`
   = `acg_energy_note` (the work-in/energy-out line), the physics-bearing claim — not the title.

## STATE_2 — flux_trace (Phi = NBA cos ωt)
1. **Not known yet:** that flux depends on the coil's ORIENTATION even in a uniform B — max face-on, zero
   edge-on. Invisible: the cos θ projection.
2. **Feel it:** the yellow area-vector sweeps relative to B while the translucent flux disc fades from full
   (face-on) to nothing (edge-on) — the student SEES "uniform B, yet the flux changes".
3. **Moves/appears:** coil rotation, the normal arrow reorienting to (cosθ,0,−sinθ), the flux-disc opacity
   ∝ |cosθ|, and the green cosine graph tracing live with its dot in lockstep with the coil.
4. **Hand/eye:** eye tracks the normal arrow vs the field arrows; `focal_primitive_id` = `acg_flux_formula`
   (Φ = NBA cos ωt), co-located with the graph.

## STATE_3 — emf_phase (PRIMARY aha: EMF peaks where flux = 0; steady spin → AC)
1. **Not known yet:** that the EMF peaks exactly where the flux is ZERO (the crux trap), and that a steady ω
   still gives AC. Invisible until both curves are drawn together: the 90° lag.
2. **Feel it:** the two live dots contradict intuition on screen — at the face-on instant the green flux dot
   sits at its peak while the amber EMF dot reads exactly 0; a quarter-turn later they swap. The surprise is
   built by the MOTION (Rule 31), not a predict-pause.
3. **Moves/appears:** the bright sine EMF curve joins the faded cosine flux curve; snap markers (dashed
   verticals) mark the last flux-max ("Φ max, ε=0") and the last emf-max ("ε peak, Φ=0"), a quarter period
   apart; ε₀ = NBAω is revealed here FIRST (reveal gate — never in S1/S2).
4. **Hand/eye:** eye goes to the two dots on the graph (bottom-left) and their vertical offset in time;
   `focal_primitive_id` = `acg_phase_note` ("EMF max where flux = 0 → 90° apart"), the aha claim itself.
   **Phase crux self-check:** at ωt=0 (face-on) Φ=+0.4 Wb max, ε=0; at ωt=90° (edge-on) Φ=0, ε=+0.6 V peak —
   verified by the physics_author numerics and reproduced by the renderer (Phi=phiMax·cos θ, emf=emf0·sin θ).

## STATE_4 — peak_dependence (ε₀ = NBAω; ω raises peak AND frequency)
1. **Not known yet:** that ω sits INSIDE the amplitude, so cranking faster raises BOTH the peak and the
   frequency — not just the frequency.
2. **Feel it:** on the FIXED ±4.0 V axis (growth is the teaching — not auto-normalised), cranking ω up makes
   the sine grow taller AND pack more cycles; adding N makes it only taller. The contrast is live under the
   two sliders.
3. **Moves/appears:** the sine reshapes live as ω/N change (amplitude ∝ NBAω on a fixed axis, more cycles per
   window ∝ ω); the f-readout tracks ω/2π; the coil visibly gains/loses turns with N.
4. **Hand/eye:** hand goes to the ω and N sliders (the only two rows shown); eye to the reshaping sine;
   `focal_primitive_id` = `acg_peak_formula` (ε₀ = NBAω).

## STATE_5 — slip_rings (two rings → AC; split ring → DC)
1. **Not known yet:** how current leaves a spinning coil without twisting wires, and that slip rings ≠
   commutator. Invisible: the half-turn connection swap.
2. **Feel it:** the external-circuit current arrow FLIPS direction every half turn, exactly as the sine
   crosses zero — the reversing flow IS the AC. The split-ring inset stands beside it as the DC alternative.
3. **Moves/appears:** the slip rings turn under the fixed brushes (close-up camera), the external current
   arrow flips at sign(sin θ) zero crossings synced to the eps graph, the split-ring commutator inset labels
   the one-way DC contrast.
4. **Hand/eye:** eye goes to the flipping arrow on the external wire and the rings/brushes; `focal_primitive_id`
   = `acg_ring_note` (two rings → AC | one split ring → DC). NO hand primitive — direction is the arrow flip +
   the sine polarity (per the founder decision; no det=+1 check).

## STATE_6 — sandbox (explore, interaction_complete, duration 0)
1. **Not known yet:** the joint dependence — the student now OWNS all four knobs.
2. **Feel it:** free exploration; every quantity re-derives live.
3. **Moves/appears:** the coil auto-sweeps at the live ω (idle_autosweep — D1p-safe: it never freezes), both
   graphs auto-scale to the current ε₀/Φ_max with an "(auto-scaled)" caption, bulb + flipping arrow + normal
   all live.
4. **Hand/eye:** hand to all four sliders (ω, N, B, A — all rows shown); `focal_primitive_id` =
   `acg_explore_key` (ε = NBAω sin ωt, 90° behind the flux).

## Re-entry orientation (first 5s of every state)
Every guided state opens on the coil already present and spinning in the field between the labelled N/S poles
(orientation is instant — the coil, poles, and field arrows are in `visible_elements` at state entry). No
delayed first reveal leaves a bare object during the 5s window; the graph draws from t=0, the reveal gate only
governs ε₀/the sine label (S3+), never the base scene.

## Open exception flagged to quality_auditor
- **hand_crank (S6):** literal grab-and-drag on the 3D coil is NOT implemented (raycasted mesh-drag deferred —
  out of scope for this pass, and a real regression risk). The S6 "must move / must be interactive" requirement
  is met instead by (a) the live ω slider acting as the crank-speed control and (b) the idle auto-sweep (the
  coil always spins at the slider ω on the state clock). If founder review wants a true grab-crank gesture,
  escalate to `peter_parker:renderer_primitives` for a coil-drag handle — do not hand-roll it silently here.


---

# Pass 3 (2026-07-04) — founder Fable audit upgrade: mechanism beat + live machine

Founder asked for a full quality audit ("did it actually show HOW an AC generator works?"). Verdict: math core
+ slip-ring story correct, but the CAUSAL mechanism was missing and several authored hooks were dead in the
renderer. Everything below shipped in this pass; concept is now SEVEN states (renumber: old S3-S6 -> S4-S7).

## What changed
1. **NEW STATE_3 "Why an EMF? The field pushes the charges"** (mode `emf_mechanism`, omega slowed to 0.8):
   cyan v-arrows + purple F = qv x B arrows on the two axle-parallel sides (F length = REAL |sin theta| — dies
   face-on, peaks edge-on), grey "top/bottom: push ACROSS the wire, no drive" note. Q7 added (teaches_state
   STATE_3); coverage_map + entry_state_map + aha (now STATE_4) all shifted atomically.
2. **Circuit current beads** (`acg_curr`): 14 beads on the FULL world-space loop (coil -> ring rims -> arcs to
   fixed brushes -> wires -> bulb), speed+direction = sin(theta), dim at zero crossings (acgLoopPoint mirrors
   memLoopPoint). Listed in S1, S6, S7.
3. **The 3 authored scenario_cues are now CONSUMED**: flux_graph_start (S2, fallback 2500ms), emf_graph_start
   (S4, fallback 2000ms) gate the graph traces (axes-only before, trace FROM the cue instant); current_flip
   (S6, fallback 4000ms) fires a 1.6s brightness pulse on the external arrow (Rule 29: brightness, never size).
   Fallbacks sit strictly below the deriveStateMeta sampling pins.
4. **Split-ring contrast is now ANIMATED** (S6): the inset commutator rotates with theta; two fixed brush dots
   swap brightness at each zero crossing; the graph gains a dashed grey |sin| pulsating-DC trace beside the sine.
5. **theta angle arc** (`acg_theta_arc`, S2/S3/S4/S7): pre-tessellated circle swept via setDrawRange + live
   "theta = omega t" readout line (degrees).
6. **Rule 27 sliders**: panel rows built from `slider_controls` (no more hardcoded ranges) and every input emits
   PARAM_UPDATE (explorer_id `ac_generator_explorer`).
7. **B slider 3D feedback**: field-arrow opacity tracks live B.
8. **idle_autosweep consumed** (S7): omega self-sweeps 0.5<->3.0 until a trusted slider touch (PM_acgManual)
   seizes control. Founder decision 2026-07-04: **slider-crank only — grab-drag hand_crank DECLINED**, flag
   deleted from JSON (closes the pass-2 open exception).
9. **Dead flags removed**: show_normal_arrow / bulb / hand_crank (visibility is via visible_elements).
10. **misconception_watch pruned to 3 pivots** (2026-07-04 directive): flux-orientation (S2), phase-lag +
    steady-spin-AC (S4), slip-vs-split (S6). S1/S5 hooks deleted (metadata only, no re-voice needed).
11. **Metadata**: variable ranges now span max slider settings (emf +/-22.5 V, Phi +/-7.5 Wb).

## Verification
- `npx tsc --noEmit` 0 errors; `npm run validate:concepts` -> ac_generator PASS (no warnings).
- Re-seeded via `_seed_ac_generator_cache.ts`; `npm run visual:eyes -- ac_generator` -> **30/30 deterministic
  checks, 0 failed**; all 7 `__frozen.png` frames Read and physics-checked (readout numbers match NBA cos/sin).
- `smoke:visual-validator --dense`: vision categories BLOCKED on Anthropic API credit balance (known issue);
  all non-vision checks (H DOM/OCR placeholder scan) passed. Re-run the vision pass after credits top-up.
- TTS: 24 stale + 30 new clips re-voiced (66 total EN/HI/TE), 2 orphans pruned; review site rebuilt clean.
- deriveStateMeta: `emf_mechanism` sampling window 5500ms added.