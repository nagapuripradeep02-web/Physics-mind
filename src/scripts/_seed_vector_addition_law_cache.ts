/**
 * Seed a concept's PCPL/parametric_renderer output into `simulation_cache` so
 * `npm run visual:eyes` / `smoke:visual-validator` can drive it.
 *
 * FIRST seed script for the PCPL pathway (`assembleParametricHtml` in
 * src/lib/renderers/parametric_renderer.ts) — every prior `_seed_*_cache.ts`
 * script targets `field_3d` or `particle_field`. There was no existing
 * `simulation_cache` row for any PCPL concept to copy (checked
 * `friction_static_kinetic` — Ch.8's first PCPL gold-standard concept — and
 * it has none either), so this mirrors the PRODUCTION shape written by the
 * "Strict-engines bypass (PCPL parametric OR mechanics_2d OR field_3d)"
 * branch in `src/lib/aiSimulationGenerator.ts` (~line 6437, the
 * `PCPL_CONCEPTS.has(conceptIdForLookup)` arm) byte-for-byte:
 *   - `physics_config` is the raw `ParametricConfig` object (top-level
 *     `states`, NOT nested under `epic_l_path` — that nested shape is the
 *     OTHER, non-PCPL v2 schema `deriveStateIds()` also accepts).
 *   - `renderer_type: 'parametric'` (not `'mechanics_2d'` — that string is
 *     reserved for the separate assembleMechanics2DHtml pipeline; the PCPL
 *     bypass writes `'parametric'` even though the concept JSON's own
 *     `renderer_pair.panel_a` field says `"mechanics_2d"` — that field names
 *     the renderer FAMILY, not this table's `renderer_type` enum value).
 *   - `sim_type: 'single_panel'`, `engine: 'p5js'`.
 *   - `teacher_script` built from each state's `tts_sentences` the same way
 *     (`extractTtsText` handles both legacy string entries and the
 *     `{ text_en }` object shape).
 *
 * Concept-agnostic — set CONCEPT_ID and run for any PCPL concept whose
 * `renderer_pair.panel_a === "mechanics_2d"` in its concept JSON. Delete-then
 * -insert (not upsert) so re-running is always safe; clear the OTHER 3 cache
 * tables yourself per CLAUDE.md §6 if you're re-testing a concept end-to-end.
 *
 * Run: npx tsx --env-file=.env.local src/scripts/_seed_scalar_vs_vector_cache.ts
 */
import '@/lib/loadEnvLocal';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { assembleParametricHtml, type ParametricConfig } from '@/lib/renderers/parametric_renderer';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const CONCEPT_ID = 'vector_addition_law';

interface EpicLState {
    scene_composition?: Array<{ type?: string }>;
    focal_primitive_id?: string;
    teacher_script?: { tts_sentences?: unknown[] };
    title?: string;
    label?: string;
    // WP-F1 (2026-07-23): state-level fields the OLD `{ scene_composition }`-only
    // cache shape below used to silently drop. advance_mode isn't read by the
    // renderer itself but IS read by the review player / THE EYE's advance-mode
    // classification; variable_choreography is read directly off this object by
    // parametric_renderer.ts (PM_applyChoreography / PM_choreoVarsAtTime) AND by
    // deriveStateMeta.ts's pcplSceneRevealMs/pcplHasContinuousChoreography — so
    // dropping it here made a cached PCPL sim's continuous motion invisible to
    // THE EYE regardless of what the source JSON authored.
    advance_mode?: string;
    variable_choreography?: unknown[];
    // Pass-through for every other authored field (misconception_watch,
    // variable_overrides, duration, ...) — mirrors aiSimulationGenerator.ts's
    // strict-engines bypass, which assigns the parsed epic_l_path.states object
    // straight through with no field-by-field reconstruction at all.
    [key: string]: unknown;
}

interface ConceptJson {
    concept_id: string;
    class_level?: number;
    physics_engine_config?: { variables?: Record<string, { default?: number; constant?: number }> };
    epic_l_path?: { states?: Record<string, EpicLState> };
}

interface TeacherScriptStep {
    step_number: number;
    title: string;
    text: string;
    sim_state: string;
    key_term: string;
}

// Handles both concept-JSON tts_sentence shapes seen across the codebase:
// a bare string, or an object carrying `text_en` (current schema) / `text`.
function extractTtsText(item: unknown): string {
    if (typeof item === 'string') return item;
    if (typeof item === 'object' && item !== null) {
        const obj = item as { text_en?: string; text?: string };
        return obj.text_en ?? obj.text ?? '';
    }
    return '';
}

function loadConceptJson(conceptId: string): ConceptJson {
    const path = join(process.cwd(), 'src', 'data', 'concepts', `${conceptId}.json`);
    return JSON.parse(readFileSync(path, 'utf-8')) as ConceptJson;
}

