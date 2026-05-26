# Pilot Topic 47 — Atomic Models

> Stage-2 pilot catalog. Matrix-canonical topic number: **T47**. Modern Physics cluster opener (paired with T45 Atomic Spectra).
>
> **Sources:** NCERT Class 12 Part 2 Ch.12 Atoms §12.1–12.4 (book pp.414–426) + HCV Vol 2 Ch.43 Bohr's Model and Physics of the Atom §43.1–43.5 + 43.7 (book pp.368–376) + DCP Optics & Modern Physics atomic-physics chapter (problem-pattern source).
>
> Authored as paired-batch with T45 Atomic Spectra. Session 43.

---

## Founder Decisions Applied (T47-specific, prefix AM-G*)

| # | Decision | Reason |
|---|---|---|
| **AM-G1** | **Thomson plum-pudding / Rutherford alpha-scattering / Rutherford nuclear model = 3 separate atomics.** Historical progression matters pedagogically. NCERT §12.1 walks all three; HCV §43.1 does same. Each is a JEE-Main asked-separately concept (plum-pudding → "uniform distribution of positive charge"; alpha-scattering → Geiger-Marsden experimental setup; nuclear model → "all positive charge concentrated"). |
| **AM-G2** | **Bohr's three postulates as 3 separate atomics**, not one umbrella. Each postulate has a distinct physical content (stationary orbits / angular-momentum quantization / transition photon emission) and is asked separately in JEE-Main. **Reason:** if Bohr is a single atomic, students recite "three postulates" verbally without understanding why each is needed — separating them forces engagement with each one's necessity. |
| **AM-G3** | **Bohr radius, velocity in nth orbit, energy in nth orbit = 3 separate atomics**, NOT bundled. Each has its own derivation arc (a₀ = ε₀h²/πme², vₙ = e/√(4πε₀mrₙ), Eₙ = −13.6/n² eV). Bundling loses the pedagogical structure of "use postulate 2 to derive r → use Coulomb's law to derive v → combine for E". |
| **AM-G4** | **Franck-Hertz experiment as standalone atomic.** NCERT puts it in its own inset box (p.428); HCV §43.6 hides it. **Reason:** experimental verification of energy quantization is the strongest evidence FOR Bohr's model — making it a standalone atomic respects that pedagogical role and gives it its own simulation slot. |
| **AM-G5** | **Hydrogen-like ions (He⁺, Li⁺⁺) as standalone atomic.** Just adding Z² to formulas; but the JEE-Adv pattern "find energy/radius/spectrum of He⁺" recurs constantly and is the #1 source of "I forgot the Z² factor" student errors. Standalone atomic forces the Z² generalization to register. |
| **AM-G6** | **Bohr model limitations + Orbit-vs-orbital comparison = 2 atomics.** Limitations is a teaching unit (multi-electron failures, fine structure, Zeeman effect). Orbit-vs-orbital is the quantum-mechanical bridge (NCERT p.426 explicit box). Both are needed because students otherwise think Bohr is "the" model. |
| **AM-G7** | **Anchor density STRONG** for T47. Indian-context anchors: **C.V. Raman (Nobel 1930 for Raman effect — spectroscopy of molecules)**, **Meghnad Saha's ionization equation (1921, foundational stellar astrophysics)**, **Satyendra Nath Bose (Bose-Einstein statistics, photon statistics)**, **Sommerfeld's elliptical-orbit extension taught in Indian classrooms**, **Indian National Science Academy heritage**, **TIFR Mumbai atomic physics research**, **IIT JEE-prep classroom Bohr-model derivation as universal Indian-student rite-of-passage**. Authoring multiplier 1.0×. |

---

## Section A — Atomic + Nano Concept Table

