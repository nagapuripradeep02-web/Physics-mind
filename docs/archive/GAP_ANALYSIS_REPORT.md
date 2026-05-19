# PhysicsMind — Gap Analysis Report
## Current Architecture vs. New Architecture v2.0
**Date:** April 13, 2026 | **Prepared by:** Antigravity (Engineer)

---

## Executive Summary

The New Architecture v2.0 document describes a **fundamental paradigm shift** from the current system. The core change: **LLM moves from being a renderer to being a selector**. Currently, Sonnet writes physics configs and picks from 130+ hardcoded renderer scenarios. In v2, Sonnet is removed from the rendering loop entirely — replaced by a Physics Engine (pure TypeScript math) + PCPL (12 universal primitives) + Zone Layout Engine (deterministic positioning).

**Current state:** ~40% of the v2 infrastructure exists. EPIC-L bypass works. The simulation pipeline runs. NCERT grounding is solid. But the entire PCPL layer, Physics Engine, Zone Layout Engine, Board Mode Phase 2, TTS, Image Intake, and Multi-Agent authoring pipeline are **completely unbuilt**.

**Estimated build effort:** 8 weeks (per the document's own timeline).

---

## Table of Contents

1. [Layer-by-Layer Gap Analysis](#1-layer-by-layer-gap-analysis)
2. [Component Inventory: EXISTS vs. NEEDED](#2-component-inventory)
3. [Database Gaps](#3-database-gaps)
4. [Model Routing Gaps](#4-model-routing-gaps)
5. [Renderer & Simulation Gaps](#5-renderer--simulation-gaps)
6. [Frontend Gaps](#6-frontend-gaps)
7. [Known Bugs & Issues in Current Codebase](#7-known-bugs--issues)
8. [Migration Risks](#8-migration-risks)
9. [Recommended Build Order](#9-recommended-build-order)
10. [What NOT to Touch](#10-what-not-to-touch)

---

## 1. Layer-by-Layer Gap Analysis

### Layer 0: Unified Router

| Aspect | Current State | v2 Target | Gap |
|--------|--------------|-----------|-----|
| **Router architecture** | Split-brain: `intentClassifier.ts` + `intentResolver.ts` run independently | Single `UnifiedRouter` — one Haiku call, one `ResolvedIntent` object | **CRITICAL — Full rewrite needed** |
| **Concept resolution** | `classifyQuestion()` returns 5D fingerprint; `resolveStudentIntent()` runs autonomously in parallel | Single call returns `{ concept_id, interaction_type, scope, max_states, student_values, session_state, mode, book_faithful_mode }` | **New fields: scope, max_states, student_values, book_faithful_mode** |
| **Interaction types** | Current: `full_explanation`, `specific_confusion`, `what_if`, `numerical`, `derivation` (5 types) | v2: 10 types (adds `local_gap`, `micro_symbol`, `comparison`, `cross_concept`, `follow_up`, `marked_region`, `board_mode`) | **5 new interaction types to implement** |
| **Scope system** | Does not exist — all queries treated as "global" | `global` (6 states), `local` (3 states), `micro` (2 states) — decided once, enforced everywhere | **Entirely new concept** |
| **max_states enforcement** | Set in multiple places (jsonModifier, Brief prompt, Stage 4) — inconsistent | Set by router ONLY, enforced by TypeScript Post-Processor at single truncation point | **Architecture change** |
| **Student values extraction** | Not extracted by router — Sonnet guesses from context | Router extracts `student_values: { A:4, B:3, theta:'slider' }` and passes downstream | **New extraction logic** |
| **Model used** | Gemini 2.5 Flash for classification | Claude Haiku 4.5 (or rule-based fallback) | **Model switch** |

**Status: 🔴 NOT STARTED — Requires full new implementation**

---

### Layer 1: Physics Engine

| Aspect | Current State | v2 Target | Gap |
|--------|--------------|-----------|-----|
| **Existence** | Does not exist | Pure TypeScript math engine — zero AI, zero variance | **ENTIRELY NEW** |
| **Formula computation** | Sonnet writes formulas in Stage 2 prompt | Physics Engine computes ALL derived quantities from student_values using human-coded formulas | **Paradigm shift** |
| **Coordinate system** | LLM writes pixel coordinates | LLM writes degrees; Physics Engine converts to radians internally; Zone Engine converts to screen coords | **New coordinate pipeline** |
| **Physics validation** | `physicsValidator.ts` validates Stage 2 output against locked_facts | Physics Engine validates scene_composition against computed quantities — checks formulas, ranges, special cases | **Stronger validation** |
| **PhysicsComputedState** | Does not exist | Output object with all computed values, valid_range, special_cases, formula_strings | **New data structure** |
| **Student value injection** | Sonnet supposed to emit values but often doesn't (the "A=5 instead of A=4" bug) | TypeScript Post-Processor creates `pl.vector_a.magnitude = 4` on every state — guaranteed correct | **Fixes known bug** |

**Status: 🔴 NOT STARTED — Week 1 build priority**

---

### Layer 2: PCPL (Physics-Constrained Parametric Composition Layer)

| Aspect | Current State | v2 Target | Gap |
|--------|--------------|-----------|-----|
| **Rendering approach** | 130+ hardcoded renderer scenarios across 8 renderer files (particle_field, circuit_live, graph_interactive, mechanics_2d, wave_canvas, optics_ray, field_3d, thermodynamics) | 12 universal physics primitives (vector, resultant, slider, projection_shadow, angle_arc, formula_box, number_line, graph, choreography, formula_sequence, solve_display, comparison_panel) | **FUNDAMENTAL REWRITE** |
| **Scene specification** | Sonnet writes full `PhysicsConfig` JSON (~200 lines) in Stage 2 | Haiku writes `scene_composition` (~6 lines per state) from primitives vocabulary | **Massively simplified Stage 2** |
| **Concept coverage** | Each new concept needs 10-20 new renderer functions written | Each new concept needs only a JSON file — PCPL renderer handles any composition | **Scalability breakthrough** |
| **"Visual implementation pending"** | Shows for any concept without a named scenario | Cannot happen — primitives work for any concept | **Eliminates entire bug class** |
| **PCPL renderer** | Does not exist | Single renderer reads scene_composition, instantiates primitives, applies zones | **New core component** |

**Current renderer files that would be REPLACED for EPIC-C/Local/Micro paths (NOT for EPIC-L):**
- `src/lib/renderers/mechanics_2d_renderer.ts`
- `src/lib/renderers/particle_field_renderer.ts`
- `src/lib/renderers/graph_interactive_renderer.ts`
- `src/lib/renderers/optics_ray_renderer.ts`
- `src/lib/renderers/field_3d_renderer.ts`
- `src/lib/renderers/wave_canvas_renderer.ts`
- `src/lib/renderers/thermodynamics_renderer.ts`
- `src/lib/renderers/ohmsLawRenderer.ts`

**Note:** These renderers STAY for EPIC-L bypass. Only EPIC-C/Local/Micro paths switch to PCPL.

**Status: 🔴 NOT STARTED — Weeks 2-3 build priority**

---

### Layer 3: Zone Layout Engine

| Aspect | Current State | v2 Target | Gap |
|--------|--------------|-----------|-----|
| **Layout system** | LLM specifies canvas dimensions and element positions in PhysicsConfig | Zone engine divides canvas into 4 zones (INFO_ZONE, MAIN_ZONE, CONTROL_ZONE) with 4 layout configs (teaching, exploration, comparison, minimal) | **Entirely new** |
| **Scale computation** | Hardcoded or LLM-guessed | Physics-aware: `UNIT_TO_PX = MAIN_ZONE.height * 0.70 / maxMagnitude` — automatic for any student values | **New** |
| **Anchor system** | LLM writes pixel coordinates | LLM writes semantic anchors (`center_left`, `tail_at_vec_a_head`); engine resolves to pixels | **New** |
| **Collision detection** | Does not exist — overlapping labels common | Label bounding box collision check (<5ms), push apart on collision axis | **New** |
| **Focal primitive** | Does not exist — states often look identical | Each state declares focal_primitive + focal_treatment (pulse, highlight, dim others) | **Solves Limitation 3** |

**Status: 🔴 NOT STARTED — Week 1-2 build priority**

---

### Layer 4: Choreography & Transition Engines

| Aspect | Current State | v2 Target | Gap |
|--------|--------------|-----------|-----|
| **Within-state animation** | Renderer-specific, hardcoded per scenario | Choreography engine: LLM writes ~30 tokens of timing intent; engine computes all frames | **New** |
| **Between-state transitions** | Abrupt state switches (postMessage SET_STATE → immediate redraw) | Transition engine diffs two scene_compositions, interpolates over 800ms with ease-in-out | **New** |
| **Animation modes** | Fixed per renderer | Per-primitive animation mode (rotate_with_slider, draw_from_tail, fade_in, draw_diagonal) | **New** |
| **Physics during transitions** | Not computed | Physics Engine computes intermediate values — physics correct at every frame | **New** |

**Status: 🔴 NOT STARTED — Week 2 build priority**

---

### Layer 5: Stage 2 + Canvas Summary Bridge + Stage 4

| Aspect | Current State | v2 Target | Gap |
|--------|--------------|-----------|-----|
| **Stage 2 model** | Claude Sonnet 4.6 (expensive) | Claude Haiku 4.5 (10x cheaper) | **Model downgrade — simpler task** |
| **Stage 2 output** | Full PhysicsConfig JSON (~200 lines) | scene_composition (~6 lines/state) + canvas_summary (2 sentences/state) | **Massively simplified** |
| **Canvas Summary Bridge** | Does not exist — Stage 4 guesses what student sees | Stage 2 writes canvas_summary per state; Stage 4 receives it → captions perfectly synced | **KEY INNOVATION — New** |
| **Stage 4 input** | Receives Brief + PhysicsConfig | Receives canvas_summary + pedagogical_moment + session_state + student_values | **Different input contract** |
| **Caption quality** | Sonnet captions sometimes describe wrong visuals | Sonnet knows EXACTLY what student sees via canvas_summary | **Fixes sync bug** |

**Status: 🔴 NOT STARTED — Week 4 build priority**

---

### Layer 6: Panel B Composition

| Aspect | Current State | v2 Target | Gap |
|--------|--------------|-----------|-----|
| **Panel B implementation** | `graph_interactive_renderer.ts` with hardcoded Plotly scenarios | 6 Panel B primitives (curve, horizontal_line, live_dot, vertical_marker, dual_curve, bar_chart) | **Rewrite for PCPL path** |
| **Sync mechanism** | `DualPanelSimulation.tsx` waits SIM_READY from both panels — race condition prone | Physics Engine pre-computes ALL values; both panels render from same PhysicsComputedState simultaneously | **Architecture fix** |
| **Panel B specification** | Sonnet writes full Plotly config in Stage 2 | Haiku writes `panel_b_composition` alongside scene_composition | **Simplified** |

**Status: 🟡 PARTIAL — DualPanelSimulation.tsx exists but needs PCPL integration (Week 3)**

---

### Layer 7: Caching

| Aspect | Current State | v2 Target | Gap |
|--------|--------------|-----------|-----|
| **Cache levels** | 3-tier: verified_concepts → response_cache → AI generation; simulation_cache flat keyed by `concept_id\|intent\|class\|mode\|aspect` | 2-level: L1 Structural (shared structure, skip Stage 2) + L2 Value (exact student values, skip everything) | **Different cache architecture** |
| **Student-specific caching** | Not supported — same cache for all students regardless of their values | L2 key includes student_values (A=4, B=3) — different students get correctly cached different sims | **New** |
| **Cache key** | 5D: `concept_id\|intent\|class_level\|mode\|aspect` | L1: `concept_id\|intent\|mode\|misconception_type\|scope`; L2: L1 + student_values | **Different key structure** |

**Status: 🟡 PARTIAL — Cache infrastructure exists but needs restructuring (Week 4)**

---

### Layer 8: Session Continuity

| Aspect | Current State | v2 Target | Gap |
|--------|--------------|-----------|-----|
| **Session state** | `session_context` table stores NCERT chunks per session; `ProfileContext` tracks concepts learned | Full `SessionState` object: `{ concepts_seen, current_simulation, confusion_resolved }` — passed to every downstream stage | **Enhancement needed** |
| **Session-aware behavior** | Session context used to skip pgvector on repeat queries | v2: EPIC-C skips STATE_1 if EPIC-L already seen; Local skips resolved corrections; Board skips Phase 1 if concept understood | **New intelligence** |
| **Adaptive bridge states** | Does not exist | If student stays on STATE_2 >45s without engagement → insert simplified STATE_2b | **New — deferred to post-50-students** |

**Status: 🟡 PARTIAL — Foundation exists, needs SessionState object (Week 5)**

---

### Layer 9: Board Mode

| Aspect | Current State | v2 Target | Gap |
|--------|--------------|-----------|-----|
| **Board mode current** | `explainBoardExam()` in teacherEngine.ts — Gemini Flash generates text explanation; strategy buttons are UI-only | Two-phase: Phase 1 (EPIC-L bypass, 2-3 states) + Phase 2 (diagram_tutor_renderer, derivation steps, mark scheme, PYQ panel) | **MAJOR EXPANSION** |
| **diagram_tutor_renderer** | Does not exist | SVG path animation with stroke-dashoffset; handwriting simulation; step-by-step with sync_points | **Entirely new renderer** |
| **Mark weightage system** | Does not exist | Each diagram/derivation step carries mark_contribution; Mark Scheme Panel shows real-time highlights | **New feature** |
| **PYQ system** | Does not exist (table planned but not built) | CBSE + 6 state board papers → MinerU extraction → pgvector → PYQ panel with frequency data | **Major new pipeline** |
| **Board mode LLM usage** | Gemini Flash generates explanations in real-time | Zero LLM in delivery — all pre-authored JSON. Sonnet only for on-demand model answers | **Paradigm shift** |
| **Derivation steps** | Not structured | JSON `derivation_steps[]` with mark_contribution per step | **New JSON section** |

**Status: 🔴 NOT STARTED — Week 6 build priority**

---

### Layer 10: Image Intake

| Aspect | Current State | v2 Target | Gap |
|--------|--------------|-----------|-----|
| **Current image pipeline** | Flash Vision on first message or new image; pHash for dedup; image_context_cache; marked_region via sharp crop | Full Image Intake Layer: 6 input cases, IsVisualHelpful decision, MinerU+Vision parallel extraction, ConceptDocument, Book Profile Builder | **MAJOR EXPANSION** |
| **ConceptDocument** | Does not exist | Multi-page upload builds `{ source_book, concept_id, notation_map, method_sequence, formulas, worked_examples, diagrams, book_language_samples }` | **Entirely new** |
| **Book Profile Builder** | Does not exist | After 10+ uploads from same book → persistent profile with notation patterns, method preferences | **New feature** |
| **Notation map flow** | Does not exist | notation_map overrides ALL labels in scene_composition, Stage 4 captions, Sonnet explanation | **New pipeline feature** |
| **Formula validation** | Does not exist | Physics Engine compares extracted formula against known formula — catches OCR errors and textbook variations | **New** |
| **6 input cases** | Current: image + question → Flash Vision → context injected | v2: marked region micro, marked diagram EPIC-L, multi-page book-faithful, single image, marked formula, handwritten work — each with different pipeline | **5 new cases** |

**Status: 🟡 PARTIAL — Basic image pipeline exists; 80% new work needed (Week 6)**

---

### Layer 11: TTS (Text-to-Speech)

| Aspect | Current State | v2 Target | Gap |
|--------|--------------|-----------|-----|
| **TTS implementation** | Does not exist (planned tables `tts_translation_cache`, `tts_audio_cache` mentioned but not built) | Sarvam AI integration across all 3 tracks; sync_points for board mode; choreography timing gates for PCPL | **ENTIRELY NEW** |
| **Voice provider** | N/A | Sarvam AI (Indian English) — ~$0.001 per 1,000 chars | **New vendor integration** |
| **Sync mechanisms** | N/A | EPIC-L: free-running; PCPL: choreography total_duration gate; Board Phase 1: sync_points; Board Phase 2: step_N_complete events | **4 different sync modes** |
| **Fallback** | N/A | Subtitle text always shown for students without headphones | **New UI element** |

**Status: 🔴 NOT STARTED — Week 6 build priority**

---

### Layer 12: Multi-Agent JSON Authoring

| Aspect | Current State | v2 Target | Gap |
|--------|--------------|-----------|-----|
| **Concept authoring** | Manual JSON creation by Claude project (Architect) | 5-agent offline pipeline: Physics Expert → Pedagogy → Scenario Designer → Physics Validator → Quality Reviewer | **ENTIRELY NEW** |
| **Agent cost** | N/A | ~$0.05 per concept; ~$5 for entire curriculum (100 concepts) | **Efficient** |
| **Feedback loop** | `student_confusion_log` accumulates but not systematically fed back | Nightly feedback agent reads confusion_log → improves JSONs → next student gets better simulation | **New feedback pipeline** |
| **Content scope** | ~18 concept JSONs (Ch.5-7 mechanics + current electricity) | Full Class 11-12 curriculum (~100 simulation-worthy concepts) | **5x content expansion** |

**Status: 🔴 NOT STARTED — Week 7 build priority**

---

## 2. Component Inventory

### EXISTS and STAYS UNCHANGED ✅

| Component | File | Status |
|-----------|------|--------|
| EPIC-L JSON bypass | `physics_constants/index.ts` + `jsonBridge.ts` | ✅ Working, untouched |
| mechanics_2d_renderer (EPIC-L) | `renderers/mechanics_2d_renderer.ts` | ✅ Stays for EPIC-L |
| All 16 Ch.5-7 EPIC-L JSONs | `src/data/concepts/*.json` | ✅ Valid, cached |
| NCERT pgvector corpus | `ncert_content` table (6,069 chunks) | ✅ Untouched |
| Variant pills (regeneration_variants) | Concept JSONs | ✅ Working |
| DualPanelSimulation.tsx core | `src/components/DualPanelSimulation.tsx` | ✅ Minor updates only |
| MinerU microservice | `mineru-service/` on port 8000 | ✅ Extended use in v2 |
| student_confusion_log | Supabase table | ✅ Protected, never deleted |
| NCERTSourcesWidget | `src/components/NCERTSourcesWidget.tsx` | ✅ No changes |
| Supabase clients | `supabaseAdmin`, `supabaseServer`, `supabaseBrowser` | ✅ No changes |
| Auth system | `src/proxy.ts` | ✅ Session-based, unchanged |
| ProfileContext | `src/contexts/ProfileContext.tsx` | ✅ Enhancement only |

### EXISTS but NEEDS MODIFICATION 🟡

| Component | File | What Changes |
|-----------|------|-------------|
| `intentClassifier.ts` | `src/lib/intentClassifier.ts` | Replaced by Unified Router (Haiku) — may be partially reusable |
| `intentResolver.ts` | `src/lib/intentResolver.ts` | Merged into Unified Router |
| `aiSimulationGenerator.ts` | `src/lib/aiSimulationGenerator.ts` (~280KB) | Stage 2 rewritten (Haiku + scene_composition); Stage 4 receives canvas_summary |
| `stage2Runner.ts` | `src/lib/simulation/stage2Runner.ts` | Outputs scene_composition instead of PhysicsConfig |
| `stage2Prompt.ts` | `src/lib/simulation/stage2Prompt.ts` | Complete prompt rewrite for primitives vocabulary |
| `queryRouter.ts` | `src/lib/queryRouter.ts` | Cache key restructure (2-level) |
| `chat/route.ts` | `src/app/api/chat/route.ts` | Router integration, SessionState, scope/max_states |
| `generate-simulation/route.ts` | `src/app/api/generate-simulation/route.ts` | PCPL pipeline integration |
| `TeacherPlayer.tsx` | `src/components/TeacherPlayer.tsx` | TTS integration, canvas_summary sync |
| `LearnConceptTab.tsx` | `src/components/sections/LearnConceptTab.tsx` | SessionState, scope-aware UI |
| `panelConfig.ts` | `src/config/panelConfig.ts` | Zone configs, PCPL routing |
| Concept JSONs | `src/data/concepts/*.json` | New sections: `physics_engine_config`, `board_mode`, expanded `epic_c_branches` |
| `modelRouter.ts` | `src/lib/modelRouter.ts` | Haiku added, DeepSeek removed from sim pipeline |

### DOES NOT EXIST — MUST BE BUILT 🔴

| Component | Description | Priority |
|-----------|------------|----------|
| **Physics Engine** | Pure TypeScript math — computes ALL derived quantities from student_values | Week 1 |
| **Zone Layout Engine** | 4 zone configs, scale intelligence, anchor resolution, collision detection | Week 1-2 |
| **12 Physics Primitives** | p5.js implementations of vector, resultant, slider, projection_shadow, angle_arc, formula_box, number_line, choreography, formula_sequence, solve_display, comparison_panel + graph (Plotly) | Week 2 |
| **PCPL Renderer** | Single renderer that reads scene_composition and executes any primitive combination | Week 3 |
| **Choreography Engine** | Within-state animation sequencing from LLM timing intent | Week 2 |
| **Transition Engine** | Between-state morphing with physics-correct interpolation | Week 2 |
| **Canvas Summary Bridge** | Stage 2 writes canvas_summary; flows to Stage 4 | Week 4 |
| **Unified Router** | Single Haiku call → ResolvedIntent with all fields | Week 4 |
| **TypeScript Post-Processor** | Student value injection, max_states truncation, session_state awareness | Week 3-4 |
| **SessionState object** | Per-session tracking of concepts_seen, current_simulation, confusion_resolved | Week 5 |
| **Canvas hotspot pipeline** | Tap on primitive → micro scope PCPL pipeline | Week 5 |
| **diagram_tutor_renderer** | SVG path animation, stroke-dashoffset, handwriting sim, sync_points | Week 6 |
| **Mark Scheme Panel** | Real-time mark weightage highlights during board mode | Week 6 |
| **PYQ system** | MinerU extraction → pgvector → PYQ panel with frequency | Week 7 |
| **TTS integration** | Sarvam AI, 4 sync modes, subtitle fallback | Week 6 |
| **Image Intake Layer** | 6 cases, IsVisualHelpful, ConceptDocument, Book Profile Builder | Week 6 |
| **Multi-Agent authoring** | 5-agent pipeline for offline concept JSON creation | Week 7 |
| **Two-level cache** | L1 Structural + L2 Value cache with student_values in key | Week 4 |
| **Panel B primitives** | 6 Plotly primitives (curve, horizontal_line, live_dot, vertical_marker, dual_curve, bar_chart) | Week 3 |
| **Adaptive bridge states** | Insert STATE_2b if student idles >45s (deferred post-50-students) | Deferred |

---

## 3. Database Gaps

### Tables That Need to Be CREATED

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `concept_documents` | Cached multi-page ConceptDocument per student+book+concept | `student_id`, `book_id`, `concept_id`, `notation_map` (JSONB), `method_sequence`, `formulas`, `diagrams` |
| `book_profiles` | Persistent book profile after 10+ uploads | `book_id`, `notation_patterns` (JSONB), `method_preferences`, `language_style` |
| `pyq_questions` | PYQ database (CBSE + state boards) | `board`, `year`, `class`, `marks`, `chapter`, `concept_id`, `frequency`, `question_text`, `embedding` (768d) |
| `tts_audio_cache` | Cached Sarvam AI audio | `text_hash`, `audio_blob`, `language`, `voice_id` |
| `tts_translation_cache` | Translation cache | `source_text`, `target_language`, `translated_text` |
| `session_state` | Full session state object | `session_id`, `concepts_seen` (JSONB), `current_simulation` (JSONB), `confusion_resolved` (text[]) |

### Tables That Need MODIFICATIONS

| Table | Current State | Needed Changes |
|-------|--------------|----------------|
| `simulation_cache` | Flat 5D key | Add L1/L2 cache level, student_values in L2 key |
| `concept_panel_config` | Basic renderer + layout | Add zone_config, primitive_types |
| `physics_concept_map` | Phase 2 metadata | Add `physics_engine_config` JSONB column |

### Tables That Stay UNCHANGED

| Table | Note |
|-------|------|
| `ncert_content` | ✅ 6,069 chunks, working |
| `student_confusion_log` | ✅ PROTECTED — feeds improvement loop |
| `verified_concepts` | ✅ Tier 1 cache |
| `response_cache` | ✅ Text response cache |
| `lesson_cache` | ✅ Lesson cache |
| `ai_usage_log` | ✅ Cost tracking |
| `student_profiles` | ✅ Session-based |
| `simulation_feedback` | ✅ Emoji ratings |

---

## 4. Model Routing Gaps

### Current vs. v2 Model Assignments

| Task | Current Model | v2 Model | Change |
|------|--------------|----------|--------|
| Concept classification / routing | Gemini 2.5 Flash | Claude Haiku 4.5 | **SWITCH** |
| Stage 2 (scene/config) | Claude Sonnet 4.6 ($0.003/$0.015) | Claude Haiku 4.5 (10x cheaper) | **DOWNGRADE (simpler task)** |
| Stage 4 (teacher script) | Claude Sonnet 4.6 | Claude Sonnet 4.6 | No change |
| Image Vision | Gemini Flash Vision | Gemini Vision | No change |
| NCERT explanation | Gemini Flash | Gemini Flash | No change |
| Board model answers | N/A (Flash generates in real-time) | Claude Sonnet 4.6 (on-demand only) | **NEW** |
| PYQ retrieval | N/A | pgvector (zero LLM) | **NEW** |
| Offline JSON authoring | N/A | Claude Sonnet 4.6 agents | **NEW** |
| TTS voice | N/A | Sarvam AI | **NEW vendor** |
| MinerU extraction | Running on port 8000 | Same | No change |
| DeepSeek (animation gen) | Used in dispatcher | **Removed from sim pipeline** | **REMOVED** |

### Cost Impact

| Scenario | Current Cost | v2 Cost (uncached) | v2 Cost (cached) |
|----------|-------------|-------------------|------------------|
| EPIC-L full explanation | ~$0.005 | $0.005 | $0.001 |
| EPIC-C (specific_confusion) | ~$0.015-0.025 (Sonnet Stage 2) | $0.009 (Haiku Stage 2) | $0.001 |
| Board mode | ~$0.005 (Flash generates) | $0.001 (pre-authored JSON) | $0.0001 |
| Image upload (single) | ~$0.006 | $0.006 | $0.001 |
| Image upload (multi-page) | Not supported | $0.015 | $0.001 |

**Net effect:** ~60-80% cost reduction per session once PCPL is live, primarily from Sonnet→Haiku in Stage 2.

---

## 5. Renderer & Simulation Gaps

### Current Renderers (8 files)

| Renderer | File | Concepts | v2 Status |
|----------|------|----------|-----------|
| `particle_field` | `particle_field_renderer.ts` | drift_velocity, parallel_plate_capacitor | STAYS for EPIC-L; PCPL for EPIC-C |
| `circuit_live` | Not found as standalone | parallel_resistance, kirchhoffs, transformer, lcr | PCPL replaces for EPIC-C |
| `graph_interactive` | `graph_interactive_renderer.ts` | ohms_law, electric_power, ac_basics, phasors | Panel B primitives replace for EPIC-C |
| `mechanics_2d` | `mechanics_2d_renderer.ts` | projectile, circular motion, friction | STAYS for EPIC-L; PCPL for EPIC-C |
| `wave_canvas` | `wave_canvas_renderer.ts` | superposition, standing_waves, beats, doppler | STAYS for EPIC-L; PCPL for EPIC-C |
| `optics_ray` | `optics_ray_renderer.ts` | convex_lens, concave_mirror, snells_law | STAYS for EPIC-L; PCPL for EPIC-C |
| `field_3d` | `field_3d_renderer.ts` | gauss_law_3d, em_induction_3d | STAYS for EPIC-L; PCPL for EPIC-C |
| `thermodynamics` | `thermodynamics_renderer.ts` | isothermal, adiabatic, carnot | STAYS for EPIC-L; PCPL for EPIC-C |

### New Renderers Needed

| Renderer | Purpose | Complexity |
|----------|---------|-----------|
| **PCPL Renderer** | Universal renderer for all EPIC-C/Local/Micro | HIGH — core of v2 |
| **diagram_tutor_renderer** | Board mode Phase 2 SVG diagrams | MEDIUM |
| **Panel B PCPL** | 6 Plotly primitives for Panel B | MEDIUM |

### PostMessage Contract Changes

Current contract stays the same (`SIM_READY`, `SET_STATE`, `STATE_REACHED`). PCPL renderer must implement it. **No breaking change.**

---

## 6. Frontend Gaps

### Components That Need New Features

| Component | Current | v2 Addition |
|-----------|---------|-------------|
| `TeacherPlayer.tsx` | Lesson playback + state sync | TTS player integration, subtitle display, choreography duration gate |
| `LearnConceptTab.tsx` | Chat + lesson + sim orchestration | SessionState awareness, scope indicator, canvas hotspot handling |
| `BoardExamTab.tsx` | Text explanation + strategy buttons | Phase 1/Phase 2 toggle, diagram_tutor_renderer embed, Mark Scheme Panel, PYQ Panel |
| `AISimulationRenderer.tsx` | iframe + postMessage | Canvas hotspot tap events, primitive_id reporting |
| `ImageAnnotator.tsx` | Rectangle annotation + crop | Multi-page upload, ConceptDocument display, notation map preview |

### New Components Needed

| Component | Purpose |
|-----------|---------|
| `MarkSchemePanel.tsx` | Real-time mark weightage display during board mode |
| `PYQPanel.tsx` | Previous year question frequency + links |
| `TTSPlayer.tsx` | Sarvam AI audio player with sync_point events |
| `SubtitleOverlay.tsx` | Fallback text display when audio is off |
| `CanvasHotspot.tsx` | Clickable primitive overlays on simulation canvas |
| `SessionStateIndicator.tsx` | Shows student what concepts they've covered this session |
| `BookProfileCard.tsx` | Shows detected book and notation map |
| `ScopeIndicator.tsx` | Shows current scope (global/local/micro) and state count |

---

## 7. Known Bugs & Issues in Current Codebase

### Build Issues 🔴

| Issue | Details | Impact |
|-------|---------|--------|
| **Missing dependencies** | `@ai-sdk/anthropic` and `ai/react` may be missing in node_modules | Build may fail |
| **TypeScript errors** | Multiple `tsc_output*.txt` files suggest recurring type errors | Compile warnings |
| **Turbopack issues** | `build.log` shows garbled encoding errors with Turbopack | Dev server instability |

### Architecture Bugs 🟡

| Bug | Current Impact | v2 Fix |
|-----|---------------|--------|
| **A=5 instead of A=4** | Sonnet emits wrong student values — student values not guaranteed correct | Physics Engine + TypeScript Post-Processor — values injected from engine, not LLM |
| **"Visual implementation pending"** | Concepts without named scenarios show placeholder | PCPL primitives work for ANY concept — eliminated |
| **Split-brain router** | intentClassifier and intentResolver can disagree on concept_id | Unified Router — single call, single truth |
| **max_states inconsistency** | Set in jsonModifier but ignored by Brief and Stage 4 | Single enforcement point in Post-Processor |
| **Panel sync race condition** | DualPanelSimulation waits SIM_READY from both — unreliable timing | PhysicsComputedState pre-computed; both panels render from same data |
| **Stage 4 caption desync** | Sonnet guesses what student sees — often wrong | Canvas Summary Bridge — Sonnet receives exact canvas description |
| **States look identical** | Consecutive states have same visual layout | Focal primitive system — different visual center per state |

### Data Issues 🟡

| Issue | Details | Status |
|-------|---------|--------|
| **Garbled NCERT text** | Some ncert_content chunks have OCR artifacts | Cleanup script exists (`cleanup-garbled-ncert.sql`) but not yet run |
| **Tier 1/2 cache returns no NCERT sources** | `ncertSources: []` on cache hits | Known limitation — session_context still writes |
| **Old cached sims persist** | Must manually DELETE from simulation_cache to see new sims | Cache invalidation needed in v2 |

### Code Quality Issues

| Issue | File | Details |
|-------|------|---------|
| Multiple DEBUG console.logs | `stage2Runner.ts`, various scripts | Should be cleaned before production |
| `clarification-resume` route returns 410 Gone | `api/chat/clarification-resume/route.ts` | Dead code — should be removed |
| `universalInputUnderstanding.ts` stripped | `src/lib/universalInputUnderstanding.ts` | Dead code — no longer called |
| Duplicate panelConfig files | `src/config/panelConfig.ts` + `src/lib/panelConfig.ts` | Confusing — prefer `src/config/` |

---

## 8. Migration Risks

### HIGH RISK ⚠️

| Risk | Description | Mitigation |
|------|-------------|-----------|
| **EPIC-L regression** | PCPL changes might break working EPIC-L bypass | EPIC-L path is completely separate — never touch EPIC-L renderers for PCPL work |
| **Stage 2 prompt rewrite** | New scene_composition prompt could produce garbage initially | Extensive testing on vector_addition first; fallback to current pipeline |
| **280KB aiSimulationGenerator.ts** | File is massive; changes have high blast radius | Extract PCPL pipeline into separate module; don't modify existing functions |
| **Cache invalidation during migration** | Switching cache key structure could orphan or serve wrong cached sims | Run migration to clear EPIC-C cached sims; keep EPIC-L cache intact |
| **Concept JSON schema expansion** | Adding `physics_engine_config`, `board_mode` sections to JSONs | Backward compatible — new sections are opt-in; existing JSONs still work |

### MEDIUM RISK

| Risk | Description | Mitigation |
|------|-------------|-----------|
| **Haiku quality for Stage 2** | Haiku may not write correct scene_compositions | Task is simple (6 lines from vocabulary); test extensively; Sonnet fallback |
| **12 primitives coverage** | May not cover all physics scenarios | Document says 95% coverage; edge cases use custom primitives |
| **Sarvam AI reliability** | New vendor, untested at scale | Subtitle fallback always available; audio is enhancement not requirement |
| **Multi-agent JSON quality** | Automated JSON authoring may produce errors | Human review gate before deployment; Physics Validator agent catches most |

### LOW RISK

| Risk | Description | Mitigation |
|------|-------------|-----------|
| **Model routing change** | Flash → Haiku for routing | Both are fast, cheap models; same capability tier |
| **New DB tables** | Adding tables doesn't affect existing ones | Additive migrations only |

---

## 9. Recommended Build Order

This follows the document's Week 1-8 timeline, with dependencies mapped:

### Week 1 — Foundations (No User-Facing Changes)
1. **Physics Engine** (`src/lib/physicsEngine.ts`)
   - TypeScript formulas for all mechanics concepts
   - PhysicsComputedState output type
   - Coordinate system (degrees in, radians internally)
   - Student value injection pipeline
   - **Dependency:** None
   
2. **Zone Layout Engine skeleton** (`src/lib/zoneLayoutEngine.ts`)
   - 4 zone configs (teaching, exploration, comparison, minimal)
   - Scale intelligence (UNIT_TO_PX computation)
   - **Dependency:** None

### Week 2 — Primitives & Animation
3. **12 Physics Primitives** (p5.js implementations)
   - Each primitive as a class/function
   - Visual testing for each
   - **Dependency:** Zone Layout Engine
   
4. **Choreography Engine** (`src/lib/choreographyEngine.ts`)
   - Parse LLM timing intent
   - Frame computation
   - **Dependency:** Primitives

5. **Transition Engine** (`src/lib/transitionEngine.ts`)
   - Scene diff algorithm
   - 800ms ease-in-out interpolation
   - Physics Engine recomputation during transitions
   - **Dependency:** Physics Engine, Primitives

### Week 3 — PCPL Renderer
6. **PCPL Renderer** (`src/lib/renderers/pcpl_renderer.ts`)
   - Reads scene_composition JSON
   - Instantiates primitives in zones
   - Applies focal_primitive treatments
   - Implements PostMessage contract (SIM_READY, SET_STATE, STATE_REACHED)
   - **Dependency:** Primitives, Zone Engine, Choreography, Transition
   
7. **Panel B PCPL** (6 Plotly primitives)
   - curve, horizontal_line, live_dot, vertical_marker, dual_curve, bar_chart
   - **Dependency:** Zone Engine

### Week 4 — Pipeline Rewiring
8. **Unified Router** (`src/lib/unifiedRouter.ts`)
   - Single Haiku call → ResolvedIntent
   - 10 interaction types
   - Scope + max_states decision
   - Student values extraction
   - Rule-based fallback
   - **Dependency:** None
   
9. **Updated Stage 2 prompt** (Haiku scene spec)
   - scene_composition + canvas_summary per state
   - Primitives vocabulary in prompt
   - **Dependency:** Primitives vocabulary defined
   
10. **Canvas Summary Bridge**
    - Stage 2 output includes canvas_summary
    - Stage 4 receives canvas_summary
    - **Dependency:** Stage 2 prompt

11. **TypeScript Post-Processor** (`src/lib/postProcessor.ts`)
    - Student value injection on every state
    - max_states truncation (single enforcement point)
    - Session_state awareness
    - **Dependency:** Physics Engine

12. **Two-level cache**
    - L1 Structural + L2 Value
    - Migration script for existing cache
    - **Dependency:** Unified Router (for new key structure)

### Week 5 — Intelligence Layer
13. **SessionState object** (extends ProfileContext)
    - concepts_seen, current_simulation, confusion_resolved
    - Session-aware behavior (skip states, skip Phase 1)
    - **Dependency:** Unified Router

14. **Canvas hotspot pipeline**
    - Tap on primitive → primitive_id + computed values
    - Micro scope PCPL pipeline (2 states)
    - **Dependency:** PCPL Renderer

15. **Test all 10 interaction types on vector_addition**
    - End-to-end validation
    - **Dependency:** Everything above

### Week 6 — Board Mode + TTS + Image
16. **diagram_tutor_renderer** (`src/lib/renderers/diagram_tutor_renderer.ts`)
    - SVG path animation
    - stroke-dashoffset handwriting simulation
    - sync_point events
    - **Dependency:** None (independent renderer)

17. **TTS integration**
    - Sarvam AI API client
    - TTSPlayer component
    - 4 sync modes
    - Subtitle fallback
    - tts_audio_cache table
    - **Dependency:** TeacherPlayer.tsx

18. **Image Intake Layer** (`src/lib/imageIntake.ts`)
    - 6 case classifier
    - IsVisualHelpful decision
    - ConceptDocument builder
    - MinerU + Vision parallel extraction
    - Notation map flow
    - **Dependency:** MinerU (already exists), Physics Engine

### Week 7 — Content Pipeline
19. **Multi-Agent JSON authoring**
    - 5-agent pipeline
    - Physics Expert → Pedagogy → Scenario → Validator → Quality
    - **Dependency:** Concept JSON schema finalized

20. **PYQ database ingestion**
    - MinerU extraction from CBSE + state board papers
    - pgvector embedding + metadata
    - PYQ panel UI
    - **Dependency:** MinerU, pyq_questions table

### Week 8 — Content + Polish
21. **Ch.8 JSONs authored by agents + verified**
    - First chapter produced by multi-agent pipeline
    - Human review
    - **Dependency:** Multi-agent pipeline

---

## 10. What NOT to Touch

These components are explicitly called out as UNCHANGED in v2:

| Component | Reason |
|-----------|--------|
| EPIC-L JSON bypass | Working perfectly — 6-state deterministic |
| mechanics_2d_renderer (for EPIC-L) | Only EPIC-C paths switch to PCPL |
| All 16 Ch.5-7 EPIC-L JSONs | Valid, cached, serving students |
| Supabase schema core tables | Minor additions only |
| NCERT + HC Verma + DC Pandey pgvector corpus | 7,000+ chunks, working |
| Variant pills (regeneration_variants) | Working feature |
| MinerU microservice core | Extended, not replaced |
| student_confusion_log | PROTECTED — never delete |
| Auth system (proxy.ts) | Session-based, unchanged |

---

## Summary Metrics

| Metric | Value |
|--------|-------|
| **New files to create** | ~20-25 TypeScript modules + components |
| **Existing files to modify** | ~15 files (mostly pipeline + frontend) |
| **New DB tables** | 5-6 tables |
| **New DB migrations** | 3-4 migration scripts |
| **New npm dependencies** | Sarvam AI SDK, possibly chart.js for mark scheme |
| **Estimated total build time** | 8 weeks |
| **Current completion** | ~40% (infrastructure), ~15% (v2 features) |
| **Highest priority gap** | Physics Engine + PCPL Renderer (Weeks 1-3) |
| **Highest risk** | Stage 2 prompt rewrite + aiSimulationGenerator.ts changes |
| **Biggest win** | Eliminating "Visual implementation pending" + correct student values |

---

*This report should be read alongside `PhysicsMind_New_Architecture_v2.docx` for full context on each v2 feature. The document is the architecture spec; this report is the engineering gap assessment.*
