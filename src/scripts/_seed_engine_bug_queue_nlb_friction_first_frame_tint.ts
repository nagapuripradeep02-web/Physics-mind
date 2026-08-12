/**
 * engine_bug_queue row — the friction vector's FIRST-FRAME reveal tint bypasses the SEAM Q
 * backdrop-relative ink floor (eye-walker, final frame-walk of Ch.6 concept #2, 2026-08-02).
 *
 * ONE row, OPEN, MODERATE. Zero CURRENT visible impact — masked by geometry, see root_cause —
 * but it is a latent recurrence of the exact defect the founder reported twice, so it is filed
 * rather than dropped. Not routed: a fix would be a third engine commit on this branch for a
 * defect no shipped concept can currently display.
 *
 * Run: npx tsx --env-file=.env.local src/scripts/_seed_engine_bug_queue_nlb_friction_first_frame_tint.ts
 */
import '@/lib/loadEnvLocal';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const SESSION = 'session_2026-08-02_ch6_c2_eyewalker_final_walk';

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
    bug_class: 'nlb_friction_vector_first_frame_reveal_tint_bypasses_seam_q_ink_fix',
    title: 'The friction vector renders a pale first-frame reveal tint that never goes through the SEAM Q backdrop-relative ink floor, so t=0 fails the contrast floor the settled colour passes',
    severity: 'MODERATE',
    owner_cluster: 'peter_parker:field3d_surgeon',
    root_cause:
      'SEAM Q (commit b164f4a) routes newtons_laws_body arrow/arc/label ink through nlbInkPass, which deepens over the slab and lifts over the page. Measured on positive_negative_zero_work run 20260802-150655, the friction vector takes that treatment only from t>=1000 ms: at t=0 the shaft renders rgb(249,191,210) and its label rgb(180,138,157) - a pale pink measuring 1.87:1 (shaft) and 1.02:1 (label) against a lit slab at rgb(129,155,168) - then settles to the fixed dark-maroon rgb(34,14,21) at 6.30:1 for every subsequent frame. The tint is specific to the FRICTION vector: the applied-force arrow sampled at t=0 and t>=1000 on STATE_1 is byte-identical rgb(172,218,174) both times, so the first-frame path is not shared by all vectors. ZERO CURRENT VISIBLE IMPACT, and this was verified rather than assumed: every state of both shipped work-energy concepts seeds its crate at the slab left edge (initial_position_m = -5.4 against length_m = 6), so a friction arrow drawn further left lands entirely on the black page background at t=0, where the pale pink measures 6.6-12.5:1 and reads fine. The masking is geometric, not luck - a future concept whose home pose puts the body mid-slab reproduces the exact legibility failure the founder reported twice, for one frame.',
    prevention_rule:
      'A vector\'s transient or first-frame reveal colour must independently clear the same backdrop-relative contrast floor (3:1 graphical, 4.5:1 text) as its settled steady-state colour. Sample and assert at t=0, not only at t>=1s: an ink pass that runs on the update path but not the build/reveal path leaves a one-frame hole that no frozen-frame gate can see, because the frozen pin is never at t=0. When an ink floor is introduced, enumerate every code path that writes that element\'s colour - build, update, reveal, glow-restore - and assert the floor on all of them, not just the one that produced the reported symptom.',
    probe_type: 'js_eval',
    probe_logic:
      'For every newtons_laws_body state rendering a friction arrow: capture the arrow shaft and label pixel colour at t=0 AND at t=1000 ms, resolve each against its LOCAL backdrop (raycast the slab mesh at the element ink anchor; page otherwise), and assert both instants clear 3:1 for the stroke and 4.5:1 for the label. FAIL when the two instants differ in measured contrast class. Independently, temporarily seed a body at initial_position_m = 0 (mid-slab) and assert the t=0 friction arrow still clears the floor - that is the configuration the current fleet geometry masks.',
    status: 'OPEN',
    concepts_affected: ['positive_negative_zero_work', 'work_done_by_constant_force', 'friction_force', 'block_on_incline', 'rolling_friction'],
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
  return `-- 2026-08-02: friction vector first-frame reveal tint bypasses the SEAM Q ink floor\n` +
    `-- (eye-walker final walk, Ch.6 concept #2). Generated by\n` +
    `-- src/scripts/_seed_engine_bug_queue_nlb_friction_first_frame_tint.ts — idempotent.\n\n` +
    `INSERT INTO engine_bug_queue (${cols}) VALUES\n${all.map(sqlRow).join(',\n')}\n` +
    `ON CONFLICT (bug_class) DO UPDATE SET status = EXCLUDED.status, root_cause = EXCLUDED.root_cause,\n` +
    `  prevention_rule = EXCLUDED.prevention_rule, probe_logic = EXCLUDED.probe_logic,\n` +
    `  title = EXCLUDED.title, severity = EXCLUDED.severity, owner_cluster = EXCLUDED.owner_cluster,\n` +
    `  concepts_affected = EXCLUDED.concepts_affected, fixed_in_files = EXCLUDED.fixed_in_files,\n` +
    `  fixed_at = CASE WHEN EXCLUDED.status = 'FIXED' THEN now() ELSE engine_bug_queue.fixed_at END;\n`;
}

async function main(): Promise<void> {
  const sqlPath = join(process.cwd(), 'supabase_migrations',
    'supabase_2026-08-02_seed_engine_bug_queue_nlb_friction_first_frame_tint_migration.sql');
  writeFileSync(sqlPath, emitSql(rows), 'utf-8');
  console.log(`Wrote archival SQL: ${sqlPath} (${rows.length} row(s))`);

  const payload = rows.map((r) => ({
    ...r,
    discovered_in_session: SESSION,
    fixed_at: r.status === 'FIXED' ? new Date().toISOString() : null,
  }));
  const { error } = await supabaseAdmin.from('engine_bug_queue').upsert(payload, { onConflict: 'bug_class' });
  if (error) { console.error(`✗ upsert failed: ${error.message}`); process.exit(1); }
  console.log(`✓ ${rows.length} row(s) upserted (OPEN)`);
}

main().catch((err) => { console.error('💥 seed failed:', err instanceof Error ? err.stack : err); process.exit(1); });
