-- =====================================================================
-- SCAR CANDIDATES - quality_auditor audit of `uniform_circular_motion`
-- 2026-08-01 - worktree C:\Tutor\physics-mind-lom-g (feat/lom-g-offaxis)
--
-- SQL TEXT ONLY. NOT APPLIED. NO DB WRITE WAS PERFORMED BY THE AUDITOR.
-- Schema mirrors docs/loop_runs/lom_g/_engine/scar_candidates.sql
-- (13 authored columns of the 16-col engine_bug_queue).
-- bug_class is the upsert key - check for an existing row before applying;
-- a recurrence is an UPDATE, not a duplicate INSERT.
--
-- OWNER-TAG NOTE: candidates A and B use `peter_parker:field3d_surgeon`.
-- The three OPEN rows already in the queue for this concept are tagged
-- `peter_parker:renderer_primitives`, which maps to pcpl-surgeon (the 2D
-- parametric renderer) and would REJECT field_3d scope. Retag statements
-- are supplied as candidate E.
-- =====================================================================


-- ---------------------------------------------------------------------
-- Candidate A - MAJOR, probe_definition. THE HIGHEST-VALUE ROW IN THIS FILE.
-- THE EYE returned 31/31 pass, exit 0, zero manifest warnings on a concept
-- whose STATE_6 is a byte-identical frozen frame for 12 of its 20 seconds.
-- D5 (the motion gate) is dark fleet-wide on field_3d because visual_eyes.ts:68
-- derives its motion map from cached.physics_config, which holds only
-- epic_l_path - so nothing in the deterministic suite can see a dead state.
-- The dense frames ALREADY CAPTURED contain the whole answer: hash them.
-- This is the cheap, zero-cost, engine-independent stand-in for D5 until the
-- founder platform call lands, and it directly addresses the prior session
-- scar in which an identical 31/31 certified SEVEN dead states.
-- ---------------------------------------------------------------------
INSERT INTO engine_bug_queue (
    bug_class, title, severity, owner_cluster, root_cause, prevention_rule,
    probe_type, probe_logic, status, concepts_affected, fixed_in_files,
    discovered_in_session, row_type
) VALUES (
    'eye_dense_frames_are_never_hashed_so_a_frozen_state_passes_31_of_31',
    'THE EYE captures every dense frame and hashes none of them, so a state that stops moving is indistinguishable from one that never stopped',
    'MAJOR',
    'peter_parker:field3d_surgeon',
    'visual_eyes.ts derives its motion expectations (D5) from cached.physics_config, which for a field_3d concept holds only epic_l_path and never field_3d_config - so D5 has no motion map, never fires, and the suite reports a clean 31/31 with the motion question entirely unasked. Every other gate is a per-frame assertion (bounds, overlap, cue presence) and is satisfied identically by a moving frame and a frozen one. The dense PNGs that would answer the question are already written to disk on every run; nothing ever compares two of them.',
    'A per-state motion assertion must be derived from the PIXELS ALREADY CAPTURED, never from a config the cache does not carry. After the dense sweep, hash every STATE_N__dense_t*.png and report per state: (a) the count of distinct hashes, (b) the timestamp of the LAST frame-to-frame change, (c) that timestamp as a fraction of the authored duration. Fail or warn when a guided state has fewer than 3 distinct frames, or when motion stops before roughly 70 percent of the authored duration while narration continues past it. This is renderer-agnostic, costs one hash per already-written file, and cannot be defeated by a missing config the way D5 was.',
    'js_eval',
    'per guided state: h = denseFrames.map(md5); assert new Set(h).size >= 3; lastChange = max t where h[i] != h[i-1]; assert lastChange >= 0.70 * duration_ms OR narration_ms <= lastChange.',
    'OPEN',
    ARRAY['uniform_circular_motion', 'equilibrium_of_particles']::text[],
    ARRAY['src/scripts/visual_eyes.ts', 'src/lib/validators/visual/deriveStateMeta.ts']::text[],
    'lom-g quality_auditor audit of uniform_circular_motion 2026-08-01',
    'probe_definition'
);


