/**
 * Scar rows for the collision_theory_activation_energy session (2026-07-29/30).
 *   npx tsx --env-file=.env.local src/scripts/_seed_engine_bug_queue_collision_theory.ts
 *
 * P1 #4 on particle_field / gas_box. Every row below was found by a measurement,
 * a rendered frame, or a review agent — NOT by a deterministic gate. THE EYE
 * returned 35/35 and later 39/39 over frames containing most of them.
 *
 * NOTE on owner_cluster: the previous chemistry session recorded that
 * `alex:chemistry_author` was rejected by this table's CHECK constraint. That is
 * no longer true (3 rows already carry it), so the authoring rows are filed
 * against it rather than parked.
 */
import '@/lib/loadEnvLocal';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const S = 'session_2026-07-29_collision_theory_activation_energy';
const R = 'src/lib/renderers/particle_field_renderer.ts';
const G = 'src/scripts/check_gas_reaction_physics.ts';
const V = 'src/scripts/validate-chemistry.ts';
const C = 'collision_theory_activation_energy';
const KPT = 'kinetic_particle_theory';

const rows = [
  // ─────────────────── the one that destroyed data silently ───────────────────
  {
    bug_class: 'gas_box_reaction_off_species_counts_truncated_to_population',
    title: 'A reaction-off state whose species_counts exceeded its population was TRUNCATED to the config count, keeping only the FIRST species — 720 discs became 180, every one of them species A',
    severity: 'CRITICAL', owner_cluster: 'peter_parker:renderer_primitives', subject: 'chemistry',
    root_cause:
      'VERIFIED + GATED 2026-07-29. With the reaction ON, gasSyncCount treats N as a DELTA control and ' +
      'leaves the composition alone. With it OFF it takes the other branch, where N IS the population: ' +
      'particles.length = want. Because gasPlaceSpecies lays species down in ORDER, the survivors are ' +
      'the first species only. STATE_7 authored species_counts {A:360, B:360} for a deliberate density ' +
      'exception but no N, so the config count of 180 truncated it on the very next tick: measured ' +
      'A:360/B:360 at t=0 and A:180 alone at t=32s — every B disc deleted. Nothing caught it. tsc, all ' +
      'three validators and check:gas-reaction (65 checks) were green and THE EYE returned 35/35 TWICE. ' +
      'Worse, the state\'s own Arrhenius instrument still drew a clean straight line at a plausible ' +
      'slope, BECAUSE A-A collisions clear an activation barrier exactly as well as A-B ones do — the ' +
      'one instrument that could have reported the problem was mathematically immune to it. Found by ' +
      'looking at a frame and noticing the box had gone entirely blue.',
    prevention_rule:
      'On gas_box, a state that turns the reaction OFF must declare a population equal to the sum of its ' +
      'species_counts (author N explicitly). Now machine-enforced by validate:chemistry, which names the ' +
      'state, both numbers, which one wins and what gets deleted. GENERAL FORM: when an instrument\'s ' +
      'output is mathematically independent of the property that broke, that instrument cannot be used ' +
      'as evidence the property is intact — count the objects.',
    probe_type: 'js_eval',
    probe_logic:
      'For every gas_box state with species_counts and the reaction disabled, assert ' +
      'sum(species_counts) === (state.N ?? gas.count). Runtime form: assert particles.length at t=0 ' +
      'equals the declared sum, and that no species count drops to zero unless authored zero.',
    status: 'FIXED', concepts_affected: [C], fixed_in_files: [V, G], row_type: 'incident',
  },

  // ─────────────────── instrument honesty: the counter chip ───────────────────
  {
    bug_class: 'gas_counter_window_too_short_for_a_rare_event',
    title: 'The collision counter averaged the cleared-Ea rate over 1 s, so the displayed percentage swung 0.0%-8.2% on a steady box — a frame could read 0.0% under a caption about collisions clearing the barrier',
    severity: 'MAJOR', owner_cluster: 'peter_parker:renderer_primitives', subject: 'chemistry',
    root_cause:
      'VERIFIED + FIXED 2026-07-29. gasSampleStats capped gasCollWin/gasSuccessWin at 60 frames. That is ' +
      'correct for the collision rate (hundreds/s) and wrong for the cleared-Ea rate printed beside it, ' +
      'which is the same rare-event regime the REACTION rates in the same function were given a 5 s ' +
      'window for, with the reasoning already written there: "a short window on a rare event reports a ' +
      'rate that flickers between 0 and a spike". At ~6 clearing events per second the displayed ' +
      'percentage measured 0.0%-8.2% on a state narrating "about three in a hundred", and 2.2%-22.5% on ' +
      'the state claiming it "soars past fourteen". Settled-tail spread at a 5 s window falls from 5.6pp ' +
      'to 1.7pp and no frame reads 0.0%.',
    prevention_rule:
      'Two rates printed on one chip must be averaged over windows appropriate to their own event RATES, ' +
      'not to the chip. Before narrating any instrument value, sample what it DISPLAYS across the state ' +
      'at three viewports — not what a cumulative headless total says.',
    probe_type: 'js_eval',
    probe_logic:
      'Sample 100*gasSuccessRate/gasCollRate every 0.5 s over the state\'s settled tail; fail if the ' +
      'spread exceeds ~2pp or any sample reads 0.0 while an activation energy is set.',
    status: 'FIXED', concepts_affected: [C], fixed_in_files: [R, G], row_type: 'incident',
  },
  {
    bug_class: 'gas_counter_integer_rounding_breaks_the_cross_chip_ratio',
    title: 'Math.round on the cleared-Ea rate made two chips imply 140% of energetic collisions reacting, on the state whose whole claim is that only a fraction do',
    severity: 'MAJOR', owner_cluster: 'peter_parker:renderer_primitives', subject: 'chemistry',
    root_cause:
      'VERIFIED + FIXED 2026-07-29. drawGasCounters printed Math.round(gasSuccessRate) while ' +
      'drawGasReaction printed gasRxFwdRate.toFixed(1). The two are three orders of magnitude apart ' +
      'from the collision rate, so rounding the small one destroyed the only comparison collision ' +
      'theory makes: measured frames showed a rounded "1/s clear Ea" beside "fwd 1.4/s", i.e. 140%, and ' +
      'a rounded "0/s clear Ea" beside a live forward rate. The state\'s central number (the share of ' +
      'energetic collisions that react) is READ off these two chips and had no instrument of its own.',
    prevention_rule:
      'A value a viewer is expected to COMPARE against another on-screen value must be printed at a ' +
      'precision that survives the comparison. If a state\'s central claim is a ratio of two displayed ' +
      'numbers, verify the ratio on rendered frames, not the two numbers separately.',
    probe_type: 'vision_model',
    probe_logic: 'Read both chips from frames; fail if the implied ratio exceeds 100% or divides by a displayed zero.',
    status: 'FIXED', concepts_affected: [C], fixed_in_files: [R], row_type: 'incident',
  },
  {
    bug_class: 'gas_counter_chip_hidden_under_pm_formula_overlay',
    title: 'The collision counter was right-aligned under the #pm-formula chip, hiding the percentage — the one number on it that narration is allowed to speak',
    severity: 'MAJOR', owner_cluster: 'peter_parker:renderer_primitives', subject: 'chemistry',
    root_cause:
      'VERIFIED + FIXED 2026-07-29. drawGasCounters is right-aligned under the box because drawLabel ' +
      'owns the bottom-LEFT corner — but bottom-RIGHT is #pm-formula\'s, and any state lighting both put ' +
      'the formula box over the chip. Measured on a probe frame: the chip read "9/s clear Ea (4" and ' +
      'stopped. Absolute rates are viewport-dependent (x5.29 across four viewports) while the ' +
      'percentage is not (x1.05), so the overlay was burying the only magnitude in the instrument that ' +
      'narration may quote. No shipped state paired the two, which is why it had never surfaced.',
    prevention_rule:
      'A canvas HUD must measure the DOM overlays above it (offsetWidth of #pm-formula and the slider ' +
      'panel) rather than assuming a corner is free. Both bottom corners of a gas_box canvas are ' +
      'already claimed.',
    probe_type: 'vision_model', visual_category: 'H',
    probe_logic: 'For every state, assert no canvas chip bounding box intersects a position:fixed DOM overlay.',
    status: 'FIXED', concepts_affected: [C], fixed_in_files: [R], row_type: 'incident',
  },

  // ─────────────────── overlay collision that was already shipping ────────────
  {
    bug_class: 'gas_histogram_inset_clipped_by_review_slider_panel',
    title: 'The speed histogram sits under the review player\'s fixed slider panel on any state showing sliders, clipping its own Ea threshold label — shipping unnoticed in kinetic_particle_theory STATE_7',
    severity: 'MAJOR', owner_cluster: 'peter_parker:renderer_primitives', subject: 'chemistry',
    root_cause:
      'VERIFIED + FIXED 2026-07-29 (eye_walker + quality_auditor, independently). drawGasHistogram insets ' +
      'at gasBoxRFull()-gw-22, top-right inside the box. The review player\'s slider panel is a ' +
      'position:fixed DOM overlay at top ~52 / right 10, ABOVE the canvas, so on any state with ' +
      'show_sliders it lands on the inset and clipped the "Ea" threshold label to a bare "E" and the ' +
      'species tag with it. drawGasReaction already dodges this exact panel (its comment records a ' +
      'measured 230x52 overlap); the histogram never did. NOT NEW: kinetic_particle_theory STATE_7 ' +
      'combines show_sliders + show_speed_histogram and has shipped this way since the histogram landed. ' +
      'Fixed by moving the inset to the LEFT when a state shows sliders. Consequence: STATE_7 of ' +
      'kinetic_particle_theory moves 9.36% (pixels only; the other six states are 0.00%) and needs ' +
      'founder re-approval — visual:approve NOT run.',
    prevention_rule:
      'Every canvas inset must dodge the review chrome, not just the ones a bug was filed against. When ' +
      'fixing an overlay collision, grep the fleet for other states with the SAME flag combination ' +
      'before assuming the defect is new.',
    probe_type: 'vision_model', visual_category: 'H', state_id: 'STATE_7',
    probe_logic: 'Assert no canvas inset intersects the slider panel rect on any state with show_sliders true.',
    status: 'FIXED', concepts_affected: [C, KPT], fixed_in_files: [R], row_type: 'incident',
  },

  // ─────────────────── authored-but-inert config ──────────────────────────────
  {
    bug_class: 'gas_ea_slider_had_no_usertouched_guard',
    title: 'Merely DECLARING an Ea slider replaced every state\'s authored barrier with the slider default, on every state, whether or not anyone touched it',
    severity: 'MAJOR', owner_cluster: 'peter_parker:renderer_primitives', subject: 'chemistry',
    root_cause:
      'VERIFIED + FIXED 2026-07-29. gasActivationE opened with `if (hasSlider(\'Ea\')) return ' +
      'sliderVal(\'Ea\')` — no userTouched guard, unlike gasTargetT / gasTargetPistonF / gasCount which ' +
      'all have one. Measured: a concept authoring activation_energy_kT 3 (raw 9.9225, 3.16% of ' +
      'collisions clearing) ran at raw 6.6 / 10.01% the moment an Ea slider appeared in slider_controls. ' +
      'The slider also read RAW px/tick energy rather than the kT the author writes — a number nobody ' +
      'can reason about (Rule 33d). No shipped concept declared the slider, so nothing had been affected.',
    prevention_rule:
      'Every teacher control resolves as: dragged value (userTouched only) -> this state\'s authored ' +
      'value -> a stable declared default. A control added speculatively and never exercised is not ' +
      'verified; assert the UNTOUCHED case explicitly.',
    probe_type: 'js_eval',
    probe_logic: 'Declare each slider and assert the authored per-state value is unchanged until userTouched is set.',
    status: 'FIXED', concepts_affected: [C], fixed_in_files: [R, G], row_type: 'incident',
  },
  {
    bug_class: 'gas_t_from_and_piston_from_ramps_ignored_their_narration_cue',
    title: 'T_from and piston_from ramped from STATE ENTRY, so three states bound a cue to narration that described a change already finishing',
    severity: 'MAJOR', owner_cluster: 'peter_parker:renderer_primitives', subject: 'chemistry',
    root_cause:
      'VERIFIED + FIXED 2026-07-29. gasTargetT ramps on PM_simTimeMs/dur and gasMovePiston on ' +
      'PM_simTimeMs/rampMs — both from t=0, with no way to wait for a cue. STATE_3, STATE_4 and STATE_7 ' +
      'each authored a cue (heat / squeeze / ramp) bound to a narration sentence via scenario_cue, and ' +
      'NO mechanism consumed any of them: the cues were inert and the ramps had already begun. On the ' +
      'PRIMARY aha state a 6 s ramp could therefore finish as the sentence naming it played — the ' +
      'cue/narration desync scar inverted. Fixed with T_cue / piston_cue; omitting them is byte-identical.',
    prevention_rule:
      'Audit every authored cue against the mechanisms that consume it: a cue referenced only by ' +
      'scenario_cue and by nothing else is dead config that reads as choreography. Same family as the ' +
      'field_3d dead-annotation and duplicate-key scars — authored, valid, discarded.',
    probe_type: 'js_eval',
    probe_logic:
      'For each state, diff the set of cue ids against the union of inject_cue / barrier_lift_cue / ' +
      'ea_at_cue.cue / reaction_at_cue.cue / T_cue / piston_cue; report any cue no mechanism reads.',
    status: 'FIXED', concepts_affected: [C], fixed_in_files: [R, G], row_type: 'incident',
  },
  {
    bug_class: 'gas_inject_cue_silently_undone_when_reaction_disabled',
    title: 'An authored inject_cue has ZERO effect when the reaction layer is off — gasSyncCount truncates the arrivals on the very next tick',
    severity: 'MODERATE', owner_cluster: 'peter_parker:renderer_primitives', subject: 'chemistry',
    root_cause:
      'MEASURED 2026-07-29, NOT FIXED. With the reaction off, gasSyncCount pins particles.length to ' +
      'gasCount(), so particles added by an inject_cue are deleted before they are ever drawn. Measured ' +
      'x1.00 effect on collision rate for an authored +180 injection (composition unchanged at ' +
      'A:90/B:90). This was found while choosing between two designs for a crowding state; the piston ' +
      'was used instead, so no shipped concept depends on it. Left OPEN because an authored disturbance ' +
      'that silently vanishes is a trap, not a limitation.',
    prevention_rule:
      'Do not author inject_cue on a state with the reaction disabled. Engine fix would be to advance ' +
      'the N target by the injected amount so the sync branch has nothing to correct.',
    probe_type: 'js_eval',
    probe_logic: 'Fire an inject_cue with the reaction off; assert particles.length rose by inject_n and stayed.',
    status: 'OPEN', concepts_affected: [], fixed_in_files: [], row_type: 'incident',
  },
  {
    bug_class: 'gas_per_state_N_is_inert_on_entry_in_a_reacting_box',
    title: 'A state authoring N in a reacting box opens at the composition its species_counts describe, not at N — silently',
    severity: 'MODERATE', owner_cluster: 'peter_parker:renderer_primitives', subject: 'chemistry',
    root_cause:
      'MEASURED + GATED 2026-07-29. gasInit places by species_counts (or the species list\'s own counts) ' +
      'and never consults gasCount() unless a species is left undeclared; gasSyncCount then pins ' +
      'gasNPrev on its first tick and returns, because in reaction mode N is a DELTA control. Measured: ' +
      'a state authoring N:360 opens at 120. le_chateliers_principle STATE_7 authors both and is correct ' +
      'only because its species_counts already sum to its N. Behaviour is deliberate (it protects the ' +
      'atom inventory against a reacting box); the trap is that it is silent.',
    prevention_rule: 'In a reacting gas_box state, composition is species_counts. N is a delta control, not a population.',
    probe_type: 'js_eval',
    probe_logic: 'Author a state N differing from sum(species_counts) with the reaction on; assert the opening population follows species_counts.',
    status: 'FIXED', concepts_affected: [], fixed_in_files: [G], row_type: 'incident',
  },

  // ─────────────────── guards and pictures that lied ─────────────────────────
  {
    bug_class: 'guard_depended_on_the_draw_path_having_run',
    title: 'The Arrhenius fit\'s span guard read a variable only the draw function populates, so headless — and before the first frame — it silently did nothing',
    severity: 'MAJOR', owner_cluster: 'peter_parker:renderer_primitives', subject: 'subject_neutral',
    root_cause:
      'VERIFIED + FIXED 2026-07-29. gasArrhFit refused to fit points crowded into a narrow 1/T range by ' +
      'comparing their span against gasArrAxis — which drawGasArrhenius populates. In the browser the ' +
      'draw runs first so the guard worked; headless, and on any frame before the first draw, ' +
      'gasArrAxis was null and the guard was skipped entirely. Caught by the gate assertion written FOR ' +
      'the guard: 10 points spanning 300-320 K on a 250-800 K axis still produced a line, at slope -119. ' +
      'gasArrhFit now takes the state and solves the axis itself.',
    prevention_rule:
      'A correctness guard must not depend on rendering having happened. Write the assertion for a fix ' +
      'in the headless harness — it is the only thing that can tell you the fix is inert.',
    probe_type: 'js_eval',
    probe_logic: 'Exercise every guard from a cold boot with no draw call and assert it still refuses the bad input.',
    status: 'FIXED', concepts_affected: [C], fixed_in_files: [R, G], row_type: 'incident',
  },
  {
    bug_class: 'reaction_profile_drew_the_wrong_one_of_two_barriers',
    title: 'The energy hill drew the collision counter\'s threshold instead of the reaction\'s forward barrier, so the reverse barrier measurable off the picture read 5.0 kT against the 3.2 kT the engine derives',
    severity: 'MAJOR', owner_cluster: 'peter_parker:renderer_primitives', subject: 'chemistry',
    root_cause:
      'VERIFIED + FIXED 2026-07-30. gas_box carries TWO independent barriers: activation_energy_kT (the ' +
      'collision counter\'s threshold) and reaction.activation_fwd_kT (what the reaction actually uses). ' +
      'A concept may set them differently. gasProfileLevels took its peak from gasActivationE, so with ' +
      'them differing the hill\'s peak-minus-product-level — a quantity a viewer can measure straight ' +
      'off the diagram — reported a reverse barrier of 5.0 kT where the engine derives 3.2 kT: the ' +
      'picture contradicting the physics it exists to illustrate. It renders identically either way. ' +
      'Fixed to draw the REACTION\'s barrier, and ea_at_cue now drives both so a catalyst cue cannot ' +
      'move one without the other.',
    prevention_rule:
      'A diagram of a derived quantity must assert the derivation, not resemble it. For any illustrative ' +
      'drawing, pin an identity that the picture\'s own geometry must reproduce (here: peak - products ' +
      '=== Ea_rev). When an engine exposes two numbers for one physical idea, a picture must state which.',
    probe_type: 'js_eval',
    probe_logic: 'Assert gasProfileLevels().peak - .prod === gasRxEaRev()/kT_ref, and that a catalyst cue moves both barriers together.',
    status: 'FIXED', concepts_affected: [C], fixed_in_files: [R, G], row_type: 'incident',
  },
  {
    bug_class: 'gas_box_glow_focal_never_authored_so_rule32e_is_inert',
    title: 'Every gas_box concept declares focal_primitive_id on every state and glow_focal on none, so dimFor() returns 1 everywhere and nothing is ever emphasised',
    severity: 'MODERATE', owner_cluster: 'ambiguous', subject: 'chemistry',
    root_cause:
      'REPORTED 2026-07-29 by quality_auditor, NOT FIXED. The renderer\'s emphasis channel on ' +
      'particle_field is particle_field_config.states.*.glow_focal, consumed by dimFor()/focalSet. ' +
      'Across all four shipped gas_box chemistry concepts it is authored on ZERO states, while ' +
      'focal_primitive_id is authored on every state and scene roles say "the focal (Rule 32e)". So the ' +
      'declared focal is documentation only and no peer element is ever dimmed. 20+ circuit concepts on ' +
      'the same renderer DO author it, so this is a gas_box authoring gap rather than an engine defect. ' +
      'Fleet-wide and pre-existing; not this concept\'s regression.',
    prevention_rule:
      'On particle_field, Rule 32e requires glow_focal in the scenario config — focal_primitive_id in ' +
      'scene_composition does not reach the renderer. Founder call whether to backfill the gas_box ' +
      'fleet (moves baselines) or drop the Rule-32e claim from their scene roles.',
    probe_type: 'js_eval',
    probe_logic: 'For every particle_field state declaring focal_primitive_id, assert glow_focal is authored in the scenario config.',
    status: 'OPEN', concepts_affected: [C, KPT, 'dynamic_equilibrium', 'le_chateliers_principle'],
    fixed_in_files: [], row_type: 'incident',
  },

  // ─────────────────── authoring rows ────────────────────────────────────────
  {
    bug_class: 'chemistry_formula_surface_declared_without_a_formula_overlay',
    title: 'Three states declared a formula_surface primitive with no formula_overlay configured, so the concept\'s central equation appeared on NO state',
    severity: 'MAJOR', owner_cluster: 'alex:json_author', subject: 'chemistry',
    root_cause:
      'VERIFIED + FIXED 2026-07-29 (eye_walker + quality_auditor, independently). scene_composition ' +
      'declared formula_surface on STATE_3, STATE_7 and STATE_8, and the skeleton\'s Definition of Done ' +
      'declared "rate proportional to (collisions/s) x (fraction clearing Ea)" as earned in the aha ' +
      'state and persisting after it. Only STATE_6 configured particle_field_config formula_overlay, so ' +
      'the equation the concept is about was never drawn anywhere, and the declared primitives counted ' +
      'toward Rule 19 while rendering nothing. Same family as the field_3d silent-annotation scar.',
    prevention_rule:
      'On particle_field, a declared formula_surface renders only if the state also sets formula_overlay. ' +
      'Audit declared scene primitives against the config fields that actually paint them, per state.',
    probe_type: 'js_eval',
    probe_logic: 'Diff scene_composition formula_surface ids against configured formula_overlay per state; fail on any declared-but-unconfigured surface.',
    status: 'FIXED', concepts_affected: [C], fixed_in_files: [], row_type: 'incident',
  },
  {
    bug_class: 'narration_quotes_a_point_value_of_a_noisy_instrument',
    title: 'Four narration claims were true of the physics and false of the chip a teacher reads — including "about a third react" where the two instruments read 38-50%',
    severity: 'MAJOR', owner_cluster: 'alex:chemistry_author', subject: 'chemistry',
    root_cause:
      'VERIFIED + FIXED 2026-07-29. Every figure had been measured as a CUMULATIVE headless total over ' +
      '30 s, then narrated as though the on-screen instrument showed it. Measured on the rendered chip ' +
      'instead: "the counter reading three point three percent" (frames legitimately read 2.5%), "soars ' +
      'past fourteen percent" (settled median 12.8-14.1), "climbs to eighteen" (15.5-22.2), and "only ' +
      'about a third actually react" (the two chips read 38-50%, i.e. about HALF — the earlier figure ' +
      'came from a different sampling window). Direct recurrence of the le_chateliers_principle STATE_5 ' +
      'finding, where an unlucky frame confirmed the misconception the state existed to refute.',
    prevention_rule:
      'Narrate what the INSTRUMENT displays, not what a headless total measures. Any quantity a sentence ' +
      'quotes must be sampled from the displayed value across the state at three viewports; prefer ' +
      'ratios and directions, which are viewport-stable, over absolute values, which are not (measured ' +
      'x5.29 vs x1.05 here).',
    probe_type: 'vision_model',
    probe_logic: 'Extract every number quoted in text_en and assert each is inside the measured display band of the instrument that carries it.',
    status: 'FIXED', concepts_affected: [C], fixed_in_files: [], row_type: 'incident',
  },
  {
    bug_class: 'state_label_field_stale_after_renumbering_states',
    title: 'Renumbering 8 states left every label field behind, so all eight state chips drew a number one lower than their own id',
    severity: 'MAJOR', owner_cluster: 'alex:json_author', subject: 'chemistry',
    root_cause:
      'VERIFIED + FIXED 2026-07-30. Inserting a new opening state shifted STATE_1..8 to STATE_2..9 by ' +
      'remapping the config keys, but each state\'s own "label" value was untouched — so STATE_6 drew a ' +
      'chip reading STATE_5, and so on for all eight. The JSON stayed valid, tsc passed, ' +
      'validate:chemistry passed 9/9 and THE EYE passed 39/39; the label is free text nothing checks ' +
      'against its key. Found by reading a frame.',
    prevention_rule:
      'When renumbering states, remap every self-referential field, not just the keys: label, tts ' +
      'sentence ids, aha_moment.state_id, entry_state_map, drill-down and deep-dive references. Cheap ' +
      'gate: assert state.label === its key.',
    probe_type: 'js_eval',
    probe_logic: 'For every particle_field/field_3d state, assert config.states[k].label === k.',
    status: 'FIXED', concepts_affected: [C], fixed_in_files: [], row_type: 'incident',
  },
  {
    bug_class: 'symbol_printed_on_canvas_before_the_lesson_defines_it',
    title: 'The counter printed "clear Ea" and a percentage derived from it in STATE_1, one full state before the words "activation energy" appeared anywhere',
    severity: 'MAJOR', owner_cluster: 'alex:architect', subject: 'chemistry',
    root_cause:
      'VERIFIED + FIXED 2026-07-30, found by the FOUNDER asking "what is activation energy? did you ' +
      'define anything in the simulation?". The collision counter chip prints "N/s clear Ea (X%)" ' +
      'whenever an activation energy is set, so STATE_1 showed the symbol and a number derived from it ' +
      'while the definition lived in STATE_2 — and there it was a single subordinate clause. Rule 25 ' +
      '(no untaught term) broken on the opening state of the concept NAMED after that term. Every gate ' +
      'passed: the term-ordering check does not exist. Fixed by a new opening state that motivates the ' +
      'barrier (old bonds break before new ones form), names Ea, and shows it on an energy hill, with ' +
      'no counter and no histogram until it has been defined.',
    prevention_rule:
      'Build a term-introduction ledger at design time: for every symbol or word that appears on canvas ' +
      'or in narration, the state that DEFINES it must precede every state that uses it. An instrument ' +
      'that prints a symbol automatically counts as using it.',
    probe_type: 'js_eval',
    probe_logic:
      'Extract terms/symbols from captions, formula overlays, narration and instrument templates per ' +
      'state; fail if first USE precedes first DEFINITION.',
    status: 'FIXED', concepts_affected: [C], fixed_in_files: [], row_type: 'incident',
  },
  {
    bug_class: 'concept_taught_its_own_quantity_without_the_canonical_picture',
    title: 'A concept named "activation energy" showed Ea only as a threshold on a speed axis and a percentage on a chip — never the energy hill students are examined on',
    severity: 'MAJOR', owner_cluster: 'alex:architect', subject: 'chemistry',
    root_cause:
      'VERIFIED + FIXED 2026-07-30, founder-found. The build taught the collision statistics correctly ' +
      'and completely, and never drew the reaction profile — the representation every textbook, board ' +
      'and exam uses for this quantity. A student could watch all eight states, learn the statistics, ' +
      'and not connect them to the diagram they are assessed on. The skeleton had explicitly declared ' +
      'the profile an omission deferred to P2 #9, which is how it passed every gate and both review ' +
      'agents: a declared omission is invisible to a correctness check. Fixed by building ' +
      'show_reaction_profile on gas_box, derived from the same barrier and bond energy the engine uses.',
    prevention_rule:
      'For any concept named after a physical quantity, ask at DESIGN time which representation the ' +
      'student will be assessed in, and require the sim to show it or route the concept elsewhere. A ' +
      'declared omission is a decision, not an exemption — re-examine it when the omitted thing IS the ' +
      'title.',
    probe_type: 'manual',
    probe_logic: 'Founder/teacher walk: "point at the thing this concept is named after." If nothing on screen answers, the concept is incomplete.',
    status: 'FIXED', concepts_affected: [C], fixed_in_files: [R], row_type: 'incident',
  },

  // ─────────────────── the gates this session added ──────────────────────────
  {
    bug_class: 'probe_duplicate_json_keys_in_concept_files',
    title: 'PROBE: validate:chemistry scans raw text for duplicate JSON keys, which JSON.parse resolves last-wins and reports to nobody',
    severity: 'MODERATE', owner_cluster: 'peter_parker:visual_validator', subject: 'chemistry',
    root_cause:
      'Requested twice on the open-items list and built 2026-07-29. Recorded cost ' +
      '(atomic_orbitals_s_p_d): a fix authored spin_rate fifteen lines above an existing spin_rate: 0, ' +
      'so the edit was silently discarded while tsc, validate:chemistry and THE EYE all passed 39/39. ' +
      'The scanner reads SOURCE TEXT because by the time any parsed-object gate runs, the earlier value ' +
      'is already gone. Negative-controlled before use.',
    prevention_rule: 'Verify an authored value ARRIVED; do not assume the edit was the delivery.',
    probe_type: 'js_eval',
    probe_logic: 'npm run validate:chemistry — duplicateKeyErrors() reports the enclosing object and both line numbers.',
    status: 'FIXED', concepts_affected: [], fixed_in_files: [V], row_type: 'probe_definition',
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
