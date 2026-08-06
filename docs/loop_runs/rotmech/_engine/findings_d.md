# Engine findings — Desk D (`rotational_kinematics` · `tau_eq_i_alpha`) → build 0c-3

**Desk:** `feat/rotmech-d` · `C:\Tutor\physics-mind-rotmech-d`
**Owner of the fix:** Desk E (`peter_parker:field3d_surgeon`). Desk D never edits `src/`.
**Status: PASS 2 LANDED — this file is the freeze source for 0c-3. Both skeletons are `DESIGN_OK`.**
Every finding below was verified against renderer code by the orchestrating session, not lifted from
a skeleton. Both Desk-D skeletons declare themselves non-canonical and consume shared engine
semantics from here, so **where this file and a skeleton disagree, this file wins.** See the PASS 2
section at the end for what was settled, the four cross-document items the merge must close, and one
known gap in the evidence base.

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

### The α metric — RULED. This is the canonical statement; both skeletons consume it from here.

Desk D's two skeletons originally specified α two different ways (a per-step finite difference of ω,
and τ_signed/I). They agree in steady drive and disagree during an r-drag, at the rest clamp, and at
every engage/release edge. **Checkpoint A cycle 1 ruled, and cycle 2 verified both skeletons now
agree. The ruling:**

> **α is the per-step finite difference of ω, published from the SAME post-step snapshot as I, ω, L
> and KE (`rbrWriteReadouts`, `:50219`), and blanked across re-pins exactly as the other rows are.**

Rationale, on the record: the finite difference stays true at the rest clamp, under a live dI/dt, and
at every engage edge, where the analytic form silently disagrees. It also keeps τ out of
`rotational_kinematics` entirely, which is what protects that concept's Rule-25 answer (it is taught
before `torque` and `moment_of_inertia` exist).

**This paragraph is the canonical location.** Both skeletons declare themselves non-canonical and
consume the semantics from this file, so an earlier draft of this section — which said "which formula
wins is a physics call for the office" and presented both candidates — left the reconciled ruling
existing in *no* canonical location while §8 invited an early freeze. Caught at Checkpoint A cycle 2
(`rotational_kinematics/founder_proxy_A_cycle2.md`, F-1) and closed here.

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

## PASS 2 — LANDED. Both skeletons are `DESIGN_OK`; this file is the freeze source.

**Status, 2026-08-04.** `rotational_kinematics` REV 2 and `tau_eq_i_alpha` REV 2 both cleared
Checkpoint A cycle 2. Both gates verified, by direct comparison of the two documents, that the
cross-skeleton fork found at cycle 1 is closed on all four shared items, and that no fifth fork
exists. **Both skeletons declare themselves non-canonical and consume shared engine semantics from
THIS file** — so where §1's ruled paragraphs and a skeleton disagree, this file wins.

**Desk E: freeze from §8. It is complete.** Nothing further is owed from this desk before the
freeze.

### What PASS 2 settled since PASS 1

| Question PASS 1 left open | Ruling |
|---|---|
| Which α formula | **Per-step finite difference**, from the post-step snapshot, blanked across re-pins — see §1's ruled paragraph, the canonical location |
| Whether a contract deviation is needed for a start from rest | **No.** An authored `omega0_rad_s: 0` already works (`:50497` → `rbrNum` `:49828`). Only the explore SLIDER is blocked, at two sites (§1) |
| Sequential contrast, or a second body (§6) | **Sequential**, via per-run `{at_ms, r_m, omega0}` overrides on `restart` (§8 item 8). The second body is not bought |
| Whether the drive/brake tug survives | **Kept**, so `sources[]` is in scope (§1). Fallback documented if the office declines |
| The new `tau` row's semantics | **Net resolved torque, never the authored value** (§2) — binding, zero extra cost, invisible if got wrong |

### Cross-document items the 0c-3 merge must settle

Raised at Checkpoint A cycle 2 and not owned by either skeleton alone:

1. **The shared drive wheel carries TWO visibility rules** — one per skeleton. One mesh cannot obey
   both; pick one at build time and tell both concepts which.
2. **Unicode-minus discipline on the α row is carried by only ONE skeleton** — and the concept that
   prints a negative α (`rotational_kinematics`, α = −0.50) is not the one carrying it. Rule 34c
   covers all three text paths; the α row is a new one. Apply it to `theta`, `alpha` and `tau`.
3. **`sources[]` vs the singular `external_torque` back-compat clause is unwritten on both sides.**
   Whatever shape §1's structural buy takes, the absent case must reproduce today's behaviour
   byte-identically — and `conservation_of_angular_momentum` is the consumer that proves it.
4. **K5's rim ticks must be base-frame, not members of the `spin` group** — neither document says so,
   and a tick parented to `spin` rotates with the body and measures nothing. The existing
   `rbr_drum_marker` IS in the spin group (`:50327`), so the mistake is one line away.

### Known gap in this file's evidence base

`rotational_kinematics`'s cycle-2 scar pass could not reach the live `engine_bug_queue`
(Cloudflare 525/522) and ran against cycle 1's verbatim 157-row union instead. That union is one
cycle old. **Anyone re-querying before the build should diff it forward** — if rows landed in the
interval, neither skeleton has seen them.

