import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ScaleEngine } from '../index';
import type { SimSession } from '../../types';
import { ZoneLayoutEngine } from '../../zone-layout';

function createMockSession(zoneLayout: ZoneLayoutEngine): SimSession {
  return {
    sessionId: 'test',
    emit: vi.fn(),
    on: () => {},
    off: () => {},
    getEngine: (id: string) => {
      if (id === 'zone-layout') return zoneLayout as unknown;
      return null;
    },
  } as unknown as SimSession;
}

describe('ScaleEngine', () => {
  let engine: ScaleEngine;
  let zoneLayout: ZoneLayoutEngine;
  let session: SimSession;

  beforeEach(async () => {
    zoneLayout = new ZoneLayoutEngine();
    await zoneLayout.init({}, { sessionId: 'test', emit: () => {}, on: () => {}, off: () => {}, getEngine: () => null });
    session = createMockSession(zoneLayout);
    engine = new ScaleEngine();
    await engine.init({}, session);
  });

  // MAIN_ZONE.h = 380, fraction = 0.70 → available = 266

  it('computes scale for [10, 5, 3]', () => {
    engine.computeScale([10, 5, 3]);
    expect(engine.getScale()).toBeCloseTo(26.6, 1);
  });

  it('guards against [0] — uses default maxMag=10', () => {
    engine.computeScale([0]);
    expect(engine.getScale()).toBeCloseTo(26.6, 1);
  });

  it('guards against [0.001] — below threshold', () => {
    engine.computeScale([0.001]);
    expect(engine.getScale()).toBeCloseTo(26.6, 1);
  });

  it('computes scale for [100]', () => {
    engine.computeScale([100]);
    expect(engine.getScale()).toBeCloseTo(2.66, 1);
  });

  it('computes scale for [1, 1, 1]', () => {
    engine.computeScale([1, 1, 1]);
    expect(engine.getScale()).toBeCloseTo(266, 0);
  });

  it('guards against empty array', () => {
    engine.computeScale([]);
    expect(engine.getScale()).toBeCloseTo(26.6, 1);
  });

  it('getScale returns 1 before any computeScale call', async () => {
    const freshEngine = new ScaleEngine();
    await freshEngine.init({}, session);
    expect(freshEngine.getScale()).toBe(1);
  });

  it('getScale returns computed value after computeScale', () => {
    engine.computeScale([10]);
    expect(engine.getScale()).toBeCloseTo(26.6, 1);
  });

  it('recompute with new values updates state', () => {
    engine.computeScale([10]);
    const first = engine.getScale();
    engine.computeScale([50]);
    const second = engine.getScale();
    expect(second).not.toEqual(first);
    expect(second).toBeCloseTo(5.32, 1);
  });

  it('largest force renders at ~70% of MAIN_ZONE height', () => {
    engine.computeScale([10, 5, 3]);
    const scale = engine.getScale();
    const largestArrowPx = 10 * scale;
    const expectedPx = 380 * 0.70;
    expect(largestArrowPx).toBeCloseTo(expectedPx, 1);
  });
});
