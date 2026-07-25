-- Laws of Motion chapter loop — engine scar CANDIDATES.
-- NOT APPLIED. No agent executes these; the founder reviews and applies.
-- Upsert key is bug_class: a recurrence UPDATEs/reopens its row, never a duplicate INSERT.
-- Columns are the 13 authored columns of the 16-col engine_bug_queue schema.

-- Seam A (newtons_laws_body build, 2026-07-25) — found while defending against it, not by a live failure.
INSERT INTO engine_bug_queue (
    bug_class, title, severity, owner_cluster, root_cause, prevention_rule,
    probe_type, probe_logic, status, concepts_affected, fixed_in_files,
    discovered_in_session, row_type
) VALUES (
    'field3d_generic_visible_elements_matcher_blanks_new_scenario_apparatus',
    'Generic visible_elements matcher runs BEFORE the per-scenario apply and silently hides a new scenario''s apparatus',
    'MAJOR',
    'peter_parker:renderer_primitives',
    'In field_3d applyState() the generic visibility pass (obj.visible = any visible_elements token substring-matches elementType/id) runs EARLIER in the function than every per-scenario applyXState() call. Any top-level object a new scenario registers through addToScene() is therefore hidden on any state whose authored visible_elements list does not happen to name it — and a per-scenario apply that only toggles its DYNAMIC elements (bodies, arrows) never restores the static apparatus (surface/ground/post). The result is a partially blank scene that still passes every value-level probe.',
    'A new scenario_type either (a) registers its objects ONLY in its own private id index (never addToScene) so the generic matcher cannot reach them, or (b) forces its apparatus objects visible inside its own applyXState(), which runs later and is authoritative. Assert EXISTENCE + visibility of the apparatus (mesh count > 0 AND visible === true) in the bring-up probe, never just the dynamic elements.',
    'js_eval',
    'For each top-level scene object whose elementType starts with the scenario prefix, assert obj.visible === true after SET_STATE for every state that is not authored to hide it; fail if a state''s visible_elements list is non-empty and the apparatus group went invisible.',
    'OPEN',
    ARRAY['free_body_diagram','connected_bodies','block_on_incline']::text[],
    ARRAY['src/lib/renderers/field_3d_renderer.ts']::text[],
    'lom-a Phase 0 seam A (newtons_laws_body engine build) 2026-07-25',
    'directive'
);

-- ============================================================
-- SEAM B (integrator) — founder review, NOT applied
-- ============================================================

-- Candidate 2 — MAJOR. Spec asserted Rule-36 fold-exactness while prescribing
-- s += v_new*dt, whose folded-position error is 1.5*a*N*(N-1)*h^2
-- (measured 2.3 mm at 120 Hz for a = 3 m/s^2). Engine ships
-- s += 0.5*(v_old+v_new)*dt instead, which folds exactly (delta = 0).
-- Prevention: a new integrator's dt-fold test must compare POSITION as well
-- as velocity at 1e-9, not velocity alone.
INSERT INTO engine_bug_queue (
    bug_class, title, severity, owner_cluster, root_cause, prevention_rule,
    probe_type, probe_logic, status, concepts_affected, fixed_in_files,
    discovered_in_session, row_type
) VALUES (
    'spec_semi_implicit_euler_position_not_step_count_invariant',
    'A spec can assert Rule-36 fold-exactness while prescribing a position update that is not step-count invariant',
    'MAJOR',
    'peter_parker:renderer_primitives',
    'Rule 36 requires an integrator to be linear in dt so that folding N micro-steps of h into one dtStep = N*h is EXACT. Velocity under semi-implicit Euler (v += a*dt) satisfies this. The position update s += v_new*dt does NOT: three steps of h give s0 + 3h*v0 + 6*a*h^2 while one step of 3h gives s0 + 3h*v0 + 9*a*h^2. The newtons_laws_body spec prescribed the literal s += v_new*dt while asserting fold-exactness twice in the same section. Measured divergence: 2.304e-3 m for a 6 N / 2 kg case at 120 Hz. The defect is invisible at 60 Hz in dev and only surfaces on high-refresh classroom hardware, exactly the Rule 36 failure mode.',
    'Any new integrator''s dt-fold test must compare POSITION as well as velocity at 1e-9 — velocity alone passes while position drifts. The position update must be the trapezoid form s += 0.5*(v_old + v_new)*dt (equivalently v*dt + 0.5*a*dt^2), which is fold-exact and is the exact kinematic result for constant a. Velocity, the static-stick test, the friction sign logic and the zero-clamp are unchanged.',
    'js_eval',
    'For a constant-force case, step the engine once with dt = 3h and separately three times with dt = h from identical initial conditions; assert |v_a - v_b| < 1e-9 AND |s_a - s_b| < 1e-9.',
    'OPEN',
    ARRAY['newtons_laws_body scenario: free_body_diagram, block_on_incline, connected_bodies']::text[],
    ARRAY['src/lib/renderers/field_3d_renderer.ts']::text[],
    'lom-a Phase 0 seam B (newtons_laws_body integrator) 2026-07-25',
    'directive'
);

