/**
 * BACKFILL: scar rows for the le_chateliers_principle session (P1 #1, 2026-07-29).
 *   npx tsx --env-file=.env.local src/scripts/_seed_engine_bug_queue_le_chatelier_backfill.ts
 *
 * That session shipped P1 #1 and recorded its scars in PROGRESS_CHEMISTRY.md but
 * filed almost none of them, on the stated grounds that "alex:chemistry_author is
 * rejected by the queue's own CHECK constraint". THAT WAS WRONG — three rows
 * already carried that owner — so a whole session's worth of hard-won defect
 * classes sat in prose where no Gate 8 pre-flight would ever read them. Audited
 * 2026-07-30: le_chateliers_principle had exactly ONE row against it, and that
 * one was filed the following session.
 *
 * Rows are written from the session's own measurements. Where a class already
 * exists under another name it is NOT re-filed — the backtick class is already
 * double-filed in this table under two names, which is the failure this list
 * exists to avoid.
 */
import '@/lib/loadEnvLocal';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const S = 'session_2026-07-29_le_chateliers_principle_backfill_2026-07-30';
const R = 'src/lib/renderers/particle_field_renderer.ts';
const LC = 'le_chateliers_principle';
const DE = 'dynamic_equilibrium';
const KPT = 'kinetic_particle_theory';

