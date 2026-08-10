/**
 * engine_bug_queue row for the nlb real-minus fix.
 *
 * ONE row, an UPDATE (reopen -> FIXED) of an EXISTING OPEN bug_class, not a new
 * incident: `nlbenfx_emits_ascii_hyphen_...` was already filed MODERATE/OPEN
 * against peter_parker:field3d_surgeon. Verified by SELECT before writing, so
 * this is an upsert on the existing key and mints no duplicate.
 *
 * It IS a recurrence of an older, already-FIXED class —
 * `ascii_minus_in_oncanvas_math_from_tofixed` (owner alex:json_author) — which is
 * why the root_cause below records the recurrence and the prevention_rule moves
 * the check from "sweep the strings" to "sweep the FORMATTERS".
 *
 * Idempotent: upsert onConflict 'bug_class'. Run:
 *   npx tsx --env-file=.env.local src/scripts/_seed_engine_bug_queue_nlb_real_minus.ts
 */
import '@/lib/loadEnvLocal';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const SESSION = 'session_2026-08-08_nlb_real_minus_formatter';

type Owner =
  | 'alex:architect' | 'alex:physics_author' | 'alex:json_author'
  | 'peter_parker:field3d_surgeon' | 'peter_parker:renderer_primitives'
  | 'peter_parker:runtime_generation' | 'ambiguous';
type Severity = 'CRITICAL' | 'MAJOR' | 'MODERATE';
type Status = 'OPEN' | 'FIXED' | 'DEFERRED' | 'NOT_REPRODUCING' | 'FALSE_POSITIVE';
type ProbeType = 'sql' | 'js_eval' | 'manual' | 'vision_model';
type RowType = 'incident' | 'probe_definition' | 'directive';

interface Row {
  bug_class: string; title: string; severity: Severity; owner_cluster: Owner;
  root_cause: string; prevention_rule: string; probe_type: ProbeType; probe_logic: string;
  status: Status; concepts_affected: string[]; fixed_in_files: string[]; row_type: RowType;
}

const RENDERER = 'src/lib/renderers/field_3d_renderer.ts';
const HARVEST = 'src/lib/validators/numeric/readoutHarvest.ts';
const HARVEST_TEST = 'src/lib/validators/numeric/__tests__/readoutParse.test.ts';

const rows: Row[] = [
  {
    bug_class: 'nlbenfx_emits_ascii_hyphen_so_engine_numerals_and_authored_formula_disagree_on_the_minus_sign',
    title: 'The authored formula surface renders U+2212 while every engine-formatted numeral beside it renders U+002D, so one line of one overlay carries two different minus signs',
    severity: 'MODERATE',
    owner_cluster: 'peter_parker:field3d_surgeon',
    root_cause:
      'FIXED 2026-08-08. Both nlb numeral formatters built their string with Number.prototype.toFixed, whose sign is U+002D (ASCII hyphen), while every authored formula surface in the same file carries U+2212 (real minus) per Rule 34c — so an overlay that stacks an authored base over an engine numeral shows two different minus glyphs at once. Proven from the live harvest of work_energy_theorem, where ONE captured string held both: "ΔK = ½mv² − ½mv₀² start: v = -3.00 m/s". '
      + 'SCOPE NOTE: the reported symbol was nlbEnFx (the work/energy bar values), but nlbCpStampText composes a checkpoint line out of BOTH nlbEnFx and nlbFx, so fixing only the energy formatter would have left the defect alive on the exact overlay it was reported against, merely relocated to the v/s terms. Both formatters were therefore routed through one nlbMinus() helper (same file, same root cause — the Amendment-4 exception). '
      + 'RECURRENCE of the already-FIXED class ascii_minus_in_oncanvas_math_from_tofixed: that fix corrected the authored/emitted STRINGS of the day and left the formatters alone, so the next formatter written re-introduced the class. '
      + 'COUPLED CONSUMER (the part that makes this more than cosmetic): THE CALCULATOR harvests these numerals through the DOM and parsed them with an ASCII-only sign class ([+-]) in NUMBER_RE, CHIP_RE and the two in-page sibling-composition predicates. Changing the glyph alone would have made every negative reading fail to parse — and the failure mode is SILENT (the reading does not come back wrong, it does not come back at all), so the numeric gate would have gone blind to dissipated work and net work, the two values a work-energy concept is most likely to get wrong, while still reporting a green run. Both sides were changed together and harvest parity was measured: 45 readings / 5 negative before, 45 readings / 5 negative after, same values.',
    prevention_rule:
      'Rule 34c applies to engine-EMITTED numerals, not only to authored strings, and the substitution belongs in the FORMATTER, never at the call site: a sweep that fixes call sites re-breaks on the next call site written, which is exactly how this class recurred. '
      + 'Corollary, and the more expensive half: before changing any rendered glyph, find every consumer that parses that text back into a number and widen it in the SAME commit. A rendered-text change is an interface change. THE CALCULATOR (readoutHarvest.ts) is the standing consumer for both live renderers; its sign class is [-+\\u2212] and must stay that way. '
      + 'Any new field_3d numeral formatter routes through a minus-substituting helper (nlbMinus is the reference), and a placeholder dash (U+2013 en dash, "R = –") must NOT be widened into the sign class — it is not a number.',
    probe_type: 'js_eval',
    probe_logic:
      'Renderer side — assert no visible on-canvas numeral carries U+002D at a digit boundary: in the sim frame, collect the direct text of every visible element plus every sprite _pmText, and fail on /(^|[\\s=(])-\\d/ . The authored-vs-engine disagreement is caught by the STRONGER form: for each single overlay element, fail if its text contains BOTH U+002D and U+2212. '
      + 'Consumer side — unit-level and cheaper: readoutParse.test.ts now asserts that "W friction = −8.4 J" and the chip form "net −40.0 J" parse to -8.4 and -40. Negative control performed: reverting SIGN_CLASS to [-+] fails both with "expected [] to deeply equal [...]", i.e. the empty-result signature of a silently blinded gate. '
      + 'Regression form — run numeric:calc before and after any glyph change on a concept that paints negatives and compare the READING COUNT, not just the assertion headline; an unchanged headline with a dropped negative reading is the failure this class produces.',
    status: 'FIXED',
    concepts_affected: [
      'work_energy_theorem', 'positive_negative_zero_work', 'kinetic_energy_definition',
      'conservative_vs_nonconservative_forces',
    ],
    fixed_in_files: [RENDERER, HARVEST, HARVEST_TEST],
    row_type: 'incident',
  },
];

