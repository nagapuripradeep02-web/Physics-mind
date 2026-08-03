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
 *   npx tsx --env-file=.env.local src/scripts/query_engine_bug_queue.ts --scenario newtons_laws_body
 *   npx tsx --env-file=.env.local src/scripts/query_engine_bug_queue.ts --pcpl           # all PCPL/parametric concepts
 *   npx tsx --env-file=.env.local src/scripts/query_engine_bug_queue.ts --row-type directive
 *   add --open to show only OPEN/DEFERRED rows (the unresolved scars to watch).
 *
 * Prints bug_class · severity · status · owner · concepts + the prevention_rule
 * (what to do BEFORE authoring) and probe_logic (what the gate runs).
 *
 * SCAR (2026-08-02, rotmech Phase 0): --field3d used to read a hand-maintained
 * 22-id array. The fleet had grown to 74 field_3d concepts, so the flag was blind
 * to 52 of them — including all ELEVEN newtons_laws_body concepts, the single
 * most-used scenario in the codebase and the family Ch.7's rolling concepts
 * extend. Five separate agents in one session had to hand-roll
 * `grep -rl "<scenario>" src/data/concepts/*.json` to reach rows the tool could
 * not surface, and two Checkpoint A reviews recorded that a clean --field3d sweep
 * is NOT coverage. The list is now DERIVED from the concept files at run time and
 * cannot drift again; --scenario is the query those agents actually wanted.
 *
 * SCAR, SECOND FORM (2026-08-03, E3b F-gate): the 2026-08-02 fix derived the list
 * from files but left the WALK non-recursive, so every concept under
 * src/data/concepts/chemistry/ was invisible: `--scenario bonding_scene` hard-exited
 * with "no concept declares scenario_type" while a chemistry concept was authoring
 * against that very scenario, and --field3d was blind to the whole chemistry
 * subject. The walk below recurses, and the loader FAILS LOUDLY if it finds no
 * concept files at all rather than reporting a clean sweep over an empty set.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { basename, join } from 'node:path';
import '@/lib/loadEnvLocal';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const CONCEPTS_DIR = join(process.cwd(), 'src', 'data', 'concepts');

interface ConceptIndexEntry {
  id: string;
  isField3d: boolean;
  scenarios: string[];
}

/**
 * Derive the field_3d fleet (and each concept's scenario_type set) from the
 * concept JSONs themselves. Never hand-maintain this — see the SCAR note above.
 */
function walkJson(dir: string): string[] {
  let out: string[] = [];
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) out = out.concat(walkJson(p));
    else if (e.name.endsWith('.json')) out.push(p);
  }
  return out;
}

function loadConceptIndex(): ConceptIndexEntry[] {
  let files: string[];
  try {
    files = walkJson(CONCEPTS_DIR);
  } catch {
    console.error(`could not read ${CONCEPTS_DIR} — run from the repo root.`);
    process.exit(1);
  }
  if (files.length === 0) {
    console.error(`no concept JSON found under ${CONCEPTS_DIR} — refusing to report a clean sweep over an empty set.`);
    process.exit(1);
  }
  return files.map((file) => {
    const raw = readFileSync(file, 'utf8');
    let id = basename(file, '.json');
    try {
      const parsed = JSON.parse(raw) as { concept_id?: string; id?: string };
      id = parsed.concept_id ?? parsed.id ?? id;
    } catch {
      // Malformed JSON: fall back to the filename rather than dropping the concept.
    }
    const scenarios = [...raw.matchAll(/"scenario_type"\s*:\s*"([a-z0-9_]+)"/g)].map((m) => m[1]);
    return { id, isField3d: raw.includes('"field_3d_config"'), scenarios: [...new Set(scenarios)] };
  });
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
  const scenario = arg('--scenario');
  const concept = argv.find((a) => !a.startsWith('--') && a !== owner && a !== rowType && a !== scenario);
  const field3d = argv.includes('--field3d');
  const pcpl = argv.includes('--pcpl');

  let field3dIds: string[] = [];
  let scenarioIds: string[] = [];
  if (field3d || scenario) {
    const index = loadConceptIndex();
    field3dIds = index.filter((c) => c.isField3d).map((c) => c.id);
    if (scenario) {
      scenarioIds = index.filter((c) => c.scenarios.includes(scenario)).map((c) => c.id);
      if (scenarioIds.length === 0) {
        console.error(`no concept declares scenario_type "${scenario}" — check the name.`);
        process.exit(1);
      }
    }
  }

  let q = supabaseAdmin
    .from('engine_bug_queue')
    .select('bug_class,title,severity,status,owner_cluster,row_type,concepts_affected,prevention_rule,probe_type,probe_logic')
    .order('severity', { ascending: true });

  if (concept) q = q.contains('concepts_affected', [concept]);
  else if (scenario) q = q.overlaps('concepts_affected', scenarioIds);
  else if (field3d) q = q.overlaps('concepts_affected', field3dIds);
  else if (pcpl) q = q.overlaps('concepts_affected', PCPL);
  if (owner) q = q.eq('owner_cluster', owner);
  if (rowType) q = q.eq('row_type', rowType);
  if (openOnly) q = q.in('status', ['OPEN', 'DEFERRED']);

  const { data, error } = await q;
  if (error) { console.error('query failed:', error.message); process.exit(1); }
  const rows = (data ?? []) as Row[];
  if (rows.length === 0) { console.log('No matching engine_bug_queue rows.'); return; }

  const scope = concept
    ?? (scenario ? `scenario "${scenario}" (${scenarioIds.length} concept(s): ${scenarioIds.join(', ')})`
      : field3d ? `all field_3d concepts (${field3dIds.length}, derived from src/data/concepts)`
        : pcpl ? 'all PCPL/parametric concepts'
          : owner ?? rowType ?? 'all');
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
