/**
 * Seed engine_bug_queue with the renderer-side prevention rules surfaced while
 * BUILDING the electric_potential_meaning field_3d primitives (the V = W/q
 * "meaning" diamond, scenario point_charge_positive + config.potential_meaning).
 * This is a FOUNDER-APPROVED NEW-primitive build, not a defect fix: the rows
 * below are engine PREVENTION rules (FIXED — the recipe is in the renderer) so
 * the NEXT potential-ladder build (electric_potential_point_charge V = kQ/r, the
 * capacitance siblings, conductor equipotential, …) inherits the engine mechanics
 * from the durable queue, not only from the spec catalog.
 *
 * Conformed-to existing scars (NOT re-seeded — already FIXED in the queue; this
 * build satisfies each one for electric_potential_meaning):
 *   • field3d_scenario_missing_devstatemeta_recognition  (R) — the `potential`
 *     block was added to deriveStateMeta (motion + maxReveal + hold) in the SAME
 *     change as the renderer scenario.
 *   • field3d_time_gated_visual_invisible_in_slider_state (R) — STATE_7's
 *     draggable test charge + live V readout render at FULL on entry (no clock-gate).
 *   • field3d_explorer_state_static_d1p                   (R) — STATE_7 idle
 *     auto-sweep moves the charge across shells when un-dragged (D1p motion).
 *   • field3d_oneshot_element_vanishes_after_animation    (R) — the U badge, the
 *     V=W/q callout, the ΔV bracket and the shells HOLD their end pose (never 0).
 *   • field3d_position_vector_foreshortened_3q_camera     (R) — the ∞·V=0 marker
 *     and the ΔV label billboard camera-right under the 3/4 camera.
 *   • field3d_reveal_too_subtle_fails_d7                  (R) — STATE_6 shells fade
 *     in concentrically (staggered, >0.1%/frame) AND the state declares reveal_hold.
 *
 * Idempotent: upsert onConflict 'bug_class'. Also writes the archival SQL.
 *
 * Run: npx tsx --env-file=.env.local src/scripts/_seed_engine_bug_queue_electric_potential_meaning_build.ts
 */
import '@/lib/loadEnvLocal';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const SESSION = 'session_2026-06-26_electric_potential_meaning_build';

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

const R = 'peter_parker:renderer_primitives';
const RENDERER = ['src/lib/renderers/field_3d_renderer.ts'];
const BOTH = ['src/lib/renderers/field_3d_renderer.ts', 'src/lib/validators/visual/deriveStateMeta.ts'];

