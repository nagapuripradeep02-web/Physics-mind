# PLAN.md — PhysicsMind Master Roadmap
# Consolidated roadmap | v1.0 | 2026-04-22 | **[HISTORICAL — superseded planning context, 2026-06-23]**
# NOT loaded every session. The live plan is CLAUDE.md (§0–§9) + DISCUSSIONS.md. Open this only for the
# feedback-architecture design (now summarized in CLAUDE.md §2) or historical phase context.

> **⚠ STATUS BANNER (added 2026-06-11).** This is the CANONICAL copy (the
> old root-vs-physics-mind split is resolved — consolidated into physics-mind 2026-06-23). It is an April 2026
> consolidation and parts are SUPERSEDED by the June 2026 pivots — read those first:
> - **EPIC-L-first** (2026-06-10): EPIC-C branches / deep-dive / drill-down deferred
>   until real students exist (CLAUDE.md Rules 16a/18, §6).
> - **Conceptual-only** (2026-06-11): board + competitive modes dropped for the
>   current phase (CLAUDE.md Rule 20 suspension).
> - **Authoring loop** = AUTHORING_PIPELINE.md professor-gate loop (magnetism
>   diamonds), NOT this file's Phase-E retrofit queue (abandoned after session 37
>   scope-cut → session 55/60 pivots).
> - **GTM** = TEACHER-FACING V1 — teachers are the paying customers; student tutor = vision/V2
>   (DISCUSSIONS.md Sessions 61–65 + 73 + 77; CLAUDE.md §0).
> - Stale-blocker note: engine_bug_queue + proposal_queue tables EXIST (migrations
>   2026-04-25 / 2026-06-10).
> A full re-consolidation of this roadmap is pending; until then treat phase
> tables below as historical planning context, not the active queue.

PhysicsMind has ~60% of its infrastructure shipped (renderers, constraint solver,
deep-dive/drill-down scaffolding, admin review routes, physics validator, mode tabs)
but lacks the connective tissue needed to be self-improving and production-ready at
150-concept scale.

This plan consolidates four strategic threads into one executable roadmap:

1. **Feedback → learning loop** — four nightly offline agents turn raw feedback
   into prompt/JSON/engine improvements (Notion-style batch pattern, not real-time
   fine-tuning).
2. **Variant strategy** — ship one canonical variant per concept now; architect
   the slot for 3 variants in Year 2.
3. **Test-repair procedure** — formalize the iterative cycle: Sonnet generates
   JSON → validator gates → probe surfaces bugs → fix once, regenerate many.
4. **Engine expansion** — grow from 34 engines to 44 by adding feedback,
   variant, and board-specific engines surfaced during session-18's quality audit.

---

## CURRENT STATE SNAPSHOT (2026-04-22 audit)

| Layer | Status | Evidence |
|---|---|---|
| Parametric renderer + 14 PCPL primitives | ✅ BUILT | `src/lib/renderers/parametric_renderer.ts` (2383L), `src/lib/pcplRenderer/primitives/` |
| Mechanics 2D fallback renderer | ✅ BUILT | `src/lib/renderers/mechanics_2d_renderer.ts` (5752L, 10+ scenarios) |
| Constraint solver (Kiwi) | ✅ BUILT | `src/lib/subSimSolverHost.ts` (546L, session-18 hardening) |
| Physics validator | ✅ BUILT | `src/lib/physicsValidator.ts` ×3 — not yet wired to E25/E29/E30 as hard gate |
| Deep-dive generator + cache | 🟡 PARTIAL | `src/lib/deepDiveGenerator.ts`, `deep_dive_cache` table, `/admin/deep-dive-review` |
| Drill-down classifier + cache | 🟡 PARTIAL | `src/lib/drillDownGenerator.ts`, `drill_down_cache` table, `/admin/drill-down-review` |
| Schema validator (`npm run validate:concepts`) | ✅ BUILT | `src/scripts/validate-concepts.ts` — Zod only, no physics check |
| Mode tabs (Conceptual/Board/Competitive) | 🟡 PARTIAL | `src/app/ProgressTrackerClient.tsx` — UI wired, runtime routing missing |
| Variant picker | 🟡 PARTIAL | `src/lib/variantPicker.ts` — reads pre-authored; no Type-B generator |
| Feedback tables (chat / sim / variant / confusion) | 🟡 INSERT-ONLY | Tables exist; no clustering/aggregation layer |
| Admin routes (costs, deep-dive review, drill-down review) | ✅ BUILT | `src/app/admin/*/page.tsx` |
| Engine 25 (5-agent JSON pipeline) | ❌ NOT BUILT | Zero scaffolding |
| Nightly feedback agents | ❌ NOT BUILT | Zero scaffolding |
| Board answer-sheet PDF + mark accumulator | ❌ NOT BUILT | Spec only |
| Feynman grader | ❌ NOT BUILT | Spec only |
| `normal_reaction.json` gold-standard | ✅ BUILT | Phase B complete (sessions 3–5) |

