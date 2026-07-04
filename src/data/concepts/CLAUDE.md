# CLAUDE.md — `src/data/concepts/` (atomic concept JSONs)

Subdir conventions for the directory that holds PhysicsMind's atomic concept JSON files. Pointer-hub only — do NOT reproduce content from root `CLAUDE.md`. Read root + `ARCHITECTURE_v2.2.md` first if you are new to the project.

## What lives here

66 atomic concept JSONs + 1 legacy bundle (`class12_current_electricity.json`, see root §6.2) — count verified 2026-06-11. Filename = `concept_id` (snake_case, no spaces). v2.3 schema (PRIMARY-aha designation + Pass-1 strategic checklist; Pass-2 shipped as Gate 15 — see `docs/archive/PASS_2_PROPOSAL.md`).

## Before editing any JSON, read

1. Root `C:\Tutor\CLAUDE.md` §6 (the EIGHT required updates) — **mandatory**.
2. `C:\Tutor\physics-mind\docs\ARCHITECTURE_v2.2.md` §"v2.2 schema deltas with JSON examples".
3. `C:\Tutor\physics-mind\.agents\architect\CLAUDE.md` §"Two-pass cognitive lens (v2.3 addition)".

## Registration for a NEW concept — EIGHT required updates

**The authoritative list lives in root `CLAUDE.md` §6 (eight sites since 2026-06-11 — adds `PCPL_CONCEPTS` + `CLASSIFIER_PROMPT`, the two documented silent-failure sites). Do not rely on older six-item copies.** Per-file requirements current as of 2026-06-11:

- `scene_composition.primitives.length ≥ 3` per state, `focal_primitive_id` per state, ≥2 distinct `advance_mode` values (Gate 12; **no `wait_for_answer` on new concepts** — Rule 31; the new-model default is `manual_click` beats + `interaction_complete` explore-last), `prerequisites: [concept_id]`.
- `epic_c_branches` — OMIT for new concepts (EPIC-L-first directive 2026-06-10; misconceptions confronted inside EPIC-L per Rule 16a — a straightforward contrast beat, not predict→reveal; Zod `.optional()`).
- `mode_overrides` — OMIT for new concepts (conceptual-only directive 2026-06-11, Rule 20 suspension — board + competitive dropped this phase; Gate 21 enforces all-or-nothing on any legacy board override).
- **Comprehension keystone (2026-05-30+):** new/retrofitted concepts also ship an `assessment` block (6-question backward-designed pre/post quiz with `distractor_misconceptions` + `teaches_state` + `parallel_form_stem` per question) and a `coverage_map` (`by_state` + `non_assessed_states`), plus per-state `misconception_watch` (Rule 16a). Enforced by Gates 19/20; pre-existing atomics exempt until retrofitted.

## Hard validator gates that frequently fail here

| Gate | What it checks |
|---|---|
| Gate 9 | Primitive overlap warnings (no two primitives in the same anchor zone without explicit z-order) |
| Gate 12 | ≥ 2 distinct `advance_mode` values across `epic_l_path.states` |
| Gate 13 | Animation primitive vocabulary (only allowed primitives in renderer) |
| Gate 14 | Pass-1 strategic audit — applies to concepts authored or retrofitted **2026-05-22+** (see backfill carve-out) |
| Gate 19 | **Coverage** — fires only when an `assessment` block is present: every quiz `teaches_state` is real, no orphan states (vs `non_assessed_states`), no uncovered questions, placement agrees. Machine-enforced in `conceptJson.ts` superRefine. |
| Gate 20 | **Quiz quality** — fires only when `assessment` present: every wrong option carries a `distractor_misconception` (correct option not a key), ≥3 distinct `tested_idea`, ≥1 question hits the aha state, unique q_ids. Machine-enforced; auditor judges distractor-reality + keyed-answer correctness. |

(Gates 16 POE / 17 one-variable / 18 concrete-first are quality_auditor-judgment gates; Gate 15 is reserved for Pass-2. Comprehension gates phase in via field-presence — the 62 atomics without an `assessment` block are unaffected until retrofitted.)

Run `npm run validate:concepts` before declaring done. Run `npx tsc --noEmit` for type safety.

## Common pitfalls

- **`contact_forces.json` duplicate-keys parse bug — RESOLVED (false alarm).** Verified clean parse 2026-06-11; no `engine_bug_queue` row for it ever existed. Safe to read as a template again.
- **Legacy bundle redirect** — `class12_current_electricity.json` is array-of-concepts (old `physics_constants/` shape). `ohms_law`, `drift_velocity`, etc. route here, not to standalone files. See root §6.2 + `docs/archive/LEGACY_SPLIT_BACKLOG.md`.
- **Fallback chain** — `loadConstants(conceptId)` reads `data/concepts/` first, falls back to `src/lib/physics_constants/` (171 legacy files). NEVER add new files to `physics_constants/`.
- **Interactivity rule (UPDATED 2026-07-02 — Rule 31: per-state contextual controls)** — every state is LIVE (`show_sliders: true`), but each state exposes ONLY the control row(s) relevant to the concept it teaches; the final explore state exposes ALL (progressive disclosure). The per-state control visibility is driven by the state's scenario block (e.g. `faraday.mode` → panel rows show/hide in the renderer). **The four catches (all required):** (1) build the control panel ONCE in the scenario's build fn, show/hide rows per state — never rebuild widgets per state; (2) "no slider" ≠ "static" — a watch-this beat with zero controls is fine as long as its choreography auto-plays (motion and interactivity are separate axes); (3) a control appearing in multiple states keeps the SAME screen position + row order; (4) the **per-state control table** (state × teaches × distinct motion × live controls) is declared in the architect skeleton BEFORE coding — the auditor checks the built sim against it. Authored demo-motion keeps running until the teacher grabs a control (trusted-drag `ev.isTrusted` guard in `field_3d_renderer.ts` seizes manual). This **supersedes** the 2026-06-30 "every state may show all sliders" interim rule and the 2026-05-21 "last-state-only" rule. Reference implementations: `faraday_law_induction` (authored natively — S1–S4 no controls, S5 speed+turns, S6 all), `magnetisation_and_intensity` (retrofitted from founder video review). Guardrails unchanged: keep ≥2 distinct `advance_mode` values across `epic_l_path.states` (Gate 12); **never** set `advance_mode: 'auto_after_animation'` on a static-but-live state (it trips THE EYE motion heuristic → false "motion died"); re-seed the concept's cache after restructuring so `deriveMotionExpectations` reads the new `field_3d_config`.
- **Pacing rule (Rule 31a/31b)** — guided states are straightforward distinct-motion beats **~28–35s** (no Socratic predict→`wait_for_answer`→reveal, no `pause_after_ms` prediction pauses on new concepts); no two states identical in motion/teaching; no static state; final explore state = duration 0/open + `interaction_complete`.
- **PRIMARY aha designation (v2.3)** — Block 2 of the architect's two-pass lens. PRIMARY aha state must be inside `entry_state_map.foundational` range OR foundational must declare a mandatory exit-pill into the primary-aha slice. Existing concepts pre-2026-05-22 are exempt until next touch.

## Related docs

- `physics-mind/docs/MAGNETISM_ARCHITECTURE.md` — M1–M8 phase carve-outs for Ch.26 concepts.
- `physics-mind/docs/archive/PASS_2_PROPOSAL.md` — Pass-2 four-question lens (SHIPPED as Gate 15 after the Diamond-#4 dogfood; doc archived).
- `physics-mind/.agents/quality_auditor/CLAUDE.md` — full gate list including Gate 14 reasoning.
