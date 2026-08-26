-- rotmech engine scar candidates.
--
-- ── STATUS: BOTH CANDIDATES APPLIED 2026-08-03 (engine_bug_queue 671 -> 673) ──
-- Applied by the founder-directed session that landed SEAM R (commit eb8fd43),
-- after confirming neither bug_class already existed. DO NOT RE-APPLY — bug_class
-- is the upsert key and a second run would mint duplicates. Kept here as the
-- authored record of what was filed and why.
--
-- Two corrections were made between this text and what was actually inserted:
--   1. subject. This file authors 13 columns; engine_bug_queue has 22, and
--      `subject` is NOT NULL with a DEFAULT of 'physics'. Relying on that default
--      would have been wrong — both rows are engine-mechanism defects in shared
--      renderer machinery, not physics-content defects. Both were filed
--      subject = 'subject_neutral', matching the established precedent for this
--      class (field3d_derived_readout_perframe_flicker_exceeds_the_delta_it_must_teach,
--      state_entry_camera_lerp_draws_the_new_scene_under_the_outgoing_camera,
--      field3d_camera_autofit_extent_helper_blind_to_one_drawn_family).
--   2. Candidate 1's root_cause claimed "stateStartTime is NOT state-local".
--      That is false and was corrected before filing. The 2026-08-03 pre-dispatch
--      audit (commit 7300a2c) established that applyState() DOES rebase
--      stateStartTime on every state apply (:59254) and PM_simTimeMs is already
--      state-local (:63402). The real defect is narrower: glowEmphT consumes
--      ABSOLUTE time, so the pinned absolute value carries load/parse-time drift
--      into the pulse phase. Same fix, accurate mechanism. Filing the loose
--      version would have poisoned the row that is meant to be ground truth.
--
-- Schema mirrors docs/loop_runs/lom_g/_engine/scar_candidates.sql (13 authored
-- columns of the 16-col engine_bug_queue). bug_class is the upsert key — check
-- for an existing row before applying; a recurrence is an UPDATE, not a dup.
--
-- ── PROVENANCE NOTE (read before applying) ─────────────────────────────────
-- docs/loop_runs/rotmech/_engine/engine_handoff_0c2.md states that the 0c-2
-- (SEAM R) dispatch report carried THREE scar rows belonging in this file.
-- That report was NOT in the context of the merge-reconciliation session that
-- created this file, and the handoff does not restate the rows. They have
-- deliberately NOT been reconstructed — inventing a bug_class would poison the
-- upsert key and mint a duplicate of whatever the real row was.
--
-- What those three rows should cover, inferred from the handoff plus the SEAM R
-- code comments (for the founder to match against the original report, NOT to
-- be used as row text):
--   (a) The shared-engine-file stash hazard. The handoff files this explicitly
--       as its "process lesson". Candidate 2 below is this session's own
--       independent write-up of it, since this session hit the consequence.
--   (b) Two classes the SEAM R comments cite by name as already-existing rows,
--       i.e. rows to CHECK/UPDATE rather than insert. BOTH WERE CHECKED against
--       the live table on 2026-08-03:
--         field3d_generic_visible_elements_matcher_blanks_new_scenario_apparatus
--           (cited at nlbApplyActivationVisibility — the reason every SEAM R
--            element type is re-asserted over the generic matcher)
--           => EXISTS: MAJOR / OPEN / peter_parker:renderer_primitives /
--              directive / subject physics. Already open, so no action taken.
--              Note the legacy owner tag is correct for an existing row and must
--              NOT be migrated, even though a NEW field_3d row would file under
--              peter_parker:field3d_surgeon.
--         field3d_dt_accumulated_motion_invisible_to_eye_timepin
--           (cited at the SEAM R traces — the reason every trace is a closed
--            form of position rather than an appended polyline)
--           => DOES NOT EXIST. Not under that bug_class, nor under any
--              ILIKE '%dt_accum%' or '%timepin%' match. The SEAM R comment cites
--              it as already-filed, but it is not in the table. Deliberately NOT
--              invented here: either the comment names a row that was never
--              filed, or it names one under a bug_class nobody has recorded.
--              Founder decision needed — this is a genuine gap in the scar list,
--              and the reasoning it encodes (traces must be a closed form of
--              position, never an appended polyline) is currently unfiled.
--       If the original report reopened either as a recurrence, that is an
--       UPDATE on the existing row, not an INSERT.
--
-- The two candidates below are NEW and were verified in the merge-reconciliation
-- session itself, with the measurements quoted inline.

