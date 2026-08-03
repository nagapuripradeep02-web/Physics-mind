# 0c-2 (SEAM R) — ENGINE HANDOFF

**Status: BUILD COMPLETE AND VERIFIED. NOT LANDED — blocked by a concurrent-session file race.**
Owner: `peter_parker:field3d_surgeon`. Date 2026-08-03. Branch `feat/rotmech-engine`.

## Where the work is

| Artifact | Location |
|---|---|
| Complete verified tree | git tag **`rotmech-0c2-seamR-verified`** = commit `54db9354f3a50e9d05104e29cc5b4eb0d1bf7100` (also `stash@{0}`) |
| Patch (HEAD → that tree) | `%TEMP%\claude\0c2_seamR.patch` (3088 lines) |
| Files touched | `src/lib/renderers/field_3d_renderer.ts` (+1400/−3), `src/lib/validators/visual/deriveStateMeta.ts` (+55) |

## Why it is not in the working tree

`src/lib/renderers/field_3d_renderer.ts` is being edited **concurrently by the 0c-1
(`rigid_body_rotation`) build** in this same worktree. Evidence: the working tree carries
`turntable_rod` (0c-1 vocabulary, absent from HEAD) and zero `SEAM R`.

The commit above contains **HEAD + 0c-1-as-of-03:04 + SEAM R**. The working tree now contains
**HEAD + 0c-1-as-of-03:20**. A `git stash pop` would revert 0c-1's newer progress, so it was NOT
performed. The working tree was left exactly as the 0c-1 session had it.

**Do not `git stash pop`.** Land SEAM R by 3-way merge once 0c-1 is committed:

```
git commit -m "<0c-1 build>"          # 0c-1 session commits FIRST
git apply --3way <patch>              # clean tree required; the two builds are region-disjoint
npm run check:renderer-syntax && npx tsc --noEmit && npm run validate:concepts
```

The two builds are region-disjoint: SEAM R touches the `newtons_laws_body` block only
(`nlbSetBodyPosition`, `nlbBodyLaneZ`, `nlbApplySurface`, Branch A, `nlbWriteReadouts`,
`nlbRenderStamps`, `nlbArrowLen`, the body mesh build, the `eng` literal, `nlbResetTrajectory`);
0c-1 touches `rigid_body_rotation`. Expect conflicts only in the shared `Field3DConfig` interface
comment block if both edited it.

## Process lesson (file this)

`git stash push` on a file another session is live-editing silently reverts THEIR uncommitted work
for the duration. Do not stash a shared engine file to run an A/B; check out the pre-change blob to
a temp path and assemble the cache from that instead.

## Verify chain — ALL GREEN on the tagged tree

- `npm run check:renderer-syntax` — field_3d OK (4001 KB), particle_field OK, parametric OK
- `npx tsc --noEmit` — 0 errors
- `npm run validate:concepts` — 149 PASS / 0 FAIL, registration cross-check ✓

## Back-compat acceptance — PASSED

- `work_done_by_constant_force` (two-body lane compare): **12/12 H2 at 0.00%** — byte-identical.
- `rolling_friction` (`shape:'wheel'`): 10/10 H2 pass (0.22–0.39% vs 2.0% tol); every non-zero
  percentage **reproduces on the pre-change renderer** to 2 dp.
- Pre/post frozen pixel diff: max channel delta **2, 2, 9, 4, 9**.
  Negative control (pre-change vs pre-change, identical code): **4, 6, 31, 12, 123**.
  The change is inside the run-to-run noise band and is the quietest pair measured.

Caveat: the "post" leg measured HEAD + 0c-1 + SEAM R together (0c-1 was already in the file).
That is a strictly more conservative test, not a weaker one.

## Remaining work (none blocking)

1. Land the patch (above).
2. Re-run the verify chain + the two-concept A/B on the merged tree.
3. `docs/loop_runs/rotmech/_engine/scar_candidates.sql` does not exist yet — create it and append
   the three rows from the dispatch report.
