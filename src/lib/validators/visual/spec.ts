/**
 * Visual Validator Specification — Engine E29
 *
 * Codifies the 38 visual checks across 7 categories (A–G) that gate every
 * rendered PhysicsMind simulation before it reaches a student.
 *
 * Source-of-truth for:
 *   - Vision-model prompt templates (promptTemplates.ts)
 *   - Result aggregation (visionGate.ts)
 *   - engine_bug_queue category mapping
 *   - Authoring guidance (concept JSONs must anticipate every check below)
 *
 * Companion document: physics-mind/docs/VISUAL_VALIDATOR_SPEC.md
 */

// ─── Categories ───────────────────────────────────────────────────────────────

export type VisualCategory =
    | 'A'  // Layout integrity (single panel)
    | 'B'  // Physics correctness (single panel)
    | 'C'  // Choreography correctness (across states)
    | 'D'  // Animation correctness
    | 'E'  // Pedagogical quality (act as teacher)
    | 'F'  // Panel A / Panel B bilateral sync (multi-panel only)
    | 'G'  // Panel B practical understanding (multi-panel only)
    | 'H'; // Authoring hygiene (deterministic checks — pixelGate.ts)

export const CATEGORY_NAMES: Record<VisualCategory, string> = {
    A: 'Layout integrity',
    B: 'Physics correctness',
    C: 'Choreography correctness',
    D: 'Animation correctness',
    E: 'Pedagogical quality',
    F: 'Panel A/B bilateral sync',
    G: 'Panel B practical understanding',
    H: 'Authoring hygiene',
};

// ─── Check identifiers ────────────────────────────────────────────────────────

export type VisualCheckId =
    // Category A — Layout integrity
    | 'A1' | 'A2' | 'A3' | 'A4' | 'A5' | 'A6'
    // Category B — Physics correctness
    | 'B1' | 'B2' | 'B3' | 'B4' | 'B5' | 'B6' | 'B7'
    // Category C — Choreography correctness
    | 'C1' | 'C2' | 'C3' | 'C4' | 'C5'
    // Category D — Animation correctness
    | 'D1' | 'D1p' | 'D2' | 'D3' | 'D4'
    // Category E — Pedagogical quality
    | 'E1' | 'E2' | 'E3' | 'E4' | 'E5' | 'E6'
    // Category F — Panel A/B bilateral sync
    | 'F1' | 'F2' | 'F3' | 'F4'
    // Category G — Panel B practical understanding
    | 'G1' | 'G2' | 'G3' | 'G4' | 'G5' | 'G6'
    // Category H — Authoring hygiene (pixelGate)
    | 'H1';

// ─── Bug-class taxonomy (mirrors engine_bug_queue migration) ──────────────────

export type BugClass =
    // Category A
    | 'VISUAL_TEXT_OVERLAP'
    | 'VISUAL_TEXT_INTRUDES_PRIMITIVE'
    | 'VISUAL_OUT_OF_BOUNDS'
    | 'VISUAL_LABEL_UNREADABLE'
    | 'VISUAL_OVERCROWDED'
    | 'VISUAL_ARROW_HEAD_BURIED'
    // Category B
    | 'PHYSICS_DIRECTION_WRONG'
    | 'PHYSICS_MAGNITUDE_WRONG'
    | 'PHYSICS_EQUILIBRIUM_BROKEN'
    | 'PHYSICS_GRAVITY_WRONG'
    | 'PHYSICS_NORMAL_NOT_PERPENDICULAR'
    | 'PHYSICS_FRICTION_WRONG_DIR'
    | 'PHYSICS_PHANTOM_VECTOR'
    // Category C
    | 'CHOREOGRAPHY_TELEPORT'
    | 'CHOREOGRAPHY_SCALE_DRIFT'
    | 'CHOREOGRAPHY_CAMERA_SNAP'
    | 'CHOREOGRAPHY_FOCAL_DRIFT'
    | 'CHOREOGRAPHY_ANNOTATION_FLICKER'
    // Category D
    | 'ANIMATION_NO_PLAYBACK'
    | 'ANIMATION_JITTER'
    | 'ANIMATION_TIMING_DRIFT'
    | 'ANIMATION_STUCK'
    // Category E
    | 'PEDAGOGY_CONCEPT_UNCLEAR'
    | 'PEDAGOGY_NO_FOCAL'
    | 'PEDAGOGY_NO_ANCHOR'
    | 'PEDAGOGY_EPICC_NEUTRAL_NOT_WRONG'
    | 'PEDAGOGY_FORMULA_MISSING'
    | 'PEDAGOGY_INFO_OVERLOAD'
    // Category F
    | 'DUALPANEL_STATE_DESYNC'
    | 'DUALPANEL_EQUATION_INCOHERENT'
    | 'DUALPANEL_LIVEDOT_DRIFT'
    | 'DUALPANEL_PARAM_RELAY_BROKEN'
    // Category G
    | 'DUALPANEL_AXES_UNLABELED'
    | 'DUALPANEL_RANGE_OFF'
    | 'DUALPANEL_GRID_INVISIBLE'
    | 'DUALPANEL_NO_TRACE'
    | 'DUALPANEL_LIVEDOT_OFF_GRAPH'
    | 'DUALPANEL_NO_LEGEND'
    // Category H — pixelGate deterministic checks
    | 'TEMPLATE_LEAK'
    | 'ANIMATION_NO_PLAYBACK_PIXEL';

