/**
 * WP-F2 acceptance verification — batch regen of `simulation_cache` for the
 * PCPL/parametric_renderer concepts left with NO row after today's renderer
 * hardening (WP-R1..R5) + the earlier parametric_expr_derived_scope sweep's
 * DELETE. Generalizes `_seed_scalar_vs_vector_cache.ts` (same docstring:
 * "Concept-agnostic — set CONCEPT_ID and run for any PCPL concept") into a
 * CLI-driven batch tool instead of duplicating 11 near-identical files.
 *
 * Deliberately calls `assembleParametricHtml()` DIRECTLY (bypassing
 * `generateSimulation()`/Stage 1) — zero LLM cost, Rule-18-safe, and avoids
 * the empirically-observed silent-drop failure mode logged in
 * `_regen_prewarm_with_settle.ts` (regen-via-generateSimulation crashing on
 * low Anthropic credits / racing process exit). Mirrors the PRODUCTION shape
 * written by aiSimulationGenerator.ts's "Strict-engines bypass"
 * (PCPL_CONCEPTS branch, ~line 6477) byte-for-byte:
 *   - `physics_config` is the raw ParametricConfig (top-level `states`, not
 *     nested under `epic_l_path`).
 *   - `renderer_type: 'parametric'`, `sim_type: 'single_panel'`, `engine: 'p5js'`.
 *   - full state objects passed through UNCHANGED (advance_mode,
 *     variable_choreography, teacher_script, etc. all survive — the
 *     WP-F1 fix that made choreography visible to THE EYE via the cache).
 *
 * Delete-then-insert per concept (not upsert) — safe to re-run.
 *
 * Run: npx tsx --env-file=.env.local src/scripts/_seed_pcpl_batch_cache.ts [concept_id ...]
 *   (no args => the 11-concept default list below)
 */
import '@/lib/loadEnvLocal';
import { readFileSync } from 'node:fs';
import { assembleParametricHtml, type ParametricConfig } from '@/lib/renderers/parametric_renderer';
import { resolveConceptJsonPath } from '@/scripts/lib/resolveConceptJson';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

// The 13-concept WP-F2 regen scope minus scalar_vs_vector (already re-seeded
// via _seed_scalar_vs_vector_cache.ts) minus pressure_scalar (held — WP-R4
// found its authored literal `from` coords land outside the vessel; regen
// would ship a newly-wrong position, alex:json_author follow-up).
const DEFAULT_CONCEPT_IDS = [
    'field_forces', 'contact_forces', 'normal_reaction', 'tension_in_string',
    'vector_resolution', 'hinge_force', 'free_body_diagram',
    'friction_static_kinetic', 'current_not_vector', 'vector_head_to_tail',
    'newton_second_law_direction',
];

interface EpicLState {
    scene_composition?: Array<{ type?: string }>;
    focal_primitive_id?: string;
    teacher_script?: { tts_sentences?: unknown[] };
    title?: string;
    label?: string;
    advance_mode?: string;
    variable_choreography?: unknown[];
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

function extractTtsText(item: unknown): string {
    if (typeof item === 'string') return item;
    if (typeof item === 'object' && item !== null) {
        const obj = item as { text_en?: string; text?: string };
        return obj.text_en ?? obj.text ?? '';
    }
    return '';
}

function loadConceptJson(conceptId: string): ConceptJson {
    // Resolve through the SHARED resolver, never a hardcoded flat path: a
    // subject namespace (src/data/concepts/mathematics/, .../chemistry/) is
    // invisible to a flat join, which silently ENOENTs a whole subject out of
    // this tool (scar: subject_namespace_concepts_are_invisible_to_flat_scanning_tools).
    const resolved = resolveConceptJsonPath(conceptId);
    if (!resolved) {
        throw new Error(
            `concept JSON not found for "${conceptId}" in any subject namespace ` +
            `(searched src/data/concepts/ and its subject subdirectories)`,
        );
    }
    return JSON.parse(readFileSync(resolved.path, 'utf-8')) as ConceptJson;
}

function defaultVarsFromConfig(json: ConceptJson): Record<string, number> {
    const vars: Record<string, number> = {};
    const declared = json.physics_engine_config?.variables ?? {};
    for (const [name, spec] of Object.entries(declared)) {
        if (typeof spec.default === 'number') vars[name] = spec.default;
        else if (typeof spec.constant === 'number') vars[name] = spec.constant;
    }
    return vars;
}

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

async function seedOne(conceptId: string): Promise<{ conceptId: string; ok: boolean; detail: string }> {
    try {
        const json = loadConceptJson(conceptId);
        const states = json.epic_l_path?.states ?? {};
        const stateKeys = Object.keys(states);
        if (stateKeys.length === 0) return { conceptId, ok: false, detail: 'no epic_l_path.states' };

        const entryState = chooseEntryState(states);
        const config: ParametricConfig = {
            concept_id: conceptId,
            scene_composition: entryState ? (states[entryState].scene_composition ?? []) : [],
            states: states as Record<string, { scene_composition?: unknown[] }>,
            default_variables: defaultVarsFromConfig(json),
            current_state: entryState ?? stateKeys[0],
            canvas_style: 'default',
        };

        const simHtml = assembleParametricHtml(config);
        const teacherScript = buildTeacherScript(states);
        const classLevel = json.class_level ?? 11;

        const del = await supabaseAdmin.from('simulation_cache').delete().eq('concept_key', conceptId);
        if (del.error) return { conceptId, ok: false, detail: `delete failed: ${del.error.message}` };

        const ins = await supabaseAdmin.from('simulation_cache').insert({
            concept_key: conceptId,
            concept_id: conceptId,
            sim_html: simHtml,
            physics_config: config,
            teacher_script: teacherScript,
            sim_type: 'single_panel',
            renderer_type: 'parametric',
            engine: 'p5js',
            class_level: classLevel,
            fingerprint_key: `${conceptId}|understand|${classLevel}|conceptual|none`,
            pipeline_version: 'v5-strict-engines-seed',
            truth_anchor_passed: true,
            quality_score: 0,
            served_count: 1,
        });
        if (ins.error) return { conceptId, ok: false, detail: `insert failed: ${ins.error.message}` };

        return { conceptId, ok: true, detail: `${simHtml.length} chars, ${stateKeys.length} states, entry=${config.current_state}` };
    } catch (err) {
        return { conceptId, ok: false, detail: err instanceof Error ? err.message : String(err) };
    }
}

async function main(): Promise<void> {
    const cliArgs = process.argv.slice(2).filter(Boolean);
    const conceptIds = cliArgs.length > 0 ? cliArgs : DEFAULT_CONCEPT_IDS;

    console.log(`\n=== Seeding simulation_cache for ${conceptIds.length} PCPL concept(s) ===\n`);
    const results: Array<{ conceptId: string; ok: boolean; detail: string }> = [];
    for (const id of conceptIds) {
        const r = await seedOne(id);
        results.push(r);
        console.log(`${r.ok ? '✅' : '❌'} ${id.padEnd(28)} ${r.detail}`);
    }

    const failed = results.filter(r => !r.ok);
    console.log(`\n=== Summary: ${results.length - failed.length}/${results.length} succeeded ===`);
    if (failed.length > 0) {
        console.error(`FAILED: ${failed.map(f => f.conceptId).join(', ')}`);
        process.exit(1);
    }
}

main().catch((err) => {
    console.error('💥 batch seed crashed:', err instanceof Error ? err.stack : err);
    process.exit(2);
});
