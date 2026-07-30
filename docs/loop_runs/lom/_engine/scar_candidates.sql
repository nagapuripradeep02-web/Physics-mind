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

-- ============================================================
-- BRING-UP PROOF (spec section 7 step 2) — the two structural extremes driven
-- against the REAL renderer in chromium. Founder review, NOT applied.
-- ============================================================

-- Candidate — MODERATE. FOUND LIVE and FIXED in this session: the hanging body
-- of a connected pair printed "N = 0.00 N" and "fk = 0.00 N" permanently.
INSERT INTO engine_bug_queue (
    bug_class, title, severity, owner_cluster, root_cause, prevention_rule,
    probe_type, probe_logic, status, concepts_affected, fixed_in_files,
    discovered_in_session, row_type
) VALUES (
    'field3d_state_level_readout_enum_prints_zero_stub_rows_for_a_body_the_quantity_cannot_apply_to',
    'A STATE-level readout enum applied to every body prints permanent zero stub rows on the body the quantity is identically zero for',
    'MODERATE',
    'peter_parker:renderer_primitives',
    'newtons_laws_body declares readouts as a per-STATE array of quantity keys, while arrows are declared PER BODY. The HUD builder therefore emitted every declared key against every non-ghost body. A hanging body has N forced to 0 by construction (spec section 1) and consequently f == 0 on every friction path (all of them multiply by N), so the one state of connected_bodies that legitimately reads N and f off the SURFACE block was forced to also print "N = 0.00 N" and "fk = 0.00 N" against the hanging weight, forever. The arrow layer already refuses exactly this ("a real zero force HIDES the arrow, never a stub", spec section 3) — the HUD contradicted its own scenario rule, and the author had no per-body switch to opt out with.',
    'Where a config enum is coarser than the thing it drives (state-level readouts vs per-body physics), the ENGINE must drop the rows that are zero BY CONSTRUCTION rather than expecting the author to avoid the combination — the author cannot, without losing the row on the body that needs it. Skip N and f for a hanging body in the HUD builder, mirroring the arrow layer zero-hides rule. General form: any value-only HUD row whose quantity is identically zero for a given object class must not be built for that class.',
    'js_eval',
    'For every state that declares a readout key which is identically zero for some object class present in that state (N or f on a hanging body), assert no HUD row element exists for that (body, key) pair, and assert every row that DOES exist shows a value that changes across the state clock or is a real non-zero reading.',
    'OPEN',
    ARRAY['newtons_laws_body scenario: connected_bodies']::text[],
    ARRAY['src/lib/renderers/field_3d_renderer.ts']::text[],
    '2026-07-25 lom chapter loop — bring-up proof (free_body_diagram + connected_bodies extremes)',
    'incident'
);

-- Candidate — MAJOR. FOUND LIVE by a fixture that violated a documented
-- contract: the engine mis-rendered SILENTLY, with correct physics.
INSERT INTO engine_bug_queue (
    bug_class, title, severity, owner_cluster, root_cause, prevention_rule,
    probe_type, probe_logic, status, concepts_affected, fixed_in_files,
    discovered_in_session, row_type
) VALUES (
    'field3d_build_once_body_reads_a_per_state_flag_from_the_union_def_and_mis_renders_silently',
    'A build-once mesh whose PARENT and placement branch on a per-state flag read from the union def renders in the wrong place for every state that changes the flag',
    'MAJOR',
    'peter_parker:renderer_primitives',
    'newtons_laws_body builds one mesh per unique body id from the UNION of every state bodies list (Rule 32d home-pose persistence), and at build time it chooses that mesh PARENT GROUP from the body hanging flag — world group for a hanging body, the rotating surface group for a surface body — and the placement helper then branches on mesh.userData.hanging. The flag is authored PER STATE, so a body id that hangs in one state (an Atwood beat) and sits on the surface in another (an incline-plus-hanging beat) keeps the FIRST state parent and placement branch forever: the block is drawn dangling from the pulley while the integrator, which reads the per-state engine record, correctly treats it as a surface body. Every numeric probe passes — position, acceleration, tension, the rope length invariant — because the rope is fitted through the same wrong branch, so the drawn picture is self-consistent and simply wrong. The interface comment documents the constraint (a given id hanging flag must be consistent across states) but nothing enforces or warns.',
    'A per-state flag must never select a build-time parent or a build-time code branch for a build-once mesh. Either (a) build a SEPARATE mesh per (id, flag) combination — the cheap fix, since the author can simply use distinct ids — or (b) refresh the flag on state entry AND re-parent there. Until then the engine must FAIL LOUD: on build, detect a body id appearing with conflicting values of any build-time-consumed flag and post a SIM_ERROR rather than rendering plausibly. Authoring side: give the Atwood pair its own body ids, never reuse the incline block id.',
    'js_eval',
    'At build time, collect for each body id the set of values of every flag consumed at build time (hanging); assert every set has size 1. At runtime, for each state assert each visible body mesh parent group matches its live engine record flag, and assert a hanging body world x equals its pulley rim anchor x while a surface body world position lies on the surface axis.',
    'OPEN',
    ARRAY['newtons_laws_body scenario: connected_bodies']::text[],
    ARRAY['src/lib/renderers/field_3d_renderer.ts']::text[],
    '2026-07-25 lom chapter loop — bring-up proof (free_body_diagram + connected_bodies extremes)',
    'directive'
);

-- Candidate — MODERATE. FOUND IN PIXELS ONLY. The world-space de-collision pass
-- added by seam C is correct in 3D and still collides on screen.
INSERT INTO engine_bug_queue (
    bug_class, title, severity, owner_cluster, root_cause, prevention_rule,
    probe_type, probe_logic, status, concepts_affected, fixed_in_files,
    discovered_in_session, row_type
) VALUES (
    'field3d_world_space_label_decollision_is_projection_blind_and_collides_on_screen',
    'A world-space minimum-separation pass on 3D labels proves nothing about the SCREEN: perspective collapses the separation it just enforced',
    'MODERATE',
    'peter_parker:renderer_primitives',
    'A de-collision pass that pushes overlay labels apart until their WORLD distance exceeds a minimum separation is deterministic and cheap, but the reader sees the PROJECTION. Under the default oblique field_3d camera, two labels separated by more than the enforced world minimum can land within a few screen pixels whenever the separating direction runs close to the view axis — which is exactly what happens to the weight / mg-cos-theta pair on an incline (their tips differ by the incline angle, and the default camera looks along a direction that foreshortens precisely that tilt). Observed on the bring-up fixtures: mg and mg-cos-theta overlap as a single blob, and the body label overlaps the mg-sin-theta label, in states where the world-space pass reports every pair comfortably separated. Neither the mocked node driver nor a value-level probe can see it, and founder_drive DOM collision probe is blind to 3D sprites entirely.',
    'A label layout for a 3D scene is only proved once the assertion is made in SCREEN space: project every visible label with the state live camera and assert the pairwise screen-space gap exceeds the rendered glyph box, for every camera the concept authors. Corollary for authoring: every state of a 3D mechanics scenario MUST author its own camera_position (a near side-on view for a free-body diagram) — the shared default camera is an oblique three-quarter view chosen for field/flux scenarios and it foreshortens exactly the angles a force decomposition exists to show.',
    'js_eval',
    'For each state, project every visible label sprite through the live camera to normalized device coordinates, convert to pixels at the capture viewport, and assert the minimum pairwise axis-aligned gap between label bounding boxes is >= 4 px; repeat for each authored camera_position.',
    'OPEN',
    ARRAY['newtons_laws_body scenario: free_body_diagram, block_on_incline, connected_bodies']::text[],
    ARRAY['src/lib/renderers/field_3d_renderer.ts']::text[],
    '2026-07-25 lom chapter loop — bring-up proof (free_body_diagram + connected_bodies extremes)',
    'incident'
);

