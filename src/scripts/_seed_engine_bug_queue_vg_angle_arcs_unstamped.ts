/**
 * engine_bug_queue — angle arcs are the only vg object kind that is never
 * stamped, so nothing can address one by its authored id. 2026-08-27.
 *
 * Found while grading the `focal_primitive_id` P3 on lines_and_planes_in_space,
 * whose recorded premise ("no consumer at all, schema-only") is FALSE:
 * smoke_visual_validator.ts extracts focal_primitive_id and passes
 * focal_primitive_ids into the PAID vision gate. The real finding underneath it
 * is narrower and transferable, and is what this row records.
 *
 * NOT fixed here, deliberately: the fix is in field_3d_renderer.ts, which a
 * concurrent session owns for the #8 solids_of_revolution scenario
 * (docs/CONCURRENT_SESSION_HANDOFF_2026-08-27.md). Two sessions editing that
 * file on unpushed branches is the exact Rule-40 origin story.
 *
 * Run: npx tsx --env-file=.env.local src/scripts/_seed_engine_bug_queue_vg_angle_arcs_unstamped.ts
 */
import '@/lib/loadEnvLocal';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const SESSION = 'session_2026-08-27_p3_grading';
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
    bug_class: 'angle_arcs_are_the_only_vg_object_kind_never_stamped_so_no_mechanism_can_address_one_by_its_authored_id',
    title: 'Every vg object kind carries its authored id in userData.vgId except angle arcs — lines, planes, normals, points, segments and vectors are all stamped, the arc loop is not — so a glow, a focal id or any future emphasis that names an arc resolves to nothing and fails silently',
    severity: 'MODERATE',
    owner_cluster: 'peter_parker:field3d_surgeon',
    root_cause:
      'In updateVectorGeometry3DFrame (' + R + ') the display pass stamps every pool it fills: lines at ~15003 '
      + '(stamp(m, L.id) plus label and dir arrow), planes and their normals at ~15026 (stamp(qm, P.id), '
      + 'stamp(pn, P.id + ".normal")), points at ~15060, segments at ~15078, vectors at ~15092. THE ARC LOOP AT '
      + '~15106-15129 HAS NO stamp() CALL AT ALL — it writes geometry and sets visible, and the mesh keeps only its '
      + 'pool identity ("vg_lp_arc_" + i) from build time. stamp() is one line (m.userData.vgId = id), so an arc is '
      + 'the single kind of authored vg object that cannot be found by the id its author gave it. '
      + 'WHY IT IS ONLY LATENT TODAY: scanned all 96 field_3d concepts — ZERO sentences glow an arc id, so nothing is '
      + 'currently broken. The only references are lines_and_planes_in_space STATE_6 focal_primitive_id = "arc1" and '
      + 'STATE_7 = "arc_normal", and focal_primitive_id has no renderer consumer (it feeds smoke_visual_validator\'s '
      + 'paid vision prompt, which passes the string through and never resolves it against the scene). '
      + 'WHY IT IS A TRAP RATHER THAN A CURIOSITY: an arc is exactly what an author reaches for when the taught thing '
      + 'IS the angle, which is precisely when they will write glow: "arc_normal". applyGlowEmphasis then dims every '
      + 'peer to 0.4 and brightens nothing, because the named object cannot be found — the C-1 signature '
      + '(bug_class: a glow whose target is absent dims the scene with no focal). The author sees a state that dims '
      + 'for no reason, with nothing in the JSON obviously wrong, and no gate fires: THE EYE has no check that a glow '
      + 'target resolves, and the concept validator does not cross-check glow ids against the vg object set. '
      + 'The corrected record for the P3 this came from: focal_primitive_id is NOT unconsumed. It is read by '
      + 'src/scripts/smoke_visual_validator.ts (extractFocalPrimitiveIds, ~:48-57) and shipped as focal_primitive_ids '
      + 'to the paid gate. Its two arc-valued entries are SEMANTICALLY CORRECT and must not be repointed at a stamped '
      + 'but wrong object merely to make them resolvable.',
    prevention_rule:
      'EVERY POOL THE DISPLAY PASS FILLS GETS stamp()ed WITH ITS AUTHORED ID, WITHOUT EXCEPTION. An addressing scheme '
      + 'with one unaddressable kind is worse than none, because it is invisible: the author uses the same syntax that '
      + 'works everywhere else and gets silence. '
      + 'AND THE GENERAL FORM: WHEN A SYSTEM LETS AUTHORS REFER TO OBJECTS BY NAME, THE SET OF NAMEABLE OBJECTS MUST BE '
      + 'CLOSED AND CHECKED. A name that resolves to nothing must fail LOUDLY at validate time, not degrade into a '
      + 'silent no-op at render time — a validator cross-check of every authored glow / focal / widget target against '
      + 'the state\'s own vg object set costs nothing and turns this whole class into a build error.',
    probe_type: 'js_eval',
    probe_logic:
      'TWO checks, and the second is the one that generalises. '
      + '(1) ENGINE: after a vg display pass, assert that for every authored object in points, lines, angle_arcs, '
      + 'intersections, segments, vectors and planes there exists a visible mesh whose userData.vgId equals that '
      + 'authored id. Today the arc entries fail and every other kind passes — which is the discriminating result, '
      + 'not a general "objects render" assertion. '
      + '(2) AUTHORING (cheaper, and catches the real-world case): for every state, collect the vg object id set and '
      + 'assert that every sentence glow, every focal_primitive_id and every widget target is a member. FAIL on any '
      + 'name that resolves to nothing. Run over the fleet this reports 0 failures today and would have reported the '
      + 'first arc-glow the day it was authored. '
      + 'NEGATIVE CONTROL: author glow: "arc_normal" on lines_and_planes_in_space STATE_7 s7_2 and confirm check (2) '
      + 'FAILS while the rendered frame shows the scene dimmed to 0.4 with no focal — the C-1 signature — proving the '
      + 'probe catches the silent case rather than restating the reveal gate.',
    status: 'OPEN',
    concepts_affected: ['lines_and_planes_in_space'],
    fixed_in_files: [],
    discovered_in_session: SESSION,
    row_type: 'incident',
    fixed_at: null,
    marker: 'THE ARC LOOP AT ~15106-15129 HAS NO stamp() CALL AT ALL',
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
    'supabase_2026-08-27_seed_engine_bug_queue_vg_angle_arcs_unstamped_migration.sql');
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
    .select('bug_class').contains('concepts_affected', ['lines_and_planes_in_space']).in('status', ['OPEN', 'DEFERRED']);
  console.log(`\n· ${open?.length ?? 0} row(s) now OPEN/DEFERRED for this concept`);
}

main();
