-- ============================================================================
-- 2026-04-27 (session 38): engine_bug_queue visual-categories migration
-- ----------------------------------------------------------------------------
-- Extends engine_bug_queue to support the Visual Validator (Engine E29) — the
-- post-render vision-model gate that inspects every simulation before it ships
-- to a student. Adds:
--   * visual category (A/B/C/D/E/F/G) per the 7-category rubric in
--     src/lib/validators/visual/spec.ts
--   * screenshot_url for the failing render captured by Playwright
--   * vision_evidence (JSONB) for the structured Sonnet-vision response
--   * state_id for the specific STATE_N where the visual bug surfaced
--   * 'vision_model' probe_type and 'peter_parker:visual_validator' owner
--   * 38 seeded bug_class rows — one per check in the visual rubric (6+7+5+4+6+4+6)
--
-- Probe-type policy:
--   - F1 (state desync) and F4 (PARAM_UPDATE round-trip) use 'js_eval' because
--     vision cannot reliably measure ms-scale postMessage timing.
--   - All other 36 visual rows use 'vision_model'.
--
-- Idempotent: ADD COLUMN IF NOT EXISTS, INSERT ... ON CONFLICT (bug_class)
-- DO NOTHING so re-running the migration is a no-op.
--
-- See plan: ~/.claude/plans/can-you-pls-plan-staged-torvalds.md (Day 1)
-- See spec: src/lib/validators/visual/spec.ts
-- See doc:  docs/VISUAL_VALIDATOR_SPEC.md
-- ============================================================================

-- ── Step 1: extend probe_type CHECK to allow 'vision_model' ──────────────────
ALTER TABLE engine_bug_queue
    DROP CONSTRAINT IF EXISTS engine_bug_queue_probe_type_check;

ALTER TABLE engine_bug_queue
    ADD CONSTRAINT engine_bug_queue_probe_type_check
        CHECK (probe_type IN ('sql', 'js_eval', 'manual', 'vision_model'));

-- ── Step 2: extend owner_cluster CHECK to allow visual_validator ─────────────
ALTER TABLE engine_bug_queue
    DROP CONSTRAINT IF EXISTS engine_bug_queue_owner_cluster_check;

ALTER TABLE engine_bug_queue
    ADD CONSTRAINT engine_bug_queue_owner_cluster_check
        CHECK (owner_cluster IN (
            'alex:architect',
            'alex:physics_author',
            'alex:json_author',
            'peter_parker:renderer_primitives',
            'peter_parker:runtime_generation',
            'peter_parker:visual_validator',
            'ambiguous'
        ));

-- ── Step 3: add visual-validator metadata columns ────────────────────────────
ALTER TABLE engine_bug_queue
    ADD COLUMN IF NOT EXISTS visual_category   TEXT
        CHECK (visual_category IN ('A','B','C','D','E','F','G') OR visual_category IS NULL);

ALTER TABLE engine_bug_queue
    ADD COLUMN IF NOT EXISTS state_id          TEXT;

ALTER TABLE engine_bug_queue
    ADD COLUMN IF NOT EXISTS screenshot_url    TEXT;

ALTER TABLE engine_bug_queue
    ADD COLUMN IF NOT EXISTS vision_evidence   JSONB;

CREATE INDEX IF NOT EXISTS idx_ebq_visual_category ON engine_bug_queue(visual_category)
    WHERE visual_category IS NOT NULL;

-- ── Step 4: seed the 35 visual bug classes ───────────────────────────────────
-- Each row: bug_class, title, severity, owner, root_cause, prevention_rule,
-- probe_type=vision_model, probe_logic, visual_category.
-- All start status='OPEN' and get FIXED only when first concept passes all 35.

