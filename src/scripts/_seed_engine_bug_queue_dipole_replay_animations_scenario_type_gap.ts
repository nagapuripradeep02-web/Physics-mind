/**
 * engine_bug_queue row — dipole_replay_animations_scenario_type_gap, FIXED 2026-07-08.
 *
 * Quality-auditor found a third instance of the dipole_growth_timer_desync bug
 * family in a different write-site: the REPLAY_ANIMATIONS postMessage handler
 * (field_3d_renderer.ts, case "REPLAY_ANIMATIONS") re-stamps rotation_start_time
 * on the shared torque-loop group, but was gated by an ENUMERATED scenario_type
 * allowlist:
 *   if (config.scenario_type === "torque_on_loop_uniform_field" ||
 *       config.scenario_type === "dipole_in_uniform_field") { ... }
 * `pe_external_field` (potential_energy_in_external_field's dipole phase,
 * STATE_6 damped_pendulum) and `bar_magnet_in_uniform_field` both route through
 * the SAME shared findTorqueLoopGroup()/applyDipoleInFieldState() engine but
 * were NOT in the list, so REPLAY_ANIMATIONS was a no-op for them.
 *
 * ROOT CAUSE (confirmed by reading field_3d_renderer.ts directly):
 *   - rotation_start_time is stamped once at true state entry
 *     (applyDipoleInFieldState, ~line 13746) and is the reference point every
 *     rotation_mode (oscillation / theta_sweep / damped_swing / damped_pendulum
 *     / idle_sway) computes elapsed against.
 *   - RESET_TRAJECTORY only ever rebases stateStartTime, never rotation_start_time
 *     (same class as dipole_growth_timer_desync).
 *   - Production's rollTimeline() (build_review_site.ts, the real teacher-facing
 *     Play/replay path) ALWAYS sends RESET_TRAJECTORY immediately followed by
 *     REPLAY_ANIMATIONS — the latter is what re-stamps rotation_start_time (and
 *     resets theta to rotation_init_theta_deg) to compensate for the former.
 *     Because pe_external_field / bar_magnet_in_uniform_field were missing from
 *     REPLAY_ANIMATIONS's allowlist, clicking Play again after a state finished
 *     (a real, narrow production gesture) would show a stale mid-swing angle
 *     instead of restarting the rotation cleanly for THOSE two concepts.
 *   - THE EYE's screenshotter.ts never sent REPLAY_ANIMATIONS at all (only
 *     RESET_TRAJECTORY), so its dense-series "t=0" and its frozen-frame capture
 *     for potential_energy_in_external_field STATE_6 (damped_pendulum) showed a
 *     stale mid-swing angle (dense t=0: theta=62deg instead of the authored
 *     initial 178deg; frozen frame: fully-settled theta=0deg end-pose instead of
 *     a representative in-transit moment) — the canonical reviewer evidence
 *     frame for the state whose whole teaching point is confronting "aligned =
 *     max energy, both zero-torque poses equally stable" was showing the WRONG
 *     moment in that arc.
 *
 * FIX (two parts, per quality-auditor's "generic, not allowlist" recommendation):
 *   1. field_3d_renderer.ts REPLAY_ANIMATIONS handler: replaced the scenario_type
 *      allowlist with a generic `if (lgR)` check on findTorqueLoopGroup() — any
 *      scenario that builds the shared torque-loop group is covered by
 *      construction, closing this specific allowlist gap AND any future one.
 *   2. screenshotter.ts (THE EYE): paired a REPLAY_ANIMATIONS send immediately
 *      after every RESET_TRAJECTORY send (primary reveal-target capture, the
 *      pre-dense-series reset, captureDenseSeries's own reset, and
 *      captureFrozenFrame) — mirroring production's rollTimeline() convention,
 *      which the harness had never replicated. This was necessary in addition
 *      to (1) because THE EYE never sent REPLAY_ANIMATIONS at all; fixing only
 *      the renderer's allowlist does not change THE EYE's own output.
 *   NOTE: the renderer's RESET_TRAJECTORY handler itself was deliberately left
 *   untouched (would risk unconditionally clobbering an in-progress trusted
 *   theta-slider physics_release swing on a live teacher's explore-state
 *   interaction — currently wired for electric_dipole_in_field only). The
 *   REPLAY_ANIMATIONS generic-check + harness pairing achieves the same
 *   correctness without that risk.
 *
 * VERIFIED (re-ran visual:eyes -- potential_energy_in_external_field, read the
 * frames, not just the pass count): STATE_6 dense t=0 now reads theta=178deg
 * (the authored initial anti-aligned pose, matching U_max); the dense series
 * shows the full lingers-near-178-then-swings-through-90-then-settles-at-0 arc;
 * the frozen frame (reveal-target ~2400ms) now shows theta=83deg (in transit),
 * not the previous fully-settled theta=0deg. Spot-checked bar_magnet_in_uniform_field
 * (STATE_4/5/7 oscillation + theta_sweep modes, none using physics_release —
 * confirmed via grep, only electric_dipole_in_field enables that flag) for
 * regression.
 *
 * Idempotent: upsert onConflict 'bug_class'. Also writes the archival SQL.
 * Run: npx tsx --env-file=.env.local src/scripts/_seed_engine_bug_queue_dipole_replay_animations_scenario_type_gap.ts
 */
import '@/lib/loadEnvLocal';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const SESSION = 'session_2026-07-08_pe_external_field_state5_growth_timer_desync';

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

const RENDERER = 'src/lib/renderers/field_3d_renderer.ts';
const SCREENSHOTTER = 'src/lib/validators/visual/screenshotter.ts';
const CONCEPTS = [
  'potential_energy_in_external_field',
  'bar_magnet_in_uniform_field',
];

