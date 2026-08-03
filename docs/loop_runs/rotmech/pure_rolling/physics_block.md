# PHYSICS BLOCK — `pure_rolling` (rotmech · Class 11 Ch.7 · 0b)

> Produced by `alex:physics_author` 2026-08-02 against **skeleton REV 3 (as amended)** after founder-proxy Checkpoint A returned **`DESIGN_OK`** (`founder_proxy_A_cycle2_final.md`). All six carry-forwards taken. Completes Phase 0b; the 0c-2 `field3d-surgeon` dispatch is authorised on skeleton REV 3 + this block.

**Bug-queue consulted first** (`--owner alex:physics_author`, `--owner alex:json_author`). Prevention rules honoured: `concept_ships_zero_narration_glow_bindings` (every `tts_sentences[]` entry below carries a `glow`), `field3d_nlb_arrow_min_length_floor…` (the velocity channel is independent of the force channel — reproduced intact), `state_glow_focal_dims_one_half_of_the_relation…` (S2/S5/S6 author no state-level focal), `teach_reveal_synced_to_narration` (every glow window tuned to the narration beat that introduces it). No settled REV-3 design decision reopened.

---

## A. `physics_engine_config`

```json
{
  "variables": {
    "v0": { "name": "translational speed v", "unit": "m/s", "min": 0.5, "max": 2.5, "default": 0.9 },
    "R":  { "name": "wheel radius", "unit": "m", "min": 0.15, "max": 0.35, "default": 0.25 },
    "omega0": { "name": "starting spin omega0 (decoupled from v)", "unit": "rad/s", "min": 0, "max": 12, "default": 3.6, "derived": "v0 / R (recomputed live in S8 whenever v0 or R changes and omega0 itself is not being dragged)" },
    "mu_k": { "name": "kinetic friction coefficient", "unit": "", "min": 0.02, "max": 0.30, "default": 0.05 },
    "m": { "name": "mass", "unit": "kg", "constant": 1 },
    "k": { "name": "moment-of-inertia coefficient (I = k m R^2) — uniform disc", "unit": "", "constant": 0.5 },
    "g": { "name": "gravitational acceleration", "unit": "m/s^2", "constant": 9.8 },
    "theta_deg": { "name": "incline angle (this concept is FLAT)", "unit": "deg", "constant": 0 },
    "x0": { "name": "home-pose position", "unit": "m", "constant": 2.4 },
    "L_half": { "name": "track half-length", "unit": "m", "constant": 3.0 }
  },
  "formulas": {
    "rolling_condition_rhs": "R * omega",
    "contact_speed": "abs(v - R * omega)",
    "circumference": "2 * PI * R",
    "mark_position_n": "x0 - n * 2 * PI * R",
    "skid_deceleration": "mu_k * g",
    "skid_stop_time_s": "v0_skid / (mu_k * g)",
    "skid_stop_position": "x0 - (v0_skid * v0_skid) / (2 * mu_k * g)",
    "capture_time_s": "(v0 * k) / (mu_k * g * (1 + k))",
    "capture_speed": "v0 / (1 + k)",
    "capture_slide_distance": "(v0 * v0 * k * (2 + k)) / (2 * mu_k * g * (1 + k) * (1 + k))",
    "capture_position": "x0 - capture_slide_distance"
  },
  "computed_outputs": {
    "circumference_m": "2 * PI * R",
    "turns_count": "engine turn-count trigger (physics event, never authored ms)",
    "capture_time_ms": "1000 * (v0 * k) / (mu_k * g * (1 + k))",
    "capture_speed_m_s": "v0 / (1 + k)",
    "capture_position_m": "x0 - (v0*v0*k*(2+k))/(2*mu_k*g*(1+k)*(1+k))",
    "slide_envelope_coefficient": "k*(2+k)/(2*mu_k*g*(1+k)*(1+k)) — evaluates to 0.567 at mu_k=0.05, k=0.5, so d(v0) = 0.567*v0^2"
  },
  "constraints": [
    "v = R*omega holds identically for every body in the ROLLING branch (S1, S2, S6, S7 post-capture, S8 when rolling) — it is NOT true by construction in S4 (pure slide, omega held 0) or S5 (pure spin, v held 0); those two are the ingredients whose sum, in S6, satisfies v = R*omega.",
    "Contact-point speed |v - omega*R| = 0 exactly whenever v = R*omega holds; nonzero only during a declared sliding phase (S3 phase A, rotation_locked; S7 pre-capture).",
    "A1 branch-priority rule (`:45497-45499`): whenever the rolling condition holds, the rolling branch SUPERSEDES Branch A's f = -sign(v)*mu_k*N — so f reads exactly 0.00 N on every rolling body, never merely small. This is why S3's phase-B roller and S7's post-capture wheel both read `f 0.00 N` honestly, not a residual near-zero.",
    "k = I/(m R^2) = 0.5 for every wheel body in this concept — the wheel is modelled as a UNIFORM DISC. k is never rendered on canvas anywhere (do-not-prespoil — k is #12's authored reveal).",
    "Kinetic friction f_k = mu_k*m*g acts ONLY while the contact point is sliding (S3 phase A; S7 pre-capture); never on a body already satisfying the rolling condition.",
    "theta = 0 (flat track) throughout — no incline forms, and NO formula in this concept ever calls radians(); theta is a constant, not a variable, everywhere in pure_rolling (contrast with the sibling).",
    "The revolution-marks primitive is a pure function of turn count (s_n = x0 - n*2*PI*R), never of authored ms — S1's mark-1 stamp fires when one completed turn is satisfied, which HAPPENS to land at 1745 ms under the authored defaults; it is not hardcoded to 1745.",
    "capture_time_s and capture_speed are both closed-form, never a per-frame latch: t_c = v0*k/(mu_k*g*(1+k)); v_roll = v0/(1+k)."
  ]
}
```

