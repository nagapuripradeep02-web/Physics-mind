/**
 * engine_bug_queue — two VISUAL findings from the first EYE walk of
 * solid_of_revolution, the first concept ever to author that scenario. 2026-08-27.
 *
 * Both were invisible to every automated gate and surfaced only by reading the
 * dumped frames: THE EYE's own run was 30/30 with 0 failures on the same frames.
 * That is the point of the walk, and it is why neither row is a gate failure.
 *
 * NEITHER IS FIXED HERE, and the reason differs per row:
 *   · the SR-D10 half-shift is a DESIGN decision, not a mechanical one — moving
 *     the world origin vertically changes every state's NDC and invalidates the
 *     architect's solved camera table plus the gate's own section 11/12 numbers.
 *   · the DOM tick depth row is the stated COST of blocker 2 (a world-space
 *     sprite cannot control its glyph height in device px), so "fixing" it means
 *     re-opening a decision the wave already made deliberately.
 * Both belong in front of the founder with the frames, not in a surgeon dispatch
 * chosen by the authoring session.
 *
 * Run: npx tsx --env-file=.env.local src/scripts/_seed_engine_bug_queue_sr_visual_walk.ts
 */
import '@/lib/loadEnvLocal';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const SESSION = 'session_2026-08-27_sr_concept_authoring';
const R = 'src/lib/renderers/field_3d_renderer.ts';

interface Row {
  bug_class: string; title: string;
  severity: 'CRITICAL' | 'MAJOR' | 'MODERATE';
  owner_cluster: string;
  root_cause: string; prevention_rule: string;
  probe_type: 'js_eval'; probe_logic: string;
  status: 'OPEN' | 'FIXED'; concepts_affected: string[]; fixed_in_files: string[];
  discovered_in_session: string;
  row_type: 'incident'; fixed_at: string | null;
  marker: string;
}
type BugRow = Omit<Row, 'marker'>;

