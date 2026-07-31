# PHYSICS BLOCK — `normal_force` (Laws of Motion, Class 11)

> Author: physics_author. Input: `docs/loop_runs/lom/normal_force/skeleton.md` (architect, 5 states,
> ENGINE GAP: none designed-in) + `docs/NEWTONS_LAWS_BODY_ENGINE_SPEC.md` §1/§2 (`newtons_laws_body`
> scenario, Branch A only — independent bodies, no `pulley`, no `hanging` body anywhere in this
> concept). `g = 9.8 m/s²` is the engine's hardcoded constant (`NLB_G`). Slider min/max/step are the
> engine's own shared `NLB_SLIDER_SPEC` (`field_3d_renderer.ts` ~L39164–39172) — not authorable
> per-concept — quoted verbatim below. Arrow rendering constants verified directly from source:
> `NLB_ARROW_SCALE = 0.048` world-units/N, `NLB_ARROW_MIN_LEN = 0.55`, `NLB_ARROW_MAX_LEN = 2.80`,
> `NLB_ARROW_EPS = 0.05` N (a force at or below this is a real zero and the arrow hides, never a
> stub — L38026‑38029). `NLB_SWEEP_MS = 4000` (one full there‑and‑back triangle, L39485) — a fixed
> engine constant, not authorable; every `idle_auto_sweep` timing decision below is computed against it.

**HARD CONSTRAINT re-confirmed from source (binding, per the dispatch brief's verified engine facts):**
`nlbNormal(b, thetaDeg) = b.m * NLB_G * Math.cos(thetaDeg*π/180)` exactly (L39915) — `applied_force_N`
never enters `N`. **N > mg is not expressible anywhere in this engine**, confirming skeleton §9
deferred-beat 1 is correctly designed around, not worked around. `idle_auto_sweep` has no
sandbox-only gate (`nlbRunIdleSweep`, L39486) — S1/S2's sweeps in guided states are valid as authored.
`param_ramp` exists (L39527) but is outside this concept's enumerated surface per skeleton §9.4 — one
recommendation given below (§5), the arc is not redesigned around it.

## Engine bug queue consultation (pre-authoring)

DB not reachable from this read-only authoring context (mirrors both sibling physics blocks). Applied
the same committed scar surface the architect and the two sibling physics blocks (`block_on_incline`,
`newton_first_law`) consulted:

- **Motion-bound / computed-placement scar:** S3's fall (+5→−7, 12 m, 1.56 s) and S4's A-slide
  (−5→+7, ≈4.69 s) are independently re-derived below (§3), not trusted blind.
- **Label-projection scar:** every state must author the shared `camera_position [0, 1.87, 9.1]`;
  json_author re-runs the Playwright projection probe for S3's θ=90° tall scene specifically — flagged
  again here since it is the one geometry genuinely different from the other four states.
- **HUD zero-stub scar:** S3's `N = 0.00` and S1's `F_net = 0.00` are TAUGHT values (the absence IS the
  lesson), never stubs — confirmed explicitly per state below.
- **Slider-row jump scar:** `controls_visible` row union for this concept = `['m','theta','F','v0']`;
  no `mu_s`/`mu_k` row is ever built (both coefficients are authored body constants only) — keeps the
  Rule 38b core-only explore cut trivial, exactly as the skeleton designed.
- **`idle_auto_sweep.range[0]` scar:** verified `range[0]` = the state's own seeded value in S1 (`m=5`),
  S2 (`theta=0`), S5 (`theta=0`) — re-confirmed in §2 below.
- **Zero-hides rule (engine §3):** S3's normal arrow relies on it deliberately (`NLB_ARROW_EPS`
  hides a real zero, never draws a stub) — re-verified against the exact source line above.
