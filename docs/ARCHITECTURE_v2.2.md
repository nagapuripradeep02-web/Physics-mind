# PhysicsMind — Architecture v2.2

**Status:** canonical. Single source of truth for the v2.2 architecture (sessions 31.5 → 33).
**Audience:** future Claude sessions, future engineers, founder review.
**Loaded:** on demand (CLAUDE.md points here when summary-level context is insufficient).

---

## Table of contents

1. [Why this document exists](#1-why-this-document-exists)
2. [The agent system — Alex + Peter Parker](#2-the-agent-system--alex--peter-parker)
3. [44-engine inventory (Tiers 0–9)](#3-44-engine-inventory-tiers-09)
4. [Pedagogical principles](#4-pedagogical-principles)
5. [V2.2 schema deltas](#5-v22-schema-deltas)
6. [Conceptual mode end-to-end](#6-conceptual-mode-end-to-end)
7. [Board mode v1 architecture](#7-board-mode-v1-architecture)
8. [Image triage matrix (5 tiers × 6 modes)](#8-image-triage-matrix-5-tiers--6-modes)
9. [Runtime economics & model routing](#9-runtime-economics--model-routing)
10. [Source consultation matrix](#10-source-consultation-matrix)
11. [V3 future architecture (year 2-3)](#11-v3-future-architecture-year-2-3)
12. [Code changes shipped (32.5 + 33)](#12-code-changes-shipped-325--33)
13. [Open items & next sessions](#13-open-items--next-sessions)

---

## 1. Why this document exists

Three forces collided across sessions 31.5–33:

1. **Architecture grew faster than docs.** v2.1 → v2.2 added Socratic-reveal pacing, `teaching_method` enum, `entry_state_map`, `has_prebuilt_deep_dive`, parametric scene patterns. The Alex agent specs absorbed it; CLAUDE.md got a few rule additions; nothing told the *whole story*.
2. **Two reference files were vapor.** CLAUDE.md cites `PLAN.md` and `CLAUDE_ENGINES.md` as if they exist. They don't. Future sessions opened CLAUDE.md, looked for the deep context, and found nothing.
3. **Compaction summaries are not durable.** Multi-session architectural decisions live only in the chat history. The next compaction risks losing the "why".

This doc is the canonical record. The Alex specs are the operating instructions. CLAUDE.md is the operating manual. This doc is the *map*.

---

## 2. The agent system — Alex + Peter Parker

Two layers of specialized agents. Both layers are markdown spec files, NOT runtime agents — Claude reads the relevant spec at the start of a task and adopts that role for the duration.

### 2.1 Alex — the 5 authoring agents (pipeline)

Author concept JSONs. Strict pipeline; each step's output gates the next.

| # | Agent | Role | Output | Spec |
|---|---|---|---|---|
| 1 | `architect` | Skeleton: claim, state arc, EPIC-C branches, prerequisites, anchor | Markdown skeleton (9 sections) | `.agents/architect/CLAUDE.md` |
| 2 | `physics_author` | Rigor: variables, formulas, constraints, mark scheme, drill-down phrases | Markdown physics block (6 sections) | `.agents/physics_author/CLAUDE.md` |
| 3 | `json_author` | Render skeleton + physics into v2.2 JSON; touch 8 registration sites | `src/data/concepts/<id>.json` + 5 code edits + 1 SQL migration | `.agents/json_author/CLAUDE.md` |
| 4 | `quality_auditor` | 7 hard gates; if any fails, route back to the right author | PASS/FAIL report | `.agents/quality_auditor/CLAUDE.md` |
| 5 | `feedback_collector` | Nightly offline: clusters student confusion → cluster_id → proposal queue | Supabase rows | `.agents/feedback_collector/CLAUDE.md` |

**Model choice:** Sonnet 4.6 for steps 1–4 (authoring requires craft, not maximum reasoning). Opus only when the architectural decision affects the whole codebase (this doc, schema redesigns, engine cluster design).

### 2.2 Peter Parker — the 5 engine cluster maintainers (deferred)

Maintain the engines, not the content. Five clusters mirror the Tier structure.

| Cluster | Owns | Status |
|---|---|---|
| `renderer_primitives` | PCPL primitive library + parametric_renderer + graph_interactive | spec NOT YET WRITTEN |
| `runtime_generation` | Sonnet sub-sim path (deep-dive on-demand, drill-down miss) + caching | spec NOT YET WRITTEN |
| `quality` | E42 Physics Validator, E43 Visual Probe, E44 Regression Suite | spec NOT YET WRITTEN |
| `self_improvement` | Tier 8 quartet (Collector/Clusterer/Proposer/Auto-Promoter) | spec NOT YET WRITTEN |
| `assessment` | MCQ generator, Feynman grader, answer-sheet PDF | spec NOT YET WRITTEN |

**Why deferred:** writing 5 cluster specs before we have ≥3 proof-runs through Alex would lock in an abstraction we don't yet understand. Plan: ship 2-3 more v2.2-native concepts (parallelogram_law_test, vab_formula, friction_static_kinetic) to surface the real engine touchpoints, THEN write the cluster specs from observed reality.

### 2.3 How they interact

```
Author flow (per concept):
  architect  →  physics_author  →  json_author  →  quality_auditor  →  ship
                                                            ↓ FAIL
                                              route back to one of {architect, physics_author, json_author}

Engine flow (per cluster):
  feedback_collector  →  proposal_queue  →  Pradeep approves  →  renderer_primitives / runtime_generation
                                                                    fix the engine
                                                                              ↓
                                                              all concepts benefit (no per-JSON edits)

Sub-agents:
  - Alex agents may use Explore/Read/Grep/Glob for codebase navigation.
  - Architect may use WebSearch for syllabus scope (TOC only, not content).
  - All authoring agents use Sonnet 4.6 (cheaper, capable).
  - Heavy parallel work (validator runs across all 52 concepts) → spawn Haiku 4.5 sub-agents.
```

**Engine philosophy (Rule 17):** *Engines learn nothing. JSONs learn everything. Humans approve everything.* The engines stay fixed. The JSONs (and the cluster registry, the deep-dive cache, the variant table) accumulate the moat.

---

## 3. 44-engine inventory (Tiers 0–9)

Snapshot as of 2026-04-23. Updated whenever a Tier changes shape.

### Tier 0 — Storage & Schema (5 engines)

| # | Engine | Status | Notes |
|---|---|---|---|
| E1 | Supabase (pgvector) | shipped | concept_panel_config, ncert_content (6,069 chunks), ai_usage_log, etc. |
| E2 | concept JSON schema (Zod v2.0.0) | shipped | `src/schemas/conceptJson.ts`. v2.2 fields are passthrough. |
| E3 | Cache fingerprint (5D → 6D) | shipped (5D); 6D pending | concept_id\|intent\|class_level\|mode\|aspect, +board_variant for board mode |
| E4 | session_context table | shipped | per-session memory of last concept + last state |
| E5 | confusion_cluster_registry | shipped | one row per (concept_id, state_id, cluster_id) with trigger_examples TEXT[] |

### Tier 1 — Classifier & Routing (4)

| # | Engine | Status | Notes |
|---|---|---|---|
| E6 | Intent Classifier (Gemini Flash) | shipped | `intentClassifier.ts`. Returns concept_id + intent + aspect. |
| E7 | Concept synonym map | shipped | CONCEPT_SYNONYMS. Legacy bundles redirect to atomic children. |
| E8 | Classifier-prompt drift detector | shipped session 32.5 | `assertClassifierPromptInSync()` boots a dev-only sentinel |
| E9 | aspect → state_range routing | partial | depends on `entry_state_map` in JSON; built session 33 |

### Tier 2 — Renderer Primitives (PCPL) (4)

| # | Engine | Status | Notes |
|---|---|---|---|
| E10 | parametric_renderer (Canvas / p5) | shipped | 2453 lines; primary renderer for Ch.5 + Ch.8 |
| E11 | Choreography (6 canonical motion types) | shipped | projectile, free-fall, SHM, circular, Atwood, incline+friction. *Bug:* uniform translation at runtime but missing from canonical list. |
| E12 | PCPL primitive library | partial | 13 built (see §5.4); 22 planned (target 35) |
| E13 | graph_interactive renderer | shipped | 504 lines; 2nd active renderer for V-I, x-t, etc. |

### Tier 3 — Concept Authoring (4)

| # | Engine | Status | Notes |
|---|---|---|---|
| E14 | Concept JSON loader | shipped | `loadConstants()` reads `src/data/concepts/` first, legacy fallback |
| E15 | normalizeOldStates bridge | shipped | legacy `simulation_states` → `epic_l_path` |
| E16 | Strict-engines gate | shipped | rejects malformed JSONs before assembly |
| E17 | Concept validator script | shipped | `npm run validate:concepts` |

### Tier 4 — Sub-Simulation (DEEP-DIVE / DRILL-DOWN) (4)

| # | Engine | Status | Notes |
|---|---|---|---|
| E18 | DEEP-DIVE engine (sub-sim per state) | shipped | `/api/deep-dive`. Pre-built (cache hit) or on-demand (Sonnet) |
| E19 | DRILL-DOWN engine (cluster-targeted sub-sim) | shipped | `/api/drill-down`. Haiku classifier → cluster_id → cached or generated |
| E20 | deep_dive_cache table | shipped | 6D fingerprint, status: pending_review/verified |
| E21 | drill_down_cache table | shipped | 6D fingerprint with cluster_id |

### Tier 5 — Modes (3)

| # | Engine | Status | Notes |
|---|---|---|---|
| E22 | mode_overrides merger | shipped | runtime: baseline + mode_overrides[mode] deep-merged at session start |
| E23 | Board mode (canvas_style: answer_sheet) | shipped | derivation_sequence + mark_scheme + mark_badge per state |
| E24 | Competitive mode (shortcuts + edge_cases) | shipped | uses regeneration_variants for "what if" |

### Tier 6 — Live Serving (3)

| # | Engine | Status | Notes |
|---|---|---|---|
| E25 | /api/generate-simulation | shipped | with stale-fingerprintKey guard (session 32.5) |
| E26 | /api/chat (with on_demand_available) | shipped | enriched in session 33 with concept_id + fingerprintKey |
| E27 | TeacherPlayer (state machine + TTS) | shipped | de-gated DEEP-DIVE button session 33 |

### Tier 7 — Assessment & Generation (6)

| # | Engine | Status | Notes |
|---|---|---|---|
| E28 | Assessment generator (MCQ) | partial | per-concept question bank generation |
| E29 | Feynman-mode grader | not_started | "Now you explain it back" — Sonnet grades against physics_engine_config |
| E30 | Answer-sheet PDF export | not_started | E37 client-side jsPDF for V1 |
| E31 | PYQ ingester | partial | metadata only; HC Verma / DC Pandey / NCERT scope check |
| E32 | NCERT chunk extractor | shipped | 6,069 chunks |
| E33 | MinerU image+PDF pipeline | shipped | port 8000 Python uvicorn |

### Tier 8 — Self-Improvement (4)

| # | Engine | Status | Notes |
|---|---|---|---|
| E34 | Feedback Collector | not_started | nightly: aggregate variant_feedback + simulation_feedback + chat_feedback |
| E35 | Confusion Clusterer | not_started | DBSCAN/HDBSCAN over student confusion phrases → cluster proposals |
| E36 | Change Proposer | not_started | structured diffs to JSON / cluster registry / drill-down trigger lists |
| E37 | Auto-Promoter (Rule 18) | not_started | 20 positive + 0 negative + 0 E42 violations → status: verified |

### Tier 9 — Quality (3) + Bug-tracking (3)

| # | Engine | Status | Notes |
|---|---|---|---|
| E38 | Physics Validator (E42) | partial | 9 hard conditions per CLAUDE_ENGINES.md (renamed E25/E29/E30 in old docs; consolidated as E42 here) |
| E39 | Visual Probe (E43) | not_started | replaces gate 4 walks; logs to test_session_log |
| E40 | Regression Suite (E44) | not_started | nightly across all concepts |
| E41 | engine_bug_queue table | not_started | structured bugs vs. PROGRESS.md prose |
| E42 | test_session_log table | not_started | every gate run, every concept, every session |
| E43 | proposal_queue table | not_started | Pradeep's review surface for Tier 8 outputs |

**Total: 43 engines** (one short of 44 — slot reserved for engine cluster maintainer index when Peter Parker specs ship).

---

## 4. Pedagogical principles

These are the rules that distinguish PhysicsMind from a textbook in JSON form.

### 4.1 Quality-over-state-count (Dhurandar principle)

A 4-hour movie works when the story earns it. A 12-state simulation works when the concept needs 12. **Don't pad, don't truncate. Let the physics dictate the length.**

The CLAUDE.md §7 table (2-3 / 3-4 / 5-6 / 7-9 / 10-12) is calibration, not a ceiling. If you land outside the range:
- Either the concept isn't atomic (consider splitting) — flag with architect.
- Or it's genuinely more complex than the table predicts — document why.

**Quality test:** *"Could a student who watches ALL states answer any exam question on this concept?"* YES = correct count. NO = add more.

### 4.2 Socratic reveal — the default pacing

**Static simulations fail pedagogy.** A state that shows every primitive at t=0 *dumps information*; a state that reveals primitives in sync with the teacher script *teaches*.

**Default pattern** for every state introducing a new physical quantity:

```
t=0       Base scene visible (person, floor, mg).
          TTS sentence 1: states the setup.
[pause 1.5s]
t=3s      TTS sentence 2: asks a prediction question.
          ("Think — where will the normal reaction point?")
[pause 2-3s — let the student predict]
t=6s      TTS sentence 3: reveals answer + new primitive
          animates in (fade / bounce / highlight).
          Focal Attention engine spotlights the new primitive.
t=9s      TTS sentence 4: explains the insight.
          Supporting label / equation appears in callout zone.
```

**Always-on. Not an opt-in.** Only states that skip:
- Introductory hook states (t=0 is the setup; no new physics revealed).
- Final summary / interactive states (the student drives, not the teacher).
- EPIC-C STATE_1 (wrong belief is shown IMMEDIATELY for confrontation).

Implemented via `reveal_at_tts_id` on primitives + `pause_after_ms` on tts_sentences. See §5.2.

### 4.3 Teaching method per state — the framing lever

Socratic reveal is *how fast*. **Teaching method** is *what frame*. Seven enum values, one per state:

| `teaching_method` | When |
|---|---|
| `narrative_socratic` | Default — EPIC-L states introducing new insight. Hook → predict → reveal → explain. |
| `misconception_confrontation` | EPIC-C STATE_1 — wrong belief literally drawn on canvas with "Myth:" label. |
| `worked_example` | Board-mode states. Derivation steps via `derivation_sequence` + `mark_badge`. |
| `shortcut_edge_case` | Competitive-mode states. Shortcut formula, boundary condition. |
| `compare_contrast` | DRILL-DOWN sub-sims. Right intuition beside wrong intuition. |
| `exploration_sliders` | Interactive final state of EPIC-L. Student drives variables. |
| `derivation_first_principles` | Feynman-mode / advanced derive states. Formula built from axioms. |

**This is the v3 hook:** today every JSON ships with one teaching_method per state. In v3, the `pedagogy_layer` will swap teaching_methods per student profile (a JEE-prep student might prefer `derivation_first_principles` everywhere; a board-prep student wants `worked_example`).

### 4.4 Three-mode separation (Rule 20)

Every atomic JSON ships:
1. `epic_l_path` — conceptual baseline (the "understand it" mode).
2. `mode_overrides.board` — answer-sheet derivation (the "write it on exam" mode).
3. `mode_overrides.competitive` — shortcuts + edge cases (the "JEE/NEET" mode).

Conceptual-only JSONs are allowed only for legacy retrofits already in production. New authoring ships all three from day one.

### 4.5 Indian context anchors

Every real_world_anchor must be:
- **Specific Indian context.** Mango from a Chennai monsoon tree ≠ "fruit falls". Auto-rickshaw braking ≠ "vehicle decelerates".
- **Plain English. Never Hinglish.** No "tum", "hain", "zameen", "deewar", "seedhi", "kya".
- **Age-appropriate Class 10–12.** Auto-rickshaws, IPL matches, local trains, monsoon, Diwali crackers — yes. Wall Street, Tesla, NFL — no.
- **Physics-true.** The anchor must genuinely exhibit the concept, not metaphorically.

Strong examples shipped: `field_forces.json` (mango falling in Chennai monsoon), `normal_reaction.json` (elevator floor — feel heavier going up).

### 4.6 DC Pandey TOC-only rule (Rule per CLAUDE.md §8)

DC Pandey, HC Verma, NCERT, state textbooks, PYQ papers are **TOC + terminology references only**. Never content sources.

**Allowed:**
- Chapter table of contents — confirm "normal reaction" is in Ch. 8 Forces.
- Sub-topic list — sanity-check atomic decomposition.
- PYQ metadata (which concepts appear on JEE).
- Standard physics terminology (e.g., the standard symbol for kinetic friction is μₖ).

**Forbidden:**
- Teaching sequences (state order is from cognitive progression, not chapter flow).
- Figure references (every diagram is newly composed).
- Example problems (real-world anchors are fresh Indian context).
- Explanation phrasings (`text_en` is authored from first principles).

Each authoring agent's self-review must include a "DC Pandey check" line.

### 4.7 Student-first UI (session 33)

**Every EPIC-L state shows the Explain button.** `has_prebuilt_deep_dive` (formerly `allow_deep_dive`) is no longer a UI gate — it's a cache hint:

- States with `has_prebuilt_deep_dive: true` → pre-authored deep-dive serves from cache (<5s).
- States with `has_prebuilt_deep_dive: false` (or omitted) → on-demand Sonnet generates the deep-dive (30-60s spinner).

**No student is ever told "this state can't be explained deeper."**

### 4.8 Engines learn nothing. JSONs learn everything. Humans approve everything. (Rule 17)

The engines stay fixed. The accumulated wisdom lives in:
- The JSON (state arc, mark scheme, drill-down clusters).
- The cluster registry (Supabase `confusion_cluster_registry`).
- The deep-dive cache (Supabase `deep_dive_cache`).
- The variant feedback (Supabase `variant_feedback`).

Sonnet is **banned from UNCACHED live serving paths for verified content** (Rule 18). Permitted only for:
- (a) First-student DEEP-DIVE generation behind a spinner + `pending_review` badge.
- (b) Rare drill-down cluster misses with same badge + review.

All runtime Sonnet output is cached and reviewed within 24h or auto-promoted after 20 positive feedbacks with zero negatives.

---

## 5. V2.2 schema deltas

Three additive, non-breaking fields. Existing v2.1 JSONs remain valid; new authoring ships all three.

### 5.1 `teaching_method` per state (string enum)

Every state in `epic_l_path.states` + `epic_c_branches[].states` carries one of the 7 enum values from §4.3.

```json
"STATE_3": {
  "title": "Incline case: N = mg cosθ",
  "teaching_method": "narrative_socratic",
  "scene_composition": [ ... ]
}
```

**Defaults:** EPIC-L → `narrative_socratic`. Board overrides → `worked_example`. Competitive overrides → `shortcut_edge_case`.

### 5.2 `reveal_at_tts_id` on primitives + `pause_after_ms` on TTS sentences

Socratic-reveal bindings. The physics_author's reveal table translates to:

```json
"scene_composition": [
  { "id": "person_body",  "type": "body",   "/* always visible */": true },
  { "id": "mg_vector",    "type": "vector", "/* always visible */": true },
  { "id": "N_vector",     "type": "vector",
    "reveal_at_tts_id": "s3",
    "animate_in": "fade",
    "focal_highlight_ms": 800 },
  { "id": "equilibrium_label", "type": "text",
    "reveal_at_tts_id": "s4",
    "animate_in": "slide_right" }
],
"teacher_script": {
  "tts_sentences": [
    { "id": "s1", "text_en": "Person stands on the floor. mg acts downward.", "pause_after_ms": 1500 },
    { "id": "s2", "text_en": "Person isn't falling through — where must the floor push?", "pause_after_ms": 2500 },
    { "id": "s3", "text_en": "Floor pushes back. Normal reaction, N.",                     "pause_after_ms": 800 },
    { "id": "s4", "text_en": "At equilibrium, N = mg.",                                   "pause_after_ms": 1200 }
  ]
}
```

**Runtime:** TeacherPlayer fires primitive reveal animations when it begins speaking the matching `id` sentence. Primitives without `reveal_at_tts_id` are visible at state entry (base scene). `pause_after_ms` defaults to 1000.

**Future Zod superRefine (v2.3):** for every state with `teaching_method: "narrative_socratic"`, at least one primitive must have `reveal_at_tts_id` (otherwise the state is a static dump). Not enforced today because 48 unretrofitted JSONs would break.

### 5.3 `entry_state_map` at concept root

Aspect routing. Classifier returns `aspect`; TeacherPlayer plays the matching state slice — not the whole 8-state path.

```json
{
  "concept_id": "normal_reaction",
  "entry_state_map": {
    "foundational": { "start": "STATE_1", "end": "STATE_3" },
    "incline":      { "start": "STATE_4", "end": "STATE_5" },
    "elevator":     { "start": "STATE_6", "end": "STATE_7" },
    "free_fall":    { "start": "STATE_8", "end": "STATE_8" }
  },
  "epic_l_path": { ... }
}
```

**Defaults:** unknown aspect → `foundational`. Cross-slice exit pills ("See incline case?") invite deeper exploration after the foundational slice ends.

### 5.4 PCPL primitive library — 13 built, 22 planned (target 35)

| Built (13) — safe to use | Purpose |
|---|---|
| `body` | physical object (circle/rect) |
| `surface` | table/wall/incline |
| `force_arrow` | drawn force with magnitude_expr + direction_deg |
| `vector` | generic arrow |
| `label` | text (text or text_expr) |
| `annotation` | callout text with style |
| `formula_box` | boxed equation |
| `slider` | student input (variable, min, max, step) |
| `angle_arc` | angle indicator with vertex |
| `axes` | coordinate frame |
| `force_components` | force decomposition |
| `derivation_step` | board handwriting (`animate_in: "handwriting"`) |
| `mark_badge` | board mark overlay (yellow "+N marks") |

**Planned (22) — NOT yet built:** `earth_surface`, `table_surface`, `ramp`, `pulley`, `mass_block`, `spring`, `charge`, `magnet`, `electric_field`, `magnetic_field`, `gravity_field`, `wave_field`, `variable_meter`, `equation_box`, `unit_display`, `step_counter`, `battery`, `resistor`, `capacitor`, `led`, `switch`, `voltmeter`.

**Rule:** if a concept needs a planned primitive, STOP — file engine bug against `renderer_primitives` cluster, do not invent.

### 5.5 What's NOT in v2.2 (deferred to v2.3)

- `scene_pattern` for parametric scaling (3-block FBD vs 2-block FBD via composition_rules).
- `derivation_atoms[]` + `composition_rules` + `mark_variants` + `BOARD_PROFILES` (board mode atom-composition architecture).
- 6D fingerprint key with `board_variant` for board mode caching.
- Zod superRefine for Socratic-reveal discipline.
- Engine composition for board atoms (deterministic, no LLM).
- Build-time cache pre-warming script (832 combinations).

These ship in v2.3 once we have ≥3 v2.2-native concepts to validate the patterns.

---

## 6. Conceptual mode end-to-end

### 6.1 Request flow

```
Student types query in /chat
  ↓
/api/chat (Gemini Flash classifier)
  → returns: { concept_id, intent, aspect, on_demand_available?: true, sim_label, fingerprintKey }
  ↓
LearnConceptTab receives response
  → if on_demand_available: render "Show simulation" pill + cache fingerprintKey in lastFingerprintKeyRef
  → student clicks pill → triggerLessonGeneration(concept=on_demand_concept_id)
  ↓
/api/generate-simulation
  → stale-fingerprintKey guard (session 32.5): if concept slug ≠ fingerprintKey[0], drop stale key, re-classify
  → cache lookup: simulation_cache by 5D key
  → HIT: serve cached config → done
  → MISS: assemble parametric HTML (PCPL) or legacy (mechanics_2d) renderer based on PCPL_CONCEPTS set
  ↓
TeacherPlayer renders iframe
  → SET_STATE messages drive PM_currentState (Rule 6)
  → SIM_READY postMessage acks to parent
  → STATE_REACHED postMessage tracks completion
```

### 6.2 Eight registration sites for a new concept

Adding a concept requires touching ALL of these. Missing ANY ONE = silent failure.

| # | File | Location | Edit |
|---|---|---|---|
| 1 | `src/data/concepts/<id>.json` | new file | the JSON itself |
| 2 | `src/lib/intentClassifier.ts` | `VALID_CONCEPT_IDS` set (~line 36-84) | add slug under chapter group |
| 3 | `src/lib/intentClassifier.ts` | `CLASSIFIER_PROMPT` (line ~137+) | add to chapter list shown to Gemini |
| 4 | `src/lib/intentClassifier.ts` | `CONCEPT_SYNONYMS` (line ~96-126) | add common phrasings → canonical slug |
| 5 | `src/lib/aiSimulationGenerator.ts` | `CONCEPT_RENDERER_MAP` (line ~2564) | legacy concepts; PCPL concepts skip this |
| 6 | `src/lib/aiSimulationGenerator.ts` | `PCPL_CONCEPTS` set (line ~2825) | parametric concepts go here |
| 7 | `src/config/panelConfig.ts` | `CONCEPT_PANEL_MAP` | layout + panel types |
| 8 | Supabase | `concept_panel_config` + `confusion_cluster_registry` | SQL migrations |

**Boot-time drift detector** (`assertClassifierPromptInSync()` at intentClassifier.ts:141-204) catches any site-2 / site-3 mismatch.

### 6.3 EPIC paths

| Path | State count | Trigger | Purpose |
|---|---|---|---|
| EPIC-L | 2-12 (concept-driven) | First-time learning | Full conceptual arc: hook → mechanism → formula → edge → interactive |
| EPIC-C | 4-7 branches × 3-6 states | Misconception detected | STATE_1 ALWAYS shows wrong belief (Rule 16) |
| LOCAL | 2-4 | Specific gap | Skip hook, jump to the gap |
| MICRO | always 2 | Single symbol or formula term | "What is μ?" → 2-state explanation |
| WHAT-IF | 0 new | Student changes a slider value | Physics Engine reruns existing scenes |
| HOTSPOT | always 2 | Canvas tap on a primitive | Tap mg → 2-state "what is mg?" |
| DEEP-DIVE | 4-6 sub-states per parent | Student clicks Explain button | Pre-built or on-demand Sonnet |
| DRILL-DOWN | 2-4 sub-states | Typed confusion phrase → cluster_id | Cluster-targeted MICRO/LOCAL |
| BOARD | 5-8 | Mode switch to "board" | mark_scheme + answer-sheet style |

### 6.4 Three-layer student interaction

Every concept exposes three interaction layers:

1. **Chat panel** — type natural language. Classifier routes to concept + aspect → TeacherPlayer plays state slice.
2. **DEEP-DIVE** — click "Explain step-by-step" on any state → 4-6 sub-states elaborate that state. Pre-built or on-demand.
3. **DRILL-DOWN** — click "Confused?" → modal → type confusion phrase → Haiku classifies → cluster_id → cached or generated MICRO/LOCAL sub-sim.

DEEP-DIVE and DRILL-DOWN are mutually exclusive entry paths (Rule 22). DEEP-DIVE = button. DRILL-DOWN = typed phrase. Never mix.

---

## 7. Board mode v1 architecture

### 7.1 What board mode is

A student picks "Board mode" in the UI. The same concept renders as the answer they should write on their CBSE / Maharashtra / Tamil Nadu board exam paper:

- **Canvas style:** white ruled answer sheet (`canvas_style: "answer_sheet"`) with red left margin.
- **Handwriting animation:** `derivation_step` primitives with `animate_in: "handwriting"` write the derivation character-by-character.
- **Mark badges:** yellow "+N marks" overlays accumulate as steps complete (mark_badge primitives tied to mark_scheme lines).
- **Per-board variants:** the *approach* changes by board (CBSE wants full derivation; Maharashtra wants compact; AP State wants stepwise). The *content* is the same atomic concept.
- **Answer-sheet PDF export** (E37, planned): one click → student's clean answer template downloads as PDF.
- **PYQ sidebar:** for the same concept, surface 3-5 past year questions (curated) with mark allotments.

### 7.2 Atom-composition architecture (v2.3, designed not shipped)

**The misconception we ruled out:** authoring per-board JSON variants (CBSE-style + MH-style + TN-style → 3× JSONs per concept). Combinatorial explosion.

**The architecture we picked:** ONE JSON per concept. mode_overrides.board contains:

```json
"derivation_atoms": [
  { "atom_id": "fbd",        "primitives": [ ... ] },
  { "atom_id": "axes",       "primitives": [ ... ] },
  { "atom_id": "decompose_mg", "primitives": [ ... ] },
  { "atom_id": "balance_normal", "primitives": [ ... ] },
  { "atom_id": "numeric",    "primitives": [ ... ] }
],
"composition_rules": {
  "CBSE_5mark":  ["fbd", "axes", "decompose_mg", "balance_normal", "numeric"],
  "CBSE_3mark":  ["fbd", "balance_normal", "numeric"],
  "MH_2mark":    ["balance_normal", "numeric"],
  "TN_5mark":    ["fbd", "axes", "decompose_mg", "balance_normal", "numeric"]
},
"mark_variants": {
  "CBSE_5mark":  [1, 1, 1, 1, 1],
  "CBSE_3mark":  [1, 1, 1],
  "MH_2mark":    [1, 1],
  "TN_5mark":    [2, 1, 1, 0.5, 0.5]
},
"BOARD_PROFILES": {
  "CBSE": "CBSE_5mark",
  "MH":   "MH_2mark",
  "TN":   "TN_5mark"
}
```

Engine composition (deterministic, NO LLM) selects atoms per profile at runtime. New board added → add a new BOARD_PROFILES entry, one composition rule, one mark variant. No re-authoring atoms.

### 7.3 Mark accumulator

Engine-driven, NOT authored per-state. The TeacherPlayer maintains a running `marksAwarded` counter; each `derivation_step` completion increments it via the matching `mark_variants[currentProfile][stepIndex]`. UI renders `marksAwarded / totalMarks` (e.g., 3/5).

### 7.4 Cache key — 6D for board mode

Standard simulation_cache: 5D `concept_id|intent|class_level|mode|aspect`.

Board mode adds: `concept_id|intent|class_level|mode|aspect|board_variant`. board_variant ∈ {CBSE_5mark, CBSE_3mark, MH_2mark, TN_5mark, ...}.

Same concept, different board → different cache row.

### 7.5 MVP exists at `public/board-mvp.html`

~700 lines of self-contained HTML demonstrating board mode for Atwood Machine 7-mark derivation:
- Header with brand + board selector dropdown (CBSE/MH/TS/AP).
- Question card with mark allotment.
- Left sidebar: step navigator (7 pills), mark accumulator (0/7 → 7/7), play/pause, PYQ list (5 items), download PDF button.
- Right: answer sheet (off-white #FDFBF4, ruled lines, red margin at 100px) with Caveat handwriting font animation at 28 chars/sec.
- Inline FBD SVG (pulley + 2 masses + acceleration arrows + weight labels).
- Mark badges pop in after each step (scale + rotate keyframe).
- Final answers in boxed format (a = 2.45 m/s², T = 36.75 N).
- @media print stylesheet for clean PDF export.

**Status:** UX validated, content-source validated. Engine implementation deferred to v2.3.

---

## 8. Image triage matrix (5 tiers × 6 modes)

When a student uploads an image (textbook screenshot, hand-drawn FBD, chapter from a private coaching institute like Allen / Resonance / FIITJEE), the system must triage it.

### 8.1 Five coverage tiers

| Tier | Name | Latency | Cost | When |
|---|---|---|---|---|
| 0 | Scope filter | <100ms | 0 | Image is non-physics (selfie, meme, junk) → reject politely |
| 1 | Canonical match | <500ms | $0.0001 | Image matches a verified concept exactly → serve cached sim |
| 2 | Pattern match | 1-2s | $0.0005 | Image matches a known scene_pattern (e.g., "block on incline") → instantiate template |
| 3 | Composite | 5-10s | $0.005 | Image is multi-concept (e.g., "block A on block B with friction between") → compose from atoms |
| 4 | Sonnet fallback | 30-60s | $0.05 | Novel arrangement → Sonnet vision generates a one-off sub-sim, badge `pending_review` |

### 8.2 Six intent modes (orthogonal to tier)

| Mode | What student wants | Example |
|---|---|---|
| Learn | Explain the concept | "What is this showing?" |
| Correct | Validate my work | "Is my FBD right?" |
| Solve | Walk me through this problem | "Solve this for tension T" |
| Compare | Compare with right answer | "How is mine different from the textbook?" |
| Check | Just verify, no explanation | "Is this right? Yes/no." |
| Explore | Vary parameters around this | "What if mass were doubled?" |

### 8.3 5×6 routing matrix

|  | Learn | Correct | Solve | Compare | Check | Explore |
|---|---|---|---|---|---|---|
| **Tier 0** | reject | reject | reject | reject | reject | reject |
| **Tier 1** | serve cached EPIC-L | overlay diff | serve worked_example | side-by-side | yes/no badge | open sliders |
| **Tier 2** | instantiate scene_pattern | overlay vs template | instantiate + worked_example | side-by-side | yes/no | open sliders |
| **Tier 3** | compose atoms → EPIC-L | compose + diff | compose + worked_example | side-by-side | yes/no | sliders on composed |
| **Tier 4** | Sonnet generate, pending_review | Sonnet vision diff | Sonnet generate + walk | Sonnet side-by-side | Sonnet yes/no | Sonnet generates sliders |

### 8.4 Triage engine + Intent Detector

Two engines (NOT_STARTED) gate this:
- **Triage engine:** classifies tier (0-4) using vision → primitive features.
- **Intent Detector:** classifies intent (Learn/Correct/Solve/Compare/Check/Explore) from accompanying text + UI button context.

Until both ship, image upload defaults to Tier 4 + Learn (Sonnet generates).

---

## 9. Runtime economics & model routing

The whole point of the architecture: **steady-state cost per query approaches $0.0001** even though we use Sonnet during authoring.

### 9.1 Per-query cost at steady state

| Path | Model | Cost per query | When it runs |
|---|---|---|---|
| Cache hit (90%+ of traffic) | none | $0 | concept already authored, no novel student input |
| Classifier | Gemini Flash | $0.0001 | every query (4-5 input tokens classified) |
| Drill-down miss | Haiku 4.5 | $0.001 | rare: confusion phrase doesn't match any cluster → Haiku classifies + serves |
| DEEP-DIVE on-demand | Sonnet 4.6 | $0.05 | first student to click Explain on a state without pre-built deep-dive |
| Image vision | Sonnet 4.6 | $0.10 | any image upload (Tier 1-4) |
| Novel concept fallback | Sonnet 4.6 | $0.10 | classifier returns concept_id NOT in VALID_CONCEPT_IDS — extremely rare |

**Steady-state expectation:** 90% cache hits + 10% Gemini Flash classifier ≈ $0.0001/query average.

### 9.2 Pre-warm cache strategy

At deploy time, generate every plausible cache entry:
- 52 concepts × 4 intents × 3 class levels × 3 modes × 4 aspects = **7,488 base entries**
- Add board mode 4 board_variants × 52 concepts = **+208 entries**
- Total pre-warm: ~7,700 entries

Build-time script (NOT_STARTED) runs once per deploy, populates simulation_cache with the most common queries. First student through any popular concept hits cache.

### 9.3 Why Sonnet stays cheap

Sonnet 4.6 ($3/$15 per Mtoken) is **only ever in the authoring path** (Alex pipeline) and the *cold-start sub-sim path* (DEEP-DIVE on-demand, drill-down miss). Both paths cache the result. Once a deep-dive is generated and reviewed, every subsequent student gets it free from cache.

**Banned (Rule 18):** Sonnet in uncached live serving paths for verified content.

### 9.4 Authoring-time vs runtime

Authoring time (per concept): one-time $5-15 in Sonnet calls across the 4 Alex agents + auditor walks.

Runtime (per student query for that concept, post-authoring): $0.0001.

This is the moat: 50,000 students/day × $0.0001 = $5/day. 50,000 students × $0.10 (Sonnet always) = $5,000/day. **Same product, 1000× cheaper at scale.**

---

## 10. Source consultation matrix

Reaffirms §4.6 with a per-source breakdown.

| Source | TOC | Terminology | Content (FORBIDDEN) |
|---|---|---|---|
| NCERT Class 11/12 Physics | yes — chapter list, sub-topic list | yes — standard symbols, units | NEVER copy explanations |
| DC Pandey | yes — JEE syllabus mapping | yes — problem-type taxonomy | NEVER copy worked examples |
| HC Verma | yes — chapter scope check | yes — derivation style names | NEVER copy derivations |
| State board textbooks | yes — board-specific scope | yes — local terminology variants | NEVER copy explanations |
| PYQ papers (10+ years) | yes — concept frequency, mark allotment | yes — exam phrasing | NEVER copy questions verbatim |
| pyq_questions Supabase | yes — for board mode PYQ sidebar | n/a | n/a (already in our system) |

**Rule:** if you found yourself reading an example problem from any external source, STOP. Author a fresh Indian-context anchor from first principles.

---

## 11. V3 future architecture (year 2-3)

### 11.1 Content / pedagogy separation

Today every JSON bundles content (physics + primitives + insights) with pedagogy (state arc + reveal timing + TTS phrasing). Changing teaching method globally means rewriting 10+ JSONs.

V3 splits:

- **`content_layer`** — invariant. Physics, formulas, primitives, insights, real-world anchors. Lives in concept JSON.
- **`pedagogy_layer`** — swappable. State arc, reveal timing, TTS pattern, teaching_method per state. Lives in a separate file `<concept_id>.pedagogy.json` or in a `pedagogy_profiles` Supabase table.

Per-student profile selects pedagogy_layer at session start:
- JEE-prep student → `derivation_first_principles` for everything.
- Board-prep student → `worked_example` for everything.
- Foundation student → `narrative_socratic` (default).

The v2.2 `teaching_method` field is the seed of this split — designed today to lift cleanly into the pedagogy layer when V3 ships.

### 11.2 Variant strategy

Currently each concept has 1 variant (the authored states). v2 ships 1 variant per concept. v3 ships 3 variants per concept (Type A: same world / different parameters; Type B: different world / same physics; Type C: same physics / inverted question).

Cost: 3× authoring effort per concept. Benefit: A/B testing per cohort, regional variant preference (Mumbai vs Chennai students), longer cache hit window before re-authoring.

### 11.3 Multilingual

Today `text_en` is the only language. Pipeline does TTS translation via `tts_translation_cache` + `tts_audio_cache`.

V3: native authoring in `text_hi`, `text_ta`, `text_te`, `text_bn`, `text_kn`, `text_mr`. Each authored by a language-fluent author, not machine-translated. Pedagogy stays per-language consistent.

### 11.4 Adaptive difficulty

Today every student gets the same EPIC-L state count for a concept. V3: difficulty profile per student adjusts state count + pedagogy. A student who passes the first state in 30s skips to STATE_3; one who fumbles gets STATE_1 expanded into a deep-dive automatically.

---

## 12. Code changes shipped (32.5 + 33)

### 12.1 Session 32.5 — three silent-failure classes fixed structurally

| # | Bug class | Fix | File |
|---|---|---|---|
| 1 | Stale-fingerprintKey carry-over | Defensive guard before cache lookup | `src/app/api/generate-simulation/route.ts:43-74` |
| 2 | Classifier-prompt drift | Rewrote prompt + added boot drift detector | `src/lib/intentClassifier.ts:137+` & `:141-204` |
| 3 | E11 missing motion type #7 | Documentation only — `parametric_renderer.ts` already supports `translate` runtime | deferred |

### 12.2 Session 33 — three code fixes + four spec updates

**Code fixes:**
1. **`/api/chat` on_demand_available enriched** — pill response now includes `concept_id` (normalized) + `fingerprintKey`. `route.ts:321-351`
2. **LearnConceptTab pill handler** — reads fingerprintKey from body, passes onDemandConceptId to triggerLessonGeneration. `LearnConceptTab.tsx:905-928 + :1151`
3. **DEEP-DIVE button shown on every state** — removed `allowedDeepDiveStates.includes(currentStateName)` gate. `TeacherPlayer.tsx:624-651`

**Spec updates** (v2.2 schema deltas):
- `architect/CLAUDE.md`: 158 → 230 lines. New §3 Socratic-reveal plan, new §"Teaching method per state", new §"Entry state map", `has_prebuilt_deep_dive` rename.
- `physics_author/CLAUDE.md`: 157 → 169 lines. New §3 within-state reveal timeline (TTS-to-primitive binding table).
- `json_author/CLAUDE.md`: 175 → 227 lines. New §"v2.2 schema deltas" with JSON examples for all three new fields.
- `quality_auditor/CLAUDE.md`: 164 → 206 lines. Gate 3c Socratic-reveal check, Gate 5 split into 5a (pre-built) + 5b (on-demand), silent-failure catalog rows updated.

---

## 13. Open items & next sessions

### 13.1 Authoring queue (Phase E)

| Concept | Status | Why |
|---|---|---|
| `parallelogram_law_test` | next | First v2.2-native — exercises all three new fields |
| `vab_formula` | next+1 | Second v2.2-native, relative motion family |
| `friction_static_kinetic` | session 34 (this proof-run) | Best demo of `teaching_method: misconception_confrontation` |
| 48 unretrofitted JSONs | rolling | Backfilled opportunistically when touched |

### 13.2 Engine work (Phase F-G)

- Write Peter Parker cluster CLAUDE.md files after 2-3 more proof-runs (so we author from observed reality, not theory).
- Build E41 `engine_bug_queue` Supabase table.
- Build E42 `test_session_log` Supabase table.
- Build E43 `proposal_queue` Supabase table.
- Implement E37 client-side jsPDF for board mode answer-sheet export.
- Build the build-time pre-warm cache script (~7,700 entries).

### 13.3 V2.3 schema work (Phase H)

- `scene_pattern` + `composition_rules` for parametric configurations.
- Board atom-composition fields (`derivation_atoms[]`, `composition_rules`, `mark_variants`, `BOARD_PROFILES`).
- Add `board_variant` to fingerprint → 6D cache key.
- Zod superRefine for Socratic-reveal discipline.
- 22 planned PCPL primitives → expand to target 35.
- E11 add motion type #7 "uniform translation".

### 13.4 Image triage infrastructure (Phase I)

- Build Tier 0 scope filter UI.
- Build Triage engine (Tier 1-4 classifier).
- Build Intent Detector engine.
- Wire 5×6 routing matrix into upload flow.

### 13.5 V3 work (Year 2-3)

- Content / pedagogy separation.
- Variant strategy 1 → 3 per concept.
- Multilingual native authoring.
- Adaptive difficulty per student profile.

---

*Last updated: 2026-04-24, session 34 — friction_static_kinetic proof-run.*
