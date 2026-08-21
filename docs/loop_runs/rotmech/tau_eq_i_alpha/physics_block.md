# PHYSICS BLOCK — `tau_eq_i_alpha` (rotmech · Class 11 Ch.7 · Phase-0b, Desk D)

> Produced by `alex:physics_author` 2026-08-04, against **skeleton REV 2** (`skeleton.md`) after
> founder-proxy Checkpoint A cycle 2 returned **`DESIGN_OK`** (`founder_proxy_A_cycle2.md`), with ONE
> P1 carried by explicit instruction. This block lands all five carry-forwards named in that report's
> Handoff: **P1-A** (the tau readout must display the NET RESOLVED torque, never the authored schedule
> value), **P2-A** (pin budgets recomputed past actuator retraction), **P2-B** (fallback ring line),
> **P3-3/P3-4/P3-6/P3-7** (wording fixes), and the standing **P2-5** instruction (S5 reads 4.64 off the
> instruments only). Per `docs/loop_runs/rotmech/_engine/findings_d.md` — **PASS 2 LANDED, the freeze
> source for build 0c-3** — where that file and the skeleton disagree, the file wins; this block
> consumes its ruled alpha metric (section 1) and its binding `tau`-row semantic (section 2) by
> reference and restates them only where the concept needs concept-specific numbers. **NO CONCEPT JSON
> IS AUTHORED FROM THIS BLOCK until the 0c-3 `field3d-surgeon` PR merges** (desk guardrail, unchanged).

---

## Section 1 — Variables, formulas, constraints

### `physics_engine_config.variables`

```json
{
  "variables": {
    "r": {
      "name": "Radius of each sliding mass from the axle - a RESTART-SEED-ONLY pose in every guided state (never ramps concurrently with an engaged torque in S1-S7); live-drivable only in S8",
      "unit": "m",
      "min": 0.15, "max": 0.90, "default": 0.80, "step": 0.01
    },
    "m": {
      "name": "Mass of each sliding mass (two, symmetric about the axle) - fixed at 2.0 kg in every guided state; live-drivable only in S8 (a change RESTARTS)",
      "unit": "kg",
      "min": 0.5, "max": 5.0, "default": 2.0, "step": 0.1
    },
    "omega0": {
      "name": "Seed angular speed magnitude at state entry / restart - sets omega at t=0 for a state or an S5 run-cut / S8 restart; NEVER applied as a continuous drive (that is tau_app's job). Floor lowered 0.5 -> 0 at BOTH RBR_SLIDER_SPEC.omega0.min and the live-write guard (item B / D2, shared item 4) so S4/S5/S7 can seed from rest",
      "unit": "rad/s",
      "min": 0, "max": 3.0, "default": 1.5, "step": 0.1
    },
    "omega": {
      "name": "Live angular speed - the DERIVED quantity omega = L/I, recomputed every step; never itself an independent variable or slider",
      "unit": "rad/s",
      "min": null, "max": null, "default": null,
      "derived": "omega = L / I"
    },
    "tau_app": {
      "name": "Applied drive torque magnitude via the motor drive wheel at the rim (D5) - the TAUGHT variable; the wheel translates in and its rim arrow tracks this value; contact = the engage instant. Core-ring control at S8. Under the P1-8 DECLARED FALLBACK (simultaneity ruled out of scope), this token becomes the signed range [-2.0, +2.0] and the drive-vs-brake tug is cut (P2-B: the negative half is then extended-ring content, cut with S6 under core_only, exactly as tau_brake is today - never surfaced unring-gated)",
      "unit": "N*m",
      "min": 0, "max": 2.0, "default": 1.53, "step": 0.01
    },
    "tau_brake": {
      "name": "Brake torque MAGNITUDE (a capacity) while the pad is engaged against the drum rim - frictional: opposes the EXISTING sign of omega, decelerates only, never reverses at any reachable value. Per-concept slider override via config.slider_controls (default/step raised from the sibling desk's 0.92/0.05 to 1.53/0.01 so the S6 numbers are exactly reachable) - [LIVE], :50005-50014",
      "unit": "N*m",
      "min": 0, "max": 2.0, "default": 1.53, "step": 0.01
    },
    "I_frame": {
      "name": "Fixed inertia of the turntable + rod, excluding the two sliding masses",
      "unit": "kg*m^2", "constant": 0.50
    },
    "R_drum": {
      "name": "Braked / driven radius - where the pad and the motor drive wheel both contact the turntable's rim",
      "unit": "m", "constant": 0.55
    },
    "rod_half_length": {
      "name": "Rod half-length - apparatus geometry only, not a formula input",
      "unit": "m", "constant": 1.0
    },
    "rod_height_above_pad": {
      "name": "Vertical clearance of the rod plane above the drum's pad plane - apparatus geometry only",
      "unit": "m", "constant": 0.25
    },
    "alpha": {
      "name": "Angular acceleration - the per-step finite difference (omega_k - omega_k_minus_1)/h on the fixed 16 ms grid, published from the SAME post-step snapshot as I/omega/tau, blanked across every re-pin/restart window. THE SHARED CHAPTER DEFINITION, ruled at findings_d.md section 1 - this concept's own REV-1 spec is the winning form; the sibling rotational_kinematics consumes it by reference and has retired its analytic tau/I form. Equal to tau_net/I exactly whenever I is constant (every guided beat here - r never ramps concurrently with a torque)",
      "unit": "rad/s^2",
      "min": null, "max": null, "default": null,
      "derived": "alpha = (omega_k - omega_k_minus_1) / h"
    },
    "tau": {
      "name": "Net torque displayed on the HUD. BINDING SEMANTIC (P1-A, founder-proxy Checkpoint A cycle 2 / findings_d.md section 2): displays the NET torque the integrator ACTUALLY RESOLVED at t -- the same signed value the closed form used, including the brake's -sign(omega) factor and the static-hold zero -- NEVER the authored schedule value. It therefore satisfies tau = I*alpha IDENTICALLY on the HUD at every instant, including S6's rest clamp (tau -> 0.00 with alpha -> 0.00 while the pad stays engaged) and S8's static hold (tau_net -> 0.00 while the wheel is held at rest). This supersedes the skeleton's own readout-metrics sentence, which described tau as 'the signed authored schedule value' -- that description is WRONG wherever the rest clamp or the S8 static hold is active and must not be carried into json_author's build",
      "unit": "N*m",
      "min": null, "max": null, "default": null,
      "derived": "tau = I * alpha (identically, at every instant, by construction of the P1-A remedy)"
    }
  }
}
```

