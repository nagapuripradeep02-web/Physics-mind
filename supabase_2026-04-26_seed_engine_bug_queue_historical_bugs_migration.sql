-- supabase_2026-04-26_seed_engine_bug_queue_historical_bugs_migration.sql
--
-- Backfill engine_bug_queue with 13 cross-cutting bugs surfaced in PROGRESS.md
-- sessions 11–33 (BEFORE the friction_static_kinetic proof-run that seeded the
-- first 16 rows in session 36). These bugs threatened multiple concepts and
-- have clear regression probes; quality_auditor's Gate 8 will run them against
-- every future concept before approving.
--
-- Idempotent: ON CONFLICT (bug_class) DO NOTHING.
--
-- Distribution: 12 FIXED + 1 OPEN. After applying, total queue rows: 16 + 13 = 29.

INSERT INTO engine_bug_queue (
    bug_class,
    title,
    severity,
    owner_cluster,
    root_cause,
    prevention_rule,
    probe_type,
    probe_logic,
    status,
    concepts_affected,
    fixed_in_files,
    discovered_in_session,
    fixed_at
) VALUES

-- =============================================================================
-- TIER 1 — CRITICAL cross-cutting bugs (fix-once-protect-everything)
-- =============================================================================

-- 1. Production routing disconnect (session 31.5)
(
    'production_routing_disconnect_pcpl_concepts_set',
    'Concept passes /test-engines but production routes to legacy mechanics_2d_renderer',
    'CRITICAL',
    'alex:json_author',
    'Concept_id missing from PCPL_CONCEPTS set in aiSimulationGenerator.ts. /test-engines calls assembleParametricHtml directly so it works; production /api/generate-simulation checks the set and falls back to legacy mechanics_2d_renderer when the concept is not listed. Three Ch.5 gold-standards (vector_resolution, resultant_formula, direction_of_resultant) shipped half-broken for sessions 28-31 because of this.',
    'Every concept that uses parametric_renderer MUST be registered in the PCPL_CONCEPTS set at aiSimulationGenerator.ts:~2821 (registration site #7). Quality_auditor Gate 4 dual-path check exists specifically to catch this.',
    'manual',
    'Open src/lib/aiSimulationGenerator.ts and grep for PCPL_CONCEPTS — confirm $1 appears in the set definition. Then POST /api/generate-simulation with {concept:''$1'', mode:''conceptual''} and assert response.conceptId === ''$1'' (not a legacy bundle name like rain_umbrella, vector_basics, projectile_motion). Inside the returned iframe HTML, the globals PM_config / PM_ZONES / PM_currentState must be present (parametric_renderer markers); presence of M2_* globals means it routed to mechanics_2d.',
    'FIXED',
    ARRAY['friction_static_kinetic','field_forces','contact_forces','normal_reaction','tension_in_string','vector_resolution','hinge_force','free_body_diagram']::TEXT[],
    ARRAY['src/lib/aiSimulationGenerator.ts:2821']::TEXT[],
    'session_31.5',
    '2026-04-23T12:00:00Z'::TIMESTAMPTZ
),

-- 2. Classifier prompt drift (session 32)
(
    'classifier_prompt_drift_atomic_not_advertised',
    'Atomic concept missing from CLASSIFIER_PROMPT — Gemini returns legacy bundle name instead',
    'CRITICAL',
    'alex:json_author',
    'intentClassifier.ts maintains TWO sources of truth: VALID_CONCEPT_IDS set (used by normalizeConceptId) and the CLASSIFIER_PROMPT VALID CONCEPT IDs block (read by Gemini). When new atomic concepts are added to VALID_CONCEPT_IDS but not to CLASSIFIER_PROMPT, Gemini never returns them — student queries silently route to whichever sibling atomic CONCEPT_SYNONYMS resolves first. umbrella_tilt_angle silently routed to apparent_rain_velocity until session 32.5.',
    'Every concept_id in VALID_CONCEPT_IDS MUST also appear in the CLASSIFIER_PROMPT VALID CONCEPT IDs block in intentClassifier.ts:~137. The dev-only boot assertion assertClassifierPromptInSync() at intentClassifier.ts:141-204 must log zero [intentClassifier] ⚠️ warnings on dev server boot.',
    'manual',
    'POST /api/generate-simulation with {concept:''$1'', classLevel:11, mode:''conceptual''} (no fingerprintKey — forces a re-classify) and assert response.conceptId === ''$1''. Failure means CLASSIFIER_PROMPT in intentClassifier.ts:~137 does not advertise $1. Also check dev server console after boot for [intentClassifier] ⚠️ — boot assertion auto-surfaces drift.',
    'FIXED',
    ARRAY['friction_static_kinetic','field_forces','contact_forces','normal_reaction','tension_in_string','vector_resolution','hinge_force','free_body_diagram','umbrella_tilt_angle','apparent_rain_velocity']::TEXT[],
    ARRAY['src/lib/intentClassifier.ts:137','src/lib/intentClassifier.ts:141-204']::TEXT[],
    'session_32',
    '2026-04-23T18:00:00Z'::TIMESTAMPTZ
),