-- ---------------------------------------------------------------------
-- Candidate B - MODERATE, incident. Engine-owned, content-visible.
-- Authoring a `release` on a whirl state widens THAT STATE ground plane from
-- L x 1.30 to L x 2.80 (FR_W_PLANE_R_CUT). The widening is correct and
-- necessary (the post-cut flight needs the room), but it is applied PER
-- STATE, so the plane visibly grows about 2.2x at the moment the student
-- clicks into the concept PRIMARY AHA state, with no narration and no
-- pedagogical meaning. Rule 32d: at every click the only visible change
-- should BE the new thing. Verified in frames: STATE_2__frozen.png plane
-- spans x 335..945 fully in frame; STATE_3__dense_t00000.png plane overflows
-- both frame edges. Anchor, string, bob and orbit circle are unchanged, so
-- the defect is cosmetic continuity, not pedagogical - hence MODERATE.
-- ---------------------------------------------------------------------
INSERT INTO engine_bug_queue (
    bug_class, title, severity, owner_cluster, root_cause, prevention_rule,
    probe_type, probe_logic, status, concepts_affected, fixed_in_files,
    discovered_in_session, row_type
) VALUES (
    'field3d_release_widens_ground_plane_per_state_causing_unnarrated_apparatus_jump',
    'A whirl state that authors a release gets a 2.2x wider ground plane than its neighbours, so the apparatus visibly jumps size at state entry',
    'MODERATE',
    'peter_parker:field3d_surgeon',
    'FR_W_PLANE_R_FACTOR (1.30) and FR_W_PLANE_R_CUT (2.80) are selected per state from whether that state authored a release. The wider plane is required for the flight to stay in frame, but because the choice is per-state rather than per-concept, a concept whose release lives in one state renders two different apparatus scales across otherwise-identical flat states. The author cannot avoid this: the plane radius is not an authorable key.',
    'A scenario dimension that exists to accommodate the LARGEST excursion any state can produce must be computed once per CONCEPT (max over all states) and applied to every state sharing the apparatus, not selected per state. Same family as the OPEN row field3d_scenario_renders_offcentre_because_camera_target_is_not_authorable: reference surfaces are sized from the largest excursion, and sized ONCE so the apparatus does not resize between states.',
    'manual',
    'Render every state of a concept that authors a release on any state and confirm the ground or reference surface subtends the same on-screen extent in all states sharing that apparatus geometry.',
    'OPEN',
    ARRAY['uniform_circular_motion']::text[],
    ARRAY['src/lib/renderers/field_3d_renderer.ts']::text[],
    'lom-g quality_auditor audit of uniform_circular_motion 2026-08-01',
    'incident'
);


