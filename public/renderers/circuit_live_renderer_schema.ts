// =============================================================================
// circuit_live_renderer_schema.ts
// TypeScript interface for window.SIM_CONFIG consumed by circuit_live_renderer.js
// Every field name here is the exact string the renderer reads — do not invent
// new names when writing configs for this renderer.
// =============================================================================

// ── Topology ─────────────────────────────────────────────────────────────────

/**
 * How the layout engine positions nodes on the 800×500 canvas.
 *  - 'series'   : nodes distributed clockwise around a rectangle (default)
 *  - 'parallel' : two terminal nodes (left/right) with branches between them
 *  - 'bridge'   : Wheatstone-diamond — 4 nodes at left/top/right/bottom
 *  - 'ladder'   : nodes alternate top-row / bottom-row left to right
 *  - 'custom'   : node positions taken verbatim from cfg.node_positions
 */
export type CircuitTopology = 'series' | 'parallel' | 'bridge' | 'ladder' | 'custom';

// ── Component types ───────────────────────────────────────────────────────────

/**
 * Every drawable component type the renderer recognises.
 * Anything not in this list falls back to a plain wire segment.
 *  - 'wire'         : plain conductor line (no symbol)
 *  - 'resistor'     : rectangle body with lead wires; shows current / voltage drop
 *  - 'battery'      : 4-line cell symbol (long-short pairs); + / − labels
 *  - 'capacitor'    : two parallel plates with lead wires
 *  - 'ammeter'      : circle with letter "A"; shows measured current value
 *  - 'voltmeter'    : circle with letter "V"; shows measured voltage value
 *  - 'galvanometer' : circle with letter "G"; shows near-zero indicator
 *  - 'switch'       : open-blade or closed-blade symbol
 *  - 'bulb'         : circle with X filament; brightness driven by current
 */
export type ComponentType =
  | 'wire'
  | 'resistor'
  | 'battery'
  | 'capacitor'
  | 'ammeter'
  | 'voltmeter'
  | 'galvanometer'
  | 'switch'
  | 'bulb';

// ── Per-component definition ──────────────────────────────────────────────────

export interface CircuitComponent {
  /** Unique string identifier — referenced by spotlight, current_values, voltage_drops, etc. */
  id: string;

  /** Which symbol to draw. Unknown types render as a plain wire. */
  type: ComponentType;

  /** Source node ID (tail of the component in current-flow direction). */
  from: string;

  /** Destination node ID (head of the component in current-flow direction). */
  to: string;

  /**
   * Human-readable label rendered above the component body.
   * Falls back to `id` when omitted.
   */
  label?: string;

  /**
   * Numeric value stored on the component.
   *  - battery   → EMF in Volts (used by slider R-mode to compute I = V/R)
   *  - resistor  → resistance in Ohms (updated live by slider when slider_variable='R')
   * Other component types ignore this field.
   */
  value?: number;

  /**
   * Switch state. `true` = open (no current), `false` = closed (current flows).
   * Defaults to open (true) when omitted.
   * Only meaningful for type='switch'.
   */
  is_open?: boolean;
}

// ── Circuit topology block ────────────────────────────────────────────────────

export interface CircuitConfig {
  /**
   * Layout algorithm. Determines how node coordinates are computed.
   * Use 'custom' together with cfg.node_positions for free placement.
   */
  topology: CircuitTopology;

  /**
   * Ordered list of node IDs. Node order matters for 'series' and 'ladder'
   * layout algorithms (they distribute nodes in list order).
   * For 'bridge', provide exactly 4 nodes: [left, top, right, bottom].
   */
  nodes: string[];

  /**
   * All circuit elements. Wires, symbols, and meters are all components.
   * Components sharing the same from/to pair are rendered in parallel with
   * automatic perpendicular offsets (75 px spacing per branch).
   */
  components: CircuitComponent[];
}

// ── Custom node positions (topology='custom' only) ────────────────────────────

/**
 * Pixel coordinates on the 800×500 canvas.
 * Only read when circuit.topology === 'custom'.
 * Keys are node IDs from circuit.nodes.
 */
export interface NodePosition {
  /** Horizontal pixel position (0 = left edge, 800 = right edge). */
  x: number;
  /** Vertical pixel position (0 = top edge, 500 = bottom edge). */
  y: number;
}

