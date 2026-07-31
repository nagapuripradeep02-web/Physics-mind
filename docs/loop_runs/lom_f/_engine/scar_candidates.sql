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
