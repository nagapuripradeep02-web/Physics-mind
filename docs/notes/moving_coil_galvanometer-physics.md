# PHYSICS BLOCK — `moving_coil_galvanometer`

> Stage 2 (physics_author), appended to `moving_coil_galvanometer-architect.md`. Conceptual-only (Rule 20 → Section 4 board mark scheme SKIPPED). All numerics hand-verified in Node. Hand off to json_author.
> Archetype-C device sim (reuses the `torque_on_current_loop_in_field` couple machinery + four NEW device choreographies). Current is the measured input, displayed in **µA**; every formula divides I by `1e6` to get amps before it computes — the inverse of the circular-loop µT-display discipline.

---

## Section 1 — `physics_engine_config`

```json
"physics_engine_config": {
  "variables": {
    "N": { "name": "Number of turns in the coil",        "unit": "",         "min": 20,    "max": 300,   "default": 100,   "step": 10 },
    "I": { "name": "Current through the coil",            "unit": "uA",       "min": 0,     "max": 100,   "default": 50,    "step": 5 },
    "B": { "name": "Radial magnetic field in the gap",    "unit": "T",        "min": 0.05,  "max": 0.5,   "default": 0.2,   "step": 0.05 },
    "A": { "name": "Area of the coil face (A = L*b)",     "unit": "m^2",      "min": 1e-4,  "max": 4e-4,  "default": 2e-4,  "step": 5e-5 },
    "k": { "name": "Hairspring torsion constant",         "unit": "N*m/rad",  "min": 1e-7,  "max": 1e-6,  "default": 4e-7,  "step": 1e-7 }
  },
  "computed_outputs": {
    "tau_deflect":            { "formula": "N * (I / 1e6) * A * B" },
    "phi_rad":                { "formula": "N * (I / 1e6) * A * B / k" },
    "phi_deg":                { "formula": "(N * (I / 1e6) * A * B / k) * 180 / PI" },
    "current_sensitivity":    { "formula": "N * A * B / k" },
    "current_sensitivity_disp": { "formula": "(N * A * B / k) * 180 / PI / 1e6" },
    "tau_spring_eq":          { "formula": "N * (I / 1e6) * A * B" },
    "tau_uniform_field":      { "formula": "N * (I / 1e6) * A * B * sin(theta_mb * PI / 180)" }
  },
  "formulas": {
    "force_per_side":      "F = N B I L  — BIL force on each vertical side, N turns.",
    "net_force":           "Sum(F) = 0  — equal-opposite forces on different lines form a couple (no slide).",
    "tau_deflect_radial":  "tau = N I A B  — radial field: coil plane always parallel to B, so sin(theta) == 1 at every deflection (NO angle factor).",
    "tau_uniform_field":   "tau = N I A B sin(theta)  — uniform field only; theta = angle(mu, B) = 90 deg - phi, so tau = N I A B cos(phi) and the scale is crowded.",
    "tau_spring":          "tau = k phi  — hairspring restoring torque, proportional to deflection phi.",
    "equilibrium":         "N I A B = k phi  ->  phi = (N A B / k) * I  — deflection is exactly linear in current.",
    "current_sensitivity": "S_I = phi / I = N A B / k  — a fixed device constant (rad/A); raise N, A, B or lower k."
  },
  "constraints": [
    "Sum(F) = 0 on the coil at all times: the two side-forces are equal, opposite, and on different lines - a pure couple, so the coil turns, never slides.",
    "On the RADIAL path tau = N I A B carries NO sin(theta) factor: the coil plane is always parallel to B, so the sides stay perpendicular to B (theta = 90 deg) at every deflection.",
    "In a UNIFORM field tau = N I A B sin(theta) with theta = 90 deg - phi, so tau falls as cos(phi) and equal current steps give unequal swings (non-uniform scale).",
    "At equilibrium N I A B = k phi, so phi = (N A B / k) * I - deflection is exactly proportional to current (uniform scale).",
    "Current sensitivity phi/I = N A B / k depends only on the device (N, A, B, k) - never on the current being measured.",
    "B is the radial gap field (revealed S4+); area A = L*b is exposed as one knob; current I is the measured input in the microamp range."
  ]
}
```

**Encoding notes (json_author MUST honour):**
- **I is in µA.** Every formula that uses I divides by `1e6` first: `(I / 1e6)` → amps. The slider DISPLAYS µA. A missed divide makes phi_deg read ~2.9×10⁷° instead of 28.65°.
- **No `radians()` on the radial deflecting torque.** `tau_deflect = N*(I/1e6)*A*B` has no angle term (sin theta ≡ 1 on the radial path). The ONLY trig is the S3 uniform-field contrast `tau_uniform_field`, which uses `sin(theta_mb * PI / 180)` (the proven `* PI / 180` form from `torque_on_current_loop_in_field.json`, not the `radians()` alias).
- `theta_mb` = angle between the coil's moment μ and B = `90 - phi_disp` (deg). It is a choreography quantity for the S3 scripted demo only — NOT a slider. See Section 6 callout 9.
- Pointer angle = `phi_deg` (degrees); conversion `phi_deg = phi_rad * 180 / PI`.
- No `Math.pow` / `**` — only `+ - * /`, `sin`, `cos`, `sqrt`, `PI` (whitelist-safe, matches the shipped field_3d formula vocabulary).

