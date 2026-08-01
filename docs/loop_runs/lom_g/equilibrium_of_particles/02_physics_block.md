All measurements are complete. Here is the physics block.

---

# PHYSICS BLOCK — `equilibrium_of_particles`

**input:** `docs/loop_runs/lom_g/equilibrium_of_particles/01_architect_skeleton.md`
**engine:** `force_rig` / `apparatus: "force_table"` — authored against `docs/loop_runs/lom_g/_engine/force_rig_json_contract.md` (as-built, authoritative)
**measured against:** the REAL renderer via `src/scripts/_scratch_eq_measure.ts` (new, untracked; `_scratch_fr_seams.ts` untouched). Nothing committed, no renderer file touched, no concept JSON touched, no registration site touched.
**DC Pandey check:** no formula, derivation, worked example, figure or explanation phrasing imported from DC Pandey, HC Verma or NCERT. Every number below is derived here from `ΣF = 0` and `T = mg`, and then verified against the engine.

---

## §0 — THE THREE MEASUREMENTS (architect §0 Finding 3)

Method: `npx tsx src/scripts/_scratch_eq_measure.ts` — `assembleField3DHtml` → Playwright chromium → real Three.js + real `animate()` clock, virtual 16.7 ms tick, sampling `window.PM_frEngine` and the live DOM HUD once per fixed sub-step. A bit-exact reimplementation of `frStep` (`field_3d_renderer.ts:41209`) was used to scan the parameter grid quickly; every reported value below was then re-measured in the browser and agreed to 5 decimal places (e.g. HOME settle: model 7.40 s vs engine 7.41 s at m = 14 / b = 16).

### V1 — settle duration + overshoots · **MEASURED, architect's value REJECTED**

The architect's `ring_mass_kg: 0.25, damping: 12` settles in **0.17 s** — roughly 40× too fast; the return is over before the eye registers it. Scanned m ∈ [0.25, 140] × b ∈ [10, 140] on both release fixtures.

**AUTHOR THESE — release states (STATE_2, STATE_3): `ring_mass_kg: 70`, `damping: 64`.**

| fixture | settle to 2 mm | readable overshoots (>4 mm) | ΣF arrow → dot | peak \|p\| |
|---|---|---|---|---|
| STATE_2 (3-4-5 home, offset `[0.115, 0.045]`) | **8.13 s** | **3** — −49 mm @1.81 s, +9 mm @5.17 s, −5 mm @7.23 s | latches permanently at **13.36 s** | **0.1234 m** |
| STATE_3 (four-string cross, offset `[0.125, 0]`) | **8.19 s** | **4** — −61 mm @1.57 s, +30 mm @3.10 s, −15 mm @4.62 s, +7 mm @6.16 s | latches permanently at **14.19 s** | **0.1249 m** |

Both settles land at the top of the founder's 6–8 s window with the requested 2–4 readable overshoots. Implicit drag is unconditionally stable (scar candidate 2), confirmed: zero page errors, no divergence at any grid point.

**AUTHOR THESE — ramp states (STATE_1, STATE_4, STATE_5, STATE_6, STATE_7): `ring_mass_kg: 3`, `damping: 120`.** Chosen to give Rule 32a a visible cause→effect trail: the ring lags the moving balance point by a measured **0.39–0.78 s** (S1 533 ms · S4 773 ms · S5 747 ms · S6 387 ms), so the hanger/pulley visibly moves first and the ring visibly follows. At the architect's `0.12 / 40` the lag is 0.10–0.29 s — effectively simultaneous.

> **`ring_mass_kg` and `damping` are RENDERING-PACING parameters, not physics claims.** They appear in no readout, label, formula or narration, and they do **not** move the equilibrium — the fixed point is wherever `ΣF = 0`, independent of both. A large `ring_mass_kg` is legal (contract: "affects settling speed only") and is the only knob that buys a legible settle. Quality-auditor: do not flag 70 kg as a physics error; it is a display convenience, exactly as the spec §2 says damping is.

### V2 — `|p|` bound across every ramp · **THREE STATES BREACHED 0.13 m; ALL CORRECTED**

Table radius 0.25 m; engine hard clamp at 0.20 m (`FR_RING_CLAMP = 0.80`). Founder bound: 0.13 m.

| state | authored by architect | measured peak \|p\| | verdict | **corrected value** | corrected peak |
|---|---|---|---|---|---|
| STATE_1 | `m1` 3.0 → 5.0 | **0.0828 m** | OK — keep | `m1` 3.0 → 5.0 | **0.0828 m** |
| STATE_4 | `angle1` 0° → **40°** | **0.1330 m** | **BREACH** | `angle1` 0° → **34°** | **0.1142 m** |
| STATE_5 | supports @60°/120°, load 3.0 → 5.0, no seed | **0.1442 m** | **BREACH** | supports @**50°/130°**, load 3.0 → 5.0, **seeded at `[0, 0.09873]`** | **0.0987 m** |
| STATE_6 | supports @17°/163°, load 3.0 → 5.0 | **0.0649 m** | OK — keep, seed it | same, **seeded at `[0, -0.00209]`** | **0.0649 m** |
| STATE_2 | offset `[0.115, 0.045]` | **0.1234 m** | OK — keep | unchanged | **0.1234 m** |
| STATE_3 | offset `[0.13, 0]` | **0.1300 m** | **exactly ON the limit** | offset **`[0.125, 0]`** | **0.1249 m** |
| STATE_7 | offset `[0.10, 0.06]` | **0.1152 m** | OK — keep | unchanged | **0.1152 m** |

Every ramp peak occurs at the ramp's quasi-static endpoint (the path is monotone), so the peak is the endpoint — no hidden mid-ramp excursion.

### V3 — does a visible slider row track a live `param_ramp`? · **YES — MEASURED TRUE**

`frRunParamRamp` (`field_3d_renderer.ts:41707`) calls `frSyncSliderRow` on every value change, which writes both `slider.value` and the value text.

```
t=0.0s  engine angle1= 0.0  handle=0    row=visible
t=5.0s  engine angle1=11.8  handle=12   row=visible
t=8.3s  engine angle1=20.7  handle=21   row=visible
t=13.0s engine angle1=34.0  handle=34   row=visible
→ angle1 handle tracks the ramp: true ; row visible throughout: true   (same result for an m1 ramp)
```

**STATE_4 authors `controls_visible: ["angle1"]` as designed** — no fallback to `[]`. One nuance for json-author: the handle and the value text snap to the slider `step` (engine 11.8° → handle 12°), so the displayed integer trails the continuous engine value by up to half a step. That is display quantisation, not a bug — do not "fix" it.

---

## §1 — `physics_engine_config`

