# Pass-2 four-question lens — resultant_direction

Renderer family: **PCPL / parametric_renderer.ts** (2D p5.js, pure JSON pixel coordinates — the live Class
11 Vectors chapter engine, third concept in the DAG after `scalar_vs_vector` → `vector_addition_law`).
Rule 31 concept — no `pause_after_ms`, no `wait_for_answer`, no predict-pause. Q3 motion is authored via
`scene_composition` primitives' own timing fields (`appear_at_ms`/`disappear_at_ms`/`animate_in_ms`) and
`variable_choreography` entries evaluated against `PM_simClockMs` (Rule 36) — this IS the correct
mechanism for this renderer family (unlike particle_field/field_3d, PCPL's `scene_composition` is fully
rendered, not documentation metadata).

**Two engine-reality corrections made during authoring** (both discovered by reading the actual renderer
source, not assumed from the physics block):

1. **`angle_arc` primitives are never timing-gated** — `drawAngleArc()` never calls `PM_animationGate`, so
   `appear_at_ms`/`disappear_at_ms` on an `angle_arc` are silently ignored; the arc is either always drawn
   (when `to_deg`/`to_deg_expr` differ from `from_deg`) or degenerate-invisible (when they don't, UNLESS a
   `label` is also set, which forces the label to draw even on a zero-width arc). STATE_1's α arc is made
   correctly time-gated by binding `to_deg_expr` to the SAME `probe_heading_deg` choreography variable
   that drives the sweeping ghost arrow (both grow from 0° together and lock at the same instant — no
   label on the arc itself, so it stays truly invisible pre-sweep). STATE_3 abandons trying to gate the
   true α arc's reveal at all — since R (and its α arc) persist continuously from STATE_1/S2 (Rule 32d
   home-pose continuity), the "reveal" beat is carried entirely by the wrong-ghost arrow (which DOES
   support timing gates, since it's a `force_arrow`) appearing/disappearing around the always-present
   correct answer, plus the tracer's `locus_trace` animation and a `formula_box` HUD (`appear_at_ms`
   respected) confirming the number at the end.
