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

## ✅ STATUS 2026-08-05 — **UNBLOCKED. Desk D finished. Freeze the scope and start.**

The block below is **stale**. Desk D completed its full 0b design pass on 2026-08-04 —
13 commits, pushed, working tree clean, HEAD `267356d`:

- `docs/loop_runs/rotmech/_engine/findings_d.md` — **exists, 33 KB**, with a 9-item priority
  table at §8 and a freeze-source marker at PASS 2.
- `docs/loop_runs/rotmech/rotational_kinematics/` — `skeleton.md` **`DESIGN_OK`** + `physics_block.md`
- `docs/loop_runs/rotmech/tau_eq_i_alpha/` — `skeleton.md` **`DESIGN_OK`** + `physics_block.md`

`npm run desk:sync` first, then read `findings_d.md` end to end before freezing anything.

### Desk D's findings substantially rewrite the scope table below

**§1 is a CRITICAL finding that outranks everything in the original six items:**

> **No torque source in the engine can INCREASE |L|.** `applied_torque_Nm` is decay-only, so
> **α cannot be produced at all**, in either concept, at any authored value.

That is a **physics** gap, not a display gap. Desk D ranks §1 + §2 (the θ/α readout rows, plus a
loud warn on unknown tokens) as *"the minimum that makes either concept authorable at all."*

Desk D also names **two things NOT to build**, because they already exist and were nearly
re-specified from that desk — the same over-scoping this desk caught in the original table:
- the rotating body's angular marker — `rbr_drum_marker` (`:50322`, always-on)
- an rbr branch in `deriveMotionExpectations` — already at `deriveStateMeta.ts:496`; §6b
  **amends** that branch rather than adding one.

And one documentation fix to land in the same change: the 0c-1 contract comment at `:947-949`
calls `applied_torque_Nm` *"a constant tau_ext, which is #7's alpha = tau/I with no extra code
path"* — true for the decelerating half, **false for the driving half**, which is the half
concept #7 is about. That comment is what a later desk reads to decide whether it is blocked.

### The full input set to merge into ONE frozen scope

| Source | Items | Notes |
|---|---|---|
| `findings_d.md` §8 | 9 ranked items | The freeze source. §1+§2 blocking; §6b must ship WITH §1 |
| `findings_b.md` | **B-1, B-2** | `newtons_laws_body` / SEAM R — a **different subsystem**. Both independently confirmed. Desk B's two authored JSONs are the consumer. |
| `findings_c.md` | F-C1…F-C5, C10, PASS 7/8 | incl. **F-C4** per-state camera; C1 `theta0_rad = 1.739` travels as BINDING |
| `findings_a.md` | A-1…A-10 | incl. A-1 no time-windowed HUD glow channel; A-2 brake pad on live drag |
| this file | items 1–6 | **3 of 6 were mis-sized** — see the pre-freeze verification below |

**Merge before you dispatch.** Several asks recur across desks (the θ/α rows appear in D §2, C
and A; the camera in C F-C4 and A). Deduplicated, this is closer to **4–5 `bug_class`
dispatches**, not fifteen. Desk D's own note: items 1–3 of the original table all land in
`RBR_RO_META` + `rbrRebuildReadout` and should be **one** readout-subsystem dispatch.

**Cross-desk urgency — §6c blocks a concept that is already authored.** `formula_at_ms` (a timed
reveal on the formula surface) is ranked #7 HIGH. Desk A's `conservation_of_angular_momentum` is
authored and committed with `"motion_archetype": "equation-build"` in S7 and a timed assembly in
S3 — both silently dead without it. Desk A cannot reach Checkpoint B until this lands.

---

## ~~STATUS 2026-08-04 — BLOCKED at step 1~~ (superseded above; kept for the record)

`docs/loop_runs/rotmech/_engine/findings_d.md` does not exist, and neither does a skeleton for
`rotational_kinematics` or `tau_eq_i_alpha`. Desk D (`feat/rotmech-d`, worktree
`C:\Tutor\physics-mind-rotmech-d`) is at `897409d` — its only commit is its own state file, and
its working tree is clean. Its wave-1 0b design pass has not started.

