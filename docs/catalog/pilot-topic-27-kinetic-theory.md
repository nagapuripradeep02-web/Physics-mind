# Pilot Topic 27 — Kinetic Theory of Gases

> Stage-2 pilot catalog. 27th of 44. **Thermodynamics cluster closer #2 of 2** (sibling: T26 Thermodynamics — same session paired-batch).
> Sources: **NCERT Class 11 Part 2 Ch.13 Kinetic Theory** (canonical spine) + **HCV Vol 2 Ch.24 Kinetic Theory of Gases** (derivation/pedagogy) + **DC Pandey Waves & Thermodynamics Ch.20 §20.5-20.10 Kinetic Theory of Gases** (problem patterns; embedded within larger Thermometry/Expansion chapter).
> Coverage class: **TRIPLE-COVERED**.
> Anchor density: **STRONG** — 10-11 institutional anchors but concentrated in research/atmospheric strands rather than industrial. Indian Institute of Tropical Meteorology Pune (atmospheric kinetic-theory applications), ISRO atmospheric science (INSAT meteorology, Vikram Sarabhai SC), IIT-Bombay/Madras/Kanpur kinetic-theory labs, CSIR-NPL gas thermometry, BARC noble-gas separations, Department of Earth Sciences IMD, NCMRWF weather modelling, agricultural meteorology (ICAR), aviation aerodynamics (HAL, DRDO Aeronautical Development Establishment), Mumbai/Delhi air-quality monitoring (CPCB PM2.5 + gas-diffusion). **STRONG, not VERY-STRONG** — confirms 6th data point: foundational-physics chapters (vs. applied-engineering) plateau at STRONG even with strong research anchoring. **Anchor-strand-diversity matters more than count alone.**
> **Critical role:** Kinetic Theory provides the microscopic foundation for thermodynamics — every macroscopic atomic in T26 (internal energy, Cp/Cv, entropy as ln W) has a microscopic origin here. PV = (1/3)Nm⟨v²⟩ + equipartition + Maxwell-Boltzmann distribution = the chapter's three pillars. **Closes 7 intra-session bidirectional edges with T26** AND **opens forward to T48 Nuclei (kinetic energy of fission fragments)** + **T38 EM Waves (radiation pressure analog)**.

---

## Founder Decisions Applied

| Tag | Decision |
|---|---|
| **KT-G1** | Atomic granularity = "one microscopic-to-macroscopic bridge OR one molecular property OR one statistical-mechanical concept." Pressure-from-collisions, RMS speed, mean free path, equipartition, Maxwell-Boltzmann distribution = five separate atomics. Each has a distinct derivation OR distinct statistical foundation OR distinct experimental test. |
| **KT-G2** | **Ideal gas equation PV = nRT is ONE atomic** (`ideal_gas_equation_atomic`) bundling Boyle's law (PV at const T) + Charles's law (V/T at const P) + Avogadro's hypothesis (n proportionality) + the empirical-to-theoretical bridge. Splitting destroys the unification narrative students need to see. |
| **KT-G3** | **Kinetic-theory pressure derivation (PV = (1/3)Nm⟨v²⟩) is its own atomic** (`kinetic_theory_pressure_atomic`) — the central derivation of the chapter. Foundation atomic. Geometric+momentum-flux derivation has 6+ named sub-steps, each a nano. |
| **KT-G4** | **RMS, mean, and most-probable speeds = ONE atomic** (`molecular_speed_distribution_atomic`) with v_rms = √(3kT/m), v_avg = √(8kT/πm), v_mp = √(2kT/m) as nanos. Bundling because they're three views of the same underlying distribution (Maxwell-Boltzmann). Splitting forces memorisation; bundling enables comparison. **Cognitive-error-prevention.** |
| **KT-G5** | **Equipartition theorem is its own atomic** (`equipartition_theorem_atomic`) — (1/2)kT per quadratic degree of freedom. Foundational for Cp/Cv ratios (T26 bridge). Author with explicit accounting for monatomic (3 dof), diatomic (5 dof rigid → 7 dof with vibration at high T), polyatomic (6 dof rigid). |
| **KT-G6** | **Mean free path is its own atomic** (`mean_free_path_atomic`) with λ = 1/(√2·n·π·d²) as central formula. Connects to atmospheric physics, diffusion, viscosity. Important applied bridge. |
| **KT-G7** | **Maxwell-Boltzmann distribution is its own atomic** (`maxwell_boltzmann_distribution_atomic`) — the chapter's statistical pillar. Diamond candidate (probability-density curve at varying T is one of the most visually compelling physics sims). NCERT Ch.13 introduces qualitatively; HCV2 + DCWT push further. Author at HCV depth. |
| **KT-G8** | **STRONG anchor (not VERY-STRONG).** 10-11 anchors but concentrated in research/atmospheric strands; only 1 strong industrial strand (atmospheric monitoring). **Confirms hypothesis at 6th data point:** foundational-physics chapters plateau at STRONG; applied-engineering chapters reach VERY-STRONG. **Anchor-strand-diversity, not anchor-count alone, distinguishes the two buckets.** Recommend Stage-4 formalize the "strand diversity ≥ 8" criterion as VERY-STRONG threshold (rather than raw anchor count ≥ 13). |
| **KT-G9** | **Boltzmann's S = k ln W is registered as a NANO** under `entropy_atomic` (T26), NOT as standalone atomic in T27. Reason: it's the statistical-mechanical interpretation of thermodynamic entropy — primary residence is T26 entropy atomic, T27 provides the microscopic-counting basis. Cross-cluster bridge nano. |
| **KT-G10** | **Cognitive-error-prevention sub-category continues.** T27 contributes: KT-G4 (3 molecular speeds bundled to prevent memorisation-without-comparison); `degrees_of_freedom_translational_vs_rotational_vs_vibrational_nano` (students conflate; explicit table required); `temperature_is_translational_KE_not_total_KE_nano` (subtle but key: T relates to translational only via (3/2)kT per molecule, rotational+vibrational add to Cv but not to T directly). |

