import '@/lib/loadEnvLocal';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
const rows = [{
  bug_class: 'kinetics_rate_readout_count_basis_not_concentration_under_volume_change',
  title: 'Rate readout reported the count-basis collision rate under a volume-changing beat, not the rate-law concentration rate — they differ by exactly the box area ratio',
  severity: 'MODERATE', owner_cluster: 'peter_parker:renderer_primitives', subject: 'chemistry',
  root_cause:
    'gasKinFitWindow (piece F mark-ratio chips, piece G kept "previous run" chip) fits a raw event-count rate ' +
    '(dN/dt, discs/s). For 2D hard discs the total A-B collision rate goes as N_A*N_B/Area (an event-COUNT rate); ' +
    'the rate law quantity d[A]/dt goes as N_A*N_B/Area^2, one extra factor of Area because [A]=N_A/Area. Any state ' +
    'whose own beat changes box volume (a piston stroke, or a live V slider) therefore printed a ratio off from the ' +
    'concentration reading by exactly the area ratio, under a plain "discs/s" label. Invisible to tsc, ' +
    'check:renderer-syntax and check:gas-reaction — all green throughout. Measured on the compression beat before ' +
    'the fix: 40-seed ratio-of-sums x1.15 against a caption claiming x4.',
  prevention_rule:
    'Any state whose own beat changes box volume mid-state, or whose explore sliders include V feeding a rate ' +
    'comparison, MUST author kinetics_rate_basis: concentration — dividing the fitted rate by the box area IT WAS ' +
    'MEASURED UNDER (the fit window own areaMean, never a render-time gasBoxArea() re-read; dividing both marks by ' +
    'the CURRENT area cancels and silently no-ops the option, a bug hit and fixed during this build). Every ' +
    'fixed-volume state is unaffected — count is the byte-identical default. And measure the ratio the state own ' +
    'config produces: a within-run piston stroke also carries batch run-down bias, so only a two-fresh-run ' +
    'comparison isolates the volume effect.',
  probe_type: 'js_eval',
  probe_logic:
    'For every gas_box state authoring piston_frac/piston_from/piston_cue differing from a neighbour state, OR whose ' +
    'controls include V feeding a rate comparison, AND that also authors kinetics_marks or show_kinetics_new_run: ' +
    'assert state.kinetics_rate_basis === concentration.',
  status: 'FIXED', concepts_affected: ['rate_law_and_order'],
  fixed_in_files: ['src/lib/renderers/particle_field_renderer.ts'], row_type: 'incident',
}];
(async () => { for (const r of rows) {
  const res = await supabaseAdmin.from('engine_bug_queue')
    .upsert({ ...r, discovered_in_session: 'peter_parker:renderer_primitives, kinetics_rate_basis add-on, 2026-08-07' }, { onConflict: 'bug_class' });
  console.log(res.error ? `  x ${r.bug_class}: ${res.error.message}` : `  ok ${r.severity} ${r.status} ${r.bug_class}`);
} })();
