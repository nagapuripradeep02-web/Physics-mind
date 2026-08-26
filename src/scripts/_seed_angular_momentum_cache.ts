/**
 * TEMP seed — angular_momentum into simulation_cache so `npm run visual:eyes`
 * can drive it. field_3d generation does not run through the live Sonnet
 * pipeline, so we assemble the sim HTML deterministically from the JSON's
 * field_3d_config and write one cache row. Delete after the visual gate.
 *
 * PARALLEL-SAFETY (rotmech desk C, 2026-08-04): every delete below is scoped to
 * this ONE concept_key / fingerprint. Four sibling desks share this dev Supabase
 * and an unscoped wipe would clobber a sibling's freshly-seeded row mid-EYE.
 *
 * Run: npx tsx --env-file=.env.local src/scripts/_seed_angular_momentum_cache.ts
 */
import '@/lib/loadEnvLocal';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { assembleField3DHtml, type Field3DConfig } from '@/lib/renderers/field_3d_renderer';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const CONCEPT_ID = 'angular_momentum';

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

    const delByKey = await supabaseAdmin.from('simulation_cache').delete().eq('concept_key', CONCEPT_ID);
    if (delByKey.error) throw new Error(`delete (concept_key) failed: ${delByKey.error.message}`);
    const delByFp = await supabaseAdmin.from('simulation_cache').delete().like('fingerprint_key', `%${CONCEPT_ID}%`);
    if (delByFp.error) throw new Error(`delete (fingerprint_key) failed: ${delByFp.error.message}`);

    const ins = await supabaseAdmin.from('simulation_cache').insert({
        concept_key: CONCEPT_ID,
        concept_id: CONCEPT_ID,
        sim_html: simHtml,
        // NOTE (2026-08-04): `field_3d_config` is included DELIBERATELY.
        // visual_eyes.ts:68 derives the motion map from `cached.physics_config`,
        // and deriveMotionExpectations resolves field_3d motion from
        // `field_3d_config.states` (deriveStateMeta.ts:108) — it has a real
        // `rigid_body_rotation` branch at :416-429. Seeding only `epic_l_path`
        // starves that branch, so every D5 motion check reports
        // "motion expectation unknown" and SKIPS. With the config present the
        // rbr branch can classify each state and D5 actually runs.
        physics_config: { epic_l_path: json.epic_l_path, field_3d_config: json.field_3d_config },
        teacher_script: null,
        sim_type: 'single',
        renderer_type: 'field_3d',
        engine: 'threejs',
        fingerprint_key: `${CONCEPT_ID}|understand|12|conceptual|none`,
        served_count: 1,
    });
    if (ins.error) throw new Error(`insert failed: ${ins.error.message}`);

    console.log(`✅ Seeded simulation_cache for ${CONCEPT_ID}`);
}

main().catch((err) => {
    console.error('💥 seed failed:', err instanceof Error ? err.stack : err);
    process.exit(1);
});
