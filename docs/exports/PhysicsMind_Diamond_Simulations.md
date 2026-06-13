# PhysicsMind — Highest-Impact ("Diamond") Simulations

> **For physics-teacher review — start here.** These are the **68 highest-leverage simulations** out of the full 1563-concept catalogue: the "aha" moments where a single well-built interactive does the most to create real understanding (and break the most common wrong belief).

**The ask:** for each one — what is the cleanest demonstration, the exact moment of insight, and the misconception it must shatter? These are the ones worth designing most carefully.

**Legend:** 💎 = flagged *diamond candidate* in the catalogue · ✦ = flagged *primary aha*. *Targets* = the documented wrong belief the simulation is built to correct.

## At a glance

| # | Chapter | Class | High-impact sims |
|---|---|---|---:|
| 2 | Units Measurements | Class 11 | 1 |
| 6 | Kinematics 1D | Class 11 | 3 |
| 7 | Kinematics 2D Relative Motion | Class 11 | 2 |
| 8 | Projectile Motion | Class 11 | 2 |
| 9 | Motion In Plane Circular Kinematics | Class 11 | 1 |
| 11 | Newtons Laws | Class 11 | 4 |
| 12 | Friction | Class 11 | 1 |
| 14 | Momentum Collisions | Class 11 | 3 |
| 15 | Rotational Mechanics | Class 11 | 4 |
| 16 | Gravitation | Class 11 | 1 |
| 18 | Elasticity | Class 11 | 3 |
| 19 | Wave Equation | Class 11 | 3 |
| 20 | Fluid Mechanics | Class 11 | 4 |
| 21 | Wave Motion | Class 11 | 3 |
| 22 | Superposition Standing Waves | Class 11 | 3 |
| 23 | Sound Waves | Class 11 | 4 |
| 25 | Thermal Properties | Class 11 | 5 |
| 26 | Thermodynamics | Class 11 | 4 |
| 27 | Kinetic Theory | Class 11 | 2 |
| 35 | EM Induction | Class 12 | 4 |
| 36 | Moving Charges Magnetism | Class 12 | 2 |
| 38 | EM Waves | Class 12 | 2 |
| 39 | AC Circuits | Class 12 | 1 |
| 42 | Refraction Lenses Prism | Class 12 | 3 |
| 49 | Semiconductor | Class 12 | 2 |
| 50 | Communication Systems | Class 12 | 1 |
| | **Total** | | **68** |

---

## T2 — Units Measurements  *(Class 11)*

- 💎 **`dimensional_analysis_atomic`** *(atomic)* — The **dimensional formula** [MᵃLᵇTᶜ...] of a quantity; the **principle of homogeneity** (every additive term in a valid equation has identical dimensions). Three legitimate uses: (1) CHECK an equation; (2) CONVERT units between systems; (3) DERIVE a relation UP TO a dimensionless constant. The universal sanity-check applied implicitly across all of physics.  
  _Targets misconception: gives complete formula incl. constants_

## T6 — Kinematics 1D  *(Class 11)*

- 💎 **`displacement_vs_distance_atomic`** *(atomic)* — **Displacement** Δx = x_final − x_initial (vector in 1D = signed scalar). **Distance** = path length traversed (scalar, always ≥ 0). For round-trip: displacement = 0; distance = 2·(path length). Distance ≥ |displacement| always.  
  _Targets misconception: displacement = distance always_
- 💎 **`acceleration_definition_atomic`** *(atomic)* — **Acceleration** a = dv/dt = rate of change of velocity. Average acceleration a_avg = Δv/Δt; instantaneous a = lim_{Δt→0} Δv/Δt. **Sign carries direction**: positive a means v increasing in +x direction (if v already +); but if v is −, positive a means v becoming LESS NEGATIVE (slowing down then reversing).  
  _Targets misconception: negative a always means slowing down_
