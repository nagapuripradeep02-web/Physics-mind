# gauss_law_magnetism Rebuild — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement
> this plan task-by-task. This is a PhysicsMind concept rebuild, so tasks are **Alex-pipeline dispatches**
> (architect → physics_author → json_author → quality_auditor) with a renderer FAIL-route, not a TDD
> code loop. There is **no unit-test suite** (CLAUDE.md §6) — the "test cycle" for a concept is
> `npx tsc --noEmit` (0 errors) → `npm run validate:concepts` (target PASS) → THE EYE
> (`npm run visual:eyes -- gauss_law_magnetism`, zero new `engine_bug_queue` rows). Steps use
> checkbox (`- [ ]`) syntax.

**Goal:** Rebuild `gauss_law_magnetism` from the old 6-state Socratic version into a straightforward
6-state Rule-31/32/34 diamond (concept #3 of the Ch.5 rebuild batch), keeping the correct physics
(∮B·dA = 0, no monopole, shape-independence, electric contrast) and passing THE EYE.

**Architecture:** Sequential Alex pipeline — each agent's output is the next's input. The `field_3d`
scenario `gauss_law_magnetism` already exists (modes `loops/whole/pole/morph/contrast/sandbox`, flowing
closed-loop tracer stream, shape-morphable Gaussian surface, S5 electric-contrast inset, shape+position
sliders). Most work is content restructure in the concept JSON; two decided renderer additions (a **live
crossing-tally HUD** and the **S3 body-cutaway brightening**) plus incidental Rule-34 polish are
additive, gated behind `gm.*` flags so the shared electric `gauss_law` scenario never regresses.

**Tech Stack:** Next.js 16 / TypeScript / the `field_3d_renderer.ts` Three.js renderer / Zod validator
(`src/schemas/conceptJson.ts`) / THE EYE (`visual_eyes.ts`).

## Global Constraints

- **Reference shape:** concept #2 `src/data/concepts/bar_magnet_in_uniform_field.json` (the most recent
  Ch.5 straightforward rebuild) — mirror its guided-motion + all-slider-sandbox structure, straightforward
  `misconception_watch` with `visual_counter`, clean narration (no `pause_after_ms`/`wait_for_answer`/
  per-sentence Socratic scaffolding), delta-cue `caption`, one Unicode `formula_overlay`/state.
- **Spec:** `docs/superpowers/specs/2026-07-13-gauss-law-magnetism-design.md` — the 6-state arc table,
  5-misconception mapping (M1→S1, M2→S2, M3→S3, M4→S4, M5→S5), PRIMARY aha = S3, and the two locked
  quality decisions (§4: live crossing tally + S3 body-cutaway) are authoritative.
- **Rules:** 31 (one idea+motion/state, 25–55 EN words, distinct archetypes, explore-last, no Socratic) ·
  32 (cause-first, ≤5-word delta-cue `caption`, home-pose continuity, single glow-focal) · 33d (value-only
  live HUD — the crossing tally) · 34 (one Cambria-Math Unicode `formula_overlay`/state; all math Unicode
  across DOM/graph/sprite paths; overlays never collide, HUD clears the "Full screen" chrome at `top:52px`+) ·
  35 (universal anchor, no country-specific content) · 30 (plain English, expand bare symbols to spoken
  names in narration, colour words English) · 36 (frame-rate-independent — no hardcoded per-frame delta,
  tally stable/identical under `SET_TIME_FREEZE`).
- **Keep** `schema_version: "2.0.0"`, `renderer_pair` both `field_3d`, `scenario_type`
  `gauss_law_magnetism`. **No** `mode_overrides`, **no** `epic_c_branches`, **not** in `PCPL_CONCEPTS`,
  **not** in `PILOT_CONCEPTS`. Drop the old `has_prebuilt_deep_dive`/`allow_deep_dive` flags (dormant).
- **Shared code:** the gm scenario reuses `gaussShapeGeometry`/`gaussBlobGeometry` (also used by the
  electric `gauss_law` scenario). Renderer edits stay INSIDE the gm-specific functions
  (`buildGaussLawMagnetism` / `applyGaussLawMagnetismState` / `updateGaussLawMagnetismFrame`, all gated by
  `scenario_type === "gauss_law_magnetism"`) — **never** edit the shared geometry helpers, or the electric
  gauss scenario regresses.
