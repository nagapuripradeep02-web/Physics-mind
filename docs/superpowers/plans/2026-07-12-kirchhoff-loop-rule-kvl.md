# Kirchhoff Loop Rule (KVL) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Author `kirchhoff_loop_rule_KVL` (Ch.3, catalog c16) as a 5-state `particle_field` circuit simulation proving ΣV=0 around a loop (potential-ladder walk), through the full Alex pipeline to a founder-reviewable state.

**Architecture:** Data authoring, not app code. The four Alex agents run sequentially (architect → physics-author → json-author → quality-auditor); the auditor FAIL-routes upstream (or to `peter_parker:*` for the engine adds — never cold-called). Verification gates replace unit tests: `npx tsc --noEmit`, `npm run validate:concepts`, THE EYE. Sibling of the shipped `kirchhoff_junction_rule_KCL`; reuses the same upgraded circuit engine + patterns.

**Tech Stack:** Next.js/React/TypeScript · Zod concept schema · `particle_field` renderer (p5.js circuit family, potential-ladder primitives) · Supabase · THE EYE + eye-walker.

## Global Constraints

- **Concept id:** `kirchhoff_loop_rule_KVL` (exact, all 8 sites)
- **Renderer:** `particle_field` circuit family — NOT field_3d, NOT PCPL. Keep a circuit-family scenario_type (reuse `emf_definition`-class handling / gated flags); do NOT mint a new scenario_type.
- **Atomic claim:** ΣV = 0 around a closed loop; +ε rise at the cell, −IR drop at each resistor, returns to start (energy conservation). Ideal cell: ε = IR₁ + IR₂.
- **Verified numbers:** ε=6V, R₁=2Ω, R₂=1Ω → I=2A, V₁=4V, V₂=2V (4+2=6=ε; +6−4−2=0). STATE_4 third resistor R₃ chosen so drops sum to ε (physics-author confirms clean values).
- **5 states:** S1 round-trip=0 · S2 rise=total drops · S3 misconception beat (signs / no leftover) · S4 generalize (3rd resistor) · S5 explore.
- **PRIMARY aha:** S3 — the staircase returns EXACTLY to start; signs close the loop; naive "6+4+2=12" ladder shoots up and never returns vs signed "6−4−2=0".
- **`misconception_watch` at S3 ONLY** — beliefs: "there's leftover voltage after the drops" + "you add all voltages regardless of direction".
- **Rule 31:** narration 25–55 EN words/guided state; declared motion archetype + ≤5-word delta cue per state; no archetype repeat except S2↔S3; no static state; explore-last; ≥2 advance_mode (Gate 12); never `wait_for_answer`; no Socratic predict→reveal.
- **Rule 16a:** straightforward contrast beat at S3 (naive consequence → real physics), no predict-pause.
- **Rule 19:** every state `scene_composition.primitives.length ≥ 3`.
- **Rule 24/34:** on-canvas caption = ≤5-word delta cue only; prose in tts_sentences text_en; ONE Unicode formula surface (ΣV = 0); value-only voltmeter/HUD; reads sound-off. All math Unicode (Σ, ε, Ω, −, ×).
- **Rule 33:** dual-level — ladder + voltmeters (macro, live numeric + walking marker as needle) with beads flowing ∝ I (micro) in the same frame.
- **Rule 35:** universal culture-neutral anchor (hiking loop trail → series lamp loop); plain English, no Hinglish, no country/brand.
- **Engine adds gated behind new per-state flags → zero regression** to emf_definition / internal_resistance / combination_of_resistors / electric_power (verify default paths unchanged). Reuse `drawStruckTextC` (KCL) for the ghost; add a `kvl_sum_readout` sibling of `kcl_sum_readout`.
- **Cache clear before EVERY test:** 4 SEPARATE DELETEs (simulation_cache, lesson_cache, response_cache, session_context) — never batch. **NEVER delete sacred tables.**
- **Not added to `PILOT_CONCEPTS`** (reviewer-first). Telugu TEXT via Sonnet-5 sub-agent (Rule 30g); audio on-demand (Rule 30h).

---

### Task 1: Architect skeleton

**Files:** Create `docs/superpowers/plans/artifacts/kirchhoff_loop_rule_KVL-architect.md`. Read the spec `docs/superpowers/specs/2026-07-12-kirchhoff-loop-rule-kvl-design.md` + the KCL sibling artifacts (`kirchhoff_junction_rule_KCL-architect.md`) for shape.

