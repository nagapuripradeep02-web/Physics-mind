import { describe, it, expect, beforeEach } from 'vitest';
import { TransitionEngine } from '../index';
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

describe('TransitionEngine', () => {
  let engine: TransitionEngine;
  let session: SimSession & { emitted: SimEvent[] };

  beforeEach(async () => {
    engine = new TransitionEngine();
    session = makeSession();
    await engine.init({}, session);
  });

  it('1. startTransition sets isTransitioning = true', () => {
    expect(engine.isTransitioning()).toBe(false);
    engine.startTransition({ from_state: 'A', to_state: 'B', duration_ms: 800 });
    expect(engine.isTransitioning()).toBe(true);
  });

  it('2. getProgress at t=0 → 0.0', () => {
    engine.startTransition({ from_state: 'A', to_state: 'B', duration_ms: 800 });
    expect(engine.getProgress(0)).toBe(0);
  });

  it('3. getProgress at t=duration_ms → 1.0', () => {
    engine.startTransition({ from_state: 'A', to_state: 'B', duration_ms: 800 });
    expect(engine.getProgress(800)).toBe(1);
  });

  it('4. getProgress at t=duration_ms/2 → 0.5 (ease_in_out midpoint)', () => {
    engine.startTransition({ from_state: 'A', to_state: 'B', duration_ms: 800 });
    expect(engine.getProgress(400)).toBeCloseTo(0.5, 10);
  });

  it('5. linear easing: getProgress at t=duration_ms/4 → 0.25', () => {
    engine.startTransition({
      from_state: 'A', to_state: 'B', duration_ms: 800, easing: 'linear',
    });
    expect(engine.getProgress(200)).toBeCloseTo(0.25, 10);
  });

  it('6. ease_in_out: getProgress at t=duration_ms/4 < 0.25 (slow start)', () => {
    engine.startTransition({ from_state: 'A', to_state: 'B', duration_ms: 800 });
    // t=0.25, progress = 2 * 0.25^2 = 0.125
    const p = engine.getProgress(200);
    expect(p).toBeLessThan(0.25);
    expect(p).toBeCloseTo(0.125, 10);
  });

  it('7. interpolate: from=0, to=100, at t=duration_ms/2 → ~50 (ease_in_out)', () => {
    engine.startTransition({ from_state: 'A', to_state: 'B', duration_ms: 800 });
    expect(engine.interpolate(0, 100, 400)).toBeCloseTo(50, 5);
  });

  it('8. STATE_ENTER triggers startTransition automatically', () => {
    expect(engine.isTransitioning()).toBe(false);
    engine.onEvent({ type: 'STATE_ENTER', state: 'STATE_1' });
    expect(engine.isTransitioning()).toBe(true);
    expect(engine.getActiveSpec()?.to_state).toBe('STATE_1');
    expect(engine.getActiveSpec()?.from_state).toBeNull(); // first entry

    engine.onEvent({ type: 'STATE_ENTER', state: 'STATE_2' });
    expect(engine.getActiveSpec()?.from_state).toBe('STATE_1');
    expect(engine.getActiveSpec()?.to_state).toBe('STATE_2');
  });
});
