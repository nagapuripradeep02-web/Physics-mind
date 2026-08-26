/**
 * engine_bug_queue — THE READOUT ROW'S NAME vs THE OBJECT IT MEASURES,
 * `field_3d_renderer.ts` (Rule-40 platform dispatch), 2026-08-21.
 *
 * What the round was: F1 on the `lines_and_planes_in_space` desk. The dot-product readout family
 * printed a HARDCODED name — VG_READOUT_LABEL.d_dot_n = "n·d" — and the comment above the publish
 * site justified that constant by quoting a fact about CONCEPT DATA ("on the state this exists for,
 * both lines carry the same generic label d"). An earlier fix renamed the line to d′, falsifying the
 * premise silently. Nothing failed; every frame stayed internally consistent.
 *
 * ONE row, filed already FIXED — the class is recorded so the prevention rule and the negative
 * control survive the fix. Marker-gated, and no write downgrades a protected status.
 *
 * A NOTE ON THIS FILE'S OWN HISTORY, because it is the same defect it documents. The first version
 * carried the claim "SQL emitted from the SAME structure the TS applies" as PROSE, while emitSql()
 * named a `discovered_in_session` column and synthesised SESSION into it and the upserted object had
 * no such key — so the archival SQL carried the session and the live row landed NULL. Both paths
 * reported success; nothing compared them. That is two representations of one value linked only by a
 * sentence, with no gate — the sixth instance of the very family the row below records, inside the
 * artifact documenting the fifth. It is fixed STRUCTURALLY here: the SQL column list is DERIVED from
 * the row object's own keys (there is no second list to drift), and every write is VERIFIED BY
 * READ-BACK against the object that was sent, so "it reported success" is no longer the evidence.
 *
 * Run: npx tsx --env-file=.env.local src/scripts/_seed_engine_bug_queue_vg_readout_subject_label.ts
 */
import '@/lib/loadEnvLocal';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const SESSION = 'session_2026-08-21_vg_readout_subject_label';
const FIXED_AT = '2026-08-21T21:00:00.000Z';
const R = 'src/lib/renderers/field_3d_renderer.ts';
const G = 'src/scripts/check_vector_geometry_3d.ts';

interface Row {
  bug_class: string; title: string;
  severity: 'CRITICAL' | 'MAJOR' | 'MODERATE';
  owner_cluster: string;
  root_cause: string; prevention_rule: string;
  probe_type: 'js_eval'; probe_logic: string;
  status: 'OPEN' | 'FIXED'; concepts_affected: string[]; fixed_in_files: string[];
  discovered_in_session: string;
  row_type: 'incident'; fixed_at: string | null;
  /** NOT a column — the idempotence marker, stripped before any write. */
  marker: string;
}
/** Exactly the columns, with `marker` gone: the ONE shape both paths read. */
type BugRow = Omit<Row, 'marker'>;

