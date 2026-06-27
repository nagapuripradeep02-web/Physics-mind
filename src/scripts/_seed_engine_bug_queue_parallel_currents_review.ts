/**
 * Seed engine_bug_queue with the scar(s) from building parallel_currents_force.
 * Self-caught by THE EYE during the build (before founder review). One reusable
 * defect class worth a permanent check for every future field_3d scenario.
 *
 * Idempotent: upsert onConflict 'bug_class'. Also writes the archival SQL.
 *
 * Run: npx tsx --env-file=.env.local src/scripts/_seed_engine_bug_queue_parallel_currents_review.ts
 */
import '@/lib/loadEnvLocal';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const SESSION = 'session_2026-06-26_parallel_currents_force';

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

const R = 'peter_parker:renderer_primitives';
const RENDERER = ['src/lib/renderers/field_3d_renderer.ts'];

const incidents: Row[] = [
  {
    bug_class: 'field3d_perframe_fn_closure_statedef_undefined_noops',
    title: 'New field_3d per-frame fn read a closure stateDef that was undefined at the dispatch site -> silently no-op (force vectors stuck at build-time direction)',
    severity: 'MAJOR',
    owner_cluster: R,
    root_cause:
      'updateParallelCurrentsForceFrame referenced a closure variable stateDef and the dispatch guarded on "&& stateDef". The per-frame dispatch was placed next to the torque/current_loop frame dispatches, where the animate-local stateDef is not yet assigned (those frame fns derive state from findTorqueLoopGroup()/userData, not stateDef). So stateDef was undefined at the guard -> the function was never called -> the force ArrowHelpers kept their build-time direction (both inward). STATE_4 (attract) looked correct by luck; STATE_6 (repel) was wrong (still inward). The applyXState handler took stateDef as a PARAMETER so per-state VISIBILITY worked, masking that the per-frame never ran.',
    prevention_rule:
      'A field_3d per-frame function must derive its current state from config.states[PM_currentState] inside the function (PM_currentState is the canonical state var), NOT from a closure/animate-local stateDef, and the per-frame dispatch must not guard on a possibly-undefined stateDef. Mirror the many other scenarios that do var stateDef = config.states[PM_currentState] locally.',
    probe_type: 'manual',
    probe_logic:
      'For a new scenario whose force/vector directions depend on per-state extras, two states with opposite extras (e.g. attract vs repel) MUST render visibly different frozen frames. If they look identical, the per-frame fn is not running (check the stateDef source).',
    status: 'FIXED',
    concepts_affected: ['parallel_currents_force'],
    fixed_in_files: RENDERER,
    row_type: 'incident',
  },
  {
    bug_class: 'field3d_timed_reveal_not_shown_in_frozen_frame',
    title: 'A timed state change (reverse current at N ms) does not appear in THE EYE frozen frame -> make the key visual state-static instead',
    severity: 'MODERATE',
    owner_cluster: 'alex:json_author',
    root_cause:
      'STATE_6 used reverse_wire_2_at_ms:2500 to flip wire 2 mid-state into the antiparallel/repel config. THE EYE pins/captures the frozen (and the inspected dense) frames such that the post-flip state was not what got reviewed, so the repel never showed.',
    prevention_rule:
      'For the frozen-frame payoff of a state, set the key configuration statically in the state extras (e.g. wire_2_dir:"down"), not via a timed change partway through the state. Timed reveals are fine for live playback but must not be the only way the frozen frame reaches the intended pose.',
    probe_type: 'manual',
    probe_logic:
      'A state whose teaching payoff is a changed configuration must show that configuration in its frozen frame, not only after a mid-state timer.',
    status: 'FIXED',
    concepts_affected: ['parallel_currents_force'],
    fixed_in_files: ['src/data/concepts/parallel_currents_force.json'],
    row_type: 'incident',
  },
  {
    bug_class: 'field3d_bfield_circulation_sense_reversed_vs_rhr',
    title: 'B-field circulation arrows drawn in the WRONG sense (clockwise) for an upward current — violates the right-hand rule',
    severity: 'CRITICAL',
    owner_cluster: R,
    root_cause:
      'In updateParallelCurrentsForceFrame the orbiting B-field arrowheads used tangent (-sin(ang), 0, cos(ang)) (the +ang tangent of the position circle), which is the NEGATIVE of B = y_hat x r_hat = (sin(ang), 0, -cos(ang)) for current +y. So the field circulated clockwise-from-above instead of counterclockwise. Founder caught it from a screenshot; the deterministic EYE passed it because structural/motion gates do not check physics direction, and the paid vision pass was not run on the first build.',
    prevention_rule:
      'For any circulating-field visual, set the arrowhead tangent equal to the actual field vector (B = mu0 I/2pi * (Î x r_hat)) at each point, not merely the geometric tangent of the position circle. Verify the RHR explicitly: for current +y, the front (+z, toward camera) arrows must point +x (right) = counterclockwise viewed from above. Use a top-down-ish camera on the field state so the circulation is readable.',
    probe_type: 'manual',
    probe_logic:
      'On the field-circulation state, pick the arrow on the camera-facing (+z) arc: for an upward current it must point to the screen-right (+x). If it points left, the sense is reversed.',
    status: 'FIXED',
    concepts_affected: ['parallel_currents_force'],
    fixed_in_files: RENDERER,
    row_type: 'incident',
  },
  {
    bug_class: 'deterministic_eye_blind_to_physics_direction_need_vision_or_rhr_check',
    title: 'THE EYE deterministic gates cannot catch physics-DIRECTION errors (RHR sense, vector orientation) — only structure/motion/layout',
    severity: 'MAJOR',
    owner_cluster: 'peter_parker:visual_validator',
    root_cause:
      'The deterministic EYE checks rendering/motion/reveal-timing/bounds/regression-pixels — never physics correctness. A field that circulates the wrong way, or a vector pointing the wrong direction, passes all deterministic gates. On the first parallel_currents_force build the reversed B circulation passed 34/34 because no layer judged direction (the paid vision pass was skipped, and manual review checked the force arrows but not the field circulation).',
    prevention_rule:
      'Before declaring ANY field_3d concept done, either (a) run the paid smoke:visual-validator, or (b) do an explicit per-state RHR/direction review of every field line, B/E vector, force, and current arrow against the physics — do not rely on the deterministic 34/34 for physics correctness. Treat direction-of-field/force as a mandatory manual check item.',
    probe_type: 'manual',
    probe_logic:
      'For each field_3d state, enumerate every directional element (current, field circulation, B/E vector, force) and confirm its on-screen direction matches the hand rule. Deterministic pass is necessary but NOT sufficient.',
    status: 'FIXED',
    concepts_affected: ['parallel_currents_force'],
    fixed_in_files: [],
    row_type: 'incident',
  },
  {
    bug_class: 'field3d_force_state_missing_rhr_hand_teaching_aid',
    title: 'Force-rule state showed only a force arrow, no right-hand-rule HAND to explain the F = I L x B direction (founder review)',
    severity: 'MODERATE',
    owner_cluster: R,
    root_cause:
      'STATE_3 (force on wire 2) rendered the red F arrow + a small B1 nub but no right-hand visualization, so it asserted the force direction without showing the rule. Founder (screen recording 26.06.2026_20.11.53) wrote "RHR" on the whiteboard and asked for a hand showing current up, B1, and the resulting force.',
    prevention_rule:
      'A state that introduces a cross-product force/field direction (F = IL x B, F = qv x B, B = ...) should ship a right-hand visualization (createRightHand or the I/B/F guide triad) with the thumb along the result and a label, not just the result arrow. Orient the hand from the live physics so it tracks reversed inputs.',
    probe_type: 'manual',
    probe_logic:
      'On a force/field-direction state, confirm a hand or labelled I/B/F triad is present and that the thumb/result points the same way as the force arrow the physics gives.',
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
  return `-- 2026-06-26: engine_bug_queue scars from building parallel_currents_force.\n` +
    `-- Generated by src/scripts/_seed_engine_bug_queue_parallel_currents_review.ts — idempotent.\n\n` +
    `INSERT INTO engine_bug_queue (${cols}) VALUES\n${all.map(sqlRow).join(',\n')}\n` +
    `ON CONFLICT (bug_class) DO UPDATE SET status = EXCLUDED.status, root_cause = EXCLUDED.root_cause,\n` +
    `  prevention_rule = EXCLUDED.prevention_rule, fixed_in_files = EXCLUDED.fixed_in_files;\n`;
}

async function main(): Promise<void> {
  const sqlPath = join(process.cwd(), 'supabase_2026-06-26_seed_engine_bug_queue_parallel_currents_review_migration.sql');
  writeFileSync(sqlPath, emitSql(incidents), 'utf-8');
  console.log(`Wrote archival SQL: ${sqlPath}`);
  const payload = incidents.map((r) => ({ ...r, discovered_in_session: SESSION }));
  const { error } = await supabaseAdmin.from('engine_bug_queue').upsert(payload, { onConflict: 'bug_class' });
  if (error) { console.error(`✗ upsert failed: ${error.message}`); process.exit(1); }
  console.log(`✓ ${incidents.length} scar row(s) upserted (FIXED)`);
}

main().catch((err) => { console.error('💥 seed failed:', err instanceof Error ? err.stack : err); process.exit(1); });
