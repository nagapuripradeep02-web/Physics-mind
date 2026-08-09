# Architect skeleton — `cyclohexane_chair_flip`

**Subject:** Chemistry (organic). **Chapter:** NCERT Class 11 Ch.12 *Organic Chemistry — Some Basic Principles and Techniques* / Ch.13 *Hydrocarbons* (cycloalkanes, conformations). Also JEE, IB HL, A-level.
**Concept #4** of `docs/ORGANIC_BUILD_PLAN.md` §4 Wave O-0.
**Renderer:** `field_3d`, `scenario_type: "organic_structure"` — **DOES NOT EXIST YET.** This document is Phase-0 stage **0b**, so it is a specification for the engine as much as a design for the concept. Every state below is `ENGINE-PENDING`; nothing here is certified buildable, and §9 is the list of what must be bought.
**Supersedes as design of record:** the 9-state sketch in `docs/ORGANIC_PHASE0_CONFORMATION.md` §0b. It remains 9 states, but the arc is reordered and two states are replaced — see §2 note.

> **Revision 2 — Checkpoint A fix cycle 1 (2026-08-09).** founder-proxy returned `DESIGN_FIX` on revision 1. Five P1s and nine P2/P3s are applied; the changed sections are §0 (three new disposition rows), §3 (rail titles, S3 cue, per-state `pucker` control), §4 (M1 counter-evidence), §5 (rewritten — the pin is AUTHORED, not formulaic), §7 (`pose` re-ringed, `group` restricted, CBSE cell basis), §9 (the enum ledger rewritten with a two-directional diff; N-19 added; success test corrected), §10 (one measured value re-labelled), §14 (b/e/f), and Block 1's JEE trace. The 9-state arc, its three reworks, S4 as the aha, the Rule-38a ordering and the 20 endorsed engine asks are UNCHANGED.

