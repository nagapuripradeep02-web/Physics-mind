'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type ComponentType } from 'react';
import dynamic from 'next/dynamic';
import normalReactionJson from '@/data/concepts/normal_reaction.json';
import vectorResolutionJson from '@/data/concepts/vector_resolution.json';
import contactForcesJson from '@/data/concepts/contact_forces.json';
import fieldForcesJson from '@/data/concepts/field_forces.json';
import tensionInStringJson from '@/data/concepts/tension_in_string.json';
import hingeForceJson from '@/data/concepts/hinge_force.json';
import freeBodyDiagramJson from '@/data/concepts/free_body_diagram.json';
import { SimSession } from '@/lib/engines/sim-session';
import { PhysicsEngineAdapter } from '@/lib/engines/physics';
import { ZoneLayoutEngine } from '@/lib/engines/zone-layout';
import { AnchorResolverEngine } from '@/lib/engines/anchor-resolver';
import { ScaleEngine } from '@/lib/engines/scale';
import { CollisionEngine } from '@/lib/engines/collision';
import { StateMachineEngine } from '@/lib/engines/state-machine';
import { TeacherScriptEngine, type TtsSentence } from '@/lib/engines/teacher-script';
import { InteractionEngine } from '@/lib/engines/interaction';
import { PanelBEngine } from '@/lib/engines/panel-b';
import { ChoreographyEngine } from '@/lib/engines/choreography';
import { TransitionEngine } from '@/lib/engines/transition';
import { FocalAttentionEngine } from '@/lib/engines/focal-attention';
import { MisconceptionDetectionEngine } from '@/lib/engines/misconception-detection';
import { conceptJsonToEngineConfigs } from '@/lib/engines/config-adapter';
import { assembleParametricHtml, type ParametricConfig } from '@/lib/renderers/parametric_renderer';
import { computePhysics } from '@/lib/physicsEngine';

type PlotProps = {
  data: unknown[];
  layout: Record<string, unknown>;
  style?: React.CSSProperties;
  config?: Record<string, unknown>;
};
const Plot = dynamic(
  () => import('react-plotly.js').then((m) => m.default as unknown as ComponentType<PlotProps>),
  { ssr: false },
);

interface DebugSnapshot {
  currentState: string;
  N: number;
  scale: number;
  liveDot: { x: number; y: number } | null;
  focal: string | null;
  theta: number;
  m: number;
  vars: Record<string, number>;
  derived: Record<string, number>;
}

interface SliderSpec {
  variable: string;
  min: number;
  max: number;
  step: number;
  default: number;
  label?: string;
}

type ConceptShape = {
  concept_id: string;
  epic_l_path: {
    states: Record<string, {
      scene_composition?: Array<Record<string, unknown>>;
      teacher_script?: { tts_sentences?: TtsSentence[] };
    }>;
  };
};

// Available concepts for the dev page. Switch via ?concept= URL query param.
const CONCEPTS: Record<string, { json: unknown; label: string }> = {
  normal_reaction: { json: normalReactionJson, label: 'Normal Reaction (block on incline)' },
  vector_resolution: { json: vectorResolutionJson, label: 'Vector Resolution (how to split any vector)' },
  contact_forces: { json: contactForcesJson, label: 'Contact Forces (N and friction)' },
  field_forces: { json: fieldForcesJson, label: 'Field Forces (gravity, no-touch)' },
  tension_in_string: { json: tensionInStringJson, label: 'Tension in String (Atwood)' },
  hinge_force: { json: hingeForceJson, label: 'Hinge Force (equilibrium)' },
  free_body_diagram: { json: freeBodyDiagramJson, label: 'Free Body Diagram (scaffold)' },
};

const INITIAL_DEBUG: DebugSnapshot = {
  currentState: 'STATE_1',
  N: 0,
  scale: 0,
  liveDot: null,
  focal: null,
  theta: 30,
  m: 2,
  vars: {},
  derived: {},
};

