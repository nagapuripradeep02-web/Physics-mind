/**
 * engine_bug_queue rows for the two Rule-31 readiness gaps in
 * torque_on_current_loop_in_field, surfaced 2026-07-05 when the Socratic->Rule-31
 * narration retrofit (retrofit_surgeon, JSON-only) landed but THE EYE + the surgeon's
 * escalation showed the torque_on_loop_uniform_field scenario is not yet Rule-31-ready.
 *
 * The hard D7 blocker (STATE_9 motion death) was fixed same session (renderer_primitives)
 * and is EYE-clean (46/46). These two rows track the REMAINING gaps for a dedicated
 * Rule-31 rebuild pass (founder-deferred, not a rushed bolt-on): per-state contextual
 * controls + non-static early states. The concept is committed as a narration checkpoint,
 * NOT shipped.
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
      `Surfaced by retrofit_surgeon 2026-07-05 (Socratic->Rule-31 narration retrofit, JSON-only). The scenario's #torque_sliders panel is one div of four bare label+input pairs (N/I/B/theta) with NO row-wrapper ids, and the per-frame gate is stateDef.show_sliders && isTorque (${RENDERER} ~L27748) with NO applyVisibleControls({...}, stateDef.visible_controls) call — unlike force_on_current_wire (~L27657), magnetic_field_circular_loop (~L11391), faraday (~L27044) which DO wrap rows + call applyVisibleControls. So Rule-31c (each guided state exposes ONLY its relevant slider(s)) is not implementable today; only STATE_11 (explore) shows the panel — the OLD last-state-only pattern. Retrofit_surgeon correctly did NOT fake it with an inert JSON visible_controls field. TWO-PART FIX for the rebuild pass: (a) renderer_primitives adds row-wrapper ids (tor_n_row/tor_i_row/tor_b_row/tor_theta_row) inside #torque_sliders + an applyVisibleControls call in the torqueSlidersEl branch, mirroring force_on_current_wire; (b) json_author adds per-state visible_controls declarations to the guided states (e.g. STATE_5 = N,I).`,
    prevention_rule:
      'A field_3d scenario used by a Rule-31 concept must support per-state contextual controls (row-wrapper ids + applyVisibleControls reading stateDef.visible_controls) BEFORE the concept is authored/retrofitted to Rule 31 — a Socratic->straightforward narration retrofit alone does not make a concept Rule-31-compliant if its scenario is control-incapable.',
    probe_type: 'manual',
    probe_logic:
      'For torque_on_current_loop_in_field, confirm each guided state exposes only its relevant slider row(s) and the explore state exposes all. If the panel is all-or-nothing (only the explore state shows any slider), Rule-31c is unmet.',
    status: 'OPEN',
    concepts_affected: [CONCEPT],
    fixed_in_files: [],
    row_type: 'incident',
  },
  {
    bug_class: 'torque_static_early_states',
    title: 'torque_on_current_loop_in_field STATE_1/2/3 are rotation_mode "static" (zero motion) — violates Rule 31b "no static state; every state alive with distinct motion"',
    severity: 'MODERATE',
    owner_cluster: 'ambiguous',
    root_cause:
      `Surfaced 2026-07-05 during the Socratic->Rule-31 retrofit (out of scope for that JSON-only narration delta; noted, not fixed). STATE_1 (geometry setup), STATE_2 (F on left side), STATE_3 (F on right side, sum F=0) are authored rotation_mode: "static" — they present a still picture while the narration plays, which Rule 31b forbids (every state must earn its place with distinct motion — a watch-this beat still needs auto-playing choreography, motion and interactivity being separate axes). This is a DESIGN decision (what motion each early beat should show — e.g. the force vectors animating in, or a gentle idle rotation), so it is owner-ambiguous pending founder/architect direction, then renderer_primitives to implement. Part of the deferred torque Rule-31 rebuild pass, alongside torque_scenario_no_contextual_controls.`,
    prevention_rule:
      'Every guided state (including setup / watch-this beats) must show distinct auto-playing motion (Rule 31b) — a rotation_mode "static" state is a design smell to resolve at author time, not ship.',
    probe_type: 'manual',
    probe_logic:
      'For each guided state, THE EYE motion profile (D-checks) must show sustained above-floor adjacent-frame motion; a state that is flat for its whole duration is a static-state violation.',
    status: 'OPEN',
    concepts_affected: [CONCEPT],
    fixed_in_files: [],
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
  console.log(`✓ ${incidents.length} torque Rule-31 gap row(s) upserted (both OPEN, deferred rebuild pass)`);
}

main().catch((err) => { console.error('💥 seed failed:', err instanceof Error ? err.stack : err); process.exit(1); });