function sqlStr(s: string): string { return `'${s.replace(/'/g, "''")}'`; }
function sqlArr(a: string[]): string {
  return a.length ? `ARRAY[${a.map(sqlStr).join(', ')}]::text[]` : `ARRAY[]::text[]`;
}
function sqlRow(r: Row): string {
  return `(${sqlStr(r.bug_class)}, ${sqlStr(r.title)}, ${sqlStr(r.severity)}, ${sqlStr(r.owner_cluster)}, ` +
    `${sqlStr(r.root_cause)}, ${sqlStr(r.prevention_rule)}, ${sqlStr(r.probe_type)}, ${sqlStr(r.probe_logic)}, ` +
    `${sqlStr(r.status)}, ${sqlArr(r.concepts_affected)}, ${sqlArr(r.fixed_in_files)}, ${sqlStr(SESSION)}, ${sqlStr(r.row_type)})`;
}
function emitSql(all: Row[]): string {
  const cols = 'bug_class, title, severity, owner_cluster, root_cause, prevention_rule, probe_type, probe_logic, status, concepts_affected, fixed_in_files, discovered_in_session, row_type';
  return `-- 2026-08-08: nlb numeral formatters emit the REAL minus (U+2212), and THE\n` +
    `-- CALCULATOR's harvest parser was widened in the same change so the numeric gate\n` +
    `-- is not silently blinded to every negative reading.\n` +
    `-- UPDATE of an existing OPEN row (upsert by bug_class) — not a new incident.\n` +
    `-- Generated by src/scripts/_seed_engine_bug_queue_nlb_real_minus.ts — idempotent.\n\n` +
    `INSERT INTO engine_bug_queue (${cols}) VALUES\n${all.map(sqlRow).join(',\n')}\n` +
    `ON CONFLICT (bug_class) DO UPDATE SET status = EXCLUDED.status, root_cause = EXCLUDED.root_cause,\n` +
    `  prevention_rule = EXCLUDED.prevention_rule, probe_logic = EXCLUDED.probe_logic,\n` +
    `  probe_type = EXCLUDED.probe_type, title = EXCLUDED.title, severity = EXCLUDED.severity,\n` +
    `  owner_cluster = EXCLUDED.owner_cluster, concepts_affected = EXCLUDED.concepts_affected,\n` +
    `  fixed_in_files = EXCLUDED.fixed_in_files,\n` +
    `  fixed_at = CASE WHEN EXCLUDED.status = 'FIXED' THEN now() ELSE engine_bug_queue.fixed_at END;\n`;
}

async function main(): Promise<void> {
  const sqlPath = join(process.cwd(), 'supabase_migrations', 'supabase_2026-08-08_seed_engine_bug_queue_nlb_real_minus_migration.sql');
  writeFileSync(sqlPath, emitSql(rows), 'utf-8');
  console.log(`Wrote archival SQL: ${sqlPath} (${rows.length} row(s))`);

  const payload = rows.map((r) => ({
    ...r,
    discovered_in_session: SESSION,
    fixed_at: r.status === 'FIXED' ? new Date().toISOString() : null,
  }));
  const { error } = await supabaseAdmin.from('engine_bug_queue').upsert(payload, { onConflict: 'bug_class' });
  if (error) { console.error(`✗ upsert failed: ${error.message}`); process.exit(1); }
  console.log(`✓ ${rows.length} row(s) upserted (1 FIXED — an UPDATE of an existing OPEN key)`);
}

main().catch((err) => { console.error('💥 seed failed:', err instanceof Error ? err.stack : err); process.exit(1); });
