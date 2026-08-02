# FOUNDER_PROXY — CHECKPOINT A (design gate)

**Concept:** `conservation_of_mechanical_energy` · **Chapter:** Ch.6 Work, Energy and Power · **Cycle:** 1 of 2
**Skeleton reviewed:** `docs/loop_runs/ch6/conservation_of_mechanical_energy/skeleton.md`
**Date:** 2026-08-01 · report-only (the agent wrote no repo file; persisted here by the dispatching session)

## VERDICT: `DESIGN_FIX` → `alex:architect` (cycle 1 of 2)

The pedagogy is genuinely good — the arc is well-shaped, the PRIMARY aha is correctly chosen and
earned by S1, the misconception work at S3/S5 is real confrontation, the anchors are clean under
Rule 35, and the plain-language audit holds.

But this skeleton is also the **0c engine contract**, and against that job three of its load-bearing
claims cannot be produced by the engine it says it reuses. In each case **the screen would contradict
the state's own caption**. Additionally the Phase-0 union table is not covered: concepts #1, #2, #5
and #8 would force further renderer edits — the survey's own STOP condition.

No physics error exists in the authored content (no ESCALATE trigger). The defects are in what the
engine can *show*.

> **Independently verified by the dispatching session before acting (2026-08-01):**
> **F1** — all 15 `NLB_SPRING_*` constants are geometric/timing (`COILS`, `WIRE_R`, `COMPRESS_FRAC`,
> `RING_MS`, `SLOW_DEFAULT`, …); there is **no spring constant `k`** anywhere in the renderer.
> **F3** — `field_3d_renderer.ts` L42897–42901 sets `v1 = 0; a = 0;` at a track bound, with the
> comment *"there is nothing left to integrate against a wall."* Both findings stand.

---

## P1 — blocking

### F1 · The spring this design needs does not exist; the spring that does exist contradicts it
`owner: alex:architect` (consult `peter_parker:field3d_surgeon` on cost)

Engine spec note 8 says *"while the block overlaps the spring, a = −kx/m … exact elastic exchange …
Reuses the existing `nlbSpring*` geometry."* Two problems with "reuses":

- **No spring constant exists.** `NLB_PUSH_OFF_SPEC.md` defines `spring?: { between: [id, id] }` and
  no `k`. The renderer's spring constants are geometric only (`NLB_SPRING_COILS = 8`,
  `NLB_SPRING_WIRE_R = 0.022`, `NLB_SPRING_COMPRESS_FRAC = 0.45`). There is no `½kx²` to compute and
  no force law to integrate.
- **The spring is a scripted stroke.** `NLB_SPRING_CHOREOGRAPHY_SPEC.md` (founder-approved
  2026-07-30, scope *"EVERY state that uses a spring, in every concept, now and later"*) mandates
  `approach → compress → hold → slowed release → ring`, with a force RAMP and a LATCHED hold.

**Consequence:** an energy layer plotting `Uₛ = ½kx²` over a *scripted* compression draws a total
column that rises and falls, because the scripted force is not `−kx` and the exchange is not elastic.
S4's caption says the total is flat. The screen would say otherwise, in the concept's own
three-account showcase state.

Also a **union-table failure**: concept **#8 `elastic_potential_energy_spring`** needs exactly this.

**Required:** specify genuine elastic contact (`spring.k_N_per_m` + natural length, `F = −kx` inside
the integrator, affine in dt so Rule 36 holds, `x` exposed to the layer) **and explicitly reconcile
with the `spring_action` directive** — this is a founder-directive collision the architect may not
resolve unilaterally.

### F2 · S4 on flat ground makes `U_grav ≡ 0`: the "three segments" claim is false
`owner: alex:architect`

S4 ramps θ→0. The `h = 0` reference sits along the ground, so `U = mgh = 0` for the whole state: the
E column has **two** live segments and one permanently-dead one labelled `U`, while the formula
surface names a term that is identically zero. Second defect: S5/S6/S7 return to 30° but nothing
ramps θ back — an apparatus teleport at the S4→S5 click (Rule 32d break).

**Required (also resolves most of F3):** keep the incline as permanent home pose and mount the spring
**against a fixed wall at the base**. S4 becomes: slide down (U→K) → compress (K→Uₛ) → spring back
(Uₛ→K→U), oscillating perpetually. All three segments live, no θ ramp, no home-pose break, no track
bound ever reached. `fixed?: boolean` already exists and the wall-anchored mount was fixed 2026-07-30.

### F3 · The track bound collapses `E_total` to zero — in the frame the teacher lands on
`owner: alex:architect`

`nlbBoundsM()` clamps at the surface end and forces `v = 0` (two FIXED CRITICAL scars already exist
on the readout layer for this). Under an energy layer `K = ½mv²` drops discontinuously to 0 and
`E_total` with it.

