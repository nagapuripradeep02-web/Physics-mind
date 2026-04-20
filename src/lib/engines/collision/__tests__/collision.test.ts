import { describe, it, expect, beforeEach } from 'vitest';
import { CollisionEngine } from '../index';
import type { AABB } from '../index';
import type { SimSession } from '../../types';

const mockSession: SimSession = {
  sessionId: 'test',
  emit: () => {},
  on: () => {},
  off: () => {},
  getEngine: () => null,
};

describe('CollisionEngine', () => {
  let engine: CollisionEngine;

  beforeEach(async () => {
    engine = new CollisionEngine();
    await engine.init({}, mockSession);
  });

  // checkOverlap tests
  it('no overlap → returns 0', () => {
    const a: AABB = { x: 0, y: 0, w: 50, h: 50 };
    const b: AABB = { x: 100, y: 100, w: 50, h: 50 };
    expect(engine.checkOverlap(a, b)).toBe(0);
  });

  it('full overlap → returns 1', () => {
    const a: AABB = { x: 0, y: 0, w: 100, h: 100 };
    const b: AABB = { x: 0, y: 0, w: 100, h: 100 };
    expect(engine.checkOverlap(a, b)).toBe(1);
  });

  it('partial overlap → returns correct percentage', () => {
    const a: AABB = { x: 0, y: 0, w: 100, h: 100 };
    const b: AABB = { x: 50, y: 0, w: 100, h: 100 };
    // Overlap: 50*100 = 5000; min area: 10000; ratio: 0.5
    expect(engine.checkOverlap(a, b)).toBe(0.5);
  });

  // detectCollisions tests
  it('non-overlapping boxes → empty pairs', () => {
    const boxes: AABB[] = [
      { x: 0, y: 0, w: 50, h: 50 },
      { x: 100, y: 100, w: 50, h: 50 },
    ];
    expect(engine.detectCollisions(boxes)).toEqual([]);
  });

  it('overlapping boxes → returns collision pair', () => {
    const boxes: AABB[] = [
      { x: 0, y: 0, w: 100, h: 100 },
      { x: 50, y: 50, w: 100, h: 100 },
    ];
    const pairs = engine.detectCollisions(boxes);
    expect(pairs).toHaveLength(1);
    expect(pairs[0].indexA).toBe(0);
    expect(pairs[0].indexB).toBe(1);
    expect(pairs[0].overlap).toBeGreaterThan(0);
  });

  // resolveCollisions tests
  it('<= 10% overlap → boxes unchanged', () => {
    const boxes: AABB[] = [
      { x: 0, y: 0, w: 100, h: 100 },
      { x: 95, y: 0, w: 100, h: 100 },
    ];
    // Overlap: 5*100=500; min area: 10000; ratio: 0.05 (5% < 10%)
    const pairs = engine.detectCollisions(boxes);
    const result = engine.resolveCollisions(pairs, boxes);
    expect(result[1].x).toBe(95); // unchanged
  });

  it('10-40% overlap → box B nudged right', () => {
    const boxes: AABB[] = [
      { x: 0, y: 0, w: 100, h: 100 },
      { x: 70, y: 0, w: 100, h: 100 },
    ];
    // Overlap: 30*100=3000; min area: 10000; ratio: 0.30 (between 10-40%)
    const pairs = engine.detectCollisions(boxes);
    const result = engine.resolveCollisions(pairs, boxes);
    // Box B should be nudged right by the overlap amount (30px)
    expect(result[1].x).toBe(100);
  });

  it('> 40% overlap → box shrunk when no slot manager', () => {
    const boxes: AABB[] = [
      { x: 0, y: 0, w: 100, h: 100 },
      { x: 20, y: 0, w: 100, h: 100 },
    ];
    // Overlap: 80*100=8000; min area: 10000; ratio: 0.80 (>40%)
    const pairs = engine.detectCollisions(boxes);
    const result = engine.resolveCollisions(pairs, boxes);
    // No slot manager → falls through to shrink
    expect(result[1].h).toBe(98); // shrunk by 2
  });
});
