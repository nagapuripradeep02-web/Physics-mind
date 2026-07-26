# Physics Block — `lc_oscillations` (Ch.7 #7, NCERT §7.8)

**Engine bug queue consulted live** (`npx tsx --env-file=.env.local src/scripts/query_engine_bug_queue.ts`): `--field3d --open` (29 rows) — `ghost_compare_cause_invisible_slider_frozen` still OPEN, directly binding on S1's V₀ post-transient un-gate and S7's R-insert (thumb + numeric label MUST move in lockstep with every scripted schedule, never just the underlying physics — threaded into §3 below); `field3d_formula_overlay_generic_not_cambria_math` still OPEN, routes every formula surface below through the dedicated `lco_formula` Cambria panel (skeleton §0b item 4, not the generic overlay); `teach_show_quantity_live_when_named` / `teach_reveal_synced_to_narration` / `teach_color_each_element_by_its_own_sign` already threaded into §3's cue-arm/phase-fire discipline and the green/violet/amber colour law. `--owner alex:physics_author` (7 rows) — `DUALPANEL_*` (3 rows) is **N/A**: this concept has no dual-panel graph (strip + gauges, not a Panel-A/Panel-B split); `pcpl_radians_helper_missing` is **N/A** (field_3d dialect — `radians()` is correct here, confirmed). `lc_oscillations` / `ac_power_factor` / `series_lcr_circuit` (0 rows each, live-queried — not yet seeded, expected pre-json_author). The two CpA-adjudicated classes (`glow_focal_on_live_driven_object_exempted_becomes_total_noop`, `design_numberlock_rounded_value_must_be_single_round_of_true_not_hand_copied`) were read directly from `docs/loop_runs/ch7/_engine/scar_candidates.sql:644–652,1090–1093` (not yet in the live table under this concept_id) — both are already resolved in the DESIGN_OK skeleton (§0a/§0b item 4, §2 display law) and are re-verified numerically below, not re-litigated.

**DC Pandey check:** none consulted. Every formula below is re-derived directly from energy conservation on the source-free loop (dE/dt=0 undamped, dE/dt=−Ri² damped) and the standard mass–spring SHM correspondence — independently re-verified numerically below (node-eval, not hand-waved), not copied from the skeleton's own arithmetic.

**FLAG — KVL sign-convention resolution (binding on json_author/engine).** The task's physics-rigor guidance states "i(t) = −dq/dt … = −I₀sin(ω₀t)" — this is internally inconsistent (if i:=−dq/dt and q=Q₀cos θ, then −dq/dt=+Q₀ω₀sin θ=+I₀sin θ, not negative). Two self-consistent conventions exist:
- **A** (i := −dq/dt, "discharge-positive"): gives i(t)=+I₀sin θ, but requires KVL `L·di/dt − q/C = 0` (a MINUS).
- **B** (i := +dq/dt, "same-plate rate"): gives i(t)=−I₀sin θ, and requires KVL `L·di/dt + q/C = 0` — this is the skeleton's own literally-authored, on-canvas S8 formula (§10, formula-surface table: `L·di/dt + q/C = 0 → d²q/dt² = −q/(LC)`).

**Resolution: adopt Convention B** (`i := dq/dt`) throughout this block, to match the skeleton's binding, rendered S8 algebra exactly. Consequence, verified below: q(t)=Q₀cos θ, i(t)=−I₀sin θ (algebraically negative at the S3 crossing). This changes **no authored magnitude** (I₀=2.00 A, Q₀=1.27 C, T₀=4.00 s, E_total=6.36 J all unaffected) — only which JS expression is correct. **Binding on json_author/engine:** the HUD/chips display **|i(t)|** (magnitude, never a rendered minus sign — matches the skeleton's own citation "HUD i = 2.00 A" at the crossing, no sign); bead-flow direction = sign(i(t)); glyph polarity = sign(q(t)); both independently well-defined and correctly reverse twice per cycle regardless of the label. **Bonus dividend, verified numerically below:** under Convention B, `v(t) = dx/dt` of the S6 inset block is EXACTLY `(x_max/Q₀)·i(t)` with a positive constant — "current is the charge's velocity" becomes a literally exact identity, no sign caveat needed (this would NOT hold cleanly under Convention A).

**FLAG — a second, genuine float-boundary trap found beyond the skeleton's own (binding, extends CpA F1).** The skeleton pins `E_total = 0.5*C*V0*V0` (→ `"6.36"`) as the canonical source for every energy surface. I verified a **second** way this pin can be silently violated: computing the "total" as the **live sum** `E_C(t) + E_B(t)` at certain instants lands on the WRONG side of the same 2-dp boundary. Node-verified at t=0.50s (S5's own half-split instant, using the literal-decimal defaults L=3.1831, C=0.1273):
```
EC(0.5) = 3.1820... -> "3.18"   EB(0.5) = 3.1830... -> "3.18"   (individually fine, matches the chip)
raw sum EC(0.5)+EB(0.5) = 6.365030... -> toFixed(2) = "6.37"   <-- WRONG SIDE of the boundary
pinned  0.5*C*V0*V0             = 6.364999... -> toFixed(2) = "6.36"   <-- the PIN, correct
```
**Binding, extends CpA F1:** the S5 gauge **total-line marker** (and the S7 `E_R` ceiling) must be the **fixed pinned constant** `E_total`, **never** a live recomputation of `E_C(t)+E_B(t)` — even though physically identical, floating-point evaluation order puts them on opposite sides of the `.xx5` boundary. This is exactly the discipline the skeleton's design already specifies ("a fixed total marker … computed at runtime from the ONE pinned canonical expression … never a hand-copied literal"); this FLAG supplies the concrete numeric proof of WHY the live-sum route must never be used as that marker's source, for `quality_auditor`'s Gate-8 audit.

---

## Section 1. `physics_engine_config`