- **`default_variables_only_first_var_merged` (Bug #1 class):** every state's `bodies[]` block below is
  a complete, self-contained numeric object (`mass_kg`, `initial_position_m`, `initial_velocity_mps`,
  `mu_s`, `mu_k`, `applied_force_N` all explicit every state, per the `newton_first_law` precedent) —
  nothing is left to fall back to a prior state's leaked value or the engine's generic slider `def`.
- **`nlbSliderValueFromEngine` finding (new, this concept):** verified from source (`applyNewtonsLawsBodyState`,
  L39726‑39730) that a slider's DISPLAYED value at state entry is read from the state's own authored
  body field, never from `NLB_SLIDER_SPEC`'s generic `def` — so authoring `mass_kg: 5` for S1 correctly
  shows the `m` slider thumb at 5, not at the engine's generic default of 2. No exception needed, but
  worth recording since this concept's body defaults (5/4/8 kg) diverge from the engine's generic
  defaults (2/4 kg) more than either sibling concept's did.

No FLAG required beyond the two the architect already raised (§9.1 brief/spec conflict; the sibling
synonym decision) — both are the founder's/quality_auditor's, not physics_author's, to resolve.

**DC Pandey check:** consulted the Laws of Motion table of contents for scope only (normal
reaction/contact force as a common-forces sub-topic preceding the incline sections, per skeleton §"DC
Pandey check"). No formula, explanation, teaching sequence, or figure imported. Every number below is
derived directly from `N = mg·cos θ` / `ΣF = ma` per body and the engine's own stated Branch A
pseudocode (spec §2), independently re-verified by direct calculation.

---

## 1. `physics_engine_config`

### 1a. Variables

Engine-fixed `min`/`max`/`step` (from `NLB_SLIDER_SPEC`, not authorable per-concept). `default` below =
the value this concept's controlling state actually seeds the body/surface with at entry (per
`nlbSliderValueFromEngine`, confirmed above) — **not** the engine's own generic slider fallback, which
only matters if `slider_controls` is left unset AND no body field is authored (never the case here).

| symbol | name | unit | min | max | step | default (this concept) | maps to |
|---|---|---|---|---|---|---|---|
| `m` | mass of body A | kg | 0.5 | 10 | 0.5 | **5** (S1/S2/S3/S5); S4 uses fixed, non-slider `A=4`/`B=8` | `mass_a`, `#nlb_m_slider` — live only in S1 (sweeps) and S5 (free) |
| `m2` | mass of a second body | kg | 0.5 | 10 | 0.5 | **unused** | S4's body `B` is an independent Branch-A body (no `pulley`), authored as a fixed `mass_kg:8`, never wired to the `m2` slider token — row never built (mirrors `block_on_incline`'s and `free_body_diagram`'s reserved-unused pattern) |
| `theta` (θ) | surface tilt angle | ° | 0 | 60 | 1 | **0** (S1/S3 fixed at 0/90 resp.; S2/S5 sweep 0↔40) | `theta_deg`, `#nlb_theta_slider` — live only in S2 and S5 |
| `F` | applied push | N | −20 | 20 | 0.5 | **0** (S1–S3, S5 idle); **22** fixed in S4 body config, live-draggable in S4 via `controls_visible:['F']` | `applied_force`, `#nlb_f_slider` — live only in S4 |
| `mu_s` (μₛ) | static-friction coefficient | — | 0 | 1 | 0.05 | **0.9** (S1/S2 body A), **0.5** (S4 both bodies), **0** (S3/S5, frictionless) | authored body constant only — **no `mu_s` row is ever built this concept** (not in any state's `controls_visible`) |
| `mu_k` (μₖ) | kinetic-friction coefficient | — | 0 | 1 | 0.05 | **0.7** (S1/S2 body A), **0.45** (S4 both bodies), **0** (S3/S5, frictionless) | authored body constant only — same as `mu_s`, never a live row |
| `v0` | initial velocity | m/s | −5 | 5 | 0.5 | **0** everywhere in this concept | `initial_velocity_mps` — S5 only slider; S1–S4 seed velocity via each body's own field, always 0 |
| `g` | gravitational acceleration | m/s² | — | — | — | **9.8 (engine constant, `NLB_G`)** | hardcoded in `updateNewtonsLawsBodyFrame` / `nlbNormal` |
| `N` | normal reaction | N | — | — | — | derived | `m · g · cos(radians(theta))` — **never a function of `F`** (the confirmed engine fact) |
| `f` | friction magnitude | N | — | — | — | derived | `f_s` while sticking, `f_k = μₖN` once sliding |

**Slider-extreme sanity (S5 sandbox, `m/theta/F/v0` live, surface hard-frictionless):** `theta→0`
recovers `N=mg`, the S1 special case, exactly; `theta→40°` (S5's authored sweep ceiling) gives
`N=mg·cos40°`; `theta→60°` (the slider's own hard ceiling, beyond S5's authored idle-sweep range but
reachable by a manual drag) gives `N=mg·cos60°=0.5·mg` — still a legitimate, correctly-computed value,
never `0` (that only happens at 90°, which the S5 slider cannot reach — 90° is exclusively S3's fixed
pose); `F` dragged to any value in S5 changes the block's acceleration (frictionless, `a=F/m`) but
**never** the `N` readout — this is S5's final, wordless proof of the atomic claim; `m→0.5` or `m→10`
scales `mg`/`N` proportionally with no change to the qualitative story.

### 1b. Formulas

```json
"formulas": {
  "N": "m * g * cos(radians(theta))",
  "weight": "m * g",
  "drive": "F - m * g * sin(radians(theta))",
  "static_hold_condition": "abs(drive) <= mu_s * N",
  "friction_static": "-drive",
  "friction_kinetic": "mu_k * N",
  "max_static_friction": "mu_s * N",
  "a_moving": "(drive - sign(v_or_drive) * mu_k * N) / m",
  "a_static_hold": "0",
  "free_fall_distance": "0.5 * g * t^2",
  "free_fall_time": "sqrt(2 * d / g)"
}
```

All derived directly from `ΣF = ma` per body, matching `NEWTONS_LAWS_BODY_ENGINE_SPEC.md` §2 Branch A
line-for-line (`N_i = m_i*g*cos(theta_i)`, `drive_i = F_applied_i - m_i*g*sin(theta_i)`) — **no
approximation**, `F_applied` is confirmed absent from the `N` expression by direct source read (§0 above).

### 1c. `computed_outputs`

```json
"computed_outputs": {
  "N": "normal reaction, N — the surface's live answer to whatever presses into it",
  "f": "friction magnitude, N — f_s while sticking (S2/S4-B), f_k while sliding (S4-A)",
  "a": "acceleration, m/s^2 — 0 while resting/sticking, g while free-falling (S3), (drive+f)/m while sliding (S4-A)",
  "v": "speed, m/s",
  "F_net": "net force, N — 0 while sticking or at rest (S1/S2/S4-B), nonzero while sliding/falling"
}
```

### 1d. `constraints` (documentation-only, Physics Validator E25/E29/E30)

```json
"constraints": [
  "N = m*g*cos(theta) at all times — N is never a fixed 'm*g', only the flat-ground (theta=0) special case",
  "N is completely independent of any applied along-surface force F — F never enters the N expression, in this engine or in reality for a rigid flat/inclined contact",
  "N = 0 exactly at theta = 90 degrees — no press-in component of gravity remains, so the surface offers zero force",
  "f_s <= mu_s*N always; the reported friction never exceeds its own ceiling, and that ceiling itself scales with N, not with weight alone",
  "at theta = 0, N = m*g exactly, which is why the flat-ground belief 'N is always mg' is earned honestly before it is broken",
  "the block on a flat or inclined surface never sinks and never lifts off — N adjusts on demand to prevent both, an idealized-rigid-body constraint, not a computed compression"
]
```

---

## 2. Per-state variable overrides (full engine config — self-contained, no carried defaults)

**S1 — `rest_equilibrium`**
```json
"newtons_laws_body": {
  "mode": "rest_equilibrium",
  "surface": { "theta_deg": 0, "length_m": 7 },
  "bodies": [
    { "id": "A", "label": "m", "mass_kg": 5, "initial_position_m": 0, "initial_velocity_mps": 0,
      "mu_s": 0.9, "mu_k": 0.7, "applied_force_N": 0 }
  ],
  "arrows": [ { "body_id": "A", "show": ["weight", "normal"] } ],
  "readouts": ["N", "F_net"],
  "controls_visible": ["m"],
  "idle_auto_sweep": { "param": "m", "range": [5, 10] },
  "glow_focal": "nlb_arrow_A_weight",
  "phases": [ { "id": "glow_to_normal", "at_ms": 3500, "glow_focal": "nlb_arrow_A_normal" } ]
}
```
**Why each override:** `theta_deg:0` fixed (flat, the special case, never a slider row this state) ·
`mu_s:0.9`/`mu_k:0.7` authored on body A even though never load-bearing here (`drive=0` at θ=0
regardless of μ) — carried forward unchanged into S2 (Rule 32d continuity: "SAME rig, home pose") so no
downstream leak-guard is needed at S2's entry · `idle_auto_sweep.range:[5,10]` — `range[0]=5` is the
state's own seeded `mass_kg` (the scar: frame 1 must not step) · `initial_position_m:0` — body never
translates this state, only `m` changes, satisfying Rule 32b.

**S2 — `incline_decompose`**
```json
"newtons_laws_body": {
  "mode": "incline_decompose",
  "surface": { "theta_deg": 0, "length_m": 7 },
  "bodies": [
    { "id": "A", "label": "m", "mass_kg": 5, "initial_position_m": 2, "initial_velocity_mps": 0,
      "mu_s": 0.9, "mu_k": 0.7, "applied_force_N": 0 }
  ],
  "arrows": [ { "body_id": "A", "show": ["weight", "normal", "friction"], "show_components": true } ],
  "readouts": ["N"],
  "controls_visible": ["theta"],
  "idle_auto_sweep": { "param": "theta", "range": [0, 40] },
  "glow_focal": "nlb_arrow_A_normal"
}
```
**Why each override:** `theta_deg:0` authored explicitly as the state's OWN starting surface pose
(Rule 32d — identical to S1's home pose) even though the sweep immediately drives it; `range[0]=0`
matches, frame 1 doesn't step · `mass_kg:5, mu_s:0.9, mu_k:0.7` — unchanged from S1 (same rig) so the
block's stick/slip behavior through the 0–40° sweep is governed by the SAME coefficients the student
already saw in S1, never a silently different value · `initial_position_m:2` — a distinct in-scene
placement from S1's `0` (visual variety only; the block does not translate during this state — the
SURFACE tilts around it, satisfying Rule 32b: only θ, the taught variable, moves) · `friction` shown as
CONTEXT only (never named in the delta cue or formula overlay — `N = mg·cos θ` is the sole equation this
state teaches) — the friction/component arrows growing from zero below the ~15 N heuristic floor (§4)
is a documented, accepted caveat per skeleton, not a defect, since neither is ever the `glow_focal`.

**S3 — `incline_slide`**
```json
"newtons_laws_body": {
  "mode": "incline_slide",
  "surface": { "theta_deg": 90, "length_m": 7, "frictionless": true },
  "bodies": [
    { "id": "A", "label": "m", "mass_kg": 5, "initial_position_m": 5, "initial_velocity_mps": 0,
      "mu_s": 0, "mu_k": 0, "applied_force_N": 0 }
  ],
  "arrows": [ { "body_id": "A", "show": ["weight", "normal"] } ],
  "readouts": ["N", "a"],
  "controls_visible": [],
  "glow_focal": "nlb_arrow_A_weight"
}
```
**Why each override:** `mu_s:0, mu_k:0` are authored explicitly on the body **even though
`surface.frictionless:true` already hard-zeroes them engine-side** (`applyNewtonsLawsBodyState`,
`mu_s: frictionless ? 0 : (d.mu_s||0)`) — a defensive belt-and-braces override against the Bug #1 leak
class, identical in spirit to `newton_first_law` STATE_1's `frictionless:true` + explicit `mu_s:0`
pairing · `initial_position_m:5` (fresh from the +2 used in S2 — a deliberate reset, not a leak, since
S3 needs the FULL 12 m of fall room to the `−7` bound, and `+5` is this state's own authored seed) ·
`applied_force_N:0` explicit (no push in this concept's free-fall beat). **json_author verification
required** (per skeleton line 55): confirm θ=90° renders sanely under the shared camera; **authored
fallback if it misbehaves: `theta_deg:80`**, giving `N = 8.51 N` (recomputed, §3) with narration
adjusted to "almost vertical — N almost gone."

**S4 — `compare_mass_same_force`**
```json
"newtons_laws_body": {
  "mode": "compare_mass_same_force",
  "surface": { "theta_deg": 0, "length_m": 7 },
  "bodies": [
    { "id": "A", "label": "m₁", "mass_kg": 4, "initial_position_m": -5, "initial_velocity_mps": 0,
      "mu_s": 0.5, "mu_k": 0.45, "applied_force_N": 22 },
    { "id": "B", "label": "m₂", "mass_kg": 8, "initial_position_m": -5, "initial_velocity_mps": 0,
      "mu_s": 0.5, "mu_k": 0.45, "applied_force_N": 22 }
  ],
  "arrows": [
    { "body_id": "A", "show": ["weight", "normal", "applied", "friction"] },
    { "body_id": "B", "show": ["weight", "normal", "applied", "friction"] }
  ],
  "readouts": ["N", "f"],
  "controls_visible": ["F"],
  "glow_focal": "nlb_arrow_B_normal",
  "phases": [
    { "id": "push_reveal", "at_ms": 0, "until_ms": 1500, "glow_focal": "nlb_arrow_A_applied" },
    { "id": "grip_reveal", "at_ms": 1500, "glow_focal": "nlb_arrow_B_normal" }
  ]
}
```
**Why each override:** both bodies seeded at the IDENTICAL `initial_position_m:-5` and `applied_force_N:22`
— the "same push" claim is load-bearing, not decorative; a mismatched seed here would silently break
the entire teaching point · `mu_s:0.5, mu_k:0.45` explicit on BOTH bodies (fresh values, unrelated to
S1/S2's 0.9/0.7 — a brand-new two-body rig, never a leak since `bodies[]` is fully self-contained per
state) · **glow design note:** the engine allows exactly ONE `glow_focal` id at any instant (Rule 32e);
the skeleton's motion-budget text calls for "the two equal applied arrows" to be named together at
0–1500 ms — since the engine cannot glow two ids simultaneously, this is authored as a single glow on
`nlb_arrow_A_applied` for that window (A and B's applied arrows are visually identical in length/value,
so glowing one legibly stands for "the same push on both" while the narration says so explicitly),
handing off at 1500 ms to the state's real teaching punchline, `nlb_arrow_B_normal` — **the big N that
saves B**. json_author: implement exactly as the two-phase array above, never a simultaneous dual-glow.

**S5 — `sandbox`**
```json
"newtons_laws_body": {
  "mode": "sandbox",
  "surface": { "theta_deg": 0, "length_m": 7, "frictionless": true },
  "bodies": [
    { "id": "A", "label": "m", "mass_kg": 5, "initial_position_m": 0, "initial_velocity_mps": 0,
      "mu_s": 0, "mu_k": 0, "applied_force_N": 0 }
  ],
  "arrows": [ { "body_id": "A", "show": ["weight", "normal", "net"], "show_components": true } ],
  "readouts": ["N", "a", "v", "F_net"],
  "controls_visible": ["m", "theta", "F", "v0"],
  "trusted_drag_seizes": true,
  "idle_auto_sweep": { "param": "theta", "range": [0, 40] },
  "glow_focal": "nlb_body_A"
}
```
**Why each override:** `mu_s:0, mu_k:0` explicit + `surface.frictionless:true` (belt-and-braces, same
pattern as S3) — matches skeleton's explicit Rule 38b design choice (no μ row this concept's explore
state, core-ring only) · `initial_position_m:0` centred — maximizes drag travel room either direction ·
`net` arrow authorable (engine hides a genuine zero live) — this is the ONE state where `net` is ever
shown, per skeleton line 57. No further `variable_overrides` needed: every guided state's narrated
number below is produced by exactly the §1b formulas at these listed inputs — none require a defensive
lock against an upstream default leak beyond the belt-and-braces `mu_s`/`mu_k` zeros already justified
(S3/S5) and the two bodies' independence in S4 (justified above).

---

## 3. Per-state numeric worksheet — independently re-derived, checked against the skeleton's claims

All values `g = 9.8`, 4 s.f. where relevant.

**S1 (θ=0, m sweeps 5↔10 kg):**
`mg` at `m=5`: `5 × 9.8 = 49.00 N` — **CONFIRMED** (skeleton: 49.0). At `m=10`: `10 × 9.8 = 98.00 N` —
**CONFIRMED** (skeleton: 98.0). `N = mg·cos0° = mg` exactly at every point of the sweep (cos 0 = 1) —
tracks in perfect lockstep by construction, no rounding involved. `F_net = 0.00` throughout (drive = 0
regardless of `m`, since `theta=0` ⇒ `sin θ=0`) — the taught value, not a stub.

**S2 (θ sweeps 0↔40°, m=5, μₛ=0.9, μₖ=0.7 fixed):**

| θ | `N = mg·cos θ` | `mg·sin θ` (drive/`f_s`) | ceiling `μₛN` | margin (N) |
|---|---|---|---|---|
| 0° | 49.00 | 0.00 | 44.10 | 44.10 |
| 17.83° (mg·sinθ crosses 15 N) | 46.64 | 15.00 | 41.98 | 26.98 |
| 40° (sweep peak) | 37.54 | 31.50 | 33.79 | **2.29** |

`N` at 40°: `49 × cos40° = 49 × 0.766044 = 37.5362 N` → **37.54 N**, skeleton claimed 37.5 —
**CONFIRMED** (3 s.f. match; 37.54 is the 4-s.f. figure). `mg·sinθ` at 40°: `49 × sin40° = 49 ×
0.642788 = 31.4966 N` → **31.50 N**, skeleton claimed 31.5 — **CONFIRMED**. Ceiling `μₛN = 0.9 ×
37.5362 = 33.7826 N` → **33.78 N**, skeleton claimed 33.8 — **CONFIRMED**. No-slip margin `33.7826 −
31.4966 = 2.2860 N` → **2.29 N**, skeleton claimed 2.3 — **CONFIRMED** (rounds to the same figure).

**Critical angle check (why 40°, not further):** `θc = tan⁻¹(μₛ) = tan⁻¹(0.9) = 41.99°`. The skeleton's
own reasoning ("not swept to 42°, where tan θ = 0.90 makes the margin float-fragile") is **independently
confirmed**: `tan(42°) = 0.9004 ≈ μₛ` — 42° sits essentially AT the break-away angle for this body's own
`μₛ=0.9`. Capping the sweep at 40° leaves a genuine, non-fragile 1.99° / 2.29 N buffer on both the
angle axis and the force axis. `F_net = 0.00` throughout the entire sweep (the block never slides) — the
held proof this state's formula overlay names.

**S3 (θ=90° fixed, m=5, frictionless):**
`N = mg·cos90° = 49 × 0 = 0.00 N` — **exact**, not a rounding artifact (cos 90° = 0 exactly in the
engine's own floating-point terms up to machine epsilon). `mg = 49.00 N` unchanged (weight never
depends on θ). Free fall: `drive = 0 − mg·sin90° = −49.00 N`, `a = drive/m = −49.00/5 = −9.80 m/s² = −g`
exactly (frictionless ⇒ no resistance term) — the engine reproduces free fall with zero special-casing,
matching the atomic claim ("the block falls at full g"). Fall distance: `+5 → −7` bound = **12.00 m**.
`t = √(2×12/9.8) = √2.4490 = 1.5649 s` → **1.56 s**, skeleton claimed 1.56 s — **CONFIRMED exactly**.

**Fallback pose (θ=80°, if 90° misbehaves visually):** `N = 49 × cos80° = 49 × 0.173648 = 8.509 N` →
**8.51 N**, skeleton claimed 8.5 — **CONFIRMED**.

**S4 (θ=0, A: m=4 kg, B: m=8 kg, both μₛ=0.5/μₖ=0.45, both F=22 N):**
`mg_A = 4×9.8 = 39.20 N`, `mg_B = 8×9.8 = 78.40 N` — **CONFIRMED** (skeleton: 39.2/78.4). At θ=0,
`N=mg` exactly for both: `N_A=39.20 N`, `N_B=78.40 N`.

Ceiling A: `μₛN_A = 0.5 × 39.20 = 19.60 N`. Applied `22.00 N > 19.60 N` ⇒ **A slides** — **CONFIRMED**
(skeleton: 19.6 < 22). Ceiling B: `μₛN_B = 0.5 × 78.40 = 39.20 N`. Applied `22.00 N ≤ 39.20 N` ⇒
**B holds** — **CONFIRMED** (skeleton: 22 ≤ 39.2).

`f_k,A = μₖN_A = 0.45 × 39.20 = 17.64 N` — **CONFIRMED exactly** (skeleton: 17.64; μₖ=0.45 was chosen
precisely so this arrow clears the readability floor, confirmed in §4). `drive_A = F − mg_A·sin0° =
22.00 − 0 = 22.00 N`. Once sliding, `f = −vSign·μₖN_A = −17.64 N` (opposing motion), `a_A = (22.00 −
17.64)/4 = 4.36/4 = 1.09 m/s²` — **CONFIRMED exactly** (skeleton: 1.09 m/s²). A's net force
`ΣF_A = 4.36 N` (sub the readability floor, correctly never shown — §4).

`f_B` (holding, static) `= |drive_B| = |22.00 − 0| = 22.00 N` pinned — **CONFIRMED** (skeleton: f
pinned 22.0), `a_B = 0`, `v_B = 0` for the entire state.

A's travel: `−5 → +7` bound = **12.00 m** from rest at `a=1.09 m/s²`: `t = √(2×12/1.09) = √22.018 =
4.6924 s` → **4.69 s**, skeleton claimed ≈4.7 s — **CONFIRMED**.

**No corrections were required anywhere in this worksheet** — every skeleton-claimed number
(49.0/37.5/39.2/78.4/17.64/22.0/1.09/1.56, plus 33.8/2.3/8.5/19.6/39.2/4.7) is independently reproduced
here to 4 significant figures with no arithmetic discrepancy, unlike the sibling `block_on_incline`
worksheet which found two minor rounding corrections. The skeleton's arithmetic for this concept is
airtight.

---

## 4. Arrow-magnitude floor audit

Two thresholds, both derived from source, not guessed: the engine's own hard clamp
(`NLB_ARROW_MIN_LEN/NLB_ARROW_SCALE = 0.55/0.048 = 11.46 N`, below which every visible force renders at
the SAME minimum length regardless of true magnitude) and the block_on_incline-established readability
heuristic of **≥15 N** for any arrow meant to visibly grow/shrink (a conservative buffer above the
11.46 N clamp, "the concept-2 lesson," inherited here as house style).

| state | arrow | value(s) across the state | floor status |
|---|---|---|---|
| S1 | weight `mg` | 49.00 → 98.00 N | ✓ |
| S1 | normal `N` | 49.00 → 98.00 N (tracks `mg`) | ✓ |
| S2 | weight `mg` | 49.00 N constant | ✓ |
| S2 | normal `N` | 49.00 → 37.54 N | ✓ (never dips near either threshold) |
| S2 | `mg·sinθ` / friction (CONTEXT arrows) | 0 → 31.50 N | sub-15N-heuristic below θ≈17.83°; **accepted per skeleton** — never the `glow_focal`, growing honestly from a real zero, not gated (unlike `block_on_incline`'s S3 phase-gate mitigation, which was needed there because friction WAS a load-bearing focal quantity — here it is deliberately context-only) |
| S3 | weight `mg` | 49.00 N constant | ✓ |
| S3 | normal `N` | 0.00 N | N/A — correctly HIDDEN by the engine's zero-hides rule; the absence IS the visual (matches `newton_first_law` S1 precedent) |
| S4 | A: weight / normal / applied / friction | 39.20 / 39.20 / 22.00 / 17.64 N | ✓ all four clear 15 N — `μₖ=0.45` was chosen precisely so A's kinetic arrow (17.64 N) clears the floor, **confirmed** |
| S4 | B: weight / normal / applied / friction | 78.40 / 78.40 / 22.00 / 22.00 N | ✓ all four clear 15 N |
| S4 | `net` (never shown, guided) | peaks at `ΣF_A=4.36 N` | N/A — correctly hidden (sub-floor), per skeleton |
| S5 | weight / normal (live, teacher-driven) | depends on `m`/`theta` drag; e.g. `m=0.5, theta=60°` → `N≈2.45 N` | at extreme slider settings the arrow renders at the engine's own minimum clamped length — an EXPECTED sandbox behavior at the control extremes, not a narrated moment, so the 15 N heuristic does not apply (matches the un-narrated nature of every sandbox state in this fleet) |

**No arrow fails the readability floor in any GUIDED state's narrated moment.** The one accepted
sub-floor case (S2's context arrows below θ≈17.83°) is a documented design choice inherited unchanged
from the skeleton, not a defect requiring mitigation, since those arrows are never the teaching focal.

---

## 5. Within-state motion timeline + per-state control spec (Rule 26/31/32)

**Sweep-cycle accounting (engine fact 3 — `NLB_SWEEP_MS = 4000` ms, fixed, not authorable):**
- **S1 (~12 s dwell):** `12000 / 4000 = 3` exact triangle cycles. Sweep: `m` 5→10→5→10→5→10→5 kg,
  returning to the home value (5 kg) at the exact moment the state's dwell ends — a clean handoff into
  S2's own home pose, though S2 re-seeds `m=5` explicitly regardless (no dependency on this landing).
- **S2 (~14 s dwell):** `14000 / 4000 = 3.5` cycles. Triangle phase at `t=14000`: `u = (14000 mod
  4000)/4000 = 2000/4000 = 0.5` → `tri=1` (the engine's `u<0.5 ? u*2 : 2-u*2` branch evaluates to `1` at
  `u=0.5`) → **θ lands at exactly 40°, the sweep's peak, at the instant the state's dwell ends.** This is
  a favorable coincidence, not a coincidence to rely on blindly: json_author should verify the review
  player's frozen final frame for S2 genuinely captures this peak-tilt pose (`N=37.54 N`, margin `2.29
  N` still intact) rather than a mid-descent frame, by confirming the exact narration/dwell duration
  resolves to `14000 ms ± ~50 ms` — the sensitivity here is real (a dwell of `13000 ms` instead would
  land at `u=0.25→tri=0.5→θ=20°`, a much less dramatic frozen frame).

| S | t-window | what animates (pure fn of state clock) | driven by | live control(s) |
|---|---|---|---|---|
| S1 | 0–12000 ms, continuous, 3 exact cycles | `m` triangle-sweeps 5↔10 kg; weight AND normal arrow lengths rescale in lockstep every frame (`N` tracks `mg` exactly since θ=0); `N` readout co-varies 49.00↔98.00; `F_net` pinned 0.00 throughout | `m` (idle sweep) | `m` (trusted drag seizes the sweep for the rest of the state, per `nlbRunIdleSweep`'s `PM_nlbSweepSeized` latch) |
| S1 | 0–3500 ms | `glow_focal` sits on `nlb_arrow_A_weight` (the belief being earned) | phase default | — |
| S1 | 3500 ms→end | `glow_focal` hands off to `nlb_arrow_A_normal` (the arrow that will detach in S2) | `phases[0]` | — |
| S2 | 0–14000 ms, continuous, 3.5 cycles | the SURFACE tilts 0↔40° (`idle_auto_sweep{theta}`); weight arrow stays vertical and fixed at 49.00 N (only the taught variable, θ, changes pose — Rule 32b); `N` arrow shrinks/grows 49.00↔37.54 N in the SAME frame the tilt happens (continuous "oscillate/track" archetype — cause and effect co-move from t=0, the declared exception to the 32a discrete-event gap, exactly as `newton_first_law`'s S2 precedent argues); dashed components + context friction arrow re-derive live every frame | θ (idle sweep) | `theta` (trusted drag seizes) |
| S2 | continuous | `N` readout updates every frame; block position (`s=+2`) never changes — the surface rotates, the body does not translate | computed `N` | — |
| S3 | 0–8307 ms window (analogous to S3's own dwell — see below) | at THIS state's entry θ is fixed at 90° from frame 1 (no ramp — a snap, per skeleton's designed-around limitation), so `N=0.00` reads from frame 1 (cause: the vertical pose, precedes the fall by the whole pre-release beat — Rule 32a satisfied with room to spare) | fixed θ=90° | none |
| S3 | 0–1565 ms | block free-falls `s: +5 → −7` (`translate-through`), `a=−9.80 m/s²` constant, `N=0.00` and weight `49.00 N` both hold their (taught) values throughout the fall | integrator, frictionless Branch A | none |
| S3 | 1565 ms→end (≈10 s dwell − 1.56 s fall ≈ 8.44 s held) | block rests at the `−7` bound; readouts hold their final values (halted-state readout trust, `bc649d4` precedent) | halt | none |
| S4 | 0–1500 ms | `glow_focal` sits on `nlb_arrow_A_applied` (both A's and B's identical 22.00 N push arrows are visible; A's glows to stand for "the same push," per the single-glow design in §2) — apparatus otherwise static (Rule 32b: nothing else moves yet) | `phases[0]` | none |
| S4 | 0–4692 ms | body B accelerates down-lane (`a=1.09 m/s²` from rest) while A sits motionless the whole state (Rule 32b — only ONE body's motion changes; here it's B that moves and A that holds, the inverse framing of the block_on_incline echo, since here the SMALL-N body is the one that slides) | Branch A integrator | none, until `F` slider drags |
| S4 | 1500 ms→end | `glow_focal` hands off to `nlb_arrow_B_normal` — the teaching punchline, "the big N that saves B" — B's held stillness and its large N arrow are both on screen together | `phases[1]` | `F` |
| S4 | continuous | `N`, `f` readouts (4 rows, A/B × N/f) hold correctly: A's `f` reads `17.64` once sliding, B's `f` stays pinned `22.00` the entire state; dragging `F` live re-splits the fates per the ceilings computed in §3/§7 | computed | `F` |
| S5 | open, continuous, never auto-freezes (Rule 37) | `idle_auto_sweep{theta}` (0↔40°) drives the block's `N` reading live until a trusted drag/slider seizes; teacher can drag `m`, tilt `theta`, push `F`, or seed `v0` — every readout (`N,a,v,F_net`) recomputes every frame; `net` arrow shown live (engine hides it if genuinely zero) | all sliders / idle sweep | `m, theta, F, v0` (ALL core-ring tokens; no `mu_s`/`mu_k` row exists — Rule 38b) |

**Rule 32 compliance summary:** S1's cause (mass) and effect (both arrows + readout) co-move from
t=0 under the DECLARED contrast-pair archetype with S2; S2's cause (tilt) and effect (`N` detaching)
likewise co-move under the same declared archetype (matching the `newton_first_law` S2 precedent for
continuously-acting causes); S3's cause (the vertical snap) precedes the fall by the entire pre-release
window; S4's cause (the identical push, glow-revealed 0–1500 ms) precedes the reading of the fate-split
by a full 1.5 s gap — a genuine discrete-event gap, correctly NOT collapsed to t=0 since S4 is a
`two-fate-contrast`, not an `oscillate/track` state. Exactly ONE `glow_focal` id active at any instant
in every state (S1/S4's phase handoffs are sequential, never simultaneous — confirmed against the
single-glow engine constraint in §2's S4 design note).

**Recommendation (not a redesign — engine fact 4):** `param_ramp` (a one-shot monotonic reveal, already
shipped and exercised by `block_on_incline` S2/S3) would let S3 show the CONTINUOUS approach to
vertical (e.g. `param_ramp{theta, from:0, to:90, start_ms:0, end_ms:6000}`) rather than the current
fixed-θ=90° snap, letting a student watch `N` shrink to zero continuously rather than starting there.
This is a genuine, available upgrade — flagged for founder consideration, not authored here, since the
skeleton explicitly scoped S3 as a snap (§9.4) and the assignment is to formalize the skeleton's arc,
not redesign it.

---

## 6. Per-state control spec (Rule 31 — closed enum `m|m2|F|theta|mu_s|mu_k|v0`)

| S | `controls_visible` | matches architect table | effect of each live control |
|---|---|---|---|
| S1 | `["m"]` | ✓ | dragging `m` (0.5–10 kg) rescales `mg`/`N` together in real time and CANCELS the idle sweep (`PM_nlbSweepSeized`) — the lockstep tracking becomes teacher-driven instead of automatic, same physics either way |
| S2 | `["theta"]` | ✓ | dragging `theta` (the slider's own full 0–60° range, wider than the authored 0–40° idle-sweep window) live-detaches `N` from `mg`; pushing past ~42° would cross this body's own `θc=tan⁻¹(0.9)=41.99°` and the block would begin sliding — narration should not claim the block "never" slides at ANY angle, only within the authored 0–40° demonstration range (a teacher dragging past 42° sees a real, physically valid slip, not a bug) |
| S3 | *(none)* | ✓ — matches architect's `[]` | watch-only beat; nothing draggable while the fall plays |
| S4 | `["F"]` | ✓ | dragging `F` (−20 to 20 N) re-splits the fates live: `F<19.60 N` both hold, `19.60 ≤ F ≤ 39.20 N` the fates split exactly as narrated, `F>39.20 N` both slide (and at `F<0`, both bodies would slide in reverse — a real, physically valid, unnarrated case a curious teacher might discover) |
| S5 | `["m","theta","F","v0"]` | ✓ — ALL four CORE-ring tokens (no `mu_s`/`mu_k` row exists this concept, so "ALL" here correctly means all four, not five) | full sandbox; `F` visibly changes acceleration and velocity but **never** the `N` readout — the concept's final, wordless proof |

Slider rows for every token this concept ever uses (`m, theta, F, v0`) are built once and shown/hidden
per state (engine-level reserved-slot pattern, Rule 32d) — each occupies the same screen position across
every state that shows it.

---

## 7. Physical constraints / correctness guards (Definition-of-Done, Gate 8/25/29/30)

1. **`N` is never a function of `F`** — confirmed by direct source read of `nlbNormal()` (§0). This is
   the exact reason skeleton §9 deferred beat 1 (press-down → N>mg) is correctly out of scope, and S5's
   final proof (`F` changes `a`/`v` but never `N`) is physically airtight, not merely narratively
   convenient.
2. **S2's no-slip margin at θ=40°:** `μₛN=33.78 N` vs `mg·sinθ=31.50 N`, margin `2.29 N` — **verified**
   (§3). The sweep is correctly capped below `θc=41.99°` with a genuine, non-float-fragile buffer.
3. **S4's fate-split force window:** `F<19.60 N` both hold; `19.60 N ≤ F ≤ 39.20 N` the fates split
   (A slides, B holds); `F>39.20 N` both slide — **verified** against both bodies' independently
   computed ceilings (§3).
4. **`STOP_EPS_V = 0.01 m/s`** governs stick/slip transitions; every guided body in this concept starts
   at `v0=0` (well inside the stick regime at entry for S1/S2/S3-pre-fall/S4-B), and S4's body A enters
   the SLIDE branch on frame 1 not because of a seeded nonzero velocity but because `|drive_A|=22.00 N
   > maxStat_A=19.60 N` from t=0 — no epsilon-boundary fragility here (unlike `block_on_incline`'s S4,
   which needed a deliberately nonzero `v0` to force the kinetic branch; this concept's A genuinely
   fails the static test outright, no override needed).
5. **Model honesty:** the block is treated as a rigid point mass on an idealized rigid surface — no
   deformation, no compression-based derivation of `N` (the surface "answers" instantaneously and
   exactly; this is the correct idealization for this atomic claim, and narration must not imply the
   surface physically flexes or measures anything).
6. **`f_s ≤ μₛN` always; `f_k = μₖN` always** — re-verified at every sampled instant in §3 (S2:
   `31.50 ≤ 33.78` at the sweep peak; S4-A: kinetic `17.64 N` fixed by the ceiling formula; S4-B:
   `22.00 ≤ 39.20`).
7. **`N=0` occurs ONLY at θ=90°** in this concept (S3) — never elsewhere, never as a stub. Every other
   guided state's `N` is a real, computed, nonzero value.
8. **Float-fragile boundary avoided:** the S2 sweep stops at 40°, ~2° short of this body's own
   `θc=41.99°` — re-confirmed independently in §3, not merely trusted from the skeleton.

---

## 8. Drill-down cluster phrasings (5 real student-voice phrases per cluster_id)

**`n_equals_mg_conditions`** (S2)
- "when is N actually just mg"
- "is N always equal to mg or only sometimes"
- "does N equal mg only on flat ground"
- "why did N equal mg before but not now"
- "is flat ground the only time N is mg"

**`mg_cos_theta_geometry`** (S2)
- "why is it mg cos theta and not just mg"
- "why does only part of gravity press into the incline"
- "where does the cos theta actually come from"
- "why does tilting change how much gravity presses in"
- "why isnt the whole weight pressing into the tilted surface"

**`why_the_block_never_sinks`** (S2)
- "why doesnt the block just sink into the surface a little"
- "how does the surface know how hard to push back"
- "is the surface actually squishing to create N"
- "why is N always exactly enough and never too much"
- "does the surface calculate the force somehow"

**`grip_ceiling_mu_n`** (S4)
- "why is there a maximum amount of friction"
- "why does the grip limit depend on N and not just weight"
- "whats stopping friction from being unlimited"
- "why is mu_s times N the biggest friction can get"
- "does friction have some kind of ceiling"

**`heavier_is_harder_to_slide`** (S4)
- "why is a heavier box harder to push across the floor"
- "does a full box really need more force to start sliding"
- "why do i have to push harder on the heavy box"
- "is it just the weight thats making it harder to slide"
- "why does loading a box make it grip the floor more"

**`normal_vs_weight_in_friction_formulas`** (S4)
- "why do some formulas use mg for friction and others use N"
- "is f equals mu mg always correct"
- "when does mu times mg stop being the right formula"
- "why cant i just use weight instead of N in friction"
- "why does the friction formula change on a tilted surface"

---

## 9. Narration scripts (`text_en` only — Rule 30i, English-only product; no `text_te`)

**S1** (42 EN words, within 35–50 budget) — delta cue "Floor answers weight exactly", formula
`ΣF = 0 ⇒ N = mg`:
"Watch the normal force N as mass changes — on this flat floor, N always matches weight mg exactly,
heavier block, bigger push back. Keep your eye on the word flat: this exact match is about to break
the moment the floor tilts."

**S2** (50 EN words, within 45–55 budget) — delta cue "Tilt — N drops below mg", formula
`N = mg·cos θ`:
"Now the floor tilts. Weight mg stays exactly vertical, but normal force N shrinks — it is mg times
cos theta, only the part of gravity pressing into the surface. Yet the block never sinks: N was never
a fixed number, only the exact answer to how hard something presses in."

**S3** (41 EN words, within 30–45 budget) — delta cue "Vertical — N is zero", formula
`θ = 90° ⇒ N = 0`:
"Tilt the surface all the way to vertical. Nothing presses into it anymore, so normal force N reads
zero — watch it happen before the fall. With nothing pushing back, gravity is unbalanced, and the
block drops at the full acceleration g."

**S4** (54 EN words, within 45–55 budget) — delta cue "Grip ceiling rides on N", formula
`f_max = μₛ·N`:
"The same twenty-two newton push acts on both blocks. The light block's N is small, so its grip
ceiling — mu_s times N — is easily beaten, and it slides. The heavy block's N is far larger, so the
identical push never beats its ceiling: it never budges. Grip always rides on N, not weight."

**S5** — 0 words / open, per Rule 31 explore-state convention.

**Rule 35 check:** no country-specific places, brands, currency, or names anywhere — pure apparatus
language throughout (the "bathroom scale" and "storage box" anchors live in the skeleton's real-world
anchor section, referenced by the teacher, not embedded in on-screen narration text here). **Rule 30
check:** every bare symbol expanded on first use (`N`→"normal force N", `mg`→"weight mg", `θ`→"theta",
`μₛ`→"mu_s", `ΣF`→ not used in narration text directly, reserved for the formula overlay only).

**Aha-moment physics check (v2.3 alignment):** the PRIMARY aha ("the floor's push is an on-demand
answer, not a stored number") is physically TRUE and is exactly what S2's `N`-detaching-from-`mg`
demonstration shows (verified §3). The SUPPORTING aha ("a contact force can die completely at θ=90°")
is physically TRUE and is exactly S3's `N=0.00` result (verified §3, cos 90°=0 exactly). Both
`misconception_watch` one-liners (§5 of the skeleton) are physically correct as written: S2's "N equals
whatever presses INTO the surface — mg·cos θ here — never automatically mg" and S1's "N and mg balance
by Newton's SECOND law here; N's third-law twin acts on the floor" are both standard, correct mechanics
statements — no physics correction needed to either.

---

## 10. Delta cues + formula overlays (Rule 32c/34a/34b — matches skeleton's control table exactly)

| state | on-canvas delta cue (≤5 words) | formula overlay (ONE Unicode surface) |
|---|---|---|
| S1 | "Floor answers weight exactly" | ΣF = 0 ⇒ N = mg |
| S2 | "Tilt — N drops below mg" | N = mg·cos θ |
| S3 | "Vertical — N is zero" | θ = 90° ⇒ N = 0 |
| S4 | "Grip ceiling rides on N" | f_max = μₛ·N |
| S5 | "All yours" | N = mg·cos θ |

(json_author renders with real Unicode glyphs per Rule 34c: Σ = U+03A3, ⇒ = U+21D2, ° = U+00B0, θ =
U+03B8, μₛ/μₖ = U+03BC + subscript s/k — written ASCII-safe here for this markdown handoff only, per
the `newton_first_law` precedent.)

---

## 11. Board-mode / `mode_overrides` — SKIPPED (Rule 20 [D])

Not authored, per the active conceptual-only directive. No board mark scheme, no `mode_overrides`, for
any state.

## 12. EPIC-C branches — ZERO, per skeleton §2/§5.

---

## 13. Self-review checklist

- [x] Every symbol in the state narratives (N, mg, θ, μₛ, μₖ, F, m, ΣF, g) appears in `variables`.
- [x] Every formula uses `radians(theta)` for the angle argument (per PM_interpolate convention).
- [x] Every state's live control(s) match the architect's control table exactly (S1 `m`, S2 `theta`,
      S3 none, S4 `F`, S5 all four core-ring tokens).
- [x] `variable_overrides` documented for all five states, each justified (defensive belt-and-braces
      for S3/S5's `mu_s:0/mu_k:0`; genuine two-body independence for S4; continuity for S1/S2).
- [x] Board mark scheme: SKIPPED (Rule 20 [D]), nothing authored (§11).
- [x] Drill-down phrasings: 5 per cluster × 6 clusters, real student voice, no teacher-prose.
- [x] `constraints` block: 6 short factual assertions.
- [x] Numerical sanity checks run for all five states, all skeleton-claimed numbers independently
      re-derived and CONFIRMED with no arithmetic discrepancy (§3).
- [x] Within-state motion timeline written for every state; no two states share a motion (S1 lockstep
      track, S2 detach track, S3 null-then-fall, S4 two-fate-contrast, S5 drag-sandbox); no static state.
- [x] Rule 32 sequencing verified: S1/S2 co-move under the declared `oscillate/track` continuous-cause
      archetype (matches the `newton_first_law` S2 precedent for legitimacy); S3's cause (the vertical
      pose) precedes the fall by the full pre-release window; S4's cause (the push, glow-revealed) opens
      a genuine 1.5 s gap before the fate-split reads.
- [x] Word budget: S1=42 (35–50), S2=50 (45–55), S3=41 (30–45), S4=54 (45–55), S5=0/open — all compliant.
- [x] Notation ladder (Rule 38c): every formula surface is algebra-only (`N=mg·cos θ`, `f_max=μₛ·N`,
      `ΣF=0⇒v/N` forms) — no calculus, no vector operators, anywhere; no advanced-ring states exist in
      this concept (declared empty per skeleton §2), so no exception needed.
- [x] Dialect (Rule 38d): no board-divergent term requiring a dual-label appears in this concept ("N",
      "normal force", "friction", "weight" are universal across CBSE/JEE/CIE/IB phrasing).
- [x] Engine bug queue consulted; all relevant prevention rules satisfied, no exception needed beyond
      the two founder/quality_auditor flags the architect already raised.
- [x] DC Pandey check: no import — all formulas derived from `N=mg·cos θ` / `ΣF=ma` plus the engine's
      own stated Branch A pseudocode; no teaching method/example/figure imported.
- [x] Engine fact 1 (N never depends on F) respected throughout — no press-down beat reintroduced.
- [x] Engine fact 3 (`NLB_SWEEP_MS=4000` fixed) — cycle counts computed explicitly for S1 (3 cycles)
      and S2 (3.5 cycles, landing the frozen frame at θ=40° — flagged for json_author verification).
- [x] Engine fact 4 (`param_ramp` exists but unused) — one-line recommendation given for S3 (§5),
      arc not redesigned around it.

---
**Handoff: json_author** — build `src/data/concepts/normal_force.json` per this physics block plus the
architect skeleton, using the `newtons_laws_body` scenario blocks in §2/§5/§10 verbatim. Two
verification items carried forward explicitly: (1) the shared `camera_position [0, 1.87, 9.1]` against
S3's θ=90° tall scene (Playwright projection probe, recalibrate the ONE shared distance if it clips,
never per-state); (2) confirm the review player's S2 dwell resolves to `14000 ms ± ~50 ms` so the frozen
final frame lands at the sweep's θ=40° peak, not a mid-descent frame (§5).
