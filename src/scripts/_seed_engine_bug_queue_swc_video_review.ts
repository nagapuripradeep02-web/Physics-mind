/**
 * Seed engine_bug_queue with the recurring defect classes found in the founder's
 * 2026-07-03 screen recording of magnetic_field_concept_B (Rule 31 conversion,
 * concept #1 of the Ch.4 migration). These are CLASS defects likely to recur
 * across all 13 Ch.4 conversions — each carries a prevention rule so the bar
 * lifts for the rest. OPEN now; flipped to FIXED after the polish pass + re-review.
 *
 * Idempotent: upsert onConflict 'bug_class'. Also writes the archival SQL.
 * Run: npx tsx --env-file=.env.local src/scripts/_seed_engine_bug_queue_swc_video_review.ts
 */
import '@/lib/loadEnvLocal';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const SESSION = 'session_2026-07-03_ch4_concept1_video_review';

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

const JA: Owner = 'alex:json_author';
const RP: Owner = 'peter_parker:renderer_primitives';
const CONCEPT = 'magnetic_field_concept_B';
const JSON_FILE = 'src/data/concepts/magnetic_field_concept_B.json';
const RENDERER = 'src/lib/renderers/field_3d_renderer.ts';
const DSM = 'src/lib/validators/visual/deriveStateMeta.ts';

