# PHYSICS BLOCK — `kinetic_energy_definition` (ch6 concept #3)

> Input: `skeleton.md` (CYCLE 1, sealed) + `founder_proxy_A_cycle2.md` (`DESIGN_OK`, six watch items).
> Author: `alex:physics_author`, 2026-08-02. Renderer: `field_3d` / `newtons_laws_body` + `energy_layer`.
> Modes required by the DoD: **EPIC-L only.** Conceptual-only (Rule 20 [D]) — no `mode_overrides`,
> no board mark scheme, no competitive overrides. Output section 4 is therefore deliberately empty.

## VERDICT LINE

**Four RISK probes RUN against the real assembled engine. Three PASS outright. RISK-3 passes on the
physics and fails only my own reader (the mass billboard is `nlb_body_label`, not `nlb_body_mass`) —
re-measured and PASSING.** Every sealed number in the dispatch table was independently re-derived and
agrees to every printed decimal; nothing is refuted on arithmetic.

**ONE finding I DO refute, with measured evidence: §3's claim that the S2 carts' "screen-x extents
never close" is FALSE.** At the settled `[3, 2.5, 9]` camera the two carts **OVERLAP by 17.1 px at the
state's home pose**, and the overlap recurs at every 2000 ms loop reset. A JSON-only, zero-number
remedy is measured and named in §6 (CALLOUT-2): author the **fast cart FIRST** in `bodies[]`. Measured
result **−17.1 px → +33.8 px**, with the energy panel's group order, every K value and every fill
fraction **bit-identical**. The same one-line change takes S4 from +14.1 px to +48.5 px.

Probe scripts (throwaway, delete after Checkpoint B):
`src/scripts/_scratch_ke_probe.ts` · `_scratch_ke_probe_cfg.ts` · `_scratch_ke_probe_read.ts` ·
`_scratch_ke_probe2.ts` · `_scratch_ke_probe3.ts` · `_scratch_ke_probe4.ts` · `_scratch_ke_probe5.ts`
Frames: `.scratch_ke_probe/`.

---

## 0. Engine bug queue — consulted LIVE this dispatch

`npx tsx src/scripts/query_engine_bug_queue.ts --owner alex:physics_author` — 10 rows.