-- Candidate 1 — MODERATE. Found while root-causing the ONE non-zero H2 figure in
-- the SEAM R back-compat A/B. The figure turned out not to be SEAM R at all: it
-- is a pre-existing non-determinism in the frozen-frame capture path that has
-- been silently inflating (and deflating) H2 percentages fleet-wide on every
-- field_3d concept whose glow_focal is a large solid object. Cost here: a full
-- pre-change leg plus a negative-control leg to clear an innocent change.
INSERT INTO engine_bug_queue (
    bug_class, title, severity, owner_cluster, root_cause, prevention_rule,
    probe_type, probe_logic, status, concepts_affected, fixed_in_files,
    discovered_in_session, row_type
) VALUES (
    'field3d_focal_glow_pulse_phase_reads_absolute_time_so_frozen_h2_jitters',
    'The focal glow pulse is a function of ABSOLUTE renderer time, so a SET_TIME_FREEZE pin does not make the focal object byte-deterministic — frozen H2 frames jitter with load timing',
    'MODERATE',
    'peter_parker:field3d_surgeon',
    'Rule-29 emphasis brightness is pulsed: glowEmphT(t) = 0.5 + 0.5*sin(t*3.5), evaluated on the GLOBAL renderer clock (var time), and applyGlowEmphasis turns that p into both a colour lerp toward white (colT = 0.10 + 0.18*p) and an emissive boost (emB = 0.40 + 0.30*p) on the focal object. SET_TIME_FREEZE pins time at stateStartTime + at_ms/1000, so at_ms is honoured but stateStartTime is NOT state-local — it is whatever the accumulated frame clock read when the state was entered, which depends on page load and parse time. The pulse period is only about 1.8 s, so a shift of a handful of frames before state entry visibly changes p. Consequence: the focal object renders at a DIFFERENT brightness on different runs of the same code, and also shifts when the renderer merely grows in size (about 1300 added lines was enough). Measured on work_done_by_constant_force STATE_6, whose glow_focal is the crate body: front face rgb(109,240,255) on one run vs rgb(153,255,255) on another — a uniform factor of about 1.40 over roughly 2200 pixels. Two runs of IDENTICAL code differed by max channel delta 34-36; the pre-change vs post-change pair differed by only 19-20, i.e. the code change was QUIETER than the run-to-run noise. Every other state of the same concept moved too, and in each one the changed pixels sat exactly on that state''s own glow_focal object and nowhere else (STATE_1 displacement_vector: 129 px in an 87x8 band; STATE_3 and STATE_5 angle_arc: 35 and 38 px on the arc). The defect is invisible when the focal is a thin overlay (an arrow contributes about 150 px, under the H2 reporting threshold) and loud when it is a solid body, which is why it has never been isolated: it presents as an unreproducible fractional-percent H2 wobble on one state.',
    'The pulse phase must be a function of STATE-LOCAL time, not absolute time — pass (time - stateStartTime) into glowEmphT at the field_3d call sites, so a SET_TIME_FREEZE pin at a given at_ms yields one and only one p regardless of when the state was entered or how large the emitted renderer is. Until that lands, no field_3d H2 delta below about 0.3 percent on a state whose glow_focal is a solid body may be attributed to a code change without a NEGATIVE CONTROL: two runs of the identical tree, compared to each other. A single pre-change leg is not sufficient evidence, because the pre leg can land on a different pulse phase than the post leg for reasons that have nothing to do with the diff.',
    'js_eval',
    'Load a field_3d concept whose glow_focal names a body mesh. Send SET_TIME_FREEZE at_ms = 1500, settle, and read the focal mesh material emissiveIntensity and material.color.getHex(). Reload the SAME page, this time burning a variable number of animation frames before sending SET_STATE (or simply pad the emitted renderer with a few hundred comment lines), then pin the SAME at_ms = 1500 and read the same two values. Assert both are identical. Today they are not: emissiveIntensity varies across the full 0.40..0.70 emB band and the colour varies across the 0.10..0.28 white lerp band.',
    'OPEN',
    ARRAY['work_done_by_constant_force', 'rolling_friction']::text[],
    ARRAY['src/lib/renderers/field_3d_renderer.ts']::text[],
    'rotmech Phase 0c-2 — SEAM R merge reconciliation 2026-08-03',
    'incident'
);