**Interfaces:** Consumes the approved spec. Produces the 9-section skeleton (atomic claim · 5-state EPIC-L arc + Rule-31 control table · Rule 16a misconception beat at S3 · entry_state_map · prerequisites (emf_definition, internal_resistance) · universal anchor (hiking loop → series lamp) · deep-dive/drill-down deferred picks · DoD).

- [ ] **Step 1: Dispatch architect** — `Agent(subagent_type="architect")` with the spec path + the 5-state arc/apparatus/anchor verbatim; emit the 9-section skeleton.
- [ ] **Step 2: Verify** — 9 sections, 5 states, S2↔S3 contrast declared, anchor culture-neutral, control table present. Re-dispatch on any gap.
- [ ] **Step 3: Save** the skeleton to the artifact path.

---

### Task 2: Physics-author block

**Files:** Create `docs/superpowers/plans/artifacts/kirchhoff_loop_rule_KVL-physics.md`. Read the Task-1 skeleton + spec + `src/data/concepts/emf_definition.json` and `internal_resistance.json` (potential-ladder config shape) + `kirchhoff_junction_rule_KCL.json` (the sum-readout/ghost pattern).

**Interfaces:** Consumes Task-1 skeleton. Produces the physics block — variables (ε, R₁, R₂, R₃, derived I, V₁, V₂, V₃) with units/min/max/defaults; formulas (ΣV=0; I=ε/ΣR; Vₖ=IRₖ); per-state ladder/voltmeter reveal timeline; per-state controls (S3 R₁+R₂, S5 all); constraints (ΣV=0 at every setting; drops sum to ε); STATE_4 clean R₃ values; the dormant cluster trigger phrases.

- [ ] **Step 1: Dispatch physics-author** — verify ε=6/R₁=2/R₂=1 → I=2A, V₁=4, V₂=2 (sum 6); pick STATE_4 R₃ giving clean drops summing to ε; declare the ladder-step + voltmeter timeline per state (cause-first per Rule 32a); S3 ghost = fixed "6 + 4 + 2 = 12" vs live "6 − 4 − 2 = 0".
- [ ] **Step 2: Verify** the arithmetic (ΣV=0 invariant at slider extremes; Vₖ=IRₖ), reveal timelines name a real driven variable per state. Re-dispatch on error.

---

### Task 3: JSON-author — concept JSON + 8 registration sites (+ engine adds if needed)

**Files:** Create `src/data/concepts/kirchhoff_loop_rule_KVL.json`, `supabase_migrations/supabase_2026-07-12_seed_kirchhoff_loop_rule_KVL_clusters_migration.sql`, `src/scripts/_seed_kirchhoff_loop_rule_KVL_cache.ts`. Modify `src/config/panelConfig.ts`, `src/lib/aiSimulationGenerator.ts` (CONCEPT_RENDERER_MAP), `src/lib/intentClassifier.ts` (VALID_CONCEPT_IDS + CLASSIFIER_PROMPT). Read the Task-1/2 artifacts + `src/schemas/conceptJson.ts` + the KCL concept + emf_definition/internal_resistance for the ladder config.

**Interfaces:** Consumes skeleton + physics block. Produces a schema-valid concept JSON (top-level `particle_field_config` + `epic_l_path`) + all 8 sites wired.

- [ ] **Step 1: Dispatch json-author** — author the 5 states on the potential-ladder apparatus with the verified numbers; reuse existing ladder/voltmeter/cell flags; ≥3 primitives/state; ≥2 advance_mode; zero pause_after_ms; misconception_watch S3 only; caption = ≤5-word cue; ONE Unicode formula surface (ΣV=0); voltmeter value HUDs; universal anchor; NO text_te yet. **ENGINE-GAP PROTOCOL:** if the multi-step series ladder / per-resistor voltmeters / kvl_sum_readout / S3 ghost can't be done in config over the existing engine, implement what's possible in config, use the documented S4 fallback, and FLAG the remaining engine gap for the auditor to route to peter_parker — do NOT cold-call peter_parker or hand-hack the shared renderer for a new capability (small config-consistent additions are fine). Touch only own files; do not commit.
- [ ] **Step 2: `npx tsc --noEmit`** → 0 errors (hand back on failure).
- [ ] **Step 3: `npm run validate:concepts`** → kirchhoff_loop_rule_KVL PASS (hand back on gate fail).
- [ ] **Step 4 (only if json-author flagged an engine gap): route to `peter_parker:renderer_primitives`** with a NAMED directive (multi-step ladder + per-resistor voltmeters + kvl_sum_readout, all gated behind new per-state flags, no regression to emf_definition/internal_resistance/combination_of_resistors/electric_power; diff-first, tsc-verify, no commit), then re-run json-author Step 1 to finalize the JSON on the new flags. Mirrors the KCL Task-3b engine upgrade.
- [ ] **Step 5: Commit** the concept + engine (if changed) + registrations + artifacts + spec + plan + ledger.