-- Candidate — MODERATE. FOUND IN PIXELS ONLY. Rule 34d overlay collision.
INSERT INTO engine_bug_queue (
    bug_class, title, severity, owner_cluster, root_cause, prevention_rule,
    probe_type, probe_logic, status, concepts_affected, fixed_in_files,
    discovered_in_session, row_type
) VALUES (
    'field3d_edge_anchored_formula_surface_wraps_back_over_the_apparatus_for_a_long_equation',
    'An edge-anchored single formula surface with no width bound wraps back across the scene the moment the authored equation is long',
    'MODERATE',
    'peter_parker:renderer_primitives',
    'Rule 34b gives each state ONE dedicated formula overlay, and the field_3d convention anchors it to a screen edge so it occupies a zone distinct from the HUD and the slider panel (Rule 34d). With no max-width and no reserved zone, the element box simply grows toward the middle of the canvas: a short equation sits harmlessly in the margin while a long one — a = (m2*g - m1*g*sin(theta) - mu_k*m1*g*cos(theta)) / (m1 + m2), which is the CENTRAL equation of the connected-bodies concept — wraps to two lines and runs straight through the pulley wheel and post. The zone is only distinct for the equation the engine author happened to test with, and the failure is invisible to every value-level probe: the overlay text is correct, the meshes are correct, only the composite frame is unreadable.',
    'An edge-anchored overlay zone must be BOUNDED, not merely anchored: give the formula surface an explicit max-width (a fraction of the canvas) plus the wrap behaviour that follows from it, and reserve that rectangle so no scenario geometry is framed into it — or scale the font down for a long string. Verify with the LONGEST equation any state of the concept authors, in pixels, never with a representative short one.',
    'js_eval',
    'For each state, take the formula overlay getBoundingClientRect() and assert it does not intersect the screen-space bounding box of the scenario apparatus (project the apparatus mesh world bounds through the live camera), nor the HUD or slider-panel rects. Run it with the longest formula_overlay string in the concept.',
    'OPEN',
    ARRAY['newtons_laws_body scenario: connected_bodies, block_on_incline']::text[],
    ARRAY['src/lib/renderers/field_3d_renderer.ts']::text[],
    '2026-07-25 lom chapter loop — bring-up proof (free_body_diagram + connected_bodies extremes)',
    'incident'
);

-- Candidate — MODERATE. UNDER-GENERALIZATION, reported not fixed (spec section 7
-- makes adding a config key a STOP-and-report condition, not a silent extension).
INSERT INTO engine_bug_queue (
    bug_class, title, severity, owner_cluster, root_cause, prevention_rule,
    probe_type, probe_logic, status, concepts_affected, fixed_in_files,
    discovered_in_session, row_type
) VALUES (
    'field3d_newtons_laws_body_surface_slab_cannot_be_hidden_for_a_both_hanging_atwood_state',
    'newtons_laws_body has no way to hide the surface slab, so the Atwood (both-hanging) state renders a large empty plank as the biggest object on screen',
    'MODERATE',
    'peter_parker:renderer_primitives',
    'The scenario whole generalization argument is that theta_deg = 0 gives flat ground through the same code path as an incline, so the surface is unconditional apparatus: the surface group is forced visible inside applyNewtonsLawsBodyState (correctly, to beat the generic visible_elements matcher), and there is no surface.hidden flag. A connected_atwood state has NO table and NO incline — two bodies hang from a pulley — yet a 12 m slab renders under them and, at the default camera, dominates the frame while carrying nothing. The only expressible workaround is surface.length_m = 0 with pulley.post_position_m set independently, which still leaves a 0.4-world-unit stub (the slab half-length is clamped to a 0.2 minimum) and reads as a fragment of apparatus rather than an absence.',
    'FOUNDER DECISION REQUIRED — do not add the key unilaterally. The minimal generalization is one optional boolean on the existing surface block (surface.hidden, default false) honoured in the one place that forces the surface group visible, which keeps every other concept bit-identical. The alternative (author the Atwood beat with surface.length_m = 0) is available today at the cost of a visible stub. Either way the decision belongs in the chapter authoring pass, with the real Atwood state on screen.',
    'manual',
    'Open the frozen frame of any connected_atwood state and confirm no unoccupied surface slab is visible; the only apparatus should be post, wheel, both rope segments and the two hanging bodies.',
    'OPEN',
    ARRAY['newtons_laws_body scenario: connected_bodies']::text[],
    ARRAY['src/lib/renderers/field_3d_renderer.ts']::text[],
    '2026-07-25 lom chapter loop — bring-up proof (free_body_diagram + connected_bodies extremes)',
    'directive'
);

-- Cycle 1 (2026-07-25) — LIVE failure caught by THE EYE on free_body_diagram STATE_3.
INSERT INTO engine_bug_queue (
    bug_class, title, severity, owner_cluster, root_cause, prevention_rule,
    probe_type, probe_logic, status, concepts_affected, fixed_in_files,
    discovered_in_session, row_type
) VALUES (
    'field3d_integrating_scenario_ignores_reset_trajectory_and_carries_stale_accumulator',
    'An INTEGRATING field_3d scenario ignores RESET_TRAJECTORY, so every later capture/replay starts downrange from the previous one',
    'MAJOR',
    'peter_parker:field3d_surgeon',
    'The shared RESET_TRAJECTORY handler only rebases stateStartTime (+ the lorentz trail). Every pose-from-closed-form scenario rewinds for free because it renders f(time - stateStartTime). newtons_laws_body is a genuine INTEGRATOR: b.s, b.v and eng.t_ms are accumulators seeded ONLY by applyNewtonsLawsBodyState (i.e. by SET_STATE), so the rebase was a silent no-op for it. THE EYE runs RESET_TRAJECTORY -> pin(revealMs) -> capture -> RESET_TRAJECTORY -> dense 0..10000 -> RESET_TRAJECTORY -> frozen(revealMs); with the reset inert the body kept the reveal pin''s ~3 s of travel, so the dense series began ~6 m downrange and hit the authored +22 m surface bound mid-series. On free_body_diagram STATE_3 (coast_no_force, v0 = 2 m/s) the HUD read v = 0.00 from dense t10000 onward and the frozen frame showed an EMPTY track with v = 0.00, directly contradicting the state''s own "Moving - no forward force / SigmaF = 0" caption. Production rollTimeline() sends RESET_TRAJECTORY on every state entry/replay, so a teacher replaying the state saw the same non-rewinding body. Authoring a larger surface.length_m only moves the halt later - it can never remove it, because the defect is a stale clock, not a short track.',
    'Any scenario that INTEGRATES (keeps per-frame accumulators rather than posing from a closed form of state-local t) MUST implement RESET_TRAJECTORY explicitly: restore each accumulator to its seed, zero the scenario-local clock, re-arm one-shot latches, and hand the focal back. Store the kinematic seed (s0/v0) beside the live value at seed time, and have any slider that writes an INITIAL CONDITION write the seed too, so a rewind preserves teacher input instead of snapping to the authored value. Bring-up proof for a new integrating scenario must include a rewind test that drives THE EYE''s real message order (RESET -> pin -> RESET -> dense -> RESET -> frozen) and asserts the scenario clock tracks PM_simTimeMs, not just a single fresh SET_STATE run.',
    'js_eval',
    'Drive the assembled sim: SET_STATE <s>; post RESET_TRAJECTORY; read the scenario-local clock and every integrated accumulator. Assert clock === 0 and each accumulator === its seed. Then post SET_TIME_FREEZE{at_ms:R}, poll to R, post RESET_TRAJECTORY, crawl a dense series and assert abs(scenarioClockMs - PM_simTimeMs) < 100 at every sample.',
    'FIXED',
    ARRAY['free_body_diagram']::text[],
    ARRAY['src/lib/renderers/field_3d_renderer.ts']::text[],
    '2026-07-25 lom chapter loop cycle 1 — coast_body_halts_mid_state_despite_authored_length_m',
    'incident'
);

