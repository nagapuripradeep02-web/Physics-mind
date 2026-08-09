-- ============================================================================
-- ch6 · teaching-dwell + point-marker session (2026-08-08)
--
-- Founder review of the two ch6 sims: the motion was over before it could be
-- read, and the checkpoint "flags" were an unexplained object. Outcome: the
-- SEAM-M checkpoint seam gained a teaching DWELL (physics holds on a stamped
-- crossing) and a track-level POINT marker form; both concepts re-authored to
-- teach from named points A/B.
--
-- NOT APPLIED. Apply with the standard seed-script contract after founder
-- review. `bug_class` is the upsert key.
-- ============================================================================

-- 1 ─ the seam this session built (engine, FIXED)
INSERT INTO engine_bug_queue (
  bug_class, title, severity, owner_cluster, root_cause, prevention_rule,
  probe_type, probe_logic, status, concepts_affected, fixed_in_files,
  discovered_in_session, row_type
) VALUES (
'nlb_checkpoint_crossing_has_no_teaching_dwell',
'A checkpoint stamps in one frame and the body keeps going, so the stamp the state exists to teach is at its own instant for ~16 ms',
'MAJOR', 'peter_parker:field3d_surgeon',
'nlbRunCheckpoints stamps on the frame that NOTICES a crossing and nothing holds the scene, so the pose the stamp describes is gone one step later. The live instrument and the latched stamp then disagree for the rest of the state (the closed nlb_latched_checkpoint_stamp_and_the_live_work_bar row measured agreement on ZERO frames of ZERO cycles), and a frozen pin has no beat to land on. FIXED: an optional per-checkpoint dwell_ms holds the WHOLE SCENE''s physics (hPhys = 0 on the one dt every integrator branch reads) for a bounded window anchored on note 11b''s crossing instant, with dwell_from_pass gating which pass pauses, the resume frame integrating only its active tail so folds stay exact, a mandatory #nlb_slowmo "paused: <label>" badge, sandbox/trusted-drag carve-outs, and loop_reset_ms deferral to the dwell end.',
'A state whose delta cue names what a crossing SHOWS authors dwell_ms on that checkpoint plus an eye_capture_ms inside the window. Never hold physics without the on-canvas badge - an unlabelled still body teaches a = 0. Never site a scene hold on the per-body latch branch (it zeroes b.v) and never use an epsilon dt (hPhys is only multiplied downstream, so exact 0 is what keeps a held frame byte-stable).',
'js_eval',
'For each state authoring checkpoints[].dwell_ms: drive the sim live and assert that across every window PM_nlbDwell.active is true, PM_nlbDtPhysics === 0, and max|ds| = max|dv| = 0 over the held frames; assert the resume frame''s dt equals (t_ms - until_ms)/(t_ms - _tPrevMs) * h; assert two SET_TIME_FREEZE pins inside one window hash identically; assert zero [PM_NLB_DWELL] warns on a correctly authored loop_reset_ms.',
'FIXED',
ARRAY['conservative_vs_nonconservative_forces','work_energy_theorem','kinetic_energy_definition']::text[],
ARRAY['src/lib/renderers/field_3d_renderer.ts']::text[],
'ch6 teaching-dwell session (2026-08-08)', 'incident');

-- 2 ─ the premise the surgeon refuted while building #1 (OPEN)
INSERT INTO engine_bug_queue (
  bug_class, title, severity, owner_cluster, root_cause, prevention_rule,
  probe_type, probe_logic, status, concepts_affected, fixed_in_files,
  discovered_in_session, row_type
) VALUES (
'nlb_dwell_holds_one_step_past_the_crossing_so_the_live_bars_still_trail_the_stamp',
'A checkpoint dwell freezes the scene one integrator step AFTER the crossing, so the live work bars and the stamp still disagree by one step of work',
'MODERATE', 'peter_parker:field3d_surgeon',
'The crossing detector can only notice a crossing after the step that made it, so note 11b back-interpolates every STAMPED quantity to the exact crossing instant while the live instruments keep their post-step values. The dwell freezes the post-step pose, not the crossing pose. Measured on conservative_vs_nonconservative_forces STATE_2 pass 2 at a pinned dwell frame: bars -40.6 J / -99.2 J against a stamp of -41.4 J / -98.6 J, exactly one step (mg sin25 = 20.7 N over ds = 0.0456 m = 0.94 J). The dwell turns an unbounded, ever-growing discrepancy into a bounded one-step one, but does NOT make the two surfaces agree - the working assumption when the dwell was specified.',
'Do not claim a dwell reconciles a latched stamp with a live instrument. The reading-order qualifier (NLB_WK_CAP_LIVE "Work done so far") is what makes the pair honest; the dwell only bounds the gap. Closing it numerically means rewinding s, v and every W ledger by (1-f) of the crossing step for every body - a second mechanism that must stay in sync with note 11b, and a founder decision, not a ride-along.',
'js_eval',
'At a SET_TIME_FREEZE pin inside a dwell window, read the rendered work-bar values and the stamped values from the formula surface and assert their difference is at most one step of the authored force (|F_along| * |v| * h) - flagging any state where that bound is exceeded, and reporting the residual so authoring can decide whether the qualifier is present.',
'OPEN',
ARRAY['conservative_vs_nonconservative_forces','work_energy_theorem']::text[],
ARRAY[]::text[],
'ch6 teaching-dwell session (2026-08-08)', 'incident');

