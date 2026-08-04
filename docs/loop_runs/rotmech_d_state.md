# rotmech desk D — loop state

updated: 2026-08-04
desk: `feat/rotmech-d` · `C:\Tutor\physics-mind-rotmech-d`
cut from: `4b289d4` (the Phase-0d pre-registration commit)
review_port: **8113**
regression_sample: **normal_force, inductance**
engine_surface: `rigid_body_rotation` (rbr) — the 0c-1 frozen contract at `field_3d_renderer.ts:939`

## Concept set — FROZEN. This desk owns exactly these two.

| Wave | Concept | Status |
|---|---|---|
| 2 | `rotational_kinematics` | **BLOCKED on 0c-3.** Needs an **α** readout and the **v = ωr arrow**. (Corrected 2026-08-04 — see below. θ and `theta0_rad` are already BUILT.) |
| 2 | `tau_eq_i_alpha` | **BLOCKED on 0c-3.** Needs an α readout row; `applied_torque_Nm` exists but α has nowhere to print. |

## This desk has NO wave-1 authoring, and that is deliberate

There is no fifth ready concept. Both of this desk's concepts are engine-blocked, so wave 1 is
**the 0b design pass for both** — architect skeleton + physics block + founder-proxy
Checkpoint A. Pure documentation, zero engine dependency, and it front-loads the highest-ROI
quality gate in the pipeline.

The payoff: when 0c-3 merges, this desk starts at `json-author` for both concepts instead of at
`architect`, so it catches up with the others in one step rather than three.

## next
1. `architect` skeleton for `tau_eq_i_alpha` → Checkpoint A → physics block.
2. `architect` skeleton for `rotational_kinematics` → Checkpoint A → physics block.
3. **Feed both into Desk E's 0c-3 scope.** These two skeletons are the authoritative statement
   of what α, θ and `theta0_rad` must actually do on screen. Write anything the engine must
   provide to `docs/loop_runs/rotmech/_engine/findings_d.md` **early** — Desk E freezes its
   scope before its first dispatch, and this desk is the main source of that scope.
4. Do NOT write a concept JSON for either until 0c-3 merges and this desk syncs.

## done
(none)

## Why the wait is not optional

`RBR_RO_META` (`field_3d_renderer.ts:50147`) implements exactly six readout rows:
`I · ω · L · KE · dL/dt · F`. **There is no α row** — the quantity `tau_eq_i_alpha` exists to
teach.

> **CORRECTION 2026-08-04.** An earlier version of this file said θ and `theta0_rad` were also
> missing. **They are not**, and the mistake came from trusting the contract comment at
> `field_3d_renderer.ts:953` instead of grepping. Verified against the code:
> `rbrThetaAt` (`:49952`) is a complete, grid-cached, rewind-safe angle integrator, live at
> `:50232` (published as `window.PM_rbrTheta`) and `:50666` (it drives the visible rotation);
> `rbrThetaReset` (`:49967`) reseeds it; and `theta0_rad` IS read, at `:50499` into
> `eng.theta0`, which seeds `_th` at `:49958`/`:49970`.
>
> **The contract comments at `:953` and `:998` are WRONG** — they list `theta0_rad` under
> "DECLARED, NOT IMPLEMENTED" while `:962`/`:971-973` in the same block correctly document θ as
> implemented. Desk E has queued the comment fix.
>
> **What this changes for you:** θ needs only a **row in `RBR_RO_META`**, not an accumulator.
> `rotational_kinematics` is blocked on the **α readout** and the **v = ωr arrow** only. Design
> your θ beats against the integrator that already exists — read `rbrThetaAt` before you
> specify anything about angle behaviour, because it already defines the semantics. `rbrRebuildReadout` (`:50162`) does `if (!meta) continue`, so an unknown token
is skipped in **silence**: no throw, no gate failure. A `tau_eq_i_alpha` JSON authored today
would pass Zod, pass `validate:concepts`, seed, render, get EYE'd, and could be sealed — with α
simply never appearing on screen. Only a human reading the sim against the physics block would
catch it.

Authoring these now does not save time. It manufactures a concept that looks finished and is
not.

## Guardrails

1. **`npm run cache:clear:scoped -- <id>` ONLY.** The global 4-table wipe destroys four sibling
   desks' seeded rows mid-EYE.
2. **Cache one-owner rule.** This desk may seed exactly: `rotational_kinematics`,
   `tau_eq_i_alpha`, `normal_force`, `inductance`. Seeding any other key races a sibling desk.
   (Wave 1 is docs-only and seeds nothing.)
3. **Always re-seed immediately before `visual:eyes`.**
4. **Shared registration files are READ-ONLY here** (pre-registered on master in `4b289d4`).
5. **Never edit the six platform files** — above all `field_3d_renderer.ts` and
   `deriveStateMeta.ts`, not even a comment.
6. **Engine findings → `docs/loop_runs/rotmech/_engine/findings_d.md`.** Desk E is the sole
   engine owner. Never dispatch an engine fix here — but DO write findings early and precisely,
   because this desk defines half of 0c-3's scope.
7. **`APPARATUS_CONTRACT.md` is binding.** Home pose `r = 0.80`, `ω = +1.50`, `m = 2.0`,
   `I_frame 0.50`, `rod_half 1.00`, `drum 0.55`, `r` range 0.15–0.90. Six concepts share this
   turntable across four desks; a local deviation forks the chapter's apparatus.
8. **Progress lines → `docs/loop_runs/rotmech/_progress/d.md`**, never `PROGRESS.md`.
9. No `visual:approve` · no `tts:*` · no `PILOT_CONCEPTS` · no `build:pilot` · no `deploy:*` ·
   no `engine_bug_queue` DB writes · no merge to master · no `npm install` · no `git add -A`.
10. `npx --yes http-server review-site -p 8113 -c-1` (never `serve:review`, hardcoded to 8080).

## Open item needing a founder ruling
`torque` (#5) and `moment_of_inertia` (#6) precede `tau_eq_i_alpha` in the approved teaching
order and are not in this wave. `tau_eq_i_alpha` genuinely depends on both concepts' ideas, so
its `prerequisites` array will name ids with no concept JSON. Raise this at Checkpoint A, not
at seal.