// Mirrors aiSimulationGenerator.ts's default_variables derivation: seed every
// declared physics_engine_config.variables entry from its `default`, falling
// back to `constant` for non-slider (locked) variables.
function defaultVarsFromConfig(json: ConceptJson): Record<string, number> {
    const vars: Record<string, number> = {};
    const declared = json.physics_engine_config?.variables ?? {};
    for (const [name, spec] of Object.entries(declared)) {
        if (typeof spec.default === 'number') vars[name] = spec.default;
        else if (typeof spec.constant === 'number') vars[name] = spec.constant;
    }
    return vars;
}

// Mirrors aiSimulationGenerator.ts's chosenStateKey selection: prefer the
// first state carrying a force_arrow primitive (the PCPL scene needs one to
// anchor the default view), else fall back to the first authored state.
function chooseEntryState(states: Record<string, EpicLState>): string | null {
    const keys = Object.keys(states);
    for (const key of keys) {
        if ((states[key].scene_composition ?? []).some(p => p.type === 'force_arrow')) return key;
    }
    return keys[0] ?? null;
}

function buildTeacherScript(states: Record<string, EpicLState>): TeacherScriptStep[] | null {
    const steps: TeacherScriptStep[] = [];
    let stepNum = 1;
    for (const [stateId, state] of Object.entries(states)) {
        const sentences = state.teacher_script?.tts_sentences ?? [];
        for (const item of sentences) {
            const text = extractTtsText(item);
            if (!text) continue;
            steps.push({
                step_number: stepNum++,
                title: state.title ?? state.label ?? stateId,
                text,
                sim_state: stateId,
                key_term: '',
            });
        }
    }
    return steps.length > 0 ? steps : null;
}

async function main(): Promise<void> {
    const json = loadConceptJson(CONCEPT_ID);
    const states = json.epic_l_path?.states ?? {};
    const stateKeys = Object.keys(states);
    if (stateKeys.length === 0) throw new Error(`no epic_l_path.states in ${CONCEPT_ID}.json`);

    const entryState = chooseEntryState(states);
    const config: ParametricConfig = {
        concept_id: CONCEPT_ID,
        scene_composition: entryState ? (states[entryState].scene_composition ?? []) : [],
        // WP-F1 (2026-07-23) — pass every authored state object THROUGH UNCHANGED,
        // exactly like aiSimulationGenerator.ts's strict-engines bypass does
        // (`states: allStates as Record<string, {...}>` — the parsed
        // epic_l_path.states object assigned directly, never rebuilt field-by-
        // field). The previous `{ scene_composition: ... }`-only reconstruction
        // here silently dropped advance_mode / teacher_script /
        // variable_choreography from the cached physics_config, so a restored
        // choreography (WP-F1: S2's psi_pointer loop, S4's theta ping_pong)
        // would seed correctly into the JSON but never reach THE EYE's
        // deriveMotionExpectations, which reads variable_choreography off the
        // CACHED config, not the source JSON.
        states: states as Record<string, { scene_composition?: unknown[] }>,
        default_variables: defaultVarsFromConfig(json),
        current_state: entryState ?? stateKeys[0],
        canvas_style: 'default',
    };

    const simHtml = assembleParametricHtml(config);
    console.log(`Assembled sim_html: ${simHtml.length} chars across ${stateKeys.length} states (entry=${config.current_state})`);

    const teacherScript = buildTeacherScript(states);
    const classLevel = json.class_level ?? 11;

    const del = await supabaseAdmin.from('simulation_cache').delete().eq('concept_key', CONCEPT_ID);
    if (del.error) throw new Error(`delete failed: ${del.error.message}`);

    const ins = await supabaseAdmin.from('simulation_cache').insert({
        concept_key: CONCEPT_ID,
        concept_id: CONCEPT_ID,
        sim_html: simHtml,
        physics_config: config,
        teacher_script: teacherScript,
        sim_type: 'single_panel',
        renderer_type: 'parametric',
        engine: 'p5js',
        class_level: classLevel,
        fingerprint_key: `${CONCEPT_ID}|understand|${classLevel}|conceptual|none`,
        pipeline_version: 'v5-strict-engines-seed',
        truth_anchor_passed: true,
        quality_score: 0,
        served_count: 1,
    });
    if (ins.error) throw new Error(`insert failed: ${ins.error.message}`);

    console.log(`✅ Seeded simulation_cache for ${CONCEPT_ID} (renderer_type=parametric, states=${stateKeys.join(', ')})`);
}

main().catch((err) => {
    console.error('💥 seed failed:', err instanceof Error ? err.stack : err);
    process.exit(1);
});
