/**
 * Engine 10: Panel B Equation Engine
 *
 * Reads panel_b_config from the concept JSON, precomputes trace points at init,
 * and updates a live dot as synced slider values change.
 *
 * Event contract:
 *   onEvent(SLIDER_CHANGE) → if variable ∈ liveDot.syncWithPanelASliders,
 *     recompute current dot from liveDot.yExpr.
 *
 * getLiveDot() returns null until the first synced SLIDER_CHANGE arrives
 * (matches CLAUDE.md §21 wording; UI can compute an initial dot from defaults).
 */

import type { Engine, SimSession, SimEvent } from '../types';
import type { InteractionEngine } from '../interaction';
import { evalExpr, evalLabelTemplate, sampleTrace } from './equation';

export interface PanelBAxis {
  variable: string;
  label: string;
  min: number;
  max: number;
  tickInterval: number;
}

type PanelBTraceStyle = 'solid' | 'dashed';

interface PanelBTraceBase {
  id: string;
  color: string;
  label: string;
  style: PanelBTraceStyle;
  lineWidth: number;
  labelExpr?: string;
}

export interface PanelBEquationTrace extends PanelBTraceBase {
  type: 'equation';
  equationExpr: string;
}

export interface PanelBParametricArcTrace extends PanelBTraceBase {
  type: 'parametric_arc';
  fValueExpr: string;
}

export interface PanelBVectorFromOriginTrace extends PanelBTraceBase {
  type: 'vector_from_origin';
  xExpr: string;
  yExpr: string;
}

export interface PanelBHorizontalTrace extends PanelBTraceBase {
  type: 'horizontal';
  valueExpr: string;
}

export type PanelBTrace =
  | PanelBEquationTrace
  | PanelBParametricArcTrace
  | PanelBVectorFromOriginTrace
  | PanelBHorizontalTrace;

const ARC_SAMPLES = 40; // produces 41 points across θ ∈ [0, π/2]

export interface PanelBLiveDot {
  xVariable: string;
  yExpr: string;
  color: string;
  size: number;
  syncWithPanelASliders: string[];
}

export interface PanelBConfig {
  renderer?: string;
  xAxis: PanelBAxis;
  yAxis: PanelBAxis;
  traces: PanelBTrace[];
  liveDot?: PanelBLiveDot;
}

/** Loose input shape accepted by init() — both camelCase and snake_case survive. */
export interface PanelBConfigInput {
  renderer?: string;
  x_axis?: Partial<Record<string, unknown>>;
  y_axis?: Partial<Record<string, unknown>>;
  xAxis?: Partial<Record<string, unknown>>;
  yAxis?: Partial<Record<string, unknown>>;
  traces?: Array<Record<string, unknown>>;
  live_dot?: Record<string, unknown>;
  liveDot?: Record<string, unknown>;
}

export interface LiveDotPosition {
  x: number;
  y: number;
}

export interface TracePoints {
  id: string;
  points: Array<{ x: number; y: number }>;
  color: string;
  style: PanelBTraceStyle;
  lineWidth: number;
}

export interface PanelBState {
  currentSliders: Record<string, number>;
  liveDot: LiveDotPosition | null;
  traceData: TracePoints[];
}

function asNumber(v: unknown, fallback: number): number {
  return typeof v === 'number' && Number.isFinite(v) ? v : fallback;
}

function asString(v: unknown, fallback: string): string {
  return typeof v === 'string' ? v : fallback;
}

function normalizeAxis(raw: Record<string, unknown> | undefined): PanelBAxis {
  const r = raw ?? {};
  return {
    variable: asString(r.variable, 'x'),
    label: asString(r.label, ''),
    min: asNumber(r.min, 0),
    max: asNumber(r.max, 1),
    tickInterval: asNumber(r.tick_interval ?? r.tickInterval, 1),
  };
}

function normalizeStyle(raw: unknown): PanelBTraceStyle {
  return raw === 'dashed' ? 'dashed' : 'solid';
}

