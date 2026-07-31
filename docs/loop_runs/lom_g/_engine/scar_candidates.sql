-- lom-g (off-axis forces) engine scar candidates — NOT APPLIED.
-- Trial constraint: no DB writes. These are SQL TEXT for the founder to apply.
-- Schema mirrors docs/loop_runs/lom/_engine/scar_candidates.sql (13 authored
-- columns of the 16-col engine_bug_queue). bug_class is the upsert key — check
-- for an existing row before applying; a recurrence is an UPDATE, not a dup.

-- Candidate 1 — MAJOR. Both defects below were caught by READING THE FIRST
-- BRING-UP FRAME, not by any assertion: all 25 harness checks passed on the
-- build that shipped them. A force arrow that is geometrically perfect and
-- optically absent is exactly the class the deterministic gates cannot see.
INSERT INTO engine_bug_queue (
    bug_class, title, severity, owner_cluster, root_cause, prevention_rule,
    probe_type, probe_logic, status, concepts_affected, fixed_in_files,
    discovered_in_session, row_type
) VALUES (
    'field3d_arrowhelper_shaft_invisible_when_collinear_with_apparatus_line',
    'A force arrow drawn along the apparatus line it describes is swallowed by it: ArrowHelper''s shaft is a 1px THREE.Line',
    'MAJOR',
    'peter_parker:renderer_primitives',
    'THREE.ArrowHelper draws its shaft as a THREE.Line, and WebGL ignores linewidth on essentially every desktop driver, so an arrow shaft is permanently 1px no matter what the code asks for. newtons_laws_body survives this because every arrow sits in its own perpendicular lane with nothing behind it. force_rig does not: a string tension acts ALONG its own string, so the arrow and a 0.022-radius white string cylinder are exactly collinear and the arrow renders as a bare floating head with no readable shaft — the taught object of the whole chapter, geometrically correct and optically absent. All 25 bring-up assertions passed on that build; only the frame showed it. The sibling defect found in the same frame: a hanger drawn straight DOWN the screen from a rim pulley at the top of a top-down table folds the string back over the table and buries the weight, its value label and the pulley in each other — a placement rule that is correct at one authored angle and wrong at another.',
    'When a new arrow is collinear with existing apparatus geometry: (a) push the arrow and its label IN FRONT of the apparatus plane (a small +z offset), and (b) make the apparatus line thinner and dimmer than the arrow, not the reverse — the arrow is the taught object, the string is context. More generally: any placement expressed in SCREEN axes (down, left) inside a scenario whose objects sit at authored ANGLES must be re-expressed in the object''s own radial/local frame, or it is correct only at the angle it was eyeballed at. And: READ THE FIRST BRING-UP FRAME before declaring a new scenario built — a full-pass assertion suite is not evidence that anything is visible.',
    'manual',
    'Open the first bring-up frame of any new scenario at full size and confirm every arrow the state declares is READABLE (shaft distinguishable, tip position proportional to magnitude), then sweep every authored angle a placement rule can take (0/90/180/270 at minimum) and confirm no label, weight or apparatus part overlaps another.',
    'OPEN',
    ARRAY['equilibrium_of_particles', 'uniform_circular_motion']::text[],
    ARRAY['src/lib/renderers/field_3d_renderer.ts']::text[],
    'lom-g Phase 0 — force_rig force_table bring-up 2026-07-30',
    'incident'
);

