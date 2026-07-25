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

-- Seam D (newtons_laws_body pulley post + wheel + two rope segments, 2026-07-25).
-- Both rows found by the seam's own numeric verification, not by a live failure.
INSERT INTO engine_bug_queue (
    bug_class, title, severity, owner_cluster, root_cause, prevention_rule,
    probe_type, probe_logic, status, concepts_affected, fixed_in_files,
    discovered_in_session, row_type
) VALUES (
    'field3d_drawn_string_geometry_not_proved_against_the_constraint_the_integrator_enforces',
    'A rope/string drawn from a free-chosen anchor silently contradicts the inextensible-string constraint its own integrator enforces',
    'MAJOR',
    'peter_parker:renderer_primitives',
    'A coupled integrator enforces exactly two things about an ideal string: total length is CONSTANT as the bodies move, and tension acts along each body''s own axis. Rope geometry, being pure presentation, is normally authored by eye — a post height, an anchor point, two line segments — and every one of those choices is free. Two independent ways to get it wrong: (a) if the wheel/anchor height is not exactly one rim radius above the body-centre height, the along-surface segment is drawn at an ANGLE to the surface while the physics resolves tension along the surface, so the picture teaches a decomposition the equations do not use; (b) if either segment''s endpoint is not the true rim tangent point, the drawn length sum drifts as the bodies move, i.e. the visible string stretches while the integrator asserts it cannot. Both look plausible in a screenshot and neither is detectable by THE EYE, which sees one frame at a time and has no notion of a length invariant.',
    'Derive the asset''s geometry FROM the constraint instead of choosing it: pin the wheel-centre offset so the along-surface segment is tangent at exactly body-centre height (parallel by construction at every theta, no special case), take both hanging anchors as the true vertical rim tangent points (hub.x +/- R, opposite sides so two hanging bodies cannot share one point), and then PROVE it numerically in a scratchpad — sweep the string coordinate and assert len(seg_a) + len(seg_b) + wrap is constant to 1e-9 for every branch the integrator has (both-hanging and surface-plus-hanging), plus assert the along-surface segment is perpendicular to the surface normal to 1e-12. Re-fit segments by TRANSFORM (position + quaternion + scale along the segment axis) behind an endpoint churn-guard, never by rebuilding geometry per frame, so a frozen pin writes nothing.',
    'js_eval',
    'Sweep the shared string coordinate q across its full range; at each q compute the drawn length of every rope segment plus the constant wrap arc and assert (max - min) < 1e-9. Separately assert, at theta = 0, +30 and -20 deg: each segment endpoint lies exactly on the wheel rim (|end - hub| == R), the along-surface segment satisfies |dir . surfaceNormal| < 1e-12, the vertical segment satisfies |dir . horizontal| < 1e-12, and each body-side endpoint coincides with that body''s live face position to 1e-12.',
    'OPEN',
    ARRAY['newtons_laws_body scenario: connected_bodies']::text[],
    ARRAY['src/lib/renderers/field_3d_renderer.ts']::text[],
    '2026-07-25 lom chapter loop — seam D',
    'probe_definition'
);

INSERT INTO engine_bug_queue (
    bug_class, title, severity, owner_cluster, root_cause, prevention_rule,
    probe_type, probe_logic, status, concepts_affected, fixed_in_files,
    discovered_in_session, row_type
) VALUES (
    'field3d_motion_bound_derived_from_old_apparatus_lets_body_stand_inside_new_mesh',
    'A travel bound expressed in the apparatus that existed when it was written lets a body clamp INSIDE a mesh added by a later seam',
    'MODERATE',
    'peter_parker:renderer_primitives',
    'newtons_laws_body bounded a surface body at +/- surface.length_m — correct while the surface end was the only thing there. A later seam stood the pulley POST on the surface at post_position_m, whose default IS surface.length_m, so the block''s up-slope clamp position is exactly the post''s base: the block comes to rest with the post passing through its own centre, and (because the clamp is where the coupled system spends the rest of the state) that is the frame a reveal pin is most likely to capture. The same shape bit the hanging side: its "cannot climb through the pulley" bound was a provisional 0.2 m chosen when no wheel existed, which lets the cube swallow the wheel it hangs from.',
    'When a seam introduces apparatus into an existing scenario, re-derive EVERY motion bound from the apparatus that now physically stops the body, in the same commit — a bound is geometry, not physics, and leaving it expressed in the old geometry is the defect. Express each bound as a constant derived from the new asset (block half-width + post radius; rim radius + body half-height) so it cannot drift out of sync again, keep the change to the bound alone so the checksummed equations are untouched, and assert in a scratchpad that at each bound the two meshes touch without interpenetrating and that every dependent segment is still drawn (a bound that lands where a rope length reaches zero would silently hide the string).',
    'js_eval',
    'For each scenario body, evaluate its bound function at both limits, place the body there, and assert the axis-aligned separation between that body and every other visible mesh sharing its plane is >= 0 (touching, never overlapping); also assert every dependent segment length at those limits is > its own hide threshold.',
    'OPEN',
    ARRAY['newtons_laws_body scenario: connected_bodies, block_on_incline']::text[],
    ARRAY['src/lib/renderers/field_3d_renderer.ts']::text[],
    '2026-07-25 lom chapter loop — seam D',
    'incident'
);

