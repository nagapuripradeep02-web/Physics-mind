# PHYSICS BLOCK — `angular_momentum` (rotmech · Class 11 Ch.7 · concept #9 · Desk C)

> Produced by `alex:physics_author` 2026-08-04, against **skeleton REV 4**
> (`skeleton_rev4.md`) after founder-proxy Checkpoint A returned **`DESIGN_OK` with ONE
> binding correction (C1)** (`founder_proxy_A_cycle2_final.md`). This block carries C1 as
> BINDING, documents C2, and TAKES C3. No engine dispatch is authorized or needed - the
> `rigid_body_rotation` scenario is built and merged; every field this block consumes is
> verified IMPLEMENTED against `field_3d_renderer.ts` (interface `:977-1059`, implementation
> `:49736-50791`), cited inline. `theta0_rad = 1.739` is used for S3 (C1); S2's
> `pad_travel_ms` is shortened from 6800 to 2200 ms (C3, taken); C2's phase-anchoring
> clarification is folded into every timeline below without moving any number. **No pin
> moves anywhere in this pass**: S1 22700, S2 20400, S3 19500, S4 13000 - unchanged from
> REV 4, verified again below state by state.

---

## §1 --- Variables, formulas, constraints

### physics_engine_config.variables

```json
{
  "variables": {
    "r": {
      "name": "Radius of each sliding mass from the axle -- RAMP-ONLY in this concept (S3's still-platform slide, 0.80 -> 0.20); fixed at the apparatus home pose everywhere else; EXCLUDED from every live control including S5's sandbox (the r-hazard ruling, REV 4 skeleton verified engine reality #4)",
      "unit": "m",
      "min": 0.15, "max": 0.90, "default": 0.80, "step": 0.01
    },
    "m": {
      "name": "Mass of each sliding mass (two, symmetric about the axle) -- restart-seed-only; live-drivable ONLY in S5 via the narrowed slider_controls band",
      "unit": "kg",
      "min": 0.5, "max": 3.0, "default": 2.0, "step": 0.1
    },
    "omega0": {
      "name": "Seed angular speed MAGNITUDE -- sets L only at t=0 (S1 entry) or at an explicit RESTART (S3's single relaunch, S4's run-cut, S5's live m/omega0/direction change); never applied continuously mid-run",
      "unit": "rad/s",
      "min": 1.0, "max": 2.0, "default": 1.5, "step": 0.1
    },
    "omega": {
      "name": "Live angular speed -- the DERIVED quantity omega = L/I, recomputed every step; never itself an independent variable, slider, or integrated quantity",
      "unit": "rad/s",
      "min": null, "max": null, "default": null,
      "derived": "omega = L / I"
    },
    "spin_sign": {
      "name": "Spin direction -- a discrete RESTART control (grip-rule +1 vs -1), never eased through zero. Fixed +1 in S1-S3; toggled in S4 (extended-ring button, fixed 8 s cycle) and S5 (extended-ring button, live)",
      "unit": "dimensionless (+1 or -1 only)",
      "min": -1, "max": 1, "default": 1, "step": 2
    },
    "tau_brake": {
      "name": "Brake torque magnitude while the pad is engaged against the turntable's rim -- NEVER slider-exposed in this concept (F-C1 exclusion: a live drag applies torque while the pad stays invisible). Per-state AUTHORED magnitude only: 0 in S1/S4/S5, 0.45 N.m in S2, 2.00 N.m in S3",
      "unit": "N.m",
      "min": 0, "max": 2.0, "default": 0
    },
    "I_frame": {
      "name": "Fixed inertia of the turntable + rod, excluding the two sliding masses",
      "unit": "kg.m^2", "constant": 0.50
    },
    "rod_half_length": {
      "name": "Rod half-length -- apparatus geometry only, not a formula input",
      "unit": "m", "constant": 1.00
    },
    "brake_drum_radius": {
      "name": "Braked radius, where the pad contacts the turntable's rim -- apparatus geometry only; never drawn or narrated in this concept (show_drum_line/show_r_line both false everywhere, no radius value is ever cited)",
      "unit": "m", "constant": 0.55
    },
    "rod_height_above_pad": {
      "name": "Vertical clearance of the rod plane above the drum's pad plane -- apparatus geometry only, guarantees no fouling at any r including r=0.20",
      "unit": "m", "constant": 0.25
    },
    "theta0_rad": {
      "name": "Rod's azimuth at state entry -- a per-state AUTHORED CONSTANT, not a teacher control. Default 0 everywhere (entry orientation is invisible on a spinning platform). S3 is the ONE state that authors a non-default value: 1.739 rad (C1, BINDING correction to REV 4's 0.168 -- see the S3 override below and the Report to the founder)",
      "unit": "rad", "constant": 0
    }
  }
}
```

**`g` is deliberately ABSENT**, same justification as the sibling: rotation is about a
VERTICAL axle in a HORIZONTAL plane, so gravity contributes zero torque about that axis at
every mass position. No formula below references g.

### Category summary (live-drivable / restart-seed-only / authored-per-state / fixed constant)