const ROWS: Row[] = [
  {
    bug_class: 'sr_apparatus_is_centred_on_the_world_origin_in_x_only_so_a_flat_region_state_renders_in_the_top_half',
    title: 'SR-D10 shifts the apparatus onto the world origin along x only, so a state whose content is entirely above the axis of revolution renders in the upper half of the canvas with the lower half empty',
    severity: 'MODERATE',
    owner_cluster: 'peter_parker:field3d_surgeon',
    root_cause:
      'srShiftX = -(domain0 + domain1) / 2 (' + R + ') exists because the camera TARGET is not authorable '
      + '(the open MAJOR row field3d_scenario_renders_offcentre_because_camera_target_is_not_authorable), and it '
      + 'centres the drawn apparatus horizontally. There is no srShiftY. The camera therefore looks at graph y = 0, '
      + 'which is the axis of revolution. A state that draws a SOLID is unaffected, because a revolved solid '
      + 'straddles that axis: measured max |NDC| stays inside the gate floors on every 3D state. But a state that '
      + 'draws only the FLAT REGION has all its content in graph y in [0, 2] — entirely above the axis — so it '
      + 'renders in the top half of the frame with roughly 50 percent of the canvas empty beneath it. '
      + 'MEASURED on solids_of_revolution STATE_1 frozen frame (1280x720): the drawn graph spans y approximately '
      + '110 to 360 px, i.e. the lower 360 px carry nothing. Rule 34 wants the canvas dominated by the moving '
      + 'picture; half of it is background. '
      + 'WHY IT IS NOT MERELY COSMETIC: the concept opens on this state, so it is the first frame a teacher sees, '
      + 'and it is the chapter-continuity frame (arc rule 5) that is supposed to be recognisably Act II last object. '
      + 'WHY IT IS NOT FIXED IN THE AUTHORING PASS: adding a vertical shift moves every mesh, the axis rod, the '
      + 'frame group and the DOM tick projection together, and it changes the world coordinates the camera solve '
      + 'was computed against — which means the architect solved camera table (skeleton section 11) and the gate '
      + 'sections 11 and 12 that assert its NDC and frame-fill numbers all have to be re-solved and re-verified. '
      + 'That is a design decision about the scenario framing, not a mechanical repair.',
    prevention_rule:
      'A scenario that centres its apparatus on the world origin because the camera target is not authorable must '
      + 'centre it on BOTH axes, or state in its own comment which axis it deliberately leaves un-centred and why. '
      + 'A half-applied workaround reads as a complete one at every later review: SR-D10 is documented as "the whole '
      + 'apparatus is shifted onto the world origin", and that sentence is what a reader checks against, not the code.',
    probe_type: 'js_eval',
    probe_logic:
      'For each state, project the drawn content bounding box at the authored camera_position (FOV 60, 16:9) and '
      + 'assert the vertical CENTRE of that box sits within 0.15 NDC of the frame centre. STATE_1 of '
      + 'solids_of_revolution fails today; every solid-bearing state passes, which is what makes the defect easy to '
      + 'miss on a fleet sweep that samples one state per concept.',
    status: 'OPEN',
    concepts_affected: ['solids_of_revolution'],
    fixed_in_files: [],
    discovered_in_session: SESSION,
    row_type: 'incident',
    fixed_at: null,
    marker: 'SR_SHIFT_Y_2026_08_27',
  },
  {
    bug_class: 'sr_dom_tick_numbers_have_no_depth_so_they_paint_over_the_solid_that_encloses_their_axis',
    title: 'The axis tick numbers are DOM nodes positioned per frame from a projection, so they carry no depth and render ON TOP of a translucent solid that geometrically encloses them',
    severity: 'MODERATE',
    owner_cluster: 'peter_parker:field3d_surgeon',
    root_cause:
      'srPlaceTickNodes (' + R + ') positions the tick container children from nlbProjPx each frame. This is the '
      + 'deliberate answer to blocker 2: a world-space sprite cannot control its glyph height in device px, '
      + 'decollides blind to the projection, and is invisible to every DOM probe — three OPEN scars the DOM route '
      + 'dissolves. The cost, which the decision did not record, is that a DOM node has no z relationship to the '
      + 'THREE scene: it is painted after, always. When the revolved solid encloses the axes — which is the normal '
      + 'case for this scenario, not an edge case — the numbers float ON the solid instead of behind it. '
      + 'OBSERVED on solids_of_revolution STATE_5 (the primary aha): the tick labels -2, -1, 0, 1, 2 read as ink '
      + 'sitting on the surface of the ball. Also visible on STATE_6 and STATE_7. '
      + 'A SECOND, SEPARATE SYMPTOM ON THE SAME MECHANISM: STATE_3 puts the camera 12 degrees off the axis of '
      + 'revolution (required, so the disc face still projects as a circle at the worst position it reaches), which '
      + 'makes the x-axis nearly end-on. Its five tick numbers 0..4 then project into roughly 60 px and bunch into '
      + 'an unreadable cluster. The decollider drops overlapping labels, so no label LIES — but the axis reads as '
      + 'clutter rather than as a scale.',
    prevention_rule:
      'Any overlay drawn outside the 3D scene graph is unconditionally in front of it. Before choosing a DOM overlay '
      + 'for something that lives at a world POSITION, state what happens when scene geometry occupies that position '
      + '— and if the answer is "it paints over it", say so beside the decision instead of leaving it to the first '
      + 'concept that authors a solid big enough to find out.',
    probe_type: 'js_eval',
    probe_logic:
      'With a state that renders a closed solid, read the tick container children screen positions and test each '
      + 'against the projected silhouette of the solid. Any tick whose position falls INSIDE the silhouette is '
      + 'painting over geometry that encloses it. On solids_of_revolution STATE_5 at the authored pin, five of the '
      + 'ticks fall inside the ball.',
    status: 'OPEN',
    concepts_affected: ['solids_of_revolution'],
    fixed_in_files: [],
    discovered_in_session: SESSION,
    row_type: 'incident',
    fixed_at: null,
    marker: 'SR_TICK_DEPTH_2026_08_27',
  },
];


const PROTECTED = ['FIXED', 'FALSE_POSITIVE'];
/**
 * Columns a re-run may FILL on a protected row but never CHANGE. Provenance is
 * not judgement: a NULL here is an absence, never a curated decision, and the
 * one thing worse than a re-run rewriting a FIXED row's narrative is the
 * archival SQL and the live row disagreeing about where the row came from.
 */
