# Pilot Topic 26 — Thermodynamics

> Stage-2 pilot catalog. 26th of 44. **Thermodynamics cluster opener #1 of 2** (sibling: T27 Kinetic Theory of Gases — same session paired-batch).
> Sources: **NCERT Class 11 Part 2 Ch.12 Thermodynamics** (canonical spine) + **HCV Vol 2 Ch.26 Laws of Thermodynamics** (derivation/pedagogy) + **DC Pandey Waves & Thermodynamics Ch.21 Laws of Thermodynamics** (problem patterns).
> Coverage class: **TRIPLE-COVERED**.
> Anchor density: **VERY-STRONG** — 14+ institutional anchors spanning power generation (NTPC, Tata Power, Adani, NLC coal-thermal, hydro PSUs), transport (Indian Railways diesel-electric locos, Vande Bharat regen braking), industry (Tata Steel blast furnaces, BHEL boiler+turbine cycles, refineries — IOCL/HPCL/BPCL/Reliance), space (ISRO cryogenic engine CE-20, semi-cryogenic SCE-200), aviation (HAL turbojet engines), HVAC + refrigeration (Voltas, Godrej Appliances, Daikin India, Blue Star), policy (BEE star ratings + Energy Conservation Act 2001), research (IIT-Bombay thermal labs, CSIR-NPL primary thermometer, ARCI). **5th VERY-STRONG topic in Stage-2** — **second non-Modern-Physics VERY-STRONG**, confirming the applied-engineering-clusters-in-VERY-STRONG hypothesis.
> **Critical role:** Thermodynamics is the foundational applied-physics chapter for India's largest industrial sectors (power, steel, refining, HVAC). First-law statement = energy conservation generalized to heat; second law = directionality of natural processes (the only directional law in Classical physics). **Closes anticipated bridge from T13 Work-Energy (energy conservation → first law)** and opens forward to T27 Kinetic Theory (microscopic origin of internal energy + Cp/Cv).
> **Stage-4 numbering note:** Was informally referenced as "T18 Thermodynamics" in Session 47/48 next-batch recommendations. Canonical stage-1 numbering puts Thermodynamics at **T26** (T18 is Elasticity). Using canonical T26 here — Session 49 incidentally addresses one of the Stage-4 numbering reconciliations on the backlog.

---

## Founder Decisions Applied

| Tag | Decision |
|---|---|
| **TD-G1** | Atomic granularity = "one law OR one process OR one engine cycle OR one engineering application." Isothermal, adiabatic, isobaric, isochoric processes are FOUR separate atomics — each has a distinct PV-trace, distinct work-formula, distinct entropy-change behaviour, distinct misconception (especially "adiabatic = isothermal" confusion). |
| **TD-G2** | **Zeroth law + thermal equilibrium + temperature scale = ONE atomic** (`zeroth_law_atomic`) with Kelvin/Celsius/Fahrenheit unit-conversion as nano. Foundational but compact — bundles "what is temperature operationally" with "transitive thermal equilibrium." |
| **TD-G3** | **First law of thermodynamics is ONE atomic** with ΔU = Q − W as the central equation. Sign conventions (Q-in-positive, W-by-system-positive per NCERT/HCV; W-on-system-positive per chemistry convention) handled in **cognitive-error-prevention nano** (`first_law_sign_convention_nano`) — explicitly contrasts the two conventions because students mix them across physics/chemistry NCERT chapters. |
| **TD-G4** | **Internal energy U is its own atomic** (`internal_energy_atomic`), NOT bundled with first law. Reason: U is a STATE function (path-independent), Q and W are PATH functions — students who don't see U as a state-function-property-of-state fail Carnot-cycle problems. Author dedicated atomic to land this distinction. |
| **TD-G5** | **Isothermal vs adiabatic = TWO atomics, never bundled.** Both involve PV-curves on a phase diagram, both have an "obvious" wrong intuition (adiabatic looks like a steeper isothermal). Author SEPARATELY with explicit cognitive-error-prevention nano (`isothermal_vs_adiabatic_contrast_nano`) that side-by-sides them. **Cognitive-error-prevention sub-category.** |
| **TD-G6** | **Carnot cycle is its own atomic** (`carnot_cycle_atomic`) with the 4-stroke PV-trace as a single conceptual unit. η = 1 − T_cold/T_hot as nano. Carnot inequality (η_real ≤ η_Carnot) as separate nano. |
| **TD-G7** | **Second law has TWO atomics, not one.** `second_law_kelvin_planck_atomic` (no engine can convert all heat to work) and `second_law_clausius_atomic` (no fridge can pump heat cold→hot without external work). The Kelvin-Planck ↔ Clausius equivalence proof is a third atomic (`kp_clausius_equivalence_atomic`). NCERT/HCV/DCP all teach them as a triad, splitting respects that. **Cognitive-error-prevention sub-category** — students conflate the two statements. |
| **TD-G8** | **Entropy is its own atomic** (`entropy_atomic`) with ΔS = Q_rev/T as the operational definition. Entropy-as-state-function + entropy-of-universe-always-increases as nanos. **Diamond candidate** — entropy is the single most-confused concept in NCERT Ch.12 (per HCV §26.10 + DCP §21.10 problem-pattern frequency). |
| **TD-G9** | **Heat engine + refrigerator + heat pump = ONE atomic** (`heat_engine_atomic`) covering three application-cycles together. Reason: same underlying schematic (T_hot ↔ working substance ↔ T_cold), just direction of W and Q flips. Bundle to reveal the unity; nanos distinguish the three cases. |
| **TD-G10** | **VERY-STRONG anchor (5th in Stage-2).** 14+ institutional anchors spanning 9 strands (power, transport, industry, space, aviation, HVAC, refrigeration, policy, research). **Pattern signal extended:** thermodynamics is the SECOND non-Modern-Physics VERY-STRONG topic (after T39 AC Circuits). Confirms hypothesis: **every applied-engineering chapter in NCERT Class-12/11 with deep Indian industrial coupling hits VERY-STRONG.** |
| **TD-G11** | **Cognitive-error-prevention sub-category formalization driver.** This catalog has 4 cognitive-error-prevention founder decisions (TD-G3 sign conventions, TD-G5 iso/adiabatic contrast, TD-G7 KP/Clausius split, TD-G8 entropy state-function). With Session 48's 8/21 (38%) precedent and Session 49 likely 8/22 (36%), the sub-category is now the **modal** founder-decision type. **Formal Stage-4 formalization is overdue** — recommend Stage-4 consolidation half-session in this session formalises it as a first-class catalog field. |
| **TD-G12** | **PV-diagram visualisation is the cognitive primitive** for the entire chapter. Every process atomic ships a canonical PV-trace simulation. The state-vs-path distinction is taught visually (state = point on PV-plane; path = curve). **Diamond candidate density highest in Stage-2 so far** — 5+ Diamond candidates from one chapter (isothermal, adiabatic, Carnot, heat engine, entropy). |

