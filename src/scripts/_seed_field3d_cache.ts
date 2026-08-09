/**
 * TEMP seed — write one deterministic `simulation_cache` row for a field_3d concept
 * so `npm run visual:eyes` / `smoke:visual-validator` can drive it. field_3d
 * generation does not run through the live Sonnet pipeline, so the sim HTML is
 * assembled straight from the JSON's `field_3d_config`.
 *
 * Parameterised replacement for the one-file-per-concept `_seed_<id>_cache.ts`
 * pattern (mirrors `_seed_conservative_vs_nonconservative_forces_cache.ts` exactly;
 * same columns, same fingerprint shape). Delete the rows after the visual gate.
 *
 * Run: npx tsx --env-file=.env.local src/scripts/_seed_field3d_cache.ts <concept_id> [<concept_id> …]
 */
import '@/lib/loadEnvLocal';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { assembleField3DHtml, type Field3DConfig } from '@/lib/renderers/field_3d_renderer';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

interface ConceptJson {
    concept_id: string;
    field_3d_config?: Field3DConfig;
    epic_l_path?: Record<string, unknown>;
}

async function seedOne(conceptId: string): Promise<void> {
    const path = join(process.cwd(), 'src', 'data', 'concepts', `${conceptId}.json`);
    const json = JSON.parse(readFileSync(path, 'utf-8')) as ConceptJson;
    if (!json.field_3d_config) throw new Error(`${conceptId}: no field_3d_config in concept JSON`);

    const simHtml = assembleField3DHtml(json.field_3d_config);
    console.log(`[${conceptId}] assembled sim_html: ${simHtml.length} chars`);

    const del = await supabaseAdmin.from('simulation_cache').delete().eq('concept_key', conceptId);
    if (del.error) throw new Error(`${conceptId}: delete failed: ${del.error.message}`);

    const ins = await supabaseAdmin.from('simulation_cache').insert({
        concept_key: conceptId,
        concept_id: conceptId,
        sim_html: simHtml,
        physics_config: { epic_l_path: json.epic_l_path },
        teacher_script: null,
        sim_type: 'single',
        renderer_type: 'field_3d',
        engine: 'threejs',
        fingerprint_key: `${conceptId}|understand|12|conceptual|none`,
        served_count: 1,
    });
    if (ins.error) throw new Error(`${conceptId}: insert failed: ${ins.error.message}`);

    console.log(`✅ seeded simulation_cache for ${conceptId}`);
}

async function main(): Promise<void> {
    const ids = process.argv.slice(2).filter((a) => !a.startsWith('-'));
    if (ids.length === 0) {
        console.error('usage: _seed_field3d_cache.ts <concept_id> [<concept_id> …]');
        process.exit(1);
    }
    for (const id of ids) await seedOne(id);
    console.log(`\nseeded ${ids.length} concept(s).`);
}

main().catch((err) => {
    console.error('💥 seed failed:', err instanceof Error ? err.stack : err);
    process.exit(1);
});
