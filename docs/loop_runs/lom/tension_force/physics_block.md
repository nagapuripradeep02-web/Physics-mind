# PHYSICS BLOCK — `tension_force`
# Author: physics_author · Input: docs/loop_runs/lom/tension_force/skeleton.md (architect, 2026-07-30)
# Engine: `newtons_laws_body` (field_3d) — Branch B (pulley, S1–S4) then SEAM H train (S5–S7)
# Board mode: SKIPPED — Rule 20 conceptual-only directive. No `mode_overrides` authored.

## 0. Engine-bug-queue consultation

No live DB access from this read-only tool set (Read/Grep/Glob/Bash-calculator only, per the
physics_author tool contract). Consulted the same committed scar surfaces the architect used —
`docs/loop_runs/lom/connected_bodies/skeleton.md`, `docs/NEWTONS_LAWS_BODY_ENGINE_SPEC.md` §6 flags,
and the two shipped siblings (`friction_force.json`, `connected_bodies.json`) as the concrete evidence
of which prevention rules are already live in this engine family. Findings applied below:
- The field_3d `newtons_laws_body` idiom has **no literal `variable_overrides` key** — neither sibling
  JSON contains that string. Per-state divergence is expressed by each state's own `bodies[]` array
  (mass_kg / mu_s / mu_k / initial_position_m / initial_velocity_mps / applied_force_N authored
  directly per state). §2 below documents this idiom's defensive equivalent, state by state.
- Bug #1's class (`default_variables_only_first_var_merged` — a variable silently falls back to a
  wrong default because it wasn't threaded through explicitly) maps onto this engine as the
  **body-order slider-target trap**: `nlbSliderBodies()[0]`/`[1]` read the FIRST/SECOND body in the
  state's AUTHORED array order, not by id. S2's `[B, A]` ramp-target trick is exactly this failure
  mode used deliberately — flagged explicitly in §7 constraint callout 1 so json_author does not
  "simplify" the array order and silently break the state.
- GAP CANDIDATES 1–4 (already filed by the architect against this concept) are accepted as-is; no new
  gap candidates are added by this pass — see §7 callout 6 for the one NEW authoring danger this
  physics pass surfaced (the middle-cart `T` readout trap), which is a documentation/authoring
  constraint, not an engine gap.

## 1. Rigor check — every numeric claim independently re-derived

All computed with `g = 9.8` (no rounding until the final report figure). **Verdict: every claim in
the skeleton's "HARD ARITHMETIC" and "Train geometry" blocks is CONFIRMED — zero corrections.**

| # | Claim | Independent re-derivation | Verdict |
|---|---|---|---|
| 1 | S1/S2 static hold: μₛ·m_A·g = 47.04 N > m₂g = 19.60 N; holds at m₂=4 kg (39.20 N); slip threshold m₂ = 4.8 kg | 0.8×6×9.8 = 47.04 ✓; 4×9.8 = 39.20 < 47.04 ✓; 47.04/9.8 = 4.8 ✓ | **CONFIRMED** |
| 2 | S3 release, frictionless, m_A=6, m_B=2: a = 2.45 m/s², T = m₂(g−a) = 14.70 N < 19.60 N | a = 19.6/8 = 2.45 ✓; T = 2×(9.8−2.45) = 2×7.35 = 14.70 ✓ | **CONFIRMED** |
| 3 | S4 exact balance: μₖ=1/3 gives fₖ = 19.60 N = m₂g, a=0, T=19.60 N while moving at 0.35 m/s | fₖ = (1/3)×6×9.8 = 19.60 ✓ = m₂g = 2×9.8 = 19.60 ✓ → a=0 → T=m₂(g−0)=19.60 ✓ | **CONFIRMED** |
| 4 | S5/S6 train: three 2 kg carts, F=3 N, frictionless → a=0.50 m/s², T₁=1.00 N, T₂=2.00 N, ratio exactly 2 | a = 3/6 = 0.5 ✓; T₁ = 2×0.5 = 1.00 ✓; T₂ = 4×0.5 = 2.00 ✓; 2.00/1.00 = 2 ✓ | **CONFIRMED** |
| 5 | Engine formula `T_i = (Σ_{j≤i} m_j)·a − Σ_{j≤i}(drive_j+f_j)` reproduces T₁/T₂ | drive/f = 0 on P and Q (frictionless, no applied force on either): T₁ = 2×0.5 − 0 = 1 ✓; T₂ = 4×0.5 − 0 = 2 ✓ | **CONFIRMED** |
| 6 | Motion budgets: S3 1.43 s / 2.5 m; S4 4.9 m in 14 s; S5/S6 6.5 m in 5.10 s; train span 5 m inside `length_m` 7 | t=√(2×2.5/2.45)=1.4286 s ✓; 0.35×14=4.9 m ✓; t=√(2×6.5/0.5)=5.0990 s ✓; span P(−5.0)→R(0.0)=5 m inside ±7 ✓; post-run extremes R=+6.5, Q=+4.0, P=+1.5 all inside ±7 ✓ | **CONFIRMED** |