-- Candidate 2 — MAJOR. Sibling of the lom-a row
-- `spec_semi_implicit_euler_position_not_step_count_invariant`, but a DIFFERENT
-- failure: not fold-inexactness, outright divergence.
INSERT INTO engine_bug_queue (
    bug_class, title, severity, owner_cluster, root_cause, prevention_rule,
    probe_type, probe_logic, status, concepts_affected, fixed_in_files,
    discovered_in_session, row_type
) VALUES (
    'explicit_linear_drag_is_unstable_at_the_damping_a_legible_settle_requires',
    'A spec that prescribes explicit linear drag (v += (F - b*v)/m * dt) is unstable at exactly the damping a legible settle needs',
    'MAJOR',
    'peter_parker:renderer_primitives',
    'Explicit linear drag is stable only while b*h/m < 2. A damped particle whose settle must be VISIBLE (order 1.5 s, per the founder-approved force_rig spec) needs a time constant tau = b/K of a few tenths of a second, which for a light ring (m 0.05 kg, string stiffness K around 120-340 N/m) puts b near 40 and b*h/m near 13 at h = 1/60 s — six times over the stability bound. Taken literally the prescribed update diverges within a few frames. Separately, a damped system is NOT step-count invariant at all under any explicit whole-dt step (its exact solution is exponential in dt), so Rule 36 fold-exactness cannot hold by writing the update linearly and hoping.',
    'Treat the drag term IMPLICITLY — v_new = (v + (F/m)*h) / (1 + (b/m)*h) — which is unconditionally stable and leaves the reported free-body acceleration a = (F - b*v)/m unchanged, so nothing the HUD or an arrow shows is affected. And recover the fixed sub-step COUNT from the incoming dt (n = round(dt / h)) rather than integrating the whole dt in one step: N frames of one sub-step and one frame of N sub-steps then execute the identical arithmetic sequence, so Rule 36 fold-exactness is exact rather than approximate, and dt = 0 under a pin takes zero steps. Deriving n from the real dt keeps it rate-correct at any refresh rate — it is not an assumed frame delta.',
    'js_eval',
    'From identical initial conditions, step the engine 20 times with dt = h and separately 10 times with dt = 2h; assert |p_a - p_b| < 1e-12 AND |v_a - v_b| < 1e-12. Separately, run the damped settle for 10 s of sim time at the authored damping and assert |v| is monotonically bounded and |p| converges (a diverging integrator fails within a second).',
    'OPEN',
    ARRAY['equilibrium_of_particles', 'uniform_circular_motion']::text[],
    ARRAY['src/lib/renderers/field_3d_renderer.ts']::text[],
    'lom-g Phase 0 — force_rig force_table bring-up 2026-07-30',
    'directive'
);

-- ══════════════════════════════════════════════════════════════════════════
-- WHIRL BRANCH (dispatch 2, 2026-07-31)
-- ══════════════════════════════════════════════════════════════════════════

-- Candidate 3 — MAJOR. Found by READING THE FIRST WHIRL FRAME while all 42
-- harness checks passed. Same class as candidate 1 and it recurred one
-- dispatch later on the same engine, which is why it is worth a permanent row.
INSERT INTO engine_bug_queue (
    bug_class, title, severity, owner_cluster, root_cause, prevention_rule,
    probe_type, probe_logic, status, concepts_affected, fixed_in_files,
    discovered_in_session, row_type
) VALUES (
    'field3d_scenario_renders_offcentre_because_camera_target_is_not_authorable',
    'A rig hung from a pivot renders entirely in the top half of the frame: concept JSON can author camera_position but never the camera TARGET',
    'MAJOR',
    'peter_parker:renderer_primitives',
    'The field_3d camera always looks at the world origin, and a concept JSON can author camera_position but has no way to move the look-at target. Any scenario whose apparatus is naturally anchored at one end therefore renders off-centre and no amount of authoring can fix it: the conical pendulum hangs from a pivot at y = L, so the whole rig occupied the upper third of the frame with the lower half empty black. The same argument applies to any future rig with a floor, ceiling or single fixed mounting point. A second frame-only defect surfaced beside it in the same picture: a fixed-radius ground plane sized for the LONGEST authorable string swamped a short-string state, and then the same plane was too SMALL to hold the post-release path, so the bob visibly slid off the edge of the frictionless top a moment after the string was cut — which reads as flying through the air, the exact misreading that state exists to kill.',
    'A new scenario places ITSELF around the origin: compute a per-state world Y (or X/Z) shift from the authored geometry at state entry, apply it in ONE metres-to-world conversion helper that every mesh in the scenario goes through, and capture it ONCE per state so a later slider drag moves the object rather than sliding the whole rig. Ground/reference surfaces are sized from the state''s own physical scale, and from the LARGEST excursion the state can produce (a release/projectile window), never from a build-time constant.',
    'manual',
    'For every new field_3d scenario, render the first frame of each state at 1280x800 and confirm the apparatus bounding box is centred within +/-15% of the viewport in both axes, and that no moving element leaves its own reference surface during the state''s pinned reveal window.',
    'OPEN',
    ARRAY['uniform_circular_motion']::text[],
    ARRAY['src/lib/renderers/field_3d_renderer.ts']::text[],
    'lom-g Phase 0 — force_rig whirl bring-up 2026-07-31',
    'incident'
);

