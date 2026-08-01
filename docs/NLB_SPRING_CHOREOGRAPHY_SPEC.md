# `newtons_laws_body` — realistic spring choreography

> Founder-approved 2026-07-30, from a screen recording of `newton_third_law`. Applies to EVERY state
> that uses a spring, in every concept, now and later.
>
> ⚠ **AMENDED 2026-08-01 (founder ruling) — the MECHANISM below is superseded for any spring that
> needs an honest energy quantity. This document's INTENT stands in full; only how the slow look is
> achieved has changed.** Read the amendment at the end of this file before authoring or editing a
> spring state. The scripted `spring_action` cycle specified here remains LIVE and unchanged for
> every state that does not author `k_N_per_m` (including `newton_third_law`, which owns the
> push-off apparatus).

## The founder's finding

> "the spring is really fast. You need to slow down. You are not showing real spring compressing and
> releasing it… It should be slow and perfect and realistic in every state wherever you use the
> spring. Make it high value — it should look like a real spring doing the things."

Confirmed on the recording: at t≈8 s the compressed coil, both arrows and the live HUD are all on
screen; by t≈10 s the carts have separated and the spring, arrows and readings are gone. The entire
interaction is a **flash**.

## Diagnosis — the coil geometry is fine, the TIMING is wrong

The coil is already honest geometry: a `TubeGeometry` helix (`NLB_SPRING_COILS = 8`,
`NLB_SPRING_WIRE_R = 0.022`) whose pitch is rebuilt as its length changes
(`NLB_SPRING_LEN_Q = 0.02` quantum). Nothing about the mesh needs replacing.

Three real defects, all timing/choreography:

1. **There is no compression stroke.** The state opens with the spring ALREADY compressed. A student
   never sees it being loaded, so the stored energy has no visible origin. This is the biggest miss —
   "you are not showing real spring compressing".
2. **The release is 420 ms.** That is the true physics (`t = sqrt(2·stroke/a_rel)`; 30 N on 4+12 kg
   over the 0.88 m stroke), and it cannot be slowed by authoring: a 2-second contact would need about
   1.3 N, far below the arrow-length floor that keeps a force readable.
3. **No ring.** A real spring oscillates briefly after it lets go. Ours vanishes the instant the gap
   passes natural length.

## The resolution: a declared slow-motion beat

Physics cannot give us large forces AND a slow release at the same time — which is exactly why every
real physics lesson films fast events in slow motion. So we do the same, and we LABEL it.

### `spring_action` — the full realistic cycle

New per-state block, replacing the bare `push_off` timing for spring states:

```ts
spring_action?: {
    approach_ms?: number;   // carts converge, coil at NATURAL length, no force yet
    compress_ms: number;    // coil VISIBLY compresses to NLB_SPRING_COMPRESS_FRAC; force ramps in
    hold_ms?: number;       // latched and loaded: coil compressed, both arrows at full magnitude,
                            //   HUD live. This is the beat a teacher talks over.
    slow_factor?: number;   // playback slowdown for the RELEASE only, default 6.
                            //   The 420 ms physical release plays over ~2.5 s of wall time.
    ring?: boolean;         // brief damped oscillation of the coil after it lets go (default true)
};
```

Sequence: `approach → compress → hold → release (slowed) → coast → re-arm` (the existing
`repeat_every_ms` still drives the cycle).

### How `slow_factor` must be implemented — this is the load-bearing constraint

It is a **dt multiplier on the integrator during the release window only**, NOT a clock hack:

```js
var dtPhysics = inSlowWindow ? (dt / slowFactor) : dt;
```

- Rule 36 is preserved: the step stays strictly linear in dt (`v += a·dtPhysics; s += v·dtPhysics`),
  there is no internal sub-stepping, no literal `0.016`, and no second clock. Under
  `SET_TIME_FREEZE`, `dt = 0`, so `dtPhysics = 0` and frozen frames stay byte-identical.
- The HUD keeps showing the **true physical values** (`F = 30.00 N`, `a = 7.50 m/s²`) — we are slowing
  the *playback*, not the physics. Never scale the reported numbers.
