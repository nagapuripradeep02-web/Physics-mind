# Desk B — SEAM R engine findings

Desk B is the nominated SEAM R finding owner (`rotmech_b_state.md` guardrail 6): no other
desk files an `nlb` finding. **This desk never dispatches an engine fix.** Desk E is the sole
engine owner; these rows are the handoff.

Every claim below was verified by direct code read in this worktree at
`src/lib/renderers/field_3d_renderer.ts` (post-`eb8fd43`, the landed SEAM R tree).

---

## Finding B-1 — the rolling branch has no KINEMATIC gate, so a flat-track slip-to-roll capture cannot be expressed

**Status:** OPEN · **Severity:** MAJOR (blocks union item **(c)-3**, the item its own skeleton
calls "the (c) centerpiece") · **Owner:** `peter_parker:field3d_surgeon` · **Filed:** 2026-08-04
by Desk B during `pure_rolling` authoring · **Verified by code read, not by runtime.**

### What the design bought

`pure_rolling` union item **(c)-3**: *"Slip-to-roll CAPTURE — closed-form in state-local t
(t_c = v₀k/(μ_k g(1+k))), never a per-frame latch. Plus the A1 branch-priority rule."*
Consumers: STATE_7 (the whole state) and STATE_8's advanced-ring ω₀/μ_k sliders.

STATE_7 launches a wheel on the **flat** track (`theta_deg: 0`) at v₀ = 2.0 m/s with
`omega0_rad_s: 0`. Kinetic friction should slow `v` while spinning `ω` **up**, the two
converging at t_c = 1361 ms, after which the rolling branch takes over with an honest
`f 0.00 N`. The engine's own comment states this intent verbatim (`:46859-46861`):

> *"which is what makes a wheel launched with no spin get spun UP by a friction that is
> simultaneously slowing it down."*

### What the engine actually does

The rolling branch's priority gate (`:46828-46840`):

```js
var kRoll = nlbShapeK(b), rollHeld = false;
if (b.rolling && !b.rotation_locked && !nlbHeldNow) {
    var aRoll = drive / (b.m * (1 + kRoll));
    var fRoll = -kRoll * b.m * aRoll;
    var canRoll = (Math.abs(fRoll) <= maxStat + 1e-12) && !boundPin;
    if (canRoll && !(stuck && Math.abs(b.v) < NLB_STOP_EPS_V && Math.abs(aRoll) < 1e-12)) {
        rollHeld = true; stuck = false; a = aRoll; f = fRoll;
    }
}
```

`canRoll` is a **dynamic availability** test — "is the friction rolling demands available?" It
is the correct and complete test **on an incline**, where `drive = mg sin θ ≠ 0` makes it the
genuine physical gate `μ_s ≥ μ_min = (k/(1+k))·|tan θ|`, exactly as the header comment at
`:46820-46825` derives.

**On flat ground `drive` is identically 0**, so `aRoll = 0` and `fRoll = 0` on every frame
**regardless of the body's actual (v, ω)**. `canRoll` degenerates to `0 <= maxStat`, true for
any `μ_s ≥ 0`. `stuck` requires `|v| < NLB_STOP_EPS_V` (`:46795`), so a launched wheel is not
stuck and the second guard passes too. **`rollHeld` is therefore true on frame 1, for a body
whose contact is demonstrably sliding.** There is no test anywhere in this branch for whether
the kinematic rolling condition `v = ωR` is actually satisfied.

The consequences follow mechanically:

- `a = aRoll = 0` and `f = fRoll = 0` — `v` never decelerates, and `f` reads a **dishonest
  `0.00 N` while the contact speed is 2.0 m/s**.
- `:46852` — `if (!b._spinIndep) b.omega = b.v / R;` is **skipped**, because authoring
  `omega0_rad_s` sets `_spinIndep` (`nlbSpinIndependent`, `:40025-40029`). `ω` is left to
  `nlbRollSpin`'s closed-form segment (`:40117-40131`), whose `alpha` is only ever set nonzero
  inside the kinetic branch — never reached. The lazily-created default segment carries
  `alpha = 0`, so **ω stays frozen at its authored seed forever**.
