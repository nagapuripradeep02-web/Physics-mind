/**
 * Shared ParametricConfig builder for CLI scripts (2026-07-24).
 *
 * Parametric-family concepts carry NO `*_config` block: their scene lives in
 * `epic_l_path.states[*].scene_composition` and their slider defaults in
 * `physics_engine_config.variables`. Both the review-site builder and THE EYE's
 * cache seed need to assemble that same config, so it lives here rather than
 * being duplicated (a drift between the two would mean the visual gate audits a
 * different sim than the teacher sees — exactly the silent-degradation class
 * `resolveConceptJson.ts` was created to kill).
 *
 * Mirrors the app-path construction in aiSimulationGenerator.ts (~line 6411),
 * with one deliberate improvement: `default_variables` is derived from the
 * concept's declared `physics_engine_config.variables` instead of a hardcoded
 * per-concept-id table.
 */
import type { ParametricConfig } from '@/lib/renderers/parametric_renderer';

export interface ParametricSourceJson {
    concept_id?: string;
    renderer_pair?: { panel_a?: string; panel_b?: string };
    physics_engine_config?: {
        variables?: Record<string, { default?: number; constant?: number }>;
    };
    canvas_style?: 'default' | 'answer_sheet';
    epic_l_path?: {
        states?: Record<string, { scene_composition?: unknown[]; focal_primitive_id?: string }>;
    };
}

/** True when this concept renders on the 2D parametric family. */
export function isParametricConcept(json: ParametricSourceJson): boolean {
    return json.renderer_pair?.panel_a === 'parametric';
}

/**
 * Build the ParametricConfig for a concept JSON.
 *
 * `responsiveFill` fits + centers the fixed 760x500 design space to the host
 * viewport. ON for the review/pilot surface (parity with field_3d, which fills
 * its iframe). OFF for THE EYE, whose frozen baselines must stay byte-stable at
 * the native design size — a viewport-dependent scale would re-baseline every
 * capture (engine_bug_queue: parametric_canvas_fixed_size_not_filling_host).
 */
export function buildParametricConfig(
    conceptId: string,
    json: ParametricSourceJson,
    opts: { responsiveFill?: boolean } = {},
): ParametricConfig {
    const states = json.epic_l_path?.states ?? {};
    const firstKey = Object.keys(states)[0] ?? 'STATE_1';
    const defaultVariables: Record<string, number> = {};
    const vars = json.physics_engine_config?.variables ?? {};
    for (const [k, v] of Object.entries(vars)) {
        const dv = v.default ?? v.constant;
        if (typeof dv === 'number') defaultVariables[k] = dv;
    }
    return {
        concept_id: conceptId,
        scene_composition: states[firstKey]?.scene_composition ?? [],
        states: states as ParametricConfig['states'],
        default_variables: defaultVariables,
        current_state: firstKey,
        canvas_style: json.canvas_style ?? 'default',
        ...(opts.responsiveFill ? { responsive_fill: true } : {}),
    };
}
