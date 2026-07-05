/**
 * engine_bug_queue rows for the two Rule-31 readiness gaps in
 * torque_on_current_loop_in_field, surfaced 2026-07-05 when the Socratic->Rule-31
 * narration retrofit (retrofit_surgeon, JSON-only) landed but THE EYE + the surgeon's
 * escalation showed the torque_on_loop_uniform_field scenario is not yet Rule-31-ready.
 *
 * The hard D7 blocker (STATE_9 motion death) was fixed 2026-07-05 (renderer_primitives).
 * UPDATE 2026-07-05: founder authorized the full Rule-31 rebuild — BOTH gaps are now
 * FIXED and eye-walker pixel-verified (run 20260705-045637): per-state contextual controls
 * (tq_*_row + applyVisibleControls; S5=N,I / S6=B / S7=theta / S11=all / watch beats=none)
 * and distinct sustained motion on every state (the 6 formerly-static beats now animate).
 *
 * Idempotent: upsert onConflict 'bug_class'. Also writes the archival SQL.
 * Run: npx tsx --env-file=.env.local src/scripts/_seed_engine_bug_queue_torque_rule31_gaps.ts
 */
import '@/lib/loadEnvLocal';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const SESSION = 'session_2026-07-05_torque_socratic_retrofit_rule31_gaps';

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

const CONCEPT = 'torque_on_current_loop_in_field';
const RENDERER = 'src/lib/renderers/field_3d_renderer.ts';