```jsonc
{
  "variables": {
    "g":  { "name": "gravitational acceleration", "unit": "m/s^2", "constant": 9.8 },

    "m1": { "name": "hanging mass on string 1", "unit": "kg", "min": 1.2, "max": 5.0, "default": 3.0 },
    "m2": { "name": "hanging mass on string 2", "unit": "kg", "min": 1.2, "max": 5.0, "default": 4.0 },
    "m3": { "name": "hanging mass on string 3", "unit": "kg", "min": 1.2, "max": 5.0, "default": 5.0 },

    "phi1": { "name": "pulley 1 position angle from the +x axis", "unit": "deg", "min": 0, "max": 359, "default": 0 },
    "phi2": { "name": "pulley 2 position angle from the +x axis", "unit": "deg", "min": 0, "max": 359, "default": 90 },
    "phi3": { "name": "pulley 3 position angle from the +x axis", "unit": "deg", "min": 0, "max": 359, "default": 233.13010235 },

    "T1": { "name": "tension in string 1", "unit": "N", "min": 11.76, "max": 49.0, "default": 29.4, "derived": "m1 * g" },
    "T2": { "name": "tension in string 2", "unit": "N", "min": 11.76, "max": 49.0, "default": 39.2, "derived": "m2 * g" },
    "T3": { "name": "tension in string 3", "unit": "N", "min": 11.76, "max": 49.0, "default": 49.0, "derived": "m3 * g" },

    "W":       { "name": "load hanging at the junction (cable states)", "unit": "N", "min": 11.76, "max": 49.0, "default": 29.4, "derived": "m_load * g" },
    "T_cable": { "name": "tension in one support cable (cable states)", "unit": "N", "min": 11.76, "max": 49.0, "default": 29.4, "derived": "W / (2 * sin(radians(theta)))" },
    "theta":   { "name": "angle a support cable makes with the horizontal", "unit": "deg", "min": 6.9, "max": 90, "default": 30, "derived": "degrees(asin(W / (2 * T_cable)))" }
  },

  "formulas": {
    "T1": "m1 * g",
    "T2": "m2 * g",
    "T3": "m3 * g",
    "sum_Fx_at_centre": "T1 * cos(radians(phi1)) + T2 * cos(radians(phi2)) + T3 * cos(radians(phi3))",
    "sum_Fy_at_centre": "T1 * sin(radians(phi1)) + T2 * sin(radians(phi2)) + T3 * sin(radians(phi3))",
    "sum_F_at_centre":  "sqrt(sum_Fx_at_centre * sum_Fx_at_centre + sum_Fy_at_centre * sum_Fy_at_centre)",
    "cable_tension":    "W / (2 * sin(radians(theta)))",
    "cable_angle_deg":  "degrees(asin(W / (2 * T_cable)))",
    "ring_equation_of_motion": "a = (sum_F - b * v) / m_ring"
  },

  "computed_outputs": {
    "T1_N": "{(m1 * 9.8).toFixed(1)}",
    "T2_N": "{(m2 * 9.8).toFixed(1)}",
    "T3_N": "{(m3 * 9.8).toFixed(1)}",
    "cable_tension_N": "{(W / (2 * Math.sin(radians(theta)))).toFixed(1)}"
  },

  "constraints": [
    "T_i = m_i * g exactly — the hanging mass IS the tension, at every pulley angle and every ring position",
    "each string pulls the ring toward its own pulley; the direction is solved by the engine as unit(pulley_i - p), never authored",
    "equilibrium is ΣF = 0, and that is two independent statements: ΣFx = 0 AND ΣFy = 0",
    "for a symmetric two-cable support, 2 T sin(theta) = W, so T = W / (2 sin theta) and T grows without limit as theta approaches 0",
    "a cable can never be perfectly straight under any load: theta = 0 needs infinite tension",
    "damping is a display convenience that makes the settle finite and legible; it is never a force in the free-body diagram and is never drawn or named"
  ]
}
```

### Two hard notes on the formulas

1. **`Σ T_i (cos φ_i, sin φ_i)` is only exact at `p = 0`.** Off centre the string directions rotate (`unit(pulley_i − p)`), which is where the restoring stiffness comes from. `sum_Fx_at_centre` / `sum_Fy_at_centre` are therefore documentation of the *balance condition at the centre*, not a live component readout. **Never author a label or caption asserting a component value while the ring is off centre** — the engine's `ΣFx` / `ΣFy` readouts are live and correct; a computed one would not be.
2. **`φ` and `θ` are different quantities and must never be conflated.** `φ` = the pulley's position angle round the rim (the engine's slider glyphs are `φ₁`, `φ₂`). `θ` = the angle a cable makes with the horizontal *at the ring's actual position*. Measured proof that θ is independent of φ: STATE_5 and STATE_6 both run θ through 30°, at pulley angles 50° and 17° respectively — θ depends only on `W / (2T)`.

> **Do NOT author `slider_controls.<token>.label` overrides.** The engine's built-in glyphs (`m₁ m₂ m₃ φ₁ φ₂`) are already correct Unicode; the architect's `θ₁ / θ₂` would collide with the cable angle θ. Author `slider_controls` for min/max/step/default/dp only.

---

## §2 — ARITHMETIC AUDIT OF EVERY FIXTURE

### The 3-4-5 home fixture — **CORRECT**

```
s1: φ = 0.00°          m = 3.0 kg → T₁ = 29.4 N → ( +29.4,   0.0 )
s2: φ = 90.00°         m = 4.0 kg → T₂ = 39.2 N → (   0.0, +39.2 )
s3: φ = 233.13010235°  m = 5.0 kg → T₃ = 49.0 N → ( −29.4, −39.2 )
                                                Σ = (  0.00,  0.00 )
```
Engine measurement at the centre: `ΣF = 7.1e-15 N`, HUD reads `0.00 / 0.00 / 0.00`. Author `233.13010235` (the exact `atan2(−4,−3)` value); the architect's rounded `233.13` also works — it leaves `|ΣF| ≈ 8.8e-5 N`, four hundred times below the `FR_ARROW_EPS = 0.05 N` zero-dot threshold — but full precision is free.

Arrow band check: 29.4 / 39.2 / 49.0 N → 1.41 / 1.88 / 2.35 world units, all inside the `[0.55, 2.80]` proportional band (floor 11.46 N, cap 58.3 N). **Arrow length ∝ magnitude holds for every tension arrow in this concept.**

### The four-string cross (STATE_3) — **CORRECT, and exactly true, not approximately**