const incidents: Row[] = [
  {
    bug_class: 'dipole_replay_animations_scenario_type_gap',
    title: "REPLAY_ANIMATIONS re-stamps rotation_start_time on the shared torque-loop group but was gated by an enumerated scenario_type allowlist that omitted pe_external_field and bar_magnet_in_uniform_field, even though both share the same findTorqueLoopGroup()/applyDipoleInFieldState() engine as the two scenario_types that WERE covered",
    severity: 'MODERATE',
    owner_cluster: 'peter_parker:renderer_primitives',
    root_cause:
      "FIXED 2026-07-08. REPLAY_ANIMATIONS's handler in field_3d_renderer.ts gated its rotation_start_time re-stamp on `config.scenario_type === 'torque_on_loop_uniform_field' || config.scenario_type === 'dipole_in_uniform_field'`, silently excluding pe_external_field and bar_magnet_in_uniform_field despite both routing through the identical shared engine (findTorqueLoopGroup() returns the same torque_loop_group element regardless of scenario_type). Confirmed manifestation: potential_energy_in_external_field STATE_6 (damped_pendulum) -- rotation_start_time stamped once at true state entry, never re-stamped when RESET_TRAJECTORY rebases stateStartTime -- same absolute-stamp desync class as dipole_growth_timer_desync. THE EYE's dense t=0 read theta=62deg instead of the authored initial 178deg, and the frozen-frame evidence (the canonical reviewer screenshot) showed the fully-settled theta=0deg end-pose instead of a representative in-transit moment, for a state whose entire teaching point is confronting 'aligned=max energy, both zero-torque poses equally stable' by visibly starting anti-aligned then releasing. A real (narrow) production path was also confirmed: clicking Play again after a state finishes calls rollTimeline() -> RESET_TRAJECTORY + REPLAY_ANIMATIONS, so this scenario_type gap could show real students a stale mid-swing angle on that specific replay gesture for these two concepts.",
    prevention_rule:
      "Any postMessage handler in field_3d_renderer.ts that operates on the shared torque-loop group (findTorqueLoopGroup()) must gate on the presence of that group (if (lgR)), NEVER on an enumerated scenario_type allowlist -- the group is built identically by every scenario reusing the dipole/torque engine, and a list will always go stale the next time a new scenario_type reuses the same engine. Additionally, any test harness (THE EYE / screenshotter.ts) that sends RESET_TRAJECTORY to force a clean state-local clock must pair it with REPLAY_ANIMATIONS immediately after, mirroring production's rollTimeline() convention -- RESET_TRAJECTORY alone does not rebase any one-shot rotation timer.",
    probe_type: 'js_eval',
    probe_logic:
      "For any concept whose field_3d_config scenario builds the shared torque-loop group (rotation_mode present in a pef/extras block), run visual:eyes with --dense and read STATE_N's dense_t00000 frame: theta must match the state's authored initial theta_deg (or its rotation_init_theta_deg), NOT an already-progressed value. Also read the frozen-frame evidence file for any state with a damped_pendulum/oscillation/theta_sweep rotation_mode: it must not show the fully-settled/limit-cycle end-pose as if it were a fresh mid-arc sample UNLESS the reveal-target ms genuinely implies full settlement.",
    status: 'FIXED',
    concepts_affected: CONCEPTS,
    fixed_in_files: [RENDERER, SCREENSHOTTER],
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
  return `-- 2026-07-08: dipole_replay_animations_scenario_type_gap -- REPLAY_ANIMATIONS\n` +
    `-- enumerated scenario_type allowlist replaced with a generic shared-group check,\n` +
    `-- + THE EYE's screenshotter.ts now pairs REPLAY_ANIMATIONS with every\n` +
    `-- RESET_TRAJECTORY it sends. Generated by\n` +
    `-- src/scripts/_seed_engine_bug_queue_dipole_replay_animations_scenario_type_gap.ts -- idempotent.\n\n` +
    `INSERT INTO engine_bug_queue (${cols}) VALUES\n${all.map(sqlRow).join(',\n')}\n` +
    `ON CONFLICT (bug_class) DO UPDATE SET status = EXCLUDED.status, root_cause = EXCLUDED.root_cause,\n` +
    `  prevention_rule = EXCLUDED.prevention_rule, probe_logic = EXCLUDED.probe_logic,\n` +
    `  title = EXCLUDED.title, severity = EXCLUDED.severity, owner_cluster = EXCLUDED.owner_cluster,\n` +
    `  concepts_affected = EXCLUDED.concepts_affected, fixed_in_files = EXCLUDED.fixed_in_files;\n`;
}

async function main(): Promise<void> {
  const sqlPath = join(process.cwd(), 'supabase_migrations', 'supabase_2026-07-08_seed_engine_bug_queue_dipole_replay_animations_scenario_type_gap_migration.sql');
  writeFileSync(sqlPath, emitSql(incidents), 'utf-8');
  console.log(`Wrote archival SQL: ${sqlPath} (${incidents.length} incident row(s))`);

  const payload = incidents.map((r) => ({
    ...r,
    discovered_in_session: SESSION,
    fixed_at: r.status === 'FIXED' ? new Date().toISOString() : null,
  }));
  const { error } = await supabaseAdmin.from('engine_bug_queue').upsert(payload, { onConflict: 'bug_class' });
  if (error) { console.error(`✗ upsert failed: ${error.message}`); process.exit(1); }
  console.log(`✓ ${incidents.length} dipole_replay_animations_scenario_type_gap row(s) upserted (FIXED)`);
}

main().catch((err) => { console.error('💥 seed failed:', err instanceof Error ? err.stack : err); process.exit(1); });
