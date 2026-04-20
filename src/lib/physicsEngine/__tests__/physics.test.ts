import { describe, it, expect } from 'vitest';
import { computePhysics } from '../index';

const G = 9.8;

function closeTo(actual: number, expected: number, tolerance = 0.01): void {
  expect(Math.abs(actual - expected)).toBeLessThan(tolerance);
}

describe('Physics Engine', () => {
  // ── normal_reaction ───────────────────────────────────────────

  it('1. normal_reaction: flat surface (theta=0) → N = mg', () => {
    const result = computePhysics('normal_reaction', { m: 2, theta: 0 });
    expect(result).not.toBeNull();
    const N = result!.derived.N;
    const mg = result!.derived.mg;
    closeTo(N, mg);                     // N = mg * cos(0) = mg
    closeTo(N, 2 * G);                  // = 19.6 N
  });

  it('2. normal_reaction: theta=30 → N = 2*9.8*cos(30°) ≈ 16.97N', () => {
    const result = computePhysics('normal_reaction', { m: 2, theta: 30 });
    expect(result).not.toBeNull();
    const expected = 2 * G * Math.cos(30 * Math.PI / 180);  // 16.974...
    closeTo(result!.derived.N, expected);
  });

  it('3. normal_reaction: theta=90 → N ≈ 0', () => {
    const result = computePhysics('normal_reaction', { m: 2, theta: 90 });
    expect(result).not.toBeNull();
    closeTo(result!.derived.N, 0, 0.001);
  });

  it('4. normal_reaction: m=0.5 (min mass edge case)', () => {
    const result = computePhysics('normal_reaction', { m: 0.5, theta: 30 });
    expect(result).not.toBeNull();
    const expected = 0.5 * G * Math.cos(30 * Math.PI / 180);
    closeTo(result!.derived.N, expected);
    expect(result!.constraints_ok).toBe(true);
  });

  it('5. normal_reaction: m=10 (max mass edge case)', () => {
    const result = computePhysics('normal_reaction', { m: 10, theta: 45 });
    expect(result).not.toBeNull();
    const expected = 10 * G * Math.cos(45 * Math.PI / 180);
    closeTo(result!.derived.N, expected);
    expect(result!.constraints_ok).toBe(true);
  });

  // ── contact_forces ────────────────────────────────────────────

  it('6. contact_forces: N=20, f=15 → F = sqrt(400+225) = 25N', () => {
    const result = computePhysics('contact_forces', { N: 20, f: 15 });
    expect(result).not.toBeNull();
    closeTo(result!.derived.F, 25);
  });

  it('7. contact_forces: f=0 (frictionless) → F = N', () => {
    const result = computePhysics('contact_forces', { N: 30, f: 0 });
    expect(result).not.toBeNull();
    closeTo(result!.derived.F, 30);     // sqrt(30^2 + 0^2) = 30
  });

  // ── field_forces ──────────────────────────────────────────────

  it('8. field_forces: m=2 → W = 2*9.8 = 19.6N', () => {
    const result = computePhysics('field_forces', { m: 2 });
    expect(result).not.toBeNull();
    closeTo(result!.derived.w, 19.6);
    expect(result!.forces[0].vector.y).toBeLessThan(0);   // weight points down
  });

  // ── tension_in_string ─────────────────────────────────────────

  it('9. tension_in_string: m1=2, m2=1 → T = 2*2*1*9.8/3 ≈ 13.07N', () => {
    const result = computePhysics('tension_in_string', { m1: 2, m2: 1 });
    expect(result).not.toBeNull();
    const expected = (2 * 2 * 1 * G) / (2 + 1);   // 13.0667
    closeTo(result!.derived.T, expected);
  });

  it('10. tension_in_string: m1=m2=2 → T = mg (equal masses, equilibrium)', () => {
    const result = computePhysics('tension_in_string', { m1: 2, m2: 2 });
    expect(result).not.toBeNull();
    const expected = (2 * 2 * 2 * G) / (2 + 2);   // = 2*9.8 = 19.6
    closeTo(result!.derived.T, expected);
    closeTo(result!.derived.a, 0);                 // no acceleration
    expect(result!.warnings.length).toBeGreaterThan(0);  // equilibrium warning
  });

  // ── hinge_force ───────────────────────────────────────────────

  it('11. hinge_force: W=40, F_ext=30 → F_hinge = sqrt(30^2+40^2) = 50N', () => {
    const result = computePhysics('hinge_force', { W: 40, F_ext: 30 });
    expect(result).not.toBeNull();
    closeTo(result!.derived.F_hinge, 50);
    closeTo(result!.derived.H, 30);    // horizontal component = F_ext
    closeTo(result!.derived.V, 40);    // vertical component = W
  });

  // ── free_body_diagram ─────────────────────────────────────────

  it('12. free_body_diagram: flat surface (scenario_type=0) → ΣFy ≈ 0', () => {
    const result = computePhysics('free_body_diagram', { m: 2, theta: 0, scenario_type: 0 });
    expect(result).not.toBeNull();

    // Sum of all force y-components should be ≈ 0 (equilibrium)
    const sumFy = result!.forces.reduce((s, f) => s + f.vector.y, 0);
    closeTo(sumFy, 0, 0.01);

    // Sum of all force x-components should be ≈ 0
    const sumFx = result!.forces.reduce((s, f) => s + f.vector.x, 0);
    closeTo(sumFx, 0, 0.01);
  });
});
