import '@/lib/loadEnvLocal';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
const rows = [{
  bug_class: 'reseed_charge_piston_frac_springs_back_to_the_states_authored_value_inside_the_fit_window',
  title: 'A re-seed that sets the piston has no staying power — the free ease pulls it back to the state value within 1.5 s, inside the measuring window',
  severity: 'MAJOR', owner_cluster: 'peter_parker:renderer_primitives', subject: 'chemistry',
  root_cause:
    'gasMovePiston() eases gasPistonF toward the STATE-authored piston_frac at 6%/tick on every tick, and ' +
    'kinetics_reseed_charge.piston_frac only hard-sets the value once at the re-seed. Traced empirically: a re-seed ' +
    'to 0.5 springs back to 1.0000 within 1500 ms — inside a 2000 ms fit window — so a run-pair comparing two box ' +
    'volumes silently measures two runs at almost the SAME volume. Measured on the authored construction: count ' +
    'ratio 1.03, concentration ratio 1.10, against a caption claiming x4. Every deterministic gate stays green; the ' +
    'defect is only visible by tracing gasPistonF tick by tick or by disbelieving the measured ratio.',
  prevention_rule:
    'A volume change that must PERSIST across a re-seed is authored at STATE level and driven, not set by the ' +
    're-seed: piston_from + piston_frac + piston_ramp_ms, with piston_cue bound to the SAME cue id as ' +
    'kinetics_reseed_cue. That routes post-cue ticks through the driven ramp branch instead of the free ease ' +
    '(settles ~1100 ms and holds). Corollary measured on the same sweep: do NOT add a settle gap before the second ' +
    'fit window — the reaction never pauses, so the reactant lost while waiting costs more ratio than the area ' +
    'overshoot gains (gap 0 gives 4.23; gap 1600 ms gives 2.81).',
  probe_type: 'js_eval',
  probe_logic:
    'For any state authoring kinetics_reseed_charge.piston_frac, assert the state also authors piston_from, ' +
    'piston_ramp_ms and a piston_cue equal to its kinetics_reseed_cue. Separately, trace gasPistonF for 2000 ms ' +
    'after the re-seed and assert it holds within 2% of the intended value across the whole fit window.',
  status: 'OPEN', concepts_affected: ['rate_law_and_order'],
  fixed_in_files: [], row_type: 'incident',
}];
(async () => { for (const r of rows) {
  const res = await supabaseAdmin.from('engine_bug_queue')
    .upsert({ ...r, discovered_in_session: 'chemistry_author DQ-3 re-measure, kinetics pair, 2026-08-07' }, { onConflict: 'bug_class' });
  console.log(res.error ? `  x ${r.bug_class}: ${res.error.message}` : `  ok ${r.severity} ${r.status} ${r.bug_class}`);
} })();
