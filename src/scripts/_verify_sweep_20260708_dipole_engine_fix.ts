/**
 * Verification pass for the dipole-engine regen sweep (2026-07-08).
 * Confirms post-sweep row counts + fingerprint_key / updated_at for the
 * 3 affected concepts across simulation_cache, deep_dive_cache, drill_down_cache.
 *
 * Run: npx tsx --env-file=.env.local src/scripts/_verify_sweep_20260708_dipole_engine_fix.ts
 */
import '@/lib/loadEnvLocal';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const CONCEPT_IDS = [
    'potential_energy_in_external_field',
    'electric_dipole_in_field',
    'bar_magnet_in_uniform_field',
] as const;

async function main(): Promise<void> {
    for (const id of CONCEPT_IDS) {
        console.log(`\n=== ${id} ===`);

        const sim = await supabaseAdmin
            .from('simulation_cache')
            .select('concept_key, fingerprint_key, renderer_type, served_count, created_at')
            .eq('concept_key', id);
        console.log('simulation_cache rows:', sim.data?.length ?? 0, sim.error ? `ERROR: ${sim.error.message}` : '');
        console.log(sim.data);

        const dd = await supabaseAdmin
            .from('deep_dive_cache')
            .select('fingerprint_key, state_id, status')
            .eq('concept_id', id);
        console.log('deep_dive_cache rows:', dd.data?.length ?? 0, dd.error ? `ERROR: ${dd.error.message}` : '');

        const drd = await supabaseAdmin
            .from('drill_down_cache')
            .select('fingerprint_key, cluster_id, status')
            .eq('concept_id', id);
        console.log('drill_down_cache rows:', drd.data?.length ?? 0, drd.error ? `ERROR: ${drd.error.message}` : '');
    }
}

main().catch((err) => {
    console.error('VERIFY FAILED:', err instanceof Error ? err.stack : err);
    process.exit(1);
});
