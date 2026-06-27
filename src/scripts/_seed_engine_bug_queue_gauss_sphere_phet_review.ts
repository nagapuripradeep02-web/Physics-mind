/**
 * Seed engine_bug_queue with the gauss_law_sphere founder-recording review
 * (2026-06-26, REC 14.32.32). Source: founder screen-recording of the teacher
 * review site (build_review_site.ts) walking gauss_law_sphere STATE_2 + STATE_4,
 * plus the founder's PhET-style "grab and move the field point" feature ask.
 * One row per bug CLASS, tagged concepts_affected=['gauss_law_sphere'].
 *
 * row_type:
 *   incident  — a real observed defect in the recording (status OPEN — unfixed).
 *   directive — the founder's teaching/feature directive the architect reads BEFORE
 *               authoring the explore state (needs the directive row_type ALTER;
 *               see supabase_2026-06-25_engine_bug_queue_directive_rowtype_migration.sql).
 *
 * Idempotent: upsert onConflict 'bug_class'. Also (re)writes the archival migration:
 *   supabase_2026-06-26_seed_engine_bug_queue_gauss_sphere_phet_review_migration.sql
 *
 * Run: npx tsx --env-file=.env.local src/scripts/_seed_engine_bug_queue_gauss_sphere_phet_review.ts
 */
import '@/lib/loadEnvLocal';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const SESSION = 'session_2026-06-26_gauss_sphere_phet_review';

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
const JA = 'alex:json_author';
const AR = 'alex:architect';
const GSPH = ['gauss_law_sphere'];

const incidents: Row[] = [
  { bug_class: 'gsph_state2_field_point_and_r_vector_tip_desync',
    title: 'STATE_2 field-point P marker and the r radius-vector tip render at different places → two conflicting "P"s on screen',
    severity: 'MAJOR', owner_cluster: R,
    root_cause: 'show_field_point places the P marker at one location (a dim ball off to the upper-left) while show_radius_vectors draws the r radius-vector with its tip elsewhere (a separate white point lower-right); both read as "P". The field point P IS the r-vector tip at distance r, but the two are positioned independently, so the teacher sees a low-colour P and a separate white P and cannot tell which is the field point (founder asked on the recording: "the low-colour point P, or the white one — which do we need?").',
    prevention_rule: 'In gauss_law_sphere STATE_2 anchor the field-point P marker exactly on the tip of the r radius-vector (identical world position) so there is a SINGLE P, labelled once; the field point and the r-vector tip must always coincide. Never render two markers that both read as P.',
    probe_type: 'manual',
    probe_logic: 'STATE_2: exactly one point P on screen, sitting on the tip of the r reference line at distance r from the centre; no second P marker anywhere else.',
    status: 'FIXED', concepts_affected: GSPH, fixed_in_files: ['src/lib/renderers/field_3d_renderer.ts'], row_type: 'incident' },

  { bug_class: 'gsph_state4_point_charge_invisible_sparse_canvas',
    title: 'STATE_4 point-charge half is a near-invisible tiny dot (no visible q sphere/label); canvas reads near-empty (Rule 19/24)',
    severity: 'MAJOR', owner_cluster: R,
    root_cause: 'In compare_mode STATE_4 the lone point charge renders as a tiny dim dot with no charge-sphere body and no q label, and the shell half does not appear until shell_appears_at_ms=17000. For the opening ~17s the screen shows only a tiny dot plus (late) one field arrow — fewer than 3 legible primitives and no readable picture with sound off.',
    prevention_rule: 'Render the STATE_4 point charge as a clearly visible labelled q sphere (sized like the other diamonds\' charges) with its radial field arrows, so the "simple case alone" beat is already a complete readable picture before the shell fades in.',
    probe_type: 'manual',
    probe_logic: 'STATE_4 opening frame: a clearly visible labelled point charge q with radial field arrows reads as a complete picture; not a near-empty canvas with a single tiny dot.',
    status: 'FIXED', concepts_affected: GSPH, fixed_in_files: ['src/lib/renderers/field_3d_renderer.ts', 'src/data/concepts/gauss_law_sphere.json'], row_type: 'incident' },

  { bug_class: 'gsph_state4_field_point_diagonal_not_horizontal',
    title: 'STATE_4 point-charge field point P + E-arrow read diagonal (up-left), not horizontal to the right of q (standard diagram)',
    severity: 'MAJOR', owner_cluster: R,
    root_cause: 'Under the STATE_4 compare camera [0,1.9,12] the point-charge field point and its E-arrow point diagonally up-left instead of horizontally outward to the right of q. Same failure class as the fixed field3d_position_vector_foreshortened_3q_camera, recurring in the compare/point-charge layout. Founder explicitly asked: "make a horizontal point P, not this — only for the point charge."',
    prevention_rule: 'Place the STATE_4 point-charge field point P horizontally to the right of q and billboard the E-arrow to camera-right (screen-horizontal) so it reads as the standard textbook point-charge diagram, never a diagonal into the camera.',
    probe_type: 'manual',
    probe_logic: 'STATE_4: the point-charge field point P sits horizontally to the right of q and the E-arrow reads horizontal on screen at every camera used.',
    status: 'FIXED', concepts_affected: GSPH, fixed_in_files: ['src/lib/renderers/field_3d_renderer.ts'], row_type: 'incident' },

  { bug_class: 'gsph_state4_compare_backloaded_long_empty_wait',
    title: 'STATE_4 back-loaded: ~17s sparse point-charge-only wait before the shell appears (shell_appears_at_ms 17000 in a 30s state)',
    severity: 'MODERATE', owner_cluster: JA,
    root_cause: 'shell_appears_at_ms=17000 and compare_highlight_at_ms=26000 in a 30s STATE_4 leave the student on the sparse point-charge half alone for ~17s. The concrete-first staging (teach_concrete_before_abstract_compare) is correct, but the alone beat is mis-tuned — too long and too sparse.',
    prevention_rule: 'Tighten STATE_4 pacing: make the point-charge-alone beat a complete readable picture (see gsph_state4_point_charge_invisible_sparse_canvas) and bring the shell + compare-highlight in sooner so no beat is a long near-empty wait.',
    probe_type: 'manual',
    probe_logic: 'STATE_4: no beat longer than a few seconds shows a near-empty canvas; the alone → compare → formulas-match sequence flows without a long dead wait.',
    status: 'FIXED', concepts_affected: GSPH, fixed_in_files: ['src/data/concepts/gauss_law_sphere.json'], row_type: 'incident' },
];