Not an edge case — the default. `length_m` default 6 (≈12 m of track); a frictionless 30° release
gives `a = 4.9 m/s²`, covering 12 m in **≈2.2 s**, while a 40–55-word state runs **≈16–22 s**. So in
S1, S2, S3, S6, S7 the block is parked at a wall with `E = 0` for ~85–90% of the state — including
the `SET_TIME_FREEZE` frozen frame, which is both the reviewer screenshot and the H2 baseline.

S3's `§10(d)` motion plan is additionally wrong: *"natural slope oscillation"* does not exist on a
single inclined plane. S7's "one slow slide" over ~20 s is impossible on ~12 m with no mechanism named.

**Required:** (1) adopt F2's wall+spring base so motion is bounded by PHYSICS not the track;
(2) add a layer invariant — a velocity zeroed by a geometric clamp must never be presented as an
energy change; (3) correct S3's and S7's motion plans.

### F4 · Note 2's Rule-36 argument is false for three of the layer's own mechanisms; `RESET_TRAJECTORY` never mentioned
`owner: alex:architect`

Note 2 claims frame-rate independence *"by construction … with zero special-case code"* because bars
are derived from `(v, s, x)`. Sound for K/U_grav/U_spring; contradicted three notes later by:
note 10's `W` accumulator (fold-exact only while F is position-independent — the spring is not),
note 11's capture-on-pass latch (history), and `E_dissipated` (a path integral, not derivable from
instantaneous state).

Recurrence of two scars: `spec_semi_implicit_euler_position_not_step_count_invariant` (OPEN) and
`field3d_integrating_scenario_ignores_reset_trajectory_and_carries_stale_accumulator` (FIXED), whose
prevention rule requires every accumulator restored, clock zeroed and latch re-armed on
`RESET_TRAJECTORY`. THE EYE drives `RESET → pin → RESET → dense → RESET → frozen`.

**Required:** (a) restrict note 2's claim to the three derived bars; (b) prefer the state-function
form `E_dissipated = E_total(t₀) − K − U_grav − U_spring` (fold-exact for free); (c) add explicit
`RESET_TRAJECTORY` coverage for every accumulator, latch and one-shot.

### F5 · Union gap: the `cos θ` decomposition (#1, #2) has no primitives
`owner: alex:architect`

Three primitives missing, none exist today: a **displacement vector `d`**, an **angle arc** between
an arrow and `d`, and an **applied force at an authored angle** (`applied_force_N` is a scalar drive
along the body's own axis — no angle field). The textbook opening picture of this chapter (a case
pulled by a handle at an angle) cannot be drawn.

### F6 · Union gap: `W` is signed; the bar model is zero-based with no signed rendering
`owner: alex:architect`

Concept **#2** is entirely about the sign; #4/#5/#6/#10 all need negative work. A bar growing from a
zero baseline cannot show −18 J. Specify a mid-scale zero baseline, sign-coloured, signed numeric —
and note that `E_total`'s stack is unsigned while `W` bars are signed.

### F7 · Rule 38b: the explore state exposes `μₖ`, which is extended-ring content
`owner: alex:architect`

In the `intro` preset (S1–S4 + S8) a student taught for four states that the total never moves reaches
a sandbox with a μₖ slider, drags it, and watches the total drop — with no state explaining why. The
sim teaches the misconception S5 exists to prevent, to the audience that never saw S5.

**Required (cheapest fix is also pedagogically right): move S5 to the `core` ring.** The atomic claim
is *"when only conservative forces act…"* — the validity boundary is part of the claim, not
enrichment. Then `intro` = S1–S5 + S8, every cut coherent, μₖ legitimate.

### F8 · S8 is internally contradictory: formula names `Uₛ` but controls have no spring and no `k`
`owner: alex:architect` — resolved cleanly by F2's permanent wall+spring.

## P2

- **F9** — S2's delta cue `"Total height stays constant"` is ambiguous on the concept's own key noun:
  `h` is a taught variable with a labelled line on screen. A student can read it as *the block's*
  height staying constant — false, and the opposite of S1. Use `"Total never changes"`.
- **F10** — Five of eight states expose no control, including the PRIMARY aha. The most convincing
  demonstration of conservation is a teacher changing θ or release height and the column top **not
  moving**. Give S2 one contextual control; this is the difference between competent and highest-value.
- **F11** — Union gap: concept #5 needs **two concurrent** named-force accumulators (gravity returns
  0, friction does not, side by side); note 10 specifies one.