// Concept-keyed defaults so computePhysics gets the right variable names per concept.
// Shared by the iframe HTML builder and the debug-panel syncer.
const DEFAULTS_BY_CONCEPT_DEBUG: Record<string, Record<string, number>> = {
  normal_reaction:    { m: 2, g: 9.8, theta: 30 },
  vector_resolution:  { m: 2, g: 9.8, theta: 30, F: 10, alpha: 50 },
  contact_forces:     { m: 2, g: 9.8, theta: 30, N: 20, f: 15 },
  field_forces:       { m: 2, g: 9.8 },
  tension_in_string:  { m1: 2, m2: 1, g: 9.8 },
  hinge_force:        { W: 40, F_ext: 30 },
  free_body_diagram:  { m: 2, theta: 0, scenario_type: 0 },
};

// Return every slider declared in the state's scene_composition (dev UI renders one per slider).
function findSlidersForState(concept: ConceptShape, stateId: string): SliderSpec[] {
  const state = concept.epic_l_path.states[stateId];
  const scene = state?.scene_composition ?? [];
  const out: SliderSpec[] = [];
  for (const item of scene) {
    if (item.type === 'slider' && typeof item.variable === 'string') {
      out.push({
        variable: item.variable,
        min: typeof item.min === 'number' ? item.min : 0,
        max: typeof item.max === 'number' ? item.max : 90,
        step: typeof item.step === 'number' ? item.step : 1,
        default: typeof item.default === 'number' ? item.default : 30,
        label: typeof item.label === 'string' ? item.label : undefined,
      });
    }
  }
  return out;
}

export default function TestEnginesClient() {
  // Mount guard — avoids SSR/client hydration mismatch when ?concept= URL param
  // picks a different concept on the client than the SSR default.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div style={{ padding: 16, background: '#0b0c14', color: '#9ca3af', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>
        Loading /test-engines…
      </div>
    );
  }

  return <TestEnginesClientInner />;
}