-- ── lom-a / free_body_diagram cycle 3 (2026-07-25) — frame-reading protocol, NOT a code defect ──
-- Raised after eye-walker opened a MAJOR "body jumps backward" finding on free_body_diagram STATE_3
-- that a runtime probe + pixel-centroid measurement disproved (dense_t10000 is at x=826px, the dense
-- series is linear, and the frozen frame is a re-entered state pinned at maxRevealMs by construction).
-- Costs a full engine dispatch each time it recurs, so it is worth a permanent probe.
INSERT INTO engine_bug_queue (
    bug_class, title, severity, owner_cluster, root_cause, prevention_rule,
    probe_type, probe_logic, status, concepts_affected, fixed_in_files,
    discovered_in_session, row_type
) VALUES (
    'frozen_frame_read_as_dense_series_continuation_on_translating_body',
    'A __frozen frame is a RE-ENTERED state pinned at maxRevealMs, not the end-of-timeline pose — reading it as the dense series'' last sample mints a phantom "body jumped backward" defect on any continuously-translating scenario',
    'MODERATE',
    'ambiguous',
    'captureFrozenFrame() posts RESET_TRAJECTORY + REPLAY_ANIMATIONS + SET_TIME_FREEZE{at_ms: maxRevealMs} BEFORE its screenshot, so the frozen frame shows the state re-run from its own t=0 and held at the reveal pin. For every legacy field_3d scenario the reveal SATURATES (the picture stops changing once revealed), so frozen is pixel-identical to every later dense frame and the semantic is invisible. A scenario whose taught motion is a continuous translation (newtons_laws_body coast/accelerate modes) has NO settled beat: its frozen frame is legitimately BEHIND the last dense frame by (denseDuration - revealMs) x v. free_body_diagram STATE_3 (v=1 m/s, reveal 3000ms, dense 10000ms) reads as a backward jump, and lands beside a ghost body parked at -3 m, which makes the artifact look like a wrap/reset defect. Sibling STATE_4 (no ghost, reveal 4000ms) shows the identical numeric behaviour and was reported clean.',
    'When judging a translating-body scenario, compare frozen ONLY against the dense frame at that state''s own maxRevealMs (derived in deriveStateMeta), never against dense''s last sample. Before opening a "position jumped/wrapped" finding on any integrating scenario, measure the body centroid across the WHOLE dense series: a wrap is a non-monotonic step INSIDE the series. Frame-reading reports must state which capture role (state_panel_a / dense_tNNNNN / frozen) each cited position came from.',
    'js_eval',
    'Drive THE EYE message order against the real config; assert the dense samples of s are monotonic and equal s0 + v*t within one 16ms step, and assert frozen s == dense s at t = maxRevealMs. Divergence between those two assertions distinguishes a real wrap from the frozen-pin semantic.',
    'OPEN',
    ARRAY['free_body_diagram','connected_bodies','block_on_incline']::text[],
    ARRAY[]::text[],
    'lom-a cycle 3 free_body_diagram coast_position_wraps triage 2026-07-25',
    'probe_definition'
);

-- FOUNDER DECISION (deferred, not applied): free_body_diagram STATE_3's frozen frame — the canonical
-- reviewer screenshot AND the H2 baseline — pins at 3000 ms, which leaves the coasting body still
-- overlapping the ghost, under-selling the state's teaching point (the GROWING GAP between the moving
-- body and the frozen ghost is the whole idea). Nudging coast_no_force's reveal candidate later (e.g.
-- 6000 ms -> s = +1 m, a clear 4 m gap) is a one-line change in deriveStateMeta.ts, but it moves H2
-- pixels and is a legibility judgment, so it was NOT taken in the loop. Same applies to
-- coast_with_friction (STATE_4, 4000 ms). Raised by field3d-surgeon 2026-07-25.

-- >>> connected_bodies rows appended 2026-07-26: see docs/loop_runs/lom/connected_bodies/scar_candidates_connected_bodies.sql

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

-- ============================================================================
-- block_on_incline (concept 3, lom-a, 2026-07-26) -- text only, NOT applied.
-- ============================================================================

-- DIRECTIVE row proposed by field3d-surgeon alongside the pre-approved param_ramp
-- addition (commit ada18a4). Authoring contract, not a defect.
INSERT INTO engine_bug_queue (
    bug_class, title, severity, owner_cluster, root_cause, prevention_rule,
    probe_type, probe_logic, status, concepts_affected, fixed_in_files,
    discovered_in_session, row_type
) VALUES (
    'field3d_param_ramp_authoring_contract',
    'A param_ramp state must author its own surface/body value for the ramped param equal to `from`, or state entry visibly jumps before the ramp starts',
    'LOW',
    'peter_parker:field3d_surgeon',
    'param_ramp evaluates value(t) from `from` -> `to` off the state clock, but the scene is posed at state entry from the authored surface.theta_deg / body field. If the authored value differs from `from`, the first ramp frame snaps the geometry to `from` - a visible jump the author never intended. Same contract idle_auto_sweep already carries for range[0].',
    'A monotonic reveal knob and the authored initial pose are two independent sources of truth for the same quantity; the author must keep them equal, or the engine must derive the pose from the ramp. Documented in NEWTONS_LAWS_BODY_ENGINE_SPEC.md section 1.',
    'json_probe',
    'For every state with newtons_laws_body.param_ramp, assert the authored value of the ramped param (surface.theta_deg for theta; the matching body field otherwise) equals param_ramp.from.',
    'OPEN',
    ARRAY['block_on_incline']::text[],
    ARRAY[]::text[],
    'lom-a block_on_incline - param_ramp addition 2026-07-26',
    'directive'
);

-- FIXED row for the Branch A (uncoupled) twin of bc649d4. Found by eye-walker reading
-- block_on_incline STATE_4 frames at cycle 0 (both blocks' HUD rows went byte-identical
-- the instant B ran out of track); invisible to all 23 deterministic checks.
INSERT INTO engine_bug_queue (
    bug_class, title, severity, owner_cluster, root_cause, prevention_rule,
    probe_type, probe_logic, status, concepts_affected, fixed_in_files,
    discovered_in_session, row_type
) VALUES (
    'nlb_uncoupled_readouts_flip_to_static_on_bound_halt',
    'A sliding uncoupled body arrested at its surface bound silently re-derived STATIC friction, collapsing its readouts onto a never-moving body''s',
    'CRITICAL',
    'peter_parker:field3d_surgeon',
    'The Branch A position clamp at bd.lo/bd.hi forced v = 0 to stop the body at the end of finite track. That zero is a TRACK artifact, not a force-balance rest, but the next frame''s rest test (|v| < NLB_STOP_EPS_V && |drive| <= mu_s*N) could not tell the difference and reclassified the body stuck, flipping f from kinetic to static. In the normal mu_s > mu_k case a body given an initial slide never decelerates to rest on its own, so it is always still sliding at full speed when it hits the bound - the flip was reachable on every such state.',
    'A velocity zeroed by a geometric clamp must never feed a physics rest test. Latch the fact that the halt was a wall (_boundArrestedSliding, set only when the clamping frame was genuinely sliding) and release it only when the body leaves the bound band; pin position and zero v/a at a wall, but never upgrade the friction TYPE.',
    'runtime_probe',
    'Drive a state with a body seeded moving under mu_k until it reaches its track bound, then read the HUD LATE (past the halt instant): the friction glyph must still read fk, and the row must not be byte-identical to a co-present static body''s.',
    'FIXED',
    ARRAY['block_on_incline']::text[],
    ARRAY['src/lib/renderers/field_3d_renderer.ts']::text[],
    'lom-a block_on_incline fix cycle 1 2026-07-26',
    'scar'
);

-- ══════════════════════════════════════════════════════════════════════════════
-- TEXT ONLY — NOT APPLIED. Noticed during ENGINE SEAM A of the push-off build
-- (bug_class nlb_push_off_phase_and_fixed_body, 2026-07-29). Deliberately NOT
-- fixed in that dispatch (one bug_class, minimal diff). The founder/loop decides
-- whether these become real rows.
-- ══════════════════════════════════════════════════════════════════════════════

-- INSERT INTO engine_bug_queue (
--     bug_class, title, severity, owner_cluster, root_cause, prevention_rule,
--     probe_type, probe_logic, status, concepts_affected, fixed_in_files,
--     discovered_in_session, row_type
-- ) VALUES (
--     'nlb_push_off_bodies_lane_separated_so_they_never_touch',
--     'Two independent push_off bodies are z-lane-separated by nlbBodyLaneZ, so the pair that is supposed to collide head-on renders in two parallel rows',
--     'MAJOR',
--     'peter_parker:field3d_surgeon',
--     'nlbBodyLaneZ separates every pair of independent (no-pulley), non-hanging, non-ghost bodies into distinct z lanes so a same-start-line mass/force COMPARE reads as two rows instead of one merged blob. A push_off pair is the opposite case: the two bodies share ONE interaction and must sit on the SAME line, touching, or the spring seam has nothing to draw between them and the whole "these two push EACH OTHER" picture collapses back into "two separate blocks with asserted arrows" - the exact failure the push-off apparatus exists to fix. A cart-vs-fixed-wall pair has the same problem.',
--     'A lane is a DISAMBIGUATION device for bodies that share no interaction. Any state whose bodies are coupled by a declared interaction block (pulley, push_off, spring) returns lane 0 for every body in that block - the lane list must be filtered by the interaction, not just by hanging/ghost.',
--     'js_eval',
--     'In a push_off state, read both body meshes'' world z: they must be equal (0). Assert |zA - zB| < 1e-6.',
--     'OPEN',
--     ARRAY['newton_third_law']::text[],
--     ARRAY['src/lib/renderers/field_3d_renderer.ts']::text[],
--     'lom-a push_off engine seam A 2026-07-29',
--     'incident'
-- );
-- NOTE: explicitly OUT OF SCOPE for seam A by dispatch instruction - the lane/glow
-- wiring is SEAM B's. Recorded here only so it cannot be lost between the seams.

