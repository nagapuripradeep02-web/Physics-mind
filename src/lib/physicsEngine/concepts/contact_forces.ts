import { makeForce, magnitude, curvePoints } from '../utils';
import type { ConceptPhysicsEngine, PhysicsResult } from '../types';

export const contactForcesEngine: ConceptPhysicsEngine = {
  default_variables: { N: 20, f: 15 },
  variable_ranges: {
    N: { min: 0, max: 80, step: 1, unit: 'N' },
    f: { min: 0, max: 80, step: 1, unit: 'N' },
  },
  compute(variables): PhysicsResult {
    const { N, f } = variables;
    const F = magnitude(N, f);
    const theta_deg = Math.atan2(f, N) * (180 / Math.PI);

    return {
      concept_id: 'contact_forces',
      variables,
      derived: { F, theta_deg },
      forces: [
        makeForce('normal', `N = ${N.toFixed(0)} N`, 0, N, '#10B981', 'body_bottom'),
        makeForce('friction', `f = ${f.toFixed(0)} N`, f, 0, '#F59E0B', 'body_bottom'),
        makeForce('resultant', `F = ${F.toFixed(1)} N`, f, N, '#EF4444', 'body_bottom'),
      ],
      graph: [
        {
          id: 'constant_F_arc',
          label: `F = ${F.toFixed(1)} N`,
          points: curvePoints((fVal) => Math.sqrt(Math.max(0, F * F - fVal * fVal)), 0, F),
          live_point: { x: f, y: N },
          color: '#EF4444',
        },
      ],
      constraints_ok: N >= 0 && f >= 0,
      warnings: [],
    };
  },
};
