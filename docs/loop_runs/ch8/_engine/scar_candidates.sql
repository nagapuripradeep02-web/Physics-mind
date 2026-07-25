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

-- ============================================================================
-- em_wave_propagation / E2 (increment 2: per-state add-ons) — 2026-07-24
-- Directive row (no incident; captures a non-obvious equal-quantity display trap
-- that extends the dc-S8 "unrounded internals" lesson). TRIAL: NOT applied.
-- ============================================================================
INSERT INTO engine_bug_queue (bug_class, title, severity, owner_cluster, root_cause, prevention_rule, probe_type, probe_logic, status, concepts_affected, fixed_in_files, discovered_in_session, row_type) VALUES
('field3d_equal_quantity_pair_needs_shared_exact_constant_not_rounded_display', 'em_wave_propagation S8: twin energy-density tanks (uE = 1/2 eps0 E^2 and uB = B^2/2mu0) must render the IDENTICAL string, but computing uB from a ROUNDED display c (2.998e8) instead of the EXACT c = 1/sqrt(mu0*eps0) makes uE and uB round to DIFFERENT last digits (6.38 vs 6.37)', 'MODERATE', 'peter_parker:renderer_primitives', 'AVOIDED at build time (no incident shipped). uE = uB is an EXACT identity for a vacuum plane wave ONLY when B = E/c_exact: then uB = E^2/(2*mu0*c_exact^2) = E^2*eps0/2 = uE identically. If the renderer derives B from the DISPLAY-rounded c (2.998e8), the mu0*c^2 term no longer equals 1/eps0, and the two independent chains diverge ~5e-5 relative — enough to cross a toFixed(2) boundary (6.375e-8 -> 6.38 vs 6.3747e-8 -> 6.37), visibly breaking the FL4 "identical string" teaching. Built to use a local C_EXACT = 1/sqrt(mu0*eps0) for the energy chain (display readouts elsewhere keep the rounded 2.998e8).', 'When two quantities MUST display equal because they are equal by a physical identity (uE=uB, E0/B0=c both ways, any ratio pinned by construction), compute BOTH from ONE shared EXACT constant chain (c = 1/sqrt(mu0*eps0)), never one from a rounded DISPLAY value — a rounded intermediary breaks the identity at the last displayed digit even though each chain is individually "correct". Extends the dc-S8 unrounded-internals lesson from single-value rounding to equal-PAIR rounding.', 'js_eval', 'Sample both readouts of an equal-by-identity pair at several clock offsets; assert the rendered STRINGS are byte-identical at every instant (not merely close). Any instant where they differ => a rounded intermediary is in one chain.', 'OPEN', ARRAY['em_wave_propagation']::text[], ARRAY['src/lib/renderers/field_3d_renderer.ts']::text[], 'ch8-loop-2026-07-24-E2', 'directive');

