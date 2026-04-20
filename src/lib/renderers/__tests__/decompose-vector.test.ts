import { describe, it, expect } from 'vitest';
import { decomposeForceVector } from '../parametric_renderer';

// These tests pin the decomposition formula used by drawForceComponents.
// The same math is duplicated inside PARAMETRIC_RENDERER_CODE (it runs inside
// the iframe and cannot be imported directly). If you change one, change the other.

describe('decomposeForceVector', () => {
  it('axisDeg=0 preserves world x/y (backward compatible)', () => {
    const r = decomposeForceVector(3, 4, 0);
    expect(r.parallel).toBeCloseTo(3);
    expect(r.perpendicular).toBeCloseTo(4);
  });

  it('mg on 30° incline: parallel = -mg·sinθ, perpendicular = -mg·cosθ', () => {
    // mg in math frame is (0, -19.6)
    const r = decomposeForceVector(0, -19.6, 30);
    // parallel (along up-slope axis, negative → points down-slope)
    expect(r.parallel).toBeCloseTo(-9.8, 1);
    // perpendicular (outward-from-surface axis, negative → points into surface)
    expect(r.perpendicular).toBeCloseTo(-16.97, 1);
    // Magnitude preserved: p² + q² = |mg|²
    expect(r.parallel ** 2 + r.perpendicular ** 2).toBeCloseTo(19.6 ** 2, 1);
  });

  it('mg on horizontal floor (θ=0): all weight is perpendicular, parallel=0', () => {
    const r = decomposeForceVector(0, -19.6, 0);
    expect(r.parallel).toBeCloseTo(0);
    expect(r.perpendicular).toBeCloseTo(-19.6);
  });

  it('θ=90° (vertical wall) swaps axes', () => {
    // Force pointing right in math frame: (10, 0)
    const r = decomposeForceVector(10, 0, 90);
    expect(r.parallel).toBeCloseTo(0, 5);
    expect(r.perpendicular).toBeCloseTo(-10, 5);
  });

  it('θ=45° rotates (1, 0) into (cos45, -sin45)', () => {
    const r = decomposeForceVector(1, 0, 45);
    expect(r.parallel).toBeCloseTo(Math.SQRT1_2);
    expect(r.perpendicular).toBeCloseTo(-Math.SQRT1_2);
  });

  it('magnitude is invariant under any axis rotation', () => {
    const fx = 3, fy = -5;
    const m0 = Math.hypot(fx, fy);
    for (const deg of [0, 15, 30, 45, 60, 90, 135, 270]) {
      const r = decomposeForceVector(fx, fy, deg);
      expect(Math.hypot(r.parallel, r.perpendicular)).toBeCloseTo(m0, 6);
    }
  });
});