const incidents: Row[] = [
  {
    bug_class: 'field3d_states_share_identical_visible_elements_no_distinct_picture',
    title: 'All guided field_3d states declare the IDENTICAL visible_elements array, so every state renders the same picture (wire + full ring set) — the sim reads as "no action / nothing changes" (Rule 31 "no two states alike" violated)',
    severity: 'MAJOR',
    owner_cluster: JA,
    root_cause:
      'In magnetic_field_concept_B all 7 states listed the same visible_elements = ["wire_main","curr_arr","fl_wire","arr_wire"], and the swc scenario has no per-state ring-count/opacity selector, so STATE_1 (source), STATE_2 (compass), STATE_4 (fills space) and STATE_5 (vector field) all render an identical green ring stack around the wire. On the founder recording the states are visually indistinguishable — the teacher cannot tell one beat from the next ("no action properly"). Rule 31 requires every state to be a DISTINCT picture with distinct motion.',
    prevention_rule:
      'Every guided state must be a visibly DISTINCT picture — differentiate via per-state visible_elements token lists (hide/show whole elements, or list specific ring ids like fl_wire_1_0), a per-state ring-dim multiplier (focal emphasis), or a state-unique action (assemble / hop / fade-out). Before shipping, scrub the states side by side: if two guided states are pixel-similar with the same elements, the design has a duplicate-picture defect. Author distinctness in the architect per-state control table, not as an afterthought.',
    probe_type: 'manual',
    probe_logic:
      'Open THE EYE frozen frames for all guided states of a field_3d concept side by side. Any two guided states that look near-identical (same elements, same composition, no distinct focal action) are a duplicate-picture Rule 31 violation.',
    status: 'FIXED',
    concepts_affected: [CONCEPT],
    fixed_in_files: [JSON_FILE, RENDERER, DSM],
    row_type: 'incident',
  },
  {
    bug_class: 'field3d_compass_too_small_deflection_illegible',
    title: 'The compass disk (default radius 0.45) is too small relative to the field-ring scene, so the needle deflection — the entire teaching payoff of an Oersted/compass-reveal beat — is visually unreadable, and no focal emphasis brings it forward',
    severity: 'MAJOR',
    owner_cluster: JA,
    root_cause:
      'createCompass() defaults the disk radius to 0.45 and every state passed 0.45. Against the full 3-height ring stack, the compass is a tiny gray disk parked off to the side; the founder recording explicitly flags "I cannot understand the deflection." The needle swing amplitude is physics-correct (atan2 of the local B tangent) but simply too small on screen to read, and the rings are not dimmed to make the compass focal, and the camera does not frame it.',
    prevention_rule:
      'On any state whose teaching payoff IS a compass/needle deflection, the compass must be large enough to read (radius ~1.1-1.3, roughly 2.5x the 0.45 default) AND made focal — dim the surrounding field rings during the swing (per-state ring_dim multiplier, Rule 29 brightness/opacity not size) and frame it with a closer static camera. Never leave the deflection as a tiny disk in a busy ring field. Scale the compass sub-proportions (needle thickness, pivot, disk thickness) with the radius so a bigger compass does not render paper-thin.',
    probe_type: 'manual',
    probe_logic:
      'On a compass-deflection state, the needle must be clearly readable and the north→tangent swing unmistakable in the dense frames, with the rings visibly dimmed relative to the compass. A tiny compass lost among full-brightness rings is the defect.',
    status: 'FIXED',
    concepts_affected: [CONCEPT],
    fixed_in_files: [JSON_FILE, RENDERER, DSM],
    row_type: 'incident',
  },
  {
    bug_class: 'field3d_assemble_reveal_flat_single_height_not_3d',
    title: 'A "tangent arrows assemble into rings" reveal seeds all its scatter markers at one height/radius, so it reads as a single flat ring cross-dissolving rather than arrows appearing in 3D around the wire and coalescing — the reveal lacks drama/distinctness',
    severity: 'MODERATE',
    owner_cluster: RP,
    root_cause:
      'The swc rings_assemble path seeds 12 scatter mini-needles all at height 0 on the single orbit radius SWC_COMPASS_ORBIT_R=1.6, then does a pure opacity cross-dissolve in place while the real ring tubes (which span 3 heights [-1.5,0,1.5] x lineCount radii) fade in. So the "assembly" is a flat ring dissolving into a 3D stack, not arrows appearing throughout the surrounding space and coalescing. On the founder recording STATE_5 (the vector-field payoff) shows "no action" distinct from the ambient-ring states.',
    prevention_rule:
      'An assemble/coalesce reveal must seed its scatter markers across the SAME 3D extent (all heights x radii) as the target rings so arrows visibly appear AROUND the wire in space, then converge onto the ring paths as the tubes fade in. A single-height/single-radius scatter reads as a flat cross-dissolve and fails the "distinct dramatic action" bar. Positional convergence (markers slide onto the ring path) reads more clearly than opacity-only.',
    probe_type: 'manual',
    probe_logic:
      'On the assemble state, the pre-assembly dense frames must show scatter arrows distributed in 3D around the wire (multiple heights + radii), converging into the ring stack as it fades in. A flat single-ring of markers dissolving is the defect.',
    status: 'FIXED',
    concepts_affected: [CONCEPT],
    fixed_in_files: [JSON_FILE, RENDERER, DSM],
    row_type: 'incident',
  },
  {
    bug_class: 'field3d_guided_beats_too_long_not_lively',
    title: 'Rule 31 guided beats authored at ~30-35s run too long and un-lively — the founder wants tight ~18-22s beats where each state lands its action and moves on (supersedes the ~28-35s target)',
    severity: 'MODERATE',
    owner_cluster: JA,
    root_cause:
      'magnetic_field_concept_B guided states were authored at 30-34s (the old ~28-35s Rule 31 target). On the founder recording (4 min for 7 states) the pacing drags — each state holds long after its action completes, and some (STATE_3 "no field") sit nearly empty on black. Founder directive 2026-07-03: "make the state duration short and perfect and lively."',
    prevention_rule:
      'Guided field_3d beats target ~18-22s (not 28-35s): each state plays its distinct action then advances, with no long dead hold after the reveal completes. A near-empty "absence" state (field gone) should be the shortest (~15s) and still carry an ambient signal (needle settle), never a static black hold. Pull the reveal *_at_ms earlier so the payoff lands in the first half of the beat; keep deriveStateMeta sweep-addend constants synced with the renderer sweeps.',
    probe_type: 'manual',
    probe_logic:
      'Sum the guided-state durations: a 6-guided-state field_3d concept should run ~2 min, not ~3.5 min. Any single guided state > ~24s or holding motionless for > ~1/3 of its duration after its reveal completes is the pacing defect.',
    status: 'FIXED',
    concepts_affected: [CONCEPT],
    fixed_in_files: [JSON_FILE, RENDERER, DSM],
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
  return `-- 2026-07-03: engine_bug_queue recurring-defect classes from the founder video\n` +
    `-- review of magnetic_field_concept_B (Ch.4 concept #1). 4 rows, now FIXED (founder\n` +
    `-- accepted the polish pass): identical visible_elements, compass-too-small,\n` +
    `-- flat assemble, beats-too-long.\n` +
    `-- Generated by src/scripts/_seed_engine_bug_queue_swc_video_review.ts — idempotent.\n\n` +
    `INSERT INTO engine_bug_queue (${cols}) VALUES\n${all.map(sqlRow).join(',\n')}\n` +
    `ON CONFLICT (bug_class) DO UPDATE SET status = EXCLUDED.status, root_cause = EXCLUDED.root_cause,\n` +
    `  prevention_rule = EXCLUDED.prevention_rule, fixed_in_files = EXCLUDED.fixed_in_files,\n` +
    `  title = EXCLUDED.title, severity = EXCLUDED.severity;\n`;
}

async function main(): Promise<void> {
  const sqlPath = join(process.cwd(), 'supabase_2026-07-03_seed_engine_bug_queue_swc_video_review_migration.sql');
  writeFileSync(sqlPath, emitSql(incidents), 'utf-8');
  console.log(`Wrote archival SQL: ${sqlPath} (${incidents.length} incident rows)`);

  const payload = incidents.map((r) => ({ ...r, discovered_in_session: SESSION }));
  const { error } = await supabaseAdmin.from('engine_bug_queue').upsert(payload, { onConflict: 'bug_class' });
  if (error) { console.error(`✗ upsert failed: ${error.message}`); process.exit(1); }
  console.log(`✓ ${incidents.length} scar row(s) upserted (OPEN)`);
}

main().catch((err) => { console.error('💥 seed failed:', err instanceof Error ? err.stack : err); process.exit(1); });
