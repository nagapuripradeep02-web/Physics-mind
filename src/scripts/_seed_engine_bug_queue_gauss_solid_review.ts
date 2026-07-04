/**
 * Seed engine_bug_queue with the founder's screen-recording review of
 * gauss_law_solid_sphere (26.06.2026_10.59.54_REC.mp4, analyzed via the `watch`
 * skill — Whisper transcript + 60 frames). One row per issue CLASS, status OPEN
 * until fixed (this script is re-run with status FIXED + fixed_in_files once the
 * fix lands — idempotent upsert onConflict 'bug_class').
 *
 * Founder issues (grounded in transcript + frames):
 *   1. STATE_5 ("at the surface") sweeps the Gaussian sphere OUTSIDE R instead of
 *      stopping at the surface to explain — "you're moving outside the surface…
 *      you should not… only till surface and explain it… a lot of things going on,
 *      please remove this" (t00:00–00:49). Frame t00:36 shows the blue Gaussian
 *      grown larger than the red sphere.
 *   2. The big R radius line is not anchored at the sphere CENTRE (it is lifted
 *      above the equator), and R/r read as the same line — "the radius… is not in
 *      the center… show from the center, this is capital R… show the small radius
 *      not in the same line… the big R radius line should be at the center of the
 *      actual sphere" (t00:49–02:45).
 *
 * Run: npx tsx --env-file=.env.local src/scripts/_seed_engine_bug_queue_gauss_solid_review.ts
 */
import '@/lib/loadEnvLocal';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const SESSION = 'session_2026-06-26_gauss_solid_founder_review';

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
const RENDERER = ['src/lib/renderers/field_3d_renderer.ts'];
const JSON_FILE = ['src/data/concepts/gauss_law_solid_sphere.json'];

