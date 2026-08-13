-- ============================================================================
-- ch6 · founder review round 2 — de-templating, S4/S5 collapse, ship (2026-08-09)
--
-- Findings from the SECOND half of the founder-review session, after
-- scar_candidates_teaching_dwell.sql was written. Three defects that file
-- does not cover, all found by reading pixels or by the act of deleting a
-- state — none by a gate.
--
-- APPLIED 2026-08-09 (founder asked for the session's findings to be in the
-- queue). `bug_class` is the upsert key.
-- ============================================================================

-- 1 ─ the PRIMARY aha rendered the misconception, and the approved baseline
--     had blessed it (content, CRITICAL, FIXED in the concept JSON)
INSERT INTO engine_bug_queue (
  bug_class, title, severity, owner_cluster, root_cause, prevention_rule,
  probe_type, probe_logic, status, concepts_affected, fixed_in_files,
  discovered_in_session, row_type
) VALUES (
'checkpoint_capture_mode_first_at_the_home_pose_stamps_the_departure_reading_so_the_state_renders_its_own_misconception',
'A capture_mode "first" checkpoint seeded at the body home pose latches the DEPARTURE values, so the round-trip aha state displayed W friction = 0.0 J — the exact belief the concept exists to kill',
'CRITICAL', 'alex:json_author',
'A checkpoint whose s_m equals its body''s initial_position_m is ARMED AT THE HOME POSE, so its first crossing is the departure at t = 0, not the return. Under capture_mode "first" the stamp latches that departure — every accumulator still zero — and holds it for the whole state. On conservative_vs_nonconservative_forces the start-line stamp therefore read "back at the start: W gravity = 0.0 J . W friction = -125.3 J" as "= 0.0 J . = 0.0 J", asserting that friction''s round-trip work is ZERO. That is the misconception the concept is built to destroy, printed on its PRIMARY aha state, held for the full state duration. The state is titled for the round trip, so a reader has no cue that the number is a departure reading. Pre-existing since the home-pose arming determinism fix (PR #62) changed WHICH crossing fires first; the approved baseline predates that change, so H2 compared the defect against a baseline captured before the defect existed and passed. No gate reads stamp SEMANTICS, so nothing else could see it either. FIXED by capture_mode "every" on both S1 and S2, which re-stamps each crossing so the held value is the RETURN reading (-125.3 J).',
'A checkpoint seeded at the home pose fires on DEPARTURE first. If the claim is about the RETURN, capture_mode must be "every" (or dwell_from_pass >= 2) — "first" latches the departure and will read all-zeroes. Rule: whenever a checkpoint''s s_m equals its body''s initial_position_m, state in the state label which PASS the stamp is meant to show, and verify the rendered string at the frozen pin says that. Corollary, and the reason this survived: a baseline older than the behaviour it depicts cannot detect a change in that behaviour — after any determinism or arming-order fix, RE-READ the aha frames of every concept that arms a checkpoint at a home pose rather than trusting the H2 pass.',
'js_eval',
'For every checkpoint whose s_m equals the referenced body''s initial_position_m: assert capture_mode is "every" OR dwell_from_pass >= 2 OR the state label explicitly names the departure as the intended reading. Independently, at each state''s eye_capture_ms, parse the rendered #nlb_formula stamp and FAIL when every captured accumulator in a round-trip state reads exactly 0.0 — a stamp whose every work value is zero on a state whose title names a completed trip is the signature of a latched departure.',
'FIXED',
ARRAY['conservative_vs_nonconservative_forces']::text[],
ARRAY['src/data/concepts/conservative_vs_nonconservative_forces.json']::text[],
'ch6 founder review round 2 (2026-08-09)', 'incident');

