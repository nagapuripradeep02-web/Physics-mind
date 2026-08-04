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

**Good news that changes how this should be scoped: `applied_torque_Nm` has ZERO consumers.**
`git log --all -S "applied_torque_Nm"` returns only the 0c-1 build commit (`d928f01`) and this
desk's docs commits, and no file under `src/data/` references it. `conservation_of_angular_momentum`
— the only sealed design targeting this scenario — uses `source: 'brake'`, a different branch. So making
`applied_torque_Nm` signed is a **redefinition of a field nothing consumes, not an addition
alongside a live one.** Back-compat risk is nil provided the change is confined to the
`applied_torque` branch and the `brake` branch is left byte-identical. That is a materially cheaper
job than the "every field is optional, absent must mean today's behaviour byte-identically"
discipline usually implies — and it means the semantics can be chosen for what the concepts need
rather than for what an existing consumer expects.

**A precise distinction on starting from rest, because it splits the work in two.** An **authored**
`omega0_rad_s: 0` already works: `:50497` resolves it through `rbrNum` (`:49828`), which is a
`typeof`/`isFinite` check, so a literal 0 is honoured rather than falling back to the 1.5 default.
Guided states seeded at rest are therefore authorable **today**, and only §1's signed torque is
needed to make them move. The **slider** is a separate matter and is blocked at two independent
sites: `RBR_SLIDER_SPEC.omega0.min = 0.5` (`:49999`) and the live-write guard
`if (!(value > 0)) return;` (`:50075`, which rejects a written 0 even if the slider min were
lowered). **Both sites must change together, or the floor moves and nothing happens.** Desk D's two
concepts sent contradictory floor requests at Checkpoint A; the reconciled ask is a single one —
lower the floor to 0 at both sites — and it affects the explore state only.

**One torque source at a time is a STRUCTURAL limit, not a closed-form detail.** The engine holds a
single scalar `eng.tau` and a single engage window (`eng.brakeOnMs` / `eng.brakeOffMs`, set at
`:50520-50534`); the `src` branch picks *either* `brake` *or* `applied_torque` and writes both
fields once. So **a drive torque and a brake torque cannot act at the same time** — the τ_net tug
that both Desk-D concepts want in their explore state (drive vs brake, net τ decides) is not a
generalisation of the closed form, it is a second source. **Do not let this be discovered
mid-build** — it is the difference between widening a number and widening a structure.

> **DESK-D RULING (fix cycle 1, 2026-08-04): the tug is KEPT, so `sources[]` is IN SCOPE.**
> `tau_eq_i_alpha`'s explore state retains the live drive-vs-brake tug as its named teacher demo,
> priced structurally: a `sources[]` list summing to τ_net, a split of `rbrBrakedSeconds` into
> per-source engaged windows, and widened guards. **ω = 0 with both sources engaged is defined as a
> static hold plus a breakaway condition, and `sign(L)` is never consulted at L = 0** — that was the
> undefined corner. A designed single-signed-control fallback is documented in that skeleton's D-row
> if the office declines the structural buy. **Desk E: this is the one item on this list where a
> Desk-D design decision ADDS scope rather than confirming it — price it explicitly, and say so if
> you want the fallback instead.**

**The α metric must be defined ONCE, in the engine, for both concepts.** Desk D's two skeletons
independently specified it two different ways — a per-step finite difference of ω, and τ_signed/I.
Those agree in steady drive and disagree during an r-drag (where I changes under a constant τ) and
at every engage/release edge. They are a single bought row; Desk E must ship one definition.
Recommendation, from the shape of the rest of the surface: **derive α from the same post-step
snapshot as everything else** (`rbrWriteReadouts`, `:50219`) so it can never be a pre-step value
beside a post-step one, and blank it across re-pins exactly as the other rows are. Which formula
wins is a physics call for the office; that it is ONE formula is not negotiable.

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

**What 0c-3 must provide:** `theta`, `alpha` and `tau` rows in `RBR_RO_META`, with units and dp
settled (see §5). **Please also make the skip loud** — an unknown readout token should at minimum
`console.warn` once per state so the next desk to hit this fails visibly rather than silently.
That warning is worth more than the rows themselves: it converts an invisible authoring class of
error into a visible one for every future rbr concept, not just these two.