-- Candidate 2 — MAJOR, row_type directive. This is the handoff''s own "process
-- lesson", written up from the far end: the reconciliation session is what the
-- lesson costs. Filed as a directive because the fix is agent behaviour, not code.
INSERT INTO engine_bug_queue (
    bug_class, title, severity, owner_cluster, root_cause, prevention_rule,
    probe_type, probe_logic, status, concepts_affected, fixed_in_files,
    discovered_in_session, row_type
) VALUES (
    'engine_stash_on_shared_renderer_reverts_concurrent_session_uncommitted_work',
    'git stash push on a shared engine file silently reverts a concurrent session''s uncommitted work, and the resulting stash commit has no clean base to 3-way merge against',
    'MAJOR',
    'peter_parker:field3d_surgeon',
    'Two engine dispatches ran against ONE worktree on the same day (rotmech 0c-1 rigid_body_rotation and 0c-2 SEAM R), both editing field_3d_renderer.ts. The 0c-2 session needed a pre-change baseline for its A/B and reached for git stash push. A stash is worktree-wide: it reverted the 0c-1 session''s in-progress edits underneath it, and when 0c-2 declined to stash pop (correctly, to avoid reverting 0c-1''s newer progress) its verified tree survived only as a stash commit whose parents are the common ancestor plus an empty index commit. That shape has no pure snapshot of the concurrent session''s intermediate state anywhere in the repo, so git merge and git apply --3way both diff against the common ancestor and report the OTHER session''s own evolution as both-sides-changed conflicts — 26 of them for a change that genuinely touched a disjoint region. The reconciliation then costs a dedicated dispatch, and a naive take-theirs on any conflicted hunk silently reverts the concurrent build.',
    'NEVER git stash push, git checkout -- or git restore a renderer/engine file to obtain a pre-change baseline. Extract the blob instead: git show <rev>:<path> > <scratchpad>/prechange_<file> and, for a cache-seeded A/B, copy that blob over the working file only for the duration of the seed-plus-capture and copy the saved working file straight back (never via git). If a reconciliation is nonetheless needed, do NOT merge against the common ancestor: diff the two END STATES directly (git diff <committed-head> <stale-tree>), then classify every DELETION in that diff by asking whether the deleted line exists in the COMMON ANCESTOR. A deleted line absent from the ancestor is the other session''s work and must be preserved (skip that hunk); a deleted line present in the ancestor is a genuine modification by the incoming change and may be applied. That test is exact and needs no content guessing, and it separated 63 preserve-deletions from 19 apply-deletions cleanly here, with every hunk homogeneous. Also: a widened CLOSED union resolves as the UNION of both sides members, never as an overwrite.',
    'manual',
    'Before starting an engine dispatch, run git status on the target worktree. If any engine file (field_3d_renderer.ts, particle_field_renderer.ts, parametric_renderer.ts, premium_primitives.ts, deriveStateMeta.ts, build_review_site.ts) is already dirty, STOP and report — another session owns it. During the dispatch, grep the session transcript for git stash, git checkout -- and git restore against any engine path; any hit is a violation.',
    'OPEN',
    ARRAY['rigid_body_rotation', 'rolling_friction', 'work_done_by_constant_force']::text[],
    ARRAY['src/lib/renderers/field_3d_renderer.ts', 'src/lib/validators/visual/deriveStateMeta.ts']::text[],
    'rotmech Phase 0c-2 — SEAM R merge reconciliation 2026-08-03',
    'directive'
);

