/**
 * engine_bug_queue — the motion-registry audit + the two gate-honesty fixes
 * (2026-08-13, continuation of the Ch.7 chapter-end session).
 *
 * WHY THESE ROWS. PROGRESS.md's next-task (2) was "audit deriveMotionExpectations
 * for unregistered scenario_types, because every unregistered scenario is a
 * concept whose D5 has never run". The audit now exists (`npm run
 * check:motion-registry`) and the number is the story: 344 of 653 baseline-locked
 * states — 52.7% — carry an UNKNOWN motion expectation, so THE EYE's motion gate
 * has never executed once on 41 of 96 baseline-locked concepts, most of them
 * DEPLOYED to teachers. Two existing OPEN rows predicted this shape from single
 * concepts (eye_gate_skipped_for_an_unregistered_scenario_is_counted_as_a_pass,
 * eye_manifest_counts_skipped_checks_as_passed…); this measures the fleet.
 *
 * The reporting half of both prevention rules is now implemented, so the
 * `eye_manifest_counts…` row flips to FIXED. The registration half is a
 * per-scenario judgement job and is filed OPEN, with the work-list in the probe.
 *
 * ⚠ TWO ROWS RECORD FIXES THAT LANDED IN THE WRONG NUMBER OF PLACES FIRST — the
 * durable lesson of this session. A gate fix applied to ONE caller of a shared
 * deriver leaves every sibling caller blind, and the sibling that WRITES
 * baselines (visual_approve) is worse than the one that reads them.
 *
 * Idempotent: upsert onConflict 'bug_class'. Also writes archival SQL.
 * Run: npx tsx --env-file=.env.local src/scripts/_seed_engine_bug_queue_motion_registry_audit.ts
 */
import '@/lib/loadEnvLocal';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const SESSION = 'session_2026-08-13_motion_registry_audit';

type Owner =
  | 'alex:architect' | 'alex:physics_author' | 'alex:json_author' | 'alex:chemistry_author' | 'alex:mathematics_author'
  | 'peter_parker:field3d_surgeon' | 'peter_parker:renderer_primitives' | 'peter_parker:runtime_generation'
  | 'peter_parker:visual_validator' | 'ambiguous';
type Severity = 'CRITICAL' | 'MAJOR' | 'MODERATE';
type Status = 'OPEN' | 'FIXED' | 'DEFERRED' | 'NOT_REPRODUCING' | 'FALSE_POSITIVE';
type ProbeType = 'sql' | 'js_eval' | 'manual' | 'vision_model';
type RowType = 'incident' | 'probe_definition' | 'directive';

interface Row {
  bug_class: string; title: string; severity: Severity; owner_cluster: Owner;
  root_cause: string; prevention_rule: string; probe_type: ProbeType; probe_logic: string;
  status: Status; concepts_affected: string[]; fixed_in_files: string[]; row_type: RowType;
  subject?: 'physics' | 'chemistry' | 'mathematics' | 'subject_neutral';
}

const SPEC = 'src/lib/validators/visual/spec.ts';
const PIXEL = 'src/lib/validators/visual/pixelGate.ts';
const REGR = 'src/lib/validators/visual/regressionGate.ts';
const SKIPREP = 'src/lib/validators/visual/skipReport.ts';
const EYES = 'src/scripts/visual_eyes.ts';
const SMOKE = 'src/scripts/smoke_visual_validator.ts';
const APPROVE = 'src/scripts/visual_approve.ts';
const SHOT = 'src/lib/validators/visual/screenshotter.ts';
const DERIVE = 'src/lib/validators/visual/deriveStateMeta.ts';
const AUDIT = 'src/scripts/audit_motion_registry.ts';

