# Pilot Topic 39 — Alternating Current (AC Circuits)

> Stage-2 pilot catalog. 25th of 44. **E&M cluster closer #2 of 2** (sibling: T37 Magnetism & Matter).
> Sources: **NCERT Class 12 Part 1 Ch.7 Alternating Current** (canonical spine) + **HCV Vol 2 Ch.43 Alternating Current** (derivation/pedagogy) + **DC Pandey Electricity & Magnetism Ch.30 Alternating Current** (problem patterns).
> Coverage class: **TRIPLE-COVERED**.
> Anchor density: **VERY-STRONG** — 14 institutional anchors spanning policy (CEA tariff orders, BIS standards), industry (BHEL, Crompton Greaves, Tata Power, Adani Transmission, PowerGrid, NTPC), transport (Indian Railways 25 kV/50 Hz AC traction), space (ISRO power conditioning), consumer (Bajaj, Luminous UPS), healthcare (AIIMS UPS-on-life-support), telecom (BSNL exchange power), defence (DRDO power electronics), residential (induction cooktops, fan regulators, choke ballasts). **4th VERY-STRONG topic in Stage-2** (after T48, T49, T50).
> **Critical role:** AC chapter applies T37 ferromagnetic-core-selection + T35 self/mutual-inductance + T34 Kirchhoff to circuit elements driven sinusoidally. **Closes T35 EI-G6 deferral** (LC oscillation belongs here) AND **closes T37 forward-edge** (transformer core selection ← hysteresis loop). The most-applied chapter in Class-12 E&M curriculum.

---

## Founder Decisions Applied

| Tag | Decision |
|---|---|
| **AC-G1** | Atomic granularity = "one circuit configuration OR one sinusoidal-response property OR one engineering application." Resistor-only, inductor-only, capacitor-only, and LCR-series circuits are FOUR separate atomics — each has a distinct phase relationship, distinct reactance/impedance formula, distinct misconception. |
| **AC-G2** | **AC voltage source + rms representation is ONE atomic** (`ac_voltage_source_atomic`) with V₀, V_rms, ω, T as nanos. Bundling because students must hold "instantaneous v(t) = V₀ sin ωt" alongside "rms value V_rms = V₀/√2" — they're two views of the same source. Splitting destroys the foundational view-pair. |
| **AC-G3** | **Phasor representation is its own atomic** (`phasor_representation_atomic`) — the rotating-vector technique is a cognitive tool used across all subsequent atomics (resistor-AC, inductor-AC, capacitor-AC, LCR-series, resonance, power). Author once; reference everywhere downstream. |
| **AC-G4** | **LC oscillation is its own atomic in T39** (`lc_oscillations_atomic`), **NOT in T35** — closes the EI-G6 deferral. Reason: LC oscillation is the AC chapter's natural foundation (sinusoidal-energy-exchange between L and C is the simplest AC analog before resistive damping), and its 2nd-order ODE machinery sits next to SHM (T17 A4 d²x/dt² = −ω²x) — same mathematical form, charge q replaces displacement x. **Cross-cluster bridge to T17 SHM (most-cited cross-topic analogy in physics).** |
| **AC-G5** | **Resonance in LCR + Q-factor + bandwidth = ONE atomic** (`resonance_in_lcr_atomic`) with sharpness Q and bandwidth Δω as nanos. Bundling because they describe ONE phenomenon (peak in impedance-vs-frequency curve) from three angles. Splitting would force students to memorise Q = ω₀L/R + Q = ω₀/Δω separately instead of seeing them as the same answer to "how peaked is the resonance?" |
| **AC-G6** | **Power in AC = ONE atomic** with real power (P = V_rms·I_rms·cos φ), apparent power (S = V_rms·I_rms), reactive power (Q = V_rms·I_rms·sin φ), and power factor (cos φ) as nanos. **Cognitive-error-prevention:** the four power-quantities are the single-most-confused topic in NCERT Ch.7 (per HCV §43.6 + DCP common-mistakes table). Tabular nano enforces side-by-side comparison. |
| **AC-G7** | **Transformer is its own atomic in T39** (`transformer_in_ac_atomic`), extending T35's primitive transformer atomic. Reason: NCERT Ch.7 §7.10 is where the practical transformer (turn ratios, primary/secondary, ideal vs real, step-up/step-down, losses) is fully developed; T35 introduces the principle, T39 develops the engineering. **Closes T37 hysteresis-loop forward-edge** (transformer core selection requires soft-iron with low coercivity). |
| **AC-G8** | **Wattless current + choke coil = TWO atomics**, not one. Different conceptual targets: wattless current = "current flows but P_avg = 0" (purely reactive); choke coil = "engineering device that limits AC current without dissipating power" (practical application of wattless principle). Splitting captures the conceptual-vs-engineering distinction. |
| **AC-G9** | **VERY-STRONG anchor (4th in Stage-2).** 14 distinct institutional anchors spanning policy + industry + transport + space + consumer + healthcare + telecom + defence + residential strands. Easily clears the 13-anchor threshold. **Pattern signal:** AC chapter is the most-industrially-anchored topic in Indian Class-12 physics — virtually every electrical artifact in Indian everyday life is downstream of this chapter. |
| **AC-G10** | **Cognitive-error-prevention sub-category:** "Why does V lead I by π/2 in an inductor but lag by π/2 in a capacitor?" — students memorise the rule without internalising "inductor opposes change in I, so V must rise BEFORE I to drive the change; capacitor opposes change in V, so I must rise BEFORE V to push charge onto the plate." Author dedicated `phase_relationship_intuition_nano` under `phasor_representation_atomic` that explicitly reasons through both. |
| **AC-G11** | **Phasor-complex-representation as math-tool primitive** — register Z = R + jX as a NEW Stage-3 stub (`phasor_complex_representation`). Used by all 4 reactive-circuit atomics + LCR-series + resonance + power. **First NEW math-tools stub registered since Session 45.** |