- **Shared tree:** branch `feat/field3d-draggable-sensor` carries parallel-session WIP. **Path-scoped
  staging only** — `git add <exact files>`, never `git add -A`; never edit `field_3d_renderer.ts` while
  another session holds it uncommitted (diff-first, region-disjoint if a renderer touch is unavoidable —
  memory `no-race-shared-renderer-across-sessions`).
- **Symbols on canvas:** plain Unicode (`∮`, `∇`, `Φ`, `ε₀`, `≠`) — never ASCII (`Phi`, `epsilon0`, `!=`,
  `div`) and never the U+20D7 combining arrow (renders as tofu). Every renderer edit →
  `npm run check:renderer-syntax`; no backticks inside the emitted template body.

## File Structure

| File | Responsibility | Task |
|---|---|---|
| `.agents/proof_run/gauss_law_magnetism_skeleton.md` | architect output (9-section skeleton) | 1 |
| `.agents/proof_run/gauss_law_magnetism_physics_block.md` | physics_author output | 2 |
| `src/data/concepts/gauss_law_magnetism.json` | the rebuilt concept (the product) | 3, 5 |
| `src/config/panelConfig.ts`, `src/lib/aiSimulationGenerator.ts`, `src/lib/intentClassifier.ts` | 8-site registration (verify; already registered) | 3 |
| `supabase_migrations/…seed_gauss_law_magnetism_clusters…sql` | clusters migration (authored-not-applied, N/A-DORMANT) | 3 |
| `src/lib/renderers/field_3d_renderer.ts` | additive gm touches (tally HUD, S3 cutaway, caption/HUD/glow polish) | 5 |
| `src/scripts/_seed_gauss_law_magnetism_cache.ts` | re-seed after restructure (exists) | 4 |
| `PROGRESS.md` | session log | 6 |

---

### Task 1: Architect skeleton

**Files:**
- Create: `.agents/proof_run/gauss_law_magnetism_skeleton.md`

**Interfaces:**
- Consumes: the spec (`docs/superpowers/specs/2026-07-13-gauss-law-magnetism-design.md`).
- Produces: a 9-section markdown skeleton with the exact 6-state arc, per-state motion archetype + ≤5-word
  delta cue, the 5 `misconception_watch` pivots, entry_state_map, prerequisites, universal anchor. This is
  json_author's structural input.

- [ ] **Step 1: Dispatch the `architect` agent.** Prompt it with: concept_id `gauss_law_magnetism`,
  chapter 5; "this is a REBUILD of an existing Socratic concept into a straightforward Rule-31/32/34
  6-state arc — read the spec at `docs/superpowers/specs/2026-07-13-gauss-law-magnetism-design.md` and the
  reference concept `src/data/concepts/bar_magnet_in_uniform_field.json`; produce the skeleton for the 6
  states EXACTLY as the spec's arc table (S1 tracer-circulate 'Closed loops, no ends' … S6 sandbox 'Drag —
  always 0'), PRIMARY aha at S3 ('One pole → still 0', no monopole), 5 misconception_watch entries at
  S1/S2/S3/S4/S5 per the spec's M1–M5 table (consolidate M1→S2 only if S1 reads as pure setup), universal
  Rule-35 anchor (iron filings / compass / cutting a magnet — already culture-neutral). EPIC-L-first, no
  epic_c_branches, conceptual-only (no mode_overrides)."
- [ ] **Step 2: Verify the skeleton.** Confirm it has: 6 states, a distinct motion archetype per state
  (tracer-circulate / surface-envelop / surface-shrink / shape-morph / side-by-side reveal / free explore —
  no repeats), a delta cue per state, aha at S3 (`primary`), the misconceptions mapped as in the spec, an
  entry_state_map (foundational S1–S5, exploration S6, plus the `no_monopole` slice → S3), and a universal
  anchor (no country-specific content). If any state has two ideas or a repeated archetype, send it back to
  architect.
