-- lom-f (Laws of Motion, momentum) chapter loop — engine scar CANDIDATES.
-- NOT APPLIED. No agent executes these; the founder reviews and applies.
-- Upsert key is bug_class: a recurrence UPDATEs/reopens its row, never a duplicate INSERT.
-- Columns are the 13 authored columns of the 16-col engine_bug_queue schema.

-- ============================================================
-- SEAM A (momentum_bench physics core, 2026-07-31)
-- Row 1 is a defect the SEAM A dispatch hit and fixed inside its own diff.
-- Row 2 is an OPEN finding about this tray's regression sample, owner ambiguous.
-- ============================================================

INSERT INTO engine_bug_queue (
    bug_class, title, severity, owner_cluster, root_cause, prevention_rule,
    probe_type, probe_logic, status, concepts_affected, fixed_in_files,
    discovered_in_session, row_type
) VALUES (
    'field3d_compliant_contact_releases_on_its_own_entry_zero_and_rechatters_on_delta_zero',
    'A compliant-contact release test that reads the entry zero kills the impulse, and a non-strict re-arm chatters and breaks the Rule 36 fold',
    'MAJOR',
    'peter_parker:field3d_surgeon',
    'A compliant contact enters at overlap delta = 0, where an undamped spring reads F = k*delta = 0. A release test of the form "F <= 0 means the bodies are parting" therefore fires on the entry instant: every elastic contact ended on the frame it began, with zero impulse, zero contact duration and the incoming velocities untouched, while the engine still minted a contact event so the instrumentation looked alive. The twin defect is the re-arm: release lands on delta EXACTLY 0, and a blocked_until_clear guard cleared on delta <= 0 accepts that same value, so the pair re-engaged on the instant it released. The chatter burned the frames event-partition budget, minted five spurious zero-length events per collision, and left a different amount of leftover frame time to be swept up at 60 Hz than at 120 Hz - breaking the Rule 36 fold by 1e-2 m while every velocity still matched to 1e-15.',
    'A contact release test must ARM only after the contact force has genuinely risen above zero (an f <= 0 arriving while the pair is already separating still releases at once), and a re-arm guard must require STRICT separation (delta < 0), never delta <= 0. Assert BOTH on integrated quantities that a designed-zero instant cannot fool: the impulse area from the raw force samples against m*dv, and a 60 Hz vs 120 Hz fold across a span that CONTAINS the collision (with equal accumulated wall-clock in both runs, since the first frame after a pin release contributes 0 ms).',
    'js_eval',
    'Drive the scenario headlessly; for each contact event assert duration_ms > 0, samples.length > 2 and trapz(samples) within 0.5% of m*|dv|; assert exactly ONE event per collision; then run the same state for equal wall-clock at two frame times whose accumulated spans match exactly and assert every body s and v agree to 1e-9.',
    'FIXED',
    ARRAY['impulse','conservation_of_momentum']::text[],
    ARRAY['src/lib/renderers/field_3d_renderer.ts','src/scripts/_scratch_mb_seams.ts']::text[],
    'lom-f Phase 0 SEAM A (2026-07-31)',
    'incident'
);

INSERT INTO engine_bug_queue (
    bug_class, title, severity, owner_cluster, root_cause, prevention_rule,
    probe_type, probe_logic, status, concepts_affected, fixed_in_files,
    discovered_in_session, row_type
) VALUES (
    'gauss_law_sphere_state6_h2_off_baseline_and_unstable_between_runs',
    'gauss_law_sphere STATE_6 is off its locked H2 baseline and its diff magnitude swings between identical runs',
    'MODERATE',
    'ambiguous',
    'The gauss_law_sphere baselines were locked at 0ce9fb5 (2026-07-11) and 90 renderer commits have landed since, so STATE_6 is off-baseline on stock master-derived code. Proven with a control run: with the lom-f engine files stashed and the cache re-seeded from pre-change source, STATE_6 still failed H2 at 9.48%. The diff magnitude is also NOT reproducible between runs against the same locked baseline (non-frozen 9.48% / 8.30% / 3.03%, frozen 0.26% / 5.18% / 10.18% across three runs), which points at a genuinely non-deterministic STATE_6 rather than a stale baseline alone - its reveal pin is 28500 ms, the latest in the concept. A wandering FROZEN capture is the serious half: frozen frames are supposed to be byte-identical by construction under SET_TIME_FREEZE.',
    'Before using a concept as a regression sample, confirm its baselines still pass on the branch base; a sample whose baseline is 90 renderer commits old cannot distinguish a regression from vintage. Separately, a frozen capture that varies between runs means the states reveal pin does not land on a settled beat - re-derive the pin or find the residual accumulator.',
    'js_eval',
    'Run visual:eyes -- gauss_law_sphere twice against the SAME cache row and compare the per-state H2 percentages; any state whose __frozen percentage moves between the two runs has a non-deterministic frozen capture.',
    'OPEN',
    ARRAY['gauss_law_sphere']::text[],
    ARRAY[]::text[],
    'lom-f Phase 0 SEAM A (2026-07-31)',
    'incident'
);