2. **`variable_choreography` supports only ONE effective entry per variable per state** —
   `PM_applyChoreography()` iterates the whole array and unconditionally overwrites
   `PM_choreoValues[variable]` for every entry targeting that variable each frame, so a SECOND entry for
   the same variable doesn't "hand off" from the first — it just always wins. This blocks the physics
   block's literal STATE_4 plan (`b`: 4→3-hold, THEN a separate 3→6→1→3 ping-pong) and STATE_5's plan
   (`theta`: static-at-60 first 700ms, THEN a 0→180 sweep) — both implicitly needed two sequential phases.
   Fixed by choosing a single choreography spec per variable whose `from` value EQUALS the state's true
   global default (so there's zero visible discontinuity at state entry — Rule 32d): STATE_4 uses
   `ping_pong(from:4, to:1, hold@3)` (opens exactly at b=4, autoplay covers the belief-earning hold AND the
   "hug A" direction; the "peel toward B" direction is available live via the always-seizable `b` slider —
   any real drag seizes regardless of the `seizable` flag's value, confirmed by reading `drawCanvasSlider`).
   STATE_5 uses `once(from:60, to:180, holds@90/138.59/180)` (opens exactly at θ=60, the home pose; covers
   3 of 4 landmarks automatically, θ=0 is one live slider-drag away). Both are documented deviations from
   the physics block's literal numbers, preserving every stated pedagogical beat while being physically
   achievable on this renderer.

Re-entry rule check: every guided state opens with the SAME start marker (200,380), SAME A arrow (amber,
0°), SAME scale (30 px/km) — recognizable within the first frame, before any state-specific reveal.

---

## STATE_1 — Which Way?

1. **Not known yet:** that "6 km" alone gives no flight plan — a drone/tugboat needs a BEARING, and that
   bearing (α) is not yet defined as any number at all.
2. **Feel the confusion/surprise:** the sweeping ghost arrow visibly SEARCHES (probe heading ramps 0° →
   34.7° over 1.8s) before it locks — the student watches the search happen, not a static answer appear;
   no prediction question, the motion itself is the "which way?" beat.
3. **Moves/appears:** the ghost arrow + its bound α arc sweep together (both driven by the same
   `probe_heading_deg` choreography variable), then swap identity in place (ghost→green R, a color/identity
   swap at IDENTICAL geometry, not a fake positional carry) at the lock instant; the α HUD appears only
   after lock (`appear_at_ms: 2900`).
4. **Eye goes:** the sweeping ghost, then the locked R — `focal_primitive_id: resultant_R_s1`.

## STATE_2 — Drop One Perpendicular

1. **Not known yet:** that B can be rebuilt from two pieces — one running along A's own direction, one
   crossing it — and which piece gets which trig function.
2. **Feel the confusion/surprise:** N/A — straightforward construction beat (no misconception pivot here;
   S3 and S4 carry the two genuine pivots per the founder guardrail). The construction itself, built piece
   by piece (shadow draws first, then riser), is the content.
3. **Moves/appears:** the shadow arrow draws first (`appear_at_ms:1000`), THEN the riser arrow
   (`appear_at_ms:1800`) — cause-before-effect ordering even within a pure construction (the along piece
   must exist before the across piece can be seen "rising off" it); numeric readouts for each follow their
   own arrow's completion.
4. **Eye goes:** the riser (the newer, less obvious piece) — `focal_primitive_id: riser_arrow_s2`.

## STATE_3 — Read Off the Tangent (PRIMARY aha)

1. **Not known yet:** that the denominator of tan α is the WHOLE base (A + B cos θ), not A alone — the
   single most common JEE grading error on this topic.
2. **Feel the confusion/surprise:** the wrong-belief consequence plays FIRST and is held for a readable
   1.4s (49.1° ghost arrow, visibly NOT matching the already-present correct R at 34.7°) before the tracer
   proves the real construction — contrast beat, no predict-pause, per Rule 16a.
3. **Moves/appears:** the wrong ghost arrow appears/disappears on its own schedule (600–2000ms); the
   tracer (`locus_trace`) then runs the FULL base (200→350ms hits x=350 at t≈3100) and climbs the riser
   (→ y=276 at t≈4000), with two annotations ("A + B cos θ", the whole-base emphasis) fading in as the
   tracer crosses that ground.
4. **Eye goes:** the tracer bead, landing on the always-present R — `focal_primitive_id: alpha_arc_true`.
   `aha_moment.state_id: STATE_3`, inside `entry_state_map.foundational` (STATE_1→STATE_3) — no exit-pill
   needed. `misconception_watch` fires here (denominator-is-A-only belief).

## STATE_4 — R Leans Toward the Bigger

1. **Not known yet:** that R bisects θ only in the A=B accident — the general rule is "leans toward the
   bigger vector," which most students have never seen contradicted (every textbook diagram uses equal
   arrows).
2. **Feel the confusion/surprise:** the belief is EARNED first (b eases from the global default 4 down to
   3=a, R visibly lands exactly on the static 30° bisector ghost, held 900ms) before the ping-pong sweep
   (3↔1, passing back through the hold) breaks it live — Rule 16a contrast, belief confirmed then broken
   in motion.
3. **Moves/appears:** ONLY `b` moves (θ, a pinned per Rule 32b); the bisector ghost never moves (static
   reference); R and the α arc + HUD track `b` continuously and live (also seizable by a real slider drag
   at any time, reaching the b=6 "peel toward B" case the autoplay doesn't cover).
4. **Eye goes:** the R arrow itself, swinging — `focal_primitive_id: resultant_R4`. `misconception_watch`
   fires here (bisector-always belief).

## STATE_5 — Alpha Chases Theta

1. **Not known yet:** the θ-dependence landmarks — α always trails θ (never leads), the θ=90° collapse to
   tan α = B/A, the base=0 condition (R exactly ⊥ A), and the 180° direction flip.
2. **Feel the confusion/surprise:** N/A — straightforward sweep-and-land beat (no misconception pivot;
   S3/S4 already spent that register). The surprise register here is purely observational: watching α
   visibly fail to keep pace with θ.
3. **Moves/appears:** ONLY `θ` moves (a, b pinned); the α arc + formula surface (a live ternary that
   VISIBLY COLLAPSES to "tan α = B/A" at the θ=90° hold) track continuously; three scripted holds
   (90°/138.59°/180°) dramatize the landmarks the assessment questions test.
4. **Eye goes:** the α arc, visibly lagging the θ arc — `focal_primitive_id: alpha_arc_live`.
   `has_prebuilt_deep_dive` here (edge-case cluster family: perpendicular-to-A, 180° flip, max-lean).

## STATE_6 — All Yours

1. **Not known yet:** N/A — the open explorer; every prior state's claim is re-verifiable live.
2. **Feel the confusion/surprise:** N/A (explore state).
3. **Moves/appears:** all three sliders (a, b, θ) live simultaneously; R, both ghost decomposition arrows,
   the α arc, and the `tan α` HUD all recompute every frame off whichever dial is dragged; continuous-run
   per Rule 37 (the review player never auto-freezes an `interaction_complete` state).
4. **Eye/hand goes:** the live α/tan α readout — `focal_primitive_id: live_readout_S6`.

---

## Cut-line / discipline self-checks

- **Renderer-family note honored:** PCPL/parametric_renderer, `scene_composition` IS the rendered scene
  (not documentation metadata like particle_field/field_3d) — Q3 motion lives directly in
  `appear_at_ms`/`disappear_at_ms`/`animate_in_ms`/`variable_choreography`, read by `PM_animationGate()` /
  `PM_applyChoreography()` / `PM_choreoValue()`. No `pause_after_ms` anywhere in `teacher_script` (Rule 31
  — new concept, nothing to carry forward; the parent `vector_addition_law` is also Rule-31-native).
- **PCPL has no `radians()` helper** — every angle conversion in `physics_engine_config` and the pasted
  `computePhysics_resultant_direction` uses `theta * PI / 180` / `theta * Math.PI / 180`, verified against
  `PM_buildEvalScope()`'s literal math whitelist (no `radians` entry).
- **No fake carries** — the only apparent "disappear+appear pair" (STATE_1's ghost→R swap) is an explicitly
  justified color-identity swap at IDENTICAL geometry (same origin, same final angle, same length,
  confirmed by binding both to the same choreography value at the swap instant) — not a positional carry,
  the fake-carry ban doesn't apply per the architect's own bug-queue note.
- **No two states alike in motion:** S1 (rotate/flip sweep-and-lock), S2 (reveal-build construction), S3
  (flow-along-path tracer + contrast-beat wrong ghost), S4 (oscillate/track ping-pong), S5 (cycle-compare
  θ-sweep with landmark holds), S6 (drag-sandbox) — six declared, distinct archetypes, no repeat except the
  reserved drag-sandbox on the explore state.
- **Gesture-mirror primitive:** N/A — planar 2D concept, no cross products, no RHR gesture anywhere
  (declared, not omitted, per the skeleton's Definition-of-Done §10c).
- **Plain English / Gate 5:** no `n_hat`, `F_vec`, `\hat{`, `\vec{` anywhere — confirmed clean by
  `npm run validate:concepts` (zero Gate 5 findings for this file).
- **Unicode / Gate 34c:** all on-canvas `text`/`label`/`equation`/`equation_expr` fields use real Unicode
  (α, θ, °, ÷, →, ∠) — an initial draft used ASCII "alpha"/"theta"/"deg" and was corrected before handoff;
  `tts_sentences.text_en` correctly keeps the SPOKEN words ("alpha", "theta") per Rule 30's
  never-a-bare-letter convention, since narration and on-canvas text are different channels.
- **Numerical self-check (physics_author's verified case, home a=3, b=4, θ=60°):** shadow=2.000,
  riser=3.4641, base=5.000, α=34.715°, R=6.0828 km, wrong-ghost=49.107° — all match the physics block
  exactly. S4 bisector: b=3=a → α=30.000°=θ/2 exactly; b=6 → α=40.893°; b=1 → α=13.898°. S5 landmarks:
  θ=90° → tan α=4/3≈1.333, α≈53.130°; θ≈138.590° → base=0, α=90.000° exactly, R=riser≈2.646 km; θ=180° →
  R=|a−b|=1.0 km, α≈180°. All verified against the assessment's q3/q5/q6 keyed answers.