-- 3 ─ the marker form (engine FIXED; content half closes as concepts adopt it)
INSERT INTO engine_bug_queue (
  bug_class, title, severity, owner_cluster, root_cause, prevention_rule,
  probe_type, probe_logic, status, concepts_affected, fixed_in_files,
  discovered_in_session, row_type
) VALUES (
'nlb_checkpoint_flag_marker_occludes_body_at_track_level',
'The newtons_laws_body checkpoint marker is a 1.05-unit post on the overlay lane, so it draws straight through the block standing on it - and a post is the wrong object for a teaching point the engine already calls "point N"',
'MAJOR', 'peter_parker:field3d_surgeon',
'nlbMkMakeMarker built every checkpoint as a post plus a cross-tick with depthTest:false and renderOrder 940 (NLB_MK_RENDER_ORDER), the overlay lane the two PREDICTION markers legitimately need so a computed place stays findable over the apparatus. A checkpoint is not that: it is a fixed teaching point ON the track where a value is read, and at track level the overlay lane means the marker is drawn on top of the body sitting on it. Recorded as CF-4 in founder_proxy_A_cycle2.md L195-200 and as the MAJOR eye_walker finding on conservative_vs_nonconservative_forces. The engine had already named the object correctly - the built-in caption is literally "point " + (c+1) - so only the mesh and its depth lane were wrong.',
'Depth lane is a STATEMENT about what an object is, not a legibility knob. An overlay-lane mesh (depthTest false) claims "I am a diagram drawn ON the picture" and is right for ink that must be findable over any geometry; a mesh that represents something physically ON the apparatus must keep depthTest true, or the picture asserts it floats in front of every solid it is actually under. Before giving any new scene object the shared overlay constants, ask which of the two it is. Corollary: verify occlusion by driving the body ONTO the marker and reading the frame - a marker at the right metre with the wrong depth lane passes every position probe, every visibility probe and every glow probe, because none of them can see who wins a pixel.',
'js_eval',
'For each visible newtons_laws_body checkpoint whose config sets marker:"point", pin a time at which |body.s - cp.s_m| is under half the body length and assert the dot contributes ZERO pixels (sample the dot centre projected to screen and assert it is not within tolerance of NLB_CP_COLOR). Independently assert PM_nlbMarkers.meshes[id].dotVisible is true at that same instant - visible-and-occluded is the pass, invisible is a different bug. Static half: assert no mesh registered under elementType nlb_marker sets depthTest:false unless its id is marker_true, marker_ghost or marker_h_ref.',
'FIXED',
ARRAY['conservative_vs_nonconservative_forces','work_energy_theorem','kinetic_energy_definition','work_done_by_constant_force','positive_negative_zero_work']::text[],
ARRAY['src/lib/renderers/field_3d_renderer.ts']::text[],
'ch6 teaching-dwell session (2026-08-08)', 'incident');