- [ ] **Step 3: Commit.**
  ```bash
  git add .agents/proof_run/gauss_law_magnetism_skeleton.md
  git commit -m "docs(gauss_law_magnetism): architect skeleton (6-state straightforward arc)"
  ```

---

### Task 2: Physics block

**Files:**
- Create: `.agents/proof_run/gauss_law_magnetism_physics_block.md`

**Interfaces:**
- Consumes: Task 1 skeleton + the spec's §1/§4 physics.
- Produces: variable declarations (`surface_shape` 0/1/2, `surface_pos` along-axis — both geometry/demo
  vars, plus the derived crossing counts), the per-state within-state motion timeline (what animates per
  t-window), the **crossing-tally spec** (how Φ_out / Φ_in counts are derived from the loop paths + surface
  geometry so they always balance to net 0 on the magnet, and are asymmetric → q/ε₀ on the S5 electric
  side), the value-only HUD spec per state, and the topological constraints. json_author's physics input.

- [ ] **Step 1: Dispatch the `physics-author` agent** with the Task 1 skeleton. Require: confirm the
  topological invariant — every closed loop crossing OUT of any closed surface also crosses back IN, so the
  crossing tally is always `Φ_out + Φ_in = 0` for the magnet, independent of surface shape/size/position
  (including a surface around one pole: the external emergence is matched by the internal-body return
  crossing). Specify the crossing count as a **line-crossing proxy for flux** (each field line = one equal
  flux quantum; net = 0 by closed-loop topology — there is NO nonzero SI flux value to display, the honest
  readout is the balanced integer count + `net = 0`). For S5, confirm the electric side is genuinely
  asymmetric: a +q enclosed by a surface has all lines piercing OUTWARD (`Φ_out = +N`, `Φ_in = 0`) →
  `∮E·dA = q/ε₀ ≠ 0`. Write the per-state HUD (value-only, Unicode `Φ_out = +N · Φ_in = −N · net = 0`;
  none on S1; S5 shows the two contrast values on the inset). Flag any renderer capability the existing gm
  scenario lacks (expected: the live crossing-tally counter; the S3 body-cutaway brightening).
- [ ] **Step 2: Verify** the invariant independently: on a sphere/cube/blob around the whole magnet the
  external-arch crossings (6 loops × 2 heights = 12 in the current build) are each matched by an
  internal-return crossing → out = in → net 0; around the N pole alone, the emerged external legs are
  matched by the body-return legs → still net 0; the +q sphere gives all-outward → net = q/ε₀. Confirm no
  guided state's tally can be corrupted by an S6 slider (the count is derived from geometry, re-derived per
  state).
- [ ] **Step 3: Commit.**
  ```bash
  git add .agents/proof_run/gauss_law_magnetism_physics_block.md
  git commit -m "docs(gauss_law_magnetism): physics block (crossing-tally invariant + electric contrast)"
  ```

---

### Task 3: JSON authoring + registration

**Files:**
- Modify: `src/data/concepts/gauss_law_magnetism.json` (full rewrite of `epic_l_path` +
  `field_3d_config.states` + `aha_moment` + `entry_state_map`; keep/refresh physics config + `assessment`
  + `coverage_map` — the 6 MCQs already map to STATE_2/3/4/5, which the kept state IDs preserve)
- Verify/Modify: the 8 registration sites (concept already registered — confirm, update any stale refs)
- Create: `supabase_migrations/pilot_YYYYMMDD_seed_gauss_law_magnetism_clusters.sql` (if not already present)

**Interfaces:**
- Consumes: Task 1 skeleton + Task 2 physics block + reference `bar_magnet_in_uniform_field.json`.
- Produces: a schema-valid concept JSON — 6 states, `advance_mode` `manual_click` (guided S1–S5) +
  `interaction_complete` (S6), `misconception_watch` with `visual_counter`, `caption` = ≤5-word delta cue,
  `label` = short headline, one Unicode `formula_overlay`/state, `show_sliders`/`gm.sliders` only on S6,
  and the `field_3d_config.states.gm` flags requesting the tally HUD (`show_tally`) + S3 cutaway.