---

## PASS 3 — E4 LANDING CHECK. Verification of landed code, plus ONE escape from the freeze.

**Filed 2026-08-05.** PASS 2 said "no PASS 3 is owed" and that was true of *design*. This is not a
scope reopen: `ENGINE_LANDING_NOTICE.md` §5 asks each desk to report back on the dispatches it
verifies, and E4 — this desk's own §1 — has landed. Everything below was read against the code, not
against the notice.

**All `file:line` refs in this section are against `origin/feat/rotmech-0c3` @ `6c5ed6d`.** They do
**not** match PASS 1/2's refs, which were taken pre-E1; E1–E4 shifted the implementation down ~1.1k
lines (`rbrLAt` `:49937` → the breakpoint walk; `RBR_RO_META` `:50147` → `:50663`).

**Landing state.** E4 = `bf7dac1`, on `feat/rotmech-0c3`, in PR #29 — **OPEN, not merged**.
**E5 confirmed NOT landed:** `RBR_RO_META` (`:50663`) is still exactly the six rows
`I · ω · L · KE · dL/dt · F`, `reference_marks[].surface` (`:1060`) is still the five-member union,
and `rbrApplyParam` (`:50576`) still has no applied-torque token. Both concepts stay blocked; no
JSON authored, nothing seeded.

### A · Both physics blocks CONFORM to the landed E4 shape. No edits owed to either.

| Physics-block claim | Landed E4 | |
|---|---|---|
| a drive raises \|L\| from rest; α reachable at a positive authored value | signed `torque_Nm` / `applied_torque_Nm`; `rbrLAt` is a breakpoint walk over per-source engaged windows | ✓ |
| the brake is a **magnitude**, opposes the existing spin, never reverses it (`τ_brake = −sign(ω)·τ`) | `var tv = (kind === "brake") ? Math.abs(traw) : traw;` (`:51103`) | ✓ exact |
| ω = 0 with both engaged = **static hold with breakaway**, `sign(L)` never consulted at zero | same semantic, same words, in E4's commit body | ✓ |
| `ω₀ = 0` entry seeds — `rotational_kinematics` S3/S7/S8, `tau_eq_i_alpha` S4/S5/S7 — **and** an explore slider reaching 0 | floor lowered to 0 at both sites (`rbrApplyParam` guard is now `value >= 0`, `:50594`) | ✓ |
| at most 2 concurrent sources anywhere in either concept | `RBR_MAX_SOURCES = 8` (`:50148`) | ✓ |
| contact **is** the engage instant, bound to a `scenario_cue` | `engage_cue` / `release_cue` per `sources[]` entry (`:51105–51107`) | ✓ |
| θ and `theta0_rad` are BUILT; design θ beats against the existing integrator | unchanged by E4; the three wrong contract comments are corrected in it | ✓ |

Every number in both blocks re-derived clean against the landed integrator — I = 0.50 + 2(2.0)(0.80²)
= 3.06 · τ = 1.84 / 1.53 N·m · `rotational_kinematics` S7 tick spacing 0.30 / 1.20 / 2.70 rad = 1 : 3 : 5 ·
`tau_eq_i_alpha` S2 end 5.56 rad/s · S4 F = 0.60 / 0.55 = 1.09 N. **E4 changes no authored value in
either concept.**

Two open items close as a result:

- **The P1-8 declared fallback is DEAD.** `sources[]` shipped, so `tau_eq_i_alpha`'s drive-vs-brake
  tug stands as designed and the signed-single-control fallback is not taken. **P2-B goes with it** —
  the Rule-38b breach it carried (signed τ on a core-ring control while the negative half is
  extended-ring) existed *only* in the fallback branch. Strike both from the Checkpoint C carry list.
- **PASS 2 cross-document item 3 (the `sources[]` back-compat clause) is SETTLED.** Absent
  `sources[]` leaves the scalar path byte-identical — 125,280 L samples + 125,280 θ samples, all
  `Object.is`-equal. Desk A still owes the desk-verification on `conservation_of_angular_momentum`;
  E4 is LANDED, not yet VERIFIED.

### B · THE ESCAPE — §4b never reached the frozen scope, and it blocks 11 of 17 states

**§4b (the actuator-travel animation is wired to the BRAKE PAD only, and there is no drive-wheel
mesh of any kind) is in NO dispatch, NO §C row, and NO §D row of `FROZEN_SCOPE_0c3.md`.**

**The omission is this desk's, not Desk E's.** §8's priority table has nine rows and §4b is not one
of them; PASS 2 then told Desk E *"freeze from §8. It is complete."* Desk E did exactly that. §4b was
written as MEDIUM on 2026-08-04 *before* Checkpoint A cycle 2 reconciled the two skeletons onto ONE
motor drive wheel — the reconciliation is what made it structural, and its severity was never
re-rated in §8.

Verified against the landed E4 code, not inferred:

- `grep -n "rbr_drive|driveWheel|drive_wheel|rbr_motor|motorWheel"` over
  `origin/feat/rotmech-0c3:src/lib/renderers/field_3d_renderer.ts` → **zero hits.** There is still no
  drive mesh.