| Row | Disposition in this block |
|---|---|
| `DUALPANEL_EQUATION_INCOHERENT` / `DUALPANEL_RANGE_OFF` / `DUALPANEL_LIVEDOT_OFF_GRAPH` | **N/A** — single panel, no Panel B, no graph, no `live_dot`. Declared, not skipped. |
| `field3d_nlb_arrow_min_length_floor_collapses_small_force_visibility_and_ratio` | **SATISFIED with margin.** S3's weight arrow at its SMALLER end (m = 2 kg) is `19.6 N × 0.048 = 0.9408` world units — **1.71× the `NLB_ARROW_MIN_LEN` floor of 0.55**, so the floor never bites and the authored 2:1 length ratio is real. Measured at the engine: 0.9408 → **1.8816**, ratio 2.0000. The upper clamp bites at 58.33 N ≈ **5.95 kg**, so `to: 4` clears it. |
| `concept_ships_zero_narration_glow_bindings` | **SATISFIED.** Every one of the 23 `tts_sentences` in §7 carries a `glow`, each naming an id that exists in that state (id list + validity argument in §6 CALLOUT-9). Zero is not a design choice here. |
| `teach_color_each_element_by_its_own_sign` | **SATISFIED.** Each cart is coloured by its own identity (`cart_a` #42A5F5, `cart_b` #EF5350); the K bars are the engine's fixed amber and are told apart by their captions, never by colour. |
| `pcpl_radians_helper_missing` | **N/A and structurally unreachable** — this is a `field_3d` concept, and every surface in it is flat (`theta_deg: 0` in all six states). **No formula in this block contains an angle, so `radians(` appears nowhere.** |
| `narration_references_a_prerequisite_concepts_apparatus_that_is_not_on_screen` | **SATISFIED.** S5's friction bridge names the IDEA and the on-screen object ("This floor is rough"), never #2's crate or its work bars. S3's weight bridge names the arrow that is on screen in that same state. |
| `teach_reveal_synced_to_narration` | **SATISFIED with a declared exception.** No `phases`, no `at_ms`, no authored reveal anywhere. The ONE timed event is S5's checkpoint stamp, which is physics-driven at t = 204 ms — earlier than the sentence that names it. **This is correct and deliberate: the stamp LATCHES and holds to the end of the state**, so when narration reaches sentence 3 the value is standing there to be pointed at. Declared so quality-auditor scores it rather than filing an early-pop. |
| `teach_show_quantity_live_when_named` | **SATISFIED** — the per-sentence glow map in §7 lights the named instrument on the beat that names it. |

Inherited/declared, NOT routed (carried forward from skeleton §0):
`nlb_friction_vector_first_frame_reveal_tint_bypasses_seam_q_ink_fix` (OPEN, engine-owned, binds S5
only) and the Rule-16a ghost-bar descope. Neither is re-filed here.

Also carried, from Checkpoint A's own ride-along: the engine comment at **L43206 claiming "two compact
side-by-side bar groups" is WRONG** — I measured the layout as vertically stacked (`marginTop: 9px`),
group 1 exactly 9.0 px below group 0 at the same left edge. `peter_parker:field3d_surgeon` ride-along,
comment-only, not blocking.

---

## 1. `physics_engine_config`

```json
{
  "variables": {
    "m": {
      "name": "cart mass",
      "unit": "kg",
      "min": 1,
      "max": 6,
      "default": 5,
      "step": 0.5
    },
    "v0": {
      "name": "launch speed",
      "unit": "m/s",
      "min": -5,
      "max": 5,
      "default": 4,
      "step": 0.5
    },
    "v": {
      "name": "speed",
      "unit": "m/s",
      "min": 0,
      "max": 5,
      "default": 4,
      "derived": "the integrator's own live value; no slider anywhere in this concept writes v directly"
    },
    "g": {
      "name": "gravitational acceleration",
      "unit": "m/s^2",
      "constant": 9.8
    },
    "mu_k": {
      "name": "coefficient of kinetic friction (STATE_5 only)",
      "unit": "",
      "min": 0,
      "max": 1,
      "default": 0
    },
    "mu_s": {
      "name": "coefficient of static friction (STATE_5 only)",
      "unit": "",
      "min": 0,
      "max": 1,
      "default": 0
    },
    "K": {
      "name": "kinetic energy",
      "unit": "J",
      "min": 0,
      "max": 75,
      "derived": "0.5 * m * v * v"
    },
    "w": {
      "name": "weight",
      "unit": "N",
      "derived": "m * g"
    }
  },

  "formulas": {
    "K": "0.5 * m * v * v",
    "weight": "m * g",
    "bar_fill_fraction": "K / bar_max_J",
    "friction_deceleration": "mu_k * g",
    "distance_to_reach_speed": "(v0 * v0 - v * v) / (2 * mu_k * g)",
    "time_to_reach_speed": "(v0 - v) / (mu_k * g)",
    "checkpoint_track_coordinate": "initial_position_m + (v0 * v0 - v_target * v_target) / (2 * mu_k * g)",
    "weight_arrow_world_length": "min(2.80, max(0.55, m * g * 0.048))"
  },

  "computed_outputs": {
    "K_J": "0.5 * m * v * v",
    "K_ratio_speed_doubled": "4",
    "K_ratio_mass_doubled": "2",
    "stopping_distance_at_mu_k": "(v0 * v0) / (2 * mu_k * g)",
    "explore_max_K": "0.5 * 6 * 5 * 5"
  },

  "constraints": [
    "K = 0.5*m*v^2 is never negative: m > 0 and v^2 >= 0 for every real v",
    "K = 0 if and only if v = 0",
    "K is a scalar: it has size but no direction, and K(+v) = K(-v)",
    "at fixed m, doubling v multiplies K by 4; at fixed v, doubling m multiplies K by 2",
    "the friction deceleration a = mu_k * g does not depend on the mass",
    "g = 9.8 m/s^2 (the engine constant NLB_G); every surface in this concept is flat, so there is no gravitational potential energy anywhere and no angle enters any formula"
  ]
}
```

**Notes binding on json-author.**

- **No `radians()` anywhere, by construction.** `surface.theta_deg = 0` in every state, so no formula in
  this concept takes an angle argument. A `radians(` anywhere in this JSON is a bug, not a style choice.
- `min`/`max`/`default`/`step` on `m` and `v0` ARE the S6 slider spec and go into
  `field_3d_config.slider_controls` **with the key `default`, never `def`** (`nlbSc` reads `o["default"]`,
  L42232-35 — measured live: the rows render `-5..5 step 0.5 = 4` and `1..6 step 0.5 = 5`).
- `v` is declared for documentation only. **No state exposes a `v` slider** — `v0` seeds it and the
  integrator owns it thereafter. This is what makes every guided peak exactly determined.
- `mu_s`/`mu_k` default to 0 because five of six states author `surface.frictionless: true`; only S5
  overrides them to 0.5.

### Numerical sanity check (my own arithmetic, run independently of the skeleton)

| State | m | v | K = ½mv² | K / bar_max_J | Skeleton | Engine, measured |
|---|---|---|---|---|---|---|
| S1 | 5 | 4 | **40.0000 J** | 40/45 = **88.8889 %** | 88.9 % | `40.0 J`, `style.height = 88.889%` |
| S2 slow | 5 | 2 | **10.0000 J** | **22.2222 %** | 22.2 % | `10.0 J`, `22.222%` |
| S2 fast | 5 | 4 | **40.0000 J** | **88.8889 %** | 88.9 % | `40.0 J`, `88.889%` |
| S3 start | 2 | 4 | **16.0000 J** | **35.5556 %** | 35.6 % | (ramp start) |
| S3 end | 4 | 4 | **32.0000 J** | **71.1111 %** | 71.1 % | `32.0 J`, `71.111%` |
| S4 each | 5 | ±3 | **22.5000 J** | **50.0000 %** | 50.0 % | `22.5 J`, `50%` (both groups) |
| S5 launch | 3 | 5 | **37.5000 J** | **83.3333 %** | 83.3 % | — |
| S5 flag | 3 | 4 | **24.0000 J** | **53.3333 %** | 53.3 % | stamp `K = 24.0 J` |
| S6 default | 5 | 4 | **40.0000 J** | 40/80 = **50.0000 %** | 50.0 % | `40.0 J`, `50%` |
| S6 ceiling | 6 | 5 | **75.0000 J** | 75/80 = **93.7500 %** | < 80 | (slider-bounded) |

**Concept peak 40.0 J against a 45 J scale.** The overflow warn fires only at `val > maxJ + 1e-9`
(L43798) and no guided state carries a slider, so it is unreachable — **measured: zero
`[PM_NLB_ENERGY_SCALE]`, `[PM_NLB_ENERGY_CLAMP]` and `[PM_NLB_ENERGY_DRIFT]` lines across the entire
six-state run.**

### S5 friction arithmetic — re-derived from scratch, agrees to 6 d.p.

`a = mu_k · g = 0.5 × 9.8 = 4.9 m/s²`, mass-independent.

| Quantity | My derivation | Sealed | Engine, measured |
|---|---|---|---|
| flag distance d(v=4) | (25 − 16) / (2 × 4.9) = **0.918367347 m** | 0.9184 | — |
| flag `s_m` | −5.4 + 0.918367347 = **−4.481633** | −4.481633 | authored as arithmetic |
| flag time | (5 − 4) / 4.9 = **0.204081633 s** | 0.204082 | stamped at **200.0 ms** |
| flag K | ½ × 3 × 16 = **24.0 J** | 24.0 | stamp reads `K = 24.0 J` |
| flag v (interpolated) | exactly **4.00 m/s** | 4.00 | stamp reads `v = 4.00 m/s` |
| launch K | ½ × 3 × 25 = **37.5 J** | 37.5 | — |
| rest distance | 25 / 9.8 = **2.551020408 m** | 2.5510 | — |
| rest position | −5.4 + 2.551020408 = **−2.848980 m** | −2.849 | **s = −2.8489** |
| rest time, analytic | 5 / 4.9 = **1.020408163 s** | 1.0204 | — |
| rest time, discrete h = 1/60 | v₆₁ = +0.018333, v₆₂ = −0.063333 ⇒ **t = 62/60 = 1.033333 s** | 1.033333 | v = 0 at the 1260 ms pin |
| frozen pin | clamp(0.60 × 2100, 150, 1950) = **1260 ms** | 1260 | pin honoured |
| margin, rest | 1260 − 1033.333 = **226.667 ms** ≥ 167 | 226.7 | — |
| margin, stamp (worst discrete + 2 frames) | 1260 − 237.4 = **1022.6 ms** ≥ 167 | 1023 | — |
| crossing ÷ R | 204.082 / 2100 = **0.09718** ≪ 0.55 | 0.097 | measured **0.0952** |

**Every sealed number survives contact with the engine. Nothing refuted.** One refinement worth
recording: `NLB_STOP_EPS_V = 0.01 m/s`, and v₆₁ = 0.018333 is ABOVE it, so the stop-band does not
capture the cart a frame early — the discrete rest is n = 62 for both reasons, not just the sign flip.

### The three track bounds — WATCH ITEM 2 discharged, with the 0.05 m stated

| Bound | Value | Source | What it governs |
|---|---|---|---|
| engine clamp | **±6.0 m** | `nlbBoundsM` returns `{lo: −lenM, hi: lenM}` (L45599-616) | where a body is arrested; `[PM_NLB_ENERGY_CLAMP]` would fire |
| slab-geometry overhang threshold | **±5.45 m** | `NLB_BODY_SIZE = 0.55` **world units** ÷ 2 = 0.275 world; `NLB_WORLD_PER_M = 0.5` ⇒ **half-width 0.55 m**; slab drawn to ±6.0 ⇒ 6.00 − 0.55 = **5.45 m** | the last centre position at which a cart is fully on the drawn floor |
| **authored run limit** | **±5.4 m** | **5.45 m minus a DECLARED 0.05 m safety margin** | every home pose and every in-loop position |

**Watch item 2 is now stated rather than conflated: 5.4 is 5.45 with an explicit 0.05 m safety
margin**, i.e. a cart at exactly ±5.4 still has 0.05 m of floor beyond its outer edge. Every home pose
in this concept sits at −5.4 or inside it, so the margin is consumed exactly and never exceeded.

**Measured in-loop peaks (whole loop swept frame by frame at h = 1/60):**

| State | R | computed position at t = R | measured peak \|s\| in the loop | margin to 5.4 |
|---|---|---|---|---|
| S1 | 2400 | +4.200 | 5.400 (the home pose itself) | 0.000 (at the declared limit) |
| S2 | 2000 | −1.400 / +4.600 | cart_a home −5.400; cart_b peak **+4.536** | 0.864 for the moving cart |
| S3 | 2400 | +4.200 | 5.400 (home pose) | 0.000 (at the declared limit) |
| S4 | 1300 | ±5.100 | **±5.088** | **0.312** |
| S5 | 2100 | at rest at −2.849 from 1.033 s | 5.400 (home pose) | 0.000 (at the declared limit) |

**WATCH ITEM 1 — S4 stays at 1300 ms. I do not take the 1400 ms option.** Checkpoint A's reasoning is
correct and my measurement makes it slightly better than it thought: at R = 1300 the engine's rewind
actually fires a frame EARLY (measured peak ±5.088 at t_ms = 1296, against Checkpoint A's conservative
±5.150 at 1316.7 ms), so the real margin is **0.312 m to the run limit and 0.362 m to the overhang
threshold**. At R = 1400 the carts reach ±5.400 *at* t = R and the design margin is zero by
construction; a frame-timing shift in either direction lands on the threshold. **1300 ms, authored.
If Checkpoint B wants a calmer loop the ceiling is 1350 ms, not 1400.**

---

## 2. Per-state variable notes (`variable_overrides` and their justification)

The `newtons_laws_body` scenario seeds every body from that state's own `bodies[]` block, so the
defensive `variable_overrides` pattern (`hinge_force` STATE_4, `field_forces` STATE_5) is expressed
here as **per-state body seeds that must be authored explicitly on every state, never inherited**.
Bug #1 `default_variables_only_first_var_merged` applies directly: a state that omits a value gets the
concept default, and in four of these six states that default is WRONG.

| State | Explicit per-state value | Why it MUST be authored, not inherited |
|---|---|---|
| S1 | `mass_kg: 5`, `initial_velocity_mps: 4`, `frictionless: true` | The concept-level m default is 5 and v0's default is also 4 — inheriting looks harmless and is a trap the moment S6's slider default is retuned. Author both. |
| S2 | `cart_a`: 5 kg / **2 m/s**; `cart_b`: 5 kg / **4 m/s** | The whole state is the 2 : 4 speed contrast. `cart_a` at the default 4 m/s would render two 40.0 J bars and **silently delete the PRIMARY aha**. |
| S3 | `mass_kg: 2` **and** `param_ramp.from: 2` | Engine authoring contract 7.1 (L1573-75): the body's own value for the ramped param must EQUAL `from`, or state entry visibly jumps from 5 kg to 2 kg on frame 1. Verified live: at t = 0 the billboard reads `cart = 2 kg` with no jump. |
| S4 | `cart_a`: **−1.2 m, −3 m/s**; `cart_b`: **+1.2 m, +3 m/s** | The sign of v IS the state's content. A missing minus makes two carts run the same way and the SUPPORTING aha evaporates while every gate still passes. |
| S5 | `mass_kg: 3`, `initial_velocity_mps: 5`, `mu_s: 0.5`, `mu_k: 0.5`, **`frictionless` OMITTED** | 3 kg (not 5) is what keeps the concept peak at 40.0 J and `bar_max_J = 45` reachable. `surface.frictionless: true` here would hard-zero both mu values and the cart would never slow — the state's entire claim, silently false, with the bar frozen at 37.5 J. |
| S6 | `mass_kg: 5`, `initial_velocity_mps: 4`, `frictionless: true`, `bar_max_J: 80` | The sandbox's home pose must equal the slider defaults or the first frame disagrees with the knobs. |

**`surface.frictionless: true` is REQUIRED on S1, S2, S3, S4 and S6 and FORBIDDEN on S5.** Without it
on S1 to S4 the carts decelerate and every constant-K claim in the narration is false on screen; the
`bodies[]` mu values being absent is NOT sufficient, because a body with no mu still runs the friction
branch with whatever the surface carries.

---

## 3. Within-state motion timeline + per-state control spec (Rule 31 — REQUIRED)

**Every branch below is a pure function of `time − stateStartTime` (Rule 26).** No `pause_after_ms`,
no `wait_for_answer`, no prediction beat — this is a new concept, so no legacy Socratic timing is
carried. `advance_mode`: `manual_click` on S1 to S5, `interaction_complete` on S6 (2 distinct modes,
Gate 12 satisfied). Rule 37 makes S6 free-run forever with no extra authoring.

### The control spec, first — it is what makes every peak exactly determined

| State | Live control(s) | `controls_visible` | Verified |
|---|---|---|---|
| S1 | **none** | `[]` | measured: 0 visible slider rows |
| S2 | **none** | `[]` | measured: 0 visible slider rows |
| S3 | **none** | `[]` | measured: 0 visible slider rows |
| S4 | **none** | `[]` | measured: 0 visible slider rows |
| S5 | **none** | `[]` | measured: 0 visible slider rows |
| S6 | v0 in [−5, 5] step 0.5 (default 4) · m in [1, 6] step 0.5 (default 5) | `["v0","m"]` | measured: exactly 2 rows, −5..5 step 0.5 = 4 and 1..6 step 0.5 = 5 |

**This is load-bearing and must not be improved.** Zero sliders on S1 to S5 is precisely why every K
peak in the table above is exactly determined, why the `[PM_NLB_ENERGY_SCALE]` warn is unreachable, and
why the frozen-pin margins are provable. Adding a slider to any guided state breaks all three at once.
S6's drag is a **reposition-and-stop** gesture (`nlbApplyBodyDrag` sets `b.v = 0`, L42578), not a live
control — and it is the `intro` preset's only route to K = 0, so it is used, not merely tolerated.

### The motion timeline

| State | t-window | What animates — a pure function of the state clock | Driven by | Live controls |
|---|---|---|---|---|
| **S1** | 0 to 2400 ms, forever | ONE cart translates left-to-right at a constant 4 m/s from s = −5.4; `loop_reset_ms = 2400` rewinds it to the left edge and it crosses again | v (fixed 4) | none |
| **S1** | continuous | the K bar HOLDS at 40.0 J / 88.889 %; the HUD row holds v = 4.00 m/s | K = half m v squared | none |
| **S2** | 0 to 2000 ms, forever | TWO carts translate together in their own z lanes, the fast one pulling away: world gap 2.0 m to 6.0 m over the loop | v (2 and 4) | none |
| **S2** | continuous | the two stacked K bars HOLD at 10.0 J (22.222 %) and 40.0 J (88.889 %) — a 41 px stub above a 165 px near-full track | K per body | none |
| **S3** | 0 to 7200 ms, once, then holds | the mass ramp climbs m linearly from 2 to 4 across THREE traverses (`loop_reset_ms = 2400`) and then holds at 4 kg forever | the state clock | none |
| **S3** | same window | **three things move together and NOTHING else does** (Rule 32b): the weight arrow grows **0.9408 to 1.8816** world units, the billboard climbs from cart = 2 kg to cart = 4 kg, and the K bar climbs 16.0 to 32.0 J (35.556 % to 71.111 %) | m | none |
| **S3** | continuous | the HUD speed row sits **unmoved at v = 4.00 m/s** — measured to 1e-9 across the whole 8.4 s sweep | (nothing) | none |
| **S4** | 0 to 1300 ms, forever | TWO carts slide APART from −1.2 and +1.2 m at −3 and +3 m/s; the gap only grows, reaching ±5.088 m before the rewind | v (−3 and +3) | none |
| **S4** | continuous | both K bars HOLD at exactly 22.5 J / 50 % — same fill, same numeral, opposite motions | K with v squared | none |
| **S5** | 0 to about 1033 ms | ONE cart decelerates on a rough floor at a = mu_k g = 4.9 m/s² from 5 m/s; the K bar falls **continuously** from 37.5 J (83.333 %) | v(t) = 5 − 4.9t | none |
| **S5** | **about 204 ms**, one-shot, LATCHES | the cart crosses the flag at s = −4.481633; the stamp lands beneath K = half m v squared and holds to the end of the state | the crossing detector | none |
| **S5** | about 1033 to 2100 ms | the cart stands at rest at s = −2.849 and the K bar reads exactly **0.0 J** — the state's titled claim, and what the 1260 ms frozen pin photographs | v = 0 | none |
| **S6** | continuous, free-running (Rule 37) | the cart runs and wraps forever; a v0 drag re-launches it live, an m drag re-weights it live, and the K bar tracks both continuously; a body drag parks it at v = 0 and the bar drops to 0.0 J | v0, m, drag | **ALL (v0, m)** |

### Rule 32 audit

- **32a (cause before effect).** S1 / S2 / S4: the carts are the only moving objects and the bars are
  *readings*, not events — nothing is being caused on screen, so there is no ordering to violate.
  **S5 is the one true cause-then-effect chain and it obeys 32a strictly:** the cart crosses the flag
  first and the stamp lands after; the cart comes to rest first and the bar settles on 0.0 J after.
  **S3 carries the skeleton's ARGUED EXEMPTION and I re-verified its premise at source:**
  `nlbUpdateMassText` (L40597-611), `nlbPublishEnergy` (L43209) and `nlbUpdateEnergyPanel` all read the
  same `b.m` on the same frame — there is no delay mechanism and none could be authored. Its cause is a
  continuously varying PARAMETER, not an event, so cause and effect are simultaneous by physics; 32a's
  readability purpose is met instead by making the cause a visible OBJECT (an arrow that doubles
  exactly) rather than a digit. **Narration order carries the rest of the load: in S2, S3 and S4 the
  narration names the carts and the mass FIRST and the readings SECOND, so the teacher's words run
  cause then effect even where the pixels are simultaneous.**
- **32b (only the taught variable moves).** S3 is the only state with a varying parameter, and only
  three correlates of m move; v is pinned to 4.000000000 (measured). S1/S2/S4 change nothing but
  position. S5 changes only v and its consequences. S6 is explore-exempt.
- **32c (delta cue at most 5 words).** "Moving cart, K above zero" (5) · "Double speed, four times K"
  (5) · "Double mass, double K" (4) · "Backward: the same K" (4) · "K falls to zero" (4) ·
  "Change speed and mass" (4). All within budget.
- **32d (home pose continuity).** Two stable ids all the way through; the mesh set is built once from
  the union; the camera moves only when the body count does. **The energy panel's bar can never move
  between states — the engine re-orders `bars` into its own fixed panel order (L43437-43) and the
  panel DOM is built once.**
- **32e (one focal).** ZERO `glow_focal` at state level, per state, argued in the skeleton and kept.
  Emphasis is carried entirely by the per-sentence glow bindings in section 7, exactly one at a time.
  Because no state authors a focal, `glowActive` is false under THE EYE (which posts no `SET_GLOW`),
  so **the frozen baselines see the undimmed picture** and the OPEN scar
  `authored_state_glow_focal_silently_voids_every_tts_sentence_glow` is avoided by construction.

---

## 4. Board-mode mark scheme + derivation sequence — DEFERRED

**SKIPPED deliberately.** The conceptual-only directive (Rule 20 [D]) is active: no `mode_overrides`,
no board mark scheme, no `derivation_sequence`, no competitive overrides are authored for this concept.
The DoD requires **EPIC-L only**. json-author must neither skip a required mode nor half-build a
deferred one — for `kinetic_energy_definition` there is exactly one mode and this section is empty by
instruction, not by omission.

---

## 5. Drill-down cluster phrasings (5 real student phrases per cluster)

Six clusters, all from the skeleton section 6. These become `trigger_examples TEXT[]` in the Supabase
seed. Plain English, real student voice, no Hinglish, no teacher register.

### S2 — `why_v_squared`
- "why is v squared and not just v"
- "where does the square come from in half m v squared"
- "why do we square the speed for energy"
- "is the square just a formula or does it mean something"
- "momentum has no square so why does energy"

### S2 — `double_speed_quadruple_energy`
- "twice as fast but four times energy how"
- "why not twice the energy if twice the speed"
- "double speed four times ke i dont get it"
- "does 3 times the speed mean 9 times the energy"
- "why did the bar jump so much for a small speed change"

### S2 — `speed_vs_momentum_scaling`
- "difference between momentum and kinetic energy"
- "why is momentum mv but energy half m v squared"
- "two bodies same momentum different kinetic energy possible"
- "which one doubles when speed doubles momentum or energy"
- "is momentum the same thing as kinetic energy"

### S4 — `negative_velocity_positive_energy`
- "velocity is negative so is kinetic energy negative"
- "moving backward means minus energy right"
- "if v is minus 3 what is half m v squared"
- "why doesnt the minus sign go into the energy"
- "does direction change the kinetic energy"

### S4 — `energy_is_a_scalar`
- "does kinetic energy have a direction"
- "is kinetic energy a vector or scalar"
- "why no arrow for kinetic energy"
- "can i add kinetic energies like vectors"
- "energy has magnitude only meaning what"

### S4 — `kinetic_energy_cannot_be_negative`
- "can kinetic energy ever be negative"
- "what would negative kinetic energy even mean"
- "is zero the smallest kinetic energy"
- "when is kinetic energy zero"
- "does a body at rest have kinetic energy"

---

## 6. Constraint callouts — the special-case encoding json-author must get right

### CALLOUT-1 — `energy_layer.body_ids` on S2 and S4. The single most dangerous omission.
```
S2, S4:  "energy_layer": { "bars": ["K"], "bar_max_J": 45, "precision": 1,
                           "body_ids": ["cart_a", "cart_b"] }
S1,S3,S5:"energy_layer": { "bars": ["K"], "bar_max_J": 45, "precision": 1 }
S6:      "energy_layer": { "bars": ["K"], "bar_max_J": 80, "precision": 1 }
```
Omit `body_ids` on S2 and the panel renders ONE group carrying the rig AGGREGATE (L43626-27,
L43748-51) — a single bar reading **50.0 J**, the sum of 10 and 40. It renders cleanly, warns about
nothing, and destroys the PRIMARY aha in silence. **Measured with `body_ids` present:** two groups,
captions `slow cart` / `fast cart`, values `10.0 J` / `40.0 J`, fills `22.222%` / `88.889%`.
`bar_max_J` **45 on all five guided states, 80 on S6 only.** `precision: 1` explicitly on all six.

### CALLOUT-2 — the lane order. **THE ONE CHANGE I AM ASKING FOR, and it is measured.**
In S2 and S4, **author the RIGHT-HAND cart FIRST in `bodies[]`** — i.e. `cart_b` first, `cart_a`
second — while leaving `energy_layer.body_ids: ["cart_a","cart_b"]` exactly as sealed.

Why: lane z is assigned by the state's `bodies[]` index (`nlbBodyLaneZ` L40179-207, `NLB_LANE_GAP =
0.85`). Through the shipped off-axis camera `[3, 2.5, 9]` the camera-right basis is approximately
`(0.949, 0, −0.316)`, so the **+z lane is pushed screen-LEFT**. With the sealed order the right-hand
(fast) cart sits in the +z lane and is dragged back toward its neighbour.

| Configuration | S2 worst screen-x gap over a full loop | S4 worst gap |
|---|---|---|
| sealed order (`cart_a` first) | **−17.1 px — the carts OVERLAP, and the two billboard labels collide** | +14.1 px |
| **right-hand cart first** | **+33.8 px** | **+48.5 px** |

Everything else is bit-identical under the swap — measured: panel groups still read
`"slow cart" 10.0 J 22.222%` then `"fast cart" 40.0 J 88.889%` (the panel order follows `body_ids`,
not the array), peaks still `cart_b` +4.536 and `cart_a` −1.432, `bar_max_J` untouched, R untouched,
head start untouched, every K value untouched. **The one visible side effect: the HUD readout ROW
order flips** so the right-hand cart's rows sit on top — which matches the screen and is consistent
across S2 and S4 (both put `cart_b` on top). Frames: `.scratch_ke_probe/AUTHORED_STATE_2.png` vs
`REMEDY_lane_order_STATE_2.png`.

**Do NOT fix this by enlarging the head start.** I measured that route and it is a trap: 2.8 m buys
only +5.9 px and pushes `cart_b` to a peak of 5.336 m (0.064 m from the run limit), and 3.0 m gives
+11.8 px but a peak of **5.536 m — past the 5.45 m overhang threshold**, i.e. it breaks the bounds the
design was built to respect.

### CALLOUT-3 — S3's ramp and its two authoring contracts
```
"bodies": [{ "id": "cart_a", "mass_kg": 2, ... }],
"param_ramp": { "param": "m", "from": 2, "to": 4, "end_ms": 7200 },
"loop_reset_ms": 2400,
"arrows": [{ "body_id": "cart_a", "show": ["weight"] }]
```
- `mass_kg` MUST equal `param_ramp.from` (engine contract 7.1, L1573-75) or entry jumps.
- `to: 4` MUST NOT be raised: the arrow clamp bites at `2.80 / 0.048 = 58.333 N`, i.e. **m = 5.9524
  kg**, and above that the arrow stops growing while the billboard keeps climbing — a picture that
  lies. (This independently confirms that the cycle-0 ramp to 8 kg was unrenderable.)
- `arrows[].body_id` is REQUIRED (config type L1316-21).
- Do **not** add `"normal"` to `show` — see WATCH ITEM 4 below.

### CALLOUT-4 — S5's checkpoint is AUTHORED AS ARITHMETIC, never as a literal
```
"checkpoints": [{ "s_m": -5.4 + 0.918367347,   ->  -4.481633
                  "label": "flag", "body_id": "cart_a",
                  "capture": ["v", "K"], "capture_mode": "first" }]
```
`s_m` is an ABSOLUTE track coordinate, not a displacement (scar
`nlb_checkpoint_s_m_authored_as_displacement_not_track_coordinate`). Author the value as
`initial_position_m + d_target` arithmetic in the working, then emit **−4.481633**. The `capture`
array order `["v","K"]` is what produces the measured stamp text.

### CALLOUT-5 — the boundary invariant with #4, mechanically greppable
**ZERO `work_accumulators` blocks in every state, guided and explore. No `work_scale_J`. No reader-facing
string — title, delta cue, caption, formula surface, label, narration in any language — contains the
word "work" or a bare symbol W.** Verified live: the panel self-names **`"Energy bars"`**
(`data-wg-label`, from `nlbEnergyPanelLabel` L43480-93), which is the on-screen proof that this concept
authors energy bars and no work ledgers. S3's weight arrow label is **`mg`**, not `W`
(`NLB_ARROW_DEFAULT_LABELS` L39680) — verified at source and in the rendered frame.

### CALLOUT-6 — friction is declared by name, per state
`surface.frictionless: true` on **S1, S2, S3, S4, S6**. **S5 alone omits it** and authors
`mu_s: 0.5, mu_k: 0.5` on `cart_a`.

### CALLOUT-7 — no `h_ref_m`, no `height_markers`, no `sum_merge`, no `phases`, no `glow_focal`
Every surface is flat, so U_grav is identically zero and the negative-U warn (L43782) cannot fire.
`h_ref_m` is not authored (default 0). No U bar anywhere. Zero `glow_focal` at state level in all six
states.

### CALLOUT-8 — the left edge belongs to the energy panel; keep S2 and S4 clear
Measured at 1280x720: single-group panel **242.5 px** tall (top edge at y = 62, bottom at ~304);
two-group panel **515.2 px** tall (bottom at ~577), the two groups separated by exactly **9.0 px** at
the same left edge, with the two fills' baselines **252.1 px** apart. The reflow ladder steps down when
the panel bottom passes `innerHeight − 12`, so the two-group step-down threshold is a viewport height
of about **589 px** (single-group: about 317 px). **json-author must not add any left-edge overlay to
S2 or S4.**

### CALLOUT-9 — every `tts_sentences` entry carries a valid `glow`
Valid glow ids in this scenario: `nlb_body_cart_a` / `nlb_body_cart_b` (matched on `ud.id`),
`nlb_arrow_cart_a_weight`, `nlb_arrow_cart_a_friction`, `checkpoint_1` (the flag group's `ud.id`,
L44036), and the DOM energy ids `energy_bar_K` and `energy_panel` (carried by
`nlbEnergyApplyGlow(focal)`, L43399-407). **`energy_bar_K` names a QUANTITY, not a body, so in S2 and
S4 it lights the K bar in BOTH groups at once** — which is exactly what "read the two meters" wants,
and it is used deliberately. **Do NOT bind a glow to a HUD readout row id** (`nlb_ro_*`): those are DOM
rows the glow pass cannot reach, so the binding would be a silent no-op that dims everything and lights
nothing (the `glow_focal_on_live_driven_object_exempted_becomes_total_noop` scar class).

### CALLOUT-10 — the mass billboard shows ONE DECIMAL during S3's ramp
Measured: `cart = 2 kg` at t = 0, `cart = 2.5 kg` at 2 s, `cart = 3.9 kg` at 7 s, `cart = 4 kg` once
the ramp holds. Integers render bare; intermediate values render to 1 d.p. This is honest and it
reinforces that the mass is varying CONTINUOUSLY — but **no narration or caption may claim the
billboard steps through whole kilograms.** Mine does not.

---

## 7. Narration — `teacher_script.tts_sentences`

**Rule 31a word budget, counted on `text_en`:** S1 **35** · S2 **44** · S3 **50** · S4 **44** ·
S5 **50** · S6 **20 (explore, exempt)**. Every guided state is inside 25 to 55 words and every one is
exactly 4 sentences. **S3 and S5 run at 50, above the architect's narrower per-state suggestion of
30 to 45 for S3 — declared deliberately:** S3 must simultaneously name the mass ramp, name the weight
arrow, pin the speed, STATE the law the concept is named after, and name the S2-versus-S3 ratio
contrast Checkpoint A required. That is five obligations; 46 words was the floor at which the law went
unspoken. The binding rule is Rule 31a's 25 to 55, which is honoured with 5 words to spare.

**Rule 30i:** `text_hi` authored, `text_te` NOT authored. Hindi is text-only and is never voiced.
Code-mix per Rule 30b/c/e — technical and English terms stay in Latin script, nothing is
transliterated, bare symbols are expanded to their spoken names, colour words stay English.

**Rule 41 sweep, run mechanically over all six strings:** zero occurrences of *carry / carries /
carrying*, *packs*, *possesses*, *lost*, *goes into*, *quarters*, *grip*, *ceiling*, *fate*, *budges*,
*rides on*. Zero occurrences of *work* or a bare *W*. Nothing is personified: the cart moves, slows
down and stops; the meter reads; the bar rises and falls. **"Kinetic energy", "joule", "weight",
"velocity" and "speed" are physics vocabulary, not jargon (41b), and each is the word the formula uses.**

**Dual-label at first appearance (Rule 38d):** S1's *"its kinetic energy, K"* is the one dual-label
this concept needs — the bar symbol `K` is engine-fixed and not authorable, and boards that write
"K.E." read the spoken name first. Bare `K` thereafter. S4 distinguishes *speed* (the size) from
*velocity* (the signed quantity) at the one place the distinction is the lesson.

### STATE_1 — 35 words, 4 sentences

| # | `text_en` | `glow` |
|---|---|---|
| s1_1 | This cart moves at a steady speed, v, of four metres per second. | `nlb_body_cart_a` |
| s1_2 | The meter on the left reads its kinetic energy, K, in joules. | `energy_panel` |
| s1_3 | It reads forty joules. | `energy_bar_K` |
| s1_4 | Any moving body has kinetic energy. | `nlb_body_cart_a` |

`text_hi`: "यह cart एक steady speed v से चल रही है, चार metres per second। बाईं ओर का meter इसकी kinetic
energy K दिखाता है, joules में। अभी यह चालीस joules पढ़ रहा है। कोई भी चलती हुई body में kinetic energy होती है।"

**Block 1 linearity flag honoured:** S1 states the reading as a fact about THIS cart at THIS speed and
says nothing of the form "faster means more". The unstated linear reading is left live on purpose so
S2 can break it.

### STATE_2 — 44 words, 4 sentences (PRIMARY aha)

| # | `text_en` | `glow` |
|---|---|---|
| s2_1 | Both carts have the same mass, five kilograms, and the fast cart moves at twice the speed of the slow cart. | `nlb_body_cart_b` |
| s2_2 | You might expect twice the kinetic energy. | `energy_panel` |
| s2_3 | Read the two meters: ten joules and forty joules. | `energy_bar_K` |
| s2_4 | Four times, because the speed is squared. | `energy_bar_K` |

`text_hi`: "दोनों carts का mass एक ही है, पाँच kilograms, और fast cart की speed slow cart से दोगुनी है। आप
शायद दोगुनी kinetic energy की उम्मीद करेंगे। दोनों meters पढ़िए: दस joules और चालीस joules। चार गुना, क्योंकि speed
का square होता है।"

**Section 3 binding constraint honoured:** the narration names the two READINGS and the two CAPTIONS.
It never says one bar is beside another, never says one bar is taller than another, and rests on no
height comparison at all — so it is immune to the reflow ladder exactly as Checkpoint A's D3 argument
requires. It also does not say the fast cart covers more ground per second (deleted by F7).

### STATE_3 — 50 words, 4 sentences

| # | `text_en` | `glow` |
|---|---|---|
| s3_1 | Only the mass changes here: two kilograms climbing to four, with the yellow weight arrow doubling too. | `nlb_arrow_cart_a_weight` |
| s3_2 | The speed never changes. | `nlb_body_cart_a` |
| s3_3 | Kinetic energy is one half times mass times speed squared, so the meter doubles, sixteen to thirty-two joules. | `energy_bar_K` |
| s3_4 | Doubling the speed gave four times; doubling the mass gives two. | `energy_bar_K` |

`text_hi`: "यहाँ सिर्फ mass बदल रहा है: दो kilograms से चार तक, और yellow weight arrow भी दोगुना हो जाता है। Speed
कभी नहीं बदलती। Kinetic energy आधा गुना mass गुना speed का square है, इसलिए meter दोगुना हो जाता है — सोलह से
बत्तीस joules। Speed दोगुनी करने पर चार गुना मिला; mass दोगुना करने पर दो गुना मिलता है।"

**WATCH ITEM 3 discharged inside the narration.** Sentence 4 is the S2-versus-S3 comparison Checkpoint
A required, and it is a comparison of **RATIOS (four times against two times), computed from the two
NUMERALS inside each state**. It is not a comparison of one state's bar HEIGHT against another's, which
section 10(f-2) forbids and which the reflow ladder would make false below a ~589 px viewport. The two
statements do not conflict and this sentence is the clause that keeps them apart.

**WATCH ITEM 4 handled.** Sentence 1 names the arrow as the cart's WEIGHT and immediately ties it to
the mass, so it reads as a mass indicator rather than a push. Sentence 2, *"The speed never changes"*,
is the defusal: a lone downward `mg` on a cart in vertical equilibrium could read as an unbalanced net
force, and the one thing that denies it — in words a Class-11 student already has, with the HUD row on
screen agreeing — is that nothing about the motion is changing. **I concur with Checkpoint A's
recommendation and do NOT add `"normal"`:** it would print an untaught `N` on canvas, breaching the
term ledger, and two arrows changing length together would muddy "the arrow that IS the mass".
**Explicit check handed to eye-walker:** in S3, does the single downward `mg` arrow read as a cart
being pushed down or falling, rather than as a weight label that grows with the mass?

### STATE_4 — 44 words, 4 sentences (SUPPORTING aha)

| # | `text_en` | `glow` |
|---|---|---|
| s4_1 | These two carts have the same mass and the same speed, three metres per second, but they move in opposite directions. | `nlb_body_cart_a` |
| s4_2 | One velocity is negative. | `nlb_body_cart_a` |
| s4_3 | Both meters read twenty-two point five joules. | `energy_bar_K` |
| s4_4 | Squaring the speed removes the sign, so kinetic energy is never negative. | `energy_bar_K` |

`text_hi`: "इन दोनों carts का mass और speed एक ही है, तीन metres per second, लेकिन ये उल्टी directions में चल रही
हैं। एक velocity negative है। दोनों meters साढ़े बाईस joules पढ़ रहे हैं। Speed का square करने से sign हट जाता है,
इसलिए kinetic energy कभी negative नहीं होती।"

### STATE_5 — 50 words, 4 sentences

| # | `text_en` | `glow` |
|---|---|---|
| s5_1 | This floor is rough, so the cart slows down steadily. | `nlb_arrow_cart_a_friction` |
| s5_2 | Watch the meter fall as the speed falls. | `energy_bar_K` |
| s5_3 | At the flag the cart is moving at four metres per second and the meter reads twenty-four joules, one half times three times sixteen. | `checkpoint_1` |
| s5_4 | The cart stops, and the meter reads zero. | `energy_bar_K` |

`text_hi`: "यह floor rough है, इसलिए cart धीरे-धीरे slow down होती है। Speed गिरने के साथ meter को गिरते हुए
देखिए। Flag पर cart चार metres per second से चल रही है और meter चौबीस joules पढ़ता है — आधा गुना तीन गुना सोलह।
Cart रुक जाती है, और meter शून्य पढ़ता है।"

**The #10 boundary is guarded in the wording.** The narration never says where the energy went, never
says it was lost, and never draws or names a friction ledger. It says the cart slows down and the
meter reads zero — both of which are on screen — and stops there. "Where did it go" is #10's PRIMARY
aha and stays intact. Sentence 1 also serves as the friction prerequisite patch (Block 1 cliff 2 and
3) by naming the rough floor, with the friction readout on screen agreeing.

### STATE_6 — explore, 20 words (0/open, exempt)

| # | `text_en` | `glow` |
|---|---|---|
| s6_1 | Change the speed and the mass. | `nlb_body_cart_a` |
| s6_2 | Watch the meter. | `energy_bar_K` |
| s6_3 | Set the speed to zero and the kinetic energy is zero. | `energy_bar_K` |

`text_hi`: "Speed और mass बदलिए। Meter देखिए। Speed को zero कीजिए और kinetic energy zero हो जाती है।"

Sentence 3 is reachable: the `v0` slider spans −5 to +5 in steps of 0.5, so 0 is an exact stop, and a
body drag parks the cart at v = 0 as well.

### Titles and delta cues (Rule 41d — front-loaded, the rail truncates)

| State | Title | Delta cue (on-canvas, at most 5 words) |
|---|---|---|
| S1 | A moving cart has kinetic energy | Moving cart, K above zero |
| S2 | Twice the speed, four times the energy | Double speed, four times K |
| S3 | Twice the mass, twice the energy | Double mass, double K |
| S4 | Kinetic energy is never negative | Backward: the same K |
| S5 | Kinetic energy falls to zero | K falls to zero |
| S6 | Explore: change speed and mass | Change speed and mass |

### Formula surfaces (Rule 34b — ONE per state; Rule 38c — algebra only)

S1 **none** (authoring `K = ½mv²` here would print S2's answer one click early) · S2 `K ∝ v²` ·
S3 `K = ½mv²` · S4 `K = ½m(−v)² = ½mv²` · S5 `K = ½mv²` plus the engine's ONE appended stamp ·
S6 `K = ½mv²`.

**Rule 38c notation-ladder audit: every formula surface in this concept is on a `core` or `extended`
ring and every one is ALGEBRA-ONLY.** No derivative, no integral, no vector operator, no cross product
anywhere. There is nothing to FLAG to the founder: this concept genuinely does not need calculus below
the advanced ring, because it has no advanced ring — the one genuine derivation of ½mv² is the
work-energy theorem, which is concept #4.

Unicode, all real (Rule 34c): ½ U+00BD · ² U+00B2 · ∝ U+221D · − U+2212 · · U+00B7 (in the engine's
stamp separator). No ASCII transcription anywhere.

---

## 8. `aha_moment`, `misconception_watch`, `assessment`, `coverage_map`

### `aha_moment` — physics-checked

```json
"aha_moment": {
  "state_id": "STATE_2",
  "statement": "Double the speed and the meter reads four times as much.",
  "visual_confirmation": "Two identical 5 kg carts, one at 2 m/s and one at 4 m/s, read 10.0 J and 40.0 J on the two K meters — a near-empty track against a near-full one."
}
```
**Physics check: TRUE.** K = ½mv² with m fixed gives K(2v)/K(v) = 4 exactly. **12 words, inside the
15-word cap.** The designated state genuinely demonstrates it: S2 renders both readings simultaneously
on one shared 45 J scale, measured at `10.0 J` / `22.222%` and `40.0 J` / `88.889%`. The statement is
anchored on the READING, with the fill fraction as reinforcement, so it survives the reflow ladder
(fill fractions are scale-invariant — only absolute pixels change).

SUPPORTING (S4): kinetic energy has no direction and no sign — run the same cart backward at the same
speed and the reading does not move by a joule. **Physics check: TRUE**, K(−v) = ½m(−v)² = ½mv² = K(v).

### `misconception_watch` — exactly 2 entries, S2 and S4 only

| State | `belief` | `visual_counter` | `one_line_fix` — physics-checked |
|---|---|---|---|
| S2 | kinetic energy is proportional to speed | two carts of the same 5 kg mass, one at 2 m/s and one at 4 m/s; their meters read 10.0 J and 40.0 J | **"The speed is squared, so doubling the speed multiplies the kinetic energy by four."** Correct, not merely persuasive: the factor is v²ratio = 2² = 4 exactly, at any fixed mass. |
| S4 | reversing the direction of motion reverses the sign of the kinetic energy | two identical carts at the same 3 m/s in opposite directions; both meters read exactly 22.5 J | **"Squaring the speed removes the sign, so kinetic energy is never negative."** Correct: (−v)² = v² for every real v, and m > 0, so K ≥ 0 always. |

S1, S3, S5 and S6 carry NO `misconception_watch` — 2 genuine pivots, not a per-state tic.
**Declared for Gate 8, carried from the skeleton:** the wrong expectation is NOT rendered (the engine
has no ghost-bar primitive and building one would be a renderer edit), so Rule 16a is delivered here as
a **numeric contrast**, not a fully rendered wrong-expectation beat. Score it as a declared partial.

### `assessment` — 6 questions, every answer physics-checked

`mastery_definition`: A student who has mastered this concept can state that a moving body has kinetic
energy K = ½mv² measured in joules; predict that doubling the speed multiplies the kinetic energy by
four while doubling the mass only doubles it; compute K for given m and v; explain why kinetic energy
is a scalar that can never be negative whatever the direction of motion; and say that kinetic energy is
exactly zero when and only when the body is at rest.

| q_id | Stem | Options | Correct | Distractor misconceptions | teaches_state | difficulty |
|---|---|---|---|---|---|---|
| `q1_ke_of_a_moving_body` | A 5 kg cart moves at a steady 4 m/s on a level floor. What is its kinetic energy? | A **40 J** · B 20 J · C 10 J · D 80 J | **A** | B: uses mv/2 (halves the mass times the speed) instead of squaring the speed · C: computes mv/2 with the half applied twice · D: uses mv² and forgets the one half | STATE_1 | core |
| `q2_double_the_speed` | Two carts have the same mass. One moves twice as fast as the other. The ratio of their kinetic energies, fast to slow, is | A 2 : 1 · B **4 : 1** · C 1 : 2 · D 8 : 1 | **B** | A: **the concept's headline misconception** — treats kinetic energy as proportional to speed, the way momentum is · C: inverts the ratio · D: cubes the speed ratio | STATE_2 | core |
| `q3_double_the_mass` | A cart moving at a fixed 4 m/s has its mass doubled from 2 kg to 4 kg. Its kinetic energy | A stays the same · B **doubles** · C becomes four times as large · D becomes half as large | **B** | A: thinks kinetic energy depends only on the speed · C: **carries S2's squaring rule across to the mass** — the exact confusion S3 exists to break · D: inverts the proportionality | STATE_3 | core |
| `q4_negative_velocity` | A 5 kg cart moves at 3 m/s to the LEFT, so its velocity is −3 m/s. Its kinetic energy is | A −22.5 J · B **22.5 J** · C 0 J · D −7.5 J | **B** | A: **carries the sign of the velocity into the energy** — the S4 misconception exactly · C: thinks a negative velocity means no kinetic energy · D: applies the sign and drops the square | STATE_4 | core |
| `q5_falls_to_zero` | A 3 kg cart is launched at 5 m/s across a rough floor and slides to a stop. At the instant it is moving at 4 m/s, and at the instant it has stopped, its kinetic energy readings are | A 30.0 J then 0.0 J · B **24.0 J then 0.0 J** · C 24.0 J then 6.0 J · D 37.5 J then 24.0 J | **B** | A: uses ½ × 3 × 4 × 5 or similar mis-substitution rather than ½ × 3 × 4² · C: believes a stopped body keeps some kinetic energy · D: reads the launch value as the flag value and shifts every reading one step | STATE_5 | extended |
| `q6_zero_kinetic_energy` | On the explore screen the speed slider is set to zero while the mass slider stays at 5 kg. The meter reads | A 5.0 J · B 2.5 J · C **0.0 J** · D it depends on the mass | **C** | A: reads the mass as the energy · B: applies the one half to the mass alone · D: thinks a heavy body at rest still holds kinetic energy | STATE_6 | core |

**Every correct answer verified by arithmetic:** q1 ½·5·16 = 40 ✓ · q2 (2v)²/v² = 4 ✓ · q3 K ∝ m ⇒ ×2
✓ · q4 ½·5·(−3)² = 22.5 ✓ · q5 ½·3·16 = 24.0 and ½·3·0 = 0.0 ✓ · q6 ½·5·0 = 0.0 ✓.
**q6 is answerable from something S6 RENDERS** — the `v0` slider reaches exactly 0 (range −5 to 5, step
0.5) and the K bar then reads `0.0 J`; nothing in the question requires a value the sandbox cannot show.

```json
"coverage_map": {
  "by_state": {
    "STATE_1": ["q1_ke_of_a_moving_body"],
    "STATE_2": ["q2_double_the_speed"],
    "STATE_3": ["q3_double_the_mass"],
    "STATE_4": ["q4_negative_velocity"],
    "STATE_5": ["q5_falls_to_zero"],
    "STATE_6": ["q6_zero_kinetic_energy"]
  },
  "non_assessed_states": []
}
```

### `real_world_anchor` (Rule 35 universal, Rule 41 plain, F12 honoured)

```json
"real_world_anchor": {
  "primary": "A vehicle at speed. Drive at twice the speed and the vehicle has four times the kinetic energy — which is why speed matters far more than it feels like it should.",
  "secondary": "A hammer driving a nail. Swing the hammer twice as fast and it drives the nail much deeper in one blow, because it has four times the kinetic energy when it lands."
}
```
No place, festival, food, currency, brand or personal name; no "in every Indian home" phrasing.
**The stopping-distance payload is NOT spoken** — it is v²/2μg, i.e. #4 and #10 content, and this sim
renders no distance number. The anchor names the energy only. Recorded as the declared forward
reference #10's architect inherits.

---

## 9. THE FOUR PROBES — run against the real engine, with measured numbers

Method: the established Playwright harness (`_scratch_nlb_wkbar_align_probe.ts` /
`_scratch_nlb_mass_label_probe.ts`) — `assembleField3DHtml` on the real config into a scratch HTML,
driven under a deterministic virtual clock at h = 1/60, with the THREE.Scene / PerspectiveCamera
constructor hook so world objects can be projected to screen pixels. Viewport 1280x720. Every number
below is read out of the live page, not computed.

### RISK-1 — does `energy_layer` render at all? **PASS**

| Assertion | Measured |
|---|---|
| `#nlb_energy` displayed with an `energy_layer` and no work ledgers (the gate at L43624, never taken with `hasWk` false) | **displayed**, panel height **242.5 px** |
| panel self-name from `nlbEnergyPanelLabel` | **`"Energy bars"`** |
| exactly one group | **1** |
| single-group caption hidden (L43643-44) | **hidden**, caption empty |
| bar symbol | **`K`** |
| value text | **`40.0 J`** |
| track height = `NLB_EN_STEPS[0].trk` | **186.00 px** (ladder step 0) |
| `nlbEnPct` 3-dp write into `style.height` (L43466-67) | **`88.889%`**, measured fill **165.33 px** = **88.886 %** |
| `[PM_NLB_ENERGY_SCALE]` / `[CLAMP]` / `[DRIFT]` over 10 s | **zero lines** |

The never-run paths named in the skeleton all executed: the visibility gate, the empty-caption hide,
the 3-dp rounding, and the measured reflow ladder, which stopped at step 0 — the authored look.

### RISK-2 — the two-group panel. **PASS. THE FILL ASSERTION HOLDS EXACTLY.**

| Assertion | Measured |
|---|---|
| two `nlb_en_g*` groups displayed | **2** |
| captions | **`slow cart`** and **`fast cart`** |
| values | **`10.0 J`** and **`40.0 J`** |
| **fills** | **`style.height = 22.222%` and `88.889%`** — measured **22.219 %** and **88.886 %**, i.e. **41.3 px against 165.3 px** on identical 186 px tracks |
| stacked vertically, not side by side | **g0 y = [62, 305], g1 y = [314, 557], both x0 = 25**; vertical gap exactly **9.0 px** (the `marginTop` at L43633) |
| same amber | both `rgb(255, 202, 40)` = `#FFCA28` |
| fill baselines apart | **252.1 px**; two-group panel height **515.2 px** |

**Checkpoint A D3 reasoning stands unchanged and does not need re-opening.** 22.2 % against 88.9 % is
the categorical near-empty-against-near-full read the whole `DESIGN_OK` rests on, and the frame
`.scratch_ke_probe/S2.png` confirms it by eye: a short amber stub above a nearly full column, each with
its own caption and its own numeral. Because `nlbEnPct` writes a PERCENTAGE, the fractions are
invariant under the reflow ladder — at `NLB_EN_STEPS[1]` (`trk: 138`) they would be 30.7 px and
122.7 px, still stub against near-full.

Two measured refinements to the skeleton estimates, both in our favour: the single-group panel is
**242.5 px** (not about 315) and the two-group panel **515.2 px** (not about 567), so the ladder
step-down thresholds are viewport heights of about **317 px** and **589 px** respectively.

### RISK-3 — a mass ramp combined with `loop_reset_ms`. **PASS**

Driven across **three** loop boundaries (R = 2400 against `end_ms` 7200), sampled either side of each.

```
t~   0 ms  m=2.0089  s=-5.272  v=4.00  K= 16.1 J (35.714%)  arrow=0.9450  billboard="cart = 2 kg"
t~1183 ms  m=2.3244  s=-0.728  v=4.00  K= 18.6 J (41.323%)  arrow=1.0934
t~2333 ms  m=2.6311  s= 3.688  v=4.00  K= 21.0 J (46.775%)  arrow=1.2377   -- just before boundary 1
t~2450 ms  m=2.6622  s= 4.136  v=4.00  K= 21.3 J (47.328%)  arrow=1.2523   -- just after
t~4733 ms  m=3.2711  s= 3.368  v=4.00  K= 26.2 J (58.153%)  arrow=1.5387   -- before boundary 2
t~4850 ms  m=3.3022  s= 3.816  v=4.00  K= 26.4 J (58.706%)  arrow=1.5534   -- after
t~7133 ms  m=3.9111  s= 2.984  v=4.00  K= 31.3 J (69.531%)  arrow=1.8398   -- before boundary 3
t~7250 ms  m=3.9422  s= 3.432  v=4.00  K= 31.5 J (70.084%)  arrow=1.8544   -- after
t~8383 ms  m=4.0000  s=-1.816  v=4.00  K= 32.0 J (71.111%)  arrow=1.8816
```

| Assertion | Measured |
|---|---|
| `b.m` monotonic across all three boundaries | **monotonic**, no reversal at any frame |
| no snap toward the authored seed `mass_kg: 2` at any rewind | **none** — the value either side of every boundary differs by exactly one ramp step |
| ends at 4.000 kg and HOLDS | **m = 4** exactly |
| billboard | **`cart = 2 kg`** at t = 0, **`cart = 2.5 kg`** at 2 s, **`cart = 3.9 kg`** at 7 s, **`cart = 4 kg`** on hold |
| weight arrow ends at exactly twice its start | **0.9408 to 1.8816** world units, ratio **2.0000** |
| K bar ends | **`32.0 J`**, **`71.111%`** |
| speed unmoved through the whole ramp (Rule 32b) | **v = 4.000000000**, to 1e-9 |

The Checkpoint A closure of the call chain is confirmed at runtime: the rewind never writes `b.m`, and
with the ramp cache nulled the ramp rewrites the mass on the very next frame from the restored
monotonic clock. **No fallback is needed.**

**One correction to my own first probe, reported rather than buried:** my initial reader looked for the
mass on an `nlb_body_mass` sprite and read an empty string. That element type is RETIRED (L39592 ff);
the mass rides the camera-facing **`nlb_body_label`** billboard as label-equals-mass-kg. Re-measured
against the right element, the assertion passes. The probe was wrong, not the engine.

### RISK-4 — the K and v capture branches, and the 340 px cap. **PASS**

Pinned at 1260 ms via `SET_TIME_FREEZE`, exactly as THE EYE pins it.

| Assertion | Measured |
|---|---|
| cart at rest at the pin | **v = 0.000000**, s = **−2.8489 m** |
| K bar at the pin | **`0.0 J`** |
| formula surface text | **`K = ½mv²`** then, on the next line, **`flag:  v = 4.00 m/s  ·  K = 24.0 J`** |
| resolved font / cap | **`600 22px/31.9px "Cambria Math", "Times New Roman", serif`**, **`max-width: 340px`** |
| **stamp line advance width, MEASURED with the resolved font of the element** | **299.3 px of the 340 px cap** |
| base line width | 100.1 px |
| rendered box | **w = 284.8 px, h = 63.8 px, so renderedLines = 2** |
| stamp lands before the 0.55R loop guard (1155 ms) | **200.0 ms = 0.0952 of R** |

**The F13 fallback is NOT needed.** The estimates were 319 px (architect) and 308 px (Checkpoint A);
the measurement is **299.3 px**, comfortably inside, on one line, with the surface at exactly two lines
as the DoD asserts. Keep `capture` as v then K.

### Extra measurements taken while the harness was open

| Check | Measured |
|---|---|
| S4 both groups | `22.5 J` / `50%` and `22.5 J` / `50%`, captions `left cart` / `right cart` |
| S6 default pose | `40.0 J` at `50%` of the 80 J scale — a live instrument at mid-scale |
| S6 slider rows | exactly two: v0 at −5..5 step 0.5 default 4, m at 1..6 step 0.5 default 5 |
| S1 to S5 slider rows | **zero visible rows in every one** |
| S2 in-loop peaks | cart_a home −5.400, cart_b peak **+4.536** |
| S4 in-loop peak | **±5.088** at t_ms 1296 |
| page errors across all six states | **none** |
| energy warnings across the whole run | **none** |

### What I could NOT probe — SKIPS, and a skip is not a pass

1. **D4, the amber-vs-amber judgement.** This is a human read and it goes to THE EYE. My own read of
   `.scratch_ke_probe/S3.png` is that the weight arrow sits on the cart at screen x about 585 while the
   K bar sits in a black panel at x about 12 to 85 — different shapes, different zones, and I did not
   see them read as one object. **That is my read, not a measurement.** The named JSON-only remedy
   (`bodies[].color`, L962) stays available.
2. **The S6 trusted-drag paths** (a slider seize, and a body drag parking the cart at v = 0). A
   synthetic Playwright event is not trusted, so these need a founder hand-test, exactly as the dipole
   release did. The code path is read and short, but it is unexercised here.
3. **THE EYE itself has not run.** That is the json-author gate, not mine.

---

## 10. Checkpoint A watch items — disposition of all six

| # | Item | Disposition |
|---|---|---|
| 1 | S4 loop: keep 1300 ms, do not take 1400 | **KEPT at 1300.** Measured peak ±5.088 m at t_ms 1296 — 0.312 m of margin to the 5.4 run limit and 0.362 m to the 5.45 overhang threshold. The engine rewind actually fires a frame EARLY, so Checkpoint A worst case is conservative in our favour, but 1400 still has zero DESIGNED margin and I do not take it. Ceiling if a calmer loop is ever wanted: 1350 ms. |
| 2 | The three-bounds table conflates 5.4 and 5.45 | **STATED.** Section 1 now derives 5.45 from `NLB_BODY_SIZE / 2 / NLB_WORLD_PER_M = 0.55 m` against a slab drawn to ±6.0, and names 5.4 as **5.45 minus a declared 0.05 m safety margin**. |
| 3 | Apparent tension between section 2 and section 10(f-2) | **RESOLVED with a clause in the narration itself.** S3 sentence 4 compares **RATIOS** (four times against two times), each computed from the two NUMERALS inside its own state. Ratios are scale- and viewport-free, so this does not touch the cross-state HEIGHT prohibition. The clause is written into section 7 where json-author will read it. |
| 4 | S3 weight arrow with no normal arrow | **HANDLED in narration, `normal` NOT added.** I concur with the recommendation: `normal` would print an untaught `N`, breaching the term ledger, and two arrows changing together would muddy the mass cue. Sentence 1 names the arrow as the WEIGHT and ties it to the mass; sentence 2, "The speed never changes", denies the net force in words the student already has, with the HUD agreeing. **Explicit eye-walker check filed in section 7.** |
| 5 | D4, amber vs amber, at THE EYE | **HANDED TO THE EYE as a SKIP with my own non-authoritative read** (section 9). `bodies[].color` (L962) named as the JSON-only remedy. |
| 6 | RISK-2 fill assertion carries the concept | **PROBED AND EXACT: 22.222 % and 88.889 %.** No re-opening of D3 is required. |

---

## 11. What I refute, with evidence

### REFUTATION 1 — section 3 claim that the S2 carts never close on screen is FALSE

Skeleton section 3, S2 row: *"The fast cart starts 2.0 m ahead and the gap only grows (2.0 to 6.0 m
over the loop), so their screen-x extents never close."*

