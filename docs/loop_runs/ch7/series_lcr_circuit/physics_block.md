# Physics Block — `series_lcr_circuit` (Ch.7 #5)

**Engine bug queue consulted live** (`npx tsx --env-file=.env.local src/scripts/query_engine_bug_queue.ts`): `--field3d --open` (29 rows — `ghost_compare_cause_invisible_slider_frozen` still OPEN, directly informs the S2/S7/S8/S9 scripted ramps below — DOM-thumb+label lockstep is binding on every one; `field3d_formula_overlay_generic_not_cambria_math` still OPEN, routes every formula surface below through the dedicated `slcr_formula` panel per skeleton §0b; `teach_show_quantity_live_when_named` / `teach_coordinate_sim_with_graph` / `teach_color_each_element_by_its_own_sign` directives are already threaded into §3 below), `--owner alex:physics_author` (6 rows — the generic `DUALPANEL_*` triad, N/A to field_3d, same finding as all four sealed siblings), `series_lcr_circuit` (0 rows — not yet seeded, expected pre-json_author), `phasors` (0 rows — confirms the sealed sibling's scars were resolved via direct commit, not queue rows). No new gap found beyond what the skeleton's §0a table already threads.

**DC Pandey check:** none consulted. Every formula below is re-derived directly from the series-circuit constraint (one shared `i(t)`), Kirchhoff's voltage law applied instantaneously, and the three sealed siblings' own settled phase facts (R in-phase, L lags 90 deg, C leads 90 deg) — independently re-verified numerically below, not copied from the skeleton's own arithmetic. The half-power-point "geometric symmetry" claim is derived symbolically in section 4.6 and confirmed exact, not a narrowband approximation.

**FLAG - a phase-reference resolution (binding on json_author/engine):** the number-lock's literal phrasing ("i(t)=im sin(wt+phi) with source v(t)=vm sin(wt)") is internally inconsistent with its own stated peak-instant data (source crest at wt=33.70 deg, v_R crest at wt=90 deg, v_L crest at wt=0 deg, v_C crest at wt=180 deg) and with the skeleton's own already-declared fan-offset spec (section 0b item 3: "i at 0 deg reference; V_R at 0, V_L at +90, V_C at -90, source v at +phi_circuit"). I resolved it using the skeleton's own fan-offset spec as the authority, and verified the resolution reproduces every numeric checkpoint in the prompt exactly (section 4.2 below and the sanity check under section 1). The correct, internally-consistent set used throughout this block:

```
theta(t) = omega * t                    [state-local clock, theta0 = 0 for EVERY state, no anchor needed anywhere]
i(t)   = im * sin(theta)                [CURRENT is the 0-deg-offset reference, shared across R, L, C]
v_R(t) = im * R * sin(theta)            [in phase with i]
v_L(t) = im * X_L * sin(theta + 90)     [leads i by 90 deg]
v_C(t) = im * X_C * sin(theta - 90)     [lags i by 90 deg]
v(t)   = vm * sin(theta + phi)          [SOURCE, offset +phi from i; phi = atan(X/R), X = X_L - X_C]
```
phi positive (X_L wins) gives source arrow AHEAD of i by phi, so current LAGS the source (inductive) - matches "current lags 56.3 deg" at the work point. phi negative (X_C wins) gives current LEADS - matches the mirror point. Verified bit-for-bit against all four prompt checkpoints below.

---

## Section 1. physics_engine_config

```json
{
  "variables": {
    "vm":     { "name": "Peak (amplitude) source voltage", "unit": "V", "min": 2, "max": 20, "default": 10.0, "step": 1, "role": "driver" },
    "f_demo": { "name": "Demo-compressed AC frequency (real mains is tens of Hz)", "unit": "Hz", "min": 0.1, "max": 0.5, "default": 0.25, "step": 0.05, "role": "driver" },
    "R":      { "name": "Resistance of the heater element", "unit": "Ohm", "min": 2, "max": 20, "default": 5.0, "step": 1, "role": "driver" },
    "L":      { "name": "Self-inductance of the coil (off-grid default, F8/snap-on-first-drag pattern, see 4.10)", "unit": "H", "min": 1.0, "max": 10.0, "default": 3.1831, "step": 0.1, "role": "driver" },
    "C":      { "name": "Capacitance of the plates (off-grid default, F8/snap-on-first-drag pattern, see 4.10)", "unit": "F", "min": 0.04, "max": 0.40, "default": 0.1273, "step": 0.02, "role": "driver" },

    "omega":  { "name": "Angular frequency of the shared clock", "unit": "rad/s", "derived": "omega = 2*PI*f_demo" },
    "theta":  { "name": "Instantaneous phase, the state's OWN clock (Rule 26), degree-native (38c: no radians before S10). theta0=0 in EVERY state.", "unit": "deg", "derived": "theta = omega_deg_per_s * t   [t = time since STATE ENTRY, pure closed form, no accumulator]" },
    "omega_deg_per_s": { "name": "Angular speed in deg/s", "unit": "deg/s", "derived": "omega_deg_per_s = omega * 180/PI" },
    "T":      { "name": "Period of one full AC cycle at the currently active f_demo", "unit": "s", "derived": "T = 1/f_demo" },

    "X_L":    { "name": "Inductive reactance (source string token X_L; L has a native Unicode subscript, see 4.9)", "unit": "Ohm", "derived": "X_L = omega * L = 2*PI*f_demo*L" },
    "X_C":    { "name": "Capacitive reactance (source string token X_C; C has NO native Unicode subscript, needs the compose routine, see 4.9)", "unit": "Ohm", "derived": "X_C = 1/(omega*C) = 1/(2*PI*f_demo*C)" },
    "X":      { "name": "Net (signed) reactance, the circuit's own tug-of-war; sign-driven colour (violet when X_L wins, green when X_C wins)", "unit": "Ohm", "derived": "X = X_L - X_C" },
    "Z":      { "name": "Impedance, the circuit's own fingerprint hypotenuse", "unit": "Ohm", "derived": "Z = sqrt(R^2 + X^2)" },
    "im":     { "name": "Peak (amplitude) current, the shared reference, on its own amber scale", "unit": "A", "derived": "im = vm/Z" },
    "phi":    { "name": "Phase angle, the angle by which the SOURCE leads the current (positive = current lags = inductive dominant; negative = current leads = capacitive dominant). Dual-labeled once at S7 ('phase angle phi'), bare thereafter (38d).", "unit": "deg", "derived": "phi = atan2(X, R) * 180/PI" },

    "i_t":    { "name": "Instantaneous current, the fan's amber reference arrow projection / bead-drive value", "unit": "A", "derived": "i_t = im * sin(radians(theta))" },
    "v_t":    { "name": "Instantaneous SOURCE voltage, the cyan arrow's projection", "unit": "V", "derived": "v_t = vm * sin(radians(theta + phi))" },
    "vR_t":   { "name": "Instantaneous heater voltage, in phase with i", "unit": "V", "derived": "vR_t = im * R * sin(radians(theta))" },
    "vL_t":   { "name": "Instantaneous coil voltage, leads i by 90 deg", "unit": "V", "derived": "vL_t = im * X_L * sin(radians(theta + 90))" },
    "vC_t":   { "name": "Instantaneous plate voltage, lags i by 90 deg", "unit": "V", "derived": "vC_t = im * X_C * sin(radians(theta - 90))" },

    "V_R":    { "name": "Peak heater voltage, the S3+ white chip / chain's first leg", "unit": "V", "derived": "V_R = im * R" },
    "V_L":    { "name": "Peak coil voltage, the S3+ violet chip / chain's second leg", "unit": "V", "derived": "V_L = im * X_L" },
    "V_C":    { "name": "Peak plate voltage, the S3+ green chip / chain's third (antiparallel) leg", "unit": "V", "derived": "V_C = im * X_C" },
    "arithmetic_sum_wrong": { "name": "The S4 struck-chip value, the WRONG scalar sum peak voltages don't obey", "unit": "V", "derived": "arithmetic_sum_wrong = V_R + V_L + V_C" },
    "phasor_check":  { "name": "The correct phasor-sum magnitude, must equal vm exactly (the S5 closure proof)", "unit": "V", "derived": "phasor_check = sqrt(V_R^2 + (V_L - V_C)^2)   [identically equals im*Z = vm]" },

    "f0":     { "name": "Resonant frequency, where X_L=X_C, Z=R, current peaks. Depends ONLY on L,C (never R).", "unit": "Hz", "derived": "f0 = 1/(2*PI*sqrt(L*C))" },
    "delta_f": { "name": "Resonance bandwidth (full width at half-power), set by R alone, NEVER moves f0", "unit": "Hz", "derived": "delta_f = R/(2*PI*L)" },
    "Q":      { "name": "Quality factor, sharpness/selectivity", "unit": "dimensionless", "derived": "Q = f0/delta_f  [identically = (1/R)*sqrt(L/C) = omega0*L/R]" },
    "f1":     { "name": "Lower half-power frequency (S9 width marker, R=2/R=10 curves only, never R=5, coincidence guard 4.2)", "unit": "Hz", "derived": "f1 = (-delta_f + sqrt(delta_f^2 + 4*f0^2))/2   [exact geometric-symmetry root, verified 4.6]" },
    "f2":     { "name": "Upper half-power frequency (may fall OFF the 0.10-0.50Hz plot axis for large R, 4.7 FLAG)", "unit": "Hz", "derived": "f2 = f1 + delta_f" },

    "bead_frac": { "name": "Micro-band bead position along the shared loop path, 0.5=home. ONE stream threads heater-coil-plates (never splits/pools).", "unit": "dimensionless", "derived": "bead_frac = 0.5 - A_frac*cos(radians(theta))   [d(bead_frac)/dt is proportional to i(t) exactly]" },
    "A_frac": { "name": "Bead-excursion visual scale, calibrated to 0.30 at defaults (fleet convention)", "unit": "dimensionless", "derived": "A_frac = clamp(0.30 * (im/omega) / (2.00/1.5708), 0.08, 0.42)" },

    "X_L_of_f": { "name": "Static plot-curve function (x-axis dummy variable f_plot, NOT f_demo, recomputed only when L changes)", "unit": "Ohm", "derived": "X_L_of_f(f_plot) = 2*PI*f_plot*L" },
    "X_C_of_f": { "name": "Static plot-curve function (recomputed only when C changes)", "unit": "Ohm", "derived": "X_C_of_f(f_plot) = 1/(2*PI*f_plot*C)" },
    "i_peak_of_f": { "name": "Static resonance-curve function (recomputed when R, L, or C changes, the S9 family-overlay curve)", "unit": "A", "derived": "i_peak_of_f(f_plot, R_active) = vm / sqrt(R_active^2 + (2*PI*f_plot*L - 1/(2*PI*f_plot*C))^2)" }
  },

  "computed_outputs": {
    "i_display":         { "formula": "im*Math.sin(theta*Math.PI/180)" },
    "v_display":          { "formula": "vm*Math.sin((theta+phi)*Math.PI/180)" },
    "vR_display":         { "formula": "im*R*Math.sin(theta*Math.PI/180)" },
    "vL_display":         { "formula": "im*X_L*Math.sin((theta+90)*Math.PI/180)" },
    "vC_display":         { "formula": "im*X_C*Math.sin((theta-90)*Math.PI/180)" },
    "im_display":         { "formula": "vm/Math.sqrt(R*R+(X_L-X_C)*(X_L-X_C))" },
    "XL_display":         { "formula": "2*Math.PI*f_demo*L" },
    "XC_display":         { "formula": "1/(2*Math.PI*f_demo*C)" },
    "Z_display":          { "formula": "Math.sqrt(R*R+(X_L-X_C)*(X_L-X_C))" },
    "phi_display":        { "formula": "Math.atan2(X_L-X_C, R)*180/Math.PI" },
    "f0_display":         { "formula": "1/(2*Math.PI*Math.sqrt(L*C))" },
    "deltaf_display":     { "formula": "R/(2*Math.PI*L)" },
    "Q_display":          { "formula": "(1/R)*Math.sqrt(L/C)" },
    "f1_display":         { "formula": "(-1*(R/(2*Math.PI*L)) + Math.sqrt(Math.pow(R/(2*Math.PI*L),2) + 4*Math.pow(1/(2*Math.PI*Math.sqrt(L*C)),2)))/2" },
    "f2_display":         { "formula": "f1_display + R/(2*Math.PI*L)" },
    "arithmetic_sum_wrong_display": { "formula": "im*R + im*X_L + im*X_C" },
    "phasor_check_display": { "formula": "Math.sqrt(Math.pow(im*R,2) + Math.pow(im*X_L-im*X_C,2))" },
    "bead_frac_display":  { "formula": "0.5 - A_frac*Math.cos(theta*Math.PI/180)" }
  },

  "formulas": {
    "shared_current":       "i(t) = im sin(theta), theta = omega*t -- current is the ONE quantity common to all three elements (S1)",
    "voltage_kvl_instant":  "v(t) = v_R(t) + v_L(t) + v_C(t) at EVERY instant -- the true KVL statement (S4 PRIMARY aha)",
    "phasor_sum":           "vm^2 = V_R^2 + (V_L - V_C)^2 -- tip-to-tail, never scalar addition (S5)",
    "reactance_net":        "X = X_L - X_C, X_L = omega*L, X_C = 1/(omega*C) -- the circuit's tug-of-war (S6/S7)",
    "impedance":            "Z = sqrt(R^2 + X^2) -- the circuit's own fingerprint hypotenuse (S6)",
    "peak_current":         "im = vm/Z -- closes the S1/S2 current mystery (S6)",
    "phase_law":            "tan(phi) = X/R -- phi = angle the source leads the current; X_L wins => phi>0 => current lags; X_C wins => phi<0 => current leads (S7)",
    "resonance_condition":  "X_L = X_C => omega*L = 1/(omega*C) => omega0 = 1/sqrt(LC) => f0 = 1/(2*pi*sqrt(LC)) (S8 result, S10 derivation)",
    "peak_current_at_resonance": "at f0: Z = R, im = vm/R -- the bare-heater value, the S1-to-S8 payoff",
    "bandwidth_sharpness":  "delta_f = R/(2*pi*L) -- full width at half-power; Q = f0/delta_f = (1/R)*sqrt(L/C) (S9)",
    "half_power_geometry":  "f1*f2 = f0^2, f2 - f1 = delta_f -- EXACT geometric symmetry, derived from |X(f)|=R, not a narrowband approximation (verified 4.6)"
  },

  "constraints": [
    "i(t) is common to R, L and C at every instant (series circuit) - never three separate currents.",
    "v(t) = v_R(t) + v_L(t) + v_C(t) at every INSTANT exactly (KVL); peak voltages do NOT add - the amplitudes obey vm^2 = V_R^2 + (V_L-V_C)^2 instead.",
    "Z = sqrt(R^2+X^2) >= R always; Z = R exactly only when X_L = X_C (resonance) - Z is NEVER R+X_L+X_C (the demoted third misconception).",
    "f0 = 1/(2*pi*sqrt(LC)) depends ONLY on L and C - R never moves f0, R only sets the peak height (im=vm/R at f0) and the bandwidth delta_f=R/(2*pi*L).",
    "phi = atan(X/R) is bounded in (-90,+90) deg for any finite R>0 - never reaches +-90 deg exactly within the authored slider range.",
    "Z(f0)=R=5.0 Ohm here is TRUE ONLY for this build's specific R value at f=f0 - it does NOT generalize to 'reactance always equals R at resonance' as a separate law (4.2 guard)."
  ]
}
```

**Numerical sanity check (independently re-verified, matches skeleton section 2 exactly):**
- Defaults (f=0.25): X_L=5.000, X_C=5.0009->5.001, X ~ -0.001, Z ~ 5.000, im=2.000A, phi ~ 0 deg. f0=1/(2*pi*sqrt(3.1831*0.1273))=1/(2*pi*0.63656)=1/3.99962=**0.25002 Hz**.
- Work point (f=0.50): X_L=10.00, X_C=2.5004->2.50, X=7.4996->7.50, Z=sqrt(25+56.244)=9.0135->**9.0 Ohm**, im=10/9.0135=**1.1094->1.11A**, phi=atan(7.4996/5)=**56.295 deg -> 56.3 deg**. V_R=5.547->5.55, V_L=11.094->11.09, V_C=2.774->2.77. Arithmetic sum=19.415->**19.41V**. Phasor check=sqrt(5.547^2+8.320^2)=sqrt(30.77+69.22)=sqrt(99.99)=**9.9995 ~ 10.00 (matches vm)**.
- **Peak-instant verification (the phi-convention resolution, top of file):** at theta=33.70 deg (theta+phi=90): v_R=5.547*sin(33.70)=5.547*0.5548=**3.077**; v_L=11.094*sin(123.70)=11.094*0.8319=**9.229**; v_C=2.774*sin(-56.30)=2.774*(-0.8319)=**-2.308**. Sum=3.077+9.229-2.308=**10.00** (source crest, v(t)=vm*sin(90)=10.00). At theta=90 (i's own crest): v_R=5.547*sin(90)=**5.55**; v_L=11.094*sin(180)=**0.00**; v_C=2.774*sin(0)=**0.00**. Sum=**5.55** = v(90+56.3=146.3 deg)=10*sin(146.3)=10*0.5548=**5.55** (source visibly NOT at its own crest, confirmed).
- Mirror (f=0.125): X_L=2.500, X_C=10.0016->10.00, X=-7.5016->-7.50, Z=9.0152->**9.0 Ohm** (differs from work point at 3rd decimal, both render 9.0, display-precision law), im=1.1092->**1.11A**, phi=**-56.3 deg** (current leads).
- S9 family (R=2/5/10 at fixed L,C): peak im=5.00/2.00/1.00A; delta_f=R/20.000=0.10/0.25/0.50Hz; Q=f0/delta_f=2.5/1.0/0.5 (also Q=(1/R)*sqrt(L/C), sqrt(L/C)=sqrt(3.1831/0.1273)=sqrt(25.004)=5.0004, so Q=5.0004/R=2.500/1.000/0.500, both formulas agree).
- **Half-power points, derived exactly, not approximated** (see 4.6): R=5: f1=0.15451, f2=0.40451; R=2: f1=0.20495, f2=0.30495; R=10: f1=0.10355, **f2=0.60355 (OFF the 0.10-0.50Hz plot axis, FLAG 4.7)**.

---

## Section 2. Per-state `variable_overrides` (all 11 states)

Every state carries an EXPLICIT value for all five drivers, never "inherited from the previous state" -- satisfying Rule 25d (reorder safety: a teacher can jump to any state via the state rail) and the `default_variables_only_first_var_merged` scar (no variable silently falls through to a stale drag). For scripted-ramp states (S2/S7/S8/S9), the override gives the ENTRY value; the full schedule is in Section 3.

| State | `variable_overrides` | Live control(s) this state | Why |
|---|---|---|---|
| S1 three_in_series_one_current | vm:10.0, f_demo:0.25, R:5.0, L:3.1831, C:0.1273 | none | Full lock at the chapter defaults - the 2.00A "as if L/C weren't there" plant needs Z ~ R exactly (resonance coincidence, not yet named). |
| S2 off_home_frequency | vm:10.0, R:5.0, L:3.1831, C:0.1273 (no override on f_demo - it is the scripted variable; entry value 0.25, reorder-safe by explicit statement) | f_demo (drag-seize post-glide) | Everything except f locked so ONLY the frequency-caused shrink+slip is visible (32b); the glide's end state (X_L=10.00, X_C=2.50, im=1.11) depends on vm/R/L/C being exactly at defaults. |
| S3 three_voltages_three_angles | vm:10.0, f_demo:0.50, R:5.0, L:3.1831, C:0.1273 (CRITICAL defensive lock of f_demo to the work point, independent of whether S2's glide actually played) | none | The V_R/V_L/V_C fan magnitudes (5.55/11.09/2.77V) and the "matches NONE of them" claim (phi=56.3deg) require f pinned exactly at 0.50 regardless of state-rail reorder (Rule 25d) - direct application of default_variables_only_first_var_merged: f is not "whatever S2 left it at," it is explicitly re-declared here. |
| S4 peaks_dont_add | vm:10.0, f_demo:0.50, R:5.0, L:3.1831, C:0.1273 (full lock, same defensive reasoning as S3) | none | The struck 19.41V chip and both freeze instantaneous checks (+10.00/+5.55V) are exact ONLY at these values - a live vm or f here would break the printed numbers (32b: this state teaches the SUM rule, nothing else moves). |
| S5 tips_to_tails | vm:10.0, f_demo:0.50, R:5.0, L:3.1831, C:0.1273 (full lock) | none | The chain legs (5.55/11.09/2.77V) and the closure onto the 10.00V source ghost are exact only at the work point. |
| S6 the_impedance_triangle | vm:10.0, f_demo:0.50, R:5.0, L:3.1831, C:0.1273 (full lock) | none | Triangle legs (R=5.0, X=7.50, Z=9.0) and the mystery-closing im=vm/Z=1.11A check need exact defaults. |
| S7 who_leads_who_lags | vm:10.0, f_demo:0.50, R:5.0, L:3.1831, C:0.1273 (no override on f_demo for the second half - it is the state's OWN scripted one-shot 0.50 to 0.125; entry value 0.50 is explicit) | none (f-step is choreography, never a slider, per skeleton control table) | phi=56.3deg at entry (work point) must swap to phi=-56.3deg at exactly f=0.125 by the state's own scripted step - R/L/C/vm stay locked throughout so ONLY the sign flips (32b). |
| S8 the_crossing_resonance | vm:10.0, R:5.0, L:3.1831, C:0.1273 (no override on f_demo; entry value = 0.125, explicit, reorder-safe, does NOT assume S7 played) | f_demo (re-live post-sweep, settles to 0.25) | R/L/C/vm locked so the sweep is driven by f ALONE; the crossing (X_L=X_C=5.00 Ohm at f=0.25) and the peak (im=2.00A) depend on R=5.0/L=3.1831/C=0.1273 exactly. |
| S9 sharpness_and_q | vm:10.0, f_demo:0.25, L:3.1831, C:0.1273 (no override on R, the taught variable; CRITICAL defensive re-lock of f_demo to exactly 0.25 - S8 left f live-dragged) | R (plain-live, scripted 5.0 to 2.0 to 10.0 demo first) | f MUST sit exactly at f0=0.25 for the Q/delta_f family (2.5/1.0/0.5, 0.10/0.25/0.50Hz) to be correct; L/C locked (untouched until S11) so the curve FAMILY isolates R alone (32b). |
| S10 f0_from_first_principles | vm:10.0, f_demo:0.25, R:5.0, L:3.1831, C:0.1273 (full lock, defensive re-lock of R, S9 legacy) | none | The algebra's final numeric substitution (1/(2*pi*sqrt(3.1831*0.1273))=0.250Hz) must match the sealed decimals exactly; apparatus dims (E4), no live interaction. |
| S11 lcr_sandbox | none - inherits default_variables | ALL: vm, f_demo, R, L, C | Explore (Rule 37) - nothing else constrains it; L/C off-grid defaults snap on first drag (F8 pattern, section 4.10). |

---

## Section 3. Within-state motion timeline (all 11 states)

**Shared machinery (defined once):** theta(t) = omega*t, theta=0 at every state's OWN entry (no anchor needed anywhere in this concept, simpler than phasors' S6 case). i(t)=im*sin(theta); v_R/v_L/v_C/v(t) per Section 1. `bead_frac(t) = 0.5 - A_frac*cos(theta)` drives the ONE bead stream threading heater->coil->plates uniformly (never splits). All formulas are pure functions of state-local `t` -- zero per-frame accumulators anywhere (B1 scar discipline), verified byte-stable under SET_TIME_FREEZE by construction (no history term appears in any formula above).

### S1 three_in_series_one_current -- core -- reveal-build

| t-window | What animates | Driven by | Live controls |
|---|---|---|---|
| [0, 1.2s] | Heater docks (reveal-build one-shot, slide/fade in from off-scene) | scripted one-shot | none |
| [1.2, 1.4s] | beat (nothing new) | -- | -- |
| [1.4, 2.6s] | Coil docks | scripted one-shot | -- |
| [2.6, 2.8s] | beat | -- | -- |
| [2.8, 4.0s] | Plates dock -- loop closes | scripted one-shot | -- |
| t >= 4.0s, continuous | ONE amber bead stream threads heater->coil->plates in lockstep: bead_frac(t) = 0.5 - A_frac*cos(omega*(t-4.0)) for t>=4.0 (pure closed-form with fixed constant offset 4.0s, never an accumulator) | i(t) via theta(t-4.0) | none |
| continuous from t=0 | HUD "im = 2.00 A" (computed live from vm/R/f at defaults, not hardcoded) | im (=vm/Z, Z ~ R at these defaults) | -- |

glow_focal = circuit. Two deliberate unnamed plants land here: im=2.00A exactly equals the bare-heater value (resolved narratively at S8), and Z ~ R (X ~ 0) though no reactance token renders yet (F3 ring-gate). **A5 framing guard:** the "2.00 A" is authored strictly as a parked anomaly ("park that") -- never framed as "the normal reading," and carries NO resonance hint.

### S2 off_home_frequency -- core -- ramp-response (declared contrast pair with S8)

**Cause-first (32a):** f-thumb glide, closed-form smoothstep, f0=0.25 to f1=0.50 Hz, DeltaT=3.0s (json_author/engine may retime; endpoints fixed):
```
f(u) = 0.25 + 0.25*smoothstep(u),  smoothstep(u)=3u^2-2u^3,  u=t/3.0, u in [0,1]
theta(t) = 360*integral_0^t f(t')dt' = 360*3.0*[0.25u + 0.25(u^3-u^4/2)]   (partial; degree-native form of the sibling lemma)
theta(3.0) = 180*3.0*(0.25+0.50) = 405 deg   (full-leg endpoint, average-frequency shortcut)
```
At u=1 (t=3.0s): X_L=10.00 Ohm, X_C=2.50 Ohm, Z=9.01 Ohm, im=1.11A (verified Section 1). **Effect after a readable ~0.6-1.0s beat (32a):** beads visibly slow, HUD im winds 2.00->1.11A, i-crest visibly detaches and drifts late relative to v-crest (no phi symbol, no arc -- the slip stays purely visual). **A2 hard constraint: no named/quantified phase anywhere in S2 or S3 -- phi debuts named only at S7.** **Drag-seize:** the instant the teacher grabs f_demo, the script halts permanently for this state-entry; theta(t) = theta_at_drag + omega_live(t)*(t-t_drag), recomputed live every frame from whatever the slider currently reads (never resumes the script). glow_focal = trace.

### S3 three_voltages_three_angles -- core -- rigid-fan-rotation (coin)

f LOCKED at 0.50 (Section 2). theta(t)=180*t (omega=180 deg/s, T=2.0s). Cue-bound docking (arrows co-rooted at the disc centre, matching phasors' delivered convention -- NEVER chained here, chaining is S5's front door):

| Cue | ~t | What docks | Offset from i |
|---|---|---|---|
| s1 | 0-1.5s | amber i-arrow spins as reference | theta(t)+0 |
| s2 | 1.5-3.0s | white V_R arrow docks, glued along i | theta(t)+0 |
| s3 | 3.0-4.5s | violet V_L arrow docks, a quarter ahead | theta(t)+90 |
| s4 | 4.5-6.0s | green V_C arrow docks, a quarter behind | theta(t)-90 |
| s5 (last) | 6.0-7.5s | cyan source arrow docks -- "matches NONE of them" (phi arc may READ here per the phasors delivered tool, but NO numeral, NO name "phase" -- A2 hard constraint; just a visibly non-aligned arrow) | theta(t)+56.3 |
| continuous after s5 | -- | fan rotates rigidly; strip draws all 4 voltage traces in step (i-trace dimmed) | theta(t) | none |

glow_focal = fan. **32a caution (binding, family's fifth):** all five arrows are constant offsets of the SAME theta(t) -- never five independently-animated arrows that merely happen to stay co-rooted.

### S4 peaks_dont_add -- core -- freeze-and-read -- 16a PIVOT #1

f LOCKED at 0.50, theta(t)=180*t. **Wrong-consequence-first (Rule 16a):**

| Cue | Timing | Event |
|---|---|---|
| s1 | ~0-3s | Struck chip lands: "5.55 + 11.09 + 2.77 = 19.41 V?" beside the true source HUD "10.0 V"; coil's OWN chip reads "11.09 V" -- more than the source |
| s2 | armed after s1's narration, phase-FIRES at the next theta = 33.70 deg (mod 360), increasing (cue ARMS, phase FIRES, F2 semantics, never a hardcoded ms) | **Freeze A -- SOURCE crest.** Scene halts <=1.0s. Signed chips stack tip-to-tail: "+3.08 + 9.23 - 2.31 = +10.00 V" (exact, verified Section 1). Struck chip stays struck; this stack is UN-struck. |
| s3 | armed after Freeze A releases, phase-FIRES at the next theta = 90.00 deg (mod 360), increasing | **Freeze B -- i CREST.** Scene halts <=1.0s. "+5.55 + 0.00 + 0.00 = +5.55 V = v(t)" at that instant; source visibly NOT at its own crest (v=5.55V, not 10.0V, there -- verified Section 1). |

Total frozen time <=2.0s (well within the family's <=3.0s budget). glow_focal = trace. **misconception_watch:** belief = "AC voltages in series add like numbers -- no element can read more than the source." visual_counter = the struck 19.41V chip beside the true 10.0V, with the coil alone reading MORE than the source; one_line_fix = "Voltages add at every instant, sign and all -- never peak to peak, because the peaks happen at different moments."

### S5 tips_to_tails -- core -- tip-to-tail-assembly (coin) -- SUPPORTING AHA

f LOCKED at 0.50 (inherited explicitly, Section 2). Rotation continues from state-entry (theta(t)=180*t) for a brief beat, then STOPS.

| Cue | Timing | Event |
|---|---|---|
| s1 | 0-1.0s | Fan keeps rotating (continuity); "freeze the clock: the angles can't change" spoken |
| -- | ~1.0s | **Rotation STOPS** at whatever angle is currently active when the stop-cue fires -- a simple halt, NOT a phase-matched freeze like S4 (the phasor triangle's geometry is angle-invariant: V_R/V_L/V_C magnitudes and the chain's closure onto the source are true at ANY frozen angle, since they are LENGTH facts, not instantaneous-projection facts). |
| s2 | +0-0.8s after stop | Fan ghosts in place (dashed); solid V_R arrow translates from the root along direction theta_stop+0, length 5.55V |
| s3 | +0.8-1.6s | Solid V_L arrow translates from V_R's tip, direction theta_stop+90, length 11.09V |
| s4 | +1.6-2.4s | Solid V_C arrow bites BACK down V_L's tip, direction theta_stop-90 (antiparallel to V_L), length 2.77V -- net vertical leg = 11.09-2.77 = **8.32V** |
| s5 (derived) | +2.4s+ | **Closure flash** -- fires when the chain's final tip reaches the ghosted source tip (a measured tip-DISTANCE probe < tolerance, never a timer): chain tip at (theta_stop+phi, 10.00V) exactly matches the ghosted source arrow |
| after s5 | continuous | Clock RESUMES at theta_stop (no jump); whole chain rotates rigidly; the chain-tip's projection re-draws the source trace over its ghost -- congruent |

glow_focal = chain. **32a caution restated:** every chain node is a cumulative sum of the SAME phasor set (V_R, V_L, V_C at their fixed magnitudes/relative-offsets) -- never independently-animated arrows that merely happen to close; the closure flash fires on the measured tip-distance, never a hardcoded instant.

### S6 the_impedance_triangle -- core -- unit-morph (coin)

f LOCKED at 0.50. Rotation continues briefly from S5's resumed spin, then stops again for the morph.

| Cue | Timing | Event |
|---|---|---|
| s1 | 0-0.8s | Rotation continues (chain still visible), then stops |
| s2 | 0.8-2.5s | Chain's right triangle detaches (no longer rotates); scripted morph divided by im=1.11A: legs re-scale from Volt-lengths to Ohm-lengths in one continuous eased tween |
| s3 | 2.5-3.5s | Legs relabel: R=5.0 Ohm (white, along the reference direction), X=X_L-X_C=10.00-2.50=**7.50 Ohm** (violet -- X_L winning, drawn perpendicular/"above" R matching V_L's earlier direction), hypotenuse **Z=9.0 Ohm** (cyan). Condition chip "at f = 0.50 Hz" appears beside the X chips (A0-3 duty, the display-precision law, Section 4). |
| s4 | 3.5-4.5s | HUD closes mystery #1: "im = vm/Z = 10.0/9.0 = 1.11A [check]" -- the S2 number, now explained. Spoken: "this triangle doesn't spin, it's the circuit's fingerprint, not a phasor." |

glow_focal = triangle. No live controls (full lock, Section 2).

### S7 who_leads_who_lags -- core -- rotate/flip (seed)

Entry f=0.50 (explicit, Section 2); state's OWN scripted one-shot flips f to 0.125 partway through.

| Cue | Timing | Event |
|---|---|---|
| s1 | 0-2.0s | Triangle's angle brightens: **phi = 56.3 deg** reads off the ALREADY-BUILT triangle (S2's slip, finally named and explained -- mystery #2 closes). Dual-label ONCE here: "phase angle phi", bare thereafter (38d). **A1 density note: pin ONE fixed reference arrow (the amber i-arrow, per S3's own 0-deg reference) across S3 to S7 so this state's swing reads unambiguously against a constant baseline -- never re-anchor the reference mid-sequence.** |
| s2 | armed after s1, fires the scripted f-step | **f steps 0.50 -> 0.125 Hz** -- closed-form smoothstep, DeltaT=2.0s (json_author/engine may retime; endpoints fixed): f(u)=0.50-0.375*smoothstep(u), u=t_r/2.0. At u=1: X_L=2.50 Ohm, X_C=10.00 Ohm (SWAPPED), X=-7.50 Ohm, Z=9.02->9.0 Ohm (verified Section 1), im=1.11A (unchanged) |
| s3 | during/after the step | X chips visibly SWAP (10.00 <-> 2.50); X-leg swings from ABOVE the R-leg to BELOW it, colour flips violet->green (X_C now winning); on the fan, the i-arrow swings from 56.3 deg BEHIND the (fixed-reference) source position to 56.3 deg AHEAD of it; the strip shows i now cresting FIRST |
| -- | end of state | phi = -56.3 deg holds as end pose; Z and im UNCHANGED throughout (same size of fight, opposite winner) |

glow_focal = triangle. No live controls (f-step is choreography, never a slider, per skeleton control table).

### S8 the_crossing_resonance -- core -- ramp-response -- PRIMARY AHA + 16a PIVOT #2 (declared contrast pair with S2: same archetype, delta = mystery opens blind vs closes with levers visible)

Entry f=0.125 (explicit, Section 2, reorder-safe -- never assumes S7 played).

| Cue | Timing | Event |
|---|---|---|
| s1 | 0-1.0s | Strip region SWITCHES to the resonance plot pair: upper X-vs-f (STATIC curves -- X_L_of_f rising line, X_C_of_f falling curve, drawn across the full 0.10-0.50Hz domain, computed once from the locked L/C -- these do NOT redraw during the sweep, only the live DOT moves along them), lower im-vs-f (STATIC curve at the locked R=5.0, same domain), shared f-axis |
| s2 | 1.0s+ | **f-sweep Leg A (rise):** closed-form smoothstep, f0=0.125 to f1=0.50Hz, DeltaT=5.0s: f(u)=0.125+0.375*smoothstep(u), u=t_r/5.0. Live dot rides BOTH curves at x=f(t_r) |
| derived (crossing) | fires when f(t_r) crosses 0.25Hz increasing -- a boolean test (f(t_r-eps)<0.25) AND (f(t_r)>=0.25), evaluated every frame (the phasors upper-crossing-test pattern), reference analytic location: solving 0.125+0.375*smoothstep(u)=0.25 gives smoothstep(u)=1/3, u~0.3870, i.e. **t_r ~ 1.94s into Leg A** (a design reference for THE EYE's capture window, never a hardcoded fire-instant) | **Crossing flash**: X_L=X_C=5.00 Ohm MERGED into ONE equality chip (never two separate chips, Section 4 coincidence guard); directly beneath, the im curve visibly PEAKS at the same f=0.25 (vertical-alignment probe, skeleton 10j); beads visibly ACCELERATE; triangle's X-leg (if still shown) shrinks to nothing; Z->R=5.0 Ohm, phi->0. **A6 guard line spoken here, verbatim: "with THIS resistor -- our build, not a law."** |
| continue | Leg A completes at t_r=5.0s (f=0.50, X_L=10.00/X_C=2.50 restored, past the crossing) | dot continues to x=0.50 |
| s3 | **f-sweep Leg B (settle):** f0=0.50 to f1=0.25Hz, DeltaT=3.0s: f(u)=0.50-0.25*smoothstep(u), u=t_r/3.0 (t_r reset to 0 at Leg B start) | dot eases BACK to x=0.25 and HOLDS -- settle to end pose |
| -- | end of state | f goes plain-live (drag-seize) after the settle; im=2.00A (the S1 bare-heater value) -- the S1 mystery resolved |

glow_focal = reso_plot. **misconception_watch (16a PIVOT #2):** belief = "every component adds opposition -- more elements in the loop always means less current" (earned honestly across S2-S7, which showed current DROP at every off-home frequency tried). visual_counter = the current curve CLIMBING as f approaches 0.25 and landing at 2.00A (the bare-heater value) while the X-leg shrinks to nothing and beads accelerate; one_line_fix = "The coil and the plates oppose each other, not just the current -- at f0 they erase each other and the circuit forgets they exist."

### S9 sharpness_and_q -- extended -- family-overlay (coin)

Entry f_demo=0.25 LOCKED (**CRITICAL defensive re-lock**, Section 2 -- S8 left f live-dragged). R starts at the inherited 5.0 Ohm (the S8 curve, R's FIRST family member, no re-draw needed yet).

| Cue | Timing | Event |
|---|---|---|
| s1 | 0-1.0s | Narration opens: "R sets how sharp" -- the R=5.0 curve already on-screen from S8 (peak 2.00A at f=0.25, the width numerically EQUALS f0 itself -- the Q=1 artifact -- **NEVER width-chipped, coincidence guard Section 4**) |
| s2 | armed after s1 | **R eases 5.0 -> 2.0 Ohm** over DeltaT ~ 1.2s (simple value tween, R(t_r)=5.0-3.0*smoothstep(t_r/1.2), NOT a phase-integral, since R doesn't drive rotation): im-vs-f curve REDRAWS taller/narrower (peak 5.00A, delta_f=0.10Hz, f1=0.205/f2=0.305 width markers DRAWN, since R != 5); old R=5 curve ghosts |
| s3 | armed after s2 | **R eases 2.0 -> 10.0 Ohm** over DeltaT ~ 1.5s: curve redraws as a low flat hump (peak 1.00A, delta_f=0.50Hz); f1=0.104 marker drawn near the LEFT axis edge (0.10Hz, only 0.004Hz margin, legibility-tight); **f2=0.604Hz falls OFF the plotted 0.10-0.50Hz axis, FLAG Section 4.7**: show the width NUMBER (delta_f=0.50Hz) as a text label rather than requiring the right marker to be geometrically plotted, or extend a small off-axis edge-indicator (the same convention as the f0 edge-arrow used for L/C explore extremes) |
| -- | after s3 | R goes plain-live (drag-seize); Q chips "2.5 / 1.0 / 0.5" shown; crossing point (f=0.25) NEVER moves through any of this -- R changes how much and how sharp, never WHERE |

glow_focal = reso_plot. f_demo stays locked at 0.25 throughout (narration: "f0 never moves").

### S10 f0_from_first_principles -- advanced -- chain-link-derivation

Full lock (Section 2, defensive re-lock of R). Apparatus dims (E4 restore pattern, reveal_hold).

| Cue | Timing | Event |
|---|---|---|
| s1 | 0-2.0s | Chain link 1 docks: "X_L = X_C" |
| s2 | 2.0-4.0s | Chain link 2 docks: "-> omega*L = 1/(omega*C)" |
| s3 | 4.0-6.0s | Chain link 3 docks: "-> omega0 = 1/sqrt(LC)" |
| s4 | 6.0-8.0s | Chain link 4 docks, substituting the sealed decimals: "-> f0 = 1/(2*pi*sqrt(3.1831*0.1273)) = 0.250 Hz" (3dp, the "exam-style" precision bump, Section 4) |
| concurrent | throughout | Dimmed resonance plot's crossing point PULSES as the number lands |

glow_focal = formula. No live controls.

### S11 lcr_sandbox -- core (ring-neutral, 38b) -- drag-sandbox

Free-runs forever (Rule 37, never freezes). variable_overrides: none (inherits defaults).

| Behaviour | Driven by |
|---|---|
| v/i traces + fan re-scale live | vm, im=vm/Z |
| Dragging L or C MOVES the crossing -- f0 slides live along the X-vs-f/im-vs-f plots; off-axis edge-arrow + true f0 number when pushed outside 0.10-0.50Hz (e.g. L=1.0,C=0.04 -> f0=0.796Hz; L=10,C=0.40 -> f0=0.080Hz, both verified Section 1/4) | L, C (off-grid defaults, snap-on-first-drag, Section 4.10) |
| Dragging R re-shapes the peak (taller/narrower vs lower/wider) | R |
| Dragging f rides the curve -- live dot climbs to the peak exactly at the crossing | f_demo |
| vm scales arrows and current together | vm |

Formula surface: "Z = sqrt(R^2 + (X_L-X_C)^2)" ONLY (core-ring, 38b -- debuted at S6). No Q chip, no derivation chain (ring-gated absent). glow_focal = formula.

---

## Section 4. Physical constraints, coincidence guards (10k), and curriculum notes

### 4.1 Display precision law (binding, carried from skeleton Section 2 verbatim)
X chips 2dp; Z chips 1dp; im 2dp; phi 1dp; V chips 2dp; f 2dp (3dp only where a scripted value demands it, e.g. S10's "f0 = 0.250 Hz"). Reason: the mirror pair's true Z values differ at the 3rd decimal (9.0135 vs 9.0152 Ohm) -- at 1dp both render "9.0 Ohm" and S7's "same size of fight" claim is EXACT at display precision.

### 4.2 Section 10k coincidence audit, restated with the A6 guard line
1. **X_L = X_C at the S8 crossing** -- TAUGHT equality, allowed; the condition "f0 = 0.25 Hz" renders beside it.
2. **X_L(f0) = R = 5.0 Ohm -- the Q=1 artifact, NOT a law.** Never chip-paired (the X chips merge into ONE "X_L = X_C = 5.00 Ohm" equality chip at the crossing; R lives only in the triangle). **Spoken guard, verbatim, at S8: "with THIS resistor -- our build, not a law."** S9 + explore structurally break the false identity live (R=2/10 with the crossing fixed).
3. **V_L = V_C = vm = 10.0V at f0** -- V chips ring-gated OFF entirely in S8 (F3 HUD gate).
4. **delta_f(R=5) = f0 = 0.25Hz** -- R=5's width is NEVER chipped in S9 (Q chip "1.0" shown instead; the width number itself never rendered for this one curve).
5. **im = 2.00A = vm/R at S1** -- single HUD numeral, spoken as the parked mystery ("park that"), resolved by S8 which TEACHES the resonance condition.

### 4.3 A2 -- no phi pre-spoil in S3 (hard constraint, verified in Section 3 above)
S3 shows ONLY the unnamed source-vs-i gap ("matches none of them") -- no phi symbol, no quantified arc, no spoken degree value. The phi arc MAY be visually present (a delivered phasors tool, reading live) but carries no numeral/name until S7's dual-label debut ("phase angle phi", then bare). Verified: the S3 row explicitly withholds the numeral and the word "phase."

### 4.4 A5 -- S1 framing guard (verified in Section 3 above)
S1's im=2.00A is authored strictly as the parked anomaly ("park that") -- never framed as "the normal reading," and carries NO resonance hint. The spoken line in Section 3's S1 row is neutral/mysterious, not explanatory.

### 4.5 A1 -- S7 density + fixed-reference guard (verified in Section 3 above)
S7 narration reads as ONE beat (<=55w); ONE arrow (the amber i-arrow, S3's own 0-deg reference) is pinned as the fixed on-screen reference across S3 to S7 so the swing at S7 (56.3 deg behind -> 56.3 deg ahead) is unambiguous against a constant baseline.

### 4.6 Half-power point derivation -- EXACT, not a narrowband approximation
Solving |X(f)| = R (the half-power condition, since power is proportional to i^2 and i=im/sqrt(2) iff Z=R*sqrt(2) iff X^2=R^2):
```
Case X=+R:  2*pi*L*f^2 - R*f - 1/(2*pi*C) = 0   ->  f2 = [R + sqrt(R^2+4L/C)]/(4*pi*L)
Case X=-R:  2*pi*L*f^2 + R*f - 1/(2*pi*C) = 0   ->  f1 = [-R + sqrt(R^2+4L/C)]/(4*pi*L)
```
f2 - f1 = 2R/(4*pi*L) = R/(2*pi*L) = delta_f  **(exact)**
f1 * f2 = [(R^2+4L/C)-R^2]/(16*pi^2*L^2) = (4L/C)/(16*pi^2*L^2) = 1/(4*pi^2*L*C) = f0^2  **(exact)**
Verified numerically: R=5 -> f1=0.15451/f2=0.40451 (NOT the naive 0.125/0.375); R=2 -> f1=0.20495/f2=0.30495; R=10 -> f1=0.10355/f2=0.60355.

### 4.7 Edge-legibility FLAGs for the engine dispatch
- **R=10's f2 ~ 0.604Hz falls OFF the plotted 0.10-0.50Hz domain.** Do not extend the axis to accommodate it (would compress the R=2/R=5 curves illegibly). Render the width NUMBER (delta_f=0.50Hz) as a text label; the right marker itself may be an off-axis edge-indicator (reuse the f0 edge-arrow convention from L/C explore extremes) rather than a hard requirement to plot both markers.
- **R=10's f1 ~ 0.1036Hz sits only 0.0036Hz inside the LEFT axis edge (0.10Hz)** -- tight but legible; no special handling needed beyond normal marker rendering, flagged for THE EYE's attention during Checkpoint-B review.
- **S9 i-plot axis must hold the R=2 peak (0-5.2A)**; the **X-plot axis must hold X_C(0.10Hz)=12.5 Ohm (0-13 Ohm range)** -- both per skeleton 10h, re-confirmed here.
- **Explore L/C extremes push f0 off the 0.10-0.50Hz axis** (L=1.0,C=0.04 -> f0=0.796Hz; L=10,C=0.40 -> f0=0.080Hz, both verified Section 1) -- REQUIRED handling: an edge arrow + the true f0 number, never a silent disappearance of the crossing marker.

### 4.8 A4 -- CBSE curriculum-tag honesty (curriculum notes)
Per skeleton 10(i-3): **CBSE/NCERT Class 12 (+JEE/NEET) is marked "full, verified"** for the core NCERT 7.6 content (series LCR phasor treatment, impedance, phase, resonance) -- this verification rests on the founder acting as the in-trial CBSE/NCERT subject-matter authority (no external teacher has yet confirmed it). **S9's sharpness/Q content is explicitly marked needs_teacher_verification:true** even within the otherwise-verified CBSE row (JEE-relevant but CBSE-board-weighting uncertain -- do not silently upgrade this sub-cell to "verified" alongside the rest of the row). All seven other curriculum rows (CAIE, IGCSE, IB, AP Physics 2, AP Physics C, Ontario) are needs_teacher_verification:true beliefs, not facts, per Rule 38g. **No preset for any non-CBSE curriculum ships teacher-visible until a real teacher of that curriculum confirms it.**

### 4.9 Compose-routine token audit (the concrete technical ask behind skeleton 0b sub-issue (a))
Unicode's native subscript-letter set is a,e,o,x,schwa,h,k,l,m,n,p,s,t -- R, C, and V are NOT in it.
| Token | Native Unicode subscript? | Render |
|---|---|---|
| X_L | YES (L subscript exists) | X with subscript L directly |
| V_L | YES | V with subscript L directly |
| vm / im | YES (m subscript exists) | v/i with subscript m directly |
| X_C | NO | compose routine (base "X" + reduced/lowered "C", Cambria Math, both raster paths: canvas fillText AND 3D sprite createLabelSprite) |
| V_C | NO | compose routine, same as X_C |
| V_R | NO | compose routine, same as X_C |
Authored SOURCE strings carry the plain ASCII tokens (X_L, X_C, V_R, V_L, V_C, exactly this casing, capital letter + underscore) -- the engine's compose routine parses these and must NEVER emit a literal underscore or side-by-side letters on screen.

### 4.10 A7 -- L/C off-grid defaults + snap-on-first-drag (binding)
L: min=1.0, max=10.0, step=0.1, default=3.1831 and C: min=0.04, max=0.40, step=0.02, default=0.1273 are **deliberately OFF their step grids** -- forced by chapter-continuity design (2*pi*L=20.000 exactly, 2*pi*C gives the 1.2502/f coefficient exactly, matching the three sealed siblings' own off-grid L/C defaults verbatim). **Do not round these defaults to grid-aligned values** -- the off-grid-initial-value + true-number-HUD + snap-on-first-drag behaviour is the fleet's own already-shipped precedent (phasors F8, confirmed against ac_voltage_inductor/ac_voltage_capacitor's sealed slider CSS) -- reuse verbatim, do not re-engineer. These ranges keep f0 meaningful (though not always on-axis, see 4.7) across the full explore range: f0 spans 0.080Hz (L=10,C=0.40) to 0.796Hz (L=1.0,C=0.04).

### 4.11 Board-mode -- SKIPPED
Per the active conceptual-only directive (Rule 20 [D]): no mode_overrides, no board mark scheme, no derivation_sequence authored for this concept.

---

## Section 5. Drill-down cluster phrasings (9 clusters x 5 phrases = 45)

### S5 -- why_voltages_dont_add_arithmetically
- "why doesnt 5.55 plus 11.09 plus 2.77 just equal the source voltage"
- "if kirchhoffs law says voltages add around a loop why doesnt this add up"
- "how can the source read less than the sum of its parts"
- "is ac voltage addition just different from dc"
- "why do i need arrows instead of just adding the three numbers"

### S5 -- phasor_addition_tip_to_tail_method
- "why tip to tail and not just side by side"
- "how do i know which arrow goes first in the chain"
- "whats the point of moving the arrows if the angles dont change"
- "why does sliding the arrows around still count as the same physics"
- "how is this different from just adding vectors in mechanics"

### S5 -- vl_vc_antiparallel_cancellation
- "why do v_l and v_c point exactly opposite directions"
- "how can two positive voltages cancel each other out"
- "is antiparallel the same as negative"
- "why dont v_r and v_l cancel too"
- "whats special about the coil and capacitor that makes them opposites"

### S6 -- impedance_vs_resistance_difference
- "isnt impedance just another word for resistance"
- "why cant i just use ohms law with regular resistance here"
- "whats actually different between z and r physically"
- "why does impedance need two numbers combined and resistance doesnt"
- "does impedance change with frequency the way resistance doesnt"

### S6 -- z_quadrature_not_scalar_sum
- "why is it root of r squared plus x squared and not just r plus x"
- "wheres the squaring coming from physically"
- "why does the impedance formula look like the pythagorean theorem"
- "is this the same right triangle thing as vectors"
- "why not just add r and the net reactance directly"

### S6 -- impedance_triangle_construction
- "why does dividing by current turn volts into ohms"
- "if i divide the same triangle by something why does it still look the same shape"
- "does the impedance triangle rotate like the voltage arrows did"
- "how is this triangle different from the phasor diagram"
- "why is z always the longest side"

### S8 -- what_happens_at_resonance
- "what does resonance actually mean in this circuit"
- "why does everything become simple exactly at one frequency"
- "is resonance a special state or just a coincidence of the numbers"
- "does resonance happen in every lcr circuit or only some"
- "what is actually canceling out at resonance"

### S8 -- why_current_peaks_at_f0
- "why does the current suddenly jump back up instead of staying low"
- "i thought more parts in the circuit always means less current"
- "why is the peak exactly at the frequency where reactances match"
- "does the current peak mean the circuit is doing something special"
- "why cant the current go higher than this peak value"

### S8 -- radio_tuning_frequency_selection
- "how does turning a radio dial actually pick one station"
- "why dont all the radio stations play at once if theyre all arriving"
- "whats the capacitor got to do with tuning a radio"
- "why does a sharper peak help separate two stations"
- "is tuning a radio literally just changing the resonant frequency"

---

## Self-review checklist

- [x] Every symbol referenced in the skeleton's state narratives (i, v, v_R, v_L, v_C, im, V_R, V_L, V_C, X_L, X_C, X, Z, phi, f0, delta_f, Q, f1, f2) appears in `variables` (Section 1).
- [x] Every formula wraps degree-native theta in radians() before any sin/cos call (Section 1 variables block: i_t, v_t, vR_t, vL_t, vC_t all use radians(theta...)).
- [x] Every state's live control(s) declared exactly per the architect's control table (f_demo -> S2/S8 scripted-then-live, R -> S9 scripted-then-live, ALL -> S11), each with default/min/max/step in Section 1.
- [x] `variable_overrides` documented for all 11 states (Section 2), with explicit reorder-safety reasoning (Rule 25d) and CRITICAL defensive re-locks flagged at S3 (f), S9 (f), S10 (R).
- [x] Board-mode section explicitly SKIPPED (Section 4.11, Rule 20 [D]).
- [x] Drill-down cluster phrasings: 9 clusters x 5 phrases = 45 (Section 5), real-student-voice, plain English, no Hinglish, no textbook prose.
- [x] `constraints` block: 6 short physics assertions (Section 1 JSON) + 11 engineering/coincidence/curriculum subsections (Section 4).
- [x] Numerical sanity check run and independently re-verified (defaults, work point, mirror point, S4 instant checks, S9 family, half-power points) -- all reproduced, matching the skeleton's number lock exactly.
- [x] Half-power point "geometric symmetry" claim derived SYMBOLICALLY from |X(f)|=R (Section 4.6), confirmed EXACT not approximate -- a genuine physics contribution beyond restating the skeleton's numbers.
- [x] Within-state motion timeline written for all 11 states (Section 3): every row a pure function of the state clock (Rule 26); no dt-accumulator anywhere; no two states share a motion signature except the ONE declared contrast pair (S2/S8); controls column matches the architect table exactly (f LOCKED S3-S7, R LOCKED until S9, vm/L/C locked until S11).
- [x] Rule 32 sequencing verified per state (cause-before-effect beats named in S1/S2/S3/S4/S5/S6/S7/S8); only the taught variable's motion changes per state (32b); S5's stop mechanism explicitly clarified as angle-invariant (not a phase-matched freeze like S4) to prevent over-engineering.
- [x] A2 (no phi symbol/numeral/name in S3) verified in Section 3's S3 row and restated as a hard constraint in Section 4.3.
- [x] A5 (S1 framing as parked anomaly, no resonance hint) verified in Section 3's S1 row and restated in Section 4.4.
- [x] A1 (S7 one-beat density + fixed i-arrow reference S3-S7) verified in Section 3's S7 row and restated in Section 4.5.
- [x] A6 (S8 spoken guard "with THIS resistor -- our build, not a law") written verbatim into Section 3's S8 row and restated in Section 4.2 item 2.
- [x] A7 (L/C off-grid defaults + snap-on-first-drag, ranges keep f0 meaningful across explore) written into Section 1 variable declarations and Section 4.10.
- [x] A4 (CBSE needs_teacher_verification honesty, S9 sub-cell flagged even within an otherwise-verified row) written into Section 4.8.
- [x] Notation ladder (Rule 38c): S1-S9/S11 formula surfaces are algebra-only; the derivation chain (omega*L=1/(omega*C), omega0=1/sqrt(LC)) is confined to S10, the advanced-ring state.
- [x] Compose-routine token audit (Section 4.9) resolves the concrete engine ask from skeleton 0b sub-issue (a): X_L/V_L/vm/im use native Unicode subscripts directly; X_C/V_C/V_R require the two-draw compose routine (no native subscript C or R exists in Unicode).
- [x] Engine bug queue consulted LIVE (--field3d --open, --owner alex:physics_author, series_lcr_circuit, phasors); every relevant OPEN prevention rule applied (ghost_compare thumb-lockstep on all scripted ramps; Cambria Math formula panel; B1 closed-form-of-t discipline throughout Section 3).
- [x] DC Pandey check: no formula, explanation, or example problem imported from any external book -- every formula in Section 1 derived directly from the series-current constraint + instantaneous KVL + elementary trig, independently verified.

---

## Escalations / flags for downstream (carried forward, plus the physics_author's own additions)

1. **Phase-reference resolution (top of file, binding):** the number-lock's literal i(t)/v(t) phrasing was internally inconsistent with its own peak-instant data; resolved using the skeleton's own fan-offset spec as authority, verified bit-for-bit against all four given checkpoints. json_author/engine must implement i(t) as the 0-deg-offset reference and v(t) as the +phi-offset source, NOT the literal (inconsistent) phrasing.
2. **Half-power point exactness (Section 4.6):** the f1f2=f0^2, f2-f1=delta_f identity is EXACT (symbolically derived here), not the "geometric symmetry" heuristic the skeleton described more loosely -- safe to hardcode this exact relationship rather than solving the resonance-curve numerically at runtime for the S9 width markers.
3. **R=10 half-power point off-axis (Section 4.7):** a genuine engine capability question -- does the resonance-plot primitive support an off-axis edge-indicator for a half-power marker (not just for f0 as in the L/C explore case)? If not, this is a new small ask for the engine dispatch: reuse the f0 edge-arrow convention for f2 at R=10, or fall back to a text-only width label.
4. **S5's stop mechanism is SIMPLER than S4's freezes** (Section 3 S5, Section 4 note) -- a plain halt-at-current-angle, never a phase-matched freeze, since the phasor triangle's geometry is angle-invariant. Flagging this explicitly so json_author/engine does not over-engineer S5's stop with the same phase-time-subtraction machinery S4 genuinely needs.
5. **Compose-routine promotion decision (skeleton 0b sub-issue (a)):** unchanged from the skeleton -- the founder's call, not physics_author's; Section 4.9 above supplies the exact token list (X_C, V_C, V_R need composing; X_L, V_L, vm, im do not) for whichever implementation path is chosen.
6. **quality_auditor:** verify the S3 row genuinely carries no phi numeral/name (A2); verify S8's spoken line matches the A6 guard verbatim; verify S9's Q=1/R=5 width is never chipped; verify the CBSE curriculum row's S9 sub-cell carries its own needs_teacher_verification flag distinct from the row's overall "verified" status (A4).

---

**Files/commands referenced (read-only + live queries, no edits made):**
- `docs/loop_runs/ch7/series_lcr_circuit/skeleton.md` (input contract, full read, both halves)
- `docs/loop_runs/ch7/ac_voltage_inductor/physics_block.md`, `docs/loop_runs/ch7/ac_voltage_capacitor/physics_block.md`, `docs/loop_runs/ch7/phasors/physics_block.md` (format/rigor precedent, physics independently re-derived for this concept, not copied)
- `docs/loop_runs/ch7/phasors/founder_proxy_report_checkpointC.md` (number-lock source, section 3)
- `npx tsx --env-file=.env.local src/scripts/query_engine_bug_queue.ts` (live DB consultation)
- Hand/Python-equivalent arithmetic (all locked numbers, the half-power-point exact derivation, the phase-reference resolution) independently re-verified, not trusted from the prompt alone.

This physics block is ready to append to `skeleton.md` and hand to the Section 0b engine dispatch (NEW `scenario_type: "ac_series_lcr"`, Class-B, clean standalone sibling clone) followed by `json_author`.
