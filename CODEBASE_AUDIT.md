# PhysicsMind — Full Codebase Audit
**Generated**: 2026-03-16
**Last Updated**: 2026-03-18 (Book ingestion pipeline complete — DC Pandey + HC Verma in DB)
**Sources**: architecture_report.md.resolved + walkthrough.md.resolved + live codebase scan
**Scope**: `C:\Tutor\physics-mind` (all TypeScript/TSX source files)

---

## EXECUTIVE SUMMARY

| Metric | Value |
|--------|-------|
| Total source files (TS/TSX) | ~119 |
| Total LOC (estimated) | ~12,400 |
| API routes | 23 |
| Lib files | 32 |
| React components | 18 |
| DB tables | 15+ |
| Books in vector DB | 3 (NCERT, DC Pandey, HC Verma) |
| Total embedded chunks | 7,128 (0 missing) |
| AI models in use | 4 |
| Required env vars | 6 |
| Unit test files | **0** |
| Critical bugs (open) | 4 |
| Incomplete implementations | 5 |

---

## 1. SYSTEM ENTRY POINTS

### API Routes (`src/app/api/`)
| Route | Method | Purpose | Auth |
|-------|--------|---------|------|
| `/api/chat` | POST | Core question → explanation | In-memory rate-limiter (20 req/60 s/user) |
| `/api/generate-lesson` | POST | Generate teacher lesson from fingerprint | None |
| `/api/generate-simulation` | POST | Generate physics simulation HTML | None |
| `/api/simulation-feedback` | POST | Rate a simulation | session_id required |
| `/api/flash-vision` | POST | Extract concept from image | None |
| `/api/analyze-vision` | POST | Vision fallback analysis | None |
| `/api/student` | GET/POST | Load/save student profile | Supabase session |
| `/api/concepts` | GET/POST/PATCH | Concept CRUD | Supabase session |
| `/api/concepts/[id]` | GET/POST | Single concept | Supabase session |
| `/api/progress` | POST | Save module progress | Supabase session |
| `/api/revision-card` | POST | Revision card generation | None |
| `/api/quiz` | POST | Quiz generation | None |
| `/api/mcqset` | POST | MCQ set generation | None |
| `/api/tip` | POST | Tip for concept | None |
| `/api/mvs-response` | POST | Misconception response | None |
| `/api/chats/*` | Various | Chat history | Supabase session |
| `/api/test-ncert` | POST | Debug: NCERT search | None |
| `/api/test-lesson` | POST | Debug: Lesson generation | None |
| `/api/test-sim` | POST | Debug: Simulation gen | None |
| `/api/concept` | GET | Concept metadata | None |
| `/api/auth/callback` | GET | OAuth callback | Supabase |

### Request Flow (Text Question)
```
Student types question
  → POST /api/chat
    → resolveStudentIntent() [intentResolver.ts]  — Gemini Flash 2.5, 200 tokens, always resolves
    → classifyQuestion() [intentClassifier.ts]   — Gemini Flash 2.5
    → lookupVerifiedByConceptId() [queryRouter.ts]  ← Tier 1
    → matchCachedResponse() [queryRouter.ts]         ← Tier 2
    → explainConceptual/Board/Competitive() [teacherEngine.ts]  ← Tier 3
    → background: factCheckResponse() + cacheResponseForMode()
  ← { explanation, ncertSources, usage }
```

### Request Flow (Image Upload)
```
Student uploads image
  → POST /api/chat
    → pHash computation (9×8 dhash, 64-bit)
    → Hamming distance match against known images
    → extractConceptFromImage() [Flash Vision] + Sonnet fallback if confidence < 0.85
    → resolveStudentIntent() [intentResolver.ts]  — autonomous, no clarification cards
    → fire-and-forget INSERT to student_confusion_log
    → getPanelConfigForConcept() [panelConfig.ts]
    → if no panelConfig: decomposeConceptFromProblem() → constructs PanelConfig from output
    → if specific_confusion: extractStudentConfusion() [no clarification gate]
    → same Tier 1/2/3 routing as text flow
  ← { explanation, ncertSources, panelConfig, conceptDecomposition, usage }
```

