import { G, makeForce } from '../utils';
import type { ConceptPhysicsEngine, PhysicsResult, GraphPoint } from '../types';

export const frictionStaticKineticEngine: ConceptPhysicsEngine = {
  default_variables: { m: 5, mu_s: 0.5, mu_k: 0.3, F: 15 },
  variable_ranges: {
    m: { min: 0.5, max: 20, step: 0.5, unit: 'kg' },
    mu_s: { min: 0.1, max: 0.9, step: 0.05, unit: '' },
    mu_k: { min: 0.05, max: 0.8, step: 0.05, unit: '' },
    F: { min: 0, max: 200, step: 1, unit: 'N' },
  },
  compute(variables): PhysicsResult {
    const { m, mu_s, mu_k, F } = variables;
    const mg = m * G;
    const N = mg;
    const fs_max = mu_s * N;
    const fk = mu_k * N;
    const is_slipping = F > fs_max;
    const fs_actual = is_slipping ? fk : Math.min(F, fs_max);
    const net_force = is_slipping ? F - fk : 0;
    const acceleration = is_slipping ? net_force / m : 0;

    const curvePoints: GraphPoint[] = [];
    const maxF = Math.max(50, F * 1.5, fs_max * 1.5);
    const steps = 60;
    for (let i = 0; i <= steps; i++) {
      const fVal = (i / steps) * maxF;
      const y = fVal <= fs_max ? fVal : fk;
      curvePoints.push({ x: fVal, y });
    }

    return {
      concept_id: 'friction_static_kinetic',
      variables,
      derived: {
        mg,
        N,
        fs_max,
        fk,
        fs_actual,
        net_force,
        acceleration,
        is_slipping: is_slipping ? 1 : 0,
      },
      forces: [
        makeForce('weight', `mg = ${mg.toFixed(1)} N`, 0, -mg, '#EF4444', 'body_center'),
        makeForce('normal', `N = ${N.toFixed(1)} N`, 0, N, '#10B981', 'body_bottom'),
        makeForce('applied', `F = ${F.toFixed(1)} N`, F, 0, '#2563EB', 'body_right'),
        makeForce(
          'friction',
          is_slipping
            ? `fk = ${fk.toFixed(1)} N (kinetic)`
            : `fs = ${fs_actual.toFixed(1)} N (static)`,
          -fs_actual,
          0,
          is_slipping ? '#F59E0B' : '#10B981',
          'body_left',
        ),
      ],
      graph: [
        {
          id: 'fs_vs_F',
          label: 'Friction vs Applied Force',
          points: curvePoints,
          live_point: { x: F, y: fs_actual },
          color: is_slipping ? '#F59E0B' : '#10B981',
        },
      ],
      constraints_ok: mu_k < mu_s && m > 0 && F >= 0,
      warnings:
        mu_k >= mu_s
          ? ['kinetic coefficient must be less than static: mu_k < mu_s']
          : [],
    };
  },
};