-- Candidate 4 — MODERATE. A probe-definition row: the comment-stripping idiom
-- every future "the renderer contains no X term" grep assertion must use.
INSERT INTO engine_bug_queue (
    bug_class, title, severity, owner_cluster, root_cause, prevention_rule,
    probe_type, probe_logic, status, concepts_affected, fixed_in_files,
    discovered_in_session, row_type
) VALUES (
    'harness_source_grep_comment_strip_defeated_by_crlf_line_endings',
    'A source-grep assertion that strips comments with an anchored regex silently strips nothing on a CRLF working tree',
    'MODERATE',
    'peter_parker:renderer_primitives',
    'The working tree is CRLF. Splitting a source file on "\n" leaves a trailing "\r" on every line, and JS treats "\r" as a line terminator, so an anchored comment-strip regex of the form /^\s*\/\/.*$/ matches nothing at all. The grep assertion then reports hits inside ordinary prose comments and reads as a real defect: the first run of the force_rig whirl harness reported two centrifugal terms in the renderer, both of which were historical notes in unrelated scenarios.',
    'Any harness that greps renderer SOURCE for a forbidden term splits on /\r?\n/, strips block comments first, and asserts on executable lines only. Prefer a RUNTIME assertion over a source grep wherever one exists: "no drawn arrow has a positive outward radial component, sampled right round a revolution" is evidence about the picture, while a source grep is evidence about the prose.',
    'js_eval',
    'src.replace(/\/\*[\s\S]*?\*\//g, "").split(/\r?\n/).map(l => l.replace(/^\s*\/\/.*$/, "").replace(/\s\/\/.*$/, "")).join("\n") — then assert the forbidden pattern has zero matches.',
    'OPEN',
    ARRAY['uniform_circular_motion']::text[],
    ARRAY['src/scripts/_scratch_fr_seams.ts']::text[],
    'lom-g Phase 0 — force_rig whirl bring-up 2026-07-31',
    'probe_definition'
);

-- Candidate 5 — MODERATE. Observed on the regression sample, NOT caused by any
-- lom-g change; proved by re-running THE EYE at the rollback point.
INSERT INTO engine_bug_queue (
    bug_class, title, severity, owner_cluster, root_cause, prevention_rule,
    probe_type, probe_logic, status, concepts_affected, fixed_in_files,
    discovered_in_session, row_type
) VALUES (
    'eye_h2_baseline_nondeterministic_electric_potential_meaning_state6',
    'electric_potential_meaning STATE_6 fails H2 with a percentage that changes run to run (2.31% / 2.90% vs a 2.0% tolerance)',
    'MODERATE',
    'ambiguous',
    'THE EYE reports an H2 pixel regression on electric_potential_meaning STATE_6 whose magnitude is NOT reproducible: three runs of the same code produced 2.90%, 2.90% and (at the rollback point e5c5d01, with the whirl diff stashed and the cache re-seeded) 2.31%. The failure therefore predates the lom-g whirl branch and is not caused by it, but it means the concept currently has no usable H2 signal: it fails a locked baseline on unmodified code, so a real regression on that state would be indistinguishable from the noise. The tray uses this concept as one of its two Amendment-5 regression samples, which makes the gap load-bearing.',
    'A frozen H2 baseline must be byte-reproducible by construction. Find the un-pinned element in STATE_6 (a wall-clock-driven or accumulated quantity that the SET_TIME_FREEZE pin does not hold) and make it a pure function of state-local t, then re-baseline. Until then, any tray using electric_potential_meaning as a regression sample must verify a suspected regression by re-running at the rollback point before calling it one.',
    'manual',
    'Run npm run visual:eyes -- electric_potential_meaning twice on identical code and compare the reported H2 percentage for STATE_6; a difference between runs is the defect.',
    'OPEN',
    ARRAY['electric_potential_meaning']::text[],
    ARRAY['src/lib/renderers/field_3d_renderer.ts']::text[],
    'lom-g Phase 0 — force_rig whirl bring-up 2026-07-31',
    'incident'
);