const directives: Row[] = [
  { bug_class: 'teach_field3d_explore_grab_and_move_field_point',
    title: 'field_3d explore should let the teacher GRAB the field point (and charge) with the mouse and move it anywhere — E-arrow rotates to stay radial and rescales as 1/r² live (PhET-style)',
    severity: 'MAJOR', owner_cluster: AR,
    root_cause: 'Founder (2026-06-26 recording): the current explore is a radius SLIDER (STATE_7 r_gauss) plus camera-orbit drag only; mousedown only orbits the camera — there is no direct mouse-grab of the field point or the charge. The teacher wants to grab the test point and move it here and there like a PhET sim, watch the field DIRECTION change and the INTENSITY fall with distance, and see the intensity is the same all around a circle of fixed r.',
    prevention_rule: 'Spec a draggable field-point "sensor" handle (and optionally a draggable charge) as a REUSABLE field_3d primitive on a fixed drag-plane through the centre: on drag, the verified engine recomputes r and r̂ and redraws the E-arrow (length ∝ kq/r², direction radial) + the live readout. Author it as DATA per Rule 27/28 (stable explorer id + a generic "move object" verb), never per-sim physics; add an idle auto-sweep so THE EYE can gate the interactive state. Once built, every field_3d diamond inherits the same grab-and-move test point.',
    probe_type: 'manual',
    probe_logic: 'Architect/renderer: the explore state lets you drag the field point anywhere on the plane; the E-arrow stays radial, rescales as 1/r², reads equal magnitude around a circle of fixed r; physics computed by the engine, not authored per frame.',
    status: 'OPEN', concepts_affected: GSPH, fixed_in_files: ['src/lib/renderers/field_3d_renderer.ts', 'src/data/concepts/gauss_law_sphere.json'], row_type: 'directive' },
];

// ── SQL emit (archival migration record) ────────────────────────────────────
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
-- 2026-06-26: seed engine_bug_queue with the gauss_law_sphere founder-recording
-- review (REC 14.32.32). STATE_2 two-P desync + STATE_4 point-charge layout/pacing
-- defects, plus the founder's PhET-style grab-and-move-the-field-point directive.
-- One row per bug CLASS, concepts_affected=['gauss_law_sphere'].
-- REQUIRES the directive row_type ALTER first (see the companion migration).
-- Generated by src/scripts/_seed_engine_bug_queue_gauss_sphere_phet_review.ts — idempotent.
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
  if (error) {
    console.error(`  ✗ ${label} upsert failed: ${error.message}`);
    return false;
  }
  console.log(`  ✓ ${label}: ${rows.length} rows upserted`);
  return true;
}

async function main(): Promise<void> {
  const sqlPath = join(process.cwd(), 'supabase_2026-06-26_seed_engine_bug_queue_gauss_sphere_phet_review_migration.sql');
  writeFileSync(sqlPath, emitSql([...incidents, ...directives]), 'utf-8');
  console.log(`Wrote archival SQL: ${sqlPath} (${incidents.length} incident + ${directives.length} directive rows)`);

  console.log('Upserting incident rows…');
  await upsertBatch(incidents, 'incidents');

  console.log('Upserting directive rows (needs the directive row_type ALTER)…');
  const ok = await upsertBatch(directives, 'directives');
  if (!ok) {
    console.log('  → Run supabase_2026-06-25_engine_bug_queue_directive_rowtype_migration.sql in the');
    console.log('    Supabase SQL editor, then re-run this script to land the directive row.');
  }

  const { data, error } = await supabaseAdmin
    .from('engine_bug_queue')
    .select('row_type, status')
    .eq('discovered_in_session', SESSION);
  if (error) { console.error('verify query failed:', error.message); return; }
  const byType: Record<string, number> = {};
  for (const row of data ?? []) byType[row.row_type] = (byType[row.row_type] ?? 0) + 1;
  console.log('In engine_bug_queue for this session:', JSON.stringify(byType));
}

main().catch((err) => {
  console.error('💥 seed failed:', err instanceof Error ? err.stack : err);
  process.exit(1);
});
