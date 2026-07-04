/**
 * Seed engine_bug_queue with the narration-smoothness ledger from the founder
 * screen-recording review of parallel_currents_force (recorded 26.06.2026): at
 * every sentence boundary a fragment of a DIFFERENT statement was briefly spoken
 * before the correct line. Two bug CLASSES, both player-wide (every review-site
 * concept), fixed together by moving narration to pre-generated stored Sarvam
 * audio clips + holding the just-finished sentence through the breathing gap.
 *
 * Also (re)writes the archival SQL migration so the repo carries the record:
 *   supabase_2026-06-27_seed_engine_bug_queue_narration_smoothness_migration.sql
 *
 * Idempotent: upsert onConflict 'bug_class'.
 * Run: npx tsx --env-file=.env.local src/scripts/_seed_engine_bug_queue_narration_smoothness.ts
 */
import '@/lib/loadEnvLocal';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const SESSION = 'session_2026-06-27_narration_smoothness';

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

const R: Owner = 'peter_parker:renderer_primitives';
const PLAYER = ['src/scripts/build_review_site.ts'];
// Player-wide defect (affects every review-site concept); caught on this concept.
const CONCEPT = ['parallel_currents_force'];

const incidents: Row[] = [
  {
    bug_class: 'narration_activesi_gap_returns_last_sentence',
    title: 'Review-site player jumps to the LAST sentence of the state during every inter-sentence gap — a fragment of a DIFFERENT statement is spoken + captioned at each boundary, then snaps back',
    severity: 'MAJOR',
    owner_cluster: R,
    root_cause: 'In the build_review_site.ts inline player, activeSiAt(t) maps the clock to the active sentence by scanning each sentence window [start,end). Between sentences computeTimeline() inserts a GAP_MS=280ms breathing gap, during which t matches NO window, so the loop fell through to "return timeline[timeline.length-1].si" — the LAST sentence of the state. The reveal loop (LOOP_MS=90ms) sampled that gap ~3 times per boundary, so applyReveal() repainted the caption AND playCurrent()/speakCurrent() spoke the FINAL sentence for ~280ms, then snapped back when the next window opened. On 3+ sentence states the first gap leapt straight to the last line. This is player-wide (every review-site concept), caught by the founder on parallel_currents_force.',
    prevention_rule: 'In a clock→sentence mapper with inter-sentence gaps, NEVER fall through to the last index. During a gap (or past the end) HOLD the most-recently-STARTED sentence (track held = the last si whose start <= t). A breathing gap must keep the just-finished sentence on screen/in-ear, not jump anywhere.',
    probe_type: 'manual',
    probe_logic: 'On a state with 3+ sentences, watch the boundary between sentence 1 and 2: the caption must hold sentence 1 through the ~280ms gap (never flash the final sentence) and audio must not blurt a different line. Repeat muted to confirm the visual alone is smooth.',
    status: 'FIXED',
    concepts_affected: CONCEPT,
    fixed_in_files: PLAYER,
    row_type: 'incident',
  },
  {
    bug_class: 'narration_cancel_speak_race_browser_tts',
    title: 'Review-site narration used browser speechSynthesis with cancel()+speak() at every boundary — a flaky Chrome combo that clips the new utterance / replays the tail of the cancelled one (stutter on top of the wrong-statement jump)',
    severity: 'MODERATE',
    owner_cluster: R,
    root_cause: 'The review-site player narrated via window.speechSynthesis (browser Web Speech), and speakCurrent() called speechSynthesis.cancel() immediately followed by speak() on every sentence change. cancel()-then-speak() is a well-known flaky path in Chrome: the new utterance can be dropped, clipped at the start, or the cancelled utterance\'s tail can briefly continue. It also made narration non-deterministic (depended on the device\'s installed voices) and could not be multilingual.',
    prevention_rule: 'Do NOT drive verified narration through browser speechSynthesis. Use PRE-GENERATED stored audio clips (Sarvam) played via a SINGLE reused <audio> element, always stopAudio() (pause + rewind) before setting src + play() so overlap is structurally impossible. Clock-driven sequencing (Rule 26) stays the source of truth; audio is a passenger. This also unlocks EN/HI/TE narration (Rule 13).',
    probe_type: 'manual',
    probe_logic: 'Narration plays identically every run with no clip/stutter at sentence boundaries; the emitted player contains no window.speechSynthesis / SpeechSynthesisUtterance; switching language and scrubbing across a gap never produces overlapping audio.',
    status: 'FIXED',
    concepts_affected: CONCEPT,
    fixed_in_files: PLAYER,
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
-- 2026-06-27: seed engine_bug_queue with the narration-smoothness ledger from the
-- founder screen-recording review of parallel_currents_force (recorded 26.06.2026).
-- Two player-wide bug CLASSES, status FIXED. Generated by
-- src/scripts/_seed_engine_bug_queue_narration_smoothness.ts.
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
  const sqlPath = join(process.cwd(), 'supabase_migrations', 'supabase_2026-06-27_seed_engine_bug_queue_narration_smoothness_migration.sql');
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
