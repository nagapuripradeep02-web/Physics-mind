# CLAUDE_ENGINES.md — PhysicsMind
# Engine architecture, event bus, failure policy, roadmap, principles
# Open when building or debugging engines. Not loaded every session.
#
# ★★ [SUPERSEDED ARCHITECTURE FRAMING, 2026-06-23] The "44-engine OS" below is NOT how the system is
#    described anymore. The LIVE architecture = the Alex authoring cluster (architect → physics-author →
#    json-author → quality-auditor) + the Peter Parker engine cluster (renderer-primitives,
#    runtime-generation) + offline feedback-collector — see CLAUDE.md §1. Engine NUMBERS (E29, E42, Gate N)
#    are still cited by agent specs / the validator, so this file is kept as the cold reference for those —
#    but do not treat the 44-slot inventory as the project's architecture.
#
# ★ CANONICAL COPY (2026-06-11). The former root-vs-physics-mind duplication (consolidated 2026-06-23)
#   is retired to a pointer; its alternate numbering (E34–E37 quartet, E38
#   validator) is RETIRED. Canonical numbering = this file: E38–E41 Tier-8
#   quartet, E42 Physics Validator — the scheme all agent specs cite.
#   "44 engines" = 44-slot inventory (43 specced + 1 reserved).
#
# ⚠ Deep-dive/drill-down passages below predate two 2026-06 directives:
#   Rule 18 (deep-dive is NOT runtime-generated — see E29 banner) and
#   EPIC-L-first (EPIC-C branches deferred until real students exist).
#
# Revision: 2026-06-11 — canonical-copy declaration, Rule 17/18 alignment,
#   canvas 500 fix, registration sites 4 → 8.
# Revision: 2026-04-22 — engine count expanded from 34 → 44.
#   Added Tier 8 (Engines 38–41): Self-Improvement — PYQ Ingester, Feedback
#     Collector+Clusterer, Change Proposer, Auto-Promoter. Four nightly offline
#     agents turn raw feedback into JSON/prompt/engine improvements.
#   Added Tier 9 (Engines 42–44): Quality — Physics Validator (hard gate into
#     E25/E29/E30), Visual Probe (CLAUDE_TEST.md automation), Regression Suite.
#   Previous 2026-04-19 revision: Tier 7 (Engines 29–34) — Deep-Dive, Drill-Down,
#     Feynman Grader, Assessment Generator, PYQ Ingester, Answer-Sheet PDF.
#     Mode overrides schema extended with canvas_style + derivation_sequence.
#     Rule #18 softened — Sonnet permitted for cached runtime deep-dives with review loop.

---

## THE CORE PRINCIPLE

> **Engines are the operating system. JSONs are the content.**
> Engine change = TypeScript code. Content change = JSON file.
> (Both authored by Claude since the Architect/Antigravity split was
> retired 2026-04-19 — see CLAUDE.md §2.)
> Every request: "Is this an engine change or content change?"

---

## THE 44 ENGINES — STATUS AND BUILD ORDER

(Previously 34 engines; expanded to 44 on 2026-04-22 after session-18 quality
audit surfaced the need for Tier 8 self-improvement agents and Tier 9 quality
engines. See PLAN.md for the consolidated engine inventory.)

### TIER 0 — Orchestration

**Engine 0: SimSession Orchestrator** ❌ NOT BUILT
```
File: src/lib/engines/sim-session/index.ts
Purpose: Boots all engines in dependency order. Owns event bus.
         Handles failures. One instance per student session.

Boot order (dependency-strict):
  Tier A (pure computation):    Physics Engine
  Tier B (layout, no DOM):      Zone Layout, Scale, Anchor Resolver
  Tier C (rendering, DOM):      PCPL Renderer, Choreography, Transition, Focal
  Tier D (audio + events):      Teacher Script, TTS, Interaction, Panel B
  Tier E (meta/routing):        State Machine, Misconception, Assessment
  Tier F (observers, read-only): Telemetry, Progress

Engine contract (every engine implements):
  interface Engine<Config, State> {
    readonly id: string;
    readonly dependencies: string[];
    init(config: Config, session: SimSession): Promise<State>;
    reset(): Promise<void>;
    destroy(): Promise<void>;
    onEvent?(event: SimEvent): void;
  }

File structure:
  src/lib/engines/sim-session/
  ├── index.ts         ← export { SimSession, type SimEvent }
  ├── event-bus.ts     ← typed event dispatcher
  ├── lifecycle.ts     ← boot/reset/destroy
  ├── failure-policy.ts ← tier-based failure classification
  └── engine-registry.ts ← register/lookup engines by id
```

### TIER 1 — Foundation

**Engine 1: Physics Engine** ✅ EXISTS at src/lib/physicsEngine/
```
computePhysics(conceptId, variables) → PhysicsResult
Concepts: contact_forces, field_forces, normal_reaction,
          tension_in_string, hinge_force, free_body_diagram
Week 1 extraction task = ALREADY DONE. Do not rebuild.
Next: write unit tests + parity harness.
```

**Engine 1a: Physics Validation Engine** ❌ NOT BUILT
```
File: src/lib/engines/physics-validation/index.ts
Purpose: After Physics Engine computes → validate outputs are physical.
Checks: N cannot be negative, arrows fit canvas, no absurd values.
Action: clamp to physical limits + log warning (never crash).
```