const rows: Row[] = [
  {
    bug_class: 'pm_equipotential_shells_must_be_config_driven_with_v_labels',
    title: 'Equipotential shells must read explicit {radius, v_label} from config (1/r-physical, bunched near +Q) with a per-shell V label — the hardcoded even radius = 1.0 + i*1.2 with no labels cannot teach scalar level-sets',
    severity: 'MAJOR',
    owner_cluster: R,
    root_cause: 'buildEquipotentialSurfaces hardcoded N evenly-spaced shells (radius = 1.0 + i*1.2) with no V labels, so it could not render the four hero shells (V=9,6,4.5,3 at r=1.0,1.5,2.0,3.0) that are 1/r-physical (r_i = demo_v_per_nc*Q/V_i, bunched near +Q). Without per-shell V numbers the shells cannot read as scalar level-sets (the PRIMARY aha).',
    prevention_rule: 'When config.equipotential.shells = [{radius, v_label}] is present, render a shell at each explicit radius + a V-value label sprite on each (label_each_shell !== false), hidden until the per-state reveal fades them in. ABSENT ⇒ exact legacy even-spacing behaviour (existing point_charge / gauss concepts untouched). Every number is data; the engine never hardcodes the concept values.',
    probe_type: 'manual',
    probe_logic: 'Open STATE_6/STATE_7 of electric_potential_meaning: the cyan shells must sit at the config radii (bunched near +Q, NOT evenly spaced) and each must carry its V number (V=9 innermost … V=3 outermost). Remove the shells block from another point_charge config and confirm the legacy even shells / no-shells behaviour is unchanged.',
    status: 'FIXED',
    concepts_affected: ['electric_potential_meaning'],
    fixed_in_files: RENDERER,
    row_type: 'incident',
  },
  {
    bug_class: 'pm_work_tally_holds_end_value_never_resets_to_zero',
    title: 'The route work tally + W/q invariant + V=W/q callout + U badge must HOLD their revealed value (path1 W=6, path2 W=6, q→2q W=12, W/q=6, V=6, U=6) — never fade/snap back to 0 after the animation',
    severity: 'MAJOR',
    owner_cluster: R,
    root_cause: 'A one-shot animated readout (the climbing work tally, the draining energy badge, the written V=W/q) that resets to 0 or fades out after its animation completes destroys the teaching payload — the student sees a blank where the result should persist (the field3d_oneshot_element_vanishes_after_animation scar applied to potential).',
    prevention_rule: 'updatePotentialMeaningFrame clamps the route fraction to 1 and holds the final tally text; the energy badge writes "U" and HOLDS at end pose; the V=W/q callout + V value + W/q readout stay opaque once written. Both STATE_2 routes land on the SAME tally (path-independence); STATE_4 doubles the tally (q→2q) while W/q holds (the divide-out-q lesson). Pure state clock (Rule 26).',
    probe_type: 'manual',
    probe_logic: 'Watch STATE_2 to completion: both tallies read W=6 and STAY. Watch STATE_3 release: the badge drains 6→0 then writes "U = stored energy" and STAYS. Watch STATE_4: tally 6→12 while W/q holds 6, then V=W/q + V=6 write in and STAY visible — none fades to 0.',
    status: 'FIXED',
    concepts_affected: ['electric_potential_meaning'],
    fixed_in_files: RENDERER,
    row_type: 'incident',
  },
  {
    bug_class: 'pm_q_grow_is_only_allowed_size_change_rule29',
    title: 'The q→2q grow is the ONLY size change in the potential arc (a real physical magnitude doubling, like tauThrob); every other emphasis is brightness, never size (Rule 29)',
    severity: 'MODERATE',
    owner_cluster: R,
    root_cause: 'Rule 29 bans zoom/bulge emphasis. The potential arc has one legitimate size change — the scripted q→2q doubling in STATE_4 (a genuine magnitude change that doubles the work) — which must read as a real grow, while NO shell / arrow / charge ever bulges for emphasis.',
    prevention_rule: 'Only the STATE_4 doubling scales the test-charge mesh (1 → 1.26, cube-root of 2 so VOLUME ~doubles); the grow is gated on doubling_at_ms and resets to scale 1 on every other state entry (Rule 26). No other element changes size for emphasis. Shell highlight in STATE_7 brightens opacity, never scales.',
    probe_type: 'manual',
    probe_logic: 'STATE_4 only: the amber +q visibly grows when the narration says "twice as big" (and the tally doubles with it). Every other state: nothing zooms/bulges; the STATE_7 shell-under-charge highlight is a brightness change, not a size change.',
    status: 'FIXED',
    concepts_affected: ['electric_potential_meaning'],
    fixed_in_files: RENDERER,
    row_type: 'incident',
  },
  {
    bug_class: 'pm_devstatemeta_potential_block_registered_same_change',
    title: 'electric_potential_meaning per-state `potential` keys registered in deriveStateMeta in the SAME change (else THE EYE mis-classifies every state at the 1500ms default + false-fails STATE_2/3 motion + STATE_7 interactive)',
    severity: 'MAJOR',
    owner_cluster: R,
    root_cause: 'A new field_3d teaching arc whose per-state `potential` keys (animate_route, route_at_ms, release_at_ms, doubling_at_ms, v_callout_at_ms, reference_at_ms, delta_v_at_ms, shells_at_ms, e_arrow_at_ms, draggable_test_charge) are not recognised by deriveStateMeta classifies at the 1500ms default → D7/D1p false-fail (the field3d_scenario_missing_devstatemeta_recognition scar).',
    prevention_rule: 'The `potential` block ships in deriveStateMeta in the SAME change: deriveMotionExpectations declares STATE_2 (animate_route) + STATE_3 (release_at_ms) as MOTION; maxRevealForField3dState pins past every reveal beat; deriveHoldExpectations marks STATE_7 (draggable_test_charge) interactive and the reveal states reveal_hold. Guided reveal states must classify reveal_hold (maxReveal > 1500ms); STATE_7 interactive; STATE_2/3 keep the strict motion gate.',
    probe_type: 'manual',
    probe_logic: 'Run visual:eyes on electric_potential_meaning; STATE_2/STATE_3 must declare motion, STATE_4/5/6 must classify reveal_hold (maxReveal > 1500ms), STATE_7 must classify interactive — none at the bare 1500ms default.',
    status: 'FIXED',
    concepts_affected: ['electric_potential_meaning'],
    fixed_in_files: BOTH,
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
-- 2026-06-26: seed engine_bug_queue with the renderer-side prevention rules from
-- BUILDING the electric_potential_meaning field_3d primitives (V = W/q meaning
-- diamond). Generated by
-- src/scripts/_seed_engine_bug_queue_electric_potential_meaning_build.ts — idempotent.
-- ============================================================================

INSERT INTO engine_bug_queue (${cols}) VALUES
${all.map(sqlRow).join(',\n')}
ON CONFLICT (bug_class) DO UPDATE SET
  title = EXCLUDED.title, severity = EXCLUDED.severity, owner_cluster = EXCLUDED.owner_cluster,
  root_cause = EXCLUDED.root_cause, prevention_rule = EXCLUDED.prevention_rule,
  probe_type = EXCLUDED.probe_type, probe_logic = EXCLUDED.probe_logic,
  status = EXCLUDED.status, concepts_affected = EXCLUDED.concepts_affected,
  fixed_in_files = EXCLUDED.fixed_in_files, row_type = EXCLUDED.row_type;
`;
}

async function upsertBatch(rowsIn: Row[], label: string): Promise<boolean> {
  const payload = rowsIn.map((r) => ({ ...r, discovered_in_session: SESSION }));
  const { error } = await supabaseAdmin
    .from('engine_bug_queue')
    .upsert(payload, { onConflict: 'bug_class' });
  if (error) {
    console.error(`  x ${label} upsert failed: ${error.message}`);
    return false;
  }
  console.log(`  ok ${label}: ${rowsIn.length} rows upserted`);
  return true;
}

async function main(): Promise<void> {
  const sqlPath = join(process.cwd(), 'supabase_2026-06-26_seed_engine_bug_queue_electric_potential_meaning_build_migration.sql');
  writeFileSync(sqlPath, emitSql(rows), 'utf-8');
  console.log(`Wrote archival SQL: ${sqlPath} (${rows.length} rows)`);

  console.log('Upserting electric_potential_meaning build rows...');
  await upsertBatch(rows, 'electric_potential_meaning_build');

  const { data, error } = await supabaseAdmin
    .from('engine_bug_queue')
    .select('bug_class, status')
    .eq('discovered_in_session', SESSION);
  if (error) { console.error('verify query failed:', error.message); return; }
  console.log('In engine_bug_queue for this session:');
  for (const row of data ?? []) console.log(`  [${row.status}] ${row.bug_class}`);
}

main().catch((err) => {
  console.error('seed failed:', err instanceof Error ? err.stack : err);
  process.exit(1);
});