---

## Section A — Source Map

| Sub-topic | NCERT 11.2 Ch.13 | HCV V2 Ch.24 | DCWT Ch.20 (§20.5-20.10) |
|---|---|---|---|
| Molecular nature of matter + assumptions of KT | §13.1-13.2 | §24.1-24.2 | §20.5 |
| Ideal gas equation (PV=nRT) | §13.3 | §24.3 | §20.6 |
| Pressure of ideal gas (PV = (1/3)Nm⟨v²⟩) | §13.4 | §24.4 | §20.7 |
| Kinetic interpretation of temperature ((1/2)m⟨v²⟩ = (3/2)kT) | §13.5 | §24.5 | §20.7 |
| Degrees of freedom + equipartition | §13.6 | §24.6 | §20.8 |
| Specific heat capacity from KT | §13.7 | §24.7 | §20.8 |
| Mean free path | §13.8 | §24.8 | §20.9 |
| Maxwell-Boltzmann distribution + RMS/avg/MP speeds | §13.6 (boxed) | §24.9-24.10 | §20.10 |
| Brownian motion + diffusion | (NCERT-light) | §24.11 (real-gas correction) | §20.11 (applied) |

**NCERT Ch.13 is comparatively compact** (~17 pages). HCV2 Ch.24 has the deepest derivations (8 worked examples in §24.4 pressure derivation alone). DCWT Ch.20 embeds kinetic theory within a larger thermometry/expansion chapter — sections §20.5-20.10 are the relevant subset.

---

## Section B — Atomic + Nano Catalog