- 💎 **`xt_vt_at_graphs_atomic`** *(atomic)* — Three synchronised views of same motion: **x-t graph** position vs time; **v-t graph** velocity vs time; **a-t graph** acceleration vs time. Relationships: slope of x-t = v(t); slope of v-t = a(t); area under v-t between t₁ and t₂ = Δx; area under a-t = Δv.

## T7 — Kinematics 2D Relative Motion  *(Class 11)*

- 💎 **`vector_kinematics_2d_atomic`** *(atomic)* — Position **r⃗(t) = x(t) î + y(t) ĵ**; velocity **v⃗ = dr⃗/dt = (dx/dt) î + (dy/dt) ĵ**; acceleration **a⃗ = dv⃗/dt**. **Componentwise principle**: in absence of constraints, x-motion and y-motion are INDEPENDENT — each obeys 1D kinematics separately.
- 💎 **`boat_river_crossing_atomic`** *(atomic)* — Boat velocity v_b in still water; river current v_r downstream. **Resultant velocity** v⃗_actual = v⃗_b + v⃗_r. **Two distinct optimisations:** (a) **Shortest time**: boat heads straight across (perpendicular to bank); time = w/v_b; drift downstream = (v_r·w)/v_b. (b) **Shortest path** (= width w, no drift): boat heads upstream at angle θ such that v_b·sin(θ) = v_r; time = w/(v_b·cos(θ)) > w/v_b.  
  _Targets misconception: shortest time = shortest path_

## T8 — Projectile Motion  *(Class 11)*

- 💎 **`projectile_decoupling_atomic`** *(atomic)* — A projectile's motion decomposes into TWO INDEPENDENT motions: **horizontal** (uniform, a_x = 0, x = u_x·t) and **vertical** (free-fall, a_y = −g, y = u_y·t − ½gt²). The only link is the shared time t. **Neither component affects the other.**  
  _Targets misconception: horizontal & vertical motions affect each other_
- 💎 **`angular_projectile_trajectory_atomic`** *(atomic)* — Launch at angle θ to horizontal with speed u: **x = u·cosθ·t**; **y = u·sinθ·t − ½gt²**. Eliminate t → **trajectory: y = x·tanθ − gx²/(2u²cos²θ)** = downward parabola. Symmetric about the peak.

## T9 — Motion In Plane Circular Kinematics  *(Class 11)*