INSERT INTO engine_bug_queue (
    bug_class, title, severity, owner_cluster, root_cause, prevention_rule,
    probe_type, probe_logic, status, visual_category, discovered_in_session
) VALUES
-- ── Category A — Layout integrity ─────────────────────────────────────────
('VISUAL_TEXT_OVERLAP',
 'Text element overlaps another text element in rendered sim',
 'MAJOR', 'peter_parker:visual_validator',
 'Renderer placed two labels at the same anchor without collision check; OR Sonnet brief gave overlapping positions; OR scaling crushed labels into each other.',
 'Use anchor offsets (gap >= 12px) when placing two labels in the same zone. Prefer CALLOUT_ZONE_R for secondary labels. Never use raw pixel coordinates.',
 'vision_model',
 'Cat A1 — Vision asks: "Are any two text elements overlapping with less than 4px gap between bounding boxes?" Returns A1=true on failure with pixel-coordinate evidence.',
 'OPEN', 'A', 'session_38'),

('VISUAL_TEXT_INTRUDES_PRIMITIVE',
 'Text intrudes into a body, surface, or arrow path',
 'MAJOR', 'peter_parker:visual_validator',
 'Label authored without zone constraint; placed inside a primitive bounding box.',
 'Labels live in CALLOUT_ZONE_R/L or above/below primitives — never inside. Use anchor:"primitive_id.top" + offset:{dir:"up", gap:8}.',
 'vision_model',
 'Cat A2 — Vision asks: "Does any text element have its centroid inside the bounding box of a body, surface, or arrow primitive?"',
 'OPEN', 'A', 'session_38'),

('VISUAL_OUT_OF_BOUNDS',
 'Primitive (arrow head, body edge, label) is outside the canvas frame',
 'MAJOR', 'peter_parker:visual_validator',
 'UNIT_TO_PX scale chose magnitudes too large for the canvas; OR position offsets pushed primitives off-screen.',
 'Compute UNIT_TO_PX = MAIN_ZONE.height * 0.70 / maxMagnitude before placing arrows. Validate every primitive bounding box stays inside canvas with 4px margin.',
 'vision_model',
 'Cat A3 — Vision asks: "Does any primitive (arrow head/tail, body edge, label) extend outside the visible canvas frame?"',
 'OPEN', 'A', 'session_38'),

('VISUAL_LABEL_UNREADABLE',
 'Label font size too small or contrast too low',
 'MODERATE', 'peter_parker:visual_validator',
 'Renderer applied a global text scale; OR label color is too close to background; OR zoom-out made effective font < 12px.',
 'Set label font_size >= 14px in source. Use color contrast 4.5:1 minimum against canvas background (#0a0a14).',
 'vision_model',
 'Cat A4 — Vision asks: "Is any label below 12px effective size or below 4.5:1 contrast against background?"',
 'OPEN', 'A', 'session_38'),

('VISUAL_OVERCROWDED',
 'MAIN_ZONE has insufficient whitespace; primitives stacked or piled',
 'MODERATE', 'peter_parker:visual_validator',
 'Author placed too many forces/labels in one state; OR no annotation distribution across zones.',
 'Each state introduces <= 2 new visual elements (Rule E6). Distribute annotations across CALLOUT_ZONE_R, CALLOUT_ZONE_L, BOTTOM_ZONE.',
 'vision_model',
 'Cat A5 — Vision asks: "Is more than 70% of the MAIN_ZONE filled, or are 3+ annotations stacked vertically in the same column?"',
 'OPEN', 'A', 'session_38'),

('VISUAL_ARROW_HEAD_BURIED',
 'Force arrow head buried inside another primitive — direction unclear',
 'MAJOR', 'peter_parker:visual_validator',
 'Two arrows from the same anchor with overlapping directions; OR arrow drawn with body sitting on the head.',
 'Use draw_from variants (body_top, body_left) to fan arrows out from a single anchor. Verify arrow length leaves head visible after primitive overlap.',
 'vision_model',
 'Cat A6 — Vision asks: "Is any force_arrow head visually obscured by another primitive, making its direction ambiguous?"',
 'OPEN', 'A', 'session_38'),