| ID | Concept | Type | Sim? | In repo? | Requires | Required-by | Notes |
|---|---|---|---|---|---|---|---|
| `thomson_plum_pudding_model` | Atom = positive sphere with electrons embedded like seeds in a watermelon (J.J. Thomson 1898) | atomic | ✅ visual | — | — | [`rutherford_alpha_scattering_experiment`] | NCERT §12.1 + HCV §43.1 Fig 43.2. The model alpha-scattering disproved. |
| `rutherford_alpha_scattering_experiment` | Geiger-Marsden 1911 gold-foil setup; 5.5 MeV α from ²¹⁴Bi source; ZnS scintillation screen; observation that ~1 in 8000 deflected >90° | atomic | ✅ animated | — | [`thomson_plum_pudding_model`, `coulombs_law`] | [`rutherford_nuclear_model`, `distance_of_closest_approach`] | NCERT §12.2 Figs 12.1–12.3 + HCV §43.1. **Iconic Indian-JEE diagram.** |
| `↳ alpha_particle_impact_parameter_trajectory` | Trajectory of α depends on impact parameter b: small b → large deflection; large b → small deflection; head-on → 180° rebound | nano | ✅ animated | — | — | [`distance_of_closest_approach`] | NCERT Fig 12.4. |
| `rutherford_nuclear_model` | All positive charge + most of mass concentrated in tiny nucleus (10⁻¹⁵ m); electrons orbit in surrounding empty space (10⁻¹⁰ m atomic radius) | atomic | ✅ visual | — | [`rutherford_alpha_scattering_experiment`] | [`rutherford_model_classical_instability_problem`, `bohr_first_postulate_stationary_orbits`] | NCERT §12.2 + HCV §43.1. Atom is 99.999% empty space. |
| `↳ atom_vs_solar_system_analogy_breaks` | NCERT Example 12.1: if atom scaled to solar system, electron would be 100× farther than Earth from Sun | nano | ✅ visual | — | — | — | The "atom-is-mostly-empty" sleeper-success anchor. |
| `distance_of_closest_approach` | d = 2Ze²/(4πε₀K); for 7.7 MeV α + gold (Z=79): d ≈ 3.0 × 10⁻¹⁴ m. Upper bound on nuclear radius. | atomic | ✅ formula | — | [`rutherford_alpha_scattering_experiment`, `electric_potential_energy`] | — | NCERT Example 12.2 + HCV §43.1. Energy-conservation derivation. |
| `rutherford_model_classical_instability_problem` | Classical EM theory: accelerating electron radiates → spirals into nucleus in ~10⁻⁸ s. Atoms shouldn't exist. | atomic | ✅ animated | — | [`rutherford_nuclear_model`, `em_radiation_from_accelerating_charge`] | [`bohr_first_postulate_stationary_orbits`] | NCERT §12.4 + HCV §43.3 + Fig 12.7. **The crisis that motivated Bohr.** |
| `↳ continuous_spectrum_prediction_failure` | Classical: spiraling electron emits continuous spectrum. Observation: hydrogen emits discrete line spectrum. Disagreement. | nano | ✅ | — | — | — | NCERT §12.4 paragraph 2. |
| `bohr_first_postulate_stationary_orbits` | Electron revolves in certain stable orbits WITHOUT emitting radiation (defies classical EM); these are "stationary states" | atomic | ✅ animated | — | [`rutherford_model_classical_instability_problem`] | [`bohr_second_postulate_angular_momentum_quantization`, `bohr_third_postulate_transition_photon_emission`] | NCERT §12.4(i) + HCV §43.4(a-b). |
| `bohr_second_postulate_angular_momentum_quantization` | L = nh/2π; angular momentum is integer multiple of h/2π; n = principal quantum number | atomic | ✅ formula+visual | — | [`bohr_first_postulate_stationary_orbits`, `angular_momentum_definition`] | [`bohr_radius_derivation`, `bohr_velocity_in_nth_orbit`] | NCERT §12.4(ii) eq 12.11 + HCV §43.4(d). |
| `↳ de_broglie_wave_interpretation` | Standing-wave condition 2πr = nλ + de Broglie λ = h/p gives mvr = nh/2π — Bohr postulate as de Broglie matter-wave standing-wave | nano | ✅ animated | — | [`de_broglie_wavelength`] | — | T46 cross-link. Beautiful retrospective justification. |
| `bohr_third_postulate_transition_photon_emission` | Electron jumps from higher energy E_i to lower E_f emitting photon of frequency ν: hν = E_i − E_f | atomic | ✅ animated | — | [`bohr_first_postulate_stationary_orbits`, `photon_energy_hf`] | [`bohr_energy_in_nth_orbit`, T45 ALL spectra atomics] | NCERT §12.4(iii) eq 12.12 + HCV §43.4(c). **THE bridge to T45 Atomic Spectra.** |
| `bohr_radius_derivation` | Combining postulate 2 + Coulomb's law: rₙ = (n²/m)(h/2π)²(4πε₀/e²); a₀ = r₁ = 5.29 × 10⁻¹¹ m (Bohr radius); rₙ ∝ n² | atomic | ✅ derivation | — | [`bohr_second_postulate_angular_momentum_quantization`, `coulombs_law`, `centripetal_force`] | [`bohr_velocity_in_nth_orbit`, `bohr_energy_in_nth_orbit`] | NCERT eq 12.15–12.16 + HCV §43.4 eq 43.3 (r₁ = 53 pm). |
| `bohr_velocity_in_nth_orbit` | vₙ = e/√(4πε₀mrₙ) = (1/n)(e²/4πε₀)(1/(h/2π)); v ∝ 1/n; v₁/c ≈ 1/137 (fine structure constant!) | atomic | ✅ formula | — | [`bohr_radius_derivation`] | [`bohr_energy_in_nth_orbit`] | NCERT eq 12.14 + HCV §43.4 eq 43.2. |
| `bohr_energy_in_nth_orbit` | Eₙ = K + U = −me⁴/(8ε₀²h²n²) = −13.6/n² eV; ground state E₁ = −13.6 eV | atomic | ✅ derivation+formula | — | [`bohr_radius_derivation`, `bohr_velocity_in_nth_orbit`, `electric_potential_energy`] | [`energy_level_diagram_hydrogen`, `ionization_energy_hydrogen`, T45 ALL spectra atomics] | NCERT eq 12.17–12.19 + HCV §43.4 eq 43.6, 43.8. **THE keystone formula of modern physics for Class 12.** |
| `energy_level_diagram_hydrogen` | E₁ = −13.6 eV, E₂ = −3.4 eV, E₃ = −1.51 eV, E₄ = −0.85 eV; levels converge to 0 at n = ∞; visualization | atomic | ✅ visual | — | [`bohr_energy_in_nth_orbit`] | [`ionization_energy_hydrogen`, `excitation_energy_excitation_potential`, T45 spectra series atomics] | NCERT Fig 12.8 + HCV Fig 43.4(b). The visual organizing principle of atomic physics. |
| `ionization_energy_hydrogen` | Energy to take electron from ground state to ∞: 13.6 eV. Ionization potential = 13.6 V. | atomic | ✅ minimal | — | [`energy_level_diagram_hydrogen`] | — | NCERT §12.4.1 + HCV §43.4 "Ionization potential". |
| `excitation_energy_excitation_potential` | Energy to raise atom from ground state to nth excited state. H first excited (n=2): E₂ − E₁ = 10.2 eV; potential = 10.2 V | atomic | ✅ minimal | — | [`energy_level_diagram_hydrogen`] | [`franck_hertz_experiment_verification`] | NCERT §12.4.1 + HCV §43.4 "Excitation potential". |
| `franck_hertz_experiment_verification` | Mercury vapor + variable-energy electron beam; energy absorbed only in discrete jumps (4.9 eV first); emitted at λ = 253 nm. Nobel 1925. | atomic | ✅ animated | — | [`excitation_energy_excitation_potential`, `bohr_third_postulate_transition_photon_emission`] | — | NCERT §12.4.1 inset box (p.428). **The strongest experimental proof of energy quantization.** Anchor: 1914 + 1925 Nobel. |
| `hydrogen_like_ion_Z_factor` | For He⁺, Li²⁺ (one electron, Z protons): rₙ = a₀n²/Z; Eₙ = −13.6 Z²/n² eV; vₙ proportional to Z/n | atomic | ✅ formula | — | [`bohr_radius_derivation`, `bohr_energy_in_nth_orbit`] | [T45 hydrogen-like ion spectra] | HCV eq 43.7 + Example 43.1. **JEE-Adv #1 pattern: "energy of He⁺ in first excited state."** |
| `bohr_model_limitations` | (1) Only one-electron atoms work; (2) cannot explain fine structure splittings; (3) no intensity predictions; (4) no Zeeman effect; (5) violates uncertainty principle | atomic | ✅ comparison | — | [`bohr_energy_in_nth_orbit`] | [`orbit_vs_orbital_quantum_mechanics`] | HCV §43.5. **Critical for cognitive honesty** — Bohr isn't "the" model. |
| `sommerfeld_elliptical_orbits_extension` | Circular orbits → elliptical (under inverse-square force); same energy formula holds; introduces orbital angular momentum quantum number ℓ | atomic | ✅ visual | — | [`bohr_energy_in_nth_orbit`] | [`orbit_vs_orbital_quantum_mechanics`] | NCERT p.426 paragraph 2. Anchor: **Sommerfeld's name routinely taught in Indian JEE prep**. |
| `orbit_vs_orbital_quantum_mechanics` | Bohr "orbit" = definite circular path. Quantum mechanics "orbital" = probability cloud ψ(r,t); ψ² is probability density | atomic | ✅ comparison | — | [`bohr_model_limitations`, `sommerfeld_elliptical_orbits_extension`] | [T46 wave-particle duality, T47-stage-3 quantum-mech atomics] | NCERT p.426 explicit inset + HCV §43.7. **The conceptual handoff from "Class 12 physics" to "you'll learn this in college."** |
| `↳ probability_density_psi_squared` | P(r)dr = |ψ|² dV; for ground state hydrogen, P(r) peaks at r = a₀ (matches Bohr radius!) | nano | ✅ visual | — | — | — | HCV Fig 43.5. Bohr's wrong picture happens to give right radius. |