**`g` is deliberately ABSENT** - same justification as `conservation_of_angular_momentum` on the
identical apparatus: a vertical axle in a horizontal plane means gravity is parallel to the rotation
axis at every mass's position, so it contributes zero torque about that axis. No formula in this
concept references g; json_author omits the key entirely.

**`spin_sign` is NOT a variable of this concept.** Every authored torque in every guided state acts in
the same, positive spin sense (the sign law itself - a torque opposing an *existing* spin - is taught
through the sign of alpha and tau at S6, via a friction brake, never via a reversed drive). Direction /
grip-rule content is out of scope (section 10c, N/A by scope) and stays the sibling's opening beat.

### Category summary (live-drivable / restart-seed-only / fixed constant / HUD-derived)

| Variable | Category | Where live | Where seed/entry-only |
|---|---|---|---|
| r | Restart-seed-only in S1-S7; live-drivable in S8 | S8 (trusted-drag) | S1-S3,S6-S7 = 0.80 . S4 = 0.50 . S5 run A = 0.80, run B = 0.20 |
| m | Restart-seed-only, fixed at 2.0 everywhere in S1-S7 | S8 only (a change RESTARTS) | every guided state, defensively locked |
| omega0 | Restart-seed-only | S8 (live restart) | S1/S2/S6/S8 entry = 1.50 . S4/S5/S7 entry = 0 . S3 entry = 5.56 (P1-7 continuity) |
| omega | Derived, never a variable | recomputed every step everywhere (omega = L/I) | n/a |
| tau_app | Live-drivable (guided-state schedule) | S2-S5(both runs)/S7 . S8 (live drag, the taught variable) | -- |
| tau_brake | Live-drivable | S6 (schedule) . S8 (live drag, extended ring) | -- |
| alpha, tau | HUD-derived, never authored | recomputed/resolved every step everywhere (D3) | blanked across every re-pin/restart window |
| I_frame . R_drum . rod_half_length . rod_height_above_pad | Fixed apparatus constants | never adjustable | -- |
| g | Not used -- see justification above | n/a | n/a |

### physics_engine_config.formulas

```json
{
  "formulas": {
    "newtons_second_law_rotational": "tau_net = I*alpha -- the ONE law this concept teaches. Closed form: L(t+h) = L(t) + tau_net_resolved(t)*h (accumulator-free; rest clamp acts on L only, held at EXACTLY 0, sign(L) never consulted); omega(t) = L(t)/I(t) recomputed every step; alpha(t) = (omega_k - omega_k_minus_1)/h on the fixed 16 ms grid (findings_d section 1, ruled) -- equal to tau_net_resolved/I exactly whenever I is constant, true of every guided beat here.",
    "drive_torque_source": "tau_drive_term = +tau_app while the motor drive wheel is in contact (engage = contact, D4); 0 otherwise. Never authored to run against the existing spin direction in this concept guided states -- the sign law is taught by the BRAKE (S6), not by a reversed drive.",
    "brake_torque_source": "tau_brake_term = -sign(omega)*tau_brake while the pad is engaged (frictional, opposes the EXISTING spin only); 0 otherwise. Can only decelerate toward rest; never reverses spin at any reachable tau_brake value.",
    "net_torque_resolved": "tau_net_resolved(t) = sum of every currently-engaged source signed contribution, INCLUDING the S8 static-hold case: while the brake is engaged and the drive magnitude is at most tau_brake, tau_net_resolved = 0 exactly (static hold with breakaway, sign(L) never consulted at L=0) -- this resolved value, never the raw authored schedule, is what the tau HUD row displays (P1-A).",
    "drive_force_at_rim": "F_drive = tau_app / R_drum -- the rim tangential force arrow printed label. S2: 2.78 N at R_drum = 0.55 m gives 2.78*0.55 = 1.53 N*m. S4: 1.09 N gives 1.09*0.55 = 0.60 N*m. The P1-5 compute-never-merely-name recipe.",
    "moment_of_inertia": "I(t) = I_frame + 2*m*r(t)^2 -- two symmetric sliding masses, algebra-only. S1-S3/S6-S7/S5-run-A: I(0.80) = 0.50 + 2*2.0*0.64 = 3.06. S4: I(0.50) = 0.50 + 2*2.0*0.25 = 1.50. S5-run-B: I(0.20) = 0.50 + 2*2.0*0.04 = 0.66. Held fixed for the duration of any engaged torque.",
    "predicted_speed_kinematics_patch": "omega = omega0 + alpha*t -- the one-breath S4 kinematics patch, spoken only, never a second formula surface (Rule 34b).",
    "per_particle_derivation": "S7 only, advanced ring: F_t = m*r*alpha = 2.0*0.80*0.50 = 0.80 N per mass, equal by symmetry; tau_per_mass = m*r^2*alpha = 2.0*0.64*0.50 = 0.64 N*m; tau_frame_term = I_frame*alpha = 0.50*0.50 = 0.25 N*m; tau = (Sigma m*r^2 + I_frame)*alpha = 0.64 + 0.64 + 0.25 = 1.53 = I*alpha exactly."
  }
}
```

### Constraints

- tau_net = I times alpha identically, at every instant -- including the rest clamp and the S8 static
  hold. The tau readout displays the RESOLVED value the integrator used, never the authored schedule
  value (P1-A, binding). Any state where a HUD frame prints tau not equal to I times alpha to display
  precision is a defect.