const incidents: Row[] = [
  {
    bug_class: 'torque_scenario_no_contextual_controls',
    title: 'torque_on_loop_uniform_field scenario cannot do Rule-31c per-state contextual controls — the slider panel is all-or-nothing (no row-wrapper ids, no applyVisibleControls call), shown only at the explore state; guided states expose no state-relevant slider',
    severity: 'MAJOR',
    owner_cluster: 'peter_parker:renderer_primitives',
    root_cause:
      `FIXED + VERIFIED 2026-07-05. Was: the #torque_sliders panel was four bare label+input pairs with NO row-wrapper ids and NO applyVisibleControls call (only STATE_11 showed the panel — the old last-state-only pattern). TWO-PART FIX landed: (a) renderer_primitives wrapped the four sliders in tq_n_row/tq_i_row/tq_b_row/tq_theta_row (built once) + calls applyVisibleControls({N:tq_n_row,I:tq_i_row,B:tq_b_row,theta:tq_theta_row}, stateDef.visible_controls) in the torqueSlidersEl branch (scenario-gated), reusing the shared helper; (b) json_author added per-state visible_controls arrays (S5=[N,I], S6=[B], S7=[theta], S11=[N,I,B,theta], watch beats none) + show_sliders:true and fixed STATE_11's show_sliders array bug. Eye-walker pixel-verified run 20260705-045637: each state shows exactly its relevant slider row set, explore shows all.`,
    prevention_rule:
      'A field_3d scenario used by a Rule-31 concept must support per-state contextual controls (row-wrapper ids + applyVisibleControls reading stateDef.visible_controls) BEFORE the concept is authored/retrofitted to Rule 31 — a Socratic->straightforward narration retrofit alone does not make a concept Rule-31-compliant if its scenario is control-incapable.',
    probe_type: 'manual',
    probe_logic:
      'For torque_on_current_loop_in_field, confirm each guided state exposes only its relevant slider row(s) and the explore state exposes all. If the panel is all-or-nothing (only the explore state shows any slider), Rule-31c is unmet.',
    status: 'FIXED',
    concepts_affected: [CONCEPT],
    fixed_in_files: [RENDERER, 'src/data/concepts/torque_on_current_loop_in_field.json'],
    row_type: 'incident',
  },
  {
    bug_class: 'torque_static_early_states',
    title: 'torque_on_current_loop_in_field STATE_1/2/3 are rotation_mode "static" (zero motion) — violates Rule 31b "no static state; every state alive with distinct motion"',
    severity: 'MODERATE',
    owner_cluster: 'ambiguous',
    root_cause:
      `FIXED + VERIFIED 2026-07-05. Was: STATE_1/2/3/5/7/10 authored rotation_mode:"static" (frozen picture, Rule 31b violation). FIX: renderer_primitives added distinct sustained motion per state (json_author selects the mode) — S1 current_flow_idle (loop-edge breathing pulse), S2 arrow_grow (F1 continuous opacity pulse), S3 arrow_grow+cancel_pulse (both F arrows in-phase throb), S5 mu_reveal (mu opacity pulse), S7 tau_max_throb (bounded tau pulse), S10 swap_loop (loop<->bar-magnet cross-fade). NOTE the design journey (3 verification rounds): one-time size-grow reveals were tried first but were invisible on screen due to FORESHORTENING (F/mu point near the camera axis, so a 3D length change barely moves the 2D projection) AND were a Rule-29 concern (growing a fixed-magnitude vector). Final design = continuous bounded OPACITY pulses (period 3.0s, non-aliasing with THE EYE's 1s sampling; Rule-29-clean = brightness not size, honest full length). Eye-walker pixel-verified oscillation on all of S1/S2/S3/S5 (run 20260705-045637: e.g. S2 F1 pixel-count trough 5 -> peak 150). rotation_mode metadata no longer literally "static" on any guided state.`,
    prevention_rule:
      'Every guided state (including setup / watch-this beats) must show distinct auto-playing motion (Rule 31b) — a rotation_mode "static" state is a design smell to resolve at author time, not ship.',
    probe_type: 'manual',
    probe_logic:
      'For each guided state, THE EYE motion profile (D-checks) must show sustained above-floor adjacent-frame motion; a state that is flat for its whole duration is a static-state violation. NOTE: D6/D7 can PASS on marching-dot baseline while the INTENDED distinct motion is absent — verify the taught element (arrow/vector/loop) with a pixel-proxy oscillation measure, not just the gate.',
    status: 'FIXED',
    concepts_affected: [CONCEPT],
    fixed_in_files: [RENDERER, 'src/data/concepts/torque_on_current_loop_in_field.json'],
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
  return `-- 2026-07-05: torque_on_current_loop_in_field Rule-31 readiness gaps (contextual\n` +
    `-- controls + static early states) surfaced by the Socratic->Rule-31 narration retrofit.\n` +
    `-- Hard D7 blocker (STATE_9 motion death) already FIXED + EYE-clean; these two OPEN rows\n` +
    `-- track the deferred Rule-31 rebuild pass. Generated by\n` +
    `-- src/scripts/_seed_engine_bug_queue_torque_rule31_gaps.ts — idempotent.\n\n` +
    `INSERT INTO engine_bug_queue (${cols}) VALUES\n${all.map(sqlRow).join(',\n')}\n` +
    `ON CONFLICT (bug_class) DO UPDATE SET status = EXCLUDED.status, root_cause = EXCLUDED.root_cause,\n` +
    `  prevention_rule = EXCLUDED.prevention_rule, probe_logic = EXCLUDED.probe_logic,\n` +
    `  title = EXCLUDED.title, severity = EXCLUDED.severity, owner_cluster = EXCLUDED.owner_cluster,\n` +
    `  fixed_in_files = EXCLUDED.fixed_in_files;\n`;
}

async function main(): Promise<void> {
  const sqlPath = join(process.cwd(), 'supabase_migrations', 'supabase_2026-07-05_seed_engine_bug_queue_torque_rule31_gaps_migration.sql');
  writeFileSync(sqlPath, emitSql(incidents), 'utf-8');
  console.log(`Wrote archival SQL: ${sqlPath} (${incidents.length} incident rows)`);

  const payload = incidents.map((r) => ({
    ...r,
    discovered_in_session: SESSION,
    fixed_at: r.status === 'FIXED' ? new Date().toISOString() : null,
  }));
  const { error } = await supabaseAdmin.from('engine_bug_queue').upsert(payload, { onConflict: 'bug_class' });
  if (error) { console.error(`✗ upsert failed: ${error.message}`); process.exit(1); }
  console.log(`✓ ${incidents.length} torque Rule-31 gap row(s) upserted (both FIXED + eye-walker verified)`);
}

main().catch((err) => { console.error('💥 seed failed:', err instanceof Error ? err.stack : err); process.exit(1); });
