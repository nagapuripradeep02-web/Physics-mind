// src/lib/epicStateBuilder.ts
// Builds the STATE_1 contract for EPIC-C simulations deterministically.
// No AI involved. Called once per session before the Brief Writer runs.
//
// Now concept-aware: dispatches to the correct STATE_1 builder based on
// renderer type instead of hardcoding circuit ammeter values for all concepts.

// ── Renderer-specific STATE_1 types ──────────────────────────────────────────

export interface CircuitLiveState1 {
  type: 'WRONG_BELIEF_LIVE_CIRCUIT';
  renderer: 'circuit_live';
  circuit_is_live: true;
  electrons_are_drifting: true;
  ammeter_values: {
    before_r1: number;
    between_r1_r2: number;
    after_r2: number;
  };
  electron_density: {
    segment_1: 'full';
    segment_2: 'reduced';
    segment_3: 'sparse';
  };
  overlay: 'red_tint';
  caption: string;
  values_are_wrong: true;
  freeze: false;
}

export interface Mechanics2dState1 {
  type: 'WRONG_BELIEF_MECHANICS';
  renderer: 'mechanics_2d';
  student_belief: string;
  simulation_emphasis: string;
  overlay: 'red_tint';
  caption: string;
  values_are_wrong: true;
  freeze: false;
  /**
   * Concept-specific visual contract for STATE_1. When present, downstream
   * prompts MUST render exactly these vectors and values. Used by Brief Writer
   * (aiSimulationGenerator.ts:778) and Concept Primary HTML generator
   * (aiSimulationGenerator.ts:4276) to lock STATE_1 to the wrong-belief visual.
   */
  state_1_render_spec?: {
    pattern: 'naive_scalar_addition' | 'always_larger_resultant' | 'generic';
    description: string;
    vector_a: { magnitude: number; direction_deg: number; color: string; label: string; start: 'origin' | 'a_head' };
    vector_b: { magnitude: number; direction_deg: number; color: string; label: string; start: 'origin' | 'a_head' };
    resultant: { magnitude: number; label: string; color: string };
    show_formula: false;
    show_angle_arc: false;
    show_correct_resultant_dashed: false;
    background_tint: string;
    forbidden_in_state_1: string[];
  };
}

export interface ParticleFieldState1 {
  type: 'WRONG_BELIEF_PARTICLES';
  renderer: 'particle_field';
  student_belief: string;
  simulation_emphasis: string;
  overlay: 'red_tint';
  caption: string;
  values_are_wrong: true;
  freeze: false;
}

export interface GraphInteractiveState1 {
  type: 'WRONG_BELIEF_GRAPH';
  renderer: 'graph_interactive';
  student_belief: string;
  simulation_emphasis: string;
  overlay: 'red_tint';
  caption: string;
  values_are_wrong: true;
  freeze: false;
}

export interface GenericWrongBeliefState1 {
  type: 'WRONG_BELIEF_GENERIC';
  renderer: string;
  student_belief: string;
  simulation_emphasis: string;
  label_overlay: string;
  caption: string;
  values_are_wrong: true;
  freeze: false;
}

export interface EpicLState1 {
  type: 'BASELINE_NO_CURRENT';
  circuit_is_live: false;
  caption: string;
  concept_id?: string;
  first_scenario?: string;
}

export type EpicCState1 =
  | CircuitLiveState1
  | Mechanics2dState1
  | ParticleFieldState1
  | GraphInteractiveState1
  | GenericWrongBeliefState1;

export type EpicState1 = EpicCState1 | EpicLState1;

type RendererType =
  | 'circuit_live'
  | 'mechanics_2d'
  | 'particle_field'
  | 'graph_interactive'
  | 'wave_canvas'
  | 'optics_ray'
  | 'field_3d'
  | 'thermodynamics'
  | string;

// ── Builder functions per renderer ───────────────────────────────────────────

function buildCircuitLiveState1(studentBelief: string): CircuitLiveState1 {
  return {
    type: 'WRONG_BELIEF_LIVE_CIRCUIT',
    renderer: 'circuit_live',
    circuit_is_live: true,
    electrons_are_drifting: true,
    ammeter_values: {
      before_r1: 4.0,
      between_r1_r2: 2.5,
      after_r2: 1.0,
    },
    electron_density: {
      segment_1: 'full',
      segment_2: 'reduced',
      segment_3: 'sparse',
    },
    overlay: 'red_tint',
    caption: "How you're thinking about it right now",
    values_are_wrong: true,
    freeze: false,
  };
}

