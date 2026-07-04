-- ============================================================================
-- 2026-04-25 (session 36): seed engine_bug_queue with 16 friction bugs
-- ----------------------------------------------------------------------------
-- Source: PROGRESS.md sessions 34-35 friction_static_kinetic bug ledger.
-- All 16 bugs surfaced during the v2.2 proof-run; 11 FIXED, 3 NOT_REPRODUCING,
-- 2 DEFERRED. concepts_affected = ['friction_static_kinetic'] for state-local
-- bugs; bugs #1 and #16 list all 8 PCPL concepts because the engine-level
-- root causes silently infect every PCPL-rendered concept.
--
-- Idempotent via ON CONFLICT (bug_class) DO NOTHING.
-- ============================================================================

INSERT INTO engine_bug_queue (
    bug_class, title, severity, owner_cluster, root_cause,
    prevention_rule, probe_type, probe_logic, status,
    concepts_affected, fixed_in_files, discovered_in_session, fixed_at
) VALUES
-- Bug #1
(
    'default_variables_only_first_var_merged',
    'm=1 runtime leak — only m.default merged, all other declared variables fall back to 1',
    'CRITICAL',
    'peter_parker:runtime_generation',
    'aiSimulationGenerator.ts:5653 hardcoded ternary switch returned { m: 1 } as fallback for any concept not in a 3-concept allowlist. peDefaultVars (built correctly from physics_engine_config.variables.*.default at line 5619) only flowed to Panel B (graph), not Panel A. Friction''s declared mu_s, mu_k, F never reached PM_config.default_variables.',
    'Every concept with multiple variables in physics_engine_config.variables.*.default MUST have ALL declared variables merged into PM_config.default_variables at runtime, not just m. Path-A and Path-B builders must use a shared peDefaultVars source.',
    'sql',
    'SELECT position(''"default_variables":{"m":1'' IN sim_html) = 0 AS bug_absent FROM simulation_cache WHERE concept_id = $1 LIMIT 1',
    'FIXED',
    ARRAY['friction_static_kinetic','field_forces','contact_forces','normal_reaction','tension_in_string','vector_resolution','hinge_force','free_body_diagram'],
    ARRAY['src/lib/aiSimulationGenerator.ts:5653-5661'],
    'session_34',
    now()
),
-- Bug #2
(
    'force_arrow_wrong_direction_when_force_id_and_direction_deg_collide',
    'Static-friction arrow renders downward instead of left when both force_id and direction_deg are present',
    'CRITICAL',
    'peter_parker:renderer_primitives',
    'drawForceArrow() y-flip + anchor-resolution path mishandled the case where spec carried both an engine-matched force_id AND an explicit direction_deg with horizontal origin_anchor (body_left/body_right). Arrow tip drifted downward, crossing the floor line.',
    'When a force_arrow primitive carries both force_id (engine match) and direction_deg (explicit angle), the y-flip and anchor-resolver must produce a tip whose horizontal/vertical components match direction_deg exactly; horizontal anchors (body_left/body_right) must not produce vertical drift.',
    'js_eval',
    '(() => { const w = document.querySelector("iframe").contentWindow; const sc = w.PM_config?.states?.[w.PM_currentState]?.scene_composition || []; const arrows = sc.filter(p => p.type === "force_arrow" && p.direction_deg === 180 && (p.origin_anchor === "body_left" || p.origin_anchor === "body_right")); return arrows.every(a => a._renderedTipBelow !== true); })()',
    'FIXED',
    ARRAY['friction_static_kinetic'],
    ARRAY['src/lib/renderers/parametric_renderer.ts'],
    'session_34',
    now()
),
-- Bug #3
(
    'applied_force_arrow_invisible',
    'Applied F arrow never visible despite spec emit; label renders elsewhere but arrow body absent',
    'CRITICAL',
    'peter_parker:renderer_primitives',
    'Primitive emit gate in parametric_renderer display pipeline — F arrow spec passed validation but stroke alpha resolved to 0 OR origin_anchor lookup returned an off-canvas point. Likely shared root cause with bug #2 (force_id + direction_deg interaction).',
    'Every state with F > 0 in physics_engine_config.variables MUST render a force_arrow primitive with non-zero stroke alpha at a visible canvas zone. Renderer must fail visibly (e.g., red placeholder) rather than silently omit.',
    'manual',
    'preview_screenshot the test-engines page for friction_static_kinetic STATE_2; visually confirm a blue rightward arrow originating at the almirah body_right anchor, label "F = 5 N" or similar near the tip.',
    'FIXED',
    ARRAY['friction_static_kinetic'],
    ARRAY['src/lib/renderers/parametric_renderer.ts','src/data/concepts/friction_static_kinetic.json'],
    'session_34',
    now()
),
-- Bug #4
(
    'engine_fallback_arrows_missing_weight_normal',
    'mg + N engine-emitted physics_forces never drawn — renderer only draws authored scene primitives, no engine fallback',
    'MAJOR',
    'peter_parker:renderer_primitives',
    'Engine emits weight (mg, downward, body_center) and normal (N, upward, body_bottom) physics_forces with show:true and proper draw_from anchors. Renderer only draws primitives present in scene_composition. Engine fallback path does not exist. JSON authors expecting auto-fallback get nothing.',
    'Every state intended to display a complete free-body diagram MUST either author explicit force_arrow primitives for every PM_physics.forces entry with show:true, OR the renderer must be extended to auto-draw missing engine forces. Author-explicit is current convention.',
    'manual',
    'preview_screenshot friction_static_kinetic STATE_4; verify mg arrow (red, downward from body_center) and N arrow (green, upward from body_top) are both visible alongside F (right) and fk (left).',
    'DEFERRED',
    ARRAY['friction_static_kinetic'],
    ARRAY['src/data/concepts/friction_static_kinetic.json'],
    'session_34',
    NULL
),
-- Bug #5
(
    'ghost_duplicate_body_primitive_on_state_transition',
    'Ghost duplicate block visible during state transitions — orphan fragment bleeds through fade',
    'MODERATE',
    'peter_parker:renderer_primitives',
    'During the 800ms scene transition fade between STATE_N and STATE_N+1, prior body primitive remains on canvas while next state''s body draws on top. Likely root cause was force_id mismatch from bugs #2/#3/#4 producing phantom anchors; post-fix, no recurrence.',
    'Scene-swap (TeacherPlayer SET_STATE handler) MUST atomically clear prior scene_composition primitives before applying the next state''s set. No body primitive should appear at two distinct (x,y) positions simultaneously during the fade window.',
    'js_eval',
    '(async () => { const w = document.querySelector("iframe").contentWindow; const initial = (w.PM_config?.states?.[w.PM_currentState]?.scene_composition || []).filter(p => p.type === "body").length; w.postMessage({type:"SET_STATE", state:"STATE_2"}, "*"); await new Promise(r=>setTimeout(r,400)); const mid = (w.PM_config?.states?.[w.PM_currentState]?.scene_composition || []).filter(p => p.type === "body").length; return mid <= initial + 1; })()',
    'NOT_REPRODUCING',
    ARRAY['friction_static_kinetic'],
    ARRAY[]::text[],
    'session_34',
    now()
),
-- Bug #6
(
    'state6_missing_scene_primitives',
    'STATE_6 missing regime label, missing μk inline slider, dynamic friction arrow not updating on slider change',
    'MAJOR',
    'alex:json_author',
    'STATE_6 scene_composition omitted: (a) annotation primitive showing "Regime: STATIC/KINETIC", (b) third inline slider for mu_k, (c) link between F slider and friction arrow magnitude. Author overlooked the interactive-state checklist.',
    'Every state with dynamic regime transitions or slider-controlled physics MUST include: a regime label annotation primitive, all interactive sliders in scene_composition, and explicit references to the live variable for any force arrow whose magnitude depends on user input.',
    'js_eval',
    '(() => { const w = document.querySelector("iframe").contentWindow; const sc = w.PM_config?.states?.STATE_6?.scene_composition || []; const sliders = sc.filter(p => p.type === "slider"); const regime = sc.filter(p => p.type === "annotation" && /regime/i.test(p.text || p.text_expr || "")); return sliders.length >= 3 && regime.length >= 1; })()',
    'FIXED',
    ARRAY['friction_static_kinetic'],
    ARRAY['src/data/concepts/friction_static_kinetic.json','src/lib/renderers/parametric_renderer.ts'],
    'session_34',
    now()
),
-- Bug #7
(
    'prior_state_primitives_bleed_into_next_state',
    'STATE_1 hook_question annotation persists faded-gray on transition to STATE_2/3',
    'MODERATE',
    'peter_parker:renderer_primitives',
    'TeacherPlayer scene-swap did not clear prior state''s scene_composition before applying the new one. Fade-out and fade-in overlap. Likely related to force_id mismatch root cause; not reproducing post-fix.',
    'TeacherPlayer state-swap handler MUST clear the prior state''s scene_composition completely before rendering the new state''s primitives. No annotation, label, or body from STATE_N may persist into STATE_N+1.',
    'manual',
    'preview_screenshot during state transitions STATE_1->STATE_2 and STATE_2->STATE_3; verify no faded primitives from prior state remain visible 400ms into the new state.',
    'NOT_REPRODUCING',
    ARRAY['friction_static_kinetic'],
    ARRAY[]::text[],
    'session_34',
    now()
),
-- Bug #8
(
    'chat_rejects_concept_no_physics_constants_board',
    'Board-mode /api/chat rejects concept with "no specific physics constants available"',
    'CRITICAL',
    'peter_parker:runtime_generation',
    '/api/chat/route.ts did not call loadConstants(concept_id) to read physics_engine_config from the concept JSON. Fell back to legacy physics_facts.ts hardcoded constants, which had no entry for friction symbols (μs, μk, fs_max, fk).',
    'Every serving-path route generating lessons or chat (/api/chat, /api/generate-lesson) MUST call loadConstants(concept_id) to read formula symbols from the concept JSON''s physics_engine_config. No fallback to legacy hardcoded tables.',
    'manual',
    'POST /api/chat { concept: $1, mode: "board", message: "derive friction formula with marks" }; response must reference at least one formula symbol (μs, N, fs_max) and must NOT contain "no specific physics constants available".',
    'FIXED',
    ARRAY['friction_static_kinetic'],
    ARRAY['src/app/api/chat/route.ts'],
    'session_34',
    now()
),
-- Bug #9
(
    'chat_rejects_concept_no_physics_constants_conceptual',
    'Conceptual /api/chat also rejects concept — same root cause as #8',
    'CRITICAL',
    'peter_parker:runtime_generation',
    'Same as bug #8 — /api/chat in conceptual mode also fell through to legacy physics_facts.ts. Same fix path; one row separate from #8 because conceptual mode has its own response template that needed verification.',
    'Same as #8: loadConstants(concept_id) must be called for every mode (conceptual, board, competitive) before generating chat responses.',
    'manual',
    'POST /api/chat { concept: $1, mode: "conceptual", message: "static vs kinetic friction" }; response must reference at least one formula symbol AND must NOT contain "physics facts do not offer information".',
    'FIXED',
    ARRAY['friction_static_kinetic'],
    ARRAY['src/app/api/chat/route.ts'],
    'session_34',
    now()
),
-- Bug #10
(
    'slider_param_update_listener_not_wired',
    'Sliders change values but block does not move and friction arrow length does not update',
    'MAJOR',
    'peter_parker:renderer_primitives',
    'PARAM_UPDATE postMessage listener did not re-evaluate PM_physics.variables, did not re-call computePhysics_<concept>, did not redraw the scene. Sliders fired but downstream physics + visual update never happened.',
    'PARAM_UPDATE postMessage handler MUST: (1) update PM_physics.variables with new slider value, (2) re-call the matching computePhysics_<concept>(vars), (3) trigger redraw of all primitives whose visual depends on PM_physics (force arrows, position via slide_when_kinetic, regime label).',
    'js_eval',
    '(async () => { const w = document.querySelector("iframe").contentWindow; const F0 = w.PM_physics?.variables?.F; w.postMessage({type:"PARAM_UPDATE", key:"F", value: 50}, "*"); await new Promise(r=>setTimeout(r,500)); return w.PM_physics?.variables?.F === 50 && w.PM_physics?.derived?.is_slipping === 1; })()',
    'FIXED',
    ARRAY['friction_static_kinetic'],
    ARRAY['src/lib/renderers/parametric_renderer.ts'],
    'session_34',
    now()
),
-- Bug #11
(
    'panel_b_graph_empty_in_test_engines',
    'Panel B graph empty in test-engines (production iframe path works correctly)',
    'MODERATE',
    'peter_parker:runtime_generation',
    'Two divergent code paths: production /api/generate-simulation calls assembleGraphHTML(panel_b_config) which iframes graph_interactive_renderer reading the JSON''s panel_b_config; test-engines uses React-Plotly directly via PanelBEngine.getAllTraces() which is not seeded with the JSON''s panel_b_config — returns []. Test-engines-only bug.',
    'Test-engines TestEnginesClient.tsx PanelBEngine MUST be seeded from conceptJSON.panel_b_config.traces on instantiation so getAllTraces() returns the same data the production iframe reads.',
    'manual',
    'Navigate to /test-engines?concept=$1; visually verify Panel B graph renders at least one curve. (Production verification: navigate to /learn for the concept and verify Panel B iframe plots correctly.)',
    'DEFERRED',
    ARRAY['friction_static_kinetic'],
    ARRAY[]::text[],
    'session_34',
    NULL
),
-- Bug #12
(
    'deep_dive_modal_nav_missing_next_prev_buttons',
    'DEEP-DIVE modal has pill-dot navigator only — no next/prev buttons',
    'MODERATE',
    'peter_parker:renderer_primitives',
    'DEEP-DIVE sub-sim modal in main-app /learn page renders pill-dot navigator UI but no sequential button controls for stepping through the 4-6 sub-states. Forces students to guess pill positions.',
    'DEEP-DIVE sub-sim modal MUST include both pill-dot navigator AND next/prev buttons (or equivalent keyboard navigation) for multi-step discovery sequences.',
    'manual',
    'Open DEEP-DIVE modal from /learn page for any concept with allow_deep_dive states; verify both pill-dot navigator and Next/Prev buttons present and functional.',
    'DEFERRED',
    ARRAY['friction_static_kinetic'],
    ARRAY[]::text[],
    'session_34',
    NULL
),
-- Bug #13
(
    'body_penetrates_floor_when_not_attached_to_surface',
    'Almirah rect bottom 50px below floor tick marks in STATE_4/5/6 — body lacks attach_to_surface',
    'CRITICAL',
    'alex:json_author',
    'Body specs in STATE_4/5/6 had no attach_to_surface field. Without it, the unattached draw path puts rect TOP at y=370 then renders downward by full height, placing bottom at y=470 vs floor at y=420 — 50px penetration.',
    'Every body primitive in a state that contains a surface primitive MUST declare attach_to_surface { surface_id, position_fraction } so the body sits on the floor; OR explicitly position the body above the floor with annotated intent.',
    'js_eval',
    '(() => { const w = document.querySelector("iframe").contentWindow; const states = w.PM_config?.states || {}; for (const [sid, s] of Object.entries(states)) { const sc = s.scene_composition || []; const surfaces = sc.filter(p => p.type === "surface"); const bodies = sc.filter(p => p.type === "body"); if (surfaces.length > 0 && bodies.length > 0) { for (const b of bodies) { if (!b.attach_to_surface) { console.warn("body without attach_to_surface in", sid, b.id); return false; } } } } return true; })()',
    'FIXED',
    ARRAY['friction_static_kinetic'],
    ARRAY['src/data/concepts/friction_static_kinetic.json'],
    'session_34',
    now()
),
-- Bug #14
(
    'annotation_color_too_dark_for_dark_canvas',
    'Annotations near-invisible — dark #1F2937 hex color on dark canvas #0A0A1A',
    'MODERATE',
    'alex:json_author',
    'JSON authored annotations with hex color #1F2937 (dark charcoal) without checking contrast against the dark canvas background #0A0A1A. Luminance contrast ratio ~1.2 — well below WCAG AA threshold of 4.5.',
    'Every annotation primitive''s color MUST have luminance contrast >= 4.5:1 (WCAG AA) against the canvas background. For default dark canvas (#0A0A1A), use light slate (#E2E8F0) or lighter. NEVER author colors darker than #6B7280 on dark canvas.',
    'js_eval',
    '(() => { const w = document.querySelector("iframe").contentWindow; const states = w.PM_config?.states || {}; const dark = ["#1F2937","#111827","#030712","#0A0A1A","#000000"]; for (const s of Object.values(states)) { for (const p of (s.scene_composition || [])) { if (p.type === "annotation" && dark.includes((p.color || "").toUpperCase())) return false; } } return true; })()',
    'FIXED',
    ARRAY['friction_static_kinetic'],
    ARRAY['src/data/concepts/friction_static_kinetic.json'],
    'session_34',
    now()
),
-- Bug #15
(
    'no_motion_in_kinetic_states_static_block_during_transition',
    'STATE_4 says "almirah is sliding" but block static; STATE_6 kinetic regime block does not accelerate',
    'CRITICAL',
    'peter_parker:renderer_primitives',
    'Renderer had no slide_horizontal or slide_when_kinetic animation types — block animation only attachedPos-driven (sitting on surface), no free horizontal motion mechanism. Pedagogically wrong for kinetic-regime states.',
    'Renderer MUST support animation types for kinematic motion: slide_horizontal (constant accel + max_dx + loop_period_sec), slide_when_kinetic (accel = (F - μk·m·g)/m, only when F > μs·m·g). Both MUST work on attached-to-surface bodies (not just unattached).',
    'manual',
    'preview_screenshot friction_static_kinetic STATE_4 and STATE_6 over 3 seconds; block must visibly translate rightward in STATE_4; in STATE_6 with F > 25, block must accelerate.',
    'FIXED',
    ARRAY['friction_static_kinetic'],
    ARRAY['src/lib/renderers/parametric_renderer.ts:577-615','src/data/concepts/friction_static_kinetic.json'],
    'session_34',
    now()
),
-- Bug #16
(
    'force_origin_body_id_field_name_mismatch',
    'Force arrows pile on first registered body — PM_resolveForceOrigin only checked spec.body_id, not spec.origin_body_id',
    'CRITICAL',
    'peter_parker:renderer_primitives',
    'PM_resolveForceOrigin() at parametric_renderer.ts:2188 only checked spec.body_id, never spec.origin_body_id (the actual field name in the concept JSON convention). Lookup failed silently, fell through to keys[0] of PM_bodyRegistry = the first registered body. Every multi-body state in every PCPL concept silently misrouted arrows.',
    'Force-origin resolution MUST accept both spec.body_id AND spec.origin_body_id as field-name aliases; likewise spec.draw_from AND spec.origin_anchor for the anchor field. New JSON convention is origin_body_id/origin_anchor; renderer must not silently fall back when these are present.',
    'js_eval',
    '(() => { const w = document.querySelector("iframe").contentWindow; const sc = w.PM_config?.states?.[w.PM_currentState]?.scene_composition || []; const arrows = sc.filter(p => p.type === "force_arrow" && p.origin_body_id); const bodyIds = new Set(sc.filter(p => p.type === "body").map(p => p.id)); return arrows.every(a => bodyIds.has(a.origin_body_id)); })()',
    'FIXED',
    ARRAY['friction_static_kinetic','field_forces','contact_forces','normal_reaction','tension_in_string','vector_resolution','hinge_force','free_body_diagram'],
    ARRAY['src/lib/renderers/parametric_renderer.ts:2188-2194','src/data/concepts/friction_static_kinetic.json'],
    'session_34',
    now()
)
ON CONFLICT (bug_class) DO NOTHING;

-- Verification (do not execute — for documentation):
--   SELECT count(*) FROM engine_bug_queue WHERE discovered_in_session = 'session_34';
--     -> 16
--   SELECT count(DISTINCT bug_class) FROM engine_bug_queue;
--     -> 16
--   SELECT count(*) FROM engine_bug_queue WHERE 'friction_static_kinetic' = ANY(concepts_affected);
--     -> 16
--   SELECT status, count(*) FROM engine_bug_queue GROUP BY status;
--     -> FIXED: 11, NOT_REPRODUCING: 2, DEFERRED: 3
