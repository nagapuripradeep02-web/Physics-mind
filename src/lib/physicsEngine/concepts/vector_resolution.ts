import { G, makeForce, toRad, curvePoints } from '../utils';
import type { ConceptPhysicsEngine, PhysicsResult } from '../types';

// Vector-resolution engine. Exposes two independent forces so the same concept
// can demonstrate both abstract vectors (STATE_1-3, STATE_5) and the classic
// mg-on-incline application (STATE_4):
//   main_vector: the student's abstract F at angle alpha
//   weight:      a fixed 2 kg gravity vector for STATE_4's block-on-incline demo
// Components along rotated axes are the responsibility of force_components
// (via decompose_axis: "along_surface:...", "angle_deg:N", or "world_xy").
export const vectorResolutionEngine: ConceptPhysicsEngine = {
  default_variables: { F: 10, alpha: 50 },
  variable_ranges: {
    F: { min: 1, max: 20, step: 1, unit: 'N' },
    alpha: { min: 0, max: 90, step: 5, unit: 'degrees' },
  },
  compute(variables): PhysicsResult {
    const { F, alpha } = variables;
    const aRad = toRad(alpha);
    const Fx = F * Math.cos(aRad);
    const Fy = F * Math.sin(aRad);
    const m = 2; // demo block mass for STATE_4
    const mg = m * G;

    return {
      concept_id: 'vector_resolution',
      variables,
      derived: { F, alpha, Fx, Fy, Fcos: Fx, Fsin: Fy, mg },
      forces: [
        makeForce('main_vector', `F = ${F.toFixed(1)} N`, Fx, Fy, '#3B82F6', 'body_center'),
        makeForce('weight', `mg = ${mg.toFixed(1)} N`, 0, -mg, '#EF4444', 'body_bottom'),
      ],
      graph: [
        {
          id: 'Fcos_vs_alpha',
          label: 'F cos\u03B1 (x-component)',
          points: curvePoints((t) => F * Math.cos(toRad(t)), 0, 90),
          live_point: { x: alpha, y: Fx },
          color: '#F59E0B',
        },
        {
          id: 'Fsin_vs_alpha',
          label: 'F sin\u03B1 (y-component)',
          points: curvePoints((t) => F * Math.sin(toRad(t)), 0, 90),
          live_point: { x: alpha, y: Fy },
          color: '#06B6D4',
        },
      ],
      constraints_ok: F > 0 && alpha >= 0 && alpha <= 90,
      warnings: [],
    };
  },
};