-- ---------------------------------------------------------------------
-- Candidate C - MODERATE, incident. RECURRENCE of the capacitance proof-run
-- class (Rule 38b): the explore state formula surface asserts a relation no
-- state in the concept derives. STATE_7 shows T = m omega^2 L while its own
-- HUD reads r = 0.790 m against a slider reading L = 1.00 m, and STATE_2
-- (the only other T-form in the concept) shows T = m omega^2 r. Both are
-- correct physics; nothing on screen or in any narration reconciles them.
-- Under the core_only preset (S1,S2,S3,S7) the reconciling states are hidden
-- entirely. If a row for the capacitance instance already exists, UPDATE it
-- and append uniform_circular_motion to concepts_affected instead.
-- ---------------------------------------------------------------------
INSERT INTO engine_bug_queue (
    bug_class, title, severity, owner_cluster, root_cause, prevention_rule,
    probe_type, probe_logic, status, concepts_affected, fixed_in_files,
    discovered_in_session, row_type
) VALUES (
    'explore_state_formula_surface_asserts_a_relation_no_state_derives',
    'The explore state carries a formula surface whose form contradicts the guided states formula surface, with no state reconciling the two',
    'MODERATE',
    'alex:architect',
    'The explore state is designed last and inherits the most general true formula for its apparatus rather than the formula the LESSON established. Rule 38b tends to be checked as are the SYMBOLS core-established, which passes because T, m, omega and L all appear earlier, while the actual failure is that the RELATION is new. The auditor-visible tell is an on-canvas contradiction: the explore HUD exposes r and the slider exposes L with r not equal to L, directly beside a formula that uses L where the guided states used r.',
    'A formula surface on the explore state must be derived by a surviving state under EVERY authored preset, not merely built from previously-seen symbols. Check the relation, not the alphabet. For each preset, list the surviving states and confirm one of them states or shows the explore formula. If none does, either drop the explore formula_overlay entirely (a value-only sandbox is Rule-34-clean and is already precedented by formula-free guided states) or add one clause to the last guided state that derives it. Never leave two different closed forms for the same quantity on screen in one concept with nothing reconciling them.',
    'manual',
    'For each preset in the concept Rule-38 cut list, list the surviving states, then assert the explore state formula_overlay relation is stated or derived by at least one of them. Additionally assert the explore formula is consistent with every quantity its own readouts expose: a formula in L beside a live r not equal to L readout is a contradiction on screen.',
    'OPEN',
    ARRAY['uniform_circular_motion', 'capacitance']::text[],
    ARRAY[]::text[],
    'lom-g quality_auditor audit of uniform_circular_motion 2026-08-01',
    'incident'
);


-- ---------------------------------------------------------------------
-- Candidate D - MINOR, incident. Narration references an object that is not
-- on screen and belongs to a different concept apparatus.
-- STATE_1 sentence s1_2 ends: "...unlike the balanced ring's zero sum."
-- The ring is the force_table fixture of the sibling concept
-- equilibrium_of_particles; no ring exists anywhere in this concept, and
-- prerequisites are advisory (Rule 23), so a student may reach STATE_1 having
-- never seen it. "zero sum" also reads as the everyday idiom rather than the
-- physics (the forces sum to zero) - Rule 41a. The architect skeleton phrased
-- the same patch with an explicit "last time ..." time-marker, which is the
-- form that works; the compression to one clause dropped it.
-- ---------------------------------------------------------------------
INSERT INTO engine_bug_queue (
    bug_class, title, severity, owner_cluster, root_cause, prevention_rule,
    probe_type, probe_logic, status, concepts_affected, fixed_in_files,
    discovered_in_session, row_type
) VALUES (
    'narration_references_a_prerequisite_concepts_apparatus_that_is_not_on_screen',
    'A prerequisite-bridging sentence names a fixture from the sibling concept (the balanced ring) that appears nowhere in this concept picture',
    'MINOR',
    'alex:physics_author',
    'Chapter-coherence bridging sentences are written while both concepts are in the author head, so a reference to the previous sim apparatus reads as obvious. On screen it is a bare noun with no referent: the student sees a ball on a string and hears about a ring. Prerequisites are advisory (Rule 23), so the bridge cannot assume the prior lesson was taken.',
    'A bridging sentence may reference a prior concept IDEA but never its APPARATUS by name unless that apparatus is visible. Either name the idea (when the forces balanced, their sum was zero) or keep an explicit time-marker that flags it as recall (last time ...). Additionally avoid the phrase zero sum, which collides with the everyday idiom; write the forces summed to zero (Rule 41a).',
    'manual',
    'Grep every text_en sentence for nouns naming a physical object, then confirm each such object is rendered somewhere in that state frames.',
    'OPEN',
    ARRAY['uniform_circular_motion']::text[],
    ARRAY[]::text[],
    'lom-g quality_auditor audit of uniform_circular_motion 2026-08-01',
    'incident'
);


