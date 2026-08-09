/**
 * Seed a SUBJECT-NAMESPACE concept (chemistry or mathematics) into
 * simulation_cache so `npm run visual:eyes` / `smoke:visual-validator` can drive it.
 *
 * Why this exists: THE EYE reads the sim from the `simulation_cache` table, NOT
 * from the concept JSON (the review-site path renders straight from JSON and
 * needs no cache). Subject-namespace concepts live in src/data/concepts/<subject>/
 * and never run through the live generation pipeline — they register at site #1
 * only, the isolation contract — so without a seed row the visual gate simply
 * cannot see them. This was the single hard blocker keeping chemistry off
 * physics-grade visual verification, and it binds mathematics identically.
 *
 * RENAMED 2026-08-04 from `_seed_chemistry_cache.ts`. Nothing in its code ever
 * gated on chemistry: it resolves through resolveConceptJsonPath and dispatches on
 * the engine config block, so it has always been namespace-general — only the name
 * said otherwise, which made it undiscoverable the moment a third subject existed.
 * Historical session logs and scar rows still cite the old name; they are records
 * of what was true then and were deliberately left unedited.
 *
 * Generalised over the subject namespaces (unlike the per-concept physics
 * `_seed_<id>_cache.ts` scripts) and renderer-aware: parametric-family concepts
 * assemble via assembleParametricHtml, field_3d via assembleField3DHtml.
 *
 * Run: npx tsx --env-file=.env.local src/scripts/_seed_subject_cache.ts <concept_id>
 */
import '@/lib/loadEnvLocal';
import { readFileSync } from 'node:fs';
import { assembleField3DHtml, type Field3DConfig } from '@/lib/renderers/field_3d_renderer';
import { assembleParametricHtml } from '@/lib/renderers/parametric_renderer';
import {
    assembleParticleFieldHtml,
    type ParticleFieldAuthoredConfig,
} from '@/lib/renderers/particle_field_renderer';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { resolveConceptJsonPath } from './lib/resolveConceptJson';
import { assembleSimFromSource } from './lib/assembleSimFromSource';
import {
    buildParametricConfig,
    isParametricConcept,
    type ParametricSourceJson,
} from './lib/buildParametricConfig';

type ConceptJson = ParametricSourceJson & {
    field_3d_config?: Field3DConfig;
    particle_field_config?: ParticleFieldAuthoredConfig;
    epic_l_path?: Record<string, unknown>;
};

async function main(): Promise<void> {
    const conceptId = process.argv[2];
    if (!conceptId) {
        console.error('Usage: npx tsx --env-file=.env.local src/scripts/_seed_subject_cache.ts <concept_id>');
        process.exit(1);
    }

    // Assembly is shared with loadCachedSim's staleness gate, so the row this
    // writes and the row that gate checks are produced by the SAME code.
    const built = assembleSimFromSource(conceptId);
    if (!built) {
        throw new Error(
            `"${conceptId}" has no field_3d_config, no particle_field_config, and ` +
            'renderer_pair.panel_a is not "parametric" — no seedable renderer family.',
        );
    }
    const { simHtml, rendererType, engine, json, subject } = built;

    console.log(`[${subject}] ${conceptId} → ${rendererType}; sim_html ${simHtml.length} chars`);

    const del = await supabaseAdmin.from('simulation_cache').delete().eq('concept_key', conceptId);
    if (del.error) throw new Error(`delete failed: ${del.error.message}`);

    const ins = await supabaseAdmin.from('simulation_cache').insert({
        concept_key: conceptId,
        concept_id: conceptId,
        sim_html: simHtml,
        physics_config: { epic_l_path: json.epic_l_path },
        teacher_script: null,
        sim_type: 'single',
        renderer_type: rendererType,
        engine,
        fingerprint_key: `${conceptId}|understand|11|conceptual|none`,
        served_count: 1,
    });
    if (ins.error) throw new Error(`insert failed: ${ins.error.message}`);

    console.log(`✅ Seeded simulation_cache for ${conceptId} — THE EYE can now drive it.`);
    console.log(`   Next: npm run visual:eyes -- ${conceptId}`);
}

main().catch((err) => {
    console.error('💥 seed failed:', err instanceof Error ? err.stack : err);
    process.exit(1);
});