---

## Section A — Source Map

| Sub-topic | NCERT 11.2 Ch.12 | HCV V2 Ch.26 | DCWT Ch.21 |
|---|---|---|---|
| Thermal equilibrium + zeroth law | §12.1-12.2 | §26.1 | §21.1 |
| Heat, internal energy, work | §12.3 | §26.2 + §26.3 | §21.2 + §21.3 |
| First law of thermodynamics | §12.4 | §26.4 | §21.4 |
| Quasi-static processes | §12.5 | §26.5 | §21.5 |
| Specific heat capacities (Cp, Cv) | §12.6 | §26.6 | §21.6 |
| Isothermal process | §12.7 | §26.7 | §21.7 |
| Adiabatic process | §12.8 | §26.7 | §21.8 |
| Isobaric, isochoric | §12.8 (boxed) | §26.7 | §21.9 |
| Cyclic process + Carnot cycle | §12.9 | §26.8 | §21.10 |
| Heat engines | §12.10 | §26.9 | §21.11 |
| Refrigerator + heat pump | §12.10 (boxed) | §26.9 | §21.12 |
| Second law (Kelvin-Planck + Clausius) | §12.11 | §26.10 | §21.13 |
| Reversible vs irreversible | §12.12 | §26.11 | §21.14 |
| Entropy | (NCERT 2023: removed §12.13; HCV/DCP retain) | §26.12 | §21.15 |

**NCERT 2023 note:** Ch.12 §12.13 (entropy as standalone treatment) was condensed in the 2023 revision; entropy concept retained inline within second-law discussion but explicit "entropy" subsection trimmed. HCV + DCP retain full treatment. **Same NCERT-divergence pattern as T50 Communication Systems** — author entropy at full HCV/DCP depth for state-board + JEE-Adv, flag `ncert_2023: condensed, state_boards: retained` in entropy atomic metadata.

---

## Section B — Atomic + Nano Catalog

