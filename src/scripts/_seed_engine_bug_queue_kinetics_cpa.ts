/**
 * Scar rows from the founder_proxy Checkpoint A design gate on the chemistry
 * kinetics pair (rate_of_reaction + rate_law_and_order), 2026-08-07.
 *   npx tsx --env-file=.env.local src/scripts/_seed_engine_bug_queue_kinetics_cpa.ts
 *
 * All six were found at DESIGN time, before a line of JSON existed — which is the
 * point of Checkpoint A. Four are architect-class (a skeleton reasoning from a
 * stale comment, a misconception beat its own data refutes, a ring cut that hides
 * its own confrontation, a measured equality that is an identity), one is
 * chemistry_author-class (a density mitigation that breaks another state's null
 * result), one is the pair-level one (two documents claiming one shared engine
 * mechanism while specifying two).
 *
 * Verified against the live renderer before filing: gasHasGraphPane() has exactly
 * one occurrence in particle_field_renderer.ts (its own declaration — dead), the
 * renderer reads curState().glow_focal and never focal_primitive_id, and
 * conceptJson.ts:328 is .min(6).
 */
import '@/lib/loadEnvLocal';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const S = 'founder_proxy Checkpoint A, chemistry kinetics pair, 2026-08-07';
const ROR = 'rate_of_reaction';
const RLO = 'rate_law_and_order';

