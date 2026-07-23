/**
 * Cache sweep for the renderer_primitives → runtime_generation regen directive
 * ("*_expr fields now merge PM_physics.derived via PM_liveVarsWithDerived()" —
 * session 2026-07-23, bug_class `parametric_expr_field_scope_missing_derived`).
 *
 * Deletes stale `simulation_cache` rows (built by the PRE-FIX renderer bundle)
 * for the 11 affected concept_ids, scoped ONLY to simulation_cache (the
 * directive names no other table). Logs a before/after count so the sweep is
 * auditable per CLAUDE.md §6 "Step 1 before Step 2" convention.
 *
 * Run: npx tsx --env-file=.env.local src/scripts/_regen_parametric_expr_derived_scope_sweep.ts
 */
import '@/lib/loadEnvLocal';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const CONCEPT_IDS = [
  'scalar_vs_vector', 'contact_forces', 'current_not_vector', 'field_forces',
  'friction_static_kinetic', 'hinge_force', 'newton_second_law_direction',
  'normal_reaction', 'pressure_scalar', 'tension_in_string', 'vector_resolution',
];

async function countByConcept(): Promise<Record<string, number>> {
  const { data, error } = await supabaseAdmin
    .from('simulation_cache')
    .select('concept_id')
    .in('concept_id', CONCEPT_IDS);
  if (error) throw new Error(`select failed: ${error.message}`);
  const counts: Record<string, number> = {};
  for (const id of CONCEPT_IDS) counts[id] = 0;
  for (const row of data ?? []) {
    const cid = (row as { concept_id: string }).concept_id;
    counts[cid] = (counts[cid] ?? 0) + 1;
  }
  return counts;
}

async function main(): Promise<void> {
  console.log(`\n=== Step 1: enumerate simulation_cache rows for ${CONCEPT_IDS.length} affected concept_ids ===`);
  const before = await countByConcept();
  let totalBefore = 0;
  for (const id of CONCEPT_IDS) {
    console.log(`  ${id}: ${before[id]} row(s)`);
    totalBefore += before[id];
  }
  console.log(`  TOTAL: ${totalBefore} row(s)`);

  console.log(`\n=== Step 2: DELETE simulation_cache WHERE concept_id IN (...) ===`);
  const { error: delErr, count } = await supabaseAdmin
    .from('simulation_cache')
    .delete({ count: 'exact' })
    .in('concept_id', CONCEPT_IDS);
  if (delErr) throw new Error(`delete failed: ${delErr.message}`);
  console.log(`  deleted ${count ?? 'unknown'} row(s)`);

  console.log(`\n=== Step 3: verify 0 remain ===`);
  const after = await countByConcept();
  let totalAfter = 0;
  for (const id of CONCEPT_IDS) {
    console.log(`  ${id}: ${after[id]} row(s)`);
    totalAfter += after[id];
  }
  console.log(`  TOTAL: ${totalAfter} row(s)`);

  if (totalAfter !== 0) {
    console.error(`\n⚠️  ${totalAfter} row(s) still present after delete — investigate before declaring sweep done.`);
    process.exit(1);
  }
  console.log(`\n✅ Sweep confirmed clean. Next request for any of these ${CONCEPT_IDS.length} concepts regenerates through the fixed renderer.`);
}

main().catch((err) => {
  console.error('💥 sweep failed:', err instanceof Error ? err.stack : err);
  process.exit(1);
});