- [ ] **Step 1: Dispatch the `json-author` agent** with both proof-run artifacts + the spec. Require: full
  rewrite of the state arc per the spec; **strip ALL Socratic fields** (`wait_for_answer`, `auto_after_tts`,
  `pause_after_ms`, `reveal_at_tts_id`, and the unrendered `annotation`-type `scene_composition` overlays —
  replace with real `field_3d_config.states.{caption,label,formula_overlay}`); `caption` = the ≤5-word
  delta cues ("Closed loops, no ends" / "Out equals in" / "One pole → still 0" / "Shape doesn't matter" /
  "Electric law ≠ 0" / "Drag — always 0"); one Unicode `formula_overlay`/state (S1 none-or-small, S2
  `∮B·dA = 0`, S3 `no monopole → net Φ_B = 0`, S4 `∮B·dA = 0  (any surface)`, S5 `∮B·dA = 0  vs  ∮E·dA =
  q/ε₀`, S6 `live net Φ_B = 0`); value-only HUD flags; `gm` mode per state (loops/whole/pole/morph/contrast/
  sandbox) + `gm.show_tally` on S2/S3/S4/S6 + a `gm.cutaway` (or equivalent) flag on S3; keep the 6
  assessment MCQs (already STATE_2/3/4/5); author the clusters SQL (N/A-DORMANT). Verify all 8 registration
  sites still resolve (panelConfig:1341, aiSimulationGenerator:2894+:4308, intentClassifier:435+:931).
- [ ] **Step 2: Typecheck.** Run: `npx tsc --noEmit` — Expected: 0 errors.
- [ ] **Step 3: Validate.** Run: `npm run validate:concepts` — Expected: target `gauss_law_magnetism`
  PASSES (Rule 15 ≥2 advance_mode, Rule 19 ≥3 primitives/state, Gate 12 ≥2 distinct advance_mode, Gates
  19/20 coverage+quiz on the carried-over assessment, word budget within self-scoping). Fix and re-run
  until green.
- [ ] **Step 4: Grep for leftover Socratic/ASCII.** Run:
  `grep -nE "wait_for_answer|auto_after_tts|pause_after_ms|reveal_at_tts_id" src/data/concepts/gauss_law_magnetism.json`
  — Expected: no matches. Then scan `formula_overlay`/`caption`/`label` for ASCII math (`Phi`, `epsilon`,
  `!=`, `->`, `div`, `B.dA`) — Expected: none (all Unicode). Confirm no `annotation`-type scene_composition
  survives as the on-canvas text source.
- [ ] **Step 5: Commit.**
  ```bash
  git add src/data/concepts/gauss_law_magnetism.json supabase_migrations/pilot_*_seed_gauss_law_magnetism_clusters.sql
  # + any registration-site file that genuinely changed (diff-first; path-scoped)
  git commit -m "feat(gauss_law_magnetism): rebuild to Rule 31/32/34 straightforward 6-state arc"
  ```

---

### Task 4: THE EYE + eye-walker + quality_auditor

**Files:** none written (read-only gate); may produce `engine_bug_queue` candidate rows.

**Interfaces:**
- Consumes: the committed JSON (Task 3) + a running dev server / seeded cache.
- Produces: a per-state visual verdict + a quality_auditor PASS/FAIL (+ FAIL routing target) + any renderer
  bug rows for Task 5.

- [ ] **Step 1: Clear cache** (4 separate DELETEs, never batched — CLAUDE.md §6): `simulation_cache`,
  `lesson_cache`, `response_cache`, `session_context`. Re-seed:
  `npx tsx --env-file=.env.local src/scripts/_seed_gauss_law_magnetism_cache.ts` (curl bypass if node fetch
  is flaky — memory `feedback_node_fetch_flaky_curl_bypass`).
- [ ] **Step 2: Run THE EYE.** Run: `npm run visual:eyes -- gauss_law_magnetism` — Expected: it dumps
  deterministic frozen + dense frames per state, $0. Note the run dir under `.visual_runs/`.
