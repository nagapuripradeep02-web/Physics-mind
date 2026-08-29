/**
 * engine_bug_queue — the TWO Checkpoint B rows on solid_of_revolution, closed.
 * 2026-08-28, dispatch [owner: peter_parker:field3d_surgeon].
 *
 * Both were filed OPEN by the authoring session's EYE walk
 * (_seed_engine_bug_queue_sr_visual_walk.ts, 2026-08-27) and deliberately left
 * for a surgeon dispatch, because the first needed the architect's camera table
 * and the gate's sections 11/12 re-solved, and the second re-opened blocker 2's
 * DOM-vs-sprite decision. This run does not MINT anything: it updates the two
 * existing classes to FIXED and appends the measured before/after to their
 * probe_logic, because a recurrence of either class must reopen these rows
 * rather than mint a duplicate.
 *
 * Same upsert contract as the script that filed them: the column list is DERIVED
 * from the row object (no second list to drift), the write is read back and every
 * column compared, and the concept query is by EXACT bug_class, never a capped
 * select. The guard is the marker below — a re-run is a no-op.
 *
 * Run: npx tsx --env-file=.env.local src/scripts/_seed_engine_bug_queue_sr_d11_centring_and_tick_depth.ts
 */
import '@/lib/loadEnvLocal';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const SESSION = 'session_2026-08-27_sr_concept_authoring';   // provenance: the round that FOUND them
const FIX_SESSION = 'session_2026-08-28_field3d_sr_canvas_legibility';
const MARKER = 'SR_D11_FIXED_2026_08_28';
const R = 'src/lib/renderers/field_3d_renderer.ts';
const G = 'src/scripts/check_solid_of_revolution.ts';
const FIXED_AT = '2026-08-28T11:20:00.000Z';

interface Row {
  bug_class: string; title: string;
  severity: 'CRITICAL' | 'MAJOR' | 'MODERATE';
  owner_cluster: string;
  root_cause: string; prevention_rule: string;
  probe_type: 'js_eval'; probe_logic: string;
  status: 'FIXED'; concepts_affected: string[]; fixed_in_files: string[];
  discovered_in_session: string;
  row_type: 'incident'; fixed_at: string;
}