const rows = [
  // ─────────────────── ⭐ the one that made a gate lie ───────────────────────
  {
    bug_class: 'eye_reads_the_hand_seeded_cache_not_the_current_source',
    title: '⭐ THE EYE reads only the simulation_cache row, which for chemistry is seeded BY HAND — a post-fix re-walk returned 35/35 green while rendering entirely pre-fix content',
    severity: 'CRITICAL', owner_cluster: 'peter_parker:visual_validator', subject: 'chemistry',
    root_cause:
      'VERIFIED 2026-07-29 (le_chateliers_principle). visual_eyes.ts -> loadCachedSim() reads ONLY the ' +
      'simulation_cache row — never the concept JSON, never the renderer — and chemistry concepts do ' +
      'not run through the live generation pipeline, so that row is seeded by hand and never ' +
      'auto-refreshes. A re-walk taken AFTER four defects were fixed returned 35 checks / 35 passed ' +
      'while rendering the pre-fix sim: all four defects still present in frames, and every visual ' +
      'finding in that run a false negative. Caught only because eye_walker cross-checked frames ' +
      'against live source. Exact sibling of gas_box_freeze_resim_uses_wrong_stepper: a green ' +
      'deterministic gate proves frames are REPRODUCIBLE, not correct. Still UNENFORCED as of ' +
      '2026-07-30 — the collision_theory session followed the practice by hand (re-seed before every ' +
      'walk, and diff the seeded HTML for the authored fields) and it worked, but nothing makes it fail ' +
      'loudly if skipped.',
    prevention_rule:
      'Run _seed_chemistry_cache.ts <id> after ANY concept-JSON or renderer edit and BEFORE visual:eyes ' +
      'or eye_walker. Durable fix available and not yet built: have loadCachedSim re-assemble the sim ' +
      'from source and FAIL when the cached sim_html differs, so a stale row can never be walked ' +
      'silently. Proposed for docs/AUTHORING_PIPELINE.md §③ — founder ruling still pending.',
    probe_type: 'js_eval',
    probe_logic:
      'Before capture, assemble the sim from the concept JSON and compare against the cached sim_html; ' +
      'abort the run on any difference rather than reporting on stale pixels.',
    status: 'OPEN', concepts_affected: [LC, DE, KPT], fixed_in_files: [], row_type: 'incident',
  },

  // ─────────────────── engine defects the session fixed ──────────────────────
  {
    bug_class: 'gas_thermometer_hardcoded_x_offset_ignores_the_chip_accumulator',
    title: 'drawGasThermometer hardcoded its x position while every other chip accumulates, so the fleet\'s first thermometer-without-pressure state struck "T = 500 K" through the A/B counts — on the PRIMARY aha',
    severity: 'MAJOR', owner_cluster: 'peter_parker:renderer_primitives', subject: 'chemistry',
    root_cause:
      'VERIFIED + FIXED 2026-07-29. Every instrument in the gas_box HUD row computes its x by ' +
      'accumulating the widths of the chips actually lit (via pfWgVis), except drawGasThermometer, which ' +
      'hardcoded gasBoxL() + 142 — correct only when a pressure gauge happens to sit to its left. ' +
      'STATE_4 of le_chateliers_principle is the fleet\'s first state to show a thermometer WITHOUT a ' +
      'pressure gauge, so the reading overlapped the A/B/AB counts for the whole state, burying its own ' +
      'cause instrument on the concept\'s most important beat.',
    prevention_rule:
      'Every chip in a shared instrument row derives its position from the accumulator, never from a ' +
      'literal offset. A hardcoded position encodes one flag combination and fails silently on the ' +
      'first state with a different one — so probe each instrument with the others OFF.',
    probe_type: 'vision_model', visual_category: 'H',
    probe_logic: 'Render each instrument alone and in every pairwise combination; assert no two chip bounding boxes intersect.',
    status: 'FIXED', concepts_affected: [LC], fixed_in_files: [R], row_type: 'incident',
  },
  {
    bug_class: 'gas_piston_default_stroke_outruns_thermal_speed_and_cooks_the_gas',
    title: 'The default piston ease drove the wall ~12x faster than the particles move, spiking measured T to 7173-9594 K on a state authored at 300 K and making the reverse reaction appear to lead for ~4 s',
    severity: 'CRITICAL', owner_cluster: 'peter_parker:renderer_primitives', subject: 'chemistry',
    root_cause:
      'VERIFIED + FIXED 2026-07-29. A wall that outruns its gas does enormous work on it. Measured peak ' +
      'gasMeasuredT() of 7173-9594 K on a 300 K state, with the product count crashing 31 -> 7 first — ' +
      'so a state narrating "squeeze it and the balance shifts toward product" showed the REVERSE rate ' +
      'leading for seconds. Fixed by piston_ramp_ms (opt-in), which holds the stroke slow enough to stay ' +
      'near the thermostat setpoint: 336 K over 6 s. The DEFAULT stroke is deliberately left unchanged ' +
      'so kinetic_particle_theory keeps its approved baselines, which means the trap is still armed for ' +
      'any new state that omits the field.',
    prevention_rule:
      'Any compression beat authors piston_ramp_ms (~6000). A state that changes volume and narrates an ' +
      'isothermal consequence must have its peak measured temperature checked, not assumed from ' +
      'adiabatic:false — the thermostat lags a fast wall.',
    probe_type: 'js_eval',
    probe_logic: 'For any state with piston_from, assert peak gasMeasuredT() stays within ~15% of the setpoint across the stroke.',
    status: 'FIXED', concepts_affected: [LC], fixed_in_files: [R], row_type: 'incident',
  },
  {
    bug_class: 'gas_dimer_bond_painted_over_by_its_own_tangent_discs',
    title: '⭐ A bonded pair did not look bonded — the HUD printed a purple "AB 31" and the graph drew a purple curve while nothing on canvas was purple',
    severity: 'CRITICAL', owner_cluster: 'peter_parker:renderer_primitives', subject: 'chemistry',
    root_cause:
      'VERIFIED + FIXED 2026-07-29 (commit 20cb20a). drawGasDimer stroked the bond in the product colour ' +
      'and THEN filled the two discs — but the bond length IS rA + rB, so the discs are tangent and the ' +
      'line is entirely covered, leaving ~2 px of product colour. AB is the species every state of an ' +
      'equilibrium lesson tracks, so the whole lesson had to be read off numbers instead of the picture. ' +
      'Fixed by draw order (rim both discs in the product colour). ALSO fixed dynamic_equilibrium, whose ' +
      'STATE_2 opens with 45 previously-uncountable pairs — 14 H2 baseline failures, pixel-diff only, ' +
      're-approved after founder view, now 44/44.',
    prevention_rule:
      'When a composite object\'s identity is carried by a colour, verify that colour is VISIBLE in a ' +
      'rendered frame at the object\'s real geometry — not merely present in the draw code. If a HUD ' +
      'names a species, that species must be findable on canvas by eye.',
    probe_type: 'vision_model', visual_category: 'H',
    probe_logic: 'Sample pixels at dimer positions and assert the product colour occupies a countable area, not a hairline.',
    status: 'FIXED', concepts_affected: [LC, DE], fixed_in_files: [R], row_type: 'incident',
  },
  {
    bug_class: 'gas_displayed_rates_and_pressure_are_viewport_dependent',
    title: 'gasRxAreaNorm normalises the equilibrium COMPOSITION but not the readouts, so displayed rates span 4.6x and pressure 5.9x across viewports',
    severity: 'MAJOR', owner_cluster: 'peter_parker:renderer_primitives', subject: 'chemistry',
    root_cause:
      'MEASURED 2026-07-29, NOT FIXED — engine limitation, deliberately worked around by authoring. ' +
      'gasRxAreaNorm makes the equilibrium POSITION viewport-independent (which is what stops a lesson ' +
      'from depending on the teacher\'s window size), but the displayed rate and pressure numbers are ' +
      'not normalised: measured 4.6x on rates and 5.9x on pressure from 900x560 to 1600x900. Confirmed ' +
      'again 2026-07-30 on collision_theory: collisions/s spanned 5.29x across four viewports while the ' +
      'cleared PERCENTAGE spanned only 1.05x. Normalising displayed pressure would break the P*A/N*T ' +
      'gas-law readout and move every shipped baseline, so the fix is authoring discipline, not code.',
    prevention_rule:
      'No narration on gas_box may speak an absolute rate or pressure VALUE. Composition counts, ' +
      'ratios, percentages and directions are viewport-stable and are the only magnitudes safe to ' +
      'speak. Verify any quoted number at three viewports before shipping.',
    probe_type: 'js_eval',
    probe_logic: 'Measure each displayed readout at 900x560 / 1280x720 / 1600x900; flag any narrated value whose spread exceeds ~10%.',
    status: 'OPEN', concepts_affected: [LC, DE, KPT], fixed_in_files: [], row_type: 'incident',
  },

  // ─────────────────── cue timing ────────────────────────────────────────────
  {
    bug_class: 'cue_fired_on_at_ms_lands_before_the_sentence_that_names_it',
    title: 'A disturbance bound only to at_ms fired ~5 s before the narration mentioned it, so the class saw the effect before hearing the cause',
    severity: 'MAJOR', owner_cluster: 'alex:chemistry_author', subject: 'chemistry',
    root_cause:
      'VERIFIED + FIXED 2026-07-29. A cue given only an at_ms fires on the state clock regardless of ' +
      'where the player has reached in the narration timeline, and the player derives that timeline from ' +
      'the sentences — so the gap drifts with narration length. Measured ~5 s of desync: the reagent ' +
      'arrived, the rates jumped and the graph stepped while the narration was still describing the ' +
      'settled box. Fixed by binding each cue to its sentence via scenario_cue, which makes the trigger ' +
      'the sentence start rather than a fixed offset. NOTE the OPPOSITE failure exists too and is filed ' +
      'separately (gas_t_from_and_piston_from_ramps_ignored_their_narration_cue): T_from and piston_from ' +
      'ramps ignore cues entirely and start at state entry.',
    prevention_rule:
      'Bind every cue to the narration sentence that names it via scenario_cue; never rely on at_ms ' +
      'alone. Then audit that some mechanism actually CONSUMES the cue — a scenario_cue on a cue no ' +
      'mechanism reads is dead config that reads as choreography.',
    probe_type: 'js_eval',
    probe_logic: 'For every cue, assert it is referenced by scenario_cue on a sentence AND consumed by a state mechanism.',
    status: 'FIXED', concepts_affected: [LC], fixed_in_files: [], row_type: 'incident',
  },

  // ─────────────────── narration vs instrument ───────────────────────────────
  {
    bug_class: 'narration_speaks_a_between_run_comparison_as_an_in_state_observation',
    title: 'STATE_7 said "the amounts move by about half" — a comparison between two separate RUNS, spoken as something visible inside one state',
    severity: 'MAJOR', owner_cluster: 'alex:chemistry_author', subject: 'chemistry',
    root_cause:
      'VERIFIED + FIXED 2026-07-29. The claim was measured by comparing two independent runs at ' +
      'different starting compositions, then narrated as though a viewer could see it happen in the ' +
      'state in front of them. Nothing on screen ever showed both amounts, so the sentence described a ' +
      'fact of the experiment design rather than of the frame. Redesigned rather than reworded: the ' +
      'state now makes a BEFORE/AFTER observation inside its own timeline.',
    prevention_rule:
      'Every narrated claim must be checkable against what is on screen DURING that state. If a claim ' +
      'needs two runs, two compositions or two viewports to be true, it belongs in a state redesign or ' +
      'a deep-dive, never in a sentence.',
    probe_type: 'manual',
    probe_logic: 'For each sentence, name the on-screen element that verifies it within the state; a claim with no such element fails.',
    status: 'FIXED', concepts_affected: [LC], fixed_in_files: [], row_type: 'incident',
  },
  {
    bug_class: 'narration_claims_a_net_average_the_visible_transient_contradicts',
    title: 'STATE_3 said "forward pulls ahead of reverse" — true as a net average over 10/10 seeds, while the two bars visibly CROSS mid-ramp',
    severity: 'MAJOR', owner_cluster: 'alex:chemistry_author', subject: 'chemistry',
    root_cause:
      'VERIFIED + FIXED 2026-07-29. Measured net forward-minus-reverse was +0.75/s and positive in all ' +
      'ten seeds, so the sentence was correct about the average — but the instrument shows the ' +
      'INSTANTANEOUS pair of rates, and during the ramp they cross, so a viewer watching the bars sees ' +
      'the opposite of what is being said, repeatedly. Re-pointed at the pair count, which moves ' +
      'monotonically.',
    prevention_rule:
      'A claim about an average must be narrated against an instrument that DISPLAYS the average, not ' +
      'one displaying the instantaneous value. If only the instantaneous value is on screen, narrate a ' +
      'monotone quantity instead.',
    probe_type: 'js_eval',
    probe_logic: 'For a narrated inequality between two displayed series, assert the inequality holds at every sampled frame of the window it describes.',
    status: 'FIXED', concepts_affected: [LC], fixed_in_files: [], row_type: 'incident',
  },
  {
    bug_class: 'instrument_noise_needs_density_not_a_longer_average',
    title: 'The K chip swung 33-50% and inverted the state\'s contrast in 10/10 seeds; two averaging windows were built and MEASURED FAILING before the root cause (particle count) was addressed',
    severity: 'MAJOR', owner_cluster: 'alex:chemistry_author', subject: 'chemistry',
    root_cause:
      'VERIFIED + FIXED 2026-07-29. K\'s relative fluctuation scales as 1/sqrt(n_AB), and at the ' +
      'lesson\'s normal density n_AB is only ~30 — so the RATIO moved more than the amounts did and the ' +
      'state\'s whole contrast ran backwards on screen. Two averaging windows (5 s, then 10 s) were ' +
      'implemented and measured still failing: the noise is set by physics, not by the instrument. Fixed ' +
      'by running that one state at ~516 particles (n_AB ~204): |dK| 8-10% against |dA| 34-42%, 0 of 8 ' +
      'seeds inverting, holding at three viewports. Cost 2.18 ms/tick against a 16.7 ms budget because ' +
      'the collision sweep is spatially gridded. A DECLARED Rule 32d exception, taken in the one state ' +
      'both curriculum presets can hide. Recurred 2026-07-30 on collision_theory STATE_7, where the ' +
      'Arrhenius slope missed the law by 21% at 180 particles and 2.8% at 720 — same cause, same fix.',
    prevention_rule:
      'When a displayed statistic is too noisy to carry a claim, identify whether the noise is ' +
      'INSTRUMENTAL (fix the window) or PHYSICAL (1/sqrt(N) — fix the density). Measure a candidate ' +
      'window before building it. A density exception is legitimate but must be declared in the state ' +
      'roles and the authoring notes, not hidden.',
    probe_type: 'js_eval',
    probe_logic: 'Seed-sweep the displayed statistic; if its spread exceeds the effect the state claims, fail regardless of the averaging window.',
    status: 'FIXED', concepts_affected: [LC], fixed_in_files: [], row_type: 'incident',
  },

  // ─────────────────── the teaching pass ─────────────────────────────────────
  {
    bug_class: 'lesson_never_states_the_principle_it_is_named_after',
    title: 'Eight states taught every disturbance correctly and no sentence anywhere gave the law or its name',
    severity: 'MAJOR', owner_cluster: 'alex:architect', subject: 'chemistry',
    root_cause:
      'VERIFIED + FIXED 2026-07-29, found by the founder asking "walk the states, what is missing?". ' +
      'Every gate and BOTH review agents passed the concept: each state was individually correct, ' +
      'legible and well-instrumented, and the sum of them never said what the principle IS. Fixed by ' +
      'closing S8 with the statement, landing on the partial-compensation aha. Direct sibling of ' +
      'concept_taught_its_own_quantity_without_the_canonical_picture (collision_theory, 2026-07-30), ' +
      'where the concept named after activation energy never drew an energy hill — the same blind spot ' +
      'in a different representation.',
    prevention_rule:
      'For any concept named after a law, principle or quantity, require one state to STATE it and one ' +
      'to SHOW it in the representation the student is assessed in. Per-state correctness checks cannot ' +
      'see a gap that lives between the states.',
    probe_type: 'manual',
    probe_logic: 'Walk the states end to end and ask: does any sentence give the law, and does any frame show its canonical representation?',
    status: 'FIXED', concepts_affected: [LC], fixed_in_files: [], row_type: 'incident',
  },
  {
    bug_class: 'real_world_anchor_promises_a_lever_the_sim_does_not_have',
    title: 'The anchor described engineers "steadily drawing product away" while the sim\'s reagent tap is reactant-only by design',
    severity: 'MAJOR', owner_cluster: 'alex:chemistry_author', subject: 'chemistry',
    root_cause:
      'VERIFIED + FIXED 2026-07-29. The anchor was written from the real industrial process rather than ' +
      'from the sim\'s actual control surface: reaction.inject is A-only because an earlier state needs ' +
      'removal to target A. So the hook set an expectation the box could never demonstrate. Rewritten ' +
      'onto the two levers the states DO show — pressure, because the product side has fewer molecules, ' +
      'and temperature, because the forward reaction is exothermic — which is also better chemistry.',
    prevention_rule:
      'Write the anchor against the sim\'s control surface, not against the textbook process. Every ' +
      'mechanism an anchor names must be one a teacher can then point at on screen.',
    probe_type: 'manual',
    probe_logic: 'For each mechanism named in the anchor, identify the state and control that demonstrates it; an unmatched mechanism fails.',
    status: 'FIXED', concepts_affected: [LC], fixed_in_files: [], row_type: 'incident',
  },
  {
    bug_class: 'the_most_likely_followup_question_was_undemonstrable_at_the_authored_range',
    title: 'Cooling — the obvious question after the "heating unmakes product" aha — was inside the noise band at the authored slider floor',
    severity: 'MODERATE', owner_cluster: 'alex:chemistry_author', subject: 'chemistry',
    root_cause:
      'VERIFIED + FIXED 2026-07-29. Measured at the original 250 K floor, cooling moved AB 31 -> ~35 — ' +
      'inside the fluctuation band, i.e. a teacher asking the most natural follow-up would have shown ' +
      'the class nothing. At 200 K it is 31 -> ~45 within 10 s with the box still visibly alive ' +
      '(fwd 3.5/s); at 150 K it reads dead (1.1/s). Floor set to 200 K by measurement.',
    prevention_rule:
      'Choose slider ranges by asking what a teacher will try FIRST after the aha, then measure that the ' +
      'range makes it visible. A limit inherited from a default is not a decision.',
    probe_type: 'js_eval',
    probe_logic: 'At each slider extreme, assert the effect the teacher would be exploring exceeds the measured fluctuation band.',
    status: 'FIXED', concepts_affected: [LC], fixed_in_files: [], row_type: 'incident',
  },

  // ─────────────────── the meta-finding, as a standing directive ─────────────
  {
    bug_class: 'directive_no_gate_asks_whether_a_teacher_could_use_it',
    title: 'DIRECTIVE: every gate and review agent asks whether the sim is CORRECT; none asks whether a teacher could USE it — that gate is a person asking "what is missing?"',
    severity: 'MAJOR', owner_cluster: 'ambiguous', subject: 'subject_neutral',
    root_cause:
      'Named 2026-07-29 on le_chateliers_principle and CONFIRMED 2026-07-30 on ' +
      'collision_theory_activation_energy. On the first concept, a founder walk found four gaps that ' +
      'tsc, three validators, THE EYE (35/35), quality_auditor (PASS on its third pass) and eye_walker ' +
      '(CLEAN) had all passed: the principle was never stated, the likeliest follow-up question was ' +
      'undemonstrable, the product species was invisible, and the anchor promised a lever the sim did ' +
      'not have. On the second, two founder questions found that the symbol Ea was printed a full state ' +
      'before it was defined, and that the concept named after activation energy never drew the energy ' +
      'hill — the latter having passed BOTH review agents precisely because the skeleton had DECLARED it ' +
      'an omission, and a declared omission is invisible to a correctness check.',
    prevention_rule:
      'Before declaring a concept done, walk it as a teacher and answer three questions in writing: ' +
      '(1) does anything on screen state the law or quantity the concept is named after, and show it in ' +
      'the representation the student is assessed in? (2) what is the first thing a teacher will try ' +
      'after the aha, and is it demonstrable in the authored range? (3) for every term and symbol on ' +
      'canvas, does the state that DEFINES it precede every state that uses it? Re-examine every ' +
      'declared omission against the concept TITLE — a declared omission is a decision, not an ' +
      'exemption.',
    probe_type: 'manual',
    probe_logic: 'Founder/teacher walk with the three questions above answered in writing before sign-off.',
    status: 'OPEN', concepts_affected: [LC, 'collision_theory_activation_energy'],
    fixed_in_files: [], row_type: 'directive',
  },
];

