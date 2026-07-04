/**
 * Seed engine_bug_queue with the amperes_circuital_law founder-review bug ledger
 * (recorded screen review 26.06.2026 — STATES 6/7/8). One row per bug CLASS,
 * tagged concepts_affected=['amperes_circuital_law']. All row_type 'incident'
 * (land headlessly via supabaseAdmin). status OPEN — newly found, fixes in flight.
 *
 * Also (re)writes the archival SQL migration so the repo carries the record:
 *   supabase_2026-06-26_seed_engine_bug_queue_amperes_review_migration.sql
 *
 * Idempotent: upsert onConflict 'bug_class'.
 * Run: npx tsx --env-file=.env.local src/scripts/_seed_engine_bug_queue_amperes_review.ts
 */
import '@/lib/loadEnvLocal';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const SESSION = 'session_2026-06-26_amperes_review';

type Owner =
  | 'alex:architect' | 'alex:physics_author' | 'alex:json_author'
  | 'peter_parker:renderer_primitives' | 'peter_parker:runtime_generation'
  | 'peter_parker:visual_validator' | 'ambiguous';
type Severity = 'CRITICAL' | 'MAJOR' | 'MODERATE';
type Status = 'OPEN' | 'FIXED' | 'DEFERRED' | 'NOT_REPRODUCING' | 'FALSE_POSITIVE';
type ProbeType = 'sql' | 'js_eval' | 'manual' | 'vision_model';
type RowType = 'incident' | 'directive';

interface Row {
  bug_class: string;
  title: string;
  severity: Severity;
  owner_cluster: Owner;
  root_cause: string;
  prevention_rule: string;
  probe_type: ProbeType;
  probe_logic: string;
  status: Status;
  concepts_affected: string[];
  fixed_in_files: string[];
  row_type: RowType;
}

const R = 'peter_parker:renderer_primitives';
const RENDERER = ['src/lib/renderers/field_3d_renderer.ts'];
const CONCEPT = ['amperes_circuital_law'];

const incidents: Row[] = [
  {
    bug_class: 'acl_state8_sliders_update_readout_not_geometry',
    title: 'STATE_8 explorer: I/r sliders update only the B readout — the 2πr ruler, bar length and loop do NOT respond (visual contradicts narration)',
    severity: 'MAJOR',
    owner_cluster: R,
    root_cause: 'In the amperes_circuital_law STATE_8 integrated/slider state the live I and r sliders are bound only to the numeric B readout (B = mu_0*I/(2*pi*r) updates correctly). The geometry is static: changing r does not lengthen the 2pi*r ruler/bar or resize the Amperian loop, and changing I changes nothing visual. The narration explicitly promises "the 2pi*r ruler gets longer" and "B falls as 1/r" — so the picture contradicts the spoken lesson (teach_visual_must_match_narration).',
    prevention_rule: 'In the explorer/integrated state bind the live r slider to the on-screen geometry: the 2pi*r ruler length and the Amperian loop radius must grow/shrink with r, and B must visibly fall as 1/r. Never let an explorer state move only a numeric readout while its geometry stays frozen.',
    probe_type: 'manual',
    probe_logic: 'Open STATE_8, drag r from min to max: the ruler/bar must visibly lengthen and the loop must enlarge while I_enc holds; drag I: B visibly tracks. The geometry must change, not just the number.',
    status: 'FIXED',
    concepts_affected: CONCEPT,
    fixed_in_files: RENDERER,
    row_type: 'incident',
  },
  {
    bug_class: 'acl_unrolled_bar_occludes_loop_and_wire',
    title: 'STATE_6/7/8 unrolled bar + 2πr ruler anchored at canvas centre cuts through the Amperian loop and the wire (occlusion / hindrance)',
    severity: 'MAJOR',
    owner_cluster: R,
    root_cause: 'The unrolled bar + ruler is anchored at the vertical centre of the canvas, where the Amperian loop and the current-carrying wire also live, so the bar overlaps and obstructs both (founder: "this is stopping the view of the rod and the circle"). In the 16:9 reviewer view the overlap is pronounced — bar, loop and wire compete for the same band.',
    prevention_rule: 'Anchor the unrolled bar + ruler in a clear gutter (e.g. a dedicated lower band) fully separated from the loop and wire; relocate/raise or fade the loop+wire when the bar is the focus. No primitive should occlude another in the unroll/solve/explore states.',
    probe_type: 'manual',
    probe_logic: 'In STATE_6/7/8 the bar, the Amperian loop, and the wire are each fully visible with no overlap; the bar sits clear of the loop and rod.',
    status: 'FIXED',
    concepts_affected: CONCEPT,
    fixed_in_files: RENDERER,
    row_type: 'incident',
  },
  {
    bug_class: 'acl_state7_visually_indistinct_from_state6',
    title: 'STATE_7 (solve for B) reads as identical to STATE_6 — same static bar, only the equation box changes; the "isolate B" beat does not land',
    severity: 'MAJOR',
    owner_cluster: R,
    root_cause: 'STATE_6 (unroll -> B·2pi*r) and STATE_7 (set = mu_0*I_enc, solve for B) share the same dominant visual: the identical horizontal green bar. Only the top equation box and a small "= mu_0*I_enc" change, so the divide-by-2pi*r / isolate-B step is a re-caption of the same picture, not a distinct beat (founder: "state 7 is same with state 6 ... not working").',
    prevention_rule: 'Give STATE_7 a distinct visual move for the solve step: visibly divide the bar by 2pi*r / cancel the 2pi*r length and extract B, so the isolate-B action is a different picture from STATE_6, not the same static bar with new text.',
    probe_type: 'manual',
    probe_logic: 'STATE_6 and STATE_7 are visually distinguishable at a glance; STATE_7 shows an isolate-B action (a divide/cancel/extract), not the STATE_6 bar with a swapped caption.',
    status: 'FIXED',
    concepts_affected: CONCEPT,
    fixed_in_files: RENDERER,
    row_type: 'incident',
  },
  {
    bug_class: 'acl_unroll_ring_to_bar_transformation_unclear',
    title: 'STATE_6 ring→bar "unroll" is hard to follow ("the circle is molded into a column") — the circle-becomes-a-line transformation does not read',
    severity: 'MODERATE',
    owner_cluster: R,
    root_cause: 'The unroll that turns the ring of equal B·dl tiles into the straight 2pi*r bar is not legible: it is compounded by the bar overlapping the loop (see acl_unrolled_bar_occludes_loop_and_wire) and by the transformation not visibly lifting the tiles off the loop and straightening them. Founder could not tell what was happening and questioned whether the unroll is needed vs directly stating the circumference is 2pi*r. [architect/pedagogy note: the unroll is correct physics — keep it, but make the circle->line transformation unmistakable; if still unclear after the layout fix, fall back to a "highlight the loop circumference, label it 2pi*r" beat.]',
    prevention_rule: 'Make the ring->bar unroll unmistakable: visibly lift the tiles off the loop and straighten them into a clearly-separated bar of the same total length, so a first-time viewer sees the circle becoming the line (length conserved). Keep the unroll only if it reads; otherwise use the simpler "the path once around = 2pi*r" beat.',
    probe_type: 'manual',
    probe_logic: 'A first-time viewer watching STATE_6 can see the loop tiles lift off and straighten into one bar of the same total length = 2pi*r, with the loop and bar clearly separate.',
    status: 'FIXED',
    concepts_affected: CONCEPT,
    fixed_in_files: RENDERER,
    row_type: 'incident',
  },
];