---

## Section A — Source Map

| Sub-topic | NCERT 12.1 Ch.7 | HCV V2 Ch.43 | DCP EM Ch.30 |
|---|---|---|---|
| AC voltage source + sinusoidal voltage | §7.2 | §43.2 | §30.2 |
| RMS values | §7.2.1 | §43.3 | §30.3 |
| AC through a resistor | §7.3 | §43.4 | §30.4 |
| Phasor representation | §7.4 | §43.5 | §30.5 |
| AC through an inductor | §7.5 | §43.6 | §30.6 |
| AC through a capacitor | §7.6 | §43.7 | §30.7 |
| LCR series circuit | §7.7 | §43.8 | §30.8 |
| Resonance | §7.7.1 | §43.9 | §30.9 |
| Q factor + sharpness | §7.7.2 | §43.10 | §30.10 |
| Power in AC | §7.8 | §43.11 | §30.11 |
| LC oscillations | §7.9 | §43.12 | §30.12 |
| Transformer | §7.10 | §43.13 | §30.13 |
| Wattless current + choke coil | §7.8 (boxed) | §43.14 | §30.14 |

---

## Section B — Atomic + Nano Catalog

| ID | Concept | Type | Sim? | In repo? | Requires | Required-by | Notes |
|---|---|---|---|---|---|---|---|
| **ac_voltage_source_atomic** | v(t) = V₀ sin ωt; V_rms = V₀/√2; ω = 2πf; T = 1/f | atomic | ✅ | — | [shm_x_eq_a_sin_omega_t(T17)] | [phasor_representation_atomic, ac_resistor_circuit, ac_inductor_circuit, ac_capacitor_circuit] | AC-G2; foundational atomic for entire chapter |
| ↳ rms_vs_peak_vs_average_nano | V_rms = V₀/√2; V_avg over half-cycle = 2V₀/π; over full = 0. Derivation via ⟨sin²ωt⟩ = ½ | nano | ✅ | — | [ac_voltage_source_atomic, time_averaging_cos_squared(math-tools)] | [power_in_ac_circuit_atomic] | parent: ac_voltage_source_atomic; **3rd cross-cluster use of `time_averaging_cos_squared`** |
| ↳ frequency_50hz_indian_grid_nano | India: 50 Hz; US: 60 Hz; BIS IS 12360 standard | nano | — | — | [ac_voltage_source_atomic] | — | parent: ac_voltage_source_atomic; Indian standards anchor |
| **phasor_representation_atomic** | Sinusoidal quantity ↔ rotating vector in complex plane; phase angle = rotation angle; magnitude = peak value | atomic | ✅ | — | [ac_voltage_source_atomic, vector_rotation(math-tools), phasor_complex_representation(math-tools NEW)] | [ac_inductor_circuit, ac_capacitor_circuit, lcr_series_circuit_atomic, impedance_triangle_nano] | AC-G3; the cognitive tool used everywhere downstream |
| ↳ phase_relationship_intuition_nano | Inductor: V leads I (V must rise to drive change in I against L); Capacitor: I leads V (I delivers charge before V builds across plates) | nano | ✅ | — | [phasor_representation_atomic, ac_inductor_circuit, ac_capacitor_circuit] | — | parent: phasor_representation_atomic; AC-G10 cognitive-error-prevention nano |
| ↳ impedance_triangle_nano | Z² = R² + (X_L − X_C)²; tan φ = (X_L − X_C)/R | nano | ✅ | — | [phasor_representation_atomic, lcr_series_circuit_atomic] | [resonance_in_lcr_atomic] | parent: phasor_representation_atomic |
| **ac_resistor_circuit** | V and I in phase; I = V/R same as DC; P_avg = V_rms²/R | atomic | ✅ | — | [ac_voltage_source_atomic, ohms_law(T34 bundle)] | [power_in_ac_circuit_atomic] | The simplest AC circuit — phase φ = 0 |
| **ac_inductor_circuit** | V leads I by π/2; X_L = ωL (inductive reactance); no power dissipation | atomic | ✅ | — | [ac_voltage_source_atomic, self_inductance(T35), phasor_representation_atomic] | [lcr_series_circuit_atomic, wattless_current_atomic, choke_coil_atomic] | X_L grows linearly with ω |
| ↳ inductive_reactance_x_l_units_nano | X_L = ωL has units of ohms; X_L(50Hz) for 1H coil = 314 Ω | nano | — | — | [ac_inductor_circuit] | — | parent: ac_inductor_circuit |
| **ac_capacitor_circuit** | I leads V by π/2; X_C = 1/(ωC) (capacitive reactance); no power dissipation | atomic | ✅ | — | [ac_voltage_source_atomic, capacitor_basics(T31), phasor_representation_atomic] | [lcr_series_circuit_atomic, wattless_current_atomic] | X_C decreases with ω — opposite frequency-dependence to X_L |
| ↳ capacitive_reactance_x_c_units_nano | X_C = 1/(ωC) has units of ohms; X_C(50Hz) for 1μF cap = 3.18 kΩ | nano | — | — | [ac_capacitor_circuit] | — | parent: ac_capacitor_circuit |
| **lcr_series_circuit_atomic** | Impedance Z = √(R² + (X_L − X_C)²); phase φ = arctan((X_L − X_C)/R); I = V₀/Z | atomic | ✅ | — | [ac_resistor_circuit, ac_inductor_circuit, ac_capacitor_circuit, phasor_representation_atomic, impedance_triangle_nano] | [resonance_in_lcr_atomic, power_in_ac_circuit_atomic] | Combines all 3 previous atomics via vector addition of voltage phasors |
| **resonance_in_lcr_atomic** | At ω₀ = 1/√(LC), X_L = X_C → Z minimized = R → I maximized; sharpness Q = ω₀L/R | atomic | ✅ | — | [lcr_series_circuit_atomic, lc_oscillations_atomic] | [power_in_ac_circuit_atomic, radio_tuning_application_nano] | AC-G5; Diamond candidate — resonance curve + Q-sharpness sim |
| ↳ q_factor_nano | Q = ω₀L/R = (1/R)·√(L/C); also Q = ω₀/Δω (bandwidth ratio) | nano | ✅ | — | [resonance_in_lcr_atomic] | — | parent: resonance_in_lcr_atomic |
| ↳ bandwidth_delta_omega_nano | Δω = R/L = ω₀/Q; half-power frequencies bracket resonance | nano | ✅ | — | [resonance_in_lcr_atomic, q_factor_nano] | — | parent: resonance_in_lcr_atomic |
| ↳ radio_tuning_application_nano | LC tuning in radio receiver selects one station from EM spectrum by matching ω₀ | nano | ✅ | — | [resonance_in_lcr_atomic, hertz_experiment_atomic(T38)] | — | parent: resonance_in_lcr_atomic; bridge to T38 Hertz receiver |
| **power_in_ac_circuit_atomic** | P_avg = V_rms·I_rms·cos φ (real); S = V_rms·I_rms (apparent); Q_react = V_rms·I_rms·sin φ (reactive); cos φ = power factor | atomic | ✅ | — | [lcr_series_circuit_atomic, ac_resistor_circuit, rms_vs_peak_vs_average_nano] | [wattless_current_atomic, power_factor_correction_nano] | AC-G6; cognitive-error-prevention atomic |
| ↳ power_factor_correction_nano | Industrial loads add capacitor banks to push cos φ → 1; reduces I_rms for same P_avg → lowers I²R losses in transmission. CEA tariff penalises low cos φ | nano | ✅ | — | [power_in_ac_circuit_atomic] | — | parent: power_in_ac_circuit_atomic; **policy-strand anchor: CEA tariff orders** |
| ↳ real_vs_apparent_vs_reactive_table_nano | Side-by-side table: name, formula, units (W vs VA vs VAR), physical meaning | nano | ✅ | — | [power_in_ac_circuit_atomic] | — | parent: power_in_ac_circuit_atomic; AC-G6 cognitive-error-prevention nano |
| **lc_oscillations_atomic** | Energy oscillates between L (½LI²) and C (½CV²) at ω = 1/√(LC); analogous to SHM with q ↔ x | atomic | ✅ | — | [energy_stored_in_inductor(T35), capacitor_energy(T31), shm_x_eq_a_sin_omega_t(T17 A4)] | [resonance_in_lcr_atomic] | AC-G4; **closes EI-G6 deferral from T35**; **bridges to T17 SHM** (most-cited cross-cluster analogy) |
| ↳ q_obeys_shm_equation_nano | d²q/dt² = −q/(LC); compare to d²x/dt² = −ω²x with ω² = 1/LC | nano | ✅ | — | [lc_oscillations_atomic, shm_a_eq_minus_omega_squared_x(T17 A4)] | — | parent: lc_oscillations_atomic |
| ↳ energy_partition_oscillation_nano | At t=0 all energy in C; at quarter-period all in L; full period returns; ½LI₀² = ½CV₀² | nano | — | — | [lc_oscillations_atomic] | — | parent: lc_oscillations_atomic |
| **transformer_in_ac_atomic** | V_s/V_p = N_s/N_p (turn ratio); I_s/I_p = N_p/N_s (ideal); soft-iron core minimises hysteresis loss; step-up vs step-down | atomic | ✅ | — | [mutual_inductance(T35), hysteresis_loop_atomic(T37), soft_vs_hard_magnetic_materials_nano(T37), faradays_law(T35)] | [transformer_losses_nano, ac_traction_application_nano] | AC-G7; **closes T37 hysteresis forward-edge** + extends T35 transformer atomic |
| ↳ transformer_losses_nano | 4 loss mechanisms: copper (I²R), hysteresis (T37 area-of-B-H-loop), eddy currents (T35 → laminated core), flux leakage. Efficiency η typically 96-99% | nano | ✅ | — | [transformer_in_ac_atomic, hysteresis_loop_atomic(T37), eddy_currents_atomic(T35)] | — | parent: transformer_in_ac_atomic; **closes T37 + T35 simultaneously** |
| ↳ step_up_vs_step_down_nano | N_s > N_p → step-up (high-voltage transmission); N_s < N_p → step-down (consumer end). India: 11 kV / 33 kV / 132 kV / 220 kV / 400 kV / 765 kV grid | nano | ✅ | — | [transformer_in_ac_atomic] | — | parent: transformer_in_ac_atomic; PowerGrid Corp anchor |
| ↳ ac_traction_application_nano | Indian Railways: 25 kV / 50 Hz overhead → on-board step-down + rectifier + traction motor. ~70% of route-km electrified | nano | ✅ | — | [transformer_in_ac_atomic, step_up_vs_step_down_nano] | — | parent: transformer_in_ac_atomic; Indian Railways anchor (VERY-STRONG strand) |
| **wattless_current_atomic** | Purely inductive or purely capacitive circuit → cos φ = 0 → P_avg = 0 although I_rms ≠ 0 | atomic | ✅ | — | [power_in_ac_circuit_atomic, ac_inductor_circuit, ac_capacitor_circuit] | [choke_coil_atomic] | AC-G8; conceptual atomic — "current that does no work" |
| **choke_coil_atomic** | Inductor used to limit AC current without dissipating power; replaces resistor in fluorescent tube ballast | atomic | ✅ | — | [ac_inductor_circuit, wattless_current_atomic, ferromagnetism_atomic(T37)] | — | AC-G8; engineering atomic — practical wattless device. **Bridge edge to T37 ferromagnetic core selection** |
| ↳ choke_in_fluorescent_lamp_nano | Fluorescent tube ballast = choke coil in series with tube; limits current after ionisation | nano | — | — | [choke_coil_atomic] | — | parent: choke_coil_atomic; everyday-Indian anchor |