-- ─────────────────────────────────────────────────────────────────────────────
-- rotmech 0c-4, dispatch 1 (2026-08-13). CANDIDATE TEXT — NOT APPLIED.
-- Chapter-loop context, so no DB write was made by the surgeon. bug_class is the
-- upsert key; no existing row was found under this name, so this is an INSERT.
-- Status FIXED rests on emitted-code evidence only: per FROZEN_SCOPE_0c3.md §F
-- this dispatch is LANDED, NOT VERIFIED — no rbr concept JSON exists on master or
-- on this desk, so a verifying desk with a real rbr concept must confirm it
-- before the row is treated as closed.
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO engine_bug_queue (
    bug_class, title, severity, owner_cluster, root_cause, prevention_rule,
    probe_type, probe_logic, status, concepts_affected, fixed_in_files,
    discovered_in_session, row_type, subject
) VALUES (
    'rbr_slider_unit_is_unoverridable',
    'A rigid_body_rotation control could be given a new LABEL but never a truthful UNIT and never a conversion, so the only reachable "fix" for a control whose quantity differs from the engine''s was a relabel that prints a lie',
    'MAJOR',
    'peter_parker:field3d_surgeon',
    'rbrSc(token) returned {min, max, step, def, dp, label} — no `unit` key, so sc.unit was undefined — and the row builder consumed sp.unit, the SPEC value, pinned per token (tau_applied at " N*m"). `label` WAS overridable via slider_controls.<token>.label; the unit was not. Independently, nothing anywhere converted an authored control value into the engine quantity it drives: rbrApplyParam''s tau_applied branch wrote eng.tauApplied = value raw. The two gaps compose into one defect. Founder ruling 4 (2026-08-07, corrected) requires rotational_kinematics'' explore control to be alpha, not tau, because that concept is taught before torque and moment_of_inertia exist (Rule 25). With neither half present, the ruling''s letter could be satisfied by relabelling the tau_applied row to "alpha" — yielding glyph alpha, unit N*m, and the value of tau, printing "alpha = 1.84 N*m" where the real alpha is 0.60 rad/s^2. That is a Rule 33d violation (an instrument showing a live, WRONG numeric reading) on top of the Rule 25 problem it was meant to fix. Verified fleet-wide before building: all three *_SLIDER_SPEC tables in field_3d_renderer.ts (nlb, force_rig, rbr) pin `unit` inside the spec and every resolver overrides only min/max/step/default/label — no scenario in the file could override a slider unit.',
    'A control surface must be able to express a quantity that differs from the engine''s internal one, in BOTH halves, because either half alone prints a lie: a unit override with no scale yields a mislabelled control, a scale with no unit yields a correctly-scaled number under a wrong unit. Ship both or ship neither. Two further clauses, both load-bearing. (a) A DISPLAY scale and a PHYSICAL resolution are not the same thing and must not share semantics: RBR_RO_META.theta.scale is a constant multiplier applied at format time, whereas a control scale resolving alpha -> tau = I*alpha must read I LIVE, so the relationship holds as the apparatus changes (r ramps, m changes, masses slide) and not merely at the instant the row was built. Mirror the DECLARATION shape (one declared key, one place that applies it); never mirror the constant-factor semantics. (b) The single point of application must be where the ENGINE CONSUMES the quantity, not where the control is applied — a value converted once at drag time freezes the driving input and silently drifts. In rbr this is rbrSrcTau, called per engaged-source-sum at the exact instant asked for; with a live resolver the integrator''s segment must then be sub-walked on the same fixed grid theta uses, or the printed torque and the integrated L disagree. Every new field optional; absent = byte-identical; presence resolved by typeof, never truthiness (a scale of 0 is rejected, not read as absent). A scale authored on a token that cannot resolve one must WARN, never be silently accepted.',
    'js_eval',
    'Extract rbrSc, rbrBuildSliderRows, rbrLAt, rbrTauOf, rbrEngagedSum, rbrSrcTau and rbrIAt from the ACTUALLY EMITTED FIELD_3D_RENDERER_CODE text (never a re-typed copy) and drive them in a bare vm context. THREE legs, and the second and third are what make the first mean anything. (1) ABSENT = BYTE-IDENTICAL: with config.slider_controls empty, sample rbrLAt/rbrTauNetAt/rbrOmegaAt/rbrAlphaAt/rbrThetaAt/rbrWorkAt/rbrDLdtAt over >= 12 rbr state shapes (brake scalar, drive from rest, sources[] tug, static hold, r ramp, sandbox sweep, one-shot and periodic restart, no-torque) x >= 150 instants, plus a reversed replay, against the pre-change emitted text; assert Object.is on every cell. (2) LIVENESS: before counting leg 1, assert each shape''s L takes more than one distinct value across the sample — a byte-identical A/B against a dead baseline is not evidence. Name any shape that is legitimately static. (3) PAIRED POSITIVE CONTROL, SAME RUN: author slider_controls.tau_applied = {label: alpha, unit: rad/s^2, scale: i_alpha} and assert (a) the sampled cells DIFFER from the unscaled case, (b) the built row HTML differs in the unit and the label span while the absent case is character-identical, and (c) over an r ramp that moves I by a factor > 3, |tau_net(t) - I(t)*alpha| is zero at every sample AND L(t) matches an independent high-resolution integration of I(t)*alpha to < 1e-5 relative, where a single-midpoint evaluation would be off by percent. Finally assert purity: pin t = 3000 -> 9000 -> 3000 reproduces every quantity byte for byte.',
    'FIXED',
    ARRAY['rotational_kinematics','tau_eq_i_alpha']::text[],
    ARRAY['src/lib/renderers/field_3d_renderer.ts']::text[],
    'rotmech-0c4-field3d-surgeon-2026-08-13',
    'incident',
    'subject_neutral'
);