const rows: Row[] = [
  // ───────────────── FIXED: the reporting lie ─────────────────
  {
    bug_class: 'eye_manifest_counts_skipped_checks_as_passed_so_a_32_of_32_headline_hides_that_the_per_state_motion_assertion_never_ran',
    title: 'THE EYE counted skipped checks as passes — now reported as three separate counts, with the unclassified scenario named',
    severity: 'MODERATE', owner_cluster: 'peter_parker:visual_validator',
    root_cause:
      'A check that did not execute is not a pass. Both CLI reporters computed passed = total - failed, and every skip emits passed:true (the gate fails CLOSED on missing inputs, which is correct), so a run whose motion gate never executed printed a perfect green. Measured on conformations_of_ethane (32/32 with 8 skips) and lines_and_planes_in_space (39/39 with 9). FLEET SCALE MEASURED 2026-08-13 by the new registry audit: 344 of 653 baseline-locked states (52.7%) carry an unknown motion expectation, so this headline was lying on 41 of 96 concepts, not on a handful of new builds. FIXED 2026-08-13: CheckResult.skipped is set at all 13 skip sites in pixelGate + regressionGate; skipReport.ts owns the accounting; both reporters print "N checks - P ran and passed - S SKIPPED (never ran) - F failed", a per-reason GATE COVERAGE breakdown, a per-check symbol that is a circled-slash rather than a tick, and a blackout warning NAMING the unclassified scenario when D5 skipped every state. The verdict line can no longer read "clean" while any check is missing. Verified with a three-case probe: a genuine all-pass run still reports clean (no false alarm), and states that DECLARE stillness do not raise the blackout warning.',
    prevention_rule:
      'A skip is never summed into passed, in any reporter, and "no failures" is never printed as "clean" while checks are missing. New reporters read skipReport.ts rather than recomputing passed = total - failed. A scenario_type the motion classifier cannot resolve is NAMED in the output (describeScenario), so a new engine surface cannot silently opt out of the motion level.',
    probe_type: 'js_eval',
    probe_logic:
      'Run npm run visual:eyes -- <id> and read the headline: it must show a SKIPPED count distinct from passed. On any concept in the check:motion-registry "D5 NEVER RUNS" list the run must print the MOTION GATE NEVER RAN blackout naming the scenario. grep for "total - failed" in any new reporter is a defect.',
    status: 'FIXED',
    concepts_affected: ['conformations_of_ethane', 'organic_structure', 'lines_and_planes_in_space', 'vector_products_in_space'],
    fixed_in_files: [SPEC, PIXEL, REGR, SKIPREP, EYES, SMOKE],
    row_type: 'incident', subject: 'subject_neutral',
  },

  // ───────────────── OPEN: the coverage hole itself ─────────────────
  {
    bug_class: 'motion_expectation_registry_covers_half_the_fleet_so_d5_has_never_run_on_41_baseline_locked_concepts',
    title: 'deriveMotionExpectations is unregistered for 41 of 96 baseline-locked concepts — 344/653 states (52.7%) have zero motion coverage',
    severity: 'MAJOR', owner_cluster: 'peter_parker:field3d_surgeon',
    root_cause:
      'deriveMotionExpectations is a per-scenario branch chain, and an unmatched scenario returns undefined for every state. Undefined is correct as a policy ("never guess") but it is silently load-bearing in TWO gates at once: (1) D5 skips the state, and until 2026-08-13 that skip was counted as a pass, so a dead animation and a working one produced identical output; (2) visual_approve computes compare = !(expectation === true), so undefined is treated as "declared still" and live compare is switched ON for a state nobody has established is still — which is how electric_potential_point_charge got a 2.90% live baseline that could never reproduce (found 2026-08-11, cost a session to root-cause). MEASURED 2026-08-13 with npm run check:motion-registry: 41 concepts have NO registered branch at all (every state unknown), 20 more are partial, 61 concepts live-compare at least one unknown state. The largest single gap is field_3d scenario newtons_laws_body: 13 concepts / 69 states, where the undefined is DELIBERATE per the comment in deriveStateMeta (nothing is asserted about a repeating push-off state) — which is exactly the problem: a deliberate non-assertion and an unregistered oversight are INDISTINGUISHABLE to every reader and every tool. Other whole-scenario gaps: point_charge_positive (3 concepts, 20 states), gauss_law_sphere (2/14), electric_flux (10), parallel_currents_force (9), coulombs_law_force (8), plus 30-odd single-concept scenarios and the chemistry/mathematics 2D concepts whose configs carry no renderer block.',
    prevention_rule:
      'A scenario_type is registered in deriveMotionExpectations in the SAME change as its builder, and the registration is verified by an EYE run showing D5 RUNNING — not by the presence of code. When a state legitimately asserts nothing, declare that EXPLICITLY (false, or a named unasserted marker) rather than leaving it undefined: an intentional non-assertion must not be indistinguishable from a missing branch. Before any fleet-wide claim about motion coverage, run the audit — a pass count is not coverage.',
    probe_type: 'js_eval',
    probe_logic:
      'npm run check:motion-registry (also --all, or per-concept). Fails nothing by design (it is a coverage report, not a gate): reports fully-unregistered / partial / registered counts, the scenario_type work-list ordered by unknown-state count, and the concepts whose baselines live-compare an unknown state. Baseline 2026-08-13: 41 fully unregistered, 20 partial, 35 registered, 344/653 states unknown, 61 concepts at baseline risk. Any INCREASE in those numbers means a new scenario shipped without registering.',
    status: 'OPEN',
    concepts_affected: [
      'block_on_incline', 'connected_bodies', 'conservative_vs_nonconservative_forces', 'free_body_diagram',
      'friction_force', 'kinetic_energy_definition', 'newton_first_law', 'newton_second_law', 'newton_third_law',
      'normal_force', 'positive_negative_zero_work', 'rolling_friction', 'tension_force', 'work_done_by_constant_force',
      'work_energy_theorem', 'electric_field_point_charge', 'electric_potential_point_charge', 'equipotential_surfaces',
      'gauss_law', 'gauss_law_line', 'gauss_law_magnetism', 'gauss_law_sheet', 'gauss_law_solid_sphere', 'gauss_law_sphere',
      'electric_flux', 'electric_field_dipole', 'electric_potential_system_of_charges', 'potential_energy_system_of_charges',
      'force_on_charge_in_field', 'force_on_current_carrying_wire', 'parallel_currents_force', 'capacitance',
      'charge_distribution', 'coulombs_law', 'cyclotron_period_independent_of_speed', 'helical_motion_charge_in_uniform_B',
      'circular_motion_charge_in_uniform_B', 'magnetic_flux', 'magnetic_force_moving_charge',
      'magnetic_force_perpendicular_no_work', 'magnetic_force_direction_right_hand_rule', 'vsepr_molecular_shapes',
    ],
    fixed_in_files: [AUDIT, DERIVE], row_type: 'incident', subject: 'subject_neutral',
  },

  // ───────────────── FIXED: the fix that landed in 1 of 3 call sites ─────────────────
  {
    bug_class: 'gate_source_fix_landed_in_one_caller_of_the_shared_deriver_and_two_siblings_stayed_blind',
    title: 'The 2026-08-09 wrong-source fix went into visual_eyes only — smoke_visual_validator and visual_approve still read the cache alone',
    severity: 'MAJOR', owner_cluster: 'peter_parker:visual_validator',
    root_cause:
      'eye_motion_gate_read_the_cached_config_which_for_a_hand_seeded_concept_carries_no_states was closed on 2026-08-09 by changing visual_eyes.ts to deriveMotionExpectations(conceptJson ?? cached.physics_config). Two other callers of the same deriver were never touched, and were found on 2026-08-13 by reading them: smoke_visual_validator.ts (the PAID vision escalation) and visual_approve.ts (the tool that WRITES the baselines). Both still read cached.physics_config alone, so on every hand-seeded concept — chemistry, mathematics, and parametric physics, whose seeded physics_config carries only epic_l_path with no field_3d_config and no states — the map came back EMPTY. Consequences differ by caller and the write side is worse: the escalation you PAY for was blinder than the free gate it escalates from, and visual_approve stamped compare:true on every state including ones that visibly animate, manufacturing baselines that cannot reproduce and training everyone to re-approve without looking. FIXED 2026-08-13: both now read conceptJson ?? cached.physics_config; visual_approve additionally prints which states were live-compared on an UNKNOWN expectation instead of assuming stillness silently.',
    prevention_rule:
      'A wrong-source read is fixed at EVERY call site of that deriver in the SAME change — grep the deriver name across the repo before claiming the class is closed. Ranking matters: a tool that WRITES approved artifacts from a bad read is more damaging than one that merely reports, so audit the writers first. A row is FIXED when the product has the thing it describes, not when one change intended to deliver it has landed.',
    probe_type: 'js_eval',
    probe_logic:
      'grep -n "deriveMotionExpectations(" src/scripts src/lib — every call site must pass conceptJson ?? cached.physics_config (or an equivalent JSON-first source), never cached.physics_config alone. Currently 4 call sites: visual_eyes, smoke_visual_validator, visual_approve, audit_motion_registry.',
    status: 'FIXED',
    concepts_affected: ['lines_and_planes_in_space', 'vector_products_in_space', 'scalar_vs_vector', 'unit_circle_to_sine_wave', 'bohr_model_energy_levels'],
    fixed_in_files: [SMOKE, APPROVE], row_type: 'incident', subject: 'subject_neutral',
  },
  // ───────────────── FIXED: a cap that was a bet on frame rate ─────────────────
  {
    bug_class: 'eye_sim_time_pin_aborts_a_working_but_slow_scene_because_the_wall_cap_is_a_bet_on_frame_rate',
    title: 'THE EYE aborted magnetic_field_concept_B for three sessions on a pin it was 91% of the way to and still climbing',
    severity: 'MAJOR', owner_cluster: 'peter_parker:visual_validator',
    root_cause:
      'Under a SET_TIME_FREEZE pin the renderer forces one 1/60s step per RENDERED FRAME (Rule 36), so reaching a 12500ms pin costs 750 headless frames and the wall cap targetMs*3.5+8000 is really an assertion that the scene sustains about 17fps. magnetic_field_concept_B STATE_5 measured 11344/12500ms in 51.8s (219 sim-ms/s, about 13fps) on a loaded box: 91% there, still advancing, aborted 1.2% short — EYE_CAPTURE_ABORTED in three consecutive sessions (4128/4200 and 4048/4200 on 2026-08-11, 11344/12500 on 2026-08-13), which is why the concept was re-baselined but never verified against its own baseline. Widening the constant again would only move the threshold. FIXED 2026-08-13: pollSimTimeReached takes an opt-in extendWhileProgressingUntilMs, so past the budget it keeps waiting while the pinned clock advances at least 100ms per 4s window and gives up the moment it flatlines — which catches a renderer that ignores the pin about 12x FASTER than the old cap did, while letting a slow scene finish. Opt-in, so the dense per-frame loop keeps its exact previous timing. The abort message now carries the observed sim-ms/s and implied fps, and says whether the clock flatlined (renderer defect) or was still climbing (machine too slow). VERIFIED: the same concept captured 7 states + 179 dense frames in 1063s on the same loaded machine, and D5 ran on 6 of 7 states for the first time.',
    prevention_rule:
      'Never gate a frame-rate-bound wait on wall-clock elapsed alone: assert on PROGRESS (is the clock still advancing?) and keep elapsed only as a budget plus an absolute ceiling. A cap tuned on one machine is a hardware assumption, and the failure it produces is either a false abort or — worse — a silently wrong-phase frame.',
    probe_type: 'js_eval',
    probe_logic:
      'npm run visual:eyes -- magnetic_field_concept_B must complete on a loaded machine. On a renderer that genuinely ignores SET_TIME_FREEZE the run must still abort within about 12s per state with gaveUp: stalled, NOT run to the ceiling.',
    status: 'FIXED', concepts_affected: ['magnetic_field_concept_B'], fixed_in_files: [SHOT],
    row_type: 'incident', subject: 'subject_neutral',
  },

  // ───────────────── FIXED: the frozen frame was captured anyway ─────────────────
  {
    bug_class: 'frozen_baseline_frame_is_captured_even_when_its_pin_was_never_reached_so_a_mid_reveal_frame_becomes_the_baseline',
    title: 'captureFrozenFrame ignored poll.reached — the H2 baseline frame could be photographed mid-reveal, silently',
    severity: 'MAJOR', owner_cluster: 'peter_parker:visual_validator',
    root_cause:
      'The primary capture was made FATAL on a missed pin (2026-07-31) because a frame that never reached its pin shows an arbitrary phase and every downstream gate then treats it as evidence. captureFrozenFrame polled the same way and then screenshotted REGARDLESS, with no warning — and its output is the frame visual:approve freezes as the deterministic H2 baseline. Its cap (atMs*2.5+4000) is also tighter than the primary path it is supposed to be more deterministic than. MEASURED on magnetic_field_concept_B STATE_5 (2026-08-13): a 12500ms pin allows 35.25s while this machine needed about 57s, so the frozen frame was taken mid-reveal — the vector-field arrows sat at a different stage of their staggered build. Proof it was the harness and not the renderer: within a SINGLE run the live capture (fatal path, pin reached) and the frozen capture disagreed by 3.71%, versus 1.37% in the run the baseline came from, while H2 reported a 3.57% regression in a renderer whose last commit predated the baseline by 3.5 hours. FIXED 2026-08-13: same progress-extension as the primary path, and a frame that still misses its pin is DROPPED with a warning, so H2 reports an honest skip instead of diffing an arbitrary phase.',
    prevention_rule:
      'A capture that missed its pin is never stored and never compared — drop it and report the gap. Any path that produces an APPROVED artifact must be at least as strict as the paths that merely read one; if the primary capture aborts on a condition, the baseline capture cannot shrug at it.',
    probe_type: 'js_eval',
    probe_logic:
      'Search the EYE run warnings for "Frozen frame DROPPED". If present, H2 for that state must report Skipped (no frozen frame in this capture), never a regression percentage.',
    status: 'FIXED', concepts_affected: ['magnetic_field_concept_B'], fixed_in_files: [SHOT],
    row_type: 'incident', subject: 'subject_neutral',
  },

  // ───────────────── OPEN: the renderer half, routed to the surgeon ─────────────────
  {
    bug_class: 'current_flow_dots_and_field_arrows_accumulate_dtstep_through_the_freeze_so_pause_does_not_stop_the_current',
    title: 'straight_wire_current + parallel_currents_force beads and field arrows ignore the heldAtPin freeze guard: Pause does not stop them, and no current-ON baseline reproduces',
    severity: 'MAJOR', owner_cluster: 'peter_parker:field3d_surgeon',
    root_cause:
      'FOUR PATH-DEPENDENT accumulators in field_3d_renderer.ts advance with no freeze guard — straight_wire_current: swUd.dotPhase += dtStep * dotSpeed * iScale (the yellow current beads) and swUd.swPhase += dtStep * effRotRate * swRateScale (the rotating field-line arrows); parallel_currents_force: ud.dotPhase += 0.016 * __pmSteps * dotSpeed and ud.swPhase += 0.016 * __pmSteps * orbitRate. Every sibling in the same animate loop passes heldAtPin ? 0 : dtStep for exactly this reason — the solenoid current_flow_dot does it with the comment "the freeze-determinism guard", torque_on_loop with "the marching current dots still integrate by dt, so pass 0 while held at the pin". These four never got it, so their phase is a function of HOW MANY FRAMES THE BROWSER DREW, not of sim time. TWO CONSEQUENCES. (1) PRODUCT: the teacher Pause button implements Rule 26b by posting SET_TIME_FREEZE {at_ms: readSimTimeMs()} (build_review_site.ts freeze()) — the SAME mechanism as the gate pin — so on Pause the whole sim holds while the current keeps flowing and the field arrows keep rotating. (2) GATE: no current-ON state can reproduce its baseline. MEASURED 2026-08-13 on magnetic_field_concept_B with the decisive control — TWO EYE runs, same renderer, same machine, 28 minutes apart: run-vs-RUN frozen diffs 2.03% (S1), 2.63% (S2), 1.53% (S4), 4.16% (S5), 1.63% (S6), 1.52% (S7), i.e. the SAME magnitude as run-vs-baseline (2.03 / 2.10 / 1.60 / 2.23 / 1.94 / 1.52), while STATE_3 — the ONE state with the current switched OFF (mode source_off, no beads) — is EXACTLY 0.00% on every comparison, live and frozen. The noise straddles the 2% tolerance, so which checks fail is a coin flip per run: 5 failures in one run, 4 (a different set) in the next. The renderer and concept JSON are provably unchanged since the baseline (last field_3d commit 2026-08-11T08:53Z, baseline approved 12:28Z), and the STATE_2 diff mask is almost entirely the bead column on the wire.',
    prevention_rule:
      'Every per-frame accumulator in a renderer takes the freeze guard (heldAtPin ? 0 : dtStep) in the same edit that creates it — a pure function of state-local time needs no guard, an accumulator ALWAYS does. The test is not "does it look right", it is "does the teacher Pause button stop it, and does the same pin reproduce the same pixels twice". Two runs of THE EYE on a current-ON state must diff 0.00% on the frozen frame; anything else means an unguarded accumulator, and re-approving the baseline hides it rather than fixing it.',
    probe_type: 'js_eval',
    probe_logic:
      'grep field_3d_renderer.ts for "+= dtStep" and "+= 0.016 * __pmSteps" and check each hit gates its dt on heldAtPin (4 unguarded as of 2026-08-13: lines ~10834, ~10846, ~81407, ~81441). Behaviourally: run npm run visual:eyes -- <id> TWICE and diff the two runs\' <STATE>__frozen.png — a non-zero diff on an unchanged renderer is this bug, and the current-OFF state of the same concept diffing 0.00% is the control that proves it. Do NOT re-approve the baselines to make H2 green, and do NOT raise the tolerance: the flake is the symptom, and a 2% tolerance over ~2% noise fails and passes at random.',
    status: 'OPEN', concepts_affected: ['magnetic_field_concept_B', 'magnetic_field_wire', 'parallel_currents_force'], fixed_in_files: [],
    row_type: 'incident', subject: 'physics',
  },
];

