// =============================================================================
// src/lib/jsonBridge.ts
//
// Backward-compatibility bridge: converts old-format physics constants JSONs
// (simulation_states array) into the new epic_l_path.states shape so the
// pipeline can consume both old and new formats uniformly.
// =============================================================================

/** Old-format simulation state (from src/lib/physics_constants/*.json) */
interface OldSimulationState {
  id: string;           // "STATE_1", "STATE_2", etc.
  label: string;        // "Setup", "Buildup", "Aha", "Explore"
  description: string;  // What happens in this state
  emphasis: string;     // Key thing to show
  labels_visible?: string[];
  interactive?: boolean;
  sliders?: Array<{
    id: string;
    label: string;
    min: number;
    max: number;
    default: number;
    unit: string;
  }>;
}

/** New-format epic_l_path state (from src/data/concepts/*.json) */
export interface EpicLState {
  label: string;
  physics_layer: {
    concept: string;
    simulation_focus: string;
    what_to_show: string;
    key_observation: string;
  };
  pedagogy_layer: {
    teacher_script: string;
    [key: string]: unknown;
  };
}

export interface EpicLPath {
  state_count: number;
  board_mode_states: number[];
  jee_mode_states: number[];
  scope: string;
  states: Record<string, EpicLState>;
}

/**
 * Convert old-format simulation_states array into an epic_l_path object.
 *
 * Old format has: simulation_states: [{id, label, description, emphasis, ...}]
 * New format has: epic_l_path: { state_count, states: { STATE_1: { label, physics_layer, pedagogy_layer } } }
 *
 * This bridge maps:
 *   - description → physics_layer.concept + simulation_focus
 *   - emphasis    → physics_layer.what_to_show + key_observation
 *   - label       → label (preserved)
 */
export function normalizeOldStates(
  simulationStates: OldSimulationState[],
  conceptName?: string,
): EpicLPath {
  const states: Record<string, EpicLState> = {};

  for (const s of simulationStates) {
    states[s.id] = {
      label: s.label,
      physics_layer: {
        concept: s.description,
        simulation_focus: s.description,
        what_to_show: s.emphasis,
        key_observation: s.emphasis,
      },
      pedagogy_layer: {
        teacher_script: s.emphasis,
      },
    };
  }

  const stateCount = simulationStates.length;
  const allIndices = Array.from({ length: stateCount }, (_, i) => i + 1);
  // Board mode uses first 4 states (or all if fewer)
  const boardStates = allIndices.slice(0, Math.min(4, stateCount));

  return {
    state_count: stateCount,
    board_mode_states: boardStates,
    jee_mode_states: allIndices,
    scope: 'global',
    states,
  };
}