const PROVENANCE: (keyof BugRow)[] = ['discovered_in_session'];

/** The row, with the non-column marker stripped. The ONLY place that happens. */
function rowOf(r: Row): BugRow { const { marker, ...row } = r; return row; }

function sqlStr(s: string): string { return `'${s.replace(/'/g, "''")}'`; }
function sqlArr(a: string[]): string { return a.length ? `ARRAY[${a.map(sqlStr).join(', ')}]::text[]` : `ARRAY[]::text[]`; }
function sqlVal(v: unknown): string {
  if (v === null || v === undefined) return 'NULL';
  if (Array.isArray(v)) return sqlArr(v as string[]);
  return sqlStr(String(v));
}

// ── THE COLUMN LIST IS DERIVED FROM THE ROW OBJECT, NEVER RESTATED ─────────
//   This used to be a hand-written string constant sitting beside an object
//   literal, and it drifted the only way it could: the string named
//   discovered_in_session and synthesised a value the object did not carry, so
//   the emitted SQL and the executed upsert disagreed about one column and both
//   reported success. Deriving the list means there is no second list to drift
//   from — a field added to the row appears in the SQL automatically, and a
//   field the SQL wants that the row does not have is now unwritable.
const COLS = Object.keys(rowOf(ROWS[0])) as (keyof BugRow)[];
//   Columns a conflicting re-run must NOT overwrite: the conflict key, the
//   row's type, and its provenance (which records the round that FIRST found
//   the class, not the round that last touched it).
const IMMUTABLE_ON_CONFLICT: (keyof BugRow)[] = ['bug_class', 'probe_type', 'row_type', ...PROVENANCE];

function emitSql(): string {
  const ins = ROWS.map((r) => {
    const row = rowOf(r);
    const setList = COLS.filter((c) => IMMUTABLE_ON_CONFLICT.indexOf(c) < 0)
      .map((c) => `  ${c} = EXCLUDED.${c}`).join(',\n');
    return `INSERT INTO engine_bug_queue (${COLS.join(', ')}) VALUES\n` +
      `(${COLS.map((c) => sqlVal(row[c])).join(', ')})\n` +
      `ON CONFLICT (bug_class) DO UPDATE SET\n${setList}\n` +
      `WHERE engine_bug_queue.root_cause NOT LIKE ${sqlStr(`%${r.marker}%`)}\n` +
      `  AND engine_bug_queue.status NOT IN ('FIXED', 'FALSE_POSITIVE');\n\n` +
      `-- Provenance repair: a protected row is never overwritten, but a NULL\n` +
      `-- provenance column is FILLED (an absence, not a decision).\n` +
      `UPDATE engine_bug_queue SET discovered_in_session = ${sqlVal(row.discovered_in_session)}\n` +
      `WHERE bug_class = ${sqlStr(row.bug_class)} AND discovered_in_session IS NULL;\n`;
  }).join('\n');
  return `-- 2026-08-27 — angle arcs are the only vg object kind never stamped.\n` +
    `-- ${ROWS.length} row, OPEN. Latent fleet-wide: 96 field_3d concepts scanned,\n` +
    `-- zero glows name an arc today, so nothing is broken yet.\n` +
    `-- Generated by src/scripts/_seed_engine_bug_queue_vg_readout_subject_label.ts. The column\n` +
    `-- list below is DERIVED from the same object the TS path upserts (Object.keys), so the two\n` +
    `-- cannot name different columns; the TS path then VERIFIES the write by reading it back.\n` +
    `-- Idempotent, order-independent, never a downgrade.\n\n` + ins;
}

/**
 * Columns Postgres stores as timestamptz. They round-trip in a DIFFERENT STRING
 * FORM than they were sent in ('...T21:00:00.000Z' out, '...T21:00:00+00:00'
 * back) while denoting the SAME INSTANT, so they are compared as instants. This
 * is a semantic normalisation, deliberately narrow and deliberately named — not
 * a loosened comparison. Every other column is compared byte for byte.
 */
const INSTANT_COLS: (keyof BugRow)[] = ['fixed_at'];