-- ─────────────────────────────────────────────────────────────────────────────
-- rotmech 0c-5, E10 (2026-08-13). CANDIDATE TEXT — NOT APPLIED.
-- bug_class is the upsert key — check for an existing row first; a recurrence is
-- an UPDATE, not this INSERT. `subject` is included explicitly: the surgeon's
-- draft noted it should be 'subject_neutral' but omitted the column, which would
-- have silently taken the 'physics' default. LANDED, NOT VERIFIED (§F) — Desk D
-- is the verifying partner on rotational_kinematics + tau_eq_i_alpha.
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO engine_bug_queue (
    bug_class, title, severity, owner_cluster, root_cause, prevention_rule,
    probe_type, probe_logic, status, concepts_affected, fixed_in_files,
    discovered_in_session, row_type, subject
) VALUES (
'rbr_drive_torque_has_no_rendered_actuator',
'rigid_body_rotation: a drive torque spins the turntable with no rendered agent',
'MAJOR',
'peter_parker:field3d_surgeon',
'The brake pad travel path was gated on the rbr_brake_pad mesh and driven by eng.padEngageMs, which was assigned at exactly two sites, BOTH inside the brake branch. A drive source set its own engage/release windows and left padEngageMs null, so no actuator ever travelled - and no drive mesh existed in the scenario at all. Structural cause: pad_travel_ms is singular and top-level on external_torque, so it cannot address sources[], which E4 turned the single torque source into. A second consequence found during the fix: the pad binds to the FIRST brake entry only (guard !(eng.tau > 0)), so even a second brake had no actuator. Cost: the Rule-32a cause beat lost on 11 of 17 states across rotational_kinematics and tau_eq_i_alpha.',
'A torque source that acts on the body MUST have a rendered agent that arrives before it acts (Rule 24 / section 10(d) - no stated agent without a rendered object; Rule 32a - cause before effect). Actuator TIMING is a per-entry property of the source list, never a singular top-level field. ONE travel mechanism serves every actuator (rbrActuatorAt returns a distance along the actuator own approach axis; the caller owns the axis). An actuator azimuth is SOLVED against the real view vector, not picked: travel is radial and force is tangential, so their screen projections trade off directly, and the balanced azimuths that collide with the rod home pose (theta0 = 0 lies along +-x) are excluded. A magnitude-to-length map is only shared between two vectors when BOTH bands sit on the shared map proportional branch - measure before sharing (rbrArrowLen is sized for the pull band 3.60-19.35 N and collapsed the drive band 0-3.64 N onto its floor: a 2.5x torque change moved 9% of pixels).',
'js_eval',
'Render the scenario twice through assembleField3DHtml at 1280x720 - once as authored, once with the drive source removed - pin both with SET_TIME_FREEZE at the same instants and diff on max per-channel delta > 12. ASSERT EXISTENCE, never a delta: at any pin inside [engage - travel_ms, release] the isolated ink must be non-zero and its bbox must be compact and must MOVE monotonically across the travel window, settling at engage. Carry a paired negative control (the drive-free state captured twice) as the noise floor, and a positive control (a drive-authored state) that must differ. For the rim force vector, measure ABSOLUTE ink at the pose pointing AWAY from the camera plus a ratio against the favourable pose - never a delta. Assert the magnitude map on WORLD length pulled from the emitted function text (ratio equals the true force ratio, zero intercept), never on pixel length.',
'FIXED',
ARRAY['rotational_kinematics','tau_eq_i_alpha']::text[],
ARRAY['src/lib/renderers/field_3d_renderer.ts','src/lib/validators/visual/deriveStateMeta.ts']::text[],
'rotmech-0c5-e10-drive-actuator',
'incident',
'subject_neutral'
);