The WORLD gap does only grow. The SCREEN gap does not follow it, because the two carts are separated
along **z** (`NLB_LANE_GAP = 0.85`) and the shipped off-axis camera `[3, 2.5, 9]` projects a +z
displacement onto screen-LEFT (camera-right basis approximately `(0.949, 0, −0.316)`). With `cart_a`
authored first, the RIGHT-hand fast cart lands in the +z lane and is pulled back toward its neighbour
by about 0.27 world units — almost exactly the clearance the 2.0 m head start was buying.

**Measured at the settled camera, worst screen-x gap over a full 2000 ms loop: −17.1 px.** The carts
overlap, their two billboard labels collide, and because the home pose recurs at every loop reset the
overlap recurs every 2 seconds. It is visible in `.scratch_ke_probe/S2.png`.

This is not a physics error and it does not touch the fills that carry the PRIMARY aha — which is
exactly why it would have survived every gate and reached the founder. **Remedy: CALLOUT-2.** One line,
no sealed number changed, measured −17.1 px to +33.8 px, with the panel group order, every K value and
every fill fraction bit-identical. Applied to S4 as well it goes +14.1 px to +48.5 px.

I also measured and REJECT the obvious alternative: enlarging the head start. 2.8 m buys only +5.9 px
and puts `cart_b` at a peak of 5.336 m; 3.0 m gives +11.8 px and a peak of **5.536 m, past the 5.45 m
overhang threshold**. The head-start route trades a legibility defect for a bounds violation.