-- 3. Stale fingerprintKey serves wrong concept (session 32.5)
(
    'stale_fingerprintkey_serves_wrong_concept',
    'Pill click with stale fingerprintKey serves GENERIC_FALLBACK_CONFIG (Simulation temporarily unavailable)',
    'CRITICAL',
    'peter_parker:runtime_generation',
    'When a student asked about concept X, then clicked a pill for concept Y, the chat client POSTed {concept:''Y'', fingerprintKey:''X|...''}. The route trusted the stale key, missed the cache, and silently served the GENERIC_FALLBACK_CONFIG with every state labeled ''Simulation temporarily unavailable''. Fix: defensive guard at /api/generate-simulation/route.ts:43-74 detects mismatch and re-classifies using the concept param.',
    'Whenever both `concept` and `fingerprintKey` are present in a request, the API MUST validate fingerprintKey.split(''|'')[0] === concept; on mismatch, drop the stale key, log [generate-simulation] stale fingerprintKey dropped, and re-classify. GENERIC_FALLBACK_CONFIG MUST never be written to simulation_cache.',
    'sql',
    'SELECT count(*) AS leak_count FROM simulation_cache WHERE concept_id = $1 AND sim_html LIKE ''%Simulation temporarily unavailable%'';',
    'FIXED',
    ARRAY['friction_static_kinetic','field_forces','contact_forces','normal_reaction','tension_in_string','vector_resolution','hinge_force','free_body_diagram']::TEXT[],
    ARRAY['src/app/api/generate-simulation/route.ts:43-74']::TEXT[],
    'session_32.5',
    '2026-04-23T18:00:00Z'::TIMESTAMPTZ
),

-- 4. Confusion cluster registry unseeded (session 30.6)
(
    'confusion_cluster_registry_unseeded_for_concept',
    'Concept ships with drill_downs in JSON but zero rows in confusion_cluster_registry',
    'CRITICAL',
    'alex:json_author',
    'JSON declares drill_downs:[...] arrays on has_prebuilt_deep_dive states, but the cluster_ids only become live when SQL INSERTed into confusion_cluster_registry. Without that, the drill-down classifier returns cluster_id:null for every query and the student sees ''Your question does not match any pre-registered confusion cluster''. drill_down_cache stays empty. Session 30.6 found 8 of 9 retrofitted concepts had ZERO registry rows.',
    'For every state with has_prebuilt_deep_dive: true, json_author MUST author and apply a migration that INSERTs one row per drill_downs[] cluster_id into confusion_cluster_registry BEFORE declaring the concept ready. Each row needs concept_id, state_id, cluster_id, status=''active'', and 5 trigger_examples in real-student English.',
    'sql',
    'SELECT count(*) AS active_clusters FROM confusion_cluster_registry WHERE concept_id = $1 AND status = ''active'';',
    'FIXED',
    ARRAY['friction_static_kinetic','field_forces','contact_forces','normal_reaction','tension_in_string','vector_resolution','hinge_force','free_body_diagram']::TEXT[],
    ARRAY['supabase_phase_e_seed_clusters_migration.sql','supabase_2026-04-23_seed_umbrella_tilt_angle_clusters_migration.sql','supabase_2026-04-24_seed_friction_static_kinetic_clusters_migration.sql']::TEXT[],
    'session_30.6',
    '2026-04-22T21:00:00Z'::TIMESTAMPTZ
),