**Atomic count:** 12. **Nano count:** ~16. **Total entries:** 28.

---

## Section C — Cross-Source Coverage Matrix

| Atomic | NCERT 12.1 Ch.7 | HCV2 Ch.43 | DCP §30.X | Coverage |
|---|---|---|---|---|
| ac_voltage_source_atomic | §7.2 + §7.2.1 | §43.2 + §43.3 | §30.2 + §30.3 | TRIPLE |
| phasor_representation_atomic | §7.4 | §43.5 | §30.5 | TRIPLE |
| ac_resistor_circuit | §7.3 | §43.4 | §30.4 | TRIPLE |
| ac_inductor_circuit | §7.5 | §43.6 | §30.6 | TRIPLE |
| ac_capacitor_circuit | §7.6 | §43.7 | §30.7 | TRIPLE |
| lcr_series_circuit_atomic | §7.7 | §43.8 | §30.8 | TRIPLE |
| resonance_in_lcr_atomic | §7.7.1 + §7.7.2 | §43.9 + §43.10 | §30.9 + §30.10 | TRIPLE |
| power_in_ac_circuit_atomic | §7.8 | §43.11 | §30.11 | TRIPLE |
| lc_oscillations_atomic | §7.9 | §43.12 | §30.12 | TRIPLE |
| transformer_in_ac_atomic | §7.10 | §43.13 | §30.13 | TRIPLE |
| wattless_current_atomic | §7.8 (boxed) | §43.14 | §30.14 | TRIPLE |
| choke_coil_atomic | §7.8 (boxed) | §43.14 | §30.14 | TRIPLE |

