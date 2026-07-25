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
INSERT INTO engine_bug_queue (bug_class, severity, owner_cluster, row_type, probe_type, status, notes)
VALUES ('spec_semi_implicit_euler_position_not_step_count_invariant', 'MAJOR',
        'peter_parker:renderer_primitives', 'incident', 'js_eval', 'OPEN',
        'newtons_laws_body seam B, 2026-07-25. Rule 36 fold-exactness requires the trapezoid position update.');

-- Candidate 3 — MODERATE. A per-body SIGNED axis whose gravity term is written
-- in the opposite axis passes visual inspection on every flat-ground state and
-- only breaks on the one coupled concept. Spec said theta_i = hanging ? 90,
-- which makes a free hanging body accelerate UPWARD and fails both of the
-- spec's own checksums. Prevention: execute every physics_block checksum
-- against the renderer's own formulas before closing a seam.
INSERT INTO engine_bug_queue (bug_class, severity, owner_cluster, row_type, probe_type, status, notes)
VALUES ('field3d_hanging_body_gravity_sign_inverted_vs_own_axis', 'MODERATE',
        'peter_parker:renderer_primitives', 'ambiguous', 'js_eval', 'OPEN',
        'newtons_laws_body seam B, 2026-07-25. Caught by running the spec checksums numerically.');
