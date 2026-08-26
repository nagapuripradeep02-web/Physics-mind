/**
 * Apply the Ch.6 concept #6 + #7 Checkpoint-A scar candidates to engine_bug_queue.
 *
 * Source reports (all persisted by the dispatching session; founder-proxy is report-only):
 *   docs/loop_runs/ch6/potential_energy_definition/founder_proxy_A.md          (cycle 0, 5 rows)
 *   docs/loop_runs/ch6/potential_energy_definition/founder_proxy_A_cycle2.md   (cycle 2, 3 rows)
 *   docs/loop_runs/ch6/gravitational_potential_energy/founder_proxy_A.md       (cycle 0, 5 rows)
 *   docs/loop_runs/ch6/gravitational_potential_energy/founder_proxy_A_cycle2.md(cycle 2, 2 rows)
 *
 * WHY THIS EXISTS: the ch6 record already has one session whose scar rows lived only in
 * agent report text and were nearly lost (PROGRESS.md, concept #2). The cycle-2 reviewer
 * explicitly noted the cycle-0 rows were still unfiled. Filing is part of closing the gate.
 *
 * Upsert key is bug_class — a recurrence UPDATES its row, never a duplicate INSERT.
 * Two rows are deliberate upsert-extensions of a cycle-0 row rather than new classes:
 *   - sandbox_ledger_envelope_… : numbers refreshed for the cycle-1 mu cap (0.6 -> 0.5).
 *   - paired_concept_pins_a_reference_… : extended one layer deeper after cycle 2.
 *
 * Run: npx tsx --env-file=.env.local src/scripts/_apply_ch6_concept67_checkpointA_scars.ts
 */
import '@/lib/loadEnvLocal';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

type Row = {
    bug_class: string;
    title: string;
    severity: 'CRITICAL' | 'MAJOR' | 'MODERATE';
    owner_cluster: string;
    root_cause: string;
    prevention_rule: string;
    probe_type: string;
    probe_logic: string;
    status: 'OPEN' | 'FIXED';
    concepts_affected: string[];
    fixed_in_files: string[];
    discovered_in_session: string;
    row_type: 'incident' | 'directive' | 'probe_definition';
};

const C6A0 = 'ch6-concept-6 checkpoint A cycle 0 2026-08-09';
const C6A2 = 'ch6-concept-6 checkpoint A cycle 2 2026-08-09';
const C7A0 = 'ch6 concept-7 founder_proxy Checkpoint A cycle 0 (2026-08-09)';
const C7A2 = 'ch6 concept-7 founder_proxy Checkpoint A cycle 2 (2026-08-09)';

const PED = 'potential_energy_definition';
const GPE = 'gravitational_potential_energy';