-- ============================================================
-- SEAM B (momentum_bench instrument layer, 2026-07-31)
-- Both rows are defects THIS dispatch hit and fixed inside its own diff.
-- ============================================================

INSERT INTO engine_bug_queue (
    bug_class, title, severity, owner_cluster, root_cause, prevention_rule,
    probe_type, probe_logic, status, concepts_affected, fixed_in_files,
    discovered_in_session, row_type
) VALUES (
    'field3d_new_builder_references_wrapper_only_identifier_kills_the_frame_loop',
    'A renderer-body reference to a TypeScript-wrapper-only identifier (textColor) throws at build time and silently freezes the whole scenario',
    'MAJOR',
    'peter_parker:field3d_surgeon',
    'field_3d_renderer.ts is two scopes that LOOK like one file. The wrapper declares const textColor = config.pvl_colors?.text ?? ''#D4D4D8'' and interpolates it into the CSS block; FIELD_3D_RENDERER_CODE is a separate template literal spliced in with no interpolation, so textColor does not exist at runtime inside it. Every existing builder therefore re-declares its own local var textColor (~15 sites). A new builder that copies a panel cssText line WITHOUT copying that declaration throws ReferenceError inside buildXScenario(); the throw escapes animate()''s first frame, requestAnimationFrame is never re-armed, and the scenario freezes at its seeded initial conditions. Neither npm run check:renderer-syntax nor npx tsc --noEmit sees it (both are static; the identifier is only unbound at runtime). Worse, the failure mode is CAMOUFLAGED: with nothing moving, every conservation-style probe (Sigma-p constant, no bound clamp, Sigma-p = 0 for an explosion, frozen-state byte-stability) PASSES VACUOUSLY, so a bring-up harness can report a majority of green while the engine is dead.',
    'A new field_3d builder that creates any DOM panel declares its own local textColor from config.pvl_colors on its first line, exactly as every sibling builder does. More generally: no identifier from the TypeScript wrapper is in scope inside FIELD_3D_RENDERER_CODE. Bring-up harnesses must assert a POSITIVE, unmistakably dynamic quantity early (a body moved / the physical clock advanced) before trusting any conservation assertion, because a conservation law is satisfied by a dead engine.',
    'js_eval',
    'After the first ~10 animation ticks on any state that seeds a nonzero initial velocity, assert window.PM_<pfx>PhysTimeMs > 0 AND at least one body position changed from its seeded value; separately assert page pageerror count === 0 (a ReferenceError in the builder surfaces there and nowhere else).',
    'FIXED',
    ARRAY['(engine-only: momentum_bench SEAM B — no concept authored yet)']::text[],
    ARRAY['src/lib/renderers/field_3d_renderer.ts','src/scripts/_scratch_mb_seams.ts']::text[],
    'lom-f Phase 0 SEAM B (momentum_bench instrument layer) 2026-07-31',
    'incident'
);

