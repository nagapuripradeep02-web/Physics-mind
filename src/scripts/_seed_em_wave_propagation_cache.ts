/**
 * TEMP seed — em_wave_propagation into simulation_cache so `npm run visual:eyes` /
 * `smoke:visual-validator` can drive it. field_3d generation does not run
 * through the live Sonnet pipeline, so we assemble the sim HTML
 * deterministically from the JSON's field_3d_config and write one cache row.
 * Delete after the visual gate (mirrors _seed_displacement_current_cache.ts).
 *
 * NOTE (2026-07-25): the field_3d renderer's `scenario_type:
 * "em_wave_propagation"` engine delta is COMPLETE (field3d-surgeon commits
 * 961fe87 core + 6a0fa7f per-state add-ons) — this script is safe to run
 * against the live renderer once Supabase credentials are available.
 *
 * Trial-constraint note (json_author dispatch, 2026-07-25): this run makes
 * NO DB writes — this script is authored only, not executed, as part of
 * this dispatch. quality_auditor / the next pipeline stage runs it.
 *
 * Run: npx tsx --env-file=.env.local src/scripts/_seed_em_wave_propagation_cache.ts
 */
import '@/lib/loadEnvLocal';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { assembleField3DHtml, type Field3DConfig } from '@/lib/renderers/field_3d_renderer';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const CONCEPT_ID = 'em_wave_propagation';

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
        physics_config: { epic_l_path: json.epic_l_path },
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
