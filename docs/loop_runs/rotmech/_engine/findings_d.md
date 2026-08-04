# Engine findings — Desk D (`rotational_kinematics` · `tau_eq_i_alpha`) → build 0c-3

**Desk:** `feat/rotmech-d` · `C:\Tutor\physics-mind-rotmech-d`
**Owner of the fix:** Desk E (`peter_parker:field3d_surgeon`). Desk D never edits `src/`.
**Status: PASS 1 — engine audit, filed EARLY and deliberately.**
Wave-1 design (architect skeletons + Checkpoint A + physics blocks) is in flight. **This file
will gain a PASS 2 once both skeletons are `DESIGN_OK`.** Everything below PASS 1 is verified
against renderer code this session and does not depend on the skeletons landing — it is filed
now so 0c-3's scope cannot freeze without it.

Surface under audit: `rigid_body_rotation` (`rbr`), the 0c-1 frozen contract at
`src/lib/renderers/field_3d_renderer.ts:939`. Implementation `:49737–50700`.

---

## 0 · The one-paragraph version

Desk D owns the two concepts whose entire subject matter is **θ and α**. The 0c-1 turntable
implements neither. Worse than the missing readouts: **no torque source in the engine can
increase |L|**, so `α` cannot be produced at all, in either concept, at any authored value. The
readout gap is a display fix; the torque gap is a physics fix. Both are silent — `field_3d_config`
is not modelled in Zod at all, so a JSON written against any of these missing surfaces validates,
seeds, renders, passes THE EYE and can be sealed with the taught quantity simply absent.

---

## 1 · CRITICAL — no torque can spin a body up (`applied_torque_Nm` is decay-only)

**Severity: BLOCKING for `tau_eq_i_alpha`. BLOCKING for `rotational_kinematics`'s α half.**
This is the finding the desk state file understates. It records `tau_eq_i_alpha` as needing "an
α readout row; `applied_torque_Nm` exists". `applied_torque_Nm` does exist — and it cannot do the
job the concept needs.

The single integrator is a closed form (`rbrLAt`, `:49937`):

```js
var mag = Math.abs(a.L0) - eng.tau * rbrBrakedSeconds(a.t0, tMs);
if (!(mag > 0)) mag = 0;
return (a.L0 < 0 ? -1 : 1) * mag;
```

`eng.tau` is `Math.abs(...)` at both assignment sites (`:50520` brake, `:50532` applied_torque),
and the expression **subtracts unconditionally**. Consequences, all verified by reading:

| Authored intent | What the engine does |
|---|---|
| constant τ applied to a spinning body | |L| decreases — a brake, whatever the `source` string says |
| constant τ applied to a body **at rest** (`omega0_rad_s: 0`) | `L0 = 0` ⇒ `mag = 0 − τ·t` ⇒ clamped to 0 **forever**. The body never moves. `rbrThetaAt` integrates ω = 0, so θ never advances either. **A completely dead frame.** |
| τ reversing a spin | impossible by construction (the rest clamp is documented and deliberate) |
| ω = ω₀ + αt with α > 0 | not reachable at any authored value |

The `applied_torque` branch's own comment (`:50528–50531`) confirms the intent was a decelerating
constant torque sharing the brake's rest clamp. That was the right call for 0c-1's spec driver
(`conservation_of_angular_momentum`, where every τ is a brake). It does not serve concept #7,
whose canonical picture is *a torque applied to a stationary wheel, which then accelerates*.

**What 0c-3 must provide:** a torque source whose sign is **authored, not derived from |L|** —
τ may add to L as well as subtract from it. The rest clamp must survive as a *brake-only*
behaviour, not as a property of the integrator.

**Invariants any fix must preserve** (these are why the current form is shaped as it is, and they
are not negotiable):
- The scenario is **accumulator-free**. `L(t)`, `ω(t)`, `θ(t)` are closed forms of
  `t = time − stateStartTime`; `rigid_body_rotation` is in `animate()`'s accumulator-free snap
  set precisely because of this. A signed τ is still a closed form (`L = L₀ + τ·engaged_seconds`)
  — do **not** reach for a per-frame accumulator to get it.
- Rule 36 — fixed 1/60 s stepping, forced to 1 step under `SET_TIME_FREEZE`.
- `rbrThetaAt` (`:49952`) sums a FIXED 16 ms grid and is step-count invariant by construction; a
  `dt = h` vs `dt = 2h` fold must stay bit-equal, and THE EYE's frozen baselines byte-stable.
- **Back-compat is mandatory and cheap to check:** `conservation_of_angular_momentum` is the only
  current consumer. Absent/unsigned τ must behave byte-identically to today.

---

## 2 · CRITICAL — `RBR_RO_META` has no `theta` and no `alpha` row, and the omission is SILENT

**Severity: BLOCKING for both concepts.**

`RBR_RO_META` (`:50147`) is a closed six-row table:

```
I · omega · L · KE · dLdt · F_pull
```

`rbrRebuildReadout` (`:50162`) and `rbrWriteReadouts` (`:50236`) both do `if (!meta) continue`.
An unknown readout token is skipped with **no throw, no console warning, and no gate failure**.