- alpha is the per-step finite difference of omega on the fixed 16 ms grid, blanked across every
  re-pin/restart window (findings_d section 1, ruled); never an independently integrated quantity.
- The brake is frictional: opposes the existing sign of omega, decelerates only, never reverses spin
  at any reachable tau_brake value. A sustained DRIVEN opposing torque genuinely CAN reverse a spin
  (real physics, out of this concept scope, owned by the sibling sandbox) -- do not plant the belief
  that an opposing torque can never reverse a spin (P1-4).
- I(t) = I_frame + 2 times m times r(t)^2 is held fixed for the duration of any engaged torque in
  every guided state -- r changes only between drives, never concurrently with an engaged torque.
- omega = 0 with both drive and brake engaged (S8) is a static hold with breakaway, not a limit case:
  while the brake magnitude is at least the drive, L is held at exactly 0 and sign(L) is never
  consulted; when the drive exceeds the brake, breakaway is smooth, no limit-cycle chatter.
- r is in the range 0.15 to 0.90 m; every authored pose (0.20, 0.50, 0.80) sits strictly inside it.
- tau_app, tau_brake are in the range 0 to 2.0 N.m as magnitudes; under the P1-8 declared fallback
  tau_app becomes the signed range -2.0 to +2.0, and its negative half is extended-ring content --
  never surfaced under core_only (P2-B).
- The taught law is a proportion, never an equality of magnitude across states: the SAME tau
  (1.53 N.m) produces different alpha depending on I -- no narration states or implies same torque,
  same acceleration.

### Ground-truth numeric table (re-derived from the apparatus contract; matches skeleton REV 2)

| State / config | r (m) | I (kg.m^2) | tau_net (N.m) | alpha (rad/s^2) | omega trajectory |
|---|---|---|---|---|---|
| Home (S1, S2 entry, S6, S8 entry) | 0.80 | 3.06 | S1: 0.00 | S1: 0.00 | S1: constant 1.50 |
| S2 (drive engages 4.89 s) | 0.80 | 3.06 | +1.53 | +0.50 | 1.50 -> 5.56 at state end |
| S3 (continuity entry) | 0.80 | 3.06 | +1.53 -> 0 at 2.0 s | +0.50 -> 0.00 | entry 5.56 -> 6.56 -> held |
| S4 (fresh numbers) | 0.50 | 1.50 | +0.60 | +0.40 | 0 -> 1.20 in 3.0 s |
| S5 run A | 0.80 | 3.06 | +1.53 | +0.50 | 0 -> 1.25 in 2.5 s |
| S5 run B | 0.20 | 0.66 | +1.53 (same) | +2.32 (2.3182) | 0 -> 5.80 in 2.5 s |
| S6 decay | 0.80 | 3.06 | -1.53 | -0.50 | 1.50 -> 0.00 in 3.0 s |
| S6 rest clamp (t >= 4.5 s) | 0.80 | 3.06 | 0.00 (P1-A) | 0.00 | held 0.00 |
| S7 (derivation replay) | 0.80 | 3.06 | +1.53 | +0.50 | 0 -> 1.50 in 3.0 s |

Cross-checks (re-derived, all confirmed): 1.53/3.06 = 0.5000 exact . 0.60/1.50 = 0.4000 exact .
1.53/0.66 = 2.31818 -> 2.32 . run A 0.50x2.5 = 1.25 . run B 2.3182x2.5 = 5.7955 -> 5.80 . equal-time
speed ratio 5.7955/1.25 = 4.6364 -> 4.64 = I ratio 3.06/0.66 = 4.6364 = alpha ratio
2.3182/0.50 = 4.6364 (all three routes agree, forced by the contract own poses, genuine coherence).
Drive-force recipe: F = tau/R_drum: 1.53/0.55 = 2.7818 -> 2.78 N (S2); 0.60/0.55 = 1.0909 -> 1.09 N
(S4). S2 end omega = 1.50 + 0.50x(13 - 4.89) = 5.56; S3 end = 5.56 + 0.50x2.0 = 6.56. S7 ledger:
2.0x0.64x0.50 = 0.64 per mass, x2 = 1.28, frame 0.50x0.50 = 0.25, total 1.53, exact. No two
co-visible readouts in any state share a value. Cross-apparatus scan against
conservation_of_angular_momentum: no collision (headline sets disjoint, clean).

---

## Section 2 -- Per-state variable notes: entry configs + overrides

General rule (governs every guided-state entry, per the field3d 0c-1 mechanism): on state entry the
engine hard-sets (r, omega-seed, tau_app-schedule, tau_brake-schedule) to that state authored ENTRY
CONFIG in a single frame; L is then whatever I(r) times omega computes to at that instant. S3 entry
is mechanically identical to every other state -- it simply hard-sets omega to the SAME numeric value
S2 held at its end, so nothing visibly changes across the cut (P1-7). Per the hinge_force.json /
field_forces.json defensive pattern (guard the recorded default_variables_only_first_var_merged
failure mode), every state declares m: 2.0 explicitly, even though it never changes in a guided state.

