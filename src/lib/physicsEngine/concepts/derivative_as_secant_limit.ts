// derivative_as_secant_limit — SECOND MATHEMATICS concept
// (src/data/concepts/mathematics/, MATHEMATICS_BUILD_PLAN.md Phase 3), and the
// first to ride the cartesian_plane / secant_line / tangent_line family
// (CP-A...CP-D, docs/MATHEMATICS_PHASE0_CARTESIAN_PLANE.md).
//
// f(x) = x^2/2. A chord through P(x0, f(x0)) and a second point a gap h away
// has slope x0 + h/2; the derivative at x0 is defined as the limit of that
// chord slope as h -> 0, which for this parent curve is exactly x0. Nine
// states walk: the apparatus, the chord, the shrink, the h=0 exclusion, the
// tangent, point-dependence, the algebra, the derivative-as-a-function, and a
// free explore.
//
// TS twin of computePhysics_derivative_as_secant_limit in
// parametric_renderer.ts — both implement the SAME (deliberately trivial)
// contract, per the scar parametric_computephysics_missing_silent_template_
// leak (CRITICAL/FIXED), the same requirement unit_circle_to_sine_wave's
// twin states: "Standing up a NEW parametric-family concept is never
// data-only: it also needs computePhysics_<concept_id> in
// parametric_renderer.ts (+ dispatcher line) and the matching TS engine in
// src/lib/physicsEngine/concepts/ registered in the ENGINES map. Implement
// both from the same formula contract."
//
// ── derived: {} is DELIBERATE, not an omission ──────────────────────────────
// Per the mathematics_author's binding constraint (derivative_as_secant_
// limit_mathematics_block.md, engine_config.constraints #2/#3 and the
// ladder-semantics note in the architect skeleton's Definition-of-Done §10b):
// the chord slope (x0 + h/2) and the tangent slope (x0) are each computed
// EXACTLY ONCE — inside the renderer's own PM_secantLineCompute /
// PM_tangentLineCompute at draw time, off the SAME variables this engine
// returns. A derived chord_slope/tangent_slope key here would be a SECOND
// live implementation of the same number: the exact "slider reads one value,
// HUD reads a stale one" defect class the fleet's "one quantity, one
// readout" doctrine exists to prevent. Every label that needs a live number
// (x0, xq, hlog, hz, u, xdraw) reads it straight out of `variables` below and
// formats it inline (e.g. `{x0.toFixed(4)}`); no label anywhere renders the
// CHORD slope — that is the narrowed h=0 safety constraint (P1-2) the whole
// concept is built around.
//
// ── UNITS: every variable is 'dimensionless' ────────────────────────────────
// x0/xq are curve-domain x-coordinates, hlog/hz are choreography-only log/
// collapse factors NEVER rendered and NEVER sliders, u is the phi-law sweep
// parameter for STATE_8's f' trace (also never a slider, never drag-bound —
// both Gate 9(d) FATAL doors pass by construction, per the skeleton's own
// engine-fit table), and xdraw is STATE_1's curve-reveal bound. None carries
// a physical unit; ConceptPhysicsEngine.variable_ranges still requires the
// field, so 'dimensionless' is recorded rather than left blank.

import type { ConceptPhysicsEngine, PhysicsResult } from '../types';

export const derivativeAsSecantLimitEngine: ConceptPhysicsEngine = {
  default_variables: { x0: 1, xq: 1.9, hlog: 0, hz: 1, u: -1.6, xdraw: -2.1 },
  variable_ranges: {
    x0:    { min: -1.6, max: 1.6, step: 0.01, unit: 'dimensionless' },
    xq:    { min: -1.9, max: 2.0, step: 0.01, unit: 'dimensionless' },
    hlog:  { min: -3, max: 0, step: 0.001, unit: 'dimensionless' },
    hz:    { min: 0, max: 1, step: 0.001, unit: 'dimensionless' },
    u:     { min: -1.6, max: 1.6, step: 0.01, unit: 'dimensionless' },
    xdraw: { min: -2.1, max: 2.1, step: 0.01, unit: 'dimensionless' },
  },
  compute(variables): PhysicsResult {
    // Defensive reads mirroring the renderer twin: reached with whatever vars
    // the choreography/drag merge produced, so a missing or non-finite key
    // degrades to the authored default rather than propagating NaN into
    // every position_expr / *_expr on the canvas.
    const x0    = Number.isFinite(variables.x0)    ? variables.x0    : 1;
    const xq    = Number.isFinite(variables.xq)    ? variables.xq    : 1.9;
    const hlog  = Number.isFinite(variables.hlog)  ? variables.hlog  : 0;
    const hz    = Number.isFinite(variables.hz)    ? variables.hz    : 1;
    const u     = Number.isFinite(variables.u)     ? variables.u     : -1.6;
    const xdraw = Number.isFinite(variables.xdraw) ? variables.xdraw : -2.1;

    return {
      concept_id: 'derivative_as_secant_limit',
      variables: { x0, xq, hlog, hz, u, xdraw },
      derived: {},
      forces: [],
      graph: [],
      constraints_ok: true,
      warnings: [],
    };
  },
};