---

## 2. INTENT RESOLVER (`src/lib/intentResolver.ts`) — **NEW, replaces clarification cards**

### Purpose
Autonomous intent classification for every student input. Never blocks the pipeline — always resolves to one of: `specific_confusion | full_explanation | hypothetical | derive | compare`.

### Model
- **Gemini Flash 2.5**, `maxTokens: 200`, system prompt at `src/prompts/intent_resolver.txt`

### Inputs / Outputs
```typescript
resolveStudentIntent({ studentText, imageDescription?, conceptId?, isImagePresent })
→ { intent, simulationEmphasis, resolvedConcept, confidence, reasoning }
```

### Key Rules
- Image present + concept known → always `full_explanation` or `specific_confusion` (never blocks)
- Hinglish confusion patterns recognised: "samajh nahi aaya", "kaise hota hai", "kyun hota hai", etc.
- Fallback on error: `full_explanation`, confidence 0.5 — pipeline never halted

---

## 2b. UNIVERSAL INPUT LAYER (`src/lib/universalInputUnderstanding.ts`) — **Stripped, no longer called from chat/route.ts**

Previously handled clarification card logic. Now returns `{ context: StudentContext }` only (no clarificationCard). The function still exists and logs to `student_confusion_log` but is not called from the main request path. The `student_confusion_log` INSERT is now done fire-and-forget directly in `chat/route.ts` after `resolveStudentIntent()`.

### ClarificationCard — **REMOVED**
- `ClarificationCard` type deleted from `src/lib/studentContext.ts`
- `ClarificationCard.tsx` component gutted (dead code)
- `/api/chat/clarification-resume/route.ts` → returns 410 Gone
- All `CLARIFICATION_REQUIRED` response types removed from `chat/route.ts`
- `handleClarificationResponse()` and `clarificationData` state removed from `LearnConceptTab.tsx`

---

## 3. INTENT CLASSIFIER (`src/lib/intentClassifier.ts`, ~327 lines)

### Model
- **Gemini Flash 2.5** (`gemini-2.5-flash`)
- temperature = 0.05, maxOutputTokens = 2048

### Output — QuestionFingerprint
```typescript
interface QuestionFingerprint {
  concept_id: string;       // e.g., "ohms_law"
  intent: Intent;           // 'understand'|'derive'|'hypothetical'|'compare'|'apply'|'define'|'specific_confusion'
  class_level: string;      // "Class 12"
  mode: string;             // "conceptual"|"board"|"competitive"
  aspect: string;           // specific sub-topic
  cache_key: string;        // "concept_id|intent|class_level|mode|aspect"
  confidence: number;       // 0.0–1.0
  ncert_chapter?: string;
  variables_changing?: string[];
  parse_failed?: boolean;   // set true → skips MVS & cache
}
```

### JSON Parse Fallback Chain
1. Direct parse
2. Extract JSON from markdown fences
3. Close truncated JSON with extra `}}`
4. Return safe fingerprint with `parse_failed: true`

### Known Issues
- No server-side validation that `concept_id` is in approved list (relies on model compliance)
- CLASSIFIER_PROMPT is 366 lines embedded in-file (high token overhead per call)

---

## 4. THREE-TIER CACHE SYSTEM (`src/lib/queryRouter.ts`, ~161 lines)

```
Tier 1: verified_concepts (concept_slug, physics_verified=true)
Tier 2: response_cache (fingerprint_key exact match)
Tier 3: AI generation → upsert to response_cache
```

### Cache Key Format
```
fingerprint_key = concept_id|intent|class_level|mode|aspect
```

### Known Limitation
- Tier 1/2 hits return `ncertSources: []` (no NCERT grounding for pre-cached responses)
- `response_board` / `response_competitive` columns have NOT NULL constraint but are populated with same text as `response`

---

## 5. NCERT SEARCH (`src/lib/ncertSearch.ts`, ~276 lines)

