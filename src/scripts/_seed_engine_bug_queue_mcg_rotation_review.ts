/**
 * Seed engine_bug_queue with three defects the founder caught on a recording of
 * the moving_coil_galvanometer field_3d sim (28.06.2026 review, watch-skill
 * frame analysis + renderer code trace). All OPEN.
 *
 *   1. mcg_coil_rotation_opposes_bil_force_couple   — the coil spins OPPOSITE the
 *      BIL force couple it teaches (rotation + τ-vector reversed; forces correct).
 *      FIXED in this session (renderer sign flip) — flip to FIXED after the founder
 *      confirms the playthrough.
 *   2. mcg_uniform_field_force_arrow_shrinks_with_cosphi — uniform-field force arrow
 *      scaled ×|cosφ| + parented to the coil; |F|=BIL is actually constant.
 *   3. mcg_equilibrium_torque_balance_choreography_underplayed — invisible settle
 *      overshoot + collinear axial τ arrows; the NIAB=kφ tug-of-war doesn't read.
 *
 * Also (re)writes the archival SQL migration.
 * Run: npx tsx --env-file=.env.local src/scripts/_seed_engine_bug_queue_mcg_rotation_review.ts
 */
import '@/lib/loadEnvLocal';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const SESSION = 'session_2026-06-28_mcg_recording_review';

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

