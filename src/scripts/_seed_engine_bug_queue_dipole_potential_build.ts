/**
 * Seed engine_bug_queue with the renderer-side prevention rules surfaced while
 * BUILDING the dipole_potential field_3d primitives for the new concept
 * electric_potential_dipole (V = k p cosθ / r², a SIGNED SCALAR — V=0 on the
 * equatorial plane while E ≠ 0). The prior state had the dipole_potential
 * scenario_type union member declared but NO builder, so the sim rendered
 * nothing. This is a FOUNDER-/architect-routed NEW-primitive build, not a defect
 * fix: the rows below are engine PREVENTION rules (FIXED — the recipe is now in
 * the renderer) so the next scalar-potential / multipole build inherits the
 * engine mechanics from the durable queue.
 *
 * Conformed-to existing scars (NOT re-seeded — already FIXED in the queue; this
 * build satisfies each for dipole_potential):
 *   • field3d_scenario_missing_devstatemeta_recognition  — the per-state
 *     `potential` reveal keys (two_term_at_ms, theta_arc_at_ms, sweep, disc_*,
 *     theta_sweep, curve_draw_at_ms, …) are registered in deriveStateMeta in the
 *     SAME change (see the dp_devstatemeta row + the BOTH file list).
 *   • field3d_time_gated_visual_invisible_in_slider_state — STATE_7's θ/r
 *     sliders + draggable probe + live signed-V readout + equipotential lobes
 *     render at FULL on entry (no clock gate in the slider state).
 *   • field3d_oneshot_element_vanishes_after_animation    — STATE_3/5 sweeps hold
 *     their end pose; STATE_4 disc + E arrow + STATE_6 curve hold their end pose.
 *
 * Idempotent: upsert onConflict 'bug_class'. Also writes the archival SQL.
 *
 * Run: npx tsx --env-file=.env.local src/scripts/_seed_engine_bug_queue_dipole_potential_build.ts
 */