- **Rule 24/34 honesty requirement:** while the slow window is active, the canvas shows a small
  badge — `slow motion ×6` — so a student never mistakes a slowed release for a small acceleration.
  Without that label this change would be teaching a falsehood; with it, it is standard practice.
- Rule 37: in a `mode: 'sandbox'` state there is no slow window at all — the teacher's sandbox runs
  in real time, and a trusted slider or drag cancels any in-progress choreography (same
  `PM_nlbSweepSeized` / `PM_nlbBodyDragged` flags `idle_auto_sweep`, `param_ramp` and the repeat
  cycle already use).

### `ring` — the finishing touch

After release, once the carts pass natural length, the coil currently hides instantly. Instead: let it
oscillate about natural length with a short damped decay (a few tenths of a second of real time,
amplitude decaying to zero) and THEN hide. Purely cosmetic — it must never feed the integrator, and
never move a cart.

## Suggested default choreography

For the `newton_third_law` states (30 N, 4–12 kg, `length_m = 10`):

| Phase | Duration | What the student sees |
|---|---|---|
| approach | 600 ms | two carts drift together, coil at full natural length |
| compress | 1600 ms | coil visibly bunches, pitch tightens, arrows grow in |
| hold | 1200 ms | loaded and latched — the beat to narrate over |
| release | ~2500 ms wall (420 ms real, `slow_factor: 6`) | coil springs open, carts accelerate apart |
| coast + ring | remainder | carts separate 3:1, coil rings and fades |

That is roughly a 7-second cycle — so `repeat_every_ms` needs raising from 2600 to about **7200** for
these states, giving one full, legible, realistic cycle per narration beat instead of four flashes.

## Verify

`check:renderer-syntax` → `tsc --noEmit` (0) → `validate:concepts` → re-seed → `visual:eyes` on
`newton_third_law`, and confirm by eye that a mid-compress frame and a mid-release frame BOTH exist
and both show the coil at an intermediate length. Regression EYE on `electric_flux` + `magnetic_flux`.

Rule 36b full-fleet re-verify is NOT triggered: `dtPhysics` is a local scale inside the nlb frame
function and never touches the shared `animate()` / `dtStep` / `__pmSteps` clock.

---

# AMENDMENT — genuine spring physics (founder ruling, 2026-08-01)

> Raised during Ch.6 Phase-0 Checkpoint A (`conservation_of_mechanical_energy`), where finding F1
> surfaced a direct collision: this spec scopes the SCRIPTED `spring_action` cycle to "every state
> that uses a spring, in every concept, now and later" — but an honest energy layer needs a real
> force law. There is no spring constant `k` in a scripted stroke, so plotting `½kx²` over it would
> draw a total that is not flat, in the very state whose caption claims the total is constant.

## The ruling (verbatim)

> Build GENUINE spring physics (authored `k`, force `F = −kx` inside the integrator, `x` exposed to
> the energy layer), and achieve the teachable slow-motion look by SLOWING PLAYBACK over that real
> physics — never by scripting the stroke.

