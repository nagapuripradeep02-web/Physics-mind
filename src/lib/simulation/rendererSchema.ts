// =============================================================================
// rendererSchema.ts
// Central TypeScript type definitions for the PhysicsMind simulation engine.
// All engineer-written renderers (particle_field, graph_interactive, etc.)
// consume a config object that conforms to SimulationConfig.
// =============================================================================

// ---------------------------------------------------------------------------
// PVLColors — Physics Visualization Language colour palette
// ---------------------------------------------------------------------------

/**
 * Canonical colour palette used across all PhysicsMind renderers.
 * Every renderer should read colours from a `PVLColors` instance rather than
 * hard-coding hex strings, so that future theme changes propagate everywhere.
 *
 * The values listed here are the default "dark-physics" theme.
 */
export interface PVLColors {
  /** Colour of free electrons / charge carriers. Default: bright blue. */
  electron: string;

  /** Colour of lattice / positive ions at rest. Default: cool grey. */
  positive_ion: string;

  /** Colour of electric-field arrows. Default: amber. */
  field_arrow: string;

  /** Colour used to represent magnetic field vectors / symbols. Default: cyan. */
  magnetic_field: string;

  /** Colour of the spotlit / highlighted particle. Default: pure white. */
  spotlight: string;

  /** Colour of the drift-velocity arrow or annotation. Default: muted green. */
  drift_velocity: string;

  /** Colour used to flag a misconception or wrong answer path. Default: red. */
  misconception: string;

  /** Canvas background colour. Default: near-black navy. */
  background: string;

  /** Colour for all text labels, captions, and overlays. Default: light zinc. */
  labels: string;
}

/**
 * Default PVL colour palette.
 * Renderers should spread this and override only the colours they need to change.
 *
 * @example
 * const colors: PVLColors = { ...DEFAULT_PVL_COLORS, electron: '#FF5722' };
 */
export const DEFAULT_PVL_COLORS: PVLColors = {
  electron:      "#42A5F5",
  positive_ion:  "#90A4AE",
  field_arrow:   "#FF9800",
  magnetic_field:"#00BCD4",
  spotlight:     "#FFFFFF",
  drift_velocity:"#66BB6A",
  misconception: "#EF5350",
  background:    "#0A0A1A",
  labels:        "#D4D4D8",
};

// ---------------------------------------------------------------------------
// StateConfig — a single simulation state (STATE_1 … STATE_4)
// ---------------------------------------------------------------------------

/**
 * Defines what the renderer should display during a specific lesson state.
 * Each state corresponds to one step in the TeacherPlayer timeline.
 * The renderer transitions to this state when it receives
 * `postMessage({ type: 'SET_STATE', state: 'STATE_N' })`.
 */
export interface StateConfig {
  /**
   * Net drift speed for charge carriers in this state, in px/frame.
   * 0 = no drift (e.g. STATE_1 "no field applied").
   * Must be strictly less than `particles.thermal_speed` to be physically correct.
   */
  drift_speed: number;

  /**
   * If true, one specific particle is rendered at full brightness
   * while all others are dimmed. Used to guide the student's eye.
   */
  highlight_particle?: boolean;

  /**
   * Zero-based index of the particle to spotlight when `highlight_particle` is true.
   * The renderer should fall back to particle 0 if omitted.
   */
  highlight_index?: number;

  /**
   * Whether the electric-field arrows are visible in this state.
   * Typically false in STATE_1 (no field) and true from STATE_2 onwards.
   */
  field_active?: boolean;

  /**
   * Whether interactive sliders are shown to the student in this state.
   * Usually only enabled in STATE_4 (interactive / "experiment" phase).
   */
  slider_active?: boolean;

  /**
   * Short caption displayed on the canvas or below the simulation
   * during this state. Should be ≤ 80 characters so it fits cleanly.
   *
   * @example "No electric field — electrons wander randomly"
   */
  caption: string;
}