-- ---------------------------------------------------------------------
-- Candidate E - OWNER-TAG CORRECTION (no new rows).
-- Two OPEN rows naming this concept have a field_3d_renderer.ts root cause but
-- are tagged peter_parker:renderer_primitives, which maps to pcpl-surgeon
-- (parametric_renderer.ts / PCPL primitives / particle_field) and would reject
-- the scope. Dispatching them as tagged wastes a cycle. The third OPEN row
-- (harness CRLF comment strip) is a tooling defect, not a renderer defect -
-- its correct owner is ambiguous and is left for the founder to decide.
-- ---------------------------------------------------------------------
UPDATE engine_bug_queue
   SET owner_cluster = 'peter_parker:field3d_surgeon'
 WHERE bug_class = 'field3d_scenario_renders_offcentre_because_camera_target_is_not_authorable'
   AND owner_cluster = 'peter_parker:renderer_primitives';

UPDATE engine_bug_queue
   SET owner_cluster = 'peter_parker:field3d_surgeon'
 WHERE bug_class = 'explicit_linear_drag_is_unstable_at_the_damping_a_legible_settle_requires'
   AND owner_cluster = 'peter_parker:renderer_primitives';

-- END OF FILE - nothing above was executed by the auditor.


-- =====================================================================
-- APPENDED 2026-08-01 by peter_parker:field3d_surgeon (engine dispatch,
-- chapter-loop context -> SQL TEXT ONLY, nothing executed).
-- =====================================================================

-- ---------------------------------------------------------------------
-- Candidate F - the dispatched bug_class, now FIXED.
-- NOTE for the founder: the diagnosis handed to the dispatch (the released
-- flag / ballistic state "not rebuilt when the clock is pinned") was NOT the
-- mechanism. frResetTrajectory re-arms the cut correctly and the crawl fires
-- it at exactly 19600 ms when given enough wall clock (measured). The clock
-- simply never ARRIVED at the pin inside captureFrozenFrame's wall cap.
-- ---------------------------------------------------------------------
INSERT INTO engine_bug_queue (
    bug_class, title, severity, owner_cluster, root_cause, prevention_rule,
    probe_type, probe_logic, status, concepts_affected, fixed_in_files,
    discovered_in_session, row_type
) VALUES (
    'force_rig_whirl_release_not_reproduced_under_set_time_freeze_pin',
    'A SET_TIME_FREEZE pin later than about 4 seconds is unreachable under headless rAF, and captureFrozenFrame photographs the un-pinned frame anyway',
    'CRITICAL',
    'peter_parker:field3d_surgeon',
    'The SET_TIME_FREEZE crawl advances virtual time by one fixed 1/60 s step per rAF frame (__pmSteps is forced to 1 under a pin). Headless Chromium delivers about 18 rAF frames per second, so the crawl covers only about 290 ms of SIM time per WALL second. A 20800 ms pin therefore needs about 75 s of wall clock - measured directly on the tray: sim=19744 at 71.2 s, pin reached at 75.5 s. captureFrozenFrame polls for at_ms*2.5+4000 ms (56 s here) and then, unlike the primary capture which was made fatal on 2026-07-31, screenshots anyway. Solving 0.29*(2.5*at+4000) >= at shows every pin past roughly 4.2 s is a coin flip on this hardware. uniform_circular_motion STATE_3 (the cut-the-string PRIMARY AHA, pinned at 20800 ms, release at 19600 ms) consequently photographed the PRE-CUT orbit - T = 12.96 N, string intact, no trail - at a wall-clock-dependent instant: the only frozen frame in the fleet that was both WRONG and UNSTABLE run to run (0.289 percent of pixels across three identical runs). The release mechanism itself was never broken; the same code fires the cut correctly on the dense/live path and on a crawl given 75 s. A second, smaller nondeterminism rode along: the handful of live frames between THE EYE RESET_TRAJECTORY and its SET_TIME_FREEZE (three separate round trips) run at wall-clock __pmSteps, so the crawl chunk boundaries - and the bob phase at the pin - depended on machine load.',
    'A pinned frame must be a pure function of at_ms, never of how many rAF frames the host managed to deliver. An integrator scenario that cannot join the accumulator-free SNAP set gets a COMPRESSED CRAWL instead: on the first frame of a new pin whose lag exceeds 2 s, rewind through the ONE rewind path (frResetTrajectory) and replay exactly round(at_ms/16) chunks of dt = 0.016 in that single tick - identical dt, identical order (phases and param_ramp once per chunk, then the fixed 0.002 s micro-steps), identical count, so it is the same arithmetic sequence the slow crawl produced with the wall clock taken out. Replaying from t_ms = 0 also removes the pre-freeze jitter. The 2 s gate keeps the LIVE player on the ordinary crawl (its pins are lag 0 pause pins or the 1500 ms entry default). Never write __pmSteps or dtStep to achieve this - read them only (Rule 36). Any scenario_type whose reveal pins exceed about 4 s and which is NOT in the SNAP set is a candidate for the same treatment; newtons_laws_body is the next one to check.',
    'js_eval',
    'For each state, post RESET_TRAJECTORY then SET_TIME_FREEZE {at_ms}, poll window.PM_simTimeMs, and assert it reaches at_ms within 8 s of wall clock. Any state that needs longer is being photographed off its pin. Cross-check: capture the frozen frame twice in one session and assert the two PNGs are byte-identical.',
    'FIXED',
    ARRAY['uniform_circular_motion', 'equilibrium_of_particles']::text[],
    ARRAY['src/lib/renderers/field_3d_renderer.ts']::text[],
    'lom-g field3d_surgeon engine dispatch 2026-08-01',
    'incident'
);


