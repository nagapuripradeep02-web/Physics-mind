# CLAUDE_REFERENCE.md — PhysicsMind
# Current reality reference: files, tables, routes, env, pipeline details
# Open when needed. Not loaded every session. **[STALE — orientation only; verify every path/size/count
# live. The live file map is CLAUDE.md §8, not this April-2026 snapshot.]**
#
# ⚠ STALENESS WARNING (2026-06-11 audit): this is an APRIL 2026 SNAPSHOT, not
#   current reality. Spot-checks found several claims wrong: parametric_renderer
#   is ~118KB/2,790 lines (not 22KB); field_3d is ~282KB (not 48KB); PCPL has 14
#   primitives (not 12); pyq_questions / proposal_queue / engine_bug_queue tables
#   EXIST (migrations on disk — not "planned"); the shipped admin route is
#   /admin/proposals (not /admin/proposal-queue); EPIC-C state count is 3–6
#   (CLAUDE.md §7), not 4–7. Missing entirely: the Visual Validator stack
#   (visual:eyes / smoke:visual-validator / visual:approve / .visual_runs/),
#   field_3d magnetism architecture, comprehension_* tables, catalog exports.
#   Use for orientation; VERIFY any path/size/count in the codebase before
#   relying on it. Full refresh pending.
# Revision: 2026-04-22 — added 4 Phase-I tables (feedback_unified, test_session_log,
#   proposal_queue, engine_bug_queue) + /admin/proposal-queue route for the Tier 8
#   self-improvement loop. See PLAN.md for the consolidated feedback architecture.
# Prior revision: 2026-04-19 — added gold-standard schema (prerequisites, allow_deep_dive,
#   drill_downs, canvas_style, derivation_sequence), 4 Phase-D/G DB tables (deep_dive_cache,
#   drill_down_cache, confusion_cluster_registry, feynman_attempts), and flagged the
#   PCPL-vs-mechanics_2d hybrid architectural reality that the original v2 vision missed.

---

## CURRENT ARCHITECTURE (REALITY TODAY)

### Request Flow

```
Student question → /api/chat (JSON, not streaming)
  ├─ classifyQuestion() → 5D fingerprint (concept_id|intent|class|mode|aspect)
  ├─ Three-tier serving:
  │   Tier 1: verified_concepts (static)
  │   Tier 2: response_cache
  │   Tier 3: AI generation
  ├─ resolveStudentIntent() → autonomous (never blocks pipeline)
  ├─ Image pipeline: Flash Vision → pHash cache → Sonnet fallback (<0.85 conf)
  ├─ TeacherEngine: explainConceptual/Board/Competitive (NCERT-grounded via searchNCERT)
  ├─ extractStudentConfusion() → student_belief + simulation_emphasis
  ├─ conceptDecomposer → multi-panel orchestration (if multi-concept)
  └─ Returns { explanation, ncertSources, studentConfusionData,
               panelConfig, conceptId, scope, skipSimulation }

Frontend → /api/generate-simulation
  ├─ Stage 1: SimulationBrief (Gemini Flash) — concept-guided via CONCEPT_SIM_GUIDANCE, EPIC-C/L protocols
  ├─ Stage 2: PhysicsConfig (Claude Sonnet) — JSON config only, no rendering code
  ├─ Stage 3A: StateMachineSpec (Sonnet) — variable state count, single source of truth
  ├─ Stage 3B: p5.js HTML (Gemini Flash) — concept-specific renderer or pre-built renderer
  ├─ Stage 4: Teacher Script (Sonnet) — narration aligned to states
  └─ Returns { simHtml, teacherScript, panelConfig }
      or { type: "multi_panel", panel_a, panel_b }
```

### Model Routing (`src/lib/modelRouter.ts`)

| Task | Model | Provider | Why |
|------|-------|----------|-----|
| Intent classification | Gemini 2.5 Flash | Google | High volume, fast |
| NCERT explanation | Gemini 2.5 Flash (temp 0.2–0.4) | Google | Cost-efficient |
| MCQ generation | Gemini 2.5 Flash | Google | Batch generation |
| Diagnostic quiz | Gemini 2.5 Flash | Google | Fast turnaround |
| Simulation Brief (Stage 1) | Gemini 2.5 Flash | Google | Concept-guided via CONCEPT_SIM_GUIDANCE |
| Config Writer (Stage 2) | Claude Sonnet 4.6 | Anthropic | Structured JSON output |
| Confusion extraction | Claude Sonnet 4.6 (maxTokens 400) | Anthropic | Precise belief extraction |
| Complex problem | Claude Sonnet 4.6 | Anthropic | Deep reasoning |
| Image analysis | Claude Sonnet 4.6 | Anthropic | Vision fallback |
| Animation generation | DeepSeek Chat | DeepSeek | Cost-efficient code gen |
| p5.js code gen (Stage 3B) | Gemini Flash | Google | Code generation volume |
| Teacher Script (Stage 4) | Claude Sonnet 4.6 | Anthropic | Narration quality |

Provider fallback chain: Google→Anthropic, Anthropic→Google, DeepSeek→Anthropic.

### Three Teaching Modes

Chat API reads `section` field (falls back to `mode`) and routes to different TeacherEngine functions:
- `conceptual` → explainConceptual (temp 0.4) — intuition, analogies, no exam pressure
- `board` → explainBoardExam (temp 0.2) — NCERT language exactly, definition→formula→steps→board tip
- `competitive` → explainCompetitive (temp 0.3) — core idea→the trap→shortcut→edge cases→practice

Same concept explained differently per mode. **NEVER mix explanation + exam strategy.**

**Derivation rule:** Derivation requests belong in `board` mode ONLY. If a derivation request arrives in `conceptual` mode, redirect to `board`.

### Auth

Supabase Auth (email/password + Google OAuth) via `supabaseBrowser.auth`. Login page at `/login`.
`src/proxy.ts` exports a `proxy()` function for middleware-style auth guard (redirects unauthenticated to `/login`), but **no `middleware.ts` file currently wires it** — auth checks happen at the route level via `supabase.auth.getUser()`.
API routes use `x-user-id` header or `Authorization` header, falling back to "anonymous".