INSERT INTO engine_bug_queue (
    bug_class, title, severity, owner_cluster, root_cause, prevention_rule,
    probe_type, probe_logic, status, concepts_affected, fixed_in_files,
    discovered_in_session, row_type
) VALUES (
    'field3d_new_scenario_bottom_left_instrument_collides_with_the_generic_legend',
    'A new scenario''s bottom-left instrument panel is overprinted by the generic #legend, which no scenario-local collision check can see',
    'MODERATE',
    'peter_parker:field3d_surgeon',
    'The shared #legend overlay is fixed bottom:8px left:8px and falls through to a bare state label plus a "Drag to rotate - Scroll to zoom" hint for any scenario whose id carries no charge/magnet substring. The new-scenario checklist''s "generic-legend suppression" step was not taken for momentum_bench in SEAM A, because SEAM A built no bottom-left overlay and the omission was invisible. SEAM B then placed the force-time trace panel at bottom-left (the only free zone: the HUD owns top-right, the badge top-left and #mb_sliders is reserved bottom-right), and the legend printed straight over the panel''s origin tick and its t (ms) axis label. A Rule-34d collision check that compares only the SCENARIO''S OWN panels reports NONE and is wrong; the defect is visible only in an actual frame.',
    'A new field_3d scenario adds itself to the generic #legend suppression chain in the SAME change that gives it any DOM overlay, not later. Any Rule-34d overlay-collision probe must include the SHARED chrome overlays (#caption, #legend, #sliders, #formula_overlay, #equation_panel) in its rectangle set, not just the scenario''s own panels.',
    'js_eval',
    'On every state, collect getBoundingClientRect() for the scenario''s own position:fixed panels AND for #caption/#legend/#sliders/#formula_overlay/#equation_panel, filtered to those with computed display !== none and width > 0; assert every pair of rectangles is disjoint.',
    'FIXED',
    ARRAY['(engine-only: momentum_bench SEAM B — no concept authored yet)']::text[],
    ARRAY['src/lib/renderers/field_3d_renderer.ts','src/scripts/_scratch_mb_seams.ts']::text[],
    'lom-f Phase 0 SEAM B (momentum_bench instrument layer) 2026-07-31',
    'incident'
);

-- ============================================================
-- SEAM C (momentum_bench control/sandbox layer + two-lane contacts, 2026-07-31)
-- Row 6 is a defect SEAM A shipped that SEAM C fixed inside its own diff, on a
--   founder ruling. Row 7 is a PROBE DEFINITION — a validator-authoring trap that
--   silently makes a new gate untestable, and it fooled this dispatch's first
--   harness attempt.
-- ============================================================

INSERT INTO engine_bug_queue (
    bug_class, title, severity, owner_cluster, root_cause, prevention_rule,
    probe_type, probe_logic, status, concepts_affected, fixed_in_files,
    discovered_in_session, row_type
) VALUES (
    'field3d_mutually_exclusive_config_keys_resolved_by_silent_precedence_with_no_validator_gate',
    'Two config keys documented as mutually exclusive were resolved by a silent renderer precedence rule and no validator gate, so the contradiction could ship',
    'MAJOR',
    'peter_parker:field3d_surgeon',
    'momentum_bench declared contact.sticks and contact.preload_m mutually exclusive in its config-surface comment, but nothing enforced it: the renderer silently picked sticks and the validator had no opinion at all. An author who wrote both got no error anywhere, and the chosen winner was the WORSE one - a pre-loaded spring under sticks releases and instantly latches, producing a completely dead sim (bodies motionless, zero impulse, an instrument panel full of zeros) with no message pointing at the cause. The general class: a documented exclusivity with no gate is not a constraint, it is a comment, and the silent-precedence resolution turns an authoring typo into a silent-failure debugging session.',
    'Every pair of config keys documented as mutually exclusive gets a NARROW validator refinement that REJECTS the combination (the validator is where contradictions die), plus a renderer fallback that logs console.error and honours whichever key degrades most visibly. Never a silent precedence rule alone. Keep the refinement targeted at the contradiction - do NOT mirror the whole scenario config surface in Zod, which drifts against the renderer TypeScript type.',
    'js_eval',
    'Call the schema directly (never by writing a fixture into src/data/concepts/): parse a REAL passing concept with only field_3d_config swapped, once with both keys and once with each alone; assert exactly one issue on the both-keys case whose message names the gate, and zero on each single-key control. Separately drive the renderer with both keys on its own page and assert a console error was logged AND the loud-failure key won.',
    'FIXED',
    ARRAY['impulse','conservation_of_momentum']::text[],
    ARRAY['src/lib/renderers/field_3d_renderer.ts','src/schemas/conceptJson.ts','src/scripts/_scratch_mb_seams.ts']::text[],
    'lom-f Phase 0 SEAM C (2026-07-31)',
    'incident'
);