const incidents: Row[] = [
  {
    bug_class: 'mcg_coil_rotation_opposes_bil_force_couple',
    title: 'Moving-coil galvanometer: the coil spins OPPOSITE to the BIL force couple it teaches — coil.rotation.y=+phiRad and the deflecting-torque arrow (+y) are reversed relative to the (correct) left-into-page / right-out-of-page forces, so each side visibly moves opposite its own force arrow',
    severity: 'MAJOR',
    owner_cluster: 'peter_parker:renderer_primitives',
    root_cause: 'In field_3d_renderer.ts (moving_coil_galvanometer scenario) the field, current and forces are all PHYSICALLY CORRECT: N pole at x=-1.6, S at +1.6 (mcgBuildPole signs -1/+1, line ~8361), field drawn +x so B points N->S; current marches UP the left side (dotDefs, line ~8405); right-hand rule therefore puts the left-side force into the page (-z) and the right-side force out of the page (+z), exactly as the renderer draws them (mcg_force_left dir (0,0,-1) @ -x, mcg_force_right (0,0,+1) @ +x, lines ~8418-8421) and exactly as narration s2_3 / reveal_couple state. That couple = sum(r x F) = -y, so the coil MUST rotate -y (front +z sweeps toward -x). But the renderer applies coil.rotation.y = +phiRad (line ~8647) and draws the deflecting-torque arrow mcg_tau_deflect at +y (line ~8445) — both reversed. Net symptom: each coil side moves opposite to its own green force arrow, and the magenta deflecting-torque arrow agrees with the (wrong) spin instead of with the forces. The formulas/magnitudes are all correct; this is purely a rotation/torque-vector SIGN error.',
    prevention_rule: 'The rendered rotation sense must be derived from (and validated against) the rendered force couple: the sign of sum(r x F) computed from the force-arrow directions and positions must equal the sign of coil.rotation.y, and the deflecting-torque vector must point along that same axis sense (restoring-torque opposite). Add a unit/visual probe asserting this for any current-loop-in-field sim. Never set the deflection sign independently of the forces.',
    probe_type: 'manual',
    probe_logic: 'Play STATE_2 and watch the right edge of the coil at deflection onset: its green force arrow points OUT of the page (toward the viewer) but the edge swings INTO the page (away) => FAIL. After the fix, every side moves the same way its force arrow points, and the deflecting-torque arrow points along the actual spin axis. (js_eval form: assert sign(sum_i r_i x F_i over the two force arrows) === sign(coil.rotation.y).)',
    status: 'OPEN',
    concepts_affected: ['moving_coil_galvanometer'],
    fixed_in_files: [],
    row_type: 'incident',
  },
  {
    bug_class: 'mcg_uniform_field_force_arrow_shrinks_with_cosphi',
    title: 'Moving-coil galvanometer uniform-field states (S2/S3): the BIL force arrows are scaled x|cosφ| and parented to the coil so they shrink and rotate, but |F|=BIL is constant in magnitude AND fixed in world-direction as the coil turns about the vertical axis — only the torque (via the lever arm) falls as cosφ',
    severity: 'MODERATE',
    owner_cluster: 'peter_parker:renderer_primitives',
    root_cause: 'In the uniform-field states the renderer sets the force-arrow length fLen = 0.85*|cos(phi)| (line ~8673) and the force arrows are children of the coil group (added at lines ~8419/8421) so they also rotate with the coil. Physically, when the coil turns about the vertical (y) axis its two vertical sides stay vertical and stay perpendicular to a uniform horizontal B, so |F|=BIL is constant in BOTH magnitude and world-direction (into/out of the page). What actually decreases as cos(phi) is the LEVER ARM (the x-position of each side), i.e. the TORQUE — which the deflecting-torque arrow already carries correctly (tau scaled by cos(phi), line ~8681). Drawing the force itself shrinking (and rotating with the coil) misrepresents the mechanism; narration s3_3 ("each force shrinks") reinforces the same misconception. Bites most in STATE_3 where phi reaches ~42deg.',
    prevention_rule: 'In uniform-field states hold the force-arrow length AND world-direction constant (do not parent uniform-field force arrows to the coil rotation); express the cos(phi) fade ONLY through the torque arrow or a visibly shrinking lever arm. Reserve coil-child (co-rotating, tangential) force arrows for the RADIAL field, where the force direction genuinely rotates with position. Reword s3_3 to "the lever arm / torque shrinks" rather than "each force shrinks".',
    probe_type: 'manual',
    probe_logic: 'Step STATE_3 to a large deflection: the green side-force arrows should keep full length and keep pointing straight into/out of the page; only the magenta deflecting-torque arrow (and/or a lever-arm guide) should shrink with cos(phi). If the force arrows themselves shrink or tilt with the coil => FAIL.',
    status: 'OPEN',
    concepts_affected: ['moving_coil_galvanometer'],
    fixed_in_files: [],
    row_type: 'incident',
  },
  {
    bug_class: 'mcg_equilibrium_torque_balance_choreography_underplayed',
    title: 'Moving-coil galvanometer equilibrium (S5/S6): the two opposing torques are drawn as collinear axial arrows on one line and the damped-settle overshoot is <1deg (effectively invisible), so the NIAB=kφ tug-of-war and the needle oscillate-and-settle do not read',
    severity: 'MODERATE',
    owner_cluster: 'peter_parker:renderer_primitives',
    root_cause: 'STATE_6 settle uses overshoot 2deg * sin(u*PI) * exp(-2.5u) (line ~8631), which peaks below ~1deg for ~0.3s — so the needle reads as a smooth glide with no visible oscillation. The deflecting and restoring torque arrows share the same origin (0,0,1.6) and are collinear (+y and -y, lines ~8445/8450), so at equilibrium (equal length) they look like a single double-headed arrow rather than two opposing twists. There is no explicit "balanced" beat when NIAB=kphi is reached. The mechanism is all present and correct; it is just visually underplayed, which is why the equilibrium "both torques at once" reads as static/ambiguous on a recording.',
    prevention_rule: 'Dramatize the equilibrium: render the deflecting twist as an arc ON the coil (in the rotation sense) and the restoring twist as an arc ON the hairspring (opposite sense) rather than two collinear axial vectors; during settle hold the deflecting arc fixed while the restoring arc grows until equal; use a visibly larger decaying oscillation (bigger overshoot, lighter damping) and add a brief lock/pulse (or "=") when NIAB=kphi. Equilibrium/balance beats need a perceptible (>~3-5deg) oscillation and a non-collinear opposing-twist depiction.',
    probe_type: 'manual',
    probe_logic: 'Watch STATE_6: the needle should visibly overshoot and oscillate before settling, and the two torques should read as two distinct opposing twists that become equal at rest (with a clear "balanced" moment). If the settle looks like a static jump and the torques look like one axial arrow => FAIL.',
    status: 'OPEN',
    concepts_affected: ['moving_coil_galvanometer'],
    fixed_in_files: [],
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
-- 2026-06-28: moving_coil_galvanometer recording review (founder) — 3 defects.
--   1 (MAJOR) mcg_coil_rotation_opposes_bil_force_couple   — rotation/τ sign error
--   2 (MODERATE) mcg_uniform_field_force_arrow_shrinks_with_cosphi
--   3 (MODERATE) mcg_equilibrium_torque_balance_choreography_underplayed
-- All status OPEN. Generated by
-- src/scripts/_seed_engine_bug_queue_mcg_rotation_review.ts.
-- ============================================================================

INSERT INTO engine_bug_queue (${cols}) VALUES
${all.map(sqlRow).join(',\n')}
ON CONFLICT (bug_class) DO NOTHING;
`;
}

async function main(): Promise<void> {
  const sqlPath = join(process.cwd(), 'supabase_2026-06-28_seed_engine_bug_queue_mcg_rotation_review_migration.sql');
  writeFileSync(sqlPath, emitSql(incidents), 'utf-8');
  console.log(`Wrote archival SQL: ${sqlPath}`);

  const payload = incidents.map((r) => ({ ...r, discovered_in_session: SESSION }));
  const { error } = await supabaseAdmin.from('engine_bug_queue').upsert(payload, { onConflict: 'bug_class' });
  if (error) { console.error(`  ✗ upsert failed: ${error.message}`); process.exit(1); }
  console.log(`  ✓ upserted ${incidents.length} row(s)`);

  const { data, error: e2 } = await supabaseAdmin
    .from('engine_bug_queue').select('bug_class, status, severity').eq('discovered_in_session', SESSION);
  if (e2) { console.error('verify failed:', e2.message); return; }
  for (const row of data ?? []) console.log(`  [${row.severity}] ${row.status}  ${row.bug_class}`);
}

main().catch((err) => { console.error('💥 seed failed:', err instanceof Error ? err.stack : err); process.exit(1); });