**Engine 2: Zone Layout Engine** ❌ NOT BUILT — HIGHEST PRIORITY
```
File: src/lib/engines/zone-layout/index.ts
Purpose: Authors write zone: "MAIN_ZONE" — engine resolves to pixels.

Canvas 760×500 pixel zones (fixed forever):
  MAIN_ZONE:      { x:30,  y:80,  w:430, h:380 }  ← all physics drawing
  CALLOUT_ZONE_R: { x:475, y:80,  w:255, h:200 }  ← annotations
  FORMULA_ZONE:   { x:475, y:290, w:255, h:170 }  ← equations
  CONTROL_ZONE:   { x:30,  y:460, w:700, h:40  }  ← sliders
  TITLE_ZONE:     { x:30,  y:10,  w:700, h:60  }  ← state title

Backward compatible: position:{x,y} still works (old format falls back).
New format: zone: + anchor: fields activate Zone Engine.
```

**Engine 3: Anchor Resolver** ⚠️ PARTIALLY EXISTS (body/surface registries)
```
File: src/lib/engines/anchor-resolver/index.ts
Anchors:
  Zone: "MAIN_ZONE.center" → {x:245, y:270}
        "CALLOUT_ZONE_R.slot_1" → first free slot, flow top-to-bottom
  Body: "{body_id}.center/bottom/top/left/right"
  Surface: "{surface_id}.start/end/mid"
         "on_surface:{id} at:{fraction}"
  Offset: offset:{dir:"right", gap:20}
Fallback: unknown anchor → MAIN_ZONE.center + log warning
```

**Engine 4: Scale Engine** ❌ NOT BUILT
```
File: src/lib/engines/scale/index.ts
Formula: UNIT_TO_PX = MAIN_ZONE.height × 0.70 / maxMagnitude
  maxMagnitude = max of all force magnitudes in current state
  Every arrow: pixel_length = force.magnitude × UNIT_TO_PX
  Guard: if maxMagnitude < 0.01 → use 10 (prevent divide-by-zero)
Replaces: hardcoded scale_pixels_per_unit: 5 (WRONG — remove this)
```

**Engine 5: Collision Detection Engine** ❌ NOT BUILT
```
File: src/lib/engines/collision/index.ts
Algorithm: AABB overlap check on every label/annotation
  Overlap ≤ 10% → draw as-is
  Overlap 10-40% → nudge by delta along zone flow axis
  Overlap > 40% → shift to next zone slot
  No slots free → shrink font 2pt; still overflowing → elide "..."
Run as Pass 3.5 (after bodies+arrows, before labels lock)
```

**Engine 6: PCPL Renderer** ✅ EXISTS at src/lib/pcplRenderer/
```
renderSceneComposition() dispatches PrimitiveSpec[]
12 primitives built: body, surface, force_arrow, vector, angle_arc,
label, formula_box, annotation, comparison_panel,
projection_shadow, motion_path, slider

Still needed (build incrementally):
  Sprites: stickman, vehicle_car, vehicle_bus, vehicle_elevator,
           pulley_fixed, pulley_movable, spring_horizontal, spring_vertical
  Fields: field_line_electric, field_line_magnetic, wave_transverse,
          wave_longitudinal, interference_pattern
  Board mode: derivation_step, annotated_vector, mark_badge, pyq_card
  Circuit: resistor, capacitor, battery, switch, wire, ammeter, voltmeter
```

### TIER 2 — Teaching Loop

**Engine 7: Teacher Script Engine** ⚠️ AD-HOC IN TeacherPlayer
```
File: src/lib/engines/teacher-script/index.ts
Reads: resolved tts_sentences[] per state
Respects advance_mode:
  auto_after_tts → advance after last sentence
  manual_click   → wait for student click
  wait_for_answer → wait for text input
  interaction_complete → wait for slider/interaction
```

**Engine 8: State Machine Engine** ⚠️ SCATTERED
```
File: src/lib/engines/state-machine/index.ts
State graph: STATE_1 → STATE_2 → STATE_N (linear for EPIC-L)
Events: NEXT_STATE, PREV_STATE, JUMP_TO_STATE, RESTART
Persists: current state in session_context table
```

**Engine 9: Interaction Engine** ❌ NOT BUILT
```
File: src/lib/engines/interaction/index.ts
Event pipeline (< 50ms total):
  slider_changed → PARAM_UPDATE {key, value}
    → Physics Engine reruns
    → Scale Engine recomputes UNIT_TO_PX
    → PCPL Renderer redraws
    → Transition Engine animates (300ms)
    → Panel B Engine updates
  canvas_tapped → HOTSPOT_ACTIVATED {primitive_id, physics}
```

**Engine 10: Panel B Equation Engine** ❌ NOT BUILT
```
File: src/lib/engines/panel-b/index.ts
Reads: panel_b_config from resolved JSON
Parses: equation_expr safely (use mathjs, not eval)
Live dot: moves to (x_variable, y_expr_result) on PARAM_UPDATE
Bilateral sync: Panel A slider → Panel B dot moves instantly
```

