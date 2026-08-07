-- Checkpoint A scar candidates — ch6 concept #3 kinetic_energy_definition
-- Source: docs/loop_runs/ch6/kinetic_energy_definition/founder_proxy_A.md (cycle 0)
-- Schema-checked; no bug_class collision against the 31 classes in this run's five ch6 .sql files.
-- NOT APPLIED at authoring time — the apply step belongs in the ship chain, beside visual:approve.

INSERT INTO engine_bug_queue (bug_class, title, severity, owner_cluster, root_cause, prevention_rule,
  probe_type, probe_logic, status, concepts_affected, fixed_in_files, discovered_in_session, row_type)
VALUES
('ramp_endpoints_multiply_the_taught_variable_by_a_factor_no_rendered_string_claims',
 'A param_ramp runs 2 to 8 while the title and delta cue both say "twice", and the resulting bar factor duplicates the previous state''s',
 'MAJOR', 'alex:architect',
 'The skeleton authored param_ramp {param:m, from:2, to:8} and simultaneously authored the state title "Twice the mass, twice the energy" and the delta cue "Double mass, double K". 8/2 = 4 and 64/16 = 4, so every reader-facing string asserts a factor the pixels contradict. The compounding failure is comparative: the preceding state doubles the SPEED and multiplies the bar by 4, so with a 4x mass ramp both guided states show the identical bar multiplication and the linear-versus-quadratic contrast the concept exists to teach is absent from the screen entirely.',
 'A ramp or compare whose whole job is a PROPORTIONALITY must author endpoints whose ratio equals the ratio its own title and delta cue state, and must produce a rendered factor DIFFERENT from every sibling state that teaches a different power law. Compute both ratios in the skeleton and print them beside the strings.',
 'js_eval',
 'For every state authoring param_ramp: compute to/from and compare against every numeral in that state''s title, delta cue and caption; FAIL on mismatch. Separately, for every pair of guided states teaching different power laws of the same output, compute each state''s rendered output ratio across its own beat and FAIL when the two ratios are equal.',
 'OPEN',
 ARRAY['kinetic_energy_definition']::text[],
 ARRAY[]::text[],
 'ch6-0d-checkpointA-kinetic_energy_definition', 'incident'),

('energy_layer_two_body_groups_stack_vertically_so_a_bar_height_compare_is_not_side_by_side',
 'A design stakes its PRIMARY aha on comparing two energy bars that the panel renders one above the other in the same colour',
 'MAJOR', 'alex:architect',
 'nlbBuildEnergyPanel emits nlb_en_g0 and nlb_en_g1 as sibling BLOCK divs and nlbApplyEnergyLayer sets group 1 marginTop to 9px, so two body_ids render STACKED VERTICALLY, both in NLB_EN_COL.K amber, with roughly 250 px between the two fills at step 0 of the reflow ladder. The engine''s own in-file comment calls them "side-by-side", which is false. A design that promises "the bar stands four times as tall" therefore renders two short stubs on separate baselines, and the effect is compounded by a shared bar_max_J chosen for cross-state comparison rather than within-state deflection (10 percent against 40 percent of a 186 px track).',
 'Before staking an aha on a two-group energy compare, read the group layout code (not the comment) and state in the skeleton that the bars stack vertically. Choose bar_max_J for WITHIN-state deflection of the compared pair, and declare the fallback design in the skeleton if the stacked pair does not read - never defer that proof to a post-build eye_walker or founder_proxy finding.',
 'js_eval',
 'For each state authoring energy_layer.body_ids of length 2: read the computed style of nlb_en_g0 and nlb_en_g1, assert whether they share a horizontal band; measure each fill height in px and assert the SHORTER fill is at least 15 percent of its track. Report the vertical pixel distance between the two fill baselines.',
 'OPEN',
 ARRAY['kinetic_energy_definition']::text[],
 ARRAY[]::text[],
 'ch6-0d-checkpointA-kinetic_energy_definition', 'incident'),