### REFUTATION 2 — the S3 per-state word band of 30 to 45 is too tight for its own obligations

S3 must name the mass ramp, name the weight arrow as the mass cue, pin the speed (Rule 32b and the
watch-item-4 defusal), STATE the law the concept is named after (the
`lesson_never_states_the_principle_it_is_named_after` scar), and name the S2-versus-S3 ratio contrast
Checkpoint A required. Five obligations. At 46 words the law went unspoken. **Authored at 50 words**,
inside Rule 31a 25-to-55 with 5 to spare, and declared rather than silently exceeded.

### NOT refuted

Every sealed number. `bar_max_J` 45 and 80, the peaks, the fills, `s_m = −4.481633`, a = 4.9, the
discrete rest at 1.033333 s, the 1260 ms pin, the 226.7 ms margin, R = 2400 / 2000 / 2400 / 1300 /
2100, the ramp 2 to 4, the arrow 0.9408 to 1.8816, and the whole D3 argument. I re-derived each
independently and the engine agreed with both of us.

---

## 12. Self-review checklist

- [x] **Every symbol in the state narratives appears in `variables`** — m, v0, v, g, mu_s, mu_k, K, w.
- [x] **`radians()` where an angle enters a trig call** — vacuously satisfied and structurally
  unreachable: `theta_deg = 0` in all six states, no formula in this block takes an angle, and
  `radians(` appears nowhere in the emitted JSON. Any occurrence is a bug.
