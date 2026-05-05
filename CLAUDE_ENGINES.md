# CLAUDE_ENGINES.md — Engine Inventory & Architecture

**Loaded on demand.** Quick reference for engine architecture, contracts, and migration discipline.
**For depth:** [docs/ARCHITECTURE_v2.2.md §3](docs/ARCHITECTURE_v2.2.md#3-44-engine-inventory-tiers-09).
**Last updated:** 2026-04-24.

---

## 1. Tier overview

10 tiers, **43 engines** today (44th slot reserved for Peter Parker cluster index).

| Tier | Theme | Engines | Status |
|---|---|---|---|
| 0 | Storage & schema | E1-E5 | shipped |
| 1 | Classifier & routing | E6-E9 | shipped (E9 partial) |
| 2 | Renderer primitives (PCPL) | E10-E13 | shipped (E12 partial) |
| 3 | Concept authoring | E14-E17 | shipped |
| 4 | Sub-simulation (DEEP-DIVE / DRILL-DOWN) | E18-E21 | shipped |
| 5 | Modes (conceptual / board / competitive) | E22-E24 | shipped |
| 6 | Live serving | E25-E27 | shipped |
| 7 | Assessment & generation | E28-E33 | mixed (E29, E30 not_started; rest shipped/partial) |
| 8 | Self-improvement (Tier 8 quartet) | E34-E37 | not_started |
| 9 | Quality + bug-tracking | E38-E43 | mixed (E38 partial; E39-E43 not_started) |

---

## 2. Detailed inventory

### Tier 0 — Storage & schema

| # | Engine | Status | Owner cluster | Source / spec |
|---|---|---|---|---|
| E1 | Supabase (pgvector) — concept_panel_config, ncert_content, ai_usage_log, etc. | shipped | self_improvement | n/a (managed service) |
| E2 | concept JSON Zod schema (v2.0.0) | shipped | renderer_primitives | `src/schemas/conceptJson.ts` |
| E3 | Cache fingerprint (5D today; 6D adds board_variant) | shipped (5D) | runtime_generation | `src/lib/aiSimulationGenerator.ts` |
| E4 | session_context table | shipped | runtime_generation | n/a |
| E5 | confusion_cluster_registry | shipped | self_improvement | one row per (concept_id, state_id, cluster_id) with trigger_examples TEXT[] |

### Tier 1 — Classifier & routing

| # | Engine | Status | Owner cluster | Source / spec |
|---|---|---|---|---|
| E6 | Intent Classifier (Gemini Flash) | shipped | runtime_generation | `src/lib/intentClassifier.ts` |
| E7 | Concept synonym map | shipped | runtime_generation | CONCEPT_SYNONYMS, intentClassifier.ts:96-126 |
| E8 | Classifier-prompt drift detector | shipped (32.5) | quality | `assertClassifierPromptInSync()`, intentClassifier.ts:141-204 |
| E9 | aspect → state_range routing | partial | runtime_generation | depends on `entry_state_map` v2.2 field |

### Tier 2 — Renderer primitives (PCPL)

| # | Engine | Status | Owner cluster | Source / spec |
|---|---|---|---|---|
| E10 | parametric_renderer (Canvas / p5) | shipped | renderer_primitives | `src/lib/renderers/parametric_renderer.ts` (~2453 lines) |
| E11 | Choreography (6 canonical motion types) | shipped | renderer_primitives | see §4 — bug: motion #7 (uniform translation) missing from canonical list, runtime supports it |
| E12 | PCPL primitive library (13 built / 22 planned / target 35) | partial | renderer_primitives | see §5 |
| E13 | graph_interactive renderer | shipped | renderer_primitives | `src/lib/renderers/graph_interactive_renderer.js` (~504 lines) |

### Tier 3 — Concept authoring

| # | Engine | Status | Owner cluster | Source / spec |
|---|---|---|---|---|
| E14 | Concept JSON loader | shipped | renderer_primitives | `loadConstants()` reads `src/data/concepts/` first, legacy `src/lib/physics_constants/` fallback |
| E15 | normalizeOldStates bridge | shipped | renderer_primitives | legacy `simulation_states` → `epic_l_path` |
| E16 | Strict-engines gate | shipped | quality | rejects malformed JSONs before assembly, `aiSimulationGenerator.ts` |
| E17 | Concept validator script | shipped | quality | `src/scripts/validate-concepts.ts`, `npm run validate:concepts` |

### Tier 4 — Sub-simulation

| # | Engine | Status | Owner cluster | Source / spec |
|---|---|---|---|---|
| E18 | DEEP-DIVE engine (sub-sim per state) | shipped | runtime_generation | `/api/deep-dive`, pre-built or on-demand Sonnet |
| E19 | DRILL-DOWN engine (cluster-targeted sub-sim) | shipped | runtime_generation | `/api/drill-down`, Haiku classifier |
| E20 | deep_dive_cache table | shipped | runtime_generation | 6D fingerprint, status: pending_review/verified |
| E21 | drill_down_cache table | shipped | runtime_generation | 6D fingerprint with cluster_id |

### Tier 5 — Modes

| # | Engine | Status | Owner cluster | Source / spec |
|---|---|---|---|---|
| E22 | mode_overrides merger | shipped | runtime_generation | runtime: baseline + mode_overrides[mode] deep-merged at session start |
| E23 | Board mode (canvas_style: answer_sheet) | shipped (10 concepts) | renderer_primitives | derivation_sequence + mark_scheme + mark_badge per state |
| E24 | Competitive mode (shortcuts + edge_cases) | shipped | renderer_primitives | uses regeneration_variants for "what if" |

### Tier 6 — Live serving

| # | Engine | Status | Owner cluster | Source / spec |
|---|---|---|---|---|
| E25 | /api/generate-simulation | shipped | runtime_generation | `src/app/api/generate-simulation/route.ts`, with stale-fingerprintKey guard |
| E26 | /api/chat (with on_demand_available pill) | shipped | runtime_generation | `src/app/api/chat/route.ts:321-351` (enriched session 33) |
| E27 | TeacherPlayer (state machine + TTS) | shipped | renderer_primitives | `src/components/TeacherPlayer.tsx` — DEEP-DIVE button de-gated session 33 |

### Tier 7 — Assessment & generation

| # | Engine | Status | Owner cluster | Source / spec |
|---|---|---|---|---|
| E28 | Assessment generator (MCQ) | partial | assessment | per-concept question bank generation |
| E29 | Feynman-mode grader | not_started | assessment | "Now you explain it back" — Sonnet grades against physics_engine_config |
| E30 | Answer-sheet PDF export (E37 in old docs) | not_started | assessment | client-side jsPDF for V1 |
| E31 | PYQ ingester | partial | assessment | metadata only; HC Verma / DC Pandey / NCERT scope check |
| E32 | NCERT chunk extractor | shipped | assessment | 6,069 chunks |
| E33 | MinerU image+PDF pipeline | shipped | assessment | port 8000 Python uvicorn |

### Tier 8 — Self-improvement

| # | Engine | Status | Owner cluster | Source / spec |
|---|---|---|---|---|
| E34 | Feedback Collector | not_started | self_improvement | nightly: aggregate variant_feedback + simulation_feedback + chat_feedback |
| E35 | Confusion Clusterer | not_started | self_improvement | DBSCAN/HDBSCAN over confusion phrases → cluster proposals |
| E36 | Change Proposer | not_started | self_improvement | structured diffs to JSON / cluster registry / drill-down trigger lists |
| E37 | Auto-Promoter (Rule 18) | not_started | self_improvement | 20 positive + 0 negative + 0 E42 violations → status: verified |

### Tier 9 — Quality & bug-tracking

| # | Engine | Status | Owner cluster | Source / spec |
|---|---|---|---|---|
| E38 | Physics Validator (E42) | partial | quality | 9 hard conditions per §3 below |
| E39 | Visual Probe (E43) | not_started | quality | replaces gate 4 walks; logs to test_session_log |
| E40 | Regression Suite (E44) | not_started | quality | nightly across all concepts |
| E41 | engine_bug_queue table | not_started | quality | structured bugs vs. PROGRESS.md prose |
| E42 | test_session_log table | not_started | quality | every gate run, every concept, every session |
| E43 | proposal_queue table | not_started | self_improvement | Pradeep's review surface for Tier 8 outputs |

---

## 3. Physics Validator (E38) — 9 hard conditions

Hard gate at `/api/deep-dive`. Returns HTTP 422 if any condition violated. Routes failure to physics_author.

1. **mg_perp direction symmetry** — normal reaction perpendicular to surface, opposite to mg_perp component.
2. **ΣF = 0 at equilibrium** — static / uniform-velocity states balance.
3. **angle_arc presence rules** — every angle referenced in text has an `angle_arc` primitive.
4. **vector primitive consistency** — all force_arrow / velocity / acceleration have `from`/`to` or `magnitude` + `direction_deg` within bounds.
5. **scene_composition ≥ 3 primitives** (Rule 19).
6. **epic_c_branches ≥ 4** (Zod enforces; verify).
7. **no circular prerequisite deps** — DAG property; trace `prerequisites[]` chain.
8. **all primitives in PCPL spec** — no types outside the 13-built list (json_author escalation rule).
9. **mode_overrides coverage** — all three modes present (conceptual baseline + board + competitive).

---

## 4. E11 Choreography — canonical motion types

The Choreography engine supports 6 canonical motion types. Every `animate_in` you author must match one of these — ad-hoc animations that don't derive from physics are rejected.

| # | Motion | Equation | Use case |
|---|---|---|---|
| 1 | Projectile | `x(t) = x₀ + v₀ₓt; y(t) = y₀ + v₀ᵧt − ½gt²` | Thrown ball, launched block |
| 2 | Free fall | `y(t) = y₀ − ½gt²` | Mango from tree, dropped object |
| 3 | SHM | `x(t) = A·cos(ωt + φ)` | Spring, pendulum (small angle) |
| 4 | Circular | `θ(t) = θ₀ + ωt` | Orbit, circular motion, Ferris wheel |
| 5 | Atwood | `a = (m₁ − m₂)g/(m₁ + m₂)`; `tension = m₁g − m₁a` | Two-mass pulley system |
| 6 | Incline + friction | `a = g(sinθ − μcosθ)`; `N = mg·cosθ` | Block on inclined surface |

**Bug** (deferred fix): runtime supports `translate` (uniform translation) as motion #7 but it's not in the canonical doc list. Add when `renderer_primitives` cluster spec lands.

If your concept needs motion not in this list (damped oscillation, collision recovery), STOP — file engine bug against E11 for expansion, don't author a custom animation.

---

## 5. PCPL primitive library

### Built (13) — safe to use

| type | purpose | key fields |
|---|---|---|
| `body` | physical object | `shape: circle\|rect`, `position`, `size`, `fill_color`, `border_color` |
| `surface` | table/wall/incline | `orientation: horizontal\|vertical\|inclined`, `angle?`, `position`, `length`, `texture?`, `friction?` |
| `force_arrow` | drawn force | `from: {x,y}\|"body_center"`, `magnitude\|magnitude_expr`, `direction_deg`, `label\|label_expr`, `scale_pixels_per_unit` |
| `vector` | generic arrow | `from: {x,y}`, `to: {x,y}`, `label?`, `color?`, `style?: solid\|dashed` |
| `label` | text | `text\|text_expr`, `position`, `font_size?`, `color?` |
| `annotation` | callout text | `text`, `position`, `style?: callout\|underline`, `color?` |
| `formula_box` | boxed equation | `equation\|equation_expr`, `position`, `border_color?` |
| `slider` | student input | `variable`, `min`, `max`, `step`, `default`, `label` |
| `angle_arc` | angle indicator | `vertex`, `from_direction`, `to_direction`, `label?`, `radius?` |
| `axes` | coord frame | `position`, `length`, `angle_deg?`, `x_label?`, `y_label?` |
| `force_components` | force decomp | `force_id`, `decompose_axis`, `origin_body_id`, `scale_pixels_per_unit` |
| `derivation_step` | board handwriting | `text`, `position`, `animate_in: handwriting` |
| `mark_badge` | board mark overlay | `state`, `marks`, `label`, `position` |

### Planned (22) — NOT yet built

- **Sprites (8):** `earth_surface`, `table_surface`, `ramp`, `pulley`, `mass_block`, `spring`, `charge`, `magnet`
- **Fields (4):** `electric_field`, `magnetic_field`, `gravity_field`, `wave_field`
- **Board mode (4):** `variable_meter`, `equation_box`, `unit_display`, `step_counter`
- **Circuit mode (6):** `battery`, `resistor`, `capacitor`, `led`, `switch`, `voltmeter`

These block Ch.F-H concept authoring (circuits, fields). When the concept you're retrofitting needs one, file engine bug → wait for `renderer_primitives` cluster to land it → resume.

---

## 6. Event bus contract (TeacherPlayer ↔ iframe)

Every PCPL renderer iframe MUST implement this contract.

```javascript
// On load:
window.parent.postMessage({ type: 'SIM_READY' }, '*');

// On state applied:
window.parent.postMessage({ type: 'STATE_REACHED', state: 'STATE_N' }, '*');

// Listen for:
window.addEventListener('message', (e) => {
  if (e.data.type === 'SET_STATE') applySimState(e.data.state);
  if (e.data.type === 'PARAM_UPDATE') applyParam(e.data.variable, e.data.value);
});
```

**Globals every parametric renderer exposes:**
- `PM_currentState` (string) — single source of truth (Rule 6).
- `PM_config` (object) — full simulation config from `/api/generate-simulation`.
- `PM_ZONES` (object) — 5 zones at `parametric_renderer.ts:1993-1999`.
- `PM_physics.variables` — current variable values.
- `PM_sliderValues` — current slider positions.
- `PM_interpolate(template)` — resolves `{varname}` and `{(expr).toFixed(N)}` against PM_physics.variables.
- `PM_bodyRegistry` — mapping body id → screen position (used by symbolic anchors).

**Rule 6:** PM_currentState is the ONLY state variable. Never create a parallel `currentState` integer.

---

## 7. Mode overrides schema (Rule 20-21)

```typescript
mode_overrides: {
  board: {
    canvas_style: "answer_sheet",
    derivation_sequence: { /* per-state primitive arrays with animate_in: handwriting */ },
    mark_scheme: { total: number, per_state: { STATE_N: number } },
    epic_l_path: { states: { STATE_N: { teacher_script: { tts_sentences: [...] } } } }
  },
  competitive: {
    shortcuts: [ { trigger: string, formula: string, when: string } ],
    edge_cases: [ { boundary: string, behavior: string } ],
    epic_l_path: { states: { ... } }
  },
  foundation: { /* simpler, more visual */ },
  neet: { /* biology-context anchors when applicable */ },
  olympiad: { /* edge cases + multi-step */ }
}
```

Runtime: TeacherPlayer deep-merges `epic_l_path` (baseline) with `mode_overrides[currentMode]` at session start. Per-state overrides win.

---

## 8. AI model strategy (steady state)

Per [docs/ARCHITECTURE_v2.2.md §9](docs/ARCHITECTURE_v2.2.md#9-runtime-economics--model-routing):

| Path | Model | Cost / query | Cache? |
|---|---|---|---|
| Cache hit (target 90%) | none | $0 | yes |
| Classifier (always runs) | Gemini Flash | $0.0001 | n/a |
| Drill-down miss (rare) | Haiku 4.5 | $0.001 | yes |
| DEEP-DIVE on-demand | Sonnet 4.6 | $0.05 | yes (24h review window) |
| Image vision | Sonnet 4.6 | $0.10 | yes |
| Novel concept fallback | Sonnet 4.6 | $0.10 | yes |
| Authoring (Alex pipeline) | Sonnet 4.6 | $5-15 / concept | n/a (one-time) |

**Banned:** Sonnet in uncached live-serving paths for verified content (Rule 18).

---

## 9. Schema migration protocol

When the concept JSON schema needs a field added:

1. **Architect proposes** in a session note. Includes use case + example JSON snippet.
2. **Pradeep approves** the field name + type + placement (root vs per-state vs per-primitive).
3. **Author the v.next-1 schema** with the new field as `optional` (passthrough). Existing JSONs remain valid.
4. **Update Alex specs** (architect, physics_author, json_author, quality_auditor) to populate / verify the new field in NEW authoring.
5. **Backfill opportunistically** — when a JSON is touched for any reason, add the new field. Don't re-author all 52 concepts at once.
6. **After ≥20 JSONs ship the field**, tighten Zod (superRefine or required). Pre-existing JSONs retrofit before the strict pass.

**Why additive-only first:** prevents the "48-JSON breaking change" failure mode. v2.1 → v2.2 (sessions 31.5-33) followed this protocol successfully.

---

## 10. Failure policy

When an engine fails:

| Failure | Surface | Action |
|---|---|---|
| Type-check | local + CI | block — no commit |
| Validator (Zod) | `npm run validate:concepts` | block JSON ship; quality_auditor gate 1-2 |
| E38 Physics Validator (gate at /api/deep-dive) | HTTP 422 | reject sub-sim; route to physics_author |
| Classifier-prompt drift | dev console `[intentClassifier] ⚠️` | warn loud, don't crash; fix at next deploy |
| Stale-fingerprintKey | server log `[generate-simulation] stale fingerprintKey dropped` | guard auto-corrects; not a failure |
| Sonnet on-demand timeout (>60s) | UI spinner stays | log to engine_bug_queue; route to runtime_generation cluster |
| Visual probe regression (E43, future) | nightly report | log to test_session_log; route to authoring agent |

---

## 11. 24 key principles (cross-tier discipline)

1. **Engines learn nothing. JSONs learn everything. Humans approve everything.** (Rule 17)
2. **Sonnet banned from uncached live-serving for verified content.** (Rule 18)
3. **Every atomic JSON ships all three modes from day one.** (Rule 20)
4. **Board mode is answer-sheet-first** with derivation_sequence + mark_scheme. (Rule 21)
5. **DEEP-DIVE and DRILL-DOWN are mutually exclusive entry paths.** (Rule 22)
6. **Prerequisites are advisory, not gating.** (Rule 23)
7. **State count is concept-driven, never fixed.** (Rule 11)
8. **Sonnet picks scenarios ONLY from `available_renderer_scenarios`.** (Rule 12)
9. **`teacher_script` uses `text_en`, not `text`.** (Rule 13)
10. **`advance_mode` per state, never global; ≥2 distinct values per JSON.** (Rule 15)
11. **EPIC-C STATE_1 ALWAYS shows wrong belief.** (Rule 16)
12. **Every state has `scene_composition.length ≥ 3`.** (Rule 19)
13. **PM_currentState is the ONLY state variable.** (Rule 6)
14. **Three teaching modes are separate functions.** (Rule 2)
15. **Strategy buttons are UI-only, never appended to explanation text.** (Rule 3)
16. **Cache key is 5-dimensional** (6D for board mode). (Rule 4)
17. **AI never writes rendering code in Stage 2.** (Rule 5)
18. **NCERTSourcesWidget uses inline styles** (no Tailwind dependency). (Rule 7)
19. **usageLogger uses camelCase.** (Rule 8)
20. **Delete simulation_cache rows for a concept to force regeneration.** (Rule 9)
21. **DC Pandey TOC-only, no content imports.** (CLAUDE.md §8)
22. **Indian-context anchors, plain English, no Hinglish.** (CLAUDE.md §8)
23. **Student-first UI: every state shows the Explain button.** (session 33)
24. **Socratic reveal as default pacing for new-quantity states.** (session 33)

---

*For depth: [docs/ARCHITECTURE_v2.2.md](docs/ARCHITECTURE_v2.2.md). For roadmap: [PLAN.md](PLAN.md). For session history: [PROGRESS.md](PROGRESS.md).*
