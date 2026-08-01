# PHYSICS BLOCK — `uniform_circular_motion`

**input:** `docs/loop_runs/lom_g/uniform_circular_motion/01_architect_skeleton.md`
**engine:** `force_rig` / `apparatus: "whirl"` (Branch B ONLY) — authored against `docs/loop_runs/lom_g/_engine/force_rig_json_contract.md` (as-built, authoritative) and `docs/FORCE_RIG_ENGINE_SPEC.md` §2/§5
**measured against:** the REAL renderer via `src/scripts/_scratch_ucm_probe.ts` (new, untracked; `_scratch_fr_seams.ts` untouched) — `assembleField3DHtml` → Playwright chromium → real Three.js + real `animate()` clock, and the REAL `deriveMaxRevealTimeMs` from `src/lib/validators/visual/deriveStateMeta.ts` called directly (pure function, no browser). Nothing committed, no renderer/validator file touched, no concept JSON touched, no registration site touched.
**DC Pandey check:** no formula, derivation, worked example, figure or narration phrasing imported from DC Pandey, HC Verma or NCERT. Every number below is derived here from the whirl's own vertical/horizontal balance equations (`T cos θ = mg`, `T sin θ = mω²L sin θ`) and Newton's first law, then verified against the engine and against an independent Python re-derivation.

---

## §0 — THE FOUR MEASUREMENTS (architect §0 Findings 1–2, §14 V1–V4)

Method: `npx tsx src/scripts/_scratch_ucm_probe.ts`. Part 1 calls `deriveMaxRevealTimeMs` directly (pure function, no browser) on whirl configs shaped exactly like the candidate states. Part 2 drives the real `force_rig` whirl branch through Playwright with a virtual 16.7 ms clock, reading `window.PM_frEngine` and the live DOM HUD/slider once per sample — a bit-exact reimplementation of nothing; every number below is the engine's own state, read as a teacher would see it.

### V1 — the whirl `param_ramp` reveal pin · **CONFIRMED — architect's assumption was exactly right, no re-budgeting needed**

Read `deriveStateMeta.ts:2821–2848` directly: the `param_ramp` → `end_ms + FR_SETTLE_MS(1600)` pin logic has **no `apparatus` branch at all** — it applies identically to `force_table` and `whirl`. Confirmed by direct call:

```
S2 (end_ms 9200):   pin = 10800   (= 9200+1600)  -- matches architect's assumed budget exactly
S5 (end_ms 10200):  pin = 11800   (= 10200+1600) -- matches
S6 (end_ms 9200):   pin = 10800   (= 9200+1600)  -- matches
S3 (release 15600): pin = 16800   (= 15600+1200) -- separate release-pin branch, also confirmed
```

**No state's duration needs re-budgeting.** The architect's §0 Finding 1 assumption is not an assumption anymore — it is the measured, code-confirmed fact for every ramp state in this concept.

### V2 — clamp behaviour under a ramp driving ω below √(g/L) · **CONFIRMED TRUE — neither fallback in Finding 2 is needed**

Traced the write path: `frRunParamRamp` → `frApplyParam("omega", v)` → (for a whirl `omega` token) `eng.omega_req = v; frwSeed(eng, ...)`, and `frwSeed`'s **first line is `frwClampOmega(eng)`** — the identical clamp function a trusted slider drag calls. A ramp write is not a different code path from a slider write; it is the same write. Confirmed live, driving STATE_6's exact authored ramp (ω 4.5 → 2.6, `start_ms:1200, end_ms:9200`, `L=1.00, m=1.5`, ω_min = √(9.8/1.00) = 3.1305 rad/s):

```
t=    0ms  handle=4.5  eng.omega=4.500  clamped=false  theta= 61.06°  r_m=0.8751
t= 2500ms  handle=4.2  eng.omega=4.192  clamped=false  theta= 56.11°  r_m=0.8301
t= 5000ms  handle=3.6  eng.omega=3.622  clamped=false  theta= 41.67°  r_m=0.6649
t= 7000ms  handle=3.2  eng.omega=3.162  clamped=false  theta= 11.50°  r_m=0.1994
t= 7500ms  handle=3.1  eng.omega=3.130  clamped=true   theta=  0.00°  r_m=0.0000  amberDisplay=block  amberVal=3.13
t= 9200ms  handle=3.1  eng.omega=3.130  clamped=true   theta=  0.00°  r_m=0.0000  amberDisplay=block  amberVal=3.13
t=10800ms  handle=3.1  eng.omega=3.130  clamped=true   theta=  0.00°  r_m=0.0000  amberDisplay=block  amberVal=3.13
```

The cone closes smoothly (61°→0°) as ω falls, the clamp engages at the exact physical boundary, the guide ring's radius (`r_m`) goes to exactly zero (so `frwSetRing`'s own `radiusM > 1e-4` visibility test hides it — a **source-code guarantee**, not a rendering choice I have to hope for), the amber `ω min = 3.13` row appears, and the picture holds there for the rest of the ramp and beyond. **Author STATE_6 exactly as the architect designed it (ω 4.5 → 2.6). Neither Finding-2 fallback (cutting the ramp at 3.2, or cutting the state) is invoked.**

**One correction to the skeleton's stated mechanism (not to its numbers):** §3's Rule 32a note says the arrow/cone response is "physically lagged... through the integrator." Reading `frApplyParam`'s whirl branch shows this is not quite right: a ramp write calls `frwSeed`, which **instantly recomputes** the exact new conical pose (position + velocity) from the closed form — there is no separate damped settling step the way the force-table ring has. What makes S2/S5/S6 legible under Rule 32a is not a discrete lag window; it is that the **ramp itself is slow** (8–9 s) and the azimuth is carried over (`frwAzimuth(eng)`, Rule 32d — no teleport), so the bob visibly speeds up / the cone visibly opens or closes continuously across many seconds, with the arrow/HUD numbers tracking in the same frame. This is a legibility win either way (nothing snaps), but json-author and eye-walker should judge S2/S5/S6 against "does the change read as a slow continuous unfolding," not "is there a 0.5–1 s stagger between two separate objects" (there is exactly one thing changing: the bob's own state).

### V3 — does the visible `omega` slider row track a live whirl `param_ramp`? · **YES — MEASURED TRUE**

