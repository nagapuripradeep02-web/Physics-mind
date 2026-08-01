-- Scar candidates from founder-proxy Checkpoint A, work_done_by_constant_force (ch6 0d concept #1).
-- SQL TEXT ONLY — NOT APPLIED. Chapter-loop context; no DB writes.
-- Checked against scar_candidates_seam_k.sql and scar_candidates_seam_m.sql: no bug_class collisions.
-- Row 3 is closely related to field3d_path_integral_accumulator_bills_a_teleport_as_displacement but
-- names a DIFFERENT object (the drawn arrow, not the ledger), so it is a new class that
-- cross-references the old one.

INSERT INTO engine_bug_queue (bug_class, title, severity, owner_cluster, root_cause, prevention_rule,
  probe_type, probe_logic, status, concepts_affected, fixed_in_files, discovered_in_session, row_type)
VALUES
('nlb_checkpoint_s_m_authored_as_displacement_not_track_coordinate',
 'checkpoints.s_m is an absolute track coordinate; authoring it as displacement stamps the wrong joules',
 'CRITICAL', 'alex:architect',
 'nlbRunCheckpoints compares b.s (seeded from initial_position_m, on a track spanning -length_m..+length_m, default half-length 6 m) against cp.s_m. A skeleton that writes s_m: 2.0 meaning "2 metres of displacement" fires the stamp at 2.0 m of TRACK, so the stamped W = F*d*cos(theta) disagrees with the formula surface unless initial_position_m = 0. No gate cross-checks a stamp against a formula.',
 'Author every checkpoint as arithmetic on the home pose (s_m = initial_position_m + d_target), never as a bare displacement literal; state initial_position_m explicitly in the skeleton home-pose paragraph.',
 'js_eval',
 'For each state authoring newtons_laws_body.checkpoints: read initial_position_m of the tracked body and compute d = s_m - initial_position_m; assert the concept''s own claimed stamp value equals F_along * d for the state''s authored applied_force. Any mismatch is this bug.',
 'OPEN',
 ARRAY['work_done_by_constant_force','positive_negative_zero_work','work_energy_theorem','conservative_vs_nonconservative_forces','average_power']::text[],
 ARRAY[]::text[],
 'ch6-0d-checkpointA-work_done_by_constant_force', 'directive'),

('nlb_loop_reset_clears_checkpoint_stamp_and_frozen_pin_can_photograph_an_empty_formula',
 'loop_reset_ms wipes every checkpoint stamp each cycle; the 60%-phase frozen pin can land before the re-crossing',
 'MAJOR', 'alex:architect',
 'nlbRunLoopReset routes through nlbResetTrajectory -> nlbSpringPhysReset, which sets cp.text = "", cp._side = null, cp._count = 0 and re-renders formula_base with no stamp. SEAM M pins the frozen frame at cycle*R + clamp(0.60R,150,R-150). A flag crossed after 60% of R therefore never appears in the canonical reviewer frame or the H2 baseline, and blinks off periodically for a live teacher. Skeletons that describe the stamp as "latched, holds across loops" are describing behaviour the engine does not have.',
 'A state combining loop_reset_ms with checkpoints must author the crossing to occur before 55% of loop_reset_ms, computed by physics-author against the state''s authored acceleration; the skeleton states this invariant beside the bounding discipline.',
 'js_eval',
 'For each state authoring both loop_reset_ms (R) and checkpoints: integrate the authored acceleration from initial_position_m and assert time-to-cross(s_m) < 0.55*R. Independently, drive SET_TIME_FREEZE to the contracted pin instant and assert #nlb_formula textContent contains the stamp label.',
 'OPEN',
 ARRAY['work_done_by_constant_force','positive_negative_zero_work','work_energy_theorem','conservative_vs_nonconservative_forces']::text[],
 ARRAY[]::text[],
 'ch6-0d-checkpointA-work_done_by_constant_force', 'directive'),

('nlb_sandbox_wrap_remaps_s_but_not_s0_so_the_d_arrow_contradicts_the_rezeroed_work_ledger',
 'On a sandbox wrap the displacement vector keeps its pre-wrap origin while the work ledger correctly re-zeroes',
 'MAJOR', 'peter_parker:field3d_surgeon',
 'The sandbox wrap does s1 -= span and calls nlbEnergyOnWrap -> nlbSpringPhysReset, which correctly zeroes every W ledger and drops _s_pre. b.s0 is NOT remapped, and b.s0 is the displacement vector''s origin (ds2 = b.s - b.s0). For the whole run from the bound back past s0 the d arrow points backward with a live metre value while the applied-force work bar reads 0.0 J and climbs positive, under a formula surface asserting W = F*d*cos(theta). Sibling of field3d_path_integral_accumulator_bills_a_teleport_as_displacement: the ledger was hardened against the teleport, the drawn arrow was not.',
 'A teleport that is not a displacement must be discarded by every consumer of displacement, drawn as well as computed - remap b.s0 by the same span the wrap applies to b.s. Authoring mitigation until then: author a sandbox state''s initial_position_m at the wrap-receiving bound so d re-hides in the same frame the ledger zeroes.',
 'js_eval',
 'In a mode:"sandbox" state authoring displacement_vector and work_accumulators, drive the body past the track bound to force a wrap, then within 10 frames assert sign(PM_nlbOffAxis.d_value) === sign(work bar W) whenever |W| > 0.1 J.',
 'OPEN',
 ARRAY['work_done_by_constant_force','positive_negative_zero_work']::text[],
 ARRAY[]::text[],
 'ch6-0d-checkpointA-work_done_by_constant_force', 'incident'),

('architect_declares_an_engine_limit_without_checking_the_per_concept_override_path',
 'A skeleton designed around an engine "fixed range" that is only a default overridable via slider_controls',
 'MODERATE', 'alex:architect',
 'The skeleton withheld a slider from the state that teaches its own variable, and instructed that no surgeon dispatch be opened, on the stated ground that the F_ang range is engine-fixed at -90..180. NLB_SLIDER_SPEC holds defaults; nlbSc(token) merges config.slider_controls[token] over them for min/max/step/def/label, keyed by the same token controls_visible uses. A seam report names the default; the config type and the reader function name the contract.',
 'Before declaring any engine value fixed, read BOTH the config type declaration and the reader function in the renderer, not the seam report alone; a seam report states what was built, the reader states what is authorable.',
 'manual',
 'For every ENGINE FIT CHECK row asserting a limit or an absent mechanism, grep the renderer for the config-type field and its reader function and quote both line numbers in the skeleton. An asserted non-existence with no grep behind it is this bug.',
 'OPEN',
 ARRAY['work_done_by_constant_force']::text[],
 ARRAY[]::text[],
 'ch6-0d-checkpointA-work_done_by_constant_force', 'directive');