Ring released at `(0.125, 0)`:
- ±y pair (39.2 N each at 90° and 270°) are mirror images about the x-axis ⟹ their y-components cancel identically; their x-components sum to **−35.03 N** (the architect's −36.2 N was for the 0.13 m release; at the corrected 0.125 m it is −35.03 N — engine-measured, HUD-confirmed).
- ±x pair (29.4 N each at 0° and 180°) cancel exactly everywhere on the axis.

**Engine measurement: the `ΣF_y` HUD read `0.00` on 1140 of 1140 sampled frames**, and `max |y|` over the whole state was `0.0000`. The straight-line return is exact, not approximate. `ΣFₓ` runs −35.03 N → −0.01 N.

### STATE_5 / STATE_6 cable fixtures — **STATE_5 REJECTED AND REPLACED; the cable law verified on both**

Closed form for the symmetric fixture (derived here, then confirmed by the engine to 5 dp):

```
pulleys at ±α, radius R = 0.25 m;  load string at 270°;  ring on the vertical axis at y
sin θ = W / (2 T_support)                      (θ = cable angle with the horizontal)
y_eq  = R sin α − R cos α · tan θ
```

| | STATE_5 (corrected) | STATE_6 (as architect) |
|---|---|---|
| support pulleys | **50° / 130°** (was 60°/120°) | 17° / 163° |
| support mass | 3.0 kg → **T = 29.4 N each** | 5.0 kg → **T = 49.0 N each** |
| load ramp | 3.0 → 5.0 kg (**W = 29.4 → 49.0 N**) | 3.0 → 5.0 kg (**W = 29.4 → 49.0 N**) |
| cable angle θ | **30.0° → 56.4°** | **17.5° → 30.0°** |
| ring y | **+0.0987 → −0.0507 m** | **−0.0021 → −0.0649 m** |
| straight-line travel | **148.2 mm** | **62.8 mm** |
| peak \|p\| | **0.0987 m** | **0.0649 m** |
| off-axis drift | `max |x| = 2.5e-17 m` | `max |x| = 1.9e-17 m` |

**Law check, read off the opening frame of each state (same load, W = 29.4 N):**
`T = W / (2 sin θ)` → STATE_5: `29.4 / (2 sin 30.0°) = 29.40 N` ✓ (HUD reads 29.40). STATE_6: `29.4 / (2 sin 17.46°) = 49.00 N` ✓ (HUD reads 49.00). **Same load, flatter cable, 1.67× the tension.** That is the concept's primary aha, exact to two decimals, on screen, in two live numbers.

---

## §3 — CORRECTIONS TO THE SKELETON (physics, not preference)

**C1 — STATE_6's "the sag is far larger" is FALSE.** Measured: STATE_6's ring travels **62.8 mm**, STATE_5's travels **148.2 mm** — STATE_6's sag is *smaller*, and necessarily so: a flatter cable is by definition less sagged. What is far larger in STATE_6 is the **tension** (49.0 N vs 29.4 N for the same load). Corrected claim, narration and delta cue below.

**C2 — the causal direction on this apparatus.** Tension is the INPUT (`T = mg`); the cable ANGLE is the solved output. So the honest STATE_5/6 story is *"pull the cables harder and the line runs flatter — but it never runs straight."* That is precisely the washing-line experience the architect chose as the secondary anchor, so the anchor now matches the mechanism exactly. `T = W/(2 sin θ)` reads the same either way.

**C3 — `glow_focal` off-by-one.** Element ids are **0-based** into `strings[]` (`field_3d_renderer.ts:42178`, `:42035`; harness confirms `fr_arrow_0/1/2` visible, `fr_arrow_3` hidden on a 3-string state). The architect's `fr_arrow_1` (STATE_1) and `fr_pulley_1` (STATE_4) would glow the **second** string. **Author `fr_arrow_0` and `fr_pulley_0`.**

**C4 — the ΣF arrow has a length floor; "shrinks continuously to a dot" is not what the engine draws.** `FR_ARROW_SCALE = 0.048`, `FR_ARROW_MIN_LEN = 0.55` → any resultant below **11.46 N** draws at the same stub length; the arrow is replaced by the zero dot only at `ΣF ≤ 0.05 N` (`FR_ARROW_EPS`). Measured in STATE_2: `ΣF` = 28.52 N at release, below the floor at **0.65 s**, dot at **13.36 s**. So the true picture is **long arrow → shrinks by more than half in the first 0.65 s → holds as a short stub (direction still rotating) → snaps to a dot**. Narration rewritten to match; flagged to eye-walker below. `sum_F` in the HUD is exact and continuous throughout (28.49 → 0.02 N) — that is the Rule 33d instrument carrying the continuity.

**C5 — STATE_7 must drop `sum_Fx` / `sum_Fy`.** Under the `core_only` preset STATE_3 is hidden, so `ΣFₓ`/`ΣF_y` would appear in the sandbox with no prior teaching — a Rule 25 untaught term and the Rule 38b violation the architect flagged. **Author `readouts: ["T", "sum_F"]`.** This resolves the architect's §12(i-2) judgment call; nothing else changes.

**C6 — drop `show_sliders: true` from STATE_1.** For `force_rig` the panel is shown/hidden purely by whether `controls_visible` resolves to ≥ 1 live row (`frToggleSliderRows`, `:41890`); the generic `#sliders` panel is excluded for this scenario. `show_sliders` is inert here and only invites confusion.

**C7 — the reveal pin would photograph the wrong frame on STATE_2 / STATE_3 / STATE_4.** `deriveStateMeta` pins a `force_rig` state with no ramp and no phases at **1600 ms** (`FR_SETTLE_MS`), and a ramp state at `end_ms + 1600`. Measured payoff times: STATE_2 dot at 13.36 s, STATE_3 dot at 14.19 s, STATE_4 dot at 14.94 s (pin would be 14.60 s). THE EYE would freeze mid-swing and never see the dot. **Fix without an engine edit:** author a timing-only `phases[]` marker. A phase with an `id` and `at_ms` but **no `glow_focal`** pushes the pin to `at_ms + 500` and changes nothing visually (`frRunPhases`, `:41688`, leaves `focal = fr.glow_focal`). Exact values in §5.

**C8 — assessment Q4 must be scoped to the force table, or it contradicts Q5/Q6.** As written ("tension is set by the hanging weight; distractor: tension depends on the string's angle") it is true only for a string running over a pulley with a mass hanging free. In the cable problem of Q5/Q6 the tension *does* depend on the angle. **Stem must name the apparatus:** *"On the force table, a string runs over a pulley with a 4.0 kg mass hanging from it. What is the tension in that string?"* → 39.2 N, and the angle-dependence option becomes a clean distractor. Every other assessment row physics-checks correct; keyed distractors are all real wrong beliefs that genuinely produce the wrong option.

---

## §4 — PER-STATE VARIABLE OVERRIDES / DEFENSIVE VALUES

`force_rig` does not read `default_variables`; every string's mass and angle is authored inside the state's own `force_table.strings[]`, which is a full re-seed on entry (`applyForceRigState`, `:42416`). **`variable_overrides` are therefore not required and must not be authored** — the equivalent defensive discipline is:

- **Every state declares all of its strings explicitly, in full** (id, `angle_deg`, `hanging_mass_kg`, `label`, `color`). Never rely on a value carried from the previous state.
- **Bug #1 (`default_variables_only_first_var_merged`) satisfied by construction:** there is no merge path — `applyForceRigState` rebuilds `eng.strings` from the authored array on every entry and calls `frSetStringMass` for each, so a mass can never silently fall back to 1. Verified: after a STATE_7 slider drag to `m2 = 5`, entering any other state restores that state's authored 4.0 kg.
- **`PM_frSeized` is reset to `false` on every state entry** (`:42461`), so a teacher drag in STATE_7 cannot suppress a later state's `param_ramp`.
- **Rule 32d home-pose continuity:** STATE_1, STATE_2, STATE_4 and STATE_7 all open on the identical 3-4-5 home fixture; STATE_3 (four-string cross) and STATE_5/6 (two supports + a load) are declared, narrated apparatus changes. The table, rim, ring and camera `[0, 3.4, 9.2]` never change on any state.

---

## §5 — WITHIN-STATE MOTION TIMELINE + PER-STATE CONTROL SPEC (Rule 31 — REQUIRED)

Every branch below is a pure function of the state clock `eng.t_ms`, which is rebased to 0 on entry and advanced only by the dt handed to `updateForceRigFrame` (Rule 26 / Rule 36 — THE-EYE-safe; the bring-up harness proved fold-exactness).

### Master table

| state | t-window | what animates (pure fn of the state clock) | driven by | live control(s) |
|---|---|---|---|---|
| **S1** | 0 – 1.0 s | apparatus at rest in the home pose; three tension arrows at 1.41 / 1.88 / 2.35 world units | — | none |
| **S1** | 1.0 – 13.0 s | hanger 1's plate grows and its label runs 3.0 → 5.0 kg; **arrow 1 lengthens 29.4 → 49.0 N** (1.41 → 2.35 world) | `param_ramp m1` | none |
| **S1** | ~1.5 – 13.4 s | *(effect, trailing the cause by a measured **0.53 s**)* the ring drifts diagonally from the centre to **(0.0812, 0.0133) m** and settles | solved ring position | none |
| **S2** | 0 s | ring opens displaced at **(0.115, 0.045)**, \|p\| = 0.1234 m; ΣF arrow long (28.5 N) pointing back toward the centre; all three tension arrows full length | `ring_start_offset_m` | none |
| **S2** | 0 – 0.65 s | **ΣF arrow visibly shortens by more than half** (1.37 → 0.55 world) as the ring accelerates inward | solved ΣF | none |
| **S2** | 0 – 8.1 s | ring swings back through the centre with **3 readable overshoots** (−49 mm @1.81 s, +9 mm @5.17 s, −5 mm @7.23 s) along a **curved 2-D path**; ΣF stub keeps rotating; `ΣF` HUD falls 28.49 → 0.1 N | solved ring dynamics | none |
| **S2** | 13.36 s | **ΣF arrow is replaced by the zero dot, permanently** — three full-length tension arrows (29.40 / 39.20 / 49.00 N) beside a dot, ring still | `FR_ARROW_EPS` | none |
| **S3** | 0 s | four-string cross; ring opens at **(0.125, 0)**; `ΣFₓ = −35.03 N`, `ΣF_y = 0.00 N` | `ring_start_offset_m` | none |
| **S3** | 0 – 8.2 s | ring returns along a **perfectly straight line on the x-axis** with **4 readable overshoots** (−61, +30, −15, +7 mm); `ΣFₓ` climbs −35.03 → 0; **`ΣF_y` reads `0.00` on every single frame (measured 1140/1140)**; `max |y| = 0.0000` | solved ring dynamics | none |
| **S3** | 14.19 s | zero dot latches on at the centre | `FR_ARROW_EPS` | none |
| **S4** | 0 – 1.0 s | balanced home pose, ring at centre, zero dot showing | — | `angle1` |
| **S4** | 1.0 – 13.0 s | **pulley 1 slides round the rim 0° → 34°**, carrying its string and hanger; the `φ₁` slider handle moves with it (V3 verified) | `param_ramp angle1` | `angle1` |
| **S4** | ~1.8 – 13.7 s | *(effect, trailing by a measured **0.77 s**)* the ring tracks the moving balance point along a **curved path** to **(0.0199, 0.1113) m**; the three tensions never change (29.40 / 39.20 / 49.00 N throughout) | solved ring position | `angle1` |
| **S4** | 14.94 s | motion stops, **zero dot latches on at the NEW balance point** — the closing contrast with S2's dot at the centre | `FR_ARROW_EPS` | `angle1` |
| **S5** | 0 – 1.0 s | seeded at its own equilibrium **(0, +0.0987)**; two support cables at 50°/130° reading 29.40 N each, load reading 29.40 N | `ring_start_offset_m` | none |
| **S5** | 1.0 – 13.0 s | the load hanger grows 3.0 → 5.0 kg; its arrow lengthens **29.4 → 49.0 N**; the two support arrows hold at 29.40 N | `param_ramp m1` | none |
| **S5** | ~1.7 – 16.8 s | *(effect, trailing by **0.75 s**)* the ring travels **straight down the vertical axis, 148 mm**, to −0.0507 m; the cables visibly steepen 30.0° → 56.4°; off-axis drift `2.5e-17 m` | solved ring position | none |
| **S6** | 0 – 1.0 s | seeded at its own equilibrium **(0, −0.0021)** — essentially the home centre; supports at 17°/163° reading **49.00 N each**, load 29.40 N | `ring_start_offset_m` | none |
| **S6** | 1.0 – 13.0 s | identical load ramp 3.0 → 5.0 kg; support arrows hold at **49.00 N** — the longest arrows in the concept | `param_ramp m1` | none |
| **S6** | ~1.4 – 13.1 s | *(effect, trailing by **0.39 s**)* the ring sags **straight down 63 mm** to −0.0649 m; the cables open only 17.5° → 30.0° and are visibly still not straight | solved ring position | none |
| **S7** | 0 – 4.6 s | opens displaced at (0.10, 0.06), settles to the centre, zero dot latches | `ring_start_offset_m` | ALL 5 |
| **S7** | 4.6 s → ∞ | every teacher drag on `m₁ m₂ m₃ φ₁ φ₂` drives live continuous motion; the clock never freezes (Rule 37) | `trusted_drag_seizes` | ALL 5 |

### Rule 32 legibility, verified per state

- **32a cause-before-effect:** every ramp state's cause (hanger plate growing / pulley sliding) starts at `start_ms: 1000` and the ring's response trails it by a **measured 0.39–0.78 s** — a readable gap, produced by the ring's real inertia, not by scripting. STATE_2/3 have no cause to stagger: the release IS the cause, and the ΣF arrow's collapse follows it.
- **32b only the taught variable moves:** exactly one `param_ramp`, one parameter, per state. Every other string, mass and pulley holds its authored pose. STATE_2/3 ramp nothing. STATE_7 exempt.
- **32c delta cue:** the caption column in §6 is the on-canvas top caption verbatim, ≤5 words.
- **32d home pose:** camera `[0, 3.4, 9.2]` on all seven states; table/rim/ring never move; two declared apparatus changes only.
- **32e one glow focal:** exactly one per state, all corrected to 0-based ids (§6).

### Reveal-pin markers (C7) — timing-only, zero visual effect

| state | author | resulting pin | payoff measured at |
|---|---|---|---|
| STATE_2 | `"phases": [{ "id": "resultant_is_zero", "at_ms": 13500 }]` | 14000 ms | dot at 13.36 s |
| STATE_3 | `"phases": [{ "id": "both_sums_zero", "at_ms": 14000 }]` | 14500 ms | dot at 14.19 s |
| STATE_4 | `"phases": [{ "id": "rebalanced", "at_ms": 15000 }]` | 15500 ms | dot at 14.94 s |
| STATE_5 | `"phases": [{ "id": "sagged", "at_ms": 16500 }]` | 17000 ms | ring at −0.047 m, still creeping (settle 16.75 s) |
| STATE_7 | `"phases": [{ "id": "settled", "at_ms": 5000 }]` | 5500 ms | dot at 4.58 s |
| STATE_1, STATE_6 | none needed | 14600 ms (`end_ms + 1600`) | S1 final at 13.4 s, S6 final at 13.1 s |

**Each phase must carry `id` and `at_ms` only — no `glow_focal`** (adding one would re-point the emphasis mid-state and break Rule 32e).

---

## §6 — PER-STATE AUTHORING SPEC (hand this straight to json-author)

Shared on every state: `camera_position: [0, 3.4, 9.2]`, `apparatus: "force_table"`, `view: "top_down"`, `depth_ring` as marked, `advance_mode: "manual_click"` except STATE_7.

Shared `slider_controls` (top level of `field_3d_config`):
```jsonc
"slider_controls": {
  "m1":     { "min": 1.2, "max": 5.0, "step": 0.1, "default": 3.0, "dp": 1 },
  "m2":     { "min": 1.2, "max": 5.0, "step": 0.1, "default": 4.0, "dp": 1 },
  "m3":     { "min": 1.2, "max": 5.0, "step": 0.1, "default": 5.0, "dp": 1 },
  "angle1": { "min": 0, "max": 359, "step": 1, "default": 0,  "dp": 0 },
  "angle2": { "min": 0, "max": 359, "step": 1, "default": 90, "dp": 0 }
}
```

### STATE_1 — "Tension Equals the Hanging Weight" · `core` · duration **16 s**

```jsonc
"caption": "Heavier weight, longer arrow",
"formula_overlay": "T = m g",
"force_rig": {
  "apparatus": "force_table",
  "force_table": {
    "view": "top_down", "ring_mass_kg": 3, "damping": 120,
    "strings": [
      { "id": "s1", "angle_deg": 0,            "hanging_mass_kg": 3.0, "label": "T₁", "color": "#FFD166" },
      { "id": "s2", "angle_deg": 90,           "hanging_mass_kg": 4.0, "label": "T₂", "color": "#42A5F5" },
      { "id": "s3", "angle_deg": 233.13010235, "hanging_mass_kg": 5.0, "label": "T₃", "color": "#EF5350" }
    ],
    "show_resultant": false, "show_components": false
  },
  "arrows":   [{ "show": ["tension"] }],
  "readouts": ["T"],
  "controls_visible": [],
  "glow_focal": "fr_arrow_0",
  "param_ramp": { "param": "m1", "from": 3.0, "to": 5.0, "start_ms": 1000, "end_ms": 13000 }
}
```
**narration `text_en` (33 words ≈ 13.2 s; motion 13.36 s):**
> "Each string runs over a pulley and holds a hanging weight. The tension in that string equals the weight exactly. The first weight grows, its arrow grows too, and the ring slides across."

*Resultant deliberately OFF — this state is one arrow and one number. No forward reference to components or cables (the `core_only` preset must survive).*

### STATE_2 — "Balanced: the Resultant Is Zero" · `core` · duration **15 s** · SUPPORTING AHA · Hook 1

```jsonc
"caption": "Resultant shrinks to a dot",
"formula_overlay": "ΣF = 0",
"force_rig": {
  "apparatus": "force_table",
  "force_table": {
    "view": "top_down", "ring_mass_kg": 70, "damping": 64,
    "ring_start_offset_m": [0.115, 0.045],
    "strings": [ /* HOME FIXTURE, verbatim */ ],
    "show_resultant": true
  },
  "arrows":   [{ "show": ["tension", "resultant"], "labels": { "resultant": "ΣF" } }],
  "readouts": ["T", "sum_F"],
  "controls_visible": [],
  "glow_focal": "fr_resultant",
  "phases": [{ "id": "resultant_is_zero", "at_ms": 13500 }]
}
```
**narration `text_en` (33 words ≈ 13.2 s; motion 13.36 s):**
> "The ring starts off centre, so the three pulls do not balance. It swings back and stops at the middle. All three tension arrows are still full length. Only their sum is zero."

*Wording constraint honoured (architect §7): the forces are never described as "cancelling out" in a way that reads as disappearing — the arrows stay on screen and the sentence names full length explicitly.*

### STATE_3 — "Each Direction Balances Separately" · `extended` · duration **16 s**

```jsonc
"caption": "Vertical sum stays zero",
"formula_overlay": "ΣFₓ = 0\nΣFᵧ = 0",
"force_rig": {
  "apparatus": "force_table",
  "force_table": {
    "view": "top_down", "ring_mass_kg": 70, "damping": 64,
    "ring_start_offset_m": [0.125, 0.0],
    "strings": [
      { "id": "s1", "angle_deg":   0, "hanging_mass_kg": 3.0, "label": "T₁", "color": "#FFD166" },
      { "id": "s2", "angle_deg": 180, "hanging_mass_kg": 3.0, "label": "T₂", "color": "#FFD166" },
      { "id": "s3", "angle_deg":  90, "hanging_mass_kg": 4.0, "label": "T₃", "color": "#42A5F5" },
      { "id": "s4", "angle_deg": 270, "hanging_mass_kg": 4.0, "label": "T₄", "color": "#42A5F5" }
    ],
    "show_resultant": true
  },
  "arrows":   [{ "show": ["tension", "resultant"], "labels": { "resultant": "ΣF" } }],
  "readouts": ["sum_Fx", "sum_Fy", "T"],
  "controls_visible": [],
  "glow_focal": "fr_ring",
  "phases": [{ "id": "both_sums_zero", "at_ms": 14000 }]
}
```
**narration `text_en` (35 words ≈ 14.0 s; motion 14.19 s):**
> "Four strings now, in two opposite pairs. The ring is released to the right and returns along a straight line. The vertical sum reads zero the whole way. Only the horizontal sum brings it back."

> **Glyph flag for json-author + quality-auditor.** `#fr_formula` is written with `.textContent` (`field_3d_renderer.ts:42527`), so HTML `<sub>` will not render there — the surface must be real Unicode. `ₓ` is U+2093; **Unicode has no Latin subscript y**, and `ᵧ` (U+1D67) is the glyph the pipeline uses for it. Verify it in THE EYE frames under `'Cambria Math'`. **Fallback if it renders as a Greek gamma:** author the surface as `ΣFₓ = 0` alone — the vertical statement is already on screen, correctly typeset, in the engine's own HUD row (`ΣF<sub>y</sub>`, built with `innerHTML` at `:41967`). Do NOT fall back to ASCII `Fy` (Rule 34c). String `label` fields must stay Unicode (`T₁`…) because the same string drives the 3D sprite texture, where HTML would render literally.

### STATE_4 — "Balance Moves When a Pulley Moves" · `extended` · duration **17 s**

```jsonc
"caption": "Pulley moves, balance moves",
"formula_overlay": "ΣF = 0",
"force_rig": {
  "apparatus": "force_table",
  "force_table": {
    "view": "top_down", "ring_mass_kg": 3, "damping": 120,
    "strings": [ /* HOME FIXTURE, verbatim */ ],
    "show_resultant": true
  },
  "arrows":   [{ "show": ["tension", "resultant"], "labels": { "resultant": "ΣF" } }],
  "readouts": ["T", "sum_F"],
  "controls_visible": ["angle1"],
  "glow_focal": "fr_pulley_0",
  "param_ramp": { "param": "angle1", "from": 0, "to": 34, "start_ms": 1000, "end_ms": 13000 },
  "phases": [{ "id": "rebalanced", "at_ms": 15000 }]
}
```
**narration `text_en` (35 words ≈ 14.0 s; motion 14.94 s):**
> "Nothing is added or taken away. Only the first pulley moves round the rim. The three tensions stay at 29.4, 39.2 and 49.0 newtons, but the balance point moves, and the ring follows it there."

*Measured during the sweep: `ΣF` stays between **0.89 N and 1.29 N** — the lag force of a ring still catching up, two orders below the tensions. Because of the arrow floor (C4) that draws as a small constant stub, then snaps to the dot at 14.94 s. The narration does not claim ΣF is zero during the sweep; it claims the ring follows the balance point, which is exactly what the picture shows, and the closing dot at a NEW position is the payoff.*

### STATE_5 — "Steep Cables Pull Less Than the Load" · `extended` · duration **18 s**

```jsonc
"caption": "Steep cables, smaller pull",
"formula_overlay": "T = W / (2 sin θ)",
"force_rig": {
  "apparatus": "force_table",
  "force_table": {
    "view": "top_down", "ring_mass_kg": 3, "damping": 120,
    "ring_start_offset_m": [0, 0.09873],
    "strings": [
      { "id": "s_load",  "angle_deg": 270, "hanging_mass_kg": 3.0, "label": "W",  "color": "#EF5350" },
      { "id": "s_left",  "angle_deg": 130, "hanging_mass_kg": 3.0, "label": "T₁", "color": "#FFD166" },
      { "id": "s_right", "angle_deg":  50, "hanging_mass_kg": 3.0, "label": "T₂", "color": "#FFD166" }
    ],
    "show_resultant": false
  },
  "arrows":   [{ "show": ["tension"] }],
  "readouts": ["T"],
  "controls_visible": [],
  "glow_focal": "fr_ring",
  "param_ramp": { "param": "m1", "from": 3.0, "to": 5.0, "start_ms": 1000, "end_ms": 13000 },
  "phases": [{ "id": "sagged", "at_ms": 16500 }]
}
```
**narration `text_en` (41 words ≈ 16.4 s; motion 16.75 s):**
> "Two cables hold a load at one point. Each cable pulls 29.4 newtons, set by its own hanging weight. The load now grows to 49.0 newtons. The ring sinks, the cables get steeper, and each cable holds more than it pulls."

*The load is `strings[0]` deliberately — `param_ramp` can only ramp `m1`, and ramping the load keeps the fixture mirror-symmetric so the sag is a straight line (measured off-axis drift 2.5e-17 m). Planting-risk constraint honoured: the "holds more than it pulls" claim is bound to the steep geometry by the caption and by the preceding clause "the cables get steeper"; it is never generalised.*

### STATE_6 — "Flat Cables Pull Much Harder" · `extended` · duration **15 s** · PRIMARY AHA · Hook 2

```jsonc
"caption": "Flat cables, much larger pull",
"formula_overlay": "T = W / (2 sin θ)",
"force_rig": {
  "apparatus": "force_table",
  "force_table": {
    "view": "top_down", "ring_mass_kg": 3, "damping": 120,
    "ring_start_offset_m": [0, -0.00209],
    "strings": [
      { "id": "s_load",  "angle_deg": 270, "hanging_mass_kg": 3.0, "label": "W",  "color": "#EF5350" },
      { "id": "s_left",  "angle_deg": 163, "hanging_mass_kg": 5.0, "label": "T₁", "color": "#FFD166" },
      { "id": "s_right", "angle_deg":  17, "hanging_mass_kg": 5.0, "label": "T₂", "color": "#FFD166" }
    ],
    "show_resultant": false
  },
  "arrows":   [{ "show": ["tension"] }],
  "readouts": ["T"],
  "controls_visible": [],
  "glow_focal": "fr_ring",
  "param_ramp": { "param": "m1", "from": 3.0, "to": 5.0, "start_ms": 1000, "end_ms": 13000 }
}
```
**narration `text_en` (32 words ≈ 12.8 s; motion 13.10 s):**
> "Same load, same growth. Each cable now pulls 49.0 newtons, the largest pull this table can supply, and the cables run almost flat. They still sag, and more load means more sag."

*The pair's flip, in two numbers on screen at the same load: STATE_5 supports **29.40 N** at a 30.0° cable; STATE_6 supports **49.00 N** at a 17.5° cable. Both satisfy `T = W/(2 sin θ)` to two decimals.*

### STATE_7 — "Explore: Change Any Weight or Angle" · `core` · `interaction_complete` · duration 0 (open)

```jsonc
"caption": "Change any weight or angle",
"formula_overlay": "ΣF = 0",
"force_rig": {
  "apparatus": "force_table",
  "force_table": {
    "view": "top_down", "ring_mass_kg": 3, "damping": 120,
    "ring_start_offset_m": [0.10, 0.06],
    "strings": [ /* HOME FIXTURE, verbatim */ ],
    "show_resultant": true
  },
  "arrows":   [{ "show": ["tension", "resultant"], "labels": { "resultant": "ΣF" } }],
  "readouts": ["T", "sum_F"],
  "controls_visible": ["m1", "m2", "m3", "angle1", "angle2"],
  "trusted_drag_seizes": true,
  "glow_focal": "fr_ring",
  "phases": [{ "id": "settled", "at_ms": 5000 }]
}
```
**narration `text_en` (14 words; explore = 0/open, exempt from the 25–55 band):**
> "Change any hanging weight, or move either pulley, and watch where the ring settles."

*Slider binding verified: `m1`→s1, `m2`→s2, `m3`→s3, `angle1`→s1, `angle2`→s2 — all five rows have a real target and a real write path (bring-up harness R37 proved a slider write reaches `T = m·g`). `readouts` reduced to `["T","sum_F"]` per C5.*

---

## §7 — MODES REQUIRED BY THE DoD

**Conceptual only.** No `mode_overrides` (Rule 20 [D] suspension is active). No `epic_c_branches` (EPIC-L-first, 2026-06-10). Board mark scheme and derivation sequence are **DEFERRED and NOT drafted** — json-author must neither skip a required mode nor half-build a deferred one; there is nothing to build here beyond EPIC-L.

---

## §8 — `aha_moment` PHYSICS CHECK

| | statement | ≤15 words | physically TRUE? | demonstrated by the designated state? |
|---|---|---|---|---|
| **PRIMARY** (STATE_6) | *"A cable can only carry a load by sagging; pulled flatter, it pulls harder."* | 13 ✓ | **TRUE.** `T = W/(2 sin θ)` → `T → ∞` as `θ → 0`; θ = 0 is unreachable for any finite T. | **YES** — measured: supports read 49.00 N against a 29.40 N load at a 17.5° cable, and the sag grows as the load grows. |
| **SUPPORTING** (STATE_2) | *"Three unequal pulls can add to nothing; the arrows stay, only the sum is zero."* | 14 ✓ | **TRUE.** 29.4 / 39.2 / 49.0 N sum to exactly zero on the 3-4-5 fixture (engine: ΣF = 7.1e-15 N). | **YES** — three full-length arrows of three different lengths beside a zero dot, held from 13.36 s. |

*The architect's PRIMARY wording ("the flatter you pull it, the harder it pulls, and it can never be pulled perfectly straight") is physically correct but 21 words; the 13-word version above preserves the physics.* Cohesion holds: the cable law **is** the supporting aha rewritten for a symmetric pair, so a student who has not accepted "unequal pulls can sum to zero" cannot read STATE_6.

---

## §9 — `misconception_watch` PHYSICS CHECK (Rule 16a)

Two hooks, both at genuine pivots; five states carry none. Both are straightforward contrast beats — no predict-pause, no Socratic reveal.

**Hook 1 — STATE_2.** belief: *"If it is not moving, there is no force on it."*
`visual_counter` — **physics-checked TRUE and rendered**: three tension arrows at full length reading 29.40, 39.20 and 49.00 N beside a resultant collapsed to a dot, ring still. Every number is engine-measured.
`one_line_fix` — **"At rest the pulls cancel each other — they are still there."** Correct physics, and Rule 41 clean. *(This same frame also kills "balanced means equal in size": the three numbers on screen are different and the ring still holds. Named in the narration; it does not need a second hook.)*

**Hook 2 — STATE_6.** belief: *"Pull a rope hard enough and you can make it perfectly straight."*
`visual_counter` — **physics-checked TRUE, with C1 corrected**: support tension **49.0 N** (the largest this rig supplies) against a **29.4 N** load at a 17.5° cable, versus STATE_5's **29.4 N** at a 30.0° cable for the same load. The wrong expectation's consequence is shown first — the cables are pulled as hard as the apparatus can and are *still* not straight — then the load grows and the only response is more sag.
`one_line_fix` — **"The flatter the cable, the larger the tension needed; perfectly straight would need infinite tension."** Correct.

Both states genuinely pivot; neither is a manufactured misconception on a teaching state.

---

## §10 — DRILL-DOWN CLUSTER PHRASINGS (5 per cluster, real student voice, plain English)

**STATE_3 clusters**

`why_two_equations_not_one`
- "why do we write two equations not one"
- "cant i just say the forces balance"
- "why split it into x and y at all"
- "one equation was enough in class 10 what changed"
- "do i always have to do both directions"

`choosing_the_axes`
- "how do i know which way to take x"
- "can i tilt the axes or must they be up and down"
- "does the answer change if i pick different axes"
- "teacher took x along the string why"
- "is there a wrong choice of axes"

`sign_of_a_component`
- "is a force pointing left negative or positive"
- "why did the component come out minus"
- "do i put a minus sign or just subtract it"
- "confused about signs in the x equation"
- "backwards force vs negative component same thing"

**STATE_6 clusters**

`why_tension_blows_up_near_flat`
- "why does tension become so big when the rope is flat"
- "where does the 1 over sin theta come from"
- "what happens at theta equals zero"
- "why is there no maximum tension"
- "tension is infinite that cant be right"

`why_cables_and_ropes_always_sag`
- "why cant i pull a rope perfectly straight"
- "is the sag because the rope stretches"
- "the clothes line still dips even when tight why"
- "does a stronger rope sag less"
- "is sagging a fault in the rope"

`tension_larger_than_the_load`
- "how can the cable pull harder than the weight"
- "isnt that creating force from nothing"
- "the tension is more than mg how"
- "does that break newtons third law"
- "why is each cable not just half the weight"

---

## §11 — CONSTRAINT CALLOUTS FOR JSON-AUTHOR

1. **Angles in degrees, everywhere.** `angle_deg` is CCW from +x, 0–359, and the engine converts internally. Any formula in this block that feeds sin/cos wraps its argument in `radians()`. Do not author a radian value into `angle_deg`.
2. **Bands, all silently enforced.** `hanging_mass_kg ∈ [1.2, 5.0]` (every value here is 3.0 / 5.0 for supports and 3.0→5.0 for loads ✓); `|ring_start_offset_m| ≤ 0.15` (largest authored: 0.1234 ✓); ≤ 4 strings per state (STATE_3 uses exactly 4 ✓); `param_ramp.param ∈ {angle1, angle2, m1, omega}` — every ramp here is `m1` or `angle1` ✓.
3. **Arrow band.** Proportional between **11.46 N and 58.3 N**. Every tension in this concept is 29.4–49.0 N ✓. The only quantity that leaves the band is the *resultant* in STATE_2/3/4 — see C4; that is expected and must not be "fixed".
4. **0-based element ids** for `glow_focal`: `fr_arrow_0`, `fr_pulley_0`, `fr_weight_0`, `fr_string_0`. Exactly one `glow_focal` per state.
5. **`phases[]` entries here are timing-only** — `id` + `at_ms`, never `glow_focal`.
6. **String `label` must be Unicode**, never HTML: the same string is used for the HUD row (via `innerHTML`) *and* the 3D sprite texture (via a canvas draw), where `<sub>` would render literally.
7. **No `variable_overrides`** on any state (§4). **No `show_sliders`** on any state (C6). **No `slider_controls.label` overrides** (§1).
8. **Direction discipline (DoD (c)):** every tension arrow points from the ring toward its own pulley, always. The engine solves it as `unit(pulley_i − p)`; the concept never authors a direction, and no arrow ever points outward from the ring away from a pulley.
9. **`scale_pixels_per_unit`** is not part of this engine's surface — do not author one. World scale is `FR_WORLD_PER_M = 9.6` and is fixed.

---

## §12 — ENGINE BUG QUEUE CONSULTATION

No DB access from this worktree and DB writes are prohibited on this tray, so the local mirror `docs/loop_runs/lom_g/_engine/scar_candidates.sql` was read in full (5 rows). Relevant prevention rules and their status here:

- **Candidate 1 — `field3d_arrowhelper_shaft_invisible_when_collinear_with_apparatus_line` (OPEN, `equilibrium_of_particles` named).** Cannot be satisfied by authoring; it is a renderer defect. Mitigations authored: every tension arrow sits at `FR_ARROW_Z = 0.14` in front of the string plane (engine-side, already built), and every state's tensions are 29.4–49.0 N so the arrows are 1.41–2.35 world units — the longest this engine draws, hence the most separable from their strings. **FLAGGED to quality-auditor as a documented Gate 8 exception**, and escalated to eye-walker in §13.
- **Candidate 2 — implicit-drag integrator (renderer-internal).** No authoring surface. Verified stable across the entire m ∈ [0.25, 140] × b ∈ [10, 140] grid: zero divergence, zero page errors.
- **Bug #1 `default_variables_only_first_var_merged`** — satisfied by construction (§4): `force_rig` re-seeds every string from the state's own array; there is no merge path and no silent fallback to 1.
- Candidates 3–5 are whirl / regression-sample rows, not applicable.

---

## §13 — BRIEF FOR eye-walker (must be passed on)

1. **Scar candidate 1 is open and this concept is its named victim.** For **every** state, confirm each tension arrow's **shaft** is distinguishable from its own string, and that each arrow **tip position is proportional to magnitude** (29.4 N → 1.41 world, 39.2 → 1.88, 49.0 → 2.35). A full-pass assertion suite is not evidence that anything is visible.
2. **STATE_2/3/4 resultant, expected behaviour, not a bug (C4):** the ΣF arrow shrinks proportionally only down to 11.46 N, then holds at a constant stub whose *direction* keeps rotating, then snaps to a dot. Confirm the **frozen frame shows the DOT**, not the stub — that is what the reveal-pin phases in §5 exist for. A stub in the frozen frame means the pin is wrong.
3. **STATE_3's exact claim:** confirm the `ΣF_y` HUD reads `0.00` in every dumped frame and that the ring never leaves the horizontal centre line. Engine measurement: 1140/1140 frames at `0.00`, `max |y| = 0.0000`.
4. **STATE_5 vs STATE_6 is the concept.** Put the two frames side by side: same apparatus, same load, support readouts **29.40 N** vs **49.00 N**, cable visibly steep vs visibly flat. If those two numbers are not both legible, the primary aha has not shipped.
5. **STATE_1's ring is off centre at the end (0.0812, 0.0133) — this is correct**, not a leaked pose. STATE_2 restores the home fixture and opens by moving.

---

## §14 — SELF-REVIEW

- [x] Every symbol in the state narratives appears in `variables` (T₁–T₄, W, ΣF, ΣFₓ, ΣF_y, m₁–m₃, φ₁–φ₃, θ, g).
- [x] Every formula wraps its angle argument in `radians()`.
- [x] Per-state live controls declared and match the architect's table: `[]` × 5, `["angle1"]` on STATE_4, all five on explore. Every visible row has min/max/step/default.
- [x] `variable_overrides` correctly declared **not required** for this engine, with the reason and the equivalent defensive discipline documented (§4).
- [x] Board mark scheme **skipped entirely** (Rule 20 [D] active) — no `mode_overrides` drafted.
- [x] 6 drill-down clusters × 5 phrases, real student voice, plain English, no teacher prose.
- [x] `constraints` block: 6 short factual assertions, conservation/equilibrium first.
- [x] Numerical sanity checks run: `m = 1, g = 9.8 → w = 9.8 N`; 3.0/4.0/5.0 kg → 29.4/39.2/49.0 N; 3-4-5 sums to (0,0) (engine: 7.1e-15 N); `T = W/(2 sin 30°) = 29.40 N` and `T = W/(2 sin 17.46°) = 49.00 N` (both HUD-confirmed).
- [x] Motion timeline written for all 7 states: t-window × what animates × driving variable, every branch a pure function of the state clock (Rule 26). No two states share a motion; no static state.
- [x] **Rule 32 verified per state:** cause window opens 0.39–0.78 s before the effect (measured); only the taught variable moves; one glow focal each; home pose and camera never change.
- [x] **Rule 31a word budget:** 33 / 33 / 35 / 35 / 41 / 32 words on `text_en`, all inside 25–55, and **every state's motion window is ≥ its narration** (13.36 / 13.36 / 14.19 / 14.94 / 16.75 / 13.10 s vs 13.2 / 13.2 / 14.0 / 14.0 / 16.4 / 12.8 s at the doctrine's 2.5 words-per-second). Explore = 0/open.
- [x] **Rule 38c notation ladder:** every formula surface is algebra-only — `T = m g`, `ΣF = 0`, `ΣFₓ = 0 / ΣFᵧ = 0`, `T = W/(2 sin θ)`. No calculus, no vector operators, anywhere. No place in this concept needs calculus below the advanced ring, so nothing is FLAGged for the founder on that count. **Rule 38d dialect:** "tension T" dual-labelled at first appearance in STATE_1 ("the tension in that string"), bare afterward; "weight" not "load" until the cable states introduce "load" with its own `W` label; no board-divergent term ships unlabelled.
- [x] **Rule 41 plain language:** no idioms, no metaphors, no personification anywhere in the narration, captions or labels. "Sag", "sinks", "steeper", "flat", "tension", "resultant", "balance point" are all literal. No force wants, knows, answers, fights or gives.
- [x] **Rule 35 anchor:** the hanging sign and the washing line are universal; no place, festival, food, currency, brand or name appears in any string.
- [x] Engine bug queue consulted via the tray mirror; candidate 1 documented as an authoring-unsatisfiable exception and FLAGged to quality-auditor + eye-walker.
- [x] **DC Pandey check: no formula, explanation or example problem imported from any external book.** Sources were consulted for chapter placement only, by the architect; every number, fixture and sentence here was derived from `ΣF = 0` and `T = mg` and then measured against the engine.