// ── Formula anchor ────────────────────────────────────────────────────────────

/**
 * One variable in the formula legend.
 */
export interface FormulaVariable {
  /**
   * CSS hex colour used to highlight this token in the formula strip and
   * in the legend. Recommended PVL colours:
   *  - voltage     : '#FF9800'
   *  - current     : '#66BB6A'
   *  - resistance  : '#42A5F5'
   *  - spotlight   : '#FFFFFF'
   */
  color: string;

  /**
   * Legend text shown to the right of the formula.
   * Example: "voltage = 6 V" or "resistance = 4 Ω"
   */
  label: string;
}

/**
 * Persistent formula strip rendered at the bottom of the canvas (bottom 68 px).
 * The formula is tokenized on variable names and coloured per state.
 */
export interface FormulaAnchor {
  /**
   * The formula as a plain string. Variable tokens must exactly match keys in
   * `variables`. Operators and punctuation are rendered as dimmed text.
   * Example: "V = I × R"
   */
  formula_string: string;

  /**
   * Map from variable token (single letter or short string) to its display
   * metadata. Only variables listed here are coloured; everything else is dim.
   * Example: { "V": { color: "#FF9800", label: "voltage = 6 V" } }
   */
  variables: Record<string, FormulaVariable>;

  /**
   * Which variable tokens to highlight (glow + bold) in each state.
   * Keys are state names ('STATE_1' … 'STATE_4').
   * Values are arrays of variable keys from `variables`.
   * Example: { "STATE_2": ["I"], "STATE_3": ["V", "R"] }
   */
  state_highlights: Record<string, string[]>;
}

// ── State config (STATE_1 … STATE_4) ─────────────────────────────────────────

/**
 * Fields read by applyState() when the renderer receives SET_STATE.
 * Every STATE_N object inside cfg.states must conform to this interface.
 */
export interface StateConfig {
  /**
   * Whether current-flow chevron arrows are animated this state.
   * `false` = circuit is open / switch off; arrows hidden.
   */
  current_flowing: boolean;

  /**
   * Short teacher caption rendered at the very top of the canvas (y = 8 px).
   * Keep under ~80 characters to avoid overflow at the 800 px canvas width.
   */
  caption: string;

  /**
   * Restrict rendering to these component IDs. All others are hidden entirely.
   * Set to `null` to show every component (default behaviour).
   */
  visible_components: string[] | null;

  /**
   * Component ID to spotlight. The spotlit component renders in white with a
   * glow; all other visible components are dimmed to 18 % opacity.
   * Set to `null` for no spotlight (all components at full opacity).
   */
  spotlight: string | null;

  /**
   * Show numeric current values (in Amperes) below each component that has
   * an entry in `current_values`. Green text (#66BB6A).
   */
  show_values: boolean;

  /**
   * Show numeric voltage-drop values (in Volts) below each component that
   * has an entry in `voltage_drops`. Orange text (#FF9800).
   */
  show_voltage_drops: boolean;

  /**
   * Display the interactive resistance / voltage slider UI below the canvas.
   * When true, the slider fields below are also required.
   */
  slider_active: boolean;

  /**
   * Map from component ID → current magnitude in Amperes.
   * Used to:
   *  - drive chevron arrow speed (proportional to |I|)
   *  - display current labels when show_values = true
   *  - drive bulb brightness (brightness = min(1, I / 2))
   *  - serve as base scaling values in voltage-slider mode
   */
  current_values?: Record<string, number>;

  /**
   * Map from component ID → voltage drop in Volts.
   * Displayed below resistors / meters when show_voltage_drops = true.
   */
  voltage_drops?: Record<string, number>;

  // ── Slider fields (only required when slider_active = true) ───────────────

  /**
   * Which physical quantity the slider controls.
   *  - 'V' : battery voltage — all non-battery currents scale proportionally
   *  - 'R' : resistance of slider_target_component — I = V / R is recomputed live
   */
  slider_variable?: 'V' | 'R';

  /** Minimum slider value (Volts or Ohms). */
  slider_min?: number;

  /** Maximum slider value (Volts or Ohms). */
  slider_max?: number;

