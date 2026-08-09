import '@/lib/loadEnvLocal';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
const R = ['src/lib/renderers/particle_field_renderer.ts'];
const S = 'peter_parker:renderer_primitives, kinetics instrument 3-gap dispatch, 2026-08-07';
const rows = [
{
  bug_class: 'kinetics_mark_chip_prints_raw_fitted_slope_not_the_signed_rate',
  title: 'Rate mark chip printed the raw least-squares slope, so a reactant series read NEGATIVE against the state own rate = -delta[A]/delta t convention',
  severity: 'MAJOR', owner_cluster: 'peter_parker:renderer_primitives', subject: 'chemistry',
  root_cause:
    'gasKinFitWindow rateDiscsPerSec is the raw dY/dt of the fitted line; a falling reactant series fits negative ' +
    'and a rising product series fits positive, and both display sites printed that raw value. rate_of_reaction S3 ' +
    'is the state that TEACHES the sign convention — the curve falls, so the slope is negative, and the minus sign ' +
    'in the definition is what makes the reported rate positive. A chip printing a negative number there ' +
    'contradicted the formula surface beside it and the misconception_watch row built to fix exactly that belief. ' +
    'Every deterministic gate stayed green; found by json_author reading the renderer rather than trusting the spec.',
  prevention_rule:
    'A rate readout built on a raw fitted slope must resolve its sign from the series STOICHIOMETRIC ROLE before ' +
    'display — reactants -1, product +1, cumulative event series unsigned — using the same reaction-role ' +
    'resolution the engine already performs, never an authorable per-mark flip a JSON could set backwards. A ' +
    'consumed-series chip and a produced-series chip measuring the same physical rate must be incapable of ' +
    'printing opposite signs.',
  probe_type: 'js_eval',
  probe_logic:
    'For every kinetics_marks entry whose series resolves to a reactant species, assert the DISPLAYED sign is ' +
    'positive whenever the raw fit is negative. For any state authoring both a reactant-series and a ' +
    'product-series mark over mirrored windows, assert their displayed signs are equal.',
  status: 'FIXED', concepts_affected: ['rate_of_reaction'], fixed_in_files: R, row_type: 'incident',
},
{
  bug_class: 'kinetics_mark_bind_position_left_edge_span_right_edge_not_centre_pinned',
  title: 'A span-only drag slid the measuring window centre instead of shrinking it in place, teaching the opposite of the state caption',
  severity: 'MAJOR', owner_cluster: 'peter_parker:renderer_primitives', subject: 'chemistry',
  root_cause:
    'gasKinEffectiveMarks read bind.position as a direct left-edge override and bind.span as a right edge off ' +
    'whichever t0 was in force. rate_of_reaction S5 exists to show "pin the centre, shrink the window, watch the ' +
    'number hold steady"; under those semantics dragging the span moved the centre too, so the fitted value ' +
    'changed for a reason the state never shows — the caption and the instrument taught opposite things. The ' +
    'concept JSON had already DOCUMENTED this as an accepted limitation in authoring_notes, which is how a ' +
    'known gap becomes a shipped defect.',
  prevention_rule:
    'kinetics_mark_bind resolves as a true centre-pinned symmetric resize: span sets the half-width about the ' +
    'mark own authored centre, position sets the centre keeping the authored width, both derived from the mark ' +
    'literal t0_ms/t1_ms so an unseized slider reproduces the authored window exactly. Any state narrating "the ' +
    'number holds as the window shrinks" must be verified by MEASURING centre drift, not by re-reading the ' +
    'semantics comment. And an authoring_notes entry describing a live defect is a bug report, not a disposition.',
  probe_type: 'js_eval',
  probe_logic:
    'Seize span across its full range with position untouched and assert (t0+t1)/2 is identical to the authored ' +
    'centre at every value; seize position across its range and assert (t1-t0) is identical to the authored width.',
  status: 'FIXED', concepts_affected: ['rate_of_reaction'], fixed_in_files: R, row_type: 'incident',
},
{
  bug_class: 'kinetics_per_species_reagent_taps_declared_but_not_wired_to_the_gas',
  title: 'nA/nB sliders were declared but read by no physics function — the teacher drag moved a number while the box stayed frozen',
  severity: 'MAJOR', owner_cluster: 'peter_parker:renderer_primitives', subject: 'chemistry',
  root_cause:
    'gasSyncCount (the delta-control tap that makes a bulk N drag change the gas NOW) read only hasSlider(N); ' +
    'nA and nB had no per-species equivalent anywhere in stepGas, and gasKinReseed rebuilt the box strictly from ' +
    'the authored charge, never consulting them. So rate_law_and_order S9 showed a slider driving nothing, and ' +
    'S11 "run your own experiment" always replayed the fixed home-pose charge regardless of what the sliders ' +
    'displayed — the explore state promised a composition sandbox it did not have.',
  prevention_rule:
    'A per-species slider named n<SpeciesId> is a REAGENT TAP: wired through the same delta-control contract the ' +
    'bulk N slider uses but scoped to one species, and consulted by the re-seed path ahead of the authored charge ' +
    'whenever seized, so a rerun replays the composition currently shown. Drag-seize preserved: unseized ' +
    'behaviour byte-identical to not declaring the slider. Declaring a control in slider_controls is not wiring ' +
    'it — assert some physics function reads it.',
  probe_type: 'js_eval',
  probe_logic:
    'For every slider key of the form n<X> matching a reactant species id, assert a physics function reads ' +
    'hasSlider(n<X>) && userTouched[n<X>]. Then seize it, trigger the re-seed, and assert the live population ' +
    'equals the seized value rather than the authored species_counts.',
  status: 'FIXED', concepts_affected: ['rate_law_and_order'], fixed_in_files: R, row_type: 'incident',
},
];
(async () => { for (const r of rows) {
  const res = await supabaseAdmin.from('engine_bug_queue').upsert({ ...r, discovered_in_session: S }, { onConflict: 'bug_class' });
  console.log(res.error ? `  x ${r.bug_class}: ${res.error.message}` : `  ok ${r.severity} ${r.status} ${r.bug_class}`);
} })();
