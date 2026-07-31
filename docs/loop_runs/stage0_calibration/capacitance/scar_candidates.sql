-- ============================================================================
-- CANDIDATE engine_bug_queue rows — `capacitance`
-- founder-proxy, Stage 0 calibration, 2026-07-22 (EXPERIMENTAL chapter-loop trial)
--
-- *** NOT APPLIED. DO NOT RUN WITHOUT FOUNDER REVIEW. ***
-- Trial rule (docs/CHAPTER_LOOP.md §3.4): candidate scars stay FILES. No agent
-- and no loop session inserts them. The founder rules on each row (apply / edit /
-- discard) at chapter end.
--
-- Provenance: two blinded founder-proxy runs.
--   A1 = HEAD build (current, founder-approved, baseline-locked)
--   B  = pre-fix reconstruction (3 defects planted by the orchestrator, then reverted)
--
-- EXCLUDED as calibration artifacts (defects the orchestrator created, not repo
-- defects — see founder_proxy_report.md "Run B artifact warning"):
--   * field3d_scenario_ramp_ignores_drag_seize_in_guided_modes
--       (seize guards ARE present at HEAD; fixed by the founder in 95fe10c)
--   * field3d_new_scenario_dom_overlay_reuses_top12_corner_reserved_by_review_chrome
--       (both panels ARE at top:52px at HEAD; covered by the OPEN fleet row
--        field3d_sliders_panel_top12_vs_fsbtn_top10)
--
-- MERGED cross-run duplicates (bug_class is the upsert key, so one row each):
--   row 1 also discovered by B as graph_pane_axis_normalised_by_the_taught_slope_is_slope_invariant
--   row 2 also discovered by B as elementtype_blanket_opacity_zero_strands_sibling_label_sprites
--
-- NORMALISED by the orchestrating session (agent output used values outside the
-- column enums and would have failed on insert):
--   row_type  engine_defect/content_defect/process_gap -> 'incident'
--   probe_type 'automated' -> 'js_eval'
--   fixed_in_files NULL -> ARRAY[]::text[]  (all rows are OPEN; nothing fixed yet)
-- ============================================================================

INSERT INTO engine_bug_queue
  (bug_class, title, severity, owner_cluster, root_cause, prevention_rule,
   probe_type, probe_logic, status, concepts_affected, fixed_in_files,
   discovered_in_session, row_type)
VALUES

-- 1 ── CRITICAL. The graph that teaches "slope = C" cannot show C change. ──────
('field3d_graph_axis_normalised_by_slope_kills_slope_reading',
 'capacitance Q-V graph: Qaxis = C*Vaxis makes C cancel out of the plotted endpoint, so the trace is pinned corner-to-corner and renders byte-identically at C = 88.5, 177 and 44.3 pF -- the state that teaches "the slope IS the capacitance" is followed by two states that change C with zero visible slope change',
 'CRITICAL', 'peter_parker:renderer_primitives',
 'capDrawGraph computes Qaxis = Math.max(C * Vaxis * 1e9, 0.1) and plots p1 = px(vEnd, C*vEnd*1e9), so yFrac at V=Vaxis is identically 1 for every C; the live dot lands at (V/Vaxis, V/Vaxis), also C-independent. No numeric axis ticks are drawn, so no other cue signals the rescale. The concept JSON encodes the same error in computed_outputs.graph_Q_axis_max = 1.1*C*V_slider_max, which the renderer never reads.',
 'A graph pane whose SLOPE is the taught quantity must pin its dependent axis to a quantity-INDEPENDENT reference (a fixed authored max, or the max over the slider domain) and must draw numeric ticks on that axis. Never normalise an axis by the very variable the graph exists to display.',
 'js_eval',
 'Sample the drawn trace endpoint pixels (canvas getImageData) at two values of the taught quantity differing by >=2x and assert the endpoints DIFFER; additionally assert the measured pixel slope differs by >10% and that the dependent axis carries at least two numeric tick labels.',
 'OPEN', ARRAY['capacitance'], ARRAY[]::text[],
 'session_2026-07-22_stage0_calibration_founder_proxy', 'incident'),