-- ─────────────────────────────────────────────────────────────────────────────
-- rotmech 0c-6, B-5 (2026-08-13). CANDIDATE TEXT — NOT APPLIED. Two rows.
-- `subject` included explicitly (the surgeon's drafts omitted it, which would
-- have silently taken the 'physics' default; this is engine machinery).
-- Both bug_class strings were checked against the existing candidate files —
-- neither exists, so both are INSERTs, not reopens.
-- LANDED, NOT VERIFIED (§F) — Desk B is the verifying partner.
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO engine_bug_queue (
    bug_class, title, severity, owner_cluster, root_cause, prevention_rule,
    probe_type, probe_logic, status, concepts_affected, fixed_in_files,
    discovered_in_session, row_type, subject
) VALUES (
    'nlb_single_lane_state_renders_zero_body_meshes',
    'newtons_laws_body activation visibility was a one-way latch, so a single_lane state renders ZERO body meshes from its handover onward while the HUD keeps printing readouts for both bodies',
    'MAJOR',
    'peter_parker:field3d_surgeon',
    'nlbApplyActivationVisibility ran "if (!nlbBodyShown(eng, bb, eng.t_ms)) o.visible = false;" and contained no branch that ever wrote true. The only restoring write on an nlb_body mesh lives in the STATE ENTRY pass (o.visible = !!bd), which runs once per apply, so a body hidden on any frame while PENDING was never restored at its own activate_at_ms. nlbRetireMs returns Infinity for every body unless the state sets single_lane, so single_lane is the ONLY shape in which a body can also RETIRE - which is why exactly the two single_lane states in the fleet fail and all 35 multi-body states without the flag are untouched. In such a state the first body latches off at the handover instant and the second never comes back, so the track is empty at every instant from the handover on, AND at any earlier instant reached by a rewind, because the latch carries across frames. Measured on the real assembled renderer over a config mirroring pure_rolling STATE_3: the second body isolated by scene-graph detachment reads 0 px of absolute ink at pins 1600/2200/3000 before the fix and 1219/1217/1220 px after; driving eng.t_ms backward in place leaves BOTH bodies hidden at 6 of 6 instants before the fix. A second face of the same root cause: the arrow/component/right-angle pools are re-shown every frame by nlbDriveArrows, which runs AFTER nlbUpdateRolling, so the pass''s veto on those five element types was overwritten a few lines later and a retired body kept a live, moving force arrow hanging over an empty track. The defect survived every gate because THE EYE''s three dense-motion gates all pass by construction on newtons_laws_body (deriveMotionExpectations has no branch, deliberately) and because the frozen reveal pin lands PAST the last handover, so no capture ever photographs the retired body at all.',
    'A per-frame visibility gate over objects it OWNS must be an ASSIGNMENT, never a one-way veto: o.visible = predicate(t). A conditional hide is a latch - it carries state across frames, so it cannot rewind and it cannot restore. Where a gate does NOT own the object (a pooled element re-shown every frame by a draw pass) the veto is correct, but it must run AFTER that draw pass in the frame, or it is silently overwritten; verify the call order, never assume it. Corollary for review: presence of a correct-looking gate function is not evidence the gate reaches the screen. NOTE the residual, reported not fixed: Branch B (coupled/pulley) calls neither nlbUpdateRolling nor the veto, so BOTH halves of the activation gate are absent on that path; nothing authors a single_lane pulley state today.',
    'js_eval',
    'Load a newtons_laws_body concept with a single_lane state whose two bodies hand over at T ms. Enter the state fresh, pin SET_TIME_FREEZE at T+100, and measure ABSOLUTE ink for each body by rendering the same instant twice - once with that body''s nlb_body and nlb_body_label detached from the scene graph - diffing on max per-channel delta > 12. Assert the newly-live body is NON-ZERO and the retired body EXACTLY ZERO; then repeat at T-100 with the roles reversed. Never a delta: a delta cannot distinguish "moved" from "disappeared". Then set window.PM_nlbEngine.t_ms backward across the handover, run one frame and read the visibility flags - they must follow t with nothing latched.',
    'FIXED',
    ARRAY['pure_rolling', 'rolling_on_incline']::text[],
    ARRAY['src/lib/renderers/field_3d_renderer.ts']::text[],
    'rotmech Phase 0c-6 — nlb single_lane visibility 2026-08-13',
    'incident',
    'subject_neutral'
);