**What is preserved, in full:** this document's finding and its intent. A real spring genuinely does
bounce too fast to teach from — that diagnosis was correct and is unchanged. So are the load-bearing
constraints: the `slow_factor` dt-multiplier implementation (§"How `slow_factor` must be
implemented"), the mandatory `slow motion ×N` badge (Rule 24/34 honesty), Rule 36 frame-rate
independence, and Rule 37's sandbox behaviour.

**What changed:** only the mechanism. `slow_factor` becomes a playback modifier over real physics
rather than a replacement for it. `spring_action`'s approach → compress → hold → release LOOK now
*emerges from real dynamics viewed slowly*, instead of from a force ramp and a latch.

## The additive gate — nothing here is retired

`k_N_per_m` present → genuine-physics path. **Absent → the scripted `spring_action` cycle specified
above runs exactly as before, bit-for-bit.** `newton_third_law` owns the scripted push-off apparatus
and stays on the legacy path; it is in the regression sample for every seam of this build and read
**0.00% on all 10 H2 baselines** at every one.

Authoring both `k_N_per_m` and `spring_action` is unsupported — `k_N_per_m` wins.

## Contract additions (`newtons_laws_body.spring`)

| key | type | default | semantics |
|---|---|---|---|
| `k_N_per_m` | number > 0 | absent | **THE GATE.** Spring constant; enables `F = −kx` in the integrator and exposes `x` to the energy layer. |
| `natural_length_m` | number > 0 | `1.6` | Free length in metres. Drives BOTH the physics rest length and the drawn coil length. |
| `slow_factor` | number ≥ 1 | `6` | Unchanged in meaning; now scales the step of a REAL force law. Values < 1 ignored. |
| `sandbox_slow_factor` | number ≥ 1 | `1` | The factor inside a `mode: 'sandbox'` state. `1` = real time, as originally specified. |

Position contract: compressed when `|s_a − s_b| − (halfA + halfB) < natural_length_m`, half-extents
0.275 m for a `fixed` wall slab and 0.55 m for a cart. Author the home pose with the body CLEAR of
the coil, or the state opens already loaded. `compressed` is ignored on the genuine path — the
physics owns the length.

## Three constraints that are NOT optional on the genuine path

1. **The integrator must stay honest about gravity.** The shipped step is
   `s += 0.5(v₀+v₁)·h + 0.5·a_spring·h²`, which expands to *exact* integration for the constant part
   plus the semi-implicit form for the spring. Applying semi-implicit Euler to gravity as well would
   drift ≈0.29 J per second of free slide **with no spring present**, visibly tilting a flat-topped
   energy column. The added term vanishes identically when `F_spring = 0`, which is why every legacy
   baseline is untouched.
2. **The displayed total must carry the shadow-Hamiltonian correction:**
   `E_display = K + U_grav + U_spring + (dtPhysics/2)·k·x·v`. Motion is unchanged; residual O(dt²).
   `slow_factor` is a legibility choice, **not** the numerical remedy — at m = 2 kg, k ≈ 370 N/m,
   slow_factor 6 the raw ripple is ≈0.93 J and `|ΔE| ≈ (ω·dt/2)·E` is LINEAR in ω·dt. Measured with
   the correction: **0.005 J** (bar < 0.05 J), a 177× reduction.
3. **The slow window is CONTACT-DETECTED** (`x > 0`, latched against chatter), **never** the
   closed-form phase machine keyed to `contact_from_ms` / `release_at_ms`. Do not reuse the
   `push_off` gate.

## The real-time trap, and why the guard exists

At `slow_factor: 1` the ripple measures **0.457 J** — 9× the acceptance bar. It is NOT integrator
ripple: it is a **contact-entry quantization step**. With no slow window the body crosses the coil
face mid-frame and lands up to `v·h` inside it with zero force having acted, acquiring `½k(v·h)²`
that no work paid for — `½·370·(3/60)² = 0.4625 J`, matching the measurement. It is a one-time STEP
at each contact, not a shimmer, so the column top jumps and holds.

The error falls as dt², so `sandbox_slow_factor: 4` divides it by 16 (≈0.03 J, inside the bar).
**Author `4` on any sandbox state with a spring whose lesson claims a constant total.** The window
stays contact-gated (shut for the whole free slide) and any trusted drag or slider cancels it, so a
teacher never feels lag on a control.

Backstop, because remembering is not a plan: a state that shows `E_total`, shows no `E_dissipated`,
and has no friction or applied force is a state whose whole claim is *"this total does not change"*.
If the displayed total then moves more than 0.05 J from its entry baseline, **`[PM_NLB_ENERGY_DRIFT]`
fires once and THE EYE's console audit fails the concept.** The guard is deliberately blind to the
CAUSE and checks only the CLAIM — so it also catches causes nobody has thought of.

Do **not** author a spring state at `slow_factor: 1` outside a sandbox: it fails the ripple bar even
corrected.

## Where this landed

Ch.6 Phase-0 stage 0c, seams K–N on `newtons_laws_body`: `9f479f6` (spring physics), `dd2b869`
(energy display layer), `55c2fd7` (teaching instruments), `0527a81` (off-axis force geometry),
`0d2adef` (determinism rounding). Full contracts and measured evidence:
`docs/loop_runs/ch6_state.md`. Regression across all 10 `newtons_laws_body` concepts that read
normal force: **332 deterministic checks, 0 failures.**