function normalizeTrace(raw: Record<string, unknown>): PanelBTrace {
  const baseId = asString(raw.id, 'trace');
  const baseColor = asString(raw.color, '#10B981');
  const baseLabel = asString(raw.label, '');
  const style = normalizeStyle(raw.style);
  const lineWidth = asNumber(raw.line_width ?? raw.lineWidth, 2);
  const labelExpr = typeof raw.label_expr === 'string'
    ? (raw.label_expr as string)
    : typeof raw.labelExpr === 'string'
      ? (raw.labelExpr as string)
      : undefined;

  const type = asString(raw.type, 'equation');

  if (type === 'parametric_arc') {
    return {
      type: 'parametric_arc',
      id: baseId,
      color: baseColor,
      label: baseLabel,
      style,
      lineWidth,
      labelExpr,
      fValueExpr: asString(raw.F_value_expr ?? raw.f_value_expr ?? raw.fValueExpr, ''),
    };
  }

  if (type === 'vector_from_origin') {
    return {
      type: 'vector_from_origin',
      id: baseId,
      color: baseColor,
      label: baseLabel,
      style,
      lineWidth,
      labelExpr,
      xExpr: asString(raw.x_expr ?? raw.xExpr, ''),
      yExpr: asString(raw.y_expr ?? raw.yExpr, ''),
    };
  }

  if (type === 'horizontal') {
    return {
      type: 'horizontal',
      id: baseId,
      color: baseColor,
      label: baseLabel,
      style,
      lineWidth,
      labelExpr,
      valueExpr: asString(raw.value_expr ?? raw.valueExpr, ''),
    };
  }

  return {
    type: 'equation',
    id: baseId,
    color: baseColor,
    label: baseLabel,
    style,
    lineWidth,
    labelExpr,
    equationExpr: asString(raw.equation_expr ?? raw.equationExpr ?? raw.equation, ''),
  };
}

function normalizeLiveDot(raw: Record<string, unknown> | undefined): PanelBLiveDot | undefined {
  if (!raw) return undefined;
  const sync = raw.sync_with_panel_a_sliders ?? raw.syncWithPanelASliders;
  return {
    xVariable: asString(raw.x_variable ?? raw.xVariable, 'x'),
    yExpr: asString(raw.y_expr ?? raw.yExpr ?? raw.y_variable ?? '', ''),
    color: asString(raw.color, '#F59E0B'),
    size: asNumber(raw.size, 8),
    syncWithPanelASliders: Array.isArray(sync) ? (sync as unknown[]).filter((s): s is string => typeof s === 'string') : [],
  };
}

function normalizeConfig(raw: PanelBConfigInput): PanelBConfig {
  const xRaw = (raw.x_axis ?? raw.xAxis) as Record<string, unknown> | undefined;
  const yRaw = (raw.y_axis ?? raw.yAxis) as Record<string, unknown> | undefined;
  const ldRaw = (raw.live_dot ?? raw.liveDot) as Record<string, unknown> | undefined;
  return {
    renderer: raw.renderer,
    xAxis: normalizeAxis(xRaw),
    yAxis: normalizeAxis(yRaw),
    traces: (raw.traces ?? []).map(normalizeTrace),
    liveDot: normalizeLiveDot(ldRaw),
  };
}

export class PanelBEngine implements Engine<PanelBConfigInput, PanelBState> {
  readonly id = 'panel-b';
  readonly dependencies = ['physics', 'interaction'];

  private config: PanelBConfig | null = null;
  private session: SimSession | null = null;
  private state: PanelBState = { currentSliders: {}, liveDot: null, traceData: [] };

  async init(rawConfig: PanelBConfigInput, session: SimSession): Promise<PanelBState> {
    this.session = session;
    this.config = normalizeConfig(rawConfig);

    const interaction = session.getEngine<InteractionEngine>('interaction');
    const defaults: Record<string, number> = interaction
      ? { ...interaction.getSliderValues() }
      : {};
    this.state = {
      currentSliders: defaults,
      liveDot: null,
      traceData: this.precomputeTraces(defaults),
    };
    return this.state;
  }

  async reset(): Promise<void> {
    if (!this.config) {
      this.state = { currentSliders: {}, liveDot: null, traceData: [] };
      return;
    }
    const interaction = this.session?.getEngine<InteractionEngine>('interaction');
    const defaults: Record<string, number> = interaction
      ? { ...interaction.getSliderValues() }
      : {};
    this.state = {
      currentSliders: defaults,
      liveDot: null,
      traceData: this.precomputeTraces(defaults),
    };
  }

  async destroy(): Promise<void> {
    this.config = null;
    this.session = null;
    this.state = { currentSliders: {}, liveDot: null, traceData: [] };
  }

