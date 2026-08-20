/**
 * CLOSE engine_bug_queue row
 *   current_flow_dots_and_field_arrows_accumulate_dtstep_through_the_freeze_so_pause_does_not_stop_the_current
 * (filed 2026-08-13, MAJOR, owner peter_parker:field3d_surgeon).
 *
 * The audit filed FOUR unguarded accumulators (straight_wire_current x2,
 * parallel_currents_force x2). The fix pass re-grepped the file at desk HEAD
 * (post-rotmech merges) and found EIGHT — the same defect also lives in
 * galvanometer_to_ammeter_voltmeter, bar_magnet_as_dipole and
 * gauss_law_magnetism. All eight now take the freeze guard.
 *
 * DO NOT RUN until the two-run frozen-diff acceptance (npm run visual:eyes twice,
 * frozen PNGs diffing 0.00%) passes — the dispatching session runs this script.
 *
 * Idempotent: upsert onConflict 'bug_class'. Run:
 *   npx tsx --env-file=.env.local src/scripts/_close_engine_bug_queue_freeze_guard_accumulators.ts
 */
import '@/lib/loadEnvLocal';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

// discovered_in_session is a DISCOVERY fact — preserve the original audit session
// on the upsert (the whole row is replaced) rather than stamping the fix session.
const SESSION = 'session_2026-08-13_motion_registry_audit';
const FIX_SESSION = 'session_2026-08-14_field3d_freeze_guard_accumulators_fix';

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

const RENDERER = 'src/lib/renderers/field_3d_renderer.ts';

