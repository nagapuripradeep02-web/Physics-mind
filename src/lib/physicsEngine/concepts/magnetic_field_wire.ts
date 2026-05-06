// magnetic_field_wire — Phase 0 validation demo Sim 3 (session 60).
//
// DC Pandey Class 12 Ch.4 §4.4: Magnetic field of a long straight current-
// carrying wire. The atomic concept being taught is *direction* (right-hand
// rule, B circles around the wire) and *magnitude* (B = μ₀I/(2πr), falls as
// 1/r). Three.js renders the 3D-ness; this engine provides the numbers.
//
// Variables:
//   I  (A)   — current in the wire (default 5)
//   r  (m)   — perpendicular distance from wire to field point (default 0.05)
//
// Derived:
//   B_magnitude    — B in tesla, from B = μ₀ · I / (2π · r)
//   B_microtesla   — same in microtesla, for student-friendly readout
//
// Direction is geometric (tangent to the circle through the point, by RHR)
// and is not returned numerically by this engine — the field_3d renderer
// handles it visually. forces[] and graph[] are empty for the same reason.

import type { ConceptPhysicsEngine, PhysicsResult } from '../types';

const MU_0 = 4 * Math.PI * 1e-7; // T·m/A — exact by SI definition pre-2019, ~exact post.

export const magneticFieldWireEngine: ConceptPhysicsEngine = {
  default_variables: { I: 5, r: 0.05 },
  variable_ranges: {
    I: { min: 0.5, max: 20, step: 0.5, unit: 'A' },
    r: { min: 0.02, max: 0.30, step: 0.01, unit: 'm' },
  },
  compute(variables): PhysicsResult {
    const { I, r } = variables;
    const safe_r = r > 0 ? r : 1e-9;
    const B_magnitude = (MU_0 * I) / (2 * Math.PI * safe_r);
    const B_microtesla = B_magnitude * 1e6;
    return {
      concept_id: 'magnetic_field_wire',
      variables,
      derived: {
        B_magnitude,
        B_microtesla,
        mu_0: MU_0,
      },
      forces: [],
      graph: [],
      constraints_ok: r > 0 && I !== 0,
      warnings:
        r > 0 && I !== 0
          ? []
          : [
              ...(r > 0 ? [] : ['r must be positive — point cannot be ON the wire']),
              ...(I !== 0 ? [] : ['I = 0 produces no magnetic field']),
            ],
    };
  },
};
