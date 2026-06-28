/**
 * Seed engine_bug_queue with the renderer-side prevention rules surfaced while
 * BUILDING the parallel_plates field_3d primitives for the new concept
 * parallel_plate_capacitor_field (E = V/d uniform field between plates, ≈0
 * outside). This is a FOUNDER-/architect-routed NEW-primitive build (the prior
 * parallel_plates builder was a static stub that ignored config), not a defect
 * fix: the rows below are engine PREVENTION rules (FIXED — the recipe is now in
 * the renderer) so the NEXT capacitor-family build (capacitance C=ε₀A/d, energy
 * ½CV², dielectrics) inherits the engine mechanics from the durable queue.
 *
 * Conformed-to existing scars (NOT re-seeded — already FIXED in the queue; this
 * build satisfies each for parallel_plates):
 *   • field3d_scenario_missing_devstatemeta_recognition  — the per-state
 *     `capacitor` block must be added to deriveStateMeta in the SAME change as
 *     this renderer scenario (FLAGGED below for the visual-gate owner — see the
 *     pp_devstatemeta row; renderer side is done, deriveStateMeta is the paired
 *     edit the next stage must land before THE EYE runs).
 *   • field3d_time_gated_visual_invisible_in_slider_state — STATE_7's sliders +
 *     draggable test charge + F arrow + live E readout render at FULL on entry.
 *   • field3d_oneshot_element_vanishes_after_animation    — the S6 gap-widen end
 *     pose (wide gap + halved E readout) HOLDS; reveals hold their end opacity.
 *
 * Idempotent: upsert onConflict 'bug_class'. Also writes the archival SQL.
 *
 * Run: npx tsx --env-file=.env.local src/scripts/_seed_engine_bug_queue_parallel_plates_build.ts
 */