**Triple-coverage rate:** 12 of 12 atomics (100%). **Fifth 100%-coverage topic** in 25 pilots (after T48, T35, T38, T37). AC Circuits joins the curricularly universal cluster — and notably is the **first 100%-coverage topic in the same session as another 100%-coverage topic (T37)**.

---

## Section D — Stage-3 Math-Tool Dependencies

| Math-tool primitive | Used by | Status |
|---|---|---|
| `time_averaging_cos_squared` | rms_vs_peak_vs_average_nano (rms derivation) | REQUIRED (3rd cross-cluster use — after T44 Malus + T38 EM-wave intensity) |
| `trig_phase_angle` | phasor_representation_atomic, lcr_series_circuit_atomic | REQUIRED |
| `vector_rotation` (rotating phasor visualisation) | phasor_representation_atomic | REQUIRED |
| `phasor_complex_representation` (Z = R + jX) | phasor_representation_atomic, lcr_series_circuit_atomic, ac_inductor_circuit, ac_capacitor_circuit | **NEW STUB** (AC-G11) — first cross-domain use will trigger promotion to REQUIRED at next paired-batch citing it. **Math-tools file update needed.** |
| `calculus_2nd_order_ode_for_shm` (d²q/dt² = −q/LC) | lc_oscillations_atomic | REQUIRED (T17 already validated this) |
| `algebra_quadratic` | resonance bandwidth (half-power frequency roots) | REQUIRED (T49 validated; 2nd cross-cluster use) |
| `algebra_1_over_x` | X_C = 1/(ωC) | REQUIRED (T42 lens formula already validated) |