### Algorithm
1. Generate 768-dim embedding via `gemini-embedding-001`
2. Parallel vector search (RPC `match_ncert_content_v2`, threshold = **0.45**) + keyword ilike search
3. Merge: keyword results first, then vector (deduplicated)
4. Apply chapter hint filter (prefer in-chapter results if ≥1 found)
5. Return top N chunks (default 3)

### Configuration
| Parameter | Value | Notes |
|-----------|-------|-------|
| `match_threshold` | 0.45 | Raised from 0.10 to reduce noise |
| `match_count` | `maxChunks × 5` | Extra pool for chapter filtering |
| Trim limit | 1200 chars | Truncated at sentence boundary in teacherEngine |

### Hardcoded Maps
- `CONCEPT_SEARCH_PHRASE_MAP`: curated search phrases for 5 concepts (ohms_law, drift_velocity, kirchhoffs_laws, potentiometer, electric_power_heating)
- `CONCEPT_CHAPTER_MAP`: 99+ keyword → NCERT chapter mappings

---

## 6. TEACHER ENGINE (`src/lib/teacherEngine.ts`, ~624 lines)

### Model Usage
| Function | Model | Temperature |
|----------|-------|-------------|
| `explainConceptual()` | Gemini Flash 2.5 | 0.4 |
| `explainBoardExam()` | Gemini Flash 2.5 | 0.2 |
| `explainCompetitive()` | Gemini Flash 2.5 | 0.3 |
| `generateLesson()` | Claude Sonnet 4.6 | 0.3 |

### Cache Strategy (lesson_cache)
1. Check `fingerprint_key` (primary)
2. Fall back to legacy `question_normalized + mode` key
3. On miss: `searchNCERT()` → Claude → upsert

### Lesson Validation Rules
- Must have 3–5 teaching steps
- `sim_type` must be non-empty
- `sim_type` logic: "wire" for resistivity/drift, "circuit" for KVL/KCL, else snake_case concept_id

---

## 7. SIMULATION PIPELINE (`src/lib/aiSimulationGenerator.ts`, ~2,740 lines)

### 4-Stage Pipeline
```
Stage 1 — Brief          Gemini Flash 2.5   Concept-guided strategy
Stage 2 — Config         Claude Sonnet 4.6  PhysicsConfig JSON (parameters, objects, controls)
Stage 3 — HTML+Script    Gemini Flash 2.5   p5.js HTML implementation (mandatory sync API + 4-state machine)
Stage 4 — Teacher Script Claude Sonnet 4.6  Narration synchronized to StateMachineSpec
```

### Renderer Routing (RENDERER_MAP)
| Concept IDs | Renderer |
|-------------|----------|
| ohms_law, resistivity, photoelectric, coulombs_law | `graph_interactive` → runGraphPipeline() |
| kirchhoffs_laws, default | `particle_field` |

### Concept Panel Layouts (CONCEPT_PANEL_MAP)
| Concept | Layout | Primary | Secondary |
|---------|--------|---------|-----------|
| ohms_law | dual_horizontal | particle_field | graph_interactive |
| electric_power_heating | dual_horizontal | particle_field | graph_interactive |
| photoelectric | dual_horizontal | particle_field | graph_interactive |
| Others | single | particle_field | — |

### Cache
- DB table: `simulation_cache` (keyed by `fingerprint_key`)
- **MUST manually delete old rows** to regenerate for concept-specific sims

### Known Issues
- **2,740 LOC is a monolith** — difficult to maintain
- Fallback to `particle_field` is silent on concept-specific generation failure
- Concept guidance only covers 7 concepts in `CONCEPT_SIM_GUIDANCE`

---

## 8. PHYSICS VALIDATION LAYER

### `src/lib/ncertTruthAnchor.ts` (~150 lines)
- Loads `ncert_truth_statements[]` from `src/data/physics_constants/{conceptId}.json`
- Claude Sonnet 4.6 validates each statement against generated config (YES/NO)
- API failures default to `passed=true` (never blocks pipeline)
- Graph renderers skip truth anchor entirely