> **BINDING SEMANTIC on the new `tau` row — decided at Checkpoint A cycle 2, and it costs nothing
> to honour if it is honoured from the start.** **`τ` must display the NET torque the integrator
> actually resolved, never the authored schedule value.** The two diverge wherever the rest clamp
> is active: at `tau_eq_i_alpha`'s S6 rest clamp the authored value would print **τ = −1.53 beside
> α = 0.00 and I = 3.06** — τ = Iα visibly contradicted, in the archived frozen frame, in the
> concept whose atomic claim *is* τ = Iα. The same defect is live at its explore state's static
> hold, which is that concept's named teacher demo. It also recurs for any future concept using the
> clamp.
>
> This is zero extra engine work — the integrator already knows the resolved value; it is a choice
> about which number reaches the row. **Made wrong it is not visible until a human reads a frozen
> frame against the physics**, which is this desk's founding lesson (§0). Desk E: wire the row to
> the resolved torque from the same post-step snapshot as the rest (`:50219`).

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

- no `theta` readout row (§2);
- no angle arc, no swept-sector fill;
- **no fixed reference on the base frame** — this is the actual gap.

**Correction to this section, made after a second pass — the body mark ALREADY EXISTS.** An
earlier draft of this file said there was no mark on the rotating body. There is:
`rbr_drum_marker`, a stripe at `RBR_DEF_DRUM_R·W·0.46` on the +x side of the drum, built at
`:50322-50327`, coloured `RBR_MARK_COLOR` (`:49755`), and a member of `RBR_ALWAYS_ON` (`:50585`) so
it renders in every state unconditionally. It is added to the `spin` group, so it turns with the
body. **Desk E: do not build a second one.** `deriveStateMeta.ts:496-508` already reasons about
this stripe as the thing THE EYE watches move.

That shrinks §3's scope to **one missing ray, not two**: an angle needs two, and only the fixed
base reference is absent.

**A correction to the desk state file, for the record.** It lists `theta0_rad` as "declared but
inert". That is imprecise in a way that matters to scoping. `theta0_rad` **is wired**: read at
`:50499` into `eng.theta0`, and seeded into the θ integrator by `rbrThetaReset` (`:49967`). It is
not inert — it is **unmeasurable**. With the stripe present, a different θ₀ does produce a
different *pose*, and the stripe breaks the rod's π-symmetry, so θ₀ and θ₀ + π are in fact
distinguishable. (An earlier draft claimed they were pixel-identical; that was wrong, and it was
wrong because it assumed the symmetric rod was the only mark.) What θ₀ lacks is something to be
measured *against*.

**What 0c-3 must provide:** a fixed angular reference on the base + a drawn swept angle between it
and the existing stripe. Small, purely visual, and it turns an already-correct number and an
already-built marker into a teachable angle.

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

**The same gap in its force form, needed by `tau_eq_i_alpha`.** The pull arrows are hard-radial —
`:50693`'s in-place comment states they are "ALWAYS along -r-hat" by design, and that is correct
for the concept they were built for. But a torque applied at a rim is a **tangential** force, and
concept #7's advanced state builds τ = Σ(r·F) by showing the per-particle tangential forces that
sum to it. So the tangential vector is needed twice over, for two different quantities:
**v = ωr at a marked point** (§4, kinematics) and **F at a rim/particle** (dynamics). Desk E should
price one tangential-vector mechanism with two consumers, not two mechanisms — but note the
magnitude-to-length maps differ (m/s vs N) and must not be shared.