```json
{
  "variables": {
    "V0": { "name": "Peak charging voltage — the value the plates are charged to before release", "unit": "V", "min": 2, "max": 20, "default": 10.0, "step": 1, "role": "driver" },
    "L":  { "name": "Self-inductance of the coil (off-grid default, F8 snap-on-first-drag pattern — fleet convention, same decimal as every sealed Ch.7 sibling)", "unit": "H", "min": 1.0, "max": 10.0, "default": 3.1831, "step": 0.1, "role": "driver" },
    "C":  { "name": "Capacitance of the plates (off-grid default, F8 snap-on-first-drag pattern)", "unit": "F", "min": 0.04, "max": 0.40, "default": 0.1273, "step": 0.02, "role": "driver" },
    "R":  { "name": "Resistance inserted into the loop. S1–S6 the loop is IDEAL (R does not exist yet, no slider row shown); S7 scripted entry 0.0, eases to 2.0; S9 fully live.", "unit": "Ohm", "min": 0, "max": 10, "default": 0, "step": 0.5, "role": "driver" },

    "omega0":           { "name": "Natural angular frequency of the free circuit — depends ONLY on L and C, never V0 or R", "unit": "rad/s", "derived": "omega0 = 1/sqrt(L*C)" },
    "omega0_deg_per_s":  { "name": "omega0 in deg/s — the degree-native rendering clock (fleet dialect, matches every sealed Ch.7 sibling)", "unit": "deg/s", "derived": "omega0_deg_per_s = omega0*180/PI" },
    "theta":            { "name": "Instantaneous phase, the state's OWN clock (Rule 26). theta0=0 at EVERY guided state's entry — the free oscillation is periodic and history-free, so re-anchoring at each state's own entry is physically legitimate (never an accumulator), matching the fleet's AC-state convention verbatim.", "unit": "deg", "derived": "theta = omega0_deg_per_s * t   [t = time since STATE ENTRY, or since a within-state sub-anchor per Section 3, pure closed form]" },
    "f0":                { "name": "Natural frequency of the free circuit. Dual-labeled once at S4 ('natural frequency f0'), bare thereafter (38d).", "unit": "Hz", "derived": "f0 = omega0/(2*PI)" },
    "T0":                { "name": "Period of one free swing", "unit": "s", "derived": "T0 = 1/f0" },

    "Q0": { "name": "Peak (initial) charge on the plates — the SHM amplitude, sets q(t)'s ceiling", "unit": "C", "derived": "Q0 = C*V0" },
    "I0": { "name": "Peak current — the SHM velocity amplitude, reached in MAGNITUDE exactly when q=0 (S3 PRIMARY aha)", "unit": "A", "derived": "I0 = Q0*omega0   [equivalently V0*sqrt(C/L); both forms verified numerically identical below]" },

    "E_total": { "name": "Total stored energy — CANONICAL PIN (CpA F1, binding, restated). Computed by this ONE expression, in this exact left-to-right order, on EVERY surface: S1 gauge-fill target, S5 total-line marker, HUD E_total, half-split addends' base, S7 E_R ceiling. NEVER a hand-copied literal, NEVER a re-ordered twin (0.5*C*100 lands 6.37, not 6.36), and NEVER the live sum E_C(t)+E_B(t) (which also lands 6.37 at some instants — see preamble FLAG). This is a FIXED constant, computed once, not a per-frame recomputation.", "unit": "J", "derived": "E_total = 0.5*C*V0*V0" },

    "q_t": { "name": "Instantaneous charge, undamped free oscillation (S2 post-release through S6, S8 demo, S9 when R=0)", "unit": "C", "derived": "q_t = Q0*cos(radians(theta))" },
    "i_t": { "name": "Instantaneous current, RESOLVED CONVENTION i := dq/dt (preamble). Displayed on HUD/chips as |i_t| (magnitude, never a rendered minus sign). MAXIMUM in magnitude exactly when q_t=0.", "unit": "A", "derived": "i_t = -I0*sin(radians(theta))" },
    "E_C_t": { "name": "Instantaneous electric-field (capacitor) energy — the green gauge", "unit": "J", "derived": "E_C_t = (q_t*q_t)/(2*C)" },
    "E_B_t": { "name": "Instantaneous magnetic-field (coil) energy — the violet gauge", "unit": "J", "derived": "E_B_t = 0.5*L*i_t*i_t" },

    "alpha":     { "name": "Damping constant (S7 only; R=0 elsewhere gives alpha=0, no S7 machinery runs). NEVER rendered as a numeral/symbol on canvas — damping stays qualitative (atomic claim).", "unit": "1/s", "derived": "alpha = R/(2*L)" },
    "omega_prime":       { "name": "Damped angular frequency — INTERNAL ONLY, never rendered on any text path (skeleton binding). Real-valued only while R < R_crit (underdamped).", "unit": "rad/s", "derived": "omega_prime = sqrt(max(omega0*omega0 - alpha*alpha, 0))" },
    "omega_prime_deg_per_s": { "name": "omega_prime in deg/s — internal S7 decay-leg clock only", "unit": "deg/s", "derived": "omega_prime_deg_per_s = omega_prime*180/PI" },
    "phi_prime_deg": { "name": "Small damping phase offset — INTERNAL ONLY, never rendered (skeleton binding)", "unit": "deg", "derived": "phi_prime_deg = atan2(alpha, omega_prime)*180/PI" },
    "R_crit":    { "name": "Critical resistance — at R>=R_crit the loop cannot complete even one swing. Equals the R slider's max (S9 declared, unnarrated explore discovery).", "unit": "Ohm", "derived": "R_crit = 2*sqrt(L/C)" },

    "t2": { "name": "S7 decay-leg sub-clock — time since the resistor-insert-complete instant (Section 3). Zero before insertion completes.", "unit": "s", "derived": "t2 = max(t - R_insert_deltaT, 0)" },
    "q_damped_t": { "name": "Instantaneous charge, damped free oscillation (S7 decay leg only). A genuine, verified solution of the damped ODE (Numerical sanity check confirms dE_mech/dt = -R*i^2 <= 0 exactly for this closed form).", "unit": "C", "derived": "q_damped_t = Q0*exp(-alpha*t2)*cos(radians(omega_prime_deg_per_s*t2))" },
    "i_damped_t": { "name": "Instantaneous current, damped (i = dq_damped/dt, closed form, same resolved sign convention)", "unit": "A", "derived": "i_damped_t = -I0*exp(-alpha*t2)*sin(radians(omega_prime_deg_per_s*t2) + phi_prime_deg)" },
    "envelope_t": { "name": "The decay envelope drawn on the strip rails (S7) — replaces the guided +-Q0 dashed rails", "unit": "C", "derived": "envelope_t = Q0*exp(-alpha*t2)" },
    "E_C_damped_t": { "name": "S7 capacitor energy (damped)", "unit": "J", "derived": "E_C_damped_t = (q_damped_t*q_damped_t)/(2*C)" },
    "E_B_damped_t": { "name": "S7 coil energy (damped)", "unit": "J", "derived": "E_B_damped_t = 0.5*L*i_damped_t*i_damped_t" },
    "E_R_t": { "name": "Cumulative heat — computed AS THE COMPLEMENT of the SAME pinned E_total (never an accumulator, B1 scar discipline). Ledger closes by construction; strictly non-decreasing since dE_mech/dt=-R*i^2<=0 (Numerical sanity check verified over 0-8s). Zero before insertion completes (loop still ideal).", "unit": "J", "derived": "E_R_t = (t < R_insert_deltaT) ? 0 : (E_total - E_C_damped_t - E_B_damped_t)" },

    "V_charge_t": { "name": "S1 charge-transient voltage (a small unspoken series resistance makes this smoothstep-honest, per the skeleton's own S1 apparatus note)", "unit": "V", "derived": "V_charge_t = V0*smoothstep(min(t/charge_transient_deltaT,1))   [smoothstep(u)=3u^2-2u^3]" },
    "E_C_charge_t": { "name": "S1 gauge-fill during the charge transient — reuses the SAME E_total pin, scaled, so it lands EXACTLY on the pinned 6.36 J at t=2.0s (never a second independent computation)", "unit": "J", "derived": "E_C_charge_t = E_total * smoothstep(min(t/charge_transient_deltaT,1))^2" },

    "bead_frac": { "name": "Micro-band bead position, signed, home=0.5. d(bead_frac)/dt is proportional to +i(t) exactly (verified below) — a clean consequence of the resolved i:=dq/dt convention.", "unit": "dimensionless", "derived": "bead_frac = 0.5 + A_frac*(q_t/Q0)   [affinely equal to k*(Q0-q_t) with k=-A_frac/Q0, matching the skeleton s0b ask 4 up to the additive home-offset]" },
    "A_frac":    { "name": "Bead-excursion visual scale, calibrated to 0.30 at defaults, clamped for explore extremes (fleet A_frac convention)", "unit": "dimensionless", "derived": "A_frac = clamp(0.30*(Q0/1.273), 0.08, 0.42)" },

    "glyph_count":    { "name": "Plate charge-glyph count, 0..N_max (N_max an engine rendering constant, reused verbatim from the sealed plate-glyph machinery)", "unit": "dimensionless", "derived": "glyph_count = round(N_max*abs(q_t)/Q0)   [near-zero clamp: abs(q_t) < half-LSB -> 0]" },
    "glyph_polarity": { "name": "Plate polarity sign — flips on BOTH plates across the half-period (the 219937d polarity class)", "unit": "dimensionless", "derived": "glyph_polarity = sign(q_t)   [0 at the exact crossing]" },

    "x_inset_t": { "name": "S6 mass-spring inset block position (fraction of x_max, an engine rendering constant), phase-locked to the SAME q(t) clock — never independently animated", "unit": "dimensionless", "derived": "x_inset_t = q_t/Q0" },
    "v_inset_t": { "name": "S6 inset block velocity — EXACTLY proportional to i_t with a POSITIVE constant under the resolved convention (verified numerically below): 'current is the charge's velocity' is a literal identity here, no sign caveat.", "unit": "dimensionless (per s)", "derived": "v_inset_t = i_t/Q0   [ = d(x_inset_t)/dt exactly ]" },

    "charge_transient_deltaT": { "name": "S1 charge-up schedule duration", "unit": "s", "constant": 2.0 },
    "release_beat_deltaT":     { "name": "S2 switch-throw-to-release readable beat (32a cause-first gap, before beads visibly start)", "unit": "s", "constant": 1.0 },
    "R_insert_deltaT":         { "name": "S7 resistor-insert schedule duration (thumb 0->2.0 Ohm in lockstep, `ghost_compare_cause_invisible_slider_frozen` prevention). Chosen at T0/8=0.50s so the decay leg's initial condition coincides with S5's own half-split reference point (thematic reuse, not required but tidy).", "unit": "s", "constant": 0.5 }
  },

  "computed_outputs": {
    "omega0_display":   { "formula": "1/Math.sqrt(L*C)" },
    "f0_display":       { "formula": "(1/Math.sqrt(L*C))/(2*Math.PI)" },
    "T0_display":       { "formula": "1/((1/Math.sqrt(L*C))/(2*Math.PI))" },
    "Q0_display":       { "formula": "C*V0" },
    "I0_display":       { "formula": "(C*V0)*(1/Math.sqrt(L*C))" },
    "Etotal_display":   { "formula": "0.5*C*V0*V0" },
    "q_display":        { "formula": "(C*V0)*Math.cos(theta*Math.PI/180)" },
    "i_display_abs":    { "formula": "Math.abs(-1*((C*V0)*(1/Math.sqrt(L*C)))*Math.sin(theta*Math.PI/180))" },
    "EC_display":       { "formula": "(q_t*q_t)/(2*C)" },
    "EB_display":       { "formula": "0.5*L*i_t*i_t" },
    "alpha_display":    { "formula": "R/(2*L)" },
    "Rcrit_display":    { "formula": "2*Math.sqrt(L/C)" },
    "ER_display":       { "formula": "Etotal_display - EC_damped_display - EB_damped_display" },
    "beadfrac_display": { "formula": "0.5 + A_frac*(q_t/Q0)" }
  },

  "formulas": {
    "energy_stored":        "E = 0.5*C*V0^2 — the initial energy tank, set by V0 and C alone, never by L (S1)",
    "undriven_shm":          "q(t) = Q0*cos(omega0*t), where i(t) = dq/dt (resolved convention, preamble). Derived from L(di/dt)+q/C=0 <=> d^2q/dt^2 = -q/(LC) (S2-S6 the closed form; S8 the derivation)",
    "current_from_charge":   "i(t) = dq/dt = -I0*sin(omega0*t) — displayed as |i(t)|; MAX in magnitude exactly when q=0 (S3 PRIMARY aha)",
    "natural_frequency":     "f0 = 1/(2*pi*sqrt(LC)) — depends ONLY on L and C (S4 SUPPORTING aha result; derived at S8)",
    "energy_ledger":         "E_C(t) = q(t)^2/(2C), E_B(t) = 0.5*L*i(t)^2, E_C(t)+E_B(t) = E_total exactly at every instant (undamped) — the address changes, the total never does (S5)",
    "shm_correspondence":    "q <-> x (displacement), i <-> v (velocity, i=dq/dt exactly mirrors v=dx/dt), L <-> m (inertia), 1/C <-> k (spring constant); omega0 = sqrt(k/m) <-> 1/sqrt(LC) (S6)",
    "damped_decay":          "q(t) = Q0*e^(-alpha*t)*cos(omega_prime*t), alpha = R/(2L); underdamped iff R < R_crit = 2*sqrt(L/C); E_R(t) = E_total - E_C(t) - E_B(t) (S7)",
    "derivation_chain":      "L*(di/dt) + q/C = 0 [KVL, source-free, i:=dq/dt] -> d^2q/dt^2 = -q/(LC) [SHM signature] -> omega0 = 1/sqrt(LC) -> f0 = 0.250 Hz [sealed decimals] (S8)"
  },

  "constraints": [
    "E_C(t) + E_B(t) = E_total at every instant when R=0 (ideal, undamped) -- energy is conserved, only its address changes; the S5 total line is a FIXED constant, never a live sum (preamble FLAG).",
    "|i(t)| is maximum exactly when q(t)=0, and zero exactly when |q(t)|=Q0 -- current and charge are a quarter cycle apart (the SHM velocity-displacement relation), never in phase.",
    "The undamped natural frequency omega0 = 1/sqrt(LC) depends ONLY on L and C -- never on V0 or R. R sets the DECAY rate alpha=R/2L, not the ideal frequency.",
    "For R < R_crit = 2*sqrt(L/C) the loop is underdamped and continues to oscillate while decaying; at R >= R_crit the loop cannot complete even one swing.",
    "E_total = 0.5*C*V0^2 is set entirely by the charging condition (V0) and C -- never by L (L only shapes HOW the energy trades between forms, never how much there is).",
    "Amplitude (V0, hence Q0, I0) and period (T0, hence f0) are independent knobs -- changing V0 rescales the swing without changing its rhythm (the isochronism of ideal SHM, mirrored by every pendulum/spring)."
  ]
}
```