**Total atomics: 20.** **Total nanos: ~6.**

---

## Section B — Dependency Graph (T47 internal)

```
thomson_plum_pudding_model
  ↳ rutherford_alpha_scattering_experiment
       ↳ rutherford_nuclear_model
            ↳ distance_of_closest_approach (terminal — JEE problem-pattern)
            ↳ rutherford_model_classical_instability_problem
                 ↳ bohr_first_postulate_stationary_orbits
                      ↳ bohr_second_postulate_angular_momentum_quantization
                           ↳ bohr_radius_derivation
                                ↳ bohr_velocity_in_nth_orbit
                                     ↳ bohr_energy_in_nth_orbit ★ keystone ★
                                          ↳ energy_level_diagram_hydrogen
                                               ↳ ionization_energy_hydrogen
                                               ↳ excitation_energy_excitation_potential
                                                    ↳ franck_hertz_experiment_verification
                                          ↳ hydrogen_like_ion_Z_factor
                                          ↳ T45 ALL spectra atomics (cross-topic)
                      ↳ bohr_third_postulate_transition_photon_emission ★ T45 bridge ★

bohr_energy_in_nth_orbit
  ↳ bohr_model_limitations
       ↳ orbit_vs_orbital_quantum_mechanics ← T46 cross-link

sommerfeld_elliptical_orbits_extension (parallel to Bohr)
  ↳ orbit_vs_orbital_quantum_mechanics
```

