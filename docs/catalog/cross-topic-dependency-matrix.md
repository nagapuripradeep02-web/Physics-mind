# Cross-Topic Dependency Matrix

> **Purpose:** Auto-aggregating sparse N×N matrix of all cross-topic-refs identified across the 44 triple-covered topic catalogs. Each new catalog adds 1 row (its OUT-edges to other topics). Eventually the full 44×44 matrix exposes the cluster structure of physics knowledge.

> **Not built via explicit 946-pairwise sessions** — that would record ~700 "no relation" cells as noise. This matrix accumulates the edges that the catalogs naturally surface via their Section D `Requires` / `Required-by` / cross-topic-refs columns. Established at the 3-pilot completion checkpoint per founder Session 36 decision (2026-05-25).

> **Maintenance rule:** When a new topic-N catalog ships, add 1 row to Part B (its OUT-edges) and append all its cross-topic-refs to Part A (edges list). Should take ≤10 min per topic.

---

## Part A — Edges list (sparse, append-only)

Each row = one cross-topic edge surfaced by a catalog. Format:

`source_topic | source_atomic_id | → | target_topic | target_concept (with section ref if external) | edge_type | catalog_file`

Edge types:
- **prereq** — source atomic REQUIRES target concept (target must be understood first)
- **applies** — source atomic APPLIES target concept (e.g., friction problem uses Newton's law)
- **bridges** — source atomic naturally extends into target topic (e.g., current loop = magnetic dipole bridges to permanent magnets)
- **math-tools** — target is a math-tool prereq. **Stage-3 reference file shipped 2026-05-25** at `physics-mind/docs/catalog/stage-3-math-tools.md`. Future catalogs should cite specific primitive IDs (e.g., `trig_small_angle_approximations`) instead of generic `math-tools`.

### Edges from Topic 12 — Friction

| Source atomic | → | Target | Type | Notes |
|---|---|---|---|---|
| A27 `circular_motion_friction_provides_centripetal` | → | Topic 10 Circular Motion | applies | NCERT Ex 5.10 + §5.10 banked road; A27 catalogued here as cross-topic-ref because Topic 10 owns the centripetal-force foundation |
| N22.3 `minimize_F_over_theta` | → | math-tools: calculus_minmax | math-tools | Min force at optimal angle uses dF/dθ = 0 |

### Edges from Topic 21 — Wave Motion

| Source atomic | → | Target | Type | Notes |
|---|---|---|---|---|
| CT1 `simple_harmonic_motion` | → | Topic 17 SHM | prereq | A8 sinusoidal wave depends on SHM (N11.2 Ch.14, DCM2 Ch.13, HCV1 Ch.12) |
| CT2 `bulk_modulus_B` | → | Topic 18 Elasticity | prereq | A16 longitudinal-wave-speed in fluid requires bulk modulus |
| CT3 `youngs_modulus_Y` | → | Topic 18 Elasticity | prereq | A17 longitudinal-wave-speed in solid requires Young's modulus |
| CT4 `centripetal_force_F=mv2/R` | → | Topic 10 Circular Motion | prereq | N14.2 circular-arc derivation of v=√(T/μ) uses centripetal force |
| CT5 `partial_derivative` | → | math-tools: partial_derivative | math-tools | A6, A21, A23 all use ∂/∂x, ∂/∂t |
| CT6 `wave_reflection_standing_waves` | → | Topic 22 Superposition + Standing Waves | bridges | A19 superposition principle bridges into Topic 22 full treatment |
| CT7 `sound_waves_doppler_beats` | → | Topic 23 Sound Waves | bridges | A16/A17/A18 wave-speed-in-fluids/solids overlap with sound |
| CT8 `polarization_of_waves` | → | Topic 44 Wave Optics | bridges | HCV1 §15.15 polarization is cross-listed |

### Edges from Topic 36 — Moving Charges & Magnetism

| Source atomic | → | Target | Type | Notes |
|---|---|---|---|---|
| CT1 `vector_cross_product` | → | math-tools: vector_cross_product | math-tools | A3, A4, A15, A20, A30 all use cross product |
| CT2 `centripetal_force` | → | Topic 10 Circular Motion | prereq | A7 (circular motion in B), A8 (cyclotron radius) require centripetal force balance |
| CT3 `uniform_circular_motion` | → | Topic 10 Circular Motion | prereq | A7, A8, A9, A10 cyclotron cluster |
| CT4 `electric_field_E_and_F=qE` | → | Topic 30 Electrostatics | prereq | N3.2, A13 velocity selector, A34 combined Lorentz |
| CT5 `coulombs_law` | → | Topic 30 Electrostatics | prereq | A20 Biot-Savart vs Coulomb comparison |
| CT6 `electric_dipole_potential_torque` | → | Topic 30 Electrostatics | prereq | A29-A32 magnetic dipole story parallels electric dipole |
| CT7 `line_integral` | → | math-tools: line_integral | math-tools | A26 Ampere's law uses ∮ |
| CT8 `gauss_law_for_electric_field` | → | Topic 31 Gauss's Law | prereq | A26 — Ampere is to Biot-Savart what Gauss is to Coulomb |
| CT9 `bohr_model_atom` | → | Topic 47 Atomic Models | bridges | A33 magnetic moment of revolving electron |
| CT10 `permanent_magnet_dipole` | → | Topic 37 Magnetism & Matter | bridges | A31 current loop = elementary dipole bridges to permanent magnets |

### Edges from Topic 10 — Circular Motion

| Source atomic | → | Target | Type | Notes |
|---|---|---|---|---|
| CT1 `vector_resolution_components` | → | Topic 5 Vectors | prereq | A13, A14, A15, A29 use it (already shipped in repo) |
| CT2 `newton_2nd_law_arbitrary_direction` | → | Topic 11 Newton's Laws | prereq | A10 + all dynamics atomics; already shipped (`newton_second_law_direction`) |
| CT3 `friction_static_kinetic` | → | Topic 12 Friction | prereq | A12, A21, A22, A23 use it; **closes incoming-edge from Friction A27** |
| CT4 `work_energy_theorem` | → | Topic 13 Work-Energy | prereq | A17 vertical-circle u_min derivation requires WET; closed by batch partner Topic 13 in this session |
| CT5 `non_inertial_frame_pseudo_forces` | → | Topic 11 Newton's Laws (advanced) | prereq | A26, A27, A31 need it; NCERT skips, DCM1+HCV1 cover |
| CT6 `torque_and_rotational_equilibrium` | → | Topic 7 Rotational Dynamics | prereq | A15 cyclist + A25 toppling use rotational equilibrium |
| CT7 `projectile_motion` | → | Topic 9 Kinematics 2D | prereq | A28 radius of curvature is a projectile-trajectory result; already shipped |
| CT8 `gravitation_inverse_square` | → | Topic 16 Gravitation | applies | A29 (g vs g'); N11.1 (planet centripetal source) |
| CT9 `simple_harmonic_motion` | → | Topic 17 SHM | bridges | A18 pendulum-as-vertical-circle bridges to SHM small-angle approx |
| CT10 `calculus_derivative_basics` | → | math-tools: calculus_basics | math-tools | A2, A3, A5 use dω/dt, dθ/dt |

### Edges from Topic 13 — Work, Energy and Power

| Source atomic | → | Target | Type | Notes |
|---|---|---|---|---|
| CT1 `dot_product_F_dot_d` | → | Topic 5 Vectors | prereq | A1, A19 use dot product; already shipped |
| CT2 `newton_2nd_law` | → | Topic 11 Newton's Laws | prereq | A7 derivation requires F = ma |
| CT3 `friction_kinetic` | → | Topic 12 Friction | prereq | A14, A26, A29 use μ_k·N |
| CT4 `vertical_circular_motion` | → | Topic 10 Circular Motion | bridges | A24 loop-the-loop is dual perspective of Topic 10 A17; **closes incoming-CT4 from Topic 10** |
| CT5 `conservation_of_linear_momentum` | → | Topic 14 Momentum/Collisions | bridges | Collisions split off to Topic 14 per WE-G1 founder decision |
| CT6 `simple_harmonic_motion` | → | Topic 17 SHM | bridges | A23 spring-block oscillation IS SHM with energy lens |
| CT7 `gravitation_inverse_square` | → | Topic 16 Gravitation | bridges | A30 central-force U(r) = −k/r is gravitational PE at planetary scale |
| CT8 `coulombs_law_electric_PE` | → | Topic 30 Electrostatics | bridges | A30 same math applies to charges with k = ke²/4πε₀; cross-link with Topic 36 A20 |
| CT9 `calculus_integration` | → | math-tools: calculus_integration | math-tools | A2, A12, A30 use ∫F·dr |

### Edges from Topic 17 — Simple Harmonic Motion

| Source atomic | → | Target | Type | Notes |
|---|---|---|---|---|
| A1-derived `transverse_wave_as_collection_of_oscillators` | → | Topic 18 Wave Motion | bridges | NCERT §14.2 closing: "any material medium can be pictured as a collection of a large number of coupled oscillators" |
| A4-derived `wave_equation_general_solution_sinusoidal` | → | Topic 19 Wave Equation | bridges | The d²x/dt² = −ω²x → x = A sin(ωt+φ) machinery transfers directly to wave eq |
| A4-derived `each_particle_executes_shm_at_fixed_point` | → | Topic 22 Standing Waves | bridges | Particle motion in standing wave = SHM at fixed location |
| A4-derived `pressure_oscillation_sinusoidal_acoustic` | → | Topic 23 Sound Waves | bridges | NCERT §14.2: "pressure variations in time in propagation of sound" |
| A21 `angular_shm_equation_gamma_minus_k_theta` | → | Topic 30 Electrostatics | bridges | **Direct bridge: HCV2 §29 W.Ex 19 — dipole in uniform E field executes angular SHM, uses A21 directly** |
| A1/A4-derived `lc_oscillator_charge_obeys_shm` | → | Topic 44 LC Oscillations | bridges | Same d²q/dt² = −q/LC math form; ω = 1/√(LC). Most-cited cross-topic analogy in physics. |
| A23-derived `exponential_decay_envelope_analogy` | → | Topic 31 RC Circuits | bridges | Weak analogy: damped SHM e^(−bt/2m) ↔ RC discharge e^(−t/RC); shared exponential envelope concept |

### Edges from Topic 30 — Electrostatics

| Source atomic | → | Target | Type | Notes |
|---|---|---|---|---|
| A14 + A18 `E_and_V_become_capacitance_parallel_plate` | → | Topic 31 Capacitors | prereq | C = ε₀A/d derives directly from sheet field (A18) + potential (A21) |
| A20 `electric_PE_becomes_energy_stored_in_capacitor` | → | Topic 31 Capacitors | prereq | U_cap = ½CV² generalizes A20 PE concept to plates |
| A14 + A5 `E_drives_drift_velocity_in_conductor` | → | Topic 32 Current Electricity | prereq | v_d = eEτ/m uses field acting on free electrons (A14 + A5) |
| A21 `V_definition_used_in_ohms_law` | → | Topic 32 Current Electricity | prereq | V/I = R uses potential difference (A21) |
| A21 `V_used_in_power_dissipation` | → | Topic 33 Heating Effects | prereq | P = VI uses A21 V definition |
| A1 `charge_concept_reused_for_lorentz_force` | → | Topic 36 Moving Charges & Magnetism | bridges | Charge in motion → F = qv×B; same A1 charge from Topic 30 |
| A1 `stationary_charges_in_E_become_moving_charges_in_B` | → | Topic 37 Magnetism & Matter | bridges | Charges producing E when stationary produce B when moving — Biot-Savart |
| A20 `capacitor_energy_used_in_LC_oscillation` | → | Topic 44 LC Oscillations | bridges | Energy oscillates between E-field (capacitor) and B-field (inductor) — uses A20 |
| A28 `dipole_as_angular_shm_uses_T17` | → | Topic 17 SHM | bridges (reverse) | **Bidirectional bridge with T17 — A28 uses A21 from Topic 17** |

### Edges from Topic 16 — Gravitation

| Source atomic | → | Target | Type | Notes |
|---|---|---|---|---|
| A16 `orbital_velocity_uses_centripetal` | → | Topic 10 Circular Motion | prereq | Satellite in circular orbit balances gravity vs centripetal demand |
| A15 `keplers_laws_use_angular_momentum_conservation` | → | Topic 11 Rotational Mech | prereq | Law of areas follows from L-conservation for central force |
| A13 `gravitational_PE_uses_conservative_force_definition` | → | Topic 13 Work-Energy | prereq | `U = -GMm/r` defined via line integral of conservative F |
| A18 `escape_velocity_uses_energy_conservation` | → | Topic 13 Work-Energy | prereq | KE + PE = const between surface and infinity |
| A22 `weightlessness_in_orbit_uses_free_fall` | → | Topic 6 Kinematics 1D | prereq | Astronaut + satellite both accelerate at g_local → no normal force |
| A5 `acceleration_due_to_gravity_used_by_pendulum` | → | Topic 17 SHM | required-by (reverse) | T17 pendulum period depends on g; closes one T17 incoming reference |
| A1 `newton_law_is_inverse_square_analogue_of_coulomb` | → | Topic 30 Electrostatics | bridges | Both are 1/r² conservative central forces; NCERT §2.1 makes this explicit |
| Math-tools refs (3): `integration_basics`, `binomial_theorem_math`, `partial_differentiation_math` | → | math-tools | math-tools | Cavendish derivation + g(h) Taylor expansion + E = -∇V |

### Edges from Topic 31 — Capacitors

| Source atomic | → | Target | Type | Notes |
|---|---|---|---|---|
| A1 `isolated_conductor_capacitance_requires_V` | → | Topic 30 Electrostatics | prereq | V referenced to infinity is the upstream concept |
| A3 `parallel_plate_derivation_uses_gauss_law` | → | Topic 30 Electrostatics | prereq | Cylinder-through-plate Gauss derivation |
| A6 `dielectric_polarisation_uses_dipole` | → | Topic 30 Electrostatics | prereq | Polarisation P = aligned dipoles |
| A14 `corona_discharge_uses_pointed_conductor_field` | → | Topic 30 Electrostatics | prereq | Field amplification at small radius of curvature |
| A11 `energy_stored_in_capacitor_uses_work_done` | → | Topic 13 Work-Energy | prereq | `U = ∫(q/C)dq` from 0 to Q |
| A2 `two_conductor_capacitor_uses_charge_conservation` | → | Topic 29 Electric Charges | prereq | Net charge on system = 0 |
| A9 `capacitor_series_parallel_is_resistor_analogue` | → | Topic 34 Current Electricity | bridges (bidirectional) | Same combination logic, conserved quantity flips (Q vs I) |
| Math-tools refs (1): `integration_basics` | → | math-tools | math-tools | ∫dW = ∫(q/C)dq derivation |

**Note on T30→T31 edges:** T31's catalog identifies 4 prereqs from T30 (potential, Gauss, dipole, sharp-edge field), whereas T30's row originally surfaced only 2 (parallel-plate + capacitor-energy). Auto-aggregation: the T30→T31 cell is now incremented from 2 to 4 to reflect the T31-side discoveries. This is the matrix working as designed — both ends agree, count converges.

### Edges from Topic 29 — Electric Charges & Fields

| Source atomic | → | Target | Type | Notes |
|---|---|---|---|---|
| A1 `electric_charge_basics` | → | Topic 30 Electrostatics | prereq | Charge quantisation + sign convention precede field/Gauss/dipole |
| A4 `charging_by_induction` | → | Topic 30 Electrostatics | bridges | Induced surface charges → dipole-in-external-field generalization (T30 A28) |
| A14 `field_inside_conductor_is_zero` | → | Topic 30 Electrostatics | bridges | Gauss-law conductor-cavity derivation closes the bridge |
| A14 `field_inside_conductor_is_zero` | → | Topic 31 Capacitors | prereq | Capacitor plate-charge sits on inner surfaces — same redistribution physics |
| A14 `field_inside_conductor_is_zero` | → | Topic 34 Current Electricity | prereq | Inside ideal conductor with no current ⇒ V_AB constant (wheatstone balance condition basis) |
| A9 `superposition_principle_for_charges` | → | Topic 34 Current Electricity | bridges | Kirchhoff's junction rule = superposition applied to currents at a node (NCERT explicit) |
| A8 `coulomb_vs_gravity_strength` | → | Topic 16 Gravitation | bridges (reverse) | The 1/r² parallel; ratio F_e/F_G ≈ 10³⁹ for e-p anchors atomic-vs-cosmic intuition |
| A5 `conductor_vs_insulator` | → | Topic 36 Magnetic Effects | bridges | Free-electron model is foundation for current-carrying-wire-in-B atomic |
| Math-tools refs (1): `vector_addition` (Coulomb vector form + superposition) | → | math-tools | math-tools | A7 + A9 both terminate here |

### Edges from Topic 34 — Current Electricity

| Source atomic | → | Target | Type | Notes |
|---|---|---|---|---|
| A2 `drift_velocity` | → | Topic 29 Electric Charges | prereq | Requires conductor-vs-insulator + electric field definition |
| A16 `kirchhoff_junction_rule_KCL` | → | Topic 29 Electric Charges | prereq | Charge-conservation foundation = T29 A1 nano N1.2 generalized to current |
| A21 `wheatstone_bridge_balance` | → | Topic 29 Electric Charges | prereq | Field-inside-conductor zero (T29 A14) is the basis for "no current ⇒ no potential difference" |
| A17 `kirchhoff_loop_rule_KVL` | → | Topic 30 Electrostatics | prereq | Electric field is conservative — energy conservation in closed loop = electrostatic-field property |
| A20 `grouping_cells_mixed_max_power_transfer` | → | Topic 30 Electrostatics | bridges | Power-transfer theorem applies in any source-network — referenced from Thevenin theory which is Stage-4 |
| A27 `rc_circuit_charging_discharging` | → | Topic 31 Capacitors | prereq (bidirectional) | **Closes the T31 ↔ T34 RC bridge.** q(t) = εC(1−e^(−t/τ)) requires capacitance C concept from T31 |
| A14, A15 `resistors_in_series_parallel` | → | Topic 31 Capacitors | bridges | Inverse-analogy: capacitors series ↔ resistors parallel, conserved quantity flips (Q ↔ V) |
| A12 `emf_definition` | → | Topic 31 Capacitors | bridges | RC charging needs both emf source (T34) and capacitor (T31) |
| A12 `emf_definition` | → | Topic 35 EM Induction | bridges | Motional emf + induced emf both extend the static-emf concept |
| A16, A17 Kirchhoff trio | → | Topic 36 Magnetic Effects | bridges | Ampère's law network analysis uses same junction/loop logic |
| Math-tools refs (2): `linear_simultaneous_equations` (Kirchhoff multi-loop) + `exponential_decay` (RC τ-decay) | → | math-tools | math-tools | A17, A19, A20, A27 all terminate here |

**Note on T29 → T34 and T34 → T29 bidirectional edges:** This paired-batch surfaces 5 edges between T29 and T34 (3 from T29 side, 2 from T34 side, including Kirchhoff = superposition which both ends flagged independently). Validates the paired-batch design — adjacent E&M topics share more bidirectional structure than non-adjacent topics.

### Edges from Topic 41 — Ray Optics (Reflection + Spherical Mirrors)

| Source atomic | → | Target | Type | Notes |
|---|---|---|---|---|
| A5 `cartesian_sign_convention_mirrors` | → | Topic 42 Refraction/Lenses | prereq (analogous) | Lens sign convention parallels mirror sign convention with single difference: incident-light direction continues forward (lens) vs reverses (mirror) |
| A13 `paraxial_approximation_for_mirrors` | → | Topic 42 Refraction/Lenses | prereq (analogous) | Small-angle, small-aperture assumptions identical for lenses |
| A6 `mirror_equation` | → | Topic 42 Refraction/Lenses | prereq (pattern-source) | The 1/v + 1/u = 1/f derivation via similar triangles is the template for lens-formula derivation |
| A7 `lateral_magnification_mirror` | → | Topic 42 Refraction/Lenses | prereq (analogous, sign-flipped) | Mirror m = -v/u; lens m = +v/u. Sign difference traces to convention difference |
| A11 `spherical_aberration_mirror` | → | Topic 43 Optical Instruments | prereq | Cassegrain telescope (NCERT §9.9.3 Kavalur 2.34m IIA Bangalore) uses parabolic primary |
| A9 `convex_mirror_image_always_virtual` | → | Topic 43 Optical Instruments | bridges | Traffic-safety dome mirrors + vehicle rear-view mirrors are instrument applications of A9 |
| A1 `laws_of_reflection` | → | Topic 44 Wave Optics | prereq (reverse-direction usage) | Huygens principle derives i=r from wavefront construction; T44 uses T41 A1 as input check |
| A12 `velocity_of_image_in_curved_mirror` | → | Topic 6 Kinematics 1D | applies (cross-cluster) | NCERT Example 9.4 jogger problem uses relative-velocity machinery from T6. Bridge Optics↔Mechanics |
| A11 `spherical_aberration` (Kavalur anchor) | → | Topic 36 Moving Charges (anchor parallel) | bridges (anchor-only) | Cassegrain at IIA Bangalore is also a Moving-Charges anchor reference. Weak edge — anchor-level only |
| Math-tools refs (2): `similar_triangles`, `small_angle_tan_theta_approx` | → | math-tools | math-tools | A6 mirror-equation derivation; A13 paraxial small-angle |

### Edges from Topic 42 — Refraction + Lenses + Prism + TIR + Dispersion

| Source atomic | → | Target | Type | Notes |
|---|---|---|---|---|
| A11 `thin_lens_formula` | → | Topic 41 Ray Optics (Mirrors) | prereq (back-edge, pattern) | Lens-formula derivation reuses mirror-equation similar-triangle template (A6 in T41). Bidirectional |
| A9 `refraction_at_single_spherical_surface` | → | Topic 41 Ray Optics (Mirrors) | prereq (back-edge, sign) | Reuses T41 A5 sign convention with adapted-for-refraction signs |
| A12 `lens_magnification` | → | Topic 41 Ray Optics (Mirrors) | prereq (back-edge, sign-difference) | m = +v/u (lens) vs m = -v/u (mirror); sign flip taught against T41 background |
| A26 `eye_accommodation_defects` | → | Topic 43 Optical Instruments | prereq | NCERT §9.9.1 eye atomic catalogued here; integrated as "eye as optical instrument" in T43 |
| A10 + A11 + A12 + A13 lens-formula cluster | → | Topic 43 Optical Instruments | prereq | Microscope + telescope all built on lens equation + magnification + power |
| A15 `two_lenses_separated_by_distance` | → | Topic 43 Optical Instruments | prereq | When d = f_o + f_e: telescope. The instrument is built from this atomic |
| A8 `TIR_prism_periscope_binocular` | → | Topic 43 Optical Instruments | bridges | Indian Army periscope + naval submarine — TIR-prism instrument application |
| A2 `snells_law` | → | Topic 44 Wave Optics | prereq (reverse-direction usage) | Huygens principle derives Snell's law; T44 uses T42 A2 as input check |
| A22 `dispersion_by_prism` | → | Topic 44 Wave Optics | bridges | Wavelength-dependent μ enters wave-optics treatment of color + chromatic aberration |
| A25 `scattering_rayleigh` | → | Topic 44 Wave Optics | bridges | Intensity ∝ 1/λ⁴ is a wave-optics result (EM interaction with sub-wavelength scatterers) |
| A22 `dispersion_by_prism` | → | Topic 45 Atomic Spectra (placeholder) | bridges | Spectral lines (Fraunhofer, Balmer, Lyman) are dispersion of atomic emission; spectroscope built on prism |
| Math-tools refs (3): `trig_identities_for_prism_min_deviation`, `1_over_x_algebra`, `mu_chain_product_rule` | → | math-tools | math-tools | A20 prism min-dev formula; A11 lens equation; A1 μ chain rule |

**Note on T41 ↔ T42 bidirectional edges:** This paired-batch surfaces 7 edges between T41 and T42 (4 from T41 side, 3 back-edges from T42 side). Like T29 ↔ T34 (5 edges) and T17 ↔ T30 (2 edges), the paired-batch design surfaces dense bidirectional structure between adjacent topics. T41 + T42 are intra-cluster paired (same Ch.9 in NCERT) so the high density is expected — they are conceptually the same chapter split for cataloging purposes.

### Edges from Topic 43 — Optical Instruments

| Source atomic | → | Target | Type | Notes |
|---|---|---|---|---|
| `resolving_power_microscope` | → | Topic 44 Wave Optics | prereq | RP derivation uses Fraunhofer diffraction (1.22λ factor) from T44 §10.6.3 |
| `resolving_power_telescope` | → | Topic 44 Wave Optics | prereq | Same — Rayleigh criterion is a wave-optics result |
| `oil_immersion_objective` (nano under `resolving_power_microscope`) | → | Topic 44 Wave Optics | prereq | n sinβ numerical-aperture argument requires single-slit-diffraction-geometry |
| `fraunhofer_diffraction_circular_aperture` (cross-listed) | → | Topic 44 Wave Optics | prereq | T43 atomic is the application; T44 owns the foundational physics |
| `compound_microscope_construction` | → | Topic 42 Refraction/Lenses | prereq (already noted as IN-edge in T42) | Back-edge confirms tight T42 ↔ T43 coupling |
| `astronomical_telescope_construction` | → | Topic 42 Refraction/Lenses | prereq (already noted) | Same — back-edge |
| `reflecting_telescope_cassegrain_newton` | → | Topic 41 Ray Optics (Mirrors) | prereq | Parabolic-mirror primary needs `spherical_aberration_mirror` from T41 A11 — back-edge confirming T41 → T43 |
| `myopia_correction` / `hyperopia_correction` / `presbyopia_age_related` | → | Topic 42 Refraction/Lenses | prereq | All three defects-of-vision atomics use `power_of_lens` from T42 A13 |
| `periscope_TIR_prisms` + `binocular_construction` + `optical_fibre_endoscope` | → | Topic 42 Refraction/Lenses | applies | TIR-prism and optical-fibre instruments are applications of T42 A6, A7, A8 |
| Math-tools refs (2): `small_angle_approximation`, `calculus_for_focal_length_range` | → | math-tools | math-tools | Telescope/microscope magnifying-power formulas; accommodation f_max/f_min range |

### Edges from Topic 44 — Wave Optics

| Source atomic | → | Target | Type | Notes |
|---|---|---|---|---|
| `superposition_principle_waves` (specific to light) | → | Topic 15 Waves | prereq (generic) | T15 owns the generic superposition principle; T44 specializes it to light |
| `polarisation_transverse_wave_proof` | → | Topic 21 EM Waves | prereq | Light's transverse nature established via polarisation; T21 owns the EM-wave-is-transverse formalism |
| `doppler_effect_light` | → | Topic 23 Sound Waves (analogy) | bridges | Same Δν/ν = -v/c structure; T23 owns the Doppler-for-mechanical-waves derivation. Acoustic analogy, not strict prereq |
| `refraction_wave_theory_snells_law` | → | Topic 42 Refraction/Lenses | prereq (back-edge) | T44 derives Snell's law from Huygens; T42 uses Snell's law operationally. **Bidirectional** with T42 A2 (already noted) |
| `ydse_with_white_light_central_white` | → | Topic 42 Refraction/Lenses | prereq | Uses `dispersion_by_prism` (T42 A22) wavelength-dependence |
| `polarisation_by_scattering` | → | Topic 42 Refraction/Lenses | prereq | Uses `scattering_rayleigh` (T42 A25) |
| `resolving_power_telescope` / `resolving_power_microscope` (cross-listed with T43) | → | Topic 43 Optical Instruments | bridges | T44 owns the foundational physics; T43 owns the instrument-context. **Bidirectional** with T43 OUT-edges |
| `doppler_effect_light` | → | Topic 45 Atomic Spectra | bridges | Red/blue shift of hydrogen Balmer lines = doppler effect applied to atomic emission |
| `polarisation_transverse_wave_proof` | → | Topic 47 Dual Nature | bridges | Wave-particle duality framing — polarisation = wave-side evidence |
| `huygens_principle` + `single_slit_diffraction_geometry` | → | Topic 46 Modern Physics (matter waves) | bridges (weak) | De Broglie's matter waves diffract through crystals → same mathematics |
| Math-tools refs (3): `binomial_approximation_a2_plus_b2`, `time_averaging_cos_squared`, `small_angle_sin_theta_approx` | → | math-tools | math-tools | A10 (ydse path-diff derivation), A13 + Malus law (cos² integration), all diffraction atomics |

**Note on T43 ↔ T44 bidirectional edges:** Optics cluster closure surfaces 7 bidirectional edges between T43 and T44 (4 from T43 side: resolving_power_micro/telescope, oil_immersion, fraunhofer-circular; 3 from T44 side: resolving_power references back). Tied with T41 ↔ T42 (7 edges) for densest paired-batch yet observed. **Confirms Optics cluster's intra-cluster tightness hypothesis** raised in Part C after-13-pilots Observation 2.

### Edges from Topic 47 — Atomic Models

| Source atomic | → | Target | Type | Notes |
|---|---|---|---|---|
| `bohr_third_postulate_transition_photon_emission` | → | Topic 45 Atomic Spectra | prereq | THE foundational bridge — every T45 spectra atomic uses this postulate |
| `bohr_energy_in_nth_orbit` | → | Topic 45 Atomic Spectra | prereq | Energy quantization formula underlies all spectral series + Rydberg |
| `energy_level_diagram_hydrogen` | → | Topic 45 Atomic Spectra | prereq | Visual organizing principle for all spectra transitions |
| `hydrogen_like_ion_Z_factor` | → | Topic 45 Atomic Spectra | prereq | Z² scaling extends spectra to He⁺, Li²⁺ — JEE-Adv pattern |
| `bohr_model_limitations` | → | Topic 46 Dual Nature (anticipated) | bridges | Multi-electron failure motivates wave-particle quantum mechanics |
| `orbit_vs_orbital_quantum_mechanics` | → | Topic 46 Dual Nature (anticipated) | bridges | Direct conceptual handoff to wave function |
| `distance_of_closest_approach` | → | Topic 48 Nuclei (anticipated) | applies | Upper bound on nuclear size → leads to R = R₀A^(1/3) atomic |
| `bohr_radius_derivation` + `bohr_energy_in_nth_orbit` | → | Topic 36 Moving Charges (back-edge) | prereq (bidirectional) | T36 A33 "magnetic dipole moment of revolving electron" uses Bohr framework; **closes the T36 → T47 forward edge that's been pending since session 36** |
| `rutherford_alpha_scattering_experiment` | → | Topic 30 Electrostatics (back-edge) | prereq | Uses Coulomb's law for repulsion derivation |
| Math-tools refs (2): [`calculus_minmax`](stage-3-math-tools.md), [`series_binomial_expansion_and_approximation`](stage-3-math-tools.md) | → | math-tools | math-tools | Relativistic-correction expansions; orbit-radius minimization |

### Edges from Topic 45 — Atomic Spectra

| Source atomic | → | Target | Type | Notes |
|---|---|---|---|---|
| `emission_line_spectrum` | → | Topic 47 Atomic Models (back-edge) | applies | Spectra IS the experimental verification of T47 Bohr model. **Bidirectional with T47** — strong cluster-internal tightness signal |
| `rydberg_constant_theoretical_vs_empirical` | → | Topic 47 Atomic Models | applies | Theoretical R from T47 eq 12.23 ≈ empirical R = direct Bohr-model validation. Closes the validation loop |
| `spectral_line_doppler_shift_red_blue` | → | Topic 44 Wave Optics (back-edge) | prereq | Uses T44 `doppler_effect_light`; T45 extends to astronomy (red/blue shift) context. **Bidirectional with T44** |
| `x_ray_continuous_bremsstrahlung_cutoff` + `x_ray_characteristic_k_alpha_k_beta` | → | Topic 46 Dual Nature (anticipated) | prereq | Both atomics use `photon_energy = hf` from T46 |
| `x_ray_production_coolidge_tube` | → | Topic 30 Electrostatics + Topic 36 Moving Charges | applies | Accelerated charges + EM radiation |
| `absorption_line_spectrum` `→ kirchoffs_radiation_law` nano | → | Topic 18 Thermodynamics (anticipated) | bridges | Black-body radiation chapter cross-link |
| `he_ne_laser_construction` | → | Topic 42 Refraction (back-edge, weak) | applies | Laser uses cavity-mirror reflection (T41 mirrors) + monochromaticity (T44 single-frequency) |
| `moseley_law` | → | Chemistry curriculum (cross-subject) | bridges | Periodic-table reordering by Z; out-of-physics-scope but flagged |
| Math-tools refs (2): [`algebra_one_over_x_manipulation`](stage-3-math-tools.md), [`series_combinatorial_n_choose_2`](stage-3-math-tools.md) | → | math-tools | math-tools | All series formulas; n(n−1)/2 number-of-spectral-lines |

**Note on T45 ↔ T47 bidirectional edges:** Modern Physics cluster opener surfaces **9 bidirectional edges** between T45 and T47 — **the densest paired-batch edge count yet observed** (previous max 7 for both Optics intra-cluster pairs). 4 forward T47 → T45 (Bohr postulate + energy + level-diagram + Z-factor), 1 back T45 → T47 (spectra-verifies-Bohr-loop), plus 4 cluster-bridge edges. **Confirms Modern Physics cluster's even tighter intra-cluster tightness than Optics** — 100% of forward edges and back-edge stay inside the model+spectra+dual-nature triangle.

### Edges from Topic 46 — Dual Nature of Radiation and Matter

| Source atomic | → | Target | Type | Notes |
|---|---|---|---|---|
| `de_broglie_wavelength_matter_waves` | → | Topic 47 Atomic Models (back-edge) | prereq (bidirectional) | Provides retroactive justification for `bohr_second_postulate_angular_momentum_quantization`. **Closes Session 43 forward edge from T47 nano `de_broglie_wave_interpretation`** |
| `heisenberg_uncertainty_principle` | → | Topic 47 Atomic Models (back-edge) | prereq (bidirectional) | Motivates `bohr_model_limitations` — Bohr's definite orbits violate Δx·Δp ≥ ℏ |
| `photon_particle_nature_of_light` | → | Topic 48 Nuclei | prereq | γ-photons in nuclear decay use E = hν from T46 |
| `photoelectric_effect_phenomenology` | → | Topic 49 Semiconductor (anticipated) | applies | Photovoltaic effect in solar cells extends T46 to semiconductor doping |
| `photon_particle_nature_of_light` | → | Topic 44 Wave Optics (back-edge) | prereq | Wave-particle duality framing reinforces transverse-wave proof from T44 |
| `photon_particle_nature_of_light` | → | Topic 45 Atomic Spectra (back-edge) | prereq | T45's X-ray atomics cite T46 photon-energy. **Bidirectional with T45** |
| `electron_emission_modes` | → | Topic 30 Electrostatics | prereq | Field emission uses electric-field-on-charge |
| `de_broglie_for_accelerated_electron` | → | Topic 36 Moving Charges | prereq | Uses kinetic-energy-from-potential from T36 |
| Math-tools refs (2): [`series_binomial_expansion_and_approximation`](stage-3-math-tools.md), [`calculus_derivative_basics`](stage-3-math-tools.md) | → | math-tools | math-tools | Wave-packet expansion; de Broglie momentum-frequency relations |

### Edges from Topic 48 — Nuclei

| Source atomic | → | Target | Type | Notes |
|---|---|---|---|---|
| `nuclear_size_R0A1over3` | → | Topic 47 Atomic Models (back-edge) | prereq (bidirectional) | Continues T47 `distance_of_closest_approach` upper-bound to actual nuclear-radius formula. **Closes Session 43 forward edge from T47 to T48** |
| `gamma_decay_excited_nucleus` | → | Topic 46 Dual Nature (back-edge) | prereq (bidirectional) | Uses T46 `photon_energy_hf`. **Closes the forward edge from T46** |
| `nuclear_force_short_range_attractive` | → | Topic 49 Semiconductor (anticipated) | bridges (weak) | Energy-band picture analogy |
| `nuclear_fission_chain_reaction` + `nuclear_fusion_thermonuclear` | → | future Astronomy/Cosmology topic | bridges | Stellar nucleosynthesis bridges to Hubble's law + Big Bang |
| `binding_energy_per_nucleon_curve` | → | Topic 47 (back-edge, weak) | applies | E_bn curve organizes T48 atomics; conceptual bridge back to T47 |
| Math-tools refs (3): [`calculus_exponential_decay`](stage-3-math-tools.md), [`calculus_integration_basics`](stage-3-math-tools.md), [`algebra_chain_product_rule`](stage-3-math-tools.md) | → | math-tools | math-tools | **First use of the dedicated `calculus_exponential_decay` primitive shipped in Stage-3 math-tools file** (Session 42). Decay law N = N₀e^(−λt); mean-life ∫t·e^(−λt)dt; mass-defect arithmetic chains |

**Note on T46 ↔ T48 + T46 ↔ T47 + T48 ↔ T47 triangle:** This paired-batch CLOSES the entire Modern Physics core triangle (T45-T48). All 4 topics now have bidirectional edges to each other through this triangle:
- T45 ↔ T47 (Session 43): 9 edges
- T46 ↔ T47 (this session): 4 edges (de Broglie + uncertainty back-edges + Bohr-postulate forward + Compton-cross-link)
- T48 ↔ T47 (this session): 2 edges (size/mass + E_b curve)
- T45 ↔ T46 (this session): 2 edges (X-ray photon nature bidirectional)
- T46 ↔ T48 (this session): 1 edge (γ-decay photon nature)
- T45 ↔ T48: 1 edge (anticipated future X-ray/γ-decay extension)

**Modern Physics core (T45-T48) is the most-interconnected 4-topic cluster yet observed** — ~19 bidirectional edges among 6 possible pairs ≈ 3.2 edges/pair average, vs Optics cluster's ~2.5 edges/pair.

**Total edges captured (after 19 pilots): 177** (cumulative). Net new edges from T46+T48 batch: 15 — 9 from T46 (5 forward to T47 back / T48 / T49 / T44 / T45 + 2 prereq from T30/T36 + 2 math-tools), 6 from T48 (4 forward to T47 back / T46 back / T49 / future-astronomy + 3 math-tools — minus 1 cross-counted = 6). **math-tools IN-degree now 32** (was 27 at 17-pilot). **First use of `calculus_exponential_decay` primitive from Stage-3 file** — validates the Stage-3 anticipated-stub strategy.

### Edges from Topic 49 — Semiconductor Electronics

| Source atomic | → | Target | Type | Notes |
|---|---|---|---|---|
| `energy_bands_in_solids` | → | Topic 47 Atomic Models (back-edge) | prereq | Bohr orbitals + orbit_vs_orbital underlie solid-state band picture. **Closes Session 44 forward edge from T46/T48 to T49 (anticipated semiconductor sink)** |
| `led_atomic` + `photodiode_atomic` + `solar_cell_atomic` | → | Topic 46 Dual Nature (back-edge) | prereq | Photoelectric foundation (einstein_photoelectric_equation, photon_particle_nature) underlies optoelectronic devices. **Bidirectional with T46** |
| `intrinsic_semiconductor` (thermal carrier generation) | → | math-tools `calculus_exponential_decay` (back) | math-tools | Carrier concentration ∝ exp(−E_g/2kT) — second use of exponential-decay primitive after T48 |
| `pn_junction_unbiased` (depletion region) | → | Topic 30 Electrostatics | prereq | Built-in potential V_bi = step in electric potential across depletion |
| `junction_diode_rectifier` | → | Topic 34 Current Electricity | prereq | Rectifier circuit analysis uses Kirchhoff + Ohm |
| `mass_action_law_semiconductor` | → | math-tools `algebra_quadratic` | math-tools | n_e × n_h = n_i² problem patterns |
| `transistor_amplifier_common_emitter` | → | Topic 50 Communication Systems (forward) | applies | Every modulator uses a CE amplifier |
| `junction_diode_rectifier` | → | Topic 50 Communication Systems (forward) | applies | Envelope detector = half-wave rectifier + RC filter |
| `logic_gate_nand` + `logic_gate_nor` | → | Topic 50 Communication Systems (forward) | applies | Digital channel encoding (V2) |
| Math-tools refs (additional): [`calculus_exponential_decay`](stage-3-math-tools.md), [`algebra_quadratic`](stage-3-math-tools.md) | → | math-tools | math-tools | Carrier-density + mass-action arithmetic |

### Edges from Topic 50 — Communication Systems

| Source atomic | → | Target | Type | Notes |
|---|---|---|---|---|
| `modulator_block_atomic` | → | Topic 49 Semiconductor (back-edge) | prereq (bidirectional) | Uses `transistor_amplifier_common_emitter`. **Closes forward edge from T49** |
| `demodulator_block_atomic` | → | Topic 49 Semiconductor (back-edge) | prereq (bidirectional) | Uses `junction_diode_rectifier` + RC filter. **Closes forward edge from T49** |
| `optical_fibre_communication` | → | Topic 49 Semiconductor (back-edge) | prereq (bidirectional) | Source = LED/laser (T49 `led_atomic`); detector = T49 `photodiode_atomic`. **Triple-bridge** to T49 |
| `optical_fibre_communication` | → | Topic 42 Refraction/Lenses (back-edge) | prereq | TIR-guided propagation requires T42 `total_internal_reflection` + `critical_angle` |
| `optical_fibre_communication` | → | Topic 44 Wave Optics | applies | Light as EM wave + bandwidth-of-fibre uses wave-optics framework |
| `ground_wave_propagation` + `sky_wave_propagation` + `space_wave_propagation` | → | future Topic 38 EM Waves | prereq | All propagation modes presuppose electromagnetic_wave_basics; **3 anticipated forward edges to T38** |
| `satellite_communication` | → | Topic 16 Gravitation (back-edge) | prereq | Geostationary altitude derivation uses orbital-velocity from T16 |
| `antenna_range_formula` | → | Topic 5 Vectors (back-edge, weak) | prereq | Vector resolution + pythagoras on curved earth |
| `amplitude_modulation` | → | math-tools `trig_product_to_sum_identities` (STUB → REQUIRED) | math-tools | First-use trigger: promotes anticipated stub to required teaching unit. Sideband derivation (f_c ± f_m) requires sin·sin = ½(cos(A−B) − cos(A+B)) |
| `antenna_range_formula` | → | math-tools `pythagoras_curved_earth` (STUB) | math-tools | New stub: d = √(2hR) derivation via curved-earth geometry |
| `digital_signal_basics` (V2) | → | Topic 49 Semiconductor | prereq | Uses `logic_gate_not`, `logic_gate_nand` |
| Math-tools refs (additional): [`trig_product_to_sum_identities`](stage-3-math-tools.md), [`pythagoras_curved_earth`](stage-3-math-tools.md) | → | math-tools | math-tools | New required primitive (sideband math) + new anticipated stub (antenna range) |

**Note on T49 ↔ T50 bidirectional edges:** Modern Physics applied cluster closer surfaces **8 bidirectional edges** between T49 and T50 — second-densest paired-batch after T45↔T47 (9). 4 from T49 → T50 (CE amplifier, rectifier, NAND, NOR forward) + 3 back from T50 → T49 (modulator, demodulator, optical fibre triple-bridge) + 1 cross-edge (digital_signal_basics V2). **Confirms applied-physics cluster cohesion: every T50 block uses T49 devices.**

**Total edges captured (after 21 pilots): 199** (cumulative). Net new edges from T49+T50 batch: 22 — 10 from T49 (4 forward to T50 + 3 back to T46/T47 + 2 prereq to T30/T34 + 2 math-tools); 12 from T50 (3 back to T49 + 2 back to T42/T44 + 3 forward to anticipated T38 + 1 back to T16 + 1 back to T5 + 2 math-tools). **math-tools IN-degree now 36** (was 32 at 19-pilot). **First-use of `trig_product_to_sum_identities` (anticipated stub → REQUIRED)**; **first registration of `pythagoras_curved_earth` (new stub)**.

### Edges from Topic 35 — Electromagnetic Induction

| Source atomic | → | Target | Type | Notes |
|---|---|---|---|---|
| `magnetic_flux_definition` | → | Topic 36 Moving Charges (back-edge) | prereq | Φ requires B-field; magnetic_field_solenoid reused for L derivation |
| `motional_emf` | → | Topic 36 Moving Charges | prereq | Lorentz force qv×B underlies (v×B)·L on rod carriers |
| `magnetic_flux_definition` | → | Topic 6 Vectors | prereq | Φ = B·A·cosθ uses area vector + dot product |
| `lenz_law` | → | Topic 13 Work-Energy | prereq | Lenz's law is energy conservation in disguise |
| `energy_stored_in_inductor` | → | Topic 13 Work-Energy | prereq | U = ½LI² derivation uses work-energy theorem |
| `ac_generator` | → | Topic 7 Rotational Dynamics | prereq | Rotating coil ω = constant; angular velocity |
| `lr_circuit_growth_decay` | → | Topic 34 Current Electricity | prereq | Circuit analysis (Ohm + Kirchhoff) |
| `lc_oscillation_future` (deferred) | → | Topic 31 Capacitors | prereq | LC parallel: ½LI² ↔ ½CV² |
| `faradays_law` | → | math-tools `calculus_derivative_basics` | math-tools | dΦ/dt requires derivative |
| `lr_circuit_growth_decay` | → | math-tools `calculus_exponential_decay` | math-tools | **3rd use of `calculus_exponential_decay` Stage-3 primitive** (after T48 and T49) — primitive now firmly validated |
| **Forward (to-be-closed)**: `energy_density_magnetic_field_nano` → Topic 38 EM Waves | bridges (forward) | Forward to T38 — closes via T38 `energy_density_em_wave` back-edge in same batch |

### Edges from Topic 38 — Electromagnetic Waves

| Source atomic | → | Target | Type | Notes |
|---|---|---|---|---|
| `em_wave_basics` | → | Topic 35 EM Induction (back-edge) | prereq (bidirectional) | Changing B induces E via Maxwell-Faraday. **Closes the forward bridge from T35** (energy density + Faraday's law) |
| `energy_density_em_wave` | → | Topic 35 EM Induction (back-edge) | prereq (bidirectional) | u_B = B²/(2μ₀) — equipartition wave-form needs T35 magnetic-energy-density |
| `displacement_current` | → | Topic 36 Moving Charges (back-edge) | prereq | Maxwell extends Ampère's law (T36 owns) |
| `maxwell_equations_summary` | → | Topic 30 Electrostatics | prereq | Gauss's law for E is Maxwell equation #1 |
| `displacement_current` | → | Topic 30 Electrostatics | prereq | i_d = ε₀ dΦ_E/dt requires electric flux |
| `energy_density_em_wave` | → | Topic 31 Capacitors | prereq | u_E = ½ε₀E² parallel structure (capacitor energy density) |
| `radiation_pressure_atomic` | → | Topic 14 Momentum (anticipated) | prereq | P = I/c; uses momentum-of-radiation framing |
| `transverse_nature_em_wave` | → | Topic 44 Wave Optics (back-edge) | bridges (bidirectional) | T44 polarisation owns; T38 references — **bidirectional closing** |
| **Closes-3-Forward**: `em_wave_basics` + `radio_waves_nano` + `microwaves_nano` | → | Topic 50 Communication Systems (back-edges × 3) | prereq | **CLOSES the 3 anticipated forward-edges from T50** Session 45 (ground_wave + sky_wave + space_wave propagation) |
| `x_rays_nano` | → | Topic 45 Atomic Spectra (back-edge) | prereq | T45 X-ray atomics cite EM-spectrum band — bidirectional |
| `gamma_rays_nano` | → | Topic 48 Nuclei (back-edge) | prereq | T48 γ-decay cites EM-spectrum band — bidirectional |
| `intensity_em_wave` | → | math-tools `time_averaging_cos_squared` | math-tools | 2nd cross-cluster use (after T44 Malus law) — primitive validated |
| Math-tools refs (additional): [`time_averaging_cos_squared`](stage-3-math-tools.md) | → | math-tools | math-tools | Single primitive — already counted above |

**Note on T35 ↔ T38 bidirectional edges:** E&M cluster middle pair surfaces **6 bidirectional edges** between T35 and T38 — mid-range paired-batch density (between cross-cluster 2-3 and intra-cluster-same-chapter 7-9). 2 forward T35 → T38 (energy_density_magnetic + Faraday's-law-as-Maxwell-equation), 2 back T38 → T35 (em_wave_basics needs Faraday + energy-density equipartition), plus 2 indirect bridges via T39 AC chapter (anticipated). **Pattern signal**: cross-chapter same-cluster pair density (6 edges) sits exactly midway between intra-cluster-same-chapter (7-9) and cross-cluster (2-3). The "chapter-pair" distinction is the dominant predictor.

**Note on the THREE forward-edges from T50 closing:** Session 45 catalog of T50 surfaced 3 anticipated forward-edges to T38 (ground/sky/space wave propagation atomics all needed `electromagnetic_wave_basics`). T38 atomic `em_wave_basics` now exists in this session and explicitly cites the 3 T50 atomics in Section F. **Matrix integrity verified for the third time this Stage-2 run** — every anticipated forward-edge eventually finds its back-edge as the catalog set grows. Pattern: forward-edges are reliable predictors of next-batch topic selection.

**Total edges captured (after 23 pilots): 224** (cumulative). Net new edges from T35+T38 batch: 25 — 11 from T35 (8 forward to T36/T6/T13/T7/T34/T31 + 2 math-tools + 1 forward to T38); 14 from T38 (3 closing-forward-back-edges to T50 + 2 back to T35 + 4 prereq to T30/T31/T36/T14 + 2 back to T45/T48 + 1 back to T44 + 1 math-tools + 1 anticipated to T39). **math-tools IN-degree now 38** (was 36 at 21-pilot). **3rd use of `calculus_exponential_decay` (3rd consecutive Stage-3-primitive validation in 3 sessions).** **2nd cross-cluster use of `time_averaging_cos_squared`** (first was T44 Malus law — primitive now firmly validated across Optics AND E&M).

### Edges from Topic 37 — Magnetism and Matter

| Source atomic | → | Target | Type | Notes |
|---|---|---|---|---|
| `magnetic_dipole_moment_atomic` | → | Topic 36 Moving Charges (back-edge) | prereq (bidirectional) | **Closes T36 A31 forward edge** (current loop = elementary dipole bridges to permanent magnet) from Session 36 |
| `bar_magnet_as_solenoid_equivalence` | → | Topic 36 Moving Charges (back-edge) | prereq | Uses magnetic_field_solenoid; Ampère's hypothesis |
| `torque_on_magnetic_dipole` | → | Topic 36 Moving Charges (back-edge) | prereq | Force on current-carrying loop foundation |
| `hysteresis_loop_atomic` | → | Topic 35 EM Induction (back-edge) | prereq (bidirectional) | **Closes EI-G6 deferred dependency** — ferromagnetic loss model unifies hysteresis + eddy currents |
| `diamagnetism_atomic` | → | Topic 35 EM Induction (back-edge) | prereq | Induced opposing moment at orbital scale = Lenz's law |
| `gauss_law_for_magnetism` | → | Topic 30 Electrostatics | prereq (contrast) | Framed by analogy to electric Gauss's law |
| `axial_dipole_field` + `equatorial_dipole_field` + `torque_on_magnetic_dipole` + `potential_energy_of_dipole_in_field` | → | Topic 30 Electrostatics | bridges | Magnetic-dipole geometry parallels electric-dipole; 2:1 ratio invariant + torque/PE analogs (4 sub-edges, count as 1 bridge) |
| `oscillating_dipole_period_nano` | → | Topic 17 SHM (back-edge) | bridges | Angular SHM of dipole in field — uses T17 A21 same as T30 dipole-as-angular-SHM |
| `magnetic_dipole_moment_atomic` | → | Topic 6 Vectors | prereq | Area vector for m = NIA |
| `declination_dip_horizontal_component_nano` | → | Topic 5 Vectors | prereq | Vector resolution of geomagnetic field |
| `diamagnetism_atomic` | → | Topic 47 Atomic Models (back-edge) | prereq | Bohr orbit + induced opposing moment of orbital electrons |
| **Forward (closed same-session)**: `hysteresis_loop_atomic` + `soft_vs_hard_magnetic_materials_nano` + `ferromagnetism_atomic` | → | Topic 39 AC Circuits (forward) | prereq | T39 transformer_in_ac_atomic + choke_coil_atomic require T37 (closes in this same Session 48 paired-batch) |
| **Forward (anticipated)**: `magnetic_dipole_moment_atomic` | → | Topic 48 Nuclei (NMR/MRI extension) | bridges (V2) | Nuclear magnetic moment → MRI principle; weak forward |
| Math-tools refs (6): [`vector_cross_product`](stage-3-math-tools.md), [`dot_product`](stage-3-math-tools.md), [`vector_resolution`](stage-3-math-tools.md), [`calculus_integration_dV`](stage-3-math-tools.md), `angular_shm_equation`, `algebra_one_over_r_cubed` | → | math-tools | math-tools | All primitives already REQUIRED — **no new stubs introduced by T37** (3rd consecutive session with zero new stubs) |

### Edges from Topic 39 — Alternating Current

| Source atomic | → | Target | Type | Notes |
|---|---|---|---|---|
| `ac_inductor_circuit` | → | Topic 35 EM Induction (back-edge) | prereq | X_L = ωL requires self-inductance from T35 |
| `lc_oscillations_atomic` | → | Topic 35 EM Induction (back-edge) | prereq | **Closes EI-G6 deferred dependency from Session 46** — LC oscillation now lives in T39 with full back-reference to T35 inductor energy |
| `transformer_in_ac_atomic` | → | Topic 35 EM Induction (back-edge) | prereq | Full extension of T35 primitive transformer atomic; mutual_inductance + Faraday's law |
| `transformer_losses_nano` | → | Topic 35 EM Induction (back-edge) | prereq | Laminated-core eddy-loss reduction uses T35 eddy_currents_atomic |
| `transformer_in_ac_atomic` | → | Topic 37 Magnetism & Matter (back-edge, intra-session) | prereq (bidirectional) | **Closes T37 forward-edge from same Session 48 batch** — soft-iron core selection requires T37 hysteresis_loop + soft_vs_hard nano |
| `choke_coil_atomic` | → | Topic 37 Magnetism & Matter (back-edge, intra-session) | prereq (bidirectional) | High-permeability ferromagnetic core for inductor design |
| `ac_resistor_circuit` + `lcr_series_circuit_atomic` + `power_in_ac_circuit_atomic` | → | Topic 34 Current Electricity (back-edge) | prereq | Ohm's law + Kirchhoff + P = VI extend to AC instantaneous + average (3 sub-edges, count as 1) |
| `ac_capacitor_circuit` + `lc_oscillations_atomic` | → | Topic 31 Capacitors (back-edge) | prereq | X_C requires C; ½CV² half of LC energy budget |
| `lc_oscillations_atomic` + `ac_voltage_source_atomic` | → | Topic 17 SHM (back-edge, bidirectional bridge) | bridges (bidirectional) | **Most-cited cross-cluster analogy in physics** — q ↔ x, 1/LC ↔ k/m. d²q/dt² = −q/LC matches T17 A4 d²x/dt² = −ω²x |
| `radio_tuning_application_nano` | → | Topic 38 EM Waves (back-edge) | bridges | LC tuning matches transmitter frequency — references T38 hertz_experiment + em_spectrum |
| **Closes-Forward**: `modulator + demodulator` ← T39 `lc_oscillations_atomic` + `resonance_in_lcr_atomic` | → | Topic 50 Communication Systems (back, anticipated) | prereq | **Closes anticipated T39↔T50 link from Session 45** (T50 modulator + LC tank circuit) |
| `transformer_in_ac_atomic` | → | Topic 49 Semiconductor (forward, weak) | applies | SMPS power supplies use transformer + rectifier — V2 link |
| Math-tools refs (5): [`time_averaging_cos_squared`](stage-3-math-tools.md), `trig_phase_angle`, `vector_rotation`, **NEW STUB `phasor_complex_representation`**, [`algebra_quadratic`](stage-3-math-tools.md), `calculus_2nd_order_ode_for_shm` | → | math-tools | math-tools | **3rd cross-cluster use of `time_averaging_cos_squared`** (T44 Malus → T38 EM-wave intensity → T39 AC rms); **1 NEW STUB registered: `phasor_complex_representation`** (Z = R + jX); **2nd cross-cluster use of `algebra_quadratic`** (after T49 mass-action); `calculus_2nd_order_ode_for_shm` 2nd validation (T17 was first) |

**Note on T37 ↔ T39 bidirectional edges:** E&M cluster closer pair surfaces **8 bidirectional edges** between T37 and T39 — matches T49↔T50 (8) and approaches T45↔T47 (9). The pair is NOT same NCERT chapter (Ch.5 vs Ch.7) but IS same DCP chapter (Ch.28 magnetics intersects with Ch.30 AC) and same HCV cluster (Ch.42 + Ch.43 consecutive). **Confirms refined paired-batch density rule:** "same-cluster chapter-adjacent" pairs produce 7-9 edges — same band as "same-chapter intra-cluster." The chapter-distance metric matters more than the strict same-chapter criterion.

**Note on closing 2 deferred dependencies in one session:** T37+T39 closes BOTH EI-G6 (T35 LC oscillation deferral → now lives in T39) AND T37 hysteresis-loop forward-edge to T39 transformer-core-selection. **Matrix integrity check #4 in 4 consecutive sessions** — every deferred dependency eventually resolves. Plus closes T36 A31 forward (current loop → permanent magnet) and the anticipated T39 ↔ T50 modulator/LC-tank link from Session 45. **4 separate forward-edges closed in one paired-batch — densest forward-edge closure session yet observed.**

**Total edges captured (after 25 pilots): 254** (cumulative, was 224 at 23-pilot). Net new edges from T37+T39 batch: 30 — 13 from T37 (3 back to T36 + 2 back to T35 + 1 to T30 + 1 bridge T30 + 1 to T17 + 1 to T6 + 1 to T5 + 1 to T47 + 1 forward-closed to T39 + 1 anticipated to T48 + math-tools no-new-stubs); 17 from T39 (4 back to T35 + 2 back to T37 intra-session + 1 to T34 + 1 to T31 + 1 to T17 + 1 to T38 + 1 to T50 closing + 1 weak forward to T49 + math-tools 5 primitives incl. 1 new stub). **math-tools IN-degree now 41** (was 38 at 23-pilot) — T37 added 0 new stubs (all 6 prereqs already REQUIRED) + T39 added 1 new stub (`phasor_complex_representation`) + 2 cross-cluster validations of `time_averaging_cos_squared` + `algebra_quadratic`. **First new math-tools stub since Session 45's `pythagoras_curved_earth`** — 3-session gap with zero new stubs confirms math-tools file is converging to a stable core.

### Edges from Topic 26 — Thermodynamics

| Source atomic | → | Target | Type | Notes |
|---|---|---|---|---|
| `first_law_atomic` | → | Topic 13 Work-Energy (back-edge) | prereq | **Closes anticipated bridge from T13** — first law generalises mechanical work-energy theorem to include heat (Q − W = ΔU) |
| `work_done_in_pv_diagram_nano` | → | Topic 13 Work-Energy (back-edge) | prereq | W = ∫P dV extends ∫F·dx |
| `internal_energy_atomic` | ↔ | Topic 27 Kinetic Theory (intra-session) | prereq (bidirectional) | T26 macroscopic U requires T27 microscopic ⟨KE⟩ |
| `specific_heat_atomic` (Cv = fR/2) | ↔ | Topic 27 Kinetic Theory (intra-session) | prereq (bidirectional) | T26 Cp/Cv ratio requires T27 equipartition theorem |
| `gamma_for_mono_di_polyatomic_nano` | ↔ | Topic 27 Kinetic Theory (intra-session) | prereq (bidirectional) | γ values via T27 degrees-of-freedom table |
| `entropy_atomic` (S = k ln W bridge) | ↔ | Topic 27 Kinetic Theory (intra-session) | bridges (bidirectional) | Statistical-mechanical interpretation of entropy lives in T27 nano |
| `adiabatic_process_atomic` | ↔ | Topic 27 Kinetic Theory (intra-session) | applies (bidirectional) | Both share PV = nRT foundation |
| `first_law_atomic` | → | Topic 27 Kinetic Theory (intra-session) | applies | First-law energy conservation underpins T27 pressure derivation |
| `isothermal_process_atomic` | ↔ | Topic 27 Kinetic Theory (intra-session) | applies (bidirectional) | Isothermal IS PV = const, a slice of T27 PV = nRT |
| `entropy_atomic` (forward, weak) | → | Topic 48 Nuclei (back-edge — distant) | bridges (weak) | Directionality of nuclear processes |
| `carnot_inequality_nano` | → | Topic 39 AC Circuits (back-edge — distant) | bridges (weak) | All real engines/transformers obey η ≤ η_ideal — analogy |
| Math-tools refs (5): [`calculus_integration`](stage-3-math-tools.md), [`natural_log`](stage-3-math-tools.md), **NEW STUB `power_function_pv_gamma`**, **NEW STUB `pv_diagram_visualization`**, **NEW STUB `state_function_concept`** | → | math-tools | math-tools | **3 NEW STUBS registered** — Thermodynamics introduces distinct vocabulary (PV-trace, state-function, line-integral over cycle) |

### Edges from Topic 27 — Kinetic Theory of Gases

| Source atomic | → | Target | Type | Notes |
|---|---|---|---|---|
| `kinetic_theory_pressure_atomic` | → | Topic 14 Momentum/Collisions (forward — not yet catalogued) | prereq | Δp = 2mv_x in elastic collision; T14 will provide foundation when catalogued |
| `kinetic_temperature_atomic` | → | Topic 26 Thermodynamics (intra-session) | prereq | **Microscopic origin of internal_energy_atomic** — closes T26 ← T27 bridge |
| `equipartition_theorem_atomic` | → | Topic 26 Thermodynamics (intra-session) | prereq | **Closes T26 Cp/Cv derivation** — Cv = fR/2 from f quadratic dof × (1/2)kT each |
| `degrees_of_freedom_table_nano` | → | Topic 26 Thermodynamics (intra-session) | prereq | Source of γ values for T26 adiabatic + Cp/Cv |
| `statistical_entropy_boltzmann_nano` | ↔ | Topic 26 Thermodynamics (intra-session) | bridges (bidirectional) | S = k ln W — bridges macroscopic entropy (T26) to microscopic counting (T27) |
| `kinetic_theory_pressure_atomic` | ↔ | Topic 26 Thermodynamics (intra-session) | applies (bidirectional) | T26 adiabatic uses PV=nRT foundation |
| `ideal_gas_equation_atomic` | ↔ | Topic 26 Thermodynamics (intra-session) | applies (bidirectional) | Foundation for all four T26 process atomics |
| `maxwell_boltzmann_distribution_atomic` | → | Topic 48 Nuclei (back-edge — distant) | bridges | Fission-fragment KE distribution uses same statistical machinery |
| `kinetic_theory_pressure_atomic` | → | Topic 38 EM Waves (back-edge — distant) | bridges | Radiation pressure derivation uses analogous momentum-flux logic |
| `mean_free_path_atomic` | → | Topic 18 Elasticity (forward — not yet catalogued) | bridges (weak) | Bulk-modulus microscopic analog for solids |
| Math-tools refs (6): [`statistical_averaging`](stage-3-math-tools.md), `momentum_change_in_collision`, `square_root_and_squaring`, **NEW STUB `gaussian_distribution`**, **NEW STUB `integration_of_gaussian`**, **NEW STUB `statistical_ensemble_averaging`** | → | math-tools | math-tools | **3 NEW STUBS registered** — first Gaussian + statistical-mechanical machinery in Stage-2 |

**Note on T26 ↔ T27 intra-session bidirectional edges:** Thermodynamics cluster opener pair surfaces **7 bidirectional edges** between T26 and T27 — solidly in the 7-9 paired-batch density band for chapter-adjacent intra-cluster pairs. Pair is **adjacent NCERT chapters** (Ch.12 + Ch.13) AND **same HCV cluster** (Ch.24 + Ch.26, with Ch.25 between) AND **same DCWT chapter cluster** (Ch.20 + Ch.21). **5th data point in chapter-adjacent density band** — rule confirmed at 5 observations.

**Note on Session 49 math-tools file impact:** **6 new stubs in one session — highest single-session stub-registration count observed.** `power_function_pv_gamma`, `pv_diagram_visualization`, `state_function_concept` (T26) + `gaussian_distribution`, `integration_of_gaussian`, `statistical_ensemble_averaging` (T27). **Stage-3 file came OUT of maintenance mode** — Thermodynamics+Kinetic-Theory introduces distinct mathematical vocabulary not present in Mechanics/E&M/Optics/Modern-Physics. **math-tools IN-degree: 41 → 47 (after T26) → 50 (after T27).** Confirms hypothesis: **clusters introduce vocabulary specific to their domain; math-tools file growth correlates with cluster-novelty, not pilot-count.**

**Total edges captured (after 27 pilots): 285** (cumulative, was 254 at 25-pilot). Net new edges from T26+T27 batch: 31 — 13 from T26 (2 back to T13 + 7 bidirectional intra-session + 2 weak forward to T39/T48 + math-tools 5 primitives incl. 3 new stubs); 18 from T27 (1 to T14 + 7 bidirectional intra-session [counted from T27 side for completeness; matrix dedupes when totaling] + 2 weak forward to T48/T38 + 1 forward to T18 + math-tools 6 primitives incl. 3 new stubs). **De-duplicated total: 31 net new edges** (intra-session bidirectional counted once). math-tools IN-degree now **50** (was 41).

### Edges from Topic 11 — Newton's Laws of Motion (Session 50)

| Source atomic | → | Target | Type | Notes |
|---|---|---|---|---|
| `newton_second_law_atomic` | → | Topic 5 Vectors | prereq | F = ma requires vector_addition + vector_resolution |
| `newton_second_law_atomic` | → | Topic 7 Kinematics 1D | prereq | a in F=ma requires kinematic definition |
| `block_on_incline_atomic` | → | Topic 9 Kinematics 2D | prereq | Inclined components mirror 2D motion |
| `newton_second_law_atomic` | ← | Topic 10 Circular Motion (back-edge) | prereq (closes anticipated) | **CLOSES** anticipated forward-edge from T10 Session 39 |
| `friction_force_atomic` + `newton_second_law_atomic` | ← | Topic 12 Friction (back-edge) | prereq (closes anticipated) | **CLOSES** T12 forward-references to Newton's-laws hub |
| `newton_second_law_atomic` | ← | Topic 13 Work-Energy (back-edge) | prereq (closes anticipated) | **CLOSES** T13 forward-references (work-energy theorem derived from F=ma) |
| `newton_third_law_atomic` + `f_eq_dp_dt_nano` | ↔ | Topic 14 Momentum/Collisions (intra-session) | bidirectional | 8 bidirectional edges total (see paired-batch note below) |
| `newton_second_law_atomic` | ← | Topic 16 Gravitation (back-edge) | prereq (closes anticipated) | **CLOSES** orbital velocity centripetal force balance |
| `spring_force_atomic` + `newton_second_law_atomic` | ← | Topic 17 SHM (back-edge) | prereq (closes anticipated) | **CLOSES** F = −kx as SHM driver |
| `tension_force_atomic` | ← | Topic 21 Wave Motion (back-edge) | prereq (closes anticipated) | **CLOSES** wave-speed-on-string ∝ √(T/μ) |
| `newton_second_law_atomic` (work-energy generalised) | ← | Topic 26 Thermodynamics (back-edge) | prereq (closes anticipated) | **CLOSES** first-law-generalises-work-energy |
| `newton_second_law_atomic` + `f_eq_dp_dt_nano` | ← | Topic 27 Kinetic Theory (back-edge) | prereq (closes anticipated) | **CLOSES** T27 pressure-derivation |
| `newton_second_law_atomic` | ← | Topic 29 Electrostatics (back-edge) | prereq (closes anticipated) | **CLOSES** Coulomb's law as F=ma analog |
| `newton_second_law_atomic` | ← | Topic 34 Current Electricity (back-edge) | prereq (closes anticipated) | **CLOSES** drift velocity from F=ma on free electrons |
| `newton_second_law_atomic` | ← | Topic 35 EM Induction (back-edge) | prereq (closes anticipated) | **CLOSES** induced-emf-uses-force-on-charge |
| `newton_second_law_atomic` | ← | Topic 36 Moving Charges (back-edge) | prereq (closes anticipated) | **CLOSES** Lorentz force F = qv × B |
| `applied_external_force_atomic` | ← | Topic 37 Magnetism & Matter (back-edge weak) | bridges | Torque-on-dipole weak back-edge |
| Math-tools refs (6): vector_resolution + vector_addition + calculus_derivative + calculus_integration + trigonometry + **NEW STUB `system_of_linear_equations_2var`** | → | math-tools | math-tools | **1 NEW STUB**: simultaneous equations from FBDs — first explicit Mechanics-cluster cross-domain primitive |

**MASSIVE back-edge closure at T11:** 15+ anticipated forward-edges from earlier pilots resolve to T11. **Densest single-topic back-edge-closure observed in Stage-2.** T11 IN-degree post-session: ~15-18 — clearest Mechanics hub.

### Edges from Topic 14 — Centre of Mass, Linear Momentum & Collisions (Session 50)

| Source atomic | → | Target | Type | Notes |
|---|---|---|---|---|
| `conservation_of_momentum_atomic` | → | Topic 11 Newton's Laws (intra-session) | prereq | Follows from Newton's 3rd law applied to internal forces |
| `elastic_collision_1d_atomic` | → | Topic 13 Work-Energy | prereq | Requires KE conservation |
| `elastic_collision_2d_atomic` | → | Topic 5 Vectors | prereq | Per-component conservation requires vector resolution |
| `impulse_momentum_theorem_nano` | ↔ | Topic 11 Newton's Laws (intra-session) | bidirectional | T11 `impulse_change_in_momentum_nano` mirror |
| `centre_of_mass_atomic` | ↔ | Topic 11 Newton's Laws (intra-session) | bidirectional | CoM equation IS F_ext = dP/dt for system |
| `rocket_equation_atomic` | ↔ | Topic 11 Newton's Laws (intra-session) | bidirectional | Tsiolkovsky uses T11 `f_eq_dp_dt_nano` |
| `conservation_of_momentum_atomic` | ← | Topic 27 Kinetic Theory (back-edge) | prereq (closes) | **CLOSES** T27 Session 49 forward-edge (Δp = 2mv_x in pressure derivation) |
| `perfectly_inelastic_collision_atomic` | ← | Topic 13 Work-Energy (back-edge) | prereq (closes) | **CLOSES** T13 anticipated forward (collision KE split) |
| `conservation_of_momentum_atomic` | ← | Topic 36 Moving Charges (back-edge) | prereq (closes) | **CLOSES** T36 pair-production momentum conservation |
| `linear_momentum_atomic` | ← | Topic 38 EM Waves (back-edge) | prereq (closes) | **CLOSES** T38 radiation-pressure momentum-change |
| `elastic_collision_2d_atomic` + `reduced_mass_atomic` | ← | Topic 47 Atomic Models (back-edge) | prereq (closes) | **CLOSES** T47 Rutherford scattering + Bohr reduced-mass correction |
| `conservation_of_momentum_atomic` | ← | Topic 48 Nuclei (back-edge ×2) | prereq (closes) | **CLOSES** T48 alpha-decay + gamma-emission recoil |
| Math-tools refs (5): vector_addition + vector_resolution + calculus_integration + natural_log + `system_of_linear_equations_2var` (cross-domain validation in same session) | → | math-tools | math-tools | **ZERO NEW STUBS** — T11's `system_of_linear_equations_2var` validated within same session (fastest cross-domain validation observed) |

**Note on T11 ↔ T14 intra-session bidirectional edges:** Mechanics cluster middle hub-topic pair surfaces **8 bidirectional edges** between T11 and T14 — chapter-adjacent intra-cluster density band (6-9 range), **6th data point in band**. Pair is HCV-Ch.5 + HCV-Ch.9 (chapter gap of 3) + DCM1-Ch.8 + DCM2-Ch.11 (different volumes but same cluster) + NCERT-Ch.5 + NCERT-Ch.7 (with Ch.6 between). **Moderate-adjacency variant — still hits 8 edges, confirming the band.**

**Note on Session 50 back-edge closure:** **23+ anticipated forward-edges closed in single paired-batch — densest closure ever observed in Stage-2.** Previous record was Session 48 (4 forward-edges closed). The Mechanics-middle-hub property is now empirically clear: as the deepest-prereq pair in the entire cluster, T11+T14 absorb forward-references from every Mechanics-adjacent topic that catalogued before them.

**Note on Stage-4-formalised criteria first session:** Session 50 is the first pilot session under Stage-4-formalised criteria (cognitive_error_target catalog field active; strand-diversity ≥ 8 anchor-bucket criterion). T11 = STRONG (10 anchors, 6-7 strands; meets STRONG criterion); T14 = STRONG (11 anchors, 7 strands; closest-to-VERY-STRONG borderline observed). **7th + 8th data points confirming foundational-physics plateaus at STRONG.** Cognitive-error-prevention combined session share: 46% (11/24) — new session-high.

**Note on triple-coverage streak break:** T14 breaks the 8-topic 100% streak. 70% triple-coverage rate; 3 DUAL atomics (elastic_collision_2d, rocket_equation, reduced_mass — all NCERT-not-covered, HCV+DCM full). **Pattern signal sharpened:** NCERT 2023 omits JEE-Advanced material in foundational chapters (T11 pseudo-force NCERT-light + T14 2D/rocket/reduced-mass NCERT-not-covered). **Recommend Stage-4 introduce "triple-coverage-with-NCERT-omission" sub-tier** — flagged in DISCUSSIONS Session 50.

**Total edges captured (after 29 pilots): ~316** (cumulative, was 285 at 27-pilot). Net new edges from T11+T14 batch: 31 — 17 from T11 (4 outgoing + 13 back-edge closures + math-tools 6 incl. 1 new stub); 14 from T14 (4 outgoing + 8 back-edge closures + 5 math-tools no-new-stubs + intra-session bidirectional dedupe). **De-duplicated total: 31** (intra-session bidirectional counted once). math-tools IN-degree now **51** (was 50). **23+ back-edges closed — densest closure observed.**

### Edges from Topic 15 — Rotational Mechanics (Session 51)

| Source atomic | → | Target | Type | Notes |
|---|---|---|---|---|
| `torque_atomic` + `angular_momentum_atomic` | → | Topic 5 Vectors | prereq | vector_cross_product required |
| `rotational_kinematics_atomic` | → | Topic 6 Kinematics 1D | prereq | mirrors linear-kinematics structure |
| `omega_v_eq_omega_r_relation_nano` | → | Topic 10 Circular Motion | prereq | direct extension |
| `tau_eq_i_alpha_atomic` + `pure_rolling_atomic` | ← | Topic 11 Newton's Laws (back-edge) | prereq (closes) | **CLOSES** T11 → T15 anticipated rotational-analog (Session 50) |
| `rotational_work_energy_atomic` | ← | Topic 13 Work-Energy (back-edge) | prereq (closes) | **CLOSES** T13 → T15 anticipated rotational work-energy edge |
| `l_eq_r_cross_p_nano` + `conservation_of_angular_momentum_atomic` | ← | Topic 14 Momentum/Collisions (back-edge) | prereq (closes) | **CLOSES** T14 → T15 anticipated angular-analog edges |
| `keplers_2nd_law_planetary_nano` | ↔ | Topic 16 Gravitation (back-edge bidirectional) | bridges | T16 already cited L-conservation; closes loop |
| `torsional_pendulum_atomic` | ↔ | Topic 17 SHM (back-edge bidirectional) | bridges | T17 A21 closed; angular SHM analog fully formalised |
| `torque_atomic` + `moment_of_inertia_atomic` + `torsional_pendulum_atomic` | ↔ | Topic 18 Elasticity (intra-session) | bridges (bidirectional) | 4 cross-cluster paired-pair edges (see T18 §E) |
| `rotational_kinematics_atomic` | ← | Topic 35 EM Induction (back-edge) | prereq (closes) | **CLOSES** T35 rotating-coil anticipated forward (Session 46) |
| `angular_momentum_atomic` + `torque_atomic` | ← | Topic 36 Moving Charges (back-edge) | prereq (closes) | **CLOSES** T36 magnetic-dipole-moment ← angular_momentum (Session 36) — **14-session lag, longest closed this session** |
| `angular_momentum_atomic` + `torsional_pendulum_atomic` | ← | Topic 37 Magnetism & Matter (back-edge) | prereq (closes) | **CLOSES** T37 quantised-L anticipated forward (Session 48) |
| `angular_momentum_atomic` | ← | Topic 47 Atomic Models (back-edge) | prereq (closes) | **CLOSES** T47 Bohr L=nℏ anticipated forward (Session 43) |
| `angular_momentum_atomic` | ← | Topic 48 Nuclei (back-edge weak) | bridges (weak) | Nuclear spin concept; weak |
| Math-tools refs (6): vector_cross_product + calculus_derivative + calculus_integration + vector_resolution + angular_shm_equation + system_of_linear_equations_2var (3rd validation) | → | math-tools | math-tools | **ZERO NEW STUBS**; `system_of_linear_equations_2var` validated for 3rd time (T11→T14→T15 in 2 sessions — fastest stabilisation observed) |

### Edges from Topic 18 — Elasticity (Session 51)

| Source atomic | → | Target | Type | Notes |
|---|---|---|---|---|
| `stress_strain_atomic` | ← | Topic 11 Newton's Laws (back-edge) | prereq (closes) | **CLOSES** T11 → T18 anticipated (Session 50, stress as force/area) |
| `elastic_pe_atomic` | ← | Topic 13 Work-Energy (back-edge) | prereq (closes) | **CLOSES** T13 → T18 anticipated (½kx² spring analog) |
| `torsion_of_wire_application_nano` | ↔ | Topic 15 Rotational Mechanics (intra-session) | bridges (bidirectional) | 4 cross-cluster paired-pair edges (see T15) |
| `youngs_modulus_atomic` | ← | Topic 21 Wave Motion (back-edge) | prereq (closes) | **CLOSES** T21 CT3 forward-edge — longitudinal-wave-speed in solid ← Y (Session 33-34, ~17-18-session lag — among longest closures) |
| `bulk_modulus_atomic` | ← | Topic 21 Wave Motion (back-edge) | prereq (closes) | **CLOSES** T21 CT2 forward-edge — longitudinal-wave-speed in fluid ← K (Session 33-34, ~17-18-session lag) |
| `bulk_modulus_atomic` + `k_for_solids_liquids_gases_nano` | ← | Topic 27 Kinetic Theory (back-edge) | prereq (closes) | **CLOSES** T27 mean_free_path → T18 bulk-modulus-microscopic forward (Session 49) |
| `stress_strain_atomic` (analog) | ← | Topic 37 Magnetism & Matter (back-edge weak) | bridges (weak) | Stress-strain analog for magnetic response noted in stage-1 |
| Math-tools refs (3): algebra_basic_ratio + calculus_derivative + algebra_unit_analysis | → | math-tools | math-tools | **ZERO NEW STUBS**; all REQUIRED |

**Note on T15 ↔ T18 cross-cluster intra-session bidirectional edges:** **First cross-cluster paired-batch in many sessions** — T15 closes Mechanics; T18 opens Mechanical Properties. **4 bidirectional edges = cross-cluster paired-batch density band (2-4 range, per Stage-4 formalised density rule).** Matches density-rule prediction. **Stage-4 density rule fully validated at 7 data points across both density bands.**

**Note on Session 51 forward-edge closures:** **11 anticipated forward-edges closed in single paired-batch** — second-densest closure ever observed (after Session 50's 23+). Combined Sessions 50+51: **34+ back-edges closed in 2 sessions**, including:
- **14-session-lag T36 → T15** (magnetic-dipole-moment ← angular_momentum) — longest closed this session
- **17-18-session-lag T21 CT2/CT3 → T18** (longitudinal wave speeds ← Y/K) — longest-lagged forward-edges in the entire matrix, finally CLOSED
- T11/T13/T14 → T15 rotational analogs (Session 50 → 51, 1-session lag)
- T35 rotating-coil + T37 quantised-L + T47 Bohr-L (5-8 session lags)
- T27 mean-free-path → bulk-modulus (2-session lag from Session 49)

**Mechanics cluster CLOSED at 10/10 topics.** **6th cluster closure in Stage-2** — after Optics (Session 41), Modern Physics core (Session 44), Modern Physics applied (Session 45), E&M (Session 48), Thermodynamics-near (Session 49 — 2/3 awaiting T-thermal-properties Ch.11). **Mechanical Properties cluster OPENED** (T18 of 2; T20 Fluid Mechanics remains).

**Total edges captured (after 31 pilots): ~342** (cumulative, was 316 at 29-pilot). Net new edges from T15+T18 batch: 26 — 18 from T15 (3 outgoing + 9 back-edge closures + 4 intra-session bidirectional + 6 math-tools no-new-stubs); 12 from T18 (2 outgoing + 3 back-edge closures + 4 intra-session bidirectional [dedupe with T15] + 3 math-tools no-new-stubs). **De-duplicated total: 26** (intra-session bidirectional counted once). math-tools IN-degree unchanged: **51**. **11 forward-edges closed; 4 cross-cluster intra-session edges added.**

### Edges from Topic 20 — Fluid Mechanics (Session 52)

| Source atomic | → | Target | Type | Notes |
|---|---|---|---|---|
| `fluid_pressure_atomic` + `pascals_law_atomic` | ← | Topic 11 Newton's Laws (back-edge) | prereq (closes) | **CLOSES** T11 → T20 anticipated (Session 50, F=ma applied to fluid column) |
| `bernoullis_principle_atomic` | ← | Topic 13 Work-Energy (back-edge) | prereq (closes) | **CLOSES** T13 → T20 anticipated (work-energy along streamline) |
| `viscosity_atomic` | ↔ | Topic 18 Elasticity (intra-cluster back-edge) | bridges (bidirectional) | T18 shear_stress_nano IS solid analog of T20 fluid viscosity |
| `fluid_pressure_atomic` | ↔ | Topic 18 Elasticity (intra-cluster back-edge) | bridges (bidirectional) | T18 hydraulic_volumetric_stress ↔ T20 fluid_pressure (pressure as stress) |
| `fluid_pressure_atomic` + `archimedes_buoyancy_atomic` | ← | Topic 21 Wave Motion (back-edge) | prereq (closes density-half) | **CLOSES density-half** of T21 CT2 forward (Y/K closed by T18 S51; ρ now closed by T20) — **18-19-session lag, longest-active forward-edge density-half** |
| `archimedes_buoyancy_atomic` + `viscosity_atomic` + `fluid_pressure_atomic` + `surface_tension_atomic` | ↔ | Topic 25 Thermal Properties (intra-session) | bridges (bidirectional) | **4 cross-cluster paired-pair edges** (see T25 §E for full list) |
| `viscosity_atomic` | → | Topic 36 Moving Charges (back-edge weak) | bridges (weak) | Magnetohydrodynamics analog noted in stage-1 |
| Math-tools refs (5): algebra_basic_ratio + calculus_derivative_dv_dy + algebra_unit_analysis + energy_conservation_along_streamline + algebra_dimensional_analysis | → | math-tools | math-tools | **ZERO NEW STUBS**; all REQUIRED |

### Edges from Topic 25 — Thermal Properties of Matter (Session 52)

| Source atomic | → | Target | Type | Notes |
|---|---|---|---|---|
| `specific_heat_solid_liquid_atomic` | ← | Topic 26 Thermodynamics (back-edge) | prereq (closes) | **CLOSES** T26 Cp/Cv → operational Q = mCΔT bridge (Session 49 forward) |
| `temperature_scales_atomic` | ← | Topic 27 Kinetic Theory (back-edge) | prereq (closes) | **CLOSES** T27 microscopic-T → macroscopic-T scale bridge (Session 49 forward) |
| `stefan_boltzmann_atomic` | ← | Topic 27 Kinetic Theory (back-edge weak) | bridges (weak) | MB-distribution radiation-tail → Stefan-Boltzmann (Session 49 weak forward) |
| `heat_convection_atomic` + `thermal_expansion_liquid_gas_nano` + `surface_tension_T_dependence_nano` | ↔ | Topic 20 Fluid Mechanics (intra-session) | bridges (bidirectional) | **4 cross-cluster paired-pair edges** (see T20 §E above) |
| `stefan_boltzmann_atomic` + `wien_displacement_atomic` | ← | Topic 38 EM Waves (back-edge) | prereq (closes) | **CLOSES** T38 thermal-radiation-as-EM-source bridge (Session 47 anticipated forward) |
| `newtons_law_of_cooling_atomic` | → | math-tools `calculus_exponential_decay` | math-tools | **5th cross-cluster use** of `calculus_exponential_decay` (T34 → T44 → T48 → T35 → T25) — primitive firmly stable |
| Math-tools refs (6): calculus_exponential_decay + algebra_basic_ratio + **NEW STUB `power_function_T_fourth`** + algebra_inverse_proportion + calculus_derivative_dT_dt + algebra_unit_analysis | → | math-tools | math-tools | **1 NEW STUB**: `power_function_T_fourth` (Stefan-Boltzmann T⁴ scaling — distinct from `power_function_pv_gamma`) |

**Note on T20 ↔ T25 cross-cluster intra-session bidirectional edges:** **2nd cross-cluster paired-batch** in 2 consecutive sessions (after T15↔T18 Session 51). **4 bidirectional edges = cross-cluster paired-batch density band (2-4 range, per Stage-4 formalised density rule).** Matches T15↔T18 prediction. **9th data point validating Stage-4 paired-batch density rule** across both bands (intra-cluster chapter-adjacent: 6-9; cross-cluster: 2-4 — rule now firmly established at 9 observations).

**Note on Session 52 DOUBLE CLUSTER CLOSURE:** **Both Mechanical Properties cluster (T18 + T20) AND Thermodynamics cluster (T26 + T27 + T25) CLOSED in same session.** **7th + 8th cluster closures.** Cluster-closure tempo: 8 clusters closed in 33 pilots = 1 cluster per 4.1 pilots (improving from 5.2 at 31-pilot). Remaining: Waves middle (T19/T22/T23) + Kinematics-formalisation (T6/T7/T9) + ~6 stragglers.

**Note on Session 52 forward-edge closures:** **6 anticipated forward-edges closed in single paired-batch** — mid-density closure session: 2 cluster-internal closures (T11/T13 → T20) + 1 density-half cluster closure (T21 → T20 density, closing 18-19-session-lag — second-longest in matrix) + 3 Thermodynamics cluster-internal closures (T26 → T25 specific-heat, T27 → T25 microscopic-T, T38 → T25 thermal-radiation-EM). Combined Sessions 50+51+52: **40+ back-edges closed in 3 sessions** — densest 3-session window observed.

**Note on math-tools maintenance mode:** **1 new stub in Session 52** (`power_function_T_fourth`) — light-maintenance continues; math-tools IN-degree 51 → **52**. **`calculus_exponential_decay` validated for 5th time** — most-validated Stage-3 primitive. Mechanics + Mechanical Properties + Thermal Properties cluster span fully stable.

**Total edges captured (after 33 pilots): ~368** (cumulative, was 342 at 31-pilot). Net new edges from T20+T25 batch: 26 — 14 from T20 (2 outgoing back-edge closures + 1 cross-cluster density-half closure + 2 intra-cluster T18 cross-back + 4 intra-session bidirectional with T25 + 5 math-tools no-new-stubs); 12 from T25 (3 back-edge closures + 4 intra-session bidirectional [dedupe with T20] + 1 distant T38 forward closure + 6 math-tools incl. 1 new stub). **De-duplicated total: 26** (intra-session bidirectional counted once). math-tools IN-degree: **52** (was 51). **6 forward-edges closed; 4 cross-cluster intra-session edges added.**

### Edges from Topic 19 — Wave Equation (Session 53)

| Source atomic | → | Target | Type | Notes |
|---|---|---|---|---|
| `wave_speed_string_atomic` | ← | Topic 11 Newton's Laws (back-edge) | prereq (closes) | **CLOSES** T11 → T19 anticipated (Session 50, F = ma on string arc element) |
| `travelling_wave_function_atomic` | ← | Topic 17 SHM (back-edge) | prereq (closes) | **CLOSES** T17 A4-derived "wave_equation_general_solution_sinusoidal" anticipated forward (Session 38) — sinusoidal SHM solution transfers to wave-eq |
| `wave_energy_power_atomic` | ← | Topic 13 Work-Energy (back-edge) | prereq (closes) | **CLOSES** T13 → T19 anticipated (energy transport through medium) |
| `wave_equation_pde_atomic` + `wave_speed_string_atomic` | ← | Topic 21 Wave Motion (back-edge) | prereq (closes) | **CLOSES** T21 CT5 partial-derivative + tension-string anticipated forwards (Session 33, ~20-session lag — NEW LONGEST-LAG closure in matrix history) |
| `wave_equation_pde_atomic` | ↔ | Topic 22 Superposition (intra-session) | bridges (bidirectional) | **6 intra-cluster chapter-adjacent edges** (see T22 §E) |
| `wave_equation_pde_atomic` | → | Topic 38 EM Waves (back-edge) | prereq (closes) | T38 Maxwell-reduces-to-wave-eq form; already catalogued — closes loop |
| `travelling_wave_function_atomic` | → | Topic 44 Wave Optics (back-edge) | prereq | T44 light-as-EM-wave references wave-eq foundation |
| `wave_equation_pde_atomic` | → | Topic 46 Dual Nature (back-edge weak) | bridges (weak) | de Broglie wave function Schrödinger-eq analog |
| Math-tools refs (6): calculus_partial_derivative + trig_sinusoidal + calculus_chain_rule + calculus_second_derivative + algebra_quadratic + algebra_unit_analysis | → | math-tools | math-tools | **ZERO NEW STUBS**; all REQUIRED |

### Edges from Topic 22 — Superposition & Standing Waves (Session 53)

| Source atomic | → | Target | Type | Notes |
|---|---|---|---|---|
| `superposition_principle_atomic` + `standing_waves_string_atomic` + `normal_modes_atomic` + `nodes_antinodes_atomic` + `beats_atomic` + `wave_interference_quantitative_atomic` | ↔ | Topic 19 Wave Equation (intra-session) | bridges (bidirectional) | **6 intra-cluster chapter-adjacent edges** (same NCERT Ch.14 split — see T19 §E) |
| `normal_modes_atomic` + `resonance_amplitude_buildup_nano` | ← | Topic 17 SHM (back-edge) | prereq (closes) | **CLOSES** T17 "each particle executes SHM at fixed point" anticipated forward (Session 38) — standing-wave particles execute SHM at antinode |
| `superposition_principle_atomic` | ← | Topic 21 Wave Motion (back-edge) | prereq (closes) | **CLOSES** T21 CT6 wave_reflection_standing_waves anticipated forward (Session 33) |
| `wave_interference_quantitative_atomic` | ↔ | Topic 44 Wave Optics (cross-cluster bidirectional) | bridges (bidirectional) | YDSE intensity pattern = mechanical-wave interference machinery in optical domain |
| `standing_waves_string_atomic` + `normal_modes_atomic` | → | Topic 23 Sound Waves (anticipated) | prereq (forward) | T23 pipe-acoustic resonance + beats application — anticipated forward to next-session batch |
| `acoustic_resonator_cavity_application_nano` | → | Topic 38 EM Waves (back-edge weak) | bridges (weak) | Microwave cavity = 3D standing-wave; weak forward closure |
| Math-tools refs (6): trig_sum_to_product + trig_sinusoidal + algebra_basic_ratio + algebra_integer_modes + time_averaging_cos_squared (4th cross-cluster validation) + algebra_envelope_modulation | → | math-tools | math-tools | **ZERO NEW STUBS**; `time_averaging_cos_squared` validated 4th time (T44 → T38 → T39 → T22) — tied with `calculus_exponential_decay` as most-validated Stage-3 primitive |

**Note on T19 ↔ T22 intra-cluster chapter-adjacent bidirectional edges:** **Same-NCERT-chapter split** (Ch.14 §14.1-14.4 = T19 + §14.5-14.10 = T22) → **6 bidirectional edges**, sitting in the 6-9 intra-cluster chapter-adjacent density band. **7th data point** confirming density rule (intra-cluster band). Same predictor class as T41↔T42 (Ch.9 split, 7) and T26↔T27 (Ch.12+13 adjacent, 7) and T45↔T47 (Ch.12 split, 9). Density rule continues to predict accurately.

**Note on Session 53 forward-edge closures:** **5 anticipated forward-edges closed** in single paired-batch (T11/T13/T17/T21 CT5 → T19 + T17/T21 CT6 → T22). Includes 2 closures of Session-38-era T17 forward-edges (sinusoidal-solution + SHM-at-fixed-point — 15-session lag) and 1 closure of Session-33-era T21 CT5/CT6 (~20-session lag — **NEW LONGEST-LAG closure in matrix history**, beating T21 CT2/CT3 at 18-19-session lag closed S51-S52). Combined Sessions 50+51+52+53: **45+ back-edges closed in 4 sessions** — densest 4-session window.

**Note on Waves middle cluster opening:** T19 + T22 jointly open the **9th cluster** (Waves middle — final major untouched cluster). T23 Sound Waves remains for cluster closure (Session 54 recommended). All 9 major clusters now opened/closed at 35-pilot checkpoint.

**Note on math-tools light-maintenance:** **0 new stubs across both T19 + T22.** Math-tools IN-degree unchanged at **52**. **`time_averaging_cos_squared` 4th-validated** (now tied with `calculus_exponential_decay` as most-validated Stage-3 primitive). **Light-maintenance now spans 4 consecutive sessions** with only 1 new stub net (T20 0 + T25 1 + T19 0 + T22 0 = 1 across 2 sessions) — second-longest zero-stub-dominant streak observed.

**Total edges captured (after 35 pilots): ~394** (cumulative, was 368 at 33-pilot). Net new edges from T19+T22 batch: 26 — 14 from T19 (4 outgoing back-edge closures + 6 intra-session bidirectional with T22 + 3 forward-extends to T38/T44/T46 + 6 math-tools no-new); 12 from T22 (2 back-edge closures + 6 intra-session bidirectional [dedupe] + 1 cross-cluster bidirectional T44 + 2 forward to T23 + 6 math-tools no-new). **De-duplicated total: 26** (intra-session bidirectional counted once). math-tools IN-degree unchanged: **52**. **5 forward-edges closed; 6 intra-cluster intra-session edges added.**

### Edges from Topic 23 — Sound Waves (Session 54)

| Source atomic | → | Target | Type | Notes |
|---|---|---|---|---|
| `longitudinal_wave_sound_atomic` + `pressure_displacement_dual_atomic` + `doppler_effect_sound_atomic` + `intensity_loudness_db_atomic` | ↔ | Topic 19 Wave Equation (intra-cluster) | bridges (bidirectional) | **5 intra-cluster chapter-adjacent edges** (Ch.14→Ch.15 NCERT-adjacent; see T23 §E) |
| `pipe_acoustic_resonance_atomic` + `beats_doppler_application_nano` | ↔ | Topic 22 Superposition (intra-cluster) | bridges (bidirectional) | **4 intra-cluster chapter-adjacent edges** (pipe-acoustics ← T22 standing-waves + normal-modes + nodes-antinodes; beats cross-link) |
| `speed_of_sound_newton_laplace_atomic` | ← | Topic 26 Thermodynamics (back-edge) | prereq (closes) | **CLOSES** T26 anticipated forward (Session 49): adiabatic_process → Laplace γP/ρ correction |
| `temperature_dependence_v_sqrt_T_nano` | ← | Topic 27 Kinetic Theory (back-edge) | prereq (closes) | **CLOSES** T27 anticipated forward (Session 49): ideal_gas + γ-ratio → v_sound = √(γRT/M) |
| `speed_in_liquids_solids_nano` | ← | Topic 18 Elasticity (back-edge weak) | prereq (closes) | **CLOSES** T18 weak forward (Session 50): bulk + Young's modulus → v_sound in liquids/solids |
| `doppler_effect_sound_atomic` + `source_observer_asymmetry_explanation_nano` | ↔ | Topic 38 EM Waves (contrast bridge) | bridges (contrast) | T38 EM-wave Doppler is Lorentz-invariant; T23 mechanical Doppler is medium-frame-asymmetric — explicit contrast bridge already authored in T38 |
| `doppler_radar_application_nano` | ↔ | Topic 44 Wave Optics (cross-cluster weak) | bridges (weak) | Doppler-radar uses EM waves; analogous to acoustic Doppler |
| Math-tools refs (7): trig_sinusoidal + sqrt_function_dimensional + logarithm_base_10 + inverse_square_law_geometric + algebra_signed_velocity_doppler + geometric_mach_cone_sin_theta + time_averaging_cos_squared (5th cross-cluster use) | → | math-tools | math-tools | **ZERO NEW STUBS**; `time_averaging_cos_squared` validated 5th time (T44 → T38 → T39 → T22 → T23) — now SOLE most-validated Stage-3 primitive (passes `calculus_exponential_decay`'s 5) |

**Note on T22 ↔ T23 intra-cluster chapter-adjacent bidirectional edges:** **NCERT-Ch.14→Ch.15 adjacent split** → **4 bidirectional edges** — BELOW the 6-9 intra-cluster chapter-adjacent density band (8th data point). **Sub-pattern observed for first time**: when middle-topic carries the bridging weight (T22 here), the cluster-closer pair (T22-T23) has fewer direct edges than the cluster-opener pair (T19-T22 = 6 edges). Flag for Stage-4 cumulative observation. Combined 3-topic Waves middle cluster intra-cluster bidirectional edges: **15** (T19↔T22 = 6, T22↔T23 = 4, T19↔T23 = 5).

**Note on Session 54 forward-edge closures:** **4 anticipated forward-edges closed** (T26 + T27 + T18 + weak-T7/T17 indirect). Combined Sessions 50+51+52+53+54: **49+ back-edges closed in 5 sessions** — extends densest-window streak.

**Note on Waves cluster CLOSURE:** T23 completes the **9th major cluster** (Waves middle T19+T22+T23 = 3/3). **All 9 major clusters now CLOSED/NEAR-CLOSED at 36-pilot/82% checkpoint.** No major cluster remains in "opener" state. Remaining 8 pilots = single-topic closures + Kinematics-formalisation (T6/T7/T9) + ~5 stragglers.

**Note on math-tools light-maintenance:** **0 new stubs in T23.** Math-tools IN-degree unchanged at **52**. **`time_averaging_cos_squared` 5th-validated** — now **sole** most-validated Stage-3 primitive (passes `calculus_exponential_decay` at 5). **Light-maintenance now spans 5 consecutive sessions** (S50 → S51 → S52 → S53 → S54; T20 0 + T25 1 + T19 0 + T22 0 + T23 0 = 1 new stub net across 3 sessions) — **NEW LONGEST zero-stub-dominant streak** (prior record 4 sessions).

**Total edges captured (after 36 pilots): ~414** (cumulative, was 394 at 35-pilot). Net new edges from T23: 20 — 4 outgoing back-edge closures (T26 + T27 + T18 + weak) + 5 intra-cluster bidirectional with T19 + 4 intra-cluster bidirectional with T22 (dedupe — counted once each pair) + 2 contrast bridges to T38 + 1 cross-cluster weak to T44 + 7 math-tools no-new. math-tools IN-degree unchanged: **52**. **4 forward-edges closed; 9 intra-cluster intra-session edges added (5 T19 + 4 T22).**

### Edges from Topic 6 — Kinematics 1D (Session 55)

| Source atomic | → | Target | Type | Notes |
|---|---|---|---|---|
| All T6 atomics | ↔ | Topic 7 2D Kinematics (intra-session) | bridges (bidirectional) | **8 intra-cluster chapter-adjacent edges** (NCERT Ch.3 → Ch.4 adjacent split; 9th density-rule data point — upper-middle of 6-9 band) |
| `acceleration_definition_atomic` + `sign_convention_1d_atomic` + `position_frame_of_reference_atomic` | ← | Topic 11 Newton's Laws (back-edge) | prereq (closes) | **CLOSES** T11 Session-50 forward (5-session lag): F=ma + inertial-frame ← T6 |
| `kinematic_equations_constant_a_atomic` + `sign_convention_1d_atomic` | ← | Topic 12 Friction (back-edge) | prereq (closes) | **CLOSES** T12 Session-35 forward (20-session lag): friction problems ← T6 |
| `displacement_vs_distance_atomic` + `avg_vs_instantaneous_velocity_atomic` | ← | Topic 13 Work-Energy (back-edge) | prereq (closes) | **CLOSES** T13 Session-37 forward (18-session lag): W-E theorem ← T6 displacement; KE ← T6 v |
| `avg_vs_instantaneous_velocity_atomic` | ← | Topic 14 Momentum & Collisions (back-edge) | prereq (closes) | **CLOSES** T14 Session-50 forward (5-session lag): impulse + momentum ← T6 v |
| `kinematic_equations_constant_a_atomic` | ← | Topic 15 Rotational Mechanics (back-edge) | prereq (closes) | **CLOSES** T15 Session-51 forward (4-session lag): angular-kinematics ← T6 linear-analog |
| `avg_vs_instantaneous_velocity_atomic` + `acceleration_definition_atomic` | ← | Topic 17 SHM (back-edge) | prereq (closes) | **CLOSES** T17 Session-38 forward (17-session lag): SHM-at-fixed-point ← T6 |
| `avg_vs_instantaneous_velocity_atomic` | ← | Topic 19 Wave Equation (back-edge) | prereq (closes) | **CLOSES** T19 Session-53 forward (2-session lag): particle-vs-wave-velocity ← T6 |
| `avg_vs_instantaneous_velocity_atomic` | ← | Topic 21 Wave Motion (back-edge weak) | prereq (closes) | **CLOSES** T21 Session-33 forward (22-session lag — **NEW LONGEST-LAG**, beats prior 20-session record) |
| Math-tools refs (7): calculus_basic_derivative + calculus_integration + calculus_integration_area_under_curve + algebra_quadratic + algebra_simultaneous_2var + geometric_slope_of_curve + algebra_signed_scalar | → | math-tools | math-tools | **ZERO NEW STUBS** |

### Edges from Topic 7 — Kinematics 2D / Relative Motion (Session 55)

| Source atomic | → | Target | Type | Notes |
|---|---|---|---|---|
| All T7 atomics | ↔ | Topic 6 1D Kinematics (intra-session) | bridges (bidirectional) | **8 intra-cluster chapter-adjacent edges** (deduplicated with T6 above) |
| All T7 atomics | ← | Topic 5 Vectors (back-edge) | prereq | T5 already in repo (vector-resolution + addition foundation) |
| `vector_kinematics_2d_atomic` + `galilean_transformation_atomic` | ← | Topic 10 Circular Motion (back-edge) | prereq (closes) | **CLOSES** T10 Session-39 forward (16-session lag): uniform-circular + centripetal-acceleration ← T7 vector-derivative |
| `galilean_transformation_atomic` | ← | Topic 11 Newton's Laws (back-edge) | prereq (closes) | **CLOSES** T11 Session-50 forward (5-session lag): Newton-2 in inertial frame ← T7 |
| `vector_kinematics_2d_atomic` + `galilean_transformation_atomic` | → | Topic 8 Projectile Motion (anticipated) | prereq (forward) | T8 next-session: trajectory + max-range ← T7 vector-kinematics + parametric |
| `vector_kinematics_2d_atomic` (weak) | ← | Topic 13/14/15/21/23/35/36/38 (back-edge weak) | prereq (weak) | 8 weak back-edges to Mechanics/Wave/E&M topics (vector-velocity foundation reused) |
| Math-tools refs (7): vector_addition_subtraction + vector_resolution_components + trig_arctan_for_angle + trig_sin_cos_for_resolution + pythagoras_magnitude + calculus_basic_derivative + algebra_simultaneous_2var | → | math-tools | math-tools | **ZERO NEW STUBS** |

**Note on T6 ↔ T7 intra-cluster chapter-adjacent bidirectional edges:** **8 edges** = same-NCERT-chapter-adjacent split (Ch.3 → Ch.4). **9th data point** validating intra-cluster chapter-adjacent density rule (6-9 band — sits in upper-middle). Same predictor class as T11↔T14 (8) and T37↔T39 (8). 9-data-point base now firmly establishes the rule across multiple cluster types.

**Note on Session 55 forward-edge closures:** **10 anticipated forward-edges closed in single session — NEW SINGLE-SESSION HIGH** (T6 alone closes 8: T11/T12/T13/T14/T15/T17/T19/T21; T7 closes 2: T10 + T11-second-edge). **NEW LONGEST-LAG closure: 22-session lag** (T21 Session 33 → T6 wave_velocity ← T6 velocity-definition; beats prior 20-session record set Session 53). Combined Sessions 50+51+52+53+54+55: **59+ back-edges closed in 6 sessions** — extends densest-window streak further.

**Note on Kinematics-formalisation cluster opening:** T6 + T7 jointly open the **10th cluster** (Kinematics-formalisation — final cluster opener). T8 Projectile + T9 Motion-in-Plane remain for cluster closure (Session 56 recommended). **All 10 clusters (9 major + Kinematics-formalisation) now opened/closed at 38-pilot/86% checkpoint.**

**Note on math-tools light-maintenance:** **0 new stubs across T6 + T7.** Math-tools IN-degree unchanged at **52**. **Light-maintenance now spans 6 consecutive sessions** (S50 → S51 → S52 → S53 → S54 → S55) — **EXTENDS LONGEST zero-stub streak** (prior 5-session record set Session 54).

**Total edges captured (after 38 pilots): ~452** (cumulative, was 414 at 36-pilot). Net new edges from T6+T7 batch: 38 — T6: 8 back-edge closures + 8 intra-session bidirectional + 7 math-tools = 15 dedupe; T7: 2 back-edge closures + 1 forward to T8 + 6 weak back-edges + 8 intra-session bidirectional [dedupe] + 7 math-tools = 9 dedupe; intra-session bidirectional counted once = **38 net new edges**. math-tools IN-degree unchanged: **52**. **10 forward-edges closed; 8 intra-cluster intra-session edges added.**

### Edges from Topic 8 — Projectile Motion (Session 56)

| Source atomic | → | Target | Type | Notes |
|---|---|---|---|---|
| `projectile_decoupling_atomic` + `angular_projectile_trajectory_atomic` + `two_projectile_relative_nano` | ← | Topic 7 2D Kinematics (intra-cluster) | prereq (closes) | **CLOSES** T7 Session-55 anticipated forward (1-session lag): projectile ← vector-kinematics + parametric + Galilean |
| `horizontal_launch_atomic` + `range_height_tof_atomic` | ← | Topic 6 1D Kinematics (intra-cluster) | prereq | free_fall + kinematic-equations (laid Session 55) |
| `projectile_on_incline_atomic` | ← | Topic 5 Vectors (back-edge) | prereq | T5 already in repo (rotated-axis resolution) |
| `projectile_decoupling_atomic` | ↔ | Topic 9 Motion-in-Plane (intra-session) | bridges (bidirectional) | **4 intra-cluster cluster-closer edges** (below 6-9 band; see T9 §E) |
| `angular_projectile_trajectory_atomic` | ← | Topic 10 Circular Motion (back-edge weak) | prereq (closes) | **CLOSES** T10 Session-39 forward (weak; combined-projectile-circular problems) |
| `velocity_at_top_nano` + `range_height_tof_atomic` | ← | Topic 13 Work-Energy (back-edge) | prereq (closes) | **CLOSES** T13 Session-37 forward (19-session lag): projectile energy-conservation ← velocity-at-any-point |
| `angular_projectile_trajectory_atomic` | ← | Topic 14 Momentum (back-edge) | prereq (closes) | **CLOSES** T14 Session-50 forward (5-session lag): exploding-projectile + impulse |
| `angular_projectile_trajectory_atomic` | ← | Topic 16 Gravitation (back-edge weak) | prereq (closes) | weak: Newton's-cannonball → orbital-as-extended-projectile bridge |
| Math-tools refs (7): algebra_quadratic + trig_sin_cos + trig_double_angle_sin2theta + calculus_minmax + kinematic_equations_constant_a + vector_resolution_components + algebra_sqrt_function | → | math-tools | math-tools | **ZERO NEW STUBS** |

### Edges from Topic 9 — Motion in a Plane: Circular Kinematics (Session 56)

| Source atomic | → | Target | Type | Notes |
|---|---|---|---|---|
| All T9 atomics | ↔ | Topic 8 Projectile (intra-session) | bridges (bidirectional) | **4 intra-cluster cluster-closer edges** (deduplicated with T8 above) |
| `angular_kinematic_variables_atomic` + `centripetal_acceleration_kinematic_atomic` | ← | Topic 7 2D Kinematics (intra-cluster) | prereq | vector-kinematics + vector-velocity-derivative (laid Session 55) |
| `tangential_radial_acceleration_atomic` | ← | Topic 5 Vectors (back-edge) | prereq | T5 in repo (vector resolution) |
| `centripetal_acceleration_kinematic_atomic` | ← | Topic 10 Circular Motion DYNAMICS (back-edge — KEY) | prereq (closes) | **CLOSES** T10 Session-39 forward (17-session lag): centripetal_FORCE = m·a_c — T9 supplies the kinematic foundation T10's force-discussion assumed |
| `angular_kinematic_variables_atomic` | ← | Topic 15 Rotational Mechanics (back-edge) | prereq (closes) | **CLOSES** T15 Session-51 forward (5-session lag): rigid-body angular-kinematics ← point-particle angular-variables |
| `uniform_circular_motion_atomic` + `centripetal_acceleration_kinematic_atomic` | ← | Topic 16 Gravitation (back-edge) | prereq (closes) | **CLOSES** T16 Session-40 forward (16-session lag): orbital-velocity + satellite-period ← UCM + a_c |
| `uniform_circular_motion_atomic` | ← | Topic 17 SHM (back-edge) | prereq (closes) | **CLOSES** T17 Session-38 forward (18-session lag): SHM-as-UCM-projection ← UCM + ω |
| `centripetal_acceleration_kinematic_atomic` | ← | Topic 36 Moving Charges (back-edge) | prereq (closes) | **CLOSES** T36 Session-36 forward (20-session lag): cyclotron + circular-motion-in-B ← a_c |
| Math-tools refs (6): calculus_basic_derivative + algebra_quadratic + vector_subtraction_geometric + trig_radian_measure + pythagoras_magnitude + algebra_ratio_proportion | → | math-tools | math-tools | **ZERO NEW STUBS** |

**Note on T8 ↔ T9 intra-cluster cluster-closer edges:** **4 bidirectional edges** — BELOW the 6-9 chapter-adjacent density band. **CONFIRMS Session-54 sub-pattern for the 2nd time**: cluster-closer pairs sit below band (T22-T23 = 4; now T8-T9 = 4) when the cluster-opener pair carried the bridging weight (T6-T7 = 8). **10th density-rule data point; 2nd cluster-closer-below-band confirmation.** Sub-pattern now has 2 confirmations — promote from "flag" to "established sub-rule" at next Stage-4 sweep.

**Note on Session 56 forward-edge closures:** **9 anticipated forward-edges closed** (T8 = 4: T7-intra + T10-weak + T13 + T14 + T16-weak; T9 = 5: T10-KEY + T15 + T16 + T17 + T36). **T9 closes the KEY 17-session-lag T10 dependency** — T10's entire centripetal-FORCE discussion (Session 39) assumed circular-kinematics; T9 finally supplies it. Combined Sessions 50-56: **68+ back-edges closed in 7 sessions** — extends densest-window streak.

**Note on Kinematics-formalisation cluster CLOSURE:** T8 + T9 jointly CLOSE the **10th + final cluster** (Kinematics-formalisation, 4/4 with T5/T6/T7). **ALL 10 CLUSTERS now CLOSED at 40-pilot/91% checkpoint.** Remaining 4 pilots = NCERT-intro stragglers (T1-T4) + minor extensions — pure Stage-2 closure, no cluster work.

**Note on math-tools light-maintenance:** **0 new stubs across T8 + T9.** Math-tools IN-degree unchanged at **52**. **Light-maintenance now spans 7 consecutive sessions** (S50 → S56) — **EXTENDS LONGEST zero-stub streak**. **All 4 Kinematics-cluster pilots (T6/T7/T8/T9) added ZERO new stubs** — the Stage-3 file (authored ~7 sessions ago) fully anticipated the entire cluster's mathematical needs. Strongest validation yet of the anticipated-stub strategy.

**Total edges captured (after 40 pilots): ~487** (cumulative, was 452 at 38-pilot). Net new edges from T8+T9 batch: 35 — T8: 4 back-edge closures + 4 intra-session bidirectional + 7 math-tools + intra-cluster T6/T7 (laid) = ~13 dedupe; T9: 5 back-edge closures + 4 intra-session bidirectional [dedupe] + 6 math-tools = ~9 dedupe; net new = **35**. math-tools IN-degree unchanged: **52**. **9 forward-edges closed; 4 intra-cluster intra-session edges added.**

### Edges from Topic 2 — Units and Measurements (Session 57)

| Source atomic | → | Target | Type | Notes |
|---|---|---|---|---|
| `dimensional_analysis_atomic` + `si_units_and_unit_consistency_atomic` | ← | math-tools `dimensional_analysis` + `unit_analysis` (ABSORBED) | **re-home (DAG-root)** | **ABSORBS** the dimensional_analysis + unit_analysis math-tool terminators cited by ~8 prior pilots (T18/T20/T25/T26/T27/T6/etc.) — these now resolve to T2 as their true teaching home. math-tools IN-degree HELD at 52; Stage-4 to formally re-home |
| `error_analysis_and_propagation_atomic` | ↔ | Topic 3 Mathematical Tools (intra-session) | bridges (bidirectional) | error-combination derives from differentials (∂Z/∂A); part of the 4 T2↔T3 intra-session edges |
| `dimensional_analysis_atomic` | ↔ | Topic 3 Mathematical Tools (intra-session) | bridges (bidirectional) | sin/cos/log/exp arguments must be dimensionless (T2 limitation ↔ T3 function-domains) |
| `significant_figures_atomic` | ↔ | Topic 3 Mathematical Tools (intra-session) | bridges (bidirectional) | both are controlled-precision disciplines (sig-figs ↔ truncated expansions) |
| Math-tools refs: algebra_basic + calculus_partial_derivative + logarithm_base_10 | → | math-tools | math-tools | **ZERO NEW STUBS** (2 existing stubs ABSORBED, not added) |

### Edges from Topic 3 — Mathematical Tools (Session 57)

| Source atomic | → | Target | Type | Notes |
|---|---|---|---|---|
| `derivative_as_rate_and_slope_atomic` + `integral_as_area_and_accumulation_atomic` + `approximations_in_physics_atomic` | ← | math-tools `calculus_derivative_basics` + `calculus_integration_basics` + `trig_small_angle_approximations` + `series_binomial_expansion` (ABSORBED) | **re-home (DAG-root)** | **ABSORBS** 4 teaching-unit terminators cited by ~10 prior pilots (T6/T8/T9/T13/T16/T17/T21/T44/etc.) as their student-facing home. math-tools FILE remains the registry; IN-degree HELD at 52; Stage-4 to reconcile teaching-unit ownership |
| (vectors) | — | Topic 5 Vectors | **DEFERRED (non-edge)** | **MT-G2: T3 explicitly does NOT teach vectors — T5 owns them.** Recorded as a boundary, not a dependency |
| `functions_and_graphs_in_physics_atomic` | ↔ | Topic 2 Units (intra-session) | bridges (bidirectional) | graph axes carry units; slope/area inherit composite units (4th T2↔T3 edge; first 3 enumerated under T2 above) |
| Math-tools refs: calculus_minmax (functions extrema) | → | math-tools | math-tools | **ZERO NEW STUBS** (4 teaching-units ABSORBED) |

**Note on T2 ↔ T3 intra-session edges:** **4 bidirectional edges** (error↔derivative, dim-analysis↔functions, sig-figs↔approximations, functions↔units). Foundation-intro **straggler-pair** (NOT a cluster — all 10 clusters closed at S56), so the cluster-opener/closer density sub-rule does NOT apply; cross-link band 2-4 governs → 4 edges (in-band).

**Note on the DAG-ROOT capstone finding:** **T2 + T3 + T5 are the ROOT NODES of the physics-knowledge DAG** — highest IN-degree (every quantitative/calculus/vector atomic depends on them), near-zero OUT-degree (they depend on nothing physics — only basic algebra + the Math syllabus). They were authored 41st/42nd/(T5 in-repo) precisely BECAUSE they are so foundational that every prior topic silently ASSUMED them and cited their content as "math-tools" terminators. Authoring them LAST closes the dependency graph from the bottom. **This directly answers the future IIT-professor "why a taxonomy and not a knowledge graph?" question: our atomic concepts ARE knowledge-graph nodes, and T2/T3/T5 are demonstrably the graph roots — the math-tool terminators do not dangle, they resolve into these three foundation topics.**

**Note on NCERT-DELEGATED (new coverage class):** T3 introduces a 3rd coverage mechanism. **TRIPLE** = in all 3 series; **NCERT-OMITTED** = NCERT skips a JEE-Advanced extension (e.g. T8 incline-projectile, 80%); **NCERT-DELEGATED** = NCERT structurally hands the material to ANOTHER subject (Class 11/12 Math) and uses it operationally without re-teaching (T3 ~50%). Two DIFFERENT mechanisms depress triple-coverage — omission vs delegation. Stage-4 to add NCERT-DELEGATED to the formal coverage taxonomy.

**Note on math-tools light-maintenance:** **0 new stubs across T2 + T3.** Math-tools IN-degree HELD at **52** (with 6 terminators flagged for re-homing to T2/T3/T5 at Stage-4 — a reclassification, not a count change). **Light-maintenance now spans 8 consecutive sessions** (S50 → S57) — **EXTENDS LONGEST zero-stub streak**. The foundation stragglers add no new mathematical machinery; they CLAIM OWNERSHIP of machinery the math-tools file already registered.

**Total edges captured (after 42 pilots): ~499** (cumulative, was 487 at 40-pilot). Net new edges from T2+T3 batch: ~12 (4 intra-session bidirectional + T2 ~3 outgoing/absorbed-reclassified + T3 ~2 outgoing + algebra/log/minmax existing; the ~14 ABSORBED math-tool terminators are RECLASSIFICATIONS of existing edges, NOT additions to the total). math-tools IN-degree unchanged: **52**. **0 forward-edges closed (foundation roots have no upstream to close); ~14 math-tool terminators reclassified to DAG-root ownership.**

### Edges from Topic 1 — Physical World (Session 58 — FINAL straggler-pair)

| Source atomic | → | Target | Type | Notes |
|---|---|---|---|---|
| `fundamental_forces_in_nature_atomic` + `all_contact_forces_are_em_nano` | ← | Topic 11 Newton's Laws + Topic 12 Friction (conceptual back-edge) | bridges (conceptual) | **RESOLVES** the conceptual framing: T11/T12's contact-force zoo IS the EM fundamental force (weak/conceptual, not hard prereq) |
| `conservation_laws_as_organizing_principles_atomic` | ← | Topic 13 Work-Energy + Topic 14 Momentum (conceptual back-edge) | bridges (conceptual) | T13/T14 APPLY conservation; T1 explains WHY it is fundamental (symmetry-rooted) |
| `fundamental_forces_in_nature_atomic` | ← | Topic 16 Gravitation + Topic 36 Moving Charges + Topic 48 Nuclei (conceptual back-edge) | bridges (conceptual) | gravity / EM / strong-weak nuclear are the 4 fundamental forces — T1 frames them |
| (umbrella) | ↔ | Topic 4 Lab Experiments (intra-session) | bridges (weak bidirectional) | scientific-method ↔ experimental-skills (2 edges — LEAST-connected straggler pairing) |
| Math-tools: order_of_magnitude (scale-ladder, existing, owned by T2) | → | math-tools | math-tools | **ZERO NEW STUBS** (most math-light pilot of the run) |

### Edges from Topic 4 — Lab Experiments (Session 58 — FINAL pilot; STAGE-2 CLOSE)

| Source atomic | → | Target | Type | Notes |
|---|---|---|---|---|
| `graph_based_constant_determination_atomic` | → | Topic 3 Mathematical Tools | applies | THE core skill applies T3 functions/linearising + derivative/slope |
| `measurement_instruments_practical_atomic` + `error_sources_per_experiment_nano` | → | Topic 2 Units & Measurements | applies | procedure APPLIES T2 least-count/sig-figs/error concept (T4-G2 boundary) |
| `pendulum_g_nano` + `spring_constant_nano` | → | Topic 6 1D Kinematics + Topic 17 SHM | applies | pendulum/spring measure g/k via SHM period |
| `youngs_modulus_searle_nano` | → | Topic 18 Elasticity | applies | Searle's apparatus measures Young's modulus |
| `metre_bridge_resistance_nano` + `potentiometer_emf_nano` | → | Topic 33/34 Current Electricity | applies | electrical bench experiments apply Ohm/Kirchhoff/Wheatstone |
| `lens_focal_length_uv_nano` + `refractive_index_real_apparent_depth_nano` | → | Topic 42 Refraction Lenses | applies | optical bench experiments apply lens formula/refraction |
| (procedural) | ↔ | Topic 1 Physical World (intra-session) | bridges (weak bidirectional) | experimental-skill ↔ scientific-method (2 edges; dedupe with T1 above) |
| Math-tools: functions_and_graphs + calculus_derivative + error_analysis + algebra_ratio (all existing) | → | math-tools | math-tools | **ZERO NEW STUBS** |

**Note on the T1/T4 DAG-extremes finding:** the final pilot pair brackets the dependency DAG at its two EXTREMES. **T1 = conceptual-UMBRELLA SOURCE** (empty Requires; resolves 5 weak conceptual back-edges into T11/T12/T13/T14/T16/T36/T48; sits ABOVE physics). **T4 = application-SINK / terminal leaf** (richest Requires of any straggler — ~9 outgoing to T2/T3/T6/T17/T18/T33/T34/T42; ZERO incoming — nothing depends on "the experiments"). T1 frames physics and depends on nothing; T4 applies everything and nothing depends on it. A fitting structural close to Stage-2: T2/T3/T5 are the DAG ROOTS (foundation), T1 is the conceptual CEILING, T4 is the application FLOOR.

**Note on the COMPLETE coverage taxonomy (5 outcomes):** Stage-2 has now surfaced FIVE distinct coverage mechanisms — **TRIPLE** (in all 3 series — the 39 core topics); **NCERT-OMITTED** (NCERT skips a JEE-Advanced extension — T8 80%, T14 70%, T15 92%); **NCERT-DELEGATED** (NCERT hands math to the Math syllabus — T3 ~50%); **DCM-OMITTED** (the JEE-problem book skips qualitative material — T1 DUAL); **DCM-DOMINANT** (only DC Pandey gives a dedicated chapter; NCERT/HCV scatter — T4, the JEE Experimental-Skills unit). Each non-triple mechanism has a distinct, structurally-explainable cause. **Formalised in the Stage-4 FINAL sweep.**

**Note on math-tools light-maintenance:** **0 new stubs across T1 + T4** (T1 most math-light of the run; T4 a pure consumer of T2/T3 machinery). **Light-maintenance NEW LONGEST streak at 9 CONSECUTIVE SESSIONS** (S50 → S58). Math-tools IN-degree HELD at **52** through the entire foundation/straggler tail — the Stage-3 file anticipated everything.

**Total edges captured (after 44 pilots — STAGE-2 COMPLETE): ~512** (cumulative, was 499 at 42-pilot). Net new from T1+T4 batch: ~13 (T1: 2 intra-session + 5 weak conceptual back-edges + 1 T2 = ~3 net new beyond conceptual; T4: ~9 outgoing applies-edges + 2 intra-session [dedupe] = ~10 net new). math-tools IN-degree unchanged: **52**. **T1 resolves 5 weak conceptual back-edges (umbrella source); T4 adds the highest straggler outgoing-edge count (application sink); 0 hard forward-edges closed.**

---

## Part B — Aggregated matrix view (rows = source topic, columns = target topic)

Sparse matrix. Cell value = number of cross-topic-edges from row-topic INTO column-topic. Empty cell = 0 (no edges yet observed). `—` = diagonal (self).

Only topics with catalogs done get full rows. Columns include all 44 triple-covered topics (a topic can be a target before its own catalog is done).

### Active rows (40 pilot catalogs done — Topics 12, 21, 36, 10, 13, 17, 30, 16, 31, 29, 34, 41, 42, 43, 44, 45, 47, 46, 48, 49, 50, 35, 38, 37, 39, 26, 27, 11, 14, 15, 18, 20, 25, 19, 22, 23, 6, 7, 8, 9):

**Sub-matrix A — Mechanics + Waves target columns:**

| Source\Target | T5 Vec | T6 K1D | T7 Rot | T9 K2D | T10 Circ | T11 NL | T12 Fric | T13 WE | T14 Mom | T16 Grav | T17 SHM | T18 Elast | T19 WaveEq | T22 StWv | T23 Snd | T29 Chg |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **T12 Friction** | | | | | 1 | | — | | | | | | | | | |
| **T21 Wave Motion** | | | | | 1 | | | | | | 1 | 2 | | 1 | 1 | |
| **T36 Moving Charges** | | | | | 2 | | | | | | | | | | | |
| **T10 Circular Motion** | 1 | | 1 | 1 | — | 2 | 1 | 1 | | 1 | 1 | | | | | |
| **T13 Work-Energy-Power** | 1 | | | | 1 | 1 | 1 | — | 1 | 1 | 1 | | | | | |
| **T17 SHM** | | | | | | | | | | | — | 1 | 1 | 1 | 1 | |
| **T30 Electrostatics** | | | | | | | | | | | 1 | | | | | |
| **T16 Gravitation (NEW)** | | 1 | | | 1 | 1 | | 2 | | — | 1 | | | | | |
| **T31 Capacitors (NEW)** | | | | | | | | 1 | | | | | | | | 1 |
| **T29 Electric Charges (NEW)** | | | | | | | | | | 1 | | | | | | — |
| **T34 Current Electricity** | | | | | | | | | | | | | | | | 3 |
| **T41 Ray Optics Mirrors** | | 1 | | | | | | | | | | | | | | |
| **T42 Refraction Lenses** | | | | | | | | | | | | | | | | |
| **T43 Optical Instruments (NEW)** | | | | | | | | | | | | | | | | |
| **T44 Wave Optics** | | | | | | | | | | | | | | | 1 (T23 Doppler analog) | |
| **T45 Atomic Spectra (NEW)** | | | | | | | | | | | | | | | | |
| **T47 Atomic Models (NEW)** | | | | | | | | | | | | | | | | |
| **T46 Dual Nature** | | | | | | | | | | | | | | | | |
| **T48 Nuclei** | | | | | | | | | | | | | | | | |
| **T49 Semiconductor** | | | | | | | | | | | | | | | | |
| **T50 Communication Systems** | 1 | | | | | | | | | 1 | | | | | | |
| **T35 EM Induction** | | 1 | 1 | | | | | 2 | | | | | | | | |
| **T38 EM Waves** | | | | | | | | | 1 | | | | | | | |
| **T26 Thermodynamics (NEW)** | | | | | | | | 2 (back: first_law ← work-energy theorem + work_done_in_pv) | | | | | | | | |
| **T27 Kinetic Theory (NEW)** | | | | | | | | | | | | | | | | |
| **T11 Newton's Laws (NEW)** | 2 (back: T5 vec_add+vec_res) | | | 1 (T9 inclined ↔ 2D) | 1 (T10 closes) | — | | | | | | | | | | |
| **T14 Momentum/Collisions (NEW)** | 1 (back: T5 vec_resolve for 2D collision) | | | | | 8 (intra-session bidirectional with T11) | | 1 (back: T13 closes collision-KE-split) | — | | | | | | | |
| **T15 Rotational Mechanics (NEW)** | 2 (back: T5 cross-product + T6 kinematics-mirror) | 1 (back: T6 mirror) | | | 1 (back: T10 omega-eq-omega-r) | 1 (back: T11 rotational analog) | | 1 (back: T13 rotational W-E) | 1 (back: T14 angular-analog) | 1 (back: T16 Kepler-2) | 1 (back: T17 torsional-pendulum bridge) | 1 (back: T18 intra-session) | | | | |
| **T18 Elasticity** | | | | | | 1 (back: T11 stress-strain ← F/A) | | 1 (back: T13 elastic-PE ← ½kx²) | | | | — | | | | |
| **T20 Fluid Mechanics (NEW)** | | | | | | 1 (back: T11 fluid_pressure ← F=ma) | | 1 (back: T13 Bernoulli ← W-E) | | | | 2 (back: T18 viscosity↔shear, pressure↔hydraulic) | | | | |
| **T25 Thermal Properties** | | | | | | | | | | | | | | | | |
| **T19 Wave Equation (NEW)** | | | | | | 1 (back: T11 wave_speed_string ← F=ma) | | 1 (back: T13 wave_energy ← W-E) | | | 1 (back: T17 sinusoidal-solution) | | — | | | |
| **T22 Superposition & Standing Waves (NEW)** | | | | | | | | | | | 1 (back: T17 particle-SHM at antinode) | | 6 (intra-session bidirectional with T19) | 1 (forward to T22 cross-cluster T44 already counted) | 1 (forward anticipated T23) | |
| **T23 Sound Waves (NEW Session 54)** | | | | | | | | | | | 1 (back, weak: indirect SHM at fixed-point) | 1 (back: T18 v_sound in liquids/solids ← Y, K) | 5 (intra-cluster bidirectional with T19) | 4 (intra-cluster bidirectional with T22) | — | |
| **T6 Kinematics 1D (NEW Session 55)** | 1 (back: T5 vector_resolution) | — | | | | | | | | | | | | | | |
| **T7 Kinematics 2D/Rel-Motion (NEW Session 55)** | 1 (back: T5 vector_addition+resolution) | 8 (intra-session bidirectional with T6) | | | 2 (back: T10 closes uniform-circular ← T7 vector-derivative) | 1 (back: T11 closes inertial-frame Newton-2 ← T7 Galilean) | | 1 (back: T13 weak) | 1 (back: T14 weak) | | | | 1 (back: T19 weak via T6) | 1 (back: T22 weak) | 1 (back: T23 weak doppler vectors) | |
| **T8 Projectile Motion (NEW Session 56)** | 1 (back: T5 rotated-axis resolution) | | 1 (closes T7 forward: projectile ← vector-kinematics) | 4 (intra-session bidirectional with T9) | 1 (back: T10 weak combined-projectile-circular) | | | 1 (back: T13 projectile energy-conservation) | 1 (back: T14 exploding-projectile) | 1 (back: T16 weak Newton's-cannonball) | | | | | | |
| **T9 Motion-in-Plane Circular-Kinematics (NEW Session 56)** | 1 (back: T5 vector resolution) | 1 (back: T6 angular-eqns ← linear analogy) | 1 (intra-cluster: angular ← T7 vector-kinematics) | — | 1 (back: T10 KEY centripetal-force ← a_c, 17-session lag) | | | | | 1 (back: T16 orbital-velocity ← UCM) | 1 (back: T17 SHM-as-UCM-projection) | | | | | |
| **— Column totals (IN-edges, 40-pilot — Sub-matrix A targets)** | **12** | **13** | **4** | **6** | **14** | **18** | **2** | **16** | **5** | **7** | **10** | **7** | **13** | **8** | **5** | **4** |

**Sub-matrix B — E&M + Optics + Modern + math-tools target columns:**

| Source\Target | T30 Electrostat | T31 Caps/RC | T32 CurrEl | T33 Heating | T34 CurrEl | T36 MovChg | T37 MagMatter | T41 RayOptMir | T42 Refraction | T43 OptInstr | T44 WaveOpt | T45 AtomSpec | T47 AtomMod | math-tools |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **T12 Friction** | | | | | | | | | | | | | | 1 |
| **T21 Wave Motion** | | | | | | | | | | | 1 | | | 1 |
| **T36 Moving Charges** | 3 | 1 (Gauss) | | | | — | 1 | | | | | | 1 | 2 |
| **T10 Circular Motion** | | | | | | | | | | | | | | 1 |
| **T13 Work-Energy-Power** | 1 | | | | | | | | | | | | | 1 |
| **T17 SHM** | 1 | 1 (RC) | | | | | | | | | 1 | | | |
| **T30 Electrostatics** | — | 4 | 2 | 1 | | 1 | 1 | | | | 1 | | | |
| **T16 Gravitation** | 1 | | | | | | | | | | | | | 3 |
| **T31 Capacitors** | 4 | — | | | 1 | | | | | | | | | 1 |
| **T29 Electric Charges** | 3 | 1 | | | 1 | 1 | | | | | | | | 1 |
| **T34 Current Electricity** | 2 | 3 | | | — | 1 | | | | | | | | 2 |
| **T41 Ray Optics Mirrors** | | | | | | 1 | | — | 4 | 2 | 1 | | | 2 |
| **T42 Refraction Lenses** | | | | | | | | 3 | — | 4 | 3 | 1 | | 3 |
| **T43 Optical Instruments (NEW)** | | | | | | | | 1 (back) | 6 (back) | — | 4 | | | 2 |
| **T44 Wave Optics** | | | | | | | | | 3 (back) | 3 (back) | — | 1 | 1 | 3 |
| **T45 Atomic Spectra (NEW)** | 1 (back) | | | | | 1 (back) | | | 1 (back) | | 1 (back) | — | 2 (back) | 2 |
| **T47 Atomic Models** | 1 (back) | | | | | 1 (back) | | | | | | | — | 2 |
| **T46 Dual Nature (NEW)** | 1 (back) | | | | | 1 (back) | | | | | 1 (back) | 1 (back) | 2 (back) | 2 |
| **T48 Nuclei** | | | | | | | | | | | | 1 (back) | 2 (back) | 3 |
| **T49 Semiconductor** | 1 (back) | | | | 1 | | | | | | | | 1 (back) | 2 |
| **T50 Communication Systems** | | | | | | | | | 1 (back) | | 1 | | | 2 |
| **T35 EM Induction (NEW)** | | | | | 1 | 1 (back) | | | | | | | | 2 |
| **T38 EM Waves** | 2 (back: Maxwell+i_d) | 1 (back: u_E) | | | | 1 (back: i_d→Ampère) | | | | | | 1 (back: x-ray) | 1 (back via T45) | 1 |
| **T37 Magnetism & Matter (NEW)** | 1 (back: Gauss contrast + dipole bridge) | | | | | 3 (back: dipole + solenoid + torque) | — | | | | | | 1 (back: Bohr orbit ← diamagnetism) | 0 (no new) |
| **T39 AC Circuits (NEW)** | | 2 (back: ac_capacitor + lc_osc ← capacitor energy) | | | 3 (back: ac_resistor + LCR + power) | | 2 (back, intra-session: transformer-core + choke-coil) | | | | | | | 3 (1 new stub: phasor_complex_representation; + cos²/quadratic re-uses) |
| **T26 Thermodynamics (NEW)** | | | | | | | | | | | | | | 5 (3 new stubs: power_function_pv_gamma, pv_diagram_visualization, state_function_concept; + integration/log reuses) |
| **T27 Kinetic Theory (NEW)** | | | | | | | | | | | | | | 6 (3 new stubs: gaussian_distribution, integration_of_gaussian, statistical_ensemble_averaging; + statistical_averaging/sqrt/momentum reuses) |
| **T11 Newton's Laws (NEW)** | | | | | 1 (back: T10 closes) | | | | | | | | | 6 (1 new stub: system_of_linear_equations_2var; + vector/calculus reuses) |
| **T14 Momentum/Collisions (NEW)** | | | | | | 1 (back: T36 pair-production closes) | | | | | | | 1 (back: T47 Rutherford+Bohr closes) | 5 (T11's system-eqns stub cross-domain validated; no new stubs) |
| **T15 Rotational Mechanics (NEW)** | | | | | | 1 (back: T36 magnetic-dipole closes 14-session lag) | 1 (back: T37 quantised-L closes) | | | | | | 1 (back: T47 Bohr-L closes) | 6 (system-eqns stub 3rd validation; no new stubs) |
| **T18 Elasticity** | | | | | | | 1 (back, weak: stress-strain analog) | | | | | | | 3 (algebra_ratio + calculus + unit_analysis; no new stubs) |
| **T20 Fluid Mechanics (NEW)** | | | | | | 1 (back, weak: MHD analog) | | | | | | | | 5 (algebra_ratio + calculus_dvdy + unit_analysis + energy_conservation_streamline + dimensional_analysis; **zero new stubs**) |
| **T25 Thermal Properties** | | | | | | | | | | | | | | 6 (calculus_exp_decay 5th use + algebra_ratio + **NEW STUB power_function_T_fourth** + inverse_proportion + calculus_dT_dt + unit_analysis) |
| **T19 Wave Equation (NEW)** | | | | | | | | | | | | | 1 (back, weak: T46 de Broglie analog) | 6 (calculus_partial_deriv + trig_sinusoidal + calculus_chain_rule + calculus_2nd_deriv + algebra_quadratic + unit_analysis; **zero new stubs**) |
| **T22 Superposition & Standing Waves (NEW)** | | | | | | | | | | | 1 (back: T44 wave-interference bidirectional cross-cluster) | | | 6 (trig_sum_to_product + trig_sinusoidal + algebra_ratio + algebra_integer_modes + time_averaging_cos² 4th use + algebra_envelope; **zero new stubs**) |
| **T23 Sound Waves (NEW Session 54)** | | | | | | | | | | | 1 (back, weak: doppler_radar cross-cluster — EM-wave Doppler analog) | | | 7 (trig_sinusoidal + sqrt_function + logarithm_base_10 + inverse_square + algebra_signed_velocity + geometric_mach_cone + **time_averaging_cos² 5th use — now sole most-validated**; **zero new stubs**) |
| **T6 Kinematics 1D (NEW Session 55)** | | | | | | 1 (back: T35 motional_emf-velocity weak) | | | | | | | | 7 (calculus_deriv + calculus_integ + calculus_area_under_curve + algebra_quadratic + algebra_simul_2var + geometric_slope + algebra_signed; **zero new stubs**) |
| **T7 Kinematics 2D/Rel-Motion (NEW Session 55)** | | | | | | 1 (back: T36 Lorentz qv×B vector-velocity weak) | | | | | | | | 7 (vector_add_sub + vector_resolution_comp + trig_arctan + trig_sin_cos + pythagoras + calculus_deriv + algebra_simul_2var; **zero new stubs**) |
| **T8 Projectile Motion (NEW Session 56)** | | | | | | | | | | | | | | 7 (algebra_quadratic + trig_sin_cos + trig_double_angle_sin2θ + calculus_minmax + kinematic_eqns + vector_resolution + algebra_sqrt; **zero new stubs**) |
| **T9 Motion-in-Plane Circular-Kinematics (NEW Session 56)** | | | | | | 1 (back: T36 KEY cyclotron + circular-motion-in-B ← a_c, 20-session lag) | | | | | | | | 6 (calculus_deriv + algebra_quadratic + vector_subtraction_geometric + trig_radian + pythagoras + algebra_ratio; **zero new stubs**) |
| **T2 Units & Measurements (NEW Session 57)** | | | | | | | | | | | | | | 3 (algebra_basic + calculus_partial_deriv + logarithm_base_10; **zero new stubs — ABSORBS dimensional_analysis + unit_analysis terminators as DAG-root**) |
| **T3 Mathematical Tools (NEW Session 57)** | | | | | | | | | | | | | | 1 (calculus_minmax existing; **zero new stubs — ABSORBS calculus_derivative/integration + small-angle + binomial teaching-units as DAG-root; vectors DEFERRED to T5**) |
| **T1 Physical World (NEW Session 58 — FINAL pair)** | | | | | | 1 (conceptual back: T36 EM as fundamental force) | | | | | | | 1 (conceptual back: T47/T48 strong-weak nuclear) | 1 (order-of-magnitude, owned by T2) | **conceptual-UMBRELLA SOURCE**; resolves 5 weak conceptual back-edges (T11/T12/T13/T14/T16/T36/T48); **zero new stubs** |
| **T4 Lab Experiments (NEW Session 58 — FINAL pilot, STAGE-2 CLOSE)** | | | | | | | | | | | | | | 4 (functions_and_graphs + calculus_derivative + error_analysis + algebra_ratio, all existing; **application-SINK — ~9 outgoing to T2/T3/T6/T17/T18/T33/T34/T42; zero new stubs**) |
| **— Column totals (IN-edges, 44-pilot — STAGE-2 COMPLETE)** | **23** | **13** | **2** | **1** | **8** | **20** | **5** | **4** | **13** | **8** | **13** | **6** | **17** | **52** |

**Note on T1/T4 as the DAG EXTREMES (final structural finding):** **T2 + T3 + T5 = DAG roots** (foundation; highest IN-degree); **T1 = conceptual ceiling** (umbrella source — frames physics, near-zero outgoing, resolves only weak conceptual back-edges); **T4 = application floor** (terminal leaf — ~9 outgoing applies-edges to T2/T3 + 5 concept topics, ZERO incoming). The 44-pilot dependency graph is now fully bracketed: roots (T2/T3/T5) → core (39 triple-covered) → ceiling (T1) + floor (T4). math-tools IN-degree HELD at **52**; the Stage-4 FINAL sweep adds T2/T3/T5 as formal DAG-root target columns and re-homes the ~14 reclassified terminators.

**Note on T2/T3 as new TARGET columns (DAG-roots):** T2 and T3 are not yet broken out as their own target columns — doing so would add 2 very high-IN-degree columns (T2 ← ~8 absorbed dimensional/unit references + universal-implicit; T3 ← ~10 absorbed calculus/approximation references + universal-implicit) that would dwarf every existing column. **Deferred to the Stage-4 final sweep**, which will (a) add T2 + T3 + T5 as formal DAG-root target columns, (b) re-home the ~14 reclassified math-tool terminators from the math-tools column into them, and (c) recompute the math-tools IN-degree post-re-homing. For now math-tools IN-degree is HELD at 52 for continuity; the T2/T3 rows show only their (near-zero) OUTGOING edges, which is the DAG-root signature.

### Active rows: ALL 44 pilots shipped — **STAGE-2 COMPLETE (2026-05-26, Session 58).** No inactive rows remain. (Some target columns — e.g. T28/T32/T33 placeholder numbers — are E&M-cluster reservations per Stage-4 Sweep #2, not unwritten pilots; the 44 canonical-core + foundation-straggler topics are all catalogued.)

### IN-degree ranking after 23 pilots (last refresh: 9 pilots — stale, recompute pending):
1. **math-tools: 10** (universal terminator)
2. **T30 Electrostatics: 7** (E&M axis hub — clear lead)
3. **T31 Capacitors/RC: 6** (downstream of T30 + heavy IN from T17 + new T31 self-pilot revealed more)
4. **T10 Circular Motion: 6** (Mechanics axis hub — T16 added 1)
5. **T17 SHM: 5** (waves + E&M cluster bridge)
6. **T13 Work-Energy: 4**, **T11 Newton's Laws: 4** (T16 contributed)
7. **T18 Elasticity: 3**, **T44 LC Oscillations: 3**

### OUT-degree ranking after 23 pilots (last refresh: 9 pilots — stale, recompute pending):
1. **T36 Moving Charges: 10**, **T10 Circular Motion: 10**, **T30 Electrostatics: 11** (T30 leads after T31 batch corrected count to 4)
2. **T13 Work-Energy: 9** (still)
3. **T21 Wave Motion: 8**, **T16 Gravitation (NEW): 9** (T16 = 7 stage-2 + 3 math-tools when counted broadly; 7 stage-2 puts it tied with T17)
4. **T17 SHM: 7**, **T16: 7** (tied at stage-2-only counting), **T31 Capacitors: 7** (4 to T30 + 3 elsewhere)
5. **T12 Friction: 2**

**T16+T31 batch confirmed BOTH catalogs sit firmly in the mid-pack OUT-degree band** (~7 each). T31 is downstream-heavy (4 of 7 OUT-edges go to T30), confirming its position as a Tier-2 application topic.

---

## Part C — Pattern observations (updated cumulatively)

### After 44 pilots — STAGE-2 COMPLETE (2026-05-26 — adds Topics 1, 4 [Session 58]):

1. **STAGE-2 COMPLETE — 44 of 44 pilots = 100%.** T1 Physical World + T4 Lab Experiments shipped as the Session 58 final straggler-pair. Every triple-covered-core topic + every foundation/intro straggler is now catalogued. **The catalog harness has covered the entire canonical Indian pre-university physics syllabus** (NCERT × DC Pandey × HC Verma). Stage-2 → Stage-5 transition next.

2. **T1/T4 BRACKET THE DEPENDENCY DAG AT ITS EXTREMES — final structural finding.** **T1 = conceptual-UMBRELLA SOURCE** (sits ABOVE physics; empty Requires; resolves only 5 weak conceptual back-edges into T11/T12/T13/T14/T16/T36/T48 — "all contact forces are EM", "conservation is symmetry-rooted", "the 4 fundamental forces"). **T4 = application-SINK / terminal leaf** (richest Requires of any straggler — ~9 outgoing applies-edges to T2/T3/T6/T17/T18/T33/T34/T42; ZERO incoming — nothing depends on "the experiments"). Combined with the Session-57 DAG-root finding, the full graph structure is now mapped: **ROOTS = T2/T3/T5 (foundation, highest IN-degree) → CORE = 39 triple-covered topics → CEILING = T1 (conceptual frame) + FLOOR = T4 (application leaf).** This complete root-to-leaf bracketing is the strongest possible evidence for the knowledge-graph defense.

3. **COVERAGE TAXONOMY COMPLETE — 5 distinct mechanisms.** Stage-2 surfaced five structurally-distinct coverage outcomes: **TRIPLE** (all 3 series — the 39-topic canonical core); **NCERT-OMITTED** (NCERT skips a JEE-Advanced *extension* — T8 80%, T14 70%, T15 92%); **NCERT-DELEGATED** (NCERT hands math to the *Math syllabus* — T3 ~50%); **DCM-OMITTED** (the JEE-problem book skips *qualitative* material — T1 DUAL); **DCM-DOMINANT** (only DC Pandey gives a dedicated chapter; NCERT/HCV scatter — T4, the JEE Experimental-Skills unit). **Every non-triple topic's coverage gap is now structurally explainable, not a data quality issue.** Formalised in the Stage-4 FINAL sweep.

4. **Final triple-coverage tally: 18 topics at 100% across the 44.** The 100%-streak peaked at 8 consecutive (T18→T20→T25→T19→T22→T23→T6→T7), broke at T8 (NCERT-OMITTED), reset, T2 reached 100% again. T1 (DUAL/DCM-OMITTED) + T4 (DCM-DOMINANT) are non-triple by design — the foundation/intro stragglers were never expected to be triple-covered. **The core-physics-100% pattern is fully validated: the 39 triple-covered topics return 100% on core atomics; coverage dips ONLY at JEE-Advanced extensions (omission), delegated math, or non-core qualitative/procedural material.**

5. **Final anchor-bucket distribution after 44 pilots:**
   - **VERY-STRONG = 9** (unchanged): T48, T49, T50, T39, T26, T20, T25, T23, T8.
   - **STRONG = 27** (unchanged): T2, T6, T7, T9, T10, T11, T12, T13, T14, T15, T16, T17, T18, T19, T22, T27, T29, T30, T35, T36, T37, T38, T41, T42, T43, T44, T46.
   - **MEDIUM = 3** (T4 adds): T34, T3, T4 (NEW).
   - **WEAK = 2** (T1 adds): T31, T1 (NEW).
   - **Un-rated = 0** — **all 44 pilots bucketed.**
   - **VERY-STRONG share: 20%** (9/44). **STRONG+ share: 82%** (36/44). **The abstract-foundation-anchors-weakly pattern is complete**: the 3 MEDIUM (T34 circuits, T3 math-tools, T4 lab-skills) and 2 WEAK (T31 capacitors, T1 physical-world) topics are precisely the abstract/component/qualitative/procedural ones — phenomenology-rich topics (mechanics/waves/thermal/modern) anchor STRONG+.

6. **Cognitive-error-prevention combined Session 58: 35% (6/17)** — T1 = 38% (3/8), T4 = 33% (3/9). Sits right at the 35% elevated-gate threshold. Even the qualitative-intro (T1) and procedural-lab (T4) topics carry the foundation-topic misconception signature, though their errors are FRAMING errors (force-zoo; classical-is-wrong) and PROCESS errors (graph-is-for-marks; more-readings=more-accuracy) rather than the deep convention errors of kinematics. **Cumulative cognitive-error share across all 44 pilots ≈ 35%** — ~1 in 3 founder decisions targets a specific student misconception.

7. **Math-tools: 0 new stubs across T1 + T4. Light-maintenance final streak = 9 CONSECUTIVE SESSIONS** (S50 → S58). The entire back half of Stage-2 (Mechanics-middle, Mechanical-Properties, Thermo-closers, Waves-middle, Kinematics-formalisation, and the foundation/intro stragglers) added ZERO new mathematical machinery. **The Stage-3 math-tools file (authored at the 15-pilot mark) correctly anticipated the mathematical needs of the remaining 29 pilots.** math-tools IN-degree final value: **52** (pending Stage-4 re-homing of ~14 terminators to T2/T3/T5 DAG-root columns).

8. **FINAL cumulative tally: 44 of 44 pilots = 100% — STAGE-2 COMPLETE.** Atomics ~705 (was 699; T1 added 3 + T4 added 3 = 6). Nanos ~424 (was 410; T1 added 8 + T4 added 11 = 19). **Cross-topic edges ~512** (was 499; net new ~13). Math-tools IN-degree **52**. **0 pilots remaining.**

9. **Founder decisions: T1 = 10 (PW-G1..PW-G10), T4 = 10 (T4-G1..T4-G10).** 44-pilot decision-count: mean ~9.4 (steady throughout); mode = 12 (7-way tie unchanged); T6's 55% remains the single-topic cognitive-error maximum.

10. **Cluster-completeness: all 10 clusters CLOSED (since S56); foundation roots (T2/T3/T5) + ceiling (T1) + floor (T4) now also catalogued.** Nothing in the 44-topic scope remains.

11. **NEXT: Stage-4 FINAL consolidation sweep (this session) → Stage-5 transition.** Stage-4 FINAL sweep delivers: (a) IN/OUT-degree final refresh; (b) full anchor-bucket distribution (done above); (c) density-rule final tally + formalise the cluster-closer-below-band sub-rule (2 confirmations: T22-T23=4, T8-T9=4); (d) add T2/T3/T5 DAG-root columns + re-home ~14 math-tool terminators + recompute math-tools IN-degree; (e) formalise the 5-outcome coverage taxonomy; (f) cognitive-error index final update. **Then Stage-5: outcome mapping (PYQ frequency, JEE/NEET/board weights, state-exam weights) → V1 authoring priority queue** (per the master plan's Stage-5 spec).

### After 42 pilots (2026-05-26 — adds Topics 2, 3 [Session 57]):

1. **NCERT-INTRO STRAGGLER-PAIR T2 + T3 SHIPPED — Stage-2 at 95%.** T2 Units & Measurements + T3 Mathematical Tools authored as Session 57 paired-batch. **NOT a cluster** (all 10 clusters closed at S56) — these are the foundation-intro stragglers every prior topic silently assumed. **42 of 44 pilots = 95% complete.** Remaining: T1 Physical World + 1 final straggler (Session 58) = **Stage-2 COMPLETE**.

2. **DAG-ROOT CAPSTONE FINDING — T2 + T3 + T5 are the ROOT NODES of the physics-knowledge DAG.** Highest IN-degree (every quantitative/calculus/vector atomic depends on them), near-zero OUT-degree (they depend on nothing physics). Authored LAST (41st/42nd; T5 in-repo) precisely BECAUSE they are so foundational every prior topic ASSUMED them and cited their content as "math-tools" terminators. **T2 ABSORBS `dimensional_analysis` + `unit_analysis` (~8 references); T3 ABSORBS `calculus_derivative/integration` + `trig_small_angle` + `series_binomial` (~10 references).** The math-tool terminators do NOT dangle — they resolve into these three foundation topics. **This is the direct answer to the future IIT-professor "why a taxonomy, not a knowledge graph?" question: our atomics ARE knowledge-graph nodes, and T2/T3/T5 are demonstrably the graph roots.**

3. **NEW COVERAGE CLASS: NCERT-DELEGATED.** T3 = ~50% triple-coverage — but for a STRUCTURAL reason distinct from T8's break. **Three mechanisms now distinguished:** TRIPLE (in all 3 series); **NCERT-OMITTED** (NCERT skips a JEE-Advanced extension — T8 incline-projectile, 80%; T14 70%; T15 92%); **NCERT-DELEGATED** (NCERT hands the material to ANOTHER subject — Class 11/12 Math — and uses it operationally without re-teaching — T3 ~50%). T3 is the canonical NCERT-DELEGATED case and the cleanest evidence for WHY the Stage-3 math-tools file is a separate reference. **Stage-4 to add NCERT-DELEGATED to the formal coverage taxonomy.**

4. **T2 = 100% triple-coverage (18th 100% topic); T3 BREAKS the streak (NCERT-DELEGATED).** Streak history: T9 reset to 1 (S56) → T2 extends to 2 → T3 breaks back to 0. **Contrast pair**: T2 is core-quantitative-physics (NCERT Ch.2 is a full chapter; dimensional-analysis + error-propagation are high-frequency JEE-Main) = genuine 100%; T3 is math-machinery that NCERT delegates = ~50%. 18 total 100% topics across 42 pilots.

5. **T2 = STRONG (11 × 6, 26th foundational-physics STRONG); T3 = MEDIUM (6 × 4, 2nd MEDIUM topic).** T2 anchors well via institutions (CSIR-NPL national standards + cesium-clock IST + ISRO precision + vernier/screw-gauge labs). T3 anchors only via APPLICATION (speedometer = derivative, odometer = integral, radioactive-dating = exponential) → MEDIUM. **T3 joins T34 as the 2nd MEDIUM topic; with T31 (WEAK) this confirms the abstract-foundation-anchors-weakly pattern**: topics whose CONTENT is mathematical machinery or abstract circuit elements cannot reach the phenomenology-rich anchoring of mechanics/waves/thermal topics.

6. **Cognitive-error-prevention combined Session 57: 45% (9/20)** — T2 = 45% (5/11), T3 = 44% (4/9). Sustains the foundation-topic high band (Kinematics cluster 48.5%, T2+T3 45%). **Confirms the foundation-topic hypothesis a final time**: the FOUNDATION topics (units, math-tools, kinematics) carry the densest misconception loads precisely because they set the silent conventions and mental models everything else rests on. T2's traps (dim-analysis-gives-constants, sig-figs-vs-decimals, accuracy-vs-precision) and T3's traps (derivative-is-just-a-formula, integration/differentiation-unrelated, approximations-are-sloppy) are all CONVENTION/MENTAL-MODEL errors, not computational ones. Cumulative cognitive-error share at 42-pilot ≈ 35%.

7. **Math-tools: 0 new stubs across T2 + T3. Light-maintenance now spans 8 CONSECUTIVE SESSIONS** (S50 → S57) — **EXTENDS LONGEST zero-stub streak.** The foundation stragglers add NO new mathematical machinery; they CLAIM OWNERSHIP of machinery the math-tools file already registered. **~14 math-tool terminators flagged for re-homing to T2/T3/T5 at Stage-4** (a reclassification, not a count change). math-tools IN-degree HELD at **52**.

8. **Cumulative tally: 42 of 44 pilots = 95% complete (was 91%).** Atomics ~699 (was 681; T2 added 5 + T3 added 4 = 9). Nanos ~410 (was 385; T2 added 14 + T3 added 11 = 25). **Cross-topic edges ~499** (was 487; net new ~12 — foundation roots add few outgoing edges; ~14 terminators reclassified). Math-tools IN-degree **52** (unchanged). **2 pilots + ~1 session remaining** to close Stage-2 (target Session 58).

9. **Founder decisions: T2 = 11 (U-G1..U-G11), T3 = 10 (MT-G1..MT-G10).** 42-pilot decision-count: mean steady ~9.4; mode = 12 (7-way tie unchanged); T6's 55% remains the single-topic cognitive-error maximum.

10. **Anchor-bucket distribution after 42 pilots:**
    - **VERY-STRONG = 9** (unchanged): T48, T49, T50, T39, T26, T20, T25, T23, T8.
    - **STRONG = 27** (T2 adds): T2 (NEW), T6, T7, T9, T10, T11, T12, T13, T14, T15, T16, T17, T18, T19, T22, T27, T29, T30, T35, T36, T37, T38, T41, T42, T43, T44, T46.
    - **MEDIUM = 2** (T3 adds): T34, T3 (NEW).
    - **WEAK = 1**: T31.
    - **Un-rated = 0**.
    - **VERY-STRONG share: 21%** (9/42; down from 23% at 40-pilot — T2/T3 add a STRONG + a MEDIUM, no new VERY-STRONG; the foundation stragglers are not anchor-rich). **26th foundational-physics STRONG data point (T2).**

11. **Cluster-completeness state UNCHANGED after Session 57** — all 10 clusters remain CLOSED (closed at S56). T2/T3 are NOT cluster members; they are foundation-intro stragglers. Remaining unworked: **T1 Physical World + 1 final straggler (Session 58)** = Stage-2 COMPLETE.

12. **Session 58 recommended direction:**
    - **T1 Physical World + final straggler (RECOMMENDED) = Stage-2 COMPLETE.** T1 (NCERT Ch.1 — scope of physics, fundamental forces, conservation principles) is largely NON-QUANTITATIVE — likely the LIGHTEST pilot (few atomics, mostly conceptual/qualitative; weak simulatability; LOW anchor). Expect it to be a fast closer. Pair with the final straggler to reach 44/44.
    - **At Stage-2 completion (Session 58): trigger the 44-pilot Stage-4 FINAL consolidation sweep** — (a) IN/OUT-degree final refresh (last full refresh at 27-pilot — badly stale); (b) full anchor-bucket distribution (9 VERY-STRONG / 27+ STRONG / 2-3 MEDIUM / 1 WEAK); (c) density-rule final tally — **formalise the cluster-closer-below-band sub-rule** (2 confirmations: T22-T23=4, T8-T9=4); (d) **add T2/T3/T5 as DAG-root target columns + re-home the ~14 math-tool terminators + recompute math-tools IN-degree**; (e) **add NCERT-DELEGATED to the coverage taxonomy**; (f) cognitive-error index final update. Then Stage-2 → Stage-5 (outcome mapping / V1 priority queue) transition.

13. **Stage-2 at 95%; closure within 1 session.** All 10 clusters closed; both DAG-root foundation stragglers (T2/T3) shipped. Remaining: T1 + 1 final straggler. **Target Session 58 for Stage-2 COMPLETE.**

### After 40 pilots (2026-05-26 — Topics 12, 21, 36, 10, 13, 17, 30, 16, 31, 29, 34, 41, 42, 43, 44, 45, 47, 46, 48, 49, 50, 35, 38, 37, 39, 26, 27, 11, 14, 15, 18, 20, 25, 19, 22, 23, 6, 7, 8, 9):

1. **KINEMATICS-FORMALISATION CLUSTER CLOSED — ALL 10 CLUSTERS COMPLETE.** T8 Projectile Motion + T9 Motion-in-Plane shipped as Session 56 paired-batch, closing the cluster 4/4 (with T5/T6/T7). **All 10 clusters (9 major + Kinematics-formalisation) now CLOSED at 40-pilot/91% checkpoint.** No cluster work remains — final 4 pilots are NCERT-intro stragglers (T1-T4) + minor extensions only.

2. **9 anticipated forward-edges closed in Session 56** (T8 = 4: T7-intra + T10-weak + T13 + T14 + T16-weak; T9 = 5: T10-KEY + T15 + T16 + T17 + T36). **T9 closes the KEY 17-session-lag T10 dependency** — T10's entire centripetal-FORCE discussion (Session 39) assumed circular-kinematics; T9 finally supplies the kinematic foundation (a_c = v²/r before any force). Combined Sessions 50-56: **68+ back-edges closed in 7 sessions** — extends densest-window streak. **Matrix integrity validation #12 in 12 consecutive sessions.**

3. **T8 = 9th VERY-STRONG topic — first Kinematics-cluster VERY-STRONG.** 13 anchors × 8 strands (sports + defence + space + public-service + consumer + entertainment + education/research + meteorology). **Projectile motion's unique edge**: the ONLY kinematics topic with strong DEFENCE anchoring (DRDO Agni/Prithvi ballistics + Army artillery range-tables) AND strong SPORTS anchoring (cricket six + Neeraj Chopra javelin + IPL) — dual-strand richness pushes it past the STRONG plateau where T6/T7/T9 sit. **VERY-STRONG share rises to 9/40 = 23%.**

4. **100% STREAK BROKEN at 8 by T8 (80%); T9 resets at 100%.** T8 = 80% (4/5 — projectile-on-incline is HCV+DCM-only JEE-Advanced extension, NCERT-omitted). Pattern consistent with T14 (70%) + T15 (92%): foundational chapters return 100% on core atomics; JEE-Advanced extension atomics dip coverage because NCERT omits them. **Core-physics-100% pattern holds** — only advanced-extension atomics break it. T9 = 100% (17th 100% topic); new 1-topic streak begins. 17 total 100% topics across 40 pilots.

5. **Kinematics-formalisation cluster cognitive-error mean = 48.5% — DENSEST-misconception cluster in Stage-2.** All 4 pilots exceed 44%: T6 = 55%, T7 = 50%, T8 = 45%, T9 = 44%. Beats Mechanics (43%), Mechanical-Properties (43%), Waves (41%), Thermodynamics (40%). **Foundation-chapter hypothesis FULLY VALIDATED across the complete cluster**: the conventions baked into kinematics (sign, vector, frame, instantaneous-vs-average, speed-vs-velocity, kinematic-vs-dynamic) are the deepest sources of downstream physics misconceptions. Cumulative cognitive-error share at 40-pilot ≈ 35%.

6. **Cluster-closer-below-band sub-pattern CONFIRMED 2nd time.** T8 ↔ T9 = 4 intra-cluster bidirectional edges (below the 6-9 chapter-adjacent band) — matching Session-54's T22-T23 = 4. Both are cluster-closer pairs where the cluster-opener pair carried the bridging weight (T6-T7 = 8; T19-T22 = 6). **10th density-rule data point; 2nd cluster-closer-below-band confirmation.** Promote from "flag" to **established sub-rule** at next Stage-4 sweep: *cluster-closer pairs sit below the 6-9 band; cluster-opener pairs sit in-band.*

7. **Math-tools: 0 new stubs across T8 + T9. Light-maintenance now spans 7 CONSECUTIVE SESSIONS** (S50 → S56). **EXTENDS LONGEST zero-stub streak.** **All 4 Kinematics-cluster pilots (T6/T7/T8/T9) added ZERO new stubs** — the Stage-3 file (authored ~7 sessions ago) fully anticipated the entire cluster's mathematical needs (calculus, algebra-quadratic/simultaneous, vector-resolution, trig, pythagoras, radian-measure). **Strongest validation yet of the anticipated-stub strategy.** Math-tools IN-degree unchanged: **52**.

8. **Cumulative tally: 40 of 44 pilots = 91% complete (was 86%).** Atomics ~681 (was 672; T8 added 5 + T9 added 4 = 9). Nanos ~385 (was 362; T8 added 12 + T9 added 11 = 23). **Cross-topic edges ~487** (was 452; T8+T9 added 35). Math-tools IN-degree **52** (unchanged). **4 pilots + ~2 sessions remaining** to close Stage-2 (target Session 57-58 holds).

9. **Founder decisions: T8 = 11 (PR-G1..PR-G11), T9 = 9 (MP-G1..MP-G9... +MP-G10 = 10 wait recount: MP-G1..MP-G10 = 10).** 40-pilot decision-count: mean = 9.4 (steady); mode = 12 (7-way tie unchanged); T6's 55% remains the single-topic cognitive-error maximum.

10. **Anchor-bucket distribution after 40 pilots:**
    - **VERY-STRONG = 9**: T48, T49, T50, T39, T26, T20, T25, T23, T8 (NEW).
    - **STRONG = 26** (T9 adds; T8 → VERY-STRONG): T6, T7, T9 (NEW), T10, T11, T12, T13, T14, T15, T16, T17, T18, T19, T22, T27, T29, T30, T35, T36, T37, T38, T41, T42, T43, T44, T46.
    - **MEDIUM = 1**: T34.
    - **WEAK = 1**: T31.
    - **Un-rated = 0**.
    - **VERY-STRONG share: 23%** (9/40; up from 21% at 38-pilot — T8's dual defence+sports anchoring restores the rising trend). **25th foundational-physics STRONG data point (T9).**

11. **Cluster-completeness state after Session 56:**
    - Optics ✓ (T41-T44) — 4 topics
    - Modern Physics core ✓ (T45-T48) — 4 topics
    - Modern Physics applied ✓ (T49-T50) — 2 topics
    - E&M ✓ (T29-T39) — 5-6 topics
    - Mechanics ✓ (T10-T17) — 10 topics
    - Mechanical Properties ✓ (T18 + T20) — 2 topics
    - Thermodynamics ✓ (T26 + T27 + T25) — 3 topics
    - Waves middle ✓ (T19 + T22 + T23) — 3 topics
    - **Kinematics-formalisation ✓ (T5 + T6 + T7 + T8 + T9) — CLOSED 4/4 (Session 56)** (NEW)

    **ALL 10 CLUSTERS CLOSED.** Remaining unworked: ~4 NCERT-intro stragglers (T1 Physical World, T2 Units & Measurements, T3 Mathematical Tools, T4 minor) + any minor extensions.

12. **Session 57 recommended direction:**
    - **Option A (RECOMMENDED): T2 Units & Measurements + T3 Mathematical Tools** — the two highest-value remaining stragglers. T2 (dimensional analysis, significant figures, error propagation) is genuinely curricular (NCERT Ch.2, JEE-relevant); T3 (vectors recap + calculus-for-physics) is the foundation the Stage-3 math-tools file already formalised. Likely STRONG anchor (metrology + CSIR-NPL standards + ISRO precision).
    - **Option B: T1 Physical World + T2 Units** — opens with the lightest NCERT-intro chapter (T1 is largely non-quantitative).
    - **Recommendation: Option A (T2 + T3).** Highest curricular value of the remaining stragglers; sets up Session 58 for T1 + T4 (final light closers) = Stage-2 COMPLETE. **Target Session 57-58 for Stage-2 completion holds — now within 1-2 sessions.**

13. **Stage-2 at 91%; closure imminent.** Remaining 4 pilots / ~2-per-session = ~2 sessions to Stage-2 closure. **Target Session 57-58 holds.** All 10 clusters closed; remaining work is NCERT-intro stragglers only. At Stage-2 completion: trigger the 44-pilot Stage-4 final consolidation sweep (IN/OUT-degree final refresh + full anchor-bucket distribution + density-rule final tally including the cluster-closer sub-rule).

### After 38 pilots (2026-05-26 — Topics 12, 21, 36, 10, 13, 17, 30, 16, 31, 29, 34, 41, 42, 43, 44, 45, 47, 46, 48, 49, 50, 35, 38, 37, 39, 26, 27, 11, 14, 15, 18, 20, 25, 19, 22, 23, 6, 7):

1. **KINEMATICS-FORMALISATION CLUSTER OPENED (10th and FINAL cluster).** T6 1D Kinematics + T7 2D Kinematics/Relative-Motion shipped as Session 55 paired-batch. **10th cluster opened** (T5 Vectors already in repo). T8 Projectile + T9 Motion-in-Plane remain for cluster closure (Session 56 recommended). **All 10 clusters (9 major + Kinematics-formalisation) now opened/closed at 38-pilot/86% checkpoint.** No cluster remains untouched.

2. **NEW SINGLE-SESSION FORWARD-EDGE CLOSURE HIGH: 10 closures.** T6 alone closes 8 anticipated forwards (T11/T12/T13/T14/T15/T17/T19/T21) — **single-largest back-edge-closure topic in matrix history**; T7 closes 2 (T10 + T11-second). **Foundation chapters close the most back-edges** — every Mechanics + Wave catalog assumed T6/T7 kinematics defined. Combined Sessions 50-55: **59+ back-edges closed in 6 sessions** — extends densest-window streak.

3. **NEW LONGEST-LAG closure: 22 sessions.** T21 Wave Motion (Session 33) → T6 (Session 55): `wave_velocity ← T6 velocity-definition`. Beats prior 20-session record (T21 CT5/CT6 → T19/T22, Session 53). **Matrix integrity validation #11 in 11 consecutive sessions** — auto-aggregation robust across the full 22-session span (the longest gap the matrix has ever bridged).

4. **NEW LONGEST 100% STREAK: 8 consecutive topics** (T18 → T20 → T25 → T19 → T22 → T23 → T6 → T7). Beats prior 6-consecutive record set Session 54. Combined 38-pilot 100%-coverage count: **16 topics**. Foundation-kinematics chapters fully triple-covered (NCERT Ch.3 + Ch.4 are canonical-spine; HCV + DCM full).

5. **NEW SESSION-HIGH cognitive-error-prevention share: 52% (11/21).** T6 = 55% (6/11 — NEW single-topic high, passes T20 Fluid Mechanics 50%); T7 = 50% (5/10). **Kinematics-formalisation cluster confirmed DENSEST-misconception cluster set so far** (T6+T7 mean 52.5% > Mechanics 43% > Mechanical-Properties 43% > Waves 41% > Thermodynamics 40%). **Foundation-chapter hypothesis VALIDATED**: chapters that bake in conventions (sign, vector, frame, instantaneous-vs-average) carry highest cognitive-error density because they shape ALL downstream student thinking. Cumulative cognitive-error share at 38-pilot ≈ 34%.

6. **Intra-cluster chapter-adjacent density rule: 9th data point.** T6 ↔ T7 = 8 bidirectional edges (NCERT Ch.3 → Ch.4 adjacent split) — sits in upper-middle of 6-9 band. Matches T11↔T14 (8) + T37↔T39 (8). **9 data points now firmly establish the rule across all cluster types.** No sub-pattern (unlike Session 54's T22-T23 = 4 below-band closer) — because T6 is the cluster-opener (foundation), not a closer; opener pairs sit in-band.

7. **Math-tools: 0 new stubs across T6 + T7. Light-maintenance now spans 6 CONSECUTIVE SESSIONS** (S50 → S51 → S52 → S53 → S54 → S55). **EXTENDS LONGEST zero-stub streak** (prior 5-session record). Math-tools IN-degree unchanged: **52**. All kinematics primitives (calculus-derivative/integration, algebra-quadratic/simultaneous, vector-add/resolution, trig-arctan/sin-cos, pythagoras) were pre-registered and REQUIRED — **the Stage-3 file fully anticipated the Kinematics cluster** despite it being authored 6 sessions before these pilots shipped. Strong validation of the anticipated-stub strategy.

8. **Cumulative tally: 38 of 44 pilots = 86% complete (was 82%).** Atomics ~672 (was 659; T6 added 8 + T7 added 5 = 13). Nanos ~362 (was 334; T6 added 14 + T7 added 14 = 28). **Cross-topic edges ~452** (was 414; T6+T7 added 38). Math-tools IN-degree **52** (unchanged). **6 pilots + ~3 sessions remaining** to close Stage-2 (target Session 57-58 holds).

9. **Founder decisions: T6 = 11 (K1-G1..K1-G11), T7 = 10 (K2-G1..K2-G10).** 38-pilot decision-count: mean = 9.5 (steady); mode = 12 (7-way tie unchanged); T6's 55% cognitive-error share is the new single-topic maximum.

10. **Anchor-bucket distribution after 38 pilots:**
    - **VERY-STRONG = 8**: T48, T49, T50, T39, T26, T20, T25, T23 (unchanged — kinematics topics are STRONG, not VERY-STRONG).
    - **STRONG = 24** (T6, T7 add): T6 (NEW), T7 (NEW), T10, T11, T12, T13, T14, T15, T16, T17, T18, T19, T22, T27, T29, T30, T35, T36, T37, T38, T41, T42, T43, T44, T46.
    - **MEDIUM = 1**: T34.
    - **WEAK = 1**: T31.
    - **Un-rated = 0**.
    - **VERY-STRONG share: 21%** (8/38; slight dilution from 2 STRONG kinematics pilots — expected for abstract foundation chapters). **23rd + 24th foundational-physics STRONG data points** — STRONG remains the dominant bucket for mathematical-foundation chapters.

11. **Cluster-completeness state after Session 55:**
    - Optics ✓ (T41-T44) — 4 topics
    - Modern Physics core ✓ (T45-T48) — 4 topics
    - Modern Physics applied ✓ (T49-T50) — 2 topics
    - E&M ✓ (T29-T39) — 5-6 topics
    - Mechanics ✓ (T10-T17) — 10 topics
    - Mechanical Properties ✓ (T18 + T20) — 2 topics
    - Thermodynamics ✓ (T26 + T27 + T25) — 3 topics
    - Waves middle ✓ (T19 + T22 + T23) — 3 topics
    - **Kinematics-formalisation (T5 + T6 + T7 + T8 + T9) — OPENED 2/4 (T6 + T7 done; T8 + T9 remain; T5 in repo)** (NEW)

    **10 of 10 clusters now in opened/closed state.** Remaining unworked: T8 Projectile + T9 Motion-in-Plane (Kinematics closers) + ~4 stragglers (T1-T4 NCERT-intro chapters + minor extensions).

12. **Session 56 recommended direction:**
    - **Option A (RECOMMENDED): T8 Projectile Motion + T9 Motion-in-Plane** — closes Kinematics-formalisation cluster (4/4 with T5/T6/T7). T8 inherits T6 free-fall + T7 vector-kinematics directly (both intra-session forward-edges already laid). Likely STRONG anchor (cricket-ball-trajectory + IPL six + ISRO ballistic + artillery — first defence-strand-rich kinematics topic; T8 might break to VERY-STRONG). Cognitive-error expected high (projectile misconceptions are classic).
    - **Option B: T8 + Stage-4 mini-sweep** — closes Kinematics + IN/OUT-degree refresh at 40-pilot.
    - **Recommendation: Option A (T8 + T9).** Closes the 10th cluster; sets up Sessions 57-58 for the final stragglers (T1-T4 NCERT-intro + minor extensions) — pure Stage-2 closure.

13. **Stage-2 at 86%; closure on schedule.** Remaining 6 pilots / ~2-per-session = ~3 sessions to Stage-2 closure. **Target Session 57-58 for Stage-2 completion holds.** All 10 clusters opened; remaining work = single-topic closures + NCERT-intro stragglers only.

### After 36 pilots (2026-05-25 — Topics 12, 21, 36, 10, 13, 17, 30, 16, 31, 29, 34, 41, 42, 43, 44, 45, 47, 46, 48, 49, 50, 35, 38, 37, 39, 26, 27, 11, 14, 15, 18, 20, 25, 19, 22, 23):

1. **WAVES MIDDLE CLUSTER CLOSED (9th major cluster, 3/3).** T23 Sound Waves shipped Session 54, closing the 3-topic cluster (T19 + T22 + T23). **All 9 major clusters now CLOSED/NEAR-CLOSED at 36-pilot/82% checkpoint.** No major cluster remains in "opener" or "in-progress" state — remaining 8 pilots = single-topic closures + Kinematics-formalisation + stragglers.

2. **NEW LONGEST 100% STREAK: 6 consecutive topics** (T18 → T20 → T25 → T19 → T22 → T23). Beats prior 5-consecutive record set Session 53. Combined 36-pilot 100%-coverage count: **14 topics**. Pattern signal reinforced again — NCERT-canonical foundational + applied physics returns 100% triple-coverage consistently across 6 sessions running.

3. **8th VERY-STRONG topic — first Waves-cluster VERY-STRONG.** T23 Sound Waves = 14 anchors × 9 strands (consumer-culture + healthcare + telecom + defence + transport + research + industry + meteorology + space) — Indian classical bansuri/shehnai + AIIMS ultrasound + DRDO SONAR + HAL Tejas sonic boom + IMD Doppler weather radar + ISRO Sriharikota acoustic monitoring. **First Waves-cluster topic to break STRONG plateau.** VERY-STRONG share at 36 pilots: **22%** (was 20%).

4. **Intra-cluster chapter-adjacent density rule: 8th data point with SUB-PATTERN observed.** T22 ↔ T23 = 4 intra-cluster bidirectional edges — **BELOW the 6-9 band** (8th observation). **Sub-pattern**: when middle-topic carries the bridging weight (T22 here, as foundational superposition machinery), the cluster-closer pair (T22-T23) has fewer direct edges than the cluster-opener pair (T19-T22 = 6 edges). The full 3-topic Waves middle cluster carries **15 intra-cluster bidirectional edges total** (T19↔T22 = 6, T22↔T23 = 4, T19↔T23 = 5). **Flag for Stage-4 cumulative observation**: predict cluster-closer pairs may sit at lower edge density than cluster-opener pairs in same NCERT-chapter-split.

5. **4 anticipated forward-edges closed in Session 54** (T26 + T27 + T18 + indirect-T17). Combined Sessions 50+51+52+53+54: **49+ back-edges closed in 5 sessions** — extends densest-window streak. Includes 5-session-lag closure (T27 → T23 from Session 49) and 4-session-lag closure (T18 → T23 from Session 50). T26 → T23 closes the Laplace correction historical-arc that has been one of the more conceptually-rich anticipated bridges since Session 49.

6. **Math-tools file: 0 new stubs in T23. Light-maintenance now spans 5 CONSECUTIVE SESSIONS** (S50 → S51 → S52 → S53 → S54; net 1 new stub across 3 sessions). **NEW LONGEST zero-stub-dominant streak** (prior record 4 sessions). **`time_averaging_cos_squared` validated for 5th time** (T44 → T38 → T39 → T22 → T23) — **now SOLE most-validated Stage-3 primitive** (passes `calculus_exponential_decay`'s 5; previously tied). Math-tools IN-degree unchanged: **52**. Stage-3 file empirically stable across Mechanics + Mechanical Properties + Thermodynamics + Waves clusters.

7. **Cognitive-error-prevention combined Session 54: 5/12 = 42% (single-topic T23).** Sustains 35-50% range over **9 consecutive sessions** (S46-S54). **Waves cluster cognitive-error density confirmed across all 3 catalogs**: T19 = 36%, T22 = 45%, T23 = 42% → **cluster mean 41%** — joins Mechanics + Mechanical-Properties + Thermodynamics as densest-misconception cluster set. Cumulative cognitive-error-prevention founder-decision share at 36-pilot ≈ 33% — modal authoring sub-category.

8. **Cumulative tally: 36 of 44 pilots = 82% complete (was 80%).** Atomics ~659 (was 653; T23 added 6). Nanos ~334 (was 316; T23 added 18). **Cross-topic edges ~414** (was 394; T23 added 20). Math-tools IN-degree **52** (unchanged). **8 pilots + ~4 sessions remaining** to close Stage-2 (target Session 57-58 holds).

9. **Founder decisions: T23 = 12 (SO-G1..G12).** Ties 6-way record (was 6-way; now **7-way tie at 12 max**: T26, T11, T14, T15, T20, T25, T23). Mean = 9.5 (steady rise from 9.4); mode = 12 (7 topics).

10. **Anchor-bucket distribution after 36 pilots (post-Stage-4 cleanup re-rating):**
    - **VERY-STRONG = 8**: T48, T49, T50, T39, T26, T20, T25, T23 (NEW).
    - **STRONG = 22**: T10, T11, T12, T13, T14, T15, T16, T17, T18, T19, T22, T27, T29, T30, T35, T36, T37, T38, T41, T42, T43, T44, T46.
    - **MEDIUM = 1**: T34.
    - **WEAK = 1**: T31.
    - **Un-rated = 0** (Stage-4 Sweep #2 closed Session 54 — all shipped pilots bucketed).
    - **VERY-STRONG share: 22%** (was 20% at 35-pilot).

11. **Cluster-completeness state after Session 54:**
    - Optics ✓ (T41-T44) — 4 topics
    - Modern Physics core ✓ (T45-T48) — 4 topics
    - Modern Physics applied ✓ (T49-T50) — 2 topics
    - E&M ✓ (T29-T39) — 5-6 topics
    - Mechanics ✓ (T10-T17) — 10 topics
    - Mechanical Properties ✓ (T18 + T20) — 2 topics
    - Thermodynamics ✓ (T26 + T27 + T25) — 3 topics
    - **Waves middle ✓ (T19 + T22 + T23) — CLOSED 3/3 (Session 54)** (NEW)

    **9 of 9 major clusters CLOSED.** Remaining unworked: T6/T7/T9 Kinematics formalisation (T5 in repo) + ~5 stragglers (T1-T4 NCERT-intro chapters + minor extensions).

12. **Stage-4 Sweep #2 delivered (Session 54).** Cognitive-error-prevention cross-pilot index file authored (`cognitive-error-prevention-index.md`); anchor-bucket re-rating of all un-bucketed topics complete (9 → STRONG bucket); T32/T33 numbering reconciliation closed (T32 = DC network laws, T33 = Electrical instruments, both promote-from-T34/T36 at V1 authoring time). **All 7 of 7 Stage-4 backlog items (Sweep #1 + Sweep #2) now CLOSED.** Harness enters closing 8-pilot phase with zero Stage-4 debt.

13. **Session 55 recommended direction:**
    - **Option A (RECOMMENDED): T6 1D Kinematics + T7 2D Kinematics/Relative Motion** — opens Kinematics-formalisation cluster (T5 already in repo); both are dense-foundational and likely to close many remaining anticipated back-edges from Mechanics catalogs.
    - **Option B: T6 + T8 Projectile Motion** — Kinematics-formalisation 3-topic-cluster opener.
    - **Option C: T6 + T9 stragglers (Motion in Plane / Vectors-2D)** — broad coverage, light density.
    - **Recommendation: Option A.** Closes maximum back-edges; sets up Session 56 for T8 + T9 paired-batch (3-topic cluster closer); leaves Sessions 57-58 for final stragglers (T1-T4 NCERT-intro + minor extensions).

14. **Stage-2 at 82%; closure on schedule.** Remaining 8 pilots / ~2-per-session = ~4 sessions to Stage-2 closure. **Target Session 57-58 for Stage-2 completion holds.** Cluster-coverage AHEAD OF SCHEDULE (9 of 9 closed at 82%); remaining work is single-topic + cluster-internal stragglers only.

### After 35 pilots (2026-05-25 — Topics 12, 21, 36, 10, 13, 17, 30, 16, 31, 29, 34, 41, 42, 43, 44, 45, 47, 46, 48, 49, 50, 35, 38, 37, 39, 26, 27, 11, 14, 15, 18, 20, 25, 19, 22):

1. **WAVES MIDDLE CLUSTER OPENED.** T19 Wave Equation + T22 Superposition & Standing Waves shipped as Session 53 paired-batch. **9th cluster opened** — final major untouched cluster. T23 Sound Waves remains for cluster closure (Session 54 recommended). **All 9 major clusters now opened/closed at 35-pilot checkpoint.**

2. **STREAK EXTENDS to 5 consecutive 100% triple-coverage topics (T18 → T20 → T25 → T19 → T22).** Combined 35-pilot 100%-coverage count: **13 topics**. **Longest 100%-coverage streak ever observed in Stage-2.** Pattern signal further reinforced: foundational + applied physics at NCERT-canonical depth returns to 100%.

3. **NEW LONGEST-LAG forward-edge closure: ~20 sessions.** T21 CT5 partial-derivative + CT6 wave_reflection_standing_waves forward-edges (Session 33 origin) closed at T19 + T22 in Session 53. **Beats prior record of 18-19 sessions (T21 CT2/CT3 → T18/T20).** Matrix integrity validation #9 in 9 consecutive sessions — auto-aggregation matrix robust across the full 20-session span.

4. **5 anticipated forward-edges closed in Session 53.** Combined Sessions 50+51+52+53: **45+ back-edges closed in 4 sessions** — densest 4-session window observed. T17 Session-38-era forwards (sinusoidal-solution + SHM-at-fixed-point) and T21 Session-33-era forwards closed.

5. **Cross-cluster bidirectional bridge confirmed: T22 ↔ T44 wave-interference.** T22 `wave_interference_quantitative_atomic` already validated in T44 YDSE (Session 41). Same mechanism, different domain (mechanical wave vs optical wave) — bidirectional bridge cleanly closes.

6. **Intra-cluster chapter-adjacent paired-batch density rule validated at 7 data points.** T19 ↔ T22 = 6 bidirectional edges. **Same-NCERT-chapter split** (Ch.14 §14.1-14.4 + §14.5-14.10) → 6 edges sits in 6-9 band. Prior data points: T41↔T42 (Ch.9 split, 7), T26↔T27 (Ch.12+13 adjacent, 7), T45↔T47 (Ch.12 split, 9), T11↔T14 (Ch.5+7 moderate-adjacent, 8), T37↔T39 (chapter-distant same-cluster, 8), T35↔T38 (cross-chapter same-cluster, 6). **7 data points — density rule firmly established.**

7. **Cognitive-error-prevention combined Session 53: 9/22 = 41%.** T19 = 36% (4/11); T22 = 45% (5/11). Sustained 35-50% range over 8 consecutive sessions. **Waves cluster joins Mechanics + Mechanical Properties + Thermodynamics as densest-misconception cluster set.** Cumulative cognitive-error-prevention founder-decision share at 35-pilot ≈ 32% — well-established sub-category.

8. **Math-tools file: 0 new stubs in Session 53.** **Light-maintenance now spans 4 consecutive sessions** (T20 0 + T25 1 + T19 0 + T22 0 = 1 new stub net across 2 sessions). Math-tools IN-degree unchanged: **52**. **`time_averaging_cos_squared` validated for 4th time** (T44 → T38 → T39 → T22) — now tied with `calculus_exponential_decay` (5 validations) as most-validated Stage-3 primitive in the file. Stage-3 file is empirically stable across Mechanics + Mechanical Properties + Thermal Properties + Waves cluster span.

9. **Cumulative tally: 35 of 44 pilots = 80% complete (was 75%).** Atomics ~653 (was 637; T19 added 8 + T22 added 8 = 16). Nanos ~316 (was 288; T19 added 14 + T22 added 14 = 28). **Cross-topic edges ~394** (was 368; T19+T22 added 26). Math-tools IN-degree **52** (unchanged). **9 pilots + ~4-5 sessions remaining** to close Stage-2 (target Session 57-58 holds).

10. **Founder decisions: T19 = 11 (WE-G1..G11), T22 = 11 (SW-G1..G11).** Both slightly below the 6-way-tie record of 12; 35-pilot decision-count distribution: mean = 9.4 (steady), mode = 12 (6 topics at max), max = 12. **T22's 45% cognitive-error share is highest single-topic in last 4 sessions.**

11. **Anchor-bucket distribution after 35 pilots:**
    - **VERY-STRONG = 7**: T48, T49, T50, T39, T26, T20, T25 (unchanged).
    - **STRONG = 15-16** (T19, T22 add): T10, T11, T14, T15, T16, T17, T18, T19 (NEW), T22 (NEW), T27, T30, T35, T37, T38, T41, T42, T43, T44.
    - **MEDIUM = 1**: T34.
    - **WEAK = 1**: T31.
    - **Un-rated = 6** (cleanup pending — Stage-4 anchor-bucket re-rating sweep recommended).
    - **VERY-STRONG share at 35-pilot: 20%** (slight decrease from 21% at 33-pilot due to STRONG-cluster Waves topics; expected for mathematical-foundation chapters).

12. **Cluster-completeness state after Session 53:**
    - Optics ✓ (T41-T44) — 4 topics
    - Modern Physics core ✓ (T45-T48) — 4 topics
    - Modern Physics applied ✓ (T49-T50) — 2 topics
    - E&M ✓ (T29-T39) — 5-6 topics
    - Mechanics ✓ (T10-T17) — 10 topics
    - Mechanical Properties ✓ (T18 + T20) — 2 topics
    - Thermodynamics ✓ (T26 + T27 + T25) — 3 topics
    - **Waves middle (T19 + T22 + T23) — OPENED 2/3 (T23 remains)** (NEW)
    
    **9 of 9 major clusters now opened/closed.** Remaining unworked: T23 Sound Waves (cluster closer) + T6/T7/T9 Kinematics formalisation (T5 in repo) + ~5 stragglers (T1-T4 NCERT-intro chapters + minor extensions).

13. **Session 54 recommended direction:**
    - **Option A (STRONGLY RECOMMENDED): T23 Sound Waves** — closes Waves cluster (3/3); paired with EITHER cleanup half-session OR a small Mechanics-formalisation pilot. T23 is the natural cluster-closer; absorbs T22 anticipated forward-edges (pipe-acoustic resonance + Doppler-beats); STRONG-VERY-STRONG anchor expected (Indian classical music + AIIMS ultrasound + ISRO + AIR broadcasting + INSAT FM + healthcare).
    - **Option B: T23 + T6 Kinematics 1D** — closes Waves cluster + opens Kinematics-formalisation cluster.
    - **Option C: T23 + Stage-4 cleanup sweep** — anchor-bucket re-rating (6 un-bucketed) + T32/T33 numbering reconciliation + cognitive-error-prevention index file.
    - **Recommendation: Option C (T23 + Stage-4 cleanup).** Closes the 9th major cluster; clears Stage-4 backlog; sets up Session 55+ for pure Kinematics-formalisation + remaining stragglers.

14. **Stage-2 majority-bracket at 80%; closure on schedule.** At ~2-pilot-per-session cadence: 9 pilots / 2 = ~4-5 sessions to Stage-2 closure. **Target Session 57-58 for Stage-2 completion holds.** **All 9 major clusters now in catalogued state at 80% checkpoint** — ahead of schedule on cluster-coverage; remaining work is single-topic closures + cluster-internal stragglers, not cluster-opening.

### After 33 pilots (2026-05-25 — Topics 12, 21, 36, 10, 13, 17, 30, 16, 31, 29, 34, 41, 42, 43, 44, 45, 47, 46, 48, 49, 50, 35, 38, 37, 39, 26, 27, 11, 14, 15, 18, 20, 25):

1. **DOUBLE CLUSTER CLOSURE in single session.** T20 Fluid Mechanics closes Mechanical Properties cluster (2/2 with T18); T25 Thermal Properties closes Thermodynamics cluster (3/3 with T26 + T27). **7th + 8th cluster closures** — first-observed simultaneous double-closure session. Cluster-closure tempo: 8 of 8 major clusters closed/near-closed at 33 pilots = **1 cluster per 4.1 pilots** (improving from 5.2 at 31-pilot). Remaining: Waves middle (T19/T22/T23) + Kinematics-formalisation (T6/T7/T9) + ~6 stragglers. **No major cluster left untouched.**

2. **TWO VERY-STRONG topics in SAME SESSION** — first observation. T20 = VERY-STRONG (13 anchors × 8 strands — first foundational-mechanics-cluster topic to break STRONG plateau); T25 = VERY-STRONG (14 × 9 — Thermodynamics-cluster reinforcement). **6th + 7th VERY-STRONG observations.** Total VERY-STRONG count at 33 pilots = **7** (T48, T49, T50, T39, T26, T20, T25). **VERY-STRONG share: 7/33 = 21%** of catalogued topics. **Densest single-session anchor profile ever observed.**

3. **STREAK EXTENDS to 3 consecutive 100% triple-coverage topics: T18 → T20 → T25.** Combined 33-pilot 100%-coverage count: **11 topics** (T48 + T35 + T38 + T37 + T39 + T26 + T27 + T11 + T18 + T20 + T25). Only T14 (70%) and T15 (92%) broke streak in recent runs. **Pattern signal reinforced**: foundational + applied physics at NCERT-canonical depth returns to 100%; only JEE-Advanced extensions trigger NCERT-omission.

4. **18-19-SESSION-LAG forward-edge density-half CLOSED.** T21 CT2 ρ-half (density component of fluid wave-speed c = √(K/ρ)) closes at T20 — joining the K-half closed by T18 in Session 51. **Combined T18 + T20 fully close the 17-19-session-lag T21 CT2 forward-edges (longest-lagged density-half in matrix history).** Matrix integrity validation #8 in 8 consecutive sessions.

5. **6 anticipated forward-edges closed in Session 52** — mid-density paired-batch (after Session 51's 11 and Session 50's 23+). Combined Sessions 50+51+52: **40+ back-edges closed in 3 sessions** — densest 3-session window ever observed.

6. **Cross-cluster paired-batch density rule VALIDATED at 9 data points.** T20 ↔ T25 = 4 bidirectional edges (matching T15 ↔ T18 Session 51 = 4 edges). **2nd consecutive cross-cluster paired-batch hitting exactly 4 edges.** Stage-4 density rule (cross-cluster 2-4 band; intra-cluster chapter-adjacent 6-9 band) now firmly established across **9 observations**. Density-rule predictive accuracy verified.

7. **Cognitive-error-prevention combined Session 52: 11/24 = 46% — NEW SESSION-HIGH** (tied with Session 50). T20 = 50% (6/12) — ties T11 for single-topic high; T25 = 42% (5/12). **Mechanics + Mechanical-Properties + Thermal-Properties + Thermodynamics cluster set is the densest-misconception domain in Stage-2** — sustained 35-50% range across 7 consecutive sessions.

8. **Math-tools file: 1 NEW STUB (`power_function_T_fourth`).** Light-maintenance mode continues. Math-tools IN-degree 51 → **52**. **`calculus_exponential_decay` validated for 5th time** (T34 → T44 → T48 → T35 → T25) — most-validated Stage-3 primitive in the file. Stage-3 file is empirically stable; only domain-novelty topics trigger new stubs (Thermo/KT in S49 added 6 stubs; T25 thermal added 1).

9. **Cumulative tally: 33 of 44 pilots = 75% complete (was 70%).** Atomics ~637 (was 617; T20+T25 added ~20). Nanos ~288 (was 254; T20+T25 added ~34). **Cross-topic edges ~368** (was 342; T20+T25 added 26). Math-tools IN-degree **52** (was 51). **11 pilots + ~5-6 sessions remaining** to close Stage-2 (target ~Session 57-58 holds).

10. **Founder decisions: T20 = 12 (FM-G1..G12), T25 = 12 (TP-G1..G12).** Both tie record (12 decisions). **33-pilot decision-count distribution: mean = 9.4 (rising), mode = 12 (6-way tie at max: T26, T11, T14, T15, T20, T25), max = 12.** Mode at 12 now dominant — decision count empirically tracks topic-complexity.

11. **Anchor-bucket distribution after 33 pilots:**
    - **VERY-STRONG = 7**: T48, T49, T50, T39, T26, T20, T25.
    - **STRONG = 13-14**: T10, T11, T14, T15, T16, T17, T18, T27, T30, T35, T37, T38, T41, T42, T43, T44 (re-rating pending for ~3-4 entries).
    - **MEDIUM = 1**: T34.
    - **WEAK = 1**: T31.
    - **Un-rated = 6** (cleanup pending — Stage-4 anchor-bucket re-rating sweep recommended).
    - **VERY-STRONG share growth: 14% (S49) → 17% (S50) → 19% (S51) → 21% (S52).** Steady linear growth; if pattern holds, end-of-Stage-2 share ~28-30%.

12. **Cluster-completeness state after Session 52:**
    - Optics ✓ (T41-T44, Session 41) — 4 topics
    - Modern Physics core ✓ (T45-T48, Session 44) — 4 topics
    - Modern Physics applied ✓ (T49-T50, Session 45) — 2 topics
    - E&M ✓ (T29-T39, Session 48) — 5-6 topics (T32/T33 numbering pending Stage-4)
    - Mechanics ✓ (T10-T17, Session 51) — 10 topics
    - **Mechanical Properties ✓ (T18 + T20, Session 52)** — 2 topics (NEW closure)
    - **Thermodynamics ✓ (T26 + T27 + T25, Session 52)** — 3 topics (NEW closure)
    - **8 of 8 major clusters CLOSED/NEAR-CLOSED.**
    
    Remaining unworked: T6/T7/T9 Kinematics formalisation (T5 in repo); T19/T22/T23 Waves middle (largest untouched cluster); T1-T4 NCERT Class-11 Part-1 Ch.1-4 (Physical World, Units, Math-tools-related); T28 Heat-engine extension? (NCERT-light); ~6 stragglers.

13. **Session 53 recommended direction:** Two natural options of comparable strength:
    - **Option A (RECOMMENDED): T19 Wave Equation + T22 Superposition & Standing Waves** — opens the largest untouched cluster (Waves middle). T19 + T22 + T23 will close it across 2-3 paired-batches. T21 Wave Motion already catalogued in early Stage-2 — strong upstream dependency match.
    - **Option B: T6 Kinematics 1D + T9 Kinematics 2D** — formalises the Vectors-Kinematics opener cluster (T5 Vectors already in repo as 19 atomics, no formal pilot). Could be paired with a Stage-4 cleanup half-session.
    - **Option C: Stage-4 cleanup sweep** — anchor-bucket re-rating of 6 un-bucketed topics + T32/T33 numbering reconciliation + cross-pilot cognitive-error-prevention index file. Half-session.
    - **Recommendation: Option A.** Highest cluster-closure value; opens the last major untouched cluster. T19+T22 likely 4-edge cross-pair with T17 SHM (already 7 edges from S38) + 6-edge intra-cluster pair (chapter-adjacent in HCV+NCERT).

14. **Stage-2 majority-bracket at 75%; closure on schedule.** At ~2-pilot-per-session cadence: 11 pilots / 2 = ~5-6 sessions to Stage-2 closure. **Target Session 57-58 for Stage-2 completion.** **All 8 major clusters now closed/near-closed at 75% checkpoint — ahead of schedule.**

### After 31 pilots (2026-05-25 — Topics 12, 21, 36, 10, 13, 17, 30, 16, 31, 29, 34, 41, 42, 43, 44, 45, 47, 46, 48, 49, 50, 35, 38, 37, 39, 26, 27, 11, 14, 15, 18):

1. **MECHANICS CLUSTER CLOSED 10/10.** T15 Rotational Mechanics shipped — final Mechanics topic. **6th cluster closure in Stage-2** (after Optics, Modern Physics core, Modern Physics applied, E&M, Thermodynamics-near-closure). Catalog status after 31 pilots: **6 of 8 major clusters closed/near-closed** (Optics ✓, Modern Physics core ✓, Modern Physics applied ✓, E&M ✓, Mechanics ✓, Thermodynamics 2/3 near-closed, Mechanical Properties OPENED 1/2, Waves middle untouched).

2. **MECHANICAL PROPERTIES CLUSTER OPENED.** T18 Elasticity is the cluster opener; T20 Fluid Mechanics remains. **Cross-cluster paired-batch first observed: T15 ↔ T18 = 4 bidirectional edges**, matching Stage-4 formalised cross-cluster density rule (2-4 edges). **7th data point** in density-rule validation; rule firmly established across both bands (intra-cluster chapter-adjacent: 6-9 edges; cross-cluster: 2-4 edges).

3. **17-18-SESSION-LAG forward-edges CLOSED: T21 CT2 + CT3 → T18.** The longitudinal-wave-speed-in-fluid (CT2 → bulk_modulus_B) and longitudinal-wave-speed-in-solid (CT3 → youngs_modulus_Y) forward-edges from T21 Wave Motion catalog (Session 33-34) closed at T18 Elasticity (Session 51). **17-18-session lag — LONGEST-LAGGED forward-edges in matrix history, now CLOSED.** **Matrix integrity validation #7 in 7 consecutive sessions.** Auto-aggregation matrix design is robust to extreme-lag forward-edges; matrix infrastructure proven over the full Stage-2 span.

4. **11 anticipated forward-edges closed in Session 51 paired-batch** — second-densest closure observed (after Session 50's 23+). Combined Sessions 50+51 (T11, T14, T15, T18): **34+ back-edges closed in 2 sessions** — densest 2-session-pair closure observed in Stage-2. Mechanics middle hub-topic property AND Mechanics-cluster-closer + Mechanical-Properties-opener compound the closure density. Notably:
   - **14-session-lag T36 → T15** (magnetic-dipole-moment ← angular_momentum) — longest in Session 51
   - **17-18-session-lag T21 CT2/CT3 → T18** (Y/K for wave speeds) — longest-lagged in matrix, ever
   - T11/T13/T14 → T15 rotational analogs (1-session lag from Session 50)
   - T35/T37/T47 → T15 (5-8 session lags resolving Mechanics-to-E&M bridges)
   - T27 → T18 (2-session lag, mean-free-path bulk-modulus link)

5. **T15 = 92% triple-coverage (1 DUAL: torsional_pendulum_atomic).** T18 = 100%. Combined Session 51 triple-coverage: 21 of 22 atomics = 95%. **Streak resumes after T14's break:** T15 close-to-100%; T18 fully 100%. **Pattern signal confirmed**: foundational-physics chapters return to 100% when authoring at NCERT-canonical depth; only JEE-Advanced extensions (torsional pendulum, 2D collisions, rocket equation, reduced mass) trigger NCERT-omission.

6. **T15 + T18 anchor density: STRONG (both).** T15 = 12 anchors × 7 strands (space, sports/culture, transport, industry-renewable, industry-traditional, aviation, defence/navy). T18 = 11 anchors × 7 strands (industry, transport, civil-engineering, defence, navy, aviation, consumer, research, policy). **9th + 10th data points** confirming foundational-physics-plateaus-at-STRONG. **Anchor-bucket distribution after 31 pilots:**
   - VERY-STRONG = 5: T48, T49, T50, T39, T26.
   - STRONG = 13 (including T15, T18 newly catalogued): T10, T11, T14, T15, T16, T17, T18, T27, T30, T35, T37, T38, T41, T42, T43, T44 + (re-rating pending).
   - MEDIUM = 1: T34.
   - WEAK = 1: T31.
   - Un-rated = 6 (cleanup pending).

7. **Cognitive-error-prevention combined Session 51 share: 9/23 = 39%.** T15 = 42% (5/12); T18 = 36% (4/11). **Mechanics + Mechanical-Properties cluster sustains the densest-misconception signal** across 6 consecutive sessions (S46: 47%, S48: 38%, S49: 36%, S50: 46%, S51: 39%). Both T15 and T18 meet ≥35% high-misconception-density threshold; elevated EPIC-L gate applies.

8. **Math-tools file fully stable for Mechanics cluster: 0 new stubs in Session 51.** `system_of_linear_equations_2var` validated for 3rd consecutive time (T11→T14→T15). All Elasticity primitives REQUIRED. **Math-tools IN-degree unchanged at 51.** **Light-maintenance mode resumed** after Session 49's 6-stub burst. Stage-3 file is now empirically stable across the Mechanics cluster span.

9. **Cumulative tally: 31 of 44 pilots = 70% complete (was 66%).** Atomics ~617 (was 594; T15 added 13 + T18 added 10 = 23). Nanos ~254 (was 227; T15 added 14 + T18 added 13 = 27). **Cross-topic edges ~342** (was 316; T15+T18 added 26). Math-tools IN-degree **51** (unchanged). **13 pilots + ~6-7 sessions remaining** to close Stage-2 (target ~Session 57-58).

10. **Founder decisions: T15 = 12 (RM-G1..G12), T18 = 11 (EL-G1..G11).** Combined Session 51: 23 founder decisions. **27-pilot decision-count distribution: mean = 9.1 (rising), mode = 12 (4-way tie: T26, T11, T14, T15), max = 12.** Decision count continues to grow with catalog complexity.

11. **Cross-cluster bridges added this session:** T15 ↔ T16 (Kepler's 2nd law, bidirectional); T15 ↔ T17 (torsional pendulum, bidirectional); T15 ↔ T36 (magnetic dipole moment ← angular momentum, 14-session-lag closure); T15 ↔ T37 (quantised L); T15 ↔ T47 (Bohr L = nℏ); T18 ↔ T21 (wave-speed Y/K, 17-18-session-lag closures); T18 ↔ T27 (bulk modulus microscopic). **Cumulative cross-cluster bridge count ≈ 53-60** across 31 pilots. **Knowledge graph densification continues super-linearly.**

12. **Session 52 recommended direction: T20 Fluid Mechanics + T-thermal-properties (Ch.11).** Closes BOTH Mechanical Properties cluster (T20) AND Thermodynamics cluster (T-thermal-properties NCERT Class 11 Part 2 Ch.11 = Calorimetry + Heat Transfer + Newton's Cooling + Thermal Expansion = T25 in stage-1 numbering). **Both closures in one session** = 2 cluster closures simultaneously — possibly densest-closure session yet. Alternative paths:
    - **Option A (RECOMMENDED)**: T20 + T25 (T-thermal-properties). Closes 2 clusters.
    - **Option B**: T19/T22/T23 Waves middle (Wave Equation + Superposition + Sound). Opens largest remaining untouched cluster.
    - **Option C**: T6 Kinematics 1D + T9 Kinematics 2D (formalise the Vectors-Kinematics opener cluster). T5 Vectors is already in repo (19 atomics, no formal pilot).
    - **Recommendation: Option A**. Aggressive cluster-closure tempo; sets up Session 53-54 for the remaining Waves middle + Kinematics-formalisation work.

13. **Stage-2 majority-bracket crossed at 70%; closure on schedule for ~Session 57-58.** At ~2-pilot-per-session cadence: 13 pilots / 2 = ~6-7 sessions to Stage-2 closure. **Cluster-closure tempo dominant productivity metric**: 6 clusters closed/near-closed in 31 pilots = 1 cluster per 5.2 pilots. Forecast: at 44-pilot completion, all 8 major clusters closed; ~30 hours of Stage-3-Stage-4-Stage-5-Stage-6 polish remaining post-Stage-2.

### After 29 pilots (2026-05-25 — Topics 12, 21, 36, 10, 13, 17, 30, 16, 31, 29, 34, 41, 42, 43, 44, 45, 47, 46, 48, 49, 50, 35, 38, 37, 39, 26, 27, 11, 14):

1. **MECHANICS CLUSTER MIDDLE 2/3 CATALOGUED.** T11 Newton's Laws + T14 Momentum/Collisions shipped as Session 50 paired-batch. Mechanics-cluster catalog status: T5 Vectors (in repo as 19 atomics, no formal pilot) + T6/T7 (Kinematics 1D/2D) + T10 Circular Motion + T11 Newton's Laws (NEW) + T12 Friction + T13 Work-Energy + T14 Momentum/Collisions (NEW) + T16 Gravitation + T17 SHM — **9 of ~10 Mechanics topics catalogued.** Remaining: T15 Rotational Mechanics (single topic). **5th cluster near-closure** — after Optics, Modern Physics core, Modern Physics applied, E&M, Thermodynamics. **At 5-of-6 cluster near-closures, Stage-2 productivity is at peak observed cadence.**

2. **STAGE-4 FORMALISATION DELIVERED.** Stage-4 consolidation sweep #1 closed 4 backlog items in a single half-session (see `stage-4-consolidation.md`):
   - **(a) Cognitive-error-prevention sub-category** formalised as first-class catalog field (`cognitive_error_target:` in Notes column). Index file pending Session 51.
   - **(b) Anchor-bucket criterion** formalised: VERY-STRONG = anchor count ≥ 13 AND strand diversity ≥ 8. STRONG, MEDIUM, WEAK criteria specified.
   - **(c) IN/OUT-degree rankings** refreshed at 27-pilot (was stale at 9-pilot).
   - **(d) Atomic-vs-nano granularity stress-test** at 27-pilot: 90% pass rate (27/30 atomics OK; 2 too-coarse, 1 too-fine). **Atomic+nano scheme validated.** No structural changes; 3 split/merge tactical items flagged for V1 authoring backlog.
   
   **First pilot session under Stage-4-formalised criteria: T11 + T14 (Session 50). Anchor-bucket per strand-diversity criterion; cognitive_error_target field active.**

3. **8-TOPIC 100% TRIPLE-COVERAGE STREAK BROKEN at T14.** Streak: T48 → T35 → T38 → T37 → T39 → T26 → T27 → T11 = 8 consecutive. T14 = 70% (7/10) with 3 DUAL atomics (elastic_collision_2d, rocket_equation, reduced_mass — all NCERT-not-covered, HCV+DCM full). **Pattern signal sharpened:** NCERT 2023 omits JEE-Advanced material in foundational chapters (T11 pseudo-force NCERT-light + T14 2D/rocket/reduced-mass NCERT-not-covered). **Recommend Stage-4 introduce "triple-coverage-with-NCERT-omission" sub-tier.** Same NCERT-divergence pattern earlier observed in T26 entropy (Class 12 §12.13 condensed) and T50 Communication Systems (NCERT 2023 chapter dropped, state-board retained).

4. **23+ ANTICIPATED FORWARD-EDGES CLOSED IN ONE PAIRED-BATCH — densest closure ever observed.** T11 absorbed 15+ back-edges (every Mechanics-adjacent topic catalogued before it had an anticipated forward-edge); T14 absorbed 8+ back-edges (including T27 Session 49 Δp = 2mv_x derivation closure, T36 pair-production, T38 radiation pressure, T47 Rutherford + Bohr correction, T48 alpha + gamma recoil). **Mechanics-middle-hub property empirically clear:** as the deepest-prereq pair, T11+T14 are absorption sinks for forward-references from every cluster. **Matrix integrity validation #6 in 6 consecutive sessions** — every anticipated forward-edge continues to resolve.

5. **Cognitive-error-prevention combined Session 50 share: 46% (11/24 founder decisions) — NEW SESSION HIGH.** T11 = 50% (highest single-topic share in Stage-2); T14 = 42%. **Sustained 35-46% range over 5 consecutive sessions** (S46: 47%; S47: cleanup; S48: 38%; S49: 36%; S50: 46%). **Mechanics is the densest-misconception cluster — even denser than Thermodynamics + E&M.** This validates the Stage-4 formalisation: high-misconception-density chapters need the elevated EPIC-L authoring gate. **Both T11 and T14 meet the threshold (≥35%); per Stage-4 formalisation, elevated gate applies to both.**

6. **Anchor-bucket distribution under formalised criterion (29 pilots):**
   - **VERY-STRONG = 5**: T48 (8 strands), T49 (8 strands), T50 (9 strands), T39 (9 strands), T26 (9 strands).
   - **STRONG = 13** (after Stage-4 refresh): T10, T11 (6-7 strands), T14 (7 strands, borderline), T16, T17, T27, T30, T35, T37, T38, T41, T42, T43, T44 + (some entries need formal re-rating).
   - **MEDIUM = 1**: T34.
   - **WEAK = 1**: T31.
   - **Un-rated = 7** (cleanup pending).
   
   **Pattern: foundational/conceptual physics chapters plateau at STRONG; applied-engineering chapters reach VERY-STRONG (industry coupling necessary).** T14 at 7-strand borderline is the closest-to-VERY-STRONG foundational topic observed — collision physics has unusual breadth (sports + defence + transport + industry) but lacks the deep-heavy-industry coupling (NTPC-equivalent for thermodynamics).

7. **First cross-domain validation in same session: `system_of_linear_equations_2var`.** T11 registered the new stub; T14 validated it within same session. **Fastest cross-domain validation observed since Stage-3 file shipped** (Sessions 41-42). All other T14 math primitives already REQUIRED. **math-tools IN-degree: 50 → 51** (T11 added 1 new stub; T14 added zero). Math-tools file is back in light-maintenance mode after Session 49's 6-stub burst.

8. **T11 ↔ T14 = 8 bidirectional edges — 6th data point in chapter-adjacent intra-cluster density band (6-9).** Pair is HCV-Ch.5 + HCV-Ch.9 (chapter gap of 3) + DCM1-Ch.8 + DCM2-Ch.11 (different volumes but same cluster) + NCERT-Ch.5 + NCERT-Ch.7 (with Ch.6 between). **Moderate-adjacency variant — still hits 8 edges.** Band firmly established at 6 data points.

9. **Cumulative tally: 29 of 44 pilots = 66% complete (was 61%).** Atomics ~594 (was 571; T11 added 13 + T14 added 10 = 23). Nanos ~227 (was 195; T11 added 18 + T14 added 14 = 32). **Cross-topic edges ~316** (was 285; T11+T14 added 31). Math-tools IN-degree **51** (was 50). **15 pilots + ~7-8 sessions remaining** to close Stage-2 (target ~Session 57-58).

10. **Founder decisions: T11 = 12 (NL-G1..G12), T14 = 12 (MC-G1..G12).** Both tie T26's record (12 decisions). **27-pilot decision-count distribution: mean = 8.5, mode = 8, max = 12 (now 3-way tie among T26, T11, T14 — all hard-conceptual middle-cluster topics).** Decision count is now a leading indicator of cognitive-error-prevention density.

11. **Cross-cluster bridges added this session:** T11 ↔ T16 (gravity force atomic, orbital velocity); T11 ↔ T17 (spring force → SHM bridge — most-cited mechanics-to-oscillations atomic); T11 ↔ T27 (F = dp/dt → kinetic-theory pressure); T14 ↔ T27 (collision-momentum-change → pressure derivation, CLOSED); T14 ↔ T47 (reduced mass → Bohr H-atom correction; elastic 2D → Rutherford scattering); T14 ↔ T48 (momentum conservation → alpha/gamma recoil, CLOSED). **Cumulative cross-cluster bridge count ≈ 45-50** across 29 pilots. **Knowledge graph densification continues super-linearly.**

12. **Session 51 recommended direction:** Two options of comparable strength:
    - **Option A: T15 Rotational Mechanics + T18 Elasticity** — closes Mechanics cluster fully + opens Mechanical Properties of Solids cluster. T15 is the last Mechanics topic; T18 was forward-flagged by T27 (mean_free_path → bulk modulus microscopic). High edge-density expected (T15 absorbs T11+T14 back-edges).
    - **Option B: T7 Rotation + T15 Rotational Mechanics** — pure Mechanics rotation pair. **NOT recommended** — T7 may already be effectively covered by T10 Circular Motion + the rotational subset of NCERT Ch.7 which is mostly T15 territory. Stage-4 should reconcile T7-vs-T15 boundary first.
    - **Option C: T18 Elasticity + T20 Fluid Mechanics** — Mechanical Properties cluster (both NCERT Class 11 Part 1 chapters). Two foundational topics; closes T27 mean-free-path → T18 bulk modulus forward-edge.
    - **Recommendation: Option A (T15 + T18)** — closes Mechanics cluster fully (6th cluster closure), opens Mechanical Properties cluster, addresses T27→T18 forward-edge. T15 absorbs Mechanics back-edges from T11+T14; T18 is foundational standalone.
    
    **Note:** Stage-4 cleanup remaining (anchor-bucket re-rating of 9 un-bucketed topics; T32/T33 numbering reconciliation; cross-pilot cognitive-error-prevention index file) — should be tackled at Session 52 or distributed across 51-53.

13. **Stage-2 majority-bracket crossed at 66%; closure on schedule.** At current ~2-pilot-per-session cadence: 15 pilots / 2 = ~7-8 sessions to Stage-2 closure. **Target Session 57-58 for Stage-2 completion.** Stage-3 file in light-maintenance; Stage-4 consolidation #1 done. Stage-5 outcome mapping + Stage-6 cognitive mapping + Stage-7 strategy synthesis remain post-Stage-2.

### After 27 pilots (2026-05-25 — Topics 12, 21, 36, 10, 13, 17, 30, 16, 31, 29, 34, 41, 42, 43, 44, 45, 47, 46, 48, 49, 50, 35, 38, 37, 39, 26, 27):

1. **THERMODYNAMICS CLUSTER OPENED (and 2/3 of the way closed in one session).** T26 Thermodynamics + T27 Kinetic Theory shipped as Session 49 paired-batch. Together they form the macroscopic ↔ microscopic spine of the thermodynamics cluster (T-thermal-properties Ch.11 remains pending — last topic in the cluster). At 27 pilots, **cluster status: 4 closed (Optics, Modern Physics core, Modern Physics applied, E&M) + 1 opened-and-near-closed (Thermodynamics) + 1 in progress (Mechanics, 4-of-~10 catalogued).**

2. **SEVEN consecutive 100% triple-coverage topics: T48, T35, T38, T37, T39, T26, T27.** Longest streak yet observed. **All applied-physics + foundational-physics chapters that survived NCERT 2023.** Hypothesis at this point is at near-confirmation: **the curricular core of NCERT post-2023 is uniformly triple-covered across NCERT + HCV + DCP.** Pattern is robust across 7 consecutive Stage-2 sessions. **Recommend Stage-4 formalize 100%-coverage as a primary V1 priority weighting term** (+1.0× multiplier; lower-risk authoring).

3. **VERY-STRONG anchor bucket grew to 5 (T48, T49, T50, T39, T26 — Thermodynamics joins).** **Second non-Modern-Physics VERY-STRONG topic** — applied-engineering-cluster hypothesis confirmed at 2 test points. T27 Kinetic Theory plateaued at STRONG (11 anchors, 7-8 strands) — falls short of strand-diversity ≥ 9. **Refined anchor-bucket criterion (KT-G8):** anchor count AND strand diversity both matter; **VERY-STRONG = anchor count ≥ 13 AND strand diversity ≥ 8**. Anchor count alone is necessary but insufficient. **Pattern sharpening:** foundational-physics chapters cluster at STRONG; applied-engineering at VERY-STRONG; chapter-type predicts anchor-bucket.

4. **MATH-TOOLS FILE OUT OF MAINTENANCE MODE.** **6 new stubs in single Session 49** — highest single-session count yet observed. T26: `power_function_pv_gamma`, `pv_diagram_visualization`, `state_function_concept`. T27: `gaussian_distribution`, `integration_of_gaussian`, `statistical_ensemble_averaging`. **math-tools IN-degree: 41 → 47 (after T26) → 50 (after T27).** **Hypothesis: math-tools file growth correlates with CLUSTER novelty, not pilot-count.** Thermodynamics-Kinetic-Theory introduces a distinct mathematical vocabulary (PV-diagrams, state-functions, Gaussian distributions, statistical-mechanical machinery) absent from Mechanics/E&M/Optics/Modern-Physics. **Forecast:** when Statistical Mechanics extension chapter or T-thermal-properties (Ch.11) ships, expect 1-2 more stubs from heat-conduction (Fourier law) + Stefan-Boltzmann + Newton's-cooling primitives. After that, growth rate decays again to maintenance mode.

5. **T26 ↔ T27 = 7 bidirectional edges — 5th confirmation of chapter-adjacent intra-cluster density band.** Adjacent NCERT chapters (Ch.12 + Ch.13) + adjacent HCV chapters (Ch.24 + Ch.26 with Ch.25 between) + same DCWT cluster (Ch.20 + Ch.21). **5 paired-batch density-rule data points now consistent in the 6-9-edge band** (T37↔T39=8, T35↔T38=6, T49↔T50=8, T45↔T47=9, T26↔T27=7). **Rule firmly established.**

6. **Cognitive-error-prevention sub-category share: 36% (8/22 founder decisions across T26+T27).** Sustains 35-38% range over 4 consecutive sessions (S46: 8/17, S47: cleanup-only, S48: 8/21, S49: 8/22). **Modal founder-decision sub-category across 27 pilots. STAGE-4 FORMALISATION IS OVERDUE.** Recommend Stage-4 consolidation half-session formalises:
   - "cognitive_error_prevention: <description>" as a first-class catalog field per atomic/nano.
   - Cross-pilot index: which atomics ship cognitive-error-prevention contrast nanos.
   - Authoring-quality gate: ≥1 cognitive-error-prevention nano per atomic in catalogs flagged "high-misconception-density."

7. **Anchor-bucket distribution after 27 pilots:** VERY-STRONG = 5 (T48, T49, T50, T39, T26), STRONG = 11 (T10, T16, T27, T30, T35, T37, T38, T41, T42, T43, T44 + others), MEDIUM = 1 (T34), WEAK = 1 (T31), un-rated = 9. **Refined hypothesis:** strand diversity is the primary discriminator. **Strategic insight:** ship VERY-STRONG topics first for maximum investor + student-acquisition leverage; foundational STRONG topics (T16 Gravitation, T27 KT, T30 Electrostatics) ship next (curricular core, high authoring volume).

8. **Cumulative tally: 27 of 44 pilots = 61% complete (was 57%).** Atomics ~571 (was 550; T26 added 13 + T27 added 8 = 21). Nanos ~195 (was 161; T26 added 18 + T27 added 16 = 34). **Cross-topic edges 285** (was 254; T26+T27 added 31). Math-tools IN-degree 50 (was 41). **17 pilots + ~9 sessions remaining** to close Stage-2 (target ~Session 58).

9. **Forward-edge closure this session: 1** (T13 Work-Energy → T26 first_law_atomic — anticipated since T13 catalogued at Session ~37; closed in Session 49). **Lower than Session 48's 4-closure record** — expected, since Thermodynamics is a cluster-opener (introduces forward-looking edges) rather than a cluster-closer. **Matrix integrity validation #5 in 5 consecutive sessions** — every previously-deferred dependency continues to resolve.

10. **Founder decisions: T26 = 12 (TD-G1..G12 — NEW ALL-TIME HIGH), T27 = 10 (KT-G1..G10).** Previous high was T39 = 11 (AC-G1..G11). T26's 12 decisions includes one Stage-4 directive (TD-G11 cognitive-error-prevention formalisation driver) and one ANCHOR-bucket-criterion proposal (TD-G10 implicit in narrative). **Decision-count growth signals catalog-complexity growth** as we move into hard-conceptual chapters. **27-pilot decision-count distribution: mean = 8, median = 7-8, mode = 7, max = 12.**

11. **Stage-4 numbering reconciliation: 2 of 2 resolved this session.** T26 Thermodynamics (was informally "T18") + T27 Kinetic Theory (was informally "T19") now use canonical stage-1 numbering. **One Stage-4 backlog item cleared inline** without dedicated consolidation pass. **Remaining Stage-4 backlog after this session:** (a) cognitive-error-prevention formalisation, (b) anchor-bucket criterion formalisation (anchor-count + strand-diversity), (c) IN/OUT-degree rankings refresh (last refreshed at 9 pilots), (d) atomic-vs-nano granularity stress-test on 27-pilot dataset. **Half-session consolidation sweep recommended for Session 50** (or to complete this Session 49 in remaining time).

12. **Cross-cluster bridges added this session:** T26 ↔ T13 (work-energy → first law, closing anticipated bridge); T26 ↔ T48 (entropy → nuclear directionality, weak); T26 ↔ T39 (carnot inequality → transformer η, weak analogy); T27 ↔ T48 (MB distribution → fission-fragment KE, statistical machinery); T27 ↔ T38 (kinetic pressure → radiation pressure analog); T27 ↔ T18 Elasticity (mean free path → bulk modulus microscopic, forward). **Cumulative cross-cluster bridge count ≈ 36-40** across all 27 pilots. **Knowledge graph densification continues super-linearly** as predicted.

13. **Session 50 recommended direction:** **Half-session Stage-4 consolidation sweep** (formalize cognitive-error-prevention sub-category + anchor-bucket criterion + IN/OUT-degree rankings refresh + atomic-vs-nano granularity stress-test) **+ half-session next paired-batch**. Options for the next paired-batch:
    - **Option A: T11 Newton's Laws + T14 Momentum/Collisions** — Mechanics cluster middle hub-topic batch. Both expected high IN-degree as deep-prereq topics. Resolves several deferred Mechanics back-edges.
    - **Option B: T18 Elasticity + T20 Fluid Mechanics** (NCERT 11.2 Ch.9 + Ch.10) — Mechanical Properties cluster. T27 kinetic theory's mean_free_path forward-edge to T18 closes here.
    - **Option C: T-thermal-properties (Ch.11) + T-oscillations-extension** — close the Thermodynamics cluster fully + bridge to SHM territory.
    - **Recommendation: Stage-4 consolidation half + Option A (T11 + T14)** — addresses overdue Stage-4 work AND opens the largest remaining untouched Mechanics middle. **Heavy hub-topic edge-closure batch expected.**

### After 25 pilots (2026-05-25 — Topics 12, 21, 36, 10, 13, 17, 30, 16, 31, 29, 34, 41, 42, 43, 44, 45, 47, 46, 48, 49, 50, 35, 38, 37, 39):

1. **E&M CLUSTER FULLY CLOSED.** T37 Magnetism & Matter + T39 AC Circuits shipped in same Session 48 batch. E&M topics catalogued: T29 (Charges), T30 (Electrostatics), T31 (Capacitors), T34 (Current Electricity), T35 (EM Induction), T36 (Moving Charges & Magnetism), T37 (Magnetism & Matter), T38 (EM Waves), T39 (AC Circuits) = **9 of ~10 E&M topics** (last remaining: T32/T33 numbering reconciliation pending Stage-4). **4th Stage-2 cluster closure** — after Optics (Session 41), Modern Physics core (Session 44), Modern Physics applied (Session 45). At 4 closed clusters in 8-session run, **cluster-closure tempo is the dominant Stage-2 productivity metric**.

2. **FIVE consecutive 100% triple-coverage topics: T48, T35, T38, T37, T39.** All applied-physics chapters that survived NCERT 2023 revision. **Pattern signal confirmed at 5 consecutive instances**: triple-coverage rate is sharply defined for the curricular core. **Both T37 AND T39 hit 100% in same paired-batch** — first session where both partners are at 100% coverage. Hypothesis upgraded from speculative to confirmed: **applied/foundational physics topics that survived NCERT 2023 ≈ universally triple-covered**.

3. **4 separate forward-edges closed in one paired-batch** — densest closure session yet observed:
   - T36 A31 forward (current loop → permanent magnet) closed by T37 magnetic_dipole_moment_atomic. Originally surfaced Session 36, closed Session 48 (**12-session lag** — second-longest forward-edge resolution after T36→T47's 7-session gap).
   - T35 EI-G6 deferral (LC oscillation belongs in AC chapter) closed by T39 lc_oscillations_atomic. Originally deferred Session 46, closed Session 48 (**2-session lag**).
   - T37 forward (hysteresis-loop → transformer-core-selection) closed by T39 transformer_in_ac_atomic. **Intra-session closure** — first observed paired-batch where one partner closes the other's forward-edge in the same session.
   - T39 ↔ T50 anticipated link (modulator + LC tank + LCR demodulator filter) closed by T39 lc_oscillations + resonance_in_lcr. Originally anticipated Session 45, closed Session 48 (**3-session lag**).
   
   **Matrix integrity validation #4 in 4 consecutive sessions.** Forward-edge resolution timing pattern: median 1-2 sessions; longest observed = 12 sessions (T36→T37 cluster-closer gap). **Auto-aggregation matrix design is robust to varying resolution times.**

4. **NEW math-tools stub registered: `phasor_complex_representation` (Z = R + jX)** — first new stub since Session 45's `pythagoras_curved_earth`. 3-session gap with zero new stubs (T35/T38/T37 added zero). **Math-tools file is converging to a stable core** — stub registration rate dropping as catalog set grows. **2 cross-cluster validations this session:** `time_averaging_cos_squared` (3rd use: T44 Malus → T38 EM-wave intensity → T39 rms) + `algebra_quadratic` (2nd cross-cluster use after T49 mass-action). **math-tools IN-degree at 41** (was 38).

5. **T37 ↔ T39 = 8 bidirectional edges — confirms "same-cluster chapter-adjacent" density band.** T37 and T39 are NOT same NCERT chapter (Ch.5 vs Ch.7) but ARE consecutive HCV chapters (Ch.42 + Ch.43) and same DCP chapter cluster (Ch.28 + Ch.30). 8 edges matches T49↔T50 (same-chapter applied pair). **Refined paired-batch density rule:**
   - **Intra-cluster same-chapter / chapter-pair**: 7-9 edges (T41↔T42, T45↔T47, T49↔T50, T43↔T44)
   - **Intra-cluster chapter-adjacent (HCV/DCP consecutive)**: 7-8 edges (T37↔T39, joining intra-cluster-same-chapter band)
   - **Cross-chapter intra-cluster (with chapter gap)**: 4-6 edges (T46↔T47, T48↔T47, T46↔T48, T35↔T38)
   - **Cross-cluster paired pair**: 2-3 edges
   
   **The "chapter-adjacency in any source" predictor now overrides the strict "same NCERT chapter" criterion** — DCP/HCV chapter-adjacency suffices for high density. This refines the Session 47 cleanup rule.

6. **VERY-STRONG anchor density confirmed for T39; STRONG for T37.** T39 = 14 anchors spanning **9 strands** (industry, policy, transport, healthcare, space, residential, consumer, defence, telecom). **4th VERY-STRONG topic in Stage-2** — joins T48 Nuclei, T49 Semiconductor, T50 Communication Systems. T37 = 11 (industrial + research + healthcare-light + space) — STRONG, just below threshold (could reach VERY-STRONG with Maitri-station + GSI aeromagnetic + AIIMS-NMR additions at Stage-4). **Pattern signal extended:** all 4 VERY-STRONG topics so far are applied-engineering/applied-modern (Nuclei, Semiconductor, Communication, AC Circuits) — **applied-engineering chapters cluster uniformly in VERY-STRONG**. Hypothesis: every applied-engineering chapter in NCERT Class-12 anchored against Indian industry will hit VERY-STRONG. Test at next applied chapter (T18 Thermodynamics or future T-power-electronics).

7. **Anchor bucket distribution after 25 pilots:** VERY-STRONG = 4 (T48, T49, T50, T39), STRONG = 10 (T10, T16, T30, T35, T37, T38, T41, T42, T43, T44 + others), MEDIUM = 1 (T34), WEAK = 1 (T31), un-rated = 9. **Applied-modern + applied-engineering is the marketing-dense quadrant** of Indian Class-12 physics — confirmed by repeated VERY-STRONG observations. Strategic insight for V1 launch sequencing: ship VERY-STRONG topics first for maximum investor + student-acquisition impact.

8. **Cumulative tally: 25 of 44 pilots = 57% complete.** Atomics catalogued ~550 (was 527; T37 added 11 + T39 added 12 = 23). Nanos ~161 (was 131; T37 added 14 + T39 added 16 = 30). **Cross-topic edges 254** (was 224; T37+T39 added 30 — densest paired-batch edge addition yet, matches the 4-forward-edge-closure session signature). At current 2-pilot-per-session cadence, ~10 more sessions to close Stage-2 (target ~Session 58).

9. **Founder decisions: T37 = 10 (MM-G1..G10 — new high), T39 = 11 (AC-G1..G11 — new high).** 25-pilot mode now 7 → likely shifting to 8-9 as catalog complexity grows. Both topics had unusual decision-count expansion driven by **cognitive-error-prevention sub-category**: T37 had 4 (MM-G2, MM-G5, MM-G6, MM-G10) = 40%; T39 had 4 (AC-G1, AC-G6, AC-G8, AC-G10) = 36%. Session 48 cognitive-error-prevention share: **8/21 = 38%** — above the 30-35% mean. **Cognitive-error-prevention formalization at Stage-4 is now overdue** — it's the modal sub-category in 25-pilot data.

10. **Cross-cluster bridges added this session:** T37 ↔ T17 (dipole-as-angular-SHM, parallel to T30); T37 ↔ T47 (diamagnetism ← Bohr orbit); T39 ↔ T17 (LC ↔ SHM, **most-cited cross-cluster analogy in physics — now formally captured**); T39 ↔ T38 (LC tuning ↔ Hertz receiver); T39 ↔ T49 (transformer + rectifier in SMPS — weak forward). **Cumulative cross-cluster bridge count ≈ 30-35** across all 25 pilots. **The knowledge graph is densifying as predicted** — densification rate appears super-linear (5 new bridges in this session vs 5 in previous, but cluster-closure effect compounds).

11. **First "both partners 100% triple-coverage" paired-batch.** T37 (11/11) AND T39 (12/12) both at 100%. Previous 100%-coverage topics were singletons within their session (T48 alone; T35 alone; T38 alone). **This is the first paired-batch where both partners share the 100% property.** Suggests Stage-4 V1 priority weighting should consider **paired-batch coverage symmetry** — author pairs where both partners are 100% for max source-chain support.

12. **Stage-2 majority bracket crossed; Stage-3 file stable.** With Stage-2 at 57% completion and math-tools at 41 IN-degree with stub-registration rate slowing, Stage-3 file is in maintenance mode. **No Stage-3 updates triggered by Session 48** beyond the single `phasor_complex_representation` stub. **Resource implication:** remaining 19 Stage-2 sessions should require minimal Stage-3 churn — math-tools file is now a slowly-growing reference, not an active development artifact.

13. **Next-batch options for Session 49** (E&M cluster CLOSED — clean slate for major-cluster choice):
    - **Option A: T18 Thermodynamics + T19 Kinetic Theory** — Thermodynamics chapter pair (long-deferred since Session 42 recommendation). Both 25-30 atomics expected. STRONG anchor density likely via Indian rail/auto industry + NCERT real-life-engine examples. **Opens the thermodynamics cluster.**
    - **Option B: T11 Newton's Laws + T14 Momentum/Collisions** — Mechanics cluster middle. Both heavy IN-degree (T11 = 4 already from Mechanics catalogs; T14 = 2). Hub-topic batch — expected to close several deferred Mechanics back-edges.
    - **Option C: Stage-3 math-tools sweep + Stage-4 atomic-vs-nano granularity audit** — formalize cognitive-error-prevention sub-category; reconcile T32/T33 numbering; stress-test atomic-vs-nano boundary on 25-pilot dataset. **No new catalogs; pure consolidation.**
    - **Option D: Open Thermodynamics + Mechanics in parallel** — T11 + T18 paired-batch (cross-cluster). Lower edge-density (~2-3 edges) but opens 2 clusters simultaneously.
    - **Recommendation: Option A (T18 + T19 Thermodynamics)** — opens the largest remaining un-touched cluster (Thermodynamics-Kinetic-Theory), continues paired-batch cadence, hits two long-deferred catalogs in one session. **Stage-4 consolidation (Option C) is also justified** but can run in parallel as half-session work. **Strongest recommendation: A primary + C in remaining time.**

### After 23 pilots (2026-05-25 — Topics 12, 21, 36, 10, 13, 17, 30, 16, 31, 29, 34, 41, 42, 43, 44, 45, 47, 46, 48, 49, 50, 35, 38):

1. **E&M cluster middle CLOSED.** T35 EM Induction + T38 EM Waves shipped. The E&M topics catalogued so far: T29 (Charges), T30 (Electrostatics), T31 (Capacitors), T34 (Current Electricity), T35 (EM Induction), T36 (Moving Charges & Magnetism), T38 (EM Waves) = **7 of ~10 E&M topics**. Remaining E&M (T32/T33 numbering reconciliation pending, T37 Magnetism & Matter, T39 AC Circuits) likely takes 2-3 more sessions. **E&M is the broadest cluster** — 10 topics vs Optics 4 + Modern core 4 + Modern applied 2 = 4-6 topics per other cluster.

2. **THREE consecutive 100% triple-coverage topics: T48 Nuclei, T35 EM Induction, T38 EM Waves.** All three are "applied physics that survived the NCERT 2023 revision." **Pattern signal:** the curricular core (concepts every source treats exhaustively) is sharply defined and 23-pilot-stable. Hypothesis for Stage-4: triple-coverage rate could be a Stage-5 V1 priority weighting term — 100%-coverage topics get +1.0× authoring priority because all 3 source-chains support content development.

3. **3 anticipated forward-edges from T50 CLOSED in this session.** Session 45 catalog of T50 surfaced 3 forward-edges to "future T38 EM Waves" (ground/sky/space wave propagation). T38 atomic `em_wave_basics` now exists and explicitly cites the 3 T50 atomics. **Third matrix-integrity validation in 3 sessions:** Session 43 forward edges (T47 → T46, T47 → T48) closed by Session 44; Session 44 forward edges (T48 → T49, T46 → T49) closed by Session 45 T49 atomic energy_bands; Session 45 forward edges (T50 → T38 × 3) closed by Session 46 T38. **Matrix auto-aggregation design is working as predicted.**

4. **3rd consecutive Stage-3 primitive validation.** Session 44: `calculus_exponential_decay` first-use in T48 (decay law). Session 45: `trig_product_to_sum_identities` first-use in T50 (AM sidebands) — promoted to REQUIRED. Session 46: `calculus_exponential_decay` 3rd use in T35 LR circuit; `time_averaging_cos_squared` 2nd cross-cluster use in T38 intensity (after T44 Malus). **Stage-3 anticipated-stub strategy is unambiguously paying off.** Both primitives are now firmly cross-domain-validated.

5. **T35 ↔ T38 = 6 bidirectional edges — confirms paired-batch density rule mid-band.** Cross-chapter same-cluster pair density = 6. Sits midway between intra-cluster-same-chapter (7-9: T41↔T42, T45↔T47, T49↔T50) and cross-cluster (2-3: T17↔T30, T16↔T31). Refined rule:
   - **Intra-cluster same-chapter / chapter-pair**: 7-9 edges
   - **Cross-chapter intra-cluster**: 4-6 edges (T46↔T47, T48↔T47, T46↔T48, T35↔T38)
   - **Cross-cluster paired pair**: 2-3 edges
   
   T35 and T38 are NCERT Ch.6 and Ch.8 — adjacent chapters within E&M cluster, but with NCERT Ch.7 (AC, not yet catalogued) between them. **The "chapter-distance" metric matters within a cluster.**

6. **STRONG anchor density remained for both T35 + T38.** Neither hit VERY-STRONG threshold (13+ anchors with policy + research + healthcare strands). T35 = 10 (industrial heavy: power grid, dams, substations, induction cooktops, Vande Bharat). T38 = 11 (satellite bands, radar, broadcast, 5G, healthcare X-ray). Both strong but lacking the policy/regulatory strand that pushes applied-modern to VERY-STRONG. **Anchor-bucket distribution (23 pilots):** VERY-STRONG = 3 (T48, T49, T50), STRONG = 9 (T10, T16, T30, T35, T38, T41, T42, T43, T44, others), MEDIUM = 1 (T34), WEAK = 1 (T31), un-rated = 9.

7. **math-tools IN-degree at 38 (was 36).** T35 added 2 (calculus_derivative_basics for Faraday's law; calculus_exponential_decay 3rd use). T38 added 1 (time_averaging_cos_squared 2nd cross-cluster use — counted once). Forecast at 44-pilot completion: ~75-90 (linear extrapolation holds). **Stage-3 file integrity remains strong** — no dangling prereqs introduced this session.

8. **Cumulative tally: 23 of 44 pilots = 52% complete — PAST HALFWAY.** ~527 atomics catalogued (was 504; T35+T38 added 23). ~131 nanos. 224 cross-topic edges. **Stage-2 majority-complete.** At current cadence ~11 more sessions to close Stage-2 (target ~Session 57).

9. **Founder decisions: T35 = 8 (EI-G1..G8 — first 8-decision catalog observed), T38 = 9 (EW-G1..G9 — second 9-decision catalog, ties with T44).** 23-pilot mode still 7, but decision count creeping up as catalog complexity grows. The expansion driven by **cognitive-error-prevention sub-category**: EI-G8 (Lenz's law sign convention), EW-G8 (em_wave_identification_criteria). Both topics had explicit cognitive-prevention atoms — student-failure mode flagged & countered at catalog level. Stage-4 sub-category formalization increasingly urgent.

10. **Cross-cluster bridge edges multiplying.** This session added: T35 ↔ T13 (Lenz = energy conservation), T35 ↔ T7 (rotating coil), T38 ↔ T14 (radiation pressure), T38 ↔ T44 (transversality bridge), T35/T38 ↔ T31 (energy-density parallels). **Hypothesis (Stage-4-grade):** as more topics ship, cross-cluster bridges compound non-linearly. T35+T38 alone added 5 unique cross-cluster bridges; cumulative cross-cluster bridge count is now ~25-30 across all 23 pilots. **The knowledge graph is densifying as predicted.**

11. **Forward-edge resolution timing pattern.** Forward edges introduced in session N have so far been closed within 1-2 sessions: T17 (Session 38) → T30 (Session 38, same batch); T36 (Session 36) → T47 (Session 43, 7-session gap — exception); T47 (Session 43) → T46 (Session 44, 1 session); T47/T48 (Session 43-44) → T49 (Session 45, 1-2 sessions); T50 (Session 45) → T38 (Session 46, 1 session). **Median forward-edge resolution: 1 session.** Exception: T36→T47 (7 sessions) was the early-pilot signal that the matrix auto-aggregation needed validation. Now stable.

12. **Next-batch options:**
    - **Option A: T37 Magnetism & Matter + T39 AC Circuits** — closes E&M cluster fully (last 2 E&M topics). T37 uses T35 self/mutual-inductance for hysteresis loop; T39 fully extends T35 transformer + LR + LC. STRONG anchor likely (Indian transformer industry + power-electronics).
    - **Option B: T18 Thermodynamics + T19 Kinetic Theory** — long-deferred. Mechanics-thermal pair.
    - **Option C: T11 Newton's Laws + T14 Momentum/Collisions** — Mechanics cluster middle. Both expected high IN-degree as hub topics.
    - **Option D: Stage-3 math-tools update sweep** — 4 stubs/promotions queued (`pythagoras_curved_earth`, `algebra_quadratic`, `relativistic_kinematics_E_mc2`, `displacement_current_dimensional_analysis`).
    - **Recommendation: Option A (T37 + T39)** — closes E&M cluster, opens AC-chapter applications, naturally extends T35 transformer atomic into RLC resonance + power factor. Expected ~25-30 atomics each.

### After 21 pilots (2026-05-25 — Topics 12, 21, 36, 10, 13, 17, 30, 16, 31, 29, 34, 41, 42, 43, 44, 45, 47, 46, 48, 49, 50):

1. **Modern Physics applied cluster (T49 + T50) CLOSED.** Third cluster closure in Stage-2 — after Optics (T41-T44) and Modern Physics core (T45-T48). T49 Semiconductor (20 atomics) + T50 Communication Systems (17 atomics) = 37 atomics across 2 topics. The Modern Physics extended block (T45-T50, 6 topics) now totals **111 atomics**. Three closures from three successive sessions — cluster closure tempo accelerating as overlapping topic clusters compound.

2. **VERY-STRONG anchor sub-bucket CONFIRMED (3 consecutive instances).** T48 Nuclei (13 anchors), T49 Semiconductor (14 anchors), T50 Communication Systems (15 anchors) — three topics in a row exceeding the 13-anchor threshold first observed at T48. **Pattern signal: applied/modern physics is uniformly anchor-rich for Indian context.** Recommend Stage-4 formalize VERY-STRONG as the official third bucket (not just sub-bucket). Bucket distribution after 21 pilots: STRONG = 7, VERY-STRONG = 3 (T48, T49, T50), MEDIUM = 1 (T34), WEAK = 1 (T31), un-rated = 9. **Applied/modern physics is the marketing-leverage densest region** of Indian curriculum — strategic insight for V1 launch sequencing AND investor pitch ("look how much of this is built in India: ISRO, BARC, Tata Electronics, Bharat Net, Reliance Jio").

3. **T49 ↔ T50 = 8 bidirectional edges — second-densest paired-batch ever (after T45↔T47 = 9).** Both cross-cluster-style: T49 builds T50 (every modulator/demodulator uses T49 devices); T50 applies T49 (optical fibre uses LED+photodiode). Refines paired-batch density rule:
   - **Same-chapter intra-cluster (split-chapter)**: 7-9 edges (T41↔T42, T43↔T44, T45↔T47, T49↔T50)
   - **Cross-chapter intra-cluster**: 4-6 edges (T46↔T47, T48↔T47, T46↔T48, T29↔T34, T10↔T13)
   - **Cross-cluster pair**: 2-3 edges (T17↔T30, T16↔T31)
   
   T49 and T50 are separate NCERT chapters (Ch.14 + Ch.15) but treated as one **applied-physics chapter-pair** in HCV/DCP — explains the high-edge density.

4. **First-use of `trig_product_to_sum_identities` (Stage-3 anticipated stub → REQUIRED).** T50 `amplitude_modulation` AM-sideband derivation triggers promotion. Stage-3 anticipated stubs now have a 2nd validation point (after `calculus_exponential_decay` first-use in T48). **Anticipated-stub strategy is unambiguously paying off** — pre-registered primitives are getting used and migrated to REQUIRED status as predicted. Two distinct stubs validated in 2 successive sessions.

5. **New math-tools stub registered: `pythagoras_curved_earth`.** T50 `antenna_range_formula` derivation requires Pythagoras on a curved Earth (d = √(2hR)). Not in current Stage-3 file. Add as STUB (V2 may promote). math-tools IN-degree now 36 (was 32). **Stage-3 file update triggered** — recommend next session begin with Stage-3 update + sweep for `relativistic_kinematics_E_mc2_equivalence` (implicit in T48), `algebra_quadratic` (T49), `pythagoras_curved_earth` (T50).

6. **NCERT 2023 dropped Ch.15 — state boards retained.** T50 is the first topic where the canonical NCERT spine has diverged from state-board curriculum. **Policy decision applied:** author for state-board examinability; flag `ncert_2023: dropped, state_boards: retained` in metadata. Implication for V1 priority queue: T50 atomics weighted at 0.6× JEE-prep priority (NCERT-dropped) but 1.0× state-board priority. **Stage-5 priority weighting algorithm needs an `exam_visibility` field** beyond just `pyq_frequency`.

7. **Cumulative tally: 21 of 44 pilots = 48% complete.** Total atomics catalogued ~504 (was 467 at 19-pilot — T49+T50 added 37). Total nanos ~103. Cross-topic edges 199. **48% complete — halfway-mark imminent.** At current 2-pilot-per-session cadence, ~12 more sessions to close Stage-2.

8. **Modern Physics extended cluster (T45-T50) tightness analysis.** 6 topics, 111 atomics, **~32 bidirectional edges across 15 possible pairs = 2.13 edges/pair**. Lower than Modern Physics core (T45-T48 = 3.2/pair) because T49-T50 are application/engineering topics that look outward more (forward to non-existent T38 EM Waves anticipated; back to T42 TIR; back to T16 gravitation). **Pattern: core conceptual topics cluster tighter; applied/engineering topics radiate outward.** Strategic implication for Stage-5: cluster-internal authoring works best for core-conceptual topics; applied topics benefit from cross-cluster authoring (e.g., T50 should ship AFTER both T38 EM Waves AND T49 Semiconductor).

9. **Atomic-count refresh: 21-pilot mean = 26.0 (was 26.7); median = 26.** T49 = 20 atomics (above Modern-core mean), T50 = 17 (below). Modern Physics extended cluster mean: 18.5 atomics/topic — **most compactly catalogued cluster observed**. Confirms hypothesis that post-Newtonian topics cluster ~18-22 atomics each (cf. Mechanics topics often 26-33).

10. **Founder decisions: T49 = 7 (SE-G1..G7), T50 = 7 (CS-G1..G7).** 21-pilot modal stable at 7. Cognitive-error-prevention sub-category continues with: SE-G5 (transistor amplifier vs switch = 2 atomics to prevent active-vs-saturation confusion), SE-G4 (5 separate logic-gate atomics to prevent NAND ⊕ NOR conflation), CS-G3 (4 propagation atomics — ground/sky/space/satellite — to prevent frequency-band confusion). **Cognitive-error-prevention now accounts for ~30% of all founder decisions across the 21-pilot catalog set.** Stage-4 sub-category formalization recommended.

11. **Source-role triad in applied/modern physics:** HCV2 dominant for derivation (Ch.45 semiconductor + ext.Ch.47 comms). NCERT comprehensive for T49, **dropped post-2023 for T50** — first observed NCERT-divergence-from-state-curriculum. DCP carries problem-pattern density (rectifier circuits, antenna height numericals). Triad still holds with the caveat that NCERT 2023+ may keep dropping engineering applications — V2 authoring may need to lean more heavily on state-board syllabi for these topics.

12. **Next-batch options:**
    - **Option A: T18 Thermodynamics + T19 Kinetic Theory** — Thermodynamics chapter pair (long-deferred; both ~25-30 atomics; STRONG anchor likely via NCERT real-life-engine examples + Indian rail/auto industry).
    - **Option B: T35 EM Induction + T38 EM Waves** — closes E&M cluster middle; T38 also unlocks 3 back-edges from T50 propagation atomics (anticipated forward edges → real back-edges).
    - **Option C: T11 Newton's Laws + T14 Momentum/Collisions** — closes Mechanics cluster middle; both heavy IN-degree (T11 = 4, T14 = 1 so far) suggesting hub status.
    - **Option D: Stage-3 math-tools update sweep** — promote anticipated stubs to REQUIRED (`trig_product_to_sum_identities` triggered this session); register new stubs (`pythagoras_curved_earth`, `algebra_quadratic`, `relativistic_kinematics`); revalidate primitive cross-refs.
    - **Recommendation: Option B (T35 + T38)** — closes 3 forward-edges from T50 propagation atomics; opens classical-EM-to-modern-EM bridge; both topics expected STRONG anchor (Faraday's law + power grid + transformers; EM spectrum + ISRO communication satellites).

### After 19 pilots (2026-05-25 — Topics 12, 21, 36, 10, 13, 17, 30, 16, 31, 29, 34, 41, 42, 43, 44, 45, 47, 46, 48):

1. **Modern Physics core cluster (T45-T48) CLOSED.** All 4 topics — Atomic Models, Atomic Spectra, Dual Nature, Nuclei — now catalogued. Second complete cluster after Optics (T41-T44). 74 atomics across 4 topics (18+18+18+20). The interior triangle T45-T46-T47-T48 has ~19 bidirectional edges across 6 pairs (3.2/pair avg), vs Optics's ~17 edges across 6 pairs (2.8/pair avg). **Modern Physics is the most-interconnected 4-topic cluster observed.**

2. **First-use of `calculus_exponential_decay` math-tool primitive** — validates Stage-3 anticipated-stub strategy. The Stage-3 file pre-registered this primitive in Session 42 expecting T34 (RC), T44 (LC), T46 (radioactivity), T48 (radioactivity-real-use). T48 is the first to cite it, exactly matching prediction. **Stage-3 anticipated-stubs are paying off — when Stage-2 catalogs need a primitive, it already exists.**

3. **First-observed 100% triple-coverage topic: T48 Nuclei.** All 18 atomics in all 3 sources (NCERT + HCV + DCP) — first observed in 19 pilots. Confirms nuclear physics is a curricular core no source can omit. **Implication:** nuclear physics is the lowest-risk authoring topic — all 3 sources will support content development.

4. **First-observed STRONGER-than-STRONG anchor density: T48 Nuclei.** Anchors include BARC + Tarapur + Kakrapar + Kudankulam + Pokhran + ITER-India + IPR + AIIMS + Tata Memorial + PRL + Bhabha + Saha + AERB. **No previous topic has 10+ institutional anchors per atomic AND policy-relevant anchors AND healthcare anchors AND research anchors.** Recommend Stage-4 introduce **VERY-STRONG** sub-bucket (separate from STRONG) for topics with multi-strand institutional anchor density. Tentative VERY-STRONG: {T48}. Likely future additions: T49 Semiconductor (ISRO + electronic-industry anchors), T50 Communication Systems (BSNL + ISRO + Doordarshan).

5. **math-tools IN-degree at 32 (was 27).** T46 added 2 (binomial-expansion for wave-packet, calculus-derivative for de Broglie). T48 added 3 (exponential-decay, integration-basics, algebra-chain). At current 19-pilot/25-distinct-primitives ratio, by 44-pilot completion math-tools IN-degree forecast: ~75-90. Stage-3 file should be updated periodically as new primitives surface — e.g., `relativistic_kinematics_E_mc2_equivalence` is implicit in T48 but not yet a Stage-3 entry.

6. **Atomic-count refresh: 19-pilot mean = 26.7 (was 26.5); median = 26.** T46 = 18 (focused; cognitive-content-heavy), T48 = 18 (engineering + decay + Indian-anchor heavy). Modern Physics 4-topic distribution: T47=20, T45=18, T46=18, T48=18 — **remarkably uniform around 18-20 atomics/topic**. Cluster mean 18.5. Cluster total 74 atomics. **Modern Physics cluster is the most compactly-catalogued cluster yet** (Optics was 89 atomics across 4 topics, mean 22.25).

7. **Paired-batch density rule extended (19-pilot pattern):**
   - **Same-chapter intra-cluster pair**: 7-9 edges (T41↔T42 Ch.9, T43↔T44 instruments+wave, T45↔T47 Ch.12 atoms)
   - **Same-cluster non-same-chapter pair (Modern Physics-style)**: 4-6 edges (T46↔T47, T48↔T47, T46↔T48). Tighter than other clusters because cluster-internal coupling is strong but topics span chapters
   - **Same-cluster non-same-chapter pair (E&M-style)**: 5 edges (T29↔T34)
   - **Cross-cluster paired pair**: 2-3 edges (T17↔T30, T16↔T31)
   
   **Refined signal:** Modern Physics cluster pairs are uniformly higher-edge than E&M cluster pairs even when they cross chapters. The cluster-internal coupling for Modern Physics is denser than for E&M.

8. **Cumulative tally: 19 of 44 pilots = 43% complete.** Total atomics catalogued ~431+36 = 467 (was 431 at 17-pilot — T46+T48 added 36). Total nanos ~85 across all 19 pilots. Cross-topic edges 177. **Approaching 50% Stage-2 completion threshold.** At current cadence (10 pilots/session over 5 sessions), ~25 more pilots in ~12-15 more sessions to close Stage-2.

9. **Cluster closure pattern observed:** Optics closed in Session 41 (T41-T44, 4 topics); Modern Physics core closed in Session 44 (T45-T48). Both closures took 2 paired-batches each. **Strategic implication for remaining clusters:** Mechanics-leftovers (T1-T9, T14-T15, T18-T20 — many topics, less interconnected) will take longer per cluster-completion; E&M-leftovers (T32-T35, T37-T40 — 4-5 topics) and Modern-Physics-leftovers (T49-T54 — 6 topics) closer to Optics+Modern-core pattern.

10. **Founder decisions: T46 = 7 (DN-G1..G7), T48 = 7 (NU-G1..G7).** 19-pilot modal stable at 7. Cognitive-error-prevention sub-category continues: DN-G2 (3 observation atomics — wave-theory-fails standalone), DN-G4 (Einstein equation keystone standalone), NU-G3 (BE-per-nucleon as standalone organizing principle), NU-G4 (T_{1/2} vs τ split to prevent confusion).

11. **Source-role triad in Modern Physics confirmed:** HCV2 indispensable + NCERT comprehensive (covers ~85% of Modern Physics scope, up from ~60% estimated at 17-pilot — NCERT Ch.13 nuclei is exceptionally thorough) + DCP problem-pattern heavy. T48 100% triple-coverage shows nuclear physics is the strongest-coverage subdomain.

12. **Next-batch options:**
   - **Option A: T49 Semiconductor + T50 Communication Systems** — closes Modern Physics extended cluster, opens electronics applications. Both predicted STRONG/VERY-STRONG anchor (ISRO + Indian electronics industry). Likely small chapters (~15-18 atomics each).
   - **Option B: T18 Thermodynamics + T19 Kinetic Theory** — Thermodynamics chapter pair (long-deferred). Mechanics-Waves bridge. Likely larger chapters (~25-30 atomics each).
   - **Option C: T35 EM Induction + T38 EM Waves** — closes E&M cluster middle. Lenz's law + Maxwell + Hertz + EM spectrum. ~25-30 atomics combined.
   - **Recommendation: Option A (T49 + T50)** — natural continuation of Modern Physics flow; closes "applied modern physics" section; lower atomic-count expected = faster batch.

### After 17 pilots (2026-05-25 — Topics 12, 21, 36, 10, 13, 17, 30, 16, 31, 29, 34, 41, 42, 43, 44, 45, 47):

1. **Modern Physics cluster officially opened.** T47 Atomic Models + T45 Atomic Spectra both shipped. The cluster is the first to start AFTER the Stage-3 math-tools file existed, so both catalogs cite specific primitive IDs (e.g., `calculus_minmax`, `algebra_one_over_x_manipulation`) instead of generic `math-tools` terminators. **First test of post-Stage-3 cataloguing UX:** PASSES. Catalogues are cleaner; downstream V1 authoring can trace math-prereq resolution.

2. **T45 ↔ T47 = 9 bidirectional edges — DENSEST paired-batch yet observed.** Previous max was 7 (T41↔T42 and T43↔T44 Optics intra-cluster). Modern Physics intra-cluster pair beats Optics by 2 edges. **Pattern signal:** Modern Physics cluster is even tighter than Optics cluster — same chapter (NCERT Ch.12 covers both T47 + T45 in one chapter) AND tighter conceptual coupling (Bohr model EXISTS to explain spectra; spectra VERIFIES Bohr model). 4 forward T47→T45 (Bohr postulate + energy + level-diagram + Z-factor) + 1 back T45→T47 (validation-of-Bohr loop) + 4 cluster-bridge edges = 9 total.

3. **Refined paired-batch density rule (17-pilot pattern):**
   - **Same-chapter intra-cluster pair**: 7-9 edges (T41↔T42 = 7, T43↔T44 = 7, T45↔T47 = 9 — NCERT Ch.12 split)
   - **Same-cluster non-same-chapter pair**: 5 edges (T29↔T34 E&M, T10↔T13 Mechanics)
   - **Cross-cluster paired pair**: 2-3 edges (T17↔T30, T16↔T31)
   
   The "same NCERT chapter" predictor pushes paired-batch edge density to 7+. **Implication for Stage-5 V1 authoring sequencing**: prefer chapter-internal pairs; chapter-splits give the cheapest authoring economics.

4. **T46 Dual Nature emerges as the next downstream sink.** IN-degree = 5 (2 from T47 + 3 from T45). T46 was originally Session 41's deferred candidate (founder chose T45+T47 paired-batch over T46+T47); now T46 is the natural next paired-batch partner. **Sequencing recommendation:** T46 + T48 Nuclei (T48 IN-degree = 2: T47 distance-of-closest-approach + future T45 X-ray bridge) as next paired-batch. Closes the 4-topic Modern Physics cluster (T45–T48).

5. **math-tools IN-degree continues climbing: 27 (was 23).** T47 added 2 (calculus_minmax for orbit-radius minimization, series_binomial_expansion for relativistic corrections). T45 added 2 (algebra_one_over_x for series formulas, series_combinatorial_n_choose_2 for spectral-line count). **Stage-3 math-tools file (shipped Session 42) is doing its job**: new primitives can be cited directly without dangling.

6. **Atomic-count refresh: 17-pilot mean = 26.5 (was 26.6); median = 27.** T47 = 20 (below — atomic models is a focused historical-progression chapter), T45 = 18 (below — spectra is concentrated). Modern Physics cluster atomic distribution: T47 = 20, T45 = 18 — both below 17-pilot mean. **Pattern: post-Newtonian-mechanics topics tend to have smaller atomic counts** because the foundational machinery (Bohr orbit + photon emission) is reusable across many phenomena.

7. **Cluster-aware authoring estimate (Modern Physics):** T45+T47 = 38 atomics catalogued; T46+T48 likely +35-40 more; T49 Semiconductor +~25; T50-T54 +~30 (much smaller chapters). Modern Physics cluster expected ~130-150 atomics total. STRONG anchor density across the cluster (Indian-Nobel-bedrock: Raman, Saha, Bose, Bhabha) keeps authoring multiplier at 1.0×.

8. **Topic 47 ↔ Topic 36 bidirectional edge CLOSES a 13-pilot-old loop.** T36 Moving Charges A33 `bohr_model_atom` was flagged as a forward-bridge in Session 36; T47 now provides the back-edge (Bohr orbit-radius-derivation underlies T36 A33's magnetic-dipole-moment-of-revolving-electron). Matrix integrity verified — every forward edge will eventually find its back-edge as the catalog set grows.

9. **Source-role triad evolved in Modern Physics.** For T47+T45 catalogs, **HCV2 is dominant pedagogy source** (cleanest derivation chain: HCV eq 43.2 → 43.9 covers all Bohr physics; Ch.43 + Ch.44 together cover spectra + X-rays + laser). NCERT covers ~60% of Modern Physics scope (omits X-rays + laser). DCP carries problem-pattern density. **First-time-observed pattern:** for post-Newtonian topics, HCV is essential not merely strong — without HCV2, Modern Physics cluster cannot be authored.

10. **Anchor density: STRONG across both topics.** Spectroscopy is THE Indian-Nobel-bedrock topic (Raman 1930). Adding T45+T47 to STRONG bucket: now 9 of 17 = 53% STRONG, 1 MEDIUM (T34), 1 WEAK (T31), 6 un-rated. Stage-5 V1 priority queue authoring-time multiplier signal strong: STRONG dominates the catalog set.

11. **Founder decisions: T47 = 7 (AM-G1..G7), T45 = 7 (AS-G1..G7).** Modal continues at 7 across 17 pilots. The "cognitive-error-prevention" decision sub-category (raised in Session 41 Observation 11) shows again: AM-G2 (three Bohr postulates as 3 atomics), AM-G5 (Z-factor as standalone to combat forgetting), AS-G3 (Rydberg as standalone to combat per-series-memorization), AS-G5 (X-ray continuous-vs-characteristic split). 4 of 14 decisions in this batch are cognitive-error-prevention type. **Suggests this sub-category formalization is real signal; revisit at Stage 4.**

12. **Anti-plagiarism risk LOW.** Modern Physics catalogs avoid DCP/HCV figure-numbers; render own SVGs for energy-level diagrams + X-ray tube schematics + He-Ne laser construction.

### After 15 pilots (2026-05-25 — Topics 12, 21, 36, 10, 13, 17, 30, 16, 31, 29, 34, 41, 42, 43, 44):

1. **Optics cluster CLOSED.** All 4 Optics topics (T41 Mirrors, T42 Refraction/Lenses, T43 Optical Instruments, T44 Wave Optics) are catalogued. This is the **first complete cluster in the Stage-2 pilot run**. Total Optics-cluster atomics: 13 + 26 + 22 + 28 = **89**. Total Optics-cluster nanos: ~14 + ~30 + ~14 + ~10 = **~68**. Cluster-internal edges (T41↔T42 + T43↔T44 + T41/T42→T43/T44 + back-edges): **~30 edges** internal to a 4-topic cluster. Sanity-check signal: clusters genuinely exist in physics knowledge.

2. **Cluster-internal-discount hypothesis CONFIRMED.** Hypothesis raised at 13-pilot (Observation 2): Optics is a tighter cluster than E&M. After T43+T44: **22 of T43+T44's 22 net-new edges are within Optics or to math-tools** — only 3 spray outside (to T15, T17, T21, T45, T47). That's 86% intra-cluster + math-tools, 14% spray. Compare to E&M cluster: T30 OUT-edges sprayed ~50% to non-E&M (Mechanics via SHM bridge, Modern via Bohr bridge). **Implication for Stage-5 authoring sequence**: Optics cluster can be authored as a single coherent block (T41 → T42 → T43 → T44 in order); cluster-internal prereqs resolve internally without requiring other-cluster catalogs to ship first. Concrete saving: ~25-30% authoring time vs interleaving with E&M.

3. **T43 ↔ T44 = 7 bidirectional edges — tied with T41 ↔ T42 for densest paired-batch.** Both intra-cluster pairs hit the same 7-edge density. Compare: T29 ↔ T34 (E&M intra-cluster) = 5 edges, T17 ↔ T30 (cross-cluster Mechanics-E&M) = 2 edges, T10 ↔ T13 (Mechanics intra-cluster) = 5 edges, T16 ↔ T31 (cross-cluster Mechanics-E&M) = 3 edges. **Pattern signal**: paired-batch edge density tracks **cluster co-membership AND chapter adjacency**. Adjacent chapters in same cluster (T41–T42 same NCERT Ch.9; T43–T44 same instrument↔wave physics) → 7 edges. Same-cluster non-adjacent → 5. Cross-cluster → 2-3.

4. **math-tools IN-degree = 23. CRITICAL BLOCKER status maintained.** T43 added 2 (small-angle approximation reapplied; calculus for f_max/f_min). T44 added 3 (binomial approximation for YDSE path-diff; time-averaging cos² for intensity + Malus; small-angle for diffraction). Stage 3 math-tools file is now blocking ~25% of catalogued atomics in Stage-2 from being fully spec'd. Founder Topic-4 Session 40 recommendation upheld: **author Stage-3 math-tools file BEFORE next Stage-2 paired-batch**, or in tight parallel.

5. **Three-bucket anchor density continues to hold.** T43 = STRONG (Kavalur + Devasthal + GMRT + AIIMS + Indian Army periscope + Lenskart + AIIMS endoscope — 19/19 atomics anchorable). T44 = STRONG (monsoon rainbow + CBSE physics-practical YDSE + polaroid sunglasses + CD diffraction + GMRT + Hubble red-shift — 19/19 atomics anchorable). Updated tally: STRONG = {T10, T16, T30, T41, T42, T43, T44} = 7 of 15 pilots; MEDIUM = {T34} = 1; WEAK = {T31} = 1; un-rated (Mechanics early pilots) = 6. **Optics cluster is uniformly STRONG anchor** — possibly because optical phenomena (rainbow, sunglasses, mirrors, CDs) are visceral and universal in everyday Indian life. E&M topics are more variable (T29/T30 STRONG, T31 WEAK).

6. **T45 Atomic Spectra emerges as the next downstream sink** (IN-degree = 2: T42 A22 dispersion-into-spectra + T44 doppler-of-spectral-lines). Sequencing recommendation post-Optics: **T45 + T46 (Modern Physics: photoelectric + dual nature) paired-batch** to open the Modern Physics cluster. T47 (Atomic Models) also at IN-degree 2 (T36 Bohr + T44 wave-particle). Modern cluster opener candidates: T45 + T46, OR T45 + T47, OR T46 + T47.

7. **Atomic count: 15-pilot mean = 26.6 (down from 26.9); median = 27.** T43 = 22 (below — instruments topic is moderately small), T44 = 28 (on mean). Optics-cluster atomic distribution: T41 = 13 (smallest), T42 = 26, T43 = 22, T44 = 28 (largest). Cluster sum 89 atomics ÷ 4 topics = 22.25 mean per Optics topic. **Optics is slightly below the cross-topic mean of 26.6** — confirms intuition that Optics is a tighter, more focused subdomain (smaller chapters, more deeply interlinked).

8. **OUT-edge density per atomic: T43 = 10/22 = 0.45, T44 = 12/28 = 0.43.** Both above 15-pilot mean (~0.32). Optics OUT-density holds at ~0.45 across all 4 topics (T41 = 0.85 outlier, T42 = 0.54, T43 = 0.45, T44 = 0.43). **Optics is a high-OUT-density cluster** — every atomic refers to ~1 of 2 other atomics. Mechanical clusters: ~0.27.

9. **Cluster-aware authoring estimate refined.** For chapter-split intra-cluster pairs (T41+T42 = Ch.9 split, T43+T44 = instrument+wave-optics): mean atomic count is **~24 per topic** (89/4). For non-split topics: ~28-32. **Recommend Stage-5 V1 authoring queue use cluster-aware budget allocation**: 4 Optics topics × ~24 atomics × 1.0× anchor-multiplier = 96 atomic-equivalents to author in Optics block. Compare E&M cluster (T29+T30+T31+T34 catalogued): 14+30+26+28 = 98 atomics, but with mixed STRONG/MEDIUM/WEAK anchor → ~120 atomic-equivalents authoring time.

10. **Topic-numbering reconciliation pass deferred again.** Stage-4 reconciliation backlog now: (a) E&M topic IDs (T32/T33 vs T29/T30/T34); (b) Optics topic IDs (loose "T39/T40" Session 39 → matrix-canonical T41/T42); (c) Modern Physics topic IDs (T45/T46/T47 ordering across NCERT vs DCP vs HCV sequencing). Reconciliation can wait until Stage-2 hits 20+ pilots — not blocking.

11. **Founder-decision count: T43 = 7 (OI-G1..G7), T44 = 7 (WO-G1..G7).** 15-pilot modal stable at 7. Predictability holds. The OI-G2 "microscope and telescope are NOT one atomic" and WO-G4 "diffraction vs interference split" decisions are both *cognitive-error-prevention* decisions — a recurring theme. Stage-4 may formalize a sub-category of founder decisions = "split-for-cognitive-error-prevention" vs "split-for-pedagogy" vs "split-for-problem-pattern."

12. **Anti-plagiarism risk continues to assess as LOW.** Optics cluster catalogs avoid the DCP/HCV figure-numbering and verbatim-derivation-path issues. NCERT Ch.10 (wave optics) has a 60-word Feynman quote on diffraction-vs-interference that we'll reproduce with attribution (fair use).

### After 13 pilots (2026-05-25 — Topics 12, 21, 36, 10, 13, 17, 30, 16, 31, 29, 34, 41, 42):

1. **Optics cluster opener confirms the paired-batch design holds across clusters.** T41 ↔ T42 surfaces 7 bidirectional edges (4 from T41, 3 back from T42). This is in the middle of the observed paired-batch range: T29 ↔ T34 = 5 edges; T17 ↔ T30 = 2 edges; T16 ↔ T31 = 3 edges; T10 ↔ T13 = 5 edges. The Optics intra-cluster pair (same NCERT chapter split) sits at the dense end, as expected.

2. **The Optics cluster has a tighter internal dependency structure than E&M.** All T41 OUT-edges (except A12 → T6 and A1 → T44) stay inside Optics (T42 + T43 + T44). All T42 OUT-edges (except the math-tools terminators) stay inside Optics. By contrast, the E&M cluster sprays edges across to Mechanics (work-energy + SHM bridges). Hypothesis: Optics is a more self-contained chapter cluster in CBSE physics — fewer concept-borrows from outside. Implication for Stage-5: Optics topics can be authored in a single block once T41 + T42 + T43 + T44 are sequenced.

3. **Topic 43 Optical Instruments emerges as the new downstream sink.** IN-degree = 6 from T41 (2) + T42 (4). T43 hasn't been catalogued yet, but the matrix already reveals it's the natural next Optics-cluster topic. **Sequencing recommendation:** ship T43 + T44 as the next paired-batch (instruments + wave optics — both are downstream of T41+T42, both have 4-6 inbound edges from this batch). Anchor density: STRONG for T43 (NCERT Kavalur Cassegrain + Indian Army periscope) + MEDIUM/STRONG for T44 (Indian monsoon + classroom YDSE physics-practical).

4. **math-tools IN-degree at 18.** T41 added 2 (similar_triangles, small_angle_tan_theta). T42 added 3 (trig_identities for prism, 1/x algebra for lens equation, μ chain product rule). Stage 3 math-tools file urgency upgrade: from "BLOCKER for next batch" (11-pilot) to "**CRITICAL BLOCKER** — 5 more catalogs will push IN-degree past 25 and create unresolved-prereq fatigue across the catalog set." Trig-identities + small-angle-approximations + 1/x-algebra cluster recurs across mechanics + optics + atomic physics → estimated ~30+ atomics depend on this math-tools file once Stage-2 completes.

5. **Three-bucket anchor density model strengthened.** Both T41 and T42 = STRONG anchor (universal Indian phenomenology). With T41 + T42, all Optics-cluster catalogs to date are STRONG. The MEDIUM bucket (T34) and WEAK bucket (T31) remain singletons. Stage-5 V1 priority queue authoring-time multipliers (STRONG 1.0×, MEDIUM 1.2×, WEAK 1.5-2×) tracking signal is firming up.

6. **Atomic count clustering: 13-pilot mean = 26.9; median = 28; sd ≈ 6.** T41 = 13 (well below — because mirror-only content; T42 absorbs the chapter bulk), T42 = 26 (on mean). T41's low count is structural — paired-batch with T42 split the source chapter. Updated full-graph forecast: 44 × 27 ≈ 1190 atomics. **Cluster-aware estimate:** for clusters where chapter-split happens (Optics, possibly Modern Physics), pair-aggregated mean ~33-39 atomics per chapter-pair.

7. **OUT-edge density per atomic: T41 = 11/13 = 0.85, T42 = 14/26 = 0.54.** Both are above 13-pilot mean (~0.30). Optics is denser-edged than E&M and Mechanics. Likely explanation: Optics chapters share more concepts internally (sign convention, paraxial, magnification all cross-apply) than E&M chapters (which have distinct phenomenology — charge vs field vs current vs magnetism). Suggests Optics is a tighter cluster.

8. **Topic-numbering reconciliation flag deferred.** T41 + T42 catalogs use matrix-canonical numbering (not the loose "T39/T40" reference from Session 39 DISCUSSIONS). The Stage-4 reconciliation pass (flagged at 11-pilot) now has a second alignment item (Optics topic IDs) in addition to the T32/T33/T34 E&M reconciliation. Not blocking Stage-2 progress.

9. **Cluster closure plan emerging.** Optics-cluster after T41+T42: 50% complete (mirrors + refraction/lenses done; instruments + wave-optics + atomic-spectra still to do). Recommended remaining Optics sequence: **T43 (Instruments) + T44 (Wave Optics) as paired-batch** (both have IN-degree ≥ 4 from T41+T42; T44 also has IN-edges from T17 + T21). After T43+T44, the full Optics cluster (T41-T44) closes — bridge to Modern Physics (T45-T54) opens.

10. **Founder-decision count stable at 7.** T41 = 7 (RO-G1 ... RO-G7), T42 = 7 (RF-G1 ... RF-G7). 13-pilot modal count = 7 (was 6 through T31; T29 onwards has been 7 consistently). Pattern: catalogs in dense clusters (E&M + Optics) have higher decision counts than thinly-connected topics (T12 Friction with 4 decisions). Reflects more atomic-vs-nano boundary calls needed where many cross-edges exist.

### After 11 pilots (2026-05-25 — Topics 12, 21, 36, 10, 13, 17, 30, 16, 31, 29, 34):

1. **E&M cluster's foundation is now MAPPED.** T29 (Electric Charges) + T30 (Electrostatics: Gauss/dipole/field) + T31 (Capacitors) + T34 (Current Electricity) all catalogued. The cluster's full dependency DAG is now visible: T29 is the upstream root → T30 builds on it for field/Gauss/dipole → T31 + T34 are downstream applications. Together these 4 cover roughly 60% of E&M curriculum weight (Class 12 boards + JEE Mains).

2. **T29 ↔ T34 bidirectional edges = 5 — densest topic-pair edge count yet.** T29 → T34 (3 edges): A14 → wheatstone, A9 → Kirchhoff junction, A1 charge basics → current definition. T34 → T29 (2 edges): A2 drift_velocity → field/conductor, A21 wheatstone → field_inside_conductor. Paired-batch design fully validated — adjacent E&M atomics share more structure than the 1.5 edges-per-pair average across non-adjacent topic pairs.

3. **The T31 ↔ T34 RC bridge is now CLOSED both ways.** T31 catalog flagged the bridge from capacitor side (capacitor combinations ↔ resistor combinations); T34 catalog now closes it from the resistor/circuit side (A27 RC time constant requires capacitor C concept). Bidirectional bridge atomic A27 will be a high-priority V1 simulation candidate (Stage-5 input).

4. **math-tools IN-degree at 13.** T29 added 1 (vector_addition). T34 added 2 (linear_simultaneous_equations, exponential_decay). The exponential_decay primitive is new in the 11-pilot run — appears in T34 RC but will recur in T35 EM induction (LR circuits), T44 LC oscillations (damped), T46 radioactivity. **Stage 3 math-tools file urgency upgraded from "STRONGLY URGENT" to "BLOCKER for next batch."** Without it, ~17% of catalogued atomics have unresolved prereqs.

5. **Anchor density per CE-G6 finding: MEDIUM is the new third bucket.** Across 11 pilots: STRONG-anchor (T10, T16, T30) → MEDIUM (T34 current electricity has nichrome + lightning + 11kV transmission but no electroscope-equivalent) → WEAK (T31 capacitors). Three-bucket structure suggests Stage-5 priority queue weighting: STRONG = 1.0× authoring time, MEDIUM = 1.2×, WEAK = 1.5-2×. Refines the prior 2-bucket framing in [[feedback-anchor-density-varies-by-topic]].

6. **Atomic count clustering: 11-pilot mean = 28.0; median = 28; sd ≈ 4.5.** T29 = 14 (below — because T30 deliberately absorbed Gauss/dipole), T34 = 28 (on mean). Pattern strengthened: foundation/upstream topics tend slightly lower (T29 = 14, T16 = 28), application/hub topics tend higher (T36 = 33). Updated full-graph forecast: 44 × 28 ≈ 1230 atomics (unchanged from 9-pilot estimate).

7. **OUT-edge density per atomic increased slightly.** T29 = 8/14 = 0.57 (outlier — upstream foundations send many edges downstream). T34 = 9/28 = 0.32. 11-pilot average ≈ 0.27 (up from 0.25). Updated full-graph estimate: 44 × 28 × 0.27 ≈ 333 cross-topic edges; total graph edges including math-tools and atomic-internal ≈ 800-1000.

8. **Topic-numbering inconsistency surfaced — FLAG for founder.** The matrix originally referenced "T32 Current Electricity" (from earlier T30 catalog) but this pilot uses T34 per the v3 numbering. Similarly T29 is used here for Electric Charges separately from T30 Electrostatics, but earlier T30 catalog implicitly absorbed both. **Recommendation: Stage-1 chapter-commonality matrix needs a topic-numbering reconciliation pass before Stage-2 hits 20 pilots.** Not a blocker for current authoring but will become messy at 30+ pilots.

9. **E&M-cluster closure trigger.** With T29, T30, T31, T34 done, the E&M foundation tier is complete. T35 (EM induction), T36 (Magnetic effects of current already done), T37 (Magnetism & Matter), T38-T44 (AC, transformers, EM waves) are downstream and can be authored in any order once T29-T31-T34 are V1-shipped.

10. **Founder-decision count stable at 6-7.** T29 = 7 (CH-G1 through CH-G7), T34 = 6 (CE-G1 through CE-G6). 11-pilot range: 4-7, modal = 6. The CH-G7 anchor-strategy decision in T29 (counter-prediction to T31's weak anchor) and CE-G6 anchor-strategy decision in T34 (MEDIUM bucket introduced) both validate that anchor-strength assessment is now a standard founder-decision slot — recommend formalizing as Section J of the catalog template.

### After 9 pilots (2026-05-25 — Topics 12, 21, 36, 10, 13, 17, 30, 16, 31):

1. **TWO axis hubs are now THREE.** Topic 30 Electrostatics has pulled clear ahead with IN-degree 7 + OUT-degree 11. Topic 10 Circular Motion still at IN/OUT = 6/10. Topic 31 Capacitors emerges as a third hub-like topic with IN-degree 6 (purely downstream — heavy receiver, less heavy sender). **Pattern refinement:** axis-hub = high IN AND high OUT; "sink hub" = high IN, moderate OUT (T31's signature). Both are important V1 priority candidates but for different DAG reasons.

2. **NCERT-anchor density VARIES by topic — this is itself a finding.** Gravitation (T16) has the strongest anchor density yet observed (NCERT §8.11 "India's Leap into Space" inset alone has 9 distinct Indian-context items). Electrostatics (T30) is rich on everyday folk anchors. Capacitors (T31) is the FIRST topic in 9 pilots where NCERT anchor density is genuinely WEAK — capacitors are abstract circuit elements without inherent Indian-cultural framing. **Implication for Stage 5 priority queue:** weak-anchor topics may need synthetic anchors (Indian application contexts not from textbook — e.g., capacitor in tube-light starter, capacitor in fan regulator, RC time constant in camera flash). Authoring V1 simulations for weak-anchor topics requires extra anchor-mining work that strong-anchor topics get for free.

3. **Source-role triad confirmed for 9th consecutive pilot.** HCV = pedagogy + derivations; DCP = problem patterns; NCERT = anchors (when anchorable). The C-G7 caveat noted in T31 (NCERT-anchor weakness for capacitors) is the FIRST exception to the strength of the "NCERT carries anchors" rule — the role assignment still holds, but the anchor density variable is now known to vary widely.

4. **Math-tools IN-degree exploded to 10 from 6.** T16 alone added 3 math-tools refs (integration, binomial, partial-differentiation). T31 added 1. Stage 3 math-tools file is no longer optional — it's a blocker for ~14% of all atomic concepts across the 9 pilots. Recommendation upgraded to STRONGLY URGENT: founder should authorize Stage 3 math-tools authoring in parallel with continuing Stage 2 pilots.

5. **T30→T31 edge-count revision is a feature, not a bug.** T30's row originally surfaced 2 OUT-edges to T31; T31's row identified 4 prereqs upstream from T30. The matrix auto-aggregating logic corrected the count to 4. This validates the founder's design decision: "let both ends of each edge surface independently; converge by aggregation." Same pattern likely happened/will happen at other hub→downstream pairs (e.g., T13→T16, T17→T31).

6. **Atomic count clustering tightening.** T16 = 28 atomics, T31 = 26 atomics. Running 9-pilot mean = 28.0 (down slightly from 28.4 at 7 pilots). The "30 atomics per topic" estimate is holding well; some E&M-application topics (T31) trend slightly lower (~25-28) while foundation topics (T10, T30) trend higher (~32-33). **Stable forecast:** 44 topics × 28 atomics ≈ 1230 atomics in the full catalog; with nanos ≈ 2500-2700 entries.

7. **Per-atomic OUT-edge density holding ~0.25.** T16 = 7/28 = 0.25. T31 = 7/26 = 0.27. 9-pilot average = 0.25. Updated full-graph estimate: 44 × 28 × 0.25 ≈ 308 cross-topic edges. Adding math-tools and nano-level edges puts total graph edges in 700-900 range — a reasonable knowledge-graph scale.

8. **Found: an "anchor-weak topic" prediction signal.** T31 capacitor's weak Indian-context-anchor density correlates with: (a) abstract concept (no everyday physical experience triggers it), (b) lab-instrumental nature (not a phenomenon students see in daily life), (c) limited NCERT real-world examples within the chapter. Topics likely to share this signature: Topic 8 Units & Dimensions, Topic 19 Thermodynamic Cycles (theoretical), Topic 41 EM Waves (abstract), Topic 47-50 Modern Physics applications. **Hypothesis for Stage 5:** anchor-weak topics need bottom-up V1-priority adjustment — their authoring may take 1.5-2× the time of anchor-strong topics due to anchor-mining overhead.

9. **No "isolated" topics observed across 9 pilots.** Every catalog produces ≥ 7 cross-topic edges (T12's 2 was an outlier — re-check needed). Physics graph is uniformly dense — confirms knowledge-graph moat thesis at scale.

10. **Founder-decision count per catalog stable at 6-7.** T16 = 6 (G-G1 through G-G6). T31 = 7 (C-G1 through C-G7). Confirms modal-count = 6 pattern. Catalogs with 7+ decisions involve sub-cluster boundary judgments (T30 E-G6 dipole; T31 C-G3 dielectric collapse, C-G7 anchor-strategy).

### After 7 pilots (2026-05-25 — Topics 12, 21, 36, 10, 13, 17, 30) — kept for historical record:

1. **TWO axis hubs now confirmed** — Topic 10 Circular Motion (Mechanics) and Topic 30 Electrostatics (E&M). Both have IN-degree 5 AND OUT-degree ≥ 9. The "axis hub" pattern (high IN AND high OUT) is the structural signature of a topic that sits at a cluster's geometric center. Authoring sequence must respect: ship Topic 10 prereqs BEFORE Topic 10; ship Topic 30 prereqs BEFORE Topic 30. Both are mid-priority in DAG order, not early or late.

2. **T17 ↔ T30 paired-batch bridge confirmed empirically.** HCV2 Ch.29 W.Ex 19 (dipole in uniform E field → angular SHM, T = 2π√(ml/2qE)) is the **single most-cited Mechanics↔E&M concrete bridge in JEE physics**. The catalog format captured this naturally — it surfaced as a bidirectional cross-topic-ref AND as evidence for E-G6 founder decision. Pattern: paired-batch topics often have ONE strong concrete bridge plus several weaker analogies (LC oscillator, RC decay).

3. **Source-role triad now confirmed across BOTH clusters** (Mechanics + E&M). HCV1 + HCV2 = pedagogy; DCM1 + DCM2 + DCEM = problem-pattern typing; NCERT 11.1/11.2/12.1 = Indian-context anchors. The memory rule `feedback-source-role-triad` upgraded from "5-pilot, Mechanics-only" to "7-pilot, both clusters." Strong evidence that the rule generalizes across physics — but still NOT confirmed for Optics/Modern/Thermo, which are next.

4. **Electrostatics has the strongest Indian-context anchor density observed so far.** NCERT §1.1 opening alone delivers 4 distinct everyday Indian anchors: polyester saree spark, synthetic sweater shock, electric shock from car door / bus iron bar after sliding from seat, lightning during thunderstorm. This is the richest single-section anchor capture in 7 pilots. Hypothesis: E&M chapters have higher Indian-anchor density than Mechanics because the everyday phenomena (static, lightning, monsoon, dry-day combs) are universally Indian, while Mechanics phenomena (ladders, planks, projectiles) often have less culturally-specific framing.

5. **Founder-style decisions per topic now stable at 6–7.** Range across 7 pilots: 4 (T12), 6 (T10), 6 (T13), 6 (T17), 7 (T30). Modal count = 6. Catalogs with 7+ decisions tend to involve more granularity boundary judgments (T30's E-G6 dipole sub-structure, E-G5 four field-geometries, E-G1 Gauss-in-or-out are all subtle boundary calls).

6. **Atomic count clustering at ~30 holds.** Latest data: T17 = 29 atomics, T30 = 30 atomics. Running 7-pilot mean ≈ 28.4 atomics. **Highly stable signal that 30 atomics/topic is the natural per-topic density.** Forward projection: full 44-topic catalog ≈ 1250 atomics + ~1400 nanos ≈ 2700 unique concept entries. Matches the "thousands of atomics" estimate the founder originally framed.

7. **Per-atomic OUT-edge density slightly increasing.** T17 = 7/29 = 0.24. T30 = 9/30 = 0.30. Average across 7 pilots now 0.24 (up from 0.22 at 5 pilots). Hub topics + E&M topics tend to drag the average up. Updated full-graph estimate: ~44 × 30 × 0.24 ≈ 317 OUT-edges in the full matrix.

8. **No "isolated" topics observed.** Every pilot produces ≥ 2 cross-topic edges (T12 minimum = 2; T36 = 10). Physics is genuinely a connected graph — confirms "knowledge graph as moat" thesis structurally.

9. **Stage-2 → Stage-3 transition signal:** Of the 7 pilots, 5 have flagged Stage-3 follow-up reads as "strongly recommended" (T12, T13, T17, T30 plus the math-tools terminator file). Stage 3 is no longer optional — it's a mandatory parallel work-stream. **Recommendation: founder approves Stage-3 begin BEFORE all 44 Stage-2 catalogs ship, treating it as a continuous augmentation rather than a sequential follow-up.**

### After 5 pilots (2026-05-25 — Topics 12, 21, 36, 10, 13) — kept for historical record:

1. **Topic 10 Circular Motion confirmed as #1 hub** (5 incoming edges from 4 prior pilots). Authoring it in this batch closed 3 of 4 dangling references. Topic 10's own OUT-edges (10) make it the **highest-OUT-degree pilot too** — it depends on 10 other topics. Implication: Topic 10 is both heavily depended upon AND heavily depending — a true "axis" topic. Stage-5 V1 priority queue should place its prereqs (vector_resolution, newton_2nd_law) BEFORE Topic 10 in the authoring order.

2. **Topic 13 Work-Energy-Power emerges as #2 hub** (1 incoming edge so far, 9 outgoing). Predicted to receive 4+ more incoming edges once Topic 17 SHM, Topic 16 Gravitation, Topic 14 Momentum/Collisions, Topic 30 Electrostatics catalogs ship — they all reference work-energy theorem or potential energy.

3. **Topic 30 Electrostatics IN-degree growing** (4 incoming: 3 from Moving Charges + 1 from Work-Energy A30 central-force PE). Will likely reach 6-8 once SHM (T17 — no direct ref), Capacitors (T33), Current Electricity (T34) catalogs ship. **Stage-2 scheduling priority: ship T30 before EM cluster.**

4. **math-tools is the highest IN-degree node** (6 edges across 5 pilots). 5 distinct math primitives surfaced: calculus_minmax, partial_derivative, vector_cross_product, line_integral, calculus_basics_derivative, calculus_integration, dimensional_analysis. **Stage-3 deliverable mandatory** — without the math-tools reference file, ~10% of all atomic concepts have unresolved prereqs.

5. **Topic 17 SHM is a quiet hub** (3 incoming edges from Wave Motion, Topic 10, Topic 13 — all "bridges" type, not strict prereq). When authored, will likely receive more from Topic 22 Superposition + Topic 23 Sound + Topic 19 Thermodynamics. SHM authoring should follow once 5+ incoming edges accumulate.

6. **OUT-edges per topic stabilizing at 9-10 for hub topics.** Topic 10 = 10, Topic 13 = 9, Topic 36 = 10, Topic 21 = 8, Topic 12 = 2. **Pattern:** "hub" topics (foundational concepts referenced by many others) AND "rich" topics (waves, E&M, modern) have high OUT-degree. Foundation topics (Friction) have low OUT-degree — they're closer to terminator-leaves than hubs.

7. **Density per atomic:** Topic 10 = 10/33 = 0.30. Topic 13 = 9/33 = 0.27. Average across 5 pilots = 0.22. **Updated estimate for full 44-topic graph:** ~44 × 30 atomic × 0.22 ≈ 290 OUT-edges total, ~600+ atomic-to-atomic edges if internal Requires/Required-by are counted. Roadmap-grade scale signal.

8. **No "isolated" topics yet.** Every pilot generates 2+ cross-topic-refs. Physics is genuinely interconnected.

### Cluster structure (after 5 pilots — sharper picture):

- **Mechanics cluster** (Topics 1-16): Topic 10 Circular Motion = axis hub. Topic 13 Work-Energy = secondary hub. Topics 11 (Newton's Laws), 12 (Friction) feed into both. Topic 14 (Momentum/Collisions, not yet authored) will be downstream of Topic 13.
- **E&M cluster** (Topics 29-39, 40-44): Topic 30 Electrostatics = foundation hub. Topic 36 Moving Charges + Topic 38 EM Induction downstream. Topic 13's central-force PE (A30) bridges Mechanics ↔ E&M.
- **Waves cluster** (Topics 17, 21, 22, 23): Topic 17 SHM = foundation hub. Topic 21, 22, 23 downstream. Topic 13 spring-block oscillation (A23) bridges Mechanics ↔ Waves.
- **Modern Physics / Atomic** (Topics 45-54): Topic 47 Atomic Models reached from Topic 36 (Bohr-Sommerfeld) — first sighting.
- **Math-tools terminator**: Universal — referenced by every cluster.

### Confirmed structural patterns (now stable across 5 pilots):

- **HCV1 = pedagogy + derivations**; **DCM1 = problem patterns + edge cases**; **NCERT = motivational + Indian-context anchors**. This source-role triad is locked. New memory rule candidate.
- **6 founder-style decisions per catalog** is the modal count (range 5-8 observed).
- **Atomic count = 30 ± 5 per topic** stable across 5 pilots. Hub topics tend toward 33; specialized topics (Wave Motion = 25) trend lower.
- **NCERT-only sections (Appendix 6.1, Examples 5.10, etc.) are highest-quality Indian-anchor sources.** Don't paraphrase; capture verbatim phrases like "porter," "cyclist on level road," "rocket launch," "monsoon raindrop."

---

## How to use this matrix

**For founders / strategy:**
- "Show me topics that 5+ other topics depend on" → high-IN-degree column scan → those are the V1 must-authors.
- "Show me which 2 topics are MOST connected" → high cell-value pairs → these get authored as a batch.
- "Show me topics with zero connections to anything else" → fully empty column AND empty row → red flag, re-examine granularity.

**For Stage-5 priority queue:**
- DAG topological sort from this matrix produces the dependency-respecting authoring order.
- Topics with high IN-degree get authored first (prereqs for many).
- Topics with high OUT-degree but resolved IN-degree can ship anytime.

**For investor pitch:**
- "Our concept dependency graph has N atomics × M edges, captured per chapter from 3 authoritative sources." (When full: N≈3000, M≈5000+.)
- "Competitors selling chapter-by-chapter content don't have this structure. The structure is part of the moat — it determines what students see in what order."

---

*Initialized 2026-05-25 at the 3-pilot completion checkpoint. Updated to 5 pilots same day (Topics 10 + 13 added). Founder-approved Session 36 — alternative to the 946-pairwise sessions (which would have been noise).*

---

## Update log

| Date | Pilots added | New OUT-edges | New IN-edges noted | Cumulative edges |
|---|---|---|---|---|
| 2026-05-25 | T12, T21, T36 (initial 3) | 20 | T10 (4), T30 (3), math-tools (4) | 20 |
| 2026-05-25 | T10, T13 (paired-batch) | 19 (T10: 10, T13: 9) | T10 +1 (T13→T10), T17 +2, T16 +2, T30 +1, T11 +3 | 39 |
| 2026-05-25 | T17, T30 (paired-batch) | 16 (T17: 7, T30: 9) | T17 +1 (from T30 dipole-as-SHM), T30 +1 (from T17), T18 +1, T19 +1, T22 +1, T23 +1, T31 +3, T32 +2, T33 +1, T36 +1, T37 +1, T44 +2 | 55 |
| 2026-05-25 | T16, T31 (paired-batch) | 16 (T16: 7+3 math-tools, T31: 7+1 math-tools, +2 supplemental T30→T31 from edge-aggregation) | T6 +1, T10 +1, T11 +1, T13 +3, T16 +0 (T16 IN already counted as predicted), T17 +1, T29 +1, T30 +1, T31 +2 (T30-supplemental net new), T34 +1, math-tools +4 | 71 |
| 2026-05-25 | T29, T34 (paired-batch) | 20 (T29: 8+1 math-tools = 9, T34: 9+2 math-tools = 11) | T30 +3, T31 +1, T34 +2, T36 +1, T16 +1, T29 self-IN +5 (T31+T34 references absorbed), math-tools +3 | 91 |
| 2026-05-25 | T41, T42 (paired-batch — Optics opener) | 25 (T41: 9+2 math-tools = 11, T42: 11+3 math-tools = 14) | T41 +3 (back-edges from T42), T42 +4 (from T41), T6 +1, T36 +1 (anchor-only), T43 +6 (new sink), T44 +4, T45 +1, math-tools +5 | 116 |
| 2026-05-25 | T43, T44 (paired-batch — Optics closure) | 22 (T43: 8+2 math-tools = 10, T44: 9+3 math-tools = 12) | T43 +4 (forward from T44 back-edges), T44 +3 (from T43), T41 +1 (back: Cassegrain → spherical_aberration), T42 +4 (back: defects, lens-formula, TIR, dispersion/scattering), T15 +1, T17 +1, T21 +1, T45 +1, T47 +1, math-tools +5 | 138 |
| 2026-05-25 | Stage-3 math-tools file shipped (`stage-3-math-tools.md`) | 0 new cross-topic edges (math-tools terminators now resolved) | 19 primitive entries authored; 8 flagged as REQUIRED teaching units; 8 anticipated stubs pre-registered; CRITICAL BLOCKER (Sessions 39/40/41) RESOLVED | 138 |
| 2026-05-25 | T45, T47 (paired-batch — Modern Physics opener) | 24 (T47: 11+2 math-tools = 13, T45: 9+2 math-tools = 11) | T45 ↔ T47 = 9 bidirectional (DENSEST paired-batch yet), T46 +5 (anticipated sink), T48 +2 (anticipated sink), T36 +1 (back-edge closes 13-pilot-old loop), T30 +1 (back), T44 +1 (back), T42 +1 (back, weak), T18 +1 (anticipated), math-tools +4 (calculus_minmax, binomial-expansion, algebra-1/x, combinatorial-n-choose-2) | 162 |
| 2026-05-25 | T46, T48 (paired-batch — Modern Physics core closure) | 15 (T46: 7+2 math-tools = 9, T48: 3+3 math-tools = 6) | T46 ↔ T47 = 2 bidirectional (de Broglie + uncertainty back-edges close Session 43 forward), T48 ↔ T47 = 2 bidirectional (nuclear size closes Session 43 forward), T46 ↔ T48 = 1 (γ-decay photon), T49 +2 (anticipated semiconductor sink), T44 +1 (back), T45 +1 (back), T30 +1, T36 +1, T18 (future), Astronomy (future), math-tools +5 (FIRST use of `calculus_exponential_decay` from Stage-3 file; integration, algebra-chain, binomial, derivatives) | 177 |
| 2026-05-25 | T49, T50 (paired-batch — Modern Physics applied cluster closure) | 22 (T49: 8+2 math-tools = 10, T50: 10+2 math-tools = 12) | T49 ↔ T50 = 8 bidirectional (CE amplifier + rectifier + LED/photodiode + NAND/NOR forward; modulator + demodulator + optical-fibre triple-bridge back); T49 → T47 (back, energy bands ← Bohr orbitals); T49 → T46 (back, optoelectronics ← photoelectric); T49 → T30 (back, depletion-region potential); T49 → T34 (back, rectifier circuits); T50 → T42 (back, TIR for optical fibre); T50 → T44 (back, light as EM wave); T50 → T38 (forward × 3, propagation modes); T50 → T16 (back, geostationary orbit); T50 → T5 (back, antenna vector resolution); math-tools +4 (`calculus_exponential_decay` 2nd use, `algebra_quadratic` new, `trig_product_to_sum_identities` STUB → REQUIRED, `pythagoras_curved_earth` new stub) | 199 |
| 2026-05-25 | T35, T38 (paired-batch — E&M cluster middle closure) | 25 (T35: 8+2 math-tools+1 forward = 11, T38: 9+1 math-tools+3 closing-back+1 anticipated = 14) | T35 ↔ T38 = 6 bidirectional (Faraday → em_wave_basics back; energy_density magnetic→u_B equipartition forward+back); T38 closes 3 anticipated forward-edges from T50 (ground/sky/space wave propagation) — **3rd matrix-integrity validation in 3 sessions**; T35 → T36 (back, magnetic_field_solenoid + Lorentz force); T35 → T6 (back, area vector); T35 → T13 (back, energy conservation + work-energy); T35 → T7 (back, rotational angular velocity); T35 → T34 (back, LR circuit); T35 → T31 (forward via LC deferred); T38 → T30 (back, Gauss + electric flux); T38 → T31 (back, electric energy density); T38 → T36 (back, Ampère extended); T38 → T44 (back, polarisation bridge); T38 → T45 (back, X-ray band); T38 → T48 (back, γ-ray band); T38 → T14 (back, radiation-pressure momentum); T38 → T39 anticipated (AC chapter forward); math-tools +2 (`calculus_exponential_decay` 3rd use; `time_averaging_cos_squared` 2nd cross-cluster use) | 224 |
| 2026-05-25 | T37, T39 (paired-batch — E&M cluster FULL CLOSURE; Session 48) | 30 (T37: 11+0 math-tools-new+2 forward-closed = 13; T39: 12+1 new-stub+4 closing-back+2 intra-session = 17) | T37 ↔ T39 = 8 bidirectional (T37 hysteresis + soft-vs-hard + ferromagnetism + domain-structure → T39 transformer + choke + losses; T39 ↔ T37 reverse). **4 forward-edges closed:** T36 A31 (12-session lag, longest yet); EI-G6 (T35 LC deferral, 2-session lag); T37 → T39 intra-session (first observed); T39 ↔ T50 anticipated (3-session lag). T37 → T36 (×3 back: dipole + solenoid + torque); T37 → T35 (×2 back: hysteresis+eddy, diamagnetism+Lenz); T37 → T30 (Gauss contrast + dipole bridge); T37 → T17 (dipole-as-angular-SHM); T37 → T6 (area vector); T37 → T5 (vector resolution); T37 → T47 (Bohr orbit ← diamagnetism); T37 → T48 (anticipated NMR, V2). T39 → T35 (×4 back: ac_inductor + LC + transformer + losses); T39 → T34 (×3 back: Ohm + Kirchhoff + power); T39 → T31 (×2 back: cap + LC energy); T39 → T17 (LC ↔ SHM — most-cited cross-cluster analogy); T39 → T38 (radio tuning ↔ Hertz). math-tools +3 (**1 NEW STUB: `phasor_complex_representation`**; `time_averaging_cos_squared` 3rd use; `algebra_quadratic` 2nd cross-cluster use). **E&M cluster CLOSED at 9/10 topics** (T32/T33 numbering pending Stage-4). **5th 100% triple-coverage topic + first paired-batch with BOTH partners at 100%.** **4th VERY-STRONG topic (T39).** | 254 |
| 2026-05-25 | T15, T18 (paired-batch — Mechanics cluster CLOSER + Mechanical Properties cluster OPENER; Session 51) | 26 (T15: 3 outgoing + 9 back-edge closures + 4 intra-session bidirectional + 6 math-tools no-new-stubs = 18; T18: 2 outgoing + 3 back-edge closures + 4 intra-session bidirectional [dedupe] + 3 math-tools = 12; intra-session dedupe = 26 net) | T15 ↔ T18 = 4 bidirectional cross-cluster intra-session (FIRST cross-cluster paired-batch in many sessions; matches Stage-4 density rule 2-4 band). **11 ANTICIPATED FORWARD-EDGES CLOSED**: T36 → T15 (magnetic-dipole ← angular_momentum, **14-session lag — longest closed this session**); T21 CT2 + CT3 → T18 (Y/K → wave speeds, **17-18-session lag — LONGEST-LAGGED in matrix history**); T35 rotating-coil → T15; T37 quantised-L → T15; T47 Bohr-L → T15; T11/T13/T14 → T15 rotational analogs (1-session lag from S50); T11/T13 → T18 stress-strain + elastic-PE; T27 mean-free-path → T18 bulk-modulus. **Mechanics cluster CLOSED 10/10 — 6th cluster closure.** **Mechanical Properties cluster OPENED 1/2** (T20 remains). T15 = 92% triple-coverage (1 DUAL: torsional_pendulum); T18 = 100% — **streak resumes after T14 break**. T15 = STRONG (12 anchors × 7 strands); T18 = STRONG (11 × 7) — **9th + 10th data points confirming foundational-physics-plateaus-at-STRONG**. math-tools +0 (system_of_linear_equations_2var 3rd validation; all Elasticity primitives REQUIRED — **light-maintenance mode resumed**). Cognitive-error-prevention combined Session 51: 39% (9/23) — sustains 35-46% range across 6 consecutive sessions. **27-pilot decision-count: 4-way tie at 12 max** (T26, T11, T14, T15). | 342 |
| 2026-05-25 | T11, T14 (paired-batch — Mechanics middle hub-topic batch + Stage-4 consolidation half-session; Session 50) | 31 (T11: 4 outgoing + 13 back-edge closures + 6 math-tools incl. 1 new stub = 17 dedupe; T14: 4 outgoing + 8 back-edge closures + 5 math-tools no-new-stubs = 14; intra-session dedupe = 31 net) | T11 ↔ T14 = 8 bidirectional intra-session (6th chapter-adjacent density-band data point). **23+ ANTICIPATED FORWARD-EDGES CLOSED** — densest closure observed: T10 (Session 39) → T11 newton_second_law arbitrary direction; T12 (Session 35) → friction_force + newton-laws; T13 (Session 37) → work-energy → F=ma; T16 (Session 40) → orbital_velocity_centripetal; T17 (Session 38) → SHM spring force; T21 (Session 34) → wave_speed_string ← tension; T26 (Session 49) → first_law generalises work-energy; T27 (Session 49) → kinetic_theory_pressure ← Δp=2mv_x [closes via T14]; T29 (Session 39) → Coulomb's law F=ma analog; T34 (Session 41) → drift velocity F=ma; T35 (Session 46) → induced-emf force-on-charge; T36 (Session 36) → Lorentz force F=ma; T36 → pair-production momentum [via T14]; T38 (Session 46) → radiation-pressure momentum [via T14]; T47 (Session 43) → Rutherford scattering [via T14]; T47 → Bohr reduced-mass correction [via T14]; T48 (Session 44) → alpha-decay momentum + gamma recoil [via T14]. math-tools +1 (**1 NEW STUB: `system_of_linear_equations_2var` registered by T11; cross-domain validated by T14 same-session — fastest validation observed**). **8-topic 100% triple-coverage streak BROKEN at T14** (70% — 3 DUAL atomics: elastic_collision_2d + rocket_equation + reduced_mass; NCERT-not-covered, HCV+DCM full). Pattern: NCERT 2023 omits JEE-Advanced material in foundational chapters. **First pilot session under Stage-4-formalised criteria.** T11 = STRONG (6-7 strands); T14 = STRONG (7 strands — closest-to-VERY-STRONG foundational borderline). **Cognitive-error-prevention combined Session 50: 46% (11/24) — new session high.** **Stage-4 consolidation #1 delivered**: cognitive_error_target field active, anchor-bucket criterion formalised, IN/OUT-degree rankings refreshed at 27-pilot, atomic-vs-nano granularity stress-test validated (90% pass rate, no structural change). **Mechanics cluster 9/10 catalogued** (T15 Rotational Mechanics remains). | 316 |
| 2026-05-25 | T26, T27 (paired-batch — Thermodynamics cluster opener; Session 49) | 31 (T26: 13 atomics + 5 math-tools incl. 3 new stubs + 2 back-to-T13 + 2 weak-forward = ~12 dedupe; T27: 8 atomics + 6 math-tools incl. 3 new stubs + 2 weak-back + 1 forward-T18 = ~19) | T26 ↔ T27 = 7 bidirectional intra-session (5th data point confirming chapter-adjacent density band 6-9): U_macro ↔ KE_micro; Cp/Cv ↔ equipartition; γ ↔ dof-table; entropy ↔ S=k ln W; adiabatic ↔ PV=nRT; first-law ↔ pressure-derivation; isothermal ↔ ideal-gas. **1 forward-edge closed:** T13 Work-Energy → T26 first_law_atomic (anticipated since T13 Session 37; closed Session 49; ~12-session lag — second-longest forward-edge resolution after T36→T37). T26 → T13 (×2 back: first-law generalizes work-energy; W=∫P dV extends ∫F·dx). T26 → T48 weak (entropy → nuclear directionality). T26 → T39 weak analogy (Carnot inequality ↔ transformer η). T27 → T48 (back: MB-distribution analog for fission-KE). T27 → T38 (back: kinetic-pressure ↔ radiation-pressure analog). T27 → T18 forward (mean-free-path ↔ bulk-modulus microscopic, weak). T27 → T14 forward (elastic-collision-momentum, awaiting T14 catalog). math-tools **+6 NEW STUBS** (highest single-session count): T26 → `power_function_pv_gamma`, `pv_diagram_visualization`, `state_function_concept`; T27 → `gaussian_distribution`, `integration_of_gaussian`, `statistical_ensemble_averaging`. math-tools IN-degree 41 → 47 → 50. **6th + 7th 100% triple-coverage topics (longest streak in Stage-2: 7 consecutive).** **5th VERY-STRONG topic (T26 — second non-Modern-Physics VERY-STRONG); T27 STRONG (strand-diversity criterion clarified).** **Stage-4 numbering reconciliation #1 + #2 resolved inline** (T26 was informally "T18"; T27 was informally "T19"). **Cognitive-error-prevention founder-decision share at 36% (8/22)** — sustains 35-38% range over 4 consecutive sessions; formalisation now overdue. **Thermodynamics cluster opened, 2/3 catalogued** (T-thermal-properties Ch.11 remaining). | 285 |
| 2026-05-25 | T20, T25 (paired-batch — Mechanical Properties cluster CLOSER + Thermodynamics cluster CLOSER = DOUBLE CLUSTER CLOSURE; Session 52) | 26 (T20: 2 outgoing back-edge + 1 cross-cluster density-half + 2 intra-cluster T18 + 4 intra-session bidirectional + 5 math-tools no-new = 14; T25: 3 back-edge + 4 intra-session bidirectional [dedupe] + 1 T38 closure + 6 math-tools incl. 1 new stub = 12; intra-session dedupe = 26 net) | T20 ↔ T25 = 4 bidirectional cross-cluster intra-session (2nd consecutive cross-cluster pair at exactly 4 edges; 9th data point in Stage-4 density rule). **6 ANTICIPATED FORWARD-EDGES CLOSED**: T11/T13 → T20 (Newton + Work-Energy bridges); T21 CT2 density-half → T20 (**18-19-session lag — longest-active density-half closure**); T26 Cp/Cv → T25 specific-heat (operational form); T27 microscopic-T → T25 macroscopic-T scale; T38 thermal-radiation → T25 Stefan-Boltzmann + Wien blackbody source. **DOUBLE CLUSTER CLOSURE — Mechanical Properties cluster CLOSED 2/2 + Thermodynamics cluster CLOSED 3/3 = 7th + 8th cluster closures.** First-observed simultaneous double-closure session. **TWO VERY-STRONG topics in SAME SESSION** — first observation: T20 (13 anchors × 8 strands; first foundational-mechanics VERY-STRONG); T25 (14 × 9; 4th non-Modern-Physics VERY-STRONG). T20 + T25 both **100% triple-coverage** — streak extends to 3 consecutive (T18 → T20 → T25). math-tools +1 (**1 NEW STUB: `power_function_T_fourth`**; `calculus_exponential_decay` validated for 5th time — most-validated Stage-3 primitive). math-tools IN-degree 51 → 52. Cognitive-error-prevention combined Session 52: 46% (11/24) — tied for session-high (with Session 50). **33-pilot decision-count: 6-way tie at 12 max** (T26, T11, T14, T15, T20, T25). **All 8 major clusters CLOSED/NEAR-CLOSED at 75% checkpoint.** | 368 |
| 2026-05-25 | T19, T22 (paired-batch — Waves middle cluster OPENER + middle; Session 53) | 26 (T19: 4 back-edge closures + 6 intra-session bidirectional + 3 forward-extends T38/T44/T46 + 6 math-tools no-new = 14; T22: 2 back-edge closures + 6 intra-session bidirectional [dedupe] + 1 cross-cluster T44 + 2 forward to T23 + 6 math-tools no-new = 12; intra-session dedupe = 26 net) | T19 ↔ T22 = 6 intra-cluster chapter-adjacent bidirectional (same-NCERT-Ch.14 split — 7th intra-cluster density-band data point; matches T41↔T42 = 7 + T26↔T27 = 7 same-chapter-split pattern). **5 ANTICIPATED FORWARD-EDGES CLOSED**: T11 → T19 wave_speed_string ← F=ma; T17 sinusoidal-solution → T19 (Session 38 forward, 15-session lag); T17 SHM-at-fixed-point → T22 (Session 38, 15-session lag); T13 → T19 wave-energy ← W-E; **T21 CT5/CT6 → T19/T22 (Session 33 forward, ~20-session lag — NEW LONGEST-LAG CLOSURE in matrix history, beating T21 CT2/CT3 at 18-19-session lag closed S51-S52).** T19 → T38 + T44 + T46 forward-extends (wave-equation-bridges-to-EM/optical/de-Broglie). T22 ↔ T44 cross-cluster bidirectional (wave-interference YDSE mechanism reused). **Waves middle cluster OPENED (9th major cluster) — 2/3 catalogued; T23 Sound Waves remains.** T19 + T22 both 100% triple-coverage — **streak extends to 5 consecutive** (T18 → T20 → T25 → T19 → T22; longest 100% streak ever). T19 = STRONG (11 × 7 strands); T22 = STRONG (12 × 7 strands) — **11th + 12th foundational-physics STRONG data points**. math-tools +0 (`time_averaging_cos_squared` 4th-validated — now tied with `calculus_exponential_decay` as most-validated Stage-3 primitive; light-maintenance now 4 consecutive sessions). Cognitive-error-prevention combined Session 53: 41% (9/22) — sustains 35-50% range over 8 consecutive sessions. **All 9 major clusters CLOSED/NEAR-CLOSED at 80% checkpoint.** | 394 |
| 2026-05-26 | T1, T4 (FINAL straggler-pair — STAGE-2 COMPLETE at 44/44; Session 58) | ~13 (T1: 2 intra-session + 5 weak conceptual back-edges + 1 T2 = ~3 net new; T4: ~9 outgoing applies-edges + 2 intra-session [dedupe] = ~10 net new; net ~13) | **STAGE-2 COMPLETE — 44 of 44 = 100%.** T1 ↔ T4 = 2 weak intra-session edges (LEAST-connected straggler pairing: conceptual-umbrella vs procedural-lab). **T1/T4 BRACKET THE DAG AT ITS EXTREMES**: **T1 = conceptual-UMBRELLA SOURCE** (empty Requires; resolves 5 weak conceptual back-edges into T11/T12/T13/T14/T16/T36/T48 — all-contact-forces-are-EM + conservation-is-symmetry-rooted + the-4-fundamental-forces); **T4 = application-SINK / terminal leaf** (richest straggler Requires — ~9 outgoing to T2/T3/T6/T17/T18/T33/T34/T42; ZERO incoming). Full graph mapped: ROOTS (T2/T3/T5) → CORE (39) → CEILING (T1) + FLOOR (T4). **COVERAGE TAXONOMY COMPLETE — 5 mechanisms**: TRIPLE / NCERT-OMITTED (T8/T14/T15) / NCERT-DELEGATED (T3) / **DCM-OMITTED (T1 — JEE-problem book skips qualitative intro)** / **DCM-DOMINANT (T4 — JEE Experimental-Skills unit; only DCM dedicated)**. T1 = DUAL/DCM-OMITTED, **WEAK (4 × 3, 2nd WEAK)**, smallest atomic-count + lowest simulatability + lowest math-content of the run, 1 V1 atomic (fundamental-forces). T4 = JEE-extra/DCM-DOMINANT, **MEDIUM (7 × 3, 3rd MEDIUM)**, application-sink, 1 V1 atomic (graph-based-constant-determination). math-tools +0 (**light-maintenance FINAL streak 9 consecutive sessions; both pilots zero-stub**). IN-degree HELD at 52 (pending Stage-4 re-homing). Cognitive-error combined Session 58: 35% (6/17) — framing/process errors. **Final anchor distribution: 9 VS / 27 S / 3 M / 2 W (20% VS, 82% STRONG+).** 18 total 100%-coverage topics. **Final tally: ~705 atomics, ~424 nanos, ~512 edges. NEXT: Stage-4 FINAL sweep (this session) → Stage-5 outcome-mapping / V1 priority queue.** | 512 |
| 2026-05-26 | T2, T3 (paired-batch — NCERT-intro DAG-ROOT foundation stragglers; Session 57) | ~12 (T2: 4 intra-session bidirectional + 3 outgoing math-tools + ~8 ABSORBED dimensional_analysis/unit_analysis terminators [reclassification, not new] = ~3 net new; T3: 4 intra-session [dedupe] + 1 calculus_minmax + ~10 ABSORBED calculus/small-angle/binomial teaching-units [reclassification] = ~2 net new; net new ~12) | T2 ↔ T3 = 4 bidirectional intra-session (foundation-intro **straggler-pair**, NOT a cluster — cluster density sub-rules do NOT apply; cross-link band 2-4 → 4 in-band). **DAG-ROOT CAPSTONE: T2 + T3 + T5 are the ROOT NODES of the physics-knowledge DAG** — highest IN-degree, near-zero OUT-degree; authored LAST because every prior topic silently ASSUMED them. **T2 ABSORBS dimensional_analysis + unit_analysis (~8 references); T3 ABSORBS calculus_derivative/integration + small-angle + binomial teaching-units (~10 references); T3 DEFERS vectors to T5.** Math-tool terminators do NOT dangle — they resolve into T2/T3/T5. **Direct answer to the IIT-professor knowledge-graph question.** **NEW COVERAGE CLASS: NCERT-DELEGATED** (T3 ~50% — NCERT hands math to the Math syllabus; distinct from T8's NCERT-OMITTED). T2 = 100% (18th 100% topic; streak T9→T2 = 2); T3 BREAKS streak (delegation). T2 = STRONG (11 × 6, 26th foundational STRONG); **T3 = MEDIUM (6 × 4, 2nd MEDIUM topic — confirms abstract-foundation-anchors-weakly with T34/T31)**. math-tools +0 (**light-maintenance NEW LONGEST at 8 consecutive sessions; T2 + T3 both zero-stub; ~14 terminators flagged for Stage-4 re-homing to T2/T3/T5**). IN-degree HELD at 52. Cognitive-error combined Session 57: 45% (9/20) — sustains foundation-topic high band; **foundation-topic hypothesis confirmed a final time** (conventions/mental-models, not computation). 42-pilot decision-count: 7-way tie at 12 max unchanged. **Stage-2 at 95%; Session 58 (T1 + final straggler) = COMPLETE → trigger 44-pilot Stage-4 final sweep.** | 499 |
| 2026-05-26 | T8, T9 (paired-batch — Kinematics-formalisation cluster CLOSER = ALL 10 CLUSTERS COMPLETE; Session 56) | 35 (T8: 4 back-edge closures + 4 intra-session bidirectional + 7 math-tools no-new + intra-cluster T6/T7 laid = 13 dedupe; T9: 5 back-edge closures + 4 intra-session bidirectional [dedupe] + 6 math-tools no-new = 9 dedupe; net = 35) | T8 ↔ T9 = 4 intra-cluster cluster-closer bidirectional (BELOW 6-9 band — **2nd cluster-closer-below-band confirmation** after T22-T23 = 4; promote to established sub-rule). **9 ANTICIPATED FORWARD-EDGES CLOSED**: T8 closes 4 (T7-intra 1-session + T10-weak + T13 19-session + T14 5-session + T16-weak); T9 closes 5 (**T10-KEY 17-session-lag centripetal-force ← a_c** + T15 5-session + T16 16-session + T17 18-session + T36 20-session). **T9 closes the KEY T10 dependency** — T10's entire centripetal-FORCE discussion assumed circular-kinematics; T9 supplies it. **KINEMATICS-FORMALISATION CLUSTER CLOSED (4/4 with T5) — ALL 10 CLUSTERS COMPLETE.** T8 = 80% triple-coverage (**streak BROKEN at 8** — projectile-on-incline HCV+DCM-only NCERT-omitted JEE-Advanced); **T8 = VERY-STRONG (13 × 8 strands — 9th VERY-STRONG, FIRST Kinematics-cluster VERY-STRONG, dual defence+sports anchoring; share rises to 23%)**. T9 = 100% (17th 100% topic; streak resets). T9 = STRONG (10 × 6 strands — 25th foundational-physics STRONG). math-tools +0 (**light-maintenance NEW LONGEST STREAK at 7 consecutive sessions; ALL 4 Kinematics pilots zero-stub — Stage-3 file fully anticipated the cluster**). Cognitive-error-prevention combined Session 56: 45% (9/20); **Kinematics cluster final mean (T6+T7+T8+T9) = 48.5% — DENSEST-misconception cluster in Stage-2**. 40-pilot decision-count: 7-way tie at 12 max unchanged. **Stage-2 at 91%; closure within 1-2 sessions (target S57-58 holds).** | 487 |
| 2026-05-26 | T6, T7 (paired-batch — Kinematics-formalisation cluster OPENER; Session 55) | 38 (T6: 8 back-edge closures + 8 intra-session bidirectional + 7 math-tools no-new = 15 dedupe; T7: 2 back-edge closures + 1 forward to T8 + 6 weak back-edges + 8 intra-session bidirectional [dedupe] + 7 math-tools no-new = 9 dedupe; intra-session bidirectional counted once = 38 net) | T6 ↔ T7 = 8 intra-cluster chapter-adjacent bidirectional (NCERT Ch.3→Ch.4 adjacent split — 9th density-rule data point, upper-middle of 6-9 band; matches T11↔T14 = 8 + T37↔T39 = 8). **10 ANTICIPATED FORWARD-EDGES CLOSED — NEW SINGLE-SESSION HIGH**: T6 closes 8 (T11/T12/T13/T14/T15/T17/T19/T21 — **single-largest back-edge-closure topic in matrix history**); T7 closes 2 (T10 16-session-lag + T11-second). **NEW LONGEST-LAG closure: 22 sessions** (T21 Session 33 → T6 wave_velocity ← velocity-definition; beats prior 20-session record). **Kinematics-formalisation cluster OPENED (10th + final cluster) — 2/4; T8 + T9 remain.** T6 + T7 both 100% triple-coverage — **streak extends to 8 consecutive (T18 → T20 → T25 → T19 → T22 → T23 → T6 → T7) — NEW LONGEST 100% STREAK EVER**. T6 = STRONG (11 × 7 strands); T7 = STRONG (10 × 6 strands) — **23rd + 24th foundational-physics STRONG data points**. math-tools +0 (**light-maintenance NEW LONGEST STREAK at 6 consecutive sessions**; all kinematics primitives pre-registered REQUIRED — Stage-3 file fully anticipated the cluster 6 sessions early). Cognitive-error-prevention combined Session 55: **52% (11/21) — NEW SESSION-HIGH** (T6 = 55% single-topic high; T7 = 50%); **Kinematics cluster DENSEST-misconception set (mean 52.5%)**. 38-pilot decision-count: 7-way tie at 12 max unchanged. **All 10 clusters now opened/closed at 86% checkpoint.** | 452 |
| 2026-05-25 | T23 (single-topic — Waves middle cluster CLOSER; Session 54) + Stage-4 Sweep #2 half-session | 20 (T23: 4 back-edge closures T26/T27/T18/weak + 5 intra-cluster bidirectional with T19 + 4 intra-cluster bidirectional with T22 + 2 contrast bridges T38 + 1 cross-cluster weak T44 + 7 math-tools no-new; intra-cluster bidirectional counted once each = 20 net) | T22 ↔ T23 = 4 intra-cluster chapter-adjacent bidirectional (NCERT Ch.14→Ch.15 adjacent split — **BELOW 6-9 band**; **NEW SUB-PATTERN observed**: cluster-closer pair (T22-T23 = 4) has fewer edges than cluster-opener pair (T19-T22 = 6) when middle-topic carries bridging weight; flag for Stage-4 cumulative observation). T19 ↔ T23 = 5 intra-cluster bidirectional (within band). Full 3-topic Waves middle cluster intra-cluster edges: **15** (6+4+5). **4 ANTICIPATED FORWARD-EDGES CLOSED**: T26 → T23 (Laplace γP/ρ ← adiabatic process, 5-session lag from S49); T27 → T23 (v_sound = √(γRT/M) ← ideal-gas + γ-ratio, 5-session lag from S49); T18 → T23 (v_sound in liquids/solids ← Y + K, 4-session lag from S50); weak-T17 indirect SHM-at-fixed-point. T23 ↔ T38 contrast bridge (mechanical-Doppler medium-frame vs EM-Doppler Lorentz-invariant — explicit contrast). **WAVES MIDDLE CLUSTER CLOSED 3/3 (9th major cluster). All 9 major clusters now CLOSED at 82% checkpoint.** T23 = 100% triple-coverage — **streak extends to 6 consecutive 100% topics (T18 → T20 → T25 → T19 → T22 → T23) — NEW LONGEST 100% STREAK EVER**. **T23 = VERY-STRONG (14 × 9 strands — first Waves-cluster VERY-STRONG; 8th VERY-STRONG topic; share rises to 22%).** math-tools +0 (`time_averaging_cos_squared` 5th-validated — **now SOLE most-validated Stage-3 primitive** passing `calculus_exponential_decay`; **light-maintenance NEW LONGEST STREAK at 5 consecutive sessions**). Cognitive-error-prevention Session 54: 42% (5/12) — Waves cluster mean 41% across 3 catalogs. **Stage-4 Sweep #2 delivered**: cross-pilot cognitive-error-prevention index file authored; 9 un-bucketed topics rated to STRONG; T32/T33 numbering reconciled (T32 = DC-network-laws, T33 = Electrical-instruments — promote at V1). **All 7 of 7 Stage-4 backlog items now CLOSED across Sweeps #1+#2.** 36-pilot decision-count: **7-way tie at 12 max**. | 414 |
