/**
 * Seed engine_bug_queue with the 3 defects the founder caught reviewing the
 * gauss_law_sheet sim on 2026-06-26 (recording 26.06.2026_19.21.21_REC.mp4,
 * analyzed via the /watch skill). Logged OPEN here FIRST (founder workflow:
 * recording = bug report → log every issue OPEN → fix → flip to FIXED). A
 * follow-up run of this script (after the renderer fix lands + THE EYE
 * re-verifies) flips STATUS to 'FIXED' — flip the `STATUS` const below.
 *
 * Idempotent: upsert onConflict 'bug_class'. Also writes the archival SQL.
 *
 * Run: npx tsx --env-file=.env.local src/scripts/_seed_engine_bug_queue_gauss_sheet_founder_review.ts
 */
import '@/lib/loadEnvLocal';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const SESSION = 'session_2026-06-26_gauss_sheet_founder_review';
// Flip to 'FIXED' and re-run after the renderer fix + THE EYE re-verify.
// 2026-06-26: all 3 fixed in field_3d_renderer.ts (gss d/H rulers world-+X-aligned
// not billboarded; "d" label below the ruler midpoint; cap disks brighter + gss_cap_rim
// glowing ring), tsc 0, THE EYE 30/30 ×, frozen frames re-read. Flipped to FIXED.
const STATUS: 'OPEN' | 'FIXED' = 'FIXED';

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
    bug_class: 'gss_dist_vector_drifts_under_camera_orbit',
    title: 'The d distance line swings sideways (detaches from the geometry) when the teacher orbits the camera — a normal-aligned distance vector must be anchored to the sheet normal in world space, NEVER billboarded camera-right',
    severity: 'MAJOR',
    owner_cluster: R,
    root_cause: 'The gss_dist_vector (the white "d" ruler from the sheet to the field point P) was billboarded to camera-right (copied from gauss_law_line\'s radial r ruler). For the LINE, r is radial (any direction in the plane ⊥ to the wire) so billboarding to a consistent screen-right reads cleanly. For the SHEET, d lies along the FIXED sheet normal (±X) — a single physical direction. Billboarding it makes the d line swing away from the normal as the camera orbits, so it appears to "move sideways" and detach from the sheet→P geometry. This CORRECTS the build-time rule gss_two_distinct_reference_lines_d_billboarded_H_axial, which prescribed billboarding d — wrong for a planar/normal-aligned distance.',
    prevention_rule: 'For a planar/constant-field sibling, the perpendicular-distance ruler (d) and the pillbox half-height ruler (H) must be drawn along their FIXED world directions (the sheet normal / pillbox axis) so they stay STATIC and attached to the geometry under camera orbit — never billboarded camera-right. Billboarding is correct ONLY for a radial ruler (the line\'s r), never for a normal-aligned one. The d ruler runs sheet-surface → P along the world normal; as the camera orbits it rotates WITH the scene, never independently.',
    probe_type: 'manual',
    probe_logic: 'Open any gauss_law_sheet state showing the d line, enter Move/orbit mode, and rotate the camera; the d ruler must stay pinned to the sheet→P geometry (rotating with the scene), never swing sideways to stay screen-horizontal.',
    status: STATUS,
    concepts_affected: ['gauss_law_sheet'],
    fixed_in_files: RENDERER,
    row_type: 'incident',
  },
  {
    bug_class: 'gss_d_label_sits_below_the_distance_line',
    title: 'The "d" label should sit BELOW the d ruler (near its midpoint), not crowd the field point P',
    severity: 'MODERATE',
    owner_cluster: R,
    root_cause: 'The "d" text label rendered beside/near the P tip, crowding the P marker instead of clearly labelling the distance ruler. The teacher asked for "d below the line exactly here".',
    prevention_rule: 'Place the gss distance-ruler label ("d") just BELOW the midpoint of the d line (offset along -up in screen space), clearly separated from the P tip marker, so the ruler reads "this length is d" at a glance.',
    probe_type: 'manual',
    probe_logic: 'Open a gauss_law_sheet state with the d line; the "d" label sits below the ruler near its middle, not overlapping the P dot.',
    status: STATUS,
    concepts_affected: ['gauss_law_sheet'],
    fixed_in_files: RENDERER,
    row_type: 'incident',
  },
  {
    bug_class: 'gss_flux_bearing_caps_need_stronger_glow',
    title: 'The two flat circular pillbox CAPS (the flux-bearing faces) must glow more — a brighter emissive disk + a glowing rim ring — so the eye reads the caps as where the flux leaves',
    severity: 'MODERATE',
    owner_cluster: R,
    root_cause: 'The pillbox cap disks rendered as faint translucent circles, so the flux-bearing faces (the SUPPORTING-aha payoff: caps pierce, wall grazes) did not stand out. The teacher asked for "a light glowing around the circle" on the cap surfaces.',
    prevention_rule: 'In the planar pillbox, the two flat caps are the flux-bearing faces — give them a stronger glow than the curved wall: a brighter emissive/opacity on the cap disk PLUS a glowing rim ring around each cap circle, brightened on the caps-flux beat (STATE_4) and present whenever the pillbox shows. Rule 29: emphasis is brightness/glow, never a size pulse.',
    probe_type: 'manual',
    probe_logic: 'Open STATE_3/STATE_4; each flat circular cap reads with a clear glow (disk + rim ring) distinctly brighter than the curved wall, marking the caps as the flux-bearing faces.',
    status: STATUS,
    concepts_affected: ['gauss_law_sheet'],
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
-- 2026-06-26: engine_bug_queue — 3 defects the founder caught reviewing the
-- gauss_law_sheet sim (recording 26.06.2026_19.21.21_REC.mp4). Generated by
-- src/scripts/_seed_engine_bug_queue_gauss_sheet_founder_review.ts — idempotent.
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
  console.log(`  ok ${label}: ${rowsIn.length} rows upserted [${STATUS}]`);
  return true;
}

async function main(): Promise<void> {
  const sqlPath = join(process.cwd(), 'supabase_2026-06-26_seed_engine_bug_queue_gauss_sheet_founder_review_migration.sql');
  writeFileSync(sqlPath, emitSql(rows), 'utf-8');
  console.log(`Wrote archival SQL: ${sqlPath} (${rows.length} rows)`);

  console.log('Upserting gauss_sheet founder-review rows...');
  await upsertBatch(rows, 'gauss_sheet_founder_review');

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
