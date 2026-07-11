# Kirchhoff Junction Rule (KCL) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Author the `kirchhoff_junction_rule_KCL` concept diamond (Ch.3, catalog c15) as a 5-state `particle_field` circuit simulation proving Σi_in = Σi_out, through the full Alex authoring pipeline to a founder-reviewable state.

**Architecture:** This is **data authoring, not app code.** Pre-built TypeScript renderers do all rendering/physics; the pipeline writes *configuration only* (a concept JSON + registrations), never rendering code (Rule 5/17/18). The four Alex agents run **sequentially** (architect → physics-author → json-author → quality-auditor), each output feeding the next; the auditor FAIL-routes back upstream (or to `peter_parker:*` for engine changes — never cold-called). Verification gates replace unit tests: `npx tsc --noEmit`, `npm run validate:concepts`, and THE EYE visual gate.

**Tech Stack:** Next.js 16 / React 19 / TypeScript · Zod concept schema (`src/schemas/conceptJson.ts`) · `particle_field` renderer (p5.js circuit family) · Supabase (`dxwpkjfypzxrzgbevfnx`) · THE EYE (`visual_eyes.ts` + eye-walker agent).

## Global Constraints

- **Concept id:** `kirchhoff_junction_rule_KCL` (exact, used at all 8 registration sites)
- **Renderer:** `particle_field` — NOT field_3d (Ch.3 is 2D, founder 2026-07-08), NOT PCPL
- **Atomic claim:** Σi_in = Σi_out at any junction; charge conserved, nothing accumulates
- **5 states:** S1 no-pile-up · S2 equal split · S3 misconception beat (unequal, sum conserved) · S4 generalize Σi_in=Σi_out · S5 explore (`interaction_complete`)
- **PRIMARY aha:** S3 — split looks broken (1.5A vs 0.5A) but A_in and A_out both still read 2.0A
- **`misconception_watch` at S3 pivot ONLY** (not per-state): "current gets used up" + "current always splits equally"
- **Rule 31:** narration 25–55 EN words/guided state; declared motion archetype + ≤5-word delta cue per state; no archetype repeat except the S2↔S3 declared contrast pair; no static state; explore-last; ≥2 distinct advance_mode (Gate 12); never `wait_for_answer` (legacy) / no Socratic predict→reveal
- **Rule 16a:** confront the wrong belief via a straightforward contrast beat (show naive expectation's consequence, then the real physics) — NOT predict-pause
- **Rule 19:** every state `scene_composition.primitives.length ≥ 3`
- **Rule 24/34:** on-canvas text = labels/equations + ≤5-word delta-cue caption only; prose narration in the strip BELOW canvas; ONE Unicode formula surface + value-only HUD; reads sound-off
- **Rule 33:** dual-level — beads (micro, no accumulation) + ammeters (macro reading) in the same frame
- **Rule 35:** universal culture-neutral anchor (wall socket → power strip); plain English, no Hinglish, no country/brand/festival/currency reference in ANY rendered/narrated text
- **particle_field glow enum is CLOSED:** electrons | lattice | field | drift_arrow | current_meter | formula — a non-keyed `glow_focal` silently dims the panel (add a key in-engine only via peter_parker if node/ammeter glow needs one)
- **Cache clear before EVERY test:** 4 SEPARATE queries — `DELETE FROM simulation_cache;` `DELETE FROM lesson_cache;` `DELETE FROM response_cache;` `DELETE FROM session_context;` (never batch)
- **NEVER delete sacred tables:** student_confusion_log, ncert_content, ai_usage_log, tts caches, pyq_questions, physics_concept_map, concept_panel_config, feedback tables
- **Not added to `PILOT_CONCEPTS`** (reviewer-first, novel-renderer flag)
- **Audio (Rule 30h):** Telugu TEXT always (via `model: sonnet` sub-agent, Rule 30g — NEVER `npm run tts:translate`); audio ON-DEMAND only, not a ship/catalog gate

---

### Task 1: Architect skeleton

**Files:**
- Create: `docs/superpowers/plans/artifacts/kirchhoff_junction_rule_KCL-architect.md` (the architect's markdown skeleton, working artifact)
- Read: `docs/superpowers/specs/2026-07-11-kirchhoff-junction-rule-kcl-design.md`, `docs/exports/chapters/chapter-34-current-electricity.md` (c15 row)

**Interfaces:**
- Consumes: the approved spec (§1 atomic claim, §5 state arc + control table, §4 apparatus/anchor, §3 scope IN/OUT)
- Produces: 9-section skeleton — atomic claim · state count (5) + EPIC-L arc · Rule 16a misconception beat (S3, the two beliefs) · entry_state_map · prerequisites (`electric_current`) · universal anchor (wall socket → power strip, Rule 35) · deep-dive/drill-down picks (drill-down deferred) · the Rule-31 per-state control table (state × teaches × archetype × delta × controls × duration)

- [ ] **Step 1: Dispatch the architect agent**

Dispatch `Agent(subagent_type="architect")` with prompt: "Author the skeleton for concept `kirchhoff_junction_rule_KCL`, Chapter 3 (Current Electricity), from the approved spec at `docs/superpowers/specs/2026-07-11-kirchhoff-junction-rule-kcl-design.md`. Follow the spec's 5-state arc and Rule-31 control table exactly (S1 no-pile-up / S2 equal split / S3 misconception beat / S4 generalize / S5 explore). Anchor is the universal wall-socket→power-strip (Rule 35, culture-neutral). Misconception_watch at S3 only. Emit the 9-section markdown skeleton."

- [ ] **Step 2: Verify skeleton completeness**

Check the returned skeleton has all 9 sections, 5 states, the S2↔S3 contrast pair declared, the anchor is culture-neutral (no country/brand), and the per-state control table is present. If any section is missing or the arc deviates from the spec, re-dispatch architect with the specific gap named.

- [ ] **Step 3: Save the skeleton artifact**

Write the architect's output to `docs/superpowers/plans/artifacts/kirchhoff_junction_rule_KCL-architect.md` (no commit yet — artifacts commit with the concept in Task 3).

---

### Task 2: Physics-author block

**Files:**
- Modify/append: `docs/superpowers/plans/artifacts/kirchhoff_junction_rule_KCL-architect.md` (append the physics block)
- Read: `src/data/concepts/combination_of_resistors.json` (engine reference — split-by-conductance ammeter config), `src/data/concepts/electrical_power_in_resistor.json` (most recent circuit-family config shape)

**Interfaces:**
- Consumes: Task 1 skeleton
- Produces: physics block — variables (I, I₁, I₂, R₁, R₂, with units/min/max/defaults so equal branches give 2A=1A+1A and S3 gives 1.5A/0.5A) · formulas (Σi_in = Σi_out; current divider I₁ = I·R₂/(R₁+R₂) as the number source, NOT a taught derivation) · per-state within-state reveal timeline (what animates per t-window, driven by which variable) · per-state control spec (S3: R₁/R₂ sliders; S5: all) · physical constraints (I_in = I_out exactly at every slider setting)

- [ ] **Step 1: Dispatch the physics-author agent**

Dispatch `Agent(subagent_type="physics-author")` with prompt: "Rigor-check and write the physics block for `kirchhoff_junction_rule_KCL` from the architect skeleton at `docs/superpowers/plans/artifacts/kirchhoff_junction_rule_KCL-architect.md`. Choose R/I defaults so: S2 equal branches → A_in=2.0A, A₁=A₂=1.0A, A_out=2.0A; S3 unequal (lower R₂) → e.g. 1.5A + 0.5A summing to 2.0A. Declare the within-state reveal timeline per state and the per-state live controls (Rule 31). Constraint: the four ammeters must satisfy A_in = A₁ + A₂ = A_out at EVERY slider setting. Reference the split-by-conductance config in `combination_of_resistors.json`."

- [ ] **Step 2: Verify physics rigor**

Confirm: numeric defaults produce clean readable ammeter values (2/1/1, 1.5/0.5); the current-divider math is correct (branch current ∝ conductance = 1/R); the sum invariant holds at slider extremes; each guided state's reveal timeline names a motion driven by a real variable. If wrong, re-dispatch physics-author with the error.

---

### Task 3: JSON-author — concept JSON + 8 registration sites

**Files:**
- Create: `src/data/concepts/kirchhoff_junction_rule_KCL.json`
- Create: `supabase_migrations/supabase_2026-07-11_seed_kirchhoff_junction_rule_KCL_clusters_migration.sql` (authored-not-applied)
- Create: `src/scripts/_seed_kirchhoff_junction_rule_KCL_cache.ts` (or the project's seed pattern) storing `physics_config = { epic_l_path, particle_field_config }`
- Modify: `src/config/panelConfig.ts` (CONCEPT_PANEL_MAP) · `src/lib/aiSimulationGenerator.ts` (CONCEPT_RENDERER_MAP → particle_field) · `src/lib/intentClassifier.ts` (VALID_CONCEPT_IDS + CLASSIFIER_PROMPT + ASPECT_VOCABULARY)
- Read: the Task 1+2 artifact; `src/schemas/conceptJson.ts` (the Zod gates)

**Interfaces:**
- Consumes: the combined skeleton + physics block artifact
- Produces: a schema-valid `kirchhoff_junction_rule_KCL.json` with top-level `particle_field_config` (mirrors field_3d_config shape, rides Zod passthrough) + `epic_l_path`; all 8 registration sites wired

- [ ] **Step 1: Dispatch the json-author agent**

Dispatch `Agent(subagent_type="json-author")` with prompt: "Write `src/data/concepts/kirchhoff_junction_rule_KCL.json` from the skeleton+physics artifact at `docs/superpowers/plans/artifacts/kirchhoff_junction_rule_KCL-architect.md`, and register at all 8 sites (panelConfig, CONCEPT_RENDERER_MAP→particle_field, VALID_CONCEPT_IDS, CLASSIFIER_PROMPT+ASPECT_VOCABULARY, clusters SQL migration [authored-not-applied], seed cache script; NOT PCPL_CONCEPTS; NOT PILOT_CONCEPTS). Author `particle_field_config` reusing the circuit family (split-by-conductance beads + drawAmmeterAtC + drawResistorBoxC + drawEmfCell). 5 states per the control table. Every state ≥3 primitives (Rule 19). ≥2 distinct advance_mode (Gate 12). glow_focal keys from the CLOSED enum only — if node/ammeter needs a new glow key, STOP and flag for peter_parker, do not invent a key. On-canvas = ≤5-word delta cue + one Unicode formula surface + value-only ammeter HUD (Rule 24/34); prose narration in tts_sentences. Universal anchor only (Rule 35). Iterate until `npx tsc --noEmit` and `npm run validate:concepts` both pass."

- [ ] **Step 2: Run typecheck**

Run: `npx tsc --noEmit`
Expected: 0 errors. If errors, hand back to json-author with the tsc output.

- [ ] **Step 3: Run the concept validator**

Run: `npm run validate:concepts`
Expected: `kirchhoff_junction_rule_KCL` PASSES all gates (12 advance_mode, 16a misconception, 19 ≥3 primitives, 24/34 text discipline, 31 archetypes/word-budget, 35 anchor). If a gate fails, hand back to json-author (or physics-author if it's a physics gap) with the named gate.

- [ ] **Step 4: Commit the concept + artifacts**

```bash
git add src/data/concepts/kirchhoff_junction_rule_KCL.json \
  supabase_migrations/supabase_2026-07-11_seed_kirchhoff_junction_rule_KCL_clusters_migration.sql \
  src/scripts/_seed_kirchhoff_junction_rule_KCL_cache.ts \
  src/config/panelConfig.ts src/lib/aiSimulationGenerator.ts src/lib/intentClassifier.ts \
  docs/superpowers/plans/artifacts/kirchhoff_junction_rule_KCL-architect.md \
  docs/superpowers/specs/2026-07-11-kirchhoff-junction-rule-kcl-design.md \
  docs/superpowers/plans/2026-07-11-kirchhoff-junction-rule-kcl.md
git commit -m "feat(catalog): author kirchhoff_junction_rule_KCL (Ch.3 c15) — 5-state KCL diamond on particle_field"
```

---

### Task 4: Quality-auditor gate

**Files:**
- Read-only: the concept JSON + registrations + dev server at localhost:3000

**Interfaces:**
- Consumes: the committed concept JSON
- Produces: PASS/FAIL verdict with per-gate evidence; on FAIL, names ONE upstream agent to return to (alex:json-author / alex:physics-author / alex:architect) or `[owner: peter_parker:*]` for an engine change

- [ ] **Step 1: Clear cache (4 separate queries)**

Run the cache-clear (skill `cache-clear` or 4 separate DELETEs): `DELETE FROM simulation_cache;` then `DELETE FROM lesson_cache;` then `DELETE FROM response_cache;` then `DELETE FROM session_context;`

- [ ] **Step 2: Ensure dev server is up**

Run: `npm run dev` (detached — Start-Process cmd.exe so it survives turn end per the detached-process memory). Confirm localhost:3000 responds.

- [ ] **Step 3: Dispatch the quality-auditor agent**

Dispatch `Agent(subagent_type="quality-auditor")` with prompt: "Audit `kirchhoff_junction_rule_KCL` against hard gates 0–20 + Rule 31/32/33/34/35 discipline, dual-path live visual walk at localhost:3000. Note: the Gate-8 confusion_cluster_registry probe is N/A-DORMANT this phase (migration authored-not-applied, drill-down deferred) — do NOT false-FAIL on it. Report PASS/FAIL with per-gate evidence and, on FAIL, route to exactly one upstream agent or peter_parker."

- [ ] **Step 4: Route any FAIL**

If FAIL: hand the auditor's named routing back to that agent (Task 3 json-author, Task 2 physics-author, Task 1 architect, or — for a §6 engine risk like the S3 ghost overlay / S4 third branch / a new glow key — let the auditor's `[owner: peter_parker:*]` tag drive a peter_parker dispatch; never cold-call the engine cluster). Re-run Task 4 after the fix. Expected terminal state: PASS.

---

### Task 5: THE EYE visual gate

**Files:**
- Generates: `.visual_runs/kirchhoff_junction_rule_KCL/` frame dumps

**Interfaces:**
- Consumes: the PASS-verified concept
- Produces: per-state verdict table (from eye-walker) + ≤5 founder frames + zero new engine_bug_queue rows → founder approval → baseline lock

- [ ] **Step 1: Run THE EYE frame capture**

Run: `npm run visual:eyes -- kirchhoff_junction_rule_KCL` (detached if long). Produces the frame dump. Retry once on the known flaky Node-fetch/libuv cache-read failure (memory `feedback-node-fetch-flaky-curl-bypass`).

- [ ] **Step 2: Dispatch eye-walker to read frames**

Dispatch `Agent(subagent_type="eye-walker")` with prompt: "Read ALL dumped frames for `kirchhoff_junction_rule_KCL` in `.visual_runs/`. Return a per-state verdict table (does each state's declared delta show? S1 no-pileup / S2 equal-split ammeters 2=1+1 / S3 uneven 1.5+0.5 with sum still 2 + naive ghost struck through / S4 generalize / S5 explore), ≤5 frame paths for founder eyes, and candidate engine_bug_queue rows. Judge field content from __frozen.png not dense frames. Curate only — do not approve." **Never read the ~100 PNGs in the main session.**

- [ ] **Step 3: Triage bugs**

If eye-walker surfaces new defects: log each to `engine_bug_queue` (OPEN) first, then route the fix (json-author for content-class, peter_parker via auditor for engine-class), re-run THE EYE. Target: zero new engine_bug_queue rows.

- [ ] **Step 4: Founder review + approve**

Present the ≤5 eye-walker frames + verdict table + the review link (below) to the founder. On founder OK ONLY: `npm run visual:approve -- kirchhoff_junction_rule_KCL` (baseline lock). `visual:approve` is **founder-triggered** — never self-approve.

---

### Task 6: Review link + Telugu text + wrap-up

**Files:**
- Modify: `src/data/concepts/kirchhoff_junction_rule_KCL.json` (add `text_te` per sentence)
- Update: `PROGRESS.md` (session log per §9)

**Interfaces:**
- Consumes: the approved concept
- Produces: served review link, Telugu text authored, PROGRESS updated

- [ ] **Step 1: Build + serve the review site**

Run: `npm run build:review -- kirchhoff_junction_rule_KCL`, then serve on port 8080 (detached). Provide `http://localhost:8080/kirchhoff_junction_rule_KCL/` to the founder (per the provide-review-link memory).

- [ ] **Step 2: Author Telugu text (Sonnet-5 sub-agent, Rule 30g)**

Dump each state's `text_en` → dispatch `Agent(model="sonnet")` to return code-mixed `text_te` under Rule-30 constraints (technical/English terms stay Latin, never transliterate, expand bare symbols to spoken names, colour words English) → write `text_te` structurally into the JSON. **NEVER `npm run tts:translate`.** Audio is on-demand (Rule 30h) — do NOT render audio unless the founder asks; `text_te` presence is the portability requirement only.

- [ ] **Step 3: Re-validate after text_te edit**

Run: `npx tsc --noEmit` then `npm run validate:concepts`
Expected: both pass (text_te is additive). Commit: `git add src/data/concepts/kirchhoff_junction_rule_KCL.json && git commit -m "feat(catalog): kirchhoff_junction_rule_KCL Telugu text (Rule 30g, audio on-demand)"`

- [ ] **Step 4: Update PROGRESS.md**

Append a session entry: what completed (KCL authored + audited + EYE-approved), files changed, current Ch.3 status (8 diamonds), next session's first task (KVL / `kirchhoff_loop_rule_KVL`), any blockers (engine risks that surfaced), CLAUDE.md suggestions if any. Commit.

---

## Self-Review

**Spec coverage:** §1 claim → Task 1/2 · §3 scope → Task 1 (IN/OUT) + Task 3 (OUT enforced by omission) · §4 apparatus/anchor → Task 1 (anchor) + Task 3 (four-ammeter config) · §5 state arc + control table → Task 1 (arc) + Task 2 (timeline) + Task 3 (JSON) · §6 engine risk → Task 4 (auditor route) + Task 5 (EYE) · §7 registration → Task 3 (8 sites) · §8 done-list → Tasks 3–6 (tsc/validate/EYE/review link/Telugu) · §9 pipeline → task ordering. No gaps.

**Placeholder scan:** No TBD/TODO. The migration filename date is fixed (2026-07-11). Ammeter numeric defaults (2/1/1, 1.5/0.5) are concrete. advance_mode is finalized by physics/json-author within the Gate-12 constraint (≥2 distinct, no wait_for_answer) — named, not vague.

**Type consistency:** concept id `kirchhoff_junction_rule_KCL` identical across all 6 tasks and all 8 sites. Config key `particle_field_config` consistent. Seed physics_config shape `{ epic_l_path, particle_field_config }` matches the Ch.3 memory. glow enum treated as CLOSED in both Global Constraints and Task 3.

**Note on task shape:** tasks are pipeline stages, not TDD red-green — the "test" at each stage is tsc / validate:concepts / auditor / THE EYE, which is the project's actual verification model (no unit-test suite exists). Each task ends with an independently checkable deliverable and gate.
