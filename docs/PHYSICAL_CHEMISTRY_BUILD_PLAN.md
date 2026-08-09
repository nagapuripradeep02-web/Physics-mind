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

Tier: 💎 diamond · ⭐ strong. **3D** flags the only ones needing the Three.js surface.

### PC-1 — Gases & kinetic theory · `gas_box` **[LIVE]** · 4 sims

| # | Concept | Tier | Curricula |
|---|---|---|---|
| 1 | Gas laws (Boyle · Charles · ideal gas) | ⭐ | 5/6 ⚠ |
| 2 | Diffusion / Graham's law | ⭐ | 4/6 ⚠ |
| 3 | Real gases / van der Waals / compressibility Z | ⭐ | 4/6 ⚠ |
| 4 | Vapour pressure & boiling | ⭐ | 4/6 ⚠ |

⚠ = States-of-Matter topics removed from the rationalised NCERT. Strong internationally, weak on CBSE.
The piston that does real work, the liftable two-species barrier and the P·A/N·T HUD **already exist**,
so #1 and #2 are close to pure authoring.

### PC-2 — Thermodynamics & thermochemistry · archetypes L + N **[LIVE]** · 8 sims

| # | Concept | Tier | Curricula |
|---|---|---|---|
| 5 | Internal energy & the first law | ⭐ | 6/6 |
| 6 | Enthalpy & reaction profiles (exo vs endo) | ⭐ | 6/6 |
| 7 | Hess's law / energy cycles | ⭐ | 6/6 |
| 8 | Bond enthalpy | ⭐ | 5/6 |
| 9 | Calorimetry | ⭐ | 5/6 |
| 10 | **Entropy** | 💎 | 6/6 |
| 11 | **Gibbs free energy & spontaneity** | 💎 | 5/6 |
| 12 | Born–Haber cycle / lattice enthalpy | ⭐ | 4/6 |

#10 is the cluster's best diamond: entropy is taught as the word "disorder" and understood by almost
nobody. A particle box makes energy *dispersal* watchable. #11 pays it off — the ΔG sign flipping with
temperature is genuinely counterintuitive (capability 4).

### PC-3 — Chemical kinetics · `gas_box` + N **[LIVE]** · 4 sims

| # | Concept | Tier | Curricula |
|---|---|---|---|
| 13 | Arrhenius equation / Eₐ from a plot | ⭐ | 5/6 |
| 14 | **Catalysis** (homogeneous · heterogeneous · surface adsorption) | 💎 | 6/6 |
| 15 | Integrated rate laws & half-life | ⭐ | 5/6 |
| 16 | **Reaction mechanism & the rate-determining step** | 💎 | 5/6 |

### PC-4 — Chemical equilibrium · `gas.reaction` **[LIVE]** · 2 sims

| # | Concept | Tier | Curricula |
|---|---|---|---|
| 17 | **Kc / Kp and the reaction quotient Q** | 💎 | 6/6 |
| 18 | Haber process optimisation | ⭐ | 5/6 |

The gas box already runs A + B ⇌ AB with a **derived** reverse barrier, so equilibrium shifts emerge
from the collision sweep rather than being scripted. #17 is nearly free on machinery that exists.

### PC-5 — Ionic equilibrium, acids & bases · archetype N **[LIVE]** · 6 sims

| # | Concept | Tier | Curricula |
|---|---|---|---|
| 19 | Acids, bases & the pH scale | ⭐ | 6/6 |
| 20 | **Strong vs weak acids** (Ka, degree of dissociation) | 💎 | 6/6 |
| 21 | **Titration curves & indicators** | 💎 | 6/6 |
| 22 | **Buffers & Henderson–Hasselbalch** | 💎 | 5/6 |
| 23 | Salt hydrolysis | ⭐ | 4/6 |
| 24 | **Solubility product Ksp & the common-ion effect** | 💎 | 5/6 |

**The densest diamond cluster in physical chemistry, and all of it is 2D graph work.** #21's
equivalence-point cliff is the single best 2D chemistry sim available today.

### PC-6 — Solutions & colligative properties · small `gas_box` extension · 5 sims