### `src/lib/physics_validator.ts` (~347 lines)
- Deterministic TypeScript bounds checking
- `CONCEPT_FILE_MAP`: concept_id → JSON file path
- `validatePhysics()` / `validatePhysicsForConcept()`

### Physics Constants Coverage (`src/data/physics_constants/`)
14 JSON files present:
`drift_velocity`, `electric_current`, `ohms_law`, `resistivity`, `resistance_temperature_dependence`, `electrical_power_energy`, `emf_internal_resistance`, `kirchhoffs_laws`, `series_resistance`, `cells_in_series_parallel`, `wheatstone_bridge`, `potentiometer`, `meter_bridge`, `electric_power_heating`

**Gap**: Many concepts in Class 10/11 have no constants file — validator silently skips them.

---

## 9. PANEL COMPOSER & LAYOUT

### Priority Order
1. **Supabase `concept_panel_config`** table (human-verified, highest trust)
2. **`decomposeConceptFromProblem()`** output → constructs `PanelConfig` directly if `dual_panel_needed=true` (Priority 3 wiring)
3. **Default**: single panel, `particle_field`

### Decomposer Rules (from `src/prompts/concept_decomposer.txt`)
- Comparing two states/objects → `dual_panel_needed = true`
- Explaining graph relationship → always include `graph_interactive`
- Particle motion + measurable outcomes → `particle_field` + `graph_interactive`
- Multi-concept image → **proceeds autonomously with primary_concept** (clarification card removed)

### Decomposer → PanelConfig Wiring (Priority 3, `chat/route.ts`)
When `decomposeConceptFromProblem()` returns `dual_panel_needed=true`, a `PanelConfig` is constructed:
```typescript
panelConfig = {
  concept_id: resolvedConceptId,
  default_panel_count: conceptDecomposition.panel_count,
  panel_a_renderer: conceptDecomposition.panel_a_renderer ?? 'particle_field',
  panel_b_renderer: conceptDecomposition.panel_b_renderer ?? null,
  panel_c_renderer: null,
  sonnet_can_upgrade: false,
  verified_by_human: false,
};
```

### concept_panel_config rows added (Priority 3)
- `temperature_dependence_of_resistance` → 2 panels: `particle_field` + `graph_interactive`
- `resistance_temperature_dependence` → 2 panels: `particle_field` + `graph_interactive`

### State Sync
- `postMessage` bridge (`STATE_REACHED` messages) for dual-panel lock-step
- TeacherPlayer: `effectiveRef = externalIframeRef ?? simulationIframeRef`
- AISimulationRenderer sandbox: `allow-scripts allow-same-origin`

---

## 10. DATABASE SCHEMA INVENTORY

### Authentication & Profile
| Table | Key Columns |
|-------|-------------|
| `student_profiles` | session_id, name, class, board, goal, first_topic, onboarding_complete |
| `concepts` | session_id, id, name, concept_class, subject, status, updated_at |
| `module_progress` | session_id, module_id, score |

### AI & Caching
| Table | Key Columns | Notes |
|-------|-------------|-------|
| `lesson_cache` | fingerprint_key (PK), question_normalized, mode, lesson_json, served_count, expires_at | Dual-key lookup |
| `response_cache` | fingerprint_key (unique), response, response_board, response_competitive, intent, mode, fact_checked, served_count | response_board/competitive = same text currently |
| `simulation_cache` | fingerprint_key, concept_id, physics_config, engine, sim_html, secondary_sim_html, teacher_script | Must delete to regenerate |
| `verified_concepts` | concept_slug, full_content_board, full_content_competitive, physics_verified | Tier 1 cache |

### NCERT & Concept Metadata
| Table | Key Columns |
|-------|-------------|
| `ncert_content` | id, content_text, chapter_name, section_name, class_level, source_book, embedding (vector 768) |
| `physics_concept_map` | concept_id, misconceptions[], variables[], confusion_patterns[], simulation_states[], related_concepts[] |
| `concept_panel_config` | concept_id, default_panel_count, panel_a/b/c_renderer, sonnet_can_upgrade, verified_by_human |

