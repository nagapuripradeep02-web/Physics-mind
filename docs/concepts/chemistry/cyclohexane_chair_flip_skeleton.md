I have the docs, the scar queue, and measured geometry. Here is the skeleton.

---

# Architect skeleton — `cyclohexane_chair_flip`

**Subject:** Chemistry (organic). **Chapter:** NCERT Class 11 Ch.12 *Organic Chemistry — Some Basic Principles and Techniques* / Ch.13 *Hydrocarbons* (cycloalkanes, conformations). Also JEE, IB HL, A-level.
**Concept #4** of `docs/ORGANIC_BUILD_PLAN.md` §4 Wave O-0.
**Renderer:** `field_3d`, `scenario_type: "organic_structure"` — **DOES NOT EXIST YET.** This document is Phase-0 stage **0b**, so it is a specification for the engine as much as a design for the concept. Every state below is `ENGINE-PENDING`; nothing here is certified buildable, and §9 is the list of what must be bought.
**Supersedes as design of record:** the 9-state sketch in `docs/ORGANIC_PHASE0_CONFORMATION.md` §0b. It remains 9 states, but the arc is reordered and two states are replaced — see §2 note.

> **This document is the semantics of record for the `organic_structure` contract fields it touches** (`pucker`, `measure`, `show_h`, camera scheduling, `min_ring` on HUD lines, compare lanes). Skeletons for concepts #1/#2/#3/#5 inherit these semantics; a sibling that needs different semantics for a bought field must change THIS document, not fork it. *(Scar: `two_skeletons_sharing_one_engine_build_state_different_semantics_for_the_same_bought_field`, `sibling_skeletons_specify_one_shared_engine_mechanism_in_two_incompatible_documents`.)*

---

## §0 — Engine bug queue consultation (declared boundary + disposition)

**Queries run** (2026-08-09, worktree `Viditra-organic-o0`, `query_engine_bug_queue.ts`):

1. `--owner alex:architect` → **113 rows**
2. `--row-type directive` → 29 rows (superset overlap with 1)
3. `cyclohexane_chair_flip` → **0 rows** (new concept)
4. `--field3d --open` → ~100 rows

**Boundary verdict, stated explicitly rather than by silence** (scar `scar_audit_claims_a_coverage_boundary_it_did_not_enumerate`):
Queries 1–3 are dispositioned individually below where they bind, and by named group where they do not. Query 4's **non-architect rows are given ONE explicit group verdict: they bind the `S1/S2/A1/A2/A3` `field3d-surgeon` dispatches, not this design document** — they are renderer-implementation scars on scenarios this concept does not run (`newtons_laws_body`, `force_rig`, solenoid, biot, cyclotron, PCPL). They must be enumerated verbatim in the dispatch handoff notes for those five builds; that enumeration is a deliverable of the 0c dispatch briefs, not of a skeleton. **Two query-4 rows DO bind this design and are dispositioned below** (`field3d_scenario_renders_offcentre_because_camera_target_is_not_authorable`, `teach_field3d_explore_grab_and_move_field_point`).

### Rows that BIND this design, and how each is satisfied

| `bug_class` (verbatim) | Verdict |
|---|---|
| `archetype_live_tier_unverified_against_renderer` | **BINDS — and is the whole dispatch.** No archetype here is `[LIVE]`. Every state is marked ENGINE-PENDING in §3; §9 is the buy list; the geometry claims are backed by an offline numerical probe (§10) rather than by a renderer read |
| `skeleton_certifies_a_state_buildable_from_a_mode_string_without_a_frame_probe` | **BINDS.** No state is certified from a `mode` string. Every behavioural claim in §3/§8 is tagged `MEASURED` (offline probe, number quoted) or `ASSUMPTION — probe-before-authoring` |
| `named_primitive_declared_without_the_surface_that_can_render_it` | **BINDS.** §9 classifies every primitive as REUSE (with file:line) or NEW |
| `phase0_union_lists_capabilities_but_never_which_knobs_are_scriptable` | **BINDS.** §9 names the knob, its units and its schedule fields for every capability |
| `phase0_union_table_asserted_not_walked_state_by_state` | **BINDS.** §9 is a per-state walk, not a capability list |
| `phase0_config_enum_closed_against_the_spec_driver_not_the_served_concept_set` + `closed_enum_cannot_name_a_substance_the_design_teaches` | **BINDS — two live enum gaps found** (`hud_lines` has no `distance`; `pucker.waypoint` has no `planar`). §9 E-1/E-2 |
| `architect_declares_an_engine_limit_without_checking_the_per_concept_override_path` + `call_site_enumeration_asserted_exhaustive_without_a_symbol_sweep` + `skeleton_designs_around_an_engine_limit_a_landed_build_already_removed` | **BINDS.** Rule-40a sweeps run on every mechanism I was about to call missing (§9 "Already shipped — reuse, do not rebuild"). Two were **already built** (`camera_steps`, `min_ring`) and are reclassified as reuse |
| `field3d_scenario_renders_offcentre_because_camera_target_is_not_authorable` | **BINDS (S2, S8).** Sight-along and the two-chair compare are solved by the row's own prevention rule — the scenario places itself around the origin via ONE metres-to-world helper — never by authoring a camera target. §9 N-4 |
| `misconception_beat_whose_own_evidence_confirms_the_wrong_belief` | **BINDS (S1).** The flat half of the contrast beat carries its own cost evidence (arc 120.0°, all 12 C–H eclipsed) BEFORE the release, so the flat picture never reads as "fine" |
| `delta_cue_restates_the_declared_misconception_verbatim` | **BINDS.** No cue paraphrases a watched belief; checked cue-by-cue in §3 |
| `delta_cue_asserts_the_states_end_condition_so_it_is_false_while_most_of_the_state_plays` | **BINDS — changed four cues.** Every cue in §3 names the state's ACTION, true from t = 0, not its endpoint |
| `misconception_planted_in_core_ring_and_confronted_only_in_a_hideable_ring` | **BINDS.** M3 ("a flipped chair is a different compound") is planted by S4, a core state → confronted in S4 itself, not deferred to S8 |
| `declared_payoff_state_ringed_outside_the_core_preset` | **BINDS.** PRIMARY aha is S4, `depth_ring: core`, inside `foundational` |
| `core_ring_displays_a_quantity_whose_explanation_lives_in_a_cut_ring` | **BINDS.** No core state's HUD or formula shows energy, A-value or population |
| `explore_controls_not_ring_gated_survive_the_ring_cut` | **BINDS.** Every S9 control carries `min_ring` (§7) |
| `skeleton_discharges_a_ring_cut_with_a_field_no_renderer_reads` | **BINDS, and is only PARTLY dischargeable today.** `min_ring` on `controls_visible` is real (`field_3d_renderer.ts:1323`, `:55295`). `min_ring` on HUD lines is **not implemented anywhere** — so the Rule-38b cut is declared DISCHARGED-ON-DELIVERY of §9 N-6, not discharged now |
| `explore_state_formula_surface_asserts_a_relation_no_state_derives` | **BINDS.** S9 carries **no formula surface at all** — value-only sandbox |
| `teach_coordinate_sim_with_graph` | **BINDS (S6).** ONE `u` drives the ring pose and the rider on the E(u) curve; no static curve |
| `teach_distinct_reference_lines_for_two_radii` | **BINDS (S3), generalised to two directions.** The C3 axis line and the mean-plane disc are two distinct, separately-labelled references |
| `teach_concrete_before_abstract_compare` | **BINDS (S7).** Axial methyl staged ALONE first, then the flip produces the equatorial case; the side-by-side comparison is S8 |
| `teach_do_not_prespoil_a_later_reveal` | **BINDS.** a/e tags first at S3; waypoint NAMES first at S5; kJ·mol⁻¹ first at S6; the methyl first at S7; A-value/percentages first at S8. S4's flip passes through the intermediates but never labels or costs them |
| `teach_visual_must_match_narration` | **BINDS.** S2's narration makes no claim about the flat ring (which is off-screen by then); every counted thing is countable (§8) |
| `nlb_frozen_pin_lands_within_one_frame_of_the_beat_the_dod_asserts_it_shows` + `skeleton_pin_budget_names_the_phase_start_instead_of_the_last_asserted_reveal_inside_it` + `frozen_pin_unbudgeted_on_a_sequential_misconception_state_can_archive_the_wrong_picture` | **BINDS.** §5 is a per-state pin budget in ms, margin ≥ 167 ms everywhere. S1's pin is deliberately budgeted **after** the pucker so the frozen frame never archives the flat ring |
| `authored_beat_ends_by_undoing_the_state_own_claim` | **BINDS (S4).** The flip is a SINGLE pass to chair′ then holds; it must not loop back and undo the swap |
| `gallery_walk_steps_across_values_the_underlying_model_cannot_distinguish` | **BINDS (S5).** The pucker path must pass through the four REAL geometries as knots. A linear interpolation of endpoint coordinates would render three labels on one shape — §9 N-2 makes the knots an engine requirement and a gate assertion |
| `nlb_multibody_lane_gap_is_along_z_so_a_head_on_camera_stacks_the_compared_bodies` + `energy_layer_two_body_groups_stack_vertically_so_a_bar_height_compare_is_not_side_by_side` | **BINDS (S8).** The two chairs lane along the CAMERA's screen-right axis; the two population bars are side by side, sharing one scale ceiling |
| `nlb_motion_archetype_declared_from_a_between_state_delta_or_a_teacher_driven_control` | **BINDS.** All nine archetypes are in-state motions; none is a between-state delta and none (except S9) is teacher-driven |
| `skeleton_exposes_a_control_on_a_parameter_a_state_schedule_already_owns` | **BINDS.** S1–S7 expose zero controls. S8 exposes only `temperature`, which no schedule drives |
| `derived_readout_asserted_by_value_without_defining_its_metric` | **BINDS (S7) — and the probe proved why.** The contact metric is DEFINED in §3/§8 as the two named 1,3-diaxial contacts, methyl-carbon centre to ring-H centre, against the 290 pm van der Waals sum. A generic "nearest contact" readout is BANNED: measured, it reads 270 pm for the *equatorial* methyl and would contradict the narration |
| `hud_qualifier_appears_and_disappears_mid_sweep_and_the_skeleton_declares_the_label_constant` | **BINDS.** The `ae_count` line has exactly TWO string shapes, both declared: `axial 6 · equatorial 6` in a chair, `axial — · equatorial —` off-chair (§9 N-3) |
| `taught_variable_has_no_rendered_physical_correlate_so_a_text_label_is_the_only_cause` | **BINDS (S8).** Population is a filled bar over two rendered chairs, never a text ratio alone |
| `measured_equality_is_an_identity_at_the_authored_home_pose` | **BINDS (S4).** "6 axial before and after" is a symmetry identity and carries no information; the load-bearing claim is the TRACED bond, which is why S4's archetype is follow-one-bond |
| `existing_hud_line_reused_for_a_different_physical_quantity` | **BINDS.** The new `distance` line is new, not `angle` re-purposed |
| `symbol_printed_on_canvas_before_the_lesson_defines_it` | **BINDS.** Gating listed under `teach_do_not_prespoil_a_later_reveal` above |
| `oncanvas_formula_asserts_a_value_the_renderer_cannot_show` + `formula_surface_states_an_identity_in_a_unit_the_hud_never_renders` | **BINDS.** S6's surface is kJ·mol⁻¹ and the HUD renders kJ·mol⁻¹; S8's surface resolves to a percentage and the HUD renders percentages |
| `skeleton_anchor_specified_in_section_9_reaches_no_narration_line` | **BINDS.** The anchor is a state assignment with a reserved word budget (§6): S1 ≈ 12 words, S8 ≈ 15 words |
| `real_world_anchor_declared_in_the_skeleton_with_no_state_and_no_word_budget` | Same; satisfied by §6 |
| `concept_schema_assessment_minimum_exceeds_the_skeleton_authored_item_count` | **BINDS.** 7 questions declared (schema floor is `.min(6)`, `src/schemas/conceptJson.ts:339`), each mapped to a state, `non_assessed_states: [STATE_9]` |
| `skeleton_geometry_block_quotes_rounded_values_the_engine_will_print_differently` | **BINDS.** §10 states the parameterisation the numbers came from and marks which claims are parameterisation-dependent; narration is worded to survive either parameterisation |
| `authored_lumped_constant_inconsistent_with_the_drawn_apparatus_geometry` | **BINDS.** The A-value 7.3 kJ·mol⁻¹ is back-checked against the drawn geometry: two 1,3-diaxial contacts ≈ 2 × the butane gauche 3.8 = 7.6 kJ·mol⁻¹. Consistent (§10) |
| `taught_delta_smaller_than_the_instruments_own_live_noise` | **BINDS, satisfied.** 120.0° → 111.4° is 8.6°; 274 vs 425 pm is 1.55× |
| `ramp_endpoints_multiply_the_taught_variable_by_a_factor_no_rendered_string_claims` | **BINDS, satisfied.** Every ramp endpoint is the number the HUD prints |
| `quantitative_check_state_reuses_the_exact_numbers_and_the_delta_cue_of_the_state_it_verifies` | **BINDS, satisfied.** S7 (274/425 pm) and S8 (7.3 kJ·mol⁻¹, 95:5) share no number and no cue |
| `skeleton_choreography_written_in_tween_vocabulary_the_engine_renders_as_a_cut` | **BINDS.** §5 gives explicit `at_ms`/`ramp_ms` for every transition; no "fades to" |
| `skeleton_cites_two_contradictory_values_for_one_measured_event_in_the_same_document` | **BINDS.** Every measured number appears ONCE, in §10, and is referenced elsewhere |
| `skeleton_dod_declares_rendered_strings_the_shipped_engine_cannot_draw` | **BINDS, and is inverted here.** No engine exists, so every DoD string is an engine ASK (§9), never an assertion about a shipped path |
| `paired_skeletons_cite_each_other_by_state_number_across_a_renumbering` | **BINDS.** The §0b sketch is referenced by CONTENT, never by its state numbers |
| `state_added_at_review_outruns_the_config_contract_shape` | **BINDS at Checkpoint A.** Any state added in review must be re-checked against §9 before it is accepted |
| `chemistry_concept_id_collides_with_rostered_physics_id` | **BINDS, satisfied.** `cyclohexane_chair_flip` collides with no id in `src/data/concepts/*.json` |
| `teach_field3d_explore_grab_and_move_field_point` | **BINDS (S9).** The teacher grabs the ring and drags it through the flip — direct manipulation, not a slider alone (§9 N-7) |
| `architect_scar_audit_claims_completeness_while_skipping_open_rows_on_the_scenario_it_extends` | **BINDS.** `organic_structure` has no rows (it does not exist). The scenarios it REUSES from (`molecular_geometry`, `orbital_shapes`, `bonding_scene`, `vector_geometry_3d`) DO carry rows; enumerating them verbatim is a deliverable of the S1 dispatch brief, and §9 names each reuse site so the surgeon can query them |
| `prior_rulings_and_internal_ledgers_are_not_re_run_over_the_states_a_restructure_creates` | **BINDS.** This skeleton restructured the §0b sketch; §0 was re-run over the NEW nine states, not inherited |

