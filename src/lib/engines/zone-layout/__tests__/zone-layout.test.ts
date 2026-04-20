import { describe, it, expect, beforeEach } from 'vitest';
import { ZoneLayoutEngine, SlotManager } from '../index';
import type { SimSession } from '../../types';

const mockSession: SimSession = {
  sessionId: 'test',
  emit: () => {},
  on: () => {},
  off: () => {},
  getEngine: () => null,
};

describe('ZoneLayoutEngine', () => {
  let engine: ZoneLayoutEngine;

  beforeEach(async () => {
    engine = new ZoneLayoutEngine();
    await engine.init({}, mockSession);
  });

  it('resolveZone returns MAIN_ZONE rect', () => {
    const zone = engine.resolveZone('MAIN_ZONE');
    expect(zone).toEqual({ x: 30, y: 80, w: 430, h: 380 });
  });

  it('resolveZone returns null for unknown zone', () => {
    expect(engine.resolveZone('UNKNOWN')).toBeNull();
  });

  it('resolveZonePoint returns MAIN_ZONE center', () => {
    const pt = engine.resolveZonePoint('MAIN_ZONE', 'center');
    expect(pt).toEqual({ x: 245, y: 270 });
  });

  it('resolveZonePoint returns CALLOUT_ZONE_R top_left', () => {
    const pt = engine.resolveZonePoint('CALLOUT_ZONE_R', 'top_left');
    expect(pt).toEqual({ x: 475, y: 80 });
  });

  it('resolveZonePoint returns FORMULA_ZONE center', () => {
    const pt = engine.resolveZonePoint('FORMULA_ZONE', 'center');
    // FORMULA_ZONE: { x: 475, y: 290, w: 255, h: 170 }
    // center: x=475+127.5=602.5, y=290+85=375
    expect(pt).toEqual({ x: 602.5, y: 375 });
  });

  it('resolveZonePoint returns null for unknown sub-anchor', () => {
    expect(engine.resolveZonePoint('MAIN_ZONE', 'nonsense')).toBeNull();
  });
});

describe('SlotManager', () => {
  let manager: SlotManager;

  beforeEach(() => {
    // CALLOUT_ZONE_R: { x: 475, y: 80, w: 255, h: 200 }
    manager = new SlotManager({ x: 475, y: 80, w: 255, h: 200 });
  });

  it('allocates slot 1 with correct rect', () => {
    const slot = manager.allocateSlot();
    expect(slot).toEqual({ x: 475, y: 80, w: 255, h: 66 });
  });

  it('allocates slot 2 below slot 1', () => {
    manager.allocateSlot(); // slot 1
    const slot2 = manager.allocateSlot();
    expect(slot2).toEqual({ x: 475, y: 146, w: 255, h: 66 });
  });

  it('allocates all 3 slots successfully', () => {
    const s1 = manager.allocateSlot();
    const s2 = manager.allocateSlot();
    const s3 = manager.allocateSlot();
    expect(s1).not.toBeNull();
    expect(s2).not.toBeNull();
    expect(s3).not.toBeNull();
    // Slots are vertically stacked
    expect(s2!.y).toBeGreaterThan(s1!.y);
    expect(s3!.y).toBeGreaterThan(s2!.y);
  });

  it('returns null on 4th allocation', () => {
    manager.allocateSlot();
    manager.allocateSlot();
    manager.allocateSlot();
    expect(manager.allocateSlot()).toBeNull();
  });

  it('resetSlots then re-allocate works', () => {
    manager.allocateSlot();
    manager.allocateSlot();
    manager.allocateSlot();
    expect(manager.allocateSlot()).toBeNull();

    manager.resetSlots();

    const slot = manager.allocateSlot();
    expect(slot).toEqual({ x: 475, y: 80, w: 255, h: 66 });
  });
});
