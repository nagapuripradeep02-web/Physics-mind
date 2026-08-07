/**
 * engine_bug_queue update for the checkpoint home-pose adoption race
 * (routed engine dispatch, Ch.6 concept #4, 2026-08-08).
 *
 * ONE row, flipped OPEN -> FIXED. The row already existed (filed CRITICAL/OPEN by
 * the ch6 concept #4 json_author fix-cycle verification), so this is an UPSERT on
 * the existing bug_class — an update/close, NOT a duplicate INSERT.
 *
 * Run: npx tsx --env-file=.env.local src/scripts/_seed_engine_bug_queue_nlb_checkpoint_home_pose_race.ts
 */
import '@/lib/loadEnvLocal';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const SESSION = 'session_2026-08-08_ch6_c4_field3d_surgeon_checkpoint_home_pose_race';

type Owner =
  | 'alex:architect' | 'alex:physics_author' | 'alex:json_author'
  | 'peter_parker:renderer_primitives' | 'peter_parker:field3d_surgeon'
  | 'peter_parker:runtime_generation' | 'peter_parker:visual_validator' | 'ambiguous';
type Severity = 'CRITICAL' | 'MAJOR' | 'MODERATE';
type Status = 'OPEN' | 'FIXED' | 'DEFERRED' | 'NOT_REPRODUCING' | 'FALSE_POSITIVE';
type ProbeType = 'sql' | 'js_eval' | 'manual' | 'vision_model';
type RowType = 'incident' | 'probe_definition' | 'directive';

interface Row {
  bug_class: string; title: string; severity: Severity; owner_cluster: Owner;
  root_cause: string; prevention_rule: string; probe_type: ProbeType; probe_logic: string;
  status: Status; concepts_affected: string[]; fixed_in_files: string[]; row_type: RowType;
}

