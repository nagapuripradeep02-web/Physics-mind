-- Chapter-level scar candidate -- the inclined-sandbox wrap manufactures potential energy
-- Source: founder-proxy Checkpoint B on potential_energy_definition (Ch.6 concept #6),
-- routed [owner: peter_parker:field3d_surgeon] and fixed in the same dispatch 2026-08-10.
--
-- NOT APPLIED. Authored for founder batch review alongside
-- scar_candidates_viewport_premise.sql.
-- Verified before authoring (SELECT-only, live dev table dxwpkjfypzxrzgbevfnx):
--   bug_class 'nlb_sandbox_wrap_reenters_at_the_opposite_bound_...' -> 0 rows.
-- So this is a genuine INSERT, not a recurrence, and the ON CONFLICT branch below
-- cannot reopen a closed row on first apply.
--
-- Scar-apply hazard (recorded in this chapter, concept #2, and repeated here): the
-- upsert sets status = EXCLUDED.status. On any RE-apply, verify the row is not already
-- FIXED in the live table first -- a verbatim re-apply would discard its fixed_at.
--
-- Sibling rows deliberately NOT touched by this file (both OPEN, both adjacent, neither
-- is this defect):
--   nlb_sandbox_energy_envelope_computed_from_the_seed_lap_instead_of_the_full_wrap_span
--   nlb_sandbox_work_ledger_has_no_provably_safe_work_scale_because_it_accumulates_across_the_wrap
-- The fix below narrows both on INCLINED sandboxes only (an inclined lap is now exactly
-- the authored seed lap, so the envelope and the ledger scale are bounded by the authored
-- launch there). Neither row is closed by it -- both remain OPEN for the flat case.

INSERT INTO engine_bug_queue (bug_class, title, severity, owner_cluster, root_cause, prevention_rule,
  probe_type, probe_logic, status, concepts_affected, fixed_in_files, discovered_in_session, row_type)
VALUES
('nlb_sandbox_wrap_reenters_at_the_opposite_bound_so_an_inclined_surface_manufactures_potential_energy',
 'The newtons_laws_body sandbox wrap remaps a body bound-to-bound, which is energy-neutral only on a flat track -- on an incline it teleports the body through the full height of the ramp every lap and no arithmetic gate can see it',
 'CRITICAL', 'peter_parker:field3d_surgeon',
 'SEAM J''s sandbox wrap (field_3d_renderer.ts, Branch A of the nlb integrator) did s1 -= wDir*span on a bound crossing: the body leaves by one end of the track and is placed at the other. That is energy-neutral for exactly one reason -- on a flat track every point of the run is at the same height -- and the wrap was written and reviewed on flat sandboxes (13 of the 17 authored sandboxes are theta_deg 0). On an inclined track the same remap carries the body through the WHOLE height of the ramp in one frame. It is invisible to every numeric check because the wrap re-zeroes the work ledgers and re-captures the energy baseline in the SAME frame (nlbEnergyOnWrap -> nlbSpringPhysReset), so dU = -W_gravity still holds to the last decimal on BOTH sides of the discontinuity: the ledger re-anchor and the U reference re-anchor together. Only the PICTURE breaks. Measured on potential_energy_definition STATE_4 (theta 30, length 6, s0 -3.6, v0 8, mu 0): the block crosses s = -6 at t = 3.538 s and is placed at s = +5.9, the top of the ramp, so U leaps 1.96 -> 235.3 J (233 J, 42% of the 560 J bar) while the block is still descending, and it repeats every 1.109 s forever because a frictionless ramp damps nothing. EYE frames one second apart, run 20260810-005403: STATE_4__dense_t03000.png shows s = -1.595, v = -6.66 m/s, gravity ledger -39.3 J; STATE_4__dense_t04000.png shows s = +1.992 (3.6 m HIGHER), v = -10.12 m/s (FASTER, still descending), gravity ledger +76.7 J. A block on a frictionless ramp gaining both height and speed. The same wrap also defeated conservative_vs_nonconservative_forces STATE_5 (theta 25, mu 0.3 < tan 25 = 0.466, so it slides and wraps from t = 4.28 s): its formula surface asserts a ROUND TRIP, but the remap ran it top-to-bottom repeatedly and it never made one.',
 'A wrap, remap or teleport that repositions a body is energy-neutral ONLY under the symmetry that makes the two positions equivalent. Bound-to-bound remapping assumes a translationally symmetric track and is therefore valid at theta_deg = 0 and nowhere else. Any such shortcut must be gated on the symmetry it depends on, read LIVE (a slider can tilt a track the author wrote flat -- 8 of the 17 sandboxes expose a theta slider, 3 of them authored at theta 0), and where the symmetry is absent the body must be re-anchored at a pose whose energy is authored, not derived from a bound. Corollary for reviewers: dU = -W_gravity agreeing across a discontinuity proves nothing when the ledger origin and the potential reference re-anchor in the same frame -- confirm the PICTURE (does the body gain height and speed at once?) before trusting the identity.',
 'js_eval',
 'For every field_3d state with newtons_laws_body.mode = "sandbox" and a nonzero effective surface.theta_deg, drive the review player past the first bound crossing and sample window.PM_nlbEngine each frame. Assert that on the frame where the body position s jumps discontinuously, total mechanical energy m*g*(s*sin(theta)) + 0.5*m*v^2 is continuous to within the frame''s own integration error for a frictionless track, and that the post-jump position equals the authored initial_position_m rather than the opposite track bound. Separately assert no frame pair exists where the body''s height increases while its speed also increases and no force does positive work on it.',
 'FIXED', ARRAY['potential_energy_definition','conservative_vs_nonconservative_forces','block_on_incline','gravitational_potential_energy']::text[],
 ARRAY['src/lib/renderers/field_3d_renderer.ts']::text[],
 'ch6-concept6-founder_proxy_checkpoint_b-field3d_surgeon-2026-08-10', 'incident')
ON CONFLICT (bug_class) DO UPDATE SET
  title = EXCLUDED.title, severity = EXCLUDED.severity, root_cause = EXCLUDED.root_cause,
  prevention_rule = EXCLUDED.prevention_rule, probe_logic = EXCLUDED.probe_logic,
  status = EXCLUDED.status, concepts_affected = EXCLUDED.concepts_affected,
  fixed_in_files = EXCLUDED.fixed_in_files;

-- Fix shipped in the same dispatch: nlbWrapIsRelaunch() / nlbWrapHomeS() beside
-- nlbWrapSeedMirror, and the relaunch branch inside SEAM J's wrap. On a live-nonzero
-- theta the wrap now returns the body to its authored home pose (s0, v0) -- the
-- loop_reset_ms idiom the guided states on the same apparatus already use -- which is
-- EXACTLY energy-neutral on a frictionless ramp, because (s0, v0) and (bound, v_bound)
-- are two points of one conserved trajectory. theta = 0 keeps the remap untouched.
--
-- concepts_affected lists all four inclined sandboxes. Two of them reach a bound at
-- their authored defaults and were actively broken (potential_energy_definition STATE_4,
-- conservative_vs_nonconservative_forces STATE_5). The other two are held by static
-- friction at their authored defaults and were only reachable through their own theta /
-- mu sliders (block_on_incline STATE_5: theta 20, mu 0.38 > tan 20 = 0.364;
-- gravitational_potential_energy STATE_6: theta 30, mu 0.8 > tan 30 = 0.577) -- listed
-- because a teacher moving one slider reached the defect, not because a baseline showed it.
