/**
 * TEMP seed — hybridisation_sp_sp2_sp3 into simulation_cache so
 * `npm run visual:eyes` / `smoke:visual-validator` can drive it. field_3d
 * generation does not run through the live Sonnet pipeline, so we assemble the
 * sim HTML deterministically from the JSON's field_3d_config and write one cache
 * row. Delete after the visual gate (mirrors _seed_ac_generator_cache.ts).
 *
 * Uses the SHARED resolveConceptJsonPath rather than the flat physics path the
 * older seeds hardcode — this is a chemistry concept and lives in the
 * chemistry/ subdir (the isolation contract, CLAUDE.md §6).
 *
 * Run: npx tsx --env-file=.env.local src/scripts/_seed_hybridisation_sp_sp2_sp3_cache.ts
 */
import '@/lib/loadEnvLocal';
import { readFileSync } from 'node:fs';
import { assembleField3DHtml, type Field3DConfig } from '@/lib/renderers/field_3d_renderer';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { resolveConceptJsonPath } from './lib/resolveConceptJson';

const CONCEPT_ID = 'hybridisation_sp_sp2_sp3';

interface ConceptJson {
    concept_id: string;
    field_3d_config?: Field3DConfig;
    epic_l_path?: Record<string, unknown>;
}

async function main(): Promise<void> {
    const resolved = resolveConceptJsonPath(CONCEPT_ID);
    if (!resolved) throw new Error(`concept JSON not found for ${CONCEPT_ID}`);
    const json = JSON.parse(readFileSync(resolved.path, 'utf-8')) as ConceptJson;
    if (!json.field_3d_config) throw new Error('no field_3d_config in concept JSON');

    const simHtml = assembleField3DHtml(json.field_3d_config);
    console.log(`Resolved: ${resolved.path}`);
    console.log(`Assembled sim_html: ${simHtml.length} chars`);

    const del = await supabaseAdmin.from('simulation_cache').delete().eq('concept_key', CONCEPT_ID);
    if (del.error) throw new Error(`delete failed: ${del.error.message}`);

    const ins = await supabaseAdmin.from('simulation_cache').insert({
        concept_key: CONCEPT_ID,
        concept_id: CONCEPT_ID,
        sim_html: simHtml,
        physics_config: { epic_l_path: json.epic_l_path },
        teacher_script: null,
        sim_type: 'single',
        renderer_type: 'field_3d',
        engine: 'threejs',
        fingerprint_key: `${CONCEPT_ID}|understand|11|conceptual|none`,
    });
    if (ins.error) throw new Error(`insert failed: ${ins.error.message}`);
    console.log(`✅ seeded simulation_cache row for ${CONCEPT_ID}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
