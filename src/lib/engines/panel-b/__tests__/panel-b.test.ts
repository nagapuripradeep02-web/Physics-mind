import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PanelBEngine, type PanelBConfigInput } from '../index';
import { preprocessExpr, evalExpr, evalLabelTemplate, sampleTrace } from '../equation';
import type { SimEvent, SimSession } from '../../types';

function makeSession(initialSliders: Record<string, number> = {}): SimSession & { emitted: SimEvent[] } {
  const emitted: SimEvent[] = [];
  const interactionStub = {
    getSliderValues: () => Object.freeze({ ...initialSliders }),
  };
  return {
    sessionId: 'test-session',
    emit: (event: SimEvent) => { emitted.push(event); },
    on: () => {},
    off: () => {},
    getEngine: <T,>(id: string): T | null => {
      if (id === 'interaction') return interactionStub as unknown as T;
      return null;
    },
    emitted,
  } as SimSession & { emitted: SimEvent[] };
}

const NORMAL_REACTION_PANEL_B: PanelBConfigInput = {
  renderer: 'graph_interactive',
  x_axis: { variable: 'theta', label: 'theta', min: 0, max: 90, tick_interval: 10 },
  y_axis: { variable: 'N', label: 'N', min: 0, max: 100, tick_interval: 10 },
  traces: [{
    id: 'N_vs_theta',
    equation_expr: 'N = m * 9.8 * cos(theta * PI / 180)',
    color: '#10B981',
    label: 'N = mgcos\u03B8',
  }],
  live_dot: {
    x_variable: 'theta',
    y_expr: 'm * 9.8 * Math.cos(theta * Math.PI / 180)',
    color: '#F59E0B',
    size: 10,
    sync_with_panel_a_sliders: ['theta', 'm'],
  },
};

describe('equation helpers', () => {
  it('preprocessExpr strips LHS and Math. prefix', () => {
    expect(preprocessExpr('N = m * 9.8 * cos(theta)')).toBe('m * 9.8 * cos(theta)');
    expect(preprocessExpr('Math.cos(x) + Math.PI')).toBe('cos(x) + PI');
    expect(preprocessExpr('y = Math.cos(theta)')).toBe('cos(theta)');
  });

  it('evalExpr returns NaN on malformed input, never throws', () => {
    expect(evalExpr('not a real expr !!', {})).toBeNaN();
    expect(evalExpr('2 + 2', {})).toBe(4);
  });

  it('sampleTrace produces (x, y) pairs at tickInterval spacing', () => {
    const pts = sampleTrace('x * 2', 'x', 0, 10, 5, {});
    expect(pts).toEqual([{ x: 0, y: 0 }, { x: 5, y: 10 }, { x: 10, y: 20 }]);
  });
});