### Supabase Clients

- `supabaseAdmin` (`src/lib/supabaseAdmin.ts`) — service role, bypasses RLS, server-side only
- `supabaseServer` (`src/lib/supabaseServer.ts`) — SSR with cookie-based session
- `supabaseBrowser` (`src/lib/supabaseBrowser.ts`) — client-side, RLS enforced

---

## KEY FILES

### Core Pipeline

| File | Role |
|------|------|
| `src/app/api/chat/route.ts` | Main chat handler (~1400 lines) — intent routing, 3-tier cache, session context, image pipeline, MVS, rate limiting (20 req/60s) |
| `src/lib/aiSimulationGenerator.ts` | 5-stage simulation pipeline (~5700 lines), `CONCEPT_RENDERER_MAP` (155+), `RENDERER_MAP`, `CONCEPT_SIM_GUIDANCE` (8 concepts) |
| `src/lib/teacherEngine.ts` | NCERT-grounded explanation (conceptual/board/competitive) + `generateLesson()` + `diagnoseError()` |
| `src/lib/intentClassifier.ts` | 5D fingerprint classifier (Gemini Flash) — `VALID_CONCEPT_IDS`, `CONCEPT_SYNONYMS`, `normalizeConceptId()` |
| `src/lib/intentResolver.ts` | Autonomous intent resolver — scope (micro/local/global), simulation_needed, never blocks pipeline |
| `src/lib/queryRouter.ts` | Three-tier cache: `lookupVerifiedByConceptId()`, `matchCachedResponse()`, `cacheResponseForMode()`, `factCheckResponse()` |
| `src/lib/ncertSearch.ts` | pgvector similarity search — two-pass (NCERT 0.65 threshold, then DC Pandey + HC Verma fallback), uses `content_text` field |
| `src/lib/conceptDecomposer.ts` | Multi-concept → primary + supporting, decides panel_count (1-3), assigns renderers |
| `src/lib/extractStudentConfusion.ts` | Claude Sonnet — parse student wrong belief → student_belief, simulation_emphasis (confidence gating: >0.85 proceed, 0.60-0.85 flag, <0.60 halt) |
| `src/lib/modelRouter.ts` | Task → provider/model routing (`selectModel()`, `detectTaskType()`, `estimateCost()`) |

### Simulation Pipeline

| File | Role |
|------|------|
| `src/lib/jsonModifier.ts` | Between Brief and Config — adapts simulation_strategy fields, never modifies locked_facts |
| `src/lib/epicStateBuilder.ts` | Builds STATE_1 contract for EPIC-C/EPIC-L per renderer type |
| `src/lib/ncertTruthAnchor.ts` | Claude Sonnet validates sim configs against locked NCERT facts (skips graph_interactive) |
| `src/lib/rendererModifier.ts` | Pure TypeScript — injects TIME_STEP_MINIMUMS, ANIMATION_MULTIPLIERS, zero AI cost |
| `src/lib/variantPicker.ts` | Picks next unseen variant from regeneration_variants on thumbs-down feedback |
| `src/lib/simulation/stage2Runner.ts` | Stage 2 runner — 2-attempt retry + safe fallback |
| `src/lib/simulation/stage2Prompt.ts` | Builds physics-locked prompt for Sonnet (locked_facts, truth_statements) |
| `src/lib/simulation/rendererSchema.ts` | SimulationConfig, ParticleFieldConfig types, DEFAULT_PVL_COLORS |
| `src/lib/simulation/circuitSimRunner.ts` | Circuit-specific simulation runner |
| `src/lib/simulation/physicsValidator.ts` | Synchronous circuit config validator (<1ms, zero AI) |

### Schema & Bridge

| File | Role |
|------|------|
| `src/lib/physics_constants/index.ts` | `loadConstants()` — reads data/concepts/ first, then physics_constants/, concept aliases |
| `src/lib/jsonBridge.ts` | `normalizeOldStates()` — bridges legacy `simulation_states` → `epic_l_path` |
| `src/config/panelConfig.ts` | Concept → renderer + layout mapping (`CONCEPT_PANEL_MAP`, `getPanelConfig()`) — SOURCE OF TRUTH |
| `src/lib/panelConfig.ts` | OLDER DUPLICATE — prefer `src/config/panelConfig.ts` |
| `src/config/conceptMap.ts` | Concept ID → display_name, chapter, class_level, panels (30+ concepts) |

### Physics & PCPL (ALREADY BUILT — do not rebuild)

| File | Role |
|------|------|
| `src/lib/physicsEngine/` | ✅ EXISTS — `computePhysics(conceptId, vars)` → PhysicsResult |
| `src/lib/pcplRenderer/` | ✅ EXISTS — `renderSceneComposition()` → 12 primitives |

Physics Engine concepts: contact_forces, field_forces, normal_reaction, tension_in_string, hinge_force, free_body_diagram.

PCPL Primitives built: body, surface, force_arrow, vector, angle_arc, label, formula_box, annotation, comparison_panel, projection_shadow, motion_path, slider.

### Input Understanding

| File | Role |
|------|------|
| `src/lib/inputUnderstanding.ts` | Universal input understanding (L0 intake) — action routing (PROCEED/CLARIFY/DIAGNOSE_ERROR/OUT_OF_SCOPE/ACKNOWLEDGE_EMOTION) |
| `src/lib/universalInputUnderstanding.ts` | Orchestrator layer — concept keyword extraction, mismatch detection |
| `src/lib/conceptKeywordMap.ts` | 200+ keyword → concept_id mappings across all physics domains |
| `src/lib/isVagueInput.ts` | Regex vague input detection (Hinglish support) |
| `src/lib/conceptMapLookup.ts` | 3-stage Supabase lookup (exact → normalized → partial), `detectMisconception()` zero-cost keyword matching |
| `src/lib/confusionIdentifier.ts` | Pattern-based confusion scoring against confusion_patterns (0.30 threshold) |
| `src/lib/routingSignalLookup.ts` | Concept routing signals — scope/simulation_needed override from DB |
| `src/lib/sonnetVision.ts` | Two-layer Vision fallback (Flash < 0.85 → Sonnet corrects concept_id) |