function TestEnginesClientInner() {
  const sessionRef = useRef<SimSession | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [booted, setBooted] = useState(false);
  const [debug, setDebug] = useState<DebugSnapshot>(INITIAL_DEBUG);
  // Bumped on every syncDebug() call so Plotly's useMemo re-reads the engine's
  // latest trace data + live label_expr evaluations when any slider changes.
  const [panelBVersion, setPanelBVersion] = useState(0);
  const [sentences, setSentences] = useState<TtsSentence[]>([]);
  const [thetaInput, setThetaInput] = useState(30);
  const [events, setEvents] = useState<string[]>([]);
  // Fix 1C: iframe HTML is built client-only. SSR renders an empty iframe and
  // the client populates srcDoc in useEffect — no hydration mismatch.
  const [iframeHtml, setIframeHtml] = useState<string>('');

  // Safe to read URL — mount guard above ensures we're on the client.
  const conceptKey = (() => {
    const k = new URLSearchParams(window.location.search).get('concept') ?? 'normal_reaction';
    return CONCEPTS[k] ? k : 'normal_reaction';
  })();
  const CONCEPT = CONCEPTS[conceptKey].json as unknown as ConceptShape;
  const CONCEPT_RAW = CONCEPTS[conceptKey].json as Record<string, unknown>;
  const conceptId = CONCEPT.concept_id;

  // Panel B axis metadata read from the concept JSON — replaces the old
  // hardcoded "N vs θ" labels. Every v2 concept declares its own axes.
  const panelBCfg = (CONCEPT_RAW.panel_b_config as Record<string, unknown> | undefined) ?? {};
  const panelBX = (panelBCfg.x_axis as { label?: string; min?: number; max?: number } | undefined) ?? {};
  const panelBY = (panelBCfg.y_axis as { label?: string; min?: number; max?: number } | undefined) ?? {};
  const xAxisLabel = panelBX.label ?? 'x';
  const yAxisLabel = panelBY.label ?? 'y';
  const xAxisMin = panelBX.min ?? 0;
  const xAxisMax = panelBX.max ?? 100;
  const yAxisMin = panelBY.min ?? 0;
  const yAxisMax = panelBY.max ?? 100;
  // Circular/triangular geometry (force arcs, parametric_arc traces) opt-in
  // to 1:1 aspect so arcs stay round and meet the axes cleanly. Linear
  // traces (line, equation) keep independent axis scaling.
  const preserveAspect = (panelBCfg.preserve_aspect as boolean | undefined) ?? false;

  const syncDebug = useCallback(() => {
    const session = sessionRef.current;
    if (!session) return;
    const sm = session.getEngine<StateMachineEngine>('state-machine')!;
    const scale = session.getEngine<ScaleEngine>('scale')!;
    const pb = session.getEngine<PanelBEngine>('panel-b')!;
    const fa = session.getEngine<FocalAttentionEngine>('focal-attention')!;
    const interaction = session.getEngine<InteractionEngine>('interaction')!;

    const sliders = interaction.getSliderValues() as Record<string, number>;
    const theta = sliders.theta ?? 30;
    const m = sliders.m ?? 2;
    // Merge concept defaults under live slider values so missing-slider vars
    // (e.g. m2 when only m1 slider is moving) still reach computePhysics.
    const conceptDefaults: Record<string, number> =
      (DEFAULTS_BY_CONCEPT_DEBUG[conceptId] ?? {}) as Record<string, number>;
    const mergedVars: Record<string, number> = { ...conceptDefaults, ...sliders };
    const phys = computePhysics(conceptId, mergedVars);
    const N = phys?.forces.find((f) => f.id === 'normal')?.vector.magnitude ?? 0;
    const derived: Record<string, number> = {};
    if (phys && phys.derived) {
      for (const k of Object.keys(phys.derived)) {
        const v = (phys.derived as Record<string, unknown>)[k];
        if (typeof v === 'number') derived[k] = v;
      }
    }

    const currentStateId = sm.getCurrentState() ?? 'STATE_1';
    const stateConfig = CONCEPT.epic_l_path.states[currentStateId];
    setSentences(stateConfig?.teacher_script?.tts_sentences ?? []);

    // Fix 1A: UI slider tracks engine's slider value (engine resets to defaults on STATE_ENTER)
    setThetaInput(theta);

    setDebug({
      currentState: currentStateId,
      N,
      scale: scale.getScale(),
      liveDot: pb.getLiveDot(),
      focal: fa.getFocal()?.primitiveId ?? null,
      theta,
      m,
      vars: mergedVars,
      derived,
    });
    setPanelBVersion((v) => v + 1);
  }, [conceptId]);

  useEffect(() => {
    // Fix 1C: build iframe HTML client-side only. Uses the shared
    // DEFAULTS_BY_CONCEPT_DEBUG map so iframe + debug panel stay in sync.
    const states = CONCEPT.epic_l_path.states;
    const firstId = Object.keys(states)[0] ?? 'STATE_1';
    const paramCfg: ParametricConfig = {
      concept_id: CONCEPT.concept_id,
      scene_composition: states[firstId]?.scene_composition ?? [],
      states: states as Record<string, { scene_composition?: unknown[] }>,
      default_variables: DEFAULTS_BY_CONCEPT_DEBUG[CONCEPT.concept_id] ?? { m: 2, g: 9.8, theta: 30 },
      current_state: firstId,
    };
    setIframeHtml(assembleParametricHtml(paramCfg));
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const configs = conceptJsonToEngineConfigs(CONCEPT_RAW);
      const session = new SimSession('dev-test-engines');

      session.on('*' as 'STATE_ENTER', (e) => {
        setEvents((prev) => [`${e.type}`, ...prev].slice(0, 12));
      });

      session.register({ id: 'physics', tier: 'A', dependencies: [], factory: () => new PhysicsEngineAdapter() });
      session.register({ id: 'zone-layout', tier: 'B', dependencies: [], factory: () => new ZoneLayoutEngine() });
      session.register({ id: 'anchor-resolver', tier: 'B', dependencies: ['zone-layout'], factory: () => new AnchorResolverEngine() });
      session.register({ id: 'scale', tier: 'B', dependencies: ['zone-layout'], factory: () => new ScaleEngine() });
      session.register({ id: 'collision', tier: 'B', dependencies: [], factory: () => new CollisionEngine() });
      session.register({ id: 'state-machine', tier: 'E', dependencies: [], factory: () => new StateMachineEngine() });
      session.register({ id: 'teacher-script', tier: 'D', dependencies: ['state-machine'], factory: () => new TeacherScriptEngine() });
      session.register({ id: 'interaction', tier: 'D', dependencies: ['scale'], factory: () => new InteractionEngine() });
      session.register({ id: 'panel-b', tier: 'D', dependencies: ['interaction'], factory: () => new PanelBEngine() });
      session.register({ id: 'choreography', tier: 'C', dependencies: [], factory: () => new ChoreographyEngine() });
      session.register({ id: 'transition', tier: 'C', dependencies: ['state-machine'], factory: () => new TransitionEngine() });
      session.register({ id: 'focal-attention', tier: 'C', dependencies: ['state-machine'], factory: () => new FocalAttentionEngine() });
      session.register({ id: 'misconception-detection', tier: 'E', dependencies: [], factory: () => new MisconceptionDetectionEngine() });

      await session.boot(configs);
      if (cancelled) return;

      // Re-enter STATE_1 so teacher-script + focal get the STATE_ENTER they missed at boot.
      session.getEngine<StateMachineEngine>('state-machine')!.enterState('STATE_1');

      sessionRef.current = session;
      setBooted(true);
      syncDebug();
    })();

    return () => {
      cancelled = true;
      sessionRef.current?.destroy();
      sessionRef.current = null;
    };
  }, [syncDebug]);

  // Fix 1D: tell the iframe which state to render AND with which variables
  function postToIframe(stateId: string, variables?: Record<string, number>) {
    iframeRef.current?.contentWindow?.postMessage(
      { type: 'SET_STATE', state: stateId, variables },
      '*',
    );
  }

  function handleNext() {
    const session = sessionRef.current;
    if (!session) return;
    const sm = session.getEngine<StateMachineEngine>('state-machine')!;
    sm.next();
    const newState = sm.getCurrentState() ?? 'STATE_1';
    // Let iframe derive theta from scene (PM_resolveStateVars). Slider values are
    // only sent in handleThetaChange, which fires only in states with a theta slider.
    postToIframe(newState);
    syncDebug();
  }

  function handlePrev() {
    const session = sessionRef.current;
    if (!session) return;
    const sm = session.getEngine<StateMachineEngine>('state-machine')!;
    sm.previous();
    const newState = sm.getCurrentState() ?? 'STATE_1';
    postToIframe(newState);
    syncDebug();
  }

  function handleSliderChangeFor(variable: string, value: number) {
    if (variable === 'theta') setThetaInput(value);
    const session = sessionRef.current;
    if (!session) return;
    session.getEngine<InteractionEngine>('interaction')!.handleSliderChange(variable, value);
    const sm = session.getEngine<StateMachineEngine>('state-machine')!;
    const sliders = session.getEngine<InteractionEngine>('interaction')!.getSliderValues() as Record<string, number>;
    postToIframe(sm.getCurrentState() ?? 'STATE_1', { ...sliders });
    syncDebug();
  }

  // Build Panel B traces + live dot from engine state. Iterates every trace
  // so new types (parametric_arc, vector_from_origin, horizontal) render
  // alongside the default equation trace. Each trace carries its own color,
  // style, and line width from the JSON via TracePoints.
  const panelBPlot = useMemo(() => {
    if (!booted) return null;
    const pb = sessionRef.current?.getEngine<PanelBEngine>('panel-b');
    if (!pb) return null;
    const traces = pb.getAllTraces();
    if (traces.length === 0) return null;
    const data: unknown[] = traces.map((trace) => {
      const name = pb.getTraceLabel(trace.id) || trace.id;
      const line: Record<string, unknown> = { color: trace.color, width: trace.lineWidth };
      if (trace.style === 'dashed') line.dash = 'dash';
      return {
        x: trace.points.map((p) => p.x),
        y: trace.points.map((p) => p.y),
        type: 'scatter',
        mode: 'lines',
        line,
        name,
      };
    });
    if (debug.liveDot) {
      data.push({
        x: [debug.liveDot.x],
        y: [debug.liveDot.y],
        type: 'scatter',
        mode: 'markers',
        marker: { color: '#F59E0B', size: 12 },
        name: 'Live dot',
      });
    }
    return data;
  }, [booted, debug.liveDot, debug.currentState, panelBVersion]);

  // Fix 1B: sliders are visible only when the current state declares them. Works for
  // normal_reaction (theta) and vector_resolution (F, alpha).
  const sliderSpecs = useMemo(
    () => findSlidersForState(CONCEPT, debug.currentState),
    [CONCEPT, debug.currentState],
  );

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', padding: 16, background: '#0b0c14', color: '#e5e7eb', minHeight: '100vh' }}>
      <h1 style={{ margin: 0, fontSize: 20 }}>/test-engines — <span style={{ color: '#10B981' }}>DEV ONLY</span></h1>
      <p style={{ marginTop: 4, color: '#9ca3af', fontSize: 12 }}>
        Concept: <code>{conceptId}</code> · Engines booted: {booted ? '13' : '…'}
        <span style={{ marginLeft: 16 }}>
          {Object.keys(CONCEPTS).map((k) => (
            <a
              key={k}
              href={`?concept=${k}`}
              style={{
                marginRight: 8,
                padding: '2px 8px',
                borderRadius: 4,
                background: k === conceptKey ? '#10B981' : '#1f2937',
                color: k === conceptKey ? '#000' : '#e5e7eb',
                textDecoration: 'none',
                fontSize: 11,
              }}
            >
              {CONCEPTS[k].label}
            </a>
          ))}
        </span>
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 16 }}>
        <section>
          <h2 style={{ fontSize: 14, color: '#9ca3af', marginBottom: 8 }}>Panel A — mechanics (p5 iframe)</h2>
          <iframe
            ref={iframeRef}
            title="Panel A"
            srcDoc={iframeHtml}
            suppressHydrationWarning
            style={{ width: '100%', height: 500, border: '1px solid #1f2937', background: '#0A0A1A' }}
            sandbox="allow-scripts allow-same-origin"
          />
        </section>

        <section>
          <h2 style={{ fontSize: 14, color: '#9ca3af', marginBottom: 8 }}>
            Panel B — {yAxisLabel} vs {xAxisLabel} (Plotly)
          </h2>
          <div style={{ border: '1px solid #1f2937', background: '#0A0A1A', padding: 4 }}>
            {panelBPlot ? (
              <Plot
                data={panelBPlot}
                layout={{
                  width: 560,
                  height: 492,
                  paper_bgcolor: '#0A0A1A',
                  plot_bgcolor: '#0A0A1A',
                  font: { color: '#e5e7eb' },
                  xaxis: { title: xAxisLabel, gridcolor: '#1f2937', range: [xAxisMin, xAxisMax] },
                  yaxis: {
                    title: yAxisLabel,
                    gridcolor: '#1f2937',
                    range: [yAxisMin, yAxisMax],
                    ...(preserveAspect ? { scaleanchor: 'x' as const, scaleratio: 1 } : {}),
                  },
                  margin: { t: 20, r: 20, b: 40, l: 50 },
                  showlegend: false,
                }}
                config={{ displayModeBar: false }}
              />
            ) : (
              <div style={{ height: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280' }}>
                loading plotly…
              </div>
            )}
          </div>
        </section>
      </div>

      <section style={{ marginTop: 20, display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
        <div>
          <h2 style={{ fontSize: 14, color: '#9ca3af', marginBottom: 8 }}>Teacher script — {debug.currentState}</h2>
          <ol style={{ background: '#111827', padding: '8px 24px', borderRadius: 6, margin: 0 }}>
            {sentences.map((s) => (
              <li key={s.id} style={{ marginBottom: 6, lineHeight: 1.4 }}>{s.text_en}</li>
            ))}
          </ol>
          <div style={{ marginTop: 12, display: 'flex', gap: 8, alignItems: 'center' }}>
            <button onClick={handlePrev} style={btn()}>← PREV</button>
            <button onClick={handleNext} style={btn()}>NEXT →</button>
            {sliderSpecs.length > 0 ? (
              <div style={{ marginLeft: 24, display: 'flex', flexDirection: 'column', gap: 6 }}>
                {sliderSpecs.map((s) => (
                  <SliderRow
                    key={s.variable}
                    spec={s}
                    onChange={(v) => handleSliderChangeFor(s.variable, v)}
                  />
                ))}
              </div>
            ) : (
              <span style={{ marginLeft: 24, fontSize: 11, color: '#6b7280', fontStyle: 'italic' }}>
                (no slider in {debug.currentState})
              </span>
            )}
          </div>
        </div>

        <div>
          <h2 style={{ fontSize: 14, color: '#9ca3af', marginBottom: 8 }}>Debug (engine state)</h2>
          <div style={{ background: '#111827', padding: 12, borderRadius: 6, fontFamily: 'ui-monospace, SFMono-Regular, monospace', fontSize: 12 }}>
            <Row label="currentState" value={debug.currentState} />
            {Object.keys(debug.vars).map((k) => (
              <Row key={`var-${k}`} label={k} value={debug.vars[k].toFixed(2)} />
            ))}
            {Object.keys(debug.derived).map((k) => (
              <Row key={`der-${k}`} label={`${k} (derived)`} value={debug.derived[k].toFixed(2)} />
            ))}
            <Row label="UNIT_TO_PX (scale)" value={debug.scale.toFixed(3)} />
            <Row label="liveDot" value={debug.liveDot ? `(${debug.liveDot.x.toFixed(1)}, ${debug.liveDot.y.toFixed(2)})` : 'null'} />
            <Row label="focal" value={debug.focal ?? '—'} />
          </div>

          <h2 style={{ fontSize: 14, color: '#9ca3af', margin: '16px 0 8px' }}>Event bus (last 12)</h2>
          <ul style={{ background: '#111827', padding: '8px 20px', borderRadius: 6, fontFamily: 'ui-monospace, monospace', fontSize: 11, maxHeight: 180, overflowY: 'auto', margin: 0 }}>
            {events.map((e, i) => <li key={i}>{e}</li>)}
          </ul>
        </div>
      </section>
    </div>
  );
}

function btn(): React.CSSProperties {
  return {
    padding: '6px 14px',
    background: '#1f2937',
    color: '#e5e7eb',
    border: '1px solid #374151',
    borderRadius: 4,
    cursor: 'pointer',
    fontSize: 13,
  };
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0', borderBottom: '1px dashed #1f2937' }}>
      <span style={{ color: '#9ca3af' }}>{label}</span>
      <span style={{ color: '#e5e7eb' }}>{value}</span>
    </div>
  );
}

function SliderRow({ spec, onChange }: { spec: SliderSpec; onChange: (v: number) => void }) {
  const [value, setValue] = useState(spec.default);
  return (
    <label style={{ fontSize: 12, color: '#9ca3af', display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ minWidth: 160 }}>
        {spec.label ?? spec.variable} = <span style={{ color: '#e5e7eb' }}>{value}</span>
      </span>
      <input
        type="range"
        min={spec.min}
        max={spec.max}
        step={spec.step}
        value={value}
        onChange={(e) => {
          const v = Number(e.target.value);
          setValue(v);
          onChange(v);
        }}
        style={{ width: 200 }}
      />
    </label>
  );
}