-- 2 ─ visual:approve leaves baselines for states the concept no longer has
--     (tooling, OPEN)
INSERT INTO engine_bug_queue (
  bug_class, title, severity, owner_cluster, root_cause, prevention_rule,
  probe_type, probe_logic, status, concepts_affected, fixed_in_files,
  discovered_in_session, row_type
) VALUES (
'visual_approve_writes_the_current_states_but_never_removes_baselines_for_states_the_concept_dropped',
'visual:approve copies the run''s frames over the baseline directory without pruning it, so deleting a state leaves its approved PNGs behind as orphans that outlive the state forever',
'MODERATE', 'peter_parker:renderer_primitives',
'visual_approve.ts writes one PNG per state IN THE CURRENT RUN and rewrites baselines.json, but performs no delete pass over the target directory. When work_energy_theorem went from 6 states to 5 (STATE_5, the derivation, deleted and the sandbox renumbered), approve wrote the 10 correct PNGs and left STATE_6.png and STATE_6__frozen.png in place. The manifest no longer references them, so THE EYE does not compare them and NOTHING FAILS — the orphans are silently carried in git forever, showing a state the product no longer has. The failure is invisible in exactly the case that creates it: a state deletion, where the baseline count silently stops matching the state count. Caught by hand this session; removed with git rm.',
'An approve step that owns a directory must own the WHOLE directory: write the current set and prune anything not in it, or refuse and report. Any tool that syncs a derived directory from a source of truth needs a delete pass, not just a write pass. Interim manual rule until this is fixed: after approving a concept whose state COUNT changed, diff the baseline PNG count against 2x the state count and git rm the remainder.',
'js_eval',
'After visual:approve, assert the baseline directory contains exactly the files named in baselines.json — no extras. Independently, in the validator, assert 2 * (number of epic_l_path states) equals the PNG count in visual_baselines/<id>/ for every baseline-locked concept, so an orphan from any historical deletion surfaces fleet-wide.',
'OPEN',
ARRAY['work_energy_theorem']::text[],
ARRAY[]::text[],
'ch6 founder review round 2 (2026-08-09)', 'incident');

-- 3 ─ a state edit/deletion leaves claims about that state everywhere ELSE
--     (authoring discipline, OPEN)
INSERT INTO engine_bug_queue (
  bug_class, title, severity, owner_cluster, root_cause, prevention_rule,
  probe_type, probe_logic, status, concepts_affected, fixed_in_files,
  discovered_in_session, row_type
) VALUES (
'state_rewrite_updates_the_state_block_and_leaves_every_other_field_asserting_the_old_behaviour',
'Removing a behaviour from one state leaves prose all over the concept, the registration sites and the classifier prompt still advertising it, and no gate compares prose against physics',
'MAJOR', 'alex:json_author',
'A state''s behaviour is described in far more places than its own block. When work_energy_theorem STATE_4 lost its backward launch, the state block was updated and these were not: assessment.mastery_definition ("including through a velocity reversal"), the JEE Advanced curriculum_tags syllabus_unit ("through a velocity reversal, and its derivation from F = ma"), q4.tested_idea and q4.parallel_form_stem (a cart "launched backward ... turned around"), the STATE_4 HUD scene_composition line ("the HUD''s v row crosses zero at the turn" — there is no turn), two drill_down cluster ids naming the reversal, a physics constraint citing the deleted state''s +5.09 m as the furthest travel, and — outside the JSON — the CONCEPT_RENDERER_MAP comment, the CONCEPT_PANEL_MAP comment, the VALID_CONCEPT_IDS comment and the CLASSIFIER_PROMPT description, the last of which still told the classifier the sim teaches a derivation and a reversal it no longer contains. A sibling instance in the same session: the conservative_vs_nonconservative_forces registration comments still quoted the aha as -27.4 J after it was fixed to -125.3 J. Every gate passed throughout: the validator checks STRUCTURE (ids resolve, counts, budgets), never whether prose still matches physics.',
'A state edit is not scoped to the state. Before declaring one done, grep the concept id and the changed behaviour''s vocabulary (the direction word, the deleted quantity, the old number) across: the concept JSON in full, all 8 registration sites, and the classifier prompt — and re-read every hit. When DELETING a state, also re-check state_count, entry_state_map, coverage_map, every teaches_state, the assessment question floor, and the baseline directory. Treat a stale NUMBER in a registration comment as a defect, not a cosmetic: it is the text the next author reads before touching the concept.',
'js_eval',
'Static probe over each concept JSON plus its registration comments: extract every numeric quantity with a unit that appears in prose fields (mastery_definition, tested_idea, parallel_form_stem, scene_composition text, curriculum_tags, and the four registration-site comment blocks) and assert each appears in at least one state''s computed values, checkpoints, variable_overrides or formula surfaces. Report every prose number with no physics referent — that set is exactly the stale-claim list.',
'OPEN',
ARRAY['work_energy_theorem','conservative_vs_nonconservative_forces']::text[],
ARRAY[]::text[],
'ch6 founder review round 2 (2026-08-09)', 'incident');