-- ---------------------------------------------------------------------
-- Candidate G - the tooling half. NOT fixed by this dispatch (screenshotter.ts
-- is EYE tooling, outside the field3d_surgeon sacred-file scope, and it is a
-- separate bug_class). Filed so the founder can route it.
-- ---------------------------------------------------------------------
INSERT INTO engine_bug_queue (
    bug_class, title, severity, owner_cluster, root_cause, prevention_rule,
    probe_type, probe_logic, status, concepts_affected, fixed_in_files,
    discovered_in_session, row_type
) VALUES (
    'capture_frozen_frame_ignores_its_own_poll_result_and_photographs_off_pin',
    'captureFrozenFrame discards pollSimTimeReached().reached and screenshots regardless, manufacturing a wrong-phase baseline exactly as the primary capture used to',
    'MAJOR',
    'ambiguous',
    'screenshotter.ts captureFrozenFrame calls pollSimTimeReached(page, panel_a, opts.atMs, {wallCapMs: opts.atMs * 2.5 + 4000}) and then uses ONLY poll.waitedMs to shorten the settle - poll.reached is never read. When the cap expires the function captures the frame anyway and the PNG becomes the H2 baseline. The primary capture path had exactly this defect and was made FATAL on 2026-07-31 with the comment "a frame that missed its pin is not evidence"; the frozen path, which is the path that actually MINTS the baselines, kept the silent behaviour. Its cap is also smaller than the primary path (2.5x+4000 vs 3.5x+8000), so the frozen frame is the first to miss. This is what let force_rig_whirl_release_not_reproduced_under_set_time_freeze_pin reach a founder-visible frame instead of aborting the run.',
    'Every capture that becomes evidence must abort when its pin was not reached, not degrade into a screenshot. Make captureFrozenFrame throw on !poll.reached with the same message shape the primary capture uses, and align its wall cap with the primary path. A silent off-pin frame is worse than a failed run because it is indistinguishable from a real one downstream.',
    'js_eval',
    'grep captureFrozenFrame in src/lib/validators/visual/screenshotter.ts and assert the body references poll.reached in a throw; assert its wallCapMs is not smaller than the primary capture wallCapMs.',
    'OPEN',
    ARRAY['uniform_circular_motion', 'equilibrium_of_particles']::text[],
    ARRAY['src/lib/validators/visual/screenshotter.ts']::text[],
    'lom-g field3d_surgeon engine dispatch 2026-08-01',
    'incident'
);