-- ============================================================================
-- em_wave_propagation — founder-proxy Checkpoint B, F-S9 — 2026-07-25
-- ONE incident, found + FIXED same session (deriveStateMeta-only fix).
-- Same family as scar #4 (missing maxReveal block => DEFAULT_REVEAL_MS pin), but
-- a PARTIAL-block variant: the em_wave push list EXISTS yet OMITS S9's four
-- formula-chain cues. Distinct bug_class (upsert key). TRIAL: NOT applied.
-- ============================================================================
INSERT INTO engine_bug_queue (bug_class, title, severity, owner_cluster, root_cause, prevention_rule, probe_type, probe_logic, status, concepts_affected, fixed_in_files, discovered_in_session, row_type) VALUES
(
  'field3d_emw_s9_link_cues_missing_from_reveal_pin',
  'em_wave_propagation STATE_9 (the E_y -> B_z chain-link derivation) froze showing only E_y = E0 sin(kx - wt) with zero recall links docked and no assembled B_z line, because the em_wave push list in deriveStateMeta.maxRevealForField3dState omitted S9''s four formula-chain cues (link1/2/3_at_ms, assembled_at_ms) => the pin fell back to DEFAULT_REVEAL_MS ~1500 ms, mid-derivation before any link docks (the first link is authored at 4500 ms)',
  'MODERATE',
  'peter_parker:renderer_primitives',
  'VERIFIED + FIXED 2026-07-25. The renderer emw_formula chain (field_3d_renderer.ts ~L31440) reads ew.link1_at_ms (4500), link2_at_ms (9000), link3_at_ms (13500), assembled_at_ms (16000) and docks each recall link then lights the assembled B_z line at the authored offsets — the live sim is CORRECT (dense_t18000.png shows the fully-assembled B_z). Only THE EYE''s frozen capture was wrong: deriveStateMeta.maxRevealForField3dState builds the frozen-pin as Math.max(...candidates), and the em_wave block pushed motes/needle/relay/trough/match/bunch/slab cues but NOT the S9 formula-chain cues, so for STATE_9 the candidate set was empty and the pin fell to DEFAULT_REVEAL_MS ~1500 ms — mid-derivation, before the first link docks at 4500 ms. Fix: added four pushes to the existing em_wave push list — link1/2/3_at_ms (+600 each) and assembled_at_ms (+2000). Max candidate = 16000 + 2000 = 18000 ms, exactly the verified-correct STATE_9 dense_t18000 capture, landing PAST the last settled payoff (scar #5, never mid-transition). deriveStateMeta-only; renderer + concept JSON untouched.',
  'Every scripted-reveal field_3d state must contribute its LAST-payoff cue to the deriveStateMeta maxRevealForField3dState candidate set — not just the scenario''s early/global cues. A scenario push list that covers SOME states'' cues but silently omits another state''s (here S9''s formula-chain link1/2/3 + assembled) lets that state fall back to DEFAULT_REVEAL_MS ~1500 ms and photograph a mid-derivation frame. When adding a per-state scripted reveal to a renderer scenario, add its terminal cue to the scenario''s push list in the SAME change (scar #4 family), and pin PAST the last settled beat (scar #5). THE EYE must read the __frozen.png of every derivation/assembly state and confirm all authored reveal beats have fired.',
  'manual',
  'For any field_3d state with a multi-step scripted reveal (formula chain, staged assembly), read its __frozen.png and confirm the FINAL authored beat has fired (all links docked, assembled line lit). If the frozen frame shows only the initial/GIVEN surface with no scripted steps, the state''s terminal cue is missing from the deriveStateMeta push list and the pin fell to DEFAULT_REVEAL_MS.',
  'FIXED',
  ARRAY['em_wave_propagation']::text[],
  ARRAY['src/lib/validators/visual/deriveStateMeta.ts']::text[],
  'ch8_loop_em_wave_propagation_2026-07-25',
  'incident'
);