---

## Section C — Cross-Topic Dependencies (export to matrix)

**Dependencies INTO T47:**
- T30 Electrostatics A `coulombs_law` → `rutherford_alpha_scattering_experiment`, `bohr_radius_derivation`
- T30 Electrostatics A `electric_potential_energy` → `distance_of_closest_approach`, `bohr_energy_in_nth_orbit`
- T36 Moving Charges A33 `bohr_model_atom` (anticipated cross-link) → all Bohr atomics. **Bidirectional with T47 — T36 magnetic dipole moment of revolving electron uses Bohr framework.**
- T10 Circular Motion `centripetal_force` → `bohr_radius_derivation`
- T44 Wave Optics `polarisation_transverse_wave_proof` → `orbit_vs_orbital_quantum_mechanics` (wave-particle duality bridge)
- T44 Wave Optics `huygens_principle` + `single_slit_diffraction_geometry` → `de_broglie_wave_interpretation` (nano, via T46)
- math-tools (`calculus_minmax`, `calculus_integration_basics`) → derivation of orbit radius
- math-tools (`algebra_one_over_x_manipulation`) → energy-level formula
- math-tools (`series_binomial_expansion_and_approximation`) → relativistic corrections (advanced, deferred)

**Dependencies OUT of T47:**
- → T45 Atomic Spectra: `bohr_third_postulate_transition_photon_emission` + `bohr_energy_in_nth_orbit` + `energy_level_diagram_hydrogen` + `hydrogen_like_ion_Z_factor` are foundational for ALL T45 atomics
- → T46 Dual Nature: `bohr_model_limitations` + `orbit_vs_orbital_quantum_mechanics` bridge to wave-particle
- → T48 Nuclei (anticipated): `distance_of_closest_approach` upper-bound on nuclear size → nuclear radius (R₀A^(1/3)) atomic
- → T49 Semiconductor (weak): energy-band picture builds on energy-level diagram

