import '@/lib/loadEnvLocal';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
const S = 'pcpl_surgeon chord/dash/slider pass, 2026-08-09';
const R = ['src/lib/renderers/particle_field_renderer.ts'];
const rows = [
{ bug_class: 'window_shrink_animation_shows_non_monotonic_unstable_intermediate_values',
  title: 'The shrink chip printed a number from a window that had not filled, and drew the chord past the data — the second half of this row was still live after the first was fixed',
  severity: 'MAJOR', owner_cluster: 'peter_parker:renderer_primitives', subject: 'chemistry',
  root_cause:
    'The monotonicity half was fixed by making converge_from drive the fit. The chord half was not: drawGasKinMarks ' +
    'called the fit as soon as two samples existed anywhere in the window, so for a converge mark whose right edge ' +
    'tracks a moving future target it fitted [t0, now] and then drew out to valAt(dt1) past the last real sample. ' +
    'Measured gap between drawn right edge and last sample: 8000 ms at t=2000, falling to 17 ms at t=8000 — a ' +
    '10-second prediction drawn over blank canvas from a 2-second fit, printing 31.37 where the honest wide-window ' +
    'value was 15.45. This row own probe already demanded BOTH halves, so its FIXED status was contradicted by the ' +
    'shipped behaviour for two days.',
  prevention_rule:
    'Gate the fit on the window having genuinely closed (newest real sample >= the window right edge), not on ' +
    'sample count. Hold the chip in a measuring state until then and draw only over the fitted range. And when a ' +
    'row carries a two-clause probe, do not mark it FIXED until BOTH clauses pass — a half-closed row is worse ' +
    'than an open one because it stops being looked at.',
  probe_type: 'js_eval',
  probe_logic:
    'Step a converge mark tick by tick; assert no value prints before the window has closed, the printed sequence ' +
    'is monotonic, and the drawn chord never extends past the last real sample.',
  status: 'FIXED', concepts_affected: ['rate_of_reaction','rate_law_and_order'], fixed_in_files: R, row_type: 'incident' },
{ bug_class: 'gas_kinetics_coincident_series_dash_wrong_curve_and_illegible_at_1x',
  title: 'Two curves that coincide by construction were dashed by series ORDER, so the product got the dash and the pair the narration described read as one solid line',
  severity: 'MAJOR', owner_cluster: 'peter_parker:renderer_primitives', subject: 'chemistry',
  root_cause:
    'drawGasKinModeA dashed any series after the first (dashed = s > 0), which dashes whichever curve happens to be ' +
    'second in the authored list — in practice the PRODUCT. Meanwhile the two reactant curves, which coincide by ' +
    'construction, were both solid and overdrew each other. The dash pattern was also [6,4] at ~2 px effective, ' +
    'invisible at native 1280x720 and only resolving under a 12x crop. Net effect on rate_of_reaction S2: the ' +
    'narration told the teacher the blue and pink curves are told apart by a dash, no blue curve was visible at ' +
    'all, and the one dashed curve on screen was the purple product the narration never mentions. Sound-off, the ' +
    'state taught that A is pink.',
  prevention_rule:
    'Dash by stoichiometric ROLE (identity-check the second reactant), never by position in an authored list, so ' +
    'the product can never be the dashed curve. And verify any dash a narration NAMES is legible at 1x on a ' +
    'projector, not under a crop — a distinction the student is told to look for must survive the room it is shown in.',
  probe_type: 'js_eval',
  probe_logic:
    'Assert the dashed series resolves to the second reactant and never the product; sample the rendered line at 1x ' +
    'over 50 px and require at least three contiguous same-colour runs of 4 px or more.',
  status: 'FIXED', concepts_affected: ['rate_of_reaction','rate_law_and_order'], fixed_in_files: R, row_type: 'incident' },
{ bug_class: 'authoring_unit_convenience_leaked_into_the_teacher_facing_slider_label',
  title: 'Sliders read 15000 ms to a teacher while the graph axis read 30 s and the narration spoke seconds',
  severity: 'MODERATE', owner_cluster: 'peter_parker:renderer_primitives', subject: 'chemistry',
  root_cause:
    'Kinetics marks consume milliseconds, so the sliders bound to them were authored in ms — and the slider row ' +
    'printed the raw stored value. The teacher saw "Window position 15000 ms" and "Window half-width 3000 ms" ' +
    'beside an axis labelled in seconds and narration spoken in seconds. An authoring-side convenience became a ' +
    'reader-facing string, which Rule 41 does not allow.',
  prevention_rule:
    'A slider label is a reader-facing string: display it in the unit the lesson speaks, and keep the authored/stored ' +
    'value in whatever unit the engine consumes. Never let an internal unit reach the teacher because it was ' +
    'convenient for the mark format.',
  probe_type: 'js_eval',
  probe_logic:
    'For every visible slider, assert the displayed unit matches the unit used by that state axis labels and ' +
    'narration; assert no reader-facing label prints a raw millisecond value.',
  status: 'FIXED', concepts_affected: ['rate_of_reaction'], fixed_in_files: R, row_type: 'incident' },
];
(async () => { for (const r of rows) {
  const res = await supabaseAdmin.from('engine_bug_queue').upsert({ ...r, discovered_in_session: S }, { onConflict: 'bug_class' });
  console.log(res.error ? `  x ${r.bug_class}: ${res.error.message}` : `  ok ${r.severity.padEnd(8)} ${r.status.padEnd(5)} ${r.bug_class}`);
} })();