| Variable | Category | Where live | Where seed/authored-only |
|---|---|---|---|
| `r` | **Ramp-only** (S3), else fixed | never a slider anywhere in this concept | S3: `param_ramp` 0.80 to 0.20, 9000-16000 ms. S1/S2/S4/S5: fixed 0.80 at entry, never moves |
| `m` | **Restart-seed-only** | S5 only (live slider, 0.5-3.0 kg) | S1-S4: fixed 2.0, defensive lock (historical `default_variables_only_first_var_merged` failure mode) |
| `omega0` | **Restart-seed-only** | S5 only (live slider, 1.0-2.0 rad/s) | S1 (t=0 seed) - S3 (restart, same 1.50 magnitude) - S4 (both runs, same magnitude) |
| `omega` | **Derived, never a variable** | recomputed every step everywhere | n/a |
| `spin_sign` | **Restart-seed-only** (discrete) | S4 (fixed-cycle toggle) - S5 (live toggle) | S1-S3: fixed +1 |
| `tau_brake` | **Authored-per-state ONLY** -- never a slider in this concept | never live | S2 (0.45) - S3 (2.00) - S1/S4/S5 (0, no brake apparatus shown) |
| `I_frame` / `rod_half_length` / `brake_drum_radius` / `rod_height_above_pad` | **Fixed apparatus constants** | never adjustable | apparatus contract S1, authored verbatim every state |
| `theta0_rad` | **Authored-per-state constant** | never a control | S3 = 1.739 (C1); every other state = 0 |
| `g` | **Not used** | n/a | n/a |

### physics_engine_config.formulas

```json
{
  "formulas": {
    "angular_momentum_definition": "L = I*omega -- the ONE relation this concept teaches. I and omega are each independently legible on screen (the mass spread; the spin rate); L is their product, printed on the formula surface from S1 t=0 and USED PREDICTIVELY in S2/S3.",
    "moment_of_inertia": "I(t) = I_frame + 2*m*r(t)^2 -- recomputed live from r(t). r(t) is CONSTANT in every guided state except S3's still-platform slide (9000-16000 ms), so I is a held constant everywhere else (hold_glow in S2 makes this the explicit teaching point).",
    "brake_torque_decay": "L(t) = sign(L0) * max(0, |L0| - tau_brake * braked_seconds(t)) -- the rest clamp acts on L only. omega is never independently clamped or reversed; a braked platform can be brought to exact rest but never spun backward at any authored or reachable tau_brake.",
    "omega_derived": "omega(t) = L(t) / I(t) -- ALWAYS derived, never itself integrated or stored. theta(t) sums omega on the FIXED 16 ms grid (rbrThetaAt, :49952-49966), so it is step-count invariant and exactly reproducible at any pinned or rewound instant (Rule 36).",
    "restart_reseed": "At a RESTART (S3's single relaunch at 17500 ms; S4's run-cut every 8000 ms; S5's live m / omega0 / spin-direction events), L is re-pinned to L0 = I(r at the restart's effective time) * omega0 * spin_sign, after a >= 500 ms blank (repin_cue) -- so the discontinuity always reads as a restart, never as an uncaused torque (rbrRestartNow, :50053-50064; rbrAnchor, :49915-49926).",
    "theta0_azimuth_solve_S3": "theta0_rad = ((pi/2 - theta_cam) - omega0*(t_engage + t_decay/2)) mod pi, theta_cam = pi/4 (:50477); t_decay = I0*omega0/tau. C1 BINDING correction to REV 4's formula, which was off by pi/2 (see the Report to the founder)."
  }
}
```

### Constraints