**Edge count for T47:** ~9 IN (T10, T30, T36, T44, math-tools) + ~6 OUT (to T45, T46, T48).

---

## Section D — Anchor Inventory (Indian context, STRONG density)

| Atomic | Anchor | Why Indian-specific |
|---|---|---|
| `thomson_plum_pudding_model` | Watermelon-with-seeds analogy (Indian summer fruit) | NCERT uses this metaphor directly |
| `rutherford_alpha_scattering_experiment` | The diagram that EVERY Indian JEE/NEET aspirant memorizes | Universal Indian-student rite-of-passage |
| `rutherford_nuclear_model` | NCERT Example 12.1: solar system analogy (Indian-school astronomy context) | Cross-subject |
| `bohr_first/second/third_postulate` | Standard derivation taught in **every Indian coaching institute** (Allen Kota, FIITJEE, BYJU's) | Universal Indian JEE-prep culture |
| `bohr_energy_in_nth_orbit` | **−13.6 eV is the most-recognized number in Indian Class 12 physics** | Universal anchor |
| `franck_hertz_experiment_verification` | 1925 Nobel — predates **C.V. Raman's 1930 Nobel** which used similar spectroscopic principles | Bridges to Indian Nobel context |
| `hydrogen_like_ion_Z_factor` | **C.V. Raman's spectroscopy of various atomic systems** used this Z-scaling framework | Indian-Nobel anchor |
| `bohr_model_limitations` | Why **Meghnad Saha needed quantum statistics** (not just Bohr) for stellar ionization (Saha equation 1921) | Indian-astrophysics-Nobel-context |
| `sommerfeld_elliptical_orbits_extension` | Sommerfeld taught **Satyendra Nath Bose** during 1920s; Bose-Einstein statistics emerged from this lineage | Indian-quantum-physics-heritage |
| `orbit_vs_orbital_quantum_mechanics` | **TIFR Mumbai + IISc Bangalore atomic-physics research** uses orbital picture; **Indian Institute of Astrophysics (Bangalore)** uses Bohr picture for educational outreach | Modern Indian research anchor |

**Anchor density verdict: STRONG.** Every atomic anchors in Indian context. Indian quantum-physics heritage (Bose, Saha, Raman) gives this topic exceptional anchor richness. Authoring multiplier 1.0×.

---

## Section E — Simulatability Tagging

| Atomic family | Sim approach | Confidence |
|---|---|---|
| Historical models (Thomson, Rutherford nuclear) | Side-by-side comparison + alpha-particle paths through both models | HIGH |
| Alpha-scattering | Animated trajectories with adjustable impact parameter; histogram of deflection angles | HIGH |
| Distance-of-closest-approach | Energy-conservation animation with U(r) potential well | HIGH |
| Classical instability | Spiral-in animation showing radiation-loss; contrast with stable Bohr orbits | HIGH |
| Bohr postulates (all 3) | Discrete-orbit picture + photon-emission jump + quantized angular-momentum vector | HIGH |
| Bohr radius/velocity/energy derivations | Step-by-step algebra reveal overlaid on visual orbit | HIGH |
| Energy level diagram | Animated transitions between levels (this becomes the T45 sim foundation) | HIGH |
| Franck-Hertz | Voltage-vs-current curve with characteristic dips at 4.9 V, 9.8 V, 14.7 V | HIGH |
| Hydrogen-like ions | Same animations rescaled by Z² | HIGH |
| Bohr limitations | Comparison table + multi-electron failure visualization | MEDIUM |
| Sommerfeld elliptical | Orbit-shape animation parameterized by ℓ | MEDIUM (advanced) |
| Orbit-vs-orbital | Side-by-side: definite orbit vs probability cloud | HIGH |

**Verdict: ~90% high-confidence simulatable.** Atomic models are visualization-friendly (discrete orbits → discrete sims). The Schrödinger probability-cloud atomic is borderline (3D visualization is harder).

---

## Section F — V1 priority (deferred to Stage 5)

Tentative top candidates if forced today:
- `bohr_energy_in_nth_orbit` — THE keystone formula
- `rutherford_alpha_scattering_experiment` — JEE-recognized iconic experiment
- `bohr_radius_derivation` — derivation + formula
- `energy_level_diagram_hydrogen` — the visual organizing principle
- `hydrogen_like_ion_Z_factor` — JEE-Adv pattern

---

## Section G — Open Questions / Stage-4 Flags

1. **De Broglie wave-interpretation of Bohr postulate 2** currently a nano under `bohr_second_postulate`. Should it be its own atomic? It's the bridge between T47 atomics and T46 dual-nature. Arguably yes.
2. **`sommerfeld_elliptical_orbits_extension`** vs `bohr_model_limitations` — partial overlap. Sommerfeld is one of the things that "fixes" Bohr. Stage 4 may merge.
3. **JEE-Mains de-emphasizes Thomson model in recent years.** Keep as atomic? Yes — historical foundation; deletion would create gap.
4. **Schrödinger-equation introduction** (HCV §43.7) — currently subsumed under `orbit_vs_orbital_quantum_mechanics`. Should it be its own atomic? Argument FOR: it's the actual modern model. Argument AGAINST: derivation requires PDE math beyond Class 12. Stage 4 to decide; tentative: keep subsumed.
5. **Magnetic dipole moment of revolving electron** (T47 ↔ T36 bidirectional edge — HCV problem #25, T36 A33). Should T47 own this atomic, or T36? Currently T36 owns; T47 cites. Possible Stage-4 reassignment.

---

## Section H — Cross-Source Coverage Matrix

| Atomic | NCERT 12.2 Ch.12 | HCV2 Ch.43 | DCP O&M atomic chapter |
|---|:---:|:---:|:---:|
| `thomson_plum_pudding_model` | ✓ §12.1 | ✓ §43.1 | brief |
| `rutherford_alpha_scattering_experiment` | ✓ §12.2 + Figs 12.1-12.3 | ✓ §43.1 + Fig 43.1 | ✓ |
| `rutherford_nuclear_model` | ✓ §12.2 | ✓ §43.1 Fig 43.2 | ✓ |
| `distance_of_closest_approach` | ✓ Example 12.2 | ✓ | ✓ heavily |
| `rutherford_model_classical_instability` | ✓ §12.4 intro | ✓ §43.3 | ✓ |
| `bohr_first_postulate_stationary_orbits` | ✓ §12.4(i) | ✓ §43.4(a-b) | ✓ |
| `bohr_second_postulate_angular_momentum` | ✓ §12.4(ii) eq 12.11 | ✓ §43.4(d) | ✓ |
| `bohr_third_postulate_transition_photon` | ✓ §12.4(iii) eq 12.12 | ✓ §43.4(c) | ✓ |
| `bohr_radius_derivation` | ✓ eq 12.15-12.16 | ✓ §43.4 eq 43.3 | ✓ |
| `bohr_velocity_in_nth_orbit` | ✓ eq 12.14 | ✓ eq 43.2 | ✓ |
| `bohr_energy_in_nth_orbit` | ✓ eq 12.17-12.19 | ✓ eq 43.6, 43.8 | ✓ heavily |
| `energy_level_diagram_hydrogen` | ✓ Fig 12.8 | ✓ Fig 43.4(b) | ✓ |
| `ionization_energy_hydrogen` | ✓ §12.4.1 | ✓ §43.4 | ✓ |
| `excitation_energy_excitation_potential` | ✓ §12.4.1 | ✓ §43.4 | ✓ |
| `franck_hertz_experiment_verification` | ✓ §12.4.1 inset | absent | rare |
| `hydrogen_like_ion_Z_factor` | implicit | ✓ §43.4 eq 43.7 + Ex 43.1 | ✓ heavily |
| `bohr_model_limitations` | brief | ✓ §43.5 | minor |
| `sommerfeld_elliptical_orbits_extension` | ✓ p.426 paragraph 2 | brief | minor |
| `orbit_vs_orbital_quantum_mechanics` | ✓ p.426 inset | ✓ §43.7 | minor |

**Triple-coverage rate: ~85%.** NCERT and HCV are both strong; DCP carries the problem-pattern density. Franck-Hertz is the one exception (NCERT exclusive). **HCV is the dominant pedagogy source for T47** — its eq 43.2–43.9 chain is the cleanest derivation path.

---

## Section I — Anti-Plagiarism Probe

- Bohr's three postulates are 1913 physics — public domain.
- Standard formulas (a₀, rₙ, vₙ, Eₙ, ionization 13.6 eV) — universal.
- Energy-level diagram (Fig 12.8 NCERT / Fig 43.4 HCV) — we render our own labeled SVG.
- Alpha-scattering apparatus diagram — historical Geiger-Marsden photo widely reproduced; we draw our own schematic.
- NCERT Example 12.1 (solar-system analogy) — we use the conceptual framework with our own numbers.
- Indian anchors (Saha, Bose, Raman, TIFR, IISc, IIA) — public domain biographical content.

✅ Anti-plagiarism risk: LOW.

---

## Section J — Catalog Sign-off

- Total atomics: **20** + ~6 nanos
- Anchor strength: **STRONG** (every atomic anchorable; Indian-quantum-physics-heritage is exceptional anchor density for this topic)
- Simulatability: ~90% high-confidence
- Cross-topic edges: ~9 IN (T10, T30, T36, T44, math-tools) + ~6 OUT (to T45, T46, T48)
- Source-role triad: HCV dominant pedagogy (cleanest derivation eq 43.2-43.9); NCERT dominant anchor; DCP carries problem patterns
- Founder decisions: 7 (AM-G1..G7), stable with 15-pilot modal
- Stage-4 flags raised: 5 items (de Broglie nano-vs-atomic, Sommerfeld-vs-limitations overlap, Thomson scope, Schrödinger scope, T36↔T47 magnetic-dipole reassignment)

**Status: PILOT COMPLETE.** Modern Physics cluster officially opened. T45 next.
