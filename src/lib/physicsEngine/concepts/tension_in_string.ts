import { G, makeForce, curvePoints } from '../utils';
import type { ConceptPhysicsEngine, PhysicsResult } from '../types';

export const tensionInStringEngine: ConceptPhysicsEngine = {
  default_variables: { m1: 2, m2: 1 },
  variable_ranges: {
    m1: { min: 0.5, max: 5, step: 0.5, unit: 'kg' },
    m2: { min: 0.5, max: 5, step: 0.5, unit: 'kg' },
  },
  compute(variables): PhysicsResult {
    const { m1, m2 } = variables;
    const totalMass = m1 + m2;
    const T = (2 * m1 * m2 * G) / totalMass;
    const a = ((m1 - m2) * G) / totalMass;

    return {
      concept_id: 'tension_in_string',
      variables,
      derived: { T, a },
      forces: [
        makeForce('T_on_m1', `T = ${T.toFixed(1)} N`, 0, T, '#10B981', 'body_top'),
        makeForce('weight_m1', `m\u2081g = ${(m1 * G).toFixed(1)} N`, 0, -(m1 * G), '#EF4444', 'body_center'),
        makeForce('T_on_m2', `T = ${T.toFixed(1)} N`, 0, T, '#10B981', 'body_top'),
        makeForce('weight_m2', `m\u2082g = ${(m2 * G).toFixed(1)} N`, 0, -(m2 * G), '#3B82F6', 'body_center'),
      ],
      graph: [
        {
          id: 'T_vs_m1',
          label: 'T = 2m\u2081m\u2082g/(m\u2081+m\u2082)',
          points: curvePoints((x) => (2 * x * m2 * G) / (x + m2), 0.1, 5),
          live_point: { x: m1, y: T },
          color: '#10B981',
        },
        {
          id: 'm1g_reference',
          label: 'm\u2081g',
          points: curvePoints((x) => x * G, 0, 5),
          live_point: { x: m1, y: m1 * G },
          color: '#3B82F6',
        },
        {
          id: 'm2g_reference',
          label: `m\u2082g = ${(m2 * G).toFixed(1)} N`,
          points: curvePoints(() => m2 * G, 0, 5),
          live_point: { x: m1, y: m2 * G },
          color: '#F59E0B',
        },
      ],
      constraints_ok: m1 > 0 && m2 > 0,
      warnings: m1 === m2 ? ['m\u2081 = m\u2082: system in equilibrium, a = 0'] : [],
    };
  },
};
