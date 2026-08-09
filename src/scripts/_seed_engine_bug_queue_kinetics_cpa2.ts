/**
 * Scar rows from founder_proxy Checkpoint A CYCLE 2 (verification pass) on the
 * chemistry kinetics pair, 2026-08-07.
 *   npx tsx --env-file=.env.local src/scripts/_seed_engine_bug_queue_kinetics_cpa2.ts
 *
 * Every row below is backed by a 5-seed headless run of the emitted renderer
 * (the check_gas_reaction_physics.ts vm pattern), not by reading. Two of them
 * indict decisions made by THIS session, not by an agent:
 *   - the activation_fwd_kT 1.2 alignment (row 2) was a session call to increase
 *     fleet coherence; it moved an equilibrium-regime constant into two
 *     irreversible boxes and burned the reaction down before it could be measured.
 *   - rows 4 and 5 are defects in the merged instrument spec this session authored.
 * Verified before filing: collision_theory_activation_energy ships Ea 3,
 * dynamic_equilibrium and le_chateliers_principle ship Ea 1.2 with the reverse
 * layer on — the regime boundary row 2 describes.
 */
import '@/lib/loadEnvLocal';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const S = 'founder_proxy Checkpoint A cycle 2, chemistry kinetics pair, 2026-08-07';
const ROR = 'rate_of_reaction';
const RLO = 'rate_law_and_order';

