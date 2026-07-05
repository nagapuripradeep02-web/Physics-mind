/**
 * engine_bug_queue updates for moving_coil_galvanometer, resolved 2026-07-05 during
 * its Rule-31 rebuild (contextual controls + live-instrument frame + Socratic strip)
 * and a force-arrow physics fix. Three previously-OPEN rows → FIXED:
 *
 *  1. mcg_coil_rotation_opposes_bil_force_couple (MAJOR) — verified STALE. The row
 *     claims coil.rotation.y=+phiRad / tau=+y; the shipped code has mcgSweep=-1
 *     (coil.rotation.y=-phiRad, tau=-y) since the file was written (24f4bc3), which
 *     makes the coil rotate WITH the couple sum(r x F) = -y. eye-walker run
 *     20260705-152326 confirmed via code derivation + camera-projection depth across
 *     phi=0..90 + frame cross-check (STATE_7 phi 11.5->68.8: out-of-page wire stays
 *     in front, into-page wire recedes) — coil rotates WITH its force arrows.
 *
 *  2. mcg_uniform_field_force_arrow_shrinks_with_cosphi (MODERATE) — FIXED in the
 *     renderer: BIL force arrows now hold constant length (|F|=BIL is constant) and,
 *     in the uniform field, are counter-rotated to a world-fixed +/-z direction
 *     (only radial-field arrows co-rotate). The cos(phi) fade now reads only via the
 *     torque arrow (∝cos phi) + the crowded scale; s3_3 narration reworded in lockstep.
 *
 *  3. mcg_equilibrium_torque_balance_choreography_underplayed (MODERATE) — verified
 *     addressed: the deflecting twist is an arc ON the coil top (yLevel 0.95, sense
 *     mcgSweep) and the restoring twist an arc ON the hairspring (yLevel -1.30,
 *     opposite sense) — not the collinear axial arrows the row describes; S6 settle
 *     overshoot = 7 deg with a balance-marker "=" pulse. eye-walker saw two separate
 *     non-collinear arcs + a multi-degree damped settle (phi 28.9->25.9->28.6) on-frame.
 *
 * Idempotent: upsert onConflict 'bug_class'. Also writes the archival SQL.
 * Run: npx tsx --env-file=.env.local src/scripts/_seed_engine_bug_queue_mcg_rule31.ts
 */
import '@/lib/loadEnvLocal';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const SESSION = 'session_2026-07-05_mcg_rule31_rebuild_and_force_fix';

type Owner =
  | 'alex:architect' | 'alex:physics_author' | 'alex:json_author'
  | 'peter_parker:renderer_primitives' | 'peter_parker:runtime_generation'
  | 'peter_parker:visual_validator' | 'ambiguous';
type Severity = 'CRITICAL' | 'MAJOR' | 'MODERATE';
type Status = 'OPEN' | 'FIXED' | 'DEFERRED' | 'NOT_REPRODUCING' | 'FALSE_POSITIVE';
type ProbeType = 'sql' | 'js_eval' | 'manual' | 'vision_model';
type RowType = 'incident' | 'directive';

interface Row {
  bug_class: string; title: string; severity: Severity; owner_cluster: Owner;
  root_cause: string; prevention_rule: string; probe_type: ProbeType; probe_logic: string;
  status: Status; concepts_affected: string[]; fixed_in_files: string[]; row_type: RowType;
}

const CONCEPT = 'moving_coil_galvanometer';
const RENDERER = 'src/lib/renderers/field_3d_renderer.ts';
const JSON_FILE = 'src/data/concepts/moving_coil_galvanometer.json';