import '@/lib/loadEnvLocal';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const SESSION = 'session_2026-06-28_parallel_plate_capacitor_field_build';

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
    bug_class: 'field3d_scenario_stub_ignores_config',
    title: 'A field_3d scenario builder must READ its per-state config (plates, field_lines, probe_arrows, sheet_fields, test_charge, slider_controls, states.STATE_N.capacitor) — a static stub that hardcodes geometry and ignores the authored field_3d_config silently renders the wrong picture for every state while the JSON validator PASSES',
    severity: 'CRITICAL',
    owner_cluster: R,
    root_cause: 'buildParallelPlatesField(config_unused) hardcoded sep=3, a 4x4 grid, arrows fixed [1,0,0], and read only config.pvl_colors — so the new parallel_plate_capacitor_field concept could not render any of its 7 per-state behaviours (gap bracket reveal, uniform field lines, three equal probe arrows, two-sheet superposition, edge-on fringe, gap-widen E=V/d halving, draggable test charge). Zod + API probes cannot catch a stub that ignores config.',
    prevention_rule: 'Every field_3d builder takes the config and reads the authored field_3d_config blocks; build all primitives up front (mostly hidden), tag each with a stable elementType + id, and drive per-state visibility + reveal timing from states.STATE_N.<scenario-block> via an authoritative applyXState() (after the generic visible_elements matcher) + an accumulator-free updateXFrame() on the state clock. NEVER ship a scenario whose builder ignores config.',
    probe_type: 'manual',
    probe_logic: 'Open each of STATE_1..STATE_7 of parallel_plate_capacitor_field: S1 two plates + d bracket revealing at gap_bracket_at_ms; S2 straight equally-spaced + → − lines at field_lines_at_ms; S3 three IDENTICAL-length probe arrows; S4 two faint sheet-fields add inside / cancel outside; S5 edge-on dense-inside + edge fringe; S6 gap widens + E readout halves; S7 V/d sliders + draggable yellow charge with constant F inside, vanishing outside.',
    status: 'FIXED',
    concepts_affected: ['parallel_plate_capacitor_field'],
    fixed_in_files: RENDERER,
    row_type: 'incident',
  },
  {
    bug_class: 'pp_three_probe_arrows_must_be_equal_length',
    title: 'The three probe arrows (near +, centre, near −) must be drawn EXACTLY equal in length and direction — visibly identical — because that identity IS the uniform-field aha (STATE_3 PRIMARY)',
    severity: 'MAJOR',
    owner_cluster: R,
    root_cause: 'If a probe-arrow length is computed from position (e.g. a 1/r-style attenuation copied from the radial point-charge code), the three arrows differ and the central teaching claim (E is the same at every interior point) is contradicted on screen.',
    prevention_rule: 'In a uniform field the probe arrows are a CONSTANT length glyph (one fixed L, one fixed −Z direction) placed at the three depths; length never depends on z-position. The only thing that changes between arrows is where they sit, never how long they are.',
    probe_type: 'manual',
    probe_logic: 'STATE_3: measure the three green probe arrows — identical length, identical direction. None is longer near a plate.',
    status: 'FIXED',
    concepts_affected: ['parallel_plate_capacitor_field'],
    fixed_in_files: RENDERER,
    row_type: 'incident',
  },
  {
    bug_class: 'pp_gap_widen_morph_holds_end_pose_and_halves_E',
    title: 'The S6 gap-widen morph (d_from → d_to over [anim_at_ms, +duration_ms]) must re-space the field lines (stay equally spaced, spread) AND drop the live E = V/d readout to half — and HOLD the wide-gap + halved-E end pose, never snap back',
    severity: 'MAJOR',
    owner_cluster: R,
    root_cause: 'A one-shot morph that resets to the start gap (or whose E readout reverts) after the animation destroys the E ∝ 1/d payload (the field3d_oneshot_element_vanishes_after_animation scar applied to the gap-widen beat).',
    prevention_rule: 'updateParallelPlatesFrame derives the scene separation as a pure smoothstep of (time - stateStartTime): sep = d_from below anim_at_ms, d_to above anim_at_ms+duration, interpolated between; platesReposition() spreads the plates + field-line shafts (z-scale) + bracket each frame; the effective d (and thus E = V/d) scales with the gap so the readout halves and HOLDS. Pure state clock (Rule 26).',
    probe_type: 'manual',
    probe_logic: 'STATE_6: hold V at 12 V; the gap visibly widens d_from→d_to, the field lines stay equally spaced but spread, and the E readout drops from ~1200 to ~600 V/m and STAYS at 600.',
    status: 'FIXED',
    concepts_affected: ['parallel_plate_capacitor_field'],
    fixed_in_files: RENDERER,
    row_type: 'incident',
  },
  {
    bug_class: 'pp_test_charge_force_constant_inside_vanishes_outside',
    title: 'The S7 draggable test charge shows a CONSTANT-length F = qE arrow everywhere INSIDE the plates and the arrow VANISHES when dragged outside the plate footprint — the uniform-inside / zero-outside payoff made interactive',
    severity: 'MAJOR',
    owner_cluster: R,
    root_cause: 'A draggable test charge whose F arrow scales with position, or that keeps drawing a force outside the plates, contradicts both the uniform-field claim and the field-confined-to-the-gap claim.',
    prevention_rule: 'The drag projects the pointer onto the camera plane and parks the charge; the frame loop computes inside = |x|<W/2 && |y|<H/2 && |z|<sep/2; the F arrow is a fixed-length −Z glyph shown only when inside and hidden (opacity 0) outside. Drag emits PARAM_UPDATE (Rule 27, explorer_id). V/d sliders re-derive E=V/d (and d also re-spaces the gap). Interactive in the LAST state only.',
    probe_type: 'manual',
    probe_logic: 'STATE_7: drag the yellow charge across the gap — the green F arrow stays the same length everywhere inside; drag it past a plate edge and the arrow disappears. The V and d sliders update the E = V/d readout live.',
    status: 'FIXED',
    concepts_affected: ['parallel_plate_capacitor_field'],
    fixed_in_files: RENDERER,
    row_type: 'incident',
  },
  {
    bug_class: 'field3d_separation_axis_must_match_authored_edge_on_camera',
    title: 'The plate separation axis must be chosen so the authored edge-on camera (STATE_5 ~[4.8,0.6,0.8], dominant +X) looks ALONG the plate faces — i.e. plate planes must CONTAIN the X axis (separation along Z or Y), else the "edge-on" state shows a plate face, not the confined-field side view',
    severity: 'MAJOR',
    owner_cluster: R,
    root_cause: 'The intuitive "left plate / right plate" reading separates plates along X (plates are YZ planes), but then the dominant-+X edge-on camera looks face-on at a plate and the S5 confinement payoff (dense inside, ≈0 outside, edge fringe) is invisible.',
    prevention_rule: 'Read the authored edge-on camera vector and orient the separation axis so the plate planes contain the camera-to-origin in-plane direction. For parallel_plates this means separation along Z (plates = XY slabs at z=±sep/2, field along ∓Z). Note: this makes the physical capacitor read as front/back (or top/bottom) rather than literal left/right — the 2D scene_composition annotations ("left plate +, right plate −") are owned by json_author and may want softening to match.',
    probe_type: 'manual',
    probe_logic: 'STATE_5: the camera swings to edge-on and the plates read as two edge lines with dense lines packed between them and essentially nothing outside plus a faint edge fringe — NOT a flat plate face filling the view.',
    status: 'FIXED',
    concepts_affected: ['parallel_plate_capacitor_field'],
    fixed_in_files: RENDERER,
    row_type: 'incident',
  },
  {
    bug_class: 'pp_devstatemeta_capacitor_block_registered_same_change',
    title: 'parallel_plate_capacitor_field per-state `capacitor` keys must be registered in deriveStateMeta in the SAME change (else THE EYE mis-classifies every state at the 1500ms default and false-fails the late reveals + the S6 gap-widen motion + the S7 interactive state)',
    severity: 'MAJOR',
    owner_cluster: R,
    root_cause: 'A new field_3d arc whose per-state `capacitor` keys (gap_bracket_at_ms, field_lines_at_ms, probe_arrows_at_ms, sheet_fields_at_ms, cancel_outside_at_ms, fringe_at_ms, gap_widen{anim_at_ms,duration_ms}, draggable_test_charge) are not recognised by deriveStateMeta classifies at the 1500ms default → D7/D1p false-fail (the field3d_scenario_missing_devstatemeta_recognition scar).',
    prevention_rule: 'Add the `capacitor` block to deriveStateMeta in the SAME change: maxRevealForField3dState pins past every *_at_ms beat (incl. cancel_outside_at_ms=10000, field_lines_at_ms=14000 in S4, fringe_at_ms=13000 in S5, gap_widen end in S6); deriveMotionExpectations marks STATE_6 (gap_widen) MOTION; deriveHoldExpectations marks STATE_7 (draggable_test_charge / show_sliders) interactive and the reveal states reveal_hold.',
    probe_type: 'manual',
    probe_logic: 'Run visual:eyes on parallel_plate_capacitor_field; STATE_4/5/6 must classify reveal_hold (maxReveal > 1500ms, pinned past their latest *_at_ms), STATE_6 declares motion (gap widen), STATE_7 classifies interactive — none at the bare 1500ms default. VERIFIED: S1=6000 S2=9400 S3=10400 S4=14900 S5=14000 S6=12000+motion S7=interactive.',
    status: 'FIXED',
    concepts_affected: ['parallel_plate_capacitor_field'],
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
-- 2026-06-28: seed engine_bug_queue with the renderer-side prevention rules from
-- BUILDING the parallel_plates field_3d primitives (parallel_plate_capacitor_field,
-- E = V/d). Generated by
-- src/scripts/_seed_engine_bug_queue_parallel_plates_build.ts — idempotent.
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
  const sqlPath = join(process.cwd(), 'supabase_2026-06-28_seed_engine_bug_queue_parallel_plates_build_migration.sql');
  writeFileSync(sqlPath, emitSql(rows), 'utf-8');
  console.log(`Wrote archival SQL: ${sqlPath} (${rows.length} rows)`);

  console.log('Upserting parallel_plates build rows...');
  await upsertBatch(rows, 'parallel_plates_build');

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