describe('PanelBEngine', () => {
  let engine: PanelBEngine;
  let session: SimSession & { emitted: SimEvent[] };

  beforeEach(async () => {
    engine = new PanelBEngine();
    session = makeSession({ m: 2, theta: 30 });
    await engine.init(NORMAL_REACTION_PANEL_B, session);
  });

  it('1. init samples trace points from x.min to x.max at tick_interval', () => {
    const pts = engine.getTracePoints('N_vs_theta');
    expect(pts).not.toBeNull();
    expect(pts!.length).toBe(10); // 0, 10, 20, ..., 90
    expect(pts![0].x).toBe(0);
    expect(pts![9].x).toBe(90);
  });

  it('2. trace equation_expr with N = LHS strips correctly; theta=0 gives mg', () => {
    const pts = engine.getTracePoints('N_vs_theta')!;
    // At theta=0, cos(0)=1, so y = m * 9.8 * 1 = 19.6 (m=2)
    expect(pts[0].y).toBeCloseTo(19.6, 1);
  });

  it('3. cos, sin, PI evaluate correctly (mathjs native)', () => {
    const pts = engine.getTracePoints('N_vs_theta')!;
    // At theta=90, cos(90°) ≈ 0, so y ≈ 0
    expect(pts[9].y).toBeCloseTo(0, 1);
  });

  it('4. live_dot y_expr with Math. prefix evaluates correctly', () => {
    engine.onEvent({ type: 'SLIDER_CHANGE', variable: 'theta', value: 60 });
    const dot = engine.getLiveDot();
    expect(dot).not.toBeNull();
    // m=2, theta=60 → y = 2 * 9.8 * cos(60°) = 9.8
    expect(dot!.y).toBeCloseTo(9.8, 1);
  });

  it('5. getLiveDot() returns null before any SLIDER_CHANGE', () => {
    expect(engine.getLiveDot()).toBeNull();
  });

  it('6. SLIDER_CHANGE on synced variable updates live dot', () => {
    engine.onEvent({ type: 'SLIDER_CHANGE', variable: 'theta', value: 45 });
    const dot = engine.getLiveDot();
    expect(dot).toEqual({
      x: 45,
      y: expect.closeTo(2 * 9.8 * Math.cos((45 * Math.PI) / 180), 3),
    });
  });

  it('7. SLIDER_CHANGE on non-synced variable leaves dot unchanged', () => {
    engine.onEvent({ type: 'SLIDER_CHANGE', variable: 'theta', value: 45 });
    const before = engine.getLiveDot();
    engine.onEvent({ type: 'SLIDER_CHANGE', variable: 'unrelated_var', value: 99 });
    expect(engine.getLiveDot()).toEqual(before);
  });

  it('8. SLIDER_CHANGE on synced var m updates y but x stays on current theta', () => {
    engine.onEvent({ type: 'SLIDER_CHANGE', variable: 'theta', value: 30 });
    engine.onEvent({ type: 'SLIDER_CHANGE', variable: 'm', value: 5 });
    const dot = engine.getLiveDot();
    expect(dot!.x).toBe(30); // x stays on theta
    expect(dot!.y).toBeCloseTo(5 * 9.8 * Math.cos((30 * Math.PI) / 180), 1);
  });

  it('9. Malformed equation → no throw, previous dot retained', async () => {
    const engBad = new PanelBEngine();
    const sessBad = makeSession({ m: 2, theta: 30 });
    await engBad.init({
      ...NORMAL_REACTION_PANEL_B,
      live_dot: { ...(NORMAL_REACTION_PANEL_B.live_dot as Record<string, unknown>), y_expr: 'm * ((' },
    }, sessBad);

    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    expect(() => engBad.onEvent({ type: 'SLIDER_CHANGE', variable: 'theta', value: 30 })).not.toThrow();
    expect(engBad.getLiveDot()).toBeNull(); // malformed → dot not set (was null)
    warnSpy.mockRestore();
  });

  it('10b. STATE_ENTER resets live dot so stale values from a prior state do not leak', () => {
    engine.onEvent({ type: 'SLIDER_CHANGE', variable: 'theta', value: 60 });
    expect(engine.getLiveDot()).not.toBeNull();
    engine.onEvent({ type: 'STATE_ENTER', state: 'STATE_2' });
    expect(engine.getLiveDot()).toBeNull();
  });

  it('10. Config without live_dot → getLiveDot() returns null forever; traces still render', async () => {
    const engNoDot = new PanelBEngine();
    const sessNoDot = makeSession({ m: 2, theta: 30 });
    const { live_dot: _omit, ...noDotConfig } = NORMAL_REACTION_PANEL_B;
    await engNoDot.init(noDotConfig, sessNoDot);

    expect(engNoDot.getLiveDot()).toBeNull();
    engNoDot.onEvent({ type: 'SLIDER_CHANGE', variable: 'theta', value: 45 });
    expect(engNoDot.getLiveDot()).toBeNull();
    expect(engNoDot.getTracePoints('N_vs_theta')).not.toBeNull();
  });

  it('11. Equation trace points do NOT change on SLIDER_CHANGE (backward compat lock)', () => {
    const before = engine.getTracePoints('N_vs_theta')!.map((p) => ({ ...p }));
    engine.onEvent({ type: 'SLIDER_CHANGE', variable: 'theta', value: 60 });
    engine.onEvent({ type: 'SLIDER_CHANGE', variable: 'm', value: 5 });
    const after = engine.getTracePoints('N_vs_theta')!;
    expect(after).toEqual(before);
  });
});