- 💎 **`centripetal_acceleration_kinematic_atomic`** *(atomic)* — Even at CONSTANT SPEED, circular motion is ACCELERATED because the velocity DIRECTION continuously changes. The acceleration points toward the centre: **a_c = v²/r = ω²r = vω**. This is a purely KINEMATIC fact (geometric consequence of direction-change) — it exists BEFORE any discussion of what force causes it (that's T10).  
  _Targets misconception: constant speed = zero acceleration_

## T11 — Newtons Laws  *(Class 11)*

- 💎 **`newton_second_law_atomic`** *(atomic)* — F_net = ma; in vector form ΣF = m·a; central quantitative law of mechanics
- 💎 **`free_body_diagram_atomic`** *(atomic)* — Cognitive tool: isolate ONE body, draw ALL external forces ACTING ON IT, set up F_net = ma equations. THE universal mechanics workflow.  
  _Targets misconception: drawing forces ON other bodies in same FBD_
- 💎 **`connected_bodies_atomic`** *(atomic)* — Two or more bodies connected by string/rod/pulley; apply F=ma to each body separately + constraint equation; combine for system solution
- 💎 **`block_on_incline_atomic`** *(atomic)* — Block of mass m on incline angle θ: gravity component along incline = mg sin θ; perpendicular = mg cos θ; if μ < tan θ slides; if μ ≥ tan θ static

## T12 — Friction  *(Class 11)*

- ✦ **`friction_as_contact_force_component`** *(atomic)* — Friction is the parallel component of contact force (normal = perpendicular component, friction = parallel)

## T14 — Momentum Collisions  *(Class 11)*

- 💎 **`centre_of_mass_atomic`** *(atomic)* — Mathematical point R = Σmᵢrᵢ/Σmᵢ representing weighted-average position of system; CoM moves as if all mass were concentrated there and all external force acted there
- 💎 **`elastic_collision_1d_atomic`** *(atomic)* — 1D collision conserving BOTH momentum AND kinetic energy. Closed-form solution: v₁' = ((m₁−m₂)v₁ + 2m₂v₂)/(m₁+m₂); v₂' = ((m₂−m₁)v₂ + 2m₁v₁)/(m₁+m₂). Equal-mass case: simple velocity exchange.
- 💎 **`rocket_equation_atomic`** *(atomic)* — Tsiolkovsky: v − v₀ = u·ln(M₀/M); rocket gains speed by ejecting mass at exhaust-speed u; specific impulse I_sp = u/g₀ measures fuel efficiency

## T15 — Rotational Mechanics  *(Class 11)*

- 💎 **`moment_of_inertia_atomic`** *(atomic)* — I = Σmᵢrᵢ² (discrete); I = ∫r² dm (continuous). I is "rotational mass" — resists change in rotational motion. **DEPENDS ON CHOSEN AXIS.**  
  _Targets misconception: I is a property of body alone_
- 💎 **`tau_eq_i_alpha_atomic`** *(atomic)* — τ_net = Iα; central quantitative law of rotational dynamics. Rotational analog of F_net = ma
- 💎 **`rolling_on_incline_atomic`** *(atomic)* — Body rolling without slipping down incline angle θ: a_CoM = g sin θ / (1 + I/(mR²)); time-to-bottom depends on I/(mR²) ratio. **Solid sphere < disc < hollow sphere < ring**
- 💎 **`flywheel_application_atomic`** *(atomic)* — Wheel with large I stores rotational KE = ½Iω² and smooths angular-velocity fluctuations. Automotive engine flywheel, power-plant turbine inertia, KERS (Kinetic Energy Recovery System) all use this

## T16 — Gravitation  *(Class 11)*

- 💎 **`newton_law_of_gravitation`** *(atomic)* — `F = Gm₁m₂/r²`, central + conservative + medium-independent. The diamond seed.

## T18 — Elasticity  *(Class 11)*

- 💎 **`stress_strain_atomic`** *(atomic)* — Stress = F/A (force per unit area; SI: Pa = N/m²). Strain = ΔL/L (dimensionless ratio of deformation to original dimension). **Three stress types: tensile (axial), shear (tangential), hydraulic (uniform pressure)**.
- 💎 **`stress_strain_curve_atomic`** *(atomic)* — Graphical representation showing: proportional limit (Hooke's law) → elastic limit → yield point → plastic regime → ultimate stress → fracture. Different materials show distinct curves (steel: brittle; rubber: ultra-elastic; glass: brittle no-yield)
- 💎 **`youngs_modulus_atomic`** *(atomic)* — Y = (F/A) / (ΔL/L) = stress / longitudinal strain; characterises tensile/compressive deformation. **Industrial values:** steel ~200 GPa, aluminum ~70 GPa, brass ~91 GPa, rubber ~0.01-0.1 GPa  
  _Targets misconception: Y depends on size of body_

## T19 — Wave Equation  *(Class 11)*

- 💎 **`transverse_vs_longitudinal_atomic`** *(atomic)* — Wave = propagating disturbance. **Transverse:** particle displacement ⊥ to propagation (string, light, water surface). **Longitudinal:** particle displacement ∥ to propagation (sound, pressure). All waves transport energy + momentum WITHOUT net mass transfer.
- 💎 **`travelling_wave_function_atomic`** *(atomic)* — Sinusoidal travelling wave: y(x, t) = A sin(kx − ωt + φ). Right-moving: argument (kx − ωt). Left-moving: (kx + ωt). Phase velocity v = ω/k.  
  _Targets misconception: particles travel with wave_
- 💎 **`wave_speed_string_atomic`** *(atomic)* — Speed of transverse wave on stretched string: v = √(T/μ); T = tension (N), μ = linear mass density (kg/m). Derived from Newton's 2nd law on small arc. **Industry-anchored: sitar/tabla/guitar string tuning, Indian Railways rail-vibration diagnostics.**

## T20 — Fluid Mechanics  *(Class 11)*

- 💎 **`pascals_law_atomic`** *(atomic)* — Pressure applied at any point in enclosed incompressible fluid transmits undiminished to every other point. F_out/A_out = F_in/A_in → mechanical advantage = A_out/A_in.  
  _Targets misconception: pressure increases force proportionally to area_
- 💎 **`archimedes_buoyancy_atomic`** *(atomic)* — Object immersed in fluid experiences upward buoyant force equal to weight of fluid displaced: F_b = ρ_fluid × V_displaced × g. Floats if ρ_object < ρ_fluid (effective density via shape).  
  _Targets misconception: heavier objects sink_
- 💎 **`bernoullis_principle_atomic`** *(atomic)* — P + ½ρv² + ρgh = constant along streamline (incompressible + non-viscous + steady flow). Pressure DROPS where velocity rises.  
  _Targets misconception: Bernoulli applies to any flow_
- 💎 **`surface_tension_atomic`** *(atomic)* — T = F/L (force per unit length along surface); equivalently energy per unit area (J/m²). Origin: net inward cohesive force on surface molecules. T_water ≈ 73 × 10⁻³ N/m at 20°C.  
  _Targets misconception: surface tension floats things_

## T21 — Wave Motion  *(Class 11)*

- ✦ **`wave_motion_energy_transport_without_matter`** *(atomic)* — A wave transports energy/disturbance from one region of space to another **without bulk motion of matter**
- ✦ **`traveling_wave_equation_y_equals_f_t_minus_x_over_v`** *(atomic)* — The general form of a wave traveling in +x direction at speed v: y(x,t) = f(t − x/v). The argument MUST be in the combination (t − x/v).
- ✦ **`two_graphs_y_vs_x_at_fixed_t_AND_y_vs_t_at_fixed_x`** *(atomic)* — Two visualizations of the same wave: (i) y-vs-x at fixed time (snapshot — shows wavelength λ); (ii) y-vs-t at fixed position (single particle's SHM — shows period T). Same equation, different "slice".

## T22 — Superposition Standing Waves  *(Class 11)*

- 💎 **`superposition_principle_atomic`** *(atomic)* — When two or more waves traverse the same medium, the resultant displacement at any point at any time = vector sum of individual displacements. y(x,t) = y₁(x,t) + y₂(x,t) + ... Follows from linearity of wave equation (T19).
- 💎 **`standing_waves_string_atomic`** *(atomic)* — Two oppositely-travelling waves of equal amplitude/frequency superpose to give: y(x,t) = 2A sin(kx) cos(ωt). **Spatial envelope sin(kx) determines amplitude pattern; time-factor cos(ωt) makes whole pattern oscillate in place. No energy translation.**  
  _Targets misconception: standing wave doesn't transport energy_
- 💎 **`beats_atomic`** *(atomic)* — Superposition of two waves of nearly-equal frequency f₁, f₂ at the same point: amplitude envelope oscillates at f_envelope = (f₁−f₂)/2, but intensity oscillates at f_beat = |f₁−f₂|. Audible as "wah-wah" pulsation.  
  _Targets misconception: beats happen in space_

## T23 — Sound Waves  *(Class 11)*

- 💎 **`longitudinal_wave_sound_atomic`** *(atomic)* — Sound is a longitudinal mechanical wave: particles of medium oscillate parallel to direction of energy propagation, creating alternating compressions (high pressure) + rarefactions (low pressure). Requires elastic medium (gas, liquid, solid) — cannot travel through vacuum.  
  _Targets misconception: longitudinal-vs-transverse_
- 💎 **`speed_of_sound_newton_laplace_atomic`** *(atomic)* — Speed of sound in gas: **Newton (1687) — isothermal assumption:** v = √(P/ρ) → predicts 280 m/s at STP (wrong; measured 332 m/s, off by ~16%). **Laplace (1816) — adiabatic correction:** v = √(γP/ρ) where γ = Cp/Cv ≈ 1.40 for air → predicts 332 m/s (matches experiment). Physical reason: sound oscillations are too rapid for heat exchange → adiabatic, not isothermal.
- 💎 **`pipe_acoustic_resonance_atomic`** *(atomic)* — Air columns inside pipes support standing waves of sound: pressure node ↔ displacement antinode (and vice versa) at boundaries. **Open-open pipe (flute, bansuri):** displacement antinodes at both ends → f_n = nv/(2L), all harmonics. **Open-closed pipe (clarinet, bottle):** displacement node at closed end + antinode at open end → f_n = (2n−1)v/(4L), only odd harmonics. **End-correction:** effective length = L + 0.6r at each open end.
- 💎 **`doppler_effect_sound_atomic`** *(atomic)* — Apparent frequency f' heard by observer differs from source frequency f when source-observer-medium relative motion exists. **General formula:** f' = f·(v ± v_obs)/(v ∓ v_src) where signs depend on directions and v = sound speed in medium. **Asymmetry:** medium is at rest in lab frame — source-moving vs observer-moving give different formulae (not Galilean-equivalent).  
  _Targets misconception: source-vs-observer asymmetry due to medium frame_

## T25 — Thermal Properties  *(Class 11)*

- 💎 **`thermal_expansion_atomic`** *(atomic)* — Solid bodies expand on heating: ΔL = αL₀ΔT (linear); ΔA = βA₀ΔT (area, β ≈ 2α); ΔV = γV₀ΔT (volume, γ ≈ 3α). Coefficient α depends on material. Steel α ≈ 12 × 10⁻⁶ /K; copper ≈ 17 × 10⁻⁶; aluminum ≈ 23 × 10⁻⁶.  
  _Targets misconception: α/β/γ independent_
- 💎 **`calorimetry_principle_atomic`** *(atomic)* — Heat-lost = Heat-gained in mixing without phase-change: m₁C₁(T₁−T_f) = m₂C₂(T_f−T₂). Conservation of energy applied to thermal interactions.
- 💎 **`latent_heat_atomic`** *(atomic)* — Q = mL; energy absorbed/released at phase transition WITHOUT temperature change. L_f (fusion) ice→water = 334 kJ/kg. L_v (vaporisation) water→steam = 2260 kJ/kg.  
  _Targets misconception: ice at 0°C = water at 0°C energetically_
- 💎 **`stefan_boltzmann_atomic`** *(atomic)* — Total power radiated by black/grey body: P = σεAT⁴. σ = 5.67 × 10⁻⁸ W/m²·K⁴. ε = emissivity (1 for blackbody, <1 for grey body). **Bridges to T38 EM Waves** (radiation IS EM).
- 💎 **`wien_displacement_atomic`** *(atomic)* — λ_max · T = b (b = 2.898 × 10⁻³ m·K). Peak wavelength of blackbody spectrum shifts inversely with T. Sun (5778 K): λ_max ≈ 500 nm (yellow-green). Earth (300 K): λ_max ≈ 10 μm (infrared).

## T26 — Thermodynamics  *(Class 11)*

- 💎 **`isothermal_process_atomic`** *(atomic)* — T = constant; for ideal gas ΔU = 0 → Q = W; W = nRT ln(V_f/V_i); PV = constant (Boyle's law)
- 💎 **`adiabatic_process_atomic`** *(atomic)* — Q = 0 (no heat exchange); ΔU = −W; PV^γ = constant; T₁V₁^(γ−1) = T₂V₂^(γ−1); steeper PV-curve than isothermal
- 💎 **`carnot_cycle_atomic`** *(atomic)* — 4-stroke reversible cycle: isothermal-expansion (T_hot) → adiabatic-expansion → isothermal-compression (T_cold) → adiabatic-compression. η_Carnot = 1 − T_cold/T_hot
- 💎 **`entropy_atomic`** *(atomic)* — S = ∫dQ_rev/T (operational definition); ΔS_universe ≥ 0 for any real process; entropy is a STATE function (despite Q being path function — Q_rev/T is path-independent for reversible paths)

## T27 — Kinetic Theory  *(Class 11)*

- 💎 **`kinetic_theory_pressure_atomic`** *(atomic)* — PV = (1/3)Nm⟨v²⟩; pressure as time-averaged momentum-flux from molecular collisions on container walls; central derivation of chapter
- 💎 **`maxwell_boltzmann_distribution_atomic`** *(atomic)* — f(v) = 4π(m/2πkT)^(3/2) v² exp(−mv²/2kT); probability-density of molecular speeds; peaks at v_mp; broadens with T

## T35 — EM Induction  *(Class 12)*

- 💎 **`faradays_law`** *(atomic)* — ε = −dΦ_B/dt; an EMF is induced whenever flux through a loop changes
- 💎 **`lenz_law`** *(atomic)* — Induced current direction opposes the change that caused it (energy conservation)
- 💎 **`motional_emf`** *(atomic)* — ε = (v × B)·L for a conducting rod moving in B; mechanical work → electrical energy
- 💎 **`ac_generator`** *(atomic)* — Rotating coil in uniform B → sinusoidal EMF ε = NBAω sin(ωt)

## T36 — Moving Charges Magnetism  *(Class 12)*

- ✦ **`magnetic_field_concept_B`** *(atomic)* — A magnetic field B is a vector field produced by moving charges or currents; exerts force on other moving charges/currents. SI unit Tesla.
- 💎 **`magnetic_field_long_straight_wire_B_equals_mu0_I_over_2pi_r`** *(atomic)* — Field magnitude at perpendicular distance r from an infinitely long straight wire carrying current I: B = μ₀I/(2πr)

## T38 — EM Waves  *(Class 12)*

- 💎 **`speed_of_light_derivation`** *(atomic)* — c = 1/√(μ₀ε₀); pure-constants result from Maxwell's equations
- 💎 **`hertz_experiment_atomic`** *(atomic)* — Spark-gap oscillator + resonant receiver → first experimental confirmation of EM waves (1887)

## T39 — AC Circuits  *(Class 12)*

- 💎 **`resonance_in_lcr_atomic`** *(atomic)* — At ω₀ = 1/√(LC), X_L = X_C → Z minimized = R → I maximized; sharpness Q = ω₀L/R

## T42 — Refraction Lenses Prism  *(Class 12)*

- 💎 **`refractive_index_table_common_substances`** *(nano)* — Water 1.33, crown glass 1.52, dense flint 1.62, diamond 2.42 (NCERT Table 9.1). Just the values
- 💎 **`critical_angle_values_common_media`** *(nano)* — Water 48.75°, crown glass 41.14°, dense flint 37.31°, diamond 24.41°. The "smaller critical angle = more brilliant" insight
- 💎 **`scattering_rayleigh`** *(atomic)* — Per RF-G5: own atomic. Intensity scattered ∝ 1/λ⁴. Shorter λ (blue, violet) scatter more. Sky appears blue (violet scattered even more but eye less sensitive). Sunset/sunrise red (long path through atmosphere strips blue/violet, leaves red). Indian-context anchor: every Indian evening sky + diamond/peacock-feather iridescence

## T49 — Semiconductor  *(Class 12)*

- 💎 **`pn_junction_unbiased`** *(atomic)* — Depletion region formation, built-in potential V_bi, no external current
- 💎 **`transistor_npn`** *(atomic)* — NPN BJT: emitter-base forward, base-collector reverse; α and β current gains

## T50 — Communication Systems  *(Class 12)*

- 💎 **`amplitude_modulation`** *(atomic)* — Carrier amplitude varied with message; c(t) = (A_c + A_m sin ω_m t) sin ω_c t