- [x] **Every state control declared** with `min`, `max`, `step`, `default` — S1 to S5 none (measured:
  zero visible rows), S6 exactly `v0` and `m` (measured with their authored ranges).
- [x] **Per-state seeds documented with a one-line justification each** (section 2), including the two
  that silently destroy an aha if inherited.
- [ ] **Board mark scheme** — DEFERRED by Rule 20 [D]. Not applicable, declared in section 4.
- [x] **Six drill-down clusters, 5 real student phrases each**, student voice, plain English.
- [x] **`constraints` block: 6 short factual assertions**, conservation-shaped first (K never
  negative, K = 0 iff v = 0), no pedagogy.
- [x] **Numerical sanity check run** — the full table re-derived independently (m = 5, v = 4 gives
  K = 40.0 J; the fill 40/45 = 88.8889 %) and confirmed against the live engine.
- [x] **Within-state motion timeline for every state** (section 3): every row a t-window x what
  animates x driven-by, every branch a pure function of the state clock, no state static, no shared
  motion, controls column matching the architect table exactly. No `pause_after_ms` carried — this is
  a new concept.
- [x] **Rule 32 verified per state** — 32a with S3 exemption re-argued from source and the rest carried
  by narration order; 32b measured (v pinned to 1e-9 through S3); 32c all cues at most 5 words; 32d;
  32e zero state focals with per-sentence glows instead.