### NCERT & Content

| File | Role |
|------|------|
| `src/lib/ncertContext.ts` | 50+ topic → {class, chapter_number} mappings |
| `src/lib/ncertQueryExtractor.ts` | Concept ID → search phrase conversion, stop-word removal |
| `src/lib/ncertSyllabusCheck.ts` | 100+ NCERT concept coverage check |
| `src/lib/equationCache.ts` | SHA-256 content hash → equation_cache table (content-addressed, path-independent) |
| `src/lib/extractEquations.ts` | Hash → cache check → MinerU call → write cache (never throws) |
| `src/lib/mineruClient.ts` | MinerU service client (health: 3s, extract: 90s timeout, never throws) |

### Frontend Components

| File | Role |
|------|------|
| `src/components/sections/LearnConceptTab.tsx` | Main learning UI — chat + lesson + sim orchestration, dual-panel, variant switching |
| `src/components/sections/ConceptualSection.tsx` | Wrapper: "Learn Concept" + "Check Understanding" tabs |
| `src/components/sections/ProblemSolverSection.tsx` | Dual-panel solver (competitive/board), parallel solution generation |
| `src/components/sections/CompetitiveTab.tsx` | JEE/NEET exam practice with timer modes |
| `src/components/sections/BoardExamTab.tsx` | Board exam answer templates |
| `src/components/TeacherPlayer.tsx` | Lesson player with state sync, belief probe, Play/Pause, pendingState queue |
| `src/components/AISimulationRenderer.tsx` | HTML sim iframe with scroll-to-zoom, pan, physics fact carousel |
| `src/components/DualPanelSimulation.tsx` | Dual iframe sim — waits SIM_READY both panels before sending STATE |
| `src/components/ImageAnnotator.tsx` | Rectangle annotation tool — sends marked_region (normalized 0.0–1.0) |
| `src/components/NCERTSourcesWidget.tsx` | Collapsible NCERT sources UI (inline styles, no Tailwind) |
| `src/components/MessageRenderer.tsx` | Markdown + KaTeX math rendering with clickable concept tags |
| `src/components/SimulationSwitcher.tsx` | Variant selector for parametric simulations |
| `src/components/MisconceptionVerifyCard.tsx` | Amber card with Yes/No misconception verification |
| `src/components/ConfidenceMeter.tsx` | 5-emoji clarity feedback |
| `src/components/Onboarding.tsx` | Multi-screen flow: name → class → board → goal → first topic |
| `src/components/ResponseActionBar.tsx` | Copy, Save, Share (WhatsApp), Thumbs up/down |
| `src/components/MCQMode.tsx` | MCQ engine with JEE timer (120s/question), scoring, weak topics |

### State Management

| File | Role |
|------|------|
| `src/contexts/ProfileContext.tsx` | Student profile, concepts, moduleProgress, appMode, examMode, sessionConceptIds |
| `src/contexts/ChatContext.tsx` | Separate conceptual & problem chat CRUD, localStorage fallback, message persistence |
| `src/contexts/BookmarkContext.tsx` | Bookmark management (max 100, localStorage, response + MCQ types) |

### Other

| File | Role |
|------|------|
| `src/lib/dispatcher.ts` | Unified provider dispatcher with fallback chain |
| `src/lib/providers/googleProvider.ts` | Google Gemini stream/generate (falls back to Claude Haiku if no key) |
| `src/lib/providers/anthropicProvider.ts` | Anthropic Claude stream/generate |
| `src/lib/providers/deepseekProvider.ts` | DeepSeek generate (falls back to Claude Haiku if no key) |
| `src/lib/usageLogger.ts` | Fire-and-forget usage logging (never throws) |
| `src/lib/profile.ts` | Profile CRUD: getProfile(), saveProfile(), getConcepts(), saveConcept() |
| `src/lib/session.ts` | Session ID management backed by Supabase auth |
| `src/lib/systemPrompt.ts` | Dynamic system prompt from student profile (layer0→layer1→layer2→layer3) |
| `src/lib/whatsapp.ts` | WhatsApp share formatter (mobile vs desktop) |
| `src/lib/topicDetector.ts` | Regex-based topic keyword detection (15+ topics, color badges) |
| `src/proxy.ts` | Auth guard function (exported but NOT wired — no middleware.ts exists) |

---

## CONCEPT JSON SCHEMA

### Verified Fields (currently in `src/data/concepts/`)

Top-level keys actually present today: `concept_id`, `concept_name`, `chapter`, `section`, `source_book`, `class_level`, `locked_facts`, `epic_l_path`, `epic_c_branches`, `epic_c_micro_templates`, `static_responses`, `example_library`, `parameter_slots`, `panel_sync_spec`, `renderer_hint`, `routing_signals`, `jee_specific`, `concept_relationships`, `regeneration_variants`.

### Planned / Aspirational Fields

Not yet present in all JSONs — add with the field, do not assume they exist when reading older concepts: `panel_b_layer`, `advance_mode` (per state: `auto_after_tts | manual_click | auto_after_animation | interaction_complete | wait_for_answer`), `teacher_script.tts_sentences[]` with `text_en`, `available_renderer_scenarios`, `misconception_depth_signals`, `sonnet_emphasis_per_state`, `board_mode` / `diagram_steps[]`, `fallback_config`, `pyq_frequency_hint`. Treat additions as opt-in until backfilled across all concepts.

**Added 2026-04-19** (gold-standard schema from Phase B rebuild of `normal_reaction.json`):
- `prerequisites: [concept_id]` — soft dependency graph; shown as "builds on X" suggestion
- `allow_deep_dive: boolean` (per state) — when true, "Explain step-by-step" button renders
- `drill_downs: [{ trigger_phrases, cluster_id, sub_concept_id, protocol }]` (per state) — pre-authored confusion → sub-sim mappings
- `mode_overrides.board.canvas_style: "answer_sheet" | "default"` — triggers white ruled background + handwriting-style primitives
- `mode_overrides.board.derivation_sequence: { STATE_N: { primitives: [...] } }` — board-only primitive layer with `animate_in: "handwriting"` and `mark_badge` overlays
- `mode_overrides.board.phase_2_content.mark_scheme: [{ step, marks }]` — 1-to-1 mapping between states and exam marks
- `scene_composition.primitives[]` — **must have ≥3 entries per state** (new gate requirement, Phase A)

