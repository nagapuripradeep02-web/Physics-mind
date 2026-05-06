// newton_second_law_direction — Phase 0 validation demo Sim 2 (session 59).
//
// DC Pandey Class 11 Ch.5 §5.4–5.5: F = m·a as a vector equation.
// The atomic concept is *direction*: F is a vector, a is a vector, m is a
// scalar, so a points along F (not along v). Velocity grows from a over time.
//
// What the engine returns:
//   - variables: F (N), m (kg), theta_F (deg from horizontal), t (s)
//   - derived:
//       a_mag        — F / m
//       a_x, a_y     — components of a in canvas frame
//       v_x_at_t,
//       v_y_at_t     — kinematic velocity components at time t (from rest)
//       v_mag_at_t   — |v(t)|
//   - forces: [] — visuals are authored, not engine-driven
//   - graph: [] — single panel, no graph
//   - constraints_ok: true (mass > 0 enforced by variable_ranges)
//
// Iframe-side fallback in parametric_renderer.ts mirrors this exactly.

import type { ConceptPhysicsEngine, PhysicsResult } from '../types';

export const newtonSecondLawDirectionEngine: ConceptPhysicsEngine = {
  default_variables: { F: 10, m: 2, theta_F: 0, t: 1 },
  variable_ranges: {
    F: { min: 1, max: 50, step: 1, unit: 'N' },
    m: { min: 0.5, max: 10, step: 0.5, unit: 'kg' },
    theta_F: { min: 0, max: 90, step: 5, unit: 'deg' },
    t: { min: 0, max: 5, step: 0.1, unit: 's' },
  },
  compute(variables): PhysicsResult {
    const { F, m, theta_F, t } = variables;
    const theta_rad = (theta_F * Math.PI) / 180;
    const a_mag = F / m;
    const a_x = a_mag * Math.cos(theta_rad);
    const a_y = a_mag * Math.sin(theta_rad);
    const v_x_at_t = a_x * t;
    const v_y_at_t = a_y * t;
    const v_mag_at_t = Math.sqrt(v_x_at_t * v_x_at_t + v_y_at_t * v_y_at_t);
    return {
      concept_id: 'newton_second_law_direction',
      variables,
      derived: {
        a_mag,
        a_x,
        a_y,
        v_x_at_t,
        v_y_at_t,
        v_mag_at_t,
      },
      forces: [],
      graph: [],
      constraints_ok: m > 0,
      warnings: m > 0 ? [] : ['mass must be positive: m > 0'],
    };
  },
};
