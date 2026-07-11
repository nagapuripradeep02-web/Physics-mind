/**
 * Seed engine_bug_queue with the renderer fix for parallel_plate_capacitor_field
 * STATE_2 ("Three probes — all identical") — quality-auditor FAIL-routed this to
 * peter_parker:renderer_primitives (2026-07-08). Root cause + fix + pixel-level
 * verification below; inserted directly as FIXED (fix landed + verified in the
 * same session that discovered it, mirroring the ppc_founder_fixes convention).
 *
 * Root cause: buildParallelPlatesField()'s probe_arrows / sheet_fields /
 * field_lines / test_charge-force-arrow groups never got the depthTest:false +
 * high renderOrder treatment that gauss_law_sphere/line/sheet already use for
 * the exact same situation (an arrow/probe reading through or against a
 * translucent shell/plate). Several of these arrows sit right against —
 * sometimes geometrically inside — the translucent +/- plate slabs (the
 * near-plate probes, all four sheet-field arrows, the fringe tubes whose
 * endpoints sit exactly at the plate face z, and the draggable test charge),
 * so without the fix they camouflage into a muddy blend of arrow-color +
 * plate-color instead of reading on top of the plate.
 *
 * Fix: mirrored the gauss_law depthTest:false + depthWrite:false + high
 * renderOrder (998) pattern onto platesArrowGroup() (covers probe_arrows,
 * sheet_fields, and the test_charge force arrow, all built through this one
 * helper), the field_lines shaft+head construction, the fringe tube
 * construction, and the test_charge sphere itself.
 *
 * Verified: re-seeded simulation_cache, re-ran visual:eyes (run
 * 20260708-172905, 26/26 deterministic checks passed), then pixel-scanned
 * STATE_2__frozen.png + STATE_5 dense frames (t02000..t22000, the gap-widen
 * sweep) + STATE_3/4/6 frozen for the muddy blend RGB (a 50/50 alpha
 * composite of the plate color over #66BB6A) — 0 muddy pixels found in every
 * frame; the STATE_2 green pixel mask now spans 37 separate arrow/line
 * clusters across the full plate width (x:504-804) instead of one narrow
 * region, and the STATE_5 gap-widen sweep shows a clean, unsplit green shaft
 * at every sampled frame.
 *
 * Idempotent: upsert onConflict 'bug_class'. Also writes the archival SQL.
 *
 * Run: npx tsx --env-file=.env.local src/scripts/_seed_engine_bug_queue_ppc_camouflaged_arrows.ts
 */
import '@/lib/loadEnvLocal';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const SESSION = 'session_2026-07-08_ppc_state2_probe_arrow_camouflage_fix';

type Owner =
  | 'alex:architect' | 'alex:physics_author' | 'alex:json_author'
  | 'peter_parker:renderer_primitives' | 'peter_parker:runtime_generation'
  | 'peter_parker:visual_validator' | 'ambiguous';
type Severity = 'CRITICAL' | 'MAJOR' | 'MODERATE';
type Status = 'OPEN' | 'FIXED' | 'DEFERRED' | 'NOT_REPRODUCING' | 'FALSE_POSITIVE';
type ProbeType = 'sql' | 'js_eval' | 'manual' | 'vision_model';
type RowType = 'incident' | 'directive';

interface Row {
  bug_class: string;
  title: string;
  severity: Severity;
  owner_cluster: Owner;
  root_cause: string;
  prevention_rule: string;
  probe_type: ProbeType;
  probe_logic: string;
  status: Status;
  concepts_affected: string[];
  fixed_in_files: string[];
  row_type: RowType;
}

const R = 'peter_parker:renderer_primitives';
const RENDERER = ['src/lib/renderers/field_3d_renderer.ts'];

const rows: Row[] = [
  {
    bug_class: 'pp_probe_and_sheet_arrows_camouflaged_by_translucent_plate_blend',
    title: 'Probe arrows / sheet-field arrows / field lines / test-charge force arrow in parallel_plates camouflage into a muddy plate-color blend instead of reading on top of the translucent +/- plates',
    severity: 'MAJOR',
    owner_cluster: R,
    root_cause: 'buildParallelPlatesField() never applied depthTest:false + high renderOrder to its probe_arrows, sheet_fields, field_lines, fringe, or test_charge/force-arrow primitive groups — the exact same "reads through a translucent shell" situation gauss_law_sphere/line/sheet already solve elsewhere in this file (gsphMakeThickVector ~22219, gln cap-graze arrows ~23805, gsph_inside_probe ~22409). Two of the three STATE_2 probe arrows (near +/- plate) sit close to or inside the translucent plate slab in z, and without the fix the default THREE.js transparent depthTest/depthWrite ordering blends the plate alpha over the arrow, producing a muddy tan/gold that is visually indistinguishable from the background field lines — destroying the PRIMARY aha (three IDENTICAL probe arrows proving uniform field). The same mechanism produced a mid-shaft color-split on the field lines during the STATE_5 gap-widen sweep.',
    prevention_rule: 'Any field_3d arrow/line/probe primitive that is authored to sit at, near, or inside a translucent shell/plate/sheet mesh MUST get depthTest:false + depthWrite:false + a high renderOrder (>= 998, above the shell/plate default of 0) at construction time — never rely on THREE.js default transparent-object depth sorting to get the visual layering right. Apply this at the shared arrow-building helper (platesArrowGroup here) so every caller inherits it, not per call-site.',
    probe_type: 'manual',
    probe_logic: 'STATE_2 of parallel_plate_capacitor_field: sample RGB at all 3 probe-arrow positions in the frozen frame — all 3 must match the authored #66BB6A (within tolerance) and match each other; a connected-component scan of the green mask must show pixels spread across the FULL plate width (not clustered in one narrow region); a scan for the 50/50 plate-color/#66BB6A blend RGB must return 0 matches anywhere in the frame. Repeat the blend-color scan across the STATE_5 gap-widen dense frames (t00000..t24000) — 0 matches at every sampled frame confirms no mid-shaft color-split.',
    status: 'FIXED',
    concepts_affected: ['parallel_plate_capacitor_field'],
    fixed_in_files: RENDERER,
    row_type: 'incident',
  },
];

