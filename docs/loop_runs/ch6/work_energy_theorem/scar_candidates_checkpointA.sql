-- Checkpoint A scar candidates — ch6 concept #4 work_energy_theorem
-- Source: docs/loop_runs/ch6/work_energy_theorem/founder_proxy_A.md (cycle 0)
--
-- ⚠️ APPLY HAZARD 1 (recorded in this chapter, concept #2): every upsert below does
-- ON CONFLICT DO UPDATE SET ... status. Before applying, verify no row here is already
-- FIXED in the live table — a verbatim apply would silently reopen a closed row and
-- discard its fixed_at. Row 1 in particular UPDATES an EXISTING class rather than
-- minting a duplicate, so check its current status first.
--
-- ⚠️ APPLY HAZARD 2: row 6 is filed under owner_cluster 'peter_parker:visual_validator',
-- which is NOT a known member of the owner_cluster CHECK constraint (known members are
-- alex:architect / alex:physics_author / alex:json_author / peter_parker:field3d_surgeon /
-- peter_parker:renderer_primitives / peter_parker:runtime_generation). VERIFY the
-- constraint before applying; if it rejects, re-file under the cluster that owns
-- src/lib/validators/numeric/ rather than inventing a tag the constraint will bounce.

-- 1. UPSERT: sharpens the EXISTING reflow row rather than minting a duplicate class.
INSERT INTO engine_bug_queue (bug_class, title, severity, owner_cluster, root_cause, prevention_rule, probe_type, probe_logic, status, concepts_affected, fixed_in_files, discovered_in_session, row_type) VALUES (
 'shared_bar_scale_cross_state_guarantee_is_void_when_the_panel_reflow_ladder_drops_a_step',
 'A measured-and-reflowed panel changes rung between states through its CAPTION LINE COUNT, and the review iframe height is responsive so no rung is an invariant',
 'MAJOR','alex:architect',
 'The energy/work panel height is set by the tallest work-bar caption, which wraps by design (field_3d_renderer.ts L45017-25): a state captioned "net" measures 545.6 px at step 0 while the same panel captioned "by the pull"/"by friction"/"net" measures 560.5 px. The review sim iframe is responsive (1052x551 at a 1280x720 window, 1212x731 at 1440x900, 1692x911 at 1920x1080) and THE EYE captures at 1280x720, so the fit limit (window.innerHeight - 12, L45123) ranges over ~539-899 px. There is therefore always a ~15 px band of teacher window heights in which the two state classes land on DIFFERENT rungs, and no baseline can photograph it.',
 'Never assert a reflow rung as a design invariant, and never author a per-state panel whose height depends on caption line count. Equalise the panel content across every state so its measured height is IDENTICAL in all states (single-token work-bar captions: pull / friction / net), then the rung is whatever the teacher window selects and every state selects it together. State the iframe height RANGE in the skeleton, never one measured window size, and state THE EYE capture height separately.',
 'js_eval',
 'Set the sim iframe to each of 551, 720 and 911 px of height. For each height drive every state and collect getComputedStyle on .nlb_en_trk. Assert the set of track heights within one viewport has size 1 (identical across all states). Assert NOTHING about which value it is.',
 'OPEN', ARRAY['work_energy_theorem','conservation_of_mechanical_energy','mechanical_energy_loss_with_friction']::text[], ARRAY[]::text[], 'ch6-concept-4 checkpoint A', 'directive')
ON CONFLICT (bug_class) DO UPDATE SET title=EXCLUDED.title, severity=EXCLUDED.severity, root_cause=EXCLUDED.root_cause, prevention_rule=EXCLUDED.prevention_rule, probe_type=EXCLUDED.probe_type, probe_logic=EXCLUDED.probe_logic, concepts_affected=EXCLUDED.concepts_affected;

-- 2. NEW: the environment fact that was generalised from one measurement.
INSERT INTO engine_bug_queue (bug_class, title, severity, owner_cluster, root_cause, prevention_rule, probe_type, probe_logic, status, concepts_affected, fixed_in_files, discovered_in_session, row_type) VALUES (
 'one_measured_viewport_recorded_as_the_invariant_sim_size_in_the_chapter_state_file',
 'A single measurement of the responsive review iframe was written into the chapter record as THE iframe size, including a false claim that it governs every baseline',
 'MAJOR','alex:architect',
 'docs/loop_runs/ch6_state.md states the sim iframe "is 1052x551, not 1280x720, so two-group states drop a reflow rung on EVERY screen including every baseline". 1052x551 is one measurement at a 1280x720 browser window; #sim is width:100%/height:100% inside a flex stage, so the iframe is 1138x599 at 1366x768, 1212x731 at 1440x900 and 1692x911 at 1920x1080. Baselines are not captured at 551 at all: visual_eyes.ts passes no viewport and screenshotter.ts defaults to 1280x720. The next concept inherited the wrong number and built a load-bearing layout argument on it.',
 'A viewport-dependent number recorded in a chapter state file must be recorded as a RANGE with the window size each measurement was taken at, plus THE EYE capture size stated separately. Never write "on every screen including every baseline" for a quantity measured once.',
 'manual',
 'Grep the chapter state file and the current skeleton for a literal iframe pixel size. Any occurrence must carry the browser window it was measured at and must not be phrased as an invariant.',
 'OPEN', ARRAY['work_energy_theorem','conservation_of_mechanical_energy']::text[], ARRAY[]::text[], 'ch6-concept-4 checkpoint A', 'directive');

-- 3. NEW (P1 observed in design).
INSERT INTO engine_bug_queue (bug_class, title, severity, owner_cluster, root_cause, prevention_rule, probe_type, probe_logic, status, concepts_affected, fixed_in_files, discovered_in_session, row_type) VALUES (
 'nlb_sandbox_energy_envelope_computed_from_the_seed_lap_instead_of_the_full_wrap_span',
 'A sandbox energy envelope computed over the distance from the authored start to the first wrap under-states every later lap, because the wrap re-seeds the body at the far bound',
 'CRITICAL','alex:architect',
 'nlbBoundsM (field_3d_renderer.ts L47150-67) returns {lo:-length_m, hi:+length_m}, and the SEAM J wrap (L48204-05) does s1 -= span with v re-seeded to v0 and every ledger re-zeroed. The seed lap from initial_position_m is therefore SHORTER than every subsequent lap, which always covers the full 2*length_m. work_energy_theorem S6 computed 11.4 m from s0 = -5.4 and derived bar_max_J 300 / work_scale_J 360; the real per-lap distance is 12.0 m, giving K = 305.4 J (over bar_max_J, fires PM_NLB_ENERGY_SCALE and clamps the bar) and W_pull = 360.0 J (exactly the authored scale).',
 'A sandbox scale envelope is computed over the FULL wrap span hi-lo = 2*length_m, at the worst corner of the complete slider cross-product, never from the authored initial_position_m. Check the monotonicity of the target in each slider before picking a corner (K is decreasing in m whenever 0.5*v0^2 < mu*g*d, so the LIGHTEST mass is the worst case, not the heaviest).',
 'js_eval',
 'For each sandbox state: read length_m and the slider ranges, compute K and every |W| at the worst corner over d = 2*length_m, and assert each is at most 0.9 * its authored scale. Then drive the sandbox at that corner for 30 s and assert zero console lines beginning [PM_NLB_ENERGY_SCALE].',
 'OPEN', ARRAY['work_energy_theorem','conservation_of_mechanical_energy','mechanical_energy_loss_with_friction']::text[], ARRAY[]::text[], 'ch6-concept-4 checkpoint A', 'incident');

-- 4. NEW (P1 observed in design).
INSERT INTO engine_bug_queue (bug_class, title, severity, owner_cluster, root_cause, prevention_rule, probe_type, probe_logic, status, concepts_affected, fixed_in_files, discovered_in_session, row_type) VALUES (
 'state_end_of_loop_energy_numbers_derived_at_a_different_t_than_the_travel_table',
 'A skeleton computed a state position at t = R and its velocity, K and W at a different t, so the authored bar scale was set from a number the state never renders',
 'CRITICAL','alex:architect',
 'work_energy_theorem S4 (m=4, v0=-3, a=+3, R=2600) tabled s(2.6)=+3.94 m correctly but recorded v=+3.8 (the value at t=2.267 s), giving K=28.9 J and W_net=+10.9 J instead of the true 46.1 J and +28.1 J. The authored work_scale_J of 25 J is then exceeded by the real |W| peak of 28.1 J, so the bar clamps and fires PM_NLB_ENERGY_SCALE in a GUIDED state that the skeleton had argued could not reach the warn.',
 'Every per-state DoD row derives s, v, K and every W ledger from the SAME t = loop_reset_ms, and the skeleton shows the substitution for each. Any authored scale (bar_max_J, work_scale_J) is then set from that single consistent set with at least 10 percent headroom.',
 'js_eval',
 'For each guided state: read initial_position_m, v0, a and R from the skeleton table, recompute s(R), v(R), K(R) and W(R) from one t, and assert each matches the tabled value to display precision and that |W|max <= 0.9 * work_scale_J and Kmax <= 0.9 * bar_max_J.',
 'OPEN', ARRAY['work_energy_theorem']::text[], ARRAY[]::text[], 'ch6-concept-4 checkpoint A', 'incident');

-- 5. NEW (P2).
INSERT INTO engine_bug_queue (bug_class, title, severity, owner_cluster, root_cause, prevention_rule, probe_type, probe_logic, status, concepts_affected, fixed_in_files, discovered_in_session, row_type) VALUES (
 'nlb_checkpoint_W_capture_renders_the_work_bar_label_so_the_authored_stamp_string_never_ships',
 'A skeleton asserted the checkpoint stamp text verbatim, but the engine interpolates each work bar label into it',
 'MAJOR','alex:architect',
 'nlbCpStampText (field_3d_renderer.ts L46217-23) emits "W " + wk[w].label + " = " + value once PER work accumulator in the state, so capture:["W","K"] with a bar labelled "net" renders "flag:  W net = 10.0 J  ·  K = 20.0 J" (36 chars), not the "flag:  W = 10.0 J  ·  K = 20.0 J" (31 chars) the skeleton asserted in four places including its own acceptance probe. With a multi-word label the stamp grows further and can wrap the formula surface.',
 'A skeleton that asserts a stamp string reads the emitting function and quotes the interpolated form, counts its characters against the measured one-line width, and confirms how many accumulators the state authors (the W capture emits one clause per accumulator, not one per state).',
 'js_eval',
 'Pin the checkpoint state past its crossing and read #nlb_formula textContent. Assert it equals the authored formula plus exactly one stamp line per checkpoint, that the stamp matches /^<label>:  (W \S+ = [-0-9.]+ J  ·  )*/, and that the surface renders at most 2 lines.',
 'OPEN', ARRAY['work_energy_theorem','conservative_vs_nonconservative_forces']::text[], ARRAY[]::text[], 'ch6-concept-4 checkpoint A', 'directive');

-- 6. NEW (P2) — the residual after the channel-B fix. SEE APPLY HAZARD 2 ABOVE re owner_cluster.
INSERT INTO engine_bug_queue (bug_class, title, severity, owner_cluster, root_cause, prevention_rule, probe_type, probe_logic, status, concepts_affected, fixed_in_files, discovered_in_session, row_type) VALUES (
 'multi_word_bar_caption_is_invisible_to_the_calculator_sibling_composition_channel',
 'THE CALCULATOR channel B composes a symbol node with its value sibling only when the symbol node has no whitespace, so every multi-word work-bar caption stays unharvested',
 'MAJOR','peter_parker:visual_validator',
 'readoutHarvest.ts channel B (L180-202) requires the symbol node to be bare: length <= 12, no "=", and !/\s/.test(direct). The SEAM M work bars reuse the same nlb_en_sym/nlb_en_val pair (field_3d_renderer.ts L45025-26) but are captioned with a force NAME, so "by the pull" and "by friction" fail the whitespace test while "net" passes. The energy K bar now harvests correctly, which makes the remaining blindness easy to miss: the panel reports readings, just not the ones carrying the state claim.',
 'Author every work-bar label as a single token (pull / friction / normal / net) so the sibling-composition channel reaches it; where a multi-word caption is genuinely required, widen channel B to collapse internal whitespace before the bare test and re-run the negative control.',
 'js_eval',
 'Drive a state authoring work_accumulators, run HARVEST_READ, and assert one reading exists for EVERY rendered work bar caption plus one for every energy bar symbol. A rendered bar with no reading is this bug.',
 'OPEN', ARRAY['work_energy_theorem','positive_negative_zero_work','work_done_by_constant_force','conservation_of_mechanical_energy']::text[], ARRAY[]::text[], 'ch6-concept-4 checkpoint A', 'incident');