-- ============================================================================
-- em_wave_propagation — founder-proxy Checkpoint B, F-S1 — 2026-07-25
-- ONE incident, found + FIXED same session (renderer-only fix).
-- Sibling of the S9/scar-#4 family but a DISTINCT class: not a missing reveal
-- pin — the authored cue (needle_kick_at_ms) was simply NEVER READ by the
-- renderer, so the physics arrival (~7333 ms) desynced from the authored kick
-- (9000 ms) and the 9500 ms pin landed in the post-reset trough. TRIAL: NOT applied.
-- ============================================================================
INSERT INTO engine_bug_queue (bug_class, title, severity, owner_cluster, root_cause, prevention_rule, probe_type, probe_logic, status, concepts_affected, fixed_in_files, discovered_in_session, row_type) VALUES
(
  'field3d_emw_s1_pulse_arrival_desynced_from_needle_kick_cue',
  'em_wave_propagation STATE_1 (a wiggle travels out, "after a delay") froze at the pin (9500 ms) showing the pulse back at the source and the receiver reading B = 0.00 uT, because the pulse packet arrived at the receiver at the renderer-fixed ~7333 ms while the authored needle_kick_at_ms (9000) was never read — so the pin (9500) landed in the post-reset trough of the 8200 ms pulse loop, not on the needle kick',
  'MAJOR',
  'peter_parker:renderer_primitives',
  'VERIFIED + FIXED 2026-07-25. The em_wave pulse envelope centre (field_3d_renderer.ts emwPulseCenter) advanced at the fixed crest speed EMW_VDISP over a fixed EMW_PULSE_MS = 8200 ms loop, so the packet reached the receiver (EMW_RCV_X) at (EMW_RCV_X - EMW_SRC_X)/EMW_VDISP = 8/0.0010909 ~= 7333 ms every cycle regardless of state. The authored STATE_1 em_wave.needle_kick_at_ms = 9000 was NOT read by the renderer at all, so the intended travel-delay was ignored twice over: (a) the kick physics fired ~1667 ms early, and (b) the frozen reveal pin at 9500 ms fell at 9500 % 8200 = 1300 ms into the NEXT cycle — pulse centre back near the source (~-2.6 scene), receiver envelope ~0 => B = 0.00 uT, contradicting S1s "arrives after a delay" caption. Fix: retimed the pulse to ARRIVE at the receiver exactly at the authored cue. New per-frame EMW_pulseArrive = cueTriggerMs("needle_kick", ew.needle_kick_at_ms) for pulse states (default EMW_PULSE_ARRIVE0 ~= 7333 for train / cue-less pulse states, byte-identical to the old constant form). emwPulseCenter now travels (EMW_RCV_X - EMW_SRC_X)/EMW_pulseArrive and the cycle period scales as EMW_pulseArrive * (EMW_PULSE_MS / EMW_PULSE_ARRIVE0) so the loop never resets before arrival: for S1 arrival = 9000 ms, period ~= 10064 ms, so the 9500 ms pin sits 500 ms PAST the kick (packet centre ~+4.44 scene, receiver envelope ~0.82) — needle clearly kicked, gauge nonzero. Pure closed-form fn of state-local ms (no accumulator) => byte-stable under SET_TIME_FREEZE (scar #1). Renderer-only; concept JSON + deriveStateMeta untouched.',
  'A field_3d scenario that authors a physical-arrival cue (needle_kick_at_ms, a pulse-reaches-target time) MUST actually READ it and align the choreography so the modelled event coincides with the authored cue — a hardcoded travel speed/loop period that ignores the cue desyncs the physics from the teaching AND lets the reveal pin fall in a loop trough. Route the arrival through cueTriggerMs(name, ew.<cue>_at_ms) like the sibling gates, keep the motion a closed-form fn of state-local ms (scar #1), and SIZE THE LOOP PERIOD so it never resets before the authored arrival (else the pin photographs a post-reset trough — scar #4/#5 family). THE EYE must read the __frozen.png of any pulse-arrival state and confirm the target readout is the nonzero arrival value the caption promises, never 0.',
  'manual',
  'For any field_3d pulse/packet state whose lesson is "reaches the target after a delay", read the __frozen.png and confirm the target instrument (receiver needle/gauge) shows the nonzero arrival reading, not 0.00. If it reads zero, the pulse arrival is desynced from the authored cue and/or the loop period reset before the pin — retime so arrival == needle_kick_at_ms and period > arrival + tail.',
  'FIXED',
  ARRAY['em_wave_propagation']::text[],
  ARRAY['src/lib/renderers/field_3d_renderer.ts']::text[],
  'ch8_loop_em_wave_propagation_2026-07-25',
  'incident'
);