const incidents: Row[] = [
  {
    bug_class: 'mcg_coil_rotation_opposes_bil_force_couple',
    title: 'Moving-coil galvanometer: the coil spins OPPOSITE to the BIL force couple it teaches — coil.rotation.y=+phiRad and the deflecting-torque arrow (+y) are reversed relative to the (correct) left-into-page / right-out-of-page forces',
    severity: 'MAJOR',
    owner_cluster: 'peter_parker:renderer_primitives',
    root_cause:
      `VERIFIED STALE + marked FIXED 2026-07-05. The row describes coil.rotation.y=+phiRad / tau=+y, but the shipped renderer has mcgSweep=-1 (field_3d_renderer.ts:11855) since the file was first written (24f4bc3, 2026-06-29): coil.rotation.y = mcgSweep*phiRad = -phiRad and mcg_tau_deflect dir = (0,mcgSweep,0) = -y. The force couple from the drawn arrows (mcg_force_left into page @ local x=-h, mcg_force_right out @ x=+h) is sum(r x F) = -y, so the -y rotation and -y torque arrow are CONSISTENT with the forces — the coil rotates WITH its own force couple. The renderer comment at :11849-11854 documents this. eye-walker run 20260705-152326 confirmed independently via world-position + camera-projection-depth computation across phi=0..90 and frame cross-check (STATE_7 phi 11.5->68.8: the +h/out-of-page wire's camera depth stays positive/in-front the whole sweep, the -h/into-page wire recedes) plus STATE_8 phi=85.9. No code change was required for the rotation sign; the row was stale relative to the current renderer.`,
    prevention_rule:
      'The rendered rotation sense must be derived from (and validated against) the rendered force couple: sign(sum(r x F)) from the force-arrow directions+positions must equal sign(coil.rotation.y), and the deflecting-torque vector must point along that same axis sense (restoring opposite). A single scenario-wide sign constant (mcgSweep) must thread rotation + tau vectors + dial + spring so they stay mutually consistent. Before logging a rotation-sign incident, derive the couple sign from the actual arrow vectors in code — a diagonal/isometric camera makes raw screen-left/right unreliable for judging rotation sense.',
    probe_type: 'manual',
    probe_logic:
      'Compute sum(r x F) from mcg_force_left/right positions+directions; assert sign equals sign(coil.rotation.y = mcgSweep*phiRad) and sign(mcg_tau_deflect.y). With mcgSweep=-1 all three are -y → consistent. NOTE: on a 45-degree isometric camera a deflecting wire crosses screen-left<->right past phi=45 while staying in front — judge by camera-projection DEPTH, not raw screen x.',
    status: 'FIXED',
    concepts_affected: [CONCEPT],
    fixed_in_files: [RENDERER],
    row_type: 'incident',
  },
  {
    bug_class: 'mcg_uniform_field_force_arrow_shrinks_with_cosphi',
    title: 'Moving-coil galvanometer uniform-field states (S2/S3): the BIL force arrows are scaled x|cosphi| and parented to the coil so they shrink and rotate, but |F|=BIL is constant in magnitude AND fixed in world-direction as the coil turns — only the torque (via the lever arm) falls as cosphi',
    severity: 'MODERATE',
    owner_cluster: 'peter_parker:renderer_primitives',
    root_cause:
      `FIXED 2026-07-05 (field_3d_renderer.ts, updateMovingCoilGalvanometerFrame). Was: fLen = sd.radial ? 0.85 : 0.85*|cos(phi)| — the uniform-field force arrows shrank with cos(phi), wrongly implying |F| depends on phi. Fix: force-arrow length is now a constant 0.85 in BOTH fields (|F|=BIL is constant). Direction: in the UNIFORM field the two vertical sides stay vertical, so F = I L(+/-y) x B(+x) = -/+z is FIXED in world regardless of coil angle — the coil-child arrows are now counter-rotated by -coil.rotation.y so they hold world -/+z; in the RADIAL field the force is genuinely tangential and co-rotates, so the coil-local +/-z direction is kept. The cos(phi) dependence now reads only via the torque arrow (mcg_tau_deflect ∝ cos phi) + the crowded scale (S3). retrofit-surgeon reworded s3_3 in lockstep ("the lever arm / torque shrinks" not "each force shrinks").`,
    prevention_rule:
      'In uniform-field current-loop sims hold BIL force-arrow length AND world-direction constant (do not parent uniform-field force arrows to the coil rotation); express the cos(phi) fade ONLY through the torque arrow or a visibly shrinking lever arm. Reserve coil-child (co-rotating, tangential) force arrows for the RADIAL field, where the force direction genuinely rotates with position.',
    probe_type: 'manual',
    probe_logic:
      'In S2/S3, across the deflection the two green force arrows must keep constant length and a world-fixed +/-z direction (they translate with their wire but do not shrink or tilt). Any cos(phi) fade must appear on the torque arrow / lever arm, not the force arrows.',
    status: 'FIXED',
    concepts_affected: [CONCEPT],
    fixed_in_files: [RENDERER, JSON_FILE],
    row_type: 'incident',
  },
  {
    bug_class: 'mcg_equilibrium_torque_balance_choreography_underplayed',
    title: 'Moving-coil galvanometer equilibrium (S5/S6): the two opposing torques are drawn as collinear axial arrows on one line and the damped-settle overshoot is <1deg (effectively invisible), so the NIAB=kphi tug-of-war and the needle oscillate-and-settle do not read',
    severity: 'MODERATE',
    owner_cluster: 'peter_parker:renderer_primitives',
    root_cause:
      `VERIFIED ADDRESSED + marked FIXED 2026-07-05. The row describes collinear axial arrows + <1deg overshoot, but the current renderer already draws the opposing twists as SEPARATE non-collinear arcs: mcgBuildTorqueArc places the deflecting twist as an arc ON the coil top (yLevel 0.95, sense mcgSweep) and the restoring twist as an arc ON the hairspring (yLevel -1.30, opposite sense -mcgSweep) — the code comment at :12085-12090 states "never the old collinear double-headed axial arrow". The deflecting arc span ∝ NIAB (held) while the restoring arc span ∝ k*phi (grows to equal it), and S6's settle_phi authors overshoot_deg=7 (>5deg, perceptible) with a mcg_balance_marker "=" + ring brightness pulse as |NIAB - k*phi| -> 0. eye-walker run 20260705-152326 saw the two separate non-collinear arcs (magenta tau on coil, teal tauS on hairspring) and a multi-degree damped settle (phi 28.9->25.9->28.6) on-frame. Founder can confirm the settle drama at the S5/S6 review frames.`,
    prevention_rule:
      'Equilibrium/balance beats need a perceptible (>~3-5deg) decaying oscillation and a NON-collinear opposing-twist depiction: deflecting twist as an arc on the moving body (rotation sense), restoring twist as an arc on the restoring element (opposite sense); during settle hold the deflecting arc while the restoring arc grows to equal, and add a brief lock/pulse ("=") at balance.',
    probe_type: 'manual',
    probe_logic:
      'In S5/S6 confirm two SEPARATE arcs at different heights/curls (coil vs hairspring), opposite sense, restoring arc growing to match the deflecting arc, a visible multi-degree damped oscillation, and an "=" / ring pulse at balance — not a single collinear axial double-arrow.',
    status: 'FIXED',
    concepts_affected: [CONCEPT],
    fixed_in_files: [RENDERER],
    row_type: 'incident',
  },
];

