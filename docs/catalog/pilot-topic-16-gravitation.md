# Pilot Topic 16 — Gravitation

**Cluster:** Mechanics (NCERT Class 11)
**Source confirmation:** NCERT 11.1 Ch.8 "Gravitation" (book p.183-202, 12 sections, full chapter incl. India's Leap into Space box) | DCM2 Ch.13 "Gravitation" (book p.209-228, §13.1-13.6 captured, full chapter is §13.1-13.10) | HCV1 Ch.11 "Gravitation" (book p.190-209, §11.1-11.5 captured, full chapter is §11.1-11.13)
**Triple-coverage status:** Confirmed.
**Author session:** 2026-05-25 (continuation from T17+T30 paired-batch).

---

## Founder Decisions Applied (this catalog)

| ID | Decision | Rationale |
|---|---|---|
| G-G1 | Two-body radial gravity = 1 atomic (`newton_law_of_gravitation`). Extended-body integrations (rod, ring, shell, solid sphere) become DRILL-DOWNs under it, NOT separate atomics. | Same physical law; integration is technique not new physics. DCM2 §13.2 "Extra Points to Remember" enumerates these as conditions of one formula, not new laws. |
| G-G2 | Variation of g (height / depth / shape / rotation) → 4 separate atomics, one per cause. | Each cause has distinct physical mechanism + distinct exam problem class. DCM2 §13.3 treats them as 4 sub-sections; NCERT §8.6 collapses height+depth but adds rotation in §8.5. Splitting honors mechanism diversity. |
| G-G3 | Field strength E (vector) and potential V (scalar) → 2 separate atomics, NOT one "field-and-potential" mega-atomic. The 5-shape variations (point / solid-sphere ext / solid-sphere int / shell ext / shell int / ring on axis) become NANOs under each. | HCV1 §11.4-11.5 and DCM2 §13.4-13.5 are pedagogically separate (scalar vs vector quantities, different physical meanings). 5×2=10 nanos manageable; 1 mega-atomic with 10 sub-cases unworkable. |
| G-G4 | Kepler's 3 laws → 1 atomic (`keplers_three_laws`) with 3 supporting nanos (one per law). Don't split into 3 atomics. | Empirical/historical bundle. NCERT §8.2 and DCM2 §13.10 both teach them together. Splitting would lose the conservation-of-angular-momentum thread that ties law-of-areas to gravitation being a central force. |
| G-G5 | Satellite mechanics → 4 atomics: `orbital_velocity`, `time_period_satellite`, `escape_velocity`, `total_energy_orbiting_satellite`. NOT one "satellites" mega-atomic. | DC Pandey M2 §13.9 has distinct problem patterns for each. NCERT §8.8 (escape) and §8.10 (energy) are physically separable. JEE problems test them in isolation. |
| G-G6 | Real-world anchor priority = NCERT §8.11 "India's Leap into Space" inset box. Aryabhatta satellite (1975), ISRO Sriharikota (SHAR), INSAT for telecom, IRS for remote sensing, GSAT-1 (2001 geostationary launch test), NRSA Hyderabad, PRL Ahmedabad, Rakesh Sharma (1984 first Indian astronaut). | Highest-density Indian-context anchor observed in any chapter so far across 8 pilots. NCERT explicitly Indianizes the application chapter; HCV1 + DCM2 have zero comparable content. Source-role triad once again validated: NCERT = anchors. |

---

## A — Topic identity & boundary

**What's in:** Newton's law of universal gravitation, gravitational field strength + potential of various mass distributions, Earth-bound g and its variations, gravitational PE (constant-g approx and general -GMm/r form), Kepler's laws, satellite motion (orbital velocity, time period, escape velocity, total energy), geostationary vs polar orbits, weightlessness.

**What's out:** General relativity, non-Newtonian / strong-field corrections (out of scope for Class 11/JEE). Tides (mentioned in DCM2 only briefly; not triple-covered; deferred). Equivalence principle (NCERT mentions "g independent of m" as observation, doesn't formalize — deferred).