-- Candidate 6 — MAJOR. Authored colour never reached the arrows; fixed in this
-- dispatch (fix(engine-loop): force_rig honours authored string colour on arrows).
INSERT INTO engine_bug_queue (
    bug_class, title, severity, owner_cluster, root_cause, prevention_rule,
    probe_type, probe_logic, status, concepts_affected, fixed_in_files,
    discovered_in_session, row_type
) VALUES (
    'force_rig_string_color_ignored_arrows_take_index_palette',
    'Authored strings[].color never reached the tension arrows: a THREE.ArrowHelper has no .material, so the recolour guard was always false',
    'MAJOR',
    'peter_parker:field3d_surgeon',
    'applyForceRigState recoloured arrows with `if ((elementType === "fr_arrow" || "fr_comp" || "fr_arrow_label") && o.material && o.material.color) o.material.color.set(...)`. A THREE.ArrowHelper is a Group whose .line and .cone children each own a material; the Group itself has none, so the guard was false for every tension and component arrow and each one kept the build-time index palette FR_STRING_COLORS = ["#42A5F5","#EF5350","#66BB6A","#AB47BC"]. Two consequences, both pedagogical rather than cosmetic: equilibrium_of_particles STATE_3 authored two opposite PAIRS one colour each and rendered four unrelated colours under narration that says "two opposite pairs"; STATE_5/STATE_6 authored the two physically identical support cables (mirror images, same tension) the same colour and rendered them red and green, teaching a distinction that does not exist. Two further traps sat behind the first: (a) the arrow LABEL is a sprite whose ink is BAKED into its canvas texture, so setting material.color multiplies the new ink onto the old palette ink and onto the dark outline instead of replacing it — it must be re-drawn via its retained _pmColor with the material left white; (b) applyGlowEmphasis caches each material''s resting colour in userData._glowBaseCol and restores it every frame, and the existing cache-invalidation line only reached o.material — so a correct setColor() on an ArrowHelper would still be reverted one frame later unless the child materials'' caches are cleared too.',
    'Never gate a recolour on `o.material` when the object may be a composite helper. Recolour through a helper that prefers the object''s own API (`if (o.setColor) o.setColor(c); else if (o.material && o.material.color) o.material.color.set(c)`) — the pattern already used at bmPulseColor and the gauss flux-face arrows. Any per-state recolour of an object the glow pass touches must invalidate userData._glowBaseCol on ALL DESCENDANT materials (traverse), not just on o.material; leave _glowBaseOp alone so a re-cache mid-dim cannot strand the object at GLOW_DIM_OPACITY. A canvas-texture label is recoloured by redrawing its glyphs (_pmColor + updateLabelSpriteText), never by tinting its SpriteMaterial. Colour is a teaching claim: when a state authors two elements the same colour it is asserting they are the same thing, so a colour assertion belongs in the frame read, not only in the value gates — all 31 deterministic checks passed on the broken build.',
    'js_eval',
    'For each fr_arrow / fr_comp / fr_arrow_label with a stringIndex, compare the rendered colour to the authored one: `PM_frEngine.strings[ud.stringIndex].color` vs (arrow) `o.children.find(c => c.isMesh).material.color.getHexString()` / (label) `o._pmColor`. Assert equality for every string in every state, and additionally assert that any two strings authored the same colour render the same colour. Re-run one animation frame after applying the state so the glow pass has had a chance to revert the write.',
    'FIXED',
    ARRAY['equilibrium_of_particles']::text[],
    ARRAY['src/lib/renderers/field_3d_renderer.ts']::text[],
    'lom-g — force_rig arrow colour dispatch 2026-07-31',
    'incident'
);

