/**
 * Seed engine_bug_queue with the scar from the SECOND founder review of
 * parallel_currents_force (screen recording 26.06.2026_20.55.59_REC).
 *
 * The first review asked for *a* right-hand on the force state; we shipped a
 * STATIC stylised hand (createRightHand) whose fingers are a baked, rigid curl
 * and which only re-orients its thumb toward F each frame. The founder's second
 * review asks for the hand to actually PERFORM the right-hand rule: fingers
 * point along I₂ (current up), CURL into the page toward B₁, thumb gives F —
 * slowing and PAUSING at each of I, B, F with the matching quantity highlighted.
 *
 * Status starts OPEN (logged before the fix, per the recording→engine_bug_queue
 * protocol); flipped to FIXED once THE EYE confirms the choreography.
 *
 * Idempotent: upsert onConflict 'bug_class'. Also writes the archival SQL.
 *
 * Run: npx tsx --env-file=.env.local src/scripts/_seed_engine_bug_queue_pcf_rhr_animation.ts
 */
import '@/lib/loadEnvLocal';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const SESSION = 'session_2026-06-26_parallel_currents_force_rhr_animation';

type Owner =
  | 'alex:architect' | 'alex:physics_author' | 'alex:json_author'
  | 'peter_parker:renderer_primitives' | 'peter_parker:runtime_generation'
  | 'peter_parker:visual_validator' | 'ambiguous';
type Severity = 'CRITICAL' | 'MAJOR' | 'MODERATE';
type Status = 'OPEN' | 'FIXED' | 'DEFERRED' | 'NOT_REPRODUCING' | 'FALSE_POSITIVE';
type ProbeType = 'sql' | 'js_eval' | 'manual' | 'vision_model';
type RowType = 'incident' | 'directive';

interface Row {
  bug_class: string; title: string; severity: Severity; owner_cluster: Owner;
  root_cause: string; prevention_rule: string; probe_type: ProbeType; probe_logic: string;
  status: Status; concepts_affected: string[]; fixed_in_files: string[]; row_type: RowType;
}

const R: Owner = 'peter_parker:renderer_primitives';
const RENDERER = ['src/lib/renderers/field_3d_renderer.ts'];

const incidents: Row[] = [
  {
    bug_class: 'field3d_rhr_hand_static_no_curl_choreography',
    title: 'Force-rule right-hand was STATIC (rigid baked curl, thumb-tracks-F only) instead of an animated I→B→F demonstration that pauses and highlights at each beat (founder 2nd review)',
    severity: 'MAJOR',
    owner_cluster: R,
    root_cause:
      'parallel_currents_force STATE_3 built its right-hand with createRightHand() — the simple stylised hand whose four fingers are a baked, rigid quarter-circle curl; the per-frame block only re-oriented the whole group so the thumb pointed along F. It never animated the finger curl, never sequenced I→B→F, never paused/dwelled, never highlighted the matching scene quantity, and showed no step labels. A fully articulated, choreographed hand (rhrFingerJoints FK + the lorentz_hand v→B→F animate-loop choreography with SET_HAND_PHASE freeze) already existed but ran ONLY for elementType==="lorentz_hand", so the pcf hand (pcf_rhr_hand) was excluded. Founder (recording 26.06.2026_20.55.59) pen-annotated the hand asking it to slowly point fingers along the current (charge Q up), curl into the page toward B1, then thumb→F, pausing at each of I, B, F.',
    prevention_rule:
      'A state that teaches a cross-product DIRECTION (F = I L × B, F = q v × B, B = ...) must ship the ARTICULATED, choreographed right-hand (real finger-curl via rhrFingerJoints, a slow dwelling I→B→F cycle with a clear pause at each beat, per-beat brightness highlight of the matching scene vector per Rule 29, the embedded I/B/F arrows+labels, and short step captions), oriented from the scenario geometry — not a static mesh that only points its thumb. Reuse the buildArticulatedHandParts + the lorentz choreography pattern for every new RHR hand; do not fall back to the rigid createRightHand.',
    probe_type: 'manual',
    probe_logic:
      'On a cross-product force/field state, scrub the frozen/dense frames: the fingers must visibly transition flat-along-I → curled-into-B → thumb-along-F across the state clock (not a single fixed pose), with the matching scene element (current arrow / B vector / force arrow) brightened on its beat and a short step label present. A hand whose finger geometry is identical across all frames is the static-hand regression.',
    status: 'FIXED',
    concepts_affected: ['parallel_currents_force'],
    fixed_in_files: RENDERER,
    row_type: 'incident',
  },
];

function sqlStr(s: string): string { return `'${s.replace(/'/g, "''")}'`; }
function sqlArr(a: string[]): string { return a.length === 0 ? `ARRAY[]::text[]` : `ARRAY[${a.map(sqlStr).join(', ')}]`; }
function sqlRow(r: Row): string {
  return `(${sqlStr(r.bug_class)}, ${sqlStr(r.title)}, ${sqlStr(r.severity)}, ${sqlStr(r.owner_cluster)}, ` +
    `${sqlStr(r.root_cause)}, ${sqlStr(r.prevention_rule)}, ${sqlStr(r.probe_type)}, ${sqlStr(r.probe_logic)}, ` +
    `${sqlStr(r.status)}, ${sqlArr(r.concepts_affected)}, ${sqlArr(r.fixed_in_files)}, ${sqlStr(SESSION)}, ${sqlStr(r.row_type)})`;
}
function emitSql(all: Row[]): string {
  const cols = 'bug_class, title, severity, owner_cluster, root_cause, prevention_rule, probe_type, probe_logic, status, concepts_affected, fixed_in_files, discovered_in_session, row_type';
  return `-- 2026-06-26: engine_bug_queue scar from the 2nd founder review of parallel_currents_force (RHR animation).\n` +
    `-- Generated by src/scripts/_seed_engine_bug_queue_pcf_rhr_animation.ts — idempotent.\n\n` +
    `INSERT INTO engine_bug_queue (${cols}) VALUES\n${all.map(sqlRow).join(',\n')}\n` +
    `ON CONFLICT (bug_class) DO UPDATE SET status = EXCLUDED.status, root_cause = EXCLUDED.root_cause,\n` +
    `  prevention_rule = EXCLUDED.prevention_rule, fixed_in_files = EXCLUDED.fixed_in_files;\n`;
}

async function main(): Promise<void> {
  const sqlPath = join(process.cwd(), 'supabase_migrations', 'supabase_2026-06-26_seed_engine_bug_queue_pcf_rhr_animation_migration.sql');
  writeFileSync(sqlPath, emitSql(incidents), 'utf-8');
  console.log(`Wrote archival SQL: ${sqlPath}`);
  const payload = incidents.map((r) => ({ ...r, discovered_in_session: SESSION }));
  const { error } = await supabaseAdmin.from('engine_bug_queue').upsert(payload, { onConflict: 'bug_class' });
  if (error) { console.error(`✗ upsert failed: ${error.message}`); process.exit(1); }
  console.log(`✓ ${incidents.length} scar row(s) upserted (status=${incidents[0].status})`);
}

main().catch((err) => { console.error('💥 seed failed:', err instanceof Error ? err.stack : err); process.exit(1); });