// ─── Check spec ───────────────────────────────────────────────────────────────

/**
 * How a check is verified at runtime.
 *   - 'vision': sent to Claude Sonnet vision with screenshot(s)
 *   - 'dom':    Playwright reads DOM/postMessage events directly (exact, not visual)
 *   - 'pixel':  pixelmatch raw RGBA diff against reference frames (deterministic, free)
 *   - 'ocr':    tesseract.js text extraction from screenshots (deterministic, free)
 *
 * F1/F4 use 'dom' for ms-scale event timing. D1p (animation pixel-change) uses
 * 'pixel'. H1 (template substitution leak) uses 'ocr' as backstop alongside an
 * inline DOM scan in screenshotter.ts. Everything else uses 'vision'.
 */
export type ValidationMethod = 'vision' | 'dom' | 'pixel' | 'ocr';

export interface VisualCheckSpec {
    id: VisualCheckId;
    category: VisualCategory;
    name: string;
    /** Pass criterion — vision model uses this verbatim in the prompt */
    passCriterion: string;
    /** Bug class written to engine_bug_queue on failure */
    bugClass: BugClass;
    /** Verification path — defaults to 'vision' if omitted */
    validationMethod?: ValidationMethod;
    /** Whether this check requires multi-panel input (F, G categories) */
    multiPanelOnly?: boolean;
    /** Whether this check requires a teacher_script with duration_ms (D3) */
    requiresTimingMetadata?: boolean;
    /** Whether this check requires epic_c_branches authored (E4) */
    requiresEpicC?: boolean;
}

// ─── The 38-check rubric ──────────────────────────────────────────────────────