describe('evalLabelTemplate', () => {
  it('substitutes a simple expression token', () => {
    expect(evalLabelTemplate('m = {m} kg', { m: 3 })).toBe('m = 3 kg');
  });

  it('handles trailing .toFixed(n) by post-eval formatting', () => {
    const r = evalLabelTemplate('|F| = {sqrt(H*H + V*V).toFixed(1)} N', { H: 3, V: 4 });
    expect(r).toBe('|F| = 5.0 N');
  });

  it('preserves literal text outside {} tokens', () => {
    expect(evalLabelTemplate('x = {a + b} (units)', { a: 2, b: 3 })).toBe('x = 5 (units)');
  });

  it('returns empty string for malformed token, does not throw', () => {
    expect(() => evalLabelTemplate('broken {((} here', { a: 1 })).not.toThrow();
    expect(evalLabelTemplate('broken {((} here', { a: 1 })).toBe('broken  here');
  });
});

describe('PanelBEngine — parametric_arc trace', () => {
  let engine: PanelBEngine;
  let session: SimSession & { emitted: SimEvent[] };

  const CONFIG: PanelBConfigInput = {
    x_axis: { variable: 'f', label: 'friction', min: 0, max: 60, tick_interval: 10 },
    y_axis: { variable: 'N', label: 'normal', min: 0, max: 60, tick_interval: 10 },
    traces: [{
      id: 'constant_F_arc',
      type: 'parametric_arc',
      F_value_expr: 'sqrt(N*N + f*f)',
      color: '#EF4444',
      label: 'F circle',
      style: 'dashed',
    }],
  };

  beforeEach(async () => {
    engine = new PanelBEngine();
    session = makeSession({ N: 3, f: 4 });
    await engine.init(CONFIG, session);
  });

  it('12. init produces 41 sampled points on a quarter-circle of radius F', () => {
    const pts = engine.getTracePoints('constant_F_arc');
    expect(pts).not.toBeNull();
    expect(pts!.length).toBe(41);
  });

  it('13. all arc points satisfy x² + y² ≈ F² (F=5 at defaults)', () => {
    const pts = engine.getTracePoints('constant_F_arc')!;
    for (const p of pts) {
      expect(p.x * p.x + p.y * p.y).toBeCloseTo(25, 2);
    }
  });

  it('14. SLIDER_CHANGE on N rescales the arc radius', () => {
    const before = engine.getTracePoints('constant_F_arc')!.map((p) => ({ ...p }));
    engine.onEvent({ type: 'SLIDER_CHANGE', variable: 'N', value: 30 });
    const after = engine.getTracePoints('constant_F_arc')!;
    expect(after).not.toEqual(before);
    // New F = sqrt(30² + 4²) ≈ 30.27
    const expectedF = Math.sqrt(30 * 30 + 4 * 4);
    expect(after[0].x * after[0].x + after[0].y * after[0].y).toBeCloseTo(expectedF * expectedF, 1);
  });
});

