# Physics Block -- `ac_power_factor` (Ch.7 #6)

**Engine bug queue consulted live** (`npx tsx --env-file=.env.local src/scripts/query_engine_bug_queue.ts`):
`--field3d --open` (18 rows) -- `field3d_sliders_panel_top12_vs_fsbtn_top10` (routes to the section-0b
`top:52px+` zone-map requirement, already honored by the skeleton section-10h geometry, restated in section 4
below); `ghost_compare_b_handoff_instant_snap` (Rule 32d no-teleport -- directly informs S6's R-cycle A-to-B-
to-A-prime leg transitions below: every leg boundary is an EASED tween, never an instant snap);
`teach_reveal_synced_to_narration` / `teach_show_quantity_live_when_named` / `teach_color_each_element_by_its_own_sign`
(already threaded into section 3's cue-arm/phase-fire discipline and the winner-hue X/Q colouring).
`--owner alex:physics_author` (7 rows) -- `DUALPANEL_RANGE_OFF` (generic dual-panel-graph directive: compute
y-range as [min(f(x)) minus 10%, max(f(x)) plus 10%] across the x-domain before declaring axis range) is the
DIRECT precedent for S10's p-pane auto-range requirement (A3b below) -- cited explicitly there;
`pcpl_radians_helper_missing` is N/A (this concept is field_3d, not PCPL -- `radians()` is the correct wrap
here, confirmed against the field_3d dialect). `ac_power_factor` / `series_lcr_circuit` (0 rows each -- not
yet seeded, expected pre-json_author). `--owner peter_parker:runtime_generation`: `default_variables_only_first_var_merged`
(FIXED) -- the canonical "declare every non-trivial-default variable explicitly" precedent, honored by
section 2's all-five-drivers-every-state discipline below. No new gap found beyond what the skeleton section 0a
table already threads.

**DC Pandey check:** none consulted. Every formula below is re-derived directly from p(t)=v(t) times i(t),
the settled series-LCR facts (Z, phi, cos phi = R over Z -- callbacks only, never re-derived), elementary
trig product-to-sum identities, and calculus (the one closed-form integral, E_R(t)). Independently re-verified
numerically below, not copied from the skeleton's own arithmetic -- every locked number reproduced from the
raw defaults.

**Phase-reference resolution (binding, inherited from `series_lcr_circuit`'s resolved convention -- restated
here for this concept's own formulas, since S9's derivation text as loosely phrased in the skeleton
["p=vm im sin(wt) times sin(wt minus phi)"] uses the opposite reference from the settled sibling convention
and must be corrected before it reaches json_author):**

```
theta(t) = omega_deg_per_s * t          [state-local clock, theta0 = 0 for EVERY state, Rule 26]
i(t)  = im * sin(theta)                 [CURRENT is the 0-deg-offset reference -- same convention as slcr]
v(t)  = vm * sin(theta + phi)           [SOURCE, offset +phi from i; phi = atan2(X, R), X = X_L - X_C]
```
phi positive (X_L wins, the only case this concept's work point uses) gives the source arrow AHEAD of i by
phi -- current LAGS the source (inductive), matching "phi=56.3deg, current lags" throughout. S9's chain below
is written `p(t) = i(t) times v(t) = im times vm times sin(theta) times sin(theta+phi)`, the internally-
consistent form -- **json_author/engine: implement i(t) as the 0-phase reference and v(t) as the +phi-offset
source, never the skeleton's loosely-stated literal phrasing.** Verified bit-for-bit against every numeric
checkpoint below.

---

## Section 1. `physics_engine_config`

```json
{
  "variables": {
    "vm": { "name": "Peak (amplitude) source voltage", "unit": "V", "min": 2, "max": 20, "default": 10.0, "step": 1, "role": "driver" },
    "f":  { "name": "Demo-compressed AC frequency (same slider role as the sibling series_lcr_circuit f_demo; real mains is tens of Hz)", "unit": "Hz", "min": 0.1, "max": 0.5, "default": 0.25, "step": 0.05, "role": "driver" },
    "R":  { "name": "Resistance of the heater element", "unit": "Ohm", "min": 2, "max": 20, "default": 5.0, "step": 1, "role": "driver" },
    "L":  { "name": "Self-inductance of the coil (off-grid default, F8/snap-on-first-drag pattern, fleet convention)", "unit": "H", "min": 1.0, "max": 10.0, "default": 3.1831, "step": 0.1, "role": "driver" },
    "C":  { "name": "Capacitance of the plates (off-grid default, F8/snap-on-first-drag pattern, fleet convention)", "unit": "F", "min": 0.04, "max": 0.40, "default": 0.1273, "step": 0.02, "role": "driver" },

    "omega":           { "name": "True angular frequency (rad/s) -- used ONLY inside closed-form calculus (E_R_t), never for on-screen degree display", "unit": "rad/s", "derived": "omega = 2*PI*f" },
    "omega_deg_per_s": { "name": "Angular speed in deg/s -- drives the degree-native rendering clock theta(t)", "unit": "deg/s", "derived": "omega_deg_per_s = omega * 180/PI = 360*f" },
    "theta":           { "name": "Instantaneous phase, the state's own clock (Rule 26), degree-native. theta0=0 in EVERY state.", "unit": "deg", "derived": "theta = omega_deg_per_s * t   [t = time since STATE ENTRY, pure closed form, no accumulator]" },
    "T":               { "name": "Period of one full AC cycle at the currently active f", "unit": "s", "derived": "T = 1/f" },

    "X_L": { "name": "Inductive reactance (callback token from series_lcr_circuit; L has a native Unicode subscript)", "unit": "Ohm", "derived": "X_L = omega*L = 2*PI*f*L" },
    "X_C": { "name": "Capacitive reactance (callback token; C has NO native Unicode subscript, needs the compose routine per the slcr precedent)", "unit": "Ohm", "derived": "X_C = 1/(omega*C) = 1/(2*PI*f*C)" },
    "X":   { "name": "Net (signed) reactance -- callback from slcr, winner-hue colour (violet X_L wins / green X_C wins)", "unit": "Ohm", "derived": "X = X_L - X_C" },
    "Z":   { "name": "Impedance -- callback from slcr, the S8 triangle hypotenuse before its power-triangle morph", "unit": "Ohm", "derived": "Z = sqrt(R^2 + X^2)" },
    "im":  { "name": "Peak (amplitude) current -- the amber reference, callback from slcr", "unit": "A", "derived": "im = vm/Z" },
    "phi": { "name": "Phase angle -- angle by which the SOURCE leads the current (positive = current lags = inductive dominant). Settled/named in series_lcr_circuit; RE-USED here without re-derivation.", "unit": "deg", "derived": "phi = atan2(X, R) * 180/PI" },
    "cosphi": { "name": "Power factor -- fraction of apparent power that is real. Dual-labeled once at S4 (power factor cos phi), bare thereafter (38d).", "unit": "dimensionless", "derived": "cosphi = R/Z   [= P/S identically, S4 closure]" },
    "sinphi": { "name": "Signed quadrature fraction (never separately named on-canvas; feeds Q and i_perp only)", "unit": "dimensionless", "derived": "sinphi = X/Z" },

    "V_rms": { "name": "RMS source voltage -- the DC-equivalent rating, callback from ac_voltage_resistor", "unit": "V", "derived": "V_rms = vm/sqrt(2)" },
    "I_rms": { "name": "RMS current -- REQUIRES 3dp display (A8 binding) so the S4/S5/S7 displayed-addend chips close", "unit": "A", "derived": "I_rms = im/sqrt(2)" },

    "v_t": { "name": "Instantaneous SOURCE voltage -- strip cyan trace / fan cyan arrow projection", "unit": "V", "derived": "v_t = vm * sin(radians(theta + phi))" },
    "i_t": { "name": "Instantaneous current -- strip amber trace / fan amber arrow projection / bead-drive value", "unit": "A", "derived": "i_t = im * sin(radians(theta))" },
    "p_t": { "name": "Instantaneous TOTAL circuit power p=v*i -- SIGNED, can go negative off resonance (L/C returning energy). MUST be the LITERAL pointwise product of v_t and i_t at the SAME theta sample -- never an independently-computed curve that merely agrees (32a caution, restated from slcr).", "unit": "W", "derived": "p_t = v_t * i_t" },
    "p_R_t": { "name": "Instantaneous power actually DISSIPATED in R alone -- ALWAYS >= 0, the correct driver for the heater glow. Distinct from signed p_t, which includes L/C borrowed-and-returned share.", "unit": "W", "derived": "p_R_t = i_t^2 * R" },
    "P": { "name": "Average (real) power -- the wattmeter steady reading, S4/S7/S9 payoff. Ring: CORE.", "unit": "W", "derived": "P = V_rms*I_rms*cosphi = I_rms^2*R   [three equivalent routes, S7 closure]" },
    "S": { "name": "Apparent power -- the naive volts-times-amps ceiling. A2 binding: the CONCEPT and this VALUE are CORE, debut at S4 (needed for pivot #1); only the formal VA-unit power-TRIANGLE-leg-chip is EXTENDED (S8).", "unit": "VA", "derived": "S = V_rms*I_rms   [= I_rms^2*Z identically]" },
    "Q": { "name": "Reactive power. A5 binding Q-symbol-collision disarm: dual-label reactive power Q (VAR) at FIRST mention (S8), NEVER Q factor; this concept declares NO f0/delta_f/sharpness-Q variable anywhere (that symbol belongs to series_lcr_circuit only). Ring: EXTENDED.", "unit": "VAR", "derived": "Q = V_rms*I_rms*sinphi = I_rms^2*X" },

    "i_par":  { "name": "In-phase (power-hue) current component -- the shadow that does work, S5 PRIMARY aha", "unit": "A", "derived": "i_par = I_rms*cosphi" },
    "i_perp": { "name": "Quadrature (wattless) current component -- dual-labeled once at S5/S6 wattless (idle) current", "unit": "A", "derived": "i_perp = I_rms*sinphi" },

    "V_C_t": { "name": "Instantaneous capacitor voltage -- callback formula from slcr (lags i by 90deg), feeds E_C_t only", "unit": "V", "derived": "V_C_t = im*X_C*sin(radians(theta - 90))" },
    "E_L_t": { "name": "Instantaneous inductor energy -- breathes 0..E_L_peak, net zero per cycle (S7)", "unit": "J", "derived": "E_L_t = 0.5*L*i_t^2" },
    "E_L_peak": { "name": "Peak inductor energy at the current im", "unit": "J", "derived": "E_L_peak = 0.5*L*im^2" },
    "E_C_t": { "name": "Instantaneous capacitor energy -- breathes 0..E_C_peak, net zero per cycle, OPPOSITE phase from E_L_t (quadrature energy exchange -- current peak coincides with capacitor-voltage zero)", "unit": "J", "derived": "E_C_t = 0.5*C*V_C_t^2" },
    "E_C_peak": { "name": "Peak capacitor energy", "unit": "J", "derived": "E_C_peak = 0.5*C*(im*X_C)^2" },
    "E_R_t": { "name": "Cumulative energy dissipated in R since STATE ENTRY (Rule 26 state-local clock) -- CLOSED-FORM integral of i(t)^2*R dt, NEVER an accumulator (B1 scar discipline). Monotone non-decreasing by construction (dE_R/dt = p_R_t >= 0).", "unit": "J", "derived": "E_R_t = P*t - (P/(2*omega))*sin(2*omega*t)   [t in s, sin argument in TRUE radians via omega=2*PI*f, NOT the degree-native theta]" },

    "bead_frac": { "name": "Micro-band bead position along the shared loop path (heater-coil-plates, ONE stream, never splits/pools) -- callback pattern from slcr", "unit": "dimensionless", "derived": "bead_frac = 0.5 - A_frac*cos(radians(theta))" },
    "A_frac":    { "name": "Bead-excursion visual scale -- reused verbatim from ac_voltage_resistor precedent formula, calibrated to 0.30 at defaults", "unit": "dimensionless", "derived": "A_frac = clamp(0.30 * (im/omega) / (2.00/1.5708), 0.08, 0.42)" },

    "P_REF_R": { "name": "FIXED heater-glow reference (never self-normalized per-frame) -- equals BOTH vm*im and R*im^2 at resonance defaults (20.0 W), so a bigger vm/smaller R genuinely glows brighter, not just brighter relative to its own instantaneous peak", "unit": "W", "constant": 20.0 },

    "f_glide_deltaT":      { "name": "S3 f-glide schedule duration (reused verbatim from series_lcr_circuit S2 0.25 to 0.50Hz glide -- same endpoints, same closed form)", "unit": "s", "constant": 3.0 },
    "R_cycle_down_deltaT": { "name": "S6 R-cycle leg A duration (5.0 to 2.0 Ohm)", "unit": "s", "constant": 1.2 },
    "R_cycle_hold_deltaT": { "name": "S6 R-cycle paradox-hold beat at R=2.0 Ohm", "unit": "s", "constant": 1.0 },
    "R_cycle_up_deltaT":   { "name": "S6 R-cycle leg A-prime duration (2.0 to 5.0 Ohm, EASED return -- never an instant snap, ghost_compare_b_handoff_instant_snap prevention)", "unit": "s", "constant": 1.2 }
  },

  "computed_outputs": {
    "v_display":       { "formula": "vm*Math.sin((theta+phi)*Math.PI/180)" },
    "i_display":       { "formula": "im*Math.sin(theta*Math.PI/180)" },
    "p_display":       { "formula": "v_display*i_display" },
    "pR_display":      { "formula": "i_display*i_display*R" },
    "XL_display":      { "formula": "2*Math.PI*f*L" },
    "XC_display":      { "formula": "1/(2*Math.PI*f*C)" },
    "X_display":       { "formula": "XL_display-XC_display" },
    "Z_display":       { "formula": "Math.sqrt(R*R+X_display*X_display)" },
    "im_display":      { "formula": "vm/Z_display" },
    "phi_display":     { "formula": "Math.atan2(X_display,R)*180/Math.PI" },
    "cosphi_display":  { "formula": "R/Z_display" },
    "sinphi_display":  { "formula": "X_display/Z_display" },
    "Vrms_display":    { "formula": "vm/Math.sqrt(2)" },
    "Irms_display":    { "formula": "im_display/Math.sqrt(2)" },
    "P_display":       { "formula": "Vrms_display*Irms_display*cosphi_display" },
    "S_display":       { "formula": "Vrms_display*Irms_display" },
    "Q_display":       { "formula": "Vrms_display*Irms_display*sinphi_display" },
    "ipar_display":    { "formula": "Irms_display*cosphi_display" },
    "iperp_display":   { "formula": "Irms_display*sinphi_display" },
    "EL_display":      { "formula": "0.5*L*i_display*i_display" },
    "VC_display":      { "formula": "im_display*XC_display*Math.sin((theta-90)*Math.PI/180)" },
    "EC_display":      { "formula": "0.5*C*VC_display*VC_display" },
    "ER_display":      { "formula": "P_display*t - (P_display/(2*(2*Math.PI*f)))*Math.sin(2*(2*Math.PI*f)*t)" },
    "beadfrac_display":{ "formula": "0.5 - A_frac*Math.cos(theta*Math.PI/180)" }
  },

  "formulas": {
    "reference_convention":    "i(t)=im sin(theta) is the 0-phase reference; v(t)=vm sin(theta+phi) is the SOURCE, offset +phi ahead -- inherited verbatim from series_lcr_circuit resolved convention",
    "instantaneous_power":     "p(t)=v(t)*i(t) -- the literal pointwise product, sample-for-sample with the strip own v/i traces (S2/S3)",
    "resistor_power":          "p_R(t)=i(t)^2*R >= 0 always -- the ONLY power that ever actually lands (S7); distinct from the SIGNED total p(t)=v*i which includes L/C borrowed-and-returned share",
    "average_power":           "P = <p(t)> = V_rms*I_rms*cosphi = I_rms^2*R (S4/S7/S9)",
    "apparent_power":          "S = V_rms*I_rms (S4, CORE -- the volts-times-amps ceiling)",
    "power_factor":            "cosphi = R/Z = P/S (S4 callback to the delivered impedance triangle)",
    "reactive_power":          "Q = V_rms*I_rms*sinphi = I_rms^2*X (S8, EXTENDED -- dual-label reactive power Q (VAR) once, never Q factor)",
    "current_components":      "i_par = I_rms*cosphi (power-hue, along v); i_perp = I_rms*sinphi (wattless, perpendicular to v); the vector sum i_par + i_perp = i (S5)",
    "energy_ledger":           "E_L(t)=0.5*L*i(t)^2, E_C(t)=0.5*C*v_C(t)^2 both breathe (net zero per cycle, opposite phase); E_R(t)=P*t-(P/(2*omega))*sin(2*omega*t) ratchets monotonically (S7)",
    "power_triangle":          "P=I_rms^2*R, Q=I_rms^2*X, S=I_rms^2*Z -- literally the impedance triangle (R,X,Z) uniformly scaled by I_rms^2, right angle preserved (S8)",
    "derivation_chain":        "p(t) = i(t)*v(t) = im*vm*sin(theta)*sin(theta+phi) = (vm*im/2)*[cos(phi) - cos(2*theta+phi)] -> average = (vm*im/2)*cos(phi) = V_rms*I_rms*cos(phi) (S9)"
  },

  "constraints": [
    "P = I_rms^2*R = V_rms*I_rms*cosphi at every steady state -- three routes, one number.",
    "S = V_rms*I_rms is the CEILING; P <= S always, with equality only at cosphi=1 (unity power factor, resonance in this build).",
    "Q is never lost energy -- it is borrowed and returned by L and C every cycle (net zero) -- but the wires still carry the current that creates it.",
    "cosphi = R/Z is bounded in [0,1] for any R>0, Z>=R>0 -- never negative, never exceeds 1.",
    "S^2 = P^2 + Q^2 is exact in TRUE (unrounded) values -- the displayed 2dp addends do NOT close this identity; never render it as a chippable arithmetic equation (F7).",
    "p_R(t) = i(t)^2*R is never negative -- the resistor never returns energy; only the TOTAL p(t)=v*i (which includes L/C exchange) goes negative off resonance."
  ]
}
```

**Numerical sanity check (independently re-verified, matches skeleton section 2 exactly):**
- **Default = resonance** (vm=10.0, f=0.25, R=5.0, L=3.1831, C=0.1273): X_L=20.000*0.25=5.000,
  X_C=1.2502/0.25=5.001, X~=-0.001~=0, Z~=5.0, im=10/5=2.00 A, phi~=0, cosphi=1.000. V_rms=7.0711,
  I_rms=1.4142->1.414. P=V_rms*I_rms=7.0711*1.4142=10.00 W = I_rms^2*R = 2.000*5.0 = 10.00 -- EXACT match
  to ac_voltage_resistor own <p>=10.0 W (coincidence #1, TAUGHT callback). p(t)=P-S*cos(2*theta)
  =10-10*cos(2*theta) since S=P=10 here -> ranges 0..20.0 W, offset 10.0 W.
- **Work point** (f=0.50, R=5.0 unchanged): X_L=10.000, X_C=2.5004, X=7.4996, Z=sqrt(25+56.244)=9.0135->9.0.
  im=10/9.0135=1.1094->1.11, I_rms=0.78449->0.785, phi=atan2(7.4996,5)=56.309deg->56.3, cosphi=5/9.0135
  =0.55471->0.555, sinphi=7.4996/9.0135=0.83201->0.832. S=7.0711*0.78449=5.5472->5.55. P=S*cosphi
  =5.5472*0.55471=3.0770->3.08 (also I_rms^2*R=0.78449^2*5=3.0771->3.08 -- both routes agree). Q=S*sinphi
  =5.5472*0.83201=4.6153->4.62. p(t)=P-S*cos(2*theta+phi)=3.08-5.55*cos(2*theta+56.3deg) -> range
  3.08-5.55=-2.47 .. 3.08+5.55=8.62 W -- matches skeleton exactly.
- **Components** (work point): i_par=I_rms*cosphi=0.78449*0.55471=0.43518->0.435, i_perp=I_rms*sinphi
  =0.78449*0.83201=0.65272->0.653. Check V_rms*i_par=7.0711*0.43518=3.0770->3.08=P (displayed
  7.07*0.435=3.0755->3.08, closes). i_par^2+i_perp^2=0.435^2+0.653^2=0.189225+0.426409=0.615634 vs
  I_rms^2=0.785^2=0.616225 -- close but NOT exact at displayed precision (never chipped, section 4).
- **S6 R-step** (R=2.0, f=0.50, X unchanged=7.4996): Z=sqrt(4+56.244)=sqrt(60.244)=7.7616->7.76,
  phi=atan2(7.4996,2)=75.06deg->75.1, cosphi=2/7.7616=0.25767->0.258, I_rms=7.0711/7.7616=0.91103->0.911
  (UP from 0.785). P=I_rms^2*R=0.91103^2*2=0.82997*2=1.65994->1.66 (DOWN from 3.08). i_par=0.91103*0.25767
  =0.23478->0.235, i_perp=0.91103*0.96624=0.88024->0.880 (sinphi=7.4996/7.7616=0.96624). S=7.0711*0.91103
  =6.4425->6.44. Paradox exact: +16.1% current, -46.1% power.
- **S7 energies** (work point, T=1/0.50=2.00 s): E_R/cycle=P*T=3.0771*2.00=6.1541->6.15 J. E_L_peak
  =0.5*3.1831*(1.1094)^2=0.5*3.1831*1.23078=1.9591->1.96 J. V_C_peak=im*X_C=1.1094*2.5004=2.7739 V,
  E_C_peak=0.5*0.1273*2.7739^2=0.5*0.1273*7.6945=0.48981->0.49 J.
- **Explore sign flip**: R=2.0 AT RESONANCE (f=0.25, X~=0): Z=R=2.0, I_rms=V_rms/R=7.0711/2=3.5355 A,
  P=V_rms^2/R=7.0711^2/2=50.0/2=25.0 W -- matches skeleton exactly (opposite direction from the S6 drop,
  mechanism dP/dR is proportional to (X^2-R^2): at f=0.50, X=7.50>R so lowering R raises current but the
  dominant reactance still throttles power down; at resonance X=0<R so lowering R raises power, same
  underlying law "only in-phase current works", different regime).
- **S8 morph** (uses TRUE unrounded Z=9.0135, I_rms^2=0.61543 -- never the displayed-rounded 9.0):
  R*I_rms^2=5.0*0.61543=3.0771->3.08=P; X*I_rms^2=7.4996*0.61543=4.6153->4.62=Q; Z*I_rms^2=9.0135*0.61543
  =5.5470->5.55=S -- confirms the power triangle IS the impedance triangle scaled by I_rms^2 exactly, no
  separate computation needed.
> **⚠ ORCHESTRATOR CORRECTION (2026-07-24, founder-proxy Checkpoint B).** The `I_rms = 0.78449 -> 0.785` display value in this section is a DOUBLE-ROUNDING SLIP: 0.784498 SINGLE-rounds to **0.784** at 3dp (4th digit is 4). Everywhere this doc writes I_rms's DISPLAY as `0.785` it should read **0.784**, and the F7 chip-closure claim `7.07*0.785=5.55` is SUPERSEDED: the true displayed product 7.07*0.784=5.54 does NOT equal S's canonical 2dp value 5.55. Resolution (engine fix, S4 pwrDrawChips): the naive apparent-power chip renders S SYMBOLICALLY as `V_rms x I_rms = 5.55 W?` (S.toFixed(2)), not a literal numeric product — so apparent power reads one value (5.55) across the S4 chip, the ratio line, the S8 triangle, and narration. The specced S7 `0.785^2*5=3.08` close-chip is likewise wrong (true 0.784^2*5=3.07) — it was correctly never rendered; its value is carried by the +6.15 J/cyc gauge + narration. All OTHER numbers here (S=5.55, P=3.08, Q=4.62, cosphi=0.555, components 0.435/0.653) are correct.

- Chips verified at DISPLAYED precision (F7 clean, SUPERSEDED — see correction above): 7.07*0.785=5.55 -> 3.08/5.55=0.555 -> 0.785^2*5=3.08
  -> 7.07*0.435=3.08 -> 5.55*0.555=3.08. Never-closing at displayed precision: 0.435^2+0.653^2=0.616 vs
  0.785^2=0.616 (rounds to same 3dp by coincidence at THIS point but the true 4th-decimal values differ --
  declared never-chipped for robustness across the explore range); 3.08^2+4.62^2=9.4864+21.3444=30.8308
  vs 5.55^2=30.8025 -- does NOT close, never chipped (section 4).

---

## Section 2. Per-state `variable_overrides` (all 10 states)

Every state carries an EXPLICIT entry value for all five drivers (vm, f, R, L, C), never "inherited from
the previous state" -- satisfying Rule 25d (a teacher can jump to any state via the state rail) and the
`default_variables_only_first_var_merged` scar precedent. For the two scripted-schedule states (S3's f-glide,
S6's R-cycle), the table gives the ENTRY value of the scripted variable; the full schedule is in section 3.

| State | vm | f | R | L | C | Live control(s) | Why |
|---|---|---|---|---|---|---|---|
| S1 the_wattmeter_reads_ten | 10.0 | 0.25 | 5.0 | 3.1831 | 0.1273 | none | Full lock at defaults -- the 10.0 W "law seems perfect" plant needs Z=R exactly (resonance, not yet named). |
| S2 the_product_wave | 10.0 | 0.25 | 5.0 | 3.1831 | 0.1273 | none | Full lock -- the twin-hump, touching-zero-never-negative p-curve needs cosphi=1 exactly (phi=0 requires the resonance defaults). |
| S3 off_resonance_the_wave_sinks | 10.0 | 0.25 (scripted entry; glides to 0.50) | 5.0 | 3.1831 | 0.1273 | f (drag-seize post-glide) | vm/R/L/C locked so ONLY the frequency-caused sink is visible (32b); the glide endpoint (X_L=10.00, X_C=2.50, Z=9.0, P=3.08) depends on R/L/C sitting exactly at defaults regardless of state-rail reorder. |
| S4 volts_times_amps_fails | 10.0 | 0.50 | 5.0 | 3.1831 | 0.1273 | none | CRITICAL defensive lock of f to the work point, independent of whether S3 actual glide played (Rule 25d) -- the struck 5.55 W chip and the 0.555 ratio are exact only here. |
| S5 only_the_shadow_works | 10.0 | 0.50 | 5.0 | 3.1831 | 0.1273 | none | Full lock, same defensive reasoning as S4 -- the component split (0.435/0.653 A) and the 7.07*0.435=3.08 check are exact only at the work point. |
| S6 wattless_current | 10.0 | 0.50 (CRITICAL defensive relock -- S3 may have left f live-dragged elsewhere) | 5.0 (scripted entry; cycles to 2.0 and back) | 3.1831 | 0.1273 | R (plain-live, after the scripted cycle returns it to 5.0) | vm/f/L/C locked so ONLY R's effect is visible (32b); the paradox numbers (I_rms 0.785->0.911, P 3.08->1.66) are exact only at the work point. |
| S7 where_the_power_goes | 10.0 | 0.50 | 5.0 (defensive relock -- S6 left R live-dragged) | 3.1831 | 0.1273 | none | Full lock -- E_L_peak=1.96 J, E_C_peak=0.49 J, E_R/cycle=6.15 J are exact only at these values. |
| S8 the_power_triangle | 10.0 | 0.50 | 5.0 | 3.1831 | 0.1273 | none | Full lock -- the morph legs (P=3.08, Q=4.62, S=5.55) need the TRUE unrounded Z=9.0135 and I_rms=0.78449 at the work point. |
| S9 the_average_from_the_algebra | 10.0 | 0.50 | 5.0 | 3.1831 | 0.1273 | none | Full lock -- the numeric substitution 5.55*0.555=3.08 W must match the sealed decimals exactly; apparatus dims (E4), no live interaction. |
| S10 power_sandbox | 10.0 (default entry) | 0.25 (default entry) | 5.0 (default entry) | 3.1831 (default entry) | 0.1273 (default entry) | ALL: vm, f, R, L, C | Explore (Rule 37) -- NO `variable_overrides` object authored (inherits `default_variables`, matching the fleet exemple explore-row convention); entry values enumerated above only for completeness. |

---

## Section 3. Within-state motion timeline (all 10 states)

**Shared machinery (defined once, referenced per state):** theta(t) = omega_deg_per_s*t, theta=0 at every
state's OWN entry (Rule 26, no anchor needed). i_t = im*sin(radians(theta)); v_t = vm*sin(radians(theta+phi));
p_t = v_t*i_t (LITERAL pointwise product, 32a binding); p_R_t = i_t^2*R (the ALWAYS-non-negative resistor-only
power, the correct heater driver, distinct from signed p_t). `bead_frac(t)` drives the ONE amber bead stream
threading heater-coil-plates uniformly (never splits/pools, callback pattern from series_lcr_circuit); direction
flips at every zero crossing of i_t. Heater emissive = clamp(p_R_t / P_REF_R, 0, 1), P_REF_R=20.0 W FIXED
(never self-normalized per-frame, matching ac_voltage_resistor own P_REF precedent) -- coil and plates carry
NO analogous glow (they never dissipate real power; their own energy gauges breathe instead, S7). All formulas
are pure functions of state-local `t` -- zero per-frame accumulators anywhere (B1 scar discipline), verified
byte-stable under SET_TIME_FREEZE by construction (no history term appears in any formula above). Both S1 and
S3 carry **NO formula overlay** (deliberate -- section 4.6): S1 to avoid consecrating the P=VI belief S4 later
breaks, S3 because it is the mystery state (no named quantity yet).

### S1 the_wattmeter_reads_ten -- core -- reveal-build

| t-window | What animates | Driven by | Live controls |
|---|---|---|---|
| [0, 1.5s] cue `meter_dock` | Averaging wattmeter docks on the wire (slide/fade in), needle at rest | scripted one-shot | none |
| [1.5, 3.0s] cue `needle_climb` | Needle sweeps up to its steady reading; HUD chips V_rms=7.07, I_rms=1.414 fade in beside it | P (closed-form, = 10.00 W at these defaults) | -- |
| continuous from t=0 | Beads thread heater-coil-plates per `bead_frac(t)`; heater glows per the p_R_t/P_REF_R ratio (peaks bright, since at resonance p_R_t=p_t, the whole circuit power lands in R) | i_t, theta(t) | -- |
| [3.0, 4.0s] cue `chip_multiply` | Spoken multiply "7.07 x 1.414 = 10.0" lands beside the settled needle | -- | -- |

No formula overlay (deliberate, see preamble). glow_focal = meter. Plant (coincidence #1, TAUGHT callback):
P=10.00 W here EXACTLY equals ac_voltage_resistor own <p>=10.0 W -- authored strictly as a parked observation
("the bare heater ate exactly this"), never framed as "the normal reading" and carries no resonance hint (same
framing discipline as the sibling slcr S1 plant).

### S2 the_product_wave -- core -- product-walk (fleet reuse)

Entry at resonance (theta(t)=360*0.25*t=90*t deg/s). Cue-bound band + p-pane dock, then cursor walk:

| Cue | ~t | Event |
|---|---|---|
| `band_dock` | 0-1.2s | Strip docks (cyan v-trace + amber i-trace, IN STEP since phi=0 at resonance) |
| `ppane_dock` | 1.2-2.0s | p-pane docks beneath, time-axis PIXEL-ALIGNED with the strip (binding invariant, fills the chapter-long empty power slot) |
| `cursor_walk` | 2.0s+ | Cursor walks one full v/i period (T=4.0s at f=0.25) sampling both traces and multiplying pointwise: t=0 (v=0,i=0,p=0, touches zero) -> t=1.0s (v=10.0,i=2.00,p=20.0, first peak, +x+) -> t=2.0s (v=0,i=0,p=0, touches zero) -> t=3.0s (v=-10.0,i=-2.00,p=20.0, second peak, -x-, the same 20.0 W) -> t=4.0s (v=0,i=0,p=0, loop closes) |
| `avg_dock` | after the walk | Dashed average line lands at P=10.0 W; needle (from S1, still docked) sits on it |

After the walk, the full p-curve continues sweeping continuously (twin humps per v/i cycle, period T/2=2.0s,
touching zero, never negative -- exact since cosphi=1 here). Formula overlay: `p(t) = v(t)*i(t)` (algebra-only,
core-ring). glow_focal = p_pane. **32a caution (restated from slcr):** p_t is the LITERAL pointwise product of
the SAME theta(t) sample driving the strip traces -- never an independently-animated curve that merely agrees.
No live controls.

### S3 off_resonance_the_wave_sinks -- core -- ramp-response

f LOCKED entry at 0.25 (section 2). **Cause-first (32a):** f-thumb glide, closed-form smoothstep, reused
verbatim from series_lcr_circuit S2 (identical endpoints and schedule -- REUSE manifest):
```
f(u) = 0.25 + 0.25*smoothstep(u),  smoothstep(u)=3u^2-2u^3,  u=t/3.0, u in [0,1]   [f_glide_deltaT=3.0s]
theta(t) = 360 * integral_0^t f(t')dt'   [degree-native, same closed form as the slcr S2 lemma]
theta(3.0) = 405 deg   [endpoint, verified identical to slcr]
```
At u=1 (t=3.0s): X_L=10.00, X_C=2.50, X=7.50, Z=9.01, im=1.11 A, phi=56.3deg (not yet named), P=3.08 W.
**Effect after a readable ~0.6-1.0s beat (32a):** beads visibly slow; i-crest visibly detaches and drifts late
relative to v-crest (no phi symbol, no numeral -- the slip stays purely visual, matching the family's A2
no-pre-spoil discipline carried from slcr); the p-pane curve SINKS below zero starting around t~1.0-1.5s into
the glide, troughs filling with the desaturated blue-grey "returned" tint; the dashed average line + needle
slide continuously from 10.0 W toward 3.08 W, settling exactly at the glide endpoint. No formula overlay
(deliberate, mystery state). **Drag-seize:** the instant the teacher grabs f, the script halts permanently for
this state-entry; theta(t) recomputes live every frame from whatever the slider currently reads. glow_focal
= p_pane.

### S4 volts_times_amps_fails -- core -- ghost-overlay-compare -- 16a PIVOT #1

f LOCKED at 0.50 (section 2, CRITICAL defensive relock). **Wrong-consequence-first (Rule 16a):**

| Cue | ~t | Event |
|---|---|---|
| `ghost_swing` | 0-1.5s | A ghost needle (second, dashed instrument overlay) swings to S=5.55 W -- the naive volts-times-amps prediction |
| `chip_strike` | 1.5-3.0s | Chip lands "7.07 x 0.785 = 5.55 W?" beside the ghost; the REAL needle (from S1/S2/S3, still docked) holds steady at 3.08 W the whole time; chip visibly STRUCK (strikethrough) |
| `ratio_reveal` | 3.0-4.5s | New chip "3.08 / 5.55 = 0.555" appears, UN-struck |
| `triangle_dock` | 4.5-6.0s | The delivered impedance triangle (R=5.0, X=7.50, Z=9.0, callback from series_lcr_circuit, NOT re-derived) docks; its angle phi brightens |
| `naming` | 6.0-7.0s | Ratio chip and triangle-angle chip visually LINK (same 0.555 number): "cos 56.3deg = R/Z = 5/9.0 = 0.555 -- same number." Named: power factor cos phi |

Ghost needle F1-cleared on state exit. Formula overlay: `P = V_rms*I_rms*cos(phi)` (algebra-only, core-ring,
debuts here). glow_focal = chips. **misconception_watch (16a PIVOT #1):** belief = "average AC power is
V_rms times I_rms" (earned honestly: S1 showed exactly this at unity, S2/S3 never contradicted it). visual_counter
= the struck 5.55 W chip beside the real, unmoving 3.08 W needle. one_line_fix = "Volts times amps is the
apparent power -- the ceiling; the real power is that times cos phi, the fraction that survives the circuit
own angle."

### S5 only_the_shadow_works -- core -- component-split (coin) -- PRIMARY AHA

f LOCKED at 0.50 (section 2). Fan docks (v cyan + i amber, 56.3deg apart, one rotating clock, callback fan
geometry from slcr):

| Cue | ~t | Event |
|---|---|---|
| `fan_dock` | 0-1.0s | v and i arrows rotate rigidly together, 56.3deg apart (rotation CONTINUES, a beat of continuity) |
| `rotation_stop` | ~1.0s | Rotation HALTS at whatever angle is active (a simple halt, NOT a phase-matched freeze -- i_par/i_perp are LENGTH facts set by phi alone, true at any frozen instant, same discipline as slcr S5) |
| `split_reveal_par` | +0-0.8s after stop | From i's root, dashed i_par arrow materializes along v's own direction (angle=phi), length 0.435 A, power-hue, WITH a projection guide from i's tip |
| `split_reveal_perp` | +0.8-1.6s | Dashed i_perp arrow materializes perpendicular to v (angle=phi-90deg), length 0.653 A, violet (X_L-winner hue) |
| `check` | +1.6-2.6s | Chip "7.07 x 0.435 = 3.08 W" -- the meter number from the shadow alone |
| after check | continuous | Solid amber i persists throughout (one current, two accountings); clock RESUMES at the stop angle (no jump); whole assembly (v, i, i_par, i_perp) rotates rigidly |

Formula overlay: `P = V_rms*(I_rms*cos(phi))` (algebra-only, core-ring). glow_focal = i_split. **Vector-sum
probe (existence-table item):** i_par + i_perp (vector addition, i_par at angle phi, i_perp at angle phi-90deg)
reconstructs i exactly (magnitude I_rms at angle 0) -- verified: i_par vector=(0.435cos56.3,0.435sin56.3)=
(0.2413,0.3619), i_perp vector=(0.653cos(-33.7),0.653sin(-33.7))=(0.5433,-0.3622), sum=(0.7846,-0.0003)~=
(0.785,0)=i exactly. No live controls.

### S6 wattless_current -- core -- cycle-compare (A-to-B-to-A-prime) -- 16a PIVOT #2 + SUPPORTING AHA

f LOCKED at 0.50 (CRITICAL defensive relock, section 2). Fan/strip continue from S5's resumed spin. Scripted
R-cycle, EASED at every leg boundary (ghost_compare_b_handoff_instant_snap prevention -- never an instant
snap, Rule 32d):
```
Leg A (down):  R(tau) = 5.0 - 3.0*smoothstep(tau), tau = t_r/1.2   [R_cycle_down_deltaT=1.2s] -> R=2.0 at tau=1
Hold:          R = 2.0 held for 1.0s   [R_cycle_hold_deltaT] -- the paradox beat
Leg A' (up):   R(tau) = 2.0 + 3.0*smoothstep(tau), tau = t_r/1.2   [R_cycle_up_deltaT=1.2s] -> R=5.0 at tau=1
```
| Cue | ~t (cumulative) | Event |
|---|---|---|
| `r_step_down` | 0-1.2s | R-slider thumb visibly moves 5.0->2.0 Ohm; beads visibly SPEED UP (I_rms 0.785->0.911 A, UP) |
| `paradox_hold` | 1.2-2.2s | Needle FALLS 3.08->1.66 W (DOWN) while beads still fast; on the fan, i_perp fattens 0.653->0.880 A, i_par shrinks 0.435->0.235 A -- more amps, fewer watts. Callback spoken: "a lone coil ran two full amps, meter dead -- all i_perp." |
| `guard_clause` | during the hold | Spoken verbatim (A3 binding): "here reactance dominates -- at the home frequency dropping R does the opposite." |
| `r_step_up` | 2.2-3.4s | R eases back 2.0->5.0 Ohm (A', EASED not snapped); needle/beads/fan return to the S5 work-point values |

After the cycle, R goes plain-live (drag-seize), starting from 5.0. Dual-label ONCE here: "wattless (idle)
current" for I_rms*sin(phi). Formula overlay: `I_wattless = I_rms*sin(phi)` (algebra-only, core-ring).
glow_focal = meter. **misconception_watch (16a PIVOT #2):** belief = "a big AC current always means big power
consumption" (earned honestly: S1-S4 co-moved current and power in every demonstration so far). visual_counter
= the R-step: I_rms climbs 0.785->0.911 while the meter FALLS 3.08->1.66, i_perp fattening on the fan.
one_line_fix = "Only the in-phase part of the current does work -- the extra amps are wattless: they shuttle
energy back and forth without spending it."

### S7 where_the_power_goes -- core -- oscillate/track

Full lock at work point (R defensively relocked to 5.0, section 2). Three energy gauges dock side by side
(clone of `acl_u_gauge`, callback machinery):

| Cue | ~t | Event |
|---|---|---|
| `gauges_dock` | 0-1.2s | E_L, E_C, E_R gauges dock (side by side, per section 0b req 7) |
| continuous | -- | E_L(t) = E_L_peak*sin(radians(theta))^2 breathes 0->1.96->0->1.96->0 J, period T/2=1.0s, peaks at theta=90,270deg (t=0.5,1.5s) |
| continuous | -- | E_C(t) = E_C_peak*cos(radians(theta))^2 breathes 0->0.49->0 J, SAME period, but peaks at theta=0,180deg (t=0,1.0s) -- exactly OPPOSITE phase from E_L (quadrature energy exchange: when current peaks, L holds all the stored energy and C holds none, and vice versa) |
| continuous | -- | **A6 prominence requirement:** E_R(t) = P*t - (P/(2*omega))*sin(2*omega*t) RATCHETS monotonically, +6.15 J every full cycle (T=2.0s); the heater mesh warms into the power hue as E_R climbs (driven by p_R_t, never negative); coil and plates stay VISIBLY cold throughout (no comparable glow channel on them -- only their gauges breathe) |
| `close_chip` | after ~1 full cycle | Chip lands: "0.785^2 x 5.0 = 3.08 W" -- the meter number a third way |

Formula overlay: `P = I_rms^2*R` (algebra-only, core-ring). glow_focal = gauges. No live controls. **This is
where the taught variable physically lands (A6)** -- the ONLY macroscopic object that warms is the heater;
L and C only breathe.

### S8 the_power_triangle -- extended -- unit-morph (fleet reuse from slcr)

Full lock at work point (section 2). The impedance triangle (still on-screen from S4/S5's callback, R=5.0,
X=7.50, Z=9.0135 TRUE) detaches and re-scales:

| Cue | ~t | Event |
|---|---|---|
| `triangle_detach` | 0-0.8s | Triangle stops tracking Z/phi live, detaches for the morph |
| `rescale_morph` | 0.8-2.3s | Scripted eased tween: every leg multiplies by TRUE I_rms^2=0.61543 (never the displayed-rounded 9.0) -- legs shrink from Ohm-lengths to Watt/VAR/VA-lengths in one continuous move |
| `relabel` | 2.3-3.3s | Legs relabel/recolour: R-leg -> P=3.08 W (power hue), X-leg -> Q=4.62 VAR (violet, X_L winner), hypotenuse Z-leg -> S=5.55 VA (cyan). Dual-labels ONCE: "real (active) power W", "reactive power Q (VAR)" -- never "Q factor" (A5 binding), "apparent power VA" |
| `check_chip` | 3.3-4.3s | Chip "cos phi = P/S = 3.08/5.55 = 0.555" (matches S4's number) |
| `clause` (spoken, no new geometry) | -- | "Q is not lost -- borrowed and returned -- but the wires must still carry it. At the home frequency this triangle collapses flat: all real." (callback to resonance, where X=0 hence Q=0 and the triangle degenerates to a single P=S line) |

Right angle preserved through the morph, >=12px vertex margins BOTH winner cases (closes the slcr S6 down-leg
clip scar in-clone, per skeleton section 0a). Formula overlay: `S^2 = P^2 + Q^2` (SYMBOLIC/GEOMETRIC ONLY --
NEVER an arithmetic chip, section 4 F7 discipline; the numeric check that DOES chip is cos phi = P/S). glow_focal
= triangle. No live controls.

### S9 the_average_from_the_algebra -- advanced -- chain-link-derivation (fleet reuse)

Full lock at work point (section 2). Apparatus dims (E4 restore pattern, reveal_hold). Cambria chain docks
link by link, using the RESOLVED reference convention (top of file):

| Cue | ~t | Event |
|---|---|---|
| `link1` | 0-2.0s | "p(t) = i(t) x v(t) = im sin(theta) x vm sin(theta+phi)" docks |
| `link2` | 2.0-4.0s | Product-to-sum: "-> (vm im / 2) x [cos(phi) - cos(2*theta+phi)]" docks |
| `link3` | 4.0-6.0s | "-> the cos(2*theta+phi) term averages to ZERO" docks; CONCURRENT: the dimmed p-pane (still visible from S2/S3, reveal_hold) wiggle visibly pulses through a few cycles to show the zero-average term live |
| `link4` | 6.0-8.0s | "-> survivor = (vm im/2) cos(phi) = V_rms I_rms cos(phi)" docks |
| `link5` | 8.0-10.0s | Substitute the sealed decimals: "-> 5.55 x 0.555 = 3.08 W" -- the needle (still docked from S1, dimmed) pulses as the number lands, now expressed in algebra |

Formula overlay: the full chain (S9 is the one state where the calculus-adjacent product-to-sum identity is
permitted -- advanced ring only, 38c). glow_focal = formula. No live controls.

### S10 power_sandbox -- core (ring-neutral, 38b) -- drag-sandbox

Free-runs forever (Rule 37, never freezes). No `variable_overrides` (inherits `default_variables`: vm=10.0,
f=0.25, R=5.0, L=3.1831, C=0.1273). ALL five sliders live:

| Behaviour | Driven by |
|---|---|
| Strip + p-pane (live product, lobes, dashed average) re-scale live; needle tracks P live | vm, f, R, L, C via v_t, i_t, p_t, P |
| Drag f -> lobes and cosphi move together LIVE; at f=0.25 (home) negatives vanish, needle peaks -- unity power factor rediscovered by the teacher own hand | f |
| Drag R -> replays the S6 paradox (current up, power down) at the work point; **AT RESONANCE (f=0.25) does the OPPOSITE** -- R=2.0 gives P=25.0 W (UP), the A3 explore discovery. The S6 guard clause is echoed as a standing HUD note; the P-HUD chip ALWAYS shows the TRUE numeric P value (never silently clamped), e.g. "P = 25.0 W" | R |
| Drag L or C -> moves the unity-power-factor point live (the f at which cos phi reads 1.000 shifts) -- observed via the live cosphi HUD, NEVER computed/rendered as a symbolic f0/delta_f value in this concept (A5 compliance: that symbol belongs to series_lcr_circuit only) | L, C (off-grid F8 snap-on-first-drag, fleet convention) |
| vm scales the strip/p-pane/needle together | vm |
| p-pane Y-axis AUTO-RANGES from the guided fixed -4..+21 W to [P-S minus 10%, P+S plus 10%] computed live every frame from TRUE P and S (DUALPANEL_RANGE_OFF precedent, engine-bug-queue row cited at top of file) -- e.g. at R=2/resonance (P=S=25.0 W) the range extends to roughly -2.5..55 W; a true-number chip always accompanies the graph even when the curve visually re-scales (A3b binding) | P, S |

Formula overlay: `P = V_rms*I_rms*cos(phi)` ONLY (core-ring, 38b) -- NO Q/VAR chip, NO power triangle, NO
derivation chain (ring-gated absent, matching S8/S9 hidden-preset coherence). glow_focal = formula.


---

## Section 4. Physical constraints, coincidence guards (10k), and curriculum notes

### 4.1 Display-precision law (binding, A8, carried verbatim)
V_rms 2dp; **I_rms 3dp (REQUIRED -- 0.435/0.785/0.911, so the S4/S5/S6/S7 displayed-addend chips close; 2dp
would break F7: 0.78*0.555=0.43, 7.07*0.43=3.04 not equal to 3.08)**; P/S/Q 2dp; cosphi 3dp; phi 1dp; f 2dp;
Z 1dp; energies 2dp. HUD computes from TRUE (unrounded) values always, rounds only for the on-screen chip.

### 4.2 A2 -- apparent power ring-tagging (explicit, binding)
Apparent power S -- BOTH the concept ("the naive volts-times-amps ceiling") and the VALUE (5.55 VA) -- is
**CORE**, debuting at S4 where pivot #1 needs it (the ghost needle IS S). Only the FORMAL VA-unit label and
the triangle-LEG-CHIP treatment of S (alongside P and Q as a matched power-triangle trio) is **EXTENDED**,
confined to S8. This is why hiding S8-S9 (the extended+advanced cut) still leaves S4's pivot fully coherent --
S survives as a plain number with no triangle geometry required.

### 4.3 A3 -- explore R=2-at-resonance discovery (binding, both halves)
(a) The S6 guard clause is authored VERBATIM in-state narration: "here reactance dominates -- at the home
frequency dropping R does the opposite" (section 3, S6 `guard_clause` cue). (b) The S10 explore P-HUD always
renders the TRUE numeric P (e.g. "P = 25.0 W" at R=2/resonance), never silently clamped to the guided -4..+21 W
range; only the p-pane Y-AXIS auto-ranges (with a 10% margin per the DUALPANEL_RANGE_OFF precedent), the
NUMBER itself is always honest (section 3, S10 row).

### 4.4 A5 -- Q-symbol collision disarm (binding, verified)
`series_lcr_circuit` used Q for QUALITY FACTOR (sharpness/bandwidth, Q=f0/delta_f). THIS concept uses Q for
REACTIVE POWER (VAR). Disarmed by: dual-labeling "reactive power Q (VAR)" at first mention (S8, section 3),
NEVER writing "Q factor" anywhere in this concept's authored text, and declaring **NO f0, delta_f, f1, f2, or
sharpness-Q variable anywhere in section 1** -- those symbols and that machinery belong exclusively to
series_lcr_circuit and are never re-rendered here.

### 4.5 A6 -- S7 heater prominence (verified, section 3)
The S7 heater warm-glow (driven by p_R_t = i(t)^2*R, NEVER the signed total p_t) is called out explicitly as
"where the taught variable physically lands" in section 3's S7 row -- the only macroscopic object that warms;
coil and plates stay visibly cold (their gauges breathe instead, section 3).

### 4.6 S1/S3 deliberate-NONE formula surfaces (binding, restated)
S1 renders NO formula overlay -- authoring `P = V_rms*I_rms` at S1 would consecrate the very belief S4 exists
to break. S3 renders NO formula overlay -- it is the mystery state; no quantity is named yet (no phi symbol,
no P symbol -- only the visual sink and the sliding needle number). Both are load-bearing omissions, not gaps
-- json_author must NOT add a formula surface to either state.

### 4.7 Coincidence audit (section 10k, restated with guards)
1. **P(resonance) = 10.0 W = the resistor own <p> = 10.0 W.** TAUGHT callback, load-bearing (S1 plant). Never
   presented as coincidental -- it is the honest physical fact that a pure resistor and this circuit at
   resonance behave identically (Z=R, cosphi=1).
2. **S = 10*cosphi at R=5 (an artifact of vm^2/(2R)=10)** -- the 5.55/0.555 digit echo. Never juxtaposed as an
   equation; caption never pairs them. **S6's R-step breaks the ratio live** (R=2 -> S=6.44, cosphi=0.258,
   nowhere near 10*0.258=2.58) -- the guard clause "with THIS source and heater -- our build, not a law" is
   the spoken defense (echoing the slcr S8 guard discipline).
3. **V_R,peak (slcr S3) = 5.55 V = S here (structurally avoided).** Element voltage chips (V_R/V_L/V_C from
   the slcr fan/chain) NEVER render in this concept -- only Z/X/R/phi/cosphi survive as callbacks; the 5.55
   coincidence with slcr's own V_R chip never has an opportunity to visually collide.
4. **I_rms = sqrt(2) A at resonance**, shown as the decimal "1.414", never symbolized as sqrt(2) on-canvas
   (avoids a spurious cross-link to the sqrt(2) already meaningful in the V_rms/I_rms definitions themselves).
5. **S^2 = P^2 + Q^2 fails at displayed addends** (TRUE=30.771 exact; displayed 3.08^2+4.62^2=30.83 vs
   5.55^2=30.80 -- does NOT close). NEVER chipped as arithmetic (section 1 constraint #5, section 3 S8 formula
   overlay note). The numeric check that DOES chip and closes is cos phi = P/S = 3.08/5.55 = 0.555.
6. **Component-Pythagoras** i_par^2+i_perp^2 vs I_rms^2 -- 0.435^2+0.653^2=0.6156 vs 0.785^2=0.6162 -- also
   never chipped as arithmetic (declared alongside #5, section 1 sanity check). The vector-sum PICTURE (S5
   projection guide) is the correct, exact demonstration; the squared-sum is deliberately never rendered as
   a checkable number.
7. **Q-symbol collision (A5)** -- full disarm detailed in section 4.4.

### 4.8 Curriculum notes (Rule 38, claims not facts)
Per skeleton section 10(i-3): **CBSE/NCERT (+JEE/NEET) is marked full-verified**, resting on the founder acting
as the in-trial CBSE/NCERT subject-matter authority (no external teacher has yet confirmed it) -- the S8 power
TRIANGLE is explicitly flagged as a JEE-adjacent extension whose CBSE board-weighting is
`needs_teacher_verification:true` even within the otherwise-verified CBSE row (do not silently upgrade this
sub-cell). CAIE A-level is marked partial (`needs_teacher_verification`) -- rms and mean power in a purely
resistive circuit are believed in-syllabus, power factor believed absent. IGCSE / IB DP / AP Physics 2 /
AP Physics C E&M / Ontario SPH4U are all `needs_teacher_verification:true` beliefs, not facts (Rule 38g) -- no
preset for any of these ships teacher-visible until a real teacher of that curriculum confirms it. Ring-cut
coherence (38a): hiding S9 (advanced) leaves S1-S8+S10 coherent, S4 gives P as a MEASURED law with no surviving
state promising the S9 proof; hiding S8-S9 (extended+advanced) leaves S1-S7+S10 coherent, no surviving state
names Q/VAR/triangle (S4's apparent power S survives, per A2, section 4.2); explore (S10) surfaces CORE-ring
content only (38b).

---

## Section 5. Drill-down cluster phrasings (9 clusters x 5 phrases = 45)

### S4 -- apparent_vs_real_power
- "whats the difference between apparent power and real power"
- "why does the meter not just read volts times amps"
- "if the meter reads less wheres the rest of the power going"
- "is apparent power even real power at all"
- "why do we need two different power numbers"

### S4 -- why_power_less_than_v_times_i
- "why is the real power always smaller than v times i"
- "can real power ever be bigger than v times i"
- "wheres the missing power going if its not v times i"
- "does the circuit eat some of the power"
- "why doesnt volts times amps just work like it does for a light bulb"

### S4 -- volt_ampere_vs_watt_units
- "why are volt amps not the same as watts"
- "isnt a va just another name for a watt"
- "why does the nameplate use two different units"
- "when would va and watts actually be equal"
- "why bother with va if watts is what actually gets used"

### S5 -- power_factor_physical_meaning
- "what does the power factor number actually mean"
- "why is a power factor of one the best case"
- "what does it mean when the power factor is zero"
- "is power factor just efficiency"
- "why does the power factor depend on the circuit not just the current"

### S5 -- in_phase_current_component
- "what does in phase current even mean"
- "why does only part of the current matter"
- "how can current be in phase with something"
- "is the in phase part the useful current"
- "why split the current into two pieces at all"

### S5 -- cos_phi_as_projection
- "why is it cos phi and not something else"
- "is cos phi just a projection of the current"
- "why does the angle between v and i decide the power"
- "whats the geometry behind cos phi"
- "why cosine and not sine for the real power part"

### S8 -- power_triangle_pqs_relations
- "how are p q and s related in the power triangle"
- "is the power triangle the same as the impedance triangle"
- "why does p squared plus q squared not exactly equal s squared on the numbers"
- "what does the right angle in the power triangle mean"
- "why does scaling the impedance triangle give me power"

### S8 -- reactive_power_var_meaning
- "what is reactive power actually doing"
- "is reactive power wasted energy"
- "why is reactive power measured in var and not watts"
- "does reactive power ever get used up"
- "why do the wires care about power that isnt even real"

### S8 -- kva_vs_kw_rating
- "why does my equipment get rated in kva not kw"
- "whats the difference between kva and kw on a nameplate"
- "why would a machine need a bigger kva rating than its kw rating"
- "why not just rate everything in kw and skip kva"
- "how do i know how much real power a kva rating gives me"

---

## Self-review checklist

- [x] Every symbol referenced in the skeleton's state narratives (v, i, p, p_R, P, S, Q, cosphi, sinphi, phi,
  V_rms, I_rms, i_par, i_perp, X_L, X_C, X, Z, E_L, E_C, E_R) appears in `variables` (section 1, 41 keys,
  valid JSON verified by parser).
- [x] Every formula wraps degree-native theta in `radians()` before any sin/cos call (section 1 variables:
  v_t, i_t, V_C_t, bead_frac all use `radians(theta...)`; E_R_t explicitly uses the TRUE radian omega, not
  the degree-native theta, and this distinction is called out inline).
- [x] Every state's live control(s) declared exactly per the architect control table (f -> S3 scripted-then-
  live, R -> S6 scripted-then-live, ALL -> S10), each with default/min/max/step in section 1.
- [x] `variable_overrides` documented for all 10 states (section 2), with explicit reorder-safety reasoning
  (Rule 25d) and CRITICAL defensive re-locks flagged at S4 (f), S6 (f), S7 (R).
- [x] Board-mode section SKIPPED per the active conceptual-only directive (Rule 20 [D]) -- not authored,
  consistent with the skeleton section 10(e).
- [x] Drill-down cluster phrasings: 9 clusters x 5 phrases = 45 (section 5), real-student-voice, plain
  English, no Hinglish, no textbook prose.
- [x] `constraints` block: 6 short physics assertions (section 1 JSON) + 8 coincidence-guard/curriculum
  subsections (section 4).
- [x] Numerical sanity check run and independently re-verified (defaults/resonance, work point, S5 components,
  S6 R-step, S7 energies, explore sign-flip, S8 morph) -- all reproduced, matching the skeleton and the
  founder-proxy CpA report exactly.
- [x] Within-state motion timeline written for all 10 states (section 3): every row a pure function of the
  state clock (Rule 26); no dt-accumulator anywhere (E_R_t is a closed-form integral); no two states share a
  motion signature (10 distinct archetypes carried from the skeleton, no repeat); controls column matches the
  architect table exactly (f LOCKED S1-S2/S4-S5/S7-S9, live only S3; R LOCKED S1-S5/S7-S9, live only S6; ALL
  live only S10).
- [x] Rule 32 sequencing verified per state (cause-before-effect beats named in S1 through S9: meter docks
  THEN climbs; cursor walks THEN curve rises; thumb glides THEN crest slips THEN lobes sink; ghost swings THEN
  strike THEN ratio THEN naming; rotation holds THEN split THEN check; thumb steps THEN beads accelerate THEN
  needle falls; gauges dock THEN breathe/ratchet; triangle detaches THEN rescales THEN relabels; links dock
  one per clause); only the taught variable's motion changes per state (32b); S6's R-cycle legs are EASED,
  never an instant snap (ghost_compare_b_handoff_instant_snap prevention, section 3).
- [x] A2 (apparent power S is CORE at S4, only the formal VA-triangle-leg-chip is EXTENDED at S8) written
  explicitly into section 1 (S variable description) and restated as section 4.2.
- [x] A3 (R=2-at-resonance -> 25 W explore discovery: guard clause verbatim + true-number HUD chip +
  auto-range) written into section 3's S6 and S10 rows and restated as section 4.3.
- [x] A5 (Q-symbol collision disarm: dual-label once, never "Q factor", no f0/delta_f/sharpness-Q variable
  anywhere) written into section 1 (Q variable description), section 3 (S8 relabel cue), and section 4.4.
- [x] A6 (S7 heater prominence, driven by p_R_t not signed p_t) written into section 3's S7 row and section
  4.5, with the physically-correct distinction (p_R_t always >=0 vs signed p_t) established in section 1.
- [x] A8 (I_rms 3dp display precision, all F7 chips verified at displayed addends, two never-chip identities
  declared) written into section 4.1 and cross-verified numerically in the sanity check.
- [x] Notation ladder (Rule 38c): S1-S8/S10 formula surfaces are algebra-only (P=V_rms I_rms cos phi,
  S=V_rms I_rms, cos phi=R/Z, Q=V_rms I_rms sin phi, I_wattless=I_rms sin phi, P=I_rms^2 R, S^2=P^2+Q^2
  symbolic); the one product-to-sum trig identity is confined to S9, the advanced-ring state. S1/S3
  deliberately carry NO formula surface (section 4.6). **Dialect (38d):** "power factor cos phi" dual-labeled
  once at S4; "reactive power Q (VAR)" dual-labeled once at S8 (never "Q factor"); "wattless (idle) current"
  dual-labeled once at S5/S6.
- [x] Engine bug queue consulted LIVE (`--field3d --open`, `--owner alex:physics_author`, `ac_power_factor`,
  `series_lcr_circuit`, `--owner peter_parker:runtime_generation`); every relevant OPEN/FIXED prevention rule
  applied (top:52px+ zone clearance already honored by the skeleton geometry; eased-never-snapped leg
  transitions on S6's R-cycle; DUALPANEL_RANGE_OFF cited for S10's p-pane auto-range; B1 closed-form-of-t
  discipline throughout section 3; all-five-drivers-every-state discipline in section 2).
- [x] DC Pandey check: no formula, explanation, or example problem imported from any external book -- every
  formula in section 1 derived directly from p(t)=v(t)*i(t), the settled series-LCR callback facts (never
  re-derived), and elementary trig/calculus, independently verified.

---

## Escalations / flags for downstream

1. **Phase-reference resolution (top of file, binding):** S9's derivation text as loosely phrased in the
   skeleton uses the opposite phase reference from the settled `series_lcr_circuit` convention; resolved here
   using the slcr convention as authority (i as 0-phase reference, v as +phi-offset source), verified against
   every numeric checkpoint in the skeleton and founder-proxy report. json_author/engine must implement this
   resolved form, never the skeleton's literal S9 phrasing.
2. **Heater-glow driver clarification (genuine physics contribution, binding):** the skeleton says "heater
   mesh warm-glows in the power hue as E_R climbs" without specifying the INSTANTANEOUS driver. This physics
   block resolves the ambiguity: the heater glow must be driven by `p_R_t = i(t)^2*R` (always >=0), NEVER by
   the signed total `p_t = v(t)*i(t)` (which goes negative off resonance and would incorrectly dim/flicker the
   heater on a lobe that has nothing to do with the resistor). This distinction is load-bearing for Rule 33's
   "real number" requirement and is new physics beyond a literal reading of the skeleton.
3. **S10 p-pane auto-range -- genuine engine capability question (FLAG for the engine dispatch):** does the
   `pwr_ppane` primitive (clone of the element `ac*_graph_p` pane) support a RUNTIME Y-axis auto-range
   (recomputed from TRUE P and S every frame, per the DUALPANEL_RANGE_OFF 10%-margin precedent), distinct from
   the guided states' fixed -4..+21 W range? If this capability does not already exist in the cloned pane
   primitive, it is a new, small ask for the section 0b engine dispatch -- required for A3's honest-clamp
   discovery at explore extremes (R=2 at resonance -> 0..50 W swing; vm=20 at resonance -> 0..80 W swing).
4. **S8 morph scale factor is exactly I_rms^2, with a clean identity:** P=I_rms^2*R, Q=I_rms^2*X, S=I_rms^2*Z
   -- the power triangle IS the impedance triangle uniformly scaled, no separate morph-target computation is
   needed beyond re-using the ALREADY-COMPUTED R/X/Z legs times the ALREADY-COMPUTED I_rms^2. Flagging this
   explicitly so the engine dispatch implements it as a pure re-scale of existing values, not a fresh
   trigonometric derivation.
5. **quality_auditor:** verify the S1/S3 rows genuinely carry no formula overlay (4.6); verify S8's spoken
   clause matches the resonance-collapse note; verify S9's chain uses the resolved i-as-reference convention
   (escalation #1); verify no f0/delta_f/sharpness-Q token ever renders (A5); verify the CBSE curriculum row's
   S8 sub-cell carries its own `needs_teacher_verification` flag distinct from the row's overall "verified"
   status (4.8); verify I_rms renders at 3dp fleet-wide within this concept (A8).

---

**Files referenced (read-only + live queries, no edits made):**
- `docs/loop_runs/ch7/ac_power_factor/skeleton.md` (input contract, full read)
- `docs/loop_runs/ch7/ac_power_factor/founder_proxy_report_checkpointA.md` (number-lock source, advisories
  A1-A9)
- `docs/loop_runs/ch7/series_lcr_circuit/physics_block.md`, `docs/loop_runs/ch7/ac_voltage_resistor/physics_block.md`
  (format/rigor precedent, physics independently re-derived for this concept, not copied)
- `npx tsx --env-file=.env.local src/scripts/query_engine_bug_queue.ts` (live DB consultation, four queries)
- Hand arithmetic (all locked numbers, the E_R(t) closed-form integral derivation, the phase-reference
  resolution, the S8 morph identity) independently re-verified, not trusted from the prompt alone.

This physics block is ready to append to `skeleton.md` and hand to the section 0b engine dispatch (NEW
`scenario_type: "ac_power"`, Class-B, clone-sibling of `ac_series_lcr`) followed by `json_author`.