INSERT INTO engine_bug_queue (
    bug_class, title, severity, owner_cluster, root_cause, prevention_rule,
    probe_type, probe_logic, status, concepts_affected, fixed_in_files,
    discovered_in_session, row_type
) VALUES (
    'zod_superrefine_gate_silently_never_runs_when_the_probe_fixture_fails_base_parse',
    'A new conceptJson superRefine gate proves nothing when probed with a minimal fixture - superRefine does not run if the base object fails',
    'MODERATE',
    'peter_parker:field3d_surgeon',
    'conceptJsonSchema is z.object(...).passthrough().superRefine(...). Zod runs superRefine ONLY after the base object validates, so a minimal hand-built probe fixture (concept_id plus the one block under test) fails on a dozen missing required fields and the new gate never executes. The probe then reports zero issues for the contradiction it was written to catch, which is INDISTINGUISHABLE from a gate that works and a config that is legal - a green harness proving nothing. This dispatch hit it on the first run: the sticks+preload probe read 0 issues for the bad case AND 0 for both controls, and only the symmetry of that result exposed it.',
    'A probe for any conceptJson superRefine gate must be built on a REAL, currently-passing concept file with only the block under test swapped in, and it must ASSERT that the base concept parses (baseOk === true) before trusting a zero-issue result. A gate probe that cannot show a positive control failing is not a probe.',
    'js_eval',
    'safeParse the unmodified base concept and assert success; then safeParse the same object with the offending block swapped in and assert exactly the expected issue count and message prefix on the paths under test, plus zero on each single-key control.',
    'OPEN',
    ARRAY['ALL']::text[],
    ARRAY['src/scripts/_scratch_mb_seams.ts']::text[],
    'lom-f Phase 0 SEAM C (2026-07-31)',
    'probe_definition'
);

-- ============================================================
-- PHASE 1 (impulse authoring, 2026-07-31) — quality-auditor BLOCKING findings.
-- Both are OPEN engine defects in the momentum_bench param_ramp write-path,
-- found by driving the real renderer headlessly (THE EYE was barred by the stop line).
-- Owner corrected to field3d_surgeon: renderer_primitives was renamed pcpl-surgeon
-- on 2026-07-31 and now owns the 2D renderers only.
-- ============================================================

INSERT INTO engine_bug_queue (
    bug_class, title, severity, owner_cluster, root_cause, prevention_rule,
    probe_type, probe_logic, status, concepts_affected, fixed_in_files,
    discovered_in_session, row_type
) VALUES (
    'field3d_param_ramp_velocity_write_cancels_the_rebound_every_frame',
    'A per-frame param_ramp write to v1 overwrites the post-rebound velocity, so the ball can never leave the wall',
    'MAJOR',
    'peter_parker:field3d_surgeon',
    'mbRunParamRamp calls mbSetParam on EVERY frame with no churn guard and no early-out once the ramp saturates, and mbSetParam overwrites the live velocity whenever the body is not currently engaged (b.v = val when !held[b.id]). After a rebound the ball carries a NEGATIVE velocity and is momentarily not engaged, so the very next frame rewrites it back to the positive ramp value. The ball therefore re-strikes the wall roughly every one contact duration forever: measured 15 contact events where about 4 belong, clustered exactly 71 ms apart, with the ball travelling nowhere between them. A second symptom of the same cause is that the free ball visibly ACCELERATES during its approach with nothing touching it, contradicting the concepts own narration and Rule 32a. Control: the same apparatus with no ramp produces 5 clean single bounces at 70.2 ms and 134.16 N each, so the integrator is exact and the ramp write-path is the sole differentiator. No authored JSON value avoids this while param_ramp.param is v1.',
    'A ramp that writes a STATE variable (velocity, position) rather than a PARAMETER (stiffness, mass) must write only when the value actually changes, and must stop writing once the ramp saturates. More generally: a bring-up harness that proves param_ramp for ONE value of a closed enum has proved it for one value, not for the enum - test every member (v1, k, m2), and test across a CONTACT rather than only between contacts.',
    'js_eval',
    'Drive a wall_impact state with param_ramp.param = v1 headlessly and count contact events over a fixed span; assert the count equals the number of repeat cycles (not a multiple of it), assert no two event start times are separated by less than one full contact duration, and assert the balls speed is CONSTANT on every pre-contact frame.',
    'OPEN',
    ARRAY['impulse']::text[],
    ARRAY[]::text[],
    'lom-f Phase 1 impulse audit (2026-07-31)',
    'incident'
);