-- 5. Drill-down state_id always STATE_1 (session 30.6/30.7)
(
    'drill_down_state_id_always_state1',
    'DrillDownWidget always sees state_id=STATE_1 regardless of which pill student is on',
    'MAJOR',
    'peter_parker:renderer_primitives',
    'TeacherPlayer received STATE_REACHED postMessages but did not bubble them up to LearnConceptTab. DrillDownWidget read currentStateId from a stale ref captured in a []-deps handler that always pointed at the first state. Fix: added onStateChange prop to TeacherPlayer + liveCurrentState state in LearnConceptTab + plumbed through DrillDownWidget call site. Reset alongside setActiveVariantEntryState at all 5 sites.',
    'Whenever a TeacherPlayer iframe fires STATE_REACHED, the parent component MUST update a reactive liveCurrentState and pass it to DrillDownWidget. Stale refs in []-deps handlers are forbidden. DrillDownWidget request body state_id MUST equal the current pill state, never STATE_1.',
    'manual',
    'Navigate to a state >= 2 in the concept''s UI (e.g., STATE_3). Click ''Confused?''. Type a confusion phrase from the registry. Inspect the network request to /api/drill-down via DevTools — the request body field state_id MUST equal the current pill''s state_id (e.g., ''STATE_3''), NOT ''STATE_1''. If always STATE_1, the prop chain TeacherPlayer → LearnConceptTab → DrillDownWidget is broken.',
    'FIXED',
    ARRAY['friction_static_kinetic','field_forces','contact_forces','normal_reaction','tension_in_string','vector_resolution','hinge_force','free_body_diagram']::TEXT[],
    ARRAY['src/components/TeacherPlayer.tsx','src/components/sections/LearnConceptTab.tsx','src/components/DrillDownWidget.tsx']::TEXT[],
    'session_30.6',
    '2026-04-22T21:00:00Z'::TIMESTAMPTZ
),

-- 6. Drill-down DD suffix not stripped (session 30.7)
(
    'drill_down_dd_suffix_not_stripped_for_registry_lookup',
    'Drill-down from inside deep-dive sub-state POSTs full _DD\d+ suffix; registry lookup fails',
    'MAJOR',
    'peter_parker:renderer_primitives',
    'When student clicked Confused? from inside a deep-dive sub-state like STATE_3_DD2, DrillDownWidget POSTed state_id=''STATE_3_DD2''. confusion_cluster_registry rows are keyed on parent state ''STATE_3'', so lookup returned 0 rows and classifier returned cluster_id:null. Fix: DrillDownWidget strips /_DD\d+$/ suffix before POST.',
    'DrillDownWidget MUST strip the /_DD\d+$/ suffix from state_id before POSTing to /api/drill-down so registry lookups resolve to the parent state. This is a one-line normalization at the request-build site.',
    'manual',
    'Navigate into a deep-dive sub-state — click Explain on STATE_3, then click sub-pill 3b. Click ''Confused?''. Inspect /api/drill-down request body via DevTools: state_id MUST be the parent (e.g., ''STATE_3''), NOT ''STATE_3_DD2''. The DrillDownWidget at src/components/DrillDownWidget.tsx is responsible for the strip.',
    'FIXED',
    ARRAY['friction_static_kinetic','field_forces','contact_forces','normal_reaction','tension_in_string','vector_resolution','hinge_force','free_body_diagram']::TEXT[],
    ARRAY['src/components/DrillDownWidget.tsx']::TEXT[],
    'session_30.7',
    '2026-04-22T21:00:00Z'::TIMESTAMPTZ
),

