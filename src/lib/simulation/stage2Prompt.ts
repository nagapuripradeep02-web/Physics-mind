// =============================================================================
// src/lib/simulation/stage2Prompt.ts
//
// Builds the prompt sent to Claude Sonnet (Stage 2) to generate a
// SimulationConfig JSON for the particle-field renderer.
//
// Stage 1 (Gemini Flash) produces a SimulationStrategy.
// Stage 2 (Sonnet) uses that strategy + locked physics constants to produce
// the concrete SimulationConfig JSON consumed by the renderer.
//
// Usage:
//   import { buildStage2Prompt } from "@/lib/simulation/stage2Prompt";
//   const prompt = buildStage2Prompt(strategy, constants, rendererSchemaStr);
//   const raw = await callSonnet(prompt);
//   const config = JSON.parse(raw) as SimulationConfig;
// =============================================================================

import type { PhysicsConstantsFile } from "@/lib/physics_constants";
import type { VariantConfig } from "@/lib/variantPicker";

// ---------------------------------------------------------------------------
// SimulationStrategy — Stage 1 (Gemini Flash) output
// ---------------------------------------------------------------------------

/**
 * The pedagogical strategy produced by Stage 1 (Gemini Flash).
 * Tells Sonnet HOW to teach the concept, not WHAT to render.
 */
export interface SimulationStrategy {
  /** Which renderer engine to use. e.g. "particle_field", "graph_interactive" */
  renderer: string;

  /** The single insight the student should gain from this simulation. */
  aha_moment: string;

  /** The specific misconception this simulation is designed to correct. */
  target_misconception?: string;

  /** A real-world analogy to weave into captions. e.g. "crowd in a corridor" */
  analogy_to_use: string;

  /** Which state IDs should be given extra teaching emphasis in captions. */
  emphasis_states: string[];

  /** Student's exam context — drives vocabulary and conceptual depth. */
  exam_target: "jee" | "boards";

  /** Vocabulary complexity level for captions. */
  vocabulary_level: "basic" | "intermediate" | "advanced";

  /**
   * Whether to include a formula_anchor overlay.
   * true  → Sonnet must include the formula_anchor block + STATE_4
   * false → formula_anchor block and STATE_4 are omitted entirely
   */
  formula_anchor: boolean;

  /** If true, begin playback at STATE_2 (skip the thermal-only STATE_1). */
  skip_state_1: boolean;
}

// ---------------------------------------------------------------------------
// buildStage2Prompt — main export
// ---------------------------------------------------------------------------

/**
 * Build the complete prompt string to send to Claude Sonnet (Stage 2).
 *
 * Sonnet's job is to output a single, valid `SimulationConfig` JSON object
 * that satisfies all 7 rules embedded in the prompt.
 *
 * @param strategy        Stage 1 pedagogical strategy (from Gemini Flash).
 * @param constants       Locked NCERT physics constants for the concept.
 * @param rendererSchema  The `SimulationConfig` TypeScript interface as a
 *                        string, included verbatim so Sonnet knows the exact
 *                        shape it must output.
 * @returns               Complete prompt string ready to send to Sonnet.
 */
