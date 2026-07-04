/**
 * Read-only engine_bug_queue reader — the headless Gate 8 / pre-flight lookup.
 *
 * WHY: quality_auditor Gate 8 (and the architect/renderer/json_author pre-flight)
 * must consult the scar list BEFORE authoring/auditing a concept. The Supabase MCP
 * needs interactive OAuth (won't run headless), so use supabaseAdmin (service-role
 * key in .env.local) the same way the seed scripts do.
 *
 * Usage:
 *   npx tsx --env-file=.env.local src/scripts/query_engine_bug_queue.ts <concept_id>
 *   npx tsx --env-file=.env.local src/scripts/query_engine_bug_queue.ts --owner peter_parker:renderer_primitives
 *   npx tsx --env-file=.env.local src/scripts/query_engine_bug_queue.ts --field3d        # all field_3d concepts
 *   npx tsx --env-file=.env.local src/scripts/query_engine_bug_queue.ts --row-type directive
 *   add --open to show only OPEN/DEFERRED rows (the unresolved scars to watch).
 *
 * Prints bug_class · severity · status · owner · concepts + the prevention_rule
 * (what to do BEFORE authoring) and probe_logic (what the gate runs).
 */
import '@/lib/loadEnvLocal';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const FIELD3D = [
  'gauss_law', 'gauss_law_sphere', 'gauss_law_solid_sphere', 'electric_flux', 'charge_distribution',
  'electric_dipole_in_field', 'electric_field_dipole', 'magnetic_field_concept_B',
  'magnetic_field_wire', 'magnetic_field_solenoid', 'magnetic_force_moving_charge',
  'magnetic_force_direction_right_hand_rule', 'magnetic_force_perpendicular_no_work',
  'torque_on_current_loop_in_field', 'circular_motion_charge_in_uniform_B',
  'helical_motion_charge_in_uniform_B',
  'cyclotron_period_independent_of_speed',
  // Ch.6 Electromagnetic Induction (field_3d)
  'faraday_law_induction', 'motional_emf', 'eddy_currents', 'inductance', 'ac_generator',
];

interface Row {
  bug_class: string; title: string; severity: string; status: string;
  owner_cluster: string; row_type: string; concepts_affected: string[];
  prevention_rule: string; probe_type: string; probe_logic: string;
}

function arg(flag: string): string | undefined {
  const i = process.argv.indexOf(flag);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

async function main(): Promise<void> {
  const argv = process.argv.slice(2);
  const openOnly = argv.includes('--open');
  const owner = arg('--owner');
  const rowType = arg('--row-type');
  const concept = argv.find((a) => !a.startsWith('--') && a !== owner && a !== rowType);
  const field3d = argv.includes('--field3d');

  let q = supabaseAdmin
    .from('engine_bug_queue')
    .select('bug_class,title,severity,status,owner_cluster,row_type,concepts_affected,prevention_rule,probe_type,probe_logic')
    .order('severity', { ascending: true });

  if (concept) q = q.contains('concepts_affected', [concept]);
  else if (field3d) q = q.overlaps('concepts_affected', FIELD3D);
  if (owner) q = q.eq('owner_cluster', owner);
  if (rowType) q = q.eq('row_type', rowType);
  if (openOnly) q = q.in('status', ['OPEN', 'DEFERRED']);

  const { data, error } = await q;
  if (error) { console.error('query failed:', error.message); process.exit(1); }
  const rows = (data ?? []) as Row[];
  if (rows.length === 0) { console.log('No matching engine_bug_queue rows.'); return; }

  const scope = concept ?? (field3d ? 'all field_3d concepts' : owner ?? rowType ?? 'all');
  console.log(`\nengine_bug_queue — ${rows.length} row(s) for: ${scope}${openOnly ? ' (OPEN/DEFERRED only)' : ''}\n`);
  for (const r of rows) {
    const tag = r.row_type === 'directive' ? 'DIRECTIVE' : r.severity;
    console.log(`● [${tag}/${r.status}] ${r.bug_class}  (${r.owner_cluster})`);
    console.log(`    ${r.title}`);
    console.log(`    concepts: ${(r.concepts_affected ?? []).join(', ') || '(generic)'}`);
    console.log(`    DO: ${r.prevention_rule}`);
    if (r.probe_type !== 'manual') console.log(`    PROBE(${r.probe_type}): ${r.probe_logic}`);
    console.log('');
  }
}

main().catch((err) => {
  console.error('query error:', err instanceof Error ? err.stack : err);
  process.exit(1);
});