const rows: Row[] = [
  {
    bug_class: 'gauss_sphere_surface_state_sweeps_past_R_should_stop_at_surface',
    title: 'The "at the surface" continuity state sweeps the Gaussian sphere OUTSIDE R instead of stopping at the surface to explain',
    severity: 'MAJOR',
    owner_cluster: JA,
    root_cause: 'gauss_law_solid_sphere STATE_5 (the surface-continuity beat) used a coordinated_sweep with sweep_r_max=1.95 (> R=1.5), so the Gaussian sphere + radial arrows continued OUTSIDE the surface — cluttering the moment that should simply hold AT the surface and explain that the inside ramp and the outside 1/r² meet at kq/R². Founder (screen recording): "it should stop just at the surface… you are moving outside the surface… you should not… only till surface and explain it… a lot of things going on, please remove this."',
    prevention_rule: 'A "at the surface" / continuity beat must hold the Gaussian sphere AT r=R (sweep_r_max = R, or no sweep at all) and explain there. Sweeping past the surface belongs ONLY to the full-profile state (the one that draws the whole E-vs-r curve), never to the surface-explanation state.',
    probe_type: 'manual',
    probe_logic: 'Open the surface-continuity state; the Gaussian sphere must approach and HOLD at the red surface (r=R), never grow visibly larger than the charged sphere.',
    status: 'FIXED',
    concepts_affected: ['gauss_law_solid_sphere'],
    fixed_in_files: JSON_FILE,
    row_type: 'incident',
  },
  {
    bug_class: 'gsph_radius_R_line_not_anchored_at_sphere_centre',
    title: 'The big R radius line is lifted above the sphere centre (staggered up) instead of starting from the actual centre; R and r read as one line',
    severity: 'MAJOR',
    owner_cluster: R,
    root_cause: 'In the gauss-sphere scenario the R position vector is billboarded at +camUp·R_STAGGER (0.45 above the equator), so it does not pass through the sphere centre, and the small r line sits just under it — the two read as the same line offset from centre. Founder (screen recording): "the radius… is not in the center… show from the center, this is capital R… show the small radius not in the same line… the big R radius line should be at the center of the actual sphere."',
    prevention_rule: 'The big R radius line must originate at the sphere CENTRE (on the centre/equator line, no upward offset) so it visibly runs centre→surface; only the smaller r line is staggered clearly off-centre so the two read as two distinct radius lines.',
    probe_type: 'manual',
    probe_logic: 'Inspect any state showing the R radius line; its tail must sit at the sphere centre with the line passing through the centre to the surface, and the r line must be a clearly separate parallel line — not coincident with R.',
    status: 'FIXED',
    concepts_affected: ['gauss_law_solid_sphere', 'gauss_law_sphere'],
    fixed_in_files: RENDERER,
    row_type: 'incident',
  },
  // ── Round 2 (26.06.2026_11.57.29_REC.mp4) ──────────────────────────────────
  {
    bug_class: 'gsph_small_r_radius_line_horizontal_should_be_angled_from_centre',
    title: 'The small r (Gaussian-sphere) radius line is horizontal; it should be a diagonal radius from the centre whose tip rides the moving Gaussian surface',
    severity: 'MAJOR',
    owner_cluster: R,
    root_cause: 'The r position-vector is billboarded horizontal (along camRight) and staggered below the centre, so on the dynamic Gaussian states (shrink/sweep/slider) it reads as a second horizontal line sliding left-right, not as a radius sweeping the moving surface from the centre. Founder (screen recording): "the small r should not be horizontal — it should be at an angle from the centre, so as the Gaussian sphere increases/decreases the small r line increases/decreases… it feels like it is moving along the surface and coming from the centre. Solve in all states, in both the hollow and solid sphere sims."',
    prevention_rule: 'On a dynamic Gaussian-sphere scenario the small r radius line must be a DIAGONAL radius FROM THE CENTRE (e.g. ~35° down-right in screen space) whose tip rides the Gaussian silhouette (length = r_gauss), so it tracks the surface as the sphere grows/shrinks; only the static big R line stays horizontal-from-centre.',
    probe_type: 'manual',
    probe_logic: 'Open any dynamic Gaussian state (shrink/sweep/slider) in either sim; the small r line must run diagonally from the sphere centre to a point on the Gaussian surface, with the P dot on the silhouette, and as r changes the tip must slide along the surface — not stay a horizontal line.',
    status: 'FIXED',
    concepts_affected: ['gauss_law_sphere', 'gauss_law_solid_sphere'],
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
-- 2026-06-26: seed engine_bug_queue with the founder's screen-recording review of
-- gauss_law_solid_sphere (26.06.2026_10.59.54_REC.mp4, analyzed via the watch skill).
-- One row per issue CLASS. Generated by
-- src/scripts/_seed_engine_bug_queue_gauss_solid_review.ts — idempotent.
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
    console.error(`  ✗ ${label} upsert failed: ${error.message}`);
    return false;
  }
  console.log(`  ✓ ${label}: ${rowsIn.length} rows upserted`);
  return true;
}

async function main(): Promise<void> {
  const sqlPath = join(process.cwd(), 'supabase_migrations', 'supabase_2026-06-26_seed_engine_bug_queue_gauss_solid_review_migration.sql');
  writeFileSync(sqlPath, emitSql(rows), 'utf-8');
  console.log(`Wrote archival SQL: ${sqlPath} (${rows.length} rows)`);

  console.log('Upserting founder-review rows…');
  await upsertBatch(rows, 'gauss_solid_review');

  const { data, error } = await supabaseAdmin
    .from('engine_bug_queue')
    .select('bug_class, status')
    .eq('discovered_in_session', SESSION);
  if (error) { console.error('verify query failed:', error.message); return; }
  console.log('In engine_bug_queue for this session:');
  for (const row of data ?? []) console.log(`  [${row.status}] ${row.bug_class}`);
}

main().catch((err) => {
  console.error('💥 seed failed:', err instanceof Error ? err.stack : err);
  process.exit(1);
});
