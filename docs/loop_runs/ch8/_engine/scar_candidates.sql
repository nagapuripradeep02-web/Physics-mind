-- ============================================================================
-- ch8 chapter-loop — engine scar candidates (SQL TEXT ONLY, NOT APPLIED).
-- The loop appends these to the live engine_bug_queue at chapter seal; the
-- field3d_surgeon trial is forbidden from any DB write. Author against the
-- 13 authored columns of engine_bug_queue:
--   bug_class, title, severity, owner_cluster, root_cause, prevention_rule,
--   probe_type, probe_logic, status, concepts_affected, fixed_in_files,
--   discovered_in_session, row_type
-- Constraints: severity IN (CRITICAL|MAJOR|MODERATE); probe_type IN
-- (sql|js_eval|manual); row_type IN (incident|probe_definition|directive);
-- owner_cluster from the fixed enum. bug_class is the UPSERT KEY — a recurrence
-- is an UPDATE/reopen, never a duplicate INSERT.
-- ============================================================================

-- 2026-07-24: displacement_current (Ch.8 §8.2) NEW field_3d scenario build.
-- ONE incident, found + FIXED same session (build dispatch, run
-- .visual_runs/displacement_current/20260724-190251 STATE_5__frozen.png showed
-- B = 0.0 uT / I_c = 0.00 A on the central misconception-confrontation state).
INSERT INTO engine_bug_queue (bug_class, title, severity, owner_cluster, root_cause, prevention_rule, probe_type, probe_logic, status, concepts_affected, fixed_in_files, discovered_in_session, row_type) VALUES
(
  'field3d_charge_hold_reveal_pin_lands_in_zero_window',
  'displacement_current STATE_5 (the "B lives in the gap — the probe says otherwise" confrontation) froze at B = 0.0 uT / I_c = 0.00 A because its reveal pin landed in a Loop-A HOLD/RESET window where the field is legitimately zero, directly contradicting the caption and the whole teaching point (B = 2.4 uT)',
  'MAJOR',
  'peter_parker:renderer_primitives',
  'VERIFIED + FIXED 2026-07-24. A charge/hold/soft-reset loop (Loop A: I_c pulses ON during CHARGE, then HOLD + RESET with dPhi_E/dt = 0 so I_d = 0 and B(r) = 0 everywhere) is correct for states that TEACH the on/off charging behaviour (S1 fills-the-gap, S6 throttle). But deriveStateMeta.maxRevealForField3dState pins the frozen capture at the LATEST one-shot cue payoff (here bring_gap_appear 10000ms + probe_glide 2000+8000ms => ~10700ms), which fell inside a HOLD window (period 6000, charge 0-4200: 10700 % 6000 = 4700ms => HOLD) — so the pinned frame captured the field at its physically-correct but pedagogically-wrong zero. The physics_author had FLAGGED (physics_block Flag #1) that S5/S7 need SUSTAINED charge so B never blips to zero, but the concept JSON authored STATE_5 with loop:"A". Fixed renderer-side: dcPhase() now forces SUSTAINED charge (active=true, q=1) for mode "b_lives_in_the_gap" regardless of the authored loop, so I_d/B stay continuously live and the probe reads 2.4 uT at every frame incl. the pin. S7 (loop:"B") was already sustained (verified 2.3 uT at r=10.5). No concept-JSON edit (content untouched); the loop field is a rendering-timing detail the engine owns.',
  'A field_3d state whose TAUGHT quantity is a field-magnitude readout (B(r), a probe needle) or a construction-invariant (an Ampere-Maxwell ledger sum) must run SUSTAINED excitation (the driving current never pauses) so the quantity is continuously nonzero — NEVER an on/off charge-hold loop, which drops the taught quantity to a legitimate zero in the HOLD/RESET window where deriveStateMeta pins the frozen capture. On/off loops are only for states that TEACH the on/off behaviour itself (charge-fills, throttle-on/off). When a physics_author flags "sustained charge, never blip to zero" for a state, the renderer must honour it even if the concept JSON authored an on/off loop. THE EYE must read the frozen frame of any field-readout state and confirm the readout matches the caption/teaching number, never a zero.',
  'manual',
  'On any field_3d state whose caption/formula names a nonzero field magnitude (e.g. "B = 2.4 uT", "the probe says otherwise", a frozen ledger sum), read the __frozen.png and confirm the on-screen readout is that nonzero value — NOT 0.0. If the readout reads zero while the caption promises a nonzero field, the reveal pin has landed in a charge-hold zero-window and the state must be switched to sustained excitation.',
  'FIXED',
  ARRAY['displacement_current']::text[],
  ARRAY['src/lib/renderers/field_3d_renderer.ts']::text[],
  'ch8_loop_displacement_current_2026-07-24',
  'incident'
);