- `:46844` — the capture re-anchor `if (b._slipping) { … }` never fires, because `_slipping` is
  only set true inside the kinetic branch (`:46874-46877`), which `rollHeld` pre-empted.

Net: a wheel authored per the design glides at constant v with its spin frozen. **No
deceleration, no spin-up, no capture, and an incoherent readout pair (`contact 2.00` beside
`f 0.00`).**

### The alternative authoring is also insufficient

Omitting `rolling` and keeping `omega0_rad_s` routes the body to the kinetic branch. Half of it
works: `vRef = v − ωR` (`:46863`) is gated on `b.rolling || b._spinIndep`, so the friction is
correctly **contact-relative** and `v` decelerates honestly. But the angular half —
`alphaSlip = -f/(k·m·R)` and its `nlbRollSeg` anchor (`:46867-46883`) — is gated on `b.rolling`
alone, now false. **ω still never integrates.** `Romega` reads a flat 0.00 and there is no
convergence to capture.

**Neither available authoring produces the taught picture.** The two gates disagree about what
`rolling` means: `:46863` treats `_spinIndep` as sufficient to have an independent spin, while
`:46867` requires `rolling`.

### Suggested fix (for Desk E / the surgeon — NOT built here)

Two independent changes, either of which alone is insufficient:

1. **Add the kinematic precondition to `rollHeld`** (`:46834`): require the contact to be
   already at rest before adopting the rolling branch, e.g.
   `Math.abs(b.v - nlbOmegaOf(b) * nlbRadiusM(b)) < NLB_STOP_EPS_V`, so a genuine v–ω mismatch
   falls through to the kinetic branch and reaches the existing `_slipping` / `nlbRollSeg`
   capture machinery — which is correct and already written.
2. **Gate the angular-acceleration sub-block on `_spinIndep`, not `rolling`** (`:46867`), to
   match the sign convention already chosen one line earlier at `:46863`.

On an incline both changes are inert: bodies are released from rest with ω₀ = v₀/R = 0, so the
kinematic condition holds from frame 1 and the existing path is unchanged.

### Blast radius

- **`rolling_on_incline` (the sibling, this desk): none.** Every one of its rolling states runs
  on `theta_deg ≠ 0` with `drive = mg sin θ ≠ 0`, where `canRoll` is the genuine physical gate
  the branch was derived for, and its bodies are released from rest (v = ω = 0, condition
  satisfied). Its S7 slipping state is a μ_s `param_ramp` that drives `canRoll` **false** — the
  intended, working direction through the same gate.
- **Back-compat: none.** Every pre-SEAM-R body has `rolling` falsy and takes the identical
  two-branch path.
- **Scoped to flat-track capture only:** `pure_rolling` STATE_7, and STATE_8's advanced-ring
  `omega0`/`mu_k` sliders (the ring-gated demo the physics block §A explicitly anticipates).

### What Desk B authored, and why

`pure_rolling.json` STATE_7 and STATE_8 author **`rolling: true` per the design**, not a
workaround. Reasoning: both available options are wrong, so there is no quality to be bought by
deviating — and a workaround that half-works would let the defect ship **silently** (a
decelerating wheel passes THE EYE's motion heuristic), whereas the spec-correct authoring fails
**loudly** (frozen ω, incoherent readouts) and will be caught at the visual gate. Authoring to
spec also means zero re-authoring once the engine is fixed.

**STATE_7 and STATE_8's mismatch demo are therefore BLOCKED, not done.** They must not be
sealed at Checkpoint B until this row is fixed and the states are re-walked.

---

## Finding B-2 — union item (b)-8 half-landed: `controls_visible` tokens `R`, `R2`, `omega0` are DECLARED but never wired, and are dropped in silence

**Status:** OPEN · **Severity:** MAJOR (kills the only live control on `pure_rolling` STATE_1,
half of its STATE_8 sandbox, and a physics-block-mandated control on `rolling_on_incline`
STATE_4) · **Owner:** `peter_parker:field3d_surgeon` — the code is the `newtons_laws_body`
slider block **inside `field_3d_renderer.ts`**, so it is field3d-surgeon's region, NOT
pcpl-surgeon's (the 2026-07-31 rename table puts `parametric`/`particle_field`/PCPL with
pcpl-surgeon; `field_3d_renderer.ts` is field3d-surgeon's) · **Filed:** 2026-08-04 by Desk B
during `rolling_on_incline` authoring · **Verified by code read, not by runtime.**

### What the design bought

Union item **(b)-8** — "`controls_visible` token `R`" — consumers `pure_rolling` S1 and S8.
SEAM R widened the token enum accordingly; the interface comment at `:1545-1546` reads:
*"SEAM R adds 'R' / 'R2' (the two radius dials) and 'omega0' (starting spin — the control that
makes a v-ω mismatch teacher-drivable)"*, and the enum at `:1547-1548` carries all ten tokens.