**Engine 10a: Cache Manager** ❌ NOT BUILT
```
File: src/lib/engines/cache-manager/index.ts
Cache key (5D): concept_id|intent|class_level|mode|aspect
Lock-based: second requester waits — never re-generates
Cache warming: pre-generate top 20 concepts before launch
Invalidation: JSON update → clear that concept's cache entries
```

### TIER 3 — Motion and Misconception

**Engine 11: Physics-Driven Choreography Engine** ❌ NOT BUILT
```
File: src/lib/engines/choreography/index.ts
CRITICAL: Objects move from PHYSICS EQUATIONS, not constant speed.

Physics-driven animation types:
  "projectile":
    x(t) = v₀·cosθ · t
    y(t) = v₀·sinθ · t - ½·g·t²
    Ball visibly slows going up, stops at peak, speeds up coming down

  "free_fall":
    y(t) = ½·g·t²
    Object accelerates — gap between positions INCREASES each frame

  "simple_harmonic":
    x(t) = A·cos(ω·t + φ)
    Mass on spring: fast at center, STOPS at extremes

  "circular":
    x(t) = r·cos(ω·t), y(t) = r·sin(ω·t)

  "atwood":
    a = (m₁-m₂)·g / (m₁+m₂)
    Both masses accelerate from rest

  "slide_incline":
    a = g·(sinθ - μ·cosθ)

Each p5.js draw() (60fps): t = (millis() - start_time) / 1000
Compute position from equation. Move sprite to computed position.
Update velocity arrow to v(t).

Timing-based (non-physics movements):
  { at_t: 0.0, show: "floor", enter: "instant" }
  { at_t: 1.5, show: "N_arrow", enter: "draw_from_tail", duration: 0.8 }
```

**Engine 12: Transition Engine** ❌ NOT BUILT
```
File: src/lib/engines/transition/index.ts
Diff STATE_N vs STATE_N+1 scene_compositions
Interpolate over 800ms ease-in-out
Physics Engine recomputes intermediate values every frame
Easing: t < 0.5 ? 2t² : -1+(4-2t)t
```

**Engine 13: Focal Attention Engine** ❌ NOT BUILT
```
File: src/lib/engines/focal-attention/index.ts
Reads: focal_primitive_id + focal_treatment per state
Treatments:
  "pulse": scales 1.0→1.08→1.0 at 2Hz
  "highlight": 2px bright border
  "dim_others": non-focal at 40% opacity
  "glow": radial gradient glow
related_to_focal: list of IDs that stay at 100% opacity (not dimmed)
```

**Engine 14: Misconception Detection Engine** ⚠️ SCATTERED
```
File: src/lib/engines/misconception-detection/index.ts
1. Exact match against trigger_phrases[] for current concept
2. Fuzzy match (Levenshtein distance < 0.3)
3. No match → 1 Haiku call (novel misconception)
4. Novel → serve EPIC-L, log to student_confusion_log
Output: { matched, branch_id, confidence }
```

### TIER 4 — Polish and Data Loop

**Engine 15: TTS Audio Engine** ❌ NOT BUILT
```
File: src/lib/engines/tts/index.ts
Provider: Elevenlabs (primary) or Azure (fallback)
Cache: SHA256(text_en + voice_id + language) → tts_audio_cache
Barge-in: stop immediately on student click
```

**Engine 16: Assessment Engine** ⚠️ /api/mcqset BROKEN
```
File: src/lib/engines/assessment/index.ts
MCQ styles:
  conceptual_probe: physical intuition questions
  numerical_substitution: calculation questions (board)
  edge_case_trap: boundary/trap questions (JEE)
Adaptive: wrong answer → generate easier follow-up
```

**Engine 17: Telemetry Engine** ⚠️ TABLE EXISTS, UNWIRED
```
Captures: time_on_state, emoji_rating, mcq_accuracy, drop_off_point
Writes to: session_trace, simulation_feedback
Aggregates: daily rollups at 03:00 IST
```

**Engine 18: Anchor-to-Student Engine** ❌ NOT BUILT
Picks best real_world_anchor per student class + region + exam.

**Engine 19: diagram_tutor primitives** ❌ NOT BUILT
Part of PCPL Renderer (not separate engine):
derivation_step, annotated_vector, mark_badge, pyq_card
animate_in: "handwriting" (character by character)

**Engine 20: Regeneration Engine** ⚠️ DATA EXISTS, NO RUNTIME
Type A: same world, different parameters.
Type B: different world, same physics.

### TIER 5 — Scale

**Engine 21: Progress Engine** ❌ Build after 50 real students.
**Engine 22: i18n Engine** ❌ Offline Haiku: text_en → text_hi, text_ta.
**Engine 23: Accessibility Engine** ❌ WCAG, keyboard nav, color-blind.
**Engine 24: Image Intake Engine** ❌ OCR → concept_id via Gemini Flash Vision.

### TIER 6 — Autoauthoring