const rows: Row[] = [
  {
    bug_class: 'current_flow_dots_and_field_arrows_accumulate_dtstep_through_the_freeze_so_pause_does_not_stop_the_current',
    title: 'EIGHT path-dependent accumulators across five field_3d scenarios ignored the heldAtPin freeze guard: Pause did not stop them, and no current-ON baseline reproduced',
    severity: 'MAJOR',
    owner_cluster: 'peter_parker:field3d_surgeon',
    root_cause:
      'FIXED 2026-08-14 on branch fix/field3d-freeze-guard-accumulators. EIGHT path-dependent accumulators in field_3d_renderer.ts advanced with no freeze guard — the 2026-08-13 audit found four, the fix pass re-grepped the file at post-rotmech HEAD and found four MORE in three additional scenarios. (1)+(2) parallel_currents_force, inside updateParallelCurrentsForceFrame(): ud.dotPhase += 0.016 * __pmSteps * dotSpeed (the flow dots) and ud.swPhase += 0.016 * __pmSteps * orbitRate * (-rotSign) (the orbiting B1 arrows). (3)+(4) straight_wire_current, inline in animate(): swUd.swPhase += dtStep * effRotRate * rotDirSign * swRateScale (the rotating field-line arrows) and swUd.dotPhase += dtStep * dotSpeed * iScale (the yellow current beads). (5) galvanometer_to_ammeter_voltmeter, inside updateGalvanometerAmmeterVoltmeterFrame(): dd.userData.t = dd.userData.t + sp * 0.016 * __pmSteps (the always-on current-dot stream around the meter circuit). (6) bar_magnet_as_dipole, inside updateBarMagnetAsDipoleFrame(): tr.userData.t = tr.userData.t + 0.18 * 0.016 * __pmSteps (the field-direction tracer stream along the arches). (7)+(8) gauss_law_magnetism, inside updateGaussLawMagnetismFrame(): tr.userData.t = tr.userData.t + 0.18 * 0.016 * __pmSteps (the closed-loop tracer stream) and intD.userData.t = intD.userData.t + 0.18 * 0.016 * __pmSteps (the internal-return dot). MECHANISM: heldAtPin is local to animate(), and under any pin __pmSteps is FORCED to 1, so 0.016 * __pmSteps (== dtStep) never reaches 0 — every one of these accumulators advanced once per RENDERED FRAME straight through SET_TIME_FREEZE, making its phase a function of how many frames the browser drew rather than of sim time. TWO CONSEQUENCES. (1) PRODUCT: the teacher Pause button implements Rule 26b by posting SET_TIME_FREEZE {at_ms: readSimTimeMs()} (build_review_site.ts freeze()) — the SAME mechanism as the gate pin — so on Pause the whole sim held while the beads/tracers kept flowing and the field arrows kept rotating. (2) GATE: no current-ON state could reproduce its own baseline. MEASURED 2026-08-13 on magnetic_field_concept_B with the decisive control — TWO EYE runs, same renderer, same machine, 28 minutes apart: run-vs-RUN frozen diffs 2.03% (S1), 2.63% (S2), 1.53% (S4), 4.16% (S5), 1.63% (S6), 1.52% (S7), the SAME magnitude as run-vs-baseline, while STATE_3 — the ONE state with the current switched OFF (mode source_off, no beads) — was EXACTLY 0.00% on every comparison. THE FIX uses the two idioms already in the file, no new mechanism: the straight_wire_current block (heldAtPin in scope) hoists var swDt = heldAtPin ? 0 : dtStep once and uses it at both sites, mirroring the solenoid guard var cfDt = heldAtPin ? 0 : dtStep; the four update*Frame() functions (where heldAtPin is NOT in scope — referencing it there throws ReferenceError, a scar already recorded on updatePeExternalFieldFrame) take a precomputed dt parameter and are called as update<X>Frame(heldAtPin ? 0 : dtStep), the dominant idiom already used by updateTorqueLoopFrame / updateCurrentLoopDipoleFrame / updateDipoleInFieldFrame / updateRhrForceDirectionFrame / updateMagneticNoWorkFrame / updateRadiusInUniformFieldFrame / updateCyclotronPeriodFrame / updateNewtonsLawsBodyFrame / updateForceRigFrame. Each of the four functions had exactly ONE call site; all four were updated. No other file touched (deriveStateMeta.ts deliberately NOT touched — the missing motion-registry entries for parallel_currents_force/gauss_law_magnetism belong to the separate OPEN motion-registry row).',
    prevention_rule:
      'Every per-frame accumulator in a renderer takes the freeze guard (heldAtPin ? 0 : dtStep) in the same edit that creates it — a pure function of state-local time needs no guard, an accumulator ALWAYS does. When the accumulator lives in a helper function, thread the guarded dt as a PARAMETER: heldAtPin is local to animate() and referencing it from a helper throws ReferenceError (recorded scar). The test is not "does it look right", it is "does the teacher Pause button stop it, and does the same pin reproduce the same pixels twice". Two runs of THE EYE on a current-ON state must diff 0.00% on the frozen frame; anything else means an unguarded accumulator, and re-approving the baseline hides it rather than fixing it. NOTE for the next reader: magnetic_field_concept_B\'s post-fix H2-vs-baseline reds are the stale bug-era baseline awaiting founder visual:approve — NOT recurrence; teacher Pause now stopping beads/arrows in these five scenarios is the fix, not a regression.',
    probe_type: 'js_eval',
    probe_logic:
      'grep field_3d_renderer.ts for "+= dtStep", "+= 0.016 * __pmSteps" and "+ 0.016 * __pmSteps" and check each hit gates its dt on heldAtPin (either directly, via a hoisted var like cfDt/swDt, or via a dt parameter threaded from the animate call site). As of the 2026-08-14 fix the only surviving raw "0.016 * __pmSteps" occurrences are the dtStep definition itself, the already-guarded call updateDipoleInFieldFrame(heldAtPin ? 0 : 0.016 * __pmSteps), and comments. Behaviourally: run npm run visual:eyes -- <id> TWICE and diff the two runs\' <STATE>__frozen.png — a non-zero diff on an unchanged renderer is this bug, and the current-OFF state of the same concept diffing 0.00% is the control that proves it. Do NOT re-approve baselines to make H2 green and do NOT raise the tolerance while the bug is live. AFTER this fix the run-vs-run diff must be 0.00%; magnetic_field_concept_B\'s post-fix H2-vs-baseline reds are the stale bug-era baseline awaiting founder visual:approve — NOT recurrence; teacher Pause now stopping beads/arrows in these five scenarios is the fix, not a regression. ONE accumulator was deliberately left untouched and is NOT part of this row: gauss_law_magnetism\'s surface-spin window.PM_gmSpin = (window.PM_gmSpin || 0) + 0.014 (a hardcoded per-frame delta, no dt at all) — separate defect class, out of this dispatch\'s scope.',
    status: 'FIXED',
    concepts_affected: [
      'magnetic_field_concept_B',
      'magnetic_field_wire',
      'parallel_currents_force',
      'galvanometer_to_ammeter_voltmeter',
      'bar_magnet_as_dipole',
      'gauss_law_magnetism',
    ],
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
  return `-- 2026-08-14: CLOSE the freeze-guard accumulator row — 8 sites across 5 field_3d\n` +
    `-- scenarios now take (heldAtPin ? 0 : dtStep). Generated by\n` +
    `-- src/scripts/_close_engine_bug_queue_freeze_guard_accumulators.ts — idempotent.\n\n` +
    `INSERT INTO engine_bug_queue (${cols}) VALUES\n${all.map(sqlRow).join(',\n')}\n` +
    `ON CONFLICT (bug_class) DO UPDATE SET status = EXCLUDED.status, root_cause = EXCLUDED.root_cause,\n` +
    `  prevention_rule = EXCLUDED.prevention_rule, probe_logic = EXCLUDED.probe_logic,\n` +
    `  title = EXCLUDED.title, severity = EXCLUDED.severity, owner_cluster = EXCLUDED.owner_cluster,\n` +
    `  concepts_affected = EXCLUDED.concepts_affected, fixed_in_files = EXCLUDED.fixed_in_files,\n` +
    `  fixed_at = now();\n`;
}

async function main(): Promise<void> {
  const sqlPath = join(process.cwd(), 'supabase_migrations', 'supabase_2026-08-14_close_engine_bug_queue_freeze_guard_accumulators_migration.sql');
  writeFileSync(sqlPath, emitSql(rows), 'utf-8');
  console.log(`Wrote archival SQL: ${sqlPath} (${rows.length} row(s))`);

  const payload = rows.map((r) => ({
    ...r,
    discovered_in_session: SESSION,
    fixed_at: r.status === 'FIXED' ? new Date().toISOString() : null,
  }));
  const { error } = await supabaseAdmin.from('engine_bug_queue').upsert(payload, { onConflict: 'bug_class' });
  if (error) { console.error(`✗ upsert failed: ${error.message}`); process.exit(1); }
  console.log(`✓ ${rows.length} row(s) upserted (1 FIXED) — fix session ${FIX_SESSION}`);
}

main().catch((err) => { console.error('💥 close failed:', err instanceof Error ? err.stack : err); process.exit(1); });
