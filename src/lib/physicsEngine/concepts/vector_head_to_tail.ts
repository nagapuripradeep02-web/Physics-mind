// vector_head_to_tail — Phase 0 validation demo Sim 1 (session 56).
//
// Pure DC Pandey Ch.5.4 head-to-tail rule for displacement vectors.
// Anchor: walk d_east meters east, then d_north meters north — what is the
// straight-line displacement from start? Resultant magnitude via Pythagoras.
//
// What the engine returns:
//   - variables: d_east (eastward leg, m) + d_north (northward leg, m)
//   - derived: d_resultant_mag (Pythagorean magnitude) +
//              theta_resultant_deg (angle from east axis, anticlockwise)
//   - forces: [] — visuals are authored, not engine-driven
//   - graph: [] — single panel, no graph
//   - constraints_ok: true (no physics constraints to validate)

import type { ConceptPhysicsEngine, PhysicsResult } from '../types';

export const vectorHeadToTailEngine: ConceptPhysicsEngine = {
  default_variables: { d_east: 3, d_north: 4 },
  variable_ranges: {
    d_east: { min: 1, max: 8, step: 0.5, unit: 'm' },
    d_north: { min: 1, max: 8, step: 0.5, unit: 'm' },
  },
  compute(variables): PhysicsResult {
    const { d_east, d_north } = variables;
    const d_resultant_mag = Math.sqrt(d_east * d_east + d_north * d_north);
    const theta_resultant_deg = (Math.atan2(d_north, d_east) * 180) / Math.PI;
    return {
      concept_id: 'vector_head_to_tail',
      variables,
      derived: {
        d_resultant_mag,
        theta_resultant_deg,
      },
      forces: [],
      graph: [],
      constraints_ok: true,
      warnings: [],
    };
  },
};