**Engine 25: Offline 5-Agent JSON Pipeline** ❌ NOT BUILT
```
Agent 1 (Haiku): DC Pandey TOC → atomic concept list
Agent 2 (Sonnet): physics_engine_config for each concept
Agent 3 (Sonnet): full JSON (epic_l_path, epic_c_branches, panel_b,
                  mode_overrides.board with derivation_sequence,
                  mode_overrides.competitive, prerequisites, drill_downs
                  on hard states)
Agent 4 (Haiku ×4): validate physics, schema, no Hinglish, zone anchors
Agent 5 (Gemini Flash Vision): headless render → visual quality score
Cost: ~$0.05/concept. Full chapter: ~$1.25, ~15 minutes.

Modes Engine 25 runs in (flag at invocation):
  --full-concept       : produce a complete atomic JSON from scratch
  --deep-dive          : produce a 4-6 sub-state elaboration of one
                         existing parent state (fills deep_dive_cache)
  --drill-down-batch   : for a list of (concept, state, cluster) tuples,
                         produce MICRO/LOCAL sub-sims (fills drill_down_cache)
  --board-retrofit     : add mode_overrides.board + derivation_sequence
                         to an existing conceptual-only JSON
```

### TIER 7 — Feedback & Elaboration (added 2026-04-19)

**Engine 29: Deep-Dive Generator** ❌ NOT BUILT

> **⛔ SUPERSEDED BY RULE 18 (2026-06-10).** The runtime-Sonnet flow below is
> RETIRED design history — deep-dive is NOT runtime-generated. The button now
> routes to a one-sentence feedback form (`feedback_unified`); child states are
> hand-authored at diamond bar only after analytics flag a (concept, state) pair.
> See CLAUDE.md Rule 18 + docs/patterns/magnetism.md §6. Kept for archaeology.

```
Trigger: student clicks "Explain step-by-step" on a state
         tagged allow_deep_dive: true
Cache key: concept_id | state_id | class_level | mode (4D)

Runtime flow:
  1. Lookup deep_dive_cache[key]
  2. HIT (status=verified) → serve in <100ms, $0
  3. HIT (status=pending_review) → serve + "just generated" badge,
                                    record feedback
  4. MISS → Sonnet generates 4-6 sub-states grounded in parent
     state's scene_composition + teacher_script + physics_engine_config
     → cache with status=pending_review
     → queue for Pradeep nightly review
     → serve to student behind spinner (~5s, $0.05)

Cold-start population: Engine 25 in --deep-dive mode generates
  top 3-5 candidate deep-dives per hard state OFFLINE before ship.
  Pradeep reviews batch, approves to status=verified.

Auto-promotion rule: pending_review → verified after
  20 positive feedbacks AND 0 negative feedbacks in 14 days.
Auto-demotion: 3+ negative feedbacks in 7 days → revert to
  pending_review + flag for Pradeep re-review.
```

**Engine 30: Drill-Down Classifier + Cache** ❌ NOT BUILT
```
Trigger: student types into "I'm confused about..." input on a state
Cache key: concept_id | state_id | cluster_id | class_level | mode (5D)

Runtime flow:
  1. Haiku classifier (~$0.001, ~300ms):
     Input:  concept_id, state_id, raw_phrase,
             candidate_clusters[] (from confusion_cluster_registry)
     Output: cluster_id + confidence
  2. If confidence < 0.6 → log to student_confusion_log,
     serve generic "can you be more specific?" prompt
  3. If confidence ≥ 0.6 → lookup drill_down_cache[key]
  4. HIT → serve MICRO/LOCAL sub-sim in <100ms
  5. MISS → Sonnet generates MICRO/LOCAL sub-sim (rare),
            cache pending_review, serve with badge

Fallback: matched cluster but no cached sub-sim → generic
  MICRO template filled with physics_engine_config variables
  (zero Sonnet cost, lower quality).
```

**Engine 31: Feynman Grader** ❌ NOT BUILT
```
Trigger: student clicks "Now you explain it back" after a concept
Input:   concept_id, student_explanation_text (or voice → Gemini STT)
Model:   Sonnet (short context, ~$0.02/call)
Grounding: physics_engine_config + epic_c_branches + teacher_script

Output schema:
  {
    accuracy: 0.0..1.0,
    completeness: 0.0..1.0,
    misconceptions_detected: [branch_id],
    missed_concepts: [string],
    correct_parts: [string],
    targeted_feedback: "You got the direction right but missed
                        that N doesn't include friction. Try again."
  }

Persistence: feynman_attempts table
Feedback loop: repeated misconception detection → Confusion Miner
  proposes new epic_c_branches for next Engine 25 run.
```

**Engine 32: Assessment Generator** ❌ NOT BUILT
```
Trigger: end of EPIC-L path → generate 3 MCQs for the student
Grounded in: physics_engine_config + epic_c_branches + mode
Model: Haiku (deterministic, cheap)

MCQ style per mode:
  conceptual_probe       : physical intuition questions
  numerical_substitution : calculation questions (board)
  edge_case_trap         : boundary/trap questions (competitive)

Adaptive: wrong answer → generate easier follow-up MCQ
          right answer → offer harder variant or move on
```

**Engine 33: PYQ Card Ingester** ❌ NOT BUILT
```
Input: scanned CBSE/ICSE/state-board past-year PDFs
Stage 1: MinerU extracts question + figures + mark scheme
Stage 2: Sonnet maps question → concept_id + state_id relevance
Stage 3: Populates pyq_references[] in the concept's
         mode_overrides.board.phase_2_content.pyq_references

Output: fully populated pyq_references across all board JSONs
        without manual transcription.
```