-- ============================================================================
-- em_wave_propagation — founder-proxy Checkpoint B, F-S6 (ride-along) — 2026-07-25
-- ONE incident, found + FIXED same session (renderer-only fix). TRIAL: NOT applied.
-- ============================================================================
INSERT INTO engine_bug_queue (bug_class, title, severity, owner_cluster, root_cause, prevention_rule, probe_type, probe_logic, status, concepts_affected, fixed_in_files, discovered_in_session, row_type) VALUES
(
  'field3d_emw_s6_lambda_bracket_declared_but_never_rendered',
  'em_wave_propagation STATE_6 (and STATE_11) declared a graphical wavelength bracket in the symbol-label table (skeleton (b): "wavelength | bracket lambda = 3.00 m + readout | S6") but only the HUD lambda readout ever rendered — the em_wave renderer had no in-scene span marker, so a teacher saw the lambda NUMBER but not WHERE on the wave one wavelength is measured (not a misteaching: the value read correctly, so ride-along)',
  'MODERATE',
  'peter_parker:renderer_primitives',
  'VERIFIED + FIXED 2026-07-25. The em_wave block honoured show_lambda only as a value-only HUD line (field_3d_renderer.ts updateEmWavePropagationFrame ~L31525: lines.push lambda = c/(nu*1e6)) with no scene geometry — the authored symbol-label bracket had no renderer counterpart. Fix: added a graphical span bracket (elementType emw_lambda), gated on the SAME authored key show_lambda (so it appears on both S6 and S11 where lambda is declared — no new authoring key invented). Built once in buildEmWavePropagation as a 4-vertex THREE.Line (a downward-opening bracket: left tick up, across the top, right tick down) plus a pmCreateAutoLabel lambda sprite; toggled by the showMap (emw_lambda: !!ew.show_lambda); driven per-frame from the live wavenumber: span = 2*PI/k where k = emwK(nu, 1) is the drawn waves OWN wavenumber, so the bracket matches the train by construction and re-scales live as nu is dragged (lambda = c/nu). Geometry has NO ms term (pure fn of nu) => byte-stable under SET_TIME_FREEZE (scar #1). Label mirrors the HUD lambda line character-for-character with real Unicode lambda (Rule 34c). Placed in a reserved upper-centre band (top bar y=2.05, down-ticks to y=1.80, label y=2.42) that clears the E-envelope (<=1.1), gate bars (top 1.4) and gate A/B labels (y=1.65) at every nu in the 50-200 MHz range, and sits centre-x so it never reaches the top-right HUD (top:52px) or the bottom formula dock (bottom:64px) (Rule 34d). Renderer-only; concept JSON + deriveStateMeta untouched.',
  'When a symbol-label table declares a GRAPHICAL reference marker (a bracket, a distance line, a reference axis) alongside a numeric readout, the renderer must draw the graphical marker in-scene, not just the HUD number — presence of the value is not presence of the marker (scar #7 spirit: a declared token that renders zero geometry still "passes" a value check). Gate the marker on the SAME authored flag that gates its readout (here show_lambda) so it appears wherever the quantity is surfaced, invent no new key, make its geometry a pure closed-form fn of the physical quantity (byte-stable under a freeze pin, scar #1), and reserve an overlay band that clears the states other overlays (Rule 34d). THE EYE / eye_walker must confirm the graphical marker renders, not only the numeric readout.',
  'manual',
  'For any field_3d state whose symbol-label table declares a graphical reference marker (wavelength bracket, distance line, reference axis) plus a readout, read the __frozen.png and confirm the graphical marker is visible in-scene spanning/marking the declared quantity — not just the HUD number. If only the HUD text is present, the marker geometry was never built; add it gated on the readouts authored flag.',
  'FIXED',
  ARRAY['em_wave_propagation']::text[],
  ARRAY['src/lib/renderers/field_3d_renderer.ts']::text[],
  'ch8_loop_em_wave_propagation_2026-07-25',
  'incident'
);