| ID | Concept | Type | Sim? | In repo? | Requires | Required-by | Notes |
|---|---|---|---|---|---|---|---|
| **kt_assumptions_atomic** | Molecules are point particles + identical mass + random motion + elastic collisions + negligible inter-molecular volume vs container volume + Newtonian mechanics applies | atomic | ✅ | — | — | [kinetic_theory_pressure_atomic, ideal_gas_equation_atomic, mean_free_path_atomic] | Foundational assumptions atomic; cognitive-prep for "ideal" vs "real" gas |
| ↳ point_particle_vs_real_molecule_nano | Real molecules have finite size + intermolecular forces (van der Waals); ideal-gas treatment is the high-T low-P limit | nano | — | — | [kt_assumptions_atomic] | — | parent: kt_assumptions_atomic |
| **ideal_gas_equation_atomic** | PV = nRT (macroscopic); equivalent forms PV = NkT (per-molecule) and P = ρRT/M (density form). Bundles Boyle, Charles, Avogadro. | atomic | ✅ | — | [kt_assumptions_atomic] | [kinetic_theory_pressure_atomic, isothermal_process_atomic(T26), isobaric_process_atomic(T26), isochoric_process_atomic(T26)] | KT-G2; **bridge atomic to all four T26 process atomics** |
| ↳ boyle_charles_avogadro_unification_nano | Boyle: PV=const at fixed T; Charles: V/T=const at fixed P; Avogadro: V ∝ n at fixed P,T. All three reconciled in PV=nRT. | nano | ✅ | — | [ideal_gas_equation_atomic] | — | parent: ideal_gas_equation_atomic |
| ↳ universal_gas_constant_R_nano | R = 8.314 J/(mol·K); k = R/N_A = 1.38 × 10⁻²³ J/K (Boltzmann constant); SI-unit reconciliation | nano | — | — | [ideal_gas_equation_atomic] | — | parent: ideal_gas_equation_atomic |
| **kinetic_theory_pressure_atomic** | PV = (1/3)Nm⟨v²⟩; pressure as time-averaged momentum-flux from molecular collisions on container walls; central derivation of chapter | atomic | ✅ | — | [kt_assumptions_atomic, ideal_gas_equation_atomic, momentum_change_in_elastic_collision(T14)] | [kinetic_temperature_atomic, molecular_speed_distribution_atomic] | KT-G3; **central derivation atomic; Diamond candidate** — molecules bouncing in box → pressure on wall sim |
| ↳ momentum_flux_per_collision_nano | Single molecule with v_x hits wall: Δp = 2mv_x; collision rate per molecule = v_x/(2L); pressure contribution per molecule = mv_x²/V | nano | ✅ | — | [kinetic_theory_pressure_atomic] | — | parent: kinetic_theory_pressure_atomic |
| ↳ isotropy_factor_one_third_nano | ⟨v_x²⟩ = ⟨v_y²⟩ = ⟨v_z²⟩ = ⟨v²⟩/3 by isotropy → factor 1/3 in PV = (1/3)Nm⟨v²⟩ | nano | ✅ | — | [kinetic_theory_pressure_atomic] | — | parent: kinetic_theory_pressure_atomic |
| **kinetic_temperature_atomic** | (1/2)m⟨v²⟩ = (3/2)kT — temperature is proportional to per-molecule average translational kinetic energy | atomic | ✅ | — | [kinetic_theory_pressure_atomic, ideal_gas_equation_atomic] | [molecular_speed_distribution_atomic, equipartition_theorem_atomic, internal_energy_atomic(T26)] | The microscopic-to-macroscopic bridge atomic; **closes T26 internal_energy ← T27 microscopic origin** |
| ↳ temperature_is_translational_ke_not_total_ke_nano | T relates only to translational KE per (3/2)kT per molecule; rotational + vibrational KE contribute to Cv but not directly to T. **Cognitive-error-prevention nano** — subtle but central misconception. | nano | ✅ | — | [kinetic_temperature_atomic, equipartition_theorem_atomic] | — | parent: kinetic_temperature_atomic; KT-G10 cognitive-error-prevention |
| **molecular_speed_distribution_atomic** | v_rms = √(3kT/m), v_avg = √(8kT/πm), v_mp = √(2kT/m); inequality v_mp < v_avg < v_rms | atomic | ✅ | — | [kinetic_temperature_atomic, maxwell_boltzmann_distribution_atomic] | [mean_free_path_atomic, equipartition_theorem_atomic] | KT-G4; cognitive-error-prevention bundling |
| ↳ three_speed_comparison_table_nano | Side-by-side table: name, formula, numerical-ratio at fixed T (v_mp : v_avg : v_rms ≈ 1.000 : 1.128 : 1.225) | nano | ✅ | — | [molecular_speed_distribution_atomic] | — | parent: molecular_speed_distribution_atomic; KT-G4 cognitive-error-prevention nano |
| ↳ rms_speed_n2_o2_at_300k_nano | N₂ at 300 K: v_rms ≈ 517 m/s; O₂ at 300 K: v_rms ≈ 484 m/s; H₂ at 300 K: v_rms ≈ 1928 m/s (~Earth-escape relevant) | nano | ✅ | — | [molecular_speed_distribution_atomic] | — | parent: molecular_speed_distribution_atomic |
| **maxwell_boltzmann_distribution_atomic** | f(v) = 4π(m/2πkT)^(3/2) v² exp(−mv²/2kT); probability-density of molecular speeds; peaks at v_mp; broadens with T | atomic | ✅ | — | [kinetic_temperature_atomic, gaussian_distribution(math-tools NEW), integration_of_gaussian(math-tools)] | [molecular_speed_distribution_atomic, equipartition_theorem_atomic] | KT-G7; **Diamond candidate** — probability-density curve at varying T = one of physics' most compelling sims |
| ↳ distribution_widens_with_temperature_nano | At higher T: peak shifts right (higher v_mp), peak height decreases, total area stays = 1; the high-speed tail lengthens | nano | ✅ | — | [maxwell_boltzmann_distribution_atomic] | — | parent: maxwell_boltzmann_distribution_atomic |
| ↳ high_speed_tail_for_reaction_rates_nano | Reaction rates depend on fraction of molecules with KE > activation energy → exponential tail dominates; basis for Arrhenius equation (chemistry) | nano | — | — | [maxwell_boltzmann_distribution_atomic] | — | parent: maxwell_boltzmann_distribution_atomic; chemistry-bridge nano |
| **equipartition_theorem_atomic** | Each quadratic degree of freedom (KE or PE) contributes (1/2)kT to average per-molecule energy; total U = (f/2)NkT for f dof per molecule | atomic | ✅ | — | [kinetic_temperature_atomic, molecular_speed_distribution_atomic] | [specific_heat_atomic(T26), gamma_for_mono_di_polyatomic_nano(T26)] | KT-G5; **closes T26 Cp/Cv ratio derivation** |
| ↳ degrees_of_freedom_table_nano | Side-by-side table: Monatomic (3 trans, f=3, γ=5/3, Cv=3R/2). Diatomic rigid (3 trans + 2 rot, f=5, γ=7/5, Cv=5R/2). Diatomic with vib at high T (f=7, γ=9/7, Cv=7R/2). Polyatomic linear (f=5-7), nonlinear (f=6+). **Cognitive-error-prevention nano** — students conflate the three. | nano | ✅ | — | [equipartition_theorem_atomic] | [gamma_for_mono_di_polyatomic_nano(T26)] | parent: equipartition_theorem_atomic; KT-G10 cognitive-error-prevention |
| ↳ vibrational_modes_kick_in_at_high_t_nano | Diatomic at room T: f=5 (3 trans + 2 rot). Above ~1000 K: vibrational modes activated → f=7. Explains why Cv is not strictly constant. | nano | — | — | [equipartition_theorem_atomic, degrees_of_freedom_table_nano] | — | parent: equipartition_theorem_atomic |
| **mean_free_path_atomic** | λ = 1/(√2·n·π·d²); average distance a molecule travels between collisions; bridges molecular-scale to bulk-transport phenomena (viscosity, diffusion, conduction) | atomic | ✅ | — | [kt_assumptions_atomic, ideal_gas_equation_atomic, molecular_speed_distribution_atomic] | — | KT-G6; applied-physics atomic |
| ↳ mfp_air_at_stp_nano | Air at STP: λ ≈ 70 nm; n ≈ 2.7 × 10²⁵ /m³; d ≈ 0.37 nm. Validates point-particle assumption (λ ≫ d) | nano | ✅ | — | [mean_free_path_atomic] | — | parent: mean_free_path_atomic |
| ↳ atmospheric_diffusion_imd_ncmrwf_nano | MFP increases at high altitude (low n) → diffusion becomes dominant transport mechanism; IMD/NCMRWF weather models use kinetic-theory-derived diffusion coefficients for pollutant transport (CPCB Mumbai/Delhi PM2.5 dispersion) | nano | — | — | [mean_free_path_atomic] | — | parent: mean_free_path_atomic; **research/atmospheric anchor: IMD + NCMRWF + CPCB** |
| ↳ vacuum_quality_via_mfp_nano | Lab vacuum: P=10⁻⁶ torr → λ ~ 50 m ≫ chamber size → molecular-flow regime (vs viscous flow). ISRO satellite-thermal labs + BARC noble-gas separation operate in this regime. | nano | — | — | [mean_free_path_atomic] | — | parent: mean_free_path_atomic; ISRO + BARC anchor |
| ↳ statistical_entropy_boltzmann_nano | S = k ln W where W = number of microstates compatible with macrostate. Boltzmann's gravestone equation. Bridges to T26 entropy_atomic. | nano | ✅ | — | [maxwell_boltzmann_distribution_atomic, entropy_atomic(T26)] | — | parent (cross-cluster): entropy_atomic(T26); **bidirectional bridge nano** |

