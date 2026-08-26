-- Scar candidates — desk A (`feat/rotmech-a`), 2026-08-04
--
-- Source: founder-proxy Checkpoint B on `conservation_of_angular_momentum`.
-- NOT APPLIED. Desk guardrail 9 forbids engine_bug_queue DB writes on this desk —
-- scars are files here. The office/Desk E applies these.
--
-- Checked against docs/loop_runs/rotmech/_engine/scar_candidates.sql (0c-2's file):
-- no bug_class collisions.
--
-- One file per writer per _progress/README.md — never append to a shared scar file.

INSERT INTO engine_bug_queue (bug_class, title, severity, owner_cluster, root_cause, prevention_rule,
  probe_type, probe_logic, status, concepts_affected, fixed_in_files, discovered_in_session, row_type) VALUES

('field3d_arrowhelper_shaft_occluded_inside_the_axis_mesh_it_is_drawn_along',
 'A vector arrow drawn along an axle renders only its cone head — the Line shaft is hidden inside the opaque cylinder',
 'CRITICAL','peter_parker:field3d_surgeon',
 'THREE.ArrowHelper builds its shaft as a zero-width THREE.Line. rigid_body_rotation places the L arrow on the axle centreline at (0,+/-0.22,0) while the axle is an opaque CylinderGeometry of radius 0.07, so the entire shaft is occluded and only the fixed-size 0.24 cone head protrudes. Magnitude is then communicated solely by head POSITION (a ~31 px shift between L=4.59 and L=2.29), and the authored reveal-in never reads. STATE_6''s whole misconception payload (L is a vector, the arrow flips) is carried by a floating text label instead.',
 'A vector primitive drawn coincident with, inside, or along another mesh must have a shaft radius exceeding that mesh, or be laterally offset clear of it, plus depthTest:false + depthWrite:false + renderOrder >= 998. Never use ArrowHelper''s Line shaft where the arrow shares an axis with solid geometry.',
 'js_eval',
 'Capture the same state at two |L| values differing by >= 2x with the occluding mesh hidden; assert the arrow''s own drawn pixel extent scales by >= 1.8x. Identical or head-only extent = FAIL.',
 'OPEN', ARRAY['conservation_of_angular_momentum']::text[], ARRAY[]::text[],
 'founder_proxy checkpoint B rotmech desk A 2026-08-04','incident'),

('field3d_force_arrow_collinear_with_and_indistinguishable_from_the_member_it_acts_on',
 'A force arrow whose length at the taught minimum matches the rod overhang it is drawn onto reads as part of the apparatus',
 'CRITICAL','peter_parker:field3d_surgeon',
 'rbrArrowLen(3.60 N) = 0.070*3.60 = 0.252 world units — above the 0.16 floor, but almost exactly the rod''s own 0.20-unit tip overhang, and positioned tail-outward from the mass directly onto it in a near-identical pale tone. At the cause beat of the PRIMARY aha the only visible cue is the text label. Compounded by F = m*omega^2*r with omega proportional to 1/I: the arrow is smallest exactly when it must be seen and largest after the slide has ended. Prior diagnoses attributed this to the minimum-length floor, which is not the mechanism.',
 'A force arrow must be separable from the structural member it acts on by colour AND depth, not by length alone, and must be verified at the SMALLEST magnitude the guided states reach — not only at explore-range extremes. Where the arrow scales inversely with the beat''s progress, verify at the beat''s opening frame.',
 'js_eval',
 'At the guided-minimum force, sample canvas pixels along the arrow axis with the structural member hidden, then again with it shown; assert the arrow contributes distinct non-background ink in both. Zero delta = camouflaged = FAIL.',
 'OPEN', ARRAY['conservation_of_angular_momentum']::text[], ARRAY[]::text[],
 'founder_proxy checkpoint B rotmech desk A 2026-08-04','incident'),

('field3d_sign_colour_convention_applied_to_the_arrow_but_not_its_label_or_readouts',
 'A signed-quantity colour convention wired to one mesh leaves the label and HUD digits at the positive colour forever',
 'MAJOR','peter_parker:field3d_surgeon',
 'physics_block callout 5 requires L''s arrow, label and signed readouts to take one colour at spin_sign +1 and another at -1 so a teacher reads the sign before the number. RBR_NEG_COLOR has exactly one consumer (lArrow.setColor); rbr_l_label is built with RBR_POS_COLOR and its per-frame update sets position only, and no readout row consumes sign at all. Since the arrow shaft is itself occluded, the convention has zero on-screen presence.',
 'A sign-encoded colour convention must be applied at EVERY consuming surface enumerated in the physics block — mesh, sprite label, and HUD row — and verified by sampling ink colour at both signs, never by confirming the constant exists.',
 'js_eval',
 'Sample rendered ink colour of the arrow, its sprite label and each signed HUD row at spin_sign +1 and -1; assert every enumerated surface changes hue. Any surface unchanged = FAIL.',
 'OPEN', ARRAY['conservation_of_angular_momentum']::text[], ARRAY[]::text[],
 'founder_proxy checkpoint B rotmech desk A 2026-08-04','incident'),

('authored_camera_leaves_the_apparatus_at_half_the_fleet_linear_scale',
 'An authored camera_position never calibrated against shipped exemplars leaves the machine a postage stamp in a mostly-empty frame',
 'MAJOR','alex:json_author',
 'camera_position [6.2, 3.8, 6.2] (norm 9.55) on 7 of 8 states puts the apparatus at 18.7 percent of canvas width and ~5 percent of area, against 38 percent (block_on_incline) and 30 percent (capacitance) for approved baseline-locked field_3d exemplars. Its 23.4 degree elevation additionally foreshortens the radial rod to 0.40x when edge-on, so the frozen pose that Rule 37 holds for the class shows r=0.80 as visually identical to r=0.20. Nothing in the pipeline compares authored framing to the fleet, so a distance chosen once at design time ships unchallenged.',
 'An authored camera_position must be calibrated against at least two shipped baseline-locked concepts on the same renderer before build sign-off, and where the apparatus rotates, the taught extent must stay readable at EVERY spin phase — not only at the phase the frozen capture happens to catch.',
 'js_eval',
 'Project every drawn family''s bounding box to NDC at the authored camera; assert the apparatus spans >= 0.55 of the smaller NDC axis. For a rotating radial member, repeat at 8 evenly spaced theta and assert the worst-case projected extent >= 0.6 of the best case.',
 'OPEN', ARRAY['conservation_of_angular_momentum']::text[], ARRAY[]::text[],
 'founder_proxy checkpoint B rotmech desk A 2026-08-04','incident'),

('explore_state_zero_narration_encoded_as_empty_text_en_pending_schema_affordance',
 'Sanctioned interim: an explore state with zero authored narration ships a single tts_sentence with empty text_en until the schema allows an empty array',
 'MODERATE','alex:json_author',
 'conceptJson.ts requires teacher_script, requires tts_sentences .min(1), and puts no .min(1) on text_en — so the only legal encoding of Rule 31''s "explore = 0 words" is a lone sentence with text_en "". All three consumers handle it safely (no Sarvam call, no caption collapse, Rule 37 free-run verified live at 19 s). Of 150 concepts exactly one uses it. Left unmarked it will spread by copy-paste across the remaining rotmech desks and become undocumented fleet idiom.',
 'text_en "" on an interaction_complete state is a SANCTIONED interim encoding, not a defect and not a pattern to invent freshly. Desks must reference this row when adopting it; the durable fix is a conceptJson.ts affordance allowing tts_sentences [] when advance_mode is interaction_complete, landed on master by the office per Rule 40 — never on a chapter branch. Never fabricate narration for an explore state to route around the schema.',
 'sql',
 'SELECT concept_id FROM a scan of src/data/concepts for text_en "" — every hit must be an interaction_complete state and must be listed in concepts_affected on this row.',
 'OPEN', ARRAY['conservation_of_angular_momentum']::text[], ARRAY[]::text[],
 'founder_proxy checkpoint B rotmech desk A 2026-08-04','directive');

-- ─────────────────────────────────────────────────────────────────────────────
-- RECURRENCES — UPDATE the existing rows, do NOT mint new bug_class strings.
--
--   graph_marker_label_clipped                        FIXED -> reopen
--       Recurs as S4's tick caption ("if energy stayed constant") overflowing its
--       panel and clipping at canvas x=0 — on the concept's supporting-aha state,
--       which is the exact case that row's own prevention rule names.
--
--   field3d_position_vector_foreshortened_3q_camera   FIXED -> reopen / cross-ref
--       Recurs as the S3/S4 frozen poses: r = 0.80 reads as ~71 px of mass
--       separation against 191 px at the identical r and camera in S1.
--
-- And add 'conservation_of_angular_momentum' to concepts_affected on each of:
--   VISUAL_ARROW_HEAD_BURIED                                        (OPEN)
--   pp_probe_and_sheet_arrows_camouflaged_by_translucent_plate_blend (FIXED)
--   applied_force_arrow_invisible                                    (FIXED)