-- ── Category B — Physics correctness ──────────────────────────────────────
('PHYSICS_DIRECTION_WRONG',
 'Rendered force_arrow direction does not match physics_engine_config angle',
 'CRITICAL', 'peter_parker:visual_validator',
 'Renderer angle bug; OR config angle declared in degrees but interpreted as radians (or vice versa); OR sign flip in y-axis convention.',
 'Always declare arrow direction in degrees (0-360) in screen coords. Renderer must respect convention: 0=right, 90=up, 180=left, 270=down.',
 'vision_model',
 'Cat B1 — Vision asks: "For each force_arrow in this state, does the rendered angle match the angle declared in physics_engine_config.forces[].direction within 2 degrees?"',
 'OPEN', 'B', 'session_38'),

('PHYSICS_MAGNITUDE_WRONG',
 'Arrow length not proportional to force magnitude',
 'CRITICAL', 'peter_parker:visual_validator',
 'UNIT_TO_PX not used consistently across all arrows; OR single arrow scaled differently than others; OR magnitude declared but renderer used a fixed length.',
 'All force_arrows in one state share the same UNIT_TO_PX. Two arrows with magnitudes 5N and 10N must visually differ by 2x length (within 10%).',
 'vision_model',
 'Cat B2 — Vision asks: "Are arrow lengths visually proportional to declared magnitudes? Compare each pair: ratio of lengths should match ratio of magnitudes within 10%."',
 'OPEN', 'B', 'session_38'),

('PHYSICS_EQUILIBRIUM_BROKEN',
 'Net force = 0 declared but arrows do not visually sum to zero',
 'CRITICAL', 'peter_parker:visual_validator',
 'Author declared equilibrium state but arrows authored with off-balance magnitudes/angles; OR rounding in renderer.',
 'When physics_engine_config.net_force_zero is true, head-to-tail vector sum must close back to origin within 5% of longest vector.',
 'vision_model',
 'Cat B3 — Vision asks: "If this state declares equilibrium, do the force vectors arranged head-to-tail close back to the starting point within 5% tolerance?"',
 'OPEN', 'B', 'session_38'),

('PHYSICS_GRAVITY_WRONG',
 'Gravity / weight vector does not point straight down',
 'CRITICAL', 'peter_parker:visual_validator',
 'Inclined plane confusion — author rotated mg with the surface; OR canvas y-axis flip.',
 'mg ALWAYS points to canvas-bottom (270 degrees screen coords). Even on inclined planes, mg is rendered straight down — components mg sin theta and mg cos theta are SEPARATE arrows.',
 'vision_model',
 'Cat B4 — Vision asks: "Does every mg / weight vector in this state point exactly to canvas-bottom (270 degrees screen) within 2 degrees?"',
 'OPEN', 'B', 'session_38'),

('PHYSICS_NORMAL_NOT_PERPENDICULAR',
 'Normal force vector not perpendicular to surface',
 'CRITICAL', 'peter_parker:visual_validator',
 'Surface angle and normal angle drift in author authoring; OR renderer ignored surface rotation.',
 'Normal force angle = 90 + surface_angle (world frame). Renderer must read surface.angle when computing normal direction.',
 'vision_model',
 'Cat B5 — Vision asks: "Is the normal force vector exactly 90 degrees from the surface orientation within 2 degrees?"',
 'OPEN', 'B', 'session_38'),

('PHYSICS_FRICTION_WRONG_DIR',
 'Friction arrow does not oppose declared motion direction',
 'CRITICAL', 'peter_parker:visual_validator',
 'Author confused with motion vs intended motion; OR static-vs-kinetic confusion in static case.',
 'Kinetic friction opposes velocity 180 +/- 5 degrees. Static friction opposes intended motion. Read physics_engine_config.motion_direction.',
 'vision_model',
 'Cat B6 — Vision asks: "Is the friction arrow direction within 175-185 degrees of the declared motion direction?"',
 'OPEN', 'B', 'session_38'),

('PHYSICS_PHANTOM_VECTOR',
 'Rendered arrow does not appear in physics_engine_config.forces[]',
 'MAJOR', 'peter_parker:visual_validator',
 'Renderer drew an extra arrow not declared; OR a leftover from previous state not cleared.',
 'Renderer must enumerate forces ONLY from physics_engine_config.forces[]. State transitions must clear previous-state arrows.',
 'vision_model',
 'Cat B7 — Vision asks: "Does every visible arrow in this state correspond to a named entry in physics_engine_config.forces[]?"',
 'OPEN', 'B', 'session_38'),

