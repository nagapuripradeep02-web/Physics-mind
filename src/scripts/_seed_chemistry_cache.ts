/**
 * Seed a CHEMISTRY concept into simulation_cache so `npm run visual:eyes` /
 * `smoke:visual-validator` can drive it.
 *
 * Why this exists: THE EYE reads the sim from the `simulation_cache` table, NOT
 * from the concept JSON (the review-site path renders straight from JSON and
 * needs no cache). Chemistry concepts live in src/data/concepts/chemistry/ and
 * never run through the live generation pipeline, so without a seed row the
 * visual gate simply cannot see them — this was the single hard blocker keeping
 * chemistry off physics-grade visual verification.
 *
 * Generalised over the chemistry namespace (unlike the per-concept physics
 * `_seed_<id>_cache.ts` scripts) and renderer-aware: parametric-family concepts
 * assemble via assembleParametricHtml, field_3d via assembleField3DHtml.
 *
 * Run: npx tsx --env-file=.env.local src/scripts/_seed_chemistry_cache.ts <concept_id>
 */
import '@/lib/loadEnvLocal';
import { readFileSync } from 'node:fs';
import { assembleField3DHtml, type Field3DConfig } from '@/lib/renderers/field_3d_renderer';
import { assembleParametricHtml } from '@/lib/renderers/parametric_renderer';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { resolveConceptJsonPath } from './lib/resolveConceptJson';
import {
    buildParametricConfig,
    isParametricConcept,
    type ParametricSourceJson,
} from './lib/buildParametricConfig';

type ConceptJson = ParametricSourceJson & {
    field_3d_config?: Field3DConfig;
    epic_l_path?: Record<string, unknown>;
};

async function main(): Promise<void> {
    const conceptId = process.argv[2];
    if (!conceptId) {
        console.error('Usage: npx tsx --env-file=.env.local src/scripts/_seed_chemistry_cache.ts <concept_id>');
        process.exit(1);
    }

    const resolved = resolveConceptJsonPath(conceptId);
    if (!resolved) throw new Error(`concept JSON not found for "${conceptId}"`);
    const json = JSON.parse(readFileSync(resolved.path, 'utf-8')) as ConceptJson;

    // Renderer-aware assembly. THE EYE captures frozen baselines, so the
    // parametric sim is seeded at its NATIVE 760x500 design size (responsiveFill
    // OFF) — a viewport-dependent fit transform would make every frozen frame
    // depend on the capture window size.
    let simHtml: string;
    let rendererType: string;
    let engine: string;

    if (json.field_3d_config) {
        simHtml = assembleField3DHtml(json.field_3d_config);
        rendererType = 'field_3d';
        engine = 'threejs';
    } else if (isParametricConcept(json)) {
        simHtml = assembleParametricHtml(buildParametricConfig(conceptId, json));
        rendererType = 'parametric';
        engine = 'p5';
    } else {
        throw new Error(
            `"${conceptId}" has no field_3d_config and renderer_pair.panel_a is not "parametric" — ` +
            'no seedable renderer family.',
        );
    }

    console.log(`[${resolved.subject}] ${conceptId} → ${rendererType}; sim_html ${simHtml.length} chars`);

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