### Verified numerics (Node-checked — json_author sanity-check the live readout)
Constants: **N=100, A=2×10⁻⁴ m², B=0.2 T, k=4×10⁻⁷ N·m/rad** (architect's suggested set — verified clean, kept unchanged). `S_I = NAB/k = 10000 rad/A` exactly.

| Case | Inputs | tau_deflect (N·m) | phi_rad | **phi_deg** |
|---|---|---|---|---|
| **Sim default** | I=50 µA | 2.000×10⁻⁷ | 0.5000 | **28.65°** ← verify on screen |
| **Full-scale** | I=100 µA | 4.000×10⁻⁷ | 1.0000 | **57.30°** |
| Quarter | I=25 µA | 1.000×10⁻⁷ | 0.2500 | 14.32° |
| Three-quarter | I=75 µA | 3.000×10⁻⁷ | 0.7500 | 42.97° |

- **(a) Default phi_deg = 28.65°** — lands in the 20–40° readable target ✓.
- **(b) Full-scale phi_deg = 57.30°** — lands in the 50–60° target; the pointer sweeps visibly and never wraps past 90° ✓.
- **(c) Linearity check:** phi(50 µA)/phi(25 µA) = 28.65 / 14.32 = **2.000000** — exactly 2× current → exactly 2× deflection ✓ (radial path: phi = (NAB/k)·I is strictly linear).
- **(d) Current sensitivity:** S_I = NAB/k = 100·2×10⁻⁴·0.2 / 4×10⁻⁷ = **10000 rad/A = 0.5730 deg/µA**.

**STATE_7 — radial (UNIFORM) scale tick positions** (equal 20 µA current marks → equal-angle ticks), drives `mcg_scale_uniform` + the S7 `current_step` demo:

| I (µA) | 20 | 40 | 60 | 80 | 100 |
|---|---|---|---|---|---|
| phi_deg (radial) | 11.46 | 22.92 | 34.38 | 45.84 | 57.30 |
| step | +11.46 | +11.46 | +11.46 | +11.46 | +11.46 |

→ **equal increments** = an evenly-spaced uniform scale ✓.

**STATE_3 — uniform-field (CROWDED) scale tick positions** (open issue #3 resolved). The honest non-linear law: equilibrium `N I A B cos(phi) = k phi`, i.e. `phi = (NAB/k)·I·cos(phi)`, solved numerically (fixed-point, 300 iters). Same device constants, uniform field instead of radial. Drives `mcg_scale_crowded` tick placement + the S3 `current_step` demo:

| I (µA) | 20 | 40 | 60 | 80 | 100 |
|---|---|---|---|---|---|
| phi_deg (uniform) | 11.24 | 21.35 | 29.82 | 36.73 | 42.35 |
| step | +11.24 | +10.11 | +8.48 | +6.91 | +5.61 |

→ **shrinking increments**: equal current jumps give smaller and smaller swings, so successive marks **bunch (crowd) at large deflection** ✓. Place S3 ticks at these exact angles — do NOT space them linearly. (Reference: at the default 50 µA the uniform field would read **25.79°** vs the radial **28.65°**.)

**STATE_8 — sensitivity sweep** (I=50 µA fixed, vary N — stays on-scale, no wrap):

| N | 100 | 200 | 300 |
|---|---|---|---|
| S_I (rad/A) | 10000 | 20000 | 30000 |
| phi_deg | 28.65 | 57.30 | 85.94 |

→ same current, bigger swing — and all three < 90° ✓.

**Sandbox bound:** with everything maxed (N=300, A=4×10⁻⁴, B=0.5, k=1×10⁻⁷, I=100 µA) → phi ≈ **3438°**. The pointer MUST be clamped (Section 6 callout 8) — a real meter pegs at full scale.

---

## Section 2 — Per-state `variable_overrides` (complete maps; defensive against the partial-merge scar)

> Bug #1 `default_variables_only_first_var_merged`: every state ships a **COMPLETE 5-variable map**, never a partial one. The physics variables are the SAME default set in every state — the per-state DIFFERENCES (deflection angle, radial vs flat field, which scale, the stepping) are **choreography / reveal-pose** properties, not variable values. The extra columns below document the intended pose so json_author wires the choreography, not the physics, to produce them.

| State | `variable_overrides` (complete) | `radial` flag | displayed phi (pose) | scale shown | field geometry |
|---|---|---|---|---|---|
| STATE_1 | `{ "N":100, "I":50, "B":0.2, "A":2e-4, "k":4e-7 }` | **false** | **0°** (rest/hook pose) | none | straight |
| STATE_2 | `{ "N":100, "I":50, "B":0.2, "A":2e-4, "k":4e-7 }` | **false** | small turn ~10° (couple *seen*) | none | straight |
| STATE_3 | `{ "N":100, "I":50, "B":0.2, "A":2e-4, "k":4e-7 }` | **false** | steps 11.24°→42.35° (crowded), hold 42.35° | crowded | straight / uniform |
| STATE_4 | `{ "N":100, "I":50, "B":0.2, "A":2e-4, "k":4e-7 }` | **true** (morph in-state) | sweeps ~10°→55°, hold ~50° (demo angles) | none | morph straight→radial |
| STATE_5 | `{ "N":100, "I":50, "B":0.2, "A":2e-4, "k":4e-7 }` | **true** | mid-deflection ~28.65° | none | radial |
| STATE_6 | `{ "N":100, "I":50, "B":0.2, "A":2e-4, "k":4e-7 }` | **true** | **settle to 28.65°** (= phi_deg default) | single index mark only | radial |
| STATE_7 | `{ "N":100, "I":50, "B":0.2, "A":2e-4, "k":4e-7 }` | **true** | steps 11.46°→57.30° (uniform), hold 57.30° | uniform (+ crowded recall) | radial |
| STATE_8 | `{ "N":100, "I":50, "B":0.2, "A":2e-4, "k":4e-7 }` | **true** | sweep 28.65°→85.94° (vary N 100→300) | uniform | radial |
| STATE_9 | `{ "N":100, "I":50, "B":0.2, "A":2e-4, "k":4e-7 }` — sliders live | **true** | live = phi_deg (default 28.65°) | uniform | radial |

**Per-state justifications (one-liner each):**
- **S1** — staged rest pose: phi=0 is the reference zero (circuit-at-rest), NOT an equilibrium of I=50. The dots march (speed ∝ I=50) to establish "current is present"; the deflection mechanism is built up from S2. *FLAG: this is intentional staging, not a physics error — see FLAGs §1.*
- **S2** — a small turn (~10°) so the couple→rotation is visible; the field is still flat (radial gated to S4), forces full length (no sin-theta droop yet at a small angle).
- **S3** — the UNIFORM-field hypothetical; `radial:false`. The `current_step` demo walks I = 20→100 µA and the pointer lands on the crowded tick angles (forces + `mcg_tau_deflect` shrink with cos-phi). Hold at the top tick (42.35°) to show maximum crowding.
- **S4** — PRIMARY AHA; `radial:true` becomes the new truth via the in-state `radial_morph`. The sweep angles (~10→55°) are demonstration angles (NOT equilibria) chosen to show the forces holding **full length** across the whole range.
- **S5** — coil pinned mid-deflection (~28.65°) in the radial field while `mcg_spring` winds and `mcg_tau_spring` grows ∝ phi.
- **S6** — `settle_phi` lands EXACTLY on `phi_deg(I=50) = 28.65°` (Section 6 callout 4). Pointer shows a single index mark only; the full calibrated uniform scale is gated to S7 (don't pre-spoil). *FLAG §2.*
- **S7** — SUPPORTING AHA; uniform scale revealed. `current_step` walks I = 20→100 µA and the pointer steps the EQUAL 11.46° increments, juxtaposed with the recalled S3 crowded scale.
- **S8** — sensitivity sweep is **choreography from the default starting state** (N override stays 100; the animation drives N→200→300). All poses ≤ 85.94° < 90° — on-scale.
- **S9** — sandbox; sliders live (I, N, B, A, k); idle auto-sweep on **I** (D1p scar). Render full immediately, track sliders live (time-gated-visual scar). Clamp pointer at full scale (callout 8).

---

## Section 3 — Within-state reveal timeline (json_author MUST carry every `pause_after_ms`)

TTS v3-compliant: standalone symbols spelled out (phi → "phi", tau → "torque" / "tau", theta → "theta", N·I·A·B → "N I A B", k-phi → "k phi", NAB/k → "N A B over k"). `text_en` only (json_author fans out hi/te). `reveal_primitive_id` = full `mcg_*` ids (substring-safe). Every prediction pause carried verbatim from architect §3: **S2 3000, S3 3500, S4 3500, S5 3000, S6 3000, S7 3000, S8 3000.** Sentences ≤30 words.

### STATE_1 — Hook + setup (`auto_after_tts`, no prediction)
| id | text_en | reveal_primitive_id | reveal_action | pause_after_ms |
|---|---|---|---|---|
| s1_1 | "Here is a galvanometer. An N-turn coil hangs on a soft-iron core between two magnet poles." | mcg_coil, mcg_core, mcg_pole_n, mcg_pole_s | show | 1500 |
| s1_2 | "Current I flows through the coil — watch it march up one side and down the other." | mcg_current_dot | flow | 1200 |
| s1_3 | "The pointer rests at zero. How does this turn into a current meter?" | mcg_pointer | focal_highlight | 1500 |

### STATE_2 — the couple: F = NBIL, tau = NIAB, Sum(F) = 0 (`manual_click`)
| id | text_en | reveal_primitive_id | reveal_action | pause_after_ms |
|---|---|---|---|---|
| s2_1 | "The field B crosses the gap. Each vertical side of the coil carries current I straight through that field." | mcg_field_arrow | show | 1500 |
| s2_2 | "Which way is each side pushed — and does the coil slide across the gap, or turn in place?" | — (prediction) | — | **3000** |
| s2_3 | "Right-hand rule: the left side is forced into the page, the right side out of the page." | mcg_rhr_guide, mcg_force_left, mcg_force_right | reveal_triad + grow | 1500 |
| s2_4 | "Equal and opposite forces on different lines cannot slide the coil — net force is zero — but they twist it." | mcg_sigma_f_zero | write_badge + small_turn | 1500 |
| s2_5 | "The force per side is F equals N B I L, and together they give the deflecting torque tau equals N I A B." | mcg_tau_deflect | grow_axial + slide_in | 1500 |

### STATE_3 — the sin-theta trap + crowded scale: tau = NIAB sin-theta (`wait_for_answer`)
| id | text_en | reveal_primitive_id | reveal_action | pause_after_ms |
|---|---|---|---|---|
| s3_1 | "Suppose for now the field were uniform — straight lines between two flat poles." | mcg_field_arrow | show (straight) | 1500 |
| s3_2 | "Step the current up in equal jumps. Will the pointer move in equal steps, or not?" | — (prediction) | — | **3500** |
| s3_3 | "As the coil turns, its sides tilt away from square-to-B, so each force shrinks and the torque falls with sine theta." | mcg_force_left, mcg_force_right, mcg_tau_deflect | shrink | 1800 |
| s3_4 | "Equal current jumps now give smaller and smaller swings — the marks bunch up into a crowded scale." | mcg_scale_crowded | reveal + current_step | 2000 |
| s3_5 | "In a uniform field the torque is tau equals N I A B sine theta, so the scale is non-uniform and hard to read." | mcg_tau_deflect | slide_in | 1500 |

### STATE_4 — PRIMARY AHA, the radial field: tau = NIAB at every angle (`wait_for_answer`)
| id | text_en | reveal_primitive_id | reveal_action | pause_after_ms |
|---|---|---|---|---|
| s4_1 | "Now curve the pole faces and slip a soft-iron cylinder inside the coil." | mcg_core | focal_highlight | 1500 |
| s4_2 | "What happens to the field lines in the gap — and to the angle the coil's sides make with the field?" | — (prediction) | — | **3500** |
| s4_3 | "The field bends radial — every line points along the core's radius. The pole faces curve concave; the core brightens." | mcg_field_arrow, mcg_pole_n, mcg_pole_s, mcg_core | radial_morph | 2000 |
| s4_4 | "Now turn the coil through any angle: its sides stay square to B, so both forces hold full length." | mcg_force_left, mcg_force_right | hold_full | 2000 |
| s4_5 | "The torque stays tau equals N I A B at every deflection — no sine theta, no fading." | mcg_tau_deflect | hold_constant + slide_in | 1500 |

### STATE_5 — the restoring spring: tau = k-phi (`manual_click`)
| id | text_en | reveal_primitive_id | reveal_action | pause_after_ms |
|---|---|---|---|---|
| s5_1 | "A fine hairspring is fixed to the coil's shaft." | mcg_spring | fade_in | 1500 |
| s5_2 | "As the coil turns, what does the spring do to the motion?" | — (prediction) | — | **3000** |
| s5_3 | "The spring winds up as the coil turns, pushing back with a restoring torque that grows opposite the deflecting torque." | mcg_tau_spring | grow_opposite | 1800 |
| s5_4 | "The further it winds, the harder it pushes: the restoring torque is tau equals k phi, proportional to the deflection phi." | mcg_tau_spring | slide_in | 1500 |

### STATE_6 — equilibrium: NIAB = k-phi (`wait_for_answer`)
| id | text_en | reveal_primitive_id | reveal_action | pause_after_ms |
|---|---|---|---|---|
| s6_1 | "Two torques now act together: the deflecting torque N I A B and the restoring torque k phi." | mcg_tau_deflect, mcg_tau_spring | show_both | 1500 |
| s6_2 | "One grows with current, the other grows with deflection. Where does the coil come to rest?" | — (prediction) | — | **3000** |
| s6_3 | "The coil settles where the two torques are equal in length — the pointer lands on a fixed reading." | mcg_pointer | settle_phi | 2000 |
| s6_4 | "At rest, N I A B equals k phi, so phi equals N A B over k, times I." | mcg_tau_spring | slide_in | 1500 |

### STATE_7 — SUPPORTING AHA, uniform scale: phi = (NAB/k)·I (`manual_click`)
| id | text_en | reveal_primitive_id | reveal_action | pause_after_ms |
|---|---|---|---|---|
| s7_1 | "Here is the real galvanometer scale, with the old crowded scale recalled small beside it." | mcg_scale_uniform, mcg_scale_crowded | show | 1500 |
| s7_2 | "Step the current up in equal jumps again, now in the radial field — equal steps, or crowded like before?" | — (prediction) | — | **3000** |
| s7_3 | "Each equal jump in current moves the pointer the same amount — the marks are evenly spaced." | mcg_pointer, mcg_scale_uniform | current_step | 2000 |
| s7_4 | "Because the torque was constant, phi equals N A B over k times I — exactly proportional, so the scale is uniform." | mcg_scale_uniform | slide_in | 1500 |

### STATE_8 — current sensitivity: phi/I = NAB/k (`manual_click`)
| id | text_en | reveal_primitive_id | reveal_action | pause_after_ms |
|---|---|---|---|---|
| s8_1 | "Sensitivity is the swing you get per unit current — the deflection phi divided by the current I." | mcg_pointer | focal_highlight | 1500 |
| s8_2 | "To make the meter detect an even tinier current, what would you change about it?" | — (prediction) | — | **3000** |
| s8_3 | "Add more turns N, widen the area A, strengthen the field B, or soften the spring k — the same current swings further." | mcg_pointer | sensitivity_sweep | 2000 |
| s8_4 | "Current sensitivity is phi over I equals N A B over k — a fixed device constant, never depending on the current measured." | mcg_scale_uniform | slide_in | 1500 |

### STATE_9 — Explore (`interaction_complete`, no prediction)
| id | text_en | reveal_primitive_id | reveal_action | pause_after_ms |
|---|---|---|---|---|
| s9_1 | "Your turn. Drag current I, turns N, field B, area A, and spring constant k." | mcg_pointer | show | 1500 |
| s9_2 | "Watch the deflection phi and the current sensitivity update live on the uniform scale." | mcg_scale_uniform | pulse | 1500 |
| s9_3 | "More turns, bigger area, stronger field, or a softer spring all raise the sensitivity; more current swings the pointer further." | mcg_pointer | focal_highlight | 1500 |

**deriveStateMeta classification (FLAG → renderer-primitives, register in the SAME change):** S1 motion(dots); S2 reveal_hold(forces + tau grow, small turn → end pose); S3 reveal_hold + `current_step` (shrinking steps, hold crowded top); S4 reveal_hold(`radial_morph` + rotation, forces hold full length → end pose); S5 reveal_hold(`spring` winds → end pose); S6 motion(`settle_phi` damped ≥0.1%/frame → settle at phi_eq); S7 reveal_hold + `current_step` (equal steps → end pose); S8 reveal_hold(`sensitivity_sweep` → end pose); S9 interactive + idle I-sweep. Every one-shot (`radial_morph`/`spring`/`settle_phi`/`current_step`/`sensitivity_sweep`) MUST hold its end pose, never fall to opacity/scale 0 (scar `field3d_oneshot_element_vanishes_after_animation`).

**`settle_phi` damping spec (open issue #4 resolved):** an ease-out (critically-damped-look) approach over **~1.8 s**, landing EXACTLY on `phi_deg` (default I=50 µA → 28.65°). One optional tiny overshoot (≤2°) then settle for realism. No ODE — interpolate `phi(t)` from the pre-deflection pose to the computed `phi_deg`; the end value is the formula output, not a hand-picked number.

---

## Section 4 — Board-mode mark scheme

**SKIPPED.** Conceptual-only ship (Rule 20 suspension, founder 2026-06-11). No `mode_overrides`, no derivation_sequence, no mark badges. When board mode resumes (Ch.4 magnetism → phase M7), revisit.

---

## Section 5 — Drill-down trigger phrases (→ `confusion_cluster_registry` seed; 6 clusters × 5 phrases)

Student-voice, plain English, no Hinglish. Architect's cluster_ids (S4 ×3, S7 ×3).

**STATE_4 clusters**

`why_radial_not_uniform`
- "why do they curve the magnet faces"
- "why not just use a normal straight field"
- "what is the point of making the field radial"
- "why radial field and not uniform field"
- "how does curving the poles change the field"

`what_does_the_soft_iron_do`
- "why is there an iron piece inside the coil"
- "what does the soft iron core actually do"
- "does the iron core make the field stronger"
- "why soft iron and not just air inside"
- "is the iron core needed for the meter to work"

`why_sides_stay_perpendicular`
- "why are the coil sides always perpendicular to the field"
- "how do the sides stay square to the field when the coil turns"
- "why doesnt the angle change as the coil rotates"
- "how is the coil plane always parallel to the field"
- "why does the coil stay lined up with the field"

**STATE_7 clusters**

`why_galvanometer_scale_is_uniform`
- "why is the galvanometer scale equally spaced"
- "why are the marks evenly spaced on the meter"
- "what makes the scale uniform"
- "why is the scale linear here"
- "how come the divisions are all equal"

`where_did_the_sin_theta_go`
- "where did the sin theta go in the radial field"
- "why is there no sin theta now"
- "why did the angle term disappear"
- "earlier the torque had sin theta where is it now"
- "why no sine in the radial case"

`phi_proportional_to_current`
- "why is the deflection proportional to the current"
- "why does phi equal N A B by k times I"
- "is the angle directly proportional to current"
- "why does double current give double deflection"
- "how is the deflection linear in current"

---

## Section 6 — Constraint callouts (json_author MUST encode)

1. **I in µA → divide by `1e6` inside every formula** that uses I: `(I / 1e6)` gives amps. The slider DISPLAYS µA (default 50, full-scale 100). Verify default `phi_deg = 28.65°`, not 2.865×10⁷°.
2. **Pointer angle = `phi_deg` (degrees);** `phi_deg = phi_rad * 180 / PI`. Readout shows phi in deg and S_I in deg/µA (`current_sensitivity_disp = 0.573` at default), with the device-constant form S_I = NAB/k = 10000 rad/A on the panel.
3. **NO `radians()` / no angle factor on the radial deflecting torque.** `tau_deflect = N*(I/1e6)*A*B`. sin theta ≡ 1 because the radial field keeps the sides perpendicular to B. The ONLY trig is the S3 contrast `tau_uniform_field = N*(I/1e6)*A*B*sin(theta_mb*PI/180)`.
4. **`settle_phi` (S6) end-angle MUST EQUAL `phi_deg`** for the active variables (default I=50 µA → 28.65°). The damped settle lands on the formula output, never a hand-typed angle.
5. **Area A is ONE knob.** Narration may say "A = L·b" but there are NO separate L or b sliders. `mcg_field_arrow`/force lengths scale with B and I; area only enters the torque.
6. **S3 crowded-scale ticks = the precomputed transcendental solutions** (Section 1 table: 11.24 / 21.35 / 29.82 / 36.73 / 42.35° for 20/40/60/80/100 µA). Place `mcg_scale_crowded` ticks at these exact angles — do NOT space them linearly.
7. **S7 uniform-scale ticks = equal angles** (11.46° per 20 µA: 11.46 / 22.92 / 34.38 / 45.84 / 57.30°). The S3-crowded vs S7-uniform contrast is the whole payoff — they must visibly differ.
8. **STATE_9 sandbox CLAMP:** the pointer mesh rotation is clamped to about [−2°, +90°]; if computed `phi_deg > 90`, peg the needle at full scale and show "off scale". A real meter pegs — this is honest, and prevents a wrap-around past the scale (extreme combo reaches ~3438°).
9. **theta convention (S3 only):** `theta_mb` = angle between the coil moment μ and B. At rest the coil plane ∥ B so μ ⊥ B → theta = 90° (max torque NIAB). After deflecting by phi, theta = 90° − phi, so `tau_uniform_field = NIAB·sin theta = NIAB·cos phi`. (On the radial path the morph forces theta ≡ 90° at every phi → constant torque.)
10. **No `Math.pow` / `**`** — only `+ - * /`, `sin`, `cos`, `sqrt`, `PI`. **`pvl_colors` MUST include `"background": "#0A0A1A"`** (scar `field3d_scene_background_white_when_pvl_colors_lacks_background`). Use the architect's per-element colours.
11. **Full `mcg_*` ids as `visible_elements` tokens** (scar `field3d_visible_elements_substring_match_greedy`). Substring hazards: never a bare `mcg_scale` (matches `_uniform`+`_crowded`), `mcg_tau` (matches `_deflect`+`_spring`), `mcg_pole` (matches `_n`+`_s`), `mcg_force` (matches `_left`+`_right`), and **never `mcg_co`** (matches `mcg_core` AND `mcg_coil`).

---

## Section 7 — DoD alignment + FLAGs for json_author

### Symbol-label table (confirms architect section 10b; label / host id / unit / expression)
| Quantity | Label | Host id | Unit | Expression / behaviour |
|---|---|---|---|---|
| North pole (concave) | N | `mcg_pole_n` | — | static; reshapes flat to concave at S4 |
| South pole (concave) | S | `mcg_pole_s` | — | static; reshapes flat to concave at S4 |
| Soft-iron core | "soft iron" | `mcg_core` | — | static cylinder; brightens at S4 (no size change, Rule 29) |
| The coil | "N turns" | `mcg_coil` | — | rotates by phi about the suspension axis; `"N = {N} turns"` |
| Current dots | I | `mcg_current_dot` | uA | dot speed proportional to I; `"I = {I} uA"` |
| Hairspring | k | `mcg_spring` | N.m/rad | winds by phi from S5 |
| Pointer | phi | `mcg_pointer` | deg | angle = phi_deg; `"phi = {((N*(I/1e6)*A*B/k)*180/PI).toFixed(1)} deg"` |
| Uniform scale | (even ticks) | `mcg_scale_uniform` | — | linear ticks 11.46 deg per 20 uA; S7+ only |
| Crowded scale | (bunched ticks) | `mcg_scale_crowded` | — | sin-theta-spaced ticks (table); S3 (+ small recall S7) |
| Gap field arrows | B | `mcg_field_arrow` | T | straight (S1-S3) to radial (S4+); length proportional to B; `"B = {B.toFixed(2)} T"` |
| Force on left side | F | `mcg_force_left` | N | length proportional to F = NBIL; into page; S2+ |
| Force on right side | F | `mcg_force_right` | N | length proportional to F = NBIL; out of page; S2+ |
| Deflecting torque | "tau = NIAB" | `mcg_tau_deflect` | N.m | length proportional to NIAB (S3: to NIAB cos phi); suspension axis |
| Restoring torque | "tau = k phi" | `mcg_tau_spring` | N.m | length proportional to k phi; opposite `mcg_tau_deflect`; S5+ |
| Sum(F)=0 badge | "Sum(F) = 0" | `mcg_sigma_f_zero` | — | text sprite; S2 |
| Force RHR triad | I / B / F | `mcg_rhr_guide` | — | world-space I/B/F triad; S2 only |
| Current sensitivity | "S_I = NAB/k" | (readout) | rad/A (disp deg/uA) | `"S_I = {((N*A*B/k)*180/PI/1e6).toFixed(3)} deg/uA"` |

On-canvas equations gated (don't pre-spoil): S2 `F = NBIL`, `tau = NIAB`, `Sum(F) = 0` · S3 `tau = NIAB sin theta` · S4 `tau = NIAB` (beside dimmed S3 form) · S5 `tau = k phi` · S6 `NIAB = k phi` · S7 `phi = (NAB/k) I` · S8 `phi/I = NAB/k`. The uniform scale, the phi = (NAB/k) I formula, and the sensitivity formula stay off-canvas before S7/S7/S8 respectively.

### RHR / force plan (S2 — det = +1 verified)
ONE direction-teaching site. Convention: left-side current up (I = +y-hat), radial field toward the core across the gap (B = +x-hat) gives F = I L x B = (y-hat) x (x-hat) = -z-hat (into the page). Right side current down (I = -y-hat) gives F = (-y-hat) x (x-hat) = +z-hat (out of the page). The two equal-opposite forces on different lines form the couple. Basis [y-hat, x-hat, -z-hat]: (y-hat) x (x-hat) = -z-hat, proper right-handed (det = +1, not mirrored). Reuse the archetype-C `rhr-ibf-triad` (`mcg_rhr_guide`), shown AFTER the s2_2 predict pause, the force arrows fading in as confirmation. Anchor the triad from the camera basis (screen-right approx normalize(viewDir x up)), not hand-tuned world coords.

### Motion mapping (E11)
No kinematic trajectory. The coil deflection is a driven static-equilibrium rotation (not one of the 6 ballistic motions); `settle_phi` is a damped approach to phi_eq, a parametric settle, not a free oscillation. No E11 expansion needed.

### aha_moment physics check
- PRIMARY (S4): architect statement is TRUE (radial field gives mu perpendicular to B at every phi, so sin theta = 1, so tau = NIAB constant). For the JSON `aha_moment.statement` (<=15 words) use the trimmed form: "Radial field keeps the coil square to B, so torque stays NIAB at every angle." (15 words.)
- SUPPORTING (S7): TRUE (constant tau gives equilibrium NIAB = k phi, so phi proportional to I, equal ticks). Trimmed: "Constant torque makes deflection proportional to current, so the scale is uniform." (12 words.)

### misconception_watch one_line_fix checks (all 7 physics-correct)
M1 couple, Sum(F)=0 OK; M2 tau = NIAB sin theta gives crowded (verified shrinking steps) OK; M3 concave poles + core give radial OK; M4 hairspring tau = k phi opposes OK; M5 stops at NIAB = k phi, well short of 90 deg OK; M6 radial gives phi proportional to I, uniform (verified equal steps) OK; M7 phi/I = NAB/k device constant, current-independent OK.

### Assessment (6 Q) — all keyed answers VERIFIED, distractors are real wrong beliefs
| q_id | Correct answer (verified) | teaches_state | one-line distractor misconceptions (wrong options) |
|---|---|---|---|
| Q1 | Sum(F) = 0 but tau = NIAB, a couple (turns, does not slide) | STATE_2 | (a) "the coil slides across the gap" [M1 net-force-pushes-sideways]; (b) "net force is zero so nothing happens at all" [conflates Sum(F)=0 with Sum(tau)=0]; (c) "force and torque are the same thing" [no distinction] |
| Q2 | tau = NIAB sin theta, so equal current steps give unequal swings | STATE_3 | (a) "the scale is uniform because the torque is constant" [ignores sin theta in a uniform field]; (b) "the current is too small to read" [irrelevant]; (c) "the field is too weak" [irrelevant] |
| Q3 | Sides stay perpendicular to B at every angle, so tau = NIAB, independent of deflection | STATE_4 (aha) | (a) "the radial field makes the torque stronger" [constant is not larger]; (b) "the radial field cancels the side forces" [forces persist]; (c) "the radial field aligns mu with B" [mu stays perpendicular to B] |
| Q4 | The coil rests where NIAB = k phi | STATE_6 | (a) "it rests at 90 deg where mu aligns with B" [M5 full-alignment]; (b) "it keeps spinning, never stops" [M4 no restoring torque]; (c) "it rests at 0 deg" [ignores deflecting torque] |
| Q5 | phi = (NAB/k) I, linear, evenly spaced | STATE_7 (aha) | (a) "the scale is crowded like the uniform-field case" [M6]; (b) "phi proportional to I squared" [wrong power law]; (c) "phi proportional to sqrt(I)" [wrong power law] |
| Q6 | phi/I = NAB/k; raise N, A, B or lower k | STATE_8 | (a) "sensitivity depends on the current you measure" [M7]; (b) "raise k to make it more sensitive" [sign error: softer k raises S_I]; (c) "sensitivity depends on the pointer length" [irrelevant geometry] |

`coverage_map.by_state = {STATE_2:[Q1], STATE_3:[Q2], STATE_4:[Q3], STATE_6:[Q4], STATE_7:[Q5], STATE_8:[Q6]}`; `non_assessed_states = [STATE_1, STATE_5, STATE_9]`. At least one question hits each aha state (Q3 to S4, Q5 to S7) OK.

### Modes
Conceptual ONLY. No `mode_overrides`, no `epic_c_branches`, no authored deep-dive child sims. `has_prebuilt_deep_dive: true` on STATE_4 + STATE_7 is a cache hint only (ships zero authored).

### Engine-bug-queue prevention rules satisfied
- `default_variables_only_first_var_merged` -> every state ships a COMPLETE 5-variable override map (Section 2). OK
- `field3d_scene_background_white...` -> `pvl_colors` must include "background":"#0A0A1A" (callout 10). OK
- `field3d_visible_elements_substring_match_greedy` -> full `mcg_*` ids; hazards listed (callout 11). OK
- `field3d_rhr_hand_static_no_curl_choreography` -> S2 RHR performed after the predict pause via rhr-ibf-triad. OK
- `field3d_scenario_missing_devstatemeta_recognition` -> register moving_coil_galvanometer in deriveStateMeta.ts in the SAME change. OK
- `field3d_explorer_state_static_d1p` + `field3d_time_gated_visual_invisible_in_slider_state` -> S9 idle auto-sweep on I; render full immediately, track sliders live. OK
- `field3d_oneshot_element_vanishes_after_animation` -> all five new choreographies hold their end pose. OK

(Headless session: could not query the live engine_bug_queue table; relied on the architect pre-flight consultation + the _seed_engine_bug_queue_field3d.ts source + spec bug #1. If the auditor wants a live re-check, FLAG for Gate 8.)

### FLAGs for json_author
1. STATE_1 staging: phi = 0 with I = 50 (dots marching) is intentional, the rest/reference pose before the deflection mechanism is built up from S2, NOT a claim that I>0 gives phi=0. Do not "fix" it to phi=28.65 deg.
2. STATE_6 scale gating: the pointer settles to phi_eq = 28.65 deg but shows only a single index mark; the full mcg_scale_uniform is gated to S7 (do not pre-spoil the uniform scale).
3. Carry every pause_after_ms verbatim (S2 3000, S3 3500, S4 3500, S5 3000, S6 3000, S7 3000, S8 3000) — the pause_after_ms clone gotcha fails Gate 15b if dropped.
4. Complete variable_overrides maps (all 5 vars) on every state — partial-merge scar.
5. I divide-factor: (I / 1e6) in every I-bearing formula; verify default reads 28.65 deg.
6. Pointer clamp at full scale (~90 deg) in S9 — sandbox extremes reach ~3438 deg.
7. Aha statements: use the trimmed <=15-word forms above for aha_moment.statement (S4 primary).
8. -> renderer-primitives (via auditor FAIL routing only): build moving_coil_galvanometer scenario + the four NEW choreographies (radial_morph, spring, settle_phi, current_step/sensitivity_sweep), register in deriveStateMeta.ts same change; pvl_colors.background = #0A0A1A.

---

### DC Pandey check
No formula, derivation order, example problem, figure, or phrasing imported from DC Pandey / HC Verma / NCERT. The couple (tau = NIAB, Sum(F) = 0), the uniform-field sin-theta law, the radial-field constant-torque argument, the equilibrium NIAB = k phi, and the sensitivity NAB/k are all derived here from F = BIL + the definition of a couple + torsion-spring equilibrium. The crowded-scale tick angles are computed (transcendental fixed-point), not copied. Numbers chosen for on-screen readability, not from any textbook problem.