-- Candidate 7 — CRITICAL. The capture path, not the solver: a really-integrated
-- scenario handed THE EYE its converged steady state at every pinned instant, so
-- seven motionless frames were certified 31/31. Fixed in this dispatch
-- (fix(engine-loop): force_rig reconstructs state at a pinned at_ms).
INSERT INTO engine_bug_queue (
    bug_class, title, severity, owner_cluster, root_cause, prevention_rule,
    probe_type, probe_logic, status, concepts_affected, fixed_in_files,
    discovered_in_session, row_type
) VALUES (
    'force_rig_not_reproducible_under_set_time_freeze_pin',
    'An integrating scenario with no RESET_TRAJECTORY rewind returns its converged steady state at every SET_TIME_FREEZE pin instead of the authored instant',
    'CRITICAL',
    'peter_parker:field3d_surgeon',
    'field_3d''s SET_TIME_FREEZE is pin-by-TARGET: virtual time advances forward one fixed 1/60 s step at a time up to the pin and then holds — it never runs backwards. That is only a rewind for a scenario whose pose is a CLOSED FORM of (time - stateStartTime), because the shared RESET_TRAJECTORY handler rebases stateStartTime and every closed form re-evaluates for free. force_rig is a genuine INTEGRATOR on both branches (the damped ring''s p/v, the whirl bob''s p3/v3 and its trail) plus a state-local clock eng.t_ms that drives phases[] and the param_ramp, and it was never hooked into RESET_TRAJECTORY. So the accumulators stayed exactly where the PREVIOUS capture had run them, and each pin photographed the converged pose: every frame of all seven equilibrium_of_particles states was motionless (ring centroid sub-pixel identical across 114 dense frames — (688.5, 352.3) at t=0 AND at t=16000), STATE_1 read the param_ramp''s END tension T1 = 49.00 N at the t=0 pin instead of the authored 29.40 N, and STATE_2''s authored release pose (0.115, 0.045) with SigmaF = 28.50 N showed as a centred ring at 0.02 N. D5/D6/D7 then returned a false PASS on seven dead states and the H2 baselines would have photographed steady state. newtons_laws_body had already hit this exact class and solved it (nlbResetTrajectory, engine_bug_queue coast_body_halts_mid_state_despite_authored_length_m) — force_rig was built without inheriting it, so this is a RECURRENCE of a known class in a new scenario rather than a new mechanism.',
    'Every field_3d scenario that INTEGRATES (as opposed to posing from a closed form of state-local t) must register an explicit rewind in the shared RESET_TRAJECTORY handler that restores its accumulators, its state-local clock and its one-shot latches to the state-entry condition — the nlbResetTrajectory contract: a REWIND, not a re-seed (live teacher slider values are preserved; an unseized param_ramp restores its authored "from" by re-evaluating at t = 0 through the same frApplyParam write path). Concretely, a new integrating scenario''s bring-up checklist gains one item alongside the existing six glue sites. The generic test, which needs no scenario knowledge: pin t = A, then t = B > A, then re-enter and pin t = A again — the two A frames must be byte-identical AND must differ from the B frame. Assertion suites cannot see this class: the 42-check force_rig harness drives a live free-running clock and passed 42/42 on the broken build, and THE EYE''s own gates read the dead frames as evidence. The capture-path guard added in screenshotter.ts commit ea16433 (a missed sim-time pin is now fatal) covers the sibling failure where the pin is never REACHED, but not this one, where the pin is reached and the scenario simply ignores it.',
    'js_eval',
    'Drive a state, then for each of two targets A < B post RESET_TRAJECTORY + REPLAY_ANIMATIONS + SET_TIME_FREEZE{at_ms} and poll window.PM_simTimeMs to the target. Read the scenario''s state-local clock and one integrated scalar (force_rig: window.PM_frTimeMs and PM_frEngine.p / PM_frEngine.sumF). Assert PM_frTimeMs === at_ms at each pin, assert the A-pin readings taken before and after the B pin are identical, and assert the A and B readings DIFFER. A scenario that returns the same pose at both A and B is returning steady state, not the pinned instant.',
    'FIXED',
    ARRAY['equilibrium_of_particles']::text[],
    ARRAY['src/lib/renderers/field_3d_renderer.ts']::text[],
    'lom-g — force_rig time-pin dispatch 2026-07-31',
    'incident'
);