- [x] **Word budget** — 35 / 44 / 50 / 44 / 50 guided, all inside 25 to 55, all exactly 4 sentences;
  S6 explore 20 and exempt. S3 and S5 at 50 declared, not accidental.
- [x] **Rule 38c notation ladder** — every formula surface is on a core or extended ring and every one
  is algebra-only. **Nothing to FLAG to the founder: no calculus is needed anywhere below the advanced
  ring, because there is no advanced ring.** 38d dialect: "its kinetic energy, K" dual-labels once at
  first appearance; speed and velocity distinguished at the one state where the distinction is the
  lesson.
- [x] **Rule 41** — mechanical sweep over all six `text_en` strings for the banned register list and
  for the boundary words. Zero hits.
- [x] **The #3 / #4 boundary** — zero `work_accumulators`, no `work_scale_J`, no "work" and no bare W
  in any reader-facing string in any language. Proven on screen by the panel naming itself
  **"Energy bars"**, measured.
- [x] **Engine bug queue consulted live**; every relevant prevention rule satisfied at a named site,
  and the three N/A rows declared rather than skipped (section 0).
- [x] **DC Pandey check** — no formula, explanation, example problem, figure or phrasing imported from
  DC Pandey, HC Verma or NCERT. Every question in section 8, every anchor, every narration sentence and
  every drill-down phrase is authored from Newton mechanics and the definition of K directly.

