/**
 * engine_bug_queue row — dipole_growth_timer_desync, FIXED 2026-07-08.
 *
 * FAIL routed by quality_auditor [owner: peter_parker:renderer_primitives] on
 * potential_energy_in_external_field STATE_5 ("Two qV terms collapse into
 * U = -p.E", pe_external_field scenario, dipole phase). THE EYE's dense-frame
 * capture showed all 16 dense frames (t=0..15000ms) pixel-identical: the
 * p-vector (moment arrow) was ALREADY fully grown from frame 0, even though
 * STATE_5 declares p_animate_in:true (a 0-900ms draw-in).
 *
 * ROOT CAUSE (confirmed by reading the real SET_STATE/RESET_TRAJECTORY code
 * path, not just the debug-only messages) — CAPTURE-HARNESS-ONLY, never
 * live-blocking:
 *   - applyDipoleInFieldState() stamped lg.userData.pGrowStartTime /
 *     .fieldGrowStartTime as ABSOLUTE `time` values at state entry (field_3d_
 *     renderer.ts ~13817/13821 pre-fix). The growth ramp read
 *     (time - pGrowStartTime) / 0.9.
 *   - THE EYE's screenshotter, for accumulator-free scenario types (incl.
 *     pe_external_field, gated at the animate() loop ~line 31862), SNAPS
 *     `time` straight to the primary/frozen capture's reveal-target ms (so the
 *     settled frame is guaranteed even under headless rAF throttling). It
 *     THEN sends RESET_TRAJECTORY before the dense series, which rebases
 *     ONLY `stateStartTime` (= time at that already-advanced moment) — it
 *     never re-stamped pGrowStartTime/fieldGrowStartTime. So the dense
 *     series' own "t=0" landed on a clock already ~2.4s past the stale
 *     pGrowStartTime, and since the growth ramp SATURATES at 1 after 0.9s,
 *     every dense frame read as already-grown.
 *   - Verified this NEVER reaches real students: build_review_site.ts (the
 *     real SET_STATE/postMessage path) never snaps `time` forward — it only
 *     ever crawls (`time += 0.016`/frame) or holds at the CURRENT position
 *     (SET_TIME_FREEZE at_ms: readSimTimeMs() / at_ms:0 immediately at
 *     entry, both no-op snaps to "now"). rollTimeline()'s RESET_TRAJECTORY
 *     (400ms after SET_STATE, or on Play-click) only ever rebases
 *     stateStartTime to a `time` that has moved forward by genuine elapsed
 *     wall-clock, never by an artificial jump — so the absolute pGrowStartTime
 *     stamp stayed valid in every real-serving code path. Confirmed capture-
 *     harness-only; still fixed because it defeated THE EYE's D5/D6/D7
 *     dense-motion regression gate for this whole reveal shape.
 *
 * FIX (preferred option (b) from the routing note — rewrite as a pure
 * function of (time - stateStartTime), the same pattern every other reveal
 * in this file already uses, e.g. updatePeExternalFieldFrame's ramp()):
 * replaced the two absolute stamps with boolean gates (pAnimateIn,
 * fieldAnimateIn); the frame loop now computes elapsed via
 * (time - stateStartTime), which RESET_TRAJECTORY DOES rebase. This
 * permanently closes the bug class without touching the RESET_TRAJECTORY
 * handler at all. rotation_start_time was DELIBERATELY left untouched (out
 * of scope) — it has a legitimate mid-state re-stamp caller (the
 * physics_release trusted theta-slider-release handler), so a blanket
 * pure-function rewrite there needs its own separately-scoped pass.
 *
 * BLAST RADIUS (grep, not fixed separately — same shared engine function,
 * so this ONE fix already covers them):
 *   - electric_dipole_in_field.json (scenario_type dipole_in_uniform_field):
 *     STATE_1 p_animate_in:true, STATE_2 e_field_animate_in:true.
 *   - bar_magnet_in_uniform_field.json (scenario_type
 *     bar_magnet_in_uniform_field): same two flags, analogous states.
 *   - STATE_6 (damped_pendulum) and STATE_7 (explore/idle_sway) of THIS
 *     concept share rotation_start_time (untouched) for their motion; both
 *     re-verified post-fix via visual:eyes + frame reads — D7 clean, real
 *     motion progression confirmed by eye (STATE_6 swings 71deg -> ~0deg
 *     across the dense series; STATE_7 sways 55-65deg). NOTE: rotation_
 *     start_time carries the SAME latent RESET_TRAJECTORY-staleness (it is
 *     also never rebased), visible as STATE_6's dense "t=0" already reading
 *     ~71deg rather than the state's true initial 178deg — but because
 *     damped-pendulum decay is a continuous (non-saturating) function rather
 *     than a 0-1 growth ramp that clips, this reads as ongoing motion (D6/D7
 *     pass) rather than a frozen plateau, so it was NOT part of this fix's
 *     scope. Flagged here as a candidate for a follow-up, separately-scoped
 *     pass (would need to account for the physics_release re-trigger path).
 *
 * Idempotent: upsert onConflict 'bug_class'. Also writes the archival SQL.
 * Run: npx tsx --env-file=.env.local src/scripts/_seed_engine_bug_queue_dipole_growth_timer_desync.ts
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
const CONCEPTS = [
  'potential_energy_in_external_field',
  'electric_dipole_in_field',
  'bar_magnet_in_uniform_field',
];

const incidents: Row[] = [
  {
    bug_class: 'dipole_growth_timer_desync',
    title: "Dipole-engine one-shot growth stamps (p-vector draw-in / field switch-on) are ABSOLUTE time stamps invisible to RESET_TRAJECTORY, so THE EYE's dense-series capture (which rebases stateStartTime AFTER the primary reveal-target capture has already snapped time forward) reads every dense frame as already-grown from t=0",
    severity: 'MAJOR',
    owner_cluster: 'peter_parker:renderer_primitives',
    root_cause:
      "FIXED 2026-07-08. applyDipoleInFieldState() stamped lg.userData.pGrowStartTime / .fieldGrowStartTime as `time` (absolute, at state entry). The p-arrow / field-fade ramps then read (time - stamp)/duration. THE EYE's primary/frozen capture SNAPS `time` forward to the reveal-target ms for accumulator-free scenario types (incl. pe_external_field, gated in the animate() loop). It then sends RESET_TRAJECTORY before the dense series, which rebases ONLY stateStartTime (never these per-object stamps) -- so the dense series' own t=0 landed on a clock already ~2.4s past the stale stamp, and since the growth ramp saturates at 1 after 0.9s, every dense frame (t=0..15000ms) read as already-grown (STATE_5's p-arrow: 16/16 frames pixel-identical). CONFIRMED capture-harness-only via reading the real SET_STATE/postMessage path (build_review_site.ts): production never snaps time forward past where growth naturally reached -- it only crawls or holds at the current position -- so real students never saw a dead already-grown dipole.",
    prevention_rule:
      'Any one-shot reveal/growth timer in field_3d_renderer.ts (the dipole engine or any future scenario) must be a pure function of (time - stateStartTime), NEVER a separately-stamped absolute `time` value UNLESS that stamp has a genuine mid-state re-trigger caller (e.g. physics_release) that stateStartTime cannot represent. RESET_TRAJECTORY only ever rebases stateStartTime -- any timer that does not derive from it will desync the moment a primary/frozen capture (or any future forward time-snap) advances the clock before the timer\'s own reveal window is captured.',
    probe_type: 'js_eval',
    probe_logic:
      "For a concept using p_animate_in or e_field_animate_in (grep src/data/concepts for these keys; applyDipoleInFieldState consumers), run visual:eyes with --dense and read the dense frame series for the state that declares the flag: the growth/fade must show visible progression between t=0 and its declared duration (e.g. p-arrow: near-zero length at t=0, full length by ~t=1000ms), NOT already-final at t=0. A state where ALL dense frames are pixel-identical AND the state declares a *_animate_in flag is this bug class.",
    status: 'FIXED',
    concepts_affected: CONCEPTS,
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
  return `-- 2026-07-08: dipole_growth_timer_desync -- THE EYE dense-capture-only\n` +
    `-- growth-timer staleness in the shared dipole engine (pe_external_field STATE_5),\n` +
    `-- FIXED by rewriting pGrowStartTime/fieldGrowStartTime as pure functions of\n` +
    `-- (time - stateStartTime). Generated by\n` +
    `-- src/scripts/_seed_engine_bug_queue_dipole_growth_timer_desync.ts -- idempotent.\n\n` +
    `INSERT INTO engine_bug_queue (${cols}) VALUES\n${all.map(sqlRow).join(',\n')}\n` +
    `ON CONFLICT (bug_class) DO UPDATE SET status = EXCLUDED.status, root_cause = EXCLUDED.root_cause,\n` +
    `  prevention_rule = EXCLUDED.prevention_rule, probe_logic = EXCLUDED.probe_logic,\n` +
    `  title = EXCLUDED.title, severity = EXCLUDED.severity, owner_cluster = EXCLUDED.owner_cluster,\n` +
    `  concepts_affected = EXCLUDED.concepts_affected, fixed_in_files = EXCLUDED.fixed_in_files;\n`;
}

async function main(): Promise<void> {
  const sqlPath = join(process.cwd(), 'supabase_migrations', 'supabase_2026-07-08_seed_engine_bug_queue_dipole_growth_timer_desync_migration.sql');
  writeFileSync(sqlPath, emitSql(incidents), 'utf-8');
  console.log(`Wrote archival SQL: ${sqlPath} (${incidents.length} incident row(s))`);

  const payload = incidents.map((r) => ({
    ...r,
    discovered_in_session: SESSION,
    fixed_at: r.status === 'FIXED' ? new Date().toISOString() : null,
  }));
  const { error } = await supabaseAdmin.from('engine_bug_queue').upsert(payload, { onConflict: 'bug_class' });
  if (error) { console.error(`✗ upsert failed: ${error.message}`); process.exit(1); }
  console.log(`✓ ${incidents.length} dipole_growth_timer_desync row(s) upserted (FIXED)`);
}

main().catch((err) => { console.error('💥 seed failed:', err instanceof Error ? err.stack : err); process.exit(1); });