  getAllTraces(): ReadonlyArray<TracePoints> {
    return this.state.traceData;
  }

  getTracePoints(traceId: string): ReadonlyArray<{ x: number; y: number }> | null {
    const trace = this.state.traceData.find((t) => t.id === traceId);
    return trace ? trace.points : null;
  }

  getLiveDot(): LiveDotPosition | null {
    return this.state.liveDot;
  }

  /**
   * Evaluate a trace's labelExpr (if any) against current slider values.
   * Returns the static `label` field when no labelExpr is declared.
   * Caller decides when to refresh (typically on each Plotly re-render).
   */
  getTraceLabel(traceId: string): string {
    if (!this.config) return '';
    const trace = this.config.traces.find((t) => t.id === traceId);
    if (!trace) return '';
    if (trace.labelExpr) {
      return evalLabelTemplate(trace.labelExpr, this.state.currentSliders);
    }
    return trace.label;
  }

  onEvent(event: SimEvent): void {
    if (event.type === 'STATE_ENTER') {
      // Live dot is state-scoped — stale values from a previous state must not leak.
      this.state.liveDot = null;
      return;
    }

    if (event.type !== 'SLIDER_CHANGE') return;
    if (!this.config) return;

    this.state.currentSliders[event.variable] = event.value;

    // Re-sample non-equation traces on every slider change. Equation traces
    // are static after init (they sample y=f(x) across the axis at fixed
    // tick spacing — slider changes move only the liveDot). Backward compat
    // for all pre-existing concept JSONs is locked in by this split.
    const hasDynamicTraces = this.config.traces.some((t) => t.type !== 'equation');
    if (hasDynamicTraces) {
      this.state.traceData = this.precomputeTraces(this.state.currentSliders);
    }

    // LiveDot update (unchanged contract — sync list gates the refresh).
    if (!this.config.liveDot) return;
    if (!this.config.liveDot.syncWithPanelASliders.includes(event.variable)) return;

    const xVar = this.config.liveDot.xVariable;
    const x = this.state.currentSliders[xVar];
    if (typeof x !== 'number' || !Number.isFinite(x)) return;

    const y = evalExpr(this.config.liveDot.yExpr, this.state.currentSliders);
    if (Number.isFinite(y)) {
      this.state.liveDot = { x, y };
    } else if (typeof console !== 'undefined') {
      console.warn(`[PanelBEngine] liveDot yExpr evaluated to non-finite for`, this.state.currentSliders);
    }
  }

  private precomputeTraces(scope: Record<string, number>): TracePoints[] {
    if (!this.config) return [];
    const { xAxis, traces } = this.config;
    return traces.map((trace) => ({
      id: trace.id,
      points: this.samplePointsForTrace(trace, scope),
      color: trace.color,
      style: trace.style,
      lineWidth: trace.lineWidth,
    }));
  }

  private samplePointsForTrace(
    trace: PanelBTrace,
    scope: Record<string, number>,
  ): Array<{ x: number; y: number }> {
    const { xAxis } = this.config!;
    switch (trace.type) {
      case 'equation':
        return sampleTrace(
          trace.equationExpr,
          xAxis.variable,
          xAxis.min,
          xAxis.max,
          xAxis.tickInterval,
          scope,
        );
      case 'parametric_arc': {
        const radius = evalExpr(trace.fValueExpr, scope);
        if (!Number.isFinite(radius) || radius <= 0) return [];
        const pts: Array<{ x: number; y: number }> = [];
        for (let i = 0; i <= ARC_SAMPLES; i++) {
          const theta = (i / ARC_SAMPLES) * (Math.PI / 2);
          pts.push({ x: radius * Math.sin(theta), y: radius * Math.cos(theta) });
        }
        return pts;
      }
      case 'vector_from_origin': {
        const tipX = evalExpr(trace.xExpr, scope);
        const tipY = evalExpr(trace.yExpr, scope);
        if (!Number.isFinite(tipX) || !Number.isFinite(tipY)) return [];
        return [{ x: 0, y: 0 }, { x: tipX, y: tipY }];
      }
      case 'horizontal': {
        const y = evalExpr(trace.valueExpr, scope);
        if (!Number.isFinite(y)) return [];
        return [{ x: xAxis.min, y }, { x: xAxis.max, y }];
      }
    }
  }
}