INSERT INTO engine_bug_queue (
    bug_class, title, severity, owner_cluster, root_cause, prevention_rule,
    probe_type, probe_logic, status, concepts_affected, fixed_in_files,
    discovered_in_session, row_type, subject
) VALUES (
    'absence_defect_needs_scene_graph_isolation_plus_a_null_control_not_a_frame_delta',
    'A defect of ABSENCE cannot be measured by any frame delta; isolate the object by detaching it and diff, and carry a null control, or the camera lerp reads as ink',
    'MODERATE',
    'peter_parker:field3d_surgeon',
    'Measuring whether a mesh is on screen by comparing two frames of the same scene is unsound in both directions. In the false-PASS direction a delta cannot distinguish "moved" from "disappeared" (harness ledger finding 4). In the false-FAIL direction the first version of this dispatch''s ink probe reported 2448 px of ink for a body that was provably hidden, because the state-entry CAMERA LERP is history-dependent and NOT dt-gated: it keeps moving under a SET_TIME_FREEZE pin for roughly 100-200 frames after the clock has stopped, so two screenshots taken around a scene edit are of two different camera poses. The sound measurement is (a) settle the pin until a null control - two screenshots at the same instant with nothing touched - reads 0 px, then (b) isolate the object by removing it from the scene graph and diff full-vs-isolated on max per-channel delta > 12, asserting NON-ZERO inside its live window and EXACTLY ZERO outside it. Both directions, or retirement is unproven.',
    'Any probe for a defect of absence declares its NULL CONTROL alongside its measurement, and a nonzero null control invalidates the reading rather than being absorbed into it. Under a SET_TIME_FREEZE pin, settle the camera before capturing: the clock stopping is not the scene stopping.',
    'js_eval',
    'In any field_3d ink probe: after arming the pin and settling, screenshot twice with one frame between and nothing else changed. Assert 0 differing pixels at max per-channel delta > 12 BEFORE trusting any isolation measurement taken in the same block.',
    'OPEN',
    ARRAY['pure_rolling', 'rolling_on_incline']::text[],
    ARRAY['src/lib/renderers/field_3d_renderer.ts']::text[],
    'rotmech Phase 0c-6 — nlb single_lane visibility 2026-08-13',
    'directive',
    'subject_neutral'
);

