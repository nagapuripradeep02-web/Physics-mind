import { G, makeForce, toRad } from '../utils';
import type { ConceptPhysicsEngine, PhysicsResult } from '../types';

export const freeBodyDiagramEngine: ConceptPhysicsEngine = {
  default_variables: { m: 2, theta: 0, scenario_type: 0 },
  variable_ranges: {
    m: { min: 0.5, max: 10, step: 0.5, unit: 'kg' },
    theta: { min: 0, max: 60, step: 5, unit: 'degrees' },
    scenario_type: { min: 0, max: 1, step: 1, unit: '' },
  },
  compute(variables): PhysicsResult {
    const { m, theta, scenario_type } = variables;
    const mg = m * G;
    const thetaRad = toRad(theta);
    const N = mg * Math.cos(thetaRad);
    const f = mg * Math.sin(thetaRad);

    const forces = [
      makeForce('weight', `mg = ${mg.toFixed(1)} N`, 0, -mg, '#EF4444', 'body_center'),
    ];

    if (scenario_type === 0) {
      forces.push(makeForce('normal', `N = ${mg.toFixed(1)} N`, 0, mg, '#10B981', 'body_bottom'));
    } else if (scenario_type === 1) {
      forces.push(
        makeForce(
          'normal',
          `N = ${N.toFixed(1)} N`,
          -Math.sin(thetaRad) * N,
          Math.cos(thetaRad) * N,
          '#10B981',
          'body_bottom'
        )
      );
      if (theta > 0) {
        forces.push(
          makeForce(
            'friction',
            `f = ${f.toFixed(1)} N`,
            Math.cos(thetaRad) * f,
            Math.sin(thetaRad) * f,
            '#F59E0B',
            'body_bottom'
          )
        );
      }
    }

    const sumFx = forces.reduce((s, force) => s + force.vector.x, 0);
    const sumFy = forces.reduce((s, force) => s + force.vector.y, 0);

    return {
      concept_id: 'free_body_diagram',
      variables,
      derived: { mg, N, f, scenario_type },
      forces,
      graph: [
        {
          id: 'force_balance_x',
          label: '\u03A3Fx',
          points: [],
          live_point: { x: 0, y: sumFx },
          color: '#3B82F6',
          bars: [{ label: '\u03A3Fx', value: sumFx }],
        },
        {
          id: 'force_balance_y',
          label: '\u03A3Fy',
          points: [],
          live_point: { x: 0, y: sumFy },
          color: '#10B981',
          bars: [{ label: '\u03A3Fy', value: sumFy }],
        },
      ],
      constraints_ok: N >= 0,
      warnings: [],
    };
  },
};