-- 2 ── MAJOR. The formula''s own variables ship unlabelled. ───────────────────
('field3d_label_sprite_opacity_restored_by_id_not_elementtype',
 'capacitance: the "d" and "A" label sprites are zeroed on state entry with their bracket lines (shared elementType) but the per-frame fade-in restores opacity by ID only -- both labels render at opacity 0 forever, shipping C = eps0*A/d with A and d unlabelled on canvas',
 'MAJOR', 'peter_parker:renderer_primitives',
 'applyCapacitanceState zeroes every object whose elementType is cap_gap_bracket / cap_area_tag; updateCapacitanceFrame restores via capFindById("cap_gap_bracket") and capFindById("cap_area_bracket"), id lookups that match the tube lines but not the sibling sprites cap_gap_label / cap_area_label, which share the elementType but not the id.',
 'When a state-entry pass zeroes opacity BY elementType, the per-frame restore must also iterate BY elementType (or explicitly restore every id sharing that type). Never pair a type-wide hide with an id-specific show. After adding any labelled instrument, assert the label glyph is actually visible in a frozen frame.',
 'js_eval',
 'For each elementType blanket-zeroed on state entry, enumerate all scene objects of that elementType after the reveal window and assert material.opacity > 0.5 on each.',
 'OPEN', ARRAY['capacitance'], ARRAY[]::text[],
 'session_2026-07-22_stage0_calibration_founder_proxy', 'incident'),

-- 3 ── MAJOR. Dimension markers detach when the geometry morphs. ──────────────
('field3d_reference_marker_not_repositioned_by_geometry_morph',
 'capacitance capReposition moves plates, +/- markers and dot groups but leaves cap_area_bracket at its build-time z and cap_gap_bracket at its build-time x -- the A tag floats free in the gap once d changes, and the d bracket ends up inside the plate once A grows past hw=1.38',
 'MAJOR', 'peter_parker:renderer_primitives',
 'capReposition rescales areaBracket.scale.x and bracket.scale.z but never rewrites their positions; both were anchored to basePlateW / baseSep captured at build time.',
 'Every dimension-annotating marker (bracket, ruler, edge tag, and its label) must be repositioned in the SAME function that moves the geometry it annotates -- scaling alone is insufficient whenever the annotated body also translates.',
 'js_eval',
 'Set each geometry slider to min and max; for each reference marker assert its world-space endpoints still coincide (within tolerance) with the corresponding edges/faces of its referent mesh.',
 'OPEN', ARRAY['capacitance'], ARRAY[]::text[],
 'session_2026-07-22_stage0_calibration_founder_proxy', 'incident'),

-- 4 ── MAJOR. Guided states freeze while narration keeps talking. ─────────────
('field3d_guided_state_holds_end_pose_for_majority_of_narration',
 'capacitance S1-S5: choreography completes at 4-12s while the player timeline runs 21.0-25.8s, leaving 13.8-19.9s (up to 83% of S5) of a byte-identical frozen picture with narration still playing -- and authored duration (13-18s) is shorter than the narration, so deriveStateMeta clamped THE EYE dense capture and the dead tails were never photographed despite a 44/44 PASS',
 'MAJOR', 'alex:json_author',
 'Authored duration was set from the design ms-budget rather than the real narration timeline; the scenario has no ambient motion in modes switch_close / v_steps / v_sweep / area_morph / gap_morph, so once the one-shot completes the scene is literally static. S6 and S7 do carry ambient motion, so the engine is capable of it.',
 'Two-part: (1) author each state duration >= its computed narration timeline so the capture window spans the full spoken window; (2) every guided mode must carry ambient motion sustaining to the end of narration. Rule 31: motion may outrun narration, never the reverse.',
 'js_eval',
 'Compute narrationMs per state from tts_sentences; assert authored duration*1000 >= narrationMs; then byte-compare consecutive dense frames across [0, narrationMs] and fail if the longest identical run exceeds 0.25 * narrationMs.',
 'OPEN', ARRAY['capacitance'], ARRAY[]::text[],
 'session_2026-07-22_stage0_calibration_founder_proxy', 'incident'),

-- 5 ── MAJOR. The reveal is on screen before the setup. ───────────────────────
('field3d_hud_prints_taught_quantity_before_the_state_that_names_it',
 'capacitance: the C = 88.5 pF HUD line is emitted unconditionally from STATE_1 (visible alongside Q = 0.03 nC before charging completes), spoiling the STATE_3 "name the slope" reveal and pre-spending the STATE_2 PRIMARY aha whose drama is a ratio that never ticks',
 'MAJOR', 'peter_parker:renderer_primitives',
 'updateCapacitanceFrame appends the C line to cap_readout with no per-state gate; the JSON exposes show_ratio_readout but no equivalent show_c_readout, so json_author had no way to honour the skeleton DoD ("capacitance | HUD C = 88.5 pF | S3+").',
 'Every HUD line naming a quantity the arc reveals later must be individually gated by a per-state config flag, authored against the skeleton DoD symbol-appearance table. A readout panel is not exempt from teach_do_not_prespoil_a_later_reveal.',
 'manual',
 'For each state frozen frame, extract HUD text and assert every symbol present has first-appearance state <= this state per the skeleton DoD symbol-label table.',
 'OPEN', ARRAY['capacitance'], ARRAY[]::text[],
 'session_2026-07-22_stage0_calibration_founder_proxy', 'incident'),