**Atomic count:** 8. **Nano count:** ~16. **Total entries:** 24.

---

## Section C — Cross-Source Coverage Matrix

| Atomic | NCERT 11.2 Ch.13 | HCV2 Ch.24 | DCWT Ch.20 (§20.5-20.10) | Coverage |
|---|---|---|---|---|
| kt_assumptions_atomic | §13.1-13.2 | §24.1-24.2 | §20.5 | TRIPLE |
| ideal_gas_equation_atomic | §13.3 | §24.3 | §20.6 | TRIPLE |
| kinetic_theory_pressure_atomic | §13.4 | §24.4 (full deriv) | §20.7 | TRIPLE |
| kinetic_temperature_atomic | §13.5 | §24.5 | §20.7 | TRIPLE |
| molecular_speed_distribution_atomic | §13.6 (boxed) | §24.9 | §20.10 | TRIPLE |
| maxwell_boltzmann_distribution_atomic | §13.6 (qualitative) | §24.10 (full) | §20.10 (full) | TRIPLE (NCERT qualitative; HCV/DCP full) |
| equipartition_theorem_atomic | §13.6 + §13.7 | §24.6 + §24.7 | §20.8 | TRIPLE |
| mean_free_path_atomic | §13.8 | §24.8 | §20.9 | TRIPLE |

