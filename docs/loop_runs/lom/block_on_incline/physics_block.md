# PHYSICS BLOCK — `block_on_incline`

> Stage 2 artifact. Input: `docs/loop_runs/lom/block_on_incline/skeleton.md` (architect, 5 states).
> Engine: `newtons_laws_body` (field_3d), Branch A (independent bodies, no `pulley`) — configuration
> only, plus the pre-approved `param_ramp` one-shot knob (CHAPTER_LOOP §7.1, guard released 074639e).
> `g = 9.8 m/s²` is the engine's hardcoded constant. Slider min/max/step are the engine's OWN shared
> `#nlb_sliders` panel (`field_3d_renderer.ts` ~30356–30362) — not authorable per-concept; quoted
> verbatim from `free_body_diagram/physics_block.md` §1 and `connected_bodies/physics_block.md` §1a,
> the live references for this engine.

**Engine bug queue consultation:** DB not reachable from this read-only authoring context. Consulted
the committed scar surface applied by the architect (`docs/loop_runs/lom/_engine/scar_candidates.sql`,
skeleton §"Engine-bug-queue consultation") plus the two sibling physics blocks above. Applied below:
per-state near side-on `camera_position` on ONE shared distance; ONE short Unicode formula line per
state; `phases[]` only for glow/arrow-visibility timing, never a hardcoded `*_at_ms`; specific
`glow_focal` ids; single body id `A` (S4 adds `B`, both surface bodies, never `hanging`); halted-state
readouts trusted per fix `bc649d4`; `idle_auto_sweep.range[0]` = the state's own seeded value.
**New finding, this concept:** the `param_ramp` knob is the FIRST exercise of that engine item anywhere
in the fleet — S2 and S3 are its first two live uses. FLAG to quality_auditor: confirm the S3 frozen
pin at 12000 ms actually reflects a mid-slide frame (θ still ramping to 35° at `end_ms:12000`, break-away
already passed at 8307 ms) and not a stale pre-ramp frame — this is exactly the reveal-ms
`deriveStateMeta` registration risk the architect flagged (§4 dispatch note). Also flag: confirm no new
`alex:physics_author`/`alex:json_author` FIXED rows landed since 2026-07-26.

---

## 1. `physics_engine_config`

### 1a. Variables

| symbol | name | unit | min | max | step | default | maps to |
|---|---|---|---|---|---|---|---|
| `m` | mass of body A (and B in S4) | kg | 0.5 | 10 | 0.5 | **5** | `mass_a` (`mass_b` in S4), `#nlb_m_slider` — S5 only (mass cancels in every other formula the concept teaches, so exposing it there proves that fact live) |
| `m2` | mass of a second body | kg | 0.5 | 10 | 0.5 | 4 | **unused** — S4's body B is a second Branch-A body, not a coupled `m2`; both A and B are authored at `m=5 kg` so the demonstration isolates θ/μ, never mass. Row stays reserved/hidden the whole concept (mirrors `free_body_diagram`'s `m2` pattern). |
| `theta` (θ) | incline angle | ° | 0 | 60 | 1 | 20 | `theta_deg`, `#nlb_theta_slider` — S1 fixed 20°; S2/S3 driven by `param_ramp`, not the slider, during their guided window; S4 fixed 22°; S5 free 20↔35 |
| `mu_s` (μₛ) | static-friction coefficient | — | 0 | 1 | 0.05 | 0.45 | `mu_s`, `#nlb_mus_slider` — S3's own slider, live during its ramp only via the sandbox; fixed elsewhere |
| `mu_k` (μₖ) | kinetic-friction coefficient | — | 0 | 1 | 0.05 | 0.38 | `mu_k`, `#nlb_muk_slider` — S4's own slider |
| `v0` | initial velocity along the slope | m/s | −5 | 5 | 0.5 | 0 | `initial_velocity_mps` — S5 only; S1–S4 seed velocity via each body's own `initial_velocity_mps` field, never the live slider |
| `g` | gravitational acceleration | m/s² | — | — | — | **9.8 (engine constant)** | hardcoded in `updateNewtonsLawsBodyFrame` |

