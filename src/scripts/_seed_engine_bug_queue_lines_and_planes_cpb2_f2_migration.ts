/**
 * engine_bug_queue — `lines_and_planes_in_space` Checkpoint B cycle 2, finding F2, 2026-08-21.
 *
 * ONE new row: the λ-marker label field the F2 routing note asked json-author to
 * wire ("use the engine's own field rather than a parallel object") turns out to
 * be HALF-WIRED — the consumer reads it, the producer never writes it.
 *
 * field_3d_renderer.ts ~14713 (the vg_lp_point pool builder) reads
 * `res.lines[li].lambda_label` to label the injected `<lineId>_lambda` marker
 * point. But `res.lines[li]` IS the `rec` object built by the F11 lines loop
 * (~13204-13239), and that object literal never assigns `rec.lambda_label` from
 * the authored line's `o.lambda_label` — not inside the `show_lambda_marker`
 * block, not anywhere else in the loop. So a line authored with
 * `lambda_label: "r"` renders the marker with `label: null` — visually
 * identical to a line with no `lambda_label` at all.
 *
 * This was found INSTEAD of doing the requested fix: json-author authored
 * `lambda_label: "r"` forward-compatibly on STATE_1 and STATE_9's L1 (this
 * concept's r = a + λd states) and confirmed via static source read (not
 * inference) that it does not yet reach the screen. The one-line fix is
 * `rec.lambda_label = o.lambda_label || null;` inside the F11 lines loop's
 * `if (o.show_lambda_marker === true) { ... }` block, mirroring exactly how the
 * point loop already threads through `role`/`label` for ordinary points.
 *
 * Run: npx tsx --env-file=.env.local src/scripts/_seed_engine_bug_queue_lines_and_planes_cpb2_f2_migration.ts
 */
import '@/lib/loadEnvLocal';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const SESSION = 'session_2026-08-21_lines_and_planes_cpb2_f2';

type Owner =
  | 'alex:architect' | 'alex:physics_author' | 'alex:json_author' | 'alex:mathematics_author'
  | 'peter_parker:field3d_surgeon' | 'peter_parker:renderer_primitives' | 'peter_parker:runtime_generation'
  | 'peter_parker:visual_validator' | 'ambiguous';
type Severity = 'CRITICAL' | 'MAJOR' | 'MODERATE';
type Status = 'OPEN' | 'FIXED' | 'DEFERRED' | 'NOT_REPRODUCING' | 'FALSE_POSITIVE';
type ProbeType = 'sql' | 'js_eval' | 'manual' | 'vision_model';
type RowType = 'incident' | 'probe_definition' | 'directive';

interface Row {
  bug_class: string; title: string; severity: Severity; owner_cluster: Owner;
  root_cause: string; prevention_rule: string; probe_type: ProbeType; probe_logic: string;
  status: Status; concepts_affected: string[]; fixed_in_files: string[]; row_type: RowType;
}

const R = 'src/lib/renderers/field_3d_renderer.ts';
const PROTECTED = ['FIXED', 'FALSE_POSITIVE'];

const rows: Row[] = [
  {
    bug_class: 'vg_lambda_marker_label_field_read_by_consumer_never_written_by_producer',
    title: 'lambda_label is read by the point-collection pass and never assigned by the line-resolution pass, so an authored λ-marker label is a silent no-op',
    severity: 'MODERATE', owner_cluster: 'peter_parker:field3d_surgeon',
    root_cause:
      'field_3d_renderer.ts ~14713 pushes {id: L.id + "_lambda", ..., label: res.lines[li].lambda_label || null, ...} into the points pool that draws every vg_lp_point marker, including the injected λ-marker on a line authored with show_lambda_marker: true. res.lines[li] IS the rec object the F11 lines loop (~13204-13239) builds and pushes into out.lines — and that object literal only ever sets id, anchor, dir, lo, hi, p0, p1, frac, ghost, role, label (the LINE\'s own end-label, a different mesh pool), show_dir_arrow, lambda_point, lambda_in_span, and (inside the show_lambda_marker block) lambda. rec.lambda_label is never assigned from o.lambda_label anywhere in the loop. Net effect: authoring lambda_label on a vg line has ZERO visual effect — the marker always renders with label null, indistinguishable from a line that never declared the field. Found while executing a founder-proxy F2 routing item ("the λ marker already IS r ... use the engine\'s own field rather than a parallel object") on lines_and_planes_in_space STATE_1 and STATE_9: lambda_label: "r" was authored on both states\' L1 and, on static source read of both the producer and the consumer sites, confirmed to be currently inert rather than assumed to work.',
    prevention_rule:
      'A field a CONSUMER reads off a resolved record is a field the PRODUCER of that record must assign — grep the producing loop for the exact assignment before trusting a downstream reader. Where a scenario derives one addressable object (a line) into a second addressable object (its injected lambda marker point), every authorable field the second object\'s consumer expects (label here) is threaded through explicitly at the point of derivation, in the SAME review as the field the derived object already carries (lambda_point, lambda_in_span). A field that is read downstream but never written upstream is not "unsupported" in the sense an author can discover by reading the schema (Zod passthrough accepts it silently) — it is a trap that looks authored and renders as if it were not.',
    probe_type: 'js_eval',
    probe_logic:
      'Author a vg line with show_lambda_marker: true and lambda_label: "<token>" inside its drawn span; resolve the frame and assert the injected "<lineId>_lambda" point in out.points (or the equivalent post-collection pts array) carries label === "<token>", not null. Negative control: the pre-fix resolver must FAIL this assertion (label resolves to null) even though lambda_label is present, verbatim, on the authored line object.',
    status: 'OPEN',
    concepts_affected: ['lines_and_planes_in_space'],
    fixed_in_files: [R],
    row_type: 'incident',
  },
];