The middle-cart tension trap named in the task brief is real and worth stating precisely: the engine's
generic single-body `T` readout reports the **net** string force on a body. For a body coupled to
exactly one string (A, B, or either END cart of the train) that net equals the segment tension, but
for the train's MIDDLE cart Q it would equal T₂ − T₁ (net, not either segment's own value) — **not**
a segment tension. The skeleton never authors a per-body `T` readout on Q (S5/S6/S7 all use the
train-specific `readouts: ["T1","T2", …]`), so this trap is avoided as designed; §7 callout 6 makes it
an explicit constraint for json_author so a later edit doesn't reintroduce it.

## 2. `physics_engine_config`

```json
{
  "variables": {
    "m": {
      "name": "mass of the state's FIRST slider-target body (nlbSliderBodies()[0]) — body A / m₁ (6 kg, pulley surface block) in S1/S3/S4's authored order; body B / m₂ (the hanging load) in S2's deliberate [B, A] ramp-target order (no slider shown there); body R / m₃ (front train cart) in S5–S7's [R, Q, P] order. Only ever exposed as a live slider in S7 (explore), where it targets R.",
      "unit": "kg", "min": 0.5, "max": 10, "step": 0.5, "default": 2
    },
    "m2": {
      "name": "mass of the state's SECOND slider-target body (nlbSliderBodies()[1]) — body B / m₂ (hanging load, S1–S4) or body Q / m₂ (train middle cart, S5–S7). Glyph 'm₂' is correct for BOTH targets, deliberately (architect-confirmed).",
      "unit": "kg", "min": 0.5, "max": 4, "step": 0.5, "default": 2
    },
    "m1_train": {
      "name": "mass of the rear train cart P / m₁ — authored-fixed at 2 kg in every train state (S5–S7); NOT a true physical constant like g, simply a value with no slider (GAP CANDIDATE 4). Declared here only so the T1/T2 formulas below are legible symbols, not magic numbers.",
      "unit": "kg", "constant": 2
    },
    "F": {
      "name": "applied force pulling the train's front cart R (S5–S7 only) — the pulley rig S1–S4 carries no applied_force_N anywhere in this concept.",
      "unit": "N", "min": 0, "max": 12, "step": 0.5, "default": 3
    },
    "mu_s": {
      "name": "coefficient of static friction, body A / the train's shared table — active in S1/S2 (holds the block at rest against m2g); zero-forced by surface.frictionless in S3/S5/S6; authored but inert in S4 (the body is already moving from state entry, so the static branch never evaluates); live in S7's sandbox, AUTHORED at 0 there directly (not via frictionless:true) so a teacher-drag can raise it.",
      "unit": "", "min": 0, "max": 1, "step": 0.05, "default": 0.8
    },
    "mu_k": {
      "name": "coefficient of kinetic friction, body A — physically ACTIVE only in S4 (authored at exactly 1/3 for the exact-balance glide; see constraint callout 4 on floating-point precision), and, if dragged, in S7's sandbox.",
      "unit": "", "min": 0, "max": 1, "step": 0.05, "default": 0.4
    },
    "v0": {
      "name": "initial velocity along the shared string/train axis — authored directly on the bodies (not slider-driven) at 0.35 m/s in S4; a live sandbox slider only in S7.",
      "unit": "m/s", "min": -5, "max": 5, "step": 0.5, "default": 0
    },
    "g": { "name": "gravitational acceleration", "unit": "m/s^2", "constant": 9.8 },
    "theta": {
      "name": "incline angle — constant 0 throughout; this concept is flat ground only (the incline case belongs to connected_bodies / block_on_incline). Never a control here — controls_visible never contains 'theta' in any state.",
      "unit": "deg", "constant": 0
    }
  },
  "computed_outputs": {
    "N": { "formula": "normal reaction on the current surface body, N — m*g*cos(radians(theta)); 58.8 N for body A throughout S1–S4 (theta fixed at 0)." },
    "max_static": { "formula": "mu_s * N — the maximum static friction can supply before the block breaks free; a MAXIMUM, not friction's actual value." },
    "T": { "formula": "single-string tension, N (pulley rig only, S1–S4) — m2*(g−a); equals m2*g only when a=0 (S1, S2, S4's exact-balance glide); strictly less than m2*g the instant a != 0 (S3)." },
    "T1": { "formula": "rear-string tension, N (train rig, S5–S7) — m1_train*a; carries only the rear cart's mass." },
    "T2": { "formula": "front-string tension, N (train rig, S5–S7) — (m1_train+m2)*a; carries the rear-plus-middle cart mass; strictly greater than T1 whenever m2 != 0." },
    "a": { "formula": "shared acceleration, m/s^2 — 0 in S1/S2 (static hold) and S4 (exact balance); 2.45 in S3's default; 0.5 in S5/S6/S7's default train configuration." },
    "v": { "formula": "shared speed, m/s." }
  },
  "formulas": {
    "N": "m * g * cos(radians(theta))",
    "weight_A": "m * g",
    "weight_B": "m2 * g",
    "max_static": "mu_s * N",
    "static_hold_condition": "m2 <= mu_s * m",
    "slip_threshold_m2": "mu_s * m",
    "a_release_frictionless": "(m2 * g) / (m + m2)",
    "T_release": "m2 * (g - a_release_frictionless)",
    "a_balance": "(m2 * g - mu_k * m * g) / (m + m2)",
    "T_balance": "m2 * (g - a_balance)",
    "a_train": "F / (m1_train + m2 + m)",
    "T1_train": "m1_train * a_train",
    "T2_train": "(m1_train + m2) * a_train"
  },
  "constraints": [
    "T is a pull along the string's own line at both ends simultaneously — never a push, and never a value the string sets for itself.",
    "One ideal string carries exactly one tension value everywhere along its own length; a CHAIN of separate strings carries a different tension in each separate string.",
    "T = m2*g holds only when a = 0 (S1, S2, and S4's exact-balance glide); whenever a != 0 (S3), T = m2*(g-a) is strictly less than m2*g.",
    "Acceleration changes tension; constant velocity does not — S4 moves at 0.35 m/s with a=0 and T back at 19.6 N, identical to the at-rest S1/S2 reading.",
    "In the train, each string's tension equals (the total mass of every cart behind it) times the shared acceleration: T1 = m1_train*a, T2 = (m1_train+m2)*a; T1 != T2 whenever m2 != 0.",
    "The train's shared acceleration a = F / (m1_train+m2+m) is identical for every cart — the string forces one shared motion, exactly as the pulley does in S1-S4.",
    "String and pulley are ideal: massless, inextensible, and (at the pulley) frictionless — stated honestly in narration, never silently assumed.",
    "theta = 0 throughout this concept (flat ground only, engine constant) — the incline case belongs to connected_bodies / block_on_incline, not here."
  ]
}
```

