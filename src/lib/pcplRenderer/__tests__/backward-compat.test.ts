import { describe, it, expect } from 'vitest';
import { resolvePositions, computeSurfaceEndpoints } from '../index';
import type { PrimitiveSpec, LabelSpec, BodySpec, SurfaceSpec } from '../types';
import { ZoneLayoutEngine } from '../../engines/zone-layout';
import { AnchorResolverEngine } from '../../engines/anchor-resolver';
import { ScaleEngine } from '../../engines/scale';
import type { SimSession } from '../../engines/types';

const mockSession: SimSession = {
  sessionId: 'test',
  emit: () => {},
  on: () => {},
  off: () => {},
  getEngine: () => null,
};

describe('resolvePositions — backward compatibility', () => {
  it('primitives with position:{x,y} and NO engines → unchanged', () => {
    const prims: PrimitiveSpec[] = [
      { type: 'label', text: 'hello', position: { x: 100, y: 200 } } as LabelSpec,
    ];
    const result = resolvePositions(prims);
    expect(result).toEqual(prims);
  });

  it('primitives with position:{x,y} WITH engines → position wins over zone', async () => {
    const zoneLayout = new ZoneLayoutEngine();
    await zoneLayout.init({}, mockSession);

    const prims: PrimitiveSpec[] = [
      { type: 'label', text: 'hello', position: { x: 100, y: 200 }, zone: 'MAIN_ZONE' } as LabelSpec & { zone: string },
    ];
    const result = resolvePositions(prims, { zoneLayout });
    // position:{x,y} takes priority, so zone is ignored
    expect((result[0] as LabelSpec).position).toEqual({ x: 100, y: 200 });
  });

  it('resolvePositions with no engines → identity function', () => {
    const prims: PrimitiveSpec[] = [
      { type: 'body', shape: 'rect', position: { x: 50, y: 60 } } as BodySpec,
    ];
    const result = resolvePositions(prims);
    expect(result).toEqual(prims);
  });

  it('resolvePositions with zone field → resolves to {x, y} position', async () => {
    const zoneLayout = new ZoneLayoutEngine();
    await zoneLayout.init({}, mockSession);

    const prims: PrimitiveSpec[] = [
      { type: 'label', text: 'hello', zone: 'MAIN_ZONE' } as LabelSpec & { zone: string },
    ];
    const result = resolvePositions(prims, { zoneLayout });
    // MAIN_ZONE center: {x: 245, y: 270}
    expect((result[0] as LabelSpec).position).toEqual({ x: 245, y: 270 });
  });

  it('resolvePositions with anchor field → resolves via anchor resolver', async () => {
    const zoneLayout = new ZoneLayoutEngine();
    await zoneLayout.init({}, mockSession);

    const anchorResolver = new AnchorResolverEngine();
    await anchorResolver.init(
      { bodies: { block: { x: 100, y: 200, w: 40, h: 60 } } },
      { ...mockSession, getEngine: (id: string) => (id === 'zone-layout' ? zoneLayout as unknown : null) as never },
    );

    const prims: PrimitiveSpec[] = [
      { type: 'label', text: 'here', anchor: 'block.center' } as LabelSpec & { anchor: string },
    ];
    const result = resolvePositions(prims, { zoneLayout, anchorResolver });
    expect((result[0] as LabelSpec).position).toEqual({ x: 120, y: 230 });
  });

  it('resolvePositions with anchor + offset', async () => {
    const zoneLayout = new ZoneLayoutEngine();
    await zoneLayout.init({}, mockSession);

    const anchorResolver = new AnchorResolverEngine();
    await anchorResolver.init(
      { bodies: { block: { x: 100, y: 200, w: 40, h: 60 } } },
      { ...mockSession, getEngine: (id: string) => (id === 'zone-layout' ? zoneLayout as unknown : null) as never },
    );

    const prims: PrimitiveSpec[] = [
      {
        type: 'label',
        text: 'offset',
        anchor: 'block.top',
        offset: { dir: 'up', gap: 10 },
      } as LabelSpec & { anchor: string; offset: { dir: 'up'; gap: number } },
    ];
    const result = resolvePositions(prims, { zoneLayout, anchorResolver });
    // block.top = {x: 120, y: 200}, offset up 10 → {x: 120, y: 190}
    expect((result[0] as LabelSpec).position).toEqual({ x: 120, y: 190 });
  });
});

describe('computeSurfaceEndpoints', () => {
  it('horizontal surface', () => {
    const spec: SurfaceSpec = { type: 'surface', orientation: 'horizontal', position: { x: 0, y: 400 }, length: 300 };
    expect(computeSurfaceEndpoints(spec)).toEqual({ x1: 0, y1: 400, x2: 300, y2: 400 });
  });

  it('vertical surface', () => {
    const spec: SurfaceSpec = { type: 'surface', orientation: 'vertical', position: { x: 100, y: 100 }, length: 200 };
    expect(computeSurfaceEndpoints(spec)).toEqual({ x1: 100, y1: 100, x2: 100, y2: 300 });
  });

  it('inclined surface at 30 degrees', () => {
    const spec: SurfaceSpec = { type: 'surface', orientation: 'inclined', angle: 30, position: { x: 0, y: 400 }, length: 200 };
    const result = computeSurfaceEndpoints(spec);
    expect(result.x1).toBe(0);
    expect(result.y1).toBe(400);
    expect(result.x2).toBeCloseTo(173.2, 0); // 200 * cos(30°)
    expect(result.y2).toBeCloseTo(300, 0);    // 400 - 200 * sin(30°)
  });
});