- [ ] **Step 3: Dispatch `eye-walker` and `quality-auditor` IN PARALLEL** (one message, two Agent calls —
  eye-walker reads ALL frames in its own context and returns a per-state verdict table + ≤5 founder frames
  + candidate bug rows; quality-auditor runs gates 0–20 against the JSON + dev server). Main session never
  loads the ~100 PNGs. Tell eye-walker to specifically check: the S2/S3/S4 crossing tally reads a balanced
  `net = 0`; the S3 body-cutaway internal return is visibly INSIDE the shrunk surface (compute projected
  screen position — memory `renderer-driver-misses-viewport-bugs`); one glow focal per state; delta-cue
  captions render; Unicode clean (no tofu/ASCII); the S5 inset labels are Unicode-clean.
- [ ] **Step 4: Triage.** If both are clean → Task 6. If eye-walker flags a visual defect or
  quality-auditor FAILs a gate → Task 5 (the two decided renderer additions — tally HUD + S3 cutaway — are
  expected here if the JSON's `gm` flags aren't yet honored by the renderer). Log any real defect to
  `engine_bug_queue` (OPEN) before fixing (memory `feedback_recording_to_engine_bug_queue`).

---

### Task 5: Renderer touches (tally HUD + S3 cutaway + Rule-34 polish; via quality_auditor FAIL-route)

**Files:**
- Modify: `src/lib/renderers/field_3d_renderer.ts` (additive, INSIDE the gm-specific functions, gated by
  `scenario_type === "gauss_law_magnetism"` and the new `gm.*` flags — zero regression to the electric
  `gauss_law` scenario and every other field_3d concept)

**Interfaces:**
- Consumes: quality_auditor / eye-walker findings + the JSON's `gm.show_tally` / `gm.cutaway` flags.
- Produces: (a) the live crossing-tally HUD, (b) the S3 body-cutaway brightening, (c) any incidental
  Rule-34 caption/HUD/glow polish — verified by re-running THE EYE.

- [ ] **Step 1: Diff-first shared-tree check.** Run `git status src/lib/renderers/field_3d_renderer.ts` —
  if another session holds it uncommitted, STOP and surface to founder (memory
  `no-race-shared-renderer-across-sessions`); else proceed with region-disjoint edits confined to the gm
  functions.
- [ ] **Step 2 (decision A): live crossing-tally HUD.** In `updateGaussLawMagnetismFrame`, when
  `gm.show_tally`, derive `Φ_out` / `Φ_in` from the loop paths + current surface geometry (count how many
  `gmLoopPaths` cross the surface boundary outward vs inward for the current shape/R/offset) — a **pure
  function of geometry**, not a per-frame accumulator (Rule 36), so it is identical under `SET_TIME_FREEZE`
  and THE EYE frozen frames stay byte-stable. Render into the restyled value-only `gm_readout`
  (`Φ_out = +N · Φ_in = −N · net = 0`, Cambria-Math Unicode, `top:52px`+ to clear the "Full screen"
  chrome). On the S5 contrast the electric side is all-outward (`Φ_in = 0` → `q/ε₀`).
- [ ] **Step 3 (decision B): S3 body-cutaway brightening.** In `applyGaussLawMagnetismState`, when
  `gm.mode === "pole"` (and/or `gm.cutaway`), promote `gm_internal` + `gm_internal_dot` to the bright glow
  focal INSIDE the shrunk surface and dim the external arcs slightly (single focal, Rule 32e/29 —
  brightness only via emissiveIntensity, never a size pulse). Verify the internal return reads as inside
  the surface from the ACTUAL EYE pixels (projected screen position), not the node driver.
- [ ] **Step 4: Renderer syntax guard.** Run: `npm run check:renderer-syntax` — Expected: node --check
  passes on both emitted template bodies (no backtick-terminates-template bug). Then `npx tsc --noEmit` —
  Expected: 0.
- [ ] **Step 5: Re-run THE EYE + re-dispatch eye-walker** on the affected states — Expected: clean, and the
  electric `gauss_law` scenario (if it has locked baselines) shows H2 0.00% after reseed (gm-gated,
  additive-only proof). Loop Task 4↔5 until EYE-clean, zero new bug rows.
- [ ] **Step 6: Commit.**
  ```bash
  git add src/lib/renderers/field_3d_renderer.ts src/data/concepts/gauss_law_magnetism.json
  git commit -m "fix(gauss_law_magnetism): renderer touches (live crossing tally + S3 body-cutaway + Rule-34 HUD)"
  ```

