# Physical Chemistry Build Plan — v1.0 (the full concept map, clusters PC-1 → PC-10)

> **Status: PLANNING ARTIFACT (Rule 17) — 2026-08-09.**
> Sibling of `docs/ORGANIC_BUILD_PLAN.md`, built the same way: every physical-chemistry concept that
> earns a simulation across CBSE + JEE + NEET and the international boards, filtered through the
> Session-C5 whiteboard test and mapped to the engine each one needs.
>
> **⚠ ORDER IS A DEFAULT, NOT A CONTRACT** (founder, 2026-07-27, C5 §6).
> **⚠ Rule 38g — every curriculum cell is a CLAIM.** Only CBSE/NCERT is author-verified.

---

## 1. The headline: physical chemistry is the INVERSE of organic

Two findings decide everything below, and both cut the opposite way from the organic plan.

### 1a. Curriculum intersection is EXCELLENT — because AP is a physical-chemistry exam

`ORGANIC_BUILD_PLAN.md` §1 recorded that AP Chemistry removed organic mechanisms entirely, capping a
top organic diamond at ~4/6. **The same fact makes physical chemistry the strongest cluster in the
subject:** AP Chemistry is *almost entirely* physical chemistry — thermodynamics, kinetics,
equilibrium, acid–base, electrochemistry, intermolecular forces. IB and A-level carry it just as
heavily, IGCSE covers the foundations, and it is the backbone of CBSE Cl.11 Ch.5/6 + Cl.12 Ch.1/2/3
plus a very large share of JEE and NEET.

**A physical-chemistry diamond routinely scores 6/6 where an organic diamond scores 4/6.**

### 1b. It is ~90% 2D — the engines are already built

| | Organic | Physical |
|---|---|---|
| Unbuilt sims | 32 | **46** |
| Needing 3D | **32 (all of them)** | **4** |
| New engines required | 3 large 3D builds | 3 modest scenarios |
| Sims buildable with **zero** engine work | 0 | **~38** |

Physical chemistry lives in particle boxes, graphs and energy ladders — archetypes **M, N and L, all
[LIVE] today**. Organic needed three new 3D engines before a single concept could be authored. This
one needs none for the first 38 sims.

**This is the cheap path.** If budget is the constraint, physical chemistry is where the roadmap goes.

---

## 2. What is already built (14 chemistry concepts on master)

**Physical chemistry (9):** `bohr_model_energy_levels` · `atomic_orbitals_s_p_d` ·
`kinetic_particle_theory` · `collision_theory_activation_energy` · `dynamic_equilibrium` ·
`le_chateliers_principle` · `law_of_conservation_of_mass` (demo-tier reference) ·
`rate_of_reaction` + `rate_law_and_order` (merged 2026-08-09, **WIP — not baseline-locked**).

**Structure & bonding, adjacent (5):** `vsepr_molecular_shapes` · `hybridisation_sp_sp2_sp3` ·
`sigma_pi_bonding` · `bond_polarity_dipole_moment` · `hydrogen_bonding`.

**In flight:** `atomic_and_ionic_radius` + `ionisation_enthalpy` (PR #88; failed Checkpoint B, five
`field3d-surgeon` dispatches queued).