| State | variable_overrides | Justification |
|---|---|---|
| S1 | m 2.0, r 0.80, omega0 1.50, tau_app 0, tau_brake 0 | Baseline: turntable already spinning, no torque. Defensive m lock per the historical leak. |
| S2 | m 2.0, r 0.80, omega0 1.50, tau_app 1.53 (engage 4.89 s, release omitted), tau_brake 0 | Same free-spin baseline as S1; the drive engages mid-state. |
| S3 | m 2.0, r 0.80, omega0 5.56 (P1-7, hard-set equal to S2 held end), tau_app 1.53 (engaged AT entry, released at 2.0 s), tau_brake 0 | The one non-home entry; continuity is by NUMBER, mechanism is the same single-frame re-pose as every other state. |
| S4 | m 2.0, r 0.50, omega0 0 (from rest, item B/D2), tau_app 0.60 (engage 3.9 s), tau_brake 0 | Fresh rig, fresh numbers, none reused from S2. |
| S5 run A | m 2.0, r 0.80, omega0 0, tau_app 1.53 (engage 0.5 s), tau_brake 0 | Reuses S2 tau and home r deliberately as CONTINUITY, not verification -- a fresh from-rest run. |
| S5 run B (D6 run-script cut at 3.5 s) | r 0.20, omega0 0 (re-seed at the cut), tau_app 1.53 (engage 4.7 s), tau_brake 0 | The ONE variable that changes between runs is r -- the comparison whole point. |
| S6 | m 2.0, r 0.80, omega0 1.50, tau_app 0, tau_brake 1.53 (engage 1.5 s; slider default/step overridden via config.slider_controls) | Home pose, brake-only state. |
| S7 | m 2.0, r 0.80, omega0 0 (re-seed to rest for the replay), tau_app 1.53 (engage 4.5 s), tau_brake 0 | Positive-spin baseline needed regardless of S6 exit state. |
| S8 | m 2.0, r 0.80, omega0 1.50, tau_app 0, tau_brake 0 (sandbox defaults; ALL live) | Home pose per contract; no idle sweep. |

---

## Section 3 -- Within-state motion timeline + per-state control spec (Rule 31)

Glow-target glossary: drive_wheel . drive_arrow . brake_pad . R_drum_line . r_line . I_readout .
omega_readout . alpha_readout . tau_readout . predicted_omega_chip . run_A_chip . formula_surface .
sliding_masses . turntable_body . Ft_arrows (S7 only).

Beat-termination contract (unchanged from the skeleton, restated for the build): S3-S7 are ONE-SHOT
-- each drive/decay ends and HOLDS its end configuration for the remainder of the state. S2 is
deliberately NOT hold-terminated -- its climb IS the state claim, an engage with release_at_ms
omitted. S6 is the only decaying-to-rest state (not a loop). S8 is Rule-37 free-running.

Readout metrics (canonical, per findings_d section 1/2 -- restated here with the P1-A correction,
which supersedes the skeleton own metric sentence): I = I_frame + 2*m*r^2, recomputed live. omega =
L/I, derived every step. alpha = the per-step finite difference of omega on the fixed 16 ms grid,
published from the same post-step snapshot as I/omega/tau; blanked during every re-pin/restart
window. tau = the NET RESOLVED torque the integrator actually used at t -- never the authored
schedule value; equal to I*alpha identically at every instant, by construction, including S6 rest
clamp and S8 static hold.

### P2-A -- pin-margin discipline, recomputed past actuator retraction (carried instruction, landed)

The wheel retraction is animated over pad_travel_ms (approximately 700 ms, authored explicitly, not
the 1200 ms engine default). The skeleton original pin budgets stopped at the RELEASE instant; three
states (S4, S5, S7) declared HELD were pinning 43-86 percent through that retraction. Recomputed here
with the last asserted event equal to release + 700 ms travel + up to a 2-step discrete lag (0.033 s):

| State | Last asserted event (recomputed) | State duration | Pin at 0.60R | Margin |
|---|---|---|---|---|
| S1 | readouts built about 4.4 s (no actuator) | at least 8 s | 4.8 s | 0.4 s OK |
| S2 | none -- monotone climb by design; pin photographs mid-climb (claim-by-construction) | at least 13 s (author 13) | 7.8 s | claim-by-construction OK |
| S3 | withdraw 2.0 s + 0.7 s travel + lag, park 2.73 s | at least 8 s | 4.8 s | 2.07 s OK (comfortably clear) |
| S4 | match+withdraw 6.9 s + 0.7 s + lag, park 7.63 s | 14 s (was 12) | 8.4 s | 0.77 s OK |
| S5 | run-B withdraw 7.2 s + 0.7 s + lag, park 7.93 s | 14 s (was 13) | 8.4 s | 0.47 s OK -- pin still photographs chip 1.25 beside live 5.80 |
| S6 | rest clamp 4.5 s + lag (no retraction, pad stays engaged) | at least 10 s | 6.0 s | 1.47 s OK |
| S7 | replay end 7.5 s + 0.7 s + lag, park 8.23 s | 15 s (was 13) | 9.0 s | 0.77 s OK |

json_author: author pad_travel_ms explicitly on every actuator-using state (it is a LIVE field,
:1006, but D4 scriptable-knob list omitted it -- P3-5) so this margin table is enforceable, not merely
descriptive. THE EYE reads DENSE frames across the S2/S4/S5/S6 drive/decay windows, not only the
frozen pins, and must assert every actuator mesh sits at either its park or its contact pose within
one grid step at the pin -- never strictly between them (the candidate scar row filed at Checkpoint A).

### S1 -- No torque: spin rate unchanged -- core -- none live -- duration at least 8 s, pin at 4.8 s

Entry: r = 0.80, omega = +1.50, no torque. Turntable already spinning (never a cold start).

| t-window | What animates | Driven by |
|---|---|---|
| 0-8000 ms (whole state) | Turntable + masses spin continuously at omega = 1.50 | omega (constant) |
| 0-1000 ms | I_readout builds: I = 3.06 kg.m^2 | I(0.80) |
| 1000-2000 ms | omega_readout builds: omega = 1.50 rad/s | omega |
| 2000-3000 ms | tau_readout builds: tau = 0.00 N.m | resolved tau (P1-A) |
| 3000-4000 ms | alpha_readout builds: alpha = 0.00 rad/s^2 | resolved alpha |
| 4000 ms to end | HELD -- omega readout hold-glow steady, nothing moves it | -- |

Controls: none. Margin 0.4 s OK. Delta cue (P3-3, corrected): "No torque: spin rate unchanged" --
supersedes the skeleton uncorrected "No torque: spin unchanged" (the response table claimed the
spin-to-spin-rate conversion covered every cue; it missed this one).

### S2 -- Torque on: spin rate climbs -- core (PRIMARY aha, misconception_confrontation) -- none live -- duration at least 13 s, pin at 7.8 s