### Rows dispositioned N/A, by named group, with reason

- **The `nlb_*` family** (`nlb_work_bar_zero_crossing_reading_is_unrenderable_at_teaching_speed`, `nlb_angle_arc_to_displacement_measures_net_travel_so_it_hides_after_a_turnaround`, `nlb_sandbox_energy_envelope_computed_from_the_seed_lap_instead_of_the_full_wrap_span`, `nlb_frictionless_state_with_an_opposing_applied_force_reverses_and_unwinds_its_own_work_ledger`, `nlb_checkpoint_s_m_authored_as_displacement_not_track_coordinate`, `nlb_sandbox_default_mu_below_tan_theta_drifts_the_block_to_the_track_bound_and_falsifies_its_own_claim`, `nlb_loop_reset_clears_checkpoint_stamp_and_frozen_pin_can_photograph_an_empty_formula`, `nlb_static_state_authored_on_the_track_bound_fires_a_false_clamp_alarm`, `nlb_checkpoint_W_capture_renders_the_work_bar_label_so_the_authored_stamp_string_never_ships`, `nlb_lane_offsets_apply_to_declared_bodies_not_co_present_ones_so_sequential_phases_split_laterally`) — **N/A: `newtons_laws_body` scenario, integrator-driven mechanics.** `organic_structure` is closed-form-in-t with no integrator, no track, no work ledger. The **two exceptions** (`nlb_multibody_lane_gap...`, `nlb_frozen_pin...`) are dispositioned as BINDING above, because their prevention rules are geometry/timing rules that generalise.
- **The `pcpl_*` / `vg_*` / parametric family** (`pcpl_locus_trace_sweep_parameter_exposed_as_a_slider_collapses_the_curve`, `vg_flip_state_draws_two_equal_magnitudes_at_unequal_screen_lengths`, `camera_frame_fill_reported_in_isotropic_tangent_units_as_a_fraction_of_frame_height`, `authored_window_floor_and_authored_window_centre_are_mutually_unsatisfiable`, `worked_loop_resize_patch_bounded_at_the_pin_instant_instead_of_the_loop_end`, `one_measured_viewport_recorded_as_the_invariant_sim_size_in_the_chapter_state_file`, `shared_bar_scale_cross_state_guarantee_is_void_when_the_panel_reflow_ladder_drops_a_step`) — **N/A: different engines (PCPL / `vector_geometry_3d`) or mathematics-chapter artefacts.** One clause is adopted anyway: `camera_frame_fill...`'s isotropic-units rule is written into the §8 camera acceptance criteria, because my own camera solve is a screen-separation metric and the same shearing trap applies.
- **Reaction/kinetics rows** (`batch_box_rate_ratio_pinned_to_an_earlier_value_measures_the_run_down_not_the_disturbance`, `state_end_of_loop_energy_numbers_derived_at_a_different_t_than_the_travel_table`, `fleet_constant_transplanted_across_a_reversible_to_irreversible_regime_boundary`, `explore_state_runs_its_reaction_to_completion_and_has_no_teacher_facing_rerun`, `density_raised_for_the_noise_floor_without_costing_what_it_does_to_the_run_length`) — **N/A: no reaction, no kinetics, no stochastic particle box in this concept.** The O-0 alarm ledger explicitly excludes bond breaking; the chair flip is a conformational change within one molecule.
- **Rows about already-shipped-registry hygiene** (`registry_id_fix_applied_to_the_reported_row_and_never_swept_across_the_registry`, `operating_manual_carveout_names_one_subject_namespace_and_omits_its_identical_sibling`, `checkpoint_scar_candidates_written_to_a_sql_file_and_never_applied...`) — **N/A to a skeleton**; they bind the dispatching session's registry and queue hygiene, and the last one binds the founder's own instruction that the session applies scar SQL rather than leaving it in a file.
- **Remaining architect rows not named above** (`narration_attributes_an_effect_to_a_cause_the_model_does_not_contain`, `skeleton_asserts_a_sibling_concepts_camera_pose_from_memory_instead_of_reading_its_shipped_json`, `contrast_ghost_coresident_with_the_real_set_fuses_both`, `concept_taught_its_own_quantity_without_the_canonical_picture`, `field3d_rule16a_belief_unbuildable_for_want_of_a_rod_primitive`, `lesson_never_states_the_principle_it_is_named_after`, `skeleton_claims_a_readout_accumulates_while_the_renderer_redraws_the_full_series_every_frame`, `skeleton_designs_against_a_renderer_flag_whose_behaviour_was_removed_but_whose_type_comment_was_not`, `merged_spec_omits_an_instrument_two_states_depend_on_and_the_nearest_existing_chip_measures_a_different_quantity`, `reviewer_accepts_a_residual_on_an_inferred_visual_premise_instead_of_measuring_it`, `skeleton_asserts_a_held_comparison_value_at_an_instant_the_faster_body_has_already_passed`, `architect_authors_a_force_triangle_whose_ratio_exceeds_the_renderer_arrow_maps_dynamic_range`, `engine_extension_replaces_a_shared_constant_without_an_absent_field_fallback_clause`, `skeleton_authors_a_multi_phase_state_on_an_engine_with_no_per_body_activation_time`, `velocity_arrows_routed_through_a_force_arrow_map_collapse_their_ratio_and_cannot_draw_a_true_zero`, `architect_reuses_a_marker_mechanism_without_diffing_the_side_effects_its_presence_switches_on`, `skeleton_authors_a_timed_reveal_chain_of_overlays_on_a_scenario_whose_overlay_config_is_static`, `signed_engine_union_drops_items_its_own_state_table_still_consumes`, `skeleton_authors_a_second_timed_action_after_the_engine_buy_was_scoped_to_one_instant`, `derivation_principle_applied_to_one_beat_but_not_its_sibling`, `teach_inverted_scenario_inverts_cutline_flags`, `rewind_path_assertion_stops_at_the_function_body_and_never_follows_its_calls`, `close_camera_framed_extent_is_authored_as_the_run_length_and_omits_the_body_radius`, `correspondence_state_stages_cause_first_as_a_head_start_so_the_equal_quantities_are_drawn_unequal`, `trend_sweep_changes_the_drawn_objects_shape_midway_so_the_silhouette_change_outweighs_the_taught_change`, `calibration_discipline_propagated_to_a_state_whose_measurement_did_not_cover_it`) — **each SATISFIED-BY-CONSTRUCTION rather than N/A**, because they are all instances of one discipline this document follows throughout: name the mechanism, check it exists, define its metric, and state the number the sim will print. Three deserve a specific note:
  - `skeleton_asserts_a_sibling_concepts_camera_pose_from_memory_instead_of_reading_its_shipped_json` — I do NOT claim VSEPR's camera. I read `src/data/concepts/chemistry/vsepr_molecular_shapes.json` and it authors `camera_position: [0.67, 5.19, 4.8]` (a vector), **not** `az/el/dist`. My camera numbers come from my own solve (§8/§10), and §9 N-5 records that the drafted `camera:{az,el,dist}` shape differs from the fleet's `camera_position` convention — a contract decision the surgeon must make, not an assumption I inherit.
  - `signed_engine_union_drops_items_its_own_state_table_still_consumes` — §9 is diffed against §3 state by state; every instrument named in §3 has a §9 row.
  - `teach_inverted_scenario_inverts_cutline_flags` — noted for the S1 dispatch: `organic_structure` reuses `molecular_geometry`'s chrome, and `molecular_geometry` suppresses its legend outright (`field_3d_renderer.ts:73438`). An 18-atom scenario with two bond families may need that legend BACK; the flag must be re-decided, not inherited.

---

## §1 — Tier and the whiteboard test (chemistry house rule, C5 §7.3)

**Tier: 💎 diamond.** I agree with `ORGANIC_BUILD_PLAN.md`'s "arguably the best 3D organic sim that exists", and I will state the case rather than cite it.

> The test: if a good teacher with a whiteboard and 60 seconds produces the same understanding, it is not a diamond.

A whiteboard cannot flip a chair. It can draw chair A, draw chair B beside it, and assert that one becomes the other — and that assertion is exactly the step students do not make. The evidence is in what they produce afterwards: they draw the ring as a flat hexagon, they label axial and equatorial as though they were properties of particular carbons, and a large fraction believe the two chairs are different compounds. Those three errors are not carelessness; they are the direct consequence of never having seen the motion. **The motion is the lesson, and the motion is the one thing the board cannot supply.**