**What 0c-3 must provide:** a tangential velocity arrow attachable at an authored radius, length
∝ ωr, with a live value label; and (cheap, same machinery) an optional circular trace at that
radius. Note the arrow-length scaling caution already on record for this scenario — the guided
range and the explore-slider corners differ by more than a fixed linear map tolerates (see
`conservation_of_angular_momentum`'s physics block, callout 4).

---

## 4b · MEDIUM — the actuator-travel animation is wired to the BRAKE PAD only

Both Desk-D concepts render the torque's agent as a visible actuator that moves in and makes
contact (§1 needs a rendered cause; Rule 32a needs it to move *before* the effect). The brake pad
does exactly this today — `pad_travel_ms`, park pose → contact pose, at `:50729-50744`.

**None of it reaches the applied-torque source.** The travel block is gated on the
`rbr_brake_pad` mesh and driven by `eng.padEngageMs`, which is assigned **only inside the `brake`
branch** (`:50521-50526`). The `applied_torque` branch sets `brakeOnMs`/`brakeOffMs` and leaves
`padEngageMs` null (`:50533`), so `eMs` falls to `Infinity` and the actuator never travels. There
is also no drive-wheel mesh of any kind.

**What 0c-3 must provide:** a drive actuator that travels and makes contact on the same timing
contract the pad already uses — ideally by lifting the travel logic off the brake-pad mesh onto
whichever actuator the state's torque source names, rather than duplicating it. **Desk D's two
skeletons forked here** (one specified a floating tangential arrow, the other a motor wheel that
translates in); the reconciled ask is ONE actuator mesh, with the rim force arrow layered on it.

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
build, and it works), so a sequential contrast is authorable.

**The `tau_eq_i_alpha` skeleton took the sequential route — and that route needs a small build of
its own.** Its S5 runs an A→cut→B compare at the same τ with I 3.06 vs 0.66. The `restart` block
(`:1032`, seeded at `:50545`) carries only `at_ms` / `every_ms` / `flip_spin`: a restart re-seeds L
from the *current* `r` and `omega0`, and there is no way to author **different `r_m` / `omega0` per
run**. So the two runs of a sequential comparison cannot differ in the one variable the comparison
is about.

**What 0c-3 must provide:** per-run overrides on the restart — the shape the skeleton proposes is
`runs: [{ at_ms, r_m, omega0 }]`. This is the cheaper half of the §6 trade: it buys the
same-τ/different-I comparison without a second body. **Desk E can treat "per-run overrides" and "a
second body" as alternatives and build only the first** — the office decides whether the stronger
side-by-side picture is worth revisiting later.

---

## 6b · HIGH — THE EYE's motion gate goes SILENT on exactly the states §1 unblocks

**Severity: HIGH, and it only bites AFTER §1 is fixed — which is why it must be fixed in the same
build.** Found while checking a claim from Desk D's architect pass; the claim as posed ("rbr may
not be declared in `deriveMotionExpectations` at all, leaving EYE motion gates hollow chapter-wide")
does **not** hold — rbr *is* declared, at `deriveStateMeta.ts:496-508`. But the branch underneath
carries a real problem for Desk D:

```ts
const w0 = Math.abs(asNum(rbrMot.omega0_rad_s, 1.5));
if (w0 >= 0.05) { out[stateId] = true; continue; }
// Seeded at rest: fall through undefined
```

Motion is declared **from the seed alone**. A state seeded at rest falls through `undefined` and
THE EYE's D5 motion gate **skips**. That is correct today: with the decay-only integrator of §1, a
state at rest genuinely never moves, and the in-file comment is right that over-declaring is worse
than skipping.

**It stops being correct the moment §1 lands.** Both Desk-D concepts want states that start at rest
and are spun up by a torque — `ω = ω₀ + αt` from ω₀ = 0 is the canonical picture for both. After a
signed-torque fix those states move a great deal, but `omega0_rad_s` is still 0, so
`deriveMotionExpectations` still returns `undefined` and D5 still skips. **THE EYE would go silent
on precisely the states whose entire content is "it starts moving"** — the same silent-pass shape
as §2, one layer further out.

**What 0c-3 must provide:** the declaration must read the torque as well as the seed — roughly
"declare motion when `|ω₀| ≥ 0.05` **or** a signed applied torque is engaged during the state".
Cheap, but it is a `deriveStateMeta.ts` co-edit and it must ship in the SAME change as §1, or the
gate silently under-covers the new capability. (`deriveStateMeta.ts` is already a mandatory co-edit
for any field_3d scenario change — this is one more site in it, alongside the three at `:3134+`.)

---

## 6c · CROSS-DESK ALERT — the formula surface is static, and a SEALED sibling's physics block assumes it is not