-- ============================================================================
-- 2026-07-24: displacement_current — founder-proxy Checkpoint B findings.
-- Distinct bug_class from the build-dispatch's field3d_charge_hold_reveal_pin_lands_in_zero_window.
-- ============================================================================
INSERT INTO engine_bug_queue (bug_class, title, severity, owner_cluster, root_cause, prevention_rule, probe_type, probe_logic, status, concepts_affected, fixed_in_files, discovered_in_session, row_type) VALUES
(
  'field3d_scene_composition_annotation_silent_noop',
  'displacement_current STATE_5 (the central Rule-16a "B lives in the gap" confrontation) renders no on-canvas wrong-expectation cue: the authored scene_composition annotation "no current means no B" (ghost_tag_at_ms:0) silently no-ops fleet-wide, so sound-off (Rule 24) the caption "The probe says otherwise" has no visible antecedent and the misconception setup is narration-only',
  'MAJOR',
  'peter_parker:renderer_primitives',
  'field_3d renderers draw on-canvas text ONLY from field_3d_config.states (captions/formula/HUD); scene_composition + epic_l_path annotation ids are never rendered (known fleet pattern). For most states supplementary annotations duplicate the caption/formula and their absence is harmless, but a misconception-confrontation state (Rule 16a) carries its wrong-expectation SETUP only in the annotation/narration — with the annotation dead and TTS off by default, the sound-off confrontation loses its "you expected zero" half. Scoped fix: render a pinned ghost-tag element for mode b_lives_in_the_gap wired to the existing ghost_tag_at_ms hook (no JSON edit). Fleet fix (broader): a generic rendered on-canvas annotation primitive.',
  'A Rule-16a confrontation state must render its wrong-expectation cue through a channel that actually paints (field_3d_config caption/formula/a dedicated scenario element) — never rely on a scene_composition/epic_l annotation, which silently no-ops. THE EYE must read the __frozen.png of every misconception state and confirm the wrong-expectation cue is on-canvas, not narration-only, so the beat survives sound-off (Rule 24).',
  'manual',
  'Read the __frozen.png of any state carrying a misconception_watch entry. Confirm the wrong-expectation cue (the belief being disproven) is visible on-canvas. If only the resolution/probe reading is visible and the wrong-expectation is absent, the annotation has silently no-opped and the Rule-16a beat fails sound-off.',
  'OPEN',
  ARRAY['displacement_current']::text[],
  ARRAY[]::text[],
  'ch8_loop_displacement_current_2026-07-24',
  'incident'
),
(
  'field3d_vertex_morph_nonmonotonic_at_cue_boundary',
  'displacement_current STATE_4 disk-to-balloon vertex-morph shows a one-frame non-monotonic geometry pop at the morph_start_at_ms:2000 one-shot boundary (eye-walker frame-by-frame flagged a spurious full-balloon at s=0.00; founder-proxy could NOT reproduce it in the saved STATE_4__dense_t02000.png or founder_drive S4_mid.png, both of which read flat) — at worst a transient boundary artifact, endpoints and I_enc readout correct',
  'MODERATE',
  'peter_parker:renderer_primitives',
  'The new dc_surface paraboloid vertex-morph rewrites a pre-built grid BufferGeometry in place from the reported surface param s. At the morph-start one-shot cue boundary the geometry buffer can momentarily reflect a value out of step with the reported/slider s for a single frame before settling; continuous-scrub mode (S9) and the S4 endpoints are clean, localizing it to the one-shot morph_start cue. Not physics-wrong (numbers stay truthful; the "1.2 A ?" readout is unaffected).',
  'A vertex-morph primitive must be a monotonic single-valued function of its reported parameter at every sampled frame, including the exact frame of a one-shot morph-start cue — the mesh geometry and the slider/HUD value must never disagree. Reused morph primitives (S4 one-shot + S9 continuous scrub share dc_surface) must be verified in BOTH drive modes.',
  'manual',
  'THE EYE dense-series frame-by-frame on any state driving a vertex-morph: at each sampled ms, confirm the rendered mesh silhouette matches the reported morph parameter (flat at s~0, fully bulged at s~1) with no single-frame non-monotonic jump at the morph-start cue boundary.',
  'FIXED',
  ARRAY['displacement_current']::text[],
  ARRAY['src/lib/renderers/field_3d_renderer.ts']::text[],
  'ch8_loop_displacement_current_2026-07-24',
  'incident'
);
-- NOTE (CP-C 2026-07-24): Row 3 above flipped OPEN→FIXED + fixed_in_files set — the guard
-- landed in commit 32f032d (engine log E3, verified 43/43 + STATE_4 dense monotonicity). Row 2
-- (field3d_scene_composition_annotation_silent_noop) INTENTIONALLY stays OPEN: aa724f8 added a
-- bespoke S5 element (pedagogical symptom resolved) but did NOT repair the fleet-wide annotation
-- render path, so the CLASS is genuinely unfixed. FOUNDER APPLY-TIME CHECK: confirm the live
-- engine_bug_queue severity CHECK constraint permits 'MAJOR' before INSERT (the two MAJOR rows).