There is a second reason, specific to this concept and rarer than the first: **the payoff is a transformation, not a picture.** "Every axial bond becomes equatorial" is a statement about what a continuous motion does to a labelling. Two static drawings cannot express it; a sequence of two drawings is exactly what makes students think the ring broke and re-formed.

C5 §2 capabilities (a concept earns a build if it needs one):

| # | Capability | Used here? |
|---|---|---|
| 1 | Show the invisible at scale | — |
| 2 | Sweep "what if" with guaranteed-correct physics | ✅ the sandbox: pucker anywhere, put a group anywhere, change temperature |
| 3 | **Hold 3D spatial structure** | ✅✅ **the whole concept.** Axial vs equatorial is a claim about two directions in space |
| 4 | **Make a counterintuitive result believable** | ✅✅ the chair flip inverts every bond's character while changing no bond at all. Students disbelieve this |

Two of four at double weight, including both of the two that a board is definitionally shut out of. Compare `vsepr_molecular_shapes` (💎, capabilities 2 + 3): this concept adds capability 4 on top, because VSEPR only asks the student to accept a static shape while this one asks them to accept a transformation.

**Dependability (C5 §5, the separate axis): high — by construction, and it is a design constraint, not a hope.** The energy is a published table, never a force field (`ORGANIC_PHASE0_CONFORMATION.md` decision 1). The motion is closed-form in state-local t, so there is no integrator to drift and THE EYE's frozen frames are byte-identical (decision 2). One molecule, one home pose, one apparatus across all nine states. A teacher can put this on a projector mid-sentence and drag the ring, and nothing can diverge.