### Feedback & Logging
| Table | Key Columns |
|-------|-------------|
| `simulation_feedback` | session_id, concept_id, confusion_pattern_id, student_rating, interaction_data |
| `ai_usage_log` | session_id, task_type, provider, model, input_chars, output_chars, latency_ms, estimated_cost_usd, fingerprint_key, was_cache_hit |
| `chats` | session_id, message_id, thread_id, role, content, created_at |
| `student_confusion_log` | session_id, confusion_text, extracted_concept_id, extracted_intent, image_uploaded, confidence_score, source_type, student_belief, actual_physics, simulation_emphasis, **decomposer_ran** (bool), **panel_count** (int), **primary_concept** (text), **supporting_concepts** (text[]) — last 4 added Priority 3 |

---

## 11. COMPONENT INVENTORY (`src/components/`, ~2,945 LOC)

| Component | Lines | Role |
|-----------|-------|------|
| `TeacherPlayer.tsx` | ~400 | Narrated lesson + synchronized sim playback; pendingState queue; postMessage bridge |
| `AISimulationRenderer.tsx` | ~250 | Sandbox iframe for p5.js; `allow-scripts allow-same-origin` |
| `NCERTSourcesWidget.tsx` | 172 | Collapsible NCERT source cards (inline styles, no Tailwind) |
| `LeftPanel.tsx` | ~200 | Navigation sidebar |
| `ChatList.tsx` | ~150 | Chat history display |
| `MessageRenderer.tsx` | ~150 | Markdown + KaTeX + NCERTSourcesWidget |
| `ProgressTracker.tsx` | ~150 | Concept progress visualization |
| `MCQMode.tsx` | ~200 | MCQ practice interface |
| `SimulationPanel.tsx` | ~150 | Simulation display wrapper |
| `ConceptSidebar.tsx` | ~100 | Concept navigation |
| `ModeToggle.tsx` | ~80 | learn/practice mode toggle |
| `ExamSelector.tsx` | ~100 | CBSE/JEE/NEET selector |
| `ConfidenceMeter.tsx` | ~80 | Concept confidence indicator |
| `ResponseActionBar.tsx` | ~120 | Board Format / JEE Tips / Revise buttons |
| `MisconceptionVerifyCard.tsx` | ~120 | MVS verification UI |
| `ClarificationCard.tsx` | ~5 | **RETIRED** — gutted, returns empty export only |
| `MCQBookmarkButton.tsx` | ~80 | Bookmark MCQ |
| `Onboarding.tsx` | ~150 | Student onboarding flow |
| `ChatSkeleton.tsx` | ~80 | Loading skeleton |

---

## 12. MODEL ROUTING MAP

| Model | Used For | Temperature |
|-------|----------|-------------|
| Gemini Flash 2.5 (`gemini-2.5-flash`) | Intent classification, conceptual/board/competitive explanation, p5.js code, teacher scripts | 0.05–0.4 |
| Claude Sonnet 4.6 (`claude-sonnet-4-6`) | Lesson generation, truth anchor, concept decomposer, fact-checker, vision fallback | 0.3 |
| `gemini-embedding-001` | NCERT vector embeddings (768 dims) | — |
| DeepSeek V3 | General conversational fallback | — |

---

## 13. ENVIRONMENT VARIABLES

| Variable | Required | Purpose |
|----------|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Browser-side (RLS enforced) |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Server-side (bypasses RLS) — usage logging, cache writes |
| `ANTHROPIC_API_KEY` | Yes | Claude Sonnet 4.6 |
| `GOOGLE_GENERATIVE_AI_API_KEY` | Yes | Gemini Flash + embeddings |
| `GOOGLE_AI_API_KEY` | Maybe | Alias for the above (check duplicates) |
| `DEEPSEEK_API_KEY` | Optional | DeepSeek fallback |

**No `.env.example` file found** — developers must read code to know which vars are required.

---

## 14. CRITICAL BUGS & BLOCKERS