function sqlStr(s: string): string { return `'${s.replace(/'/g, "''")}'`; }
function sqlArr(a: string[]): string { return a.length ? `ARRAY[${a.map(sqlStr).join(', ')}]::text[]` : 'ARRAY[]::text[]'; }
function sqlRow(r: Row): string {
  return `(${sqlStr(r.bug_class)}, ${sqlStr(r.title)}, ${sqlStr(r.severity)}, ${sqlStr(r.owner_cluster)}, ` +
    `${sqlStr(r.root_cause)}, ${sqlStr(r.prevention_rule)}, ${sqlStr(r.probe_type)}, ${sqlStr(r.probe_logic)}, ` +
    `${sqlStr(r.status)}, ${sqlArr(r.concepts_affected)}, ${sqlArr(r.fixed_in_files)}, ${sqlStr(SESSION)}, ` +
    `${sqlStr(r.row_type)}, ${sqlStr(r.subject ?? 'subject_neutral')})`;
}
function emitSql(all: Row[]): string {
  const cols = 'bug_class, title, severity, owner_cluster, root_cause, prevention_rule, probe_type, probe_logic, status, concepts_affected, fixed_in_files, discovered_in_session, row_type, subject';
  return `-- 2026-08-13 — motion-registry audit + gate-honesty fixes: ${all.length} rows.\n` +
    '-- Generated by src/scripts/_seed_engine_bug_queue_motion_registry_audit.ts — idempotent.\n\n' +
    `INSERT INTO engine_bug_queue (${cols}) VALUES\n${all.map(sqlRow).join(',\n')}\n` +
    'ON CONFLICT (bug_class) DO UPDATE SET status = EXCLUDED.status, root_cause = EXCLUDED.root_cause,\n' +
    '  prevention_rule = EXCLUDED.prevention_rule, probe_logic = EXCLUDED.probe_logic,\n' +
    '  title = EXCLUDED.title, severity = EXCLUDED.severity, owner_cluster = EXCLUDED.owner_cluster,\n' +
    '  concepts_affected = EXCLUDED.concepts_affected, fixed_in_files = EXCLUDED.fixed_in_files,\n' +
    '  subject = EXCLUDED.subject;\n';
}

async function main(): Promise<void> {
  const sqlPath = join(process.cwd(), 'supabase_migrations', 'supabase_2026-08-13_seed_engine_bug_queue_motion_registry_audit_migration.sql');
  writeFileSync(sqlPath, emitSql(rows), 'utf-8');
  console.log(`Wrote archival SQL: ${sqlPath} (${rows.length} row(s))`);

  const payload = rows.map(r => ({
    ...r,
    subject: r.subject ?? 'subject_neutral',
    discovered_in_session: SESSION,
    fixed_at: r.status === 'FIXED' ? new Date().toISOString() : null,
  }));
  const { error } = await supabaseAdmin.from('engine_bug_queue').upsert(payload, { onConflict: 'bug_class' });
  if (error) { console.error(`✗ upsert failed: ${error.message}`); process.exit(1); }
  const open = rows.filter(r => r.status === 'OPEN').length;
  console.log(`✓ upserted ${payload.length} row(s) — ${rows.length - open} FIXED, ${open} OPEN`);
}

main();
