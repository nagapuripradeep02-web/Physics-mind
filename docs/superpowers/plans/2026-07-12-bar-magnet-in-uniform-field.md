# bar_magnet_in_uniform_field Rebuild — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement
> this plan task-by-task. This is a PhysicsMind concept rebuild, so tasks are **Alex-pipeline dispatches**
> (architect → physics_author → json_author → quality_auditor) with a renderer FAIL-route, not a TDD
> code loop. There is **no unit-test suite** (CLAUDE.md §6) — the "test cycle" for a concept is
> `npx tsc --noEmit` (0 errors) → `npm run validate:concepts` (target PASS) → THE EYE
> (`npm run visual:eyes -- bar_magnet_in_uniform_field`, zero new `engine_bug_queue` rows). Steps use
> checkbox (`- [ ]`) syntax.

**Goal:** Rebuild `bar_magnet_in_uniform_field` from the old 8-state Socratic version into a
straightforward 9-state Rule-31/32/34 diamond (concept #2 of the Ch.5 rebuild batch), keeping the
correct physics and passing THE EYE.

**Architecture:** Sequential Alex pipeline — each agent's output is the next's input. The `field_3d`
scenario `bar_magnet_in_uniform_field` already exists (shares `applyDipoleInFieldState` with
`dipole_in_uniform_field`); most work is content restructure in the concept JSON, with additive renderer
motions (S6 pose-compare, S8 B step-up) surfaced only if THE EYE / quality_auditor demand them.

**Tech Stack:** Next.js 16 / TypeScript / the `field_3d_renderer.ts` Three.js renderer / Zod validator
(`src/schemas/conceptJson.ts`) / THE EYE (`visual_eyes.ts`).

## Global Constraints

- **Reference shape:** concept #1 `src/data/concepts/bar_magnet_as_dipole.json` — mirror its
  guided-motion + all-slider-sandbox structure, straightforward `misconception_watch` with
  `visual_counter`, clean narration (no `glow`/`math_show`/`pause_after_ms` Socratic scaffolding).
- **Spec:** `docs/superpowers/specs/2026-07-12-bar-magnet-in-uniform-field-design.md` — the 9-state arc
  table, 5-misconception mapping (M1→S4, M2→S3, M3→S6, M4→S7, M5→S8), PRIMARY aha = S4 are authoritative.
- **Rules:** 31 (one idea+motion/state, 25–55 EN words, distinct archetypes, explore-last, no Socratic) ·
  32 (cause-first, ≤5-word delta-cue `caption`, home-pose continuity, single glow-focal) · 33d (value-only
  live HUD) · 34 (one Cambria-Math Unicode `formula_overlay`/state; all math Unicode across DOM/graph/
  sprite paths; overlays never collide) · 35 (universal anchor, no country-specific content) · 30
  (plain English, expand bare symbols to spoken names in narration, colour words English) · 36
  (frame-rate-independent — no hardcoded per-frame delta in any renderer edit).
- **Keep** `schema_version: "2.0.0"`, `renderer_pair` both `field_3d`, `scenario_type`
  `bar_magnet_in_uniform_field`. **No** `mode_overrides`, **no** `epic_c_branches`, **not** in
  `PCPL_CONCEPTS`, **not** in `PILOT_CONCEPTS`.
- **Shared tree:** branch `feat/field3d-draggable-sensor` carries parallel-session WIP. **Path-scoped
  staging only** — `git add <exact files>`, never `git add -A`; never edit `field_3d_renderer.ts` while
  another session holds it uncommitted (diff-first, region-disjoint if a renderer touch is unavoidable).
- **`m`, not `m⃗`** on canvas (U+20D7 renders as tofu). Every renderer edit → `npm run check:renderer-syntax`.

## File Structure

| File | Responsibility | Task |
|---|---|---|
| `.agents/proof_run/bar_magnet_in_uniform_field_skeleton.md` | architect output (9-section skeleton) | 1 |
| `.agents/proof_run/bar_magnet_in_uniform_field_physics_block.md` | physics_author output | 2 |
| `src/data/concepts/bar_magnet_in_uniform_field.json` | the rebuilt concept (the product) | 3, 5 |
| `src/config/panelConfig.ts`, `src/lib/aiSimulationGenerator.ts`, `src/lib/intentClassifier.ts` | 8-site registration (verify; already registered) | 3 |
| `supabase_migrations/…seed_bar_magnet_in_uniform_field_clusters…sql` | clusters migration (authored-not-applied, N/A-DORMANT) | 3 |
| `src/lib/renderers/field_3d_renderer.ts` | additive motions (S6 pose_compare / S8 B step-up) IF FAIL-routed | 5 |
| `PROGRESS.md` | session log | 6 |

---

### Task 1: Architect skeleton

**Files:**
- Create: `.agents/proof_run/bar_magnet_in_uniform_field_skeleton.md`

**Interfaces:**
- Consumes: the spec (`docs/superpowers/specs/2026-07-12-bar-magnet-in-uniform-field-design.md`).
- Produces: a 9-section markdown skeleton with the exact 9-state arc, per-state motion archetype +
  ≤5-word delta cue, the 5 `misconception_watch` pivots, entry_state_map, prerequisites, universal
  anchor. This is json_author's structural input.

- [ ] **Step 1: Dispatch the `architect` agent.** Prompt it with: concept_id `bar_magnet_in_uniform_field`,
  chapter 5; "this is a REBUILD of an existing Socratic concept into a straightforward Rule-31/32/34
  9-state arc — read the spec at `docs/superpowers/specs/2026-07-12-bar-magnet-in-uniform-field-design.md`
  and the reference concept `src/data/concepts/bar_magnet_as_dipole.json`; produce the skeleton for the
  9 states EXACTLY as the spec's arc table (S1 object-reveal … S9 sandbox), PRIMARY aha at S4, 5
  misconception_watch entries at S3/S4/S6/S7/S8, universal Rule-35 anchor. EPIC-L-first, no epic_c_branches."
- [ ] **Step 2: Verify the skeleton.** Confirm it has: 9 states, distinct motion archetype per state,
  delta cue per state, aha at S4 (`primary`), the 5 misconceptions mapped as in the spec, an entry_state_map,
  and a universal anchor (no country-specific content). If any state has two ideas or a repeated archetype
  (except S7's declared contrast pair), send it back to architect.
- [ ] **Step 3: Commit.**
  ```bash
  git add .agents/proof_run/bar_magnet_in_uniform_field_skeleton.md
  git commit -m "docs(bar_magnet_in_uniform_field): architect skeleton (9-state straightforward arc)"
  ```

---

### Task 2: Physics block

**Files:**
- Create: `.agents/proof_run/bar_magnet_in_uniform_field_physics_block.md`

**Interfaces:**
- Consumes: Task 1 skeleton + the spec's §6 physics config.
- Produces: variable declarations (m, B, theta_deg, I with units/min/max/default), per-state within-state
  motion timeline (what animates per t-window, driven by which variable), the per-state **numeric-lock
  table** (so an S9 slider drag can't corrupt a guided state's readout), the value-only HUD spec per
  state (τ/U/T live numbers), and physical constraints. json_author's physics input.

- [ ] **Step 1: Dispatch the `physics-author` agent** with the Task 1 skeleton. Require: re-verify
  τ=mB·sinθ, U=−mB·cosθ, T=2π√(I/mB), ΣF=0; write the per-state motion timeline + numeric-lock table +
  per-state HUD (value-only, Unicode units `N·m`, `J`, `s`); confirm S6 needs three poses (0/90/180),
  S7 needs a stable-oscillation + unstable-release contrast pair, S8 needs a scripted B step-up; flag any
  renderer capability the existing scenario lacks.
- [ ] **Step 2: Verify** the numbers independently (spot-check: at m=5, B=5×10⁻⁴, θ=90° → τ=2.5×10⁻³ N·m;
  θ=0° → τ=0, U=−2.5×10⁻³ J; θ=180° → U=+2.5×10⁻³ J). Confirm the numeric-lock table covers all guided
  states.
- [ ] **Step 3: Commit.**
  ```bash
  git add .agents/proof_run/bar_magnet_in_uniform_field_physics_block.md
  git commit -m "docs(bar_magnet_in_uniform_field): physics block (per-state timeline + numeric locks)"
  ```

---

### Task 3: JSON authoring + registration

**Files:**
- Modify: `src/data/concepts/bar_magnet_in_uniform_field.json` (full rewrite of `epic_l_path` +
  `field_3d_config.states` + `aha_moment` + `entry_state_map` + `coverage_map`; keep/refresh physics
  config + assessment remapped to new state IDs)
- Verify/Modify: the 8 registration sites (concept already registered — confirm, update any old-state-ID refs)
- Create: `supabase_migrations/pilot_YYYYMMDD_seed_bar_magnet_in_uniform_field_clusters.sql` (if not present)

**Interfaces:**
- Consumes: Task 1 skeleton + Task 2 physics block + reference `bar_magnet_as_dipole.json`.
- Produces: a schema-valid concept JSON — 9 states, `advance_mode` `manual_click` (guided) +
  `interaction_complete` (S9), `misconception_watch` with `visual_counter`, `caption`=≤5-word delta cue,
  `label`=short headline, one Unicode `formula_overlay`/state, `show_sliders` only on S9.

- [ ] **Step 1: Dispatch the `json-author` agent** with both proof-run artifacts + the spec. Require:
  full rewrite of the state arc per the spec; strip ALL Socratic fields (`wait_for_answer`,
  `pause_after_ms`, `reveal_at_tts_id`, per-sentence `glow`/`math_show` scaffolding); `caption` = the
  ≤5-word delta cues; one Unicode `formula_overlay` per state (F=mB, ΣF=0 τ=m×B, τ=mB·sinθ, τ_max=mB,
  U=−mB·cosθ, T=2π√(I/mB)); value-only HUD; plain `m`; `field_3d_config.states` flags per the spec's
  archetype column; remap the 6 assessment MCQs to the new state IDs; author the clusters SQL. Verify all
  8 registration sites.
- [ ] **Step 2: Typecheck.** Run: `npx tsc --noEmit` — Expected: 0 errors.
- [ ] **Step 3: Validate.** Run: `npm run validate:concepts` — Expected: target `bar_magnet_in_uniform_field`
  PASSES (Rule 15 ≥2 advance_mode, Rule 19 ≥3 primitives/state, Gate 7 word budget within self-scoping,
  no untaught-term / co-location failures). Fix and re-run until green.
- [ ] **Step 4: Grep for leftover Socratic/ASCII.** Run:
  `grep -nE "wait_for_answer|pause_after_ms|reveal_at_tts_id|narrative_socratic" src/data/concepts/bar_magnet_in_uniform_field.json`
  — Expected: no matches. Then scan `formula_overlay`/`caption`/`label` for ASCII math (`tau`, `->`,
  `2pi`, `deg`, `m2`) — Expected: none (all Unicode).
- [ ] **Step 5: Commit.**
  ```bash
  git add src/data/concepts/bar_magnet_in_uniform_field.json supabase_migrations/pilot_*_seed_bar_magnet_in_uniform_field_clusters.sql
  # + any registration-site file that genuinely changed (diff-first; path-scoped)
  git commit -m "feat(bar_magnet_in_uniform_field): rebuild to Rule 31/32/34 straightforward 9-state arc"
  ```

---

### Task 4: THE EYE + eye-walker + quality_auditor

**Files:** none written (read-only gate); may produce `engine_bug_queue` candidate rows.

**Interfaces:**
- Consumes: the committed JSON (Task 3) + a running dev server / seeded cache.
- Produces: a per-state visual verdict + a quality_auditor PASS/FAIL (+ FAIL routing target) + any
  renderer bug rows for Task 5.

- [ ] **Step 1: Clear cache** (4 separate DELETEs, never batched — CLAUDE.md §6): `simulation_cache`,
  `lesson_cache`, `response_cache`, `session_context`. Seed the concept cache (seed script / curl bypass
  if node fetch is flaky — memory `feedback_node_fetch_flaky_curl_bypass`).
- [ ] **Step 2: Run THE EYE.** Run: `npm run visual:eyes -- bar_magnet_in_uniform_field` — Expected: it
  dumps deterministic frozen + dense frames per state, $0. Note the run dir under `.visual_runs/`.
- [ ] **Step 3: Dispatch `eye-walker` and `quality-auditor` IN PARALLEL** (one message, two Agent calls —
  eye-walker reads ALL frames in its own context and returns a per-state verdict table + ≤5 founder
  frames + candidate bug rows; quality-auditor runs gates 0–20 against the JSON + dev server). Main
  session never loads the ~100 PNGs.
- [ ] **Step 4: Triage.** If both are clean → Task 6. If eye-walker flags a visual defect or
  quality-auditor FAILs a gate with `[owner: peter_parker:renderer_primitives]` → Task 5. Log any real
  defect to `engine_bug_queue` (OPEN) before fixing (memory `feedback_recording_to_engine_bug_queue`).

---

### Task 5: Renderer FAIL-route fixes (only if Task 4 demands)

**Files:**
- Modify: `src/lib/renderers/field_3d_renderer.ts` (additive, gated behind the new state flags —
  zero regression to `dipole_in_uniform_field` and the electric-dipole sibling)

**Interfaces:**
- Consumes: quality_auditor / eye-walker findings.
- Produces: the S6 `pose_compare` rotation mode and/or S8 scripted B step-up and/or S7 unstable-release
  wiring, verified by re-running THE EYE.

- [ ] **Step 1: Diff-first shared-tree check.** Run `git status src/lib/renderers/field_3d_renderer.ts` —
  if another session holds it uncommitted, STOP and surface to founder (memory
  `no-race-shared-renderer-across-sessions`); else proceed with region-disjoint edits.
- [ ] **Step 2: Implement the additive motion(s)** behind the new per-state flags. Keep every integrator
  linear in dt (Rule 36 — no `time += 0.016`); force a single step under `SET_TIME_FREEZE` so frozen
  baselines stay byte-stable. If a probe leaves the 720px frame, use the `bmProbeDispR` display/true-value
  decoupling (concept #1).
- [ ] **Step 3: Renderer syntax guard.** Run: `npm run check:renderer-syntax` — Expected: node --check
  passes on both emitted template bodies (no backtick-terminates-template bug).
- [ ] **Step 4: Re-run THE EYE + re-dispatch eye-walker** on the affected states — Expected: clean, and
  the sibling scenarios (`dipole_in_uniform_field`) show H2 0.00% after reseed (additive-only proof).
  Loop Task 4↔5 until EYE-clean, zero new bug rows.
- [ ] **Step 5: Commit.**
  ```bash
  git add src/lib/renderers/field_3d_renderer.ts src/data/concepts/bar_magnet_in_uniform_field.json
  git commit -m "fix(bar_magnet_in_uniform_field): renderer touches (pose-compare / unstable-release / B step-up)"
  ```

---

### Task 6: Founder review → visual:approve → Telugu → ship

**Files:**
- Modify: `src/data/concepts/bar_magnet_in_uniform_field.json` (add `text_te`), `PROGRESS.md`
- Create: `visual_baselines/bar_magnet_in_uniform_field/` (via `visual:approve`, founder-triggered)

**Interfaces:**
- Consumes: an EYE-clean concept + founder OK.
- Produces: locked baselines, Telugu text, a review link, a PROGRESS log entry.

- [ ] **Step 1: Present ≤5 founder frames + review link.** Run `npm run build:review -- bar_magnet_in_uniform_field`,
  serve on :8080 (detached — memory `feedback_detached_process_for_long_tasks`), give
  `http://localhost:8080/bar_magnet_in_uniform_field/`. Founder hand-tests S9 slider drags + the S7
  unstable flip (THE EYE can't fire trusted events).
- [ ] **Step 2: Founder triggers `npm run visual:approve -- bar_magnet_in_uniform_field`** (a text/motion
  de-clutter is an *expected* H2 baseline fail — Rule 34e; re-baseline, not a fix cycle). Do NOT run this
  without the founder's explicit OK.
- [ ] **Step 3: Telugu `text_te` via a `model: sonnet` sub-agent** (Rule 30g code-mix — technical terms
  Latin, no transliteration, expand bare symbols to spoken names, colour words English). Write `text_te`
  structurally into every `tts_sentences` entry. `npx tsc --noEmit` + `validate:concepts` stay green.
- [ ] **Step 4: EN audio ON-DEMAND (Rule 30h).** Render EN audio (`npm run tts:generate -- bar_magnet_in_uniform_field --langs=en`)
  only if the pilot needs narration for this concept; the sim is a silent visual by default. Skip
  speculative rendering.
- [ ] **Step 5: PROGRESS.md** session log (what completed, files changed, gates, next = `gauss_law_magnetism`
  (#3)). Commit.
  ```bash
  git add src/data/concepts/bar_magnet_in_uniform_field.json visual_baselines/bar_magnet_in_uniform_field/ PROGRESS.md
  git commit -m "feat(bar_magnet_in_uniform_field): Telugu text_te + locked EYE baselines + PROGRESS"
  ```

---

## Self-Review

**Spec coverage:** S1–S9 arc → Tasks 1/3; 5 misconceptions → Task 1/3 (mapped in spec §2); PRIMARY aha S4
→ Task 1/3; on-canvas Unicode/one-formula/value-HUD (Rule 34) → Task 3 step 1+4; universal anchor
(Rule 35) → Task 1 step 2; renderer S6/S7/S8 touches (spec §7) → Task 5; physics re-verify (spec §6) →
Task 2; 8-site registration (spec §8) → Task 3; verification+ship (spec §9) → Tasks 4/6. No gaps.

**Placeholder scan:** commands and expected outputs are concrete; the only deliberate conditional is
Task 5 ("only if Task 4 demands") — that is a real branch, not a placeholder.

**Type consistency:** state IDs S1–S9 / STATE_1–STATE_9, `misconception_watch`+`visual_counter`,
`caption`/`label`/`formula_overlay`, `pose_compare`, `bmProbeDispR`, `SET_TIME_FREEZE` used consistently
across tasks and matching the spec.