---

## §15 — WHAT I CHANGED IN THE ARCHITECT'S DESIGN, AND WHY (one list, for the founder)

| # | change | reason |
|---|---|---|
| 1 | `ring_mass_kg` 0.25 / `damping` 12 → **70 / 64** (release states), **3 / 120** (ramp states) | measured: the authored pair settles in **0.17 s** |
| 2 | STATE_4 `angle1` sweep 40° → **34°** | measured peak \|p\| **0.1330 m**, over the 0.13 m bound |
| 3 | STATE_5 support pulleys 60°/120° → **50°/130°**, and the ring **seeded at its own equilibrium** | measured peak \|p\| **0.1442 m**, over the bound; seeding also removes an unnarrated entry transient (Rule 32b) |
| 4 | STATE_3 release offset 0.13 → **0.125 m** | the authored value sat exactly ON the bound, zero margin |
| 5 | `glow_focal` `fr_arrow_1` → `fr_arrow_0`, `fr_pulley_1` → `fr_pulley_0` | ids are 0-based; the authored ones glow the wrong string |
| 6 | STATE_6's claim "the sag is far larger" → **"the tension is far larger; the sag still grows with load"** | measured 62.8 mm vs STATE_5's 148.2 mm — the authored claim is false |
| 7 | STATE_2's "the ΣF arrow shortens continuously the whole way" → **shortens by more than half in 0.65 s, then holds, then snaps to the dot** | the engine's arrow length floor is 11.46 N |
| 8 | timing-only `phases[]` added to STATE_2/3/4/5/7 | without them `deriveStateMeta` pins those states at 1.6 s and THE EYE photographs the ring mid-swing, never the dot |
| 9 | STATE_7 `readouts` drops `sum_Fx` / `sum_Fy` | resolves the architect's own Rule 38b flag: under `core_only` those symbols would be untaught |
| 10 | ramp windows 800/1000→10000 ms → **1000→13000 ms**; durations 13–14 s → **15–18 s** | Rule 31 "motion may outrun narration, never the reverse" — at the authored windows every state's narration overran its motion |
| 11 | assessment Q4 stem must name the force table | otherwise Q4 ("tension does not depend on angle") contradicts Q5/Q6 ("tension depends on angle") |