The silence is total, and it is worse than the desk state file records. I checked the validator:
**`field_3d_config` does not appear anywhere in `src/schemas/`** — the rbr config block is not
modelled by Zod at any depth. So `readouts: ["theta", "alpha"]` is not merely an unknown-enum-member
that slips through; there is no enum to slip through. The same holds for a misspelled field name,
an unknown `reference_marks[].surface`, and an unknown `controls_visible` token.

**Net effect: a `tau_eq_i_alpha` JSON authored today passes `npx tsc --noEmit`, passes
`npm run validate:concepts`, seeds, renders, passes THE EYE (the pixels do move — the turntable
spins), and can reach a founder seal with α never once appearing on screen.** Only a human reading
the sim against the physics block catches it. That is the whole reason this desk did no wave-1
authoring.

**What 0c-3 must provide:** `theta` and `alpha` rows in `RBR_RO_META`, with units and dp settled
(see §5). **Please also make the skip loud** — an unknown readout token should at minimum
`console.warn` once per state so the next desk to hit this fails visibly rather than silently.
That warning is worth more than the rows themselves: it converts an invisible authoring class of
error into a visible one for every future rbr concept, not just these two.

---

## 3 · HIGH — θ is computed but has no reference of any kind on screen

**Severity: BLOCKING for `rotational_kinematics`.**

Good news first: **θ already exists as a number.** `rbrThetaAt(tMs)` (`:49952`) integrates ω on
the fixed 16 ms grid, is published as `window.PM_rbrTheta` (`:50232`), and drives the mesh at
`:50666`. The integrator work is done. What is missing is everything that makes an angle
*readable*:

- no `theta` readout row (§2);
- no angle arc, no swept-sector fill;
- no fixed reference line on the ground/base frame;
- no mark on the rotating body to measure from.

An angle needs two rays. The scenario currently renders neither. A `theta` HUD row alone would
print a number a teacher cannot point at.

**A correction to the desk state file, for the record.** It lists `theta0_rad` as "declared but
inert". That is imprecise in a way that matters to scoping. `theta0_rad` **is wired**: read at
`:50499` into `eng.theta0`, and seeded into the θ integrator by `rbrThetaReset` (`:49967`). It is
not inert — it is **unobservable**. Two reasons, both needing a fix:
1. with no angular reference on screen, a different start angle produces no readable difference;
2. the apparatus is a **symmetric two-mass rod**, so it has π-symmetry — θ₀ and θ₀ + π are
   pixel-identical. Even with a reference line, θ₀ is only half-observable until the body carries
   an asymmetric mark.

**What 0c-3 must provide:** a fixed angular reference on the base + a mark on the rotating body +
a drawn swept angle between them. The mark also resolves the π-symmetry. This is small, purely
visual work, and it is what turns an already-correct number into a teachable one.

---

## 4 · HIGH — no tangential velocity vector, so `v = ωr` has no rendering path

**Severity: BLOCKING for `rotational_kinematics`'s stated payload.**

`v = ωr` — the link between linear and angular motion — is named in the approved spine entry for
concept #4 and in the survey's 0c-1 per-concept table ("a point's v arrow at radius r (v = ωr)").
It is not in the frozen contract. The only vector the scenario draws on a mass is the **radial
−r̂ pull arrow** (`show_pull_arrows`, the F5 build): centripetal, pointing at the axis. There is
no tangential arrow, and no per-point circular trace.

Drawing v as ωr at two different radii on the same rigid body — same ω, different v — is also the
picture concept #3 (`rigid_body_rotation`, "outer points travel further in the same time") needs,
so this is shared value across at least two concepts, not a Desk-D-only cost.