**Engine 34: Answer-Sheet PDF Generator** ❌ NOT BUILT
```
Trigger: student finishes board-mode EPIC-L path
         clicks "Download my answer sheet"
Input:   atomic JSON's mode_overrides.board.derivation_sequence
         + mark_scheme + student's chosen numerical values

Output: 1-page PDF showing step-by-step answer in handwriting
        style, with mark annotations per CBSE scheme.
        Printable, ready for rote memorization before exam.

Differentiator: no Indian physics app has this today.
  Parents track download count as proof of effective studying.
```

### TIER 8 — Self-Improvement (added 2026-04-22 | Phase I)

Four nightly offline agents. Turn raw feedback into JSON / prompt / engine
improvements. **Notion-style batch pattern** — never real-time fine-tuning.

**Engine 38: PYQ Ingester** ❌ NOT BUILT
```
Offline batch — runs when a new PYQ paper is released or
                missing question-gaps are detected.
Input:   raw PYQ PDFs (JEE Main/Advanced, NEET, CBSE boards)
Output:  populated mode_overrides.board.pyq_references +
         mode_overrides.competitive.pyq_cards across atomic
         JSONs, keyed by concept_id. No manual transcription.
Status:  spec only. Activates in Phase N (year-2).
```

**Engine 39: Feedback Collector + Clusterer** ❌ NOT BUILT (Phase I)
```
Agent 1 — Collector (1 AM nightly, pure SQL+TS)
  Unify chat_feedback + simulation_feedback + variant_feedback
  + student_confusion_log + test_session_log into
  feedback_unified. Tag each row:
     {concept_id, state_id, mode, severity, source, type}.

Agent 2 — Clusterer (2 AM, Haiku)
  Semantic-cluster new confusion phrases; merge into existing
  confusion_cluster_registry or propose a new cluster_id.
  Input:  last 24h of unclassified confusion phrases.
  Output: cluster_id assignments + proposed-new-cluster rows.

Hard rule: no real-time model calls. All work runs between
           1 AM and 5 AM IST. Students hit warm caches.
```

**Engine 40: Change Proposer** ❌ NOT BUILT (Phase I)
```
Agent 3 — Proposer (3 AM, Sonnet 4.6)
  For each cluster with ≥3 hits OR ≥1 CRITICAL bug:
    draft one of:
      - new epic_c_branch          (misconception detected at scale)
      - new drill_down entry       (cluster has ≥10 hits)
      - prompt rule addition       (deep_dive_generator_v2.txt, etc.)
      - renderer ticket            (engine_bug_queue)
      - variant request            (≥20% students asked for alternate)
    Run Physics Validator (E42) on proposed diff.
    Write to proposal_queue with evidence + diff.

Proposals are never auto-applied. Human gate at E41.
```

**Engine 41: Auto-Promoter + Proposal Queue** ❌ NOT BUILT (Phase I)
```
Agent 4 — Auto-Promoter (4 AM, pure TS)
  Safe auto-merge (no human touch needed):
    - Sub-sims with ≥20 positive + 0 negative feedbacks → verified
    - Drill-down clusters with ≥10 hits + E42-green        → live
    - Prompt A/B winners (≥50 generations, ≥95% win rate) → global

  Structural changes (new epic_c_branch, renderer tickets,
  variant requests) queue for Pradeep's 5-min morning review
  at /admin/proposal-queue (NEW route, Phase I).

Feedback updates three artifacts, NOT model weights:
  1. JSONs    → E25 re-runs on affected concepts
  2. Prompts  → versioned, A/B-validated, then global
  3. Engines  → engine_bug_queue ticket → fix-once, regenerate-many
```

---

### TIER 9 — Quality (added 2026-04-22 | Phase H)

**Engine 42: Physics Validator** 🟡 PARTIAL (Phase H)
```
File: src/lib/physicsValidator.ts (×3 existing implementations)
Purpose: hard gate before any Sonnet-generated JSON reaches cache.
         Catches the session-18 bug classes automatically.

Checks:
  - mg_perp direction_deg = N direction_deg ± 180° (force balance)
  - equilibrium states sum to ΣF = 0 within tolerance
  - angle_arc primitive present on any surface with angle ≠ 0
  - flat surfaces reject angle_arc primitive
  - vector primitive uses {from, to} OR {from, magnitude, direction_deg}
    (not mixed)
  - scene_composition.primitives.length ≥ 3 per state
  - epic_c_branches: OPTIONAL (EPIC-L-first directive 2026-06-10 — branches
    deferred until real students exist; Zod relaxed to .optional() 2026-06-11)
  - advance_mode varied (not all auto_after_tts) across EPIC-L

Wired into: E25 (pre-cache), E29 (deep-dive), E30 (drill-down).
            Rejection emits structured error → E40 consumes as bug.
```

