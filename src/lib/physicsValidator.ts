// =============================================================================
// src/lib/physicsValidator.ts
//
// Pure, synchronous validator for SimulationConfig objects produced by the
// circuit_live_renderer pipeline (circuit_live_renderer.js).
//
// This is DISTINCT from src/lib/physics_validator.ts (which validates
// ParticleFieldConfig for the particle-field renderer).
//
// Rules checked:
//   1. topology is a recognised value
//   2. No duplicate component ids
//   3. Every component.from and component.to exists in circuit.nodes
//   4. current_values keys reference known component ids
//   5. voltage_drops keys reference known component ids
//   6. slider_active=true requires all 5 slider fields
//   7. STATE_1..STATE_4 are all present
//   8. component.type is a recognised value
//
// Zero I/O, zero AI calls. Runs in <1 ms.
// =============================================================================

// ---------------------------------------------------------------------------
// Minimal type mirrors — keep these in sync with
// public/renderers/circuit_live_renderer_schema.ts
// (We can't import from public/ in server-side Next.js code.)
// ---------------------------------------------------------------------------

export interface CircuitStateConfig {
  current_flowing:    boolean;
  caption:            string;
  visible_components: string[] | null;
  spotlight:          string | null;
  show_values:        boolean;
  show_voltage_drops: boolean;
  slider_active:      boolean;
  current_values?:    Record<string, number>;
  voltage_drops?:     Record<string, number>;
  // Slider fields
  slider_variable?:         string;
  slider_min?:              number;
  slider_max?:              number;
  slider_default?:          number;
  slider_target_component?: string;
}

export interface CircuitComponent {
  id:       string;
  type:     string;
  from:     string;
  to:       string;
  label?:   string;
  value?:   number;
  is_open?: boolean;
}

export interface CircuitConfig {
  topology:   string;
  nodes:      string[];
  components: CircuitComponent[];
}

export interface CircuitSimulationConfig {
  circuit:          CircuitConfig;
  node_positions?:  Record<string, { x: number; y: number }>;
  states: {
    STATE_1: CircuitStateConfig;
    STATE_2: CircuitStateConfig;
    STATE_3: CircuitStateConfig;
    STATE_4: CircuitStateConfig;
    [key: string]: CircuitStateConfig;
  };
  formula_anchor?: unknown;
}

// ---------------------------------------------------------------------------
// Result
// ---------------------------------------------------------------------------

