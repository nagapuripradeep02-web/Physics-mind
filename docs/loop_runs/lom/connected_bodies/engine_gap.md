# Engine notes — `newtons_laws_body`, found while authoring `connected_bodies` (concept 2 of 3)

> **The concept is NOT parked — it SEALED.** But it cost THREE engine commits, which trips the
> chapter loop's runaway guard (`docs/CHAPTER_LOOP.md` §3b: "if `engine_commits:` reaches 5, PAUSE
> the loop and notify the founder"). This file is that notification. Discovered 2026-07-25/26,
> branch `feat/lom-a`, engine as of `ff408ed` → `aa7daf5`.

---

## THE HEADLINE — the runaway guard has tripped

Loop-phase engine fixes on this branch now stand at **5 of 5**:

| # | Commit | Concept | bug_class |
|---|---|---|---|
| 1 | `cd8fe67` | free_body_diagram | `RESET_TRAJECTORY` was a silent no-op for `newtons_laws_body` |
| 2 | `ff408ed` | free_body_diagram | nlb two-body lane offset |
| 3 | `5a07aa9` | connected_bodies | `nlb_coupled_initial_velocity_never_seeded` |
| 4 | `bc649d4` | connected_bodies | `nlb_coupled_readouts_revert_to_rest_values_on_bound_halt` |
| 5 | `aa7daf5` | connected_bodies | `nlb_pulley_group_hidden_with_surface_in_atwood_mode` |

Per the protocol, **the loop should not start `block_on_incline` until you have looked at this.**

**My read on what it means.** The guard's stated hypothesis is "the Phase 0 design under-generalized."
I do not think that is quite what happened, and the distinction matters for your decision:

- All three `connected_bodies` defects are in the **coupled Branch B** path, and all three were
  *latent from the Phase 0 build* — they were not new requirements this concept invented. The
  config surface itself needed **zero** new keys: `json-author` expressed all 7 states, including
  both structural variants, without asking for a single engine feature. That is the spec's
  "concepts 2–6 need ZERO renderer edits" claim holding at the CONFIG level.