---

### Task 4: Code review (engine + registration diff)

- [ ] **Step 1:** Generate the review package (`scripts/review-package BASE HEAD`) and dispatch a task reviewer focused on: engine regression guard (all new ladder/voltmeter/sum paths gated behind new flags so emf_definition/internal_resistance/combination_of_resistors/electric_power render identically when the flags are absent), registration completeness (id spelled identically, renderer→particle_field, absent from PCPL/PILOT), and spec-number fidelity (ΣV=0; ε=6/R₁=2/R₂=1→2A/4V/2V).
- [ ] **Step 2:** Resolve ⚠️ items yourself; dispatch ONE consolidated fix subagent for Critical/Important findings; re-verify tsc+validate; commit fixes.

---

### Task 5: Quality-auditor gate

- [ ] **Step 1: Cache clear** (4 separate DELETEs).
- [ ] **Step 2: Dispatch quality-auditor** — gates 0–20 + Rule 31/32/33/34/35; give it the verified numbers + the "engine adds are founder-directed & gated" context + "cluster registry N/A-DORMANT, don't false-FAIL Gate 8" + "no text_te yet". Base visual verdict on THE EYE frames + JSON.
- [ ] **Step 3: Route any FAIL** to the named agent (or peter_parker via the auditor's tag); re-run. Terminal: PASS.

---

### Task 6: THE EYE visual gate

- [ ] **Step 1: Seed cache** (`_seed_kirchhoff_loop_rule_KVL_cache.ts`) then `npm run visual:eyes -- kirchhoff_loop_rule_KVL` (retry once on the flaky Node-fetch cache-read).
- [ ] **Step 2: Dispatch eye-walker** — read ALL frames; per-state verdict (S1 ladder returns to start / S2 +6/−4/−2 voltmeters + "6=4+2" / S3 signed ladder closes to 0 + ghost "6+4+2=12" struck / S4 3rd drop still closes / S5 explore); judge from `__frozen.png`; candidate bug rows; ≤5 founder frames. Never load frames in the main session.
- [ ] **Step 3: Triage** any new defect → engine_bug_queue (OPEN) → route → re-run. Target: zero new rows.
- [ ] **Step 4: Founder review + approve** — present ≤5 frames + verdict + review link; on founder OK ONLY: `npm run visual:approve -- kirchhoff_loop_rule_KVL`.

---

### Task 7: Review link + Telugu text + wrap-up

- [ ] **Step 1: build:review** + serve :8080 → provide `http://localhost:8080/kirchhoff_loop_rule_KVL/`.
- [ ] **Step 2: Telugu text** — dump text_en → `Agent(model="sonnet")` returns code-mixed text_te (Rule 30 constraints) → write into JSON. NEVER `tts:translate`. Audio on-demand — render EN audio only if founder asks.
- [ ] **Step 3: Re-validate** (tsc + validate) → commit text_te.
- [ ] **Step 4: PROGRESS.md** session entry + commit.

---

## Self-Review

**Spec coverage:** §1 claim → T1/T2 · §3 scope → T1+T3 · §4 apparatus/anchor → T1+T3 · §5 arc+table → T1/T2/T3 · §6 engine adds → T3 step4 + T5 route + T6 EYE · §7 registration → T3 · §8 done-list → T3–T7 · §9 pipeline → task order. No gaps.

**Placeholder scan:** STATE_4 R₃ is "physics-author confirms clean values" — a bounded delegation (like KCL's advance_mode), not a TBD; the S1-S3/S5 numbers are concrete. No other placeholders.

**Type consistency:** concept id `kirchhoff_loop_rule_KVL` identical across all tasks/sites. `particle_field_config` + `{epic_l_path, particle_field_config}` seed shape consistent with the Ch.3 pattern. Engine adds mirror the KCL `kcl_sum_readout`/`drawStruckTextC`/gated-flag conventions.

**Task shape note:** tasks are pipeline stages; the "test" at each is tsc / validate / code-review / auditor / THE EYE (the project's real verification model). Each ends at an independently checkable gate.