('taught_variable_has_no_rendered_physical_correlate_so_a_text_label_is_the_only_cause',
 'A state teaches a quantity whose change is visible only as digits on a billboard, and claims Rule 32a cause-before-effect for it',
 'MAJOR', 'alex:architect',
 'NLB_BODY_SIZE is declared MASS-INDEPENDENT by design (Rule 29), so a cart at 8 kg is pixel-identical to a cart at 2 kg. The skeleton nonetheless declared the mass ramp the visible CAUSE and asserted the billboard number changes BEFORE the bar. nlbUpdateMassText and nlbPublishEnergy both read the same b.m on the same frame, so the digits and the bar move simultaneously and there is no readable beat. A zero-edit correlate existed and was not taken: nlbArrowLen scales the weight arrow linearly with mg inside a [0.55, 2.80] clamp.',
 'When a state teaches a quantity the apparatus cannot show geometrically, find a rendered correlate that scales with it (a force arrow, an instrument needle) or DECLARE in the skeleton that the cause is text-only and argue why that is acceptable. Never assert Rule 32a cause-before-effect for two values written from one variable in one frame.',
 'js_eval',
 'For each guided state, identify the taught variable from the delta cue; assert at least one non-text rendered element''s geometry changes monotonically with it across the state beat. Separately, for any skeleton asserting cause-before-effect, sample both the claimed cause and the claimed effect each frame and assert the cause changes at least 6 frames earlier.',
 'OPEN',
 ARRAY['kinetic_energy_definition']::text[],
 ARRAY[]::text[],
 'ch6-0d-checkpointA-kinetic_energy_definition', 'incident'),

('quantitative_check_state_reuses_the_exact_numbers_and_the_delta_cue_of_the_state_it_verifies',
 'The numerical verification state stamps the same mass, speeds and joules an earlier qualitative state already showed, and its delta cue restates that state''s claim',
 'MAJOR', 'alex:architect',
 'S2 showed two 5 kg carts at 2 and 4 m/s reading 10.0 J and 40.0 J; S5 was authored as one 5 kg cart with flags at 4.00 and 2.00 m/s stamping 40.0 J and 10.0 J. Same mass, same speeds, same joules, so the check verifies a pair the student has already memorised rather than testing the formula on fresh values. The delta cues compound it: "Double speed, four times K" and "Speed halves, K quarters" are one claim read in two directions, so the verification state''s caption names an earlier state''s aha instead of its own new content (continuous decay of K on one body, and exactly 0.0 J at rest).',
 'A quantitative verification state must land on values NO earlier state has rendered, and its delta cue must name what only that state shows. Cross-tabulate every rendered numeral against every earlier state before fixing the flag conditions.',
 'js_eval',
 'For each state whose role is numerical verification: collect every numeral it renders (stamps, HUD, bar values) and assert none of the (mass, speed, energy) triples equals a triple rendered by any earlier state. Separately assert its delta cue shares no content phrase with any earlier state''s delta cue.',
 'OPEN',
 ARRAY['kinetic_energy_definition']::text[],
 ARRAY[]::text[],
 'ch6-0d-checkpointA-kinetic_energy_definition', 'incident'),

('shared_bar_scale_cross_state_guarantee_is_void_when_the_panel_reflow_ladder_drops_a_step',
 'A concept promises that a bar height means the same joules in every state, but the measured reflow ladder shrinks the track on two-group states only',
 'MODERATE', 'alex:architect',
 'nlbFitEnergyPanel steps down when the panel bottom exceeds window.innerHeight minus 12. A single-group panel measures 315 px to its bottom at step 0 while a two-group panel measures 567 px, so at any sim viewport shorter than about 579 px the two-body states drop to NLB_EN_STEPS[1] (track 138 px) while single-body states stay at step 0 (track 186 px) - and the identical 40.0 J renders 74 px tall in one state and 55 px in the next. THE EYE runs 1280x720 and can never observe it; a teacher on a short laptop viewport can.',
 'A cross-state "same height means same joules" guarantee is only true while every state fits the same reflow step. Compute the panel height at every state''s group count and state the viewport height below which the guarantee breaks, or do not claim the guarantee.',
 'js_eval',
 'Drive every state at viewport heights 720 and 560; for each state read the computed height of a .nlb_en_trk element and assert it is identical across all states at each height. Report the viewport height at which any state first differs from the others.',
 'OPEN',
 ARRAY['kinetic_energy_definition']::text[],
 ARRAY[]::text[],
 'ch6-0d-checkpointA-kinetic_energy_definition', 'directive'),

