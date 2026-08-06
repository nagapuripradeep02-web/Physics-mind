/**
 * Shared ParametricConfig builder — THE single assembler for the parametric
 * (PCPL) family (2026-07-24; single-source since 2026-08-06).
 *
 * Parametric-family concepts carry NO `*_config` block: their scene lives in
 * `epic_l_path.states[*].scene_composition` and their slider defaults in
 * `physics_engine_config.variables`. Every surface that needs a ParametricConfig
 * — the review-site/pilot builder, THE EYE's cache seed, the app's EPIC-L
 * bypass, the admin test pages — assembles through THIS file. The teacher
 * surface shipped dead choreography because it kept a private duplicate that
 * hand-picked per-state fields (engine_bug_queue:
 * review_site_private_config_assembler_drops_variable_choreography). A surface
 * that needs different behavior passes an OPTION here; it does not fork the
 * builder.
 *
 * Per-state fields pass through WHOLE (spread), so every field in
 * PARAMETRIC_STATE_FIELDS — and any future authored field — reaches the
 * renderer by construction. The projection-parity test
 * (src/lib/renderers/__tests__/parametric_projection_parity.test.ts) asserts
 * the renderer's read set against that oracle.
 */
import type { ParametricConfig, ParametricStateConfig } from '@/lib/renderers/parametric_renderer';

export interface ParametricSourceJson {
    concept_id?: string;
    renderer_pair?: { panel_a?: string; panel_b?: string };
    field_3d_config?: unknown;
    particle_field_config?: unknown;
    physics_engine_config?: {
        variables?: Record<string, { default?: number; constant?: number }>;
    };
    canvas_style?: 'default' | 'answer_sheet';
    epic_l_path?: {
        states?: Record<string, ParametricStateConfig>;
    };
}

/**
 * True when this concept renders on the 2D parametric family — the ONE routing
 * predicate every surface shares. Two authored shapes qualify:
 *  - `renderer_pair.panel_a === 'parametric'` (the modern label);
 *  - the historical shape: scene in `epic_l_path` + `physics_engine_config`
 *    and NO field_3d/particle_field block. Those concepts write
 *    `panel_a: "mechanics_2d"`, which does NOT mean mechanics_2d_renderer runs
 *    (the PCPL_CONCEPTS naming trap, CLAUDE.md §1) — this is the fallthrough
 *    build_review_site has always routed by, made explicit and shared so the
 *    review site, the cache seed, and the numeric gate agree on what "is
 *    parametric" means.
 */
export function isParametricConcept(json: ParametricSourceJson): boolean {
    if (json.renderer_pair?.panel_a === 'parametric') return true;
    return !!json.physics_engine_config && !json.field_3d_config && !json.particle_field_config;
}

function stateNumber(id: string): number {
    const m = /STATE_(\d+)/.exec(id);
    return m ? parseInt(m[1], 10) : 9999;
}

type TtsSentenceForFocal = { pause_after_ms?: number; highlight_primitive_id?: string };

export interface BuildParametricConfigOpts {
    /**
     * Synthesize a focal_sequence from teacher_script sentence highlights
     * (highlight_primitive_id + pause_after_ms) on states that do not author
     * one — the app's EPIC-L bypass renders narration-driven focus this way.
     * Authored focal_sequence always wins. OFF for the review site and THE EYE.
     */
    synthesizeFocalSequenceFromScript?: boolean;
    /** Override canvas_style (the app passes applyBoardMode()'s result). */
    canvasStyle?: 'default' | 'answer_sheet';
}

/** Build the ParametricConfig for a concept JSON. */
export function buildParametricConfig(
    conceptId: string,
    json: ParametricSourceJson,
    opts: BuildParametricConfigOpts = {},
): ParametricConfig {
    const source = json.epic_l_path?.states ?? {};
    // Numeric state order, not insertion order — firstKey and the top-level
    // scene must not depend on JSON key layout.
    const stateIds = Object.keys(source).sort((a, b) => stateNumber(a) - stateNumber(b));
    const states: Record<string, ParametricStateConfig> = {};
    for (const id of stateIds) {
        const st = source[id];
        let synthesized: ParametricStateConfig['focal_sequence'];
        if (opts.synthesizeFocalSequenceFromScript && !st.focal_sequence) {
            const sentences =
                (st as { teacher_script?: { tts_sentences?: TtsSentenceForFocal[] } }).teacher_script
                    ?.tts_sentences ?? [];
            const seq = sentences
                .filter((sen) => !!sen.highlight_primitive_id)
                .map((sen) => ({
                    highlight_primitive_id: sen.highlight_primitive_id as string,
                    duration_ms: sen.pause_after_ms ?? 3000,
                }));
            if (seq.length > 0) synthesized = seq;
        }
        states[id] = { ...st, ...(synthesized ? { focal_sequence: synthesized } : {}) };
    }
    const defaultVariables: Record<string, number> = {};
    const vars = json.physics_engine_config?.variables ?? {};
    for (const [k, v] of Object.entries(vars)) {
        const dv = v.default ?? v.constant;
        if (typeof dv === 'number') defaultVariables[k] = dv;
    }
    const firstKey = stateIds[0] ?? 'STATE_1';
    return {
        concept_id: conceptId,
        scene_composition: source[firstKey]?.scene_composition ?? [],
        states,
        default_variables: defaultVariables,
        current_state: firstKey,
        canvas_style: opts.canvasStyle ?? json.canvas_style ?? 'default',
    };
}