const rows: Row[] = [
  {
    bug_class: 'nlb_checkpoint_at_the_body_home_pose_adopts_its_side_in_a_race_so_the_stamp_renders_only_on_some_runs',
    title:
      'A checkpoint authored at exactly the tracked body home pose adopts its crossing side in a race against the first physics step, so the stamp fires near t=0 on some runs and only on the return crossing on others — and a baseline can capture either',
    severity: 'CRITICAL',
    owner_cluster: 'peter_parker:field3d_surgeon',
    root_cause:
      'FIXED 2026-08-08. nlbRunCheckpoints used an adopt-never-fire guard: on the first evaluation after entry or RESET_TRAJECTORY it set cp._side from sign(s - s_m) WITHOUT firing, so no rewind could manufacture a phantom crossing. That guard is well-defined only where sign(s - s_m) has a sign to read. With s_m === the body\'s initial_position_m (work_energy_theorem STATE_4: s_m 1.6 = initial_position_m 1.6, v0 -3, the "stamp the start conditions" flag) the body stands EXACTLY on the flag and sign(0) has no side, so what got adopted depended purely on whether the shared clock had advanced before the checkpoint pass first ran — and both frame paths are real: entry while a SET_TIME_FREEZE pin is still held runs dt=0 frames (updateNewtonsLawsBodyFrame(heldAtPin ? 0 : dtStep)), the body is still at s_m, the >= test adopts +1 and the first departure fires the stamp; entry with the clock already advancing samples a body one step downrange, adopts -1, the departure is invisible and the stamp waits for the RETURN crossing ~2.0 s later, past the reveal pin. Both branches reproduced on the SAME pre-fix build (10/10 cold loads adopted -1 with no stamp; entry under a held pin adopted +1 and stamped), with byte-identical physics in every run (s=0.557056 at the 1560 ms pin) — the picture alone flaked. THE EYE\'s own two captures of the same pinned instant disagreed inside ONE approved baseline set: visual_baselines/work_energy_theorem/STATE_4.png has no stamp, STATE_4__frozen.png has it. FIX: the side is never sampled from a position a clock advance can flip. New nlbCpArm(eng) arms every checkpoint from AUTHORED SEED DATA (b.s0, b.v0, cp.s_m) at the two places a seeded rewind happens — state entry (after nlbSeedKinematics + the body_id resolution) and the tail of nlbResetTrajectory. s0 > s_m / s0 < s_m arm +1/-1, which is byte-identical to what the lazy adopt read (live s IS s0 there), just decided before any frame can move it; s0 === s_m arms _home = true with _side = -sign(v0) (0 when v0 === 0) and nlbRunCheckpoints then HOLDS while b.s === cp.s_m and treats the first departure, either way, as the crossing. A sandbox wrap is deliberately NOT armed (it teleports the body across the band rather than rewinding to s0, so its post-wrap position is the only honest side) and keeps the original null/adopt path. Rule 36: arming reads authored seed values only — no clock, no accumulator, no history — so a rewind re-arms to identical numbers and RESET -> pin -> RESET -> dense stays byte-identical.',
    prevention_rule:
      'A latch that "adopts instead of firing" on its first evaluation must adopt from AUTHORED SEED DATA, never from a live sampled value — the moment of that first evaluation is a race against the shared clock (a dt=0 held-pin frame and a dt>0 free-running frame both occur in THE EYE\'s own drive). Wherever the adopted quantity is a SIGN, the degenerate zero case must be resolved explicitly from data (here: the seeded velocity, i.e. the side the body is about to leave), because sign(0) has no side and whichever branch the comparison operator happens to take is then decided by frame timing. Corollary for review: an approved baseline is not proof of determinism. When two captures of the SAME pinned instant exist (primary + __frozen), diff them against EACH OTHER — a set whose two frames disagree is a race already frozen into the approval, and H2 will flake against it forever.',
    probe_type: 'js_eval',
    probe_logic:
      'Determinism probe (reference: the throwaway drives used for this fix, deleted after the run). (a) ARM: suspend requestAnimationFrame so the animate loop cannot run a single frame, THEN post SET_STATE for the checkpoint state; read PM_nlbEngine.checkpoint_state[0] and assert _side === -sign(v0) and _home === true whenever cp.s_m === body.initial_position_m, with _count === 0 (5/5 runs post-fix: _side=1, _home=true, _count=0 for v0=-3). (b) RACE: 10 COLD page loads of the assembled sim, each driving THE EYE sequence SET_STATE -> RESET_TRAJECTORY -> REPLAY_ANIMATIONS -> SET_TIME_FREEZE{at_ms: reveal pin} -> poll PM_simTimeMs; assert cp._count and cp.text are identical across all 10 (pre-fix: 10/10 count=0, text="" while the approved baseline holds the stamp; post-fix: 10/10 count=1, text="start:  v = -3.00 m/s  ·  K = 18.0 J"). (c) BASELINE SELF-CONSISTENCY: for any concept whose state renders a checkpoint stamp, diff visual_baselines/<id>/STATE_N.png against STATE_N__frozen.png — the same pinned instant must not disagree about whether the stamp exists.',
    status: 'FIXED',
    concepts_affected: ['work_energy_theorem'],
    fixed_in_files: ['src/lib/renderers/field_3d_renderer.ts'],
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
  return `-- 2026-08-08: the checkpoint home-pose adoption race (Ch.6 concept #4, routed engine\n` +
    `-- dispatch). Existing CRITICAL/OPEN row flipped to FIXED — an update, not a new class.\n` +
    `-- Generated by src/scripts/_seed_engine_bug_queue_nlb_checkpoint_home_pose_race.ts — idempotent.\n\n` +
    `INSERT INTO engine_bug_queue (${cols}) VALUES\n${all.map(sqlRow).join(',\n')}\n` +
    `ON CONFLICT (bug_class) DO UPDATE SET status = EXCLUDED.status, root_cause = EXCLUDED.root_cause,\n` +
    `  prevention_rule = EXCLUDED.prevention_rule, probe_logic = EXCLUDED.probe_logic,\n` +
    `  title = EXCLUDED.title, severity = EXCLUDED.severity, owner_cluster = EXCLUDED.owner_cluster,\n` +
    `  concepts_affected = EXCLUDED.concepts_affected, fixed_in_files = EXCLUDED.fixed_in_files,\n` +
    `  fixed_at = CASE WHEN EXCLUDED.status = 'FIXED' THEN now() ELSE engine_bug_queue.fixed_at END;\n`;
}

async function main(): Promise<void> {
  const sqlPath = join(process.cwd(), 'supabase_migrations',
    'supabase_2026-08-08_seed_engine_bug_queue_nlb_checkpoint_home_pose_race_migration.sql');
  writeFileSync(sqlPath, emitSql(rows), 'utf-8');
  console.log(`Wrote archival SQL: ${sqlPath} (${rows.length} row(s))`);

  const payload = rows.map((r) => ({
    ...r,
    discovered_in_session: SESSION,
    fixed_at: r.status === 'FIXED' ? new Date().toISOString() : null,
  }));
  const { error } = await supabaseAdmin.from('engine_bug_queue').upsert(payload, { onConflict: 'bug_class' });
  if (error) { console.error(`✗ upsert failed: ${error.message}`); process.exit(1); }
  console.log(`✓ ${rows.length} row(s) upserted (1 FIXED)`);
}

main().catch((err) => { console.error('💥 seed failed:', err instanceof Error ? err.stack : err); process.exit(1); });