-- ============================================================================
-- em_wave_propagation / E1 (increment 1: load-bearing core) — 2026-07-24
-- Directive row (no incident; captures the reusable NEW primitive).
-- TRIAL: NOT applied to the DB. Founder rules on this at chapter end.
-- ============================================================================
INSERT INTO engine_bug_queue (bug_class, title, severity, owner_cluster, root_cause, prevention_rule, probe_type, probe_logic, status, concepts_affected, fixed_in_files, discovered_in_session, row_type) VALUES
('field3d_traveling_vector_train_primitive', 'em_wave_propagation: deterministic transverse dual-sinusoid vector train (E on y-hat, B on z-hat, phase x-vt)', 'MODERATE', 'peter_parker:renderer_primitives', 'No existing field_3d scenario rendered a translating transverse vector train with two orthogonal polarizations + a phase-speed clock; built NEW as a pure fn of state-local ms (envelope polyline + arrow array per train, scale.y-driven signed arrows), byte-stable under SET_TIME_FREEZE.', 'A traveling-wave train MUST be a closed-form fn of state-local t (never a += accumulator) so frozen baselines rewind; arrow sign via group.scale.y on MeshBasicMaterial (flipped normals are a non-issue); axis built as a plain cylinder, never createTubeLine, so it never hard-depends on config.field_lines.', 'manual', 'THE EYE __frozen.png at t=3000->9000->3000 ms byte-identical for any train/pulse state.', 'OPEN', ARRAY['em_wave_propagation']::text[], ARRAY['src/lib/renderers/field_3d_renderer.ts','src/lib/validators/visual/deriveStateMeta.ts']::text[], 'ch8-loop-2026-07-24-E1', 'directive');