**Lami's theorem — teacher-facing background only, per the architect's cut, and I agree with the cut.** For the three-string home fixture, `T₁/sin α = T₂/sin β = T₃/sin γ` where each angle is the one opposite its tension; the bring-up harness measured all three ratios at 49.0000 with a spread of 0.0000% on this deliberately non-symmetric fixture. **It must not appear on any caption, annotation or formula surface** — the engine exposes no inter-string angle readout and no angle-arc drawable, so any on-screen Lami statement would be authored text asserting physics the picture does not show.

---

## Files

- **Physics block (this document)** → to be written to `C:\Tutor\physics-mind-lom-g\docs\loop_runs\lom_g\equilibrium_of_particles\02_physics_block.md`
- **Measurement harness (new, untracked, nothing committed):** `C:\Tutor\physics-mind-lom-g\src\scripts\_scratch_eq_measure.ts` — re-run with `npx tsx src/scripts/_scratch_eq_measure.ts`; it drives the seven final state configs through the real renderer and prints the peak \|p\|, settle, overshoot extrema, HUD readouts, zero-dot latch time and the V3 slider-tracking result for each. Artifacts land in `C:\Tutor\physics-mind-lom-g\.scratch_eq_measure\`.
- **Untouched, as instructed:** `C:\Tutor\physics-mind-lom-g\src\scripts\_scratch_fr_seams.ts` (verified unmodified in `git status`), `src/lib/renderers/field_3d_renderer.ts`, every concept JSON, every registration site.
agentId: a282e0ca49e88d6f8 (use SendMessage with to: 'a282e0ca49e88d6f8', summary: '<5-10 word recap>' to continue this agent)
<usage>subagent_tokens: 356086
tool_uses: 69
duration_ms: 3701939</usage>