import { G, makeForce, curvePoints, toRad } from '../utils';
import type { ConceptPhysicsEngine, PhysicsResult } from '../types';

export const normalReactionEngine: ConceptPhysicsEngine = {
  default_variables: { m: 2, theta: 30 },
  variable_ranges: {
    m: { min: 0.5, max: 10, step: 0.5, unit: 'kg' },
    theta: { min: 0, max: 80, step: 5, unit: 'degrees' },
  },
  compute(variables): PhysicsResult {
    const { m, theta } = variables;
    const thetaRad = toRad(theta);
    const mg = m * G;
    const N = mg * Math.cos(thetaRad);
    const f_parallel = mg * Math.sin(thetaRad);
    const N_angle_deg = 90 + theta;

    return {
      concept_id: 'normal_reaction',
      variables,
      derived: { mg, N, f_parallel, N_angle_deg },
      forces: [
        makeForce('weight', `mg = ${mg.toFixed(1)} N`, 0, -mg, '#EF4444', 'body_center'),
        makeForce(
          'normal',
          `N = ${N.toFixed(1)} N`,
          -Math.sin(thetaRad) * N,
          Math.cos(thetaRad) * N,
          '#10B981',
          'body_bottom'
        ),
      ],
      graph: [
        {
          id: 'N_vs_theta',
          label: 'N = mgcos\u03B8',
          points: curvePoints((t) => m * G * Math.cos(toRad(t)), 0, 90),
          live_point: { x: theta, y: N },
          color: '#10B981',
        },
      ],
      constraints_ok: theta >= 0 && theta <= 90 && m > 0,
      warnings: theta >= 90 ? ['At \u03B8=90\u00B0, N=0: surface is vertical'] : [],
    };
  },
};
