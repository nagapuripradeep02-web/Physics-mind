import { describe, it, expect, beforeEach } from 'vitest';
import { InteractionEngine, type InteractionConfig } from '../index';
import type { SimEvent, SimSession } from '../../types';

function makeSession(): SimSession & { emitted: SimEvent[] } {
  const emitted: SimEvent[] = [];
  return {
    sessionId: 'test-session',
    emit: (event: SimEvent) => { emitted.push(event); },
    on: () => {},
    off: () => {},
    getEngine: <T,>() => null as T | null,
    emitted,
  } as SimSession & { emitted: SimEvent[] };
}

const NORMAL_REACTION_CONFIG: InteractionConfig = {
  conceptId: 'normal_reaction',
  sliders: {
    m: { min: 0.5, max: 10, step: 0.5, default: 2 },
    theta: { min: 0, max: 90, step: 5, default: 30 },
  },
  hotspots: ['block', 'floor'],
};

describe('InteractionEngine', () => {
  let engine: InteractionEngine;
  let session: SimSession & { emitted: SimEvent[] };

  beforeEach(async () => {
    engine = new InteractionEngine();
    session = makeSession();
    await engine.init(NORMAL_REACTION_CONFIG, session);
    session.emitted.length = 0;
  });

  it('1. init seeds slider defaults and emits nothing', () => {
    expect(engine.getSliderValue('m')).toBe(2);
    expect(engine.getSliderValue('theta')).toBe(30);
    expect(session.emitted).toEqual([]);
  });

  it('2. handleSliderChange updates getSliderValue', () => {
    engine.handleSliderChange('theta', 60);
    expect(engine.getSliderValue('theta')).toBe(60);
  });

  it('3. Emit order is PHYSICS_COMPUTED then SLIDER_CHANGE', () => {
    engine.handleSliderChange('theta', 45);
    expect(session.emitted[0].type).toBe('PHYSICS_COMPUTED');
    expect(session.emitted[1].type).toBe('SLIDER_CHANGE');
  });

  it('4. PHYSICS_COMPUTED carries conceptId and non-empty forces array', () => {
    engine.handleSliderChange('theta', 45);
    const physics = session.emitted.find((e) => e.type === 'PHYSICS_COMPUTED');
    expect(physics).toBeDefined();
    if (physics && physics.type === 'PHYSICS_COMPUTED') {
      expect(physics.conceptId).toBe('normal_reaction');
      expect(physics.forces.length).toBeGreaterThan(0);
      expect(typeof physics.forces[0].magnitude).toBe('number');
    }
  });

  it('5. handleSliderChange merges all current sliders (not just the changed one)', () => {
    // With m=2, theta=45 → N = 2 * 9.8 * cos(45°) ≈ 13.86
    engine.handleSliderChange('theta', 45);
    const physics = session.emitted.find((e) => e.type === 'PHYSICS_COMPUTED');
    if (physics && physics.type === 'PHYSICS_COMPUTED') {
      const N = physics.forces.find((f) => f.id === 'normal');
      expect(N).toBeDefined();
      expect(N!.magnitude).toBeCloseTo(2 * 9.8 * Math.cos((45 * Math.PI) / 180), 1);
    }
  });

  it('6. Unknown conceptId → no PHYSICS_COMPUTED but SLIDER_CHANGE still emitted', async () => {
    const eng = new InteractionEngine();
    const sess = makeSession();
    await eng.init({
      conceptId: 'nonexistent_concept',
      sliders: { x: { min: 0, max: 1, step: 0.1, default: 0.5 } },
    }, sess);
    sess.emitted.length = 0;

    eng.handleSliderChange('x', 0.8);
    expect(sess.emitted.find((e) => e.type === 'PHYSICS_COMPUTED')).toBeUndefined();
    expect(sess.emitted.find((e) => e.type === 'SLIDER_CHANGE')).toBeDefined();
  });

  it('7. getSliderValues returns frozen object', () => {
    const snapshot = engine.getSliderValues();
    expect(Object.isFrozen(snapshot)).toBe(true);
  });

  it('8. handleHotspotTap emits HOTSPOT_TAP and sets activeHotspot', () => {
    engine.handleHotspotTap('block');
    expect(engine.getActiveHotspot()).toBe('block');
    const tap = session.emitted.find((e) => e.type === 'HOTSPOT_TAP');
    expect(tap).toEqual({ type: 'HOTSPOT_TAP', primitive_id: 'block' });
  });

  it('9. STATE_ENTER resets slider values to defaults', () => {
    engine.handleSliderChange('theta', 75);
    engine.handleSliderChange('m', 8);
    expect(engine.getSliderValue('theta')).toBe(75);
    engine.onEvent({ type: 'STATE_ENTER', state: 'STATE_2' });
    expect(engine.getSliderValue('theta')).toBe(30);
    expect(engine.getSliderValue('m')).toBe(2);
  });

  it('10. reset() clears state cleanly (sliders back to defaults, hotspot cleared)', async () => {
    engine.handleSliderChange('theta', 60);
    engine.handleHotspotTap('block');
    await engine.reset();
    expect(engine.getSliderValue('theta')).toBe(30);
    expect(engine.getActiveHotspot()).toBeNull();
  });
});