-- 7. Fallback config cached (session 18 evening)
(
    'fallback_config_cached_to_simulation_cache',
    'GENERIC_FALLBACK_CONFIG (Simulation temporarily unavailable) gets written to simulation_cache and served forever',
    'CRITICAL',
    'peter_parker:runtime_generation',
    'When Stage 2 validation failed twice against Sonnet output, the pipeline returned GENERIC_FALLBACK_CONFIG (every state labeled ''Simulation temporarily unavailable''). The pipeline logged ✅ PIPELINE COMPLETE and ✅ CACHED (v3) and wrote the broken row to simulation_cache. Every future request returned the broken sim forever. Fix at aiSimulationGenerator.ts:6417-6450 — added isFallbackConfig detector that inspects physicsConfig.states[*].label.',
    'Before writing to simulation_cache, the pipeline MUST detect fallback configs by inspecting physicsConfig.states[*].label for the prefix ''Simulation temporarily unavailable'' and refuse to cache. Mirror the existing shouldCacheV3 (''unknown'' concept) guard.',
    'sql',
    'SELECT count(*) AS poisoned_rows FROM simulation_cache WHERE sim_html LIKE ''%Simulation temporarily unavailable%'';',
    'FIXED',
    ARRAY[]::TEXT[],
    ARRAY['src/lib/aiSimulationGenerator.ts:6417-6450']::TEXT[],
    'session_18_evening',
    '2026-04-18T23:00:00Z'::TIMESTAMPTZ
),

-- 8. fetchTechnologyConfig silent particle_field default (session 18 evening)
(
    'fetch_technology_config_silent_particle_field_default',
    'Concept missing from concept_panel_config silently routes to particle_field renderer with no warning',
    'CRITICAL',
    'peter_parker:runtime_generation',
    'fetchTechnologyConfig in jsonModifier.ts:64 fell back to a hardcoded defaultConfig with renderer_a:''particle_field'' for any concept missing from the concept_panel_config table. No warning ever logged. vector_resolution silently shipped this way for one full session. Fix at jsonModifier.ts:60-122 — three-tier fallback: (1) DB row, (2) loadConstants(conceptId).renderer_pair.panel_a, (3) hardcoded default but with console.warn.',
    'Every concept_id in src/data/concepts/ MUST have a corresponding row in concept_panel_config. fetchTechnologyConfig MUST emit a console.warn before falling back to particle_field; the defaultConfig MUST first try loadConstants(conceptId).renderer_pair.panel_a from the JSON itself.',
    'sql',
    'SELECT count(*) AS panel_config_rows FROM concept_panel_config WHERE concept_id = $1;',
    'FIXED',
    ARRAY['friction_static_kinetic','field_forces','contact_forces','normal_reaction','tension_in_string','vector_resolution','hinge_force','free_body_diagram']::TEXT[],
    ARRAY['src/lib/jsonModifier.ts:60-122']::TEXT[],
    'session_18_evening',
    '2026-04-18T23:00:00Z'::TIMESTAMPTZ
),

-- =============================================================================
-- TIER 2 — MAJOR renderer bugs from session 20 (cluster: renderer_primitives)
-- =============================================================================

-- 9. Rotated anchor resolution ignores rotation_deg (session 20)
(
    'rotated_anchor_resolution_ignores_rotation_deg',
    'Anchor resolver returns axis-aligned positions even when body is rotated (orient_to_surface=true)',
    'MAJOR',
    'peter_parker:renderer_primitives',
    'subSimSolverHost.ts:346-363 and parametric_renderer.ts:1965-1973 (PM_resolveAnchor body case) treated every body as axis-aligned. block.top_center returned (cx, cy − h/2) regardless of whether the block was tilted 30° to match an inclined surface. Effect: dashed perpendicular lines shot off in the wrong direction (off by ~16 px in x for a -30° rotation on normal_reaction STATE_3 deep-dive).',
    'Body anchor resolution MUST read body.rotation_deg and apply the rotation matrix to local offsets in both subSimSolverHost.ts AND parametric_renderer.ts. When attach_to_surface.orient_to_surface === true, body inherits -surfaceAngleDeg. SurfaceRegistry entries MUST carry angle_deg derived from atan2(y0−y1, x1−x0).',
    'js_eval',
    'var keys = (typeof PM_bodyRegistry === ''object'' && PM_bodyRegistry) ? Object.keys(PM_bodyRegistry) : []; var rotated = keys.map(function(k){return PM_bodyRegistry[k];}).filter(function(b){return b && b.rotation_deg && Math.abs(b.rotation_deg) > 0.5;}); if (rotated.length === 0) { ''SKIP: no rotated body in this scene''; } else { var b = rotated[0]; var key = keys[keys.indexOf(Object.keys(PM_bodyRegistry).find(function(k){return PM_bodyRegistry[k]===b;}))]; var top = (typeof PM_resolveAnchor === ''function'') ? PM_resolveAnchor(key + ''.top_center'') : null; var axisAlignedY = b.cy - b.h / 2; (top && Math.abs(top.y - axisAlignedY) > 0.5) ? ''PASS: anchor rotated correctly'' : ''FAIL: anchor still axis-aligned despite rotation_deg='' + b.rotation_deg; }',
    'FIXED',
    ARRAY['friction_static_kinetic','field_forces','contact_forces','normal_reaction','tension_in_string','vector_resolution','hinge_force','free_body_diagram']::TEXT[],
    ARRAY['src/lib/subSimSolverHost.ts:346-384','src/lib/renderers/parametric_renderer.ts:1965-1973']::TEXT[],
    'session_20',
    '2026-04-22T12:00:00Z'::TIMESTAMPTZ
),

