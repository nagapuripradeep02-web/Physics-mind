/**
 * Concept-scoped regen sweep for displacement_vs_distance, executing the
 * incoming RENDERER REGEN DIRECTIVE from renderer_primitives (kinematics_1d_track
 * field_3d scenario build + buildScenario() default-case field_lines.count crash fix).
 *
 * Step 1: enumerate affected simulation_cache rows (scope verification).
 * Step 2: targeted DELETE WHERE concept_id = 'displacement_vs_distance'.
 *
 * Run: npx tsx --env-file=.env.local src/scripts/_regen_sweep_displacement_vs_distance.ts
 */
import '@/lib/loadEnvLocal';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const CONCEPT_ID = 'displacement_vs_distance';

async function main(): Promise<void> {
    // Step 1: enumerate
    const { data, error } = await supabaseAdmin
        .from('simulation_cache')
        .select('concept_id, concept_key, renderer_type, sim_type, pipeline_version, fingerprint_key, class_level, created_at')
        .eq('concept_id', CONCEPT_ID);
    if (error) throw new Error(`select failed: ${error.message}`);

    console.log(`\n=== STEP 1: simulation_cache rows for ${CONCEPT_ID} (pre-delete) ===\n`);
    if (!data || data.length === 0) {
        console.log('NO ROWS FOUND.');
    } else {
        for (const r of data as unknown as Record<string, unknown>[]) {
            console.log(`renderer=${r.renderer_type} sim_type=${r.sim_type} pipeline=${r.pipeline_version} class=${r.class_level} fp=${r.fingerprint_key} created=${r.created_at ?? 'n/a'}`);
        }
    }
    console.log(`\nROW COUNT: ${data?.length ?? 0}`);

    // Step 2: targeted delete (only runs a DELETE statement if rows exist;
    // still issue it either way for an idempotent, verifiable sweep)
    const { error: delError, count } = await supabaseAdmin
        .from('simulation_cache')
        .delete({ count: 'exact' })
        .eq('concept_id', CONCEPT_ID);
    if (delError) throw new Error(`delete failed: ${delError.message}`);

    console.log(`\n=== STEP 2: DELETE FROM simulation_cache WHERE concept_id = '${CONCEPT_ID}' ===`);
    console.log(`ROWS DELETED: ${count ?? 0}`);

    // Verify: re-select should be empty
    const { data: after, error: afterErr } = await supabaseAdmin
        .from('simulation_cache')
        .select('concept_id')
        .eq('concept_id', CONCEPT_ID);
    if (afterErr) throw new Error(`post-delete verify select failed: ${afterErr.message}`);
    console.log(`POST-DELETE ROW COUNT: ${after?.length ?? 0}`);
}

main().catch((err) => {
    console.error('sweep failed:', err instanceof Error ? err.stack : err);
    process.exit(1);
});