const rows: Row[] = [
    // ── concept #6, Checkpoint A cycle 0 ───────────────────────────────────
    {
        bug_class: 'skeleton_pins_the_energy_reference_to_make_its_aha_exact_and_spends_the_next_concepts_lesson',
        title: "A skeleton pins h_ref_m at the home pose so U = -W holds pointwise, and the exact configuration is the NEXT concept's primary aha",
        severity: 'CRITICAL', owner_cluster: 'alex:architect',
        root_cause: "potential_energy_definition pinned energy_layer.h_ref_m = -1.8 (the home-pose height) so the U bar and the gravity work bar read the same number at every frame. gravitational_potential_energy (#7, architected in parallel) authors that same moved-zero configuration as its PRIMARY aha, and plants the ground-reference habit its S3 exists to break. #6 builds the opposite habit first, unremarked, three states running, while being forbidden from naming the reference as a choice.",
        prevention_rule: 'When a design pins a reference/gauge/zero to make a relation exact, the skeleton must state (a) what general statement the pinned form silently narrows, and (b) which downstream concept owns the un-narrowing - and cite that concept\'s skeleton if it exists. A pinned gauge is never a free simplification.',
        probe_type: 'manual',
        probe_logic: 'Grep the sibling skeletons in the same chapter run for the pinned field name (h_ref_m, reference, zero line). If a later concept authors the same value as an aha or a misconception_watch counter, the pin is spending that concept\'s lesson.',
        status: 'OPEN', concepts_affected: [PED, GPE],
        fixed_in_files: [], discovered_in_session: C6A0, row_type: 'incident',
    },
    {
        bug_class: 'state_removes_a_store_without_naming_the_destination_and_recreates_the_belief_the_prior_state_fixed',
        title: 'A scope-condition state shows a quantity with no store one click after the concept taught that energy is never destroyed',
        severity: 'CRITICAL', owner_cluster: 'alex:architect',
        root_cause: 'potential_energy_definition S1 fixes "negative work destroys energy" with "moved, not destroyed"; S2 then shows friction\'s bar with no partner and narrates "friction\'s joules have no store anywhere on screen". The only inference left is destruction. The skeleton\'s own vocabulary ban (no "heat") forbids the one clause that would name the destination, so the design forecloses its own correction.',
        prevention_rule: 'When a state shows a quantity LEAVING with no on-screen destination, and an earlier state in the same concept taught conservation-of-somekind, the destination must be NAMED in one clause even if its accounting belongs to a later concept. A boundary ban may withhold the accounting, never the destination.',
        probe_type: 'manual',
        probe_logic: 'For each misconception_watch one_line_fix in a concept, check whether a LATER state\'s visual_counter or narration implies the negated form. If state N teaches "X is not destroyed" and state N+1 shows X vanishing with no named destination, flag.',
        status: 'OPEN', concepts_affected: [PED],
        fixed_in_files: [], discovered_in_session: C6A0, row_type: 'incident',
    },
    {
        bug_class: 'explore_state_changes_an_authored_reference_the_guided_states_never_declared_as_changeable',
        title: 'The sandbox silently re-authors the reference the guided states taught from, producing an unexplainable jump at the click into explore',
        severity: 'MAJOR', owner_cluster: 'alex:architect',
        root_cause: 'potential_energy_definition authored h_ref_m -1.8 on S1-S3 and -3.05 on S4 (forced by the unsigned U stack and free drag over the full track). At the click into explore the dashed U = 0 line teleported 1.25 m and the U bar jumped 0 -> 49.0 J at the same block position, with no permitted explanation. The ring-cut check looked only for surviving states REFERENCING hidden content, not for a surviving state whose only acknowledgement lived in a cut state.',
        prevention_rule: 'Any authored field that defines what an instrument MEASURES FROM (h_ref_m, a zero line, an origin) is part of the home pose under Rule 32d: it must be identical in every state, or the change must be the state\'s declared one-new-thing with its own delta cue. The ring-cut check runs BOTH directions - also verify no surviving state depends on a cut state for its only explanation.',
        probe_type: 'js_eval',
        probe_logic: 'Read field_3d_config.states.*.newtons_laws_body.energy_layer.h_ref_m across all states of a concept. If more than one distinct value appears, assert that each change is named in that state\'s delta cue or caption; otherwise fail.',
        status: 'OPEN', concepts_affected: [PED],
        fixed_in_files: [], discovered_in_session: C6A0, row_type: 'incident',
    },
    {
        // cycle-2 upsert: numbers refreshed for the mu cap 0.6 -> 0.5 taken in cycle 1.
        bug_class: 'sandbox_ledger_envelope_bounded_over_the_wrap_span_while_the_state_advertises_dragging',
        title: 'A sandbox work-ledger envelope is sized over the wrap span, but nlbRunWorkAccum accumulates on teacher-drag displacement too',
        severity: 'MAJOR', owner_cluster: 'alex:architect',
        root_cause: 'nlbRunWorkAccum (field_3d_renderer.ts L50319-50340) accumulates dW on ds = b.s - b._s_pre for ANY motion, rejecting only teleports (|ds| > span*0.5). The sandbox wrap re-zeros the ledger; a DRAG does not. potential_energy_definition S4 sizes work_scale_J = 280 over the wrap span while naming "raise mu - friction\'s bar falls whichever way the block moves" as a discoverable. After the cycle-1 mu cap at 0.5 (below tan 30 = 0.577, so no corner can stick): f = 16.97 N and the friction bar clamps after 16.5 m of dragging - still inside one demonstration. Free-running is genuinely bounded (12 m max span, 203.7 J <= 252); only the drag case is exposed.',
        prevention_rule: 'A sandbox ledger envelope must be bounded over the affordance the state ADVERTISES, not over its free-running lap. If drag is exposed and the ledger accumulates on drag displacement, either bound it, drop the ledger, or file the row as ACCEPTED-with-exposure - never as AVOIDED. Free-running and teacher-drag are two dispositions, not one averaged word.',
        probe_type: 'manual',
        probe_logic: 'For a sandbox state authoring both trusted_drag_seizes and a monotone work accumulator (friction), compute f_max * (advertised drag path) and compare against work_scale_J. Flag if a plausible demo clamps the bar.',
        status: 'OPEN', concepts_affected: [PED],
        fixed_in_files: [], discovered_in_session: C6A2, row_type: 'incident',
    },
    {
        bug_class: 'checkpoint_dwell_badge_translates_the_shared_bar_panel_in_the_state_that_stamps_the_numbers',
        title: 'The dwell honesty badge and the energy panel share the top-left corner, so every dwell slides the whole bar panel ~37 px',
        severity: 'MODERATE', owner_cluster: 'peter_parker:field3d_surgeon',
        root_cause: '#nlb_slowmo is created at top:52px;left:12px (L46612) and #nlb_energy at left:12px;top:52px (L48677). nlbEnergyTopPx() (L48846-48857) re-tops the panel to badge.bottom + 8 whenever a dwell or slow window is open, so the bars translate down ~37 px for the dwell and back. The fit LADDER is not re-run, only top. No clipping measured at 720 or 551 px, but a state\'s frozen pin lands mid-dwell by the mandatory eye_capture_ms = T_P + D_P/2 rule, so the stamped state\'s bar geometry is offset from every other state\'s.',
        prevention_rule: 'A dwell/slow state\'s frozen frame is not pixel-comparable to its siblings\' for panel geometry. Either give the badge its own corner, or re-run nlbFitEnergyPanel when the badge toggles. Until then, skeletons authoring dwell_ms must disposition the panel shift and eye-walker must not read a panel offset as a layout regression.',
        probe_type: 'js_eval',
        probe_logic: 'With a dwell open, read getComputedStyle(document.getElementById("nlb_energy")).top and compare against the same state with the badge hidden; assert the delta is declared.',
        status: 'OPEN', concepts_affected: ['work_energy_theorem', PED],
        fixed_in_files: [], discovered_in_session: C6A0, row_type: 'incident',
    },

    // ── concept #6, Checkpoint A cycle 2 ───────────────────────────────────
    {
        bug_class: 'design_revision_moves_an_instruments_zero_and_leaves_the_verbs_describing_the_old_range',
        title: "A review-ordered reference change re-derives every number and leaves the narration verbs describing the instrument's OLD range",
        severity: 'MAJOR', owner_cluster: 'alex:architect',
        root_cause: 'potential_energy_definition cycle 1 moved energy_layer.h_ref_m from the home pose to the ramp foot, raising the U bar\'s floor from 0 to 49.0 J (17 percent of a 290 J track). Every numeric in the skeleton was correctly re-derived, but six places still said the U bar "empties" on the descent - including the (f-3) narration duty and, decisively, the (f-2) ALLOWED-VERB list, which licenses the word for the physics-author who writes the shipped string. The skeleton contradicted itself: S2\'s parallel sentence already said "U falls". The revision\'s own change log listed the arithmetic re-derivation and did not list a verb audit.',
        prevention_rule: 'A revision that changes what an instrument MEASURES FROM (a reference, a zero line, an origin, a scale floor) changes the instrument\'s visible RANGE, not just its numbers. The re-derivation must include a verb sweep over every reader-facing string describing that instrument\'s motion (empties, fills, zeroes, bottoms out, maxes out, returns to zero) and must re-audit any allowed-verb or banned-verb list that licenses them. Numbers and verbs are one artifact.',
        probe_type: 'manual',
        probe_logic: 'After any skeleton revision that changes a reference/zero/scale field, grep the skeleton for range verbs (empt, fill, zero, bottom, max out, drain) and check each against the revised min/max of the instrument in the arithmetic table. Also grep the allowed-verb list itself.',
        status: 'OPEN', concepts_affected: [PED],
        fixed_in_files: [], discovered_in_session: C6A2, row_type: 'incident',
    },
    {
        bug_class: 'checkpoint_flags_at_equal_spacing_make_the_between_flag_difference_equal_the_first_flag_reading',
        title: 'Two checkpoint flags spaced equally from the home pose make the A-to-B difference numerically identical to the stamp at A, so the subtraction the state teaches can be mis-read off one line',
        severity: 'MODERATE', owner_cluster: 'alex:architect',
        root_cause: 'potential_energy_definition S3 placed flags at home + 2.0 m and home + 4.0 m under a constant force (mg sin theta = 19.6 N/m). The latched record read "point A: U = 88.2 J, W gravity = -39.2 J" and "point B: U = 127.4 J, W gravity = -78.4 J". The state exists to show that only the DIFFERENCE mirrors, but delta-W(A to B) = -39.2 J is the same numeral as W(A) = -39.2 J printed on the line above, so a student can read the correct answer without ever subtracting. The degeneracy is a pure consequence of equal spacing under a constant force and is invisible to every gate: both stamps are exact, the measurement duty passes, and the arithmetic table is correct.',
        prevention_rule: 'When a state teaches a DIFFERENCE between two marked points under a constant force, the two intervals (home to A, A to B) must be UNEQUAL, so that no displayed stamp equals the difference the state is asking the student to compute. Check the degeneracy explicitly in the arithmetic table: assert delta-Q(A to B) is distinct at display precision from every other numeral rendered in the state.',
        probe_type: 'manual',
        probe_logic: 'For any state authoring two or more checkpoints with capture values, compute the pairwise differences of each captured quantity and compare them against the full set of rendered numerals in that state. Flag any difference that collides with a displayed stamp value at display precision.',
        status: 'OPEN', concepts_affected: [PED],
        fixed_in_files: [], discovered_in_session: C6A2, row_type: 'incident',
    },
    {
        bug_class: 'skeleton_defers_an_in_frame_visibility_question_that_camera_arithmetic_settles_at_design_time',
        title: 'A skeleton files "is this new overlay inside the camera frame" as a probe-at-first-EYE flag when the projection is computable from constants already in the skeleton',
        severity: 'MODERATE', owner_cluster: 'alex:architect',
        root_cause: 'potential_energy_definition cycle 1 flagged the foot-of-ramp U = 0 dashed line as an ASSUMPTION - probe-before-authoring, on the grounds that no frame had yet proven the line sits inside the guided block_on_incline camera frame. Every input was already in the skeleton or one grep away: marker_h_ref is added to the UN-rotated world group (field_3d_renderer.ts L49388) at y = h_ref_m * NLB_WORLD_PER_M (L49891), the camera is PerspectiveCamera(60, ...) (L3986) looking at the origin, and the shipped guided framing is [0, 1.87, 9.1]. founder-proxy computed NDC y = -0.270, comfortably in frame on both cameras and both aspect rungs, in one pass. Had it been off-frame the fix would have been a CAMERA change - a design decision - discovered at Checkpoint B on the state whose entire pixel anchor depends on it.',
        prevention_rule: 'A geometric visibility question (is element X inside the frame) is a DESIGN-TIME computation, not a probe-later flag, whenever the world position and the camera are both known: project the point through the documented fov/aspect and report the NDC. Defer to a probe only when the position depends on a runtime layout the skeleton cannot resolve. Note that a vertical-fov camera makes NDC y invariant across reflow rungs, so one computation settles every viewport.',
        probe_type: 'js_eval',
        probe_logic: 'Given camera_position C, target origin, fov 60 and the world point P, compute NDC = (dot(P-C, right)/(z*tan30*aspect), dot(P-C, camUp)/(z*tan30)) where z = dot(P-C, forward); assert both components are within [-1, 1] with margin. Run at design time from the skeleton, not from a frame.',
        status: 'OPEN', concepts_affected: [PED],
        fixed_in_files: [], discovered_in_session: C6A2, row_type: 'directive',
    },

    // ── concept #7, Checkpoint A cycle 0 ───────────────────────────────────
    {
        bug_class: 'skeleton_asserts_an_invariance_across_two_states_whose_comparison_numeral_is_rendered_in_neither',
        title: 'A concept built on "this number does not change" leaves the number to mental arithmetic in one state and to static text in the other',
        severity: 'CRITICAL', owner_cluster: 'alex:architect',
        root_cause: 'The invariance is a DIFFERENCE (delta-U, a path length, a stored value) while the instruments render only LEVELS. Each state passes its own DoD because each renders its own numbers; the claim lives only in the gap between two states, which no per-state check reads.',
        prevention_rule: 'When a state pair exists to show a quantity UNCHANGED, that quantity must be a rendered surface in BOTH states, so the click shows the other numbers move and this one hold. Author it on the formula surface (formula_base or formula_lines) or as a stamp. A number the narration computes is not a rendered number.',
        probe_type: 'js_eval',
        probe_logic: 'For every declared contrast pair: collect all rendered numerals (formula surface lines + checkpoint stamps + marker captions) in each state. Assert the quantity the pair claims is invariant appears as a rendered numeral in BOTH states. Fail if it appears in one or neither.',
        status: 'OPEN', concepts_affected: [GPE],
        fixed_in_files: [], discovered_in_session: C7A0, row_type: 'incident',
    },
    {
        bug_class: 'cross_state_numeral_collision_reassigns_a_value_the_concept_established_as_a_teaching_invariant',
        title: 'A later state stamps the same joule numeral at a different mass and height, after two earlier states deliberately used it to mean one configuration',
        severity: 'MAJOR', owner_cluster: 'alex:architect',
        root_cause: 'The existing freshness row checks (mass, speed, energy) TRIPLES. A concept whose lesson IS "equal numbers mean equal configurations" is broken by an equal NUMERAL at an unequal configuration, which the triple check passes.',
        prevention_rule: 'Every skeleton runs a cross-state numeral cross-tab before handoff: list every rendered numeral per state, and for any numeral appearing in more than one state, state explicitly whether the repeat is the teaching (same configuration) or a collision (different configuration). A collision is re-authored, not annotated. Live-bar transients are out of scope; the rule governs latched and authored numerals.',
        probe_type: 'js_eval',
        probe_logic: 'Harvest every rendered numeral per state. For each numeral appearing in two or more states, compare the authored (mass, height, reference) tuple behind it. Fail on any numeral shared by two states whose tuples differ.',
        status: 'OPEN', concepts_affected: [GPE],
        fixed_in_files: [], discovered_in_session: C7A0, row_type: 'incident',
    },
    {
        bug_class: 'explore_state_shrunk_to_one_control_by_an_engine_limit_that_blocks_only_one_other_control',
        title: "A sandbox dropped to a single slider and a motionless body, attributed to a rendering limit that in fact forbids only body drag while a live engine-supported slider for the concept's own second variable went unauthored",
        severity: 'MAJOR', owner_cluster: 'alex:architect',
        root_cause: 'A real engine limit was read correctly and then over-applied: it removed drag, and the design absorbed the rest of the loss silently instead of enumerating the remaining authorable controls against the closed token list.',
        prevention_rule: "When an engine limit removes a control from an explore state, the skeleton enumerates EVERY remaining member of the scenario's control token enum and states, per token, why it is or is not authored. Rule 31 requires the explore state to expose ALL relevant controls; a token that drives a term of the taught formula and is refused needs its own named reason, not the limit's coattails.",
        probe_type: 'js_eval',
        probe_logic: "For the explore state: read the scenario's controls_visible token enum from the renderer config type, and the taught formula's variables from the concept JSON. Assert every formula variable with a corresponding live token is either exposed or carries an authored refusal reason. Separately assert at least one rendered apparatus element (not an instrument bar) changes geometry under each exposed control.",
        status: 'OPEN', concepts_affected: [GPE],
        fixed_in_files: [], discovered_in_session: C7A0, row_type: 'incident',
    },
    {
        // cycle-2 upsert-extension: same class, one layer deeper. NOT a sibling row.
        bug_class: 'paired_concept_pins_a_reference_the_sibling_later_reveals_as_an_arbitrary_choice_with_no_bridging_line',
        title: "Concept N pins a zero reference the sibling later reveals as free; after a coordinated ruling moved N's reference, N+1 absorbed the ruling in its header and left the stale premise standing in the one state row that depends on it",
        severity: 'MAJOR', owner_cluster: 'alex:architect',
        root_cause: 'Two skeletons authored in parallel each honoured their own boundary. The first defect lived in the SEQUENCE; the SECOND defect is the fix: a cross-concept ruling is absorbed where it is easy to write (header, boundary paragraph, misconception plan) and missed where it is load-bearing (a single narration duty inside one state row, and a claim of visual continuity that no one re-derived from the renderer\'s extent arithmetic).',
        prevention_rule: "When a cross-concept ruling changes a value in the SIBLING, the receiving skeleton re-reads every one of its own sentences that names that value and re-derives each from the sibling's CURRENT authored numbers, listing them. A narration duty that quotes the sibling's configuration cites the sibling's live field value, never a remembered one. Any claim that two concepts SHOW the same thing is settled from the renderer's geometry, not from a shared authored number. Check the shared instrument's LABEL string and its DRAWN position across the pair.",
        probe_type: 'manual',
        probe_logic: "For a concept whose prerequisite shares its scenario: diff the shared instrument's authored configuration, label string and derived drawn position across the two skeletons. Grep the later skeleton for every sentence naming the earlier concept and assert each is reproducible from the earlier concept's CURRENT authored values. Where the drawn positions differ, assert the later concept makes no continuity claim.",
        status: 'OPEN', concepts_affected: [GPE, PED],
        fixed_in_files: [], discovered_in_session: C7A2, row_type: 'incident',
    },
    {
        bug_class: 'nlb_energy_stack_cannot_render_negative_u_grav_so_a_reference_choice_concept_cannot_show_below_its_own_zero_line',
        title: 'The unsigned energy stack clamps a negative U_grav column at zero while its numeral stays true, so the one concept whose claim is that the zero line is arbitrary cannot show a body below it',
        severity: 'MAJOR', owner_cluster: 'peter_parker:field3d_surgeon',
        root_cause: 'energy_layer renders U_grav on an unsigned track (nlbEnPct clamps each segment at >= 0, L48980-48992) while the numeral above it prints the true signed value; the L48948 guard warns rather than rendering. Correct for every concept that measures from the lowest point, wrong for a concept that teaches the reference as a free choice. RIDE-ALONG, not blocking: #7 teaches correctly without it (every guided state keeps h >= h_ref by arithmetic). Would serve concepts 6, 7 and 9 - price once at chapter end rather than three times.',
        prevention_rule: 'A magnitude track whose underlying quantity can legitimately take either sign renders signed (the work_accumulators half-track idiom already in this file at L50840+), behind an explicit opt-in so no shipped unsigned concept changes. Until then, a concept teaching reference choice must declare the below-the-line case as an unrenderable residual, and must not lose an explore control to it without saying so.',
        probe_type: 'js_eval',
        probe_logic: 'Drive an incline state with energy_layer.h_ref_m authored ABOVE the body\'s reachable minimum. Across the full descent, sample the U numeral and the drawn column height each frame; assert they agree in sign and magnitude, and assert zero console lines carrying NLB_ENERGY_SCALE_WARN_PREFIX.',
        status: 'OPEN', concepts_affected: [GPE],
        fixed_in_files: [], discovered_in_session: C7A0, row_type: 'incident',
    },

    // ── concept #7, Checkpoint A cycle 2 ───────────────────────────────────
    {
        bug_class: 'skeleton_authors_a_timed_formula_line_beside_a_base_string_the_reader_replaces',
        title: 'A skeleton specified "formula base plus a timed second line" against a renderer whose timed-line path overwrites the base, so the concept\'s own equation would never have rendered',
        severity: 'CRITICAL', owner_cluster: 'alex:architect',
        root_cause: 'nlbRenderStamps (field_3d_renderer.ts L50642-50654) sets txt = formula_base and then, whenever formula_lines is a non-empty array, REPLACES it with the joined visible lines; the resolver decides presence by Array.isArray && length (L50981-50982). The skeleton cited those exact reader lines and still described the mechanism additively in five places, because "add a timed line" reads as an append everywhere else in the config surface.',
        prevention_rule: 'When a skeleton specifies a timed reveal ON an existing surface, it must state whether the timed path APPENDS to or REPLACES the static field, quoting the assignment that decides it - not merely cite the function. For this family the base equation is authored as the first entry of formula_lines with no at_ms; formula and formula_lines are never authored together, and an empty formula_lines array is never authored at all (it blanks the surface). The same shape exists on rigid_body_rotation (rbrRenderFormula, L56676) and carries the same rule.',
        probe_type: 'js_eval',
        probe_logic: 'For every state authoring formula_lines: assert the state does NOT also author a non-empty formula/formula_base, and assert formula_lines[0] has no at_ms (or at_ms 0). Then load the state, pin at t = 0, and assert the rendered #nlb_formula (or #rbr_formula) textContent is non-empty and contains the concept\'s base equation.',
        status: 'OPEN', concepts_affected: [GPE],
        fixed_in_files: [], discovered_in_session: C7A2, row_type: 'incident',
    },
    {
        bug_class: 'skeleton_names_a_reference_line_by_a_geometric_noun_the_renderer_does_not_guarantee',
        title: 'A dashed zero-reference authored at h_ref_m = 0 was called "the ramp base" throughout a skeleton and used to claim visual continuity with a sibling concept, but the engine draws the surface centred on that origin so the line lands at the slab MIDPOINT',
        severity: 'MAJOR', owner_cluster: 'alex:architect',
        root_cause: 'nlbApplySurface scales the slab to 2*length_m about the surface origin (L44717) and nlbBoundsM returns lo = -length_m (L51653), so s = 0 is the middle of the drawn ramp, not its foot; the h_ref line is parented to world (L49388) at y = h_ref_m * NLB_WORLD_PER_M. A zero authored as the number 0 reads in prose as "the bottom" and in pixels as "halfway up", and no gate compares the two.',
        prevention_rule: 'A skeleton naming a reference line by a geometric feature ("the ramp base", "the foot", "the ground") must derive that noun from the renderer\'s own extent arithmetic and state the derivation, and must separately flag the line\'s IN-FRAME visibility as probe-before-authoring for EVERY state that authors it - not only the state where it is comfortably inside the frame. A reference at the edge of the framed extent is the default case for h_ref_m = 0, not the exception.',
        probe_type: 'js_eval',
        probe_logic: "For every state authoring height_markers.show_h_ref_line: compute the slab extent from length_m and compare h_ref_m against it, and assert the skeleton's prose noun matches (foot => h_ref_m <= -length_m*sin(theta); midpoint => h_ref_m ~ 0). Then at the state's eye_capture_ms project marker_h_ref and marker_h_ref_label to NDC and assert both are inside [-1,1] on both axes and separated from the slab silhouette edge.",
        status: 'OPEN', concepts_affected: [GPE, PED],
        fixed_in_files: [], discovered_in_session: C7A2, row_type: 'incident',
    },
];

