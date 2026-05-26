# Pilot Topic 31 — Capacitors

**Cluster:** Electricity & Magnetism (NCERT Class 12)
**Source confirmation:** NCERT 12.1 Ch.2 "Electrostatic Potential and Capacitance" §2.10-2.16 (book p.72-86 — dielectrics + capacitance + parallel-plate + effect of dielectric + combination + energy stored + Van de Graaff) | DCEM Ch.25 "Capacitors" §25.1-25.4 captured (full chapter §25.1-25.9) | HCV2 Ch.31 "Capacitors" §31.1-31.12 (full chapter)
**Triple-coverage status:** Confirmed.
**Author session:** 2026-05-25 (continuation from T16 in same batch).

---

## Founder Decisions Applied (this catalog)

| ID | Decision | Rationale |
|---|---|---|
| CAP-G1 | Capacitance of isolated conductor + capacitance of two-conductor system → 2 separate atomics (`isolated_conductor_capacitance` + `two_conductor_capacitor`). | All three sources separate them: NCERT §2.11 distinguishes "even a single conductor can be used as a capacitor by assuming the other at infinity"; HCV2 §31.1; DCEM §25.1. Single-conductor case maps to "isolated sphere = limit of spherical capacitor as outer radius → ∞". Splitting preserves both teaching paths. |
| CAP-G2 | Geometry variants (parallel-plate / spherical / cylindrical) → each is its own atomic. NOT one mega-atomic "capacitor capacitance". | Derivation method genuinely differs (planar Gauss vs spherical Gauss vs cylindrical Gauss). HCV2 §31.2 explicitly walks all three derivations side by side. JEE problem patterns are distinct. |
| CAP-G3 | Dielectric effect → 1 atomic (`dielectric_increases_capacitance`) covering polarisation + induced charge + K factor. Displacement vector D + alternative Gauss's law (HCV §31.8, NCERT §2.13 inset) becomes 1 ADVANCED nano under it, not a separate atomic. | NCERT §2.10 + HCV2 §31.6 + DCEM §25.3 all teach polarisation → induced charge → K together. D-vector is JEE-Advanced edge; treating it as a nano respects the pedagogical layering and keeps atomic count manageable. |
| CAP-G4 | Series + parallel → 1 atomic (`capacitor_combination`) with 2 child nanos (series, parallel). The HCV2 "general method 5-step" (§31.3) becomes a drill-down for non-trivial networks. | The 1/C-series-rule and C-sum-parallel-rule are the same conceptual lesson (potential vs charge constancy). Splitting them mirrors resistors-in-T-Y-current-electricity (one combination atomic, two child rules). |
| CAP-G5 | Energy stored in capacitor + energy density in electric field → 1 atomic. NOT separate atomics. | NCERT §2.15 explicitly derives one from the other ("the energy is 'stored' in the electric field between the plates") and notes "this result is in fact very general and holds true for electric field due to any configuration of charges". Same physical insight, two algebraic forms. |
| CAP-G6 | Van de Graaff generator = atomic (`van_de_graaff_generator`). Not a nano under "applications". | NCERT §2.16 + HCV2 §31.12 both give it full section treatment. It exercises corona discharge + dielectric strength + spherical capacitor's potential-from-radius all simultaneously — strong concept-integration atomic. Pre-2000 Indian-physics-lab anchor (commonly built in IIT undergraduate labs). |
| CAP-G7 | Real-world anchor strategy: capacitors are abstract circuit elements with weak NCERT-side Indian anchor density. Primary anchor borrowed from T30 cluster (lightning, sparks from cars, dielectric breakdown of air — same physics). Secondary anchor = "1 farad needs 30 km × 30 km plates" thought experiment (NCERT eq. 2.45) which makes capacitance abstraction visceral. | This is the FIRST topic in the 9-pilot run where NCERT does NOT carry strong Indian-context anchor density. Honest call: route to T30 cluster anchors via cross-reference rather than fabricate weak ones. |

---

## A — Topic identity & boundary

**What's in:** Capacitance of isolated and two-conductor systems; parallel-plate / spherical / cylindrical geometries; dielectrics and dielectric constant K; series + parallel combinations; energy stored + energy density; force between plates; redistribution of charge between connected conductors; corona discharge; Van de Graaff generator.