const ROWS: Row[] = [
  {
    bug_class: 'sr_apparatus_is_centred_on_the_world_origin_in_x_only_so_a_flat_region_state_renders_in_the_top_half',
    title: 'SR-D10 shifts the apparatus onto the world origin along x only, so a state whose content is entirely above the axis of revolution renders in the upper half of the canvas with the lower half empty',
    severity: 'MODERATE',
    owner_cluster: 'peter_parker:field3d_surgeon',
    root_cause:
      'srShiftX = -(domain0 + domain1) / 2 (' + R + ') exists because the camera TARGET is not authorable '
      + '(updateCameraFromSpherical always calls camera.lookAt(0, 0, 0)), and it centred the drawn apparatus '
      + 'horizontally only. The camera therefore aimed at graph y = 0, which is the axis of revolution: a revolved '
      + 'solid straddles that axis and reads centred, while a state drawing only the FLAT REGION has all its '
      + 'content above it and renders in the top half with the lower half of the frame empty. '
      + 'FIXED ' + MARKER + ' by SR-D11: a vertical shift derived per frame from WHAT IS DRAWN, closed-form on the '
      + 'values the frame already holds — the profile band at its full (not revealed) extent, full circles for a '
      + 'stack / slice / sandbox, and for a swept skin only the arc its draw range keeps (R * [cos theta, 1] up to '
      + '180 deg, R * [-1, 1] past it), with revolution about y contributing its axis interval and no theta term. '
      + 'THE FIX IS NOT ONE GLOBAL OFFSET, and that is the load-bearing part: a single shift sized for the region '
      + 'state pushes every already-centred solid state off by the same amount (measured: STATE_5 goes from 0.000 '
      + 'to -0.211 NDC). Nor does it fold in the frame y_range, which is single-sided by construction and would '
      + 'have made the apparatus DRIFT vertically on every ramped radius (S5 r 1 -> 2, S8 b 1 -> 4, every S9 '
      + 'slider corner) — motion no author asked for, against Rule 32b. When the content straddles the axis the '
      + 'rule returns EXACTLY 0, so S3, S4, S5, S6, S8 and S9 keep their pixels and the gate sections 11 and 12 '
      + 'that assert their NDC and frame-fill numbers are unmoved (they now READ the shift from the shipped rule '
      + 'and assert it is 0 before projecting, rather than assuming it).',
    prevention_rule:
      'A scenario that centres its apparatus on the world origin because the camera target is not authorable must '
      + 'centre it on BOTH axes, or state in its own comment which axis it deliberately leaves un-centred and why. '
      + 'A half-applied workaround reads as a complete one at every later review. And the vertical answer is not a '
      + 'constant: it follows the content actually drawn that frame, continuously (the shipped rule never moves the '
      + 'apparatus by more than 0.0018 world units between adjacent 0.1 deg sweep steps), because a shift that '
      + 'switched on "is a solid being drawn" would teleport the whole apparatus on one frame.',
    probe_type: 'js_eval',
    probe_logic:
      'For each state, project the drawn content at the authored camera_position (FOV 60, 16:9) and assert the '
      + 'vertical CENTRE of that projection sits within 0.15 NDC of frame centre. Shipped as section 19 of '
      + 'check:solid-of-revolution, over all nine states and, for the states with a theta ramp, at eight sampled '
      + 'sweep angles each; the pre-fix body (no vertical shift) is the negative control and reads 0.333 NDC on '
      + 'STATE_1. MEASURED IN THE BROWSER, review build served on 8101, THE EYE pin protocol '
      + '(RESET_TRAJECTORY -> REPLAY_ANIMATIONS -> SET_TIME_FREEZE -> poll PM_simTimeMs), 1280x720, apparatus '
      + 'pixels only (chrome hidden), frame centre y = 360: '
      + 'BEFORE — STATE_1 @13600ms y 115..385 centre 250 (+0.306 NDC); STATE_2 @2100ms 105..386 centre 245.5 '
      + '(+0.318); STATE_5 @20800ms 185..530 centre 357.5 (+0.007); STATE_6 @21000ms 189..577 centre 383 (-0.064); '
      + 'STATE_7 @19000ms 168..460 centre 314 (+0.128). '
      + 'AFTER — STATE_1 233..505 centre 369 (-0.025); STATE_2 233..506 centre 369.5 (-0.026); STATE_5 186..530 '
      + 'centre 358 (+0.006, unchanged within the camera ease noise of +/-1 px); STATE_6 189..577 centre 383 '
      + '(-0.064, byte-unchanged including every tick position); STATE_7 213..520 centre 366.5 (-0.018). '
      + 'Determinism re-checked on the one time-varying case: STATE_2 pinned 8000 -> 14000 -> 8000 ms returns a '
      + 'byte-identical screenshot (sha256 prefix 201d7b93d59e1959 both times).',
    status: 'FIXED',
    concepts_affected: ['solids_of_revolution'],
    fixed_in_files: [R, G],
    discovered_in_session: SESSION,
    row_type: 'incident',
    fixed_at: FIXED_AT,
  },
  {
    bug_class: 'sr_dom_tick_numbers_have_no_depth_so_they_paint_over_the_solid_that_encloses_their_axis',
    title: 'The axis tick numbers are DOM nodes positioned per frame from a projection, so they carry no depth and render ON TOP of a translucent solid that geometrically encloses them',
    severity: 'MODERATE',
    owner_cluster: 'peter_parker:field3d_surgeon',
    root_cause:
      'srPlaceTickNodes (' + R + ') positions the tick container children from nlbProjPx each frame — the deliberate '
      + 'answer to blocker 2, because a world-space sprite cannot control its glyph height in device px, decollides '
      + 'blind to the projection, and is invisible to every DOM probe. The unrecorded cost is that a DOM node has no '
      + 'z relationship to the THREE scene and is always painted after it, so when the revolved solid encloses the '
      + 'axes — the normal case for this scenario — the numbers read as ink ON the solid. '
      + 'FIXED ' + MARKER + ' by ATTENUATION, not hiding: the axes of a solid of revolution are geometrically inside '
      + 'the solid, so "hide what is occluded" would delete the scale on every solid state. A tick whose world '
      + 'position is ENCLOSED by the drawn solid renders at 0.45 opacity, so it reads through translucent glass '
      + 'instead of on it; nothing moves and nothing latches. '
      + 'THE TEST IS ENCLOSURE, NOT SILHOUETTE OVERLAP. A point inside the solid has the near wall in front of it at '
      + 'every camera, so attenuating it is always honest; a point that merely overlaps the silhouette may be in '
      + 'FRONT of the solid and is left alone. Enclosure is claimed only when the solid CLOSES around the axis — a '
      + 'skin swept the full 360 or a stack of full circles — so a partially swept STATE_2 and the wrong-solid '
      + 'contrast beat attenuate nothing.',
    prevention_rule:
      'Any overlay drawn outside the 3D scene graph is unconditionally in front of it. Before choosing a DOM overlay '
      + 'for something that lives at a world POSITION, state what happens when scene geometry occupies that position '
      + '— and if the answer is "it paints over it", say so beside the decision. When the geometry is translucent '
      + 'the honest repair is strength, not visibility: attenuate what is enclosed, never hide what is occluded, '
      + 'because the scale a solid encloses is exactly the scale the state needs.',
    probe_type: 'js_eval',
    probe_logic:
      'With a state that renders a closed solid, test each tick world position against the drawn solid: inside the '
      + 'axis span AND within the outer radius at that station means the solid encloses it. Shipped as section 19 of '
      + 'check:solid-of-revolution, with two negative controls — the pre-fix render (every tick at full strength) is '
      + 'false on STATE_5 because three of its ticks are provably enclosed, and an enclosure claim NOT gated on a '
      + 'closed solid would attenuate STATE_2 while only 12 deg of skin is drawn. '
      + 'MEASURED live in the browser after the fix (review build, 1280x720, THE EYE pin protocol): STATE_5 @20800ms '
      + 'the ticks -1 (582,352), 1 (707,397), 0 (627,368) and the y tick 1 (626,277) render at opacity 0.45 while '
      + 'the rim ticks -2 and 2 stay at 1; STATE_4 @18000, STATE_3 @16000 and STATE_9 @9000 attenuate the four x '
      + 'ticks inside the solid and leave the y ticks and the origin at full strength; STATE_7 @19000 (about y) '
      + 'attenuates the two y ticks inside the drum and leaves the four x ticks on the visible ledge at full; '
      + 'STATE_1 and STATE_2 attenuate nothing at all.',
    status: 'FIXED',
    concepts_affected: ['solids_of_revolution'],
    fixed_in_files: [R, G],
    discovered_in_session: SESSION,
    row_type: 'incident',
    fixed_at: FIXED_AT,
  },
];