### Architectural Reality Check — PCPL vs mechanics_2d (flagged 2026-04-19)

CLAUDE_ENGINES.md describes a future where every concept renders via data-driven PCPL primitives from `scene_composition`. **That future is NOT shipping today.** As of 2026-05-15: `src/data/concepts/` holds **63 atomic JSONs + 1 legacy bundle (class12_current_electricity.json) + 1 known-broken (contact_forces.json — duplicate-keys parse bug, engine_bug_queue OPEN)**. The original April-19 audit found `scene_composition.primitives = []` in every state of the 60 atomics that existed then; since then 3 more atomics shipped (`magnetic_field_wire`, `magnetic_force_moving_charge`, `newton_second_law_direction`) and use populated primitives via the parametric + field_3d renderers. Actual visual rendering for the bulk of concepts still happens in `src/lib/renderers/mechanics_2d_renderer.ts` — 315 KB of hand-coded TypeScript covering 55+ concepts.

This is a **conscious hybrid**, not a bug:
- JSONs provide: `physics_engine_config`, `teacher_script`, `epic_c_branches`, `real_world_anchor`, `mode_overrides`
- TS renderer provides: all primitive drawing, animation, layout for the 55+ concepts it knows

**Implication for Engine 25**: until Ch.8 is retrofitted to populate `scene_composition.primitives`, the 60 existing JSONs are NOT usable as few-shot exemplars for data-driven rendering generation. The gold-standard rebuild (Phase B, `normal_reaction.json`) is the first JSON that will exemplify the full v2 vision end-to-end.

**Implication for the `hasCompleteAtomicPayload` gate**: the gate currently passes empty-primitive JSONs because it only checks key presence. Phase A tightens it to check primitive count ≥ 3, focal_primitive_id set, epic_c_branches ≥ 4, advance_mode variety.

### v2 Target Shape

```json
{
  "concept_id": "normal_reaction",
  "concept_name": "Normal Reaction",
  "chapter": 8,
  "section": "8.1",
  "schema_version": "2.0.0",
  "renderer_pair": { "panel_a": "mechanics_2d", "panel_b": "graph_interactive" },

  "prerequisites": ["vector_addition", "free_body_diagram", "contact_forces"],

  "physics_engine_config": {
    "variables": {
      "m": { "name": "mass", "unit": "kg", "min": 0.5, "max": 10, "default": 2 },
      "theta": { "name": "angle", "unit": "degrees", "min": 0, "max": 90,
                 "default": 30, "role": "slider" }
    },
    "computed_outputs": {
      "N": { "formula": "m * g * cos(theta_rad)" },
      "W": { "formula": "m * g" }
    }
  },

  "real_world_anchor": {
    "primary": "Indian real-world example — NOT from DC Pandey",
    "secondary": "Second Indian example",
    "tertiary": "Third example"
  },

  "epic_l_path": {
    "state_count": 5,
    "states": {
      "STATE_1": {
        "title": "Hook state",
        "duration": 5,
        "focal_primitive_id": "block",
        "advance_mode": "auto_after_tts",
        "allow_deep_dive": false,
        "scene_composition": [
          { "id": "block", "type": "body", "anchor": "surface.floor at 0.4", "width": 80, "height": 60 },
          { "id": "surface", "type": "surface", "anchor": "MAIN_ZONE.bottom" },
          { "id": "mg_arrow", "type": "force_arrow", "origin": "block.center", "direction": "down", "magnitude_expr": "m*g" }
        ],
        "teacher_script": {
          "tts_sentences": [
            { "id": "s1", "text_en": "English only. Never Hinglish." }
          ]
        },
        "choreography_sequence": {
          "phases": [
            { "at_t": 0.0, "show": "floor", "enter": "instant" },
            { "at_t": 1.5, "show": "mg_arrow", "enter": "draw_from_tail", "duration": 0.8 }
          ]
        },
        "drill_downs": []
      },
      "STATE_3": {
        "title": "Decompose mg into parallel + perpendicular (hard state)",
        "focal_primitive_id": "mg_cos_component",
        "advance_mode": "manual_click",
        "allow_deep_dive": true,
        "scene_composition": [ /* ... primitives ... */ ],
        "teacher_script": { "tts_sentences": [ /* ... */ ] },
        "drill_downs": [
          {
            "trigger_phrases": ["why cos not sin", "why cosine here"],
            "cluster_id": "cos_vs_sin_confusion",
            "sub_concept_id": "normal_uses_adjacent_axis",
            "protocol": "MICRO"
          },
          {
            "trigger_phrases": ["where did friction go", "why no friction"],
            "cluster_id": "friction_not_in_fbd",
            "sub_concept_id": "fbd_excludes_zero_forces",
            "protocol": "LOCAL"
          }
        ]
      }
    }
  },

  "epic_c_branches": [
    {
      "branch_id": "unique_id",
      "misconception": "Wrong belief description",
      "trigger_phrases": ["phrase 1", "phrase 2"],
      "state_sequence": ["EPIC_C_1", "EPIC_C_2"],
      "states": {
        "EPIC_C_1": {
          "title": "ALWAYS shows wrong belief — NEVER neutral",
          "scene_composition": [],
          "teacher_script": { "tts_sentences": [] }
        }
      }
    }
  ],

  "regeneration_variants": [
    {
      "variant_id": "unique",
      "type": "B",
      "label": "Physical world name (not 'View 2')",
      "physical_world": "Description",
      "same_physics": "Same law used",
      "scene_hint": "What to draw"
    }
  ],

  "panel_b_config": {
    "renderer": "graph_interactive",
    "x_axis": { "variable": "theta", "label": "Angle (°)", "min": 0, "max": 90 },
    "y_axis": { "variable": "N", "label": "N (N)", "min": 0, "max": 30 },
    "traces": [
      {
        "id": "trace_1",
        "equation_expr": "2 * 9.8 * Math.cos(x * Math.PI/180)",
        "color": "#10B981",
        "label": "N = mgcosθ"
      }
    ],
    "live_dot": {
      "x_variable": "theta",
      "y_expr": "2*9.8*Math.cos(theta*Math.PI/180)",
      "color": "#F59E0B",
      "size": 10
    }
  },

  "mode_overrides": {
    "board": {
      "assessment_style": "numerical_substitution",
      "canvas_style": "answer_sheet",
      "phase_2_content": {
        "exam_pattern": "CBSE_class11",
        "mark_scheme": [
          { "state": "STATE_2", "step": "Draw FBD",           "marks": 1 },
          { "state": "STATE_3", "step": "Resolve mg components", "marks": 1 },
          { "state": "STATE_4", "step": "Apply N = mg cosθ", "marks": 1 },
          { "state": "STATE_5", "step": "Substitute + final answer", "marks": 1 }
        ],
        "derivation_steps": [
          { "id": "d1", "action": "draw_block_on_incline", "narration": "FBD." }
        ],
        "pyq_references": [
          { "year": 2023, "board": "CBSE", "question": "...", "marks": 2 }
        ]
      },
      "derivation_sequence": {
        "STATE_2": {
          "primitives": [
            { "id": "fbd_block", "type": "body", "animate_in": "handwriting" },
            { "id": "mg_arrow",  "type": "force_arrow", "animate_in": "draw_from_tail" },
            { "id": "badge_s2",  "type": "mark_badge", "marks": 1, "position": "top_right" }
          ]
        },
        "STATE_3": {
          "primitives": [
            { "id": "mg_cos", "type": "annotated_vector", "animate_in": "handwriting" },
            { "id": "mg_sin", "type": "annotated_vector", "animate_in": "handwriting" },
            { "id": "badge_s3", "type": "mark_badge", "marks": 1 }
          ]
        },
        "STATE_4": {
          "primitives": [
            { "id": "eqn", "type": "derivation_step", "text": "N = mg cos θ", "animate_in": "handwriting" },
            { "id": "badge_s4", "type": "mark_badge", "marks": 1 }
          ]
        }
      },
      "epic_l_path": {
        "states": {
          "STATE_3": {
            "teacher_script": {
              "tts_sentences": [
                { "id": "s1", "text_en": "Board override for s1 only — use NCERT-exact terminology." }
              ]
            }
          }
        }
      }
    },
    "competitive": {
      "assessment_style": "edge_case_trap",
      "phase_2_content": {
        "exam_pattern": "JEE_main",
        "shortcuts": [],
        "edge_cases": [],
        "pyq_references": []
      }
    }
  }
}
```

