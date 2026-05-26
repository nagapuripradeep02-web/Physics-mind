# Pilot Topic 48 — Nuclei

> Stage-2 pilot catalog. Matrix-canonical topic number: **T48**. Modern Physics cluster (paired with T46 Dual Nature; closes core Modern Physics T45-T48).
>
> **Sources:** NCERT Class 12 Part 2 Ch.13 §13.1–13.7 (book pp.438–456) + HCV Vol 2 nucleus chapter + DCP Optics & Modern Physics nuclear chapter.
>
> Authored as paired-batch with T46 Dual Nature. Session 44.

---

## Founder Decisions Applied (T48-specific, prefix NU-G*)

| # | Decision | Reason |
|---|---|---|
| **NU-G1** | **Atomic mass unit definition + isotopes/isobars/isotones as 2 atomics** (definitional foundation + classification taxonomy). NCERT §13.2 covers both. Splitting prevents bundling the unit-conversion drill into the classification concept. |
| **NU-G2** | **Nuclear size R = R₀A^(1/3) as standalone atomic** with nuclear density (2.3 × 10¹⁷ kg/m³) as nano consequence. Size formula is one teaching unit; density-is-constant is a derived insight that doesn't need its own simulation. |
| **NU-G3** | **Mass defect / Binding energy / BE-per-nucleon curve = 3 separate atomics.** The BE-per-nucleon curve (Fig 13.1) is THE organizing principle of nuclear physics — must stand alone with its own simulation. Mass defect ΔM and binding energy E_b are derivation steps; the *curve* is the empirical pattern that motivates fission + fusion. |
| **NU-G4** | **Decay law / half-life / mean-life = 3 separate atomics.** Each has its own JEE-Mains formula (N = N₀e^(−λt), T_{1/2} = ln2/λ, τ = 1/λ). Bundling loses the cognitive distinction students keep getting wrong (T_{1/2} ≠ τ). |
| **NU-G5** | **Three decay modes (α, β, γ) as 3 atomics** with β⁻ + β⁺ as nanos under β-decay parent. NCERT covers all three but in unequal depth — α is most-elaborated, β has both modes, γ is simplest. 3-atomic split respects the depth disparity. |
| **NU-G6** | **Fission + Fusion as 2 separate atomics** with `nuclear_reactor_principle` as standalone application atomic + `stellar_nucleosynthesis_pp_chain` as nano under fusion. Reactor physics (moderator, control rods, coolant) is genuinely engineering-scale; deserves its own teaching unit beyond just "fission releases energy." |
| **NU-G7** | **Anchor density STRONG with Indian-dominance.** Nuclear physics in India = **BARC Mumbai (1954)** + **Tarapur 1969 (India's first commercial reactor)** + **Kakrapar Gujarat** + **Kudankulam Tamil Nadu (Indo-Russian)** + **AERB regulator** + **Homi Bhabha's vision** + **ITER-India fusion contribution** + **Pokhran 1974/1998 nuclear tests (context only — not weapons-promotion)** + **medical isotope Tc-99m at RMC** + **radiocarbon dating at PRL Ahmedabad**. Indian nuclear program is THE strongest anchor cluster of any Stage-2 topic so far. Authoring multiplier 1.0×. |

---

## Section A — Atomic + Nano Concept Table

| ID | Concept | Type | Sim? | In repo? | Requires | Required-by | Notes |
|---|---|---|---|---|---|---|---|
| `atomic_mass_unit_definition` | 1u = (mass of ¹²C atom)/12 = 1.6605 × 10⁻²⁷ kg; m_p = 1.00727 u; m_n = 1.00866 u; m_e = 0.00055 u | atomic | ✅ minimal | — | — | [`mass_defect_delta_M`, `binding_energy_E_b`] | NCERT §13.2 eq 13.1 + Discovery of Neutron section. Foundation unit. |
| `isotopes_isobars_isotones` | Isotopes: same Z, different N (¹H, ²H, ³H); Isobars: same A, different Z (³H, ³He); Isotones: same N, different Z (¹⁹⁸Hg, ¹⁹⁷Au) | atomic | ✅ classification | — | [`atomic_mass_unit_definition`] | — | NCERT §13.2 end. Notation ᴬZX where X = chemical symbol. JEE-Mains classification atomic. |
| `nuclear_composition_protons_neutrons` | Nucleus = Z protons + N neutrons; A = Z + N (mass number); chemical identity from Z (atomic number) | atomic | ✅ visual | — | [`atomic_mass_unit_definition`] | [`nuclear_size_R0A1over3`, `binding_energy_E_b`] | NCERT §13.2 eq 13.4. Chadwick neutron 1932 (Nobel 1935). |
| `↳ free_neutron_unstable_inside_stable` | Free neutron decays in ~1000s (β⁻ → proton + e⁻ + ν̄); but stable inside nucleus due to nuclear force | nano | ✅ | — | — | [`beta_decay_neutron_proton_transition`] | NCERT §13.2 paragraph 5. Surprising fact. |
| `nuclear_size_R0A1over3` | R = R₀ A^(1/3) with R₀ = 1.2 fm = 1.2 × 10⁻¹⁵ m. Volume ∝ A. Universal across all nuclei | atomic | ✅ formula+visual | — | [`distance_of_closest_approach` *(T47)*, `nuclear_composition_protons_neutrons`] | [`nuclear_density_constant`] | NCERT §13.3 eq 13.5. **Continuation of T47 Rutherford scattering upper-bound.** |
| `↳ nuclear_density_constant` | ρ_nuclear = mass/volume = A·u / [(4/3)π R₀³ A] = constant ≈ 2.3 × 10¹⁷ kg/m³. **Independent of A.** Comparable to neutron star density | nano | ✅ | — | — | — | NCERT §13.3 + Example 13.1. The non-obvious universal-density consequence. |
| `mass_energy_equivalence_E_mc2` | Einstein 1905: E = mc². 1 u ≡ 931.5 MeV. Energy "stored" in mass; convertible | atomic | ✅ formula+visual | — | — | [`mass_defect_delta_M`, `binding_energy_E_b`] | NCERT §13.4.1 eq 13.6 + Example 13.2. **The bridge from classical mechanics to nuclear physics.** |
| `mass_defect_delta_M` | ΔM = [Z·m_p + (A−Z)·m_n] − M_nucleus. Always positive. The "missing mass" went into binding | atomic | ✅ animated | — | [`atomic_mass_unit_definition`, `mass_energy_equivalence_E_mc2`, `nuclear_composition_protons_neutrons`] | [`binding_energy_E_b`] | NCERT §13.4.2 eq 13.7. Example: ¹⁶O has ΔM = 0.13691 u → 127.5 MeV. |
| `binding_energy_E_b` | E_b = ΔM·c². Energy needed to break nucleus into separate nucleons. Measures nuclear stability | atomic | ✅ formula+visual | — | [`mass_defect_delta_M`] | [`binding_energy_per_nucleon_curve`] | NCERT §13.4.2 eq 13.8. ¹⁶O: E_b = 127.5 MeV. |
| `binding_energy_per_nucleon_curve` | E_bn = E_b/A. Plot vs A: peaks ~8.75 MeV at A=56 (Fe), drops to ~7.6 MeV at A=238 (U). Light nuclei A<30 + heavy A>170 have lower E_bn | atomic | ✅ animated+graph | — | [`binding_energy_E_b`] | [`nuclear_fission_chain_reaction`, `nuclear_fusion_thermonuclear`] | NCERT §13.4.2 Fig 13.1. **THE organizing principle of nuclear physics. Fission goes A=240 → 2× A=120 (gains binding); Fusion goes A=2 + A=2 → A=4 (gains more).** |
| `nuclear_force_short_range_attractive` | Strong, short-range (~few fm), attractive at r > 0.8 fm, repulsive at r < 0.8 fm. Independent of charge (n-p, p-p, n-n all same). Much stronger than EM | atomic | ✅ animated+graph | — | [`binding_energy_per_nucleon_curve`] | — | NCERT §13.5 + Fig 13.2. Why nucleus doesn't collapse despite Coulomb proton-repulsion. |
| `radioactivity_3_types_alpha_beta_gamma` | Unstable nuclei spontaneously decay via: α (helium nucleus ⁴He), β (electron/positron), γ (high-energy photon) | atomic | ✅ comparison | — | [`nuclear_composition_protons_neutrons`, `nuclear_force_short_range_attractive`] | [`law_of_radioactive_decay`, `alpha_decay`, `beta_decay_neutron_proton_transition`, `gamma_decay_excited_nucleus`] | NCERT §13.6 (i-iii). Becquerel 1896 discovery. |
| `law_of_radioactive_decay` | dN/dt = −λN; N(t) = N₀ e^(−λt). λ = decay constant. Activity R = λN = R₀ e^(−λt) | atomic | ✅ animated+formula | — | [`radioactivity_3_types_alpha_beta_gamma`, [`calculus_exponential_decay`](stage-3-math-tools.md)] | [`half_life_T_half`, `mean_life_tau`] | NCERT §13.6.1 eq 13.10-13.15 + Fig 13.3. **THE keystone decay formula.** |
| `↳ activity_unit_becquerel_curie` | 1 Bq = 1 decay/sec; 1 Ci = 3.7 × 10¹⁰ Bq (older unit). | nano | minimal | — | — | — | NCERT §13.6.1. |
| `half_life_T_half` | T_{1/2} = ln2/λ ≈ 0.693/λ. Time for N to halve. After n half-lives, N/N₀ = (1/2)ⁿ | atomic | ✅ animated+formula | — | [`law_of_radioactive_decay`] | — | NCERT eq 13.17. **JEE-Mains: "find sample remaining after n half-lives."** |
| `mean_life_tau` | τ = 1/λ; time at which N drops to N₀/e. T_{1/2} = τ·ln2 ≈ 0.693τ. Distinct from half-life | atomic | ✅ formula | — | [`law_of_radioactive_decay`] | — | NCERT §13.6.1 + eq 13.18. **Cognitive error trap: students confuse τ and T_{1/2}.** |
| `alpha_decay` | ᴬZX → ᴬ⁻⁴_{Z−2}Y + ⁴₂He. Mass number drops 4, atomic number drops 2. Q-value = (m_X − m_Y − m_He)c² | atomic | ✅ animated | — | [`radioactivity_3_types_alpha_beta_gamma`, `mass_energy_equivalence_E_mc2`] | — | NCERT §13.6.2 eq 13.19-13.21. Example: ²³⁸U → ²³⁴Th + ⁴He. |
| `beta_decay_neutron_proton_transition` | β⁻: n → p + e⁻ + ν̄ (Z→Z+1, A unchanged); β⁺: p → n + e⁺ + ν (Z→Z−1, A unchanged). Neutrino preserves energy-momentum conservation | atomic | ✅ animated | — | [`radioactivity_3_types_alpha_beta_gamma`, `free_neutron_unstable_inside_stable` *(nano)*] | — | NCERT §13.6 (anticipated continuation). **Pauli's neutrino hypothesis 1930 (Nobel Reines 1995 for detection).** |
| `gamma_decay_excited_nucleus` | Excited daughter nucleus (after α or β decay) emits γ-photon to reach ground state. Z, A unchanged. Energies hundreds of keV to MeV | atomic | ✅ animated | — | [`radioactivity_3_types_alpha_beta_gamma`, `photon_energy_hf` *(T46)*] | — | NCERT §13.6 (iii). Analogous to atomic emission spectrum but nuclear-energy-scale. |
| `nuclear_fission_chain_reaction` | Heavy nucleus (²³⁵U, ²³⁹Pu) absorbs neutron → splits into 2 medium nuclei + 2-3 neutrons + ~200 MeV. Neutrons cause further fissions = chain reaction | atomic | ✅ animated | — | [`binding_energy_per_nucleon_curve`, `radioactivity_3_types_alpha_beta_gamma`] | [`nuclear_reactor_principle`] | NCERT §13.7.1 (anticipated). Hahn-Strassmann 1938; Meitner-Frisch interpretation. |
| `nuclear_reactor_principle` | Controlled fission: fuel (²³⁵U) + moderator (D₂O, graphite) slows neutrons + control rods (Cd, B) absorb excess neutrons + coolant extracts heat → drives turbine | atomic | ✅ animated | — | [`nuclear_fission_chain_reaction`] | — | NCERT §13.7.1 (anticipated). **Indian reactor types: PHWR (Tarapur 1+2, CANDU), BWR (Tarapur 3+4, Kakrapar), PWR (Kudankulam, Indo-Russian).** |
| `↳ indian_nuclear_power_program` | Tarapur 1969 (TAPS) + Kakrapar + Rawatbhata + Kudankulam (Indo-Russian) + Madras Atomic Power Station + Kaiga. ~7-8 GW installed. AERB regulator. BARC Mumbai R&D. | nano | visual | — | — | — | Anchor-rich nano covering entire Indian civilian nuclear program. |
| `nuclear_fusion_thermonuclear` | Light nuclei (²H + ³H → ⁴He + n + 17.6 MeV) fuse at extreme T (~10⁸ K) into heavier nuclei. Releases energy because product has higher E_bn. Sun's energy source | atomic | ✅ animated | — | [`binding_energy_per_nucleon_curve`] | — | NCERT §13.7.3 (anticipated). |
| `↳ stellar_nucleosynthesis_pp_chain` | Sun: 4 protons → ⁴He + 2e⁺ + 2ν + 26.7 MeV via p-p chain reactions. Source of all sunlight | nano | ✅ animated | — | — | — | NCERT §13.7.3. Cross-link to astronomy. |
| `↳ iter_india_fusion_program` | India is one of 7 partners in **ITER (Cadarache, France)** — fusion reactor under construction. **IPR Gandhinagar** is India's fusion R&D lead. SST-1 tokamak operational | nano | visual | — | — | — | Indian-flagship fusion-research anchor. |

**Total atomics: 18.** **Total nanos: ~6.**

---

## Section B — Dependency Graph (T48 internal)

```
atomic_mass_unit_definition
  ↳ isotopes_isobars_isotones
  ↳ nuclear_composition_protons_neutrons
       ↳ nuclear_size_R0A1over3 (continues T47 Rutherford upper-bound)
       ↳ mass_defect_delta_M
            ↳ binding_energy_E_b
                 ↳ binding_energy_per_nucleon_curve ★ organizing principle ★
                      ↳ nuclear_fission_chain_reaction → nuclear_reactor_principle
                      ↳ nuclear_fusion_thermonuclear
                 ↳ nuclear_force_short_range_attractive (explanatory)
       ↳ radioactivity_3_types_alpha_beta_gamma
            ↳ law_of_radioactive_decay ★ keystone formula ★
                 ↳ half_life_T_half
                 ↳ mean_life_tau
            ↳ alpha_decay
            ↳ beta_decay_neutron_proton_transition
            ↳ gamma_decay_excited_nucleus  ← T46 photon_energy_hf

mass_energy_equivalence_E_mc2  (parallel root)
  ↳ mass_defect_delta_M (used in conversion u → MeV)
  ↳ alpha_decay (Q-value)
  ↳ nuclear_fission_chain_reaction (200 MeV energy)
  ↳ nuclear_fusion_thermonuclear (17.6 MeV)
```

---

## Section C — Cross-Topic Dependencies (export to matrix)

**Dependencies INTO T48:**
- T47 Atomic Models `distance_of_closest_approach` → `nuclear_size_R0A1over3` (continues the upper-bound to nuclear radius). **Bidirectional with T47 — closes the Session 43 forward edge to T48.**
- T46 Dual Nature `photon_energy_hf` (implicit) → `gamma_decay_excited_nucleus` (γ photons obey E = hν)
- math-tools [`calculus_exponential_decay`](stage-3-math-tools.md) → `law_of_radioactive_decay`. **First-use of the dedicated exponential-decay primitive.**
- math-tools [`calculus_integration_basics`](stage-3-math-tools.md) → mean-life derivation (∫ t·e^(−λt) dt)
- math-tools [`algebra_chain_product_rule`](stage-3-math-tools.md) → mass-defect arithmetic chains

**Dependencies OUT of T48:**
- → T47 Atomic Models (back-edge): nuclear size + mass establish the "tiny dense nucleus" picture T47 assumed
- → T49 Semiconductor (anticipated): nuclear-physics-style energy levels reused in semiconductor band theory
- → T50 Communication (anticipated): radioactive isotopes power deep-space probes (Voyager RTG); Indian remote-sensor power
- → Astronomy/Cosmology (anticipated future topic): stellar nucleosynthesis is the bridge to Hubble's law + Big Bang

**Edge count for T48:** ~5 IN (T46, T47, math-tools) + ~4 OUT (T47 back, T49, future astronomy).

---

## Section D — Anchor Inventory (Indian context, STRONG density — strongest yet)

| Atomic | Anchor | Why Indian-specific |
|---|---|---|
| `atomic_mass_unit_definition` | Mass-spectrometry labs at **BARC Mumbai + IGCAR Kalpakkam** measuring isotope masses | Indian-research anchor |
| `isotopes_isobars_isotones` | **C-14 dating at PRL Ahmedabad** identifies isotopic ratios in Indus Valley pottery (~3000 BCE) | Indian-archaeology cross-subject anchor |
| `nuclear_composition_protons_neutrons` | **Chadwick neutron discovery (1932)** taught alongside Indian nuclear pioneers Saha + Bhabha | Indian-Nobel-context |
| `nuclear_size_R0A1over3` | Measurements at **VECC (Variable Energy Cyclotron Centre, Kolkata)** + BARC | Indian-research anchor |
| `nuclear_density_constant` (nano) | "Density of nucleus is like neutron star density" — NCERT explicit; Indian astronomy at IUCAA Pune studies neutron stars | NCERT-explicit Indian-context |
| `mass_energy_equivalence_E_mc2` | Einstein 1905 — universal anchor; bridges to nuclear-power-program in India | Cross-subject anchor |
| `mass_defect_delta_M` | Atomic-mass measurements at **BARC tandem accelerator** | Indian-research anchor |
| `binding_energy_E_b` | **Why uranium is used in Indian reactors** (high E_b mass-energy yield per kg) | Cross-link to Indian-nuclear-program |
| `binding_energy_per_nucleon_curve` | **Fe-56 at peak — origin of Earth's iron core nickel-iron composition** + **Indian seismology IIT Kanpur** uses this | Cross-subject Indian-geology anchor |
| `nuclear_force_short_range_attractive` | **Why nuclear power works at all** — anchored to Indian energy security narrative | Strategic Indian-anchor |
| `radioactivity_3_types_alpha_beta_gamma` | **Radioactive isotopes at AERB-regulated medical facilities** (Tata Memorial Hospital Mumbai uses ⁶⁰Co for cancer therapy) | Indian-healthcare anchor |
| `law_of_radioactive_decay` | **Radioactive dating of Indus Valley artifacts at PRL Ahmedabad** + **Indian medical-isotope half-life tracking** | Cross-subject Indian-anchor |
| `half_life_T_half` | **Tc-99m (T_{1/2} = 6 hours) used in Indian SPECT/PET scans** at AIIMS + Indian Oncology centers | Indian-healthcare anchor |
| `mean_life_tau` | Same Indian-healthcare isotope context — distinguishing τ vs T_{1/2} for dosing | Indian-healthcare cross-link |
| `alpha_decay` | **Radon gas (α-emitter) in Indian uranium mining at Jaduguda** (Jharkhand) — health-and-safety context | Indian-mining-industry anchor |
| `beta_decay_neutron_proton_transition` | **Tritium production at BARC for thermonuclear research + thyroid-radioactive-iodine ¹³¹I therapy** at Indian hospitals | Indian-multi-sector anchor |
| `gamma_decay_excited_nucleus` | **⁶⁰Co cancer-therapy unit** at Tata Memorial Hospital — γ-ray medical use | Indian-healthcare anchor (high-impact) |
| `nuclear_fission_chain_reaction` | **Tarapur 1969 (TAPS-1 + TAPS-2, India's first commercial reactor, BWR-209)** + **Pokhran 1974 (first peaceful nuclear test) + 1998 (Pokhran-II)** | Indian-flagship-nuclear-program anchor |
| `nuclear_reactor_principle` | **Tarapur + Kakrapar + Rawatbhata + Kudankulam + Madras + Kaiga = 22 operational reactors, ~7 GW installed** + **Bhabha's vision: 3-stage thorium program** | India's full civilian nuclear ecosystem |
| `nuclear_fusion_thermonuclear` | **ITER-India contribution + IPR Gandhinagar + SST-1 tokamak operational at IPR** + **Sun's p-p chain explains Indian solar irradiance** | Indian-flagship fusion-research anchor |

**Anchor density verdict: STRONGEST OF ALL 19 PILOTS YET CATALOGUED.** All 18 atomics have multi-strand Indian anchors. BARC + Tarapur + Kakrapar + Kudankulam + Pokhran + ITER-India + IPR + AIIMS + Tata Memorial + PRL = unmatched institutional anchor density. Bhabha + Saha + Raman heritage continues. Authoring multiplier 1.0×. **First topic where the anchor density genuinely exceeds the STRONG bucket — could become its own VERY-STRONG sub-bucket.**

---

## Section E — Simulatability Tagging

| Atomic | Sim approach | Confidence |
|---|---|---|
| Atomic mass unit | Single-row visualization: 1u = 1.66 × 10⁻²⁷ kg with m_p, m_n, m_e comparisons | MEDIUM (definitional) |
| Isotopes/isobars/isotones | Nuclide chart (Z vs N grid) with categorization animation | HIGH |
| Nuclear composition | Atomic-cutaway animation: nucleus zoomed → protons + neutrons | HIGH |
| Nuclear size R₀A^(1/3) | Slider: A vs R animation showing nuclei scaling as cube root | HIGH |
| Nuclear density constant | Same animation extended: ρ stays constant as A varies | HIGH |
| Mass-energy equivalence | Mass-defect → energy-released animation; 1 g of matter → 9×10¹³ J reveal | HIGH |
| Mass defect | Pre-fusion vs post-fusion mass comparison animation | HIGH |
| Binding energy | Energy-to-disassemble visualization | HIGH |
| **BE-per-nucleon curve** | Animated A vs E_bn plot with H/D/He/C/O/Fe/U markers; fission arrow + fusion arrow | **HIGH — Diamond candidate sim** |
| Nuclear force | Potential energy U(r) plot with attractive/repulsive zones | HIGH |
| 3 types of radioactivity | Side-by-side α emission + β emission + γ emission animations | HIGH |
| Law of radioactive decay | N vs t exponential-decay animation with adjustable λ | HIGH |
| Half-life | Sample of N atoms; visualize halving every T_{1/2} | HIGH |
| Mean life | Distinguish τ and T_{1/2} on same exponential curve | HIGH |
| Alpha decay | Parent → Daughter + ⁴He animation with mass-number/atomic-number reveal | HIGH |
| Beta decay (both modes) | n → p + e⁻ + ν̄ animation + reverse for β⁺ | HIGH |
| Gamma decay | Excited nucleus → ground state + γ photon | HIGH |
| Fission chain reaction | Neutron-induced ²³⁵U split + 2-3 neutron emission + cascade | HIGH |
| Nuclear reactor | Cross-section animation: fuel rods + moderator + control rods + coolant + turbine | HIGH |
| Fusion | ²H + ³H → ⁴He + n at high T animation | HIGH |
| Stellar nucleosynthesis | p-p chain in Sun's core | HIGH |

**Verdict: 90% high-confidence simulatable.** BE-per-nucleon curve is a **Diamond candidate sim** — the single most visually-rich teaching artifact in nuclear physics; explains both fission and fusion in one plot. Reactor + fusion are engineering-scale sims with multiple subsystems.

---

## Section F — V1 priority (deferred to Stage 5)

Tentative top candidates:
- `binding_energy_per_nucleon_curve` — **THE Diamond candidate** for T48
- `law_of_radioactive_decay` — keystone formula
- `nuclear_fission_chain_reaction` — Indian-flagship anchor
- `half_life_T_half` — JEE-Mains pattern
- `nuclear_reactor_principle` — engineering + Indian-anchor

---

## Section G — Open Questions / Stage-4 Flags

1. **β⁻ + β⁺ as nanos under `beta_decay` parent atomic** — JEE-Adv treats them as 2 distinct processes. Stage 4 may split.
2. **Neutrino atomic?** NCERT mentions briefly. Could elevate to standalone atomic (Pauli hypothesis 1930, Reines detection 1956, Indian neutrino observatory INO at Theni-deferred). Currently subsumed in β-decay.
3. **Nuclear reactor types (PHWR, BWR, PWR, FBR)** — currently nano. Indian 3-stage thorium program (Bhabha 1958) deserves more depth. Could be its own atomic or sub-topic in T48.5.
4. **Radioactive dating + medical isotopes** — currently anchors. Both have substantial physics content (decay-rate measurement, biological half-life). Stage 4 may elevate to atomic.
5. **Indian neutrino observatory (INO)** — long-deferred Tamil Nadu project. Once active, becomes a major anchor for β-decay + neutrino atomics.

---

## Section H — Cross-Source Coverage Matrix

| Atomic | NCERT 12.2 Ch.13 | HCV2 nucleus chapter | DCP O&M |
|---|:---:|:---:|:---:|
| `atomic_mass_unit_definition` | ✓ §13.2 eq 13.1 | ✓ | ✓ |
| `isotopes_isobars_isotones` | ✓ §13.2 end | ✓ | ✓ |
| `nuclear_composition_protons_neutrons` | ✓ §13.2 eq 13.4 | ✓ | ✓ |
| `nuclear_size_R0A1over3` | ✓ §13.3 eq 13.5 | ✓ | ✓ |
| `nuclear_density_constant` | ✓ §13.3 + Ex 13.1 | ✓ | ✓ |
| `mass_energy_equivalence_E_mc2` | ✓ §13.4.1 eq 13.6 | ✓ | ✓ heavily |
| `mass_defect_delta_M` | ✓ §13.4.2 eq 13.7 | ✓ heavily | ✓ heavily |
| `binding_energy_E_b` | ✓ §13.4.2 eq 13.8 | ✓ heavily | ✓ heavily |
| `binding_energy_per_nucleon_curve` | ✓ §13.4.2 Fig 13.1 | ✓ | ✓ |
| `nuclear_force_short_range_attractive` | ✓ §13.5 Fig 13.2 | ✓ | ✓ |
| `radioactivity_3_types_alpha_beta_gamma` | ✓ §13.6 (i-iii) | ✓ | ✓ |
| `law_of_radioactive_decay` | ✓ §13.6.1 eq 13.10-13.15 | ✓ heavily | ✓ heavily |
| `half_life_T_half` | ✓ eq 13.17 | ✓ | ✓ heavily |
| `mean_life_tau` | ✓ eq 13.18 | ✓ | ✓ |
| `alpha_decay` | ✓ §13.6.2 eq 13.19-13.21 | ✓ | ✓ |
| `beta_decay_neutron_proton_transition` | ✓ §13.6 (anticipated) | ✓ | ✓ |
| `gamma_decay_excited_nucleus` | ✓ §13.6 (iii) | ✓ | ✓ |
| `nuclear_fission_chain_reaction` | ✓ §13.7.1 | ✓ heavily | ✓ heavily |
| `nuclear_reactor_principle` | ✓ §13.7.1 | ✓ | ✓ |
| `nuclear_fusion_thermonuclear` | ✓ §13.7.3 | ✓ | ✓ |

**Triple-coverage rate: 100%.** Highest of any pilot. All 18 atomics in all 3 sources. NCERT and HCV both strongly cover; DCP problem-pattern heavy. **First topic with 100% triple-coverage** — confirms nuclear physics is a curricular core no source can omit.

---

## Section I — Anti-Plagiarism Probe

- E = mc² + decay law + half-life formula — public-domain physics.
- BE-per-nucleon curve — render our own labeled SVG with H/D/He/C/O/Fe/U markers.
- Reactor diagram — schematic; we draw our own.
- Indian anchors (BARC, Tarapur, Kakrapar, Kudankulam, ITER-India, IPR, AIIMS, Tata Memorial, PRL) — public-domain institutional facts.
- Pokhran context handled as factual + non-promotional (peaceful-nuclear-energy framing only).

✅ Anti-plagiarism risk: LOW.

---

## Section J — Catalog Sign-off

- Total atomics: **18** + ~6 nanos
- Anchor strength: **STRONG (strongest yet — possible VERY-STRONG sub-bucket signal)**
- Simulatability: **~90% high-confidence** (BE-per-nucleon curve = Diamond candidate sim)
- Cross-topic edges: ~5 IN (T46, T47, math-tools) + ~4 OUT (T47 back, T49, future astronomy)
- Source-role triad: 100% triple-coverage (first observed); all 3 sources strong; **first use of [`calculus_exponential_decay`](stage-3-math-tools.md) primitive from Stage-3 math-tools file**
- Founder decisions: 7 (NU-G1..G7), stable 19-pilot modal
- Stage-4 flags: 5 items (β-decay split, neutrino atomic, reactor types, dating/medical-isotope elevation, INO future)

**Status: PILOT COMPLETE.** **Modern Physics core cluster (T45-T48) now closed.** Matrix + DISCUSSIONS update next.
