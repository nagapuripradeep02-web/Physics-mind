import { describe, it, expect, beforeEach } from 'vitest';
import { ChoreographyEngine } from '../index';
import type { SimEvent, SimSession } from '../../types';

function makeSession(): SimSession & { emitted: SimEvent[] } {
  const emitted: SimEvent[] = [];
  return {
    sessionId: 'test',
    emit: (e: SimEvent) => { emitted.push(e); },
    on: () => {},
    off: () => {},
    getEngine: <T,>() => null as T | null,
    emitted,
  } as SimSession & { emitted: SimEvent[] };
}

describe('ChoreographyEngine', () => {
  let engine: ChoreographyEngine;
  let session: SimSession & { emitted: SimEvent[] };

  beforeEach(async () => {
    engine = new ChoreographyEngine();
    session = makeSession();
    await engine.init({}, session);
  });

  it('1. startAnimation registers primitive', () => {
    engine.startAnimation('ball', { type: 'free_fall' });
    expect(engine.isAnimating('ball')).toBe(true);
    expect(engine.getActiveCount()).toBe(1);
  });

  it('2. isAnimating returns true after start, false after stop', () => {
    engine.startAnimation('ball', { type: 'free_fall' });
    expect(engine.isAnimating('ball')).toBe(true);
    engine.stopAnimation('ball');
    expect(engine.isAnimating('ball')).toBe(false);
  });

  it('3. free_fall: at t=1s, y ≈ 0.5*9.8*1*20 = 98px', () => {
    engine.startAnimation('ball', { type: 'free_fall' });
    const pos = engine.getPosition('ball', 1000);
    expect(pos).not.toBeNull();
    expect(pos!.y).toBeCloseTo(98, 1);
    expect(pos!.x).toBe(0);
  });

  it('4. free_fall: at t=0, y = 0', () => {
    engine.startAnimation('ball', { type: 'free_fall' });
    const pos = engine.getPosition('ball', 0);
    expect(pos!.x).toBe(0);
    expect(pos!.y).toBe(0);
  });

  it('5. simple_harmonic: at t=0, x = A (phase=0)', () => {
    engine.startAnimation('spring', {
      type: 'simple_harmonic',
      physics_vars: { A: 50, omega: 2 * Math.PI, phi: 0 },
    });
    const pos = engine.getPosition('spring', 0);
    expect(pos!.x).toBeCloseTo(50, 5);
  });

  it('6. simple_harmonic: at t=PI/omega, x = -A', () => {
    // A=50, omega=PI so t = PI/PI = 1s. cos(PI) = -1 → x = -50
    engine.startAnimation('spring', {
      type: 'simple_harmonic',
      physics_vars: { A: 50, omega: Math.PI, phi: 0 },
    });
    const pos = engine.getPosition('spring', 1000);
    expect(pos!.x).toBeCloseTo(-50, 5);
  });

  it('7. projectile: at t=0, x=0, y=0', () => {
    engine.startAnimation('shell', {
      type: 'projectile',
      physics_vars: { v0: 20, theta_deg: 45 },
    });
    const pos = engine.getPosition('shell', 0);
    expect(pos!.x).toBeCloseTo(0, 5);
    expect(pos!.y).toBeCloseTo(0, 5);
  });

  it('8. projectile: at peak, vy ≈ 0 (verify via numerical slope)', () => {
    // Peak time t_peak = v0*sin(theta)/g
    const v0 = 20;
    const theta_deg = 45;
    const theta = (theta_deg * Math.PI) / 180;
    const tPeakMs = (v0 * Math.sin(theta) / 9.8) * 1000;
    engine.startAnimation('shell', {
      type: 'projectile',
      physics_vars: { v0, theta_deg },
    });
    // Numerical vy ≈ (y(t+dt) - y(t-dt)) / (2*dt)
    const dtMs = 10;
    const yBefore = engine.getPosition('shell', tPeakMs - dtMs)!.y;
    const yAfter = engine.getPosition('shell', tPeakMs + dtMs)!.y;
    const vyPxPerMs = (yAfter - yBefore) / (2 * dtMs);
    expect(Math.abs(vyPxPerMs)).toBeLessThan(0.02);
  });

  it('9. grow: at t=0, scale=0; at t=duration_ms, scale=1', () => {
    engine.startAnimation('arrow', { type: 'grow', duration_ms: 800 });
    const start = engine.getPosition('arrow', 0);
    const end = engine.getPosition('arrow', 800);
    expect(start!.scale).toBe(0);
    expect(end!.scale).toBe(1);
  });

  it('10. fade_in: at t=duration_ms/2, opacity=0.5', () => {
    engine.startAnimation('label', { type: 'fade_in', duration_ms: 1000 });
    const mid = engine.getPosition('label', 500);
    expect(mid!.opacity).toBeCloseTo(0.5, 5);
  });

  it('11. STATE_EXIT stops all animations', () => {
    engine.startAnimation('a', { type: 'free_fall' });
    engine.startAnimation('b', { type: 'grow', duration_ms: 500 });
    expect(engine.getActiveCount()).toBe(2);
    engine.onEvent({ type: 'STATE_EXIT', state: 'STATE_1' });
    expect(engine.getActiveCount()).toBe(0);
    expect(engine.isAnimating('a')).toBe(false);
  });

  it('12. getPosition on unknown primitive returns null', () => {
    expect(engine.getPosition('ghost', 500)).toBeNull();
  });
});