import '@/lib/loadEnvLocal';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const SESSION = 'session_2026-06-29_electric_potential_dipole_build';

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
    bug_class: 'field3d_scenario_union_member_without_builder_renders_nothing',
    title: 'A scenario_type union member declared with NO build switch case + builder renders an empty canvas — the JSON validator + tsc PASS while the sim is blank, because nothing dispatches to a builder for that scenario',
    severity: 'CRITICAL',
    owner_cluster: R,
    root_cause: 'dipole_potential was added to the Field3DConfig.scenario_type union (so authoring + Zod + tsc all passed) but the build switch had no `case "dipole_potential"`, no buildDipolePotential(), no applyDipolePotentialState(), and no updateDipolePotentialFrame() — so electric_potential_dipole rendered nothing. Type-level membership is not a renderer.',
    prevention_rule: 'Every scenario_type union member ships, in the SAME change, a build switch case → buildX(config) (reads the authored field_3d_config, not config_unused), an authoritative applyXState() (after the generic visible_elements matcher), an accumulator-free updateXFrame() on the state clock wired into animate(), the freeze accumulator-free snap list, and the deriveStateMeta registration. A union member with no builder is a build incident, not a content bug.',
    probe_type: 'manual',
    probe_logic: 'Open electric_potential_dipole STATE_1..STATE_7: each must render the +q/-q pair + p arrow; S1 probe + r₊/r₋ lines + two-term callout + signed V; S2 θ-arc + collapsed V=kp cosθ/r²; S3 probe sweeps 40→140° and V recolors + flips sign across cosθ=0; S4 translucent equatorial disc reading V=0 with a persistent green E arrow antiparallel to p; S5 V-vs-θ cosine panel with a live dot; S6 V-vs-1/r² bright dipole diving below the dimmed 1/r ghost crossing at r=1; S7 θ/r sliders + draggable probe + live signed V + equipotential lobes.',
    status: 'FIXED',
    concepts_affected: ['electric_potential_dipole'],
    fixed_in_files: RENDERER,
    row_type: 'incident',
  },
  {
    bug_class: 'dp_potential_is_signed_scalar_no_arrow',
    title: 'The dipole potential V is a SIGNED SCALAR — the readout must change sign + recolor (positive_color → zero_color → negative_color) as the probe crosses cosθ=0, and must NEVER draw a direction arrow (sign_recolor.draws_arrow:false, Rule 24)',
    severity: 'MAJOR',
    owner_cluster: R,
    root_cause: 'Reusing a vector/field-arrow rendering for a potential would imply V has a direction; and a magnitude-only readout would lose the sign that is the entire STATE_3 teaching beat (the sign follows position via cosθ, not the sign of the nearby charge).',
    prevention_rule: 'The V readout is a billboard NUMBER (updateLabelSpriteText, glyph height constant — Rule 29) showing a leading +/− sign; in show_sign_recolor states the sprite colour is set from sign_recolor.{positive,zero,negative}_color by sign of V (zero band near |V|<threshold). No arrow primitive is ever drawn for V.',
    probe_type: 'manual',
    probe_logic: 'STATE_3: as the probe sweeps from the +q side to the −q side at fixed r, the V readout starts red/positive, passes through the zero colour near θ=90°, and ends blue/negative — and no arrow ever appears on V.',
    status: 'FIXED',
    concepts_affected: ['electric_potential_dipole'],
    fixed_in_files: RENDERER,
    row_type: 'incident',
  },
  {
    bug_class: 'dp_equatorial_disc_v_zero_with_nonzero_E_simultaneous',
    title: 'STATE_4 (PRIMARY aha): the translucent equatorial disc (θ=90°, ⊥ axis) must read V=0 at ≥3 sample points AND show a persistent non-zero E arrow (green, antiparallel to p) AT THE SAME TIME — the V=0 / E≠0 contrast IS the aha and both must be visible together',
    severity: 'MAJOR',
    owner_cluster: R,
    root_cause: 'If the disc V=0 label and the E arrow are sequenced so only one shows at the frozen payoff, or the E arrow is computed from V (and so collapses to zero on the equator), the central "scalar zero but vector non-zero" contrast is lost.',
    prevention_rule: 'The disc is a translucent CircleGeometry with normal along the dipole axis (rotation.y=π/2 so it lies in the plane ⊥ p), placed through the centre; ≥3 sample dots + a V=0 label fade in at disc_v_at_ms and HOLD; a fixed-direction green E arrow (antiparallel to p, length from E_equatorial_demo, NOT from V) fades in at e_arrow_at_ms and HOLDS. Both end poses persist to the frozen payoff frame.',
    probe_type: 'manual',
    probe_logic: 'STATE_4 at its pinned reveal: the disc is visible with V=0, three dots on it, AND a green E arrow pointing antiparallel to p — all on screen simultaneously.',
    status: 'FIXED',
    concepts_affected: ['electric_potential_dipole'],
    fixed_in_files: RENDERER,
    row_type: 'incident',
  },
  {
    bug_class: 'dp_falloff_curve_dipole_1_over_r2_below_point_1_over_r',
    title: 'STATE_6 falloff panel: the BRIGHT dipole curve (V ∝ 1/r²) must dive BELOW the DIMMED point-charge ghost (V ∝ 1/r), the two crossing at r=meet_at_r (=1) — the faster dipole falloff is the payoff and the curves must be computed from the closed forms, not faked',
    severity: 'MAJOR',
    owner_cluster: R,
    root_cause: 'Hand-tuned curve shapes (or both curves using the same falloff) hide the 1/r² vs 1/r divergence; a draw cue that never completes leaves the panel mid-sweep at the frozen frame.',
    prevention_rule: 'Both curves are sampled from the demo closed forms — bright = V_dipole_demo (vp/r²), dim dashed = V_point_ghost_demo (vp/r) — on the same axes; the left→right draw sweep is a pure function of (time - stateStartTime) from curve_draw_at_ms; the ghost fades in at ghost_fade_at_ms; a crossover tick marks meet_at_r. Slider/explore states render both at full immediately (no draw cue). A live dot rides the bright curve at the live r.',
    probe_type: 'manual',
    probe_logic: 'STATE_6 at its pin: the bright cyan dipole curve sits ABOVE the dim green dashed ghost for r<1, the two cross at r=1, and the bright curve drops BELOW the ghost for r>1; a crossover tick reads r=1.',
    status: 'FIXED',
    concepts_affected: ['electric_potential_dipole'],
    fixed_in_files: RENDERER,
    row_type: 'incident',
  },
  {
    bug_class: 'dp_equipotential_lobes_flat_2d_slice_contour_not_3d_surface',
    title: 'STATE_7 equipotential lobes must be flat 2D contour LINES in the dipole-axis slice plane (mode 2d_slice_contour), NOT 3D tessellated surfaces — founder lean lock',
    severity: 'MODERATE',
    owner_cluster: R,
    root_cause: 'A naive equipotential visualisation tessellates a 3D iso-surface, which is heavy and off-spec; the lean lock requires flat slice-plane contour loops.',
    prevention_rule: 'Each authored level c is a closed loop in the XY slice computed from the far-field form r(θ)=sqrt(vp·p·cosθ/|c|) over the half-plane where cosθ matches sign(c) (mirrored for the negative lobe), clamped to a max radius, drawn as a thin tube/line (positive_color for c>0, negative_color for c<0). No 3D surface geometry.',
    probe_type: 'manual',
    probe_logic: 'STATE_7: the equipotential lobes are flat figure-eight-style contour loops lying in the dipole-axis plane (red lobes around +q, blue around −q), not shaded 3D shells.',
    status: 'FIXED',
    concepts_affected: ['electric_potential_dipole'],
    fixed_in_files: RENDERER,
    row_type: 'incident',
  },
  {
    bug_class: 'dp_devstatemeta_potential_dipole_block_registered_same_change',
    title: 'electric_potential_dipole per-state `potential` reveal keys must be registered in deriveStateMeta in the SAME change (else THE EYE classifies every state at the 1500ms default and false-fails the late reveals + the STATE_3/5 sweeps + the STATE_7 interactive state)',
    severity: 'MAJOR',
    owner_cluster: R,
    root_cause: 'A new field_3d arc whose per-state `potential` keys (two_term_at_ms, v_readout_at_ms, theta_arc_at_ms, formula_callout_at_ms, sweep{at_ms,duration_ms}, disc_at_ms, disc_v_at_ms, e_arrow_at_ms, v_theta_curve_at_ms, theta_sweep{at_ms,duration_ms}, curve_draw_at_ms, ghost_fade_at_ms, split_highlight_at_ms, draggable_probe) are not recognised by deriveStateMeta classifies at the 1500ms default → D7/D1p false-fail (the field3d_scenario_missing_devstatemeta_recognition scar).',
    prevention_rule: 'Add the dipole `potential` keys to deriveStateMeta in the SAME change: F3D_REVEAL_KEYS includes "potential"; maxRevealForField3dState pins past every *_at_ms beat AND the sweep/theta_sweep END; deriveMotionExpectations marks STATE_3 (sweep) + STATE_5 (theta_sweep) MOTION; deriveHoldExpectations marks STATE_7 (draggable_probe / show_sliders) interactive, STATE_3/5 strict (undefined), and the one-shot reveal states (1/2/4/6) reveal_hold.',
    probe_type: 'manual',
    probe_logic: 'Run visual:eyes on electric_potential_dipole; classifications must be S1=reveal_hold(13100) S2=reveal_hold(6900) S3=motion(13000) S4=reveal_hold(17000) S5=motion(11000) S6=reveal_hold(10700) S7=interactive — none at the bare 1500ms default for the reveal states. VERIFIED via deriveMaxRevealTimeMs/deriveHoldExpectations/deriveMotionExpectations on the concept JSON.',
    status: 'FIXED',
    concepts_affected: ['electric_potential_dipole'],
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
-- 2026-06-29: seed engine_bug_queue with the renderer-side prevention rules from
-- BUILDING the dipole_potential field_3d primitives (electric_potential_dipole,
-- V = k p cosθ/r²). Generated by
-- src/scripts/_seed_engine_bug_queue_dipole_potential_build.ts — idempotent.
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
  const sqlPath = join(process.cwd(), 'supabase_2026-06-29_seed_engine_bug_queue_dipole_potential_build_migration.sql');
  writeFileSync(sqlPath, emitSql(rows), 'utf-8');
  console.log(`Wrote archival SQL: ${sqlPath} (${rows.length} rows)`);

  console.log('Upserting dipole_potential build rows...');
  await upsertBatch(rows, 'dipole_potential_build');

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
