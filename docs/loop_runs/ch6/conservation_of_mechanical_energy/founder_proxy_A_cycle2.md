# FOUNDER_PROXY — CHECKPOINT A, cycle 2 (verification)

**Concept:** `conservation_of_mechanical_energy` · **Cycle:** 2 of 2 · **Date:** 2026-08-01

## VERDICT: `DESIGN_FIX` — two one-clause ENGINE-SPEC patches, no redesign

The design is sound and every protected item survived. Fourteen of sixteen findings landed in the
body, not just in the changes table. But the 0c build contract still carried **one false quantitative
claim** and **one uncovered clamp path**, both in the load-bearing spring/sandbox states.

**This did NOT warrant a third design cycle or parking** — the reviewer supplied verbatim replacement
text and directed that it be applied and 0c proceed, with no re-review.

> **PATCHES APPLIED 2026-08-01 by the dispatching session** (verbatim, plus the three bind-in risks
> and the P3 nit) — see "Applied" at the bottom. The skeleton is now the 0c build contract.

## F1–F16 verification

| F | Status | Evidence |
|---|---|---|
| F1 | LANDED | Notes 8a–8d: `k_N_per_m`, `F=−kx` in integrator, `x` exposed, additive legacy path |
| F2 | LANDED | §3 home pose = permanent incline + wall spring; no θ ramp anywhere in body |
| F3 | **PARTIAL** | Note 17 + corrected S3/S7 motion plans landed; `nlbSandboxWrap()` path uncovered |
| F4 | LANDED | Note 2 scoped to 3 derived bars; note 3 state-function; note 18 six-part reset |
| F5 | LANDED | Note 19 a/b/c: `d` vector, angle arc, `applied_force {N, angle_deg}` |
| F6 | LANDED | Note 10: mid-scale zero baseline, sign-coloured, signed numeric |
| F7 | LANDED | S5 core in §2; `intro` = S1–S5+S8 (i-4); both cuts re-run (i-1); `m₂` gone from S8 |
| F8 | LANDED | S8 formula `E=K+U+Uₛ` now backed by real `k` slider |
| F9 | LANDED | S2 delta cue = "Total never changes" |
| F10 | LANDED | S2 control = θ; S4 additionally `k` |
| F11 | LANDED | Note 10: N concurrent named-force instances, ≥2 |
| F12 | LANDED | Note 1: LEFT edge + measure-and-reflow ladder |
| F13 | LANDED | Camera column, all 8 states; field is real (`camera_position`, renderer L49992) |
| F14 | LANDED | S6 focal = second block's body mesh; DOM readouts never glow |
| F15 | NOT LANDED (accepted) | Still no shell tool; carried as Gate-8 flag — architect genuinely cannot run it |
| F16 | LANDED | Three `deriveStateMeta` sites + pin at 55–65% of loop, ±150 ms guard |

**F7 consequence (removing `m₂` from S8): correct, and a net gain.** Under `intro` a second body
would be untaught apparatus in the sandbox (38b). Mass-independence stays explorable — drag `m`,
watch the bottom `v` readout not move — a cleaner single-variable demo than two lanes.

**Protected items:** all intact — 8-state arc/ids/order, S2 aha earned by S1, S3 ghost marker, S6 not
promoted, stop height `v₀²/(2g·sinθ)` along-surface (correct), mass-independence, derivation chain,
roller-coaster + trampoline anchors, stacked column, reserved `E_dissipated` slot. **No physics
error → no ESCALATE.**

## Union closure: **CLOSED**

All four cycle-1 blockers resolved: #1/#2 by note 19 + signed note 10; #5 by note 10's N-concurrent
accumulators + note 11's crossing detector; #8 by note 8a. #3/#4/#7 by the derived bars; #10 by note
3; #11/#12 by note 14.

**Watch item:** #6 (ΔU = −W_c) is the thinnest link — authorable via note 11 checkpoint stamps beside
a `W_grav` readout, but there is no dedicated pairing primitive. Watch at #6's own Checkpoint A
rather than block now.

## MUST-FIX 1 — note 8b's ripple claim was wrong by 1–2 orders of magnitude