export interface CircuitValidationResult {
  valid:  boolean;
  errors: string[];
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const VALID_TOPOLOGIES = new Set([
  "series", "parallel", "bridge", "ladder", "custom", "single", "wire",
]);

const VALID_COMPONENT_TYPES = new Set([
  "wire", "resistor", "battery", "capacitor",
  "ammeter", "voltmeter", "galvanometer", "switch", "bulb",
]);

const REQUIRED_SLIDER_FIELDS: Array<keyof CircuitStateConfig> = [
  "slider_variable",
  "slider_min",
  "slider_max",
  "slider_default",
  // slider_target_component is only required when slider_variable = 'R';
  // omit from the required set so V-mode configs don't fail
];

const REQUIRED_STATES = ["STATE_1", "STATE_2", "STATE_3", "STATE_4"] as const;

// ---------------------------------------------------------------------------
// validatePhysics — main export
// ---------------------------------------------------------------------------

/**
 * Validate a SimulationConfig produced by the circuit_live_renderer pipeline.
 *
 * @param config   The parsed JSON from Claude Sonnet Stage 2.
 * @returns        { valid: true } or { valid: false, errors: string[] }.
 *                 `errors` is suitable for injection into a Sonnet retry prompt.
 */
export function validatePhysics(
  config: CircuitSimulationConfig,
): CircuitValidationResult {
  const errors: string[] = [];

  // ── Guard: config must be an object ────────────────────────────────────────
  if (!config || typeof config !== "object") {
    return { valid: false, errors: ["Config is null or not an object."] };
  }

  const { circuit, states } = config;

  // ── Rule 1: topology ───────────────────────────────────────────────────────
  if (!circuit?.topology) {
    errors.push('circuit.topology is missing.');
  } else if (!VALID_TOPOLOGIES.has(circuit.topology)) {
    errors.push(
      `circuit.topology "${circuit.topology}" is not valid. ` +
      `Must be one of: ${[...VALID_TOPOLOGIES].join(', ')}.`
    );
  }

  // ── Rule 2: component ids must be unique ───────────────────────────────────
  const components: CircuitComponent[] = circuit?.components ?? [];
  const nodeSet = new Set<string>(circuit?.nodes ?? []);
  const compIds = new Set<string>();

  for (const comp of components) {
    if (!comp.id) {
      errors.push(`A component is missing an "id" field.`);
      continue;
    }
    if (compIds.has(comp.id)) {
      errors.push(`Duplicate component id "${comp.id}".`);
    } else {
      compIds.add(comp.id);
    }
  }

  // ── Rule 3: from/to reference existing nodes ───────────────────────────────
  for (const comp of components) {
    // Rule 8 — valid type
    if (comp.type && !VALID_COMPONENT_TYPES.has(comp.type)) {
      errors.push(
        `Component "${comp.id}" has invalid type "${comp.type}". ` +
        `Valid types: ${[...VALID_COMPONENT_TYPES].join(', ')}.`
      );
    }

    if (comp.from && !nodeSet.has(comp.from)) {
      errors.push(
        `Component "${comp.id}".from="${comp.from}" does not exist in circuit.nodes.`
      );
    }
    if (comp.to && !nodeSet.has(comp.to)) {
      errors.push(
        `Component "${comp.id}".to="${comp.to}" does not exist in circuit.nodes.`
      );
    }
  }

  // ── Rules 4, 5, 6, 7 — per-state checks ──────────────────────────────────
  if (!states || typeof states !== "object") {
    errors.push("config.states is missing or not an object.");
    return { valid: false, errors };
  }

  for (const stateName of REQUIRED_STATES) {
    const s = states[stateName] as CircuitStateConfig | undefined;

    // Rule 7: state must be present
    if (!s) {
      errors.push(`Required state "${stateName}" is missing.`);
      continue;
    }

    // Rule 4: current_values keys must be known component ids
    if (s.current_values) {
      for (const key of Object.keys(s.current_values)) {
        if (!compIds.has(key)) {
          errors.push(
            `${stateName}.current_values["${key}"] references an unknown component id. ` +
            `Known ids: ${[...compIds].join(', ')}.`
          );
        }
      }
    }

    // Rule 5: voltage_drops keys must be known component ids
    if (s.voltage_drops) {
      for (const key of Object.keys(s.voltage_drops)) {
        if (!compIds.has(key)) {
          errors.push(
            `${stateName}.voltage_drops["${key}"] references an unknown component id. ` +
            `Known ids: ${[...compIds].join(', ')}.`
          );
        }
      }
    }

    // Rule 6: slider_active=true → required slider fields must be present
    if (s.slider_active) {
      for (const field of REQUIRED_SLIDER_FIELDS) {
        if (s[field] === undefined || s[field] === null) {
          errors.push(
            `${stateName}.slider_active=true but "${field}" is missing. ` +
            `All of slider_variable, slider_min, slider_max, slider_default are required.`
          );
        }
      }
      // slider_variable must be 'V' or 'R'
      if (s.slider_variable !== undefined &&
          s.slider_variable !== "V" &&
          s.slider_variable !== "R") {
        errors.push(
          `${stateName}.slider_variable="${s.slider_variable}" is invalid. Must be "V" or "R".`
        );
      }
      // R mode also needs a target component
      if (s.slider_variable === "R" && !s.slider_target_component) {
        errors.push(
          `${stateName}.slider_variable="R" requires slider_target_component to be set.`
        );
      }
      if (s.slider_variable === "R" &&
          s.slider_target_component &&
          !compIds.has(s.slider_target_component)) {
        errors.push(
          `${stateName}.slider_target_component="${s.slider_target_component}" ` +
          `is not a known component id.`
        );
      }
    }

    // spotlight must reference a known component (or null)
    if (s.spotlight !== null && s.spotlight !== undefined && !compIds.has(s.spotlight)) {
      errors.push(
        `${stateName}.spotlight="${s.spotlight}" is not a known component id.`
      );
    }

    // visible_components must reference known ids
    if (Array.isArray(s.visible_components)) {
      for (const vc of s.visible_components) {
        if (!compIds.has(vc)) {
          errors.push(
            `${stateName}.visible_components includes unknown id "${vc}".`
          );
        }
      }
    }
  }

  return {
    valid:  errors.length === 0,
    errors,
  };
}