const rows = [
  {
    bug_class: 'batch_box_rate_ratio_pinned_to_an_earlier_value_measures_the_run_down_not_the_disturbance',
    title: 'A disturbance experiment staged inside one closed run reads the run-down, not the disturbance',
    severity: 'CRITICAL', owner_cluster: 'alex:architect', subject: 'chemistry',
    root_cause:
      'rate_law_and_order S2-S5 pin the live windowed reaction rate as a x1.00 baseline, then pour reactant ' +
      'mid-state and read the ratio. The gas_box is a closed batch reactor with no reactant feed, so the ' +
      'underlying rate is monotonically falling at all times; the ratio therefore measures (disturbance x ' +
      'run-down). Measured over 5 seeds at three poses the "double A, rate doubles" beat read x0.43-x0.66, ' +
      'x1.27-x1.80 and x0.75-x0.96 against an authored claim of x2.0, and the inert-null beat read x0.29 with ' +
      'the pour against x0.32 without, under a caption claiming x1.00. The physics is correct — the ' +
      'counterfactual comparison is x2.4 — only the instrument is wrong.',
    prevention_rule:
      'An initial-rate experiment must compare the INITIAL slope of two SEPARATE runs at two compositions, ' +
      'never a pinned-then-poured ratio inside one run. Any skeleton whose boundary declaration says "many ' +
      'runs, compared" must instrument it as many runs, compared. Design-gate probe: name the baseline the ' +
      'ratio is taken against and state what else changed between the pin and the read.',
    probe_type: 'js_eval',
    probe_logic:
      'Headless vm harness on the emitted particle_field_renderer.ts: boot the authored home pose, run to the ' +
      'authored pin time, record gasRxFwdRate, apply the authored injection, run one instrument window, and ' +
      'assert the measured ratio is within 15% of the authored claim across 5 seeds.',
    status: 'OPEN', concepts_affected: [RLO], fixed_in_files: [], row_type: 'incident',
  },
  {
    bug_class: 'fleet_constant_transplanted_across_a_reversible_to_irreversible_regime_boundary',
    title: 'A shipped constant reused for fleet coherence changed the physics regime it was measured in',
    severity: 'CRITICAL', owner_cluster: 'alex:architect', subject: 'chemistry',
    root_cause:
      'activation_fwd_kT 1.2 is the shipped value in dynamic_equilibrium and le_chateliers_principle, where ' +
      'reverse_attempt_per_s 8 holds the box at a plateau and a fast forward rate runs nothing down. Both ' +
      'kinetics concepts are irreversible by design (reverse 0 in every measuring state). At 1.2 the reactant ' +
      'half-life is 4 s at 180 discs and 1 s at 720; 64% of the reactant is consumed in the first second of ' +
      'the authored home pose, leaving a flat line for the remaining 30 s of every state that measures a ' +
      'slope. The same pin also raises the clearing fraction to ~30% against collision_theory_activation_' +
      'energy STATE_2 narrating "a handful of collisions in every hundred" on the same apparatus. The pin was ' +
      'a dispatching-session decision made to increase fleet coherence; it decreased it.',
    prevention_rule:
      'A constant is shipped WITH its regime, not on its own. Before adopting a fleet constant, state which ' +
      'other authored fields it was measured against (here reverse_attempt_per_s) and re-measure if any of ' +
      'them differ. Inherit from the concept that OWNS the quantity (the barrier belongs to collision_theory, ' +
      'Ea 3), not from the nearest concept that happens to use it.',
    probe_type: 'js_eval',
    probe_logic:
      'Headless vm harness: boot the authored home pose and step 40 s, reporting reactant count at ' +
      '2/5/10/20/40 s and the reactant half-life; assert the half-life is at least one third of the longest ' +
      'guided state duration.',
    status: 'OPEN', concepts_affected: [ROR, RLO], fixed_in_files: [], row_type: 'incident',
  },
  {
    bug_class: 'density_raised_for_the_noise_floor_without_costing_what_it_does_to_the_run_length',
    title: 'A noise-floor fix was argued on one side of a knob that trades against the lesson duration',
    severity: 'MAJOR', owner_cluster: 'alex:architect', subject: 'chemistry',
    root_cause:
      'rate_of_reaction quadrupled the particle count to 720 to raise the event rate above the Poisson ' +
      'slope-noise floor (1/sqrt(r*tau)), stating a one-sided target of "at least 50 events/s". Event rate and ' +
      'run length are set by the same knob: total events available equals the reactant count, so raising ' +
      'events/s shortens the measurable window proportionally. Measured at the authored pose the box delivered ' +
      '230 events in the first second and was flat by second eight, contradicting the skeleton own pacing ' +
      'target of half consumed in 8-12 s. Separately, 10% slope jitter at a +/-1 s window is unreachable at ' +
      'any density this box can hold: 100 events per +/-1 s window sustained over 30 s needs ~1500 discs, ' +
      'packing fraction ~0.38.',
    prevention_rule:
      'A noise-floor argument must be two-sided: state the event rate the instrument needs AND the total event ' +
      'budget the lesson duration allows, and show the chosen density satisfies both. Where they conflict, the ' +
      'settled window widens — the window is derived from the measured event budget, never asserted first.',
    probe_type: 'js_eval',
    probe_logic:
      'Headless vm harness: at the authored pose, report events per second at 1/2/5/10/20/30 s and the event ' +
      'count inside the authored measuring window at each authored measurement time; assert the window holds ' +
      'at least 25 events at every authored measurement time.',
    status: 'OPEN', concepts_affected: [ROR], fixed_in_files: [], row_type: 'incident',
  },
  {
    bug_class: 'new_renderer_instrument_ships_without_a_dim_key_so_every_glow_focal_naming_it_reaches_nothing',
    title: 'A merged engine spec declared widget keys but no glow-emphasis names, making Rule 32e inert on the new instruments',
    severity: 'MAJOR', owner_cluster: 'peter_parker:renderer_primitives', subject: 'chemistry',
    root_cause:
      'Rule 32e on particle_field resolves through dimFor(name), and an element participates only because its ' +
      'draw call passes a literal name (dimFor(box) :4754, particles :4787, reaction :4961, conc_graph :5067, ' +
      'arrhenius :5405, histogram :5483). GAS_BOX_KINETICS_INSTRUMENT_SPEC.md section 3 assigns PF_WG_FLAGS ' +
      'widget keys to the three new instruments and no dim names, and section 7 states the new concepts "need ' +
      'nothing here" — while both skeletons make those exact instruments the declared per-state glow focal. ' +
      'Same defect class as the earlier focal_primitive_id finding, one abstraction level up: an authored ' +
      'focal name that reaches nothing.',
    prevention_rule:
      'Every new canvas instrument declares BOTH a PF_WG_FLAGS widget key (Rule 39) and a dimFor() emphasis ' +
      'name (Rules 29/32e), in the same spec section, and the spec lists the exact names a concept may author ' +
      'as glow_focal. Widget visibility and glow emphasis are two namespaces; a spec that gives one and not ' +
      'the other ships an inert rule.',
    probe_type: 'js_eval',
    probe_logic:
      'Grep the emitted renderer for every literal passed to dimFor(); assert every glow_focal value authored ' +
      'by any concept JSON appears in that set, and report any authored focal name with no matching draw call.',
    status: 'OPEN', concepts_affected: [ROR, RLO], fixed_in_files: [], row_type: 'incident',
  },
  {
    bug_class: 'merged_spec_omits_an_instrument_two_states_depend_on_and_the_nearest_existing_chip_measures_a_different_quantity',
    title: 'A merged instrument spec dropped a readout carried only in the sibling skeleton state table',
    severity: 'MAJOR', owner_cluster: 'alex:architect', subject: 'chemistry',
    root_cause:
      'GAS_BOX_KINETICS_INSTRUMENT_SPEC.md section 1 enumerates four pieces (two plot modes, a rate-ratio ' +
      'chip, a counts-only chip). rate_law_and_order S6 (core, misconception watch 2, supporting aha) and S7 ' +
      '(its declared contrast pair) both require a live k = rate / (A x B) chip, present in that skeleton ' +
      'control table and DoD symbol table but in no section of the merged spec. The nearest existing ' +
      'instrument, drawGasKRatio at :5043, computes the EQUILIBRIUM constant K = nAB/(nA*nB): measured over ' +
      'the authored irreversible run-down it climbs from 0.0010 to 0.3833 in 20 s, under a caption reading ' +
      '"Rate falls, k holds".',
    prevention_rule:
      'When merging two skeletons into one engine spec, diff the merged piece list against every instrument ' +
      'named in either skeleton control table, DoD symbol table and DQ list — not just against the skeletons ' +
      'own instrument-requirements sections. Any existing readout proposed for reuse must have its FORMULA ' +
      'quoted from the renderer and checked against the state claim.',
    probe_type: 'manual',
    probe_logic:
      'For each state in every concept consuming a merged spec, list the instruments named in the control ' +
      'table, the DoD symbol table and the DQ list, and assert each appears in the spec piece table or in the ' +
      'shipped renderer with a formula that matches the state caption.',
    status: 'OPEN', concepts_affected: [RLO], fixed_in_files: [], row_type: 'incident',
  },
  {
    bug_class: 'explore_state_runs_its_reaction_to_completion_and_has_no_teacher_facing_rerun',
    title: 'A Rule 37 free-running sandbox becomes a dead box because its authored physics finishes',
    severity: 'MAJOR', owner_cluster: 'alex:architect', subject: 'chemistry',
    root_cause:
      'Both kinetics explore states author an irreversible reaction (reverse_attempt_per_s 0) with all sliders ' +
      'live. Measured at the authored constants the reactant falls from 360 to 25 within 10 s, after which the ' +
      'clock free-runs (Rule 37) over a box in which nothing further happens and the window/concentration ' +
      'sliders change nothing visible. Both skeletons say "rerun" or "run your own experiments"; ' +
      'resetToHomePose() is reachable only from the harness messages SET_TIME_FREEZE (:6628) and ' +
      'RESET_TRAJECTORY (:6643) — there is no teacher-facing rerun affordance in the renderer or the spec.',
    prevention_rule:
      'An explore state whose authored physics terminates must either be paced so it outlives a classroom ' +
      'demonstration or ship a declared rerun affordance. Rule 37 guarantees the clock keeps running; it does ' +
      'not guarantee anything is still moving.',
    probe_type: 'js_eval',
    probe_logic:
      'Headless vm harness: step the explore state for 120 s and assert at least one authored event type is ' +
      'still occurring in the final 30 s; separately assert a rerun path exists that is not a harness-only ' +
      'message.',
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