---

## ENGINE INVENTORY — 44 ENGINES

**Tier 1 — Rendering core** (7)
Physics · PCPL Renderer · Anchor Resolver · Zone Layout · Collision/Scale · Constraint Solver · Choreography.

**Tier 2 — Teaching** (5)
Teacher Script · State Machine · Interaction · Panel B Equation · Cache Manager.

**Tier 3 — Attention & misconception** (4)
Transition · Focal Attention · Misconception Detection · Confidence Meter.

**Tier 4 — Auxiliary** (7)
TTS · STT (year-2) · Assessment runtime · Telemetry · Progress/Mastery · NCERT Retrieval · Prerequisite Graph.

**Tier 5 — Autoauthoring** (3)
**E25** 5-Agent JSON Pipeline · **E26** Chapter Templates · **E27** Regeneration Orchestrator.

**Tier 6 — Runtime feedback paths** (5)
**E28** Cache-Manager-v2 · **E29** Deep-Dive Generator · **E30** Drill-Down Classifier · **E31** Feynman Grader · **E32** Variant Engine (Type-A now, Type-B year-2).

**Tier 7 — Board mode** (5)
**E33** Assessment Generator · **E34** Answer-Sheet PDF · **E35** Mark Accumulator · **E36** Board Template Library · **E37** Answer-Sheet Layout.

**Tier 8 — Self-improvement (NEW)** (4)
**E38** PYQ Ingester · **E39** Feedback Collector + Clusterer · **E40** Change Proposer · **E41** Auto-Promoter + Proposal Queue.

**Tier 9 — Quality (NEW)** (3)
**E42** Physics Validator (wire into E25/E29/E30 as hard gate) · **E43** Visual Probe (CLAUDE_TEST.md automation) · **E44** Regression Suite (re-verify cached sims when renderer/solver changes).

Re-numbering: CLAUDE_ENGINES.md's current 34-engine list maps onto E1–E34. E35–E44 are additions surfaced in this plan.

---

## FEEDBACK ARCHITECTURE (ENGINES 39–41)

Four nightly offline agents. Real-time collection, batch learning, human-gated
structural changes. Notion-style pattern — **never** real-time fine-tuning.

```
Agent 1 — Collector (E39a, 1 AM)
  Unify chat_feedback + simulation_feedback + variant_feedback
  + student_confusion_log + test_session_log (NEW table) into
  feedback_unified. Tag each row {concept_id, state_id, mode,
  severity, source, type}.

Agent 2 — Clusterer (E39b, 2 AM, Haiku)
  Semantic-cluster new confusion phrases; merge into existing
  confusion_cluster_registry or propose new cluster_id.

Agent 3 — Proposer (E40, 3 AM, Sonnet)
  For clusters with ≥3 hits OR ≥1 CRITICAL bug: draft
  epic_c_branch / drill_down / prompt rule / renderer ticket /
  variant request. Run Physics Validator (E42) on proposed diff.
  Write to proposal_queue.

Agent 4 — Auto-Promoter (E41, 4 AM)
  Safe auto-merge: sub-sims with ≥20 positive + 0 negative
  feedbacks; drill-down clusters with ≥10 hits + validator-green.
  Structural changes queued for Pradeep's 5-min morning review
  at /admin/proposal-queue (NEW route).
```

