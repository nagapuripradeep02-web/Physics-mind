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
