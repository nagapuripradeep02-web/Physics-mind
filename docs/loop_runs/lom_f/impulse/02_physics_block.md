# `impulse` — Physics Block (Stage 2 of 3: physics-author)

> Input: `docs/loop_runs/lom_f/impulse/01_architect_skeleton.md` (8 states, Rule 31 control table, ORCHESTRATOR RESOLUTIONS applied). Engine contract: `docs/loop_runs/lom_f/_engine/momentum_bench_json_contract.md`. Output for: json-author (writes `src/data/concepts/impulse.json`).

**Engine bug queue consultation:** this dispatch has no DB tool access (Read/Grep/Glob/Bash only — no Supabase MCP grant on this task). Consulted the engine contract's §0 proved-facts table directly (the practical equivalent for this scenario, since the physics facts it documents ARE the prevention rules — e.g. "author to the proved numbers, do not re-derive"). Per the architect's own flag, this defers the live `query_engine_bug_queue.ts impulse --field3d --open` run to quality-auditor's Gate 8 pass — not re-litigated here.

**Two coordinator resolutions applied throughout this document (do not re-litigate):**
1. S7's formula surface is `Δt = π√(m/k)` — settled.
2. S8's `repeat_every_ms` uses the physics-author computed value (~2300–2500 ms), not the contract's illustrative "~1400 ms" figure. Encoded below as **2314 ms** with arithmetic shown (§3).

---

## 0. Rigor check — closed forms recomputed independently

Using `t_c = pi * sqrt(mu/k)`, `F_peak = v_impact * sqrt(k*mu)`, `J = mu * delta_v_rel`, `F_peak * t_c = pi*J/2`, with `mu -> m = 1.0 kg` (fixed wall), `v_impact = 3.0 m/s` (one-way approach speed), `delta_v_rel = 2v = 6.0 m/s` (full rebound swing):