---

## DB TABLES

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `ncert_content` | 6,069 NCERT chunks | content_text, class_level, chapter_name, section_name, embedding vector(768) |
| `concept_panel_config` | Renderer + layout per concept | concept_id, default_panel_count, panel_a/b/c_renderer, verified_by_human |
| `student_confusion_log` | Confusion extraction + decomposer data | session_id, confusion_text, extracted_concept_id, student_belief, simulation_emphasis, decomposer_ran, panel_count, primary_concept, supporting_concepts, belief_change_response, misconception_confirmed |
| `session_context` | Per-session NCERT chunk cache | session_id, turn_count, ncert_chunks, conversation_history, concepts_covered |
| `image_context_cache` | pHash-keyed Flash Vision results | image_sha256, phash, phash_16, concept_id, vision_confidence |
| `simulation_cache` | fingerprint_key unique — 5D key | fingerprint_key, sim_html, sim_type, renderer_type, physics_config |
| `simulation_variants` | Variant configs with feedback counts | cache_key, concept_id, variant_index, config, positive_count, negative_count |
| `variant_feedback` | Variant feedback signals | session_id, concept_id, variant_index, signal |
| `response_cache` | Fingerprint-keyed text responses | fingerprint_key, response, response_board, response_competitive, served_count, fact_checked |
| `lesson_cache` | Fingerprint-keyed lessons | fingerprint_key, question_normalized, mode, generated_lesson |
| `verified_concepts` | Hand-verified responses | concept_slug, response_competitive, response_board |
| `ai_usage_log` | Cost tracking per API call | session_id, task_type, provider, model, input_chars, output_chars, latency_ms, estimated_cost_usd, question_date |
| `student_profiles` | Student data (Supabase Auth) | id, name, class, board, goal, first_topic, onboarding_complete |
| `concepts` | Per-student concept tracking | id, session_id, name, concept_class, subject, status |
| `module_progress` | Quiz scores (keeps max) | session_id, module_id, score |
| `conceptual_chats` | Conceptual chat sessions | id, user_id, title, mode, exam, updated_at |
| `problem_chats` | Problem-solving chat sessions | id, user_id, title, mode, updated_at |
| `chat_messages` | Message persistence | chat_id, chat_type, role, content, created_at |
| `chat_feedback` | Message ratings | user_id, chat_id, message_idx, rating |
| `simulation_feedback` | Sim interaction feedback | session_id, concept_id, student_rating, interaction_data |
| `physics_concept_map` | Concept relationships + misconceptions | concept_id, misconceptions[], related_concepts[], simulation_states[] |
| `concept_routing_signals` | Routing overrides | concept_id, trigger_phrases[], force_scope, force_simulation_needed |
| `deep_dive_cache` **(new, Phase D)** | Per-state deep-dive sub-simulations | cache_key, concept_id, state_id, class_level, mode, sub_states_json, status ('pending_review' / 'verified'), positive_count, negative_count, generated_at, reviewed_at, reviewed_by |
| `drill_down_cache` **(new, Phase D)** | Confusion-clustered drill-down sub-sims | cache_key, concept_id, state_id, cluster_id, class_level, mode, trigger_phrases[], sub_sim_json, status, positive_count, negative_count |
| `confusion_cluster_registry` **(new, Phase D)** | Canonical cluster IDs per concept-state | concept_id, state_id, cluster_id, canonical_description, seed_phrases[], verified_by_human |
| `feynman_attempts` **(new, Phase G)** | Student explanations graded by AI | session_id, concept_id, attempt_text, grade_json (accuracy/completeness/misconceptions_detected), teacher_feedback, created_at |
| `feedback_unified` **(planned, Phase I)** | Collector output — all feedback streams unified nightly | feedback_id, source ('chat'/'sim'/'variant'/'confusion'/'test_probe'), concept_id, state_id, mode, severity, type, raw_payload, collected_at |
| `test_session_log` **(planned, Phase I)** | CLAUDE_TEST.md probe output + per-state verdicts | session_id, run_at, concept_id, verdict ('green'/'amber'/'red'), bugs_filed_json, probe_warnings_json, ran_by |
| `proposal_queue` **(planned, Phase I)** | E40 Change Proposer output awaiting Pradeep's review | proposal_id, type ('epic_c_branch'/'drill_down'/'prompt_rule'/'renderer_ticket'/'variant_request'), concept_id, diff_json, evidence_json, validator_status, proposed_at, reviewed_at, decision |
| `engine_bug_queue` **(planned, Phase I)** | Renderer / solver / PCPL-primitive bugs surfaced by feedback or regression | bug_id, severity, engine_file, symptom, linked_feedback_ids[], linked_proposal_ids[], filed_at, resolved_at, fix_commit_sha |
| `equation_cache` | MinerU extraction cache (SHA-256) | image_hash, equations_extracted, plain_text, served_count |

