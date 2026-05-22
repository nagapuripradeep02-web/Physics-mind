# CLAUDE.md — `src/data/concepts/` (atomic concept JSONs)

Subdir conventions for the directory that holds PhysicsMind's atomic concept JSON files. Pointer-hub only — do NOT reproduce content from root `CLAUDE.md`. Read root + `ARCHITECTURE_v2.2.md` first if you are new to the project.

## What lives here

63 atomic concept JSONs + 1 legacy bundle (`class12_current_electricity.json`, see root §6.2). Filename = `concept_id` (snake_case, no spaces). v2.3 schema (PRIMARY-aha designation + Pass-1 strategic checklist + Pass-2 four-question lens deferred to `PASS_2_PROPOSAL.md`).

## Before editing any JSON, read

1. Root `C:\Tutor\CLAUDE.md` §6 (the six required updates) — **mandatory**.
2. `C:\Tutor\physics-mind\docs\ARCHITECTURE_v2.2.md` §"v2.2 schema deltas with JSON examples".
3. `C:\Tutor\physics-mind\.agents\architect\CLAUDE.md` §"Two-pass cognitive lens (v2.3 addition)".

## The six required updates for a NEW concept

Missing any one = silent pipeline failure.

1. `src/data/concepts/{concept_id}.json` — full definition. Required: `scene_composition.primitives.length ≥ 3` per state, `focal_primitive_id` per state, varied `advance_mode`, 4–7 `epic_c_branches`, `prerequisites: [concept_id]`, `mode_overrides.board` (`canvas_style` + `derivation_sequence` + `mark_scheme`), `mode_overrides.competitive` (`shortcuts` + `edge_cases`). Magnetism carve-out (M1–M6): conceptual-only is permitted; board+competitive ship later at M7/M8.
2. SQL INSERT into `concept_panel_config` (or `CONCEPT_PANEL_MAP` in `src/config/panelConfig.ts`).
3. `CONCEPT_RENDERER_MAP` entry in `src/lib/aiSimulationGenerator.ts` (~line 2564).
4. `VALID_CONCEPT_IDS` set in `src/lib/intentClassifier.ts` (~line 36).
5. Deep-dive flagging: `epic_l_path.states.STATE_N.allow_deep_dive: true` on 2–3 hard states per concept.
6. Parent-bundle retirement (if splitting): rename old bundle to `{bundle_id}.legacy.json.deleted` and add a `CONCEPT_SYNONYMS` redirect entry — keep parent out of `VALID_CONCEPT_IDS`.

## Hard validator gates that frequently fail here

| Gate | What it checks |
|---|---|
| Gate 9 | Primitive overlap warnings (no two primitives in the same anchor zone without explicit z-order) |
| Gate 12 | ≥ 2 distinct `advance_mode` values across `epic_l_path.states` |
| Gate 13 | Animation primitive vocabulary (only allowed primitives in renderer) |
| Gate 14 | Pass-1 strategic audit — applies to concepts authored or retrofitted **2026-05-22+** (see backfill carve-out) |

Run `npm run validate:concepts` before declaring done. Run `npx tsc --noEmit` for type safety.

## Common pitfalls

- **`contact_forces.json` duplicate-keys parse bug** — known OPEN in `engine_bug_queue`, severity MAJOR. Do not use as template until fixed.
- **Legacy bundle redirect** — `class12_current_electricity.json` is array-of-concepts (old `physics_constants/` shape). `ohms_law`, `drift_velocity`, etc. route here, not to standalone files. See root §6.2 + `LEGACY_SPLIT_BACKLOG.md`.
- **Fallback chain** — `loadConstants(conceptId)` reads `data/concepts/` first, falls back to `src/lib/physics_constants/` (171 legacy files). NEVER add new files to `physics_constants/`.
- **Interactivity rule** — sliders / interactive controls allowed in the LAST EPIC-L state only (Rule established session 2026-05-21). Earlier states with `show_sliders` violate this — strip them.
- **PRIMARY aha designation (v2.3)** — Block 2 of the architect's two-pass lens. PRIMARY aha state must be inside `entry_state_map.foundational` range OR foundational must declare a mandatory exit-pill into the primary-aha slice. Existing concepts pre-2026-05-22 are exempt until next touch.

## Related docs

- `physics-mind/docs/MAGNETISM_ARCHITECTURE.md` — M1–M8 phase carve-outs for Ch.26 concepts.
- `physics-mind/docs/PASS_2_PROPOSAL.md` — Pass-2 four-question lens (proposal, dogfood on Diamond #4).
- `physics-mind/.agents/quality_auditor/CLAUDE.md` — full gate list including Gate 14 reasoning.