- What under-generalized was the Phase 0 **bring-up proof**, not the design. Branch B was proved on
  a fresh `SET_STATE` with default initial conditions. Every one of the three defects requires
  something slightly past that: an authored `initial_velocity_mps` (#3), a state that runs long
  enough to hit its bound (#4), or the one state that authors `surface.hidden` (#5). Each was
  invisible to 31/31 deterministic checks.
- **`block_on_incline` is the third structural extreme and is single-body-on-a-slope** — it shares
  the friction/threshold path with this concept but does NOT use Branch B's coupled integrator or
  the pulley geometry. On that reading, the three fixes above have already retired most of the risk
  it would have faced, and it is the *least* likely of the three to need engine work. The known
  exception is the pre-approved `param_ramp` (see §7.1 of CHAPTER_LOOP.md), which is a genuine
  missing feature rather than a defect.

**Recommendation:** treat the guard as a checkpoint you clear rather than a stop. If you agree,
raise or reset the budget before the next session; if you would rather re-examine the approach
first, `block_on_incline` is the natural place to pause, and it is the only concept left in this
worktree.

---

## The three fixes, briefly (full detail in the commit messages)

### FIX 1 — `5a07aa9`: a coupled state ignored its authored initial velocity

`connected_bodies` STATE_1/STATE_2 authored a 0.35 m/s constant-velocity glide and rendered
**completely static** — byte-identical frames from t=0 to t=15000 ms, with both `v` readouts at 0.00
while the caption taught "both bodies share one speed."

Two defects on one seeding path, either alone sufficient: (a) Branch B integrates ONE scalar along
the string and overwrites `b.v` from it every tick, so seeding the per-body `v` was a no-op — the
shared scalar was hardcoded to 0; (b) the string's all-or-nothing bounds veto then zeroed any seed,
because a hanging body authored with no `initial_position_m` starts below the pulley-clearance bound
`NLB_HANG_MIN_M = 1.15 m`. `nlbSeedKinematics()` now clamps each coupled seed into its own band
(`s` and `s0`) and seeds the shared scalar on entry and on `RESET_TRAJECTORY`.

**The reusable lesson:** *seed the constraint, not its projections.* Where per-body state is DERIVED
from a shared constraint scalar, seeding the derived field is silently discarded.

### FIX 2 — `bc649d4`: the readouts reverted to the misconception after the halt

The bound veto was zeroing the **acceleration solution** as well as the motion. So once an
accelerating body reached its bound, the HUD switched to the rest-state answer. On STATE_3 — this
concept's PRIMARY aha, captioned "T is not m₂g" — that meant the tension readout displayed
**`T = 19.60 N = m₂g`, exactly the misconception the state exists to break**, for ~19 of its 20 s,
including the frozen frame a teacher pauses on and the H2 baseline that frame would have minted.
STATE_6 likewise fell back to the two separate weights (20.58 / 19.60) instead of the one shared
20.08 N.

Fixed by deleting one assignment: the veto now zeros motion only, so the achieved solution is held
by **recompute** rather than a latched snapshot — which keeps readouts live when a teacher drags a
slider on a halted state (every guided state here except S1/S2 exposes sliders).

**The reusable lesson:** a veto that keeps an object inside its geometry must zero MOTION only,
never the force solution the readouts and the taught claim are drawn from. And for reviewers:
**judge a dynamics HUD LATE in the state, not only during its motion burst.**

### FIX 3 — `aa7daf5`: the Atwood pulley vanished with the table

The pulley bracket is parented to the surface group (deliberate — one `theta` rotation stands the
post on the incline at any angle, and STATE_5 depends on it). `surface.hidden` was applied to that
same group, so STATE_6 — the one state that authors it — hid the slab **and** the pulley. Both ropes
terminated in open space and the state's declared `glow_focal: nlb_pulley_wheel` did not exist on
screen. The hide now scopes to the slab mesh; parenting and transforms are untouched.

**The reusable lesson:** an element's effective visibility is the AND over its ancestor chain. A hide
flag authored against a named part must be applied to that part's own mesh, never to a group that
also parents unrelated apparatus — and a probe asserting `obj.visible` cannot see this class.

---

## CARRIED TO YOU — three items shipped unfixed, both reviewers concur they are non-blocking

The runaway guard closed the door on a fourth engine commit. Both quality-auditor and eye-walker
independently judged each of these acceptable to carry, and I agree. They batch cleanly into ONE
future `field3d-surgeon` dispatch.

1. **(LOW–MED) S7 sandbox reaches a non-physical `a > g`.** `T > 0` requires `a < g`; the threshold
   is `F < m₁g(1 + sinθ + μₖcosθ)`, worst case **≈4.9 N** at `m₁=0.5, θ=0, μₖ=0` — while the shared
   `F` slider runs to **±20 N**. A teacher who maxes `F` against near-minimum mass drives the rigid
   coupled model into a regime where a real string would go slack and the bodies would decouple;
   the model keeps solving and reports a magnitude-masked impossible tension (probed live:
   `a = 15.06`, `|T| = 10.51`). Not JSON-fixable — the slider range is the engine's shared panel.
   Found analytically by `physics-author` BEFORE it was observed, which is worth noting.
   Fix options: clamp `T` at 0 with a "rope goes slack" visual, or narrow the shared `F` slider.
2. **(LOW, Rule 34d) S7's m₂ HUD block bleeds into the slider panel below it.** The sandbox is the
   only state with a 5-readout HUD. Related: STATE_7's `formula_overlay` was REMOVED (rather than
   moved) to clear a worse collision with the same HUD, because the engine has no per-state
   positional override for `#nlb_formula` / `#nlb_readout` — both are hardcoded CSS zones. Both
   reviewers judged the removal defensible for a sandbox. A durable fix sizes the formula zone off
   the actual rendered HUD height.
3. **(COSMETIC, new) STATE_6's pulley post base floats.** With the slab gone the post ends in open
   space rather than mounting to a stand or ceiling. This layer had never rendered before FIX 3, so
   nobody had ever seen it. eye-walker reads it as standard textbook Atwood-diagram convention;
   quality-auditor calls it "looks slightly unfinished, not wrong." Your call whether it is worth
   a mount.

---

## Gaps carried FORWARD from concept 1 — status

- **GAP 1 (no monotonic parameter ramp for a guided state) — STILL OPEN, and it bit again.** This
  concept's STATE_5 wanted a 0°→30° tilt and shipped a STATIC 30° incline, the same resolution
  `free_body_diagram` STATE_5 took. Acceptable both times because the tilt was not the point.
  **It is the point on `block_on_incline`** ("tilt until the block breaks away at tan θ = μₛ"), and
  the `param_ramp` fix for it is already pre-approved in CHAPTER_LOOP.md §7.1. Note that building it
  would be engine commit #6 — so the runaway-guard decision above needs to be made before, or as
  part of, that work.
- **GAP 2 (`hanging: true` needs a pulley) — CLOSED as designed.** This concept owns the tension
  arrow and covers it properly through the pulley/rope path, exactly as concept 1 handed off.
- **GAP 3 (`RESET_TRAJECTORY` no-op) — remained fixed.** `nlbSeedKinematics()` extends it to
  velocity, so a replayed coupled state now rewinds both position and speed; proved bit-identical
  under a repeated time-pin sequence.

---

## Note on gate coverage (the concept-1 lesson, confirmed again)

**Every defect in this concept passed 31/31 deterministic checks.** All three were caught only by
the two reviewers reading the actual runtime — eye-walker found the static S1/S2 in the pixels
(byte-identical frames), quality-auditor found the reverting HUD by probing the live readouts late
in the state, and the pulley absence was found independently by BOTH. Keep them mandatory and
parallel.

The concept-1 instruction to **probe the runtime rather than reason from either reviewer** paid for
itself directly: the surgeon's first dispatch found that the named fix (seed the velocity) did NOT
clear the symptom, and only a live probe revealed the second link (the bounds veto zeroing the
seed). A dispatch that had trusted the diagnosis would have reported success on a still-dead state.

One process note in the other direction: neither reviewer was wrong this cycle. The false-positive
classes recorded from concept 1 (frozen-frame semantics, the designed-around halt, the static
incline) were listed explicitly in both dispatch prompts, and neither reviewer tripped on them —
worth continuing to do.