-- 6 ── MAJOR. The micro layer flatlines over most of the sandbox range. ───────
('field3d_micro_pool_saturates_below_explore_slider_ceiling',
 'capacitance dot pools use min(1, Q/2.2nC)*64 while the S7 sliders reach Q = 10.62 nC -- the plate-face charge pools pin at 64 dots across roughly 80% of the sandbox range, so the Rule 33 micro layer stops responding exactly where a teacher demonstrates "more area / smaller gap -> more charge"',
 'MAJOR', 'peter_parker:renderer_primitives',
 'CAP_QREF_NC = 2.2 was sized for the guided states (max Q = 2.12 nC) and never re-derived against the explore slider ranges, whose worst case the physics block itself computed as Q ~ 10.6 nC.',
 'Any count/density normaliser for a micro-layer pool must be derived from the WORST-CASE value reachable by the explore sliders, not from the guided-state maximum -- or must switch to a non-saturating encoding above the reference.',
 'js_eval',
 'Set explore sliders to the corner maximising the taught extensive quantity; assert the visible micro-element count differs from the count at the default pose AND from the count at 50% of the range.',
 'OPEN', ARRAY['capacitance'], ARRAY[]::text[],
 'session_2026-07-22_stage0_calibration_founder_proxy', 'incident'),

-- 7 ── MAJOR. The derivation state never closes numerically. ──────────────────
('field3d_derivation_panel_symbolic_only_numbers_never_substituted',
 'capacitance S6 (the advanced-ring derivation, the sole justification for the +1 state): capUpdateDerivation receives Q, A and D and references none of them -- the chain renders as four symbol-only lines instead of the specified sigma = 106.2 nC/m2 -> E = 12000 V/m -> V = 12 V -> C = 88.5 pF, so nothing on screen demonstrates the chain closes',
 'MAJOR', 'peter_parker:renderer_primitives',
 'capUpdateDerivation(cd, t, Q, A, D) pushes hardcoded symbolic strings; the live values are passed in and discarded.',
 'A derivation state must SHOW the substitution, not just the algebra -- each docking line carries the live number computed from the state pose, and the final line closes on the HUD value. A symbol-only chain is whiteboard content and adds nothing over the teacher (Rule 24).',
 'js_eval',
 'For the derivation state, assert every rendered chain line matches /[0-9]/ and that the final line value equals the cap_readout C value to displayed precision.',
 'OPEN', ARRAY['capacitance'], ARRAY[]::text[],
 'session_2026-07-22_stage0_calibration_founder_proxy', 'incident'),

-- 8 ── MODERATE. Opposite-sign pools merge at the explore corner. ─────────────
('field3d_opposite_sign_pools_indistinguishable_at_explore_extremes',
 'capacitance S7: at A=0.025 / d=0.0005 the plates nearly coincide, the + and - markers (authored at identical x,y differing only in z) sit side by side, and the two charge pools interleave into one red/blue speckle block seen through a 0.5-opacity plate -- at the corner a teacher would actually drive to, you cannot tell which charge sits on which plate',
 'MODERATE', 'peter_parker:renderer_primitives',
 'Sign markers share the same (x,y) on both plates; the dot pools inherit default transparent depth sorting instead of the depthTest:false / renderOrder>=998 treatment already prescribed for this scenario family by pp_probe_and_sheet_arrows_camouflaged_by_translucent_plate_blend.',
 'Extends the parallel-plates camouflage rule to sign markers and charge pools: place opposite-sign markers at DISTINCT screen-separated anchors, and give any primitive sitting at or inside a translucent plate depthTest:false + depthWrite:false + renderOrder >= 998. Verify at the explore slider corner, not only at the default pose.',
 'manual',
 'Screenshot the explore state at the min-separation / max-area corner; assert the + and - markers are separated by more than one marker width and that each dot pool is contiguous and not interleaved with the opposite pool.',
 'OPEN', ARRAY['capacitance'], ARRAY[]::text[],
 'session_2026-07-22_stage0_calibration_founder_proxy', 'incident'),