Slider-extreme sanity (S5 sandbox, all five live): `theta→0` flattens the ramp (drive→0, block sits with
`N→mg`); `theta→60°` drives `tanθ=1.73 ≫ μₛ` — always sliding, `a` large and positive; `mu_s→1` raises the
break-away past the slider's own `theta` ceiling of 60° (`tan⁻¹1=45°<60°`, so break-away is still reachable,
just later); `mu_k→0` recovers the frictionless case `a=g sinθ` (the DROPPED-BEAT #3 fold-in, skeleton
§"DROPPED BEATS"); `m` has ZERO effect on `a`/break-away angle by design (mass-cancellation, the S3/S5 aha)
but DOES scale every arrow's absolute newtons and the HUD's `mg` readout — the one place `m` is pedagogically
live.

### 1b. Formulas (Branch A, `F_applied = 0` throughout this concept — derived directly from ΣF=ma per body)

```
N        = m · g · cos θ
drive    = −m · g · sin θ                    (down-slope component of gravity; F_applied = 0)
maxStat  = μₛ · N
f_s      = −drive  = m·g·sin θ               (while |drive| ≤ maxStat — the block "answers")
f_k      = μₖ · N                             (once sliding)
break-away condition:  tan θc = μₛ            (m·g cancels out of maxStat = |drive| — see below)
sliding:  a = g·(sin θ − μₖ·cos θ)
```

**Branch A pseudocode reduction, verified line-by-line against `NEWTONS_LAWS_BODY_ENGINE_SPEC.md` §2:**
with `F_applied_i = 0`, `theta_i = surface.theta_deg` (not hanging):
```
N_i      = m·g·cos θ                                    ✓ matches N above
drive_i  = 0 − m·g·sin θ = −m·g·sin θ                   ✓ matches drive above
maxStat_i = μₛ·m·g·cos θ
stick iff |v_i| < STOP_EPS_V and |drive_i| ≤ maxStat_i
       ⟺  m·g·sin θ ≤ μₛ·m·g·cos θ
       ⟺  sin θ ≤ μₛ·cos θ            (m·g cancels exactly — no residual mass term)
       ⟺  tan θ ≤ μₛ
```
This reduces EXACTLY to `tan θ ≤ μₛ` with **zero approximation and zero leftover mass term** — the
engine's actual stick test IS the physics the concept teaches, not an approximation of it. No
physics-correctness escalation needed; the engine's Branch A pseudocode is provably equivalent to the
textbook break-away condition for `F_applied = 0`.

Once sliding (`|drive_i| > maxStat_i`, or `|v_i| ≥ STOP_EPS_V`): `vSign = sign(v)` (down-slope, so
negative in this concept's sign convention — see §7), `f_i = −vSign·μₖ·N = +μₖ·m·g·cos θ` (friction acts
up-slope, opposing the downward slide), `a_i = (drive_i + f_i)/m = g·(−sin θ + μₖ·cos θ)` in the
engine's own signed convention along the body's positive (up-slope) axis — its MAGNITUDE down-slope is
`a = g·(sin θ − μₖ·cos θ)`, matching the boxed formula exactly.

### 1c. `computed_outputs`

```json
"computed_outputs": {
  "N": "normal reaction, N — mg·cos θ",
  "f": "friction magnitude, N — f_s while sticking, f_k while sliding",
  "a": "acceleration along the slope, m/s²",
  "v": "speed along the slope, m/s",
  "F_net": "net force on the body, N — 0 while sticking, m·a while sliding"
}
```

### 1d. `constraints` (documentation-only, Physics Validator E25/E29/E30)

