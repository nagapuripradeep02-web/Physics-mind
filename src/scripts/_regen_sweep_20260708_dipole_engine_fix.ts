/**
 * RUNTIME REGEN — executing incoming directive from peter_parker:renderer_primitives
 * (session 2026-07-08): dipole engine p-vector/field-switch-on growth timers
 * rewritten as pure functions of (time - stateStartTime); REPLAY_ANIMATIONS
 * scenario_type allowlist replaced with a generic shared-group check.
 *
 * Scoped sweep across simulation_cache (concept_key / fingerprint_key) +
 * deep_dive_cache (concept_id) + drill_down_cache (concept_id) for the 3
 * affected concepts, followed by a simulation_cache re-seed (mirrors the
 * existing _seed_<id>_cache.ts pattern — this script re-does the delete+insert
 * explicitly, through the runtime_generation sanctioned path, rather than
 * trusting the prior ad-hoc reseeds referenced in the directive).
 *
 * Run: npx tsx --env-file=.env.local src/scripts/_regen_sweep_20260708_dipole_engine_fix.ts
 */
import '@/lib/loadEnvLocal';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { assembleField3DHtml, type Field3DConfig } from '@/lib/renderers/field_3d_renderer';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const CONCEPT_IDS = [
    'potential_energy_in_external_field',
    'electric_dipole_in_field',
    'bar_magnet_in_uniform_field',
] as const;

interface ConceptJson {
    concept_id: string;
    field_3d_config?: Field3DConfig;
    epic_l_path?: Record<string, unknown>;
    teacher_script?: unknown;
}

async function countRows(table: string, conceptId: string, scopeCol: 'concept_id' | 'concept_key'): Promise<number> {
    const { count, error } = await supabaseAdmin
        .from(table)
        .select('id', { count: 'exact', head: true })
        .eq(scopeCol, conceptId);
    if (error) throw new Error(`count failed on ${table} for ${conceptId}: ${error.message}`);
    return count ?? 0;
}

async function countSimCacheByFingerprint(conceptId: string): Promise<number> {
    const { count, error } = await supabaseAdmin
        .from('simulation_cache')
        .select('id', { count: 'exact', head: true })
        .like('fingerprint_key', `${conceptId}%`);
    if (error) throw new Error(`fingerprint count failed for ${conceptId}: ${error.message}`);
    return count ?? 0;
}

async function main(): Promise<void> {
    console.log('='.repeat(70));
    console.log('BEFORE-SWEEP ROW COUNTS');
    console.log('='.repeat(70));

    const before: Record<string, { sim_by_key: number; sim_by_fp: number; deep_dive: number; drill_down: number }> = {};

    for (const id of CONCEPT_IDS) {
        const simByKey = await countRows('simulation_cache', id, 'concept_key');
        const simByFp = await countSimCacheByFingerprint(id);
        const dd = await countRows('deep_dive_cache', id, 'concept_id');
        const drd = await countRows('drill_down_cache', id, 'concept_id');
        before[id] = { sim_by_key: simByKey, sim_by_fp: simByFp, deep_dive: dd, drill_down: drd };
        console.log(`${id}:`);
        console.log(`  simulation_cache (concept_key=)      : ${simByKey}`);
        console.log(`  simulation_cache (fingerprint_key ~) : ${simByFp}`);
        console.log(`  deep_dive_cache (concept_id=)        : ${dd}`);
        console.log(`  drill_down_cache (concept_id=)       : ${drd}`);
    }

    console.log('\n' + '='.repeat(70));
    console.log('SCOPED DELETE SWEEP');
    console.log('='.repeat(70));

    for (const id of CONCEPT_IDS) {
        const delSimKey = await supabaseAdmin.from('simulation_cache').delete().eq('concept_key', id);
        if (delSimKey.error) throw new Error(`simulation_cache delete (concept_key) failed for ${id}: ${delSimKey.error.message}`);

        const delSimFp = await supabaseAdmin.from('simulation_cache').delete().like('fingerprint_key', `${id}%`);
        if (delSimFp.error) throw new Error(`simulation_cache delete (fingerprint_key) failed for ${id}: ${delSimFp.error.message}`);

        const delDD = await supabaseAdmin.from('deep_dive_cache').delete().eq('concept_id', id);
        if (delDD.error) throw new Error(`deep_dive_cache delete failed for ${id}: ${delDD.error.message}`);

        const delDRD = await supabaseAdmin.from('drill_down_cache').delete().eq('concept_id', id);
        if (delDRD.error) throw new Error(`drill_down_cache delete failed for ${id}: ${delDRD.error.message}`);

        console.log(`${id}: deleted simulation_cache (concept_key + fingerprint_key scoped), deep_dive_cache, drill_down_cache rows.`);
    }

    console.log('\n' + '='.repeat(70));
    console.log('RE-SEED simulation_cache');
    console.log('='.repeat(70));

    for (const id of CONCEPT_IDS) {
        const path = join(process.cwd(), 'src', 'data', 'concepts', `${id}.json`);
        const json = JSON.parse(readFileSync(path, 'utf-8')) as ConceptJson;
        if (!json.field_3d_config) throw new Error(`no field_3d_config in concept JSON for ${id}`);

        const simHtml = assembleField3DHtml(json.field_3d_config);
        console.log(`${id}: assembled sim_html (${simHtml.length} chars) from current field_3d_renderer.ts`);

        const ins = await supabaseAdmin.from('simulation_cache').insert({
            concept_key: id,
            concept_id: id,
            sim_html: simHtml,
            physics_config: { epic_l_path: json.epic_l_path },
            teacher_script: null,
            sim_type: 'single',
            renderer_type: 'field_3d',
            engine: 'threejs',
            fingerprint_key: `${id}|understand|12|conceptual|none`,
            served_count: 1,
        });
        if (ins.error) throw new Error(`insert failed for ${id}: ${ins.error.message}`);
        console.log(`${id}: re-seeded simulation_cache (1 row, fingerprint_key=${id}|understand|12|conceptual|none)`);
    }

    console.log('\n' + '='.repeat(70));
    console.log('AFTER-SWEEP ROW COUNTS (verification)');
    console.log('='.repeat(70));

    for (const id of CONCEPT_IDS) {
        const simByKey = await countRows('simulation_cache', id, 'concept_key');
        const dd = await countRows('deep_dive_cache', id, 'concept_id');
        const drd = await countRows('drill_down_cache', id, 'concept_id');
        console.log(`${id}: simulation_cache=${simByKey} (expect 1) deep_dive_cache=${dd} (expect 0) drill_down_cache=${drd} (expect 0)`);
    }

    console.log('\nBEFORE-SWEEP SUMMARY (JSON):');
    console.log(JSON.stringify(before, null, 2));
    console.log('\ndone.');
}

main().catch((err) => {
    console.error('SWEEP FAILED:', err instanceof Error ? err.stack : err);
    process.exit(1);
});
