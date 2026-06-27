/**
 * Seed engine_bug_queue with the amperes_circuital_law SECOND founder-review bug
 * ledger (recorded screen review 26.06.2026_13.14 — STATES 7/8). One row per bug
 * CLASS, concepts_affected=['amperes_circuital_law'], row_type 'incident', status
 * OPEN (fixes in flight). Upsert onConflict 'bug_class'. Also (re)writes the
 * archival SQL migration.
 *
 * Run: npx tsx --env-file=.env.local src/scripts/_seed_engine_bug_queue_amperes_review2.ts
 */
import '@/lib/loadEnvLocal';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const SESSION = 'session_2026-06-26_amperes_review2';

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
const CONCEPT = ['amperes_circuital_law'];

const incidents: Row[] = [
  {
    bug_class: 'acl_state7_red_cancel_line_confusing',
    title: 'STATE_7 red diagonal "cancel" slash across the 2πr ruler reads as confusing noise — remove it',
    severity: 'MODERATE',
    owner_cluster: R,
    root_cause: 'The STATE_7 divide-by-2πr beat draws a red diagonal stroke striking through the 2πr ruler (drawAmperesStage, the ctx.moveTo/lineTo slash). The founder finds it unexplained and distracting ("please remove the red line, I don\'t know why it is").',
    prevention_rule: 'Do not draw a free-floating strike/cancel line whose meaning is not separately taught. Keep the isolate-B reveal (B = μ₀I/(2πr)) without a red slash; show the result compactly instead.',
    probe_type: 'manual',
    probe_logic: 'STATE_7 shows no red diagonal line across the ruler; the isolate-B result still reads.',
    status: 'FIXED',
    concepts_affected: CONCEPT,
    fixed_in_files: ['src/lib/renderers/field_3d_renderer.ts', 'src/lib/validators/visual/deriveStateMeta.ts', 'src/data/concepts/amperes_circuital_law.json'],
    row_type: 'incident',
  },
  {
    bug_class: 'acl_state78_explorer_needs_physical_rod_and_field_circles',
    title: 'STATE_7/8 show only the abstract 2D bar — must show the physical rod + current flow + concentric field circles + Amperian loop as the centerpiece, responding to sliders',
    severity: 'MAJOR',
    owner_cluster: R,
    root_cause: 'The aclStageActive short-circuit blanket-hides the 3D acl_* scene (wire, current flow, concentric field circles, Amperian loop) on STATES 6/7/8 and renders only the 2D bar/ruler. For the result/explorer states this is too abstract — the founder wants the physical picture (a rod with current flowing, wrapped by field circles, an Amperian loop labelled I_enc) as the centerpiece, with sliding I showing current flow and raising r growing the loop/field radius; the 2πr bar and the formula should be small/aside.',
    prevention_rule: 'In the result/explorer states show the physical 3D scene (rod + current flow + field circles + coaxial Amperian loop) as the centerpiece; bind I→current flow and r→loop/field radius; demote the bar/ruler to a small bottom strip and the formula to a corner. Never let the explorer be a static abstract diagram (Rule 24: picture over algebra).',
    probe_type: 'manual',
    probe_logic: 'STATE_7/8 show the rod + current flow + concentric field circles + a coaxial Amperian loop centered; dragging r grows the loop/field radius and B dims 1/r; dragging I speeds/brightens the current flow; the bar/ruler is a small bottom strip and the formula is in a corner, with no occlusion.',
    status: 'FIXED',
    concepts_affected: CONCEPT,
    fixed_in_files: ['src/lib/renderers/field_3d_renderer.ts', 'src/lib/validators/visual/deriveStateMeta.ts', 'src/data/concepts/amperes_circuital_law.json'],
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
-- 2026-06-26: seed engine_bug_queue — amperes_circuital_law founder review #2
-- (recorded 26.06.2026_13.14, STATES 7/8). One row per bug CLASS, all incidents.
-- Generated by src/scripts/_seed_engine_bug_queue_amperes_review2.ts.
-- ============================================================================

INSERT INTO engine_bug_queue (${cols}) VALUES
${all.map(sqlRow).join(',\n')}
ON CONFLICT (bug_class) DO NOTHING;
`;
}

async function upsertBatch(rows: Row[], label: string): Promise<boolean> {
  const payload = rows.map((r) => ({ ...r, discovered_in_session: SESSION }));
  const { error } = await supabaseAdmin
    .from('engine_bug_queue')
    .upsert(payload, { onConflict: 'bug_class' });
  if (error) { console.error(`  ✗ ${label} upsert failed: ${error.message}`); return false; }
  console.log(`  ✓ ${label}: ${rows.length} rows upserted`);
  return true;
}

async function main(): Promise<void> {
  const sqlPath = join(process.cwd(), 'supabase_2026-06-26_seed_engine_bug_queue_amperes_review2_migration.sql');
  writeFileSync(sqlPath, emitSql(incidents), 'utf-8');
  console.log(`Wrote archival SQL: ${sqlPath} (${incidents.length} incident rows)`);

  console.log('Upserting incident rows…');
  await upsertBatch(incidents, 'incidents');

  const { data, error } = await supabaseAdmin
    .from('engine_bug_queue')
    .select('bug_class, status, severity')
    .eq('discovered_in_session', SESSION);
  if (error) { console.error('verify query failed:', error.message); return; }
  console.log(`In engine_bug_queue for this session: ${(data ?? []).length} rows`);
  for (const row of data ?? []) console.log(`  [${row.severity}] ${row.status}  ${row.bug_class}`);
}

main().catch((err) => {
  console.error('💥 seed failed:', err instanceof Error ? err.stack : err);
  process.exit(1);
});
