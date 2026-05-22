// torque_on_current_loop_in_field — Diamond #3 of the magnetism chapter (phase M2).
//
// DC Pandey Vol 2 Ch.26 §26.6 / NCERT Class 12 Ch.4 §4.10: Torque on a planar
// current loop in a uniform magnetic field. The atomic concept is that ΣF = 0
// (anti-parallel force pairs on opposite sides) yet Στ ≠ 0 — the couple rotates
// the loop. The scalar law is τ = μ B sin θ with μ = N I A; the vector law is
// τ = μ × B, with μ perpendicular to the loop face (RHR from current direction).
//
// Variables (slider-controllable):
//   N         — number of turns (default 1)
//   I         — current through the loop, A (default 0.5)
//   L_side    — side length of the square loop, m (default 0.10)
//   B         — uniform external field magnitude, T (default 0.1)
//   theta_deg — angle between μ and B, deg (default 30)
//
// Derived:
//   A_loop        — L_side², m²
//   mu_magnitude  — N · I · A_loop, A·m²
//   tau_magnitude — μ · B · sin θ, N·m
//   tau_max       — μ · B (at θ = 90°), N·m
//   F_per_side    — I · L_side · B, N (force on one current-carrying side)
//
// Direction is geometric: μ is RHR-derived from current direction; τ = μ × B.
// The field_3d renderer animates loop rotation, force pair, μ and τ vectors;
// this engine returns only the numerics. forces[] and graph[] are empty as in
// the other magnetism engines.

import type { ConceptPhysicsEngine, PhysicsResult } from '../types';

export const torqueOnCurrentLoopInFieldEngine: ConceptPhysicsEngine = {
  default_variables: { N: 1, I: 0.5, L_side: 0.10, B: 0.1, theta_deg: 30 },
  variable_ranges: {
    N: { min: 1, max: 100, step: 1, unit: '' },
    I: { min: 0.01, max: 5, step: 0.01, unit: 'A' },
    L_side: { min: 0.02, max: 0.30, step: 0.01, unit: 'm' },
    B: { min: 0.01, max: 1.0, step: 0.01, unit: 'T' },
    theta_deg: { min: 0, max: 180, step: 1, unit: 'deg' },
  },
  compute(variables): PhysicsResult {
    const { N, I, L_side, B, theta_deg } = variables;
    const theta_rad = (theta_deg * Math.PI) / 180;
    const sin_theta = Math.sin(theta_rad);

    const A_loop = L_side * L_side;
    const mu_magnitude = N * I * A_loop;
    const tau_magnitude = mu_magnitude * B * Math.abs(sin_theta);
    const tau_max = mu_magnitude * B;
    const F_per_side = I * L_side * B;

    const warnings: string[] = [];
    if (B <= 0) warnings.push('B = 0 → no torque on the loop');
    if (I <= 0) warnings.push('I = 0 → μ = 0 → τ = 0');
    if (theta_deg === 0) warnings.push('θ = 0° (μ ∥ B): τ = 0 — stable equilibrium');
    if (theta_deg === 180) warnings.push('θ = 180° (μ anti-parallel to B): τ = 0 — UNSTABLE equilibrium');

    return {
      concept_id: 'torque_on_current_loop_in_field',
      variables,
      derived: {
        A_loop,
        mu_magnitude,
        tau_magnitude,
        tau_max,
        F_per_side,
        sin_theta,
      },
      forces: [],
      graph: [],
      constraints_ok: B > 0 && I > 0 && L_side > 0 && N >= 1,
      warnings,
    };
  },
};