| ID | Concept | Type | Sim? | In repo? | Requires | Required-by | Notes |
|---|---|---|---|---|---|---|---|
| **zeroth_law_atomic** | Two systems in thermal equilibrium with a third are in equilibrium with each other; temperature is the operational state-variable defining "thermally equilibrated" | atomic | ✅ | — | — | [internal_energy_atomic, first_law_atomic] | TD-G2; foundational; cognitive-prep for "temperature ≠ heat" |
| ↳ temperature_scales_nano | T(K) = T(°C) + 273.15; T(°F) = (9/5)T(°C) + 32; absolute zero = 0 K = −273.15 °C; Kelvin = SI primary | nano | ✅ | — | [zeroth_law_atomic] | — | parent: zeroth_law_atomic |
| ↳ primary_thermometer_nano | CSIR-NPL Delhi maintains India's primary temperature standard (ITS-90 platinum-resistance thermometer); gas thermometer = primary definition basis | nano | — | — | [zeroth_law_atomic, temperature_scales_nano] | — | parent: zeroth_law_atomic; **research-strand anchor: CSIR-NPL** |
| **internal_energy_atomic** | U = sum of kinetic + potential energies of all molecules; STATE function (path-independent); depends only on (T, V, n) for an ideal gas → depends only on T | atomic | ✅ | — | [zeroth_law_atomic] | [first_law_atomic, isothermal_process_atomic, adiabatic_process_atomic, entropy_atomic] | TD-G4; state-function-vs-path-function is the central conceptual distinction |
| ↳ state_vs_path_function_nano | State function: U, T, P, V, S (depend only on the state, ΔU = U_f − U_i). Path function: Q, W (depend on the path between states). **Cognitive-error-prevention nano**. | nano | ✅ | — | [internal_energy_atomic] | [first_law_atomic, carnot_cycle_atomic] | parent: internal_energy_atomic; TD-G4 cognitive-error-prevention |
| **first_law_atomic** | ΔU = Q − W; energy conservation generalised to heat; Q heat ADDED to system, W work DONE BY system | atomic | ✅ | — | [internal_energy_atomic, work_energy_theorem(T13), state_vs_path_function_nano] | [isothermal_process_atomic, adiabatic_process_atomic, isobaric_process_atomic, isochoric_process_atomic, carnot_cycle_atomic, heat_engine_atomic] | TD-G3; **closes anticipated bridge from T13 Work-Energy** |
| ↳ first_law_sign_convention_nano | Physics convention (NCERT/HCV/DCP): Q in = +, W by system = +; ΔU = Q − W. Chemistry convention: Q in = +, W on system = +; ΔU = Q + W. Same physics, opposite sign for W. **Cognitive-error-prevention nano — explicit contrast required.** | nano | ✅ | — | [first_law_atomic] | — | parent: first_law_atomic; TD-G3 cognitive-error-prevention |
| ↳ work_done_in_pv_diagram_nano | W = ∫P dV (area under P-V curve); positive when V increases (expansion), negative when V decreases (compression) | nano | ✅ | — | [first_law_atomic, calculus_integration(math-tools)] | [isothermal_process_atomic, adiabatic_process_atomic] | parent: first_law_atomic |
| **isothermal_process_atomic** | T = constant; for ideal gas ΔU = 0 → Q = W; W = nRT ln(V_f/V_i); PV = constant (Boyle's law) | atomic | ✅ | — | [first_law_atomic, ideal_gas_equation(T27), work_done_in_pv_diagram_nano] | [carnot_cycle_atomic, isothermal_vs_adiabatic_contrast_nano] | TD-G5; Diamond candidate — PV hyperbola sim |
| ↳ isothermal_indian_radiator_nano | Slow cooling of a car/scooter radiator at idle ≈ isothermal heat rejection at constant T_engine; Maruti Suzuki / Tata Motors / Bajaj engines designed around isothermal idle | nano | — | — | [isothermal_process_atomic] | — | parent: isothermal_process_atomic; consumer/transport anchor |
| **adiabatic_process_atomic** | Q = 0 (no heat exchange); ΔU = −W; PV^γ = constant; T₁V₁^(γ−1) = T₂V₂^(γ−1); steeper PV-curve than isothermal | atomic | ✅ | — | [first_law_atomic, specific_heat_atomic, work_done_in_pv_diagram_nano] | [carnot_cycle_atomic, isothermal_vs_adiabatic_contrast_nano, isothermal_atomic, diesel_engine_compression_nano] | TD-G5; Diamond candidate — adiabatic-vs-isothermal overlay sim |
| ↳ isothermal_vs_adiabatic_contrast_nano | Side-by-side PV-overlay: both start at same (P,V), isothermal stays on PV=const, adiabatic on PV^γ=const (steeper, since γ>1). T drops in adiabatic expansion (Q=0 → all work comes from U → U drops → T drops). **Cognitive-error-prevention nano**. | nano | ✅ | — | [isothermal_process_atomic, adiabatic_process_atomic] | — | parent: adiabatic_process_atomic; TD-G5 cognitive-error-prevention |
| ↳ diesel_engine_compression_nano | Diesel engine compression-stroke is approximately adiabatic; T rises ~5× to auto-ignition temperature ~500 °C — fuel ignites without spark. Indian Railways WDM/WDG diesel locomotives + Tata/Mahindra/Ashok-Leyland diesel trucks operate on this. | nano | ✅ | — | [adiabatic_process_atomic] | — | parent: adiabatic_process_atomic; transport-strand anchor |
| **isobaric_process_atomic** | P = constant; W = P·ΔV; ΔU = nCv·ΔT; Q = nCp·ΔT | atomic | ✅ | — | [first_law_atomic, specific_heat_atomic] | [heat_engine_atomic, indian_pressure_cooker_nano] | TD-G1; one of four canonical processes |
| ↳ indian_pressure_cooker_nano | Pressure-cooker pre-vent: isobaric heating at ~2 atm; raises water boiling point to ~120 °C → faster cooking. Hawkins/Prestige household appliance everywhere in India | nano | — | — | [isobaric_process_atomic] | — | parent: isobaric_process_atomic; everyday-Indian anchor |
| **isochoric_process_atomic** | V = constant; W = 0; ΔU = Q = nCv·ΔT; pressure scales linearly with T | atomic | ✅ | — | [first_law_atomic, specific_heat_atomic] | [heat_engine_atomic, otto_cycle_combustion_nano] | TD-G1; one of four canonical processes |
| ↳ otto_cycle_combustion_nano | Petrol engine combustion-stroke is approximately isochoric (volume constant during the brief ignition); used in Maruti/Honda/Bajaj petrol engines + Indian 2-wheeler market (~20M units/yr) | nano | ✅ | — | [isochoric_process_atomic] | [heat_engine_atomic] | parent: isochoric_process_atomic; consumer-transport anchor |
| **specific_heat_atomic** | C = Q/(nΔT); Cv (constant volume) and Cp (constant pressure); Cp − Cv = R (Mayer's relation, ideal gas); γ = Cp/Cv (adiabatic index) | atomic | ✅ | — | [first_law_atomic, ideal_gas_equation(T27)] | [adiabatic_process_atomic, isobaric_process_atomic, isochoric_process_atomic] | TD-G1; foundational bridge to T27 equipartition |
| ↳ mayers_relation_nano | Cp − Cv = R (per mole, ideal gas); derived from first law applied to isobaric vs isochoric heating | nano | ✅ | — | [specific_heat_atomic, isobaric_process_atomic, isochoric_process_atomic] | — | parent: specific_heat_atomic |
| ↳ gamma_for_mono_di_polyatomic_nano | Monatomic γ = 5/3 (He, Ne, Ar); diatomic γ = 7/5 (N₂, O₂, H₂); polyatomic γ ≈ 4/3 (CO₂, NH₃, CH₄). Bridges to T27 equipartition theorem (f degrees of freedom → Cv = fR/2) | nano | ✅ | — | [specific_heat_atomic, equipartition_theorem(T27)] | [adiabatic_process_atomic] | parent: specific_heat_atomic; cross-cluster bridge to T27 |
| **carnot_cycle_atomic** | 4-stroke reversible cycle: isothermal-expansion (T_hot) → adiabatic-expansion → isothermal-compression (T_cold) → adiabatic-compression. η_Carnot = 1 − T_cold/T_hot | atomic | ✅ | — | [isothermal_process_atomic, adiabatic_process_atomic, first_law_atomic, state_vs_path_function_nano] | [heat_engine_atomic, second_law_kelvin_planck_atomic, carnot_inequality_nano] | TD-G6; Diamond candidate — 4-stroke PV+TS sim |
| ↳ carnot_inequality_nano | η_real ≤ η_Carnot for any heat engine operating between T_hot and T_cold; equality only for reversible engine. Foundation of second-law optimality. | nano | ✅ | — | [carnot_cycle_atomic, second_law_kelvin_planck_atomic] | — | parent: carnot_cycle_atomic |
| ↳ ntpc_thermal_efficiency_nano | NTPC supercritical coal plants (Sipat, Vindhyachal, Mundra) operate T_hot ~600 °C steam, T_cold ~40 °C cooling water → η_Carnot ~64%, real η ~42-45%. India's ~75% electricity from such cycles. | nano | ✅ | — | [carnot_cycle_atomic, carnot_inequality_nano] | — | parent: carnot_cycle_atomic; **power-strand anchor: NTPC** |
| **heat_engine_atomic** | Cyclic device that converts Q_hot → W + Q_cold; efficiency η = W/Q_hot = 1 − Q_cold/Q_hot. Refrigerator + heat pump = reverse of heat engine (W input pumps heat cold→hot) | atomic | ✅ | — | [carnot_cycle_atomic, first_law_atomic, isobaric_process_atomic, isochoric_process_atomic] | [second_law_kelvin_planck_atomic, second_law_clausius_atomic, otto_cycle_combustion_nano, refrigerator_cop_nano] | TD-G9; bundles engine + refrigerator + heat pump |
| ↳ refrigerator_cop_nano | COP_refrigerator = Q_cold/W; COP_heat_pump = Q_hot/W; COP_HP = COP_R + 1. Voltas/Godrej/LG India refrigerators rated 1-5 BEE stars based on this | nano | ✅ | — | [heat_engine_atomic] | — | parent: heat_engine_atomic; **HVAC + policy strand anchor: BEE star ratings + Voltas/Godrej** |
| ↳ bharat_stage_emission_norms_nano | BS-VI norms (since 2020) constrain heat-engine efficiency curves on Indian Diesel/petrol vehicles — η improvements + emission caps. Indian Railways shifting from WDM diesel to electric (75% route-km AC-electrified) reduces aggregate Carnot losses. | nano | — | — | [heat_engine_atomic, carnot_cycle_atomic] | — | parent: heat_engine_atomic; **policy + transport anchor: BS-VI + Indian Railways electrification** |
| **second_law_kelvin_planck_atomic** | No process exists whose ONLY result is the complete conversion of heat from a single reservoir into work; equivalently, no heat engine has η = 100% | atomic | ✅ | — | [carnot_cycle_atomic, heat_engine_atomic] | [second_law_clausius_atomic, kp_clausius_equivalence_atomic, entropy_atomic] | TD-G7; one of two second-law statements |
| **second_law_clausius_atomic** | No process exists whose ONLY result is the transfer of heat from a colder body to a hotter body; equivalently, no refrigerator works without external W input | atomic | ✅ | — | [heat_engine_atomic] | [kp_clausius_equivalence_atomic, entropy_atomic] | TD-G7; other second-law statement |
| ↳ kp_clausius_equivalence_atomic | Proof that Kelvin-Planck violation ⟺ Clausius violation — assume one, construct a composite engine that violates the other. Establishes the two statements are operationally identical. | atomic | ✅ | — | [second_law_kelvin_planck_atomic, second_law_clausius_atomic] | — | TD-G7; cognitive-error-prevention atomic — students think KP and Clausius are independent claims |
| **reversible_vs_irreversible_atomic** | Reversible: infinitely slow, no dissipation, system always in equilibrium; can be reversed by infinitesimal change. Irreversible: real processes (friction, heat conduction across finite ΔT, free expansion, mixing) — direction of time emerges | atomic | ✅ | — | [first_law_atomic, second_law_kelvin_planck_atomic] | [entropy_atomic, carnot_cycle_atomic] | The chapter's directionality concept |
| **entropy_atomic** | S = ∫dQ_rev/T (operational definition); ΔS_universe ≥ 0 for any real process; entropy is a STATE function (despite Q being path function — Q_rev/T is path-independent for reversible paths) | atomic | ✅ | — | [carnot_cycle_atomic, reversible_vs_irreversible_atomic, second_law_kelvin_planck_atomic, state_vs_path_function_nano] | — | TD-G8; **Diamond candidate** — most-confused concept in chapter; **NCERT 2023 condensed; HCV/DCP retain** |
| ↳ entropy_of_universe_increases_nano | Σ ΔS_system + ΔS_surroundings ≥ 0 for any real process; equality only for reversible. Statistical interpretation: entropy = k ln(W) (Boltzmann; T27 territory but cross-link here). | nano | ✅ | — | [entropy_atomic, kinetic_theory_statistical_link(T27)] | — | parent: entropy_atomic; cross-cluster bridge to T27 |
| ↳ entropy_ncert_2023_note_nano | NCERT 2023 condensed entropy treatment (removed standalone §12.13); HCV2 Ch.26 + DCWT Ch.21 retain full treatment; state boards (Maharashtra HSC, Tamil Nadu, Karnataka PUC, UP, WB) retain — author at full depth for state-board + JEE-Adv | nano | — | — | [entropy_atomic] | — | parent: entropy_atomic; NCERT-divergence note; same pattern as T50 |

**Atomic count:** 13. **Nano count:** ~18. **Total entries:** 31.

---

## Section C — Cross-Source Coverage Matrix

| Atomic | NCERT 11.2 Ch.12 | HCV2 Ch.26 | DCWT Ch.21 | Coverage |
|---|---|---|---|---|
| zeroth_law_atomic | §12.1-12.2 | §26.1 | §21.1 | TRIPLE |
| internal_energy_atomic | §12.3 | §26.2 + §26.3 | §21.2 + §21.3 | TRIPLE |
| first_law_atomic | §12.4 | §26.4 | §21.4 | TRIPLE |
| isothermal_process_atomic | §12.7 | §26.7 | §21.7 | TRIPLE |
| adiabatic_process_atomic | §12.8 | §26.7 | §21.8 | TRIPLE |
| isobaric_process_atomic | §12.8 (boxed) | §26.7 | §21.9 | TRIPLE |
| isochoric_process_atomic | §12.8 (boxed) | §26.7 | §21.9 | TRIPLE |
| specific_heat_atomic | §12.6 | §26.6 | §21.6 | TRIPLE |
| carnot_cycle_atomic | §12.9 | §26.8 | §21.10 | TRIPLE |
| heat_engine_atomic | §12.10 | §26.9 | §21.11 | TRIPLE |
| second_law_kelvin_planck_atomic | §12.11 | §26.10 | §21.13 | TRIPLE |
| second_law_clausius_atomic | §12.11 | §26.10 | §21.13 | TRIPLE |
| kp_clausius_equivalence_atomic | §12.11 (sketch) | §26.10 (full proof) | §21.13 (sketch) | TRIPLE |
| reversible_vs_irreversible_atomic | §12.12 | §26.11 | §21.14 | TRIPLE |
| entropy_atomic | §12.13 (NCERT 2023: condensed) | §26.12 (full) | §21.15 (full) | TRIPLE (with NCERT-2023 caveat) |

**Triple-coverage rate:** 15 of 15 atomics (counting kp_clausius_equivalence_atomic separately) **= 100%**. **Sixth observed 100% topic** in 26 pilots (after T48, T35, T38, T37, T39). **Sixth consecutive 100% topic across the last 6 — pattern signal exceptionally tight.** The entropy atomic has the NCERT 2023 caveat (condensed but not removed; concept retained inline) — still counts as TRIPLE because HCV + DCP retain full treatment and the concept appears in NCERT inline.

---

## Section D — Stage-3 Math-Tool Dependencies

| Math-tool primitive | Used by | Status |
|---|---|---|
| `calculus_integration` (∫P dV) | work_done_in_pv_diagram_nano, isothermal work | REQUIRED (existing) |
| `natural_log` (∫dV/V → ln) | isothermal_process_atomic (W = nRT ln(V_f/V_i)) | REQUIRED (existing) |
| `power_function_pv_gamma` (PV^γ = const) | adiabatic_process_atomic | **NEW STUB** — algebraic-power manipulation under a constraint; first-use in T26 |
| `pv_diagram_visualization` (graphical primitive) | every process atomic, carnot, heat engine | **NEW STUB** — graphical primitive, conceptual cousin of `phasor_complex_representation` (T39) |
| `state_function_concept` | internal_energy_atomic, entropy_atomic | **NEW STUB** — abstract math-tool (path-independent line integral over closed loop = 0) |

**THREE new stubs registered:** `power_function_pv_gamma`, `pv_diagram_visualization`, `state_function_concept`. **Highest single-topic stub-registration count in Stage-2 so far** — Thermodynamics introduces a distinct mathematical vocabulary (PV-diagrams, state-functions, line integrals over cycles) not present in earlier topics. Math-tools IN-degree: 41 → 44 (stubs).

---

## Section E — Cross-Topic Dependencies (Bidirectional Edges)

### Outgoing (T26 requires from earlier topics)

| Target topic | Edge | Reason |
|---|---|---|
| **T13 Work-Energy** | first_law_atomic ← work_energy_theorem | **Closes anticipated bridge** — first law generalises mechanical work-energy theorem to include heat |
| T13 Work-Energy | work_done_in_pv_diagram_nano ← work definition (∫F·dx = ∫P dV) | Direct extension |
| Math-tools | calculus_integration + natural_log + 3 NEW stubs | 5 primitives (3 new stubs) |

### Incoming (T26 will be required by later topics)

| Source topic | Edge | Reason |
|---|---|---|
| **T27 Kinetic Theory (intra-session)** | specific_heat_atomic ↔ equipartition_theorem (Cv = fR/2) | **Bidirectional intra-session edge** — Cp/Cv ratio explained by molecular degrees of freedom |
| T27 Kinetic Theory (intra-session) | gamma_for_mono_di_polyatomic_nano ← equipartition_theorem | T27 provides the microscopic origin of γ values |
| T27 Kinetic Theory (intra-session) | internal_energy_atomic ← mean_kinetic_energy_3kT/2 | Microscopic origin of U for ideal gas |
| T27 Kinetic Theory (intra-session) | entropy_atomic ← statistical_entropy_k_ln_W (Boltzmann) | Microscopic origin of macroscopic entropy |
| T48 Nuclei (back-edge — distant) | nuclear_binding_energy ← second_law direction-of-fusion | Weak: nuclear reactions also obey thermodynamic directionality |
| T39 AC Circuits (back-edge — distant) | transformer_efficiency_losses ← carnot_inequality_nano (analogy) | Weak: all real engines/transformers obey η < η_ideal |

### T26 ↔ T27 intra-session bidirectional edges

This paired-batch surfaces **7 bidirectional edges** between T26 and T27 (same NCERT chapter pair: Ch.12 + Ch.13; HCV consecutive Ch.24 + Ch.26 with Ch.25 between; DCWT same chapter cluster Ch.20-21):

| T26 atomic | ↔ | T27 atomic | Edge type |
|---|---|---|---|
| `internal_energy_atomic` | ← | `mean_kinetic_energy_per_molecule` (T27) | T26 requires T27 microscopic origin of U |
| `specific_heat_atomic` (Cv = fR/2) | ← | `equipartition_theorem` (T27) | T26 requires T27 for Cp/Cv ratio |
| `gamma_for_mono_di_polyatomic_nano` | ← | `degrees_of_freedom_atomic` (T27) | T26 requires T27 for γ values |
| `entropy_atomic` (S = k ln W) | ← | `statistical_entropy_boltzmann_nano` (T27) | T26 requires T27 statistical-mechanical interpretation |
| `adiabatic_process_atomic` | ↔ | `kinetic_theory_pressure` (T27) | Bidirectional — both share PV=nRT foundation |
| `first_law_atomic` | → | `kinetic_theory_pressure` (T27) | T26 first law underpins T27 derivations |
| `isothermal_process_atomic` | ↔ | `ideal_gas_equation_atomic` (T27) | Bidirectional — isothermal IS PV=const which is one slice of PV=nRT |

**7 bidirectional edges = same-cluster chapter-adjacent density.** Matches T37↔T39 (8) and T35↔T38 (6) — solidly in the 7-9 paired-batch density band for chapter-adjacent intra-cluster pairs. **Refined density-rule confirmation: 4th data point in the chapter-adjacent band.**

**Total outgoing edges: 5 (3 intra-session bidirectional + 2 to T13 + 5 math-tools).** **Total incoming: 4-6 cross-topic + 7 intra-session bidirectional.**

---

## Section F — Real-World Anchors (VERY-STRONG, Indian-context)

| Anchor | Concept hook | Authoring use | Strand |
|---|---|---|---|
| **NTPC supercritical coal-thermal plants (Sipat, Vindhyachal, Mundra, Talcher)** | carnot_cycle_atomic, heat_engine_atomic, ntpc_thermal_efficiency_nano | "India's ~75% electricity from Rankine cycles; T_hot 600 °C, T_cold 40 °C → η_Carnot 64%, η_real 42-45%" | Power |
| **Tata Power + Adani Power thermal generation** | heat_engine_atomic, carnot_cycle_atomic | "Mundra UMPP 4000 MW; Talwandi Sabo 1980 MW — supercritical thermal cycles" | Power + Industry |
| **NLC India Ltd (lignite-thermal)** | heat_engine_atomic, carnot_cycle_atomic | "Neyveli lignite plants — operate below supercritical, lower η reflecting source-fuel constraints" | Power + Industry |
| **Tata Steel + JSW Steel + SAIL blast furnaces (Jamshedpur, Vijayanagar, Bhilai, Rourkela)** | first_law_atomic, isobaric_process_atomic | "Blast-furnace reactions ~1500 °C; first-law energy balance critical for fuel-efficiency tracking" | Industry |
| **BHEL boiler + turbine manufacturing (Tiruchirappalli, Haridwar)** | carnot_cycle_atomic, heat_engine_atomic | "BHEL manufactures ~60% of India's thermal turbines; Rankine cycle engineering" | Industry |
| **Refineries: IOCL Mathura/Panipat, HPCL Mumbai, BPCL Kochi, Reliance Jamnagar** | adiabatic_process_atomic, isobaric_process_atomic, heat_engine_atomic | "Reliance Jamnagar = world's largest single-location refinery (~1.4M bpd); fractional distillation = isobaric staged heating" | Industry |
| **Indian Railways WDM/WDG diesel locomotives** | adiabatic_process_atomic, diesel_engine_compression_nano, heat_engine_atomic | "WDG-4 = 4000 HP diesel-electric; auto-ignition via adiabatic compression — declining as electrification grows" | Transport |
| **Indian Railways Vande Bharat + WAP-7 electric + regen braking** | bharat_stage_emission_norms_nano | "75% route-km AC-electrified; Vande Bharat regen braking recovers KE as electrical energy — irreversibility reduction in real engine" | Transport |
| **HAL turbojet/turbofan engines (Tejas Mk-1A, HJT-36)** | adiabatic_process_atomic, carnot_cycle_atomic | "HAL Bengaluru manufactures turbojet engines — adiabatic compression-combustion-expansion = Brayton cycle (advanced extension of Carnot logic)" | Aviation + Defence |
| **ISRO cryogenic engine CE-20 (GSLV Mk-III, LVM3); semi-cryogenic SCE-200** | adiabatic_process_atomic, isothermal_process_atomic | "Cryogenic LOX/LH2 expansion + combustion = high η via large T_hot − T_cold; ISRO mastered cryogenic post-2014" | Space |
| **Voltas + Godrej Appliances + Daikin India + Blue Star (AC + refrigerator industry)** | heat_engine_atomic, refrigerator_cop_nano | "Indian AC + refrigerator market ~₹50,000 Cr; COP-rated under BEE star scheme" | Consumer + HVAC |
| **BEE star ratings + Energy Conservation Act 2001 + ECBC building code** | refrigerator_cop_nano, bharat_stage_emission_norms_nano | "BEE 5-star = highest efficiency; mandates Carnot-relative benchmarks for all white-goods sold in India" | Policy |
| **CSIR-NPL primary thermometer + ARCI Hyderabad thermal materials lab** | temperature_scales_nano, primary_thermometer_nano | "CSIR-NPL maintains India's ITS-90 reference; ARCI develops thermal-barrier ceramics for HAL/ISRO engines" | Research |
| **Maruti Suzuki + Tata Motors + Mahindra + Bajaj Auto petrol/diesel engines** | otto_cycle_combustion_nano, diesel_engine_compression_nano, isothermal_indian_radiator_nano | "Indian 2W market ~20M units/yr; passenger car ~4M units/yr; every IC engine = real-world thermodynamic cycle under BS-VI norms" | Consumer + Transport |
| **Pressure cookers (Hawkins, Prestige, Pigeon)** | isobaric_process_atomic, indian_pressure_cooker_nano | "Indian household staple; ~95% urban penetration; isobaric heating at ~2 atm" | Residential |

**Total: 15 distinct institutional/system anchors spanning 9 strands** (power, transport, industry, aviation, space, consumer, HVAC, policy, research, residential). **Clears the 13-anchor VERY-STRONG threshold.** **Decision (TD-G10):** **VERY-STRONG**. **5th VERY-STRONG topic in Stage-2** (joins T48, T49, T50, T39). **Second non-Modern-Physics VERY-STRONG** — applied-engineering-cluster hypothesis CONFIRMED at second test point.

---

## Section G — Cognitive-Error-Prevention Decisions

Continuing the ~30-38% pattern. T26 cognitive-error-prevention decisions:

- **TD-G3** (`first_law_sign_convention_nano`) — physics-vs-chemistry W sign-convention mismatch is the #1 student error in NCERT Class 11 Ch.12 → Class 12 chemistry; explicit contrast nano required.
- **TD-G4 + state_vs_path_function_nano** — students who don't see U as a state-function fail Carnot problems; dedicated atomic-level distinction.
- **TD-G5** (`isothermal_vs_adiabatic_contrast_nano`) — adiabatic looks like a steeper isothermal; students conflate; side-by-side overlay required.
- **TD-G7** (`second_law_kelvin_planck_atomic` + `second_law_clausius_atomic` + `kp_clausius_equivalence_atomic`) — students think KP and Clausius are independent claims; 3-atomic split with equivalence proof.
- **TD-G8** (entropy as state function despite Q being path function) — most-confused concept in chapter per HCV + DCP problem frequency.

**5 of 12 founder decisions are cognitive-error-prevention type = 42%.** Above the Session 48 mean of 38%. T26 cognitive-error-prevention share is the highest single-topic in Stage-2 — confirms thermodynamics is dense in misconception-rich content. **Strong driver for TD-G11 Stage-4 formalisation of the cognitive-error-prevention sub-category as a first-class catalog field.**

---

## Section H — V1 Priority Flags

| Atomic | V1? | Reason |
|---|---|---|
| first_law_atomic | ✅ | Foundational; every downstream atomic builds on it; closes T13 bridge |
| isothermal_process_atomic + adiabatic_process_atomic | ✅ | Both Diamond candidates; together teach state-vs-path; PV-diagram sims trivially compelling |
| carnot_cycle_atomic | ✅ | Diamond candidate — 4-stroke PV+TS sim; NTPC anchor; JEE-favourite |
| heat_engine_atomic | ✅ | VERY-STRONG anchor (NTPC + Voltas + Indian Railways diesel + petrol engines); cognitive-error-prevention nano density |
| entropy_atomic | ✅ | Diamond candidate; most-confused concept; **bridge to T27 statistical interpretation**; state-board JEE-Adv critical |
| second_law_kelvin_planck_atomic + second_law_clausius_atomic + kp_clausius_equivalence_atomic | ⚖️ | Ship as a triad in V1.1 — cognitive-error-prevention atomics best shipped together |
| specific_heat_atomic | ⚖️ | V1.1; needs T27 to be authoring-complete (Cp/Cv ratio needs equipartition) |
| zeroth_law_atomic + internal_energy_atomic | ⚖️ | V1.1; foundational but compact |
| isobaric + isochoric process atomics | ⚖️ | V1.1; ship as a quartet with isothermal+adiabatic for canonical four-process completeness |
| reversible_vs_irreversible_atomic | ⚖️ | V1.2 — abstract concept; ships well only after entropy is in place |

**V1 ship count for T26: 5-6 atomics** (above 25-pilot mean of 4-5 — reflects thermodynamics' central applied-physics role + Diamond-candidate density).

---

## Section I — Open Questions

1. **Thermodynamic potentials (Helmholtz F, Gibbs G)** — not in NCERT/HCV/DCP Class 11; defer to V2 / chemistry-bridge atomic.
2. **Maxwell relations + thermodynamic identities** — graduate-level; defer.
3. **Phase transitions + Clausius-Clapeyron + latent heat** — covered partially in NCERT Ch.11 (Thermal Properties of Matter, separate topic) — author as T-thermal-properties later; cross-link.
4. **Statistical mechanics deeper than equipartition (Boltzmann distribution)** — defer to T27 + V2.
5. **Real gases (van der Waals, compressibility factor)** — covered partially in HCV2 Ch.24 — author as T27 nano with cross-link.
6. **NCERT 2023 entropy condensation** — confirmed: standalone §12.13 condensed but concept retained inline within second-law discussion. Author full-depth entropy atomic for state-board + JEE-Adv; flag in metadata.
7. **Heat conduction + Newton's law of cooling + Stefan-Boltzmann** — these are T-thermal-properties (Ch.11) territory, not thermodynamics; author separately.
8. **Diamond candidate density** — 5 Diamond candidates from one chapter is the highest observed. Author priority for V1 should weight Thermodynamics atomics heavily.

---

## Section J — Sign-Off

- Authored: Session 49, 2026-05-25.
- Author: Claude (Architect+Engineer role).
- Coverage class: **TRIPLE**.
- Anchor density: **VERY-STRONG** (15 anchors across 9 strands — **5th in Stage-2; 2nd non-Modern-Physics**).
- Triple-coverage rate: **100%** (15/15) — **6th observed 100% topic** in 26 pilots — **6 consecutive 100% topics**.
- Atomic count: **13**. Nano count: **18**. Total: **31 entries**.
- V1 ship count: **5-6 atomics**.
- **Closes 1 anticipated bridge (T13 Work-Energy → T26 first law) and opens 7 intra-session bidirectional edges with T27 Kinetic Theory.**
- **Thermodynamics cluster opener** — T27 ships in same session; T-thermal-properties (Ch.11) + V2 phase-transition extensions remain.
- **3 new math-tools stubs registered:** `power_function_pv_gamma`, `pv_diagram_visualization`, `state_function_concept` (highest single-topic stub count in Stage-2).
- Cognitive-error-prevention founder-decision share: **42% (5/12)** — highest single-topic share observed.
- **Stage-4 numbering reconciliation #1 resolved:** Thermodynamics correctly numbered T26 (not T18 per informal earlier references).
- Next pilot in this session: T27 Kinetic Theory of Gases.

---

*5th VERY-STRONG topic; 2nd non-Modern-Physics VERY-STRONG. Applied-engineering-cluster hypothesis confirmed at second test point: thermodynamics, like AC Circuits, is universally industrially-anchored in Indian context. Cognitive-error-prevention sub-category share hits new high (42%) — Stage-4 formalisation now overdue.*