const rows = [
  {
    bug_class: 'skeleton_designs_against_a_renderer_flag_whose_behaviour_was_removed_but_whose_type_comment_was_not',
    title: 'A skeleton reserved a layout pane that the renderer stopped providing; only the stale type comment still promised it',
    severity: 'MAJOR', owner_cluster: 'alex:architect', subject: 'chemistry',
    root_cause:
      'particle_field_renderer.ts made the gas box own the full canvas (:3517-3524) and left ' +
      'gasHasGraphPane() defined-but-uncalled (:3500), while the config type comment at :6906 still ' +
      'read "with_graph reserves the right pane for the speed histogram". The architect read the ' +
      'comment, not the call graph, and built a Rule-34d zoning plan plus the concept\'s whiteboard-tier ' +
      'argument ("the box stays the left panel every state") on a pane that no longer exists. The real ' +
      'placement is an inset OVER the apparatus, which is exactly the condition the skeleton itself ' +
      'named as the survival condition for its diamond claim.',
    prevention_rule:
      'A skeleton citing a renderer FLAG must trace the flag to a live CALL, not to its type comment or ' +
      'its declaration. Grep the accessor and assert it has at least one caller. A defined-but-uncalled ' +
      'accessor is a removed feature with a surviving name. Same family as the archetype-[LIVE] decay ' +
      'warning at the top of docs/patterns/chemistry.md.',
    probe_type: 'js_eval',
    probe_logic:
      'For each renderer flag a skeleton cites as load-bearing, grep the emitted renderer for the ' +
      'accessor name and assert callers > 1 (declaration only = dead). Report the flag, its declaration ' +
      'line and its caller count.',
    status: 'OPEN', concepts_affected: [ROR], fixed_in_files: [], row_type: 'incident',
  },
  {
    bug_class: 'misconception_beat_whose_own_evidence_confirms_the_wrong_belief',
    title: 'A state stages a wrong belief for refutation while every measurement in the sim agrees with that belief',
    severity: 'CRITICAL', owner_cluster: 'alex:architect', subject: 'chemistry',
    root_cause:
      'rate_law_and_order S1 puts a balanced equation on screen with coefficients 1 and 1 and blinks ' +
      'unfilled "?" order slots, then S2-S4 measure x=1, y=1, overall 2 — the coefficients, four times ' +
      'running. The engine step is elementary, so measured order equals molecularity by construction and ' +
      'no in-sim experiment can produce the mismatch the beat exists to teach. The sim spends its whole ' +
      'runtime reinforcing the belief the concept was built to break.',
    prevention_rule:
      'Before authoring a Rule 16a contrast beat, confirm the ENGINE can produce the counter-evidence. ' +
      'If the model cannot generate the mismatch, do not stage the refusal — either find a runnable ' +
      'counterexample inside the same model (here: measure the NET rate with product present, where the ' +
      'doubling test genuinely returns the wrong exponent, which is why chemists take initial rates) or ' +
      'demote the belief to a narrated caveat and re-aim the primary aha. A refutation whose data ' +
      'confirms the belief is worse than no beat at all.',
    probe_type: 'manual',
    probe_logic:
      'For each misconception_watch, name the on-screen measurement that contradicts the belief and the ' +
      'state it is visible in. A row whose only counter-evidence is narration is not a contrast beat ' +
      'under Rule 16a.',
    status: 'OPEN', concepts_affected: [RLO], fixed_in_files: [], row_type: 'incident',
  },
  {
    bug_class: 'misconception_planted_in_core_ring_and_confronted_only_in_a_hideable_ring',
    title: 'A preset cut removes the only state that kills a belief a surviving core state plants',
    severity: 'MAJOR', owner_cluster: 'alex:architect', subject: 'chemistry',
    root_cause:
      'rate_law_and_order rings S4 (crowding raises the rate) core and S6 (inert crowding does not) ' +
      'extended, and the skeleton itself records that S4 plants the belief S6 kills. The ' +
      'qualitative_core preset therefore ships the misconception with its confrontation removed, to ' +
      'exactly the lower-tier syllabus most likely to hold it. Rule 38a\'s literal test (no surviving ' +
      'state REFERENCES hidden content) passes, so the letter of the rule was met while its purpose was ' +
      'inverted.',
    prevention_rule:
      'Rule 38a\'s cut check gains a second clause: for every misconception_watch, the confronting ' +
      'state\'s ring must be the same as or LOWER than the ring of the state that plants the belief. Run ' +
      'the check per preset, not once.',
    probe_type: 'js_eval',
    probe_logic:
      'For each state with misconception_watch, find the state the skeleton names as planting the ' +
      'belief; assert ring_rank(confronting) <= ring_rank(planting) with core<extended<advanced. Fail ' +
      'naming both states and the preset that separates them.',
    status: 'OPEN', concepts_affected: [RLO], fixed_in_files: [], row_type: 'incident',
  },
  {
    bug_class: 'measured_equality_is_an_identity_at_the_authored_home_pose',
    title: 'A state presents as a measurement an equality the authored composition makes true by construction',
    severity: 'MAJOR', owner_cluster: 'alex:architect', subject: 'chemistry',
    root_cause:
      'rate_of_reaction S6 measures three tangent slopes and claims their agreement as evidence. At the ' +
      'shared 90 A / 90 B, 1:1:1 irreversible home pose, A and B are consumed in the same event, so ' +
      'their curves are identical by definition — the skeleton already needs the dashed-B occlusion ' +
      'workaround for that exact reason. Only the A-vs-AB mirror is non-trivial. The state also prints a ' +
      '1/nu generalisation the 1:1:1 box cannot exercise, on the concept whose stated thesis is ' +
      '"measured, not asserted".',
    prevention_rule:
      'A state claiming to MEASURE a relation must state which authored parameter would have to change ' +
      'for the relation to come out false. If no such parameter exists, the relation is an identity and ' +
      'the state must either vary the composition or be re-aimed onto something the box can actually ' +
      'decide. Corollary: never print a generalisation on a formula surface that the authored apparatus ' +
      'cannot exercise.',
    probe_type: 'manual',
    probe_logic:
      'For each state claiming a measured agreement, name the authored parameter whose change would ' +
      'break the agreement, and the value at which it breaks. No such parameter = identity, not ' +
      'measurement.',
    status: 'OPEN', concepts_affected: [ROR], fixed_in_files: [], row_type: 'incident',
  },
  {
    bug_class: 'density_mitigation_for_one_state_breaks_a_null_result_claimed_by_another',
    title: 'The particle-density fix prescribed for chip noise raises the excluded-volume correction that a null-result state depends on being negligible',
    severity: 'MAJOR', owner_cluster: 'alex:chemistry_author', subject: 'chemistry',
    root_cause:
      'rate_law_and_order DQ-1 offers a declared N density exception to stabilise the rate-factor chip, ' +
      'while S6 claims adding inert discs leaves the rate at x1.00. For 2D hard discs the contact ' +
      'correction g(eta) = (1 - 7eta/16)/(1-eta)^2: at the 180-disc home pose the inert pour raises the ' +
      'A-B encounter rate ~4% (inside the noise band), but at a 720-disc exception it rises to ~20% and ' +
      'the chip would visibly read x1.2 under a caption saying "same rate". The two DQ items were ' +
      'written independently and neither references the other.',
    prevention_rule:
      'A declared density exception is not local. Before raising N, re-measure every state whose claim is ' +
      'a NULL result or an unchanged quantity at the new density — excluded-volume corrections scale ' +
      'with packing fraction and turn "no effect" into a visible effect. DQ items that share a parameter ' +
      'must be one coupled item.',
    probe_type: 'js_eval',
    probe_logic:
      'At each candidate N, measure the fwd event rate with and without the inert charge over the state ' +
      'window; assert the ratio stays within the state\'s narrated tolerance of 1.00 at the N actually ' +
      'shipped.',
    status: 'OPEN', concepts_affected: [RLO], fixed_in_files: [], row_type: 'incident',
  },
  {
    bug_class: 'sibling_skeletons_specify_one_shared_engine_mechanism_in_two_incompatible_documents',
    title: 'Two parallel skeletons declared "one panel, two modes" while specifying different placement, axes, sampling and fit',
    severity: 'MAJOR', owner_cluster: 'alex:architect', subject: 'chemistry',
    root_cause:
      'rate_of_reaction and rate_law_and_order each wrote an independent engine ask for what both called ' +
      'one shared kinetics panel. One targets the (removed) with_graph right pane, the other the ' +
      'drawGasConcGraph inset slot; x is real seconds vs a live count, y is particle count vs windowed ' +
      'event rate, the fit is a local slope vs an origin-constrained global least squares, and the flags ' +
      'and widget keys share no naming. Dispatching the surgeon on both would have produced two bespoke ' +
      'instruments under one claim of minimality.',
    prevention_rule:
      'When two concepts in parallel design claim a SHARED engine mechanism, the mechanism gets ONE spec ' +
      'authored once, with one placement decision, one flag namespace and one acceptance test — before ' +
      'either skeleton passes its design gate. A shared-mechanism claim asserted in two documents is two ' +
      'mechanisms until proven otherwise.',
    probe_type: 'manual',
    probe_logic:
      'For any engine ask citing a sibling concept, diff the two asks field by field (placement, axes, ' +
      'sampling, fit, flag names, widget keys). Any disagreement means the shared-mechanism claim is ' +
      'unproven and the ask is not dispatchable.',
    status: 'OPEN', concepts_affected: [ROR, RLO], fixed_in_files: [], row_type: 'incident',
  },
];

(async () => {
  for (const r of rows) {
    const res = await supabaseAdmin
      .from('engine_bug_queue')
      .upsert({ ...r, discovered_in_session: S }, { onConflict: 'bug_class' });
    console.log(res.error ? `  x  ${r.bug_class}: ${res.error.message}` : `  ok ${r.severity.padEnd(8)} ${r.status.padEnd(5)} ${r.bug_class}`);
  }
})();