**What's out:** C-R circuits (DCEM §25.8 — deferred; intersects with T34 Current Electricity and T38 Transient currents; will be covered there). Capacitor charging/discharging time constant (same — deferred to circuit-analysis topic). AC-driven capacitors (deferred to T39 AC Circuits).

**Boundary with T30 Electrostatics:** Capacitance is a derived quantity from V (T30) and Q (T29). The atomics in T30 (point-charge potential, system-of-charges potential, equipotential surfaces) are upstream prerequisites. T31 introduces no new fundamental field/potential physics — only geometric/material applications.
**Boundary with T17 SHM:** None direct, but the LC-oscillation atomic (deferred to T39 AC Circuits) will require both T31 (capacitor energy) and T17 (SHM equations).
**Boundary with T34 Current Electricity:** Series/parallel combination logic is structurally parallel (sum reciprocals vs sum directly), but the conserved quantity flips (charge for capacitors-in-series, current for resistors-in-series). Useful cross-reference for student "WHY is it 1/C for series here but Σ for resistors?" confusion.

## B — Source-cluster snapshot

| Source | Sections captured | Role observed |
|---|---|---|
| NCERT 12.1 Ch.2 | §2.10-2.16 (dielectrics through Van de Graaff) + summary + Points to Ponder + exercises 2.5-2.34 | **ANCHORS** (weak this time — see CAP-G7); strong on the "1 farad = 30 km plates" intuition-building; provides Van de Graaff context |
| DCEM Ch.25 | §25.1-25.4 captured (capacitance, energy + redistribution, parallel-plate, force on plate); full chapter §25.1-25.9 | **PROBLEMS** — JEE problem patterns: charge redistribution after connecting two charged conductors with energy loss; repeated-contact problem (Example 25.4, JEE 1998 Example 25.5 with limiting infinite case); partial dielectric (different K slabs); infinite ladder |
| HCV2 Ch.31 | §31.1-31.12 (full, including alternative Gauss's law / displacement vector / corona discharge / Van de Graaff) | **PEDAGOGY** — first-principles derivations: parallel-plate via Gauss with cylinder spanning plate (§31.2), spherical via flux + integration (§31.2), cylindrical via coaxial cylinder Gauss (§31.2); general 5-step method for arbitrary networks (§31.3); displacement vector D derived (§31.8); polarisation P → induced charge σ_p = P (§31.6) |

Source-role triad CONFIRMED for 9th pilot. **Important caveat noted under CAP-G7:** NCERT's "anchors" role here is the WEAKEST among 9 pilots — capacitor physics is genuinely abstract and Indianizing it is hard.

## C — Granularity test

**Atomic count:** 26 atomics.
**Nano count:** ~28 nanos.
**Atomic-vs-nano boundary holds?** YES, with CAP-G3 (dielectric collapse into one atomic with D-vector as nano) being the key restraint on atomic-count inflation.

> Note: founder-decision prefix renamed from `C-G*` to `CAP-G*` in Session 47 cleanup (2026-05-25) to resolve collision with T10 Circular Motion which also used `C-G*`.

## D — Atomic + Nano catalog

D.1 — Capacitance fundamentals

| ID | Concept | Type | Sim? | In repo? | Requires | Required-by | Notes |
|---|---|---|---|---|---|---|---|
| A1 | isolated_conductor_capacitance | atomic | ✅ | — | [electric_potential_atomic_from_T30, electric_field_atomic_from_T30] | [spherical_capacitor, two_conductor_capacitor, van_de_graaff_generator] | `C = Q/V` for single conductor with V referenced to infinity; depends only on geometry |
| ↳ N1.1 | spherical_conductor_capacitance | nano | ✅ | — | [A1] | [A1, A2] | `C = 4πε₀R`; Earth ≈ 711 μF (NCERT-equivalent example in DCEM §25.1) |
| ↳ N1.2 | farad_is_large_unit_intuition | nano | — | — | [A1] | [A1] | "1 F requires 30 km × 30 km plates at 1 mm separation" (NCERT eq. 2.45) — primary anchor for unit-magnitude intuition |
| A2 | two_conductor_capacitor | atomic | ✅ | — | [A1, electric_potential_atomic_from_T30] | [parallel_plate_capacitor, spherical_capacitor, cylindrical_capacitor, capacitor_combination, energy_stored_in_capacitor] | C = Q/V where Q is charge on positive plate and V is potential difference; net total charge = 0 |
| ↳ N2.1 | why_not_total_charge_definition | nano | — | — | [A2] | [A2] | NCERT §2.11 explicit: "the term 'charge on a capacitor' does NOT mean the total charge given... total charge is +Q - Q = 0" |

D.2 — Geometry-specific capacitance

| ID | Concept | Type | Sim? | In repo? | Requires | Required-by | Notes |
|---|---|---|---|---|---|---|---|
| A3 | parallel_plate_capacitor | atomic | ✅ | — | [A2, gauss_law_atomic_from_T30, uniform_field_between_plates_from_T30] | [dielectric_increases_capacitance, force_between_capacitor_plates, energy_density_field] | `C = ε₀A/d`; derived by Gauss-law on cylinder spanning plate; valid when d << √A (no edge effects) |
| ↳ N3.1 | fringing_field_at_edges | nano | — | — | [A3] | [A3] | NCERT §2.12: "field lines bend outward at the edges"; ignored in ideal derivation but real |
| ↳ N3.2 | gauss_law_cylinder_through_plate_derivation | nano | ✅ | — | [A3, gauss_law_atomic] | [A3] | HCV2 §31.2 Fig 31.4: ΔA cross-section, flux only through ΔA' inside positive plate |
| A4 | spherical_capacitor | atomic | ✅ | — | [A2, gauss_law_atomic_from_T30, A1] | — | `C = 4πε₀R₁R₂/(R₂-R₁)`; both isolated-sphere limit (R₂→∞ ⇒ C=4πε₀R₁) and parallel-plate limit (R₂-R₁=d << R) live here |
| ↳ N4.1 | isolated_sphere_as_limit | nano | — | — | [A4, A1] | [A4] | HCV2 §31.2: bridges A1 and A4 explicitly |
| ↳ N4.2 | parallel_plate_as_limit | nano | — | — | [A4, A3] | [A4] | HCV2 §31.2: `4πR₁R₂ → 4πR² = A` for thin shells, gives back ε₀A/d |
| A5 | cylindrical_capacitor | atomic | ✅ | — | [A2, gauss_law_atomic_from_T30] | — | `C/l = 2πε₀/ln(R₂/R₁)`; coaxial-cable geometry; HCV2 §31.2 explicit |

D.3 — Dielectrics

| ID | Concept | Type | Sim? | In repo? | Requires | Required-by | Notes |
|---|---|---|---|---|---|---|---|
| A6 | dielectric_polarisation | atomic | ✅ | — | [electric_dipole_atomic_from_T30, electric_field_atomic_from_T30] | [dielectric_increases_capacitance, displacement_vector_D] | Non-polar molecules get induced dipole moment; polar molecules align with field. P = χₑE for linear isotropic dielectric. |
| ↳ N6.1 | non_polar_vs_polar_molecule | nano | ✅ | — | [A6] | [A6] | NCERT §2.10 Fig 2.22 |
| ↳ N6.2 | induced_surface_charge_density | nano | ✅ | — | [A6] | [A6] | σ_p = P (NCERT eq.); bound charges, not free charges |
| A7 | dielectric_increases_capacitance | atomic | ✅ | — | [A6, A3] | [partial_dielectric_capacitor] | `C = KC₀`; field reduced inside dielectric by factor K → V reduced → C increased |
| ↳ N7.1 | induced_charge_reduces_E | nano | ✅ | — | [A7, A6] | [A7] | `E = E₀ - E_p = E₀/K`; net field smaller than free-charge field |
| ↳ N7.2 | dielectric_strength_limit | nano | — | — | [A7] | [A7] | NCERT Table 2: K + breakdown field for common dielectrics; HCV2 Table 31.1 likewise |
| ↳ N7.3 | partial_dielectric_capacitor | nano | ✅ | — | [A7, A3] | — | DCEM §25.3 Fig 25.14: slab of thickness t < d; `C = ε₀A/(d - t + t/K)` |
| A8 | displacement_vector_D | atomic | — | — | [A6, A7, gauss_law_atomic_from_T30] | — | `D = ε₀E + P`; alternative Gauss: ∮D·dS = Q_free. ADVANCED — HCV2 §31.8 + NCERT §2.13 inset only. Sim feasibility uncertain. |

D.4 — Combination of capacitors

| ID | Concept | Type | Sim? | In repo? | Requires | Required-by | Notes |
|---|---|---|---|---|---|---|---|
| A9 | capacitor_combination | atomic | ✅ | — | [A2, charge_conservation_atomic_from_T29, potential_difference_atomic_from_T30] | [energy_loss_in_redistribution, complex_capacitor_network_methods] | The "combine multiple capacitors → equivalent single" logic |
| ↳ N9.1 | capacitors_in_series | nano | ✅ | — | [A9] | [A9] | `1/C = Σ1/Cᵢ`; each capacitor has same charge Q; V splits |
| ↳ N9.2 | capacitors_in_parallel | nano | ✅ | — | [A9] | [A9] | `C = ΣCᵢ`; each capacitor has same V; Q splits |
| A10 | complex_capacitor_network_methods | atomic | — | — | [A9] | — | HCV2 §31.3 general 5-step method (label points P,N → mentally connect battery → write plate charges → set V_N=0, V_P=V → write Q=CV per cap → solve). Handles networks not reducible to series-parallel. |
| ↳ N10.1 | symmetry_arguments_for_networks | nano | — | — | [A10] | [A10] | HCV2 Example 31.6 (12-capacitor cube between diagonally opposite corners) — charge symmetry reduces 12 unknowns to 3 |
| ↳ N10.2 | infinite_ladder_network | nano | — | — | [A10] | [A10] | HCV2 Worked Example 13 (Fig 31-W11): self-similar substitution → `C₁ = (1+√5)/2 · C` (golden ratio) |

D.5 — Energy stored

| ID | Concept | Type | Sim? | In repo? | Requires | Required-by | Notes |
|---|---|---|---|---|---|---|---|
| A11 | energy_stored_in_capacitor | atomic | ✅ | — | [A2, integration_basics, work_done_atomic_from_T13] | [energy_loss_in_redistribution, energy_density_field, force_between_capacitor_plates, van_de_graaff_generator] | `U = ½CV² = ½QV = Q²/(2C)`; derived as `∫(q/C)dq` from 0 to Q |
| ↳ N11.1 | energy_density_field | nano | ✅ | — | [A11, A3] | — | `u = ½ε₀E²`; recast from U = ½CV² by substituting C = ε₀A/d and V = Ed; "holds for any field configuration" (NCERT §2.15 explicit) |
| A12 | force_between_capacitor_plates | atomic | ✅ | — | [A3, A11, work_energy_theorem_from_T13] | — | `F = Q²/(2Aε₀) = ½ε₀E²·A`; one plate sees field E/2 = σ/(2ε₀) from the other plate only |
| ↳ N12.1 | factor_of_half_explanation | nano | — | — | [A12, A11] | [A12] | NCERT exercise 2.28: "Show factor ½" — common JEE confusion. Plate sits in field of *other* plate only, not full field. |
| A13 | charge_redistribution_after_connection | atomic | ✅ | — | [A2, A9, charge_conservation_atomic_from_T29] | [energy_loss_in_redistribution] | When two charged capacitors are connected, charge flows until V equalizes. `V_common = (Q₁+Q₂)/(C₁+C₂)`. |
| ↳ N13.1 | energy_loss_in_redistribution | nano | ✅ | — | [A13, A11] | — | `ΔU = ½·C₁C₂/(C₁+C₂)·(V₁-V₂)²`; always positive — energy lost to heat + EM radiation in transient. NCERT Example 2.10 explicit: "where has the remaining energy gone?" |
| ↳ N13.2 | repeated_contact_problem | nano | ✅ | — | [A13] | — | DCEM Example 25.4: q_max = Qq/(Q-q); JEE 1998 Example 25.5 limiting case → q_∞ = QR/r |

D.6 — Applications

| ID | Concept | Type | Sim? | In repo? | Requires | Required-by | Notes |
|---|---|---|---|---|---|---|---|
| A14 | corona_discharge | atomic | ✅ | — | [A7-N7.2, electric_field_near_pointed_conductor_from_T30] | [van_de_graaff_generator] | Air ionizes near pointed/curved conductor surface when E > 3×10⁶ V/m (dielectric strength of air). HCV2 §31.11. |
| ↳ N14.1 | charge_density_higher_at_smaller_radius_curvature | nano | ✅ | — | [A14] | [A14] | `σ ∝ 1/R` for connected spheres at same V; sharp points have huge σ → huge E → corona |
| A15 | van_de_graaff_generator | atomic | ✅ | — | [A1-N1.1, A14] | — | Million-volt generator: belt deposits charge on outer spherical shell continuously; V keeps rising until corona limits. Built in IIT undergrad labs historically. |
| ↳ N15.1 | belt_brush_charge_transfer_mechanism | nano | ✅ | — | [A15] | [A15] | NCERT Fig 2.33 + HCV2 Fig 31.23: motor-driven belt + corona-discharge brush at top → charge always accumulates on outer surface (regardless of shell's own charge) |
| A16 | capacitor_with_battery_vs_disconnected | atomic | ✅ | — | [A2, A7] | — | Crucial JEE distinction: when dielectric inserted with battery connected, Q changes (V fixed); when disconnected, V changes (Q fixed). NCERT exercise 2.9 explicit. |

D.7 — Conservation-law applications (problem cluster)

| ID | Concept | Type | Sim? | In repo? | Requires | Required-by | Notes |
|---|---|---|---|---|---|---|---|
| A17 | two_laws_for_capacitor_networks | atomic | — | — | [A9, charge_conservation_atomic_from_T29] | [A10] | DCEM §25.6 "Two laws in capacitors": charge-conservation at node + sum-of-V-around-loop = 0 (Kirchhoff for capacitors). Same logical structure as KCL+KVL for resistors. |
| A18 | dielectric_pulled_into_capacitor_force | atomic | ✅ | — | [A7, A11, energy_method_force_from_T13] | — | `F = ε₀bV²(K-1)/(2d)` for slab partially inserted. HCV2 Worked Example 22: `F = ½V²·dC/dx`. Energy method derivation is canonical. |
| ↳ N18.1 | dielectric_liquid_rises_into_capacitor | nano | ✅ | — | [A18] | — | HCV2 Worked Example 23: `h = (K²-1)Q²/(2A²K²ε₀ρg)`; liquid rises against gravity due to capacitor pulling force |
| A19 | switch_closes_charge_flow | atomic | ✅ | — | [A9, A13] | — | HCV2 Worked Example 11: switch closing between two capacitor branches → 12 μC flows through switch. JEE-Advanced bridge-circuit pattern. |

D.8 — Numerical-pattern atomics (DC Pandey-driven, less canonical)

| ID | Concept | Type | Sim? | In repo? | Requires | Required-by | Notes |
|---|---|---|---|---|---|---|---|
| A20 | three_plate_capacitor | atomic | ✅ | — | [A3, A9] | — | HCV2 Worked Example 12: 3 plates, plate-B shares charge to both A and C. Pattern shows up in JEE-Adv. |
| A21 | capacitor_with_dielectric_K_varying_spatially | atomic | — | — | [A7, A3, integration_basics] | — | HCV2 Worked Example 20: `K(x) = K₀ + αx` along plate length → C = (ε₀a²/d)(K₀ + αa/2). Tests integration ability over geometry. |
| A22 | capacitor_polarity_reversed | atomic | ✅ | — | [A11, A13] | — | HCV2 Worked Example 15: 2Q passes through battery → W = 2Cε² → heat = 2Cε². Sign-tracking JEE pattern. |
| A23 | three_capacitors_disconnect_reconnect | atomic | ✅ | — | [A9, A13] | — | HCV2 Worked Example 10: 3 series caps charged, disconnected, re-connected with positives-together and negatives-together → solve for redistribution |
| A24 | infinite_capacitor_via_earthing | atomic | — | — | [A2] | — | DCEM §25.3 inset: one plate earthed → effective capacitance = ∞ since Earth absorbs any charge. Boundary-condition concept atomic. |

D.9 — Conceptual subtleties (NCERT Points-to-Ponder cluster)

| ID | Concept | Type | Sim? | In repo? | Requires | Required-by | Notes |
|---|---|---|---|---|---|---|---|
| A25 | capacitor_confines_field_locally | atomic | — | — | [A3] | — | NCERT §2.16 Point-to-Ponder 2: "Capacitor confines field lines within small region. Thus, even though field may have considerable strength, the PD between conductors is small." Concept of localised field-strength vs global-potential. |
| A26 | dielectric_constant_drops_with_temperature | atomic | — | — | [A6, A7] | — | NCERT §2.16 Point-to-Ponder 6: "dielectric constant decreases if temperature is increased" — explained via polarisation reduction. Thermal disordering atomic. |

## E — Cross-source coverage matrix

| Atomic | NCERT 12.1 | DCEM | HCV2 | Role-routing |
|---|---|---|---|---|
| A1 isolated_conductor_capacitance | §2.11 (mentioned) | §25.1 (full + Earth example) | §31.1 (Fig 31.1) | DCEM + HCV2 primary |
| A2 two_conductor_capacitor | §2.11 | §25.3 Fig 25.6 | §31.1 | All three |
| A3 parallel_plate | §2.12 + Fig 2.25 | §25.3 Fig 25.8-25.9 | §31.2 Fig 31.3-31.4 | HCV2 = derivation rigor; NCERT = brief; DCEM = field-region cases |
| A4 spherical_capacitor | exercise 2.29 only | not in §25.1-25.4 captured | §31.2 Fig 31.5 (full derivation) | HCV2 = derivation |
| A5 cylindrical_capacitor | exercise 2.32 only | not in §25.1-25.4 captured | §31.2 Fig 31.6 (full derivation) | HCV2 = derivation |
| A6 polarisation | §2.10 Fig 2.22-2.23 (depth) | §25.3 (compact) | §31.6 Fig 31.15 | NCERT + HCV2 = pedagogy |
| A7 dielectric_increases_C | §2.13 (eqs 2.46-2.54) | §25.3 (Effect of Dielectrics) | §31.7 Fig 31.17 | All three converge |
| A8 displacement_vector_D | §2.13 inset "Electric displacement" | not captured | §31.8 (full alternative Gauss derivation) | HCV2 = pedagogy depth |
| A9 capacitor_combination | §2.14 Fig 2.26-2.28 | §25.5 (not captured) | §31.3 Fig 31.7+31.9 + 5-step method | HCV2 = problem method |
| A11 energy_stored | §2.15 (eqs 2.68-2.77) | §25.2 (eqs U=q²/(2C)) | §31.5 Fig 31.13 | All three |
| A13 charge_redistribution | §2.15 Example 2.10 | §25.2 "Redistribution + Loss" full | §31.5 (mentioned) | DCEM = problem-class authoritative |
| A14 corona_discharge | (not in Ch.2) | not captured | §31.11 Fig 31.22 | HCV2 only |
| A15 van_de_graaff | §2.16 Fig 2.33 | (deferred) | §31.12 Fig 31.23 | NCERT + HCV2 |
| A16 battery_connected_vs_disconnected | exercise 2.9 | (not explicitly captured) | (not captured) | NCERT-only as standalone |

**9-pilot triad pattern continues** with the noted weakness: NCERT-anchor density LOW for capacitors. Other 8 pilots had strong NCERT real-world stories; capacitors don't have one. This is itself a finding — not all topics anchor equally well.

## F — Outgoing edges to other topics (matrix update payload)

| Target topic | Atomic in T31 | Atomic in target | Edge type | Notes |
|---|---|---|---|---|
| T30 Electrostatics | A1 isolated_conductor_capacitance | electric_potential_atomic | requires | V is the upstream concept |
| T30 Electrostatics | A3 parallel_plate_capacitor | gauss_law_atomic | requires | Derivation uses Gauss |
| T30 Electrostatics | A6 dielectric_polarisation | electric_dipole_atomic | requires | Polarisation = aligned dipoles |
| T30 Electrostatics | A14 corona_discharge | electric_field_near_pointed_conductor | requires | Sharp-edge field amplification |
| T13 Work-Energy | A11 energy_stored | work_done_atomic | requires | U = ∫dW = ∫(q/C)dq |
| T17 SHM | (deferred — LC oscillation lives in T39) | — | — | — |
| T29 Electric Charges | A2 two_conductor_capacitor | charge_conservation_atomic | requires | Net charge = 0 |
| T34 Current Electricity | A9 capacitor_combination | resistor_combination_atomic | analogue (bidirectional) | Same series/parallel logic, different conserved quantity |

7 outgoing edges (1 of which is bidirectional with T34 — flagged for matrix bookkeeping).
Incoming: 4 from T30 + 1 from T17 (zero — LC deferred) + 1 from T29 = effectively closes 5 incoming edges that have been accumulating from prior pilots.

## G — Atomic vs nano decisions: judgment calls

- **CAP-G3 collapse of dielectrics into one atomic:** Could have split into 3 atomics (polarisation / induced charge / K factor). Did not. Reason: NCERT and HCV2 teach as one continuous logical flow; splitting creates "first you learn what dipoles do, separately you learn what dipoles do to E, separately you learn the macroscopic K" — pedagogically broken.
- **A8 displacement_vector_D promoted to atomic, not nano:** Borderline. Promoted because (a) it has its own derivation pathway in HCV2 §31.8, (b) it generalizes Gauss's law to dielectric media which is a distinct insight, (c) NCERT marks it as advanced/optional with its own inset. But sim-feasibility unclear (it's a tensor-field abstraction).
- **A10 complex_capacitor_network_methods as separate atomic:** Could be a drill-down under A9. Promoted because the HCV2 5-step general method has its own teaching pattern distinct from series/parallel shortcuts. Tests problem-class generality, not just combination rules.
- **A16 battery_connected_vs_disconnected:** Almost split into 2 atomics (one per case). Did not — they're better taught as a contrast pair under one atomic. Misconception confrontation atomic.
- **A20-A24 numerical-pattern atomics:** All are atomics, not nanos, because each represents a distinct JEE problem class that students must learn to recognize. Granularity test passes: each has independent worked example in DC Pandey or HCV2.

## H — Open questions / candidate_micro flags

- **A25-A26 Point-to-Ponder atomics:** These are *insight* atomics, not *phenomenon* atomics. Sim-feasibility uncertain. Could collapse to "subtleties tag" on parent atomics. Stage 4 candidate.
- **A24 infinite_capacitor_via_earthing:** Boundary-condition atomic, similar to "shell theorem internal" status in T16. Possibly better as nano under A2. Flag for Stage 4.
- **A8 displacement_vector_D + A17 two_laws_for_capacitor_networks:** Both are abstraction atomics that test high-school student capacity. May be better deferred to "JEE-Advanced-only" tier rather than mainstream atomic. Stage 4.

## I — Author confidence

HIGH on D.1-D.5 (capacitance / geometry / dielectrics / combination / energy — fully triple-covered with strong agreement). HIGH on D.6-D.7 (corona + Van de Graaff + force-between-plates + redistribution — well-covered by 2+ sources). MEDIUM on D.8 (numerical-pattern atomics — judgment-driven promotion from worked examples). MEDIUM on D.9 (Point-to-Ponder atomics — may be better as tags than full atomics).

CAP-G7 honest call documented: Indian-context anchor density is LOW for capacitors. This is the first 9-pilot exception to the "NCERT carries anchors" rule. Source-role triad still holds, but the anchors role is muted here.

## J — Matrix update payload (auto-aggregating)

Add T31 row with: 8 OUT-edges (T30×4, T13, T29, T34 — last is bidirectional analogue); 5 IN-edges accumulating from T30 (cap is downstream of potential/field/dipole/sharp-edge), T13, T29.
Add T31 column with closings on T30 (4 edges close), T13, T29.
Note in matrix Part C: "9-pilot finding — NCERT-anchor-density VARIES by topic. Capacitors weakest. Topics like Gravitation (T16) and Electrostatics (T30) strongest. Anchor-availability is itself signal — when authoring V1 priority queue, weak-anchor topics may need synthetic anchors (Indian application contexts not from textbook)."

---

*Pilot T31 complete. 26 atomics + ~28 nanos + 8 cross-topic edges. First topic where NCERT-anchor density was weak — important finding for Stage 5 priority queue.*