Per this desk's contract, that is a WAIT, not a proceed. Scope stays unfrozen.

**The block is wider than Desk D.** Cross-reading all four sibling desk state files, NO item in
the scope table currently has an authoritative on-screen statement:

| # | unblocks | owning desk | 0b artifacts |
|---|---|---|---|
| 1 | `tau_eq_i_alpha` | D (wave 2) | **absent** — D's 0b not started |
| 2 | `rotational_work_energy` | A (wave 2) | **absent** — A is authoring `conservation_of_angular_momentum` |
| 3 | `rotational_kinematics` | D (wave 2) | **absent** — D's 0b not started |
| 4,5 | `rigid_body_rotation` | C (wave 2) | **absent** — C runs its 0b pass during wave 1 |
| 6 | `angular_momentum` advanced ring | C (wave 1) | **absent** — C starts at `architect`, from scratch |

Desk C's state file also says its `angular_momentum` build deliberately ships core + extended
rings only and leaves the advanced ring to 0c-3, so item 6 has no consumer skeleton by design.

## Pre-freeze verification — the scope table's premises, checked against the code

Rule 40a, done before writing any work order. **Three of the six items are mis-sized as written.
Do not dispatch the table verbatim.**

- **θ is already built.** `rbrThetaAt` (`:49952`) is a complete, grid-cached, rewind-safe angle
  integrator on the fixed 16 ms grid; `rbrThetaReset` (`:49967`) reseeds it. It is live: called
  at `:50063`, `:50232` (exposed as `window.PM_rbrTheta`), `:50557`, and `:50666` (drives the
  visible rotation). What is missing is **only the `theta` row in `RBR_RO_META`** — not an
  accumulator. Item 2 must NOT commission a W = τ·θ accumulator; it composes over `rbrThetaAt`.
- **`theta0_rad` is NOT inert.** It is read at `:50499` into `eng.theta0`, which seeds `_th` at
  `:49958` and `:49970`. The contract comment at `:953` lists it under "DECLARED, NOT
  IMPLEMENTED" and `:998` marks it "DECLARED (concept 4)" — **both comments are wrong**, and
  `:962`/`:971-973` in the same block correctly document θ as implemented. Item 3's "wire the
  declared field" is already done; item 3's real remainder is the `v = ωr` arrow alone.
- **α genuinely does not exist.** No `rbrAlpha*` anywhere; the only hit in the rbr region is the
  comment at `:50529`. Item 1 is correctly sized (α needs a closed form over the existing
  `rbrLAt`/`rbrIAt`; τ is already `eng.tau`).
- **Items 4, 5, 6 confirmed unbuilt.** `body_shape` (`:982`) has zero read sites;
  `cross_product_construction` appears only in the comment at `:954`.
- **Confirmed:** `RBR_RO_META` (`:50147-50154`) is exactly six rows — `I · ω · L · KE · dL/dt ·
  F_pull` — and `rbrRebuildReadout`'s `if (!meta) continue` (`:50163`) skips an unknown token in
  silence. The silent-failure premise the whole desk rests on holds.

**The queued `external_torque.source` inconsistency, characterized.** Declared at `:1000` as
`'brake' | 'applied_force_at_point' | 'torsion_spring'`; resolved at `:50518` as
`'applied_torque' | 'brake'`, with the live branch at `:50528-50533`. So `'applied_torque'` is a
working member absent from its own declared union, while two declared members are inert. Note
`:948` already lists `applied_torque_Nm` as IMPLEMENTED, so the type declaration — not the
implementation — is the wrong side. **This lands on Desk D's `tau_eq_i_alpha` directly**, which
is the one concept that needs applied torque; a JSON writing `source: 'applied_torque'` today
contradicts the declared union, while omitting `source` works only via the `:50518` fallback.
Fold this into the item-1 dispatch and state which side moves.

**Sizing consequence:** items 1–3 all land in `RBR_RO_META` + `rbrRebuildReadout`. Once the
skeletons exist they should be reassessed as ONE readout-subsystem `bug_class`, not three
dispatches — which is the outcome the "wait for the skeletons" rule exists to produce.

## done
(none — scope unfrozen, zero dispatches, zero engine edits, zero seeds)

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
