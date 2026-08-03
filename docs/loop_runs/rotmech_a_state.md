# rotmech desk A — loop state

updated: 2026-08-04
desk: `feat/rotmech-a` · `C:\Tutor\physics-mind-rotmech-a`
cut from: `4b289d4` (the Phase-0d pre-registration commit)
review_port: **8110**
regression_sample: **friction_force, gauss_law_line**
engine_surface: `rigid_body_rotation` (rbr) — the 0c-1 frozen contract at `field_3d_renderer.ts:939`

## Concept set — FROZEN. This desk owns exactly these two.

| Wave | Concept | Status |
|---|---|---|
| 1 | `conservation_of_angular_momentum` | **AUTHOR NOW.** 0b is DONE — `docs/loop_runs/rotmech/conservation_of_angular_momentum/skeleton.md` (REV 4) + `physics_block.md`, Checkpoint A `DESIGN_OK`. It is the 0c-1 spec driver, so the engine was built for it. |
| 2 | `rotational_work_energy` | **BLOCKED on 0c-3.** Needs a `W = τ·θ` accumulator and a `θ` readout; neither exists. Do NOT start until 0c-3 merges and this desk syncs. |

## next
Author `conservation_of_angular_momentum` through the Alex pipeline (physics block exists →
start at `json-author`), then quality-auditor + eye-walker, then founder-proxy Checkpoint B.

## done
(none)

## The blocked-concept trap — read before wave 2

`RBR_RO_META` (`field_3d_renderer.ts:50147`) implements exactly six readout rows:
`I · ω · L · KE · dL/dt · F`. **There is no θ, α, W or v row.**
`rbrRebuildReadout` (`:50162`) does `if (!meta) continue` — an unknown token is skipped in
**silence**. A concept authored against a missing row passes Zod, passes `validate:concepts`,
seeds, renders, and can be sealed with the taught quantity simply absent. Nothing automated
catches it. That is why wave 2 waits.

## Guardrails

1. **`npm run cache:clear:scoped -- <id>` ONLY.** The global 4-table wipe
   (`_scratch_cache_clear_4tables.mjs`, the `cache-clear` skill) destroys four sibling desks'
   seeded rows mid-EYE.
2. **Cache one-owner rule.** This desk may seed exactly:
   `conservation_of_angular_momentum`, `rotational_work_energy`, `friction_force`,
   `gauss_law_line`. Every `_seed_*` does delete-then-insert on `concept_key`; seeding any
   other key races a sibling.
3. **Always re-seed immediately before `visual:eyes`** — a row you did not write may have been
   assembled by another desk's renderer.
4. **Shared registration files are READ-ONLY here.** All 8 ids were pre-registered on master in
   `4b289d4` (`intentClassifier.ts`, `aiSimulationGenerator.ts`, `panelConfig.ts`). A wrong
   CLASSIFIER_PROMPT hint is queued to the office, never fixed here.
5. **Never edit the six platform files** — above all `field_3d_renderer.ts` and
   `deriveStateMeta.ts`, not even a comment. This one rule is what keeps merge-back
   conflict-free.
6. **Engine findings → `docs/loop_runs/rotmech/_engine/findings_a.md`** (this desk's own file).
   Desk E (`feat/rotmech-0c3`) is the sole engine owner. Never dispatch an engine fix here.
7. **`docs/loop_runs/rotmech/APPARATUS_CONTRACT.md` is binding.** Home pose `r = 0.80`,
   `ω = +1.50`, `m = 2.0`, `I_frame 0.50`, `rod_half 1.00`, `drum 0.55`, `r` range 0.15–0.90.
   Deviating forks the chapter's apparatus and nobody notices until Checkpoint C.
8. **Progress lines → `docs/loop_runs/rotmech/_progress/a.md`**, never the shared `PROGRESS.md`.
9. **No `visual:approve`** (Rule 17, founder-only) · no `tts:*` · no `PILOT_CONCEPTS` ·
   no `build:pilot` · no `deploy:*` · no `engine_bug_queue` DB writes (scars are files) ·
   no merge to master · no `npm install` (the junction is shared) · no `git add -A`.
10. `serve:review` is hardcoded to 8080 — use
    `npx --yes http-server review-site -p 8110 -c-1`.

## Open item needing a founder ruling
`torque` (#5) and `moment_of_inertia` (#6) precede this concept in the approved teaching order
and are not being authored in this wave. Any `prerequisites` array naming them will point at
ids that exist in `VALID_CONCEPT_IDS` with no concept JSON. Get the ruling before seal.