async function main(): Promise<void> {
    const before = await supabaseAdmin.from('engine_bug_queue').select('*', { count: 'exact', head: true });
    console.log(`engine_bug_queue BEFORE: ${before.count} rows`);
    console.log(`applying ${rows.length} ch6 concept-6/7 Checkpoint-A scar rows (upsert key = bug_class)…\n`);

    let inserted = 0;
    let updated = 0;
    let failed = 0;
    for (const r of rows) {
        const existing = await supabaseAdmin
            .from('engine_bug_queue').select('bug_class').eq('bug_class', r.bug_class).maybeSingle();
        const { error } = await supabaseAdmin
            .from('engine_bug_queue').upsert(r, { onConflict: 'bug_class' });
        if (error) { failed++; console.error(`  ✗ ${r.bug_class}: ${error.message}`); continue; }
        if (existing.data) { updated++; console.log(`  ↻ UPDATED ${r.severity.padEnd(8)} ${r.bug_class}`); }
        else { inserted++; console.log(`  + INSERT  ${r.severity.padEnd(8)} ${r.bug_class}`); }
    }

    const after = await supabaseAdmin.from('engine_bug_queue').select('*', { count: 'exact', head: true });
    console.log(`\ninserted ${inserted} · updated ${updated} · failed ${failed}`);
    console.log(`engine_bug_queue AFTER: ${after.count} rows (was ${before.count})`);
    if (failed > 0) process.exit(1);
}

main().catch((err) => { console.error('💥 apply failed:', err); process.exit(1); });