Entry: r = 0.80, omega = +1.50, drive engages at 4.89 s.

| t-window | What animates | Driven by |
|---|---|---|
| 0-4190 ms | Pre-roll: one full slow revolution at omega = 1.50 (2 pi / 1.50 = 4.19 s) | omega |
| 4190-4890 ms (700 ms, cause) | drive_wheel translates in from park to the rim, visibly turning as it approaches | authored travel |
| 4890 ms | Contact = engage. drive_arrow appears AT the contact patch, labelled F = 2.78 N; tau engages at +1.53 -- no frame before this draws a force while tau reads 0.00 (P1-1) | engage cue |
| 4890 ms to 13000 ms (effect, unbounded) | omega climbs at exactly 0.50/s -- 1.50 to 2.00 to 3.00 to 5.56 at state end, never settling; alpha_readout sits CONSTANT at +0.50 (the steady thing); tau_readout steady at +1.53 (resolved equals authored here, the drive is genuinely acting, no clamp) | tau_net = +1.53 (constant, I constant) |

Controls: none. Margin: claim-by-construction OK (non-terminating by design).

### S3 -- Torque off: spin rate stays -- core -- none live -- duration at least 8 s, pin at 4.8 s

Entry: r = 0.80, omega = +5.56 (P1-7 continuity), drive engaged AT entry (wheel already in contact).
Declared contrast pair of S1: S1 holds the never-driven rate 1.50; S3 holds a driven-up rate 6.56.

| t-window | What animates | Driven by |
|---|---|---|
| 0-2000 ms | Drive still engaged: omega climbs 5.56 to 6.56, alpha_readout steady +0.50, tau_readout steady +1.53 | tau_net = +1.53 |
| 2000 ms (cause to effect boundary) | drive_wheel withdraws (release cue), drive_arrow leaves with it | release cue |
| 2000 ms + travel, park 2.73 s | Wheel completes its 0.7 s retraction; alpha_readout and tau_readout snap to 0.00 the instant the source disengages (resolved value, not the wheel travel state) | resolved tau_net to 0 |
| 2730 ms to 8000 ms | HELD -- omega stays exactly 6.56; nothing slows it | -- |

Controls: none. Margin 2.07 s OK (retraction-corrected, see P2-A table).

### S4 -- Equation predicts the speed -- core (quantitative) -- none live -- duration at least 14 s (P2-A), pin at 8.4 s

Entry: r = 0.50 (fresh pose), omega = 0 (from rest, item B), drive engages at 3.9 s.

| t-window | What animates | Driven by |
|---|---|---|
| 0-1200 ms | Fresh rig visible: masses at mid-rod, r_line labelled 0.50 m | authored reveal |
| 1200-2200 ms | I_readout builds via the COMPUTING patch: 0.50 + 0.50 + 0.50 = 1.50 (frame + each 2 kg mass at 0.50 m) | I(0.50) |
| 2200-2800 ms | formula_surface appears whole: tau = I alpha | authored reveal |
| 2800-3200 ms | predicted_omega_chip stamps: predicted omega = 1.20 after 3 s | chip form |
| 3200-3900 ms (700 ms, cause) | drive_wheel travels in; contact = engage at 3.9 s; drive_arrow appears, F = 1.09 N (the S2 recipe repeated: 1.09 x 0.55 = 0.60) | authored travel |
| 3900-6900 ms (3000 ms, effect) | omega sweeps 0.00 to 1.20; alpha_readout constant +0.40; tau_readout constant +0.60 | tau_net = +0.60 (I fixed) |
| 6900 ms | Match cue: omega_readout meets predicted_omega_chip (latch, tolerance 0.01), co-glow | omega meeting the chip |
| 6900-7630 ms (700 ms) | Wheel withdraws to park; alpha, tau snap to 0.00 at release (6900 ms), independent of the travel completing | release cue |
| 7630 ms to 14000 ms | HELD at omega = 1.20, chip + readout glow sustained | -- |

Controls: none. Margin 0.77 s OK (P2-A).

### S5 -- More inertia: less acceleration -- core (SUPPORTING aha, misconception_confrontation) -- no live control in the guided beat -- duration at least 14 s (P2-A), pin at 8.4 s

Entry run A: r = 0.80, omega = 0 (rest), drive engages at 0.5 s.

| t-window | What animates | Driven by |
|---|---|---|
| 0-500 ms (cause) | drive_wheel travels in, contact = engage at 0.5 s | authored travel |
| 500-3000 ms (2500 ms, effect) | omega sweeps 0.00 to 1.25; alpha_readout constant +0.50 | tau_net = +1.53, I = 3.06 |
| 3000 ms | Wheel withdraws; run_A_chip stamps "run A: omega = 1.25" beside the omega readout (held, static) | release + chip |
| 3500 ms (D6 run-script cut) | Re-pin cue: readouts BLANK at least 0.5 s; masses re-pose to r = 0.20 in the blanked single frame | restart trigger |
| 4000-4700 ms (700 ms, cause, run B) | The SAME wheel travels back in; contact = engage at 4.7 s | authored travel |
| 4700-7200 ms (2500 ms, effect, run B) | omega climbs 0.00 to 5.80; alpha_readout constant +2.32; I_readout reads 0.66 | tau_net = +1.53 (same), I = 0.66 |
| 7200 ms | Wheel withdraws; run_A_chip (1.25) stays visible beside the live omega (5.80), the whole comparison in one frame | release cue |
| 7930 ms | Wheel completes retraction (park, P2-A) | travel end |
| 7930 ms to 14000 ms | HELD -- chip 1.25 beside live 5.80, alpha 2.32, I 0.66 | -- |

Controls: none in the guided beat (the state is a scripted two-run comparison, not a live drag).
Margin 0.47 s OK (P2-A). P2-5 instruction, standing (carried forward, not re-litigated): S5 narration
reads the 4.64 factor off the instruments only -- I is 4.64x smaller, alpha is 4.64x larger. Never
invite an r-squared computation; the frame inertia dilutes r-squared (the why is moment_of_inertia
own job).