- `padEngageMs` is assigned in exactly two config paths, both brake: the **first** `brake` entry of
  `sources[]` (`:51114–51117`) and the scalar `tau_brake_Nm` branch (`:51123`). A `drive` entry sets
  nothing visual at all.
- The `applied_torque` branch's own comment reads *"A CONSTANT tau_ext **with no pad**"* (`:51131`).
- `sources[]` entries carry **no travel field**. `pad_travel_ms` is singular and top-level (`:1021`,
  read at `:51057`), and the code comment concedes the pad actuator and the `tau_brake` slider *"have
  no notion of a list"* (`:51112`).
- `grep -i "drive wheel|motor|actuator|pad_travel|rendered agent"` over `FROZEN_SCOPE_0c3.md` →
  **zero hits.**

**Cost if E1–E9 ship without it.** Every drive state loses its Rule-32a cause beat —
`rotational_kinematics` S3/S4/S7/S8/S9 and `tau_eq_i_alpha` S2/S3/S4/S5/S7/S8, **11 of the 17
guided + explore states across both concepts**. Both physics blocks open every one of those states
the same way ("`drive_wheel` translates in … contact = engage"), 700–900 ms of authored cause each.
`tau_eq_i_alpha` S2 additionally binds P1-1 ("no frame before this draws a force while τ reads 0.00")
to the contact instant, and it is unenforceable with no actuator to draw. It also strands **PASS 2
cross-document item 1** — the merge cannot "pick one visibility rule at build time" for a mesh that
is not in scope.

And it fails exactly as §0 warns: with no drive actuator the states still validate, still seed, still
render, still pass THE EYE, and read as finished.

**The ask, unchanged in shape from §4b, re-rated in severity:**

> **`rbr_drive_torque_has_no_rendered_actuator` — BLOCKING both Desk-D concepts** (was MEDIUM).
> ONE actuator mesh, travelling on the same timing contract the pad already uses, with the rim force
> arrow layered on it — ideally by lifting the travel logic off the `rbr_brake_pad` mesh onto whichever
> actuator the state's source names, rather than duplicating it. **New, from E4's landed shape:** it
> needs a **per-entry** travel field on `sources[]`, since the singular `pad_travel_ms` cannot address
> a list. Desk D takes the drive wheel's single visibility rule as the reconciled one (Checkpoint A
> cycle 2, item 2): in contact whenever the state's drive torque is non-zero, parked otherwise.

This desk raises it, does not re-scope 0c-3. If it cannot be bought in this build, say so and both
concepts get re-designed around a driveless cause beat — that is a Checkpoint-A reopen on two
`DESIGN_OK` skeletons, and it is cheaper to know now than after E5.

### C · Two precision asks on E5, cheap before it dispatches and expensive after

