# Pilot Topic 25 — Thermal Properties of Matter

> Stage-2 pilot catalog. 33rd of 44. **Thermodynamics cluster CLOSER** (3/3 — siblings T26 Thermodynamics + T27 Kinetic Theory closed Session 49). Paired with **T20 Fluid Mechanics** in Session 52 = **DOUBLE CLUSTER CLOSURE session** (T20 closes Mechanical Properties; T25 closes Thermodynamics).
> Sources: **NCERT Class 11 Part 2 Ch.11 Thermal Properties of Matter** (canonical spine; covers temperature/thermal-expansion/calorimetry/latent-heat/heat-transfer in one chapter) + **HCV Vol 2 Ch.23 Heat and Temperature + Ch.25 Calorimetry + Ch.28 Heat Transfer** (cluster split across 3 chapters) + **DC Pandey Waves/Thermo Ch.20 Calorimetry and Heat Transfer** (combined treatment).
> Coverage class: **TRIPLE-COVERED**.
> Anchor density: **VERY-STRONG** (per Stage-4 formalised criterion: anchor count ≥ 13 AND strand-diversity ≥ 8). 14 anchors × 9 strands (industry + healthcare + transport + research + space + meteorology + consumer + agriculture + policy/energy). **7th VERY-STRONG observation; 4th non-Modern-Physics VERY-STRONG.** Drivers: NTPC power-station boilers, IMD weather radiometers, Indian Railways thermal expansion of rails, ISRO satellite thermal management, AIIMS body-temperature instrumentation, BEE star-rating policy on heat-pumps/AC.
> **Critical role:** Thermal Properties is the chapter that BRIDGES Thermodynamics (T26 1st/2nd law + T27 statistical-mechanical foundation) to phenomenological heat-transfer + everyday-thermal-instrumentation. Calorimetry + Newton's-law-of-cooling + Stefan-Boltzmann + Wien's-law are universal-engineering-applied and high-PYQ-frequency. **Closes T26 forward-edge anchors** (Cv definition validated; Q = mCΔT operational form) **and T27 forward-edges** (Maxwell-Boltzmann radiation tail bridges to Stefan-Boltzmann). **Opens forward to T38 EM Waves** (blackbody radiation = EM spectrum + Stefan-Boltzmann).

---

## Founder Decisions Applied

| Tag | Decision |
|---|---|
| **TP-G1** | Atomic granularity = "one thermal-property OR one heat-transfer-mode OR one calorimetric-relation." Thermometry, thermal expansion, calorimetry, latent heat, conduction, convection, radiation, Newton's law of cooling, blackbody/Wien = NINE-TEN separate atomics. NCERT compresses in one chapter; we split per-principle for pedagogical clarity. |
| **TP-G2** | **Thermal expansion is ONE atomic with THREE nano sub-cases** (`thermal_expansion_atomic` → linear/area/volumetric nanos). Coefficients α, β, γ with relation β = 2α, γ = 3α. **cognitive_error_target:** "α/β/γ are independent" → all three derive from same molecular-vibration mechanism; β ≈ 2α and γ ≈ 3α to leading order. |
| **TP-G3** | **Calorimetry principle is its own atomic** (`calorimetry_principle_atomic`) — Q_lost = Q_gained; conservation of heat in mixing. **Diamond candidate** — mixing-water-temperatures sim. |
| **TP-G4** | **Specific heat is its own atomic** (`specific_heat_solid_liquid_atomic`) — Q = mCΔT; differs by phase + material. **Closes T26 specific-heat-of-gases (Cv, Cp) by bridging to operational Q = mCΔT form.** Water's exceptionally high C (4186 J/kg·K) anchors monsoon climate + cooking applications. |
| **TP-G5** | **Latent heat is its own atomic** (`latent_heat_atomic`) — Q = mL; energy absorbed/released at phase transition without temperature change. **Diamond candidate** — phase-change sim. **cognitive_error_target:** "ice at 0°C has same energy as water at 0°C" → no, water has L_f = 334 kJ/kg more energy. |
| **TP-G6** | **Heat conduction is its own atomic** (`heat_conduction_atomic`) — Fourier's law: Q/t = kA(ΔT/L). **Industrial anchor:** thermal-insulation building codes, IIT-Roorkee+IIT-Madras building-thermal labs. |
| **TP-G7** | **Heat convection is its own atomic** (`heat_convection_atomic`) — bulk-fluid motion driven by buoyancy + thermal gradient. **Cross-cluster intra-session bridge to T20 Fluid Mechanics** (Archimedes buoyancy + viscosity). |
| **TP-G8** | **Heat radiation = TWO atomics** (`stefan_boltzmann_atomic` + `wien_displacement_atomic`). Stefan-Boltzmann: P = σεAT⁴. Wien's: λ_max·T = b. Both are blackbody-physics; both bridge to T38 EM Waves. **Diamond candidate** — both. |
| **TP-G9** | **Newton's law of cooling is its own atomic** (`newtons_law_of_cooling_atomic`) — dT/dt = −k(T − T_env). **Cognitive scaffold to differentiate from Stefan-Boltzmann** (which is the underlying mechanism in small-ΔT limit). |
| **TP-G10** | **VERY-STRONG anchor (formalised Stage-4 criterion)** — 14 anchors × 9 strands (industry + healthcare + transport + research + space + meteorology + consumer + agriculture + policy). **7th VERY-STRONG observation.** Drivers: NTPC + Tata Power boilers (Stefan-Boltzmann + conduction); IMD radiometers + monsoon thermometry; Indian Railways rail thermal-expansion expansion-gap engineering; ISRO satellite MLI thermal blankets; AIIMS clinical thermometry; BEE star-rating policy on heat-pumps. Foundational + engineering rich. |
| **TP-G11** | **Cognitive-error-prevention sub-category — 5 instances** (TP-G2 α/β/γ relation; TP-G5 ice-vs-water-at-0°C; TP-G8 Stefan vs Wien split; TP-G9 Newton-cooling-vs-Stefan-Boltzmann; implicit "kelvin-vs-celsius for ΔT" not flagged separately). Founder-decision share: 5/12 = 42%. Above 35% elevated EPIC-L gate threshold. |
| **TP-G12** | **Sea-breeze + monsoon physics belongs here AND in T20.** Convection-driven sea breeze (heat-conduction + buoyancy) IS the textbook real-world anchor for heat transfer + spans both Thermodynamics + Fluid Mechanics clusters. Author once in T25, cross-link from T20. |