export const VISUAL_CHECKS: Record<VisualCheckId, VisualCheckSpec> = {
    // ── Category A — Layout integrity ────────────────────────────────────────
    A1: {
        id: 'A1', category: 'A', name: 'Text overlap',
        passCriterion: 'No text element overlaps any other text element (≥ 4px gap between bounding boxes).',
        bugClass: 'VISUAL_TEXT_OVERLAP',
    },
    A2: {
        id: 'A2', category: 'A', name: 'Text-on-primitive overlap',
        passCriterion: 'No text intrudes into a body, surface, or arrow path. Labels live in callout zones or above/below primitives.',
        bugClass: 'VISUAL_TEXT_INTRUDES_PRIMITIVE',
    },
    A3: {
        id: 'A3', category: 'A', name: 'Canvas bounds',
        passCriterion: 'Every primitive (head + tail of arrow, full body, full label) is inside the canvas frame with at least 4px margin.',
        bugClass: 'VISUAL_OUT_OF_BOUNDS',
    },
    A4: {
        id: 'A4', category: 'A', name: 'Label readability',
        passCriterion: 'Effective label font size ≥ 12px after any zoom/scaling. Color contrast ≥ 4.5:1 against the background.',
        bugClass: 'VISUAL_LABEL_UNREADABLE',
    },
    A5: {
        id: 'A5', category: 'A', name: 'Whitespace and zoning',
        passCriterion: 'MAIN_ZONE has at least 30% empty space. Annotations are not stacked on top of each other.',
        bugClass: 'VISUAL_OVERCROWDED',
    },
    A6: {
        id: 'A6', category: 'A', name: 'Arrow head clarity',
        passCriterion: 'Force arrow heads are not buried inside other primitives; arrow direction is unambiguous to a viewer.',
        bugClass: 'VISUAL_ARROW_HEAD_BURIED',
    },

    // ── Category B — Physics correctness ─────────────────────────────────────
    B1: {
        id: 'B1', category: 'B', name: 'Vector direction match',
        passCriterion: 'Every force_arrow rendered angle matches the angle declared in the physics_engine_config (±2°).',
        bugClass: 'PHYSICS_DIRECTION_WRONG',
    },
    B2: {
        id: 'B2', category: 'B', name: 'Vector magnitude proportionality',
        passCriterion: 'Arrow length proportional to magnitude × UNIT_TO_PX. Two arrows with magnitudes 5N and 10N must have visually doubled length (±10%).',
        bugClass: 'PHYSICS_MAGNITUDE_WRONG',
    },
    B3: {
        id: 'B3', category: 'B', name: 'Equilibrium visualization',
        passCriterion: 'When physics declares net force = 0, the arrows must visually sum to zero (head-to-tail closes back to origin within 5% of the longest vector).',
        bugClass: 'PHYSICS_EQUILIBRIUM_BROKEN',
    },
    B4: {
        id: 'B4', category: 'B', name: 'Gravity always down',
        passCriterion: 'Any mg, weight, or gravity-force vector points to canvas-bottom (270° in screen coordinates). No exceptions, even on inclined planes.',
        bugClass: 'PHYSICS_GRAVITY_WRONG',
    },
    B5: {
        id: 'B5', category: 'B', name: 'Normal perpendicular to surface',
        passCriterion: 'Normal force vector is exactly 90° from the surface orientation (±2°). On a 30° incline, N points at 60° in the world frame.',
        bugClass: 'PHYSICS_NORMAL_NOT_PERPENDICULAR',
    },
    B6: {
        id: 'B6', category: 'B', name: 'Friction opposes motion',
        passCriterion: 'Friction arrow points opposite to the declared velocity / motion direction (180° ± 5°).',
        bugClass: 'PHYSICS_FRICTION_WRONG_DIR',
    },
    B7: {
        id: 'B7', category: 'B', name: 'No phantom vectors',
        passCriterion: 'Every rendered arrow corresponds to an entry in physics_engine_config.forces[]. No arrows appear that are not declared.',
        bugClass: 'PHYSICS_PHANTOM_VECTOR',
    },

    // ── Category C — Choreography correctness ────────────────────────────────
    C1: {
        id: 'C1', category: 'C', name: 'No teleport',
        passCriterion: 'Same body.id between consecutive states does not jump > 30% of canvas width without a declared motion_path primitive.',
        bugClass: 'CHOREOGRAPHY_TELEPORT',
    },
    C2: {
        id: 'C2', category: 'C', name: 'Continuity of scale',
        passCriterion: 'Same body.id does not change visual size by more than 10% between states unless physics_behavior declares a transformation.',
        bugClass: 'CHOREOGRAPHY_SCALE_DRIFT',
    },
    C3: {
        id: 'C3', category: 'C', name: 'Camera continuity',
        passCriterion: 'Canvas zoom and pan do not snap discontinuously between states. Smooth or static only.',
        bugClass: 'CHOREOGRAPHY_CAMERA_SNAP',
    },
    C4: {
        id: 'C4', category: 'C', name: 'Focal evolution',
        passCriterion: 'The focal_primitive_id shifts sensibly state-to-state (highlighting changes match the teaching script narrative).',
        bugClass: 'CHOREOGRAPHY_FOCAL_DRIFT',
    },
    C5: {
        id: 'C5', category: 'C', name: 'Annotation persistence',
        passCriterion: 'An annotation introduced in STATE_N persists in STATE_{N+1} unless its is_persistent field is explicitly false.',
        bugClass: 'CHOREOGRAPHY_ANNOTATION_FLICKER',
    },

    // ── Category D — Animation correctness ───────────────────────────────────
    D1: {
        id: 'D1', category: 'D', name: 'Animation actually plays',
        passCriterion: 'At least 30% of pixel area changes between t=0s and t=10s (sim is not a static image, unless concept declares static).',
        bugClass: 'ANIMATION_NO_PLAYBACK',
    },
    D1p: {
        id: 'D1p', category: 'D', name: 'Animation actually plays (pixel)',
        passCriterion: 'pixelmatch diff between first and last animation_timeseries frame ≥ 30% of pixels (deterministic complement to D1).',
        bugClass: 'ANIMATION_NO_PLAYBACK_PIXEL',
        validationMethod: 'pixel',
        requiresTimingMetadata: false,
    },
    D2: {
        id: 'D2', category: 'D', name: 'Smooth motion',
        passCriterion: 'No frame shows a body at a position outside the convex hull of (previous frame, next frame). No jitter or mid-motion teleport.',
        bugClass: 'ANIMATION_JITTER',
    },
    D3: {
        id: 'D3', category: 'D', name: 'Timing matches narration',
        passCriterion: 'When teacher_script declares STATE_N narration is X seconds, the sim remains in STATE_N visuals for between (X-1) and (X+1) seconds.',
        bugClass: 'ANIMATION_TIMING_DRIFT',
        requiresTimingMetadata: true,
    },
    D4: {
        id: 'D4', category: 'D', name: 'No stuck frames',
        passCriterion: 'Sim does not freeze on the same frame for more than 3 seconds mid-state (would indicate render crash).',
        bugClass: 'ANIMATION_STUCK',
    },

    // ── Category E — Pedagogical quality ─────────────────────────────────────
    E1: {
        id: 'E1', category: 'E', name: 'Concept teachability',
        passCriterion: 'A Class 11 student watching only this simulation, with no other resource, can correctly explain the concept afterward. Vision returns yes / partially / no with reasoning — only "no" counts as failure (yes and partially both pass to avoid noisy retries on borderline subjective calls).',
        bugClass: 'PEDAGOGY_CONCEPT_UNCLEAR',
    },
    E2: {
        id: 'E2', category: 'E', name: 'Focal attention',
        passCriterion: 'Each state has exactly one visual element drawing the eye (the focal_primitive_id). It is highlighted via color, border, or halo clearly.',
        bugClass: 'PEDAGOGY_NO_FOCAL',
    },
    E3: {
        id: 'E3', category: 'E', name: 'Real-world anchor visible',
        passCriterion: 'The Indian context anchor declared in the JSON (e.g., Mumbai train, Manali highway) is visually represented as a label, sketch, or annotation.',
        bugClass: 'PEDAGOGY_NO_ANCHOR',
    },
    E4: {
        id: 'E4', category: 'E', name: 'Misconception explicitly shown',
        passCriterion: 'For EPIC-C variants only: STATE_1 must visually depict the wrong belief — never a neutral baseline.',
        bugClass: 'PEDAGOGY_EPICC_NEUTRAL_NOT_WRONG',
        requiresEpicC: true,
    },
    E5: {
        id: 'E5', category: 'E', name: 'Formula visible when referenced',
        passCriterion: 'When the teacher script references a formula (e.g., F = ma), the formula must be rendered on screen at that state via a formula_box primitive.',
        bugClass: 'PEDAGOGY_FORMULA_MISSING',
    },
    E6: {
        id: 'E6', category: 'E', name: 'No information overload',
        passCriterion: 'Each state introduces at most 2 new concepts/elements. State does not dump 6 forces, 4 labels, and 3 equations simultaneously.',
        bugClass: 'PEDAGOGY_INFO_OVERLOAD',
    },

    // ── Category F — Panel A/B bilateral sync ────────────────────────────────
    // F1 and F4 use DOM/postMessage timing (Playwright); F2 and F3 use vision.
    F1: {
        id: 'F1', category: 'F', name: 'Simultaneous state',
        passCriterion: 'At the same wall-clock time, both panels render the same STATE_N. No lag greater than 200ms between Panel A state change and Panel B (measured from postMessage STATE_REACHED timestamps).',
        bugClass: 'DUALPANEL_STATE_DESYNC',
        validationMethod: 'dom',
        multiPanelOnly: true,
    },
    F2: {
        id: 'F2', category: 'F', name: 'Equation-physics coherence',
        passCriterion: 'Panel B traces[].equation_expr mathematically describes Panel A physics. (E.g., Panel A shows projectile, Panel B equation y = -0.5*g*t^2 + v0*t matches.)',
        bugClass: 'DUALPANEL_EQUATION_INCOHERENT',
        multiPanelOnly: true,
    },
    F3: {
        id: 'F3', category: 'F', name: 'Live dot follows Panel A',
        passCriterion: 'Panel B live_dot x-coordinate matches Panel A current variable value. Slider drag in either panel moves the dot in lockstep.',
        bugClass: 'DUALPANEL_LIVEDOT_DRIFT',
        multiPanelOnly: true,
    },
    F4: {
        id: 'F4', category: 'F', name: 'PARAM_UPDATE round-trip',
        passCriterion: 'Slider change in either panel reaches the other within 200ms. Measured by Playwright firing PARAM_UPDATE in one iframe and timing the receive in the other.',
        bugClass: 'DUALPANEL_PARAM_RELAY_BROKEN',
        validationMethod: 'dom',
        multiPanelOnly: true,
    },

    // ── Category G — Panel B practical understanding ─────────────────────────
    G1: {
        id: 'G1', category: 'G', name: 'Axes labeled',
        passCriterion: 'Both x-axis and y-axis carry a non-empty label string with unit. Vision verifies the label is rendered, not just declared in the config.',
        bugClass: 'DUALPANEL_AXES_UNLABELED',
        multiPanelOnly: true,
    },
    G2: {
        id: 'G2', category: 'G', name: 'Axis range sensible',
        passCriterion: 'Y-values across the visible x-range are within ±2× the y-axis range. No curves run off-screen or compress to a flat line.',
        bugClass: 'DUALPANEL_RANGE_OFF',
        multiPanelOnly: true,
    },
    G3: {
        id: 'G3', category: 'G', name: 'Gridlines visible',
        passCriterion: 'Plotly grid is on, with contrast distinguishable from the background.',
        bugClass: 'DUALPANEL_GRID_INVISIBLE',
        multiPanelOnly: true,
    },
    G4: {
        id: 'G4', category: 'G', name: 'At least one trace visible',
        passCriterion: 'The traces array renders at least one line that is actually visible inside the plotted canvas.',
        bugClass: 'DUALPANEL_NO_TRACE',
        multiPanelOnly: true,
    },
    G5: {
        id: 'G5', category: 'G', name: 'Live dot in visible range',
        passCriterion: 'The yellow live_dot is inside the axis box, not clipped at the edges.',
        bugClass: 'DUALPANEL_LIVEDOT_OFF_GRAPH',
        multiPanelOnly: true,
    },
    G6: {
        id: 'G6', category: 'G', name: 'Legend if multiple traces',
        passCriterion: 'When 2 or more traces render, a legend renders to disambiguate them.',
        bugClass: 'DUALPANEL_NO_LEGEND',
        multiPanelOnly: true,
    },

    // ── Category H — Authoring hygiene (deterministic, no LLM) ───────────────
    H1: {
        id: 'H1', category: 'H', name: 'Template substitution leak',
        passCriterion: 'No rendered text contains unsubstituted {var} or {expr.toFixed(N)} PCPL placeholders. Verified via DOM scan in screenshotter.ts and OCR backstop on canvas-rendered text.',
        bugClass: 'TEMPLATE_LEAK',
        validationMethod: 'ocr',
    },
};