Semi-implicit Euler's modified-Hamiltonian ripple is `|ΔE| ≈ (ω·dt/2)·E` — **linear** in `ω·dt` and
proportional to `E`. At realistic parameters (m = 2 kg, k ≈ 370 N/m → ω ≈ 13.5 rad/s, `slow_factor` 6
→ dtPhys = 2.8 ms, E ≈ 29 J) the ripple is **≈ 0.55 J**, not "below 0.1 J" — a ~5 px breathing of the
column top and a wobbling numeric, sign-flipping exactly at max compression. **That is S4's caption
contradicted on screen: the F1 failure mode reintroduced by a wrong number.** Reaching 0.1 J by
`slow_factor` alone would need ≈ 33×.

*(Arithmetic independently re-derived by the dispatching session before applying: ω = √(370/2) ≈ 13.6,
ω·dt/2 = 0.0189, × 29 J ≈ 0.55 J. Confirmed.)*

**Applied replacement:** display-side shadow-Hamiltonian correction
`E_display = K + U_grav + U_spring + (dtPhysics/2)·k·x·v` (motion unchanged, residual O(dt²) ≪ 0.1 J);
`slow_factor` is a legibility choice, NOT the numerical remedy; acceptance probe
`max|E_display − E(t₀)|` over a full contact cycle < 0.05 J.

## MUST-FIX 2 — note 17 did not cover the sandbox wrap

`nlbSandboxWrap()` (renderer ~L42881) is live in `mode:'sandbox'`: on reaching a bound it **teleports
`s` across the track and re-seeds `v` to authored `v₀`**. In S8 a teacher can set θ→0 with `v₀ > 0`
and `μₖ = 0`; the block then never returns, wraps, and the E column jumps in both U and K. Note 17
addressed only the guided clamp.

**Applied addition — note 17(c):** the sandbox wrap is also NOT physics; if it fires while the energy
layer is active, treat it as a state re-entry — re-capture `E_total(t₀)`, re-arm every latch/one-shot,
reset the bar baseline in the same frame; never render a wrap as an energy change.

## Engine-spec risks — bound into the skeleton for the 0c dispatch (no architect cycle)

- **8b "verbatim" is not verbatim.** The shipped slow window is a closed-form phase machine keyed to
  authored `contact_from_ms`/`release_at_ms`. With real physics the window is **contact-detected**
  (`x > 0`, latched against chatter), so the wall↔physics remap is no longer closed-form. Told the
  surgeon explicitly, or they will try to reuse the `push_off` gate. → **applied into note 8b**
- **Note 3 needs a scope clause:** `E_dissipated = E_total(t₀) − ΣE` is exact only with no external
  work; #11/#12 have applied forces →
  `E_dissipated = E_total(t₀) + W_applied − (K+U_grav+U_spring)`. → **applied into note 3**
- **Note 19c changes shared `N`.** `N = mg·cosθ − F·sin(angle)` must clamp at `≥ 0` (lift-off) or
  `μN` reverses sign; `N` is read by ~10 shipped concepts — regression EYE required beyond the
  choreography spec's list. → **applied into note 19**
- **Note 17(b)** should emit `console.warn` with a unique prefix and assert zero occurrences in the
  EYE run, or the console audit will not catch a mis-authored state. → **applied into note 17**

## P3 nit (json_author, not blocking)

S4's delta cue "Spring energy joins in" — "joins in" is a phrasal colloquialism under Rule 41;
cycle 1's "Spring energy joins total" is more literal and still ≤5 words. → **applied**

## Routing

Both must-fix items were spec-note TEXT only, with replacement wording supplied verbatim — applied by
the dispatching session rather than spending a third architect cycle, per the reviewer's explicit
direction ("apply the two patches verbatim and proceed to 0c. No re-review needed").

**Nothing went to `peter_parker:field3d_surgeon` before the patches were in the skeleton** — building
note 8b as originally written would have produced a visibly wiggling total in the concept's
three-account showcase state.

## Applied (dispatching session, 2026-08-01)

5 patches into `skeleton.md`: (1) note 8b ripple correction + contact-detected window; (2) note 17(b)
unique console prefix + note 17(c) sandbox-wrap re-entry; (3) note 3 external-work scope clause;
(4) note 19c `N ≥ 0` clamp + wider regression requirement; (5) S4 delta cue → "Spring energy joins
total". **Checkpoint A is CLOSED. The skeleton is the 0c build contract.**