- **F12** — The energy panel is a **fourth** right-edge overlay zone against one OPEN and one FIXED
  collision scar. Move it to the **left** edge (unoccupied, and puts bars beside the incline's high
  end) and require a measure-and-reflow ladder rather than fixed CSS.
- **F13** — No per-state `camera_position` anywhere. The OPEN scar's authoring corollary requires one
  per state for 3D mechanics; this concept's claim is a **vertical** comparison and the default
  oblique camera makes "same height" unreadable.

## P3

- **F14** — S6's glow focal is a *group* of two DOM readouts; `applyGlowEmphasis` does not reach DOM
  HUD rows. Pick a mesh-level focal or extend note 13.
- **F15** — Live bug-queue not queried in the architect dispatch (no shell tool). Pass 1 substituted
  the full scar-candidate corpus this cycle; run it before cycle 2.
- **F16** — Note 15 names two `deriveStateMeta.ts` sites; the scar says **three**. Also: prove the
  frozen pin lands inside a slide, not on a `loop_reset_ms` boundary, or the H2 baseline is minted on
  a restart frame.

## What is genuinely good — keep verbatim through cycle 2

- **The arc and aha designation.** S1 plants "K is appearing" without showing a sum; S2 kills it with
  the pinned column. Deliberate, correct, the best structural decision in the skeleton. PRIMARY/
  SUPPORTING split is the 1+1 sweet spot; S6 correctly *not* promoted.
- **S3's ghost marker** — a dim marker at the height the student expects, visibly passed every cycle.
  Real 16a confrontation: a prediction the sim falsifies on screen.
- **The physics.** S3's stop height (`h = v₀²/2g`) correct; S6's mass-independence correct and
  honestly staged; S7's derivation chain correct and correctly gated to advanced. **No physics error.**
- **Rule 35/41.** Roller coaster + trampoline are culture-neutral, widest-overlap, physics-true at
  depth. **Zero Indian-anchor leakage** from the pre-Rule-35 catalog. No personification anywhere.
- **The stacked-column decision** (note 4) is the layer's genuine signature idea.
- **Reserving the `E_dissipated` slot now** (note 1) is exactly the Phase-0 thinking the survey asked for.

## Union-table answer: could the other 11 be authored as pure JSON?

**No.** #1 and #2 blocked by F5 (no `d` vector, no angle arc, no off-axis force); #2 also by F6
(no signed bar). #5 blocked by F11 (one accumulator, needs two). #8 blocked by F1 (no spring
constant, no elastic physics). #3, #4, #6, #7, #10, #11, #12 are genuinely reachable as authored.
**Four of eleven forcing renderer edits is the survey's own STOP condition.**

## Minimal path to `DESIGN_OK` (ordered to collapse the most findings)

1. Home pose becomes **incline + fixed wall + spring at the base**, permanent, no θ ramp → F2, most of F3, F8.
2. Specify **real elastic contact** and reconcile with `spring_action` → F1, unblocks #8. **← founder decision**
3. Add the **clamp-never-collapses-E invariant**; correct S3/S7 motion plans → F3.
4. Rewrite note 2 honestly; add `RESET_TRAJECTORY`; prefer state-function `E_dissipated` → F4.
5. Cover union gaps: `d` vector + angle arc + off-axis force (F5), signed W bars (F6), N accumulators (F11).
6. **Move S5 to `core`** → F7 and both Rule-38 cut checks.
7. Energy panel to the **left** edge with reflow (F12); author a **per-state camera** (F13).
8. Retitle S2's delta cue away from "height" (F9); give S2 one contextual control (F10).

## Routing

All findings → **`alex:architect`** (cycle 1 of 2). F1/F3/F4/F5/F6/F11/F12 change the ENGINE SPEC
NOTES, so `peter_parker:field3d_surgeon` is a consulted party on cost before cycle 2 closes — but
this is an architect edit, not an engine dispatch.

**Nothing goes to the surgeon until the spec is corrected.** Building F1's spring or F3's bar
semantics against the current text would be building the wrong engine — the exact failure Phase-0
exists to prevent.

**F1 contains a founder-directive collision** (`NLB_SPRING_CHOREOGRAPHY_SPEC.md` scope: *"every state
that uses a spring, in every concept, now and later"*) that the founder may wish to rule on directly
rather than spend a design cycle.

## Candidate scar rows — NOT applied (files only, per protocol)

Three `directive` rows drafted, saved to `scar_candidates.sql` in this directory:
`energy_layer_over_a_scripted_choreography_apparatus_draws_a_false_conservation_curve` (CRITICAL) ·
`energy_bars_collapse_to_zero_when_a_geometric_track_clamp_zeroes_velocity` (CRITICAL) ·
`layer_spec_asserts_frame_rate_independence_by_construction_while_adding_accumulators_and_latches` (MAJOR).