-- ── Category C — Choreography correctness ─────────────────────────────────
('CHOREOGRAPHY_TELEPORT',
 'Body teleports between consecutive states without motion_path',
 'MAJOR', 'peter_parker:visual_validator',
 'Position changed between states without animation; OR motion_path primitive missing.',
 'When body.id changes position by > 30% canvas width across states, declare a motion_path primitive with start/end and path type.',
 'vision_model',
 'Cat C1 — Vision asks: "Compare STATE_N and STATE_{N+1}. Did any body.id move > 30% canvas width without a declared motion_path primitive between them?"',
 'OPEN', 'C', 'session_38'),

('CHOREOGRAPHY_SCALE_DRIFT',
 'Body changes size > 10% between states without declared transformation',
 'MODERATE', 'peter_parker:visual_validator',
 'Renderer recomputed UNIT_TO_PX between states; OR author varied body.size between states without semantic reason.',
 'Body size constant unless physics_behavior declares scaling (e.g., spring compression). UNIT_TO_PX should be state-stable.',
 'vision_model',
 'Cat C2 — Vision asks: "Did any body.id change visual size by > 10% between consecutive states without a physics_behavior reason?"',
 'OPEN', 'C', 'session_38'),

('CHOREOGRAPHY_CAMERA_SNAP',
 'Canvas zoom or pan snaps discontinuously between states',
 'MODERATE', 'peter_parker:visual_validator',
 'Renderer rebuilt camera framing per state; OR scale jump in UNIT_TO_PX.',
 'Camera framing static across states. If zoom needed (e.g., focal close-up), animate via choreography_sequence transition, do not snap.',
 'vision_model',
 'Cat C3 — Vision asks: "Does the canvas viewport (zoom or pan) jump discontinuously between any pair of consecutive states?"',
 'OPEN', 'C', 'session_38'),

('CHOREOGRAPHY_FOCAL_DRIFT',
 'focal_primitive_id changes incoherently across states',
 'MODERATE', 'peter_parker:visual_validator',
 'Author did not align focal_primitive_id with teaching script narration.',
 'Each state declares one focal_primitive_id matching the teacher_script.tts_sentences emphasis for that state.',
 'vision_model',
 'Cat C4 — Vision asks: "Does the focal-primitive highlighting in this state match what the teacher_script narration emphasizes?"',
 'OPEN', 'C', 'session_38'),

('CHOREOGRAPHY_ANNOTATION_FLICKER',
 'Annotation introduced in STATE_N vanishes in STATE_{N+1}',
 'MODERATE', 'peter_parker:visual_validator',
 'Author did not carry annotation forward; OR is_persistent: false set unintentionally.',
 'Annotations persist across states by default. Set is_persistent: false explicitly only when intentional.',
 'vision_model',
 'Cat C5 — Vision asks: "Did any annotation present in STATE_N disappear in STATE_{N+1} without is_persistent:false?"',
 'OPEN', 'C', 'session_38'),

-- ── Category D — Animation correctness ────────────────────────────────────
('ANIMATION_NO_PLAYBACK',
 'Simulation does not animate — appears as a static image',
 'CRITICAL', 'peter_parker:visual_validator',
 'p5.js draw loop crashed; OR PM_currentState not advancing; OR all states have advance_mode:auto_after_tts but TTS not firing.',
 'Verify p5.js draw() loop runs; verify state advance_mode variety (>=2 distinct values). Test in browser before validating.',
 'vision_model',
 'Cat D1 — Vision asks: "Comparing frames at t=0s and t=10s, does at least 30% of the pixel area change? (No motion = failure unless static-by-design.)"',
 'OPEN', 'D', 'session_38'),