-- END OF APPENDED BLOCK - nothing above was executed.


-- =====================================================================
-- APPENDED 2026-08-01 (second field3d_surgeon dispatch, lom-g worktree).
-- Candidate H - the founder-directed flight-envelope change. NOT APPLIED:
-- this file is SQL TEXT for founder batch review, per the chapter-loop
-- no-DB-writes contract.
-- =====================================================================
INSERT INTO engine_bug_queue (
    bug_class, title, severity, owner_cluster, root_cause, prevention_rule,
    probe_type, probe_logic, status, concepts_affected, fixed_in_files,
    discovered_in_session, row_type
) VALUES (
    'force_rig_whirl_post_cut_flight_envelope_too_short_to_watch',
    'The cut-the-string PRIMARY AHA lasted 1.4 s because the flight envelope was a 2.8 L table top, and no authored number could lengthen it',
    'MAJOR',
    'peter_parker:field3d_surgeon',
    'The whirl bob left the drawn plane when sqrt(L^2 + (v t)^2) = 2.8 L (FR_W_PLANE_R_CUT). With v = omega L the L cancels, so the watchable flight was sqrt(2.8^2 - 1)/omega = 2.615/omega seconds - a function of omega ALONE. Authoring could only buy time by lowering omega, but omega also sets T = m omega^2 L, so any omega low enough to give 4 s drove the tension arrow under the engine legibility floor (the open sibling scar force_rig_whirl_tension_arrow_illegible_at_floor_band_magnitude). At the authored 4.0 kg / 1.8 rad/s / 1.00 m the student got 1.4 s of the straight-line departure that is the entire reason the concept exists. Two further engine defaults made those 1.4 s worse than the number suggests: the departure direction fell out of the authored at_ms, so the bob happened to fly AWAY from the camera (shrinking, foreshortened, straight at the far rim), and the plane ended in a hard rim the bob crossed - the Phase-0 misreading (a bob past a visible edge reads as flying) the state exists to kill.',
    'A payoff beat cannot be time-boxed by a drawn prop. When the teaching claim IS a duration (watch it travel straight), the engine owns the envelope and authoring owns only the timing: (1) the surface becomes a SHEET with a radial alpha fade so it has no rim to cross - a bob must never approach a drawn edge; (2) the entry PHASE is a framing degree of freedom, not physics - solve it backwards from the cut instant so the departure runs along the widest screen axis at CONSTANT depth (frwReleasePhi), which also makes it immune to a re-timed cut; (3) the framing follows - pan a fixed share of the displacement and ease the display scale back only as much as a live fit demands, on the scenario framing node, never on the shared camera. Never buy the time by touching the integrator: no slow motion, no easing of the bob speed, no curvature. The straight constant-speed line must stay the integrator OUTPUT (frwAccel returns the zero vector after the cut, unchanged). Report the supported envelope back to authoring as a NUMBER so narration and at_ms are timed against it.',
    'js_eval',
    'Drive the released state to at_ms + N and assert, at N = 4000: window.PM_frFlightZoom <= 2.0, the bob projects inside 0.90 of the half-frame, the abandoned ring projects entirely inside the frame, and the bob distance from the rig origin is below the drawn plane radius times the alpha-fade start. Assert eng.speed equals its pre-cut value to 1e-6 at every N (the flight must stay the integrator output), and that the trail pixels span no more than 2 rows over its full length (straightness).',
    'FIXED',
    ARRAY['uniform_circular_motion']::text[],
    ARRAY['src/lib/renderers/field_3d_renderer.ts', 'src/lib/validators/visual/deriveStateMeta.ts']::text[],
    'lom-g field3d_surgeon engine dispatch 2026-08-01 (flight envelope)',
    'incident'
);

-- END OF APPENDED BLOCK - nothing above was executed.