### S6 -- Friction brake: negative alpha -- extended -- brake-torque slider live -- duration at least 10 s, pin at 6.0 s

Entry: r = 0.80, omega = +1.50, brake pad engages at 1.5 s.

| t-window | What animates | Driven by |
|---|---|---|
| 0-1500 ms (cause) | brake_pad translates in to the drum; R_drum_line drawn/labelled distinct from r_line | authored travel |
| 1500 ms | Pad makes contact -- tau_net becomes -1.53 (this IS a resolved, actually-exerted torque: the pad is doing real kinetic-friction work against a spinning wheel) | brake engagement |
| 1500-4500 ms (3000 ms, effect) | omega falls 1.50 to 0.00 at the same rate S2 added speed, opposite sign; alpha_readout constant -0.50; tau_readout constant -1.53 | tau_net = I*alpha = 3.06 x (-0.50) |
| 4500 ms (rest clamp) | omega reaches exactly 0.00 and holds. alpha_readout returns to 0.00, and tau_readout ALSO reads 0.00 from this instant on (P1-A) -- the pad still physically touches the rim, but with nothing driving against it, the resolved net torque is zero: a capacity, not an exerted torque | rest clamp -- tau_net_resolved = 0 |
| 4500 ms to 10000 ms | HELD at omega = 0.00, alpha = 0.00, tau = 0.00, pad visibly still in contact | -- |

Controls: brake-torque slider, range 0 to 2.0 N.m, default 1.53, step 0.01, min_ring extended.
Margin 1.47 s OK -- the pin (6.0 s) lands 1.5 s inside the rest-clamp window, which is exactly why
P1-A had to be corrected before this state could be built: with the SKELETON original metric the
archived frame would have printed tau = -1.53 beside alpha = 0.00 and I = 3.06, contradicting the
atomic claim in its own frozen frame. With the correction, the frame prints tau = 0.00, alpha = 0.00
-- tau = I*alpha holds.

Formula surface (P3-4, corrected): the on-canvas surface at S6 is tau = I alpha, matching S4 form --
NOT tau_net = I alpha. Only one torque acts in S6 (no simultaneous drive), so "net" has no on-screen
referent there; presenting "net" as S6 new idea (as the skeleton own Rule-34 canvas budget line did)
is wrong. S6 actual new idea is the SIGN -- the first negative alpha and tau anywhere in the concept,
which is also its title and delta cue. The word "net" -- and the subscripted surface
tau_net = I alpha -- is reserved for S8, the ONLY state where two sources genuinely combine.

### S7 -- Adding up every particle -- advanced -- none live -- duration at least 15 s (P2-A), pin at 9.0 s

Entry: r = 0.80, omega = 0 (rest, re-seeded regardless of S6 exit), drive engages at 4.5 s.

| t-window | What animates | Driven by |
|---|---|---|
| 0-4000 ms | formula_surface assembles term-by-term: F = ma per particle, then m*(r alpha), then torque m*r^2*alpha, then Sigma: tau = (Sigma m r^2) alpha = I alpha; Ft_arrows (D7) reveal one per sentence, equal by symmetry (0.80 N each), riding the masses | authored reveal, sentence-synced |
| 3800-4500 ms (700 ms, cause) | drive_wheel travels in; contact = engage at 4.5 s | authored travel |
| 4500-7500 ms (3000 ms, effect, slow replay) | omega sweeps 0.00 to 1.50; ledger narrated: 0.64 + 0.64 + 0.25 = 1.53 (the frame 0.25 is the rod own particles, each m r^2 alpha, summed the same way) | tau_net = +1.53, I = 3.06 |
| 7500-8230 ms (700 ms) | Wheel withdraws to park (P2-A) | release + travel |
| 8230 ms to 15000 ms | HELD -- equation complete, arrows steady, ledger sum on screen | -- |

Controls: none. Margin 0.77 s OK (P2-A). Sigma notation appears only here (Rule 38c).

### S8 -- Try it yourself -- explore -- ALL, ring-gated -- open/continuous (Rule 37, never auto-freezes)

Entry: r = 0.80, omega0 = 1.50, tau_app = 0, tau_brake = 0. No idle sweep (the turntable own steady
spin is the until-first-input motion).

| Behavior | What animates | Driven by |
|---|---|---|
| Until first trusted input | Turntable spins steadily at omega = 1.50 | omega (seed, unchanged) |
| tau_app drag (live, the taught variable, D5) | drive_wheel translates in and is in contact whenever tau_app > 0, withdraws at 0; drive_arrow tracks the dragged magnitude; omega integrates the applied torque live | tau_app |
| tau_brake drag (live, extended ring) | brake_pad engages/disengages symmetrically, opposing the current spin | tau_brake |
| Both engaged (the tau_net tug) | alpha_readout shows the difference; at omega = 0 with tau_brake at least tau_app, the wheel is held at rest, L pinned 0, alpha reads 0.00, tau_readout reads 0.00 (P1-A: the same static-hold case as S6 rest clamp, now live and teacher-driven), sign(L) never consulted; when tau_app exceeds tau_brake, smooth breakaway, no chatter | tau_net_resolved |
| r/m drags | Re-shape I live | r, m |
| omega0 change | RESTART with re-pin cue | omega0 |

Controls: ALL, ring-gated -- tau_app (core, the taught variable; under the P1-8 fallback, signed -2.0
to +2.0, and the negative half is min_ring extended, cut with S6 under core_only, P2-B) . r (core) .
m (core) . omega0 (core) . tau_brake (extended, cut with S6 ring; cutting it also cuts the tau_net
tug, leaving tau_app alone as the section-10 teacher-usability first-half demonstration). alpha/tau
readouts blank across every re-pin. Formula surface: tau = I alpha under the primary design (the tug
makes "net" meaningful -- tau_net = I alpha is authorable here specifically because two sources
genuinely combine); under the P1-8 fallback the surface degrades to tau = I alpha since only one
signed source remains (P3-4).