('ANIMATION_JITTER',
 'Body position jumps mid-animation outside smooth motion path',
 'MAJOR', 'peter_parker:visual_validator',
 'Renderer interpolation broken; OR motion_path interpreted incorrectly; OR mid-state state-machine race.',
 'motion_path declares path:linear|parabolic|circular — renderer must interpolate smoothly. No discrete frame skips.',
 'vision_model',
 'Cat D2 — Vision asks: "Across 5 captured frames, does any body position fall outside the convex hull of (previous frame, next frame)?"',
 'OPEN', 'D', 'session_38'),

('ANIMATION_TIMING_DRIFT',
 'State duration does not match teacher_script narration duration',
 'MODERATE', 'peter_parker:visual_validator',
 'TTS duration_ms not respected by state machine; OR advance_mode:manual_click bypassed timing.',
 'When teacher_script.tts_sentences declares duration_ms, state visuals remain for duration_ms +/- 1000ms.',
 'vision_model',
 'Cat D3 — Vision asks: "Did STATE_N visuals remain for the duration declared in teacher_script (within +/- 1s tolerance)?"',
 'OPEN', 'D', 'session_38'),

('ANIMATION_STUCK',
 'Simulation freezes mid-state for > 3 seconds — likely render crash',
 'CRITICAL', 'peter_parker:visual_validator',
 'p5.js exception inside draw(); OR async fetch blocking the frame; OR infinite loop.',
 'Wrap state-transition handlers in try/catch. Surface SIM_ERROR via postMessage. Renderer must not block on async work in draw().',
 'vision_model',
 'Cat D4 — Vision asks: "Does the simulation hold the same frame for more than 3 seconds inside a single state? (Indicates a render crash.)"',
 'OPEN', 'D', 'session_38'),

-- ── Category E — Pedagogical quality ──────────────────────────────────────
('PEDAGOGY_CONCEPT_UNCLEAR',
 'Simulation does not actually teach the concept to a Class 11 student',
 'CRITICAL', 'alex:json_author',
 'Authoring chose wrong real-world anchor; OR states do not build on each other; OR concept dumped without scaffolding.',
 'Storyboard 5+ states: hook -> mechanism -> formula -> depth -> edge. Each state introduces <= 2 new ideas. Real-world anchor visible from STATE_1.',
 'vision_model',
 'Cat E1 — Vision asks: "Acting as a Class 11 physics teacher, can a student watching ONLY this simulation correctly explain the concept afterward? Answer: yes / partially / no."',
 'OPEN', 'E', 'session_38'),

('PEDAGOGY_NO_FOCAL',
 'No clear focal element in the state — viewer eye has nowhere to land',
 'MAJOR', 'alex:json_author',
 'focal_primitive_id missing or pointing to non-rendered element.',
 'Every state declares focal_primitive_id matching a rendered primitive. Renderer applies a halo / border / color shift to that primitive.',
 'vision_model',
 'Cat E2 — Vision asks: "Is there exactly one visually highlighted element drawing attention in this state? If multiple or none, fail."',
 'OPEN', 'E', 'session_38'),

('PEDAGOGY_NO_ANCHOR',
 'Real-world Indian context anchor not visually represented',
 'MAJOR', 'alex:json_author',
 'Author declared anchor in JSON metadata but did not render it as a label/sketch in the scene.',
 'Anchor (Mumbai train, Manali highway, etc.) appears as a label, sketch, or annotation in at least the first 2 states.',
 'vision_model',
 'Cat E3 — Vision asks: "Is the real-world Indian context (declared in JSON metadata) visually represented in the simulation? Look for labels, environmental sketches, or annotations."',
 'OPEN', 'E', 'session_38'),

('PEDAGOGY_EPICC_NEUTRAL_NOT_WRONG',
 'EPIC-C STATE_1 shows neutral baseline instead of explicit wrong belief',
 'CRITICAL', 'alex:json_author',
 'Author treated EPIC-C as another EPIC-L; STATE_1 not explicitly the misconception.',
 'EPIC-C STATE_1 ALWAYS shows the wrong belief explicitly (CLAUDE.md Rule 16). Subsequent states correct it.',
 'vision_model',
 'Cat E4 — Vision asks: "For this EPIC-C variant, does STATE_1 visually depict the WRONG belief explicitly (e.g., wrong arrow direction with a red X), or just a neutral baseline? (Neutral = fail.)"',
 'OPEN', 'E', 'session_38'),