// ---------------------------------------------------------------------------
// FormulaAnchorConfig — syncs formula display with simulation state
// ---------------------------------------------------------------------------

/**
 * Configuration for the Formula Anchor feature.
 * When present, the UI renders a live formula display alongside the simulation
 * and highlights the relevant variable(s) for the current state.
 */
export interface FormulaAnchorConfig {
  /**
   * The formula as a plain string (LaTeX-friendly).
   * @example "v_d = I / (n × e × A)"
   */
  formula_string: string;

  /**
   * Map of variable tokens to their display colour and human-readable label.
   * Keys must match tokens used in `formula_string`.
   *
   * @example
   * {
   *   "v_d": { color: "#66BB6A", label: "Drift velocity" },
   *   "I":   { color: "#42A5F5", label: "Current" }
   * }
   */
  variables: Record<string, {
    /** Hex colour used to highlight this variable in the formula display. */
    color: string;
    /** Human-readable name shown in the formula legend. */
    label: string;
  }>;

  /**
   * Maps each state ID to the list of variable tokens that should be
   * highlighted (pulsed / brightened) during that state.
   *
   * @example
   * {
   *   "STATE_1": [],
   *   "STATE_2": ["v_d", "I"],
   *   "STATE_3": ["n", "e", "A"]
   * }
   */
  state_highlights: Record<string, string[]>;

  /**
   * Optional live calculation block — shown when `slider_active` is true
   * (typically STATE_4). The renderer evaluates `formula` in a sandboxed
   * context with the current slider values and displays the result.
   */
  live_calculation?: {
    /**
     * JavaScript expression evaluated with current slider variable values.
     * @example "I / (n * e * A)"
     */
    formula: string;

    /**
     * Unit string appended to the computed result.
     * @example "m/s"
     */
    display_unit: string;

    /**
     * If true, the formula output updates in real-time as the student
     * moves sliders (uses `oninput` events).
     */
    update_on_slider: boolean;
  };
}

// ---------------------------------------------------------------------------
// SimulationConfig — top-level config consumed by every renderer
// ---------------------------------------------------------------------------

/**
 * The single source-of-truth configuration object for a PhysicsMind simulation.
 *
 * All engineer-written renderers read this from `window.SIM_CONFIG` which is
 * injected by the assembler functions (e.g. `assembleRendererHTML`,
 * `assembleGraphHTML`, `assembleOhmsLawHTML`).
 *
 * The AI (Claude Sonnet) generates the *values*, but the *shape* is always this
 * interface — ensuring the renderer never crashes on unexpected keys.
 */
export interface SimulationConfig {
  // ── Renderer identity ──────────────────────────────────────────────────────

  /**
   * Which pre-built engineer-written renderer should handle this config.
   * The route handler and assembler functions use this to pick the right
   * renderer code string.
   *
   * | Value             | Renderer file                     |
   * |-------------------|-----------------------------------|
   * | particle_field    | particle_field_renderer.ts        |
   * | graph_interactive | graph_interactive_renderer.ts     |
   * | circuit_live      | circuitRenderer.ts (planned)      |
   * | wave_canvas       | waveCanvasRenderer.ts (planned)   |
   * | field_3d          | field3dRenderer.ts (planned)      |
   * | mechanics_2d      | mechanics2dRenderer.ts (planned)  |
   */
  renderer:
    | "particle_field"
    | "wave_canvas"
    | "circuit_live"
    | "graph_interactive"
    | "field_3d"
    | "mechanics_2d";

  // ── Canvas / design ────────────────────────────────────────────────────────

  /**
   * Visual design parameters for the simulation canvas.
   */
  design: {
    /**
     * Canvas background colour as a hex string.
     * Should match `pvl_colors.background` for visual consistency.
     * @example "#0A0A1A"
     */
    background: string;

    /**
     * Canvas width in CSS pixels. Renderers should honour this via
     * `createCanvas(design.canvas_width, design.canvas_height)` in p5.js.
     */
    canvas_width: number;

    /**
     * Canvas height in CSS pixels.
     */
    canvas_height: number;
  };