export function buildStage2Prompt(
  strategy: SimulationStrategy,
  constants: PhysicsConstantsFile,
  rendererSchema: string,
  mvsContext?: string,
  simulationEmphasis?: string,
  studentBelief?: string,
  modifiedJson?: import("@/lib/jsonModifier").ModifiedSimulationJson,
  variant?: VariantConfig,
  vectorAMagnitude?: number,
  vectorBMagnitude?: number,
  maxStates?: number,
): string {
  // ── Locked scenario extraction (from concept JSON's epic_l_path) ──────────
  // When the concept JSON declares an epic_l_path with per-state physics_layer
  // scenarios, those strings are pre-built renderer functions. Sonnet must use
  // them verbatim — it cannot invent new scenario names. We extract them here
  // and inject as a HARD CONSTRAINT into the prompt below.
  const epicLStatesRaw = (constants as unknown as { epic_l_path?: { states?: unknown } })
    .epic_l_path?.states;
  const epicLStates: Array<Record<string, unknown>> = Array.isArray(epicLStatesRaw)
    ? (epicLStatesRaw as Array<Record<string, unknown>>)
    : (epicLStatesRaw && typeof epicLStatesRaw === 'object'
        ? Object.values(epicLStatesRaw as Record<string, unknown>) as Array<Record<string, unknown>>
        : []);
  let lockedScenarios: string[] = epicLStates
    .map((s) => (s?.physics_layer as Record<string, unknown> | undefined)?.scenario as string | undefined)
    .filter((v): v is string => typeof v === 'string' && v.length > 0);
  let lockedStateIntents = epicLStates.map((s) => ({
    state_id:      (s?.state_id as string) ?? '',
    label:         (s?.label as string) ?? '',
    script_intent: (s?.script_intent as string) ?? '',
    scenario:      ((s?.physics_layer as Record<string, unknown> | undefined)?.scenario as string) ?? '',
  }));

  // ── Scope-aware state cap (micro=2, local=3, global=6) ────────────────────
  // When jsonModifier passes a max_states value, slice the locked scenarios
  // and state intents so Sonnet only sees the first N slots for this scope.
  if (typeof maxStates === 'number' && maxStates > 0) {
    lockedScenarios = lockedScenarios.slice(0, maxStates);
    lockedStateIntents = lockedStateIntents.slice(0, maxStates);
    console.log(`[Stage2Prompt] max_states=${maxStates} — capped locked scenarios to ${lockedScenarios.length}`);
  }

  const hasLockedScenarios = lockedScenarios.length > 0;

  console.log('[Stage2Prompt] is_epic_c:', modifiedJson?.is_epic_c ?? false);

  if (hasLockedScenarios && !modifiedJson?.is_epic_c) {
    console.log(
      '[Stage2Prompt] injected locked scenarios:',
      JSON.stringify(lockedScenarios)
    );
  }

  // EPIC-C scenario extraction — when is_epic_c is true, Sonnet must pick
  // scenarios from available_renderer_scenarios.epic_c (wrong-belief / conflict /
  // resolution scenarios) instead of the EPIC-L teaching sequence.
  const availableRendererScenariosRaw = (constants as unknown as {
    available_renderer_scenarios?: { epic_c?: unknown };
  }).available_renderer_scenarios?.epic_c;
  const epicCScenariosFromJson: string[] = Array.isArray(availableRendererScenariosRaw)
    ? (availableRendererScenariosRaw as unknown[]).filter(
        (v): v is string => typeof v === 'string' && v.length > 0
      )
    : [];
  // Intentionally empty — do NOT hardcode vector_addition scenarios as fallback.
  // If a concept has no available_renderer_scenarios.epic_c list, Sonnet should
  // generate generic sub-scenarios from its own knowledge rather than borrow
  // vector_addition names that other concept renderers don't implement.
  const epicCScenarioFallback: string[] = [];
  const epicCScenarios: string[] = epicCScenariosFromJson.length > 0
    ? epicCScenariosFromJson
    : epicCScenarioFallback;
  if (modifiedJson?.is_epic_c) {
    console.log(
      '[Stage2Prompt] EPIC-C scenarios:',
      JSON.stringify(epicCScenarios),
      epicCScenariosFromJson.length > 0 ? '(from JSON)' : '(fallback)'
    );
  }

  const lockedScenarioBlock = (modifiedJson?.is_epic_c || !hasLockedScenarios) ? '' : `
═══ LOCKED SCENARIO NAMES — HARD CONSTRAINT ═══
This concept has pre-built renderer functions for exactly these
scenario strings. You MUST use them in physics_layer.scenario in
this exact order. Do NOT invent new strings. Do NOT paraphrase.
Copy them character-for-character:

${lockedScenarios.map((s, i) => `  State ${i + 1}: "${s}"`).join('\n')}

Teaching intent per state (use for params and panel_b only):
${JSON.stringify(lockedStateIntents, null, 2)}

If you use any scenario string not in the list above, the renderer
will show a warning banner instead of a simulation.
════════════════════════════════════════════════
`;

  const modifierBlock = modifiedJson && modifiedJson.is_epic_c ? `
═══════════════════════════════════════════════════════
MODIFIED SIMULATION JSON — FROM JSON MODIFIER
═══════════════════════════════════════════════════════
You receive a ModifiedSimulationJson. This has already been adapted for
the student's specific confusion by the JSON Modifier.

READ simulation_strategy FIRST before writing any config:
- primary_emphasis: this is the single most important thing the simulation must show
- state_3_focus: STATE_3 must demonstrate exactly this
- misconception_being_targeted: the wrong belief you are breaking
- correct_replacement: the correct physics that replaces it

locked_facts are absolute — never contradict them.
simulation_strategy is your directive — follow it precisely.

${JSON.stringify(modifiedJson, null, 2)}

` : "";

  const epicCContextBlock = modifiedJson?.is_epic_c && studentBelief ? `
═══════════════════════════════════════════════════════
EPIC-C SESSION — WRONG BELIEF RESOLUTION
═══════════════════════════════════════════════════════
This is a specific_confusion session. The student holds a confident wrong
belief. This simulation MUST correct it by showing CONFLICT, not by teaching
from scratch.

STUDENT'S WRONG BELIEF (verbatim):
"${studentBelief}"

${(vectorAMagnitude && vectorBMagnitude)
    ? `LOCKED MAGNITUDES (do NOT change these): Vector A = ${vectorAMagnitude}, Vector B = ${vectorBMagnitude}. Use these exact values in all STATE_2+ configurations.`
    : `Use the exact magnitudes the student stated in their belief. Do not change or round them.`}

RESERVED SCENARIOS (do NOT use in STATE_2 onwards):
- "va_wrong_always_larger" is reserved for STATE_1 only. It is already
  injected by the system as STATE_1. Do NOT pick it for any other state.
- If you pick va_wrong_always_larger for STATE_2+, the renderer will show
  the wrong misconception visual (a different student's belief).

SCENARIO GUIDANCE FOR FINAL STATE (STATE_6):
Use "scalar_addition_s7" for the last state — it is the ONLY
fully interactive 3-slider scenario (A, B, and θ all draggable).
This gives the student independent control to verify the pattern
with any combination. Do NOT use scalar_addition_s6 for the final
state — it has fixed A=B=5 and only one slider.

STATE_1 is provided by the system — do NOT include STATE_1 in your output.
The system injects STATE_1 from a deterministic wrong-belief template after
you finish. Your panel_a_config.epic_l_path.states object should contain
only STATE_2, STATE_3, STATE_4, STATE_5, STATE_6 (or however many states
beyond STATE_1 you need).

STATE_2 onwards must show CONFLICT with the wrong belief. Do NOT introduce
a new teaching sequence from scratch (e.g. do NOT use triangle_law as an
intro). Instead, rotate or perturb vectors so the student's prediction is
visibly wrong, then progress to resolution in STATE_3 and beyond. The |R|
magnitude in STATE_2 MUST differ from what the student predicted in STATE_1
— that delta IS the conflict the student needs to see.

HARD CONSTRAINT — physics_layer.scenario for every state must come ONLY
from this EPIC-C list:
${epicCScenarios.map((s, i) => `  ${i + 1}. "${s}"`).join('\n')}

If you output a scenario string not in this list, the server will replace
it with "${epicCScenarios[0]}" as a safe fallback — your teaching intent
will be lost. Pick scenarios from the list above.

STATE_2's script_intent and what_student_sees fields MUST explicitly
reference the student's belief so the narration anchors on WHAT is being
disproved. Example phrasing: "You expected R = 7, but watch what happens
when B rotates — the actual |R| is smaller."
═══════════════════════════════════════════════════════
` : '';

  // ── Multi-panel block (Part 4 — Phase 6) ──────────────────────────────────
  const panelCount = modifiedJson?.technology_config?.panel_count ?? 1;
  let multiPanelBlock = "";
  if (panelCount > 1 && modifiedJson?.technology_config) {
    const tc = modifiedJson.technology_config;
    const pa = modifiedJson.panel_assignment;
    multiPanelBlock = `
══════════════════════════════════════════════════════════════
DUAL-PANEL OUTPUT REQUIRED — THIS IS MANDATORY, READ CAREFULLY
══════════════════════════════════════════════════════════════

This concept requires TWO simulation panels. You MUST output a JSON
object with EXACTLY these two top-level keys:

  { "panel_a_config": { ... }, "panel_b_config": { ... } }

DO NOT output a flat single config. DO NOT use any other key names.
The downstream code reads panel_a_config and panel_b_config by name.
Any other shape causes silent failure and falls back to single panel.

────────────────────────────────────────────────────────────
PANEL A — mechanics_2d renderer (p5.js canvas)
────────────────────────────────────────────────────────────

Panel A renderer: ${tc.renderer_a ?? 'mechanics_2d'}
Panel A technology: ${tc.technology_a ?? 'p5js'}
${pa ? `Panel A emphasis: ${pa.panel_a_emphasis ?? ''}` : ''}
${pa ? `Panel A STATE_3 focus: ${pa.panel_a_state_3_focus ?? ''}` : ''}

panel_a_config MUST have this exact shape:

{
  "renderer": "mechanics_2d",
  "renderer_hint": {
    "scenario_type": "<concept_id e.g. vector_addition>",
    "panel_count": 2,
    "sync_required": true
  },
  "epic_l_path": {
    "states": {
      "STATE_1": {
        "label": "...",
        "what_student_sees": "...",
        "physics_layer": {
          "scenario": "<sub_scenario e.g. two_vectors_given>",
          "freeze_at_t": 0
        }
      },
      "STATE_2": {
        "label": "...",
        "what_student_sees": "...",
        "physics_layer": { "scenario": "<sub_scenario>", "freeze_at_t": null }
      },
      "STATE_3": {
        "label": "...",
        "what_student_sees": "...",
        "physics_layer": { "scenario": "<sub_scenario>", "freeze_at_t": null }
      },
      "STATE_4": {
        "label": "...",
        "what_student_sees": "...",
        "physics_layer": { "scenario": "<sub_scenario>", "freeze_at_t": null }
      }
    }
  }
}

RULES for panel_a_config:
- renderer_hint.scenario_type must match the concept (e.g. "vector_addition")
- physics_layer.scenario in each state controls which visual sub-scenario
  the canvas draws. Use sub-scenarios that exist in the renderer for this
  concept. For vector_addition: two_vectors_given, parallelogram_law,
  triangle_law, resultant_formula, r_vs_theta_curve, special_cases_0_90_180
- States must be inside epic_l_path.states — NOT as a flat top-level key
- STATE names must be STATE_1, STATE_2, STATE_3, STATE_4 (identical to Panel B)
- STATE_1 always gets freeze_at_t: 0 (frozen setup state)

────────────────────────────────────────────────────────────
PANEL B — graph_interactive renderer (Plotly)
────────────────────────────────────────────────────────────

Panel B renderer: ${tc.renderer_b ?? 'graph_interactive'}
Panel B technology: ${tc.technology_b ?? 'plotly'}
${pa ? `Panel B emphasis: ${pa.panel_b_emphasis ?? ''}` : ''}
${pa ? `Panel B STATE_3 focus: ${pa.panel_b_state_3_focus ?? ''}` : ''}

panel_b_config MUST have this exact shape. The graph_interactive renderer
reads these EXACT field names — any deviation renders a blank graph.

{
  "renderer": "graph_interactive",
  "x_axis": {
    "label": "Full axis name e.g. Angle between A and B",
    "symbol": "Short symbol e.g. θ",
    "min": <number>,
    "max": <number>,
    "unit": "e.g. °"
  },
  "y_axis": {
    "label": "Full axis name e.g. Resultant Magnitude",
    "symbol": "Short symbol e.g. |R|",
    "min": <number>,
    "max": <number>,
    "unit": ""
  },
  "lines": [
    {
      "id": "line_1",
      "label": "Human-readable line label",
      "formula": "Math expression using x e.g. Math.sqrt(25 + 9 + 30*Math.cos(x * Math.PI / 180))",
      "color": "#fbbf24"
    }
  ],
  "sliders": [
    { "id": "slider_1", "label": "Slider label", "min": 0, "max": 180, "default": 60 }
  ],
  "legend": [
    { "symbol": "θ", "meaning": "Angle between vectors" }
  ],
  "pvl_colors": {
    "background": "#0a0a1a",
    "grid": "#1e2030",
    "axis": "#94a3b8",
    "highlight": "#fbbf24"
  },
  "states": {
    "STATE_1": {
      "label": "State label shown as graph title",
      "active_lines": [],
      "show_sliders": false,
      "highlight_point": false
    },
    "STATE_2": {
      "label": "...",
      "active_lines": ["line_1"],
      "show_sliders": false,
      "highlight_point": false
    },
    "STATE_3": {
      "label": "...",
      "active_lines": ["line_1"],
      "show_sliders": true,
      "highlight_point": true,
      "point_x": <number within x_axis.min–max>,
      "point_y": <number within y_axis.min–max>
    },
    "STATE_4": {
      "label": "...",
      "active_lines": ["line_1"],
      "show_sliders": false,
      "highlight_point": false
    }
  }
}

CRITICAL RULES for panel_b_config:
1. lines[] MUST be a non-empty array with at least one entry.
   An empty lines array renders a completely blank Plotly graph.
2. Each line uses "formula" (a JS expression where x is the x-axis value)
   OR "slope" + "intercept" for linear lines. Never both. Never neither.
3. active_lines in each state is an array of line IDs to show.
   STATE_1 can be empty (empty axes). STATE_2+ must activate at least one.
4. pvl_colors MUST be present. The renderer crashes before render if missing.
5. STATE names must be IDENTICAL to Panel A: STATE_1, STATE_2, STATE_3, STATE_4.
6. point_x and point_y (when highlight_point is true) MUST be within the
   declared axis ranges. A point outside the range is invisible.

CONCEPT-SPECIFIC GUIDANCE for vector_addition Panel B:
  Show |R| vs θ curve: x = angle (0–180°), y = resultant magnitude
  Formula: Math.sqrt(25 + 9 + 30 * Math.cos(x * Math.PI / 180))
  This directly complements Panel A by graphing what Panel A shows visually.
  When student drags Panel A's angle slider, Panel B shows where they are on
  the curve. This is the pedagogical sync that makes dual panel powerful.

────────────────────────────────────────────────────────────
EXAMPLE — complete dual-panel output for vector_addition:
────────────────────────────────────────────────────────────

{
  "panel_a_config": {
    "renderer": "mechanics_2d",
    "renderer_hint": {
      "scenario_type": "vector_addition",
      "panel_count": 2,
      "sync_required": true
    },
    "epic_l_path": {
      "states": {
        "STATE_1": {
          "label": "Two vectors A=5 and B=3",
          "what_student_sees": "A and B at adjustable angle — drag to see resultant",
          "physics_layer": { "scenario": "two_vectors_given", "freeze_at_t": 0 }
        },
        "STATE_2": {
          "label": "Triangle law — tip to tail",
          "what_student_sees": "B placed at tip of A — resultant closes the triangle",
          "physics_layer": { "scenario": "parallelogram_law", "freeze_at_t": null }
        },
        "STATE_3": {
          "label": "R shrinks as angle grows",
          "what_student_sees": "Interactive: drag angle and watch |R| shrink",
          "physics_layer": { "scenario": "r_vs_theta_curve", "freeze_at_t": null }
        },
        "STATE_4": {
          "label": "Special cases: 0°, 90°, 180°",
          "what_student_sees": "Maximum, perpendicular, minimum resultant side by side",
          "physics_layer": { "scenario": "resultant_formula", "freeze_at_t": null }
        }
      }
    }
  },
  "panel_b_config": {
    "renderer": "graph_interactive",
    "x_axis": { "label": "Angle between A and B", "symbol": "θ", "min": 0, "max": 180, "unit": "°" },
    "y_axis": { "label": "Resultant Magnitude", "symbol": "|R|", "min": 0, "max": 9, "unit": "" },
    "lines": [
      {
        "id": "r_vs_theta",
        "label": "|R| = √(A²+B²+2AB cosθ)",
        "formula": "Math.sqrt(25 + 9 + 30 * Math.cos(x * Math.PI / 180))",
        "color": "#fbbf24"
      }
    ],
    "sliders": [
      { "id": "theta_val", "label": "θ (°)", "min": 0, "max": 180, "default": 60 }
    ],
    "legend": [
      { "symbol": "|R|", "meaning": "Resultant magnitude" },
      { "symbol": "θ", "meaning": "Angle between A and B" }
    ],
    "pvl_colors": {
      "background": "#0a0a1a", "grid": "#1e2030", "axis": "#94a3b8", "highlight": "#fbbf24"
    },
    "states": {
      "STATE_1": { "label": "What does angle do to resultant?", "active_lines": [], "show_sliders": false, "highlight_point": false },
      "STATE_2": { "label": "|R| vs θ — the curve", "active_lines": ["r_vs_theta"], "show_sliders": false, "highlight_point": false },
      "STATE_3": { "label": "Explore: drag θ, watch |R|", "active_lines": ["r_vs_theta"], "show_sliders": true, "highlight_point": true, "point_x": 60, "point_y": 7 },
      "STATE_4": { "label": "Range: |A−B| ≤ R ≤ A+B", "active_lines": ["r_vs_theta"], "show_sliders": false, "highlight_point": false }
    }
  }
}

Output your dual-panel JSON now. No markdown. Start with {
`;
  }

  // ── Technology-specific config shape hints (Part 6) ─────────────────────────
  let technologyHints = "";
  const techA = modifiedJson?.technology_config?.technology_a;
  const techB = modifiedJson?.technology_config?.technology_b;
  const rendererA = modifiedJson?.technology_config?.renderer_a;
  const rendererB = modifiedJson?.technology_config?.renderer_b;

  const isDualPanel = panelCount > 1;
  const isMechanics2D = !isDualPanel && (
    strategy.renderer === 'mechanics_2d' ||
    rendererA === 'mechanics_2d'
  );

  if (isMechanics2D) {
    technologyHints += `
═══════════════════════════════════════════════════════
MECHANICS_2D RENDERER — COMPLETE CONFIG SCHEMA
═══════════════════════════════════════════════════════
The mechanics_2d renderer reads window.SIM_CONFIG which must match this exact shape.
Every field shown is required unless marked optional.

SCENARIO TYPES (set config.scenario to exactly one of these strings):
  "projectile"         — parabolic trajectory, velocity components
  "pendulum"           — bob swing, small-angle SHM, energy bars
  "circular"           — uniform circular motion, centripetal acceleration
  "spring_mass"        — mass on spring, SHM, restoring force
  "friction"           — block on surface, static/kinetic friction
  "atwood"             — two masses over pulley, tension
  "work_energy"        — object under constant force, KE increasing
  "momentum"           — 1D collision, momentum arrows
  "torque"             — rigid body rotation about pivot
  "banking"            — banked road, normal force components
  "non_inertial_frame" — pseudo-forces in accelerating frame
  "free_body_diagram"  — static FBD, forces only, no motion

FULL CONFIG SHAPE:
{
  "scenario": string,              // one of the scenario types above

  "objects": [                     // 1 to 3 objects
    {
      "id": string,                // unique — e.g. "bob", "block", "mass_1"
      "shape": "circle" | "rect" | "pendulum_bob",
      "mass": number,              // kg
      "color": string,             // hex color e.g. "#4FC3F7"
      "initial_x": number,         // canvas pixels — starting x position
      "initial_y": number,         // canvas pixels — starting y position
      "label": string,             // shown next to object e.g. "m = 2 kg"
      "radius": number,            // optional, for circle/pendulum_bob, in meters
      "width": number,             // optional, for rect, in meters
      "height": number,            // optional, for rect, in meters

      // ── PER-OBJECT PENDULUM FIELDS (use when scenario = "pendulum") ──
      // For pendulum_bob objects — per-object pendulum parameters:
      "pendulum_length_m": number,   // (REQUIRED for each bob — the string length in meters)
      "pendulum_angle_deg": number,  // (REQUIRED for each bob — initial displacement angle)
      "pendulum_pivot_x": number,    // (REQUIRED for each bob — x pixel coordinate of the pivot point)
      "pendulum_pivot_y": number     // (REQUIRED for each bob — y pixel coordinate of the pivot point)
      // When writing a single-pendulum config: set these on the one bob AND also set ic.length_m and 
      // ic.angle_deg to the same values (for backward compatibility with the energy bar calculation).
      // 
      // When writing a dual-pendulum config (for EPIC-C mass-independence demos):
      //   - Place bob 1 pivot at approximately (width * 0.35, height * 0.12)
      //   - Place bob 2 pivot at approximately (width * 0.65, height * 0.12)
      //   - Both bobs: pendulum_length_m MUST be identical (to make L constant, varying mass)
      //   - Different masses: set obj.mass differently for each bob
      //   - Label each bob with its mass: label: "m = 0.2 kg"
      //   - ic.length_m should equal the shared L value (for energy bars)
      //   - initial_x and initial_y can be set to the equilibrium position (pivot_x, pivot_y + L*scale)
      //     but the renderer will compute the actual animated position — these are just initial defaults
    }
  ],

  "forces": [                      // list of force vectors to draw (can be empty [])
    {
      "on_object": string,         // must match an object id
      "name": string,              // label shown on arrow e.g. "mg", "N", "T"
      "direction_degrees": number, // 0=right, 90=up, 180=left, 270=down
      "magnitude": number,         // Newtons — used for proportional arrow length
      "color": string,             // hex color
      "show_in_states": [string]   // e.g. ["STATE_1", "STATE_2"] — empty = always show
    }
  ],

  "initial_conditions": {          // physics parameters — read by M2_getPos()
    // PROJECTILE:
    "v0": number,                  // initial speed m/s
    "angle_deg": number,           // launch angle degrees

    // PENDULUM:
    "length_m": number,            // string length m (global fallback for single-pendulum)
    "angle_deg": number,           // initial angle degrees

    // CIRCULAR:
    "radius_m": number,
    "speed_ms": number,
    "center_x": number,            // canvas pixels
    "center_y": number,

    // SPRING_MASS:
    "spring_k": number,            // N/m
    "amplitude_m": number,
    "phase_deg": number,

    // ATWOOD:
    "mass1_kg": number,
    "mass2_kg": number,

    // FRICTION / INCLINED_PLANE:
    "mu_s": number,                // static friction coefficient
    "mu_k": number,                // kinetic friction coefficient
    "f_applied": number,           // applied force N

    // WORK_ENERGY:
    "force_n": number,

    // MOMENTUM:
    "v1_initial": number,
    "v2_initial": number,
    "collision_time": number,

    // TORQUE:
    "moment_of_inertia": number,
    "torque_nm": number,
    "radius_m": number,

    // NON_INERTIAL_FRAME:
    "frame_acceleration_ms2": number
  },

  "states": {
    "STATE_1": {
      "label": string,             // shown in bottom-left corner of canvas
      "what_student_sees": string, // description for narration
      "time_step": number,         // loop ceiling in seconds (always required)
      "freeze_at_t": number,       // OPTIONAL — if set, freeze at this time, no loop
                                   // STATE_1: always set freeze_at_t: 0 (frozen setup)
                                   // STATE_3: set to moment of max visual impact
                                   // STATE_2, STATE_4, STATE_5, STATE_6: omit (let loop)
      "highlight_forces": [string],// optional — force names to highlight
      "show_path": boolean         // optional — show trajectory trail
    },
    "STATE_2": { ... },            // same shape
    "STATE_3": { ... },            // aha moment — set freeze_at_t here
    "STATE_4": { ... },            // explore — no freeze_at_t
    "STATE_5": { ... },            // confusion-targeted (if needed)
    "STATE_6": { ... }             // comparison state (if needed)
  },

  // OPTIONAL STRUCTURAL ELEMENTS:
  "surface": {
    "exists": boolean,
    "slope_degrees": number,       // 0 for horizontal, >0 for incline
    "color": string
  },

  "pulley": {                      // include for atwood and single-pendulum
    "x": number,                   // canvas pixels
    "y": number,
    "radius": number               // pixels
  },

  "spring": {                      // include for spring_mass
    "anchor_x": number,
    "anchor_y": number,
    "natural_length_m": number
  },

  "show_components": boolean,      // show velocity component decomposition
  "show_path": boolean,            // show trajectory trail globally
  "show_labels": boolean,          // show object labels
  "show_energy_bar": boolean,      // show KE/PE/Total energy bars
  "canvas_scale": number,          // pixels per meter — typically 50 to 100
  "canvas_width": number,          // default 800
  "canvas_height": number,         // default 500

  "pvl_colors": {
    "background": string           // canvas background hex e.g. "#0A0A1A"
  }
}

STATE COUNT RULES:
- Default: 4 states (STATE_1 through STATE_4)
- Use 5 states when: student has a specific confirmed misconception 
  (add STATE_5 as confusion-targeted state)
- Use 6 states when: concept benefits from a comparison 
  (STATE_6 shows two objects/scenarios side by side)
- STATE_1: always freeze_at_t: 0 — frozen setup, no motion
- STATE_3: always the aha moment — set freeze_at_t to the most visually 
  impactful moment
- STATE_4: always the explore/interactive state — no freeze_at_t, loops

DUAL-PENDULUM PATTERN (for EPIC-C mass-independence simulations):
When simulation_emphasis says "show mass independence" or "show two pendulums":
- Use 2 pendulum_bob objects with IDENTICAL pendulum_length_m but DIFFERENT mass
- Set pendulum_pivot_x: 240 for bob 1, pendulum_pivot_x: 520 for bob 2
- Set pendulum_pivot_y: 60 for both
- Set canvas_width: 800, canvas_height: 500
- DO NOT include cfg.pulley when using per-object pivot fields
- Label each bob with its mass: "m = 0.2 kg", "m = 2.0 kg"
- STATE_3 freeze_at_t: compute as 0.25 * 2 * PI * sqrt(L / 9.8) 
  (quarter period — bottom of swing, maximum velocity)

EXAMPLE — single pendulum config (STATE_1 frozen, STATE_3 frozen at apex):
{
  "scenario": "pendulum",
  "objects": [{
    "id": "bob",
    "shape": "pendulum_bob",
    "mass": 0.5,
    "color": "#4FC3F7",
    "initial_x": 400,
    "initial_y": 200,
    "label": "m = 0.5 kg",
    "radius": 0.2,
    "pendulum_length_m": 1.0,
    "pendulum_angle_deg": 25,
    "pendulum_pivot_x": 400,
    "pendulum_pivot_y": 60
  }],
  "forces": [],
  "initial_conditions": { "length_m": 1.0, "angle_deg": 25 },
  "states": {
    "STATE_1": { "label": "Setup", "time_step": 5, "freeze_at_t": 0 },
    "STATE_2": { "label": "Swinging", "time_step": 6 },
    "STATE_3": { "label": "Maximum speed", "time_step": 5, "freeze_at_t": 1.57 },
    "STATE_4": { "label": "Explore", "time_step": 8 }
  },
  "pulley": { "x": 400, "y": 60, "radius": 14 },
  "show_labels": true,
  "show_energy_bar": true,
  "canvas_scale": 150,
  "canvas_width": 800,
  "canvas_height": 500,
  "pvl_colors": { "background": "#0A0A1A" }
}
`;
  }


  if (techA === 'threejs' || techB === 'threejs') {
    technologyHints += `
═══════════════════════════════════════════════════════
FIELD_3D RENDERER (Three.js) — CONFIG SHAPE
═══════════════════════════════════════════════════════
Panel using field_3d renderer (Three.js) expects this config shape:
{
  "renderer": "field_3d",
  "scene_type": "electric_field" | "magnetic_field" | "em_induction",
  "charge_positions": [{ "x": number, "y": number, "charge": number }],
  "field_lines_count": number,
  "camera_position": { "x": number, "y": number, "z": number },
  "states": {
    "STATE_1": { "description": string, "charge_scale": number },
    "STATE_2": { ... },
    "STATE_3": { ... },
    "STATE_4": { ... }
  }
}

`;
  }

  if (techA === 'mixed' || techB === 'mixed') {
    technologyHints += `
═══════════════════════════════════════════════════════
THERMODYNAMICS RENDERER (mixed p5.js + Plotly) — CONFIG SHAPE
═══════════════════════════════════════════════════════
Panel using thermodynamics renderer (mixed p5.js + Plotly) expects:
{
  "renderer": "thermodynamics",
  "process_type": "isothermal" | "adiabatic" | "isochoric" | "isobaric",
  "initial_state": { "P": number, "V": number, "T": number },
  "final_state":   { "P": number, "V": number, "T": number },
  "pv_diagram": { "show": boolean, "curve_type": string },
  "states": {
    "STATE_1": { "description": string },
    "STATE_2": { ... },
    "STATE_3": { ... },
    "STATE_4": { ... }
  }
}

`;
  }

  if (techB === 'plotly') {
    technologyHints += `
═══════════════════════════════════════════════════════
GRAPH_INTERACTIVE RENDERER (Plotly) — PANEL B CONFIG
═══════════════════════════════════════════════════════
The graph_interactive renderer reads window.SIM_CONFIG with these exact
field names. Any deviation causes blank graph or crash.

REQUIRED top-level fields:
  renderer: "graph_interactive"
  x_axis: { label, symbol, min, max, unit }
  y_axis: { label, symbol, min, max, unit }
  lines: [ { id, label, formula OR (slope+intercept), color } ]
  pvl_colors: { background, grid, axis, highlight }  ← REQUIRED or crash
  states: { STATE_N: { label, active_lines, show_sliders, highlight_point } }

OPTIONAL fields:
  sliders: [ { id, label, min, max, default } ]
  legend: [ { symbol, meaning } ]

KEY RULES:
- lines[] must have at least 1 entry (empty array = blank graph)
- active_lines in each state = array of line.id strings to show
- highlight_point: true requires point_x and point_y within axis ranges
- formula field: JS expression where x = x-axis value
  e.g. "Math.sqrt(25 + 9 + 30*Math.cos(x * Math.PI / 180))"
- state names must be STATE_1..STATE_4 matching Panel A exactly

`;
  }

  return `${modifierBlock}${multiPanelBlock}${technologyHints}
You are a physics simulation configuration writer for PhysicsMind,
an AI physics tutor for Indian Class 10-12 students.

Your job: Write a SimulationConfig JSON object. Nothing else.
Do not explain. Do not add commentary. Output only valid JSON.
${typeof maxStates === 'number' && maxStates > 0 ? `
IMPORTANT: Generate exactly ${maxStates} states (STATE_1 through STATE_${maxStates}). Do not generate more.
` : ''}

═══════════════════════════════════════════════════════
LOCKED PHYSICS FACTS — YOU CANNOT OVERRIDE THESE
═══════════════════════════════════════════════════════
Concept: ${constants.concept}

${Array.isArray(constants.locked_facts)
  ? (constants.locked_facts as string[]).map((f: string, i: number) => `${i + 1}. ${f}`).join("\n")
  : Object.entries(constants.locked_facts as Record<string, unknown>).map(([k, v]) => `${k}: ${v}`).join("\n")}

Animation constraints (these become numeric values in your config):
${constants.animation_constraints
  ? Object.entries(constants.animation_constraints)
      .map(([k, v]) => `${k}: ${v}`)
      .join("\n")
  : "No animation constraints specified — use physics equations from locked_facts to determine values."}

═══════════════════════════════════════════════════════
STUDENT CONTEXT — PERSONALISE FOR THIS STUDENT
═══════════════════════════════════════════════════════
Exam target: ${strategy.exam_target}
Vocabulary level: ${strategy.vocabulary_level}
Analogy to use: ${strategy.analogy_to_use}
Aha moment to target: ${strategy.aha_moment}
Target misconception: ${strategy.target_misconception ?? "none"}
Emphasis states: ${JSON.stringify(strategy.emphasis_states)}
Formula anchor needed: ${strategy.formula_anchor}

${simulationEmphasis ? `
═══════════════════════════════════════════════════════
CRITICAL — STUDENT-SPECIFIC CONFUSION EMPHASIS
═══════════════════════════════════════════════════════
This student has a specific wrong belief that this simulation MUST correct.

Student's wrong belief: "${studentBelief}"
What the simulation must show: "${simulationEmphasis}"

This is not a generic simulation. STATE_2 or STATE_3 must be designed as the direct visual proof that the student's belief above is wrong. The aha_moment from the brief is secondary — the confusion correction is primary.
` : ''}
═══════════════════════════════════════════════════════
RENDERER SCHEMA — YOUR OUTPUT MUST MATCH THIS EXACTLY
═══════════════════════════════════════════════════════
${rendererSchema}

═══════════════════════════════════════════════════════
RULES — FOLLOW ALL OF THEM
═══════════════════════════════════════════════════════

${strategy.renderer === 'particle_field' ? `
RULE 1 — PHYSICS DIRECTION
electron_drift_direction must be the OPPOSITE of field_arrow_direction.
The locked facts above tell you which direction electrons drift.
Do not invent a direction. Use what is in locked_facts.

RULE 2 — SPEED HIERARCHY  
particles.thermal_speed must be at least 100x larger than any 
drift_speed value in any state.
thermal_speed: use 4.0 (pixels/frame, represents 10^6 m/s order)
STATE_2 drift_speed: use 0.8 maximum
STATE_3 drift_speed: same as STATE_2 (spotlight doesn't change speed)

RULE 3 — STATE PROGRESSION
STATE_1: No field. No drift. Pure thermal chaos. caption explains this.
STATE_2: Field on. All electrons drift. caption connects E to vd.
STATE_3: Spotlight. highlight_particle=true, highlight_index=0. 
         caption references the analogy: ${strategy.analogy_to_use}
         caption must mention tau if formula_anchor is true.
STATE_4: Only include if strategy.formula_anchor is true.
         slider_active=true. caption invites student to experiment.

RULE 4 — FORMULA ANCHOR (only if formula_anchor=true)
Include formula_anchor object.
formula_string: use the formula from locked_facts exactly.
state_highlights:
  STATE_1: []
  STATE_2: ["E", "vd"]  
  STATE_3: ["tau", "vd"]
  STATE_4: ["E", "tau", "vd"]
Variable colors must match PVL:
  vd → "#66BB6A"
  E  → "#FF9800"  
  tau → "#FFFFFF"
  e, m → "#90A4AE" (constants, always grey)

RULE 5 — PVL COLORS
pvl_colors must use these exact hex values:
  electron: "#42A5F5"
  positive_ion: "#90A4AE"
  field_arrow: "#FF9800"
  spotlight: "#FFFFFF"
  drift_velocity: "#66BB6A"
  background: "#0A0A1A"
  labels: "#D4D4D8"

RULE 6 — CONSTANTS PRECISION
Use these exact values in live_calculation.formula. 
No rounding. No approximation.
  electron_charge: 1.6e-19   (NOT 1.60e-19, NOT 1.602e-19)
  electron_mass:   9.1e-31   (NOT 9.11e-31, NOT 9.109e-31)
Correct:   "(1.6e-19 * E * tau) / 9.1e-31"
Incorrect: "(1.60e-19 * E * tau) / 9.11e-31"
Also in live_calculation, display_unit must be "mm/s" — drift velocity is order of 1mm/s.
Showing m/s produces values like 0.000001 which confuses students.
` : `
RULE 1 — STATE PROGRESSION
You are generating a config for the "${strategy.renderer}" renderer — NOT particle_field.
Do NOT include drift velocity, electron thermal speed, or field arrow direction fields.
Generate exactly 6 states (STATE_1 through STATE_6) unless the concept JSON's simulation_states field specifies a different count.

Each state represents ONE distinct visual moment — a single meaningful change in the simulation canvas. If the canvas does not change meaningfully between two states, merge them into one.

The 6-state arc to follow:
- STATE_1: The phenomenon only. Show it visually. No explanation yet. Hook the student. Canvas shows the end result before the mechanism.
- STATE_2: Isolate the first component or cause. Strip everything else away.
- STATE_3: Isolate the second component or cause. Show it alone.
- STATE_4: Combine both components. Show the interaction or mechanism.
- STATE_5: THE AHA MOMENT. The single visual event that resolves the student's confusion. Maximum canvas change. This is the climax.
- STATE_6: Student interaction. One slider or control active. Student verifies understanding by changing something and watching the result.

STATE_5 is the most important state. It must show the one thing that makes the concept click. The canvas change in STATE_5 must be the largest and most dramatic of all states.

VALID SCENARIO VALUES FOR mechanics_2d — use ONLY one of these strings:
projectile | pendulum | circular | friction | atwood | work_energy |
momentum | torque | banking | spring_mass | non_inertial_frame |
free_body_diagram

CONCEPT PEDAGOGY — use this to write state descriptions and emphasis:
aha_moment: ${JSON.stringify((constants as unknown as Record<string, unknown>).aha_moment ?? {})}
simulation_states: ${JSON.stringify((constants as unknown as Record<string, unknown>).simulation_states ?? [])}

The state labels and what_student_sees descriptions in your config
MUST reflect the simulation_states above, not generic descriptions.
The scenario field MUST be one of the valid values listed above.

MISCONCEPTION CONTEXT:
${studentBelief ? `student_belief: ${studentBelief}` : ''}
${simulationEmphasis ? `simulation_emphasis: ${simulationEmphasis}` : ''}
common_misconceptions: ${JSON.stringify(((constants as unknown as Record<string, unknown>).common_misconceptions as unknown[] ?? []).slice(0, 2))}

RENDERER HINT from concept JSON:
${JSON.stringify((constants as unknown as Record<string, unknown>).renderer_hint ?? {})}

RULE 2 — FORMULA ANCHOR
If the locked_facts contain a formula, include a formula_anchor object.
formula_string: use the formula from locked_facts exactly.
Use physically meaningful variable names and colors from the concept's domain.
Background: "#0A0A1A", labels: "#D4D4D8"

RULE 3 — PHYSICAL ACCURACY
All numeric values (forces, speeds, angles, temperatures, pressures) must be
physically realistic for the concept. Use locked_facts as the source of truth.
Do not invent values that contradict the physics.

RULE 4 — STATE COUNT
Generate exactly 6 states (STATE_1 through STATE_6) unless the concept JSON's simulation_states field specifies a different count.
Use 4 states only for static free_body_diagram concepts.

Each state represents ONE distinct visual moment — a single meaningful change in the simulation canvas. If the canvas does not change meaningfully between two states, merge them into one.

The 6-state arc to follow:
- STATE_1: The phenomenon only. Show it visually. No explanation yet. Hook the student. Canvas shows the end result before the mechanism.
- STATE_2: Isolate the first component or cause. Strip everything else away.
- STATE_3: Isolate the second component or cause. Show it alone.
- STATE_4: Combine both components. Show the interaction or mechanism.
- STATE_5: THE AHA MOMENT. The single visual event that resolves the student's confusion. Maximum canvas change. This is the climax.
- STATE_6: Student interaction. One slider or control active. Student verifies understanding by changing something and watching the result.

STATE_5 is the most important state. It must show the one thing that makes the concept click. The canvas change in STATE_5 must be the largest and most dramatic of all states.

RULE 5 — LABEL DENSITY
- Maximum 2 labels visible per state.
- Never put two labels within 60px of each other.
- Prioritize the force being taught in this state. Hide others.
- Use show_in_states to reveal forces progressively, not all at once.

RULE 6 — LANGUAGE
- state.label: maximum 4 words. Simple English only.
- what_student_sees: one sentence. Maximum 20 words.
- No technical terms without a plain word alongside:
  write "pseudo force (fake force)" not just "pseudo force"

RULE 7 — TIME_STEP REQUIREMENTS (critical for visible animation)
ANIMATION REQUIREMENT: Set time_step at the top level of every config AND on every state object.
Minimum time_step values by renderer type:
  mechanics_2d: 0.016 | wave_canvas: 0.016 | field_3d: 0.020
  thermodynamics: 0.016 | particle_field: 0.016
  circuit_live: 0.016 | graph_interactive: 0.050 | optics_ray: 0.016
A missing or zero time_step causes a completely frozen/static simulation.

freeze_at_t (optional number): If provided, the simulation freezes at exactly this simulation time (seconds) 
and holds there — it does not loop. Use this for:
  - STATE_1 (setup): always set freeze_at_t: 0 to show frozen initial position
  - STATE_3 (aha moment): set to the time of maximum visual impact
    - pendulum: T/4 (bottom of swing, max velocity) = 0.25 * 2π√(L/g)
    - projectile: half of time_of_flight (apex)
    - spring_mass: quarter period (max compression or extension)
    - circular: 0 (showing full circle at start is fine, or set to 1 second)
  - STATE_2, STATE_4: omit freeze_at_t — let it loop with time_step
Do NOT set freeze_at_t on STATE_2 or STATE_4. Those states must animate.

For mechanics_2d, each state also has a simulation-time progression value (cumulative seconds of physics simulated at that state). Use AT LEAST the values below:

Scenario              STATE_1  STATE_2  STATE_3  STATE_4  STATE_5  STATE_6
projectile            0        1.2      2.8      4.5      5.0      6.0
pendulum              0        0.8      2.0      3.5      4.5      5.5
circular              0        1.0      2.5      4.0      5.0      6.0
spring_mass           0        0.6      1.5      3.0      4.0      5.0
non_inertial_frame    0        2.0      3.5      5.0      6.0      7.0
friction              0        0.8      2.0      3.5      4.5      5.5
atwood                0        0.8      2.0      3.5      4.5      5.5
torque                0        1.0      2.5      4.0      5.0      6.0
banking               0        0        0        0        0        0
momentum              0        0.5      1.2      2.5      3.5      4.5
work_energy           0        1.0      2.5      4.0      5.0      6.0
free_body_diagram     0        0        0        0        0        0

MINIMUM initial_condition values for visible motion:
- v0 (launch speed): minimum 15, recommended 20–25
- angle_deg: minimum 30, recommended 45
- frame_acceleration_ms2: minimum 8, recommended 10
- amplitude_m (spring/pendulum): minimum 0.4, recommended 0.6
- length_m (pendulum): minimum 1.0, recommended 1.5
- radius_m (circular): minimum 1.5, recommended 2.0
- speed_ms (circular): minimum 8, recommended 12

RULE 8 — FORCE MAGNITUDE MINIMUMS (for visible arrows)
- Any force: minimum 15 N
- Weight/gravity for 5 kg object: exactly 49 N — do not reduce
- Applied force: minimum 20 N
- Pseudo force: exactly m × frame_acceleration (never less)
`}
RULE 3B — MISCONCEPTION CORRECTION (CRITICAL)
${mvsContext 
    ? `The student explicitly holds this misconception:\nEXACT CONFUSION: "${mvsContext}"\nYou MUST explicitly design one of the states (usually STATE_2 or STATE_3) to directly DISPROVE this specific confusion in the visual configuration or caption. Make it obvious.`
    : `If Target misconception is not "none", you MUST explicitly design one of the states (usually STATE_2 or STATE_3) to directly DISPROVE this misconception in the visual configuration or caption. Make it obvious.`
}

RULE 7 — CAPTIONS
Each state caption must be under 120 characters.
STATE_3 caption must reference what the student will SEE, not just 
what the concept is.
Good: "Watch electron 0 zigzag — each collision resets its drift. 
       That reset time is tau."
Bad:  "This state shows the relaxation time tau."

RULE 8 — OUTPUT FORMAT
Output a single JSON object.
Start with { and end with }.
No markdown. No code fences. No explanation before or after.
The JSON must be parseable by JSON.parse() with zero modifications.
${lockedScenarioBlock}
${epicCContextBlock}
═══════════════════════════════════════════════════════
NOW WRITE THE CONFIG
═══════════════════════════════════════════════════════
${variant && variant.variant_id ? `

═══════════════════════════════════════════════════════
VARIANT INSTRUCTION — REGENERATION REQUEST
═══════════════════════════════════════════════════════
The student thumbs-downed the previous simulation.
Variant: ${variant.variant_id}. Do NOT repeat the default explanation.

Use approach: "${variant.approach_pill_label}"
Pedagogical angle: "${variant.teacher_angle}"
Start the simulation at state: ${variant.entry_state} (skip all earlier states).
Focus locked_facts on: ${variant.locked_facts_focus?.join(", ") ?? "core concept only"}.

This explanation must feel genuinely different from the default.
Different visual entry point, different teaching emphasis.
Do not open with the same hook or the same first scenario as the default.
` : ""}
  `.trim();
}