| Quantity | Computed | Skeleton's claim | Verdict |
|---|---|---|---|
| Rigid `t_c = π√(1/2000)` | 0.070248 s = 70.25 ms | 70 ms | matches (rounds identically) |
| Rigid `F_peak = 3.0·√(2000·1)` | 3.0 × 44.7214 = 134.164 N | 134.16 N | matches |
| Padded `t_c = π√(1/200)` | 0.222144 s = 222.14 ms | 222 ms | matches |
| Padded `F_peak = 3.0·√(200·1)` | 3.0 × 14.1421 = 42.4264 N | 42.43 N | matches |
| `Δp = 2mv = 2×1×3` | 6.00 kg·m/s | 6.00 kg·m/s | matches |
| `J = μ·Δv_rel = 1×6.0` | 6.00 N·s | 6.00 N·s | matches |
| Peak ratio `134.1620/42.4264` | 3.16223 (long division confirmed) | 3.16223 ≈ √10 = 3.16228 | matches (the ~0.002% residual is F_peak's 2-decimal rounding, not an error) |
| `F_peak·t_c` (rigid) | 134.164 × 0.070248 = 9.4248 N·s | should equal `πJ/2 = 3π = 9.4248` | exact match |
| `F_peak·t_c` (padded) | 42.4264 × 0.222144 = 9.4248 N·s | same `πJ/2` | exact match |
| First touch, wall at `s=+2.0`: `(2.0−0.3)−(s_ball+0.28) ≤ 0.4` gives `s_ball ≥ 1.02` | 1.02 m | "+1.02 m" | matches; cross-checked against the contract's own worked example (wall at `s=0` gives first touch at `s=−0.98`, same formula, same offset) |

This confirms the invariant algebraically: `F_peak·t_c = v√(km)·π√(m/k) = πvm = π(mv) = πJ/2` when `J=2mv`, independent of `k`. This is not a numerical coincidence; it is the reason the "equal areas, different peaks" beat is physically guaranteed, not merely observed.

**One notational clarification, not an error:** the skeleton's "`F_peak = Δv√(kμ)`" formula and the "`J = μ·Δv_rel`" formula use `Δv` to mean two different quantities — `F_peak`'s `Δv` is the one-way impact speed (`v = 3.0 m/s`, the speed lost during compression to zero at max squeeze), while `J`'s `Δv_rel` is the full rebound swing (`2v = 6.0 m/s`). Both check out numerically above; flagged only so json-author and anyone reading the derivation later doesn't conflate them.

**All numbers verified. No corrections needed to the skeleton's physics.**

---

## 1. `physics_engine_config`

```json
{
  "variables": {
    "m1": { "name": "ball mass", "unit": "kg", "min": 0.5, "max": 10, "step": 0.1, "default": 1.0 },
    "v1": { "name": "ball velocity (signed)", "unit": "m/s", "min": -6, "max": 6, "step": 0.1, "default": 3.0 },
    "k":  { "name": "contact stiffness", "unit": "N/m", "min": 50, "max": 5000, "step": 25, "default": 2000 },
    "c":  { "name": "contact damping", "unit": "N.s/m", "min": 0, "max": 300, "step": 1, "default": 0 }
  },
  "formulas": {
    "p": "m1 * v1",
    "delta_p_magnitude": "2 * m1 * (v1 < 0 ? -v1 : v1)",
    "J": "2 * m1 * (v1 < 0 ? -v1 : v1)",
    "F_peak": "(v1 < 0 ? -v1 : v1) * sqrt(k * m1)",
    "delta_t": "PI * sqrt(m1 / k)",
    "F_avg": "(2 * m1 * (v1 < 0 ? -v1 : v1)) / (PI * sqrt(m1 / k))"
  },
  "computed_outputs": {
    "p_before_N_s": "m1 * v1 (signed, before contact)",
    "p_after_N_s": "-m1 * v1 (signed, after full elastic rebound)",
    "delta_p_N_s": "2 * m1 * |v1|",
    "J_N_s": "equals delta_p_N_s (impulse-momentum theorem)",
    "F_peak_N": "|v1| * sqrt(k * m1)",
    "delta_t_ms": "1000 * PI * sqrt(m1 / k)",
    "F_avg_N": "delta_p_N_s / (delta_t_ms / 1000)"
  },
  "constraints": [
    "J = delta_p always -- the impulse-momentum theorem holds for every contact, rigid or padded",
    "for a full elastic rebound off a fixed wall, |delta_p| = 2*m*|v| exactly (proved to 0.000e+0 by the engine)",
    "F_peak * delta_t = pi*J/2 -- holds independent of contact stiffness k (proved identically on both lanes)",
    "contact duration delta_t = pi*sqrt(m/k) does not depend on impact speed v",
    "total momentum of the ball+wall+Earth system is conserved; the ball alone loses momentum to the wall/Earth during contact (the ball's momentum by itself is NOT conserved through a bounce)",
    "c = 0 on every guided state -- both walls are perfectly elastic (rebounding); only stiffness k, never absorption, is the varied teaching cause"
  ]
}
```

**Flag -- `abs()`/Math-function availability:** the role spec states `PM_interpolate`'s scope auto-injects `sin, cos, atan2, sqrt, PI` -- it does not confirm `abs()`. Formulas above use a ternary (`v1 < 0 ? -v1 : v1`) instead of `Math.abs(v1)` to avoid depending on an unconfirmed injection. At the fixture default (`v1 = +3.0`) this is moot since the sign never flips within `v1` itself (the ENGINE resolves the post-contact sign flip live -- `v1` is only ever the pre-contact input magnitude/direction). json-author: verify the ternary evaluates correctly under `PM_interpolate`, or confirm `abs()` is available and simplify.

**`m2`/`v2` are not declared** -- `wall_impact`, `single_body`, and `sandbox` (this concept's only modes) have exactly one movable body; `m2`/`v2` do not apply here and must not appear in any state's `controls_visible` (confirms architect's flag 6).

---

## 2. Per-state `variable_overrides` notes

Rule 25d (teacher may reorder states at runtime) means every state must be self-contained regardless of visit order -- so every guided state defensively locks every variable it does not teach (the `hinge_force`/`field_forces` pattern).

| State | `variable_overrides` | Justification |
|---|---|---|
| S1 | `{ m1: 1.0, v1: 3.0 }` | No contact variables relevant (no `k`/`c` in play), but m1/v1 locked so a prior sandbox visit (via reorder) can't leak a custom mass/speed into the momentum-definition beat |
| S2 | `{ m1: 1.0, v1: 3.0, k: 2000, c: 0 }` | The NCERT beat needs the exact proved fixture (F_peak 134.16 N, Delta t 70 ms, J 6.00 N.s) -- no live slider on this state |
| S3 | `{ m1: 1.0, v1: 3.0, k: 2000, c: 0 }` | Same fixture; S3 narrates the exact 134.16 N / 70 ms numbers |
| S4 | `{ m1: 1.0, k: 2000, c: 0 }` -- **`v1` NOT overridden**, it is the ramp target (`param_ramp` from 1.5 to 3.0) | `v1` is the taught/live variable here; everything else locked so the area-tracks-Delta-p beat isn't confounded by a leaked k or mass |
| S5 | `{ m1: 1.0, v1: 3.0 }` on both lanes; base lane `k: 2000, c: 0`; lane 2 via `contact_override: { stiffness_N_per_m: 200, damping_Ns_per_m: 0, label: "padded wall" }` | The lane-2 override is a contact-level key (contract §4), not a global `variable_overrides` entry -- documented here for completeness since it plays the same defensive role: it must not be draggable away by a stray `k` slider write (contract §7 -- "the other lane's override is the authored contrast and must not be dragged away underneath it") |
| S6 | `{ m1: 1.0, v1: 3.0, c: 0 }` -- **`k` NOT overridden**, it is the ramp target (2000 to 200) | `k` is taught/live here |
| S7 | `{ m1: 1.0, k: 2000, c: 0 }` -- **`v1` NOT overridden**, ramp target (1.5 to 6.0) | `v1` is taught/live; `k` locked rigid so `Delta t` stays pinned as the state requires |
| S8 | none -- `m1: 1.0, v1: 3.0, k: 2000, c: 0` are the *initial* (not locked) values, all four live | Sandbox: every variable is teacher-controlled from the fixture defaults |

---

## 3. Per-state motion timeline (Rule 31) -- apparatus arithmetic shown

**Apparatus constants used** (contract §1): ball radius 0.28 m, wall half-extent 0.3 m, `natural_length_m` 0.4 m, wall centre `s = +2.0 m`.

**First-touch position** (contract's contact-begin rule `s_hi - half_hi - (s_lo + half_lo) <= natural_length_m`, wall = hi side, ball = lo side):
`(2.0 - 0.3) - (s_ball + 0.28) <= 0.4` gives `1.7 - s_ball - 0.28 <= 0.4` gives `s_ball >= 1.02`. **First touch at ball centre `s = 1.02 m`** for every single-wall state (S1-S4, S6-S8; S5 has two lanes at the same `s`, offset only in `z`).

**Two reference approach lengths** (both computed, per the architect's "long-approach vs repeat-cycle" guidance):
- Long approach: `s = -3.0 to 1.02`, distance = **4.02 m**
- Short (repeat-cycle) approach: `s = -1.6 to 1.02`, distance = **2.62 m**
- Sandbox-idle approach (S8, new -- see below): `s = -1.4 to 1.02`, distance = **2.42 m**

At constant pre/post-contact velocity (no forces act outside contact), `time = distance / speed`.

### S1 -- `single_body`, no contact

No wall body exists in this mode; the ball glides past where the wall will later sit (`s = +2.0`, unrendered in this state). Track chosen symmetric with the wall-state start convention: `s = -3.0 to +3.0`, distance **6.0 m**.
- `t = 6.0 / 3.0 = 2.000 s = 2000 ms`.
- **`repeat_every_ms = 2000`.** Ball translates the full window; `p` readout reads a constant `+3.00 kg.m/s` throughout (no sign change in S1 -- that is S2's beat). On loop, ball resets to `s = -3.0`.

### S2 -- `wall_impact`, rigid (`k=2000`), long approach, first NCERT beat

- Approach `0-1340 ms`: `s: -3.0 to 1.02`, `t = 4.02/3.0 = 1.340 s`, real time.
- Slowed contact `1340-2740 ms`: real `t_c = 70 ms` times `slow_factor 20` (per skeleton 3b) = **1400 ms** on-screen; HUD reports the true `70 ms` throughout, badge shows `x20`.
- Depart `2740-4080 ms`: `s: 1.02 to -3.0` at `|v|=3.0 m/s` (elastic, same speed out), `t = 1.340 s`, real time.
- **Cycle length = 1340 + 1400 + 1340 = 4080 ms.** `repeat_every_ms = 4080` -- *added by physics-author, not in the architect's 3b sketch* (see §8 flags): the 40-55-word narration needs approximately 16-22 s of screen time and a single 4.08 s bounce would leave the scene motionless while narration is still speaking, which reads as a static state. Looping the full dramatic long approach every cycle keeps it appropriate for this beat's importance (about 4-5 repeats fill the narration window).

### S3 -- `wall_impact`, rigid, short approach (zoom-to-contact framing)

- Approach `0-873 ms`: `s: -1.6 to 1.02`, `t = 2.62/3.0 = 0.8733 s = 873 ms`.
- Slowed contact `873-2273 ms`: `70 ms x 20 = 1400 ms`; contact element visibly compresses by `delta`, equal-opposite force arrows on ball and wall.
- Depart `2273-3146 ms`: `873 ms` symmetric.
- **Cycle length = 873 + 1400 + 873 = 3146 ms.** `repeat_every_ms = 3146` -- *added by physics-author* (same narration-coverage reasoning; 35-50 words is about 14-20 s, about 4-6 loops).

### S4 -- `wall_impact`, rigid, `param_ramp v1: 1.5 -> 3.0`, short approach

Contact duration is fixed (`k` doesn't ramp here): `70 ms x 20 = 1400 ms` on every bounce (this is itself a quiet preview of S7's point, not stated aloud -- the ramp target is `v1`, not `Delta t`).
- Approach/depart time depends on the current `v1`: `t = 2.62 / v1`.
  - Slowest bounce (`v1 = 1.5`, ramp start): `t = 2.62/1.5 = 1.747 s = 1747 ms` each way, cycle `1747+1400+1747 = 4894 ms`.
  - Fastest bounce (`v1 = 3.0`, ramp end): `t = 2.62/3.0 = 873 ms` each way, cycle `873+1400+873 = 3146 ms`.
- **`repeat_every_ms = 4894`** (sized to the worst case -- slowest bounce -- so no bounce's depart segment is ever truncated by the next re-arm; later, faster bounces finish early and hold briefly before the next re-arm, which is an acceptable, honest trade-off given the contract has no documented per-bounce dynamic re-arm key). The force-trace's shaded area label grows bounce-to-bounce in lockstep with the growing `Delta p` readout as `v1` rises.

### S5 -- `wall_impact`, two lanes, long approach, PRIMARY aha

Both lanes launch together (`offset_z_m: +/-1.3`), same `m1=1.0`, `v1=3.0`, same `s` start/first-touch (`-3.0 to 1.02`), so both arrive in contact simultaneously.
- Approach `0-1340 ms`: both balls, `1340 ms` (as S2's long approach).
- Slowed contact: **rigid lane** `70 ms x 10 = 700 ms` (finishes at `1340+700=2040 ms`); **padded lane** `222 ms x 10 = 2220 ms` (finishes at `1340+2220=3560 ms`) -- slow_factor is 10 here, not 20, per skeleton's explicit resolution (a 4.4 s dwell at x20 on the soft lane would kill the beat).
- Depart: rigid ball departs at real time from `2040 ms`, reaching `s=-3.0` by `2040+1340=3380 ms` and then holds (off-screen/done) until the shared reset. Padded ball departs from `3560 ms`, reaching `s=-3.0` by `3560+1340=4900 ms`.
- **Cycle length = 4900 ms** (governed by the slower/padded lane's full round trip). `repeat_every_ms = 4900` -- *added by physics-author*; 45-55 words is about 18-22 s, about 4-5 loops, letting the "equal areas, different peaks" picture sink in via repetition (appropriate for the PRIMARY aha).
- The trace panel accumulates: tall-narrow curve (rigid) finishes drawing at `2040 ms`; low-wide curve (padded) finishes at `3560 ms`; both shaded areas sit on one shared axis (`compare_with_previous_lane: true`) for direct visual comparison -- this is the entire teaching payload of the state.

### S6 -- `wall_impact`, `param_ramp k: 2000 -> 200`, short approach

Approach/depart fixed (`v1=3.0` constant): `873 ms` each way. Contact duration ramps with `k`: `t_c = pi*sqrt(1/k)`.
- Stiffest bounce (`k=2000`, ramp start): `t_c = 70 ms x 10 = 700 ms` slowed, cycle `873+700+873 = 2446 ms`.
- Softest bounce (`k=200`, ramp end): `t_c = 222 ms x 10 = 2220 ms` slowed, cycle `873+2220+873 = 3966 ms`.
- **`repeat_every_ms = 3966`** (worst-case/softest bounce). Each successive trace is visibly lower and wider; the deformation depth `delta` on the contact element visibly increases bounce to bounce (S3's deformation callback); area label holds at `6.00 N.s` throughout.

### S7 -- `wall_impact`, `param_ramp v1: 1.5 -> 6.0`, rigid contact, short approach

Contact fixed at `70 ms x 20 = 1400 ms` on every bounce -- this IS the demonstrated invariance.
- Slowest bounce (`v1=1.5`): approach/depart `2.62/1.5 = 1747 ms` each way, cycle `1747+1400+1747 = 4894 ms`.
- Fastest bounce (`v1=6.0`): approach/depart `2.62/6.0 = 437 ms` each way, cycle `437+1400+437 = 2274 ms`.
- **`repeat_every_ms = 4894`** (worst case). Trace width is visibly identical bounce to bounce while trace height grows -- the direct visual proof of `Delta t` invariance. Formula surface: `Delta t = pi*sqrt(m/k)` (settled per coordinator).

### S8 -- `sandbox`, all controls live -- `repeat_every_ms` RESOLVED to a computed value

The contract's "~1400 ms" was illustrative, not a constraint (coordinator confirmed). Computed from the fixture defaults (`m1=1, v1=3, k=2000, c=0`, `slow_factor 10` per skeleton 3b) using a shortened sandbox-idle approach `s = -1.4 to 1.02` (distance 2.42 m, chosen so the idle demo cycle is snappy but the approach is still visibly present, per Rule 32a):
- Approach `t = 2.42/3.0 = 0.8067 s = 807 ms`.
- Slowed contact: `70 ms x 10 = 700 ms`.
- Depart: `807 ms` (symmetric).
- **Cycle length = 807 + 700 + 807 = 2314 ms.** `repeat_every_ms = 2314` -- this is the bench's idle re-arm cadence before a trusted drag seizes it (Rule 37); once seized, all four sliders (`m1, v1, k, c`) drive the live geometry directly and the idle loop no longer applies.

---

## 4. Per-state control spec (confirmed against skeleton §3a -- no deviation)

| State | Live controls | Range used |
|---|---|---|
| S1 | none | -- |
| S2 | none | -- |
| S3 | none | -- |
| S4 | `v1` | ramp 1.5 to 3.0 m/s (within -6..6, step 0.1 -- both values valid steps) |
| S5 | none (the contrast is authored; a live `k` would drag the base lane's contrast away -- contract §7) | -- |
| S6 | `k` | ramp 2000 to 200 N/m (within 50-5000, step 25 -- 2000/25=80, 200/25=8, both valid) |
| S7 | `v1` | ramp 1.5 to 6.0 m/s (6.0 is the slider's max; valid) |
| S8 | `m1`, `v1`, `k`, `c` (all meaningful ones -- `m2`/`v2` excluded, no second movable body in `wall_impact`) | full slider ranges |

---

## 5. Narration (`text_en`) per state -- 25-55 EN words, Rule 41 plain language

**S1** (34 words) -- `depth_ring: core`
> "Momentum p equals mass times velocity: p = mv, and it has a direction. This ball, mass 1 kilogram, moves at 3 metres per second, so its momentum reads +3.00 kilogram metres per second."

**S2** (55 words) -- `depth_ring: core` -- carries M1 contrast beat
> "Watch the speed: 3.0 metres per second before contact, 3.0 metres per second after -- unchanged. But momentum has direction. The momentum reads +3.00 kilogram metres per second on approach and -3.00 after rebound: a swing of 6.00 kilogram metres per second, twice mv, because the sign reverses. The impulse J also reads 6.00 newton-seconds."

**S3** (50 words) -- `depth_ring: core`
> "Zoom in on the contact. The ball pushes into a squeeze as it touches the wall, and the wall pushes back exactly as hard -- Newton's third law. The contact force climbs to a peak of 134.16 newtons in just 70 milliseconds, the true contact time, shown slowed for clarity."

**S4** (55 words) -- `depth_ring: core`
> "The shaded area under this force-time curve equals the impulse, which equals the momentum change: from F = ma, force times time equals mass times the velocity change. As the impact speed ramps from 1.5 to 3.0 metres per second, each new area grows to match the larger momentum change -- same law, every time."

**S5** (55 words) -- `depth_ring: core` -- carries M2 contrast beat + knees anchor. Checked against Rule 38a: does not reference any later state.
> "Two walls, same ball, same speed -- stiffness differs about ten times. Both momentum changes read 6.00 kilogram metres per second; both shaded areas are equal. Only the peaks differ: 134.16 newtons rigid, 42.43 newtons padded. Bending your knees when you land spreads the same momentum change over more time, for a smaller peak force."

**S6** (49 words) -- `depth_ring: extended`
> "As the wall's stiffness ramps down from 2000 to 200 newtons per metre, the peak force falls and the contact stretches longer -- the deformation deepens each bounce. The shaded area stays fixed at 6.00 newton-seconds, the same idea behind an airbag: spread the momentum change over more time."

**S7** (46 words) -- `depth_ring: advanced`
> "Now the speed ramps up, from 1.5 to 6.0 metres per second, on the same rigid wall. The peak force grows with every bounce, but the trace width stays identical: the contact time stays pinned at 70 milliseconds. It does not depend on speed at all."

**S8** -- `depth_ring: core` (Rule 38b) -- 0 words / open, no scripted narration (explore/sandbox; teacher-driven). Checked against Rule 38a: no reference to k-ramping or Delta t anywhere in this state's chrome.

---

## 6. Physical constraints (conservation first)

1. `J = Delta p` always -- the impulse-momentum theorem holds for every contact, rigid or padded.
2. For a full elastic rebound off a fixed wall, `|Delta p| = 2*m*|v|` exactly (proved to 0.000e+0 by the engine).
3. `F_peak * Delta t = pi*J/2` -- holds independent of contact stiffness `k` (proved identically on both lanes; derived algebraically in §0).
4. Contact duration `Delta t = pi*sqrt(m/k)` does not depend on impact speed `v` (S7's teaching point).
5. Total momentum of the ball+wall+Earth system is conserved; the ball alone loses momentum to the wall/Earth during contact -- the ball's own momentum is NOT conserved through a bounce.
6. `c = 0` on every guided state (S1-S7) -- both walls are perfectly elastic (rebounding); only stiffness `k`, never absorption, is the varied teaching cause. `c` becomes live only in the S8 sandbox.

---

## 7. Drill-down cluster phrasings (5 per cluster, real student voice, plain English)

**`rebound_sign_reversal`** (S2)
- "why is momentum change 2mv not mv"
- "why does bouncing back double the momentum change"
- "doesnt the ball just keep the same momentum since speed is same"
- "why do we add the momentum instead of subtract"
- "is momentum change always 2mv on a bounce"

**`momentum_change_vs_speed_change`** (S2)
- "speed is same before and after so why did momentum change"
- "if speed doesnt change how can momentum change"
- "why does direction matter for momentum"
- "the ball has the same speed so shouldnt p be the same"
- "why is momentum negative after the bounce"

**`impulse_direction`** (S2)
- "which way does the impulse point on a rebound"
- "is impulse in the direction the ball leaves or arrives"
- "why is impulse opposite to the incoming velocity"
- "does impulse point toward the wall or away from it"
- "how do i know the sign of the impulse"

**`area_under_curve_meaning`** (S4)
- "why does the area under the force time graph equal impulse"
- "what does the shaded region on the F-t graph mean"
- "why cant i just multiply peak force by time"
- "is area under the curve always equal to momentum change"
- "why is impulse an area and not a single number"

**`average_force_from_graph`** (S4)
- "how do i find average force from a force time graph"
- "is average force the same as peak force"
- "why is average force less than the peak"
- "how do i turn the graph area into a force value"
- "whats the difference between average force and peak force"

**`impulse_units`** (S4)
- "why is impulse measured in newton seconds"
- "are newton seconds the same as kilogram metres per second"
- "why does impulse have two different unit names"
- "is N s the same unit as momentum"
- "why do impulse and momentum share units"

**`stiffness_vs_impulse`** (S5)
- "does a stiffer wall change the impulse"
- "why is the impulse the same for both walls"
- "if the wall is harder shouldnt the impulse be bigger"
- "does stiffness change how much momentum is transferred"
- "why doesnt spring stiffness affect the area under the graph"

**`peak_force_vs_average_force`** (S5)
- "which one actually causes damage, peak force or average force"
- "why does the rigid wall have a higher peak but same impulse"
- "is peak force the same thing as impulse"
- "why does a bigger peak not mean a bigger momentum change"
- "whats worse for injury, peak force or average force"

**`time_spreading_safety`** (S5)
- "why does bending your knees reduce the force when landing"
- "how does an airbag lower the force in a crash"
- "if the momentum change is fixed how does padding help"
- "why does spreading out the time lower the force"
- "does padding change how much momentum is absorbed"

---

## 8. Flags for json-author / orchestrator

1. **RESOLVED by coordinator -- S8's `repeat_every_ms`.** The contract's "~1400 ms" was illustrative, not an engine constraint. Encoded as the computed **2314 ms** (§3), using a shortened sandbox-idle approach `s = -1.4 m` (distance 2.42 m) so the idle demo cycle stays snappy while keeping a visible causal approach (Rule 32a). This replaces the architect's illustrative figure; no further action needed.
2. **`repeat_every_ms` added to S2, S3, S5** beyond the architect's literal 3b sketch (which only listed it for S1/S4/S6/S7/S8). Rationale: Rule 31's "motion window may run longer than the narration, never the reverse" -- each of these states' 40-55-word narration runs about 16-22 s, while a single bounce cycle is only 3.1-4.9 s; without looping, the scene would sit motionless (readouts static) for most of the narration, which reads as a static state. Looping the same choreography (full long approach on S2/S5, short approach on S3) fills the dwell honestly with no new physics content per repeat -- just reinforcement. Flag for the orchestrator: if this deviates from an intended design where narrated states are meant to finish their motion early and simply hold their final frame, please say so explicitly; the position taken here is that "no static state" (Rule 31) outweighs "hold on last frame" in this case, since Rule 26's "hold" language is about narration *ending*, not motion ending early mid-narration.
3. **`abs()` availability in `PM_interpolate`** -- flagged in §1; a ternary was used as a safe fallback (`v1 < 0 ? -v1 : v1`) instead of `Math.abs(v1)`.
4. **SETTLED -- Delta t supersedes `t_c` everywhere**, per the orchestrator's resolution of architect flag 4 and the coordinator's confirmation -- applied throughout this document (S7's formula is `Delta t = pi*sqrt(m/k)`; the symbol table below uses `Delta t`, never `t_c`).
5. Architect's flags 1, 2, 3, 5, 6 (as resolved by the architect/orchestrator) are treated as settled and not re-examined here, per the orchestrator's instruction.

**Symbol-label table correction (supersedes skeleton §10b row "Contact duration"):**

| Quantity | On-canvas label | Where |
|---|---|---|
| Contact duration | `Delta t` | S7 formula surface + HUD true-ms value |

---

## 9. `assessment` + `coverage_map`

```json
{
  "assessment": [
    {
      "id": "impulse_q1",
      "text_en": "A ball of mass 0.5 kg moving at 4 m/s hits a rigid wall and rebounds at the same speed. What is the magnitude of its momentum change?",
      "options": [
        { "text": "2.0 kg.m/s", "correct": false, "distractor_misconception": "used mv instead of 2mv -- forgot momentum is signed, so a same-speed rebound looks like no net change beyond mv" },
        { "text": "4.0 kg.m/s", "correct": true },
        { "text": "0 kg.m/s", "correct": false, "distractor_misconception": "assumed unchanged speed means unchanged momentum, ignoring that direction reversed" },
        { "text": "8.0 kg.m/s", "correct": false, "distractor_misconception": "arithmetic slip doubling the mass in the 2mv formula" }
      ],
      "coverage": "STATE_2"
    },
    {
      "id": "impulse_q2",
      "text_en": "A force-time graph for an impact shows a triangular pulse peaking at 100 N over a total contact time of 20 ms. What is the impulse?",
      "options": [
        { "text": "1.0 N.s", "correct": true },
        { "text": "2.0 N.s", "correct": false, "distractor_misconception": "treated the triangular pulse as a rectangle, forgetting the half factor for a triangle's area" },
        { "text": "100 N.s", "correct": false, "distractor_misconception": "multiplied peak force by the contact time in milliseconds instead of seconds" },
        { "text": "0.5 N.s", "correct": false, "distractor_misconception": "halved the correct triangle area a second time by mistake" }
      ],
      "coverage": "STATE_4"
    },
    {
      "id": "impulse_q3",
      "text_en": "A ball's momentum changes by 6.0 kg.m/s during a contact that lasts 30 ms. What is the average force on the ball?",
      "options": [
        { "text": "200 N", "correct": true },
        { "text": "0.2 N", "correct": false, "distractor_misconception": "forgot to convert milliseconds to seconds before dividing" },
        { "text": "0.18 N.s", "correct": false, "distractor_misconception": "multiplied momentum change by contact time instead of dividing, and confused the unit with impulse" },
        { "text": "6.0 N", "correct": false, "distractor_misconception": "read off the momentum change value directly as if it were the force" }
      ],
      "coverage": "STATE_5"
    },
    {
      "id": "impulse_q4",
      "text_en": "Two balls with the same mass hit two different walls at the same speed and both rebound. One wall is rigid, one is padded. Which statement is correct?",
      "options": [
        { "text": "Both momentum changes are equal; only the peak force and contact duration differ.", "correct": true },
        { "text": "The padded wall produces a smaller momentum change because it feels gentler.", "correct": false, "distractor_misconception": "M2 -- softer is read as less happened, conflating peak force with total momentum change" },
        { "text": "The rigid wall produces a larger momentum change because it hits harder.", "correct": false, "distractor_misconception": "confuses a large peak force with a large total momentum change" },
        { "text": "Neither wall changes the ball's momentum since both rebounds return the ball to its starting speed.", "correct": false, "distractor_misconception": "confuses unchanged speed with unchanged momentum, ignoring the sign reversal (M1 bleeding into this context)" }
      ],
      "coverage": "STATE_5"
    },
    {
      "id": "impulse_q5",
      "text_en": "A ball bounces off the same spring-loaded wall at two different speeds, 2 m/s and 5 m/s. How does the contact time compare?",
      "options": [
        { "text": "The contact time is the same at both speeds -- it depends only on the ball's mass and the wall's stiffness.", "correct": true },
        { "text": "The contact time is shorter at 5 m/s because the ball hits harder and bounces off faster.", "correct": false, "distractor_misconception": "assumes a harder impact must finish faster, confusing impact speed with contact duration" },
        { "text": "The contact time is longer at 5 m/s because there is more momentum to reverse.", "correct": false, "distractor_misconception": "assumes contact duration scales with the momentum change, when Delta t is set by m and k alone" }
      ],
      "coverage": "STATE_7"
    },
    {
      "id": "impulse_q6",
      "text_en": "Impulse is measured in newton-seconds (N.s). Which of these is an equivalent unit?",
      "options": [
        { "text": "kilogram metres per second (kg.m/s)", "correct": true },
        { "text": "newtons per second (N/s)", "correct": false, "distractor_misconception": "divided instead of matching the dimensional equivalence force times time" },
        { "text": "joules (J)", "correct": false, "distractor_misconception": "confuses impulse (a momentum-like quantity) with energy" },
        { "text": "watts (W)", "correct": false, "distractor_misconception": "confuses impulse with power" }
      ],
      "coverage": "STATE_4"
    }
  ],
  "coverage_map": {
    "STATE_2": ["impulse_q1"],
    "STATE_4": ["impulse_q2", "impulse_q6"],
    "STATE_5": ["impulse_q3", "impulse_q4"],
    "STATE_7": ["impulse_q5"]
  }
}
```

Note: skeleton DoD (f) names 5 target areas; 6 items were authored (added `impulse_q6`, units) to match the general "6 quiz questions ship with the JSON" convention while still fully covering all 5 named areas (`impulse_q1` -> 2mv numeric, `impulse_q2` -> area read-off, `impulse_q3` -> F-bar=Delta p/Delta t numeric, `impulse_q4` -> equal-areas conceptual, `impulse_q5` -> Delta t-invariance advanced). If json-author's schema wants exactly 5, drop `impulse_q6` -- it is additive, not load-bearing.

---

## 10. `misconception_watch` -- final wording (S2 and S5 ONLY)

```json
{
  "STATE_2": {
    "belief": "The ball leaves at the same speed it arrived, so the momentum change is small -- maybe close to zero, or at most mv.",
    "visual_counter": "The speed readout shows 3.0 m/s before contact and 3.0 m/s after -- but the momentum readout runs from +3.00 to -3.00 kg.m/s, a swing of 6.00 kg.m/s, because momentum has a direction.",
    "one_line_fix": "Momentum has a direction; the sign reversal on rebound doubles the momentum change to 2mv, not mv."
  },
  "STATE_5": {
    "belief": "The padded wall is softer, so it must produce a smaller momentum change than the rigid wall.",
    "visual_counter": "Both balls leave at the same 3.0 m/s, both momentum-change readouts read 6.00 kg.m/s, and both shaded areas under the force-time trace are equal. Only the peak force differs: 134.16 N on the rigid wall against 42.43 N on the padded wall.",
    "one_line_fix": "A softer contact lowers the peak force and stretches the contact time -- the momentum change stays the same."
  }
}
```

No other state carries `misconception_watch` (founder guardrail confirmed, matches skeleton §4).

---

## Self-review checklist

- [x] Every symbol in the state narratives (`p`, `Delta p`, `J`, `F`, `k`, `Delta t`, `F-bar`) appears in `variables`/`formulas`/`computed_outputs`.
- [x] Every angle argument -- N/A, no angles in this 1-D concept.
- [x] Every state's live control(s) declared per skeleton's table, each within renderer-fixed ranges with `default`/`min`/`max`/`step`.
- [x] `variable_overrides` documented for every state with one-line justification (§2).
- [x] Board mode: DEFERRED, correctly skipped (Rule 20).
- [x] Drill-down phrasings: 45 phrases (5x9 clusters), plain student voice, no textbook register.
- [x] `constraints`: 6 short assertions, conservation-first (§6).
- [x] Numerical sanity check: `m1=1, v1=3` gives `Delta p = 2x1x3 = 6.00 kg.m/s`, `F_peak(k=2000) = 3x sqrt(2000) = 134.16 N`, `Delta t(k=2000) = pi*sqrt(1/2000) = 70 ms` -- all match §0's independent rigor check.
- [x] Within-state motion timeline for every state (§3), every window computed from apparatus constants + speed, never guessed; repeat cycles sized to worst-case ramp bounce where speed/stiffness varies.
- [x] Rule 32 sequencing: cause (ball arriving) precedes effect (arrows/trace/readout response) in every timeline by the full approach window (>=873 ms); only the taught variable moves per guided state (S4 only `v1` moves via ramp; S6 only `k`; all else locked via §2 overrides).
- [x] Word budget (Rule 31a): every guided state's narration counted -- S1 34, S2 55, S3 50, S4 55, S5 55, S6 49, S7 46 -- all within their skeleton ranges (25-55 EN words); S8 = 0/open, correct for explore.
- [x] Notation ladder (Rule 38c): S1-S6, S8 formula surfaces are algebra-only (`p=mv`, `Delta p=p'-p`, `F=kx`, `F-bar*Delta t=Delta p`, `F-bar=Delta p/Delta t`); only S7 (advanced ring) carries `Delta t=pi*sqrt(m/k)`, no calculus/vector operators anywhere. Dialect (38d): no board-divergent terms in this concept (momentum/impulse/force are universal across CBSE/JEE/AP/IB/A-level) -- no dual-label needed.
- [x] Engine bug queue consulted via the contract's §0 proved-facts table (no DB tool access on this dispatch); live query deferred to quality-auditor's Gate 8, per architect's own flag.
- [x] DC Pandey check: no formula, explanation, derivation sequence, or example problem imported from any textbook. All narration, timelines, assessment items, and drill-down phrases authored from first principles against the engine's proved numbers (§0) and the founder brief's mandated beats. The JEE-backwards-trace question in the skeleton (Block 1) is architect-authored, not sourced from DC Pandey/HC Verma.

---

## Handoff to json-author

This document plus `docs/loop_runs/lom_f/impulse/01_architect_skeleton.md` are the complete input. Highlights json-author must carry forward exactly:

1. **Apply the Delta t correction** -- S7's formula surface is `Delta t = pi*sqrt(m/k)`, never `t_c`, and the symbol table's `t_c` row is `Delta t`. SETTLED.
2. **`repeat_every_ms` values to encode:** S1 2000 -- S2 4080 -- S3 3146 -- S4 4894 -- S5 4900 -- S6 3966 -- S7 4894 -- S8 2314 (RESOLVED per coordinator, computed value, see §3/§8).
3. **S2, S3, S5 now carry `repeat_every_ms`** in addition to the architect's 3b sketch -- §8 item 2 explains why; flag to quality-auditor if this reads as scope creep beyond the skeleton.
4. **All six `variable_overrides` sets (§2)** are defensive locks required for Rule 25d reorder-safety -- author them verbatim, don't drop the "obviously redundant" ones (e.g. locking `k=2000` on S1 even though S1 has no contact).
5. **`abs()` fallback ternary** in `formulas` (§1) -- verify `PM_interpolate` handles it, or confirm `Math.abs`/`abs` is injected and simplify.
6. Narration strings in §5 are final `text_en` -- use verbatim (word counts already verified against Rule 31a).
7. `assessment`/`coverage_map` (§9) and `misconception_watch` (§10) are final JSON, ready to paste in with only ID/schema-field-name adjustments as needed for `conceptJson.ts`.
8. Drill-down `trigger_examples` (§7) are final, ready for the Supabase seed.

**Files referenced (absolute paths):**
- `C:\Tutor\physics-mind-lom-f\docs\loop_runs\lom_f\impulse\01_architect_skeleton.md`
- `C:\Tutor\physics-mind-lom-f\docs\loop_runs\lom_f\impulse\00_BRIEF.md`
- `C:\Tutor\physics-mind-lom-f\docs\loop_runs\lom_f\_engine\momentum_bench_json_contract.md`
