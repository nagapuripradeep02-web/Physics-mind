/**
 * TEMP seed — electric_potential_meaning into simulation_cache so
 * `npm run visual:eyes` / `smoke:visual-validator` can drive it. field_3d
 * generation does not run through the live Sonnet pipeline, so we assemble the
 * sim HTML deterministically from the JSON's field_3d_config (exactly what the
 * admin test page does) and write one cache row. Delete this script after the
 * visual gate (mirrors the retired _seed_gauss_law_sphere_cache.ts /
 * _seed_electric_flux_cache.ts).
 *
 * NOTE: the electric_potential_meaning primitives (config-driven labelled
 * equipotential shells, route-animating test charge + work tally, ΔV/∞ markers,
 * draggable V-readout explorer) are NEW engine work in field_3d_renderer.ts
 * (peter_parker:renderer-primitives, FOUNDER-APPROVED). This row must be seeded
 * AFTER that engine change so the cached iframe HTML embeds the new
 * FIELD_3D_RENDERER_CODE. Re-seed (DELETE + re-run) if the renderer changes.
 *
 * Run: npx tsx --env-file=.env.local src/scripts/_seed_electric_potential_meaning_cache.ts
 */
import '@/lib/loadEnvLocal';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { assembleField3DHtml, type Field3DConfig } from '@/lib/renderers/field_3d_renderer';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const CONCEPT_ID = 'electric_potential_meaning';

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

    // surgical clear — only this concept's rows.
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