  // ── Particle system ────────────────────────────────────────────────────────

  /**
   * Parameters for the free charge carrier (electron) particle system.
   * Used by `particle_field` and any renderer that animates moving charges.
   */
  particles: {
    /**
     * Total number of particles to simulate.
     * Recommended range: 15–60. More than 80 causes frame-rate issues.
     */
    count: number;

    /**
     * Default fill colour for particles (hex string).
     * Spotlit particles use `pvl_colors.spotlight` instead.
     * @example "#42A5F5"
     */
    base_color: string;

    /**
     * Magnitude of random thermal (zigzag) motion in px/frame.
     * MUST be greater than any `StateConfig.drift_speed` value — this is
     * checked by `validatePhysics()`.
     * Typical value: 3.0–5.0
     */
    thermal_speed: number;

    /**
     * Particle radius in pixels.
     */
    size: number;
  };

  // ── Lattice ions ───────────────────────────────────────────────────────────

  /**
   * Optional lattice of positive ions (background crystal structure).
   * When omitted, no lattice is drawn — suitable for free-space field simulations.
   */
  lattice?: {
    /** Number of ion rows in the grid. */
    rows: number;

    /** Number of ion columns in the grid. */
    cols: number;

    /**
     * Fill colour for all lattice ions (hex string).
     * @example "#90A4AE"
     */
    ion_color: string;

    /** Ion circle radius in pixels. */
    ion_size: number;
  };

  // ── Physics direction constants ────────────────────────────────────────────

  /**
   * Net direction of electron drift across the canvas.
   * For current electricity simulations this should be `"left"` (opposite to
   * conventional current which flows right-to-left in E-field direction).
   * Validated by `physics_validator.ts` against the `locked_facts` JSON.
   */
  electron_drift_direction: "left" | "right" | "up" | "down";

  /**
   * Direction field arrows point on the canvas.
   * For conventional current topics this should be `"right"` (E-field direction).
   */
  field_arrow_direction: "left" | "right" | "up" | "down";

  // ── State machine ──────────────────────────────────────────────────────────

  /**
   * The 4-state lesson progression. TeacherPlayer advances through these in
   * order, sending `SET_STATE` postMessages to the renderer.
   *
   * Convention:
   * - STATE_1: baseline / no-field / equilibrium
   * - STATE_2: primary physics activated
   * - STATE_3: highlight / spotlight / aha moment
   * - STATE_4: interactive (sliders active)
   */
  states: {
    STATE_1: StateConfig;
    STATE_2: StateConfig;
    STATE_3: StateConfig;
    STATE_4?: StateConfig;
  };

  // ── Optional features ──────────────────────────────────────────────────────

  /**
   * Formula Anchor configuration.
   * When present, the TeacherPlayer renders a formula panel beside the simulation
   * and highlights the active variables per state.
   * Currently defined in the schema; UI implementation is pending.
   */
  formula_anchor?: FormulaAnchorConfig;

  /**
   * PVL colour overrides.
   * If omitted, `DEFAULT_PVL_COLORS` is used by the renderer.
   * Only specify the colours you want to change from the default palette.
   */
  pvl_colors?: PVLColors;

  // ── EPIC Protocol ──────────────────────────────────────────────────────────

  /**
   * EPIC protocol mode. When set to 'EPIC_C', the physics validator will skip
   * validation for STATE_1 to allow deliberate misconception demonstrations.
   */
  epic_mode?: 'EPIC_C' | 'EPIC_L';

  /**
   * When true, STATE_1 intentionally contains physically incorrect values that
   * represent the student's wrong mental model. The validator will not penalise
   * this state. STATE_2–STATE_4 are still strictly validated.
   */
  state1_is_wrong_belief?: boolean;
}