-- Seam E (newtons_laws_body explorer surface: #nlb_sliders rows, PARAM_UPDATE
-- emitters, trusted-drag proxies, Rule 37 idle_auto_sweep; 2026-07-25).
-- Both rows found by the seam's own pre-flight reading of the shared helpers it
-- had to reuse, not by a live failure.
INSERT INTO engine_bug_queue (
    bug_class, title, severity, owner_cluster, root_cause, prevention_rule,
    probe_type, probe_logic, status, concepts_affected, fixed_in_files,
    discovered_in_session, row_type
) VALUES (
    'field3d_invisible_pick_proxy_in_the_glow_index_is_painted_opaque_by_the_emphasis_pass',
    'A zero-opacity drag proxy registered for glow gets an opacity written by BOTH emphasis branches, painting a solid ball over the very object it exists to pick',
    'MAJOR',
    'peter_parker:renderer_primitives',
    'applyGlowEmphasis writes opacity in BOTH of its non-idle branches unless brightenOnly is set — the focal branch forces opacity 1.0, the dim-peer branch forces GLOW_DIM_OPACITY — and _glowEachMat TRAVERSES children, so parenting the proxy to a rendered mesh is not an escape either. An invisible pointer-pick proxy is deliberately built with material opacity 0 and mesh.visible = false, because the raycaster skips visible:false; it must therefore be switched visible:true in exactly the state that makes its object draggable, which is also the state most likely to name that object as glow_focal. The two facts compose into a sphere the size of the pick target rendered at full opacity over the teaching subject — and only in the explore/sandbox state, the one state THE EYE''s frozen guided reveal pins never cover and the one state a mocked node driver cannot fire a trusted drag in.',
    'A pick proxy is geometry for the POINTER, never ink. Give it its OWN elementType and exclude that elementType from the scenario''s glow applier with one explicit early-out — an EXCLUSION, not a second emphasis channel, so Rule 32e is untouched — and keep it out of any rendered mesh''s child tree so the material traversal cannot reach it from its parent. Carry the proxy by writing its position inside the single funnel every body move already goes through (the scenario''s setPosition helper), so it needs no per-frame follow hook and therefore introduces no clock code (Rule 36). Never rely on visible:false alone: the pickability gate is exactly the thing that turns visibility on.',
    'js_eval',
    'For every registered scenario object whose elementType names a pick proxy: run the scenario''s glow applier twice — once with that proxy''s own body id as glow_focal, once with a different focal — and after each assert material.opacity === 0 and material.transparent === true. Separately assert the proxy''s .visible is true only in states whose config sets the scenario''s trusted-drag flag and whose body is present and non-ghost, and assert no rendered mesh has a pick proxy in its child tree.',
    'OPEN',
    ARRAY['newtons_laws_body scenario: every concept authoring a trusted_drag_seizes sandbox state']::text[],
    ARRAY['src/lib/renderers/field_3d_renderer.ts']::text[],
    '2026-07-25 lom chapter loop — seam E',
    'incident'
);

