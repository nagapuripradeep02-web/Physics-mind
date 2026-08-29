/**
 * engine_bug_queue — THE EYE's contact sheet lets a reader bind a label to the
 * wrong row, and an automated walker did exactly that. 2026-08-28.
 *
 * The eye-walker's round-2 re-walk of solids_of_revolution reported a "~2.6 s
 * contact-sheet-vs-ground-truth skew" on two states and proposed a row saying
 * the sheet thumbnails came from a "separately-timed/replayed pass". THAT IS
 * NOT WHAT THE CODE DOES: contactSheet.ts builds every dense cell from the SAME
 * frames_b64 and capture_times_ms the dense_tNNNNN.png dumps are written from
 * (frameDump.ts), so a timing skew is impossible by construction. What IS true
 * is the geometry: composeGrid places each label strip at y + THUMB_H, and the
 * next row begins at y + THUMB_H + LABEL_H — the strip is flush against the
 * thumbnails BELOW it, no gap, no border. A reader binding labels to the row
 * beneath reads every cell one row ahead: GRID_COLS x 700 ms = 2.8 s, which is
 * the walker's measured skew to within its rounding. The finding was real; its
 * stated cause was wrong; this row carries the measured one.
 *
 * Run: npx tsx --env-file=.env.local src/scripts/_seed_engine_bug_queue_eye_contact_sheet_label_binding.ts
 */
import '@/lib/loadEnvLocal';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const SESSION = 'session_2026-08-28_sr_checkpoint_b';
const F = 'src/lib/validators/visual/contactSheet.ts';

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
    bug_class: 'eye_contact_sheet_label_strip_is_flush_against_the_next_row_so_a_reader_binds_it_to_the_wrong_thumbnail',
    title: 'THE EYE contact sheet composites each time label directly beneath its thumbnail with the next row starting immediately after, so the label is equidistant from its own frame and the one below and an automated reader attributes every cell one row (2.8 s) ahead',
    severity: 'MODERATE',
    owner_cluster: 'peter_parker:visual_validator',
    root_cause:
      'composeGrid (' + F + '): cellH = THUMB_H + LABEL_H; thumbnail i at top = row * cellH; its label strip at '
      + 'top = row * cellH + THUMB_H; the next row\'s thumbnails at (row + 1) * cellH, i.e. immediately below the strip '
      + 'with zero gap, and the strip fill (#1a1a30) is a near-background dark. Nothing visually binds a strip to the '
      + 'frame above rather than the frame below. MEASURED CONSEQUENCE: the eye-walker on solids_of_revolution run '
      + '20260828-095046 read STATE_6 cells "labelled t=8400/9100/9800" as showing the dissolved ring stack and formula, '
      + 'while the dense dumps at those exact times are MD5-identical to t=7700 and t=10500 (the held wrong solid, verified '
      + 'here: five identical hashes) — it had bound each strip to the row beneath, GRID_COLS = 4 cells x 700 ms = 2.8 s '
      + 'ahead, and reported a "~2.6 s skew" on two states. It then proposed the thumbnails came from a separately-timed '
      + 'pass. They do not: both the sheet and the dumps are written from the same frames_b64 / capture_times_ms '
      + '(frameDump.ts). The data is right; the layout invites the misread. WHY IT MATTERS: the sheet is what CLAUDE.md '
      + 'says to read FIRST, and a wrong binding turns a correct sim into a false finding — this one cost a walker '
      + 'dispatch and would have been filed as a harness defect had the code not been read.',
    prevention_rule:
      'A label must be visually bound to the thing it labels: draw it INSIDE the thumbnail (top-left overlay) or leave a '
      + 'gap/border between a row\'s label strip and the next row that is larger than the strip-to-thumbnail distance. '
      + 'Any grid where the caption sits equidistant between two images will be misread by some reader, human or '
      + 'automated, and a sheet meant to be read first must not depend on the reader guessing the binding.',
    probe_type: 'js_eval',
    probe_logic:
      'Render a sheet for a state whose dense frames change every cell; for each label strip, measure the vertical gap '
      + 'to the thumbnail above (should be 0) and to the thumbnail below (currently also 0). Assert the below-gap is >= '
      + 'LABEL_H or the label is composited inside the thumbnail bounds. The negative control is the current layout: '
      + 'both gaps 0.',
    status: 'OPEN',
    concepts_affected: ['solids_of_revolution'],
    fixed_in_files: [],
    discovered_in_session: SESSION,
    row_type: 'incident',
    fixed_at: null,
    marker: 'EYE_SHEET_LABEL_BINDING_2026_08_28',
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
    'supabase_2026-08-28_seed_engine_bug_queue_eye_contact_sheet_label_binding_migration.sql');
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