### BUG-1 — Tier 1/2 Cache Returns No NCERT Sources
- **Severity**: Medium
- **Location**: `queryRouter.ts` → response returned to `chat/route.ts`
- **Impact**: Students see no NCERT citations for frequently-asked questions (all Tier 1/2 hits)
- **Fix needed**: Attach NCERT source lookup to cache hit path (either store at cache time or fetch on read)

### BUG-2 — Stale Simulation Cache
- **Severity**: Medium
- **Location**: `simulation_cache` table
- **Impact**: Old concept-agnostic (drift_velocity) sims persist and are served for all concepts
- **Fix needed**: Add `concept_guidance_version` column + auto-invalidation; or provide an admin purge endpoint

### BUG-3 — In-Memory Rate Limiter
- **Severity**: Medium (production risk)
- **Location**: `src/app/api/chat/route.ts`
- **Impact**: Rate limit resets per process restart; ineffective in multi-instance deploys (Vercel serverless)
- **Fix needed**: Upstash Redis or Supabase-based rate limiting

### BUG-4 — `response_board` / `response_competitive` NOT NULL with Same Text
- **Severity**: Low
- **Location**: `queryRouter.ts` → `cacheResponseForMode()`
- **Impact**: All three columns store identical text regardless of mode; `response_board` can't be read back with mode-specific content
- **Fix needed**: Either remove NOT NULL or populate correctly per mode

---

## 15. INCOMPLETE IMPLEMENTATIONS

### INCOMPLETE-1 — NCERT PDF Re-extraction Pipeline (Not Run)
- Files: `src/scripts/reextract-ncert.py`, `src/scripts/reembed-ncert.mjs`, `src/scripts/cleanup-garbled-ncert.sql`
- Status: Scripts written but never executed (DC Pandey + HCV ingestion was prioritised instead)
- Impact: Garbled NCERT text in DB reduces explanation quality for NCERT-grounded responses

### INCOMPLETE-2 — Unimplemented Renderers
- `field_3d` — 3D field renderer
- `wave_canvas` — Wave physics renderer
- `mechanics_2d` — Mechanics/kinematics renderer
- Status: Referenced in `CONCEPT_PANEL_MAP` and `renderer_schema.ts` but not implemented
- Impact: Concepts needing these renderers fall back to `particle_field`

### INCOMPLETE-3 — Missing Physics Constants JSONs
- `CONCEPT_FILE_MAP` references many concept IDs with no corresponding JSON in `src/data/physics_constants/`
- Impact: Truth anchor and physics validator silently skip validation for these concepts

### INCOMPLETE-4 — WhatsApp Integration
- `src/lib/whatsapp.ts` is a stub
- No implementation, no route

### INCOMPLETE-5 — Strict `GRAPH_CONFIG_SCHEMA` (Zod)
- Currently JSON shape validated by TypeScript types only
- No runtime Zod validation on Gemini-generated GraphConfig JSON
- Impact: Malformed configs silently fail or render incorrectly

---

## 16. MISSING ERROR HANDLING

| Location | Failure Mode | Current Behavior | Risk |
|----------|-------------|-----------------|------|
| `teacherEngine.ts:generateLesson()` | JSON parse failure | Returns `null` | Client gets empty lesson silently |
| `aiSimulationGenerator.ts` | Concept-specific HTML generation fails | Silently falls back to `particle_field` | Student sees wrong sim type |
| `ncertSearch.ts` | RPC error | Returns `[]`, no logging | No NCERT grounding, not visible to user |
| `ncertTruthAnchor.ts` | Claude API error | `passed: true` (skips check) | Physics errors pass validation |
| `factCheckResponse()` | Claude API error | `{hasError: false}` (never blocks) | Wrong physics cached without fact-check |
| `intentClassifier.ts` | Parse failure chain exhausted | `parse_failed: true`, `concept_id: 'unknown'` | Entire MVS + cache path skipped |

---

## 17. SECURITY OBSERVATIONS