1. **`rotational_kinematics`'s explore control is α, not τ.** E5's frozen text buys *"the
   applied-torque control token."* With I fixed at 3.06 for that whole concept, α = τ/3.06 exactly, so
   an α-labelled row is a relabel + rescale of that same token, not a second control. But Rule 31
   requires the explore state to expose **the taught variable**, and this concept's taught variable is
   α — Rule 25 holds only because "torque" and "moment of inertia" appear nowhere in its narration. A
   τ-labelled slider in its sandbox introduces an untaught term at the last state. Confirm the token
   carries an authored label + scale, or add the α form explicitly. (§5 left this as "whatever drives
   α"; E5 resolved it to the torque token alone.)
2. **`tau_eq_i_alpha` S8 is a second consumer of E8**, which currently names only Desk A's S8.
   Verified: S8 authors entry `tau_app = 0, tau_brake = 0`, so the `Math.abs(tv) > 0` guard (`:51104`)
   drops both entries and `eng.sources` starts empty. `rbrSetBrakeSource` (`:50564`) *does* create the
   brake entry on a live drag, so the **physics** of the tug is live — but `rbrApplyVisibility` still
   never re-runs, so the pad is invisible while it brakes. Same defect, one more consumer; no new row
   needed, just the second name on E8. (This also re-confirms the drive half is E5's: `rbrApplyParam`
   has no applied-torque token, so S8's *primary* taught-variable drag does not exist yet.)

### D · Landing-notice items absorbed by this desk

- **§1 (re-seed + re-EYE every sealed concept, diff against your OWN frames) is a no-op here.** This
  desk has sealed nothing, has authored no JSON, and has no seed script. Recorded so the next session
  does not go looking for drift that cannot exist.
- **§4 trap 2, pre-loaded for `json_author`:** this desk's seed scripts must write `field_3d_config`,
  not `physics_config: { epic_l_path }` alone, or `[D5]` abstains on exactly the rest-seeded states
  E4 exists to enable. `rigid_body_rotation` **has** a motion branch, so a `?` on the `Motion map:`
  line would be a real defect here, never by design.
- **§4 trap 1:** `md5sum` the dense frames on every EYE run until
  `eye_dense_motion_gates_all_pass_by_construction_on_a_totally_static_scene` is fixed. One hash
  across the series = a dead scene whatever the headline says.
- **Verifier duties accepted:** E6, E8, E9 on this desk's two concepts, once E4/E5 clear it.

---

## PASS 4 — E5 LANDING CHECK. Same shape as PASS 3, read against code, not against comments.

**Filed 2026-08-06.** E5 = `df87b6d`, merged to master in PR #29 (`bd89d43`). Also landed since
PASS 3: **E7** (`14b2943`) and **E11** (`9f944d0`). Desk synced to master `994bb8f`; **verify chain
green** — `check:renderer-syntax` OK on all three renderers, `tsc --noEmit` 0,
`validate:concepts` **149 PASS / 0 FAIL**. `git diff origin/master...HEAD -- src/` = **0 files**;
this desk remains docs-only. **All `file:line` refs below are against master @ `994bb8f`** and do
not match PASS 1/2/3's.

**Still blocked. E10 remains** (founder ruling 3) — `json-author` stays shut on both concepts.

### A · Both physics blocks CONFORM to E5's readout rows. Zero edits owed.

| Concept | `readouts` it authors | in `RBR_RO_META` (`:51112–51124`) |
|---|---|---|
| `rotational_kinematics` | `theta` · `omega` · `alpha` | ✓ all three. **Never surfaces `tau`** — Rule 25 intact |
| `tau_eq_i_alpha` | `I` · `omega` · `alpha` · `tau` | ✓ all four. Explicitly excludes `KE`/`L`/`dLdt`/`F_pull` |

Neither authors **`W`** — E5's fourth row is Desk A's `rotational_work_energy`, correctly not ours.
Both semantics this desk filed landed **as filed**: `tau` prints the RESOLVED net torque including
the rest-clamp `0.00` (P1-A, §2), and `alpha` is the per-step finite difference of ω from the same
post-step snapshot, blanked across re-pins (the PASS-2 ruling).

E5's three author-against-these-or-it-is-silent semantics (`ENGINE_LANDING_NOTICE.md` §6b), checked:

1. **"τ = Iα only while I is constant, so a τ = Iα state must not `param_ramp` r."** Satisfied
   **vacuously in both concepts** — neither authors `param_ramp` anywhere (`tau_eq_i_alpha` skeleton
   §3 + scar 56 N/A-by-design; `rotational_kinematics` skeleton *"No `param_ramp` is authored
   anywhere in this concept"*). `tau_eq_i_alpha` S5's r change is a **restart re-pose inside a
   blanked frame between drives**, not a ramp, and no torque is engaged across it.
2. **"α needs no torque authoring — `rotational_kinematics` can print it with `external_torque`
   absent entirely."** True of the **readout**, not of the **concept**, and the distinction is a
   trap. α is the finite difference of ω, so ω must actually change, which requires a real torque:
   S3/S4/S5/S7/S8 still author `applied_torque_Nm` / `tau_brake_Nm` as **internal-only engine
   fields** (`τ_internal = 3.06·α`), never a declared variable and never reader-facing. That is how
   Rule 25 is kept — torque is never *surfaced*, not never *authored*. **Flagged because §6b's
   wording invites `json_author` to drop the torque config and ship `α = 0.00` on every state**,
   which passes every gate silently. No edit owed to the block; it already says this.
3. **"W is signed and re-zeroes at a restart."** No consumer here.

E5's known-not-fixed list also clears us: **`rbrDLdtAt`'s missing anchor clamp** touches neither
concept, since both exclude `dLdt` — `tau_eq_i_alpha` explicitly (§"KE/L/dLdt/F_pull readouts are
NEVER shown"), `rotational_kinematics` by never listing it.

### B · Units — both blocks COMPLY with founder ruling 1. Nothing owed.

Landed and verified, not read off the contract comment: `RBR_THETA_DISPLAY = { unit: " rad",
dp: 2, per_rad: 1 }` (`:50235`, the flip point exists but is **not** taken), `alpha " rad/s²" dp 2`,
`tau " N·m" dp 2`, `W " J" dp 2` (`:51121–51123`).

- **`rotational_kinematics`** — *"2 dp everywhere (theta, omega, alpha, v)"*; θ authored in radians
  throughout, including the S7 tick values **0.30 / 1.20 / 2.70 rad** and the S1 ≈ 9.00 rad pin; the
  narration says *"in radians"* in words. ✓
- **`tau_eq_i_alpha`** — I 3.06 kg·m², ω rad/s, α rad/s², τ N·m, 2 dp on every readout beat. ✓
- **`reference_marks.value` in SI:** the only marks either concept authors are ω chips —
  `predicted_omega_chip` 3.30 (rk), `predicted_omega_chip` 1.20 + `run_A_chip` 1.25 (τ=Iα), all
  rad/s. **Neither authors a θ mark**, so the "SI, never display units" clause has no consumer here
  and cannot be got wrong. ✓
- **Rule 34c / PASS-2 cross-doc item 2 CLOSED.** The Unicode-minus obligation on α = −0.50 is
  carried in `rotational_kinematics`'s §Rounding, and E5 satisfies it in the engine — `rbrFx` emits
  U+2212, and the E5 comment calls out this concept's α = −0.50 by name.

**One note, not a defect.** E5 widened `reference_marks[].surface` to `theta|alpha|tau|W` (`:1065`).
The `rotational_kinematics` skeleton had declared those members explicitly **out of scope** (K2 enum
hygiene) and PASS 2 **downgraded** findings_d §8 item 5 for the same reason — no consumer in either
skeleton. Built anyway; optional, absent = byte-identical, harmless. Recorded only so nobody later
reads it as a Desk-D ask that was silently expanded.

### C · Ruling 4 (α, not τ) — the block already specifies α. **And E10 needs one more site than the label.**

`rotational_kinematics`'s S9 control table reads **ω₀** (core, [0, 3.0] rad/s, step 0.1, def 1.50)
and **α** (core, [−0.60, +0.60] rad/s², step 0.1). It never lists τ, and the internal resolution is
already written: *"`τ_internal = 3.06·α` re-anchors ω live via the trusted-drag path."* That matches
E10's build note (*"an α-labelled control resolving to τ = Iα internally, or `tau_applied`
suppressed for that concept with an α control in its place"*) exactly. **No edit owed.**

**The trap worth naming before E10 builds.** E5's `tau_applied` row (`:50877`) is a **τ** control:
`glyph: "τ applied"`, `unit: " N·m"`, min −2.0 / max 2.0, and `rbrApplyParam("tau_applied", v)`
(`:51037`) writes `v` straight in as a torque with **no scale factor**. `rbrSc()` overrides
`min / max / step / default / dp / label` — **but not `unit`**: the row builder reads `sp.unit`
directly, not `sc.unit` (`:50944`).

> So relabelling `tau_applied` to "α" satisfies ruling 4's **letter** and prints **`α = 1.84 N·m`**
> where α is 0.60 rad/s². **A wrong number under a right name is worse than naming torque.** E10
> needs an overridable **unit** *and* a **value scale** (or its own `alpha` token) — not a label
> override. Failure mode if missed: the HUD α row reads 0.60 while the slider beside it reads 1.84,
> and nothing gates that.

### D · `tau_eq_i_alpha` S8 as a second consumer of E8 — **NOT recorded where E8's dispatch will see it**

- **E8's §B row still reads "BLOCKS DESK A's S8"** and cites only `conservation_of_angular_momentum`.
- The only mention of Desk D near E8 is inside **E10's** build notes (*"E8 is the brake half of the
  same 'no rendered agent' family — sequence adjacently"*). That is a family relationship, not a
  second consumer, and it sits in a different row from the one an E8 surgeon reads.
- The finding stands, re-verified on landed code: S8 authors entry `tau_app = 0, tau_brake = 0`, so
  the `Math.abs(tv) > 0` guard drops **both** entries and `eng.sources` starts empty;
  `rbrSetBrakeSource` **does** create the brake entry on a live drag (so the tug's *physics* is
  live), but `rbrApplyVisibility` still never re-runs — the pad brakes **invisibly**.
- **Ask: one line in E8's row.** *"Second consumer: `tau_eq_i_alpha` S8 (Desk D) — same defect via
  the `sources[]` path rather than the scalar path."* Desk D is E8's named verifier so it would be
  caught at verification, but a surgeon who A/Bs against one concept will ship a one-concept fix.

### E · §4b IS correctly represented now. Confirmed at every site; nothing owed.

| Site | State |
|---|---|
| `FROZEN_SCOPE_0c3.md` §0 ruling 3 | accepted **BLOCKING**, per-entry travel field named, **seventh capability, ten dispatches not nine** — recorded as scope growth, not absorbed ✓ |
| `FROZEN_SCOPE_0c3.md` §B **E10** | full row, `rbr_drive_torque_has_no_rendered_actuator`, BLOCKS DESK D (both concepts), all three build notes, ruling 4 bound to it, E8 adjacency ✓ |
| `ENGINE_LANDING_NOTICE.md` §7 | the wrong "Desk D is unblocked" paragraph **struck in place**, correction above it, both authoring consequences given ✓ |
| §7 residual | Desk A's `rotational_work_energy` correctly still called unblocked — that half was always right ✓ |

Every technical claim in those sites matches the code: no drive mesh (zero grep hits for any
`rbr_drive`/`driveWheel`/`motorWheel` symbol), `padEngageMs` assigned only on the two brake paths,
`sources[]` entries carry no travel field, `pad_travel_ms` singular and top-level. The 11-of-17
figure is carried verbatim. **Nothing owed on §4b.**

### F · A SECOND ESCAPE, same class as §4b — `time_ticks` (K5) is in no dispatch and no §C row

Beyond the four asks, found while checking whether the tick set collides with E5's new
`rbrWarnTickSurface`. It does not collide — but it has no home either.

- **What it is.** `rotational_kinematics` skeleton **K5**: `time_ticks: { start_ms?, start_cue?,
  every_ms, count }` — at each `start_ms + k·every_ms` a persistent tick lands on the r_ref circle
  at the stripe's position, positions closed-form from `rbrThetaAt` so a rewind reproduces the set
  exactly. Consumed by **S2** (`start_ms: 0`, count 3) and **S7** (`start_ms: 2000`, count 3).
- **Not expressible with anything E5 landed.** A `reference_marks` entry with `form: 'tick'` now
  *warns and draws nothing* unless the surface is `KE` with a bar (`rbrWarnTickSurface`,
  `rbrWarnTickNoBar`) — the one rbr surface with a scale. Authoring the ticks that way is exactly
  the silent-skip class E5 exists to make loud; post-E5 it is at least loud.
- **Not in `FROZEN_SCOPE_0c3.md` anywhere.** `time_tick` / `equal-time` / `K5` → zero hits. §C
  **C-1** covers markers, traces, swept arc, chord gauge and `r_point`; a progressive circular
  **trace** is not a discrete equal-time **mark set with an authored time origin**.
- **How it escaped — the same mechanism as §4b.** K5 was a skeleton-local item. The skeleton yielded
  ownership of its shared paragraphs to findings_d (§1, §2, §3, §4b, §6b) and **K5 was not among
  them**; findings_d §3 asks only for *"a fixed angular reference on the base + a drawn swept
  angle"* — no ticks. So K5 never reached §8, and Desk E froze from §8, correctly.
- **Cost.** S2 and S7 are built **on** the tick pattern: S2's claim is even spacing at constant ω,
  S7's is the 1 : 3 : 5 widening under constant α. Each state's Rule-32c delta cue **is** the tick
  geometry, and S7's narration says the numbers aloud (*"zero point three zero, zero point nine
  zero, one point five zero — one to three to five"*). Without ticks neither state has a delta and
  the θ = ω₀t + ½αt² beat has nothing to stand on.
- **Not raised as a scope demand.** Desk E is at ten dispatches and this desk is not the office.
  Filed so it is not rediscovered at `json-author` time.

**The pattern, worth one sweep before the build closes.** Both escapes have one shape: *a
skeleton-local K-item that yields ownership to findings_d, while naming a capability findings_d
never carried, reaches the freeze in nothing.* §4b was caught by the founder; K5 by this check.
**Recommend the other desks diff their own K/A/B/C-item lists against `FROZEN_SCOPE_0c3.md` once** —
it is a grep, and this is now two for two on Desk D alone.

### G · Standing items

- **E7 moves rbr baselines** (§6c). No consequence here — this desk has authored no JSON and holds
  no baselines. Recorded so the next session does not go looking.
- Unchanged from PASS 3 §D: `field_3d_config` in the seed script (§4 trap 2), `md5sum` the dense
  frames (§4 trap 1), verifier duties on **E6, E8, E9** — now plus **E10**, this desk's own row.

---

## PASS 5 — EXHAUSTIVE SELF-AUDIT of both skeletons' item lists. Four gaps, all filed, none demanded.

**Filed 2026-08-07.** §4b and K5 escaped by one mechanism: *a skeleton-local item yields ownership
to this file, while naming a capability this file's §8 never carried — so it never reached the
freeze, and Desk E froze from §8 correctly.* **The freeze was not wrong. The input was incomplete,
and the input was ours.** This pass sweeps every item in both skeletons to exhaustion before the
cross-desk version runs.

**Method.** All 20 items — `rotational_kinematics` **K1–K10**, `tau_eq_i_alpha` **D1–D10**. For
each, the capability it names was checked against three places: (a) this file's **§8** priority
table, (b) a **§B dispatch** in `FROZEN_SCOPE_0c3.md`, (c) a **§C** or **§D** row. Every verdict
below was read out of the documents and the code, not inferred from the item's rank.

### A · The full audit — 20 items, 16 covered, 4 gaps

| Item | Capability | In §8? | Landed / filed where | |
|---|---|---|---|---|
| **K1** / **D1** | signed applied torque | ✓ item 1 (§1) | **E4 — LANDED** | ✓ |
| **K2** / **D3** | θ/α/τ readout rows + loud warn | ✓ item 2 (§2) | **E5 — LANDED** | ✓ |
| **K3** | fixed base ray + swept θ arc | ✓ item 3 (§3) | **§C C-1** — named verbatim ("a fixed base-frame ray") | ✓ filed |
| **K4** | tangential `v = ωr` arrows + `point_markers[]` | ✓ item 4 (§4) | **§C C-1** — named, with its own true-zero map | ✓ filed |
| **K4·b** | the **`rbr_v_arrows` group focal token** | ✗ | **nowhere** | **GAP 1** |
| **K5** | `time_ticks` (equal-time ticks, explicit origin) | ✗ | **nowhere** | **GAP 2** |
| **K6** | θ(t)/ω(t) graph panel | ✗ — §7 *informational* only | **nowhere** | **GAP 3** |
| **K7** | `alpha` control token + slider row | ~ item 5, as *"whatever drives α"* | **E10** via founder ruling 4 (sharpened by PASS 4 §C) | ✓ |
| **K8** / **D4** | the motor drive wheel | ✗ (§4b, the original escape) | **E10** via founder ruling 3 | ✓ |
| **K9** / **D9** | `[LIVE]` inventory | n/a | no build | ✓ |
| **K10** / **D10** | `deriveStateMeta` motion from the torque | ✓ item 6 (§6b) | **shipped inside E4**; new timed keys ride registration rider **C9** | ✓ |
| **D2** | start from rest | n/a — office | ruled in PASS 2; E4 lowered the slider floor at both sites | ✓ |
| **D5** | `tau_app` slider token | ✓ item 5 (§5) | **E5 — LANDED** as `tau_applied` (see §C, one authoring note) | ✓ |
| **D6** | `restart.runs[]` per-run overrides | ✓ item 8 (§6) | **E6** | ✓ filed |
| **D7** | per-particle tangential **FORCE** arrows | ✗ — §4's body named it, §8 item 4 dropped it | **nowhere** | **GAP 4** |
| **D8** | timed formula reveal | ✓ item 7 (§6c) | **E1 — LANDED**, and *better than asked* (see below) | ✓ |

**D8 landed richer than the ask, and that closes a sibling's assumption too.** D8 delegated the
choice to Desk E — minimum `formula_at_ms` (whole surface at one instant) vs richer
`formula_steps[]`. E1 built **`formula_lines: [{ text, at_ms? }]`** and deliberately did **not**
build `formula_at_ms` (that name is taken by the `pef` scenario). So `tau_eq_i_alpha` S7's
**term-by-term assembly is authorable as designed** — the D8 downgrade clause ("S7's assembly
downgrades to a sentence-synced whole-formula reveal") is **void, do not apply it** — and the sealed
`conservation_of_angular_momentum` physics block's "formula_surface assembles" assumption is
satisfied rather than merely tolerated.

### B · The four gaps, with the state and beat that depends on each

Filed, not raised as scope demands — Desk E is at ten dispatches and this desk is not the office.

**GAP 1 · `rbr_v_arrows` — the group focal token (`rotational_kinematics` K4·b)**
- **Verified absent.** Zero hits for `rbr_v_arrows` or any grouping concept in `FROZEN_SCOPE_0c3.md`
  *and* in this file. §C **C-1** buys the arrows themselves ("per-marker tangential `v = ωr` arrows
  with a dedicated true-zero linear map") but names **no group token**. In code:
  `glow_focal?: string` (`:1141`) is **"exactly ONE scene focal (Rule 32e)"**, and
  `RBR_ELEMENT_TYPES` (`:51785`) is 19 individual mesh tokens with **no grouping mechanism at all**.
- **Depends on it: S6, "One turning rate, many speeds" — core ring.** Its whole claim is *two* points
  at one ω with tangent arrows in a visible **2 : 1 ratio**. A single-token focal over individual
  meshes lights **one** arrow — which destroys the comparison the state exists for — or the state
  authors two focals, which breaches Rule 32e. There is no third option today.
- Also reaches S9, whose explore beat keeps both arrows live.
- **Why it escaped:** it is a sub-clause inside K4 (P2-9). §8 item 4 compressed K4 to *"tangential v
  arrow at radius r"*, and a sub-clause of a compressed row is invisible to the compression.

**GAP 2 · `time_ticks` (K5)** — carried forward from PASS 4 §F, unchanged and still absent.
- **Depends on it: S2 (core) and S7 (extended).** S2's delta cue *is* equal tick spacing at constant
  ω (three ticks at 1.50 / 3.00 / 4.50 rad); S7's *is* the 1 : 3 : 5 widening under constant α, with
  the narration saying the numbers aloud. Neither state has a delta without it.
- Post-E5 at least the wrong workaround is loud: a `reference_marks` entry with `form: 'tick'` now
  warns (`rbrWarnTickSurface`) and draws nothing off the KE bar.

**GAP 3 · θ(t)/ω(t) graph panel (K6) — and a declared consequence nobody has recorded**
- **Verified absent.** This file mentions the graph **only in §7, LOW/informational** (*"no graph or
  plot surface exists in the rbr config… grep of the rbr region returns zero graph hits"*) — it
  never entered **§8**. `FROZEN_SCOPE_0c3.md` has zero graph rows; the single "graph" hit is the
  unrelated scar name `graph_marker_label_clipped` inside C-10.
- **This one is different from the other three: the skeleton pre-decided the outcome.** K6 is *"the
  ONE declared descope candidate"*, and P1-8 rules: **if Desk E descopes K6, S8 is DROPPED.**
- **So the consequence has already silently triggered.** By omission from the freeze, K6 is
  descoped, therefore **`rotational_kinematics` ships 8 states, not 9**: S8 (*"ω is the slope of the
  θ graph"*, the whole advanced ring) is dropped, the advanced ring becomes empty, and
  `entry_state_map.calculus_graphs` is removed. No fallback readout was ever authored — the REV-1
  Δθ/Δt fallback was deleted rather than priced, deliberately.
- **Nothing anywhere records that this has happened.** The skeleton still ships 9 states and the
  Checkpoint-A rider (*"if K6 is descoped, drop the advanced curriculum-tag claims in (i-3) and
  record it revisit-when-K6-lands"*) is unexecuted. **This is the item most likely to reach seal
  wrong** — not as a missing capability, but as a state that should not exist. `json-author` must be
  told 8 states, and the empty advanced ring is already **ruled compliant** under Rule 38a
  (Checkpoint A cycle 2: an empty set is trivially contiguous; the fleet ships `friction_force` and
  `equilibrium_of_particles` the same way).

**GAP 4 · per-particle tangential FORCE arrows (`tau_eq_i_alpha` D7)**
- **Verified absent, and this one escaped through a narrowing rather than an omission.** §4's own
  body is explicit: *"the tangential vector is needed **twice over**, for two different quantities:
  **v = ωr** at a marked point (kinematics) and **F** at a rim/particle (dynamics)… price one
  tangential-vector mechanism with **two consumers**, not two mechanisms — but note the
  magnitude-to-length maps differ (m/s vs N) and **must not be shared**."*
- **§8 item 4 then wrote only:** *"§4 — tangential v arrow at radius r (`v = ωr`) · BLOCKING
  `rotational_kinematics` · visual; **shared with concept #3**."* The force-form consumer vanished at
  that line. §C **C-1** inherited the narrowed form (velocity arrows + their true-zero map only), and
  **§D item 5** then hardened it: *"the row is still wanted, **by #4 `rotational_kinematics` alone**."*
- So the narrowing is ours, propagated twice, and it now reads as a deliberate scoping decision in
  two places. **It is not one** — it contradicts §4's own text in this file.
- **Depends on it: S7, "Adding up every particle" — advanced ring.** Its claim is the derivation
  F = ma per particle ⇒ τ = (Σmr²)α = Iα, *with the ledger summing to 1.53 exactly*. D7 is what draws
  the per-mass tangential forces that sum. Absent ⇒ nothing renders (D7's own words), and the state
  is a narrated assertion over a picture that does not contain its cause.
- **Cheapest correct fix is one clause, not a row:** C-1 already buys the mechanism; it needs *"two
  consumers, two magnitude→length maps (m/s and N — `rbrArrowLen`), never shared"* restored to it.
  E7 already reasoned exactly this way for the arrow **shafts** (§B E7: *"One mesh-cylinder shaft
  mechanism, two consumers… the two magnitude→length maps must NOT be shared… Same caution
  findings_d §4 raised for m/s vs N"*) — so the argument is already accepted in this build for the
  neighbouring mechanism. Only the tangential row lost it.

### C · One authoring note on E5, not a gap: `tau_applied`'s default step cannot reach 1.53

E5 landed `tau_applied` with **step 0.05** and min −2.0 (`RBR_SLIDER_SPEC`, `:50877`). D5 asked for
**step 0.01** because *"1.53 and 0.60 must be reachable"*. Checked arithmetically:

| token | min | step | target | on the grid? |
|---|---|---|---|---|
| `tau_applied` | −2.0 | 0.05 | **1.53** | **no** — k = 70.60 |
| `tau_brake` | 0 | 0.05 | **1.53** | **no** — k = 30.60 |
| `tau_applied` | −2.0 | 0.05 | 0.60 | yes — k = 52 |

1.53 N·m is `tau_eq_i_alpha`'s own taught value (τ = I·α = 3.06 × 0.50), so the S8 sandbox would
otherwise be unable to reach the number the whole concept is about, and the drive-vs-brake
static-hold demo would sit 0.02 N·m off balance.

**Not a defect — the override path is live and proven.** `rbrSc()` reads
`(config.slider_controls || {})[token]` for `min/max/step/default/dp/label`, so
`slider_controls.tau_applied = { min: 0, max: 2.0, step: 0.01, default: 1.53 }` fixes it, exactly as
D5 already noted for `tau_brake`'s S6 override. **`json-author` must author both overrides** — the
engine defaults are wrong for this concept and silently so (a slider that simply stops at 1.50).

Related, informational only: the declared `slider_controls` TS type (`:2269`) lists 20 keys and
includes **none** of `tau_brake` / `tau_applied` / `omega0` / `alpha`. **Harmless — verified, not
assumed:** the shipped fleet already authors undeclared keys through this path (`ac_generator` →
`omega`, `N`; `ac_voltage_resistor` → `vm`, `f_demo`, `V_dc`), and the read is a runtime string
index inside the emitted template, which tsc never sees. It is declaration hygiene of the same class
as E4's `'applied_torque'` living outside its own enum — worth one line whenever that file is next
open, worth no dispatch.

### D · The pattern, sharpened by four instances instead of two

All four gaps are **§8 compression artefacts**, and they come in two shapes:

1. **Omission** — the item never appears in §8 at all (§4b, K5, K6).
2. **Narrowing** — the item appears, but §8's one-line summary drops a clause the body carried, and
   the narrowed form then propagates and hardens downstream (D7: §4 body → §8 item 4 → C-1 → §D-5,
   losing a consumer at the first step and reading as deliberate by the last).

**Shape 2 is the dangerous one**, because the row *is* in the scope — nothing looks missing — and
the loss only shows at build time as a capability that serves one consumer where two were priced.
A cross-desk sweep should therefore diff each item's **body** against its §8 line, not merely check
that the item is present.

**Recommendation for the cross-desk version (unchanged in kind, sharper in method):** every desk
greps its own K/A/B/C item list against `FROZEN_SCOPE_0c3.md`, and for any item that *is* present,
re-reads the source paragraph for clauses the summary dropped — consumers, second maps, group
tokens, origin fields. On this desk that method found **4 gaps in 20 items**, two of which
(GAP 1, GAP 4) were sub-clauses of rows that already looked covered.

**Nothing in this pass is a scope demand.** GAP 3 needs no build at all — it needs a decision
recorded (`rotational_kinematics` ships 8 states) so it is not discovered at seal.
