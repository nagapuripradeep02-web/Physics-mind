import '@/lib/loadEnvLocal';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
const r = {
  bug_class: 'concentration_basis_rate_ratio_inverts_across_a_volume_change',
  title: 'The per-area rate chip reports a DECREASE across a compression that must show a fourfold increase — three authoring fixes changed the number and never the direction',
  severity: 'CRITICAL', owner_cluster: 'peter_parker:renderer_primitives', subject: 'chemistry',
  root_cause:
    'rate_law_and_order STATE_4 halves the box volume at fixed particle count. The physics is unambiguous: halving ' +
    'the area doubles the total collision rate and quadruples the CONCENTRATION rate, so the chip must read about ' +
    'x4. It reads a DECREASE, stably, across every frame: x0.64 at a 350 ms window with 3 repeats, and x0.39 after ' +
    'the window was restored to the 2000 ms setting its own 40-seed measurement covered (run 1 8.26e-6, run 2 ' +
    '3.20e-6 discs/s/px2). Three separate authoring changes moved the magnitude and never the SIGN, which is the ' +
    'tell that the defect is not in the authored timing. The chip divides by box area (the unit is discs/s/px2), ' +
    'and a per-area metric is exactly the quantity a stale or mismatched area assignment inverts — the fit carries ' +
    'an areaMean per window, and run 1 and run 2 are measured at different box areas by construction. The piston ' +
    'itself renders correctly (box visibly halves, particle density visibly rises), and the drawn fit line is ' +
    'visibly shallower for run 2, so the printed number matches what is drawn: the measurement is wrong, not the ' +
    'display. Isolated cleanly: S2, S3 and S5 on the same instrument are unaffected (x4.65, x3.36, x1.41) — they ' +
    'do not change volume.',
  prevention_rule:
    'A ratio comparison spanning a VOLUME change must be verified for SIGN before magnitude, and verified on the ' +
    'rendered chip rather than a harness. Assert the concentration-basis ratio equals the count-basis ratio times ' +
    'the area ratio, using each windows OWN measured area — a per-area metric that silently reuses one windows ' +
    'area for both is indistinguishable from a tuning miss until someone checks the direction. And when three ' +
    'successive authoring changes move a number without moving its sign, stop authoring: the defect is in the ' +
    'instrument.',
  probe_type: 'js_eval',
  probe_logic:
    'For any state authoring a piston stroke between two measured windows, assert sign(ratio - 1) matches the ' +
    'direction its caption claims, and assert conc_ratio / count_ratio equals area1/area2 within tolerance using ' +
    'the per-window areaMean actually used by each fit.',
  status: 'OPEN', concepts_affected: ['rate_law_and_order'], fixed_in_files: [], row_type: 'incident',
};
(async () => {
  const res = await supabaseAdmin.from('engine_bug_queue').upsert({ ...r, discovered_in_session: 'eye_walker S4 verification, 2026-08-09' }, { onConflict: 'bug_class' });
  console.log(res.error ? `  x ${res.error.message}` : `  ok ${r.severity} ${r.bug_class}`);
})();
