# Physics Block — `transformer` (Ch.7 #8/8, NCERT §7.9)

**Engine bug queue consulted live** (`npx tsx --env-file=.env.local src/scripts/query_engine_bug_queue.ts`):
`--field3d --open` (29 rows) — `ghost_compare_cause_invisible_slider_frozen` (OPEN) binds directly on S5's Nₛ ramp: the DOM thumb + numeric label must move in lockstep with the scripted 100→200 schedule, never just the underlying physics (threaded into §3 below). `field3d_formula_overlay_generic_not_cambria_math` (OPEN) routes every formula surface below through the dedicated `tfr_formula` Cambria panel, never the generic overlay (skeleton §0b item 4). `field3d_sliders_panel_top12_vs_fsbtn_top10` (OPEN) is a zone-geometry concern already satisfied by the skeleton's `:30545–30563` CSS citations, restated in §4. `teach_show_quantity_live_when_named` / `teach_reveal_synced_to_narration` / `teach_color_each_element_by_its_own_sign` (all OPEN, owner `alex:physics_author`/`alex:architect`) are threaded into §3's cue-arm discipline and the colour law (amber=current, cyan=primary-V, green=secondary-V, violet=flux, warm=heat). `--owner alex:physics_author` (7 rows) — `DUALPANEL_*` (3 rows) is **N/A**: this concept has a band+gauges layout, never a Panel-A/Panel-B split-graph; `pcpl_radians_helper_missing` is **N/A** (field_3d dialect — `radians()` is correct here). `transformer` itself: **0 rows** (live-queried — not yet seeded, expected pre-json_author). The two lc_oscillations CpB scars most load-bearing for a `tfr_` clone were read verbatim from `docs/loop_runs/ch7/_engine/scar_candidates.sql`: `field3d_struck_sum_rounds_full_not_displayed_addends` / `energy_readout_rounding_seam_vs_displayed_total` (largest-component-absorbs-residual closure discipline — restated at S8 below) and `field3d_rms_subscript_ascii_in_renderer_text_paths` (Unicode-subscript compose must cover ALL THREE text paths — DOM HUD, canvas `fillText`, sprite labels — and now must additionally handle the DIGIT-vs-LETTER subscript regex gap that caused a CRITICAL recurrence in `series_lcr_circuit`; binding on the new `ₚ`/`ₛ` letter-subscript surface here).

**DC Pandey check:** none consulted. Every formula below is re-derived directly from Faraday's law on a shared closed-core flux (ε = −N·dΦ/dt), ideal power conservation (VₚIₚ = VₛIₛ), and Ohm's law on the resistive load/line (Ch.3 callback) — independently verified numerically below via node-eval, not copied from the skeleton's own arithmetic (which itself is founder-proxy-verified exact and preserved unchanged).

---

## Preamble A — Phase/sign convention (binding, resolved here)

All continuous quantities share **ONE** state-local phase clock, `theta(t) = omega_deg_per_s·t`, `theta0 = 0` at every guided state's own entry (Rule 26). The transformer is modeled as a **purely resistive, ideal (no leakage reactance)** two-coil system: the source, both voltages, and both currents are **all in phase** — there is no φ/lag anywhere in this concept (unlike `ac_power_factor`/`series_lcr_circuit`). Verified: `v_p(t) = N_p·dΦ/dt` requires `Φ(t) = −Φₘ·cos(θ)` given `v_p(t) = √2·Vₚ·sin(θ)` (differentiate: `dΦ/dt = Φₘ·ω·sin(θ)`, set `N_p·Φₘ·ω = √2·Vₚ` → `Φₘ = √2·Vₚ/(N_p·ω)`, exactly the skeleton's own formula). All of `v_s(t)`, `i_s(t)`, `i_p(t)` are `sin(θ)` (in phase with `v_p(t)`); `Φ(t)` alone is `−cos(θ)`, 90° behind — this is the one genuine quadrature relation in the concept, and it is Faraday's law itself, not a circuit-reactance effect. **json_author/engine: never introduce a φ variable or a lag between vₚ and vₛ/iₛ/iₚ — the skeleton's own S7 formula list (`iₛ(t)=√2·Iₛ·sin(ωt)`, `iₚ=(Nₛ/Nₚ)·iₛ`) already commits to this, and my S1 Faraday check above confirms it's the only self-consistent choice.**

## Preamble B — S3 DC-hold physics treatment (founder-proxy flag, decided here — binding)

Two decisions were left open by the skeleton for physics_author (§0b item 4, §3 S3 row). Both are resolved as follows, with reasoning:

**B1. The Φ HUD/trace in S3 — DECISION: HIDE the numeral; render only a `dΦ/dt = 0` qualitative badge.** Reasoning: a *quantitative* steady-state DC flux Φ_dc would require a primary-coil inductance/permeability model that this concept explicitly excludes (atomic claim: "does not quantify mutual inductance M," no magnetizing-current treatment). Any number I could put on that badge would be **fabricated** — not derivable from anything else authored in this concept — and risks exactly the kind of un-derivable on-canvas numeral the fleet's coincidence-audit discipline (§10k) exists to prevent. The AC-peak `0.090 Wb` is explicitly forbidden by the skeleton. So: **the flux tubes stay visually PRESENT at a pinned FULL density** (`flux_density_frac_dc = 1.0`, a rendering constant, not a physical numeral) with breathing amplitude driven to zero — this satisfies the §10j existence-probe ("flux tubes PRESENT at full density... visibly SUSTAINED") without inventing an unfounded number. The HUD instead shows the qualitative badge `dΦ/dt = 0` (text, no magnitude) — this is MORE honest than a numeral would be, and it is exactly the state's own teaching point (steady ≠ zero, but unchanging = no EMF).

