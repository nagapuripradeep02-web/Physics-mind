import '@/lib/loadEnvLocal';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
const S = 'session_2026-07-28_gas_box_quality_auditor';
const R = 'src/lib/renderers/particle_field_renderer.ts';
const C = 'kinetic_particle_theory';
const rows = [
  {
    bug_class: 'gas_box_state_param_falls_through_to_stale_slider_dom',
    title: 'A state that authored no piston_frac inherited the PREVIOUS state\'s value — the aha state, the gas-law state and the explore state all silently opened in a half-width box',
    severity: 'CRITICAL', owner_cluster: 'peter_parker:renderer_primitives',
    root_cause:
      'VERIFIED + FIXED 2026-07-28 (quality-auditor, Gate 4 live walk). gasTargetT/gasTargetPistonF/' +
      'gasCount resolved in three rungs and the third read sliderVal(), i.e. userParams[] — which is ' +
      'exactly what applyStateVisuals writes when re-syncing an unseized slider thumb to the authored ' +
      'value. That closed a loop, and it was INTRODUCED BY THE FIX for the DOM-desync finding ' +
      '(pf_slider_dom_value_ignores_authored_state_value) earlier the same session: STATE_4 authored ' +
      'piston_frac 0.5, the re-sync stored 0.5 into userParams.V, and STATE_5/6/7 (which author no ' +
      'piston_frac) read it back. Consequences: STATE_5, the PRIMARY aha, rendered in a half box with ' +
      'a stray piston and ghost outline competing for focus against its own declared scene ("the same ' +
      'gas at the baseline temperature") — Rule 32b and 32d both broken at the concept\'s most ' +
      'important beat; STATE_6 ran at 9.2% packing instead of 4.6%, outside the dilute regime its own ' +
      'P*A/N*T readout is only valid in, per the renderer\'s own banner; STATE_7 opened at 0.5 against ' +
      'its declared default of 1. Order-dependent, so it also broke Rule 25d teacher reordering. FIXED ' +
      'by resolving rung 3 to a STABLE declared default (gasStableDefault) instead of live slider state. ' +
      'Re-verified by walking all 7 states via the rail: piston 1/1/1/0.5/1/1/1.',
    prevention_rule:
      'A per-state parameter must never fall back to live control state. Resolution order is: teacher ' +
      'drag (only once seized) -> this state\'s authored value -> a STABLE declared default. Any ' +
      'fallback that reads the same store the display layer writes to creates a cross-state bleed that ' +
      'is invisible in a single-state test and order-dependent in a walk. Probe every state that omits ' +
      'a parameter, after visiting a state that sets it.',
    probe_type: 'js_eval',
    probe_logic:
      'Walk all states in authored order via the player rail; for each state omitting a parameter, ' +
      'assert the live value equals the declared default and not the previously-visited state value.',
    status: 'FIXED', concepts_affected: [C], fixed_in_files: [R], row_type: 'incident',
  },
  {
    bug_class: 'gas_box_state4_asserts_unchanged_speed_with_no_instrument',
    title: 'STATE_4 claimed "the particles have not changed speed" while showing no thermometer — true in code, unverifiable on screen with sound off',
    severity: 'MAJOR', owner_cluster: 'alex:chemistry_author',
    root_cause:
      'VERIFIED + FIXED 2026-07-28 (quality-auditor). The claim is true in the sim (v_avg changes ' +
      '-0.89% from STATE_3 to STATE_4; the thermostat is isothermal by default), but show_gas_thermometer ' +
      'was absent from STATE_4, so with sound off the state showed only: smaller box, higher pressure, ' +
      'more collisions. A student can read that as "squeezing made them faster" — precisely the ' +
      'misconception the concept exists to prevent — and Rule 24 makes sound-off the governing case. The ' +
      'authored anchor actively primed the wrong reading by promising a pump that gets warm. FIXED: ' +
      'thermometer added to STATE_4 (T pinned while P doubles), narration re-pointed at it, and the ' +
      'anchor rewritten to lead with the resistance the sim demonstrates while naming the warming as a ' +
      'separate effect the sim deliberately holds out.',
    prevention_rule:
      'A state that asserts a quantity is UNCHANGED must show the instrument that proves it. Under Rule ' +
      '24 the sim reads with sound off, so a claim carried only by narration is not carried at all. Check ' +
      'anchor coherence too: an anchor promising a phenomenon the sim deliberately suppresses teaches ' +
      'against the state.',
    probe_type: 'vision_model',
    probe_logic:
      'For any state whose narration asserts a quantity is constant, assert that quantity has a visible ' +
      'live readout in that state.',
    status: 'FIXED', concepts_affected: [C],
    fixed_in_files: ['src/data/concepts/chemistry/kinetic_particle_theory.json', R],
    row_type: 'incident',
  },
  {
    bug_class: 'gas_box_compressed_state_empty_pane_no_affordance',
    title: 'SCOPE CORRECTED — 42% of the canvas is reserved and left black in FIVE of seven states, not freed by the piston in one',
    severity: 'MAJOR', owner_cluster: 'ambiguous',
    root_cause:
      'OPEN — founder call. Scope corrected 2026-07-28 by quality-auditor; my earlier root_cause was ' +
      'factually wrong and is replaced. It claimed "S1-S3 do NOT have a reserved pane; the box occupies ' +
      'the full canvas there" and that the gap was STATE_4-only. In fact gasBoxRFull() returns ' +
      'floor(width * 0.58) whenever layout === with_graph — state-independent and piston-independent. ' +
      'Measured live: STATE_1..4 and STATE_6 render boxRight=702 of canvasW=1212, leaving 42.1% of the ' +
      'canvas black; only STATE_5 and STATE_7 fill it with the histogram. So it is present from STATE_1, ' +
      'before any piston exists, in five of seven states. Severity raised MODERATE -> MAJOR accordingly. ' +
      'Options: accept as the price of Rule-32d constant geometry; add a reserved-space affordance; ' +
      'introduce the histogram earlier; or drop layout:with_graph and let the box use full width until ' +
      'the histogram is needed (costs home-pose continuity).',
    prevention_rule:
      'A state that reserves canvas space for a later state must mark it as deliberately reserved at a ' +
      'legibility a teacher notices at a glance. Also: when filing a layout row, MEASURE the geometry ' +
      'function rather than inferring scope from one state\'s frames.',
    probe_type: 'vision_model',
    probe_logic: 'Flag any state where >30% of canvas is empty background with no label, frame or affordance.',
    status: 'OPEN', concepts_affected: [C], fixed_in_files: [], row_type: 'incident',
  },
];
(async () => {
  for (const r of rows) {
    const res = await supabaseAdmin.from('engine_bug_queue').upsert({ ...r, discovered_in_session: S }, { onConflict: 'bug_class' });
    console.log(res.error ? `  x ${r.bug_class}: ${res.error.message}` : `  ok ${r.severity.padEnd(8)} ${r.status.padEnd(5)} ${r.bug_class}`);
  }
})();