INSERT INTO engine_bug_queue (
    bug_class, title, severity, owner_cluster, root_cause, prevention_rule,
    probe_type, probe_logic, status, concepts_affected, fixed_in_files,
    discovered_in_session, row_type
) VALUES (
    'field3d_stiffness_write_during_an_engaged_contact_breaks_elasticity',
    'A k write landing mid-contact changes stiffness underneath an already-solved contact segment, so the bounce is neither elastic nor any valid closed form',
    'MAJOR',
    'peter_parker:field3d_surgeon',
    'mbSetParam writes eng.contacts[0].k unconditionally, including while c.engaged is true. The compliant contact is solved as a closed-form damped oscillator segment, so mutating k partway through leaves the departing state inconsistent with BOTH the old and the new stiffness. Measured on a k-ramp state: first event k=1601, duration 82.8 ms, F_peak 111.13 N, area 5.8136 N.s, ball departs at -2.811 m/s instead of -3.000. The closed forms for a FIXED k=1601 give F_peak 120.04 N and t_c 78.5 ms - the observed pair matches neither, which is the signature of the mid-contact rewrite. The concept asserts perfect elasticity (c = 0, |dp| = 2mv) and a fixed 6.00 N.s area, so the sim silently contradicts its own narration on the first bounce of the state.',
    'A parameter that defines the contact response (k, c, natural_length) must never be mutated while that contact is engaged - defer the write to the next disengaged frame, or re-solve the segment from the current overlap. Assert it: no contact event may end with a departing speed differing from its closed form for the k that was in force when it began.',
    'js_eval',
    'Ramp k across a state containing contacts; for every recorded contact event assert F_peak and duration match the closed forms v*sqrt(k*m) and pi*sqrt(m/k) for a SINGLE k, and that the elastic departing speed equals the arriving speed to within 0.5%.',
    'OPEN',
    ARRAY['impulse']::text[],
    ARRAY[]::text[],
    'lom-f Phase 1 impulse audit (2026-07-31)',
    'incident'
);

-- ============================================================
-- PHASE 1 FIX (mbSetParam write-path, 2026-07-31) — field3d_surgeon dispatch
-- "mbSetParam writes are not state-guarded" (both manifestations, one commit).
-- Rows 1 and 2 UPDATE the two OPEN rows above (bug_class is the upsert key —
-- these are the SAME defects, now fixed, never duplicate INSERTs).
-- Row 3 is a NEW probe_definition: the durable invariant the fix installs.
-- ============================================================

UPDATE engine_bug_queue SET
    status = 'FIXED',
    fixed_in_files = ARRAY['src/lib/renderers/field_3d_renderer.ts','src/scripts/_scratch_mb_seams.ts']::text[],
    root_cause = root_cause || ' FIXED 2026-07-31: mbSetParam now writes the LIVE velocity only while the body is STAGED — armed and still on its way in. A new per-body flag b.spent is set the instant the body meets a contact (mbMarkSpent, called from mbEngageContact and from the preload arming) and cleared by mbSeedKinematics, i.e. by exactly the arming that re-launches it, so it never survives a re-arm or a rewind and no state is kept across a pin. b.v0 is still written unconditionally, so the authored re-arm intent (each repeat cycle launches with the new ramped value) is untouched. Measured on the real renderer, v1 ramped 1.5->4.0 m/s over 3000 ms with no repeat: BEFORE 41 contact events in 3856 ms and 79 of 198 post-rebound frames carrying v >= 0, the ball pinned at the ramp value forever; AFTER exactly 1 event, 0 of 198 frames with v >= 0, the ball still departing at -1.9933 m/s while v0 had re-armed to 4.0000. With repeat_every_ms=1500 over 4 armed cycles: BEFORE 47 events; AFTER exactly 4, each peak matching v(t)*sqrt(k*mu) to within 0.31%.'