-- Candidate 8 — RECURRENCE of Candidate 1. NOT a new row: bug_class is the
-- upsert key, so this is an UPDATE/reopen of the existing
-- field3d_arrowhelper_shaft_invisible_when_collinear_with_apparatus_line row.
-- Candidate 1's remedy (a) (the FR_ARROW_Z z-offset) shipped and was NOT
-- sufficient; clause (b) had never been applied at all. Fixed in this dispatch
-- (fix(engine-loop): field3d_arrowhelper_shaft_invisible_when_collinear_with_apparatus_line).
UPDATE engine_bug_queue SET
    severity = 'MAJOR',
    owner_cluster = 'peter_parker:field3d_surgeon',
    root_cause = root_cause || E'\n\nRECURRENCE 2026-07-31 (equilibrium_of_particles STATE_1 dense t16000, post-E1/E2): the three tension arrows STILL read as detached cone heads floating near the pulleys. The z-offset remedy (a) was applied and is insufficient BY CONSTRUCTION, because depth ordering was never the failure: a 1-device-pixel THREE.Line placed IN FRONT of a brighter, thicker apparatus line is still not an arrow. Any remedy that leaves the shaft as a THREE.Line is betting on driver linewidth support that essentially no desktop GL driver provides, so it can also regress silently on different hardware. Remedy (b) — thin AND dim the apparatus line relative to the arrow — had never been applied: the string was 0.013 world radius at 0.72 opacity in near-white #ECEFF1 against a coloured 1px arrow, i.e. the apparatus was WIDER and BRIGHTER than the taught vector along the same direction.',
    prevention_rule = 'An arrow that is collinear with apparatus geometry needs REAL GEOMETRY, not depth or colour tricks. (a) The shaft is a mesh cylinder parented to the ArrowHelper group (whose local +y IS the arrow direction, so setDirection carries it for free); the ArrowHelper keeps only the cone head, and the shaft is refitted to (len - headLen) in the same call that sets the length, so head and shaft always meet. Fixed WIDTH, never scaled for emphasis — Rule 29 intact, length still means magnitude alone. (b) The apparatus line is then made THINNER AND DIMMER than that shaft by construction, with the ratio written into the constants (FR_ARROW_SHAFT_R = 5x FR_STRING_R) so a later tweak to either cannot silently invert the ordering. (c) A group-level recolour helper must reach the new shaft explicitly: ArrowHelper.setColor() touches only .line and .cone, so a mesh shaft added as a child keeps the build-time palette forever unless recoloured by hand. (d) The z-offset alone is NOT a fix for this class and must not be recorded as one.',
    probe_logic = 'Render the state at full size and measure the arrow shaft''s drawn width in device pixels along its own direction, and the apparatus line''s width at the same point. Assert shaft_px >= 3 AND shaft_px > line_px AND shaft_alpha > line_alpha. A shaft that measures 1px is a THREE.Line and has already failed regardless of what any existence assertion reports. Sweep every authored angle (0/17/34/50/90/130/163/180/233/270) and both apparatus branches.',
    status = 'FIXED',
    fixed_in_files = ARRAY['src/lib/renderers/field_3d_renderer.ts']::text[],
    concepts_affected = ARRAY['equilibrium_of_particles', 'uniform_circular_motion']::text[]
WHERE bug_class = 'field3d_arrowhelper_shaft_invisible_when_collinear_with_apparatus_line';
