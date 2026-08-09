/**
 * engine_bug_queue row for the SEAM M work-bar track alignment defect
 * (founder-proxy Checkpoint B, Ch.6 concept #2, 2026-08-02).
 *
 * ONE row, FIXED. Routed [owner: peter_parker:field3d_surgeon], CRITICAL,
 * blocking. New bug_class — a live SELECT over engine_bug_queue (2026-08-02)
 * found no prior row for it, so this is an INSERT, not a recurrence.
 *
 * Run: npx tsx --env-file=.env.local src/scripts/_seed_engine_bug_queue_nlb_work_bar_track_alignment.ts
 */
import '@/lib/loadEnvLocal';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const SESSION = 'session_2026-08-02_ch6_c2_field3d_surgeon_work_bar_track_alignment';

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
    bug_class: 'nlb_work_bar_tracks_misalign_when_one_caption_wraps_to_more_lines_than_its_neighbours',
    title:
      'SEAM M built the signed work-bar row (#nlb_wk_bars) as display:flex;align-items:flex-end with each slot laid out [track][caption][value] and the caption wrapping by design, so a slot whose force-name caption wrapped to MORE lines than its neighbours was taller and bottom alignment pushed THAT slot\'s track — and the zero baseline drawn at top:50% inside it — up by exactly one line height (measured 15 px = 13 px font x 1.15 line-height at ladder step 0). A fan of signed bars is read by comparing deflections against ONE zero line, so the offset renders as phantom work: 15 px on positive_negative_zero_work STATE_4\'s 180 J scale = 28 J, landing on the normal-force bar whose entire authored claim is that it sits exactly ON zero.',
    severity: 'CRITICAL',
    owner_cluster: 'peter_parker:field3d_surgeon',
    root_cause:
      'FIXED 2026-08-02. The work section of nlbBuildEnergyPanel() reused SEAM L\'s energy-bar row shape (align-items:flex-end), which is correct for the ENERGY bars because their captions are one-line symbols (K, U_grav, ...) so every slot is the same height and flex-end and flex-start coincide. SEAM M then gave the work slots a caption that is a force\'s plain-English NAME and WRAPS on purpose ("by the normal force" cannot fit one 46 px slot on one line), which breaks that coincidence: slot height became a function of caption line count, and with bottom alignment the ONLY thing that could absorb the difference was the position of the track. Two shipped concepts were affected, both on states whose teaching point is a bar-to-bar comparison: positive_negative_zero_work STATE_4/STATE_6 (3-line "by the normal force" vs three 2-line captions, 15 px) and, previously unreported, work_done_by_constant_force STATE_5 (1-line "flat pull" vs 2-line "tilted pull", also 15 px). FIX: the row is align-items:stretch and each work slot is itself a column flex — track flex:0 0 auto (the FIRST child, so every track top is equal by construction), caption flex:1 0 auto (the only growing child, so all slack is absorbed there), value flex:0 0 auto (pinned to the common bottom); nlbApplyWorkSection shows a slot with display:"flex" instead of "block". STRUCTURAL, not measured: no text metric is read, so no font, no ladder step and no future caption can re-break it, and a row whose captions all wrap alike lays out pixel-identically to before. SEAM L\'s energy bars are untouched and stay display:block.',
    prevention_rule:
      'In any multi-slot instrument where a shared reference line (a zero baseline, an axis, a common floor) is drawn INSIDE each slot\'s own track, the tracks must be made collinear STRUCTURALLY — the track is the first child of a stretched column flex, with exactly one growing sibling to absorb every height difference. Never let a wrapping text child sit between the track and the alignment edge, and never fix this by shortening the label: the label is content, the alignment is the instrument\'s contract. Corollary for review: a caption that wraps "by design" is a layout INPUT of unbounded size, so any row containing one must be probed with captions of 1, 2 and 3+ wrapped lines, not just with the captions one concept happens to author.',
    probe_type: 'js_eval',
    probe_logic:
      'For every state that renders more than one work accumulator: read getBoundingClientRect() of each visible #nlb_wk_<i>_t track element and assert (a) every .top is equal to the pixel, (b) every .height is equal, (c) every #nlb_wk_<i>_v value bottom is equal to the pixel. Then repeat against a synthetic newtons_laws_body config whose four work_accumulators carry captions wrapping to 1, 2, 3 and 5 lines in the SAME row, and assert the track tops still match. Reference implementation: src/scripts/_scratch_nlb_wkbar_align_probe.ts (drives the real assembled renderer under a virtual clock; pre-fix it reported a 15 px spread on positive_negative_zero_work STATE_4/STATE_6, a 15 px spread on work_done_by_constant_force STATE_5 and a 59 px spread on the synthetic mixed row; post-fix every spread is 0). THE EYE cannot catch this class on its own: the misalignment is inside a locked baseline, so H2 reports 0.00% while the instrument is wrong.',
    status: 'FIXED',
    concepts_affected: ['positive_negative_zero_work', 'work_done_by_constant_force'],
    fixed_in_files: [
      'src/lib/renderers/field_3d_renderer.ts',
      'src/scripts/_scratch_nlb_wkbar_align_probe.ts',
    ],
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
  return `-- 2026-08-02: SEAM M signed work-bar tracks misaligned when one caption wrapped to more\n` +
    `-- lines than its neighbours (founder-proxy Checkpoint B, Ch.6 concept #2). Generated by\n` +
    `-- src/scripts/_seed_engine_bug_queue_nlb_work_bar_track_alignment.ts — idempotent.\n\n` +
    `INSERT INTO engine_bug_queue (${cols}) VALUES\n${all.map(sqlRow).join(',\n')}\n` +
    `ON CONFLICT (bug_class) DO UPDATE SET status = EXCLUDED.status, root_cause = EXCLUDED.root_cause,\n` +
    `  prevention_rule = EXCLUDED.prevention_rule, probe_logic = EXCLUDED.probe_logic,\n` +
    `  title = EXCLUDED.title, severity = EXCLUDED.severity, owner_cluster = EXCLUDED.owner_cluster,\n` +
    `  concepts_affected = EXCLUDED.concepts_affected, fixed_in_files = EXCLUDED.fixed_in_files,\n` +
    `  fixed_at = CASE WHEN EXCLUDED.status = 'FIXED' THEN now() ELSE engine_bug_queue.fixed_at END;\n`;
}

async function main(): Promise<void> {
  const sqlPath = join(process.cwd(), 'supabase_migrations',
    'supabase_2026-08-02_seed_engine_bug_queue_nlb_work_bar_track_alignment_migration.sql');
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
