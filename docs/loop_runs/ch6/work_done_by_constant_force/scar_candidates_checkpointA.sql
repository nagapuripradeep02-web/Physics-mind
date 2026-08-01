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

-- ── Checkpoint A CYCLE 2 additions (2026-08-01) — SQL TEXT ONLY, NOT APPLIED ──
-- Checked against every bug_class already in this run's files: no collisions.

INSERT INTO engine_bug_queue (bug_class, title, severity, owner_cluster, root_cause, prevention_rule,
  probe_type, probe_logic, status, concepts_affected, fixed_in_files, discovered_in_session, row_type)
VALUES
('nlb_static_state_authored_on_the_track_bound_fires_a_false_clamp_alarm',
 'A body authored at initial_position_m = -length_m trips the energy clamp guard every frame it does not move',
 'MAJOR', 'alex:architect',
 'nlbBoundsM returns lo = -length_m and the integrator treats any s1 within 1e-9 of a bound as a clamp (L45441), calling nlbEnergyClampGuard whenever energy_active is true - which work_accumulators alone make true (L42747), no energy_layer required. A state whose body deliberately does NOT move (a static-friction hold, a zero-net-force beat) and is seeded exactly on the bound therefore emits [PM_NLB_ENERGY_CLAMP] and latches energy_held on every entry, on a correctly-authored state, with the engine message instructing the reader to re-author it. Separately, the slab is drawn to exactly +/-length_m while a cart half-width is 0.55 m, so a body centred on the bound overhangs the floor by half its own width in every opening frame and frozen baseline. Sibling of geometric_track_clamp_rendered_as_an_energy_change: that row made the clamp honest about energy; this one is about entering the clamp branch when no clamp happened.',
 'Never author a home pose exactly on a track bound. Inset it by at least the body half-width (0.6 m for a cart) in every state; where a sandbox wrap needs the arrow origin at the receiving bound, take the small post-wrap residual instead and fix b.s0 in the engine.',
 'js_eval',
 'For every state authoring newtons_laws_body: assert Math.abs(body.initial_position_m) < surface.length_m - 0.55. Independently, drive the state for 2 s and assert zero console messages beginning "[PM_NLB_ENERGY_CLAMP]".',
 'OPEN',
 ARRAY['work_done_by_constant_force','positive_negative_zero_work','work_energy_theorem','conservative_vs_nonconservative_forces','mechanical_energy_loss_with_friction']::text[],
 ARRAY[]::text[],
 'ch6-0d-checkpointA-cycle2-work_done_by_constant_force', 'directive'),

('nlb_work_bar_glow_ids_never_light_behind_the_energy_prefix_gate',
 'SEAM M declares work_bar_* glow ids but nlbEnergyApplyGlow gates on energy_* prefixes, so the focal lights nothing and dims everything',
 'MAJOR', 'peter_parker:field3d_surgeon',
 'nlbEnergyApplyGlow computes isEn from four literal tests - energy_panel, energy_bar_*, energy_seg_*, energy_col_E (L43490-92). work_bar_applied|gravity|friction|normal|net match none, so every slot is written opacity 1 / boxShadow none and the intended focal is never lit, despite NLB_WK_GLOW setting the correct data-en at L44336 and the build comment at L43194 asserting the bars answer through it. Worse than a no-op: nlbApplyGlow still sees a truthy focal matching no mesh, so every arrow and label takes the dim branch at GLOW_DIM_OPACITY - the state renders with its whole force diagram at 40% and nothing highlighted.',
 'A glow id declared in a seam contract ships with a probe that lights it and asserts a pixel-level difference; a declared-but-unreachable id is worse than an absent one because the unmatched focal dims the entire scene.',
 'js_eval',
 'For each id in the seam contract glow list, SET_GLOW to it on a state that renders the element and assert the element opacity is 1.0 AND at least one declared peer element sits at GLOW_DIM_OPACITY. An id where every element stays at 1.0 is this bug.',
 'OPEN',
 ARRAY['work_done_by_constant_force','positive_negative_zero_work','work_energy_theorem','mechanical_energy_loss_with_friction']::text[],
 ARRAY[]::text[],
 'ch6-0d-checkpointA-cycle2-work_done_by_constant_force', 'incident'),

