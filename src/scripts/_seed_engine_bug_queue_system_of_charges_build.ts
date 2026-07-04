/**
 * Seed engine_bug_queue with the renderer-side prevention rules surfaced while
 * BUILDING the system_of_charges field_3d primitives for the new concept
 * electric_potential_system_of_charges (V = Σ k qᵢ/rᵢ — the SCALAR superposition
 * of N signed per-charge numbers; no directions, no components). The prior state
 * had the system_of_charges scenario_type union member declared but NO builder,
 * so the sim rendered nothing. This is a FOUNDER-/architect-routed NEW-primitive
 * build (a generalisation of dipole_potential's 2-charge sum to N charges read
 * from config.charges[]), not a defect fix: the rows below are engine PREVENTION
 * rules (FIXED — the recipe is now in the renderer) so the next system/multipole
 * scalar-potential build inherits the engine mechanics from the durable queue.
 *
 * Conformed-to existing scars (NOT re-seeded — already FIXED in the queue; this
 * build satisfies each for system_of_charges):
 *   • field3d_scenario_union_member_without_builder_renders_nothing — the build
 *     switch case + buildSystemOfCharges + applySystemOfChargesState +
 *     updateSystemOfChargesFrame ship in this SAME change.
 *   • field3d_scenario_missing_devstatemeta_recognition — the per-state
 *     `potential` reveal keys (per_charge_tags_at_ms, contribution_values_at_ms,
 *     running_sum_at_ms, far_term_at_ms, total_with_far_at_ms, cancellation_at_ms,
 *     total_just_q3_at_ms, field_contrast_at_ms, split_callout_at_ms, predict_at_ms)
 *     are registered in deriveStateMeta in the SAME change (BOTH file list).
 *   • field3d_time_gated_visual_invisible_in_slider_state — STATE_6's q3 slider +
 *     draggable probe + live running-sum readout render at FULL on entry (no clock
 *     gate in the slider state); idle_auto_sweep is a pure fn of the state clock.
 *   • field3d_oneshot_element_vanishes_after_animation — S3 far-term highlight,
 *     S4 pair-cancellation, S5 field-contrast E arrows all HOLD their end pose.
 *
 * Idempotent: upsert onConflict 'bug_class'. Also writes the archival SQL.
 *
 * Run: npx tsx --env-file=.env.local src/scripts/_seed_engine_bug_queue_system_of_charges_build.ts
 */
import '@/lib/loadEnvLocal';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const SESSION = 'session_2026-06-29_electric_potential_system_of_charges_build';

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
const CONCEPT = ['electric_potential_system_of_charges'];