const ROWS: Row[] = [
  {
    bug_class: 'readout_family_label_is_a_hardcoded_constant_so_renaming_an_authored_object_makes_the_panel_name_the_wrong_one',
    title: 'The readout panel printed "n·d = 0.000" for nine and a half seconds while the only line on screen was labelled d′ — a hardcoded row label whose justifying comment quoted a fact about concept data, which an authoring rename had already falsified',
    severity: 'CRITICAL',
    owner_cluster: 'peter_parker:field3d_surgeon',
    root_cause:
      'VG_READOUT_LABEL.d_dot_n (' + R + ', resolve by symbol) was the constant string "n·d", and the comment above the '
      + 'intersection publish site in vgResolveLinesPlanes justified that constant by quoting a fact about CONCEPT DATA: '
      + '"the four tokens below are NAMES, not addresses ... and on the state this exists for, both lines carry the same generic '
      + 'label d". It was true the day it was written. A Checkpoint-B cycle-1 AUTHORING fix then renamed lines_and_planes_in_space '
      + 'STATE_4\'s parallel line to d′ — to cure a DIFFERENT defect, two lines both labelled d — and falsified the premise. '
      + 'Nothing recomputed the constant, because a constant has no link back to the data its comment depends on, and nothing '
      + 'failed: every frame stayed internally consistent, so no gate, no type, no validator and no baseline had anything to catch. '
      + 'WHAT SHIPPED, on the concept\'s MISCONCEPTION state (declared belief: "n·d = 0 means the line is perpendicular to the '
      + 'plane"): for the first 9.5 s the panel printed "n·d = 0.000" while the only line drawn was labelled d′ and no line called d '
      + 'existed yet; then at t≈17500 the SAME constant printed "n·d = 0.574" for the OTHER line, the one actually labelled d. One '
      + 'symbol, two lines, one state — and attaching that arithmetic to the right line is the state\'s entire job. A student '
      + 'holding the misconception saw the number the state exists to explain, tied by name to a line that was not on screen. '
      + 'WHY EVERY GATE MISSED IT: the value was arithmetically right at both instants (THE CALCULATOR is satisfied); the reveal '
      + 'gating was right (the number waited correctly for its own intersection); the settled frame is right (from t≥10300 the '
      + 'subject IS the line labelled d, which is why the frozen baseline STATE_4__frozen.png looks fine and why every spot check '
      + 'that samples a pin sees nothing); and THE EYE has no committed baseline for this concept, so H2 skips. The defect lives '
      + 'entirely in the WINDOW between two reveals, in a name rather than a number. '
      + 'THE FAMILY: this is the fifth recorded instance in this one concept of a file holding a value that is a FUNCTION of a value '
      + 'in another file, with the link recorded only in prose — alongside '
      + 'concept_formula_surface_names_an_object_the_scene_never_labels, '
      + 'readout_introduces_a_symbol_the_scene_never_labels_because_the_gate_treats_the_hud_only_as_a_place_a_symbol_is_satisfied, '
      + 'skeleton_pacing_table_drifts_from_the_shipped_json_on_a_state_the_state_table_describes_correctly, and '
      + 'label_separation_is_a_function_of_the_authored_camera_and_no_gate_recomputes_it_when_the_camera_moves. In every one of them '
      + 'the derivation was performed once, the result was written down as a literal, and the dependency survived only as English. '
      + 'FIXED 2026-08-21: vgDotLabelText(fixedSym, subjectLabel, fallbackSym) derives the row\'s name from the AUTHORED LABEL of the '
      + 'subject the resolver actually described this frame, published into out.readout_labels at the SAME STATEMENT as the value so '
      + 'name and number can never separate; vgReadoutLine prefers that per-frame bag over the table. The one-subject-at-a-time '
      + 'invariant already in the resolver is what makes the name answerable at all — exactly one intersection is arrived, so its '
      + 'line\'s label is the honest name for the number beside it. The constant stays in VG_READOUT_LABEL as the UNLABELLED-SUBJECT '
      + 'fallback (a token with no label breaks the §11c union check, and an unlabelled authored object must still get a name, never '
      + 'a dangling operator). SCOPE, asserted rather than assumed: the bag is populated ONLY inside the lines_planes mode gate, so '
      + 'in products mode it is absent and every row renders its table constant — vector_products_in_space cannot see this fix.',
    prevention_rule:
      'A DISPLAY LABEL THAT NAMES AN AUTHORED OBJECT IS DERIVED FROM THAT OBJECT\'S AUTHORED LABEL, NEVER FROM A CONSTANT. A constant '
      + 'is legal only for a token whose subject can never be renamed, because the quantity IS the name (|a|, θ, λ, "distance"). If '
      + 'the row says "n·<something>", the <something> is read from the thing on screen, at the same statement that publishes the '
      + 'number, so the two cannot drift apart. '
      + 'AND THE TRANSFERABLE HALF: A CODE COMMENT THAT JUSTIFIES A LITERAL BY QUOTING A FACT ABOUT CONCEPT DATA IS AN UNDECLARED '
      + 'DEPENDENCY ON THAT DATA. "This is safe because both lines carry the label d" is a derivation performed once and then thrown '
      + 'away; prose cannot be re-run when the data moves, and the authoring team that renames the line has no way to know the '
      + 'sentence exists. When a comment states a data fact to defend a value, DERIVE FROM THE DATA INSTEAD — and where deriving at '
      + 'runtime is genuinely impossible, record the dependency in a machine-readable form founder_proxy has already proposed, '
      + 'derived_from: { source, field, value_at_authoring }, so a sweep can re-evaluate it and fail loudly when the source moves. '
      + 'THE COROLLARY THIS SAME ROUND PRODUCED, in the gate rather than the engine: a verbatim JSON.stringify snapshot of authoring '
      + 'embedded in a check script is the same defect wearing a green badge. It is a copy whose link to its source is prose, it '
      + 'hard-fails on every legitimate authoring edit (two of them went red here the moment a json-author run added a decorative '
      + 'size-0 label point), and a gate that cries wolf gets refreshed by reflex instead of read. Assert a fixture against WHAT THE '
      + 'SECTION MEASURES — for a readout probe, that the shipped driver publishes a byte-identical panel from the fixture and from '
      + 'the file; for a control probe, that the live-knob matrix matches — never against the file\'s bytes. '
      + 'FINALLY: A ROW LABEL IS ONLY VERIFIABLE INSIDE ITS OWN REVEAL WINDOW. Sampling the frozen pin or the settled frame is '
      + 'structurally blind to this class, because by then the subject usually IS the one the constant names. Sweep every authored '
      + 'reveal window and read the NAME, not just the number.',
    probe_type: 'js_eval',
    probe_logic:
      'check:vector-geometry-3d §31 (' + G + '). THE DISCRIMINATING QUANTITY IS THE ROW\'S LABEL MEASURED AGAINST THE AUTHORED LABEL '
      + 'OF THE SUBJECT THE FAMILY IS DESCRIBING, sampled inside EVERY authored reveal window — never the value (0.000 and 0.574 were '
      + 'both arithmetically right), never the reveal gating (§19b/§23 are green on the defect), and never the settled frame alone. '
      + 'THE SUBJECT IS DERIVED FROM THE AUTHORING, never from the label bag the fix introduces: the probe walks the authored '
      + 'intersections with the SHIPPED reveal gate (vgRevealFrac/vgArrived), finds the ONE whose window contains the sample, and '
      + 'reads the authored label off the line THAT intersection names — a probe that read out.readout_labels would be a restatement '
      + 'of the fix. The panel is composed through the SHIPPED frame driver, and the stand-in is proved faithful by byte-comparing it '
      + 'to the driver\'s own output at t=5600 and t=17500 before any claim is made. '
      + 'ASSERTS: (1) a dense sweep 0-24000 ms at 100 ms — a d_dot_n row exists at exactly the 215 instants where ONE subject is '
      + 'arrived and at none of the 26 handover instants, and every one of the 215 wears its own subject\'s authored name; (2) during '
      + 'the parallel window the panel never wears the OTHER line\'s name; (3) STATE_2\'s n_dot_v family names its segment at all 9 '
      + 'samples across both authored windows, still printing "n·v" (both segments are authored "v", so this fix changes not one '
      + 'pixel of STATE_2) over a real moving number (t=8000 "n·v = 0.000", t=13000 "n·v = 0.684"); (4) RENAMING the second segment '
      + 'to "w" moves the row with it — "n·w" at t=13000 while the first window still reads "n·v" — which is the whole claim, tested '
      + 'directly; (5) an unlabelled subject falls back to the generic name, never a dangling operator; (6) Rule 34c — the derived '
      + 'text is real Unicode (U+00B7, U+2032), never an ASCII apostrophe or dot. '
      + 'NEGATIVE CONTROL: the PRE-FIX build, planted by deleting the resolver\'s label publish (guarded — the plant is asserted to '
      + 'produce NO derived name for d_dot_n, so the constant genuinely renders). It prints "n·d = 0.000" at t=5600 beside a line '
      + 'labelled d′, is WRONG AT EVERY ONE OF THE 7 SAMPLES of that window rather than one unlucky instant, and is CORRECT from '
      + 't=10300 on — reproducing, as a measurement, why a settled-frame or frozen-pin probe sees nothing. '
      + 'SCOPE CONTROL: at 6 instants across both states every published VALUE is bit-identical across the pre-fix and shipped builds '
      + '(the change is a name and only a name); a products-mode frame never enters the resolver (PM_vgLinesPlanes === null) and all '
      + 'five products rows render their table labels unchanged. '
      + 'FIXTURE FIDELITY (clause f, advisory where the concept is not on the desk): the two transcribed states are asserted to MODEL '
      + 'the shipped authoring — same subject spine (every id, label, readout token and reveal window the probe resolves a subject '
      + 'from) and a byte-identical readout panel out of the shipped driver at all 241 samples — deliberately NOT a verbatim '
      + 'JSON.stringify of the file, which is the same prose-linked-copy defect this row is about. Plus a sweep of EVERY authored '
      + 'state: no state that prints a dot-product row may print it under a name its own subject does not carry.',
    status: 'FIXED',
    concepts_affected: ['lines_and_planes_in_space', 'vector_products_in_space'],
    fixed_in_files: [R, G],
    discovered_in_session: SESSION,
    row_type: 'incident',
    fixed_at: FIXED_AT,
    marker: 'RENAMING the second segment to "w" moves the row with it',
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
  return `-- 2026-08-21 — THE READOUT ROW'S NAME vs THE OBJECT IT MEASURES (F1 on the\n` +
    `-- lines_and_planes_in_space desk). ${ROWS.length} new row, filed already FIXED.\n` +
    `-- A Rule-40 platform change to ${R}.\n` +
    `-- Gate: check:vector-geometry-3d §31 (ALL SECTIONS PASSED, negative control fires).\n` +
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
    'supabase_2026-08-21_seed_engine_bug_queue_vg_readout_subject_label_migration.sql');
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