**What 0c-3 must provide:** a tangential velocity arrow attachable at an authored radius, length
∝ ωr, with a live value label; and (cheap, same machinery) an optional circular trace at that
radius. Note the arrow-length scaling caution already on record for this scenario — the guided
range and the explore-slider corners differ by more than a fixed linear map tolerates (see
`conservation_of_angular_momentum`'s physics block, callout 4).

---

## 5 · MEDIUM — the closed enums exclude θ and α everywhere else too

Fixing `RBR_RO_META` alone is not sufficient. Three further closed sets exclude the two
quantities, each in a way a Desk-D state needs:

| Surface | Where | Today | Needed |
|---|---|---|---|
| `reference_marks[].surface` | `:1024` decl · `:50167` chip · `:50259` match | `'omega' \| 'L' \| 'I' \| 'KE' \| 'F_pull'` | `+ 'theta' + 'alpha'` — a "predicted ω after t seconds" chip is the exam skill performed on screen; the F1 chip-with-match-cue machinery already exists and would be reused as-is |
| `controls_visible` / `RBR_SLIDER_SPEC` | `:1051` · `:50128` | `'r' \| 'm' \| 'omega0' \| 'tau_brake' \| 'spin_dir'` | `+` an applied-torque control `+` (for `rotational_kinematics`) whatever drives α. **Rule 31 requires the explore state to expose the taught variable**; neither Desk-D concept can author a legal explore state today |
| `readout_at_ms` / `hold_glow` | `:50238` · `:50245` | keyed off `RBR_RO_META` | follows §2 for free once the rows exist |

**Units and dp are a decision, not a default.** θ in **rad** matches the config (`theta0_rad`) and
the integrator, but a Class-11 teacher reads **degrees**, and revolutions are what a turntable
visibly does. α is rad/s². I am not ruling on this from Desk D — flagging that 0c-3 must pick,
and that the choice should be the same across all six turntable concepts (APPARATUS_CONTRACT §3:
labels for a quantity are identical across all eight concepts). **Recommendation: settle it in
the office alongside the contract, not inside the build.**

---

## 6 · MEDIUM — one body per state blocks the "same τ, double I" comparison

`apparatus.body_shape` implements only `'turntable_rod'`. `particles[]`, `parts[]`,
`bodies[]`/`cm_marker`/`cm_path_trace`, `axis_select`, `axis_pair`/`d_draw` are all DECLARED and
inert (`:939–956`, and the `applyRigidBodyRotationState` seed at `:50485` reads none of them).

`τ = Iα` is a proportionality with two independent variables. The clean teaching beat is **the
same torque on two different I**, side by side, one accelerating visibly faster. With one body per
state that becomes two sequential runs on one body — showable, but strictly weaker: the comparison
lives in the viewer's memory instead of on the screen, and Rule 32d's "at every click the only
visible change IS the new thing" is doing more work than it should.

**Not filed as blocking.** Changing r on the single rod already changes I (that is 0c-1's live-I
build, and it works), so a sequential contrast is authorable. Filing it as a **known design
compromise** so Desk E can price a second body and the office can decide. Whether Desk D's
skeleton takes the sequential route or asks for the second body is PASS 2's answer.

---

## 7 · LOW / informational

- **No graph or plot surface exists in the rbr config.** The advanced-ring sweep in
  `phase0_survey.md` (row #4) says a "θ(t)/ω(t) graph panel already exists in field_3d" and prices
  concept #4's advanced ring at "no" new build. That claim is about *field_3d generally*, not
  about `rigid_body_rotation` — grep of the rbr region returns zero graph hits. If either Desk-D
  skeleton wants a θ(t) or ω(t) plot, **it is a new build for this scenario** and the survey's
  "no" is misleading. Flagged now so it is priced correctly rather than discovered mid-build.
- **`RBR_GRID_MAX = 20000`** (`:49738`) caps θ integration at 20000 × 16 ms ≈ 320 s per
  evaluation. No Desk-D state approaches that. Recorded so nobody re-derives it.
- **`external_torque.source` declared/live mismatch** (already on record in APPARATUS_CONTRACT §1):
  the interface declares `'brake' | 'applied_force_at_point' | 'torsion_spring'`, the
  implementation resolves `'applied_torque' | 'brake'` (`:50518`), so the string
  `'applied_torque'` — the one Desk D needs — is not a declared member of its own enum. Whatever
  §1's fix does to the sign, please close this too; it is one line and it is exactly the kind of
  gap that costs a later desk a day.

---

## 8 · Priority for 0c-3, from Desk D

| # | Finding | Severity | Shape of work |
|---|---|---|---|
| 1 | §1 — signed torque (τ may increase |L|) | **BLOCKING both** | physics; closed-form, accumulator-free; back-compat vs `conservation_of_angular_momentum` |
| 2 | §2 — `theta` + `alpha` readout rows **+ a loud warn on unknown tokens** | **BLOCKING both** | display; small |
| 3 | §3 — angular reference: base line + body mark + swept arc | **BLOCKING** `rotational_kinematics` | visual; small |
| 4 | §4 — tangential v arrow at radius r (`v = ωr`) | **BLOCKING** `rotational_kinematics` | visual; shared with concept #3 |
| 5 | §5 — θ/α in `reference_marks[].surface` + an applied-torque control | **BLOCKING** (Rule 31 explore state) | enum widening; reuses existing machinery |
| 6 | §6 — second body for a simultaneous I comparison | design compromise | office decision, not a blocker |

**§1 and §2 together are the minimum that makes either concept authorable at all.** Items 3–5 are
what make them worth authoring. Item 6 is a quality ceiling, not a gate.

---

## PASS 2 — pending

To be appended when both skeletons reach `DESIGN_OK` at Checkpoint A:

- exact readout token list, units and dp per state;
- exact `reference_marks` consumed (surface + form + value), per state;
- the per-state control table's demands on `controls_visible`;
- any `APPARATUS_CONTRACT.md` deviation the design needs (a start from rest at ω₀ = 0 is the
  likely one for both concepts — an office decision, never a local one);
- the §6 ruling: sequential contrast, or a second body.

**Desk E: if 0c-3's scope must freeze before PASS 2 lands, freeze it around §8 items 1–5 and ping
this desk.** Items 1 and 2 are certain and will not change. Nothing in PASS 2 can shrink them.