const COLS = Object.keys(ROWS[0]) as (keyof Row)[];
const IMMUTABLE_ON_CONFLICT: (keyof Row)[] = ['bug_class', 'probe_type', 'row_type', 'discovered_in_session'];

function sqlStr(s: string): string { return `'${s.replace(/'/g, "''")}'`; }
function sqlArr(a: string[]): string { return a.length ? `ARRAY[${a.map(sqlStr).join(', ')}]::text[]` : `ARRAY[]::text[]`; }
function sqlVal(v: unknown): string {
  if (v === null || v === undefined) return 'NULL';
  if (Array.isArray(v)) return sqlArr(v as string[]);
  return sqlStr(String(v));
}
function emitSql(): string {
  const body = ROWS.map((row) => {
    const setList = COLS.filter((c) => IMMUTABLE_ON_CONFLICT.indexOf(c) < 0)
      .map((c) => `  ${c} = EXCLUDED.${c}`).join(',\n');
    return `INSERT INTO engine_bug_queue (${COLS.join(', ')}) VALUES\n`
      + `(${COLS.map((c) => sqlVal(row[c])).join(', ')})\n`
      + `ON CONFLICT (bug_class) DO UPDATE SET\n${setList}\n`
      + `WHERE engine_bug_queue.root_cause NOT LIKE ${sqlStr(`%${MARKER}%`)}\n`
      + `  AND engine_bug_queue.status <> 'FALSE_POSITIVE';\n`;
  }).join('\n');
  return `-- 2026-08-28 — the two Checkpoint B rows on solid_of_revolution, CLOSED.\n`
    + `-- 2 rows, OPEN -> FIXED. No new class is minted: a recurrence reopens these.\n`
    + `-- Generated by src/scripts/_seed_engine_bug_queue_sr_d11_centring_and_tick_depth.ts.\n`
    + `-- The column list is DERIVED from the same object the TS path upserts (Object.keys),\n`
    + `-- and the TS path VERIFIES the write by reading it back. Idempotent (marker-gated).\n\n` + body;
}

