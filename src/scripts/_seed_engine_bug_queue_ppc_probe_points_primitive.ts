/**
 * Seed engine_bug_queue with a DIRECTIVE row documenting the new `probe_points`
 * primitive built for parallel_plate_capacitor_field STATE_2 (founder-directed
 * feature request, 2026-07-08): replace the 3 identical probe ARROWS with 3
 * labeled POINTS (A/B/C) + live numeric E readouts, proving field uniformity
 * via matching NUMBERS instead of matching arrow geometry.
 *
 * This is additive, not a bug fix — probe_arrows is untouched and still works.
 * Filed as a DIRECTIVE (mirrors magnetic_flux_loop_scenario_new_build) so the
 * next session/agent that reads the queue knows the primitive exists, where it
 * lives, and the one gotcha (all 3 readouts must reuse the SAME E computation
 * so they show the identical live value — that identity IS the pedagogy).
 *
 * Status: DIRECTIVE-FIXED. The renderer primitive is built and verified
 * (tsc clean, cache re-seeded, visual:eyes 26/26 deterministic checks pass,
 * STATE_2 frozen frame confirmed byte-for-byte unchanged since the JSON has
 * not yet been switched to the new config). json_author's follow-up is to
 * author `field_3d_config.probe_points` + switch STATE_2's
 * `capacitor.show_probe_points`/`probe_points_at_ms` on — that step is
 * NOT part of this row (content authoring is Alex's territory).
 *
 * Idempotent: upsert onConflict 'bug_class'. Also writes the archival SQL.
 *
 * Run: npx tsx --env-file=.env.local src/scripts/_seed_engine_bug_queue_ppc_probe_points_primitive.ts
 */
import '@/lib/loadEnvLocal';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const SESSION = 'session_2026-07-08_ppc_state2_probe_points_primitive_build';

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
    bug_class: 'ppc_probe_points_primitive_new_build',
    title: 'New `probe_points` primitive (labeled A/B/C points + live E readouts) built for parallel_plate_capacitor_field STATE_2, sibling to probe_arrows',
    severity: 'MODERATE',
    owner_cluster: R,
    root_cause: 'No config-driven mechanism existed for MULTIPLE labeled 3D points each carrying an independently-live-updating text readout. createHighlightedPoint() draws exactly ONE glow dot per call with no text-label rendering; pmCreateAutoLabel()/updateLabelSpriteText() support ONE live-redrawn billboard sprite (already used for dp_v_readout in dipole_potential) but nothing wired 3 of them to a shared live computation keyed off named positions.',
    prevention_rule: 'A "prove uniformity via matching numbers" beat needs: (1) a config-driven `probe_points` block (count/positions/labels/colors/value_unit) parallel to `probe_arrows`, resolved through a named-position enum (platesResolveProbeZ: "near_positive"|"centre"|"near_negative") shared by both mechanisms; (2) per point: a depthTest:false/renderOrder:998+ glow dot (platesMakeProbeDot, same camouflage-fix treatment as every other primitive riding the translucent plates — see pp_probe_and_sheet_arrows_camouflaged_by_translucent_plate_blend), a letter-label sprite, and a live-readout sprite; (3) the readout sprites and the flat DOM `#plates_readout` panel MUST compute their number from the exact same expression ONCE per frame and redraw via updateLabelSpriteText — never let 3 sprites each re-derive E independently, or floating-point/order-of-operation drift could show non-identical numbers and destroy the pedagogy. Additive only: never delete/replace probe_arrows when adding probe_points — future scenarios may still want arrows.',
    probe_type: 'manual',
    probe_logic: 'tsc --noEmit clean on field_3d_renderer.ts (verified no NEW errors introduced; unrelated pre-existing particle_field_renderer.ts errors from a different in-progress session are out of scope). Re-seed simulation_cache for parallel_plate_capacitor_field (assembles without runtime error against the CURRENT json, which still uses show_probe_arrows — confirms the additive change did not break assembly). Run npm run visual:eyes -- parallel_plate_capacitor_field: 26/26 deterministic checks pass; STATE_2__frozen.png shows the original 3 identical probe arrows unchanged (no probe_points markers/labels leak in, since no state config sets show_probe_points yet). Once json_author authors probe_points config + flips show_probe_points on STATE_2, the follow-up probe is: all 3 readout sprites + the flat panel display the IDENTICAL rounded E value on every sampled frame.',
    status: 'FIXED',
    concepts_affected: ['parallel_plate_capacitor_field'],
    fixed_in_files: RENDERER,
    row_type: 'directive',
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
-- STATE_2 probe_points primitive build (directive row).
-- Generated by
-- src/scripts/_seed_engine_bug_queue_ppc_probe_points_primitive.ts — idempotent.
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
  const sqlPath = join(process.cwd(), 'supabase_migrations', 'supabase_2026-07-08_seed_engine_bug_queue_ppc_probe_points_primitive_migration.sql');
  writeFileSync(sqlPath, emitSql(rows), 'utf-8');
  console.log(`Wrote archival SQL: ${sqlPath} (${rows.length} rows)`);

  console.log('Upserting ppc probe_points primitive directive row...');
  await upsertBatch(rows, 'ppc_probe_points_primitive');

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