> **This document is the semantics of record for the `organic_structure` contract fields it touches** (`pucker`, `measure`, `show_h`, camera scheduling, `min_ring` on HUD lines, compare lanes, and the frozen-pin registration). Skeletons for concepts #1/#2/#3/#5 inherit these semantics; a sibling that needs different semantics for a bought field must change THIS document, not fork it. *(Scar: `two_skeletons_sharing_one_engine_build_state_different_semantics_for_the_same_bought_field`, `sibling_skeletons_specify_one_shared_engine_mechanism_in_two_incompatible_documents`.)*

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
| `phase0_config_enum_closed_against_the_spec_driver_not_the_served_concept_set` + `closed_enum_cannot_name_a_substance_the_design_teaches` | **BINDS — and revision 1 discharged it wrongly in BOTH directions.** §9E now carries a **two-directional diff against the O-0 survey union table** (`ORGANIC_PHASE0_CONFORMATION.md:25-40`), shown by line reference: every rendered string of all seven concepts maps to a member, and every member maps to a consumer or to an explicit DEFERRED entry. One revision-1 gap was struck as false (`planar`) and six new members were found, three of them by the reverse direction alone |
| `deferred_enum_members_must_be_declared_not_merely_unimplemented` | **BINDS (P2-6).** `mode` freezes at S1 with its Layer-B and Layer-C members unimplemented. §9E-D requires an IMPLEMENTED list and a DEFERRED list shipped **as data** in the scenario, with the gate asserting union-equals-contract, empty intersection, and no deferred member reaching either the frame pass or the apply pass |
| `architect_declares_an_engine_limit_without_checking_the_per_concept_override_path` + `call_site_enumeration_asserted_exhaustive_without_a_symbol_sweep` + `skeleton_designs_around_an_engine_limit_a_landed_build_already_removed` | **BINDS.** Rule-40a sweeps run on every mechanism I was about to call missing (§9 "Already shipped — reuse, do not rebuild"). Two were **already built** (`camera_steps`, `min_ring`) and are reclassified as reuse |
| `field3d_scenario_renders_offcentre_because_camera_target_is_not_authorable` | **BINDS (S2, S8).** Sight-along and the two-chair compare are solved by the row's own prevention rule — the scenario places itself around the origin via ONE metres-to-world helper — never by authoring a camera target. §9 N-4 |
| `misconception_beat_whose_own_evidence_confirms_the_wrong_belief` | **BINDS (S1).** The flat half of the contrast beat carries its own cost evidence — the arc reads **120.0°** against a drawn **109.5°** reference, wrong by 10.5° — BEFORE the release, so the flat picture never reads as "fine". *(Revision 2: the eclipsed-hydrogen half of this evidence is REMOVED — see §4 and chemistry block §I-2. It is unrenderable at S1's camera with `show_h: 'none'`, and a claim the sim cannot draw is not counter-evidence.)* |
| `delta_cue_restates_the_declared_misconception_verbatim` | **BINDS.** No cue paraphrases a watched belief; checked cue-by-cue in §3 |
| `delta_cue_asserts_the_states_end_condition_so_it_is_false_while_most_of_the_state_plays` | **BINDS — and revision 1 still shipped one violation.** S3's cue was `Six axial, six equatorial`, an end condition false for the first 5.5 s of the state. **Changed to `Two kinds of C–H bond`** (P2-1). All nine cues re-walked; every one now names an action true from t = 0 |
| `misconception_planted_in_core_ring_and_confronted_only_in_a_hideable_ring` | **BINDS.** M3 ("a flipped chair is a different compound") is planted by S4, a core state → confronted in S4 itself, not deferred to S8 |
| `declared_payoff_state_ringed_outside_the_core_preset` | **BINDS.** PRIMARY aha is S4, `depth_ring: core`, inside `foundational` |
| `core_ring_state_shows_value_whose_only_derivation_is_higher_ring` + `core_ring_displays_a_quantity_whose_explanation_lives_in_a_cut_ring` | **BINDS — and revision 1 RECURRED on it.** §7 ringed S9's `pose` HUD line at `core` while `pucker` is also core, so under `core_only` the first drag past u ≈ 0.2 would print *half-chair* / *twist-boat* / *boat* — vocabulary S5 teaches and `core_only` hides. **`pose` is re-ringed to `extended`** (P1-1), and §7 carries the corrected Cut-2 rendered-symbol list |
| `explore_controls_not_ring_gated_survive_the_ring_cut` | **BINDS.** Every S9 control carries `min_ring` (§7) |
| `skeleton_discharges_a_ring_cut_with_a_field_no_renderer_reads` | **BINDS, and is only PARTLY dischargeable today.** `min_ring` on `controls_visible` is real (`field_3d_renderer.ts:1323`, `:55295`). `min_ring` on HUD lines is **not implemented anywhere** — so the Rule-38b cut is declared DISCHARGED-ON-DELIVERY of §9 N-6, not discharged now |
| `explore_state_formula_surface_asserts_a_relation_no_state_derives` | **BINDS.** S9 carries **no formula surface at all** — value-only sandbox |
| `teach_coordinate_sim_with_graph` | **BINDS (S6).** ONE `u` drives the ring pose and the rider on the E(u) curve; no static curve |
| `teach_distinct_reference_lines_for_two_radii` | **BINDS (S3), generalised to two directions.** The ring-axis line and the mean-plane disc are two distinct, separately-labelled references |
| `teach_concrete_before_abstract_compare` | **BINDS (S7).** Axial methyl staged ALONE first, then the flip produces the equatorial case; the side-by-side comparison is S8 |
| `teach_do_not_prespoil_a_later_reveal` | **BINDS.** a/e tags first at S3; waypoint NAMES first at S5; kJ·mol⁻¹ first at S6; the methyl first at S7; A-value/percentages first at S8. S4's flip passes through the intermediates but never labels or costs them — and its `ae_count` HUD reads `axial — · equatorial —` while off-chair rather than naming a shape |
| `teach_visual_must_match_narration` | **BINDS — and it is why S2 was rewritten in revision 2.** S2 makes no claim about the flat ring (off-screen by then) and no claim about eclipsing anywhere in the chair that the chair itself does not show: its subject IS the chair's own six staggered C–C bonds, rendered in a Newman view. Every counted thing is countable (§8) |
| `nlb_frozen_pin_lands_within_one_frame_of_the_beat_the_dod_asserts_it_shows` + `skeleton_pin_budget_names_the_phase_start_instead_of_the_last_asserted_reveal_inside_it` + `frozen_pin_unbudgeted_on_a_sequential_misconception_state_can_archive_the_wrong_picture` | **BINDS — and revision 1 satisfied it against the WRONG pin law.** The `0.60·R` clamp is one scenario's local heuristic, not the fleet rule (§5 preamble; §9 N-19). §5 is now a table of **authored pin candidates in ms**, one per state, each ≥ 500 ms after that state's last asserted reveal. S1's pin is still deliberately budgeted **after** the pucker so the frozen frame can never archive the flat ring |
| `authored_beat_ends_by_undoing_the_state_own_claim` | **BINDS (S4).** The flip is a SINGLE pass to chair′ then holds; it must not loop back and undo the swap |
| `gallery_walk_steps_across_values_the_underlying_model_cannot_distinguish` | **BINDS (S5).** The pucker path must pass through the REAL geometries as knots. A linear interpolation of endpoint coordinates would render three labels on one shape — §9 N-2 makes the knots an engine requirement and a gate assertion, and chemistry block §A-7 supplies the torsion signature each knot must reproduce |
| `nlb_multibody_lane_gap_is_along_z_so_a_head_on_camera_stacks_the_compared_bodies` + `energy_layer_two_body_groups_stack_vertically_so_a_bar_height_compare_is_not_side_by_side` | **BINDS (S8).** The two chairs lane along the CAMERA's screen-right axis; the two population bars are side by side, sharing one scale ceiling |
| `nlb_motion_archetype_declared_from_a_between_state_delta_or_a_teacher_driven_control` | **BINDS.** All nine archetypes are in-state motions; none is a between-state delta and none (except S9) is teacher-driven |
| `skeleton_exposes_a_control_on_a_parameter_a_state_schedule_already_owns` | **BINDS — and revision 2 deliberately takes the exposure, with the row's own remedy.** S4/S5/S7 now expose `pucker` (P2-5), but the slider row is **inert while the scripted pass runs and seizes on the teacher's first drag** (Rule 39b drag-seize, `bscControlList`/`_row` conventions, `:55294`, `:1313`). Because each of those states is a SINGLE scripted pass that then holds, the schedule has completed before any realistic seizure, so there is no contention window to lose. S1–S3, S6 and S8 expose nothing driven by a schedule; S8's `temperature` is driven by no schedule at all |
| `derived_readout_asserted_by_value_without_defining_its_metric` | **BINDS (S7) — and the probe proved why.** The contact metric is DEFINED in §3/§8 as the two named 1,3-diaxial contacts, methyl-carbon centre to ring-H centre, against the 290 pm van der Waals sum. A generic "nearest contact" readout is BANNED: measured, it reads 270 pm for the *equatorial* methyl and would contradict the narration |
| `hud_qualifier_appears_and_disappears_mid_sweep_and_the_skeleton_declares_the_label_constant` | **BINDS.** The `ae_count` line has exactly TWO string shapes, both declared: `axial 6 · equatorial 6` in a chair, `axial — · equatorial —` off-chair (§9 N-3) |
| `taught_variable_has_no_rendered_physical_correlate_so_a_text_label_is_the_only_cause` | **BINDS (S8).** Population is a filled bar over two rendered chairs, never a text ratio alone |
| `measured_equality_is_an_identity_at_the_authored_home_pose` | **BINDS (S4) — and revision 1 then bound the aha's final clause to that very identity.** `axial 6 · equatorial 6` reads the same at u = 0 and u = 1 and therefore proves nothing. **N-10 is generalised from one bond to a SET** (P1-4): the six bonds that *started* axial keep an origin-identity tint through the whole sweep and are visibly equatorial at u = 1, they re-glow once as a set after the traced bond, and the narration's final clause binds to that set, not to the count |
| `existing_hud_line_reused_for_a_different_physical_quantity` | **BINDS, twice.** The new `distance` line is new, not `angle` re-purposed; and the new `bond` line is new, not `pose` re-purposed (chemistry block §H-10 E-3) |
| `symbol_printed_on_canvas_before_the_lesson_defines_it` | **BINDS.** Gating listed under `teach_do_not_prespoil_a_later_reveal` above, and re-checked for the sandbox under both preset cuts in §7 |
| `oncanvas_formula_asserts_a_value_the_renderer_cannot_show` + `formula_surface_states_an_identity_in_a_unit_the_hud_never_renders` | **BINDS.** S6's surface is `barrier = 45 kJ·mol⁻¹` and the HUD renders kJ·mol⁻¹; S8's surface is a symbolic ratio that resolves through the bars to the percentages the HUD renders (chemistry block §I-3, §I-4 adopted) |
| `skeleton_anchor_specified_in_section_9_reaches_no_narration_line` + `real_world_anchor_declared_in_the_skeleton_with_no_state_and_no_word_budget` | **BINDS.** The anchor is a state assignment with a reserved word budget (§6): S1 ≈ 12 words, S8 ≈ 15 words |
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
| `state_added_at_review_outruns_the_config_contract_shape` | **BINDS at Checkpoint A, and revision 2 exercised it.** S2's restored torsional payoff (P1-5) was re-checked against §9 before acceptance: it needs the existing `phi` HUD member and the already-asked `bond` member, and **no new engine capability** |
| `chemistry_concept_id_collides_with_rostered_physics_id` | **BINDS, satisfied.** `cyclohexane_chair_flip` collides with no id in `src/data/concepts/*.json` |
| `teach_field3d_explore_grab_and_move_field_point` | **BINDS (S9).** The teacher grabs the ring and drags it through the flip — direct manipulation, not a slider alone (§9 N-7) |
| `architect_scar_audit_claims_completeness_while_skipping_open_rows_on_the_scenario_it_extends` | **BINDS.** `organic_structure` has no rows (it does not exist). The scenarios it REUSES from (`molecular_geometry`, `orbital_shapes`, `bonding_scene`, `vector_geometry_3d`) DO carry rows; enumerating them verbatim is a deliverable of the S1 dispatch brief, and §9 names each reuse site so the surgeon can query them |
| `prior_rulings_and_internal_ledgers_are_not_re_run_over_the_states_a_restructure_creates` | **BINDS, and revision 1 FAILED it once.** S2 was added in revision 1 for a torsional rationale that chemistry block §I-2 then withdrew as unrenderable, and the arc was never re-run over the surviving state. §2 change-2 is rewritten and S2 re-earns its row (P1-5). §0 was re-run over the revised nine states, not inherited |

### Rows dispositioned N/A, by named group, with reason

- **The `nlb_*` family** (`nlb_work_bar_zero_crossing_reading_is_unrenderable_at_teaching_speed`, `nlb_angle_arc_to_displacement_measures_net_travel_so_it_hides_after_a_turnaround`, `nlb_sandbox_energy_envelope_computed_from_the_seed_lap_instead_of_the_full_wrap_span`, `nlb_frictionless_state_with_an_opposing_applied_force_reverses_and_unwinds_its_own_work_ledger`, `nlb_checkpoint_s_m_authored_as_displacement_not_track_coordinate`, `nlb_sandbox_default_mu_below_tan_theta_drifts_the_block_to_the_track_bound_and_falsifies_its_own_claim`, `nlb_loop_reset_clears_checkpoint_stamp_and_frozen_pin_can_photograph_an_empty_formula`, `nlb_static_state_authored_on_the_track_bound_fires_a_false_clamp_alarm`, `nlb_checkpoint_W_capture_renders_the_work_bar_label_so_the_authored_stamp_string_never_ships`, `nlb_lane_offsets_apply_to_declared_bodies_not_co_present_ones_so_sequential_phases_split_laterally`) — **N/A: `newtons_laws_body` scenario, integrator-driven mechanics.** `organic_structure` is closed-form-in-t with no integrator, no track, no work ledger. The **two exceptions** (`nlb_multibody_lane_gap...`, `nlb_frozen_pin...`) are dispositioned as BINDING above, because their prevention rules are geometry/timing rules that generalise. **One further correction in revision 2:** the `clamp(0.60·R, …)` formula quoted from that family in revision 1's §5 is *local to the `nlb` branch* and must not be generalised — see §5 and N-19.
- **The `pcpl_*` / `vg_*` / parametric family** (`pcpl_locus_trace_sweep_parameter_exposed_as_a_slider_collapses_the_curve`, `vg_flip_state_draws_two_equal_magnitudes_at_unequal_screen_lengths`, `camera_frame_fill_reported_in_isotropic_tangent_units_as_a_fraction_of_frame_height`, `authored_window_floor_and_authored_window_centre_are_mutually_unsatisfiable`, `worked_loop_resize_patch_bounded_at_the_pin_instant_instead_of_the_loop_end`, `one_measured_viewport_recorded_as_the_invariant_sim_size_in_the_chapter_state_file`, `shared_bar_scale_cross_state_guarantee_is_void_when_the_panel_reflow_ladder_drops_a_step`) — **N/A: different engines (PCPL / `vector_geometry_3d`) or mathematics-chapter artefacts.** One clause is adopted anyway: `camera_frame_fill...`'s isotropic-units rule is written into the §8 camera acceptance criteria, because my own camera solve is a screen-separation metric and the same shearing trap applies.
- **Reaction/kinetics rows** (`batch_box_rate_ratio_pinned_to_an_earlier_value_measures_the_run_down_not_the_disturbance`, `state_end_of_loop_energy_numbers_derived_at_a_different_t_than_the_travel_table`, `fleet_constant_transplanted_across_a_reversible_to_irreversible_regime_boundary`, `explore_state_runs_its_reaction_to_completion_and_has_no_teacher_facing_rerun`, `density_raised_for_the_noise_floor_without_costing_what_it_does_to_the_run_length`) — **N/A: no reaction, no kinetics, no stochastic particle box in this concept.** The O-0 alarm ledger explicitly excludes bond breaking; the chair flip is a conformational change within one molecule.
- **Rows about already-shipped-registry hygiene** (`registry_id_fix_applied_to_the_reported_row_and_never_swept_across_the_registry`, `operating_manual_carveout_names_one_subject_namespace_and_omits_its_identical_sibling`, `checkpoint_scar_candidates_written_to_a_sql_file_and_never_applied...`) — **N/A to a skeleton**; they bind the dispatching session's registry and queue hygiene, and the last one binds the founder's own instruction that the session applies scar SQL rather than leaving it in a file.
- **Remaining architect rows not named above** (`narration_attributes_an_effect_to_a_cause_the_model_does_not_contain`, `skeleton_asserts_a_sibling_concepts_camera_pose_from_memory_instead_of_reading_its_shipped_json`, `contrast_ghost_coresident_with_the_real_set_fuses_both`, `concept_taught_its_own_quantity_without_the_canonical_picture`, `field3d_rule16a_belief_unbuildable_for_want_of_a_rod_primitive`, `lesson_never_states_the_principle_it_is_named_after`, `skeleton_claims_a_readout_accumulates_while_the_renderer_redraws_the_full_series_every_frame`, `skeleton_designs_against_a_renderer_flag_whose_behaviour_was_removed_but_whose_type_comment_was_not`, `merged_spec_omits_an_instrument_two_states_depend_on_and_the_nearest_existing_chip_measures_a_different_quantity`, `reviewer_accepts_a_residual_on_an_inferred_visual_premise_instead_of_measuring_it`, `skeleton_asserts_a_held_comparison_value_at_an_instant_the_faster_body_has_already_passed`, `architect_authors_a_force_triangle_whose_ratio_exceeds_the_renderer_arrow_maps_dynamic_range`, `engine_extension_replaces_a_shared_constant_without_an_absent_field_fallback_clause`, `skeleton_authors_a_multi_phase_state_on_an_engine_with_no_per_body_activation_time`, `velocity_arrows_routed_through_a_force_arrow_map_collapse_their_ratio_and_cannot_draw_a_true_zero`, `architect_reuses_a_marker_mechanism_without_diffing_the_side_effects_its_presence_switches_on`, `skeleton_authors_a_timed_reveal_chain_of_overlays_on_a_scenario_whose_overlay_config_is_static`, `signed_engine_union_drops_items_its_own_state_table_still_consumes`, `skeleton_authors_a_second_timed_action_after_the_engine_buy_was_scoped_to_one_instant`, `derivation_principle_applied_to_one_beat_but_not_its_sibling`, `teach_inverted_scenario_inverts_cutline_flags`, `rewind_path_assertion_stops_at_the_function_body_and_never_follows_its_calls`, `close_camera_framed_extent_is_authored_as_the_run_length_and_omits_the_body_radius`, `correspondence_state_stages_cause_first_as_a_head_start_so_the_equal_quantities_are_drawn_unequal`, `trend_sweep_changes_the_drawn_objects_shape_midway_so_the_silhouette_change_outweighs_the_taught_change`, `calibration_discipline_propagated_to_a_state_whose_measurement_did_not_cover_it`) — **each SATISFIED-BY-CONSTRUCTION rather than N/A**, because they are all instances of one discipline this document follows throughout: name the mechanism, check it exists, define its metric, and state the number the sim will print. Four deserve a specific note:
  - `skeleton_asserts_a_sibling_concepts_camera_pose_from_memory_instead_of_reading_its_shipped_json` — I do NOT claim VSEPR's camera. I read `src/data/concepts/chemistry/vsepr_molecular_shapes.json` and it authors `camera_position: [0.67, 5.19, 4.8]` (a vector), **not** `az/el/dist`. My camera numbers come from my own solve (§8/§10), and §9 N-5 records that the drafted `camera:{az,el,dist}` shape differs from the fleet's `camera_position` convention — a contract decision the surgeon must make, not an assumption I inherit.
  - `rewind_path_assertion_stops_at_the_function_body_and_never_follows_its_calls` — **revision 1 committed exactly this** by quoting the `nlb` clamp as the player's pin law without following `maxRevealForField3dState` to its `Math.max(...candidates)` return and to the per-scenario candidate pushes. The call chain is now walked and cited in §9 N-19.
  - `signed_engine_union_drops_items_its_own_state_table_still_consumes` — §9 is diffed against §3 state by state; every instrument named in §3 has a §9 row, and §9E adds the reverse diff against the seven-concept survey union.
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

**Where I dispute the build plan:** nowhere on tier. But `ORGANIC_BUILD_PLAN.md` §8 schedules this **third** (after #1 bond-line and #2 ethane). That order is right for shipping and wrong for one thing worth stating: S2 of this design (sight down a C–C bond of the chair, every C–C bond staggered) is a slice of concept #2, and S7's A-value is 2× concept #3's gauche interaction. If #2 and #3 ship first, this concept's S2 becomes a shorter callback. **I have deliberately authored S2 to stand alone** (Rule 23 — prerequisites are advisory, never gating), and flagged in §11 that it may be trimmed if #2 ships first and the founder wants the time back.

---

## §2 — Atomic claim and state arc

**Atomic claim (one sentence):** This concept teaches that cyclohexane is puckered into a chair which continuously flips into an equivalent chair, and that this flip exchanges every axial bond for an equatorial one — and only that. It does **not** cover ring strain in other ring sizes (deferred to a future `ring_strain` concept), does not cover disubstituted cis/trans ring isomers (deferred), does not cover fused rings or decalin, and does not derive the conformational energies (they are published, not computed).

**Nine states: 4 core · 3 extended · 1 advanced · 1 explore (core).** State count is complexity-driven (Rule 11). The §5 calibration table puts this at "complex, 7–9"; nine is the top of that band and it earns it: the concept carries a geometry claim, a motion claim, a labelling claim, an energy claim and a population claim, and each of the five needs the one before it.

**Changes from the `ORGANIC_PHASE0_CONFORMATION.md` §0b sketch, and why:**

1. **The sketch's first two beats (the ring relaxes; and *why* it relaxes) are MERGED into one contrast state.** They are the two halves of a single Rule-16a contrast beat — the wrong expectation's consequence, then the real physics. Split across two states, the first state's motion happens before its own reason, and the second state has no motion of its own.
2. **A new state is added: sight down a C–C bond of the CHAIR, where every bond is staggered.** *(Rationale rewritten in revision 2 — the revision-1 rationale is withdrawn.)* Revision 1 justified this state by "a flat ring eclipses all twelve C–H bonds". Chemistry block §I-2 proved that unrenderable: S1 runs `show_h: 'none'`, and at S1's FACE-ON camera a planar ring's hydrogens lie in the image plane pointing radially outward, so eclipsing is invisible there by construction. **The surviving justification is a claim about the CHAIR, made on a picture that is on screen throughout:** sight down any of the chair's six C–C bonds and the bonds on the two carbons are staggered — all six read the same — so nothing is eclipsed anywhere in the chair, and that is why the chair is the low-energy shape. That claim is the concept's only account of *why* the chair specifically (S1 shows only that flat is impossible, not which puckered shape wins), it is the state the U5 sight-along camera is bought for, and **S5 pays it off**: chemistry block §A-7 measures the boat's ring torsions as `+54.9, 0.0, −54.9, +54.9, 0.0, −54.9` — **two bonds at exactly 0.0°, fully eclipsed** — which is the definitional difference between the boat and the twist-boat and the gate assertion §G-4 already runs on. So the word "staggered" is defined at S2, used as the chair's reason at S2, and cashed at S5 against a measured zero. The payoff costs one clause and a `phi` HUD line; **no new engine capability** (`phi` is already an enum member).
3. **The sketch's states 4 and 5 (the flip; then the swap) are REORDERED and re-scoped.** The sketch shows the whole flip first and names the swap after. That pre-spoils the payoff — the swap is plainly visible in the full flip — and it puts the aha late. Here **S4 is the flip WITH one bond traced and the origin-axial SET tinted, and the swap IS S4** (the aha, in core, inside `foundational`), while the naming of the intermediate shapes moves to S5 where it motivates the barrier.
4. **The sketch's state 6 is split in its emphasis:** the shapes-in-between (S5) and the energy cost (S6) are two ideas, and one 25–55-word budget cannot hold both.

Net: same nine states, different four.

**Was eight states considered?** Yes, in revision 2, when S2's original rationale collapsed. Cutting S2 would leave the concept unable to say why the chair rather than any other puckered shape, would strand the U5 sight-along camera on a wave whose other consumers (#2, #3) are not yet built, and would leave S5's boat-versus-twist-boat distinction resting on an undefined word. **Decision: restore, do not cut** — the state is kept, its narration is rewritten around a rendered claim, and its budget rises 44 → ~52 words, still inside Rule 31.

---

## §3 — Per-state control table (Rule 31, the required design artifact)

Word budgets are EN narration. Guided = 25–55 words. Every archetype is an **in-state motion**. `depth_ring` per Rule 38a. **Rail title** is the string the reorderable state rail shows (Rule 41d — the rail truncates, so the first words carry the meaning; the state `id` is a topic label and is NOT the title).

| # | State id | **Rail title** | Teaches (ONE thing) | Motion archetype | Delta (the ≤5-word on-canvas cue) | Live controls | Words | Ring | `advance_mode` |
|---|---|---|---|---|---|---|---|---|---|
| 1 | `ring_is_not_flat` | **Cyclohexane is not flat** | a flat ring forces 120° at every carbon, which carbon cannot hold; released, the ring puckers into a chair at 111° | **flatten→relax** *(the declared Rule-16a contrast beat)* | "Flat drawing, then chair" | none | 45–52 | core | `manual_click` |
| 2 | `every_bond_is_staggered` | **Every bond is staggered** | sight straight down a C–C bond of the chair: the bonds on the two carbons are staggered, all six C–C bonds read the same, so nothing in the chair is eclipsed | **sight-along bond walk** | "Sight down a bond" | none | 45–52 | core | `auto_after_tts` |
| 3 | `axial_and_equatorial` | **Axial and equatorial bonds** | the chair has two kinds of C–H bond: six axial, nearly parallel to the ring axis, and six equatorial, splayed near the ring plane | **two-family reveal** | "Two kinds of C–H bond" | none | 40–50 | core | `manual_click` |
| 4 | `the_flip_swaps_them` | **The flip swaps them** | **PRIMARY AHA** — follow one axial bond through the flip: it ends up equatorial, and so does every other bond that started axial, and no bond ever broke | **follow-one-bond through the pucker** | "Follow one axial bond" | `pucker` (drag-seize, after the scripted pass) | 45–55 | core | `manual_click` |
| 5 | `shapes_in_between` | **Shapes in between** | the ring passes through named shapes on the way — half-chair, twist-boat, boat — and in the boat two C–C bonds are fully eclipsed and two hydrogens are pushed together | **waypoint step with holds** | "Named shapes in between" | `pucker` (drag-seize, after the scripted walk) | 46–55 | extended | `manual_click` |
| 6 | `the_barrier` | **Energy along the flip** | the flip's highest point is 45 kJ·mol⁻¹ above the chair, low enough that the ring flips constantly at room temperature | **curve-and-rider** (E(u) graph, point riding, ring in sync) | "Energy along the flip" | none | 45–55 | extended | `auto_after_tts` |
| 7 | `a_methyl_on_the_ring` | **A methyl group on the ring** | an axial methyl group sits 274 pm from two hydrogens on the same face — closer than a carbon and a hydrogen fit; after the flip it is equatorial and 425 pm clear | **substituent + contact-line reveal, then the flip** *(the declared contrast pair with S4)* | "A methyl on the ring" | `pucker` (drag-seize, after the scripted pass) | 45–55 | extended | `manual_click` |
| 8 | `how_many_of_each` | **How many of each chair** | at room temperature the ring sits 95 : 5 in favour of the equatorial methyl | **population bar fill over a laned pair** | "How many of each chair" | `temperature` | 40–50 | **advanced** | `manual_click` |
| 9 | `explore` | **Explore** | teacher sandbox | **drag-sandbox** (grab the ring and flip it by hand) | "Move the ring yourself" | ALL, ring-gated (§7) | 0 / open | core | `interaction_complete` |

**On the per-state `pucker` control (P2-5, new in revision 2).** S4, S5 and S7 each run ONE scripted pass and then hold; exposing `pucker` on them turns a held final frame into a teacher-manipulable one at zero engine cost, and it puts a control on the aha state, which previously had none. The scar `skeleton_exposes_a_control_on_a_parameter_a_state_schedule_already_owns` is answered by drag-seize (Rule 39b): the row is present but inert until the teacher's first drag, after which the schedule yields for the remainder of the state. The row occupies the same screen position in all four states that carry it (S4, S5, S7, S9) — Rule 31's shared-slider requirement.

**No archetype repeats, and the one near-repeat is declared.** S4 and S7 both contain a pucker sweep. They are the **declared contrast pair**, and the delta names the flip: **S4 flips a bare ring, where the two chairs are identical and the swap is symmetric; S7 flips a substituted ring, where the two chairs are no longer equivalent and the swap now has a consequence.** That is the whole argument of the second half of the concept, and staging it as a contrast pair is the point rather than a concession. S4's motion is a traced bond plus a tinted origin-set over a continuous sweep; S7's is a substituent placement, two contact lines, and then the sweep — different focal, different instrument, different claim.

**Rule 32a — cause before effect, per state:**
- S1: the flat ring is held with its 120° arc and its dimmed 109.5° reference for 1.8 s before anything moves; the camera then re-frames while the molecule stays rigid; only then does the pucker start. Three strictly sequential phases, never simultaneous.
- S2: the camera arrives on the bond axis and settles (cause: the viewpoint) before the torsion arc and its value are drawn (effect: the reading).
- S3: the axial family draws in and glows, completes, and **only then** the equatorial family begins.
- S4: the traced bond is marked and held for 1.5 s before the flip starts. The mark is the cause of attention; the flip is the effect. The origin-set re-glow comes strictly AFTER the traced bond's re-label, never with it.
- S6: the E(u) curve draws in fully before the rider and the ring begin to move together.
- S7: the methyl appears (cause), then the two contact lines draw to it (effect) 700 ms later, then the flip.

**Rule 32b — only the taught variable moves.** No idle spin anywhere in S1–S8. The apparatus is a single molecule; a background rotation would compete with every one of these motions. (`spin` exists only in S9 — see §9 N-20 for its axis.)

**Rule 32d — home pose.** All nine states show ONE cyclohexane ring at ONE scale about the origin. The camera has exactly three poses across the concept: **HOME** (the solved pose, §8), **FACE-ON** (S1's opening, the flat ring in the image plane), and **SIGHT-ALONG** (S2). Every change between them is an eased, scheduled camera step inside a state, never a cut between states — S1 ends at HOME and S3 onward stay at HOME, so the only in-concept camera travel is S1's opening tilt and S2's out-and-back.

**Rule 32e — one glow focal at any instant.** S3 is the strict case: the axial family glows alone, then dims to a held tint before the equatorial family glows. S4 is the second strict case now that it carries two marked things: only the traced bond glows during the sweep (the origin-set carries a *tint*, not a glow), and the origin-set's single re-glow is scheduled 500 ms after the traced bond's re-label has finished, so the two never glow together.

**Rule 29 — brightness, never size.** Nothing zooms. The only lengths that change are the ones that physically change: bond directions during the pucker, the contact lines in S7, the population bar in S8, and the rider's position on the curve in S6.

**Rule 41 check on every cue, title and label.** "chair", "boat", "twist-boat", "half-chair", "axial", "equatorial", "staggered", "eclipsed" are the standard chemistry words and are used bare. Banned and absent: any phrasing in which the ring wants, prefers, likes, hides, escapes, relaxes-into-comfort, or is happier; "the bond prefers to hide"; "all yours"; "flips to escape strain"; and (caught in revision 2 via chemistry block §I-9) "the flip **costs** energy", which is an economic metaphor — S6's cue is `Energy along the flip`. Where a cause must be stated, the plain literal form is used: "the axial methyl is 274 pm from two hydrogens, closer than they fit", never "the methyl is uncomfortable". Rail titles are literal and front-loaded.

---

## §4 — Misconception plan (Rule 16a — proactive, inside EPIC-L, no predict-pause)

Three entries. All three are genuine documented student errors; none is manufactured, and six of the nine states carry **no** `misconception_watch` at all.

| id | State | Belief | Visual counter (the contrast beat) | One-line fix |
|---|---|---|---|---|
| **M1** | **S1** | "Cyclohexane is a flat hexagon — that is how it is drawn." | The flat ring is drawn and held with its own consequence visible and measured: the C–C–C arc reads **120.0°** beside a dimmed reference arc drawn at **109.5°** — wrong by 10.5°. Then it is released and puckers: the arc closes to **111.4°** and settles on the reference. Both pictures are shown, back to back, no question asked | "A carbon bond angle is about 109.5°, so the ring cannot stay flat." |
| **M2** | **S3** | "Axial and equatorial are fixed labels — carbon 1 is the axial one." | S3 shows both kinds on the SAME carbon: every ring carbon has one axial and one equatorial C–H bond. The reveal is per-carbon, one bond at a time around the ring, so the picture the student forms is "every carbon has one"; the HUD then reads `axial 6 · equatorial 6` over six carbons | "Axial and equatorial describe a bond's direction, not which carbon it is on." |
| **M3** | **S4** | "The flipped chair is a different compound — something must have broken." | Through the whole flip the six ring bonds are drawn continuously and never break; the formula surface holds **C₆H₁₂** unchanged from the first frame to the last, and the traced bond keeps its identity and its label the entire way. The same twelve hydrogens are on the same six carbons at the end | "No bond breaks — the ring only changes shape, so it is the same compound." |

**Revision 2 — M1's counter-evidence is narrowed to the angle alone.** Revision 1 also claimed "all twelve C–H bonds exactly eclipsed" as visible counter-evidence at S1. Chemistry block §I-2 is right that this cannot be rendered: S1 runs `show_h: 'none'`, and at FACE-ON a planar ring's hydrogens lie in the image plane, so eclipsing is invisible from that direction even if they were shown. **The claim is dropped from S1's narration entirely** — a Rule-16a contrast beat may only cite evidence the sim draws (Rule 24, reads sound-off). The angle evidence is quantitative, immediate and fully rendered, and it is enough. The torsional half of the argument is not lost: it is carried by S2, on the chair, where it IS renderable, and cashed at S5's two 0.0° boat torsions.

**M1 is the state-1 contrast beat.** It is the right choice because it is the belief the student arrives with already fully formed (every drawing they have seen is flat), and because its counter-evidence is quantitative, immediate and drawn.

**M3 is planted in a core state and therefore confronted in a core state** (scar: `misconception_planted_in_core_ring_and_confronted_only_in_a_hideable_ring`). It would be natural to leave "same compound" for S8's pair, but S8 is advanced and disappears under two presets, so the confrontation lives in S4 where the belief is created.

**No EPIC-C branches.** EPIC-L-first directive (2026-06-10); branches deferred until real student data exists.

**Cue cross-check** (scar `delta_cue_restates_the_declared_misconception_verbatim`): S1's cue is "Flat drawing, then chair" — it names the state's action, not the belief; it does not say "the ring is flat". S3's cue is "Two kinds of C–H bond" — an action true from t = 0, and it names neither carbon nor permanence. S4's cue is "Follow one axial bond" — an instruction, not the swap. No cue paraphrases a watched belief.

---

## §5 — Choreography timing and the frozen-pin budget

**The pin is AUTHORED, not formulaic. Revision 1's preamble was wrong and is replaced.** `clamp(0.60·R, 150, R−150)` exists at exactly ONE site in the tree — `src/lib/validators/visual/deriveStateMeta.ts:3213`, inside the `nlb` (`newtons_laws_body`) branch — and it is that scenario's local heuristic. The fleet rule is `maxRevealForField3dState()` (`:1087`), which returns `Math.max(...candidates)` when a scenario has pushed candidates and `DEFAULT_REVEAL_MS = 1500` (`:698`) when it has not (`:3520`). **Each scenario authors its own candidates**: `molecular_geometry` at `:2079-2090`, `bonding_scene` at `:2118-2129`. **With no `organic_structure` branch, every state of this concept would pin at 1500 ms — before every payoff in the table below.** Supplying the branch is engine need **N-19**, and the `Pin` column below IS its input data.

Requirement on every row: the pin lands **after** the state's last asserted reveal `L`, with margin ≥ 500 ms (the recorded floor is 167 ms / 10 frames; 500 is the budget I hold). Requirement on every `R`: **R ≥ N + 500 ms**, where `N` is the narration duration at chemistry block §D-0's 2.75 words·s⁻¹ — Rule 31's "motion may outrun narration, never the reverse".

**Duration recomputation (P1-3).** Chemistry block §I-1 proposed 162 s of guided runtime, derived from two constraints. One of them — `R ≥ (L + 167)/0.60` — was invented by revision 1's false pin law and does not exist. Re-run against the real constraint alone (`R ≥ N + 500 ms`), the floor is **≈142 s** of guided runtime. The authored total below is **145.0 s**: seven states sit at their floor, and S5 alone exceeds it because its choreography (a seven-leg waypoint walk with holds) genuinely needs 17.0 s of motion, which is Rule 31's permitted direction.

| # | R (ms) | N (s) | Beats (`at_ms` → `at_ms + ramp_ms`) | L (last asserted reveal) | **Pin (ms)** | What the frozen frame shows | Margin |
|---|---|---|---|---|---|---|---|
| 1 | **19000** | 18.5 | flat ring held at FACE-ON, `show_h: 'none'`, arc `120.0°` 0–1500 · dimmed `109.5°` reference arc 1200–1800 · camera FACE-ON→HOME 1800–3600 (molecule rigid; the arc holding at 120.0 through the move is the proof it is a re-frame, not the fold) · `pucker_amplitude` 0→1 at u = 0, 4200–7800; arc closes to `111.4°` · hold 7800–19000 | 7800 | **12000** | the chair at HOME, arc **111.4°** settled on the reference | 4200 ms — deliberately far AFTER the pucker, so the frozen frame can never archive the flat ring |
| 2 | **16500** | 16.0 | camera HOME→SIGHT-ALONG(C1–C2) 0–2500, Newman rim convention, `show_h: ['C1','C2']` · torsion arc + HUD `φ = 54.9°`, `bond = C1–C2` 2500–3200 · hold to 4500 · step to C2–C3 4500–5200 · hold to 7200 · step to C3–C4 7200–7900 · third identical reading published 7900–8400 · hold 8400–16500 | 8400 | **11000** | the Newman view down C3–C4, φ **54.9°**, the third of three identical readings | 2600 ms |
| 3 | **17000** | 16.4 | camera SIGHT-ALONG→HOME 0–1200 · axial family draws one bond per carbon around the ring 1500–3000, glows 3000–4200, dims to held tint 4200–4600 · equatorial family draws the same way 5000–6800, glows 6800–7800 · `ring axis` line + `ring plane` disc 8000–8600 · the C–C–H arc on the certified carbon, labelled `109.5°`, 8600–9200 · hold 9200–17000 | 9200 | **11000** | both families tinted, both reference lines up, the C–C–H arc drawn, HUD `axial 6 · equatorial 6` | 1800 ms |
| 4 | **18000** | 17.5 | mark the traced bond, label `C1 axial` 800–1800 · **tint the six origin-axial bonds as a set** 1800–2400 · hold 2400–3300 · **single-pass** flip u 0→1, 3300–11000 (`ae_count` reads `axial — · equatorial —` while off-chair) · traced bond re-labels `C1 equatorial` 11000–11200 · **the origin-set re-glows once, sequentially after it,** 11700–13500 · hold 13500–18000 | 13500 | **14200** | chair′; the traced bond labelled equatorial AND all six origin-axial bonds visibly equatorial in their origin tint | 700 ms. **Single pass, no loop-back** — a loop would undo the state's own claim |
| 5 | **20000** | 16.7 | chair 0–1500 · →half-chair 1500–3000, hold to 4500 · →twist-boat 4500–5800, hold to 7300 · →boat 7300–8600 · flagpole contact line + the drawn 240 pm H+H reference 8600–9600 · **HUD `φ = 0.0°` on the named eclipsed ring bond** 9600–10200 · hold to 13000 · return legs 13000–17000 · chair′ hold 17000–20000 | 10200 | **12000** | **the boat**: flagpole contact drawn and labelled, the 240 pm reference beside it, and `φ = 0.0°` published on the eclipsed bond | 1800 ms. The boat is the frozen frame deliberately: it is the state's most informative single picture, and it carries S2's payoff |
| 6 | **19000** | 18.2 | curve draws 500–2500 · rider + ring sweep together on ONE u, 3000–10000 · barrier bracket from the chair level to the peak + surface `barrier = 45 kJ·mol⁻¹` 10200–10800 · hold 10800–19000 | 10800 | **12500** | full curve, rider at chair′, the barrier bracket drawn, surface `barrier = 45 kJ·mol⁻¹` | 1700 ms |
| 7 | **19000** | 18.5 | methyl appears axial + surface `C₇H₁₄` 800–1800 · two contact lines draw to C3 and C5 2500–4000 · labels `CH₃···H = 274 pm` + the `290 pm` reference hold to 5500 · flip 5500–9000 · equatorial contact line `425 pm` 9200–10200 · hold 10200–19000 | 10200 | **12000** | equatorial methyl, the 425 pm line up, the two 274 pm lines gone, the 290 pm reference still drawn | 1800 ms |
| 8 | **16500** | 16.0 | the two chairs lane into place along screen-right 500–2000 · bars fill against one shared ceiling 2500–5000 · live-bound percentage labels 5000–5400 · `temperature` control live from 6000 · hold | 5400 | **10000** | both chairs laned, bars at 95 : 5, both labelled from the live computation | 4600 ms |
| 9 | — | 0 | continuous (Rule 37 — `interaction_complete` skips the freeze; the clock free-runs) | — | none | — | — |

**Guided total 145.0 s** (floor 141.8 s). *(Scar `skeleton_choreography_written_in_tween_vocabulary_the_engine_renders_as_a_cut`: every transition above is an explicit `at_ms` + `ramp_ms` pair, not a verb.)*

**Handoff note to chemistry-author.** These `R` values differ from chemistry block §D-0's proposal (162 s) only because the second constraint it was solving against does not exist. The block's beat *structure*, clause ordering and word counts are adopted unchanged; only the total runtime shrinks. Where a block beat table quotes an absolute ms that no longer fits its state's `R`, this table governs and the block's windows scale proportionally.

---

## §6 — Real-world anchor (Rule 35 — universal, culture-neutral)

**Primary — sugar and cotton fibre, assigned to S1 (≈12 words of its 45–52 budget) and S8 (≈15 words of its 40–50).**

Glucose is a six-membered ring and it sits in a chair, exactly like cyclohexane. In its common form every bulky group on that ring points equatorial. Cellulose — the material of cotton fibre and of wood — is a long chain of these all-equatorial rings. The shape of the ring is part of what the material is.

- **S1 placement (≈12 words):** one clause naming the ring as the skeleton of the sugar in food and of cotton fibre. This is a grounding, not a payoff — it pre-spoils nothing, because S1 says nothing about equatorial preference. Placed as the **closing** clause of S1, not the opening: as an opener it delays the fold past the pin and archives the flat ring (chemistry block §D-1/§I-9).
- **S8 placement (≈15 words):** the payoff clause — in glucose the bulky groups all sit equatorial, for the reason just shown.

**Overclaim dropped** (chemistry block §H-7, adopted): the sim must NOT say "which is what makes cellulose rigid". Cellulose's stiffness needs the all-equatorial β-1,4 geometry *and* interchain hydrogen bonding into microfibrils; attributing it to the equatorial arrangement alone is a half-truth a teacher corrects in front of the class.

**Secondary anchor DECLINED** (chemistry block §H-7, adopted): "many medicines are built on six-membered rings and axial-versus-equatorial changes whether the molecule fits its protein" names a mechanism the sim does not have — there is no binding site on the canvas — and `real_world_anchor_promises_a_lever_the_sim_does_not_have` is exactly that failure.

**Rule 35 audit:** no place, country, festival, food-culture, currency, brand or personal name. Sugar, cotton and wood read identically to a student anywhere. Plain English; no Hinglish.

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
S7 ends on "the axial methyl is 274 pm from two hydrogens, closer than they fit; equatorial it is 425 pm clear" — a complete qualitative conclusion. **Requirement placed on chemistry-author: S7's narration must not forward-reference the ratio, the A-value, or the word "population".** S7's formula surface is `C₇H₁₄`, never a Boltzmann relation. S9 has no formula surface; its `temperature` control and its `population` and `a_value` HUD lines are all `min_ring: advanced`, so none appears. **Coherent. ✔**

**Cut 2 — hide `advanced` + `extended` (S5–S8):** surviving lesson is S1–S4 + S9.
Flat-is-wrong → staggered → axial and equatorial → the flip swaps them. That is a complete and self-contained lesson, and it is exactly the depth an IGCSE-style or introductory IB treatment needs. **Requirements placed on chemistry-author:** S4 must not mention the barrier, the intermediate shapes by name, or any substituent; no core state's HUD may carry `energy`, `barrier`, `population`, `a_value` or `pose`; S9's `substituent`/`group`/`temperature` controls and its `pose`/`distance`/`energy`/`population`/`a_value` HUD lines must all be gated out. **Coherent. ✔**

> **Cut-2 correction, and a note for chemistry-author (P1-1).** Chemistry block §E-6's Cut-2 list is wrong in one entry and must be corrected in that document — I am flagging it rather than editing their file. It lists the surviving rendered strings under `core_only` without `pose`, but revision 1 ringed the `pose` HUD line at `min_ring: core` while `pucker` is also core. `pose` renders a **conformation name**. Under `core_only`, S5 is hidden, so *half-chair*, *twist-boat* and *boat* are never taught — and the teacher's first drag past u ≈ 0.2 would print one of them. That is `core_ring_state_shows_value_whose_only_derivation_is_higher_ring` recurring on a FIXED row.
> **Fix applied here: `pose` is re-ringed to `min_ring: 'extended'`.** The corrected Cut-2 surviving-symbol list is therefore: `°`, `C₆H₁₂`, `axial`, `equatorial`, `chair`, `ring axis`, `ring plane`, and the numerals 120.0 / 111.4 / 109.5 / 54.9 / 6 — every one first shown in a core state, and no conformation name anywhere. *(Under Cut 1, `pose` survives, and it is safe there: S5 is shown, so all four names are taught.)*

**Rule 38b — the explore state surfaces CORE-ring content only.** S9 has **no formula surface** (which also discharges `explore_state_formula_surface_asserts_a_relation_no_state_derives` outright — there is no relation to reconcile). Under `core_only` the only quantities S9 can print are an angle in degrees and an axial/equatorial count, both shown concretely in S1 and S3. No orphan value.

**Rule 38c — notation ladder.** Core and extended surfaces are arithmetic and algebra only (angles in degrees, distances in pm, energies in kJ·mol⁻¹). The one exponential relation lives in S8, the advanced ring. The ‡ symbol is not used anywhere: S6's surface is `barrier = 45 kJ·mol⁻¹`, not `ΔG‡` (chemistry block §I-3 — transition-state notation below the advanced ring, on a decomposition the literature does not agree on).

**Rule 38d — dialect.** Dual-label once, then bare: "chair (the puckered shape)" once at S1, then "chair". **"conformation (a shape a molecule can twist into without breaking a bond)" is dual-labelled at S5, not S1** (chemistry block §I-8 adopted — S1's budget cannot hold two dual-labels plus the anchor plus the prerequisite patch plus both halves of the contrast beat; measured at 68 words with all five). Ring consequence, checked: S5 is extended, so under Cut 2 the word "conformation" is never rendered — correct, because under Cut 2 no surviving state uses it. "axial" and "equatorial" are labelled on the canvas at S3 with their reference lines and used bare afterwards. Use "conformation", never "conformer" as a first introduction; use "van der Waals contact distance", not "contact radius".

**Rule 38e — graph axes (S6, the only graph).** Convention decided at design time: **x = the flip progress (a dimensionless coordinate, 0 at chair, 1 at chair′), y = energy in kJ·mol⁻¹, chair as zero.** This is the universal convention for a conformational profile across CBSE/JEE, IB and A-level. **Confirmed by chemistry block §H-8 across all four claimed curricula plus AP: every one specifies kJ·mol⁻¹.** No board conflict, **no axis-swap toggle, and no units toggle.** Recorded for the future: a US-market preset would be a *unit* toggle on the same axes, never an axis swap.

**Rule 38f — anchor breadth.** Sugar/cotton fibre is a widest-overlap anchor: it appears in every one of the four listed curricula's biomolecule or organic content. No lab apparatus is used, so the India-lab trap does not arise.

**Rule 38h — preset proposal (derived from the rings; hide, never reorder):**

| Preset | Shows | Hides |
|---|---|---|
| `full` (CBSE/JEE, IB HL, A-level) | S1–S9 | — |
| `no_advanced` | S1–S7, S9 | S8; the `temperature` control; the `population` and `a_value` HUD lines |
| `core_only` | S1–S4, S9 | S5–S8; the `substituent`/`group`/`temperature` controls; the `pose`/`distance`/`energy`/`barrier`/`population`/`a_value` HUD lines |

### `curriculum_tags` (Rule 38g — CLAIMS, not facts)

| Curriculum | Rings claimed | Verification |
|---|---|---|
| **CBSE / NCERT Cl.11 Ch.13 (Hydrocarbons, cycloalkanes)** | `core` | **`needs_teacher_verification: true`** — see the basis note below |
| CBSE / NCERT — `extended`, `advanced` rings | `extended`, `advanced` | `needs_teacher_verification: true` — axial/equatorial depth, the 45 kJ·mol⁻¹ barrier and A-values sit beyond the NCERT text even where JEE expects them |
| **JEE Main / Advanced** | `core` + `extended` + `advanced` | `needs_teacher_verification: true` |
| **NEET** | `core` | `needs_teacher_verification: true` |
| **IB HL** | `core` + `extended` | `needs_teacher_verification: true` |
| **A-level** | `core` + `extended` | `needs_teacher_verification: true` |
| **IGCSE** | not claimed | `needs_teacher_verification: true` (likely out of scope) |
| **AP Chemistry** | not claimed | out of scope — `ORGANIC_BUILD_PLAN.md` §1: AP has no organic mechanism unit |

> **Basis note on the CBSE core cell (P3-1).** Revision 1 marked it "author-verified". Rule 38g permits only CBSE/NCERT to be verified at authoring time, but the verification instrument the fleet uses — the `ncert_content` table — **holds physics only**; there is no NCERT Chemistry corpus in the database to check the claim against, and I did not read the printed textbook. The claim ("chair and boat conformations of cyclohexane are named in the NCERT cycloalkanes treatment") therefore rests on recall, which is exactly what 38g exists to stop. **The cell ships `needs_teacher_verification: true`** with this basis recorded, and it is the cheapest of all the cells to clear — one teacher, one page of the NCERT chapter.

**No preset goes teacher-visible until a real teacher of that curriculum confirms its cells.**

### S9 explore — the ring-gated control list

```
controls: [
  { id: 'pucker',      min_ring: 'core'     },   // slider AND drag-the-ring (N-7)
  { id: 'view',        min_ring: 'core'     },   // home ⇄ sight-along
  { id: 'implicit_h',  min_ring: 'core'     },   // hydrogens on/off
  { id: 'spin',        min_ring: 'core'     },   // view-axis only (N-20)
  { id: 'substituent', min_ring: 'extended' },   // which ring carbon
  { id: 'group',       min_ring: 'extended' },   // H | CH3  — restricted, see below
  { id: 'temperature', min_ring: 'advanced' }
]
hud_lines: [
  { id: 'ae_count',    min_ring: 'core'     },
  { id: 'angle',       min_ring: 'core'     },
  { id: 'pose',        min_ring: 'extended' },   // ← re-ringed in revision 2 (P1-1)
  { id: 'bond',        min_ring: 'extended' },
  { id: 'distance',    min_ring: 'extended' },
  { id: 'energy',      min_ring: 'extended' },
  { id: 'population',  min_ring: 'advanced' },
  { id: 'a_value',     min_ring: 'advanced' }
]
formula: none
```

`min_ring` on `controls_visible` is real and shipped (`field_3d_renderer.ts:1323`, `:55295`). **`min_ring` on `hud_lines` is not implemented anywhere and is engine need N-6** — until it lands, the Rule-38b cut for the HUD is DISCHARGED-ON-DELIVERY, not discharged.

> **The `group` selector is restricted to `H | CH3` (P2-3 — decided before the freeze).** Revision 1 offered `H | CH3 | Cl | Br | OH`, while chemistry block §C-1 declares exactly ONE A-value (CH₃ = 7.3 kJ·mol⁻¹). Four of those five choices would drive a population bar the engine cannot compute, on a state whose whole instrument is that bar — `authored_annotation_asserts_a_value_its_own_state_control_can_falsify`. **Decision: this concept authors `H | CH3` only.** The contract's `group` enum keeps its wider membership for siblings (#3 butane, #5, #6 all place groups without an A-value), and **`tBu` is added to that enum now, pre-freeze** (§9E), so the transfer item q7 has somewhere to live later without reopening a frozen enum. A further group becomes selectable HERE only when chemistry-author ships its sourced A-value into the published table beside CH₃'s. **q7 remains a declared transfer item** — no state stages *tert*-butyl, and `coverage_map.notes` says so; that is the intended design of a transfer item, not a coverage hole.

---

## §8 — The 3D authoring traps, per state (design constraints with correct answers)

Both traps are treated as measurable quantities. The numbers below are from an offline closed-form solve (§10), orthographic, over az ∈ [0,360) × el ∈ [0,40] at 1° resolution, on all eighteen atoms. **They are design-time estimates in a parallel projection; the surgeon must re-solve in the real perspective camera at the real atom disc radii and REPORT the achieved figures.** Tagged accordingly.

**Acceptance criteria (the gate `check:organic-structure` must assert these, with negative controls):**
- **Countability.** Every element the caption, HUD or narration counts is separately countable in the projection: minimum pairwise screen separation between rendered atom discs **> 0**, measured in **isotropic screen units** (camX/camZ, camY/camZ), never in NDC — dividing x by the aspect ratio shears every measured direction by 1.78× at 16:9 (adopted from the `vector_geometry_3d` camera lesson).
- **Angle fidelity.** Where a state's thesis is a comparison between angles, the projected angle at the measured site is within **4.0°** of its label, and both projected arms exceed a screen-length floor.

| # | Camera intent | Why this camera makes the state's claim honest | Measured / assumed |
|---|---|---|---|
| 1 | **FACE-ON** for the flat ring (its plane = the image plane, via `flat_basis`), held; then an eased scheduled step to **HOME** while the molecule stays rigid; then the pucker | The state's thesis is the comparison **120.0° vs 111.4°**, against a drawn 109.5° reference — the sharpest form of the projected-angle trap. Face-on, the flat 120° is exactly 120.00° on screen, with no distortion to argue about. The molecule is rigid through the camera move, so the student cannot mistake the re-framing for the pucker; the HUD angle holding at 120.0 during the move is the proof. Only then does the ring pucker at a fixed camera. **All hydrogens hidden in the flat phase and through the pucker** (`show_h: 'none'`) — the arc is the only thing being read, and 12 H would occlude it. *(This is also why the eclipsing claim cannot be made here — §4.)* | FACE-ON: exact by construction (`flat_basis`, reused from `molecular_geometry`). HOME: **MEASURED** az 254°, el 10–12° |
| 2 | **SIGHT-ALONG** the named C–C bond: the camera on the bond axis, the bond midpoint at the origin | The state's thesis is a torsion angle, which is only true in projection when the camera is exactly on the bond axis. The engine must ASSERT the alignment to a stated tolerance and the HUD must publish the torsion numerically (`φ`) and the bond it belongs to (`bond`), so the claim never rests on the projection alone — and so that stepping between three bonds is legible as three *readings*, not one static picture. **Hydrogens shown on the two focus carbons only** (`show_h: ['C1','C2']`) — the remaining ring is drawn as a dimmed stick. **The Newman rim convention is mandatory here:** front-carbon bonds drawn to the centre, back-carbon bonds to a rim circle, because at a staggered 54.9° the back bonds are partly behind the front ones and at the eclipsed limit they are exactly hidden. Recentring onto the bond midpoint uses the scenario's own metres-to-world origin helper, not an authored camera target | Alignment tolerance **ASSUMPTION — probe-before-authoring**: propose ≤ 0.5° between the camera forward vector and the bond axis; the surgeon measures and reports |
| 3 | **HOME**: az 254°, el 10–12° | The hardest countability state — twelve C–H bonds shown at once, and the narration counts six of each. **MEASURED at az 254°, el 10°: minimum pairwise screen separation between all eighteen atoms = 0.570 Å.** At el 12° the separation improves to 0.624 Å. At el 0° separation collapses to 0.379 Å; beyond el 15° the projected-angle error on the measured arc exceeds the 4.0° criterion. **el 10–12° is the solved window, and it is narrow — this is exactly why the camera is solved and not chosen.** Two distinct labelled reference lines are drawn: the ring axis (vertical) and the mean-plane disc; the measured arc is the **C–C–H** angle on the ONE carbon the solve certifies (see §10 and the note below), and the HUD carries `axial 6 · equatorial 6` so the count does not rest on the projection | **MEASURED** (orthographic). **The angle-fidelity figures must be re-derived for the C–C–H arc** (chemistry block §I-7): revision 1 quoted 1.93° / 3.81° against an ax–C–eq target that S3 no longer draws. The perspective re-solve already required subsumes this, but the surgeon must solve for the arc S3 actually renders |
| 4 | **HOME**, fixed for the whole flip | Countability is the failure mode here: a student cannot track twelve bonds swapping in a projection of eighteen atoms, and asking them to is how the aha is lost. The design answer is not a better camera — it is **not to count in the projection at all**: one traced bond carries the claim visually, the origin-tinted SET carries the word "every", and the HUD carries the count numerically. A fixed camera also guarantees that every change on screen is the molecule, so the flip cannot be mistaken for a camera orbit | **ASSUMPTION — probe-before-authoring:** the traced bond must remain unoccluded throughout u ∈ [0,1] at HOME, and — new in revision 2 — **at least four of the six origin-tinted bonds must be simultaneously visible at the pin instant**, or the set cannot carry "every". If either fails, choose the traced carbon (not the camera) to fix the first; report the second, because it may force a small el adjustment inside the 10–12° window |
| 5 | **HOME**, fixed | The flagpole contact is a distance claim, and a distance foreshortens. **The line's LENGTH must not be the evidence** — the numeric label is, against a drawn 240 pm H+H reference (N-17). The contact line is drawn and labelled in pm, and the boat's hold is long enough (3.4 s) to read it alongside the `φ = 0.0°` publication. Countability: only the two flagpole hydrogens and the one named eclipsed C–C bond need be individually countable during the boat hold | **ASSUMPTION — probe-before-authoring:** the two flagpole H must be separable at HOME in the boat pose. The boat's geometry differs from the chair's, so the §10 chair solve does NOT transfer; the surgeon must re-solve countability at each of the four waypoints |
| 6 | **HOME** for the molecule; the graph is a 2D overlay in its own zone | No projected-angle exposure. Overlay collision is the live risk (Rule 34d): the graph, the formula surface and the HUD must occupy distinct zones and the HUD must clear the review-chrome Full-screen button (`top: 52px`+) | Zone assignment in §14 (h) |
| 7 | **HOME**, fixed | Two distance claims compared, so foreshortening could invert the visual reading. Both contact lines are labelled numerically, and the 290 pm van der Waals sum is drawn as a third, visually distinct reference so the comparison is against a fixed standard rather than between two foreshortened lengths. **The two 1,3-diaxial contacts are drawn to two DIFFERENT ring carbons (C3 and C5) on the same face** — they must be separately countable, since the narration says "two" | **ASSUMPTION — probe-before-authoring:** the two contact lines must not overlay each other at HOME. If they do, the state's carbon choice is the free parameter |
| 8 | **HOME**, two instances laned along **screen-right**, gap solved against the pair's projected bounding boxes | A world-axis lane can stack the two chairs under a head-on camera (recorded scar). The lane must be defined in the camera basis. The frame must also contain both molecules AND both bars at t = 0 and at the pin — a framed extent computed from the pair's bounding boxes plus one molecule-width margin at each end, not from the lane gap alone | **ASSUMPTION — probe-before-authoring:** project both bounding boxes at t = 0, at the pin and at state end; assert every corner inside the viewport |
| 9 | **HOME** default; teacher-orbitable; `view` toggles SIGHT-ALONG; `spin` about the **view axis** only (N-20) | A sandbox cannot be camera-solved, so it must be camera-*recoverable*: a "reset view" that returns exactly to HOME. And it must never spin the molecule out of the solved el 10–12° window, which a world-axis spin does immediately | **MEASURED constraint** — the HOME window is 2° wide in elevation (§10); commit `075d5aa` fixed exactly this class of bug on `bonding_scene` |

---

## §9 — What the engine must do, per state (the specification)

### Already shipped — REUSE, do not rebuild (Rule 40a sweeps run 2026-08-09)

| Mechanism | Verdict | Evidence |
|---|---|---|
| **Scripted mid-state camera schedule** (S1's FACE-ON→HOME, S2's out-and-back) | **EXISTS. Adopt verbatim, do not invent.** | `camera_steps?: Array<{at_ms, az, el, dist, ease_ms}>` declared at `field_3d_renderer.ts:492`; the `orbital_shapes` original is referenced at `:63742`; already adopted once verbatim as `vgCamScheduleAt` (`:12374`, applied `:14524`), with the adoption comment at `:12042-12043` and `:12355-12356`. This is the **third** adoption and must be the same fields, same semantics |
| **Ring-gated control lists (`min_ring`)** | **EXISTS.** | `controls_visible?: Array<string \| {id, min_ring: 'core'\|'extended'\|'advanced'}>` at `:1323`; normalisation rule at `:55295-55298`. Bare strings normalise to `core` |
| **Drag-seize on a scheduled slider row (Rule 39b)** | **EXISTS.** The S4/S5/S7 `pucker` exposure rides it | `bscControlList` shape at `:55294`, `:1313`; the `<prefix>_<name>_row` convention is what Rule 39f auto-discovery keys on |
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
| **N-2** | **The pucker path must pass through the REAL geometries as KNOTS**, not linearly interpolate chair→chair′ endpoint coordinates | `pucker: { path: 'chair_flip', u: 0..1 }`, with knots at u ≈ 0 (chair), 0.22 (half-chair), 0.36 (twist-boat), 0.50 (boat), 0.64 (twist-boat′), 0.78 (half-chair), 1.00 (chair′), interpolated by a named documented form, closed-form in t | S4, S5, S6, S7, S9 | ⚠ **PARTLY.** `pucker.path`/`u`/`waypoint` exist in the draft, but nothing states that the intermediates are real geometries. Without knots, S5's walk is three labels on one interpolation — `gallery_walk_steps_across_values_the_underlying_model_cannot_distinguish` exactly. **The gate asserts each waypoint's full ring-torsion set against chemistry block §A-7** (chair `±54.9`; twist-boat `+30.6 +30.6 −64.4 …`; boat `+54.9 0.0 −54.9 …`; half-chair by its DEFINITION — four contiguous coplanar carbons — because it cannot keep near-tetrahedral angles and has no stable torsion list). **Strengthened (block §H-10):** the boat knot is built at the idealised tetrahedral parameterisation while the chair knots use the experimental one; **both must be declared in the molecule table**, or the rendered flagpole is 216 pm under a 183 pm label |
| **N-3** | **Off-chair semantics for the axial/equatorial tag.** At the half-chair, twist-boat and boat, "axial" and "equatorial" are not defined | The tag fades out as u leaves a chair pose and re-reads at the far end; `ae_count` renders in exactly **two** string shapes: `axial 6 · equatorial 6` (in a chair) and `axial — · equatorial —` (off-chair) | S4, S5, S9 | ❌ **NO — and the contract does not make the decision at all.** It says only `tag_axial_equatorial` (a boolean) and decision 6 says tags are derived from the pucker. Neither says what a derived tag reads at the half-chair. Left unspecified, the HUD will assert a count with no chemical meaning |
| **N-4** | **Scenario self-centring, for the sight-along and the compare pair** | Per-state world shift computed from the authored geometry at state entry (bond midpoint for `sight_along`; the pair centroid for `compare`), applied in ONE metres-to-world helper every mesh passes through, captured ONCE per state | S2, S8 | ❌ **NO**, and there is an OPEN scar on exactly this (`field3d_scenario_renders_offcentre_because_camera_target_is_not_authorable`). Its prevention rule is the required solution — the scenario places itself around the origin; **do not** add an authorable camera target |
| **N-5** | **Camera pose convention.** The draft says `camera: {az, el, dist}`; the shipped fleet authors `camera_position: [x,y,z]` (verified in `vsepr_molecular_shapes.json`) | Decide ONE and state it; if az/el/dist, the conversion lives in the scenario and `camera_steps` already speaks az/el/dist | all | ⚠ **CONTRACT DECISION NEEDED.** Since `camera_steps` is already az/el/dist, az/el/dist is the coherent choice |
| **N-6** | **Ring-gated HUD lines** | `hud_lines: [{ id, min_ring }]`, same normalisation rule as `controls_visible` | S9, and the whole Rule-38b cut | ❌ **NO.** `min_ring` exists on controls only. Without it, a `core_only` preset prints a conformation name and an energy readout in a sandbox that taught neither |
| **N-7** | **Drag-to-pucker** — grab the ring and flip it by hand | `pucker: { draggable: true }`; pointer delta maps to Δu with a stated gain; drag seizes the slider (existing drag-seize pattern) | S4, S5, S7, S9 | ❌ **NO.** The draft gives `torsion.continuous` for free-run and `pucker.u` for authoring, but no pointer binding. Required by the open directive `teach_field3d_explore_grab_and_move_field_point` |
| **N-8** | **A measurement instrument family**, config-driven | `measure: [{ kind: 'angle' \| 'distance' \| 'torsion' \| 'axis_line' \| 'plane_disc', between: [ids], label, reference_value_pm?, at_ms, ramp_ms }]`. Units: degrees for `angle`/`torsion`, pm for `distance` | S1 (C–C–C arc), S2 (torsion arc), S3 (C–C–H arc + ring-axis line + mean-plane disc), S5 (flagpole contact + 240 pm reference + the eclipsed-bond torsion), S7 (two 1,3-diaxial contacts + the 290 pm reference) | ⚠ **PARTLY — the ancestors exist but the config surface does not.** The arc and the pm-valued span line are `molecular_geometry`'s (`:59210-59248`); this generalises them to a named list with a reference value. **`reference_value_pm` is load-bearing**, not decoration: without a drawn standard, S5's and S7's distances are only comparable to each other. **`kind` is a closed enum and closes over all 32 sims — see §9E** |
| **N-9** | **The contact metric must be NAMED, and a generic "nearest contact" readout must be impossible to author** | `distance` measurements are between two explicitly named atoms; there is no "closest contact" mode. **Strengthened (block §H-10): ban it contract-wide, not concept-wide, and fix the methyl rotamer staggered at every u** | S7, S9, and every future organic concept | ❌ **NO — and this is the sharpest instrument trap in the concept.** **MEASURED:** the equatorial methyl carbon's nearest ring hydrogen is **270 pm**, *closer* than the axial methyl's 1,3-diaxial contact at **274 pm** — so a nearest-contact readout reports essentially no change through the flip and flatly contradicts the narration. The honest instrument is the two NAMED 1,3-diaxial contacts (274 pm each, axial) versus the same two named contacts after the flip (**425 pm** each, equatorial). A rotamer-free metric additionally requires a fixed methyl rotamer |
| **N-10** | **A traced bond AND a traced SET, both keeping identity through the pucker** | `trace: { bonds: ['C1-Hax'], label, report_tag: true }` for the single focal bond, and `trace: { bonds: [all six origin-axial C–H], tint_by: 'origin' }` for the set. `tint_by: 'origin'` colours by **which family the bond started in**, and that tint is FIXED at state entry and never re-derived from the live tag | **S4** | ❌ **NO, and revision 1 under-specified it.** *(P1-4.)* The draft has `substituents[].highlight` and a global `tag_axial_equatorial`; neither traces a bond. **The generalisation to a set is not a convenience — it is what makes the aha's final clause true on screen.** `ae_count` reads `axial 6 · equatorial 6` at BOTH u = 0 and u = 1 (a symmetry identity — recorded scar `measured_equality_is_an_identity_at_the_authored_home_pose`), and contract decision 6 derives the tag at every u, so tinting by the *current* tag returns the untraced bonds to a visually identical colouring at u = 1. Only an **origin-identity** tint — orthogonal to the a/e tag, so it does not conflict with N-3's off-chair rule — shows six bonds that started axial standing equatorial at the end. The gate asserts: the origin tint set is invariant in u; at u = 1 every member's derived tag is `equatorial` |
| **N-11** | **A multi-leg waypoint walk with named holds** | `pucker.walk: [{ waypoint, at_ms, ramp_ms, hold_ms, label }]` | S5 | ❌ **NO.** The draft gives a single destination (`waypoint`) and a single ramp (`u_from/at_ms/ramp_ms`). S5 needs seven legs |
| **N-12** | **~~Add `planar` to `pucker.waypoint`~~ → a separate `pucker.amplitude` scalar** | `pucker: { amplitude: 0..1 }` (0 = planar, 1 = the chair's Cremer–Pople Q), **independent of `u`**, with the same `from/at_ms/ramp_ms` schedule fields. S1 is driven by `amplitude 0 → 1` at `u = 0`; S4–S7 and S9 are driven by `u` at `amplitude = 1`; S9 bounds it to [0.85, 1.0] | S1, S9 | ❌ **NOT IN THE CONTRACT — but it is a FIELD addition, and it is explicitly NOT enum-freeze-blocking.** *(P1-2; chemistry block §C-3 accepted in full.)* Revision 1 asked for a `planar` waypoint. That is the wrong shape: the flip path runs on the SURFACE of the Cremer–Pople puckering sphere at fixed Q (chair θ = 0°, flexible forms θ = 90°, chair′ θ = 180°), while the planar ring is **Q = 0, the CENTRE of that sphere**. Flattening is radial; flipping is angular. A `planar` member on a path that never passes through it would be a false statement in a frozen contract. The scalar also forecloses a real hazard — a sandbox slider that can drive the ring back to flat |
| **N-13** | **The `hud_lines` enum is short by six members** | See the full two-directional diff at **§9E** | S2, S5, S7, S8, S9 + siblings #1, #5, #7 | ❌ **ENUM GAP — and larger than revision 1 found.** Superseded in detail by §9E |
| **N-14** | **A two-instance compare with a camera-basis lane** | `compare: { instances: [{substituents, pucker.waypoint}, …], lane_axis: 'screen_right', gap }` | S8 | ❌ **NO.** `mode: compare` is in the enum but no layout is specified. The lane MUST be in the camera basis, per the recorded head-on stacking scar |
| **N-15** | **A population instrument** — a side-by-side pair of bars sharing ONE scale ceiling, computed by the engine from a published A-value and the live temperature | `population: { a_value_kj: 7.3, temperature_k: 298.15, show_bar: true }`; the percentages are engine-computed via the Boltzmann relation. **Strengthened (block §H-10): bar labels bound LIVE to the computed percentages, never authored strings, and labelled as percentages of molecules, never counts** | S8 | ⚠ **PARTLY.** `hud_lines` has `population` but the drawn bar, the shared ceiling and the temperature binding are unspecified. The A-value belongs in the published table beside the energy curves with the same "(literature)" stamp. An authored label is `authored_annotation_asserts_a_value_its_own_state_control_can_falsify` (CRITICAL) the moment the teacher moves the slider |
| **N-16** | **The `cyclohexane` energy curve as a published table with the u-axis SHARED with the pose** | `energy: { curve: 'cyclohexane', coordinate: 'pucker', units: 'kJ/mol', zero_at: 'chair', stationary: [...] }`. **Strengthened (block §H-10): SEVEN stationary points, not four** — chair 0 (min) · half-chair +45 (max) · twist-boat +23 (min) · boat +29 (max) · twist-boat′ +23 (min) · half-chair′ +45 (max) · chair′ 0 (min) | S6, S9 | ⚠ **PARTLY.** The draft's `energy` block exists and lists `cyclohexane`. What must be added: **E(u) and pose(u) read the SAME u** — one live parameter driving both the ring and the rider (the open directive `teach_coordinate_sim_with_graph`) — and the seven-point profile, which a four-point table cannot draw |
| **N-17** | **`measure.reference_value_pm` authorable at S5, not only S7** — the boat needs a drawn **240 pm** H+H reference | as N-8 | S5 | ❌ **NO** (block §H-10). Without it, "closer than two hydrogens fit" is carried by narration alone, and the sim must read sound-off (Rule 24) |
| **N-18** | **A glow-target vocabulary** — per-narration-sentence focal binding naming an addressable scene element | `tts_sentences[].focal: '<addressable element id>'`, resolved against traced bonds, measures, HUD lines, surfaces and atoms | all | ❌ **NO** (block §H-10). `concept_ships_zero_narration_glow_bindings` requires 1.0 coverage; chemistry block §D gives a focal for every sentence and there is no field to bind them to. Currently 0/N **by engine limitation**, which is why it is an engine row and not an authoring defect |
| **N-19** | **Frozen-pin registration for `organic_structure`** — WITHOUT it every state pins at 1500 ms, before every payoff in §5 | Five sites, all verified in this worktree on 2026-08-09: **(1)** `F3D_REVEAL_KEYS` (`deriveStateMeta.ts:746`) must include the scenario's reveal-bearing keys; **(2)** `maxRevealForField3dState` (`:1087`) must reach the new branch — its return is `Math.max(...candidates)` or `DEFAULT_REVEAL_MS = 1500` (`:3520`, `:698`); **(3)** an `organic_structure` candidate-push branch beside `molecular_geometry` (`:2079-2090`) and `bonding_scene` (`:2118-2129`), whose candidates are **the `Pin` column of §5**, derived per state from `camera_steps`, `pucker.walk` leg ends, `measure[].at_ms + ramp_ms`, `trace` re-label and set-re-glow times, `compare` lane-in and bar-fill ends; **(4)** `deriveHoldExpectations` (`:3848`) must classify `mode: 'explore'` as interactive and never pin S9 (the `molecular_geometry` / `bonding_scene` precedent); **(5)** the accumulator-free snap set at `field_3d_renderer.ts:76024` must gain `scenario_type === "organic_structure"`, which is legitimate because every beat is closed-form in state-local t (contract decision 2) | ALL nine states, and every sibling O-0 concept | ❌ **NO — and revision 1 missed the whole row.** *(P1-3.)* It is `[owner: peter_parker:field3d_surgeon]` and it is **tooling, not renderer**: sites 1–4 live in `deriveStateMeta.ts`, a Rule-40 platform file that lands on master separately. **Do NOT generalise the `nlb` `clamp(0.60·R, …)` heuristic at `:3213` to this scenario** — it is that branch's local rule, and copying it is how a third pin law is born |
| **N-20** | **`spin` axis and the Rule-37 idle default for the sandbox** | `spin` rotates the molecule about the **camera's view axis**, never a world axis; `spin_rate` in deg·s⁻¹, `spin_start_ms` as today. S9's authored default is `spin` ON at a slow rate, so an untouched sandbox is never a dead frame (Rule 37 — the player free-runs the explore state's clock, and something must move in it) | S9 | ❌ **NO — two live scar classes, neither decided by the draft.** *(P2-4.)* **(a) Axis:** commit `075d5aa` fixed exactly this on `bonding_scene` ("spins about the view axis, not world +y"). Here it is sharper than taste: the solved HOME window is **2° wide in elevation** (§10), so a world-axis spin walks the molecule out of the only camera pose where the a/e count is countable, within a second. **(b) Idle:** Rule 37 keeps the explore clock running but does not supply motion; without a default the sandbox is a still image until the teacher touches it |

### <a id="enums"></a>§9E — The closed-enum ledger, closed by a TWO-DIRECTIONAL diff

**Why this subsection exists.** `phase0_config_enum_closed_against_the_spec_driver_not_the_served_concept_set` requires that an enum frozen on the spec driver be diffed against the whole served set, in **both** directions: every rendered string of every served concept maps to a member, and every member maps to a rendered string or to an explicit DEFERRED entry. Revision 1 asserted "two enum gaps" without running either direction, and got both directions wrong. The served set is the seven-concept survey union table at **`docs/ORGANIC_PHASE0_CONFORMATION.md:25-40`**, cited below by line.

**STRUCK from revision 1 · E-1 `pucker.waypoint += planar` — WITHDRAWN, and it is not an enum matter at all.** Chemistry block §C-3 is right (see N-12): planar is Q = 0, the centre of the Cremer–Pople sphere, and the flip path runs on its surface at fixed Q. **Recorded instead as a FIELD addition (`pucker.amplitude`), explicitly NOT freeze-blocking** — a field may be added after A1 without reopening a frozen enum; a member may not.

#### Direction 1 — every rendered string in the served set maps to a member

| Rendered string (survey line) | Concept | `hud_lines` member | Status |
|---|---|---|---|
| "C–C–C angle: **109.5°** true vs the ~120° the paper shows" (`:31`) | #1 | `angle` | shipped in draft |
| "implicit-H count" (`:31`) | #1 | **`atom_count`** | **GAP — found by this diff, not by revision 1** |
| "φ in degrees" (`:32`), "φ" (`:33`) | #2, #3 | `phi` | shipped |
| which bond the Newman view is down (`:32` "Newman view", `:33` "torsion about C2–C3") | #2, #3, **#4 S2** | **`bond`** | **GAP** — do not re-purpose `pose`, which renders a conformation name (`existing_hud_line_reused_for_a_different_physical_quantity`) |
| "**E(φ)** in kJ/mol on a live curve" (`:32`), "E(φ) with four minima" (`:33`), "E along it" (`:34`) | #2, #3, #4 | `energy` | shipped |
| "barrier **12 kJ/mol**" (`:32`), "barrier **45 kJ/mol**" (`:34`) | #2, #4 | `barrier` | shipped |
| pose names — staggered / anti / gauche (`:32`, `:33`); chair / half-chair / twist-boat / boat (`:34`) | #2, #3, #4 | `pose` | shipped |
| "pucker coordinate" (`:34`) | #4 | `phi` is wrong here; the coordinate is `u` and it is the graph's x-axis, not a HUD line | no member needed — **decided**, recorded so nobody adds one |
| "every axial bond becomes equatorial" (`:34`) | #4 | `ae_count` | shipped |
| "the **95 : 5** equatorial preference" (`:34`) | #4 | `population` | shipped |
| the A-value the 95 : 5 is computed from (`:34`; §I-4 moves it off the formula surface to the HUD) | #4 | **`a_value`** | **GAP** |
| the temperature it is computed at (`:34` "temperature"; S8 renders `T = 298 K`) | #4 | **`temperature`** | **GAP** — a control member of the same name exists; a HUD line does not |
| pm-valued contacts — flagpole H···H, the two 1,3-diaxial contacts (#4 S5/S7) | #4 | **`distance`** | **GAP** (revision 1's E-2, confirmed) |
| "the **residual** after best-fit overlay" (`:35`) | #5 | `residual` | shipped |
| "CIP priorities → **R/S**" (`:35`) | #5 | **`descriptor`** | **GAP — found by this diff.** R/S is a molecule-level stereo descriptor, not a pose name and not a residual. Owner: the #5 skeleton; declared here only because the enum freezes here |
| "π **overlap** falling to zero" (`:36`) | #6 | `overlap` | shipped |
| "twist angle" (`:36`) | #6 | `phi` | shipped |
| "atom count held constant while connectivity changes" (`:37`) | #7 | **`atom_count`** | same GAP as #1's implicit-H count |

| Rendered control (survey line) | Concept | `controls` member | Status |
|---|---|---|---|
| "drag the camera" (`:31`), "view toggle (Newman ↔ sawhorse)" (`:32`) | #1, #2 | `view` | shipped |
| "toggle implicit H" (`:31`) | #1 | `implicit_h` | shipped |
| "step chain length" (`:31`) | #1 | **`chain_length`** | **GAP — found by this diff** |
| "φ slider, free-running" (`:32`), "φ slider" (`:33`), "twist slider (it resists)" (`:36`) | #2, #3, #6 | `phi` | shipped (#6's resisted twist is the same control id over `block_twist`) |
| "which substituent sits on the front carbon" (`:33`), "place a substituent" (`:34`), "swap substituents" (`:36`) | #3, #4, #6 | `substituent` | shipped |
| which GROUP is placed (`:34`), "swap any two groups" (`:35`) | #4, #5 | `group` | shipped — **`tBu` added to the group value set** (P2-3), so a later A-value can be selected without reopening the enum |
| "pucker slider" (`:34`) | #4 | `pucker` | shipped |
| "temperature" (`:34`) | #4 | `temperature` | shipped |
| the S9 idle/manual rotation (#4 S9, N-20) | #4 | **`spin`** | **GAP** — `spin_start_ms`/`spin_rate` are authored chrome, not a teacher control; a teacher-facing toggle needs a member |
| "rotate either molecule freely" (`:35`) | #5 | standard camera-orbit chrome, not a control member | **decided**, recorded |
| the mirror operation (`:35`) | #5 | `mirror` | shipped |
| "pick the formula" + "step through its isomers" (`:37`) | #7 | `isomer` | shipped — **decided:** the formula is selected by naming an `isomer_set` in the molecule table, not by a second control. Recorded so #7's skeleton does not add one |

#### Direction 2 — every member maps to a consumer or to an explicit DEFERRED entry

- **`hud_lines` after the additions:** `phi` (#2,#3,#6) · `energy` (#2,#3,#4,#6) · `barrier` (#2,#4) · `angle` (#1,#4) · `pose` (#2,#3,#4) · `overlap` (#6) · `residual` (#5) · `ae_count` (#4) · `population` (#4) · **`distance`** (#4, and #5's overlay separations) · **`bond`** (#2,#3,#4) · **`temperature`** (#4) · **`a_value`** (#4) · **`atom_count`** (#1,#7) · **`descriptor`** (#5). **Every member has a named consumer. DEFERRED list: empty.**
- **`controls` after the addition:** `phi` (#2,#3,#6) · `pucker` (#4) · `substituent` (#3,#4,#6) · `group` (#3,#4,#5,#6) · `temperature` (#4) · `implicit_h` (#1) · `view` (#1,#2,#3) · `mirror` (#5) · `isomer` (#7) · **`spin`** (#4). **Every member has a named consumer. DEFERRED list: empty.**
- **`measure.kind`** (new with N-8): `angle` (#1,#4) · `distance` (#4,#5) · **`torsion`** (#2,#3,#4) · `axis_line` (#4) · `plane_disc` (#4). **DEFERRED: empty.**
- **`mode`** — the ONE enum that freezes with unimplemented members, by design (`ORGANIC_ENGINE_PLAN.md` §5 correction 4). IMPLEMENTED after A3: `lift` · `rotate` · `pucker` · `mirror` · `block_twist` · `rewire` · `compare` · `explore`. DEFERRED: `rehybridise` · `shade` · `delocalise` (Layer B, Wave O-1) · `break` · `form` · `approach` · `invert` · `migrate` · `sequence` · `sweep` (Layer C, O-2+). See the P2-6 requirement below.
- **`molecule`** and **`energy.curve`** are closed over the served set as drafted; no gap found in either direction.

#### The pre-freeze list — what MUST change before the enums freeze at dispatch S1

| # | Enum | Change | Driver | Found by |
|---|---|---|---|---|
| **E-1** | `hud_lines` | `+= distance` | #4 S5/S7/S9 | revision 1 (confirmed) |
| **E-2** | `hud_lines` | `+= bond` | #4 S2; #2, #3 | chemistry block §H-10 |
| **E-3** | `hud_lines` | `+= temperature` | #4 S8 renders `T = 298 K` | founder-proxy |
| **E-4** | `hud_lines` | `+= a_value` | #4 S8 renders `ΔG° = 7.3 kJ·mol⁻¹` on the HUD once §I-4 moves it off the formula surface | founder-proxy |
| **E-5** | `controls` | `+= spin` | #4 S9 | founder-proxy |
| **E-6** | `measure.kind` | `+= torsion` | #2, #3 are dihedral concepts whose central instrument is a torsion arc; `angle` is a three-atom arc and cannot name it | founder-proxy |
| **E-7** | `hud_lines` | `+= atom_count` | #1's implicit-H count (`:31`), #7's conserved atom count (`:37`) | **the Direction-1 diff** |
| **E-8** | `hud_lines` | `+= descriptor` | #5's R/S (`:35`) | **the Direction-1 diff** |
| **E-9** | `controls` | `+= chain_length` | #1's "step chain length" (`:31`) | **the Direction-1 diff** |
| **E-10** | `group` value set | `+= tBu` | q7's transfer item; keeps a frozen enum closed when the A-value lands | P2-3 |

**E-7 through E-9 are not consumed by THIS concept.** They are declared here because the enums freeze here and their owners' skeletons are not yet written — which is the entire reason the row `phase0_config_enum_closed_against_the_spec_driver_not_the_served_concept_set` exists.

**`measure.kind` closes over all 32 organic sims, NOT over this concept and not over Wave O-0** — the same discipline `mode` already carries under `ORGANIC_ENGINE_PLAN.md` §5 correction 4. The O-0 diff above closes it over seven; the surgeon must run the same two-directional diff over the remaining 25 in `ORGANIC_ENGINE_PLAN.md` before A1 signs the freeze, and any member found there is added at that time.

#### P2-6 — DEFERRED members ship as DATA, not as an absence

`deferred_enum_members_must_be_declared_not_merely_unimplemented` binds `mode` directly. The scenario must therefore export two literal arrays, `OS_MODES_IMPLEMENTED` and `OS_MODES_DEFERRED`, and `check:organic-structure` must assert, with negative controls:

1. `union(IMPLEMENTED, DEFERRED)` **equals** the contract's `mode` enum exactly — no member in the contract missing from both, none present in neither;
2. `intersection(IMPLEMENTED, DEFERRED)` is **empty**;
3. no DEFERRED member reaches the **frame pass** (it is never dispatched by the per-frame branch) or the **apply pass** (a state authoring one fails validation loudly at apply time, never silently renders a default scene).

The same three assertions run over any other enum that freezes with unimplemented members. Today `mode` is the only one: `hud_lines`, `controls` and `measure.kind` all close with an empty DEFERRED list, and the gate asserts that emptiness so a later wave cannot quietly add a member without a consumer.

### Success test — corrected

Revision 1 wrote: *"with N-1 … N-16 landed, `cyclohexane_chair_flip` is authorable as pure JSON with zero further renderer edits."* **That is false as written**, for three reasons: it omitted N-19 (without which every state pins at 1500 ms and THE EYE archives the wrong frame — a defect the concept JSON cannot fix); it named only the A2 dispatch's scope while N-19 is `deriveStateMeta.ts` tooling that lands on master separately under Rule 40; and it conflated a test of the CONCEPT with a test of the ENUM FREEZE, which are checked by different things.

> **Corrected success test, in three parts.**
> **(1) Concept.** With **N-1 … N-20** landed across dispatches S1/S2/A2 **and** the N-19 tooling row landed on master, `cyclohexane_chair_flip` is authorable as pure JSON with zero further edits to `field_3d_renderer.ts` **and** zero further edits to `deriveStateMeta.ts`. Any state that then needs an unplanned engine edit means this specification under-generalised → stop and re-scope with the surgeon, per the alarm rule.
> **(2) Pins.** THE EYE's frozen frame for each of STATE_1 … STATE_8 lands within ±1 frame of the `Pin` column of §5, and STATE_9 is classified interactive and is never pinned. This is a separate, independently checkable assertion, and it is the one revision 1 had no way to make.
> **(3) Enum freeze.** `check:organic-structure` runs the two-directional diff of §9E as an assertion, not as a document: every member has a consumer or a DEFERRED entry, and every rendered string in the served set has a member. The freeze is signed by that check passing, not by this skeleton.

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
| Planar ring torsions | **0.00°, all six** | **MEASURED** — true, but **not renderable at S1** (§4); it is the boat's two 0.0° torsions that the sim actually shows |
| Boat ring torsions | **+54.9 · 0.0 · −54.9 · +54.9 · 0.0 · −54.9** | **MEASURED by chemistry-author** (block §A-7) — two fully eclipsed C–C bonds; the twist-boat has none below 30.6°. This is S5's payoff of S2 and the right gate assertion |
| Axial C–H deviation from the ring axis | **4.07°** | **MEASURED** — see the caution below |
| Equatorial C–H tilt from the mean plane | **21.57°** | **MEASURED** — see the caution below |
| **C–C–H angle** (ring carbon → ring carbon → hydrogen), axial and equatorial alike | **109.46°** | **MEASURED. Re-labelled in revision 2** — chemistry block §I-7 is right that revision 1 called this the *axial–C–equatorial* angle, which it is not |
| **Axial–C–equatorial angle** (the two hydrogens on one carbon) | **107.50°** | **MEASURED** — it IS the H–C–H angle, 107.5° by construction. **The arc S3 draws is the C–C–H angle, never this one**: drawing between the axial and equatorial C–H bonds and labelling it 109.5° would render a falsehood on the state that teaches axial versus equatorial |
| 1,3-diaxial H···H (chair, C1↔C3) | **267.8 pm** | **MEASURED** (van der Waals H+H sum ≈ 240 pm) |
| Axial methyl carbon ↔ axial H at C3 and C5 | **274.3 pm each** | **MEASURED** — overlaps the C+H van der Waals sum (290 pm) by 15.7 pm, twice |
| Equatorial methyl carbon ↔ the same two axial H | **424.6 pm each** | **MEASURED** — clear by 134.6 pm |
| Equatorial methyl carbon ↔ its NEAREST ring H (any) | **270.0 pm** (C5 axial) | **MEASURED — the instrument trap of N-9.** Closer than the axial case's 274 pm |
| Solved camera, all 18 atoms | **az 254°, el 10°: min pairwise screen separation 0.570 Å**; el 12°: **0.624 Å** | **MEASURED**, orthographic — perspective re-solve required |
| Camera separation trade at el 0° / 15° / 20° | 0.379 Å · 0.670 Å · 0.701 Å | **MEASURED** — the acceptable window is narrow, ≈2° wide, which is what forbids a world-axis spin (N-20) |
| Projected angle error at the measured site | **must be re-derived for the C–C–H arc** | Revision 1's 1.93° (el 10°) / 3.81° (el 12°) were measured against the ax–C–eq target that S3 no longer draws. The perspective re-solve subsumes the fix; the surgeon reports both |
| Methyl A-value | 7.3 kJ·mol⁻¹ | published (dispatch brief) |
| Equatorial : axial at 298.15 K from 7.3 kJ·mol⁻¹ | **95.00 : 5.00** | **MEASURED** — the two published numbers are mutually consistent to two decimals (the A-value giving exactly 95:5 is 7.299 kJ·mol⁻¹) |
| The same at 250 / 350 / 400 / 500 K | 97.1:2.9 · 92.5:7.5 · 90.0:10.0 · 85.3:14.7 | **MEASURED** — the S8 temperature slider's range |
| Plausibility back-check on the A-value | two 1,3-diaxial contacts ≈ 2 × the butane gauche 3.8 = **7.6** vs the published 7.3 kJ·mol⁻¹ | **MEASURED** — consistent with the drawn geometry |
| Flip rate from a 45 kJ·mol⁻¹ barrier (Eyring, 298.15 K) | **8.1 × 10⁴ s⁻¹**, half-life **8.5 µs** | **MEASURED (derived, not published)** — chemistry block §A-8 decides how S6 states it |
| Boat flagpole H···H | ≈ 183 pm | **CONFIRMED by chemistry-author** (block §A-6) with a parameterisation condition attached — see N-2 strengthened |
| Barrier / conformer energies | chair 0 · half-chair +45 · twist-boat +23 · boat +29 kJ·mol⁻¹ | published (dispatch brief); chemistry-author verifies |

**Caution on two of the measured values (scar `skeleton_geometry_block_quotes_rounded_values_the_engine_will_print_differently`).** The axial deviation (4.07°) and the equatorial tilt (21.57°) are **parameterisation-dependent**: an idealised all-tetrahedral chair gives exactly 0° and 19.47° respectively. The engine must pick ONE parameterisation and publish from it. **Therefore the narration must not quote either number.** S3 says "nearly parallel to the ring axis" and "close to the ring plane" — claims true under both parameterisations — and the on-canvas measurement is the **C–C–H angle**, which is 109.46° under my solve and 109.47° idealised, i.e. robust either way, and which lands the M1 callback directly: the same 109.5° the student was told at S1 is the angle they now measure on the chair. This is a constraint on chemistry-author, not a preference.

---

## §11 — Prerequisites (advisory only, Rule 23)

| Prerequisite | Status | What breaks without it |
|---|---|---|
| `vsepr_molecular_shapes` | **shipped** (chemistry) | S1's whole premise — that a carbon bond angle is about 109.5° and cannot be 120° |
| `hybridisation_sp_sp2_sp3` | **shipped** (chemistry) | why every ring carbon is tetrahedral |
| `sigma_pi_bonding` | **shipped** (chemistry) | why a σ bond can rotate at all, which is what makes a conformational change possible |
| organic #1 bond-line ↔ 3D structure | **unbuilt** (Wave O-0, scheduled first) | reading the flat drawing as a drawing rather than a shape. S1 patches this in one clause |
| organic #2 conformations of ethane | **unbuilt** (scheduled second) | "staggered" and "eclipsed" as words. **S2 patches this by defining "staggered" on screen and using it in the same breath**, and S5 cashes it against the boat's two 0.0° torsions |
| organic #3 conformations of butane | **unbuilt** | the gauche 3.8 kJ·mol⁻¹ that makes the A-value 7.3 explicable rather than asserted. S7 stands alone without it |

**If #2 ships before this concept**, S2 may be trimmed to a shorter callback — flagged for the founder's decision at that time, not decided here. It may not be **deleted**: S5's boat-versus-twist-boat distinction and the chair's own reason both depend on it (§2 change-2).

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

**(a) States** — the nine of §3, exactly as tabled, in that order, with the rail titles of §3. `STATE_1` … `STATE_9`.

**(b) Symbol-label table** — every quantity the narration names, its exact on-canvas form, and (P3-2) **the enum member that renders it**:

| Narrated quantity | On-canvas string | Rendered by | Where |
|---|---|---|---|
| ring bond angle | arc sprite `C–C–C = 120.0°` → `111.4°`, live; dimmed reference arc `109.5°` | `measure.kind: 'angle'`; HUD member `angle` | S1 |
| ring torsion, and which bond it belongs to | arc + HUD `φ = 54.9°` and `bond = C3–C4` | `measure.kind: 'torsion'`; HUD members **`phi`** and **`bond`** — *`torsion` is the measure kind, `phi` is the HUD member; revision 1's DoD wrote `torsion = 54.9°`, which names no member* | S2 |
| bond kinds | sprite labels `axial` and `equatorial`, once each at S3, then bare | `trace` tags / `tag_axial_equatorial` | S3+ |
| axial/equatorial count | HUD `axial 6 · equatorial 6` (chair) / `axial — · equatorial —` (off-chair) — **exactly two string shapes, N-3** | HUD member `ae_count` | S3, S4, S9 |
| the ring axis | reference line labelled `ring axis` | `measure.kind: 'axis_line'` | S3 |
| the ring plane | reference disc labelled `ring plane` | `measure.kind: 'plane_disc'` | S3 |
| the C–C–H angle on the certified carbon | arc sprite `C–C–H = 109.5°` | `measure.kind: 'angle'` | S3 |
| the traced bond | label `C1 axial` → `C1 equatorial` | `trace: { bonds: ['C1-Hax'], report_tag: true }` (N-10) | S4 |
| the six bonds that started axial | origin-identity tint held through the sweep, one re-glow at the end; **no text label** | `trace: { bonds: [...], tint_by: 'origin' }` (N-10) | S4 |
| molecular formula | formula surface `C₆H₁₂`, unchanged through the flip | `show_formula` / `formula` | S4 |
| conformer names | sprite `half-chair` / `twist-boat` / `boat`, on arrival | HUD member `pose` (**`min_ring: extended`**) + `pucker.walk[].label` | S5 |
| flagpole contact | line + label `H···H = 183 pm`; drawn reference `240 pm` | `measure.kind: 'distance'` + `reference_value_pm` (N-17); HUD member `distance` | S5 |
| the boat's eclipsed C–C bond | HUD `φ = 0.0°` on the named bond | HUD members `phi` + `bond` | S5 |
| conformational energy | HUD `E = 23 kJ·mol⁻¹`, live; graph axes `flip progress` / `energy (kJ·mol⁻¹)` | HUD member `energy` | S6 |
| the barrier | formula surface **`barrier = 45 kJ·mol⁻¹`** (not `ΔG‡` — §7 Rule 38c, chemistry block §I-3) + a drawn bracket from the chair level to the peak | HUD member `barrier` | S6 |
| the substituted formula | formula surface `C₇H₁₄` from the instant the methyl appears | `show_formula` / `formula` (chemistry block §I-5) | S7 |
| 1,3-diaxial contacts | two lines + labels `CH₃···H = 274 pm`; reference labelled `contact distance 290 pm` | `measure.kind: 'distance'` + `reference_value_pm`; HUD member `distance` | S7 |
| the same after the flip | one line + label `CH₃···H = 425 pm` | as above | S7 |
| the population relation | formula surface `N(equatorial) : N(axial) = exp(ΔG°/RT) : 1` (symbolic, therefore un-falsifiable by the live slider — chemistry block §I-4) | `show_formula` / `formula` | S8 |
| the A-value and the temperature | HUD `ΔG° = 7.3 kJ·mol⁻¹ (literature)` and `T = 298 K` — value-only, Rule 34b | HUD members **`a_value`** and **`temperature`** | S8 |
| population | two bars labelled `equatorial 95%` / `axial 5%`, bound live to the computation (N-15) | HUD member `population` | S8 |
| units | `°`, `pm`, `kJ·mol⁻¹`, `K` — real Unicode throughout | — | all |

**S1 carries NO formula surface** (chemistry block §I-6 adopted; Rule 34b permits zero). The states with no surface at all are **S1, S2, S3, S5 and S9**.

**(c) Chemistry variant of the direction/rule plan — the structural-validity ledger** (no reaction occurs, so there is no balanced-equation ledger; the right-hand rule is N/A):
Carbon is tetravalent in every frame and at every u. The formula is C₆H₁₂ at u = 0, at u = 1 and at every intermediate — asserted by the gate, not by narration. No bond is created or broken anywhere in the concept (this is Wave O-0; bond events are Engine C). The methyl at S7/S8 replaces exactly one H, so the formula becomes C₇H₁₄ and the surface says so from the instant it appears. State symbols and oxidation numbers are N/A. **The engine derives axial/equatorial from the pucker and never from an authored per-waypoint tag** (`ORGANIC_PHASE0_CONFORMATION.md` decision 6), and the gate asserts the tag set at u = 1 is exactly the inverse of the set at u = 0. **The S4 origin tint is the one identity that is NOT derived per frame** — it is fixed at state entry and invariant in u (N-10), which is precisely why it can carry the word "every". Every energy is a published table entry with a "(literature)" stamp; the engine computes no steric energy.

**(d) Motion plan** — exactly the archetype column of §3 with the timings of §5. No static state. No idle spin in S1–S8; S9's idle spin is about the view axis (N-20).

**(e) Modes** — `epic_l_path` only (Rule 20 [D]: no `mode_overrides`). `renderer_pair`: field_3d / field_3d, no second panel. `organic_structure.mode` per state: S1 `pucker` (driven by **`pucker.amplitude` 0 → 1 at u = 0**, N-12 — *not* a `planar` waypoint), S2 `pucker` (static chair pose, sight-along camera), S3 `pucker` (static chair), S4–S7 `pucker`, S8 `compare`, S9 `explore`. Every one of these is on the IMPLEMENTED list of §9E; none is DEFERRED.

**(f) Assessment + coverage_map + misconception_watch** — **7 questions** (schema floor `.min(6)`, `src/schemas/conceptJson.ts:339`), backward-designed, each with every wrong option keyed to an M1/M2/M3-class belief:

| q | Tested idea | `teaches_state` |
|---|---|---|
| q1 | cyclohexane is not planar, and why | S1 |
| q2 | in the chair, the bonds on neighbouring carbons are staggered, so nothing in the chair is eclipsed | S2 |
| q3 | each ring carbon carries one axial and one equatorial bond | S3 |
| q4 | **the flip exchanges axial and equatorial on every bond, and breaks none (the aha)** | **S4** |
| q5 | the boat has two fully eclipsed C–C bonds and the twist-boat has none; the half-chair is the highest point | S5 / S6 |
| q6 | a methyl group is less crowded equatorial, because of two 1,3-diaxial contacts | S7 |
| q7 | a **transfer** item — a bulkier group (*tert*-butyl) gives a stronger equatorial preference than methyl; no state stages it, and `coverage_map.notes` says so. *(P2-3: `tBu` is deliberately NOT selectable in S9 until its A-value is sourced, so the item stays transfer rather than becoming a sandbox exercise.)* | S8 (transfer) |

`by_state` covers S1–S8; `non_assessed_states: [STATE_9]`. `misconception_watch` is exactly the three entries of §4, on S1, S3 and S4 — and on no other state.

**(g) Macro↔micro (Rule 33) — N/A, and deliberately.** There is no macroscopic manipulable cause driving a separate microscopic mechanism; the molecule is the taught object at the only scale it has. Same precedent as `vsepr_molecular_shapes` and `bohr_model_energy_levels`. Recorded as a decided non-issue, not an omission. **Rule 33d does bind**: every instrument here shows a live number — the arcs, the torsion, the contacts, the energy rider and the population bars are all value-bearing, never decorative.
**Representation-triangle vertex per state** (`patterns/chemistry.md` §0): S1 particulate-leads · S2 particulate · S3 particulate · S4 particulate · S5 particulate · S6 particulate leads, symbolic supports (the energy value) · S7 particulate · S8 particulate leads, symbolic supports (the ratio) · S9 particulate. **The symbolic vertex never leads a core-ring state** — the only formula surface in a core state is `C₆H₁₂` (a label on a picture already seen), and S1/S2/S3 carry none at all.

**(h) Canvas budget (Rule 34)** — per state: **ONE** math-serif Unicode formula surface, and S1, S2, S3, S5 and S9 carry none; the on-canvas top caption is the ≤5-word delta cue of §3 and nothing else; all prose narration lives in the subtitle strip below the canvas. HUD is value-only, top-right at `top: 52px` or lower so it clears the review-chrome Full-screen button. Zone assignment, fixed across the concept so nothing collides: **HUD** top-right · **formula surface** left, mid-height · **graph** (S6 only) bottom-left · **sliders** bottom-right · **measurement labels** in-scene via `mgPlaceLabelClear`. No two overlays share a zone in any state, and each state shows only the overlays it needs.

**(i) Curriculum-flex block (Rule 38)** — §7 in full: both preset cuts written out and checked coherent, with the Cut-2 list corrected for the re-ringed `pose`; the explore state surfacing core-ring content only with no formula surface; `curriculum_tags` authored as claims with `needs_teacher_verification: true` on **every** cell, including CBSE core, with the basis recorded; the preset proposal derived from the rings by hiding only; the S6 graph-axis convention decided with neither an axis-swap nor a units toggle needed.

**(j) Engine contract this scenario must supply** — §9, **N-1 through N-20**, the §9E enum ledger (E-1 … E-10 landed before the freeze, plus the P2-6 IMPLEMENTED/DEFERRED data), and the reuse list. **Nothing in this DoD is buildable until those land**, and the pin column of §5 is not achievable at all until N-19 lands on master.

---

## Block 1 — Pass-1 strategic checklist

**Prerequisite cliff.** The load-bearing prerequisite is that carbon is tetrahedral at about 109.5° (`vsepr_molecular_shapes`, shipped). **Without it the concept breaks at S1**, whose entire argument is that 120° is a value carbon cannot hold — a student who does not know carbon's angle hears an assertion, not a reason. Patch, in S1's choreography: the arc appears on the flat ring reading 120.0° with a second, dimmed reference arc drawn at 109.5° beside it, and one narration clause names it — *"a carbon bond angle is about 109.5 degrees"*. That costs about eight words, adds a rendered reference rather than a lecture, and a student who already knows it reads it as a reminder. A second, lighter cliff sits at S6, where "energy barrier" is assumed; it is patched by the curve itself, which draws the barrier before naming it, and S6 is extended-ring so a syllabus that has not met the idea can hide it.

**JEE-backwards trace.** Target question, JEE Advanced in shape: *"Methylcyclohexane exists as two chair conformers. Identify the more stable one, explain why in terms of specific interactions, and state which bonds on carbon 1 exchange character during the flip."*

| Knowledge piece the answer needs | State that delivers it |
|---|---|
| cyclohexane is puckered, not planar | S1 |
| **the chair is the low-energy conformation because the bonds on neighbouring carbons are staggered, so nothing in the chair is eclipsed** *(revision 2 — matches S2's final narration; the withdrawn version said "every bond is staggered" of a flat ring the sim never renders, and S5 now cashes this row against two measured 0.0° boat torsions)* | **S2**, cashed at **S5** |
| each carbon carries one axial and one equatorial bond | S3 |
| the flip exchanges them on every bond, breaking nothing — so the two conformers are the same compound | **S4** |
| the flip is real and fast at room temperature, so both conformers are actually populated | S6 |
| the axial substituent has two 1,3-diaxial contacts and the equatorial one has none — the named interaction the question asks for | **S7** |
| the resulting population, and that it is a Boltzmann consequence of an energy difference | S8 |

Every piece is delivered. No state was added for the trace, and no piece is missing. The one thing the question could ask that this concept does not cover is a **disubstituted** ring (cis/trans-1,2-dimethyl), where the two conformers are not related by a simple preference — deliberately out of the atomic claim and belonging to a sibling concept.

**Misconception entry mapping.**
- **M1 (the ring is flat)** is planted long before this sim, by every hexagon the student has ever drawn — S1 confronts it directly rather than pretending it is not already there. Nothing in this concept re-plants it: after S1 the flat ring never reappears, including in the explore sandbox, whose `pucker.amplitude` is bounded to [0.85, 1.0] so it cannot return the ring to planar.
- **M2 (axial and equatorial are fixed labels on particular carbons)** is at genuine risk of being planted by **S3 itself**, if the axial family is revealed as a group and reads as "these carbons are the axial ones". The prevention is built into S3's choreography: the reveal is **per-carbon, not per-family in space** — the six axial bonds light up one per carbon around the ring, so the picture the student forms is "every carbon has one", and only then does the equatorial family follow the same path. A planting risk handled at the planting moment, which is the Rule-16 requirement.
- **M3 (a flipped chair is a different compound)** is planted by S4, the state that shows the flip — and confronted in the same state, by the continuously-drawn bonds and the unchanged C₆H₁₂ surface. Deliberately NOT deferred to S8, because S8 is advanced and vanishes under two of the three presets.
- No EPIC-C branches (EPIC-L-first directive).

---

## Block 2 — Aha-moment designation

**PRIMARY aha (the 10-year memory):** *the ring flips into an identical chair without a single bond breaking, and in doing so every axial bond has become equatorial — so "axial" was never a property of a carbon, only of a direction the molecule can trade away.*
Delivered at **S4**, `depth_ring: core`, inside `entry_state_map.foundational` (STATE_1 → STATE_4). ✔

**How the word "every" is carried on screen (revision 2).** It is carried by the six origin-tinted bonds of N-10, which start axial, keep one identity tint through the whole sweep, and stand equatorial at u = 1 — re-glowing once, after the traced bond, so Rule 32e holds. It is **not** carried by `ae_count`, which reads `axial 6 · equatorial 6` at both ends and is a symmetry identity, and it is **not** carried by narration alone, which a sound-off sim cannot do (Rule 24). The traced single bond makes the claim followable; the tinted set makes it universal.

**SUPPORTING aha (one):** at **S7** — *an axial group has two hydrogens sitting 274 pm away on the same face, closer than a carbon and a hydrogen fit, and the equatorial one has none.* This is the payoff of the primary: the swap only matters because the two positions are not equally roomy, and the primary only becomes predictive once the student can see which position a group ends up in.

**Cohesion check.** One supporting aha, and it depends on the primary in both directions: S7's contrast is unreadable without S3's a/e distinction and S4's demonstration that a group can move between them, and S4's swap is a symmetry curiosity until S7 shows it has a consequence. Nothing here stands alone; nothing belongs in a sibling concept. (I considered a third candidate — "the boat is not a stable shape, the twist-boat is" — and rejected it: it is genuine and examinable but reinforces neither aha, so it stays as S5 content rather than being promoted.)

**Wrong-belief setup, per aha.**
- **For the PRIMARY (S4):** S3 is the setup state, and it works by making the student *correctly* confident. S3 teaches a clean, true, satisfying classification — six axial, six equatorial, each carbon has one of each — and a classification invites the belief that the categories are permanent. The student leaves S3 confident and slightly wrong, which is exactly the condition the flip breaks. **S3 must therefore not hint that the labels can change**; a constraint on chemistry-author, not a stylistic note.
- **For the SUPPORTING (S7):** S4 is the setup, and its own symmetry does the work. In S4 the two chairs are indistinguishable, which quietly teaches "the flip changes nothing that matters". S7 puts one methyl group on the ring and that stops being true. This is why S4 and S7 are the declared contrast pair rather than two unrelated pucker states.

**Deep-dive cross-reference.** The three `has_prebuilt_deep_dive` states (S3, S4, S7) are the two aha states plus the setup state that carries the primary's wrong belief. The divergence from the Pass-1 cliff states (S1, S6/S8) is documented in §12.

---

## Open questions for `chemistry-author`

*(Revision 2: items 1–9 of revision 1 have been ANSWERED in the chemistry block §H and are folded into the body above. What remains are the items this revision creates or leaves live.)*

1. **§E-6's Cut-2 list needs one correction in YOUR document** (P1-1, flagged not edited): `pose` was ringed `core` and is now `extended`, so the `core_only` surviving-symbol list must drop every conformation name. The corrected list is in §7 of this skeleton.
2. **S4's final clause re-binds its focal** (P1-4): *"Every axial bond has become equatorial"* must bind to the **origin-tinted set**, not to the `ae_count` HUD line. Your §D-4 clause table binds it to `ae_count`, which reads identically at both ends and therefore shows nothing. The set re-glows at 11700–13500 ms in the revised §5, which is where the clause should sit.
3. **S2's narration is rewritten and its budget rises to ~52 words** (P1-5). It must make the claim on the chair: the six C–C bonds are all staggered, all six read the same, therefore nothing in the chair is eclipsed, therefore this is the low-energy shape. It must NOT reference the flat ring (off-screen) or claim anything about eclipsed hydrogens the sim does not draw.
4. **S5 gains one clause and one HUD line** (P1-5 payoff): name the two ring bonds at `φ = 0.0°` in the boat — fully eclipsed — against S2's "nothing in the chair is eclipsed". Your §A-7 already measured them; this is the state that spends the measurement. Budget rises to 46–55.
5. **State durations changed** (P1-3): the guided total is **145 s**, not your §D-0 proposal of 162 s, because the constraint `R ≥ (L+167)/0.60` that half of your calculation rested on does not exist — the pin is authored per scenario, not derived from `R`. Your beat *structure*, clause ordering and word counts are adopted unchanged; only the runtimes shrink. See §5.
6. **S9's `group` selector is restricted to `H | CH3`** (P2-3). If you want Cl, Br or OH selectable, ship their sourced A-values into the published table; otherwise the population bar has nothing to compute.
7. **Your §I-3, §I-4, §I-5, §I-6, §I-7 and §I-8 are ADOPTED in full** and are reflected in §7, §10 and §14 above: `barrier = 45 kJ·mol⁻¹` replaces `ΔG‡`; S8's surface becomes the symbolic ratio with `ΔG°` and `T` moved to the HUD; S7 gains a `C₇H₁₄` surface; S1 carries no surface; the S3 arc is the **C–C–H** angle at 109.46°, not the ax–C–eq angle (which is 107.50°); and "conformation" is dual-labelled at S5.
8. **Your §I-2 is ADOPTED**: the eclipsing claim is dropped from S1 entirely and the M1 counter-evidence is the angle alone. §2's change-2 rationale has been rewritten accordingly, and the torsional argument now lives where it is renderable (S2 → S5).
9. **Still open, and yours to close:** the flip-rate wording decision (§A-8), and the waypoint u-positions (chair 0 · half-chair 0.22 · twist-boat 0.36 · boat 0.50 · twist-boat′ 0.64 · half-chair′ 0.78 · chair′ 1.00), which are my proposal and must be agreed with the surgeon since they set both the pose and the graph's x-axis.

## Engine needs NOT covered by the drafted `organic_structure` contract — summary

Full detail in §9 and §9E; the summary, ordered by severity.

**The closed-enum ledger, closed by a two-directional diff against `ORGANIC_PHASE0_CONFORMATION.md:25-40` (§9E).** Ten pre-freeze changes: `hud_lines += distance · bond · temperature · a_value · atom_count · descriptor`; `controls += spin · chain_length`; `measure.kind += torsion`; `group += tBu`. **Revision 1's E-1 (`waypoint += planar`) is STRUCK** — planar is Q = 0, the centre of the Cremer–Pople sphere, not a point on the flip path; it is recorded instead as the FIELD addition `pucker.amplitude`, explicitly not freeze-blocking. `measure.kind` and `mode` close over **all 32 organic sims**, not over this concept and not over Wave O-0. Both DEFERRED lists are empty except `mode`'s, which ships as data with three gate assertions (P2-6).

**Contract fields that do not exist:** N-1 `show_h` · N-3 off-chair a/e semantics · N-6 `min_ring` on `hud_lines` · N-7 `pucker.draggable` · N-8 the `measure: []` family · N-9 the named-contact ban (contract-wide, plus a fixed methyl rotamer) · **N-10 `trace` over a SET with `tint_by: 'origin'` — the mechanism that carries the PRIMARY aha, and the one revision 1 under-specified to a single bond** · N-11 `pucker.walk` · N-12 `pucker.amplitude` · N-14 `compare` layout with a camera-basis lane · N-17 `reference_value_pm` at S5 · N-18 the glow-target vocabulary · **N-20 the `spin` axis and the Rule-37 idle default**.

**Tooling that does not exist, and is NOT renderer work:** **N-19, the frozen-pin registration.** Five sites in `deriveStateMeta.ts` (`:746`, `:1087`, a candidate branch beside `:2079` / `:2118`, `:3848`) plus the snap set at `field_3d_renderer.ts:76024`. Without it every state pins at `DEFAULT_REVEAL_MS = 1500` (`:698`, `:3520`) — before every payoff in §5 — and no concept JSON can fix that. **Do not copy the `nlb` `clamp(0.60·R, …)` heuristic at `:3213`; it is that branch's local rule.** Rule 40: this lands on master separately from any concept branch.

**Contract requirements that must be strengthened, not added:** N-2 real geometric knots with the boat and chair parameterisations both declared · N-15 live-bound bar labels on one shared ceiling · N-16 seven stationary points and ONE shared u · N-4 scenario self-centring via the metres-to-world helper.

**One contract decision the draft leaves ambiguous:** N-5, camera pose convention — `camera: {az, el, dist}` versus the fleet's `camera_position: [x,y,z]`. Since `camera_steps` already speaks az/el/dist, az/el/dist is the coherent choice, but it must be decided.

**Already shipped — do NOT rebuild** (Rule 40a sweeps run): `camera_steps` (`:492`, `:12374`, `:63742`) · `min_ring` on controls (`:1323`, `:55295`) · drag-seize (`:55294`, `:1313`) · `flat_basis` / `mgFlatSources` (`:58494`, `:58970`) · `mgIdealDirs` / `mgFrame` (`:58349`, `:58455`) · the pm-valued span line and `mgPlaceLabelClear` (`:59210-59229`, `:58541`) · `MG_BOND_LEN` (`:58205`).

**Probes the surgeon must run that I could not** (no renderer exists): the perspective re-solve of the HOME camera at real atom disc radii, **for the C–C–H arc S3 actually draws**; countability at each of the four pucker waypoints (the chair solve does not transfer); the traced bond's occlusion across the full sweep **and the simultaneous visibility of at least four of the six origin-tinted bonds at S4's pin**; the two 1,3-diaxial contact lines' mutual overlap; and the S8 pair's in-frame acceptance at t = 0, at the pin and at state end.
