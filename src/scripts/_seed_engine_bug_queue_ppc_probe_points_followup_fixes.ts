/**
 * Seed engine_bug_queue with the two follow-up fixes THE EYE surfaced on the
 * new parallel_plate_capacitor_field `probe_points` primitive once json_author
 * wired STATE_2 to it (run .visual_runs/parallel_plate_capacitor_field/20260708-211309/):
 *
 *   1. ppc_probe_points_readout_overlap — the 3 "E = 1200 V/m" readout sprites
 *      collided horizontally (each wider than the 0.8-unit point spacing).
 *   2. ppc_devstatemeta_missing_probe_points_at_ms — deriveStateMeta's
 *      maxRevealForField3dState never registered `probe_points_at_ms`, so
 *      STATE_2 false-failed D7 ("died mid-state") and the frozen-frame capture
 *      photographed the state BEFORE the points appeared (empty field-lines-only
 *      frame). Same scar class as the already-fixed
 *      pp_devstatemeta_capacitor_block_registered_same_change.
 *
 * Both fixed + re-verified in this session (26/26 deterministic checks; frozen
 * frame + t=4000/8000ms dense frames read directly, confirming reveal timing
 * and legible non-overlapping "1200" readouts + shared "E (V/m)" legend).
 *
 * Idempotent: upsert onConflict 'bug_class'. Also writes the archival SQL.
 *
 * Run: npx tsx --env-file=.env.local src/scripts/_seed_engine_bug_queue_ppc_probe_points_followup_fixes.ts
 */
import '@/lib/loadEnvLocal';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const SESSION = 'session_2026-07-08_ppc_probe_points_followup_fixes';

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

const rows: Row[] = [
  {
    bug_class: 'ppc_probe_points_readout_overlap',
    title: 'The 3 probe_points readout sprites ("E = 1200 V/m") collide horizontally into an unreadable run',
    severity: 'MODERATE',
    owner_cluster: R,
    root_cause: 'pmCreateAutoLabel sizes its canvas to the MEASURED text width (floored at 384px). A full "E = 1200 V/m" string (~13 chars) measures far wider than the 384px floor, so at heightScale 0.34 the rendered glyph ink spans roughly 1.5+ world units — nearly double the 0.8-unit spacing between adjacent probe points. Three adjacent full-length readouts therefore visually run together ("E = 1200 V/E = 1200 V/E = 1200 V/m"). The A/B/C letter labels above the dots did NOT collide because a single glyph is short enough to stay under the 384px canvas floor, leaving mostly transparent padding either side (small visible ink relative to quad size).',
    prevention_rule: 'When authoring N per-point live-readout sprites at a fixed spacing, keep each per-point sprite text SHORT enough that its measured ink width (not the padded/floored canvas quad) fits inside the spacing — a full "quantity = value unit" string rarely does at typical point spacing. Prefer: bare per-point NUMBER only + ONE shared quantity+unit legend built once (not per point), placed on its own row/band so it never shares a horizontal or vertical band with any per-point text regardless of how many digits the live value has.',
    probe_type: 'manual',
    probe_logic: 'Read STATE_2__dense_t08000.png (or any frame at/after probe_points_at_ms + fade) directly: the 3 per-point readouts under A/B/C must render as 3 visually SEPARATE non-touching strings, all showing the IDENTICAL rounded number; the shared unit/quantity legend (if any) must not touch any per-point readout in any sampled frame.',
    status: 'FIXED',
    concepts_affected: ['parallel_plate_capacitor_field'],
    fixed_in_files: ['src/lib/renderers/field_3d_renderer.ts'],
    row_type: 'incident',
  },
  {
    bug_class: 'ppc_devstatemeta_missing_probe_points_at_ms',
    title: 'deriveStateMeta never registered probe_points_at_ms, so STATE_2 (probe_points variant) false-fails D7 and the frozen-frame capture photographs the state BEFORE the points appear',
    severity: 'MAJOR',
    owner_cluster: R,
    root_cause: 'maxRevealForField3dState\'s parallel_plates `capacitor` block registers gap_bracket_at_ms / field_lines_at_ms / probe_arrows_at_ms / sheet_fields_at_ms / cancel_outside_at_ms / fringe_at_ms / gap_widen as timed-reveal candidates that pin the capture window past each payoff — but the NEW probe_points_at_ms cue (added in the same renderer change that built the probe_points primitive) was never added to that candidate list. THE EYE therefore pinned STATE_2\'s capture at the generic 1500ms default: the frozen frame photographed field-lines-only (before the t=5000ms probe_points reveal), and D7 saw the points fade in at t=5000-6000ms as unexpected LATE motion in a state it believed should already be fully revealed by 1500ms -> false "Animation died mid-state" fail. Same scar class as the already-fixed pp_devstatemeta_capacitor_block_registered_same_change (which registered the ORIGINAL capacitor block cues) — a new *_at_ms cue on an existing config block needs the same registration discipline as a brand-new scenario_type.',
    prevention_rule: 'Any NEW *_at_ms (or other timed-reveal) field added to a scenario\'s per-state config block MUST be registered in deriveStateMeta\'s maxRevealForField3dState candidate list in the SAME change that adds the renderer-side ramp() for it — grep the sibling *_at_ms registrations for the same config block and add the new field alongside them (same `asNum(cap.X_at_ms, 0) + fadeMs + pad` pattern), not just alongside the existing scenario_type-registration rule (which only covers a scenario\'s FIRST cue set, not every cue added afterward).',
    probe_type: 'manual',
    probe_logic: 'npm run visual:eyes -- parallel_plate_capacitor_field: 26/26 deterministic checks pass (D7 no longer false-fails STATE_2). STATE_2__frozen.png read directly: shows the 3 A/B/C points + readouts (not an empty field-lines-only frame). A dense frame BEFORE probe_points_at_ms (e.g. t=4000ms when probe_points_at_ms=5000) shows the points NOT yet visible, confirming the reveal timing itself is unchanged — only the capture/classification window moved.',
    status: 'FIXED',
    concepts_affected: ['parallel_plate_capacitor_field'],
    fixed_in_files: ['src/lib/validators/visual/deriveStateMeta.ts'],
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
-- probe_points follow-up fixes (readout overlap + deriveStateMeta registration).
-- Generated by
-- src/scripts/_seed_engine_bug_queue_ppc_probe_points_followup_fixes.ts — idempotent.
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
  const sqlPath = join(process.cwd(), 'supabase_migrations', 'supabase_2026-07-08_seed_engine_bug_queue_ppc_probe_points_followup_fixes_migration.sql');
  writeFileSync(sqlPath, emitSql(rows), 'utf-8');
  console.log(`Wrote archival SQL: ${sqlPath} (${rows.length} rows)`);

  console.log('Upserting ppc probe_points follow-up fix rows...');
  await upsertBatch(rows, 'ppc_probe_points_followup_fixes');

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