| Issue | Severity | Location | Notes |
|-------|----------|----------|-------|
| No `.env.example` | Low | Root | API keys not documented for new devs |
| In-memory rate limiter | Medium | `/api/chat` | Bypassable in multi-instance deploys |
| No CSRF protection | Low | All POST routes | JSON-only APIs, low risk with CORS headers |
| `supabaseAdmin` bypasses RLS | Note | `usageLogger.ts`, caches | Intentional for server-side logging — verify no user data exposed |
| Debug routes in production | Low | `/api/test-ncert`, `/api/test-lesson`, `/api/test-sim` | No auth — anyone can invoke AI calls |
| `allow-same-origin` in iframe | Note | `AISimulationRenderer.tsx` | Needed for postMessage; p5.js code is AI-generated so scope is controlled |

---

## 18. CODE QUALITY FINDINGS

### What's Working Well
- Clear separation: teacherEngine / ncertSearch / intentClassifier / queryRouter
- Extensive prompt engineering (366-line classifier, concept decomposer)
- Multi-tier caching prevents redundant AI calls
- TypeScript strict mode throughout
- NCERT grounding as enforced design principle

### Technical Debt
| Item | Location | Impact |
|------|----------|--------|
| 2,740 LOC monolith | `aiSimulationGenerator.ts` | Hard to test, debug, and extend |
| Prompts embedded in code | `intentClassifier.ts`, `teacherEngine.ts` | Can't update prompts without redeploy |
| No unit tests | Entire codebase | Regressions invisible until production |
| Two validator files | `physics_validator.ts` + `physicsValidator.ts` | Unclear which is authoritative |
| `CONCEPT_PANEL_MAP` hard-coded | `panelConfig.ts` | Adding new concepts requires code change |
| Duplicate Google API key vars | `.env` | `GOOGLE_GENERATIVE_AI_API_KEY` vs `GOOGLE_AI_API_KEY` |

---

## 19. GAPS VS ARCHITECTURE REPORT

The Gemini architecture report describes several features that need cross-checking:

| Described Feature | Status in Code |
|-------------------|---------------|
| `concept_panel_config` Supabase table (Priority 1) | Table referenced in `panelConfig.ts` — SQL migration not confirmed run |
| `decomposeConceptFromProblem()` triggered on image miss | Implemented in `conceptDecomposer.ts`, integrated in chat route |
| `match_ncert_content_v2` RPC | Found in `ncertSearch.ts` — confirm RPC exists in Supabase |
| `circuit_live` renderer | Listed in schema, no implementation found |
| DeepSeek V3 as fallback | `modelRouter.ts` references it — no DEEPSEEK_API_KEY in required vars list |
| `physics_validator.ts` vs `physicsValidator.ts` | Both exist — duplication unresolved |
| `student_confusion_log` table | Listed in DB tables, `.sql` file exists but not confirmed migrated |

---

## 20. BOOK CORPUS — `ncert_content` TABLE (as of 2026-03-18)

### Ingested Sources

| source_book | chapters | total_chunks | class_level | status |
|-------------|----------|-------------|-------------|--------|
| `ncert` | 33 | 3,752 | 10–12 | Pre-existing |
| `dc_pandey` | 37 | 1,759 | 11–12 | **Newly ingested** |
| `hc_verma` | 46 | 1,617 | 11–12 | **Newly ingested** |
| **Total** | **116** | **7,128** | | **0 missing embeddings** |

### DC Pandey Coverage (1,759 chunks)
| Volume | Chapters | Chunks | Notes |
|--------|----------|--------|-------|
| Mechanics Vol 1 (Class 11) | 10 — Kinematics, Laws of Motion, Work-Energy, Circular Motion | 257 | Pre-chunked JSON |
| Mechanics Vol 2 (Class 11) | 6 — Centre of Mass, Gravitation, SHM, Rotational, Fluid, Elasticity | 285 | Pre-chunked JSON |
| Waves & Thermodynamics (Class 12) | 6 — Wave Motion through Calorimetry | 212 | Pre-existing JSONL |
| Electricity & Magnetism (Class 12) | 6 — Current Electricity, Electrostatics, Capacitors, Magnetics, EMI, AC | 535 | Extracted from PDF |
| Optics & Modern Physics (Class 12) | 8 — EM Waves, Reflection, Refraction, Wave Optics, Modern Physics I/II, Semiconductors, Communication | 470 | Extracted from PDF |

