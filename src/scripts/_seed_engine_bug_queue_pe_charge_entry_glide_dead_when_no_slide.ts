/**
 * engine_bug_queue row -- pe_charge_entry_glide_dead_when_no_slide, FIXED 2026-07-08.
 *
 * Quality-auditor's closing re-audit of potential_energy_in_external_field found a
 * third bug in field_3d_renderer.ts's shared pe_external_field / dipole engine
 * (same session as dipole_growth_timer_desync and
 * dipole_replay_animations_scenario_type_gap), this time in updatePeChargeFrame()
 * (the CHARGE-phase per-frame driver, STATE_1..STATE_5).
 *
 * ROOT CAUSE (confirmed -- reproduced the boolean logic standalone across
 * ms=0/1/300/1000/2200/3000, and read the frames):
 *   var slideAt = (pc.slide_at_ms != null) ? pc.slide_at_ms : 0;
 *   if (pc.enter_from && ms < slideAt) { ... enter/glide ... }
 *   else if (pc.slide_to && ms >= slideAt) { ... slide ... }
 *   else { window.PM_pefPos[pc.id] = target.slice(); }   // snap straight to rest
 * When a charge authors enter_from + enter_at_ms + enter_dur_ms but NO slide_to /
 * slide_at_ms (STATE_2's qS, STATE_3's qB -- both entry-only, never author a
 * subsequent slide), slideAt defaulted to 0, so `ms < slideAt` reduced to
 * `ms < 0` -- false for every non-negative ms including ms=0. The enter/glide
 * branch was unreachable DEAD CODE for any entry-only charge; every frame fell
 * straight to the else snap-to-target branch. Evidence: STATE_2__dense_t00000
 * through t03000.png were pixel-identical (charge already at rest position from
 * frame 0); same for STATE_3__dense_t00000 vs t02000 (charge qB).
 *
 * FIX: default slideAt to Infinity instead of 0 when slide_at_ms is absent, so
 * an entry-only charge never satisfies `ms >= slideAt` either -- the enter
 * branch stays reachable for its whole enter_dur_ms window, and the slide_to
 * branch (gated on pc.slide_to being truthy anyway) is unaffected for any
 * charge that DOES author a subsequent slide. One-line default-value fix, not a
 * structural rewrite. Confirmed via grep this slideAt/slide_at_ms pattern has
 * exactly one consumer in the whole file (this loop) and slide_to/slide_at_ms
 * are never authored in ANY concept JSON in the repo -- zero risk of another
 * scenario relying on the previous buggy default-to-0 behavior.
 *
 * VERIFIED (re-ran visual:eyes -- potential_energy_in_external_field, read the
 * frames, not just the pass count): STATE_2's qS now renders off-screen at its
 * enter_from [5,3,0] at t=0/1000, visibly in transit at t=2000/3000 (still
 * approaching), settled at its target by ~t=5000 (enter_at_ms 300 + enter_dur_ms
 * 2200 = ~2500ms). STATE_3's qB (q2) is off-screen at t=0, visibly gliding in at
 * t=1000, arrived beside q1 by t=2000 (enter_at_ms 200 + enter_dur_ms 1600 =
 * ~1800ms). Both now show a real multi-frame glide, not an instant snap.
 *
 * Idempotent: upsert onConflict 'bug_class'. Also writes the archival SQL.
 * Run: npx tsx --env-file=.env.local src/scripts/_seed_engine_bug_queue_pe_charge_entry_glide_dead_when_no_slide.ts
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
const CONCEPTS = ['potential_energy_in_external_field'];

const incidents: Row[] = [
  {
    bug_class: 'pe_charge_entry_glide_dead_when_no_slide',
    title: "updatePeChargeFrame's enter/glide branch is unreachable dead code for any charge that authors enter_from but no slide_to -- slideAt defaulted to 0, making `ms < slideAt` false for every non-negative ms, so the charge snapped straight to its rest position from frame 0 instead of gliding in over enter_dur_ms",
    severity: 'MAJOR',
    owner_cluster: 'peter_parker:renderer_primitives',
    root_cause:
      "FIXED 2026-07-08. field_3d_renderer.ts's updatePeChargeFrame() computed `var slideAt = (pc.slide_at_ms != null) ? pc.slide_at_ms : 0;` then gated the enter/glide branch on `pc.enter_from && ms < slideAt`. For an entry-only charge (enter_from + enter_at_ms + enter_dur_ms authored, no slide_to/slide_at_ms -- potential_energy_in_external_field STATE_2's qS and STATE_3's qB), slideAt defaulted to 0, so `ms < slideAt` reduced to `ms < 0` -- false for every non-negative ms including ms=0. The enter branch was unreachable for the charge's entire lifetime; every frame fell to the else snap-to-target branch. Confirmed by reproducing the boolean logic standalone (ms=0/1/300/1000/2200/3000, always false) and by reading THE EYE's frames: STATE_2__dense_t00000 through t03000.png were pixel-identical (already at rest), same for STATE_3's qB.",
    prevention_rule:
      "Any two-phase per-frame animation gated on a shared threshold variable (enter/slide, reveal/hold, etc.) must default that threshold to a value consistent with the FIRST branch remaining reachable when the second phase is not authored -- defaulting a `ms < threshold` gate's threshold to 0 silently makes the first branch dead code for every caller that omits the second phase's own timing field. Default to Infinity (or omit the second branch's gate value entirely) when the second phase is not authored, not to the same value used inside an authored second phase.",
    probe_type: 'js_eval',
    probe_logic:
      "For any pef.charges[] entry (or similar two-phase enter/slide primitive) that authors enter_from + enter_at_ms + enter_dur_ms but no slide_to, run visual:eyes with --dense and read the state's dense frame series: the charge/element must render at a visibly different position between t=0 and t=(enter_at_ms+enter_dur_ms), progressing continuously, NOT already at its final target position from frame 0.",
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
  return `-- 2026-07-08: pe_charge_entry_glide_dead_when_no_slide -- entry-only charges\n` +
    `-- (no slide_to authored) never glided; slideAt default fixed from 0 to Infinity.\n` +
    `-- Generated by\n` +
    `-- src/scripts/_seed_engine_bug_queue_pe_charge_entry_glide_dead_when_no_slide.ts -- idempotent.\n\n` +
    `INSERT INTO engine_bug_queue (${cols}) VALUES\n${all.map(sqlRow).join(',\n')}\n` +
    `ON CONFLICT (bug_class) DO UPDATE SET status = EXCLUDED.status, root_cause = EXCLUDED.root_cause,\n` +
    `  prevention_rule = EXCLUDED.prevention_rule, probe_logic = EXCLUDED.probe_logic,\n` +
    `  title = EXCLUDED.title, severity = EXCLUDED.severity, owner_cluster = EXCLUDED.owner_cluster,\n` +
    `  concepts_affected = EXCLUDED.concepts_affected, fixed_in_files = EXCLUDED.fixed_in_files;\n`;
}

async function main(): Promise<void> {
  const sqlPath = join(process.cwd(), 'supabase_migrations', 'supabase_2026-07-08_seed_engine_bug_queue_pe_charge_entry_glide_dead_when_no_slide_migration.sql');
  writeFileSync(sqlPath, emitSql(incidents), 'utf-8');
  console.log(`Wrote archival SQL: ${sqlPath} (${incidents.length} incident row(s))`);

  const payload = incidents.map((r) => ({
    ...r,
    discovered_in_session: SESSION,
    fixed_at: r.status === 'FIXED' ? new Date().toISOString() : null,
  }));
  const { error } = await supabaseAdmin.from('engine_bug_queue').upsert(payload, { onConflict: 'bug_class' });
  if (error) { console.error(`✗ upsert failed: ${error.message}`); process.exit(1); }
  console.log(`✓ ${incidents.length} pe_charge_entry_glide_dead_when_no_slide row(s) upserted (FIXED)`);
}

main().catch((err) => { console.error('💥 seed failed:', err instanceof Error ? err.stack : err); process.exit(1); });