-- 10. drawVector missing to defaults to canvas corner (session 20)
(
    'drawvector_missing_to_defaults_to_canvas_corner',
    'drawVector with magnitude+direction_deg (no explicit `to`) renders to canvas (0,0) corner',
    'MAJOR',
    'peter_parker:renderer_primitives',
    'drawVector at parametric_renderer.ts:1222 only accepted from+to. When Sonnet emitted {from, magnitude, direction_deg}, missing `to` defaulted to (0, 0) and lines ran to the canvas top-left corner. Fix: synthesize to = from + (mag·cos(rad), -mag·sin(rad)) when `to` is missing but magnitude+direction_deg are present (with magnitude_expr / direction_deg_expr variants for variable-driven animations).',
    'drawVector MUST accept either {from, to} OR {from, magnitude, direction_deg} (with _expr variants). Missing `to` with no magnitude fallback is a renderer error that must throw or warn — never silently default to (0, 0).',
    'manual',
    'Visually inspect any state in concept $1 that has a `vector` primitive declared as {from, magnitude, direction_deg} (no explicit `to`). The vector terminal MUST land at the geometrically correct point (origin + magnitude·cos/sin), NOT at the canvas top-left (0, 0) corner. If a line shoots to a corner, the drawVector synthesis branch at parametric_renderer.ts:1222 is broken.',
    'FIXED',
    ARRAY['friction_static_kinetic','field_forces','contact_forces','normal_reaction','tension_in_string','vector_resolution','hinge_force','free_body_diagram']::TEXT[],
    ARRAY['src/lib/renderers/parametric_renderer.ts:1222']::TEXT[],
    'session_20',
    '2026-04-22T12:00:00Z'::TIMESTAMPTZ
),

-- 11. drawAngleArc ignores surface_id (session 20)
(
    'drawanglearc_ignores_surface_id_defaults_to_250_300',
    'drawAngleArc with surface_id (no explicit center) defaults vertex to hardcoded (250, 300)',
    'MAJOR',
    'peter_parker:renderer_primitives',
    'drawAngleArc at parametric_renderer.ts:1459 only checked spec.center. When Sonnet emitted {surface_id:''incline_dd1'', angle_value:30}, vertex defaulted to hardcoded (250, 300) and θ-arcs floated untethered. Fix: vertex resolution priority chain — (1) spec.center literal, (2) PM_surfaceRegistry[spec.surface_id]→(x0,y0), (3) spec.vertex_anchor string→PM_resolveAnchor, (4) legacy fallback. Also wired spec.angle_value/_expr → to_deg.',
    'drawAngleArc MUST resolve vertex via {spec.center, spec.surface_id, spec.vertex_anchor} priority chain. Hardcoded canvas-center fallback is forbidden when surface_id or vertex_anchor is present. Degenerate arcs (θ=0 or |from−to|<0.5°) skip the stroke but keep the label.',
    'manual',
    'In any state of concept $1 with an `angle_arc` primitive declared as {surface_id:''...'', angle_value:N} (no explicit center), the arc vertex MUST land at the surface''s start point (x0, y0), NOT at the hardcoded canvas position (250, 300). Visual probe — load /test-engines?concept=$1, navigate to that state, screenshot, confirm the arc anchors to the surface origin not floating mid-canvas.',
    'FIXED',
    ARRAY['friction_static_kinetic','field_forces','contact_forces','normal_reaction','tension_in_string','vector_resolution','hinge_force','free_body_diagram']::TEXT[],
    ARRAY['src/lib/renderers/parametric_renderer.ts:1459']::TEXT[],
    'session_20',
    '2026-04-22T12:00:00Z'::TIMESTAMPTZ
),