**Do NOT re-build Maxwell–Boltzmann as a standalone.** C5 §6 ranked it #5, but
`collision_theory_activation_energy` already teaches it across four states ("Almost none carry enough
energy" · "A barrier sits on the speeds" · "Hotter: the fast tail grows" · "Barrier drops, same
speeds"). The ranked list predates that build.

---

## 3. THE FULL LIST — 46 simulations in 10 clusters

Tier: 💎 diamond · ⭐ strong. **D** = dimensionality; 🧊 marks the only four needing the Three.js
surface. **`concept_id`s below are PROPOSALS** — none is registered at any site yet, and chemistry ids
stay out of the 8 physics registration sites until the chemistry serving path lands (Gate 8b).

### PC-1 — Gases & kinetic theory · `gas_box` **[LIVE]** · 4 sims

| # | concept_id | Concept | D | Tier | Curricula |
|---|---|---|---|---|---|
| 1 | `gas_laws_boyle_charles` | Gas laws (Boyle · Charles · ideal gas) | 2D | ⭐ | 5/6 ⚠ |
| 2 | `diffusion_and_grahams_law` | Diffusion / Graham's law | 2D | ⭐ | 4/6 ⚠ |
| 3 | `real_gases_van_der_waals` | Real gases / van der Waals / compressibility Z | 2D | ⭐ | 4/6 ⚠ |
| 4 | `vapour_pressure_and_boiling` | Vapour pressure & boiling | 2D | ⭐ | 4/6 ⚠ |

⚠ = States-of-Matter topics removed from the rationalised NCERT. Strong internationally, weak on CBSE.
The piston that does real work, the liftable two-species barrier and the P·A/N·T HUD **already exist**,
so #1 and #2 are close to pure authoring.

### PC-2 — Thermodynamics & thermochemistry · archetypes L + N **[LIVE]** · 8 sims

| # | concept_id | Concept | D | Tier | Curricula |
|---|---|---|---|---|---|
| 5 | `internal_energy_first_law` | Internal energy & the first law | 2D | ⭐ | 6/6 |
| 6 | `enthalpy_reaction_profile` | Enthalpy & reaction profiles (exo vs endo) | 2D | ⭐ | 6/6 |
| 7 | `hess_law_energy_cycles` | Hess's law / energy cycles | 2D | ⭐ | 6/6 |
| 8 | `bond_enthalpy` | Bond enthalpy | 2D | ⭐ | 5/6 |
| 9 | `calorimetry` | Calorimetry | 2D | ⭐ | 5/6 |
| 10 | `entropy_and_dispersal` | **Entropy** | 2D | 💎 | 6/6 |
| 11 | `gibbs_free_energy_spontaneity` | **Gibbs free energy & spontaneity** | 2D | 💎 | 5/6 |
| 12 | `born_haber_cycle` | Born–Haber cycle / lattice enthalpy | 2D | ⭐ | 4/6 |

#10 is the cluster's best diamond: entropy is taught as the word "disorder" and understood by almost
nobody. A particle box makes energy *dispersal* watchable. #11 pays it off — the ΔG sign flipping with
temperature is genuinely counterintuitive (capability 4).

### PC-3 — Chemical kinetics · `gas_box` + N **[LIVE]** · 4 sims

| # | concept_id | Concept | D | Tier | Curricula |
|---|---|---|---|---|---|
| 13 | `arrhenius_equation` | Arrhenius equation / Eₐ from a plot | 2D | ⭐ | 5/6 |
| 14 | `catalysis_and_activation_energy` | **Catalysis** (homogeneous · heterogeneous · surface adsorption) | 2D | 💎 | 6/6 |
| 15 | `integrated_rate_law_half_life` | Integrated rate laws & half-life | 2D | ⭐ | 5/6 |
| 16 | `reaction_mechanism_rate_determining_step` | **Reaction mechanism & the rate-determining step** | 2D | 💎 | 5/6 |

### PC-4 — Chemical equilibrium · `gas.reaction` **[LIVE]** · 2 sims

| # | concept_id | Concept | D | Tier | Curricula |
|---|---|---|---|---|---|
| 17 | `equilibrium_constant_kc_kp` | **Kc / Kp and the reaction quotient Q** | 2D | 💎 | 6/6 |
| 18 | `haber_process_optimisation` | Haber process optimisation | 2D | ⭐ | 5/6 |

The gas box already runs A + B ⇌ AB with a **derived** reverse barrier, so equilibrium shifts emerge
from the collision sweep rather than being scripted. #17 is nearly free on machinery that exists.

### PC-5 — Ionic equilibrium, acids & bases · archetype N **[LIVE]** · 6 sims

| # | concept_id | Concept | D | Tier | Curricula |
|---|---|---|---|---|---|
| 19 | `acids_bases_and_ph_scale` | Acids, bases & the pH scale | 2D | ⭐ | 6/6 |
| 20 | `strong_vs_weak_acids` | **Strong vs weak acids** (Ka, degree of dissociation) | 2D | 💎 | 6/6 |
| 21 | `titration_curve_and_indicators` | **Titration curves & indicators** | 2D | 💎 | 6/6 |
| 22 | `buffer_solutions` | **Buffers & Henderson–Hasselbalch** | 2D | 💎 | 5/6 |
| 23 | `salt_hydrolysis` | Salt hydrolysis | 2D | ⭐ | 4/6 |
| 24 | `solubility_product_and_common_ion` | **Solubility product Ksp & the common-ion effect** | 2D | 💎 | 5/6 |

**The densest diamond cluster in physical chemistry, and all of it is 2D graph work.** #21's
equivalence-point cliff is the single best 2D chemistry sim available today.

### PC-6 — Solutions & colligative properties · small `gas_box` extension · 5 sims

| # | concept_id | Concept | D | Tier | Curricula |
|---|---|---|---|---|---|
| 25 | `dissolution_and_solubility` | Dissolution & solubility | 2D | ⭐ | 6/6 |
| 26 | `raoults_law_vapour_pressure` | Raoult's law & vapour-pressure lowering | 2D | ⭐ | 5/6 |
| 27 | `boiling_elevation_freezing_depression` | Boiling-point elevation & freezing-point depression | 2D | ⭐ | 5/6 |
| 28 | `osmosis_and_osmotic_pressure` | **Osmosis & osmotic pressure** | 2D | 💎 | 6/6 |
| 29 | `henrys_law` | Henry's law | 2D | ⭐ | 4/6 |

#28 is the sleeper. It has the exact misconception structure that made `dynamic_equilibrium` work —
students believe water crosses the membrane one way, when it crosses **both** ways with a net flow.
Needs one modest addition: a semi-permeable membrane in the particle box.

### PC-7 — Redox & electrochemistry · **[NEEDS-SCENARIO]** · 7 sims

| # | concept_id | Concept | D | Tier | Curricula |
|---|---|---|---|---|---|
| 30 | `redox_as_electron_transfer` | Redox as electron transfer & oxidation states | 2D | ⭐ | 6/6 |
| 31 | `galvanic_cell_daniell` | **Galvanic cell** (Daniell, salt bridge) | 2D | 💎 | 6/6 |
| 32 | `electrode_potential_series` | Electrode potential & the electrochemical series | 2D | ⭐ | 5/6 |
| 33 | `nernst_equation` | Nernst equation | 2D | ⭐ | 4/6 |
| 34 | `electrolysis_and_faradays_laws` | **Electrolysis & Faraday's laws** | 2D | 💎 | 6/6 |
| 35 | `conductance_and_molar_conductivity` | Conductance & molar conductivity (Kohlrausch) | 2D | ⭐ | 4/6 |
| 36 | `corrosion_batteries_fuel_cells` | Corrosion, batteries & fuel cells | 2D | ⭐ | 5/6 |

The biggest 2D prize in the subject. #31 shows **two invisible flows at once in opposite directions** —
electrons through the wire, ions through the solution and salt bridge. `patterns/chemistry.md` marks
archetype Q as [PHASE-5] on the strength of *apparatus drawing*, but `particle_field` already runs a
charge-drift engine for Ch.3. **Worth an investigation before accepting that label — it has now been
wrong twice** (archetype M shipped as one scenario; archetype P needed a case, not a new renderer).

### PC-8 — Atomic structure & quantum · L + `orbital_shapes` **[LIVE]** · 4 sims

| # | concept_id | Concept | D | Tier | Curricula |
|---|---|---|---|---|---|
| 37 | `hydrogen_emission_spectrum` | Hydrogen emission spectrum | 2D | ⭐ | 5/6 |
| 38 | `quantum_numbers_electron_configuration` | **Quantum numbers & electron configuration** (Aufbau · Pauli · Hund) | 🧊 **3D** | 💎 | 6/6 |
| 39 | `rutherford_alpha_scattering` | **Rutherford α-scattering** — [NEEDS-SCENARIO] | 2D *(3D optional)* | 💎 | 5/6 |
| 40 | `photoelectric_effect_quantisation` | Photoelectric effect / quantisation of light | 2D | ⭐ | 5/6 |

#37 is the cheapest remaining strong concept in all of chemistry — a direct successor to the shipped
`bohr_model_energy_levels` on machinery already proven.

### PC-9 — Periodicity · N + `orbital_shapes` · 2 sims (+2 in flight)

| # | concept_id | Concept | D | Tier | Curricula |
|---|---|---|---|---|---|
| 41 | `electronegativity_and_electron_gain` | Electronegativity & electron gain enthalpy | 2D | ⭐ | 6/6 |
| 42 | `effective_nuclear_charge_shielding` | **Effective nuclear charge & shielding** | 🧊 **3D** | 💎 | 6/6 |

#42 is the *mechanism* under the whole chapter — the trend alone is a graph a teacher can draw, but
why the trend exists is invisible. It is the concept `atomic_and_ionic_radius` and
`ionisation_enthalpy` (PR #88) both lean on.

### PC-10 — Solid state & surface chemistry · **[NEEDS-SCENARIO]** · 4 sims

| # | concept_id | Concept | D | Tier | Curricula |
|---|---|---|---|---|---|
| 43 | `unit_cells_and_crystal_lattice` | **Unit cells & crystal lattices** | 🧊 **3D** | 💎 | 3/6 ⚠ |
| 44 | `packing_efficiency_and_voids` | Packing efficiency & voids | 🧊 **3D** | ⭐ | 3/6 ⚠ |
| 45 | `adsorption_physisorption_chemisorption` | Adsorption (physisorption vs chemisorption) | 2D | ⭐ | 3/6 ⚠ |
| 46 | `colloids_and_tyndall_effect` | Colloids & the Tyndall effect | 2D | ⭐ | 3/6 ⚠ |

⚠ Solid State **and** Surface Chemistry were both removed from the rationalised NCERT. International
value only (A-level · IB) until a syllabus changes. `patterns/chemistry.md` records crystal lattices as
the one remaining [NEEDS-SCENARIO] half of archetype P.

---

## 4. Totals

| | Count |
|---|---|
| **Unbuilt simulations** | **46** |
| 💎 diamond | 16 |
| ⭐ strong | 30 |
| **2D** | **42** |
| **🧊 3D** | **4** (#38, #42, #43, #44) — plus #39 optionally |
| Buildable with **zero** engine work | **~38** |
| Estimated states (7–9 per concept) | ~370 |

### Why exactly four are 3D

| # | concept_id | Why 3D is unavoidable | Engine |
|---|---|---|---|
| 38 | `quantum_numbers_electron_configuration` | The orbital *shapes* ARE the content — s spherical, p on three axes, d between them | `orbital_shapes` **[LIVE]** |
| 42 | `effective_nuclear_charge_shielding` | Inner shells physically screening the nucleus is a spatial fact, not a graph | `orbital_shapes` **[LIVE]** |
| 43 | `unit_cells_and_crystal_lattice` | A repeating 3D cell is the entire concept | lattice **[NEEDS-SCENARIO]** |
| 44 | `packing_efficiency_and_voids` | Voids exist *between* spheres in three dimensions | lattice **[NEEDS-SCENARIO]** |

**Two of the four need no new engine at all** — `orbital_shapes` shipped 2026-07-28. Only #43/#44
need the crystal-lattice scenario, the one remaining `[NEEDS-SCENARIO]` half of archetype P.

**#39 `rutherford_alpha_scattering` is a genuinely open call.** Scattering reads fine in 2D, and
`patterns/chemistry.md` §K records it as needing a new scenario either way (the existing magnetic
machinery has no general force integrator, so a 1/r² hyperbolic path is not free in either
dimensionality). Decide it at design time, not from this table.

## 5. Engine work required — three modest scenarios, not three big builds

| Engine | Unlocks | Status |
|---|---|---|
| `gas_box` (M) · graph (N) · energy ladder (L) · `orbital_shapes` (P2) | **~38 sims** | **[LIVE] — nothing to build** |
| Semi-permeable membrane in the particle box | PC-6, 5 sims | Small extension |
| Electrochemistry: ion + electron flow (archetype Q) | PC-7, 7 sims | [NEEDS-SCENARIO] — **verify against the Ch.3 drift engine first** |
| Crystal lattice / repeating unit cell (3D) | PC-10, 2 sims | [NEEDS-SCENARIO] |

Compare organic: three *large* new 3D engines gating 100% of its concepts.

## 6. Do NOT build — the physical-chemistry demo tier

Mole concept · stoichiometry · limiting reagent · percentage composition · empirical & molecular
formula · balancing equations · concentration units (molarity/molality arithmetic) · oxidation-number
assignment rules · Faraday's-law arithmetic · conductance definitions. **Whiteboard jobs** (C5 §6).
Deprioritised means later in the queue, never smaller when built.

---

## 7. RECOMMENDED START — PC-5, the acid–base cluster

**Six sims, four of them diamonds, 5–6/6 curricula each, and ZERO engine work.**

| Step | Concept | Why here |
|---|---|---|
| 1 | **#21 titration curves** | The best 2D chemistry sim available today; the equivalence-point cliff is capability 4 |
| 2 | **#20 strong vs weak acids** | The prerequisite misconception — "weak = dilute" — and it explains #21's curve shapes |
| 3 | **#22 buffers** | Pays off #20; heavy on IB/AP/A-level |
| 4 | **#24 Ksp & common-ion effect** | Same graph machinery, closes the cluster |

Order note (Rule 25, foundation-first): **#20 arguably belongs before #21** — a student who thinks
"weak acid = dilute acid" cannot read a titration curve correctly. Build #21 first only if the founder
wants the strongest single demo out earliest; otherwise lead with #20.

**Then PC-2 #10 entropy → #11 Gibbs**, the other pure-authoring diamond pair, on the particle box.

**Before scheduling PC-7 (electrochemistry, the biggest 2D prize), spend an hour checking whether the
Ch.3 charge-drift engine already reaches the Daniell cell.** Archetype Q's [PHASE-5] label was set on
the assumption that apparatus drawing is required. Two comparable labels have already proved wrong.

## 8. Open questions for the founder

1. **Physical chemistry vs organic as the next subject block.** This plan is cheaper (38 sims with no
   engine spend vs 0), scores better internationally (6/6 vs 4/6), and is 90% 2D. Organic is deeper
   for JEE/NEET specifically. The honest recommendation is **physical chemistry first**.
2. **Is the electrochemistry [PHASE-5] label real?** Worth one investigation — it gates 7 sims
   including two 6/6 diamonds.
3. **PC-10** is international-only after NCERT rationalisation. Build only if A-level/IB becomes a
   target market.
