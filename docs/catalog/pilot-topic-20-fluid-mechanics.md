# Pilot Topic 20 — Fluid Mechanics / Mechanical Properties of Fluids

> Stage-2 pilot catalog. 32nd of 44. **Mechanical Properties cluster CLOSER** (2/2 — sibling T18 Elasticity opened Session 51). Paired with **T25 Thermal Properties** in Session 52 = **DOUBLE CLUSTER CLOSURE session** (T20 closes Mechanical Properties; T25 closes Thermodynamics).
> Sources: **NCERT Class 11 Part 2 Ch.10 Mechanical Properties of Fluids** (canonical spine; covers pressure/Pascal/Archimedes/continuity/Bernoulli/viscosity/surface-tension/capillarity in one chapter) + **HCV Vol 1 Ch.13 Fluid Mechanics** (Bernoulli/pressure pedagogy) + **HCV Vol 1 Ch.14 §14.9-end** (surface tension + viscosity — sibling to T18's §14.1-14.8) + **DC Pandey Mechanics Vol 2 Ch.16 Fluid Mechanics**.
> Coverage class: **TRIPLE-COVERED** (10th 100% topic if all-TRIPLE — see Section C).
> Anchor density: **VERY-STRONG** (per Stage-4 formalised criterion: anchor count ≥ 13 AND strand-diversity ≥ 8). 13 anchors × 8 strands (industry + healthcare + transport + aviation + research + space + agriculture + defence + consumer). **6th VERY-STRONG observation; 3rd non-Modern-Physics VERY-STRONG** (after T26 Thermo + the ISRO/medical-cluster modern physics topics). **First foundational-mechanics-cluster topic to break the STRONG plateau.**
> **Critical role:** Fluid mechanics is the chapter that BRIDGES Mechanics (T11-T17 rigid body + T18 solid deformation) to phenomenological continuum physics. Bernoulli's principle + Pascal's law + Archimedes' principle + viscosity + surface tension are universal-everyday and high-engineering-utility. **Closes T21 Wave Motion CT2 forward-edge anchor** (bulk_modulus_K already closed by T18; T20 adds density ρ for c = √(K/ρ) fluid wave speed). **Opens forward to T25 Thermal Properties** (thermal expansion of fluids = T25 territory; heat transfer convection requires T20 buoyancy).

---

## Founder Decisions Applied

| Tag | Decision |
|---|---|
| **FM-G1** | Atomic granularity = "one fluid-property OR one conservation-law OR one transport phenomenon." Pressure-in-fluid, Pascal's law, Archimedes' principle, continuity, Bernoulli, viscosity, surface tension, capillarity = SEVEN-EIGHT separate atomics. NCERT covers all in one chapter; we split per-principle for pedagogical clarity. |
| **FM-G2** | **Pascal's law is its own atomic** (`pascals_law_atomic`) — pressure applied at any point transmits undiminished to every point. **Diamond candidate** — hydraulic-lift visualisation is one of physics' most pedagogically powerful sims. **cognitive_error_target:** "pressure increases force proportionally to area" → no; pressure is identical, FORCE scales with area (F = PA). |
| **FM-G3** | **Archimedes' principle is its own atomic** (`archimedes_buoyancy_atomic`) — F_buoyant = ρ_fluid × V_displaced × g. **Diamond candidate** — floating/sinking/density-comparison sim. **cognitive_error_target:** "heavier objects sink" → no; objects denser than fluid sink; iron ship floats because hull-shape lowers effective density. |
| **FM-G4** | **Equation of continuity is its own atomic** (`continuity_equation_atomic`) — A₁v₁ = A₂v₂ for incompressible flow; mass-conservation in fluid. Prerequisite for Bernoulli. |
| **FM-G5** | **Bernoulli's principle is its own atomic** (`bernoullis_principle_atomic`) — P + ½ρv² + ρgh = constant along streamline. **Diamond candidate** — venturi + airfoil + atomiser sims. **cognitive_error_target:** "Bernoulli applies to any flow" → only incompressible + non-viscous + steady + along-streamline. |
| **FM-G6** | **Viscosity is its own atomic** (`viscosity_atomic`) — F = ηA(dv/dy); shear stress in fluid. Cross-link to T18 modulus_of_rigidity (solid analog). **cognitive_error_target:** "viscosity = thickness" → no; viscosity is rate-dependent shear resistance; honey at 80°C has lower η than at 20°C. |
| **FM-G7** | **Stokes' law + terminal velocity = ONE atomic** (`stokes_terminal_velocity_atomic`) — F_drag = 6πηrv; v_terminal = (2/9)·(ρ−σ)gr²/η. NCERT + DCM cover; HCV deeper. Industrial anchor: parachute design, raindrop terminal-v, sedimentation. |
| **FM-G8** | **Reynolds number is its own atomic** (`reynolds_number_atomic`) — Re = ρvD/η; dimensionless ratio inertial/viscous; laminar vs turbulent transition at Re ≈ 2000 for pipe flow. **cognitive_error_target:** "Re predicts flow type uniquely" → only approximately; transition zone Re 2000-4000 is mixed. |
| **FM-G9** | **Surface tension is its own atomic** (`surface_tension_atomic`) — T = F/L; energy per area. **Diamond candidate** — droplet/insect-on-water/soap-film sim. **cognitive_error_target:** "surface tension causes everything floating-related" → no; only small objects where surface tension force >> weight (water strider, but NOT a ship). |
| **FM-G10** | **Capillary rise/depression is its own atomic** (`capillary_action_atomic`) — h = 2T cosθ / (ρgr). Cross-link to surface_tension_atomic. **Industrial + agricultural anchor:** soil water uptake, plant xylem, capillary fabric design, paper chromatography. |
| **FM-G11** | **VERY-STRONG anchor (formalised Stage-4 criterion)** — 13 anchors × 8 strands (industry + healthcare + transport + aviation + research + space + agriculture + defence + consumer). **First foundational-mechanics topic to reach VERY-STRONG.** Drivers: medical-hydraulics (BP monitors, syringes, IV drips), aviation lift (Bernoulli), Indian rivers/dams (Bhakra-Nangal, Sardar Sarovar), submarine buoyancy, capillarity in agriculture. **Foundational physics CAN reach VERY-STRONG when topic is phenomenologically rich.** |
| **FM-G12** | **Cognitive-error-prevention sub-category — 5 instances** (FM-G2 Pascal-pressure-not-force; FM-G3 density-not-mass; FM-G5 Bernoulli-conditions; FM-G6 viscosity-not-thickness; FM-G8 Re-transition-zone; FM-G9 surface-tension-scope). Founder-decision share: 5/12 = 42%. Above 35% elevated EPIC-L gate threshold. **Sustains Mechanics + Mechanical-Properties cluster densest-misconception pattern.** |

---

## Section A — Source Map

| Sub-topic | NCERT 11.2 Ch.10 | HCV V1 Ch.13 + Ch.14 §14.9-end | DCM2 Ch.16 |
|---|---|---|---|
| Pressure in fluids; atmospheric pressure | §10.1-10.2 | Ch.13 §13.1-13.3 | §16.1-16.2 |
| Pascal's law + hydraulic machines | §10.3 | Ch.13 §13.4 | §16.3 |
| Buoyancy + Archimedes' principle | §10.4 | Ch.13 §13.5 | §16.4 |
| Equation of continuity | §10.5 | Ch.13 §13.6 | §16.5 |
| Bernoulli's principle + applications | §10.5 | Ch.13 §13.7 | §16.6 |
| Viscosity + coefficient of viscosity | §10.6 | Ch.14 §14.9 | §16.7 |
| Stokes' law + terminal velocity | §10.6 | Ch.14 §14.10 | §16.8 |
| Reynolds number + flow regimes | §10.6 | Ch.13 §13.8 | §16.9 |
| Surface tension + surface energy | §10.7 | Ch.14 §14.11-14.13 | §16.10 |
| Capillary rise + angle of contact | §10.7 | Ch.14 §14.14-14.15 | §16.11 |

**NCERT Ch.10 is the canonical spine** (~28 pages); covers all 10 sub-topics. **HCV splits across Ch.13 (Fluid Mechanics — pressure/Bernoulli/Reynolds) + Ch.14 §14.9-end (viscosity + surface tension)**. DCM2 Ch.16 is the deepest treatment with problem-pattern density.

---

## Section B — Atomic + Nano Catalog

| ID | Concept | Type | Sim? | In repo? | Requires | Required-by | Notes |
|---|---|---|---|---|---|---|---|
| **fluid_pressure_atomic** | Pressure in fluid: P = F/A; depth-dependence P = P₀ + ρgh (hydrostatic). Acts equally in all directions at a point. SI: Pa = N/m². Atmospheric pressure ≈ 10⁵ Pa. | atomic | ✅ | — | [stress_strain_atomic(T18), newton_second_law_atomic(T11)] | [pascals_law_atomic, archimedes_buoyancy_atomic, bernoullis_principle_atomic] | FM-G1; foundational |
| ↳ depth_pressure_rho_g_h_nano | Pressure increases linearly with depth: P(h) = P₀ + ρgh. Indian-Navy submarine context: 10 m water = 1 atm; INS Arihant at 300 m ≈ 31 atm. | nano | ✅ | — | [fluid_pressure_atomic] | [archimedes_buoyancy_atomic] | parent: fluid_pressure_atomic; cross-link T18 deep_ocean nano |
| ↳ atmospheric_pressure_torricelli_nano | Torricelli mercury barometer: 760 mm Hg = 1 atm = 1.013 × 10⁵ Pa. Indian meteorology stations (IMD network) measure surface pressure for weather prediction. | nano | ✅ | — | [fluid_pressure_atomic] | — | parent: fluid_pressure_atomic |
| **pascals_law_atomic** | Pressure applied at any point in enclosed incompressible fluid transmits undiminished to every other point. F_out/A_out = F_in/A_in → mechanical advantage = A_out/A_in. | atomic | ✅ | — | [fluid_pressure_atomic] | [hydraulic_lift_application_nano] | FM-G2; **Diamond candidate**; **cognitive_error_target:** "pressure increases force proportionally to area" → pressure identical, FORCE scales with area |
| ↳ hydraulic_lift_application_nano | Tata Motors + Ashok Leyland workshop hydraulic-lift systems use Pascal's law. Maruti/Hyundai service stations India-wide: 100 kg force on 10 cm² piston → 10,000 kg lift on 1 m² piston. | nano | ✅ | — | [pascals_law_atomic] | — | parent: pascals_law_atomic; **industry/consumer-strand anchor: Indian automotive service** |
| ↳ hydraulic_brakes_jcb_nano | JCB India earthmovers + Tata trucks + Indian Railways braking systems use hydraulic-pressure transmission. JCB Pune manufactures excavators with Pascal-law hydraulics. | nano | — | — | [pascals_law_atomic] | — | parent: pascals_law_atomic; **industry-strand anchor: JCB India + Tata Motors** |
| **archimedes_buoyancy_atomic** | Object immersed in fluid experiences upward buoyant force equal to weight of fluid displaced: F_b = ρ_fluid × V_displaced × g. Floats if ρ_object < ρ_fluid (effective density via shape). | atomic | ✅ | — | [fluid_pressure_atomic, depth_pressure_rho_g_h_nano] | [submarine_buoyancy_nano] | FM-G3; **Diamond candidate**; **cognitive_error_target:** "heavier objects sink" → only if DENSER than fluid; iron ship floats via hull-shape lowering effective density |
| ↳ iron_ship_floats_hull_shape_nano | Steel hull of cargo ship: total density (steel + air interior) << water density. INS Vikrant aircraft carrier displacement 45,000 tonnes — floats per Archimedes. **Cognitive scaffold nano.** | nano | ✅ | — | [archimedes_buoyancy_atomic] | — | parent: archimedes_buoyancy_atomic; **defence/navy-strand anchor: INS Vikrant** |
| ↳ submarine_buoyancy_ballast_nano | Indian Navy submarines (INS Arihant, Kalvari class) adjust buoyancy by flooding/blowing ballast tanks — controls effective ρ. | nano | ✅ | — | [archimedes_buoyancy_atomic] | — | parent: archimedes_buoyancy_atomic; **defence/navy-strand anchor: Indian Navy** |
| ↳ hot_air_balloon_density_nano | Hot air at 100°C has ρ ≈ 0.95 kg/m³ vs cold air at 25°C ρ ≈ 1.18 kg/m³ → buoyancy lift. Indian Hot Air Balloon Festival (Pushkar Rajasthan). | nano | — | — | [archimedes_buoyancy_atomic] | — | parent: archimedes_buoyancy_atomic; **consumer/tourism-strand anchor** |
| **continuity_equation_atomic** | Mass conservation in incompressible flow: A₁v₁ = A₂v₂. Volume-flow-rate Q = Av is constant along tube. | atomic | ✅ | — | [fluid_pressure_atomic] | [bernoullis_principle_atomic] | FM-G4; prerequisite for Bernoulli |
| ↳ river_narrowing_application_nano | Ganges narrows at Rishikesh + Haridwar gorges → flow speeds up; widens at delta → slows. Same flow rate. | nano | ✅ | — | [continuity_equation_atomic] | — | parent: continuity_equation_atomic; **geography/agriculture-strand anchor: Indian rivers** |
| **bernoullis_principle_atomic** | P + ½ρv² + ρgh = constant along streamline (incompressible + non-viscous + steady flow). Pressure DROPS where velocity rises. | atomic | ✅ | — | [continuity_equation_atomic, work_energy_theorem(T13), fluid_pressure_atomic] | [aviation_lift_nano, venturi_flowmeter_nano, atomiser_nano] | FM-G5; **Diamond candidate**; **cognitive_error_target:** "Bernoulli applies to any flow" → only incompressible + non-viscous + steady + along-streamline |
| ↳ aviation_lift_application_nano | HAL Tejas + Boeing 787 Air India + IndiGo A320 wing: curved upper surface → faster airflow → lower pressure → net upward lift. **Approximation only** (Bernoulli partially explains; angle-of-attack also critical). | nano | ✅ | — | [bernoullis_principle_atomic] | — | parent: bernoullis_principle_atomic; **aviation-strand anchor: HAL + Air India + IndiGo** |
| ↳ venturi_flowmeter_nano | Pipe narrowing → higher v → lower P → manometer reading gives flow rate. Used in Indian petroleum (IOCL refineries) + water-supply (Hindustan Tin Works) + medical IV drips. | nano | ✅ | — | [bernoullis_principle_atomic, continuity_equation_atomic] | — | parent: bernoullis_principle_atomic; **industry + healthcare-strand anchor** |
| ↳ atomiser_spray_paint_nano | Asian Paints + Berger Paints spray-gun atomisers; horizontal high-v airflow creates low pressure that sucks paint up nozzle. Also IPL stadium watering sprinklers. | nano | — | — | [bernoullis_principle_atomic] | — | parent: bernoullis_principle_atomic; **consumer/industry-strand anchor** |
| **viscosity_atomic** | F = ηA(dv/dy); shear stress = η × velocity-gradient. SI: Pa·s. η_water(20°C) ≈ 10⁻³ Pa·s; η_honey ≈ 10 Pa·s; η_air ≈ 1.8 × 10⁻⁵ Pa·s. Temperature-dependent (liquids: η ↓ as T ↑; gases: η ↑ as T ↑). | atomic | ✅ | — | [shear_stress_nano(T18), fluid_pressure_atomic] | [stokes_terminal_velocity_atomic, reynolds_number_atomic] | FM-G6; **cross-cluster bridge to T18 shear stress**; **cognitive_error_target:** "viscosity = thickness" → viscosity is rate-dependent shear resistance; T-dependent |
| ↳ engine_oil_grading_application_nano | Indian Oil (IOCL) + HP + BP engine-oil SAE grades: 10W-30, 5W-40 — multi-grade oils with η-T behaviour spec'd for Indian climate (40-45°C summer). | nano | ✅ | — | [viscosity_atomic] | — | parent: viscosity_atomic; **industry/consumer-strand anchor: IOCL** |
| **stokes_terminal_velocity_atomic** | Drag on small sphere in viscous fluid: F_drag = 6πηrv (low-Re limit). Terminal v: v_t = (2/9)·(ρ_sphere − ρ_fluid)gr²/η when drag = net weight. | atomic | ✅ | — | [viscosity_atomic, newton_second_law_atomic(T11)] | [parachute_application_nano, raindrop_terminal_v_nano] | FM-G7 |
| ↳ raindrop_terminal_velocity_nano | Monsoon raindrop (r ≈ 2 mm) reaches v_t ≈ 6-10 m/s in seconds; without air resistance would fall at >100 m/s from 1 km cloud. **Indian monsoon context.** | nano | ✅ | — | [stokes_terminal_velocity_atomic] | — | parent: stokes_terminal_velocity_atomic; **agriculture/meteorology-strand anchor: IMD + monsoon** |
| ↳ parachute_drdo_application_nano | DRDO + Indian Army parachute design (ADRDE Agra) uses Stokes/quadratic-drag scaling for terminal v ≈ 5 m/s landing speed. | nano | — | — | [stokes_terminal_velocity_atomic] | — | parent: stokes_terminal_velocity_atomic; **defence-strand anchor: DRDO ADRDE** |
| **reynolds_number_atomic** | Re = ρvD/η; dimensionless ratio of inertial to viscous forces. Re < 2000: laminar; Re > 4000: turbulent; 2000-4000: transition. Predicts onset of turbulence. | atomic | ✅ | — | [viscosity_atomic, continuity_equation_atomic] | — | FM-G8; **cognitive_error_target:** "Re predicts flow type uniquely" → only approximately; transition zone is mixed |
| ↳ pipe_flow_water_supply_nano | Indian municipal water supply (Bangalore BWSSB, Delhi DJB, Mumbai BMC): pipe design uses Re to prevent turbulent losses + pump-power-spec. | nano | ✅ | — | [reynolds_number_atomic] | — | parent: reynolds_number_atomic; **public-service-strand anchor: Indian municipal utilities** |
| **surface_tension_atomic** | T = F/L (force per unit length along surface); equivalently energy per unit area (J/m²). Origin: net inward cohesive force on surface molecules. T_water ≈ 73 × 10⁻³ N/m at 20°C. | atomic | ✅ | — | [fluid_pressure_atomic] | [capillary_action_atomic, droplet_spherical_nano, water_strider_nano] | FM-G9; **Diamond candidate**; **cognitive_error_target:** "surface tension floats things" → only when surface tension force >> weight (insect-scale, NOT ship-scale) |
| ↳ droplet_spherical_shape_nano | Surface tension minimises surface area → sphere for fixed volume. Rain droplets, mercury beads, soap bubbles all approach spherical. | nano | ✅ | — | [surface_tension_atomic] | — | parent: surface_tension_atomic |
| ↳ water_strider_insect_nano | Water strider (पानी का कीड़ा — observable in Indian ponds) walks on water: weight = surface-tension support across legs. Demonstrates scale-dependence. | nano | ✅ | — | [surface_tension_atomic] | — | parent: surface_tension_atomic; **consumer/observation-strand anchor: Indian ponds** |
| ↳ soap_bubble_excess_pressure_nano | Inside soap bubble: ΔP = 4T/R (two surfaces). Inside water droplet: ΔP = 2T/R (one surface). Smaller bubble → higher inside pressure. | nano | ✅ | — | [surface_tension_atomic] | — | parent: surface_tension_atomic |
| **capillary_action_atomic** | Capillary rise in narrow tube: h = 2T cosθ / (ρgr). Angle of contact θ determines rise (θ<90°: rise) or depression (θ>90°: e.g., mercury in glass). | atomic | ✅ | — | [surface_tension_atomic, fluid_pressure_atomic] | [soil_water_uptake_nano, plant_xylem_nano] | FM-G10; **agriculture + biology bridges** |
| ↳ soil_water_uptake_agricultural_nano | ICAR (Indian Council of Agricultural Research) studies capillary rise in soil — controls irrigation efficiency. Drip irrigation (Jain Irrigation Jalgaon) leverages capillary distribution. | nano | ✅ | — | [capillary_action_atomic] | — | parent: capillary_action_atomic; **agriculture-strand anchor: ICAR + Jain Irrigation** |
| ↳ plant_xylem_capillary_nano | Plant xylem tubes lift water from roots to leaves via capillary + transpiration. Critical for Indian farming + horticulture. | nano | — | — | [capillary_action_atomic] | — | parent: capillary_action_atomic; **agriculture/biology-strand anchor** |
| ↳ blotting_paper_chromatography_nano | Paper chromatography (Class 11-12 lab + DRDO forensics) uses capillary rise in paper fibres to separate dye components. | nano | — | — | [capillary_action_atomic] | — | parent: capillary_action_atomic; **research/education-strand anchor** |

**Atomic count:** 10. **Nano count:** ~17. **Total entries:** 27.

---

## Section C — Cross-Source Coverage Matrix

| Atomic | NCERT 11.2 Ch.10 | HCV V1 Ch.13/14 | DCM2 Ch.16 | Coverage |
|---|---|---|---|---|
| fluid_pressure_atomic | §10.1-10.2 | Ch.13 §13.1-13.3 | §16.1-16.2 | TRIPLE |
| pascals_law_atomic | §10.3 | Ch.13 §13.4 | §16.3 | TRIPLE |
| archimedes_buoyancy_atomic | §10.4 | Ch.13 §13.5 | §16.4 | TRIPLE |
| continuity_equation_atomic | §10.5 | Ch.13 §13.6 | §16.5 | TRIPLE |
| bernoullis_principle_atomic | §10.5 | Ch.13 §13.7 | §16.6 | TRIPLE |
| viscosity_atomic | §10.6 | Ch.14 §14.9 | §16.7 | TRIPLE |
| stokes_terminal_velocity_atomic | §10.6 | Ch.14 §14.10 | §16.8 | TRIPLE |
| reynolds_number_atomic | §10.6 | Ch.13 §13.8 | §16.9 | TRIPLE |
| surface_tension_atomic | §10.7 | Ch.14 §14.11-14.13 | §16.10 | TRIPLE |
| capillary_action_atomic | §10.7 | Ch.14 §14.14-14.15 | §16.11 | TRIPLE |

**Triple-coverage rate:** 10 of 10 atomics = **100%** — **10th 100% topic in 32 pilots**. **Streak extends.** Foundational continuum-physics returns to 100% — all three sources cover fluid mechanics canonically (no NCERT-omission of JEE-Advanced extensions; chapter scope coincides).

---

## Section D — Stage-3 Math-Tool Dependencies

| Math-tool primitive | Used by | Status |
|---|---|---|
| `algebra_basic_ratio` (F/A pressure) | fluid_pressure_atomic, pascals_law_atomic | REQUIRED (existing) |
| `calculus_derivative_dv_dy` (viscosity gradient) | viscosity_atomic | REQUIRED (existing) |
| `algebra_unit_analysis` (Pa = N/m²; Re dimensionless) | fluid_pressure_atomic, reynolds_number_atomic | REQUIRED (existing) |
| `energy_conservation_along_streamline` (Bernoulli) | bernoullis_principle_atomic | REQUIRED (T13 reuses) |
| `algebra_dimensional_analysis` (Re construction) | reynolds_number_atomic | REQUIRED (existing) |

**ZERO new stubs registered.** Fluid mechanics uses only existing primitives. Math-tools IN-degree unchanged: **51** (post-T18 + T25 will recheck). Light-maintenance mode continues for Mechanics-cluster pilots.

---

## Section E — Cross-Topic Dependencies (Bidirectional Edges)

### Outgoing (T20 requires from earlier topics)

| Target topic | Edge | Reason |
|---|---|---|
| T11 Newton's Laws (back-edge) | fluid_pressure_atomic ← F = ma applied to fluid column | T11 → T20 closes anticipated (Session 50) |
| T13 Work-Energy (back-edge) | bernoullis_principle_atomic ← work-energy along streamline | T13 → T20 closes anticipated |
| **T18 Elasticity (intra-cluster cross-back)** | viscosity_atomic ↔ T18 shear_stress_nano (fluid analog of shear modulus); fluid_pressure ↔ T18 hydraulic_volumetric_stress | **Intra-cluster back-edge** to T18; closes Mechanical Properties cluster |
| Math-tools | 5 primitives (zero new stubs) | All REQUIRED |

### Incoming (T20 will be required by later topics)

| Source topic | Edge | Reason |
|---|---|---|
| T21 Wave Motion (back-edge) | fluid_wave_speed_in_water ← bulk_modulus(T18) + density(T20) | **Closes** the density-half of T21 CT2 forward-edge; T18 already closed K-half Session 51 |
| **T25 Thermal Properties (intra-session)** | thermal_expansion_of_liquids ← fluid_pressure_atomic + density-temperature dependence | **Intra-session bidirectional** with T25 (see T25 §E for full edge list) |
| **T25 Thermal Properties (intra-session)** | heat_convection_atomic ← archimedes_buoyancy_atomic + viscosity_atomic | Convection IS buoyancy-driven fluid flow; bidirectional |
| T26 Thermodynamics (back-edge) | gas_law_PV_nRT applied to incompressible-limit ↔ continuity_equation | Weak cross-link |
| T36 Moving Charges (back-edge weak) | magnetohydrodynamics analog noted | Stage-1 weak link |

### T20 ↔ T25 intra-session bidirectional edges (4 edges; cross-cluster paired-batch)

1. T20 `archimedes_buoyancy_atomic` ↔ T25 `heat_convection_atomic` (convection IS buoyancy-driven density gradient → fluid flow)
2. T20 `viscosity_atomic` ↔ T25 `heat_convection_atomic` (convection rate depends on η of fluid)
3. T20 `fluid_pressure_atomic` ↔ T25 `thermal_expansion_liquid_gas_nano` (density change with T = pressure change at constant V)
4. T20 `surface_tension_atomic` ↔ T25 `surface_tension_T_dependence_nano` (T_surface decreases with temperature)

**4 bidirectional edges = cross-cluster paired-batch density band (2-4).** **8th data point validating Stage-4 paired-batch density rule.** Same as T15↔T18 Session 51 (also 4 edges) — cross-cluster pairs reliably hit 2-4 edges.

**Total outgoing: 3 cross-topic back-edge closures + 4 math-tools + 2 intra-cluster T18 cross-back.** **Total incoming: 1 T21 density-half closure + 4 intra-session bidirectional with T25.**

---

## Section F — Real-World Anchors (VERY-STRONG, Indian-context)

| Anchor | Concept hook | Authoring use | Strand |
|---|---|---|---|
| **Indian medical-hydraulics (AIIMS BP monitors + Tata Memorial syringes + IV drips)** | fluid_pressure_atomic, pascals_law_atomic, bernoullis_principle_atomic | "Sphygmomanometer BP reading is mercury-column hydrostatic pressure; IV drip flow rate is Bernoulli + Poiseuille in narrow tube" | Healthcare |
| **HAL Tejas + Air India + IndiGo (aviation lift)** | bernoullis_principle_atomic | "Tejas LCA wing-section curvature creates pressure differential = lift; subsonic Bernoulli + supersonic shock physics combined" | Aviation |
| **JCB India + Tata Motors hydraulic systems** | pascals_law_atomic, hydraulic_lift_application_nano, hydraulic_brakes_jcb_nano | "JCB Pune backhoe loader uses 200-bar hydraulic Pascal-law transmission; Tata truck air-brake fail-safe systems" | Industry |
| **Indian Navy (INS Vikrant, Arihant, Kalvari class submarines)** | archimedes_buoyancy_atomic, submarine_buoyancy_ballast_nano | "INS Vikrant 45,000-tonne carrier floats per Archimedes; submarine ballast adjusts effective density for depth control" | Defence / Navy |
| **Indian Oil + HP + BP (engine-oil SAE grades)** | viscosity_atomic, engine_oil_grading_application_nano | "IOCL Servo Pride 10W-40 spec'd for Indian-summer 45°C ambient; multi-grade η-T behaviour" | Industry / Transport |
| **ICAR + Jain Irrigation (drip irrigation + soil capillarity)** | capillary_action_atomic, soil_water_uptake_agricultural_nano | "Jain Irrigation Jalgaon designs drip-emitters using capillary-distribution physics; ICAR studies soil-water capillary rise" | Agriculture |
| **Indian Municipal Water Supply (BWSSB Bangalore + DJB Delhi + BMC Mumbai)** | reynolds_number_atomic, pipe_flow_water_supply_nano | "Municipal pipe design uses Re < 2000 to prevent turbulent losses; pump power scaling per Reynolds + Bernoulli" | Public Service |
| **Indian Monsoon + IMD raindrop physics** | stokes_terminal_velocity_atomic, raindrop_terminal_velocity_nano | "Monsoon raindrop r ≈ 2mm: terminal v ≈ 6-10 m/s; IMD radar measures Doppler velocity of falling drops" | Agriculture / Meteorology |
| **DRDO ADRDE Agra (parachute design)** | stokes_terminal_velocity_atomic, parachute_drdo_application_nano | "DRDO ADRDE designs Indian Army + Air Force parachutes for 5 m/s landing speed; quadratic + Stokes drag combined" | Defence |
| **Indian Rivers (Ganges narrowing at Rishikesh + Brahmaputra flood plains)** | continuity_equation_atomic, river_narrowing_application_nano | "Ganges narrows at Haridwar gorge → speed up; widens at Bay-of-Bengal delta → slow down. Mass conservation visible." | Geography / Agriculture |
| **ISRO PSLV cryogenic-fuel handling** | viscosity_atomic, fluid_pressure_atomic | "ISRO LPSC Mahendragiri handles cryogenic LH2/LOX with extreme η-T spec; cryo-pump design uses Re + Bernoulli" | Space |
| **IPL stadium watering + Asian Paints atomisers** | bernoullis_principle_atomic, atomiser_spray_paint_nano | "IPL stadium sprinklers use Bernoulli-jet physics; Asian Paints spray-gun uses atomiser low-pressure suction" | Consumer / Industry |
| **Indian hot-air balloon tourism (Pushkar Rajasthan)** | archimedes_buoyancy_atomic, hot_air_balloon_density_nano | "Pushkar Hot Air Balloon Festival: hot air at 100°C ρ ≈ 0.95 vs cold air 1.18; lift = buoyancy" | Consumer / Tourism |

**Total: 13 distinct institutional/system anchors across 8 strands** (healthcare, aviation, industry, defence/navy, agriculture, public-service, meteorology, space, consumer, geography — count 8 by collapsing related sub-strands). **Meets VERY-STRONG strand-diversity ≥ 8 criterion AND anchor count ≥ 13.** **Decision (FM-G11): VERY-STRONG**. **6th VERY-STRONG observation** in the catalog set. **First foundational-mechanics topic to break the STRONG plateau** — phenomenological-rich topics CAN reach VERY-STRONG even within Mechanics-cluster sphere. Drivers: medical hydraulics + aviation Bernoulli + Indian rivers + capillary agriculture together cross the 8-strand threshold.

---

## Section G — Cognitive-Error-Prevention Decisions

**6 of 12 founder decisions are cognitive-error-prevention type = 50%.** Above 35% threshold; **tied with T11 (50%) for highest single-topic share.** High-misconception-density chapter (elevated EPIC-L gate applies per Stage-4 formalisation):

| Tag | cognitive_error_target | Countermeasure |
|---|---|---|
| **FM-G2** | "pressure increases force proportionally to area" | Author "pressure is identical; FORCE scales with area (F = PA)" via hydraulic-lift visualisation |
| **FM-G3** | "heavier objects sink" | Mandatory `iron_ship_floats_hull_shape_nano` showing density-not-mass determines floating |
| **FM-G5** | "Bernoulli applies to any flow" | Author the 4 conditions (incompressible + non-viscous + steady + along-streamline) explicitly |
| **FM-G6** | "viscosity = thickness" | Author rate-dependent shear interpretation + η-T dependence (honey at 80°C < honey at 20°C) |
| **FM-G8** | "Re predicts flow type uniquely" | Author transition-zone Re 2000-4000 explicitly as MIXED regime |
| **FM-G9** | "surface tension causes everything floating-related" | Author scale-dependence: water strider YES, ship NO |

**Combined Session 52 cognitive-error-prevention share** (will recompute after T25; running): T20 = 50% (6/12). Sustains 35-50% range observed across 7 consecutive sessions. **Mechanical Properties cluster (T18+T20) combined: T18 = 36% + T20 = 50% = 10/23 = 43%** — densest cluster cognitive-error rate observed.

---

## Section H — V1 Priority Flags

| Atomic | V1? | Reason |
|---|---|---|
| fluid_pressure_atomic | ✅ | Foundational; high cross-link density |
| pascals_law_atomic | ✅ | Diamond candidate; high industry anchor (JCB + Tata + medical); cognitive-error rich |
| archimedes_buoyancy_atomic | ✅ | Diamond candidate; INS Vikrant anchor; cognitive-error rich |
| bernoullis_principle_atomic | ✅ | Diamond candidate; aviation anchor (HAL Tejas + Air India); high cognitive-error |
| viscosity_atomic | ✅ | Cross-cluster bridge to T18; engine-oil anchor; cognitive-error rich |
| surface_tension_atomic | ⚖️ | V1.1; Diamond candidate; consumer anchor |
| continuity_equation_atomic | ⚖️ | V1.1; prerequisite for Bernoulli |
| capillary_action_atomic | ⚖️ | V1.1; agriculture anchor |
| stokes_terminal_velocity_atomic | ⚖️ | V1.2; monsoon-raindrop anchor |
| reynolds_number_atomic | ⚖️ | V1.2; dimensional-analysis bridge |

**V1 ship count for T20: 5 atomics.** Matches T15+T18 paired-batch cadence. Session 52 combined V1 ship count (with T25): TBD.

---

## Section I — Open Questions

1. **Poiseuille's law (HP-flow in narrow tubes)** — NCERT-light; HCV+DCM cover; defer to V2 (cardiovascular blood-flow application is HUGE healthcare anchor though — flag for healthcare-vertical authoring).
2. **Magnus effect (cricket ball swing)** — NCERT-light; HCV brief; **Indian cricket anchor is rich** but conceptual depth small. V1.2 candidate.
3. **Magnetohydrodynamics (MHD)** — graduate-level; defer.
4. **Compressible-flow Bernoulli (gas dynamics)** — defer to V2 / engineering-extension.
5. **Excess pressure inside curved liquid surface (Young-Laplace)** — covered HCV §14.13; defer to V2.
6. **Hydraulic jump + open-channel-flow** — civil engineering; defer.
7. **Mechanical Properties cluster completeness check** — **T20 closes cluster** (T18 + T20 both done). Cluster done.
8. **Cross-link to T25 thermal expansion of fluids** — captured in §E intra-session edges.

---

## Section J — Sign-Off

- Authored: Session 52, 2026-05-25.
- Author: Claude (Architect+Engineer role).
- Coverage class: **TRIPLE**.
- Anchor density: **VERY-STRONG** (13 anchors × 8 strands — **6th VERY-STRONG; first foundational-mechanics-cluster topic to break STRONG plateau**).
- Triple-coverage rate: **100%** (10/10) — **10th observed 100% topic**; streak extends to 2 consecutive (T18 → T20).
- Atomic count: **10**. Nano count: **17**. Total: **27 entries**.
- V1 ship count: **5 atomics**.
- **Closes anticipated forward-edges**: T11 → T20 (Session 50), T13 → T20 (Session 50), T21 CT2 density-half (Session 33-34, ~18-19-session lag — longest-active).
- **Mechanical Properties cluster CLOSED** (2/2 — T18 + T20). **7th cluster closure in Stage-2.**
- **0 new math-tools stubs registered.** Light-maintenance mode continues. Math-tools IN-degree unchanged: 51.
- Cognitive-error-prevention founder-decision share: **50%** (6/12) — tied for single-topic high (with T11).
- Next pilot batch: pending founder greenlight after Session 52 closure.

---

*10th 100% topic; 1st foundational-mechanics VERY-STRONG. Mechanical Properties cluster CLOSED (7th cluster closure). 18-19-session-old T21 CT2 density-half forward-edge CLOSED — joins T18-closed K-half. Cross-cluster paired-batch with T25 = 4 edges (8th data point in Stage-4 density-rule validation).*