**ONE new stub registered: `phasor_complex_representation`.** First new stub since Session 45 (`pythagoras_curved_earth`). Math-tools IN-degree update: 38 → 39 (stub) → 41 (with `algebra_quadratic` + `time_averaging_cos_squared` re-uses confirmed).

---

## Section E — Cross-Topic Dependencies (Bidirectional Edges)

### Outgoing (T39 requires from earlier topics)

| Target topic | Edge | Reason |
|---|---|---|
| T35 EM Induction | ac_inductor_circuit ← self_inductance | X_L = ωL needs L definition |
| T35 EM Induction | lc_oscillations_atomic ← energy_stored_in_inductor + faradays_law | **Closes EI-G6 deferral** — LC oscillation lives in T39 with full back-reference to T35 inductor energy |
| T35 EM Induction | transformer_in_ac_atomic ← mutual_inductance + faradays_law | Full extension of T35 transformer primitive atomic |
| T35 EM Induction | transformer_losses_nano ← eddy_currents_atomic | Laminated-core eddy-loss reduction |
| **T37 Magnetism & Matter** | transformer_in_ac_atomic ← hysteresis_loop_atomic + soft_vs_hard_magnetic_materials_nano | **Closes T37 forward-edge from same Session 48 batch** — soft-iron core selection |
| **T37 Magnetism & Matter** | choke_coil_atomic ← ferromagnetism_atomic | High-permeability core for inductor design |
| T34 Current Electricity | ac_resistor_circuit ← ohms_law | I = V/R extends to AC instantaneous values |
| T34 Current Electricity | lcr_series_circuit_atomic ← kirchhoffs_voltage_law | Sum of phasor voltages = source voltage |
| T34 Current Electricity | power_in_ac_circuit_atomic ← power_dissipation_p_eq_vi | DC P=VI extends to AC P_avg = V_rms·I_rms·cos φ |
| T31 Capacitors | ac_capacitor_circuit ← capacitor_basics | X_C = 1/(ωC) needs C definition |
| T31 Capacitors | lc_oscillations_atomic ← capacitor_energy | ½CV² half of oscillation energy budget |
| **T17 SHM** | lc_oscillations_atomic ← shm_x_eq_a_sin_omega_t + shm_a_eq_minus_omega_squared_x(T17 A4) | **Most-cited cross-cluster analogy in physics** — q ↔ x, 1/LC ↔ k/m |
| T17 SHM | ac_voltage_source_atomic ← shm sinusoidal time-dependence | v(t) = V₀ sin ωt is mathematically SHM |
| T38 EM Waves | radio_tuning_application_nano ← hertz_experiment_atomic | LC tuning matches transmitter frequency |
| Math-tools | time_averaging_cos_squared + phasor_complex_representation NEW + algebra_quadratic + vector_rotation + 2nd-order-ODE-SHM | 5 primitives (1 new stub) |

