/**
 * engine_bug_queue — the two rows founder-proxy Checkpoint B raised that no
 * engine dispatch owned: a design sub-beat table with no driver behind it, and
 * a founder_drive dump that never photographs a state's payoff. 2026-08-28.
 *
 * The FIRST row's probe was REWRITTEN BY ITS OWN AUTHOR before filing. Cycle 1
 * proposed "assert no run of >= 3 identical frames begins before the last
 * authored driver ends". On the FIXED build that misfires: STATE_6's legitimate
 * 7000-10500 read-hold begins long before theta_ramp ends at 20000, so the probe
 * would flag correct behaviour. A probe that fails on a good build poisons the
 * ratchet exactly as a probe that passes on a bad one does. The shipped
 * assertion below distinguishes a run that coincides with an AUTHORED hold from
 * one overlapping a window where a driver is DECLARED to be advancing, and
 * carries STATE_4's reveal-hold tail as the negative control that must NOT flag.
 *
 * Run: npx tsx --env-file=.env.local src/scripts/_seed_engine_bug_queue_cpb_subbeat_and_drive.ts
 */
import '@/lib/loadEnvLocal';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const SESSION = 'founder_proxy Checkpoint B cycle 1, 2026-08-28';

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
    bug_class: 'state_subbeat_table_declares_motion_in_a_window_the_shipped_config_places_no_driver_in',
    title: 'A design sub-beat table authored build/read/dissolve and the JSON shipped an instant placement, leaving 8.4 s of byte-identical canvas under live narration',
    severity: 'CRITICAL',
    owner_cluster: 'alex:json_author',
    root_cause:
      'The skeleton per-state timing table is PROSE; the JSON reveal block is the only thing the renderer reads. '
      + 'A sub-beat that names MOTION ("builds 1500-7000", "dissolves 9000-11000") has no counterpart field unless '
      + 'the author writes a ramp, and an at_ms with no duration and no ramp is an INSTANT placement that satisfies '
      + 'every gate. THE EYE D5 scores a state as a WHOLE, so a state that moves anywhere passes while a third of it '
      + 'is a still frame. Measured on solids_of_revolution STATE_6 2026-08-28: 13 identical frames t=2100..10500 '
      + '(sha256 d1916f879dcc), 8.4 s of a 28 s state, with the misconception narration playing over it; narration '
      + '45 words ~= 17.3 s against a measured 11.2 s motion window, which Rule 31 forbids and which a duration-based '
      + 'words_max cannot see.',
    prevention_rule:
      'Every sub-beat in a timing table that names MOTION must resolve to a NAMED DRIVER in the shipped JSON (a '
      + '*_ramp, a *_ms fade window, or a camera_steps entry), and the build must prove it by hashing the dense '
      + 'series. Recompute the state\'s words_max against the MEASURED motion window, never the authored duration.',
    probe_type: 'js_eval',
    probe_logic:
      'Hash every STATE_N__dense_*.png in run order; report maximal runs of identical hashes. For each run of >= 3 '
      + 'frames, assert it coincides with EITHER (a) an authored hold — a holds[] entry, or a gap between two '
      + 'authored drivers that the design sub-beat table names as a read/hold beat — OR (b) the post-timeline '
      + 'reveal-hold tail. THE DEFECT is a run overlapping a window in which a driver is DECLARED to be advancing. '
      + 'Measured on solids_of_revolution STATE_6: BEFORE, 13 identical frames t=2100..10500 (sha256 d1916f879dcc) '
      + 'against an authored "builds 1500-7000"; AFTER, with discs.n_ramp 1500-7000, 6 frames t=7000..10500 which '
      + 'coincide exactly with the authored "reads 7000-9000" hold plus an un-built dissolve. NEGATIVE CONTROL, same '
      + 'concept: STATE_4\'s 12-frame run t=18200..25900 is its reveal-hold tail and must NOT flag. '
      + 'THE FIRST DRAFT OF THIS PROBE ("no run begins before the last authored driver ends") WOULD HAVE FLAGGED THE '
      + 'FIXED BUILD, and is recorded here as wrong: a probe that fails on a good build poisons the ratchet exactly '
      + 'as one that passes on a bad build does.',
    status: 'OPEN',
    concepts_affected: ['solids_of_revolution'],
    fixed_in_files: [],
    discovered_in_session: SESSION,
    row_type: 'incident',
    fixed_at: null,
    marker: 'CPB_SUBBEAT_NO_DRIVER_2026_08_28',
  },
  {
    bug_class: 'founder_drive_playing_late_shot_lands_in_the_first_third_of_every_state_so_no_payoff_is_photographed',
    title: 'The three-shot per-state dump sampled at 18-37 percent of each state; every shot of the misconception state fell inside its dead window',
    severity: 'MAJOR',
    owner_cluster: 'peter_parker:visual_validator',
    root_cause:
      'playing_late is taken at a wall-clock offset rather than as a fraction of the state\'s own authored timeline, '
      + 'so a 28 s state is photographed at 5.2 s. The founder reads this dump as the live-drive evidence for a '
      + 'state, and it currently cannot contain any state\'s final teaching frame.',
    prevention_rule:
      'The three shots are placed as FRACTIONS of the state\'s own timelineTotal (entry, mid, and after the last '
      + 'authored driver ends), not at fixed wall offsets. A dump meant to stand in for watching the sim must '
      + 'photograph the frame the state exists to produce.',
    probe_type: 'js_eval',
    probe_logic:
      'For each state in a founder_drive manifest, divide each shot\'s simTimeMs by the state\'s authored duration '
      + 'and assert the late shot exceeds 0.85. Measured on solids_of_revolution 2026-08-28: S2 4800/26000 = 0.18, '
      + 'S4 5088/26000 = 0.20, S6 5168/28000 = 0.18, S7 4880/24000 = 0.20, S3 8208/22000 = 0.37. All nine states '
      + 'fail; all three S6 shots landed inside the 8.4 s frozen window that the sub-beat row above describes, which '
      + 'is why the drive dump could not have surfaced it.',
    status: 'OPEN',
    concepts_affected: ['solids_of_revolution'],
    fixed_in_files: [],
    discovered_in_session: SESSION,
    row_type: 'incident',
    fixed_at: null,
    marker: 'CPB_DRIVE_LATE_SHOT_2026_08_28',
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
    'supabase_2026-08-28_seed_engine_bug_queue_cpb_subbeat_and_drive_migration.sql');
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
