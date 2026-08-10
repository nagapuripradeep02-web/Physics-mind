import '@/lib/loadEnvLocal';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const NEW = {
  bug_class: 'sandbox_frozen_pin_lands_before_the_first_bound_crossing_so_h2_is_blind_to_the_wrap_branch',
  title: 'Every inclined sandbox pins its frozen baseline before its first wrap, so an H2 result of 0.00 percent is true and proves nothing about the branch a wrap fix changes',
  severity: 'MAJOR' as const, owner_cluster: 'peter_parker:field3d_surgeon',
  root_cause: "A sandbox state either authors no eye_capture_ms or authors one earlier than its first bound crossing, so the SET_TIME_FREEZE capture -- the only deterministic frame H2 compares -- never reaches the wrap. Measured on conservative_vs_nonconservative_forces STATE_5 (theta 25, mu 0.3, no eye_capture_ms authored): matching its STATE_5__frozen.png against its own dense series puts the pin nearest t = 1000 ms (0.248 percent, against 0.854 percent at t = 0 and 0.933 percent at t = 4000), while its first wrap is at t = 4.28 s. The relaunch fix changed that state from a repeated top-to-bottom run into a genuine round trip, and its ten H2 comparisons still read 0.00 percent -- a correct result that carries no information about the change. This is the SAME blind spot that let the original bound-to-bound remap ship.",
  prevention_rule: 'A regression baseline is evidence only about the instant it captures. When a fix changes behaviour that begins at time T within a state, the state must carry a frozen pin AFTER T before an H2 result may be cited as evidence that the fix is safe -- and a reviewer must state which instant the pin captures rather than quoting the percentage. For sandbox states: author eye_capture_ms past the first bound crossing, or record explicitly that the state has no baseline coverage of its wrap branch.',
  probe_type: 'js_eval',
  probe_logic: 'For every field_3d state with newtons_laws_body.mode = "sandbox", compute the first bound-crossing time by driving the state and watching for a discontinuity in bodies[].s. Assert the state authors an eye_capture_ms strictly greater than that time. Report any state where the frozen pin precedes the first crossing, and mark that state H2 result as non-evidential for any change to the wrap branch.',
  status: 'OPEN' as const,
  concepts_affected: ['conservative_vs_nonconservative_forces','block_on_incline','gravitational_potential_energy','potential_energy_definition'],
  fixed_in_files: [] as string[],
  discovered_in_session: 'ch6-concept6-founder_proxy_checkpoint_b_cycle1-2026-08-10',
  row_type: 'probe_definition' as const,
};

const SC = 'energy_bar_track_renders_no_scale_ceiling_so_two_states_draw_one_value_at_two_heights';
const APPEND = " THIRD-CONCEPT CONFIRMATION (Checkpoint B cycle 1, 2026-08-10): the author's constraint is now MEASURED, not asserted. Driving potential_energy_definition STATE_4 to its own slider bounds gives max|W_gravity| = 186.3 J (v0 = 9) and max|W_friction| = 159.1 J (mu = 0.5), both ABOVE the guided states' work_scale_J of 145 J -- so lowering the sandbox to 290 J would clip a teacher-reachable ledger, and bar_max_J = 2 x work_scale_J is the within-state equal-pixel invariant the mirror claim rests on. The remedy is the rendered ceiling this bug_class names, NOT a scale normalisation. Filed twice, dispatched zero times.";

async function main() {
  const ex = await supabaseAdmin.from('engine_bug_queue').select('bug_class,status').eq('bug_class', NEW.bug_class).maybeSingle();
  console.log(ex.data ? `  ! new row already exists (status=${ex.data.status}) — upsert will NOT touch status` : '  ✓ new row absent — genuine INSERT');
  const { error } = await supabaseAdmin.from('engine_bug_queue').upsert(NEW, { onConflict: 'bug_class' });
  console.log(error ? `  ✗ ${error.message}` : `  ${ex.data ? '↻ UPDATED' : '+ INSERT '} ${NEW.severity} ${NEW.bug_class}`);

  const sc = await supabaseAdmin.from('engine_bug_queue').select('root_cause,status,concepts_affected').eq('bug_class', SC).maybeSingle();
  if (!sc.data) { console.log('  ! scale-ceiling row not found'); return; }
  if ((sc.data.root_cause || '').includes('THIRD-CONCEPT CONFIRMATION')) { console.log('  = scale-ceiling already carries the measured figures — left alone'); return; }
  const e2 = await supabaseAdmin.from('engine_bug_queue')
    .update({ root_cause: (sc.data.root_cause || '') + APPEND })   // status deliberately NOT touched
    .eq('bug_class', SC);
  console.log(e2.error ? `  ✗ extend: ${e2.error.message}` : `  ↻ EXTENDED ${SC} (status left ${sc.data.status}, untouched)`);
}
main().catch(e => { console.error('💥', e); process.exit(1); });
