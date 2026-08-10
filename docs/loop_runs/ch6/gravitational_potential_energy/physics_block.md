# PHYSICS BLOCK — `gravitational_potential_energy` — Ch.6 concept #7

> Input: `docs/loop_runs/ch6/gravitational_potential_energy/skeleton.md` (cycle 1, `DESIGN_OK` at
> Checkpoint A cycle 2). Both founder-proxy reports read in full before drafting
> (`founder_proxy_A.md` cycle 0, `founder_proxy_A_cycle2.md` cycle 2). All numbers below were
> **independently recomputed by hand/python this session** (g = 9.8, dyadic-fraction float checks,
> the S5 folded-frame table, the S1/S3/S4/S6 corner values) — every one reproduced the cycle-2
> figures exactly. Nothing here re-derives from scratch against the cycle-2 ruling; where I differ
> it is flagged explicitly with evidence (see the closing "Findings beyond the gate" section).
> Scenario: `field_3d` / `newtons_laws_body` + SEAM K/L/M/N energy layer. Conceptual-only (Rule 20
> [D]) — Section 4 (board mark scheme) is SKIPPED per the active suspension.

## Six blocking carry-ins — disposition (Checkpoint B refuses APPROVE without evidence for each)

| # | Carry-in | Disposition in this block |
|---|---|---|
| C-1 | `formula_lines[0]` must carry the base equation, never a separate `formula` key alongside `formula_lines` | Authored explicitly per-state in Section 3 and again as a json-author CONSTRAINT in Section 6 — S1/S3/S5 use `formula_lines` ONLY (base as line 0, no `at_ms`), S4/S6 use `formula` ONLY. Zero states author both. Zero states author an empty `formula_lines` array. |
| C-2 | Delete the false "#6 pins U0 = 0" clause; replace with the given text | S5 narration (Section 3) uses the exact replacement sentence, lightly re-worded to fit the spoken register, preserving both binding constraints (never says #6's start was zero; cites #6 as "the concept before this," never by state number). |
| C-3 | Delete the "same placement / continuous with #6" claims; extend probe P6 to S1/S4 | Symbol-label table entry corrected (Section 1). **One additional instance of the same defect found and struck** — see "Findings beyond the gate" below. Probe P6 extended verbatim to S1 and S4 in Section 3/Section 6. |
| C-4 | Author U+2212 everywhere, not ASCII hyphen | Every formula/formula_lines/stamp string below uses the real minus sign (U+2212). Flagged explicitly in the symbol table and the json-author constraint list (Section 6). |
| C-5 | S3 narration budget — compression permitted, aha/bridge not droppable | S3 narration drafted at 53 words (Section 3), anchor compressed to 18 words (floor-language + chosen-zero idea preserved verbatim in spirit), full #6-bridge clause and full aha both present. |
| C-6 | Checkpoint-B duty (S5 vs #6-S3 side-by-side) + optional height differentiator | Recorded as a named Checkpoint-B duty in Section 6. **Differentiator IMPLEMENTED** — S5's two checkpoint labels carry their heights (`start (h = 1.40 m)` / `point C (h = 1.75 m)`), making the height difference of 0.35 m a rendered pair. Surface-fit measured under P7, not asserted (Section 6). |

---

## 1. `physics_engine_config`

```json
{
  "variables": {
    "m": { "name": "cart mass", "unit": "kg", "min": 1, "max": 3, "default": 2, "step": 0.5 },
    "theta_deg": { "name": "incline angle", "unit": "deg", "min": 15, "max": 48.6, "default": 30 },
    "h_ref_m": { "name": "height of the chosen h = 0 line above the ramp's surface origin (the reference is a CHOICE, not a fact about the body)", "unit": "m", "min": 0, "max": 0.3, "default": 0 },
    "g": { "name": "gravitational acceleration", "unit": "m/s^2", "constant": 9.8 },
    "s": { "name": "position along the track, measured from the surface origin", "unit": "m", "derived": "the integrator's own live value on driven/launched states; the slider-held value at rest in the explore" },
    "d": { "name": "displacement from the state's own initial_position_m", "unit": "m", "derived": "s - initial_position_m" },
    "h": { "name": "height above the authored h = 0 line", "unit": "m", "derived": "s * sin(radians(theta_deg)) - h_ref_m" },
    "U": { "name": "gravitational potential energy", "unit": "J", "min": 0, "max": 60, "derived": "m * g * (s * sin(radians(theta_deg)) - h_ref_m)" },
    "F": { "name": "applied drive force, along the surface, aiding the climb (S1/S3/S4 only — exactly balances mg sin(theta) so a = 0)", "unit": "N", "derived": "m * g * sin(radians(theta_deg))" },
    "v": { "name": "constant climb speed on the driven states (S1/S3/S4)", "unit": "m/s", "constant": 0.8 },
    "v0": { "name": "launch speed at the state's own start, signed (S2/S5 only; zero/absent elsewhere)", "unit": "m/s", "min": 0, "max": 3.13, "default": 0 },
    "a": { "name": "acceleration along the surface (0 on driven states; -g*sin(theta) after launch on S2/S5, frictionless)", "unit": "m/s^2", "derived": "-g * sin(radians(theta_deg))" },
    "W_gravity": { "name": "running work done BY gravity since the state's own initial_position_m (S5 ledger only)", "unit": "J", "derived": "-m * g * sin(radians(theta_deg)) * (s - initial_position_m)" }
  },
  "formulas": {
    "U": "m * g * (s * sin(radians(theta_deg)) - h_ref_m)",
    "delta_U": "m * g * (h_end - h_start)  -- documentation only; both h values already net out h_ref_m, so this is reference-independent by construction",
    "F_drive_balance": "m * g * sin(radians(theta_deg))  -- S1/S3/S4: F is authored equal to this so a = 0 identically",
    "a_after_launch": "-g * sin(radians(theta_deg))  -- S2/S5: frictionless coast after v0",
    "return_time_ms": "2000 * v0 / (g * sin(radians(theta_deg)))  -- S2/S5 home-recross wall time",
    "rise_m": "(v0 * v0) / (2 * g * sin(radians(theta_deg)))  -- S2 peak displacement above the launch s0",
    "W_gravity": "-m * g * sin(radians(theta_deg)) * (s - initial_position_m)"
  },
  "computed_outputs": {
    "U_J": { "formula": "m * g * (s * sin(radians(theta_deg)) - h_ref_m)" },
    "gravity_J": { "formula": "-m * g * sin(radians(theta_deg)) * (s - initial_position_m)" }
  },
  "constraints": [
    "U = mgh at every instant, measured from THIS state's own authored h_ref_m -- never from an assumed ground; h_ref_m is a choice, not a physical fact.",
    "ΔU = mgΔh is invariant under any repositioning of h_ref_m between two states that show the same climb (S1 vs S3): every individual U value shifts, the difference between two heights never does.",
    "U is a state function: two visits to the same s (hence the same h) stamp the identical U regardless of the path taken between the visits (S2's round trip; S4's steeper path to S1's own height).",
    "W_gravity = -ΔU_grav for gravity acting alone on the tracked body, for ANY choice of h_ref_m (S5) -- this is #6's ΔU = -W_conservative relation, specialised to gravity and used to derive U = mgh.",
    "h must stay >= 0 at every instant of every authored loop, including the +50 ms folded frame, for every state that authors this h_ref_m (the unsigned energy stack cannot render a negative U_grav; a crossing fires a console warning THE EYE's H4 assertion reads as a failure).",
    "g = 9.8 m/s^2, constant at Earth's surface -- this concept never varies g and never leaves the h << R_Earth regime (the -GMm/r form is a later chapter, named once in advanced-ring narration only, never a formula here)."
  ]
}
```

**Naming discipline honoured** (bug `computed_output_name_encodes_a_symbol_no_instrument_paints…`, FIXED-row precedent `gravity_J` in `conservative_vs_nonconservative_forces.json`): `U_J`'s symbol (`U`) byte-matches the engine-fixed bar caption `U`; `gravity_J`'s symbol (`gravity`) byte-matches the single-token work-bar label `'gravity'` authored on S5. No other computed_outputs are declared — nothing else is painted as a standalone symbol on this concept (the bar caption `U` is engine-fixed; there is no second bar outside S5).

**`derived` fields are expression slots only** (bug `prose_in_a_variable_derived_field…`) — every `derived` string above is a pure expression the engine scope can evaluate; none contains a sentence. Documentation lives in `name`, never in `derived`.

**No μ term anywhere** (all guided states `frictionless: true`) — every formula above is finite under its declared defaults; no division by a coefficient that can be zero.

---

## 2. Per-state variable notes (`variable_overrides` discipline — bug #1 precedent)

`newtons_laws_body` does not merge a shared `default_variables` block the way PCPL does — every state declares its own `bodies[]` and `surface{}` from scratch. The defensive-lock discipline (`hinge_force.json` STATE_4 `F_ext: 0`; `field_forces.json` STATE_5 `m: 1`) still applies at the FIELD level: **every state below explicitly authors `energy_layer.h_ref_m` even where it equals the engine default (0)**, because S3's override to `0.3` sits three states away in the same list and a copy-paste of S1/S2/S4/S5/S6 without an explicit `0` is exactly how a stray `0.3` would leak forward (the bug-#1 failure mode, one layer up from a slider default).

| State | `mass_kg` | `initial_position_m` | `initial_velocity_mps` | `theta_deg` | `h_ref_m` (explicit, always) | Justification |
|---|---|---|---|---|---|---|
| S1 | 3 | 0.6 | 0 (driven, not launched — `F` supplies constant `v`) | 30 (home pose) | **0** | Matches S3's apparatus exactly except the one field below — the whole point of the declared contrast pair. |
| S2 | 2.5 | 2.8 | +3.13 | 30 | **0** | Home-armed checkpoint at `s_m = 2.8 = initial_position_m` (arms `_home = true`). |
| S3 | 3 | 0.6 | 0 | 30 | **0.3** | The ONE field that differs from S1 — the PRIMARY aha's entire apparatus change. |
| S4 | 3 | 0.6 | 0 | **48.6** | **0** | `theta_deg` is S4's own delta; `h_ref_m` still explicit at 0 so it can never inherit S3's 0.3 by an authoring slip. |
| S5 | 2.5 | 2.8 | +3.13 | 30 | **0** | Identical body/surface to S2 — the declared contrast pair; only `work_accumulators` + the second checkpoint are new. |
| S6 | 2 (rest) | 2.4 | 0 | 30 (slider default; sweep range 30–40) | **0** | Explore default `m = 2` deliberately DIFFERENT from every guided-state mass (3, 2.5) so a teacher's first slider touch is visibly a NEW configuration, not a silent repeat. |

No state needs a `K`-suppressing override (K is never rendered anywhere) and no state needs a friction override (every guided state is `frictionless: true`; S6 authors `mu_s: 0.9` / `mu_k: 0.8` explicitly as the static-hold scaffold, not a slider).

---

## 3. Within-state motion timeline + per-state control spec (Rule 31)

Home pose (permanent, Rule 32d): one incline, one cart, one U bar (`bars: ['U_grav']`, `bar_max_J: 60` in ALL SIX states), the dashed `h = 0` line always shown. Cause-before-effect (32a): the drive/launch motion is visible first; the bar and stamps respond to height, never the reverse. Zero state-level `glow_focal` anywhere — emphasis rides per-sentence `glow` bindings only.

### S1 — `lifting_stores_energy` (core · translate-through)

| t-window | What animates (pure fn of state clock) | Driven by | Live control(s) |
|---|---|---|---|
| 0–6000 ms (loops) | Cart translates from `s = 0.6` at constant `v = 0.8 m/s`; `displacement_vector` grows live from 0 | `s(t) = 0.6 + 0.8·t` | none |
| 500–1700 ms | Point A marker brightens, dwells 1200 ms; stamp `point A:  U = 14.7 J` | checkpoint crossing `s = 1.0` | none |
| 4200–5400 ms | Point B marker brightens, dwells 1200 ms; stamp `point B:  U = 44.1 J` | checkpoint crossing `s = 3.0` | none |
| 4400 ms (mid-B-dwell) | Formula surface line 2 appears: `ΔU = mgΔh = 29.4 J` | `formula_lines[1].at_ms` | none |
| eye_capture_ms 4800 | Frozen pin: B-stamp + both formula lines + `d = 2.40 m` all on screen | — | — |

`formula_lines: [{ text: "U = mgh" }, { text: "ΔU = mgΔh = 29.4 J", at_ms: 4400 }]` — **no `formula` key** (C-1).

**Narration** (55 EN words):
> 1. "Lifting a bag from the floor to a shelf stores energy in it — the higher the shelf, the more energy stored." [glow: `energy_bar_U_grav`]
> 2. "This cart's stored energy grows the same way, from fourteen point seven joules at point A to forty four point one at point B." [glow: `checkpoint_2`]
> 3. "The gain equals mass times gravity times the height climbed." [glow: `displacement_vector`]

### S2 — `same_height_same_energy` (core · cycle-compare)

| t-window | What animates | Driven by | Live control(s) |
|---|---|---|---|
| 0 ms | Departure (pass 1, no dwell): stamp `start height:  U = 34.3 J` latches within one frame | home-armed checkpoint, `capture_mode: 'every'` | none |
| 0–1278 ms | Cart rises from `s = 2.8` under `a = -4.9 m/s²`, `v0 = +3.13 m/s`; `predicted_stop` recomputes live | kinematic integrator | none |
| peak ≈ 800 ms | `highest point  h = 1.90 m` caption tracks live, settles at the apex | `predicted_stop` | none |
| 1278–2678 ms | Home recross: stamp re-written `start height (pass 2):  U = 34.3 J`, dwell 1400 ms | checkpoint re-crossing `s = 2.8` | none |
| eye_capture_ms 1978 | Frozen mid-pass-2-dwell: **ONE re-written stamp line**, not two (P3-4) | — | — |

**Narration** (46 EN words):
> 1. "A cart is launched up the slope, rises, slows, and falls back to where it started." [glow: `energy_panel`]
> 2. "Its stored energy reads thirty four point three joules at launch." [glow: `checkpoint_1`]
> 3. "It reads the same thirty four point three joules on return." [glow: `checkpoint_1`]
> 4. "The place sets the energy, not the trip." [glow: `energy_bar_U_grav`]

### S3 — `the_zero_is_your_choice` (core · PRIMARY aha · translate-through, declared contrast pair with S1)

Identical apparatus and motion to S1 — same body, same `v`, same checkpoint `s` values — with `energy_layer.h_ref_m: 0.3` the only authored change (32b: only the taught variable's rendered consequence changes). Bar opens at `0.0 J` (float-safe, verified `|U| < 1.6e-15` at t = 0, inside both the `-1e-9` guard and the `nlbEnFx` 0.05 clamp — never prints `-0.0 J`).

| t-window | What animates | Driven by | Live control(s) |
|---|---|---|---|
| 0–6000 ms (loops) | Same translate as S1; bar opens at 0.0 J instead of 8.8 J | `s(t) = 0.6 + 0.8·t`, `h = s·sin30° − 0.3` | none |
| 500–1700 ms | Point A stamp: `point A:  U = 5.9 J` | checkpoint `s = 1.0` | none |
| 4200–5400 ms | Point B stamp: `point B:  U = 35.3 J` | checkpoint `s = 3.0` | none |
| 4400 ms | Formula line 2 **holds byte-identical to S1**: `ΔU = mgΔh = 29.4 J` | `formula_lines[1].at_ms` | none |
| eye_capture_ms 4800 | Frozen pin: 4 numerals moved (0.0→5.9→35.3), 1 line held (29.4) | — | — |

`formula_lines: [{ text: "U = mgh" }, { text: "ΔU = mgΔh = 29.4 J", at_ms: 4400 }]` — **no `formula` key**, byte-identical `formula_lines` array to S1 (C-1).

**Narration** (53 EN words — anchor compressed per C-5, both binding constraints kept):
> 1. "The floor you start on could be called zero — the building never changes, only the numbers do." [glow: `marker_h_ref`]
> 2. "The concept before this placed its own zero at the ramp's foot." [glow: `marker_h_ref`]
> 3. "Here the same climb runs with the line moved to the start." [glow: `marker_h_ref`]
> 4. "Every reading changes, yet the gain, twenty nine point four joules, holds." [glow: `checkpoint_2`]

*Convention-free floor language check: "the floor you start on" — no floor number, no naming convention. The #6 bridge names its geometry fact only ("its own zero at the ramp's foot" — true under route (a), `h_ref_m = -3.05`), never claims S1/S2's line sits at the same place.*

### S4 — `different_slope_same_U` (extended · translate-through, declared contrast pair with S1)

| t-window | What animates | Driven by | Live control(s) |
|---|---|---|---|
| 0 ms | Ramp rotated to 48.6° (home pose change from S1's 30°) | `theta_deg = 48.6` | none |
| 0–3650 ms (loops) | Cart translates at constant `v = 0.8 m/s` from `s = 0.6`; `displacement_vector` grows to `d = 1.40 m` at the flag | `s(t) = 0.6 + 0.8·t` | none |
| 1750–3150 ms | Point B stamp: `point B:  U = 44.1 J` (identical numeral to S1's point B — the declared teaching identity) | checkpoint `s = 2.0` | none |
| eye_capture_ms 2450 | Frozen pin: `d = 1.40 m` on screen beside the same 44.1 J stamp S1 rendered at `d = 2.40 m` | — | — |

`formula: "U = mgh"` — **`formula` only, no `formula_lines`** (S4 is not part of the ΔU-invariant contrast pair; per C-1 the two mechanisms are never mixed on one state).

**Narration** (51 EN words):
> 1. "Stairs, a ramp, or an elevator to the same floor store the same energy in the bag." [glow: `displacement_vector`]
> 2. "This ramp is steeper: the cart travels only one point four metres instead of two point four." [glow: `displacement_vector`]
> 3. "It still reaches the same height, and the stamped energy is again forty four point one joules." [glow: `checkpoint_1`]

### S5 — `U_and_the_work_by_gravity` (advanced · cycle-compare, declared contrast pair with S2)

S2's exact launch (`m = 2.5`, `s0 = 2.8`, `v0 = +3.13`) plus `work_accumulators: [{ force: 'gravity', label: 'gravity' }]`, `work_scale_J: 30`.

| t-window | What animates | Driven by | Live control(s) |
|---|---|---|---|
| 0 ms | Home-armed `'first'` flag latches within one frame: `start (h = 1.40 m):  U = 34.3 J · W gravity = 0.0 J` | departure crossing, `_s_pre` pre-integrator stamp | none |
| 0–1884 ms | Cart rises under `a = -4.9 m/s²`; gravity work bar dips (signed, red, grows downward) | kinematic integrator + `nlbRunWorkAccum` | none |
| 289–1689 ms | Point C flag: `point C (h = 1.75 m):  U = 42.9 J · W gravity = −8.6 J` (U+2212), dwell 1400 ms | checkpoint `s = 3.5` | none |
| 600 ms | Formula line 2 appears: `ΔU = mgΔh = 8.6 J` | `formula_lines[1].at_ms` | none |
| wall 2389, 2678 | Descent/home recrossings — `'first'` early-continue no-ops, stamp never rewritten | — | none |
| eye_capture_ms 989 | Frozen pin: four latched numerals visible (34.3, 0.0, 42.9, −8.6) + the `mgΔh` line | — | — |
| tail → R 2900 | U drains as W climbs toward +10.0 J (confirms the mirror, never contradicts it) | — | — |

`formula_lines: [{ text: "ΔU = −W by gravity" }, { text: "ΔU = mgΔh = 8.6 J", at_ms: 600 }]` — **no `formula` key** (C-1). Minus sign is U+2212 in both the formula text and the `W gravity = −8.6 J` stamp clause (C-4).

**C-6 differentiator implemented:** checkpoint labels carry heights — `start (h = 1.40 m)` and `point C (h = 1.75 m)` — so Δh = 0.35 m is a rendered pair (`42.9 − 34.3 = 8.575 ≈ 8.6`; `1.75 − 1.40 = 0.35`; `2.5 × 9.8 × 0.35 = 8.575`, matches the formula line). Longer stamp head fit against the 340 px surface literal is **measured under P7, not asserted** — flagged to Checkpoint B (§6).

**Narration** (51 EN words — C-2's replacement, fullest budget):
> 1. "The last concept counted from a line at the ramp's foot, so its start already read forty nine joules." [glow: `checkpoint_1`]
> 2. "Here the start reads thirty four point three." [glow: `checkpoint_1`]
> 3. "Neither starting number matters — only the change does:" [glow: `energy_panel`]
> 4. "gravity's work and the stored energy change equally and oppositely, eight point six joules each way." [glow: `checkpoint_2`]

*C-2 compliance check: never states #6's start was zero (it states 49 J, which is #6's `h_ref_m = -3.05` value under route (a); independently confirmed: `2.5×9.8×2 = 49.0`, S5 uses m=2.5 matching its own body); cites #6 as "the last concept," never by state number.*

**P3-8 recorded here, as required:** S5's start stamp reads `W gravity = 0.0 J` **by design** — it is the labelled zero of a two-part ledger (paired with `point C`'s −8.6 J on the same surface), not the state's own reading of a completed round trip. A per-stamp implementation of the `checkpoint_capture_mode_first_at_the_home_pose…` probe will read this single stamp as "every captured accumulator reads exactly 0.0" and FAIL — that is an **expected, adjudicated non-recurrence** (founder-proxy cycle-2 §1(f)), not a regression. Do not route this back to json-author as a bug.

### S6 — `explore` (core, explore · drag-sandbox)

| t-window | What animates | Driven by | Live control(s) |
|---|---|---|---|
| 0–4000 ms, looping (`NLB_SWEEP_MS`) | `idle_auto_sweep {param:'theta', range:[30,40]}` starts at 30° (the authored value — no first-frame snap); ramp rotates 30°→40°→30°, cart rides it; `h = 0` line stays fixed in world | `theta_deg(t)` triangle wave | `theta` (also teacher-draggable) |
| continuous | U bar reads live: 23.5 J (θ=30°) → 30.2 J (θ=40°) at fixed `m=2, s=2.4` | `U = m·g·s·sin(theta_deg)` | `m`, `theta` |
| on first trusted event | Sweep seizes; the touched control now teacher-driven, cart stays at rest (static hold `μs=0.9 > tan θ` for all authored θ ≤ 40°) | teacher drag | `m`, `theta` |
| free-run (Rule 37) | Never freezes; motion loops forever | — | `m`, `theta` |

`formula: "U = mgh"` — `formula` only. **No `formula_lines`.**

No narration (explore = 0/open, Rule 31).

**Token audit completion (P3-3 — the one gap cycle-2 found):** the 9th unauthored `controls_visible` enum member is `v0`. Reason: `U = mgh` has no velocity term; the explore body is at rest by design (static-hold scaffold), so a velocity control would teach nothing about this concept and is correctly refused.

---

## 4. Board-mode mark scheme + derivation sequence

**SKIPPED.** Rule 20 [D] — board/competitive modes are suspended fleet-wide; no `mode_overrides` authored on this concept.

---

## 5. Drill-down cluster phrasings

### S3 — `zero_reference_choice`
1. "why can we just pick where zero is"
2. "how is height zero not always the ground"
3. "doesnt changing the zero point change the real energy"
4. "why did the energy become 0 when nothing moved"
5. "is the potential energy value even real if we can choose it"

### S3 — `negative_potential_energy`
1. "can potential energy be negative"
2. "what does negative U even mean"
3. "is energy below zero still energy"
4. "why would something have less than no energy"
5. "does negative U mean the object lost energy forever"

### S3 — `delta_u_vs_u`
1. "which one do i use in the formula, U or delta U"
2. "why does only the change matter and not the total"
3. "is delta U the same as U"
4. "why do two different U values give the same answer"
5. "when do i need the actual U instead of just the change"

### S4 — `path_independence_gravity`
1. "does the path taken change the energy stored"
2. "why is a longer ramp not more energy"
3. "does it matter if i go straight up or along a slope"
4. "why does zigzagging not add extra potential energy"
5. "is climbing stairs different from taking a lift energy wise"

### S4 — `ramp_vs_vertical_lift_work`
1. "why does a ramp need less force but the same energy"
2. "if the ramp uses less force why isnt the work less"
3. "how can two different paths store the same energy"
4. "does pushing something up a ramp do less work than lifting it"
5. "why bother with a ramp if the energy is the same"

### S4 — `longer_ramp_less_force_same_energy`
1. "whats the point of a ramp if energy stored is the same"
2. "why do trucks use ramps instead of lifting straight up"
3. "if force is less on a ramp where does the energy difference go"
4. "does a gentler slope save energy or just save force"
5. "why does pushing longer not mean storing more"

All 30 phrases read as real Class-11 student typing (lowercase, no punctuation discipline, plain English, no Hinglish) — none phrased as a teacher's rhetorical question.

---

## 6. Constraint callouts (json-author encoding contract)

1. **`formula_lines` REPLACES `formula`, never appends (C-1, CRITICAL).** `nlbRenderStamps` (`field_3d_renderer.ts` L50642–50654) sets `txt = formula_base` then OVERWRITES it whenever `formula_lines` is a non-empty array (presence resolved by `Array.isArray && length`, L50981–50982). Author:
   - **S1 / S3:** `formula_lines: [{ text: "U = mgh" }, { text: "ΔU = mgΔh = 29.4 J", at_ms: 4400 }]`. No `formula` key present anywhere on these two states.
   - **S5:** `formula_lines: [{ text: "ΔU = −W by gravity" }, { text: "ΔU = mgΔh = 8.6 J", at_ms: 600 }]`. No `formula` key.
   - **S4 / S6:** `formula: "U = mgh"` only. No `formula_lines` key at all (an empty array blanks the surface — never author one).
   - **Checkpoint-B evidence required:** an S1 frame captured BEFORE 4400 ms showing `U = mgh` on `#nlb_formula`, non-empty.

2. **Angle handling:** `theta_deg` is authored directly in DEGREES in every state config (`surface.theta_deg`); the renderer converts internally. Any physics-block-side formula that computes `h`/`U`/`F`/`a` from `theta_deg` (§1 above, or a numeric:calc scope) MUST wrap the trig call as `sin(radians(theta_deg))` — this is the `field_3d` dialect (confirmed live in the shipped `conservative_vs_nonconservative_forces.json` `physics_engine_config.formulas`, e.g. `"N": "m * g * cos(radians(theta_deg))"`). **Never** author a bare `sin(theta_deg)` — this is the field_3d/mechanics_2d convention, the mirror-image trap of the PCPL `radians()` prohibition (`pcpl_radians_helper_missing` is the OPPOSITE dialect and does not apply here — this is not a PCPL concept).

3. **Minus glyph discipline (C-4).** `nlbEnFx` emits U+2212 automatically for engine-computed numbers, but `formula_base`/`formula_lines` text renders byte-for-byte as authored — it is NOT run through that helper. Every authored minus sign in `formula_lines` text (`"ΔU = −W by gravity"`) and every `label`/`h_ref_label` string MUST be typed as U+2212 (`−`), never ASCII hyphen (`-`). An ASCII hyphen would sit visibly narrower than the engine's own `−8.6 J` on the same surface (S5). Verify by codepoint scan before commit, not by eye.

4. **`h_ref_m` explicit on every state (§2 above).** Author it even at the default `0` on S1/S2/S4/S5/S6 — never omit it and rely on the engine default, because S3's `0.3` sits mid-list and any state authored by cloning a sibling can silently inherit the wrong value if the field is ever left implicit.

5. **Probe P6, extended per C-3(b) — author for json-author to run, not to skip:** at each state's `eye_capture_ms`, load S1, S3 AND S4 (not S3 alone) and assert `marker_h_ref` + its label are `visible` AND inside the rendered viewport, and that the line reads as a level distinct from the slab silhouette (not lost inside it). **If it clips on any of the three, route a camera-framing note — do NOT move `h_ref_m`** (moving it destroys the shared 60 J scale and every stamp derived above). S2's `predicted_stop` caption (`highest point  h = 1.90 m`) is asserted by the same probe pass.

6. **Probe P7 (surface fit, measured not asserted) — S5's new label lengths.** With the C-6 differentiator (`start (h = 1.40 m)`, `point C (h = 1.75 m)`), re-measure the rendered-line count and width against the 340 px `formula`/checkpoint-stamp surface literal at `eye_capture_ms = 989`. If either label wraps mid-clause, shorten to `start  h=1.40m` / `point C  h=1.75m` (still legible, a few chars shorter each) rather than dropping the heights — the Δh pair is the whole point of the differentiator.

7. **Checkpoint-B duty, recorded not closed (C-6).** Under route (a) both `#6`-S3 and `#7`-S5 end on a launched body on a 30° incline with a U bar, a signed gravity ledger, and two latched two-clause stamps proving `ΔU = −ΔW`. Checkpoint B must place the two frozen frames side by side and answer in writing whether they read as one picture. This physics block cannot close that duty — it is a cross-concept visual judgment, not a physics computation.

8. **P3-4 marker spacing.** S5's two checkpoint flags sit 0.7 m apart in world space (`s = 2.8` and `s = 3.5`), not the 2.0 m the FIXED near-collision row's "easy case" disposition assumed. `nlbStackMarkerLabels` is relied on to de-collide the two captions (now longer, with the C-6 height suffixes) — measure both captions at the S5 pin under P7, don't assume clearance.

9. **Eye-walker reading notes (P3-5/P3-6), carried for the record, not physics-block duties to close:** at S5's pin the cart is frozen standing on the point-C marker, so the position dot may be occluded by the body (depth-tested by design) while the label sprite will not be — an occluded dot is not a missing marker. S1/S4's `d = 2.40 m` / `d = 1.40 m` are exact only inside their dwell windows; a scrubbed tail frame showing a grown value is not a contradiction.

10. **No `radians()`/angle conversion needed anywhere else** — `F`, `a`, `W_gravity` all route through the same `sin(radians(theta_deg))` term computed once by the engine; nothing in this concept exposes a raw radian value to a student.

11. **Slider steps (S6):** `m` — min 1, max 3, step 0.5, label override `'m'` (kills the default two-body glyph via `slider_controls.m.label`); `theta` — min 15, max 40, step 1 (bounded below the 41.99° static-hold limit at μs = 0.9).

---

## 7. Numerical sanity checks (independently reproduced, python `g = 9.8`)

| State | Quantity | Computed | Matches skeleton/cycle-2 |
|---|---|---|---|
| S1 | U₀ (s=0.6) | 8.82 → `8.8` | ✓ |
| S1 | point A / B U | 14.7 / 44.1 (44.099999999999994) | ✓ |
| S1 | ΔU (A→B) | 29.4 (29.399999999999995) | ✓ |
| S3 | point A / B U (h_ref 0.3) | 5.88→`5.9` / 35.28→`35.3` | ✓ |
| S3 | ΔU | 29.4 (identical to S1) | ✓ |
| S3 | opening U at t=0 | −1.63×10⁻¹⁵ → renders `0.0 J`, never `−0.0 J` | ✓ |
| S4 | sin(48.6°) | 0.7501110696304596 | ✓ |
| S4 | F | 22.053265447135512 → `22.05` | ✓ |
| S4 | point B U (s=2.0) | 44.106530894271025 → `44.1` | ✓ (matches S1's 44.1) |
| S4 | d at flag | 1.4 → renders **`1.41 m`** | ✓ — the dwell freezes one step past the 1.40 crossing (§0B.25); every S4 string claims 1.41. Separation from S5's `h = 1.40 m` rests on the `d =`/`h =` prefix, NOT this digit — see the skeleton cross-tab tripwire |
| S2/S5 | U₀ (s=2.8) | 34.29999999999999 → `34.3` | ✓ |
| S2 | return time | 1277.55 ms → `1278` | ✓ |
| S2 | peak s / h | 3.7997 / 1.8998 → `1.90 m` | ✓ |
| S5 | point C U/h (s=3.5) | 42.87499999999999 → `42.9`; h=1.75 | ✓ |
| S5 | W_gravity at C | −8.575 → `−8.6` | ✓ |
| S5 | 42.9 − 34.3 vs \|−8.6\| | 8.6 = 8.6 (exact to display) | ✓ |
| S5 | Δh, mgΔh | 0.35, 8.575 → `8.6` | ✓ |
| S5 | physics at R (1500 ms) | s=1.9825, U=24.29 → `24.3`, W=+10.014 → `+10.01` | ✓ |
| S5 | folded (R+50=1550 ms) | s=1.7654, U=21.63 → `21.6`, W=+12.674 → `+12.67` | ✓ |
| S5 | h=0 crossing physics time | 1884.12 ms → margins 384 ms (R) / 334 ms (folded) | ✓ matches cycle-2's correction, NOT the skeleton's original 334/284 (P3-2 confirmed real) |
| S4 | folded (R+50, s=2.44) | h=1.8303, U=53.80996769101065 → `53.81` | ✓, 10.3% under the real 60 J threshold |
| S6 | worst corner (m=3,θ=40,s=2.4) | U=45.355 → 45.4 J ≤ 54 | ✓ |
| S6 | static-hold limit | atan(0.9) = 41.987° | ✓ |
| S6 | rest pose (m=2,θ=30,s=2.4) | U=23.52 → `23.5` | ✓ |

No number failed to reproduce. The one pre-existing table error I caught matches cycle-2's own correction (S5's h=0 margins) — I did not find a NEW arithmetic error anywhere in the six states.

---

## 8. Findings beyond the gate (evidence-backed; flagged, not silently fixed)

**Finding 1 — a fourth, unflagged instance of the same "false continuity claim" defect (Error B family), inside the DoD symbol-label table.** Cycle-2's §3.8 Error B names three locations to strike (§7 header, §4 belief-1 beat, Block-1 item 3). A fourth exists at the DoD symbol-label table row for "Height reference" (skeleton line 224):

> "S1 narration carries the one label-bridging clause: the previous concept wrote its U = 0 on this same line; here it reads h = 0 (cited by concept_id)."

"this same line" is the identical false claim under route (a) (`h_ref_m = −3.05` for #6 vs `h_ref_m = 0` for #7-S1 — the slab midpoint, not the ramp's foot, per cycle-2's own `nlbApplySurface` derivation). It is also now in tension with C-3(a)'s corrected planting story ("S1 and S2 use a zero line silently and confidently and never discuss it") — a state that is supposed to use the line silently cannot simultaneously carry a verbatim narration duty discussing it.

**Disposition:** I did NOT author this clause into S1's narration (§3 above — S1's three sentences never mention the h = 0 line or #6). This is a physics-authoring decision, not a silent drop: the corrected planting story requires S1's silence, and the label-bridge claim was false on the geometry regardless. Recommend json-author/Checkpoint-B strike the DoD table's bridging-clause sentence and replace it with a note that S1/S2 author no narration reference to the h = 0 line at all (silent, confident use, per the corrected planting story). I am NOT minting a new engine_bug_queue row for this — it is the same `prior_rulings_and_internal_ledgers_are_not_re_run_over_the_states_a_restructure_creates` recurrence cycle-2 already cites three times; a fourth instance of the identical class is noted here for the dispatching session, not filed separately.

**Finding 2 — S5's C-2 replacement number for #6 independently verified, one level deeper than the carry-in asked.** C-2's given replacement text says "forty-nine joules." I confirmed this is dimensionally consistent with S5's OWN body (`m = 2.5 kg`): `2.5 × 9.8 × 2.0 = 49.0` is exactly reproducible from #6's own stated U₀ = 49.0 J (read at source by the cycle-2 reviewer), so the number travels correctly into S5's narration without rounding drift. No correction needed.

**Finding 3 — S4's 22.05 N force value:** confirmed the precision independently (`22.053265447135512 → 22.05`) even though it is never rendered as a numeral anywhere in this design (F is drawn as an arrow only; no angle_arc, no θ numeral, no F stamp per the DoD symbol table). No action needed; noted only for the audit trail in case a future retrofit adds an F stamp.

**No other disagreements.** Both architect refusals (offset flag at s=2.85; home-armed `'every'` + `dwell_from_pass: 2`) were independently re-verified by hand in §7 above and I concur with the cycle-2 upholding on both — the home-armed `'first'` design is strictly better (one subtraction per side, not two) and the `'every'`+dwell-2 alternative recreates the exact folded-frame overrun the architect avoided.

---

## 9. Self-review checklist

- [x] Every symbol in the skeleton's state narratives (`m`, `theta_deg`, `h_ref_m`, `s`, `h`, `U`, `F`, `v`, `v0`, `a`, `W_gravity`, `d`) appears in `variables`.
- [x] Every formula with an angle argument wraps it `sin(radians(theta_deg))` — none omitted, none double-wrapped.
- [x] Live control(s) declared per state exactly matching the architect's control table: none on S1–S5, `m`+`theta` on S6 (Rule 31 only-what-this-state-teaches / explore = ALL relevant).
- [x] `h_ref_m` variable_overrides documented for every state, each justified (§2) — S3's `0.3` is the only substantive change; all others are defensive explicit locks at the default.
- [x] Board mark scheme SKIPPED per Rule 20 [D] (§4).
- [x] Drill-down phrasings: 5 per cluster × 6 clusters = 30, real-student register verified (§5).
- [x] `constraints` block: 6 short factual assertions (§1), none pedagogical.
- [x] Numerical sanity check: every rendered numeral in every state independently recomputed in python, all reproduced (§7); one table correction (S5 h=0 margins) confirmed as a real, already-caught error, no new ones found.
- [x] Within-state motion timeline for every state: 6/6 states, t-window × animation × driven-by × controls, each a pure fn of the state clock, no two states share a motion beat (three DECLARED contrast pairs named per Rule 31), no static state (§3).
- [x] Rule 32 sequencing: cause (motion/rotation) precedes effect (bar/stamp) with margin in every driven/launched state; only the taught delta changes per state (h_ref_m on S3, theta_deg on S4, work_accumulators+labels on S5, m+theta on S6).
- [x] Word budget (Rule 31a): S1 55, S2 46, S3 53, S4 51, S5 51 — all inside 25–55, matching each state's own tighter target band from the skeleton control table; S6 = 0/open.
- [x] Notation ladder (Rule 38c): every formula surface on core/extended (S1/S2/S3/S4/S6) is algebra-only (`U = mgh`, `ΔU = mgΔh`); S5 (advanced) is also algebra-only — no calculus anywhere in this concept, so no FLAG to the founder is needed. Dialect (38d): "stored energy — potential energy U" dual-labelled once (S1), bare `U` thereafter (carried from the skeleton, unchanged).
- [x] Engine bug queue consulted live this session (`--owner alex:physics_author`, 15 rows; `--owner alex:json_author`, 153 rows) — every FIXED row's prevention rule cross-checked against this design: `nlb_signed_bar_half_range_breaks_equal_value_pairing_with_an_unsigned_bar` (no equal-height claim authored between U and W — §3 S5 narration states the numeral equality only, never a bar-height claim); `nlb_signed_launch_velocity_state_never_renders_K0…` (N/A — K never rendered here, only U); `computed_output_name_encodes_a_symbol_no_instrument_paints…` (both `U_J`/`gravity_J` keys byte-match painted captions, §1); `prose_in_a_variable_derived_field…` (all `derived` fields are pure expressions, §1); `concept_ships_zero_narration_glow_bindings` (every sentence above carries a glow, §3). No exception required.
- [x] DC Pandey check: no formula, explanation, worked-number, or example problem imported from any external book. `U = mgh` derived from #6's `ΔU = −W_conservative` applied to gravity (S5's own derivation, first-principles); all numeric values are this concept's own authored apparatus, not a textbook's.

---

## Findings NOT taken (with evidence)

None beyond what §8 already states. I considered re-opening C-6's "optional" status (implementing it as MANDATORY rather than recommended) but the cycle-2 report explicitly frames it as optional-but-recommended with a named measurement duty (P7) rather than an assertion — implementing it without over-claiming its surface-fit is the correct middle path, which is what §3/§6 above do.