Archetype audit (unchanged from skeleton): null-result-hold x2 (S1/S3, declared contrast pair),
steady-drive (S2), converge-on-mark (S4), two-run-compare (S5), translate-through (S6),
equation-build (S7), drag-sandbox (S8). No repeat beyond the declared pair; no static state.

Explore controls, ring-gated, re-walked including the fallback (P2-B closes this): Hide advanced
(drop S7): S8 keeps all controls, each mapping to a surviving state OK. Hide advanced+extended (drop
S6-S7): S8 keeps tau_app/r/m/omega0; tau_brake is cut with S6 ring OK; under the P1-8 fallback,
tau_app negative half is ALSO cut here (its min_ring extended tag), so the surviving control is
tau_app in [0, 2.0], coherent, matching the primary design cut exactly. S8 formula surface stays
tau = I alpha, stated by S4, core, survives every preset OK.

---

## Section 4 -- Narration (text_en) per state

Every symbol expanded to its spoken name on first use per state (Rule 30); on-canvas labels stay
symbolic. Plain literal English throughout (Rule 41) -- "presses onto"/"presses in" never "grips"
(P3-7); "holds the wheel still" never "grips"; no idiom, metaphor, or personification; forces do not
want, know, try, or resist. Real Unicode minus on every negative reading (Rule 34c). Anchors are
universal (Rule 35), the same merry-go-round the sibling concept uses.

S1 (48 words):
1. "This turntable spins steadily, with two equal masses out on the rod." (12)
2. "Torque tau is a turning push about the axle -- right now there is none." (14)
3. "Angular acceleration alpha is how quickly the spin rate changes each second." (12)
4. "With no torque, alpha stays at zero, and the spin rate omega never changes." (14)

S2 (55 words), cause narrated before effect (Rule 32a), never "free"/"costs nothing":
1. "The drive wheel touches the rim, turning." (6)
2. "Two point seven eight newtons at zero point five five metres gives one point five three newton-metres of torque." (17)
3. "The push stays constant, but the spin rate omega keeps climbing -- past two, past three, never settling." (16)
4. "That steady number is angular acceleration alpha, not the spin rate." (10)
5. Anchor (6): "Like pushing a playground merry-go-round."

S3 (48 words), declared contrast pair of S1 cue:
1. "The drive wheel is still pressing on, and the spin rate omega climbs toward six point five six." (16)
2. "Now the wheel pulls back -- the push is gone." (9)
3. "Torque tau and angular acceleration alpha both drop to zero." (9)
4. "The spin rate omega does not fall -- it holds exactly where the push left it." (14)

S4 (55 words), the four Checkpoint-A cliff patches, computed not merely named (P1-5), plus the
fresh-start clause (P3-6):
1. "A fresh run, from rest, masses moved in." (7)
2. "I is one point five oh: half for the frame, half for each mass." (14)
3. "One point oh nine newtons at the rim gives zero point six oh newton-metres." (14)
4. "Tau equals I times alpha: alpha is zero point four oh; omega reaches one point two oh in three seconds." (20)

S5 (54 words), never invites an r-squared computation (P2-5):
1. "From rest, run A reaches omega of one point two five." (11)
2. "Masses move in to point two oh; same torque, again." (10)
3. "In the same two point five seconds, run B reaches omega of five point eight oh." (16)
4. "Smaller I means alpha is four point six four times larger." (11)
5. Anchor (6): "Like riders near a merry-go-round's edge."

S6 (52 words), the honest friction scope (P1-4) and the corrected verb (P3-7):
1. "The brake pad presses in, touching the rim." (8)
2. "Torque tau now opposes the spin: alpha turns negative, and omega falls steadily to zero." (15)
3. "At rest, the pad holds the wheel still -- tau reads zero, matching alpha." (13)
4. "This brake is friction: it only slows a spin, never reverses it -- a driven torque could." (16)

S7 (51 words):
1. "Newton's second law, per particle: force equals mass times r times alpha." (12)
2. "Each mass needs zero point eight oh newtons of tangential force." (11)
3. "That torque is zero point six four newton-metres for each mass." (11)
4. "The frame adds zero point two five the same way -- total one point five three, exactly I alpha." (17)

S8: 0 words (open explore state, no authored narration).

---

## Section 5 -- Drill-down cluster phrasings (30 phrases, 6 clusters x 5)

constant_torque_constant_speed (S2): "why doesnt it just spin at one speed" . "shouldnt a constant
push mean a constant speed" . "why does the spin rate keep going up" . "if the force never changes
why does the speed keep changing" . "doesnt a steady push mean a steady spin"

why_it_keeps_speeding_up (S2): "whats staying the same if the speed keeps changing" . "why is alpha
constant but omega isnt" . "how can something be steady and always changing at the same time" .
"what does it mean for acceleration to be constant here" . "why does alpha not change even though
omega does"

torque_off_no_stop (S2/S3 bridge): "if the push stops why doesnt the spinning stop" . "shouldnt it
slow down once the force is gone" . "why does it keep spinning with nothing pushing it" . "doesnt no
torque mean it should stop" . "why does the speed stay the same after the push ends"

same_torque_different_alpha (S5): "how can the same push give different speeding up" . "why isnt the
acceleration the same if the torque is the same" . "same force so why is one faster than the other" .
"doesnt equal torque mean equal alpha" . "why does moving the masses change how fast it speeds up"

mass_position_matters (S5): "why does where the mass sits matter and not just how much there is" .
"isnt it just about the total mass" . "why does moving the mass closer change the inertia" . "how
does distance from the axle affect spinning up" . "why cant I just use the mass number without the
radius"

alpha_formula_use (S5): "how do I find alpha from torque and inertia" . "whats the formula to get
angular acceleration" . "how do I use tau equals I alpha in a problem" . "if I know the torque and
inertia how do I get alpha" . "how do I solve for alpha when torque is given"

