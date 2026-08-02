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
 *   npx tsx --env-file=.env.local src/scripts/query_engine_bug_queue.ts --pcpl           # all PCPL/parametric concepts
 *   npx tsx --env-file=.env.local src/scripts/query_engine_bug_queue.ts --row-type directive
 *   add --open to show only OPEN/DEFERRED rows (the unresolved scars to watch).
 *
 * Prints bug_class · severity · status · owner · concepts + the prevention_rule
 * (what to do BEFORE authoring) and probe_logic (what the gate runs).
 */
import '@/lib/loadEnvLocal';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

// The field_3d fleet, DERIVED at runtime rather than hand-listed.
//
// A hand-maintained literal rotted silently: until 2026-08-02 it named only the
// electrostatics/magnetism/EMI concepts and contained no `newtons_laws_body`,
// `force_rig`, `momentum_bench` or `kinematics_1d_track` concept at all — so
// `--field3d --open` hid every Ch.5 Laws-of-Motion and Ch.6 Work-Energy scar from
// anyone querying that way, with no warning that the list was partial.
//
// A concept renders on field_3d iff its JSON carries a top-level `field_3d_config`
// block (that is the exact condition `aiSimulationGenerator`'s strict-engines bypass
// tests before calling `assembleField3DHtml`), so read it from the files and the
// list cannot go stale again.
const CONCEPTS_DIR = join(process.cwd(), 'src', 'data', 'concepts');

function field3dConcepts(): string[] {
  const ids: string[] = [];
  for (const file of readdirSync(CONCEPTS_DIR)) {
    if (!file.endsWith('.json')) continue;
    let parsed: unknown;
    try {
      parsed = JSON.parse(readFileSync(join(CONCEPTS_DIR, file), 'utf8'));
    } catch {
      continue; // a malformed JSON is validate:concepts' problem, not this reader's
    }
    // Most files are one concept; the legacy Ch.3 bundle is an array of them.
    for (const c of Array.isArray(parsed) ? parsed : [parsed]) {
      const concept = c as { concept_id?: string; field_3d_config?: unknown };
      if (concept?.field_3d_config && concept.concept_id) ids.push(concept.concept_id);
    }
  }
  return ids.sort();
}

// PCPL / parametric_renderer.ts fleet (the Class-11 Vectors track + the legacy
// forces/vectors concepts on the parametric engine). Mirror of PCPL_CONCEPTS in
// aiSimulationGenerator.ts — keep in sync when a PCPL concept ships.
const PCPL = [
  'field_forces', 'contact_forces', 'normal_reaction', 'tension_in_string',
  'hinge_force', 'free_body_diagram', 'vector_resolution', 'resultant_formula',
  'direction_of_resultant', 'umbrella_tilt_angle', 'friction_static_kinetic',
  'current_not_vector', 'pressure_scalar', 'scalar_vs_vector',
  'vector_head_to_tail', 'newton_second_law_direction',
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
  const pcpl = argv.includes('--pcpl');

  let q = supabaseAdmin
    .from('engine_bug_queue')
    .select('bug_class,title,severity,status,owner_cluster,row_type,concepts_affected,prevention_rule,probe_type,probe_logic')
    .order('severity', { ascending: true });

  if (concept) q = q.contains('concepts_affected', [concept]);
  else if (field3d) q = q.overlaps('concepts_affected', field3dConcepts());
  else if (pcpl) q = q.overlaps('concepts_affected', PCPL);
  if (owner) q = q.eq('owner_cluster', owner);
  if (rowType) q = q.eq('row_type', rowType);
  if (openOnly) q = q.in('status', ['OPEN', 'DEFERRED']);

  const { data, error } = await q;
  if (error) { console.error('query failed:', error.message); process.exit(1); }
  const rows = (data ?? []) as Row[];
  if (rows.length === 0) { console.log('No matching engine_bug_queue rows.'); return; }

  const scope = concept ?? (field3d ? 'all field_3d concepts' : pcpl ? 'all PCPL/parametric concepts' : owner ?? rowType ?? 'all');
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