-- 9 ── MAJOR. Five of six authored scenario_cues have no consumer. ────────────
('scenario_cue_authored_but_mode_driven_off_raw_at_ms',
 'capacitance authors 6 scenario_cues but only link_1/2/3 route through cueTriggerMs -- switch_close, v_step_1, v_sweep_start, area_morph_start and gap_morph_start are silent no-ops, and S2''s first V-step fires at 1000ms while the sentence naming "six volts" is still speaking',
 'MAJOR', 'peter_parker:renderer_primitives',
 'Only capLinkCueMs wraps its times in cueTriggerMs(); the v_steps / v_sweep / area_morph / gap_morph / switch_close branches call capRamp(t, cd.*_at_ms, ...) directly. The authored scenario_cue on each narrating sentence therefore has no consumer, so choreography is pinned to hardcoded ms and desyncs on any narration re-pacing.',
 'Every timed one-shot in a scenario must read its trigger through cueTriggerMs("<cue>", <at_ms fallback>) in the SAME change that adds the ramp. A scenario_cue authored in the JSON with no cueTriggerMs consumer in the renderer is a silent contract break -- grep the cue name in the renderer before accepting the JSON.',
 'js_eval',
 'For every scenario_cue string in the concept JSON, assert a matching cueTriggerMs("<cue>", ...) call exists in that scenario''s renderer block.',
 'OPEN', ARRAY['capacitance'], ARRAY[]::text[],
 'session_2026-07-22_stage0_calibration_founder_proxy', 'incident'),

-- 10 ─ MODERATE. Rule 38b: core-ring explore inherits advanced-ring visuals. ──
-- SCOPE CORRECTED by the orchestrating session: the agent's original row also cited
-- the STATE_7 formula, which was a calibration artifact (HEAD correctly reads
-- "C = Q / V", fixed by the founder in 95fe10c). The field-lines half is REAL at
-- HEAD and verified: STATE_7 depth_ring = core, show_field_lines = true,
-- cap_field_lines in visible_elements, field lines introduced in STATE_6 (advanced).
('explore_state_surfaces_non_core_ring_visuals',
 'capacitance STATE_7 is depth_ring core but ships show_field_lines:true and cap_field_lines in visible_elements, while field lines are introduced in STATE_6 (advanced) -- under a core-only preset the sandbox shows a visual the surviving lesson never taught (Rule 38b)',
 'MODERATE', 'alex:json_author',
 'Rule 38b was applied to the explore state''s formula surface but not to its visible_elements: the field-line visual inherited from the advanced derivation state was never audited against the explore state''s own core ring. The architect skeleton specifies S7 as "core (ring-neutral)".',
 'Rule 38b gate: for the explore state, every rendered formula string AND every visible_element must be traceable to a state whose depth_ring is core. Audit both surfaces together -- a ring-correct formula with ring-incorrect visuals is still incoherent under a reduced preset.',
 'sql',
 'Parse the concept JSON: for the state with advance_mode interaction_complete, assert its formula surface and each visible_element first appear in a state whose depth_ring == "core".',
 'OPEN', ARRAY['capacitance'], ARRAY[]::text[],
 'session_2026-07-22_stage0_calibration_founder_proxy', 'incident'),

-- 11 ─ MAJOR. Process gap: neither harness tests the teacher-control surface. ─
-- Filed on ORCHESTRATOR-VERIFIED evidence, not on the agent's original evidence
-- (which cited the planted dead sliders). The harness gap is real independent of
-- that: founder_drive.ts drags only at exploreIdx = stateCount - 1, and THE EYE
-- captures the raw sim (no review chrome, no input events).
('eye_and_drive_harnesses_blind_to_guided_state_control_behaviour',
 'Neither visual gate exercises the teacher-interaction surface: THE EYE captures the RAW sim (no review chrome, no input events) and founder_drive drags sliders ONLY in the final explore state -- so a guided state whose control is clobbered by its own scripted ramp, and any overlay collision with the review chrome, are invisible to both, fleet-wide',
 'MAJOR', 'peter_parker:visual_validator',
 'src/scripts/founder_drive.ts computes exploreIdx = stateCount - 1 and performs its trusted drags only there; THE EYE screenshots the un-wrapped sim HTML so the review chrome (#fsBtn / #wgBtn / #simPenBar) is never in frame. Separately, the H2 regression tolerance of 0.02 is wider than an on-canvas text change, so a wrong formula string on the explore state passes 44/44.',
 'Extend founder_drive to trusted-drag EVERY state that declares controls, asserting readout-vs-label agreement after the state''s ramp window closes; and to measure every overlay bounding box against #fsBtn / #wgBtn / #simPenBar on the BUILT review page rather than the raw sim. Consider a text-region-sensitive check that H2''s pixel tolerance cannot absorb.',
 'js_eval',
 'Per state with a non-empty controls list: drag, wait past max reveal, assert the derived readout reflects the dragged value and equals the slider label. Per state: assert zero overlay/chrome rect intersection on the built review page.',
 'OPEN', ARRAY['capacitance','wheatstone_bridge'], ARRAY[]::text[],
 'session_2026-07-22_stage0_calibration_founder_proxy', 'incident');