// ─── Result types ─────────────────────────────────────────────────────────────

/** Single check result emitted by the vision gate per (check, state). */
export interface CheckResult {
    check_id: VisualCheckId;
    category: VisualCategory;
    state_id: string;            // e.g., "STATE_1" — or "ALL_STATES" for storyboard checks (Cat E)
    passed: boolean;
    /** Vision-model explanation. Required when passed=false. */
    evidence: string;
    bug_class: BugClass;
}

/** Aggregate result returned by /api/validate-simulation */
export interface VisualValidationResult {
    valid: boolean;
    /** Flattened actionable strings ready for the existing 2-attempt retry feedback. */
    errors: string[];
    /** Full per-check results — written to engine_bug_queue on failure. */
    check_results: CheckResult[];
    /** Cost telemetry. */
    cost_usd: number;
    /** Total wall-clock time in milliseconds. */
    duration_ms: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function getChecksByCategory(category: VisualCategory): VisualCheckSpec[] {
    return Object.values(VISUAL_CHECKS).filter(c => c.category === category);
}

export function getApplicableChecks(opts: {
    panelCount: number;
    hasEpicC: boolean;
    hasTimingMetadata: boolean;
}): VisualCheckSpec[] {
    return Object.values(VISUAL_CHECKS).filter(c => {
        if (c.multiPanelOnly && opts.panelCount < 2) return false;
        if (c.requiresEpicC && !opts.hasEpicC) return false;
        if (c.requiresTimingMetadata && !opts.hasTimingMetadata) return false;
        return true;
    });
}

/**
 * Format a CheckResult into the actionable string the 2-attempt retry loop
 * expects. Mirrors the format used by validatePhysics().
 */
export function formatCheckError(result: CheckResult): string {
    const spec = VISUAL_CHECKS[result.check_id];
    return `[${result.check_id} ${spec.name}] (${result.state_id}) ${result.evidence}`;
}
