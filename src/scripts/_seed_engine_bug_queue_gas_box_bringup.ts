/**
 * engine_bug_queue rows from the gas_box scenario bring-up (2026-07-28) — the
 * first chemistry concept on the particle_field family (kinetic_particle_theory).
 *
 * All seven incidents were found by DRIVING the sim, not by reading gates:
 * THE EYE reported 31/31 deterministic checks passed and validate:chemistry 3/3
 * PASS over a sim whose gas heated 80x when a teacher dragged the volume slider
 * twice. Every row below is FIXED and re-verified by a headless slider sweep.
 *
 * The 8th row is a DIRECTIVE capturing the verification-methodology error that
 * nearly produced two false CRITICAL filings this session.
 *
 * Idempotent: upsert onConflict 'bug_class'.
 * Run: npx tsx --env-file=.env.local src/scripts/_seed_engine_bug_queue_gas_box_bringup.ts
 */
import '@/lib/loadEnvLocal';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const SESSION = 'session_2026-07-28_gas_box_scenario_bringup';
const RENDERER = 'src/lib/renderers/particle_field_renderer.ts';
const SEEDER = 'src/scripts/_seed_chemistry_cache.ts';
const CONCEPT = 'kinetic_particle_theory';

type Owner =
  | 'alex:architect' | 'alex:physics_author' | 'alex:json_author' | 'alex:chemistry_author'
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

