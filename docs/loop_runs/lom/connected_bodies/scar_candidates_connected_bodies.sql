-- ============================================================================
-- connected_bodies (Laws of Motion #2), lom-a chapter loop, 2026-07-25/26.
-- TEXT ONLY - NOT APPLIED. Founder reviews before any DB write.
-- Three FIXED incidents (commits 5a07aa9, bc649d4, aa7daf5) + two OPEN carries.
-- Full narrative: docs/loop_runs/lom/connected_bodies/engine_gap.md
-- ============================================================================

-- FIXED 5a07aa9 -- seed the constraint, not its projections.
INSERT INTO engine_bug_queue (
    bug_class, title, severity, owner_cluster, root_cause, prevention_rule,
    probe_type, probe_logic, status, concepts_affected, fixed_in_files,
    discovered_in_session, row_type
) VALUES (
    'nlb_coupled_initial_velocity_never_seeded',
    'A coupled (pulley) state derives every body v from ONE shared string scalar, so an authored initial_velocity_mps is discarded on the first tick - and the string all-or-nothing bounds veto then zeroes the seed whenever any body starts outside its own clamp band',
    'CRITICAL',
    'peter_parker:field3d_surgeon',
    'Two defects on the SAME state-entry seeding path, each individually sufficient to kill the motion. (1) applyNewtonsLawsBodyState seeded the per-body b.v from initial_velocity_mps, but Branch B integrates ONE scalar q along the string and overwrites b.v = c_i*q every tick from eng.v_string, which was hardcoded to 0 - so the authored v0 never reached the integrator. (2) Branch B bounds the STRING, not the bodies: if ANY body next position would leave its band the whole step is vetoed (sAdv = 0, v_string = 0). A hanging body authored with no initial_position_m starts at s = 0, BELOW the pulley-clearance bound NLB_HANG_MIN_M = 1.15 m, so frame 1 vetoed unconditionally and zeroed any seed. connected_bodies STATE_1/STATE_2 authored 0.35 m/s constant-velocity glides (a = 0 by design, so nothing could restart them): byte-identical frames from t = 0 to t = 15000 ms with both v readouts at 0.00 while the captions taught "both bodies share one speed". Branch A seeded v0 correctly and hid the class.',
    'A scenario whose per-body state is DERIVED from a shared constraint scalar must seed that scalar from the authored initial conditions on state entry AND on RESET_TRAJECTORY - seeding the derived per-body field is a no-op. Seed the constraint, not its projections. Corollary: any all-or-nothing constraint veto must be preceded by clamping every authored seed inside its own valid band on entry. Never accept "the gates passed" as evidence a state moves: for any state whose taught motion is a constant-velocity glide (a = 0), compare the first and last dense frames byte-wise.',
    'js_eval',
    'For every field_3d state declaring a pulley/coupled block: SET_STATE, then assert (a) PM_nlbEngine.v_string equals c_i * the authored initial_velocity_mps of the first non-ghost body carrying one, (b) every non-ghost body s lies inside nlbBoundsM at t = 0, (c) after 3 s of pinned sim time each body |s - s0| >= 0.9 * |v0| * 3 whenever v0 != 0. Independently assert such a state dense series is not byte-identical between first and last sample.',
    'FIXED',
    ARRAY['connected_bodies']::text[],
    ARRAY['src/lib/renderers/field_3d_renderer.ts']::text[],
    'lom-a chapter loop - connected_bodies engine dispatch 2026-07-25',
    'incident'
);

-- FIXED bc649d4 -- a geometry veto must zero motion, never the force solution.
INSERT INTO engine_bug_queue (
    bug_class, title, severity, owner_cluster, root_cause, prevention_rule,
    probe_type, probe_logic, status, concepts_affected, fixed_in_files,
    discovered_in_session, row_type
) VALUES (
    'nlb_coupled_readouts_revert_to_rest_values_on_bound_halt',
    'A finite-track halt zeroed the coupled solution, so the HUD/arrows reverted to the rest-state answer - printing the exact misconception the state exists to break for ~95% of its runtime',
    'CRITICAL',
    'peter_parker:field3d_surgeon',
    'newtons_laws_body Branch B bounds the STRING, not each body: if any body next position would leave its band the whole step is vetoed. That veto set sAdv = 0, vs1 = 0 AND aStr = 0. The first two are correct (the body must not leave its rail); the third is not - no force changed, only the track ran out. With aStr = 0 the per-body writeback collapsed to a = 0, F_net = 0 and T = -drive, i.e. the hanging body tension became exactly m2*g. connected_bodies STATE_3 (the concept PRIMARY aha, "T is not m2g") ran 1.11 s at the correct a = 3.27 / T = 13.07 N and then displayed T = 19.60 N = m2*g for the remaining ~19 s of a 20 s state, including the frozen frame a teacher lands on and the H2 baseline that frame would mint. STATE_6 (Atwood) fell back to P.T = 20.58 / Q.T = 19.60 - the two separate weights - instead of the one shared 20.08 N. The body stopping is a known finite-track gap and is NOT the defect.',
    'A veto that exists to keep an object inside its geometry must zero MOTION ONLY (position advance + velocity), never the force/acceleration solution the readouts, arrows and taught claim are drawn from - an out-of-rail artifact must not be presented as a change in the physics. Prefer holding the achieved solution by RECOMPUTE from live inputs over a latched snapshot: a snapshot goes stale on any slider drag and adds history a time-pin/RESET_TRAJECTORY must rewind. Corollary for reviewers: judge a dynamics HUD LATE in the state, not only during its motion burst.',
    'js_eval',
    'For each coupled state, sample the engine record at t = 1 s (mid-motion) and again well after the bound halt (v_string == 0), and assert every body a, T and F_net are unchanged between the two samples to within 1e-9. Independently assert the post-halt hanging-body |T| != m*g whenever |a| > 0. Then post a slider input on a halted state and assert the readouts CHANGE, proving the hold is a recompute and not a stale latch.',
    'FIXED',
    ARRAY['connected_bodies']::text[],
    ARRAY['src/lib/renderers/field_3d_renderer.ts']::text[],
    'lom-a connected_bodies engine dispatch 2026-07-25',
    'incident'
);

-- FIXED aa7daf5 -- effective visibility is the AND over the ancestor chain.
INSERT INTO engine_bug_queue (
    bug_class, title, severity, owner_cluster, root_cause, prevention_rule,
    probe_type, probe_logic, status, concepts_affected, fixed_in_files,
    discovered_in_session, row_type
) VALUES (
    'field3d_hide_flag_applied_to_a_group_that_also_parents_unrelated_apparatus',
    'An authored hide flag applied to a scene GROUP takes every co-parented sibling down with it - the Atwood pulley vanished with the surface slab',
    'MAJOR',
    'peter_parker:field3d_surgeon',
    'newtons_laws_body parents the pulley bracket to the SURFACE group (deliberately: the one theta rotation then stands the post on the incline at every angle with no branch). The later surface.hidden feature was implemented as o.visible = !surface.hidden on that same group, so a connected_atwood state - the ONE state that authors surface.hidden - hid the slab AND the bracket. Both ropes terminated in open space, and the state declared Rule-32e glow_focal (nlb_pulley_wheel) did not exist on screen. Every value-level probe passed: the meshes were built, registered, positioned, glow-aliased and marked visible by nlbShowPulley - only an ancestor was invisible, which no per-object visible check can see.',
    'A hide flag authored against a NAMED apparatus part is applied to that part own MESH, never to a group, unless the group is provably a pure wrapper for that one part. Before writing o.visible on any THREE.Group, enumerate its children and confirm every one of them is meant to disappear together. Corollary for probes: an element effective visibility is the AND over its ancestor chain - assert the world-visible predicate (walk parents to the scene root), never obj.visible alone.',
    'js_eval',
    'For every scenario element named by a state glow_focal or visible_elements, walk obj.parent to the scene root and assert every ancestor has visible === true; fail if the object own visible is true but an ancestor is false (silently invisible focal).',
    'FIXED',
    ARRAY['connected_bodies']::text[],
    ARRAY['src/lib/renderers/field_3d_renderer.ts']::text[],
    'lom-a chapter loop cycle 1 (connected_bodies STATE_6 Atwood) 2026-07-26',
    'incident'
);

-- OPEN carry 1 of 2 -- shipped unfixed; the runaway guard closed the door on a 4th engine commit.
-- Found ANALYTICALLY by physics-author before it was ever observed, then confirmed live.
INSERT INTO engine_bug_queue (
    bug_class, title, severity, owner_cluster, root_cause, prevention_rule,
    probe_type, probe_logic, status, concepts_affected, fixed_in_files,
    discovered_in_session, row_type
) VALUES (
    'nlb_coupled_sandbox_F_slider_exceeds_string_tautness_bound',
    'The shared F slider can drive a coupled state past a > g, where a real string would go slack - the rigid model keeps solving and reports a magnitude-masked impossible tension',
    'MEDIUM',
    'peter_parker:field3d_surgeon',
    'T > 0 requires a < g. For incline+hanging the threshold is F < m1*g*(1 + sin(theta) + mu_k*cos(theta)); over the engine SHARED, non-per-concept-authorable slider ranges (m1 in [0.5,10], theta in [0,60], mu_k in [0,1]) the worst case is m1 = 0.5, theta = 0, mu_k = 0 giving 4.9 N - while the F slider runs to +/-20 N. Probed live on connected_bodies STATE_7: a = 15.06 > g with |T| = 10.51, signed tensions inconsistent. The model has no slack-rope representation, so it keeps solving the rigid coupled equations. NOT JSON-fixable: the slider range is the engine shared panel. connected_bodies is the first concept to both couple two bodies AND expose F in its sandbox.',
    'Where a model has a validity bound that authored slider ranges can cross, the engine must either clamp at the bound with an honest visual (rope goes slack) or narrow the exposed range - a teacher-facing sandbox must not be able to reach a state the model cannot represent. Derive the bound analytically over the FULL cross-product of shared slider ranges, not just the concept default values.',
    'js_eval',
    'For every coupled state exposing F: drive m to its minimum, mu_k to 0, theta to 0 and F to its maximum, then assert |a| < g and the signed tension of every body is >= 0. Fail if either holds false.',
    'OPEN',
    ARRAY['connected_bodies']::text[],
    ARRAY[]::text[],
    'lom-a connected_bodies cycle 2 - carried unfixed at runaway guard 2026-07-26',
    'incident'
);

-- OPEN carry 2 of 2 -- Rule 34d, LOW. Note the related content workaround.
INSERT INTO engine_bug_queue (
    bug_class, title, severity, owner_cluster, root_cause, prevention_rule,
    probe_type, probe_logic, status, concepts_affected, fixed_in_files,
    discovered_in_session, row_type
) VALUES (
    'nlb_formula_and_readout_zones_are_fixed_css_and_collide_with_a_tall_hud',
    'The formula surface and the body HUD are hardcoded CSS zones with no per-state override, so a 5-readout sandbox HUD collides with the formula and bleeds into the slider panel',
    'LOW',
    'peter_parker:field3d_surgeon',
    'newtons_laws_body fixes #nlb_formula at top:42%;right:22px and #nlb_readout at top:52px;right:12px with no per-state positional field in the interface. They collide once a body HUD grows past ~4 lines, which happens on connected_bodies STATE_7 (7 controls, 5 readouts per body). Because json_author had no positional lever, that state formula_overlay was REMOVED entirely to clear the worse collision - a content workaround for an engine-surface limit, accepted by both reviewers for a sandbox but not a durable fix. A milder residual remains: the m2 HUD block bleeds into the slider row below.',
    'Overlay zones that can grow with authored content (a per-body readout stack) must be sized or positioned off the ACTUAL rendered height of their neighbours, not hardcoded - or expose a per-state positional override so authoring can resolve a collision without deleting content. Rule 34d.',
    'dom_probe',
    'For every state, getBoundingClientRect() on #nlb_formula, #nlb_readout and the slider panel, and assert no pair of rects intersects.',
    'OPEN',
    ARRAY['connected_bodies']::text[],
    ARRAY[]::text[],
    'lom-a connected_bodies cycle 2 - carried unfixed at runaway guard 2026-07-26',
    'incident'
);

-- COSMETIC, no row proposed (founder judgment): with surface.hidden the Atwood pulley POST BASE
-- floats in open space - it mounts to nothing. That layer never rendered before aa7daf5, so it had
-- never been reviewed. eye-walker reads it as standard textbook Atwood-diagram convention;
-- quality-auditor calls it "looks slightly unfinished, not wrong". Both cleared it to ship.