// ── SQL emit (archival migration record) ────────────────────────────────────
function sqlStr(s: string): string { return `'${s.replace(/'/g, "''")}'`; }
function sqlArr(a: string[]): string {
  if (a.length === 0) return `ARRAY[]::text[]`;
  return `ARRAY[${a.map(sqlStr).join(', ')}]`;
}
function sqlRow(r: Row): string {
  return `(${sqlStr(r.bug_class)}, ${sqlStr(r.title)}, ${sqlStr(r.severity)}, ${sqlStr(r.owner_cluster)}, ` +
    `${sqlStr(r.root_cause)}, ${sqlStr(r.prevention_rule)}, ${sqlStr(r.probe_type)}, ${sqlStr(r.probe_logic)}, ` +
    `${sqlStr(r.status)}, ${sqlArr(r.concepts_affected)}, ${sqlArr(r.fixed_in_files)}, ${sqlStr(SESSION)}, ${sqlStr(r.row_type)})`;
}
function emitSql(all: Row[]): string {
  const cols = 'bug_class, title, severity, owner_cluster, root_cause, prevention_rule, probe_type, probe_logic, status, concepts_affected, fixed_in_files, discovered_in_session, row_type';
  return `-- ============================================================================
-- 2026-06-26: seed engine_bug_queue with the amperes_circuital_law founder-review
-- bug ledger (recorded screen review 26.06.2026 — STATES 6/7/8). One row per bug
-- CLASS, concepts_affected=['amperes_circuital_law'], all row_type 'incident',
-- status OPEN. Generated by src/scripts/_seed_engine_bug_queue_amperes_review.ts.
-- ============================================================================

INSERT INTO engine_bug_queue (${cols}) VALUES
${all.map(sqlRow).join(',\n')}
ON CONFLICT (bug_class) DO NOTHING;
`;
}

async function upsertBatch(rows: Row[], label: string): Promise<boolean> {
  const payload = rows.map((r) => ({ ...r, discovered_in_session: SESSION }));
  const { error } = await supabaseAdmin
    .from('engine_bug_queue')
    .upsert(payload, { onConflict: 'bug_class' });
  if (error) {
    console.error(`  ✗ ${label} upsert failed: ${error.message}`);
    return false;
  }
  console.log(`  ✓ ${label}: ${rows.length} rows upserted`);
  return true;
}

async function main(): Promise<void> {
  const sqlPath = join(process.cwd(), 'supabase_migrations', 'supabase_2026-06-26_seed_engine_bug_queue_amperes_review_migration.sql');
  writeFileSync(sqlPath, emitSql(incidents), 'utf-8');
  console.log(`Wrote archival SQL: ${sqlPath} (${incidents.length} incident rows)`);

  console.log('Upserting incident rows…');
  await upsertBatch(incidents, 'incidents');

  const { data, error } = await supabaseAdmin
    .from('engine_bug_queue')
    .select('bug_class, status, severity')
    .eq('discovered_in_session', SESSION);
  if (error) { console.error('verify query failed:', error.message); return; }
  console.log(`In engine_bug_queue for this session: ${(data ?? []).length} rows`);
  for (const row of data ?? []) console.log(`  [${row.severity}] ${row.status}  ${row.bug_class}`);
}

main().catch((err) => {
  console.error('💥 seed failed:', err instanceof Error ? err.stack : err);
  process.exit(1);
});