**Engine 43: Visual Probe** ❌ NOT BUILT (Phase I companion)
```
File:  src/lib/visualProbe/ (PLANNED)
Purpose: automate CLAUDE_TEST.md §5 observation probe. Writes to
         test_session_log. Feeds Tier 8 feedback loop.

Checks (bbox-based, extended with line-segment distance for diagonals):
  - No primitive at (0, 0) fallback
  - No primitive bbox extends past canvas (760 × 500)
  - No two non-overlapping-allowed primitives overlap
  - formula_box text width < FORMULA_ZONE.width
  - angle_arc vertex within declared surface bounds
  - {value} / {expr} template leaks absent from final rendered text

Trigger: every deep-dive/drill-down cache miss, every E25 regeneration,
         and every CLAUDE_TEST.md session probe.
```

**Engine 44: Regression Suite** ❌ NOT BUILT (Phase K companion)
```
File:  scripts/regression-probe.ts (PLANNED)
Purpose: when renderer / solver / PCPL primitive changes land, re-verify
         ALL cached sub-sims — don't wait for student feedback.

Flow:
  1. Renderer or solver commit → CI trigger
  2. Load last 200 deep-dive + drill-down cache rows
  3. Headless render each via Puppeteer
  4. E43 Visual Probe on every render
  5. Regressions → invalidate cache + engine_bug_queue ticket

Cost: ~$0.50 per full 400-row run (no LLM calls, pure headless).
```

---

### Legacy Self-Improvement Agents (pre-2026-04-22 roadmap)

These were the initial Month-4+ offline agents envisioned before the formal
Tier 8 consolidation. Preserved here for historical context — their
functionality is now owned by E39/E40/E41 or scheduled for E43.

```
Visual Validator   → subsumed by E43 Visual Probe + E44 Regression Suite
Confusion Miner    → subsumed by E39 Clusterer + E40 Proposer
Drop-off Detector  → subsumed by E39 Collector + E40 Proposer
Trigger-Phrase Harvester → subsumed by E39 Clusterer + E40 Proposer
Script Refiner     → subsumed by E40 Proposer (prompt-rule path)
Anchor Tuner       → subsumed by E40 Proposer (variant-request path)
```

---

## EVENT BUS (ALL CROSS-ENGINE COMMUNICATION)

Engines NEVER call each other directly. Only via event bus.

```typescript
type SimEvent =
  | { type: 'STATE_ENTER';        state: string }
  | { type: 'STATE_EXIT';         state: string }
  | { type: 'SLIDER_CHANGE';      variable: string; value: number }
  | { type: 'HOTSPOT_TAP';        primitive_id: string }
  | { type: 'TTS_SENTENCE_END';   sentence_id: string }
  | { type: 'ANIMATION_COMPLETE'; primitive_id: string }
  | { type: 'CONFUSION_SIGNAL';   source: 'emoji' | 'reask' | 'dropoff' }
  | { type: 'MODE_CHANGE';        mode: 'conceptual' | 'board' | 'competitive' }
  | { type: 'ENGINE_FAILURE';     engine_id: string; error: Error };
```

---

## ENGINE FAILURE POLICY

```
Tier A+B failure (Physics, Layout, Scale, Anchor):
  → FATAL. Abort session. Show: "Try refreshing."

Tier C failure (PCPL Renderer, Choreography, Transition, Focal):
  → DEGRADED MODE. Static fallback scene. Log. Continue.

Tier D failure (Teacher Script, TTS, Interaction, Panel B):
  → SILENT FALLBACK.
    TTS fails → captions only.
    Interaction fails → disable sliders, keep replay.

Tier E failure (State Machine, Misconception, Assessment):
  → SKIP FEATURE. Serve baseline EPIC-L. Continue.

Tier F failure (Telemetry, Progress):
  → SILENT LOG. Never visible to student.
```

---

## MODE OVERRIDES SCHEMA

```
Conceptual = baseline (top-level JSON fields).
mode_overrides = diffs only. Nothing duplicated.

Overridable:
  teacher_script.tts_sentences[].text_en (sentence-level merge by ID)
  epic_l_path.states[SID].advance_mode
  panel_b_config (full object)
  focal_primitive_id per state
  choreography_sequence.phases per state
  real_world_anchor
  assessment_style: conceptual_probe | numerical_substitution | edge_case_trap
  phase_2_content (board: mark_scheme, derivation_steps, pyq_references)
                  (competitive: shortcuts, edge_cases, pyq_references)

Board-only overrides (added 2026-04-19):
  canvas_style: "answer_sheet" | "default"
    → when "answer_sheet", canvas renders with white ruled background,
      primitives use handwriting style by default
  derivation_sequence: { [STATE_ID]: { primitives: PrimitiveSpec[] } }
    → board-only primitive layer LAYERED ON TOP OF baseline scene_composition.
      Primitives support animate_in: "handwriting" (character by character)
      and type: "mark_badge" | "derivation_step" | "pyq_card" | "annotated_vector"
    → does NOT replace baseline scene_composition — adds to it.
      Conceptual physics objects (block, incline) render identically in all modes.
  phase_2_content.mark_scheme: [{ state: STATE_ID, step, marks }]
    → 1-to-1 mapping between state progression and CBSE mark allocation.
      Validator enforces: every board state maps to exactly one mark_scheme entry.

Per-state runtime-elaboration fields (added 2026-04-19, NOT overrides):
  allow_deep_dive: boolean
    → live in baseline epic_l_path.states.STATE_N; not mode-specific
    → when true, UI renders "Explain step-by-step" button
  drill_downs: [{ trigger_phrases, cluster_id, sub_concept_id, protocol }]
    → per-state drill-down mapping table for Engine 30
    → cluster_id must exist in confusion_cluster_registry

NON-OVERRIDABLE (validation error if attempted):
  physics_engine_config
  scene_composition.primitives (the actual objects — baseline visuals)
  epic_c_branches
  prerequisites
  concept_id, chapter, section, renderer_pair

Sentence-level merge rule (CRITICAL):
  resolved = baseline_sentences.map(s =>
    override_sentences?.find(o => o.id === s.id) ?? s
  )
  Only overridden IDs replaced. Missing IDs inherit baseline. Order preserved.

Future modes (schema ready, no engine work needed):
  foundation, neet, olympiad, teacher_prep
```

