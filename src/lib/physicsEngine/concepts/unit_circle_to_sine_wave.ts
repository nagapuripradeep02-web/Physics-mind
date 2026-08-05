// unit_circle_to_sine_wave — the FIRST MATHEMATICS concept
// (src/data/concepts/mathematics/, MATHEMATICS_BUILD_PLAN.md Phase 3).
//
// A point moves round a circle of radius 1; its signed height above the
// horizontal diameter is sin θ and its signed horizontal distance from the
// centre is cos θ. Laying those lengths out against the angle IS the sine and
// cosine wave. That correspondence, held continuously rather than sampled at
// five frozen positions, is the whole lesson.
//
// TS twin of computePhysics_unit_circle_to_sine_wave in
// parametric_renderer.ts — both implement the SAME formula contract, which is
// the explicit requirement of the scar
// parametric_computephysics_missing_silent_template_leak (CRITICAL/FIXED):
// "Standing up a NEW parametric-family concept is never data-only: it also
// needs computePhysics_<concept_id> in parametric_renderer.ts (+ dispatcher
// line) and the matching TS engine in src/lib/physicsEngine/concepts/
// registered in the ENGINES map. Implement both from the same formula
// contract."
//
// ── UNITS: theta / phi / phi_r are DEGREES ───────────────────────────────────
// Mathematics quantities are UNITLESS in the sense that matters to the
// mathematics_author role (they carry domains, not physical units) — but an
// ANGLE still needs a representation, and two renderer facts pick degrees:
//   1. drawCanvasSlider's caption formatter (parametric_renderer.ts:3068) prints
//      the RAW stored value with a suffix and hardcoded precision, and has no
//      unit-conversion field. A radian-valued theta would drag-caption as
//      "θ: 3.9" on the very states whose teaching beat is "park it at 210°".
//   2. drawAngleArc consumes degrees natively, so angle_value_expr is a bare
//      "theta" with no conversion anywhere.
// This is the fleet convention for angle-driven PCPL concepts, not a bespoke
// choice — cf. newton_second_law_direction's theta_F and resultant_direction's
// theta, both of which convert inline at each trig call exactly as below.
//
// ── phi / phi_r are NOT sliders, ever ────────────────────────────────────────
// They are choreography-only sweep parameters for the drawn curves (phi = the
// bright curve, phi_r = the dim recap). PM_choreoVarsAtTime merges a live
// slider value into EVERY historical sample of a locus_trace and stands the
// choreography down for a seized variable, so a trace parameterised on a
// slider variable collapses to a single point the instant a teacher drags it
// (engine_bug_queue: pcpl_locus_trace_sweep_parameter_exposed_as_a_slider_
// collapses_the_curve, CRITICAL). theta is the teacher-facing dial; phi/phi_r
// draw. Where a pen or carrier is on screen the two are held equal at every
// instant, so the correspondence the concept teaches is never drawn false.
//
// What the engine returns:
//   - variables: theta (the point's angle), phi, phi_r (sweep parameters) — all degrees
//   - derived:   sin_theta, cos_theta (the two taught quantities, signed) and
//                s (see below)
//   - forces / graph: [] — this concept's visuals are authored primitives, and
//     panel B is not a teacher-product render surface at all
//     (build_review_site.ts assembles panel A only).
//
// s does DOUBLE DUTY, and that is deliberate rather than a shortcut: it is the
// radian measure of theta AND the arc length travelled along the rim in
// radius-lengths. Those are the same number precisely because r === 1 (arc
// length = r·θ_rad), which is the identity STATE_2 exists to teach. It is also
// why the dual-unit HUD reads "θ = {s} rad ({theta}°)" — the RADIAN slot is s,
// never the raw theta variable, which holds degrees.
//
// r is not a variable: nothing in PCPL draws a circle at a live radius (body
// size is number-only, and there is no size_expr — engine_bug_queue:
// pcpl_no_primitive_draws_a_circle_or_arc_at_a_live_radius). r ≡ 1 throughout,
// which is definitional for the UNIT circle anyway; amplitude scaling belongs
// to graph_transformations (ranked-list P1 #1).

import type { ConceptPhysicsEngine, PhysicsResult } from '../types';

export const unitCircleToSineWaveEngine: ConceptPhysicsEngine = {
  default_variables: { theta: 0, phi: 0, phi_r: 0 },
  // Domains, not "pedagogically useful ranges": theta is drawn over a full
  // revolution; phi sweeps the same revolution and, in the periodicity state,
  // on to 515.662° (= 9.0 rad, the furthest the wave can run and stay inside
  // the 760px canvas at 46 px/rad). Mathematics quantities carry no physical
  // unit, but an angle's representation is load-bearing here, so 'deg' is
  // recorded — the ConceptPhysicsEngine contract requires the field, and
  // leaving it blank would invite a radian reading.
  variable_ranges: {
    theta: { min: 0, max: 360, step: 1, unit: 'deg' },
    phi: { min: 0, max: 515.662015617741, step: 1, unit: 'deg' },
    phi_r: { min: 0, max: 360, step: 1, unit: 'deg' },
  },
  compute(variables): PhysicsResult {
    // Defensive reads mirroring the renderer twin: the iframe-side function is
    // reached with whatever vars the choreography/slider merge produced, so a
    // missing or non-finite key must degrade to the authored default rather
    // than propagate NaN into every position_expr on the canvas.
    const theta = Number.isFinite(variables.theta) ? variables.theta : 0;
    const phi = Number.isFinite(variables.phi) ? variables.phi : 0;
    const phi_r = Number.isFinite(variables.phi_r) ? variables.phi_r : 0;

    const theta_rad = (theta * Math.PI) / 180;
    const sin_theta = Math.sin(theta_rad);
    const cos_theta = Math.cos(theta_rad);
    const s = theta_rad; // radian measure AND arc length, r ≡ 1 — see header

    return {
      concept_id: 'unit_circle_to_sine_wave',
      variables: { theta, phi, phi_r },
      derived: {
        sin_theta,
        cos_theta,
        s,
      },
      forces: [],
      graph: [],
      constraints_ok: true,
      warnings: [],
    };
  },
};