function sameValue(col: keyof BugRow, sent: unknown, live: unknown): boolean {
  if (INSTANT_COLS.indexOf(col) >= 0) {
    if (sent == null || live == null) return (sent ?? null) === (live ?? null);
    const a = Date.parse(String(sent)), b = Date.parse(String(live));
    return Number.isFinite(a) && Number.isFinite(b) && a === b;
  }
  return JSON.stringify(sent ?? null) === JSON.stringify(live ?? null);
}

/** Read the row back and prove every column landed as sent. */
async function verifyWrite(row: BugRow): Promise<string[]> {
  const { data, error } = await supabaseAdmin
    .from('engine_bug_queue').select(COLS.join(',')).eq('bug_class', row.bug_class).maybeSingle();
  if (error) return [`read-back failed: ${error.message}`];
  if (!data) return ['read-back found no row'];
  const live = data as unknown as Record<string, unknown>;
  return COLS.filter((c) => !sameValue(c, row[c], live[c]))
    .map((c) => `${c}: sent ${JSON.stringify(row[c] ?? null)}, live ${JSON.stringify(live[c] ?? null)}`);
}

async function main(): Promise<void> {
  const sqlPath = join(process.cwd(), 'supabase_migrations',
    'supabase_2026-08-27_seed_engine_bug_queue_sr_visual_walk_migration.sql');
  writeFileSync(sqlPath, emitSql(), 'utf-8');
  console.log(`Wrote archival SQL: ${sqlPath} (${ROWS.length} insert, ${COLS.length} columns: ${COLS.join(', ')})`);

  let bad = 0;
  for (const r of ROWS) {
    const row = rowOf(r);
    const { data: ex, error: rErr } = await supabaseAdmin
      .from('engine_bug_queue').select('bug_class,root_cause,status,discovered_in_session')
      .eq('bug_class', row.bug_class).maybeSingle();
    if (rErr) { console.error(`✗ read ${row.bug_class}: ${rErr.message}`); process.exit(1); }

    const protectedRow = !!ex && PROTECTED.includes(ex.status);
    const markerPresent = !!ex?.root_cause?.includes(r.marker);
    if (markerPresent || protectedRow) {
      // NEVER overwrite a curated row — but FILL a provenance column that is
      // absent, which is what the pre-fix version of this script left behind.
      const missing = PROVENANCE.filter((c) => (ex as Record<string, unknown>)[c] == null);
      if (missing.length) {
        const patch: Record<string, unknown> = {};
        for (const c of missing) patch[c] = row[c];
        const { error } = await supabaseAdmin.from('engine_bug_queue')
          .update(patch).eq('bug_class', row.bug_class).is(missing[0], null);
        if (error) { console.error(`✗ provenance repair ${row.bug_class}: ${error.message}`); process.exit(1); }
        console.log(`↻  ${row.bug_class} — provenance filled (${missing.join(', ')}); no other column touched`);
      } else {
        console.log(`⏭  ${row.bug_class} — ${markerPresent ? 'marker present' : `live status ${ex!.status}; REFUSING to overwrite a protected row`}`);
      }
    } else {
      const { error } = await supabaseAdmin.from('engine_bug_queue').upsert(row, { onConflict: 'bug_class' });
      if (error) { console.error(`✗ upsert ${row.bug_class}: ${error.message}`); process.exit(1); }
      console.log(`✓ filed ${row.bug_class} (${row.severity}/${row.status})`);
    }

    // THE GATE THE FIRST VERSION LACKED: "it reported success" is not evidence.
    const drift = await verifyWrite(row);
    if (drift.length) { bad += drift.length; for (const d of drift) console.error(`✗ DRIFT ${row.bug_class} — ${d}`); }
    else console.log(`   ✓ read-back: all ${COLS.length} columns match the object that was sent`);
  }
  if (bad) { console.error(`\n${bad} column(s) diverged between the object sent and the row stored`); process.exit(1); }

  const { data: open } = await supabaseAdmin.from('engine_bug_queue')
    .select('bug_class').contains('concepts_affected', ['solids_of_revolution']).in('status', ['OPEN', 'DEFERRED']);
  console.log(`\n· ${open?.length ?? 0} row(s) now OPEN/DEFERRED for this concept`);
}

main();