-- INSERT INTO engine_bug_queue (
--     bug_class, title, severity, owner_cluster, root_cause, prevention_rule,
--     probe_type, probe_logic, status, concepts_affected, fixed_in_files,
--     discovered_in_session, row_type
-- ) VALUES (
--     'nlb_f_slider_is_a_dead_control_inside_a_push_off_contact_window',
--     'A guided push_off state that also exposes the F slider gives the teacher a control the per-frame gate silently overwrites every tick',
--     'MODERATE',
--     'peter_parker:field3d_surgeon',
--     'nlbRunPushOff writes BOTH bodies'' F_applied from the authored force_N on every frame, at the input stage, ahead of the integrator. A trusted F-slider drag writes the same field through nlbApplyParam and is therefore stomped on the very next tick: the thumb moves, the number in the row moves, and nothing on the canvas changes. This is the correct enforcement (the equality must not be breakable) but it makes controls_visible: [''F''] a lie in a push_off guided state. idle_auto_sweep and param_ramp both solved the same collision with a PM_nlbSweepSeized seize latch; push_off has none because a seize would break the equal-and-opposite guarantee mid-contact.',
--     'Either (a) forbid ''F'' in controls_visible for a state that authors push_off (authoring constraint, checked by the validator), or (b) let a trusted F drag rescale the push_off MAGNITUDE rather than one body''s force, so the pair stays equal-and-opposite while the teacher scrubs. Never leave a rendered slider whose writes are silently discarded.',
--     'sql',
--     'SELECT concept_id FROM concepts WHERE a field_3d state authors both newtons_laws_body.push_off and controls_visible containing ''F''.',
--     'OPEN',
--     ARRAY[]::text[],
--     ARRAY['src/lib/renderers/field_3d_renderer.ts']::text[],
--     'lom-a push_off engine seam A 2026-07-29',
--     'incident'
-- );

-- ── SEAM B (spring geometry + lane), 2026-07-29 ────────────────────────────
-- The lane row above (nlb_push_off_bodies_lane_separated_so_they_never_touch)
-- is RESOLVED by this seam. bug_class is the upsert key, so this is an UPDATE
-- of that row, NOT a second INSERT.
-- UPDATE engine_bug_queue SET
--     status = 'FIXED',
--     fixed_in_files = ARRAY['src/lib/renderers/field_3d_renderer.ts']::text[]
-- WHERE bug_class = 'nlb_push_off_bodies_lane_separated_so_they_never_touch';
-- Fix: nlbBodyLaneZ returns 0 when the state declares push_off, and when ANY
-- lane candidate is `fixed` (cart vs wall is head-on too). Both tests are
-- per-STATE facts and no existing concept JSON authors either key, so every
-- side-by-side compare state takes the unchanged path.

-- INSERT INTO engine_bug_queue (
--     bug_class, title, severity, owner_cluster, root_cause, prevention_rule,
--     probe_type, probe_logic, status, concepts_affected, fixed_in_files,
--     discovered_in_session, row_type
-- ) VALUES (
--     'nlb_spring_authored_gap_wider_than_compressed_length_floats_untouching',
--     'A push_off state whose carts start further apart than the spring''s compressed length draws a coil floating in the gap, touching neither cart',
--     'MODERATE',
--     'peter_parker:field3d_surgeon',
--     'The spring''s natural length (1.6 m) and compressed length (0.72 m) are APPARATUS CONSTANTS, exactly like the cart size - a real spring has one, and deriving it from the authored gap instead would make the release instant depend on where the author happened to park the carts. nlbFitSpring therefore draws min(gap, target), so a state that authors the two bodies'' initial_position_m further apart than the compressed length renders a short bunched coil centred in a gap it does not span. The picture then says "these two are NOT in contact" while push_off is applying a contact force to both - the exact "declares the interaction but never shows it" class the apparatus exists to defeat.',
--     'Any interaction object with a fixed natural length carries an AUTHORING CONTRACT that the validator can check: for a state with both push_off and spring, assert |s_a - s_b| = 0.72 + halfWidth(a) + halfWidth(b) (0.55 m per cart, 0.275 m for a fixed wall slab) within a small tolerance. A geometric constant that the author must match by hand and nothing verifies is a silent-drift surface.',
--     'js_eval',
--     'For a state authoring both push_off and spring, read both body world positions at t = 0 and assert the face-to-face gap is within 0.05 m of the compressed length (0.72 m).',
--     'OPEN',
--     ARRAY[]::text[],
--     ARRAY['src/lib/renderers/field_3d_renderer.ts']::text[],
--     'lom-a push_off engine seam B 2026-07-29',
--     'incident'
-- );

-- INSERT INTO engine_bug_queue (
--     bug_class, title, severity, owner_cluster, root_cause, prevention_rule,
--     probe_type, probe_logic, status, concepts_affected, fixed_in_files,
--     discovered_in_session, row_type
-- ) VALUES (
--     'nlb_push_off_release_window_outlives_the_spring_extension',
--     'push_off.release_at_ms authored as a round number leaves the spring hidden for most of the contact window it is supposed to explain',
--     'MAJOR',
--     'peter_parker:field3d_surgeon',
--     'A spring stops pushing when it reaches its natural length - the contact DURATION is therefore a consequence of force and mass, not a free parameter. push_off authors it as a wall-clock release_at_ms, so the two can disagree: numerically, 30 N on two 2 kg carts covers the spring''s whole 0.88 m extension in 242 ms, so an authored release_at_ms of 800 leaves the coil on screen for 30% of the push and absent (while both force arrows are still drawn at full length) for the other 70% - regressing exactly to the "arrows appear from nowhere" picture the push-off apparatus was built to fix.',
--     'When an apparatus has a fixed natural length, the authored timing that drives it is DERIVED, not free: release_at_ms = 1000*sqrt(1.76/(force_N*(1/m_a + 1/m_b))) with the 1/m term dropped for a `fixed` body. Author it from the formula, never as a round number. Long-term the engine could derive the release instant from the geometry itself (release when gap >= natural length) and treat release_at_ms as a cap - but that changes push_off''s founder-approved force semantics and is a founder call, not a surgeon call.',
--     'js_eval',
--     'For each state authoring push_off + spring: assert |release_at_ms - 1000*sqrt(1.76/(force_N*(1/m_a + 1/m_b)))| < 40 ms.',
--     'OPEN',
--     ARRAY[]::text[],
--     ARRAY['src/lib/renderers/field_3d_renderer.ts']::text[],
--     'lom-a push_off engine seam B 2026-07-29',
--     'incident'
-- );

-- ============================================================
-- SEAM C (push_off repeat_every_ms) — founder review 2026-07-29, NOT applied
-- ============================================================