const rows: Row[] = [
  {
    bug_class: 'soc_system_of_charges_builder_generalises_dipole_to_n_charges',
    title: 'system_of_charges was a scenario_type union member with NO builder (sim rendered nothing) — built buildSystemOfCharges by generalising the dipole_potential 2-charge sum to N charges read from config.charges[]',
    severity: 'CRITICAL',
    owner_cluster: R,
    root_cause: 'system_of_charges was added to the Field3DConfig.scenario_type union (so authoring + Zod + tsc all passed) but the build switch had no `case "system_of_charges"`, no buildSystemOfCharges(), no applySystemOfChargesState(), and no updateSystemOfChargesFrame() — so electric_potential_system_of_charges rendered nothing. Type-level membership is not a renderer.',
    prevention_rule: 'Build the N-charge scalar-potential scenario by generalising the dipole trio: read config.charges[] ({id,position,charge_value,label,color}), config.system_defaults{DEMO_VP,DEMO_E,clamp_r_min} and config.slider_controls.q3_value; ship the build switch case → buildSystemOfCharges(config) (reads config, not config_unused), an authoritative applySystemOfChargesState() (after the generic visible_elements matcher), an accumulator-free updateSystemOfChargesFrame() on the state clock wired into animate() + the freeze snap list, and the deriveStateMeta registration — all in the SAME change.',
    probe_type: 'manual',
    probe_logic: 'Open electric_potential_system_of_charges STATE_1..STATE_6: each renders the 3 sign-coloured charges (+q1 red, −q2 blue, +2q3 red) + a yellow probe; S1 r-lines + 3 signed per-charge V tags (+3.4/−6.7/+11.9); S2 running-sum panel +3.4 −6.7 +11.9 = +8.6; S3 probe far right, far q1 term highlighted, total +4.2; S4 probe on the y-axis, +8.9/−8.9 cancel to 0, total +12.0; S5 the 3 numbers collapse to one bright total while dim E arrows sprawl from each charge; S6 draggable probe + q3 slider + live running sum.',
    status: 'FIXED',
    concepts_affected: CONCEPT,
    fixed_in_files: RENDERER,
    row_type: 'incident',
  },
  {
    bug_class: 'soc_potential_is_scalar_sum_of_signed_numbers_no_arrow',
    title: 'The system potential V is the SCALAR SUM of signed per-charge numbers (Vi = DEMO_VP·qᵢ/max(rᵢ,clamp)) — render it as signed NUMBERS (per-charge tags + a running-sum panel + a live total), NEVER as arrows or a vector add (Rule 24)',
    severity: 'MAJOR',
    owner_cluster: R,
    root_cause: 'Reusing a vector/field-arrow rendering for V would imply potential has a direction and would lose the whole teaching beat — that the total is one easy scalar sum of signed numbers, not a vector addition. The signs (set by each charge) and distances (1/r, not 1/r²) decide the total.',
    prevention_rule: 'Per-charge contribution Vi = DEMO_VP·qᵢ/max(rᵢ,clamp), rᵢ=sqrt((px−xᵢ)²+(py−yᵢ)²); the running total is V_total = Σ Vi. Each Vi renders as a billboard NUMBER (updateLabelSpriteText, constant glyph height — Rule 29) with a leading +/− and a sign-coloured fill (positive/negative/zero colour); the running-sum panel stacks the signed numbers then "= total"; the live readout shows V = ±total. No arrow primitive is ever drawn for V. The on-screen V uses round DEMO units (DEMO_VP=12), not SI volts.',
    probe_type: 'manual',
    probe_logic: 'STATE_1 at the contribution_values reveal: three signed number tags read +3.4, −6.7, +11.9 (no arrows). STATE_2: the panel reads +3.4 −6.7 +11.9 = +8.6. No directional glyph appears for V in any state.',
    status: 'FIXED',
    concepts_affected: CONCEPT,
    fixed_in_files: RENDERER,
    row_type: 'incident',
  },
  {
    bug_class: 'soc_every_charge_contributes_nonzero_term_far_term_highlight',
    title: 'STATE_3: a distant charge still adds a nonzero kqᵢ/rᵢ term (highlight_term "q1_far" brightens the far term) — distance shrinks a term via 1/r, it never zeroes it; the renderer must keep summing ALL charges regardless of distance',
    severity: 'MAJOR',
    owner_cluster: R,
    root_cause: 'A renderer that drops far terms (or fakes a "nearest charge only" shortcut) would confirm the misconception that distant charges contribute nothing; emphasis by SIZE rather than brightness would violate Rule 29.',
    prevention_rule: 'The running sum always loops every charge in config.charges[]; highlight_term "q1_far" is honoured by BRIGHTNESS only — the far charge tag holds full opacity while the others dim to ~0.4 (applyGlowEmphasis spirit; no resize). The far term stays a small-but-nonzero number (e.g. +2.8 at r≈4.2), and the total reflects it (+4.2, vs +1.4 if dropped).',
    probe_type: 'manual',
    probe_logic: 'STATE_3 at the far_term reveal: the far q1 tag is the brightest of the three (others dimmed, none resized), reads a small positive ~+2.8, and the total reads +4.2.',
    status: 'FIXED',
    concepts_affected: CONCEPT,
    fixed_in_files: RENDERER,
    row_type: 'incident',
  },
  {
    bug_class: 'soc_equal_pair_cancels_exactly_signs_decide_total',
    title: 'STATE_4 (supporting aha): an equal +q and −q equidistant from the probe (px=0 exact) cancel exactly to 0 in the signed sum (+8.9 and −8.9 → 0), leaving the total = q3 alone (+12.0) — the renderer must compute the live signed sum, not the count of nearby charges',
    severity: 'MAJOR',
    owner_cluster: R,
    root_cause: 'If the per-charge numbers are faked or the total is keyed to "two charges nearby ⇒ big V", the exact cancellation (the proof that signs + distances decide the total) is lost.',
    prevention_rule: 'With probe_x=0 exactly, rᵢ for q1 and q2 are equal, so V1=+8.9 and V2=−8.9 are computed from the same closed form and sum to exactly 0 on screen; the running-sum panel shows the pair cancel and the total resolves to just q3 (+12.0). The numbers are always the live computed Vi, never authored constants.',
    probe_type: 'manual',
    probe_logic: 'STATE_4 at the cancellation reveal: the q1/q2 tags read equal-and-opposite (+8.9 / −8.9), the panel shows them summing to 0, and the total reads +12.0 (q3 alone).',
    status: 'FIXED',
    concepts_affected: CONCEPT,
    fixed_in_files: RENDERER,
    row_type: 'incident',
  },
  {
    bug_class: 'soc_field_contrast_scalar_sum_vs_vector_E_arrows',
    title: 'STATE_5 (PRIMARY aha): the scalar V collapses to one bright total while the SAME charges draw dim E arrows pointing different directions (Ei = DEMO_E·|qᵢ|/max(rᵢ²,clamp²), along probe−chargeᵢ for +q / opposite for −q) — there is deliberately NO closed-form resultant; the field needs vector add',
    severity: 'MAJOR',
    owner_cluster: R,
    root_cause: 'If the renderer drew a single resultant E arrow (or no arrows), the contrast "V is one easy scalar sum / E needs tip-to-tail component addition" would be lost — that contrast IS the aha.',
    prevention_rule: 'In show_field_contrast states the scalar side (running-sum panel + total) stays BRIGHT while one E arrow per charge is rebuilt each frame from the per-charge field magnitude + direction and rendered DIM (Rule 29 brightness, not size). The arrows are NOT summed into a resultant — they sprawl in different directions to show the work vector addition requires.',
    probe_type: 'manual',
    probe_logic: 'STATE_5 at the field_contrast reveal: the running-sum total is bright + collapsed to one number, and three dim green E arrows fan out from the three charges in different directions (no single resultant arrow).',
    status: 'FIXED',
    concepts_affected: CONCEPT,
    fixed_in_files: RENDERER,
    row_type: 'incident',
  },
  {
    bug_class: 'soc_q3_slider_and_draggable_probe_relive_all_terms',
    title: 'STATE_6 explorer: the q3_value slider must re-evaluate q3 live (flip/scale) and the draggable probe must re-drive px,py — every per-charge tag, the running-sum panel, the live readout and the DOM breakdown update at once, with idle_auto_sweep a pure fn of the state clock',
    severity: 'MAJOR',
    owner_cluster: R,
    root_cause: 'A slider/probe wired only to a label (not to PM_socQ3 / PM_socPx,PM_socPy + the live Σ recompute) would change the number on the slider but leave the sum stale — the bug-10 PARAM_UPDATE-not-recomputing class. A clock-gated slider state would render blank in the headless capture.',
    prevention_rule: 'The q3 slider sets PM_socQ3 (q3 charge takes its live signed magnitude from it); the drag projects the pointer onto the XY slice and clamps px,py to the variable bounds; both recompute Σ Vi every frame and redraw the tags/panel/readout/breakdown; both emit PARAM_UPDATE on explorer_id (Rule 27). The state renders at FULL on entry (no clock gate); idle_auto_sweep is a Lissajous in (time − stateStartTime) that stops the instant the user grabs the probe.',
    probe_type: 'manual',
    probe_logic: 'STATE_6: dragging q3 from +2 to −2 flips q3 tag sign + rescales the total live; dragging the probe across the y-axis drives the +q1/−q2 pair to cancel and the total to track; with no interaction the probe gently auto-sweeps and the sums update deterministically.',
    status: 'FIXED',
    concepts_affected: CONCEPT,
    fixed_in_files: RENDERER,
    row_type: 'incident',
  },
  {
    bug_class: 'soc_devstatemeta_potential_system_block_registered_same_change',
    title: 'electric_potential_system_of_charges per-state `potential` reveal keys must be registered in deriveStateMeta in the SAME change (else THE EYE classifies every state at the 1500ms default and false-fails the late reveals; S3/S4/S5 reveal-then-hold tails must classify reveal_hold, S6 interactive — the D7 lesson)',
    severity: 'MAJOR',
    owner_cluster: R,
    root_cause: 'A new field_3d arc whose per-state `potential` keys (per_charge_tags_at_ms, contribution_values_at_ms, running_sum_at_ms, far_term_at_ms, total_with_far_at_ms, cancellation_at_ms, total_just_q3_at_ms, field_contrast_at_ms, split_callout_at_ms) are not recognised by deriveStateMeta classifies at the 1500ms default → D7/D1p false-fail (the field3d_scenario_missing_devstatemeta_recognition scar), and a reveal-then-hold static tail gets flagged as a dead animation.',
    prevention_rule: 'Add the system_of_charges `potential` keys to deriveStateMeta in the SAME change: F3D_REVEAL_KEYS already includes "potential"; maxRevealForField3dState pins past every *_at_ms beat; deriveMotionExpectations declares NO motion (no sweep/route/release — every state is reveal-then-hold); deriveHoldExpectations marks S6 (draggable_probe / show_sliders) interactive and S1–S5 reveal_hold via the generic `potential` fallback (so a completed-then-held reveal is NOT a dead-animation false-fail).',
    probe_type: 'manual',
    probe_logic: 'Run deriveMaxRevealTimeMs/deriveHoldExpectations/deriveMotionExpectations on the concept JSON: S1=reveal_hold (>contribution_values_at_ms 12500), S2=reveal_hold (>running_sum_at_ms 9500), S3=reveal_hold (>total_with_far_at_ms 14500), S4=reveal_hold (>total_just_q3_at_ms 16000), S5=reveal_hold (>split_callout_at_ms 15000), S6=interactive — none at the bare 1500ms default; no state declared motion.',
    status: 'FIXED',
    concepts_affected: CONCEPT,
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
-- BUILDING the system_of_charges field_3d primitives
-- (electric_potential_system_of_charges, V = Σ k qᵢ/rᵢ — N-charge scalar sum).
-- Generated by src/scripts/_seed_engine_bug_queue_system_of_charges_build.ts — idempotent.
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
  const sqlPath = join(process.cwd(), 'supabase_migrations', 'supabase_2026-06-29_seed_engine_bug_queue_system_of_charges_build_migration.sql');
  writeFileSync(sqlPath, emitSql(rows), 'utf-8');
  console.log(`Wrote archival SQL: ${sqlPath} (${rows.length} rows)`);

  console.log('Upserting system_of_charges build rows...');
  await upsertBatch(rows, 'system_of_charges_build');

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
