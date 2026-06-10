/**
 * TTS↔visual binding extraction for Category I (Engine E29).
 *
 * The cached `teacher_script` column is a flattened TeacherScriptStep[] WITHOUT
 * glow / math_show — those live only in the concept JSON at
 * `epic_l_path.states.STATE_N.teacher_script.tts_sentences[]`. Callers load the
 * concept JSON via loadConstants() and hand it here.
 *
 * Output per state: the narration's visual promises (glow targets + declared
 * formulas) plus a primitive legend so the vision model can map renderer
 * element ids ("v", "b", "trail", "hand"…) to what they look like on screen.
 */

export interface TtsVisualBinding {
    sentence_id: string;
    text_en: string;
    /** Normalized glow targets — single string and arrays both become string[]. */
    glow: string[];
    math_show?: string;
    /**
     * Whether this sentence's math_show appends to the equation panel (true)
     * or replaces it (false). Mirrors the TeacherPlayer SET_MATH persist flag
     * so the capture harness can replay the panel faithfully (Category I2).
     */
    math_persist?: boolean;
}

export interface PrimitiveLegendEntry {
    id: string;
    type: string;
    label?: string;
}

export interface StateTtsContext {
    bindings: TtsVisualBinding[];
    primitive_legend: PrimitiveLegendEntry[];
}

/**
 * Well-known field_3d renderer element ids that appear as glow targets but are
 * renderer-level (not scene_composition primitives). Included in the legend so
 * the vision model knows what to look for.
 */
const RENDERER_ELEMENT_LEGEND: PrimitiveLegendEntry[] = [
    { id: 'v', type: 'vector_arrow', label: 'orange velocity arrow (labelled v)' },
    { id: 'f', type: 'vector_arrow', label: 'green force arrow (labelled F)' },
    { id: 'b', type: 'field_grid', label: 'blue ambient B-field arrows' },
    { id: 'v_parallel', type: 'vector_arrow', label: 'grey component arrow along B (v cos θ)' },
    { id: 'v_perp', type: 'vector_arrow', label: 'orange dashed component arrow ⊥ B (v sin θ)' },
    { id: 'trail', type: 'particle_trail', label: 'dotted orbital trail behind the particle' },
    { id: 'hand', type: 'mesh_overlay', label: '3D right-hand mesh' },
    { id: 'fleming', type: 'svg_overlay', label: 'Fleming left-hand-rule SVG panel (top-left)' },
    { id: 'fleming_index', type: 'svg_overlay', label: 'forefinger of the Fleming SVG' },
    { id: 'fleming_middle', type: 'svg_overlay', label: 'middle finger of the Fleming SVG' },
    { id: 'fleming_thumb', type: 'svg_overlay', label: 'thumb of the Fleming SVG' },
    { id: 'sliders', type: 'html_overlay', label: 'parameter sliders panel (top-right)' },
];

type JsonRecord = Record<string, unknown>;

function asRecord(v: unknown): JsonRecord | undefined {
    return v && typeof v === 'object' && !Array.isArray(v) ? v as JsonRecord : undefined;
}

function normalizeGlow(glow: unknown): string[] {
    if (typeof glow === 'string' && glow.length > 0) return [glow];
    if (Array.isArray(glow)) return glow.filter((g): g is string => typeof g === 'string' && g.length > 0);
    return [];
}

/**
 * Walk the concept JSON's epic_l_path and extract per-state TTS visual
 * bindings. States with no glow AND no math_show produce no entry (Category I
 * is never dispatched for them).
 */
export function extractTtsVisualBindings(
    conceptJson: JsonRecord | null,
): Record<string, StateTtsContext> {
    const out: Record<string, StateTtsContext> = {};
    const elp = asRecord(conceptJson?.epic_l_path);
    const states = asRecord(elp?.states);
    if (!states) return out;

    for (const [stateId, stateRaw] of Object.entries(states)) {
        const state = asRecord(stateRaw);
        if (!state) continue;
        const script = asRecord(state.teacher_script);
        const sentences = Array.isArray(script?.tts_sentences) ? script.tts_sentences : [];

        const bindings: TtsVisualBinding[] = [];
        for (const sRaw of sentences) {
            const s = asRecord(sRaw);
            if (!s) continue;
            const glow = normalizeGlow(s.glow);
            const mathShow = typeof s.math_show === 'string' && s.math_show.length > 0 ? s.math_show : undefined;
            if (glow.length === 0 && !mathShow) continue;
            bindings.push({
                sentence_id: typeof s.id === 'string' ? s.id : `${stateId}_s${bindings.length + 1}`,
                text_en: typeof s.text_en === 'string' ? s.text_en : '',
                glow,
                math_show: mathShow,
                math_persist: s.math_persist === true,
            });
        }
        if (bindings.length === 0) continue;

        out[stateId] = {
            bindings,
            primitive_legend: buildLegend(state),
        };
    }
    return out;
}

/** One SET_MATH replay step for the capture harness (Category I2). */
export interface TtsMathStep {
    sentence_id: string;
    /** LaTeX expression posted via SET_MATH. */
    math_show: string;
    /** persist flag passed to SET_MATH (append vs replace). */
    math_persist: boolean;
}

/**
 * Derive the per-state ordered math_show replay sequence from extracted
 * bindings. The capture harness posts each step's SET_MATH (in order, applying
 * persist) and snapshots the equation panel per formula so Category I2 can
 * confirm every declared formula actually renders. States with no math_show
 * produce no entry.
 */
export function buildTtsMathByState(
    bindingsByState: Record<string, StateTtsContext>,
): Record<string, TtsMathStep[]> {
    const out: Record<string, TtsMathStep[]> = {};
    for (const [stateId, ctx] of Object.entries(bindingsByState)) {
        const steps: TtsMathStep[] = [];
        for (const b of ctx.bindings) {
            if (!b.math_show) continue;
            steps.push({
                sentence_id: b.sentence_id,
                math_show: b.math_show,
                math_persist: b.math_persist === true,
            });
        }
        if (steps.length > 0) out[stateId] = steps;
    }
    return out;
}

/** Scene primitives (annotations etc.) + the renderer-level element legend. */
function buildLegend(state: JsonRecord): PrimitiveLegendEntry[] {
    const legend: PrimitiveLegendEntry[] = [...RENDERER_ELEMENT_LEGEND];
    const sc = asRecord(state.scene_composition);
    const primitives = Array.isArray(sc?.primitives) ? sc.primitives : [];
    for (const pRaw of primitives) {
        const p = asRecord(pRaw);
        if (!p || typeof p.id !== 'string') continue;
        const props = asRecord(p.properties);
        const label = typeof props?.text === 'string' ? props.text
            : typeof props?.label === 'string' ? props.label
            : undefined;
        legend.push({
            id: p.id,
            type: typeof p.type === 'string' ? p.type : 'primitive',
            label: label ? label.slice(0, 80) : undefined,
        });
    }
    return legend;
}
