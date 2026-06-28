/**
 * Seed engine_bug_queue with the Telugu (te-IN) TTS pronunciation defect the
 * founder caught on electric_potential_meaning STATE_6 ("V ఒక scalar" read as
 * "we oka scalar"; "Equal-V points" garbled). Status OPEN — fix approach being
 * A/B-tested with the founder; flip to FIXED once the approach lands + regens.
 *
 * Also (re)writes the archival SQL migration.
 * Run: npx tsx --env-file=.env.local src/scripts/_seed_engine_bug_queue_tts_telugu_pronunciation.ts
 */
import '@/lib/loadEnvLocal';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const SESSION = 'session_2026-06-27_tts_telugu_pronunciation';

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

const incidents: Row[] = [
  {
    bug_class: 'tts_codemix_telugu_mispronounces_inline_english',
    title: 'Telugu (te-IN) stored TTS mispronounces inline Latin-script English in code-mixed narration — single letters ("V" → "we" not "vee", "E"), hyphen-joined compounds ("Equal-V"), and scattered English tokens read unnaturally',
    severity: 'MAJOR',
    owner_cluster: 'ambiguous',
    root_cause: 'The multilingual stored-audio narration keeps physics/technical terms in English (Telgish, by design) and feeds that code-mixed text straight to Sarvam Bulbul te-IN. The te-IN voice does NOT reliably pronounce romanized English embedded in Telugu: standalone single capital letters are the worst ("V" comes out like "we" instead of "vee", "E" mis-stressed), hyphen-joined mixed compounds ("Equal-V points") garble, and dense English fragments ("drawn", "point") read with a wrong accent. Caught by the founder on electric_potential_meaning STATE_6 s6_4 ("V ఒక scalar, ... Equal-V points ..."). Systemic across all te-IN narration (Telugu is worse than hi-IN here). The caption text and the spoken text are currently the SAME field (text_te), so making the spoken form pronounceable also changes the displayed caption unless the two are separated.',
    prevention_rule: 'For Telugu/Hindi STORED TTS, the SPOKEN text must be pronounceable by the te-IN/hi-IN voice: (1) transliterate standalone single Latin letters + symbol-names to target-script phonetics (V→వీ / वी, E→ఈ / ई, q→క్యూ / क्यू, W→డబ్ల్యూ); (2) avoid hyphen-joined English compounds — reword (e.g. "Equal-V points" → "ఒకే V విలువ ఉన్న points" / a natural phrase); (3) prefer a SEPARATE spoken-text field from the English-term caption so readability and pronunciation are both satisfied; (4) ALWAYS founder/native-listen a per-language sample before bulk generation, and consider bulbul:v3 voices. RESOLVED 2026-06-28: the real fix was (a) bulbul:v3 / priya (NOT transliteration — Sarvam docs state transliteration REDUCES quality; v3 is built for code-mixing / Romanized text / abbreviations and pronounces inline English natively), and (b) expanding bare single-letter symbols to full names in the SPOKEN narration (E→electric field E, V→potential V, B→magnetic field B, I→current I, F→force F, ...) for clarity + unambiguous pronunciation — applied across all 27 field_3d diamonds, all 3 langs. Approach (1) above (transliterate to target script) is SUPERSEDED for v3. New rule candidate (Rule 30) for CLAUDE.md.',
    probe_type: 'manual',
    probe_logic: 'Listen to a Telugu state containing single letters/symbols (e.g. electric_potential_meaning STATE_6 "V ఒక scalar"): every English letter/term must be pronounced correctly (V = "vee", not "we"), no garbled hyphen compounds. A/B candidate clips live at review-site/_tts_candidates/ (A=current, B=transliterated-fix, C/D=bulbul:v3).',
    status: 'FIXED',
    concepts_affected: ['electric_potential_meaning'],
    fixed_in_files: [
      'src/scripts/generate_tts_audio.ts (default model→bulbul:v3, speaker→priya; AbortSignal.timeout(30000) on fetch; 6 retries)',
      'src/data/concepts/*.json (bare single-letter symbols expanded to full names in tts_sentences, all 3 langs, 27 diamonds)',
    ],
    row_type: 'incident',
  },
];

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
-- 2026-06-27: Telugu te-IN TTS pronunciation defect (code-mixed inline English) —
-- founder-caught on electric_potential_meaning STATE_6. status OPEN.
-- Generated by src/scripts/_seed_engine_bug_queue_tts_telugu_pronunciation.ts.
-- ============================================================================

INSERT INTO engine_bug_queue (${cols}) VALUES
${all.map(sqlRow).join(',\n')}
ON CONFLICT (bug_class) DO NOTHING;
`;
}

async function main(): Promise<void> {
  const sqlPath = join(process.cwd(), 'supabase_2026-06-27_seed_engine_bug_queue_tts_telugu_pronunciation_migration.sql');
  writeFileSync(sqlPath, emitSql(incidents), 'utf-8');
  console.log(`Wrote archival SQL: ${sqlPath}`);

  const payload = incidents.map((r) => ({ ...r, discovered_in_session: SESSION }));
  const { error } = await supabaseAdmin.from('engine_bug_queue').upsert(payload, { onConflict: 'bug_class' });
  if (error) { console.error(`  ✗ upsert failed: ${error.message}`); process.exit(1); }
  console.log(`  ✓ upserted ${incidents.length} row(s)`);

  const { data, error: e2 } = await supabaseAdmin
    .from('engine_bug_queue').select('bug_class, status, severity').eq('discovered_in_session', SESSION);
  if (e2) { console.error('verify failed:', e2.message); return; }
  for (const row of data ?? []) console.log(`  [${row.severity}] ${row.status}  ${row.bug_class}`);
}

main().catch((err) => { console.error('💥 seed failed:', err instanceof Error ? err.stack : err); process.exit(1); });