**Triple-coverage rate:** 8 of 8 atomics = **100%**. **Seventh observed 100% topic** in 27 pilots (after T48, T35, T38, T37, T39, T26). **Seven consecutive 100% topics — longest 100% streak observed in Stage-2.** The Maxwell-Boltzmann distribution atomic has the NCERT-qualitative caveat (qualitative-only in NCERT, full derivation in HCV+DCP) — still counts as TRIPLE because all three sources address it.

**Pattern-signal note:** 7 consecutive 100% topics now spans Optics-end (T38/T37/T39 E&M) + Modern Physics (T48) + Thermodynamics opener (T26/T27 plus T35 from earlier session). **All applied-physics chapters that survived NCERT 2023.** Hypothesis at this point is at near-confirmation: **the curricular core of NCERT post-2023 is uniformly triple-covered across NCERT + HCV + DCP.**

---

## Section D — Stage-3 Math-Tool Dependencies

| Math-tool primitive | Used by | Status |
|---|---|---|
| `momentum_change_in_collision` (Δp = 2mv) | kinetic_theory_pressure_atomic | REQUIRED (T14 momentum bundle pending — flag as cross-reference) |
| `averaging_v_squared` (⟨v²⟩ = (1/N)Σvᵢ²) | kinetic_theory_pressure_atomic | REQUIRED (existing math-tool: statistical_averaging) |
| `gaussian_distribution` (∝ exp(−x²/σ²)) | maxwell_boltzmann_distribution_atomic | **NEW STUB** — first cross-domain use; T48 nuclear-decay had `calculus_exponential_decay` but not Gaussian; first observation in Stage-2 |
| `integration_of_gaussian` (∫v² exp(−αv²)dv) | maxwell_boltzmann_distribution_atomic, molecular_speed_distribution_atomic | **NEW STUB** — companion to gaussian_distribution; advanced integration primitive |
| `square_root_and_squaring` (v_rms = √⟨v²⟩) | molecular_speed_distribution_atomic | REQUIRED (already in math-tools, multi-domain) |
| `statistical_ensemble_averaging` | kinetic_theory_pressure_atomic, equipartition_theorem_atomic | **NEW STUB** — abstract statistical primitive; first observation |

**THREE new stubs registered:** `gaussian_distribution`, `integration_of_gaussian`, `statistical_ensemble_averaging`. Combined with T26's 3 new stubs (`power_function_pv_gamma`, `pv_diagram_visualization`, `state_function_concept`), **Session 49 introduces 6 new math-tools stubs — the highest single-session stub count observed.** Math-tools IN-degree: 44 → 47 (T26 stubs) → 50 (T27 stubs). **Thermodynamics+Kinetic-Theory pair introduces a distinct mathematical vocabulary** (PV-diagrams, state-functions, Gaussian distributions, statistical-mechanical averaging) that didn't surface in Mechanics/E&M/Optics/Modern-Physics topics. **Stage-3 math-tools file is no longer in maintenance mode — Session 49 broke the 3-session stable streak.**