### Incoming (T39 will be required by later topics)

| Source topic | Edge | Reason |
|---|---|---|
| T50 Communication Systems (back-edge) | modulator + carrier-wave generation ← lc_oscillations_atomic + resonance_in_lcr_atomic | LC tank circuit generates carrier; demodulator filter uses LCR resonance. **Closes anticipated T39 ↔ T50 link from Session 45.** |
| T49 Semiconductor (forward) | rectifier_circuit_in_smps ← transformer_in_ac_atomic | SMPS power supplies use AC transformer + rectifier |
| T34 Current Electricity (back-edge) | power factor correction ↔ industrial transmission losses | Closes loop: T34's power-dissipation depends on power-factor (T39) |
| T17 SHM (back-edge, bridge) | lc oscillation ↔ angular SHM analog | Bidirectional with T17 |

**Outgoing edges: 14 cross-topic + 1 new math-tools stub.** **Incoming edges: 4 (3 confirmed back-edges + 1 anticipated from future T-power-electronics).**

### T37 ↔ T39 intra-session bidirectional edges

This paired-batch surfaces **8 bidirectional edges** between T37 and T39 (same NCERT chapter-pair: Ch.5 + Ch.7 with Ch.6 between them; HCV consecutive Ch.42 + Ch.43; DCP same chapter Ch.28 + Ch.30):

| T37 atomic | ↔ | T39 atomic | Edge type |
|---|---|---|---|
| `hysteresis_loop_atomic` | → | `transformer_in_ac_atomic` (core loss) | T39 requires T37 (forward closed) |
| `soft_vs_hard_magnetic_materials_nano` | → | `transformer_in_ac_atomic` (soft iron) | T39 requires T37 |
| `ferromagnetism_atomic` | → | `choke_coil_atomic` | T39 requires T37 |
| `domain_structure_nano` | → | `transformer_losses_nano` (hysteresis-loss mechanism) | T39 requires T37 |
| `magnetic_intensity_H_and_M` | ← | `transformer_in_ac_atomic` (transformer drives core through H-cycle) | Mutual reinforcement |
| `electromagnet_vs_permanent_magnet_nano` | ↔ | `transformer_in_ac_atomic` (electromagnet = transformer primary) | Bidirectional bridge |
| `bar_magnet_as_solenoid_equivalence` | ↔ | `ac_inductor_circuit` (inductor = solenoid; bar magnet = solenoid; conceptual unification) | Bidirectional |
| `hysteresis_loop_atomic` | ↔ | `lc_oscillations_atomic` (loop-area = energy dissipation per cycle; LC-tank loss in real circuits) | Bidirectional |

**8 bidirectional edges = same-chapter-pair density (matches T49↔T50 = 8, T45↔T47 = 9, T41↔T42 = 7, T43↔T44 = 7).** Confirms the paired-batch density rule: T37/T39 are NOT same NCERT chapter (Ch.5 vs Ch.7) but ARE same DCP chapter (Ch.28 has magnetism + Ch.30 has AC) and same HCV cluster (Ch.42 + Ch.43 consecutive). **The "same-cluster chapter-adjacent" predictor produces 7-9-edge density — same as same-chapter intra-cluster.**

---

## Section F — Real-World Anchors (VERY-STRONG, Indian-context)