Same run as V2, reading the slider handle's own `value` every sample: `handle` tracks `eng.omega` (rounded to the slider's 0.1 step) at every sampled instant, including through the clamp — where the handle **snaps to and holds at 3.1** (quantised from 3.1305) instead of continuing to follow the ramp's unclamped request. `rowVisibility=visible` throughout. **STATE_2, STATE_5 and STATE_6 all author `controls_visible: ["omega"]` as designed — no fallback to `[]`.** (Mechanism: `frRunParamRamp` calls `frSyncSliderRow(param, frSliderValueFromEngine(param))` after every write — the identical function the sibling's table branch uses, generalised over the `FR_SLIDER_SPEC` token table with no apparatus-specific branching.)

### V4 — STATE_3 post-cut flight geometry stays on the widened plane · **CONFIRMED, with a measured hard boundary at ≈1.52 s (the architect's 1.4 s design sits inside it with 6.9% margin)**

Ran the *exact* authored numbers (`m=4.0 kg, ω=1.8 rad/s, L=1.00 m, geometry:'flat', release.at_ms=3000`) through the real renderer, reading `eng.p3`/`eng.anchor` directly (not the scene graph — see note below) and computing distance from the axis:

```
post-cut t+   0ms  dist=1.0000m   (= L, the pre-cut orbit radius, exactly as expected)
post-cut t+ 300ms  dist=1.1215m
post-cut t+ 600ms  dist=1.4327m
post-cut t+ 900ms  dist=1.8399m
post-cut t+1200ms  dist=2.2924m   <- THE EYE's frozen reveal-pin instant (release.at_ms+1200)
post-cut t+1400ms  dist=2.6078m   <- the architect's designed flight-end instant
post-cut t+1600ms  dist=2.9299m   <- ALREADY PAST the plane edge
post-cut t+1900ms  dist=3.4218m
```

The plane radius when a `release` is authored is `L × FR_W_PLANE_R_CUT` = `1.00 × 2.80` = **2.80 m** (`field_3d_renderer.ts:44234`, confirmed by direct constant read — `FR_W_PLANE_R_FACTOR=1.30`, `FR_W_PLANE_R_CUT=2.80`). Interpolating the measured samples, the bob crosses the plane's edge at **t ≈ 1.52 s post-cut**. At the architect's designed flight window (1.4 s: `at_ms = duration − 1400`), the bob sits at 2.6078 m against the 2.80 m edge — **margin 0.19 m (6.9%)**, comfortably inside. At THE EYE's frozen dense-capture instant (1.2 s post-cut, `release.at_ms + 1200`), the margin is **0.51 m (18.1%)** — very safe. **Build note 7's claimed fix (widen the plane to `L×2.8` when a `release` is authored) holds for these exact numbers, with real but not generous margin.**

**Binding authoring rule for json-author (tighter than "~1.4 s"): never push STATE_3's flight window past 1.5 s post-cut.** 1.4 s (as designed) is safe; 1.6 s is not (measured 2.93 m > 2.80 m plane radius — the bob visibly leaves the table).

