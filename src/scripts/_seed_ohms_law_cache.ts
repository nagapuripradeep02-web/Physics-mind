/**
 * TEMP seed — ohms_law into simulation_cache so `npm run visual:eyes` /
 * `smoke:visual-validator` can drive it. Second 2D (particle_field) diamond
 * (Ch.3 #2): generation does not run through the live Sonnet pipeline, so we
 * assemble the sim HTML deterministically from the JSON's particle_field_config
 * and write one cache row. Mirrors _seed_drift_velocity_cache.ts. Delete after
 * the visual gate.
 *
 * Run: npx tsx --env-file=.env.local src/scripts/_seed_ohms_law_cache.ts
 */
import '@/lib/loadEnvLocal';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
    assembleParticleFieldHtml,
    type ParticleFieldAuthoredConfig,
} from '@/lib/renderers/particle_field_renderer';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const CONCEPT_ID = 'ohms_law';

interface ConceptJson {
    concept_id: string;
    particle_field_config?: ParticleFieldAuthoredConfig;
    epic_l_path?: Record<string, unknown>;
}

async function main(): Promise<void> {
    const path = join(process.cwd(), 'src', 'data', 'concepts', `${CONCEPT_ID}.json`);
    const json = JSON.parse(readFileSync(path, 'utf-8')) as ConceptJson;
    if (!json.particle_field_config) throw new Error('no particle_field_config in concept JSON');

    const simHtml = assembleParticleFieldHtml(json.particle_field_config);
    console.log(`Assembled sim_html: ${simHtml.length} chars`);

    const del = await supabaseAdmin.from('simulation_cache').delete().eq('concept_key', CONCEPT_ID);
    if (del.error) throw new Error(`delete failed: ${del.error.message}`);

    const ins = await supabaseAdmin.from('simulation_cache').insert({
        concept_key: CONCEPT_ID,
        concept_id: CONCEPT_ID,
        sim_html: simHtml,
        physics_config: {
            epic_l_path: json.epic_l_path,
            particle_field_config: json.particle_field_config,
        },
        teacher_script: null,
        sim_type: 'single',
        renderer_type: 'particle_field',
        engine: 'p5js',
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