| Anchor | Concept hook | Authoring use | Strand |
|---|---|---|---|
| **BHEL transformer manufacturing (Bhopal, Hyderabad, Jhansi)** | transformer_in_ac_atomic, step_up_vs_step_down_nano | "BHEL is India's largest transformer manufacturer; 400/765 kV class units for PowerGrid" | Industry |
| **PowerGrid Corporation of India** | step_up_vs_step_down_nano, transformer_in_ac_atomic | "PGCIL operates 765 kV / ±800 kV HVDC backbone; every voltage step uses transformers" | Industry + Policy |
| **NTPC + Adani Power + Tata Power generation** | ac_voltage_source_atomic, frequency_50hz_indian_grid_nano | "NTPC alone generates ~25% of India's power; all synchronous to 50 Hz grid" | Industry |
| **Indian Railways 25 kV / 50 Hz AC traction** | ac_traction_application_nano, transformer_in_ac_atomic | "Vande Bharat + WAP-7 + WAG-12B all use 25 kV overhead → on-board transformer → traction motor" | Transport |
| **Adani Transmission + Tata Power Delhi Distribution** | step_up_vs_step_down_nano, power_factor_correction_nano | "Distribution-end step-down 11 kV → 415 V (3-phase) → 230 V single-phase" | Industry |
| **Central Electricity Authority (CEA) tariff orders + power factor penalties** | power_factor_correction_nano | "Industrial consumers below 0.85 lagging cos φ pay tariff penalty under CEA / state-DISCOM regs" | Policy |
| **BIS IS 12360 voltage + frequency standards** | ac_voltage_source_atomic, frequency_50hz_indian_grid_nano | "India: 230 V single-phase + 415 V three-phase + 50 Hz ± 0.5 Hz" | Policy |
| **Crompton Greaves Consumer Electricals** | transformer_in_ac_atomic, ac_inductor_circuit | "Crompton fans + UPS use AC motor design — common-mode choke coils inside" | Industry |
| **Bajaj Electricals + Luminous UPS + Microtek + Su-Kam** | choke_coil_atomic, transformer_in_ac_atomic | "Indian UPS market = ₹15,000+ Cr; every UPS = transformer + rectifier + inverter" | Consumer |
| **Indian residential induction cooktops (~150M households)** | ac_inductor_circuit, resonance_in_lcr_atomic | "Induction cooktop uses LCR resonance ~25 kHz; eddy currents heat pan directly" | Residential |
| **ISRO satellite power conditioning units (PCUs)** | transformer_in_ac_atomic, resonance_in_lcr_atomic | "ISRO PSLV + GSLV avionics use switched-mode AC-DC conversion; INSAT solar arrays" | Space + Research |
| **AIIMS + Tata Memorial UPS-on-life-support + MRI power conditioning** | wattless_current_atomic, power_in_ac_circuit_atomic | "Healthcare-grade UPS systems demand cos φ > 0.95; MRI quench supplies are AC-driven" | Healthcare |
| **DRDO power electronics (defence inverters + radar power)** | resonance_in_lcr_atomic, lc_oscillations_atomic | "DRDO Akash/Astra radar systems use high-Q LC tank circuits; defence-grade inverters" | Defence |
| **BSNL telephone exchange 48 V DC battery banks + AC mains** | transformer_in_ac_atomic, ac_voltage_source_atomic | "BSNL exchanges run AC-mains-fed rectifier + 48 V DC battery floats — AC ⟷ DC interconversion" | Telecom |
| **Fluorescent tube ballasts (Indian street lights + offices)** | choke_in_fluorescent_lamp_nano, choke_coil_atomic | "Older fluorescent installations use copper-iron choke ballast (now mostly replaced by electronic ballasts)" | Residential + Industry |

**Total: 14-15 distinct institutional/system anchors spanning 9 strands** (industry, policy, transport, healthcare, space, residential, consumer, defence, telecom). **Easily clears the 13-anchor VERY-STRONG threshold.** **AC Circuits is the most-industrially-anchored topic in Class-12 physics** — virtually every electrical artifact in Indian life downstream of this chapter.

**Decision (AC-G9):** **VERY-STRONG.** Joins T48 Nuclei (13), T49 Semiconductor (14), T50 Communication Systems (15) in the VERY-STRONG bucket. **4th VERY-STRONG topic in Stage-2.**

---

## Section G — Cognitive-Error-Prevention Decisions

Continuing the ~30-35% pattern. T39 cognitive-error-prevention decisions:

- **AC-G1** (split 4 reactive-circuit configurations into 4 atomics) — prevents the "one universal AC formula" misconception.
- **AC-G6** (`power_in_ac_circuit_atomic` with `real_vs_apparent_vs_reactive_table_nano`) — direct countermeasure to NCERT-Ch.7-most-confused-topic.
- **AC-G10** (`phase_relationship_intuition_nano` reasons through V-leads-I and I-leads-V instead of letting students memorise) — direct cognitive countermeasure.
- **AC-G8** (split wattless current vs choke coil — conceptual vs engineering) — prevents collapsing the two into one.