-- 4 ─ the caption lane that followed from #3 (engine, FIXED)
INSERT INTO engine_bug_queue (
  bug_class, title, severity, owner_cluster, root_cause, prevention_rule,
  probe_type, probe_logic, status, concepts_affected, fixed_in_files,
  discovered_in_session, row_type
) VALUES (
'nlb_point_marker_caption_keeps_the_post_lane_so_it_floats_away_from_the_dot_it_names',
'A marker rendered in ''point'' form kept the caption lane sized to clear a 1.05-unit POST that is not drawn, so on a tilted track the caption floated ~90 px diagonally up-slope from the dot it names',
'MAJOR', 'peter_parker:field3d_surgeon',
'NLB_MK_LABEL_LANE = NLB_MK_H + 0.30 = 1.35 surface-local units is the clearance a marker POST TIP needs. The point form hides the post and draws a r=0.07 dot at y=0.05, but every caption on the lane - nlbMkPlace''s placement AND nlbStackMarkerLabels'' every-frame home reset - used the one constant. Because the lane runs along the SURFACE NORMAL, the displacement is up-AND-ACROSS on a ramp: measured on conservative_vs_nonconservative_forces STATE_4 (theta 25), caption "point B" centroid (676.5, 242) px vs its dot (712, 323) px = 88.4 px; STATE_2 87.7 px. Both captions formed a floating row above the ramp, so two named points had to be paired by left-to-right order instead of read. FIXED: a per-form home lane resolved through one funnel that reads the DRAWN mesh (dot visibility), derived as dot top + caption ink half-height + the shared inter-label gap = 0.35. Measured after: 18.8 px and 20.2 px, straight above.',
'A marker whose form is a DECISION (post vs painted mark vs anything later) needs its home lane resolved PER FORM from what is actually drawn, never one constant sized for the tallest form. Resolve it through a single funnel that reads the rendered mesh, not the authored field, so every placement and every per-frame reset agree by construction and the reset stays memoryless under SET_TIME_FREEZE. Derive the lane from the geometry it must clear, never a hand-tuned number.',
'js_eval',
'For every checkpoint whose resolved marker form is ''point'' and whose dot mesh is visible and un-occluded: project the dot centre and the caption sprite centre to screen px and assert the distance is under 35 px AND the caption centre is ABOVE the dot centre with under 20 px of horizontal offset. Repeat at the state''s authored theta and at the theta slider''s min and max.',
'FIXED',
ARRAY['conservative_vs_nonconservative_forces']::text[],
ARRAY['src/lib/renderers/field_3d_renderer.ts']::text[],
'ch6 teaching-dwell session (2026-08-08)', 'incident');

-- 5 ─ THE CALCULATOR limitation the richer stamps exposed (OPEN)
INSERT INTO engine_bug_queue (
  bug_class, title, severity, owner_cluster, root_cause, prevention_rule,
  probe_type, probe_logic, status, concepts_affected, fixed_in_files,
  discovered_in_session, row_type
) VALUES (
'calculator_harvester_pairs_a_symbol_from_one_checkpoint_stamp_with_a_value_from_another',
'THE CALCULATOR reads K from one checkpoint stamp and v from a different stamp on the same formula surface, then reports the mismatch as a physics failure',
'MODERATE', 'peter_parker:runtime_generation',
'readoutHarvest scrapes #nlb_formula as a flat bag of symbol/value pairs with no notion of which CLAUSE or which STAMP a value came from. A state that stamps two checkpoints paints several v and several K values on one surface, plus the live HUD v and the live bar K, and N1_readout_matches_formula pairs them arbitrarily. Measured on work_energy_theorem after the two-point authoring: the raw capture string "K = 40.0 J point B: v = 2.00 m/s" shows the gate reading point A''s K against point B''s v, and on STATE_4 it compared the LIVE K bar (11.3 J) against v = -3.00 harvested from point A''s latched stamp. Failure count went 10 -> 14 on a concept whose physics was hand-verified correct frame by frame at every point. Same family as the known latched-stamp-vs-live-input class; the new part is stamp-to-stamp crossing, which multi-clause stamps make routine rather than rare.',
'A harvested reading is only comparable to another if they share a PROVENANCE: same instant and same clause group. Tag every harvested pair with the DOM node and the stamp head it came from, and refuse to evaluate a formula across two different provenances - SKIP is the correct verdict, not FAIL. Corollary for authoring: a gate that folds an unpairable reading into a failure gets louder, not quieter, as stamps get richer, so do not tune content to silence it.',
'js_eval',
'For each N1 assertion, assert that every symbol in the evaluated expression was harvested from the SAME provenance key (same element id AND, within #nlb_formula, the same stamp clause group as split on the stamp head "<label>:" / "<label> (pass N):"). Where they differ, emit SKIP with the two provenances named. Regression fixture: work_energy_theorem STATE_2 and STATE_4, whose stamps are correct and whose current verdict is FAIL.',
'OPEN',
ARRAY['work_energy_theorem','conservative_vs_nonconservative_forces']::text[],
ARRAY[]::text[],
'ch6 teaching-dwell session (2026-08-08)', 'incident');