-- Candidate 3 — MODERATE. A per-body SIGNED axis whose gravity term is written
-- in the opposite axis passes visual inspection on every flat-ground state and
-- only breaks on the one coupled concept. Spec said theta_i = hanging ? 90,
-- which makes a free hanging body accelerate UPWARD and fails both of the
-- spec's own checksums. Prevention: execute every physics_block checksum
-- against the renderer's own formulas before closing a seam.
INSERT INTO engine_bug_queue (
    bug_class, title, severity, owner_cluster, root_cause, prevention_rule,
    probe_type, probe_logic, status, concepts_affected, fixed_in_files,
    discovered_in_session, row_type
) VALUES (
    'field3d_hanging_body_gravity_sign_inverted_vs_own_axis',
    'A per-body signed axis whose gravity term is written in the OPPOSITE axis passes every flat-ground state and only breaks the one coupled concept',
    'MODERATE',
    'peter_parker:renderer_primitives',
    'newtons_laws_body gives each body a signed coordinate s along its OWN positive axis: up-slope for a surface body, DOWNWARD for a hanging body. The spec expressed the hanging case as theta_i = 90 inside the shared drive term F - m*g*sin(theta_i), which yields -m*g — gravity in the wrong direction for an axis that already points down. Taken literally it makes a free hanging body accelerate UPWARD and it fails both of the spec''s own checksums (Atwood returns T = m(g+a) instead of m(g-a); incline-plus-hanging returns a of the wrong sign). Every one of the five non-hanging concepts is unaffected, so nothing catches it until the single coupled concept is built.',
    'Compute gravity in the body''s own axis (hanging => +m*g, equivalently theta_i = -90 deg) rather than reusing a shared theta. Derive the coupled sign factor c_i from the inextensible-string constraint (sum of dL = 0) rather than hardcoding a pair. Compute tension from the body''s own equation of motion T_i = m_i*a_i - drive_i - f_i, which yields equal tension magnitudes on both bodies in every case; the spec''s literal form does not. The general prevention: EXECUTE every checksum in a physics block against the renderer''s own formulas numerically before closing a seam — do not eyeball the algebra.',
    'js_eval',
    'Run every closed-form checksum the spec declares against the live engine: Atwood a = (m1-m2)*g/(m1+m2) and T = m2*(g+a) = m1*(g-a); incline+hanging a = (m_hang*g - m_inc*g*sin(theta) - mu_k*m_inc*g*cos(theta))/(m1+m2). Assert agreement to 1e-9 AND assert |T| is equal on both bodies (the ideal-string consistency check the sign error breaks).',
    'OPEN',
    ARRAY['newtons_laws_body scenario: connected_bodies']::text[],
    ARRAY['src/lib/renderers/field_3d_renderer.ts']::text[],
    'lom-a Phase 0 seam B (newtons_laws_body integrator) 2026-07-25',
    'directive'
);

-- Seam C (newtons_laws_body force-arrow overlay, 2026-07-25). Found by an
-- exhaustive numeric sweep of the label layout, NOT by a live failure: the
-- hand-designed lane scheme "looked" collision-free at every theta I spot-checked
-- and still had a 0.016-world-unit worst case.
INSERT INTO engine_bug_queue (
    bug_class, title, severity, owner_cluster, root_cause, prevention_rule,
    probe_type, probe_logic, status, concepts_affected, fixed_in_files,
    discovered_in_session, row_type
) VALUES (
    'field3d_static_label_lanes_collide_when_label_distance_scales_with_an_authored_param',
    'A static overlay-label lane layout cannot be proved collision-free once a label sits at the TIP of a magnitude-scaled vector',
    'MODERATE',
    'peter_parker:renderer_primitives',
    'Rule 29 licenses a force/field arrow whose LENGTH tracks its real magnitude, and the natural place for its label is just past the tip. That makes the label position a function of an AUTHORED parameter (mass, applied force, theta), so as a slider or a per-state value changes the label SWEEPS across the whole overlay region and in turn passes through every other label''s fixed lane. A hand-designed set of perpendicular lanes therefore only proves separation for the magnitudes the author happened to test: an exhaustive theta -60..60 x sign x mass sweep of the newtons_laws_body six-arrow layout found worst-case label gaps of 0.016 world units (weight vs mg-cos-theta, and weight vs tension) where every spot-checked configuration had shown >= 0.31.',
    'Any overlay whose label anchors to a magnitude-scaled position gets a DETERMINISTIC de-collision pass, not just a lane scheme: after all of one group''s labels are placed, walk them in a FIXED order and push any label that lands within a minimum separation of an already-placed one further out ALONG ITS OWN vector (so it still reads as that vector''s label), bounded tries. Fixed order + pure inputs keeps it deterministic, so SET_TIME_FREEZE frames stay byte-stable. Verify with an EXHAUSTIVE parameter sweep in a scratchpad, never with spot checks: THE EYE cannot see a collision that only appears at one mass value, and founder_drive''s DOM collision probe is blind to 3D sprite labels entirely.',
    'js_eval',
    'For each rendered group, collect the world positions of every VISIBLE label sprite and assert the minimum pairwise distance >= the label glyph height, sweeping every authored slider across its full declared range (not just its default).',
    'OPEN',
    ARRAY['newtons_laws_body scenario: free_body_diagram, block_on_incline, connected_bodies']::text[],
    ARRAY['src/lib/renderers/field_3d_renderer.ts']::text[],
    '2026-07-25 lom chapter loop — seam C',
    'incident'
);