WHERE bug_class = 'field3d_param_ramp_velocity_write_cancels_the_rebound_every_frame';

UPDATE engine_bug_queue SET
    status = 'FIXED',
    fixed_in_files = ARRAY['src/lib/renderers/field_3d_renderer.ts','src/scripts/_scratch_mb_seams.ts']::text[],
    root_cause = root_cause || ' FIXED 2026-07-31: every write into a contact that is engaged (and not latched) is now DEFERRED — per CONTACT, not globally, so in a two-lane state a busy lane never blocks its free neighbour. Because a param_ramp recomputes from the state clock every frame, the deferred value lands by itself on the first free frame with nothing kept anywhere (measured: exactly one lagging frame per segment, the release frame itself, self-healing on the very next frame). The SAME guard was extended to the MASS branch in the same commit: m sits inside the reduced mass the segment was solved with AND inside p = mv, so an unguarded mid-contact mass write moved Sigma-p instantly — measured on an m2 ramp, Sigma-p jumped 3.20% / 2.79% / 2.22% across the three contacts BEFORE and is conserved to 1.5e-14% AFTER. Measured for k, ramped 2000->200 N/m across four contacts: BEFORE k drifted 28.8 / 36.0 / 43.2 / 86.4 N/m WITHIN single engaged segments and the segments missed their own closed forms by up to 9.27% (t_c) and 10.88% (F_peak); AFTER the jitter is exactly 0 and every segment matches pi*sqrt(mu/k) and v*sqrt(k*mu) to 0.00%.'
WHERE bug_class = 'field3d_stiffness_write_during_an_engaged_contact_breaks_elasticity';

INSERT INTO engine_bug_queue (
    bug_class, title, severity, owner_cluster, root_cause, prevention_rule,
    probe_type, probe_logic, status, concepts_affected, fixed_in_files,
    discovered_in_session, row_type
) VALUES (
    'field3d_live_write_path_must_be_guarded_by_engine_state_not_by_caller',
    'A single write-path shared by a drag, a PARAM_UPDATE and a ramp must ask what the ENGINE is doing, never who is writing',
    'MAJOR',
    'peter_parker:field3d_surgeon',
    'A live-instrument scenario funnels a teacher drag, a PARAM_UPDATE and a scripted param_ramp through ONE setter so the physics, the slider position and the row text can never disagree. That is correct and load-bearing, and it means the setter is called on EVERY frame by the ramp. Any value the setter writes that the engine also OWNS - a live velocity mid-flight, a stiffness or a mass inside a contact segment the solver has already committed to - is therefore rewritten 60 times a second underneath the physics. The guard cannot be per-caller (that forks the path and re-opens the disagreement it exists to prevent); it must be a question about ENGINE STATE, asked identically for every caller: is this body still staged, is this contact mid-segment. Two independent MAJOR defects in one function came from asking too narrow a version of that question (engaged-right-now), which is true for one frame and false for the rest of the flight.',
    'Every branch of a shared live write-path declares, in code, which engine state makes the write unsafe, and each branch is covered by a probe that ramps THAT branch straight through the unsafe window. A ramp harness that exercises one member of a closed param enum, and samples only between events, has proved one member between events - nothing more.',
    'js_eval',
    'For each member of the ramp param enum, drive a state whose ramp window spans a contact and sample every frame: (1) group consecutive engaged frames into segments and assert every engine-owned value is EXACTLY constant within each segment while still moving between them; (2) assert each segment obeys the closed forms for the value it engaged with (t_c = pi*sqrt(mu/k), F_peak = dv*sqrt(k*mu)) and conserves Sigma-p from p_before to p_after; (3) assert a rebounding body is never re-accelerated - contact-event count equals the number of armed repeat cycles, and no post-release frame shows the departure velocity reversed.',
    'FIXED',
    ARRAY['impulse']::text[],
    ARRAY['src/lib/renderers/field_3d_renderer.ts','src/scripts/_scratch_mb_seams.ts']::text[],
    'lom-f Phase 1 field3d_surgeon dispatch (2026-07-31)',
    'probe_definition'
);