**Planned tables (not yet in any migration SQL):** `tts_translation_cache`, `tts_audio_cache`, `pyq_questions`, `feedback_unified`, `test_session_log`, `proposal_queue`, `engine_bug_queue`. Do not assume these exist — verify with `list_tables` before writing code that touches them.

---

## ENVIRONMENT VARIABLES

```bash
# Required
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
GOOGLE_GENERATIVE_AI_API_KEY=   # Gemini Flash
ANTHROPIC_API_KEY=               # Claude Sonnet 4.6

# Optional
MINERU_SERVICE_URL=http://localhost:8000   # MinerU equation extraction
DEEPSEEK_API_KEY=                          # DeepSeek (falls back to Claude Haiku)
```

---

## RENDERERS (9 pre-built, in `src/lib/renderers/`)

| Renderer | File | Concepts |
|----------|------|----------|
| `particle_field` | `particle_field_renderer.ts` (21KB) | drift_velocity, parallel_plate_capacitor, etc. |
| `circuit_live` | (via aiSimulationGenerator) | parallel_resistance, kirchhoffs_laws, wheatstone_bridge, transformer, lcr_series_circuit |
| `graph_interactive` | `graph_interactive_renderer.ts` (17KB) | ohms_law, electric_power_heating, ac_basics, phasors, resonance_lcr, power_in_ac |
| `mechanics_2d` | `mechanics_2d_renderer.ts` (315KB) | projectile_motion, uniform_circular_motion, vector_addition, tension_in_string, free_body_diagram, etc. (55+ concepts) |
| `wave_canvas` | `wave_canvas_renderer.ts` (35KB) | wave_superposition, standing_waves, beats_waves, doppler_effect |
| `optics_ray` | `optics_ray_renderer.ts` (44KB) | convex_lens, concave_mirror, refraction_snells_law, total_internal_reflection, prism_dispersion |
| `field_3d` | `field_3d_renderer.ts` (48KB) | electric_field_lines, magnetic_field_solenoid, gauss_law_3d, bar_magnet_field |
| `thermodynamics` | `thermodynamics_renderer.ts` (30KB) | first_law_thermodynamics, isothermal_process, adiabatic_process, carnot_engine |
| `parametric` | `parametric_renderer.ts` (22KB) | Generic parametric curves (Math.js expression parsing) |
| `ohmsLaw` (legacy) | `ohmsLawRenderer.ts` (15KB) | Legacy circuit renderer |

### PCPL Renderer (`src/lib/pcplRenderer/`)

Physics Composition & Primitive Language — reusable diagram primitives:
- Primitives: body, surface, force_arrow, vector, angle_arc, label, formula_box, annotation, comparison_panel, projection_shadow, motion_path, slider
- Entry: `renderSceneComposition()` dispatches PrimitiveSpec[] to primitive drawers

### Physics Engine (`src/lib/physicsEngine/`)

Compute forces/accelerations for force concepts (zero AI cost):
- Concepts: contact_forces, field_forces, normal_reaction, tension_in_string, hinge_force, free_body_diagram
- Entry: `computePhysics(conceptId, variables)` → PhysicsResult

### RENDERER_MAP routing (smaller fallback table)

```
ohms_law / resistivity / photoelectric / coulombs_law / electric_power_heating → graph_interactive
kirchhoffs_laws → particle_field
default → particle_field (or concept-specific AI p5.js)
```

### resolveRendererType() — 4-stage resolution

1. Exact `CONCEPT_RENDERER_MAP` match (takes priority)
2. Legacy `RENDERER_MAP` exact match
3. Strip known suffixes (`_basic`, `_advanced`, `_jee`) and retry
4. Partial `RENDERER_MAP` match → default to `particle_field`

---

## API ROUTES (20 route directories)

### Core

| Route | Methods | Purpose |
|-------|---------|---------|
| `/api/chat` | POST | Main chat handler — 3-tier cache, intent routing, image pipeline, MVS, session context |
| `/api/chat/belief-update` | POST | Records belief-change response (changed/partial/unchanged) |
| `/api/chat/clarification-resume` | POST | **RETIRED** — returns 410 Gone |
| `/api/generate-simulation` | POST | 5-stage simulation pipeline — single or multi-panel, fingerprint cache, variant management |
| `/api/generate-lesson` | POST | Lesson generation with fingerprint caching and simulation values |
| `/api/mvs-response` | POST | Misconception verification response (YES/NO → tailored explanation) |

### Chat Management