**Numerical sanity check (run).** At defaults (v₀ = 0.9, R = 0.25, ω₀ = 3.6, μ_k = 0.05, k = 0.5, g = 9.8): circumference = 2π·0.25 = **1.5708 m**; S1 mark-1 = 1.5708/0.9 = **1745 ms** ✓. S3 phase A (v₀ = 2.0, μ_k = 0.2): a = **1.96 m/s²** ✓, t_stop = **1020 ms** ✓, s_stop = 2.4 − 1.0204 = **+1.3796** ✓. S7 (v₀ = 2.0, μ_k = 0.05): t_c = 1.0/0.735 = **1361 ms** ✓, v_roll = **1.3333** ✓, slide = 2.721 − 0.4535 = **2.2676 m** ✓, capture at **+0.1324** ✓. Envelope at v₀ = 2.5: **3.5431 m** ✓. All reproduce the skeleton's asserted figures to the digit.

**FLAGGED EDGE CASE — a joint extreme no prior document derived (advisory, not blocking).** The S7 envelope (d ≤ 3.543 m) is stated at the FIXED μ_k = 0.05, because S7 never exposes μ_k live. **S8 does** (advanced ring, down to 0.02). At v₀ = 2.5 with μ_k = 0.02: d = 7.8125/0.882 = **8.86 m** — far beyond the 5.4 m of track from x₀ = +2.4 to the −3.0 bound. At that corner a teacher who sets ω₀ = 0, v₀ near max and μ_k near its floor will **not see capture complete on screen** before the wheel reaches the geometric bound. This is not wrong physics — a very low μ_k genuinely takes a very long distance to spin a wheel up, which IS the correct picture of near-frictionless ice — but it is a joint extreme the S7-scoped envelope paragraph does not cover. Recommend Checkpoint B confirm the sandbox's bound-vs-capture behaviour at this corner is honest (wheel holds at the bound still slipping, contact readout nonzero) rather than silent.

---

## B. Per-state `variable_overrides`