describe('PanelBEngine — vector_from_origin trace', () => {
  let engine: PanelBEngine;
  let session: SimSession & { emitted: SimEvent[] };

  const CONFIG: PanelBConfigInput = {
    x_axis: { variable: 'H', label: 'horizontal', min: 0, max: 100, tick_interval: 10 },
    y_axis: { variable: 'V', label: 'vertical', min: 0, max: 120, tick_interval: 10 },
    traces: [{
      id: 'hinge_vector',
      type: 'vector_from_origin',
      x_expr: 'F_ext',
      y_expr: 'W',
      color: '#8B5CF6',
      label: 'hinge',
      label_expr: '|F| = {sqrt(F_ext*F_ext + W*W).toFixed(1)} N',
      line_width: 3,
    }],
  };

  beforeEach(async () => {
    engine = new PanelBEngine();
    session = makeSession({ F_ext: 6, W: 8 });
    await engine.init(CONFIG, session);
  });

  it('15. init produces exactly 2 points: origin and (F_ext, W)', () => {
    const pts = engine.getTracePoints('hinge_vector')!;
    expect(pts.length).toBe(2);
    expect(pts[0]).toEqual({ x: 0, y: 0 });
    expect(pts[1]).toEqual({ x: 6, y: 8 });
  });

  it('16. SLIDER_CHANGE on F_ext moves the vector tip', () => {
    engine.onEvent({ type: 'SLIDER_CHANGE', variable: 'F_ext', value: 50 });
    const pts = engine.getTracePoints('hinge_vector')!;
    expect(pts[1].x).toBe(50);
    expect(pts[1].y).toBe(8);
  });

  it('17. getTraceLabel evaluates label_expr against current sliders', () => {
    // defaults: F_ext=6, W=8 → sqrt(36+64) = 10.0
    expect(engine.getTraceLabel('hinge_vector')).toBe('|F| = 10.0 N');
    engine.onEvent({ type: 'SLIDER_CHANGE', variable: 'F_ext', value: 3 });
    engine.onEvent({ type: 'SLIDER_CHANGE', variable: 'W', value: 4 });
    expect(engine.getTraceLabel('hinge_vector')).toBe('|F| = 5.0 N');
  });
});

describe('PanelBEngine — horizontal trace', () => {
  let engine: PanelBEngine;
  let session: SimSession & { emitted: SimEvent[] };

  const CONFIG: PanelBConfigInput = {
    x_axis: { variable: 'm1', label: 'm1', min: 0.5, max: 5, tick_interval: 0.5 },
    y_axis: { variable: 'T', label: 'tension', min: 0, max: 50, tick_interval: 5 },
    traces: [{
      id: 'm2g_reference',
      type: 'horizontal',
      value_expr: 'm2 * 9.8',
      color: '#F59E0B',
      label: 'm2g',
      label_expr: 'm₂g = {(m2*9.8).toFixed(1)} N',
      style: 'dashed',
    }],
  };

  beforeEach(async () => {
    engine = new PanelBEngine();
    session = makeSession({ m2: 2 });
    await engine.init(CONFIG, session);
  });

  it('18. init produces 2 points at y = value_expr spanning x-axis range', () => {
    const pts = engine.getTracePoints('m2g_reference')!;
    expect(pts.length).toBe(2);
    expect(pts[0]).toEqual({ x: 0.5, y: 19.6 });
    expect(pts[1]).toEqual({ x: 5, y: 19.6 });
  });

  it('19. SLIDER_CHANGE on m2 re-evaluates the horizontal y', () => {
    engine.onEvent({ type: 'SLIDER_CHANGE', variable: 'm2', value: 3 });
    const pts = engine.getTracePoints('m2g_reference')!;
    expect(pts[0].y).toBeCloseTo(29.4, 1);
    expect(pts[1].y).toBeCloseTo(29.4, 1);
  });

  it('20. getTraceLabel evaluates label_expr with toFixed formatting', () => {
    expect(engine.getTraceLabel('m2g_reference')).toBe('m₂g = 19.6 N');
    engine.onEvent({ type: 'SLIDER_CHANGE', variable: 'm2', value: 5 });
    expect(engine.getTraceLabel('m2g_reference')).toBe('m₂g = 49.0 N');
  });
});
