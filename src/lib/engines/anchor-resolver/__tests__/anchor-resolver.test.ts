import { describe, it, expect, beforeEach } from 'vitest';
import { AnchorResolverEngine } from '../index';
import type { SimSession } from '../../types';
import { ZoneLayoutEngine } from '../../zone-layout';

function createMockSession(zoneLayout: ZoneLayoutEngine): SimSession {
  return {
    sessionId: 'test',
    emit: () => {},
    on: () => {},
    off: () => {},
    getEngine: (id: string) => (id === 'zone-layout' ? zoneLayout as unknown : null) as never,
  };
}

describe('AnchorResolverEngine', () => {
  let engine: AnchorResolverEngine;
  let zoneLayout: ZoneLayoutEngine;

  beforeEach(async () => {
    zoneLayout = new ZoneLayoutEngine();
    await zoneLayout.init({}, { sessionId: 'test', emit: () => {}, on: () => {}, off: () => {}, getEngine: () => null });

    engine = new AnchorResolverEngine();
    await engine.init(
      {
        bodies: { block: { x: 100, y: 200, w: 40, h: 60 } },
        surfaces: { floor: { x1: 0, y1: 400, x2: 400, y2: 400 } },
      },
      createMockSession(zoneLayout),
    );
  });

  // 1-3. Zone anchors
  it('resolves MAIN_ZONE.center', () => {
    expect(engine.resolve('MAIN_ZONE.center')).toEqual({ x: 245, y: 270 });
  });

  it('resolves CALLOUT_ZONE_R.top_left', () => {
    expect(engine.resolve('CALLOUT_ZONE_R.top_left')).toEqual({ x: 475, y: 80 });
  });

  it('resolves FORMULA_ZONE.center', () => {
    expect(engine.resolve('FORMULA_ZONE.center')).toEqual({ x: 602.5, y: 375 });
  });

  // 4-6. Body anchors
  it('resolves block.center', () => {
    expect(engine.resolve('block.center')).toEqual({ x: 120, y: 230 });
  });

  it('resolves block.top', () => {
    expect(engine.resolve('block.top')).toEqual({ x: 120, y: 200 });
  });

  it('resolves block.bottom', () => {
    expect(engine.resolve('block.bottom')).toEqual({ x: 120, y: 260 });
  });

  // 7-8. Surface named
  it('resolves floor.start', () => {
    expect(engine.resolve('floor.start')).toEqual({ x: 0, y: 400 });
  });

  it('resolves floor.mid', () => {
    expect(engine.resolve('floor.mid')).toEqual({ x: 200, y: 400 });
  });

  // 9. Surface parametric
  it('resolves on_surface:floor at:0.25', () => {
    const pt = engine.resolve('on_surface:floor at:0.25');
    expect(pt).toEqual({ x: 100, y: 400 });
  });

  // 10-11. Offset
  it('applyOffset right', () => {
    expect(engine.applyOffset({ x: 100, y: 200 }, { dir: 'right', gap: 20 })).toEqual({ x: 120, y: 200 });
  });

  it('applyOffset up', () => {
    expect(engine.applyOffset({ x: 100, y: 200 }, { dir: 'up', gap: 15 })).toEqual({ x: 100, y: 185 });
  });

  // 12. Unknown anchor → fallback
  it('falls back to MAIN_ZONE.center for unknown anchor', () => {
    const pt = engine.resolve('completely_unknown_expression');
    expect(pt).toEqual({ x: 245, y: 270 });
  });
});
