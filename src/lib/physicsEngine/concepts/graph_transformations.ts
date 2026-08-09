// graph_transformations — the SECOND mathematics concept
// (src/data/concepts/mathematics/, MATHEMATICS_BUILD_PLAN.md Phase 3) and the
// FIRST consumer of the cartesian_plane / function_plot / plot_point primitive
// family (Phase 0, PRs #36-#40).
//
// Four numbers reshape any graph: y = a·f(b(x − h)) + k, demonstrated on the
// parent f(x) = sin x. k and a act OUTSIDE the function, on y, in the direction
// their sign says; h and b act INSIDE the function, on x, in the OPPOSITE
// direction of the naive reading. That inside/outside asymmetry is the whole
// lesson (STATE_6, the primary aha).
//
// TS twin of computePhysics_graph_transformations in parametric_renderer.ts —
// both implement the SAME formula contract, which is the explicit requirement
// of the scar parametric_computephysics_missing_silent_template_leak
// (CRITICAL/FIXED): "Standing up a NEW parametric-family concept is never
// data-only: it also needs computePhysics_<concept_id> in
// parametric_renderer.ts (+ dispatcher line) and the matching TS engine in
// src/lib/physicsEngine/concepts/ registered in the ENGINES map. Implement
// both from the same formula contract."
//
// ── UNITLESS ─────────────────────────────────────────────────────────────
// a (vertical stretch), b (horizontal stretch/compress factor, compresses the
// input BEFORE sin acts), h (horizontal shift), k (vertical shift) are all
// unitless mathematics quantities — they carry domains, not physical units.
//
// ── xdraw / hg are NOT sliders, ever ────────────────────────────────────
// xdraw is STATE_1's draw-in edge (the parent curve draws itself left to
// right); hg is STATE_3's WRONG-guess sweep offset (sin(x + hg), the believed
// "minus means left" misconception drawn and then confronted). Both are
// choreography-only sweep parameters, never authored as slider variables —
// the same φ-law discipline as unit_circle_to_sine_wave's phi/phi_r, though
// this concept authors zero locus_trace primitives so the φ-law's collision
// gate does not literally apply (function_plot samples the x-DOMAIN every
// frame against live vars, D3 — a structurally different mechanism from
// locus_trace's time-swept historical resampling).
//
// ── b never reaches zero ─────────────────────────────────────────────────
// The slider floor is b >= 0.5 everywhere (S5 narrows it further to >= 1.0),
// strictly > 0 by construction, so b(x-h) never degenerates into a constant
// and P' = (pi/2/b + h, a+k) is always finite. Defended again here with a
// defensive floor (never actually reached given the authored ranges) so a
// malformed vars object can't divide by zero.
//
// What the engine returns:
//   - variables: a, b, h, k (the four taught parameters) + xdraw, hg
//     (choreography-only sweep drivers)
//   - derived: p_prime_x, p_prime_y (the image of the parent's peak
//     P = (pi/2, 1) under the full transform) and bracket_width (S5's
//     2*pi/b period-bracket span) — published for parity with the JSON's own
//     physics_engine_config.computed_outputs, even though every consuming
//     primitive (function_plot, plot_point, the S5 vector) re-derives the
//     same values inline via its own x_expr/y_expr/from_expr/to_expr rather
//     than reading these derived fields — PCPL's cartesian_plane family
//     samples live variables directly, unlike a body/vector whose
//     magnitude_expr might read a derived field.
//   - forces / graph: [] — this concept's visuals are authored primitives,
//     and panel B is not a teacher-product render surface at all
//     (build_review_site.ts assembles panel A only, panel_b: "none").

import type { ConceptPhysicsEngine, PhysicsResult } from '../types';

export const graphTransformationsEngine: ConceptPhysicsEngine = {
  default_variables: { a: 1, b: 1, h: 0, k: 0, xdraw: -6.5, hg: 0 },
  variable_ranges: {
    a: { min: -2, max: 2, step: 0.5, unit: '' },
    b: { min: 0.5, max: 3, step: 0.5, unit: '' },
    h: { min: -2, max: 2, step: 0.5, unit: '' },
    k: { min: -1.5, max: 1.5, step: 0.5, unit: '' },
    xdraw: { min: -6.5, max: 6.5, step: 0.1, unit: '' },
    hg: { min: 0, max: 2, step: 0.1, unit: '' },
  },
  compute(variables): PhysicsResult {
    // Defensive reads mirroring the renderer twin: the iframe-side function is
    // reached with whatever vars the choreography/slider merge produced, so a
    // missing or non-finite key must degrade to the authored default rather
    // than propagate NaN into every function_plot / plot_point on the canvas.
    const a = Number.isFinite(variables.a) ? variables.a : 1;
    const b = Number.isFinite(variables.b) && variables.b !== 0 ? variables.b : 1;
    const h = Number.isFinite(variables.h) ? variables.h : 0;
    const k = Number.isFinite(variables.k) ? variables.k : 0;
    const xdraw = Number.isFinite(variables.xdraw) ? variables.xdraw : -6.5;
    const hg = Number.isFinite(variables.hg) ? variables.hg : 0;

    const p_prime_x = Math.PI / 2 / b + h;
    const p_prime_y = a * Math.sin(Math.PI / 2) + k; // sin(pi/2) === 1 exactly in JS
    const bracket_width = (2 * Math.PI) / b;

    return {
      concept_id: 'graph_transformations',
      variables: { a, b, h, k, xdraw, hg },
      derived: {
        p_prime_x,
        p_prime_y,
        bracket_width,
      },
      forces: [],
      graph: [],
      constraints_ok: true,
      warnings: [],
    };
  },
};