function buildMechanics2dState1(
  studentBelief: string,
  simulationEmphasis: string,
  conceptId?: string,
): Mechanics2dState1 {
  const base: Mechanics2dState1 = {
    type: 'WRONG_BELIEF_MECHANICS',
    renderer: 'mechanics_2d',
    student_belief: studentBelief,
    simulation_emphasis: simulationEmphasis,
    overlay: 'red_tint',
    caption: "This is what you believe — let's test it.",
    values_are_wrong: true,
    freeze: false,
  };

  // Concept-specific wrong-belief patterns. Each pattern populates a rich
  // state_1_render_spec that downstream prompts read verbatim. Currently
  // wired for vector_addition + naive scalar addition belief.
  // Detection is keyword-based on the extracted student_belief string.
  const isNaiveScalarBelief = /scalar|just like|same as|equals|=\s*\d|must be\s*\d|add(?:ing|s)? like number/i.test(studentBelief);

  if (conceptId === 'vector_addition' && isNaiveScalarBelief) {
    base.state_1_render_spec = {
      pattern: 'naive_scalar_addition',
      description:
        "Two vectors A and B drawn parallel head-to-tail at direction_deg=0. " +
        "Their lengths sum visually to length 7. A big 'R = 7 ✓' label centered above " +
        "asserts the naive scalar sum as if correct. NO formula, NO cos overlay, " +
        "NO angle arc, NO correct (diagonal) resultant. The visual must look like " +
        "a confident statement of the wrong belief — STATE_2 onwards introduces conflict.",
      vector_a: { magnitude: 4, direction_deg: 0, color: '#60a5fa', label: 'A = 4', start: 'origin' },
      vector_b: { magnitude: 3, direction_deg: 0, color: '#34d399', label: 'B = 3', start: 'a_head' },
      resultant: { magnitude: 7, label: 'R = 7 ✓', color: '#fbbf24' },
      show_formula: false,
      show_angle_arc: false,
      show_correct_resultant_dashed: false,
      background_tint: 'rgba(180,0,0,0.10)',
      forbidden_in_state_1: [
        'cos_overlay',
        'sqrt_overlay',
        'angle_arc',
        'correct_R_label',
        'formula_box',
        'parallelogram_diagonal',
        'wrong_marker_X',
        'red_strikethrough',
      ],
    };
  }

  return base;
}

function buildParticleFieldState1(studentBelief: string, simulationEmphasis: string): ParticleFieldState1 {
  return {
    type: 'WRONG_BELIEF_PARTICLES',
    renderer: 'particle_field',
    student_belief: studentBelief,
    simulation_emphasis: simulationEmphasis,
    overlay: 'red_tint',
    caption: "How you're thinking about it right now",
    values_are_wrong: true,
    freeze: false,
  };
}

function buildGraphInteractiveState1(studentBelief: string, simulationEmphasis: string): GraphInteractiveState1 {
  return {
    type: 'WRONG_BELIEF_GRAPH',
    renderer: 'graph_interactive',
    student_belief: studentBelief,
    simulation_emphasis: simulationEmphasis,
    overlay: 'red_tint',
    caption: "How you're thinking about it right now",
    values_are_wrong: true,
    freeze: false,
  };
}

function buildGenericState1(studentBelief: string, simulationEmphasis: string, renderer: string): GenericWrongBeliefState1 {
  return {
    type: 'WRONG_BELIEF_GENERIC',
    renderer,
    student_belief: studentBelief,
    simulation_emphasis: simulationEmphasis,
    label_overlay: studentBelief,
    caption: "How you're thinking about it right now",
    values_are_wrong: true,
    freeze: false,
  };
}

// ── Main entry point ─────────────────────────────────────────────────────────

export function buildEpicState1(
  studentBelief: string | null | undefined,
  simulationEmphasis: string | null | undefined,
  rendererType?: RendererType,
  epicLPath?: { states: Array<{ physics_layer: { scenario: string }, label: string }> } | null,
  conceptId?: string,
): EpicState1 {

  // No student belief = EPIC-L session = baseline state
  if (!studentBelief || !simulationEmphasis) {
    const firstState = epicLPath?.states?.[0];
    return {
      type: 'BASELINE_NO_CURRENT',
      circuit_is_live: false,
      caption: firstState?.label ?? 'No current yet — switch is open',
      concept_id: firstState ? 'loaded' : 'generic',
      first_scenario: firstState?.physics_layer?.scenario ?? undefined,
    };
  }

  // Student has a belief = EPIC-C session
  // Dispatch to the correct builder based on renderer type
  const renderer = rendererType ?? 'particle_field';

  switch (renderer) {
    case 'circuit_live':
      return buildCircuitLiveState1(studentBelief);

    case 'mechanics_2d':
      return buildMechanics2dState1(studentBelief, simulationEmphasis, conceptId);

    case 'particle_field':
      return buildParticleFieldState1(studentBelief, simulationEmphasis);

    case 'graph_interactive':
      return buildGraphInteractiveState1(studentBelief, simulationEmphasis);

    default:
      return buildGenericState1(studentBelief, simulationEmphasis, renderer);
  }
}