---

## Section E — Cross-Topic Dependencies (Bidirectional Edges)

### Outgoing (T27 requires from earlier topics)

| Target topic | Edge | Reason |
|---|---|---|
| T14 Momentum/Collisions (forward — not yet catalogued) | kinetic_theory_pressure_atomic ← elastic_collision_momentum_change | Pressure derivation uses Δp = 2mv_x; T14 will provide foundation |
| **T26 Thermodynamics (intra-session)** | 7 bidirectional edges (see T26 §E for full list) | Microscopic foundation of T26 atomics |
| Math-tools | 6 primitives incl. 3 new stubs | Statistical-mechanical vocabulary first appearance |

### Incoming (T27 will be required by later topics)

| Source topic | Edge | Reason |
|---|---|---|
| T48 Nuclei (back-edge — distant) | nuclear_kinetic_energy_distribution ← maxwell_boltzmann_distribution_atomic (analog) | Fission fragments distribute KE; same statistical machinery |
| T38 EM Waves (back-edge — distant) | radiation_pressure ← kinetic_theory_pressure_atomic (analog) | Photons exert pressure via same momentum-flux logic |
| **T26 Thermodynamics (intra-session)** | 7 bidirectional edges (see T26 §E) | Macroscopic T26 atomics depend on T27 microscopic origins |
| T18 Elasticity (forward — not yet catalogued) | bulk_modulus_microscopic ← kt_assumptions_atomic (analog for solids) | Solid-state pressure-response uses analog logic |

### T26 ↔ T27 intra-session bidirectional edges (7 edges; full list in T26 §E)

Recapping for completeness:
1. T26 `internal_energy_atomic` ← T27 `kinetic_temperature_atomic` (microscopic origin of U)
2. T26 `specific_heat_atomic` ← T27 `equipartition_theorem_atomic` (microscopic Cp/Cv)
3. T26 `gamma_for_mono_di_polyatomic_nano` ← T27 `degrees_of_freedom_table_nano` (γ values)
4. T26 `entropy_atomic` ← T27 `statistical_entropy_boltzmann_nano` (S = k ln W)
5. T26 `adiabatic_process_atomic` ↔ T27 `kinetic_theory_pressure_atomic` (PV=nRT foundation)
6. T26 `first_law_atomic` → T27 `kinetic_theory_pressure_atomic` (energy conservation underpins derivation)
7. T26 `isothermal_process_atomic` ↔ T27 `ideal_gas_equation_atomic` (isothermal IS PV=const)

**7 bidirectional edges = same-cluster chapter-adjacent density.** Matches T37↔T39 (8), T35↔T38 (6). **5th data point in the chapter-adjacent paired-batch density band.**

**Total outgoing edges from T27: 2 forward + 7 intra-session bidirectional + 6 math-tools.** **Total incoming: 4 back-edges (2 actual + 2 anticipated).**

---

## Section F — Real-World Anchors (STRONG, Indian-context)

