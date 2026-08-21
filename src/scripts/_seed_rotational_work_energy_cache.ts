/**
 * TEMP seed — rotational_work_energy into simulation_cache so
 * `npm run visual:eyes` can drive it. field_3d generation does not run through
 * the live Sonnet pipeline, so we assemble the sim HTML deterministically from
 * the JSON's field_3d_config and write one cache row.
 *
 * Desk A (feat/rotmech-a) owns this concept_key — the delete-then-insert below
 * is scoped to it and races no sibling desk (rotmech_a_state.md guardrail 2).
 * Mirrors _seed_conservation_of_angular_momentum_cache.ts exactly.
 *
 * Run: npx tsx --env-file=.env.local src/scripts/_seed_rotational_work_energy_cache.ts
 */
import '@/lib/loadEnvLocal';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { assembleField3DHtml, type Field3DConfig } from '@/lib/renderers/field_3d_renderer';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const CONCEPT_ID = 'rotational_work_energy';

interface ConceptJson {
    concept_id: string;
    field_3d_config?: Field3DConfig;
    epic_l_path?: Record<string, unknown>;
    teacher_script?: unknown;
}

async function main(): Promise<void> {
    const path = join(process.cwd(), 'src', 'data', 'concepts', `${CONCEPT_ID}.json`);
    const json = JSON.parse(readFileSync(path, 'utf-8')) as ConceptJson;
    if (!json.field_3d_config) throw new Error('no field_3d_config in concept JSON');

    const simHtml = assembleField3DHtml(json.field_3d_config);
    console.log(`Assembled sim_html: ${simHtml.length} chars`);

    const del = await supabaseAdmin.from('simulation_cache').delete().eq('concept_key', CONCEPT_ID);
    if (del.error) throw new Error(`delete failed: ${del.error.message}`);

    const ins = await supabaseAdmin.from('simulation_cache').insert({
        concept_key: CONCEPT_ID,
        concept_id: CONCEPT_ID,
        sim_html: simHtml,
        // field_3d_config is REQUIRED here, not optional decoration: THE EYE's
        // deriveMotionExpectations reads it off the CACHED physics_config
        // (visual_eyes.ts:68). The cloned exemplar omitted it, so every state
        // reported `?` on the Motion map and [D5] — the one dense-motion gate
        // that does not pass by construction on a static scene — abstained on
        // all states. ENGINE_LANDING_NOTICE §4.2; rigid_body_rotation HAS a
        // motion branch, so this genuinely re-arms [D5] (for nlb / coulombs_law
        // the `?` is by design and adding this changes nothing).
        physics_config: { epic_l_path: json.epic_l_path, field_3d_config: json.field_3d_config },
        teacher_script: null,
        sim_type: 'single',
        renderer_type: 'field_3d',
        engine: 'threejs',
        fingerprint_key: `${CONCEPT_ID}|understand|11|conceptual|none`,
        served_count: 1,
    });
    if (ins.error) throw new Error(`insert failed: ${ins.error.message}`);

    console.log(`✅ Seeded simulation_cache for ${CONCEPT_ID}`);
}

main().catch((err) => {
    console.error('💥 seed failed:', err instanceof Error ? err.stack : err);
    process.exit(1);
});
