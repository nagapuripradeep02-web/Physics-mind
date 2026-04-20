import { G, makeForce, curvePoints } from '../utils';
import type { ConceptPhysicsEngine, PhysicsResult } from '../types';

export const fieldForcesEngine: ConceptPhysicsEngine = {
  default_variables: { m: 1 },
  variable_ranges: {
    m: { min: 0.1, max: 10, step: 0.1, unit: 'kg' },
  },
  compute(variables): PhysicsResult {
    const { m } = variables;
    const w = m * G;

    return {
      concept_id: 'field_forces',
      variables,
      derived: { w, g: G },
      forces: [
        makeForce('weight', `mg = ${w.toFixed(1)} N`, 0, -w, '#EF4444', 'body_center'),
      ],
      graph: [
        {
          id: 'weight_vs_mass',
          label: 'w = mg',
          points: curvePoints((x) => x * G, 0, 10),
          live_point: { x: m, y: w },
          color: '#EF4444',
        },
      ],
      constraints_ok: m > 0,
      warnings: m <= 0 ? ['Mass must be positive'] : [],
    };
  },
};