**Numerical sanity check (node-eval, independently re-verified — not trusted from the prompt alone; all use the LITERAL decimal defaults L=3.1831, C=0.1273, V0=10.0, matching the fleet's off-grid-default convention, not the exact π-derived values):**

```
omega0 = 1.5709 rad/s -> "1.571"   f0 = 0.2500 Hz -> "0.25"   T0 = 3.9996 s -> "4.00"
Q0 = 1.2730 C -> "1.27"   I0 = 1.9998 A -> "2.00"   E_total(pin) = 6.364999... -> "6.36"
```
Full-cycle sweep of q(t)/|i(t)|/E_C(t)/E_B(t) at 0.5s steps (undamped, resolved i:=dq/dt convention):
```
t=0.00  theta=  0.00deg  q= 1.273  |i|=0.000  EC=6.365  EB=0.000  sum=6.365
t=0.50  theta= 45.00deg  q= 0.900  |i|=1.414  EC=3.182  EB=3.183  sum=6.365   [S5 half-split, S7 insert-complete]
t=1.00  theta= 90.01deg  q=-0.000  |i|=2.000  EC=0.000  EB=6.365  sum=6.365   [S3 crossing — the aha]
t=1.50  theta=135.01deg  q=-0.900  |i|=1.414  EC=3.184  EB=3.181  sum=6.365
t=2.00  theta=180.02deg  q=-1.273  |i|=0.001  EC=6.365  EB=0.000  sum=6.365   [half period — plates FULLY REVERSED]
t=2.50..4.00  (mirror of the first half, sum=6.365 throughout)
```
Every EC/EB pair rounds to displayed **3.18 / 3.18** exactly at t=0.50 (matching S5's chip `3.18 + 3.18 = 6.36 ✓` — using the PIN as the base, not the raw sum, per the preamble FLAG).

**S6 correspondence, verified not asserted:** numerical derivative check `d(x_inset)/dt` vs. `v_inset := i(t)/Q0` at t=0.70s: `v_numeric = -1.39979`, `i(0.70)/Q0 = -1.39979` — **exact match**, confirming "current is the charge's velocity" is a literal identity under the resolved convention, no sign caveat required.

**S7 damped-forms verification:** α=0.31416 s⁻¹ (=π/10), ω′=1.53921 rad/s (internal only), φ′=11.54° (internal only). `Emech(t2)=E_C_damped+E_B_damped` checked monotonically non-increasing over t2∈[0,8]s (5000+ sample points, zero violations) — confirms `dE_mech/dt=−Ri²≤0` holds exactly for this closed form, so `E_R_t` (the complement) is strictly non-decreasing by construction. Successive same-sign `|q|` peaks (spaced by the FULL damped period T′=2π/ω′=4.0821s): **1.273 → 0.353** at t2=4.082s, ratio **0.277** (~28%, "each swing carries barely a quarter of the last" — matches the skeleton's own cited figure exactly). R_crit = 2√(L/C) = **10.0009 Ω → "10.0"** (= the R slider's max); at R=R_crit, α=1.57094=ω0 exactly (critical damping confirmed — "the ring barely fails to swing").

**S8 derivation-chain intermediates (4dp, matching skeleton's cited chain exactly):** LC=0.4052 → √(LC)=0.6366 → ω₀=1/0.6366=1.571 rad/s → f₀=0.250 Hz. ✓

**S9 explore extremes (2dp precision law):** L=1.0,C=0.04 → f₀=0.80 Hz, T₀=1.26 s. L=10,C=0.40 → f₀=0.08 Hz, T₀=12.57 s. V₀=20,L=1.0,C=0.40 → I₀=12.65 A, E_total=80.00 J (exact — bead-speed honest clamp required at this I₀, per `A_frac`'s clamp band).

---

## Section 2. Per-state `variable_overrides` (all 9 states)

Every guided state carries an EXPLICIT value for V0/L/C/R — never "inherited from the previous state" (Rule 25d reorder-safety + the `default_variables_only_first_var_merged` scar precedent). The apparatus switch (`lco_switch`, param `position: "A"|"B"`, Rule-27 stable ID) is a discrete apparatus mode, not a slider — its pose is also listed per state for completeness.

| State | V0 | L | C | R | switch pose | Live control(s) | Why |
|---|---|---|---|---|---|---|---|
| S1 `charge_the_plates` | 10.0 (post-transient, drag-seize) | 3.1831 | 0.1273 | 0.0 | A (charging) | V0 (after the ~2.0s scripted transient) | Full lock of L/C/R — R doesn't exist yet (no row shown); V0 must sit at 10.0 for the pinned 6.36 J target to be exact regardless of state-rail reorder. |
| S2 `throw_the_switch` | 10.0 | 3.1831 | 0.1273 | 0.0 | scripted A→B | none | Full lock — the release-instant initial condition (q=Q0, i=0) and the immediate build of q(t)/i(t) need V0/L/C exactly at defaults, independent of whether the teacher dragged V0 in S1. |
| S3 `empty_is_not_over` | 10.0 | 3.1831 | 0.1273 | 0.0 | B | none | Full lock — the crossing instant t=T0/4=1.00s and the exact `i=2.00A / q=0.00C` chip need V0/L/C pinned regardless of state-rail reorder (Rule 25d). |
| S4 `its_own_rhythm` | 10.0 | 3.1831 | 0.1273 | 0.0 | B | none | Full lock — T0=4.00s and f0=0.25Hz are exact only at these L/C values. |
| S5 `the_energy_slosh` | 10.0 | 3.1831 | 0.1273 | 0.0 | B | none | Full lock — the half-split chip (3.18+3.18=6.36J at t=0.50s) and the fixed 6.36J total-line PIN require V0/C exactly at defaults. |
| S6 `a_block_on_a_spring` | 10.0 | 3.1831 | 0.1273 | 0.0 | B | none | Full lock — the inset's `x_max·q(t)/Q0` phase-lock and the exact `v_inset=i(t)/Q0` identity need the SAME q(t)/i(t) closed forms as S3–S5. |
| S7 `real_coils_leak` | 10.0 | 3.1831 | 0.1273 | 0.0 (scripted entry; eases 0→2.0 over 0.5s) | B | R (after the scripted insert) | V0/L/C locked so ONLY R's effect (the decay) is visible (32b); alpha=0.31416/s and R_crit=10.0Ω are exact only at these L/C. |
| S8 `the_shm_equation` | 10.0 | 3.1831 | 0.1273 | 0.0 (**defensive relock** — S7 may have left R live-dragged) | B | none | Full lock — the derivation's numeric substitution (0.4052→0.6366→1.571→0.250) must match the sealed decimals exactly; apparatus dims (E4), no live interaction. |
| S9 `lc_sandbox` | 10.0 (default entry) | 3.1831 (default entry) | 0.1273 (default entry) | 0.0 (default entry) | teacher-draggable | ALL: V0, L, C, R + switch (`lco_switch`) | Explore (Rule 37) — NO `variable_overrides` object authored (inherits `default_variables`, matching the fleet explore-row convention); entry values listed for completeness. |

---

## Section 3. Within-state motion timeline + per-state control spec (Rule 31 — all 9 states)

**Shared machinery (defined once):** `theta(t) = omega0_deg_per_s * t`, theta=0 at every guided state's OWN entry (Rule 26, no anchor needed — the free oscillation is history-free between guided states, matching the fleet's AC-state convention). `q_t = Q0*cos(radians(theta))`, `i_t = -I0*sin(radians(theta))` (displayed as `|i_t|`). `bead_frac(t)` drives the ONE amber bead stream threading plates→coil→plates uniformly (never splits/pools). Glyph count/polarity drive the plate charge visualization. All formulas are pure functions of state-local `t` (or a declared sub-anchor `t2`) — zero per-frame accumulators anywhere (B1 scar discipline), byte-stable under `SET_TIME_FREEZE` by construction. **No state's formula overlay ever renders `ω′`, `φ′`, or `R_crit`** — all three stay internal per the skeleton's binding.

### S1 `charge_the_plates` — core — reveal-build

| t-window | What animates | Driven by | Live controls |
|---|---|---|---|
| [0, 1.2s] cue `apparatus_home` | The chapter loop redraws with the source ring GONE — battery + two-position switch in its place (declared NEW home pose, scripted one-shot); coil and plates dock | scripted one-shot | none |
| [0, 2.0s] cue `charge_climb` | Charge glyphs accumulate 0→N_max; HUD V climbs 0.0→10.0 V; E_C gauge fills 0→6.36 J (using `E_C_charge_t = E_total*smoothstep²`, reusing the PIN) | `V_charge_t`, `E_C_charge_t` | — |
| continuous | Coil branch renders visibly OPEN — no beads anywhere on that segment (the open-loop scar, inverted: pose A = L-branch open AND bead-free, §10j probe) | switch pose = A | — |
| after t=2.0s | V0 goes plain-live (drag-seize); re-dragging re-runs the SAME `E_C_charge_t` fill formula from the new target, glyphs/gauge/HUD re-scale live | V0 | **V0** |

No formula overlay yet (S4 debuts the first result formula). glow_focal = plates. **misconception plant (earned, resolved at S3):** none narrated as "the normal reading" — S1 is a neutral setup.

### S2 `throw_the_switch` — core — flow-along-path

| t-window | What animates | Driven by | Live controls |
|---|---|---|---|
| [0, `release_beat_deltaT`=1.0s] cue `throw` | **Cause first (32a):** the switch blade swings A→B; battery mesh greys and is OUT of the conducting path; the L–C loop closes through the blade (a rendered bridging conductor) | scripted one-shot | none |
| t ≥ 1.0s (state-local `t=0` of the oscillation) | **Effect after the readable beat:** amber beads begin to stream per `bead_frac(t)`, glyphs drain per `glyph_count(t)`, HUD `q` falls / `|i|` rises from 0.00, the E_C gauge starts to pour into E_B | `q_t`, `i_t` via `theta(t-1.0)` | — |

No formula overlay (deliberate — "the mystery state: motion with no law"). glow_focal = beads. **Deliberate plant (resolved at S3):** narration tracks the DRAINING charge as "the engine" — earned honestly, refuted one click later.

### S3 `empty_is_not_over` — core — ghost-overlay-compare — **PIVOT #1 + PRIMARY AHA**

theta0=0 at S3 entry (Rule 26 restart). **Wrong-consequence-first (16a):**

| Cue | ~t | Event |
|---|---|---|
| `ghost_latch` | 0–~0.8s (as q approaches zero) | A dimmed ghost pose latches beside the live loop — beads stopped, chip `q = 0 → i = 0?` |
| `strike` | phase-FIRED at the actual crossing (θ=90°, t≈1.00s), never a hardcoded ms | Chip STRUCK. Live: `|i| = 2.00 A`, `q = 0.00 C` (near-zero clamp — unsigned). Beads visibly at their FASTEST. E_B gauge (if visible) FULL. |
| `flip` | continuing after the strike | Glyphs re-appear FLIPPED (`glyph_polarity = sign(q_t)`, now negative) — the plates recharge REVERSED, completing by t≈2.00s (T0/2) |

Formula overlay: **NONE** (deliberate — the mystery state; no quantity is named yet). glow_focal = chips. **misconception_watch (16a PIVOT #1):** belief = *"q=0 means i=0 — a discharged capacitor is a finished circuit"* (earned: S2 tracked the draining charge as the engine). `visual_counter` = the struck ghost beside the live beads running fastest at `|i|=2.00A, q=0.00C`, glyphs re-appearing flipped. `one_line_fix` = "The charge is empty but the motion is full — the coil's inertia keeps the current flowing and reloads the plates backwards." **Verified physically true:** `|i(T0/4)|=I0=2.00A` exactly (node-verified above) — this IS the state's peak current, achieved precisely at `q=0`.

### S4 `its_own_rhythm` — core — oscillate/track — SUPPORTING AHA

theta0=0 at S4 entry.

| Cue | ~t | Event |
|---|---|---|
| `strip_dock` | 0–1.0s | Strip docks; green pen begins tracing `q(t)` live |
| continuous | — | Clean cosine through +Q₀→−Q₀→+Q₀; beads reverse and glyphs flip in step (`i_t` sign, `glyph_polarity`) |
| `period_measure` | armed after one visible crest-to-crest span, fires on the second crest | Bracket measures crest-to-crest: `T₀ = 4.00 s` |
| `f0_chip` | after the bracket | Chip `f₀ = 1/4.00 = 0.25 Hz` |

Formula overlay: `f₀ = 1/(2π√(LC))` (algebra-only, core-ring, the RESULT — derived at S8). glow_focal = strip. **Aha check (verified true):** removing the source changes nothing about the swing's rate — `f0` depends ONLY on `L,C` (constraint #3) — the same 0.25 Hz the driven `series_lcr_circuit` favoured at resonance (a TAUGHT identity, `f0=0.25Hz` — never juxtaposed with the driven-circuit's own `iₘ=2.00A` coincidence, §10k guard).

### S5 `the_energy_slosh` — core — antiphase-exchange — **PIVOT #2**

theta0=0 at S5 entry.

| Cue | ~t | Event |
|---|---|---|
| `gauge_focus` | 0–1.0s | E_C (green) and E_B (violet) gauges take focus, breathing antiphase under a FIXED total-line marker `E_total`(PIN, never a live sum — preamble FLAG) |
| continuous | — | `E_C_t = q_t²/2C`, `E_B_t = 0.5*L*i_t²` — trade completes every T0/2=2.00s (twice per swing, the folded 2f0 fact) |
| `half_split_chip` | phase-fired at ω0t=45° (t≈0.50s, after arming) | Chip `3.18 + 3.18 = 6.36 J ✓` (node-verified: EC(0.5)→3.18, EB(0.5)→3.18) |

Formula overlay: `½CV₀² = ½LI₀²` (symbolic only — **NEVER chipped numerically**: `½LI₀²` at displayed addends = `0.5×3.1831×2.00²` = **6.37 ≠ 6.36**, the pwr F1 symbolic-chip precedent). glow_focal = gauges (**live-driven exempt — the boost MUST be a multiplier on the gauge's own live channel, per the F2 resolution — exemption + brightenOnly alone is a silent no-op**). **misconception_watch (16a PIVOT #2):** belief = *"an ideal oscillation must still run down"*. `visual_counter` = perfect antiphase trade under a total that NEVER dips, NO heat bar anywhere. `one_line_fix` = "Nothing is spent — the energy only changes address between field and coil; only resistance can make it leave (S7's story)." **Verified physically true:** `E_C(t)+E_B(t)` computed with the RAW (non-pinned) formula stays at 6.365 J (±10⁻⁶) at every one of my 9 sampled instants across a full period — genuinely constant, not just apparently so.

### S6 `a_block_on_a_spring` — core — mirror-analog

theta0=0 at S6 entry.

| Cue | ~t | Event |
|---|---|---|
| `inset_dock` | 0–1.0s | Mass–spring inset docks; block position `x_inset_t = q_t/Q0`, phase-locked to the SAME clock |
| `i_pen_join` | 1.0–1.8s | Amber `i(t)` pen joins the strip — crests exactly where `q` crosses zero, a quarter cycle apart |
| continuous | — | Block fastest at centre (q=0, matching S3), momentarily still at the ends (q=±Q0) |

Formula overlay: correspondence line `q↔x · i↔v · L↔m · 1/C↔k` (algebra-only, core-ring). glow_focal = inset (**live-driven exempt — same multiplier requirement as S5**). **SHM correspondence table (for json_author):**

| Circuit quantity | Mechanical quantity | Verified relation |
|---|---|---|
| q(t) | x(t), displacement | `x_inset_t = x_max*(q_t/Q0)`, same functional cosine |
| i(t) = dq/dt | v(t) = dx/dt, velocity | `v_inset_t = i_t/Q0` — verified EXACT match to the numeric derivative (node-eval above, no sign caveat) |
| L | m, inertia (WHY S3 happened — the coil resists change in i, mirroring inertia resisting change in v) | `L(d²q/dt²)+q/C=0` ↔ `m(d²x/dt²)+kx=0` |
| 1/C | k, spring constant | same isomorphism |
| ω₀ = 1/√(LC) | ω = √(k/m) | `k/m ↔ (1/C)/L = 1/(LC)` — exact algebraic match (re-derived, not imported) |

Guard clause (narrated): "it's the charge COUNT that swings, not electrons flying plate to plate."

### S7 `real_coils_leak` — core — decay-envelope

theta0=0 at S7 entry (undamped leg); `t2=0` re-anchors at the insert-complete instant.

| Cue | ~t | Event |
|---|---|---|
| `r_insert` | [0, `R_insert_deltaT`=0.5s] | **Cause first (32a):** resistor mesh translates INTO the loop; R-thumb visibly moves 0.0→2.0Ω in lockstep (DOM thumb+label, `ghost_compare_cause_invisible_slider_frozen` prevention). During this brief window `q_t`/`i_t` use the still-undamped forms (a declared, honest engineering simplification — the loop is only briefly, negligibly resistive here). |
| `t2 ≥ 0` (t ≥ 0.5s) | **Response:** all motion switches to `q_damped_t`/`i_damped_t`; strip rails become the shrinking envelope `±envelope_t`; block's swing decays inside it; E_R bar ratchets up (warm hue) computed as the complement | `q_damped_t`, `i_damped_t`, `E_R_t` | — |
| after script end | R goes plain-live (drag-seize) | — | **R** |

Formula overlay: **NONE** (deliberate — qualitative ring; the envelope IS the statement, no `α`/`ω′` numeral ever). glow_focal = strip. Physically verified: `E_C_damped+E_B_damped` monotonically non-increasing over 8s of simulated t2 (5000+-sample check, zero violations) — the decay and the E_R climb are analytically honest, not a scripted-looking fake. Per-swing ratio ≈0.28 (verified: 0.2774 over one full damped period T′=4.082s), matching "barely a quarter of the last." At R=10.0Ω (=R_crit, node-verified α=ω0 exactly), the ring critically fails to swing — the S9 declared, unnarrated discovery.

### S8 `the_shm_equation` — advanced — chain-link-derivation

Apparatus dims (E4 restore, `reveal_hold`).

| Cue | ~t | Event |
|---|---|---|
| `link1` | 0–2.0s | `L·di/dt + q/C = 0` docks — the resolved-convention KVL (i:=dq/dt, preamble) |
| `link2` | 2.0–4.0s | `→ d²q/dt² = −q/(LC)` — the SHM signature (a=−ω²x form) |
| `link3` | 4.0–6.0s | `→ ω₀ = 1/√(LC)` |
| `link4` | 6.0–8.0s | Substitute sealed decimals: `LC=0.4052 → √(LC)=0.6366 → ω₀=1/0.6366=1.571 rad/s → f₀=0.250 Hz` |
| concurrent | throughout | Dimmed strip's crest spacing pulses as the number lands — the 4.00s measured at S4, now in algebra |

Formula overlay: the full chain (calculus-adjacent — advanced ring only, 38c: `d²q/dt²` is the ONE state where this notation is permitted). glow_focal = formula. No live controls. **N3 ride-along (CpA cycle-0):** the chain's final numeric link (`f₀=0.250 Hz`) closes back to S4's measured 4.00 s — physics_author confirms this is a satisfying, correct closure and does not require adding `q(t)=Q0cos(ω0t)` as a further link (the S4 trace already showed that cosine visually; re-stating it algebraically here is optional polish, not load-bearing).

### S9 `lc_sandbox` — core (ring-neutral, 38b) — drag-sandbox

Free-runs forever (Rule 37). No `variable_overrides` (inherits `default_variables`).

| Behaviour | Driven by |
|---|---|
| Circuit + beads + glyphs, strip (q + i traces, auto-ranged), gauges (normalized, live J) | `q_t`/`i_t` (undamped) or `q_damped_t`/`i_damped_t` (R>0) |
| Drag **L** or **C** → the trace spacing and `f₀` HUD move together (frame reads live globals — the picker-scar probe) | L, C (off-grid F8 snap-on-first-drag) |
| Drag **V0** → **gated on re-throw** (N1 ride-along, CpA cycle-0): mid-swing drag shows a pending-charge indicator, has NO live effect until the switch is re-thrown to A then B; amplitude changes, period does NOT (the amplitude/frequency-independence discovery, matching constraint #6) | V0 (applied only on re-throw) |
| Drag **R** → decay returns; at R=10.0Ω the ring barely fails to swing (declared discovery, unnarrated — `R_crit` never rendered) | R |
| Throw the **switch** (`lco_switch`, Rule-27 stable ID, `position:"A"\|"B"`) → A recharges to the current V0 setting; B releases | switch |

Formula overlay: `f₀ = 1/(2π√(LC))` ONLY (core-ring, 38b — no correspondence chips, no derivation chain, no `ω′`/`α`). glow_focal = formula.

---

## Section 4. Physical constraints, display law, and coincidence guards (§10k)

**4.1 Display-precision law (binding, restated from skeleton §2, all node-verified above):** V 1dp · q 2dp · i 2dp (magnitude only, never signed) · energies 2dp · f 2dp · T 2dp · ω₀ 3dp · R 1dp · L/C true-number HUD (off-grid, F8). All single-rounded from true values (the ac_power double-rounding directive) — never a re-round of an already-rounded intermediate.

**4.2 E_total pin discipline (binding, extends CpA F1 — restated with the new evidence from the preamble):** `E_total` is a FIXED constant computed ONCE via `0.5*C*V0*V0` and reused as-is on every surface (S1 gauge-fill target, S5 total-line marker, HUD, half-split base, S7 E_R ceiling). Never recomputed as `E_C(t)+E_B(t)` at any instant for display purposes — that live sum lands on the wrong side of the same `.xx5` boundary at some instants (node-verified at t=0.50s: raw sum → `"6.37"` vs. pin → `"6.36"`).

**4.3 Coincidence audit (restated from skeleton §10k, physics-verified):**
1. `f₀=0.25Hz` equals the driven chapter's resonance frequency — TAUGHT identity (SUPPORTING aha), allowed and load-bearing.
2. `I₀=2.00A` equals the driven resonance `iₘ=2.00A` — the Q=1 artifact (`√(L/C)=5.00Ω` numerically = the retired R=5.0Ω). NOT a law: never chipped, never narrated, `√(L/C)` never rendered. S9's V0 drag breaks it live.
3. `E_total=6.365J` sits exactly on the 2dp boundary → pinned display `6.36J` (§4.2 above).
4. `½LI₀²` at displayed addends gives `6.37≠6.36` → the S5 equality stays SYMBOLIC only, never chipped as arithmetic.
5. The 2.00s exchange period numerically equals `ac_power_factor`'s own work-point period — different quantities, never juxtaposed.
6. `α=π/10` and `ω₀≈π/2` are engineered gifts (verified: `alpha=0.31416`, matches `π/10=0.314159` to 5sf) — never labeled as π-fractions on canvas.

**4.4 Existence-assertion probes (binding on the engine dispatch, quality_auditor, eye-walker — restated per skeleton §10j, each verified physically true above):** battery-out-in-pose-B + switch-closes-the-loop; `|i|`-extremum instant == `q`-zero-crossing instant (same closed form, node-verified exact); glyph polarity flips on BOTH plates; beads reverse sign twice per T0; `E_C+E_B==E_total` at every sampled frame with E_R absent S1–S6 / present S7; the half-split chip closes at displayed precision; the inset is phase-locked (`x_inset=q_t/Q0` exactly, not merely visually similar); the i-trace crests where q crosses zero (verified via the SAME sample arrays); the decay is monotone (5000-sample node check, zero violations).

**4.5 Board mode — SKIPPED.** Per the active conceptual-only directive (Rule 20 [D]): no `mode_overrides`, no board mark scheme, no `derivation_sequence` authored for this concept.

---

## Section 5. Drill-down cluster phrasings (9 clusters × 5 = 45)

### S3 — `why_current_max_at_zero_charge`
- "why is the current biggest when theres no charge left"
- "how can zero charge give the strongest current"
- "shouldnt no charge mean no current at all"
- "why does the current peak right when the capacitor is empty"
- "isnt an empty capacitor just a dead circuit at that point"

### S3 — `inductor_opposes_change_not_current`
- "why doesnt the coil just let the current stop when charge runs out"
- "does the coil fight the current itself or just changes in it"
- "why does the coil keep pushing current even with nothing driving it"
- "whats actually forcing the current to keep flowing after the plates are empty"
- "is the coil acting like its own little battery for a moment"

### S3 — `capacitor_recharges_reversed_polarity`
- "why does the capacitor charge up backwards after being emptied"
- "how does the polarity flip without anything reversing the battery"
- "wheres the reversed charge actually coming from"
- "does the plate that was positive become negative now"
- "why would the circuit want to charge itself the opposite way"

### S5 — `lc_energy_conservation_math`
- "how do you actually calculate the max current from just the voltage"
- "wheres the formula linking the capacitor energy to the coil energy"
- "why do half c v squared and half l i squared have to be equal"
- "how is energy conserved if nothing is being supplied anymore"
- "whats the actual math connecting charge energy and current energy"

### S5 — `max_current_from_energy_balance`
- "why does setting the two energy formulas equal give you the peak current"
- "is there a shortcut to find the max current without calculus"
- "why does all the capacitor energy have to become coil energy at some point"
- "how do i solve for i naught from just v naught l and c"
- "does the peak current depend on both l and c or just one of them"

### S5 — `energy_exchange_twice_per_cycle`
- "why does the energy switch back and forth twice in one swing"
- "shouldnt the energy trade happen only once per cycle"
- "whats special about twice per cycle instead of once"
- "why is the energy swap frequency different from the charge swap frequency"
- "does the energy really finish trading faster than the charge oscillates"

### S6 — `lc_shm_correspondence_table`
- "which electrical thing matches which mechanical thing exactly"
- "why does inductance match mass and not something else"
- "is this analogy exact or just a rough comparison"
- "how do i remember which quantity maps to which in this table"
- "does the math actually force this pairing or is it just convenient"

### S6 — `inductance_as_inertia`
- "why is inductance like mass instead of like a spring"
- "what does it even mean for an electrical part to have inertia"
- "how does the coil resist a change the same way mass does"
- "why doesnt a bigger inductor just mean a stronger current"
- "is inductance really about resisting change and not about strength"

### S6 — `reciprocal_c_as_spring_constant`
- "why is it one over c and not just c that acts like the spring constant"
- "why does a smaller capacitor act like a stiffer spring"
- "whats the physical reason capacitance flips upside down in the analogy"
- "does a bigger capacitor make the swing softer or stiffer"
- "how does one over c connect to how hard the spring pushes back"

---

## Section 6. Constraint callouts / special-case algebra for json_author

1. **KVL sign convention (binding, preamble):** `i := dq/dt`. HUD/chips display `|i(t)|`, never a signed minus. Bead direction and glyph polarity are each independently signed (`sign(i_t)`, `sign(q_t)`) and correctly reverse twice per cycle — do not attempt to cross-derive one sign from the other via a different formula.
2. **Radians wrap:** every `sin`/`cos` call wraps its degree-native angle argument in `radians(...)` — matches `theta`, `omega_prime_deg_per_s*t2`, and the S1 `smoothstep` argument stays a bare ratio (no angle involved).
3. **E_total pin:** compute `E_total = 0.5*C*V0*V0` ONCE per state-apply, cache it, and read the cached value on every surface (S1 gauge target, S5 total line, HUD, half-split base, S7 E_R ceiling). Never recompute it as `E_C(t)+E_B(t)` for display (§4.2 — verified to land on the wrong side of the rounding boundary at some instants).
4. **Near-zero clamp:** `|q_t| < half-LSB` or `|i_t| < half-LSB` renders unsigned `0.00` (the `ac_power_factor_s10_signed_near_zero` prevention, applies here since q and i cross zero every cycle).
5. **Slider steps:** V0 (2–20, step 1, default 10.0); L (1.0–10.0, step 0.1, off-grid default 3.1831 — F8 snap-on-first-drag); C (0.04–0.40, step 0.02, off-grid default 0.1273 — F8 snap-on-first-drag); R (0–10, step 0.5, default 0). L/C off-grid defaults are DELIBERATE (fleet convention, matches every sealed Ch.7 sibling verbatim) — do not round them to the grid.
6. **Glow-focal multiplier (binding, CpA F2, restated):** S5's focal (gauges) and S6's focal (inset) are BOTH live-driven exempt objects — the focal boost MUST be applied as a multiplier on each object's own live channel (gauge-fill brightness, inset draw brightness). Exemption + `brightenOnly` alone is a silent no-op (the `ac_voltage_capacitor`-fixed, scenario-local `accApplyGlow` pattern — NOT inherited automatically by a clone scenario).
7. **Envelope/gauge scaling:** S7's strip rails switch from the guided `±Q0` dashed lines to `±envelope_t = ±Q0*e^(−αt2)` at the R-insert-complete instant (`t2=0`), never before. Gauge bar heights are `E_C_t/E_total` and `E_B_t/E_total` (or their damped equivalents in S7) — NORMALIZED to the pinned `E_total`, so explore extremes (e.g. 80 J) re-scale the bars automatically without a separate re-normalization pass.
8. **Explorer object (Rule 27):** the switch is a stable, addressable primitive — `lco_switch`, param `position: "A"|"B"`, postMessage-drivable (the V2 Professor-Pack seed). It is NOT a `physics_engine_config` slider variable; register it separately in the scenario's explorer-object manifest.
9. **S1/S7 scripted-schedule thumb lockstep (binding, `ghost_compare_cause_invisible_slider_frozen`):** during the S1 charge transient and the S7 R-insert, the DOM slider thumb position + numeric label MUST move in lockstep with the scripted value — never just the underlying visual/physics state while the thumb sits frozen at its old position.
10. **S8 formula surface:** the KVL line renders literally as `L·di/dt + q/C = 0` (Cambria Math, real Unicode `·`) — this exact sign is load-bearing (matches the resolved convention in item 1); do not silently "correct" it to a different sign without re-deriving the entire chain.

---

## Self-review checklist

- [x] Every symbol referenced in the skeleton's state narratives (q, i, Q₀, I₀, T₀, f₀, ω₀, V₀, L, C, R, E_C, E_B, E_R, E_total, x, v, α, ω′) appears in `variables` (Section 1), with `ω′`/`φ′`/`R_crit` explicitly marked internal-only.
- [x] Every formula wraps degree-native `theta`/`omega_prime_deg_per_s*t2` in `radians()` before any sin/cos call.
- [x] Every state's live control(s) declared exactly per the architect's control table (V0 → S1 post-transient/S9, R → S7 post-insert/S9, ALL+switch → S9), each with default/min/max/step in Section 1.
- [x] `variable_overrides` documented for all 9 states (Section 2), explicit reorder-safety reasoning (Rule 25d), CRITICAL defensive relock flagged at S8 (R).
- [x] Board-mode section explicitly SKIPPED (§4.5, Rule 20 [D]).
- [x] Drill-down cluster phrasings: 9 clusters × 5 phrases = 45 (Section 5), real-student-voice, plain English, no Hinglish, no textbook prose.
- [x] `constraints` block: 6 short physics assertions (Section 1 JSON) + coincidence/display-law/existence-probe subsections (Section 4).
- [x] Numerical sanity check run and independently re-verified via node-eval (defaults, half-split instant, full-cycle sweep, S6 velocity-identity, S7 monotonic-decay 5000-sample check, S8 chain, S9 explore extremes) — all reproduced, matching the skeleton's number lock exactly.
- [x] Within-state motion timeline written for all 9 states (Section 3): every row a pure function of the state clock (Rule 26) or a declared sub-anchor (`t2` in S7); no dt-accumulator anywhere; nine distinct archetypes, no repeat; controls column matches the architect table exactly (V0 gated S1/S9, R gated S7/S9, all else locked).
- [x] Rule 32 sequencing verified per state (cause-before-effect beats named in S1/S2/S7 with explicit readable-beat durations); only the taught variable's motion changes per state (32b); the "never let the twin agree by animation luck" caution honored — beads, glyphs, gauges, pen, and inset are ALL literal functions of the SAME `q_t`/`i_t` pair, never independently-animated surfaces.
- [x] Rule 33 dual-band plan inherited from the skeleton (glyphs/beads ARE the mechanism view — no separate interior band, justified per the six-sibling ruling); per-state real numbers verified physically.
- [x] Rule 34: three deliberate NONE formula surfaces confirmed load-bearing (S2/S3/S7) and NOT to be added by json_author; the S8 formula surface's exact sign (`L·di/dt + q/C = 0`) is binding per the resolved convention.
- [x] Notation ladder (Rule 38c): S1/S4/S5/S6/S9 formula surfaces are algebra-only; the calculus-adjacent chain (`d²q/dt²`) is confined to S8, the advanced-ring state.
- [x] KVL sign-convention inconsistency in the task prompt FOUND and RESOLVED (preamble) — matches the skeleton's own binding S8 on-canvas formula exactly, verified to make the S6 velocity-correspondence exact (no caveat needed) as a bonus.
- [x] A SECOND float-boundary trap (live-sum `E_C(t)+E_B(t)` landing on the wrong side of the same rounding boundary) FOUND and FLAGged, extending CpA F1 with concrete new evidence, not just re-stating the skeleton's own finding.
- [x] Glow-focal multiplier requirement (CpA F2) carried into Section 3 (S5/S6) and Section 6 item 6 — binding on the engine/json_author.
- [x] Engine bug queue consulted LIVE (`--field3d --open` 29 rows, `--owner alex:physics_author` 7 rows, `lc_oscillations`/`ac_power_factor`/`series_lcr_circuit` 0 rows each) plus the two CpA-adjudicated bug_class rows read directly from `scar_candidates.sql`; every relevant prevention_rule applied or explicitly marked N/A with reasoning (DUALPANEL_* — no dual-panel graph; `pcpl_radians_helper_missing` — field_3d dialect).
- [x] DC Pandey check: no formula, explanation, or example problem imported from any external book — every formula in Section 1 derived directly from energy conservation on the source-free loop, independently verified via node-eval, not copied from the skeleton's own arithmetic.

---

**Files referenced (read-only, no edits made):**
- `docs/loop_runs/ch7/lc_oscillations/skeleton.md` (input contract, full read, both halves)
- `docs/loop_runs/ch7/lc_oscillations/founder_proxy_report_checkpointA.md` + `_cycle1.md` (binding CpA F1/F2 constraints)
- `docs/loop_runs/ch7/ac_power_factor/physics_block.md`, `docs/loop_runs/ch7/series_lcr_circuit/physics_block.md` (format/rigor precedent; physics independently re-derived, not copied)
- `docs/loop_runs/ch7/_engine/scar_candidates.sql` (bug_class prevention-rule text for the two CpA-adjudicated classes)
- `npx tsx --env-file=.env.local src/scripts/query_engine_bug_queue.ts` (live DB consultation — three invocations)
- Node (`node -e`) arithmetic — all locked numbers, the KVL sign-convention resolution, the E_total-pin float-boundary discovery, the S6 velocity-identity numeric-derivative check, and the S7 5000-sample monotonic-decay check — independently re-verified, not trusted from the prompt alone.

This physics block is ready for `docs/loop_runs/ch7/lc_oscillations/physics_block.md` and handoff to the §0b engine dispatch (NEW `scenario_type: "lc_oscillation"`, Class-B, clone-sibling of `ac_power`) followed by `json_author`.
agentId: afd8482d099f3b78c (use SendMessage with to: 'afd8482d099f3b78c', summary: '<5-10 word recap>' to continue this agent)
<usage>subagent_tokens: 246516
tool_uses: 22
duration_ms: 1038059</usage>