Every state locks values defensively (the `hinge_force`/`field_forces` pattern), even where a value coincides with the global default — most states expose FEWER controls than the global variable set, and an upstream leak (a prior state's slider drag, or the default-variables merge bug) must not silently change what a no-control state shows.

| State | `variable_overrides` | Justification |
|---|---|---|
| S1 | `{ v0: 0.9 }` (R stays live) | S1 exposes only R; v0 has no slider here and must never inherit S7's or S8's last-dragged value. ω is NOT overridden — it derives live as v0/R, so the R-drag re-lift/re-scale/respace is a live recompute, not a second override. |
| S2 | `{ v0: 0.6, R: 0.25 }` (no live controls) | "Slow roll" is a specific narrative value distinct from S1's 0.9; R has no drag here and must render at the canonical 0.25 so the cusp/arch geometry (πR/v = 1309 ms, 2πR/v = 2618 ms) matches the timing table exactly. |
| S3 · phase A (`nlb_wheel_locked`) | `{ v0: 2.0, mu_k: 0.2, rotation_locked: true }` | The skid deceleration (1.96 m/s²) and stop position (+1.3796) are load-bearing timing numbers; a leaked global μ_k (0.05) would silently change the skid physics and desync the pin. |
| S3 · phase B (`nlb_wheel_roll`) | `{ v0: 2.0, activate_at_ms: 1500 }` | Must match phase A's entry speed narratively ("the same wheel now rolls"); a mismatched v0 would make the retirement swap read as two different wheels. |
| S4 | `{ v0: 1.0, mu_k: 0, rotation_locked: true }` | The frictionless flag is load-bearing (no deceleration is the point); `rotation_locked` forces spokes visibly still — without it a leaked ω-derivation would spin the wheel and destroy the "pure translation" claim. |
| S5 | `{ v0: 0, omega0: 4.0, mu_k: 0 }` | v0 = 0 is the entire state's claim (centre at rest); it must be pinned, not merely "not dragged" — S7's v0 default (2.0) sits on the same variable name. |
| S6 | `{ v0: 1.0, omega0: 4.0 }` | Both authored individually so their ratio satisfies v = Rω exactly (1.0 = 0.25 × 4.0) — the state's payoff must not silently vary if either upstream default drifts. |
| S7 | `{ v0: 2.0 (slider default, range 1.0–2.5), omega0: 0, mu_k: 0.05 }` | ω₀ = 0 is the launch condition that defines the state and is NOT the same slider as S8's live ω₀ — it must be pinned even though S8 exposes a control with the same physical meaning. |
| S8 | `{ v0: 0.9, R: 0.25, omega0: 3.6 (= v0/R), mu_k: 0.05 }` — all four live at these seeds | Explore seeds match the global defaults for continuity with S1's opening picture; on every wrap v and ω re-seed to these authored values ((c)-7), so the seeds double as the wrap-reset targets. |

---

## C. Within-state motion timeline + control spec (Rule 31)

**Reconciliation note for json_author.** Where a sentence-level `glow` names an element already inside a state's authored `phases[]` window, the binding confirms/times that window to the narration beat (satisfying `teach_reveal_synced_to_narration`) and changes no authored number. Where a sentence precedes any authored window (S1 ①②, S2 ①), the binding documents which readout the narration is about without requiring a NEW brightness event — the readout is already legible (Rule 33d), so Rule 32e is not at risk. **For S2 specifically:** recommend subdividing the single authored rim-dot window into a three-part glow walk (centre → rim/cusp → contact) mirroring S4/S5/S6 and the three S2 sentences — same window span, same 2618 ms hand-back, no approved number changes.

### STATE_1 — "One turn, one circumference" (core; R = 5000)

| t-window | What animates | Driven by | Controls |
|---|---|---|---|
| 0 ms | Wheel begins rolling at v = 0.9 from x₀ = +2.4; **mark 0 stamps** at the release point | v0 fixed, turn-count trigger n = 0 | R |
| 0–1745 ms | Wheel translates + spins live (ω = v/R); on R drag it re-lifts, re-scales and respaces marks live | R (live) | R |
| **1745 ms (physics event)** | **Mark 1 stamps** at s = x₀ − 2πR (one completed turn) | turn-count trigger n = 1 | R |
| 1745–2050 ms | Circumference bracket draws mark 0 → mark 1 (305 ms draw span, E12 primitive) | bracket primitive | — |
| **2300 ms (bought)** | Formula line 1 `one turn → 2πR` | `formula_overlay[0].at_ms` | — |
| **2600 ms (bought; last asserted event, pin 3000, margin 400)** | Formula line 2 `v = Rω`; readouts `v 0.90` and `Rω 0.90` sit equal | `formula_overlay[1].at_ms` | — |
| 2600–5000 ms | Wheel continues to run end s = −2.1 (mark 2 physics-triggers at 3490 ms, past the pin) | kinematics | R |
| any time | A trusted R drag SEIZES the loop — wheel rolls to the −3.0 bound (run extends to 5.4 m), marks keep stamping, holds; `energy_active` false, no energy event | R drag | R |

**Control:** R — 0.15–0.35 m, default 0.25, step 0.01.

**Narration (54 words; budget 45–55):**

| # | `text_en` | glow |
|---|---|---|
| ① | "The wheel's CENTRE moves along the road at speed v." | `v_readout` |
| ② | "Its turn rate, omega — angular velocity — counts the angle turned each second." | `omega_readout` |
| ③ | "Each completed turn puts exactly one circumference, 2πR, of road behind it." | `circumference_bracket` |
| ④ | "So the two are locked: speed v equals R times omega." | `formula_surface` |
| ⑤ | "A bicycle wheel crosses the road exactly this way." | `wheel_body` |

### STATE_2 — "The contact point is at rest" (core, PRIMARY aha; R = 5000)

| t-window | What animates | Driven by | Controls |
|---|---|---|---|
| 0 ms | Centre arrow (0.552 wu) + contact zero marker (dot + `0.00 m/s`) both **static from state entry** | v = 0.6 fixed | none |
| continuous | Marked rim dot streams along its cycloid trace | live (v, ω), ω = v/R at R = 0.25 | none |
| **1309 ms (physics event)** | First cusp — the rim dot visibly stops at the ground touch while the wheel keeps moving | πR/v | none |
| **2618 ms (arch completion; glow hand-back complete, pin 3000, margin 382)** | Arch completes top-to-top; centre arrow + rim trace + contact marker all at full brightness | 2πR/v | none |
| 2618–5000 ms | Wheel continues to run end s = −0.6 | kinematics | none |

**Controls:** none.

**Narration (44 words; budget 35–50):**

| # | `text_en` | glow |
|---|---|---|
| ① | "Watch the point where the wheel touches the road — the centre above it moves forward at speed v." | `centre_arrow` |
| ② | "But the bottom point comes to rest at every touch, not moving forward at all." | `rim_dot` |
| ③ | "Its speed reads zero exactly there, while the centre keeps moving." | `contact_marker` |

### STATE_3 — "No sliding, no kinetic friction" (core, 16a; R = 4000; `single_lane: true` + `lane_gap_m = 0`)

| t-window | What animates | Driven by | Controls |
|---|---|---|---|
| 0 ms | Phase A (`nlb_wheel_locked`, `rotation_locked`) seeded s₀ = +2.4, v₀ = 2.0, skids in | state entry | none |
| 0–1020 ms | Phase A decelerates at a = μ_k·g = **1.96 m/s²**; skid trail draws; `f_k 1.96 N` | skid kinematics | none |
| **1020 ms (physics event)** | Phase A stops at s = **+1.3796**, holds (v = 0, a = 0) | v(t) = v₀ − at | none |
| 1020–1500 ms | Phase A holds at rest (480 ms) | — | none |
| **1500 ms (bought — the ONLY `activate_at_ms` in this concept)** | Phase A **RETIRES** (hard cut: hidden, un-integrated, skid trail CLEARED) exactly as Phase B (`nlb_wheel_roll`) activates, seeded s₀ = +2.4, v₀ = 2.0 | `bodies[].activate_at_ms` | none |
| 1500–1800 ms (last asserted event, pin 2400, margin 600) | Phase B rolls at constant v = 2.0 (rolling branch, A1 priority, `f 0.00 N`); readouts settle | kinematics | none |
| 1800–4000 ms | Phase B continues to run end s = −2.6 (0.4 m inside the bound) | kinematics | none |

**Controls:** none.

**Narration (55 words; budget 40–55 — at ceiling, no further additions). Sentence 2 is the bridge across the hard cut:**

| # | `text_en` | glow |
|---|---|---|
| 1 | "A locked wheel skids in, slows, and stops, leaving a skid mark." | `skid_trail` |
| 2 | "That skidding wheel is gone; the same wheel now rolls instead." | `nlb_wheel_roll` |
| 3 | "It crosses at a steady speed, leaving no mark: the contact point is not sliding, so friction is zero." | `f_readout` |
| 4 (anchor) | "A braked, locked wheel leaves a skid mark; a rolling wheel leaves none." | `nlb_wheel_roll` |

*Transparency note: this pre-approved anchor counts **13** words by direct token count, not ≤12 as the skeleton's guidance states. Flagged, not altered — it is approved copy.*

### STATE_4 — "Sliding only: one speed everywhere" (extended; R = 4000)

| t-window | What animates | Driven by | Controls |
|---|---|---|---|
| 0 ms | Wheel slides at v = 1.0, spokes visibly fixed; three arrows (top/centre/bottom, **0.92 wu each**) static from entry | v₀, `rotation_locked`, frictionless | none |
| 300–600 / 600–900 / 900–1200 ms | Glow walk: top → centre → bottom; **hand-back to all three EQUAL at 1200** (pin 2400, margin 1200) | `phases[]` | none |
| 1200–4000 ms | Wheel continues to run end s = −1.6 | kinematics | none |

**Narration (29 words; budget 25–35):**

| # | `text_en` | glow |
|---|---|---|
| 1 | "This wheel slides without turning at all." | `wheel_body` |
| 2 | "The top of the wheel moves at speed v." | `top_arrow` |
| 3 | "So does the centre." | `centre_arrow` |
| 4 | "So does the bottom — every point, the same speed." | `bottom_arrow` |

### STATE_5 — "Spin in place: centre at rest" (extended; R = 4000)

| t-window | What animates | Driven by | Controls |
|---|---|---|---|
| 0 ms | Wheel spins in place at the home pose, ω = 4.0, v = 0; top (+0.92 wu), bottom (−0.92 wu), centre zero marker all static from entry | ω₀, frictionless | none |
| 300–600 / 600–900 / 900–1200 ms | Glow walk: top → bottom (the surprising element) → centre marker; **hand-back complete at 1200** (pin 2400, margin 1200) | `phases[]` | none |
| 1200–4000 ms | No translation — spin continues in place, no bound to reach | kinematics | none |

**Narration (27 words; budget 25–35):**

| # | `text_en` | glow |
|---|---|---|
| 1 | "This wheel spins on the spot." | `wheel_body` |
| 2 | "The top of the rim moves forward." | `top_arrow` |
| 3 | "The bottom of the rim moves backward, equally fast." | `bottom_arrow` |
| 4 | "Only the centre stays still." | `centre_marker` |

### STATE_6 — "Slide plus spin makes rolling" (extended; R = 4800)

| t-window | What animates | Driven by | Controls |
|---|---|---|---|
| 0 ms | Rolling wheel (v = 1.0, ω = 4.0, v = Rω ✓); top (1.84), centre (0.92), contact zero marker static from entry | v₀, ω₀ | none |
| 300–600 / 600–1000 / 1000–1400 ms | Glow walk: top → centre → contact | `phases[]` | none |
| **1800 ms (bought)** | Formula line 1 `v + Rω = 2v` | `formula_overlay[0].at_ms` | none |
| **2400 ms (bought; hand-back complete, pin 2880, margin 480)** | Formula line 2 `v − Rω = 0`; all three at equal brightness | `formula_overlay[1].at_ms` | none |
| 2400–4800 ms | Wheel continues to run end s = −2.4 | kinematics | none |

**Narration (47 words; budget 40–55):**

| # | `text_en` | glow |
|---|---|---|
| 1 | "This wheel is truly rolling: sliding and spinning add together." | `wheel_body` |
| 2 | "At the top, the two add: speed v plus R omega makes two v." | `top_arrow` |
| 3 | "At the centre, only sliding remains: speed v alone." | `centre_arrow` |
| 4 | "At the contact point, the two cancel: speed v minus R omega equals zero." | `contact_marker` |

### STATE_7 — "Sliding becomes rolling" (advanced; R = 3400)

| t-window | What animates | Driven by | Controls |
|---|---|---|---|
| 0 ms | Wheel launched at v₀ (slider), **ω₀ = 0**; contact slides, trail draws, spokes lag | v₀ live, μ_k = 0.05 fixed | v₀ |
| 0–1361 ms | Kinetic friction decelerates v AND spins ω up simultaneously; `v` and `Rω` converge, `contact` counts down | closed-form v(t)/ω(t) | v₀ |
| 800–1361 ms | Glow window over the contact readout, **ending AT capture** | `phases[]` | v₀ |
| **1361 ms (physics event — closed-form capture)** | v and Rω meet exactly; capture at s = **+0.1324**; v_roll = **1.333 m/s**; trail stops | t_c = v₀k/(μ_k g(1+k)) | v₀ |
| 1361–2040 ms (pin 2040, margin 679) | Post-capture rolling persists at v_roll; `contact 0.00`, `f 0.00` (A1 priority); every named readout full-bright | rolling branch | v₀ |
| any time | A trusted v₀ drag SEIZES the loop — wheel rolls to the track end under the geometric bound, honest (no energy layer authored) | v₀ drag | v₀ |

**Control:** v₀ — **1.0–2.5** m/s, default 2.0, step 0.1. *(Deliberately narrower than S8's 0.5–2.5 on the same physical control — legal per Rule 31, flagged so json_author does not normalise the two.)*

**Narration (48 words; budget 35–50). Sentence 2 is the `tau_eq_i_alpha` patch:**

| # | `text_en` | glow |
|---|---|---|
| 1 | "This wheel starts moving but not spinning; it slides at first." | `skid_trail` |
| 2 | "Friction's turning effect on the rim speeds the spin up — a torque doing to turn rate omega what a force does to speed v." | `Rw_readout` |
| 3 | "Speed v and R omega converge, and the moment they meet, it rolls." | `contact_readout` |

*Modelling declaration (documentation only, never spoken, never rendered): the wheel is a uniform disc, k = 0.5. At k = 1 this same v₀/μ_k pair would give t_c = 2041 ms = exactly **60.0% of R** — landing ON the frozen pin. The modelling choice is load-bearing, not decorative.*

### STATE_8 — "Roll it yourself" (explore; open; Rule 37 continuous)

| Behaviour | What animates | Driven by | Controls |
|---|---|---|---|
| continuous | Wheel rolls/slides per live (v₀, R, ω₀, μ_k); `v`, `Rω` readouts live | all four sliders | all |
| continuous | **Contact = dot + its LIVE value at ALL times** (marker semantics, never the arrow channel) — honestly renders the sub-floor band (0, 0.4076) m/s an ω₀ mismatch creates | live (v, ω) | — |
| continuous | Rim trace on; turns counter + revolution marks ON (core furniture — the R dial stays visibly consequential under the reduced preset) | turn-count trigger, R live | R |
| on wrap | v AND ω re-seed to the authored seeds (0.9, 3.6); trail/trace break | engine wrap, (c)-7 | — |
| any time | A trusted drag on any control SEIZES the loop; the sandbox never auto-freezes (Rule 37 — only the teacher's Pause halts it) | teacher drag | all |

**Controls (`min_ring`-gated, reproduced from the skeleton, not altered):**

| Control | `min_ring` | Range | Default | Step |
|---|---|---|---|---|
| v₀ | core | 0.5–2.5 m/s | 0.9 | 0.1 |
| R | core | 0.15–0.35 m | 0.25 | 0.01 |
| ω₀ | **advanced** | 0–12 rad/s | v₀/R = 3.6 (dynamic) | 0.5 |
| μ_k | **advanced** | 0.02–0.30 | 0.05 | 0.01 |

**Narration:** 0 / open — no `tts_sentences`.

---

## D. Board-mode mark scheme — DEFERRED

Rule 20 [D], conceptual-only directive active. No `mode_overrides.board` authored.

---

## E. Drill-down cluster phrasings (6 clusters × 5)

**`why_the_contact_point_is_at_rest` (S2):** "why is the bottom of the wheel not moving" · "how can part of a moving wheel have zero speed" · "doesnt the bottom touch the road and slide forward" · "why does the contact point read 0 if the wheel is rolling" · "isnt every point on a rolling wheel moving at the same speed"

**`cycloid_path_of_a_rim_point` (S2):** "why does the dot on the wheel stop and start" · "what is that curvy loop shape the rim point draws" · "why does the marked point pause at the ground each time" · "why isnt the rim point moving in a simple circle" · "what is a cycloid and why does it look like that"

**`backward_turn_speed_cancels_forward_speed` (S2):** "how do the two speeds cancel out to zero" · "why does turning backward cancel the forward motion" · "where does the backward speed even come from" · "why doesnt the spin speed just add to the roll speed" · "how can spinning backward and moving forward add up to nothing"

**`time_for_sliding_to_become_rolling` (S7):** "how long does it take to start rolling" · "why does it take some time before it stops sliding" · "what decides how fast it starts rolling" · "does a heavier wheel take longer to start rolling" · "why doesnt it start rolling immediately"

**`friction_direction_during_slipping` (S7):** "why does friction speed up the spin instead of slowing it" · "which way does friction act while the wheel is sliding" · "if friction slows things down why is the wheel speeding up its spin" · "does friction push the wheel forward or backward here" · "why is friction backward on the surface but forward on the spin"

**`final_speed_after_rolling_begins` (S7):** "why is the final rolling speed less than the starting speed" · "where did the extra speed go once it starts rolling" · "why does the wheel slow down even without brakes" · "what speed does it end up rolling at" · "does it ever go back to the original speed"

---

## F. Constraint callouts

1. **No `radians()` calls anywhere in this concept** — θ = 0 is a fixed constant, not a formula argument, in all eight states. Unusual for an NLB concept; json_author should treat any stray incline-math string as a **defect** (likely cross-contamination from the sibling build), not expected content.
2. **The `readouts` closed enum needs THREE new tokens** (`field_3d_renderer.ts:1336`, current union `'N'|'f'|'a'|'v'|'T'|'F_net'|'F_applied'|'T1'|'T2'|'P'|'P_avg'`): add `'contact'`, `'Rω'` and bare `'ω'`. This is a **declaration + reader + validator co-edit** — the type union widens; the readout path needs cases computing `abs(v − R*omega)` for `contact`, `R*omega` for `Rω`, and the body's own angular velocity for bare `ω`; and the Zod/validator layer needs the matching widen or `readouts: ['contact','Rω','ω']` fails validation even after the renderer supports it.
3. **DISPATCH-LIST GAP RISK on item 2.** The union's `(c)-4` currently scopes only the **bare-ω** token ("Bare-ω readout token … enum-diff honesty on `:1336`. Consumer: S1 (and S8)"). It does **not** explicitly mint coverage for `'contact'` or `'Rω'`. The founder-proxy REV-3 review already caught one instance of exactly this pattern (**B-3** — a build item the state table consumes but the dispatch mapping carries no number for). Recommend the 0c-2 dispatch either **widen `(c)-4`/its E-number to cover all three tokens, or mint a companion E-number — BEFORE field3d-surgeon is dispatched, not after.**
4. **`controls_visible` token `R`** is currently missing from the live enum at `:1340` (verified by direct read) and is already correctly tracked as `(b)-8` in the union (sibling-minted, consumers S1/S8) — cited only so json_author does not mistake the codebase's absence of `'R'` for a design gap.
5. **The velocity-arrow channel is independent of the force channel** (`velocity_scale = 0.92` wu·s/m, `velocity_min_len = 0.25` wu — reproduced unchanged). Every arrow value above is a **PREDICTION** of what `nlbDriveArrowsForBody` will report live off the body each frame, never an instruction to it. Any exact zero renders as a labelled marker (dot + `0.00 m/s`), never a stub or floored arrow; S8's contact is a dot + live value at all times, specifically so the sub-floor band an ω₀ mismatch creates is still honestly rendered.
6. **Slider steps** (R 0.01 m, v₀ 0.1 m/s, ω₀ 0.5 rad/s, μ_k 0.01) are chosen for smooth live re-lift/re-scale/respace on R and readable increments elsewhere; none are load-bearing to any closed-form derivation (those are continuous functions of the underlying float, not of the step).

---

**DC Pandey check:** no formula, teaching sequence or example imported. v = Rω is derived from the kinematic no-slip constraint directly; a = μ_k g and t_c = v₀k/(μ_k g(1+k)) from Newton's second law + the torque–angular-acceleration relation for a disc (τ = Iα ⇒ α = μ_k m g R/(k m R²) = μ_k g/(kR)); the S4/S5/S6 slide-plus-spin decomposition re-derived from first principles as the skeleton states.

**Word budgets:** S1 54 (45–55) · S2 44 (35–50) · S3 55 (40–55, at ceiling) · S4 29 (25–35) · S5 27 (25–35) · S6 47 (40–55) · S7 48 (35–50) · S8 0/open. All inside range.

*Phase 0b for `pure_rolling` is COMPLETE (skeleton REV 3 `DESIGN_OK` + this block).*