-- =============================================================================
-- TIER 3 — Still-open bug worth tracking
-- =============================================================================

-- 12. Concept classifier override contact_forces → normal_reaction (session 30.6, STILL OPEN)
(
    'classifier_concept_id_override_contact_forces_to_normal_reaction',
    'Concept classifier overrides contact_forces queries to normal_reaction',
    'MAJOR',
    'peter_parker:runtime_generation',
    'InputUnderstanding''s concept_id override logic incorrectly maps ''contact forces'' raw to ''normal_reaction''. Server logs show: [InputUnderstanding] concept_id override applied: normal_reaction (upstream raw: normal_reaction, classifier had: contact_forces). The fingerprint cache then locks the wrong content in. Students asking about contact forces get normal_reaction content. STILL OPEN per session 30.6.',
    'InputUnderstanding''s concept_id override path MUST NOT remap contact_forces → normal_reaction. Audit override rules in intentClassifier.ts: each remap must map to a strictly-more-specific concept, never a sibling. Test with the canonical phrases for each concept before shipping.',
    'manual',
    'POST /api/chat with {query:''what are contact forces''} and assert response.conceptId === ''contact_forces'' (NOT ''normal_reaction''). Watch server logs for [InputUnderstanding] concept_id override applied: normal_reaction (upstream raw: ...) — this log line firing on contact_forces queries means the bug has recurred or is still live.',
    'OPEN',
    ARRAY['contact_forces','normal_reaction']::TEXT[],
    ARRAY[]::TEXT[],
    'session_30.6',
    NULL
),

-- =============================================================================
-- TIER 4 — Specific bug worth tracking for pattern recognition
-- =============================================================================

-- 13. Single-panel mechanics_2d pipeline skips cache write (session 18 evening)
(
    'single_panel_mechanics_2d_pipeline_skips_cache_write',
    'Single-panel mechanics_2d pipeline returned fromCache:false but never wrote to simulation_cache',
    'MAJOR',
    'peter_parker:runtime_generation',
    'The multi-panel mechanics_2d path (used when concept_panel_config.default_panel_count = 2) cached correctly. The single-panel path at aiSimulationGenerator.ts:5908-5970 returned SinglePanelResult with fromCache:false but no upsert. Effect: any concept with default_panel_count=1 + mechanics_2d routing re-ran the full ~$0.50+ pipeline (Sonnet + Flash) on EVERY request. vector_resolution surfaced this when first added. Fix at aiSimulationGenerator.ts:5955-6011 — added cache-write block mirroring particle_field path with same isFallbackConfig + shouldCacheV3 guards.',
    'Every renderer pipeline that produces a sim_html MUST write to simulation_cache (or one of its variant tables) on success. Mirror the multi-panel cache-write pattern. Use pipeline_version field to distinguish path provenance (e.g., v5-multipanel, v5-mechanics_2d, v5-pcpl). Pipeline-version tagging is mandatory.',
    'sql',
    'SELECT count(*) AS cache_rows, max(pipeline_version) AS latest_pipeline FROM simulation_cache WHERE concept_id = $1;',
    'FIXED',
    ARRAY['vector_resolution']::TEXT[],
    ARRAY['src/lib/aiSimulationGenerator.ts:5955-6011']::TEXT[],
    'session_18_evening',
    '2026-04-18T23:00:00Z'::TIMESTAMPTZ
)

ON CONFLICT (bug_class) DO NOTHING;