function sameValue(col: keyof Row, sent: unknown, live: unknown): boolean {
  if (col === 'fixed_at') {
    if (sent == null || live == null) return (sent ?? null) === (live ?? null);
    return Date.parse(String(sent)) === Date.parse(String(live));
  }
  return JSON.stringify(sent ?? null) === JSON.stringify(live ?? null);
}
async function verifyWrite(row: Row): Promise<string[]> {
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
    'supabase_2026-08-28_engine_bug_queue_sr_d11_centring_and_tick_depth.sql');
  writeFileSync(sqlPath, emitSql(), 'utf-8');
  console.log(`Wrote archival SQL: ${sqlPath} (${ROWS.length} upserts, ${COLS.length} columns)`);
  console.log(`fix session: ${FIX_SESSION}`);

  let bad = 0;
  for (const row of ROWS) {
    const { data: ex, error: rErr } = await supabaseAdmin
      .from('engine_bug_queue').select('bug_class,root_cause,status')
      .eq('bug_class', row.bug_class).maybeSingle();
    if (rErr) { console.error(`✗ read ${row.bug_class}: ${rErr.message}`); process.exit(1); }
    if (!ex) { console.error(`✗ ${row.bug_class} does not exist — this script CLOSES rows, it does not mint them`); process.exit(1); }
    if (ex.status === 'FALSE_POSITIVE') { console.log(`⏭  ${row.bug_class} — live status FALSE_POSITIVE; refusing to overwrite`); continue; }
    if (ex.root_cause?.includes(MARKER)) {
      console.log(`⏭  ${row.bug_class} — marker present; already closed by this dispatch`);
    } else {
      console.log(`   was: status ${ex.status}`);
      const { error } = await supabaseAdmin.from('engine_bug_queue').upsert(row, { onConflict: 'bug_class' });
      if (error) { console.error(`✗ upsert ${row.bug_class}: ${error.message}`); process.exit(1); }
      console.log(`✓ closed ${row.bug_class} (${row.severity}/${row.status})`);
    }
    const drift = await verifyWrite(row);
    if (drift.length) { bad += drift.length; for (const d of drift) console.error(`✗ DRIFT ${row.bug_class} — ${d}`); }
    else console.log(`   ✓ read-back: all ${COLS.length} columns match the object that was sent`);
  }
  if (bad) { console.error(`\n${bad} column(s) diverged between the object sent and the row stored`); process.exit(1); }

  for (const row of ROWS) {
    const { data } = await supabaseAdmin.from('engine_bug_queue')
      .select('bug_class,status,fixed_at').eq('bug_class', row.bug_class).maybeSingle();
    console.log(`· ${data?.bug_class} -> ${data?.status} (fixed_at ${data?.fixed_at})`);
  }
  const { data: open } = await supabaseAdmin.from('engine_bug_queue')
    .select('bug_class,status').contains('concepts_affected', ['solids_of_revolution']).in('status', ['OPEN', 'DEFERRED']);
  console.log(`\n· ${open?.length ?? 0} row(s) still OPEN/DEFERRED for solids_of_revolution`
    + (open?.length ? ': ' + open.map((o) => o.bug_class).join(', ') : ''));
}

main();
