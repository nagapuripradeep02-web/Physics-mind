# Pass-2 four-question lens — scalar_vs_vector

Renderer family: **mechanics_2d / PCPL** (`renderer_pair.panel_a = "mechanics_2d"`, routed via
`PCPL_CONCEPTS` to `parametric_renderer.ts`'s `assembleParametricHtml`/`PARAMETRIC_RENDERER_CODE`).
This is NOT field_3d and NOT particle_field — Q3 motion below is authored via `scene_composition`
primitives' `appear_at_ms` / `disappear_at_ms` / `animate_in_ms` / `animation.type` fields (the vocabulary
this renderer family actually implements), never `field_3d_config` blocks. No `pause_after_ms`, no
`wait_for_answer`, no predict-pause anywhere (Rule 31 — new concept).

**ENGINE BLOCKER — read before judging any state's "live" status:** `parametric_renderer.ts` has NO
`computePhysics_scalar_vs_vector` entry in its `computePhysics()` dispatcher yet. Until
`peter_parker:renderer_primitives` adds one (see this concept's authoring report), `PM_physics` stays
`null` for this concept and `draw()`'s `if (!PM_physics)` guard makes the ENTIRE canvas show only
"Unknown concept: scalar_vs_vector" — nothing below renders at all. Every state's design is written
assuming that one-function fix lands; nothing else blocks States 1–3 once it does.

---

## STATE_1 — Same number, many endings

1. **Not known yet:** that a single magnitude ("5 km," like a signpost) says nothing at all about where
   you end up — direction is a completely separate, unstated piece of information.
2. **Feel the confusion/surprise:** the hook vector visits two literally opposite headings (90°/lake,
   270°/woods) off the SAME signpost number, back to back, with no formula shown yet — the student watches
   one number produce two contradictory pictures before any resolution.
3. **Moves/appears:** `hook_vector_A` (600–3200ms) then `hook_vector_B` (3600ms+) — two discrete
   `force_arrow` reveals via `appear_at_ms`/`animate_in_ms`/`disappear_at_ms` (a real, engine-native
   staggered swap). **Placeholder note:** the physics-author's spec asked for a CONTINUOUS φ_hook sweep
   0°→270° with the endpoint tracing a circle — that is NOT implementable (no primitive/mechanism ties a
   vector's direction to elapsed time absent a slider; confirmed by reading `PM_interpolate`/
   `PM_safeEval`, which only see `PM_physics.variables`/`.derived`, never a clock). Authored as two static
   antipodal flash-holds instead — the pedagogical shape (same number, opposite headings) survives; the
   continuous sweep and the circle-trace do not.
4. **Eye goes:** `focal_primitive_id = "hook_vector_B"` — the final antipodal (270°) pose, which
   deliberately echoes S4's θ=180° extreme.

## STATE_2 — Spin it, nothing changes

1. **Not known yet:** that a scalar reading is blind to orientation — nothing you do to the *pointer* can
   move the *number*.
2. **Feel the confusion/surprise:** the reading (`m = 8 kg`) sits static and correct from t=0 while a
   decorative pointer (ψ) sits at a fixed, deliberately-not-cardinal angle right next to it, captioned
   "any angle" — the visual claims "this could point anywhere" even though it cannot actually animate.
3. **Moves/appears:** nothing is time-staged in this state (no `appear_at_ms` used at all) — correct by
   design, since "steady/never changes" needs no reveal choreography. **Placeholder note:** ψ_pointer was
   specified to "spin continuously" — genuinely unsupported (no continuous-rotation animation type exists
   in `animation_vocabulary.ts`'s whitelist: `fade_in/slide_horizontal/slide_when_kinetic/free_fall/
   pendulum/atwood/door_swing/translate` — `pendulum` oscillates bounded, none spins unbounded). Authored
   as a single fixed non-cardinal angle instead; the "regardless of how it's turned" claim is asserted by
   the caption text, not demonstrated by motion.
4. **Eye goes:** `focal_primitive_id = "reading"` — the boxed `m = 8 kg` readout, co-located with the
   steady badge.

## STATE_3 — Three plus four equals five (PRIMARY aha)

1. **Not known yet:** that "3 and 4" answers TWO different questions with TWO different correct totals,
   depending on whether the thing being added has a direction.
2. **Feel the confusion/surprise:** the ghost card "3 + 4 = 7 km?" is put ON SCREEN, against the actually-
   walked bent path, for 700ms BEFORE being struck down and replaced by the real answer — the wrong
   expectation is stated visually, not just narrated, then visibly corrected.
3. **Moves/appears:** two-phase real choreography on the state clock — Phase A: `bag_3kg`/`reading_3`
   (400ms) → `bag_4kg`/`reading_7` swap (2200ms); Phase B: `hiker_leg1` walks leg a via
   `animation:{type:"translate",...}` (3400–4400ms, a REAL engine-native one-shot slide, not a placeholder)
   → turn-hold → `hiker_leg2` (a body-swap at the exact settle pixel, appearing/disappearing in the same
   frame so the handoff is seamless) walks leg b (4800–5800ms) → `ghost_card` (5900ms) →
   `verdict_line`/`resultant_chord`/`derivation_box` land together (6600ms). The `resultant_chord`
   `force_arrow` genuinely SELF-DRAWS (grows tip-outward) via its native `animate_in_ms` alpha-scaled
   length — this is a real engine capability, not a placeholder. All geometry this state uses is LITERAL
   (a=3, b=4, θ=90 hardcoded pixel numbers, matching the state's own `variable_overrides`), so once the
   dispatcher exists this state needs no further engine work at all.
4. **Eye goes:** `focal_primitive_id = "resultant_chord"` — pulses continuously afterward via the native
   `PM_focalPulseScale` glow (satisfies the spec's "tail: chord holds with a gentle glow-pulse" exactly).

## STATE_4 — The angle sets the sum

1. **Not known yet:** that BOTH conditions (magnitude+direction, AND triangle-law addition) are required —
   a quantity can satisfy the first and still fail the second.
2. **Feel the confusion/surprise:** the pinned "3 + 4 = 7, always" card sits motionless beside the live
   `|R|` readout, which visibly glides 7→5→1→5→7 as θ is dragged — the contrast is co-present on screen,
   every frame, not sequential.
3. **Moves/appears:** dragging the `theta` slider live-updates `leg_b`'s `direction_deg_expr`, the
   `theta_arc`'s `to_deg_expr`, and `resultant_chord`'s `magnitude_expr`/`direction_deg_expr` (all bare
   variable / computed-output references) — genuinely LIVE once the dispatcher exists, because `a` and `b`
   are FIXED in this state (`variable_overrides: {a:3,b:4}`), so the vertex `turn_marker` legitimately
   never needs to move here. **Placeholder note:** the spec's opening "continuity ease θ 90°→0° over
   800ms" and the subsequent "auto-ramps as a ping-pong triangle wave... teacher-seizable via trusted
   drag" are NOT implementable — `parametric_renderer.ts` has no mechanism to auto-drive a physics
   variable on the state clock with trusted-drag seizure (the field_3d/particle_field pattern referenced
   in Rule 31 does not exist in this renderer family). The state opens static at θ=90° (continuing S3's
   value) and only moves when the teacher manually drags the slider — the auto-sweep simply does not play.
4. **Eye goes:** `focal_primitive_id = "resultant_chord"`.

## STATE_5 — All yours (explore, `interaction_complete`)

1. **Not known yet:** N/A — explore state, all three ideas (many-endings, scalar-invariance, angle-sets-
   the-sum) were taught S1–S4; this is the sandbox to re-verify all three at once.
2. **Feel the confusion/surprise:** N/A (explore state).
3. **Moves/appears:** `leg_a_live` and `resultant_chord_live` are BOTH genuinely live (both anchored at
   the fixed `trailhead_marker`, so no anchor-chaining is needed) — dragging `a`, `b`, or `theta` updates
   both in real time once the dispatcher exists. **Placeholder note (the one MUST-FIX-BEFORE-SHIP item):**
   `leg_b_static` and `theta_arc_static` are pinned at the S3-default (a=3) pixel position and do NOT
   track the `a` slider — no primitive in this renderer supports an origin/vertex bound to another
   primitive's live-computed endpoint (`vector.from` / `force_arrow.origin_body_id` / `angle_arc.center`
   all require a literal point or an anchor to an already-*positioned* body, never an expr). Dragging `a`
   away from 3 will visibly detach `leg_b_static`'s tail from `leg_a_live`'s new tip. This is flagged with
   its own escalation note below — quality_auditor should treat it as a required fix before this state
   ships to a real classroom, not a cosmetic nice-to-have.
4. **Eye/hand goes:** `focal_primitive_id = "live_formula"` — the `R⃗ = a⃗ + b⃗` formula surface, co-located
   with the live numeric readout beneath it.

---

## Cut-line / discipline self-checks

- **Renderer-family note honored:** PCPL/parametric_renderer — Q3 motion lives entirely in
  `scene_composition` primitive fields (`appear_at_ms`/`disappear_at_ms`/`animate_in_ms`/`animation.type`),
  never `field_3d_config`. No `pause_after_ms` anywhere (Rule 31 — new concept, nothing legacy to carry).
- **Straightforward + per-state contextual controls (Rule 31):** S1/S2/S3 show zero sliders (watch-this
  beats); S4 shows only `theta_slider`; S5 (explore) shows all three (`a_slider`, `b_slider`,
  `theta_slider`). This renderer family rebuilds `scene_composition` fresh per state (confirmed by reading
  `draw()`), so "per-state contextual controls" is satisfied simply by each state's own primitive list —
  there is no persistent cross-state panel to build-once/show-hide in this renderer family (unlike
  field_3d/particle_field).
- **No two states alike in motion:** S1 (two-pose antipodal flash-swap), S2 (static/steady — deliberately
  zero motion, the point being made IS "nothing moves"), S3 (two-phase: discrete mass-reading swap, then a
  translate-driven two-leg walk with a genuine self-drawing resultant), S4 (slider-driven live geometry,
  static open pose), S5 (three-slider live sandbox, one static preview leg) — five distinct pictures, no
  archetype repeat.
- **Gesture-mirror primitive:** N/A — no RHR/cross-product/3D content in this concept (confirmed by
  physics-author's spec: "RHR: N/A").
- **Plain English / Gate 5:** no `n_hat`, `F_vec`, `\hat{`, `\vec{` anywhere in `epic_l_path` (validator's
  Gate 5 forbidden-token check passed cleanly). `mode_overrides` omitted entirely (conceptual-only
  directive, Rule 20).
- **Numerical self-check (physics_author's verified case, reproduced in S3's literal pixel geometry and
  S4/S5's live formulas):** a=3, b=4, θ=90° → R=5.0 km exactly (`sqrt(3²+4²)=5`); θ=0°→R=7.0; θ=180°→R=1.0
  — confirmed by direct `node` computation before authoring (`Math.sqrt`/`Math.atan2` match the JSON's
  `computed_outputs` formula strings exactly, modulo the documented `theta*PI/180` vs `radians()`
  distinction — see the authoring report's engine-findings section).