---

## Section 6 -- Constraint callouts

1. P1-A, landed here (the carried P1). The tau readout displays the NET RESOLVED torque, never the
   authored schedule value -- verbatim in section 1 tau variable definition and the formulas block,
   and walked through S6 rest clamp and S8 static hold in section 3. This is the single most
   load-bearing correction in this block; json_author must wire the HUD row to the resolved value
   from the same post-step snapshot as I/omega/alpha, per findings_d section 2 binding semantic --
   not to the schedule.
2. P2-A, landed here. Pin durations recomputed past actuator retraction: S4 12 to 14 s, S5 13 to 14
   s, S7 13 to 15 s (full table in section 3). pad_travel_ms must be authored explicitly on every
   actuator-using state (about 700 ms, not the 1200 ms engine default) so the margin table is
   enforceable.
3. P2-B, landed here. Under the P1-8 declared fallback (single signed tau_app control, tug cut), the
   control negative half [-2.0, 0) carries min_ring extended and is cut together with S6 under
   core_only -- equivalently, core_only plus fallback clamps tau_app to [0, 2.0]. Never ship an
   unring-gated signed dial whose negative half no surviving state under a reduced preset teaches.
4. P3-3, landed here. S1 delta cue is "No torque: spin rate unchanged" (5 words) -- the skeleton
   uncorrected "No torque: spin unchanged" must not reach json_author.
5. P3-4, landed here. S6 formula surface is tau = I alpha, not tau_net = I alpha -- "net" has no
   on-screen referent when only one torque acts; S6 new idea is the SIGN. The tau_net = I alpha
   surface is reserved for S8, the only state where two sources genuinely combine (and it degrades to
   tau = I alpha under the fallback, since the fallback removes the second source entirely).
6. P3-6, landed here. S4 opening narration names the fresh start explicitly ("A fresh run, from rest,
   masses moved in") -- the largest omega reset in the concept (6.56 to 0 across the S3 to S4 seam)
   is narrated, not merely accompanied by a silent rig change.
7. P3-7, landed here. "grips" replaced by "presses in"/"presses onto"/"holds the wheel still"
   throughout section 4; "races" (used in the skeleton own beat prose, not narration) is not echoed
   into any text_en line.
8. Standing P2-5, landed here. S5 narration (section 4) reads the 4.64 factor off the omega/I/alpha
   instruments only and never invites an r-squared computation -- the frame inertia dilutes
   r-squared; that explanation belongs to moment_of_inertia (#6).

9. Rounding. 2 dp everywhere. 1.53/3.06 = 0.5000 (exact, prints 0.50); 0.60/1.50 = 0.4000 (exact,
   prints 0.40); 1.53/0.66 = 2.31818 to 2.32; 5.7955/1.25 = 4.6364 to 4.64. No rounding slips found on
   re-derivation (unlike the sibling exemplar carried-forward stop-time slip -- this concept numbers
   all land clean at 2 dp).
10. One noun for the actuator. "The motor drive wheel" / "the drive wheel" in every reader-facing
    string; never "motor" alone or "actuator." The brake stays "the brake pad" / "the pad," never
    "clamp" or "grip." Internal engine identifiers (rbr_brake_pad) are not reader-facing.
11. ASCII-minus risk. Alpha and tau are genuinely negative in S6 (from 1500 ms onward) and, live, in
    S8 (any state where the brake exceeds the drive). Every toFixed() call on these readouts must
    post-process to a real Unicode minus (U+2212) per Rule 34c / the FIXED
    ascii_minus_in_oncanvas_math_from_tofixed sweep -- json_author sweep must cover all three text
    paths (DOM readouts, canvas fillText, sprite labels), since S1-S5/S7 never print a negative but
    S6/S8 do.
12. KE/L/dLdt/F_pull readouts are NEVER shown -- this concept surfaces exactly I, omega, alpha, tau;
    showing L would pre-spoil angular_momentum/conservation_of_angular_momentum (Rule 25 /
    teach_do_not_prespoil_a_later_reveal).
13. Notation ladder (Rule 38c), verified compliant. Every formula surface on a core/extended state is
    algebra-only (tau = I alpha, computed I and F recipes as plain arithmetic); the one Sigma-notation
    form, tau = (Sigma m r^2) alpha = I alpha, is correctly confined to S7 (advanced ring) and appears
    nowhere else.
14. Dialect (38d). No board-divergent term identified in this concept core vocabulary (torque, moment
    of inertia, angular acceleration read identically across CBSE/JEE/NEET) -- no dual-labelling
    required.
15. Engine-side check -- no PASS-3 items found. Every physics fact this block relies on (signed
    drive, static-hold-with-breakaway at omega=0, the resolved-value tau semantic, the
    finite-difference alpha semantic, pad_travel_ms as a live field) is already covered by
    findings_d.md section 1/2/4b, PASS 2, LANDED. This block adds no new engine ask.

---

DC Pandey check: every formula, narration line, and anchor above derives from Newton's second law
for rotation (tau_net = I alpha), the per-particle F=ma derivation, and the closed-form torque
integrator directly -- no teaching sequence, worked example, or figure imported from any book. DC
Pandey chapter table of contents confirms tau = I alpha as core Ch.7 scope only; nothing else was
consulted.

Phase 0b for tau_eq_i_alpha is COMPLETE (skeleton REV 2 DESIGN_OK + this block). Next: build 0c-3
(field3d-surgeon, peter_parker:field3d_surgeon) against findings_d.md section 8 frozen priority list
-- signed torque (D1), theta/alpha/tau readout rows + loud-warn (D3), the motor drive wheel (D4), the
tau_app slider token (D5), the restart.runs[] per-run override (D6), per-particle tangential arrows
(D7), timed formula reveal (D8), and the deriveStateMeta motion-from-torque co-edit (D10) -- then
this desk syncs and json_author authors the concept JSON. NO CONCEPT JSON before that PR merges.