```json
"constraints": [
  "N = m*g*cos(theta) at all times — never m*g alone once theta != 0",
  "f_s <= mu_s*N always; the reported friction never exceeds its own ceiling",
  "break-away occurs exactly at tan(theta) = mu_s — mass cancels out of this condition entirely",
  "once sliding, f_k = mu_k*N < mu_s*N at the same theta (mu_k < mu_s) — kinetic friction is strictly weaker",
  "a = g*(sin(theta) - mu_k*cos(theta)) only while sliding; a = 0 while sticking",
  "T = 0 everywhere in this concept — no tension, no pulley, no hanging body (single/independent surface bodies only)"
]
```

---

## 2. Per-state variable overrides (only where they differ from the row defaults above)

- **S1** (`incline_decompose`): A: `mass_kg:5, mu_s:0.45, mu_k:0.38, initial_position_m:+2, at rest`,
  `surface.theta_deg:20` fixed, `show_components:true`. No ramp. **Why:** the hook needs a stable,
  legible single geometry — no motion, no threshold play yet.
- **S2** (`incline_decompose`): same rig, home pose (Rule 32d — continuity from S1) ·
  `param_ramp {param:'theta', from:20, to:23.5, start_ms:1000, end_ms:8000}` (rate 0.357 °/s) ·
  `mu_s:0.45, mu_k:0.38` unchanged. **Why the 1000 ms lead-in:** the ramp does not start at t=0 so the
  home-pose apparatus is legible for a beat before the cause (tilt) begins moving (Rule 32a).
- **S3** (`incline_slide`): rig RESET to `surface.theta_deg:0` flat, A at `initial_position_m:+4.5`,
  at rest, `mu_s:0.45, mu_k:0.38` unchanged · `param_ramp {param:'theta', from:0, to:35,
  start_ms:0, end_ms:12000}` (rate 2.9167 °/s) · friction arrow **phase-gated** to first appear only
  once `f_s ≥ 15 N` (θ ≈ 17.83°, t ≈ 6112 ms) — a defensive floor override on the ARROW's visibility
  phase, not on any variable value; the underlying `f_s` value is real and computed from t=0, only its
  arrow is hidden pre-floor. **Why the flat reset:** S2 already showed the answering-friction lockstep
  from 20°; S3 needs the WHOLE journey from zero tilt to demonstrate "grip fails at one exact angle,"
  which requires starting below any friction demand at all.
- **S4** (`incline_slide`): `surface.theta_deg:22` fixed (constant — inside the hysteresis window
  `tan⁻¹μₖ=20.81° < 22° < tan⁻¹μₛ=24.23°`) · A: `mass_kg:5, mu_s:0.45, mu_k:0.38,
  initial_position_m:+1.5, initial_velocity_mps:0` (lane 1, holds forever) · B: `mass_kg:5, mu_s:0.45,
  mu_k:0.38, initial_position_m:+4.5, initial_velocity_mps:−0.4` (lane 2, already sliding down-slope
  at state entry — defensive: a state that authors "the moving block keeps moving" must NOT start it
  from rest, or the engine's stick branch could re-catch it before the narration establishes the
  contrast). **Why `v0=−0.4` and not `0`:** with `|v|≥STOP_EPS_V` at entry, B is guaranteed to enter the
  kinetic branch on frame 1 regardless of the stick/slip inequality at 22° (which numerically WOULD
  stick from rest: `18.36 N ≤ 20.44 N`) — B's whole narrative depends on already-sliding, so this
  override is load-bearing, not decorative.