function sqlStr(s: string): string { return `'${s.replace(/'/g, "''")}'`; }
function sqlArr(a: string[]): string {
  if (a.length === 0) return `ARRAY[]::text[]`;
  return `ARRAY[${a.map(sqlStr).join(', ')}]`;
}
function sqlRow(r: Row): string {
  return `(${sqlStr(r.bug_class)}, ${sqlStr(r.title)}, ${sqlStr(r.severity)}, ${sqlStr(r.owner_cluster)}, ` +
    `${sqlStr(r.root_cause)}, ${sqlStr(r.prevention_rule)}, ${sqlStr(r.probe_type)}, ${sqlStr(r.probe_logic)}, ` +
    `${sqlStr(r.status)}, ${sqlArr(r.concepts_affected)}, ${sqlArr(r.fixed_in_files)}, ${sqlStr(SESSION)}, ${sqlStr(r.row_type)})`;
}
function emitSql(all: Row[]): string {
  const cols = 'bug_class, title, severity, owner_cluster, root_cause, prevention_rule, probe_type, probe_logic, status, concepts_affected, fixed_in_files, discovered_in_session, row_type';
  return `-- ============================================================================
-- 2026-07-08: seed engine_bug_queue with the parallel_plate_capacitor_field
-- STATE_2 probe-arrow camouflage fix (translucent-plate depthTest/renderOrder).
-- Generated by
-- src/scripts/_seed_engine_bug_queue_ppc_camouflaged_arrows.ts — idempotent.
-- ============================================================================

INSERT INTO engine_bug_queue (${cols}) VALUES
${all.map(sqlRow).join(',\n')}
ON CONFLICT (bug_class) DO UPDATE SET
  title = EXCLUDED.title, severity = EXCLUDED.severity, owner_cluster = EXCLUDED.owner_cluster,
  root_cause = EXCLUDED.root_cause, prevention_rule = EXCLUDED.prevention_rule,
  probe_type = EXCLUDED.probe_type, probe_logic = EXCLUDED.probe_logic,
  status = EXCLUDED.status, concepts_affected = EXCLUDED.concepts_affected,
  fixed_in_files = EXCLUDED.fixed_in_files, row_type = EXCLUDED.row_type;
`;
}

async function upsertBatch(rowsIn: Row[], label: string): Promise<boolean> {
  const payload = rowsIn.map((r) => ({ ...r, discovered_in_session: SESSION }));
  const { error } = await supabaseAdmin
    .from('engine_bug_queue')
    .upsert(payload, { onConflict: 'bug_class' });
  if (error) {
    console.error(`  x ${label} upsert failed: ${error.message}`);
    return false;
  }
  console.log(`  ok ${label}: ${rowsIn.length} rows upserted`);
  return true;
}

async function main(): Promise<void> {
  const sqlPath = join(process.cwd(), 'supabase_migrations', 'supabase_2026-07-08_seed_engine_bug_queue_ppc_camouflaged_arrows_migration.sql');
  writeFileSync(sqlPath, emitSql(rows), 'utf-8');
  console.log(`Wrote archival SQL: ${sqlPath} (${rows.length} rows)`);

  console.log('Upserting ppc camouflaged-arrows fix row...');
  await upsertBatch(rows, 'ppc_camouflaged_arrows');

  const { data, error } = await supabaseAdmin
    .from('engine_bug_queue')
    .select('bug_class, status')
    .eq('discovered_in_session', SESSION);
  if (error) { console.error('verify query failed:', error.message); return; }
  console.log('In engine_bug_queue for this session:');
  for (const row of data ?? []) console.log(`  [${row.status}] ${row.bug_class}`);
}

main().catch((err) => {
  console.error('seed failed:', err instanceof Error ? err.stack : err);
  process.exit(1);
});