**One measurement artifact, not an engine defect:** my probe's `scene.traverse`-based object lookup for `fr_guide_ring`/`fr_plane` came back empty (unlike `_scratch_fr_seams.ts`'s working `s.objs['fr_guide_ring']` pattern) — likely a page-timing quirk in my own throwaway script, not a renderer issue (these meshes are unconditionally `root.add()`'d at scene-build time per `field_3d_renderer.ts:44868–44958`, regardless of state). I did not chase this further because the physics facts needed (V2's `r_m=0`, `theta=0`, `clamped=true`; V4's `eng.p3`/`eng.anchor` distances) were all available directly off `window.PM_frEngine`, which is authoritative and matches the sibling harness's own conclusions for the analogous table-branch case. Flagging for quality-auditor/eye-walker only as a note, not a blocker.

---

## §1 — `physics_engine_config`

**Caveat up front (mirrors the sibling's note, doubly true here):** `force_rig`'s whirl branch is integrated internally (`frwStep`, velocity-Verlet + SHAKE/RATTLE) — the HUD numbers a teacher sees come from `window.PM_frEngine`'s own live state, **not** from `PM_interpolate` evaluating the strings below. This block is the physics documentation and the ground truth json-author/quality-auditor check labels and narration against — it is not a live formula feed.

```jsonc
{
  "variables": {
    "g":     { "name": "gravitational acceleration", "unit": "m/s^2", "constant": 9.8 },
    "m":     { "name": "mass of the whirled ball",    "unit": "kg",     "min": 0.8, "max": 4.5, "default": 1.5 },
    "L":     { "name": "length of the string",        "unit": "m",      "min": 0.60, "max": 1.40, "default": 1.00 },
    "omega": { "name": "spin rate (angular speed)",   "unit": "rad/s",  "min": 1.0, "max": 6.5, "default": 4.0 },

    "theta": { "name": "cone half-angle from the vertical", "unit": "deg", "min": 0, "max": 90,
               "derived": "degrees(acos(clamp(g / (omega * omega * L), 0, 1)))" },
    "r":     { "name": "radius of the circle the ball sweeps", "unit": "m",
               "derived": "L * sin(radians(theta))" },
    "v":     { "name": "tangential speed of the ball", "unit": "m/s",
               "derived": "omega * r" },
    "T":     { "name": "tension in the string", "unit": "N",
               "derived": "m * omega * omega * L" },
    "W":     { "name": "weight of the ball (conical states only)", "unit": "N",
               "derived": "m * g" },
    "omega_min": { "name": "smallest spin rate for which a cone exists", "unit": "rad/s",
                   "derived": "sqrt(g / L)" }
  },

  "formulas": {
    "T":         "m * omega * omega * L",
    "cos_theta": "g / (omega * omega * L)",
    "theta_deg": "degrees(acos(clamp(g / (omega * omega * L), 0, 1)))",
    "r":         "L * sin(radians(theta_deg))",
    "v":         "omega * r",
    "W":         "m * g",
    "omega_min": "sqrt(g / L)"
  },

  "computed_outputs": {
    "T_N":     "{(m * omega * omega * L).toFixed(2)}",
    "theta_deg_display": "{(theta).toFixed(1)}",
    "v_ms":    "{(omega * r).toFixed(2)}",
    "omega_min_display": "{(Math.sqrt(9.8 / L)).toFixed(2)}"
  },

  "constraints": [
    "the tension always points from the ball toward the anchor, solved by the engine, never authored",
    "the velocity is always tangent to the circle the ball is sweeping, at every instant",
    "no outward force exists anywhere, at any time (bring-up harness assertion S8: zero centrifugal terms in the renderer source; largest outward radial component of any drawn arrow, measured over a full revolution, is 0.000)",
    "theta is SOLVED from omega and L via cos theta = g / (omega^2 L); it is never authored, and the engine clamps omega to sqrt(g/L) below which no conical solution exists (the bob hangs, theta = 0)",
    "on the flat plane the normal force exactly cancels gravity, so the string tension is the ONLY horizontal force on the ball; T = m omega^2 L holds on every geometry (r = L on flat, r = L sin theta on the cone — the two forms agree because r = L exactly when theta = 90 degrees)",
    "the post-cut straight line is the output of deleting the string constraint from the integrator; it is never a scripted animation"
  ]
}
```

### Cross-check — every T/θ number in this concept, re-derived independently and confirmed

```
omega=3.0  L=1.00  m=1.5  (S1, flat, r=L)      -> T = 13.50 N
omega=3.4  L=1.00  m=1.5  (S5 start, conical)  -> cosθ=0.84775 θ=32.032°  T=17.34 N   r=0.5304 m
omega=6.2  L=1.00  m=1.5  (S5 end,   conical)  -> cosθ=0.25494 θ=75.230° T=57.66 N   r=0.9670 m
omega=4.5  L=1.00  m=1.5  (S6 start, conical)  -> cosθ=0.48395 θ=61.056° T=30.375 N  r=0.8751 m
omega=4.0  L=1.00  m=1.5  (S4,       conical)  -> cosθ=0.61250 θ=52.230° T=24.00 N   r=0.7905 m
omega_min (L=1.00)                              -> sqrt(9.8/1.00) = 3.130495 rad/s
period S1 (omega=3.0)                           -> 2π/3.0 = 2.0944 s
period S4 (theta=52.23°)                        -> 2π√(L cosθ/g) = 1.5708 s
```

Every number matches the architect's skeleton to the precision it quoted (32.0°→32.032°, 75.2°→75.230°, 61.1°→61.056° [rounding], 57.7 N→57.66 N, 24.0 N→24.00 N, 13.5 N→13.50 N). **No arithmetic correction is needed anywhere in this concept** — the architect's own numbers were already carefully derived; my job was to verify them and to measure the four engine behaviors §0 asked for. This differs from the sibling concept, where several numbers needed correction; here the design survives untouched.

Arrow-band check (floor 11.4583 N, cap 58.3333 N — read directly from `field_3d_renderer.ts:43355–43360`, shared by both branches):

| state | quantity | value(s) | margin from floor/cap |
|---|---|---|---|
| S1 | T | 13.50 N | 17.8% above floor |
| S2 | T | 13.50 → 54.00 N | 17.8% above floor → 7.4% below cap |
| S3 | T | 12.96 N | 13.1% above floor (tight, by design — contract's own "run it slow" band) |
| S4 | T, W | 24.00 N, 14.70 N | 109%, 28% above floor |
| S5 | T, W | 17.34 → 57.66 N, 14.70 N | 51%, 1.2% below cap (T deliberately capped short of 58.33) |
| S6 | T, W | 30.375 N (start), 14.70 N | comfortably inside |
| S7 | T | saturates above 58.33 N at slider extremes | disclosed, accepted (§0 Finding 3) |

Every guided-state force is inside the proportional band. **Arrow length ∝ magnitude holds everywhere in this concept's guided states.**

---

## §2 — CORRECTIONS TO THE SKELETON

**None to the physics or the authored numbers.** The only correction is the mechanism note in §0/V2 (the response is an instant reseed under a slow ramp, not a lagged integrator settle) — a clarification of *why* Rule 32a reads as satisfied, not a change to any authored value, state, or fallback choice. Both of Finding 2's fallbacks are declined: **STATE_6 ships exactly as the architect designed it.**

---

## §3 — PER-STATE VARIABLE OVERRIDES / DEFENSIVE VALUES

`force_rig`'s whirl branch does not read `default_variables` any more than the table branch does. Reading the state-entry code (`field_3d_renderer.ts:~45126–45150`): `eng.L = frwPos(wc.string_length_m, 1); eng.m_bob = frwPos(wc.bob_mass_kg, ...); eng.omega_req = frwPos(wc.omega_rad_per_s, ...); frwSeed(eng, ...)` — **every state's `whirl` block is a full re-seed of the constraint on entry**, exactly the pattern the sibling documented for `force_table`'s `strings[]`. Therefore:

- **`variable_overrides` are not required and must not be authored.** Every state declares its own `geometry`, `string_length_m`, `bob_mass_kg`, `omega_rad_per_s`, `show_radius`, `show_velocity` (and `release` where present) in full.
- **Bug #1 (`default_variables_only_first_var_merged`) is satisfied by construction:** there is no merge path for the whirl branch either — `applyForceRigState` rebuilds `eng.L`/`eng.m_bob`/`eng.omega_req` from the state's own object every time, then calls `frwSeed`, so a value can never silently fall back to an engine default.
- **`PM_frSeized` resets on every state entry** (the same global flag `frRunParamRamp` checks is reset by the shared state-entry path both branches use), so a teacher drag in STATE_7 cannot suppress STATE_2/5/6's `param_ramp` on a later re-entry.
- **Rule 32d home-pose continuity:** anchor, string, ball and camera `[0, 3.4, 9.2]` persist in every state. The single declared apparatus change is between STATE_3 (flat) and STATE_4 (conical) — narrated explicitly ("now take the table away and let the ball hang"), the concept's structural hinge, exactly where the architect placed it.
- **`frwSeed` carries the azimuth over** (`frwAzimuth(eng)`) on every `omega`/`L` write, so a ramp reshapes the cone in place rather than teleporting the ball (Rule 32d, confirmed by code and by the smooth θ trajectories in V2).

---

## §4 — WITHIN-STATE MOTION TIMELINE + PER-STATE CONTROL SPEC (Rule 31)

Every branch below is a pure function of the state clock (`eng.t_ms`, rebased to 0 on entry — Rule 26/36).

| state | t-window | what animates | driven by | live control(s) |
|---|---|---|---|---|
| **S1** | 0 – 15 s (continuous) | ball sweeps the flat circle at ω=3.0 (period 2.094 s, ≈7.2 revolutions over the state); velocity arrow rotates continuously, tangent to the path; tension arrow tracks ball→anchor at fixed length (13.5 N); HUD `T`,`v` hold steady | steady orbit (no ramp) | none |
| **S2** | 0 – 1.2 s | apparatus at rest at ω=3.0, T=13.5 N | — | none |
| **S2** | 1.2 – 9.2 s | ω ramps 3.0→6.0 (8 s window); ball visibly quickens; tension arrow lengthens 13.5→54.0 N in step; the circle itself does not change | `param_ramp omega` | `omega` (V3-confirmed tracks) |
| **S2** | 9.2 – 19 s | holds at ω=6.0, T=54.0 N; ball keeps orbiting (no static picture) at the new, faster rate | held ramp value | `omega` |
| **S3** | 0 – 19.6 s | ball circles slowly (m=4.0, ω=1.8, T=12.96 N, v=1.8 m/s; period 3.49 s, ≈5.6 revolutions); only ONE force arrow ever on screen (tension, inward) | steady orbit | none |
| **S3** | 19.6 s | **the string is cut** | `release.at_ms` | none |
| **S3** | 19.6 – 21.0 s (1.4 s of flight) | ball departs straight along the tangent at unchanged speed (v holds 1.8 m/s exactly); dim ghost circle shows the abandoned path; `T` drops to 0; measured distance from axis grows 1.00→2.61 m, safely inside the 2.80 m widened plane (margin 6.9% at freeze) | deleted constraint (frwAccel with `released=true`) | none |
| **S4** | 0 – 22 s (continuous) | conical revolution at ω=4.0 (period 1.571 s, ≈14 revolutions); tension (24.0 N, along string), weight (14.7 N, down) and resultant ΣF (horizontal, inward) all track the revolution; θ holds 52.23° | steady orbit (no ramp) | none |
| **S5** | 0 – 1.2 s | apparatus at rest at ω=3.4, θ=32.0°, T=17.34 N | — | none |
| **S5** | 1.2 – 10.2 s | ω ramps 3.4→6.2 (9 s window); the cone visibly opens (θ 32.0°→75.2°) and rises; T climbs 17.34→57.66 N; the string visibly approaches horizontal and stops short | `param_ramp omega` | `omega` (V3-confirmed) |
| **S5** | 10.2 – 21 s | holds at ω=6.2, θ=75.2°, T=57.66 N; ball keeps sweeping the (now largest) cone | held ramp value | `omega` |
| **S6** | 0 – 1.2 s | apparatus at rest at ω=4.5, θ=61.1°, T=30.4 N | — | none |
| **S6** | 1.2 – ≈8.3 s | ω ramps down 4.5→2.6; the cone visibly closes (θ 61.1°→0°); at ω≈3.13 the clamp engages: guide ring's own radius (`r_m`) hits exactly 0, hiding it by the engine's own `radiusM>1e-4` visibility rule; the ball comes to hang | `param_ramp omega` | `omega` (V3-confirmed, and the handle visibly snaps to and holds 3.1) |
| **S6** | ≈8.3 – 20 s | holds hanging (θ=0°, r=0), amber `ω min = 3.13 rad/s` row visible | clamp hold | `omega` |
| **S7** | 0 – ∞ | conical, ω=4.0 defaults; every slider drag re-seeds the constraint live; the whirl never freezes (Rule 37); driving `omega` below 3.13 hits the honest clamp (handle snaps back, amber row) | `trusted_drag_seizes` | `omega`, `L`, `bob_mass` |

### Rule 32 legibility, verified per state

- **32a cause-before-effect:** for S2/S5/S6 there is a single physical object (the ball's own state) responding to a single ramped input; the ramp is slow (8–9 s), so the change reads as a continuous unfolding rather than a snap — see §0/V2's mechanism note. S1/S4 have no cause/effect pair (steady orbit, exempt). S3's cause (the cut) and effect (the straight departure) are sequential by construction — the cut IS the visible cause, the trail-vs-ghost-circle comparison IS the readable effect.
- **32b only the taught variable moves:** exactly one ramped parameter (`omega`) or none, per state; `m`/`L` never change inside a guided state. S1/S3/S4 ramp nothing. S7 exempt.
- **32c delta cue:** the architect's Delta column (§3 control table) is the on-canvas caption verbatim, unchanged.
- **32d home pose:** camera `[0, 3.4, 9.2]` fixed on every state; anchor/string/ball persist; the one declared apparatus change (S3→S4, flat→conical) is narrated explicitly.
- **32e one glow focal:** exactly one per state — `fr_w_velocity`(S1) · `fr_w_tension`(S2) · `fr_bob`(S3) · `fr_w_resultant`(S4) · `fr_wstring`(S5) · `fr_guide_ring`(S6) · `fr_bob`(S7) — all valid whirl ids, no off-by-one issue (unlike `force_table`'s 0-based `fr_arrow_i`, whirl ids are not indexed).

### Rule 34 canvas budget (per architect, confirmed against the contract)

S1 **no formula** (deliberate — purely qualitative opener) · S2 `T = m ω² r` · S3 **no formula** (deliberate — the picture is the argument) · S4 `T cos θ = m g` · S5 `cos θ = g / (ω²L)` · S6 `ω ≥ √(g/L)` (advanced ring, still algebra-only) · S7 `T = m ω² L` (core-ring, established in S2 with r=L; my §1 cross-check confirms it also holds exactly on the cone). All Unicode (`ω θ ² √ °`), no ASCII transcription anywhere.

---

## §5 — PER-STATE AUTHORING SPEC (hand this straight to json-author)

Shared on every state: `camera_position: [0, 3.4, 9.2]`, `apparatus: "whirl"`, `advance_mode: "manual_click"` except STATE_7. Slider bands are the engine's own defaults (documented explicitly below for clarity; no override needed): `omega` 1.0–6.5 step 0.1 default 4.0 · `L` 0.60–1.40 step 0.05 default 1.00 · `bob_mass` 0.8–4.5 step 0.1 default 1.5.

```jsonc
"slider_controls": {
  "omega":    { "min": 1.0, "max": 6.5, "step": 0.1,  "default": 4.0, "dp": 1 },
  "L":        { "min": 0.60, "max": 1.40, "step": 0.05, "default": 1.00, "dp": 2 },
  "bob_mass": { "min": 0.8, "max": 4.5, "step": 0.1,  "default": 1.5, "dp": 1 }
}
```

### STATE_1 — "The String Pulls Inward" · `core` · duration **15 s**

```jsonc
"caption": "Tension pulls inward, always",
// formula_overlay: none (deliberate)
"force_rig": {
  "apparatus": "whirl",
  "whirl": { "geometry": "flat", "string_length_m": 1.00, "bob_mass_kg": 1.5,
             "omega_rad_per_s": 3.0, "show_radius": true, "show_velocity": true },
  "arrows":   [{ "show": ["tension"] }],
  "readouts": ["T", "v"],
  "controls_visible": [],
  "glow_focal": "fr_w_velocity"
}
```
**narration `text_en` (37 words ≈ 14.8 s; motion continuous for the whole 15 s):**
> "The ball circles at a steady speed, but its direction changes every instant, so the velocity is not constant. The string pulls the ball toward the centre continuously — a nonzero force, unlike the balanced ring's zero sum."

*Prerequisite patch (§ cliff table below) woven in: re-teaches ΣF≠0 against the sibling concept's ΣF=0, and "the string pulls the ball toward the centre" is the foundation sentence for `tension_force`.*

### STATE_2 — "Faster Spin, Larger Pull" · `core` · duration **19 s**

```jsonc
"caption": "Faster spin, larger tension",
"formula_overlay": "T = m ω² r",
"force_rig": {
  "apparatus": "whirl",
  "whirl": { "geometry": "flat", "string_length_m": 1.00, "bob_mass_kg": 1.5,
             "omega_rad_per_s": 3.0, "show_radius": true, "show_velocity": true },
  "arrows":   [{ "show": ["tension"] }],
  "readouts": ["T", "omega", "v"],
  "controls_visible": ["omega"],
  "glow_focal": "fr_w_tension",
  "param_ramp": { "param": "omega", "from": 3.0, "to": 6.0, "start_ms": 1200, "end_ms": 9200 }
}
```
**narration `text_en` (44 words ≈ 17.6 s; ramp pin at 10.8 s, held state runs to 19 s):**
> "Now the ball spins faster. As the spin rate doubles, the tension needed to hold the ball on its circle does not just double — it grows with the square of the spin rate. Watch the string's pull grow far faster than the speed does."

### STATE_3 — "Cut the String" · `core` · duration **21 s** · **PRIMARY AHA · Hook 1**

```jsonc
"caption": "Cut: straight along tangent",
// formula_overlay: none (deliberate)
"force_rig": {
  "apparatus": "whirl",
  "whirl": { "geometry": "flat", "string_length_m": 1.00, "bob_mass_kg": 4.0,
             "omega_rad_per_s": 1.8, "show_radius": false, "show_velocity": true,
             "release": { "at_ms": 19600, "trail": true, "ghost_circle": true } },
  "arrows":   [{ "show": ["tension"] }],
  "readouts": ["T", "v"],
  "controls_visible": [],
  "glow_focal": "fr_bob"
}
```
**narration `text_en` (50 words ≈ 20.0 s; motion window = 1.4 s of flight ending at duration):**
> "The ball has been circling steadily. Now the string is cut. With the inward pull gone, the ball keeps the velocity it had — it moves in a straight line, along the tangent to the circle, at the same speed as before. No force pushes the ball outward, because none exists."

**Timing arithmetic (as required, not copied from the architect):**
```
duration        = 21000 ms   (measured narration 20000 ms + 1000 ms buffer)
at_ms           = duration − 1400 = 19600 ms
reveal pin      = at_ms + 1200    = 20800 ms   <= duration (21000 ms)  ✓  margin 200 ms
flight window   = duration − at_ms = 1400 ms   -- MEASURED safe (V4: 2.6078 m vs 2.80 m plane, 6.9% margin)
pre-cut revolutions = at_ms / period = 19600 / 3490 ≈ 5.6 revolutions
```

### STATE_4 — "Tension's Two Components" · `extended` · duration **22 s** · **SUPPORTING AHA**

```jsonc
"caption": "Tension splits: vertical and inward",
"formula_overlay": "T cos θ = m g",
"force_rig": {
  "apparatus": "whirl",
  "whirl": { "geometry": "conical", "string_length_m": 1.00, "bob_mass_kg": 1.5,
             "omega_rad_per_s": 4.0, "show_radius": true, "show_velocity": false },
  "arrows":   [{ "show": ["tension", "weight", "resultant"], "labels": { "resultant": "ΣF" } }],
  "readouts": ["T", "theta"],
  "controls_visible": [],
  "glow_focal": "fr_w_resultant"
}
```
**narration `text_en` (53 words ≈ 21.2 s; motion continuous for the whole 22 s):**
> "Now gravity joins the picture: the string tilts, and the ball hangs at a steady angle while it circles. The one tension now has two components. Its vertical component balances the pull of gravity on the ball; its horizontal component points at the centre — the net inward force that keeps the ball circling."

### STATE_5 — "Spin Faster, the Cone Opens" · `extended` · duration **21 s** · **Hook 2**

```jsonc
"caption": "Faster spin opens the cone",
"formula_overlay": "cos θ = g / (ω²L)",
"force_rig": {
  "apparatus": "whirl",
  "whirl": { "geometry": "conical", "string_length_m": 1.00, "bob_mass_kg": 1.5,
             "omega_rad_per_s": 3.4, "show_radius": true, "show_velocity": false },
  "arrows":   [{ "show": ["tension", "weight"] }],
  "readouts": ["T", "theta", "omega", "r"],
  "controls_visible": ["omega"],
  "glow_focal": "fr_wstring",
  "param_ramp": { "param": "omega", "from": 3.4, "to": 6.2, "start_ms": 1200, "end_ms": 10200 }
}
```
**narration `text_en` (49 words ≈ 19.6 s; ramp pin at 11.8 s, held state runs to 21 s):**
> "Spin the ball faster, and the cone angle is not something we choose — it is solved by the physics. As the spin rate climbs, the string swings up, closer to horizontal, and the tension climbs sharply. But it never quite reaches horizontal, no matter how fast the ball spins."

*Wording constraint honoured: `ω_min` is never named or implied here.*

### STATE_6 — "Below Minimum Spin, No Cone" · **advanced** · duration **20 s**

```jsonc
"caption": "Too slow: no cone",
"formula_overlay": "ω ≥ √(g/L)",
"force_rig": {
  "apparatus": "whirl",
  "whirl": { "geometry": "conical", "string_length_m": 1.00, "bob_mass_kg": 1.5,
             "omega_rad_per_s": 4.5, "show_radius": true, "show_velocity": false },
  "arrows":   [{ "show": ["tension", "weight"] }],
  "readouts": ["theta", "omega"],
  "controls_visible": ["omega"],
  "glow_focal": "fr_guide_ring",
  "param_ramp": { "param": "omega", "from": 4.5, "to": 2.6, "start_ms": 1200, "end_ms": 9200 }
}
```
**narration `text_en` (46 words ≈ 18.4 s; ramp pin at 10.8 s, held state runs to 20 s):**
> "Slow the spin down, and the cone angle shrinks toward zero. Cosine cannot exceed one, so there is a smallest spin rate below which no cone can exist at all. Below that limit, the string simply hangs straight down, and the ball stops sweeping a circle."

*§0/V2 CONFIRMS this state ships exactly as designed — the clamp engages naturally under the ramp; no fallback used.*

### STATE_7 — "Explore: Spin, Length, Mass" · `core` · `interaction_complete` · duration 0 (open)

```jsonc
"caption": "Change spin, length, mass",
"formula_overlay": "T = m ω² L",
"force_rig": {
  "apparatus": "whirl",
  "whirl": { "geometry": "conical", "string_length_m": 1.00, "bob_mass_kg": 1.5,
             "omega_rad_per_s": 4.0, "show_radius": true, "show_velocity": true },
  "arrows":   [{ "show": ["tension", "weight"] }],
  "readouts": ["T", "v", "omega", "r"],
  "controls_visible": ["omega", "L", "bob_mass"],
  "trusted_drag_seizes": true,
  "glow_focal": "fr_bob"
}
```
**narration `text_en` (19 words; explore = 0/open, exempt from the 25–55 band):**
> "Change the spin rate, the string length, or the mass, and watch how the cone and the tension respond."

*The clamp is native and honest here (harness + §0/V2): driving `omega` below 3.13 snaps the handle back and shows the amber row. Explore-state arrow saturation past 58.33 N at slider extremes is disclosed and accepted (§0 Finding 3), unchanged.*

**Config-surface compliance audit (every state):** `theta` never authored on a flat state (S1/S2/S3 omit it) ✓ · `resultant` never on flat ✓, never co-authored with `centripetal` (never used at all) ✓ · `normal` never authored anywhere (deliberate — screen stays clean) ✓ · every `param_ramp.param` = `omega`, the only rampable whirl token ✓ · every guided-state force inside [11.46, 58.33] N ✓ · `bob_mass` ∈ {1.5, 4.0} ⊂ [0.8, 4.5] ✓ · one `glow_focal` per state, all valid whirl ids ✓ · post-cut flight 1.4 s < measured 1.52 s boundary ✓ · explore = `trusted_drag_seizes` + all three whirl controls ✓.

---

## §6 — MODES REQUIRED BY THE DoD

**Conceptual only.** No `mode_overrides` (Rule 20 [D] active). No `epic_c_branches` (EPIC-L-first). Board mark scheme and derivation sequence are **DEFERRED and NOT drafted** — nothing to build beyond EPIC-L.

---

## §7 — `aha_moment` PHYSICS CHECK

| | statement | ≤15 words | TRUE? | demonstrated? |
|---|---|---|---|---|
| **PRIMARY** (S3) | *"Cut the string and the ball goes straight along the tangent — there is no outward force, and there never was."* | 20 (architect's own count; slightly over 15 but a direct quote of the founder-fixed beat, unchanged) | **TRUE** — harness S7/S8 (parallel post-cut steps, constant speed, tangential departure, zero centrifugal term anywhere in source) + my own V4 measurement (radial distance grows monotonically, straight departure) | **YES** — S3 exactly, ghost circle + trail + `v` unchanged + `T→0` |
| **SUPPORTING** (S4) | *'"Centripetal force" is not a new force — on the cone it is just the horizontal part of the tension the string already has.'* | 21 | **TRUE** — `ΣF` (resultant) is drawn as the same vector the vertical/horizontal decomposition produces; no `centripetal` kind is ever authored, so no second force is ever implied to exist | **YES** — S4, resultant arrow horizontal and inward, tracked live through the revolution |

Cohesion holds: both are the same underlying claim (the real forces present — tension, weight — fully account for the motion; nothing outward is left to exist).

---

## §8 — `misconception_watch` PHYSICS CHECK (Rule 16a)

**Hook 1 — STATE_3.** belief: *"A whirled object is flung outward — cut the string and it flies away from the centre."*
`visual_counter` — physics-checked TRUE: straight tangent trail against the dim abandoned ghost circle, `v` reading the same number before/after, `T→0`. Harness S8: zero centrifugal terms in source, worst outward radial arrow component 0.000.
`one_line_fix` (architect's, Rule 41-clean) — **"Nothing throws the ball outward — with the pull gone it keeps its velocity, straight along the tangent."** Correct physics.

**Hook 2 — STATE_5.** belief: *"Spin fast enough and the string will rise to horizontal."*
`visual_counter` — physics-checked TRUE: θ climbs to 75.23° at ω=6.2 (near the apparatus's authored maximum, T=57.66 N near the 58.33 N cap) and stops short; `cos θ = g/(ω²L)` never reaches 0 for finite ω.
`one_line_fix` — **"Horizontal needs cos θ = 0, and g/(ω²L) is never zero — the string gets close, never level."** Correct; the formula it quotes is already the state's own on-canvas formula surface, so no new notation is smuggled in.

Both are genuine pivots; five states (S1, S2, S4, S6, S7) carry no watch entry, matching the founder guardrail against manufactured per-state hooks.

---

## §9 — ASSESSMENT PHYSICS CHECK (architect's 6 questions, §12(f))

| q | tested idea | teaches_state | keyed distractor | verdict |
|---|---|---|---|---|
| 1 | constant-speed circling still needs a net inward force | S1 | "constant speed ⇒ no net force" | **correct, real belief** |
| 2 | doubling ω quadruples the needed tension | S2 | "doubles it" | **correct** (T∝ω², confirmed) |
| 3 | released ball moves along the tangent at unchanged speed | S3 | "outward along the radius" | **correct, real belief** (the exact misconception S3 confronts) |
| 4 | on the cone, `T cos θ = mg` (T > mg always) | S4 | "T = mg" | **correct** — since cos θ < 1 for any real cone, T = mg/cos θ > mg always |
| 5 | `cos θ = g/(ω²L)`; the string never reaches horizontal | S5 | "horizontal at high enough ω" | **correct** |
| 6 | conical motion exists only for ω ≥ √(g/L) | S6 | "any ω gives some cone" | **correct**, harness-confirmed clamp boundary |

No correction needed — unlike the sibling's Q4, no apparatus-scoping ambiguity exists here since all six questions are already scoped to the whirl. `coverage_map.by_state` covers S1–S6; `non_assessed_states: [S7]`.

---

## §10 — DRILL-DOWN CLUSTER PHRASINGS (5 per cluster, real student voice, plain English)

**STATE_3 clusters**

`why_tangent_not_outward`
- "why does it go straight not outward"
- "if the pull stops why doesnt it fly away from the centre"
- "why tangent and not away from where it was going"
- "shouldnt it move away from the circle not along it"
- "why does the ball go sideways when the string breaks"

`what_you_feel_in_a_turning_car`
- "why do i feel pushed outward in a turning car"
- "if theres no outward force why does my body lean out"
- "is the outward feeling in a car fake"
- "what is actually pushing me against the door when the car turns"
- "why does it feel like a force is throwing me out"

`speed_unchanged_after_release`
- "why does the speed stay the same after the string breaks"
- "shouldnt cutting the string slow the ball down"
- "does the ball speed up once its free"
- "why doesnt losing the pull change how fast it goes"
- "the tension was doing something so why no change in speed"

**STATE_5 clusters**

`deriving_cos_theta_g_over_omega2L`
- "where does cos theta equal g over omega squared L come from"
- "why does L appear and not the radius"
- "can you derive the angle formula step by step"
- "why do we divide the two equations"
- "how do you get from the two force equations to that formula"

`why_the_string_never_goes_horizontal`
- "why cant the string ever become horizontal"
- "what spin would make it exactly horizontal"
- "why does it just get closer and closer but never flat"
- "is there a spin fast enough to make theta 90 degrees"
- "what happens to the tension as it gets close to horizontal"

`tension_larger_than_weight_on_the_cone`
- "how can the tension be bigger than the weight of the ball"
- "does that break newtons third law"
- "why does the string pull harder than the ball weighs"
- "is the extra tension coming from somewhere"
- "why isnt tension just equal to mg on the cone"

---

## §11 — CONSTRAINT CALLOUTS FOR JSON-AUTHOR

1. **`omega_rad_per_s` is authored directly in rad/s — no degree/radian conversion anywhere in this concept.** `theta` is never authored (solved only); there is no `radians()` wrapping concern for json-author since force_rig's whirl branch is engine-native, not `PM_interpolate`-driven (§1 caveat).
2. **Bands, all silently enforced:** `omega ∈ [1.0, 6.5]`, `L ∈ [0.60, 1.40]`, `bob_mass ∈ [0.8, 4.5]`. Every value here is within band (largest bob_mass used: 4.0 ≤ 4.5 ✓).
3. **Arrow band 11.46–58.33 N** — every tension/weight in this concept sits inside it (§1 table above); the only saturation is the explore state's slider extremes, disclosed and accepted.
4. **`glow_focal`** — exactly one whirl id per state, never indexed (unlike `force_table`'s 0-based `fr_arrow_i`): `fr_w_velocity`, `fr_w_tension`, `fr_bob`, `fr_w_resultant`, `fr_wstring`, `fr_guide_ring`, `fr_bob`.
5. **`param_ramp.param` must be `"omega"` in every ramp in this concept** — `L`/`bob_mass` are never ramped (not spec-legal to ramp, per `docs/FORCE_RIG_ENGINE_SPEC.md` §1's `param_ramp` union type).
6. **`release` only on STATE_3.** `at_ms = duration − 1400`; verify `at_ms + 1200 ≤ duration` (holds: 19600+1200=20800 ≤ 21000). **Never push the flight window past 1.5 s** (V4's measured hard boundary — 1.4 s is safe with 6.9% margin, 1.6 s is not).
7. **No `variable_overrides` on any state** (§3) — every state's `whirl` block is authored in full.
8. **Direction discipline (DoD):** the tension arrow always points from the ball toward the anchor, solved by the engine; the velocity arrow is always tangent, solved; no arrow ever points outward from the axis (harness S8 is the standing proof).
9. **`scale_pixels_per_unit`** is not part of this engine's surface — do not author one. World scale is `FR_W_WORLD_PER_M = 2.40`, fixed.
10. **Camera `[0, 3.4, 9.2]` on every state, never changed** — the whirl rig self-centres on the origin; the contract's "a conical state can come closer" offer is declined (Rule 32d, scar candidate 3).

---

## §12 — ENGINE BUG QUEUE CONSULTATION

Local mirror `docs/loop_runs/lom_g/_engine/scar_candidates.sql` read in full (matches architect's §0 citation).

- **Candidate 1 — `field3d_arrowhelper_shaft_invisible_when_collinear_with_apparatus_line` (OPEN, this concept's whirl states are a named recurrence risk):** the whirl tension arrow lies along its own string in every state of this concept, exactly the geometry the scar concerns. No authoring mitigation is possible (renderer-internal); **FLAGGED to quality-auditor/eye-walker** — must be re-verified on the WHIRL branch specifically (the fix shipped `7c6bbb3` was frame-verified on the table).
- **Candidate 9/10 (arrow overrun/framing — FIXED):** every guided-state force is inside [11.46, 58.33] N by construction (§1 table); explore saturation disclosed separately.
- **Candidate 3 (camera target not authorable — OPEN):** accepted; this concept's single fixed camera declines the "conical state can come closer" offer (§11 point 10).
- **Bug #1 `default_variables_only_first_var_merged`** — satisfied by construction (§3): no merge path exists for the whirl branch, every state fully re-seeds.
- **Tray-state D5 note:** dark fleet-wide; eye-walker must judge motion from dense frames by eye (md5-distinctness + adjacent-pair diffs), as the architect flagged.

---

## §13 — BRIEF FOR eye-walker (must be passed on)

1. **Scar candidate 1 is open and this concept is a second named victim (after `equilibrium_of_particles`).** For every state, confirm the tension/weight/resultant arrow's shaft is distinguishable from `fr_wstring`, and that arrow tip position is proportional to magnitude across both flat AND conical geometries (worst case: S5's near-horizontal 75° string at the highest T=57.66 N).
2. **STATE_2/5/6's ramp reads as a slow continuous unfolding, not a snap** (§0/V2 mechanism note) — confirm the dense frames show the ball's speed/cone visibly changing gradually across the whole 8–9 s ramp window, not a sudden jump partway through.
3. **STATE_6's payoff is the guide ring disappearing exactly as the cone closes to zero, with the amber row appearing** — confirm this is visible in the frozen/dense frames near t≈8.3s and held afterward (this is the concept's advanced-ring aha; if it isn't legible, that is the state to flag, not a physics defect — the underlying numbers are confirmed correct in §0/V2).
4. **STATE_3's frozen frame (reveal pin at 1.2 s post-cut) must show the straight trail clearly separated from the dim ghost circle**, with the bob still comfortably on the widened plane (measured margin 18.1% at this instant — should read as unambiguous).
5. **STATE_5 vs STATE_6 is not a comparison pair the way the sibling's cable states were** — S5 opens toward horizontal and stops short; S6 closes to a hang. Confirm both individually legible; they need not be shown side by side.

---

## §14 — SELF-REVIEW

- [x] Every symbol referenced in the state narratives appears in `variables` (T, θ, v, ω, r, W, ω_min, m, L, g).
- [x] Every formula that computes an angle argument for sin/cos/acos wraps it in `radians()`/produces degrees via `degrees()`, matching the schema convention (documented; not `PM_interpolate`-fed here per §1's caveat).
- [x] Per-state live controls declared and match the architect's table exactly: `[]`×4, `["omega"]`×3, all three on explore. V3-measured to actually track for the whirl branch specifically (not assumed from the table branch's proof).
- [x] `variable_overrides` correctly declared **not required**, with the reason and equivalent defensive discipline documented (§3).
- [x] Board mark scheme **skipped entirely** (Rule 20 [D]).
- [x] 6 drill-down clusters × 5 phrases, real student voice, plain English.
- [x] `constraints` block: 6 short factual assertions, direction/conservation discipline first.
- [x] Numerical sanity checks run and cross-verified independently: T=mg at m=1.5,ω=3.0→13.5N; cosθ=g/(ω²L) and T=mω²L verified at every authored ω against an independent Python re-derivation, matching the architect's own numbers to their stated precision.
- [x] Motion timeline written for all 7 states; every branch a pure function of the state clock; no two states share a motion; no static guided state (S6's late hang is the taught physical outcome, not an authoring lapse — precedented by the sibling's zero-dot latch).
- [x] **Rule 32 verified per state:** one taught variable per state; one glow focal each; home pose and camera never change; S3's cause(cut)/effect(departure) sequencing is structural.
- [x] **Rule 31a word budget:** 37 / 44 / 50 / 53 / 49 / 46 words on `text_en` for S1–S6, all inside 25–55; every state's motion/hold window ≥ its narration length (15/19/21/22/21/20 s vs 14.8/17.6/20.0/21.2/19.6/18.4 s at 2.5 words/s). Explore = 19 words, exempt.
- [x] **Rule 38c notation ladder:** every formula surface is algebra-only (`T=mω²r`, `T cos θ=mg`, `cos θ=g/(ω²L)`, `ω≥√(g/L)`, `T=mω²L`); no calculus/vector operators anywhere; nothing needs to be FLAGged to the founder on this count. **38d dialect:** "spin rate (ω)" dual-labelled at first appearance (S1's caption uses "tension"/"spin" plainly; the bare Greek letters live only in formula surfaces per Rule 24/30).
- [x] **Rule 41 plain language:** no idioms/metaphors/personification anywhere; "circles", "swings", "climbs", "shrinks", "hangs" are the literal physical words; "flung outward" appears only inside the belief being confronted.
- [x] **Rule 35 anchor:** whirled ball/washing-line/turning-car anchors are universal; no country-specific content in any string.
- [x] Engine bug queue consulted via the tray mirror; candidate 1 documented as a second recurrence risk and FLAGged to quality-auditor + eye-walker.
- [x] **DC Pandey check: no formula, explanation or example problem imported from any external book.** Every number was derived here from the whirl's own force-balance equations and Newton's first law, then measured against the real engine.

---

## §15 — WHAT I VERIFIED, CONFIRMED, AND FLAGGED (for the founder)

Unlike the sibling concept, **no authored number required correction.** The architect's design survives untouched. What changed is that four previously-ASSUMED behaviors are now MEASURED FACTS:

| # | item | verdict |
|---|---|---|
| V1 | whirl `param_ramp` reveal pin | **CONFIRMED** = `end_ms + 1600` — identical code path to `force_table`, no branch exists. Every S2/S5/S6 duration budget stands as designed. |
| V2 | clamp under a down-ramp through ω_min | **CONFIRMED TRUE** — same write path (`frwSeed`→`frwClampOmega`) as a slider drag. STATE_6 ships exactly as designed; neither Finding-2 fallback used. |
| V3 | visible `omega` slider tracks a whirl ramp | **CONFIRMED TRUE**, including snapping to and holding the clamped value. `controls_visible:["omega"]` stands on S2/S5/S6. |
| V4 | STATE_3 post-cut flight stays on the widened plane | **CONFIRMED**, with a measured hard boundary (≈1.52 s) the architect's 1.4 s design sits inside with 6.9% margin — tighter than "~1.4 s" reads, so flagged as a hard **do-not-exceed-1.5s** rule for json-author. |

One mechanism clarification (not a value change): the ramp states' Rule 32a legibility rests on the ramp's slow duration, not on a discrete integrator-lag stagger — the whirl reseeds instantly on every write, unlike the table's genuinely damped settle.

---

## Files

- **Physics block (this document)** → to be written to `C:\Tutor\physics-mind-lom-g\docs\loop_runs\lom_g\uniform_circular_motion\02_physics_block.md`
- **Measurement probe (new, untracked, nothing committed):** `C:\Tutor\physics-mind-lom-g\src\scripts\_scratch_ucm_probe.ts` — re-run with `npx tsx src/scripts/_scratch_ucm_probe.ts`. Artifacts in `C:\Tutor\physics-mind-lom-g\.scratch_ucm_probe\` (`ucm_whirl.html`, `flight_final.png`).
- **Untouched, as instructed:** `C:\Tutor\physics-mind-lom-g\src\scripts\_scratch_fr_seams.ts`, `src\lib\renderers\field_3d_renderer.ts`, `src\lib\validators\visual\deriveStateMeta.ts`, every concept JSON, every registration site.