  /**
   * Initial slider position. Also the denominator for scaling when
   * slider_variable = 'V'. Should match the base current_values entry.
   */
  slider_default?: number;

  /**
   * Component ID whose `value` (resistance) is updated when slider_variable = 'R'.
   * The renderer recomputes current as I = (battery.value) / slider_value.
   * Only required when slider_variable = 'R'.
   */
  slider_target_component?: string;
}

// ── Root SimulationConfig ─────────────────────────────────────────────────────

/**
 * The complete object assigned to window.SIM_CONFIG before the renderer script
 * runs. This is the single source of truth the renderer consumes.
 *
 * Minimal required fields: circuit + states (STATE_1 at minimum).
 * All other top-level keys are optional enhancements.
 */
export interface SimulationConfig {
  /**
   * Describes the circuit topology, node list, and component list.
   * This is parsed once at init time to compute layout and arrow particles.
   */
  circuit: CircuitConfig;

  /**
   * Free-placement pixel coordinates for each node.
   * Only consumed when circuit.topology === 'custom'.
   * Omit for all other topologies — the layout engine computes positions.
   */
  node_positions?: Record<string, NodePosition>;

  /**
   * Teacher-controlled pedagogical states. The renderer transitions between
   * them when it receives { type: 'SET_STATE', state: 'STATE_N' } postMessages.
   *
   * Minimum: provide STATE_1 through STATE_4.
   * Keys must be exactly 'STATE_1', 'STATE_2', 'STATE_3', 'STATE_4'.
   */
  states: {
    STATE_1: StateConfig;
    STATE_2: StateConfig;
    STATE_3: StateConfig;
    STATE_4: StateConfig;
    [key: string]: StateConfig; // allow additional states if needed
  };

  /**
   * Optional persistent formula strip at the bottom of the canvas.
   * Renders behind the circuit; per-state variable highlighting is driven
   * by formula_anchor.state_highlights.
   * Omit entirely if no formula display is needed.
   */
  formula_anchor?: FormulaAnchor;
}

// ── PVL Color Reference (do not change these in configs) ─────────────────────

/**
 * Physics Visual Language palette enforced by the renderer.
 * Use these exact hex values in formula_anchor variable colors and any
 * caption text that references physical quantities.
 *
 * bg           '#0A0A1A'   canvas background (dark navy)
 * wire         '#546E7A'   conductor lines
 * arrow        '#42A5F5'   current-flow chevron arrows (blue)
 * resistor     '#90A4AE'   resistor body stroke
 * spot         '#FFFFFF'   spotlight element stroke + glow
 * voltage      '#FF9800'   voltage / field arrow orange
 * current      '#66BB6A'   current / drift velocity green
 * text         '#D4D4D8'   default label text
 * battery      '#FFB300'   battery plates and label
 * capacitor    '#80CBC4'   capacitor plates
 * meter_a      '#66BB6A'   ammeter circle
 * meter_v      '#FF9800'   voltmeter circle
 * meter_g      '#CE93D8'   galvanometer circle (purple)
 * switch_open  '#EF9A9A'   open-switch blade (red)
 * switch_closed '#66BB6A'  closed-switch blade (green)
 * bulb_off     '#90A4AE'   unlit bulb
 * bulb_on      '#FFE082'   lit bulb
 * junction     '#60A5FA'   3-way junction dot
 * DIM          0.18        global alpha for dimmed (non-spotlit) components
 */
export const PVL_COLORS = {
  bg:            '#0A0A1A',
  wire:          '#546E7A',
  arrow:         '#42A5F5',
  resistor:      '#90A4AE',
  spot:          '#FFFFFF',
  voltage:       '#FF9800',
  current:       '#66BB6A',
  text:          '#D4D4D8',
  battery:       '#FFB300',
  capacitor:     '#80CBC4',
  meter_a:       '#66BB6A',
  meter_v:       '#FF9800',
  meter_g:       '#CE93D8',
  switch_open:   '#EF9A9A',
  switch_closed: '#66BB6A',
  bulb_off:      '#90A4AE',
  bulb_on:       '#FFE082',
  junction:      '#60A5FA',
  DIM:           0.18,
} as const;