INSERT INTO engine_bug_queue (
    bug_class, title, severity, owner_cluster, root_cause, prevention_rule,
    probe_type, probe_logic, status, concepts_affected, fixed_in_files,
    discovered_in_session, row_type
) VALUES (
    'field3d_per_state_slider_rows_collapsed_in_a_bottom_anchored_panel_make_shared_rows_jump',
    'display:none on a per-state slider row inside a bottom-anchored panel re-flows every remaining row, so a slider shared across states silently moves',
    'MODERATE',
    'peter_parker:renderer_primitives',
    'Rule 31 builds the contextual control panel ONCE and shows/hides rows per state, and the obvious hide is display:none. The field_3d convention anchors that panel by its BOTTOM edge (bottom:12px right:12px, so it grows upward and cannot collide with the value-only HUD at top:52px — Rule 34d). Removing a row from layout in a bottom-anchored box therefore slides every row ABOVE it downward: a slider exposed in state 3 and again in state 5 sits at a different screen y in each, so at the state click the control the teacher is reaching for jumps. That is exactly what Rule 32d forbids ("a shared slider keeps the same screen position"), and it is invisible to a per-state screenshot diff because every individual frame is internally correct — only the transition is wrong.',
    'Hide a per-state control row with visibility:hidden, which KEEPS its layout slot, and additionally set its input .disabled so a reserved slot is never tab- or keyboard-reachable; never display:none it. Scope the reserved slots to the CONCEPT rather than to the engine''s whole token vocabulary: build a row only for a token some state of THIS concept actually names (the same union-over-every-state trick the scenario already uses to build its body meshes once), so a one-slider concept gets a one-row panel with no blank filler, while the explore state — which by Rule 31 exposes every control the concept has — is exactly the full panel with nothing left to grow into. Sync every BUILT row''s thumb and numeric readout FROM the engine record on state entry, so a state entered after a trusted drag or an idle sweep shows its own authored value and not the seized one.',
    'js_eval',
    'For every pair of states that both name the same control token, apply each state and assert the row node''s getBoundingClientRect().top is identical to the pixel. Assert no row node ever carries display:none while the panel is shown, that every row whose token is absent from the live state''s controls_visible has visibility hidden AND its input disabled, and that each visible row''s readout text equals the value the state authored for that param immediately after the state is applied.',
    'OPEN',
    ARRAY['newtons_laws_body scenario: all six Laws of Motion concepts']::text[],
    ARRAY['src/lib/renderers/field_3d_renderer.ts']::text[],
    '2026-07-25 lom chapter loop — seam E',
    'directive'
);

-- ============================================================
-- SEAM F (deriveStateMeta reveal-pin + hold classification) — founder review, NOT applied
-- ============================================================

-- Candidate — MAJOR. The engine spec listed exactly TWO deriveStateMeta sites
-- (reveal-ms block, hold classification) and called them sufficient ("Both 12
-- and 13 are REQUIRED or THE EYE false-fails"). There is a THIRD mandatory site
-- in the same file — the F3D_REVEAL_KEYS scenario-key registry — and missing it
-- silently routes a field_3d state down the PCPL derivation path.
INSERT INTO engine_bug_queue (
    bug_class, title, severity, owner_cluster, root_cause, prevention_rule,
    probe_type, probe_logic, status, concepts_affected, fixed_in_files,
    discovered_in_session, row_type
) VALUES (
    'derivestatemeta_new_scenario_key_absent_from_f3d_reveal_keys_falls_through_to_pcpl',
    'A new field_3d scenario key missing from F3D_REVEAL_KEYS makes a cached physics_config derive PCPL reveal pins and PCPL hold classes',
    'MAJOR',
    'peter_parker:renderer_primitives',
    'deriveStateMeta resolves field_3d states from EITHER the concept JSON (config.field_3d_config.states) OR a cached physics_config that already flattened field_3d_config to the top level. The second path is recognised ONLY by hasField3dTiming(), which tests whether a state object carries one of the hardcoded F3D_REVEAL_KEYS scenario keys. THE EYE reads the CACHED row, so a new scenario whose per-state config key is not in that list resolves as NOT field_3d: resolveField3dStates returns null, deriveMaxRevealTimeMs falls through to the PCPL branch (pcplRevealMs/pcplSceneRevealMs, structurally 0 on any Rule-31 concept => DEFAULT_REVEAL_MS 1500 for every state), and deriveHoldExpectations classifies via isPcplInteractive instead of the scenario''s own mode. Both new per-scenario blocks are then dead code on the exact path that matters, and the frozen pin lands at 1500 ms mid-script — the same self-contradictory baseline the missing-maxReveal scar describes, but with both required sites correctly implemented.',
    'A new field_3d scenario_type touches THREE sites in deriveStateMeta.ts, not two: (1) append its per-state config key to F3D_REVEAL_KEYS, (2) add its reveal-ms block in maxRevealForField3dState, (3) add its hold classification in deriveHoldExpectations. Prove site 1 by deriving against the FLATTENED shape ({ scenario_type, states }) as well as the concept-JSON shape and asserting both give identical per-state reveal ms and hold classes.',
    'js_eval',
    'Build a minimal config in both shapes — { field_3d_config: { scenario_type, states } } and the flattened { scenario_type, states } — with one state whose reveal pin is provably not DEFAULT_REVEAL_MS. Assert deriveMaxRevealTimeMs and deriveHoldExpectations return byte-identical maps for the two shapes, and that the pinned state is not 1500.',
    'OPEN',
    ARRAY['newtons_laws_body scenario: all six Laws of Motion concepts']::text[],
    ARRAY['src/lib/validators/visual/deriveStateMeta.ts']::text[],
    '2026-07-25 lom chapter loop — seam F',
    'directive'
);
