/**
 * Read-only status check for WP-F2 acceptance verification: current
 * simulation_cache row state for the 13 PCPL concepts in the regen scope.
 * Not a mutation script — SELECT only.
 *
 * Run: npx tsx --env-file=.env.local src/scripts/_query_pcpl_cache_state.ts
 */
import '@/lib/loadEnvLocal';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const CONCEPT_IDS = [
    'scalar_vs_vector', 'field_forces', 'contact_forces', 'normal_reaction',
    'tension_in_string', 'vector_resolution', 'hinge_force', 'free_body_diagram',
    'friction_static_kinetic', 'current_not_vector', 'pressure_scalar',
    'vector_head_to_tail', 'newton_second_law_direction',
];

async function main(): Promise<void> {
    const { data, error } = await supabaseAdmin
        .from('simulation_cache')
        .select('concept_id, concept_key, renderer_type, sim_type, pipeline_version, fingerprint_key, class_level, created_at')
        .in('concept_id', CONCEPT_IDS);
    if (error) throw new Error(`select failed: ${error.message}`);

    const byConcept: Record<string, typeof data> = {};
    for (const id of CONCEPT_IDS) byConcept[id] = [];
    for (const row of data ?? []) {
        const cid = (row as { concept_id: string }).concept_id;
        (byConcept[cid] ??= []).push(row as never);
    }

    console.log(`\n=== simulation_cache state for ${CONCEPT_IDS.length} PCPL concepts ===\n`);
    for (const id of CONCEPT_IDS) {
        const rows = byConcept[id] ?? [];
        if (rows.length === 0) {
            console.log(`${id.padEnd(28)}  NO ROWS`);
        } else {
            for (const r of rows as unknown as Record<string, unknown>[]) {
                console.log(`${id.padEnd(28)}  renderer=${r.renderer_type} sim_type=${r.sim_type} pipeline=${r.pipeline_version} class=${r.class_level} fp=${r.fingerprint_key} created=${r.created_at ?? 'n/a'}`);
            }
        }
    }
    console.log(`\nTOTAL rows: ${data?.length ?? 0}`);
}

main().catch((err) => {
    console.error('query failed:', err instanceof Error ? err.stack : err);
    process.exit(1);
});