**Boundary with T17 SHM:** Pendulum period uses g but pendulum atomic lives in T17. Gravity here is just an input for that atomic.
**Boundary with T13 Work-Energy:** Gravitational PE for constant-g case (`U = mgh`) was introduced in T13 as a specific conservative-force PE. Here we generalize to `U = -GMm/r` and re-derive `mgh` as a `h << R` limit.
**Boundary with T30 Electrostatics:** NCERT §2.1 explicitly notes Coulomb's law and Newton's gravitation are both `1/r²` conservative forces — pedagogically parallel. Bidirectional cross-reference (see T30 catalog A28).

## B — Source-cluster snapshot

| Source | Sections captured | Role observed |
|---|---|---|
| NCERT 11.1 Ch.8 | §8.1-8.12 (full) + summary + India's Leap into Space inset | **ANCHORS** — Aryabhatta, ISRO, INSAT, GSAT, IRS, SHAR, NRSA, PRL, Rakesh Sharma; also: apple tree, Tycho Brahe data table, moon's centripetal acceleration |
| DCM2 Ch.13 | §13.1-13.6 captured (intro, Newton's law, g variations, field, potential, E-V relation) | **PROBLEMS** — typed problem classes (point-mass arrays at vertices of polygon, hexagonal mass at centre, mass + rod integration, ring-sphere axial config, neutral-point-between-two-masses) |
| HCV1 Ch.11 | §11.1-11.5 captured (intro, G measurement, PE, potential, calculation of potential for ring/shell/sphere) | **PEDAGOGY** — Cavendish torsion-balance method derivation (`G = kdr²/(4MmlD)`), first-principles derivation of `V = -GM/r` from `dU = -F·dr` integral, shell-theorem derivation by integration over rings |

Source-role triad CONFIRMED for 9th time (pilots 12 / 21 / 36 / 10 / 13 / 17 / 30 / 16 — now 8 actually if T16 just completed; still all-mechanics + E&M cross-cluster).

## C — Granularity test

**Atomic count:** 28 atomics.
**Nano count:** ~32 nanos (parent-bound).
**Atomic-vs-nano boundary holds?** YES, with the G-G3 splitting decision (E vs V as two atomics, shape variants as nanos) which kept atomic count manageable.

## D — Atomic + Nano catalog

D.1 — Newton's law of gravitation (foundations)

| ID | Concept | Type | Sim? | In repo? | Requires | Required-by | Notes |
|---|---|---|---|---|---|---|---|
| A1 | newton_law_of_gravitation | atomic | ✅ | — | [vector_resolution, inverse_square_concept_from_T30] | [acceleration_due_to_gravity, gravitational_field_strength, gravitational_PE_general] | `F = Gm₁m₂/r²`, central + conservative + medium-independent. The diamond seed. |
| ↳ N1.1 | force_between_two_point_masses | nano | ✅ | — | [A1] | [A1] | DCM2 Fig 13.1 |
| ↳ N1.2 | force_between_two_spherical_bodies | nano | ✅ | — | [A1, shell_theorem_external] | [A1] | DCM2 Fig 13.2; shell theorem makes this identical to point-mass |
| ↳ N1.3 | force_between_sphere_and_rod_integration | nano | ✅ | — | [A1, integration_basics] | [A1] | DCM2 Fig 13.4 + Example 13.5; ∫dF over rod length |
| ↳ N1.4 | superposition_polygon_vertex_masses | nano | ✅ | — | [A1, vector_resolution] | [A1] | DCM2 Examples 13.2/13.3/13.4 hexagon/pentagon/square |
| A2 | gravitational_constant_G | atomic | ✅ | — | [A1] | [orbital_velocity, escape_velocity, total_energy_orbiting_satellite] | G = 6.67×10⁻¹¹ N·m²/kg²; measured by Cavendish torsion balance |
| ↳ N2.1 | cavendish_torsion_balance_method | nano | ✅ | — | [A2, torque_atomic] | [A2] | HCV1 §11.2 derivation: `G = kθr²/(Mml)`; "Cavendish weighed the Earth" |
| A3 | shell_theorem_external | atomic | ✅ | — | [A1, integration_basics] | [N1.2, gravitational_field_solid_sphere_external, acceleration_due_to_gravity, gravitational_potential_solid_sphere_external] | "External point sees shell as point-mass at centre" — Newton's Principia result |
| A4 | shell_theorem_internal | atomic | ✅ | — | [A1, integration_basics] | [variation_of_g_depth, gravitational_field_solid_sphere_internal] | "Interior of shell has zero gravity"; depth-variation of g derives from this |

D.2 — Earth-bound g and its variations

| ID | Concept | Type | Sim? | In repo? | Requires | Required-by | Notes |
|---|---|---|---|---|---|---|---|
| A5 | acceleration_due_to_gravity | atomic | ✅ | — | [A1, A3] | [variation_of_g_height, variation_of_g_depth, variation_of_g_shape, variation_of_g_rotation, gravitational_PE_constant_g_limit] | `g = GM/R²` ≈ 9.8 m/s² at Earth surface |
| A6 | variation_of_g_height | atomic | ✅ | — | [A5] | [orbital_velocity] | `g(h) = g·(1 - 2h/R)` for h<<R; full form `g·R²/(R+h)²` |
| ↳ N6.1 | binomial_expansion_step | nano | — | — | [A6, binomial_theorem_math] | [A6] | The `(1+h/R)⁻² ≈ 1 - 2h/R` step explicit |
| A7 | variation_of_g_depth | atomic | ✅ | — | [A5, A4] | — | `g(d) = g·(1 - d/R)`; from shell-theorem-internal applied to outer shell |
| ↳ N7.1 | mass_of_inner_sphere_proportionality | nano | — | — | [A7] | [A7] | `M_inner/M_earth = (R-d)³/R³` |
| A8 | variation_of_g_shape | atomic | ✅ | — | [A5] | — | Equator R 21 km larger than poles → g larger at poles. Geometric, not dynamical. |
| A9 | variation_of_g_rotation | atomic | ✅ | — | [A5, centripetal_acceleration_from_T10] | — | `g' = g - Rω²cos²λ`; effective at latitude λ |
| ↳ N9.1 | apparent_g_equator_zero_condition | nano | — | — | [A9] | [A9] | DCM2 Example 13.8: "rotate Earth fast enough for weight at equator = 0 → T = 1.4 hr" |

D.3 — Gravitational field strength (vector) and potential (scalar)

| ID | Concept | Type | Sim? | In repo? | Requires | Required-by | Notes |
|---|---|---|---|---|---|---|---|
| A10 | gravitational_field_strength | atomic | ✅ | — | [A1] | [gravitational_field_solid_sphere_external, gravitational_field_solid_sphere_internal, gravitational_field_shell_external, gravitational_field_shell_internal, gravitational_field_ring_axial, field_potential_relation] | `E = F/m` (vector); units N/kg ≡ m/s²; identical to g for Earth's field |
| ↳ N10.1 | gravitational_field_solid_sphere_external | nano | ✅ | — | [A10, A3] | [A10] | `E = GM/r²` for r ≥ R |
| ↳ N10.2 | gravitational_field_solid_sphere_internal | nano | ✅ | — | [A10] | [A10] | `E = GMr/R³` (linear in r); peak at surface |
| ↳ N10.3 | gravitational_field_shell_external | nano | ✅ | — | [A10, A3] | [A10] | `E = GM/r²` for r ≥ R |
| ↳ N10.4 | gravitational_field_shell_internal | nano | ✅ | — | [A10, A4] | [A10] | E = 0 inside shell |
| ↳ N10.5 | gravitational_field_ring_axial | nano | ✅ | — | [A10, integration_basics] | [A10] | `E = GMr/(R²+r²)^(3/2)`; max at r = R/√2 |
| A11 | gravitational_potential | atomic | ✅ | — | [A1, work_done_by_conservative_force_from_T13] | [gravitational_potential_solid_sphere_external, gravitational_potential_solid_sphere_internal, gravitational_potential_shell_external, gravitational_potential_shell_internal, gravitational_potential_ring_axial, gravitational_PE_general, escape_velocity] | `V = W_∞→P/m` (scalar); units J/kg. Reference: V(∞) = 0. |
| ↳ N11.1 | gravitational_potential_point_mass | nano | ✅ | — | [A11] | [A11] | `V = -GM/r`; negative because gravity is attractive |
| ↳ N11.2 | gravitational_potential_solid_sphere_external | nano | ✅ | — | [A11, A3] | [A11] | `V = -GM/r` for r ≥ R |
| ↳ N11.3 | gravitational_potential_solid_sphere_internal | nano | ✅ | — | [A11] | [A11] | `V = -GM(1.5R² - 0.5r²)/R³`; at centre = -1.5GM/R |
| ↳ N11.4 | gravitational_potential_shell_external | nano | ✅ | — | [A11, A3] | [A11] | `V = -GM/r` for r ≥ R |
| ↳ N11.5 | gravitational_potential_shell_internal | nano | ✅ | — | [A11, A4] | [A11] | V = -GM/R constant inside; HCV1 §11.5 ring-integration derivation |
| ↳ N11.6 | gravitational_potential_ring_axial | nano | ✅ | — | [A11, integration_basics] | [A11] | `V = -GM/√(R²+r²)`; at centre = -GM/R |
| A12 | field_potential_relation | atomic | — | — | [A10, A11, partial_differentiation_math] | [problem_solving_field_potential] | `E = -dV/dr` (1D) or `E = -∇V` (3D); the "shortest descent of V" geometric reading |

D.4 — Gravitational potential energy and binding energy

| ID | Concept | Type | Sim? | In repo? | Requires | Required-by | Notes |
|---|---|---|---|---|---|---|---|
| A13 | gravitational_PE_general | atomic | ✅ | — | [A11, A1] | [escape_velocity, total_energy_orbiting_satellite, binding_energy] | `U(r) = -Gm₁m₂/r` between two point masses; reference U(∞) = 0 |
| ↳ N13.1 | gravitational_PE_constant_g_limit | nano | ✅ | — | [A13, A5] | [A13] | `ΔU = mgh` recovered as h<<R limit of full form |
| ↳ N13.2 | gravitational_PE_n_particle_system | nano | ✅ | — | [A13] | [A13] | Sum over `N(N-1)/2` pairs; HCV1 Example 11.2 |
| A14 | binding_energy | atomic | ✅ | — | [A13, kinetic_energy_atomic_from_T13] | [escape_velocity] | `BE = |U| - KE`; energy needed to take object to infinity at rest |

D.5 — Kepler's laws of planetary motion

| ID | Concept | Type | Sim? | In repo? | Requires | Required-by | Notes |
|---|---|---|---|---|---|---|---|
| A15 | keplers_three_laws | atomic | ✅ | — | [A1, conservation_of_angular_momentum_from_T11] | [time_period_satellite, orbital_velocity] | Historical Tycho-Brahe-Kepler observational basis; predates Newton |
| ↳ N15.1 | law_of_orbits_ellipse | nano | ✅ | — | [A15] | [A15] | Planets in ellipses with Sun at one focus |
| ↳ N15.2 | law_of_areas_constant_areal_velocity | nano | ✅ | — | [A15, conservation_of_angular_momentum] | [A15] | `dA/dt = L/2m` constant → follows from central-force angular momentum conservation |
| ↳ N15.3 | law_of_periods_T_squared_R_cubed | nano | ✅ | — | [A15] | [A15] | `T² ∝ a³`; NCERT Table 1 has 9-planet data (Mercury to Pluto) confirming |
| ↳ N15.4 | central_force_implies_planar_orbit | nano | — | — | [A15, conservation_of_angular_momentum] | [A15] | NCERT §8.2 "Central Forces" inset box; angular momentum conservation → motion confined to plane |

D.6 — Satellite mechanics

| ID | Concept | Type | Sim? | In repo? | Requires | Required-by | Notes |
|---|---|---|---|---|---|---|---|
| A16 | orbital_velocity | atomic | ✅ | — | [A5, A6, centripetal_force_from_T10] | [time_period_satellite, total_energy_orbiting_satellite, geostationary_satellite] | `v = √(GM/(R+h))`; at low altitude v = √(gR) ≈ 7.9 km/s |
| A17 | time_period_satellite | atomic | ✅ | — | [A16, A15] | [geostationary_satellite, polar_satellite] | `T = 2π(R+h)^(3/2)/√(GM)`; Kepler's 3rd law for satellites |
| A18 | escape_velocity | atomic | ✅ | — | [A13, kinetic_energy_atomic_from_T13, energy_conservation_from_T13] | — | `v_e = √(2GM/R) = √(2gR) ≈ 11.2 km/s` from Earth's surface; 2.3 km/s from Moon |
| ↳ N18.1 | why_moon_has_no_atmosphere | nano | — | — | [A18] | [A18] | Moon's low v_e (2.3 km/s) < typical gas-molecule thermal speed → atmosphere escapes |
| A19 | total_energy_orbiting_satellite | atomic | ✅ | — | [A13, kinetic_energy_atomic_from_T13, A16] | [orbit_change_energy_problems] | `E = -GMm/(2(R+h))`; KE = -E (positive), PE = 2E (negative); total negative → bound orbit |
| ↳ N19.1 | bound_vs_unbound_orbit_sign | nano | — | — | [A19] | [A19] | E<0 elliptical/circular bound; E=0 parabolic escape; E>0 hyperbolic escape |
| A20 | geostationary_satellite | atomic | ✅ | — | [A17] | — | T = 24 hr → h ≈ 35,800 km; equatorial orbit only; INSAT series. |
| A21 | polar_satellite | atomic | ✅ | — | [A17] | — | h ≈ 500-800 km; T ≈ 100 min; north-south orbit; IRS series for remote sensing |

D.7 — Weightlessness

| ID | Concept | Type | Sim? | In repo? | Requires | Required-by | Notes |
|---|---|---|---|---|---|---|---|
| A22 | weightlessness_in_orbit | atomic | ✅ | — | [A19, free_fall_concept_from_T6] | — | Astronaut + satellite both accelerate at g_local → spring balance reads 0; not absence of gravity, absence of *normal force* |
| ↳ N22.1 | spring_balance_in_free_fall_thought_experiment | nano | ✅ | — | [A22] | [A22] | NCERT §8.12 elevator-cable-cut thought experiment |

D.8 — Conservation-law dual perspectives (used throughout)

| ID | Concept | Type | Sim? | In repo? | Requires | Required-by | Notes |
|---|---|---|---|---|---|---|---|
| A23 | gravity_is_conservative_force | atomic | — | — | [conservative_force_definition_from_T13] | [A11, A13, A19] | Path-independence enables potential / PE definition; cited explicitly in NCERT §8.7, HCV1 §11.3 |
| A24 | gravity_is_central_force | atomic | — | — | [A1] | [A15, N15.4] | Force along line of centres → angular momentum conserved → Kepler law of areas |

D.9 — Extended-body integrations (drill-down cluster, marked as separate atomics for problem-class clarity)

| ID | Concept | Type | Sim? | In repo? | Requires | Required-by | Notes |
|---|---|---|---|---|---|---|---|
| A25 | neutral_point_between_two_masses | atomic | ✅ | — | [A1] | — | DCM2 problem class; NCERT Example 8.4 (two spheres M and 4M at 6R separation → neutral point at 2R from M) |
| A26 | net_force_at_centre_of_symmetric_polygon | atomic | ✅ | — | [A1, vector_resolution] | — | Net force = 0 by symmetry when all vertex masses equal; ≠ 0 if symmetry broken (DCM2 Examples 13.3/13.4) |
| A27 | force_on_point_mass_due_to_rod_integration | atomic | ✅ | — | [A1, integration_basics] | — | `F = GMm/(a(l+a))`; cannot assume rod as point at centre |
| A28 | force_on_ring_due_to_sphere_axial | atomic | ✅ | — | [A1, N10.5, integration_basics] | — | DCM2 Example 13.6: `F = √3·GMm/(8a²)` for ring at √3·a from sphere centre |

D.10 — Indian real-world anchors (G-G6 decision applied)

Primary anchor (NCERT §8.11 inset "India's Leap into Space" — highest-density anchor encountered across 9 pilots):
- Aryabhatta — India's first satellite (1975), launched via Soviet rocket
- ISRO — Indian Space Research Organisation; main centre Bengaluru
- SHAR (Sriharikota) — main launch centre, 100 km north of Chennai
- INSAT series — geostationary, telecommunications + weather (early 1980s onwards)
- IRS (Indian Remote Sensing) — polar satellites (late 1980s onwards)
- GSAT-1 (2001) — geostationary launch capability test
- NRSA (National Remote Sensing Agency) — Hyderabad
- PRL (Physical Research Laboratory) — Ahmedabad
- Rakesh Sharma — first Indian astronaut (1984)

Secondary anchors:
- Aryabhatta (5th century mathematician) — heliocentric model centuries before Copernicus (NCERT §8.1)
- Apple-and-Newton at Lincolnshire farmhouse during plague (1665) — historical narrative, retains the figure (NCERT §8.3, HCV1 §11.1 + Fig 11.1)
- Chandrasekhar's treatise on Principia ("Newton's Principia for the Common Reader") — NCERT §8.3 Newton's Principia inset box (Indian-born astrophysicist Nobel laureate writing on Newton's masterpiece)

## E — Cross-source coverage matrix

| Atomic | NCERT 11.1 | DCM2 | HCV1 | Role-routing |
|---|---|---|---|---|
| A1 newton_law_of_gravitation | §8.3 (eq. 8.5) | §13.2 (Fig 13.1-13.5) | §11.1-11.2 (eq. 11.1) | NCERT historical, DCM2 problems, HCV1 derivation |
| A2 G_constant | §8.4 (Cavendish brief) | §13.2 (constant value) | §11.2 (full Cavendish method) | HCV1 = pedagogy |
| A3 shell_theorem_external | §8.5 (stated as result) | §13.2 conditions | §11.5 (ring-integration derivation) | HCV1 = pedagogy |
| A4 shell_theorem_internal | §8.6 | §13.3 (depth variation) | §11.5 (V constant inside shell) | All three |
| A5 acceleration_due_to_gravity | §8.5 | §13.3 | §11.6 (deferred) | All three |
| A6-A9 g_variations | §8.5-8.6 | §13.3 (4 sub-sections) | (partial) | DCM2 = pattern-class |
| A10-A11 field_and_potential | (deferred to Class 12 by NCERT) | §13.4-13.5 | §11.4-11.5 | DCM2 + HCV1 |
| A13 grav_PE_general | §8.7 | §13.7 (deferred) | §11.3 | All three |
| A15 keplers_laws | §8.2 + Table 1 (9-planet data) | §13.10 (deferred) | §11.6 (deferred) | NCERT = primary, with Indian data table |
| A16-A19 satellite_mechanics | §8.8-8.10 | §13.9 (deferred) | §11.7 (deferred) | NCERT = primary |
| A20-A21 geostationary_polar | §8.11 + India's Leap inset | (not in mech vol) | (not in Vol 1) | **NCERT-only** + Indian anchor |
| A22 weightlessness | §8.12 | (not captured) | (not captured) | NCERT primary |

**9-pilot pattern reaffirmed:** NCERT carries application-layer + Indian-context anchors with no equivalent in DCP/HCV. Source-role triad stable.

## F — Outgoing edges to other topics (matrix update payload)

| Target topic | Atomic in T16 | Atomic in target | Edge type | Notes |
|---|---|---|---|---|
| T10 Circular Motion | A16 orbital_velocity | centripetal_force_atomic | requires | Satellite is circular motion under gravity |
| T11 Rotational Mech | A15 keplers_laws | angular_momentum_conservation | requires | Law of areas = L conservation |
| T13 Work-Energy | A13 gravitational_PE_general | conservative_force_definition | requires | PE defined for conservative forces |
| T13 Work-Energy | A18 escape_velocity | energy_conservation_atomic | requires | KE+PE=const at infinity |
| T6 Kinematics 1D | A22 weightlessness | free_fall_atomic | requires | Astronaut in free fall |
| T17 SHM | A5 acceleration_due_to_gravity | pendulum_period_atomic | required-by | Pendulum T depends on g |
| T30 Electrostatics | A1 newton_law_of_gravitation | coulombs_law_atomic | analogue (bidirectional) | Both 1/r² conservative central forces |

7 outgoing edges. Brings T16 in-degree to 2 (from T10 + T13, closing the founder's "T16 closes 2 incoming edges" expectation).

## G — Atomic vs nano decisions: judgment calls

- **Kepler's 3 laws bundled (G-G4):** Could have split into 3 atomics. Did not. Reason: empirically discovered as a unit; modern derivation makes them all consequences of central-force gravitation. Splitting loses the unified narrative.
- **Shell theorem split into external + internal (A3 + A4):** Two atomics, not one. Reason: external case used for sphere-as-point-mass simplification everywhere; internal case ONLY used for depth-variation. Distinct usage contexts → distinct atomics.
- **Field strength + potential split (G-G3):** This is the largest atomic-count contributor. Vector vs scalar distinction is foundational; collapsing risks the same confusion JEE students have ("is E the negative gradient or the slope?"). Worth the atomic budget.
- **A25-A28 extended-body atomics:** Could have been nanos under A1. Promoted to atomics because each has a distinct JEE problem class (neutral point, polygon vertex, rod, ring-sphere axial). DC Pandey gives each its own worked example.

## H — Open questions / candidate_micro flags

- **N6.1 (binomial expansion step):** Pure math technique. Should this be a math-tools concept, not gravity concept? Flag for math-tools refactor at Stage 5+.
- **A23 + A24 (gravity_is_conservative / gravity_is_central):** These are *property* atomics not *phenomenon* atomics. Sim-feasibility unclear. Maybe better treated as tags on A1 rather than separate atomics. Flag for Stage 4 granularity revisit.
- **A20 geostationary + A21 polar:** Both are "satellite-with-specific-orbit-parameters" applications. Splitting feels right given Indian-context payload (INSAT / IRS) but they could collapse to one atomic with two nanos. Stage 4 decision.

## I — Author confidence

HIGH on D.1-D.7 (Newton's law through satellite mechanics — core triple-covered material with strong textbook agreement). MEDIUM on D.8-D.10 (extended-body integrations and Indian anchors — extracted accurately but atomic-vs-nano calls are judgment-driven and may shift in Stage 4).

## J — Matrix update payload (auto-aggregating)

Add T16 row with: 7 OUT-edges (T10, T11, T13×2, T6, T17, T30); 2 IN-edges (T10, T13 — confirming the founder's pre-batch prediction).
Add T16 column with closings on T10, T13.

---

*Pilot T16 complete. 28 atomics + ~32 nanos + 7 cross-topic edges. NCERT India-anchor density highest observed.*
