import { describe, it, expect, vi } from 'vitest';
import { ZoneLayoutEngine } from '../zone-layout';
import { AnchorResolverEngine } from '../anchor-resolver';
import { ScaleEngine } from '../scale';
import { InteractionEngine } from '../interaction';
import { PanelBEngine, type PanelBConfigInput } from '../panel-b';
import { SimSession } from '../sim-session';
import type { SimSession as ISimSession, SimEvent } from '../types';

function createSession(engines: Map<string, unknown>): ISimSession {
  return {
    sessionId: 'test',
    emit: vi.fn(),
    on: () => {},
    off: () => {},
    getEngine: (id: string) => (engines.get(id) ?? null) as never,
  };
}

describe('Engine Integration', () => {
  it('boots physics + zone-layout + anchor-resolver + scale in dependency order', async () => {
    const booted: string[] = [];

    const zoneLayout = new ZoneLayoutEngine();
    const engineMap = new Map<string, unknown>();

    // Boot zone-layout first (no deps)
    await zoneLayout.init({}, createSession(engineMap));
    engineMap.set('zone-layout', zoneLayout);
    booted.push('zone-layout');

    // Boot anchor-resolver (depends on zone-layout)
    const anchorResolver = new AnchorResolverEngine();
    await anchorResolver.init({}, createSession(engineMap));
    engineMap.set('anchor-resolver', anchorResolver);
    booted.push('anchor-resolver');

    // Boot scale (depends on zone-layout + physics)
    const scaleEngine = new ScaleEngine();
    await scaleEngine.init({}, createSession(engineMap));
    engineMap.set('scale', scaleEngine);
    booted.push('scale');

    expect(booted).toEqual(['zone-layout', 'anchor-resolver', 'scale']);
  });

  it('anchor resolver resolves MAIN_ZONE.center after zone-layout boot', async () => {
    const zoneLayout = new ZoneLayoutEngine();
    const engineMap = new Map<string, unknown>();
    await zoneLayout.init({}, createSession(engineMap));
    engineMap.set('zone-layout', zoneLayout);

    const anchorResolver = new AnchorResolverEngine();
    await anchorResolver.init({}, createSession(engineMap));

    expect(anchorResolver.resolve('MAIN_ZONE.center')).toEqual({ x: 245, y: 270 });
  });

  it('scale engine computes unitToPx from physics force magnitudes', async () => {
    const zoneLayout = new ZoneLayoutEngine();
    const engineMap = new Map<string, unknown>();
    await zoneLayout.init({}, createSession(engineMap));
    engineMap.set('zone-layout', zoneLayout);

    const scaleEngine = new ScaleEngine();
    await scaleEngine.init({}, createSession(engineMap));
    scaleEngine.computeScale([10, 5, 3]);

    // MAIN_ZONE.h=380, 380*0.70/10 = 26.6
    expect(scaleEngine.getScale()).toBeCloseTo(26.6, 1);
  });

  it('PHYSICS_COMPUTED event → scale updated → SCALE_UPDATED emitted', async () => {
    const zoneLayout = new ZoneLayoutEngine();
    const engineMap = new Map<string, unknown>();
    await zoneLayout.init({}, createSession(engineMap));
    engineMap.set('zone-layout', zoneLayout);

    const session = createSession(engineMap);
    const scaleEngine = new ScaleEngine();
    await scaleEngine.init({}, session);

    const event: SimEvent = {
      type: 'PHYSICS_COMPUTED',
      conceptId: 'normal_reaction',
      forces: [
        { id: 'N', magnitude: 20 },
        { id: 'W', magnitude: 19.6 },
      ],
    };
    scaleEngine.onEvent(event);

    expect(scaleEngine.getScale()).toBeCloseTo(13.3, 1); // 380*0.70/20
    expect(session.emit).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'SCALE_UPDATED', unitToPx: expect.any(Number), maxMagnitude: 20 }),
    );
  });

  it('slider change triggers scale recomputation', async () => {
    const zoneLayout = new ZoneLayoutEngine();
    const engineMap = new Map<string, unknown>();
    await zoneLayout.init({}, createSession(engineMap));
    engineMap.set('zone-layout', zoneLayout);

    const session = createSession(engineMap);
    const scaleEngine = new ScaleEngine();
    await scaleEngine.init({}, session);

    // First physics event
    scaleEngine.onEvent({
      type: 'PHYSICS_COMPUTED',
      conceptId: 'normal_reaction',
      forces: [{ id: 'N', magnitude: 10 }],
    });
    const firstScale = scaleEngine.getScale();

    // Slider changes → new physics event with different magnitudes
    scaleEngine.onEvent({
      type: 'PHYSICS_COMPUTED',
      conceptId: 'normal_reaction',
      forces: [{ id: 'N', magnitude: 50 }],
    });
    const secondScale = scaleEngine.getScale();

    expect(secondScale).toBeLessThan(firstScale); // larger force → smaller scale
  });

  it('zone-based primitive resolves correctly through full pipeline', async () => {
    const zoneLayout = new ZoneLayoutEngine();
    const engineMap = new Map<string, unknown>();
    await zoneLayout.init({}, createSession(engineMap));
    engineMap.set('zone-layout', zoneLayout);

    const anchorResolver = new AnchorResolverEngine();
    await anchorResolver.init(
      { bodies: { block: { x: 100, y: 200, w: 40, h: 60 } } },
      createSession(engineMap),
    );

    // Verify zone-based resolution
    const zonePoint = anchorResolver.resolve('FORMULA_ZONE.center');
    expect(zonePoint).toEqual({ x: 602.5, y: 375 });

    // Verify body-based resolution
    const bodyPoint = anchorResolver.resolve('block.bottom');
    expect(bodyPoint).toEqual({ x: 120, y: 260 });

    // Verify offset
    const offset = anchorResolver.applyOffset(bodyPoint, { dir: 'down', gap: 20 });
    expect(offset).toEqual({ x: 120, y: 280 });
  });

  it('7. full pipeline: slider change → physics → scale → panel B live dot moves', async () => {
    const session = new SimSession('integration-week4');

    // Zone layout needed because Scale Engine reads MAIN_ZONE height at init
    session.register({
      id: 'zone-layout',
      tier: 'B',
      dependencies: [],
      factory: () => new ZoneLayoutEngine(),
    });
    session.register({
      id: 'scale',
      tier: 'B',
      dependencies: ['zone-layout'],
      factory: () => new ScaleEngine(),
    });
    session.register({
      id: 'interaction',
      tier: 'D',
      dependencies: ['scale'],
      factory: () => new InteractionEngine(),
    });
    session.register({
      id: 'panel-b',
      tier: 'D',
      dependencies: ['interaction'],
      factory: () => new PanelBEngine(),
    });

    const panelBConfig: PanelBConfigInput = {
      renderer: 'graph_interactive',
      x_axis: { variable: 'theta', label: 'theta', min: 0, max: 90, tick_interval: 10 },
      y_axis: { variable: 'N', label: 'N', min: 0, max: 100, tick_interval: 10 },
      traces: [{ id: 'N_vs_theta', equation_expr: 'N = m * 9.8 * cos(theta * PI / 180)', color: '#10B981', label: 'N' }],
      live_dot: {
        x_variable: 'theta',
        y_expr: 'm * 9.8 * Math.cos(theta * Math.PI / 180)',
        color: '#F59E0B',
        size: 10,
        sync_with_panel_a_sliders: ['theta', 'm'],
      },
    };

    // Register observer BEFORE boot so it runs ahead of engine handlers
    // for every emit (preserves causal order in observed[])
    const observed: SimEvent[] = [];
    session.on('*' as SimEvent['type'], (e) => { observed.push(e); });

    await session.boot({
      'zone-layout': {},
      scale: {},
      interaction: {
        conceptId: 'normal_reaction',
        sliders: {
          m: { min: 0.5, max: 10, step: 0.5, default: 2 },
          theta: { min: 0, max: 90, step: 5, default: 30 },
        },
      },
      'panel-b': panelBConfig,
    });
    observed.length = 0; // ignore any boot-time emissions

    const scale = session.getEngine<ScaleEngine>('scale')!;
    const interaction = session.getEngine<InteractionEngine>('interaction')!;
    const panelB = session.getEngine<PanelBEngine>('panel-b')!;

    const scaleBefore = scale.getScale();

    const t0 = performance.now();
    interaction.handleSliderChange('theta', 60);
    const elapsed = performance.now() - t0;

    expect(elapsed).toBeLessThan(50); // §21 < 50ms budget

    // Scale recomputed via PHYSICS_COMPUTED → SCALE_UPDATED chain
    expect(scale.getScale()).not.toBe(scaleBefore);

    // Panel B live dot: m=2, theta=60 → y = 2*9.8*cos(60°) = 9.8
    const dot = panelB.getLiveDot();
    expect(dot).not.toBeNull();
    expect(dot!.x).toBe(60);
    expect(dot!.y).toBeCloseTo(9.8, 1);

    // Event ordering: PHYSICS_COMPUTED → SCALE_UPDATED → SLIDER_CHANGE
    const phys = observed.findIndex((e) => e.type === 'PHYSICS_COMPUTED');
    const scaleUpd = observed.findIndex((e) => e.type === 'SCALE_UPDATED');
    const slider = observed.findIndex((e) => e.type === 'SLIDER_CHANGE');
    expect(phys).toBeGreaterThanOrEqual(0);
    expect(scaleUpd).toBeGreaterThan(phys);
    expect(slider).toBeGreaterThan(scaleUpd);

    await session.destroy();
  });
});