-- ============================================================================
-- em_wave_propagation — founder-proxy Checkpoint B, F-S5 (BLOCKING) — 2026-07-25
-- ONE incident, found + FIXED same session (renderer-only fix). TRIAL: NOT applied.
-- Filed at Checkpoint C: the C-gate diff audit caught that the cycle-1 BLOCKING
-- defect had a landed fix (commit 7bb26e2) but NO scar row — the ratchet would
-- have missed the highest-severity defect of the run. Severity is CRITICAL (the
-- standard enum) deliberately, NOT the 'MAJOR' used on the F-S1 row above, whose
-- CHECK-constraint validity is still a founder confirmation item.
-- Same ROOT FAMILY as F-S1 ("authored *_at_ms cue never read by the renderer")
-- but filed distinctly: F-S1 is a physical-arrival desync, F-S5 is a Rule-16a
-- pedagogical resolution beat that never fires at all.
-- ============================================================================
INSERT INTO engine_bug_queue (bug_class, title, severity, owner_cluster, root_cause, prevention_rule, probe_type, probe_logic, status, concepts_affected, fixed_in_files, discovered_in_session, row_type) VALUES
(
  'field3d_emw_ghost_dissolve_hook_dead_code',
  'em_wave_propagation STATE_5 (E and B are IN PHASE, a Rule-16a misconception pivot) left its disproven belief standing forever: the desaturated-red wrong-phase ghost train and its tag "x expected: B peaks 90 deg after E" never dissolved, so the held final frame a sound-off teacher lands on permanently showed the un-cleared foil beside the correct in-phase readouts',
  'CRITICAL',
  'peter_parker:renderer_primitives',
  'VERIFIED + FIXED 2026-07-25. The concept JSON authored em_wave.ghost_dissolve_at_ms on STATE_5 and deriveStateMeta.ts pushed it to the reveal pin (L1369), so BOTH the authoring layer and THE EYE believed a dissolve existed — but grep confirmed field_3d_renderer.ts never read the key: emw_ghostb was gated ONLY by the static show_ghostb flag, making ghost_dissolve_at_ms dead code. The ghost therefore persisted for the whole state, including past the intended 13500 ms dissolve and at the 14700 ms pin. This is the exact failure the deterministic gates cannot see: THE EYE consults the freeze pins themselves, and nothing in the 47-check battery asks "is the pinned frame the RIGHT frame" — the concept passed 47/47 with the defect live. Fix: added a time-gated dissolve in updateEmWavePropagationFrame reading cueTriggerMs("ghost_dissolve", ew.ghost_dissolve_at_ms), applying a closed-form ~1 s linear fade (pure fn of state-local ms, no accumulator => byte-identical under SET_TIME_FREEZE, scar #1) to BOTH the 3D ghost line material opacity AND its DOM x-tag opacity together, so the two vanish as one. Both are reset to full opacity on every state entry because the DOM x-tag element is SHARED with STATE_8 (energy) — without the reset a prior states dissolve would leave S8s tag invisible. Verified on pixels: ghost PRESENT at dense t12000 (it still does its Rule-16a job), fading at t14000, fully GONE at the frozen pin. Renderer-only.',
  'A Rule-16a misconception beat is only complete when the wrong belief is visibly DEFEATED AND REMOVED — a ghost/foil element that appears but never dissolves leaves the disproven idea as the last thing a sound-off teacher sees, which is worse than never showing it. Every authored dissolve/removal cue (*_dissolve_at_ms, *_clear_at_ms) MUST be read by the renderer: authoring the key and pushing it to the reveal pin in deriveStateMeta does NOT make it render, and the pin push actively MASKS the defect by moving the capture past a dissolve that never happens. When a removal cue is authored, grep the renderer for the key before trusting it; when the removed element shares a DOM node with another state, reset its opacity/display on state entry. Deterministic gate coverage is NOT evidence here — this defect passed 47/47.',
  'manual',
  'For any field_3d state carrying a wrong-expectation ghost/foil element, read the __frozen.png and confirm the ghost AND its x-tag are GONE at the held frame, then read a mid-state dense frame and confirm they were PRESENT earlier (a ghost that never appears is the opposite failure). If the ghost is still present at the pin, grep the renderer for the authored dissolve key — an authored *_dissolve_at_ms with no renderer read is dead code.',
  'FIXED',
  ARRAY['em_wave_propagation']::text[],
  ARRAY['src/lib/renderers/field_3d_renderer.ts']::text[],
  'ch8_loop_em_wave_propagation_2026-07-25',
  'incident'
);
