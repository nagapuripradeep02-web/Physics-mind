# PHYSICS BLOCK — `rotational_kinematics` (rotmech · Class 11 Ch.7 · concept #4 · Desk D)

> Produced by `alex:physics_author` 2026-08-04, against **skeleton REV 2** (`skeleton.md`) after
> founder-proxy Checkpoint A cycle 2 returned **`DESIGN_OK`** (`founder_proxy_A_cycle2.md`), consuming
> shared engine semantics from `_engine/findings_d.md` (canonical where it and either skeleton
> disagree) and the binding apparatus values in `APPARATUS_CONTRACT.md`. **This concept remains
> BLOCKED on build 0c-3 -- no concept JSON exists and none is authored here.** This document is design
> documentation only: it fixes every number, formula, control and narration string so json_author has
> a zero-ambiguity source the moment K1-K10 land. Two carry-forwards taken verbatim from the sign-off:
> **F-8** (S1's held claim must be worded as the picture, not the transient 6.28 rad number) and
> **F-9a** (the S3->S4 link is the arc's thinnest; accepted as designed, not strengthened).
>
> **Every number below was re-derived independently from I = I_frame + 2*m*r^2 = 3.06 kg*m^2 at the
> fixed home pose (r = 0.80, m = 2.0), never copied forward.** No disagreement with the skeleton's Section 2
> ground truth was found -- see the "Independent re-derivation" note in Section 1. **Rule-25 floor, restated
> because it governs every formula and every internal value below: tau and I never appear in any
> reader-facing string in this concept** (title, delta cue, caption, HUD, narration, formula surface,
> label). Where tau/I appear below they are marked **INTERNAL ONLY** -- implementation numbers
> physics_author computes for json_author's authored engine fields, exactly as `pend_k` is internal to
> the dipole scenarios.

---

## Section 1 -- Variables, formulas, constraints

### Apparatus (fixed for the whole concept -- no radial slide, no mass change)

Per `APPARATUS_CONTRACT.md` Section 1, home pose: `r = 0.80 m`, `m = 2.0 kg` (x2, symmetric), `I_frame =
0.50 kg*m^2`, `rod_half_length = 1.00 m`, `R_drum = 0.55 m`, `rod_height_above_pad = 0.25 m`. Unlike
the sibling concepts on this turntable, **this concept never moves r and never changes m** -- the
motion vocabulary here is purely rotational (theta, omega, alpha), visibly distinct from the radial slides of
`conservation_of_angular_momentum` on the same machine (skeleton Section 2). `I` is therefore a single fixed
number for the entire concept:

```
I = I_frame + 2*m*r^2 = 0.50 + 2(2.0)(0.80^2) = 0.50 + 2.56 = 3.06 kg*m^2   (INTERNAL ONLY -- never printed)
```

### `physics_engine_config.variables`

```json
{
  "variables": {
    "r": {
      "name": "Radius of each sliding mass from the axle -- FIXED for this whole concept, never a slider",
      "unit": "m",
      "constant": 0.80
    },
    "m": {
      "name": "Mass of each of the two symmetric masses -- FIXED for this whole concept, never a slider",
      "unit": "kg",
      "constant": 2.0
    },
    "I_frame": { "name": "Fixed inertia of the turntable + rod, excluding the two masses", "unit": "kg.m^2", "constant": 0.50 },
    "R_drum": { "name": "Radius where the motor wheel / brake pad contacts the turntable's rim", "unit": "m", "constant": 0.55 },
    "rod_half_length": { "name": "Rod half-length -- apparatus geometry only", "unit": "m", "constant": 1.00 },
    "rod_height_above_pad": { "name": "Vertical clearance of the rod plane above the drum pad plane -- apparatus geometry only", "unit": "m", "constant": 0.25 },
    "theta0": {
      "name": "Angular reference offset at state entry -- the drum stripe's starting position relative to the base start line",
      "unit": "rad", "min": 0, "max": 0, "default": 0,
      "note": "This concept authors theta0_rad: 0 at every state entry (rbrThetaReset) -- the stripe always starts ON the start line."
    },
    "omega0": {
      "name": "Seed angular speed -- sets the state's entry omega (guided states) or restarts omega live (S9 sandbox); NOT applied continuously mid-run in a guided state",
      "unit": "rad/s",
      "min": 0.0, "max": 3.0, "default": 1.5, "step": 0.1,
      "note": "SHARED engine slider spec with conservation_of_angular_momentum (same RBR_SLIDER_SPEC.omega0 object) -- min lowered to 0 by the reconciled office ask (Contract-4/P2-7, two sites), max/step unchanged. Explore-state slider only; guided states author omega0 as an entry constant, including the literal 0 seeds of S3/S7/S8 (already honoured today per findings_d, rbrNum typeof/isFinite check)."
    },
    "omega": {
      "name": "Live angular speed -- the DERIVED closed-form quantity, never itself an independent variable or slider",
      "unit": "rad/s", "min": null, "max": null, "default": null,
      "derived": "omega(t) = omega0 + alpha_signed * engaged_seconds(t) while a torque source is engaged; constant (holds) once released"
    },
    "theta": {
      "name": "Live angle turned -- the DERIVED accumulated integral of omega, published as PM_rbrTheta; on-canvas arc draws theta mod 2*PI, the readout shows the full accumulated value",
      "unit": "rad", "min": null, "max": null, "default": null,
      "derived": "theta(t) = theta(t-h) + omega(t)*h on the engine's fixed 16 ms grid (rbrThetaAt) -- accumulator-free, step-count invariant"
    },
    "alpha": {
      "name": "Angular acceleration readout (guided states) / live control (S9 only) -- see the engine metric note below; NEVER computed from tau/I inside this concept's own definitions",
      "unit": "rad/s^2",
      "min": -0.60, "max": 0.60, "default": 0.0, "step": 0.05,
      "note": "S9 EXPLORE ONLY control (K7). In guided states alpha is a pure READOUT, driven by the authored drive/brake schedule below, never an authored slider."
    },
    "v": {
      "name": "Live tangential speed of a marked point at radius r_point -- DERIVED, own arrow-length map (never the force-arrow map)",
      "unit": "m/s", "min": null, "max": null, "default": null,
      "derived": "v = omega * r_point"
    },
    "r_point_inner": { "name": "S6/S9 inner marked point -- a paint mark on the rod", "unit": "m", "constant": 0.40 },
    "r_point_outer": { "name": "S6/S9 outer marked point -- the mass itself", "unit": "m", "constant": 0.80 }
  }
}
```

**INTERNAL ONLY -- never a declared `variables` entry, never reader-facing.** The drive/brake torque
that PRODUCES a given target alpha at the fixed I = 3.06 kg.m^2:

```
tau_internal = I * alpha_target = 3.06 * alpha_target      (N.m -- engine field only, e.g. applied_torque_Nm / tau_brake_Nm)
```

### `physics_engine_config.formulas` (reader-facing algebra; Rule 38c -- core/extended states are
algebra-only, the two calculus forms are confined to S8's advanced ring)

```json
{
  "formulas": {
    "omega_theta_over_t": "omega = theta / t -- steady turning, S2's definition of angular speed.",
    "alpha_delta_omega_over_delta_t": "alpha = (omega_k - omega_k_minus_1) / h -- S3's definition of angular acceleration: how fast omega itself changes. Algebra-only (Delta-notation), never d/dt outside S8.",
    "omega_kinematics": "omega = omega0 + alpha*t -- S4's equation, algebraically identical to v = u + at with new letters. Valid whenever alpha is constant over the interval measured.",
    "theta_kinematics": "theta = omega0*t + 0.5*alpha*t*t -- S7's equation, algebraically identical to x = ut + 0.5*a*t*t. Valid whenever alpha is constant over the interval measured, t measured from the state's own drive-engagement instant.",
    "v_omega_r": "v = omega * r_point -- S6's link law: one shared omega, but each point's linear speed scales with its own distance from the axis.",
    "omega_calculus_S8_ONLY": "omega = d(theta)/dt -- ADVANCED RING ONLY (Rule 38c). Never appears on a core/extended formula surface.",
    "alpha_calculus_S8_ONLY": "alpha = d(omega)/dt -- ADVANCED RING ONLY (Rule 38c). Never appears on a core/extended formula surface."
  }
}
```

### Constraints

- omega = omega0 + alpha*t and theta = omega0*t + 0.5*alpha*t^2 hold exactly whenever alpha is constant
  over the measured interval -- the SAME two equations as straight-line kinematics, new letters only.
- alpha is how fast omega itself changes -- it is zero for a body spinning at a constant rate (S1/S2/S6),
  even though omega itself is nonzero and large.
- alpha is signed: positive alpha speeds the spin up, negative alpha slows it down. A negative alpha is
  still angular acceleration -- never narrated or rendered as "just stopping".
- v = omega*r -- every point of one rigid turntable shares the SAME omega; each point's linear speed scales
  with its OWN radius from the axis. One turning rate, many speeds.
- r = 0.80 m and m = 2.0 kg are fixed constants for this entire concept -- no radial slide, no mass
  change, anywhere (including S9's explore state, which exposes only omega0 and alpha).
- tau and I are never computed, displayed, or narrated inside this concept's own definitions -- alpha is
  read directly off the MOTION (a rate of omega), never derived through tau/I (Rule 25, protected by the
  reconciled engine metric in Section 1's opening note and findings_d Section 1).
- The engine's alpha readout is the per-step finite difference of omega, published from the SAME post-step
  snapshot as every other row, blanked across re-pins -- NOT tau/I (findings_d Section 1, canonical). In every
  steady drive/brake window this is numerically identical to the target alpha used to seed tau_internal
  (the closed form is linear in t); the two metrics diverge ONLY at clamps and edges -- see Section 6.4.

### Ground-truth numeric table (2 dp; independently re-derived, matches skeleton REV 2 exactly)

I = 3.06 kg.m^2 (internal only, constant for the whole concept) -- home omega = 1.50 rad/s --
period T = 2*pi/1.50 = 4.18879... s -> **4.19 s** -- one full turn = 2*pi = 6.28319... rad -> **6.28 rad**.

| Quantity | Value | Internal tau (never printed) |
|---|---|---|
| S3: from rest, alpha = +0.60 rad/s^2 for 4.0 s | omega -> **2.40** rad/s | tau_app = 3.06 x 0.60 = **1.84 N.m** |
| S4: from omega0 = 1.50, alpha = +0.60 for 3.0 s | predicted omega = 1.50 + (0.60 x 3.0) = **3.30** rad/s | tau_app = **1.84 N.m** (same drive) |
| S5: from omega0 = 1.50, alpha = -0.50 | rest at t = 1.50 / 0.50 = **3.00 s** after engagement | tau_brake = 3.06 x 0.50 = **1.53 N.m** |
| S6: v at r = 0.40 / r = 0.80, omega = 1.50 | v = 0.60 m/s / v = 1.20 m/s, ratio **2.00** exactly (= 0.80/0.40) | n/a |
| S7: theta at t = 1, 2, 3 s after engagement, alpha = +0.60 from rest | theta = 0.30, 1.20, 2.70 rad; increments 0.30 : 0.90 : 1.50 = **1 : 3 : 5** | tau_app = **1.84 N.m** |
| S9 explore: alpha range [-0.60, +0.60] | omega can pass through 0 and reverse (declared, never clamped) | tau range **[-1.84, +1.84] N.m** |

**Independent re-derivation note:** every number above was recomputed from first principles (I =
3.06 fixed; omega = omega0 + alpha*t; theta = omega0*t + 0.5*alpha*t^2; v = omega*r) with no reference to the skeleton's own arithmetic.
**No disagreement was found** -- the skeleton's Section 2 ground truth is exact. No numeral triple repeats
across S3/S4/S5 (0->2.40 over 4.0 s; 1.50->3.30 over 3.0 s; 1.50->0 over 3.0 s at alpha -0.50 -- three
distinct triples, matching the skeleton's own cross-tabulation).

**S1 transient (F-8 -- do not treat as a held claim):** S1 is steady-continuous (omega = 1.50 constant,
never stops). At the state's own pin instant (0.60R, R >= 10 s -> pin >= 6.0 s) theta(6.0 s) = 1.50 x 6.0 =
**9.00 rad**, not 6.28 -- the arc (theta mod 2*pi) reads approximately 2.72 rad at that instant. The "6.28 rad = one full
turn" identification is a PATTERN true every 4.19 s, not a number the frozen frame photographs. Sections 3/4
word this as a repeating event ("each full turn adds ..."), never as a static held value.

---

## Section 2 -- Per-state variable notes: entry configs + `variable_overrides`

**General rule (defensive lock, per the `hinge_force.json`/`field_forces.json` pattern -- guards the
recorded `default_variables_only_first_var_merged` failure mode):** every state declares `r: 0.80`
and `m: 2.0` EXPLICITLY even though neither ever changes in this concept -- including S9, whose
explore sliders are omega0 and alpha only (r and m stay locked constants even in the sandbox). On state entry
the engine hard-sets the state's ENTRY CONFIG in a single frame (`theta0_rad: 0` everywhere); omega then
evolves from that seed by the authored drive/brake schedule for the rest of the state.

| State | `variable_overrides` | Justification |
|---|---|---|
| S1 | `{ r: 0.80, m: 2.0, omega0: 1.50, theta0: 0 }` | Concept-opening pose = the global home pose (APPARATUS_CONTRACT Section 1). Steady-continuous, no source. |
| S2 | `{ r: 0.80, m: 2.0, omega0: 1.50, theta0: 0 }` | Same home pose; steady-continuous, no source. |
| S3 | `{ r: 0.80, m: 2.0, omega0: 0, theta0: 0 }` | **From rest** -- authorable today (literal 0 honoured, `rbrNum` typeof/isFinite). Drive engages at 2.0 s. |
| S4 | `{ r: 0.80, m: 2.0, omega0: 1.50, theta0: 0 }` | Re-pose to home; drive engages at 3.5 s, AFTER the prediction chip prints at 2.0 s. |
| S5 | `{ r: 0.80, m: 2.0, omega0: 1.50, theta0: 0 }` | Re-pose to home; brake engages at 2.0 s, releases at 5.0 s (the stop instant). |
| S6 | `{ r: 0.80, m: 2.0, omega0: 1.50, theta0: 0 }` | Home pose; steady-continuous, no source. Two extra point radii declared for the tangent-arrow rig: `r_point_inner: 0.40`, `r_point_outer: 0.80`. |
| S7 | `{ r: 0.80, m: 2.0, omega0: 0, theta0: 0 }` | From rest (same authorable-today seed as S3). Drive engages at 2.0 s; ticks measured FROM that instant (`start_ms: 2000`). |
| S8 | `{ r: 0.80, m: 2.0, omega0: 0, theta0: 0 }` | From rest, replaying the S3/S7 spin-up under the graph panel. Drive engages at 1.5 s. **Conditional on K6 -- see Section 6.8.** |
| S9 | `{ r: 0.80, m: 2.0, omega0: 1.50, theta0: 0 }` + applied source `engage_at_ms: 0`, alpha slider at 0 | Sandbox seed; the drive wheel stays engaged the whole state (idle at alpha = 0, turning when alpha != 0 -- per-state visibility flag ON, P3-6). |

---

## Section 3 -- Within-state motion timeline + per-state control spec (Rule 31)

**Glow-target glossary (physics-verified targets; final primitive IDs are the surgeon's to name):**
`start_line` * `theta_arc` * `drum_marker` (the existing `rbr_drum_marker` stripe, always-on) *
`theta_readout` * `omega_readout` * `alpha_readout` * `formula_surface` * `tick_marks` *
`predicted_omega_chip` * `drive_wheel` * `brake_pad` * `r_line_inner` / `r_line_outer` *
`v_arrow_inner` / `v_arrow_outer` (group token **`rbr_v_arrows`**) * `axle_v_dot` * `graph_panel`
(theta-t / omega-t curves, S8 only) * `sliding_masses` (visible but never moving -- r is fixed).

**Beat-termination contract:** S1, S2, S6 are steady-continuous (omega constant, no source, never undoes
its own claim). S3, S4, S5, S7, S8 are one-shot-hold (drive/brake engages once, releases once, the
actuator finishes withdrawing BEFORE the pin, omega then HOLDS for the remainder of the state). S9
free-runs (Rule 37, never auto-freezes). Every state entry is a single-frame re-pose -- never an
animated slide into position.

### S1 -- "theta: the angle turned" -- core -- no live controls -- duration >= 10 s, pin @ 6.0 s

| t-window | What animates | Driven by |
|---|---|---|
| 0-10000 ms (whole state) | Turntable spins continuously at omega = 1.50 rad/s -- never stops | omega (constant) |
| 0-1200 ms | `start_line` + `drum_marker` glow together (both already visible, stripe on the line at t = 0) | glow-sync only, P1-4a |
| 1200-2400 ms | `theta_arc` glow -- the arc is already growing from t = 0, glow highlights it | glow-sync only |
| 2400-3600 ms | `theta_readout` glow -- already counting from 0.00 | glow-sync only |
| 3600 ms -> end | Sustained glow on `theta_readout` as the readout keeps counting past 4.19 s, 8.38 s, ... | -- |

**No timed reveal is bought here (P1-4 option a) -- every element (line, stripe, arc, readout) is
present and live from t = 0; narration sync is glow/label emphasis only.** Controls: none. Margin:
nothing to complete (continuous state), pin 6.0 s reads the honest transient (theta approximately 9.00 rad, arc approximately
2.72 rad -- F-8, never asserted as the state's held claim). THE EYE reads S1 in DENSE frames, not only
the frozen pin.

### S2 -- "omega: radians per second" -- core -- no live controls -- duration >= 10 s, pin @ 6.0 s

| t-window | What animates | Driven by |
|---|---|---|
| 0-10000 ms (whole state) | Turntable spins continuously at omega = 1.50 rad/s | omega (constant) |
| 1000 ms | Tick 1 lands on the r_ref circle at theta = 1.50 rad | `time_ticks`, `start_ms: 0` |
| 2000 ms | Tick 2 lands at theta = 3.00 rad -- 1.50 rad after tick 1 | same |
| 3000 ms | Tick 3 lands at theta = 4.50 rad -- 1.50 rad after tick 2, equally spaced | same |
| 3000-3800 ms | `omega_readout` builds in: "omega = 1.50 rad/s"; `formula_surface` shows omega = theta/t | authored reveal |
| 3800 ms -> end | Held/sustained -- three ticks stay visible, equally spaced, omega readout steady | -- |

Controls: none. Margin: last reveal completes 3.8 s, pin 6.0 s, margin 2200 ms OK.

### S3 -- "alpha: the rate omega changes" -- core -- no live controls -- duration >= 12 s, pin @ 7.2 s

| t-window | What animates | Driven by |
|---|---|---|
| 1100-2000 ms (cause) | `drive_wheel` translates in, visibly turning, and makes contact at 2000 ms | authored travel (`pad_travel_ms: 900`) |
| 2000-6000 ms (effect, 4.0 s) | From rest, omega climbs 0.00 -> 2.40 steadily; `alpha_readout` sits pinned at 0.60 the whole time | drive engaged, alpha = +0.60 |
| 6000 ms | Drive releases | `release_at_ms: 6000` |
| 6000-6900 ms | `drive_wheel` withdraws, parked | authored travel |
| 6900 ms -> end | HELD at omega = 2.40, alpha = 0.00 (source disengaged) | -- |

Controls: none. Margin: wheel parked 6.9 s, pin 7.2 s, margin 300 ms OK. **Cause visibly precedes
effect by 0.9 s (Rule 32a)**; only omega/alpha move -- apparatus otherwise holds pose (Rule 32b).

### S4 -- "Same equation, new letters" -- core (PRIMARY aha) -- no live controls -- duration >= 13 s, pin @ 7.8 s

| t-window | What animates | Driven by |
|---|---|---|
| 0-2000 ms | `formula_surface` shows omega = omega0 + alpha*t; at 2000 ms `predicted_omega_chip` prints "predicted omega = 3.30" -- BEFORE the wheel moves | authored reveal |
| 2600-3500 ms (cause) | `drive_wheel` translates in, contacts at 3500 ms | authored travel |
| 3500-6500 ms (effect, 3.0 s) | omega sweeps 1.50 -> 3.30 steadily | drive engaged, alpha = +0.60 |
| ~6500 ms | Match cue fires -- `omega_readout` and `predicted_omega_chip` co-glow (latched, first frame within 0.01) | omega meeting the chip |
| 6500-7400 ms | `drive_wheel` withdraws, parked | authored travel |
| 7400 ms -> end | HELD at omega = 3.30, chip + readout glow sustained | -- |

Controls: none. Margin: wheel parked 7.4 s, pin 7.8 s, margin 400 ms OK. The prediction-first ritual
(chip BEFORE motion, then verified) is the state's entire aha; nothing else in the concept repeats it.

### S5 -- "Slowing down: negative alpha" -- core (`misconception_confrontation`) -- no live controls -- duration >= 11 s, pin @ 6.6 s

| t-window | What animates | Driven by |
|---|---|---|
| 1100-2000 ms (cause) | `brake_pad` translates in, contacts the rim at 2000 ms | authored travel |
| 2000-5000 ms (effect, 3.0 s) | omega falls in a straight line 1.50 -> 0.00; `alpha_readout` sits at **-0.50** the whole way | brake engaged, alpha = -0.50 |
| 5000 ms | Table reaches rest (closed-form rest clamp, within one 16 ms step); `alpha_readout` returns to **0.00** the step after | rest clamp on the brake source |
| 5000-5900 ms | `brake_pad` withdraws, parked | `release_at_ms: 5000` |
| 5900 ms -> end | HELD: stopped table, omega = 0.00, alpha = 0.00, pad parked | -- |

Controls: none. Margin: pad parked 5.9 s, pin 6.6 s, margin 700 ms OK. **Held claim = the picture the
pin actually photographs** (stopped, alpha 0.00, pad parked) -- the -0.50 reading lives only in the dense
frames of the fall, so THE EYE must read S5 densely, not only at the frozen pin.

### S6 -- "One omega, many speeds" -- core (`misconception_confrontation`) -- no live controls -- duration >= 12 s, pin @ 7.2 s

| t-window | What animates | Driven by |
|---|---|---|
| 0-12000 ms (whole state) | Turntable spins continuously at omega = 1.50 rad/s | omega (constant) |
| 0-1200 ms | `r_line_inner` (r = 0.40) and `r_line_outer` (r = 0.80) draw at rod height, colour-distinct from the drum-face stripe | authored reveal |
| 1200-2500 ms | `v_arrow_inner` and `v_arrow_outer` reveal (group token `rbr_v_arrows`); `axle_v_dot` labelled v = 0 | authored reveal |
| 2500-6690 ms (one shared revolution, 4.19 s) | Both arrows RIDE their points through one full turn; outer arrow exactly twice inner (v = 1.20 vs 0.60), both points finish together on one straight rod line | omega (shared) |
| 6690 ms -> end | Sustained: both arrows keep riding every subsequent revolution (steady-continuous, never stops) | -- |

Controls: none. Margin: shared turn completes approximately 6.7 s, pin 7.2 s, margin 500 ms OK. Focal = the single
group token `rbr_v_arrows`, lighting BOTH arrows as one (Rule 32e).

### S7 -- "Angle grows as t squared" -- extended -- no live controls -- duration >= 11 s, pin @ 6.6 s

| t-window | What animates | Driven by |
|---|---|---|
| 1100-2000 ms (cause) | `drive_wheel` translates in, contacts at 2000 ms (familiar from S3) | authored travel |
| 2000-5000 ms (effect) | From rest, theta grows as t^2; ticks land at engine t = 3.0, 4.0, 5.0 s -> theta = 0.30, 1.20, 2.70 rad -- widening 1:3:5, contrast with S2's even spacing | drive engaged, alpha = +0.60; `time_ticks` `start_ms: 2000` |
| 5000 ms | Drive releases | `release_at_ms: 5000` |
| 5000-5900 ms | `drive_wheel` withdraws, parked | authored travel |
| 5900 ms -> end | HELD: theta = 2.70 rad, ticks persist widening around the circle | -- |

Controls: none. Margin: wheel parked 5.9 s, pin 6.6 s, margin 700 ms OK.

### S8 -- "Slope of theta is omega" -- advanced -- no live controls -- duration >= 12 s, pin @ 7.2 s -- **CONDITIONAL ON K6 (Section 6.8)**

| t-window | What animates | Driven by |
|---|---|---|
| 0-1500 ms | `graph_panel` shows empty theta-t / omega-t axes | authored reveal |
| 600-1500 ms (cause) | `drive_wheel` translates in, contacts at 1500 ms | authored travel |
| 1500-5500 ms (effect, 4.0 s, replay of S3/S7's spin-up) | A live dot draws theta(t) as a curving-upward parabola; a second dot draws omega(t) as a straight rising line; a tangent-slope indicator rides the theta curve, steepening as omega grows | drive engaged, alpha = +0.60 |
| 5500 ms | Drive releases | `release_at_ms: 5500` |
| 5500-6400 ms | `drive_wheel` withdraws, parked | authored travel |
| 6400 ms -> end | HELD -- curves persist, complete | -- |

Controls: none. Margin: wheel parked 6.4 s, pin 7.2 s, margin 800 ms OK. **If Desk E descopes K6, S8
is DROPPED entirely** -- no fallback readout is authored (the concept ships 8 states; the advanced
ring is then empty).

### S9 -- "Try it yourself" -- explore -- **ALL, ring-gated** -- open/continuous (Rule 37)

| Behavior | What animates | Driven by |
|---|---|---|
| Applied source engaged from t = 0, no release | `drive_wheel` stays in contact the whole state -- turning when alpha != 0, idle at alpha = 0 (per-state visibility flag ON) | engage_at_ms: 0 |
| omega0 change | RESTART: omega re-pins from the new omega0; re-pin cue (blank >= 0.5 s + hold-glow) fires | omega0 (restart-seed) |
| alpha drag (live, trusted-seize) | tau_internal = 3.06*alpha re-anchors omega live via the trusted-drag path; omega, theta readouts recompute every frame; a sustained negative alpha CAN take omega through zero and reverse the spin (declared intended, never clamped -- findings_d Section 1); the theta arc runs backwards, v arrows flip | alpha slider |
| Continuous | `theta_arc`, `theta_readout`, `omega_readout`, `alpha_readout`, `r_line_inner`/`outer`, `v_arrow_inner`/`outer` (ticks OFF) all live; v arrows clamp at the K4 map max with exact labels for long-drive speeds | all of the above |

Controls: **omega0** (core, [0, 3.0] rad/s, step 0.1, default 1.50) * **alpha** (core, [-0.60, +0.60] rad/s^2,
step 0.05, default 0). r and m stay locked constants (0.80, 2.0) even in the sandbox -- never exposed,
since neither is taught here. No narration (0/open, Rule 31).

---

## Section 4 -- Narration (`text_en`) per state

Every guided state 25-55 EN words (Rule 31), symbols expanded to their spoken names on first use per
state (Rule 30) with on-canvas labels staying symbolic, no idioms/personification (Rule 41), the S1
wording carrying the F-8 fix, and the two anchor sentences (Rule 35) carried verbatim from the
skeleton Section 9.

**S1** (49 words):
1. "This turntable spins at a steady rate." (7)
2. "A start line marks where the angle theta is measured from." (11)
3. "A stripe sweeps a growing arc, and the readout counts the angle turned, in radians." (15)
4. "Each full turn adds two pi radians -- about six point two eight -- to the running count." (16)

**S2** (50 words):
1. "The turntable keeps spinning at the same steady rate." (9)
2. "A tick lands on the circle every second -- the marks land equally spaced apart." (14)
3. "Equal spacing means the turntable turns through equal angles in equal times." (12)
4. "This steady rate is the angular speed omega -- one point five oh radians per second." (15)

**S3** (55 words):
1. "A motor wheel moves in and presses onto the turntable's edge." (11)
2. "The turntable starts from rest, and its spin rate omega climbs steadily." (12)
3. "The rate at which omega changes is angular acceleration, alpha -- steady at zero point six zero radians per second squared." (20)
4. "Even when omega is barely moving, alpha already reads its full value." (12)

**S4** (55 words) -- PRIMARY aha, prediction-first ritual + the linear-kinematics bridge:
1. "Omega equals omega naught plus alpha t predicts: one point five oh plus zero point six zero times three is three point three oh." (24)
2. "That number prints before the wheel even moves." (8)
3. "The wheel presses on, and the live rate climbs to meet it -- just like a car speeding up steadily, same equation, new letters." (23)

**S5** (53 words) -- misconception confrontation + the ceiling-fan anchor:
1. "A brake pad presses onto the turntable's edge." (8)
2. "The spin rate omega falls in a straight line to zero, while the angular acceleration alpha holds at minus zero point five zero radians per second squared." (27)
3. "The turntable stops, and alpha returns to zero -- like a ceiling fan after the switch is turned off." (18)

**S6** (54 words) -- misconception confrontation + the bicycle-wheel anchor:
1. "Two marks turn together on the turntable, sharing one turning rate omega." (12)
2. "Yet each point's speed is v equals omega r." (9)
3. "The outer point moves at one point two zero metres per second, twice the inner point's zero point six zero." (20)
4. "On a bicycle wheel, the rim moves faster than points near the hub." (13)

**S7** (55 words):
1. "The turntable spins up from rest under the same steady alpha." (11)
2. "This time, the angle theta grows as t squared: theta equals omega naught t plus one half alpha t squared." (20)
3. "Ticks now land wider apart each second -- zero point three zero, zero point nine zero, one point five zero -- one to three to five." (24)

**S8** (55 words) -- calculus notation permitted here ONLY (Rule 38c):
1. "This graph plots the angle theta and the spin rate omega against time, as the same spin-up replays." (18)
2. "The theta curve bends upward; the steepness of that curve, at any instant, is omega." (15)
3. "Omega equals d theta over d t: the slope of theta." (9)
4. "In the same way, alpha equals d omega over d t: the slope of omega." (13)

**S9**: 0 words (open explore state -- no authored narration).

---

## Section 5 -- Drill-down cluster phrasings (30 phrases, 6 clusters x 5)

**`radians_vs_revolutions`** (S4): "is 6.28 the same as one full turn" * "why do we use radians instead of just counting turns" * "how many degrees is one radian" * "do i convert to revolutions or keep it in radians" * "whats the difference between an angle and a number of turns"

**`sign_of_alpha`** (S4): "does negative alpha mean its slowing down" * "how do i know if alpha should be positive or negative" * "is deceleration just negative acceleration" * "why isnt alpha always positive if the wheel is spinning" * "whats the sign convention for alpha"

**`linear_angular_mapping`** (S4): "which straight line equation matches which rotation equation" * "does theta replace x or does omega replace x" * "how do i know which formula to use for a spinning problem" * "is omega the same idea as velocity just for spinning things" * "whats the rotational version of v equals u plus at"

**`same_omega_different_v`** (S6): "if the whole thing spins together how can speeds be different" * "shouldnt every point on a spinning body move at the same speed" * "why does the outer point go faster if theyre both turning together" * "does the mass in the middle even move" * "how can one spin rate give two different speeds"

**`which_r_in_v_omega_r`** (S6): "is r the radius of the wheel or the distance to that point" * "do i measure r from the edge or from the center" * "does r change if the point is closer to the axle" * "why isnt r just the wheels total radius every time" * "how do i find r for a point thats not on the rim"

**`omega_vs_v_confusion`** (S6): "whats the difference between omega and v" * "are rad/s and m/s the same kind of speed" * "why do we need two different speeds for one spin" * "is angular speed the same as regular speed" * "how do the units tell omega and v apart"

---

## Section 6 -- Constraint callouts

1. **Rounding.** 2 dp everywhere (theta, omega, alpha, v -- matches K2's binding `dp: 2` on the new readout rows).
2. **tau and I are computed internally only, never printed.** `tau_internal = 3.06 x alpha_target`
   (I fixed for this whole concept). json_author uses this to author `applied_torque_Nm` /
   `tau_brake_Nm` on each drive/brake state (S3 1.84, S4 1.84, S5 1.53, S7 1.84 N.m) -- none of these
   numbers, nor "tau", "I", "torque", "moment of inertia", ever appear in a rendered string, label, HUD
   row, or narration sentence in this concept (Rule 25 -- protects the concept's position before
   `torque` (#5) and `moment_of_inertia` (#6)).
3. **alpha != tau/I inside the engine -- it is the per-step finite difference of omega (findings_d Section 1,
   canonical).** In every steady drive/brake window shown in this concept the two are numerically
   identical (the closed form is linear in t), so every displayed number in Section 1's ground-truth table
   is unchanged by this metric choice. The ONLY behavioural difference is at clamps/edges: S5's
   alpha readout returns to **0.00 the step after** the rest clamp binds (not before), which is the
   frame the S5 pin actually photographs (Section 3).
4. **Unicode minus (U+2212), never ASCII hyphen, on every negative on-canvas number.** This concept
   is the one that actually prints a negative alpha -- S5's -0.50 for its entire fall, and S9's full
   [-0.60, +0.60] slider range. Every `toFixed()` call on the alpha readout must post-process to a real
   Unicode minus across all three text paths (DOM readout, canvas `fillText`, sprite labels) per
   Rule 34c / the FIXED bug `ascii_minus_in_oncanvas_math_from_tofixed`. Founder-proxy's cycle-2
   review found this discipline carried by the sibling concept's physics block but not by this one --
   it is carried explicitly here now.
5. **S1's held claim is the picture, not the number (F-8, binding carry).** S1 is steady-continuous
   and never stops, so there is no single frozen frame where "theta = 6.28 rad" is true -- at the state's
   own pin (>= 6.0 s) the readout has already passed 6.28 and reads a larger transient value (approximately
   9.00 at 6.0 s). Section 4's S1 narration is worded as a repeating pattern ("each full turn adds ..."), never as a
   static value the frame must show. THE EYE must read S1 in DENSE frames, not only the frozen pin.
6. **S3 to S4 is the arc's thinnest link (F-9a, accepted, not to be strengthened).** S3 already shows
   constant alpha driving omega 0 -> 2.40 from rest; S4 repeats the same driven climb from omega0 = 1.50 -> 3.30.
   S4's genuinely new content is the identification with the linear-kinematics equation plus the
   prediction-first ritual (chip before motion, then verified) -- real, and the PRIMARY aha. This is a
   frozen design decision (founder-proxy DESIGN_OK); physics_author does not add a state or reshuffle
   content to close the gap.
7. **S8 is conditional on Desk E's K6 ruling.** If the theta(t)/omega(t) graph panel is descoped, S8 is
   DROPPED entirely (skeleton P1-8; no fallback readout is authored) -- the concept ships 8 states,
   the advanced ring is empty (compliant under Rule 38a per founder-proxy's explicit ruling, precedent
   `friction_force`/`equilibrium_of_particles`), and `entry_state_map.calculus_graphs` is removed.
   **json_author flag (F-7, carried forward):** in that case the curriculum-tag cells claiming JEE
   Main advanced-ring coverage and AP Physics C must be dropped or marked not-covered in the same
   change -- this concept is then recorded as revisit-when-K6-lands, never sealed as complete.
8. **Notation ladder (Rule 38c) -- verified compliant.** Formula surfaces: S1 none * S2 omega = theta/t * S3
   alpha = delta-omega/delta-t * S4 omega = omega0 + alpha*t * S5 omega = omega0 + alpha*t (alpha < 0) * S6 v = omega*r * S7 theta = omega0*t + half*alpha*t^2 * S8 omega = d theta/dt,
   alpha = d omega/dt (advanced ring ONLY) * S9 omega = omega0 + alpha*t. Every core/extended surface is algebra-only
   (Delta-notation, never d/dt); the two calculus forms are confined to S8.
9. **Dialect (38d).** No board-divergent term identified in this concept's vocabulary (angular speed,
   angular acceleration, radian read identically across CBSE/JEE/NEET) -- no dual-labelling required.
10. **Engine dependency -- nothing here is buildable before 0c-3.** This physics block assumes K1
    (signed torque, spin-up from rest), K2 (theta/alpha readout rows + loud warn), K3 (angular reference: base
    start line + swept arc, reusing the existing `rbr_drum_marker` stripe), K4 (tangential v arrows +
    the `rbr_v_arrows` group token), K5 (equal-time ticks with an explicit time origin, base-frame per
    F-6), K6 (graph panel -- conditional), K7 (the `alpha` slider token, concept-wide range), K8 (the
    shared drive-wheel actuator with its travel wiring lifted onto the applied-torque source), and K10
    (the `deriveStateMeta.ts` co-edit so THE EYE's motion gate does not go silent on the from-rest
    states S3/S7/S8). No new engine requirement was found beyond the skeleton's K1-K10 during this
    pass; every number in Section 1's ground-truth table was independently re-derived and agrees with the
    skeleton exactly (no new `findings_d` PASS-3 item is raised).
11. **Ring assignment (Rule 38a), for json_author's `depth_ring` tags:** S1-S6 `core` * S7 `extended` *
    S8 `advanced` (conditional, Section 6.8) * S9 explore, core-ring content only (`omega = omega0 + alpha*t`, stated and
    performed by S4, survives every preset cut).

---

**DC Pandey check:** every formula, narration line and anchor above derives from omega = omega0 + alpha*t,
theta = omega0*t + half*alpha*t^2, alpha = delta-omega/delta-t, and v = omega*r directly -- no teaching sequence, example, or figure imported
from any book. DC Pandey was consulted only for the Ch.7 table-of-contents scope check (already
recorded in the skeleton header).

*Phase 0b physics-authoring for `rotational_kinematics` is COMPLETE on skeleton REV 2 (`DESIGN_OK`,
cycle 2) + this block. This concept is BLOCKED on build 0c-3 (K1-K10, `findings_d.md` PASS 2 as the
freeze source). No concept JSON is authored until that PR merges and this desk syncs
(`rotmech_d_state.md`).*