| Route | Methods | Purpose |
|-------|---------|---------|
| `/api/chats/conceptual` | GET, POST, PATCH, DELETE | CRUD for conceptual chat sessions |
| `/api/chats/problems` | GET, POST, PATCH, DELETE | CRUD for problem-solving chat sessions |
| `/api/chats/messages` | GET, POST | Fetch/save chat messages (full replace on POST) |
| `/api/chats/feedback` | POST | Message rating feedback |
| `/api/conceptual-chat/mode` | POST | Update chat mode (both/explain/quiz/simulation) |

### Student & Progress

| Route | Methods | Purpose |
|-------|---------|---------|
| `/api/student` | GET, POST | Load/save student profile, concepts, module progress |
| `/api/concepts` | POST, PATCH | Upsert and update concept status |
| `/api/progress` | POST | Track module quiz scores (keeps highest) |

### Content Generation

| Route | Methods | Purpose |
|-------|---------|---------|
| `/api/concept` | POST | Quick concept refresher (4 lines) |
| `/api/quiz` | POST | Diagnostic MCQ from conversation |
| `/api/mcqset` | POST | Bulk generate 5 MCQs for module/exam |
| `/api/revision-card` | POST | 5-minute revision card from chat history |
| `/api/tip` | POST | Simulation tip (2-3 lines, Gemini Flash) |

### Feedback & Variants

| Route | Methods | Purpose |
|-------|---------|---------|
| `/api/simulation-feedback` | POST | Emoji rating on simulation interaction |
| `/api/feedback/signal` | POST | Positive/negative signal on simulation variant |
| `/api/feedback/generate-variant` | POST | Generate new variant after negative signal |

### Auth & Test

| Route | Methods | Purpose |
|-------|---------|---------|
| `/api/auth/callback` | GET | OAuth callback (Google login redirect) |
| `/api/test-sim` | POST | Test simulation pipeline (no auth) |
| `/api/test-lesson` | GET | Test lesson generation (no auth) |
| `/api/test-ncert` | GET | Test NCERT embedding & vector search |

---

## PAGES

| Route | File | Purpose |
|-------|------|---------|
| `/` | `src/app/page.tsx` | Main app shell — Onboarding or ProgressTrackerClient |
| `/login` | `src/app/login/page.tsx` | Email/password + Google OAuth login |
| `/bookmarks` | `src/app/bookmarks/page.tsx` | Saved responses & MCQs library with filtering |
| `/admin/costs` | `src/app/admin/costs/page.tsx` | Cost analytics dashboard (server component) |
| `/admin/deep-dive-review` | `src/app/admin/deep-dive-review/page.tsx` | Phase D — approve/reject Sonnet-generated deep-dive sub-sims (solver status badges + violation-count chips) |
| `/admin/drill-down-review` | `src/app/admin/drill-down-review/page.tsx` | Phase D — approve/reject drill-down sub-sims (same UX pattern) |
| `/admin/proposal-queue` **(planned, Phase I)** | `src/app/admin/proposal-queue/page.tsx` | Pradeep's 5-min morning review — groups E40 Change Proposer output into 🟢 auto-promoted / 🟡 needs-approval / 🔴 recurring-bugs tiers. One-click ✓/✗ per proposal. |
| `/test-teacher` | `src/app/test-teacher/page.tsx` | Teacher simulation player test page |

---

## SIMULATION PIPELINE DETAILS

### PostMessage Contract (ALL renderers must implement)

```js
// On load:
window.parent.postMessage({ type: 'SIM_READY' }, '*');

// On state applied:
window.parent.postMessage({ type: 'STATE_REACHED', state: 'STATE_N' }, '*');

// Listen for:
window.addEventListener('message', (e) => {
  if (e.data.type === 'SET_STATE') applySimState(e.data.state);
});
```

### EPIC-C Protocol (specific_confusion)

STATE_1 = **wrong belief rendered visually** (mandatory — never neutral/baseline)
→ STATE_2 = conflict shown
→ STATE_3 = undeniable proof
→ STATE_4 = interactive consolidation

EPIC-C branches may have **4–7 states**; do not hardcode 4.

STATE_1 EPIC-C rules:
- Wrong ammeter values must be on-canvas with label
- Three electron segment arrays (segment1: ~15, segment2: ~9, segment3: ~4)
- No "zero current" or "random thermal motion" — belief IS the starting state
- Brief Writer max_tokens: **3500**
- No ghost overlays, split-screen, sponge icons, pulsing effects (causes broken JS)

### EPIC-L Protocol (full_explanation) — 6 states

STATE_1=daily life → STATE_2=mechanism → STATE_3=formula connection → STATE_4=concept depth → STATE_5=edge case → STATE_6=interactive consolidation.

EPIC-L State Arc (NOT fixed count):
- STATE_1: daily life hook
- STATE_2: mechanism (how it works)
- STATE_3: formula connection (visual BEFORE formula)
- STATE_4: concept depth / edge case
- STATE_5: interactive exploration (sliders)
- STATE_N: as many as concept complexity requires

Other protocols: **micro = 2–3 states, board = 5–8 states.**

### Sim State Switching — Hard Rule

```js
// CORRECT — read PM_currentState every frame
if (PM_currentState === 'STATE_1') { ... }
else if (PM_currentState === 'STATE_2') { ... }

// WRONG — creates second state variable, never updated by TeacherPlayer
let currentState = 1;
if (currentState === 1) { ... }
```

### Physics Constants

- Concept JSONs in `src/data/concepts/` (23 new) and `src/lib/physics_constants/` (171 legacy)
- Load via `loadConstants(conceptId)` — dynamic, not hardcoded
- `normalizeConstants()` handles new format, legacy Schema A (object) and Schema B (array)
- `PHYSICS_CONSTANTS_MAP` was removed — do not re-introduce it
- Concept aliases: `relative_motion_in_2d`→`river_boat_problems`, `kinematics_1d`→`uniform_acceleration`

### CONCEPT_SIM_GUIDANCE (8 concepts with detailed state progression)

ohms_law, series_resistance, electric_power_heating, resistance_temperature_dependence, photoelectric, drift_velocity, kirchhoffs_laws, coulombs_law.

Each provides STATE_1..STATE_4 guidance injected into the Brief prompt via `buildBriefPrompt(conceptId)`.