('field3d_energy_group_comment_says_side_by_side_while_the_layout_stacks_vertically',
 'The in-file comment describing the energy panel''s two body groups contradicts the layout code that renders them',
 'MODERATE', 'peter_parker:field3d_surgeon',
 'nlbPublishEnergy carries the comment "Per-body, so SEAM L''s two compact side-by-side bar groups need no second derivation path", and the energy_layer.body_ids config note calls them "2 compact groups". The actual layout in nlbBuildEnergyPanel emits the groups as sibling BLOCK divs and nlbApplyEnergyLayer sets group 1 marginTop to 9px, so they stack VERTICALLY. Every remaining ch6 concept that needs a two-body compare (work_energy_theorem, conservation_of_mechanical_energy, mechanical_energy_loss_with_friction) will read this comment while designing.',
 'A layout described in a comment must match what the layout code emits. When a seam''s reader function and its comment disagree about geometry, the comment is the defect: correct it in the same commit that is touching the region, and state the orientation explicitly (stacked vertically, one group above the other).',
 'manual',
 'Grep field_3d_renderer.ts for comments describing energy_layer group placement and compare each against the emitted DOM structure in nlbBuildEnergyPanel and the style writes in nlbApplyEnergyLayer.',
 'OPEN',
 ARRAY['kinetic_energy_definition','work_energy_theorem','conservation_of_mechanical_energy','mechanical_energy_loss_with_friction']::text[],
 ARRAY[]::text[],
 'ch6-0d-checkpointA-kinetic_energy_definition', 'incident');

-- ── Cycle 2 addition ───────────────────────────────────────────────────────────
-- Checked against all 31 bug_class values in this run's six ch6 .sql files: no collision.

INSERT INTO engine_bug_queue (bug_class, title, severity, owner_cluster, root_cause, prevention_rule,
  probe_type, probe_logic, status, concepts_affected, fixed_in_files, discovered_in_session, row_type)
VALUES
('rewind_path_assertion_stops_at_the_function_body_and_never_follows_its_calls',
 'A design asserts that a rewind preserves a quantity by reading only the rewind function, not the functions it calls',
 'MODERATE', 'alex:architect',
 'A state combining param_ramp on m with loop_reset_ms is valid only if the rewind never re-seeds the body mass. Both the skeleton and the Checkpoint A review asserted "nlbResetTrajectory never touches b.m" from that function''s own body. Neither followed its call to nlbSeedKinematics (L45459), which is the one path in the rewind that could re-seed a body from its authored JSON. It happens to early-return for an uncoupled state (if (!eng.coupled) return), so the design was safe - but the assertion that cleared it was not actually complete, and a coupled state would have taken the other branch. Every remaining ch6 concept that authors a ramp plus a loop inherits this reasoning.',
 'An assertion that a rewind, reset or re-entry path preserves a quantity must be traced through EVERY function that path calls, and the skeleton must cite the terminating line of each - the early-return, or the last write. Citing only the entry function''s body is not a trace.',
 'js_eval',
 'For each state authoring both param_ramp and loop_reset_ms: drive across at least three loop boundaries and sample the ramped engine field (eng.bodies[id][param]) two frames before and two frames after each boundary. Assert the value is monotonic across every boundary with no discontinuity toward the authored seed. Independently assert the rendered correlates (billboard text, arrow length, bar value) are monotonic across the same samples.',
 'OPEN',
 ARRAY['kinetic_energy_definition','work_energy_theorem','conservation_of_mechanical_energy']::text[],
 ARRAY[]::text[],
 'ch6-0d-checkpointA-cycle2-kinetic_energy_definition', 'directive');
