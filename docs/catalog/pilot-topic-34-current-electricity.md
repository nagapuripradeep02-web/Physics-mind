# Stage-2 Pilot Catalog — T34 Current Electricity

**Date authored:** 2026-05-25 (Session 39, paired-batch with T29)
**Sources:**
- NCERT Class 12 Part 1, **Ch.3 Current Electricity**, §3.4–3.13 (verified directly: drift derivation through Kirchhoff's rules; cells in series/parallel; charges-in-clouds inset)
- HC Verma Vol 2, **Ch.32 Electric Current in Conductors**, §32.1–32.13 (full chapter verified: current/density, drift, Ohm's law, resistance, temperature, EMF, energy, Kirchhoff, R-combinations, battery grouping, Wheatstone, instruments, potentiometer, RC, atmospheric)
- DC Pandey E&M, **Ch.23 Current Electricity**, §23.1–23.12+ (verified: current/density, drift+relaxation, Ohm's law, resistance, temperature, EMF/Kirchhoff, R-combinations, internal-r, grouping of cells, Wheatstone, ammeter/voltmeter/potentiometer, heating, mixed grouping with max-power-transfer)

---

## Founder Decisions Applied (CE-G1 … CE-G6, inline)

| # | Decision | Rationale |
|---|---|---|
| CE-G1 | **`drift_velocity` and `current_density_j` are SEPARATE atomics** (not nano + parent). Despite j = nev_d making them algebraically linked, the visual scenes are different: drift = electron zigzag inside lattice (microscopic), j = vector field arrow per cross-section (macroscopic). Different EPIC-L states justify atomic split. | Visual-scene rule per §H. Mid-pilot precedent: T17 split (angular_velocity vs angular_displacement) on identical grounds |
| CE-G2 | **Ohm's law has TWO atomics** (`ohms_law_macroscopic` V=IR and `ohms_law_microscopic` j=σE). NCERT explicitly derives the microscopic form from drift; DCP teaches V=IR as observation and j=σE as derivation. The split lets EPIC-L STATE_1 of `ohms_law_macroscopic` be the wrong belief "V=IR is a law" — NCERT §3.7 explicitly says "V=IR is NOT Ohm's law; it's a relation. Ohm's law is the linearity claim." Visual: graph V vs I — straight line through origin defines ohmic. | Founder-rule per CLAUDE.md §5: EPIC-C STATE_1 must show explicit wrong belief. NCERT itself surfaces this misconception |
| CE-G3 | **`limitations_of_ohms_law` is a SEPARATE atomic** (not a nano of `ohms_law_macroscopic`). Three deviation classes: (a) V not ∝ I (Fig.3.5), (b) direction-sensitive — diode (Fig.3.6), (c) multi-valued — GaAs negative-resistance region (Fig.3.7). Each is an EPIC-L state of its own. Pedagogically critical because JEE Advanced loves to ask about these regions. | High PYQ-frequency anticipated at Stage-5; depth justifies atomic |
| CE-G4 | **`internal_resistance_emf` is its own atomic, NOT merged with `cells_in_series_parallel`.** Internal resistance is the conceptual core (real battery ≠ ideal); grouping is the application. The split surfaces the conceptual-vs-mechanical separation that students often blur. | Pedagogy-first split. NCERT §3.11 (cells/emf/internal-r) is conceptual; §3.12 (cells in series and parallel) is computational |
| CE-G5 | **`grouping_of_cells_series` and `grouping_of_cells_parallel` and `grouping_of_cells_mixed_max_power_transfer` are THREE atomics.** DCP §23.11 (Mixed Grouping + Max Power Transfer Theorem) is the JEE-Advanced topper, separately important from simple series and parallel. Three atomics, three distinct insights. | Cross-source weight (DCP gives mixed grouping a full sub-section); EPIC-C variety: each has a different "wrong-rule" misconception (series: forgetting polarity reversal; parallel: forgetting r/n; mixed: forgetting R = nr/m optimality condition) |
| CE-G6 | **Anchor strength: MEDIUM**. Less anchor-rich than T29 (no electroscope-equivalent classroom artifact for current) but stronger than T31 (capacitors). Indian-context anchors available: domestic electrical wiring (covered in T29 already), nichrome heater coil → toaster/electric iron (NCERT Example 3.3 + DCP §23.6 Example 23.15), light bulb V-I curve (HCV §32.3), Wheatstone bridge in lab practical (CBSE board practical), thundercloud-to-earth current 1800 A (NCERT §3.13 inset "Charges in Clouds" + HCV §32.14 "Atmospheric Electricity"). Author at 1.2× baseline. | Mid-density; document anchor sources upfront so authoring doesn't stall |

---

## Section A — Top-of-Catalog Summary

```
Topic ID            : T34 Current Electricity
Atomic count        : 28 (target range 24–32; landed at 28, matches 10-pilot mean ~27)
Nano count          : ~36 (mean 1.29 nanos/atomic — slightly below average because instrument atomics are mostly atomic-level)
Stage-2 OUT-edges   : 9 (→ T29 ×2, T30 ×2, T31 ×3 [RC bridge!], T35 ×1, T36 ×1)
Math-tools edges    : 2 (linear simultaneous equations for Kirchhoff; exponential decay for RC)
Anchor density      : MEDIUM (per CE-G6)
Author-time         : 1.2× baseline
Founder decisions   : CE-G1 ... CE-G6 (6 decisions)
Cluster role        : Major sink/hub of the E&M cluster; closes T31's bidirectional RC bridge
```

---

## Section B — Cross-Source Coverage Table

| Coverage area | NCERT 12.1 Ch.3 | HCV2 Ch.32 | DCEM Ch.23 | Notes |
|---|---|---|---|---|
| Current definition (dQ/dt; scalar vs vector clarification) | §3.1 (boundary) | §32.1 | §23.1 + §23.2 | DCP best on "current is scalar but j is vector" explicit derivation |
| Drift velocity + relaxation time | §3.5 (full derivation) | §32.2 (clean) | §23.3 + §23.4 | NCERT derivation is the canonical Class-12 board treatment; DCP has the cleanest physical-intuition write-up |
| Current density j (and j = σE) | §3.4 (boundary) | §32.1 (Eq.32.3) | §23.4 | All three derive from i = neAv_d |
| Ohm's law (macroscopic V=IR + microscopic j=σE) | §3.4 (microscopic) | §32.3 + Eq.32.6 | §23.7 + Eq.23.6 | DCP best on "V=IR is NOT Ohm's law" pedagogy. NCERT derives j=σE rigorously |
| Resistivity ρ; conductivity σ | §3.5 (Eq.3.23 ρ = m/(ne²τ)) | §32.3 (Eq.32.7) | §23.5 | All same; HCV gives the cleanest dimensional analysis |
| Limitations of Ohm's law | §3.6 (Figs 3.5–3.7 diode, GaAs) | (briefly in §32.3) | §23.7 (Fig.23.11 non-ohmic) | NCERT strongest — three distinct deviation classes explicitly |
| Resistor color code | §3.7 (Fig.3.8 + Table 3.2) | §32.3 (Table 32.1) | absent | NCERT and HCV both teach; DCP skips (problem-focused book) |
| Temperature coefficient of resistivity α | §3.8 (Fig.3.9–3.11 + Eq.3.26) | §32.4 (Eq. with α) | §23.6 (Eq.23.26) | All three identical; NCERT Example 3.3 (nichrome toaster) is the Indian-context anchor |
| Superconductors | §3.8 (passing mention) | §32.4 (Hg at 4.2 K, 1911 Onnes) | absent at Class 12 level | HCV strongest; cross-ref forward to T48 Modern Physics |
| Electrical energy + power (P = VI = I²R = V²/R) | §3.9 (Eq.3.32–3.33) | §32.6 (Eq.32.11–32.12) | §23.10 (Heating Effects of Current) | All identical; DCP best on "battery supplies vs consumes power" sign-convention table |
| Power transmission (P_c = P²R_c/V²) | §3.9 (Eq.3.35 — long-distance transmission) | absent | absent | NCERT-unique; Indian-context: high-tension lines, why 220V household vs 11kV transmission |
| EMF + internal resistance (V = ε − Ir) | §3.11 (full derivation) | §32.5 + §32.6 | §23.8 (battery as pump analogy) | DCP "overhead-tank pump" analogy is the canonical pedagogy; NCERT mathematical |
| Series combination of resistors | §3.10 (Eq.3.39) | §32.8 (Eq.32.13) | §23.9 (Eq.23.13 implicit) | All same |
| Parallel combination of resistors | §3.10 (Eq.3.45–3.51) | §32.8 (Eq.32.14) | §23.9 | All same |
| Kirchhoff's junction rule (KCL) | §3.13 (boundary) | §32.7 (Junction Rule) | §23.9 (Junction Rule, Eq.23.) | All same; NCERT cleanest pedagogically. Cross-ref to T29 A9 (superposition principle = same idea) |
| Kirchhoff's loop rule (KVL) | §3.13 | §32.7 (Loop Rule) | §23.9 (Loop Rule with H/L mnemonic) | DCP "H for high, L for low" mnemonic is the cleanest sign-tracking trick |
| Cells in series + reversed-polarity case | (forward §3.12) | §32.9 (Eq.32 series) | §23.11 Case 1 (Series Grouping) | All three carry the "reversed polarity ⇒ ε_eq = ε₁ − ε₂" insight |
| Cells in parallel | (forward §3.12) | §32.9 (Eq.32 parallel) | §23.11 Case 1/2 | DCP §23.11 has the cleanest three-case breakdown |
| Mixed grouping + max power transfer | absent in NCERT body | absent at Class 12 level | §23.11 Mixed Grouping + Maximum Power Transfer Theorem | DCP-unique; JEE Advanced standard. Atomic per CE-G5 |
| Wheatstone bridge | §3.13 (forward; covered formally in §3.14–3.15) | §32.10 (Eq.32.15 balance condition) | §23.12 (forward to potentiometer) | HCV Eq.32.15 (R₁/R₂ = R₃/R₄) is the canonical balance condition |
| Galvanometer → Ammeter (shunt method) | §3.16 (forward — verified shipped concepts) | §32.11 | §23.12 | All three identical; DCP example 23.25 (shunt for 0–50 mA range) is the canonical worked problem |
| Galvanometer → Voltmeter (series resistance) | §3.16 (forward) | §32.11 | §23.12 | All same; DCP example 23.26 canonical |
| Potentiometer principle | §3.16 (forward) | §32.12 + §32.13 (stretched-wire potentiometer + comparison of EMFs + internal resistance measurement) | §23.12 (Principle of Potentiometer; emf comparison; internal-r measurement) | HCV and DCP both extensive; NCERT lighter. Three distinct applications: principle, emf-comparison, internal-r-measurement |
| RC circuit (charging + discharging) | absent in NCERT Ch.3 body (covered Class 12 Ch.7) | §32.13 (Eq.32.16–32.17: q = εC(1−e^(−t/CR)) charging; q = Q e^(−t/CR) discharging) | absent at Ch.23 (covered in later AC chapter) | HCV strongest — clean derivation; **the bidirectional bridge to T31 Capacitors lives here** |
| Atmospheric electricity (cosmic ionization → 1800 A earth current) | §3.13 inset "Charges in Clouds" | §32.14 "Atmospheric Electricity" | absent | NCERT and HCV both anchor with thundercloud → lightning current. **Indian-context anchor candidate** |

---

## Section C — Atomic + Nano Catalog (28 atomics)

| ID | Concept | Type | Sim? | In repo? | Requires | Required-by | Notes |
|---|---|---|---|---|---|---|---|
| **A1** | `electric_current_definition` | atomic | ✅ | — | [T29:electric_charge_basics] | A2, A3, A11 | i = dQ/dt. Sign convention: direction of positive-charge motion. Edge case: in electrolyte both ± ions contribute and currents ADD (HCV §32.1 + DCP Ex 23.1) |
| ↳ N1.1 | current_is_scalar_not_vector | nano | ✅ | — | — | A1 | NCERT subtle but critical: i is scalar, j is vector. Common misconception |
| **A2** | `drift_velocity` | atomic | ✅ | — | A1, [T29:conductor_vs_insulator], [T29:electric_field_definition] | A3, A4 | v_d = eEτ/m (NCERT) or v_d = eEτ/(2m) (some older Indian texts — DCP §23.4 explicitly addresses this discrepancy and sides with eEτ/m). Magnitude: ~10⁻⁴ m/s in copper at 1 A through 1 mm² |
| ↳ N2.1 | random_thermal_motion_vs_drift | nano | ✅ | — | — | A2 | Thermal speed ~10⁵ m/s vs drift ~10⁻⁴ m/s → ratio 10⁹. The "tiny drift superposed on huge random" insight |
| ↳ N2.2 | relaxation_time_tau | nano | ✅ | — | — | A2 | τ ~ 10⁻¹⁴ s in copper. Average time between collisions. Decreases with temperature (DCP §23.6) |
| **A3** | `current_density_j` | atomic | ✅ | — | A1, A2 | A4, A5 | j = i/A = nev_d. Vector along E. **Per CE-G1: separate from drift** because scene differs (j is field-line-like; v_d is electron-track) |
| ↳ N3.1 | current_conserved_along_nonuniform_wire | nano | ✅ | — | — | A3 | i = const, but j and v_d both ∝ 1/A. Tapered-wire example |
| **A4** | `ohms_law_microscopic` | atomic | ✅ | — | A2, A3 | A5, A6 | j⃗ = σE⃗. Derived from drift: σ = ne²τ/m. The microscopic Ohm's law |
| **A5** | `ohms_law_macroscopic` | atomic | ✅ | — | A4, [T29:electric_field_definition] | A6, A7, A8, A12, A20 | V = IR derived from j=σE via R = ρL/A. **EPIC-C STATE_1 wrong belief (per CE-G2): "V=IR IS Ohm's law" — NO, it's a relation that always holds for V, I, R defined; Ohm's law is the linearity claim that R doesn't depend on V** |
| **A6** | `resistance_R_equals_rho_L_over_A` | atomic | ✅ | — | A5 | A7, A12, A13, A20 | R = ρL/A. Geometry × material. EPIC-C STATE_1 wrong belief: "thinner wire ⇒ lower R" (NO; thinner → smaller A → higher R) |
| ↳ N6.1 | resistor_color_code | nano | ✅ | — | — | A6 | 4-band code (digit, digit, multiplier, tolerance). NCERT Table 3.2 |
| ↳ N6.2 | wire_stretched_4x_R_quadruples | nano | ✅ | — | — | A6 | If length doubles (V=const), R = ρL²/V scales as L². Classic JEE problem (DCP Ex 23.10–23.12) |
| **A7** | `resistivity_rho_intrinsic` | atomic | ✅ | — | A6 | A8, A9 | ρ = m/(ne²τ). Material property only, independent of geometry. Table 3.1 NCERT shows 5 orders of magnitude span from Ag (1.6e-8) to fused quartz (10¹⁶) |
| **A8** | `temperature_dependence_resistivity` | atomic | ✅ | — | A7 | A9, [T44:thermistor_application] | ρ(T) = ρ₀[1 + α(T-T₀)]. Conductors: α > 0 (T↑ ⇒ ρ↑ via more collisions). Semiconductors: α < 0 (T↑ ⇒ more carriers). EPIC-C STATE_1 wrong belief: "all materials have positive α" — semiconductors and graphite are negative |
| ↳ N8.1 | nichrome_low_alpha_for_heaters | nano | ✅ | — | — | A8 | α_nichrome ≈ 0.0004 (10× smaller than copper). Why heating elements use nichrome: resistance stays stable. Indian anchor: electric iron, immersion rod, geyser coil |
| ↳ N8.2 | superconductor_zero_resistance | nano | ✅ | — | — | A8 | Hg at 4.2 K (Onnes 1911). Forward-ref to T48. Indian-anchor candidate: BARC + IUAC superconductor research (anchor mine in Stage-5) |
| **A9** | `limitations_of_ohms_law` | atomic | ✅ | — | A5 | (terminus — leaves to non-ohmic device atomics) | Per CE-G3: three deviation classes. (a) Non-linear V-I (Fig.3.5), (b) sign-dependent — diode (Fig.3.6, asymmetric V-I), (c) multivalued — GaAs negative-resistance (Fig.3.7). Critical for understanding diodes (T44) and transistors (T45) |
| **A10** | `electrical_power_in_resistor` | atomic | ✅ | — | A5, A6 | A11, A21 | P = VI = I²R = V²/R. Joule heating. EPIC-C STATE_1 wrong belief: "high resistance always means high power dissipation" — NO, depends on whether V or I is fixed |
| ↳ N10.1 | toaster_geyser_electric_iron_indian_examples | nano | ✅ | — | — | A10 | Joule heating applications: 1500W geyser, 750W toaster, 1000W iron. Indian household electrical-appliance anchor |
| **A11** | `power_transmission_high_voltage` | atomic | ✅ | — | A10 | (terminus) | NCERT-unique. P_c = P²R_c/V². Why long-distance transmission uses 11 kV / 220 kV: P_c inversely proportional to V². **Strong Indian-context anchor: high-tension towers along NH, step-down transformers at colonies** |
| **A12** | `emf_definition_battery_pump_analogy` | atomic | ✅ | — | A5, [T29:electric_charge_basics] | A13, A14, A18, A22 | ε = W_b/q. DCP overhead-tank analogy. EPIC-C STATE_1 wrong belief: "emf is a force" — NO, it's work-per-charge (the name is misleading per HCV §32.5) |
| **A13** | `internal_resistance_terminal_voltage` | atomic | ✅ | — | A6, A12 | A14, A15, A16 | Per CE-G4: standalone atomic. V = ε − Ir (discharging) or V = ε + Ir (charging). Short-circuit: V = 0, i_max = ε/r |
| ↳ N13.1 | open_circuit_terminal_voltage_equals_emf | nano | ✅ | — | — | A13 | When I=0, V=ε. Why ideal voltmeters have R→∞ |
| **A14** | `resistors_in_series` | atomic | ✅ | — | A5, A6 | A16, A21, [T31:capacitor_combinations_inverse_analogy] | R_eq = R₁ + R₂ + ... Same current through all. **Inverse-analogy bridge to T31: capacitors in PARALLEL add the same way (per T31 catalog)** |
| **A15** | `resistors_in_parallel` | atomic | ✅ | — | A5, A6 | A16, A21, [T31:capacitor_combinations_inverse_analogy] | 1/R_eq = 1/R₁ + 1/R₂ + ... Same voltage across all. **Inverse-analogy bridge to T31: capacitors in SERIES combine as 1/C_eq = sum** |
| **A16** | `kirchhoff_junction_rule_KCL` | atomic | ✅ | — | A1, [T29:superposition_principle_for_charges] | A17, A19 | Σi_in = Σi_out. Charge conservation at node. **Direct conceptual bridge to T29 A9 superposition** |
| **A17** | `kirchhoff_loop_rule_KVL` | atomic | ✅ | — | A12, A13, [T29:electric_field_definition] | A19, A20 | Σ V_drops in a closed loop = 0. Energy conservation. DCP's "H for high, L for low" sign-mnemonic is the canonical pedagogy |
| ↳ N17.1 | sign_convention_emf_traversal | nano | ✅ | — | — | A17 | When traversing battery − to + : +ε (rise); + to − : −ε (drop). Classic source of student errors |
| **A18** | `grouping_cells_in_series` | atomic | ✅ | — | A12, A13, A14 | A20 | ε_eq = Σε_i; r_eq = Σr_i. **EPIC-C STATE_1 wrong belief: "polarity reversal doesn't matter" — NO; reversed cell SUBTRACTS its emf and ADDS its r** (per CE-G5) |
| **A19** | `grouping_cells_in_parallel` | atomic | ✅ | — | A12, A13, A15, A16, A17 | A20 | For identical cells: ε_eq = ε, r_eq = r/n. For different cells: ε_eq = Σ(ε_i/r_i) / Σ(1/r_i). Used when high current needed at fixed terminal voltage |
| **A20** | `grouping_cells_mixed_max_power_transfer` | atomic | ✅ | — | A18, A19 | (terminus) | Per CE-G5. n cells per row × m rows. i = nE/(R + nr/m). Maximum when R = nr/m → external = internal. **Max-power-transfer theorem.** JEE Advanced canonical |
| **A21** | `wheatstone_bridge_balance` | atomic | ✅ | — | A14, A15, A16, A17, [T29:field_inside_conductor_is_zero] | A22, A23 | R₁/R₂ = R₃/R₄ → no current in galvanometer arm. Lab-practical canonical. Indian-context: CBSE board practical lists Wheatstone bridge as mandatory experiment |
| ↳ N21.1 | balance_condition_independent_of_battery_emf | nano | ✅ | — | — | A21 | Doubling the battery emf doubles all currents but balance condition unchanged. Important conceptual insight |
| **A22** | `galvanometer_to_ammeter_shunt` | atomic | ✅ | — | A6, A14, A15 | (terminus) | S = (i_g/(i − i_g)) × G. Low-R shunt in PARALLEL. Ideal ammeter R → 0. Common JEE problem |
| **A23** | `galvanometer_to_voltmeter_series_R` | atomic | ✅ | — | A6, A14 | (terminus) | R_series = V/i_g − G. High R in SERIES. Ideal voltmeter R → ∞. Inverse of A22 |
| **A24** | `potentiometer_principle` | atomic | ✅ | — | A5, A12, A13, A17, A23 | A25, A26 | Null-deflection method. ε_unknown = (l/L) × ε_known. Why preferred over voltmeter: zero current drawn during measurement |
| **A25** | `potentiometer_comparing_two_emfs` | atomic | ✅ | — | A24 | (terminus) | ε₁/ε₂ = l₁/l₂. The cleanest emf-comparison method. No calibration needed if used in ratio form |
| **A26** | `potentiometer_measuring_internal_resistance` | atomic | ✅ | — | A24, A13 | (terminus) | r = R(l₁/l₂ − 1). Bridge from potentiometer principle to internal-r measurement (HCV §32.13 + DCP §23.12) |
| **A27** | `rc_circuit_charging_discharging` | atomic | ✅ | — | A5, A6, A12, A13, [T31:capacitor_charge_storage] | (terminus into T31) | **Critical bridge atomic.** q(t) = εC(1−e^(−t/τ)) charging; q(t) = Q₀e^(−t/τ) discharging. τ = RC = time constant. 63% rule (1 τ → 63% of final value). **Closes the T31 ↔ T34 bidirectional bridge documented in T31 catalog Section J** |
| ↳ N27.1 | time_constant_tau_equals_RC | nano | ✅ | — | — | A27 | Dimensional check: [R][C] = (V/A)(C/V) = C/A = s ✓. Physical: 1τ ≈ 63%, 2τ ≈ 86%, 5τ ≈ 99%. After 5τ, treat as fully charged |
| **A28** | `atmospheric_electricity_earth_battery` | atomic | ✅ | — | A1, A12 | (terminus) | NCERT §3.13 inset + HCV §32.14. Earth's surface −600 kC; ionosphere +; potential diff 400 kV; 1800 A current flows continuously; thunderstorms recharge the "atmospheric battery." **Strong Indian-context anchor: monsoon lightning frequency (one of highest globally — Odisha, MP, Bihar lightning death statistics)** |

---

## Section D — Subsection breakdown

### D.1 NCERT §3.4: Drift of electrons + Ohm's law microscopic derivation
- The canonical Class-12 board derivation. End-to-end: random velocity = 0 → field-induced acceleration → average drift → current density → V = IR

### D.2 NCERT §3.5: Mobility (briefly), Ohm's law limitations
- µ = v_d/E = eτ/m. Skipped as a separate atomic; folded into A2 drift_velocity

### D.3 NCERT §3.6: Limitations of Ohm's law (the 3-deviation-class section)
- Atomic A9 per CE-G3

### D.4 NCERT §3.7: Resistivity of various materials (Table 3.1 + Resistor color code)
- Atomic A7 + nano N6.1

### D.5 NCERT §3.8: Temperature dependence (graphs + nichrome example)
- Atomic A8 + nanos N8.1, N8.2

### D.6 NCERT §3.9: Electrical energy, power, power transmission
- Atomics A10 + A11

### D.7 NCERT §3.10: Combination of resistors
- Atomics A14 + A15

### D.8 NCERT §3.11: Cells, EMF, internal resistance
- Atomics A12 + A13

### D.9 NCERT §3.12 (mentioned but body in Class 11 review): Cells in series/parallel
- Atomics A18 + A19

### D.10 NCERT §3.13: Kirchhoff's rules + "Charges in Clouds" inset
- Atomics A16 + A17 + A28 (atmospheric anchor)

### D.11 HCV §32.13: RC circuits (charging + discharging)
- Atomic A27 — **THE BRIDGE ATOMIC TO T31**

### D.12 DCP §23.11: Mixed grouping + Max Power Transfer Theorem
- Atomic A20 — DCP-unique depth

### D.13 DCP §23.12: Galvanometer, Ammeter, Voltmeter, Potentiometer
- Atomics A22, A23, A24, A25, A26

### D.14 Indian real-world anchors (MEDIUM density per CE-G6)

| Anchor | Source | Atomic | Notes |
|---|---|---|---|
| Nichrome heater coil (toaster, iron, geyser) | NCERT Ex 3.3 + DCP Ex 23.15 | A8 + A10 + N8.1 + N10.1 | Most direct phenomenological anchor for resistance-heating |
| Tungsten incandescent bulb V-I non-ohmic curve | HCV §32.3 | A9 | Resistance increases with temperature ⇒ V-I curve bends |
| 11 kV → 220 V step-down transformer (Indian distribution grid) | NCERT §3.9 (Eq.3.35) | A11 | Strongest anchor for power transmission. High-tension towers along Indian highways |
| Wheatstone bridge in lab practical | (CBSE syllabus) | A21 | Universal Indian Class 12 student touchpoint |
| Potentiometer comparison of cells | (CBSE lab practical) | A25 | Standard Indian school lab kit |
| Thundercloud → 20-100 MV cloud-earth potential difference; 1800 A continuous current | NCERT §3.13 + HCV §32.14 | A28 | India = one of world's highest lightning-strike densities (Odisha, Bihar, MP); lightning deaths annually ~2500 (NDMA data) |
| Dry cells (1.5V Eveready/Duracell) vs lead-acid car battery vs Li-ion phone | (general Indian-context) | A12 + A13 | Real-world emf hierarchy with internal-resistance differences |
| Ammeter/voltmeter usage in domestic meter reading | (general) | A22, A23 | Indian household electricity meter — kWh dial reading anchor |

---

## Section E — Stage-1 commonality flag

T34 was identified in stage-1 matrix as triple-covered. Pilot fully validates: NCERT, HCV, DCP all carry essentially the same atomic structure. DCP adds depth (Mixed Grouping atomic A20); HCV adds RC circuits (A27) which is the bridge bridge to T31. NCERT is the most board-pedagogically-clean.

---

## Section F — V1 priority flag

Per [[feedback-v1-priority-deferred-to-stage-5]], priority deferred. Inline flag for Stage-5: **A5, A6, A14, A15, A16, A17 form the V1 essential-core** (all six together = "can solve any Class 12 board circuit problem"). A20 (mixed grouping) and A27 (RC) are V1 advanced; rest are V1 baseline.

---

## Section G — Cluster role

**T34 is the central hub of E&M cluster's circuits sub-cluster.** Closes the T31 ↔ T34 RC-bridge via atomic A27. High `Required-by` count to applications (T35 EM induction, T36 Magnetic effects of current). High `Requires` count from T29 foundations (charge, field, conductor properties).

---

## Section H — Atomic-count restraint check

28 atomics. Mean across 10 pilots is ~27. T34 lands exactly on mean. Each atomic justified by ≥1 of: unique misconception (A5, A6, A8, A12, A18), distinct visual scene (A14 vs A15; A22 vs A23), high `Required-by` count (A5, A6, A16, A17), or DCP/JEE-Advanced depth justification (A9, A20, A27).

---

## Section I — Open questions / Stage-4 candidate-micro flags

- **A9 limitations_of_ohms_law** as one atomic vs three (diode + GaAs + non-linear separately): currently one umbrella. Stage-4 candidate for split into three micros if simulation reveals each deserves own visual canvas.
- **A24, A25, A26 potentiometer trio**: could be merged into single "potentiometer" atomic with three nanos. Currently split per CE-G5 logic. Stage-4 will re-examine if the EPIC-L states overlap too much.
- **A27 RC circuit**: split into charging (A27a) and discharging (A27b)? Currently one atomic with both. The exponential-decay-vs-exponential-rise has distinct visual scenes but identical math. Stage-4 candidate.

---

## Section J — Matrix update payload

```
Topic ID                : T34
Atomic count            : 28
Nano count              : ~36
Stage-2 OUT-edges (9)   : T34 → T29 (×2: kirchhoff_junction ← superposition; field_inside_conductor ← wheatstone)
                        : T34 → T30 (×2: shielding-via-zero-field-conductor; gauss law context-ref)
                        : T34 → T31 (×3: RC bridge — capacitor charge/discharge; series/parallel inverse analogy)
                        : T34 → T35 (×1: motional emf — uses internal-r + emf framework)
                        : T34 → T36 (×1: ampere's law uses kirchhoff-junction logic)
Math-tools OUT-edges (2): linear_simultaneous_equations (Kirchhoff networks)
                        : exponential_decay (RC time-constant)
Anchor strength         : MEDIUM (per CE-G6)
Founder decisions       : 6 (CE-G1 ... CE-G6)
```

---