('PEDAGOGY_FORMULA_MISSING',
 'Teacher script references formula but no formula_box rendered on screen',
 'MAJOR', 'alex:json_author',
 'Author wrote narration about a formula without adding the formula_box primitive to scene_composition.',
 'When teacher_script narrates a formula (F=ma, v^2=u^2+2as, etc.), include a formula_box primitive in that state.',
 'vision_model',
 'Cat E5 — Vision asks: "Does the teacher_script for this state reference a formula or equation? If yes, is that formula rendered as a formula_box on screen?"',
 'OPEN', 'E', 'session_38'),

('PEDAGOGY_INFO_OVERLOAD',
 'State introduces too many new elements — student cognitive overload',
 'MAJOR', 'alex:json_author',
 'Author dumped all forces, labels, equations into one state instead of staging across states.',
 'Each state introduces at most 2 new elements (force, label, formula, etc.). Use multiple states for complex scenes.',
 'vision_model',
 'Cat E6 — Vision asks: "How many new visual elements (forces/labels/formulas) does this state introduce compared to the previous state? More than 2 = fail."',
 'OPEN', 'E', 'session_38'),

-- ── Category F — Panel A/B bilateral sync (multi-panel only) ──────────────
('DUALPANEL_STATE_DESYNC',
 'Panel A and Panel B render different states at the same time',
 'CRITICAL', 'peter_parker:runtime_generation',
 'postMessage SET_STATE relay not reaching both panels; OR DualPanelSimulation.tsx ready-tracking race.',
 'Parent component sends SET_STATE to BOTH iframes simultaneously after both post SIM_READY. Echo-guard PARAM_UPDATE relay.',
 'js_eval',
 'Cat F1 — Playwright reads STATE_REACHED postMessage timestamps from both iframes after each SET_STATE; fails when |t_a - t_b| > 200ms.',
 'OPEN', 'F', 'session_38'),

('DUALPANEL_EQUATION_INCOHERENT',
 'Panel B trace equation does not describe Panel A physics',
 'CRITICAL', 'alex:physics_author',
 'Author wrote trace equation without verifying it matches Panel A physics_engine_config.',
 'Panel B traces[].equation_expr derived from Panel A physics. Verify by hand-computing y values at boundary x values.',
 'vision_model',
 'Cat F2 — Vision asks: "Does the equation rendered in Panel B mathematically describe the physics shown in Panel A? Use the panel_a physics config to verify."',
 'OPEN', 'F', 'session_38'),

('DUALPANEL_LIVEDOT_DRIFT',
 'Panel B live_dot does not track Panel A current variable',
 'MAJOR', 'peter_parker:runtime_generation',
 'PARAM_UPDATE relay broken; OR live_dot.sync_with_panel_a_sliders missing the right key.',
 'live_dot.x_variable matches one of Panel A sliders. PARAM_UPDATE in Panel A reaches Panel B and updates dot position.',
 'vision_model',
 'Cat F3 — Vision asks: "When Panel A slider moves, does Panel B yellow live_dot move in lockstep? Compare slider value and dot x-coordinate."',
 'OPEN', 'F', 'session_38'),

('DUALPANEL_PARAM_RELAY_BROKEN',
 'PARAM_UPDATE from one panel does not reach the other within 200ms',
 'MAJOR', 'peter_parker:runtime_generation',
 'DualPanelSimulation.tsx echo-guard suppressing legitimate updates; OR postMessage event-loop starvation.',
 'PARAM_UPDATE relay completes in < 200ms. Echo-guard suppresses only same-key same-value within 50ms.',
 'js_eval',
 'Cat F4 — Playwright fires PARAM_UPDATE in one iframe via JS eval, then awaits a matching message in the other iframe; fails when relay > 200ms or never arrives.',
 'OPEN', 'F', 'session_38'),