---

## AI MODEL STRATEGY (V2 TARGET)

```
LIVE SERVING — Haiku ONLY (target):
  Unified Router (classify path)
  EPIC-C scene_composition improvisation (~30 tokens per state)
  LOCAL scene_composition
  MICRO scene_composition
  HOTSPOT explanation
  Misconception fuzzy match

EXCEPTION — Sonnet in live path (unavoidable):
  Free-form student answer understanding (<5% of interactions)
  "I think it's because the block is heavier..." — requires reasoning

OFFLINE ONLY — Sonnet:
  5-agent JSON authoring pipeline
  Self-improvement agents nightly

NEVER AI:
  Physics Engine (N=mgcosθ is not an LLM task)
  Zone Layout Engine (geometry is not an LLM task)
  Choreography Engine (ease-in-out is math)
  Collision Detection (AABB is solved 1970s problem)

LINT RULE: @ai-sdk/anthropic imports BANNED in src/lib/engines/
CI must fail if any engine imports AI SDK.

Caching:
  Every Haiku output: 5D fingerprint cache
  Every TTS audio: SHA256(text_en + voice + language)
  First student pays ~$0.02. Every student after pays $0.
```

---

## SCHEMA MIGRATION PROTOCOL

When schema version increments (e.g., 2.0.0 → 2.1.0):

1. Write migration script: src/scripts/migrate_schema_vX_vY.ts
   - Reads all JSONs in src/data/concepts/
   - Transforms old schema → new schema
   - Script must be IDEMPOTENT (run twice = same result)
2. Old fields preserved alongside new (backward compatible)
3. Pradeep runs script once before deployment (dedicated PR)
4. Zod validator updated in SAME PR as migration
5. Deprecation window: ≥1 minor version before cleanup PR

Example — Zone Layout rollout:
  v2.0.0: position:{x,y} canonical
  v2.1.0: zone: added, position: kept as fallback (both valid)
  v2.2.0: new concepts use zone: only
  v2.3.0: cleanup, position: removed from validator

---

## WEEK 1 PLAN (REVISED — Physics Engine already done)

```
Day 1: Scaffold src/lib/engines/ directory
  Create stub subdirectories:
  physics/, zone-layout/, anchor-resolver/, scale/, collision/,
  sim-session/, cache-manager/, physics-validation/,
  teacher-script/, state-machine/, interaction/, panel-b/,
  choreography/, transition/, focal-attention/, misconception-detection/
  Create src/lib/engines/README.md with engine roster + tier discipline
  Run tsc --noEmit → 0 errors
  Create PROGRESS.md at project root

Day 2: Confirm Physics Engine extraction
  src/lib/physicsEngine/ already exists — confirm it matches spec
  Write 12 unit tests: flat surface, inclined, vertical,
  theta=0, theta=90, m=0.5, m=10, edge cases
  Parity harness: same inputs → same outputs TS vs inline JS
  Fix any parity failures before proceeding

Day 3: Zod validator
  Write src/schemas/conceptJson.ts matching Section 7 schema
  Run over all 23 JSONs in src/data/concepts/
  Paste violations list (Architect fixes content; Antigravity fixes schema shape)
  Add CI step: npm run validate:concepts

Day 4: Wire window.PM_PRECOMPUTED_PHYSICS
  In assembleParametricHtml: inject PM_PRECOMPUTED_PHYSICS alongside SIM_CONFIG
  Renderer reads PM_PRECOMPUTED_PHYSICS if present, falls back to inline JS
  Zero visual change — student output identical

Day 5: SimSession Orchestrator skeleton
  Create src/lib/engines/sim-session/ file structure
  Implement typed SimEvent union (see Event Bus section above)
  Implement engine-registry.ts (register/lookup by id)
  Implement event-bus.ts (typed dispatcher)
  No engines wired yet — skeleton only
  tsc → 0 errors
```

---

## 3-MONTH ROADMAP

### Month 1 (April 2026) — Tier 1 + Tier 2 Foundation
Week 1-2: Zone Layout Engine (L1-L4: zones, anchors, UNIT_TO_PX, collision)
Week 3: Physics Engine unit tests + SimSession fully wired
Week 4: Teacher Script Engine + State Machine Engine formal