**4 of 11 founder decisions are cognitive-error-prevention type = 36%.** Slightly above the 30-35% mean. Together with T37 (4/10 = 40%), Session 48 has **8 cognitive-error-prevention decisions out of 21 = 38%** — confirms the pattern continues. **Stage-4 formalization of the cognitive-error-prevention sub-category is increasingly justified.**

---

## Section H — V1 Priority Flags

| Atomic | V1? | Reason |
|---|---|---|
| ac_voltage_source_atomic | ✅ | Foundational; every downstream atomic builds on it |
| lcr_series_circuit_atomic | ✅ | The Class-12 board / JEE / NEET headline result; impedance + phasor combination |
| resonance_in_lcr_atomic | ✅ | Diamond candidate — resonance curve + Q-sharpness sim; radio-tuning anchor |
| transformer_in_ac_atomic | ✅ | VERY-STRONG anchor density (BHEL, PowerGrid, Indian Railways); cognitive-error-prevention for losses; closes T37 + T35 simultaneously |
| lc_oscillations_atomic | ✅ | Most-cited cross-cluster analogy in physics (LC ↔ SHM); closes EI-G6 |
| power_in_ac_circuit_atomic | ⚖️ | Cognitive-error-prevention atomic + CEA-policy anchor; V1.1 |
| phasor_representation_atomic | ⚖️ | Cognitive tool, NOT a phenomenon — V1.1 (but high authoring priority for sims) |
| ac_inductor_circuit + ac_capacitor_circuit | ⚖️ | Both ship together with LCR; V1.1 |
| ac_resistor_circuit | ⚖️ | Trivial AC extension of DC Ohm's law; V1.2 |
| wattless_current_atomic + choke_coil_atomic | ⚖️ | Wattless atomic V1.1; choke coil V1.2 |

**V1 ship count for T39: 5 atomics** (above 24-pilot mean of 4 — reflects AC chapter's central applied-physics role + Diamond candidate density).

---

## Section I — Open Questions

1. **3-phase AC** — NCERT does not cover 3-phase. Indian grid is 3-phase. Defer to V2 / state-board extension atomic.
2. **Polyphase transformer + delta-star configurations** — defer to V2 / engineering extension.
3. **Power electronics (SCR, IGBT, MOSFET) + SMPS** — defer to T-power-electronics (post-Stage-2 topic; cross-link with T49 Semiconductor).
4. **Resonance in parallel LCR** — NCERT only covers series. HCV Ch.43 covers both. Author parallel-LCR as V1.1 extension nano under `resonance_in_lcr_atomic`.
5. **Skin effect at high frequency** — defer to V2.
6. **HVDC transmission** (PowerGrid ±800 kV backbone) — interesting Indian-context anchor that doesn't fit Class-12 AC but worth capturing in V2 / general-knowledge atomic.
7. **VERY-STRONG anchor confirmation:** T39 is the first non-Modern-Physics VERY-STRONG topic. Suggests applied-engineering topics broadly cluster in VERY-STRONG. **Hypothesis for Stage-4:** every applied-engineering chapter in NCERT Class-12 will hit VERY-STRONG when anchored against Indian industry. Recommend testing against T-power-electronics + T-modern-materials when those reach Stage-2.

---

## Section J — Sign-Off

- Authored: Session 48, 2026-05-25.
- Author: Claude (Architect+Engineer role).
- Coverage class: **TRIPLE**.
- Anchor density: **VERY-STRONG** (14-15 anchors across 9 strands).
- Triple-coverage rate: **100%** (12/12) — **fifth observed 100% topic** in 25 pilots.
- Atomic count: **12**. Nano count: **16**. Total: **28 entries**.
- V1 ship count: **5 atomics**.
- **Closes 3 deferred dependencies + opens 1 forward-edge:** EI-G6 (T35 LC oscillation) + T37 hysteresis-to-transformer + T35 transformer extension + opens forward to T50 (modulator-LC-tank + demodulator-LCR-filter).
- **E&M cluster CLOSED.** T29 + T30 + T31 + T34 + T35 + T36 + T37 + T38 + T39 = **9 of ~10 E&M topics catalogued** (last remaining: T32/T33 numbering reconciliation pending at Stage-4).
- **1 new math-tools stub registered:** `phasor_complex_representation` (AC-G11).
- Next pilot batch: pending founder greenlight — see Discussions Session 48 entry for recommended Session 49 paths.

---

*Fifth 100% triple-coverage topic. Pattern signal sharpening: applied-physics chapters that survived NCERT 2023 revision uniformly hit 100% coverage. Both T37 AND T39 in same session hit 100% — first paired-batch with both partners at 100%.*