`pure_rolling`'s physics block §F.4 explicitly anticipated the pre-SEAM-R absence and told
json_author **not** to mistake it for a design gap, because (b)-8 would land it.

### What the engine actually does

**The declaration landed; the wiring did not.** `NLB_SLIDER_TOKENS` (`:42637`) is still the
eight pre-SEAM-R tokens:

```js
var NLB_SLIDER_TOKENS = ["m", "m2", "F", "F_ang", "theta", "mu_s", "mu_k", "v0"];
```

`NLB_SLIDER_SPEC` (`:42638-42653`) — the per-token row spec (DOM ids, min/max/step/default,
glyph, unit) — has matching keys for exactly those eight. There is **no `R`, `R2` or `omega0`
entry**. `nlbSliderTokensUsed` (`:42683-42693`) builds the panel from the union of every
state's `controls_visible`, filtered through `if (NLB_SLIDER_SPEC[cv[c]]) want[cv[c]] = true;`
— **a token absent from the spec is silently dropped: no row, no disabled row, no console
warning, no gate failure.** `nlbApplyParam` and `nlbSliderValueFromEngine` (the write/read
dispatchers) likewise carry branches for only those eight. (`omega0` does exist at `:49999` /
`:50075`, but that is the UNRELATED `rigid_body_rotation` turntable scenario's own control and
is unreachable from `newtons_laws_body`.)

This is the same silent-skip failure shape as the turntable's `RBR_RO_META` hazard recorded in
`APPARATUS_CONTRACT.md` §1: a concept authored against a missing row passes Zod, passes
`validate:concepts`, seeds, renders, and can be sealed with the control simply absent.

### Blast radius

- **`pure_rolling`**: STATE_1's `controls_visible: ["R"]` is its ONLY control — the state ships
  with **no live control at all**, and the whole authored "R drag re-lifts, re-scales and
  respaces the marks + bracket live" mechanism (union (c)-1's live-respace consumer) is
  unreachable. STATE_8's `["v0","R","omega0","mu_k"]` silently reduces to `v0` + `mu_k` — the
  two core-ring dials the reduced preset depends on (v₀, R) lose one, and the advanced-ring
  ω₀ mismatch demo loses its control. Note ω₀'s demo is **also** blocked by Finding B-1; these
  are two independent defects on the same beat.
- **`rolling_on_incline`**: the physics block's control-spec table mandates a live `R₂` on S4
  ("Live controls: m₂, R₂") — inert. S8's radius dials are inert.
- **Back-compat: none.** No pre-SEAM-R concept authors these tokens.

### Suggested fix (for Desk E / the surgeon — NOT built here)

Add `R`, `R2`, `omega0` entries to `NLB_SLIDER_SPEC` and `NLB_SLIDER_TOKENS`, and matching
branches to `nlbApplyParam` / `nlbSliderValueFromEngine` writing `bA.radius_m` / `bB.radius_m` /
the first slider body's `omega0_rad_s`, mirroring the existing `m`/`m2` pattern
(`nlbSliderBodies()` = the first two non-ghost/non-fixed bodies). A radius write must also
re-lift and re-scale the mesh and re-space the revolution marks, which is (c)-1's live-respace
requirement — the two items land together or S1 gets a dial that moves nothing.

**Separately, harden the silent skip:** `nlbSliderTokensUsed`'s `if (NLB_SLIDER_SPEC[...])`
filter should warn on an unknown token rather than drop it. This defect was invisible for
exactly as long as it was silent.

### What Desk B authored, and why