**Where I dispute the build plan:** nowhere on tier. But `ORGANIC_BUILD_PLAN.md` §8 schedules this **third** (after #1 bond-line and #2 ethane). That order is right for shipping and wrong for one thing worth stating: S2 of this design (sight down a C–C bond, everything staggered) is a slice of concept #2, and S7's A-value is 2× concept #3's gauche interaction. If #2 and #3 ship first, this concept's S2 becomes a one-line callback and could shrink. **I have deliberately authored S2 to stand alone** (Rule 23 — prerequisites are advisory, never gating), and flagged in §11 that it may be trimmed if #2 ships first and the founder wants the states back.

---

## §2 — Atomic claim and state arc

**Atomic claim (one sentence):** This concept teaches that cyclohexane is puckered into a chair which continuously flips into an equivalent chair, and that this flip exchanges every axial bond for an equatorial one — and only that. It does **not** cover ring strain in other ring sizes (deferred to a future `ring_strain` concept), does not cover disubstituted cis/trans ring isomers (deferred), does not cover fused rings or decalin, and does not derive the conformational energies (they are published, not computed).

**Nine states: 4 core · 3 extended · 1 advanced · 1 explore (core).** State count is complexity-driven (Rule 11). The §5 calibration table puts this at "complex, 7–9"; nine is the top of that band and it earns it: the concept carries a geometry claim, a motion claim, a labelling claim, an energy claim and a population claim, and each of the five needs the one before it.

**Changes from the `ORGANIC_PHASE0_CONFORMATION.md` §0b sketch, and why:**

1. **The sketch's first two beats (the ring relaxes; and *why* it relaxes) are MERGED into one contrast state.** They are the two halves of a single Rule-16a contrast beat — the wrong expectation's consequence, then the real physics. Split across two states, the first state's motion happens before its own reason, and the second state has no motion of its own.
2. **A new state is added: sight down a C–C bond, everything is staggered.** The sketch's "flat ring forces 120°" is only half the answer to "why not flat" — the larger half is torsional: a flat ring eclipses all twelve C–H bonds (measured: every ring torsion exactly 0.00° when planar). This is also the state that earns the U5 sight-along camera and links to concepts #2/#3.
3. **The sketch's states 4 and 5 (the flip; then the swap) are REORDERED and re-scoped.** The sketch shows the whole flip first and names the swap after. That pre-spoils the payoff — the swap is plainly visible in the full flip — and it puts the aha late. Here **S4 is the flip WITH one bond traced, and the swap IS S4** (the aha, in core, inside `foundational`), while the naming of the intermediate shapes moves to S5 where it motivates the barrier.
4. **The sketch's state 6 is split in its emphasis:** the shapes-in-between (S5) and the energy cost (S6) are two ideas, and one 25–55-word budget cannot hold both.

Net: same nine states, different four.

---

## §3 — Per-state control table (Rule 31, the required design artifact)

Word budgets are EN narration. Guided = 25–55 words. Every archetype is an **in-state motion**. `depth_ring` per Rule 38a.

| # | State id | Teaches (ONE thing) | Motion archetype | Delta (the ≤5-word on-canvas cue) | Live controls | Words | Ring | `advance_mode` |
|---|---|---|---|---|---|---|---|---|
| 1 | `ring_is_not_flat` | a flat ring forces 120° at every carbon, which carbon cannot hold; released, the ring puckers into a chair at 111° | **flatten→relax** *(the declared Rule-16a contrast beat)* | "Flat drawing, then chair" | none | 45–52 | core | `manual_click` |
| 2 | `every_bond_is_staggered` | sight straight down a C–C bond of the chair: the bonds on the two carbons are staggered, and every one of the six C–C bonds looks the same | **sight-along bond walk** | "Sight down a bond" | none | 35–45 | core | `auto_after_tts` |
| 3 | `axial_and_equatorial` | the chair has two kinds of C–H bond: six axial, nearly parallel to the ring axis, and six equatorial, splayed near the ring plane | **two-family reveal** | "Six axial, six equatorial" | none | 40–50 | core | `manual_click` |
| 4 | `the_flip_swaps_them` | **PRIMARY AHA** — follow one axial bond through the flip: it ends up equatorial, and no bond ever broke | **follow-one-bond through the pucker** | "Follow one axial bond" | none | 45–55 | core | `manual_click` |
| 5 | `shapes_in_between` | the ring passes through named shapes on the way — half-chair, twist-boat, boat — and in the boat two hydrogens are pushed together | **waypoint step with holds** | "Named shapes in between" | none | 40–50 | extended | `manual_click` |
| 6 | `the_barrier` | the flip costs 45 kJ·mol⁻¹ at its highest point, which is small enough that the ring flips constantly at room temperature | **curve-and-rider** (E(u) graph, point riding, ring in sync) | "The flip costs energy" | none | 45–55 | extended | `auto_after_tts` |
| 7 | `a_methyl_on_the_ring` | an axial methyl group sits 274 pm from two hydrogens on the same face — closer than they fit; after the flip it is equatorial and 425 pm clear | **substituent + contact-line reveal, then the flip** *(the declared contrast pair with S4)* | "A methyl on the ring" | none | 45–55 | extended | `manual_click` |
| 8 | `how_many_of_each` | at room temperature the ring sits 95 : 5 in favour of the equatorial methyl | **population bar fill over a laned pair** | "How many of each chair" | `temperature` | 40–50 | **advanced** | `manual_click` |
| 9 | `explore` | teacher sandbox | **drag-sandbox** (grab the ring and flip it by hand) | "Move the ring yourself" | ALL, ring-gated (§7) | 0 / open | core | `interaction_complete` |

**No archetype repeats, and the one near-repeat is declared.** S4 and S7 both contain a pucker sweep. They are the **declared contrast pair**, and the delta names the flip: **S4 flips a bare ring, where the two chairs are identical and the swap is symmetric; S7 flips a substituted ring, where the two chairs are no longer equivalent and the swap now has a consequence.** That is the whole argument of the second half of the concept, and staging it as a contrast pair is the point rather than a concession. S4's motion is a traced single bond over a continuous sweep; S7's is a substituent placement, two contact lines, and then the sweep — different focal, different instrument, different claim.

**Rule 32a — cause before effect, per state:**
- S1: the flat ring is held with its 120° arc and its eclipsed hydrogens for 1.8 s before anything moves; the camera then re-frames while the molecule stays rigid; only then does the pucker start. Three strictly sequential phases, never simultaneous.
- S3: the axial family draws in and glows, completes, and **only then** the equatorial family begins.
- S4: the traced bond is marked and held for 1.5 s before the flip starts. The mark is the cause of attention; the flip is the effect.
- S6: the E(u) curve draws in fully before the rider and the ring begin to move together.
- S7: the methyl appears (cause), then the two contact lines draw to it (effect) 700 ms later, then the flip.

**Rule 32b — only the taught variable moves.** No idle spin anywhere in S1–S8. The apparatus is a single molecule; a background rotation would compete with every one of these motions. (The `spin` control exists only in S9.)

**Rule 32d — home pose.** All nine states show ONE cyclohexane ring at ONE scale about the origin. The camera has exactly three poses across the concept: **HOME** (the solved pose, §8), **FACE-ON** (S1's opening, the flat ring in the image plane), and **SIGHT-ALONG** (S2). Every change between them is an eased, scheduled camera step inside a state, never a cut between states — S1 ends at HOME and S3 onward stay at HOME, so the only in-concept camera travel is S1's opening tilt and S2's out-and-back.

**Rule 32e — one glow focal at any instant.** S3 is the strict case: the axial family glows alone, then dims to a held tint before the equatorial family glows. S4: only the traced bond glows; the other eleven keep their family tint at reduced brightness.

**Rule 29 — brightness, never size.** Nothing zooms. The only lengths that change are the ones that physically change: bond directions during the pucker, the contact lines in S7, the population bar in S8, and the rider's position on the curve in S6.

**Rule 41 check on every cue and title.** "chair", "boat", "twist-boat", "half-chair", "axial", "equatorial" are the standard chemistry words and are used bare. Banned and absent: any phrasing in which the ring wants, prefers, likes, hides, escapes, relaxes-into-comfort, or is happier; "the bond prefers to hide"; "all yours"; "flips to escape strain". Where a cause must be stated, the plain literal form is used: "the axial methyl is 274 pm from two hydrogens, closer than they fit", never "the methyl is uncomfortable".

---

## §4 — Misconception plan (Rule 16a — proactive, inside EPIC-L, no predict-pause)

Three entries. All three are genuine documented student errors; none is manufactured, and six of the nine states carry **no** `misconception_watch` at all.

| id | State | Belief | Visual counter (the contrast beat) | One-line fix |
|---|---|---|---|---|
| **M1** | **S1** | "Cyclohexane is a flat hexagon — that is how it is drawn." | The flat ring is drawn and held with its own consequences visible: the C–C–C arc reads **120.0°** and all twelve C–H bonds are exactly eclipsed (measured: every ring torsion 0.00° when planar). Then it is released and puckers: the arc closes to **111.4°** and the torsions open to **±54.9°**. Both pictures are shown, back to back, no question asked | "A carbon bond angle is about 109.5°, so the ring cannot stay flat." |
| **M2** | **S3** | "Axial and equatorial are fixed labels — carbon 1 is the axial one." | S3 shows both kinds on the SAME carbon: every ring carbon has one axial and one equatorial C–H bond. The HUD reads `axial 6 · equatorial 6` while only six carbons exist, which is only possible if each carbon carries one of each | "Axial and equatorial describe a bond's direction, not which carbon it is on." |
| **M3** | **S4** | "The flipped chair is a different compound — something must have broken." | Through the whole flip the six ring bonds are drawn continuously and never break; the formula surface holds **C₆H₁₂** unchanged from the first frame to the last, and the traced bond keeps its identity and its label the entire way. The same twelve hydrogens are on the same six carbons at the end | "No bond breaks — the ring only changes shape, so it is the same compound." |

**M1 is the state-1 contrast beat** — the one the dispatch asked me to pick. It is the right choice because it is the belief the student arrives with already fully formed (every drawing they have seen is flat), and because its counter-evidence is quantitative and immediate: an angle that is wrong by 8.6° and twelve hydrogens that are exactly eclipsed.

**M3 is planted in a core state and therefore confronted in a core state** (scar: `misconception_planted_in_core_ring_and_confronted_only_in_a_hideable_ring`). It would be natural to leave "same compound" for S8's ⇌ pair, but S8 is advanced and disappears under two presets, so the confrontation lives in S4 where the belief is created.

**No EPIC-C branches.** EPIC-L-first directive (2026-06-10); branches deferred until real student data exists.

**Cue cross-check** (scar `delta_cue_restates_the_declared_misconception_verbatim`): S1's cue is "Flat drawing, then chair" — it names the state's action, not the belief; it does not say "the ring is flat". S4's cue is "Follow one axial bond" — it names an instruction, not the swap. Neither cue paraphrases a watched belief.

---

## §5 — Choreography timing and the frozen-pin budget

The review player's pin lands at `clamp(0.60·R, 150, R−150)` ms. Required margin from the last asserted reveal: **≥ 167 ms (10 frames)**. Every state clears it with room.

| # | R (ms) | Beats (`at_ms` → `at_ms + ramp_ms`) | Pin (ms) | What the frozen frame shows | Margin |
|---|---|---|---|---|---|
| 1 | 13000 | flat hold 0–1800 · camera FACE-ON→HOME 1800–3600 (rigid molecule) · pucker 4200–7200 · hold 7200–13000 | 7800 | the chair at HOME, arc **111.4°** | **600 ms** — deliberately AFTER the pucker, so the frozen frame can never archive the flat ring |
| 2 | 14000 | camera HOME→SIGHT-ALONG(C1–C2) 0–2500 · hold 2500–4500 · step to C2–C3 4500–5200 · hold 5200–7200 · step to C3–C4 7200–7900 · hold 7900–14000 | 8400 | the Newman view down C3–C4, torsion **54.9°** | 500 ms |
| 3 | 15000 | camera SIGHT-ALONG→HOME 0–1200 · axial family draws 1500–3000, glows 3000–4500 · equatorial draws 5000–6800, glows 6800–8000 · arc + two reference lines 8000–8500 · hold 8500–15000 | 9000 | both families tinted, arc and both reference lines up, HUD `axial 6 · equatorial 6` | 500 ms |
| 4 | 14000 | mark the traced bond 500–1500 · hold 1500–3000 · **single-pass** flip u 0→1, 3000–7000 · hold 7000–14000 | 8400 | chair′, traced bond now equatorial and labelled so | 1400 ms. **Single pass, no loop-back** — a loop would undo the state's own claim |
| 5 | 20000 | chair 0–1500 · →half-chair 1500–3000, hold to 4500 · →twist-boat 4500–5800, hold to 7300 · →boat 7300–8600, flagpole contact line draws 8600–9600, hold to 13000 · return legs 13000–17000 · chair′ hold 17000–20000 | 12000 | **the boat**, flagpole contact line drawn and labelled | 2400 ms. The boat is chosen as the frozen frame deliberately: it is the state's most informative single picture |
| 6 | 16000 | curve draws 500–2500 · rider + ring sweep together 3000–9000 · barrier callout at the half-chair instant · hold 9000–16000 | 9600 | full curve, rider at chair′, `ΔG‡ = 45 kJ·mol⁻¹` on the formula surface | 600 ms |
| 7 | 18000 | methyl appears axial 800–1800 · two contact lines draw 2500–4000 · labels hold to 5500 · flip 5500–9000 · equatorial contact line 9200–10200 · hold 10200–18000 | 10800 | equatorial methyl, the 425 pm line up, the two 274 pm lines gone | 600 ms |
| 8 | 15000 | the two chairs lane into place 500–2000 · bars fill 2500–5000 · ratio labels 5000–5400 · `temperature` control live from 6000 · hold | 9000 | both chairs laned, bars at 95 : 5, both labelled | 3600 ms |
| 9 | — | continuous (Rule 37 — `interaction_complete` skips the freeze; the clock free-runs) | none | — | — |

*(Scar `skeleton_choreography_written_in_tween_vocabulary_the_engine_renders_as_a_cut`: every transition above is an explicit `at_ms` + `ramp_ms` pair, not a verb.)*

---

## §6 — Real-world anchor (Rule 35 — universal, culture-neutral)

**Primary — sugar and cellulose, assigned to S1 (≈12 words of its 45–52 budget) and S8 (≈15 words of its 40–50).**

Glucose is a six-membered ring and it sits in a chair, exactly like cyclohexane. In its common form every bulky group on that ring points equatorial. That is not a curiosity: it is why glucose is the most stable and most abundant simple sugar on Earth, and why cellulose — a long chain of these all-equatorial rings — is rigid enough to be wood and cotton fibre. The shape of the ring decides what the material is.

- **S1 placement (≈12 words):** one clause naming the ring as the skeleton of the sugar in food and of cotton fibre. This is a grounding, not a payoff — it pre-spoils nothing, because S1 says nothing about equatorial preference.
- **S8 placement (≈15 words):** the payoff clause — in glucose the bulky groups all sit equatorial, for the reason just shown.

**Secondary (optional, S8 or the block, chemistry-author's call):** many medicines are built on six-membered rings, and whether a group sits axial or equatorial changes whether the molecule fits the protein it is meant to act on.

**Rule 35 audit:** no place, country, festival, food-culture, currency, brand or personal name. Sugar, cotton, wood and medicine read identically to a student anywhere. Plain English; no Hinglish.

**Coherence under the presets:** the S1 clause is core and survives every cut. The S8 clause is advanced and disappears with S8 — the primary anchor therefore still reaches narration under every preset, which is the requirement.

---

## §7 — `entry_state_map`, depth rings, curriculum flex (Rule 38)

### `entry_state_map`

```
foundational:            STATE_1 → STATE_4     # "what is the chair flip", "axial vs equatorial"
ring_flip_energy:        STATE_5 → STATE_6     # "why is the barrier 45", "what is a twist-boat"
substituted_cyclohexane: STATE_7 → STATE_8     # "why is methyl equatorial", "what is an A-value"
```

`STATE_9` (explore) appends to every slice as the sandbox; it is not an aspect.
Default aspect = `foundational`.

**Foundational-coverage rule: SATISFIED with no exit-pill.** The PRIMARY aha is S4, inside `foundational`'s range. Cross-slice invitation pills after S4 ("see what it passes through", "see what happens with a group on the ring") are offered, not required.

### Depth rings and the coherent-when-cut check (Rule 38a)

Order is qualitative → quantitative → derivation: S1–S4 are qualitative geometry; S5–S6 introduce the first numbers with units; S7–S8 are the quantitative substituent argument; S8 alone carries the Boltzmann relation.

```
core      S1 S2 S3 S4                 (+ S9 explore)
extended  S5 S6 S7                    contiguous
advanced  S8                          contiguous, immediately before explore ✔
explore   S9                          core ring
```

**Cut 1 — hide `advanced` (S8):** surviving lesson is S1–S7 + S9.
S7 ends on "the axial methyl is 274 pm from two hydrogens, closer than they fit; equatorial it is 425 pm clear" — a complete qualitative conclusion. **Requirement placed on chemistry-author: S7's narration must not forward-reference the ratio, the A-value, or the word "population".** S7's formula surface is the contact comparison, not `K = exp(−ΔG°/RT)`. S9 has no formula surface and its `temperature` control is `min_ring: advanced`, so it does not appear. **Coherent. ✔**

**Cut 2 — hide `advanced` + `extended` (S5–S8):** surviving lesson is S1–S4 + S9.
Flat-is-wrong → staggered → axial and equatorial → the flip swaps them. That is a complete and self-contained lesson, and it is exactly the depth an IGCSE-style or introductory IB treatment needs. **Requirements placed on chemistry-author:** S4 must not mention the barrier, the intermediate shapes by name, or any substituent; no core state's HUD may carry `energy`, `barrier` or `population`; S9's `substituent`/`group`/`temperature` controls and its `energy`/`population` HUD lines must all be gated out. **Coherent. ✔**

**Rule 38b — the explore state surfaces CORE-ring content only.** S9 has **no formula surface** (which also discharges `explore_state_formula_surface_asserts_a_relation_no_state_derives` outright — there is no relation to reconcile). Its HUD carries `pose` and `ae_count` at `min_ring: core`; `energy`/`barrier` at `extended`; `population` at `advanced`.

**Rule 38c — notation ladder.** Core and extended surfaces are arithmetic and algebra only (angles in degrees, distances in pm, energies in kJ·mol⁻¹). The single exponential relation lives in S8, the advanced ring.

**Rule 38d — dialect.** Dual-label once, then bare: "chair (the puckered shape)" once at S1, then "chair". "conformation (a shape the molecule can twist into without breaking a bond)" once at S1, then bare. "axial" and "equatorial" are labelled on the canvas at S3 with their reference lines and used bare afterwards. Avoid board-specific synonyms: use "conformation", never "conformer" as a first introduction; use "van der Waals contact distance", not "contact radius".

**Rule 38e — graph axes (S6, the only graph).** Convention decided at design time: **x = the flip progress (a dimensionless reaction-like coordinate, 0 at chair, 1 at chair′), y = energy in kJ·mol⁻¹, chair as zero.** This is the universal convention for a conformational profile across CBSE/JEE, IB and A-level; **no board conflict is known, so no axis-swap toggle is authored.** Flagged to chemistry-author to confirm no A-level or IB HL specification requires kcal·mol⁻¹ — if one does, that is a units toggle, not an axis swap.

**Rule 38f — anchor breadth.** Sugar/cellulose is a widest-overlap anchor: it appears in every one of the four listed curricula's biomolecule or organic content. No lab apparatus is used, so the India-lab trap does not arise.

**Rule 38h — preset proposal (derived from the rings; hide, never reorder):**

| Preset | Shows | Hides |
|---|---|---|
| `full` (CBSE/JEE, IB HL, A-level) | S1–S9 | — |
| `no_advanced` | S1–S7, S9 | S8; the `temperature` control; the `population` HUD line |
| `core_only` | S1–S4, S9 | S5–S8; the `substituent`/`group`/`temperature` controls; the `energy`/`barrier`/`population` HUD lines |

### `curriculum_tags` (Rule 38g — CLAIMS, not facts)

| Curriculum | Rings claimed | Verification |
|---|---|---|
| **CBSE / NCERT Cl.11 Ch.13 (Hydrocarbons, cycloalkanes)** | `core` | **author-verified** — chair and boat conformations of cyclohexane are named in the cycloalkanes treatment |
| CBSE / NCERT — `extended`, `advanced` rings | `extended`, `advanced` | `needs_teacher_verification: true` — axial/equatorial depth, the 45 kJ·mol⁻¹ barrier and A-values sit beyond the NCERT text even where JEE expects them |
| **JEE Main / Advanced** | `core` + `extended` + `advanced` | `needs_teacher_verification: true` |
| **NEET** | `core` | `needs_teacher_verification: true` |
| **IB HL** | `core` + `extended` | `needs_teacher_verification: true` |
| **A-level** | `core` + `extended` | `needs_teacher_verification: true` |
| **IGCSE** | not claimed | `needs_teacher_verification: true` (likely out of scope) |
| **AP Chemistry** | not claimed | out of scope — `ORGANIC_BUILD_PLAN.md` §1: AP has no organic mechanism unit |

**No preset goes teacher-visible until a real teacher of that curriculum confirms its cells.**

### S9 explore — the ring-gated control list

```
controls: [
  { id: 'pucker',      min_ring: 'core'     },   // slider AND drag-the-ring
  { id: 'view',        min_ring: 'core'     },   // home ⇄ sight-along
  { id: 'implicit_h',  min_ring: 'core'     },   // hydrogens on/off
  { id: 'spin',        min_ring: 'core'     },
  { id: 'substituent', min_ring: 'extended' },   // which ring carbon
  { id: 'group',       min_ring: 'extended' },   // H | CH3 | Cl | Br | OH
  { id: 'temperature', min_ring: 'advanced' }
]
hud_lines: [
  { id: 'pose',       min_ring: 'core'     },
  { id: 'ae_count',   min_ring: 'core'     },
  { id: 'angle',      min_ring: 'core'     },
  { id: 'distance',   min_ring: 'extended' },
  { id: 'energy',     min_ring: 'extended' },
  { id: 'population', min_ring: 'advanced' }
]
formula: none
```

`min_ring` on `controls_visible` is real and shipped (`field_3d_renderer.ts:1323`, `:55295`). **`min_ring` on `hud_lines` is not implemented anywhere and is engine need N-6** — until it lands, the Rule-38b cut for the HUD is DISCHARGED-ON-DELIVERY, not discharged.

---

## §8 — The 3D authoring traps, per state (design constraints with correct answers)

Both traps are treated as measurable quantities. The numbers below are from an offline closed-form solve (§10), orthographic, over az ∈ [0,360) × el ∈ [0,40] at 1° resolution, on all eighteen atoms. **They are design-time estimates in a parallel projection; the surgeon must re-solve in the real perspective camera at the real atom disc radii and REPORT the achieved figures.** Tagged accordingly.

**Acceptance criteria (the gate `check:organic-structure` must assert these, with negative controls):**
- **Countability.** Every element the caption, HUD or narration counts is separately countable in the projection: minimum pairwise screen separation between rendered atom discs **> 0**, measured in **isotropic screen units** (camX/camZ, camY/camZ), never in NDC — dividing x by the aspect ratio shears every measured direction by 1.78× at 16:9 (adopted from the `vector_geometry_3d` camera lesson).
- **Angle fidelity.** Where a state's thesis is a comparison between angles, the projected angle at the measured site is within **4.0°** of its label, and both projected arms exceed a screen-length floor.

| # | Camera intent | Why this camera makes the state's claim honest | Measured / assumed |
|---|---|---|---|
| 1 | **FACE-ON** for the flat ring (its plane = the image plane, via `flat_basis`), held; then an eased scheduled step to **HOME** while the molecule stays rigid; then the pucker | The state's thesis is the comparison **120.0° vs 111.4°** — the sharpest form of the projected-angle trap. Face-on, the flat 120° is exactly 120.00° on screen, with no distortion to argue about. The molecule is rigid through the camera move, so the student cannot mistake the re-framing for the pucker; the HUD angle holding at 120.0 during the move is the proof. Only then does the ring pucker at a fixed camera. **All hydrogens hidden in the flat phase and through the pucker** (`show_h: none`) — the arc is the only thing being read, and 12 H would occlude it | FACE-ON: exact by construction (`flat_basis`, reused from `molecular_geometry`). HOME: **MEASURED** az 254°, el 10–12° |
| 2 | **SIGHT-ALONG** the named C–C bond: the camera on the bond axis, the bond midpoint at the origin | The state's thesis is a torsion angle, which is only true in projection when the camera is exactly on the bond axis. The engine must ASSERT the alignment to a stated tolerance and the HUD must publish the torsion numerically, so the claim never rests on the projection alone. **Hydrogens shown on the two focus carbons only** (`show_h: [C1,C2]`) — the remaining ring is drawn as a dimmed stick. **The Newman rim convention is mandatory here:** front-carbon bonds drawn to the centre, back-carbon bonds to a rim circle, because at a staggered 54.9° the back bonds are partly behind the front ones and at the eclipsed limit they are exactly hidden. Recentring onto the bond midpoint uses the scenario's own metres-to-world origin helper, not an authored camera target | Alignment tolerance **ASSUMPTION — probe-before-authoring**: propose ≤ 0.5° between the camera forward vector and the bond axis; the surgeon measures and reports |
| 3 | **HOME**: az 254°, el 10–12° | The hardest countability state — twelve C–H bonds shown at once, and the narration counts six of each. **MEASURED at az 254°, el 10°: minimum pairwise screen separation between all eighteen atoms = 0.570 Å; best-carbon projected axial–equatorial angle error = 1.93° against the true 109.46°.** At el 12° the separation improves to 0.624 Å with error 3.81°. At el 0° the angle is near-perfect (1.02°) but separation collapses to 0.379 Å; beyond el 15° the angle error exceeds 5.5°. **el 10–12° is the solved window, and it is narrow — this is exactly why the camera is solved and not chosen.** Two distinct labelled reference lines are drawn: the C3 axis (vertical) and the mean-plane disc; the measured arc is drawn on the ONE carbon the solve certifies, and the HUD carries `axial 6 · equatorial 6` so the count does not rest on the projection | **MEASURED** (orthographic). Perspective re-solve required |
| 4 | **HOME**, fixed for the whole flip | Countability is the failure mode here: a student cannot track twelve bonds swapping in a projection of eighteen atoms, and asking them to is how the aha is lost. The design answer is not a better camera — it is **not to count in the projection at all**: one traced bond carries the claim visually, the HUD carries the count numerically. A fixed camera also guarantees that every change on screen is the molecule, so the flip cannot be mistaken for a camera orbit | **ASSUMPTION — probe-before-authoring:** the traced bond must remain unoccluded throughout u ∈ [0,1] at HOME. If a window of the sweep hides it, choose the traced carbon (not the camera) to fix it — the six carbons are symmetry-equivalent, so a different traced site costs nothing pedagogically |
| 5 | **HOME**, fixed | The flagpole contact is a distance claim, and a distance foreshortens. **The line's LENGTH must not be the evidence** — the numeric label is. The contact line is drawn and labelled in pm, and the boat's hold is long enough (3.4 s) to read it. Countability: only the two flagpole hydrogens need be individually countable during the boat hold | **ASSUMPTION — probe-before-authoring:** the two flagpole H must be separable at HOME in the boat pose. The boat's geometry differs from the chair's, so the §10 chair solve does NOT transfer; the surgeon must re-solve countability at each of the four waypoints |
| 6 | **HOME** for the molecule; the graph is a 2D overlay in its own zone | No projected-angle exposure. Overlay collision is the live risk (Rule 34d): the graph, the formula surface and the HUD must occupy distinct zones and the HUD must clear the review-chrome Full-screen button (`top: 52px`+) | Zone assignment in §9 DoD (h) |
| 7 | **HOME**, fixed | Two distance claims compared, so foreshortening could invert the visual reading. Both contact lines are labelled numerically, and the 290 pm van der Waals reference is drawn as a third, visually distinct reference so the comparison is against a fixed standard rather than between two foreshortened lengths. **The two 1,3-diaxial contacts are drawn to two DIFFERENT ring carbons (C3 and C5) on the same face** — they must be separately countable, since the narration says "two" | **ASSUMPTION — probe-before-authoring:** the two contact lines must not overlay each other at HOME. If they do, the state's carbon choice is the free parameter |
| 8 | **HOME**, two instances laned along **screen-right**, gap solved against the pair's projected bounding boxes | A world-axis lane can stack the two chairs under a head-on camera (recorded scar). The lane must be defined in the camera basis. The frame must also contain both molecules AND both bars at t = 0 and at the pin — a framed extent computed from the pair's bounding boxes plus one molecule-width margin at each end, not from the lane gap alone | **ASSUMPTION — probe-before-authoring:** project both bounding boxes at t = 0, at the pin and at state end; assert every corner inside the viewport |
| 9 | **HOME** default; teacher-orbitable; `view` toggles SIGHT-ALONG | A sandbox cannot be camera-solved, so it must be camera-*recoverable*: a "reset view" that returns exactly to HOME | Standard chrome |

---

## §9 — What the engine must do, per state (the specification)

### Already shipped — REUSE, do not rebuild (Rule 40a sweeps run 2026-08-09)

| Mechanism | Verdict | Evidence |
|---|---|---|
| **Scripted mid-state camera schedule** (S1's FACE-ON→HOME, S2's out-and-back) | **EXISTS. Adopt verbatim, do not invent.** | `camera_steps?: Array<{at_ms, az, el, dist, ease_ms}>` declared at `field_3d_renderer.ts:492`; the `orbital_shapes` original is referenced at `:63742`; already adopted once verbatim as `vgCamScheduleAt` (`:12374`, applied `:14524`), with the adoption comment at `:12042-12043` and `:12355-12356`. This is the **third** adoption and must be the same fields, same semantics |
| **Ring-gated control lists (`min_ring`)** | **EXISTS.** | `controls_visible?: Array<string \| {id, min_ring: 'core'\|'extended'\|'advanced'}>` at `:1323`; normalisation rule at `:55295-55298`. Bare strings normalise to `core` |
| **Flat-sketch plane perpendicular to the camera (`flat_basis`)** | **EXISTS.** S1's face-on flat ring rides it | `mgFlatSources(fr.bonds, mgd.flat_basis)` at `:58970`; helper at `:58494` |
| **Tetrahedral ideal directions / VSEPR angle table** | **EXISTS — must not be re-derived.** | `mgIdealDirs(n)` at `:58349` (n = 4 branch returns the exact tetrahedron), `mgFrame()` at `:58455` |
| **Bond length in scene units** | **EXISTS.** A third copy must not appear | `MG_BOND_LEN = 2.0` at `:58205`; `BS_BOND_LEN` at `:59414` |
| **A picometre-valued span line + label, and label decollision** | **EXISTS — the ancestor of the S5/S7 contact lines.** | span value + label at `:59210-59229`, HUD echo at `:59247-59248`; `mgPlaceLabelClear(sprite, anchor, offset, avoidWorld)` at `:58541` |
| **Costed/resisted twist law with overlap falloff** | EXISTS (`orbital_shapes` `twist_deg`, `:63876`) — **not consumed by this concept**; noted so the A3 dispatch does not rebuild it for concept #6 |
| **Widget ⚙ auto-discovery (Rule 39f)** | Free, provided overlays follow the discovery conventions (inline `position:fixed` dynamic panels, `class="pm_hud"` statics, `<prefix>_<name>_row` slider rows) |
| **`config.field_lines.opacity` must exist as an object, even `{}`** | The fleet blank-scene trap (`:59398`) — applies to this scenario too |

### NEW — the buy list, walked state by state

Each row names the **knob**, its **units**, and its **schedule fields** (scar `phase0_union_lists_capabilities_but_never_which_knobs_are_scriptable`).

| id | Need | Knob · units · schedule | Consumers | Covered by the drafted contract? |
|---|---|---|---|---|
| **N-1** | **Per-state hydrogen visibility by atom list.** S1 needs none, S2 needs four, S3–S9 need all twelve | `show_h: 'none' \| 'all' \| ['C1','C2']` — static per state, no schedule | S1, S2, S3–S9 | ❌ **NO.** The contract has only `lift.show_implicit_h`, a boolean nested inside the `lift` block. Occlusion on an 18-atom skeleton makes per-state H gating a correctness requirement, not a convenience |
| **N-2** | **The pucker path must pass through the four REAL geometries as KNOTS**, not linearly interpolate chair→chair′ endpoint coordinates | `pucker: { path: 'chair_flip', u: 0..1 }`, with the path defined by knots at u ≈ 0 (chair), 0.22 (half-chair), 0.36 (twist-boat), 0.50 (boat), 0.64 (twist-boat), 0.78 (half-chair), 1.00 (chair′), interpolated by a named documented form, closed-form in t | S4, S5, S6, S7, S9 | ⚠ **PARTLY.** `pucker.path`/`u`/`waypoint` exist in the draft, but nothing states that the intermediates are real geometries. Without knots, S5's walk is three labels on one interpolation — the `gallery_walk_steps_across_values_the_underlying_model_cannot_distinguish` failure exactly. **The gate must assert each waypoint's full ring-torsion set against the literature within a stated tolerance.** The u positions above are a design proposal, not literature; chemistry-author and the surgeon must agree them |
| **N-3** | **Off-chair semantics for the axial/equatorial tag.** At the half-chair, twist-boat and boat, "axial" and "equatorial" are not defined | The tag fades out as u leaves a chair pose and re-reads at the far end; `ae_count` renders in exactly **two** string shapes: `axial 6 · equatorial 6` (in a chair) and `axial — · equatorial —` (off-chair) | S4, S5, S9 | ❌ **NO — and the contract does not make the decision at all.** It says only `tag_axial_equatorial` (a boolean) and decision 6 says tags are derived from the pucker. Neither says what a derived tag reads at the half-chair. Left unspecified, the HUD will assert a count that has no chemical meaning. This is the honest answer and it must be written into the contract |
| **N-4** | **Scenario self-centring, for the sight-along and the compare pair** | Per-state world shift computed from the authored geometry at state entry (bond midpoint for `sight_along`; the pair centroid for `compare`), applied in ONE metres-to-world helper every mesh passes through, captured ONCE per state | S2, S8 | ❌ **NO**, and there is an OPEN scar on exactly this (`field3d_scenario_renders_offcentre_because_camera_target_is_not_authorable`). Its prevention rule is the required solution — the scenario places itself around the origin; **do not** add an authorable camera target |
| **N-5** | **Camera pose convention.** The draft says `camera: {az, el, dist}`; the shipped fleet authors `camera_position: [x,y,z]` (verified in `vsepr_molecular_shapes.json`) | Decide ONE and state it; if az/el/dist, the conversion lives in the scenario and `camera_steps` already speaks az/el/dist | all | ⚠ **CONTRACT DECISION NEEDED.** Since `camera_steps` is already az/el/dist, az/el/dist is the coherent choice |
| **N-6** | **Ring-gated HUD lines** | `hud_lines: [{ id, min_ring }]`, same normalisation rule as `controls_visible` | S9, and the whole Rule-38b cut | ❌ **NO.** `min_ring` exists on controls only. Without it, a `core_only` preset shows an energy readout in a sandbox that never taught energy |
| **N-7** | **Drag-to-pucker** — grab the ring and flip it by hand | `pucker: { draggable: true }`; pointer delta maps to Δu with a stated gain; drag seizes the slider (existing drag-seize pattern) | S9 | ❌ **NO.** The draft gives `torsion.continuous` for free-run and `pucker.u` for authoring, but no pointer binding. Required by the open directive `teach_field3d_explore_grab_and_move_field_point` |
| **N-8** | **A measurement instrument family**, config-driven | `measure: [{ kind: 'angle' \| 'distance' \| 'axis_line' \| 'plane_disc', between: [ids], label, reference_value_pm?, at_ms, ramp_ms }]`. Units: degrees for `angle`, pm for `distance` | S1 (C–C–C arc), S3 (a/e arc + C3-axis line + mean-plane disc), S5 (flagpole contact), S7 (two 1,3-diaxial contacts + the 290 pm reference) | ⚠ **PARTLY — the ancestors exist but the config surface does not.** The arc and the pm-valued span line are `molecular_geometry`'s (`:59210-59248`); this generalises them to a named list with a reference value. **The `reference_value_pm` field is load-bearing**, not decoration: without a drawn van der Waals standard, S7's two distances are only comparable to each other and the trap in the next row applies |
| **N-9** | **The contact metric must be NAMED, and a generic "nearest contact" readout must be impossible to author** | `distance` measurements are between two explicitly named atoms; there is no "closest contact" mode | S7 | ❌ **NO — and this is the sharpest instrument trap in the concept.** **MEASURED:** the equatorial methyl carbon's nearest ring hydrogen is **270 pm** (to C5's axial H), which is *closer* than the axial methyl's 1,3-diaxial contact at **274 pm**. A generic nearest-contact readout would therefore show the equatorial methyl as the more crowded one and flatly contradict the state's narration. The honest instrument is the two NAMED 1,3-diaxial contacts (274 pm each, axial) versus the same two named contacts after the flip (**425 pm** each, equatorial) |
| **N-10** | **A traced bond that keeps its identity through the pucker and reports its own tag** | `trace: { bond: 'C1-Hax', label, report_tag: true }` — the label reads `C1 axial` at u = 0 and `C1 equatorial` at u = 1 | S4 | ❌ **NO.** The draft has `substituents[].highlight` (marks a substituent) and `tag_axial_equatorial` (a global boolean). Neither traces a single C–H bond. This is the mechanism that carries the PRIMARY aha |
| **N-11** | **A multi-leg waypoint walk with named holds** | `pucker.walk: [{ waypoint, at_ms, ramp_ms, hold_ms, label }]` | S5 | ❌ **NO.** The draft gives a single destination (`waypoint`) and a single ramp (`u_from/at_ms/ramp_ms`). S5 needs seven legs |
| **N-12** | **The `pucker.waypoint` enum has no `planar` member**, so S1's flat ring cannot be named | Add `planar` to `waypoint`, and let the path carry a pre-chair segment (u < 0, or a separate `flatten` leg) | S1 | ❌ **ENUM GAP.** `mode: lift` is specified for a bond-line *sketch* lift via `mgFlatSources` — a different mechanism from a planar RING relaxing into a chair. Freezing the enum without `planar` makes S1 unbuildable in the mode that fits it |
| **N-13** | **The `hud_lines` enum has no `distance` member** | Add `distance` to the closed `hud_lines` enum (`phi · energy · barrier · angle · pose · overlap · residual · ae_count · population`) | S5, S7, S9 | ❌ **ENUM GAP.** Three states publish a distance in pm and no line can name it. **Do not re-purpose `angle`** (scar `existing_hud_line_reused_for_a_different_physical_quantity`) |
| **N-14** | **A two-instance compare with a camera-basis lane** | `compare: { instances: [{substituents, pucker.waypoint}, …], lane_axis: 'screen_right', gap }` | S8 | ❌ **NO.** `mode: compare` is in the enum but no layout is specified. The lane MUST be in the camera basis, per the recorded head-on stacking scar |
| **N-15** | **A population instrument** — a side-by-side pair of bars sharing ONE scale ceiling, computed by the engine from a published A-value and the live temperature | `population: { a_value_kj: 7.3, temperature_k: 298.15, show_bar: true }`; the percentages are engine-computed via the Boltzmann relation, never authored per temperature | S8 | ⚠ **PARTLY.** `hud_lines` has `population` but the drawn bar, the shared scale ceiling and the temperature binding are unspecified. The A-value belongs in the published table beside the energy curves, with the same "(literature)" stamp |
| **N-16** | **The `cyclohexane` energy curve as a published table with the u-axis SHARED with the pose** | `energy: { curve: 'cyclohexane', coordinate: 'pucker', units: 'kJ/mol', zero_at: 'chair', stationary: [chair 0 min, half_chair +45 max, twist_boat +23 min, boat +29 max, twist_boat +23 min, half_chair +45 max, chair 0 min] }` | S6, S9 | ⚠ **PARTLY.** The draft's `energy` block exists and lists `cyclohexane` as a curve. What must be added is the requirement that **E(u) and pose(u) read the SAME u** — one live parameter driving both the ring and the rider (the open directive `teach_coordinate_sim_with_graph`). Note the profile has **two** twist-boat minima flanking the boat maximum, which the draft's four-point table does not spell out |

**Success test for the A2 dispatch:** with N-1 … N-16 landed, `cyclohexane_chair_flip` is authorable as **pure JSON with zero further renderer edits**. Any state that then needs an unplanned engine edit means this specification under-generalised → stop and re-scope with the surgeon, per the alarm rule.

---

## §10 — Measured values (each written ONCE; referenced elsewhere)

All computed offline in closed form on 2026-08-09 (no files written). **Parameterisation:** ring carbons at azimuths 60k°, alternating ±h/2 in y, solved for C–C = 1.540 Å and C–C–C = 111.4°, giving ring radius **1.4690 Å** and pucker **h = 0.4622 Å** (carbons ±0.2311 Å from the mean plane); C–H = 1.09 Å placed by tetrahedral completion at H–C–H = 107.5°.

| Quantity | Value | Status |
|---|---|---|
| C–C bond length | 154 pm | published (dispatch brief) |
| C–H bond length | 109 pm | published |
| Tetrahedral angle | 109.47° | published |
| Chair C–C–C angle | 111.4° | published, imposed as a solve constraint |
| Chair ring torsion | **±54.94°** | **MEASURED** — matches the literature ±55° |
| Planar ring C–C–C angle | **120.00°** | **MEASURED** |
| Planar ring torsions | **0.00°, all six — fully eclipsed** | **MEASURED** |
| Axial C–H deviation from the C3 axis | **4.07°** | **MEASURED** — see the caution below |
| Equatorial C–H tilt from the mean plane | **21.57°** | **MEASURED** — see the caution below |
| Axial–C–equatorial angle | **109.46°** | **MEASURED** |
| 1,3-diaxial H···H (chair, C1↔C3) | **267.8 pm** | **MEASURED** (van der Waals H+H sum ≈ 240 pm) |
| Axial methyl carbon ↔ axial H at C3 and C5 | **274.3 pm each** | **MEASURED** — overlaps the C+H van der Waals sum (290 pm) by 15.7 pm, twice |
| Equatorial methyl carbon ↔ the same two axial H | **424.6 pm each** | **MEASURED** — clear by 134.6 pm |
| Equatorial methyl carbon ↔ its NEAREST ring H (any) | **270.0 pm** (C5 axial) | **MEASURED — the instrument trap of N-9.** This is closer than the axial case's 274 pm |
| Solved camera, all 18 atoms | **az 254°, el 10°: min pairwise screen separation 0.570 Å, best-carbon projected angle error 1.93°**; el 12°: 0.624 Å / 3.81° | **MEASURED**, orthographic — perspective re-solve required |
| Camera trade at el 0° / 15° / 20° | 0.379 Å / 1.02° · 0.670 Å / 5.59° · 0.701 Å / 7.51° | **MEASURED** — the acceptable window is narrow |
| Methyl A-value | 7.3 kJ·mol⁻¹ | published (dispatch brief) |
| Equatorial : axial at 298.15 K from 7.3 kJ·mol⁻¹ | **95.00 : 5.00** | **MEASURED** — the two published numbers are mutually consistent to two decimals (the A-value giving exactly 95:5 is 7.299 kJ·mol⁻¹) |
| The same at 250 / 350 / 400 / 500 K | 97.1:2.9 · 92.5:7.5 · 90.0:10.0 · 85.3:14.7 | **MEASURED** — the S8 temperature slider's range |
| Plausibility back-check on the A-value | two 1,3-diaxial contacts ≈ 2 × the butane gauche 3.8 = **7.6** vs the published 7.3 kJ·mol⁻¹ | **MEASURED** — consistent with the drawn geometry |
| Flip rate from a 45 kJ·mol⁻¹ barrier (Eyring, 298.15 K) | **8.1 × 10⁴ s⁻¹**, half-life **8.5 µs** — "about a hundred thousand times a second" | **MEASURED (derived, not published)** — chemistry-author decides whether to publish the figure or state it qualitatively |
| Boat flagpole H···H | ≈ 183 pm | **ASSUMPTION — literature, unverified by me.** chemistry-author must confirm; I did not construct boat coordinates |
| Barrier / conformer energies | chair 0 · half-chair +45 · twist-boat +23 · boat +29 kJ·mol⁻¹ | published (dispatch brief); chemistry-author verifies |

**Caution on two of the measured values (scar `skeleton_geometry_block_quotes_rounded_values_the_engine_will_print_differently`).** The axial deviation (4.07°) and the equatorial tilt (21.57°) are **parameterisation-dependent**: an idealised all-tetrahedral chair gives exactly 0° and 19.47° respectively. The engine must pick ONE parameterisation and publish from it. **Therefore the narration must not quote either number.** S3 says "nearly parallel to the ring axis" and "close to the ring plane" — claims true under both parameterisations — and the on-canvas measurement is the **axial–C–equatorial angle**, which is 109.46° under my solve and 109.47° idealised, i.e. robust either way. This is a constraint on chemistry-author, not a preference.

---

## §11 — Prerequisites (advisory only, Rule 23)

| Prerequisite | Status | What breaks without it |
|---|---|---|
| `vsepr_molecular_shapes` | **shipped** (chemistry) | S1's whole premise — that carbon "wants" 109.5° and cannot hold 120° |
| `hybridisation_sp_sp2_sp3` | **shipped** (chemistry) | why every ring carbon is tetrahedral |
| `sigma_pi_bonding` | **shipped** (chemistry) | why a σ bond can rotate at all, which is what makes a conformational change possible |
| organic #1 bond-line ↔ 3D structure | **unbuilt** (Wave O-0, scheduled first) | reading the flat drawing as a drawing rather than a shape. S1 patches this in one clause |
| organic #2 conformations of ethane | **unbuilt** (scheduled second) | "staggered" and "eclipsed" as words. S2 patches this by defining them on screen |
| organic #3 conformations of butane | **unbuilt** | the gauche 3.8 kJ·mol⁻¹ that makes the A-value 7.3 explicable rather than asserted. S7 stands alone without it |

**If #2 ships before this concept**, S2 may be trimmed to a shorter callback — flagged for the founder's decision at that time, not decided here.

---

## §12 — `has_prebuilt_deep_dive` (cache hint, not a gate)

Three states flagged. Every state shows the Explain button regardless (Rule 18); un-flagged states route to the feedback form. **Nothing is authored now** — V1.0 ships zero authored deep-dives; these are the investment targets if analytics later trigger.

| State | Why | Three candidate `cluster_id`s |
|---|---|---|
| **S3** `axial_and_equatorial` | The single most-confused distinction in the topic, and the one students carry wrong into every later question | `which_bonds_are_axial` · `why_equatorial_is_not_in_the_plane` · `how_to_draw_axial_and_equatorial` |
| **S4** `the_flip_swaps_them` | The aha, and the state where "did a bond break?" is asked | `does_the_ring_break_when_it_flips` · `does_every_bond_swap_or_only_some` · `same_compound_or_different` |
| **S7** `a_methyl_on_the_ring` | Where a correct rule ("equatorial is less crowded") is memorised without its cause; the 1,3-diaxial picture is the cause | `what_is_a_1_3_diaxial_interaction` · `why_axial_is_crowded_but_equatorial_is_not` · `does_a_bigger_group_change_it` |

**Documented divergence from the Pass-1 cliff states.** The prerequisite cliffs fall at **S1** (needs tetrahedral carbon) and **S6/S8** (need "energy barrier" and Boltzmann). Those are patched inline by a clause each, not by a deep-dive: S1's cliff is one sentence of definition, and S6/S8 sit in hideable rings where a syllabus that cannot supply the prerequisite simply does not show the state. The three states above are chosen instead because they are where students who have *all* the prerequisites still get stuck.

---

## §13 — Registration

**Site #1 only** — `src/data/concepts/chemistry/cyclohexane_chair_flip.json`.
Sites 2/3/4/7/8 are **FORBIDDEN** for chemistry ids until the chemistry serving path lands (root `CLAUDE.md` §6; `docs/CHEMISTRY_ARCHITECTURE.md` §7). Gate 8b is all-or-nothing. Validation is `npm run validate:chemistry`; the physics validator must not see this file. The id collides with no rostered physics id.

---

## §14 — Definition of Done (Gate 0 — zero TBDs)

Because the renderer does not exist, **every rendered string below is an engine ASK carried by a §9 row, never an assertion about a shipped path.**

**(a) States** — the nine of §3, exactly as tabled, in that order. `STATE_1` … `STATE_9`.

**(b) Symbol-label table** — every quantity the narration names, and its exact on-canvas form:

| Narrated quantity | On-canvas | Where |
|---|---|---|
| ring bond angle | arc sprite `C–C–C = 120.0°` → `111.4°`, live | S1 |
| ring torsion | HUD `torsion = 54.9°` | S2 |
| bond kinds | sprite labels `axial` and `equatorial`, once each at S3, then bare in the HUD | S3+ |
| axial/equatorial count | HUD `axial 6 · equatorial 6` (chair) / `axial — · equatorial —` (off-chair) — **exactly two string shapes, N-3** | S3, S4, S9 |
| the ring axis | reference line labelled `ring axis` | S3 |
| the ring plane | reference disc labelled `ring plane` | S3 |
| the traced bond | label `C1 axial` → `C1 equatorial` | S4 |
| molecular formula | formula surface `C₆H₁₂`, unchanged through the flip | S4 |
| conformer names | sprite `half-chair` / `twist-boat` / `boat`, on arrival | S5 |
| flagpole contact | line + label `H···H = 183 pm` | S5 |
| conformational energy | HUD `E = 23 kJ·mol⁻¹`, live; graph axes `flip progress` / `energy (kJ·mol⁻¹)` | S6 |
| the barrier | formula surface `ΔG‡ = 45 kJ·mol⁻¹` | S6 |
| 1,3-diaxial contacts | two lines + labels `CH₃···H = 274 pm`; van der Waals reference labelled `contact distance 290 pm` | S7 |
| the same after the flip | one line + label `CH₃···H = 425 pm` | S7 |
| the A-value | formula surface `ΔG° = 7.3 kJ·mol⁻¹` | S8 |
| population | two bars labelled `equatorial 95%` and `axial 5%`; HUD `T = 298 K` | S8 |
| units | `°`, `pm`, `kJ·mol⁻¹`, `K` — real Unicode throughout | all |

**(c) Chemistry variant of the direction/rule plan — the structural-validity ledger** (no reaction occurs, so there is no balanced-equation ledger; the right-hand rule is N/A):
Carbon is tetravalent in every frame and at every u. The formula is C₆H₁₂ at u = 0, at u = 1 and at every intermediate — asserted by the gate, not by narration. No bond is created or broken anywhere in the concept (this is Wave O-0; bond events are Engine C). The methyl at S7/S8 replaces exactly one H, so the formula becomes C₇H₁₄ and the surface must say so. State symbols and oxidation numbers are N/A. **The engine derives axial/equatorial from the pucker and never from an authored per-waypoint tag** (`ORGANIC_PHASE0_CONFORMATION.md` decision 6), and the gate asserts the tag set at u = 1 is exactly the inverse of the set at u = 0. Every energy is a published table entry with a "(literature)" stamp; the engine computes no steric energy.

**(d) Motion plan** — exactly the archetype column of §3 with the timings of §5. No static state. No idle spin in S1–S8.

**(e) Modes** — `epic_l_path` only (Rule 20 [D]: no `mode_overrides`). `renderer_pair`: field_3d / field_3d, no second panel. `organic_structure.mode` per state: S1 `pucker` (with the `planar` waypoint of N-12), S2 `pucker` (static pose, sight-along camera), S3 `pucker` (static chair), S4–S6 `pucker`, S7 `pucker`, S8 `compare`, S9 `explore`.

**(f) Assessment + coverage_map + misconception_watch** — **7 questions** (schema floor `.min(6)`, `src/schemas/conceptJson.ts:339`), backward-designed, each with every wrong option keyed to an M1/M2/M3-class belief:

| q | Tested idea | `teaches_state` |
|---|---|---|
| q1 | cyclohexane is not planar, and why | S1 |
| q2 | in the chair, neighbouring bonds are staggered | S2 |
| q3 | each ring carbon carries one axial and one equatorial bond | S3 |
| q4 | **the flip exchanges axial and equatorial, and breaks no bond (the aha)** | **S4** |
| q5 | the boat and twist-boat are higher in energy than the chair; the half-chair is the highest point | S5 / S6 |
| q6 | a methyl group is less crowded equatorial, because of two 1,3-diaxial contacts | S7 |
| q7 | a **transfer** item — a bulkier group (t-butyl) gives a stronger equatorial preference than methyl; no single state stages it, and `coverage_map.notes` says so | S8 (transfer) |

`by_state` covers S1–S8; `non_assessed_states: [STATE_9]`. `misconception_watch` is exactly the three entries of §4, on S1, S3 and S4 — and on no other state.

**(g) Macro↔micro (Rule 33) — N/A, and deliberately.** There is no macroscopic manipulable cause driving a separate microscopic mechanism; the molecule is the taught object at the only scale it has. Same precedent as `vsepr_molecular_shapes` and `bohr_model_energy_levels`. Recorded as a decided non-issue, not an omission. **Rule 33d does bind**: every instrument here shows a live number — the arc, the torsion, the contacts, the energy rider and the population bars are all value-bearing, never decorative.
**Representation-triangle vertex per state** (`patterns/chemistry.md` §0): S1 particulate-leads · S2 particulate · S3 particulate · S4 particulate · S5 particulate · S6 particulate leads, symbolic supports (the energy value) · S7 particulate · S8 particulate leads, symbolic supports (the ratio) · S9 particulate. **The symbolic vertex never leads a core-ring state** — the only formula surfaces in core states are `C₆H₁₂` (a label on a picture already seen) and the angle arcs.

**(h) Canvas budget (Rule 34)** — per state: **ONE** math-serif Unicode formula surface (S2, S3, S5 and S9 carry none at all); the on-canvas top caption is the ≤5-word delta cue of §3 and nothing else; all prose narration lives in the subtitle strip below the canvas. HUD is value-only, top-right at `top: 52px` or lower so it clears the review-chrome Full-screen button. Zone assignment, fixed across the concept so nothing collides: **HUD** top-right · **formula surface** left, mid-height · **graph** (S6 only) bottom-left · **sliders** bottom-right · **measurement labels** in-scene via `mgPlaceLabelClear`. No two overlays share a zone in any state, and each state shows only the overlays it needs.

**(i) Curriculum-flex block (Rule 38)** — §7 in full: both preset cuts written out and checked coherent; the explore state surfacing core-ring content only with no formula surface; `curriculum_tags` authored as claims with `needs_teacher_verification` on every cell except CBSE core; the preset proposal derived from the rings by hiding only; the S6 graph-axis convention decided with no axis-swap toggle needed.

**(j) Engine contract this scenario must supply** — §9, N-1 through N-16, plus the reuse list. **Nothing in this DoD is buildable until those land.**

---

## Block 1 — Pass-1 strategic checklist

**Prerequisite cliff.** The load-bearing prerequisite is that carbon is tetrahedral at about 109.5° (`vsepr_molecular_shapes`, shipped). **Without it the concept breaks at S1**, whose entire argument is that 120° is a value carbon cannot hold — a student who does not know carbon's angle hears an assertion, not a reason. Patch, added to S1's choreography plan: the arc appears on the flat ring reading 120.0° with a second, dimmed reference arc at 109.5° beside it, and one narration clause names it — *"a carbon bond angle is about 109.5 degrees"*. That costs about eight words, adds a rendered reference rather than a lecture, and a student who already knows it reads it as a reminder rather than a lesson. A second, lighter cliff sits at S6, where "energy barrier" is assumed; it is patched by the curve itself, which shows the barrier before naming it, and S6 is extended-ring so a syllabus that has not met the idea can hide it.

**JEE-backwards trace.** Target question, JEE Advanced in shape: *"Methylcyclohexane exists as two chair conformers. Identify the more stable one, explain why in terms of specific interactions, and state which bonds on carbon 1 exchange character during the flip."*

| Knowledge piece the answer needs | State that delivers it |
|---|---|
| cyclohexane is puckered, not planar | S1 |
| the chair is the low-energy conformation because every bond is staggered | S2 |
| each carbon carries one axial and one equatorial bond | S3 |
| the flip exchanges them, breaking nothing — so the two conformers are the same compound | **S4** |
| the flip is real and fast at room temperature, so both conformers are actually populated | S6 |
| the axial substituent has two 1,3-diaxial contacts and the equatorial one has none — the named interaction the question asks for | **S7** |
| the resulting population, and that it is a Boltzmann consequence of an energy difference | S8 |

Every piece is delivered. No state was added for the trace, and no piece is missing. The one thing the question could ask that this concept does not cover is a **disubstituted** ring (cis/trans-1,2-dimethyl), where the two conformers are not related by a simple preference — that is deliberately out of the atomic claim and belongs to a sibling concept.

**Misconception entry mapping.**
- **M1 (the ring is flat)** is planted long before this sim, by every hexagon the student has ever drawn — S1 confronts it directly rather than pretending it is not already there. Nothing in this concept re-plants it: after S1 the flat ring never reappears, including in the explore sandbox, whose pucker slider is bounded so it cannot return the ring to planar.
- **M2 (axial and equatorial are fixed labels on particular carbons)** is at genuine risk of being planted by **S3 itself**, if the axial family is revealed as a group and reads as "these carbons are the axial ones". The prevention is built into S3's choreography: the reveal is **per-carbon, not per-family in space** — the six axial bonds light up one per carbon around the ring, so the picture the student forms is "every carbon has one", and only then does the equatorial family follow the same path. This is a planting risk handled at the planting moment, which is the Rule-16 requirement.
- **M3 (a flipped chair is a different compound)** is planted by S4, the state that shows the flip — and confronted in the same state, by the continuously-drawn bonds and the unchanged C₆H₁₂ surface. It is deliberately NOT deferred to S8, because S8 is advanced and vanishes under two of the three presets.
- No EPIC-C branches (EPIC-L-first directive).

---

## Block 2 — Aha-moment designation

**PRIMARY aha (the 10-year memory):** *the ring flips into an identical chair without a single bond breaking, and in doing so every axial bond has become equatorial — so "axial" was never a property of a carbon, only of a direction the molecule can trade away.*
Delivered at **S4**, `depth_ring: core`, inside `entry_state_map.foundational` (STATE_1 → STATE_4). ✔

**SUPPORTING aha (one):** at **S7** — *an axial group has two hydrogens sitting 274 pm away on the same face, closer than they fit, and the equatorial one has none.* This is the payoff of the primary: the swap only matters because the two positions are not equally roomy, and the primary only becomes predictive once the student can see which position a group ends up in.

**Cohesion check.** One supporting aha, and it depends on the primary in both directions: S7's contrast is unreadable without S3's a/e distinction and S4's demonstration that a group can move between them, and S4's swap is a symmetry curiosity until S7 shows it has a consequence. Nothing here stands alone; nothing belongs in a sibling concept. (I considered a third candidate — "the boat is not a stable shape, the twist-boat is" — and rejected it: it is genuine and examinable but it reinforces neither aha, so it stays as S5 content rather than being promoted.)

**Wrong-belief setup, per aha.**
- **For the PRIMARY (S4):** S3 is the setup state, and it works by making the student *correctly* confident. S3 teaches a clean, true, satisfying classification — six axial, six equatorial, each carbon has one of each — and a classification invites the belief that the categories are permanent. The student leaves S3 confident and slightly wrong, which is exactly the condition the flip breaks. **S3 must therefore not hint that the labels can change**; that is a constraint on chemistry-author, not a stylistic note.
- **For the SUPPORTING (S7):** S4 is the setup, and its own symmetry does the work. In S4 the two chairs are indistinguishable, which quietly teaches "the flip changes nothing that matters". S7 puts one methyl group on the ring and that stops being true. This is why S4 and S7 are the declared contrast pair rather than two unrelated pucker states.

**Deep-dive cross-reference.** The three `has_prebuilt_deep_dive` states (S3, S4, S7) are the two aha states plus the setup state that carries the primary's wrong belief. The divergence from the Pass-1 cliff states (S1, S6/S8) is documented in §12: the cliffs are patched inline because they are missing prerequisites, whereas S3/S4/S7 are where a fully-prepared student still gets stuck.

---

## Open questions for `chemistry-author`

1. **Verify every published energy** before A1 closes: chair 0 · half-chair **+45** · twist-boat **+23** · boat **+29** kJ·mol⁻¹, and the methyl A-value **7.3** kJ·mol⁻¹. I confirmed only their mutual consistency (7.3 → exactly 95.00 : 5.00 at 298.15 K; 2 × the butane gauche 3.8 = 7.6 ≈ 7.3), not their sources.
2. **The boat flagpole H···H distance (≈183 pm) is the one number in this document I did not compute.** I did not construct boat coordinates. Confirm the value and its source, and confirm the van der Waals reference to quote against it (I used 240 pm for H+H and 290 pm for C+H).
3. **The flip rate.** My Eyring calculation from 45 kJ·mol⁻¹ at 298.15 K gives 8.1 × 10⁴ s⁻¹, half-life 8.5 µs. Do you want S6 to publish "about a hundred thousand times a second", or to stay qualitative ("far too fast to separate the two chairs at room temperature")? It is a **derived** number, not a published one, so it needs a decision and, if published, a stamp distinguishing it from the literature values beside it.
4. **The u-positions of the waypoints** (chair 0 · half-chair 0.22 · twist-boat 0.36 · boat 0.50 · twist-boat 0.64 · half-chair 0.78 · chair′ 1.00) are my design proposal for the pucker path parameterisation, not literature. Agree them with the surgeon, since they set both the pose and the graph's x-axis.
5. **Do not quote the axial deviation (4.07°) or the equatorial tilt (21.57°)** in narration — both are parameterisation-dependent (§10 caution). Say "nearly parallel to the ring axis" and "close to the ring plane", and let the on-canvas measurement be the axial–C–equatorial angle, which is robust at 109.46–109.47°.
6. **S7's narration must not forward-reference the ratio, the A-value or "population"**, or the `no_advanced` preset breaks (§7 Cut 1).
7. **Confirm the glucose anchor's phrasing** — that in its common ring form the bulky groups sit equatorial, and that cellulose's rigidity follows. Keep it to the reserved budgets (S1 ≈ 12 words, S8 ≈ 15).
8. **S6's units** — confirm no A-level or IB HL specification requires kcal·mol⁻¹. If one does, that is a units toggle, not an axis swap.
9. **Rule 41 sweep on your narration.** The register for this concept is where slips happen: the ring does not want, prefer, relax into comfort, escape strain or hide a group. Say "the axial methyl is 274 pm from two hydrogens, closer than they fit".

## Engine needs NOT covered by the drafted `organic_structure` contract

The most valuable output of this dispatch. Full detail in §9; the summary, ordered by severity.

**Two closed-enum gaps that must be fixed BEFORE the enums freeze at S1** — freezing over one wave is the mistake `ORGANIC_ENGINE_PLAN.md` §5 correction 4 exists to prevent:

- **E-1 · `pucker.waypoint` has no `planar` member.** S1's flat ring cannot be named. `mode: lift` is a bond-line-sketch lift via `mgFlatSources`, a different mechanism from a planar ring relaxing into a chair. (N-12)
- **E-2 · `hud_lines` has no `distance` member.** Three states publish a distance in pm and no line can name it. Do not re-purpose `angle`. (N-13)

**Contract fields that do not exist:**

- **N-1 · `show_h`** — per-state hydrogen visibility by atom list. The contract has only `lift.show_implicit_h`. On an 18-atom skeleton this is a correctness requirement, not a convenience.
- **N-3 · off-chair semantics for the axial/equatorial tag.** The contract does not decide what a derived tag reads at the half-chair, and unspecified it will assert a count with no chemical meaning. Proposed: fade the tags off-chair, render `axial — · equatorial —`.
- **N-6 · `min_ring` on `hud_lines`.** It exists on `controls_visible` (`:1323`) and nowhere else. Without it a `core_only` preset shows an energy readout in a sandbox that never taught energy — Rule 38b is not dischargeable until this lands.
- **N-7 · `pucker.draggable`** — pointer-drag on the ring mapping to Δu. Required by the open directive `teach_field3d_explore_grab_and_move_field_point`.
- **N-8 · a `measure: []` instrument family** (`angle` · `distance` · `axis_line` · `plane_disc`, with `reference_value_pm`). The ancestors exist in `molecular_geometry` (`:59210-59248`, `:58541`); the config surface does not.
- **N-9 · the contact metric must be named, and a generic "nearest contact" mode must be impossible.** **MEASURED: the equatorial methyl's nearest ring H is 270 pm, closer than the axial methyl's 1,3-diaxial contact at 274 pm.** A generic readout inverts the lesson.
- **N-10 · `trace: { bond, label, report_tag }`** — a single C–H bond that keeps its identity through the pucker. This mechanism carries the PRIMARY aha; nothing in the contract does it.
- **N-11 · `pucker.walk: []`** — a multi-leg waypoint walk with named holds. The contract gives one destination and one ramp; S5 needs seven legs.
- **N-14 · `compare` layout with a camera-basis lane.** `mode: compare` is in the enum with no layout. A world-axis lane stacks the two chairs under a head-on camera (recorded scar).

**Contract requirements that must be strengthened, not added:**

- **N-2 · the pucker path must pass through the four REAL geometries as knots**, with the gate asserting each waypoint's full ring-torsion set. A linear endpoint interpolation makes S5 three labels on one shape.
- **N-16 · E(u) and pose(u) must read the SAME u**, so the rider and the ring move together (`teach_coordinate_sim_with_graph`). Also note the profile has **two** twist-boat minima flanking the boat maximum, which the draft's four-point table does not spell out.
- **N-15 · the population instrument** — side-by-side bars on one shared scale ceiling, percentages computed by the engine from the published A-value and the live temperature, never authored per temperature.
- **N-4 · the scenario places itself around the origin** for the sight-along and compare states, via one metres-to-world helper. This is the prevention rule of the OPEN scar `field3d_scenario_renders_offcentre_because_camera_target_is_not_authorable`; do not solve it by adding an authorable camera target.

**One contract decision the draft leaves ambiguous:**

- **N-5 · camera pose convention.** The draft says `camera: {az, el, dist}`; the shipped fleet authors `camera_position: [x, y, z]` (verified in `vsepr_molecular_shapes.json`, which uses `[0.67, 5.19, 4.8]`). Since `camera_steps` already speaks az/el/dist, az/el/dist is the coherent choice — but it must be decided, not assumed.

**Already shipped — do NOT rebuild** (Rule 40a sweeps run): `camera_steps` (`:492`, `:12374`, `:63742` — already adopted verbatim once as `vgCamScheduleAt`; this would be the third adoption) · `min_ring` on controls (`:1323`, `:55295`) · `flat_basis` / `mgFlatSources` (`:58494`, `:58970`) · `mgIdealDirs` / `mgFrame` (`:58349`, `:58455`) · the pm-valued span line and `mgPlaceLabelClear` (`:59210-59229`, `:58541`) · `MG_BOND_LEN` (`:58205`).

**Probes the surgeon must run that I could not** (no renderer exists): the perspective re-solve of the HOME camera at real atom disc radii; countability at each of the four pucker waypoints (the chair solve does not transfer); the traced bond's occlusion across the full sweep; the two 1,3-diaxial contact lines' mutual overlap; and the S8 pair's in-frame acceptance at t = 0, at the pin and at state end.
agentId: a9a2f07594e5ea52f (use SendMessage with to: 'a9a2f07594e5ea52f', summary: '<5-10 word recap>' to continue this agent)
<usage>subagent_tokens: 209510
tool_uses: 29
duration_ms: 1262787</usage>