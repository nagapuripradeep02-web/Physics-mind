import '@/lib/loadEnvLocal';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
const S = 'eye_walker frame read, rate_of_reaction, 2026-08-07';
const R = ['src/lib/renderers/particle_field_renderer.ts'];
const rows = [
{ bug_class: 'partial_window_reveal_prints_a_transient_wrong_sign_rate_chip',
  title: 'A rate chip animated during a mark reveal fits the partial window and briefly prints NEGATIVE before converging',
  severity: 'CRITICAL', owner_cluster: 'peter_parker:renderer_primitives', subject: 'chemistry',
  root_cause:
    'The species-role sign fix resolves the SETTLED value correctly, but the chip is recomputed live on the ' +
    'partial, still-growing window during a mark progressive reveal. Observed in rate_of_reaction STATE_4: the ' +
    'late window printed -8.51 then -12.87 discs/s before settling to +5.84 after ~2 s of playback. That is the ' +
    'exact sign confusion S3 and S4 exist to confront, rendered as fact on screen. All 31 deterministic checks ' +
    'passed; only the frame read caught it.',
  prevention_rule:
    'Resolve the displayed sign at reveal START from the authored species role, and do not print a number computed ' +
    'from an under-conditioned window: freeze the printed value until a minimum sample count is reached, animating ' +
    'only the drawn segment and its opacity. A number that is still converging must not be on screen — a teacher ' +
    'reads whatever is displayed, including for the two seconds it is wrong.',
  probe_type: 'js_eval',
  probe_logic:
    'Step a kinetics_marks reveal frame by frame from weight 0 to 1 on a falling series; assert the displayed sign ' +
    'never differs from the final converged sign at any intermediate weight, and that no intermediate magnitude ' +
    'exceeds the converged value by more than a stated factor.',
  status: 'OPEN', concepts_affected: ['rate_of_reaction'], fixed_in_files: [], row_type: 'incident' },
{ bug_class: 'window_shrink_animation_shows_non_monotonic_unstable_intermediate_values',
  title: 'The shrink-to-settle chip swung 65 to 7 to 4.6 before settling, teaching the opposite of the state thesis',
  severity: 'MAJOR', owner_cluster: 'peter_parker:renderer_primitives', subject: 'chemistry',
  root_cause:
    'rate_of_reaction STATE_5 narrates "shrink the window and the number stops changing", and the design measured a ' +
    'monotonic 22.6 to 18.7 progression. On screen the chip read 65.31, then 7.16, then 4.58, settling to 12.93 ' +
    'only from t about 9 s — because each frame re-fits a partially buffered window rather than replaying the ' +
    'design-time values. Same root cause family as the transient sign flip.',
  prevention_rule:
    'A shrink-to-settle construction must be driven from well-conditioned values at each authored width, not ' +
    'recomputed live from a fresh unstable fit each frame. If a state narrates that a number holds, the number ' +
    'must be measured to hold on the RENDERED frames, not only in a harness.',
  probe_type: 'js_eval',
  probe_logic:
    'Sample the displayed rate at each authored half-width during the shrink; assert monotonic convergence within ' +
    'a bounded tolerance of the design-time reference values.',
  status: 'OPEN', concepts_affected: ['rate_of_reaction','rate_law_and_order'], fixed_in_files: [], row_type: 'incident' },
{ bug_class: 'authored_window_floor_and_authored_window_centre_are_mutually_unsatisfiable',
  title: 'A thermostat-settling floor and a symmetric shrink about an early centre contradicted each other; the floor lost silently',
  severity: 'MAJOR', owner_cluster: 'alex:architect', subject: 'chemistry',
  root_cause:
    'rate_of_reaction carried two constraints written at different times: "no kinetics_marks window opens before ' +
    't0_ms 2000" (measured thermostat settling — the exothermic box self-heats about 3% and takes about 15 s to ' +
    'settle) and "a symmetric shrink from a half-width of 5 s about a centre at 5 s". A window of half-width 5 s ' +
    'centred at 5 s necessarily starts at 0. Both were authored, the wide window opened at about 740 ms on screen, ' +
    'and it sampled the post-spike burst — producing a 65 discs/s outlier at t=3000 ms.',
  prevention_rule:
    'Constraints on the same authored quantity must be checked against each other for satisfiability at design ' +
    'time, not just individually against the physics. For a symmetric window the relation is centre minus ' +
    'half-width >= floor; where a floor and a width are both required, the CENTRE is the free variable and must be ' +
    'moved. Enforce the floor inside the window primitive as well, so an unsatisfiable authoring cannot render.',
  probe_type: 'js_eval',
  probe_logic:
    'For every authored kinetics_marks and converge_from window in every state, assert the resolved t0_ms is at or ' +
    'above the concept declared floor — including the widest frame of an animated converge.',
  status: 'OPEN', concepts_affected: ['rate_of_reaction'], fixed_in_files: [], row_type: 'incident' },
{ bug_class: 'concept_ships_an_invented_phys_seed_while_its_narrated_ratios_were_measured_on_another',
  title: 'The narrated contrast missed its own floor because the shipped seed was chosen by no one and measured against nothing',
  severity: 'MAJOR', owner_cluster: 'alex:json_author', subject: 'chemistry',
  root_cause:
    'The sibling concept had its design.phys_seed selected by a 40-candidate joint search scored against all five ' +
    'of its measured targets. rate_of_reaction never got one specified, so json_author authored phys_seed ' +
    '246813579 unmeasured. The rendered chips then read 12.93 and 5.84 discs/s — a 2.2:1 contrast, under the ' +
    'design own 2.5:1 floor and well under both the harness 4.6:1 and the narration "roughly four times slower". ' +
    'The physics is correct; the shipped realization was never checked against the claim.',
  prevention_rule:
    'design.phys_seed is a MEASURED quantity wherever any narrated number depends on it. A concept that narrates a ' +
    'ratio must have its seed selected against that ratio on the BUILT concept, and the check is the rendered chip ' +
    'value, not the harness value — a live render can diverge from a standalone harness on seed and timing binding.',
  probe_type: 'js_eval',
  probe_logic:
    'For every state narrating a ratio, read the rendered chip values at reveal-complete time from the built ' +
    'concept and assert they satisfy the design stated floor and match the narrated wording.',
  status: 'OPEN', concepts_affected: ['rate_of_reaction'], fixed_in_files: [], row_type: 'incident' },
{ bug_class: 'coincident_series_dash_is_sub_pixel_and_reads_as_one_solid_line_at_native_scale',
  title: 'Two curves that coincide by construction were distinguished by a dash too small to see at render resolution',
  severity: 'MODERATE', owner_cluster: 'peter_parker:renderer_primitives', subject: 'chemistry',
  root_cause:
    'The A and B curves coincide by construction, and the convention is to dash the second so both read. At native ' +
    '1280x720 the alternation is about 2 px and reads as one solid line; it only resolves under about a 12x crop. ' +
    'The narration explicitly promises "one dashed to tell them apart", so a teacher is told to look for something ' +
    'the projector cannot show.',
  prevention_rule:
    'Verify a dash or hatch reads as visibly alternating at NATIVE render resolution — a classroom projector, not ' +
    'a crop. Any distinction the narration names must survive at 1x.',
  probe_type: 'js_eval',
  probe_logic:
    'Sample the rendered line at 1x over a 50 px run; assert at least three contiguous same-colour runs of 4 px or ' +
    'more are distinguishable.',
  status: 'OPEN', concepts_affected: ['rate_of_reaction','rate_law_and_order'], fixed_in_files: [], row_type: 'incident' },
];
(async () => { for (const r of rows) {
  const res = await supabaseAdmin.from('engine_bug_queue').upsert({ ...r, discovered_in_session: S }, { onConflict: 'bug_class' });
  console.log(res.error ? `  x ${r.bug_class}: ${res.error.message}` : `  ok ${r.severity.padEnd(8)} ${r.bug_class}`);
} })();