function sqlStr(s: string): string { return `'${s.replace(/'/g, "''")}'`; }
function sqlArr(a: string[]): string { return a.length ? `ARRAY[${a.map(sqlStr).join(', ')}]::text[]` : `ARRAY[]::text[]`; }
function sqlRow(r: Row): string {
  return `(${sqlStr(r.bug_class)}, ${sqlStr(r.title)}, ${sqlStr(r.severity)}, ${sqlStr(r.owner_cluster)}, ` +
    `${sqlStr(r.root_cause)}, ${sqlStr(r.prevention_rule)}, ${sqlStr(r.probe_type)}, ${sqlStr(r.probe_logic)}, ` +
    `${sqlStr(r.status)}, ${sqlArr(r.concepts_affected)}, ${sqlArr(r.fixed_in_files)}, ${sqlStr(SESSION)}, ${sqlStr(r.row_type)})`;
}

async function main(): Promise<void> {
  const sqlPath = join(process.cwd(), 'supabase_migrations', 'supabase_2026-08-21_seed_engine_bug_queue_lines_and_planes_cpb2_f2_migration.sql');
  const cols = 'bug_class, title, severity, owner_cluster, root_cause, prevention_rule, probe_type, probe_logic, status, concepts_affected, fixed_in_files, discovered_in_session, row_type';
  writeFileSync(sqlPath,
    `-- 2026-08-21 — lines_and_planes_in_space Checkpoint B cycle 2, finding F2: 1 new row.\n` +
    `-- Generated by src/scripts/_seed_engine_bug_queue_lines_and_planes_cpb2_f2_migration.ts — idempotent.\n` +
    `--\n` +
    `-- Guard: refuses to overwrite a row whose LIVE status is already FIXED or FALSE_POSITIVE.\n\n` +
    `INSERT INTO engine_bug_queue (${cols}) VALUES\n${rows.map(sqlRow).join(',\n')}\n` +
    `ON CONFLICT (bug_class) DO UPDATE SET status = EXCLUDED.status, root_cause = EXCLUDED.root_cause,\n` +
    `  prevention_rule = EXCLUDED.prevention_rule, probe_logic = EXCLUDED.probe_logic,\n` +
    `  title = EXCLUDED.title, severity = EXCLUDED.severity, owner_cluster = EXCLUDED.owner_cluster,\n` +
    `  concepts_affected = EXCLUDED.concepts_affected, fixed_in_files = EXCLUDED.fixed_in_files\n` +
    `WHERE engine_bug_queue.status NOT IN ('FIXED', 'FALSE_POSITIVE');\n`, 'utf-8');
  console.log(`Wrote archival SQL: ${sqlPath}`);

  const { data: live, error: liveErr } = await supabaseAdmin
    .from('engine_bug_queue').select('bug_class,status')
    .in('bug_class', rows.map((r) => r.bug_class));
  if (liveErr) { console.error(`✗ read failed: ${liveErr.message}`); process.exit(1); }
  const liveStatus = new Map((live ?? []).map((r: { bug_class: string; status: string }) => [r.bug_class, r.status]));
  const writable = rows.filter((r) => !PROTECTED.includes(liveStatus.get(r.bug_class) ?? 'OPEN'));
  const skipped = rows.filter((r) => PROTECTED.includes(liveStatus.get(r.bug_class) ?? 'OPEN'));
  for (const s of skipped) {
    console.log(`⏭  ${s.bug_class} — live status ${liveStatus.get(s.bug_class)}; REFUSING to overwrite`);
  }
  if (writable.length) {
    const payload = writable.map((r) => ({ ...r, discovered_in_session: SESSION, fixed_at: null }));
    const { error } = await supabaseAdmin.from('engine_bug_queue').upsert(payload, { onConflict: 'bug_class' });
    if (error) { console.error(`✗ upsert failed: ${error.message}`); process.exit(1); }
  }
  console.log(`✓ upserted ${writable.length} new row(s) (${skipped.length} protected, skipped)`);
}

main();
