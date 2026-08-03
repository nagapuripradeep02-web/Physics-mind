# rotmech desk C — loop state

updated: 2026-08-04
desk: `feat/rotmech-c` · `C:\Tutor\physics-mind-rotmech-c`
cut from: `4b289d4` (the Phase-0d pre-registration commit)
review_port: **8112**
regression_sample: **tension_force, equipotential_surfaces**
engine_surface: `rigid_body_rotation` (rbr) — the 0c-1 frozen contract at `field_3d_renderer.ts:939`

## Concept set — FROZEN. This desk owns exactly these two.

| Wave | Concept | Status |
|---|---|---|
| 1 | `angular_momentum` | **AUTHOR NOW — but from scratch.** No 0b artifacts exist. Start at `architect`, then founder-proxy Checkpoint A, then physics-author, then json-author. |
| 2 | `rigid_body_rotation` | **BLOCKED on 0c-3.** Needs `body_shape` variants (inert today) and per-point circular traces at different radii — its primary aha. Do NOT start until 0c-3 merges and this desk syncs. Run its 0b design pass during wave 1. |

## next
1. `architect` skeleton for `angular_momentum` → Checkpoint A → physics block → JSON.
2. In parallel gaps: the 0b design pass for `rigid_body_rotation` (skeleton + physics block +
   Checkpoint A only — pure docs, zero engine dependency). Front-loading the design gate is the
   highest-ROI quality slot, and it means wave 2 starts at `json-author`.

## done
(none)

## What `angular_momentum` CAN use today

`show_l_arrow` (`field_3d_renderer.ts:1039`) draws **L as a vector along the axis**, and `L` is
a live readout row. That is the concept's core, and it is built.

**The advanced ring is not.** `L = r × p` needs `cross_product_construction`, which is declared
but inert (`:939-956`). Author the core and extended rings only; the advanced ring waits for
0c-3. Rule 38a: hiding the advanced ring must leave a coherent lesson — design it that way from
the start rather than retrofitting.

## The blocked-concept trap — read before wave 2

`RBR_RO_META` (`:50147`) implements exactly six rows: `I · ω · L · KE · dL/dt · F`.
**No θ, α, W or v.** `rbrRebuildReadout` (`:50162`) does `if (!meta) continue` — an unknown
token is skipped in **silence**, with no throw and no gate failure. A concept authored against a
missing row passes every automated check with the taught quantity simply absent. That is why
wave 2 waits for 0c-3.

## Guardrails

1. **`npm run cache:clear:scoped -- <id>` ONLY.** The global 4-table wipe destroys four sibling
   desks' seeded rows mid-EYE.
2. **Cache one-owner rule.** This desk may seed exactly: `angular_momentum`,
   `rigid_body_rotation`, `tension_force`, `equipotential_surfaces`. Seeding any other key
   races a sibling desk.
3. **Always re-seed immediately before `visual:eyes`.**
4. **Shared registration files are READ-ONLY here** (pre-registered on master in `4b289d4`).
5. **Never edit the six platform files** — above all `field_3d_renderer.ts` and
   `deriveStateMeta.ts`, not even a comment.
6. **Engine findings → `docs/loop_runs/rotmech/_engine/findings_c.md`.** Desk E is the sole
   engine owner; Desk B owns SEAM R findings. Never dispatch an engine fix here.
7. **`APPARATUS_CONTRACT.md` is binding.** Home pose `r = 0.80`, `ω = +1.50`, `m = 2.0`,
   `I_frame 0.50`, `rod_half 1.00`, `drum 0.55`, `r` range 0.15–0.90. Desk A's
   `conservation_of_angular_momentum` opens from the same pose — a teacher moving between the
   two simulations must see one continuing machine.
8. **Progress lines → `docs/loop_runs/rotmech/_progress/c.md`**, never `PROGRESS.md`.
9. No `visual:approve` · no `tts:*` · no `PILOT_CONCEPTS` · no `build:pilot` · no `deploy:*` ·
   no `engine_bug_queue` DB writes · no merge to master · no `npm install` · no `git add -A`.
10. `npx --yes http-server review-site -p 8112 -c-1` (never `serve:review`, hardcoded to 8080).

## Open item needing a founder ruling
`torque` (#5) and `moment_of_inertia` (#6) precede `angular_momentum` in the approved teaching
order and are not in this wave. A `prerequisites` array naming them points at ids registered in
`VALID_CONCEPT_IDS` with no concept JSON. Get the ruling before seal, not at seal.