---

## SESSION CONTEXT CACHING

- Turn 1: session_context ALWAYS written, even for cache hits (ncert_chunks: [] for cache hits)
- Turn 2+: reads ncert_chunks from session → skips pgvector for explain functions
- `specific_confusion` intent: also reuses session chunks if available
- Concept change mid-session: invalidates session cache, runs fresh pgvector

---

## IMAGE PIPELINE

- Flash Vision: runs when `isFirstMessage || hasNewImage` (not MVS responses)
- Two-layer: Flash → Sonnet fallback if Flash confidence < 0.85
- pHash (dhash): 64-bit perceptual hash → Hamming distance < 10 = cache hit
- image_context_cache: keyed by image_sha256 (onConflict), pHash for lookup
- Supports: JPEG, PNG, WebP, GIF (max 10MB)
- marked_region: cropped via sharp → Flash Vision describes the highlighted area
- markedRegionDescription flows into: intentResolver (forces specific_confusion bias) + extractStudentConfusion
- Marked region boost: +0.08 confidence (capped 0.97) for confusion extraction

---

## VARIANT FEEDBACK LOOP

1. Student rates simulation negatively → `/api/feedback/signal` records signal
2. System picks next unseen variant from concept's `regeneration_variants[]`
3. If cached variant exists in `simulation_variants` table → return immediately
4. Otherwise → `/api/feedback/generate-variant` generates new sim with different approach
5. `SimulationSwitcher` component renders approach pill labels for switching

---

## COST GUIDELINES

Follow `/cost-aware-llm-pipeline` before touching any model call:
- Flash for classification, explanation, MCQ, tips (high volume, $0.10/$0.30 per 1M tokens)
- Sonnet for structured JSON, confusion extraction, complex problems ($3.00/$15.00 per 1M tokens)
- DeepSeek for animation generation ($0.14/$0.28 per 1M tokens)
- Never call Sonnet for tasks that Flash handles (classification, simple explanations)
- Confusion extraction: maxTokens 400 (sufficient for the schema, cheaper)
- Cache everything: verified_concepts → response_cache → simulation_cache
- Provider fallback: Google→Anthropic, Anthropic→Google, DeepSeek→Anthropic

---

## SCRIPTS (`src/scripts/`)

| Script | Purpose |
|--------|---------|
| `seed-concepts.ts` | Seeds verified_concepts table |
| `seed-concepts-runner.mjs` | Node wrapper for seed-concepts |
| `extract-ncert.mjs` | PDF extraction → markdown + vector embeddings |
| `reembed-ncert.mjs` | Re-embed NCERT content with updated embeddings |
| `reextract-ncert.py` | Python NCERT extraction pipeline |
| `extract_ncert_class10.py` | NCERT Class 10 extraction |
| `importConceptMap.ts` | Bulk import concept JSON → physics_concept_map table |
| `compileRoutingSignals.ts` | Compile routing signals for concept navigation |
| `embed-dc-pandey.mjs` | Embed DC Pandey content |
| `embed-json-chunks.mjs` | Generic JSON chunk embedder |
| `ingest-dc-pandey.py` | Ingest DC Pandey chapters |
| `ingest-dcp-em.py` | Ingest DC Pandey Electromagnetism |
| `ingest-dcp-optics.py` | Ingest DC Pandey Optics |
| `scan-dcp-chapters.py` | Scan DC Pandey chapter structure |
| `chunkBook.ts` | Chunk large PDFs for embedding |
| `ingestBook.ts` | Generic book ingestion driver |
| `clear_cache.mjs` | Clear Supabase vector caches |
| `testStage2.ts` | Test Stage 2 simulation generation |
| `cleanup-garbled-ncert.sql` | Remove garbled NCERT rows |

---

## SQL MIGRATIONS (root directory)

| File | Purpose |
|------|---------|
| `supabase_schema.sql` | Core schema: student_profiles, concepts, module_progress, ai_usage_log, RLS |
| `supabase_ncert_migration.sql` | ncert_content table + embeddings |
| `supabase_phase2_migration.sql` | Phase 2: physics_concept_map, concept relationships |
| `supabase_dual_panel_migration.sql` | Dual-panel support |
| `supabase_image_cache_constraint.sql` | Image cache constraints |
| `supabase_dc_pandey_migration.sql` | DC Pandey problems table |
| `supabase_ncert_cleanup_migration.sql` | Cleanup garbled NCERT rows |
| `supabase_session_concepts_migration.sql` | Concept-session mappings |
| `supabase_routing_signals_migration.sql` | Routing signals table |
| `supabase_vector_addition_panel.sql` | Vector addition panel config |
| `supabase_cleanup_and_migrations.sql` | Consolidated cleanup + fixes |
| `student_confusion_log.sql` | Student confusion logging |

---

## DEPENDENCIES

```
Next.js 16.1.6 | React 19.2.3 | TypeScript 5
AI: @ai-sdk/anthropic, @ai-sdk/google, @ai-sdk/react, @anthropic-ai/sdk, @google/generative-ai, ai
Backend: @supabase/ssr, @supabase/supabase-js, dotenv, sharp, pdf-parse
Frontend: lucide-react, react-markdown, react-resizable-panels, remark-gfm, remark-math, rehype-katex, katex, react-katex
Dev: tailwindcss 4, eslint, concurrently
```

---

## MINERU SERVICE (`mineru-service/`)

Python FastAPI microservice for equation extraction from textbook images.
- `GET /health` → `{ status: "ok" }`
- `POST /extract` → accepts image → runs `mineru` CLI → extracts LaTeX equations
- Returns: `{ success, equations[], equation_count, plain_text, raw_markdown }`
- CORS: localhost:3000, localhost:3001

---

## IMMEDIATE FIRST TASK WHEN ASKED

Read `src/lib/renderers/mechanics_2d_renderer.ts`
Find the `vector_addition` scenario dispatch function.
List every scenario string it currently recognises.
Also list Panel B scenario strings in `graph_interactive_renderer.ts`
for mechanics concepts (not electrical).
Paste the list only. No changes.