**Severity: HIGH, and it is NOT a Desk-D-only finding. Desk E: please read this one first.**
Surfaced by Desk D's `tau_eq_i_alpha` architect pass; verified in code before filing.

The single Rule-34b formula surface is set **once per state, as a plain string**
(`applyRigidBodyRotationState`, `:50570-50573`):

```js
var ff = document.getElementById("rbr_formula");
ff.textContent = (typeof rb.formula === "string") ? rb.formula : "";
ff.style.display = (... rb.formula.length) ? "block" : "none";
```

`formula` is typed `string` (`:1046`). There is **no timing, no term list, no reveal schedule** —
the whole equation appears at state entry, complete.

**But `conservation_of_angular_momentum`'s Phase-0b design — `DESIGN_OK`, physics block signed,
the 0c-1 spec driver — is authored against term-by-term assembly.** Its S7 archetype is literally
named `equation-build`, defined in its skeleton §3 as *"the equation assembles term-by-term on the
single formula surface, synced to narration"*, and its physics block times the assembly in two
states: S7 `0–4000 ms: formula_surface assembles term-by-term: τ_ext = dL/dt`, and S3
`0–3200 ms: formula_surface assembles I₁ω₁ = I₂ω₂`.

That capability does not exist. And the degradation is **silent in the now-familiar way**: an
authored `formula` string renders fine, the state looks correct, THE EYE sees a formula on screen,
and nothing anywhere reports that a beat specified as an assembly played as a single flash at
t = 0. S7's declared archetype — the thing that makes it a distinct state under Rule 31 — would
simply not happen.

**Timing makes this urgent.** No rotmech Ch.7 concept JSON exists on master yet, and
`conservation_of_angular_momentum` is a Phase-0d authoring target on a sibling desk. If it is
authored before this is resolved, it ships with a silently dead archetype in two states.

**What 0c-3 should provide:** a timed reveal on the formula surface — the minimal shape is
`formula_at_ms`, or a term list with per-term reveal instants. Desk D's `tau_eq_i_alpha` needs the
same thing for its own S7 (`equation-build`), so this is at least two concepts, probably more
across the six turntable concepts.

**Whoever owns the reconciliation should also check the other sealed skeletons' archetype lists for
capabilities assumed rather than verified** — `equation-build` was caught only because a second
concept happened to need the same surface. That is luck, not process.

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
| 6 | §6b — declare motion from the TORQUE, not the seed alone | **HIGH — must ship WITH §1** | `deriveStateMeta.ts` co-edit; cheap |
| 7 | §6c — timed reveal on the formula surface (`formula_at_ms`) | **HIGH — cross-desk** | display; small. A SEALED sibling's design already assumes it |
| 8 | §6 — per-run `{at_ms, r_m, omega0}` overrides on `restart` | **BLOCKING** `tau_eq_i_alpha` S5 | small; the cheap alternative to a second body |
| 9 | §6 — second body for a simultaneous I comparison | design compromise | office decision, not a blocker |

**§1 and §2 together are the minimum that makes either concept authorable at all.** Items 3–5 and
8 are what make them worth authoring. **Item 6 (§6b) is not optional if §1 ships** — without it THE
EYE stops covering the states §1 exists to enable. **Item 7 (§6c) is the one item on this list that
is not about Desk D** — it is filed here only because this is the file you drain. Item 9 is a
quality ceiling, not a gate.

**One documentation fix while you are in the file.** The 0c-1 contract comment at `:947-949` lists
`applied_torque_Nm` as "a constant tau_ext, which is #7's alpha = tau/I with no extra code path".
Per §1 that is true only for the decelerating half; it is false for the driving half, which is the
half concept #7 is about. That comment is what a later desk will read to decide whether it is
blocked, so it is worth correcting in the same change.

**Two things Desk E should NOT build**, because they already exist and were nearly re-specified
from this desk:
- the rotating body's angular marker — `rbr_drum_marker` (`:50322`, always-on) — see §3;
- an rbr branch in `deriveMotionExpectations` — it is there at `deriveStateMeta.ts:496`; §6b
  amends that branch rather than adding one.

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
