# PhysicsMind — Architecture v2 Master Document

**Version:** 2.0 — Consolidated from session analysis, April 2026
**Purpose:** Single reference covering engines, AI strategy, teaching paths, mode system, offline agents, and 6-month roadmap. Written to be read by Pradeep (founder), Claude Project (Architect), and Antigravity (Engineer).

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [The Core Principle — Engines are the OS, JSONs are the Content](#2-the-core-principle)
3. [The Complete Engine Roster](#3-the-complete-engine-roster)
4. [AI Model Strategy](#4-ai-model-strategy)
5. [The Six Teaching Paths](#5-the-six-teaching-paths)
6. [Mode System — `mode_overrides`](#6-mode-system)
7. [The AI Brain — 10 Levels of Sophistication](#7-the-ai-brain)
8. [Offline Self-Improvement Loop](#8-offline-self-improvement-loop)
9. [Authoring Contract — Architect vs Engineer vs Reviewer](#9-authoring-contract)
10. [Current State — April 2026](#10-current-state)
11. [3-Month Roadmap — April to June 2026](#11-3-month-roadmap)
12. [6-Month Roadmap — July to October 2026](#12-6-month-roadmap)
13. [Key Principles — Never Violate](#13-key-principles)
14. [Risk Register](#14-risk-register)
15. [Success Metrics](#15-success-metrics)
16. [SimSession Orchestrator — How Engines Interlock at Runtime](#16-simsession-orchestrator)
17. [Glossary](#17-glossary)

---

## 1. Executive Summary

PhysicsMind is an AI physics tutor for Indian Class 10–12 students (JEE / NEET / CBSE / ICSE). The product's differentiator is **correctness and adaptivity** — it teaches the right physics every time, remembers each student's misconceptions, and costs pennies per interaction.

The architecture separates concerns cleanly:

- **Engines** — deterministic TypeScript infrastructure. Built once. Serves every concept forever.
- **JSONs** — per-concept content authored by humans (and eventually offline AI agents under human review). Never touched at runtime.
- **AI at runtime** — narrow, cheap (Haiku only), always cached.
- **AI offline** — Sonnet for autoauthoring and self-improvement, gated by human review.

After the Tier 1–3 engines ship (~8 weeks), adding a new concept is **one JSON file + zero code**. This compounds into a content moat that competitors cannot replicate.

---

## 2. The Core Principle

> **Engines are the operating system. JSONs are the content.**

**What "engines" means here:** pure TypeScript modules with well-defined inputs, outputs, and error channels. No AI inside. No per-concept branching.

**What "JSONs" means here:** atomic concept files under `src/data/concepts/{concept_id}.json`. One concept = one question a student might ask = one JSON. Every JSON has the same schema shape (see §9).

**The payoff:** every new feature request is routed to one of three piles:
- *Change an engine* (Engineer, one-time cost, serves all concepts)
- *Change a JSON* (Architect, per-concept cost, zero code)
- *Improve schema* (Architect + Engineer together, a rare and careful event)

This single question — "engine change or content change?" — eliminates 80% of design ambiguity.

---

## 3. The Complete Engine Roster

Twenty-three engines, organized into six tiers. Tiers indicate build order and dependency, not importance. Every tier stands on the prior tier's foundation.

### Tier 1 — Foundation (must exist before anything else works)

| # | Engine | Status | Purpose |
|---|---|---|---|
| 1 | **Physics Engine** | ⚠️ inline JS in renderer; to extract to TS | Pure math. Reads `physics_engine_config`, computes all derived values (N, W, f, etc.). Zero AI. Ground truth. |
| 2 | **Zone Layout Engine** | ❌ | Partitions canvas into 6 named zones (MAIN_ZONE, CALLOUT_ZONE_R, FORMULA_ZONE, LEGEND_ZONE, CONTROL_ZONE, TITLE_ZONE). Authors write `zone: "MAIN_ZONE"`; engine resolves to pixels. |
| 3 | **Anchor Resolver** | ⚠️ partially exists (body/surface registries) | Semantic grammar: `anchor: "block_bottom_center"`, `on_surface: "incline" at: 0.45`, `offset: {dir, gap}`. Converts intent to pixels at render time. |
| 4 | **Scale Engine** | ❌ | `UNIT_TO_PX = MAIN_ZONE.height × 0.70 / maxMagnitude`. All arrow/body sizes are fractions of zones, canvas-size-agnostic. |
| 5 | **Collision Detection Engine** | ❌ | AABB overlap check on every label/annotation. Overlap > 10% → nudge; > 40% → shift slot; last resort → shrink font / elide. |
| 6 | **PCPL Renderer** | ⚠️ 5/12 primitives built (body, surface, force_arrow, label, annotation) | 12 universal primitives serve Class 9–12. Remaining: vector, motion_path, spring, angle_arc, slider, formula_box, comparison_panel. |

### Tier 2 — Teaching Loop (conceptual mode becomes interactive)

| # | Engine | Status | Purpose |
|---|---|---|---|
| 7 | **Teacher Script Engine** | ⚠️ ad-hoc in TeacherPlayer | Syncs `tts_sentences` to state transitions. Respects `advance_mode` (auto_after_tts / manual_click / wait_for_answer). |
| 8 | **State Machine Engine** | ⚠️ scattered | Formal state graph: which state follows which, how transitions trigger, how jumps work, how progress persists. |
| 9 | **Interaction Engine** | ❌ | Event loop for sliders, drags, clicks, tap-on-primitive. Routes events through Physics Engine → Transition → Panel B sync in <50ms. |
| 10 | **Panel B Equation Engine** | ❌ | Data-driven graph. Parses `equation_expr`, renders Plotly trace, handles live_dot + bilateral sync with Panel A. |

### Tier 3 — Motion and Misconception (simulations come alive)

| # | Engine | Status | Purpose |
|---|---|---|---|
| 11 | **Choreography Engine** | ❌ | Reads `animation_sequence.phases`, computes all animation frames from timing intent. Author writes ~30 tokens; engine renders smooth motion. |
| 12 | **Transition Engine** | ❌ | Diffs two scene_compositions, interpolates over 800ms ease-in-out between states. Physics Engine recomputes intermediate values frame-by-frame. |
| 13 | **Focal Attention Engine** | ❌ | Applies pulse / dim_others / highlight to the `focal_primitive_id`. Time-sliced focal shifts via Choreography. |
| 14 | **Misconception Detection Engine** | ⚠️ scattered in classifier + resolver | Fuzzy pattern match against `epic_c_branches.trigger_phrases`. Routes to the right branch. |

### Tier 4 — Polish and Data Loop (product feels production-grade)

| # | Engine | Status | Purpose |
|---|---|---|---|
| 15 | **TTS / Audio Engine** | ❌ | Convert `text_en` → speech via external provider (Elevenlabs / Azure / Anthropic). Cache audio by content hash. Barge-in, playback rate, queue. |
| 16 | **Assessment Engine** | ⚠️ `/api/mcqset` broken and unowned | Generates MCQs aligned to state, tracks confidence, picks next question adaptively. Board-style vs JEE-style vs conceptual-probe. |
| 17 | **Telemetry / Feedback Engine** | ⚠️ table exists, unwired | Aggregates emoji ratings, time-on-state, drop-offs, re-ask patterns into signals for offline agents. |
| 18 | **Anchor-to-Student Engine** | ❌ | Selects `real_world_anchor.primary/secondary/tertiary` based on student class, region, exam mode, known interests. |
| 19 | **`diagram_tutor` primitives** (part of PCPL) | ❌ | 4 new primitives: `derivation_step`, `annotated_vector`, `mark_badge`, `pyq_card`. Enables Board Phase 2. |

### Tier 5 — Scale (product handles 10k+ students)

| # | Engine | Status | Purpose |
|---|---|---|---|
| 20 | **Regeneration Engine** | ⚠️ data exists in `regeneration_variants`, no runtime | Instantiates Type A (parameter change) or Type B (different physical world) variants from one JSON. |
| 21 | **Progress Engine** | ❌ | Student's concept mastery map. Drives "what to teach next." Built after 1,000 real students. |
| 22 | **i18n Engine** | ❌ | Offline Haiku translation: `text_en` → `text_hi`, `text_ta`, `text_bn`, etc. Cached in `tts_translation_cache`. |
| 23 | **Accessibility Engine** | ❌ | Screen-reader zone order, keyboard navigation, font scaling, color-blind palettes. |
| 24 | **Image Intake Engine** | ❌ | OCR student textbook page → concept_id + notation hints. Flash Vision + canonicalization. |

### Tier 6 — Autoauthoring (content scales without humans)

| # | Engine | Status | Purpose |
|---|---|---|---|
| 25 | **Offline 5-Agent JSON Pipeline** | ❌ | Sonnet drafter + 4 Haiku validators generate new concept JSONs from a topic prompt. Human review gate. Enables Class 13–30 expansion. |

---

## 4. AI Model Strategy

### 4.1 The rule

> **Sonnet is banned from the live serving path.**
> **Haiku is the only runtime AI model.**
> **Sonnet only appears offline, behind human review.**

### 4.2 Why

| Dimension | Haiku | Sonnet |
|---|---|---|
| Cost | ~3× cheaper | expensive at scale |
| Speed | ~1s | ~3–5s |
| Correctness on narrow tasks | excellent | identical |
| Hallucination risk | low (with tight prompts) | higher (opinion-forming) |
| Appropriate for | routing, pattern match, ~30-token improvisation | deep reasoning, autoauthoring, offline analysis |

### 4.3 Model routing table (live serving)

| Component | Model | Call count per interaction |
|---|---|---|
| Unified Router (classify path) | Haiku | 1 (always) |
| EPIC-L delivery | none | 0 |
| EPIC-C scene_composition (inline) | Haiku | 1 |
| LOCAL scene_composition | Haiku | 1 |
| MICRO scene_composition | Haiku | 1 |
| WHAT-IF | none (Physics re-runs) | 0 |
| HOTSPOT explanation | Haiku | 1 |
| Teacher Script personalization | Haiku | 1 per lesson (cached) |
| Anchor-to-Student selection | Haiku | 1 per session (cached) |
| Misconception pattern match | Haiku | 1 on confusion |
| Novel misconception handler | Haiku | 1 fallback only |
| Free-form answer understanding | **Sonnet** | 1 when student types nuanced belief |

**Exception clause:** free-form student answer understanding is the ONE place Sonnet enters the live path, because Haiku cannot reliably extract nuanced beliefs from "I think it's because the block is heavier and so gravity... wait no, maybe friction..." This is rare (<5% of interactions) and unavoidable.

### 4.4 Model routing table (offline)

| Component | Model | Frequency |
|---|---|---|
| 5-agent JSON pipeline drafter | Sonnet | Per new concept (one-time) |
| 5-agent JSON pipeline validators | Haiku | Per new concept |
| Confusion Miner | Sonnet | Nightly |
| Drop-off Detector | Sonnet | Nightly |
| Anchor Tuner | Sonnet | Weekly |
| Trigger-Phrase Harvester | Sonnet | Nightly |
| Script Refiner | Sonnet | A/B per experiment |
| Layout Auditor | Gemini Flash Vision | Per new JSON |

### 4.5 Caching discipline

- Every Haiku output is cached by 5D fingerprint (`concept_id | intent | class | mode | aspect`).
- Every TTS audio is cached by content hash (sentence + language + voice).
- Every translation is cached in `tts_translation_cache`.
- First student pays AI cost; all subsequent students pay $0 for that interaction.
- Total AI spend per student per full Ch.8 lesson: **<$0.02**.

---

## 5. The Six Teaching Paths

Every student message routes into one of six paths. The Unified Router (1 Haiku call) picks the path based on text + context.

### 5.1 EPIC-L — Full Explanation (6 states)

**Trigger:** "explain X" — student doesn't know the concept.
**State count:** 6 (hook → mechanism → formula → depth → edge case → consolidation).
**AI at delivery:** **zero** — pure JSON bypass.
**Cost per first student:** $0.
**Latency:** ~200ms (all cached or static).

### 5.2 EPIC-C — Misconception Correction (4 states)

**Trigger:** student states a specific wrong belief ("N and mg cancel out").
**State count:** 4 (wrong belief visualized → conflict → proof → consolidation).
**Critical rule:** STATE_1 **always** shows the wrong belief — never a neutral baseline. This is the most important EPIC-C rule.
**AI at delivery:** 1 Haiku call (~30 tokens of scene_composition per state, 120 total).
**Cost per first student:** $0.003.

### 5.3 LOCAL — Specific Gap (3 states)

**Trigger:** student knows concept, has one specific gap.
**State count:** 3 (skips the hook — student already knows basics).
**AI at delivery:** 1 Haiku call.
**Cost per first student:** $0.003.

### 5.4 MICRO — One Symbol or Term (2 states)

**Trigger:** "why cos(90°)=0 here?" — one formula term at one moment.
**State count:** 2.
**Duration:** ~45 seconds total.
**Cost per first student:** $0.002.

### 5.5 WHAT-IF — Student Values (0 new states)

**Trigger:** "what if m=5 and θ=45?"
**AI at delivery:** **zero** — Physics Engine re-runs with student's values, existing JSON re-renders.
**Cost per first student:** $0.

### 5.6 HOTSPOT — Canvas Tap (2 states)

**Trigger:** student taps a specific primitive on the canvas.
**AI at delivery:** 1 Haiku call with the tapped primitive_id + current values.
**State count:** 2.
**Cost per first student:** $0.002.

### 5.7 Which engines serve each path

| Path | Physics | Layout | Script | Choreo | Misconcept | Assess | Interact |
|---|---|---|---|---|---|---|---|
| EPIC-L | ✓ | ✓ | ✓ | ✓ | — | ✓ | ✓ (sliders in STATE_5/6) |
| EPIC-C | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | — |
| LOCAL | ✓ | ✓ | ✓ | ✓ | — | ✓ | — |
| MICRO | ✓ | ✓ | ✓ | — | — | — | — |
| WHAT-IF | ✓ | ✓ | — | — | — | — | ✓ |
| HOTSPOT | ✓ | ✓ | ✓ | — | — | — | ✓ |

---

## 6. Mode System

Three modes at launch, extensible forever: `conceptual` (default), `board` (CBSE / ICSE exam), `competitive` (JEE / NEET).

### 6.1 The principle

Conceptual content is the baseline (authored under top-level JSON fields). `mode_overrides.board` and `mode_overrides.competitive` contain **only the diffs** — nothing is duplicated.

### 6.2 Overridable fields

- `teacher_script.tts_sentences[].text_en` per state
- `epic_l_path.states[SID].advance_mode`
- `panel_b_config` (full object)
- `focal_primitive_id` per state
- `choreography_sequence.phases` per state
- `real_world_anchor.primary/secondary/tertiary`
- `assessment_style` (new field: `conceptual_probe | numerical_substitution | edge_case_trap`)
- `phase_2_content` (board-only or competitive-only — derivation_steps, mark_scheme, pyq_references, shortcuts, edge_cases)

### 6.3 Non-overridable fields (hard guardrails)

- `physics_engine_config` — formulas are ground truth.
- `epic_l_path.states[SID].scene_composition.primitives` — the physical scene stays the same across modes.
- `epic_c_branches` — misconceptions are misconceptions.
- `concept_id`, `concept_name`, `chapter`, `section`, `renderer_pair`.

### 6.4 Resolution

Runtime resolver merges `baseline ⊕ mode_overrides[mode]` at session start. Shallow-merge per field. Engines read the resolved object; they don't know `mode_overrides` exists.

### 6.5 Board Mode specifics

- **Phase 1** (simulation reuse): baseline EPIC-L plays with board-flavored narration and focal shifts. Zero new rendering work.
- **Phase 2** (FBD derivation tutor): uses new PCPL primitives (`derivation_step`, `annotated_vector`, `mark_badge`, `pyq_card`) to render step-by-step blackboard drawing with examiner mark badges.

### 6.6 Competitive Mode specifics

- **Phase 1**: same as board, different narration — emphasizes traps and shortcuts.
- **Phase 2**: adds `shortcuts` and `edge_cases` content instead of derivation_steps.

### 6.7 Future modes (schema ready)

- `foundation` — Class 9/10 pre-board, simpler language.
- `neet` — separates from JEE (bio-physics differs).
- `olympiad` — IPhO deep-dive.
- `teacher_prep` — pedagogical notes for educators.

All added by extending the `mode_overrides` enum — no engine work, no schema migration.

---

## 7. The AI Brain

Ten sophistication levels. L0 is today's pain. L4 is the realistic Year 1 target. L10 is the decade vision.

| Level | What the system does | AI role | Feasibility |
|---|---|---|---|
| L0 | Sonnet writes physics configs + teacher scripts live. Brittle, expensive, occasionally wrong. | Sonnet everywhere | current pain |
| L1 | Haiku routes. EPIC-L is zero-AI. EPIC-C / LOCAL / MICRO use 1 Haiku call. | 1–2 Haiku calls per interaction | 4–6 weeks — the Tier 1–3 target |
| L2 | + Personalized narration: Haiku rewrites `text_en` per student's class and vocabulary. | + 1 Haiku per lesson | quarter 2 |
| L3 | + Adaptive sequencer: confusion mid-lesson triggers dynamic MICRO insertion or EPIC-C jump. | + 1 Haiku on confusion signal | achievable |
| L4 | + Cross-concept reasoning: student asks a question spanning two concepts; AI assembles multi-JSON lesson via `physics_concept_map`. | 1 Haiku + concept graph lookup | Year 1 target |
| L5 | + Generative anchor selection: AI invents a new real-world anchor from student's interests ("cricket ball on wet grass = friction + trajectory"). | 1 Haiku per session | after L4 |
| L6 | + What-if exploration: "what if g halves?" — AI decides which states need re-visualization and injects a what-if state. | 1 Haiku + Physics rerun | after L5 |
| L7 | + Meta-learning: system detects pattern across N interactions ("this student keeps conflating force and acceleration") — triggers a specialized intervention module. | Sonnet offline analytics + Haiku live | after 1k students |
| L8 | + Socratic free-form dialogue: student asks anything, AI navigates concept graph, pulls JSONs, assembles custom lesson. | Sonnet orchestration over Haiku serving | expensive, risky |
| L9 | + Offline autoauthoring: Sonnet writes new JSONs for new concepts; humans review. | Sonnet offline, human gate | after Tier 1–4 engines |
| L10 | + Self-improving JSONs: telemetry shows STATE_3 confuses 40% of students; AI proposes rewrite; human approves; winner promoted via A/B. | Sonnet offline, telemetry-driven | after 10k students |

---

## 8. Offline Self-Improvement Loop

### 8.1 The philosophy

> **Engines learn nothing. JSONs learn everything. Humans approve everything. Students never see a bad update.**

### 8.2 The six offline agents

| Agent | Cadence | Input | Output |
|---|---|---|---|
| **Confusion Miner** | Nightly | Novel misconception logs | Proposed new `epic_c_branches` entries |
| **Drop-off Detector** | Nightly | Session traces, emoji ratings | Proposed state splits or bridge annotations |
| **Anchor Tuner** | Weekly | Downstream MCQ accuracy per anchor | Reorder `real_world_anchor` preference by segment |
| **Trigger-Phrase Harvester** | Nightly | Student messages that missed epic_c branches | Additions to `trigger_phrases[]` |
| **Script Refiner** | Per A/B experiment | A/B test winner signals | Winning `text_en` phrasing per segment |
| **Layout Auditor** | Per new JSON | Headless browser screenshots | Overlap/whitespace/focal scores via Gemini Vision |

### 8.3 The data pipeline

```
Live — signals captured:
    simulation_feedback (emoji ratings)
    student_confusion_log (matched + novel misconceptions)
    session_trace (time per state, drop-offs, skips, re-asks)
    mcq_results (accuracy per state, per concept, per mode)

Nightly 03:00 IST — agents run:
    Read signals × concept × mode × segment
    Emit proposals to proposals_queue with evidence snippets and impact estimate

Weekly Monday 09:00 IST — human review (5 min/concept):
    Approve / reject / edit
    Approved diffs → src/data/concepts_staging/{concept_id}.json

Rollout — automatic:
    Staging JSON serves 10% of traffic for 48h
    Live KPIs (confusion rate, completion rate, emoji score) vs control
    Winner promotes to src/data/concepts/; loser rolls back
    Loser contributes to a "lessons learned" log for future agent training
```

### 8.4 Hard guardrails

Agents may NEVER modify:
- `physics_engine_config` (formulas are ground truth).
- Schema shapes — only content inside known fields.
- Engine code (TypeScript source).
- Misconception detection thresholds (tuned by humans only).

If an agent proposal touches any of these, the pipeline rejects and alerts.

### 8.5 Cost model

- 6 agents × ~25 concepts × ~5K Sonnet tokens nightly = **$3/night = ~$90/month** at Ch.8 scale.
- Human review: ~1 hour/week.
- Each 1% confusion-rate reduction at 10k students/month = **~$200 LTV recovered** — payback ≥10×.

### 8.6 Why this is the moat

Per CLAUDE.md: *"The moat is proprietary misconception intelligence data — not the simulation technology."*

- Month 1: JSONs written by humans. Decent.
- Month 3: 1,000 students logged. Patterns clustered. Misconception DB 2× denser.
- Month 6: JSONs teach ~20% better than launch. Misconception DB has 500+ patterns, none public.
- Month 12: Content unreplicable by competitors. They'd need your student data, not your code.

---

## 9. Authoring Contract

### 9.1 What Claude Project (Architect) writes

- One JSON per concept under `src/data/concepts/{concept_id}.json`.
- Fixed schema (see §9.4).
- No code. No pixel math. No engine changes.

### 9.2 What Antigravity (Engineer) builds

- Engines only. TypeScript.
- Schema validators in Zod (`src/schemas/conceptJson.ts`).
- Before/after paste rule: every code change documented.
- Never writes JSON content. Never invents physics.

### 9.3 What the Human Reviewer gates

- Every offline agent proposal (weekly queue).
- Every new concept JSON before it ships.
- Every engine schema change.
- A/B winners before promotion.

### 9.4 The JSON schema shape (canonical)

```
{
  "concept_id": string,
  "concept_name": string,
  "chapter": number,
  "section": string,
  "schema_version": "2.0.0",
  "renderer_pair": { "panel_a": string, "panel_b": string },

  "physics_engine_config": { formulas, variables, constraints },
  "real_world_anchor": { primary, secondary, tertiary },

  "epic_l_path": {
    "state_count": number,
    "states": {
      "STATE_1": {
        "title": string,
        "duration": number,
        "scene_composition": [ {type, ...primitive} ],
        "teacher_script": { "tts_sentences": [ {id, text_en} ] },
        "focal_primitive_id": string,
        "advance_mode": enum,
        "choreography_sequence": { "phases": [...] }
      },
      ...
    }
  },

  "epic_c_branches": [
    {
      "branch_id": string,
      "misconception": string,
      "trigger_phrases": [string],
      "state_sequence": [string],
      "states": { EPIC_C_1, EPIC_C_2, ... }
    }
  ],

  "regeneration_variants": [
    { "variant_id", "type": "A"|"B", "label", "physical_world", "same_physics", "scene_hint" }
  ],

  "panel_b_config": {
    "renderer": "graph_interactive",
    "graph_type", "x_axis", "y_axis", "traces", "live_dot", "annotations"
  },

  "mode_overrides": {
    "board": {
      "assessment_style": string,
      "phase_2_content": { mark_scheme, derivation_steps, pyq_references },
      "epic_l_path": { states: { STATE_N: partial overrides } },
      "panel_b_config": optional full override,
      "real_world_anchor": optional override
    },
    "competitive": { similar shape + shortcuts, edge_cases }
  }
}
```

### 9.5 Migration Protocol — how schema versions evolve without breaking anything

Schema changes are **additive**: new fields are introduced, old fields are deprecated (not deleted) for at least one minor version, and both coexist during the transition window.

**When a schema version increments** (e.g., `2.0.0` → `2.1.0` when Zone Layout Engine ships and JSONs gain `zone:` fields):

1. **Antigravity writes a migration script** at `src/scripts/migrate_schema_v{X}_v{Y}.ts`. The script reads every JSON under `src/data/concepts/`, transforms it from the old schema to the new schema, and writes it back. The script is **idempotent** — running it twice produces the same result.
2. **Old fields are preserved alongside new fields.** When `zone:` is introduced, existing `position: {x, y}` fields stay in the JSON. The Zone Layout Engine prefers `zone:` if present, falls back to `position:` if absent. Authors migrate concepts at their own pace.
3. **Pradeep runs the script once before deployment** — usually in a dedicated PR that touches only JSONs, so the diff is reviewable.
4. **Zod validator is updated in the same PR** as the migration — both old and new shapes accepted during the transition window.
5. **Deprecation window is ≥1 minor version.** After the next minor version (e.g., `2.2.0`), a cleanup PR removes the deprecated fields and the validator starts rejecting them.
6. **Major version bumps** (`2.x.x` → `3.0.0`) are rare and require the same migration protocol but with a formal RFC beforehand. Target: zero major bumps in the first 12 months.

**Example timeline — Zone Layout rollout:**

```
v2.0.0   Today. Absolute `position: {x, y}` is canonical.
v2.1.0   Zone Layout Engine ships. Migration script adds `zone:` + keeps `position:`.
         Engine prefers zone, falls back to position. Both schemas valid.
v2.2.0   Deprecation window. New concepts authored with zone: only.
v2.3.0   Cleanup. Migration script removes legacy `position:` fields.
         Validator rejects `position:` going forward.
```

**What this means in practice:** no concept JSON ever breaks. A Ch.8 JSON authored in week 2 works identically after the Zone Layout Engine ships — the fallback path handles it. When Pradeep has time, a one-line `npm run migrate:schema` modernizes all 23 JSONs at once. Engineers never need to coordinate a "flag day."

---

## 10. Current State — April 2026

### 10.1 What works today

- Ch.8.1 `normal_reaction` parametric renderer fully functional end-to-end.
- PCPL primitives live: `body`, `surface`, `force_arrow`, `label`, `annotation`.
- `body.rotation_deg` support (for ladder lean).
- `attach_to_surface` semantic anchor (bodies snap to surfaces).
- Per-state physics recompute on `SET_STATE` (theta derives from active surface orientation).
- Unified text interpolation — `{theta}` tokens resolve correctly in all text fields.
- N₁ / N₂ split for ladder scenario — independent vertical + horizontal normals.
- `body_bottom / body_top / body_center / body_left / body_right` force-arrow anchors with rotation-aware transforms.
- Teacher script extraction works across both string-array and object-array tts_sentences shapes.
- Concept-id validity guard — Input Understanding + Vision + Intent Resolver all routed through canonical VALID_CONCEPT_IDS set.
- Input Understanding prompt constrained to valid IDs.
- Supabase caches cleared on demand via MCP.

### 10.2 Known open items

- Physics Engine still inline JS in renderer template (should be extracted to TypeScript).
- Zone Layout Engine not yet implemented (positions still authored as absolute pixels).
- Scale Engine not yet implemented (arrows use fixed `scale_pixels_per_unit: 5`).
- Collision Detection not implemented (labels can overlap).
- Choreography / Transition / Focal engines not built — states switch instantly.
- Sliders + formula_box primitives silently skipped in renderer.
- Panel B Equation Engine not implemented (right panel is axis-only empty graph).
- TTS Audio Engine not built (no narration plays).
- `mode_overrides` schema not yet in any JSON or validator.

---

## 11. 3-Month Roadmap — April to June 2026

Goal: **Tier 1–3 engines live + Ch.8 complete in conceptual mode + Board Phase 1 activated + mode_overrides schema landed**.

### Month 1 — April 2026: Tier 1 + Tier 2 Foundation

**Weeks 1–2:** Zone Layout Engine (L1–L4 from Zone Layout design doc)
- Zone taxonomy (6 zones)
- Semantic anchors + offsets
- UNIT_TO_PX scaling
- Collision detection

**Week 3:** Physics Engine extraction
- Move `computePhysics_*` functions from renderer template into `src/lib/engines/physics/`
- Pure TypeScript, no DOM dependencies
- Unit-testable

**Week 4:** Teacher Script Engine + State Machine Engine
- Formal state graph with `advance_mode` honored
- Narration sync with state transitions
- `text_en` resolution (ready for Board/Competitive variants)

### Month 2 — May 2026: Tier 2 + Tier 3 Motion

**Week 5:** Interaction Engine + Panel B Equation Engine
- Slider primitive finally renders
- Bilateral sync Panel A ↔ Panel B via postMessage
- Live dot on graph tracks slider values

**Weeks 6–7:** Choreography Engine + Transition Engine
- `animation_sequence.phases` rendered with ease-in-out
- State-to-state transitions interpolated over 800ms
- Physics Engine recomputes intermediate frames

**Week 8:** Focal Attention Engine + Misconception Detection Engine
- `focal_primitive_id` triggers pulse + dim_others
- EPIC-C branches route correctly from live student input
- Novel misconception handler fallback wired

### Month 3 — June 2026: Ch.8 completion + Board Phase 1 + Schema lock

**Weeks 9–10:** Ch.8 concept authoring (Architect + Antigravity collaboration)
- All 6 Ch.8.1 concepts (field_forces, contact_forces, normal_reaction, tension_in_string, hinge_force, free_body_diagram) in full v2 schema
- Retrofit earlier concepts to use Zone Layout + semantic anchors
- Lock `mode_overrides` schema; add minimal `board` stub to every concept

**Week 11:** Board Phase 1 UI toggle
- Student clicks "Board Mode" → same simulation replays with board-flavored `text_en` + focal shifts
- Zero new rendering work — all engine-free reuse

**Week 12:** Soft launch
- Closed beta: 20 students across Class 11 + 12
- Signals flowing into `session_trace` + `simulation_feedback`
- First week of telemetry = baseline for self-improvement agents

### Month 3 end-state

- ✓ 6 Ch.8.1 concepts fully interactive with animation
- ✓ Board Phase 1 live
- ✓ Conceptual mode production-quality
- ✓ mode_overrides schema authoritative
- ✓ First 20 students producing signals

---

## 12. 6-Month Roadmap — July to October 2026

Goal: **Board Phase 2 + Tier 4 engines + first offline agents + Competitive Mode + Ch.8 full coverage**.

### Month 4 — July 2026: Board Phase 2 + TTS + Assessment

**Weeks 13–14:** `diagram_tutor` PCPL primitives
- `derivation_step`, `annotated_vector`, `mark_badge`, `pyq_card` primitives
- "Blackboard writing" animate_in kind in Choreography Engine
- Board Phase 2 activates with full mark-scheme rendering

**Week 15:** TTS / Audio Engine
- External provider integration (Anthropic TTS or Azure)
- Audio cached by content hash in `tts_audio_cache`
- Barge-in + playback rate controls

**Week 16:** Assessment Engine rewrite
- `/api/mcqset` fixed and hardened
- Mode-aware MCQ style (conceptual vs numerical vs edge-case)
- Confidence tracking per state, per concept

### Month 5 — August 2026: Telemetry, Anchor-to-Student, Regeneration

**Week 17:** Telemetry Engine
- Drop-off detection, time-on-state, re-ask clustering
- Signals aggregated into daily rollups
- Dashboard for Pradeep: confusion heatmap per concept

**Week 18:** Anchor-to-Student Engine
- Picks `real_world_anchor` per student class + region + exam
- Ranking updates nightly from MCQ-accuracy signal

**Week 19:** Regeneration Engine
- Type A (parameter change) and Type B (different physical world) variants instantiated at runtime
- First variant renderings live for top 5 concepts

**Week 20:** i18n Engine seed
- Offline Haiku translates `text_en` → `text_hi` for all Ch.8 concepts
- Cache warmed before student exposure
- UI toggle for language

### Month 6 — September/October 2026: Self-improvement + Competitive Mode

**Week 21:** Confusion Miner + Drop-off Detector go live
- Proposals appear in weekly human-review queue
- First winning JSON diffs promoted via A/B

**Week 22:** Competitive Mode activation
- Schema already in place (mode_overrides from Month 3)
- Author JEE overrides for top 10 concepts
- Launch to beta JEE cohort

**Week 23:** Trigger-Phrase Harvester + Script Refiner online
- Misconception DB growth measurable
- A/B framework proven

**Week 24:** Image Intake Engine alpha
- Student uploads Allen or HC Verma page
- Flash Vision extracts concept_id + notation
- Routes to appropriate JSON

### Month 6 end-state

- ✓ Full Tier 1–4 engines + initial Tier 5 (Regeneration + i18n)
- ✓ All three modes live (conceptual + board + competitive)
- ✓ ~1,000 students, ~50k interactions logged
- ✓ First self-improvement cycles producing measurable JSON improvements
- ✓ Ch.8 complete across all modes; Ch.5–7 started

---

## 13. Key Principles — Never Violate

Copied and expanded from arch doc §17:

1. **Physics Engine owns ALL math. PCPL Renderer owns ALL drawing. They never cross.**
2. **Formula appears AFTER visual understanding. Never before. Never in STATE_1.** (Board mode is the sole exception — mark scheme demands it.)
3. **Force arrows scale proportionally to actual magnitude — never hardcoded pixel sizes.**
4. **Atomic concept = one student question = one JSON.**
5. **DC Pandey = syllabus reference only.** Not teaching sequence. Not state content.
6. **State count is determined by concept complexity.** Not a fixed template. Not "always 6."
7. **EPIC-C STATE_1 always shows student's wrong belief — never a neutral baseline.**
8. **Type B variants show completely different physical worlds, same physics.**
9. **Pill labels name the physical world — not abstract descriptions like "Explanation 2".**
10. **Haiku is used in the Unified Router for all paths. EPIC-L delivery is zero AI.**
11. **One JSON per concept serves ALL paths — never separate JSONs per path.**
12. **Every new concept: JSON file + SQL INSERT + CONCEPT_RENDERER_MAP + CONCEPT_PANEL_MAP. All four.**
13. **Antigravity implementation summaries are frequently wrong. Always request raw file content.**
14. **Clear all four caches before every test. Stale cache silently masks whether fixes worked.**
15. **Prompt patching is the wrong tool for deterministic requirements. Own it in TypeScript.**
16. **Concept graph table: build after 50 real students. Not before.**
17. **The moat is proprietary misconception intelligence data — not the simulation technology.**
18. **Sonnet is banned from live serving paths. Haiku only at runtime.**
19. **Every AI call has a deterministic fallback.**
20. **Every JSON carries `schema_version`. Migrations are additive — never breaking.** (See §9.5 Migration Protocol.)
21. **Offline agents propose, humans approve, A/B tests decide.**
22. **`text_en` is the content authoring surface. `text_hi`, `text_ta`, etc. are pipeline output.**

---

## 14. Risk Register

| Risk | Impact | Mitigation |
|---|---|---|
| Engine scope creep — Tier 1–3 slips past Month 3 | Ch.8 launch delayed | Strict tier discipline. If an engine grows, split it. |
| Sonnet creeps back into live path | Cost spike + latency | Lint rule: `@ai-sdk/anthropic` imports banned in `src/lib/engines/` and `src/app/api/generate-*`. |
| JSON schema drift — new field added without validator update | Pipeline breaks silently | Every schema change = Zod update in same PR. CI fails without validator. |
| Offline agents propose bad diffs early | Content regression | Hard guardrails + 10% A/B sampling + auto-rollback on KPI drop. |
| Student data privacy | Legal / trust damage | Session IDs are random UUIDs. No PII in `student_confusion_log`. |
| Cache stampede — 10k students hit a fresh concept at once | Cost spike | Lock-based cache population; second requester waits. |
| Gemini rate limits during peak | Lessons fail | Graceful fallback: serve pre-authored EPIC-L bypass; degrade gracefully. |
| Hindi/vernacular quality | Engagement drop | i18n Engine uses offline Haiku; every translation human-reviewed for top 20 concepts before live exposure. |
| Board exam pattern changes (NCERT syllabus updates) | Content staleness | `exam_pattern` enum versioned; pattern change = JSON migration tool. |

---

## 15. Success Metrics

### 15.1 Engine quality (Month 3 target)

- Render latency: <150ms per state transition.
- Physics correctness: 100% of Ch.8 assertions pass.
- Cache hit rate: >80% after first cohort.
- Zero Sonnet calls in live path (instrumented + alerted).

### 15.2 Learning effectiveness (Month 6 target)

- Concept completion rate: >70% (students reach STATE_6 / final state).
- Post-lesson MCQ accuracy: >65% on adaptive assessment.
- Emoji 👍 / 💪 rate: >60% per state.
- Re-ask rate: <25% (proxy for confusion).

### 15.3 Self-improvement (Month 6 target)

- ≥50 misconception branches auto-discovered and approved.
- ≥20 JSON diffs promoted via A/B tests.
- Month-over-month completion rate growth: >2%.

### 15.4 Business (Month 6 target)

- 10,000 monthly active students.
- <$0.02 AI spend per student per full lesson.
- Moat size: 500+ proprietary misconception patterns; 200+ region-tagged anchors.

---

## 16. SimSession Orchestrator

### 16.1 Purpose

Twenty-five engines is twenty-five moving parts. Without a single owner, each engine is a floating function — no defined boot order, no event bus, no failure handling, no lifecycle. The **SimSession Orchestrator** is that owner.

One instance of `SimSession` per student session. It boots engines in dependency order, holds the central event bus, routes student input + state changes, and gracefully handles engine failures without crashing the sim.

### 16.2 Boot order

Dependency-strict. Each tier depends only on tiers above it:

```
Tier A — Pure computation (no DOM, no network):
  1. Physics Engine

Tier B — Layout computation (needs canvas dimensions, no DOM):
  2. Zone Layout Engine
  3. Scale Engine
  4. Anchor Resolver

Tier C — Rendering (DOM + canvas writes):
  5. PCPL Renderer
  6. Choreography Engine
  7. Transition Engine
  8. Focal Attention Engine

Tier D — Narration and interaction (audio + events):
  9. Teacher Script Engine
  10. TTS / Audio Engine
  11. Interaction Engine
  12. Panel B Equation Engine

Tier E — Meta (reads signals, routes):
  13. State Machine Engine
  14. Misconception Detection Engine
  15. Assessment Engine

Tier F — Observers (read-only, side channels):
  16. Telemetry / Feedback Engine
  17. Progress Engine
```

SimSession calls `init()` on each engine in this order. If an init fails, SimSession aborts the session and surfaces a user-friendly error — never silently continues with a half-booted sim.

### 16.3 Engine contract

Every engine exposes a uniform interface:

```typescript
interface Engine<Config, State> {
  readonly id: string;                              // unique engine ID for logging
  readonly dependencies: string[];                  // other engine IDs required

  init(config: Config, session: SimSession): Promise<State>;
  reset(): Promise<void>;                           // clear internal state on state change
  destroy(): Promise<void>;                         // teardown on session end

  // Optional event subscriptions
  onEvent?(event: SimEvent): void;
}
```

- `init()` — receives its slice of the resolved JSON config plus a reference to the session. Returns the engine's initial state.
- `reset()` — called when the student jumps to a different state or restarts. Must clear internal state without tearing down the engine itself.
- `destroy()` — called on session end. Clean up timers, subscriptions, audio buffers.
- `onEvent()` — optional subscriber on the session event bus.

### 16.4 Event bus

SimSession owns a single typed event bus. All cross-engine communication flows through it — engines never call each other directly. Typed events include:

```typescript
type SimEvent =
  | { type: 'STATE_ENTER'; state: string }
  | { type: 'STATE_EXIT'; state: string }
  | { type: 'SLIDER_CHANGE'; variable: string; value: number }
  | { type: 'HOTSPOT_TAP'; primitive_id: string }
  | { type: 'TTS_SENTENCE_END'; sentence_id: string }
  | { type: 'ANIMATION_COMPLETE'; primitive_id: string }
  | { type: 'CONFUSION_SIGNAL'; source: 'emoji' | 'reask' | 'dropoff' }
  | { type: 'MODE_CHANGE'; mode: 'conceptual' | 'board' | 'competitive' }
  | { type: 'ENGINE_FAILURE'; engine_id: string; error: Error };
```

Engines subscribe in `init()`. SimSession guarantees event delivery order within a single tick (synchronous within a frame, async between frames).

### 16.5 Failure handling

One engine's failure never takes down the session. SimSession's rules:

- **Tier A + B failure** (Physics, Layout, Scale, Anchor) → **fatal**. Abort session, show user-friendly message ("We couldn't load this concept. Try refreshing.").
- **Tier C failure** (rendering engines) → **degraded mode**. Render static fallback scene; log to Telemetry; session continues.
- **Tier D failure** (narration, audio, interaction) → **silent fallback**. TTS fails → show captions only. Interaction fails → disable sliders but keep replay. Session continues.
- **Tier E failure** (State Machine, Misconception, Assessment) → **skip feature**. No adaptive sequencing this session; serve baseline EPIC-L.
- **Tier F failure** (Telemetry, Progress) → **silent log**. Never visible to student.

Every failure emits `ENGINE_FAILURE` on the bus. Telemetry engine captures, deduplicates, and ships to error tracking nightly.

### 16.6 Lifecycle example — EPIC-L session

```
1. Student lands on concept page, types "explain normal reaction"
2. SimSession.create({ concept_id, student_context, mode }) instantiated
3. Unified Router (Haiku) classifies → path: epic_l
4. SimSession.bootEngines() in Tier A → F order
   - Physics Engine.init(physics_engine_config, vars = resolveStateVars('STATE_1'))
   - Zone Layout.init(zone_config)
   - Scale Engine.init({ maxMagnitude, zone: MAIN_ZONE.height })
   - … through Tier F
5. SimSession.enterState('STATE_1')
   - Emits STATE_ENTER → subscribers react (PCPL draws, Choreography animates, Teacher Script queues TTS)
6. Student drags slider
   - Interaction Engine emits SLIDER_CHANGE
   - Physics Engine recomputes (subscribes to SLIDER_CHANGE)
   - Transition Engine interpolates scene over 800ms
   - Panel B updates live dot
7. Student clicks NEXT → SimSession.enterState('STATE_2')
   - Emits STATE_EXIT first (Teacher Script stops current sentence, Choreography fades out)
   - All engines reset()
   - Emits STATE_ENTER for STATE_2
8. Session ends → SimSession.destroy()
   - Each engine.destroy() called in reverse boot order
```

### 16.7 SimSession location in the codebase

```
src/lib/engines/sim-session/
├── index.ts                      ← export { SimSession, type SimEvent }
├── event-bus.ts                  ← typed event dispatcher
├── lifecycle.ts                  ← boot / reset / destroy choreography
├── failure-policy.ts             ← Tier-based failure classification
├── engine-registry.ts            ← register/lookup engines by id
└── __tests__/sim-session.test.ts
```

SimSession is **Tier 1 foundational infrastructure** — built in Week 1–2 alongside the Physics Engine extraction, because every subsequent engine must plug into it from day one.

### 16.8 Why this is non-negotiable

Without SimSession:
- Engines call each other directly → tight coupling, impossible to unit-test.
- Boot order drift → race conditions where the Renderer draws before Physics computes.
- No single place to catch engine failures → one crash takes down the sim.
- No event audit trail → debugging "why did the sim freeze?" becomes guesswork.
- Adding engine #26 requires touching engines #1–25 → linear cost scaling.

With SimSession: new engines register themselves, boot order is declarative, failures are classified, debugging is traceable, and the 25-engine system behaves as one coherent product.

---

## 17. Glossary

| Term | Meaning |
|---|---|
| **EPIC-L** | Six-state full explanation path (hook → mechanism → formula → depth → edge case → consolidation) |
| **EPIC-C** | Four-state misconception correction path. STATE_1 ALWAYS shows the student's wrong belief. |
| **LOCAL** | Three-state path for students who know the concept but have a specific gap |
| **MICRO** | Two-state path for one symbol or formula term |
| **WHAT-IF** | Zero-new-state path for student-provided values; Physics Engine re-runs |
| **HOTSPOT** | Two-state path triggered by tapping a primitive on the canvas |
| **PCPL** | Physics-Constrained Parametric Composition Layer — universal renderer, 12 primitives |
| **Atomic concept** | One teachable physics idea = one student question = one JSON |
| **Zone** | Named region of canvas with fixed % bounds (MAIN_ZONE, CALLOUT_ZONE_R, etc.) |
| **Anchor** | Semantic position reference (block_bottom_center, ladder.top, surface.floor at 0.4) |
| **UNIT_TO_PX** | Canvas-aware scale factor: MAIN_ZONE.height × 0.70 / maxMagnitude |
| **Scene_composition** | Array of PCPL primitives that define what appears in a state |
| **Focal primitive** | The single primitive the Focal Attention Engine highlights in a state |
| **Choreography phases** | Array of `{t_start, t_end, action}` entries driving animation |
| **Transition** | 800ms interpolation between two scene_compositions |
| **mode_overrides** | Per-mode diff object inside a JSON; merged over baseline at resolve time |
| **Type A variant** | Same physical world, different parameter values |
| **Type B variant** | Different physical world, same physics |
| **Unified Router** | Single Haiku call that classifies every student message into a path |
| **advance_mode** | State transition trigger: `auto_after_tts | manual_click | wait_for_answer | interaction_complete` |
| **5D fingerprint** | Cache key: `concept_id | intent | class_level | mode | aspect` |
| **Architect** | Claude Project — designs, decides, authors all JSON content |
| **Engineer** | Antigravity — implements engines, never writes content |
| **Reviewer** | Human (Pradeep) who gates every JSON change, every agent proposal, every A/B winner |

---

## Document Ownership and Maintenance

- **Authored:** April 2026, synthesized from session-long architectural analysis.
- **Owner:** Pradeep (founder).
- **Consumers:** Claude Project (Architect), Antigravity (Engineer), future team members.
- **Update cadence:** Month-end review + delta against actual progress.
- **Version:** 2.0. Next major revision: after Month 6 retrospective.

---

*The engines stay fixed. The JSONs learn every week. The moat compounds every month. That is PhysicsMind.*