-- 6 ─ authoring arithmetic the dwell introduces (OPEN, alex:architect)
INSERT INTO engine_bug_queue (
  bug_class, title, severity, owner_cluster, root_cause, prevention_rule,
  probe_type, probe_logic, status, concepts_affected, fixed_in_files,
  discovered_in_session, row_type
) VALUES (
'nlb_dwell_state_authored_without_recomputing_loop_reset_and_eye_capture',
'A state that adds a checkpoint dwell but keeps its old loop_reset_ms cuts the hold off mid-stamp, and keeps a frozen pin that no longer lands on the beat',
'MODERATE', 'alex:architect',
'dwell_ms shifts every later event on the STATE CLOCK by the sum of the dwells already taken, so the observed crossing time of point k is T_k = t_k + SUM(D_j) over points already crossed, not the physics time t_k. Two authored numbers depend on it and neither is derived by any tool: loop_reset_ms (which the engine will DEFER past a live dwell, warning once under [PM_NLB_DWELL], rather than cut the explanation) and eye_capture_ms (which must land inside a hold or the frozen baseline photographs moving physics again - the very defect the dwell was built to fix). deriveStateMeta cannot compute either: the crossing instant is emergent from the integrated physics, which is why the frozen-pin question was filed as engine request E1 rather than solved in the pin math.',
'When authoring or editing any state with checkpoints[].dwell_ms: (a) compute T_k = t_k + SUM of prior dwells for every point; (b) set loop_reset_ms >= T_last + D_last + a settle tail (~500 ms) and confirm ZERO [PM_NLB_DWELL] warnings in THE EYE console audit - one warning means the reset was deferred and R is wrong; (c) author eye_capture_ms = T_P + D_P/2 for the point P whose stamp carries the state''s claim, at least 150 ms inside both window edges; (d) re-derive all three whenever a launch speed, mass, force or dwell changes. Do not overlap a dwell with idle_auto_sweep or param_ramp, and do not place a dwell checkpoint inside a spring contact window.',
'js_eval',
'For every state authoring dwell_ms: assert the console shows zero [PM_NLB_DWELL] entries, assert eye_capture_ms is present, and assert that at eye_capture_ms PM_nlbDwell.active is true with at least 150 ms remaining in the window and at least 150 ms already elapsed.',
'OPEN',
ARRAY['work_energy_theorem','conservative_vs_nonconservative_forces']::text[],
ARRAY[]::text[],
'ch6 teaching-dwell session (2026-08-08)', 'incident');

-- 7 ─ the point caption vs the body parked on it (engine, FIXED)
INSERT INTO engine_bug_queue (
  bug_class, title, severity, owner_cluster, root_cause, prevention_rule,
  probe_type, probe_logic, status, concepts_affected, fixed_in_files,
  discovered_in_session, row_type
) VALUES (
'nlb_point_marker_caption_renders_over_the_body_parked_on_that_point',
'A track-level checkpoint caption prints on the face of the body standing on that point - guaranteed on every frozen baseline of every dwell state',
'MAJOR', 'peter_parker:field3d_surgeon',
'nlbStackMarkerLabels resolved caption-vs-caption only, so a whole cart could stand in a caption unnoticed. Note 11f then pulled the point-form caption down to 0.35 surface-local (right, while the track is clear) and note 11d''s teaching dwell freezes the scene ON a crossing with every concept authoring eye_capture_ms inside that window - so "the body is standing on the point" is the guaranteed state of the single frame the founder reviews and H2 locks, not an occasional frame. Measured: 33/33 and 34/34 of the caption''s sampled ink inside the block''s ink bbox on conservative_vs_nonconservative_forces STATE_4/STATE_2 frozen frames, pink #CE93D8 on #42A5F5 with the applied-force arrow crossing the glyphs. FIXED: the body MESH (own geometry box, never Box3.setFromObject - it would swallow the billboard parented to it) and the body BILLBOARD both join the obstacle set, measured in camera axes in world units like the existing test; the lift is scaled by measured ink overlap on BOTH screen axes and capped at the flag lane.',
'A caption lane''s obstacle set is every piece of ink that can occupy its column, read off the DRAWN scene through the id registry - not just its own siblings. Clearing a body mesh without its billboard only trades a caption-on-a-block for two overprinted strings. When the lift direction (surface normal) and the collision axis (camera up) diverge, ease the WHOLE lift and scale it by measured overlap on both axes: easing only the clearance margin leaves a positional term no ease touches, which pins the caption at the cap long after the body has gone and then drops it in one frame (measured 1.01 world units, ~107 px, in a single 16 ms frame before the fix was corrected).',
'js_eval',
'For every state authoring a point-form checkpoint, at each authored eye_capture_ms read PM_nlbMarkers.label_rects (point-form entries, home_lane === the dot lane) and PM_nlbMarkers.body_rects, and assert no caption rect intersects any body rect. Additionally drive the state free-running and assert max |lane[i] - lane[i-1]| over consecutive rendered frames stays under 0.35 world units (no teleport), and that two SET_TIME_FREEZE pins at the same at_ms report identical lane/lift bytes.',
'FIXED',
ARRAY['conservative_vs_nonconservative_forces','work_energy_theorem']::text[],
ARRAY['src/lib/renderers/field_3d_renderer.ts']::text[],
'ch6 teaching-dwell session (2026-08-08)', 'incident');