---

### Task 6: Founder review → visual:approve → Telugu → ship

**Files:**
- Modify: `src/data/concepts/gauss_law_magnetism.json` (add `text_te`), `PROGRESS.md`
- Create: `visual_baselines/gauss_law_magnetism/` (via `visual:approve`, founder-triggered)

**Interfaces:**
- Consumes: an EYE-clean concept + founder OK.
- Produces: locked baselines, Telugu text, a review link, a PROGRESS log entry.

- [ ] **Step 1: Present ≤5 founder frames + review link.** Run `npm run build:review -- gauss_law_magnetism`,
  serve on :8080 (detached — memory `feedback_detached_process_for_long_tasks`), give
  `http://localhost:8080/gauss_law_magnetism/`. Founder hand-tests the S6 sandbox slider drags (reshape +
  slide the surface, even onto one pole → live net Φ_B stays 0; THE EYE can't fire trusted drags).
- [ ] **Step 2: Founder triggers `npm run visual:approve -- gauss_law_magnetism`** (a text/HUD de-clutter
  is an *expected* H2 baseline fail — Rule 34e; re-baseline, not a fix cycle). Do NOT run this without the
  founder's explicit OK.
- [ ] **Step 3: Telugu `text_te` via a `model: sonnet` sub-agent** (Rule 30g code-mix — technical terms
  Latin, no transliteration, expand bare symbols to spoken names — "magnetic field B", "magnetic flux",
  "electric field E", "charge q", "epsilon-nought"; colour words English). Write `text_te` structurally
  into every `tts_sentences` entry. `npx tsc --noEmit` + `validate:concepts` stay green.
- [ ] **Step 4: EN audio ON-DEMAND (Rule 30h).** Render EN audio
  (`npm run tts:generate -- gauss_law_magnetism --langs=en`) only if the pilot needs narration for this
  concept; the sim is a silent visual by default. Skip speculative rendering.
- [ ] **Step 5: PROGRESS.md** session log (what completed, files changed, gates, next = `earths_magnetism`
  (#4, the last Ch.5 rebuild)). Commit.
  ```bash
  git add src/data/concepts/gauss_law_magnetism.json visual_baselines/gauss_law_magnetism/ PROGRESS.md
  git commit -m "feat(gauss_law_magnetism): Telugu text_te + locked EYE baselines + PROGRESS"
  ```

---

## Self-Review

**Spec coverage:** S1–S6 arc (spec §3) → Tasks 1/3; 5 misconceptions M1–M5 (spec §2) → Task 1/3; PRIMARY
aha S3 (spec §3) → Task 1/3; decision A live crossing tally (spec §4A) → Task 2 (spec) + Task 5 step 2;
decision B S3 body-cutaway (spec §4B) → Task 5 step 3; on-canvas Unicode/one-formula/value-HUD/delta-cue
caption (spec §5, Rule 34) → Task 3 steps 1+4 / Task 5 step 2; universal anchor (spec §6, Rule 35) → Task
1 step 2; renderer touches (spec §7) → Task 5; physics/crossing-invariant re-verify (spec §1/§4) → Task 2;
8-site registration + schema + carried assessment (spec §8) → Task 3; verification+ship (spec §9) → Tasks
4/6; out-of-scope drops (deep-dive flags, mode_overrides, epic_c_branches — spec §10) → Global Constraints
+ Task 3. No gaps.

**Placeholder scan:** commands and expected outputs are concrete; the only deliberate conditional is Task
5 (renderer touches "via quality_auditor FAIL-route") — the two additions are decided (tally HUD, S3
cutaway) and WILL be needed, but are validated/triggered through the EYE→auditor loop per the pipeline
discipline (agent-teams-reference Rule 3), not a placeholder.

**Type consistency:** state IDs S1–S6 / STATE_1–STATE_6, `misconception_watch`+`visual_counter`,
`caption`/`label`/`formula_overlay`, `gm.show_tally`/`gm.cutaway`/`gm.mode`, `gm_readout`/`gm_internal`/
`gmLoopPaths`, `SET_TIME_FREEZE` used consistently across tasks and matching the spec and the existing
renderer symbols.