**B2. The S3 steady primary DC current `I_p,dc` — DECISION: 3.33 A, via a declared, narrative-only winding-resistance prop.** A real transformer's primary winding has some small DC resistance `R_p`; under DC drive the steady current is `I = V_batt/R_p` (Ohm's law, a Ch.3 callback). I declare:
```
R_p,dc_demo = 3.0 Ω   [S3-ONLY narrative prop — see caveat below]
V_batt_dc   = 10.0 V  [reuses the SAME dial numeral as V_p's default — the battery swaps in for the SAME source prop, not a new unexplained voltage]
I_p,dc      = V_batt_dc / R_p,dc_demo = 3.33 A  [2dp, the current-display law]
```
**Caveat (binding, must be stated in the sim's design notes, never on-canvas):** `R_p,dc_demo` is explicitly **NOT** the same physical quantity that produces S8's declared copper-loss figure (`0.4 W`). If it were the SAME resistance, at the ratio-2 AC work point (`Iₚ=1.60 A`) it would dissipate `1.60²×3.0 = 7.68 W` — wildly inconsistent with the declared `0.4 W` copper loss. A real winding's DC resistance is typically much *smaller* than this demo value — which is exactly why plugging a real transformer primary into DC at its rated AC voltage pulls a dangerous, much larger current in reality (this is the actual physical hazard the DC-dead pivot alludes to). This sim deliberately trades that physical extremity for a **legible, clearly non-colliding demo current** — the identical "declared-not-derived" discipline the fleet already uses for lc_oscillations' off-grid L/C defaults and ac_power_factor's fixed `P_REF_R`. **Verified no numeral collision:** `3.33` does not match any other locked value in this concept (0.100, 10.0, 20.0, 0.40, 0.80, 1.60, 4.0, 16.0, 16.8, 95, 0.090, 5.0, 3.200, 0.032, 100.0, 2.5, 0.20, 0.10, 80.0, 3.20, 256.0, 12.8, 0.023).

**B3. The blip (throw-instant transient) — DECISION: no numeral chip, ever.** The skeleton locks no blip magnitude anywhere in its number-lock block (§2) or its §0b description ("one closed-form needle kick + lamp flash"). Inventing a chip value for it would be exactly the unlocked/fabricated-number failure mode B1 above avoids. The blip is **purely visual**: a needle-position bump + a lamp-brightness pulse, driven by a closed-form bump function (`blip_env_t`, §1), zero HUD/chip attached.

**B4. Why S1's "zero" and S3's "zero" must render VISUALLY DIFFERENT (physics_author addition, not previously stated in the skeleton — surfaced here as a design-quality point, not a redesign).** S1's secondary reads zero because the loop is **mechanically open** (no conducting path — `secondary_closed = 0`). S3's secondary reads zero because the loop is **closed and conducting-capable** yet the flux isn't *changing* (`secondary_closed = 1`, but `dΦ/dt = 0` ⟹ induced ε = 0). These are two physically distinct reasons for the same "zero" reading, and the two states' §10j existence-probes already imply distinct visuals (S1 = dark/disconnected; S3 = the loop remains rendered CLOSED throughout, with dead meters). I flag this explicitly so json_author never collapses the two into the same "dark/disconnected" visual — that would blur exactly the distinction S3 exists to teach ("current still flows and the flux is still there — but nothing CHANGES").

---

## Section 1. `physics_engine_config`

```json
{
  "variables": {
    "N_p": { "name": "Primary turn count — FIXED, never a slider (the reference winding)", "unit": "turns", "constant": 100 },
    "N_s": { "name": "Secondary turn count — the ONE live guided control in the entire concept (S5 post-ramp only; S11 all four sliders live)", "unit": "turns", "min": 25, "max": 400, "default": 200, "step": 25, "role": "driver" },
    "V_p": { "name": "Primary supply voltage — RMS (every meter in this sim reads rms, stated once at S1). NEW declared work point (10.0 V rms) — reconciled against the chapter's own vm=10 V peak and the siblings' 7.07 V rms work point; neither is rendered here (skeleton §2/§10k).", "unit": "V", "min": 2, "max": 20, "default": 10.0, "step": 1, "role": "driver" },
    "f":   { "name": "Source frequency — the chapter's watchable flux rhythm; the real mains rate is phrased neutrally and never numeralized (35b)", "unit": "Hz", "min": 0.10, "max": 1.00, "default": 0.25, "step": 0.05, "role": "driver" },
    "R_load": { "name": "Secondary load resistance — the lamp/resistive load", "unit": "Ohm", "min": 5, "max": 100, "default": 25.0, "step": 5, "role": "driver" },
    "R_line": { "name": "Transmission-line resistance — S7 ONLY, narrative constant, never a slider; chosen so BOTH loss displays land exact at declared precision (skeleton reconciliation with the retired chapter R=5.0 Ohm — different object, never juxtaposed)", "unit": "Ohm", "constant": 5.0 },

    "omega":            { "name": "True angular frequency — feeds ONLY the Phi_m closed form, never on-screen degree display", "unit": "rad/s", "derived": "omega = 2*PI*f" },
    "omega_deg_per_s":  { "name": "Angular speed in deg/s — the degree-native rendering clock theta(t) (fleet dialect)", "unit": "deg/s", "derived": "omega_deg_per_s = omega*180/PI = 360*f" },
    "theta":            { "name": "Instantaneous phase, the state's OWN clock (Rule 26). theta0=0 at EVERY guided state's entry.", "unit": "deg", "derived": "theta = omega_deg_per_s * t   [t = time since STATE ENTRY, pure closed form, zero accumulators]" },
    "T":                { "name": "Period of one full AC cycle at the active f (T=4.00s at defaults, the chapter rate)", "unit": "s", "derived": "T = 1/f" },

    "per_turn": { "name": "EMF per turn — the S4 SUPPORTING result. Dual-labeled once 'volts per turn' at S4, bare thereafter (38d). Verified IDENTICAL on both windings at every ratio (V_p/N_p = V_s/N_s always, since V_s=V_p*N_s/N_p).", "unit": "V/turn", "derived": "per_turn = V_p/N_p" },
    "Phi_m":    { "name": "Peak flux amplitude threading the closed core — depends ONLY on V_p, N_p, f; independent of N_s and R_load (the S5 invariant, debuts S1)", "unit": "Wb", "derived": "Phi_m = sqrt(2)*V_p/(N_p*omega)" },

    "secondary_closed": { "name": "Mechanical gate — 0 before S2's scripted closure (S1 ONLY), 1 from S2 onward (stays closed through S3's DC dead-hold — the loop is a rendered CLOSED path even while dead, distinct from S1's open pose; see Preamble B4)", "unit": "dimensionless (0|1)", "constant": 1 },

    "V_s": { "name": "Secondary voltage (rms), AC states only — THE transformer law, core-ring result debuted S5. Gated to 0 in S1 by secondary_closed and in S3 by the DC-null (see i_p_t/i_s_t notes).", "unit": "V", "derived": "V_s = secondary_closed * V_p*(N_s/N_p)" },
    "I_s": { "name": "Secondary current (rms), AC states only — set by the load alone", "unit": "A", "derived": "I_s = V_s/R_load" },
    "P_s": { "name": "Secondary (load) power — what the secondary actually delivers", "unit": "W", "derived": "P_s = V_s*I_s" },
    "P_p": { "name": "Primary power, IDEAL (no loss) — equals P_s exactly, the S6 PRIMARY-aha quantity, used S1-S7/S10/S11. S8 ALONE substitutes the separate REAL P_p_real (below) — never conflate the two.", "unit": "W", "derived": "P_p = P_s" },
    "I_p": { "name": "Primary current (rms), IDEAL — set by power conservation, never independently chosen", "unit": "A", "derived": "I_p = P_p/V_p" },

    "v_p_t": { "name": "Instantaneous primary voltage — the 0-phase reference (Preamble A). Continues even with the secondary open/dead (S1/S3) — the source keeps driving the primary loop regardless of the secondary's state.", "unit": "V", "derived": "v_p_t = sqrt(2)*V_p*sin(radians(theta))" },
    "Phi_t": { "name": "Instantaneous flux, AC states — LAGS v_p_t by 90deg (Faraday, Preamble A, verified). NOT the formula active during S3's DC hold (see S3 block below) — S3 uses flux_density_frac_dc instead, never this expression.", "unit": "Wb", "derived": "Phi_t = -Phi_m*cos(radians(theta))" },
    "v_s_t": { "name": "Instantaneous secondary voltage — IN PHASE with v_p_t (ideal, same-sense convention, no leakage reactance modeled, Preamble A)", "unit": "V", "derived": "v_s_t = secondary_closed*sqrt(2)*V_s*sin(radians(theta))" },
    "i_s_t": { "name": "Instantaneous secondary current — resistive load, in phase with v_s_t", "unit": "A", "derived": "i_s_t = secondary_closed*sqrt(2)*I_s*sin(radians(theta))" },
    "i_p_t": { "name": "Instantaneous primary current — by turns-ratio + power conservation, SAME phase as i_s_t", "unit": "A", "derived": "i_p_t = (N_s/N_p)*i_s_t" },
    "p_p_t": { "name": "Instantaneous primary power — LITERAL pointwise product (32a caution), never an independently-animated curve that merely agrees", "unit": "W", "derived": "p_p_t = v_p_t*i_p_t" },
    "p_s_t": { "name": "Instantaneous secondary power — LITERAL pointwise product", "unit": "W", "derived": "p_s_t = v_s_t*i_s_t" },

    "bead_frac_p_t": { "name": "Primary-loop bead position — oscillates about home 0.5, phase-locked to i_p_t (fleet oscillating-bead convention, matches lc/ac_power)", "unit": "dimensionless", "derived": "bead_frac_p_t = 0.5 + A_frac_p*sin(radians(theta))" },
    "bead_frac_s_t": { "name": "Secondary-loop bead position — SAME theta, own amplitude scale, ZERO before S2's closure and during S3's DC dead-hold (secondary_closed / DC-null gates apply upstream via i_s_t)", "unit": "dimensionless", "derived": "bead_frac_s_t = 0.5 + A_frac_s*sin(radians(theta))" },
    "A_frac_p": { "name": "Primary bead-excursion visual scale, calibrated at defaults, clamped for explore extremes (fleet A_frac convention)", "unit": "dimensionless", "derived": "A_frac_p = clamp(0.30*(I_p/1.60), 0.08, 0.42)" },
    "A_frac_s": { "name": "Secondary bead-excursion visual scale, calibrated at defaults, clamped for explore extremes", "unit": "dimensionless", "derived": "A_frac_s = clamp(0.30*(I_s/0.80), 0.08, 0.42)" },

    "release_beat_deltaT":  { "name": "S2 switch-closes-to-loop-wakes readable beat (32a cause-first gap)", "unit": "s", "constant": 1.0 },
    "throw_deltaT":         { "name": "S3 blade-swing duration, AC pose to DC pose, before the blip fires", "unit": "s", "constant": 0.8 },
    "blip_deltaT":          { "name": "S3 throw-instant transient bump duration (needle-kick + lamp-flash, Preamble B3 — no numeral)", "unit": "s", "constant": 0.4 },
    "tick_cascade_deltaT":  { "name": "S4 turn-by-turn lighting schedule duration", "unit": "s", "constant": 2.5 },
    "turns_ramp_deltaT":    { "name": "S5 scripted N_s ramp duration (100->200, thumb+label lockstep, F1 scar duty)", "unit": "s", "constant": 3.0 },

    "turn_count_t":  { "name": "S4 running turn counter — closed form, 0..N_p", "unit": "turns", "derived": "turn_count_t = round(N_p*smoothstep(clamp(t/tick_cascade_deltaT,0,1)))   [smoothstep(u)=3u^2-2u^3]" },
    "turn_bar_V_t":  { "name": "S4 voltage bar fill — lockstep with the counter, reuses per_turn exactly (never a second independent computation)", "unit": "V", "derived": "turn_bar_V_t = turn_count_t*per_turn" },

    "N_s_ramp_t": { "name": "S5 scripted turns ramp — 100 to 200. N_s goes plain-live (drag-seize) at script end, matching the F1 ghost_compare_cause_invisible_slider_frozen prevention (thumb+label move in lockstep with this exact value, never just the underlying visual)", "unit": "turns", "derived": "N_s_ramp_t = 100 + 100*smoothstep(clamp(t/turns_ramp_deltaT,0,1))" },

    "R_p_dc_demo": { "name": "S3-ONLY narrative prop (Preamble B2) — a small primary-winding DC resistance chosen for a legible demo current. Explicitly NOT the quantity behind S8's copper-loss figure (caveat in Preamble B2 — never render this symbol on canvas).", "unit": "Ohm", "constant": 3.0 },
    "V_batt_dc":   { "name": "S3 battery voltage — reuses the SAME dial numeral as V_p's default (the prop swap, not a new unexplained voltage)", "unit": "V", "constant": 10.0 },
    "I_p_dc":      { "name": "S3 steady one-way primary DC current (Preamble B2) — Ohm's-law callback (Ch.3), clearly distinct from every AC work-point current and every other numeral in this concept (collision-checked)", "unit": "A", "derived": "I_p_dc = V_batt_dc/R_p_dc_demo" },
    "dc_bead_rate":     { "name": "S3 uniform one-way bead advance rate — visual only, proportional in spirit to I_p_dc", "unit": "1/s", "derived": "dc_bead_rate = 0.06*I_p_dc" },
    "bead_frac_p_dc_t": { "name": "S3 primary-loop bead position — advances UNIFORMLY in ONE direction (never oscillates), a closed-form of the post-blip sub-clock t2. Distinct formula from every AC state's bead_frac_p_t (fleet no-teleport / distinct-per-state-motion discipline, 32b).", "unit": "dimensionless", "derived": "bead_frac_p_dc_t = frac(0.5 + dc_bead_rate*t2)   [frac(x)=x-floor(x); t2 = max(t1-blip_deltaT,0), t1 = time since the throw-complete instant]" },
    "blip_env_t":  { "name": "S3 throw-instant transient bump — drives ONLY the needle-kick + lamp-flash pose (Preamble B3, no numeral rendered anywhere)", "unit": "dimensionless", "derived": "blip_env_t = (t1<blip_deltaT) ? sin(PI*clamp(t1/blip_deltaT,0,1)) : 0" },
    "flux_density_frac_dc": { "name": "S3 flux-tube visual density during the DC hold — PINNED at full (1.0) once the blip completes (Preamble B1); breathing amplitude -> 0. NEVER driven by Phi_t during S3 (that formula is AC-only).", "unit": "dimensionless", "constant": 1.0 },

    "I_line_direct":  { "name": "S7 phase-A line current — direct send at the transformer's OWN secondary voltage (20.0 V at the ratio-2 work point), no further step-up", "unit": "A", "derived": "I_line_direct = P_s/V_s" },
    "I_line_stepped": { "name": "S7 phase-B line current — a SEPARATE transmission-side step-up lifts the send voltage x10 (to 200 V) before the line", "unit": "A", "derived": "I_line_stepped = P_s/(10*V_s)" },
    "loss_direct":    { "name": "S7 phase-A line loss", "unit": "W", "derived": "loss_direct = I_line_direct^2 * R_line" },
    "loss_stepped":   { "name": "S7 phase-B line loss", "unit": "W", "derived": "loss_stepped = I_line_stepped^2 * R_line" },
    "loss_ratio":     { "name": "S7 chip — EXACT ONLY at the declared 3dp precision (2dp form 3.20/0.03=106 is FORBIDDEN, section 4)", "unit": "dimensionless", "derived": "loss_ratio = loss_direct/loss_stepped" },
    "i_line_t":       { "name": "S7 instantaneous line current — SAME theta clock; amplitude = I_line_direct (phase A) or I_line_stepped (phase B); drives the line glow, never independently animated (32a)", "unit": "A", "derived": "i_line_t = sqrt(2)*I_line_phase*sin(radians(theta))   [I_line_phase = I_line_direct in phase A, I_line_stepped in phase B]" },
    "line_glow_t":    { "name": "S7 line-glow drive — the honest heat proxy, averages to the exact loss_direct/loss_stepped values over a full cycle", "unit": "W", "derived": "line_glow_t = i_line_t^2 * R_line" },

    "copper_loss":     { "name": "S8 declared pedagogical constant, valid ONLY at the ratio-2 work point (N_s=200,V_p=10.0,f=0.25,R_load=25.0). No per-mechanism resistive/eddy/hysteresis model is quantitatively built in this concept (consistent with the atomic claim's exclusion of magnetizing current) — these are AUTHORED, not derived.", "unit": "W", "constant": 0.4 },
    "eddy_loss":       { "name": "S8 declared constant (S9 opens this one qualitatively)", "unit": "W", "constant": 0.2 },
    "hysteresis_loss": { "name": "S8 declared constant", "unit": "W", "constant": 0.1 },
    "stray_loss":      { "name": "S8 declared constant (breaks S4's 'ALL flux threads EVERY turn' ideal promise — retro-link)", "unit": "W", "constant": 0.1 },
    "P_p_real": { "name": "S8 ONLY — the REAL primary draw. Never conflate with the ideal P_p used everywhere else.", "unit": "W", "derived": "P_p_real = P_s + copper_loss + eddy_loss + hysteresis_loss + stray_loss" },
    "eta":      { "name": "S8 efficiency — displayed as integer percent (eta*100)", "unit": "dimensionless", "derived": "eta = P_s/P_p_real" }
  },

  "computed_outputs": {
    "Vs_display":       { "formula": "secondary_closed*V_p*(N_s/N_p)" },
    "Is_display":       { "formula": "Vs_display/R_load" },
    "Ps_display":       { "formula": "Vs_display*Is_display" },
    "Ip_display":       { "formula": "Ps_display/V_p" },
    "PhiM_display":     { "formula": "Math.SQRT2*V_p/(N_p*2*Math.PI*f)" },
    "perTurn_display":  { "formula": "V_p/N_p" },
    "PpReal_display":   { "formula": "Ps_display + 0.4 + 0.2 + 0.1 + 0.1" },
    "eta_display":      { "formula": "Ps_display/PpReal_display" },
    "IlineDirect_display":  { "formula": "Ps_display/Vs_display" },
    "IlineStepped_display": { "formula": "Ps_display/(10*Vs_display)" },
    "lossDirect_display":   { "formula": "Math.pow(Ps_display/Vs_display,2)*5.0" },
    "lossStepped_display":  { "formula": "Math.pow(Ps_display/(10*Vs_display),2)*5.0" },
    "IpDc_display":     { "formula": "10.0/3.0" }
  },

  "formulas": {
    "faraday_shared_flux":   "v_p(t) = N_p*dPhi/dt (S1 mechanism, S10 derivation link 1) -- Phi(t)=-Phi_m*cos(theta) is the unique closed form consistent with v_p(t)=sqrt(2)*V_p*sin(theta) (verified, Preamble A)",
    "turns_ratio_law":       "V_s/V_p = N_s/N_p (S5 core-ring result, measured before it is derived)",
    "power_conservation_law":"V_p*I_p = V_s*I_s exactly, ideal (S6 PRIMARY aha) -- nothing amplified, volts traded for amps",
    "dc_null_result":        "Under steady DC, dPhi/dt=0 -> induced EMF=0 in every turn regardless of flux magnitude (S3 PIVOT #2) -- the throw itself was the last CHANGE this loop ever saw",
    "per_turn_share":        "per_turn = V_p/N_p = V_s/N_s identically at every ratio (S4 SUPPORTING result, verified: both equal 0.100 V/turn at ratio 1 AND ratio 2)",
    "transmission_loss_law": "P_loss = I^2*R_line, I=P/V -- stepping V up by k drops I by k and P_loss by k^2 (S7, the grid's entire reason)",
    "efficiency_law":        "eta = P_s/P_p_real = P_s/(P_s + sum of leaks) (S8, real-device digression, extended ring only)",
    "derivation_chain":      "eps_p=-N_p*dPhi/dt, eps_s=-N_s*dPhi/dt (SAME Phi) -> eps_s/eps_p=N_s/N_p -> V_s/V_p=N_s/N_p -> V_p*I_p=V_s*I_s -> I_p/I_s=N_s/N_p (S10)"
  },

  "constraints": [
    "V_s/V_p = N_s/N_p at every instant -- the ideal transformer law (S5).",
    "V_p*I_p = V_s*I_s exactly under the ideal (no-loss) model used S1-S7/S10/S11 -- power passes through unchanged (S6). Only S8's separate P_p_real substitutes real leaks.",
    "Phi_m = sqrt(2)*V_p/(N_p*omega) depends on V_p, N_p, f ALONE -- never on N_s or R_load (the S5 invariant, verified: Phi_m unchanged across the entire N_s ramp).",
    "A transformer transfers power ONLY via CHANGING flux -- steady DC sustains flux but induces zero secondary EMF (dPhi/dt=0 -> eps=0), regardless of how large or how long-sustained that flux is (S3).",
    "Real transformers always have P_p_real > P_s (eta<1) from copper/eddy/hysteresis/stray losses -- eta is bounded in (0,1), never negative, never exceeding 1 (S8).",
    "per_turn = V_p/N_p = V_s/N_s identically, on EITHER winding, at EVERY turns ratio -- verified 0.100 V/turn at both ratio 1 and ratio 2 (S4)."
  ]
}
```

**Numerical sanity check (node-eval, independently reproduced — matches skeleton's founder-proxy-verified number-lock block exactly):**

```
omega = 1.5708 rad/s      per_turn = V_p/N_p = 0.100

ratio(N_s=100):  V_s=10.0  I_s=0.40  P_s=4.0   I_p=0.40           [S2-S4 work point]
ratio(N_s=200):  V_s=20.0  I_s=0.80  P_s=16.0  I_p=1.60           [S5-S9 work point]
ratio(N_s=50):   V_s=5.0   I_s=0.20  P_s=1.0   I_p=0.10           [S11 explore, current-ratio inversion]
ratio(N_s=400,V_p=20): V_s=80.0 I_s=3.20 P_s=256.0 I_p=12.8       [S11 explore extreme]
ratio(N_s=25,V_p=10):  V_s=2.5                                    [S11 explore, 1dp "2.5" ✓]

Phi_m (defaults) = 0.09003 -> "0.090"     Phi_m (f=1.00) = 0.02251 -> "0.023"

P_p_real = 16.0+0.8 = 16.8   eta = 16.0/16.8 = 0.952381 -> "95%"

I1 = 16.0/20.0  = 0.800  loss_direct  = 0.800^2*5.0 = 3.2000 -> "3.200"
I2 = 16.0/200.0 = 0.080  loss_stepped = 0.080^2*5.0 = 0.0320 -> "0.032"
loss_ratio = 3.200/0.032 = 100.00 -> "100.0"  (2dp form 3.20/0.03=106.67 -- FORBIDDEN)

per_turn check at BOTH ratios: V_s/N_s|ratio1 = 10.0/100=0.100; V_s/N_s|ratio2 = 20.0/200=0.100 -- IDENTICAL, confirms the per-turn share is a genuine invariant across the ramp, not a coincidence of one ratio.

I_p_dc = V_batt_dc/R_p_dc_demo = 10.0/3.0 = 3.333... -> "3.33"  (no collision with any other locked numeral, checked against the full number list above)
```

All values reproduced exactly as founder-proxy-verified in the skeleton's opening number-verification block — no discrepancy found.

---

## Section 2. Per-state `variable_overrides` (all 11 states)

Every state carries an EXPLICIT value for N_s/V_p/f/R_load — never "inherited from the previous state" (Rule 25d reorder-safety + `default_variables_only_first_var_merged` scar precedent). **Control-gating is the tightest in the fleet so far: only S5 (post-ramp) and S11 (explore) expose ANY live slider — every other guided state is fully locked**, per the skeleton's own binding control-gating paragraph.

| State | N_s | V_p | f | R_load | Live control(s) | Why |
|---|---|---|---|---|---|---|
| S1 `one_flux_two_coils` | 100 | 10.0 | 0.25 | 25.0 | none | Home pose, ratio 1 — NO voltage difference exists before S5 teaches it (32b no-pre-spoil). Secondary open (`secondary_closed`=0 override for THIS state only, see note below). |
| S2 `the_wireless_handoff` | 100 | 10.0 | 0.25 | 25.0 | none | Full lock — the settled Vₛ=10.0V/Iₛ=0.40A pair (equal turns, unremarked) needs V_p/f/R_load exactly at defaults regardless of state-rail reorder. |
| S3 `dc_is_dead` | 100 | 10.0 (AC leg, pre-throw) | 0.25 | 25.0 | none | Full lock — irrelevant to the DC leg's own numbers (I_p,dc/R_p,dc_demo/V_batt_dc are SEPARATE constants, Preamble B2) but locked for reorder-safety of the brief pre-throw AC render. |
| S4 `every_turn_an_equal_share` | 100 | 10.0 | 0.25 | 25.0 | none | Full lock — the cascade's 100×0.100=10.0V chip is exact only at N_p=100/V_p=10.0. |
| S5 `the_turns_ratio` | 100 (entry) → 200 (scripted ramp end, then plain-live) | 10.0 | 0.25 | 25.0 | **N_s** (post-ramp) | V_p/f/R_load locked so ONLY N_s's motion changes (32b); Φₘ untouched by the ramp (the quiet invariant) needs V_p/f pinned. |
| S6 `no_free_power` | 200 (**CRITICAL defensive relock** — S5 may leave N_s live-dragged if a teacher reorders) | 10.0 | 0.25 | 25.0 | none | Full lock — the struck-ghost chip (10.0×1.60=20.0×0.80=16.0W) and the level Pₚ\|Pₛ bars are exact only at the ratio-2 work point. |
| S7 `the_long_journey` | 200 (defensive relock) | 10.0 | 0.25 | 25.0 | none | Full lock — Pₛ=16.0W is the power fed into the transmission arithmetic; 3.200/0.032=100.0 exact only here. |
| S8 `real_leaks` | 200 (defensive relock) | 10.0 | 0.25 | 25.0 | none | Full lock — the declared leak constants (0.4/0.2/0.1/0.1) are valid ONLY at this exact work point (Section 1 note) and the 16.8/95% chips need Pₛ=16.0 exactly. |
| S9 `why_thin_slices` | 200 | 10.0 | 0.25 | 25.0 | none | Full lock — no numeral is cited in this state (qualitative interior view), locked for apparatus-continuity (the flux drive behind the zoom-lens must still be the ratio-2 work point, not a mid-ramp value). |
| S10 `the_ratio_derived` | 200 | 10.0 | 0.25 | 25.0 | none | Full lock — the numeric substitution `200/100=2 → 20.0V, 0.80A` must match the sealed decimals exactly; apparatus dims (E4), no live interaction. |
| S11 `transformer_sandbox` | 200 (default entry) | 10.0 (default entry) | 0.25 (default entry) | 25.0 (default entry) | ALL: **N_s, V_p, f, R_load** | Explore (Rule 37) — NO `variable_overrides` object authored (inherits `default_variables`, matching the fleet explore-row convention); entry values enumerated for completeness. |

**S1-specific note (not a slider variable — a scene-state flag):** `secondary_closed` is declared `constant: 1` in Section 1 (the fleet default from S2 onward), but **S1 alone requires an explicit local override to 0** — this is the ONE state where the secondary is mechanically open. json_author: gate `secondary_closed` per-state (0 at S1, 1 at S2–S11), NOT as a `physics_engine_config` slider — it is a scene/apparatus pose flag, same class as the AC/DC `tfr_switch` position.

---

## Section 3. Within-state motion timeline + per-state control spec (Rule 31 — all 11 states)

**Shared machinery (defined once):** `theta(t) = omega_deg_per_s*t`, theta=0 at every guided state's OWN entry (Rule 26). All continuous quantities are pure functions of state-local `t` (or a declared sub-anchor, `t1`/`t2` in S3, distinct within-phase clock in S7) — zero per-frame accumulators anywhere, byte-stable under `SET_TIME_FREEZE` by construction. Every candidate narration below is word-counted against the Rule 31a budget (25–55 EN words); S3 and S8 are the two founder-proxy-flagged pressure points and are held deliberately lean.

### S1 `one_flux_two_coils` — core — reveal-build

| t-window | What animates | Driven by | Live controls |
|---|---|---|---|
| [0, 1.2s] cue `apparatus_dock` | Laminated core docks; primary winding+AC source ring (left), secondary winding+lamp+OPEN switch (right); NO conductor bridges the two loops | scripted one-shot | none |
| [1.2, 2.5s] cue `flux_build` | Violet flux tubes draw IN around the closed core | scripted one-shot | — |
| continuous from t=2.5s | Flux tubes breathe: opacity/thickness ∝ `|Phi_t|/Phi_m`, direction glyph = sign(Phi_t); Φ trace pens the band; HUD Φ = 0.090 Wb; Vₚ meter docks at 10.0 V | `Phi_t`, `v_p_t` | — |
| continuous | Secondary side stays dark: `secondary_closed=0` ⟹ zero beads, lamp off, meters absent (Preamble B4 — the MECHANICAL zero) | `secondary_closed` | — |

Narration draft (48 words): *"Two coils sit on one closed iron core, touching nothing. The primary carries an alternating current, and the changing flux it makes circulates through the whole core — threading both windings equally. Right now the secondary's switch is open: no current flows there, no matter how strong the flux."*

No formula overlay (deliberate — S4 debuts the first result formula; the picture states the fact). glow_focal = flux.

### S2 `the_wireless_handoff` — core — flow-along-path — SUPPORTING AHA

| t-window | What animates | Driven by | Live controls |
|---|---|---|---|
| [0, `release_beat_deltaT`=1.0s] cue `secondary_close` | **Cause first (32a):** secondary's own switch closes (`secondary_closed` 0→1, scripted one-shot) | scripted one-shot | none |
| t ≥ 1.0s (state-local t=0 of the loop wake) | **Effect after the readable beat:** amber beads stream (`bead_frac_p_t`, `bead_frac_s_t`), lamp lights (glow ∝ `p_s_t`≥0-honest, tracking `i_s_t²`), Vₛ/Iₛ/Iₚ meters dock and settle at 10.0V/0.40A/0.40A | `V_s`, `I_s`, `I_p`, `i_s_t`, `i_p_t` | — |

Narration draft (49 words): *"Close the secondary's own switch — and current flows, with no wire back to the source. A changing flux through a loop drives an EMF: the same law that kicked a needle in the induction chapter. The lamp lights; the meters agree — ten volts, point four amps, on both sides."*

No formula overlay (deliberate — "the mystery state: motion with no law"). glow_focal = lamp.

### S3 `dc_is_dead` — core — null-result-hold — **PIVOT #2**

theta0=0 at entry (AC leg); `t1`=0 re-anchors at the throw-complete instant; `t2`=max(t1−blip_deltaT,0) re-anchors at the blip-complete instant. **Physics treatment per Preamble B — binding:**

| Cue | ~t | Event |
|---|---|---|
| `ac_leg` | [0, `throw_deltaT`=0.8s] | Brief continuation of the normal AC drive (`v_p_t`, `Phi_t`, beads) — then the switch blade swings AC→B (battery in, source ring greys) |
| `blip` | t1∈[0, `blip_deltaT`=0.4s] | The ONE transient: secondary needle KICKS (magnitude driven by `blip_env_t`, no numeral chip — Preamble B3), lamp FLASHES once |
| `dc_hold` | t2≥0 (t1≥0.4s) | Primary beads switch to `bead_frac_p_dc_t` (uniform ONE-WAY stream, never oscillating — a distinct closed form from every other state, 32b); Iₚ meter reads a steady `I_p_dc`=**3.33 A** (Preamble B2); flux tubes pinned at `flux_density_frac_dc`=1.0 (full density, breathing amplitude→0); Φ HUD shows the qualitative badge `dΦ/dt = 0` — **NUMERAL HIDDEN, never the AC-peak 0.090 Wb** (Preamble B1) |
| continuous | — | Secondary: `secondary_closed`=1 (loop stays CLOSED, unlike S1 — Preamble B4) yet Iₛ=Vₛ=0.00, lamp dark — the ELECTROMAGNETIC zero, visually distinct from S1's mechanical zero |

Narration draft (47 words): *"Swap in a steady battery. At the throw, one blip — then the secondary dies. The primary still carries current, sustaining a huge, frozen flux — current flowing, flux present, nothing changing. So the secondary gets nothing. Only changing flux crosses; that is why the grid runs on AC."*

Formula overlay: **NONE** (deliberate — the mystery/null state; no quantity is symbolically named yet). glow_focal = switch. **misconception_watch (16a PIVOT #2, verified physically true):** belief = *"a transformer works on DC too — steady current still makes flux."* `visual_counter` = the blip (change → response) followed by a dead-hold under FULL, unchanging flux with a steadily-flowing primary. `one_line_fix` = "The current is still flowing and the flux is still there — but nothing CHANGES, so the secondary gets nothing; only change crosses, and that is why transformers, and the grid, live on AC." **Verified:** `dΦ/dt=0` under any constant flux magnitude, however large — the induced EMF in every turn is genuinely, exactly zero (Faraday's law, not an approximation).

### S4 `every_turn_an_equal_share` — core — tally-stack

| t-window | What animates | Driven by | Live controls |
|---|---|---|---|
| [0, 1.0s] cue `ac_restore` | Blade swings back to AC (one beat, apparatus returns to S1/S2's AC pose) | scripted one-shot | none |
| [0, `tick_cascade_deltaT`=2.5s] cue `tick_cascade` | Primary turns light ONE BY ONE; `turn_count_t` runs 0→100; cyan bar fills via `turn_bar_V_t` 0→10.0V in lockstep | `turn_count_t`, `turn_bar_V_t` | — |
| at cascade end | Chip `100 × 0.100 V = 10.0 V` | `turn_bar_V_t` | — |

Narration draft (53 words): *"Every turn rides the same changing flux, so every turn earns the same tenth of a volt. Watch a hundred turns light one by one — a running counter, a bar filling to ten volts, in lockstep. The secondary's own hundred turns ride that same flux — which is why it also reads ten volts."*

Formula overlay: `V_p/N_p = 0.100 V per turn` (algebra-only, core-ring). glow_focal = primary. **Verified invariant (Section 1):** `per_turn` is IDENTICAL (0.100 V/turn) on both windings at BOTH ratio 1 and ratio 2 — a genuine physical constant of this ideal core, not an artifact of ratio 1 alone.

### S5 `the_turns_ratio` — core — grow-and-track

| t-window | What animates | Driven by | Live controls |
|---|---|---|---|
| [0, `turns_ramp_deltaT`=3.0s] cue `ns_ramp` | **Cause first (32a):** secondary winding VISIBLY gains loops; counter climbs; slider thumb+label move in LOCKSTEP with `N_s_ramp_t` (F1 `ghost_compare_cause_invisible_slider_frozen` prevention — binding) | `N_s_ramp_t` | — |
| concurrent | Vₛ climbs 10.0→20.0V, Iₛ 0.40→0.80A, lamp brightens — tracking `N_s_ramp_t` live via the SAME `V_s`/`I_s` formulas (never an independently-animated echo, 32a caution) | `V_s`, `I_s` (fed by `N_s_ramp_t`) | — |
| concurrent, quiet | Flux breathing amplitude/Φ HUD **NEVER changes** during the ramp — the S5 invariant clause | `Phi_m` (verified untouched by N_s) | — |
| at ramp end | Chip `V_s/V_p = N_s/N_p = 200/100 = 2`; naming clause (step-up vs step-down) | — | — |
| after script end | N_s goes plain-live (drag-seize), starting from 200 | — | **N_s** |

Narration draft (46 words): *"Watch the secondary gain turns — a hundred climbing to two hundred, live. The voltage climbs with it: ten volts to twenty. The flux never changed — only how many turns ride it. More turns than the primary makes a step-up transformer; wind fewer, and it steps down."*

Formula overlay: `V_s/V_p = N_s/N_p` (THE transformer equation, core-ring, given as measured). glow_focal = secondary. **§10j probe verified:** `Phi_m` computed from `V_p, N_p, f` alone is mathematically blind to `N_s` — the invariant is not narrated as a coincidence, it is the formula's own structure.

### S6 `no_free_power` — core — ghost-overlay-compare — **PIVOT #1 + PRIMARY AHA**

| Cue | ~t | Event |
|---|---|---|
| `meter_focus` | 0–1.0s | Four meters take focus |
| `ghost_latch` | 1.0–2.5s | Dimmed ghost chip `step-up = free power?` latches (the naive "brighter lamp = more" read) |
| `strike` | phase-fired at bar-settle (cue-armed, never a hardcoded ms) | Live: Vₛ=20.0V doubles Vₚ, but Iₛ=0.80A is HALF of Iₚ=1.60A — the primary pays MORE current in. Pₚ\|Pₛ bars dock dead level at 16.0W. Ghost STRUCK. |
| `chip` | after strike | `10.0 × 1.60 = 20.0 × 0.80 = 16.0 W` |

Narration draft (44 words): *"Twenty volts looks like a win — but watch the current: point eight amps, half of the primary's one point six. Sixteen watts goes in; sixteen watts comes out — no more, no less. A transformer trades volts for amps; it never hands out free power."*

Formula overlay: `V_p·I_p = V_s·I_s` (algebra-only, core-ring). glow_focal = gauges — **pane-level multiplier required** (F5 `glow_focal_on_live_driven_object_exempted_becomes_total_noop` prevention: the boost must brighten the WHOLE gauge pane, never per-bar — a Pₚ/Pₛ pair must never imply one side "matters more"). **misconception_watch (16a PIVOT #1, verified physically true):** belief = *"step-up = free power."* `visual_counter` = the struck ghost beside Iₚ visibly DOUBLING Iₛ and the bars sitting dead level. `one_line_fix` = "A transformer is a trade, not a gift — volts up, amps down; the watts pass through untouched (a little less, in real ones)."

### S7 `the_long_journey` — core — cycle-compare

| Cue | ~t | Event |
|---|---|---|
| `strip_swap` | 0–1.5s | Band swaps to the transmission strip: station → line (R_line=5.0Ω) → house |
| `phase_A` | 1.5–6.0s (≥1 full T=4.0s cycle) | Direct send at 20V: `i_line_t` amplitude from `I_line_direct`=0.800A; line GLOWS hot per `line_glow_t`; chip `loss = 3.200 W` |
| `step_up_swap` | 6.0–7.0s | A step-up transformer lifts the send voltage ×10 to 200V (declared labeled change) |
| `phase_B` | 7.0–11.5s (≥1 full cycle) | `i_line_t` amplitude from `I_line_stepped`=0.0800A; glow COLLAPSES; chip `loss = 0.032 W` |
| `house_clause` | during phase B | Step-down at the house returns to mains voltage for safe use (spoken, not a new state) |

Narration draft (52 words): *"Send sixteen watts down a line directly at twenty volts: point eight amps, and the wire burns three point two watts as heat — a fifth of everything. Step it up tenfold to two hundred volts first: point zero eight amps, and the loss collapses to point zero three two watts — a hundredth."*

Formula overlay: `P_loss = I²·R_line` (with `I=P/V` as the chip's algebra, algebra-only, core-ring). glow_focal = band. **Binding display exception (S7 ONLY):** loss values render at **3dp** — `3.200 W` / `0.032 W` — the 2dp form (`3.20/0.03=106.67`) is FORBIDDEN; the ratio chip `×10 V → ÷100 loss` is chip-safe only at 3dp (verified above).

### S8 `real_leaks` — extended — branch-off

| Cue | ~t | Event |
|---|---|---|
| `gap_open` | 0–1.5s | Gauges re-focus: Pₚ re-reads **16.8 W** while Pₛ holds 16.0 — a 0.8W gap opens |
| `branches_peel` | 1.5–6.0s | Four warm mini-bars branch off in sequence: copper (0.4), eddy (0.2 — "S9 opens that one"), hysteresis (0.1), stray flux (0.1 — breaks S4's "ALL flux threads EVERY turn" ideal promise) |
| `ledger_close` | 6.0–7.5s | Ledger closes on screen: `16.0 + 0.8 = 16.8`; chip `η = 16.0/16.8 = 95%` |

Narration draft (48 words): *"Real transformers leak. The primary now draws sixteen point eight watts, but only sixteen reach the secondary. Copper heat, eddy currents, a magnet-flipping hysteresis cost, and stray flux each take a small share — ninety-five percent efficient. That faint hum near a big transformer is the core itself flexing."*

Formula overlay: `η = P_s/P_p` (algebra-only, extended-ring). glow_focal = gauges (pane-level multiplier, same F5 requirement as S6). **Closure discipline (extends F6 `energy_readout_rounding_seam_vs_displayed_total`, restated):** because `copper_loss`/`eddy_loss`/`hysteresis_loss`/`stray_loss` are hand-DECLARED exact 1dp constants (not derived from higher-precision floats), the displayed ledger `16.0+0.4+0.2+0.1+0.1=16.8` closes EXACTLY by construction — there is no rounding-seam risk here, unlike lc_oscillations' live-recomputed energy gauges. The F6 largest-component-absorbs-residual discipline is armed defensively anyway for any future live-recompute path but is not currently load-bearing on this state.

### S9 `why_thin_slices` — extended — slice-and-quench

| Cue | ~t | Event |
|---|---|---|
| `lens_open` | 0–1.5s | Zoom-lens circle opens on the core (the ONE Rule-33 interior state) |
| `solid_run` | 1.5–5.0s | Solid metal: wide eddy whirlpools (seeded deterministic loops) + heat shimmer, driven qualitatively by the SAME flux drive as the apparatus (no separate formula — declared visual, extent ∝ slab width) |
| `slice_swap` | 5.0–6.0s | Slab slices into insulated laminations |
| `laminated_run` | 6.0–9.0s | SAME flux drive, whirlpools chopped to slivers, shimmer collapses |

Narration draft (45 words): *"Inside a solid core, the changing flux drives wide eddy whirlpools — wasted heat, going nowhere. Slice the same metal into thin, insulated layers, and the whirlpools shrink to slivers; the heat collapses. That is why every real transformer core you will ever see is laminated."*

Formula overlay: **NONE** (deliberate — the cutaway IS the statement). glow_focal = core. Physically verified qualitative mechanism: eddy-loop area scales down with lamination thickness, cutting eddy power loss (proportional to loop-area² under a fixed flux drive) — no B–H diagram or quantitative eddy formula is authored anywhere in this concept (consistent with the atomic claim's scope).

### S10 `the_ratio_derived` — advanced — chain-link-derivation

Apparatus dims (E4 restore, `reveal_hold`).

| Cue | ~t | Event |
|---|---|---|
| `link1` | 0–1.5s | `εₚ = −Nₚ·dΦ/dt` docks |
| `link2` | 1.5–3.0s | `εₛ = −Nₛ·dΦ/dt` docks (SAME Φ — the shared-core fact) |
| `link3` | 3.0–4.0s | Divide: `εₛ/εₚ = Nₛ/Nₚ` |
| `link4` | 4.0–5.5s | Ideal, no drops, no loss: `Vₛ/Vₚ = Nₛ/Nₚ` |
| `link5` | 5.5–7.0s | Power through unchanged: `VₚIₚ = VₛIₛ → Iₚ/Iₛ = Nₛ/Nₚ` |
| `link6` | 7.0–9.0s | Substitute sealed decimals: `200/100 = 2 → 20.0 V, 0.80 A` — the SAME numbers S5/S6 measured |

Narration draft (50 words): *"Both coils sit on the same flux, so εₚ equals minus Nₚ dΦ by dt, and εₛ equals minus Nₛ dΦ by dt. Divide: εₛ over εₚ equals Nₛ over Nₚ. With no losses, power passes through unchanged, so Iₚ over Iₛ equals Nₛ over Nₚ too — the same twenty volts, point eight amps, you just measured."*

Formula overlay: the full chain (calculus-adjacent `dΦ/dt` — advanced ring only, 38c: the ONE state where this notation is permitted). glow_focal = formula. No live controls. **Verified closure:** the chain's final numeric substitution reproduces S5's `20.0 V` and S6's `0.80 A` exactly — the algebra closes back to what was measured, not a new number.

### S11 `transformer_sandbox` — core (ring-neutral, 38b) — drag-sandbox

Free-runs forever (Rule 37). No `variable_overrides` (inherits `default_variables`).

| Behaviour | Driven by |
|---|---|
| Apparatus + flux + beads + lamp, four meters, waveform band (vₚ/vₛ twin sines, auto-ranged), Pₚ\|Pₛ bars, HUD — all re-scale live | `V_p`, `N_s`, `f`, `R_load` (frame reads live `PM_tfr*` globals — the picker scar) |
| Drag **N_s** through 100 → step-up/step-down flip live; at N_s=50: `V_s=5.0V`, `I_p=0.10A < I_s=0.20A` — the current-ratio inversion visibly discoverable, declared unnarrated | `N_s` |
| Drag **V_p** → everything scales, the ratio stays constant | `V_p` |
| Drag **f** → flux breathing rate up, `Phi_m` amplitude honestly DOWN (verified: 0.090→0.023 Wb at f=1.00Hz) — declared, unnarrated | `f` |
| Drag **R_load** → lamp and BOTH currents move together (the primary FEELS the load, via `I_p=P_p/V_p` with `P_p=P_s=V_s²/R_load`) | `R_load` |

Formula overlay: `V_s/V_p = N_s/N_p` ONLY (core-ring, 38b — no η, no leak bars, no derivation chain). glow_focal = formula.

**No-repeat audit (Rule 31):** reveal-build · flow-along-path · null-result-hold · tally-stack · grow-and-track · ghost-overlay-compare · cycle-compare · branch-off · slice-and-quench · chain-link-derivation · drag-sandbox — eleven distinct archetypes, none static, no repeat.

---

## Section 4. Physical constraints, display law, and coincidence guards

**4.1 Display-precision law (binding, restated from skeleton §2, verified above):** V 1dp · I 2dp (`I_p,dc`=3.33 included) · P 1dp · leaks 1dp · η integer % · per-turn V 3dp (0.100) · Φ 3dp Wb (S1 only — S3 renders NO numeral, Preamble B1) · line-loss 3dp W (**S7 ONLY**, declared exception — the 2dp form is FORBIDDEN) · N integer · f 2dp Hz. All values single-rounded from true; every work-point value is EXACT at its declared precision (no rounding boundary anywhere by construction — checked).

**4.2 The two "zero" mechanisms (Preamble B4, binding on the engine dispatch and eye-walker):** S1's dark secondary (`secondary_closed=0`, mechanically open) and S3's dead secondary (`secondary_closed=1`, closed but zero EMF from `dΦ/dt=0`) must render VISIBLY DIFFERENT — S1 shows an open/disconnected loop; S3 shows a CLOSED, ready loop whose meters simply read zero. Collapsing the two into the same "dark" pose would blur the state's own teaching point.

**4.3 S1/S2/S3/S9 deliberate-NONE formula surfaces (binding, restated):** all four are load-bearing omissions, not gaps — json_author must NOT add a formula surface to any of them (S1: picture states the fact; S2: the mystery-state aha; S3: the null-result needs no law; S9: the cutaway IS the statement).

**4.4 Coincidence audit (§10k, restated with verification):**
1. `V_p=10.0 V rms` shares its numeral with the chapter's `vₘ=10 V` peak — a DECLARED new work point (Section 1), never juxtaposed with the siblings' 7.07V rms work point.
2. `I_p=1.60A`/`P_p=16.0W` echo digits because `V_p=10` shifts the decimal — honest arithmetic, verified via node above, never called a coincidence.
3. `f=0.25Hz` is the chapter's visualization rate; the real mains frequency is never numeralized (35b).
4. `R_line=5.0Ω` numerically equals the chapter's retired series resistor — different object (a transmission line), never juxtaposed; chosen because it makes both loss displays EXACT (verified).
5. The ×100 loss ratio is chip-safe ONLY at 3dp (verified: `3.200/0.032=100.00`); the 2dp form is FORBIDDEN.
6. `η=95%` matches the settled "well-designed transformers exceed 95%" fact — physics-true, not engineered (verified: true value 0.95238, single-round to 95%).
7. At ratio 1, `Iₚ=Iₛ=0.40A` — a LAW (equal turns ⟹ equal everything), not a coincidence.
8. `Φₘ=0.090Wb` carries no claimed relation to any other number.
9. **NEW (physics_author addition):** `I_p,dc=3.33A` (S3) does not collide with any other locked numeral in the concept — explicitly checked against the full number list (Preamble B2).

**4.5 Board mode — SKIPPED.** Per the active conceptual-only directive (Rule 20 [D]): no `mode_overrides`, no board mark scheme, no `derivation_sequence` authored.

---

## Section 5. Drill-down cluster phrasings (9 clusters × 5 = 45)

### S3 — `why_transformer_needs_ac`
- "why doesnt a transformer work on a regular battery"
- "why does the secondary need the flux to keep changing"
- "cant a strong steady current do the same job as ac"
- "why does the current have to keep switching direction for it to work"
- "whats special about ac that dc just cant give you here"

### S3 — `dc_switch_on_blip_explained`
- "why did the needle jump for just a second when the battery got connected"
- "if dc doesnt work why did the lamp flash at all"
- "was that flash a mistake or is it supposed to happen"
- "why does something happen right at the switch but then nothing after"
- "is that one flash proof that dc sort of works a tiny bit"

### S3 — `steady_flux_zero_emf`
- "how can there be a huge flux but zero voltage induced"
- "isnt more flux supposed to mean more induced voltage"
- "why does a strong flux give nothing if it just sits there"
- "whats the difference between flux existing and flux doing something"
- "why does dphi dt matter more than phi itself"

### S5 — `turns_ratio_numericals`
- "how do you find the secondary voltage if you know the turns and the primary voltage"
- "whats the actual ratio you multiply by to get the new voltage"
- "how many turns do i need if i want to double the voltage"
- "does the turns ratio work the same way for stepping down"
- "how do i figure out which winding has more turns just from the voltages"

### S5 — `step_up_vs_step_down_identify`
- "how do you tell if a transformer is step up or step down just by looking"
- "is more turns on the secondary always step up"
- "what tells you which side is which in a diagram"
- "can the same transformer be step up one way and step down the other way"
- "why does winding fewer turns lower the voltage instead of raising it"

### S5 — `volts_per_turn_design`
- "why does each turn only give a tiny bit of voltage"
- "how do engineers decide how many turns to wind"
- "does a thicker wire mean more volts per turn"
- "why is the volts per turn the same on both sides"
- "if i want more voltage do i just add more turns forever"

### S6 — `power_conservation_current_inverse`
- "why does the current drop when the voltage goes up"
- "shouldnt more voltage just mean more power for free"
- "how does the primary know to send less current when the secondary needs less"
- "why cant you get more power out than you put in"
- "does the primary current change automatically or does someone control it"

### S6 — `step_up_free_energy_error`
- "if the voltage doubled why isnt the power doubled too"
- "where would the extra energy even come from if it did double"
- "isnt a step up transformer basically making free electricity"
- "why does a brighter lamp not mean youre getting something for nothing"
- "whats actually being traded when the voltage goes up"

### S6 — `primary_current_feels_the_load`
- "why does the primary current depend on what the secondary is connected to"
- "how does the primary know theres a lamp on the other side with no wire"
- "does the primary current change if i swap the load resistor"
- "why does a bigger load pull more current on both sides"
- "whats the actual link between the secondary load and the primary draw"

---

## Section 6. Constraint callouts / special-case algebra for json_author

1. **Phase convention (binding, Preamble A):** all continuous quantities share ONE theta(t) clock; `v_p_t`, `v_s_t`, `i_s_t`, `i_p_t` are ALL `sin(theta)` (in phase — no leakage reactance modeled); `Phi_t` alone is `-cos(theta)`, 90° behind (Faraday's law itself, not a circuit-reactance effect). Never introduce a φ/lag variable anywhere in this concept.
2. **Radians wrap:** every `sin`/`cos` call wraps its degree-native angle argument in `radians(...)` — `theta` in every AC formula, `PI*clamp(t1/blip_deltaT,0,1)` in `blip_env_t` is already radian-native (no wrap needed there — it's a raw sine argument, not a degree value).
3. **S3 Φ-hide binding (Preamble B1):** the S3 state renders NO Φ numeral, ever — only the qualitative badge `dΦ/dt = 0`. `flux_density_frac_dc = 1.0` (constant) drives tube opacity/thickness during the DC hold; the `Phi_t` formula (AC-only) must NOT be evaluated during S3's dc_hold cue window.
4. **S3 blip no-numeral binding (Preamble B3):** `blip_env_t` drives ONLY the needle-kick pose and lamp-flash brightness — no HUD/chip numeral is ever attached to it. Do not invent one.
5. **S3 two-zeros distinction (binding, §4.2):** S1's dark secondary (`secondary_closed=0`) and S3's dead secondary (`secondary_closed=1`, zero EMF) must render visibly differently — S3's loop stays rendered CLOSED throughout.
6. **S8 declared-constant leaks (binding):** `copper_loss`/`eddy_loss`/`hysteresis_loss`/`stray_loss` are hand-authored 1dp constants valid ONLY at the ratio-2 work point — never wire them to a general formula that would also fire in S11 explore (explore excludes leak bars entirely per the ring gate, 38b).
7. **Glow-focal pane-level multiplier (binding, F5 `glow_focal_on_live_driven_object_exempted_becomes_total_noop`):** S6's and S8's `gauges` focal must brighten the WHOLE gauge pane as a multiplier on its own live channel — never per-bar (a Pₚ/Pₛ pair, or the leak ledger, must never visually imply one side "matters more").
8. **ASCII pinned-token compose (binding, `field3d_rms_subscript_ascii_in_renderer_text_paths`):** render tokens `V_p / V_s / I_p / I_s / N_p / N_s / P_p / P_s / R_line / Phi / eta` and compose-sweep to `Vₚ Vₛ Iₚ Iₛ Nₚ Nₛ Pₚ Pₛ R_line Φ η` on ALL THREE text paths (DOM HUD innerHTML, canvas `ctx.fillText`, sprite labels) — verify the compose regex handles this concept's LETTER subscripts (ₚ/ₛ, U+209A/U+209B), a NEW surface for the fleet (previously only digit/other-letter subscripts existed).
9. **Near-zero clamp:** `|v_p_t|`, `|v_s_t|`, `|i_s_t|`, `|i_p_t|`, `|Phi_t|` < half-LSB render unsigned `0.00` (crosses zero every cycle in every AC state).
10. **Slider steps (4 rows, matching §0b ask 14 exactly):** N_s (25–400, step 25, default 200); V_p (2–20, step 1, default 10.0); f (0.10–1.00, step 0.05, default 0.25); R_load (5–100, step 5, default 25.0).
11. **S5 thumb lockstep (binding, F1 `ghost_compare_cause_invisible_slider_frozen`):** during the scripted N_s ramp, the DOM slider thumb position + numeric label MUST move in lockstep with `N_s_ramp_t` — never just the underlying physics/visual while the thumb sits frozen.
12. **S7 3dp exception (binding):** loss values render at 3dp ONLY in S7 — nowhere else in the concept needs 3dp precision; do not propagate this exception to other states' I/P displays.
13. **Explorer objects (Rule 27):** `tfr_switch` (AC/DC source selector, Rule-27 stable ID, `position:"A"|"B"`) is SCRIPTED-ONLY at S3 — it is NOT part of S11's live control set per the skeleton's explicit S11 behavior table (which lists only N_s/V_p/f/R_load). Do not add it as an explore-draggable object; that would be a redesign beyond this dispatch's scope.
14. **Secondary switch:** closes ONCE (S2, scripted one-shot) and stays closed for S3–S11 (`secondary_closed=1` from S2 onward) — it is never re-opened and never independently draggable.
15. **P_p vs P_p_real (binding, do not conflate):** `P_p` (ideal, = `P_s`) is used S1–S7/S10/S11; `P_p_real` (= `P_s` + leaks) is used ONLY at S8. A single shared variable for both would silently break either S6's "nothing amplified" equality or S8's "0.8W gap."

---

## Self-review checklist

- [x] Every symbol referenced in the skeleton's state narratives (Φ, Vₚ, Vₛ, Iₚ, Iₛ, Pₚ, Pₛ, Nₚ, Nₛ, η, R_line, per-turn) appears in `variables` (Section 1).
- [x] Every formula wraps degree-native `theta` in `radians()` before any sin/cos call.
- [x] Every state's live control(s) declared exactly per the architect's control table (N_s → S5 post-ramp/S11, V_p/f/R_load → S11 only), each with default/min/max/step in Section 1. Confirmed the tightest control-gating in the fleet: only 2 of 11 states expose any live slider.
- [x] `variable_overrides` documented for all 11 states (Section 2), explicit reorder-safety reasoning (Rule 25d), CRITICAL defensive relocks flagged at S6/S7/S8 (N_s).
- [x] Board-mode section explicitly SKIPPED (§4.5, Rule 20 [D]).
- [x] Drill-down cluster phrasings: 9 clusters × 5 phrases = 45 (Section 5), real-student-voice, plain English, no Hinglish, no textbook prose.
- [x] `constraints` block: 6 short physics assertions (Section 1 JSON) + display-law/coincidence/two-zeros subsections (Section 4).
- [x] Numerical sanity check run and independently re-verified via node-eval (all ratio work points, explore extremes, per-turn invariant across both ratios, transmission loss ratio, S3 DC-current sizing/collision check) — all reproduced, matching the skeleton's founder-proxy number-lock exactly.
- [x] Within-state motion timeline written for all 11 states (Section 3): every row a pure function of the state clock (Rule 26) or a declared sub-anchor (`t1`/`t2` in S3); eleven distinct archetypes, no repeat; controls column matches the architect table exactly.
- [x] Rule 32 sequencing verified per state (cause-before-effect beats named in S2/S3/S5/S7 with explicit readable-beat durations); only the taught variable's motion changes per state (32b).
- [x] **Word budget (Rule 31a) enforced and verified per state — candidate narration drafted and word-counted for all 11 guided states:** S1 48w · S2 49w · S3 47w (flagged pressure point, held lean) · S4 53w · S5 46w · S6 44w · S7 52w · S8 48w (flagged pressure point, held lean) · S9 45w · S10 50w · S11 0/open. All within the 25–55 range; S3 and S8 both comfortably under 55 as required.
- [x] Notation ladder (Rule 38c): S1/S4/S5/S6/S7/S8/S11 formula surfaces are algebra-only; the calculus-adjacent `dΦ/dt` chain is confined to S10, the advanced-ring state. Dialect (38d): "Voltage V (p.d.)" and "battery" not "cell" per skeleton DoD symbol table — carried unchanged.
- [x] **S3 physics treatment DECIDED explicitly (task item 4, Preamble B):** Φ HUD hidden (never the AC-peak numeral, never a fabricated Φ_dc); DC hold current sized distinctly (3.33 A, collision-checked) via a declared, caveated narrative-only winding-resistance prop, clearly separated from S8's copper-loss figure.
- [x] The two "zero" mechanisms (S1 mechanical / S3 electromagnetic) identified as needing visually distinct rendering — a physics-author addition surfaced explicitly, not a redesign.
- [x] Glow-focal pane-level multiplier requirement (F5) carried into Section 3 (S6/S8) and Section 6 item 7 — binding on the engine/json_author.
- [x] Engine bug queue consulted LIVE (`--field3d --open` 29 rows, `--owner alex:physics_author` 7 rows, `transformer` 0 rows) plus the three most load-bearing lc_oscillations CpB scar rows read verbatim from `scar_candidates.sql`; every relevant prevention_rule applied or explicitly marked N/A with reasoning (DUALPANEL_* — no dual-panel graph; `pcpl_radians_helper_missing` — field_3d dialect).
- [x] DC Pandey check: no formula, explanation, or example problem imported from any external book — every formula in Section 1 derived directly from Faraday's law on a shared closed-core flux, ideal power conservation, and Ohm's law, independently verified via node-eval.

---

**Files referenced (read-only, no edits made):**
- `docs/loop_runs/ch7/transformer/skeleton.md` (input contract, full read, both halves)
- `docs/loop_runs/ch7/lc_oscillations/physics_block.md`, `docs/loop_runs/ch7/ac_power_factor/physics_block.md` (format/rigor precedent; physics independently re-derived, not copied)
- `docs/loop_runs/ch7/_engine/scar_candidates.sql` (F1/F3/F4/F5/F6 prevention-rule text, `field3d_rms_subscript_ascii_in_renderer_text_paths` digit-vs-letter subscript lesson)
- `npx tsx --env-file=.env.local src/scripts/query_engine_bug_queue.ts` (live DB consultation — three invocations: `--field3d --open`, `--owner alex:physics_author`, `transformer`)
- Node (`node -e`) arithmetic — all locked numbers, the per-turn cross-ratio invariant check, the transmission loss-ratio precision check, the S3 DC-current sizing + numeral-collision check — independently re-verified, not trusted from the prompt alone.

This physics block is ready for `docs/loop_runs/ch7/transformer/physics_block.md` and handoff to the §0b engine dispatch (NEW `scenario_type: "transformer"`, Class-B, clone-sibling of `lc_oscillation`) followed by `json_author`.