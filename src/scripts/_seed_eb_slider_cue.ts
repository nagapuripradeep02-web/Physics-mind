import '@/lib/loadEnvLocal';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
const rows = [
{ bug_class: 'gas_box_slider_readout_ignores_a_mid_state_cue_driven_value_change',
  title: 'Slider thumb and label re-sync only on state ENTRY, not when a mid-state cue changes the value — the teacher instrument disagrees with the picture',
  severity: 'MAJOR', owner_cluster: 'peter_parker:renderer_primitives', subject: 'chemistry',
  root_cause:
    'An earlier fix re-syncs unseized gas sliders to the authored value on every SET_STATE apply. It does not cover ' +
    'a value changed MID-STATE by an authored cue. Observed on rate_law_and_order: STATE_7 Temperature reads ' +
    '"300 K" from t=0 through the frozen frame while T_cue fires at 1000 ms and drives T to 450 K — confirmed ' +
    'physically, k climbs from the unheated 0.00009 to 0.00062-0.00095. STATE_4 fails the other way: the Volume ' +
    'slider already reads 0.5 at t=0, before piston_cue fires at 2500 ms and the box visibly compresses. Either way ' +
    'the only numeric handle a teacher has on the cued variable contradicts what the box is doing (Rule 33d).',
  prevention_rule:
    'A slider bound to a variable driven by an authored cue must re-sync its DOM thumb and label whenever that ' +
    'cue-driven value changes, not only at state entry. Any state authoring a <var>_cue or <var>_from alongside a ' +
    'visible control for that same variable needs this by construction.',
  probe_type: 'js_eval',
  probe_logic:
    'For any state authoring a cue-bound target with the same variable in visible_controls, step across the cue ' +
    'firing time and assert the slider value tracks the live simulated value within one tick.',
  status: 'OPEN', concepts_affected: ['rate_law_and_order'], fixed_in_files: [], row_type: 'incident' },
{ bug_class: 'calibration_discipline_propagated_to_a_state_whose_measurement_did_not_cover_it',
  title: 'A measured window/repeat setting was applied fleet-wide across run-pair states, breaking the one state calibrated at a different window',
  severity: 'MAJOR', owner_cluster: 'alex:architect', subject: 'chemistry',
  root_cause:
    'The 350 ms window with 3 repeats was measured for the pour-based run-pair states and then instructed to be ' +
    'applied to ALL run-pair states "with the same discipline". STATE_4 is piston-based and its x4 result was ' +
    'measured at a 2000 ms window (concentration basis, 3.87-4.23). At 350 ms it renders x0.64 — a 36% DECREASE ' +
    'under a caption claiming x4, stable across the whole state, not a transient. The instruction generalised a ' +
    'setting past the evidence that supported it.',
  prevention_rule:
    'A measured setting is scoped to the construction it was measured on. Before applying a window, repeat count or ' +
    'charge across sibling states, check each state was measured AT that setting — a state with a different ' +
    'mechanism (piston vs pour) is a different experiment even inside one concept. Say which states a measurement ' +
    'covers when reporting it, and refuse to generalise it in the dispatch.',
  probe_type: 'manual',
  probe_logic:
    'For every state sharing an authored window/repeat setting, confirm a measurement exists at THAT setting for ' +
    'THAT state mechanism; flag any state inheriting a number measured on a different construction.',
  status: 'OPEN', concepts_affected: ['rate_law_and_order'], fixed_in_files: [], row_type: 'incident' },
];
(async () => { for (const r of rows) {
  const res = await supabaseAdmin.from('engine_bug_queue').upsert({ ...r, discovered_in_session: 'eye_walker frame walk + session diagnosis, 2026-08-09' }, { onConflict: 'bug_class' });
  console.log(res.error ? `  x ${r.bug_class}: ${res.error.message}` : `  ok ${r.severity} ${r.bug_class}`);
} })();