(async () => {
  for (const r of rows) {
    const res = await supabaseAdmin
      .from('engine_bug_queue')
      .upsert({ ...r, discovered_in_session: S }, { onConflict: 'bug_class' });
    console.log(res.error ? `  x  ${r.bug_class}: ${res.error.message}` : `  ok ${r.severity.padEnd(8)} ${r.status.padEnd(5)} ${r.bug_class}`);
  }

  // The exactness-on-a-fluctuating-quantity case (STATE_5, "the counts sit
  // exactly where the lesson left them" against frames legitimately reading
  // 26-38) is the SAME class as the row filed for collision_theory. Extend that
  // row rather than filing a near-duplicate — this table already carries the
  // backtick class twice under two names, which under-counts its own recurrences.
  const { data: existing } = await supabaseAdmin
    .from('engine_bug_queue')
    .select('concepts_affected,root_cause')
    .eq('bug_class', 'narration_quotes_a_point_value_of_a_noisy_instrument')
    .single();
  if (existing) {
    const concepts = [...new Set([...(existing.concepts_affected ?? []), LC])];
    const note =
      ' EARLIER OCCURRENCE, backfilled 2026-07-30: le_chateliers_principle STATE_5 narrated "the counts ' +
      'sit exactly where the lesson left them" while single frames legitimately read 26-38 — so an ' +
      'unlucky frame CONFIRMED the very misconception the state existed to refute. Fixed there by ' +
      'narrating a band instead of a point.';
    const { error } = await supabaseAdmin
      .from('engine_bug_queue')
      .update({ concepts_affected: concepts, root_cause: (existing.root_cause ?? '') + note })
      .eq('bug_class', 'narration_quotes_a_point_value_of_a_noisy_instrument');
    console.log(error ? `  x  extend noisy-instrument row: ${error.message}`
      : `  ok extended narration_quotes_a_point_value_of_a_noisy_instrument -> ${concepts.join(', ')}`);
  }
})();
