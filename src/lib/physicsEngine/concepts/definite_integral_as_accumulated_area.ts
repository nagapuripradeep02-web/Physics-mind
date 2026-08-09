// definite_integral_as_accumulated_area — THIRD mathematics concept
// (src/data/concepts/mathematics/, MATHEMATICS_BUILD_PLAN.md Phase 2.5), and
// the chapter's most demanding concept — the sole driver of the cartesian_
// plane engine's region_fill / riemann_bars / locus_trace accumulation family
// (docs/skeletons/definite_integral_as_accumulated_area_skeleton.md).
//
// f(x) = x^2 - c on the drawn interval [0, b]. Eight states walk: the region,
// four left rectangles, refinement toward n = 1000 (the PRIMARY aha), the
// limit (the left-sum gap has its own exact formula, 4/n - 4/(3n^2), founder-
// ratified F2), the sign convention below the axis, the independence of the
// sampling rule (left/right/midpoint), the accumulation function A(x) = x^3/3
// (the FTC seed), and a free explore.
//
// TS twin of computePhysics_definite_integral_as_accumulated_area in
// parametric_renderer.ts — both implement the SAME contract, per the scar
// parametric_computephysics_missing_silent_template_leak (CRITICAL/FIXED):
// "Standing up a NEW parametric-family concept is never data-only: it also
// needs computePhysics_<concept_id> in parametric_renderer.ts (+ dispatcher
// line) and the matching TS engine in src/lib/physicsEngine/concepts/,
// registered in the ENGINES map. Implement both from the same formula
// contract."
//
// ── derived: ONLY the closed forms the geometry cannot produce (A6) ────────
// riemann_bars computes AND PUBLISHES its own sum (sum_var -> PM_riemannPublish,
// parametric_renderer.ts) once, inside the loop that places the rectangles —
// this engine must NEVER duplicate that computation. What this engine DOES
// own: 'exact' (the definite integral I(b,c) = b^3/3 - c*b — S3 first, as
// 'exact'; S4-S8 under the granted integral symbol, FLAG 1), 'A_beta' (the
// accumulation function A(beta,c) = beta^3/3 - c*beta — STATE_7 only), and
// (F7) 'area_total' / 'area_below' (the unsigned total and the below-axis
// subtotal — STATE_5's sign-convention confrontation, M2).
//
// ── UNITS: every variable is 'dimensionless' ────────────────────────────────
// b/c/beta are the interval bound, the vertical-lowering parameter and the
// accumulation sweep parameter — none carries a physical unit.

import type { ConceptPhysicsEngine, PhysicsResult } from '../types';

export const definiteIntegralAsAccumulatedAreaEngine: ConceptPhysicsEngine = {
  default_variables: { b: 2.0, c: 0, beta: 0 },
  variable_ranges: {
    b:    { min: 0.2, max: 2.0, step: 0.01, unit: 'dimensionless' },
    c:    { min: 0, max: 1, step: 0.1, unit: 'dimensionless' },
    beta: { min: 0, max: 2.0, step: 0.01, unit: 'dimensionless' },
  },
  compute(variables): PhysicsResult {
    // Defensive reads mirroring the renderer twin: reached with whatever vars
    // the choreography/drag merge produced, so a missing or non-finite key
    // degrades to the authored default rather than propagating NaN into
    // every text_expr on the canvas.
    const b    = Number.isFinite(variables.b)    ? variables.b    : 2.0;
    const c    = Number.isFinite(variables.c)    ? variables.c    : 0;
    const beta = Number.isFinite(variables.beta) ? variables.beta : 0;

    const exact = Math.pow(b, 3) / 3 - c * b;
    const aBeta = Math.pow(beta, 3) / 3 - c * beta;

    // area_below (F7): I(min(b, sqrt(c)), c) — the below-axis piece. The
    // 0.00005 clamp (engine-bug-queue: hud_prints_negative_zero_on_a_value_
    // only_instrument) guards the exact-zero-at-c=0 case from a signed-float
    // '-0.0000' print — verbatim to the renderer twin.
    const crossX = Math.min(b, Math.sqrt(c > 0 ? c : 0));
    const areaBelowRaw = Math.pow(crossX, 3) / 3 - c * crossX;
    const areaBelow = Math.abs(areaBelowRaw) < 0.00005 ? 0 : areaBelowRaw;
    const areaTotal = exact - 2 * areaBelow;

    return {
      concept_id: 'definite_integral_as_accumulated_area',
      variables: { b, c, beta },
      derived: { exact, A_beta: aBeta, area_total: areaTotal, area_below: areaBelow },
      forces: [],
      graph: [],
      constraints_ok: true,
      warnings: [],
    };
  },
};