-- ─────────────────────────────────────────────────────────────────────────────
-- rotmech 0c-7, A-13 (2026-08-13). CANDIDATE TEXT — NOT APPLIED. Two rows.
-- ROW 1 = Desk A's A-13, widened by eye-walker capture 20260805-124934.
-- quality-auditor's rbr_brake_label_collides_with_the_drum_line_label_at_the_
-- contact_pose is THIS row, not a new one.
-- ROW 2 is an UPDATE/reopen of a PRE-EXISTING scar — never a second INSERT.
-- The live engine_bug_queue must be checked before applying either.
-- LANDED, NOT VERIFIED (§F) — Desk A is the verifying partner on CoAM.
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO engine_bug_queue (
    bug_class, title, severity, owner_cluster, root_cause, prevention_rule,
    probe_type, probe_logic, status, concepts_affected, fixed_in_files,
    discovered_in_session, row_type, subject
) VALUES (
    'world_anchored_sprite_labels_overlap_their_own_geometry_and_each_other',
    'Every rigid_body_rotation caption is a camera-facing sprite pinned to a world anchor with no de-collision at any orbit angle, so a caption overprints both peer captions and the geometry it names — and the brake/R_drum pair does it deterministically for the whole of the taught beat',
    'MAJOR',
    'peter_parker:field3d_surgeon',
    'Where two world-anchored billboards land on SCREEN is a fact about the camera, not about their anchors, and nothing in the scenario asked. The blocking instance is not incidental: with the pad engaged, rbr_brake_label sits at (0, 0.40, contactZ + 0.20) and rbr_drum_line_label at (0, 0.42, RBR_DEF_DRUM_R*W + 0.34) — two sprites 0.28 and 0.30 tall, 0.02 apart in y and 0.05 in z — for the entire engage_at_ms 1500 -> release_at_ms 4000 window, i.e. the whole of the state''s taught beat. Measured pre-fix by scene-graph isolation at 1280x720: bounding boxes overlapping 494-546 px at every one of six instants across the window, with the brake caption reduced to 130-218 px of surviving ink. It RESOLVES when the pad retracts, so it is absent from the frozen frame — which is why a frozen-only read missed it twice. Three further instances from the pixels: "pull" overprinting "L" (rendering as pulL), "pull" sitting on the yellow mass it names, and "R_drum" over the drum ring. The scenario is core ring, so the defect survives every preset cut including core_only, and it destroys the rim caption exactly when the rim is the taught object.',
    'A world-anchored caption carries a screen-space offset resolved against the sprite it names AND against peer captions; anything that would overprint at any orbit angle is NUDGED, not drawn over. Six clauses, each bought with a measured failure. (a) SCOPE: build the pass scenario-locally or behind a flag only that scenario passes — an unconditional nudge inside createLabelSprite/pmCreateAutoLabel moves pixels in ~40 baseline-locked concepts for a defect that belongs to one scenario''s anchor layout. (b) PURITY: the nudge is a pure function of the pose, read from a recorded HOME lane and never from the previous frame''s output; hysteresis is latched state and cannot be rewound (hysteretic_state_cannot_be_latched_under_a_time_pin), so the pop it was meant to prevent (field3d_hard_threshold_label_decollision_pops_when_the_pair_separates) is prevented by CONTINUITY instead — the lift eases to exactly zero as the inks part. (c) The decay band is NARROW and sits at the very end of the overlap: easing across the whole range under-resolves, and a caption 0.23 below an obstacle asking 0.58 and granted 0.19 leaves the pair moving together and still overlapped. (d) Never demand clearance from an obstacle the caption sits well BELOW, and never model a thin ring by its bounding box: an up-only rule against a ring''s far arc demands a lift of a whole radius, both captions hit the cap and stay overlapped, now far off their referents. A binding cap is a silent re-creation of the defect — size it so it never binds and assert that. (e) TWO SUB-PASSES, apparatus first, peers second, with the peer test run from where the apparatus dodge actually put the caption; one combined list lets the same obstacle lift both captions equally while the peer test, running from home, asks for nothing. (f) Lab-frame captions hold their lanes and rotating-frame captions yield, and a caption dodges only solids in its own rotating frame — otherwise a fixed reference caption rises and falls on the body''s rotation, which a student reads as physics (Rule 32b).',
    'js_eval',
    'Render the scenario headless at 1280x720 and measure ABSOLUTE INK in BOTH DIRECTIONS at the UNFAVOURABLE pose — never a bare delta, which cannot distinguish "nudged" from "vanished". (1) NULL CONTROL FIRST: the state-entry camera lerp is history-dependent and not dt-gated, so it keeps moving after the clock stops; settle until two untouched captures at one instant read 0 differing px before trusting any measurement. (2) ISOLATE BY MATERIAL OPACITY, NOT BY .visible: a de-collision pass skips a hidden participant, so hiding one caption moves the other and the measurement is of a layout that never renders. Set material.opacity = 0, diff full-vs-isolated at max per-channel delta > 12, and record each caption''s ink count AND bbox separately. (3) MEASURE ON DENSE FRAMES ACROSS THE ENGAGE WINDOW, not the frozen frame — the collision resolves when the actuator retracts and is absent from the frozen capture. (4) ASSERT BOTH: each caption''s ink is readable on its own (non-zero, and not lower than the pre-change reading), AND neither bbox intersects the other''s, at every sampled instant. (5) ASSERT NO SATURATION: no caption may reach the safety cap. (6) REWIND PURITY: pin t = 3000 -> 9000 -> 3000 and assert the same-instant capture is byte-identical, with a paired positive control (3000 vs 9000) shown differing in the same run.',
    'FIXED',
    ARRAY['conservation_of_angular_momentum','angular_momentum','rotational_kinematics','tau_eq_i_alpha','rotational_work_energy']::text[],
    ARRAY['src/lib/renderers/field_3d_renderer.ts']::text[],
    'rotmech-0c7-field3d-surgeon-2026-08-13',
    'incident',
    'subject_neutral'
);

UPDATE engine_bug_queue SET
    status = 'FIXED',
    concepts_affected = ARRAY(SELECT DISTINCT unnest(
        concepts_affected || ARRAY['conservation_of_angular_momentum']::text[])),
    fixed_in_files = ARRAY(SELECT DISTINCT unnest(
        fixed_in_files || ARRAY['src/lib/renderers/field_3d_renderer.ts']::text[])),
    root_cause = root_cause || ' RECURRENCE (rotmech 0c-7, 2026-08-13): reappeared in rigid_body_rotation as Desk A''s A-13 and is tracked there under world_anchored_sprite_labels_overlap_their_own_geometry_and_each_other. Two lessons this recurrence adds. (1) The recurrence was DETERMINISTIC, not incidental — two captions authored 0.02 apart in y for the whole of a core-ring state''s taught beat — so an anchor-layout review at authoring time would have caught it before any pass existed. (2) It was missed twice by a frozen-only read, because the collision resolves when the actuator retracts: the defect exists only in the DENSE frames.',
    discovered_in_session = 'rotmech-0c7-field3d-surgeon-2026-08-13'
WHERE bug_class = 'field3d_label_sprite_overlap';