> **Note on E&M chapter naming**: The E&M PDF edition uses merged chapters. "Electrostatics" covers user chapters 23–25 (Charges, Field, Gauss); "Magnetics" covers chapters 29–30. Content is fully indexed semantically.

### HC Verma Coverage (1,617 chunks)
| Volume | Chapters | Chunks | Notes |
|--------|----------|--------|-------|
| Vol 1 — Concepts of Physics (Class 11) | 22 — Introduction through Light Waves | 822 | Pre-chunked JSON |
| Vol 2 — Concepts of Physics (Class 12) | 24 — Kinetic Theory through X-Rays | 795 | Pre-chunked JSON |

### Ingestion Scripts (new in this session)
| Script | Purpose |
|--------|---------|
| `src/scripts/embed-json-chunks.mjs` | Generic embedder — supports JSON arrays AND JSONL, skip-existing logic, handles both `chunk_index` and `chunk_index_assigned` field names |
| `src/scripts/ingest-dcp-em.py` | Extracts DC Pandey E&M PDF → JSONL (PDF page-index ranges, back-matter excluded at idx 620+) |
| `src/scripts/ingest-dcp-optics.py` | Extracts DC Pandey Optics PDF → JSONL (back-matter excluded at idx 446+) |
| `src/scripts/scan-dcp-chapters.py` | One-time scanner — finds chapter boundaries in new DC Pandey PDFs |

### Known Limitations
- E&M PDF has merged chapters vs. user-specified 10-chapter map (structural difference in PDF edition)
- `MAX_PAGE_CHARS = 3000` cap per extracted page prevents runaway math-formula text; a small amount of end-of-page content may be clipped
- `match_ncert_chunks` RPC has a `filter_source_book` param — `ncertSearch.ts` currently searches all `source_book` values (NCERT + DC Pandey + HC Verma in the same query)
- No de-duplication between books for the same physics content (by design — vector search handles relevance ranking)

---

## 21. RECOMMENDED ACTIONS (Priority Order)

### P0 — Must Fix Before Scale
1. **Add `.env.example`** — document all required env vars
2. **Replace in-memory rate limiter** with Redis/Supabase-based solution
3. **Gate debug API routes** with an `ADMIN_SECRET` header check
4. **Run NCERT cleanup + re-extraction pipeline** (scripts are ready)

### P1 — Fix Within 2 Weeks
5. **Attach NCERT sources to cache hits** (Tier 1/2) — either store at write time or fetch chapter metadata on read
6. **Add `concept_guidance_version` to `simulation_cache`** + auto-invalidation endpoint
7. **Add runtime Zod validation** on GraphConfig JSON before rendering
8. **Split `aiSimulationGenerator.ts`** into Stage 1/2/3/4 files (~700 LOC each)
9. **Add `generateLesson()` error message** to client instead of silent null

### P2 — Quality / Growth
10. **Write unit tests** for at least: intentClassifier, ncertSearch, queryRouter cache logic
11. **Externalize CLASSIFIER_PROMPT** to `src/prompts/` (hot-reload without redeploy)
12. **Resolve `physics_validator.ts` vs `physicsValidator.ts`** duplication
13. **Add Class 10/11 physics constants JSONs** to enable truth anchor for more concepts
14. **Implement `field_3d` and `wave_canvas` renderers** (needed for optics, waves, electrostatics)
15. **Add `concept_panel_config` rows for Class 10/11 concepts** (currently empty for non-Current-Electricity)

---

*Audit complete — 119 files scanned, 15+ DB tables mapped, 4 critical bugs, 5 incomplete implementations, 0 unit tests. Book corpus: NCERT (3,752) + DC Pandey (1,759) + HC Verma (1,617) = 7,128 chunks, 0 missing embeddings.*