- L = I.omega at every instant; omega is always DERIVED from L and I, never independently stored or integrated.
- I(t) = I_frame + 2.m.r(t)^2; I_frame = 0.50 kg.m^2 is a fixed apparatus constant, never adjustable.
- tau_brake in [0, 2.0] N.m is frictional -- it can only decelerate toward rest; the rest clamp on L means no authored or reachable tau_brake/engagement-window combination ever reverses the spin.
- **r changes ONLY while the platform is at rest** (S3's slide, L = 0.00 rest-clamped throughout) -- in every other guided state r is held fixed at 0.80. This is the concept's central engineering constraint: since omega is always the DERIVED L/I, any r-motion while spinning would render `conservation_of_angular_momentum`'s primary aha (L pinned, omega rising) by accident. This concept never lets that happen.
- spin_sign is a discrete restart parameter, never eased through zero, at any reachable slider or button value.
- m and omega0 are RESTART/seed parameters -- they set L fresh at t = 0 or at an explicit restart event, never applied as a continuous per-frame drive during an ordinary state.
- r in [0.15, 0.90] m is a hard mechanical range; both taught poses (0.80, 0.20) sit strictly inside it.
- The L-arrow's drawn length is EXACTLY proportional to |L| within [0.22, 1.80] world units (0.20 world units per kg.m^2/s) -- every guided-state value (4.59 -> 0.918; 1.53 -> 0.306; +/-4.59 -> 0.918) sits inside that band; only S3's rest interval (L = 0.00) would draw a false nonzero stub, which is why S3 hides the arrow entirely (F-C2) rather than show a lying length.

### Ground-truth numeric table (re-derived from the engine's own closed forms; matches skeleton REV 4 exactly)

| Quantity | Home (S1/S2 entry, S4 Run A) | S2 held (post-decay) | S3 stopped | S3 relaunched | S4 Run B |
|---|---|---|---|---|---|
| I (kg.m^2) | 3.06 | 3.06 (r never moves in S2) | 3.06 to 0.66 during the slide | 0.66 | 3.06 |
| omega (rad/s) | 1.50 | 0.50 | 0.00 | 1.50 | -1.50 |
| L (kg.m^2/s) | 4.59 | 1.53 | 0.00 | 0.99 | -4.59 |
| KE (J) -- **not displayed** (owned by `rotational_work_energy`, #8) | 3.44 | 0.86 | 0.00 | 0.74 | 3.44 |

**Checks, hand-derived from the engine's closed forms:**
- I(0.80) = 0.50 + 2(2.0)(0.80^2) = 0.50 + 2.56 = **3.06** kg.m^2. I(0.20) = 0.50 + 2(2.0)(0.20^2) = 0.50 + 0.16 = **0.66** kg.m^2.
- **S2**: braked_seconds = release - engage = 18400 - 11600 = 6800 ms = 6.8 s (unaffected by the C3 pad-travel edit, which only changes when the pad visually approaches, never `engage_at_ms`/`release_at_ms`). Delta-L = tau . braked_s = 0.45 x 6.8 = **3.06** exactly, so L = 4.59 - 3.06 = **1.53** exactly. omega = 1.53/3.06 = **0.50** exactly (I fixed at 3.06 the whole state -- r never ramps in S2). No rounding collision: 1.53 = 4.59/3 exactly.
- **S3**: |L0|/tau = 4.59/2.00 = **2.295 s** stop time after engage (4500 ms), so stop at approximately 6795 ms, matching the skeleton's "about 6.8 s". Relaunch L0' = I(0.20).omega0.(+1) = 0.66 x 1.50 = **0.99** exactly. omega' = 0.99/0.66 = **1.50** exactly (chip tolerance 0.01 trivially met).
- **S4**: r never ramps in S4 either (no `param_ramp` authored) -- I stays 3.06 in both runs; only the sign of L and omega flips: +4.59/+1.50 (Run A) vs -4.59/-1.50 (Run B).
- **The one numeric coincidence (A12), re-verified**: during S2's decay, L(t) = 4.59 - 0.45(t - 11.6) for t in [11.6, 18.4]. Setting L = 3.06 (the constant, hold-glowed I value): 0.45(t - 11.6) = 1.53, so t - 11.6 = 3.4, so **t = 15.0 s** absolute state time -- exactly the skeleton's claim. Benign (different instrument, different unit, no pin lands there); carried forward as constraint callout 6 below.

---

## §2 --- Per-state variable overrides

Per the `hinge_force.json` / `field_forces.json` defensive-lock pattern (guarding the
`default_variables_only_first_var_merged` failure mode), **every state declares `m: 2.0`
explicitly** even in states where it never changes.

| State | `variable_overrides` (rigid_body_rotation fields) | Justification |
|---|---|---|
| S1 | `{ masses: {r_m: 0.80}, omega0_rad_s: 1.50, spin_sign: 1, external_torque: none, theta0_rad: 0 }` | True initial seed: L0 = I(0.80).1.50 = 4.59. `theta0_rad` left at default -- entry orientation is invisible on an already-spinning platform (no Rule-32d continuity break). |
| S2 | `{ masses: {r_m: 0.80}, omega0_rad_s: 1.50, spin_sign: 1, external_torque: {source:'brake', tau_brake_Nm:0.45, engage_at_ms:11600, release_at_ms:18400, pad_travel_ms:2200} }` | Same home seed as S1 (L0 = 4.59). **`pad_travel_ms` 6800 to 2200 (C3, TAKEN)** -- travel window shifts from 4800-11600 to 9400-11600 (still ends exactly at `engage_at_ms`, unchanged); no reveal candidate touches `pad_travel_ms`, so the pin is untouched (verified below). |
| S3 | `{ masses: {r_m: 0.80 (= ramp.from)}, omega0_rad_s: 1.50, spin_sign: 1, theta0_rad: 1.739, external_torque: {source:'brake', tau_brake_Nm:2.00, engage_at_ms:4500, release_at_ms:7500, pad_travel_ms:600}, param_ramp: {param:'r', from:0.80, to:0.20, start_ms:9000, end_ms:16000}, restart: {at_ms:17500, flip_spin:false}, repin_cue: {blank_ms:500} }` | **The one non-home entry AND the one non-default `theta0_rad` (C1, BINDING -- 1.739, not REV 4's 0.168).** `flip_spin: false` authored EXPLICITLY (the default is `true`, `:50548`) so the relaunch is unambiguously a same-sign restart, never a silent reversal. |
| S4 | `{ masses: {r_m: 0.80}, omega0_rad_s: 1.50, spin_sign: 1 (Run A), external_torque: none, restart: {at_ms:11000, every_ms:8000, flip_spin:true}, repin_cue: {blank_ms:500}, theta0_rad: 0 }` | Re-pose to home; `flip_spin: true` authored explicitly even though it is the default (the scenario's own defensive-authoring discipline -- never rely on an unstated default for the field the whole beat depends on). |
| S5 | `{ masses: {r_m: 0.80}, omega0_rad_s: 1.50, spin_sign: 1, external_torque: none, mode: 'sandbox', theta0_rad: 0, slider_controls: {m:{min:0.5,max:3.0,step:0.1,default:2.0}, omega0:{min:1.0,max:2.0,step:0.1,default:1.5}} }` | Sandbox initial pose = home (L = 4.59 at entry). No `idle_auto_sweep` authored (the only implemented sweep param is `r`, and `r` is excluded from this concept everywhere) -- the machine simply spins live until the first trusted input, per REV 4's own verified engine reality. |

Every state also authors `masses: {count: 2, mass_kg: 2.0}` explicitly (the defensive `m` lock) and `apparatus: {i_frame_kgm2:0.50, rod_half_length_m:1.00, brake_drum_radius_m:0.55, rod_height_above_pad_m:0.25, r_min_m:0.15, r_max_m:0.90}` verbatim, per the binding `APPARATUS_CONTRACT.md` S1.

---

## §3 --- Within-state motion timeline + per-state control spec (Rule 31)

**Timing method.** REV 4's `at_ms` schedule (readouts, chips, phases, ramp/restart windows) was
independently re-derived by founder-proxy against the renderer's real `deriveStateMeta.ts` pin
logic and verified to move no pin. My narration below (S4 below) is written to real per-sentence
word counts and is, in every state, SHORTER than REV 4's worst-case sentence-plan envelope -- so
every `at_ms` in REV 4's schedule sits AT OR AFTER my real cumulative sentence-end, which is the
only requirement the ledger imposes. **I therefore inherit REV 4's exact ms schedule unchanged**,
and touch only the two named deltas (`theta0_rad` in S3, C1; `pad_travel_ms` in S2, C3) -- neither
of which is a reveal-candidate field, so **no pin moves**. Real cumulative sentence-end times are
shown per state below as the margin evidence.

**Glow-target glossary** (built element types, `RBR_ELEMENT_TYPES`, `:50586-50592`):
`rbr_drum_marker` - `rbr_mass` - `rbr_brake_pad` - `rbr_l_arrow` - `rbr_l_label` -
`rbr_grip_hand` - `rbr_axle` - `rbr_rod` - `rbr_drum`. All four focal tokens this concept uses
(`rbr_drum_marker`, `rbr_mass`, `rbr_brake_pad`, `rbr_l_arrow`) are reachable by
`applyRigidBodyRotationGlow`'s focal test (never `rbr_root`/`rbr_spin`, which the pass
early-returns on before dimming everything -- the REV 1 trap).

### S1 -- "A spinning body carries angular momentum" - core (qualitative) - none live - R = 24 s, pin at 22.7 s

Entry: r = 0.80, omega = +1.50, brake off, `theta0_rad` = 0 (default). Turntable is ALREADY
spinning at t = 0 (never a cold start). `formula: "L = I.omega"` and `show_l_arrow: true` are
STATIC per-state overlays, visible from frame 1 (A5 -- the definition beat carries the
registered headline visual; not an animated draw-in, and not itself timeable).

| t-window | What animates | Driven by |
|---|---|---|
| 0-24000 ms (whole state) | Turntable + rod + two masses spin continuously at omega = 1.50 (background motion, never stops) | omega (constant this state) |
| t = 0 | `L = I.omega` formula surface + axial `rbr_l_arrow` + `rbr_l_label` visible, magnitude-only (no direction semantics narrated) | static per-state overlay |
| 0-6300 ms | Focal on `rbr_drum_marker` (the spinning machine, T1) | phase base |
| 6300-11700 ms | Focal shifts to `rbr_mass` (I = the mass spread, T2) | phase |
| 12000 ms | `I` readout row becomes visible: "I = 3.06 kg.m^2" | `readout_at_ms` |
| 11700-15200 ms | Focal returns to `rbr_drum_marker` (the sweep, T3) | phase |
| 15500 ms | `omega` readout row becomes visible: "omega = 1.50 rad/s" | `readout_at_ms` |
| 15200 ms to end | Focal holds on `rbr_l_arrow`, OPEN phase (T4 -- the sentence that introduces the arrow as the how-much indicator; its label is solid-listed and never dims) | phase (open) |
| 21500 ms | `L` readout row becomes visible: "L = 4.59 kg.m^2/s" | `readout_at_ms` |
| 22700 ms (PIN) to 24000 ms | HELD -- all three readouts + formula + arrow steady; law statement narrated over the hold | -- |

Controls: **none**. **Pin check**: readout candidates 13200 / 16700 / **22700** (L + 1200) -
phase candidates 6800 / 12200 / 15700 -- all below 22700. **PIN = 22700, unchanged from REV 4.**

Real narration margin (S4 below): T1 ends 5.77 s, T2 ends 10.77 s (I prints at 12.0 s, margin
1.23 s), T3 ends 13.85 s (omega prints at 15.5 s, margin 1.65 s), T4 ends 19.62 s (L prints at
21.5 s, margin 1.88 s) -- every reveal sits comfortably after its defining sentence's real end.

### S2 -- "Slower spin, smaller L" - core (quantitative) - none live - R approximately 22 s, pin at 20.4 s

Entry: r = 0.80 (fixed the whole state -- no ramp), omega = +1.50, brake off. Formula + arrow
persist from S1 (no debut event, Rule 32d).

| t-window | What animates | Driven by |
|---|---|---|
| 0-22000 ms (whole state) | Continuous spin (background, never stops) | omega, then omega(t) once braked |
| 0-9400 ms | Pad parked, announced narratively (T1); focal on `rbr_brake_pad` | phase base |
| 9400-11600 ms (2200 ms -- **C3 taken**, was 6800 ms) | Pad translates in toward the rim (visible cause approaching) | `pad_travel_ms` |
| 10500 ms | Chip "predicted L = 1.53" reveals beside the L readout -- **before** the fall begins | `reference_marks.at_ms` |
| 11600 ms | Pad makes contact; brake engages, tau = 0.45 N.m active | `engage_at_ms` |
| 11600-18400 ms (6800 ms, unchanged) | L decays linearly 4.59 to 1.53; omega recomputes 1.50 to 0.50 in lockstep; I holds 3.06 (`hold_glow`); L-arrow shrinks proportionally 0.918 to 0.306 world units | tau_brake, I fixed |
| approximately 18300-18400 ms | Live L reaches the chip value; MATCH LATCH fires; L readout + chip co-glow | match predicate |
| 12600 ms to end | Focal on `rbr_l_arrow`, OPEN phase (the decay + the chip match -- the arrow's length is the tracking channel) | phase (open) |
| 18400 ms | Pad releases (tau to 0); L holds at 1.53 for the rest of the state | `release_at_ms` |
| 18400-20600 ms (2200 ms -- C3) | Pad retracts toward its parked pose | `pad_travel_ms` |
| **20400 ms (PIN)** | L = 1.53 co-glowing its chip; I = 3.06 (hold-glow); omega = 0.50; pad **nearly withdrawn (approximately 91% retracted)** -- corrected from REV 4's "mid-retract" description, a direct consequence of C3's shorter travel | -- |
| 20600-22000 ms | Pad fully parked; all readouts settled, held | -- |

Controls: **none**. **Pin check**: chip candidate 11400 (10500+900) - phase candidate 13100
(12600+500) - release candidate **20400** (18400+2000, governing). Neither `pad_travel_ms`
edit touches a reveal-candidate field (engage/release/chip/phase instants are all unchanged).
**PIN = 20400, unchanged from REV 4.**

Real narration margin: T1 ends 4.23 s (announcement, well before the 9.4 s glide start -- the
spin alone bridges the gap, satisfying the no-static-hole rule), T2 ends 8.85 s (chip at 10.5 s,
margin 1.65 s), T3 ends 12.69 s (narrates the press while the decay is already under way -- B1's
sanctioned overlap), T4 ends 16.92 s (narrates the ongoing fall).

### S3 -- "Mass position changes L" - core (PRIMARY AHA, `misconception_confrontation`) - none live - R = 23 s, pin at 19.5 s

Entry: r = 0.80 (= `ramp.from`, the home pose), omega = +1.50 (the same baseline value as
S1/S2 -- each state re-poses in a single frame per the general rule, not a literal carry).
`theta0_rad = 1.739` (**C1**).

| t-window | What animates | Driven by |
|---|---|---|
| 0-23000 ms (whole state) | -- | -- |
| 0-3900 ms | Steady home spin, L = 4.59 held (the baseline being cited); focal on `rbr_drum_marker` | omega constant, phase base |
| 3900-4500 ms (600 ms) | Pad travels in | `pad_travel_ms` |
| 4500 ms | Pad contacts; tau = 2.00 N.m engages; focal shifts to `rbr_brake_pad` | `engage_at_ms`, phase |
| 4500-approximately 6795 ms (2.295 s decay) | L falls linearly 4.59 to 0.00; omega falls to 0 in lockstep (I still 3.06 -- r has not moved yet) | tau_brake, rest clamp |
| approximately 6795 ms | Platform at rest; L = 0.00 (rest-clamped, holds) | -- |
| 7500 ms | Pad releases (tau to 0; moot -- L is already clamped at 0) | `release_at_ms` |
| 7500-8100 ms (600 ms) | Pad retracts | `pad_travel_ms` |
| **7800 ms** | Chip "before: 4.59" reveals beside the L readout -- **post-stop**, so the reveal-gated match predicate can never spuriously latch (A2) | `reference_marks.at_ms` |
| 9000-16000 ms (7000 ms) | Focal on `rbr_mass` from 9000. **Masses slide r: 0.80 to 0.20 on the STILL platform** -- the ONLY mover; omega = L/I = 0.00 for every I(t) during the slide (rest-clamped L). I readout falls live 3.06 to 0.66 (pure geometry). **`theta0_rad = 1.739` (C1) fixes the rod's azimuth at the stop instant to the BROADSIDE condition relative to the camera** -- the rod does not rotate further while omega = 0, so the slide holds this azimuth for the whole 7 s window, projecting as near-maximal, near-PURE-HORIZONTAL screen travel (independently re-verified by direct camera projection below -- 97.4% of the full 2pi sweep maximum) -- reads unambiguously as "the masses moved in," not as an ambiguous vertical drift (REV 4's uncorrected 0.168 rad would have projected this exact beat onto the sweep's screen-travel MINIMUM) | `param_ramp` |
| 16000-17000 ms | HELD -- slide complete, r = 0.20. **Largest static window anywhere in the state: 1.0 s** (no-static-hole rule holds) | -- |
| **17000 ms** | Chip "same speed: 1.50" reveals beside the omega readout -- before the restart fires | `reference_marks.at_ms` |
| **17500 ms** | RESTART fires: all three readouts BLANK ("--") for >= 500 ms; "restarting" badge shown; theta resets to `theta0_rad` = 1.739 | `restart.at_ms` |
| 17500-18000 ms (500 ms blank) | Focal shifts to `rbr_drum_marker`, OPEN phase | phase (open) |
| **18000 ms** | Restart EFFECTIVE: L re-pins to I(0.20).1.50.(+1) = 0.99; omega = 0.99/0.66 = 1.50 exactly; omega-readout matches its "same speed" chip (co-glow latch); spin resumes at omega = +1.50, `flip_spin: false` explicit -- the sign never flips | `restart_reseed` |
| **19500 ms (PIN)** | omega = 1.50 matched to its chip; **L = 0.99 beside "before: 4.59"** -- both halves of the contrast on one frozen frame; masses visibly at r = 0.20. Rod azimuth has advanced approximately 1.5 s x 1.50 rad/s = approximately 2.25 rad (approximately 129 degrees) past the broadside stop pose since the restart resumed at 18000 ms -- **the rod is NOT still broadside at this pin** (correcting the REV 4 pin-table parenthetical, a C1 dependent correction -- see below) | -- |
| 19500-23000 ms | Held | -- |

Controls: **none**. `show_l_arrow: false` throughout (F-C2 -- the 0.22 arrow floor would draw a
visible nonzero stub through the whole L = 0 dwell; the story rides the readout + both chips).
**Pin check**: release candidate 9500 - marks candidates 8700/17900 - ramp-end candidate 16900
(16000+900, unaffected by the `theta0_rad` edit, which touches only azimuth, never timing) -
restart candidate **19500** (17500+500+1500, governing) - phase candidates 4400/9500/18000, all
below 19500. **PIN = 19500, unchanged from REV 4.**

Real narration margin: T1 ends 3.46 s (chip at 7.8 s, margin 4.34 s), T2 ends 8.46 s (spans the
engage-to-stop window, ends after it completes), T3 ends 12.69 s (mid-slide, narrates while the
slide is visibly under way), T4 ends 16.15 s (anticipatory -- precedes the actual restart at
17500 ms, matching REV 4's own precedent of T4 ending slightly before its event), T5 ends
20.38 s (spans the restart and its payoff; the "same speed" chip at 17.0 s and the restart
itself both land inside T5's real window, and both are already visible by the 19.5 s pin).

### S4 -- "L points along the axis" - extended - spin-direction toggle - R = 22 s, pin at 13.0 s

Entry: r = 0.80 (fixed the whole state -- no ramp), Run A omega = +1.50, brake off,
`theta0_rad` = 0. **First and only state to narrate direction.**

| t-window | What animates | Driven by |
|---|---|---|
| 0-11000 ms (Run A) | Steady spin omega = +1.50; grip hand curls continuously WITH the spin (2600 ms triangle loop, never stops); L-arrow UP, cool blue (`RBR_POS_COLOR`); readouts +1.50 / +4.59 | spin_sign = +1 |
| 11000-11500 ms (500 ms, cut) | Restart cue fires; readouts BLANK, hold >= 0.5 s (never a live +4.59 to -4.59 sweep) | `restart` trigger |
| 11500 ms | RESTART: spin_sign flips to -1 (`flip_spin: true`, authored explicit); theta resets to 0 | `restart_reseed` |
| 11500-19000 ms (Run B, 7500 ms) | Spin omega = -1.50; grip hand FLIPS 180 degrees about world X (orientation-preserving -- still a right hand) and curls the other way; L-arrow DOWN, warm amber (`RBR_NEG_COLOR`); readouts print the real Unicode minus, -1.50 / -4.59 | spin_sign = -1 |
| **13000 ms (PIN)** | approximately 1.5 s into Run B: arrow DOWN amber, hand flipped and curling, signed -1.50 / -4.59 visible | -- |
| 19000 ms | Second cut (`every_ms` 8000, i.e. 11000+8000) -> Run A' resumes (closes the A-to-B-to-A' cycle) | `restart_reseed` |
| 19000-22000 ms | Run A' continues to state end | spin_sign = +1 |

Focal is STATIC on `rbr_l_arrow` for the whole state -- deliberate (the arrow IS the state's
subject; the hand is a named mesh and never dims, Rule 29). Controls: **spin-direction TOGGLE
BUTTON**, `min_ring: extended` -- a click drives the SAME `rbrRestartNow(-cur)` mechanism live,
discrete only, never eased through zero. **Pin check**: single candidate = restart 11000+2000 =
**13000**, governing by construction (no other timed field authored). **PIN = 13000, unchanged.**

Real narration margin: T2 (grip rule, thumb up) ends 10.38 s -- inside Run A, before the 11.0 s
cut. T3 (the flip) ends 15.0 s, spanning the cut into Run B. T4 (axis, not heading) ends
18.85 s, still inside Run B, before the 19.0 s second cut.

### S5 -- "Try it yourself" - explore - m / omega0 / spin-direction - open (Rule 37 -- never auto-freezes)

Entry: r = 0.80 (fixed pose; **`r` is excluded from every control in this concept** -- it never
appears in any `controls_visible` array, so `rbrSliderTokensUsed()` never builds its row),
omega0 = 1.50, spin_sign = +1, tau_brake = 0 (**`tau_brake` also excluded, F-C1** -- no brake row
exists either). `mode: 'sandbox'`. No `idle_auto_sweep` -- the only implemented sweep param is
`r`, which is excluded, so the machine simply spins live at the home pose until the first
trusted input.

| Behavior | What animates | Driven by |
|---|---|---|
| Until first trusted input | Machine spins live at home pose (omega = 1.50, r = 0.80, I = 3.06, L = 4.59); L-arrow static at 0.918 world units; formula on | -- |
| `m` drag (live, trusted-seize) | Fires `rbrApplyParam('m', v)` -> `rbrRestartNow(null)` -- **RESTART**: all three readouts BLANK ("--") for >= 0.5 s under the "restarting" badge; the L-ARROW is NOT blank-gated and tracks the new I(0.80, m).1.50.sign LIVE during the drag itself; readouts reappear 0.5 s after release at the new value | m |
| `omega0` drag (live) | Same restart mechanism; arrow tracks live; readouts blank/re-arm on every input, settle 0.5 s after release | omega0 |
| spin-direction toggle (button, `min_ring: extended`) | RESTART with the sign flipped; arrow flips direction + colour, never eased through zero | spin_sign |

Controls: **`m`** (core, [0.5, 3.0] kg, step 0.1, default 2.0) - **`omega0`** (core, [1.0, 2.0]
rad/s, step 0.1, default 1.50) - **spin-direction** (extended, restart toggle). No narration
(0/open). **Honest caption instruction (carried from A8/REV 4)**: `m`'s only rendered
correlates are the L-arrow (live during the drag) and the re-pinned readouts -- the drawn mass
spheres are size-constant (`RBR_MASS_R`, Rule 29) and never visibly respond to `m`; the S5
caption directs the eye to the arrow, never claims the spheres themselves change.

---

## §4 --- Narration (`text_en`) per state

Every sentence is written **at or under** its REV 4 per-sentence word cap; every state total is
at or under its planned maximum (S1 <= 55, S2 <= 48, S3 <= 55, S4 <= 50). Timed at 2.6 words/s
(Rule 31's 25-55-word / 10-20-s band). Dual-label "moment of inertia (rotational inertia)"
appears exactly once, in S1 T2, then stays bare. No idioms, metaphors or personification (Rule
41) -- L does not want, know, try or carry anything in the figurative sense; "the closer masses
carry less angular momentum" uses "carry" in its literal physical sense (possess a quantity),
matching Rule 41's own worked precedent.

**S1** (51 words; plan cap 55):
1. "This turntable spins steadily, with two masses out on its arms, like a playground merry-go-round." (15)
2. "The spread of its mass is its moment of inertia -- rotational inertia -- I." (13)
3. "Its spin rate is the angular speed omega." (8)
4. "Their product is the angular momentum L -- the arrow on the axle shows how much." (15)

**S2** (44 words; plan cap 48):
1. "Recall L equals I omega -- a brake now approaches the rim." (11)
2. "The equation predicts angular momentum will settle at one point five three." (12)
3. "The pad presses onto the rim and slows the spin." (10)
4. "L falls in step with speed omega -- inertia I stays fixed." (11)

**S3** (53 words; plan cap 55) -- attribution rule honoured: T4's "restarts... at the same
speed" precedes T5's number, so the payoff is read against the RESTART, never against the
slide (skeleton §4's planting-risk note):
1. "Angular momentum L now reads four point five nine." (9)
2. "The brake stops it completely: angular speed omega is zero, so is L." (13)
3. "While it stays still, the masses slide in and I falls." (11)
4. "The turntable restarts, spinning again at the same speed." (9)
5. "L reads point nine nine now, not four point five nine." (11)

**S4** (49 words; plan cap 50) -- first state to narrate direction:
1. "Hold a spinning bicycle wheel by its axle -- L lies along that line." (13)
2. "Curl the right hand's fingers with the spin -- this way, the thumb points up." (14)
3. "Now it spins the other way -- the thumb points down, same line." (12)
4. "L follows this one axis, not any mass's moving direction." (10)

**S5**: 0 words (open explore state -- no authored narration).

---

## §5 --- Drill-down cluster phrasings (30 phrases, 6 clusters x 5)

**`l_vs_spin_speed_identity`** (S3): "isnt angular momentum just the spin rate" - "why do we need L if we already have omega" - "L and omega feel like the same thing to me" - "whats different between angular momentum and how fast it spins" - "if the speed is the same shouldnt L be the same"

**`why_mass_position_matters`** (S3): "why does moving the masses change L if the speed didnt change" - "how can where the mass sits matter as much as speed" - "the spin rate is identical so why is L different" - "why does mass position affect angular momentum" - "does it matter how far the mass is from the axle"

**`stopped_body_zero_L`** (S3): "does a stopped turntable still have angular momentum" - "if its not spinning is L zero" - "can something at rest carry angular momentum" - "why does L drop to zero when it stops" - "is angular momentum only there while it spins"

**`which_way_does_L_point`** (S4): "how can a spin have a direction" - "which way does angular momentum point" - "a spinning wheel doesnt go anywhere so how does L have a direction" - "why does L point along the axle and not around the rim" - "does angular momentum point up or down"

**`right_hand_rule_how`** (S4): "how do I actually use the right hand rule here" - "which fingers curl which way for angular momentum" - "how do you find the direction of L with your hand" - "do I curl my fingers with the spin or against it" - "whats the trick to remembering the right hand rule"

**`why_axis_not_tangent`** (S4): "why doesnt L point the way the mass is moving" - "shouldnt angular momentum point along the motion of the spinning mass" - "why is L along the axle and not tangent to the circle" - "the mass moves in a circle so why is L a straight line" - "why does L ignore the direction each point is actually moving"


---

## §6 --- Constraint callouts

1. **C1 (BINDING) -- `theta0_rad` = 1.739 for S3, not REV 4's 0.168.** REV 4's azimuth solve
   was derived in the wrong rotation-convention sign and lands the primary aha's only mover on
   the sweep's screen-travel MINIMUM (purely vertical, roughly 40 px at 1080 h) instead of its
   near-maximum (purely horizontal, roughly 75 px). Corrected formula: `theta0_rad = ((pi/2 -
   theta_cam) - omega0*(t_engage + t_decay/2)) mod pi`, `theta_cam = pi/4` (`:50477`).
   Substituting S3's own numbers (t_engage = 4.5, t_decay = I0*omega0/tau =
   3.06x1.50/2.00 = 2.295) gives `theta0_rad` = 1.739 -- verified independently in this pass by
   direct camera projection, not by re-deriving the algebra alone (see the report to the
   founder). `json_author` must author `theta0_rad: 1.739` on S3 and 0 (default, omit)
   everywhere else.
2. **C1's two dependent corrections, carried (for json_author/quality_auditor to read against
   REV 4, not edits to the skeleton itself):**
   - The FIX-CYCLE-2 RESPONSE table's B3 row claims the uncorrected value puts the rod at
     "alpha = 90 degrees" ("vs REV 3's alpha roughly 80 degrees by luck"). Both numbers are
     wrong: the uncorrected 0.168 lands the rod near alpha = 0 degrees off the line of sight
     (the worst case), not 90. The true 90-degree broadside condition is achieved ONLY by the
     corrected `theta0_rad = 1.739` (verified algebraically: theta_stop mod pi equals
     pi/2 minus theta_cam exactly at the corrected value, and only there).
   - The S3 pin-table's frozen-frame parenthetical ("rod ACROSS the view, theta0 solve") is
     TRUE of the 9.0-16.2 s dense slide window, but FALSE of the 19500 ms pin itself -- by then
     the platform has resumed spinning for 1.5 s post-restart (from 18000 ms), advancing the
     rod roughly 2.25 rad (roughly 129 degrees) past the broadside stop pose. The S3 row in
     §3 above states this explicitly.
3. **C2 documented (no timing values change).** The stated rule "every phase boundary sits at
   its sentence's cumulative end" is true ONLY of S1. S2's `rbr_l_arrow` phase at 12600 ms is
   `engage_at_ms + 1000` (a motion-anchored beat, holding the pad focal a beat after the cause --
   correct 32a practice); S3's phases at 3900/9000/17500 are pad-travel-start / ramp-start /
   restart (all motion-anchored). **The real rule for any future recomputation: a phase
   anchored to a MOTION event moves with that event; only a sentence-anchored phase (S1's) moves
   with the words.** This pass changes no S2/S3 phase instant.
4. **C3 taken.** S2's `pad_travel_ms` shortened 6800 to 2200 ms (within the founder's suggested
   2.0-2.5 s band), travel window still ending exactly at `engage_at_ms` (11600). Cost: none --
   no reveal-candidate field is touched, so the pin (20400) is unaffected. Benefit: the retract
   now finishes at 20600 ms (well inside R roughly 22 s) instead of running to roughly 25200 ms
   past the state's natural end -- exactly the "caught mid-path" problem the founder named. The
   pin's frozen-frame description is corrected: the pad is roughly 91 percent retracted at
   20400 ms, not "mid-retract."
5. **Rounding.** 2 dp everywhere, matching the sibling's convention on the same machine.
6. **One noun for the apparatus.** "Turntable" in every reader-facing string -- never "brake
   drum"/"platform"/"disc". Internal engine field names (`brake_drum_radius_m`) are not reader-
   facing and may keep "drum".
7. **S2 transient coincidence (A12) -- not a defect.** L sweeps through 3.06 at t roughly
   15.0 s absolute state time, momentarily equal to the constant `I` readout (hold-glowed the
   whole state). Different instruments, different units; no pin lands there. **No narration
   clause and no glow may stage an L-vs-I comparison at that instant** -- none does in §4's
   sentences above.
8. **Arrow-length floor (F-C2) -- why S3 hides the arrow.** `RBR_L_ARROW_MIN` = 0.22 world
   units (`:49797`): any |L| below roughly 1.10 kg.m^2/s would draw a nonzero visible stub, and
   L = 0.00 throughout most of S3 would be a rendered lie about the state's own subject.
   `show_l_arrow: false` in S3 only; the L story rides the readout + both chips instead. Every
   OTHER guided state's arrow length is exactly proportional and inside the floor with margin:
   home |L| = 4.59 to 0.918 world units; S2 held |L| = 1.53 to 0.306; S4 |L| = 4.59 (either
   sign) to 0.918. All comfortably inside [0.22, 1.80].
9. **Sign-colour convention** -- inherited from the already-built engine constants
   (`RBR_POS_COLOR` = cool blue for spin_sign +1, `RBR_NEG_COLOR` = warm amber for -1,
   `:49751-49752`), identical to the sibling concept on the same machine. No new convention to
   author; json_author binds nothing extra -- the arrow and the signed HUD digits pick these up
   automatically from `spin_sign`.
10. **ASCII-minus.** S4 Run B and S5's direction toggle are the first states in THIS concept to
    print a negative number. `rbrFx` already routes every readout through a real Unicode minus
    (U+2212) and kills negative-zero (`:49812-49823`) -- no additional authoring action is
    needed; flagged here only so json_author does not add a redundant post-process.
11. **Brake source formula.** tau_ext = -sign(omega) times tau_brake while engaged; the rest
    clamp acts on L only, never on the derived omega; the brake never reverses spin at any
    authored value (0.45 in S2, 2.00 in S3 -- both strictly inside [0, 2.0]).
12. **r's global entry default is 0.80**, used at every state's entry except S3's slide phase
    (which the state itself authors as an explicit `param_ramp`, never a silent override).
13. **omega0 and spin_sign are restart/seed-only parameters** -- wired to (re)set L only at
    t = 0 (S1) and at explicit restart events (S3's single relaunch, S4's cut, S5's live
    m/omega0/direction change), never applied as a continuous per-frame drive during an
    ordinary state.
14. **Notation ladder (Rule 38c) -- verified compliant.** The only formula surface anywhere in
    this concept is `L = I.omega` (S1/S2/S3/S5, algebra-only; S4 has none by design, A5/34b --
    "the picture is the lesson"). L = r x p never appears -- the advanced ring is blocked and
    absent, per REV 4 §10(i).
15. **Dialect (38d).** "angular momentum", "angular speed" read identically across
    CBSE/JEE/NEET/IB/A-level/AP; one dual-label at first use: S1 T2, "moment of inertia
    (rotational inertia)" -- then bare "moment of inertia" (or bare "I" once the symbol is
    established) everywhere after. Apparatus noun "turntable" everywhere (constraint 6).
16. **F-C1/F-C2/F-C3 sandbox exclusions, restated.** S5 authors no `tau_brake` control (a live
    drag would apply real torque while the pad stays invisible/parked -- F-C1) and no `r`
    control (would pre-spoil the sibling's conservation aha -- the r-hazard ruling). Both
    exclusions are silent by omission from `controls_visible`, per `rbrSliderTokensUsed()`'s
    union-of-authored-tokens logic (`:50015-50025`) -- neither row is ever built for this
    concept.

---

**DC Pandey check:** every formula, narration line and anchor above derives from L = I.omega,
I = I_frame + 2mr^2, and the rest-clamped decay/restart laws directly -- no teaching sequence,
worked example, or figure imported from any book. The merry-go-round (S1) and bicycle-wheel
(S4) anchors are the architect's own universal (Rule 35), state-assigned choices; nothing added
here beyond the reserved word budgets.

*Phase 0b for `angular_momentum` is COMPLETE (skeleton REV 4 `DESIGN_OK` + this block, with C1
carried as BINDING and C3 taken). Next: `alex:json_author` on `feat/rotmech-c` -- pure JSON, the
`rigid_body_rotation` scenario is built and merged, no engine dispatch is needed or authorized.*