---

## 13. Handoff to json-author

Author from **this document plus `skeleton.md`**, with exactly one change to the sealed design:

1. **CALLOUT-2 — in S2 and S4, author `cart_b` FIRST in `bodies[]`**, keeping
   `energy_layer.body_ids: ["cart_a","cart_b"]` unchanged. This is the only sealed-design deviation and
   it is measured on both sides.
2. `energy_layer` on **every** state; `body_ids` on **S2 and S4 only**; `bar_max_J` **45** on the five
   guided states and **80** on S6; `precision: 1` everywhere.
3. `surface.frictionless: true` on **S1, S2, S3, S4, S6**; **omitted on S5**, which authors
   `mu_s: 0.5, mu_k: 0.5` on `cart_a`.
4. S3: `mass_kg: 2` equal to the ramp `from`, ramp `to: 4`, `end_ms: 7200`, `loop_reset_ms: 2400`, and
   `arrows: [{ body_id: "cart_a", show: ["weight"] }]` — **no `normal`**.
5. S5: one checkpoint, `s_m` emitted as **−4.481633** from the arithmetic
   `initial_position_m + 0.918367347`, `capture: ["v","K"]`, `capture_mode: "first"`.
6. `loop_reset_ms`: **2400 / 2000 / 2400 / 1300 / 2100**, none on S6.
7. `advance_mode`: `manual_click` on S1 to S5, `interaction_complete` on S6.
8. Zero `work_accumulators`, zero `work_scale_J`, zero `glow_focal`, no `h_ref_m`, no `height_markers`,
   no `sum_merge`, no `phases`, no `mode_overrides`.
9. Every `tts_sentences` entry carries the `glow` given in section 7. **Never bind a glow to an
   `nlb_ro_*` HUD row.**
10. `text_hi` authored from section 7, `text_te` NOT authored (Rule 30i).
11. No left-edge overlay on S2 or S4 (CALLOUT-8).

**Checks to run before declaring done:** `npx tsc --noEmit` at 0 · `npm run validate:concepts` passing
on this id · the eight registration sites · then THE EYE, with the two explicit human checks handed
forward — **the S3 lone-`mg` net-force read (watch item 4)** and **the D4 amber-vs-amber read (watch
item 5)**.

**Delete after Checkpoint B:** `src/scripts/_scratch_ke_probe*.ts` and `.scratch_ke_probe/`.