| Anchor | Concept hook | Authoring use | Strand |
|---|---|---|---|
| **Indian Institute of Tropical Meteorology Pune (IITM)** | maxwell_boltzmann_distribution_atomic, mean_free_path_atomic, atmospheric_diffusion_imd_ncmrwf_nano | "IITM Pune runs India's atmospheric general-circulation models; kinetic-theory-derived diffusion coefficients drive pollutant + monsoon forecasts" | Research + Atmospheric |
| **ISRO atmospheric science (INSAT meteorology, Vikram Sarabhai SC, ISRO Mars Orbiter atmospheric Doppler)** | maxwell_boltzmann_distribution_atomic, mean_free_path_atomic | "MOM measured Martian atmospheric escape via MB-tail H₂ velocity; ISRO INSAT-3DR observes Earth atmosphere" | Research + Space |
| **CSIR-NPL gas thermometry + primary T standard** | kinetic_temperature_atomic, ideal_gas_equation_atomic | "ITS-90 primary thermometer uses ideal-gas behaviour; CSIR-NPL maintains India's national standard" | Research |
| **IIT-Bombay, IIT-Madras, IIT-Kanpur kinetic-theory labs** | maxwell_boltzmann_distribution_atomic, mean_free_path_atomic, kinetic_theory_pressure_atomic | "All major IIT physics depts run molecular-dynamics simulation courses; kinetic theory is foundational" | Research + Academia |
| **BARC noble-gas separation (Xe, Ar isotope separation)** | mean_free_path_atomic, vacuum_quality_via_mfp_nano, molecular_speed_distribution_atomic | "Noble-gas separation via thermal diffusion exploits v_rms ∝ 1/√m → light isotopes diffuse faster" | Research + Industry |
| **India Meteorological Department (IMD) + NCMRWF weather modelling** | maxwell_boltzmann_distribution_atomic, mean_free_path_atomic | "IMD Delhi + NCMRWF Noida run NWP models with KT-derived turbulent diffusion; ~1B Indians depend on these forecasts" | Research + Atmospheric + Public Service |
| **CPCB PM2.5 + air-quality monitoring (Mumbai, Delhi)** | mean_free_path_atomic, atmospheric_diffusion_imd_ncmrwf_nano | "PM2.5 transport in urban airshed = kinetic-theory diffusion + gravitational settling; CPCB stations across India use KT-modelled dispersion" | Public + Health |
| **HAL + DRDO Aeronautical Development Establishment Bengaluru (aerodynamics)** | kinetic_theory_pressure_atomic, kt_assumptions_atomic | "Aircraft wing-pressure modelling uses molecular-flux logic at high altitude (where MFP grows)" | Aviation + Defence |
| **ICAR + state agricultural universities (agricultural meteorology)** | mean_free_path_atomic, maxwell_boltzmann_distribution_atomic | "Wind-driven seed dispersal + pesticide drift = KT-derived diffusion modelling" | Agriculture |
| **Department of Earth Sciences (DES) — government policy + climate modelling** | maxwell_boltzmann_distribution_atomic, mean_free_path_atomic | "MoEFCC climate-modelling efforts at IITM/NCMRWF feed national climate policy" | Policy + Research |
| **Pressure-cooker (revisit from T26)** | kinetic_theory_pressure_atomic, ideal_gas_equation_atomic | "Pressure-cooker physics: increased n → higher P at fixed V → kinetic-theory derivation directly visible" | Residential (cross-reference) |

**Total: 11 distinct institutional anchors across 7-8 strands** (research, atmospheric, space, academia, industry, public-service, aviation, agriculture). **Falls short of 13-anchor VERY-STRONG threshold AND falls short of 9-strand diversity criterion.** **Decision (KT-G8):** **STRONG, not VERY-STRONG**. **Pattern signal sharpened — applied-engineering chapters (T39 AC, T26 Thermodynamics, T48-T50 Modern Physics) hit VERY-STRONG; foundational-physics chapters (T27 Kinetic Theory, T16 Gravitation, T30 Electrostatics) plateau at STRONG.** **6th data point confirming the bucket distinction.** Recommend Stage-4 formalize **strand-diversity ≥ 8** as the VERY-STRONG criterion (anchor count is necessary but insufficient).

---

## Section G — Cognitive-Error-Prevention Decisions

Continuing the ~30-42% pattern. T27 cognitive-error-prevention decisions:

- **KT-G4** (`molecular_speed_distribution_atomic` bundling v_rms, v_avg, v_mp into one atomic with comparison nano) — prevents memorisation-without-comparison error.
- **KT-G10** (`temperature_is_translational_ke_not_total_ke_nano`) — subtle but central: T ∝ ⟨KE_trans⟩, not ⟨KE_total⟩; rotational + vibrational contribute to U but not directly to T.
- **KT-G10** (`degrees_of_freedom_table_nano` — explicit table) — prevents conflating translational/rotational/vibrational degrees of freedom.

**3 of 10 founder decisions are cognitive-error-prevention type = 30%.** Below T26's 42% but matches the 25-pilot mean. Combined Session 49: **8 of 22 = 36%** — sustains the 35-38% range. **Cognitive-error-prevention sub-category is the modal founder-decision type across 27 pilots.** **TD-G11 Stage-4 formalisation is overdue** — recommend Stage-4 consolidation half-session this session formalises it.

---

