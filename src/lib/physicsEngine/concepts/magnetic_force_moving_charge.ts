// magnetic_force_moving_charge — Diamond #2 of the magnetism chapter (M1).
//
// DC Pandey Vol 2 Ch.26 §26.2 / NCERT Class 12 Ch.4 §4.2: The Lorentz force
// on a moving charged particle in a magnetic field, F = q(v × B). The atomic
// concept being taught is *direction* (F ⊥ both v and B — palm rule) and
// *magnitude* (F = |q|vB sin θ, max at θ = 90°, zero when v ∥ B). Because
// F ⊥ v always, F does no work, so |v| is constant — the particle moves on
// a circle (if v ⊥ B) or a helix (if v has a component along B).
//
// Variables (slider-controllable):
//   q_sign  — charge sign, ±1 (default +1 for proton-like)
//   v       — speed, m/s (default 1e5)
//   B       — magnetic field magnitude, T (default 0.01)
//   theta_deg — angle between v and B, deg (default 90)
//
// Derived:
//   F_magnitude       — |q|·v·B·sin(θ), N
//   r_cyclotron       — m·v_perp / (|q|·B), m   (Larmor radius)
//   T_cyclotron       — 2π·m / (|q|·B), s
//   omega_cyclotron   — |q|·B / m, rad/s
//
// Constants used: elementary charge e = 1.602e-19 C, proton mass m_p = 1.67e-27 kg.
// (Mass is hardcoded to proton; the renderer can show electron behaviour via
// the q_sign slider — the qualitative geometry is what matters at this level.)
//
// Direction is geometric (palm rule for positive charge; flip F for negative).
// The field_3d renderer animates v, F, and the trajectory; this engine returns
// only the numerics. forces[] and graph[] are empty as in magnetic_field_wire.ts.

import type { ConceptPhysicsEngine, PhysicsResult } from '../types';

const E_CHARGE = 1.602176634e-19;   // C — exact by SI definition (post-2019)
const M_PROTON = 1.67262192369e-27; // kg — CODATA 2018

export const magneticForceMovingChargeEngine: ConceptPhysicsEngine = {
  default_variables: { q_sign: 1, v: 1e5, B: 0.01, theta_deg: 90 },
  variable_ranges: {
    q_sign: { min: -1, max: 1, step: 2, unit: '' },        // step 2 → only -1 / +1
    v: { min: 5e4, max: 5e5, step: 1e4, unit: 'm/s' },
    B: { min: 0.001, max: 0.1, step: 0.001, unit: 'T' },
    theta_deg: { min: 0, max: 90, step: 1, unit: 'deg' },
  },
  compute(variables): PhysicsResult {
    const { q_sign, v, B, theta_deg } = variables;
    const theta_rad = (theta_deg * Math.PI) / 180;
    const sin_theta = Math.sin(theta_rad);
    const abs_q = E_CHARGE;
    const m = M_PROTON;
    const v_perp = v * sin_theta;

    const F_magnitude = abs_q * v * B * sin_theta;
    const r_cyclotron = B > 0 ? (m * v_perp) / (abs_q * B) : Infinity;
    const T_cyclotron = B > 0 ? (2 * Math.PI * m) / (abs_q * B) : Infinity;
    const omega_cyclotron = (abs_q * B) / m;

    const warnings: string[] = [];
    if (B <= 0) warnings.push('B = 0 produces no magnetic force');
    if (v <= 0) warnings.push('v = 0 → particle at rest → no magnetic force');
    if (theta_deg === 0) warnings.push('θ = 0 (v ∥ B) → F = 0, particle moves in a straight line');

    return {
      concept_id: 'magnetic_force_moving_charge',
      variables,
      derived: {
        F_magnitude,
        r_cyclotron,
        T_cyclotron,
        omega_cyclotron,
        q_coulombs: q_sign * abs_q,
        mass_kg: m,
        v_perp,
      },
      forces: [],
      graph: [],
      constraints_ok: B > 0 && v > 0,
      warnings,
    };
  },
};
