import { makeForce, magnitude, angle_deg } from '../utils';
import type { ConceptPhysicsEngine, PhysicsResult } from '../types';

export const hingeForceEngine: ConceptPhysicsEngine = {
  default_variables: { W: 40, F_ext: 30 },
  variable_ranges: {
    W: { min: 10, max: 100, step: 5, unit: 'N' },
    F_ext: { min: 0, max: 80, step: 5, unit: 'N' },
  },
  compute(variables): PhysicsResult {
    const { W, F_ext } = variables;
    const H = F_ext;
    const V = W;
    const F_hinge = magnitude(H, V);
    const theta = angle_deg(H, V);

    return {
      concept_id: 'hinge_force',
      variables,
      derived: { H, V, F_hinge, theta_deg: theta },
      forces: [
        makeForce('hinge_H', `H = ${H.toFixed(1)} N`, H, 0, '#3B82F6', 'body_left'),
        makeForce('hinge_V', `V = ${V.toFixed(1)} N`, 0, V, '#10B981', 'body_left'),
        makeForce('hinge_total', `F = ${F_hinge.toFixed(1)} N`, H, V, '#8B5CF6', 'body_left'),
        makeForce('ext_load', `F_ext = ${F_ext.toFixed(1)} N`, 0, -F_ext, '#EF4444', 'body_right'),
        makeForce('weight', `W = ${W.toFixed(1)} N`, 0, -W, '#EF4444', 'body_center'),
      ],
      graph: [
        {
          id: 'hinge_vector',
          label: `F_hinge = ${F_hinge.toFixed(1)} N`,
          points: [{ x: 0, y: 0 }, { x: H, y: V }],
          live_point: { x: H, y: V },
          color: '#8B5CF6',
        },
      ],
      constraints_ok: true,
      warnings: [],
    };
  },
};
