# rotmech desk E — 0c-3 engine build

updated: 2026-08-04
desk: `feat/rotmech-0c3` · `C:\Tutor\physics-mind-rotmech-0c3`
cut from: `4b289d4` (the Phase-0d pre-registration commit)
review_port: **8114**
regression_sample: **newton_second_law, coulombs_law**
owner: `peter_parker:field3d_surgeon` — **this desk is the SOLE engine owner for the run**

## Why 0c-3 exists

The Phase-0 survey's SUCCESS TEST (`docs/loop_runs/rotmech/phase0_survey.md:259-263`) says:

> *Concepts 1–14 must require **ZERO further renderer edits** after 0c-1 and 0c-2 land. A later
> concept forcing an engine change means this survey under-generalized → **STOP and re-scope
> with the surgeon**.*

0c-1 did not build against the 12-concept union. It froze a contract and deferred eight
capabilities to *"each built under its OWN concept's engine row"*
(`field_3d_renderer.ts:939-956`). Both statements cannot hold. **The alarm already fired,
quietly, inside a commit message — 0c-3 is the re-scope it demands.** Doing it as one deliberate
pass is the whole point; discovering it per-concept is the Class-12 Ch.7 failure that cost
~1,296M tokens for six concepts.

## The gap, measured

`RBR_RO_META` (`:50147`) implements exactly six readout rows: `I · ω · L · KE · dL/dt · F`.
No θ, no α, no W, no v. `controls_visible` (`:1051`) is `'r'|'m'|'omega0'|'tau_brake'|'spin_dir'`.
`body_shape` variants beyond `'turntable_rod'` are declared at `:982` with **zero read sites**.

`rbrRebuildReadout` (`:50162`) does `if (!meta) continue`, so a missing row fails **silently** —
which is why four concepts are blocked rather than merely degraded.

## Scope — FREEZE THIS BEFORE THE FIRST DISPATCH

| # | Capability | Unblocks |
|---|---|---|
| 1 | `alpha` readout row + `tau` row | `tau_eq_i_alpha` (#7) |
| 2 | `W = τ·θ` accumulator + `theta` row | `rotational_work_energy` (#8) |
| 3 | `theta0_rad` (wire the declared field) + `v = ωr` arrow | `rotational_kinematics` (#4) |
| 4 | `body_shape` `disc` \| `ring` \| `rod` \| `sphere` + their I formulas | `rigid_body_rotation` (#3) |
| 5 | per-point markers + circular traces at different radii | `rigid_body_rotation`'s primary aha |
| 6 | `cross_product_construction` (r × F, r × p, draggable, ⊥ result + RHR) | `angular_momentum` (#9) advanced ring; later `torque` (#5) |

**Desk D's two skeletons are the authoritative statement of what items 1–3 must do on screen.**
Read `docs/loop_runs/rotmech/_engine/findings_d.md` before freezing.

Also queued — a real inconsistency found during the PR #28 audit:
`external_torque.source` declares `'brake' | 'applied_force_at_point' | 'torsion_spring'` but
the implementation resolves `'applied_torque' | 'brake'` (`:50518`). The declared and live
unions disagree at **both** ends. Reconcile as part of this pass.

**One `bug_class` per dispatch** (Amendment 4). ~100-call ceiling, then stop and write a handoff
note rather than rushing the tail. If a seventh capability appears mid-build, that is a
re-scope signal — report it, do not absorb it.

## next
1. Read Desk D's findings file + both of its skeletons.
2. Freeze the scope table above in writing.
3. Dispatch item by item, verifying after each.

## done
(none)

## Verify chain — every dispatch, all must pass

```
npm run check:renderer-syntax
npx tsc --noEmit
npm run validate:concepts
```
then re-seed + `visual:eyes` on the target, then re-seed + `visual:eyes` on **both** regression
canaries (`newton_second_law`, `coulombs_law`). An H2 diff you cannot explain is a FAIL, not a
re-baseline.

## Invariants any edit must preserve

- **Rule 36** — fixed 1/60 s stepping, 0–3 steps per frame, forced to 1 under
  `SET_TIME_FREEZE`; every integrator linear in dt; never hardcode a per-frame delta.
- **Rule 37** — the explore state (`interaction_complete`) free-runs, never auto-frozen.
- **Rule 29 / 32e** — emphasis is brightness never size; exactly one glow focal at any instant.
- **Rule 33d** — instruments show a live numeric reading and a needle that tracks.
- **Rule 34** — one formula surface per state, value-only HUD, real Unicode math across all
  three text paths (DOM, `ctx.fillText`, `createLabelSprite`).
- **Rule 39f** — follow the widget discovery conventions and ⚙ comes free.
- **Rule 40a** — `git log --all -S "<symbol>"` before building any mechanism. The state-local
  clock was nearly built twice this way; do not repeat it.
- Register every new element type in the visible-elements matcher and every new `*_at_ms` in
  `src/lib/validators/visual/deriveStateMeta.ts`, or THE EYE false-fails.
- **Every new field is OPTIONAL; absent must mean today's behaviour byte-identically.**
  Presence is `typeof`/`in`, never truthiness.

## Guardrails

1. **This desk NEVER authors or edits a concept JSON.** That is Desks A–D.
2. **`npm run cache:clear:scoped -- <id>` ONLY.** The global 4-table wipe destroys four sibling
   desks' seeded rows mid-EYE.
3. **Cache one-owner rule — this desk is the most dangerous violator.** It may seed exactly
   `newton_second_law` and `coulombs_law`. Its checkout contains **unmerged, unreviewed engine
   code**; if it re-seeds a concept another desk then EYEs, that desk is silently testing code
   that exists on no reviewed branch. Never seed another desk's concept, for any reason.
4. **Shared registration files are READ-ONLY here** (pre-registered on master in `4b289d4`).
5. **This desk merges to master FIRST**, before any authoring desk (Rule 40: engine is platform
   and lands separately and immediately). Then all four desks `desk:sync` and re-verify.
6. **Engine landing checkpoint is mandatory.** After this PR merges, every desk re-seeds and
   re-EYEs each already-sealed concept and diffs against its own frames. Shared rbr code will
   have changed underneath sealed work; nothing else catches that drift.
7. No `visual:approve` · no `tts:*` · no `PILOT_CONCEPTS` · no `build:pilot` · no `deploy:*` ·
   no merge to master by hand (use git-steward) · no `npm install` · no `git add -A`.
8. `npx --yes http-server review-site -p 8114 -c-1` (never `serve:review`, hardcoded to 8080).