- **S5** (`sandbox`): A only, `theta_deg:20` start, `mu_s:0.45, mu_k:0.38, v0:0`, `initial_position_m:0`
  (recommended centred start — maximises travel room either direction under drag) ·
  `trusted_drag_seizes:true` · `idle_auto_sweep {param:'theta', range:[20,35]}` (range[0]=20 = the
  state's own seeded value, per the phase0/skeleton scar — frame 1 must not step).

No further `variable_overrides` needed: every guided state's narrated number is produced by exactly the
§1b formulas at the listed inputs — none require a defensive lock against an upstream default leak
(the S4 `v0` override above is the one load-bearing exception, justified above, not a leak-guard).

---

## 3. Per-state numeric worksheet (4 s.f., `g = 9.8`, `m = 5 kg` unless noted)

**θc = tan⁻¹(0.45) = 24.2277° ≈ 24.23°.**

**S1 (θ = 20°, static, at rest):**
`mg = 49.00 N` · `mg·cos 20° = N = 46.04 N` · `mg·sin 20° = 16.76 N` (drive) · `f_s = 16.76 N` (answers
the drive exactly, well under ceiling `μₛN = 20.72 N`) · `ΣF = 0` · `a = 0`, `v = 0`.

**S2 (`param_ramp` 20°→23.5° over 1000→8000 ms):**

| t (ms) | θ (°) | N (N) | mg·sin θ = f_s (N) | ceiling μₛN (N) | margin (N) | a |
|---|---|---|---|---|---|---|
| 1000 (start) | 20.00 | 46.04 | 16.76 | 20.72 | 3.96 | 0 |
| 8000 (end, hold) | 23.50 | 44.94 | 19.54 | 20.22 | **0.68** | 0 |

(Architect skeleton stated a 0.67 N margin at 23.5° — recomputed here as **0.68 N**, a rounding-level
difference only, not a correction of substance.) `ΣF = 0` and `F_net` reads `0.00 N` throughout — the
held proof. The ramp is deliberately NOT taken to 24°, where the margin would be a float-fragile
`0.21 N` (independently reconfirmed here) — correctly avoided per the skeleton's own reasoning.

**S3 (`param_ramp` 0°→35° over 0→12000 ms, flat reset, from rest):**

| t (ms) | θ (°) | phase | N (N) | drive = mg·sinθ (N) | f (N) | note |
|---|---|---|---|---|---|---|
| 0 | 0.00 | still | 49.00 | 0.00 | 0.00 | friction arrow not yet drawn (below 15 N floor) |
| 6112 | 17.83 | still | 46.64 | 15.00 | 15.00 | friction arrow phases IN here (floor-gated) |
| **8307** | **24.23** | **break-away instant** | 44.66 | 20.11 | 20.11→ceiling | `f_s` hits `μₛN`; slip begins |
| 10000 | (ramping) | sliding | — | — | — | `s ≈ +3.15 to +3.17 m` (from +4.5 start), `v ≈ 1.82 m/s` |
| 12000 (ramp holds at 35° from here) | 35.00 | sliding, still mid-run | 40.14 | — | `f_k = 15.25` | frozen pin: `s ≈ +3.15 → −4.22 to −4.28 m`, i.e. **s ≈ 8.7–8.8 m of travel**, `v ≈ 5.92 m/s` |
| ≈12430–12440 | 35.00 (held) | halt | — | — | — | down-slope bound reached (11.5 m total run) |

**Break-away instant, independently re-derived:** `t = θc / rate = 24.2277° / 2.91667°/s = 8306.66 ms`
— the architect's skeleton states **8308 ms**; recomputed here as **8307 ms** (≤2 ms difference, a
rounding artefact of θc to 2 decimal places, not a physics error).

