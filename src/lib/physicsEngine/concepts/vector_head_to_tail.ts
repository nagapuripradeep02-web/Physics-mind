// vector_head_to_tail — Phase 0 validation demo Sim 1 (session 56).
//
// This concept teaches the head-to-tail rule for adding two velocity vectors
// using a Mumbai monsoon walker as the anchor. Visual primitives are all
// premium primitives (animated_path + glow_focus + sound_cue) and authored
// annotations — NO force_arrow primitives are used, so the forces[] array is
// empty by design.
//
// What the engine returns:
//   - variables: v_rain (rain speed, m/s) + v_you (walker speed, m/s)
//   - derived: v_apparent_mag (Pythagorean magnitude) +
//              theta_apparent_deg (angle of resultant from vertical)
//   - forces: [] — visuals are authored, not engine-driven
//   - graph: [] — single panel, no graph
//   - constraints_ok: true (no physics constraints to validate)

import type { ConceptPhysicsEngine, PhysicsResult } from '../types';

export const vectorHeadToTailEngine: ConceptPhysicsEngine = {
  default_variables: { v_rain: 5, v_you: 4 },
  variable_ranges: {
    v_rain: { min: 1, max: 10, step: 0.5, unit: 'm/s' },
    v_you: { min: 0, max: 8, step: 0.5, unit: 'm/s' },
  },
  compute(variables): PhysicsResult {
    const { v_rain, v_you } = variables;
    const v_apparent_mag = Math.sqrt(v_rain * v_rain + v_you * v_you);
    const theta_apparent_deg = (Math.atan2(v_you, v_rain) * 180) / Math.PI;
    return {
      concept_id: 'vector_head_to_tail',
      variables,
      derived: {
        v_apparent_mag,
        theta_apparent_deg,
      },
      forces: [],
      graph: [],
      constraints_ok: true,
      warnings: [],
    };
  },
};