**Both concepts declare the tokens the design bought**, and neither works around the gap:
`pure_rolling` S1 `["R"]` and S8 `["v0","R","omega0","mu_k"]`; `rolling_on_incline` S4
`["m2","R2"]` and S8 `["m","m2","R","R2","theta","mu_s"]`. Declaring a dropped token is inert
(clean filter, no throw), so there is no runtime cost to fidelity — and it means the pair needs
**zero re-authoring** when the wiring lands. The alternative (omitting them) would have made
the JSON silently diverge from an approved design with nothing in the file to say why, and
would have left the two siblings inconsistent with each other.

**`pure_rolling` STATE_1's live-radius beat, both STATE_8 sandboxes' radius dials, and
`rolling_on_incline` STATE_4's live-radius re-verify are BLOCKED, not done.**

### One thing this finding does NOT cover

`controls_visible` has **no `'shape'` token at any layer** — not in the enum, not in the spec.
`rolling_on_incline` S8's design calls for a core-ring shape control. Unlike `R`/`R2`/`omega0`
this was never bought by any union item, so it is a **design-vs-engine scope gap, not a
half-landed build**. Nothing is authored for it (inventing a token the interface does not
declare would be a fabrication, not fidelity). S8 keeps the four canonical shapes fixed per
lane in the apparatus contract's order. Consequence, stated plainly: with no shape control and
no live radius, and with live mass binding by array INDEX to the first two non-ghost bodies
(sphere + disc, never the ring), the skeleton's own DoD teacher-walk example §10(j)(2) — "pit a
marble against a huge ring" — **is not achievable on the shipped engine by any authoring
choice.** That needs a chapter-level decision, not a desk workaround.

---

## Pre-flagged gaps — confirmed absent, not blocking

1. **No `'turns'` readout token, no turn-counter primitive.** `readouts` (`:1540-1541`) has no
   such member; `revolution_marks` (`:1608-1613`) exposes only `body_id` / `show_bracket` /
   `bracket_label` / `max_marks`. The skeleton's S1/S8 "turns counter `turns 3`" is not
   expressible. **Authored around it:** the numbered ground ticks the marks primitive already
   stamps ("0", "1", "2", …) carry the turn count visually, which is the pedagogical payload;
   no `turns N` HUD row is authored. Not filed as blocking — the R dial stays visibly
   consequential under the reduced preset via the mark spacing, which was the requirement.
2. **No k-chip render path.** `shape_factor_k` is consumed by physics (`nlbShapeK`, `:40010`)
   and stored on the body record (`:45519`), but nothing renders it. **Does not affect
   `pure_rolling`**, which deliberately never renders k (do-not-prespoil — k is the sibling's
   reveal) and never authors `shape_factor_k` (`shape: 'wheel'` derives k = 0.5). **Carried
   forward as a live risk for `rolling_on_incline`**, whose S4 ("both k chips read 0.40") and
   S8 core-ring furniture both call for k chips — to be resolved in that concept's authoring
   pass and appended here if it proves a genuine gap.

---

## Naming reconciliations — design doc vs. what shipped (not defects; recorded so no desk re-derives them)

| Design doc says | Engine shipped | Where |
|---|---|---|
| `formula_overlay` becomes an ordered line list | a **separate** key `formula_lines: Array<{text, at_ms?}>`; legacy `formula_overlay` string untouched | `:1644` |
| readout tokens `'Rω'`, `'ω'` (physics_block §F.2) | ASCII `'Romega'`, `'omega'` — Unicode is display-only | `:1540-1541` |
| new `mode` values (`rolling_contact`, `rolling_intro_circumference`, …) | **`mode` is a closed enum of 14 pre-SEAM-R members**; no rolling modes exist. Only `'sandbox'` has behavioural consequence (Rule 37 / trusted-drag); the rest are inert labels | `:1070-1074` |

Both bought timed fields ARE registered in `deriveStateMeta.ts` as the design required —
`activate_at_ms` at `:2814`, `formula_lines[].at_ms` at `:2829`. THE EYE will pin correctly.

**The Phase-0 alarm rule did NOT fire in this pass:** no third timed field class was needed or
found. Every authored millisecond in `pure_rolling.json` is a `phases[].glow_focal` window, a
`formula_lines[].at_ms`, the single `activate_at_ms: 1500`, or a physics event.