**Displacement/velocity at the 12000 ms frozen pin — numerically integrated (dt=0.2 ms explicit and
dt=1/60 s semi-implicit both checked, since θ keeps ramping DURING the slide and no closed form
applies):** both integration schemes converge to **v ≈ 5.92 m/s** (architect's claimed ≈5.9 m/s
**confirmed**) but **s ≈ 8.72–8.78 m of travel** (start +4.5 m → end ≈ −4.2 to −4.3 m), i.e. the
architect's claimed **s ≈ 8.87 m is high by roughly 0.1–0.15 m (≈1–2%)**. This is a **minor numeric
correction, not a physics error** — the architect used a closed-form/estimate that doesn't account for
θ continuing to ramp mid-slide; json_author and the engine will compute the true value at runtime
(Branch A's real per-frame integration), so no authored value needs to hardcode 8.87 m — only the
narration's qualitative claim ("~9 m of travel, block still sliding") needs to hold, and it does.

**Surface bound, independently verified:** total run = `initial_position_m (+4.5) − (−7) = 11.5 m`,
matching the architect's claimed 11.5 m run exactly (`surface.length_m: 7` sets the bound at `s = ±7`).
The block does NOT reach the bound by the 12000 ms pin (still ~2.7–2.8 m short) — **confirmed**: the pin
genuinely captures live sliding, not a halted frame. Halt occurs at **t ≈ 12.43–12.44 s** (architect
claimed ≈12.4 s — **confirmed**), θ held at 35° throughout the halt.

**S4 (θ = 22° fixed, two independent bodies, no pulley):**

*Body A (rest, holds):* `N = 45.43 N` · `drive = mg·sin22° = 18.36 N` · ceiling `μₛN = 20.44 N` →
**holds** (18.36 ≤ 20.44, margin 2.08 N). `a=0, v=0` for the whole state.

*Body B (already sliding at entry, v0 = −0.4 m/s down-slope):*
`a = g·(sin22° − μₖ·cos22°) = 9.8×(0.3746 − 0.38×0.9272) = 9.8×(0.3746−0.3523) = 0.2183 m/s²`
(architect claimed 0.218 m/s² — **confirmed** to 4 s.f.). `f_k = μₖN = 17.26 N` throughout (N unchanged
by speed). Kinematics `s(t) = 0.4t + 0.1092t²` (down-slope from the 4.5 m start) reaches the 11.5 m
bound at **t ≈ 8.594 s** (architect claimed ≈8.6 s — **confirmed**), final speed
`v = 0.4 + 0.2183×8.594 = 2.276 m/s` (architect claimed 2.27 m/s — **confirmed**).

---

## 4. Arrow-magnitude floor audit (≥15 N at every VISIBLE instant, else the length clamp draws an invisible stub)

| state | arrow | value(s) across the state | floor status |
|---|---|---|---|
| S1 | weight `mg` | 49.00 N | ✓ |
| S1 | `mg·sinθ` component | 16.76 N | ✓ |
| S1 | `mg·cosθ` component | 46.04 N | ✓ |
| S1 | normal `N` | 46.04 N | ✓ |
| S1 | friction `f_s` | 16.76 N | ✓ |
| S2 | `mg·sinθ` / `f_s` | 16.76 → 19.54 N | ✓ (never dips) |
| S2 | `mg·cosθ` / `N` | 46.04 → 44.94 N | ✓ |
| S3 | weight `mg` | 49.00 N constant | ✓ |
| S3 | normal `N` | 49.00 → 40.14 N | ✓ |
| S3 | friction (phase-gated) | first drawn at 15.00 N (θ=17.83°), rises to ceiling 20.11 N at break-away, then `f_k`: 16.98 N (θc) → 15.25 N (35°) | ✓ at every VISIBLE instant, by construction of the phase gate — re-verified: never drawn below 15 N |
| S4 | A: weight, normal, friction | 49.00 / 45.43 / 18.36 N | ✓ |
| S4 | B: weight, normal, friction | 49.00 / 45.43 / 17.26 N | ✓ |
| all guided states | `net` | never shown (peaks 12.85 N in S3 at 35°, 1.09 N in S4 — both below floor, correctly omitted per skeleton) | N/A — correctly hidden, not a floor failure |

**No arrow fails the 15 N floor in any guided state.** The one live risk — S3's friction arrow appearing
sub-floor before `f_s` reaches 15 N — is exactly why the phase gate exists, and the gate's own trigger
threshold (15.00 N, θ=17.83°, t≈6112 ms) is independently reconfirmed above.

---

## 5. Within-state motion + reveal timeline (Rule 26/31/32 — phase fractions / `param_ramp`, never bare `*_at_ms`)

| S | t-window (phase) | what animates | driven by | `phases[]` / `param_ramp` |
|---|---|---|---|---|
| S1 | 0 → ~40% | weight arrow draws in on static A | fixed `mg` | `phases:[{id:'weight_draw', at_ms:0, until_ms:'~40%'}]` |
| S1 | ~40% → ~70% (≥0.5–1 s after weight settles, Rule 32a) | dashed `mg·sinθ`/`mg·cosθ` components draw out of the (still vertical) weight arrow, right-angle marker appears | `show_components` reveal | `phases:[{id:'components_draw', at_ms:'~40%', until_ms:'~70%'}]` |
| S1 | ~75% → 100% | `N` arrow draws in, matching the cos component's length | computed `N` | `phases:[{id:'normal_draw', at_ms:'~75%'}]` |
| S2 | 0 → 1000 ms | apparatus sits at home pose (S1 continuity) — nothing moves yet | — | lead-in gap (Rule 32a) |
| S2 | 1000 → 8000 ms | the incline itself tilts 20°→23.5° (`param_ramp`); weight stays vertical, its dashed components + `N` + friction arrows all re-derive live EVERY frame in lockstep with θ(t) | `param_ramp{theta}` | `param_ramp:{param:'theta',from:20,to:23.5,start_ms:1000,end_ms:8000}` |
| S2 | continuous, from t=1000 ms | `f`, `F_net` readouts update every frame; `F_net` reads `0.00` throughout — the held proof | computed | — |
| S2 | after 8000 ms | ramp holds at 23.5°; apparatus static for the rest of narration | — | hold (ramp semantics: HOLD at `to` after `end_ms`) |
| S3 | 0 → 8307 ms | the incline tilts 0°→24.23° (`param_ramp`, cause); block stays still the whole time (cause visibly precedes the effect by the full 8.3 s, satisfying Rule 32a with room to spare) | `param_ramp{theta}` | `param_ramp:{param:'theta',from:0,to:35,start_ms:0,end_ms:12000}` |
| S3 | ~6112 ms (sub-phase, still within the still window) | friction arrow phases IN once `f_s ≥ 15 N` | computed `f_s`, floor gate | `phases:[{id:'friction_appear', at_ms:'~6112'}]` — a real numeric threshold, not a fixed fraction; json_author computes this from θ(t) and pins the phase, not a hardcoded ms literal disconnected from the ramp rate |
| S3 | 8307 ms → halt (≈12430 ms) | block releases, slides down-slope (`translate-through`) while θ CONTINUES ramping to 35° (holds there from 12000 ms); `N`, `f`, `a` readouts recompute every frame from the live θ | `param_ramp{theta}` (still active until 12000 ms) + Branch A integrator | ramp + integrator, same frame loop |
| S3 | continuous, after halt | readouts hold their final (halted) values, θ held at 35° | — | halted-state readout trust (fix `bc649d4`) |
| S4 | 0 → 100% | A sits motionless at home pose (nothing to animate — the STILLNESS is the point, Rule 32b: only B's motion changes) | — | — |
| S4 | 0 → ~8594 ms | B (already moving at entry) accelerates down-slope, speeding up visibly (`two-fate-contrast`) until it reaches the run bound | `a = g(sinθ−μₖcosθ)` (fixed θ=22°) | `phases:[{id:'B_slide', at_ms:0}]` — no ramp this state, θ fixed |
| S4 | ~0% → ~50% (`glow-walk`, one focal at a time, Rule 32e) | `glow_focal` walks onto `nlb_arrow_B_friction` while B slides — the contrast-defining arrow | phases sequence | `phases:[{id:'glow_walk', at_ms:0, until_ms:'~50%', glow_focal:'nlb_arrow_B_friction'}]` |
| S4 | continuous, after B halts | `f`, `a`, `v` readouts hold (A's row stays at zero throughout, B's settles at its final values) | — | — |
| S5 | open, continuous, never auto-freezes (Rule 37) | all live sliders redraw every frame; `idle_auto_sweep` on θ (20°↔35°) runs until a trusted input seizes | `m, theta, mu_s, mu_k, v0` | `idle_auto_sweep:{param:'theta', range:[20,35]}` |

Rule 32 compliance: S2/S3 the tilt (cause) visibly precedes every arrow/readout response by construction
of the ramp itself (up to 8.3 s of lead in S3); S4's only moving element is B — A holds pose the entire
state (32b); S1's phased draw-in gives each new element its own ≥0.5–1 s gap; ONE glow_focal per state
(`nlb_comp_A_sin` S1, `nlb_arrow_A_friction` S2, `nlb_body_A` S3, `nlb_arrow_B_friction` S4, `nlb_body_A` S5).

---

## 6. Per-state control spec (Rule 31 — closed enum `m|m2|F|theta|mu_s|mu_k|v0`)

| S | `controls_visible` | validated against closed enum | effect of each live control |
|---|---|---|---|
| S1 | *(none)* | — matches architect table's `—` | static hook, nothing draggable |
| S2 | `["theta"]` | ✓ — but θ is driven by `param_ramp` during 1000–8000 ms; a trusted drag of the θ slider CANCELS the ramp (engine contract §7.1c) and hands control to the teacher immediately — narration should not assume the ramp always completes uninterrupted in a live classroom |
| S3 | `["mu_s"]` | ✓ — dragging `mu_s` live during the ramp shifts the break-away angle in real time (`θc = tan⁻¹(μₛ)`) since θc depends only on μₛ — a teacher can visibly move the break point earlier/later mid-tilt |
| S4 | `["mu_k"]` | ✓ — dragging `mu_k` live rescales B's acceleration (`a = g(sinθ−μₖcosθ)`) and, if pushed high enough (`μₖ ≥ tan22° = 0.404`), can make B decelerate/stop instead of speeding up — a real, physically valid outcome, not a bug |
| S5 | `["m","theta","mu_s","mu_k","v0"]` | ✓ ALL five authorable tokens for this concept (F excluded — no applied force in the approved arrow row, per skeleton) | full sandbox; `m` here visibly does NOT change `a` or the break-away angle (mass-cancellation, made explorable) |

Slider rows for every token this concept uses are built once and shown/hidden per state (engine-level,
reserved-slot pattern, Rule 32d) — the θ row occupies the same screen position across S2/S3/S5.

---

## 7. Physical constraints / correctness guards (Definition-of-Done, Gate 8/25/29/30)

1. **Sign convention:** `s` is signed along each body's own positive (up-slope) axis, matching the
   engine spec exactly; all narrated positions in §3 use up-slope-positive, down-slope-negative — a
   block "sliding down" has decreasing `s` and a friction force reported as a positive magnitude acting
   in the up-slope sense (opposing the slide), never a signed negative friction in the HUD.
2. **`STOP_EPS_V = 0.01 m/s`** governs the stick/slip transition: S1–S3 all start with `|v| < 0.01` and
   the stick branch (`|drive| ≤ maxStat`) correctly holds them until θ crosses θc; S4's body B is
   deliberately seeded at `|v0|=0.4 ≥ 0.01` so it enters the kinetic branch from frame 1 regardless of
   the (numerically stick-favourable) 22° geometry — this is the one state where the epsilon boundary
   is load-bearing, not incidental.
3. **Surface bound:** `surface.length_m: 7` bounds `s` at `±7`; S3's run is `4.5 → −7 = 11.5 m`, S4's
   B is `4.5 → −7 = 11.5 m` (same bound, same start, independently confirmed in §3). No pulley → no
   post-base bound scar applies (uncoupled body — CHAPTER_LOOP §7.2, carried).
4. **T = 0 everywhere in this concept.** No tension arrow, no `T` readout, no `pulley` block, no
   `hanging: true` body — this is deliberately the uncoupled single-/independent-body case (carried
   per skeleton §2 and CHAPTER_LOOP §7.2). A `T` symbol appearing anywhere in this concept's JSON is a
   authoring error.
5. **Model honesty (never claimed beyond the model's scope):** the block is treated as a rigid point
   mass — no tipping/toppling check, no rolling, no rotational inertia, ideal Coulomb friction
   (`f_s ≤ μₛN` exactly, `f_k = μₖN` exactly, no velocity-dependent friction, no static/kinetic
   crossover hysteresis beyond the simple `μₖ<μₛ` model). Narration must not imply the model predicts
   tipping or rolling — those are out of scope for this atomic claim (§1 of the skeleton).
6. **`f_s ≤ μₛN` always; `f_k = μₖN` always** — independently re-verified at every sampled instant in
   §3 (S1 16.76≤20.72; S2 16.76→19.54 ≤ 20.72→20.22; S3 up to 20.11 at break-away ≤ ceiling by
   definition; S4 A 18.36≤20.44).
7. **Break-away is mass-independent** (`tan θc = μₛ`, §1b derivation) — S3's/S5's narration and the
   `m` slider in S5 must make this explicit and explorable; a version of this concept where `m` visibly
   shifted the break-away angle would be a physics regression.
8. **`f_k < f_s,max` at the same θ** (kinetic friction is strictly weaker than the static ceiling,
   never merely "different") — confirmed at every θ sampled in S3/S4 (e.g. at θ=22°: `f_k=17.26 <
   f_s,max=20.44`).

---

## 8. Drill-down cluster phrasings (5 real student-voice phrases each)

**`tan_theta_equals_mu_threshold`**
- "why does it slip at exactly that angle and not before"
- "how is the tipping angle just tan of mu"
- "why does one number decide when it lets go"
- "is there a formula for the exact angle it starts sliding"
- "why does the angle where it slips depend only on mu"

**`mass_cancels_in_breakaway_angle`**
- "does a heavier block slip at a different angle"
- "why doesnt the weight change when it starts sliding"
- "shouldnt a bigger mass need a steeper tilt to slide"
- "why does mass drop out of the slipping angle formula"
- "if I double the mass does the block still slip at the same angle"

**`static_friction_maximum_vs_actual`**
- "is friction always at its maximum value"
- "why isnt static friction just mu times N all the time"
- "does friction only equal mu_s N right before it slips"
- "why does the friction number keep changing while it holds still"
- "is mu_s N a fixed force or just a limit"

**`kinetic_less_than_static`**
- "why does friction get weaker once it starts moving"
- "shouldnt friction stay the same once its already slipping"
- "why is sliding friction smaller than the friction that was holding it"
- "if it needed that much force to slip why does it need less now"
- "why does the grip not come back once it starts sliding"

**`a_equals_g_sin_minus_mu_cos`**
- "where does the minus mu cos theta come from in the acceleration"
- "why does the sliding acceleration have two parts instead of just g sin theta"
- "why does friction subtract from g sin theta instead of adding"
- "how do I know when to include the friction term in acceleration"
- "why isnt the acceleration on a slope just g sin theta like in physics class"

**`friction_direction_on_incline`**
- "why does friction point up the slope and not down"
- "does friction always oppose the direction something is moving"
- "how do I know which way to draw the friction arrow on an incline"
- "why does the friction arrow flip direction depending on which way its sliding"
- "does friction ever point down the slope"

---

**DC Pandey check:** consulted the Laws of Motion table of contents for scope only (friction on an
incline as its own sub-topic after FBD, per skeleton §9) — no formula, numeric example, teaching
sequence, or figure imported. Every number in this block was derived directly from `ΣF = ma` per body
and the engine's own Branch A pseudocode (`NEWTONS_LAWS_BODY_ENGINE_SPEC.md` §2), independently
re-verified by direct calculation and, for S3's mid-slide displacement, by numerical integration (two
independent schemes, both converging to the same answer) rather than by trusting the skeleton's
closed-form estimate.

---

## Board-mode / mode_overrides — DEFERRED (Rule 20 [D])

Not authored, per the active conceptual-only directive. No board mark scheme, no `mode_overrides`.

## EPIC-C branches — ZERO, per skeleton §2/§5.