function sqlStr(s: string): string { return `'${s.replace(/'/g, "''")}'`; }
function sqlArr(a: string[]): string { return a.length === 0 ? `ARRAY[]::text[]` : `ARRAY[${a.map(sqlStr).join(', ')}]`; }
function sqlRow(r: Row): string {
  return `(${sqlStr(r.bug_class)}, ${sqlStr(r.title)}, ${sqlStr(r.severity)}, ${sqlStr(r.owner_cluster)}, ` +
    `${sqlStr(r.root_cause)}, ${sqlStr(r.prevention_rule)}, ${sqlStr(r.probe_type)}, ${sqlStr(r.probe_logic)}, ` +
    `${sqlStr(r.status)}, ${sqlArr(r.concepts_affected)}, ${sqlArr(r.fixed_in_files)}, ${sqlStr(SESSION)}, ${sqlStr(r.row_type)})`;
}
function emitSql(all: Row[]): string {
  const cols = 'bug_class, title, severity, owner_cluster, root_cause, prevention_rule, probe_type, probe_logic, status, concepts_affected, fixed_in_files, discovered_in_session, row_type';
  return `-- 2026-07-05: moving_coil_galvanometer Rule-31 rebuild — close 3 engine_bug_queue rows.\n` +
    `-- coil_rotation_opposes (stale, mcgSweep=-1 already correct), force_arrow_shrinks\n` +
    `-- (renderer fix: constant |F|, world-fixed direction in uniform field), equilibrium\n` +
    `-- choreography (verified addressed: non-collinear arcs + 7deg overshoot + balance pulse).\n` +
    `-- Generated by src/scripts/_seed_engine_bug_queue_mcg_rule31.ts — idempotent.\n\n` +
    `INSERT INTO engine_bug_queue (${cols}) VALUES\n${all.map(sqlRow).join(',\n')}\n` +
    `ON CONFLICT (bug_class) DO UPDATE SET status = EXCLUDED.status, root_cause = EXCLUDED.root_cause,\n` +
    `  prevention_rule = EXCLUDED.prevention_rule, probe_logic = EXCLUDED.probe_logic,\n` +
    `  title = EXCLUDED.title, severity = EXCLUDED.severity, owner_cluster = EXCLUDED.owner_cluster,\n` +
    `  fixed_in_files = EXCLUDED.fixed_in_files;\n`;
}

async function main(): Promise<void> {
  const sqlPath = join(process.cwd(), 'supabase_migrations', 'supabase_2026-07-05_seed_engine_bug_queue_mcg_rule31_migration.sql');
  writeFileSync(sqlPath, emitSql(incidents), 'utf-8');
  console.log(`Wrote archival SQL: ${sqlPath} (${incidents.length} incident rows)`);

  const payload = incidents.map((r) => ({
    ...r,
    discovered_in_session: SESSION,
    fixed_at: r.status === 'FIXED' ? new Date().toISOString() : null,
  }));
  const { error } = await supabaseAdmin.from('engine_bug_queue').upsert(payload, { onConflict: 'bug_class' });
  if (error) { console.error(`✗ upsert failed: ${error.message}`); process.exit(1); }
  console.log(`✓ ${incidents.length} mcg bug row(s) upserted → FIXED`);
}

main().catch((err) => { console.error('💥 seed failed:', err instanceof Error ? err.stack : err); process.exit(1); });