### Month 2 (May 2026) — Tier 2 + Tier 3 Motion
Week 5: Interaction Engine (sliders work) + Panel B Equation Engine (live graph)
Week 6-7: Physics-Driven Choreography Engine + Transition Engine (800ms lerp)
Week 8: Focal Attention Engine + Misconception Detection Engine formal

### Month 3 (June 2026) — Ch.8 + Board Phase 1 + Schema Lock
Week 9-10: All 6 Ch.8.1 concepts in full v2 schema, retrofit Ch.5-7 to zone-based
Week 11: Board Phase 1 UI toggle (1 day — zero new rendering work)
Week 12: Closed beta — 20 students, signals flowing

---

## RISK REGISTER

```
Sonnet creeps back into live path:
  Mitigation: Lint rule — @ai-sdk/anthropic BANNED in src/lib/engines/

JSON schema drift (field added without validator):
  Mitigation: Every schema change = Zod update in SAME PR

Cache stampede (10k students hit fresh concept at once):
  Mitigation: Lock-based population — second requester waits

Engine scope creep (Tier 1-3 slips past Month 3):
  Mitigation: Strict tier discipline. If engine grows → split it.

Gemini rate limits during peak:
  Mitigation: Graceful fallback → serve EPIC-L bypass
```

---

## SUCCESS METRICS

### Month 3
- Render latency: <150ms per state transition
- Physics correctness: 100% of Ch.8 assertions pass
- Cache hit rate: >80% after first cohort
- Zero Sonnet calls in live path

### Month 6
- Concept completion rate: >70%
- Post-lesson MCQ accuracy: >65%
- Emoji 👍/💪 rate: >60% per state
- 10,000 monthly active students
- <$0.02 AI spend per student per lesson

---

## KEY PRINCIPLES (NEVER VIOLATE)

1. Physics Engine owns ALL math. PCPL Renderer owns ALL drawing. They never cross.
2. Formula appears AFTER visual understanding. Never in STATE_1. (Board: sole exception)
3. Force arrows scale proportionally to magnitude. UNIT_TO_PX formula. Never hardcoded.
4. Atomic concept = one student question = one JSON.
5. DC Pandey = syllabus reference only. Not teaching sequence. Not state content.
6. State count = concept complexity. NEVER fixed. No "always 6".
7. EPIC-C STATE_1 ALWAYS shows student's wrong belief — never neutral baseline.
8. Type B variants = completely different physical world, same physics law.
9. Pill labels name the physical world — never "Explanation 2" or "View 2".
10. EPIC-L delivery = zero AI. JSON bypass only. Haiku for routing only.
11. One JSON per concept serves ALL paths. Never separate JSONs per path.
12. Every new concept: EIGHT registration sites (CLAUDE.md §6) — JSON + SQL INSERT/CONCEPT_PANEL_MAP + CONCEPT_RENDERER_MAP + VALID_CONCEPT_IDS + deep-dive tags + bundle retirement + PCPL_CONCEPTS + CLASSIFIER_PROMPT. All eight; missing any one = silent failure.
13. Implementation summaries are frequently wrong (a lesson from the retired Antigravity era that still applies to subagents). Always verify against raw file content.
14. Clear all four caches before every test. Stale cache masks whether fixes worked.
15. Prompt patching is wrong for deterministic requirements. Own it in TypeScript.
16. Concept graph table: build after 50 real students. Not before.
17. The moat is proprietary misconception intelligence data — not simulation technology.
18. Sonnet is banned from UNCACHED live serving paths for verified content. Haiku is the default runtime model. **Exceptions (revised 2026-06-11 to match CLAUDE.md Rule 18):** (a) ~~Engine 29 runtime deep-dive~~ RETIRED — deep-dive is NOT runtime-generated (the button routes to a feedback form; children are hand-authored post-analytics); (b) Engine 30 rare drill-down cluster miss behind spinner + pending_review badge + founder review within 24h or auto-promote after 20 positive / 0 negative feedbacks; (c) Engine 31 Feynman grading (student explicitly requested, short context, ~$0.02/call).
19. Every AI call has a deterministic fallback.
20. Every JSON carries schema_version. Migrations are additive — never breaking.
21. Offline agents propose. Humans approve. A/B tests decide.
22. text_en is the content authoring surface. text_hi, text_ta are pipeline output.
23. Physics-driven animation only. Objects move from equations, not constant speed.
24. Everything may learn — content, engine capabilities, AND engine defaults — but only through the OFFLINE, human-reviewed gate shipping versioned, reviewable artifacts. Hard floor: no un-reviewed generative process decides physics a student sees at runtime. (Replaces the retired "engines learn nothing" slogan — CLAUDE.md Rule 17 + The Learning Model.) Students never see a bad update.

---

## SELF-IMPROVEMENT PHILOSOPHY

> **Everything may learn — through the offline, reviewed gate (Rule 17).**
> **Humans approve everything (current stage — graduates as Tier-9 gates earn trust).**
> **Students never see a bad update.**

Month 1-2: Build engines. Zero agents active.
Month 4: Activate Confusion Miner + Drop-off Detector only.
Month 6: Activate all 6 agents.
Month 9: Add Cross-concept Bridger.

Do NOT activate agents before 1,000 real student interactions.
Agents on empty data = garbage proposals = wasted Sonnet budget.