| # | Concept | Tier | Curricula |
|---|---|---|---|
| 25 | Dissolution & solubility | ⭐ | 6/6 |
| 26 | Raoult's law & vapour-pressure lowering | ⭐ | 5/6 |
| 27 | Boiling-point elevation & freezing-point depression | ⭐ | 5/6 |
| 28 | **Osmosis & osmotic pressure** | 💎 | 6/6 |
| 29 | Henry's law | ⭐ | 4/6 |

#28 is the sleeper. It has the exact misconception structure that made `dynamic_equilibrium` work —
students believe water crosses the membrane one way, when it crosses **both** ways with a net flow.
Needs one modest addition: a semi-permeable membrane in the particle box.

### PC-7 — Redox & electrochemistry · **[NEEDS-SCENARIO]** · 7 sims

| # | Concept | Tier | Curricula |
|---|---|---|---|
| 30 | Redox as electron transfer & oxidation states | ⭐ | 6/6 |
| 31 | **Galvanic cell** (Daniell, salt bridge) | 💎 | 6/6 |
| 32 | Electrode potential & the electrochemical series | ⭐ | 5/6 |
| 33 | Nernst equation | ⭐ | 4/6 |
| 34 | **Electrolysis & Faraday's laws** | 💎 | 6/6 |
| 35 | Conductance & molar conductivity (Kohlrausch) | ⭐ | 4/6 |
| 36 | Corrosion, batteries & fuel cells | ⭐ | 5/6 |

The biggest 2D prize in the subject. #31 shows **two invisible flows at once in opposite directions** —
electrons through the wire, ions through the solution and salt bridge. `patterns/chemistry.md` marks
archetype Q as [PHASE-5] on the strength of *apparatus drawing*, but `particle_field` already runs a
charge-drift engine for Ch.3. **Worth an investigation before accepting that label — it has now been
wrong twice** (archetype M shipped as one scenario; archetype P needed a case, not a new renderer).

### PC-8 — Atomic structure & quantum · L + `orbital_shapes` **[LIVE]** · 4 sims

| # | Concept | Tier | Curricula |
|---|---|---|---|
| 37 | Hydrogen emission spectrum | ⭐ | 5/6 |
| 38 | **Quantum numbers & electron configuration** (Aufbau · Pauli · Hund) — **3D** | 💎 | 6/6 |
| 39 | **Rutherford α-scattering** — [NEEDS-SCENARIO] | 💎 | 5/6 |
| 40 | Photoelectric effect / quantisation of light | ⭐ | 5/6 |

#37 is the cheapest remaining strong concept in all of chemistry — a direct successor to the shipped
`bohr_model_energy_levels` on machinery already proven.

### PC-9 — Periodicity · N + `orbital_shapes` · 2 sims (+2 in flight)

| # | Concept | Tier | Curricula |
|---|---|---|---|
| 41 | Electronegativity & electron gain enthalpy | ⭐ | 6/6 |
| 42 | **Effective nuclear charge & shielding** — **3D** | 💎 | 6/6 |

#42 is the *mechanism* under the whole chapter — the trend alone is a graph a teacher can draw, but
why the trend exists is invisible. It is the concept `atomic_and_ionic_radius` and
`ionisation_enthalpy` (PR #88) both lean on.

### PC-10 — Solid state & surface chemistry · **[NEEDS-SCENARIO]** · 4 sims

| # | Concept | Tier | Curricula |
|---|---|---|---|
| 43 | **Unit cells & crystal lattices** — **3D** | 💎 | 3/6 ⚠ |
| 44 | Packing efficiency & voids — **3D** | ⭐ | 3/6 ⚠ |
| 45 | Adsorption (physisorption vs chemisorption) | ⭐ | 3/6 ⚠ |
| 46 | Colloids & the Tyndall effect | ⭐ | 3/6 ⚠ |

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
| **Needing 3D** | **4** (#38, #42, #43, #44) — plus #39 optionally |
| Buildable with **zero** engine work | **~38** |
| Estimated states (7–9 per concept) | ~370 |

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