const rows: Row[] = [
  {
    bug_class: 'gas_box_moving_wall_reflection_one_sided',
    title: 'gas_box piston added energy on compression but never removed it on expansion — kinetic energy RATCHETED 397 -> 1545 -> 31476 over two teacher slider drags',
    severity: 'CRITICAL',
    owner_cluster: 'peter_parker:renderer_primitives',
    root_cause:
      `VERIFIED + FIXED 2026-07-28. gasIntegrate's right-wall branch used the one-sided form ` +
      `v = |vx| + 2*max(-gasPistonVx, 0). A CLOSING wall (gasPistonVx<0) therefore added 2|v_wall| ` +
      `to every rebound — correct — but a RECEDING wall (gasPistonVx>0) hit the max() floor and ` +
      `removed nothing, so expansion never cooled the gas. Energy accumulated without bound across ` +
      `compression/expansion cycles. Measured on the review site via rail-driven slider drags in ` +
      `STATE_4: total kinetic energy 397 (baseline) -> 1545 (V=0.35) -> 1545 (V=1, no cooling) -> ` +
      `31476 (V=0.5), and the P*A/N*T readout 0.78 -> 52.7. Fixed by the SIGNED moving-wall ` +
      `reflection v = max(|vx| - 2*gasPistonVx, 0.01), which is the correct physics in both ` +
      `directions. Re-verified: kinetic energy holds at exactly 397 across every piston move and ` +
      `P*A/N*T stays in 0.60-0.81.`,
    prevention_rule:
      'Any moving boundary that does work on particles MUST use a signed wall velocity so it both ' +
      'adds energy when advancing and removes it when receding. A one-sided max()/clamp on a wall ' +
      'velocity is an energy ratchet by construction. Probe: cycle the volume control min->max->min ' +
      'and assert total kinetic energy returns to its starting value within a few percent — a ' +
      'single compression looks correct and hides this entirely.',
    probe_type: 'js_eval',
    probe_logic:
      'Drive the volume slider through min -> max -> original via the review player, sampling ' +
      'sum(0.5*m*(vx^2+vy^2)) after each settle. FAIL if the final value exceeds the initial by >5%.',
    status: 'FIXED',
    concepts_affected: [CONCEPT],
    fixed_in_files: [RENDERER],
    row_type: 'incident',
  },
  {
    bug_class: 'gas_box_temperature_setpoint_not_measured',
    title: 'gas_box thermometer and P*A/N*T readout reported a stored SETPOINT, not the gas\'s real temperature — the instrument read 300 K while the gas was ~80x hotter',
    severity: 'CRITICAL',
    owner_cluster: 'peter_parker:renderer_primitives',
    root_cause:
      `VERIFIED + FIXED 2026-07-28. gasTempK was a setpoint written by gasThermostat only when the ` +
      `authored/slider TARGET changed. Piston work changes the gas's real temperature without ` +
      `touching the target, so the two diverged silently: the thermostat's early-out ` +
      `(|target - gasTempK| < 1e-6) meant it never noticed. Every quantity derived from T was then ` +
      `computed against a number the gas no longer had — most damagingly the P*A/N*T readout, which ` +
      `is STATE_6's entire teaching payoff, reading 52.7 instead of ~0.79. It also falsified the ` +
      `authored STATE_4 narration ("the particles have not changed speed"). Fixed by adding ` +
      `gasMeasuredT() (inverts mean kinetic energy, 2D equipartition so mass-independent) and ` +
      `thermostatting FROM the measured value, which closes the loop on any work the walls do. ` +
      `Default is isothermal so compression stays a pure Boyle beat (Rule 32b); a state may set ` +
      `adiabatic:true to teach compression heating with the thermometer tracking honestly.`,
    prevention_rule:
      'An instrument that displays a physical quantity must READ that quantity from sim state, never ' +
      'echo the setpoint that was requested (Rule 33d: a live numeric reading, not a decorative ' +
      'dial). Where a control sets a target, derive the displayed value by measurement and let the ' +
      'controller drive measurement toward target — otherwise any other process that perturbs the ' +
      'quantity makes the instrument lie without any gate noticing.',
    probe_type: 'js_eval',
    probe_logic:
      'Assert the displayed temperature agrees with the measured one: ' +
      '|gasTempK - gasMeasuredT()| / gasTempK < 0.05 after any volume change has settled.',
    status: 'FIXED',
    concepts_affected: [CONCEPT],
    fixed_in_files: [RENDERER],
    row_type: 'incident',
  },
  {
    bug_class: 'gas_box_slider_default_overrode_authored_state_value',
    title: 'A slider\'s DEFAULT silently beat every guided state\'s authored value — states authored at T=700/T=800 all rendered at 300 K',
    severity: 'MAJOR',
    owner_cluster: 'peter_parker:renderer_primitives',
    root_cause:
      `VERIFIED + FIXED 2026-07-28. gasTargetT/gasTargetPistonF/gasCount tested hasSlider(id) BEFORE ` +
      `the state's authored value, so any concept exposing a control for its explore state had that ` +
      `control's default overrule every guided state. "Heat the gas" states rendered at the baseline ` +
      `temperature and the piston never compressed. Fixed with the drag-seize pattern already used ` +
      `by ohms_law/resistivity in this renderer: slider wins only once userTouched[id] is set, and ` +
      `userTouched clears on every state entry.`,
    prevention_rule:
      'Per-state authored values own their knob until the teacher actually drags it (Rule 31 ' +
      'contextual controls + drag-seize). Never resolve a slider before the state value. Probe: for ' +
      'each state declaring a value, assert the sim reports that value on entry with no interaction.',
    probe_type: 'js_eval',
    probe_logic:
      'For every state declaring T / piston_frac / N, enter the state via the player and assert the ' +
      'live value equals the authored one before any input event is dispatched.',
    status: 'FIXED',
    concepts_affected: [CONCEPT],
    fixed_in_files: [RENDERER],
    row_type: 'incident',
  },
  {
    bug_class: 'gas_box_histogram_mixed_species_single_theory_curve',
    title: 'Speed histogram plotted ALL particles but drew only species-0\'s theory curve — bars sat beside the curve in the two-gas state',
    severity: 'MAJOR',
    owner_cluster: 'peter_parker:renderer_primitives',
    root_cause:
      `VERIFIED + FIXED 2026-07-28 by reading the frame, not by any gate. A mixture of masses is a ` +
      `mixture of Rayleigh distributions (heavier = slower), so binning every particle against one ` +
      `species' sigma put the bars visibly beside their own curve — in exactly the diffusion / ` +
      `Graham's-law state where the curve carries the lesson. The Ea marker and the ` +
      `v_mp/v_avg/v_rms markers were likewise computed from species 0 while the bars were the ` +
      `mixture. Fixed: the histogram plots ONE species (state.hist_species, default 0), labels which ` +
      `when more than one exists, and derives every marker from that same population.`,
    prevention_rule:
      'A distribution overlay must bin exactly the population its theory curve and its markers ' +
      'describe. When a scenario supports multiple species, a graph must name the population it ' +
      'plots rather than silently mixing them.',
    probe_type: 'vision_model',
    probe_logic:
      'In any state with show_speed_histogram and >1 species, confirm the bar envelope tracks the ' +
      'theory curve and the pane names the plotted species.',
    status: 'FIXED',
    concepts_affected: [CONCEPT],
    fixed_in_files: [RENDERER],
    row_type: 'incident',
  },
  {
    bug_class: 'gas_box_init_velocity_sample_off_nominal_temperature',
    title: 'Initial velocity draw landed ~8% off the requested temperature, so the histogram opened beside its own theory curve',
    severity: 'MODERATE',
    owner_cluster: 'peter_parker:renderer_primitives',
    root_cause:
      `VERIFIED + FIXED 2026-07-28. Drawing 2N Gaussians gives a sample sigma with ~1/sqrt(2N) ` +
      `relative error (~4% at N=130); the measured miss was ~8%, which put the bars visibly beside ` +
      `the curve and made the 2D Maxwell-Boltzmann ratio checks read 1.357/1.523 against theory ` +
      `1.253/1.414. Fixed by zeroing net momentum (a random sample carries a small drift that reads ` +
      `as a draught and adds spurious wall impulse) and rescaling to pin realized kinetic energy to ` +
      `the requested temperature. Re-verified: ratios 1.2560 / 1.4142.`,
    prevention_rule:
      'After sampling initial velocities from a distribution, zero the net momentum and rescale to ' +
      'the requested temperature. Never assume a finite sample lands on its nominal parameter when ' +
      'a theory curve will be drawn over it.',
    probe_type: 'js_eval',
    probe_logic:
      'Assert v_rms/v_mp is within 2% of sqrt(2) and v_avg/v_mp within 3% of sqrt(pi/2) at state entry.',
    status: 'FIXED',
    concepts_affected: [CONCEPT],
    fixed_in_files: [RENDERER],
    row_type: 'incident',
  },
  {
    bug_class: 'chemistry_cache_seeder_missing_particle_field_family',
    title: 'THE EYE was structurally unreachable for chemistry particle_field concepts — the chemistry cache seeder only handled field_3d and parametric',
    severity: 'MAJOR',
    owner_cluster: 'peter_parker:visual_validator',
    root_cause:
      `VERIFIED + FIXED 2026-07-28. _seed_chemistry_cache.ts was written for the first chemistry ` +
      `concept (parametric) plus field_3d and threw "no seedable renderer family" for anything else. ` +
      `THE EYE reads the sim from simulation_cache, not the JSON, so the first chemistry concept on ` +
      `the particle_field family could not be visually gated AT ALL — the same class as the earlier ` +
      `GAP-1 finding that build_review_site.ts had never supported the parametric renderer. Fixed ` +
      `additively with a particle_field branch.`,
    prevention_rule:
      'Shared chemistry tooling must enumerate every LIVE renderer family, not the families the ' +
      'current concept happens to use. When a new renderer family gains its first chemistry concept, ' +
      'check the cache seeder, the review-site branch and the resolver together — a gap in any one ' +
      'silently removes a gate rather than failing loudly.',
    probe_type: 'manual',
    probe_logic:
      'For each live renderer family, assert _seed_chemistry_cache.ts produces a simulation_cache row.',
    status: 'FIXED',
    concepts_affected: [CONCEPT],
    fixed_in_files: [SEEDER],
    row_type: 'incident',
  },
  {
    bug_class: 'renderer_backtick_in_comment_terminates_template_literal',
    title: 'A backtick inside a code COMMENT silently terminated the renderer body template literal',
    severity: 'MODERATE',
    owner_cluster: 'peter_parker:renderer_primitives',
    root_cause:
      `VERIFIED + FIXED 2026-07-28. All three live renderer bodies are exported as ONE template ` +
      `literal, so a backtick anywhere inside them — including in an explanatory comment, where it ` +
      `reads as ordinary markdown-style quoting — closes the string. Writing an inline code quote in ` +
      `a new comment produced two TS1005 parse errors ~1600 lines away from the edit, with no hint ` +
      `that a comment was responsible. check:renderer-syntax caught it immediately.`,
    prevention_rule:
      'Never use a backtick inside any of the renderer template-literal bodies, including comments; ' +
      'use plain text or single quotes. Rule 36c (npm run check:renderer-syntax) is the standing ' +
      'guard and must be run on every renderer edit — the failure surfaces far from its cause.',
    probe_type: 'manual',
    probe_logic:
      'npm run check:renderer-syntax after every renderer edit; additionally grep the emitted body ' +
      'ranges for stray backticks.',
    status: 'FIXED',
    concepts_affected: [CONCEPT],
    fixed_in_files: [RENDERER],
    row_type: 'incident',
  },
  {
    bug_class: 'verification_via_applystate_bypasses_player_false_hang',
    title: 'DIRECTIVE — driving a sim by calling applyState() inside the iframe bypasses the player and manufactures false "frozen / hung renderer" findings',
    severity: 'MAJOR',
    owner_cluster: 'peter_parker:visual_validator',
    root_cause:
      `Recorded 2026-07-28 after it nearly produced two false CRITICAL filings in one session. ` +
      `Calling applyState('STATE_N') inside the sim iframe changes the RENDERER's state but never ` +
      `tells the review player, which keeps its own idx/advance_mode. The player then applies the ` +
      `freeze policy for the state IT thinks is current: with the player on a manual_click state, ` +
      `onTimelineEnd correctly pins the clock, and the sim appears to hang at a fixed PM_simTimeMs ` +
      `with sliders dead and particles stranded outside the box — an exact imitation of a renderer ` +
      `crash. The Rule-37 interaction_complete guard in build_review_site.ts was working correctly ` +
      `the whole time. A second trap compounded it: page.on('pageerror') only observes the MAIN ` +
      `frame, so "console errors: none" over a dead sim is meaningless unless the listener is ` +
      `installed inside the iframe.`,
    prevention_rule:
      'Verify a concept the way a teacher drives it: click the review player\'s state rail and its ' +
      'Play button, never applyState() inside the iframe. Install error listeners INSIDE the sim ' +
      'frame before believing "no console errors". Before filing a freeze/hang bug, confirm the ' +
      'player and the renderer agree on the current state.',
    probe_type: 'manual',
    probe_logic:
      'In any driving harness, assert the player\'s reported state index matches the renderer\'s ' +
      'PM_currentState before recording any timing or freeze observation.',
    status: 'FIXED',
    concepts_affected: [CONCEPT],
    fixed_in_files: [],
    row_type: 'directive',
  },
];

async function main(): Promise<void> {
  let ok = 0;
  for (const r of rows) {
    const payload: Record<string, unknown> = { ...r, discovered_in_session: SESSION };
    let res = await supabaseAdmin.from('engine_bug_queue').upsert(payload, { onConflict: 'bug_class' });
    if (res.error && /subject/.test(res.error.message)) {
      delete payload.subject;
      res = await supabaseAdmin.from('engine_bug_queue').upsert(payload, { onConflict: 'bug_class' });
    }
    if (res.error) console.error(`  ✖ ${r.bug_class}: ${res.error.message}`);
    else { ok++; console.log(`  ✔ ${r.severity.padEnd(8)} ${r.bug_class}`); }
  }
  console.log(`\n${ok}/${rows.length} rows upserted into engine_bug_queue.`);
}

main().catch((e) => { console.error('seed failed:', e); process.exit(1); });