-- ── Category G — Panel B practical understanding ──────────────────────────
('DUALPANEL_AXES_UNLABELED',
 'Panel B graph axes have no labels or units',
 'MAJOR', 'alex:json_author',
 'Author omitted x_axis.label / y_axis.label; OR Plotly fell back to default axis text.',
 'Both x_axis and y_axis carry non-empty .label string with units (e.g., "Time (s)", "Velocity (m/s)").',
 'vision_model',
 'Cat G1 — Vision asks: "Are both x-axis and y-axis labeled with text including units?"',
 'OPEN', 'G', 'session_38'),

('DUALPANEL_RANGE_OFF',
 'Panel B graph range causes curves to run off-screen or compress to a flat line',
 'MAJOR', 'alex:physics_author',
 'Author chose y-axis range without computing function range across x-domain.',
 'Compute y-range as [min(f(x)) - 10%, max(f(x)) + 10%] across the x-domain before declaring axis range.',
 'vision_model',
 'Cat G2 — Vision asks: "Are the graph traces fully visible inside the plot area, or do they run off the top/bottom or compress to a flat line?"',
 'OPEN', 'G', 'session_38'),

('DUALPANEL_GRID_INVISIBLE',
 'Panel B gridlines too low contrast against background',
 'MODERATE', 'peter_parker:renderer_primitives',
 'pvl_colors.grid value too close to pvl_colors.background.',
 'pvl_colors.grid contrast >= 2:1 against pvl_colors.background. Default safe values: bg #0a0a1a, grid #1e2030.',
 'vision_model',
 'Cat G3 — Vision asks: "Are the gridlines visible against the background? They should be subtle but distinguishable."',
 'OPEN', 'G', 'session_38'),

('DUALPANEL_NO_TRACE',
 'Panel B graph has no visible trace (line/curve)',
 'CRITICAL', 'alex:json_author',
 'traces[] empty; OR equation_expr produces NaN; OR trace color matches background.',
 'traces[] has >= 1 entry with valid equation_expr that evaluates to finite numbers across x-domain. Trace color contrasts with background.',
 'vision_model',
 'Cat G4 — Vision asks: "Is at least one curve or line visible inside the plot area?"',
 'OPEN', 'G', 'session_38'),

('DUALPANEL_LIVEDOT_OFF_GRAPH',
 'Yellow live_dot rendered outside the plot area (clipped at edges)',
 'MAJOR', 'alex:physics_author',
 'live_dot.y_expr evaluates outside y_axis range at default x value.',
 'Verify y_expr at default x value falls inside y_axis range. Set initial x value to the middle of x_axis range.',
 'vision_model',
 'Cat G5 — Vision asks: "Is the yellow live_dot fully inside the plot area, not clipped at any edge?"',
 'OPEN', 'G', 'session_38'),

('DUALPANEL_NO_LEGEND',
 'Multiple traces rendered but no legend to disambiguate',
 'MODERATE', 'alex:json_author',
 'showlegend false in Plotly config; OR trace.label missing.',
 'When traces.length >= 2, ensure each has a non-empty label and Plotly showlegend stays true.',
 'vision_model',
 'Cat G6 — Vision asks: "If there are 2 or more traces, is there a legend rendered to identify which trace is which?"',
 'OPEN', 'G', 'session_38')

ON CONFLICT (bug_class) DO NOTHING;

-- ── Verification (do not execute — for documentation) ────────────────────────
-- Confirm 38 visual rows seeded (6+7+5+4+6+4+6 across categories A-G):
--   SELECT count(*) FROM engine_bug_queue WHERE visual_category IS NOT NULL;
--     -> 38
-- Confirm all 7 categories represented:
--   SELECT visual_category, count(*) FROM engine_bug_queue
--     WHERE visual_category IS NOT NULL GROUP BY visual_category ORDER BY visual_category;
--     -> A:6, B:7, C:5, D:4, E:6, F:4, G:6
-- Confirm probe_type split (36 vision_model + 2 js_eval for F1/F4):
--   SELECT probe_type, count(*) FROM engine_bug_queue
--     WHERE visual_category IS NOT NULL GROUP BY probe_type;
--     -> vision_model:36, js_eval:2