-- 8 ─ the half that stays open: caption vs the body's own BILLBOARD (OPEN)
INSERT INTO engine_bug_queue (
  bug_class, title, severity, owner_cluster, root_cause, prevention_rule,
  probe_type, probe_logic, status, concepts_affected, fixed_in_files,
  discovered_in_session, row_type
) VALUES (
'nlb_marker_caption_corner_nicks_the_body_mass_billboard_on_transit_frames',
'A marker caption and a body''s mass billboard clip corners by a few px while the body passes close to the point',
'MODERATE', 'peter_parker:field3d_surgeon',
'nlbDodgeBodyLabels walks nlb.bodies, so a MARKER caption is still absent from the obstacle set of a BODY caption - the original direction of the note-11g finding. With the body ~0.2 m up-slope of a point the caption needs 1.02 surface-local to clear the billboard while the lift is capped at the flag lane (1.01), so a corner survives. Measured on conservative_vs_nonconservative_forces: worst 7.2 x 2.8 px = 20 px^2 against a caption ink area of ~800 px^2, on 26-28 of ~540 transit frames (~5%); ZERO on body-at-rest frames, ZERO on every frozen frame, ZERO at theta 5/25/45. A FLAG-form caption has the identical nick in the same geometry, so the point form is no worse than the post form - which is why the cap was kept.',
'Closing this means the body-label pass learning about marker captions (the mirror of note 11g), not raising the marker cap - an uncapped lift re-creates note 11f''s float for a wall-height body. Treat the two passes as one obstacle system or accept the bounded residual; do not tune the cap.',
'js_eval',
'Free-run each state authoring checkpoints and, over every rendered frame, compute the intersection area of every PM_nlbMarkers.label_rects entry against every PM_nlbMarkers.body_rects entry. Assert the area is 0 on all frames where the tracked body is at rest, and report the max area and the fraction of frames affected on moving frames so a regression past ~25 px^2 or ~10% of frames is visible.',
'OPEN',
ARRAY['conservative_vs_nonconservative_forces','work_energy_theorem']::text[],
ARRAY[]::text[],
'ch6 teaching-dwell session (2026-08-08)', 'incident');

