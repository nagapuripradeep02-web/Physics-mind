import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import Anthropic from "@anthropic-ai/sdk";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import type { QuestionFingerprint } from "@/lib/intentClassifier";
import { logUsage } from "@/lib/usageLogger";
import { searchNCERT } from "@/lib/ncertSearch";
import { extractNCERTSearchQuery } from "@/lib/ncertQueryExtractor";
import { isConceptInNCERT } from "@/lib/ncertSyllabusCheck";
import { lookupConceptMap, type ConceptMapEntry } from "@/lib/conceptMapLookup";
import { identifyConfusion, type ConfusionMatch } from "@/lib/confusionIdentifier";
import { trimNcertChunk } from "@/lib/teacherEngine";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// v5 Phase A imports
import type { ParticleFieldConfig, PhysicsConstantsFile, ValidationResult } from "@/lib/renderer_schema";
import { RENDERER_SCHEMA_DESCRIPTION } from "@/lib/renderer_schema";
import { validatePhysics, validatePhysicsForConcept, CONCEPT_FILE_MAP } from "@/lib/physics_validator";
import { runVisualValidationAsync } from "@/lib/validators/visual/integrate";
import { PARTICLE_FIELD_RENDERER_CODE } from "@/lib/renderers/particle_field_renderer";
import { GRAPH_INTERACTIVE_RENDERER_CODE } from "@/lib/renderers/graph_interactive_renderer";
import {
    type OhmsLawConfig,
    OHMS_LAW_CONFIG_SCHEMA,
    OHMS_LAW_CONFIG_FALLBACK,
    assembleOhmsLawHTML,
} from "@/lib/renderers/ohmsLawRenderer";
import {
    type Mechanics2DConfig,
    type MechanicsState,
    assembleMechanics2DHtml,
} from "@/lib/renderers/mechanics_2d_renderer";
import { assembleParametricHtml } from "@/lib/renderers/parametric_renderer";
import {
    type WaveCanvasConfig,
    assembleWaveCanvasHtml,
} from "@/lib/renderers/wave_canvas_renderer";
import {
    type OpticsRayConfig,
    assembleOpticsRayHtml,
} from "@/lib/renderers/optics_ray_renderer";
import {
    type Field3DConfig,
    assembleField3DHtml,
} from "@/lib/renderers/field_3d_renderer";
import {
    type ThermodynamicsConfig,
    assembleThermodynamicsHtml,
} from "@/lib/renderers/thermodynamics_renderer";
import { loadConstants } from "@/lib/physics_constants/index";
// v5 Phase B imports
import { checkNcertTruth } from "@/lib/ncertTruthAnchor";
import { buildEpicState1, type EpicState1 } from "@/lib/epicStateBuilder";
import { runJsonModifier, type ModifiedSimulationJson } from "@/lib/jsonModifier";
import { getPanelConfig } from "@/config/panelConfig";
import type { PanelConfig } from "@/lib/panelConfig";
import { runStage2 } from "@/lib/simulation/stage2Runner";
import type { SimulationStrategy } from "@/lib/simulation/stage2Prompt";
import { generateCircuitSimConfig } from "@/lib/simulation/circuitSimRunner";
import { applyRendererModifier } from "@/lib/rendererModifier";

// =============================================================================
// TYPES — Stage 1 (SimulationBrief) + Stage 2 (PhysicsConfig)
// =============================================================================

export type VisualizationType =
    | "particle_flow"
    | "wave"
    | "graph"
    | "field_lines"
    | "orbital"
    | "circuit"
    | "optics"
    | "force_diagram";

export type SimEngine = "p5js" | "plotly" | "threejs";

export type ConfusionType =
    | "visualization"        // student can't picture what's happening
    | "scale_intuition"      // numbers don't match intuition (too big/small)
    | "cause_effect"         // student confused about what causes what
    | "direction"            // sign/direction confusion
    | "formula_vs_physics"   // memorised formula but no physical meaning
    | "analogy_failure"      // wrong mental model or analogy
    | "multi_step"           // can't connect 2+ concepts together
    | "beyond_ncert";        // concept not in NCERT curriculum

/** Stage 1 output — Flash writes this from the student context */
export interface SimulationBrief {
    concept: string;
    visualization_type: VisualizationType;
    student_confusion: string;
    confusion_type: ConfusionType;
    key_insight_to_show: string;
    aha_moment: {
        what_to_show: string;          // exact visual that produces the "aha"
        why_this_works: string;        // pedagogical reason
    };
    ncert_chapter: string;
    class_level: string;
    mode: "conceptual" | "board" | "jee";
    beyond_ncert: boolean;
    knowledge_source: "ncert" | "flash_knowledge";
    interactive_variables: Array<{
        name: string;
        affects: string;
        label: string;
        min: number;
        max: number;
    }>;
    labels_to_show: string[];
    physics_equations: string[];
    color_scheme: string;
    animation_emphasis: string;
    validation: {
        does_simulation_address_confusion: boolean;
        confidence?: number;   // 0-1 confidence score from Flash
        reason: string;
    };
}

/** A single object in the scene */
export interface PhysicsObject {
    id: string;
    type: "particle_system" | "rectangle" | "circle" | "arrow" | "line" | "sphere" | "ring" | "trace";
    count?: number;
    color: string;
    glow?: boolean;
    thermal_speed?: number;
    drift_speed?: number;
    trail_length?: number;
    label?: string;
    opacity?: number;
    radius?: number;
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    /** For plotly traces: data expression strings evaluated at runtime */
    x_expr?: string;
    y_expr?: string;
}

export interface PhysicsControl {
    type: "slider" | "button" | "toggle";
    id: string;
    label: string;
    min?: number;
    max?: number;
    default?: number;
    step?: number;
    affects: string;
    multiplier?: number;
    toggles?: string;
}

export interface PhysicsAnnotation {
    text: string;
    x: number;
    y: number;
    color: string;
    size: number;
}

export interface PhysicsEquation {
    text: string;
    x: number;
    y: number;
    color: string;
}

export interface PhysicsCanvas {
    width: number;
    height: number;
    bg: string;
}

export interface PhysicsAnimation {
    type: "continuous_loop" | "triggered" | "progressive";
    fps: number;
    show_velocity_vectors?: boolean;
    highlight_net_drift?: boolean;
    electric_field_arrows?: boolean;
}

/** Stage 2 output — Pro writes this from SimulationBrief; engines execute it */
export interface PhysicsConfig {
    engine: SimEngine;
    canvas: PhysicsCanvas;
    objects: PhysicsObject[];
    animation: PhysicsAnimation;
    controls: PhysicsControl[];
    annotations: PhysicsAnnotation[];
    equations: PhysicsEquation[];
}

export interface StudentContext {
    question: string;
    concept: string;
    classLevel: string;
    mode: string;
    ncertChapter?: string;
    recentMessages?: string[];   // last 3 message texts for context
    confusionPoint?: string;     // from teacherEngine if available
    mvsContext?: string;         // from explicit MVS verification step
    simulation_emphasis?: string; // from extractStudentConfusion — what to visually emphasise
    student_belief?: string;      // from extractStudentConfusion — what the student currently believes
}

export interface ImageConceptResult {
    concept_id: string;
    topic: string;
    formula: string;
    diagram_description: string;
    class_level: string;
    chapter: string;
    question_text: string;
    source_type: 'ncert' | 'non_ncert';
    confidence: number;
    student_work_detected: boolean;
}

/** Single-panel simulation result (existing) */
export interface SinglePanelResult {
    type?: 'single_panel';
    physicsConfig: PhysicsConfig;
    engine: SimEngine;
    brief: SimulationBrief;
    simHtml: string;          // Stage 3 — executable p5js / plotly HTML
    primarySimHtml?: string;  // dual layouts: particle_field panel HTML
    teacherScript: TeacherScriptStep[] | null;  // Stage 4 — aligned script steps
    fromCache: boolean;
    conceptKey: string;
}

/** Multi-panel simulation result (Phase 6) */
export interface MultiPanelResult {
    type: 'multi_panel';
    panel_a: Record<string, unknown>;
    panel_b: Record<string, unknown>;
    sync_required: boolean;
    primary_panel: 'panel_a' | 'panel_b';
    shared_states: string[];
    brief: SimulationBrief;
    teacherScript: TeacherScriptStep[] | null;
    fromCache: boolean;
    conceptKey: string;
}

export type SimulationResult = SinglePanelResult | MultiPanelResult;

/** Internal: shape of a simulation_cache row for the new pipeline */
export interface SimCacheRow {
    physics_config: PhysicsConfig;
    engine: string | null;
    sim_brief: SimulationBrief | null;
    sim_html: string | null;   // Stage 3 HTML
    secondary_sim_html?: string | null;  // Panel B HTML for multi_panel
    sim_type?: string | null;  // 'multi_panel' or null/absent for single
    served_count: number;
}

// =============================================================================
// VIZ TYPE → ENGINE mapping
// =============================================================================

const VIZ_TO_ENGINE: Record<VisualizationType, SimEngine> = {
    particle_flow: "p5js",
    wave: "p5js",
    field_lines: "p5js",
    force_diagram: "p5js",
    circuit: "p5js",
    optics: "p5js",
    graph: "plotly",
    orbital: "threejs",
};

const VIZ_TYPE_KEYWORDS: Array<{ keywords: string[]; type: VisualizationType }> = [
    { keywords: ["drift", "electron", "current", "particle", "photon", "photoelectric", "solenoid", "faraday", "induction", "magnetic field", "electric field"], type: "particle_flow" },
    { keywords: ["wave", "oscillat", "interference", "diffraction", "sound", "transverse", "longitudinal"], type: "wave" },
    { keywords: ["vi characteristic", "v-i", "graph", "plot", "curve", "shm graph", "pv diagram", "displacement time", "velocity time"], type: "graph" },
    { keywords: ["field line", "electric flux", "gauss"], type: "field_lines" },
    { keywords: ["orbital", "bohr", "atomic model", "electron cloud", "rutherford", "nucleus", "atom", "molecule"], type: "orbital" },
    { keywords: ["circuit", "kvl", "kcl", "ohm", "series", "parallel", "emf", "resistor"], type: "circuit" },
    { keywords: ["refraction", "reflection", "lens", "prism", "ray", "snell", "mirror", "optics"], type: "optics" },
    { keywords: ["force", "newton", "friction", "tension", "torque", "projectile", "collision"], type: "force_diagram" },
];

function guessVizType(concept: string): VisualizationType {
    const c = concept.toLowerCase();
    for (const { keywords, type } of VIZ_TYPE_KEYWORDS) {
        if (keywords.some(kw => c.includes(kw))) return type;
    }
    return "particle_flow"; // safe default
}

// =============================================================================
// CONCEPT-SPECIFIC VISUALIZATION GUIDANCE
// Injected into Brief prompt so each concept gets an appropriate simulation
// instead of always defaulting to microscopic electron drift
// =============================================================================

const CONCEPT_SIM_GUIDANCE: Record<string, string> = {
    ohms_law: `CRITICAL — VISUALIZATION GUIDANCE FOR OHM'S LAW:
You MUST design a MACROSCOPIC conductor/resistor simulation showing R = ρL/A.
Show: A cylindrical wire/conductor whose length (L) and cross-section area (A) can change visually.
- When length increases → resistance increases → current decreases (for same voltage)
- When area increases → resistance decreases → current increases
- V = IR: show current as animated flow arrows or moving charges through the conductor
- visualization_type MUST be "circuit"
- Interactive variables MUST include: voltage (V), wire_length (L), cross_section_area (A)
- DO NOT show microscopic electrons zigzagging, lattice ions, or drift velocity
- Show: conductor rod (resizable), battery/voltage source, ammeter display, animated current flow
- The aha moment should make R = ρL/A intuitive by visually changing wire dimensions`,

    photoelectric: `CRITICAL — VISUALIZATION GUIDANCE FOR PHOTOELECTRIC EFFECT:
You MUST design a photoelectric effect apparatus simulation.
Show: A metal plate/cathode illuminated by incident light (photons shown as wave packets or arrows).
- When frequency > threshold: electrons are ejected from the surface with kinetic energy
- When frequency < threshold: NO electrons ejected regardless of intensity (KEY AHA MOMENT)
- Increasing intensity = more photons = more electrons ejected (but same max KE per electron)
- visualization_type MUST be "particle_flow"
- Interactive variables MUST include: frequency, intensity
- Show: photon beam hitting plate, electrons being ejected, energy level diagram
- DO NOT show generic drift velocity, lattice ions, or conductor internals`,

    drift_velocity: `VISUALIZATION FOR DRIFT VELOCITY:
Show microscopic view inside a metallic conductor.
- Free electrons with random thermal motion (zigzagging between lattice ions)
- Stationary positive lattice ions in a grid pattern
- When voltage applied: electric field appears, electrons acquire slow net drift
- visualization_type MUST be "particle_flow"
- Key insight: drift speed (mm/s) is much smaller than thermal speed (10^5 m/s)
- Interactive variables: voltage/field strength, temperature`,

    resistivity: `VISUALIZATION FOR RESISTIVITY:
Show how material properties affect resistance using R = ρL/A.
- Compare different materials with different resistivities
- visualization_type MUST be "circuit"
- Show conductor with adjustable material type, length, and area`,

    kirchhoffs_laws: `VISUALIZATION FOR KIRCHHOFF'S LAWS:
Show a circuit with clearly labeled nodes and branches.
- Animated current flow through branches
- KCL: currents entering a node = currents leaving (show with arrows and values)
- KVL: sum of voltage drops around a loop = EMF
- visualization_type MUST be "circuit"`,

    coulombs_law: `VISUALIZATION FOR COULOMB'S LAW:
Show two charged particles/spheres with force vectors between them.
- F = kq1q2/r^2: force arrows change size as charges or distance change
- Attractive (opposite charges) vs repulsive (same charges)
- visualization_type MUST be "force_diagram"
- Interactive variables: charge1, charge2, distance`,

    electromagnetic_induction: `VISUALIZATION FOR ELECTROMAGNETIC INDUCTION:
Show a magnet moving through a coil or a changing magnetic field through a loop.
- When flux changes: EMF is induced, current flows
- Faster change = larger EMF (Faraday's law)
- visualization_type MUST be "field_lines"
- Show: coil, magnet, field lines, galvanometer/current indicator`,

    resistance_temperature_dependence: `CRITICAL — VISUALIZATION GUIDANCE FOR TEMPERATURE DEPENDENCE OF RESISTANCE:
You MUST show the MICROSCOPIC mechanism inside a conductor at different temperatures.
The 4 states MUST progress as follows:

STATE_1 — LOW TEMPERATURE (cold conductor):
- Lattice ions vibrate with SMALL amplitude (barely moving, tight circles ≤3px radius)
- Blue electrons drift smoothly left with few collisions
- Caption: "Low temperature: lattice ions barely vibrate — electrons drift smoothly"

STATE_2 — HIGH TEMPERATURE (hot conductor):
- Lattice ions vibrate with LARGE amplitude (vigorous circles 10-15px radius)
- Make ions visibly RED/orange to show heat
- Electrons collide more frequently and drift MORE SLOWLY (visibly slower net drift)
- Caption: "High temperature: ions vibrate vigorously — electrons collide more often, drift slows"

STATE_3 — SPOTLIGHT on relaxation time tau:
- Keep high-temperature vibrations
- Highlight ONE electron with a bright glow
- Show collision events as bright flashes
- Caption: "Each collision resets the electron's direction — tau (mean free time) shrinks at high T"

STATE_4 — INTERACTIVE temperature slider:
- Temperature slider (0–100) directly controls ion vibration amplitude AND electron collision rate
- Show formula: ρ = m/(ne²τ) updating live — as T↑, τ↓, ρ↑
- Caption: "Drag the temperature slider — watch how resistance grows as vibrations increase"

IMPLEMENTATION RULES:
- visualization_type MUST be "particle_flow"
- Ion vibration amplitude MUST be controlled by temperature parameter: amp = 2 + temp * 0.13 (px)
- Electron collision interval MUST decrease with temperature: collisionFrames = max(4, 40 - temp*0.36)
- Electron drift speed MUST decrease as temperature increases: driftSpeed = 0.8 * (1 - temp*0.006)
- Show a TEMPERATURE DISPLAY in top-right corner (e.g. "T = 300K")
- Use color: ions WHITE/grey at low T, RED at high T (lerp based on temperature)
- Electric field arrows always visible (orange, pointing right)
- Electrons always blue (#42A5F5), drift LEFT
- Dark background #0A0A1A

DRAW ORDER — follow exactly (top to bottom inside draw):
1. p.background('#0A0A1A')
2. drawFieldArrows()
3. drawLatticeIons()   ← MUST come before electrons
4. drawElectrons()     ← draw electrons ON TOP of ions
5. updateSliderDisplay() — LAST, after all drawing, with null guard:
   var el = document.getElementById('tempVal'); if (el) el.innerHTML = Math.round(temp);

PARTICLE SIZE — electrons and ions MUST be large enough to see:
- Electrons: p.ellipse(x, y, 10, 10) — 10px diameter minimum
- Lattice ions: p.ellipse(x, y, 14, 14) — 14px diameter minimum`,

    series_resistance: `CRITICAL — VISUALIZATION GUIDANCE FOR CURRENT CONSERVATION IN SERIES CIRCUIT:
The student believes current REDUCES after a resistor. You MUST design a MICROSCOPIC particle simulation
that directly disproves this misconception by showing current (electron drift) is IDENTICAL before AND after the resistor.

The 4 states MUST progress as follows:

STATE_1 — NO FIELD (pure thermal motion):
- Electrons zigzag randomly with fast thermal motion — no net drift left or right
- Caption: "No electric field — electrons move randomly, no current flows"
- field_visible: false, drift_speed: 0

STATE_2 — CURRENT ON (KEY STATE — the aha moment):
- Electric field arrows appear pointing RIGHT
- Electrons drift LEFT at a UNIFORM speed throughout the entire wire — LEFT of resistor, THROUGH resistor, RIGHT of resistor
- CRITICAL: drift speed must be visibly the SAME on both sides of the resistor
- Show a bright label: "Current = SAME everywhere in the circuit"
- Caption: "E field applied — electrons drift left at identical speed before AND after the resistor"

STATE_3 — SPOTLIGHT one electron:
- Highlight ONE electron and track it as it passes THROUGH the resistor without slowing down
- Show a collision event INSIDE the resistor (voltage drop happens HERE, not current drop)
- Caption: "Watch this electron: it slows briefly at collision but the FLOW RATE stays constant"

STATE_4 — INTERACTIVE resistance slider:
- Resistance slider (1Ω–10Ω) changes the overall drift speed (I = V/R_total)
- But drift speed stays EQUAL before and after the resistor for any resistance value
- Show: I_before = I_after label updating live
- Caption: "Drag resistance slider — current changes for whole circuit, but stays equal at every point"

IMPLEMENTATION RULES:
- visualization_type MUST be "particle_flow"
- MUST show a visible resistor component in the middle of the wire (draw a rectangle/zigzag symbol)
- Electrons must drift LEFT (right_to_left)
- Electric field arrows point RIGHT (left_to_right)
- Dark background #0A0A1A
- Electrons: blue #42A5F5, size 10px minimum
- DO NOT show R = ρL/A, DO NOT show length/area sliders — this is about current conservation, not resistivity`,

    electric_power_heating: `CRITICAL — VISUALIZATION GUIDANCE FOR ELECTRIC POWER & JOULE HEATING:
You MUST design a MICROSCOPIC view inside a resistor showing electron-lattice-ion collisions producing heat.
Show: A wire segment with lattice ions in a grid. Electrons drift through, colliding with ions.
Each collision → yellow-orange starburst flash + ion vibrates more intensely.
- The KEY insight: doubling current QUADRUPLES heat (P = I²R, not P = IR)
- visualization_type MUST be "particle_flow"
- Show a resistor segment with lattice ions arranged in a grid
- Electrons drift LEFT through the lattice, bouncing off ions
- Each collision: yellow flash at the ion, ion vibrates with increasing amplitude
- Resistor background colour shifts: grey → orange → red-white as current increases

The 4 states MUST progress as follows:

STATE_1 — NO FIELD (no current):
- Electrons zigzag randomly with thermal motion — no drift, no collisions with net energy transfer
- Lattice ions stationary, grey coloured
- Caption: "No current — resistor at room temperature, no heat produced"

STATE_2 — CURRENT ON:
- Electric field arrows appear, electrons drift LEFT
- Collisions produce small yellow flashes at ion locations
- Resistor starts glowing faint orange
- Show power meter: P = I²R = some value
- Caption: "Current flows — electrons collide with ions, converting electrical energy to heat"

STATE_3 — CURRENT DOUBLED (AHA MOMENT):
- Double the drift speed from STATE_2
- Collision flash rate and brightness QUADRUPLE (not double!)
- Resistor glows 4x brighter — visually dramatic jump
- Power meter jumps from P to 4P
- Bold text overlay: "Double I → 4× Heat (P = I²R)"
- Caption: "Current doubled — but power QUADRUPLED! P = I²R means heat scales as current squared"

STATE_4 — INTERACTIVE:
- Current slider (0.5A to 4A)
- As student drags: collision flash rate, glow intensity, and power meter all scale as I²
- Caption: "Drag the current slider — watch power rise as I², not linearly"

IMPLEMENTATION RULES:
- Electrons: blue #42A5F5, drift LEFT
- Lattice ions: orange #FF9800, arranged in grid, vibrate when current flows
- Collision flash: yellow-white starburst (#FFD700), fades over 15-20 frames
- Dark background #0A0A1A
- Electrons: 8-10px, ions: 12-14px
- Power meter: top-right corner, updates live`,
};


// Concept-specific state descriptions used to build StateMachineSpec for Stage 4 teacher script.
// Keyed by concept_id. Each entry maps STATE_1..STATE_4 to what the student actually sees.
// When present, these replace the generic "Initial setup — observe the apparatus" defaults.
const CONCEPT_STATE_DESCRIPTIONS: Record<string, Record<string, string>> = {
    resistance_temperature_dependence: {
        STATE_1: "LOW TEMPERATURE: lattice ions barely vibrate (small circles) — blue electrons drift smoothly leftward through the conductor with few collisions",
        STATE_2: "HIGH TEMPERATURE: ions glow red/orange and vibrate vigorously (large circles) — electrons collide frequently and drift visibly slower, reducing current",
        STATE_3: "SPOTLIGHT on relaxation time τ: one electron is highlighted — watch it zigzag between collisions; each collision resets its direction — τ shrinks at high temperature, meaning higher resistance",
        STATE_4: "INTERACTIVE: drag the Temperature slider — ion vibration amplitude grows, collision rate increases, and drift speed drops; the formula ρ = m/(ne²τ) updates live showing ρ rising",
    },
    ohms_law: {
        STATE_1: "CIRCUIT at rest: ammeter reads 0A, voltmeter reads 0V — no voltage applied, no current flows",
        STATE_2: "VOLTAGE APPLIED: electrons drift through the wire; ammeter shows current proportional to voltage — V = IR in action",
        STATE_3: "DOUBLE THE VOLTAGE: voltage doubles, current doubles — the straight I–V graph confirms Ohm's Law: same resistance, double the current",
        STATE_4: "INTERACTIVE: drag the Voltage slider — current changes proportionally; the I–V graph plots each point in real time showing the linear relationship",
    },
    kirchhoffs_laws: {
        STATE_1: "CIRCUIT with two branches: current entering node A splits into two paths — see colour-coded arrows showing current direction in each branch",
        STATE_2: "KCL at node A: arrows show I₁ = I₂ + I₃ — current in equals current out; numbers update live",
        STATE_3: "KVL around loop: voltage rises across battery, drops across each resistor — the sum around the loop equals zero",
        STATE_4: "INTERACTIVE: adjust resistance sliders — watch currents redistribute; KCL and KVL equations update automatically",
    },
    series_resistance: {
        STATE_1: "NO FIELD: electrons move randomly with fast thermal zigzag — no net drift, no current flows through the series circuit",
        STATE_2: "CURRENT ON: the electric field is applied — electrons drift uniformly LEFT at the SAME speed before AND after the resistor, showing current is conserved throughout the series path",
        STATE_3: "SPOTLIGHT: one electron is highlighted — watch it pass through the resistor without slowing down; the resistor creates a voltage drop (V = IR) not a current drop",
        STATE_4: "INTERACTIVE: drag the Resistance slider — current (drift speed) drops as total resistance rises, but it stays identical at every point in the circuit (I = V / R_total)",
    },
    electric_power_heating: {
        STATE_1: "NO CURRENT: electrons zigzag randomly — lattice ions are stationary, resistor is cool and grey, no heat produced",
        STATE_2: "CURRENT ON: electrons drift left, colliding with lattice ions — yellow flashes appear at collision points, resistor starts glowing orange, power meter shows P = I²R",
        STATE_3: "CURRENT DOUBLED: collision flash rate and glow QUADRUPLE — power meter jumps from P to 4P, bold text shows 'Double I → 4× Heat'. This is the aha moment: P = I²R is quadratic, not linear",
        STATE_4: "INTERACTIVE: drag the current slider — watch collision flashes, glow intensity, and power meter all scale as I². The P vs I² graph on the right traces the parabolic curve in real time",
    },
};

function getConceptStateDescriptions(conceptId: string): Record<string, string> | null {
    if (CONCEPT_STATE_DESCRIPTIONS[conceptId]) return CONCEPT_STATE_DESCRIPTIONS[conceptId];
    for (const [key, descs] of Object.entries(CONCEPT_STATE_DESCRIPTIONS)) {
        if (conceptId.includes(key)) return descs;
    }
    return null;
}

function getConceptSimGuidance(conceptId: string): string {
    if (CONCEPT_SIM_GUIDANCE[conceptId]) return CONCEPT_SIM_GUIDANCE[conceptId];
    for (const [key, guidance] of Object.entries(CONCEPT_SIM_GUIDANCE)) {
        if (conceptId.includes(key)) return guidance;
    }
    return "";
}

// =============================================================================
// HARDCODED FALLBACK CONFIGS — Pro stage safety net
// One per visualization_type, guaranteed to work with any engine
// =============================================================================

function hardcodedFallbackConfig(vizType: VisualizationType, brief: SimulationBrief): PhysicsConfig {
    const engine = VIZ_TO_ENGINE[vizType];
    const base: PhysicsConfig = {
        engine,
        canvas: { width: 800, height: 400, bg: "#0f1117" },
        objects: [],
        animation: { type: "continuous_loop", fps: 60 },
        controls: [{
            type: "slider", id: "speed", label: "Speed",
            min: 0, max: 10, default: 5, step: 0.5, affects: "particle_speed", multiplier: 0.1
        }],
        annotations: brief.labels_to_show.map((text, i) => ({
            text, x: 16, y: 20 + i * 22, color: "#94a3b8", size: 13
        })),
        equations: brief.physics_equations.map((text, i) => ({
            text, x: 16, y: 360 + i * 20, color: "#f59e0b"
        })),
    };

    if (engine === "p5js") {
        base.objects = [
            { id: "particles", type: "particle_system", count: 100, color: "#60a5fa", glow: true, thermal_speed: 40, drift_speed: 0.5, trail_length: 4 },
            { id: "wire", type: "rectangle", color: "#f97316", opacity: 0.25 },
        ];
    } else if (engine === "plotly") {
        base.objects = [
            { id: "curve", type: "trace", color: "#3b82f6", x_expr: "range(0,10,0.1)", y_expr: "x.map(v=>v*v)" }
        ];
    } else {
        base.objects = [
            { id: "nucleus", type: "sphere", color: "#f97316", radius: 0.5, glow: true },
            { id: "electron", type: "sphere", color: "#60a5fa", radius: 0.15, glow: true },
        ];
    }
    return base;
}

// =============================================================================
// DEFAULT BRIEF — Flash stage safety net (no AI call)
// =============================================================================

function defaultBrief(concept: string, classLevel: string, mode: string, fingerprint?: QuestionFingerprint): SimulationBrief {
    const vizType = fingerprint?.concept_id
        ? guessVizType(fingerprint.concept_id)
        : guessVizType(concept);

    return {
        concept,
        visualization_type: vizType,
        student_confusion: `Understanding the physical behavior of ${concept}`,
        confusion_type: "visualization",
        key_insight_to_show: `The key physics of ${concept}`,
        aha_moment: {
            what_to_show: `Animated visualization of ${concept}`,
            why_this_works: "Seeing the physics helps build correct mental models",
        },
        ncert_chapter: fingerprint?.ncert_chapter ?? "Physics",
        class_level: classLevel,
        mode: (mode as "conceptual" | "board" | "jee") ?? "conceptual",
        beyond_ncert: false,
        knowledge_source: "ncert",
        interactive_variables: [
            { name: "intensity", affects: "particle_speed", label: "Field Strength", min: 0, max: 10 }
        ],
        labels_to_show: [`Concept: ${concept}`],
        physics_equations: [],
        color_scheme: "blue_particles_orange_wire",
        animation_emphasis: `Show the main behavior of ${concept}`,
        validation: {
            does_simulation_address_confusion: true,
            reason: "Default fallback simulation",
        },
    };
}

// =============================================================================
// STAGE 1 — generateSimulationBrief()  [gemini-2.5-flash]
// =============================================================================

const BRIEF_WRITER_SYSTEM = `You are a world-class physics visualization director and creative designer for Indian students (Class 10-12).
Your job: read a student's EXACT question and design a SimulationBrief JSON that will make this concept unforgettable.

CREATIVITY DIRECTIVE:
Do not design a generic circuit animation. Design something visually stunning that burns the concept into memory.
Think like a film director: what is the ONE dramatic visual that makes this concept click forever?
Use colour drama — electrons that shift from cool blue to blazing white as energy increases.
Use scale contrast — show thermal velocity (chaotic, frantic) vs drift velocity (ghostly slow) in the same frame.
Use surprise moments — at a key state, something unexpected happens that makes the student say "ohh, THAT is why".
Use visual metaphors — a resistor that glows red-hot, a junction where coloured streams split and recombine, a battery whose
gold glow shrinks as internal resistance steals energy.
The constants JSON you receive contains a visual_drama block — read it carefully and build your brief around those dramatic moments.
The Config Writer will translate your creative vision into exact values. Express it fully here.

PHYSICS RULES:
- Focus on the student's EXACT confusion point, NOT the general topic
- The aha_moment.what_to_show MUST be something you can animate (particles moving, curves changing, etc.)
- physics_equations MUST be correct NCERT formulas with proper notation
- If the concept is not in NCERT, set beyond_ncert=true and knowledge_source="flash_knowledge"
- Output ONLY valid JSON, no explanation, no markdown fences

COGNITIVE SCIENCE DIRECTIVE — READ THIS BEFORE WRITING THE BRIEF:

IF the session has student_belief and simulation_emphasis fields populated (specific_confusion session):

COGNITIVE SCIENCE DIRECTIVE — EPIC-C PROTOCOL

This block applies ONLY when both 'student_belief' AND 'simulation_emphasis' are populated in the session. If either is missing, skip this block entirely and write a standard EPIC-L brief.

STATE_1 is defined by the EPIC STATE_1 CONTRACT injected above. Do NOT write or modify STATE_1. Write STATE_2 through STATE_6 only.

---

WHAT YOU ARE DOING:
The student holds a specific wrong belief about how physics works. Your job is to write STATE_2 through STATE_6 that break that belief. STATE_1 (the wrong belief visualization) is already defined by code — you do not touch it.

---

STATE_2 — ISOLATE COMPONENT A
Introduce the first isolated component or measurement that challenges the wrong belief. Do not reveal the full answer yet. Create tension.
Example: "We now add a real ammeter at the first position and measure."

---

STATE_3 — ISOLATE COMPONENT B
Isolate the second component or continue building the mechanism that contradicts the wrong belief.

---

STATE_4 — COMBINATION/MECHANISM
Show how the isolated components interact together to form the correct physical reality.

---

STATE_5 — THE CLIMAX (MANDATORY — this is simulation_emphasis in full force)

This state is the entire reason the simulation exists. Read 'simulation_emphasis' and build STATE_5 around it at maximum intensity.

STATE_5 must make the correct physics visually undeniable by direct contrast with STATE_1. If STATE_1 showed values decreasing, STATE_5 must show the same measurement positions now all displaying identical values — simultaneously.

Include the aha_moment referencing student_belief directly. Format: "Student believed [exact phrase from student_belief]. STATE_5 shows [what simulation_emphasis reveals]. This is the moment of belief change."

---

STATE_6 — CONSOLIDATION + INTERACTIVE

Student takes control. Sliders, draggable components, or adjustable values. The correct physics must hold under every condition the student can set. Label: "Try any combination. The pattern holds."

---

SIMPLICITY RULE — MANDATORY:
The animation_emphasis field must describe only what is ESSENTIAL to break the belief.
Do NOT include: ghost overlays, split-screen comparisons, sponge icons, cyan beams,
pulsing effects, question mark animations, or music cue visuals.
These cause the code generator to produce broken JavaScript.

The minimum viable EPIC-C simulation is:
- STATE_2: ammeters flickering/recalibrating, caption "measuring for real"
- STATE_3: isolating individual components
- STATE_4: joining them to show the mechanism
- STATE_5: all 3 ammeters showing identical values in green, electrons uniform density
- STATE_6: two sliders, all ammeters always equal

Nothing else. Every additional visual effect is a crash risk.

---

IF this is a full_explanation session (no specific confusion):

You are applying EPIC-L protocol. The student wants to understand a concept. Structure the brief to build from what they likely already know:

- STATE_1: Phenomenon hook (what the student has experienced in daily life)
- STATE_2: Isolate component A (introduce the first piece of the microscopic mechanism)
- STATE_3: Isolate component B (introduce the second piece)
- STATE_4: Combination/mechanism (how pieces interact)
- STATE_5: Aha moment climax (connect mechanism to the formula)
- STATE_6: Student interaction (let student change variables)

The aha_moment must create a connection between the macroscopic phenomenon and the microscopic mechanism.`;

function buildConceptMapSection(entry: ConceptMapEntry): string {
    const lines: string[] = [
        `PHYSICS CONCEPT MAP ENTRY:`,
        `Formula: ${entry.formula ?? "N/A"}`,
    ];
    if (entry.what_if_rules?.length) {
        lines.push(`What-If Rules (USE THESE for hypothetical questions):`);
        entry.what_if_rules.forEach((r, i) => lines.push(`${i + 1}. ${r}`));
    }
    if (entry.why_rules?.length) {
        lines.push(`Why Rules (USE THESE for why/how questions):`);
        entry.why_rules.forEach((r, i) => lines.push(`${i + 1}. ${r}`));
    }
    if (entry.misconceptions?.length) {
        lines.push(`Common Misconceptions to address:`);
        entry.misconceptions.forEach(m => lines.push(`- ${m}`));
    }
    lines.push(
        `INSTRUCTION: Use the above rules as ground truth.`,
        `Do not contradict any what_if_rule or why_rule.`,
        `The formula given above is authoritative.`
    );
    return lines.join("\n");
}

function buildBriefPrompt(
    ctx: StudentContext,
    ncertContext: string,
    conceptMapEntry?: ConceptMapEntry | null,
    confusionMatch?: ConfusionMatch | null,
    conceptId?: string,
    epicState1?: EpicState1,
): string {
    const isEpicC = !!(ctx.student_belief && ctx.simulation_emphasis);

    if (isEpicC) {
        // Compact EPIC-C brief path. Schema is IDENTICAL to the EPIC-L path below
        // (JSON.parse at line 903 requires the full SimulationBrief shape), but the
        // content rules force shorter strings so Sonnet doesn't truncate at ~10k chars.
        const epicContractC = epicState1 ? `EPIC STATE_1 CONTRACT — DO NOT MODIFY — BUILT BY CODE:
${JSON.stringify(epicState1, null, 2)}

STATE_1 IS CLOSED. Write STATE_2 onwards only (within the same schema below).

` : "";

        return `${epicContractC}${BRIEF_WRITER_SYSTEM}

STUDENT QUESTION: "${ctx.question}"
CONCEPT: ${ctx.concept}
CLASS LEVEL: ${ctx.classLevel}
MODE: ${ctx.mode}
SESSION TYPE: specific_confusion
STUDENT_BELIEF: ${ctx.student_belief}
SIMULATION_EMPHASIS: ${ctx.simulation_emphasis}
PROTOCOL: EPIC-C (compact content, full schema)

NCERT CONTEXT (grounding only, do not paraphrase):
${ncertContext}
${conceptId ? (() => { const g = getConceptSimGuidance(conceptId); return g ? `\n${g}\n` : ""; })() : ""}
Output EXACTLY this JSON schema (no extra keys, no markdown):
{
  "concept": "<specific sub-concept name>",
  "visualization_type": "particle_flow"|"wave"|"graph"|"field_lines"|"orbital"|"circuit"|"optics"|"force_diagram",
  "student_confusion": "<1 sentence — the student's exact confusion>",
  "confusion_type": "visualization"|"scale_intuition"|"cause_effect"|"direction"|"formula_vs_physics"|"analogy_failure"|"multi_step"|"beyond_ncert",
  "key_insight_to_show": "<1 sentence>",
  "aha_moment": {
    "what_to_show": "<short visual description>",
    "why_this_works": "<short pedagogical reason>"
  },
  "ncert_chapter": "<chapter name>",
  "class_level": "${ctx.classLevel}",
  "mode": "${ctx.mode}",
  "beyond_ncert": <true|false>,
  "knowledge_source": "ncert"|"flash_knowledge",
  "interactive_variables": [
    { "name": "<id>", "affects": "<short>", "label": "<short>", "min": <number>, "max": <number> }
  ],
  "labels_to_show": ["<label1>", "<label2>"],
  "physics_equations": ["<eq1>"],
  "color_scheme": "<brief>",
  "animation_emphasis": "<short — what moves and how>",
  "validation": {
    "does_simulation_address_confusion": <true|false>,
    "confidence": <0.0 to 1.0>,
    "reason": "<short>"
  }
}

EPIC-C BREVITY RULES (schema unchanged, only content is compact):
- student_confusion ≤ 120 chars
- key_insight_to_show ≤ 120 chars
- aha_moment.what_to_show ≤ 140 chars; why_this_works ≤ 140 chars
- animation_emphasis ≤ 200 chars
- color_scheme ≤ 80 chars
- No long captions. No formulas in prose — formulas belong in physics_layer.
- STATE_1 is injected post-hoc from epicState1 — do NOT describe it here.`;
    }

    const confusionSection = confusionMatch && confusionMatch.confusion_id !== "general_understanding"
        ? `\nIDENTIFIED STUDENT CONFUSION:
Confusion ID: ${confusionMatch.confusion_id} (confidence: ${(confusionMatch.confidence * 100).toFixed(0)}%)
The simulation MUST show: ${confusionMatch.simulation_must_show}
Response MUST address: ${confusionMatch.response_must_address}
Target aha visual: ${confusionMatch.aha_visual}`
        : "";

    const epicContract = epicState1 ? `EPIC STATE_1 CONTRACT — DO NOT MODIFY THIS — IT IS BUILT BY CODE NOT BY YOU:
${JSON.stringify(epicState1, null, 2)}

YOUR JOB IN THIS BRIEF:
- If type is WRONG_BELIEF_LIVE_CIRCUIT: Do NOT write STATE_1. It is already defined above. Write STATE_2 through STATE_6 only.
- If type is WRONG_BELIEF_MECHANICS: Do NOT write STATE_1. It is already defined above by state_1_render_spec. Write STATE_2 through STATE_6 only. STATE_2 must rotate vector B to a non-zero angle to introduce conflict; the naive R label stays visible but the actual diagonal is shorter. Do NOT include any cosθ, sqrt, formula box, or angle arc in STATE_1 — those belong in STATE_3+.
- If type is BASELINE_NO_CURRENT: You may write all 6 states normally.

STATE_1 IS CLOSED. DO NOT REOPEN IT.

` : "";

    return `${epicContract}${BRIEF_WRITER_SYSTEM}

STUDENT QUESTION: "${ctx.question}"
CONCEPT: ${ctx.concept}
CLASS LEVEL: ${ctx.classLevel}
MODE: ${ctx.mode}
${ctx.confusionPoint ? `DETECTED CONFUSION POINT: ${ctx.confusionPoint}` : ""}
${ctx.recentMessages?.length ? `RECENT CHAT (last 3):\n${ctx.recentMessages.join("\n")}` : ""}
${confusionSection}
${ctx.student_belief && ctx.simulation_emphasis
        ? `\nSESSION TYPE: specific_confusion
STUDENT_BELIEF: ${ctx.student_belief}
SIMULATION_EMPHASIS: ${ctx.simulation_emphasis}
PROTOCOL: EPIC-C (see Cognitive Science Directive above)`
        : `\nSESSION TYPE: full_explanation
PROTOCOL: EPIC-L (see Cognitive Science Directive above)`}

NCERT CONTEXT:
${ncertContext}
${conceptMapEntry ? `\n${buildConceptMapSection(conceptMapEntry)}` : ""}
${conceptId ? (() => { const g = getConceptSimGuidance(conceptId); return g ? `\n${g}\n` : ""; })() : ""}
Output EXACTLY this JSON schema (no extra keys, no markdown):
{
  "concept": "<specific sub-concept name, NOT generic>",
  "visualization_type": "particle_flow"|"wave"|"graph"|"field_lines"|"orbital"|"circuit"|"optics"|"force_diagram",
  "student_confusion": "<1 sentence: the EXACT thing the student is confused about>",
  "confusion_type": "visualization"|"scale_intuition"|"cause_effect"|"direction"|"formula_vs_physics"|"analogy_failure"|"multi_step"|"beyond_ncert",
  "key_insight_to_show": "<1 sentence: the core insight the animation will reveal>",
  "aha_moment": {
    "what_to_show": "<exact visual: e.g. 'electrons zigzagging rapidly while slowly drifting left'>",
    "why_this_works": "<pedagogical reason why seeing this resolves the confusion>"
  },
  "ncert_chapter": "<chapter name from NCERT>",
  "class_level": "${ctx.classLevel}",
  "mode": "${ctx.mode}",
  "beyond_ncert": <true if concept not in NCERT Class 10-12, else false>,
  "knowledge_source": "ncert"|"flash_knowledge",
  "interactive_variables": [
    { "name": "<variable_id>", "affects": "<what changes in animation>", "label": "<UI label>", "min": <number>, "max": <number> },
    { "name": "<variable_id2>", "affects": "<what changes>", "label": "<UI label>", "min": <number>, "max": <number> }
  ],
  "labels_to_show": ["<physics label 1>", "<physics label 2>"],
  "physics_equations": ["<correct equation 1>", "<correct equation 2>"],
  "color_scheme": "<brief description: e.g. 'blue electrons, orange wire, yellow field arrows'>",
  "animation_emphasis": "<exact description of what moves and how: e.g. 'electrons zigzag fast (thermal) + drift slowly left (net)'>",
  "validation": {
    "does_simulation_address_confusion": <true|false>,
    "confidence": <0.0 to 1.0 — your confidence that this simulation is physically correct and pedagogically effective>,
    "reason": "<why it does or doesn't directly address the confusion>"
  }
}`;
}

export async function generateSimulationBrief(
    ctx: StudentContext,
    fingerprint?: QuestionFingerprint,
    epicState1?: EpicState1,
): Promise<SimulationBrief> {
    try {
        // FIX 1: Unified NCERT search query extraction
        const conceptId = fingerprint?.concept_id ?? ctx.concept;
        const rawPhrase = extractNCERTSearchQuery(conceptId, ctx.question);

        // Curated NCERT search phrases for known concepts — the raw
        // underscore→space conversion ("ohms_law" → "ohms law") often misses
        // NCERT content that uses proper names and related terms.
        const NCERT_SEARCH_PHRASES: Record<string, string> = {
            'ohms_law': "Ohm's law resistance current voltage",
            'series_resistance': "resistors in series resistance current",
            'wheatstone_bridge': "Wheatstone bridge galvanometer balanced",
            'kirchhoffs_laws': "Kirchhoff's law junction loop",
            'drift_velocity': "drift velocity electrons current",
        };

        const searchPhrase = NCERT_SEARCH_PHRASES[conceptId] || rawPhrase;
        console.log("[aiSimGen] NCERT search phrase:", `"${searchPhrase}"`, "from concept_id:", conceptId);

        // Phase 2A: parallel NCERT search + concept map lookup
        const [ncertChunks, conceptMapEntry] = await Promise.all([
            searchNCERT(searchPhrase, ctx.classLevel, 2, conceptId).catch(() => []),
            lookupConceptMap(conceptId, ctx.classLevel).catch(() => null),
        ]);

        console.log("[ConceptMap]", conceptMapEntry
            ? `found: ${conceptMapEntry.concept_id}`
            : "not found — Flash uses own knowledge");

        // Phase 2C: identify which confusion pattern the student has
        const confusionMatch = identifyConfusion(
            ctx.question,
            ctx.recentMessages ?? [],
            conceptMapEntry?.confusion_patterns ?? null
        );
        if (confusionMatch.confusion_id !== "general_understanding") {
            console.log("[confusionId]", confusionMatch.confusion_id,
                `(confidence: ${(confusionMatch.confidence * 100).toFixed(0)}%)`);
        }

        const ncertContext = ncertChunks.length
            ? ncertChunks.map((c, i) => `[${i + 1}] ${c.chapter_name}: ${trimNcertChunk(c.content_text).trim().slice(0, 1200)}`).join("\n\n")
            : `Standard NCERT Class ${ctx.classLevel} physics.`;

        // FIX 2: Accurate beyond_ncert flag based on syllabus, not search results
        const genuinelyBeyondNCERT = !isConceptInNCERT(conceptId);

        const prompt = buildBriefPrompt(ctx, ncertContext, conceptMapEntry, confusionMatch, conceptId, epicState1);

        // Stage 1: claude-sonnet-4-6 writes the brief from student context + NCERT
        const message = await anthropic.messages.create({
            model: "claude-sonnet-4-6",
            max_tokens: 4000,
            temperature: 0.3,
            messages: [{ role: "user", content: prompt }],
        });
        const text = (message.content[0] as { type: "text"; text: string }).text;

        const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
        const brief = JSON.parse(cleaned) as SimulationBrief;

        // Validate required fields
        if (!brief.visualization_type || !brief.concept) throw new Error("Missing required fields");

        // Override Flash's self-reported values with ground truth
        brief.knowledge_source = ncertChunks.length > 0 ? "ncert" : "flash_knowledge";
        brief.beyond_ncert = genuinelyBeyondNCERT;

        console.log("[aiSimGen] BRIEF GENERATED:", {
            viz_type: brief.visualization_type,
            confusion_type: brief.confusion_type,
            knowledge_source: brief.knowledge_source,
            beyond_ncert: brief.beyond_ncert,
            ncert_chunks: ncertChunks.length,
            confidence: brief.validation?.confidence,
            equations: brief.physics_equations,
        });
        return brief;
    } catch (err) {
        console.warn("[aiSimGen] ⚠️ Brief generation failed, using default:", err);
        return defaultBrief(ctx.concept, ctx.classLevel, ctx.mode, fingerprint);
    }
}

// =============================================================================
// STAGE 2 — generatePhysicsConfig()  [gemini-2.5-pro]
// =============================================================================

const CONFIG_ENGINEER_SYSTEM = `You are a physics simulation engineer. Given a SimulationBrief, output a PhysicsConfig JSON that a rendering engine will execute directly.
Be extremely specific about every visual detail.
The simulation MUST be lively, animated, and interactive.
Every slider MUST visibly change the physics in real-time.
Always output engine: "p5js" in the PhysicsConfig. Never output engine: undefined or omit the engine field. All simulations use p5js regardless of visualization type.
Output ONLY valid JSON, no explanation, no markdown fences.`;

const CONFIG_STRICT_SUFFIX = `
ADDITIONAL REQUIREMENTS (this is a retry — be more precise):
- objects array MUST have at least 2 items
- controls array MUST have at least 1 slider
- annotations array MUST have at least 1 entry
- All color values must be valid hex strings
- All numeric values must be plain numbers, not strings`;

function buildConfigPrompt(brief: SimulationBrief, strict = false, simulation_emphasis?: string, student_belief?: string): string {
    const engine = VIZ_TO_ENGINE[brief.visualization_type];
    const emphasisBlock = simulation_emphasis
        ? `PRIMARY EMPHASIS FOR THIS SIMULATION:
${simulation_emphasis}

Student currently believes: ${student_belief ?? "unknown"}

Your simulation config MUST visually demonstrate the above emphasis above all else. This overrides generic concept presentation.

`
        : "";
    return `${emphasisBlock}${CONFIG_ENGINEER_SYSTEM}

SIMULATION BRIEF:
${JSON.stringify(brief, null, 2)}

TARGET ENGINE: ${engine}
${strict ? CONFIG_STRICT_SUFFIX : ""}

Output a JSON object:
{
  "engine": "${engine}",
  "canvas": { "width": 800, "height": 400, "bg": "#0f1117" },
  "objects": [...],
  "animation": { "type": "continuous_loop", "fps": 60, ... },
  "controls": [...],
  "annotations": [{ "text": string, "x": number, "y": number, "color": string, "size": number }],
  "equations": [{ "text": string, "x": number, "y": number, "color": string }]
}

For engine="${engine}":
${engine === "p5js" ? `- objects: particle_system, rectangle, arrow, line
- particle_system needs: count, color, glow (bool), thermal_speed, drift_speed, trail_length
- controls affect particle drift_speed or field arrow visibility` : ""}
${engine === "plotly" ? `- objects type="trace": needs x_expr, y_expr (JS expressions using a variable t or x)
- controls update trace data in real-time via multipliers` : ""}
${engine === "threejs" ? `- objects: sphere (nucleus/electron), ring (orbital path)
- add glow:true to nucleus, OrbitControls enabled` : ""}`;
}

function validatePhysicsConfig(cfg: unknown): cfg is PhysicsConfig {
    if (typeof cfg !== "object" || cfg === null) return false;
    const c = cfg as Record<string, unknown>;
    return (
        typeof c.engine === "string" &&
        Array.isArray(c.objects) && c.objects.length >= 1 &&
        Array.isArray(c.controls) &&
        Array.isArray(c.annotations) &&
        typeof c.canvas === "object" && c.canvas !== null
    );
}

export async function generatePhysicsConfig(
    brief: SimulationBrief,
    opts: { temperature?: number; simulation_emphasis?: string; student_belief?: string } = {}
): Promise<PhysicsConfig> {
    for (let attempt = 1; attempt <= 2; attempt++) {
        try {
            const prompt = buildConfigPrompt(brief, attempt === 2, opts.simulation_emphasis, opts.student_belief);
            console.log(`[aiSimGen] 🔧 GENERATING CONFIG (attempt ${attempt}, engine=${VIZ_TO_ENGINE[brief.visualization_type]})...`);

            const message = await anthropic.messages.create({
                model: "claude-sonnet-4-6",
                max_tokens: 4000,
                temperature: opts.temperature ?? 0.1,
                messages: [{ role: "user", content: prompt }],
            });
            const text = (message.content[0] as { type: "text"; text: string }).text;

            const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
            const parsed = JSON.parse(cleaned);

            if (!validatePhysicsConfig(parsed)) {
                throw new Error(`Invalid PhysicsConfig structure (attempt ${attempt})`);
            }

            console.log("[aiSimGen] ✅ CONFIG GENERATED:", {
                engine: parsed.engine,
                objects: parsed.objects.length,
                controls: parsed.controls.length,
                annotations: parsed.annotations.length,
            });
            return parsed as PhysicsConfig;
        } catch (err) {
            console.warn(`[aiSimGen] ⚠️ Config generation failed (attempt ${attempt}):`, err);
            if (attempt === 2) {
                console.warn("[aiSimGen] Using hardcoded fallback config for viz_type:", brief.visualization_type);
                return hardcodedFallbackConfig(brief.visualization_type, brief);
            }
        }
    }
    // TypeScript safety — never reached
    return hardcodedFallbackConfig(brief.visualization_type, brief);
}

// =============================================================================
// TYPES — Stage 3A StateMachineSpec + Stage 4 TeacherScript
// =============================================================================

export interface SimulationStateEntry {
    id: string;               // STATE_1, STATE_2, STATE_3, STATE_4
    name: string;             // Human readable
    show: string[];           // Object IDs to show
    hide: string[];           // Object IDs to hide
    what_student_sees: string; // One sentence visual description
    visible_label: string;    // Text shown on canvas
    [key: string]: unknown;   // Additional state-specific properties
}

export interface StateMachineSpec {
    concept: string;
    total_states: number;
    states: SimulationStateEntry[];
}

export interface TeacherScriptStep {
    step_number: number;
    title: string;
    text: string;
    sim_state: string;   // e.g. "STATE_1"
    key_term: string;
    is_interactive?: boolean;
}

export interface TeacherScript {
    steps: TeacherScriptStep[];
}

// =============================================================================
// STAGE 3A — generateStateMachineSpec()  [gemini-2.5-flash]
// Generates the state machine JSON that BOTH Stage 3B and Stage 4 consume
// =============================================================================

async function generateStateMachineSpec(
    simBrief: SimulationBrief,
    physicsConfig: PhysicsConfig
): Promise<StateMachineSpec> {
    const prompt = `You are defining the visual states for a physics simulation.
The simulation is about: ${simBrief.concept}
Key insight to show: ${simBrief.key_insight_to_show}
Aha moment: ${simBrief.aha_moment?.what_to_show ?? "N/A"}
Objects in simulation: ${physicsConfig.objects.map(o => o.id).join(", ")}
Controls in simulation: ${physicsConfig.controls.map(c => c.id || c.label).join(", ")}

Define EXACTLY 6 states. Rules:
- STATE_1: Phenomenon hook. Starting state.
- STATE_2: Isolate component A.
- STATE_3: Isolate component B.
- STATE_4: Combination/mechanism.
- STATE_5: The AHA MOMENT. Most visually dramatic state. Must show the single most important insight. Must look completely different from STATE_1.
- STATE_6: Interactive mode. All sliders visible and working.

For each state, specify:
- id: "STATE_1" through "STATE_6"
- name: short human name
- show: array of object IDs visible in this state
- hide: array of object IDs hidden in this state
- what_student_sees: one sentence describing the visual difference
- visible_label: short text shown on canvas in this state

VISUAL DRAMA RULES — for particle_flow / drift concepts:
- STATE_1 → STATE_2: field arrows MUST appear (opacity 0 → 1.0). Background may shift
  slightly (e.g., #0a0a14 → #0a1214). A direction label MUST appear on canvas.
- STATE_4 → STATE_5: MUST include ALL three:
  a) ONE particle white (#FFFFFF), size 2.5x normal, trail 80+ frames
  b) ALL other particles opacity 0.12 (12%) — dramatically dim
  c) Canvas label changes to 'FOCUS: Single Electron'
- STATE_5 → STATE_6:
  a) All particles return to normal opacity
  b) Slider panel appears
  c) Canvas label: 'Experiment Mode'

For drift velocity, use drift speeds that are VISIBLE at 60fps:
  STATE_1: driftX = 0 (static)
  STATE_2: driftX = -1.5 px/frame (clearly visible)
  STATE_3: driftX = -1.5 px/frame
  STATE_4: driftX controlled by slider (-3.0 to 0.0)

CRITICAL: STATE_3 must make one element dramatically visible.
For particles: highlight one particle (white, large, long trail, others dim to 12% opacity).
For waves: highlight one wavefront with bold color.
For rays: highlight one light ray with bright color.
For graphs: highlight one curve boldly.

Output ONLY valid JSON matching this schema:
{
  "concept": "string",
  "total_states": 6,
  "states": [
    {
      "id": "STATE_1",
      "name": "string",
      "show": ["id1", "id2"],
      "hide": ["id3"],
      "what_student_sees": "string",
      "visible_label": "string"
    }
  ]
}
No explanation. No markdown. Just JSON starting with {`;

    try {
        const message = await anthropic.messages.create({
            model: "claude-sonnet-4-6",
            max_tokens: 2000,
            temperature: 0.2,
            messages: [{ role: "user", content: prompt }],
        });
        const text = (message.content[0] as { type: "text"; text: string }).text;
        const clean = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
        const spec = JSON.parse(clean) as StateMachineSpec;
        console.log("[Stage3A] StateMachineSpec generated:",
            spec.states.map(s => s.id).join(", "));
        return spec;
    } catch (err) {
        console.error("[Stage3A] JSON parse failed, using default spec:", err);
        return generateDefaultSpec(simBrief.concept);
    }
}

function generateDefaultSpec(concept: string): StateMachineSpec {
    return {
        concept,
        total_states: 4,
        states: [
            {
                id: "STATE_1", name: "Overview", show: ["all"], hide: ["sliders"],
                what_student_sees: "Initial view of the concept",
                visible_label: "Observe"
            },
            {
                id: "STATE_2", name: "Key Element", show: ["all"], hide: ["sliders"],
                what_student_sees: "Key element highlighted",
                visible_label: "Focus"
            },
            {
                id: "STATE_3", name: "Insight", show: ["all"], hide: ["sliders"],
                what_student_sees: "Core insight made visible",
                visible_label: "Key Insight"
            },
            {
                id: "STATE_4", name: "Interactive", show: ["all", "sliders"], hide: [],
                what_student_sees: "Full interactive mode",
                visible_label: "Experiment"
            },
        ],
    };
}

// =============================================================================
// STAGE 3B — generateP5jsCode()  [gemini-2.5-flash]
// Converts PhysicsConfig + StateMachineSpec into executable p5.js HTML
// =============================================================================

// Detect common crash patterns Flash generates in p5.js code
function hasCrashPattern(html: string): boolean {
    const patterns = [
        /new Arrow\s*\(/,           // Arrow class instantiation — crashes on .x
        /\.start\.x/,               // chained property access on possible undefined
        /\.end\.x/,                 // same
        /\.start\.y/,
        /\.end\.y/,
        /\.particle_config\./,      // nested config objects Flash can't handle
        /\.motion\.\w+\.\w+/,      // deeply nested motion properties
        /\.collision\.\w+/,         // nested collision objects
    ];
    return patterns.some(p => p.test(html));
}

/**
 * Sanitize PhysicsConfig before passing to Stage 3B.
 * Gemini Pro (Stage 2) often generates deeply nested objects with properties
 * like particle_config.type, motion.collision.target_id, affects[].mapping (function strings)
 * that Flash cannot reliably interpret in p5.js code.
 * This strips objects/controls to ONLY the known flat properties from our TypeScript interfaces.
 */
function sanitizePhysicsConfig(cfg: PhysicsConfig): PhysicsConfig {
    const KNOWN_OBJECT_KEYS = new Set([
        "id", "type", "count", "color", "glow", "thermal_speed", "drift_speed",
        "trail_length", "label", "opacity", "radius", "x", "y", "width", "height",
        "x_expr", "y_expr",
    ]);
    const KNOWN_CONTROL_KEYS = new Set([
        "type", "id", "label", "min", "max", "default", "step",
        "affects", "multiplier", "toggles",
    ]);

    const sanitizedObjects = cfg.objects.map(obj => {
        const clean: Record<string, unknown> = {};
        for (const key of Object.keys(obj)) {
            if (KNOWN_OBJECT_KEYS.has(key)) {
                const val = (obj as unknown as Record<string, unknown>)[key];
                // Only keep primitive values — reject nested objects/arrays
                if (val !== null && val !== undefined && typeof val !== "object") {
                    clean[key] = val;
                } else if (key === "glow" && typeof val === "boolean") {
                    clean[key] = val;
                }
            }
        }
        // Ensure minimum required fields
        if (!clean.id) clean.id = `obj_${Math.random().toString(36).slice(2, 6)}`;
        if (!clean.type) clean.type = "circle";
        if (!clean.color) clean.color = "#60a5fa";
        return clean as unknown as PhysicsObject;
    });

    const sanitizedControls = cfg.controls.map(ctrl => {
        const clean: Record<string, unknown> = {};
        for (const key of Object.keys(ctrl)) {
            if (KNOWN_CONTROL_KEYS.has(key)) {
                const val = (ctrl as unknown as Record<string, unknown>)[key];
                // affects must be a simple string, not an object/array
                if (key === "affects" && typeof val !== "string") {
                    clean[key] = String(val);
                } else if (val !== null && val !== undefined && typeof val !== "object") {
                    clean[key] = val;
                }
            }
        }
        if (!clean.type) clean.type = "slider";
        if (!clean.id) clean.id = `ctrl_${Math.random().toString(36).slice(2, 6)}`;
        if (!clean.label) clean.label = "Control";
        return clean as unknown as PhysicsControl;
    });

    return {
        ...cfg,
        objects: sanitizedObjects,
        controls: sanitizedControls,
    };
}

/**
 * Validate JS syntax in generated HTML by extracting inline <script> content
 * and running it through `new Function()` (syntax-checks without executing).
 * Returns true if syntax is valid, false if any script block has a SyntaxError.
 */
function validateGeneratedHTML(html: string): boolean {
    const scriptRegex = /<script(?![^>]*\bsrc\b)[^>]*>([\s\S]*?)<\/script>/gi;
    let match;
    while ((match = scriptRegex.exec(html)) !== null) {
        const code = match[1].trim();
        if (!code) continue;
        try {
            new Function(code);
        } catch (err) {
            console.error("[SyntaxValidator] JS syntax error in generated HTML:", (err as Error).message);
            return false;
        }
    }
    return true;
}

/**
 * Inject a try-catch safety wrapper around p.setup() in the generated HTML.
 * If setup() crashes (e.g., reading .type from undefined), this ensures:
 * 1. The error is logged to console with full details
 * 2. SIM_READY still fires so TeacherPlayer doesn't hang forever
 * 3. A visible error message appears on the canvas
 */
function injectSetupSafetyWrapper(html: string): string {
    // Strategy: inject a small <script> before </body> that patches p5 instance
    // to wrap setup in try-catch. This is more reliable than regex-replacing
    // the setup function body which can break on varied code structures.
    const safetyScript = `<script>
// === PhysicsMind Setup Safety Wrapper ===
(function() {
  var origP5 = window.p5;
  if (!origP5) return;
  var origProtSetup = origP5.prototype._setup;
  origP5.prototype._setup = function() {
    try {
      return origProtSetup.apply(this, arguments);
    } catch(err) {
      console.error("[PM Safety] p.setup crashed:", err.message, err.stack);
      // Try to create a minimal canvas with error message
      try {
        if (!document.querySelector('canvas')) {
          var c = document.createElement('canvas');
          c.width = 800; c.height = 450;
          var container = document.getElementById('sketch-container');
          if (container) container.appendChild(c);
          else document.body.appendChild(c);
          var ctx = c.getContext('2d');
          if (ctx) {
            ctx.fillStyle = '#0f1117'; ctx.fillRect(0,0,800,450);
            ctx.fillStyle = '#ef4444'; ctx.font = '16px sans-serif';
            ctx.fillText('Simulation rendering error - retrying...', 20, 220);
            ctx.fillStyle = '#94a3b8'; ctx.font = '12px sans-serif';
            ctx.fillText(err.message, 20, 250);
          }
        }
      } catch(e2) { /* ignore canvas fallback errors */ }
      // CRITICAL: still fire SIM_READY so TeacherPlayer doesn't hang
      try {
        parent.postMessage({type:"SIM_READY",states:["STATE_1","STATE_2","STATE_3","STATE_4"],error:err.message},"*");
        console.log("PM:SIM_READY (with error)");
      } catch(e3) { /* ignore */ }
    }
  };
})();
// === End Safety Wrapper ===
<\/script>`;

    // Insert AFTER the p5.js CDN script (so p5 prototype exists) but BEFORE the sketch runs.
    if (html.includes('</body>')) {
        const p5CdnIndex = html.search(/<script src="https:\/\/cdnjs\.cloudflare\.com\/ajax\/libs\/p5\.js/);
        if (p5CdnIndex >= 0) {
            // Find the closing </script> of the CDN tag
            const cdnCloseIdx = html.indexOf('</script>', p5CdnIndex);
            if (cdnCloseIdx >= 0) {
                const insertAt = cdnCloseIdx + '</script>'.length;
                html = html.slice(0, insertAt) + '\n' + safetyScript + '\n' + html.slice(insertAt);
                return html;
            }
        }
        // Fallback: insert before </body>
        html = html.replace('</body>', safetyScript + '\n</body>');
    }
    return html;
}

/**
 * Verifies that the generated HTML contains meaningful per-state visual branching.
 * Checks that applySimState / _applyState:
 *   (a) references at least 4 distinct STATE_N labels
 *   (b) contains at least 8 visual-property keywords (opacity, color, speed, etc.)
 * If either check fails the caller should regenerate with stronger emphasis.
 */
function verifyStatesDiffer(html: string): boolean {
    // Extract the applySimState / _applyState body (be generous, grab both names)
    const applyFn =
        html.match(/function applySimState[\s\S]*?(?=\nfunction |\nwindow\.|\nvar |\n\/\/|$)/)?.[0] ??
        html.match(/function _applyState[\s\S]*?(?=\nfunction |\nwindow\.|\nvar |\n\/\/|$)/)?.[0] ??
        '';

    // Must reference at least 4 distinct state labels
    const stateBranches = new Set(
        (html.match(/STATE_[1-9]/g) ?? [])
    ).size;

    if (stateBranches < 4) {
        console.warn(
            `[Stage3B] verifyStatesDiffer: only ${stateBranches} STATE_N labels found (need ≥4)`
        );
        return false;
    }

    // applySimState body must use visual property keywords
    const visualKeywords = [
        'opacity', 'color', 'speed', 'size', 'drift', 'show', 'hide',
        'alpha', 'sz', 'radius', 'magnitude', 'visible', 'scale',
        'eFieldOpacity', 'driftMagnitude', 'trackedIdx', 'slidersVisible',
    ];
    const visualMatches = visualKeywords.filter(k => applyFn.includes(k)).length;

    if (visualMatches < 4) {
        console.warn(
            `[Stage3B] verifyStatesDiffer: applySimState has only ${visualMatches} visual-property keywords (need ≥4)`
        );
        return false;
    }

    // draw() must reference PM_currentState (so visuals update every frame, not just once)
    if (!html.includes('PM_currentState')) {
        console.warn('[Stage3B] verifyStatesDiffer: draw() does not read PM_currentState \u2014 states will look identical');
        return false;
    }

    console.log(
        `[Stage3B] verifyStatesDiffer \u2705 stateBranches=${stateBranches}, visualKeywords=${visualMatches}`
    );
    return true;
}

async function generateP5jsCode(
    physicsConfig: PhysicsConfig,
    brief: SimulationBrief,
    stateMachineSpec: StateMachineSpec,
    retryWithCrashWarning = false
): Promise<string> {
    // Build per-state instructions from StateMachineSpec
    const stateInstructions = stateMachineSpec.states.map((state) => `
${state.id} — "${state.name}":
  Show: ${state.show?.join(", ") || "all"}
  Hide: ${state.hide?.join(", ") || "none"}
  Student sees: ${state.what_student_sees}
  Canvas label: "${state.visible_label}"
  ${(state as Record<string, unknown>).highlighted_electron ? `Highlighted electron: WHITE, size 14, trail length 60` : ""}
  ${(state as Record<string, unknown>).other_electrons_opacity ? `Other electrons: ${Number((state as Record<string, unknown>).other_electrons_opacity) * 100}% opacity` : ""}
  ${(state as Record<string, unknown>).sliders ? `Sliders visible: ${JSON.stringify((state as Record<string, unknown>).sliders)}` : ""}
`).join("");

    const crashRetryWarning = retryWithCrashWarning
        ? `\n⚠️ PREVIOUS ATTEMPT CRASHED with "Cannot read properties of undefined".
The crash was caused by reading properties from undefined nested objects.
You MUST NOT read .type, .x, .start, .end, .config, or any property from an object
without first checking the object exists. Use ONLY flat primitive values.
Do NOT create any class constructors for Arrow, Line, or Vector objects.
Pass only flat number coordinates. NEVER pass objects with .start/.end properties.\n`
        : "";

    // Sanitize PhysicsConfig to strip nested objects Flash can't handle
    const safeConfig = sanitizePhysicsConfig(physicsConfig);

    const prompt = `You are an expert p5.js programmer.
Generate a complete, self-contained HTML file with embedded p5.js
for this physics simulation.
${crashRetryWarning}

CRITICAL RULES FOR p5.js CODE — VIOLATIONS CAUSE RUNTIME CRASHES:
1. ALL variables must be declared at sketch top level (outside setup and draw). Never use let/const inside setup() for variables that draw() will read.
2. ALL arrays must be initialized as empty arrays at top level: let electrons = [];
3. NEVER call p.select(), p.createDiv(), p.createSlider() inside draw(). Only in setup().
4. State switching uses the global PM_currentState variable (set by the Sync API). Do NOT create your own currentState variable.
5. In draw(), use if/else on PM_currentState to change what is rendered: if (PM_currentState === 'STATE_1') { ... } else if (PM_currentState === 'STATE_2') { ... }
6. Guard ALL property access on array elements: if (electrons[i]) { electrons[i].x += ... }
7. Initialize all particle/object arrays in setup(), never assume they exist before setup() runs.

PHYSICSCONFIG:
${JSON.stringify(safeConfig, null, 2)}

CONTEXT:
- Concept: ${brief.concept}
- Key insight: ${brief.key_insight_to_show}
- Aha moment: ${brief.aha_moment?.what_to_show ?? "N/A"}
- Equations: ${(brief.physics_equations ?? []).join(", ")}

SIMULATION STATES — IMPLEMENT ALL 4 EXACTLY:
${stateInstructions}

MANDATORY REQUIREMENTS:
1. Use p5.js from CDN: https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.0/p5.min.js
2. Canvas: ${physicsConfig.canvas?.width ?? 800} x ${physicsConfig.canvas?.height ?? 450}
3. Background: ${physicsConfig.canvas?.bg ?? "#0f1117"}
4. p5.js INSTANCE MODE only: new p5(function(p) { p.setup = function() {...}; p.draw = function() {...}; })

CRITICAL CANVAS REQUIREMENTS (canvas blank = broken simulation):
A. Use EXACTLY this CSS in <head> — no exceptions:
   <style>
     * { margin: 0; padding: 0; box-sizing: border-box; }
     html, body { width: 100%; height: 100%; background: #0f1117; overflow: hidden; }
     canvas { display: block; }
     #sketch-container { position: relative; }
   </style>
B. Add EXACTLY this div inside <body> before the scripts:
   <div id="sketch-container"></div>
C. In p5 setup(), parent the canvas to sketch-container:
   p.setup = function() {
     let cnv = p.createCanvas(${physicsConfig.canvas?.width ?? 800}, ${physicsConfig.canvas?.height ?? 450});
     cnv.parent('sketch-container');
     p.frameRate(60);
   }
D. In every draw() frame, call p.background('${physicsConfig.canvas?.bg ?? "#0f1117"}') as the FIRST line.
E. The canvas MUST be visible in STATE_1 immediately on load — no user interaction required.
F. Sliders go in a <div id="controls"> BELOW #sketch-container, NOT inside it.
5. MANDATORY STATE VARIABLE PATTERN — ALL state vars live at GLOBAL scope
   (declared in the Sync API script so the message handler can read them):
   var driftMagnitude = 0.0;
   var eFieldOpacity  = 0.0;
   var trackedIdx     = -1;
   var slidersVisible = false;

   The applySimState function is ALSO global (defined in the Sync API script).
   You MUST NOT redefine applySimState inside the p5 sketch closure.
   Just READ the globals in draw() — example skeleton:

   p.draw = function() {
     p.background('#0f1117');
     // — read global state every frame —
     if (PM_currentState === 'STATE_3') {
       electrons.forEach(function(e,i){
         e.opacity = (i===trackedIdx) ? 255 : 38;   // 15% = ~38/255
         e.sz      = (i===trackedIdx) ? 14  : 5;
       });
     } else {
       electrons.forEach(function(e){
         e.opacity = 255; e.sz = 5;
       });
     }
     electrons.forEach(function(e){
       e.x = (e.x + driftMagnitude + e.thermalVx + p.width) % p.width;
       // draw electron circle using e.opacity and e.sz
     });
     // draw e-field arrows at eFieldOpacity
     // toggle sliders visibility using slidersVisible
   }

   This guarantees visual differences are CONTINUOUS, not just a one-shot call.

6. STATE_3 MUST look dramatically different from STATE_1:
   STATE_1 = all electrons same size/opacity, no field arrows, no drift.
   STATE_3 = ONE electron WHITE size-14 + glowing cyan trail, ALL others at 15% opacity.
   If a student cannot immediately see the difference at a glance, the fix is incomplete.

7. MANDATORY — copy this EXACT sync code verbatim into a <script> tag that comes
   BEFORE the p5 sketch script. This must be at GLOBAL scope (not inside p5 closure):

// === PhysicsMind Sync API ===
var PM_currentState = 'STATE_1';
var driftMagnitude  = 0.0;
var eFieldOpacity   = 0.0;
var trackedIdx      = -1;
var slidersVisible  = false;
function applySimState(s) {
  PM_currentState = s;
  if      (s==='STATE_1'){driftMagnitude=0.0;eFieldOpacity=0.0;trackedIdx=-1;slidersVisible=false;}
  else if (s==='STATE_2'){driftMagnitude=0.8;eFieldOpacity=1.0;trackedIdx=-1;slidersVisible=false;}
  else if (s==='STATE_3'){driftMagnitude=0.8;eFieldOpacity=0.3;trackedIdx=0; slidersVisible=false;}
  else if (s==='STATE_4'){driftMagnitude=0.5;eFieldOpacity=1.0;trackedIdx=-1;slidersVisible=true;}
}
function _applyState(s) {
  applySimState(s);
  parent.postMessage({ type: 'STATE_REACHED', state: s }, '*');
}
window.addEventListener('message', function(e) {
  if (e.data && e.data.type === 'SET_STATE') { _applyState(e.data.state); }
});
// === End PhysicsMind Sync API ===

   IMPORTANT: applySimState is now GLOBAL. Do NOT redefine it inside the p5 closure.
   The p5 sketch must only READ PM_currentState, driftMagnitude, eFieldOpacity,
   trackedIdx, slidersVisible in draw() — never redefine them.

At the END of p5 setup(), call:
parent.postMessage({type:'SIM_READY',states:['STATE_1','STATE_2','STATE_3','STATE_4']},'*');
console.log('PM:SIM_READY');


CRITICAL — Defensive coding rules (prevents crashes):
- NEVER read .type, .config, .motion, or any property from a variable
  without first checking the variable is defined: if (obj && obj.type) {...}
- Use ONLY flat primitive values (numbers, strings, booleans) from PHYSICSCONFIG.
  Do NOT iterate over objects/controls arrays trying to read nested properties.
- Define ALL simulation objects directly in your code using the values from
  PHYSICSCONFIG. Do NOT dynamically construct objects from the JSON at runtime.
- Keep p.setup() simple: createCanvas, parent, frameRate, initialize variables,
  then fire SIM_READY. No complex object construction in setup().

CRITICAL — Arrow/line drawing rules (common crash source):
Never create Arrow class constructors. Do NOT use new Arrow().
Use ONLY this helper function for drawing arrows in p5.js:

function drawArrow(p, x1, y1, x2, y2, col, weight) {
  p.push();
  p.stroke(col); p.strokeWeight(weight || 2); p.fill(col);
  p.line(x1, y1, x2, y2);
  var angle = p.atan2(y2 - y1, x2 - x1);
  p.translate(x2, y2); p.rotate(angle);
  p.triangle(0, 0, -10, -4, -10, 4);
  p.pop();
}

Call it as: drawArrow(p, 780, 120, 720, 120, '#ffee58', 2)
NEVER pass objects with .start/.end properties to arrow functions.
Always pass flat x1,y1,x2,y2 numbers. This eliminates all
"Cannot read properties of undefined (reading 'x')" errors.

8. CANVAS BOUNDARY RULES — MANDATORY:
   Canvas is ${physicsConfig.canvas?.width ?? 800}px wide x ${physicsConfig.canvas?.height ?? 450}px tall.
   ALL drawing must stay within these bounds. Safe zones:
   - Top strip (controls/labels): y = 15 to 55
   - Main simulation area: y = 60 to 420
   - Bottom strip (equations): y = 425 to 445
   - Left/Right margins: x = 20 to ${(physicsConfig.canvas?.width ?? 800) - 20}
   NEVER draw text, arrows, labels or particles outside these zones.
   Before placing any element: if (x < 20 || x > ${(physicsConfig.canvas?.width ?? 800) - 20} || y < 15 || y > 445) { /* reposition it */ }
   Arrowheads must be at least 30px from any canvas edge.

9. DRIFT VELOCITY SIMULATIONS — if concept involves particle drift or current flow:
   USE THESE EXACT drift speed values (0.08 px/frame is invisible — use 1.5 minimum):
   STATE_1: driftX = 0        (completely static, no drift)
   STATE_2: driftX = -1.5     (clearly visible leftward drift at 60fps)
   STATE_3: driftX = -1.5     (same drift + ONE electron white+size-14 + others 12% opacity)
   STATE_4: driftX = slider value, range -3.0 to 0.0

   The STATE_2→STATE_3 transition MUST include ALL of:
   a) ONE specific electron: fill(255,255,255), size = 14, trail 80+ frames
   b) ALL other electrons: opacity 0.12 (approx 30/255 alpha)
   c) Canvas label text changes to 'FOCUS: Single Electron'

10. Continuous animation in draw() at 60fps
11. Dark theme, white/gray text, sliders with accent-color:#3b82f6
12. Sliders below canvas in styled div, show current value
13. No external dependencies except p5.js CDN
14. Output under 14,000 bytes total

Output ONLY the complete HTML. No explanation. Start with <!DOCTYPE html>`;

    const { text } = await generateText({
        model: google("gemini-2.5-flash"),
        prompt,
        temperature: 0.2,
    });

    let html = text.trim();
    if (html.startsWith("```")) {
        html = html.replace(/^```(?:html)?\s*\n?/, "").replace(/\n?```\s*$/, "");
    }

    if (!html.includes("<!DOCTYPE") && !html.includes("<html")) {
        console.warn("[aiSimGen] Stage 3B: output doesn't look like HTML, wrapping...");
        html = `<!DOCTYPE html><html><head>
<script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.0/p5.min.js"></script>
<style>*{margin:0;padding:0;box-sizing:border-box}html,body{width:100%;height:100%;background:#0f1117;overflow:hidden}canvas{display:block}</style>
</head><body><div id="sketch-container"></div><script>${html}<\/script></body></html>`;
    }

    // ── Ensure CSS is correct even if Flash generated its own <style> ─────────
    // Inject a baseline style override before </head> if the critical rules are missing
    if (!html.includes('sketch-container') || !html.includes("box-sizing: border-box") && !html.includes("box-sizing:border-box")) {
        const cssOverride = `<style>*{margin:0;padding:0;box-sizing:border-box}html,body{width:100%;height:100%;background:#0f1117;overflow:hidden}canvas{display:block}#sketch-container{position:relative}</style>`;
        if (html.includes('</head>')) {
            html = html.replace('</head>', cssOverride + '</head>');
        }
    }

    // ── Fallback: force-inject sync API if Flash omitted it ──────────────────
    if (!html.includes('SIM_READY') || !html.includes('SET_STATE')) {
        console.warn("[aiSimGen] Stage 3B: sync API missing — injecting fallback");
        const syncScript = `<script>
// === PhysicsMind Sync API (injected fallback) ===
var PM_currentState='STATE_1';
var driftMagnitude=0.0,eFieldOpacity=0.0,trackedIdx=-1,slidersVisible=false;
function applySimState(s){
  PM_currentState=s;
  if(s==='STATE_1'){driftMagnitude=0.0;eFieldOpacity=0.0;trackedIdx=-1;slidersVisible=false;}
  else if(s==='STATE_2'){driftMagnitude=0.8;eFieldOpacity=1.0;trackedIdx=-1;slidersVisible=false;}
  else if(s==='STATE_3'){driftMagnitude=0.8;eFieldOpacity=0.3;trackedIdx=0;slidersVisible=false;}
  else if(s==='STATE_4'){driftMagnitude=0.5;eFieldOpacity=1.0;trackedIdx=-1;slidersVisible=true;}
}
function _applyState(s){applySimState(s);parent.postMessage({type:'STATE_REACHED',state:s},'*');}
window.addEventListener('message',function(e){if(e.data&&e.data.type==='SET_STATE')_applyState(e.data.state);});
window.addEventListener('load',function(){setTimeout(function(){parent.postMessage({type:'SIM_READY',states:['STATE_1','STATE_2','STATE_3','STATE_4']},'*');console.log('PM:SIM_READY');},800);});
// === End PhysicsMind Sync API ===
<\/script>`;
        if (html.includes('</body>')) {
            html = html.replace('</body>', syncScript + '</body>');
        } else {
            html += syncScript;
        }
    }

    // ── Crash pattern detection + retry ─────────────────────────────────────
    if (!retryWithCrashWarning && hasCrashPattern(html)) {
        console.warn("[Stage3B] crash pattern detected — regenerating with warning");
        return generateP5jsCode(physicsConfig, brief, stateMachineSpec, true);
    }

    // ── State-diff verification: ensure _applyState has ≥4 branches + ≥8 visual props ──
    if (!retryWithCrashWarning && !verifyStatesDiffer(html)) {
        console.warn("[Stage3B] verifyStatesDiffer failed — regenerating with visual emphasis");
        return generateP5jsCode(physicsConfig, brief, stateMachineSpec, true);
    }

    // ── Safety wrapper: inject try-catch around p.setup so SIM_READY fires ──
    html = injectSetupSafetyWrapper(html);

    // ── Syntax validation — catch SyntaxErrors before serving ──
    if (!retryWithCrashWarning && !validateGeneratedHTML(html)) {
        console.warn("[Stage3B] JS syntax validation failed — retrying with crash warning");
        return generateP5jsCode(physicsConfig, brief, stateMachineSpec, true);
    }

    console.log("[aiSimGen] ✅ STAGE 3B COMPLETE: simHtml length:", html.length);
    return html;
}

// =============================================================================
// STAGE 4 — generateScriptFromSimulation()  [gemini-2.5-flash]
// Generates TeacherPlayer script steps from StateMachineSpec (single source of truth)
// =============================================================================

export async function generateScriptFromSimulation(
    stateMachineSpec: StateMachineSpec,
    concept: string,
    classLevel: string,
    conceptId?: string,
    originalQuestion?: string,
    simulation_emphasis?: string,
    epicState1?: EpicState1,
): Promise<TeacherScript | null> {
    // Detect dual layout and get panel config
    let isDualLayout = false;
    if (conceptId) {
        const pc = getPanelConfig(conceptId);
        if (pc) {
            isDualLayout = pc.layout === "dual_horizontal" || pc.layout === "dual_vertical";
        }
    }

    // Parse what_student_sees: for dual panels it is stored as
    // "RIGHT PANEL (graph): [right] | LEFT PANEL (simulation): [left]"
    function splitDual(what: string): { left: string; right: string } | null {
        const m = what.match(/^RIGHT PANEL \(graph\): (.+?) \| LEFT PANEL (?:\(simulation\)|.*?): (.+)$/);
        if (m) return { right: m[1].trim(), left: m[2].trim() };
        // Also handle fallback "concept-specific visualization active"
        const m2 = what.match(/^RIGHT PANEL \(graph\): (.+?) \| LEFT PANEL: (.+)$/);
        if (m2) return { right: m2[1].trim(), left: m2[2].trim() };
        return null;
    }

    // Build state descriptions — dual layout gets clear LEFT/RIGHT blocks per state
    let stateDescriptions: string;
    if (isDualLayout) {
        stateDescriptions = stateMachineSpec.states.map(s => {
            const dual = splitDual(s.what_student_sees);
            if (dual) {
                return (
                    `${s.id}:\n` +
                    `  LEFT PANEL (simulation): ${dual.left}\n` +
                    `  RIGHT PANEL (graph): ${dual.right}`
                );
            }
            // Fallback: no split found, show as-is
            return `${s.id}: ${s.what_student_sees}`;
        }).join("\n\n");
    } else {
        stateDescriptions = stateMachineSpec.states
            .map(s => `${s.id}: ${s.what_student_sees}`)
            .join("\n");
    }

    // Build the dual-panel considerations if needed
    const dualPanelRule = isDualLayout ? `
DUAL PANEL NOTE:
When writing Sentence 1, be sure to describe what the student sees on BOTH the LEFT PANEL (simulation) and RIGHT PANEL (graph).
` : "";

    const singlePanelGuard = !isDualLayout
        ? `\nSINGLE PANEL INFO:
There is NO graph panel. Describe ONLY what is visible in the single animation.`
        : "";

    const emphasisRule = simulation_emphasis ? `\nPRIMARY EMPHASIS: ${simulation_emphasis}. Every CONNECTION sentence must reference this.` : "";

    const prompt = `Write a teacher script for a physics simulation.
The simulation is about: ${concept} (Class ${classLevel})
${originalQuestion ? `\nThe student asked: "${originalQuestion}"\nYour script MUST directly address this specific confusion/question while describing the simulation states.` : ""}
${emphasisRule}

SCRIPT WRITING RULE:
Each step in your script must describe what is VISUALLY HAPPENING in that state
according to the emphasis and state descriptions below.

${epicState1?.type === 'WRONG_BELIEF_LIVE_CIRCUIT'
    ? `STEP 1 MANDATORY SCRIPT — copy this verbatim, do not paraphrase:
"Look at the three ammeters — ${epicState1.ammeter_values.before_r1}A, then ${epicState1.ammeter_values.between_r1_r2}A, then ${epicState1.ammeter_values.after_r2}A. This is the picture most students carry. Current appears to reduce after each resistor. Watch what actually happens when we measure for real."
NEVER describe Step 1 as showing zero current or random electron motion.`
    : `Step 1 script MUST reference the wrong belief values from STATE_1 if present.
NEVER write Step 1 as showing zero current or random electron motion
unless the state description explicitly describes STATE_1 that way.`}

CRITICAL: The simulation has these ${stateMachineSpec.states.length} states that ALREADY EXIST in the code.
For each step, read ONLY what STATE_N shows below — do NOT invent descriptions.
Your script text MUST match what is listed here exactly:

${stateDescriptions}
${dualPanelRule}${singlePanelGuard}
Write EXACTLY ${stateMachineSpec.states.length} steps, one per state.
${epicState1 ? `This is an EPIC-C session — write scripts for ${stateMachineSpec.states.length} states only. STATE_1 is rendered statically and has no script.` : ''}

STRICT RULE — each step in the teacher script must contain EXACTLY 2 sentences. No more. No exceptions.

Sentence 1: What the student sees on the canvas RIGHT NOW in this state. Be specific — name the objects, arrows, values, colours visible.
Sentence 2: Why this matters — one physical insight this moment reveals.

Do not write 3 sentences. Do not write 1 sentence. Do not write a paragraph. 2 sentences per step, always.

Bold the key physics term using **term** markdown.

Output ONLY this JSON:
{
  "steps": [
    {
      "step_number": 1,
      "sim_state": "STATE_1",
      "title": "short title max 4 words",
      "text": "Step text referencing simulation",
      "key_term": "the physics term bolded"
    }
  ]
}
Output ONLY JSON. No other text.`;

    try {
        // Stage 4: claude-sonnet-4-6 writes narration from state machine spec
        const message = await anthropic.messages.create({
            model: "claude-sonnet-4-6",
            max_tokens: 2000,
            temperature: 0.3,
            messages: [{ role: "user", content: prompt }],
        });
        const rawText = (message.content[0] as { type: "text"; text: string }).text;
        const cleaned = rawText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

        // Repair step: fix trailing commas before } or ] (common Sonnet serialization error)
        let repairedText = cleaned;
        repairedText = repairedText.replace(/,(\s*[}\]])/g, '$1');

        try {
            const parsed = JSON.parse(repairedText) as TeacherScript;
            console.log("[aiSimGen] ✅ STAGE 4: script generated, steps:", parsed.steps.length);
            return parsed;
        } catch (firstErr) {
            console.log("[aiSimGen] ⚠️ Script JSON repair needed, attempting fix...");
            // Try extracting just the steps array from the (possibly truncated) JSON
            const stepsMatch = repairedText.match(/"steps"\s*:\s*(\[[\s\S]*?\])\s*[,}]/);
            if (stepsMatch) {
                const steps = JSON.parse(stepsMatch[1]) as TeacherScript["steps"];
                console.log("[aiSimGen] ✅ STAGE 4: script repaired, steps:", steps.length);
                return { steps } as TeacherScript;
            }
            throw firstErr;
        }
    } catch (err) {
        console.warn("[aiSimGen] Stage 4 script generation failed:", err);
        return null;
    }
}

// =============================================================================
// IMAGE CONCEPT EXTRACTION  [gemini-2.5-flash — unchanged]
// =============================================================================

const IMAGE_CONTEXT_PROMPT = `
You are analyzing a physics image for an Indian Class 10-12 student.
The image shows: a page from NCERT textbook, a notebook, a question paper, or a diagram.

Extract and return a JSON object:
{
  "concept_id": <pick EXACTLY one from the list below>,
  "topic": "specific sub-topic visible (e.g. 'Joule heating in a resistor')",
  "formula": "any formula visible in the image",
  "diagram_description": "what the diagram shows",
  "class_level": "10, 11, or 12",
  "chapter": "chapter name if visible",
  "question_text": "if a question is shown, extract it",
  "source_type": "ncert if this is from an NCERT textbook, otherwise non_ncert",
  "confidence": <self-assess image clarity as a decimal — be honest and strict>,
  "student_work_detected": <true if the image contains student handwriting, attempted solutions, scratch work, crossed-out steps, or circled answers. false if it is a printed textbook page, clean diagram, or typed question with no student marks.>
}

concept_id — pick EXACTLY one:

CIRCUIT / ELECTRICAL:
  ohms_law               — basic V=IR, resistance, conductors, Ohm's law experiments
  drift_velocity         — electron drift, current density, free electrons in conductor
  series_resistance      — resistors in series, same current, voltage divides
  parallel_resistance    — resistors in parallel, voltage same, current splits
  series_parallel_resistance — mixed series and parallel combinations
  internal_resistance    — EMF, terminal voltage, V=E-Ir, battery charging/discharging
  emf_internal_resistance — same as internal_resistance
  kirchhoffs_current_law — KCL, junction rule, sum of currents at node
  kirchhoffs_voltage_law — KVL, loop rule, sum of voltages in loop
  kirchhoffs_laws        — both KCL and KVL together
  resistivity            — resistivity formula R=ρL/A, temperature dependence, ρ vs T graph
  electric_power_heating — Joule heating, thermal energy, P=I²R, P=V²/R, heat produced, U=I²Rt
  potentiometer          — potentiometer wire, jockey, balance point, EMF comparison
  meter_bridge           — Wheatstone bridge on wire, unknown resistance
  wheatstone_bridge      — four-arm bridge, balance condition P/Q=R/S
  electric_current       — electric current basics, charge flow, conventional current
  temperature_dependence_of_resistance — R vs T relationship, resistivity vs temperature
  cells_in_series_parallel — cells in series/parallel, equivalent EMF
  galvanometer_to_ammeter_voltmeter — galvanometer conversion, shunt, multiplier
  electrical_power_energy — electrical energy, kWh, power ratings
  rc_circuit_charging    — charging/discharging capacitor through resistor
  self_inductance_lr     — self inductance, LR circuit, back EMF
  mutual_inductance_transformer — mutual inductance, coupling coefficient
  faraday_law_emf        — Faraday's law, induced EMF, flux change
  lenz_law_eddy          — Lenz's law, eddy currents, opposing induced effects
  motional_emf           — rod moving in magnetic field, motional EMF = Bvl
  electromagnetic_induction_3d — electromagnetic induction 3D view
  ac_basics              — alternating current basics, peak/rms values
  ac_voltage_current     — AC voltage and current phase relationships
  ac_circuits_lcr        — LCR circuit analysis
  lcr_series_circuit     — series LCR circuit, impedance
  resistor_in_ac         — resistor in AC, in-phase V and I
  capacitor_in_ac        — capacitor in AC, leading/lagging current
  inductor_in_ac         — inductor in AC, lagging current
  power_in_ac            — power factor, average power in AC
  resonance_lcr          — resonance in LCR circuit, Q-factor
  phasors                — phasor diagrams, rotating vectors
  ac_generator           — AC generator, rotating coil in field
  transformer            — step-up/step-down transformer, turns ratio
  power_transmission     — AC power transmission, reduced losses at high voltage
  lc_oscillations        — LC circuit oscillations, energy exchange
  capacitor_parallel_series — capacitors in series and parallel
  dielectric_in_capacitor — dielectric, polarisation, capacitance change
  parallel_plate_capacitor_field — parallel plate capacitor, electric field between plates
  energy_density_electric_field — energy stored in capacitor, energy density
  pn_junction_diode      — pn junction, depletion region, forward/reverse bias
  transistor_action      — transistor, base-emitter-collector, amplification
  logic_gates            — AND, OR, NOT, NAND, NOR gates, truth tables
  rectifier_circuits     — half wave, full wave rectifier, diode circuits
  semiconductor_basics   — n-type, p-type semiconductors, doping, band gap

MECHANICS / MOTION:
  projectile_motion      — projectile, horizontal+vertical components, range, time of flight
  projectile_motion_advanced — oblique projectile, max range at 45°
  equations_of_motion    — v=u+at, s=ut+½at², v²=u²+2as, kinematic equations
  relative_motion        — relative velocity, frames of reference
  motion_graphs          — displacement-time, velocity-time, acceleration-time graphs
  vertical_motion_gravity — free fall, thrown up, g=9.8 m/s²
  motion_on_inclined_plane — block on incline, component of gravity
  laws_of_motion_friction — Newton's laws, friction, normal force, F=ma
  laws_of_motion_atwood  — Atwood machine, two masses over pulley
  newtons_laws_overview  — Newton's 1st/2nd/3rd law overview
  pseudo_forces          — non-inertial frame, pseudo/fictitious force
  friction_laws          — static friction, kinetic friction, μ, f=μN
  work_energy_theorem    — W=F·d, work-energy theorem, net work = ΔKE
  conservation_of_energy — energy conservation, KE+PE=constant
  potential_energy_curves — PE vs displacement graph, equilibrium points
  power_efficiency       — power P=W/t, efficiency η=output/input
  conservation_of_momentum — momentum conservation, isolated system
  linear_momentum_conservation — linear momentum p=mv, impulse
  elastic_inelastic_collisions — elastic/inelastic collision, e coefficient
  coefficient_of_restitution — coefficient of restitution e=v_rel/u_rel
  circular_motion_banking — banking of roads, centripetal force, angle of banking
  circular_motion_vertical — vertical circular motion, minimum speed at top
  uniform_circular_motion — UCM, centripetal acceleration, a=v²/r
  simple_harmonic_motion — SHM, x=A sinωt, restoring force, ω, period
  spring_mass_system     — spring force F=-kx, Hooke's law, spring-mass oscillation
  simple_pendulum        — pendulum, T=2π√(L/g), small angle approximation
  simple_pendulum_shm    — pendulum as SHM, restoring torque
  physical_pendulum      — physical pendulum, moment of inertia, T=2π√(I/mgd)
  damped_oscillations    — damping, underdamped/critically damped/overdamped
  forced_oscillations_resonance — forced oscillations, driving frequency, resonance
  energy_in_shm          — energy in SHM: KE+PE=½kA², energy graph
  torque_rotation        — torque τ=r×F, rotational equilibrium
  torque_and_couple      — couple, moment of couple, rotational effect
  moment_of_inertia_shapes — MOI of ring, disc, rod, sphere
  angular_momentum_conservation — L=Iω, angular momentum conservation
  rolling_without_slipping — rolling, v=Rω, KE of rolling body
  rolling_on_incline     — cylinder/sphere rolling down incline
  combined_rotation_translation — general motion: translation + rotation
  equilibrium_rigid_body — conditions for equilibrium, ΣF=0, Στ=0

GRAVITATION / FLUIDS:
  gravitational_potential_energy — GPE near/far from earth, U=-GMm/r
  gravitational_field_inside_outside_shell — g inside hollow shell = 0
  acceleration_due_to_gravity_variation — g variation with height, depth, latitude
  escape_velocity_orbital — escape velocity, orbital velocity, v_e=√(2gR)
  geostationary_orbit    — geostationary satellite, time period, height
  kepler_laws            — Kepler's 3 laws, T²∝a³, orbital mechanics
  pressure_pascals_law   — pressure P=F/A, Pascal's law, hydraulic machines
  buoyancy_archimedes    — buoyancy, Archimedes' principle, upthrust
  bernoulli_principle    — Bernoulli's equation, streamline flow
  equation_of_continuity — A₁v₁=A₂v₂, conservation of mass in fluids
  surface_tension_capillarity — surface tension, capillary rise, meniscus
  viscosity_stokes       — viscosity, Stokes' law, terminal velocity
  stress_strain_elasticity — stress, strain, Young's modulus, elastic limit

ELECTROSTATICS / MAGNETISM / FIELDS:
  coulombs_law           — Coulomb's law, F=kq₁q₂/r², electric force
  electric_field_lines   — electric field, field lines, E=F/q
  electric_dipole        — dipole moment p=2ql, field and torque on dipole
  electric_flux_gauss    — electric flux Φ=E·A, Gauss's law
  gauss_law_3d           — Gauss's law 3D, enclosed charge, spherical symmetry
  electric_potential_3d  — electric potential 3D, V=kq/r, equipotential surfaces
  electric_potential_uniform_field — potential in uniform field, V=Ed
  charged_conductor_properties — conductor in field, surface charge, Faraday cage
  van_de_graaff_generator — Van de Graaff generator, electrostatic machine
  magnetic_field_biot_savart — Biot-Savart law, dB=μ₀Idl×r/4πr³
  magnetic_field_wire    — field due to straight wire, B=μ₀I/2πr
  magnetic_field_solenoid — solenoid, toroid, B=μ₀nI
  ampere_circuital_law   — Ampere's law ∮B·dl=μ₀I
  force_on_current_carrying_conductor — F=BIl sinθ, force on wire in field
  magnetic_force_moving_charge — Lorentz force F=q(v×B)
  motion_of_charge_in_field — helical motion, radius r=mv/qB
  cyclotron              — cyclotron, frequency independent of speed
  magnetic_dipole_bar_magnet — bar magnet, dipole, field lines, poles
  bar_magnet_field       — magnetic field of bar magnet, axial/equatorial

WAVES / OPTICS:
  sound_waves            — sound, longitudinal waves, speed of sound
  wave_on_string         — transverse wave, v=√(T/μ), string vibration
  standing_waves         — standing waves, nodes, antinodes, harmonics
  beats_waves            — beats, beat frequency = |f₁-f₂|
  doppler_effect         — Doppler effect, moving source/observer
  wave_superposition     — superposition principle, constructive/destructive
  youngs_double_slit     — Young's double slit, fringe width β=λD/d
  interference_coherence — interference, coherence, path difference
  single_slit_diffraction — single slit diffraction, central maximum
  diffraction_grating    — diffraction grating, multiple slits
  thin_film_interference — thin film, Newton's rings, path difference
  huygens_principle      — Huygens' principle, wavefronts, secondary wavelets
  polarisation_malus_law — polarisation, Malus's law I=I₀cos²θ
  reflection_spherical_mirrors — mirror formula 1/v+1/u=1/f, magnification
  refraction_snells_law  — Snell's law n₁sinθ₁=n₂sinθ₂, refraction
  total_internal_reflection — TIR, critical angle, optical fibre
  prism_dispersion       — prism, deviation, dispersion, rainbows
  thin_lens_formula      — lens formula 1/v-1/u=1/f, power P=1/f
  convex_lens            — convex lens, real image, magnification
  concave_lens           — concave lens, virtual image, diverging
  convex_mirror          — convex mirror, virtual image, wide field
  concave_mirror         — concave mirror, real and virtual images
  refraction_at_spherical_surface — n₂/v-n₁/u=(n₂-n₁)/R
  optical_instruments    — microscope, telescope, magnifying power

THERMODYNAMICS / MODERN PHYSICS:
  thermal_expansion      — linear, area, volume expansion, coefficients
  specific_heat_cp_cv    — specific heat, Cp, Cv, γ=Cp/Cv
  calorimetry_heat_transfer — calorimetry, heat exchange, Q=mcΔT
  heat_conduction_convection_radiation — modes of heat transfer
  radiation_exchange     — Stefan's law, blackbody, emissivity
  newtons_law_of_cooling — Newton's law of cooling, cooling curves
  ideal_gas_kinetic_theory — kinetic theory, PV=nRT, rms speed
  kinetic_theory_temperature — temperature and KE, equipartition theorem
  gas_laws_ideal         — Boyle's law, Charles's law, Gay-Lussac's law
  first_law_thermodynamics — ΔU=Q-W, internal energy, work done by gas
  isothermal_process     — isothermal, constant temperature, PV=constant
  adiabatic_process      — adiabatic, no heat exchange, PVγ=constant
  pv_diagrams_work       — P-V diagram, work = area under curve
  carnot_engine          — Carnot cycle, efficiency η=1-T₂/T₁
  entropy_second_law     — entropy, second law, irreversibility
  nuclear_fission_fusion — nuclear fission, fusion, binding energy release
  nuclear_binding_energy — mass defect, binding energy per nucleon
  radioactive_decay      — radioactive decay, half-life, activity
  photoelectric_effect_detail — photoelectric effect, work function, hf=φ+KE
  de_broglie_hypothesis  — de Broglie wavelength λ=h/p, wave-particle duality
  bohr_model_hydrogen    — Bohr model, energy levels, emission spectrum
  blackbody_radiation    — blackbody spectrum, Planck's law, Wien's law

Decision rules (apply in order — read the image carefully):
  - Spring attached to block / Hooke's law / F=-kx / SHM of spring → spring_mass_system
  - Pendulum / bob on string / T=2π√(L/g)                         → simple_pendulum or simple_pendulum_shm
  - Projectile path / ball thrown at angle                          → projectile_motion
  - Inclined plane / block sliding                                  → motion_on_inclined_plane or laws_of_motion_friction
  - Two masses over pulley / Atwood                                 → laws_of_motion_atwood
  - Energy conservation / PE+KE = constant                         → conservation_of_energy
  - Collision / before-after velocity arrows                        → elastic_inelastic_collisions
  - Circular motion / centripetal force / banking                   → uniform_circular_motion or circular_motion_banking
  - Thermal energy / heat produced / Joule's law / P=I²R / U=I²Rt → electric_power_heating
  - Terminal voltage / charging / discharging / V=E-Ir             → internal_resistance
  - ρ vs T graph / lattice vibration / temperature effect on R      → resistivity
  - Basic V=IR / conductor experiment / ohmic vs non-ohmic          → ohms_law
  - Refraction / Snell's law / angle diagram                        → refraction_snells_law
  - Prism / spectrum / dispersion                                   → prism_dispersion
  - Mirror diagram / spherical mirror formula                       → reflection_spherical_mirrors
  - Lens / focal length / convex concave                            → thin_lens_formula
  - Young's double slit / fringe pattern                            → youngs_double_slit
  - Sound waves / Doppler / beats                                   → doppler_effect or beats_waves
  - Magnetic field / Biot-Savart / Ampere's law                    → magnetic_field_biot_savart or ampere_circuital_law
  - If genuinely unclear, pick the closest match. NEVER output free text for concept_id.

Image clarity rubric for confidence:
  0.95-1.0  = sharp, well-lit, straight-on photo — every word and line is crisp
  0.80-0.94 = slightly blurry or mildly angled but all key content is readable
  0.60-0.79 = noticeably blurry, dark, or angled — some text/symbols are unclear
  0.40-0.59 = significantly degraded — major content is missing or unreadable
  below 0.4 = too unclear to extract reliably (out-of-focus, extreme glare, cropped badly)

Do NOT default to 1.0. Most phone photos of textbooks are 0.75-0.90.
Output ONLY the JSON. No explanation.
`;

export async function extractConceptFromImage(
    imageBase64: string,
    imageMediaType: string
): Promise<ImageConceptResult | null> {
    try {
        const { text } = await generateText({
            model: google("gemini-2.5-flash"),
            messages: [
                {
                    role: "user",
                    content: [
                        { type: "image", image: `data:${imageMediaType};base64,${imageBase64}` },
                        { type: "text", text: IMAGE_CONTEXT_PROMPT },
                    ],
                },
            ],
            temperature: 0.1,
        });
        const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
        return JSON.parse(cleaned) as ImageConceptResult;
    } catch (err) {
        console.error("[aiSimGen] Image concept extraction failed:", err);
        return null;
    }
}

// =============================================================================
// v5 PHASE A — Config-driven renderer architecture
// AI writes a config JSON. Pre-built renderer executes it. Zero crashes.
// =============================================================================

/** Async lookup of physics constants via the unified loader.
 *  Falls back through CONCEPT_FILE_MAP aliases. */
async function lookupPhysicsConstants(
    conceptId: string
): Promise<PhysicsConstantsFile | null> {
    const key = conceptId.toLowerCase().replace(/[^a-z0-9_]/g, "");
    // Try exact match first
    const constants = await loadConstants(key);
    if (constants) return constants as unknown as PhysicsConstantsFile;
    // Try CONCEPT_FILE_MAP alias
    const resolved = CONCEPT_FILE_MAP[key];
    if (resolved && resolved !== key) {
        const aliased = await loadConstants(resolved);
        if (aliased) return aliased as unknown as PhysicsConstantsFile;
    }
    console.warn(`[aiSimGen] No physics constants for concept_id "${conceptId}" — proceeding without constants`);
    return null;
}

/** v5 Stage 2: Sonnet writes a config JSON constrained by renderer_schema + physics_constants */
async function generateSimConfig(
    brief: SimulationBrief,
    constants: PhysicsConstantsFile | null,
    conceptId?: string,
    simulation_emphasis?: string,
    student_belief?: string,
    modifiedJson?: ModifiedSimulationJson,
    variantConfig?: import("@/lib/variantPicker").VariantConfig,
    vectorAMagnitude?: number,
    vectorBMagnitude?: number,
): Promise<ParticleFieldConfig> {
    const { anthropicGenerate } = await import("@/lib/providers/anthropicProvider");

    const constantsBlock = constants
        ? `\n## LOCKED PHYSICS CONSTANTS (you MUST respect these — cannot override)\n${JSON.stringify(constants, null, 2)}`
        : "";

    // ── Panel layout block (C3-style try/catch — omitted if concept not in map) ──
    let panelBlock = "";
    if (conceptId) {
        const pc = getPanelConfig(conceptId);
        if (pc) {
            const secondaryRenderer = pc.secondary?.renderer ?? "none";
            panelBlock = `## PANEL LAYOUT FOR THIS CONCEPT
Layout: ${pc.layout}
Primary panel: ${pc.primary.renderer}
Secondary panel: ${secondaryRenderer}

${pc.layout === "dual_horizontal"
    ? `If dual_horizontal: your SimulationConfig must include a secondary_config object alongside the primary config. Both configs are validated independently.`
    : `If single: only output one SimulationConfig. No secondary_config field.`}

Each config only contains parameters valid for its own renderer.
particle_field config never contains graph axes.
graph_interactive config never contains particle arrays.

`;
        }
    }

    // Build strategy from brief
    const strategy: SimulationStrategy = {
        renderer: "particle_field",
        aha_moment: brief.aha_moment?.what_to_show ?? "See the physics in motion",
        target_misconception: undefined,
        analogy_to_use: brief.student_confusion,
        emphasis_states: ["STATE_3"],
        exam_target: (brief.mode === "jee" ? "jee" : "boards"),
        vocabulary_level: "intermediate",
        formula_anchor: true,
        skip_state_1: false,
    };

    // Map concept_id to a constants file that exists.
    // runStage2 needs a clean concept key, not the full question string.
    const normalizedConceptId = (conceptId || "").replace(/_(?:basic|advanced|conceptual|exam|jee|neet|definition|intro|overview)$/, "");
    const constantsKey = normalizedConceptId && CONCEPT_FILE_MAP[normalizedConceptId]
        ? CONCEPT_FILE_MAP[normalizedConceptId]
        : (normalizedConceptId || "drift_velocity");

    if (simulation_emphasis) {
        console.log("[generateSimConfig] Forwarding simulation_emphasis to Stage 2 Sonnet prompt");
    }
    // Scope-aware state cap — sourced from jsonModifier's simulation_strategy
    const maxStates = modifiedJson?.simulation_strategy?.max_states;
    const stage2Result = await runStage2(strategy, constantsKey, undefined, simulation_emphasis, student_belief, modifiedJson, variantConfig, vectorAMagnitude, vectorBMagnitude, maxStates);
    return stage2Result.config;
}

/** Hardcoded fallback config for drift velocity — guaranteed correct */
const DRIFT_VELOCITY_FALLBACK_CONFIG: ParticleFieldConfig = {
    renderer: "particle_field",
    canvas: { width: 800, height: 420, bg_color: "#0A0A1A" },
    particles: { count: 25, color: "#42A5F5", size: 8, trail_length: 18, thermal_speed: 4.0 },
    lattice: { count: 35, color: "#90A4AE", size: 12, glow: true },
    field_arrows: { color: "#FF9800", direction: "left_to_right", count: 5 },
    states: {
        STATE_1: { drift_speed: 0, drift_direction: "none", field_visible: false, highlight_particle: false, dim_others: false, dim_opacity: 1.0, field_strength: 0, label: "Pure thermal motion — no electric field" },
        STATE_2: { drift_speed: 0.5, drift_direction: "left", field_visible: true, highlight_particle: false, dim_others: false, dim_opacity: 1.0, field_strength: 5, label: "E field applied — electrons drift slowly left" },
        STATE_3: { drift_speed: 0.5, drift_direction: "left", field_visible: true, highlight_particle: true, dim_others: true, dim_opacity: 0.12, field_strength: 5, label: "Spotlight: watch this electron drift" },
        STATE_4: { drift_speed: 0.8, drift_direction: "left", field_visible: true, highlight_particle: false, dim_others: false, dim_opacity: 1.0, field_strength: 10, label: "Stronger field — faster drift" },
    },
};

/** Generic fallback — concept-neutral particles with no physics labels.
 *  Used when Truth Anchor fails for a concept NOT in any renderer map. */
const GENERIC_FALLBACK_CONFIG: ParticleFieldConfig = {
    renderer: "particle_field",
    canvas: { width: 800, height: 420, bg_color: "#0A0A1A" },
    particles: { count: 20, color: "#78909C", size: 6, trail_length: 10, thermal_speed: 2.0 },
    lattice: { count: 0, color: "#546E7A", size: 0, glow: false },
    field_arrows: { color: "#546E7A", direction: "left_to_right", count: 0 },
    states: {
        STATE_1: { drift_speed: 0, drift_direction: "none", field_visible: false, highlight_particle: false, dim_others: false, dim_opacity: 1.0, field_strength: 0, label: "Simulation temporarily unavailable" },
        STATE_2: { drift_speed: 0, drift_direction: "none", field_visible: false, highlight_particle: false, dim_others: false, dim_opacity: 1.0, field_strength: 0, label: "Simulation temporarily unavailable" },
        STATE_3: { drift_speed: 0, drift_direction: "none", field_visible: false, highlight_particle: false, dim_others: false, dim_opacity: 1.0, field_strength: 0, label: "Simulation temporarily unavailable" },
        STATE_4: { drift_speed: 0, drift_direction: "none", field_visible: false, highlight_particle: false, dim_others: false, dim_opacity: 1.0, field_strength: 0, label: "Simulation temporarily unavailable" },
    },
};

/** Minimal graph fallback — empty axes, no concept-specific data.
 *  Used when Truth Anchor fails for a graph_interactive concept that is NOT ohms_law. */
const GENERIC_GRAPH_FALLBACK: Record<string, unknown> = {
    renderer: "graph_interactive",
    graph_type: "line",
    x_axis: { label: "X", min: 0, max: 10, unit: "" },
    y_axis: { label: "Y", min: 0, max: 10, unit: "" },
    lines: [],
    sliders: [],
    states: {
        STATE_1: { active_lines: [], show_sliders: false, highlight_point: false,
            label: "Simulation temporarily unavailable — under review" },
        STATE_2: { active_lines: [], show_sliders: false, highlight_point: false,
            label: "Simulation temporarily unavailable — under review" },
        STATE_3: { active_lines: [], show_sliders: false, highlight_point: false,
            label: "Simulation temporarily unavailable — under review" },
        STATE_4: { active_lines: [], show_sliders: false, highlight_point: false,
            label: "Simulation temporarily unavailable — under review" },
    },
    pvl_colors: { background: "#0A0A1A", grid: "#1E1E2E", axis: "#D4D4D8", highlight: "#FF9800" },
};

/** Pick the right fallback config based on concept's renderer type.
 *  Never returns drift velocity config for a non-drift-velocity concept. */
function getFallbackConfig(conceptId: string): ParticleFieldConfig {
    const isDriftVelocity = conceptId.includes("drift_velocity") || conceptId === "drift_velocity";
    if (isDriftVelocity) return { ...DRIFT_VELOCITY_FALLBACK_CONFIG };

    // Concept is in CONCEPT_RENDERER_MAP or RENDERER_MAP — use generic particle fallback
    // (circuit_live and graph_interactive concepts are handled by their own pipelines,
    //  this function is only called from the particle_field pipeline)
    return { ...GENERIC_FALLBACK_CONFIG };
}

/** Hardcoded P vs I² graph fallback for electric_power_heating */
const POWER_HEATING_GRAPH_FALLBACK: Record<string, unknown> = {
    renderer: "graph_interactive",
    graph_type: "line",
    x_axis: { symbol: "I", label: "Current", min: 0, max: 5, unit: "A" },
    y_axis: { symbol: "P", label: "Power Dissipated", min: 0, max: 125, unit: "W" },
    lines: [
        { id: "r5", label: "R = 5 Ω", formula: "x*x*5", color: "#42A5F5" },
        { id: "r10", label: "R = 10 Ω", formula: "x*x*10", color: "#66BB6A" },
    ],
    sliders: [
        { id: "current", label: "Current I (A)", min: 0, max: 5, default: 2, step: 0.1 },
    ],
    states: {
        STATE_1: { active_lines: [], show_sliders: false, highlight_point: false,
            label: "P = I²R — Power depends on current squared, not just current" },
        STATE_2: { active_lines: ["r5"], show_sliders: false, highlight_point: true,
            point_x: 2, point_y: 20,
            label: "At I = 2A with R = 5Ω: P = 4 × 5 = 20W" },
        STATE_3: { active_lines: ["r5", "r10"], show_sliders: false, highlight_point: true,
            point_x: 2, point_y: 40,
            label: "Same current, higher R → more power dissipated as heat" },
        STATE_4: { active_lines: ["r5", "r10"], show_sliders: true, highlight_point: false,
            label: "Drag the slider — watch power rise as I² (not linearly!)" },
    },
    legend: [
        { symbol: "P", meaning: "Power dissipated (W)" },
        { symbol: "I²R", meaning: "Power scales with square of current" },
        { symbol: "R", meaning: "Resistance (Ω)" },
    ],
    pvl_colors: { background: "#0A0A1A", grid: "#1E1E2E", axis: "#D4D4D8", highlight: "#FF9800" },
};

/** Pick the right graph fallback based on concept. */
function getGraphFallbackConfig(conceptId: string): Record<string, unknown> {
    const isOhmsLaw = conceptId.includes("ohms_law") || conceptId.includes("ohm");
    if (isOhmsLaw) return { ...OHMS_LAW_GRAPH_FALLBACK };
    if (conceptId === "electric_power_heating") return { ...POWER_HEATING_GRAPH_FALLBACK };
    return { ...GENERIC_GRAPH_FALLBACK };
}

/** Log a truth-anchor failure to simulation_cache with quality_score=0. */
async function logTruthAnchorFailure(
    conceptKey: string,
    conceptId: string,
    classLevel: number | string,
    cacheKey: string | null,
    fingerprint: QuestionFingerprint | null,
): Promise<void> {
    const shouldCache = conceptKey !== 'unknown' && !(cacheKey?.startsWith('unknown|'));
    if (!shouldCache) return;

    const payload: Record<string, unknown> = {
        concept_key: fingerprint?.concept_id ?? conceptKey,
        fingerprint_key: cacheKey,
        class_level: fingerprint?.class_level ?? classLevel,
        quality_score: 0,
        flag: 'truth_anchor_failed',
        pipeline_version: 'v5-fallback',
        served_count: 0,
        sim_html: '',
        sim_code: '',
        sim_type: '',
    };
    const conflictCol = fingerprint ? "fingerprint_key" : "concept_key,class_level";
    const { error } = await supabaseAdmin
        .from("simulation_cache")
        .upsert(payload, { onConflict: conflictCol });
    if (error) {
        console.error("[v5-TruthAnchor] ⚠️ Failed to log truth_anchor_failed:", error.message);
    } else {
        console.log("[v5-TruthAnchor] Logged truth_anchor_failed to simulation_cache for:", conceptKey);
    }
}

/**
 * Normalize an AI-generated ParticleFieldConfig to the schema the renderer reads.
 *
 * Stage 2 (Gemini) produces: base_color, ion_color, ion_size, rows/cols,
 *   field_active, caption — and no field_arrows sub-object.
 * The pre-built renderer reads: color, count, field_visible, label, field_arrows.*.
 *
 * Without this, hexToRGB(undefined) throws → p5.js crashes → blank canvas.
 */
function normalizeForRenderer(raw: ParticleFieldConfig): Record<string, unknown> {
    const cfg        = raw as unknown as Record<string, unknown>;
    const particles  = (cfg.particles   ?? {}) as Record<string, unknown>;
    const lattice    = (cfg.lattice     ?? {}) as Record<string, unknown>;
    const pvl        = (cfg.pvl_colors  ?? {}) as Record<string, unknown>;
    const existingFA = (cfg.field_arrows ?? {}) as Record<string, unknown>;

    // lattice.count from rows*cols or direct count
    const latticeCount =
        typeof lattice.count === 'number'
            ? lattice.count as number
            : (Number(lattice.rows ?? 4) * Number(lattice.cols ?? 8));

    // electron drift is LEFT by default; E-field arrow points OPPOSITE direction
    const electronDrift = (cfg.electron_drift_direction as string | undefined) ?? 'left';
    const fieldDirRaw   = (cfg.field_arrow_direction    as string | undefined)
        ?? (electronDrift === 'left' ? 'right' : 'left');
    const rendererFieldDir =
        fieldDirRaw === 'right' || fieldDirRaw === 'left_to_right'
            ? 'left_to_right' : 'right_to_left';

    // Normalize per-state fields
    const rawStates  = (cfg.states ?? {}) as Record<string, Record<string, unknown>>;
    const normStates: Record<string, Record<string, unknown>> = {};
    for (const [key, state] of Object.entries(rawStates)) {
        const highlighted = Boolean(state.highlight_particle);
        normStates[key] = {
            ...state,
            field_visible:   state.field_visible   ?? state.field_active ?? false,
            drift_direction: state.drift_direction ?? electronDrift,
            label:           state.label           ?? state.caption      ?? key,
            dim_others:      state.dim_others      ?? highlighted,
            dim_opacity:     state.dim_opacity      ?? 0.25,
        };
    }

    return {
        ...cfg,
        particles: {
            ...particles,
            color:        particles.color        ?? particles.base_color ?? '#42A5F5',
            trail_length: particles.trail_length ?? 12,
        },
        lattice: {
            ...lattice,
            count: latticeCount,
            color: lattice.color ?? lattice.ion_color ?? '#90A4AE',
            size:  lattice.size  ?? lattice.ion_size  ?? 10,
            glow:  lattice.glow  ?? false,
        },
        field_arrows: {
            count:     5,
            direction: rendererFieldDir,
            color:     (pvl.field_arrow as string | undefined) ?? '#FF9800',
            ...existingFA,
        },
        states: normStates,
    };
}

/** v5 Assemble HTML: normalizes config then injects into pre-built renderer.
 *  @param animationConstraints  Optional constraints from physics_constants JSON.
 *         Merged into SIM_CONFIG so the renderer can read collision_glow,
 *         glow_scales_as_i_squared, show_power_meter, show_heat_counter, etc. */
function assembleRendererHTML(
    config: ParticleFieldConfig,
    animationConstraints?: Record<string, string | number | boolean> | null,
): string {
    const normalized = normalizeForRenderer(config);
    if (animationConstraints) {
        (normalized as Record<string, unknown>).animation_constraints = animationConstraints;
    }
    const bgColor =
        (config.design as Record<string, unknown> | undefined)?.background as string | undefined
        ?? (config.pvl_colors as Record<string, unknown> | undefined)?.background as string | undefined
        ?? '#0A0A1A';
    return `<!DOCTYPE html>
<html><head>
<meta charset="utf-8">
<style>
html, body { margin: 0; padding: 0; overflow: hidden; background: ${bgColor}; }
canvas { display: block; }
</style>
</head><body>
<script src="https://cdn.jsdelivr.net/npm/p5@1.9.4/lib/p5.min.js"><\/script>
<script>
window.SIM_CONFIG = ${JSON.stringify(normalized)};
<\/script>
<script>
${PARTICLE_FIELD_RENDERER_CODE}
<\/script>
</body></html>`;
}

/**
 * Assemble a self-contained HTML page for circuit_live_renderer.js.
 * Sets window.SIM_CONFIG to the validated circuit config and loads the
 * renderer from /renderers/circuit_live_renderer.js (served by Next.js
 * from the public/ directory).
 */
function assembleCircuitLiveHtml(config: unknown, conceptId: string): string {
    return `<!DOCTYPE html>
<html><head>
<meta charset="utf-8">
<style>
html, body { margin: 0; padding: 0; overflow: hidden; background: #0A0A1A; }
#sketch-container { display: block; }
</style>
</head><body>
<div id="sketch-container"></div>
<script>
window.SIM_CONFIG = ${JSON.stringify(config)};
<\/script>
<script src="/renderers/circuit_live_renderer.js"><\/script>
</body></html>`;
    void conceptId; // suppress unused-param warning; kept for logging upstream
}

// ── CONCEPT_RENDERER_MAP — exact concept_ids from physics_concept_map → renderer ─
// ALL circuit concepts MUST be listed here so resolveRendererType() routes them
// correctly. This is the single source of truth — do NOT use a local Set alongside it.
export const CONCEPT_RENDERER_MAP: Record<string, "circuit_live" | "particle_field" | "graph_interactive" | "mechanics_2d" | "wave_canvas" | "optics_ray" | "field_3d" | "thermodynamics"> = {
    // Ohm's law family
    // ohms_law routes to graph_interactive so runGraphPipeline generates BOTH panels:
    //   - graph (V-I) as simHtml (RIGHT panel)
    //   - OhmsLaw circuit as primarySimHtml (LEFT panel)
    // The route then sets: simHtml=circuit (primary), secondarySimHtml=graph (secondary)
    ohms_law:                       "graph_interactive",
    // series_resistance intentionally omitted — uses particle_field to show current conservation
    parallel_resistance:            "circuit_live",
    internal_resistance:            "circuit_live",
    emf_internal_resistance:        "circuit_live",
    electrical_power_energy:        "circuit_live",
    resistance_temperature_dependence: "circuit_live",
    // Kirchhoff's laws — all spelling variants
    kirchhoffs_laws:                "circuit_live",
    kirchhoffs_law:                 "circuit_live",
    kirchhoffs_voltage_law:         "circuit_live",
    kirchhoffs_current_law:         "circuit_live",
    kvl:                            "circuit_live",
    kcl:                            "circuit_live",
    // Bridge / measurement circuits
    wheatstone_bridge:              "circuit_live",
    meter_bridge:                   "circuit_live",
    potentiometer:                  "circuit_live",
    // Cells
    cells_in_series_parallel:       "circuit_live",
    cells_in_series:                "circuit_live",
    cells_in_parallel:              "circuit_live",
    // Power / heating — dual panel (particle_field + graph_interactive)
    electric_power_heating:         "graph_interactive",
    // Capacitors
    parallel_plate_capacitor_basic: "particle_field",
    parallel_plate_capacitor:       "particle_field",
    // Ch7 AC circuits — circuit_live for component/oscillation concepts, graph_interactive for analytical concepts
    lc_oscillations:                "circuit_live",
    lcr_series_circuit:             "circuit_live",
    resistor_in_ac:                 "circuit_live",
    inductor_in_ac:                 "circuit_live",
    capacitor_in_ac:                "circuit_live",
    transformer:                    "circuit_live",
    ac_basics:                      "graph_interactive",
    phasors:                        "graph_interactive",
    resonance_lcr:                  "graph_interactive",
    power_in_ac:                    "graph_interactive",
    // Mechanics 2D — all concepts routed to the mechanics_2d renderer
    dot_product:                    "mechanics_2d",
    // Atomic splits from former vector_basics bundle
    unit_vector:                    "mechanics_2d",
    angle_between_vectors:          "mechanics_2d",
    scalar_multiplication:          "mechanics_2d",
    negative_vector:                "mechanics_2d",
    equal_vs_parallel:              "mechanics_2d",
    // Atomic splits from former scalar_vs_vector bundle (Ch.5.1)
    // NOTE: current_not_vector is ALSO in PCPL_CONCEPTS (line ~2836). v2.2.1 gold-standard
    // retrofit landed 2026-05-04. This map entry stays for legacy fingerprintKey lookups
    // but the PCPL set takes precedence at the sim-assembler site.
    current_not_vector:             "mechanics_2d",
    parallelogram_law_test:         "mechanics_2d",
    pressure_scalar:                "mechanics_2d",
    area_vector:                    "mechanics_2d",
    // Atomic splits from former vector_addition bundle (Ch.5.2)
    // NOTE: resultant_formula + direction_of_resultant are ALSO in PCPL_CONCEPTS
    // (line ~2821). The PCPL set takes precedence at the sim-assembler site; this
    // entry is kept for epicStateBuilder metadata which uses resolveRendererType().
    resultant_formula:              "mechanics_2d",
    special_cases:                  "mechanics_2d",
    range_inequality:               "mechanics_2d",
    direction_of_resultant:         "mechanics_2d",
    // Atomic splits from former vector_components bundle (Ch.5.3)
    // NOTE: vector_resolution is ALSO in PCPL_CONCEPTS (line ~2821).
    unit_vector_form:               "mechanics_2d",
    inclined_plane_components:      "mechanics_2d",
    negative_components:            "mechanics_2d",
    vector_resolution:              "mechanics_2d",
    // Atomic splits from former distance_vs_displacement bundle (Ch.6.1-6.5)
    distance_displacement_basics:   "mechanics_2d",
    average_speed_velocity:         "mechanics_2d",
    instantaneous_velocity:         "mechanics_2d",
    sign_convention:                "mechanics_2d",
    s_in_equations:                 "mechanics_2d",
    // Atomic splits from former uniform_acceleration bundle (Ch.6.6-6.9)
    three_cases:                    "mechanics_2d",
    free_fall:                      "mechanics_2d",
    sth_formula:                    "mechanics_2d",
    negative_time:                  "mechanics_2d",
    // Atomic splits from former non_uniform_acceleration bundle (Ch.7.1-7.4)
    a_function_of_t:                "mechanics_2d",
    a_function_of_x:                "mechanics_2d",
    a_function_of_v:                "mechanics_2d",
    initial_conditions:             "mechanics_2d",
    // Atomic splits from former motion_graphs bundle (Ch.7.5)
    xt_graph:                       "mechanics_2d",
    vt_graph:                       "mechanics_2d",
    at_graph:                       "mechanics_2d",
    direction_reversal:             "mechanics_2d",
    // Atomic splits from former relative_motion bundle (Ch.6.10)
    vab_formula:                    "mechanics_2d",
    relative_1d_cases:              "mechanics_2d",
    time_to_meet:                   "mechanics_2d",
    // Atomic splits from former river_boat_problems bundle (Ch.6.11)
    upstream_downstream:            "mechanics_2d",
    shortest_time_crossing:         "mechanics_2d",
    shortest_path_crossing:         "mechanics_2d",
    // Atomic splits from former rain_umbrella bundle (Ch.6.12)
    apparent_rain_velocity:         "mechanics_2d",
    umbrella_tilt_angle:            "mechanics_2d",
    // Atomic splits from former aircraft_wind_problems bundle (Ch.6.13)
    ground_velocity_vector:         "mechanics_2d",
    heading_correction:             "mechanics_2d",
    // Atomic splits from former projectile_motion bundle (Ch.7.6)
    time_of_flight:                 "mechanics_2d",
    max_height:                     "mechanics_2d",
    range_formula:                  "mechanics_2d",
    // Atomic splits from former projectile_inclined bundle (Ch.7.7)
    up_incline_projectile:          "mechanics_2d",
    down_incline_projectile:        "mechanics_2d",
    // Atomic splits from former relative_motion_projectiles bundle (Ch.7.8)
    two_projectile_meeting:         "mechanics_2d",
    two_projectile_never_meet:      "mechanics_2d",
    relative_motion_in_2d:          "mechanics_2d",
    // Ch.8 — Laws of Motion
    field_forces:                   "mechanics_2d",
    contact_forces:                 "mechanics_2d",
    normal_reaction:                "mechanics_2d",
    tension_in_string:              "mechanics_2d",
    hinge_force:                    "mechanics_2d",
    free_body_diagram:              "mechanics_2d",
    uniform_circular_motion:        "mechanics_2d",
    laws_of_motion_friction:        "mechanics_2d",
    laws_of_motion_atwood:          "mechanics_2d",
    work_energy_theorem:            "mechanics_2d",
    conservation_of_momentum:       "mechanics_2d",
    simple_pendulum:                "mechanics_2d",
    spring_mass_system:             "mechanics_2d",
    torque_rotation:                "mechanics_2d",
    circular_motion_banking:        "mechanics_2d",
    // Kinematics
    pseudo_forces:                  "mechanics_2d",
    newtons_laws_overview:          "mechanics_2d",
    equations_of_motion:            "mechanics_2d",
    motion_on_inclined_plane:       "mechanics_2d",
    friction_laws:                  "mechanics_2d",
    circular_motion_vertical:       "mechanics_2d",
    // Rotation
    angular_momentum_conservation:  "mechanics_2d",
    moment_of_inertia_shapes:       "mechanics_2d",
    combined_rotation_translation:  "mechanics_2d",
    torque_and_couple:              "mechanics_2d",
    rolling_on_incline:             "mechanics_2d",
    rolling_without_slipping:       "mechanics_2d",
    // Energy
    conservation_of_energy:         "mechanics_2d",
    gravitational_potential_energy: "mechanics_2d",
    // Gravitation
    escape_velocity_orbital:        "mechanics_2d",
    kepler_laws:                    "mechanics_2d",
    geostationary_orbit:            "mechanics_2d",
    // Oscillations
    simple_harmonic_motion:         "mechanics_2d",
    simple_pendulum_shm:            "mechanics_2d",
    physical_pendulum:              "mechanics_2d",
    // Collisions
    elastic_inelastic_collisions:   "mechanics_2d",
    coefficient_of_restitution:     "mechanics_2d",
    linear_momentum_conservation:   "mechanics_2d",
    // Advanced kinematics
    projectile_motion_advanced:     "mechanics_2d",
    vertical_motion_gravity:        "mechanics_2d",
    equilibrium_rigid_body:         "mechanics_2d",
    // Fluids
    bernoulli_principle:            "mechanics_2d",
    buoyancy_archimedes:            "mechanics_2d",
    pressure_pascals_law:           "mechanics_2d",
    surface_tension_capillarity:    "mechanics_2d",
    viscosity_stokes:               "mechanics_2d",
    equation_of_continuity:         "mechanics_2d",
    // Electromagnetic (mechanics context)
    magnetic_force_moving_charge:   "mechanics_2d",
    motion_of_charge_in_field:      "mechanics_2d",
    cyclotron:                      "mechanics_2d",
    bohr_model_hydrogen:            "mechanics_2d",
    // Wave concepts — all routed to the wave_canvas renderer
    wave_superposition:             "wave_canvas",
    standing_waves:                 "wave_canvas",
    beats_waves:                    "wave_canvas",
    doppler_effect:                 "wave_canvas",
    sound_waves:                    "wave_canvas",
    wave_on_string:                 "wave_canvas",
    // Optics concepts — all routed to the optics_ray renderer
    convex_lens:                    "optics_ray",
    concave_lens:                   "optics_ray",
    concave_mirror:                 "optics_ray",
    convex_mirror:                  "optics_ray",
    refraction_snells_law:          "optics_ray",
    total_internal_reflection:      "optics_ray",
    prism_dispersion:               "optics_ray",
    // Thermodynamics concepts — all routed to the thermodynamics (p5.js + Plotly) renderer
    first_law_thermodynamics:       "thermodynamics",
    isothermal_process:             "thermodynamics",
    adiabatic_process:              "thermodynamics",
    carnot_engine:                  "thermodynamics",
    ideal_gas_kinetic_theory:       "thermodynamics",
    // Field 3D concepts — all routed to the field_3d (Three.js) renderer
    electric_field_lines:           "field_3d",
    electric_potential_3d:          "field_3d",
    parallel_plate_capacitor_field: "field_3d",
    magnetic_field_solenoid:        "field_3d",
    magnetic_field_wire:            "field_3d",
    gauss_law_3d:                   "field_3d",
    electromagnetic_induction_3d:   "field_3d",
    bar_magnet_field:               "field_3d",
};

// ── RENDERER_MAP — concept_id prefix → renderer type ──────────────────────
// Used by the pipeline to select the correct HTML assembler per concept.
// NOTE: kirchhoffs_laws removed from here — it's in CONCEPT_RENDERER_MAP as circuit_live.
export const RENDERER_MAP: Record<string, "particle_field" | "graph_interactive"> = {
    ohms_law:                 "graph_interactive",
    resistivity:              "graph_interactive",
    photoelectric:            "graph_interactive",
    coulombs_law:             "graph_interactive",
    electric_power_heating:   "graph_interactive",
};

/** v5 Graph assembler: wraps GRAPH_INTERACTIVE_RENDERER_CODE in a full HTML doc */
export function assembleGraphHTML(config: Record<string, unknown>): string {
    const bg = (config.pvl_colors as Record<string, string>)?.background ?? "#0A0A1A";
    return `<!DOCTYPE html>
<html><head>
<meta charset="utf-8">
<style>
html, body { margin: 0; padding: 0; height: 100%; background: ${bg}; font-family: system-ui, sans-serif; color: #D4D4D8; display: flex; flex-direction: column; }
#plot { flex: 1; min-height: 0; }
#sliders { display: none; flex-direction: column; padding: 8px 16px; gap: 8px; background: #0F0F1F; border-top: 1px solid #1E1E2E; }
.slider-row { display: flex; align-items: center; gap: 10px; font-size: 13px; }
.slider-row label { min-width: 130px; color: #D4D4D8; }
.slider-row input[type=range] { flex: 1; accent-color: #42A5F5; cursor: pointer; }
.slider-row .val { min-width: 44px; text-align: right; color: #FF9800; font-weight: bold; }
#readout { text-align: center; padding: 5px 8px; font-size: 13px; color: #FF9800; letter-spacing: 0.04em; background: #0F0F1F; border-top: 1px solid #1E1E2E; }
</style>
</head><body>
<div id="plot"></div>
<div id="sliders"></div>
<div id="readout"></div>
<script src="https://cdn.plot.ly/plotly-2.27.0.min.js" charset="utf-8"><\/script>
<script>
window.SIM_CONFIG = ${JSON.stringify(config)};
<\/script>
<script>
${GRAPH_INTERACTIVE_RENDERER_CODE}
<\/script>
</body></html>`;
}

// ── Renderer type resolver (CONCEPT_RENDERER_MAP takes priority) ─────────────
const KNOWN_SUFFIXES = /_(?:basic|advanced|conceptual|exam|jee|neet|definition|intro|overview)$/;

// Ch.8 concepts dispatch to the PCPL parametric assembler; other atomic
// concepts (vectors, kinematics, etc.) use the mechanics_2d assembler. This
// is ONLY for assembler selection — the strict-engines gate below applies
// uniformly to every concept (no more CH8 hardcoded bypass as of Phase A).
// Concepts migrated to the PCPL parametric_renderer pipeline. Grows with
// each gold-standard retrofit; when all 52 concepts are listed here, the
// legacy mechanics_2d + 6 domain-specific renderers can be retired.
const PCPL_CONCEPTS = new Set<string>([
    // Ch.8 Forces (6, shipped sessions 23-27)
    'field_forces', 'contact_forces', 'normal_reaction',
    'tension_in_string', 'hinge_force', 'free_body_diagram',
    // Ch.5 Vectors (3, shipped sessions 28-30)
    'vector_resolution', 'resultant_formula', 'direction_of_resultant',
    // Ch.5 Relative motion (1, shipped session 32)
    'umbrella_tilt_angle',
    // Ch.8.5 Friction (1, shipped session 34 — first v2.2-native gold-standard)
    'friction_static_kinetic',
    // Ch.5.1 Vectors-vs-scalars (1, shipped session 53 — first v2.2.1 retrofit with aha_moment + cognitive_limits)
    'current_not_vector',
    'pressure_scalar',
]);

// Extract text from a tts_sentences entry. Handles both JSON shapes:
//   - Plain string (Ch.8 JSONs: "Yeh aam ped se...")
//   - Object with text_en/text (Ch.5-7 JSONs: { id: "s1", text_en: "..." })
function extractTtsText(item: unknown): string {
    if (typeof item === 'string') return item;
    if (typeof item === 'object' && item !== null) {
        const obj = item as { text_en?: string; text?: string };
        return obj.text_en ?? obj.text ?? '';
    }
    return '';
}

type AtomicState = {
    scene_composition?: unknown;
    teacher_script?: { tts_sentences?: unknown };
    advance_mode?: unknown;
    focal_primitive_id?: unknown;
};

const VALID_ADVANCE_MODES = new Set<string>([
    'auto_after_tts', 'manual_click', 'wait_for_answer', 'interaction_complete',
]);

// Strict-engines gate (Phase A — tightened 2026-04-19). Returns true when a
// concept JSON meets the v2 data-driven spec and can skip Brief/Stage 2/Stage
// 3B, serving scene_composition + teacher_script directly through the
// assembler. Per CLAUDE.md Section 11 Phase A + Section 5 rules 16 and 20.
//
// Per-state requirements:
//   1. scene_composition is an array with length >= 3 (rule 20)
//   2. focal_primitive_id is a non-empty string (Section 6)
//   3. teacher_script.tts_sentences has at least one item with text
//   4. advance_mode is in VALID_ADVANCE_MODES
//
// Top-level requirements:
//   5. epic_c_branches is an array with length >= 4 (Section 11 Phase A)
//   6. At least 2 distinct advance_mode values across states (rule 16)
export function hasCompleteAtomicPayload(conceptJson: unknown): boolean {
    if (typeof conceptJson !== 'object' || conceptJson === null) return false;
    const root = conceptJson as {
        epic_l_path?: { states?: unknown };
        epic_c_branches?: unknown;
    };
    const states = root.epic_l_path?.states;
    if (typeof states !== 'object' || states === null) return false;

    const stateKeys = Object.keys(states).filter(k => k.startsWith('STATE_'));
    if (stateKeys.length === 0) return false;

    const statesRecord = states as Record<string, AtomicState>;
    const advanceModes = new Set<string>();
    for (const key of stateKeys) {
        const st = statesRecord[key];
        if (typeof st !== 'object' || st === null) return false;

        if (!Array.isArray(st.scene_composition) || st.scene_composition.length < 3) return false;

        if (typeof st.focal_primitive_id !== 'string' || st.focal_primitive_id.length === 0) return false;

        const tts = st.teacher_script?.tts_sentences;
        if (!Array.isArray(tts) || tts.length === 0) return false;
        if (!tts.some(item => extractTtsText(item).length > 0)) return false;

        if (typeof st.advance_mode !== 'string' || !VALID_ADVANCE_MODES.has(st.advance_mode)) return false;
        advanceModes.add(st.advance_mode);
    }

    if (advanceModes.size < 2) return false;

    if (!Array.isArray(root.epic_c_branches) || root.epic_c_branches.length < 4) return false;

    return true;
}

// Board-mode merge — when the session mode is 'board', swap every epic_l_path
// state's scene_composition with mode_overrides.board.derivation_sequence
// [STATE_N].primitives so the renderer draws the answer-sheet derivation
// instead of the conceptual scene. Also surfaces canvas_style so the assembler
// can switch the background. CLAUDE.md Section 5 rule 22.
type BoardModeMergeResult = {
    json: unknown;
    canvasStyle: 'default' | 'answer_sheet' | undefined;
};

export function applyBoardMode(conceptJson: unknown, examMode?: string): BoardModeMergeResult {
    const passthrough: BoardModeMergeResult = { json: conceptJson, canvasStyle: undefined };
    if (examMode !== 'board') return passthrough;
    if (typeof conceptJson !== 'object' || conceptJson === null) return passthrough;

    const src = conceptJson as {
        epic_l_path?: { states?: Record<string, { scene_composition?: unknown } & Record<string, unknown>> };
        mode_overrides?: {
            board?: {
                canvas_style?: string;
                derivation_sequence?: Record<string, { primitives?: unknown[] }>;
            };
        };
    };
    const boardOverride = src.mode_overrides?.board;
    if (!boardOverride) return passthrough;

    const canvasStyle: 'default' | 'answer_sheet' | undefined =
        boardOverride.canvas_style === 'answer_sheet' ? 'answer_sheet' : undefined;

    const derivation = boardOverride.derivation_sequence;
    if (!derivation || typeof derivation !== 'object') {
        return { json: conceptJson, canvasStyle };
    }

    const srcStates = src.epic_l_path?.states ?? {};
    const mergedStates: Record<string, { scene_composition?: unknown } & Record<string, unknown>> = {};
    for (const [stateKey, stateValue] of Object.entries(srcStates)) {
        const overridePrims = derivation[stateKey]?.primitives;
        if (Array.isArray(overridePrims)) {
            mergedStates[stateKey] = { ...stateValue, scene_composition: overridePrims };
        } else {
            mergedStates[stateKey] = stateValue;
        }
    }
    const mergedJson = {
        ...(src as Record<string, unknown>),
        epic_l_path: { ...(src.epic_l_path ?? {}), states: mergedStates },
    };
    return { json: mergedJson, canvasStyle };
}

function resolveRendererType(conceptId: string): "circuit_live" | "particle_field" | "graph_interactive" | "mechanics_2d" | "wave_canvas" | "optics_ray" | "field_3d" | "thermodynamics" {
    // 1. Exact match against CONCEPT_RENDERER_MAP (valid physics_concept_map IDs)
    //    These MUST NOT fall back to particle_field — circuit_live is their only valid renderer.
    if (CONCEPT_RENDERER_MAP[conceptId]) return CONCEPT_RENDERER_MAP[conceptId];
    // 2. Exact match against legacy RENDERER_MAP
    if (RENDERER_MAP[conceptId]) return RENDERER_MAP[conceptId];
    
    // 3. Strip known suffixes and retry exact match
    const stripped = conceptId.replace(KNOWN_SUFFIXES, "");
    if (stripped !== conceptId) {
        if (CONCEPT_RENDERER_MAP[stripped]) return CONCEPT_RENDERER_MAP[stripped];
        if (RENDERER_MAP[stripped]) return RENDERER_MAP[stripped];
    }
    
    // 4. Partial match on legacy RENDERER_MAP
    for (const [key, type] of Object.entries(RENDERER_MAP)) {
        if (conceptId.includes(key) || stripped.includes(key)) return type;
    }
    return "particle_field";
}

/** Hardcoded correct GraphConfig for Ohm's law — used if Sonnet fails twice */
const OHMS_LAW_GRAPH_FALLBACK: Record<string, unknown> = {
    renderer: "graph_interactive",
    graph_type: "line",
    x_axis: { symbol: "V", label: "Voltage", min: 0, max: 12, unit: "V" },
    y_axis: { symbol: "I", label: "Current", min: 0, max: 6, unit: "A" },
    lines: [
        { id: "line1", label: "R\u202f=\u202f2\u03a9", color: "#42A5F5", slope: 0.5 },
        { id: "line2", label: "R\u202f=\u202f4\u03a9", color: "#66BB6A", slope: 0.25 },
    ],
    sliders: [
        { id: "voltage",    label: "Voltage (V)",      min: 0, max: 12, default: 6 },
        { id: "resistance", label: "Resistance (\u03a9)", min: 1, max: 10, default: 2 },
    ],
    states: {
        STATE_1: { active_lines: [], show_sliders: false, highlight_point: false,
            label: "Empty axes \u2014 no voltage applied yet" },
        STATE_2: { active_lines: ["line1"], show_sliders: false, highlight_point: true,
            point_x: 6, point_y: 3,
            label: "V\u202f=\u202f6V, R\u202f=\u202f2\u03a9 \u2192 I\u202f=\u202f3A. V\u202f=\u202fIR gives a straight line." },
        STATE_3: { active_lines: ["line1", "line2"], show_sliders: false, highlight_point: false,
            label: "Higher resistance \u2192 shallower slope \u2192 less current for same voltage" },
        STATE_4: { active_lines: ["line1"], show_sliders: true,
            label: "Drag the sliders \u2014 watch current change proportionally with voltage" },
    },
    pvl_colors: { background: "#0A0A1A", grid: "#1E1E2E", axis: "#D4D4D8", highlight: "#FF9800" },
    legend: [
        { symbol: "V", meaning: "Voltage" },
        { symbol: "I", meaning: "Current" },
        { symbol: "R", meaning: "Resistance" },
    ],
};

const GRAPH_CONFIG_SCHEMA = `GraphConfig JSON schema (output EXACTLY this structure, no markdown fences, no extra fields):
{
  "renderer": "graph_interactive",
  "graph_type": "line",
  "x_axis": { "symbol": "V", "label": "Voltage", "min": 0, "max": 12, "unit": "V" },
  "y_axis": { "symbol": "I", "label": "Current", "min": 0, "max": 6, "unit": "A" },
  "lines": [
    { "id": "line1", "label": "R = 2Ω", "color": "#42A5F5", "slope": 0.5 },
    { "id": "line2", "label": "R = 4Ω", "color": "#66BB6A", "slope": 0.25 }
  ],
  "sliders": [
    { "id": "voltage",    "label": "Voltage (V)",       "min": 0, "max": 12, "default": 6 },
    { "id": "resistance", "label": "Resistance (Ω)",    "min": 1, "max": 10, "default": 2 }
  ],
  "states": {
    "STATE_1": { "active_lines": [], "show_sliders": false, "highlight_point": false, "label": "..." },
    "STATE_2": { "active_lines": ["line1"], "show_sliders": false, "highlight_point": true, "point_x": 6, "point_y": 3, "label": "..." },
    "STATE_3": { "active_lines": ["line1","line2"], "show_sliders": false, "highlight_point": false, "label": "..." },
    "STATE_4": { "active_lines": ["line1"], "show_sliders": true, "label": "..." }
  },
  "pvl_colors": { "background": "#0A0A1A", "grid": "#1E1E2E", "axis": "#D4D4D8", "highlight": "#FF9800" },
  "legend": [
    { "symbol": "V", "meaning": "Voltage" },
    { "symbol": "I", "meaning": "Current" },
    { "symbol": "R", "meaning": "Resistance" }
  ]
}`.trim();

/** v5 Graph Stage 2: Sonnet writes a GraphConfig JSON */
// ── Concept-specific graph guidance ─────────────────────────────────────────
// Overrides the default Ohm's law rules in generateGraphConfig for non-V-I graphs.
const CONCEPT_GRAPH_RULES: Record<string, string> = {
    electric_power_heating: `4. This is a P vs I graph — NOT a V-I graph. The relationship is PARABOLIC: P = I²R
5. x_axis: symbol="I", label="Current", unit="A", min=0, max=5
6. y_axis: symbol="P", label="Power Dissipated", unit="W", min=0, max=100
7. Line formula: for each line, power = I² × R. Use "formula": "x*x*R_VALUE" where R_VALUE is the resistance.
8. STATE_1: active_lines=[] — empty axes, label explains P = I²R relationship
9. STATE_2: ONE parabolic curve (R=5Ω) + highlight_point showing (2, 20) — P = 4×5 = 20W
10. STATE_3: TWO parabolic curves (R=5Ω and R=10Ω) — student sees higher R = MORE heat for same current
11. STATE_4: show_sliders=true — slider for R (1–20Ω), highlight moves along parabola as I changes
12. CRITICAL: lines MUST use "formula" field (e.g. "x*x*5") NOT "slope"+"intercept" — this is a CURVE not a straight line
13. Each line needs: { id, label, formula, color } — formula uses "x" for current`,
};

const DEFAULT_GRAPH_RULES = `4. slope = 1/R (Ohm's law: I = V/R)
5. STATE_1: active_lines=[] — empty axes
6. STATE_2: one line + highlight_point at a valid (point_x, point_y) within axis ranges
7. STATE_3: two lines with different slopes to show resistance comparison
8. STATE_4: show_sliders=true — interactive exploration`;

async function generateGraphConfig(
    brief: SimulationBrief,
    conceptId: string,
): Promise<Record<string, unknown>> {
    const { anthropicGenerate } = await import("@/lib/providers/anthropicProvider");

    const conceptRules = CONCEPT_GRAPH_RULES[conceptId] ?? DEFAULT_GRAPH_RULES;

    const system = `You are a physics graph configuration writer. Output ONLY valid JSON conforming to the schema. No markdown fences. No explanation.`;
    const basePrompt = `## GRAPH CONFIG SCHEMA\n${GRAPH_CONFIG_SCHEMA}\n\n## SIMULATION BRIEF\n${JSON.stringify(brief, null, 2)}\n\n## RULES\n1. renderer MUST be "graph_interactive"\n2. pvl_colors MUST be exactly: background="#0A0A1A", grid="#1E1E2E", axis="#D4D4D8", highlight="#FF9800"\n3. line colors: "#42A5F5" (line1), "#66BB6A" (line2)\n${conceptRules}\n9. All point_x/point_y must be within x_axis.min–max and y_axis.min–max\n10. Label each state with a clear student-friendly one-liner\n11. x_axis and y_axis MUST each have both "symbol" (short: e.g. "V") AND "label" (full name: e.g. "Voltage") — never omit either\n12. "legend" MUST be present listing every symbol used in the graph with its full meaning\nOutput the JSON object now:`;

    for (let attempt = 1; attempt <= 2; attempt++) {
        try {
            console.log(`[v5-Graph-Stage2] Generating GraphConfig (attempt ${attempt})...`);
            const { text } = await anthropicGenerate(
                { model: "claude-sonnet-4-6", provider: "anthropic", costPer1KInput: 0.003, costPer1KOutput: 0.015 },
                system,
                basePrompt + (attempt === 2 ? "\n\nPREVIOUS ATTEMPT FAILED. Strictly follow the JSON schema." : ""),
                1500,
            );
            const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
            const parsed = JSON.parse(cleaned) as Record<string, unknown>;
            if (parsed.renderer !== "graph_interactive") throw new Error("Wrong renderer");
            const s = parsed.states as Record<string, unknown>;
            if (!s?.STATE_1 || !s?.STATE_4) throw new Error("Missing states");
            console.log(`[v5-Graph-Stage2] ✅ GraphConfig generated for "${conceptId}"`);
            return parsed;
        } catch (err) {
            console.warn(`[v5-Graph-Stage2] Attempt ${attempt} failed:`, err);
        }
    }
    console.warn("[v5-Graph-Stage2] Using graph fallback for:", conceptId);
    return getGraphFallbackConfig(conceptId);
}

/** Convert GraphConfig states into a StateMachineSpec for Stage 4 */
function graphConfigToStateMachineSpec(config: Record<string, unknown>, concept: string): StateMachineSpec {
    const states = (config.states ?? {}) as Record<string, Record<string, unknown>>;
    const stateEntries: SimulationStateEntry[] = Object.entries(states).map(([id, s]) => ({
        id,
        name: String(s.label ?? id),
        show: Array.isArray(s.active_lines) ? (s.active_lines as string[]) : [],
        hide: [],
        what_student_sees: String(s.label ?? id),
        visible_label: String(s.label ?? id),
    }));
    return { concept, total_states: stateEntries.length, states: stateEntries };
}

// =============================================================================
// OHM'S LAW CONFIG GENERATOR — Sonnet writes values only, never rendering code
// =============================================================================

async function generateOhmsLawConfig(brief: SimulationBrief): Promise<OhmsLawConfig> {
    const { anthropicGenerate } = await import("@/lib/providers/anthropicProvider");

    const system = `You are a physics simulation configuration writer.
Output ONLY valid JSON matching the schema. No markdown fences. No explanation.`;

    const prompt = `## SCHEMA
${OHMS_LAW_CONFIG_SCHEMA}

## SIMULATION BRIEF
${JSON.stringify(brief, null, 2)}

## RULES
1. resistivity MUST be exactly 2.0 (fixed educational constant)
2. conductor_length: choose between 1.5–2.5 for a medium default wire
3. conductor_area: choose between 1.5–2.5 for a medium default wire
4. comparison_length MUST be > conductor_length (to show higher R for same V)
5. comparison_area MUST equal conductor_area (fair comparison: only L changes)
6. point_current in STATE_2 = voltage / (2.0 * conductor_length / conductor_area)
7. pvl_colors MUST be exactly: background="#0A0A1A", conductor="#B87333", arrow="#FF9800", ammeter="#42A5F5"
8. All four state labels must be distinct, student-friendly sentences (not physics jargon)
9. show_comparison MUST be true

Output the JSON object now:`;

    for (let attempt = 1; attempt <= 2; attempt++) {
        try {
            console.log(`[v5-OhmsLaw] Generating OhmsLawConfig (attempt ${attempt})...`);
            const { text } = await anthropicGenerate(
                { model: "claude-sonnet-4-6", provider: "anthropic", costPer1KInput: 0.003, costPer1KOutput: 0.015 },
                system,
                prompt + (attempt === 2 ? "\n\nPREVIOUS ATTEMPT FAILED. Strictly follow the schema — all fields required." : ""),
                800,
            );
            const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
            const parsed = JSON.parse(cleaned) as OhmsLawConfig;
            if (!parsed.states?.STATE_1 || !parsed.states?.STATE_4) throw new Error("Missing states");
            if (typeof parsed.conductor_length !== "number") throw new Error("Missing conductor_length");
            console.log(`[v5-OhmsLaw] ✅ OhmsLawConfig generated (attempt ${attempt})`);
            return parsed;
        } catch (err) {
            console.warn(`[v5-OhmsLaw] Attempt ${attempt} failed:`, err);
        }
    }
    console.warn("[v5-OhmsLaw] Both attempts failed — using fallback config");
    return { ...OHMS_LAW_CONFIG_FALLBACK };
}

/**
 * Scans generated p5.js HTML for Ohm's law formula errors (I = V*R instead of I = V/R).
 *
 * Two independent checks:
 *  1. Regex: finds explicit multiplication of voltage × resistance assigned to a current variable.
 *  2. Numeric: extracts the first default V and R values from variable assignments, then checks
 *     whether any slider range or hardcoded current value is implausibly high (I > V when R ≥ 1).
 *
 * Returns a human-readable error string if a problem is found, null if the HTML passes.
 */
function detectCurrentFormulaError(html: string): string | null {
    // ── Check 1: explicit V * R formula in a current / drift assignment ─────
    const badMultiply = [
        // current = ... voltage * resistance  (in any order)
        /\b(?:current|I_val|I_before|I_after|drift_speed|driftSpeed|ampere)\b\s*=\s*[^;\n\/]{0,80}\bvoltage\b\s*\*\s*\b(?:resistance|R_total|totalR|totalResistance)\b/i,
        /\b(?:current|I_val|I_before|I_after|drift_speed|driftSpeed|ampere)\b\s*=\s*[^;\n\/]{0,80}\b(?:resistance|R_total|totalR|totalResistance)\b\s*\*\s*\bvoltage\b/i,
        // drift_speed = R * constant  (backwards: speed should DECREASE as R rises)
        /\b(?:drift_speed|driftSpeed)\b\s*=\s*\b(?:resistance|R_total|totalR)\b\s*\*/i,
    ];
    for (const pat of badMultiply) {
        if (pat.test(html)) {
            return `Formula error (regex): I = V * R pattern detected — must be I = V / R`;
        }
    }

    // ── Check 2: numeric sanity — extract first V and R defaults, derive expected I ──
    const vMatch = html.match(/\b(?:voltage|V_val|batteryVoltage)\s*=\s*(\d+(?:\.\d+)?)\b/i);
    const rMatch = html.match(/\b(?:resistance|R_total|totalResistance|R_val)\s*=\s*(\d+(?:\.\d+)?)\b/i);
    if (vMatch && rMatch) {
        const V = parseFloat(vMatch[1]);
        const R = parseFloat(rMatch[1]);
        // Only meaningful when R ≥ 1 (resistances below 1Ω make I > V legitimately)
        if (V > 0 && R >= 1) {
            const correctI = V / R;
            // Scan for the actual formula operator used next to these two vars
            const formulaOp = html.match(
                /\b(?:current|I_val|I_before|I_after|drift_speed|driftSpeed)\b\s*=\s*\b(?:voltage|V_val|batteryVoltage)\b\s*([\*\/])\s*\b(?:resistance|R_total|totalResistance|R_val)\b/i,
            );
            if (formulaOp && formulaOp[1] === '*') {
                const wrongI = V * R;
                return `Formula error (numeric): operator is * giving I=${wrongI} — must be / giving I=${correctI.toFixed(2)} (V=${V}, R=${R})`;
            }
            // Secondary: look for a hardcoded current literal that's implausibly large
            const iLiteral = html.match(/\b(?:current|I_before|I_after|I_val)\s*=\s*(\d+(?:\.\d+)?)\b/i);
            if (iLiteral) {
                const I = parseFloat(iLiteral[1]);
                if (I > V * 2 && I > correctI * 5) {
                    return `Formula error (numeric literal): hardcoded I=${I} is implausibly high for V=${V}, R=${R} (expected I≈${correctI.toFixed(2)})`;
                }
            }
        }
    }

    return null; // no error detected
}

/**
 * Generate concept-specific p5.js HTML for the primary panel in dual layouts.
 * Unlike the rigid particle_field renderer, this generates custom visuals
 * appropriate to each concept (e.g., conductor rod for Ohm's law,
 * photoelectric plate for photoelectric effect).
 */
// ── Mechanics 2D config generator ──────────────────────────────────────────
// Calls Claude Sonnet to produce a Mechanics2DConfig JSON for the given concept.
// Prompt is concise: system prompt explains the schema + physics rules;
// user message gives concept, brief, and which scenario to use.
const MECHANICS_SCENARIO_MAP: Record<string, string> = {
    // Kinematics
    projectile_motion:              "projectile",
    projectile_motion_advanced:     "projectile",
    equations_of_motion:            "free_body_diagram",
    vertical_motion_gravity:        "projectile",
    relative_motion:                "free_body_diagram",
    motion_graphs:                  "free_body_diagram",
    // Newton's Laws + Forces
    newtons_laws_overview:          "free_body_diagram",
    laws_of_motion_friction:        "friction",
    laws_of_motion_atwood:          "atwood",
    friction_laws:                  "friction",
    motion_on_inclined_plane:       "friction",
    equilibrium_rigid_body:         "free_body_diagram",
    pseudo_forces:                  "non_inertial_frame",
    // Circular Motion
    uniform_circular_motion:        "circular",
    circular_motion_vertical:       "circular",
    circular_motion_banking:        "banking",
    // Rotation
    torque_rotation:                "torque",
    torque_and_couple:              "torque",
    moment_of_inertia_shapes:       "torque",
    angular_momentum_conservation:  "torque",
    combined_rotation_translation:  "torque",
    rolling_on_incline:             "torque",
    rolling_without_slipping:       "torque",
    physical_pendulum:              "pendulum",
    // Energy + Work
    work_energy_theorem:            "work_energy",
    conservation_of_energy:         "work_energy",
    gravitational_potential_energy: "work_energy",
    // Momentum + Collisions
    conservation_of_momentum:       "momentum",
    linear_momentum_conservation:   "momentum",
    elastic_inelastic_collisions:   "momentum",
    coefficient_of_restitution:     "momentum",
    // Oscillations
    simple_pendulum:                "pendulum",
    simple_pendulum_shm:            "pendulum",
    simple_harmonic_motion:         "spring_mass",
    spring_mass_system:             "spring_mass",
    // Gravitation
    escape_velocity_orbital:        "circular",
    kepler_laws:                    "circular",
    geostationary_orbit:            "circular",
    // Fluids
    bernoulli_principle:            "free_body_diagram",
    buoyancy_archimedes:            "free_body_diagram",
    pressure_pascals_law:           "free_body_diagram",
    surface_tension_capillarity:    "free_body_diagram",
    viscosity_stokes:               "free_body_diagram",
    equation_of_continuity:         "free_body_diagram",
    // Electromagnetic (mechanics context)
    magnetic_force_moving_charge:   "circular",
    motion_of_charge_in_field:      "circular",
    cyclotron:                      "circular",
    bohr_model_hydrogen:            "circular",
};

async function generateMechanics2DConfig(
    brief: SimulationBrief,
    conceptId: string,
    ctx: StudentContext,
): Promise<Mechanics2DConfig> {
    const scenario = MECHANICS_SCENARIO_MAP[conceptId] ?? "projectile";

    const systemPrompt = `You are a physics simulation config generator for PhysicsMind, an Indian Class 10-12 AI tutor.
Generate a valid Mechanics2DConfig JSON object for a p5.js renderer.

SCHEMA (TypeScript):
interface Mechanics2DConfig {
  scenario: string;            // one of: projectile|circular|friction|atwood|work_energy|momentum|pendulum|spring_mass|torque|banking|non_inertial_frame|free_body_diagram
  objects: Array<{
    id: string; shape: "circle"|"rect"|"pendulum_bob";
    mass: number; color: string;
    initial_x: number; initial_y: number;  // pixel positions on 800x500 canvas
    label: string;
    width?: number; height?: number; radius?: number; // in METERS (renderer scales by canvas_scale)
  }>;
  forces: Array<{
    on_object: string; name: string;
    direction_degrees: number;  // 0=right 90=up 180=left 270=down
    magnitude: number;          // Newtons
    color: string;
    show_in_states: string[];
  }>;
  initial_conditions: Record<string, number>;  // e.g. v0, angle_deg, length_m, spring_k, mu_k, etc.
  show_components: boolean;
  show_path: boolean;
  show_labels: boolean;
  show_energy_bar: boolean;
  canvas_scale: number;          // pixels per meter (use 40–80)
  canvas_width: number;          // 800
  canvas_height: number;         // 500
  surface?: { exists: boolean; slope_degrees: number; color?: string };
  pulley?: { x: number; y: number; radius: number };
  spring?: { anchor_x: number; anchor_y: number; natural_length_m: number; spring_k?: number };
  states: {
    STATE_1: { label: string; what_student_sees: string; highlight_forces: string[]; time_step: 0 };
    STATE_2: { label: string; what_student_sees: string; highlight_forces: string[]; time_step: number };
    STATE_3: { label: string; what_student_sees: string; highlight_forces: string[]; time_step: number };
    STATE_4: { label: string; what_student_sees: string; highlight_forces: string[]; time_step: number };
  };
  pvl_colors: { background: "#0A0A1A"; text: "#D4D4D8" };
}

PHYSICS RULES (non-negotiable):
- Projectile: x(t)=v₀cosθ·t, y(t)=y₀−v₀sinθ·t+½gt². STATE_1=launch(t=0), STATE_2=peak(t=v₀sinθ/g), STATE_3=landing(t=2v₀sinθ/g)
- Pendulum: θ(t)=θ₀cos(√(g/L)·t), small-angle valid for θ₀<30°. STATE_1=max displacement(t=0), STATE_2=bottom(t=π/(2ω)), STATE_3=other extreme(t=π/ω)
- Spring-mass: x(t)=Acos(√(k/m)·t). STATE_1=max extension(t=0), STATE_2=equilibrium(t=π/(2ω)), STATE_3=max compression(t=π/ω)
- Circular: centripetal acceleration ALWAYS points toward center.
- Friction: f_kinetic = μₖN exactly. f_static ≤ μₛN.
- Force arrows: magnitude must be in Newtons, proportional to each other.
- Atwood: a=(m₁−m₂)/(m₁+m₂)·g, tension T=2m₁m₂g/(m₁+m₂).
- show_energy_bar: true for pendulum, spring_mass, projectile, work_energy. false for others.
- show_path: true for projectile, pendulum, circular. false for static concepts.
- STATE_1 always has time_step: 0.

OUTPUT: raw JSON only — no markdown, no code fences, no commentary.`;

    const userMsg = `Concept: ${conceptId}
Scenario: ${scenario}
Student question: ${ctx.question ?? brief.concept}
Brief summary: ${brief.concept} — ${brief.key_insight_to_show ?? ""}

Generate the Mechanics2DConfig JSON for scenario="${scenario}".
Use realistic Indian-textbook values (e.g. v₀=20m/s, θ=45° for projectile; L=1m for pendulum; m=2kg,1kg for Atwood).
canvas_width=800, canvas_height=500. Place objects visually well-spaced.
Force colors: gravity=#42A5F5, normal=#66BB6A, friction=#EF5350, applied=#FF9800, tension=#CE93D8, centripetal=#F48FB1.`;

    let raw = "";
    try {
        const resp = await anthropic.messages.create({
            model: "claude-sonnet-4-6",
            max_tokens: 2000,
            system: systemPrompt,
            messages: [{ role: "user", content: userMsg }],
        });
        raw = (resp.content[0] as { type: string; text: string }).text ?? "";
        await logUsage({
            taskType: "mechanics2d_config",
            provider: "anthropic",
            model: "claude-sonnet-4-6",
            inputChars: (systemPrompt + userMsg).length,
            outputChars: raw.length,
            latencyMs: 0,
            estimatedCostUsd: 0,
            wasCacheHit: false,
        });
    } catch (err) {
        console.error("[mechanics2d] Sonnet call failed:", err);
        return getMechanics2DFallback(scenario, conceptId);
    }

    // Extract JSON
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
        console.warn("[mechanics2d] No JSON in response, using fallback");
        return getMechanics2DFallback(scenario, conceptId);
    }

    try {
        const config = JSON.parse(jsonMatch[0]) as Mechanics2DConfig;
        // Ensure required fields
        config.scenario   = config.scenario   ?? scenario;
        config.canvas_width  = config.canvas_width  ?? 800;
        config.canvas_height = config.canvas_height ?? 500;
        config.canvas_scale  = config.canvas_scale  ?? 50;
        config.pvl_colors    = config.pvl_colors ?? { background: "#0A0A1A", text: "#D4D4D8" };
        config.objects   = config.objects   ?? [];
        config.forces    = config.forces    ?? [];
        config.initial_conditions = config.initial_conditions ?? {};
        config.states    = config.states    ?? getMechanics2DFallback(scenario, conceptId).states;
        // Cap non_inertial_frame to 1 object to prevent canvas crowding
        if (config.scenario === 'non_inertial_frame' && (config.objects?.length ?? 0) > 1) {
            config.objects = [config.objects[0]];
        }
        console.log("[mechanics2d] Config generated successfully for:", conceptId);
        return config;
    } catch (parseErr) {
        console.warn("[mechanics2d] JSON parse failed, using fallback:", parseErr);
        return getMechanics2DFallback(scenario, conceptId);
    }
}

function getMechanics2DFallback(scenario: string, conceptId: string): Mechanics2DConfig {
    // Minimal valid fallback configs per scenario
    const FALLBACKS: Record<string, Mechanics2DConfig> = {
        projectile: {
            scenario: "projectile",
            objects: [{ id: "ball", shape: "circle", mass: 1, color: "#FF9800", initial_x: 120, initial_y: 380, label: "ball", radius: 0.15 }],
            forces: [
                { on_object: "ball", name: "gravity", direction_degrees: 270, magnitude: 9.8, color: "#42A5F5", show_in_states: ["STATE_1"] },
                { on_object: "ball", name: "v₀",     direction_degrees: 45,  magnitude: 20,  color: "#FFEB3B", show_in_states: ["STATE_1"] },
            ],
            initial_conditions: { v0: 20, angle_deg: 45, x0_pixels: 120, y0_pixels: 380 },
            show_components: true, show_path: true, show_labels: true, show_energy_bar: true,
            canvas_scale: 12, canvas_width: 800, canvas_height: 500,
            surface: { exists: true, slope_degrees: 0, color: "#555555" },
            states: {
                STATE_1: { label: "Launch — v₀=20m/s at 45°",           what_student_sees: "Ball at rest, initial velocity shown", highlight_forces: ["v₀","gravity"], time_step: 0 },
                STATE_2: { label: "Peak — vᵧ=0, vₓ unchanged",          what_student_sees: "Ball at highest point — vertical velocity is zero", highlight_forces: [], time_step: 1.44 },
                STATE_3: { label: "Landing — same horizontal distance",  what_student_sees: "Ball lands symmetrically — range = v₀²sin2θ/g", highlight_forces: [], time_step: 2.88 },
                STATE_4: { label: "Full path — parabolic trajectory",    what_student_sees: "Complete parabola — horizontal motion is uniform, vertical is accelerated", highlight_forces: [], time_step: 2.88 },
            },
            pvl_colors: { background: "#0A0A1A", text: "#D4D4D8" },
        },
        pendulum: {
            scenario: "pendulum",
            objects: [{ id: "bob", shape: "pendulum_bob", mass: 0.5, color: "#CE93D8", initial_x: 400, initial_y: 75, label: "m", radius: 0.12 }],
            forces: [
                { on_object: "bob", name: "gravity", direction_degrees: 270, magnitude: 4.9, color: "#42A5F5", show_in_states: ["STATE_1","STATE_2","STATE_3","STATE_4"] },
                { on_object: "bob", name: "tension", direction_degrees: 90,  magnitude: 4.9, color: "#CE93D8", show_in_states: ["STATE_2"] },
            ],
            initial_conditions: { length_m: 1.0, angle_deg: 30, mass: 0.5 },
            show_components: false, show_path: true, show_labels: true, show_energy_bar: true,
            canvas_scale: 220, canvas_width: 800, canvas_height: 500,
            pulley: { x: 400, y: 75, radius: 10 },
            states: {
                STATE_1: { label: "Max displacement — KE=0, PE=max",  what_student_sees: "Bob at maximum angle — all energy is potential", highlight_forces: ["gravity"], time_step: 0 },
                STATE_2: { label: "Bottom — KE=max, PE=0",            what_student_sees: "Bob at lowest point — all energy is kinetic", highlight_forces: ["tension","gravity"], time_step: 0.52 },
                STATE_3: { label: "Other extreme — KE=0, PE=max",     what_student_sees: "Bob swings to opposite side — energy converts back to PE", highlight_forces: ["gravity"], time_step: 1.04 },
                STATE_4: { label: "T=2π√(L/g) — period from length",  what_student_sees: "Full oscillation — period depends only on length, not mass", highlight_forces: [], time_step: 2.08 },
            },
            pvl_colors: { background: "#0A0A1A", text: "#D4D4D8" },
        },
        spring_mass: {
            scenario: "spring_mass",
            objects: [{ id: "mass", shape: "rect", mass: 1, color: "#FF9800", initial_x: 500, initial_y: 250, label: "m=1kg", width: 0.6, height: 0.4 }],
            forces: [
                { on_object: "mass", name: "F=-kx", direction_degrees: 180, magnitude: 5, color: "#EF5350", show_in_states: ["STATE_1","STATE_3"] },
                { on_object: "mass", name: "F=-kx", direction_degrees: 0,   magnitude: 5, color: "#66BB6A", show_in_states: ["STATE_2"] },
            ],
            initial_conditions: { spring_k: 10, amplitude_m: 0.5, phase_deg: 0, mass: 1 },
            show_components: false, show_path: false, show_labels: true, show_energy_bar: true,
            canvas_scale: 100, canvas_width: 800, canvas_height: 500,
            spring: { anchor_x: 100, anchor_y: 250, natural_length_m: 2.0 },
            states: {
                STATE_1: { label: "Max extension — PE=max, KE=0",    what_student_sees: "Mass at maximum stretch — spring PE is maximum", highlight_forces: ["F=-kx"], time_step: 0 },
                STATE_2: { label: "Equilibrium — KE=max, PE=0",      what_student_sees: "Mass passes through rest position — kinetic energy maximum", highlight_forces: [], time_step: 0.31 },
                STATE_3: { label: "Max compression — PE=max, KE=0",  what_student_sees: "Mass at maximum compression — energy converts back to PE", highlight_forces: ["F=-kx"], time_step: 0.63 },
                STATE_4: { label: "T=2π√(m/k) — period from m and k", what_student_sees: "Complete SHM cycle — period depends on mass and spring constant", highlight_forces: [], time_step: 1.26 },
            },
            pvl_colors: { background: "#0A0A1A", text: "#D4D4D8" },
        },
        circular: {
            scenario: "circular",
            objects: [{ id: "obj", shape: "circle", mass: 1, color: "#42A5F5", initial_x: 550, initial_y: 250, label: "m", radius: 0.12 }],
            forces: [{ on_object: "obj", name: "F_c", direction_degrees: 180, magnitude: 10, color: "#F48FB1", show_in_states: ["STATE_1","STATE_2","STATE_3","STATE_4"] }],
            initial_conditions: { radius_m: 1.5, speed_ms: 5, center_x: 400, center_y: 250, start_angle_deg: 0 },
            show_components: true, show_path: true, show_labels: true, show_energy_bar: false,
            canvas_scale: 100, canvas_width: 800, canvas_height: 500,
            states: {
                STATE_1: { label: "Circular motion begins",             what_student_sees: "Object moves in circle at constant speed", highlight_forces: ["F_c"], time_step: 0 },
                STATE_2: { label: "F_c points toward center always",    what_student_sees: "Centripetal force always points inward — perpendicular to velocity", highlight_forces: ["F_c"], time_step: 0.47 },
                STATE_3: { label: "Speed constant, direction changes",  what_student_sees: "Speed is constant but direction changes — this IS acceleration", highlight_forces: [], time_step: 0.94 },
                STATE_4: { label: "a_c=v²/r — depends on speed/radius", what_student_sees: "Full orbit shown — centripetal acceleration = v²/r toward center", highlight_forces: ["F_c"], time_step: 1.88 },
            },
            pvl_colors: { background: "#0A0A1A", text: "#D4D4D8" },
        },
        friction: {
            scenario: "friction",
            objects: [{ id: "block", shape: "rect", mass: 5, color: "#FF9800", initial_x: 200, initial_y: 320, label: "5kg", width: 0.8, height: 0.5 }],
            forces: [
                { on_object: "block", name: "W",        direction_degrees: 270, magnitude: 49,  color: "#42A5F5", show_in_states: ["STATE_1","STATE_2","STATE_3"] },
                { on_object: "block", name: "N",        direction_degrees: 90,  magnitude: 49,  color: "#66BB6A", show_in_states: ["STATE_1","STATE_2","STATE_3"] },
                { on_object: "block", name: "f_s",      direction_degrees: 180, magnitude: 20,  color: "#EF5350", show_in_states: ["STATE_1"] },
                { on_object: "block", name: "F_applied",direction_degrees: 0,   magnitude: 20,  color: "#FF9800", show_in_states: ["STATE_1","STATE_2"] },
                { on_object: "block", name: "f_k",      direction_degrees: 180, magnitude: 14.7,color: "#E57373", show_in_states: ["STATE_3"] },
            ],
            initial_conditions: { mu_s: 0.5, mu_k: 0.3, f_applied: 20, mass: 5 },
            show_components: false, show_path: false, show_labels: true, show_energy_bar: false,
            canvas_scale: 80, canvas_width: 800, canvas_height: 500,
            surface: { exists: true, slope_degrees: 0, color: "#555555" },
            states: {
                STATE_1: { label: "Static equilibrium — f_s balances F",   what_student_sees: "Block stationary: static friction equals applied force", highlight_forces: ["f_s","F_applied"], time_step: 0 },
                STATE_2: { label: "F > μₛN — block about to slide",        what_student_sees: "Applied force exceeds maximum static friction — motion begins", highlight_forces: ["F_applied","N"], time_step: 0 },
                STATE_3: { label: "Sliding — f_k=μₖN (less than f_s max)", what_student_sees: "Kinetic friction is less than static maximum — block accelerates", highlight_forces: ["f_k"], time_step: 1.0 },
                STATE_4: { label: "f_k = μₖN = 0.3 × 49 = 14.7N",         what_student_sees: "Kinetic friction is exactly μₖN — constant while sliding", highlight_forces: ["f_k","N"], time_step: 2.0 },
            },
            pvl_colors: { background: "#0A0A1A", text: "#D4D4D8" },
        },
        atwood: {
            scenario: "atwood",
            objects: [
                { id: "m1", shape: "rect", mass: 2, color: "#FF9800", initial_x: 330, initial_y: 200, label: "2kg", width: 0.5, height: 0.5 },
                { id: "m2", shape: "rect", mass: 1, color: "#42A5F5", initial_x: 470, initial_y: 200, label: "1kg", width: 0.5, height: 0.5 },
            ],
            forces: [
                { on_object: "m1", name: "W₁",  direction_degrees: 270, magnitude: 19.6, color: "#42A5F5", show_in_states: ["STATE_1","STATE_2","STATE_3","STATE_4"] },
                { on_object: "m2", name: "W₂",  direction_degrees: 270, magnitude: 9.8,  color: "#42A5F5", show_in_states: ["STATE_1","STATE_2","STATE_3","STATE_4"] },
                { on_object: "m1", name: "T",   direction_degrees: 90,  magnitude: 13.1, color: "#CE93D8", show_in_states: ["STATE_2","STATE_3"] },
                { on_object: "m2", name: "T",   direction_degrees: 90,  magnitude: 13.1, color: "#CE93D8", show_in_states: ["STATE_2","STATE_3"] },
            ],
            initial_conditions: { mass1_kg: 2, mass2_kg: 1 },
            show_components: false, show_path: false, show_labels: true, show_energy_bar: false,
            canvas_scale: 80, canvas_width: 800, canvas_height: 500,
            pulley: { x: 400, y: 100, radius: 30 },
            states: {
                STATE_1: { label: "System at rest — m₁ > m₂",            what_student_sees: "Two unequal masses over pulley — system is about to move", highlight_forces: ["W₁","W₂"], time_step: 0 },
                STATE_2: { label: "a=(m₁−m₂)g/(m₁+m₂) = 3.27 m/s²",     what_student_sees: "m₁ falls, m₂ rises — net force drives the system", highlight_forces: ["T","W₁"], time_step: 0.5 },
                STATE_3: { label: "T=2m₁m₂g/(m₁+m₂) = 13.1 N",          what_student_sees: "Tension is same throughout rope — less than W₁, more than W₂", highlight_forces: ["T"], time_step: 1.0 },
                STATE_4: { label: "Larger mass difference → larger a",    what_student_sees: "If m₁=m₂, system stays still (a=0). Difference drives acceleration.", highlight_forces: [], time_step: 1.5 },
            },
            pvl_colors: { background: "#0A0A1A", text: "#D4D4D8" },
        },
        work_energy: {
            scenario: "work_energy",
            objects: [{ id: "obj", shape: "rect", mass: 2, color: "#66BB6A", initial_x: 100, initial_y: 280, label: "2kg", width: 0.6, height: 0.4 }],
            forces: [{ on_object: "obj", name: "F",  direction_degrees: 0, magnitude: 10, color: "#FF9800", show_in_states: ["STATE_1","STATE_2","STATE_3","STATE_4"] }],
            initial_conditions: { force_n: 10, mass: 2 },
            show_components: false, show_path: false, show_labels: true, show_energy_bar: true,
            canvas_scale: 50, canvas_width: 800, canvas_height: 500,
            surface: { exists: true, slope_degrees: 0, color: "#555555" },
            states: {
                STATE_1: { label: "At rest — KE=0, work not yet done",     what_student_sees: "Object at rest before force is applied", highlight_forces: ["F"], time_step: 0 },
                STATE_2: { label: "Work done = F·d = KE gained",           what_student_sees: "Force has moved object — work equals KE gained", highlight_forces: ["F"], time_step: 1.0 },
                STATE_3: { label: "KE = ½mv² = W_net",                    what_student_sees: "KE bar grows as speed increases — work-energy theorem", highlight_forces: [], time_step: 2.0 },
                STATE_4: { label: "W_net = ΔKE — net work = KE change",   what_student_sees: "All net work converts to kinetic energy — the theorem", highlight_forces: ["F"], time_step: 3.0 },
            },
            pvl_colors: { background: "#0A0A1A", text: "#D4D4D8" },
        },
        momentum: {
            scenario: "momentum",
            objects: [
                { id: "obj1", shape: "circle", mass: 2, color: "#FF9800", initial_x: 150, initial_y: 250, label: "2kg", radius: 0.18 },
                { id: "obj2", shape: "circle", mass: 1, color: "#42A5F5", initial_x: 550, initial_y: 250, label: "1kg", radius: 0.13 },
            ],
            forces: [
                { on_object: "obj1", name: "p₁",  direction_degrees: 0, magnitude: 10, color: "#FF9800", show_in_states: ["STATE_1"] },
                { on_object: "obj2", name: "p₂",  direction_degrees: 0, magnitude: 0,  color: "#42A5F5", show_in_states: ["STATE_1"] },
                { on_object: "obj1", name: "p₁′", direction_degrees: 0, magnitude: 3.3,color: "#FF9800", show_in_states: ["STATE_3","STATE_4"] },
                { on_object: "obj2", name: "p₂′", direction_degrees: 0, magnitude: 6.7,color: "#42A5F5", show_in_states: ["STATE_3","STATE_4"] },
            ],
            initial_conditions: { v1_initial: 5, v2_initial: 0, mass1_kg: 2, mass2_kg: 1, collision_time: 1.0 },
            show_components: false, show_path: false, show_labels: true, show_energy_bar: false,
            canvas_scale: 60, canvas_width: 800, canvas_height: 500,
            states: {
                STATE_1: { label: "Before — p_total=m₁v₁=10 kg·m/s",     what_student_sees: "obj1 moving, obj2 at rest — total momentum is 10 kg·m/s", highlight_forces: ["p₁"], time_step: 0 },
                STATE_2: { label: "Approach — p_total unchanged in flight", what_student_sees: "Objects approaching — no external horizontal force, so momentum conserved", highlight_forces: [], time_step: 0.9 },
                STATE_3: { label: "After elastic collision",               what_student_sees: "Momentum redistributed — total p still equals 10 kg·m/s", highlight_forces: ["p₁′","p₂′"], time_step: 1.5 },
                STATE_4: { label: "p_total before = p_total after always", what_student_sees: "Conservation law: total momentum is conserved in all collisions", highlight_forces: [], time_step: 2.5 },
            },
            pvl_colors: { background: "#0A0A1A", text: "#D4D4D8" },
        },
        torque: {
            scenario: "torque",
            objects: [{ id: "arm", shape: "rect", mass: 1, color: "#CE93D8", initial_x: 400, initial_y: 250, label: "rigid body", width: 2.0, height: 0.15 }],
            forces: [{ on_object: "arm", name: "F",  direction_degrees: 90, magnitude: 10, color: "#FF9800", show_in_states: ["STATE_1","STATE_2","STATE_3","STATE_4"] }],
            initial_conditions: { torque_nm: 5, moment_of_inertia: 2, radius_m: 0.5 },
            show_components: false, show_path: false, show_labels: true, show_energy_bar: false,
            canvas_scale: 100, canvas_width: 800, canvas_height: 500,
            states: {
                STATE_1: { label: "Force at distance r from pivot",        what_student_sees: "Force applied at end of rigid body — creates torque", highlight_forces: ["F"], time_step: 0 },
                STATE_2: { label: "τ = F × r = 5 N·m",                    what_student_sees: "Torque = force × perpendicular distance from pivot", highlight_forces: ["F"], time_step: 0.5 },
                STATE_3: { label: "α = τ/I — angular acceleration",       what_student_sees: "Body rotates — angular acceleration proportional to torque", highlight_forces: [], time_step: 1.0 },
                STATE_4: { label: "Greater r or F → greater rotation",    what_student_sees: "Torque is more effective farther from pivot — lever principle", highlight_forces: ["F"], time_step: 1.5 },
            },
            pvl_colors: { background: "#0A0A1A", text: "#D4D4D8" },
        },
        banking: {
            scenario: "banking",
            objects: [{ id: "car", shape: "rect", mass: 1000, color: "#42A5F5", initial_x: 350, initial_y: 230, label: "car", width: 0.8, height: 0.4 }],
            forces: [
                { on_object: "car", name: "W",      direction_degrees: 270, magnitude: 9800, color: "#42A5F5", show_in_states: ["STATE_1","STATE_2","STATE_3","STATE_4"] },
                { on_object: "car", name: "N",      direction_degrees: 105, magnitude: 10140,color: "#66BB6A", show_in_states: ["STATE_1","STATE_2","STATE_3","STATE_4"] },
                { on_object: "car", name: "N_h",    direction_degrees: 180, magnitude: 2612, color: "#F48FB1", show_in_states: ["STATE_2","STATE_3"] },
                { on_object: "car", name: "N_v",    direction_degrees: 90,  magnitude: 9800, color: "#66BB6A", show_in_states: ["STATE_2","STATE_3"] },
            ],
            initial_conditions: { speed_ms: 20, radius_m: 50, banking_angle_deg: 15 },
            show_components: false, show_path: false, show_labels: true, show_energy_bar: false,
            canvas_scale: 80, canvas_width: 800, canvas_height: 500,
            surface: { exists: true, slope_degrees: 15, color: "#555555" },
            states: {
                STATE_1: { label: "Banked road — car in circular path",        what_student_sees: "Vehicle on banked road — the tilt provides centripetal force", highlight_forces: ["N","W"], time_step: 0 },
                STATE_2: { label: "N_horizontal = mv²/r (centripetal force)",  what_student_sees: "Horizontal component of Normal force provides centripetal force", highlight_forces: ["N_h"], time_step: 0 },
                STATE_3: { label: "N_vertical = mg (weight balanced)",         what_student_sees: "Vertical component of Normal force balances weight", highlight_forces: ["N_v","W"], time_step: 0 },
                STATE_4: { label: "tanθ = v²/rg — optimal banking angle",     what_student_sees: "Ideal angle: no friction needed at design speed v=√(rg·tanθ)", highlight_forces: [], time_step: 0 },
            },
            pvl_colors: { background: "#0A0A1A", text: "#D4D4D8" },
        },
    };

    return FALLBACKS[scenario] ?? FALLBACKS["projectile"];
}

// ── Wave Canvas config generation ─────────────────────────────────────────────

const WAVE_SCENARIO_MAP: Record<string, string> = {
    wave_superposition: "superposition",
    standing_waves:     "standing_wave",
    beats_waves:        "beats",
    doppler_effect:     "doppler_moving",
    sound_waves:        "longitudinal_wave",
    wave_on_string:     "transverse_wave",
};

async function generateWaveCanvasConfig(
    brief: SimulationBrief,
    conceptId: string,
    ctx: StudentContext,
): Promise<WaveCanvasConfig> {
    const scenario = WAVE_SCENARIO_MAP[conceptId] ?? "transverse_wave";

    const systemPrompt = `You are a physics simulation config generator for PhysicsMind, an Indian Class 10-12 AI tutor.
Generate a valid WaveCanvasConfig JSON object for a p5.js wave renderer.

SCHEMA (TypeScript):
interface WaveCanvasConfig {
  scenario_type: "transverse_wave"|"longitudinal_wave"|"standing_wave"|"superposition"|"beats"|"doppler_moving"|"shm_particle"|"em_wave";
  waves: Array<{
    id: string;
    amplitude: number;      // pixels (30-80)
    wavelength: number;     // pixels (80-200)
    frequency: number;      // display Hz (0.5-5)
    phase: number;          // radians
    direction: "left"|"right"|"stationary";
    color: string;          // hex
    label: string;
  }>;
  medium: { type: "string"|"air"|"vacuum"; particle_count: number; damping: number };
  show_wavelength_markers: boolean;
  show_node_antinode: boolean;
  show_displacement_graph: boolean;
  states: {
    STATE_1: { label: string; active_waves: string[]; show_resultant: boolean; slider_active: boolean; caption: string };
    STATE_2: { label: string; active_waves: string[]; show_resultant: boolean; slider_active: boolean; caption: string };
    STATE_3: { label: string; active_waves: string[]; show_resultant: boolean; slider_active: boolean; caption: string };
    STATE_4: { label: string; active_waves: string[]; show_resultant: boolean; slider_active: boolean; caption: string };
  };
  pvl_colors: { background: "#0A0A1A"; text: "#D4D4D8"; wave_1: string; wave_2: string; resultant: string };
}

PHYSICS RULES (non-negotiable):
- Superposition: y_resultant = y1 + y2 at every point. Waves pass THROUGH each other unchanged.
- Standing wave: nodes have ZERO amplitude always. Antinodes oscillate between +A and -A. Node spacing = λ/2.
- Beats: beat frequency = |f1 - f2|, NEVER f1+f2. Amplitude envelope period = 1/|f1-f2|.
- Doppler: wave SPEED unchanged. Only wavelength/frequency change. Wavefronts compressed ahead, stretched behind.
- Longitudinal: particles oscillate parallel to wave direction. They do NOT travel with the wave.
- Transverse: particles oscillate perpendicular to wave direction.
- show_node_antinode: true for standing_wave only.
- show_wavelength_markers: true for transverse_wave, standing_wave.

OUTPUT: raw JSON only — no markdown, no code fences, no commentary.`;

    const userMsg = `Concept: ${conceptId}
Scenario: ${scenario}
Student question: ${ctx.question ?? brief.concept}
Brief summary: ${brief.concept} — ${brief.key_insight_to_show ?? ""}

Generate the WaveCanvasConfig JSON for scenario_type="${scenario}".
Use realistic physics values. Two waves for superposition/standing/beats scenarios.
Wave colors: wave_1=#4FC3F7, wave_2=#FF8A65, resultant=#66BB6A.`;

    let raw = "";
    try {
        const resp = await anthropic.messages.create({
            model: "claude-sonnet-4-6",
            max_tokens: 2000,
            system: systemPrompt,
            messages: [{ role: "user", content: userMsg }],
        });
        raw = (resp.content[0] as { type: string; text: string }).text ?? "";
        await logUsage({
            taskType: "wave_canvas_config",
            provider: "anthropic",
            model: "claude-sonnet-4-6",
            inputChars: (systemPrompt + userMsg).length,
            outputChars: raw.length,
            latencyMs: 0,
            estimatedCostUsd: 0,
            wasCacheHit: false,
        });
    } catch (err) {
        console.error("[wave_canvas] Sonnet call failed:", err);
        return getWaveCanvasFallback(scenario);
    }

    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
        console.warn("[wave_canvas] No JSON in response, using fallback");
        return getWaveCanvasFallback(scenario);
    }

    try {
        const config = JSON.parse(jsonMatch[0]) as WaveCanvasConfig;
        config.scenario_type = config.scenario_type ?? scenario as WaveCanvasConfig["scenario_type"];
        config.waves = config.waves ?? [];
        config.medium = config.medium ?? { type: "string", particle_count: 40, damping: 0 };
        config.pvl_colors = config.pvl_colors ?? { background: "#0A0A1A", text: "#D4D4D8", wave_1: "#4FC3F7", wave_2: "#FF8A65", resultant: "#66BB6A" };
        console.log("[wave_canvas] Config generated successfully for:", conceptId);
        return config;
    } catch (parseErr) {
        console.warn("[wave_canvas] JSON parse failed, using fallback:", parseErr);
        return getWaveCanvasFallback(scenario);
    }
}

function getWaveCanvasFallback(scenario: string): WaveCanvasConfig {
    const defaultWave = {
        id: "wave_1", amplitude: 50, wavelength: 120, frequency: 1.5,
        phase: 0, direction: "right" as const, color: "#4FC3F7", label: "Wave 1",
    };
    const defaultStates = {
        STATE_1: { label: "Setup", active_waves: ["wave_1"], show_resultant: false, slider_active: false, caption: "Observe the wave" },
        STATE_2: { label: "Analysis", active_waves: ["wave_1"], show_resultant: false, slider_active: false, caption: "Notice the wave properties" },
        STATE_3: { label: "Key Insight", active_waves: ["wave_1"], show_resultant: false, slider_active: false, caption: "The aha moment" },
        STATE_4: { label: "Explore", active_waves: ["wave_1"], show_resultant: false, slider_active: true, caption: "Adjust parameters" },
    };

    if (scenario === "superposition" || scenario === "standing_wave") {
        const wave2 = { ...defaultWave, id: "wave_2", direction: "left" as const, color: "#FF8A65", label: "Wave 2" };
        const isStanding = scenario === "standing_wave";
        return {
            scenario_type: scenario as WaveCanvasConfig["scenario_type"],
            waves: [defaultWave, wave2],
            medium: { type: "string", particle_count: 40, damping: 0 },
            show_wavelength_markers: isStanding,
            show_node_antinode: isStanding,
            show_displacement_graph: false,
            states: {
                // STATE_1: Component waves only — no resultant, no markers
                STATE_1: { ...defaultStates.STATE_1, active_waves: ["wave_1", "wave_2"],
                    show_resultant: false, show_node_antinode: false,
                    label: isStanding ? "Two travelling waves" : "Two waves",
                    caption: isStanding ? "Orange travels right, blue travels left — both with the same amplitude" : "Two waves moving in space" },
                // STATE_2: Add the green resultant so students see the sum
                STATE_2: { ...defaultStates.STATE_2, active_waves: ["wave_1", "wave_2"],
                    show_resultant: true, show_node_antinode: false,
                    label: isStanding ? "Superposition — see the sum" : "Superposition",
                    caption: isStanding ? "Green = orange + blue at every point. The pattern doesn't move!" : "Green curve is the sum of both waves" },
                // STATE_3: Full standing wave with node/antinode labels
                STATE_3: { ...defaultStates.STATE_3, active_waves: ["wave_1", "wave_2"],
                    show_resultant: true, show_node_antinode: isStanding,
                    label: isStanding ? "Nodes and antinodes" : "Key Insight",
                    caption: isStanding ? "Red N = nodes (always zero). Gold A = antinodes (oscillate between ±A)" : "Waves interfere constructively and destructively" },
                // STATE_4: Only the standing wave, waves in background
                STATE_4: { ...defaultStates.STATE_4, active_waves: ["wave_1", "wave_2"],
                    show_resultant: true, show_node_antinode: isStanding,
                    label: isStanding ? "Standing wave — explore harmonics" : "Explore",
                    caption: isStanding ? "Node spacing = λ/2. Antinode spacing = λ/2. Try different frequencies!" : "Adjust parameters" },
                STATE_5: {
                    label: "Aha Moment — Standing Pattern Revealed",
                    active_waves: ["wave_1", "wave_2"],
                    show_resultant: true,
                    show_node_antinode: true,
                    slider_active: false,
                    caption: "Nodes are locked by geometry. Time cannot move them."
                },
                STATE_6: {
                    label: "Student Interaction — Harmonics",
                    active_waves: ["wave_1", "wave_2"],
                    show_resultant: true,
                    show_node_antinode: true,
                    slider_active: true,
                    caption: "Try any harmonic. The pattern always holds."
                }
            },
            pvl_colors: { background: "#0A0A1A", text: "#D4D4D8", wave_1: "#4FC3F7", wave_2: "#FF8A65", resultant: "#66BB6A" },
        };
    }

    if (scenario === "beats") {
        const wave2 = { ...defaultWave, id: "wave_2", frequency: 1.8, color: "#FF8A65", label: "Wave 2 (f₂)" };
        return {
            scenario_type: "beats",
            waves: [{ ...defaultWave, label: "Wave 1 (f₁)" }, wave2],
            medium: { type: "air", particle_count: 0, damping: 0 },
            show_wavelength_markers: false, show_node_antinode: false, show_displacement_graph: false,
            states: {
                STATE_1: { label: "Two close frequencies", active_waves: ["wave_1", "wave_2"], show_resultant: false, slider_active: false, caption: "Two waves with slightly different frequencies" },
                STATE_2: { label: "Superposition", active_waves: ["wave_1", "wave_2"], show_resultant: true, slider_active: false, caption: "The resultant amplitude varies periodically" },
                STATE_3: { label: "Beat frequency = |f₁-f₂|", active_waves: ["wave_1", "wave_2"], show_resultant: true, slider_active: false, caption: "Count the loud moments — that is the beat frequency" },
                STATE_4: { label: "Explore", active_waves: ["wave_1", "wave_2"], show_resultant: true, slider_active: true, caption: "Change frequencies to see beats change" },
            },
            pvl_colors: { background: "#0A0A1A", text: "#D4D4D8", wave_1: "#4FC3F7", wave_2: "#FF8A65", resultant: "#66BB6A" },
        };
    }

    return {
        scenario_type: scenario as WaveCanvasConfig["scenario_type"],
        waves: [defaultWave],
        medium: { type: "string", particle_count: 40, damping: 0 },
        show_wavelength_markers: true, show_node_antinode: false, show_displacement_graph: false,
        states: defaultStates,
        pvl_colors: { background: "#0A0A1A", text: "#D4D4D8", wave_1: "#4FC3F7", wave_2: "#FF8A65", resultant: "#66BB6A" },
    };
}

// ── OPTICS_SCENARIO_MAP — concept_id → scenario_type ─────────────────────────
const OPTICS_SCENARIO_MAP: Record<string, OpticsRayConfig["scenario_type"]> = {
    convex_lens:                "convex_lens",
    concave_lens:               "concave_lens",
    concave_mirror:             "concave_mirror",
    convex_mirror:              "convex_mirror",
    refraction_snells_law:      "refraction_flat",
    total_internal_reflection:  "total_internal_reflection",
    prism_dispersion:           "prism_dispersion",
};

async function generateOpticsRayConfig(
    brief: SimulationBrief,
    conceptId: string,
    ctx: StudentContext,
): Promise<OpticsRayConfig> {
    const scenario = OPTICS_SCENARIO_MAP[conceptId] ?? "convex_lens";

    const systemPrompt = `You are a physics simulation config generator for PhysicsMind, an Indian Class 10-12 AI tutor.
Generate a valid OpticsRayConfig JSON object for a p5.js ray optics renderer.

SCHEMA (TypeScript):
interface OpticsRayConfig {
  scenario_type: "convex_lens"|"concave_lens"|"concave_mirror"|"convex_mirror"|"refraction_flat"|"total_internal_reflection"|"prism_dispersion";
  optical_element: {
    type: "lens"|"mirror"|"prism"|"flat_surface";
    focal_length?: number;       // pixels, signed per new Cartesian
    refractive_index_1?: number; // medium 1
    refractive_index_2?: number; // medium 2
    prism_angle?: number;        // degrees
    position_x: number;          // center x of element (usually 400)
    position_y: number;          // center y (usually 250)
  };
  object: {
    position_x: number;   // relative to element (negative = left)
    height: number;        // pixels (40-80)
    label: string;
  };
  rays: Array<{
    id: string;
    type: "parallel"|"through_focus"|"through_center"|"incident";
    color: string;  // hex
  }>;
  sign_convention: "new_cartesian";
  show_principal_axis: boolean;
  show_focal_points: boolean;
  show_measurements: boolean;
  states: {
    STATE_1: { label: string; visible_rays: string[]; show_image: boolean; show_object: boolean; caption: string; object_distance?: number };
    STATE_2: { label: string; visible_rays: string[]; show_image: boolean; show_object: boolean; caption: string; object_distance?: number };
    STATE_3: { label: string; visible_rays: string[]; show_image: boolean; show_object: boolean; caption: string; object_distance?: number };
    STATE_4: { label: string; visible_rays: string[]; show_image: boolean; show_object: boolean; caption: string; object_distance?: number };
  };
  pvl_colors: { background: "#0A0A1A"; ray: string; element: string; image: string; virtual_ray: string; text: "#D4D4D8" };
}

PHYSICS RULES (non-negotiable):
- Lens formula: 1/v - 1/u = 1/f. Mirror formula: 1/v + 1/u = 1/f. New Cartesian convention.
- Convex lens: f positive. Concave lens: f negative. Concave mirror: f negative. Convex mirror: f positive.
- Object distance u is NEGATIVE for real objects (left of lens/in front of mirror).
- For lens/mirror: provide 3 rays (parallel, through_focus, through_center) in the rays array.
- For refraction: use "incident" type ray. object_distance in states is the angle in degrees.
- For TIR: visible_rays use "below_critical", "at_critical", "above_critical" for states 1-3, "slider" for STATE_4.
- For prism: visible_rays use "white_light"/"incident" for state 1-2, "spectrum"/"dispersed" for state 3-4.
- STATE_4 should be interactive: set object_distance to enable slider.
- Focal length in pixels: 80-120 typical.

OUTPUT: raw JSON only — no markdown, no code fences, no commentary.`;

    const userMsg = `Concept: ${conceptId}
Scenario: ${scenario}
Student question: ${ctx.question ?? brief.concept}
Brief summary: ${brief.concept} — ${brief.key_insight_to_show ?? ""}

Generate the OpticsRayConfig JSON for scenario_type="${scenario}".
Ray colors: ray=#FFF176, virtual_ray=#CE93D8, element=#90CAF9.`;

    let raw = "";
    try {
        const resp = await anthropic.messages.create({
            model: "claude-sonnet-4-6",
            max_tokens: 2000,
            system: systemPrompt,
            messages: [{ role: "user", content: userMsg }],
        });
        raw = (resp.content[0] as { type: string; text: string }).text ?? "";
        await logUsage({
            taskType: "optics_ray_config",
            provider: "anthropic",
            model: "claude-sonnet-4-6",
            inputChars: (systemPrompt + userMsg).length,
            outputChars: raw.length,
            latencyMs: 0,
            estimatedCostUsd: 0,
            wasCacheHit: false,
        });
    } catch (err) {
        console.error("[optics_ray] Sonnet call failed:", err);
        return getOpticsRayFallback(scenario);
    }

    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
        console.warn("[optics_ray] No JSON in response, using fallback");
        return getOpticsRayFallback(scenario);
    }

    try {
        const config = JSON.parse(jsonMatch[0]) as OpticsRayConfig;
        config.scenario_type = config.scenario_type ?? scenario;
        config.sign_convention = "new_cartesian";
        config.pvl_colors = config.pvl_colors ?? {
            background: "#0A0A1A", ray: "#FFF176", element: "#90CAF9",
            image: "#66BB6A", virtual_ray: "#CE93D8", text: "#D4D4D8",
        };
        console.log("[optics_ray] Config generated successfully for:", conceptId);
        return config;
    } catch (parseErr) {
        console.warn("[optics_ray] JSON parse failed, using fallback:", parseErr);
        return getOpticsRayFallback(scenario);
    }
}

function getOpticsRayFallback(scenario: OpticsRayConfig["scenario_type"]): OpticsRayConfig {
    const defaultRays = [
        { id: "ray_parallel", type: "parallel" as const, color: "#FFF176" },
        { id: "ray_focus", type: "through_focus" as const, color: "#FF8A65" },
        { id: "ray_center", type: "through_center" as const, color: "#81C784" },
    ];

    const basePvl = {
        background: "#0A0A1A" as const, ray: "#FFF176", element: "#90CAF9",
        image: "#66BB6A", virtual_ray: "#CE93D8", text: "#D4D4D8" as const,
    };

    if (scenario === "convex_lens" || scenario === "concave_lens") {
        const isConvex = scenario === "convex_lens";
        return {
            scenario_type: scenario,
            optical_element: {
                type: "lens",
                focal_length: isConvex ? 100 : -100,
                position_x: 400,
                position_y: 250,
            },
            object: { position_x: -200, height: 60, label: "Object" },
            rays: defaultRays,
            sign_convention: "new_cartesian",
            show_principal_axis: true,
            show_focal_points: true,
            show_measurements: true,
            states: {
                STATE_1: { label: isConvex ? "Object beyond 2F" : "Object far from lens", visible_rays: ["ray_parallel"], show_image: false, show_object: true, caption: "Observe the first ray: parallel to axis" },
                STATE_2: { label: "Two rays shown", visible_rays: ["ray_parallel", "ray_focus"], show_image: false, show_object: true, caption: "Adding the second ray through the focus" },
                STATE_3: { label: "All rays — image formed", visible_rays: ["ray_parallel", "ray_focus", "ray_center"], show_image: true, show_object: true, caption: isConvex ? "Where all three rays meet is where the image forms" : "Backward extensions of diverging rays meet to form virtual image" },
                STATE_4: { label: "Interactive — move object", visible_rays: ["ray_parallel", "ray_focus", "ray_center"], show_image: true, show_object: true, caption: "Drag slider to move the object", object_distance: -200 },
            },
            pvl_colors: basePvl,
        };
    }

    if (scenario === "concave_mirror" || scenario === "convex_mirror") {
        const isConcave = scenario === "concave_mirror";
        return {
            scenario_type: scenario,
            optical_element: {
                type: "mirror",
                focal_length: isConcave ? -100 : 100,
                position_x: 560,
                position_y: 250,
            },
            object: { position_x: -250, height: 60, label: "Object" },
            rays: defaultRays,
            sign_convention: "new_cartesian",
            show_principal_axis: true,
            show_focal_points: true,
            show_measurements: true,
            states: {
                STATE_1: { label: isConcave ? "Object beyond C" : "Object in front", visible_rays: ["ray_parallel"], show_image: false, show_object: true, caption: "Parallel ray reflects through F" },
                STATE_2: { label: "Two rays shown", visible_rays: ["ray_parallel", "ray_focus"], show_image: false, show_object: true, caption: "Adding the second ray" },
                STATE_3: { label: "All rays — image formed", visible_rays: ["ray_parallel", "ray_focus", "ray_center"], show_image: true, show_object: true, caption: isConcave ? "Reflected rays converge to form a real image" : "Virtual image behind mirror — always erect, diminished" },
                STATE_4: { label: "Interactive — move object", visible_rays: ["ray_parallel", "ray_focus", "ray_center"], show_image: true, show_object: true, caption: "Drag slider to change object position", object_distance: -250 },
            },
            pvl_colors: basePvl,
        };
    }

    if (scenario === "refraction_flat") {
        return {
            scenario_type: "refraction_flat",
            optical_element: {
                type: "flat_surface",
                refractive_index_1: 1.0,
                refractive_index_2: 1.5,
                position_x: 400,
                position_y: 250,
            },
            object: { position_x: 0, height: 0, label: "" },
            rays: [{ id: "incident", type: "incident" as const, color: "#FFF176" }],
            sign_convention: "new_cartesian",
            show_principal_axis: false,
            show_focal_points: false,
            show_measurements: false,
            states: {
                STATE_1: { label: "Incident ray", visible_rays: ["incident"], show_image: false, show_object: false, caption: "A ray approaches the interface between two media", object_distance: 30 },
                STATE_2: { label: "Refraction — bends toward normal", visible_rays: ["incident"], show_image: false, show_object: false, caption: "Entering denser medium: ray bends toward the normal", object_distance: 45 },
                STATE_3: { label: "Larger angle", visible_rays: ["incident"], show_image: false, show_object: false, caption: "n\u2081 sin\u03B8\u2081 = n\u2082 sin\u03B8\u2082 — verified!", object_distance: 60 },
                STATE_4: { label: "Interactive — change angle", visible_rays: ["incident"], show_image: false, show_object: false, caption: "Drag to change angle of incidence", object_distance: 30 },
            },
            pvl_colors: basePvl,
        };
    }

    if (scenario === "total_internal_reflection") {
        return {
            scenario_type: "total_internal_reflection",
            optical_element: {
                type: "flat_surface",
                refractive_index_1: 1.5,
                refractive_index_2: 1.0,
                position_x: 400,
                position_y: 250,
            },
            object: { position_x: 0, height: 0, label: "" },
            rays: [{ id: "incident", type: "incident" as const, color: "#FFF176" }],
            sign_convention: "new_cartesian",
            show_principal_axis: false,
            show_focal_points: false,
            show_measurements: false,
            states: {
                STATE_1: { label: "Below critical angle", visible_rays: ["below_critical"], show_image: false, show_object: false, caption: "Angle below critical angle — normal refraction occurs" },
                STATE_2: { label: "At critical angle", visible_rays: ["at_critical"], show_image: false, show_object: false, caption: "At critical angle — refracted ray along the surface" },
                STATE_3: { label: "Above critical angle — TIR", visible_rays: ["above_critical"], show_image: false, show_object: false, caption: "Total internal reflection — no refracted ray!" },
                STATE_4: { label: "Interactive — change angle", visible_rays: ["slider"], show_image: false, show_object: false, caption: "Find the critical angle yourself", object_distance: 30 },
            },
            pvl_colors: basePvl,
        };
    }

    // prism_dispersion (default)
    return {
        scenario_type: "prism_dispersion",
        optical_element: {
            type: "prism",
            prism_angle: 60,
            position_x: 400,
            position_y: 250,
        },
        object: { position_x: 0, height: 0, label: "" },
        rays: [{ id: "white", type: "incident" as const, color: "#FFFFFF" }],
        sign_convention: "new_cartesian",
        show_principal_axis: false,
        show_focal_points: false,
        show_measurements: false,
        states: {
            STATE_1: { label: "White light approaches", visible_rays: ["white_light"], show_image: false, show_object: false, caption: "White light beam directed at the prism" },
            STATE_2: { label: "Enters the prism", visible_rays: ["white_light", "incident"], show_image: false, show_object: false, caption: "Light enters and begins to separate inside" },
            STATE_3: { label: "VIBGYOR spectrum", visible_rays: ["white_light", "spectrum"], show_image: false, show_object: false, caption: "Violet deviates most, Red least — VIBGYOR!" },
            STATE_4: { label: "Full dispersion", visible_rays: ["white_light", "dispersed"], show_image: false, show_object: false, caption: "\u03B4 = (n-1)A — each colour has a different n" },
        },
        pvl_colors: basePvl,
    };
}

// ── FIELD_3D_SCENARIO_MAP — concept_id → scenario_type ───────────────────────
const FIELD_3D_SCENARIO_MAP: Record<string, Field3DConfig["scenario_type"]> = {
    electric_field_lines:           "point_charge_positive",
    electric_potential_3d:          "dipole",
    parallel_plate_capacitor_field: "parallel_plates",
    magnetic_field_solenoid:        "solenoid_field",
    magnetic_field_wire:            "straight_wire_current",
    gauss_law_3d:                   "point_charge_positive",
    electromagnetic_induction_3d:   "changing_flux",
    bar_magnet_field:               "bar_magnet",
};

async function generateField3DConfig(
    brief: SimulationBrief,
    conceptId: string,
    ctx: StudentContext,
): Promise<Field3DConfig> {
    const scenario = FIELD_3D_SCENARIO_MAP[conceptId] ?? "point_charge_positive";

    const systemPrompt = `You are a physics simulation config generator for PhysicsMind, an Indian Class 10-12 AI tutor.
Generate a valid Field3DConfig JSON object for a Three.js 3D field renderer.

SCHEMA (TypeScript):
interface Field3DConfig {
  scenario_type: "point_charge_positive"|"point_charge_negative"|"dipole"|"parallel_plates"|"solenoid_field"|"bar_magnet"|"straight_wire_current"|"changing_flux";
  charges?: Array<{
    id: string; sign: number; magnitude: number;
    position: [number, number, number]; label: string; color: string;
  }>;
  field_lines: {
    count: number; color_positive: string; color_negative: string;
    opacity: number; arrow_spacing: number;
  };
  equipotential?: { show: boolean; surfaces: number; opacity: number; color: string; };
  current?: { direction: [number, number, number]; magnitude: number; wire_color: string; };
  coil?: { turns: number; radius: number; axis: [number, number, number]; };
  states: {
    STATE_1: { label: string; visible_elements: string[]; camera_position?: [number, number, number]; highlight?: string; caption: string; animate?: boolean; };
    STATE_2: { label: string; visible_elements: string[]; camera_position?: [number, number, number]; highlight?: string; caption: string; animate?: boolean; };
    STATE_3: { label: string; visible_elements: string[]; camera_position?: [number, number, number]; highlight?: string; caption: string; animate?: boolean; };
    STATE_4: { label: string; visible_elements: string[]; camera_position?: [number, number, number]; highlight?: string; caption: string; animate?: boolean; };
  };
  pvl_colors?: { background: string; text: string; positive: string; negative: string; field_line: string; };
}

PHYSICS RULES (non-negotiable):
- For point charges: field lines radiate outward from +q, inward toward -q
- For dipole: field lines curve from + to - charge
- For parallel plates: field is UNIFORM between plates (E = V/d), zero outside
- For solenoid: field is uniform inside (B = μ₀nI), bar-magnet pattern outside
- For bar magnet: lines emerge from N, enter S outside; S to N inside (closed loops)
- For straight wire: concentric circles, B = μ₀I/(2πr), right-hand rule
- For changing flux: Faraday's law, EMF only when flux changes
- visible_elements uses element type strings: "charge", "field_line", "arrow", "equipotential", "plate_positive", "plate_negative", "coil", "wire", "magnet", "emf_indicator", "all"
- STATE_4 should always include "all" in visible_elements for full exploration
- camera_position is [x, y, z] for the camera target (radius ~8 default)

OUTPUT: raw JSON only — no markdown, no code fences, no commentary.`;

    const userMsg = `Concept: ${conceptId}
Scenario: ${scenario}
Student question: ${ctx.question ?? brief.concept}
Brief summary: ${brief.concept} — ${brief.key_insight_to_show ?? ""}

Generate the Field3DConfig JSON for scenario_type="${scenario}".
Colors: positive=#EF5350, negative=#42A5F5, field_line=#FFF176, background=#0A0A1A.`;

    let raw = "";
    try {
        const resp = await anthropic.messages.create({
            model: "claude-sonnet-4-6",
            max_tokens: 2000,
            system: systemPrompt,
            messages: [{ role: "user", content: userMsg }],
        });
        raw = (resp.content[0] as { type: string; text: string }).text ?? "";
        await logUsage({
            taskType: "field_3d_config",
            provider: "anthropic",
            model: "claude-sonnet-4-6",
            inputChars: (systemPrompt + userMsg).length,
            outputChars: raw.length,
            latencyMs: 0,
            estimatedCostUsd: 0,
            wasCacheHit: false,
        });
    } catch (err) {
        console.error("[field_3d] Sonnet call failed:", err);
        return getField3DFallback(scenario);
    }

    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
        console.warn("[field_3d] No JSON in response, using fallback");
        return getField3DFallback(scenario);
    }

    try {
        const config = JSON.parse(jsonMatch[0]) as Field3DConfig;
        config.scenario_type = config.scenario_type ?? scenario;
        config.pvl_colors = config.pvl_colors ?? {
            background: "#0A0A1A", text: "#D4D4D8", positive: "#EF5350",
            negative: "#42A5F5", field_line: "#FFF176",
        };
        console.log("[field_3d] Config generated successfully for:", conceptId);
        return config;
    } catch (parseErr) {
        console.warn("[field_3d] JSON parse failed, using fallback:", parseErr);
        return getField3DFallback(scenario);
    }
}

function getField3DFallback(scenario: Field3DConfig["scenario_type"]): Field3DConfig {
    const basePvl = {
        background: "#0A0A1A", text: "#D4D4D8", positive: "#EF5350",
        negative: "#42A5F5", field_line: "#FFF176",
    };
    const baseFieldLines = {
        count: 12, color_positive: "#EF5350", color_negative: "#42A5F5",
        opacity: 0.8, arrow_spacing: 5,
    };
    const baseStates = {
        STATE_1: { label: "Setup", visible_elements: ["charge", "plate_positive", "plate_negative", "coil", "wire", "magnet"], caption: "Observe the initial setup", camera_position: [5, 4, 5] as [number, number, number] },
        STATE_2: { label: "Field lines appear", visible_elements: ["all"] as string[], caption: "Field lines show the direction of the field", camera_position: [6, 3, 6] as [number, number, number] },
        STATE_3: { label: "Key insight", visible_elements: ["all"] as string[], caption: "Observe the key physics insight", camera_position: [4, 5, 4] as [number, number, number] },
        STATE_4: { label: "Explore", visible_elements: ["all"] as string[], caption: "Rotate to explore the full 3D pattern", camera_position: [5, 4, 5] as [number, number, number] },
    };

    if (scenario === "point_charge_positive" || scenario === "point_charge_negative") {
        return {
            scenario_type: scenario,
            charges: [{
                id: "q1", sign: scenario === "point_charge_positive" ? 1 : -1,
                magnitude: 1, position: [0, 0, 0],
                label: scenario === "point_charge_positive" ? "+q" : "-q",
                color: scenario === "point_charge_positive" ? "#EF5350" : "#42A5F5",
            }],
            field_lines: baseFieldLines,
            equipotential: { show: true, surfaces: 3, opacity: 0.12, color: "#4FC3F7" },
            states: baseStates,
            pvl_colors: basePvl,
        };
    }

    if (scenario === "dipole") {
        return {
            scenario_type: "dipole",
            charges: [
                { id: "q_pos", sign: 1, magnitude: 1, position: [-1.5, 0, 0], label: "+q", color: "#EF5350" },
                { id: "q_neg", sign: -1, magnitude: 1, position: [1.5, 0, 0], label: "-q", color: "#42A5F5" },
            ],
            field_lines: { ...baseFieldLines, count: 10 },
            equipotential: { show: true, surfaces: 3, opacity: 0.1, color: "#4FC3F7" },
            states: baseStates,
            pvl_colors: basePvl,
        };
    }

    if (scenario === "parallel_plates") {
        return {
            scenario_type: "parallel_plates",
            field_lines: { ...baseFieldLines, count: 16, color_positive: "#FFF176", color_negative: "#FFF176" },
            states: baseStates,
            pvl_colors: basePvl,
        };
    }

    if (scenario === "solenoid_field") {
        return {
            scenario_type: "solenoid_field",
            coil: { turns: 8, radius: 0.8, axis: [0, 0, 1] },
            field_lines: { ...baseFieldLines, count: 8, color_positive: "#66BB6A", color_negative: "#66BB6A" },
            states: baseStates,
            pvl_colors: basePvl,
        };
    }

    if (scenario === "bar_magnet") {
        return {
            scenario_type: "bar_magnet",
            field_lines: { ...baseFieldLines, count: 10, color_positive: "#66BB6A", color_negative: "#66BB6A" },
            states: baseStates,
            pvl_colors: basePvl,
        };
    }

    if (scenario === "straight_wire_current") {
        return {
            scenario_type: "straight_wire_current",
            current: { direction: [0, 1, 0], magnitude: 5, wire_color: "#FFAB40" },
            field_lines: { ...baseFieldLines, count: 6, color_positive: "#66BB6A", color_negative: "#66BB6A" },
            states: baseStates,
            pvl_colors: basePvl,
        };
    }

    if (scenario === "changing_flux") {
        return {
            scenario_type: "changing_flux",
            coil: { turns: 5, radius: 1.0, axis: [0, 0, 1] },
            field_lines: { ...baseFieldLines, count: 6, color_positive: "#66BB6A", color_negative: "#66BB6A" },
            states: {
                ...baseStates,
                STATE_2: { ...baseStates.STATE_2, animate: true, caption: "Magnet moves — flux changes — EMF induced" },
                STATE_4: { ...baseStates.STATE_4, animate: true, caption: "Magnet oscillates — watch the EMF glow" },
            },
            pvl_colors: basePvl,
        };
    }

    // Generic fallback
    return {
        scenario_type: scenario,
        charges: [{ id: "q1", sign: 1, magnitude: 1, position: [0, 0, 0], label: "+q", color: "#EF5350" }],
        field_lines: baseFieldLines,
        states: baseStates,
        pvl_colors: basePvl,
    };
}

// ── THERMO_SCENARIO_MAP — concept_id → scenario_type ─────────────────────────
const THERMO_SCENARIO_MAP: Record<string, ThermodynamicsConfig["scenario_type"]> = {
    first_law_thermodynamics:   "piston_cylinder",
    isothermal_process:         "piston_cylinder",
    adiabatic_process:          "piston_cylinder",
    carnot_engine:              "carnot_engine",
    ideal_gas_kinetic_theory:   "gas_container",
};

async function generateThermodynamicsConfig(
    brief: SimulationBrief,
    conceptId: string,
    ctx: StudentContext,
): Promise<ThermodynamicsConfig> {
    const scenario = THERMO_SCENARIO_MAP[conceptId] ?? "piston_cylinder";

    const systemPrompt = `You are a physics simulation config generator for PhysicsMind, an Indian Class 10-12 AI tutor.
Generate a valid ThermodynamicsConfig JSON object for a p5.js + Plotly thermodynamics renderer.

SCHEMA (TypeScript):
interface ThermodynamicsConfig {
  scenario_type: "piston_cylinder"|"carnot_engine"|"gas_container";
  gas: { type: "ideal"|"real"; particle_count: number; particle_color: string; initial_temperature: number; initial_pressure: number; initial_volume: number; gamma: number; };
  container: { type: "cylinder_piston"|"rigid_box"|"engine_diagram"; wall_color: string; piston_color?: string; show_heat_arrows: boolean; show_work_arrows: boolean; };
  pv_diagram: { show: boolean; x_label: string; y_label: string; x_range: [number, number]; y_range: [number, number]; process_color: string; show_work_area: boolean; };
  energy_bars: { show: boolean; bar_labels: string[]; bar_colors: string[]; };
  states: {
    STATE_1: { label: string; temperature: number; pressure: number; volume: number; Q: number; W: number; deltaU: number; caption: string; pv_points?: Array<[number, number]>; show_work_area?: boolean; slider_active?: boolean; };
    STATE_2: { ... same ... };
    STATE_3: { ... same ... };
    STATE_4: { ... same ... };
  };
  pvl_colors?: { background: string; text: string; hot: string; cold: string; work: string; };
}

PHYSICS RULES (non-negotiable):
- First law: Q = ΔU + W always holds. ΔU = Q - W in every state.
- For ideal gas: ΔU depends only on T; ΔU = nCvΔT
- Isothermal: ΔT=0, ΔU=0, Q=W
- Adiabatic: Q=0, ΔU=-W
- Carnot: η = 1 - T_C/T_H; W = Q_H - Q_C
- PV diagram: pv_points trace the process path. For isothermal: use hyperbolic points. For adiabatic: steeper curve.
- For carnot_engine: temperature = T_H, and deltaU field stores T_C value
- Energy bars: Q (red), ΔU (orange), W (green)
- STATE_4 should have slider_active: true for exploration

OUTPUT: raw JSON only — no markdown, no code fences, no commentary.`;

    const userMsg = `Concept: ${conceptId}
Scenario: ${scenario}
Student question: ${ctx.question ?? brief.concept}
Brief summary: ${brief.concept} — ${brief.key_insight_to_show ?? ""}

Generate the ThermodynamicsConfig JSON for scenario_type="${scenario}".
Use physically accurate values. Colors: hot=#EF5350, cold=#42A5F5, work=#66BB6A, particles=#FF6B35, background=#0a0a1a.`;

    try {
        const response = await anthropic.messages.create({
            model: "claude-sonnet-4-6",
            max_tokens: 2500,
            system: systemPrompt,
            messages: [{ role: "user", content: userMsg }],
        });
        const raw = response.content[0].type === "text" ? response.content[0].text : "";
        console.log("[thermodynamics] Sonnet response length:", raw.length);

        await logUsage({
            taskType: "thermodynamics_config",
            provider: "anthropic",
            model: "claude-sonnet-4-6",
            inputChars: (systemPrompt + userMsg).length,
            outputChars: raw.length,
            latencyMs: 0,
            estimatedCostUsd: 0,
            wasCacheHit: false,
        });

        const jsonMatch = raw.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            console.warn("[thermodynamics] No JSON in response, using fallback");
            return getThermoFallback(scenario, conceptId);
        }

        const config = JSON.parse(jsonMatch[0]) as ThermodynamicsConfig;
        config.scenario_type = config.scenario_type ?? scenario;
        config.pvl_colors = config.pvl_colors ?? {
            background: "#0a0a1a", text: "#ffffff", hot: "#EF5350",
            cold: "#42A5F5", work: "#66BB6A",
        };
        console.log("[thermodynamics] Config generated successfully for:", conceptId);
        return config;
    } catch (err) {
        console.error("[thermodynamics] Sonnet call failed:", err);
        return getThermoFallback(scenario, conceptId);
    }
}

function getThermoFallback(scenario: ThermodynamicsConfig["scenario_type"], conceptId: string): ThermodynamicsConfig {
    const basePvl = {
        background: "#0a0a1a", text: "#ffffff", hot: "#EF5350",
        cold: "#42A5F5", work: "#66BB6A",
    };
    const baseGas = {
        type: "ideal" as const, particle_count: 30, particle_color: "#FF6B35",
        initial_temperature: 300, initial_pressure: 100, initial_volume: 5, gamma: 1.4,
    };
    const baseEnergyBars = {
        show: true,
        bar_labels: ["Q", "\u0394U", "W"],
        bar_colors: ["#EF5350", "#FF9800", "#66BB6A"],
    };

    if (scenario === "carnot_engine") {
        return {
            scenario_type: "carnot_engine",
            gas: { ...baseGas, initial_temperature: 600 },
            container: { type: "engine_diagram", wall_color: "#4a4a5a", show_heat_arrows: true, show_work_arrows: true },
            pv_diagram: { show: true, x_label: "Volume (L)", y_label: "Pressure (kPa)", x_range: [0, 15], y_range: [0, 300], process_color: "#FF9800", show_work_area: true },
            energy_bars: { show: false, bar_labels: [], bar_colors: [] },
            states: {
                STATE_1: { label: "Hot and cold reservoirs", temperature: 600, pressure: 200, volume: 3, Q: 0, W: 0, deltaU: 300, caption: "T_H = 600K, T_C = 300K — the setup" },
                STATE_2: { label: "Heat absorbed, work done", temperature: 600, pressure: 200, volume: 3, Q: 1000, W: 500, deltaU: 300, caption: "Q_H = 1000J absorbed, W = 500J work output" },
                STATE_3: { label: "Efficiency = 50%", temperature: 600, pressure: 200, volume: 3, Q: 1000, W: 500, deltaU: 300, caption: "\u03b7 = 1 - T_C/T_H = 1 - 300/600 = 50%" },
                STATE_4: { label: "Explore Carnot cycle", temperature: 600, pressure: 200, volume: 3, Q: 1000, W: 500, deltaU: 300, caption: "No real engine can exceed this efficiency", slider_active: true },
            },
            pvl_colors: basePvl,
        };
    }

    if (scenario === "gas_container") {
        return {
            scenario_type: "gas_container",
            gas: baseGas,
            container: { type: "rigid_box", wall_color: "#4a4a5a", show_heat_arrows: false, show_work_arrows: false },
            pv_diagram: { show: true, x_label: "Volume (L)", y_label: "Pressure (kPa)", x_range: [0, 15], y_range: [0, 300], process_color: "#FF9800", show_work_area: false },
            energy_bars: { show: false, bar_labels: [], bar_colors: [] },
            states: {
                STATE_1: { label: "Gas at 300K", temperature: 300, pressure: 100, volume: 10, Q: 0, W: 0, deltaU: 0, caption: "Ideal gas at room temperature" },
                STATE_2: { label: "Heated to 450K", temperature: 450, pressure: 150, volume: 10, Q: 0, W: 0, deltaU: 0, caption: "Particles faster, pressure rises (V constant)" },
                STATE_3: { label: "Doubled to 600K", temperature: 600, pressure: 200, volume: 10, Q: 0, W: 0, deltaU: 0, caption: "KE_avg doubled, v_rms \u00d7 \u221a2, P doubled" },
                STATE_4: { label: "Explore", temperature: 600, pressure: 200, volume: 10, Q: 0, W: 0, deltaU: 0, caption: "PV = nRT in action — molecules and gas laws", slider_active: true },
            },
            pvl_colors: basePvl,
        };
    }

    // Default: piston_cylinder (first_law, isothermal, adiabatic)
    const isAdiabatic = conceptId.includes("adiabatic");
    const isIsothermal = conceptId.includes("isothermal");

    if (isIsothermal) {
        return {
            scenario_type: "piston_cylinder",
            gas: { ...baseGas, initial_pressure: 200, initial_volume: 3 },
            container: { type: "cylinder_piston", wall_color: "#4a4a5a", piston_color: "#8888aa", show_heat_arrows: true, show_work_arrows: true },
            pv_diagram: { show: true, x_label: "Volume (L)", y_label: "Pressure (kPa)", x_range: [0, 12], y_range: [0, 250], process_color: "#FF9800", show_work_area: true },
            energy_bars: baseEnergyBars,
            states: {
                STATE_1: { label: "Compressed gas", temperature: 300, pressure: 200, volume: 3, Q: 0, W: 0, deltaU: 0, caption: "Gas compressed at 300K", pv_points: [[3, 200]] },
                STATE_2: { label: "Expanding isothermally", temperature: 300, pressure: 100, volume: 6, Q: 300, W: 300, deltaU: 0, caption: "Heat in, gas expands, T stays at 300K", pv_points: [[3, 200], [4, 150], [5, 120], [6, 100]] },
                STATE_3: { label: "Q = W, \u0394U = 0", temperature: 300, pressure: 67, volume: 9, Q: 500, W: 500, deltaU: 0, caption: "All heat became work. \u0394U = 0 (constant T)", pv_points: [[3, 200], [4, 150], [5, 120], [6, 100], [7, 86], [8, 75], [9, 67]], show_work_area: true },
                STATE_4: { label: "Explore", temperature: 300, pressure: 67, volume: 9, Q: 500, W: 500, deltaU: 0, caption: "PV = constant \u2192 hyperbola. W = nRT ln(V\u2082/V\u2081)", slider_active: true, pv_points: [[3, 200], [4, 150], [5, 120], [6, 100], [7, 86], [8, 75], [9, 67]], show_work_area: true },
            },
            pvl_colors: basePvl,
        };
    }

    if (isAdiabatic) {
        return {
            scenario_type: "piston_cylinder",
            gas: { ...baseGas, initial_temperature: 400, initial_pressure: 200, initial_volume: 3 },
            container: { type: "cylinder_piston", wall_color: "#4a4a5a", piston_color: "#8888aa", show_heat_arrows: false, show_work_arrows: true },
            pv_diagram: { show: true, x_label: "Volume (L)", y_label: "Pressure (kPa)", x_range: [0, 12], y_range: [0, 250], process_color: "#42A5F5", show_work_area: true },
            energy_bars: baseEnergyBars,
            states: {
                STATE_1: { label: "Hot compressed gas (insulated)", temperature: 400, pressure: 200, volume: 3, Q: 0, W: 0, deltaU: 0, caption: "Insulated cylinder: Q = 0 always", pv_points: [[3, 200]] },
                STATE_2: { label: "Expanding adiabatically", temperature: 340, pressure: 120, volume: 5, Q: 0, W: 200, deltaU: -200, caption: "Gas cools as it expands! W comes from internal energy", pv_points: [[3, 200], [4, 150], [5, 120]] },
                STATE_3: { label: "T drops, steeper than isothermal", temperature: 280, pressure: 60, volume: 8, Q: 0, W: 350, deltaU: -350, caption: "Adiabatic curve STEEPER than isothermal. Gas cooled to 280K", pv_points: [[3, 200], [4, 150], [5, 120], [6, 90], [7, 72], [8, 60]], show_work_area: true },
                STATE_4: { label: "Explore", temperature: 280, pressure: 60, volume: 8, Q: 0, W: 350, deltaU: -350, caption: "PV\u1d5e = const. \u0394U = -W (no heat exchange)", slider_active: true, pv_points: [[3, 200], [4, 150], [5, 120], [6, 90], [7, 72], [8, 60]], show_work_area: true },
            },
            pvl_colors: basePvl,
        };
    }

    // first_law_thermodynamics (default piston_cylinder)
    return {
        scenario_type: "piston_cylinder",
        gas: baseGas,
        container: { type: "cylinder_piston", wall_color: "#4a4a5a", piston_color: "#8888aa", show_heat_arrows: true, show_work_arrows: true },
        pv_diagram: { show: true, x_label: "Volume (L)", y_label: "Pressure (kPa)", x_range: [0, 12], y_range: [0, 200], process_color: "#FF9800", show_work_area: true },
        energy_bars: baseEnergyBars,
        states: {
            STATE_1: { label: "Initial state", temperature: 300, pressure: 100, volume: 5, Q: 0, W: 0, deltaU: 0, caption: "Gas at 300K in a cylinder — no heat added yet", pv_points: [[5, 100]] },
            STATE_2: { label: "Heat added (isobaric)", temperature: 450, pressure: 100, volume: 7.5, Q: 500, W: 250, deltaU: 250, caption: "Q = 500J added. Gas expands at constant P.", pv_points: [[5, 100], [6, 100], [7, 100], [7.5, 100]], show_work_area: true },
            STATE_3: { label: "Q = \u0394U + W", temperature: 450, pressure: 100, volume: 7.5, Q: 500, W: 250, deltaU: 250, caption: "Q(500) = \u0394U(250) + W(250). Not all heat raised temperature!", pv_points: [[5, 100], [6, 100], [7, 100], [7.5, 100]], show_work_area: true },
            STATE_4: { label: "Explore", temperature: 450, pressure: 100, volume: 7.5, Q: 500, W: 250, deltaU: 250, caption: "First law: energy conservation for heat engines", slider_active: true, pv_points: [[5, 100], [6, 100], [7, 100], [7.5, 100]], show_work_area: true },
        },
        pvl_colors: basePvl,
    };
}

async function generateConceptPrimaryHtml(
    brief: SimulationBrief,
    conceptId: string,
    graphStates: Record<string, Record<string, unknown>>,
    simulation_emphasis?: string,
    epicState1?: EpicState1,
): Promise<{ html: string; stateLabels: string[] } | null> {
    const stateDescriptions = Object.entries(graphStates)
        .map(([id, s]) => `${id}: ${String(s.label ?? id)}`)
        .join("\n");

    const conceptGuidance = getConceptSimGuidance(conceptId);

    const prompt = `You are an expert p5.js physics simulation programmer for Indian students (Class 10-12).
Generate a complete, self-contained HTML file with an animated, interactive p5.js simulation.

CONCEPT: ${brief.concept}
KEY INSIGHT: ${brief.key_insight_to_show}
AHA MOMENT: ${brief.aha_moment?.what_to_show ?? "N/A"}
EQUATIONS: ${(brief.physics_equations ?? []).join(", ")}
INTERACTIVE VARIABLES: ${JSON.stringify(brief.interactive_variables, null, 2)}
ANIMATION: ${brief.animation_emphasis}

${conceptGuidance ? `CONCEPT-SPECIFIC REQUIREMENTS (MUST FOLLOW):\n${conceptGuidance}\n` : ""}

${simulation_emphasis ? `STUDENT'S SPECIFIC CONFUSION (PRIMARY FOCUS):\n${simulation_emphasis}\nYour simulation MUST visually demonstrate and address this specific confusion above all other concept requirements.\n` : ""}

${epicState1 ? `EPIC STATE_1 CONTRACT (built by code — do NOT modify):\n${JSON.stringify(epicState1, null, 2)}\n` : ""}

IMPLEMENTATION CHECKLIST — verify each before submitting code:
[ ] draw() reads PM_currentState (the global Sync API variable) to decide what to render
[ ] No separate currentState variable created — PM_currentState is the ONLY state variable
[ ] No "Next" button created — state transitions are handled externally via postMessage
[ ] STATE_1 implements the EPIC STATE_1 CONTRACT exactly (see below)
[ ] STATE_2 visuals are DIFFERENT from STATE_1 (ammeters flicker, electrons drift uniformly)
[ ] STATE_3 shows all ammeters at identical values in bright green, one electron tracked
[ ] STATE_4 shows sliders and all ammeters update together

COMPANION GRAPH PANEL STATES (your simulation MUST have matching states that sync):
${stateDescriptions}

CRITICAL RULES FOR p5.js CODE — VIOLATIONS CAUSE RUNTIME CRASHES:
1. ALL variables must be declared at sketch top level (outside setup and draw). Never use let/const inside setup() for variables that draw() will read.
2. ALL arrays must be initialized as empty arrays at top level: let electrons = [];
3. NEVER call p.select(), p.createDiv(), p.createSlider() inside draw(). Only in setup().
4. State switching uses the global PM_currentState variable (set by the Sync API). Do NOT create your own currentState variable.
5. In draw(), use if/else on PM_currentState to change what is rendered: if (PM_currentState === 'STATE_1') { ... } else if (PM_currentState === 'STATE_2') { ... }
6. Guard ALL property access on array elements: if (electrons[i]) { electrons[i].x += ... }
7. Initialize all particle/object arrays in setup(), never assume they exist before setup() runs.

===============================================================
EPIC STATE_1 IMPLEMENTATION — READ THE CONTRACT OBJECT ABOVE
===============================================================

IMPORTANT — STATE SWITCHING IS HANDLED BY THE SYNC API (defined below in this prompt).
The global variable PM_currentState is set externally via postMessage from the TeacherPlayer.
Do NOT create your own state variable. Do NOT create a "Next" button for state advancement.
Just read PM_currentState in draw() and render differently based on its value.
PM_currentState will be one of: 'STATE_1', 'STATE_2', 'STATE_3', 'STATE_4' (strings, not integers).

If epicState1.type === "WRONG_BELIEF_LIVE_CIRCUIT":

  MANDATORY: circuit_is_live is true. Electrons drift from frame 1.
  Do NOT show random thermal motion. Do NOT show zero-current state.

  THREE ELECTRON ARRAYS — declare at top level outside setup() and draw():
    let seg1Electrons: {x: number, y: number}[] = []  // full — 15 electrons
    let seg2Electrons: {x: number, y: number}[] = []  // reduced — 9 electrons
    let seg3Electrons: {x: number, y: number}[] = []  // sparse — 4 electrons

  Initialize all three in setup(). Each array loops within its own x boundaries only.

  AMMETER VALUES from contract:
    A1 displays epicState1.ammeter_values.before_r1 (4.0)
    A2 displays epicState1.ammeter_values.between_r1_r2 (2.5)
    A3 displays epicState1.ammeter_values.after_r2 (1.0)

  These are rendered in RED digits. textSize(14). Inside ammeter circles.

  OVERLAY: tint entire background with rgba(180, 0, 0, 0.15)

  CAPTION: draw epicState1.caption at top center of canvas.
    textSize(15). fill(255,255,255). textAlign(CENTER). y position: 25.

If epicState1.type === "WRONG_BELIEF_MECHANICS":

  STATE_1 must implement epicState1.state_1_render_spec EXACTLY (when present).
  Read vector_a, vector_b, resultant from the spec — do NOT change magnitudes,
  do NOT substitute different values, do NOT add cosθ math.

  Render in STATE_1:
  - Origin point at (cx - 100, cy + 20). Mark with small "O" label.
  - Vector A from origin in direction_deg = vector_a.direction_deg (0 = horizontal right),
    length = vector_a.magnitude * UNIT_TO_PX. Color vector_a.color, label vector_a.label.
  - Vector B from A's tip (head-to-tail), parallel to A (direction_deg = 0),
    length = vector_b.magnitude * UNIT_TO_PX. Color vector_b.color, label vector_b.label.
  - Resultant arrow from origin to B's tip, color resultant.color.
    Place resultant.label (e.g. "R = 7 ✓") in LARGE white text (textSize 24)
    centered ABOVE the resultant arrow at midpoint.
  - Background tint: fill the canvas with rgba(180,0,0,0.10) overlay AFTER drawing
    the vectors (so they remain visible through the tint).
  - Caption: epicState1.caption at top center, textSize 15, white, y position 25.

  FORBIDDEN in STATE_1 (listed in state_1_render_spec.forbidden_in_state_1):
  cos_overlay, sqrt_overlay, angle_arc, correct_R_label, formula_box,
  parallelogram_diagonal, wrong_marker_X, red_strikethrough.
  STATE_1 must visually ASSERT R = 7 as if it were the correct answer.
  Conflict and correction live in STATE_2+, never STATE_1.

  STATE_2 (conflict): rotate vector B to direction_deg = 60 (non-zero). The naive
  "R = 7" label remains visible but the actual parallelogram diagonal is now
  shorter than 7. Visual contradiction — no formula yet, just the geometry
  showing the diagonal shrinking.

  STATE_3 (proof): introduce the formula R = √(A² + B² + 2AB·cosθ) in a formula
  box. Compute R for the current θ value and display the numerical result.
  Use the contract magnitudes (A=4, B=3), not different values.

  STATE_4 (consolidation): interactive slider on θ from 0° to 180°. R label
  updates in real time. At θ=0° R=7 (the original belief), θ=90° R=5,
  θ=180° R=1. Student drags and feels the angle dependence.

If epicState1.type === "BASELINE_NO_CURRENT":
  Show electrons in random thermal motion. Ammeters at zero. No tint.

In STATE_2 and STATE_3: switch to a single unified electrons array
with uniform density across the full wire — this is the visual correction moment.

STATE_2: conflict state — ammeters start flickering, real measurements begin appearing, electrons begin moving uniformly
STATE_3: climax — all ammeters show identical correct values in bright green, one electron highlighted and tracked, caption changes to "What actually happens"
STATE_4: interactive sliders visible — all ammeters change together always showing equal values, student drags resistance slider and sees current change uniformly everywhere

DRAW FUNCTION PATTERN — use exactly this structure:
  p.draw = function() {
    p.background('#0A0A1A');
    if (PM_currentState === 'STATE_1') {
      // implement epicState1 contract exactly
    } else if (PM_currentState === 'STATE_2') {
      // conflict: ammeters flicker, electrons start drifting uniformly
    } else if (PM_currentState === 'STATE_3') {
      // climax: all ammeters identical green, tracked electron, correct caption
    } else if (PM_currentState === 'STATE_4') {
      // interactive: sliders control resistance, all ammeters update together
    }
  };

AMMETER IMPLEMENTATION:
- Draw 3 ammeter circles at positions: before R1, between R1 and R2, after R2
- STATE_1 values: from epicState1.ammeter_values (4.0, 2.5, 1.0) in RED
- STATE_3 values: display identical values (e.g. all 2.0A) in bright green
- Ammeter text rendered with textSize(14), bold, inside the circle
===============================================================

MANDATORY TECHNICAL REQUIREMENTS:
1. p5.js CDN: https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.0/p5.min.js
2. Canvas: 800 x 420, background: #0A0A1A
3. p5.js INSTANCE MODE ONLY: new p5(function(p) { p.setup = function() {...}; p.draw = function() {...}; })
4. Parent canvas to 'sketch-container': let cnv = p.createCanvas(800,420); cnv.parent('sketch-container');
5. p.background('#0A0A1A') as FIRST line in draw()
6. Dark theme, white/gray text (#D4D4D8), accent colors for physics elements
7. Continuous animation at 60fps
8. Output under 14000 bytes total
9. No external dependencies except p5.js CDN

LIBRARY CONSTRAINT — CRITICAL:
Only use core p5.js functions. Do NOT use any p5.js extension libraries.
Specifically NEVER call: p.collideRectCircle(), p.collidePointCircle(),
p.collidePointRect(), p.collideRectRect(), or any other p.collide*() function.
These are from the p5.collide2D library which is NOT loaded.

For electron-resistor collision detection, use distance-based math instead:
  // Circle vs Rectangle collision (inline, no library needed)
  const inResistor = (x > resistorX && x < resistorX + resistorW &&
                      y > resistorY && y < resistorY + resistorH);

CRITICAL — VARIABLE DECLARATION RULE (PREVENTS ReferenceError: x is not defined):
ALL variables used in draw() or any method MUST be declared at the sketch function scope (top-level inside new p5(function(p){...})).
WRONG (causes ReferenceError → p5 calls noLoop() → blank canvas):
  p.setup = function() { var y_top = 50; }   // y_top is only in setup scope
  p.draw = function() { p.line(0, y_top, ...); }  // ← ReferenceError: y_top is not defined
CORRECT — declare ALL shared variables at the top of the sketch function:
  var y_top = 50;   // declared at sketch scope, accessible in both setup() and draw()
  p.setup = function() { y_top = 50; }
  p.draw = function() { p.line(0, y_top, ...); }
Apply this rule to EVERY variable shared between setup() and draw(). Declare them at the sketch function scope, not inside setup().

CRITICAL — NULL-SAFETY RULE (PREVENTS INVISIBLE PARTICLES BUG):
ANY call that updates a DOM element MUST use a null guard. NEVER call methods on a potentially-null reference.
WRONG (breaks draw loop, makes particles invisible):
  p.select('#tempVal').html(val);          // throws if element not found → p5 calls noLoop()
  document.getElementById('x').innerHTML = v; // throws if null
CORRECT — always guard DOM updates:
  var el = document.getElementById('tempVal'); if (el) el.innerHTML = val;
This rule applies to EVERY DOM update inside draw(). One unguarded null access kills the entire animation.

CRITICAL — HTML STRUCTURE:
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  html,body { width:100%; height:100%; background:#0A0A1A; overflow:hidden; }
  canvas { display:block; }
  #sketch-container { position:relative; }
  #controls { display:none; padding:8px 16px; background:#0F0F1F; }
  .slider-row { display:flex; align-items:center; gap:10px; font-size:13px; color:#D4D4D8; margin:4px 0; }
  .slider-row label { min-width:130px; }
  .slider-row input[type=range] { flex:1; accent-color:#42A5F5; }
  .slider-row .val { min-width:44px; text-align:right; color:#FF9800; font-weight:bold; }
</style>
<div id="sketch-container"></div>
<div id="controls"><!-- sliders here, only visible in STATE_4 --></div>

CRITICAL — STATE MACHINE & SYNC API:
Include this EXACT code in a <script> BEFORE the p5 sketch:

var PM_currentState = 'STATE_1';
function applySimState(s) {
  PM_currentState = s;
  var ctrl = document.getElementById('controls');
  if (ctrl) ctrl.style.display = (s === 'STATE_6') ? 'flex' : 'none';
}
function _applyState(s) {
  applySimState(s);
  parent.postMessage({ type: 'STATE_REACHED', state: s }, '*');
}
window.addEventListener('message', function(e) {
  if (e.data && e.data.type === 'SET_STATE') _applyState(e.data.state);
});

ANIMATION RULE — CRITICAL: The simulation MUST be continuously animated in ALL 6 states.
NEVER freeze particles, stop motion, or call p.noLoop(). Particles, ions, waves — whatever you draw — MUST move every frame.
State changes only affect PARAMETERS (speed, amplitude, color, visibility) — never stop the animation loop.

IMPLEMENT ALL 6 STATES WITH VISIBLE DIFFERENCES:
- STATE_1: ANIMATED initial state — physics at low intensity (slow drift, small vibrations, cool colors)
- STATE_2: ANIMATED component A isolated — clear motion visible
- STATE_3: ANIMATED component B isolated
- STATE_4: ANIMATED combination/mechanism
- STATE_5: AHA MOMENT — ANIMATED, most visually dramatic, key insight revealed (highlight one particle, flash on collision)
- STATE_6: ANIMATED interactive — sliders visible, student adjusts parameters, animation responds live

The draw() function MUST read PM_currentState every frame to render differently per state.
STATE_3 MUST look dramatically different from STATE_1 (a student must see the difference at a glance).
In STATE_1 electrons must STILL be moving (thermally), just with different parameters than STATE_2.

At END of p.setup():
parent.postMessage({type:'SIM_READY',states:['STATE_1','STATE_2','STATE_3','STATE_4']},'*');

PHYSICS ACCURACY:
- All formulas must be NCERT-correct
- Variables must have physically meaningful ranges
- Animations must reflect actual physics (not random motion)
- Labels and units must be correct

CRITICAL — OHM'S LAW FORMULA (MOST COMMON SIMULATION CODING ERROR):
Current MUST be calculated as: I = voltage / resistance
NEVER write: I = voltage * resistance  ← WRONG, produces values 10-100x too high.
Slider value handling: if a resistance slider has range [1, 10], use its raw value directly.
  resistance = sliderVal        (NOT sliderVal/10, NOT sliderVal*10)
  current = voltage / resistance

Self-verify before outputting: with voltage=10V and resistance=5Ω:
  CORRECT: I = 10 / 5 = 2.0A  ← I_before and I_after labels must show this
  WRONG:   I = 10 * 5 = 50A   ← never acceptable
  WRONG:   I = 10 / 0.5 = 20A ← happens when resistance is accidentally divided by 10

Drift speed rule: driftSpeed DECREASES as resistance increases (more collisions = slower drift).
  CORRECT: driftSpeed = baseSpeed * (voltage / resistance)
  WRONG:   driftSpeed = baseSpeed * resistance  ← backwards, speed rises with R

Output ONLY the complete HTML. Start with <!DOCTYPE html>. No explanation.`;

    // ── Generation loop: up to 2 attempts ────────────────────────────────────
    // Attempt 1 uses the base prompt. If the formula validator catches a physics
    // error, attempt 2 appends the specific failure to force a correction.
    let formulaError: string | null = null;

    for (let attempt = 1; attempt <= 2; attempt++) {
        const activePrompt = attempt === 1
            ? prompt
            : prompt + `\n\nPREVIOUS ATTEMPT HAD A PHYSICS FORMULA ERROR — YOU MUST FIX THIS:\n${formulaError}\nRegenerate the entire simulation with the correct I = voltage / resistance formula.`;

        try {
            console.log(`[v5-conceptSim] Generating HTML (attempt ${attempt})...`);
            const { text } = await generateText({
                model: google("gemini-2.5-pro"),
                prompt: activePrompt,
                temperature: attempt === 1 ? 0.25 : 0.1, // lower temp on retry for stricter output
            });

            let html = text.trim();
            if (html.startsWith("```")) {
                html = html.replace(/^```(?:html)?\s*\n?/, "").replace(/\n?```\s*$/, "");
            }

            if (!html.includes("<!DOCTYPE") && !html.includes("<html")) {
                console.warn(`[v5-conceptSim] Attempt ${attempt}: output doesn't look like HTML`);
                continue;
            }

            // ── Physics formula validation ────────────────────────────────────
            formulaError = detectCurrentFormulaError(html);
            if (formulaError) {
                console.warn(`[v5-conceptSim] Attempt ${attempt}: formula error detected — ${formulaError}`);
                if (attempt < 2) continue; // retry with amplified prompt
                // On attempt 2 still failing: log and proceed anyway (better a wrong-value sim than none)
                console.error("[v5-conceptSim] Formula error persists after retry — proceeding with best attempt");
            } else if (attempt === 2) {
                console.log("[v5-conceptSim] Attempt 2: formula validation passed ✅");
            }

            // ── Post-processing injections ────────────────────────────────────

            // Inject sync API if Flash omitted it
            if (!html.includes('SIM_READY') || !html.includes('SET_STATE')) {
                console.warn("[v5-conceptSim] Sync API missing — injecting fallback");
                const syncScript = `<script>
var PM_currentState='STATE_1';
function applySimState(s){PM_currentState=s;var c=document.getElementById('controls');if(c)c.style.display=(s==='STATE_4')?'flex':'none';}
function _applyState(s){applySimState(s);parent.postMessage({type:'STATE_REACHED',state:s},'*');}
window.addEventListener('message',function(e){if(e.data&&e.data.type==='SET_STATE')_applyState(e.data.state);});
window.addEventListener('load',function(){setTimeout(function(){parent.postMessage({type:'SIM_READY',states:['STATE_1','STATE_2','STATE_3','STATE_4']},'*');},500);});
<\/script>`;
                if (html.includes('</body>')) {
                    html = html.replace('</body>', syncScript + '\n</body>');
                }
            }

            // Inject CSS override + sketch-container div if missing
            if (!html.includes('sketch-container')) {
                const cssOverride = `<style>*{margin:0;padding:0;box-sizing:border-box}html,body{width:100%;height:100%;background:#0A0A1A;overflow:hidden}canvas{display:block}#sketch-container{position:relative}</style>`;
                if (html.includes('</head>')) {
                    html = html.replace('</head>', cssOverride + '</head>');
                }
                // Also inject the div element so cnv.parent('sketch-container') doesn't fail
                if (html.includes('<body>')) {
                    html = html.replace('<body>', '<body>\n<div id="sketch-container"></div>');
                } else if (html.includes('<body ')) {
                    html = html.replace(/<body [^>]*>/, m => m + '\n<div id="sketch-container"></div>');
                }
            }

            // ── window.onerror error forwarder ────────────────────────────────
            // Inject as early as possible (right after <head>) so it catches every script
            // error including p5 CDN failures, SyntaxErrors in the sketch, and draw() crashes.
            // The parent frame receives {type:'SIM_ERROR'} postMessages for any future issues.
            if (!html.includes('SIM_ERROR')) {
                const errorForwarder = `<script>window.onerror=function(m,s,l,c,e){parent.postMessage({type:'SIM_ERROR',error:m,source:(s||'').split('/').pop(),line:l,col:c},'*');return true;};<\/script>`;
                if (html.includes('<head>')) {
                    html = html.replace('<head>', '<head>\n' + errorForwarder);
                } else if (html.includes('</head>')) {
                    html = html.replace('</head>', errorForwarder + '\n</head>');
                }
                console.log("[v5-conceptSim] window.onerror forwarder injected");
            }

            // ── crossorigin on p5.js CDN for real error messages ─────────────
            // Without crossorigin="anonymous", any error inside p5.js shows as
            // "Script error. (:0)" in window.onerror, hiding the real cause.
            if (html.includes('p5.min.js') && !html.includes('crossorigin')) {
                html = html.replace(
                    /(<script\s+src="[^"]*p5\.min\.js[^"]*")/g,
                    '$1 crossorigin="anonymous"'
                );
                console.log("[v5-conceptSim] crossorigin=anonymous added to p5.js CDN tag");
            }

            // ── p5.prototype.select null-safe monkey-patch ────────────────────
            // p5.js v1.x calls noLoop() when draw() throws an uncaught error.
            // Flash consistently generates p.select('#id').html(val) inside draw() without
            // null guards. If the element doesn't exist yet, p.select() returns null,
            // .html() throws TypeError, and the animation loop dies on frame 1.
            // This patch makes p.select() return a silent no-op proxy instead of null,
            // so DOM update calls never throw regardless of element existence.
            // MUST be injected AFTER p5.min.js loads so p5.prototype exists.
            if (!html.includes('_p5SelectPatched')) {
                const monkeyPatch = `<script>` +
                    `(function(){` +
                    `if(typeof p5==='undefined')return;` +
                    `window._p5SelectPatched=true;` +
                    `var _sel=p5.prototype.select;` +
                    `p5.prototype.select=function(e,c){` +
                    `var el=_sel.call(this,e,c);if(el)return el;` +
                    `var noop={html:function(){return noop;},style:function(){return noop;},` +
                    `attribute:function(){return noop;},addClass:function(){return noop;},` +
                    `removeClass:function(){return noop;},show:function(){return noop;},` +
                    `hide:function(){return noop;},elt:null};` +
                    `return noop;};` +
                    `})();` +
                    `<\/script>`;

                // Preferred: inject directly after the p5 CDN script closing tag
                const p5CdnMarker = 'p5.min.js';
                const p5MarkerIdx = html.indexOf(p5CdnMarker);
                if (p5MarkerIdx !== -1) {
                    const closeTagIdx = html.indexOf('></script>', p5MarkerIdx);
                    if (closeTagIdx !== -1) {
                        const insertAt = closeTagIdx + '></script>'.length;
                        html = html.slice(0, insertAt) + '\n' + monkeyPatch + html.slice(insertAt);
                        console.log("[v5-conceptSim] p5.select monkey-patch injected after p5 CDN tag");
                    }
                } else {
                    // Fallback: p5 CDN tag absent — inject immediately before the sketch script
                    const sketchIdx = html.indexOf('new p5(');
                    if (sketchIdx !== -1) {
                        const openTagIdx = html.lastIndexOf('<script', sketchIdx);
                        if (openTagIdx !== -1) {
                            html = html.slice(0, openTagIdx) + monkeyPatch + '\n' + html.slice(openTagIdx);
                            console.log("[v5-conceptSim] p5.select monkey-patch injected before sketch (fallback — no CDN tag found)");
                        }
                    }
                }
            }

            const stateLabels = Object.entries(graphStates).map(([id, s]) =>
                String(s.label ?? id)
            );

            console.log(`[v5-conceptSim] Generated concept-specific HTML (attempt ${attempt}), length:`, html.length);
            return { html, stateLabels };

        } catch (err) {
            console.error(`[v5-conceptSim] Generation failed (attempt ${attempt}):`, err);
        }
    }

    return null;
}

/** Full graph rendering pipeline — called when RENDERER_MAP routes to graph_interactive */
async function runGraphPipeline(
    brief: SimulationBrief,
    concept: string,
    classLevel: string,
    conceptId: string,
    fingerprint: QuestionFingerprint | null,
    cacheKey: string | null,
    conceptKey: string,
    startTime: number,
    originalQuestion?: string,
    simulation_emphasis?: string,
    panelConfig?: PanelConfig | null,
    epicState1?: EpicState1,
    examMode?: string,
): Promise<SimulationResult | null> {
    // ── Determine panel layout upfront so we can decide what to parallelise ──
    const pc = getPanelConfig(conceptId);
    const isDualPanel = panelConfig
        ? panelConfig.default_panel_count >= 2
        : !!(pc && (pc.layout === "dual_horizontal" || pc.layout === "dual_vertical"));
    console.log(`[SimGen] panelConfig source: ${panelConfig ? 'chat-route (Supabase)' : 'hardcoded-map'} | concept: ${conceptId} | dual: ${isDualPanel}`);
    const isOhmsLaw = conceptId.includes("ohms_law") || conceptId.includes("ohm");

    // ── Stage 2 — parallel launch strategy ────────────────────────────────────
    // OhmsLaw: Panel A (OhmsLawConfig) only needs `brief`, same as Panel B (GraphConfig).
    //          → launch both in parallel immediately.
    // Non-OhmsLaw dual: Panel A (ConceptPrimaryHtml) needs graphConfig.states.
    //          → launch Panel A right after GraphConfig resolves, in parallel with TruthAnchor.
    // Single panel: no Panel A at all — same as before.
    // ──────────────────────────────────────────────────────────────────────────

    // For OhmsLaw dual panel, kick off Panel A now alongside Panel B
    let ohmsConfigPromise: Promise<OhmsLawConfig> | undefined;
    if (isDualPanel && isOhmsLaw) {
        console.log("[v5] Stage 2: launching GraphConfig + OhmsLawConfig in parallel...");
        ohmsConfigPromise = generateOhmsLawConfig(brief);
    } else {
        console.log("[v5] Stage 2: generating GraphConfig...");
    }

    let graphConfig = await generateGraphConfig(brief, conceptId);
    console.log("═══════════════════════════════════════════════════════");
    console.log("[v5 STAGE 2 -- GraphConfig]");
    console.log(JSON.stringify(graphConfig, null, 2));
    console.log("═══════════════════════════════════════════════════════");

    // Declare Panel A outputs here — may be set by pre-built engineer path (sync)
    // or by the Pro-generated promise path (async), depending on what's available.
    let primarySimHtml: string | undefined;
    let primaryStateLabels: string[] | undefined;

    // For non-OhmsLaw dual panel, prefer a pre-written ParticleFieldConfig from the
    // physics_constants JSON (engineer path — synchronous, zero extra AI calls).
    // Fall back to generateConceptPrimaryHtml (Pro path) only when no pre-built config exists.
    let conceptPrimaryPromise: Promise<{ html: string; stateLabels: string[] } | null> | undefined;
    if (isDualPanel && !isOhmsLaw) {
        const panelConstants = await lookupPhysicsConstants(conceptId) as unknown as Record<string, unknown> | null;
        const prebuiltConfig = panelConstants?.particle_field_config as ParticleFieldConfig | undefined;

        if (prebuiltConfig) {
            // ── Engineer path — no Pro call, no latency ──────────────────────────
            console.log("[v5] Dual layout — using pre-built particle_field config (engineer path, 0ms)");
            const animConstraints = panelConstants?.animation_constraints as Record<string, string | number | boolean> | undefined;
            primarySimHtml = assembleRendererHTML(prebuiltConfig, animConstraints ?? null);
            primaryStateLabels = [
                prebuiltConfig.states.STATE_1.label,
                prebuiltConfig.states.STATE_2.label,
                prebuiltConfig.states.STATE_3.label,
                prebuiltConfig.states.STATE_4.label,
            ];
            console.log("[v5] ✅ Pre-built LEFT panel assembled instantly, length:", primarySimHtml.length);
        } else {
            // ── Pro-generated path — launch in parallel with TruthAnchor ─────────
            const initialGraphStates = (graphConfig.states ?? {}) as Record<string, Record<string, unknown>>;
            console.log("[v5] Dual layout — no pre-built config, launching Panel A (Pro path) in parallel with TruthAnchor...");
            conceptPrimaryPromise = generateConceptPrimaryHtml(brief, conceptId, initialGraphStates, simulation_emphasis, epicState1);
        }
    }

    // Stage 3B: Truth Anchor (runs in parallel with Panel A for non-OhmsLaw dual)
    const truthResult = await checkNcertTruth(graphConfig, conceptId);
    if (!truthResult.passed) {
        console.warn("[v5-TruthAnchor] FAILED:", truthResult.failures);
        let anchored = false;
        for (let attempt = 1; attempt <= 2; attempt++) {
            const failureNote =
                `PREVIOUS CONFIG FAILED NCERT TRUTH CHECK. Fix these:\n` +
                truthResult.failures.map((f, i) => `${i + 1}. ${f}`).join("\n");
            const anchoredBrief = { ...brief, _truthAnchorFeedback: failureNote } as unknown as SimulationBrief;
            const retryConfig = await generateGraphConfig(anchoredBrief as unknown as SimulationBrief, conceptId);
            const retryTruth = await checkNcertTruth(retryConfig, conceptId);
            if (retryTruth.passed) {
                console.log(`[v5-TruthAnchor] ✅ PASSED on attempt ${attempt}`);
                graphConfig = retryConfig;
                anchored = true;
                break;
            }
            console.warn(`[v5-TruthAnchor] Attempt ${attempt} still failing:`, retryTruth.failures);
        }
        if (!anchored) {
            console.warn("[v5-TruthAnchor] ❌ Using graph fallback. NEEDS HUMAN REVIEW:", conceptId);
            graphConfig = getGraphFallbackConfig(conceptId);
            // Log failure to simulation_cache with quality_score=0
            await logTruthAnchorFailure(conceptKey, conceptId, classLevel, cacheKey, fingerprint);
        }
    } else {
        console.log("[v5-TruthAnchor] ✅ PASSED");
    }

    const simHtml = assembleGraphHTML(graphConfig);
    const engine: SimEngine = "plotly";
    const physicsConfig = graphConfig as unknown as PhysicsConfig;

    // Dual-panel: collect Panel A result.
    // Pre-built path: primarySimHtml already set above (synchronous).
    // Pro path: conceptPrimaryPromise in-flight — await it now (should be mostly done).
    // OhmsLaw path: ohmsConfigPromise in-flight — await it below.
    try {
        if (isDualPanel) {
            if (isOhmsLaw && ohmsConfigPromise) {
                // Await the Panel A promise started before Stage 2
                const ohmsConfig = await ohmsConfigPromise;
                console.log("═══════════════════════════════════════════════════════");
                console.log("[v5 STAGE 2 -- OhmsLawConfig]");
                console.log(JSON.stringify(ohmsConfig, null, 2));
                console.log("═══════════════════════════════════════════════════════");
                primarySimHtml = assembleOhmsLawHTML(ohmsConfig);
                primaryStateLabels = [
                    ohmsConfig.states.STATE_1.label,
                    ohmsConfig.states.STATE_2.label,
                    ohmsConfig.states.STATE_3.label,
                    ohmsConfig.states.STATE_4.label,
                ];
                console.log("[v5] ✅ Ohm's Law HTML assembled, length:", primarySimHtml.length);
            } else if (conceptPrimaryPromise) {
                // Await the Panel A promise started in parallel with TruthAnchor
                const conceptResult = await conceptPrimaryPromise;
                if (conceptResult) {
                    primarySimHtml = conceptResult.html;
                    primaryStateLabels = conceptResult.stateLabels;
                    console.log("[v5] ✅ Concept-specific primary sim generated, length:", primarySimHtml.length);
                } else {
                    // Fallback to particle_field
                    console.warn("[v5] Concept-specific sim failed, falling back to particle_field...");
                    const particleConstants = await lookupPhysicsConstants(conceptId);
                    const particleConfig = await generateSimConfig(brief, particleConstants, conceptId);
                    primarySimHtml = assembleRendererHTML(particleConfig, particleConstants?.animation_constraints ?? null);
                    console.log("[v5] ✅ Fallback particle HTML generated, length:", primarySimHtml.length);
                }
            }
        }
    } catch (err) {
        console.warn("[v5] Primary sim generation failed (non-fatal):", err);
    }

    // Stage 4: Teacher script
    // When dual layout: build a combinedSpec so Flash knows both panels' state descriptions.
    let stateMachineSpec = graphConfigToStateMachineSpec(graphConfig, concept);
    if (primarySimHtml) {
        const graphSpecStates = stateMachineSpec.states;
        const combinedStates = graphSpecStates.map((gs, i) => ({
            ...gs,
            what_student_sees:
                `RIGHT PANEL (graph): ${gs.what_student_sees}` +
                (primaryStateLabels?.[i]
                    ? ` | LEFT PANEL (simulation): ${primaryStateLabels[i]}`
                    : ` | LEFT PANEL: concept-specific visualization active`),
        }));
        stateMachineSpec = { ...stateMachineSpec, states: combinedStates };
        console.log("[v5] Stage 4: using combined dual-panel spec");
    }
    console.log("[v5] Stage 4: generating teacher script...");
    const scriptResult = await generateScriptFromSimulation(stateMachineSpec, concept, classLevel, conceptId, originalQuestion, simulation_emphasis);
    const teacherScript = scriptResult?.steps ?? null;

    console.log("[v5] ✅ PIPELINE COMPLETE (graph):", {
        renderer: "graph_interactive",
        simHtmlLen: simHtml.length,
        scriptSteps: teacherScript?.length ?? 0,
        latencyMs: Date.now() - startTime,
    });

    // Cache
    const upsertPayload: Record<string, unknown> = {
        concept_key: fingerprint?.concept_id ?? conceptKey,
        fingerprint_key: cacheKey,
        physics_config: physicsConfig,
        sim_brief: brief,
        sim_html: simHtml,
        secondary_sim_html: primarySimHtml ?? null,
        teacher_script: teacherScript ?? null,
        concept_id: conceptId,
        engine,
        class_level: fingerprint?.class_level ?? classLevel,
        served_count: 0,
        pipeline_version: "v5-graph",
        sim_code: "",
        sim_type: "graph_interactive",
        renderer_type: "graph_interactive",
        truth_anchor_passed: null, // graph pipeline skips truth anchor
        quality_score: 0,
    };
    if (fingerprint) {
        upsertPayload.intent = fingerprint.intent;
        upsertPayload.mode = fingerprint.mode;
        upsertPayload.aspect = fingerprint.aspect;
        upsertPayload.ncert_chapter = fingerprint.ncert_chapter;
        upsertPayload.variables_changing = fingerprint.variables_changing;
        upsertPayload.confidence = fingerprint.confidence;
    }
    // FIX C: Never cache simulations with concept_key "unknown" — they poison future lookups
    const shouldCache = conceptKey !== 'unknown' && !(cacheKey?.startsWith('unknown|'));
    if (!shouldCache) {
        console.warn("[aiSimGen] ⚠️ Refusing to cache 'unknown' concept — would poison future lookups");
    } else {
        const conflictCol = fingerprint ? "fingerprint_key" : "concept_key,class_level";
        const { error: cacheError } = await supabaseAdmin
            .from("simulation_cache")
            .upsert(upsertPayload, { onConflict: conflictCol });

        if (cacheError) {
            console.error("[aiSimGen] ⚠️ CACHE SAVE FAILED:", cacheError.message);
        } else {
            console.log("[aiSimGen] ✅ CACHED (v5-graph):", conceptKey);
        }
    }

    return { physicsConfig, engine, brief, simHtml, primarySimHtml, teacherScript, fromCache: false, conceptKey };
}

/** Convert ParticleFieldConfig states into a StateMachineSpec for Stage 4 script generation */
function configToStateMachineSpec(config: ParticleFieldConfig, concept: string): StateMachineSpec {
    const stateEntries: SimulationStateEntry[] = Object.entries(config.states).map(([id, s]) => ({
        id,
        name: s.label,
        show: [],
        hide: [],
        what_student_sees: s.label,
        visible_label: s.label,
        highlight_particle: s.highlight_particle,
        dim_others: s.dim_others,
        field_visible: s.field_visible,
        drift_speed: s.drift_speed,
    }));

    return {
        concept,
        total_states: stateEntries.length,
        states: stateEntries,
    };
}

// =============================================================================
// MAIN EXPORT — generateSimulation()
// Orchestrates Stage 1 → Stage 2, cache, usage logging
// =============================================================================

export async function generateSimulation(
    concept: string,
    question: string,
    classLevel: string,
    imageContext?: string,
    simConfig?: string,
    fingerprint?: QuestionFingerprint,
    recentMessages?: string[],
    confusionPoint?: string,
    mvsContext?: string,
    studentConfusionData?: { simulation_emphasis?: string; student_belief?: string } | null,
    panelConfig?: PanelConfig | null,
    scope?: string,
    examMode?: string,
    variant?: import("@/lib/variantPicker").VariantConfig,
): Promise<SimulationResult | null> {
    const startTime = Date.now();
    console.log('[SCOPE TRACE] generateSimulation() received:', scope);
    const conceptKey = concept
        .toLowerCase().trim()
        .replace(/\s+/g, "_")
        .replace(/[^a-z0-9_]/g, "")
        .substring(0, 80);

    const cacheKey = fingerprint?.cache_key ?? null;
    console.log("[aiSimGen] CACHE CHECK:", { cacheKey, conceptKey, classLevel });

    // ── 1. Cache hit ────────────────────────────────────────────────────────────
    try {
        let cached: SimCacheRow | null = null;

        if (cacheKey) {
            const { data } = await supabaseAdmin
                .from("simulation_cache")
                .select("physics_config, engine, sim_brief, sim_html, secondary_sim_html, sim_type, teacher_script, served_count")
                .eq("fingerprint_key", cacheKey)
                .maybeSingle();
            if (data?.sim_html) cached = data as unknown as SimCacheRow;
        }

        // Fallback uses concept_key+class_level (fingerprint-key drift across
        // sessions means the primary lookup can miss a perfectly good cached
        // row). It MUST filter by mode too, otherwise a conceptual request
        // can pull a board-cached row (answer-sheet canvas leaks into
        // conceptual tab) and vice versa.
        const fingerprintMode = fingerprint?.mode;
        if (!cached) {
            const fallbackConceptKey = fingerprint?.concept_id ?? conceptKey;
            let query = supabaseAdmin
                .from("simulation_cache")
                .select("physics_config, engine, sim_brief, sim_html, secondary_sim_html, sim_type, teacher_script, served_count, fingerprint_key")
                .eq("concept_key", fallbackConceptKey)
                .eq("class_level", classLevel);
            if (fingerprintMode) {
                // Guard: fingerprint_key is `concept|intent|class|mode|aspect`.
                // Require the mode segment to match so cross-mode rows don't leak.
                query = query.like("fingerprint_key", `%|${fingerprintMode}|%`);
            }
            const { data } = await query.maybeSingle();
            if (data?.sim_html) cached = data as unknown as SimCacheRow;
        }

        if (cached?.physics_config && cached?.sim_html) {
            console.log("[aiSimGen] ✅ CACHE HIT (v3 with sim_html):", cacheKey ?? conceptKey,
                '| sim_type:', cached.sim_type ?? 'single');

            void supabaseAdmin
                .from("simulation_cache")
                .update({ served_count: (cached.served_count ?? 0) + 1 })
                .eq(cacheKey ? "fingerprint_key" : "concept_key", cacheKey ?? conceptKey)
                .then(() => { });

            logUsage({
                taskType: "simulation_generation",
                provider: "cache",
                model: "simulation_cache",
                inputChars: question.length,
                outputChars: cached.sim_html.length,
                latencyMs: Date.now() - startTime,
                estimatedCostUsd: 0,
                wasCacheHit: true,
                fingerprintKey: cacheKey ?? undefined,
            });

            const teacherScript = (cached as unknown as Record<string, unknown>).teacher_script as
                TeacherScriptStep[] | null ?? null;

            // Multi-panel cache hit — return full dual-panel shape
            if (cached.sim_type === 'multi_panel' && cached.secondary_sim_html) {
                return {
                    type: 'multi_panel' as const,
                    panel_a: {
                        renderer: 'mechanics_2d',
                        simHtml: cached.sim_html,
                        physicsConfig: cached.physics_config as PhysicsConfig,
                    },
                    panel_b: {
                        renderer: 'graph_interactive',
                        simHtml: cached.secondary_sim_html,
                    },
                    sync_required: true,
                    primary_panel: 'panel_a' as const,
                    shared_states: ['STATE_1','STATE_2','STATE_3','STATE_4','STATE_5','STATE_6'],
                    brief: (cached.sim_brief ?? {}) as SimulationBrief,
                    teacherScript,
                    fromCache: true,
                    conceptKey,
                };
            }

            // Single-panel cache hit (existing behavior)
            return {
                physicsConfig: cached.physics_config as PhysicsConfig,
                engine: (cached.engine ?? "p5js") as SimEngine,
                brief: (cached.sim_brief ?? {}) as SimulationBrief,
                simHtml: cached.sim_html,
                teacherScript,
                fromCache: true,
                conceptKey,
            };
        }
    } catch (err) {
        console.warn("[aiSimGen] Cache check failed:", err);
    }

    // ── 2. Stage 1 — SimulationBrief ───────────────────────────────────────────
    console.log("[aiSimGen] 🎬 STAGE 1: generating SimulationBrief for:", concept);
    const ctx: StudentContext = {
        question,
        concept,
        classLevel,
        mode: fingerprint?.mode ?? "conceptual",
        ncertChapter: fingerprint?.ncert_chapter,
        recentMessages,
        confusionPoint,
        mvsContext,
        simulation_emphasis: studentConfusionData?.simulation_emphasis,
        student_belief: studentConfusionData?.student_belief,
    };

    // ── STEP 1: Resolve conceptIdForLookup (hoisted from below) ────────────────
    let conceptIdForLookup = fingerprint?.concept_id ?? conceptKey;

    // FIX 7: Graceful fallback for unknown concepts — keyword matching only, no question-text slugification
    if (conceptIdForLookup === "unknown") {
        console.log("[v5] concept unknown — attempting keyword extraction from student question");
        const rawQuestion = (ctx.question ?? concept ?? "").toLowerCase();
        const KEYWORD_CONCEPT_MAP: Record<string, string> = {
            'vector': 'vector_addition',
            'projectile': 'projectile_motion',
            'pendulum': 'simple_pendulum',
            'momentum': 'conservation_of_momentum',
            'inertia': 'newtons_laws_overview',
            'friction': 'friction_laws',
            'gravity': 'acceleration_due_to_gravity_variation',
            'ohm': 'ohms_law',
            'kirchhoff': 'kirchhoffs_laws',
            'lens': 'convex_lens',
        };
        for (const [keyword, mappedConcept] of Object.entries(KEYWORD_CONCEPT_MAP)) {
            if (rawQuestion.includes(keyword)) {
                conceptIdForLookup = mappedConcept;
                console.log("[v5] keyword fallback:", keyword, "→", conceptIdForLookup);
                break;
            }
        }

        // Still unknown — show clarification card and bail
        // NOTE: `brief` intentionally dropped from return — not yet computed at this point
        if (conceptIdForLookup === "unknown") {
            return {
                physicsConfig: {} as PhysicsConfig,
                engine: "p5js",
                brief: defaultBrief(concept, classLevel, fingerprint?.mode ?? "conceptual", fingerprint),
                simHtml: `<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#aaa;font-family:sans-serif;background:#0A0A1A;text-align:center;padding:32px;"><div><div style="font-size:32px;margin-bottom:16px;">🔭</div><div style="font-size:15px;font-weight:600;color:#e2e8f0;margin-bottom:10px;">Which concept would you like to visualize?</div><div style="font-size:13px;color:#718096;line-height:1.6;">Try asking about a specific topic like:<br><em>"show me Ohm's Law"</em>, <em>"why does a wire get hot"</em>,<br><em>"explain Kirchhoff's laws"</em></div></div></div>`,
                primarySimHtml: undefined,
                teacherScript: null,
                fromCache: false,
                conceptKey: "unknown"
            };
        }
    }

    // ── STEP 2: Load physics constants (hoisted from below) ────────────────────
    // Source tracking: 'rescued' when scope=global (IntentResolver resolved an ambiguous query),
    // 'slug-fallback' when FIX 7 keyword matched, 'original' when classifier provided concept_id directly
    const conceptIdLookupSource: string =
        (scope === 'global') ? 'rescued' :
        (conceptIdForLookup !== (fingerprint?.concept_id ?? conceptKey) ? 'slug-fallback' : 'original');
    console.log('[loadConstants] using concept_id:', conceptIdForLookup, '| source:', conceptIdLookupSource);
    const physicsConstants = await lookupPhysicsConstants(conceptIdForLookup);
    console.log("[v5] Physics constants:", physicsConstants ? ((physicsConstants as unknown as Record<string, unknown>).concept ?? (physicsConstants as unknown as Record<string, unknown>).concept_id ?? "loaded") : "none (generic)");

    // ── STEP 3: epicStateBuilder (now runs AFTER constants are loaded) ─────────
    const epicRendererType = resolveRendererType(concept);
    const epicLPath = (physicsConstants as unknown as { epic_l_path?: { states: Array<{ physics_layer: { scenario: string }, label: string }> } } | null)?.epic_l_path ?? null;
    const epicState1: EpicState1 = buildEpicState1(
        studentConfusionData?.student_belief ?? null,
        studentConfusionData?.simulation_emphasis ?? null,
        epicRendererType,
        epicLPath,
        conceptIdForLookup,
    );
    console.log("[epicStateBuilder] type:", epicState1.type, "renderer:", epicRendererType);

    let brief = await generateSimulationBrief(ctx, fingerprint, epicState1);

    console.log("═══════════════════════════════════════════════════════");
    console.log("[STAGE 1 -- SimulationBrief]");
    console.log(JSON.stringify(brief, null, 2));
    console.log("═══════════════════════════════════════════════════════");

    // FIX 4: Confidence gate
    const confidence = brief.validation?.confidence ?? 0.5;
    if (confidence >= 0.85) {
        console.log("[aiSimGen] ✅ confidence gate: PASS", confidence);
    } else if (confidence >= 0.70) {
        console.log("[aiSimGen] ⚠️ confidence gate: RETRY", confidence);
        // Retry Stage 1 with stricter constraint
        const retryCtx = {
            ...ctx,
            confusionPoint: (ctx.confusionPoint ?? "") +
                "\n\n[SYSTEM] Previous attempt scored low confidence. " +
                "You must be 100% certain of the physics. " +
                "If uncertain about any value, use approximate ranges. " +
                "The simulation must directly address THIS student's confusion. " +
                "Output ONLY what you are certain is correct.",
        };
        const retryBrief = await generateSimulationBrief(retryCtx, fingerprint, epicState1);
        const retryConf = retryBrief.validation?.confidence ?? 0.5;
        if (retryConf > confidence) {
            console.log("[aiSimGen] ✅ retry improved confidence:", confidence, "→", retryConf);
            brief = retryBrief;
        } else {
            console.log("[aiSimGen] retry did not improve, keeping original");
        }
    } else {
        console.log("[aiSimGen] ❌ confidence gate: LOW", confidence, "— using safe fallback brief");
        brief = defaultBrief(concept, classLevel, fingerprint?.mode ?? "conceptual", fingerprint);
    }

    // ══════════════════════════════════════════════════════════════════════════
    // v5 PHASE A — Config-driven renderer pipeline
    // Stage 2: Sonnet writes config JSON | Stage 3: Validate | Assemble HTML
    // ══════════════════════════════════════════════════════════════════════════

    // ── JSON Modifier: adapt master JSON for this student's confusion ────────
    console.log('[SCOPE TRACE] before runJsonModifier:', scope, '| cast:', (scope as 'micro' | 'local' | 'global') ?? 'undefined');
    const modifiedJson: ModifiedSimulationJson = await runJsonModifier({
        masterJson: (physicsConstants as unknown as Record<string, unknown>) ?? {},
        studentBelief: studentConfusionData?.student_belief ?? null,
        simulationEmphasis: studentConfusionData?.simulation_emphasis ?? null,
        epicState1,
        briefSummary: brief.key_insight_to_show ?? '',
        conceptId: conceptIdForLookup,
        scope: (scope as 'micro' | 'local' | 'global') ?? undefined,
    });
    console.log("[jsonModifier] is_epic_c:", modifiedJson.is_epic_c);
    console.log("[jsonModifier] primary_emphasis:", modifiedJson.simulation_strategy.primary_emphasis?.slice(0, 80));

    // ── Phase 6: Multi-panel routing ─────────────────────────────────────────
    const panelCount = modifiedJson.technology_config?.panel_count ?? 1;
    console.log('[aiSimGen] examMode received:', examMode ?? 'none');

    // ── BOARD MODE BYPASS ─────────────────────────────────────
    // Fires for any concept (single OR dual panel) when examMode === 'board'
    // and the JSON has a board_mode.epic_l_path_board.states block.
    const boardModeStates = (physicsConstants as any)
      ?.board_mode?.epic_l_path_board?.states ?? null;
    const isBoardBypass =
      examMode === 'board' &&
      boardModeStates !== null &&
      typeof boardModeStates === 'object' &&
      !Array.isArray(boardModeStates) &&
      Object.keys(boardModeStates).some(k => k.startsWith('STATE_'));

    if (isBoardBypass) {
      console.log('[BOARD BYPASS] firing — reading board_mode JSON, skipping Stage 2');

      const boardStateIds = Object.keys(boardModeStates)
        .filter(k => k.startsWith('STATE_'))
        .sort((a, b) => parseInt(a.replace('STATE_', '')) -
                        parseInt(b.replace('STATE_', '')));

      console.log('[BOARD BYPASS] states:', boardStateIds);

      const boardPanelAConfig: Record<string, unknown> = {
        renderer: 'mechanics_2d',
        renderer_hint: {
          scenario_type: conceptIdForLookup,
          panel_count: 1,
          sync_required: false,
        },
        epic_l_path: {
          states: boardModeStates,
        },
        pvl_colors: {
          background: '#0A0A1A',
          text: '#D4D4D8',
        },
        locked_facts: (physicsConstants as any).locked_facts ?? {},
        exam_mode: 'board',
      };

      const boardPanelAHtml = assembleMechanics2DHtml(
        boardPanelAConfig as unknown as
        import("@/lib/renderers/mechanics_2d_renderer").Mechanics2DConfig
      );

      const boardTeacherScript: TeacherScriptStep[] =
        boardStateIds.map((id, idx) => {
          const state = (boardModeStates as Record<string, any>)[id] ?? {};
          const sentences: Array<{ text_en: string }> =
            state?.teacher_script?.tts_sentences ?? [];
          const text = sentences.map((s: any) => s.text_en).join(' ');
          const examTip = state?.teacher_script?.exam_tip_en ?? '';
          const marks = (state?.exam_overlay?.marks_breakdown ?? [])
            .join(' | ');
          const fullText = [text, marks ? `Marks: ${marks}` : '', examTip]
            .filter(Boolean).join(' — ');
          return {
            step_number: idx + 1,
            title: state?.label ?? id,
            text: fullText,
            sim_state: id,
            key_term: state?.physics_layer?.scenario ?? '',
            is_interactive: false,
          };
        });

      console.log('[BOARD BYPASS] complete — states:',
        boardStateIds.length, 'Sonnet: SKIPPED');

      return {
        type: 'single_panel' as const,
        simHtml: boardPanelAHtml,
        physicsConfig: {} as PhysicsConfig,
        engine: 'p5js',
        brief,
        teacherScript: boardTeacherScript,
        fromCache: false,
        conceptKey,
      };
    }
    // ── END BOARD MODE BYPASS ──────────────────────────────────

    if (panelCount > 1) {
        console.log("[multiPanel] dual-panel concept detected:", conceptIdForLookup, "panel_count:", panelCount);

        // Run Stage 2 with multi-panel prompt — the buildStage2Prompt extension
        // injects MULTI-PANEL DISPLAY block when technology_config.panel_count > 1
        const strategy: SimulationStrategy = {
            renderer: modifiedJson.technology_config.renderer_a,
            aha_moment: brief.aha_moment?.what_to_show ?? "See the physics in motion",
            target_misconception: modifiedJson.simulation_strategy?.misconception_being_targeted,
            analogy_to_use: brief.student_confusion,
            emphasis_states: ["STATE_3"],
            exam_target: (brief.mode === "jee" ? "jee" : "boards"),
            vocabulary_level: "intermediate",
            formula_anchor: true,
            skip_state_1: false,
        };

        const normalizedConceptId = (conceptIdForLookup || "").replace(/_(?:basic|advanced|conceptual|exam|jee|neet|definition|intro|overview)$/, "");
        const constantsKey = normalizedConceptId && CONCEPT_FILE_MAP[normalizedConceptId]
            ? CONCEPT_FILE_MAP[normalizedConceptId]
            : (normalizedConceptId || "drift_velocity");

        // ── EPIC-L BYPASS — read JSON directly, skip Stage 1 and Stage 2 ─────────
        // Fires when: dual-panel + epic_l_path pre-authored + panel_b_config present
        //             + no student confusion (EPIC-L, not EPIC-C)
        //
        // Board-mode merge: when examMode === 'board' and the concept JSON ships
        // mode_overrides.board.derivation_sequence, swap each state's
        // scene_composition for the board derivation primitives before the
        // multi-panel config + HTML assembly below. canvas_style flows into the
        // parametric renderer so the panel-A background flips to answer-sheet.
        const { json: boardMergedJson, canvasStyle: boardCanvasStyle } =
            applyBoardMode(physicsConstants as unknown, examMode);
        const epicLStates = (boardMergedJson as any)?.epic_l_path?.states ?? null;
        const jsonPanelBConfig = (physicsConstants as any)?.panel_b_config ?? null;
        const isEpicLBypass =
            panelCount > 1 &&
            epicLStates !== null &&
            typeof epicLStates === 'object' &&
            !Array.isArray(epicLStates) &&
            Object.keys(epicLStates).some(k => k.startsWith('STATE_')) &&
            jsonPanelBConfig !== null &&
            !studentConfusionData?.student_belief;

        if (isEpicLBypass) {
            console.log('[EPIC-L BYPASS] firing — reading JSON directly, skipping Stage 2');
            console.log('[EPIC-L BYPASS] states:', Object.keys(epicLStates));
            console.log('[EPIC-L BYPASS] examMode:', examMode ?? 'none', '| canvas_style:', boardCanvasStyle ?? 'default');

            // Build Panel A config from JSON (mechanics_2d shape)
            const bypassPanelAConfig: Record<string, unknown> = {
                renderer: 'mechanics_2d',
                renderer_hint: (physicsConstants as any).renderer_hint ?? {
                    scenario_type: conceptIdForLookup,
                    panel_count: 2,
                    sync_required: true,
                },
                epic_l_path: {
                    states: epicLStates,
                },
                pvl_colors: {
                    background: '#0A0A1A',
                    text: '#D4D4D8',
                },
                locked_facts: (physicsConstants as any).locked_facts ?? {},
            };

            // Build Panel B config from JSON (graph_interactive shape).
            // The v2 graph renderer reads:
            //   - default_variables: seed variable values for trace evaluation + live_dot
            //   - variable_specs: authored min/max/step/unit per variable for DOM sliders
            // Both derived from physics_engine_config.variables so every concept gets
            // consistent bootstrapping without bespoke per-concept logic here.
            const peCfgForPanelB = (physicsConstants as any)?.physics_engine_config ?? {};
            const peVarSpecs = (peCfgForPanelB.variables && typeof peCfgForPanelB.variables === 'object')
                ? peCfgForPanelB.variables as Record<string, Record<string, unknown>>
                : {};
            const peDefaultVars: Record<string, number> = {};
            for (const [vk, vSpec] of Object.entries(peVarSpecs)) {
                const defNum = typeof vSpec.default === 'number' ? vSpec.default : undefined;
                const constNum = typeof vSpec.constant === 'number' ? vSpec.constant : undefined;
                const seed = defNum ?? constNum;
                if (typeof seed === 'number') peDefaultVars[vk] = seed;
            }
            const bypassPanelBConfig: Record<string, unknown> = {
                renderer: 'graph_interactive',
                default_variables: peDefaultVars,
                variable_specs: peVarSpecs,
                ...jsonPanelBConfig,
            };

            // Assemble HTML for each panel directly — no switch needed
            if (PCPL_CONCEPTS.has(conceptIdForLookup)) {
                console.log('[pcpl] parametric pipeline for concept:', conceptIdForLookup);
            }
            const bypassPanelAHtml = PCPL_CONCEPTS.has(conceptIdForLookup)
                ? assembleParametricHtml({
                    concept_id: conceptIdForLookup,
                    scene_composition: (() => {
                        const states = (epicLStates as Record<string, unknown>) ?? {};
                        // Find first state with a force_arrow primitive
                        for (const [, s] of Object.entries(states)) {
                            const sc = ((s as { scene_composition?: Array<{ type?: string }> }).scene_composition) ?? [];
                            if (sc.some((p) => p.type === 'force_arrow')) return sc as unknown[];
                        }
                        // Fallback: first state's scene_composition
                        const firstKey = Object.keys(states)[0];
                        return firstKey
                            ? ((states[firstKey] as { scene_composition?: unknown[] }).scene_composition ?? [])
                            : [];
                    })(),
                    states: (epicLStates as Record<string, { scene_composition?: unknown[] }>) ?? {},
                    default_variables: (Object.keys(peDefaultVars).length > 0
                        ? peDefaultVars
                        : (
                            conceptIdForLookup === 'contact_forces' ? { N: 20, f: 15 } :
                            conceptIdForLookup === 'normal_reaction' ? { m: 2, theta: 30 } :
                            conceptIdForLookup === 'tension_in_string' ? { m1: 2, m2: 1 } :
                            { m: 1 }
                          )
                    ),
                    current_state: 'STATE_1',
                    canvas_style: boardCanvasStyle,
                })
                : assembleMechanics2DHtml(
                    bypassPanelAConfig as unknown as
                    import("@/lib/renderers/mechanics_2d_renderer").Mechanics2DConfig
                );
            const bypassPanelBHtml = assembleGraphHTML(bypassPanelBConfig);

            // Build state list (identical logic to lines 5161-5166)
            const bypassStateIds = Object.keys(epicLStates)
                .filter(k => k.startsWith('STATE_'))
                .sort((a, b) => parseInt(a.replace('STATE_', '')) -
                                parseInt(b.replace('STATE_', '')));

            // Build TeacherScriptStep[] directly from JSON teacher_script
            // Zero Sonnet — tts_sentences[].text_en served directly
            const bypassTeacherScript: TeacherScriptStep[] =
                bypassStateIds.map((id, idx) => {
                    const state = (epicLStates as Record<string, any>)[id] ?? {};
                    const sentences: unknown[] =
                        state?.teacher_script?.tts_sentences ?? [];
                    const joined = sentences.map(extractTtsText).filter(Boolean).join(' ');
                    const text = joined.length > 0
                        ? joined
                        : state?.script_intent ?? state?.label ?? '';
                    return {
                        step_number: idx + 1,
                        title: state?.label ?? id,
                        text,
                        sim_state: id,
                        key_term: state?.physics_layer?.scenario ?? '',
                        is_interactive: id === 'STATE_6',
                    };
                });

            console.log('[EPIC-L BYPASS] teacher script built from JSON — steps:',
                bypassTeacherScript.length, 'Sonnet Stage 4: SKIPPED');

            // Cache multi_panel result (mirrors single-panel upsert)
            const shouldCacheBypass = conceptKey !== 'unknown' && !(cacheKey?.startsWith('unknown|'));
            if (shouldCacheBypass && cacheKey) {
                void supabaseAdmin
                    .from("simulation_cache")
                    .upsert({
                        concept_key: fingerprint?.concept_id ?? conceptKey,
                        fingerprint_key: cacheKey,
                        physics_config: bypassPanelAConfig,
                        sim_brief: brief,
                        sim_html: bypassPanelAHtml,
                        secondary_sim_html: bypassPanelBHtml,
                        teacher_script: bypassTeacherScript,
                        concept_id: conceptIdForLookup,
                        engine: 'p5js',
                        class_level: fingerprint?.class_level ?? classLevel,
                        served_count: 0,
                        pipeline_version: "v5-multipanel",
                        sim_code: "",
                        sim_type: "multi_panel",
                        renderer_type: modifiedJson.technology_config?.renderer_a ?? "mechanics_2d",
                    }, { onConflict: "fingerprint_key" })
                    .then(({ error }) => {
                        if (error) console.error("[aiSimGen] multi_panel cache save failed:", error.message);
                        else console.log("[aiSimGen] multi_panel cached:", cacheKey);
                    });
            }

            return {
                type: 'multi_panel' as const,
                panel_a: { ...bypassPanelAConfig, simHtml: bypassPanelAHtml },
                panel_b: { ...bypassPanelBConfig, simHtml: bypassPanelBHtml },
                sync_required: modifiedJson.technology_config.sync_required,
                primary_panel: 'panel_a',
                shared_states: bypassStateIds,
                brief,
                teacherScript: bypassTeacherScript,
                fromCache: false,
                conceptKey,
            };
        }
        // ── END EPIC-L BYPASS ─────────────────────────────────────────────────────

        const s2VecA = (epicState1 as unknown as { state_1_render_spec?: { vector_a?: { magnitude?: number } } })?.state_1_render_spec?.vector_a?.magnitude;
        const s2VecB = (epicState1 as unknown as { state_1_render_spec?: { vector_b?: { magnitude?: number } } })?.state_1_render_spec?.vector_b?.magnitude;
        // Scope-aware state cap — sourced from jsonModifier's simulation_strategy
        const maxStates = modifiedJson?.simulation_strategy?.max_states;
        const stage2Result = await runStage2(
            strategy, constantsKey, undefined,
            ctx.simulation_emphasis, ctx.student_belief, modifiedJson, variant,
            s2VecA, s2VecB, maxStates
        );
        const config = stage2Result.config as unknown as Record<string, unknown>;
        console.log('[DEBUG] Stage2 raw top-level keys:', Object.keys(config ?? {}));

        const panelAConfig = config.panel_a_config as Record<string, unknown> | undefined;
        const panelBConfig = config.panel_b_config as Record<string, unknown> | undefined;

        if (!panelAConfig || !panelBConfig) {
            if (panelCount > 1) {
                // Dual-panel Stage 2 failed. Do NOT fall through to
                // generateMechanics2DConfig — it has no dual-panel awareness
                // and would produce scenario:"projectile" for any concept.
                console.error(
                    '[aiSimGen] FATAL: dual-panel Stage 2 failed to produce ' +
                    'panel_a_config for concept:', constantsKey,
                    '— refusing to fall through to single-panel path.'
                );
                throw new Error(
                    `Dual-panel Stage 2 failed for ${constantsKey}. ` +
                    `Check stage2Prompt logs for Sonnet output.`
                );
            }
            // single-panel concepts: existing fallthrough is fine
        } else {
            const rendererA = (panelAConfig.renderer as string) ?? modifiedJson.technology_config.renderer_a;
            const rendererB = (panelBConfig.renderer as string) ?? modifiedJson.technology_config.renderer_b ?? 'graph_interactive';

            // ── EPIC-C STATE_1 injection + scenario validation ─────────────────────
            // When is_epic_c, STATE_1 is deterministically built from epicState1's
            // state_1_render_spec (not Sonnet), and every physics_layer.scenario value
            // is validated against the EPIC-C scenario list from the concept JSON.
            // Sonnet-invented scenario strings are replaced with epicCScenarios[0].
            if (modifiedJson.is_epic_c && rendererA === 'mechanics_2d') {
                const rawEpicC = (physicsConstants as unknown as {
                    available_renderer_scenarios?: { epic_c?: unknown };
                })?.available_renderer_scenarios?.epic_c;
                const epicCScenariosFromJson: string[] = Array.isArray(rawEpicC)
                    ? (rawEpicC as unknown[]).filter(
                        (v): v is string => typeof v === 'string' && v.length > 0
                      )
                    : [];
                const epicCScenarios: string[] = epicCScenariosFromJson.length > 0
                    ? epicCScenariosFromJson
                    : ['two_vectors_given', 'parallelogram_law', 'resultant_formula', 'r_vs_theta_curve'];
                const epicCScenariosSet = new Set(epicCScenarios);

                // Validator — scan Sonnet's STATE_2..STATE_N and rewrite any invalid
                // scenario value to epicCScenarios[0]. Skip STATE_1 because the next
                // block overwrites it entirely.
                const panelAStatesPreInject = (panelAConfig.epic_l_path as Record<string, unknown> | undefined)?.states as Record<string, Record<string, unknown>> | undefined;
                if (panelAStatesPreInject) {
                    for (const [stateId, stateObj] of Object.entries(panelAStatesPreInject)) {
                        if (stateId === 'STATE_1') continue;
                        const pl = stateObj?.physics_layer as Record<string, unknown> | undefined;
                        const currentScenario = pl?.scenario;
                        if (typeof currentScenario === 'string' && !epicCScenariosSet.has(currentScenario)) {
                            console.log(
                                `[Stage2PostProcess] replaced invalid scenario "${currentScenario}" → "${epicCScenarios[0]}" in ${stateId}`
                            );
                            if (pl) pl.scenario = epicCScenarios[0];
                        }
                    }
                }

                // Magnitude lock — enforce A and B magnitudes from state_1_render_spec across all states.
                // Creates pl.vector_a / pl.vector_b objects when absent (Sonnet doesn't emit these per state),
                // so downstream renderer branches that read pl.vector_a.magnitude receive the locked values.
                if (s2VecA && s2VecB && panelAStatesPreInject) {
                    for (const [stateId, stateObj] of Object.entries(panelAStatesPreInject)) {
                        if (stateId === 'STATE_1') continue;
                        const pl = stateObj?.physics_layer as Record<string, unknown> | undefined;
                        if (!pl) continue;
                        if (!pl.vector_a) pl.vector_a = {};
                        const va = pl.vector_a as Record<string, unknown>;
                        if (va.magnitude !== s2VecA) {
                            console.log(`[Stage2PostProcess] set vector_a.magnitude in ${stateId}: ${va.magnitude ?? 'absent'} → ${s2VecA}`);
                            va.magnitude = s2VecA;
                        }
                        if (!pl.vector_b) pl.vector_b = {};
                        const vb = pl.vector_b as Record<string, unknown>;
                        if (vb.magnitude !== s2VecB) {
                            console.log(`[Stage2PostProcess] set vector_b.magnitude in ${stateId}: ${vb.magnitude ?? 'absent'} → ${s2VecB}`);
                            vb.magnitude = s2VecB;
                        }
                    }
                    const state2Pl = (panelAStatesPreInject?.STATE_2 as Record<string, unknown> | undefined)?.physics_layer as Record<string, unknown> | undefined;
                    console.log('[Stage2PostProcess] magnitude check STATE_2 after fix:',
                      JSON.stringify(state2Pl?.vector_a));
                }

                // STATE_1 injection — overwrite Sonnet's STATE_1 (if any) with the
                // deterministic wrong-belief template from epicState1.state_1_render_spec.
                if (
                    epicState1 &&
                    epicState1.type === 'WRONG_BELIEF_MECHANICS' &&
                    'state_1_render_spec' in epicState1 &&
                    epicState1.state_1_render_spec
                ) {
                    if (!panelAConfig.epic_l_path || typeof panelAConfig.epic_l_path !== 'object') {
                        panelAConfig.epic_l_path = { states: {} };
                    }
                    const epl = panelAConfig.epic_l_path as Record<string, unknown>;
                    if (!epl.states || typeof epl.states !== 'object') {
                        epl.states = {};
                    }
                    const states = epl.states as Record<string, Record<string, unknown>>;

                    const specPattern = epicState1.state_1_render_spec.pattern;
                    const patternToScenario: Record<string, string> = {
                        naive_scalar_addition: 'va_wrong_always_larger',
                        always_larger_resultant: 'va_wrong_always_larger',
                        generic: 'va_wrong_always_larger',
                    };
                    const injectedScenario = patternToScenario[specPattern] ?? epicCScenarios[0];

                    states.STATE_1 = {
                        label: epicState1.caption,
                        what_student_sees: epicState1.caption,
                        physics_layer: {
                            scenario: injectedScenario,
                            freeze_at_t: 0,
                            ...(epicState1.state_1_render_spec as unknown as Record<string, unknown>),
                        },
                    };
                    console.log(
                        `[Stage2PostProcess] injected STATE_1 from state_1_render_spec — pattern: ${specPattern} → scenario: ${injectedScenario}`
                    );
                }
            }

            // ── Assemble HTML for each panel using the correct renderer assembler ──
            const assembleHtmlForRenderer = (cfg: Record<string, unknown>, renderer: string): string => {
                switch (renderer) {
                    case 'mechanics_2d':
                        return assembleMechanics2DHtml(cfg as unknown as import("@/lib/renderers/mechanics_2d_renderer").Mechanics2DConfig);
                    case 'graph_interactive':
                        return assembleGraphHTML(cfg);
                    case 'circuit_live':
                        return assembleCircuitLiveHtml(cfg, conceptIdForLookup);
                    case 'wave_canvas':
                        return assembleWaveCanvasHtml(cfg as unknown as import("@/lib/renderers/wave_canvas_renderer").WaveCanvasConfig);
                    case 'optics_ray':
                        return assembleOpticsRayHtml(cfg as unknown as import("@/lib/renderers/optics_ray_renderer").OpticsRayConfig);
                    case 'field_3d':
                        return assembleField3DHtml(cfg as unknown as import("@/lib/renderers/field_3d_renderer").Field3DConfig);
                    case 'thermodynamics':
                        return assembleThermodynamicsHtml(cfg as unknown as import("@/lib/renderers/thermodynamics_renderer").ThermodynamicsConfig);
                    case 'particle_field':
                    default:
                        return assembleRendererHTML(cfg as unknown as ParticleFieldConfig, physicsConstants?.animation_constraints ?? null);
                }
            };

            const panelAHtml = assembleHtmlForRenderer(panelAConfig, rendererA);
            const panelBHtml = assembleHtmlForRenderer(panelBConfig, rendererB);

            // Build state list from actual Stage 2 output — not hardcoded placeholders
            const panelAStates = (panelAConfig?.epic_l_path as any)?.states ?? {};
            const panelBStates = (panelBConfig?.states) as Record<string, any> ?? {};
            const stateIds = Object.keys(panelAStates)
                .filter(k => k.startsWith('STATE_'))
                .sort((a, b) => parseInt(a.replace('STATE_', '')) - parseInt(b.replace('STATE_', '')));

            const multiSpec: StateMachineSpec = {
                concept,
                total_states: stateIds.length,
                states: stateIds.map((id) => {
                    const panelA = panelAStates[id] ?? {};
                    const panelB = panelBStates[id] ?? {};
                    const leftDesc = panelA.what_student_sees ?? panelA.label ?? '';
                    const rightDesc = panelB.label ?? '';
                    const combinedDesc = rightDesc
                        ? `RIGHT PANEL (graph): ${rightDesc} | LEFT PANEL (simulation): ${leftDesc}`
                        : leftDesc;
                    return {
                        id,
                        name: panelA.label ?? id,
                        show: [],
                        hide: [],
                        what_student_sees: combinedDesc,
                        visible_label: panelA.label ?? id,
                    };
                }),
            };
            const scriptResult = await generateScriptFromSimulation(
                multiSpec, concept, classLevel, conceptIdForLookup,
                ctx.question, ctx.simulation_emphasis, epicState1
            );

            // Cache multi_panel result (Stage 2 path)
            const shouldCacheStage2Multi = conceptKey !== 'unknown' && !(cacheKey?.startsWith('unknown|'));
            if (shouldCacheStage2Multi && cacheKey) {
                void supabaseAdmin
                    .from("simulation_cache")
                    .upsert({
                        concept_key: fingerprint?.concept_id ?? conceptKey,
                        fingerprint_key: cacheKey,
                        physics_config: panelAConfig,
                        sim_brief: brief,
                        sim_html: panelAHtml,
                        secondary_sim_html: panelBHtml,
                        teacher_script: scriptResult?.steps ?? null,
                        concept_id: conceptIdForLookup,
                        engine: 'p5js',
                        class_level: fingerprint?.class_level ?? classLevel,
                        served_count: 0,
                        pipeline_version: "v5-multipanel-stage2",
                        sim_code: "",
                        sim_type: "multi_panel",
                        renderer_type: modifiedJson.technology_config?.renderer_a ?? "mechanics_2d",
                    }, { onConflict: "fingerprint_key" })
                    .then(({ error }) => {
                        if (error) console.error("[aiSimGen] multi_panel (stage2) cache save failed:", error.message);
                        else console.log("[aiSimGen] multi_panel (stage2) cached:", cacheKey);
                    });
            }

            return {
                type: 'multi_panel' as const,
                panel_a: { ...panelAConfig, simHtml: panelAHtml },
                panel_b: { ...panelBConfig, simHtml: panelBHtml },
                sync_required: modifiedJson.technology_config.sync_required,
                primary_panel: modifiedJson.panel_assignment?.primary_panel ?? 'panel_a',
                shared_states: stateIds,
                brief,
                teacherScript: scriptResult?.steps ?? null,
                fromCache: false,
                conceptKey,
            };
        }
    }

    // ── Renderer routing — modifiedJson.technology_config.renderer_a is authoritative ────────
    // The JSON Modifier reads renderer_a from concept_panel_config (the DB source of truth).
    // We use that value directly. resolveRendererType() is only a fallback when the field
    // is missing (e.g. concept not yet in concept_panel_config).
    const rendererFromModifiedJson = modifiedJson.technology_config?.renderer_a as string | undefined;
    const rendererType = (rendererFromModifiedJson && rendererFromModifiedJson.length > 0)
        ? rendererFromModifiedJson as ReturnType<typeof resolveRendererType>
        : resolveRendererType(conceptIdForLookup);
    console.log("[v5] renderer:", rendererType, "for concept:", conceptIdForLookup,
        rendererFromModifiedJson ? "(from modifiedJson.technology_config.renderer_a)" : "(fallback: resolveRendererType)");

    if (rendererType === "graph_interactive") {
        return await runGraphPipeline(brief, concept, classLevel, conceptIdForLookup, fingerprint ?? null, cacheKey, conceptKey, startTime, ctx.question, ctx.simulation_emphasis, panelConfig ?? null, epicState1, examMode);
    }

    // ── Circuit-live renderer pipeline ──────────────────────────────────────
    // Any concept whose rendererType resolved to "circuit_live" uses the
    // circuit_live_renderer.js path.  This includes all entries in
    // CONCEPT_RENDERER_MAP (ohms_law, kirchhoffs_laws, wheatstone_bridge, etc.)
    // as well as any concept whose id starts with a circuit_live key.
    if (rendererType === "circuit_live") {
        console.log("[v5] circuit_live_renderer pipeline for concept:", conceptIdForLookup);
        try {
            const circuitResult = await generateCircuitSimConfig(ctx, fingerprint);
            if (!circuitResult || !circuitResult.config) {
                throw new Error("[circuit_live] generateCircuitSimConfig returned null config");
            }
            const simHtml = assembleCircuitLiveHtml(circuitResult.config, conceptIdForLookup);

            // Cache the HTML too (so the next request gets a fast cache hit via sim_html)
            if (!circuitResult.fromCache) {
                void supabaseAdmin
                    .from("simulation_cache")
                    .update({ sim_html: simHtml })
                    .eq("fingerprint_key", circuitResult.cacheKey)
                    .then(({ error: e }) => {
                        if (e) console.warn("[circuit_live] HTML cache update failed:", e.message);
                    });
            }

            // Build a StateMachineSpec from the CircuitSimulationConfig so Stage 4
            // can generate a proper teacher script instead of receiving null/undefined.
            const circuitStates = Object.entries(circuitResult.config.states || {});
            const circuitStateMachineSpec: StateMachineSpec = {
                concept,
                total_states: circuitStates.length,
                states: circuitStates.map(([id, s]) => ({
                    id,
                    name: (s as { caption?: string }).caption ?? id,
                    show: [],
                    hide: [],
                    what_student_sees: (s as { caption?: string }).caption ?? `Circuit state ${id}`,
                    visible_label: (s as { caption?: string }).caption ?? id,
                })),
            };

            console.log("[v5] Stage 4: generating teacher script for circuit_live sim...");
            const circuitScriptResult = await generateScriptFromSimulation(
                circuitStateMachineSpec, concept, classLevel, conceptIdForLookup, ctx.question, ctx.simulation_emphasis
            );
            const circuitTeacherScript = circuitScriptResult?.steps ?? null;

            return {
                physicsConfig: circuitResult.config as unknown as PhysicsConfig,
                engine: "p5js" as SimEngine,
                brief,
                simHtml,
                teacherScript: circuitTeacherScript,
                fromCache: circuitResult.fromCache,
                conceptKey,
            };
        } catch (err) {
            console.error("[v5] circuit_live pipeline failed, falling through to particle_field:", err);
            // Fall through to the existing particle_field path as safety net
        }
    }

    // ── Strict-engines bypass (PCPL parametric OR mechanics_2d) ────────────
    // Fires only when the concept JSON meets the v2 data-driven spec via
    // hasCompleteAtomicPayload (scene_composition >= 3 primitives per state,
    // focal_primitive_id set, >= 2 distinct advance_modes, >= 4 epic_c branches).
    // Self-contained — skips Stage 1/2/3B/4. CH8 hardcoded bypass removed
    // 2026-04-19 as part of Phase A tightening.
    const atomicGatePasses = hasCompleteAtomicPayload(physicsConstants);
    if (atomicGatePasses) {
        console.log(`[pcpl] strict-engines bypass (content gate) for concept:`, conceptIdForLookup);
        try {
            const rawConceptJson = await loadConstants(conceptIdForLookup) as unknown;
            const { json: mergedConceptJson, canvasStyle } = applyBoardMode(rawConceptJson, examMode);
            const conceptJson = mergedConceptJson as
                { epic_l_path?: { states?: Record<string, unknown> } } | null;
            const epicL = conceptJson?.epic_l_path ?? null;
            const allStates = epicL?.states ?? {};
            const stateKeys = Object.keys(allStates);

            // Pick first state with a force_arrow; fall back to first state
            let chosenStateKey: string | null = stateKeys[0] ?? null;
            for (const k of stateKeys) {
                const sc = (allStates[k] as { scene_composition?: Array<{ type?: string }> }).scene_composition ?? [];
                if (sc.some(p => p.type === 'force_arrow')) { chosenStateKey = k; break; }
            }
            const scene = chosenStateKey
                ? ((allStates[chosenStateKey] as { scene_composition?: unknown[] }).scene_composition ?? [])
                : [];

            const defaultVariables: Record<string, number> =
                conceptIdForLookup === 'contact_forces' ? { N: 20, f: 15 } :
                conceptIdForLookup === 'normal_reaction' ? { m: 2, theta: 30 } :
                conceptIdForLookup === 'tension_in_string' ? { m1: 2, m2: 1 } :
                { m: 1 };
            const parametricConfig = {
                concept_id: conceptIdForLookup,
                scene_composition: scene,
                states: allStates as Record<string, { scene_composition?: unknown[] }>,
                default_variables: defaultVariables,
                current_state: chosenStateKey ?? 'STATE_1',
                canvas_style: canvasStyle,
            };

            // Assembler selection: Ch.8 uses parametric_renderer (force_arrow,
            // block, pulley etc.); non-CH8 atomic concepts (e.g. vector splits)
            // use mechanics_2d assembler with the same epic_l_path shape.
            const simHtml = PCPL_CONCEPTS.has(conceptIdForLookup)
                ? assembleParametricHtml(parametricConfig)
                : assembleMechanics2DHtml({
                    renderer: 'mechanics_2d',
                    renderer_hint: (physicsConstants as { renderer_hint?: unknown })?.renderer_hint ?? {
                        scenario_type: conceptIdForLookup,
                        panel_count: 1,
                        sync_required: true,
                    },
                    epic_l_path: { states: allStates },
                    pvl_colors: { background: '#0A0A1A', text: '#D4D4D8' },
                    locked_facts: (physicsConstants as { locked_facts?: unknown })?.locked_facts ?? {},
                } as unknown as import("@/lib/renderers/mechanics_2d_renderer").Mechanics2DConfig);

            // Build teacher script from pre-authored tts_sentences across ALL states (zero LLM).
            const pmTeacherSteps: TeacherScriptStep[] = [];
            let stepNum = 1;
            for (const [stateId, stateObj] of Object.entries(allStates)) {
                const st = stateObj as {
                    title?: string;
                    label?: string;
                    teacher_script?: { tts_sentences?: unknown[] };
                };
                const tts = st.teacher_script?.tts_sentences ?? [];
                for (const item of tts) {
                    const text = extractTtsText(item);
                    if (!text) continue;
                    pmTeacherSteps.push({
                        step_number: stepNum++,
                        title: st.title ?? st.label ?? stateId,
                        text,
                        sim_state: stateId,
                        key_term: '',
                    });
                }
            }
            const pmTeacherScript: TeacherScriptStep[] | null =
                pmTeacherSteps.length > 0 ? pmTeacherSteps : null;

            // Cache the strict-engines result. Without this, every request
            // re-runs the bypass (zero AI cost but ~40s HTML assembly).
            // Mirror the v5-mechanics_2d cache-write pattern at line ~6042,
            // including the fallback-label guard.
            const bypassStatesForGuard = allStates as Record<string, { label?: string }>;
            const bypassIsFallback = Object.values(bypassStatesForGuard).some(
                (s) => typeof s?.label === 'string' && s.label.startsWith('Simulation temporarily unavailable'),
            );
            const bypassShouldCache = conceptKey !== 'unknown' && !(cacheKey?.startsWith('unknown|'));
            if (!bypassShouldCache) {
                console.warn('[pcpl] ⚠️ Refusing to cache \'unknown\' concept');
            } else if (bypassIsFallback) {
                console.warn(`[pcpl] ⚠️ Refusing to cache fallback config for "${conceptKey}"`);
            } else {
                const rendererTypeForCache = PCPL_CONCEPTS.has(conceptIdForLookup) ? 'parametric' : 'mechanics_2d';
                const bypassUpsertPayload: Record<string, unknown> = {
                    concept_key: fingerprint?.concept_id ?? conceptKey,
                    concept_id: fingerprint?.concept_id ?? conceptIdForLookup,
                    fingerprint_key: cacheKey,
                    physics_config: parametricConfig,
                    sim_brief: brief,
                    sim_html: simHtml,
                    teacher_script: pmTeacherScript ?? null,
                    engine: 'p5js',
                    class_level: fingerprint?.class_level ?? classLevel,
                    served_count: 0,
                    pipeline_version: 'v5-strict-engines',
                    sim_type: 'single_panel',
                    renderer_type: rendererTypeForCache,
                    truth_anchor_passed: true,
                    quality_score: 0,
                };
                if (fingerprint) {
                    bypassUpsertPayload.intent = fingerprint.intent;
                    bypassUpsertPayload.mode = fingerprint.mode;
                    bypassUpsertPayload.aspect = fingerprint.aspect;
                    bypassUpsertPayload.ncert_chapter = fingerprint.ncert_chapter;
                    bypassUpsertPayload.variables_changing = fingerprint.variables_changing;
                    bypassUpsertPayload.confidence = fingerprint.confidence;
                }
                const bypassConflictCol = fingerprint ? 'fingerprint_key' : 'concept_key,class_level';
                const { error: bypassCacheErr } = await supabaseAdmin
                    .from('simulation_cache')
                    .upsert(bypassUpsertPayload, { onConflict: bypassConflictCol });
                if (bypassCacheErr) {
                    console.error('[pcpl] ⚠️ CACHE SAVE FAILED:', bypassCacheErr.message);
                } else {
                    console.log('[pcpl] ✅ CACHED (strict-engines):', conceptKey);
                }
            }

            return {
                physicsConfig: parametricConfig as unknown as PhysicsConfig,
                engine: "p5js" as SimEngine,
                brief,
                simHtml,
                teacherScript: pmTeacherScript,
                fromCache: false,
                conceptKey,
            };
        } catch (err) {
            console.error("[pcpl] parametric pipeline failed, falling through to particle_field:", err);
            // Fall through to existing pipelines as safety net
        }
    }

    // ── Mechanics 2D renderer pipeline ─────────────────────────────────────
    if (rendererType === "mechanics_2d") {
        console.log("[v5] mechanics_2d pipeline for concept:", conceptIdForLookup);
        try {
            const mechConfig = await generateMechanics2DConfig(brief, conceptIdForLookup, ctx);
            const mechConfigFinal = applyRendererModifier({
                config: mechConfig as unknown as Record<string, unknown>,
                renderer: "mechanics_2d",
                scenario: MECHANICS_SCENARIO_MAP[conceptIdForLookup] ?? undefined,
                concept_id: conceptIdForLookup,
            }) as unknown as typeof mechConfig;
            let simHtml = assembleMechanics2DHtml(mechConfigFinal);

            // Syntax-check the assembled HTML; retry config generation once on failure
            if (!validateGeneratedHTML(simHtml)) {
                console.warn("[v5] mechanics_2d syntax error — retrying config generation");
                const retryConfig = await generateMechanics2DConfig(brief, conceptIdForLookup, ctx);
                const retryFinal = applyRendererModifier({
                    config: retryConfig as unknown as Record<string, unknown>,
                    renderer: "mechanics_2d",
                    scenario: MECHANICS_SCENARIO_MAP[conceptIdForLookup] ?? undefined,
                    concept_id: conceptIdForLookup,
                }) as unknown as typeof mechConfig;
                simHtml = assembleMechanics2DHtml(retryFinal);
                if (!validateGeneratedHTML(simHtml)) {
                    console.error("[v5] mechanics_2d syntax error persists after retry — proceeding (fallback SIM_READY will fire)");
                }
            }

            const mechStates = Object.entries(mechConfigFinal.states || {});
            const mechSpec: StateMachineSpec = {
                concept,
                total_states: mechStates.length,
                states: mechStates.map(([id, s]) => ({
                    id,
                    name: (s as MechanicsState).label ?? id,
                    show: [],
                    hide: [],
                    what_student_sees: (s as MechanicsState).what_student_sees ?? (s as MechanicsState).label ?? id,
                    visible_label: (s as MechanicsState).label ?? id,
                })),
            };

            console.log("[v5] Stage 4: generating teacher script for mechanics_2d sim...");
            const mechScriptResult = await generateScriptFromSimulation(
                mechSpec, concept, classLevel, conceptIdForLookup, ctx.question, ctx.simulation_emphasis
            );
            const mechTeacherScript = mechScriptResult?.steps ?? null;

            // Cache the single-panel mechanics_2d result. Without this, every
            // request for a single-panel mechanics_2d concept re-runs the full
            // pipeline (~50-75s + Sonnet + Flash cost). Mirror the particle_field
            // path's cache write at line ~6388 + include the fallback-config
            // guard (GENERIC_FALLBACK_CONFIG has label "Simulation temporarily
            // unavailable" on every state — refuse to cache those).
            const mechStatesForGuard = (mechConfigFinal as { states?: Record<string, { label?: string }> }).states ?? {};
            const mechIsFallback = Object.values(mechStatesForGuard).some(
                (s) => typeof s?.label === "string" && s.label.startsWith("Simulation temporarily unavailable"),
            );
            const mechShouldCache = conceptKey !== 'unknown' && !(cacheKey?.startsWith('unknown|'));
            if (!mechShouldCache) {
                console.warn("[v5-mechanics_2d] ⚠️ Refusing to cache 'unknown' concept");
            } else if (mechIsFallback) {
                console.warn(`[v5-mechanics_2d] ⚠️ Refusing to cache fallback config for "${conceptKey}"`);
            } else {
                const mechUpsertPayload: Record<string, unknown> = {
                    concept_key: fingerprint?.concept_id ?? conceptKey,
                    concept_id: fingerprint?.concept_id ?? conceptIdForLookup,
                    fingerprint_key: cacheKey,
                    physics_config: mechConfigFinal,
                    sim_brief: brief,
                    sim_html: simHtml,
                    teacher_script: mechTeacherScript ?? null,
                    engine: "p5js",
                    class_level: fingerprint?.class_level ?? classLevel,
                    served_count: 0,
                    pipeline_version: 'v5-mechanics_2d',
                    sim_type: 'single_panel',
                    renderer_type: 'mechanics_2d',
                    truth_anchor_passed: true,
                    quality_score: 0,
                };
                if (fingerprint) {
                    mechUpsertPayload.intent = fingerprint.intent;
                    mechUpsertPayload.mode = fingerprint.mode;
                    mechUpsertPayload.aspect = fingerprint.aspect;
                    mechUpsertPayload.ncert_chapter = fingerprint.ncert_chapter;
                    mechUpsertPayload.variables_changing = fingerprint.variables_changing;
                    mechUpsertPayload.confidence = fingerprint.confidence;
                }
                const mechConflictCol = fingerprint ? "fingerprint_key" : "concept_key,class_level";
                const { error: mechCacheErr } = await supabaseAdmin
                    .from("simulation_cache")
                    .upsert(mechUpsertPayload, { onConflict: mechConflictCol });
                if (mechCacheErr) {
                    console.error("[v5-mechanics_2d] ⚠️ CACHE SAVE FAILED:", mechCacheErr.message);
                } else {
                    console.log("[v5-mechanics_2d] ✅ CACHED:", conceptKey);
                }
            }

            return {
                physicsConfig: mechConfigFinal as unknown as PhysicsConfig,
                engine: "p5js" as SimEngine,
                brief,
                simHtml,
                teacherScript: mechTeacherScript,
                fromCache: false,
                conceptKey,
            };
        } catch (err) {
            console.error("[v5] mechanics_2d pipeline failed, falling through to particle_field:", err);
            // Fall through to particle_field as safety net
        }
    }

    // ── Wave Canvas renderer pipeline ────────────────────────────────────────
    if (rendererType === "wave_canvas") {
        console.log("[v5] wave_canvas pipeline for concept:", conceptIdForLookup);
        try {
            const waveConfig = await generateWaveCanvasConfig(brief, conceptIdForLookup, ctx);
            const waveConfigFinal = applyRendererModifier({
                config: waveConfig as unknown as Record<string, unknown>,
                renderer: "wave_canvas",
                scenario: undefined,
                concept_id: conceptIdForLookup,
            }) as unknown as typeof waveConfig;
            const simHtml = assembleWaveCanvasHtml(waveConfigFinal);

            const waveStates = Object.entries(waveConfigFinal.states || {});
            const waveSpec: StateMachineSpec = {
                concept,
                total_states: waveStates.length,
                states: waveStates.map(([id, s]) => ({
                    id,
                    name: s.label ?? id,
                    show: [],
                    hide: [],
                    what_student_sees: s.caption ?? s.label ?? id,
                    visible_label: s.label ?? id,
                })),
            };

            console.log("[v5] Stage 4: generating teacher script for wave_canvas sim...");
            const waveScriptResult = await generateScriptFromSimulation(
                waveSpec, concept, classLevel, conceptIdForLookup, ctx.question, ctx.simulation_emphasis
            );
            const waveTeacherScript = waveScriptResult?.steps ?? null;

            return {
                physicsConfig: waveConfigFinal as unknown as PhysicsConfig,
                engine: "p5js" as SimEngine,
                brief,
                simHtml,
                teacherScript: waveTeacherScript,
                fromCache: false,
                conceptKey,
            };
        } catch (err) {
            console.error("[v5] wave_canvas pipeline failed, falling through to particle_field:", err);
            // Fall through to particle_field as safety net
        }
    }

    // ── Optics Ray renderer pipeline ──────────────────────────────────────────
    if (rendererType === "optics_ray") {
        console.log("[v5] optics_ray pipeline for concept:", conceptIdForLookup);
        try {
            const opticsConfig = await generateOpticsRayConfig(brief, conceptIdForLookup, ctx);
            const opticsConfigFinal = applyRendererModifier({
                config: opticsConfig as unknown as Record<string, unknown>,
                renderer: "optics_ray",
                scenario: undefined,
                concept_id: conceptIdForLookup,
            }) as unknown as typeof opticsConfig;
            const simHtml = assembleOpticsRayHtml(opticsConfigFinal);

            const opticsStates = Object.entries(opticsConfigFinal.states || {});
            const opticsSpec: StateMachineSpec = {
                concept,
                total_states: opticsStates.length,
                states: opticsStates.map(([id, s]) => ({
                    id,
                    name: s.label ?? id,
                    show: [],
                    hide: [],
                    what_student_sees: s.caption ?? s.label ?? id,
                    visible_label: s.label ?? id,
                })),
            };

            console.log("[v5] Stage 4: generating teacher script for optics_ray sim...");
            const opticsScriptResult = await generateScriptFromSimulation(
                opticsSpec, concept, classLevel, conceptIdForLookup, ctx.question, ctx.simulation_emphasis
            );
            const opticsTeacherScript = opticsScriptResult?.steps ?? null;

            return {
                physicsConfig: opticsConfigFinal as unknown as PhysicsConfig,
                engine: "p5js" as SimEngine,
                brief,
                simHtml,
                teacherScript: opticsTeacherScript,
                fromCache: false,
                conceptKey,
            };
        } catch (err) {
            console.error("[v5] optics_ray pipeline failed, falling through to particle_field:", err);
            // Fall through to particle_field as safety net
        }
    }

    // ── Field 3D (Three.js) renderer pipeline ─────────────────────────────────
    if (rendererType === "field_3d") {
        console.log("[v5] field_3d pipeline for concept:", conceptIdForLookup);
        try {
            const field3dConfig = await generateField3DConfig(brief, conceptIdForLookup, ctx);
            const field3dConfigFinal = applyRendererModifier({
                config: field3dConfig as unknown as Record<string, unknown>,
                renderer: "field_3d",
                scenario: MECHANICS_SCENARIO_MAP[conceptIdForLookup] ?? undefined,
                concept_id: conceptIdForLookup,
            }) as unknown as typeof field3dConfig;
            const simHtml = assembleField3DHtml(field3dConfigFinal);

            const field3dStates = Object.entries(field3dConfigFinal.states || {});
            const field3dSpec: StateMachineSpec = {
                concept,
                total_states: field3dStates.length,
                states: field3dStates.map(([id, s]) => ({
                    id,
                    name: s.label ?? id,
                    show: [],
                    hide: [],
                    what_student_sees: s.caption ?? s.label ?? id,
                    visible_label: s.label ?? id,
                })),
            };

            console.log("[v5] Stage 4: generating teacher script for field_3d sim...");
            const field3dScriptResult = await generateScriptFromSimulation(
                field3dSpec, concept, classLevel, conceptIdForLookup, ctx.question, ctx.simulation_emphasis
            );
            const field3dTeacherScript = field3dScriptResult?.steps ?? null;

            return {
                physicsConfig: field3dConfigFinal as unknown as PhysicsConfig,
                engine: "threejs" as SimEngine,
                brief,
                simHtml,
                teacherScript: field3dTeacherScript,
                fromCache: false,
                conceptKey,
            };
        } catch (err) {
            console.error("[v5] field_3d pipeline failed, falling through to particle_field:", err);
            // Fall through to particle_field as safety net
        }
    }

    // ── Thermodynamics (p5.js + Plotly) renderer pipeline ─────────────────────
    if (rendererType === "thermodynamics") {
        console.log("[v5] thermodynamics pipeline for concept:", conceptIdForLookup);
        try {
            const thermoConfig = await generateThermodynamicsConfig(brief, conceptIdForLookup, ctx);
            const thermoConfigFinal = applyRendererModifier({
                config: thermoConfig as unknown as Record<string, unknown>,
                renderer: "thermodynamics",
                scenario: undefined,
                concept_id: conceptIdForLookup,
            }) as unknown as typeof thermoConfig;
            const simHtml = assembleThermodynamicsHtml(thermoConfigFinal);

            const thermoStates = Object.entries(thermoConfigFinal.states || {});
            const thermoSpec: StateMachineSpec = {
                concept,
                total_states: thermoStates.length,
                states: thermoStates.map(([id, s]) => ({
                    id,
                    name: s.label ?? id,
                    show: [],
                    hide: [],
                    what_student_sees: s.caption ?? s.label ?? id,
                    visible_label: s.label ?? id,
                })),
            };

            console.log("[v5] Stage 4: generating teacher script for thermodynamics sim...");
            const thermoScriptResult = await generateScriptFromSimulation(
                thermoSpec, concept, classLevel, conceptIdForLookup, ctx.question, ctx.simulation_emphasis
            );
            const thermoTeacherScript = thermoScriptResult?.steps ?? null;

            return {
                physicsConfig: thermoConfigFinal as unknown as PhysicsConfig,
                engine: "p5js" as SimEngine,
                brief,
                simHtml,
                teacherScript: thermoTeacherScript,
                fromCache: false,
                conceptKey,
            };
        } catch (err) {
            console.error("[v5] thermodynamics pipeline failed, falling through to particle_field:", err);
            // Fall through to particle_field as safety net
        }
    }

    // ── Concept-specific p5.js path: for concepts that don't fit particle_field ──
    // If the Brief (now guided by concept-specific instructions) requests a visualization
    // type other than particle_flow, use AI-generated p5.js instead of the rigid particle_field renderer.
    const conceptGuidance = getConceptSimGuidance(conceptIdForLookup);
    const isDriftVelocityConcept = conceptIdForLookup.includes("drift_velocity") || conceptIdForLookup.includes("drift_speed");

    if (conceptGuidance && !isDriftVelocityConcept) {
        console.log("[v5] Concept has specific guidance (viz_type:", brief.visualization_type, ") — using concept-specific p5.js path");
        const conceptStateDescs = getConceptStateDescriptions(conceptIdForLookup);
        const defaultStates: Record<string, Record<string, unknown>> = {
            STATE_1: { label: conceptStateDescs?.STATE_1 ?? "Initial setup — observe the apparatus" },
            STATE_2: { label: conceptStateDescs?.STATE_2 ?? "Main physics activated — see the concept in action" },
            STATE_3: { label: conceptStateDescs?.STATE_3 ?? "Key insight revealed — aha moment" },
            STATE_4: { label: conceptStateDescs?.STATE_4 ?? "Interactive mode — experiment with sliders" },
        };
        const conceptResult = await generateConceptPrimaryHtml(brief, conceptIdForLookup, defaultStates, ctx.simulation_emphasis, epicState1);
        if (conceptResult) {
            console.log("[Validator] PASSED — concept-specific p5.js generated successfully");
            const simHtml = conceptResult.html;
            const engine: SimEngine = "p5js";
            const physicsConfig = {} as PhysicsConfig;

            const stateMachineSpec: StateMachineSpec = {
                concept: brief.concept,
                total_states: 4,
                states: ["STATE_1", "STATE_2", "STATE_3", "STATE_4"].map((id, i) => ({
                    id,
                    name: conceptResult.stateLabels[i] ?? id,
                    show: [],
                    hide: [],
                    what_student_sees: conceptResult.stateLabels[i] ?? `State ${i + 1}`,
                    visible_label: conceptResult.stateLabels[i] ?? `State ${i + 1}`,
                })),
            };
            console.log("[v5] Stage 4: generating teacher script for concept-specific sim...");
            const scriptResult = await generateScriptFromSimulation(stateMachineSpec, concept, classLevel, conceptIdForLookup, ctx.question, ctx.simulation_emphasis, epicState1);
            const teacherScript = scriptResult?.steps ?? null;

            console.log("[v5] ✅ CONCEPT-SPECIFIC PIPELINE COMPLETE:", {
                vizType: brief.visualization_type,
                simHtmlLen: simHtml.length,
                scriptSteps: teacherScript?.length ?? 0,
                latencyMs: Date.now() - startTime,
            });

            // Cache
            const upsertPayload: Record<string, unknown> = {
                concept_key: fingerprint?.concept_id ?? conceptKey,
                fingerprint_key: cacheKey,
                physics_config: physicsConfig,
                sim_brief: brief,
                sim_html: simHtml,
                teacher_script: teacherScript ?? null,
                engine,
                class_level: fingerprint?.class_level ?? classLevel,
                served_count: 0,
                pipeline_version: 'v5-concept',
                sim_code: '',
                sim_type: brief.visualization_type,
                renderer_type: brief.visualization_type ?? 'p5js',
                truth_anchor_passed: null, // concept-specific pipeline skips truth anchor
                quality_score: 0,
            };
            if (fingerprint) {
                upsertPayload.intent = fingerprint.intent;
                upsertPayload.mode = fingerprint.mode;
                upsertPayload.aspect = fingerprint.aspect;
                upsertPayload.ncert_chapter = fingerprint.ncert_chapter;
                upsertPayload.variables_changing = fingerprint.variables_changing;
                upsertPayload.confidence = fingerprint.confidence;
            }
            // FIX C: Never cache simulations with concept_key "unknown"
            const shouldCacheConcept = conceptKey !== 'unknown' && !(cacheKey?.startsWith('unknown|'));
            if (!shouldCacheConcept) {
                console.warn("[aiSimGen] ⚠️ Refusing to cache 'unknown' concept — would poison future lookups");
            } else {
                const conflictCol = fingerprint ? "fingerprint_key" : "concept_key,class_level";
                const { error: cacheError } = await supabaseAdmin
                    .from("simulation_cache")
                    .upsert(upsertPayload, { onConflict: conflictCol });
                if (cacheError) {
                    console.error("[aiSimGen] ⚠️ CACHE SAVE FAILED:", cacheError.message);
                } else {
                    console.log("[aiSimGen] ✅ CACHED (v5-concept):", conceptKey);
                }
            }

            logUsage({
                taskType: "simulation_generation",
                provider: "google",
                model: "gemini-2.5-flash",
                inputChars: (concept + question).length,
                outputChars: simHtml.length,
                latencyMs: Date.now() - startTime,
                estimatedCostUsd: (concept + question).length / 1_000_000 * 0.5 + simHtml.length / 1_000_000 * 0.5,
                wasCacheHit: false,
                fingerprintKey: cacheKey ?? undefined,
            });

            return { physicsConfig, engine, brief, simHtml, teacherScript, fromCache: false, conceptKey };
        }
        console.warn("[v5] Concept-specific p5.js generation failed, falling back to particle_field...");
    }

    // ── particle_field path: for drift velocity and concepts without specific guidance ──
    // Stage 2: Generate config JSON (Sonnet writes DSL, constrained by schema + constants)
    console.log("[v5] Stage 2: generating SimConfig (particle_field)...");
    const epicCVecA = (epicState1 as unknown as { state_1_render_spec?: { vector_a?: { magnitude?: number } } })?.state_1_render_spec?.vector_a?.magnitude;
    const epicCVecB = (epicState1 as unknown as { state_1_render_spec?: { vector_b?: { magnitude?: number } } })?.state_1_render_spec?.vector_b?.magnitude;
    let rendererConfig = await generateSimConfig(brief, physicsConstants, conceptIdForLookup, ctx.simulation_emphasis, ctx.student_belief, modifiedJson, variant, epicCVecA, epicCVecB);

    // ── EPIC-C: stamp protocol markers so the validator knows to skip STATE_1 ──
    if (modifiedJson.is_epic_c) {
        (rendererConfig as unknown as Record<string, unknown>).epic_mode = 'EPIC_C';
        (rendererConfig as unknown as Record<string, unknown>).state1_is_wrong_belief = true;
        console.log('[EPIC-C] Stamped epic_mode=EPIC_C and state1_is_wrong_belief=true onto rendererConfig');
    }

    console.log("═══════════════════════════════════════════════════════");
    console.log("[v5 STAGE 2 -- SimConfig]");
    console.log(JSON.stringify(rendererConfig, null, 2));
    console.log("═══════════════════════════════════════════════════════");

    // Stage 3: Physics validator (pure code, <1ms, no AI cost)
    if (physicsConstants) {
        const validation: ValidationResult = validatePhysics(rendererConfig, physicsConstants, conceptIdForLookup);
        if (!validation.valid) {
            console.warn("[v5-Stage3] ❌ PHYSICS VALIDATION FAILED:", validation.errors);
            // Retry Stage 2 with error context
            console.log("[v5-Stage3] Retrying Stage 2 with validation errors...");
            const retryConfig = await generateSimConfig(brief, physicsConstants, conceptIdForLookup, ctx.simulation_emphasis, ctx.student_belief, modifiedJson, variant, epicCVecA, epicCVecB);
            // Re-stamp EPIC-C markers on the retry config too
            if (modifiedJson.is_epic_c) {
                (retryConfig as unknown as Record<string, unknown>).epic_mode = 'EPIC_C';
                (retryConfig as unknown as Record<string, unknown>).state1_is_wrong_belief = true;
            }
            const retryValidation = validatePhysics(retryConfig, physicsConstants, conceptIdForLookup);
            if (retryValidation.valid) {
                console.log("[v5-Stage3] ✅ Retry passed validation");
                rendererConfig = retryConfig;
            } else {
                console.warn("[v5-Stage3] Retry also failed — using concept-appropriate fallback for:", conceptIdForLookup);
                rendererConfig = getFallbackConfig(conceptIdForLookup);
                // Fallback carries markers too so downstream assemblers are aware
                if (modifiedJson.is_epic_c) {
                    (rendererConfig as unknown as Record<string, unknown>).epic_mode = 'EPIC_C';
                    (rendererConfig as unknown as Record<string, unknown>).state1_is_wrong_belief = true;
                }
            }
        } else {
            console.log("[v5-Stage3] ✅ Physics validation PASSED");
        }
    }


    // ── Stage 3B: NCERT Truth Anchor (Phase B) ──────────────────────────────
    // Sonnet 4.6 checks each locked NCERT truth statement against the config.
    // On failure: retry Stage 2 with failure reasons (max 2 attempts).
    // On persistent failure: use fallback + flag for human review.
    // API failure always defaults to passed=true — never blocks a simulation.
    let truthAnchorPassed = true; // default true: API failure must never block pipeline
    {
        const truthResult = await checkNcertTruth(rendererConfig, conceptIdForLookup);
        if (!truthResult.passed) {
            truthAnchorPassed = false;
            console.warn("[v5-TruthAnchor] FAILED:", truthResult.failures);
            let anchored = false;
            for (let attempt = 1; attempt <= 2; attempt++) {
                const failureNote =
                    `PREVIOUS CONFIG FAILED NCERT TRUTH CHECK. Fix these issues:\n` +
                    truthResult.failures.map((f, i) => `${i + 1}. ${f}`).join("\n");
                const anchoredBrief = {
                    ...brief,
                    _truthAnchorFeedback: failureNote,
                } as unknown as SimulationBrief;
                const retryConfig = await generateSimConfig(anchoredBrief, physicsConstants, conceptIdForLookup, ctx.simulation_emphasis, ctx.student_belief, modifiedJson, variant, epicCVecA, epicCVecB);
                const retryTruth = await checkNcertTruth(retryConfig, conceptIdForLookup);
                if (retryTruth.passed) {
                    console.log(`[v5-TruthAnchor] ✅ PASSED on attempt ${attempt}`);
                    rendererConfig = retryConfig;
                    anchored = true;
                    truthAnchorPassed = true;
                    break;
                }
                console.warn(`[v5-TruthAnchor] Attempt ${attempt} still failing:`, retryTruth.failures);
            }
            if (!anchored) {
                console.warn("[v5-TruthAnchor] ❌ Still failing after 2 attempts — using fallback. NEEDS HUMAN REVIEW for concept:", conceptIdForLookup);
                rendererConfig = getFallbackConfig(conceptIdForLookup);
                // Log failure to simulation_cache with quality_score=0
                await logTruthAnchorFailure(conceptKey, conceptIdForLookup, classLevel, cacheKey, fingerprint ?? null);
            }
        } else {
            console.log("[v5-TruthAnchor] ✅ PASSED");
        }
    }

    // Assemble HTML: inject config into pre-built renderer (zero AI, zero crashes)
    const rendererConfigFinal = applyRendererModifier({
        config: rendererConfig as unknown as Record<string, unknown>,
        renderer: rendererType as string,
        scenario: MECHANICS_SCENARIO_MAP[conceptIdForLookup] ?? undefined,
        concept_id: conceptIdForLookup,
    }) as unknown as typeof rendererConfig;
    const simHtml = assembleRendererHTML(rendererConfigFinal, physicsConstants?.animation_constraints ?? null);
    const engine: SimEngine = "p5js";

    // Keep physicsConfig for cache compatibility
    const physicsConfig = rendererConfigFinal as unknown as PhysicsConfig;

    // Stage 4: Generate teacher script (Flash writes narration from config states)
    const stateMachineSpec = configToStateMachineSpec(rendererConfigFinal, concept);
    console.log("[v5] Stage 4: generating teacher script...");
    const scriptResult = await generateScriptFromSimulation(stateMachineSpec, concept, classLevel, conceptIdForLookup, ctx.question, ctx.simulation_emphasis, epicState1);
    const teacherScript = scriptResult?.steps ?? null;

    console.log("[v5] ✅ PIPELINE COMPLETE:", {
        states: 4,
        simHtmlLen: simHtml.length,
        scriptSteps: teacherScript?.length ?? 0,
        latencyMs: Date.now() - startTime,
    });

    // ── 4. Cache result ─────────────────────────────────────────────────────────
    const upsertPayload: Record<string, unknown> = {
        concept_key: fingerprint?.concept_id ?? conceptKey,
        // Always write the full fingerprint key so cache reads always hit.
        // cacheKey = fingerprint.cache_key (already overridden by the route to
        // match what the chat API used), not conceptKey which is a short slug.
        fingerprint_key: cacheKey,
        physics_config: physicsConfig,
        sim_brief: brief,
        sim_html: simHtml,
        teacher_script: teacherScript ?? null,
        engine,
        class_level: fingerprint?.class_level ?? classLevel,
        served_count: 0,
        pipeline_version: 'v5',
        sim_code: '',
        sim_type: '',
        renderer_type: rendererType,
        truth_anchor_passed: truthAnchorPassed,
        quality_score: 0,
    };
    if (fingerprint) {
        upsertPayload.intent = fingerprint.intent;
        upsertPayload.mode = fingerprint.mode;
        upsertPayload.aspect = fingerprint.aspect;
        upsertPayload.ncert_chapter = fingerprint.ncert_chapter;
        upsertPayload.variables_changing = fingerprint.variables_changing;
        upsertPayload.confidence = fingerprint.confidence;
    }

    // FIX C: Never cache simulations with concept_key "unknown"
    const shouldCacheV3 = conceptKey !== 'unknown' && !(cacheKey?.startsWith('unknown|'));

    // Stage 2 fallback gate: GENERIC_FALLBACK_CONFIG stamps every state with
    // label: "Simulation temporarily unavailable". Caching that row means
    // every future student for this concept+fingerprint gets the broken sim
    // back forever. Detect and refuse.
    const states = (physicsConfig as { states?: Record<string, { label?: string }> }).states ?? {};
    const isFallbackConfig = Object.values(states).some(
        (s) => typeof s?.label === "string" && s.label.startsWith("Simulation temporarily unavailable"),
    );

    if (!shouldCacheV3) {
        console.warn("[aiSimGen] ⚠️ Refusing to cache 'unknown' concept — would poison future lookups");
    } else if (isFallbackConfig) {
        console.warn(
            `[aiSimGen] ⚠️ Refusing to cache fallback config for "${conceptKey}" — ` +
            `Stage 2 both attempts failed and returned GENERIC_FALLBACK_CONFIG. ` +
            `Next request for this concept will re-try generation.`,
        );
    } else {
        const conflictCol = fingerprint ? "fingerprint_key" : "concept_key,class_level";
        const { error: cacheError } = await supabaseAdmin
            .from("simulation_cache")
            .upsert(upsertPayload, { onConflict: conflictCol });

        if (cacheError) {
            console.error("[aiSimGen] ⚠️ CACHE SAVE FAILED:", cacheError.message);
        } else {
            console.log("[aiSimGen] ✅ CACHED (v3):", conceptKey);
        }
    }

    logUsage({
        taskType: "simulation_generation",
        provider: "google",
        model: "gemini-2.5-flash+pro+flash",
        inputChars: (concept + question).length,
        outputChars: simHtml.length,
        latencyMs: Date.now() - startTime,
        estimatedCostUsd: ((concept + question).length / 1_000_000 * 0.5) + (JSON.stringify(physicsConfig).length / 1_000_000 * 15.00) + (simHtml.length / 1_000_000 * 0.5),
        wasCacheHit: false,
        fingerprintKey: cacheKey ?? undefined,
    });

    // Visual Validator (E29) — fire-and-forget, observe-only in v1.
    // Failures are recorded to engine_bug_queue + ai_usage_log without blocking
    // the user-facing return. Set SKIP_VISUAL_VALIDATION=true to disable.
    try {
        const stateIds = Object.keys(
            (physicsConfig as { states?: Record<string, unknown> }).states ?? {},
        );
        if (stateIds.length > 0) {
            runVisualValidationAsync({
                conceptId: conceptKey,
                panelAHtml: simHtml,
                stateIds,
                panelCount: 1,
                context: {
                    physics_engine_config: physicsConfig,
                    teacher_script: teacherScript ?? undefined,
                },
                sessionId: cacheKey ?? undefined,
            });
        }
    } catch (err) {
        console.warn('[aiSimGen] visual validator dispatch failed:', err instanceof Error ? err.message : err);
    }

    return { physicsConfig, engine, brief, simHtml, teacherScript, fromCache: false, conceptKey };
}
