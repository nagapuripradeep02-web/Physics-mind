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