**New tables required**: `feedback_unified`, `test_session_log`, `proposal_queue`, `engine_bug_queue`.

**What feedback updates** — not model weights, but three artifacts:
1. **JSONs** — E25 re-runs on affected concepts, replacing the cached version after validator + approval.
2. **Prompts** — `deep_dive_generator_v2.txt` etc. get new rules; versioned; A/B against last 50 generations before global switch.
3. **Engines** — Renderer/solver bugs become `engine_bug_queue` tickets; one fix regenerates all affected cached sub-sims.

---

## VARIANT STRATEGY

**MVP: one canonical variant per concept. Year-2: expand to three.**

- 150 concepts × 1 high-quality variant > 50 concepts × 3 mediocre variants.
- Each Type-B variant (different physical world — person/car/elevator instead of block) costs ~60% of a new concept. 3× budget for zero new TAM.
- **Architect now**: cache key supports `variant_id`, schema has `regeneration_variants[]` slot, `variant_feedback` table is live. E32 picker works; E32-B (Sonnet Type-B generator) stays dormant.
- **Year-2 trigger**: when `variant_feedback` shows ≥20% of students on any concept requesting alternate explanation, activate E32-B.

---

## TEST-REPAIR PROCEDURE

Formalized in CLAUDE_TEST.md §14.

```
1. E25 (Sonnet 5-agent) generates concept JSON          [offline]
2. E42 Physics Validator runs                           [HARD GATE]
3. npm run validate:concepts (Zod schema)               [HARD GATE]
4. Cache prewarm — all 3 modes, all allow_deep_dive     [offline]
5. E43 Visual Probe + human pass (CLAUDE_TEST.md)       [session]
6. Bug triage — classify as:
     (a) prompt gap     → edit prompt, re-run E25 on affected concepts
     (b) renderer bug   → fix once, regenerate all affected cached sims
     (c) engine bug     → fix engine, re-run prewarm
     (d) Sonnet physics → add rule to E42, re-run E25
7. Pradeep approves → promote to production cache.
```

**Principle**: fix prompts / engines / validators ONCE; regenerate many JSONs.
Do NOT hand-patch individual JSONs — it won't scale to 500 concepts.

---

## ROADMAP — PHASE SEQUENCE

Phases A–C complete. Session 18 shipped Phase D constraint-solver hardening.

| Phase | Work | Est. | Gate |
|---|---|---|---|
| **D** (in progress) | Zero-warning audit on STATE_3 + STATE_5 deep-dives; fix rotated-anchor resolver, drawVector direction_deg, drawAngleArc surface_id | 1–2 sessions | All 6 sub-pills of both deep-dives render clean |
| **E** | Retrofit 5 Ch.8 forces JSONs to gold-standard spec | 3 sessions | Tightened gate passes |
| **E.6** (parallel track) | **Magnetism proof-of-concept** — DC Pandey Ch.26. Build 3 diamonds (`magnetic_field_wire` ✅, `force_on_moving_charge`, `torque_on_current_loop_in_field`), extract patterns library (`docs/patterns/magnetism.md`), build `scene_designer` agent (`.agents/scene_designer/CLAUDE.md`), validate by template-authoring `magnetic_field_solenoid` (M4 gate), then author remaining ~14 atomic + ~17 nano concepts. Materials sub-architecture (sections 26.14–26.17) deferred. **See `docs/MAGNETISM_ARCHITECTURE.md`** for the full plan. | ~25 sessions (parallel with E/F/G) | M4 gate: solenoid authored at diamond quality on first run via the pipeline + patterns library |
| **F** | UI shell — mode tabs runtime routing, answer-sheet canvas, mark accumulator, deep-dive buttons, "I'm confused about…" input | 2 sessions | Mode switch + deep-dive flow verified in Chrome + Safari |
| **G** | E31 Feynman Grader + ConfidenceMeter wiring | 2 sessions | Ships on `normal_reaction` first; 10-student validation |
| **H** | **E42 Physics Validator wiring** into E25/E29/E30 as hard gate | 1 session | Validator blocks the 3 session-18 bug classes (mg_perp direction, missing angle_arc, vector primitive contract) |
| **I** | **E39/E40/E41 feedback agents** + `feedback_unified`, `test_session_log`, `proposal_queue`, `engine_bug_queue` tables + `/admin/proposal-queue` route | 4 sessions | One full nightly cycle runs end-to-end on real data |
| **J** | **E25 full build** (5-agent offline JSON pipeline) using `normal_reaction.json` + 5 Ch.8 retrofits as few-shot exemplars | 5–7 sessions | E25 produces validator-passing JSON for Ch.8.4 Equilibrium without human authoring |
| **K** | **E26 chapter templates** + **E33/E34/E35/E36/E37 board stack** | 3 sessions | Answer-sheet PDF downloadable for `normal_reaction` |
| **L** | Ch.8.4–8.8 authoring via E25 | one concept per session | Each passes E42 + human review |
| **M** | Ch.9 LoM, Ch.10 WEP, Ch.11 Rotational, Ch.12 Gravitation via E25 | 1–2 weeks per chapter | 150-concept MVP |
| **N** | E38 PYQ Ingester + E32-B Variant Type-B generator | year-2 | When `variant_feedback` threshold hit |
| **O** | Retire Sonnet Stage 2 (legacy pipeline) | when zero concepts depend on it | All `VALID_CONCEPT_IDS` served from gold-standard JSONs |