('nlb_seized_slider_run_overruns_a_loop_sized_work_scale',
 'A guided state with a slider abandons loop_reset_ms on the first trusted input, so its reachable work peak is the whole track, not the loop',
 'MODERATE', 'alex:physics_author',
 'A trusted slider input latches PM_nlbSweepSeized (L42171) and nlbRunLoopReset returns early for the rest of the state visit (L43018). A work_scale_J sized to the authored loop peak is then exceeded by the seized single traverse of the remaining track at the slider extreme, so the bar clamps at full deflection and [PM_NLB_ENERGY_SCALE] fires (L44364-75) - in exactly the state whose taught quantity is the bar. THE EYE cannot fire trusted events, so no gate sees it; only a live teacher does, during the interaction the slider exists for.',
 'work_scale_J on any state exposing a slider is sized to 1.1x the peak reachable at the slider clamp extremes over the full remaining track, never to the authored loop peak. State the seized-traverse duration in the skeleton so narration never promises an endless loop.',
 'js_eval',
 'For each state with controls_visible non-empty and work_accumulators authored: compute max over the slider_controls range of |F_along| x (length_m - initial_position_m) and assert work_scale_J >= 1.1 x that value.',
 'OPEN',
 ARRAY['work_done_by_constant_force','positive_negative_zero_work','work_energy_theorem','average_power']::text[],
 ARRAY[]::text[],
 'ch6-0d-checkpointA-cycle2-work_done_by_constant_force', 'directive');

-- ── ENGINE FIX (field3d_surgeon dispatch, 2026-08-02) — SQL TEXT ONLY, NOT APPLIED ──
-- Routed FAIL from quality-auditor. Fixed in this dispatch; row filed as FIXED.
-- bug_class checked against every row already in this run's files: no collision.

INSERT INTO engine_bug_queue (bug_class, title, severity, owner_cluster, root_cause, prevention_rule,
  probe_type, probe_logic, status, concepts_affected, fixed_in_files, discovered_in_session, row_type)
VALUES
('nlb_checkpoint_capture_overshoots_exact_crossing_value',
 'SEAM M stamps the checkpoint value one physics step PAST the crossing, so a state whose whole claim is "the numbers agree" stamps 40.6 J against a 40.0 J formula',
 'MAJOR', 'peter_parker:field3d_surgeon',
 'nlbRunCheckpoints detects a crossing by comparing the POST-step side (b.s >= cp.s_m) with the side it remembered last frame, so by the time it fires the body is already past cp.s_m by up to one full step of travel; nlbCpStampText then read every captured quantity (W, K, U_grav, U_spring, E_total, v, s) at that post-step position, with no interpolation back to the crossing coordinate. The stamped work overshoots by F_along*(s1 - s_m), bounded by F_along*v_cross*h. The relative error is h*sqrt(2a/d) - INDEPENDENT of F - so no authored force, distance or display precision can dodge it: reaching a 1-dp-correct stamp on a 2 m flag would need a < 0.0056 m/s^2, a 26.7 s crossing, 13x past the crossing-before-55%-of-loop_reset_ms invariant. The ledger itself was exact everywhere (20.00 J/m x d to the printed digit); SEAM N verified the LEDGER, nobody verified the CAPTURE. Observed: work_done_by_constant_force STATE_4 stamped "W by the pull = 40.6 J" under a formula surface reading 40 x 2.0 x cos 60 = 40.0 J, across two EYE runs, the panel_a frame, the frozen baseline and every dense frame of every loop cycle.',
 'Any value captured at the instant a body passes a position must be interpolated back to that position, never read from the post-step state that DETECTED the pass. Interpolate per quantity, never blanket-lerp: linear only where the quantity is affine in the step (W over a step-constant force, U_grav over an affine height map, the spring compression x), and rebuilt from the interpolated primitive where it is not (v from the constant-a identity v^2 = v1^2 - 2a(s1-s_m), K from that v). A one-step-late stamp is invisible to every structural gate and only a numeric read of the pixel catches it.',
 'js_eval',
 'For every state authoring newtons_laws_body.checkpoints with a capture list containing W: compute the analytic value F_along x (cp.s_m - body.initial_position_m), read the stamp text off #nlb_formula after the crossing, parse the number, and assert |stamped - analytic| < 0.5 x 10^-precision. Independently, sweep the sub-step phase (run the same state from several loop-cycle offsets) and assert the stamped string is byte-identical every time - a stamp that varies with the phase the crossing lands on is this bug.',
 'FIXED',
 ARRAY['work_done_by_constant_force','positive_negative_zero_work','work_energy_theorem','conservative_vs_nonconservative_forces','mechanical_energy_loss_with_friction']::text[],
 ARRAY['src/lib/renderers/field_3d_renderer.ts']::text[],
 'ch6-0d-engine-field3d_surgeon-work_done_by_constant_force', 'incident');