## 3. Per-state body-value notes (field_3d idiom — the `variable_overrides` equivalent)

This engine has no `variable_overrides` key; each state's own `bodies[]` array IS the per-state
override. Documented per state, with justification, mirroring the defensive intent of the
`hinge_force`/`field_forces` `variable_overrides` pattern cited in the role spec:

- **S1**: A: `mass_kg:6, mu_s:0.8, mu_k:0.7` (mu_k authored but inert — nothing slides). B:
  `mass_kg:2, hanging:true`. No slider shown → no drift risk this state.
- **S2**: bodies authored **`[B, A]`** — DELIBERATE, not a typo (constraint callout 1). B starts at
  `mass_kg:2`, ramped 2→4 by `param_ramp{param:'m'}`; A stays fixed `mass_kg:6, mu_s:0.8, mu_k:0.7`
  the whole state. A must never be the ramp target — if the array order were accidentally flipped to
  `[A, B]`, `m` would silently ramp A's mass instead of B's and the "heavier load, larger tension"
  lesson would break with no schema error.
- **S3**: A: `mass_kg:6`; author `mu_s:0, mu_k:0` EXPLICITLY even though `surface.frictionless:true`
  already forces this — a defensive duplication (mirrors `field_forces.json`'s `m:1` pattern) so a
  future edit that flips `frictionless` off doesn't silently un-mask A's S1-carried 0.8/0.7 values.
  `initial_position_m:-3.0`. B: `mass_kg:2` — MUST be re-authored explicitly back to 2 (narration
  says "back to the 2 kilogram load"); if a copy-paste carried S2's ramped 4 kg forward, the
  headline 14.70 N number would be wrong.
- **S4**: A: `mass_kg:6, mu_k:0.333333` (see constraint callout 4 — precision matters here),
  `initial_position_m:-4.5`; `mu_s` value is irrelevant/inert (state opens already moving, so the
  static branch of the integrator never evaluates), author `0.8` for schema consistency only. B:
  `mass_kg:2, hanging:true, initial_velocity_mps:0.35`. **Flag to json_author**: confirm from the
  live renderer whether Branch B's shared initial `v` is sourced from `body_a_id`'s
  `initial_velocity_mps`, `body_b_id`'s, or requires both to agree — author `0.35` on BOTH `A` and
  `B` defensively until confirmed (redundant-but-safe, same class as the `field_forces.json` `m:1`
  precedent), and drop the redundant one once confirmed.
- **S5**: bodies authored **`[R, Q, P]`** (train order reversed from physical rear→front — mandatory
  so `F` targets R, the front cart). R: `mass_kg:2, applied_force_N:3, initial_position_m:0.0`. Q:
  `mass_kg:2, initial_position_m:-2.5`. P: `mass_kg:2, initial_position_m:-5.0`. `mu_s`/`mu_k`
  omitted or 0 (this state authors `surface.frictionless:true`). `train.body_ids:["P","Q","R"]`
  (rear→front) is INDEPENDENT of the `bodies[]` array order — SEAM H reads segment identity from
  `train.body_ids`, so the `[R,Q,P]` slider-trick order cannot desync which rope is T1 vs T2
  (orchestrator-confirmed against `nlbTrainTensions`).
- **S6**: identical bodies/train/positions to S5 (Rule 32d — same numbers, only glow_focal / phases /
  `controls_visible` / `readouts` differ). Do not re-derive new masses or positions; clone S5's block.
- **S7**: same 3-cart train; `mu_s:0, mu_k:0` AUTHORED DIRECTLY on all three carts (NOT
  `surface.frictionless:true` — that flag would hard-zero the coefficients even while the teacher
  drags `mu_s`/`mu_k` up, defeating the sliders). `F:3` (must equal `idle_auto_sweep.range[0]` — it
  does — so the first frame never steps). `trusted_drag_seizes:true`.

## 4. Within-state motion timeline + per-state control spec + narration

All `phases[]` are pure functions of the state's own clock (Rule 26). For S3 and S5, the engine has
no "hold-then-release" mechanic (GAP CANDIDATE 2 — already filed): the coupled integrator evaluates
from the very FIRST frame of the state, so in a frictionless state acceleration begins at t=0, not
after a scripted pause. Rule 32a ("cause visibly before effect") is therefore satisfied via **glow
sequencing** layered on the already-moving picture, not via a physics-timing delay — the glow opens
on the CAUSE object (weight arrow / applied-force arrow) for a readable ~0.8–1 s beat before shifting
to the readout that responds, even though the underlying value is already changing in the background.
This is the best available approximation given the engine's continuous-integration design, consistent
with how S1's reveal-build and S4/S6's phased "glow-walk" already use successive `glow_focal` changes
as the cause→effect device on a picture that never itself pauses.

### STATE_1 — "A String Pulls Along Its Own Line" (core; controls: none)

| t-window | what animates | driven by |
|---|---|---|
| 0-2000 ms | `nlb_arrow_B_weight` glows (weight arrow on B, established first) | static (a=0, at-rest hold) |
| 2000-5000 ms | glow shifts to `nlb_arrow_B_tension` (string's pull balancing weight) | same T=19.6 N reading, now the focal |
| 5000-12000 ms | glow shifts to `nlb_arrow_A_tension` (same string, far end) - hold to end | completes "one string, both ends" |

Archetype: `reveal-build`. Body positions never move — the arrow-build sequence IS the state's motion.
Rule 32b: only the arrow-visibility/glow sequence changes; both bodies hold home pose throughout.

**Narration (EN 49 words):**
> "A block on a table is tied by a string over a pulley to a hanging block. The string pulls straight
> down on the hanging block and straight along its own line on the table block, both ends. At rest,
> each pull equals the hanging block's weight: 19.6 newtons."

### STATE_2 — "Tension Matches the Load" (core; controls: none — `m` ramped via body-order trick)

| t-window | what animates | driven by |
|---|---|---|
| 0-800 ms | `nlb_arrow_B_weight` glows, static pre-roll (cue: watch this) | none - cause established before it moves |
| 800-6000 ms | `param_ramp{param:'m', from:2, to:4}` - B's weight arrow visibly lengthens; T readout + both tension arrows track m2*g continuously (equilibrium has no lag) | m2 (via the array-order trick, no slider shown) |
| 6000-14000 ms | hold final picture: m2=4 kg, T=39.2 N (< 47.04 N - never slips) | - |

Archetype: `param_ramp`. Rule 32b: only B's weight/tension track the ramp; A never moves.

**Narration (EN 50 words):**
> "Tension has no fixed value of its own; it matches whatever weight hangs on the string. Add mass to
> the hanging block, from 2 to 4 kilograms, and the tension reading grows with the weight, newton for
> newton. At rest, and only at rest, tension equals the hanging weight exactly."

*(This is the S2 planting-moment flag the task requires — "at rest, and only at rest, tension equals
the hanging weight exactly" — so S3's contrast reads as an honest reversal, not a trick.)*

### STATE_3 — "Accelerating — Tension Is Less Than the Weight" (core; controls: m2, 0.5-4 kg)

| t-window | what animates | driven by |
|---|---|---|
| 0 ms (state entry) | physics already evolving - frictionless removes the static branch entirely, so a=2.45 m/s^2 from the first rendered frame (GAP CANDIDATE 2, not a new gap) | a_release_frictionless |
| 0-800 ms | `nlb_arrow_B_weight` glows (continuity cue: same weight, still 19.6 N as in S1/S2) | - |
| 800-2190 ms | glow shifts to `nlb_arrow_B_tension`; T readout visibly falls 19.6 -> 14.7 N as the block covers its run | T = m2*(g-a) |
| 2190-16000 ms | run complete, halt at bound (choreographed as end-of-run); held picture: T=14.7 N, weight arrow visibly longer than tension arrow | - |

**CORRECTION (json_author fix round, 2026-07-30):** the run length above was mis-derived from block A's
horizontal room (skeleton's 2.5 m / 1.43 s). The actual halt is bounded by hanging body B's descent, not
A's horizontal travel: t = √(2×5.85/2.45) = 2.19 s, d = 5.85 m. The 1430 ms end-of-glow-shift figure above
is corrected to 2190 ms; the held-picture window shifts to start at 2190 ms accordingly. STATE_3's
narration itself never named a distance/duration, so no narration text needed to change — only this
timing table.

Archetype: `translate-through`. `m2` is live (0.5-4 kg) - safe at any value since the rig is already
frictionless (no slip threshold to violate here, unlike S1/S2).

**Narration (EN 55 words):**
> "Return to the 2 kilogram load, but remove the friction: the table is now frictionless. Released, the
> block slides immediately, speeding up at 2.45 metres per second squared. Tension drops the instant it
> moves, from 19.6 newtons down to 14.7, while the weight arrow still reads 19.6. Tension equals the
> weight only when nothing accelerates."

### STATE_4 — "One String Carries One Tension" (core; controls: none)

| t-window | what animates | driven by |
|---|---|---|
| 0 ms (state entry) | constant-velocity glide already running, v=0.35 m/s, a=0 (exact balance fk=m2g) | a_balance = 0 |
| 0-4500 ms | `nlb_arrow_A_tension` glows (leg 1 of the phased walk) | - |
| 4500-9000 ms | glow shifts to `nlb_pulley_wheel` (leg 2 - direction changes, size doesn't) | - |
| 9000-14000 ms | glow shifts to `nlb_arrow_B_tension` (leg 3 - same 19.6 N, far end) | - |

Archetype: `glow-walk` over one continuous `translate-through` glide (full 14 s duration = the full
4.9 m glide, so the motion never outruns or falls short of the narration window).

**Narration (EN 50 words):**
> "Friction now exactly balances the hanging weight, so the system glides at a steady 0.35 metres per
> second. The string pulls the table block forward, crosses the pulley, and pulls the hanging block
> upward — one tension, both ends, 19.6 newtons. Only acceleration changes tension, and here
> acceleration is zero."

### STATE_5 — "Two Strings Carry Two Different Tensions" (core; controls: F, 0-12 N — PRIMARY aha)

*Rig transition declared here (Rule 32d) — see constraint callout 7.*

| t-window | what animates | driven by |
|---|---|---|
| 0 ms (state entry) | train already accelerating, a=0.5 m/s^2 from the first frame (frictionless, same GAP CANDIDATE 2 limit as S3) | a_train |
| 0-1000 ms | `nlb_arrow_R_applied` glows (cause: the push driving everything) | - |
| 1000-3000 ms | glow shifts to `nlb_rope_a` (T1 = 1.00 N - the smaller number) | T1_train |
| 3000-5100 ms | glow shifts to `nlb_rope_b` (T2 = 2.00 N - the larger number); window ends almost exactly as the 5.10 s run completes | T2_train |
| 5100-16000 ms | hold final picture: three carts stopped, T1=1.00 N, T2=2.00 N | - |

Archetype: `train-pull` (coined for this concept). `F` is live (0-12 N, min=0 is the slack rail —
constraint callout 2); dragging it rescales T1 and T2 together, ratio fixed at 2 since masses are
unchanged.

**Narration (EN 54 words):**
> "Now three carts sit on the same table, joined by two strings, pulled by 3 newtons at the front. The
> two strings do not read the same: 1.00 newton on the rear string, 2.00 newtons on the front string.
> The front string carries more, since it moves more mass — not one tension everywhere."

### STATE_6 — "Each String Pulls Only the Mass Behind It" (extended; controls: m2, 0.5-4 kg — declared contrast pair with S4)

| t-window | what animates | driven by |
|---|---|---|
| 0 ms (state entry) | same physics as S5, running from the first frame; m2 (Q's mass) now live | a_train (recomputes live on drag) |
| 0-3000 ms | `nlb_body_P` glows (count the ONE cart behind the rear string) | - |
| 3000-7000 ms | glow shifts to `nlb_rope_a` (T1 = m1_train*a = 1.00 N) | T1_train |
| 7000-11000 ms | glow shifts to `nlb_rope_b` (T2 = (m1_train+m2)*a = 2.00 N); the 5.10 s run completes inside this window | T2_train |
| 11000-18000 ms | glow shifts to `nlb_arrow_R_applied` (F=3.00 N - closes the count: 1+2=3) | - |

Archetype: `glow-walk` (declared contrast pair with S4's glow-walk — same phased-traversal device,
now finding TWO numbers across two strings instead of one). Dragging `m2` live makes T2 rise while T1
stays anchored to `m1_train` (fixed, no slider) — the asymmetric response is the taught relevance.

**Narration (EN 54 words):**
> "Why are the two tensions different? Count the mass behind each string. The rear string moves only
> the cart behind it, 2 kilograms: 2 times 0.5 is 1.00 newton. The front string moves the two carts
> behind it, 4 kilograms: 4 times 0.5 is 2.00 newtons. One plus two equals the 3 newton pull."

### STATE_7 — "Explore — Change Every Value" (core; controls: ALL — m, m2, F, mu_s, mu_k, v0)

No fixed timeline — Rule 37 continuous free-run, `idle_auto_sweep{param:'F', range:[3,9]}` (range[0]=3
matches the state's own authored F, so the first frame never steps), `trusted_drag_seizes:true`.
`glow_focal: nlb_body_R` held as the anchor throughout. `theta` is never exposed — this concept is
flat-ground only (block_on_incline/connected_bodies own the slope).

**Narration (EN 20 words — exempt from the 25–55 budget per Rule 31's explore exemption):**
> "Change any value, either mass, the push, either friction number, even the starting speed, and watch
> both tension readings update."

### Per-state control spec summary

| S | controls_visible | what each control does in THIS state |
|---|---|---|
| 1 | — | none |
| 2 | — | none (m2 driven by the authored `param_ramp`, no slider rendered) |
| 3 | `m2` (0.5–4 kg) | changes the hanging load; rig already frictionless, so any value is safe — a and T re-derive live, always T < m2g |
| 4 | — | none (μk fixed at exactly 1/3) |
| 5 | `F` (0–12 N) | changes the pull on the front cart; T1 and T2 rescale together, ratio fixed at 2 (equal cart masses) |
| 6 | `m2` (0.5–4 kg, targets Q) | changes the middle cart's mass; T2 = (m1_train+m2)·a rises, T1 = m1_train·a stays anchored — demonstrates the asymmetric "only the mass behind it" rule live |
| 7 | `m, m2, F, mu_s, mu_k, v0` (ALL) | full sandbox — m targets R (m₃), m2 targets Q (m₂), F targets R (front, min 0), mu_s/mu_k write every non-hanging cart sharing the table, v0 seeds the sandbox's initial speed |

## 5. Board-mode mark scheme

**DEFERRED.** Rule 20 (conceptual-only directive) is active — no `mode_overrides` authored, no mark
scheme drafted, per the founder's 2026-06-11 suspension still in force.

## 6. Drill-down cluster phrasings (5 per cluster, 6 clusters, 30 total)

### S3 cluster — `tension_equals_weight_always`
1. "why doesnt tension equal the weight anymore"
2. "tension is not mg why"
3. "shouldnt the string pull with the full weight"
4. "why is tension less than 19.6 now"
5. "I thought T was just mg"

### S3 cluster — `string_transmits_weight_not_force`
1. "does the string send the weight through it"
2. "is tension just the weight passing through the rope"
3. "why does the string not carry the full weight"
4. "how can tension be less than what is hanging"
5. "if nothing is added why did tension drop"

### S3 cluster — `tension_while_accelerating`
1. "why does acceleration change the tension"
2. "does moving make the string weaker"
3. "why is T smaller once it starts sliding"
4. "what decides tension if not the weight"
5. "why does letting go change the number"

### S5 cluster — `same_tension_everywhere_chain`
1. "why are the two strings different numbers"
2. "shouldnt every string in the chain have the same tension"
3. "I thought one pull means one tension everywhere"
4. "why isnt T the same on both ropes"
5. "does every string in a line carry the same pull"

### S5 cluster — `front_string_vs_rear_string`
1. "why does the front string read more than the back one"
2. "which string should be bigger, the one near the pull or far from it"
3. "why is the string closest to the push not the smallest"
4. "does the string near the force always carry more"
5. "why does the rear string only show half the number"

### S5 cluster — `tension_equals_applied_force`
1. "why doesnt the front string just equal the 3 newtons"
2. "isnt the tension the same as the force we applied"
3. "why is T2 only 2 not 3"
4. "shouldnt the string touching the push carry the whole force"
5. "where did the missing 1 newton go"

## 7. Constraint callouts

1. **S2 body-order ramp trick is mandatory, not incidental.** `bodies` MUST be authored `[B, A]` so
   `param_ramp{param:'m'}` targets the FIRST non-ghost body = B (the hanging load). Reordering to
   `[A, B]` is schema-legal and silently ramps A's mass instead — no validator catches this.
2. **F ≥ 0 slider rail (S5/S7).** `slider_controls.F = {min:0, max:12, step:0.5, default:3}`. A
   negative F pushes the train backward, slackens both strings, and the engine HIDES a non-positive
   segment rather than draw a wrong one — the visible failure is a missing rope, not a wrong number.
3. **m2 slider cap = 4 kg (S3/S6/S7), not 4.8 kg.** Pedagogical, not physical: keeps the SAME `m2`
   slider from ever demonstrating a slip this concept doesn't teach (S1/S2's slip threshold is 4.8 kg).
   S3 itself is already frictionless, so any m2 up to the cap is physically safe there regardless.
4. **μₖ floating-point precision, S4 only.** The exact-balance state needs μₖ·m·g = m2·g exactly, i.e.
   μₖ = 1/3 = 0.333333…, not exactly representable in IEEE-754. Author `mu_k: 0.333333` (≥6 decimal
   digits) so fₖ rounds to the displayed 19.60 N. A shorter `0.33` gives fₖ = 0.33×58.8 = 19.404 N —
   visibly WRONG on the readout (shows 19.40, not 19.60), breaking the "T stays at 19.6 N" claim.
5. **Glyph "m₁" is deliberately reused across two different bodies.** Body A (S1–S4, 6 kg) and body P
   (S5–S7, 2 kg) both carry the label "m₁" — different physical bodies, different rigs, never on
   screen together, per the declared S4→S5 rig transition (Rule 32d, constraint 7 below). Not a
   collision; do not invent a separate glyph for P.
6. **Middle-cart tension readout trap.** The generic single-body `T` readout reports the NET string
   force on a body — for the train's MIDDLE cart Q that would be T2 − T1 (net), not a segment tension.
   Never author a plain `'T'` readout targeting Q; S5/S6/S7 must keep using the train-specific
   `T1`/`T2` readouts sourced from the rope sprites (`nlbTrainTensions`), exactly as the architect's
   per-state table already has it — this callout exists so a later edit doesn't "simplify" it away.
7. **The S4→S5 rig transition is a declared scene cut (Rule 32d), not a bug.** The pulley, hanging
   block, and A leave; three carts and two strings appear. Continuity anchors: same table surface
   (`length_m:7`), same HUD/slider panel position, first sentence of S5 names the change plainly
   ("Now three carts on the same table, joined by two strings").
8. **θ is a hard `constant: 0` everywhere in this concept.** `cos(radians(theta))` in the `N` formula
   is written for schema consistency with the incline-owning siblings and reduces to `cos(0)=1`
   identically; no state's `controls_visible` may ever contain `'theta'` here.
9. **`mu_s`/`mu_k` write EVERY non-hanging, non-ghost body sharing a surface** (orchestrator-confirmed
   against `nlbApplyParam`). In S7's train sandbox, dragging `mu_s`/`mu_k` changes all three carts'
   coefficients together — there is no per-cart friction differentiation available.
10. **S4's `v0=0.35` is authored on the bodies directly, not slider-driven.** Author it on BOTH `A`
    and `B`'s `initial_velocity_mps` defensively (§3) until json_author confirms from the live
    renderer which side (or both) Branch B actually reads for its shared initial `v`.
11. **Rule 38d dialect note is a CAPTION/LABEL requirement, not a narration rewrite.** The architect's
    Definition of Done commits to dual-labeling "string" as "string (rope/cord)" at first on-canvas
    appearance (S1's label/caption), then bare afterward. The `teacher_script` narration below uses
    "string" throughout — a spoken parenthetical reads badly in TTS — so json_author satisfies 38d on
    the VISUAL label/caption text only, separately from the narration authored here.

## DoD physics-layer confirmation (brief)

- **aha_moment check**: PRIMARY (S5) — "one pull, two different tensions, T1=1.00 N, T2=2.00 N" —
  physically TRUE, re-derived independently in §1. SUPPORTING (S3) — "T=m2(g−a) < m2g the instant it
  accelerates" — TRUE, re-derived. Neither is wrong-but-memorable.
- **misconception_watch check**: S3's counter (14.70 N vs 19.60 N, unequal arrow lengths) and S5's
  counter (1.00 N vs 2.00 N under one 3.00 N pull) are both numerically exact matches to §1's
  re-derivation — no correction needed.
- **Notation ladder (38c)**: every formula in §2 is algebra-only (no calculus, no vector operators) —
  correct for core/extended rings; S6 (extended) still uses only `T1=m1·a`, `T2=(m1+m2)·a`, no
  calculus needed anywhere in this concept.
- **Symbol-label table** (engine Unicode sprites, narrated once before relied on): T, T₁, T₂, m₁, m₂,
  m₃, N, fₖ, F, a, μₛ, μₖ — every one of these appears in the narration above before any state relies
  on it silently.

## Self-review checklist

- [x] Every symbol in the narrations (T, T1, T2, m1/m2/m3, F, a, weight, N implicitly via "table")
      appears in `variables`/`computed_outputs`.
- [x] `radians()` used in every formula with an angle argument (`N`).
- [x] Live control(s) declared per state match the architect's control table exactly (§4 table).
- [x] Per-state body-value notes documented for every state that needs them, each justified (§3).
- [x] Board mode: SKIPPED per Rule 20 — no mark scheme drafted.
- [x] Drill-down phrasings (30 total, 6 clusters × 5) sound like real confused students, plain English.
- [x] `constraints` block: 8 short factual assertions (§2).
- [x] Numerical sanity check: m=6, m2=2, frictionless → a=2.45, T=14.70 N (Python-verified, §1).
- [x] Within-state motion timeline for every state (§4); no two states share a motion; no static
      state; controls match architect table; Rule 26 (pure fn of state clock) honored throughout.
- [x] Rule 32 sequencing: cause-before-effect via glow sequencing in every state (§4 notes the S3/S5
      engine limitation honestly — no scripted pause exists, glow layering is the mitigation).
- [x] Word budget (Rule 31a): S1=49, S2=50, S3=55, S4=50, S5=54, S6=54 (all 25–55); S7=20 (exempt,
      explore). Every count verified with `wc -w`, not estimated.
- [x] Rule 41 plain-language law: narration scanned against the full banned-word list — zero matches
      (verified with `grep -inE` against the banned-word pattern, §4 drafts).
- [x] Notation ladder (38c): algebra-only throughout, no calculus smuggled onto core/extended states.
      Dialect (38d): flagged as json_author's caption-layer responsibility (constraint 11).
- [x] Engine bug queue consulted via committed scar docs (no DB access); prevention rules applied,
      documented in §0.
- [x] DC Pandey check: consulted no external book for any formula, derivation, or example problem —
      every formula in §2 is derived directly from Newton's second law applied to the coupled-body
      and multi-body-chain systems (F=ma per body, summed/eliminated). The real-world anchors (§9 of
      the skeleton — luggage tow train, elevator cable) were authored by the architect, not this pass.

---

## ORCHESTRATOR RESOLUTIONS (read from the committed renderer, 2026-07-30)

Answers to the two items physics_author flagged as unresolvable from a read-only context.
json_author: take these, do not re-derive.

### 1. S4's `initial_velocity_mps` — WHICH body to author it on (resolved: either; author it on A)

`nlbSeedKinematics()` seeds the coupled branch like this: it walks `eng.order`, takes the FIRST body
whose `v0` is non-zero, and sets the shared string scalar `q = c_i · v0`; every body then receives
`v = c_i · q`. So:

- Authoring `initial_velocity_mps` on **either** body of a pulley pair produces the IDENTICAL motion,
  because the sign factor is applied on the way in and again on the way out.
- For this rig the sign factors are both **+1**: `refId` = `pulley.body_a_id` = A, A is not hanging so
  `sigRef = −1`, giving `c_A = +1` (it is the reference) and
  `c_B = −(sigRef · (+1)) = +1`. A therefore glides UP-SLOPE (+s, toward the pulley) while B descends,
  which is exactly the S4 picture (A: −4.5 → +0.4 over 14 s at 0.35 m/s).
- **Author v₀ = 0.35 on A only.** Do NOT author a v₀ on both bodies: the loop `break`s at the first
  non-zero one, so a second, different value would be silently ignored — a trap, not an error.
- No defensive dual-authoring is needed; the workaround physics_author proposed can be dropped.

### 2. μₖ = 1/3 precision — CONFIRMED, author `0.333333` (6 decimals)

fₖ = μₖ · m_A · g = μₖ · 58.8, so exact balance against m₂g = 19.60 N needs μₖ = 19.6/58.8 = 1/3.
- `0.333333` → fₖ = 19.599994 N, residual a ≈ 7.5 × 10⁻⁷ m/s² — invisible over the 14 s state ✓
- `0.33` → fₖ = 19.404 N, a = 0.0245 m/s²: v nearly DOUBLES across the state and T reads 19.55 N
  instead of 19.60 N. That visibly contradicts S4's whole claim ("a = 0, so T is back to m₂g").
So the precision is load-bearing, exactly as flagged. Author 6 decimals.

### 3. Standing constraint restated (physics_author's callout 6, kept visible)

The engine's per-body `T` is the NET string force on that body. For a train, a MIDDLE cart's `T` is
therefore `T_ahead − T_behind`, which is a real quantity but NOT a segment tension. Never put a
per-body `T` readout on a middle cart and label it a segment tension — use `T1`/`T2`, which the
engine computes per SEGMENT (`nlbTrainTensions`).
