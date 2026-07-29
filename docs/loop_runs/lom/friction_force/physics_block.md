# PHYSICS BLOCK — `friction_force` (Laws of Motion / Friction core, Class 11)

> Author: physics_author. Input: `docs/loop_runs/lom/friction_force/skeleton.md` (architect, 6 states,
> ENGINE GAP: none) + `docs/NEWTONS_LAWS_BODY_ENGINE_SPEC.md` §1/§2 (`newtons_laws_body`, Branch A —
> independent uncoupled bodies, `theta_deg = 0` throughout, `g = 9.8`, `STOP_EPS_V = 0.01`) + direct
> reads of the live implementation (`field_3d_renderer.ts` `NLB_SLIDER_SPEC` ~L39164,
> `nlbRunIdleSweep`/`NLB_SWEEP_MS` ~L39485, `nlbRunParamRamp` ~L39527, bound-arrest latch
> `_boundArrestedSliding` ~L40052–40100).
> HARD CONSTRAINT honored: every value below is expressible in the spec's config surface. **ENGINE
> GAP: none** (confirms the architect's own finding).

## Engine bug queue consultation (pre-authoring)

DB not reachable from this authoring context (no shell against Supabase from this thread). Consulted
the committed scar surface the architect already applied (§"Engine bug queue consultation" in the
skeleton — all 12 `nlb` seam rows) plus both sibling physics blocks (`block_on_incline`,
`newton_first_law`) for the cross-cutting `alex:physics_author`/`alex:json_author` variable-bug class.
Compliance:

- **`default_variables_only_first_var_merged` (Bug #1 class):** every state's `bodies[]` block below is
  a COMPLETE, self-contained numeric object (`mass_kg`, `initial_position_m`, `initial_velocity_mps`,
  `mu_s`, `mu_k`, `applied_force_N` all explicit, every state) — nothing relies on a prior state's
  leaked value.
- **Motion-bound / clamp scar:** every placement below is computed against `surface.length_m = 6`
  with an explicit numeric margin, independently re-verified by direct semi-implicit-Euler simulation
  (below), not just algebra.
- **`idle_auto_sweep.range[0]` contract:** re-verified for S6 (see the FLAG below — this is where the
  consultation surfaced a real finding, not a rubber-stamp).
- **`param_ramp` contract:** S2/S3's own `applied_force_N` = the ramp's `from` in both cases (16 N) —
  no entry jump.
- **HUD zero-stub scar:** S1's `f = 0.00` and S2/S3(pre-break)'s `F_net = 0.00` are the TAUGHT values,
  not stubs.
- **Bound-arrest readout latch (`_boundArrestedSliding`):** S3's halt, S4 body B's halt, and S5's both
  halts all end the state with a body pinned at `±6 m` — confirmed the engine's own comment (L40052–68)
  that a bound-halted *sliding* body must NOT be reclassified "stuck" (kinetic friction stays reported,
  never silently flips to static) — this matters for every halted readout in §3 below.

**FLAG to quality_auditor / peter_parker (new finding, this concept):** the architect's S6
`idle_auto_sweep {param:'F', range:[16, 27]}` does **not** produce the "live stick-slip until seized"
behaviour the skeleton describes. I ran the engine's exact semi-implicit-Euler integrator
(`m=5, mu_s=0.5, mu_k=0.4, N=49.0N, theta=0`) against both the architect's range and a corrected range.
Full evidence and fix in **§9** below — this is a physics-of-the-idle-demo correction, not a renderer
bug, so I am fixing it here rather than routing it back to the architect.

**DC Pandey check:** consulted the Laws of Motion table of contents for scope only (friction as its
own sub-block, horizontal context before incline, per skeleton §9). No formula, worked example,
teaching sequence, or figure imported. Every number below is derived directly from `ΣF = ma` per body
plus the engine's own Branch A pseudocode (`NEWTONS_LAWS_BODY_ENGINE_SPEC.md` §2), independently
re-verified by direct calculation AND by running the engine's actual discrete-time integrator in
Python (dt = 1/60 s, matching `field_3d_renderer.ts`'s fixed step) rather than trusting the skeleton's
closed-form/estimated numbers.

---

## 1. `physics_engine_config`

### 1a. Variables

| symbol | name | unit | min | max | step | default | maps to |
|---|---|---|---|---|---|---|---|
| `m` | mass of body A (and B in S4/S5) | kg | 0.5 | 10 | 0.5 | **5** | `mass_a`, `#nlb_m_slider` — S1 and S6 only; the slider row syncs to whatever the state's own `bodies[].mass_kg` is on entry (`nlbSliderValueFromEngine`, L39729), so authoring `mass_kg: 5` on every body is sufficient — **no `slider_controls.m.default` override is needed** even though the engine's raw `NLB_SLIDER_SPEC.m.def` is 2 |
| `F` | applied force (the push) | N | −20 | 20 | 0.5 | **0** (S1) / 16 (S2/S3) / 22 (S4) / 19.6 (S5) / 13 (S6, corrected — see §9) | `applied_force`, `#nlb_f_slider` — engine-fixed range; per-state `applied_force_N` sets the actual seed each state |
| `mu_s` (μₛ) | coefficient of static friction | — | 0 | 1 | 0.05 | **0.5** | `mu_s`, `#nlb_mus_slider` — S3's own live control |
| `mu_k` (μₖ) | coefficient of kinetic friction | — | 0 | 1 | 0.05 | **0.4** | `mu_k`, `#nlb_muk_slider` — S4/S5's own live control |
| `v0` | initial velocity | m/s | −5 | 5 | 0.5 | 0 | `initial_velocity_mps` — S6 sandbox only; S4 (B = 0.4) and S5 (A = 1.0, B = 2.5) seed velocity via each body's own field, never the live slider |
| `g` | gravitational acceleration | m/s² | — | — | — | **9.8 (engine constant)** | hardcoded in `updateNewtonsLawsBodyFrame` |
| `theta` (θ) | incline angle | ° | — | — | — | **0 (constant, never authored as a control)** | flat concept — `block_on_incline` owns the incline arc; θ excluded from `controls_visible` even in S6 per skeleton §4/§9 |
| `N` | normal force | N | — | — | — | derived: `m * g * cos(radians(theta))` | HUD readout |
| `w` | weight | N | — | — | — | derived: `m * g` | not a HUD readout in this concept (only `N`, `f`, `a`, `v`, `F_net` are listed in the architect's `readouts` columns) — carried only as an internal check value |

**Key structural fact used throughout §3:** because `theta = 0` is never varied anywhere in this
concept (unlike sibling `block_on_incline`), **`N = m·g·cos(0) = m·g` is CONSTANT at 49.0 N in every
guided state** (m = 5 kg fixed except via the S1/S6 slider). The whole six-state arc is told entirely
through `F` and `f` — never through `N` — which is a cleaner, simpler read than the incline sibling's
continuously-recomputed `N`.

**Slider-extreme sanity (S6 sandbox):** `m → 10` doubles `N` to 98 N and, since `F_break = μₛ·m·g` on
a flat surface, **doubles the break-away force to 49 N** — the sandbox's default `F` range (13–26 N,
§9) can no longer reach it, so the block just holds forever at high `m`, a real and teachable outcome.
`m → 0.5` drops `N` to 4.9 N and `F_break` to 2.45 N — the block breaks almost instantly on any push.
**This is the deliberate CONTRAST with `block_on_incline`, where mass cancels out of the break-away
condition entirely** (`tan θc = μₛ`) — here, for a horizontal push, mass genuinely matters. `mu_s → 0`
removes the ceiling entirely (any F > 0 breaks away instantly). `mu_k → 0` recovers frictionless
`a = F/m`. `v0` only matters pre-seeded (S4/S5); the S6 `v0` slider lets the teacher launch the body
already moving, bypassing the static branch on entry, exactly as `newton_first_law` S4 does.

### 1b. Formulas (Branch A, `theta = 0` throughout this concept)

```json
"formulas": {
  "N": "m * g * cos(radians(theta))",
  "drive": "F - m * g * sin(radians(theta))",
  "max_static": "mu_s * N",
  "static_hold_condition": "abs(drive) <= mu_s * N",
  "f_static": "abs(drive)",
  "kinetic_friction_signed": "-sign(v) * mu_k * N",
  "a_moving": "(drive + kinetic_friction_signed) / m",
  "a_static": "0",
  "break_away_force": "mu_s * m * g",
  "sum_F": "m * a"
}
```

**Branch A pseudocode reduction, verified line-by-line against the engine spec §2** (with
`theta_i = 0` constant, not hanging):
```
N_i      = m·g·cos(0) = m·g                          ✓ = 49.0 N at m = 5
drive_i  = F_i − m·g·sin(0) = F_i                     ✓ drive collapses to the applied force exactly
maxStat_i = μₛ·m·g
stick iff |v_i| < STOP_EPS_V and F_i ≤ μₛ·m·g
break-away:  F = μₛ·m·g                               (MASS-DEPENDENT — no cancellation, unlike the
                                                        incline sibling's tan θc = μₛ)
sliding:  a_i = (F_i − μₖ·m·g)/m = F_i/m − μₖ·g        (f_k = μₖN is CONSTANT once sliding, since N
                                                        never changes in this concept — a_i tracks F_i
                                                        directly, one clean linear relationship)
```
No approximation, no leftover term — the engine's own Branch A pseudocode IS the physics this concept
teaches, for the flat/no-pulley/no-incline case.

### 1c. `computed_outputs`

```json
"computed_outputs": {
  "N": "normal reaction, N — m*g, constant at 49.0 N throughout this concept (theta = 0 fixed)",
  "f": "friction magnitude, N — f_s = F while stuck (never exceeds mu_s*N); f_k = mu_k*N once sliding",
  "a": "acceleration, m/s^2 — 0 while stuck; (F - mu_k*N)/m once sliding",
  "v": "velocity, m/s",
  "F_net": "net force, N — 0 while stuck (the taught value in S1/S2/pre-break-S3); m*a once sliding"
}
```

### 1d. `constraints` (documentation-only, Gate 8/25/29/30)

```json
"constraints": [
  "N = m*g at all times in this concept — theta = 0 is fixed and never authored as a control",
  "f_s <= mu_s*N always while at rest; the reported static friction never exceeds its own ceiling",
  "break-away occurs at F = mu_s*m*g exactly — this threshold is MASS-DEPENDENT on a flat push, the deliberate contrast with block_on_incline's mass-cancelling tan(theta_c) = mu_s",
  "once sliding, f_k = mu_k*N < mu_s*N (mu_k < mu_s) and is CONSTANT for the rest of the slide, independent of both F and v — kinetic friction never varies with speed",
  "STOP_EPS_V = 0.01 m/s: velocity below this is treated as exactly zero by the engine",
  "T = 0 everywhere in this concept — no tension, no pulley, no hanging body (uncoupled Branch A bodies only)"
]
```

---

## 2. Per-state `bodies[]` blocks (full, self-contained — no carried defaults)

**S1 — `rest_equilibrium`**
```json
"surface": { "theta_deg": 0, "length_m": 6, "frictionless": false },
"bodies": [{ "id": "A", "label": "m", "mass_kg": 5, "initial_position_m": 0,
             "initial_velocity_mps": 0, "mu_s": 0.5, "mu_k": 0.4, "applied_force_N": 0 }],
"arrows": [{ "body_id": "A", "show": ["weight", "normal", "friction"] }],
"readouts": ["N", "f"],
"controls_visible": ["m"],
"glow_focal": "nlb_arrow_A_weight",
"phases": [{ "id": "normal_focal", "at_ms": 4000, "glow_focal": "nlb_arrow_A_normal" }]
```
Justification: `applied_force_N: 0` is explicit (not merely omitted) so no upstream default could leak
a nonzero push into the "zero friction" hook. `mu_s`/`mu_k` are both authored even though `mu_k` never
binds here (body never moves) — belt-and-braces against Bug #1, matching `newton_first_law` STATE_3's
identical pattern.

**S2 — `accelerate_applied_force`**
```json
"surface": { "theta_deg": 0, "length_m": 6, "frictionless": false },
"bodies": [{ "id": "A", "label": "m", "mass_kg": 5, "initial_position_m": 0,
             "initial_velocity_mps": 0, "mu_s": 0.5, "mu_k": 0.4, "applied_force_N": 16 }],
"param_ramp": { "param": "F", "from": 16, "to": 23, "start_ms": 1000, "end_ms": 8000 },
"arrows": [{ "body_id": "A", "show": ["weight", "normal", "applied", "friction"] }],
"readouts": ["f", "F_applied", "F_net"],
"controls_visible": ["F"],
"glow_focal": "nlb_arrow_A_friction"
```
Justification: `initial_position_m: 0` is IDENTICAL to S1's final resting position — home-pose
continuity (Rule 32d), no teleport. `applied_force_N: 16` = the ramp's own `from` (no entry jump, the
documented `param_ramp` contract). 1000 ms lead-in before the ramp starts gives the apparatus a legible
beat at home pose before the cause (the push) begins moving (Rule 32a).

**S3 — `accelerate_applied_force`**
```json
"surface": { "theta_deg": 0, "length_m": 6, "frictionless": false },
"bodies": [{ "id": "A", "label": "m", "mass_kg": 5, "initial_position_m": -4,
             "initial_velocity_mps": 0, "mu_s": 0.5, "mu_k": 0.4, "applied_force_N": 16 }],
"param_ramp": { "param": "F", "from": 16, "to": 27, "start_ms": 0, "end_ms": 11000 },
"arrows": [{ "body_id": "A", "show": ["weight", "normal", "applied", "friction"] }],
"readouts": ["f", "F_applied", "a"],
"controls_visible": ["mu_s"],
"glow_focal": "nlb_body_A"
```
Justification: **reset to `initial_position_m: -4`** — a deliberate reposition (named in narration,
§8) to give the block a full 10 m run once it breaks free; S2 already proved the lockstep at a fixed
spot, S3 needs travel room. `applied_force_N: 16` matches the ramp's `from` again (no entry jump).

**S4 — `accelerate_applied_force` (two independent bodies, no pulley)**
```json
"surface": { "theta_deg": 0, "length_m": 6, "frictionless": false },
"bodies": [
  { "id": "A", "label": "m", "mass_kg": 5, "initial_position_m": -4,
    "initial_velocity_mps": 0, "mu_s": 0.5, "mu_k": 0.4, "applied_force_N": 22 },
  { "id": "B", "label": "m", "mass_kg": 5, "initial_position_m": -5,
    "initial_velocity_mps": 0.4, "mu_s": 0.5, "mu_k": 0.4, "applied_force_N": 22 }
],
"arrows": [
  { "body_id": "A", "show": ["applied", "friction"] },
  { "body_id": "B", "show": ["applied", "friction"] }
],
"readouts": ["f", "v"],
"controls_visible": ["mu_k"],
"glow_focal": "nlb_arrow_B_friction",
"phases": [{ "id": "glow_walk", "at_ms": 0, "until_ms": "~50%", "glow_focal": "nlb_arrow_B_friction" }]
```
Justification: weights omitted from `arrows[]` (declutter — N is carried by S1's memory, both bodies'
`N = 49.0 N` are identical and not the story here). **`B`'s `initial_velocity_mps: 0.4` is
load-bearing, not decorative** — with `|v| ≥ STOP_EPS_V` at entry B is guaranteed onto the kinetic
branch from frame 1, regardless of the fact that 22 N would numerically also satisfy the STICK test at
rest (`22 ≤ 24.5`) if B had been seeded at v = 0. Lane offset (B at a separate visual lane, engine fix
`ff408ed`) keeps the two bodies from overlapping on screen; it does not affect the 1-D `s` integration.

**S5 — `accelerate_applied_force` (two independent bodies, no pulley)**
```json
"surface": { "theta_deg": 0, "length_m": 6, "frictionless": false },
"bodies": [
  { "id": "A", "label": "m", "mass_kg": 5, "initial_position_m": -4,
    "initial_velocity_mps": 1.0, "mu_s": 0.5, "mu_k": 0.4, "applied_force_N": 19.6 },
  { "id": "B", "label": "m", "mass_kg": 5, "initial_position_m": -4,
    "initial_velocity_mps": 2.5, "mu_s": 0.5, "mu_k": 0.4, "applied_force_N": 19.6 }
],
"arrows": [
  { "body_id": "A", "show": ["applied", "friction"] },
  { "body_id": "B", "show": ["applied", "friction"] }
],
"readouts": ["f", "v"],
"controls_visible": ["mu_k"],
"glow_focal": "nlb_arrow_A_friction"
```
Justification: `applied_force_N: 19.6` on both is the load-bearing number — it exactly equals
`f_k = μₖN = 19.6 N`, so `drive + f_k = 0` for BOTH bodies regardless of `v`, giving `a = 0` (constant
velocity) by construction, not by coincidence. Both bodies seeded already moving (`|v0| ≥ 0.01`) so
neither ever touches the static branch.

**S6 — `sandbox`** (see §9 for the corrected `idle_auto_sweep` — this supersedes the architect's
`F start 16 N` / `range:[16, 27]`)
```json
"surface": { "theta_deg": 0, "length_m": 6, "frictionless": false },
"bodies": [{ "id": "A", "label": "m", "mass_kg": 5, "initial_position_m": -5,
             "initial_velocity_mps": 0, "mu_s": 0.5, "mu_k": 0.4, "applied_force_N": 13 }],
"trusted_drag_seizes": true,
"idle_auto_sweep": { "param": "F", "range": [13, 26] },
"arrows": [{ "body_id": "A", "show": ["weight", "normal", "applied", "friction", "net"] }],
"readouts": ["N", "f", "a", "v"],
"controls_visible": ["m", "F", "mu_s", "mu_k", "v0"],
"glow_focal": "nlb_body_A"
```
Justification: `applied_force_N: 13` = `range[0]` (the authoring contract — no first-frame step).
`initial_position_m: -5` (near the −6 bound) maximizes the runway for the multi-cycle demo (§9).

---

## 3. Per-state numeric worksheet — every claim independently re-verified

All numbers below were checked BOTH algebraically and by running the engine's own discrete-time
integrator (semi-implicit Euler, `dt = 1/60 s`, matching `field_3d_renderer.ts` exactly — not a
closed-form approximation) in Python, since S3/S4/S5/S6 all involve time-varying forces or bound
halts where a closed form risks drift from what the real renderer will show.

**Constants used:** `m = 5 kg` (default), `g = 9.8`, `theta = 0` fixed ⇒ **`N = 49.0 N` in every
guided state**, `μₛ = 0.5` ⇒ ceiling `μₛN = 24.5 N`, `μₖ = 0.4` ⇒ `f_k = μₖN = 19.6 N` — **both
constants** for the whole concept (unlike the incline sibling, `N` never changes).

**S1 (F = 0, at rest):** `mg = N = 49.0 N`, `drive = 0`, `f = |drive| = 0.00 N` (zero-hidden by the
engine's `NLB_ARROW_EPS = 0.05` rule — the absence IS the visual), `F_net = 0.00`. Dragging `m` from
0.5→10 kg scales `mg`/`N` from 4.9→98.0 N; `f` stays exactly 0.00 for every value of `m`, since
`drive = F = 0` regardless of mass — **confirmed, this is not an approximation, `m` genuinely never
enters the `f = 0` result here.**

**S2 (`param_ramp` F: 16→23 N over 1000–8000 ms, rate 1.0 N/s):**

| t (ms) | F (N) | f (N) | ceiling (N) | margin (N) | F_net (N) |
|---|---|---|---|---|---|
| 1000 (start) | 16.00 | 16.00 | 24.5 | 8.50 | 0.00 |
| 8000 (end, hold) | 23.00 | 23.00 | 24.5 | **1.50** | 0.00 |

`f` tracks `F` digit-for-digit (`f = |drive| = F` exactly, since `drive = F`) the entire window — the
misconception-confrontation proof (§7). Ramp deliberately stops at 23 N, not 24 N, for a comfortable
1.5 N margin below the 24.5 N ceiling (the same float-avoidance convention `block_on_incline` used).

**S3 (`param_ramp` F: 16→27 N over 0–11000 ms, rate 1.0 N/s, reset to s = −4):**

Engine-exact simulation (dt = 1/60 s):

| t (ms) | event | F (N) | s (m) | v (m/s) | a (m/s²) | f (N) |
|---|---|---|---|---|---|---|
| 0 | still, ramp starts | 16.00 | −4.00 | 0 | 0 | 16.00 |
| **8500** | **BREAK-AWAY** | **24.50** | −4.00 | 0.016 | 0.98 | snaps 24.50 → 19.60 |
| 11000 (ramp holds at 27 from here) | sliding | 27.00 | −0.37 | 3.10 | 1.48 | 19.60 (flat — constant, since N never changes) |
| 12000 (typical frozen pin) | sliding, still mid-run | 27.00 (held) | **3.47** | **4.58** | 1.48 | 19.60 |
| **12517** | **HALT at the +6 m bound** | 27.00 | 6.00 | 0 | 0 (bound-arrested) | 19.60 (readout stays kinetic — the halt latch, §"engine bug queue" above) |

**Break-away instant confirmed exactly at t = 8500 ms** (the ramp's own rate is exactly 1.0 N/s over
16→27 N/0→11000 ms, so `t = (24.5−16)/1.0 = 8.5 s` — no rounding needed, unlike the incline sibling's
non-round `8306.66 ms`). **`a`-jump 0 → 0.98 m/s² confirmed** (`(24.5−19.6)/5 = 0.98`), rising to
**1.48 m/s² at the ramp's end** (`(27−19.6)/5 = 1.48`) and staying there once the ramp holds.
**`s` at the 12000 ms frozen pin ≈ 3.47 m absolute, i.e. `s − s₀ ≈ 7.47 m` of travel since state
start** — matches the prompt's claimed **≈ 7.4 m** (my continuous-calculus cross-check independently
gave 7.40 m; the discrete engine-exact sim gives 7.47 m — a rounding-level difference from the
discretization, not a physics error). **Halt at t ≈ 12.52 s** — the skeleton's claimed **≈ 12.6 s** is
a reasonable close estimate (off by ~0.08 s), not a physics error; json_author/the engine compute the
real value at runtime regardless. **Unlike the incline sibling, `f_k` is a flat constant 19.6 N for the
entire slide** (never a continuously-changing curve) since `N` never changes here — the drop is a
single clean vertical step in the readout, then flat.

**S4 (F = 22 N both bodies, flat, `N = 49.0 N` both):**

*Body A (rest):* `drive = 22.00 N ≤ ceiling 24.50 N` ⇒ **holds forever**, `f_s = 22.00 N`, `a = 0`,
margin 2.50 N.

*Body B (already sliding, v0 = 0.4 m/s):* `f_k = μₖN = 19.60 N` (fixed) ⇒
`a = (22 − 19.6)/5 = 0.48 m/s²` — **confirmed exactly**. Engine-exact sim: B reaches the **+6 m bound
at t = 5.983 s** (matches the prompt's claimed **t ≈ 6.0 s** essentially exactly), with `v` at that
instant ≈ **3.27 m/s** (matches the claimed **0.4 → 3.3 m/s**, confirmed by both the closed-form
kinematics `s(t) = 0.4t + 0.24t²` and the discrete sim).

**S5 (F = 19.6 N both bodies, flat, `N = 49.0 N` both — `drive = f_k` exactly):**

`a = (19.6 − 19.6)/5 = 0.00 m/s²` for **both** bodies, for any `v` — **confirmed exactly, not an
approximation**: this is the load-bearing algebraic identity of the whole state (§2 justification).
Engine-exact sim: A (v0 = 1.0) crosses its +6 m bound at **t = 10.00 s exactly** (10 m ÷ 1.0 m/s);
B (v0 = 2.5) crosses at **t = 3.98 s** (10 m ÷ 2.5 m/s ≈ 4.0 s) — matches the prompt's claimed
**"B crosses its 10 m in 4.0 s"** exactly. Both `f` readouts sit at **19.60 N throughout**, identical,
while the `v` rows read 1.0/1.5/2.0/2.5… and 2.5/… respectively — the invariant IS the story.
**Flag:** A's halt lands at t ≈ 10.0 s, right at the edge of a ~10 s narration window — json_author
should trim A's narration to end by ~9.8 s or accept the coincidentally clean finish; not a defect
either way.

---

## 4. Arrow-magnitude floor audit (`NLB_ARROW_MIN_LEN = 0.55` world units clamps any force below
`0.55/0.048 ≈ 11.46 N` to a still-visible minimum length; `NLB_ARROW_EPS = 0.05 N` is the true
zero-hide threshold)

| state | arrow | value(s) across the state | status |
|---|---|---|---|
| S1 | weight `mg` | 49.0 N (scales with `m`) | ✓ well above true-scale floor |
| S1 | normal `N` | 49.0 N (scales with `m`) | ✓ |
| S1 | friction | 0.00 N | correctly zero-hidden, not a floor failure |
| S2 | applied / friction | 16 → 23 N | ✓ (never dips) |
| S3 | applied | 16 → 27 N | ✓ |
| S3 | friction | 16.00 → 24.50 (peak, instantaneous) → snaps to 19.60 (flat) | ✓ |
| S4 | A applied / friction | 22.00 / 22.00 N | ✓ |
| S4 | B applied / friction | 22.00 / 19.60 N | ✓ |
| S5 | applied / friction (both) | 19.60 / 19.60 N | ✓ |
| S6 | applied / friction | 13 → 26 N (idle sweep, §9) | ✓ but the 13 N floor dips just below this concept's own S2/S3 self-imposed "≥16 N" legibility convention — still comfortably above the hard 11.46 N true-scale threshold and the 0.05 N zero-hide threshold, so the arrow stays visibly readable (near-minimum length at the low end of the sweep, never a stub). Accepted — flagged, not a blocker, since Rule 33d's real-number duty is carried by the HUD, not arrow length alone. |
| all guided states | `net` | never shown; peaks at 7.4 N (S3, at ramp end) — sub-floor, correctly hidden per skeleton |

---

## 5. Within-state motion + reveal timeline (Rule 26/31/32)

| S | t-window | what animates (pure fn of state clock) | driven by | live control(s) |
|---|---|---|---|---|
| S1 | 0–4000 ms | weight arrow present at home pose; glow sits on `nlb_arrow_A_weight` | static | `m` |
| S1 | 4000 ms → end | glow HANDS OFF to `nlb_arrow_A_normal` (phase, glow-only, inert action) — nothing moves, only the focal shifts | `phases[0]` | `m` |
| S1 | continuous | if the teacher drags `m`, weight+normal arrow LENGTHS rescale live (Rule 29 magnitude exception); `f` readout never leaves 0.00 | `m` slider | `m` |
| S2 | 0–1000 ms | home pose, nothing moves (lead-in gap, Rule 32a) | — | none live yet |
| S2 | 1000–8000 ms | applied arrow (cause) grows first frame-by-frame; friction arrow answers it in the SAME frame each step (both derived from the same `param_ramp` write — genuinely simultaneous lockstep, the point of the state) | `param_ramp{F}` | `F` |
| S2 | continuous | `F_net` readout holds 0.00 the entire window — the held proof | computed | `F` |
| S2 | after 8000 ms | ramp holds at 23 N; apparatus static for the rest of narration | — | `F` |
| S3 | 0–8500 ms | applied arrow (cause) climbs continuously; block stays visibly still the whole 8.5 s — cause precedes effect by a wide margin (32a) | `param_ramp{F}` | `mu_s` |
| S3 | 8500 ms | friction readout SNAPS 24.50→19.60 in one frame; `a` jumps 0→0.98 m/s² | integrator | `mu_s` |
| S3 | 8500 ms → halt (≈12517 ms) | block translates (`translate-through`) while `F` keeps rising to 27 (holding there from 11000 ms); `a` climbs 0.98→1.48 then holds | `param_ramp{F}` + integrator | `mu_s` |
| S3 | after halt | readouts hold their final (halted, kinetic) values | bound-arrest latch | `mu_s` |
| S4 | 0 → 100% | body A sits motionless at home pose — the STILLNESS is the point (Rule 32b: only B's motion changes) | — | `mu_k` |
| S4 | 0 → ~5983 ms | body B (already moving at entry) speeds up visibly (`two-fate-contrast`) until it reaches the bound | `a = (F−μₖN)/m`, fixed F=22 | `mu_k` |
| S4 | 0% → ~50% | `glow_focal` walks onto `nlb_arrow_B_friction` — the contrast-defining arrow | `phases[0]` | `mu_k` |
| S4 | after B halts | readouts hold (A's row stays at rest values throughout, B's settle at its final kinetic values, bound-arrest latch) | — | `mu_k` |
| S5 | open, both bodies from t = 0 | A and B glide simultaneously at their own constant `v`; both `f` readouts pinned 19.60 the whole time — the invariant IS the story, shown side-by-side not sequentially (`two-speed-glide`, no seed archetype) | `a = 0` identity | `mu_k` |
| S5 | ~3980 ms | B reaches its bound and halts (still gliding at 2.5 m/s the instant before) | bound clamp | `mu_k` |
| S5 | ~10000 ms | A reaches its bound near narration's edge (flagged above) | bound clamp | `mu_k` |
| S6 | open, continuous, never auto-freezes (Rule 37) | idle `F` sweep (§9, corrected range) drives real stick→slip→restick cycles until a trusted input seizes; body translates, halts at whichever bound the creep reaches | `idle_auto_sweep{F}` (until seized) then any slider | `m, F, mu_s, mu_k, v0` (ALL) |

Rule 32 compliance: S2/S3's applied-force cause precedes/accompanies its friction-answer response by
construction of the shared ramp write-path (no discrete cause→effect gap needed here — this is the
same "continuously-acting cause" pattern `newton_first_law` S2 used, not a violation); S3's cause has
an 8.5 s head start before the block visibly moves at all — by far the widest margin in the concept;
S4's only moving element is B, A holds pose the entire state (32b); ONE `glow_focal` per state.

---

## 6. Per-state control spec (Rule 31 — closed enum `m|m2|F|theta|mu_s|mu_k|v0`)

| S | `controls_visible` | effect of each live control |
|---|---|---|
| S1 | `["m"]` | scales `mg`/`N` live; `f` stays 0.00 for every `m` (F = 0 fixed this state) |
| S2 | `["F"]` | a trusted drag/slider CANCELS the ramp (`PM_nlbSweepSeized`) and hands control to the teacher immediately; `f` tracks `F` 1:1 up to the 24.5 N ceiling — pushing past it mid-narration would legitimately break the block away early, a real outcome the narration doesn't assume away |
| S3 | `["mu_s"]` | dragging `μₛ` live during the ramp moves the break-away FORCE in real time (`F_break = μₛ·m·g = μₛ·49`): `μₛ = 0.3` → breaks at 14.7 N (much earlier); `μₛ = 0.8` → breaks at 39.2 N (never breaks inside this ramp's 16–27 N span — the block holds through the whole narration, a valid "raise the ceiling out of reach" outcome) |
| S4 | `["mu_k"]` | dragging `μₖ` rescales B's acceleration `a = (22 − μₖ·49)/5`; at `μₖ ≥ 22/49 ≈ 0.449`, B's push can no longer beat friction and it decelerates/stops instead of speeding up — a real, physically valid outcome |
| S5 | `["mu_k"]` | moves BOTH `f` readouts together (still equal to each other, since both bodies share the same surface) — but genuinely breaks the authored `a = 0` glide, since `drive` stays fixed at 19.6 N while `f_k = μₖ·49` no longer matches it. **Must be narrated honestly** — this is true physics, not a bug, per the task brief |
| S6 | `["m","F","mu_s","mu_k","v0"]` | ALL five tokens this concept ever uses (θ excluded — flat concept). `m` here ALSO shifts the break-away force (unlike `block_on_incline`, where mass cancels) — a deliberate, teachable difference between the two sibling concepts |

Slider rows for every token this concept uses are built once and shown/hidden per state (Rule 32d,
reserved-slot pattern); the `mu_k` row occupies the same slot across S4/S5/S6.

---

## 7. Physical constraints / correctness guards (Definition-of-Done, Gate 8/25/29/30)

1. **Sign convention:** `s` signed along the body's own positive axis; every body in this concept is
   pushed in the same positive direction (no down-slope/up-slope ambiguity, since `theta = 0`
   throughout) — friction is reported as a positive magnitude opposing the push, never a signed
   negative number in the HUD.
2. **`STOP_EPS_V = 0.01 m/s`** governs stick/slip: S1, S2, and S3-pre-break all start at `v = 0` and
   the stick branch correctly holds until `F` crosses `μₛN`; S4's body B and both of S5's bodies are
   deliberately seeded at `|v0| ≥ 0.01` so they enter the kinetic branch from frame 1 regardless of
   whether the static geometry would numerically also stick from rest.
3. **Surface bound `length_m = 6`** bounds `s` at `±6` in every state — S3's run is `−4 → +6 = 10 m`
   (halt confirmed at `s ≈ 3.47 m` by the 12000 ms pin, well short of the bound, halting at
   `t ≈ 12.52 s`); S4 body B's run is `−5 → +6 = 11 m` (halt confirmed `t ≈ 5.98 s`); S5's A run is
   `−4 → +6 = 10 m` (halt at `t = 10.00 s`, right at the narration edge — flagged in §3); S5's B run is
   `−4 → +6 = 10 m` (halt at `t ≈ 3.98 s`, well inside its window).
4. **`T = 0` everywhere** — no tension, no pulley, no hanging body (uncoupled Branch A only, per
   skeleton §2).
5. **Model honesty:** rigid point-mass, ideal Coulomb friction (`f_s ≤ μₛN` exactly, `f_k = μₖN`
   exactly, no velocity-dependence, no contact-area dependence) — narration must never imply speed or
   area affects friction (S5's whole point) or that the break-away has any lag (the S3 snap is a
   genuine instantaneous discontinuity in this model).
6. **`f_s ≤ μₛN` always; `f_k = μₖN` always** — re-verified at every sampled instant in §3.
7. **Break-away is MASS-DEPENDENT here** (`F_break = μₛ·m·g`) — the deliberate contrast with sibling
   `block_on_incline`'s mass-cancelling `tan θc = μₛ`. S1's `m`-slider (which shows `f = 0` for ANY
   `m`, because `F = 0` there) must not be misread as "mass never matters" — S6's `m`-slider is where
   this genuine mass-dependence becomes explorable.
8. **`N = 49.0 N` is invariant** across every guided state (`theta = 0` fixed, `m = 5 kg` fixed except
   via the S1/S6 slider) — this concept's entire arc plays out through `F` and `f`, never through `N`,
   a deliberate simplification relative to `block_on_incline`.

---

## 8. Within-state narration (Rule 30/31/35 — `text_en` only, Rule 30i English-only product)

**S1 (38 EN words — within the 30–40 budget):**
"Nothing is pushing this block, so friction has nothing to answer: f sits at zero. Drag the mass up —
weight and normal force N grow together, but friction stays 0.00. Friction only exists when a push
asks it to."

**S2 (46 EN words — within the 35–50 budget):**
"Push harder and friction rises to match, newton for newton — watch the applied and friction arrows
grow together while the block stays perfectly still. The net-force readout holds at 0.00 the whole
time. So far friction always finds the answer... watch what happens when it can't."

**S3 (55 EN words — within the 45–55 budget):**
"We reset the block and start the push from scratch. Push keeps climbing — the block holds, holds,
holds — until F hits 24.5 newtons, and it lets go. Notice friction gave back LESS: the readout snaps
from 24.50 down to 19.60. That gap is why acceleration jumps from zero to nearly one metre per second
squared."

**S4 (49 EN words — within the 40–55 budget):**
"Same 22-newton push, two identical blocks, two different fates. This one was resting — friction rises
to meet the push and holds it at 22.00 newtons, forever. That one was already sliding — it only ever
gets 19.60 newtons of friction, so the extra push wins and it keeps speeding up."

**S5 (36 EN words — within the 30–45 budget):**
"One block glides slow, the other fast — yet both friction readouts read exactly 19.60 newtons.
Kinetic friction only cares about the surfaces and the normal force, never about speed. Faster does
not mean more grip lost."

**S6 — 0 words / open** (per Rule 31/37: the explore state is teacher-narrated live, no authored
script).

Rule 35 check: universal storage-box push framing throughout, no country-specific places, brands,
currency, or names. Rule 30 check: every bare symbol expanded on first use (`f` → "friction", `N` →
"normal force N", `F` → "F" is retained bare only after "push" is established contextually in S2/S3 —
consistent with the skeleton's own formula-glyph usage; every numeric quantity is spoken with its unit
"newtons"/"metre per second squared").

---

## 9. S6 idle-sweep cadence audit — the FLAG (physics finding + fix)

**Claim under test:** does `idle_auto_sweep {param:'F', range:[16, 27]}` (the architect's authored
value) produce "live stick-slip until seized," and if too frantic, what's the corrected range?

**Finding: it is not too frantic — it produces almost NO repeating cycles at all.** `NLB_SWEEP_MS`
is a fixed 4000 ms triangle (`field_3d_renderer.ts` L39485), so the mean applied force over one full
period of range `[16, 27]` is `(16+27)/2 = 21.5 N`, which is **greater than `f_k = 19.6 N`**. Once the
block breaks away, it therefore accumulates net-positive velocity every subsequent period — it never
decelerates back to rest, so it can never re-stick. Running the engine's exact discrete-time integrator
(dt = 1/60 s, `m=5, mu_s=0.5, mu_k=0.4, s0=−5, length_m=6`):

```
BREAK   t = 1.55 s   (F = 24.53 N)
— no further sign of a restick —
HALT (bound-arrested at +6 m)   t = 7.98 s
```

**One break-away, ~6.4 s of continuous sliding, then the block sits pinned at the wall for the rest of
the idle demo** (F keeps oscillating meaninglessly against a body that can no longer move, per the
engine's `_boundArrestedSliding` latch, which correctly keeps reporting kinetic friction rather than
falsely reverting to static). This is not "frantic" — it is a dead demo after 8 seconds.

**Root cause:** for a one-directional flat push (`theta = 0`, so the body can only ever move forward,
never backward), genuine repeating stick-slip requires the sweep's MEAN value to sit at or below
`f_k`, while its PEAK must still clear `μₛN`. With `lo = 16` fixed, no `hi > 24.5` keeps the mean
`≤ 19.6`.

**Fix — replace the range with `[13, 26]`** (mean `19.5 N`, just under `f_k`; peak margin `1.5 N`
above the 24.5 N ceiling, matching the S2 convention). Re-running the same exact integrator:

```
BREAK    t =  1.78 s   (F = 24.59)      RESTICK  t =  4.18 s   (F = 14.19, s = −3.617)
BREAK    t =  5.78 s                    RESTICK  t =  8.18 s   (s = −2.234)
BREAK    t =  9.78 s                    RESTICK  t = 12.18 s   (s = −0.851)
BREAK    t = 13.78 s                    RESTICK  t = 16.18 s   (s =  0.532)
BREAK    t = 17.78 s                    RESTICK  t = 20.18 s   (s =  1.915)
BREAK    t = 21.78 s                    RESTICK  t = 24.18 s   (s =  3.298)
BREAK    t = 25.78 s                    RESTICK  t = 28.18 s   (s =  4.681)
BREAK    t = 29.78 s → slides into the +6 m bound and settles there, t ≈ 31.85 s
```

**Seven complete, genuine stick→slip→restick cycles**, phase-locked exactly to the engine's fixed
4000 ms sweep period, before the accumulated forward creep (a consistent **1.383 m per cycle**) reaches
the +6 m bound and the block settles there — itself a valid bonus beat ("small repeated lurches walk
the block to the end of the track," a real stick-slip phenomenon, e.g. chalk squeak / drawer stick).
Each cycle splits **≈1.6 s stuck (F climbing, f tracking it) + ≈2.4 s sliding** — a clear, legible,
once-every-4-seconds cadence (≈15 cycles/minute while the teacher watches, well inside a "teachable"
range, not frantic).

**Authored fix (already reflected in §2's S6 block above):** `applied_force_N: 13` (= `range[0]`, no
entry jump) and `idle_auto_sweep: { "param": "F", "range": [13, 26] }`, with `initial_position_m: -5`
to give the full ~7-cycle, ~30-second demonstration room before the wall.

**Route:** this is a physics-of-the-demo correction I am making directly (not a renderer defect), so no
`peter_parker` routing is needed — json_author should build S6 with the corrected range above, and
quality_auditor should re-run the same class of check (or trust this derivation) rather than accepting
the skeleton's `[16, 27]` verbatim.

---

## 10. Delta cues + formula overlays (Rule 32c/34a/34b)

| state | on-canvas delta cue (≤5 words) | formula overlay (ONE Unicode surface) |
|---|---|---|
| S1 | "No push — zero friction" | `F = 0 ⇒ f = 0` |
| S2 | "Friction rises to match" | `fₛ = F  (F ≤ μₛN)` |
| S3 | "Push past the ceiling" | `fₛ ≤ μₛN → fₖ = μₖN` |
| S4 | "Same push, two fates" | `fₖ = μₖN < μₛN` |
| S5 | "Fast or slow — same friction" | `fₖ = μₖN — independent of v` |
| S6 | "All yours" | `fₛ ≤ μₛN · fₖ = μₖN` |

All glyphs real Unicode per Rule 34c: `≤` U+2264, `→` U+2192, `⇒` U+21D2, `ₛ`/`ₖ` U+209B/U+2096,
`·` U+00B7 — never ASCII transcription.

---

## 11. Drill-down cluster phrasings (5 real student-voice phrases each — 6 clusters per skeleton §6)

**`friction_self_adjusting_mechanism` (S2)**
- "how does the floor know how hard to push back"
- "does friction think about how much force to give"
- "why does friction match the push exactly every time"
- "how can a surface adjust itself like that"
- "is friction reacting or is it just always there"

**`mu_n_is_ceiling_not_value` (S2)**
- "is mu times N the actual friction or just the max"
- "why isnt friction always mu s N"
- "is the friction force a fixed number or does it change"
- "when do I actually use mu s N in a calculation"
- "why does the formula give a bigger number than what I see"

**`static_friction_zero_without_push` (S2/S1)**
- "why is there no friction if nothing is pushing"
- "shouldnt there always be some friction just sitting there"
- "does friction exist even when nothing moves or pushes"
- "why does f read zero when mu s N isnt zero"
- "is friction on standby or is it actually off"

**`limiting_friction_breakaway` (S3)**
- "why does it let go at exactly that number and not before"
- "is there a formula for when it will start to slide"
- "why does the block hold so long then suddenly move"
- "what decides the exact push where it breaks free"
- "does every object have its own breaking point like this"

**`static_to_kinetic_drop` (S3)**
- "why does friction get weaker the moment it starts moving"
- "shouldnt friction stay the same once it slips"
- "why is sliding friction less than what was holding it"
- "if it needed that much force to move why less now"
- "why does the grip not come back once it starts sliding"

**`f_vs_applied_force_graph_story` (S3)**
- "is there a graph that shows friction rising then dropping"
- "what does the friction versus push graph actually look like"
- "why does the line go straight up then fall down"
- "how would I draw friction against applied force on paper"
- "does the graph flatten out after it starts sliding"

---

## 12. Self-review checklist

- [x] Every symbol in the state narratives (`f`, `mg`, `N`, `F`, `μₛ`, `μₖ`, `a`) appears in `variables`.
- [x] Every formula wraps the angle argument in `radians()` even though `theta = 0` is constant
      throughout this concept (future-proof convention, matches `newton_first_law`).
- [x] Every state's live control(s) match the architect's control table exactly (S1 `m`, S2 `F`, S3
      `mu_s`, S4 `mu_k`, S5 `mu_k`, S6 all five).
- [x] `bodies[]` overrides documented for all six states, each justified against the Bug #1 leak class.
- [x] Board mark scheme: DEFERRED (Rule 20 [D]) — nothing authored.
- [x] Drill-down phrasings: 5 per cluster × 6 clusters, real student voice, no teacher-prose.
- [x] `constraints` block: 6 short factual assertions.
- [x] Numerical sanity checks run for all 6 states, cross-checked by closed-form AND by an independent
      Python re-implementation of the engine's exact discrete integrator (§3, §9).
- [x] Within-state motion timeline written for every state; no two states share a motion; no static
      state (S1's "nothing moves" beat is a deliberate `null-result-hold`, S4's A-holds-still is the
      deliberate 32b contrast).
- [x] Rule 32 sequencing verified: S2's applied/friction lockstep is a continuously-acting-cause
      pattern (not a violated 32a gap, same reasoning as `newton_first_law` S2); S3's cause precedes
      the block's first motion by 8.5 s.
- [x] Word budget: S1 = 38 (30–40), S2 = 46 (35–50), S3 = 55 (45–55), S4 = 49 (40–55), S5 = 36 (30–45),
      S6 = 0/open — all compliant.
- [x] Engine bug queue consulted; the one substantive finding (S6 idle-sweep cadence) is fixed in §9,
      not merely flagged and left for someone else.
- [x] DC Pandey check: no import — every formula derived from `F = ma` plus the engine's own stated
      integrator, independently re-verified by direct calculation and Python simulation.

---

## Board-mode / mode_overrides — DEFERRED (Rule 20 [D])
Not authored, per the active conceptual-only directive.

## EPIC-C branches — ZERO, per skeleton §2/§5.

---

**Handoff: json_author** — build `src/data/concepts/friction_force.json` per this physics block plus
the architect skeleton. **The one required deviation from the skeleton: S6's `idle_auto_sweep.range`
must be `[13, 26]` (not the skeleton's `[16, 27]`), with `applied_force_N: 13` and
`initial_position_m: -5` on body A** — see §9 for the full derivation. Everything else in the skeleton
is confirmed as authored.