-- The dispatched finding itself. Fixed in this seam (engine + deriveStateMeta),
-- so it is logged FIXED rather than OPEN — the row exists so the CLASS ("an
-- interaction whose physical duration is far shorter than its narrated state")
-- is on the scar list, not just this instance.
-- INSERT INTO engine_bug_queue (
--     bug_class, title, severity, owner_cluster, root_cause, prevention_rule,
--     probe_type, probe_logic, status, concepts_affected, fixed_in_files,
--     discovered_in_session, row_type
-- ) VALUES (
--     'nlb_push_off_interaction_dies_after_release_leaving_96pct_of_the_state_empty',
--     'A one-shot push_off is physically over in ~420 ms of an ~11 s narrated state, so both arrows, the spring and the readouts are dead for 96% of it - and the canonical frozen reviewer frame lands in that dead zone',
--     'CRITICAL',
--     'peter_parker:field3d_surgeon',
--     'The contact duration of a real spring push-off is a CONSEQUENCE of force and mass, not a free parameter: release_at_ms = 1000*sqrt(2*stroke/a_rel) is ~420 ms for 30 N on 4 + 12 kg, and a contact slow enough to fill a state (~2 s) would need ~1.3 N - far below the arrow-length floor. A Rule-31 guided state runs 25-55 words = 10-20 s of narration and cannot be shortened. So a SINGLE-FIRE interaction gate is structurally incapable of filling its own state: after release both applied forces are 0, the arrows hide, the spring hides once the gap passes natural length, the HUD reads 0.00, and nothing is left on screen but two blocks sitting apart. Measured on the real renderer: 676 of 700 frames (96.6%) with both forces 0. deriveStateMeta then pinned the frozen reviewer frame at release + 2000 ms - inside the dead zone by construction - so the one canonical screenshot of the state showed NONE of the lesson.',
--     'An interaction whose physical duration is set by physics (spring release, collision, bounce) and is much shorter than its narrated state must REPEAT inside the state, the way a teacher repeats a demo - it must never be authored as a one-shot that leaves a dead tail. Implementation invariants: the repeat is a pure derivation (cycle = floor(t/R), phase = t - cycle*R) off the MONOTONIC state-local clock, never a clock rebase (a rebase latches phase at 0 = permanent contact); the re-arm reuses the engine''s single existing rewind path (nlbResetTrajectory), never a second rewind; the only frame state is one edge memo that ADOPTS the current cycle when null, so dt = 0 under SET_TIME_FREEZE fires nothing and a state re-entry cannot double-rewind (Rule 36); a trusted slider/drag seizes and cancels the repeat (Rule 37). And the reveal pin must follow: with a repeat authored, the frozen candidate lands DURING a contact window (phase < release_at_ms), not past release.',
--     'js_eval',
--     'For each state authoring push_off: compute the fraction of the state duration during which contact_from_ms <= phase < release_at_ms (phase = t - floor(t/repeat_every_ms)*repeat_every_ms; = t when repeat_every_ms is absent). Fail when that fraction is < 0.10 - the interaction the state is ABOUT is on screen for less than a tenth of it. Also assert the derived reveal pin''s own phase is inside the contact window whenever repeat_every_ms is set.',
--     'FIXED',
--     ARRAY['newton_third_law']::text[],
--     ARRAY['src/lib/renderers/field_3d_renderer.ts','src/lib/validators/visual/deriveStateMeta.ts']::text[],
--     'lom-a push_off engine seam C (repeat_every_ms) 2026-07-29',
--     'incident'
-- );

-- Validator candidate deliberately NOT implemented as a validator in this seam
-- (the engine degrades safely instead; a validator is an alex/schema change).
-- INSERT INTO engine_bug_queue (
--     bug_class, title, severity, owner_cluster, root_cause, prevention_rule,
--     probe_type, probe_logic, status, concepts_affected, fixed_in_files,
--     discovered_in_session, row_type
-- ) VALUES (
--     'nlb_push_off_repeat_every_ms_shorter_than_release_would_lock_permanent_contact',
--     'push_off.repeat_every_ms authored at or below release_at_ms would leave the state permanently in contact; the engine ignores it silently',
--     'MODERATE',
--     'peter_parker:field3d_surgeon',
--     'The contact test is on the PHASE, which lives in [0, R). If R <= release_at_ms the phase can never escape the contact window, so the gate would apply the push forever: the carts accelerate off the track, the spring hides at natural length, and both force arrows stay drawn - a permanently-in-contact state with no visible interaction. nlbRunPushOff therefore treats R <= release_at_ms (and any non-finite or <= 0 value) as ABSENT and falls back to single-fire, which is safe but SILENT: the author sees the old dead-tail behaviour and no diagnostic.',
--     'A derived-timing key with a hard admissibility bound belongs in the schema, not only in the engine''s defensive branch: reject repeat_every_ms <= release_at_ms at validate:concepts time (recommended floor: release_at_ms + 1000, so the separation has a beat to read before the reset). The engine keeps its degrade-to-single-fire guard as the second line of defence - never a divide-by-zero, never a permanent-contact state.',
--     'sql',
--     'Fail any concept whose field_3d_config.states.*.newtons_laws_body.push_off sets repeat_every_ms with a value that is not finite, is <= 0, or is <= release_at_ms + 1000.',
--     'OPEN',
--     ARRAY[]::text[],
--     ARRAY['src/lib/renderers/field_3d_renderer.ts']::text[],
--     'lom-a push_off engine seam C (repeat_every_ms) 2026-07-29',
--     'directive'
-- );

-- Observed in the seam-C bring-up probe on the REAL renderer (not a live concept
-- failure): with surface.length_m = 6 the 4 kg cart reaches the +6 m clamp about
-- 1.5 s into each 2.6 s cycle and then sits pinned there until the re-arm.
-- INSERT INTO engine_bug_queue (
--     bug_class, title, severity, owner_cluster, root_cause, prevention_rule,
--     probe_type, probe_logic, status, concepts_affected, fixed_in_files,
--     discovered_in_session, row_type
-- ) VALUES (
--     'nlb_push_off_repeat_coast_pins_carts_against_the_surface_bound_before_the_re_arm',
--     'A repeating push_off whose cycle outlasts the track dumps both carts against the surface clamp, so most of the coast beat shows two stationary blocks at the track ends',
--     'MODERATE',
--     'peter_parker:field3d_surgeon',
--     'After release the carts coast on a mu = 0 track at constant speed until nlbBoundsM clamps them at +/- length_m, where they stop dead (v = 0, correct behaviour for the existing bound). With repeat_every_ms the coast beat is (R - release_at_ms) long, so if that exceeds length_m / v_coast the carts arrive at the track ends early and stand still for the remainder of the cycle - a static picture, and the same "nothing is happening" complaint the repeat was added to fix, just relocated later in the cycle. Measured: 30 N on 4 + 12 kg with length_m = 6 -> the light cart hits the bound ~1.5 s into a 2.6 s cycle.',
--     'A repeating interaction has THREE numbers that must agree, not two: the cycle must fit the track. Author R so that (R - release_at_ms) <= length_m / v_coast (v_coast = force_N*release_at_ms/1000/m for each body, take the faster one), or widen length_m to match. Rule of thumb for the 30 N / 4 + 12 kg case: R = release + ~1.5-2.2 s with length_m >= 8.',
--     'js_eval',
--     'For a state authoring push_off with repeat_every_ms: for each body compute v_coast = force_N*(release_at_ms/1000)/m and assert (repeat_every_ms - release_at_ms)/1000 * v_coast <= surface.length_m (i.e. no body reaches its clamp before the re-arm).',
--     'OPEN',
--     ARRAY[]::text[],
--     ARRAY['src/lib/renderers/field_3d_renderer.ts']::text[],
--     'lom-a push_off engine seam C (repeat_every_ms) 2026-07-29',
--     'incident'
-- );

-- General deriveStateMeta trap, found while writing the seam-C pin (it bit the
-- first version of the change and was caught by the pin probe, not by a gate).
-- INSERT INTO engine_bug_queue (
--     bug_class, title, severity, owner_cluster, root_cause, prevention_rule,
--     probe_type, probe_logic, status, concepts_affected, fixed_in_files,
--     discovered_in_session, row_type
-- ) VALUES (
--     'field3d_reveal_pin_inside_a_narrow_window_silently_raised_by_clampreveal_floor',
--     'A reveal pin computed to land inside a narrow taught window is silently raised to DEFAULT_REVEAL_MS by clampReveal and lands outside it',
--     'MAJOR',
--     'peter_parker:field3d_surgeon',
--     'maxRevealForField3dState returns Math.max of its candidates, but deriveMaxRevealTimeMs then runs every value through clampReveal = Math.min(DURATION_MAX_MS, Math.max(DEFAULT_REVEAL_MS, ms)). Any scenario block whose taught beat is a SHORT WINDOW rather than a settle instant (a repeating contact phase, a band-gated caption, a brief one-shot) can therefore compute a perfectly correct in-window pin - e.g. 147 ms inside a 0-420 ms contact window - and have it silently raised to 1500 ms, i.e. straight back OUTSIDE the window. The block''s own code reads correct in review; the clamp is 300 lines away in a different function.',
--     'A block that pins INSIDE a window (not past a settle) must fold clampReveal''s bounds into its own arithmetic: seed the search at Math.max(DEFAULT_REVEAL_MS, ...candidates) and cap it at DURATION_MAX_MS, so the value that SURVIVES the clamp is still inside a valid window. Verify by calling the exported deriveMaxRevealTimeMs (never the private per-state helper) and asserting the returned pin''s window membership directly.',
--     'js_eval',
--     'For every field_3d block that pins inside a window, call deriveMaxRevealTimeMs and assert the returned value satisfies the block''s own window predicate; fail if the returned value equals DEFAULT_REVEAL_MS while the block computed something smaller.',
--     'OPEN',
--     ARRAY[]::text[],
--     ARRAY['src/lib/validators/visual/deriveStateMeta.ts']::text[],
--     'lom-a push_off engine seam C (repeat_every_ms) 2026-07-29',
--     'directive'
-- );

-- ═══════════════════════════════════════════════════════════════════════════
-- lom-a spring choreography engine SEAM A (spring_action phase machine +
-- slow-motion window + honesty badge) — 2026-07-30. TEXT ONLY, nothing applied.
-- docs/NLB_SPRING_CHOREOGRAPHY_SPEC.md (founder-approved).
-- ═══════════════════════════════════════════════════════════════════════════

-- The dispatched bug_class. FIXED here for the timing/phase half; the coil-
-- geometry half (compression stroke + post-release ring) is seam B.
-- INSERT INTO engine_bug_queue (
--     bug_class, title, severity, owner_cluster, root_cause, prevention_rule,
--     probe_type, probe_logic, status, concepts_affected, fixed_in_files,
--     discovered_in_session, row_type
-- ) VALUES (
--     'nlb_spring_release_plays_at_raw_420ms_with_no_compression_or_hold_beat_and_no_slow_motion',
--     'A spring push-off opens already compressed and lets go 420 ms later, so the whole interaction is a flash with no visible loading and no narratable beat',
--     'CRITICAL',
--     'peter_parker:field3d_surgeon',
--     'push_off drove the pair straight from the authored home pose (already at compressed separation) through a contact window whose length is fixed by the physics: t = sqrt(2*stroke/a_rel) = ~420 ms for 30 N on 4 + 12 kg over the 0.88 m stroke. Authoring cannot slow it (a 2 s contact needs ~1.3 N, far below the arrow-length floor that keeps a force readable) and the state cannot be shortened to 2 s (Rule 31 narration is 10-20 s). So a student never saw the spring being LOADED - the stored energy had no visible origin - and there was no held beat for a teacher to talk over. Founder screen review: "you are not showing real spring compressing and releasing it".',
--     'A physically fast interaction gets a DECLARED choreography, not a faster eye: approach -> compress -> hold -> release -> coast, with the release filmed in slow motion the way every real physics lesson films a fast event, and LABELLED on canvas ("slow motion xN", Rule 24/34) so a slowed release is never read as a small acceleration. slow_factor is a dt multiplier on the integrator during the release window only (Rule 36: linear in dt, no sub-stepping, no second clock, dt = 0 under a freeze pin); the HUD keeps reporting the TRUE physical values. Before the release the pair is HELD by a latch (one code path with the fixed body), so the loading force cannot launch the carts early.',
--     'js_eval',
--     'For a state authoring spring_action: assert eng.spring_phase visits approach->compress->hold->release->coast in order inside one cycle; assert the release window stays open for (release_at_ms - contact_from_ms)*slow_factor ms of WALL time while the integrated stroke is still the true 0.88 m and the exit speeds are the true F*t/m; assert the HUD F/a strings are the unscaled values; assert the slow-motion badge is displayed iff eng.slow_active.',
--     'FIXED',
--     ARRAY[]::text[],
--     ARRAY['src/lib/renderers/field_3d_renderer.ts', 'src/lib/validators/visual/deriveStateMeta.ts']::text[],
--     'lom-a spring choreography engine seam A 2026-07-30',
--     'incident'
-- );

-- Found while wiring the slow window. Seam B owns the fix (coil geometry).
-- INSERT INTO engine_bug_queue (
--     bug_class, title, severity, owner_cluster, root_cause, prevention_rule,
--     probe_type, probe_logic, status, concepts_affected, fixed_in_files,
--     discovered_in_session, row_type
-- ) VALUES (
--     'nlb_spring_coil_holds_its_compressed_length_while_the_release_stroke_opens_the_gap',
--     'During the release the coil stays drawn at compressed length while the carts separate, so it visibly detaches from one face instead of extending with them',
--     'MAJOR',
--     'peter_parker:field3d_surgeon',
--     'nlbFitSpring picks target = compressed-now ? 0.45*natural : natural and then draws min(gap, target). While the push_off contact window is open, compressed-now is TRUE, so target stays at the compressed length even as the face-to-face gap grows from 0.72 m to 1.6 m - the coil is drawn at 0.72 m inside a widening gap and only jumps to natural length on the frame contact ends. The in-code comment claims it "extends with the carts during contact", which min(gap, compressed) does not do. Invisible for 420 ms; glaring once spring_action plays the same stroke over ~2.5 s of wall time.',
--     'A spring is a real object: its DRAWN length must be a continuous function of the beat it is in, not a two-valued boolean. Drive the target length from the published spring_phase/spring_progress (natural during approach, natural->compressed across the compression stroke, compressed during hold, and then simply the live gap during the release until it passes natural length and lets go), so no phase can draw a coil that does not touch both faces.',
--     'js_eval',
--     'For a state authoring spring/push_off: sample the coil userData.q_len against the live face-to-face gap every frame of the release window and fail if |q_len - min(gap, natural)| exceeds the rebuild quantum.',
--     'OPEN',
--     ARRAY[]::text[],
--     ARRAY['src/lib/renderers/field_3d_renderer.ts']::text[],
--     'lom-a spring choreography engine seam A 2026-07-30',
--     'incident'
-- );

-- The authoring trap the new cycle floor degrades silently (same shape as the
-- repeat_every_ms row above, so it is a validator candidate, not an engine bug).
-- INSERT INTO engine_bug_queue (
--     bug_class, title, severity, owner_cluster, root_cause, prevention_rule,
--     probe_type, probe_logic, status, concepts_affected, fixed_in_files,
--     discovered_in_session, row_type
-- ) VALUES (
--     'nlb_spring_action_repeat_cycle_shorter_than_the_slowed_choreography_degrades_to_single_fire',
--     'A repeat cycle authored against the raw release time instead of the slowed wall-clock choreography is silently ignored, so the demo fires once and the state dies again',
--     'MODERATE',
--     'peter_parker:field3d_surgeon',
--     'With spring_action the wall-clock cycle is approach + compress + hold + (release_at_ms - contact_from_ms)*slow_factor - for the spec default 600 + 1600 + 1200 + 2520 = 5920 ms, an order of magnitude above the 420 ms release_at_ms an author would naturally size R against. The renderer IGNORES a cycle at or below that floor (it would leave the phase permanently inside the release window: permanent contact plus permanent slow motion), degrading to single-fire - which silently restores the exact dead-state the repeat seam was added to remove, with no error anywhere. The pre-spring_action floor was just release_at_ms, so an existing R = 2600 becomes too short the moment spring_action is added to the same state.',
--     'A spring_action state sizes repeat_every_ms against the CHOREOGRAPHY, not the physics: R > approach_ms + compress_ms + hold_ms + (release_at_ms - contact_from_ms)*slow_factor, plus a coast beat long enough for the separation to read (the spec suggests ~7200 for the default choreography). Validate the inequality in the schema rather than relying on the renderer silent degrade.',
--     'sql',
--     'For every field_3d state whose newtons_laws_body authors both spring_action and push_off.repeat_every_ms: fail when repeat_every_ms <= approach_ms + compress_ms + hold_ms + (release_at_ms - contact_from_ms) * COALESCE(slow_factor, 6).',
--     'OPEN',
--     ARRAY[]::text[],
--     ARRAY['src/lib/renderers/field_3d_renderer.ts']::text[],
--     'lom-a spring choreography engine seam A 2026-07-30',
--     'directive'
-- );

-- The general engine directive this seam establishes (the reusable half — it
-- applies to any renderer that must show a physically fast event).
-- INSERT INTO engine_bug_queue (
--     bug_class, title, severity, owner_cluster, root_cause, prevention_rule,
--     probe_type, probe_logic, status, concepts_affected, fixed_in_files,
--     discovered_in_session, row_type
-- ) VALUES (
--     'renderer_slow_motion_window_must_scale_dt_only_and_label_itself_on_canvas',
--     'Slowing a fast event by scaling the reported physics, or by scaling dt without saying so on canvas, teaches a falsehood',
--     'MAJOR',
--     'peter_parker:field3d_surgeon',
--     'A physically fast beat (a spring release, an impact, a discharge) is unreadable at real time, and the two easy fixes are both wrong: scaling the AUTHORED force/mass to stretch the event silently changes the physics the HUD then reports, and dividing dt without labelling it makes a student read a slowed release as a small acceleration - the sim would be showing a = 7.5 m/s2 worth of arrows with 1.25 m/s2 worth of motion and no way to tell.',
--     'One shape: (1) divide the INTEGRATOR dt by a declared factor inside the taught window only, never the phase clock, never a reported number - the step must stay linear in dt so a folded multi-step frame and a dt = 0 freeze pin both stay exact (Rule 36); (2) keep every HUD/readout on the true physical values; (3) show a small on-canvas badge ("slow motion xN", real Unicode x) for exactly as long as the window is open, in a corner that collides with no other overlay (Rule 24/34d), hidden in a sandbox state and in every state that does not slow anything.',
--     'js_eval',
--     'Whenever a renderer scales dt: assert (a) the phase/reveal clock advanced by the RAW dt over the window, (b) every published readout equals the unscaled physical value, (c) the badge element is displayed for exactly the frames the scale is active, (d) held frames under SET_TIME_FREEZE are byte-identical.',
--     'OPEN',
--     ARRAY[]::text[],
--     ARRAY['src/lib/renderers/field_3d_renderer.ts']::text[],
--     'lom-a spring choreography engine seam A 2026-07-30',
--     'directive'
-- );

-- ═══════════════════════════════════════════════════════════════════════════
-- SPRING CHOREOGRAPHY — ENGINE SEAM B (coil geometry) · 2026-07-30 · TEXT ONLY
--   field3d_surgeon dispatch, ONE bug_class:
--   nlb_spring_coil_geometry_does_not_follow_the_choreography_phases
--   NOTHING BELOW IS APPLIED TO THE DATABASE.
-- ═══════════════════════════════════════════════════════════════════════════

-- (1) The seam-A row this dispatch CLOSES. bug_class is the upsert key, so this
--     is an UPDATE of the existing OPEN row, never a second INSERT.
-- UPDATE engine_bug_queue SET
--     status = 'FIXED',
--     fixed_in_files = ARRAY['src/lib/renderers/field_3d_renderer.ts']::text[],
--     root_cause = root_cause || ' FIXED 2026-07-30 (seam B): with a live spring_action the drawn target is capped at NATURAL length in every phase, so the GAP does the compressing - the coil now shrinks natural->compressed across the scripted compression stroke and springs back out with the carts through the slowed release (measured: mesh 0.360 -> 0.800 world over 156 release frames, drawn == gap to 1e-6 on every frame). The compressed-now boolean survives only on the no-choreography path.'
-- WHERE bug_class = 'nlb_spring_coil_holds_its_compressed_length_while_the_release_stroke_opens_the_gap';

-- (2) The dispatched bug_class.
-- INSERT INTO engine_bug_queue (
--     bug_class, title, severity, owner_cluster, root_cause, prevention_rule,
--     probe_type, probe_logic, status, concepts_affected, fixed_in_files,
--     discovered_in_session, row_type
-- ) VALUES (
--     'nlb_spring_coil_geometry_does_not_follow_the_choreography_phases',
--     'The spring_action phase machine drove the force and the clock but not the coil, so the state still opened at the compressed pose with no visible loading and the coil held one length while the carts moved',
--     'CRITICAL',
--     'peter_parker:field3d_surgeon',
--     'Seam A gave the state a real choreography (approach/compress/hold/slowed release/coast) and published it (eng.spring_phase / spring_phase_ms / spring_progress), but every piece of GEOMETRY still read only the two body positions plus a compressed-now boolean. Three consequences, all visible: (a) the authored seed pose IS the fully-compressed pose (the release must integrate from it) and the latch writes no position, so the carts stood still through approach and compress - the compression stroke the founder asked for did not exist even though its beats did; (b) nlbFitSpring drew min(gap, compressed) while contact was open, so through the ~2.5 s slowed release the coil held 0.72 m inside a gap opening to 1.6 m; (c) the coil hid the instant the gap passed natural length, so it vanished mid-twang with no ring.',
--     'Whenever a renderer adds a phase machine, every VISUAL channel of the apparatus must be re-derived from the published phase in the same seam - force, clock, geometry, visibility - or the phases exist only in the numbers. Concretely: (1) a latched/held body needs its pose SCRIPTED as a closed form of the phase (position = f(phase), never an integrator, so a freeze pin and a rewind are exact) and written through the ONE placement funnel; (2) a spring length is a continuous function of the beat, capped at natural, with the gap doing the compressing; (3) any phase that legitimately draws past the hide rule (a mounted coil not yet touching the second body; a post-release ring) states so explicitly rather than relaxing the rule globally; (4) a cosmetic flourish (the ring) is a LENGTH only - clamped to the live gap so it cannot overlap a body, never fed to the integrator, never moving a cart.',
--     'js_eval',
--     'For a state authoring spring_action: assert the published coil length (a) is within one rebuild quantum of natural through approach while the face-to-face gap CLOSES from natural + air to natural, (b) shrinks monotonically to 0.45*natural across compress with drawn == gap, (c) is steady at 0.45*natural through hold with the bodies exactly at their authored seed, (d) grows monotonically back to natural across the release with drawn == gap, (e) oscillates above AND below natural during the first ring window of coast and is hidden after it, and (f) never exceeds the live gap in any phase.',
--     'FIXED',
--     ARRAY[]::text[],
--     ARRAY['src/lib/renderers/field_3d_renderer.ts']::text[],
--     'lom-a spring choreography engine seam B 2026-07-30',
--     'incident'
-- );

-- (3) The reusable directive (the half that is not about springs).
-- INSERT INTO engine_bug_queue (
--     bug_class, title, severity, owner_cluster, root_cause, prevention_rule,
--     probe_type, probe_logic, status, concepts_affected, fixed_in_files,
--     discovered_in_session, row_type
-- ) VALUES (
--     'renderer_latched_body_pose_must_be_a_scripted_closed_form_or_the_loading_beat_is_invisible',
--     'A body held out of the integrator has no motion at all unless its pose is scripted, so every pre-release loading beat renders as a still frame',
--     'MAJOR',
--     'peter_parker:field3d_surgeon',
--     'A latch (or any anchored/fixed branch) exists precisely so the integrator writes no position - which silently means the object cannot move during that window even when the taught beat IS a motion (loading a spring, winding a string, drawing a bow). The authored seed is normally the END of that motion, because the dynamic phase that follows must integrate from it, so the scripted beat has to run BACKWARDS out of the seed and return to it exactly.',
--     'Script the held pose as a pure closed form of the published phase - position = f(phase), eased with a function whose derivative vanishes at both ends so the handover to the integrator has no velocity step - write it through the ONE placement funnel, clamp it to the same bounds the integrator uses, and make the last beat land EXACTLY on the authored seed. Never an accumulator and never a velocity integration for a scripted pose: under SET_TIME_FREEZE the phase is frozen, so the pose must be re-derivable bit for bit, and a rewind must reproduce it from the phase alone. A body that must not move (a wall / fixed body) takes none of the scripted travel; its partner takes all of it.',
--     'js_eval',
--     'For any scripted-pose window: pin the clock inside it and assert the position is byte-stable over N held frames and the screenshots are byte-identical; assert the final frame of the window equals the authored seed exactly; assert no position write happens once the window closes.',
--     'OPEN',
--     ARRAY[]::text[],
--     ARRAY['src/lib/renderers/field_3d_renderer.ts']::text[],
--     'lom-a spring choreography engine seam B 2026-07-30',
--     'directive'
-- );

-- (4) A documented degradation, logged so the founder can overrule it.
-- INSERT INTO engine_bug_queue (
--     bug_class, title, severity, owner_cluster, root_cause, prevention_rule,
--     probe_type, probe_logic, status, concepts_affected, fixed_in_files,
--     discovered_in_session, row_type
-- ) VALUES (
--     'nlb_spring_seize_during_approach_hides_the_coil_until_the_carts_are_within_natural_length',
--     'A teacher who grabs a cart before contact sees the spring disappear, because the approach-phase visibility exemption dies with the choreography',
--     'MODERATE',
--     'peter_parker:field3d_surgeon',
--     'Rule 37 cancels the choreography on a trusted drag/slider (PM_nlbBodyDragged / PM_nlbSweepSeized), which publishes spring_phase = empty - and the exemption that lets the coil draw at natural length inside a WIDER gap is keyed on the approach phase. Seized mid-approach the carts correctly stay exactly where the script left them (measured: no teleport, sA unchanged to 4 dp), but the gap is still wider than natural, so the plain gap rule hides the coil until the teacher brings the carts back within 1.6 m, at which point it reappears and behaves as a normal spring. Self-healing and honest (a spring that touches nothing is drawing a force nobody applies) but visually abrupt.',
--     'Decide once, for the fleet: either an apparatus object hides the moment it is not in contact (todays honest rule), or a state that DECLARES the object keeps it mounted on its host body for the whole state. Do not split the difference per phase - the ambiguity is what made the seized case surprising.',
--     'js_eval',
--     'Seize (set PM_nlbBodyDragged) at 35% through the approach phase and assert: the body positions do not change on the seize frame, spring_phase goes empty, and the coil either hides or equals min(gap, natural) - never a stale length.',
--     'OPEN',
--     ARRAY[]::text[],
--     ARRAY['src/lib/renderers/field_3d_renderer.ts']::text[],
--     'lom-a spring choreography engine seam B 2026-07-30',
--     'incident'
-- );

-- (5) The honesty gap the brief explicitly fenced off (do not touch HUD numbers).
-- INSERT INTO engine_bug_queue (
--     bug_class, title, severity, owner_cluster, root_cause, prevention_rule,
--     probe_type, probe_logic, status, concepts_affected, fixed_in_files,
--     discovered_in_session, row_type
-- ) VALUES (
--     'nlb_hud_reads_v_zero_while_the_scripted_loading_beat_visibly_moves_the_carts',
--     'Through approach and compress the carts visibly converge while the HUD velocity row reads 0.00 m/s',
--     'MODERATE',
--     'peter_parker:field3d_surgeon',
--     'The loading motion is a scripted stage-hand action, not a dynamical solution: the latched integrator branch reports the honest dynamics of a HELD body (a = 0, v = 0, f = the holder reaction) and overwrites b.v every frame, so the scripted closed-form velocity has nowhere to go. A state that shows the v readout during the loading beats therefore prints 0.00 m/s over visible motion. Not touched here because the HUD was explicitly out of scope for this dispatch.',
--     'Either (a) omit v from readouts on the loading beats of a spring_action state (authoring fix, free), or (b) let the scripted pose publish its own closed-form velocity for the readout only, on the explicit understanding that a HELD body has zero DYNAMIC velocity - which needs a founder call on what the v row means during a stage-hand beat.',
--     'js_eval',
--     'During approach/compress of a spring_action state, assert that either the v readout row is hidden or the printed v matches the frame-to-frame change in the published body position.',
--     'OPEN',
--     ARRAY[]::text[],
--     ARRAY['src/lib/renderers/field_3d_renderer.ts']::text[],
--     'lom-a spring choreography engine seam B 2026-07-30',
--     'incident'
-- );

-- ============================================================
-- WALL-ANCHORED SPRING (field3d_surgeon, 2026-07-30) — founder finding on
-- newton_third_law STATE_3: "the spring is moving with the block. It should be
-- locked to the wall." TEXT ONLY, NOT APPLIED.
-- ============================================================

-- (1) THE finding. CRITICAL, fixed this dispatch.
INSERT INTO engine_bug_queue (
    bug_class, title, severity, owner_cluster, root_cause, prevention_rule,
    probe_type, probe_logic, status, concepts_affected, fixed_in_files,
    discovered_in_session, row_type
) VALUES (
    'nlb_spring_coil_slides_bodily_instead_of_staying_anchored_to_the_fixed_wall_face',
    'A spring between a cart and a fixed wall slides bodily with the cart instead of staying bolted to the wall face',
    'CRITICAL',
    'peter_parker:field3d_surgeon',
    'nlbFitSpring() mounted the coil at the MIDPOINT of the two body positions and gave it the gap as its length. That is correct and symmetric while BOTH bodies are free, but a wall-anchored spring has exactly ONE fixed end: with one body fixed, half of the free body''s displacement is handed to the mount point, so BOTH coil ends translate and the whole coil walks off the wall it is attached to. Measured on the real assembled renderer over one spring_action cycle: the wall-side coil end travelled 0.8466 m (the founder saw it as 640 px -> 628 px between t=0 and t=6000). The two loading phases that DO mount on a face (approach, ring) mounted on spring.between[0] — an authoring accident, not the anchored body — so a reversed pair mounted the coil on the moving cart instead.',
    'A spring/push_off pair in which EITHER body is `fixed` mounts the coil on THAT body''s facing face in EVERY phase, for the life of the state; only the free end tracks. The mount is a phase-independent property of the apparatus (which body is bolted down), never a per-phase decision, and never derived from the authoring order of `spring.between`. Free-free pairs keep the midpoint mount unchanged.',
    'js_eval',
    'On a cart-vs-fixed-wall spring state, sample the coil''s anchored-end world position every frame of a full cycle (approach/compress/hold/release/coast). Assert (a) max-min of that coordinate < 1e-9, (b) its distance to the anchored body''s facing face < 1e-9 on every visible frame, and (c) the FREE end still travels > 0.3 world units, so the invariance is a pinned mount and not a frozen coil.',
    'FIXED',
    ARRAY['newton_third_law']::text[],
    ARRAY['src/lib/renderers/field_3d_renderer.ts']::text[],
    'lom-a wall-anchored spring fix 2026-07-30',
    'incident'
);

-- (2) The independent sub-defect the same finding exposed. MAJOR, fixed this dispatch.
INSERT INTO engine_bug_queue (
    bug_class, title, severity, owner_cluster, root_cause, prevention_rule,
    probe_type, probe_logic, status, concepts_affected, fixed_in_files,
    discovered_in_session, row_type
) VALUES (
    'nlb_spring_centre_midpoint_mount_leaves_an_air_gap_at_the_thinner_body_face',
    'Centring the coil on the two body CENTRES (not on the gap) leaves a visible air gap at the thinner body and buries the other end inside the fatter one',
    'MAJOR',
    'peter_parker:field3d_surgeon',
    'The mount was cx = (pA + pB)/2 — the midpoint of the two body CENTRES — while the coil''s length is the FACE-TO-FACE gap. Those two midpoints coincide only when the two bodies have equal half-extents. A cart (half 0.55 m) against a wall slab (half 0.275 m) therefore offsets the coil by (hA-hB)/2 = 0.1375 m: a visible gap at the SLAB face and 0.1375 m of coil buried inside the cart. Measured 0.1375 m at the mid-hold pin, exactly the predicted value. The rendered slab and the authoring contract''s 0.275 m half-width DO agree (BoxGeometry(0.275, 1.76, 1.43) is translated in Y only, verified 0.275 m / 0.550 m from the live faces), so this was pure mount arithmetic, not a geometry mismatch. Second-order: the mesh is rebuilt at a 0.02-world quantum while the mount used the UNQUANTISED length, so the residual (up to 0.01 world) was split across both seams instead of being hidden inside a body.',
    'Mount a spanning object on a FACE, never on a centre midpoint, whenever the two hosts can have different half-extents; and offset by the MESH''s own quantised half-length, so the quantisation residual lands entirely on the end nobody reads (inside the moving body) instead of on the visible seam.',
    'js_eval',
    'For every visible frame of a spring state whose two bodies have different half-extents, assert the coil''s end-to-face distance is < 1e-9 at the anchored face and <= half a rebuild quantum at the free face.',
    'FIXED',
    ARRAY['newton_third_law']::text[],
    ARRAY['src/lib/renderers/field_3d_renderer.ts']::text[],
    'lom-a wall-anchored spring fix 2026-07-30',
    'incident'
);

-- (3) Probe doctrine — the H2 "0.00%" demand is not well formed. MODERATE, OPEN.
INSERT INTO engine_bug_queue (
    bug_class, title, severity, owner_cluster, root_cause, prevention_rule,
    probe_type, probe_logic, status, concepts_affected, fixed_in_files,
    discovered_in_session, row_type
) VALUES (
    'eye_h2_frozen_frames_of_moving_elements_wobble_sub_perceptually_so_zero_percent_is_not_a_valid_gate',
    'H2 on a frozen frame containing a moving element wobbles a few hundredths of a percent between identical runs, so "H2 = 0.00%" cannot be used as a regression equality',
    'MODERATE',
    'peter_parker:field3d_surgeon',
    'Two EYE runs of the SAME committed code on the same concept returned different H2 percentages on frozen frames that contain a moving body (connected_bodies STATE_6__frozen 0.24% then 0.22%; free_body_diagram STATE_3__frozen 0.00% then 0.03% twice). A direct pixel diff of the two frames shows 4315 differing pixels inside a single 68x68 box with a MAXIMUM channel delta of 3/255 — sub-perceptual rasterizer/AA wobble, not geometry: a real displacement produces large channel deltas along edges. A dispatch that demands "H2 = 0.00%" as proof of no regression therefore fails for reasons unrelated to the change under test, and invites a surgeon to "fix" a non-defect.',
    'State the no-regression criterion as "H2 PASSES its tolerance AND any non-zero percentage reproduces on the PRE-change renderer or has max channel delta <= 3", not as an equality to 0.00%. When a non-zero H2 appears, settle it with a pre/post pixel diff (bounding box + max channel delta), never by eyeballing the percentage.',
    'manual',
    'Re-seed and run visual:eyes on the unchanged renderer; diff the two frozen PNGs pixel-wise and report differing-pixel count, bounding box and max channel delta. Sub-3/255 deltas are rasterizer noise.',
    'OPEN',
    ARRAY['free_body_diagram','connected_bodies']::text[],
    ARRAY['src/scripts/visual_eyes.ts']::text[],
    'lom-a wall-anchored spring fix 2026-07-30',
    'probe_definition'
);