Total infra + gold-standard chapter ≈ 20 sessions. Then Engine 25 scales everything else.

---

## CRITICAL FILES (reference, not necessarily modified)

- `src/lib/subSimSolverHost.ts:350` — rotated-anchor bug site (Phase D)
- `src/lib/renderers/parametric_renderer.ts:1222` (drawVector), `:1459` (drawAngleArc) — two bug sites flagged in session 18
- `src/prompts/deep_dive_generator_v2.txt` — prompt gaps for angle_arc / mg_perp direction / vector contract
- `src/lib/physicsValidator.ts` — to wire into E25/E29/E30 (Phase H)
- `src/lib/variantPicker.ts` — confirms Type-A ready
- `src/schemas/conceptJson.ts` — confirms `regeneration_variants[]` slot exists
- `src/app/admin/deep-dive-review/page.tsx`, `src/app/admin/drill-down-review/page.tsx` — pattern to follow for `/admin/proposal-queue`

---

## VERIFICATION

End-to-end verification of the architecture itself happens at Phase I gate:
one full nightly feedback cycle runs on real `chat_feedback` +
`simulation_feedback` data, produces at least 1 proposal in
`/admin/proposal-queue`, Pradeep approves, E25 regenerates the affected JSON,
validator passes, cache is promoted — all without manual intervention beyond
the single approval click.

Per-session verification (standard): CLAUDE_TEST.md protocol, logged to
`test_session_log` (after Phase I).

---

## GUARDRAILS (DO NOT VIOLATE)

- No parallel multi-session authoring (voice drift).
- Every JSON change reviewed state-by-state.
- Ship no JSON with empty `scene_composition.primitives` or all-`auto_after_tts` — validator rejects. (`epic_c_branches` are OPTIONAL — EPIC-L-first directive 2026-06-10; the old "<4 branches" floor is retired and Zod relaxed.)
- IF a board override is authored (deferred per the 2026-06-11 conceptual-only directive) it must be complete: `canvas_style: "answer_sheet"` + `derivation_sequence` + `mark_scheme` — Gate 21 enforces all-or-nothing.
- E25 activates only after `normal_reaction.json` + 5 Ch.8 retrofits are approved — no auto-authoring before a validated exemplar library exists.
- Feedback agents E39/E40/E41 are offline batch only — never real-time training/inference loops.
- Retire legacy Sonnet Stage 2 only after all `VALID_CONCEPT_IDS` are served by gold-standard JSONs (Phase O).

---

*PLAN.md is the roadmap. CLAUDE.md is the operating manual.*
*CLAUDE_ENGINES.md is the engine spec. CLAUDE_REFERENCE.md is the current-reality map.*
*CLAUDE_TEST.md is the verification contract. PROGRESS.md is the session log.*
*Together these six files are all the context any new Claude session needs.*
