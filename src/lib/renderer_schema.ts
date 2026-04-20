// =============================================================================
// renderer_schema.ts — Defines every valid field the particle_field renderer accepts.
// Nothing outside this schema can enter the renderer.
// =============================================================================

/** State-specific configuration — each STATE_1 through STATE_4 uses this shape */
export interface RendererStateConfig {
    /** Drift speed in pixels per frame (0 = no drift, max 1.5) */
    drift_speed: number;
    /** Drift direction: electrons drift this way */
    drift_direction: "left" | "right" | "none";
    /** Whether electric field arrows are visible */
    field_visible: boolean;
    /** Spotlight one particle (index 0): white, larger, longer trail */
    highlight_particle: boolean;
    /** Dim all non-highlighted particles */
    dim_others: boolean;
    /** Opacity of dimmed particles (0.0–1.0, typically 0.12) */
    dim_opacity: number;
    /** Electric field strength value (for formula display) */
    field_strength: number;
    /** Human-readable label shown on canvas for this state */
    label: string;
    /** Optional caption overlay for the state (Sonnet flat-field output) */
    caption?: string;
    /** Whether this state is active (flat-field output variant) */
    field_active?: boolean;
}

/** Top-level simulation config — the ONLY input to the renderer */
export interface ParticleFieldConfig {
    renderer: "particle_field";

    canvas: {
        width: number;
        height: number;
        bg_color: string;   // hex, e.g. "#0A0A1A"
    };

    particles: {
        count: number;       // number of electrons (15–40)
        color: string;       // hex, e.g. "#42A5F5"
        size: number;        // diameter in px (6–12)
        trail_length: number; // how many past positions to draw (10–30)
        thermal_speed: number; // px per frame for random zigzag (3.0–6.0)
    };

    lattice: {
        count: number;       // number of positive ions (20–60)
        color: string;       // hex, e.g. "#90A4AE"
        size: number;        // diameter in px (8–16)
        glow: boolean;       // draw a soft glow behind each ion
    };

    field_arrows: {
        color: string;       // hex, e.g. "#FF9800"
        direction: "left_to_right" | "right_to_left";
        count: number;       // number of arrows across the canvas (3–8)
    };

    /** EPIC-C Protocol mode */
    epic_mode?: 'EPIC_C' | 'EPIC_L';
    /** EPIC-C Protocol marker: states if STATE_1 intentionally shows incorrect physics */
    state1_is_wrong_belief?: boolean;

    states: {
        STATE_1: RendererStateConfig;
        STATE_2: RendererStateConfig;
        STATE_3: RendererStateConfig;
        STATE_4: RendererStateConfig;
    };

    // ── Flat fields from Sonnet's updated output format ──────────────────────
    /** Direction the field arrows point (flat form, supersedes field_arrows.direction) */
    field_arrow_direction?: "left" | "right" | "left_to_right" | "right_to_left";
    /** Direction electrons drift (flat form, top-level) */
    electron_drift_direction?: "left" | "right" | "none";
    /** Design / color theme block (flat form) */
    design?: {
        background?: string;
        [key: string]: unknown;
    };
    /** PVL color block (flat form) */
    pvl_colors?: {
        background?: string;
        [key: string]: unknown;
    };
    /** Formula anchor overlay config */
    formula_anchor?: {
        formula_string?: string;
        state_highlights?: {
            STATE_1?: string;
            STATE_2?: string;
            STATE_3?: string;
            STATE_4?: string;
            [key: string]: string | undefined;
        };
        [key: string]: unknown;
    };
}

/** Physics constants file shape (loaded from src/lib/physics_constants/) */
export interface PhysicsConstantsFile {
    concept: string;
    locked_facts: {
        electron_drift_direction: "opposite_to_E_field";
        conventional_current_direction: "same_as_E_field";
        thermal_speed_order: string;
        drift_speed_order: string;
        thermal_to_drift_ratio: string;
        formula: string;
        drift_proportional_to: string;
        electron_charge: number;
        electron_mass: number;
    };
    animation_constraints: {
        drift_px_per_frame_max: number;
        thermal_px_per_frame_min: number;
        thermal_must_be_faster_than_drift: boolean;
        field_arrows_point: "left_to_right" | "right_to_left";
        electrons_drift: "left_to_right" | "right_to_left";
    };
    ncert_truth_statements: string[];
    /** Pre-written ParticleFieldConfig — when present, runGraphPipeline uses this
     *  for the LEFT panel instead of calling generateConceptPrimaryHtml (Pro path).
     *  Eliminates the ~60s Gemini Flash code-generation call for engineer-supported concepts. */
    particle_field_config?: ParticleFieldConfig;
}

/** Validation result from physics_validator */
export interface ValidationResult {
    valid: boolean;
    errors: string[];
}

/** The schema description string — passed into the Sonnet prompt so it knows
 *  exactly which fields are allowed. Keep in sync with ParticleFieldConfig. */
export const RENDERER_SCHEMA_DESCRIPTION = `
ParticleFieldConfig JSON schema (output this EXACTLY):
{
  "renderer": "particle_field",
  "canvas": { "width": number, "height": number, "bg_color": "#hex" },
  "particles": {
    "count": number (15-40),
    "color": "#hex",
    "size": number (6-12),
    "trail_length": number (10-30),
    "thermal_speed": number (3.0-6.0 px/frame)
  },
  "lattice": {
    "count": number (20-60),
    "color": "#hex",
    "size": number (8-16),
    "glow": boolean
  },
  "field_arrows": {
    "color": "#hex",
    "direction": "left_to_right" | "right_to_left",
    "count": number (3-8)
  },
  "states": {
    "STATE_1": { "drift_speed": 0, "drift_direction": "none", "field_visible": false, "highlight_particle": false, "dim_others": false, "dim_opacity": 1.0, "field_strength": 0, "label": "..." },
    "STATE_2": { "drift_speed": 0.3-1.0, "drift_direction": "left"|"right", "field_visible": true, "highlight_particle": false, "dim_others": false, "dim_opacity": 1.0, "field_strength": number, "label": "..." },
    "STATE_3": { "drift_speed": 0.3-1.0, "drift_direction": "left"|"right", "field_visible": true, "highlight_particle": true, "dim_others": true, "dim_opacity": 0.12, "field_strength": number, "label": "..." },
    "STATE_4": { "drift_speed": 0.3-1.5, "drift_direction": "left"|"right", "field_visible": true, "highlight_particle": false, "dim_others": false, "dim_opacity": 1.0, "field_strength": number, "label": "..." }
  }
}
`.trim();