-- 9 - the loop-rewind clock defect a founder RECORDING caught (engine, FIXED 4d8fd7e)
INSERT INTO engine_bug_queue (
  bug_class, title, severity, owner_cluster, root_cause, prevention_rule,
  probe_type, probe_logic, status, concepts_affected, fixed_in_files,
  discovered_in_session, row_type
) VALUES (
'nlb_checkpoint_dwell_does_not_refire_after_a_loop_rewind',
'A monotonic loop rewind restored the clock''s NOW but not its THEN, so a home-armed checkpoint''s teaching dwell fired only on the first cycle',
'MAJOR', 'peter_parker:field3d_surgeon',
'loop_reset_ms rewinds a state through nlbResetTrajectory and then puts eng.t_ms back, so the kinematics restart while the master clock stays monotonic. nlbResetTrajectory ALSO zeroes eng._tPrevMs - correct for a genuine RESET_TRAJECTORY, where t_ms goes to 0 with it - and the loop path did not restore it. On the rewind frame the engine believed one 16 ms step spanned [0, t_ms]. That segment anchors every crossing-instant reader, tCross = _tPrevMs + f*(t_ms - _tPrevMs), and the ONE crossing that can land on the rewind frame is a HOME-ARMED checkpoint''s departure: the body was just put back ON its flag, so f is exactly 0, tCross collapsed to the stale 0, until = 0 + dwell_ms landed a whole cycle in the past, and the freshness guard discarded the window. The stamp itself was unaffected (counts and text DO rewind), which pointed diagnosis at the innocent latches. Downstream, the physics the missing hold was meant to absorb kept running: on work_energy_theorem STATE_4 the cart ran into the +6 m track bound, where nlbEnergyClampGuard froze the bars and put "v = 0.00 m/s" beside "K = 62.7 J" on screen - found by the FOUNDER watching a screen recording, invisible to every gate because the frozen pin lives in cycle 1.',
'A monotonic rewind preserves the PAIR (_tPrevMs, t_ms), never t_ms alone: the frame''s [start, end] segment is one object, and every consumer that interpolates within a frame reads both ends. When adding a field to the rewind cluster, ask whether it is clock-RELATIVE (rides the monotonic restore) or state-relative (must be rewound). Corollary for reviewers: a per-cycle behaviour that works on cycle 1 and not on cycle 2 is a rewind-completeness question before it is a latch question. And a frozen baseline pinned in cycle 1 can never see a cycle-2 defect - the founder''s 30 s recording covered three cycles and found it immediately.',
'js_eval',
'On a state authoring loop_reset_ms R and a checkpoint whose s_m equals its body''s initial_position_m with dwell_ms > 0 and dwell_from_pass <= 1: play >= 3R headless recording PM_nlbDwell every frame. Assert a window for that checkpoint opens in EVERY cycle and its in-cycle open offset agrees across cycles 2..N within one frame. Also assert zero console messages containing [PM_NLB_ENERGY_CLAMP].',
'FIXED',
ARRAY['work_energy_theorem']::text[],
ARRAY['src/lib/renderers/field_3d_renderer.ts']::text[],
'ch6 teaching-dwell session (2026-08-09)', 'incident');

-- 10 - the gate gap the same recording exposed (OPEN probe definition)
INSERT INTO engine_bug_queue (
  bug_class, title, severity, owner_cluster, root_cause, prevention_rule,
  probe_type, probe_logic, status, concepts_affected, fixed_in_files,
  discovered_in_session, row_type
) VALUES (
'eye_renderer_self_diagnostics_are_captured_but_no_gate_fails_on_them',
'THE EYE records the renderer''s [PM_*] self-diagnostics into diagnostic_warnings and no check id consumes them, so an engine shouting about its own broken state still reports a clean run',
'MAJOR', 'peter_parker:renderer_primitives',
'Renderers emit uniquely-prefixed console warnings precisely so a misbehaving state fails LOUDLY - [PM_NLB_ENERGY_CLAMP] is the honesty guard for a geometric clamp being rendered as an energy change. The capture landed (manifest.diagnostic_warnings is populated since PR #52) but no check was wired to it, so the channel is write-only. Measured: all four work_energy_theorem EYE runs of 2026-08-08/09 carry [PM_NLB_ENERGY_CLAMP] on STATE_4 and twice on STATE_5, while every failed check id in those manifests is an H2 stale-baseline diff. The renderer reported a state showing v = 0.00 m/s beside K = 62.7 J for two days and no gate could fail; the defect was found by a founder watching a screen recording.',
'A diagnostics channel that nothing asserts on is not a gate. Every uniquely-prefixed renderer self-diagnostic gets a check id at the moment the prefix is introduced, and the check FAILS the run unless the prefix is explicitly allow-listed for that concept with a reason. Adding the capture without adding the assertion is half a feature.',
'js_eval',
'For each state, read manifest.diagnostic_warnings and fail the run when any entry matches /\[PM_[A-Z0-9_]+\]/ and its prefix is not in the per-concept allow-list. Report state_id and full text on failure; route [PM_NLB_ENERGY_CLAMP] and [PM_NLB_*_SCALE] findings to alex:architect (authored motion plan / scale), not the engine.',
'OPEN',
ARRAY['work_energy_theorem']::text[],
ARRAY['src/scripts/visual_eyes.ts','src/lib/validators/visual']::text[],
'ch6 teaching-dwell session (2026-08-09)', 'probe_definition');