## Section H — V1 Priority Flags

| Atomic | V1? | Reason |
|---|---|---|
| kinetic_theory_pressure_atomic | ✅ | Central derivation of chapter; Diamond candidate; bridge to T26 |
| ideal_gas_equation_atomic | ✅ | Foundational; every downstream atomic + every T26 process atomic builds on it |
| kinetic_temperature_atomic | ✅ | Microscopic-to-macroscopic bridge; closes T26 internal_energy edge |
| equipartition_theorem_atomic | ✅ | Diamond candidate; closes T26 Cp/Cv ratio; cognitive-error-prevention nano density |
| maxwell_boltzmann_distribution_atomic | ✅ | Diamond candidate — probability-density curve at varying T is one of physics' most compelling sims |
| molecular_speed_distribution_atomic | ⚖️ | V1.1; ships well after MB distribution |
| mean_free_path_atomic | ⚖️ | V1.1; applied-bridge atomic; atmospheric anchor |
| kt_assumptions_atomic | ⚖️ | V1.2; foundational but abstract |

**V1 ship count for T27: 5 atomics.** Matches Session-49 average; T27 is the foundational-physics partner in the paired-batch.

---

## Section I — Open Questions

1. **Real gases + van der Waals equation** — covered in HCV2 §24.11 + DCWT §20.11; defer to V1.1 nano under `ideal_gas_equation_atomic` (P + a/V²)(V−b) = nRT.
2. **Brownian motion** — NCERT-light; HCV gives qualitative treatment; defer to V1.2 nano.
3. **Diffusion coefficient quantitative derivation** — HCV2 §24.12 (advanced); defer to V2.
4. **Thermal conductivity from kinetic theory** — HCV2 §24.13 (advanced); cross-link to T-thermal-properties chapter.
5. **Joule-Thomson effect** — graduate-level; defer to V2 / chemistry-bridge.
6. **NCERT 2023 status of Ch.13** — confirmed unchanged; full chapter retained. (Distinct from T26 §12.13 entropy condensation.)
7. **Statistical entropy bridge nano** — `statistical_entropy_boltzmann_nano` registered as nano under T27 with bidirectional bridge to T26 `entropy_atomic`. Sole cross-cluster-bridge nano.
8. **Strand-diversity-vs-anchor-count distinction** — KT-G8 raises this. Stage-4 should formalize criterion.

---

## Section J — Sign-Off

- Authored: Session 49, 2026-05-25.
- Author: Claude (Architect+Engineer role).
- Coverage class: **TRIPLE**.
- Anchor density: **STRONG** (11 anchors across 7-8 strands — 6th data point distinguishing STRONG from VERY-STRONG).
- Triple-coverage rate: **100%** (8/8) — **7th observed 100% topic** in 27 pilots — **7 consecutive 100% topics (longest streak in Stage-2)**.
- Atomic count: **8**. Nano count: **16**. Total: **24 entries**.
- V1 ship count: **5 atomics**.
- **Closes 0 deferred dependencies and opens 7 intra-session bidirectional edges with T26 Thermodynamics.**
- **Thermodynamics cluster closed at 2/3 topics** — T-thermal-properties (Ch.11) + V2 phase-transitions remain. Net thermodynamics-cluster catalog: T26 + T27 atomics ≈ 21; cluster total = 21 atomics + 34 nanos = 55 entries.
- **3 new math-tools stubs registered:** `gaussian_distribution`, `integration_of_gaussian`, `statistical_ensemble_averaging`. Combined Session 49 stub count = 6 (highest single-session count observed).
- Cognitive-error-prevention founder-decision share: **30%** (T26 + T27 combined Session 49: 8/22 = 36%) — sustains 35-38% range over 4 consecutive sessions.
- **Stage-4 numbering reconciliation #2 resolved:** Kinetic Theory correctly numbered T27 (not T19 per informal earlier references).
- Next pilot batch: pending founder greenlight after Stage-4 consolidation half-session.

---

*7 consecutive 100% triple-coverage topics. Anchor-bucket distinction sharpened: applied-engineering = VERY-STRONG, foundational-physics = STRONG. Math-tools file came out of maintenance mode — 6 new stubs in one session (Session 49) confirms Thermodynamics+KT introduces distinct mathematical vocabulary. Cognitive-error-prevention sub-category formalisation now overdue.*