---

## Section A — Source Map

| Sub-topic | NCERT 11.2 Ch.11 | HCV V2 Ch.23/25/28 | DCM W/T Ch.20 |
|---|---|---|---|
| Temperature + thermometers + scales (Celsius/Kelvin/Fahrenheit) | §11.1-11.3 | Ch.23 §23.1-23.4 | §20.1 |
| Ideal-gas thermometer (T-physical definition) | §11.4 | Ch.24 §24.1 | §20.2 |
| Thermal expansion (linear/area/volume) | §11.5 | Ch.23 §23.5-23.7 | §20.3 |
| Specific heat capacity (solids/liquids) | §11.6 | Ch.25 §25.1-25.3 | §20.4 |
| Calorimetry (mixing principle, water equivalent) | §11.7 | Ch.25 §25.4-25.6 | §20.5 |
| Latent heat (fusion + vaporisation) | §11.8 | Ch.25 §25.7-25.8 | §20.6 |
| Heat conduction (Fourier's law) | §11.9.1 | Ch.28 §28.1-28.3 | §20.7 |
| Heat convection | §11.9.2 | Ch.28 §28.4 | §20.8 |
| Heat radiation (Stefan-Boltzmann + Wien) | §11.9.3 | Ch.28 §28.5-28.9 | §20.9 |
| Newton's law of cooling | §11.10 | Ch.28 §28.10 | §20.10 |

**NCERT Ch.11 is the canonical spine** (~22 pages); covers all 10 sub-topics. **HCV splits across Ch.23 (Heat + Temperature + Expansion) + Ch.25 (Calorimetry + Latent Heat) + Ch.28 (Heat Transfer + Newton-cooling)** — most-distributed HCV chapter coverage observed so far. DCM W/T Ch.20 is the combined treatment.

---

## Section B — Atomic + Nano Catalog

| ID | Concept | Type | Sim? | In repo? | Requires | Required-by | Notes |
|---|---|---|---|---|---|---|---|
| **temperature_scales_atomic** | Temperature: measure of thermal energy; thermometric property. Three scales: Celsius (water-ice 0°C, boiling 100°C), Kelvin (absolute, 0 K = −273.15°C), Fahrenheit (legacy). T(K) = T(°C) + 273.15. ΔT(K) = ΔT(°C). | atomic | ✅ | — | [kinetic_temperature_atomic(T27)] | [thermal_expansion_atomic, calorimetry_principle_atomic, all-other-T25-atomics] | TP-G1; foundational; bridges T27 microscopic-T to macroscopic-T |
| ↳ kelvin_vs_celsius_for_delta_T_nano | ΔT in Kelvin = ΔT in Celsius (since both scales have 1-unit = 1-K size). All thermal-physics equations use ΔT directly — Kelvin-vs-Celsius doesn't matter for differences. Critical for student. | nano | ✅ | — | [temperature_scales_atomic] | [all other T25] | parent: temperature_scales_atomic; cognitive scaffold |
| ↳ clinical_thermometer_application_nano | AIIMS + apollo + Class-12 lab clinical thermometer: 35-42°C range, mercury or digital. Indian-context: fever monitoring during dengue/COVID waves. | nano | ✅ | — | [temperature_scales_atomic] | — | parent: temperature_scales_atomic; **healthcare-strand anchor: AIIMS + Apollo** |
| **thermal_expansion_atomic** | Solid bodies expand on heating: ΔL = αL₀ΔT (linear); ΔA = βA₀ΔT (area, β ≈ 2α); ΔV = γV₀ΔT (volume, γ ≈ 3α). Coefficient α depends on material. Steel α ≈ 12 × 10⁻⁶ /K; copper ≈ 17 × 10⁻⁶; aluminum ≈ 23 × 10⁻⁶. | atomic | ✅ | — | [temperature_scales_atomic] | [rail_track_expansion_nano, anomalous_water_expansion_nano] | TP-G2; **Diamond candidate**; **cognitive_error_target:** "α/β/γ independent" → β ≈ 2α, γ ≈ 3α from same mechanism |
| ↳ linear_area_volumetric_relation_nano | β = 2α; γ = 3α (to leading order). Derivation: differentiate (L+ΔL)² = L² + 2LΔL + (ΔL)² and (L+ΔL)³ similarly. Cognitive scaffold. | nano | ✅ | — | [thermal_expansion_atomic] | — | parent: thermal_expansion_atomic |
| ↳ rail_track_expansion_application_nano | Indian Railways 1 km steel rail expands ~1.2 cm per 10°C ΔT. Expansion gaps (4-6 mm) every 13 m rail section. Welded long-rail uses pre-stressing. **Tata Steel + SAIL spec'd to standard α.** | nano | ✅ | — | [thermal_expansion_atomic] | — | parent: thermal_expansion_atomic; **transport/industry-strand anchor: Indian Railways + Tata Steel** |
| ↳ anomalous_water_expansion_4c_nano | Water has MAXIMUM density at 4°C; expands on cooling 4→0°C. Causes ice to float + Indian lake-fish to survive winter beneath ice cap. Critical to monsoon climate. | nano | ✅ | — | [thermal_expansion_atomic] | — | parent: thermal_expansion_atomic; **agriculture/biology-strand anchor** |
| ↳ thermal_expansion_liquid_gas_nano | Liquid γ_water ≈ 207 × 10⁻⁶ /K. Gas: PV = nRT means γ_gas dominated by P-T behaviour (V proportional to T at constant P). **Cross-cluster link to T20 fluid density-T dependence.** | nano | ✅ | — | [thermal_expansion_atomic, ideal_gas_equation(T27)] | [heat_convection_atomic] | parent: thermal_expansion_atomic; **cross-cluster bridge to T20** |
| **calorimetry_principle_atomic** | Heat-lost = Heat-gained in mixing without phase-change: m₁C₁(T₁−T_f) = m₂C₂(T_f−T₂). Conservation of energy applied to thermal interactions. | atomic | ✅ | — | [temperature_scales_atomic, specific_heat_solid_liquid_atomic] | — | TP-G3; **Diamond candidate**; mixing-water-temperatures sim |
| ↳ water_equivalent_application_nano | Water equivalent W of calorimeter: heat absorbed by calorimeter = W·C_water·ΔT. Standard Indian physics-lab equipment + IIT-Bombay+IIT-Madras Class-11/12 lab kits. | nano | ✅ | — | [calorimetry_principle_atomic] | — | parent: calorimetry_principle_atomic; **education/research-strand anchor: IIT lab kits** |
| **specific_heat_solid_liquid_atomic** | Q = mCΔT; energy to raise unit mass by unit temperature. Water C ≈ 4186 J/kg·K (exceptionally high); ice ≈ 2100; steam ≈ 2010; iron ≈ 460; copper ≈ 385. **Bridges T26 Cv/Cp gas-specific-heats to operational form.** | atomic | ✅ | — | [internal_energy_atomic(T26)] | [latent_heat_atomic, calorimetry_principle_atomic] | TP-G4; **closes T26 forward-edge** (Cv defined → operational Q = mCΔT form). **Cycle break (2026-06-13):** removed `calorimetry_principle_atomic` from Requires — Q=mCΔT (specific heat) is the fundamental definition; calorimetry (heat-lost = heat-gained) USES it, so calorimetry requires specific-heat, not the reverse. |
| ↳ water_high_c_climate_application_nano | Water's high C anchors Indian monsoon thermal regulation: oceans heat slowly + cool slowly → moderate coastal climates. Cooking: 1 L water at 25°C → 100°C needs 314 kJ. | nano | ✅ | — | [specific_heat_solid_liquid_atomic] | — | parent: specific_heat_solid_liquid_atomic; **meteorology/consumer-strand anchor: monsoon + cooking** |
| **latent_heat_atomic** | Q = mL; energy absorbed/released at phase transition WITHOUT temperature change. L_f (fusion) ice→water = 334 kJ/kg. L_v (vaporisation) water→steam = 2260 kJ/kg. | atomic | ✅ | — | [specific_heat_solid_liquid_atomic] | [pressure_cooker_application_nano] | TP-G5; **Diamond candidate**; **cognitive_error_target:** "ice at 0°C = water at 0°C energetically" → no, 334 kJ/kg difference |
| ↳ pressure_cooker_application_nano | Standard Indian pressure cooker (Hawkins, Prestige): raises boiling-point to ~120°C at 1.5-2 atm; uses L_v released on condensation to cook food faster + with less fuel. | nano | ✅ | — | [latent_heat_atomic] | — | parent: latent_heat_atomic; **consumer/industry-strand anchor: Hawkins + Prestige** |
| ↳ sweat_cooling_evaporation_nano | Human sweating in Indian-summer (40-45°C): L_v ≈ 2400 kJ/kg at 35°C → evaporative cooling. 1 g sweat removes 2.4 kJ from skin. **Healthcare/physiology Indian context.** | nano | ✅ | — | [latent_heat_atomic] | — | parent: latent_heat_atomic; **healthcare-strand anchor** |
| **heat_conduction_atomic** | Fourier's law: Q/t = kA(ΔT/L). k = thermal conductivity. Cu k ≈ 400 W/m·K; Fe ≈ 80; glass ≈ 1; air ≈ 0.025; wool ≈ 0.04 (insulator). | atomic | ✅ | — | [temperature_scales_atomic, thermal_expansion_atomic] | [building_insulation_nano] | TP-G6 |
| ↳ thermal_conductor_vs_insulator_nano | Indian housing materials: brick (k ≈ 0.8) vs concrete (k ≈ 1.4) vs wood (k ≈ 0.13). BIS National Building Code thermal-insulation requirements. | nano | ✅ | — | [heat_conduction_atomic] | — | parent: heat_conduction_atomic; **industry/policy-strand anchor: BIS NBC** |
| ↳ winter_clothing_woollen_insulation_nano | Wool sweater + double-layer clothing in North-Indian winter: trapped air (k ≈ 0.025) is the actual insulator, wool just traps. Same principle in thermos flask. | nano | — | — | [heat_conduction_atomic] | — | parent: heat_conduction_atomic; **consumer-strand anchor** |
| **heat_convection_atomic** | Bulk-fluid motion driven by buoyancy + thermal gradient transfers heat. Hot fluid rises (lower ρ); cold fluid sinks; circulation moves heat. **Convection IS buoyancy-driven flow.** | atomic | ✅ | — | [archimedes_buoyancy_atomic(T20), viscosity_atomic(T20), temperature_scales_atomic] | [sea_breeze_monsoon_nano] | TP-G7; **cross-cluster bridge to T20 — convection IS buoyancy + viscosity** |
| ↳ sea_breeze_land_breeze_monsoon_nano | Land heats faster than ocean (lower C) → hot air rises over land → cool air flows in from sea = day-time sea breeze. Reverse at night = land breeze. **Indian monsoon is large-scale extension of this.** | nano | ✅ | — | [heat_convection_atomic] | — | parent: heat_convection_atomic; **meteorology-strand anchor: IMD + monsoon** |
| ↳ room_heater_radiator_application_nano | Bajaj + Usha room-heaters: hot-air convection circulates room air. North-Indian winter context. | nano | — | — | [heat_convection_atomic] | — | parent: heat_convection_atomic; **consumer-strand anchor: Bajaj + Usha** |
| **stefan_boltzmann_atomic** | Total power radiated by black/grey body: P = σεAT⁴. σ = 5.67 × 10⁻⁸ W/m²·K⁴. ε = emissivity (1 for blackbody, <1 for grey body). **Bridges to T38 EM Waves** (radiation IS EM). | atomic | ✅ | — | [temperature_scales_atomic, em_wave_basics(T38)] | [ntpc_boiler_application_nano, wien_displacement_atomic] | TP-G8; **Diamond candidate**; **closes T26 entropy ← T-dependence forward; opens T38 EM-spectrum back-bridge** |
| ↳ ntpc_boiler_thermal_application_nano | NTPC Korba + Tata Power Mundra + BHEL boilers operate at 600°C surface temps; radiative loss σ(T⁴ − T_amb⁴) is major heat-loss source; insulation + reflective coatings critical. | nano | ✅ | — | [stefan_boltzmann_atomic] | — | parent: stefan_boltzmann_atomic; **industry/energy-strand anchor: NTPC + Tata Power + BHEL** |
| ↳ sun_solar_radiation_isro_nano | Sun ≈ blackbody at 5778 K → P/A ≈ σT⁴ ≈ 6 × 10⁷ W/m². Solar constant at Earth ≈ 1361 W/m². ISRO satellites + Indian solar-PV plants use this. | nano | ✅ | — | [stefan_boltzmann_atomic, em_wave_basics(T38)] | — | parent: stefan_boltzmann_atomic; **space/energy-strand anchor: ISRO + Adani Solar + Tata Solar** |
| **wien_displacement_atomic** | λ_max · T = b (b = 2.898 × 10⁻³ m·K). Peak wavelength of blackbody spectrum shifts inversely with T. Sun (5778 K): λ_max ≈ 500 nm (yellow-green). Earth (300 K): λ_max ≈ 10 μm (infrared). | atomic | ✅ | — | [stefan_boltzmann_atomic, em_wave_basics(T38)] | [thermal_imaging_application_nano] | TP-G8; **Diamond candidate**; explains why "hot objects glow red then white" + IR-imaging |
| ↳ thermal_imaging_drdo_application_nano | DRDO + Indian armed forces thermal-imaging night-vision goggles: detect 300-310 K body heat → IR at λ ≈ 9.7 μm. AIIMS COVID screening thermometers use same principle. | nano | ✅ | — | [wien_displacement_atomic, stefan_boltzmann_atomic] | — | parent: wien_displacement_atomic; **defence/healthcare-strand anchor: DRDO + AIIMS** |
| ↳ imd_satellite_radiometer_nano | IMD INSAT satellites carry IR radiometers measuring cloud-top temperatures via Wien's-law peak shift → weather prediction. | nano | ✅ | — | [wien_displacement_atomic] | — | parent: wien_displacement_atomic; **meteorology/space-strand anchor: IMD + INSAT** |
| **newtons_law_of_cooling_atomic** | dT/dt = −k(T − T_env); small-ΔT-from-environment limit of Stefan-Boltzmann. T(t) = T_env + (T₀ − T_env)·e^(−kt). | atomic | ✅ | — | [stefan_boltzmann_atomic, calculus_exponential_decay(math-tools)] | — | TP-G9; **cognitive scaffold** to differentiate from Stefan-Boltzmann; **5th cross-cluster use of `calculus_exponential_decay`** (after T34/T44/T48/T35) |
| ↳ tea_cooling_application_nano | Hot tea (60°C → 25°C ambient) cools per Newton's law; characteristic time τ ≈ 1/k ≈ 10-15 min for standard Indian tea-cup. | nano | — | — | [newtons_law_of_cooling_atomic] | — | parent: newtons_law_of_cooling_atomic; **consumer-strand anchor** |

**Atomic count:** 10. **Nano count:** ~17. **Total entries:** 27.

---

## Section C — Cross-Source Coverage Matrix

| Atomic | NCERT 11.2 Ch.11 | HCV V2 Ch.23/25/28 | DCM W/T Ch.20 | Coverage |
|---|---|---|---|---|
| temperature_scales_atomic | §11.1-11.3 | Ch.23 §23.1-23.4 | §20.1 | TRIPLE |
| thermal_expansion_atomic | §11.5 | Ch.23 §23.5-23.7 | §20.3 | TRIPLE |
| calorimetry_principle_atomic | §11.7 | Ch.25 §25.4-25.6 | §20.5 | TRIPLE |
| specific_heat_solid_liquid_atomic | §11.6 | Ch.25 §25.1-25.3 | §20.4 | TRIPLE |
| latent_heat_atomic | §11.8 | Ch.25 §25.7-25.8 | §20.6 | TRIPLE |
| heat_conduction_atomic | §11.9.1 | Ch.28 §28.1-28.3 | §20.7 | TRIPLE |
| heat_convection_atomic | §11.9.2 | Ch.28 §28.4 | §20.8 | TRIPLE |
| stefan_boltzmann_atomic | §11.9.3 | Ch.28 §28.5-28.7 | §20.9 | TRIPLE |
| wien_displacement_atomic | §11.9.3 | Ch.28 §28.8-28.9 | §20.9 | TRIPLE |
| newtons_law_of_cooling_atomic | §11.10 | Ch.28 §28.10 | §20.10 | TRIPLE |

**Triple-coverage rate:** 10 of 10 atomics = **100%** — **11th 100% topic in 33 pilots**. **Streak extends to 3 consecutive** (T18 → T20 → T25). Foundational thermal-physics returns to 100% — all three sources cover thermal properties canonically.

---

## Section D — Stage-3 Math-Tool Dependencies

| Math-tool primitive | Used by | Status |
|---|---|---|
| `calculus_exponential_decay` | newtons_law_of_cooling_atomic | REQUIRED (5th cross-cluster validation — T34, T44, T48, T35, T25) |
| `algebra_basic_ratio` (β = 2α, γ = 3α) | thermal_expansion_atomic | REQUIRED (existing) |
| `power_function_T_fourth` (Stefan-Boltzmann T⁴) | stefan_boltzmann_atomic | **NEW STUB** (related to T26 `power_function_pv_gamma` but distinct) |
| `algebra_inverse_proportion` (λ·T = b Wien's) | wien_displacement_atomic | REQUIRED (existing) |
| `calculus_derivative_dT_dt` | newtons_law_of_cooling_atomic | REQUIRED (existing) |
| `algebra_unit_analysis` (W/m²K⁴ for σ) | stefan_boltzmann_atomic | REQUIRED (existing) |

**1 NEW STUB registered: `power_function_T_fourth`** — Stefan-Boltzmann's T⁴ scaling is a distinct functional form (T⁴ vs P^γV pv-gamma). Math-tools IN-degree: 51 → **52**. **Light-maintenance mode continues with minimal addition** (single stub).

---

## Section E — Cross-Topic Dependencies (Bidirectional Edges)

### Outgoing (T25 requires from earlier topics)

| Target topic | Edge | Reason |
|---|---|---|
| T26 Thermodynamics (back-edge) | specific_heat_solid_liquid_atomic ← internal_energy_atomic | **Closes** T26 specific-heat-of-gases (Cv, Cp) → operational Q = mCΔT bridge |
| T27 Kinetic Theory (back-edge) | temperature_scales_atomic ← kinetic_temperature_atomic | **Closes** T27 microscopic-T → macroscopic-T bridge |
| T27 Kinetic Theory (back-edge) | stefan_boltzmann_atomic ← maxwell_boltzmann_distribution_atomic (radiation-tail) | Weak forward-closure |
| **T20 Fluid Mechanics (intra-session)** | heat_convection_atomic ↔ T20 archimedes_buoyancy + viscosity | **Intra-session bidirectional** (4 edges; see T20 §E) |
| T38 EM Waves (back-edge — distant) | stefan_boltzmann_atomic + wien_displacement_atomic ← em_wave_basics + em_spectrum | Blackbody IS EM; **closes T38 thermal-radiation-source bridge** |
| Math-tools | 6 primitives (1 NEW STUB: `power_function_T_fourth`) | All REQUIRED post-registration |

### Incoming (T25 will be required by later topics)

| Source topic | Edge | Reason |
|---|---|---|
| T49 Semiconductor (back-edge weak) | bandgap_T_dependence ← thermal_expansion + Stefan-Boltzmann | weak — bandgap-temperature coefficient |
| T48 Nuclei (back-edge weak) | nuclear_thermal_management ← heat_conduction (reactor cores) | weak |

### T20 ↔ T25 intra-session bidirectional edges (4 edges; cross-cluster paired-batch)

Recapping from T20 §E:
1. T25 `heat_convection_atomic` ↔ T20 `archimedes_buoyancy_atomic` (convection IS buoyancy-driven density gradient → fluid flow)
2. T25 `heat_convection_atomic` ↔ T20 `viscosity_atomic` (convection rate depends on η of fluid)
3. T25 `thermal_expansion_liquid_gas_nano` ↔ T20 `fluid_pressure_atomic` (density change with T = pressure change at constant V)
4. T25 (implicit `surface_tension_T_dependence`) ↔ T20 `surface_tension_atomic` (T_surface decreases with T — observable in cooking)

**4 bidirectional edges = cross-cluster paired-batch density band (2-4).** Matches T15↔T18 Session 51 (4 edges). **9th data point validating Stage-4 paired-batch density rule** across both bands (intra-cluster chapter-adjacent: 6-9; cross-cluster: 2-4).

**Total outgoing: 3 back-edge closures (T26 + T27 + T38) + 6 math-tools (1 new stub) + 4 intra-session bidirectional with T20.** **Total incoming: 2 weak forward (T48 + T49).**

---

## Section F — Real-World Anchors (VERY-STRONG, Indian-context)

| Anchor | Concept hook | Authoring use | Strand |
|---|---|---|---|
| **NTPC Korba + Tata Power Mundra + BHEL boilers** | stefan_boltzmann_atomic, ntpc_boiler_thermal_application_nano, heat_conduction_atomic | "NTPC 600°C boiler surfaces radiate σ(T⁴ − T_amb⁴) per m²; reflective insulation critical for plant efficiency" | Industry / Energy |
| **Indian Railways rail thermal expansion** | thermal_expansion_atomic, rail_track_expansion_application_nano | "1 km steel rail expands ~1.2 cm per 10°C; expansion gaps every 13 m; LWR pre-stressing technique" | Transport / Industry |
| **AIIMS + Apollo clinical thermometry + COVID screening** | temperature_scales_atomic, clinical_thermometer_application_nano, wien_displacement_atomic, thermal_imaging_drdo_application_nano | "Body-temp 37°C = 310 K; IR thermal-gun reads λ_peak ≈ 9.4 μm per Wien's law" | Healthcare |
| **ISRO INSAT satellites + thermal management (MLI blankets)** | stefan_boltzmann_atomic, wien_displacement_atomic, sun_solar_radiation_isro_nano, imd_satellite_radiometer_nano | "Satellite MLI (multilayer insulation) reduces ε to ~0.05; sun-side radiator surfaces dump heat per Stefan-Boltzmann" | Space |
| **IMD weather forecasting + sea-breeze monsoon** | heat_convection_atomic, sea_breeze_land_breeze_monsoon_nano, water_high_c_climate_application_nano | "Indian monsoon = large-scale sea/land breeze convection; land C low, ocean C high → asymmetric heating" | Meteorology / Agriculture |
| **DRDO night-vision IR + thermal imaging** | wien_displacement_atomic, thermal_imaging_drdo_application_nano, stefan_boltzmann_atomic | "Indian Army night-vision goggles detect body heat via λ ≈ 10 μm IR per Wien's law + Stefan-Boltzmann sensitivity" | Defence |
| **Hawkins + Prestige pressure cookers** | latent_heat_atomic, pressure_cooker_application_nano | "Pressure cooker raises boiling point to ~120°C; uses L_v condensation to cook faster + save fuel" | Consumer / Industry |
| **Indian climate moderation (Mumbai/Chennai coastal vs Delhi/Jaipur inland)** | specific_heat_solid_liquid_atomic, water_high_c_climate_application_nano | "Mumbai coastal climate moderated by ocean's high C; Delhi/Jaipur inland extreme T swings" | Meteorology |
| **BEE star-rating (BLDC fans, AC, refrigerators)** | heat_conduction_atomic, stefan_boltzmann_atomic | "BEE star-ratings on AC compressors + refrigerator insulation use heat-transfer physics; policy-driven Indian-grade-A efficiency" | Policy / Energy |
| **Indian construction materials + BIS National Building Code** | heat_conduction_atomic, thermal_conductor_vs_insulator_nano | "BIS NBC thermal-insulation specs for North-Indian winter + South-Indian summer; brick/concrete/wood k tabulated" | Industry / Policy |
| **ICAR + irrigation thermal physics (anomalous water expansion + fish survival)** | thermal_expansion_atomic, anomalous_water_expansion_4c_nano | "Indian lakes + rivers maintain liquid water beneath ice cap due to water's 4°C max-density anomaly; fish + aquatic life survival" | Agriculture / Biology |
| **Adani Solar + Tata Solar + Indian solar-PV plants** | stefan_boltzmann_atomic, sun_solar_radiation_isro_nano | "Solar constant 1361 W/m² at India; PV panel efficiency calculated from incident Stefan-Boltzmann flux" | Energy / Industry |
| **ISRO LPSC cryogenic-engine thermal physics** | thermal_expansion_atomic, latent_heat_atomic | "Cryogenic stage LH2/LOX at 20K/90K; thermal expansion + insulation critical for tank integrity" | Space / Aerospace |
| **Indian education physics-lab calorimeter (IIT-B/M/Madras + CBSE Class-11/12)** | calorimetry_principle_atomic, water_equivalent_application_nano | "Standard Indian physics-lab Joule's calorimeter + water-equivalent calculation; CBSE/ISC practical exam" | Education / Research |

**Total: 14 distinct institutional/system anchors across 9 strands** (industry, transport, healthcare, space, meteorology, defence, consumer, policy/energy, agriculture/biology, education, aerospace — count 9 by collapsing related sub-strands). **Meets VERY-STRONG strand-diversity ≥ 8 criterion AND anchor count ≥ 13.** **Decision (TP-G10): VERY-STRONG**. **7th VERY-STRONG observation** in the catalog set; **4th non-Modern-Physics VERY-STRONG** (after T26 Thermo + the 2 Modern-Physics-cluster ISRO/medical anchors). **Second foundational topic in Session 52 to reach VERY-STRONG** — confirms Session 52 as a high-anchor-density paired-batch.

---

## Section G — Cognitive-Error-Prevention Decisions

**5 of 12 founder decisions are cognitive-error-prevention type = 42%.** Above 35% threshold; elevated EPIC-L gate applies:

| Tag | cognitive_error_target | Countermeasure |
|---|---|---|
| **TP-G2** | "α/β/γ are independent coefficients" | Author `linear_area_volumetric_relation_nano` showing β ≈ 2α + γ ≈ 3α derivation |
| **TP-G5** | "ice at 0°C = water at 0°C energetically" | Author phase-transition diagram showing L_f = 334 kJ/kg gap |
| **TP-G8** | "Stefan-Boltzmann and Wien are the same law" | Split into 2 atomics; author both with explicit "P-vs-spectrum" distinction |
| **TP-G9** | "Newton's law of cooling has different physics from Stefan-Boltzmann" | Author Newton-cooling as small-ΔT linearisation of Stefan-Boltzmann (T⁴ → ≈ T_env⁴(1+4ΔT/T_env)) |
| (implicit) **TP-G1 K-vs-°C** | "use Kelvin for thermal-expansion ΔT" | Author `kelvin_vs_celsius_for_delta_T_nano` — ΔT same in both scales |

**Combined Session 52 cognitive-error-prevention share: T20 = 50% (6/12) + T25 = 42% (5/12) = 11 of 24 = 46%.** **NEW SESSION-HIGH** (previous high: Session 50 at 46% — now tied/exceeded). Sustains 35-50% range observed across 8 consecutive sessions. **Mechanical Properties + Thermal Properties + Thermodynamics cluster set continues to be the densest-misconception domain in Stage-2.**

---

## Section H — V1 Priority Flags

| Atomic | V1? | Reason |
|---|---|---|
| temperature_scales_atomic | ✅ | Foundational; all downstream depends |
| thermal_expansion_atomic | ✅ | Diamond candidate; Indian Railways anchor |
| calorimetry_principle_atomic | ✅ | Diamond candidate; high PYQ frequency |
| specific_heat_solid_liquid_atomic | ✅ | Closes T26 bridge; high consumer/cooking anchor |
| latent_heat_atomic | ✅ | Diamond candidate; pressure-cooker anchor |
| stefan_boltzmann_atomic | ✅ | Diamond candidate; NTPC + ISRO + solar anchors |
| heat_conduction_atomic | ⚖️ | V1.1; insulation anchor |
| heat_convection_atomic | ⚖️ | V1.1; cross-cluster bridge to T20 |
| wien_displacement_atomic | ⚖️ | V1.1; Diamond candidate; thermal-imaging + IMD anchors |
| newtons_law_of_cooling_atomic | ⚖️ | V1.2; cognitive-scaffold from Stefan-Boltzmann |

**V1 ship count for T25: 6 atomics.** Slightly above the 5-atomic mean of recent paired-batches (T15 = 5, T18 = 5, T20 = 5). Session 52 combined V1 ship count: T20 = 5 + T25 = 6 = **11 atomics** — densest paired-batch V1 ship count so far.

---

## Section I — Open Questions

1. **Kinetic theory of gases pressure-temperature derivation** — covered T27; do not repeat in T25 (cross-link only).
2. **Specific heat of gases (Cv, Cp, γ)** — covered T26; T25 specific-heat-of-solids/liquids is the operational complement.
3. **Greenhouse effect + global warming physics** — NCERT mentions; could be a V2 "applied thermal" atomic; defer.
4. **Black-body cavity derivation (Planck's law)** — graduate-level; defer.
5. **Triple point of water + phase diagram** — NCERT-light; defer to V2.
6. **Anomalous water expansion mechanism (hydrogen-bonding)** — molecular-level; defer to T27-extension.
7. **Heat-engine thermodynamics** — T26 territory; cross-link only.
8. **Thermal radiation Doppler shift (cosmology)** — graduate; defer.
9. **Thermodynamics cluster completeness check** — **T25 closes cluster** (T26 + T27 + T25 all done). Cluster done.

---

## Section J — Sign-Off

- Authored: Session 52, 2026-05-25.
- Author: Claude (Architect+Engineer role).
- Coverage class: **TRIPLE**.
- Anchor density: **VERY-STRONG** (14 anchors × 9 strands — **7th VERY-STRONG**; 4th non-Modern-Physics; 2nd VERY-STRONG in same Session 52 — densest single-session anchor profile).
- Triple-coverage rate: **100%** (10/10) — **11th observed 100% topic**; streak extends to 3 consecutive (T18 → T20 → T25).
- Atomic count: **10**. Nano count: **17**. Total: **27 entries**.
- V1 ship count: **6 atomics** (densest single-topic V1 of recent paired-batches).
- **Closes anticipated forward-edges**: T26 Cv → Q = mCΔT operational form; T27 microscopic-T → macroscopic-T scale; T38 thermal-radiation-as-EM-source.
- **Thermodynamics cluster CLOSED** (3/3 — T26 + T27 + T25). **8th cluster closure in Stage-2.** Combined with Mechanical Properties closure (T18 + T20) = **DOUBLE cluster closure** Session 52 = 8th + 7th cluster closures in one session.
- **1 NEW math-tools stub registered**: `power_function_T_fourth` (Stefan-Boltzmann). Math-tools IN-degree: 51 → **52**. **5th cross-cluster validation of `calculus_exponential_decay`** (T34 → T44 → T48 → T35 → T25).
- Cognitive-error-prevention founder-decision share: **42%** (5/12). Combined Session 52: **46%** (11/24) — new session-high (tied with Session 50's 46%).
- Next pilot batch: pending founder greenlight after Session 52 closure.

---

*11th 100% topic; 7th VERY-STRONG; 2nd VERY-STRONG in same Session 52 (densest anchor profile). Thermodynamics cluster CLOSED — combined with T20's Mechanical-Properties closure = DOUBLE CLUSTER CLOSURE session (7th + 8th cluster closures). 1 new math-tools stub (`power_function_T_fourth`). Cross-cluster T20+T25 = 4 bidirectional edges, 9th Stage-4 density-rule validation.*
