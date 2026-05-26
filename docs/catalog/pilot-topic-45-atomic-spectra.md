# Pilot Topic 45 — Atomic Spectra

> Stage-2 pilot catalog. Matrix-canonical topic number: **T45**. Modern Physics cluster opener (paired with T47 Atomic Models).
>
> **Sources:** NCERT Class 12 Part 2 Ch.12 Atoms §12.3 + 12.5 (book pp.420–429) + HCV Vol 2 Ch.43 §43.2 + 43.9 + Ch.44 X-rays §44.1–44.2 (book pp.369–388) + DCP Optics & Modern Physics atomic-spectra problem chapter.
>
> Authored as paired-batch with T47 Atomic Models. Session 43.

---

## Founder Decisions Applied (T45-specific, prefix AS-G*)

| # | Decision | Reason |
|---|---|---|
| **AS-G1** | **Emission and absorption spectra as 2 separate atomics.** Different physical processes — emission = electron transition to lower state releases photon; absorption = atom in ground state absorbs photon matching exactly an energy gap. The "Fraunhofer dark lines in solar spectrum" anchor needs absorption-as-its-own-atomic. |
| **AS-G2** | **Balmer / Lyman / Paschen as 3 separate atomics + Brackett+Pfund merged as 1.** Balmer is the OG visible-region series (school physics-practical anchor); Lyman is UV (CBSE-essential); Paschen is IR (JEE-Adv anchor). Brackett + Pfund are both far-IR with similar formula structure — one atomic suffices. |
| **AS-G3** | **Rydberg formula as standalone atomic** — the unifying statement 1/λ = RZ²(1/n_f² − 1/n_i²) applies to ALL hydrogen-like ions and ALL series. Worth its own teaching unit because students often memorize per-series formulas without seeing the universal pattern. |
| **AS-G4** | **Number-of-spectral-lines formula n(n−1)/2 as standalone atomic.** JEE-Mains predictably asks "from n=4 state, how many lines emitted?" → 6 lines. Pattern-recognition atomic; needs its own teaching unit with combinatorial-tree visualization. |
| **AS-G5** | **X-ray continuous (Bremsstrahlung) + characteristic (K-alpha/K-beta) = 2 atomics.** Different physics: continuous = decelerating electron radiation; characteristic = inner-shell electronic transitions. Bundling loses the conceptual contrast that's a JEE-Mains/NEET pattern question. |
| **AS-G6** | **Laser physics gets 3 atomics** (stimulated emission / population inversion / He-Ne construction) — substantial sub-topic. Could be its own T45.5 micro-topic; deferred to Stage 4. **Reason:** Laser appears in NCERT Class 12 + HCV + JEE syllabus; deserves real coverage. Compromise: 3 atomics within T45 (vs 1 atomic = too thin, or own topic = too heavy). |
| **AS-G7** | **Anchor density STRONG.** Indian-context anchors are exceptional: **C.V. Raman (Nobel 1930 for Raman scattering — molecular spectroscopy)**, **Meghnad Saha's ionization equation (1921, stellar spectroscopy)**, **neon-sign tubes in Indian retail markets**, **sodium-vapor street lamps on Indian highways**, **Aravind Eye Hospital's laser eye surgery**, **TIFR Mumbai laser physics research**, **Indian National Spectroscopic Society (INSS)**, **CSIR-National Aerospace Lab spectroscopy**. Authoring multiplier 1.0×. |

---

## Section A — Atomic + Nano Concept Table

| ID | Concept | Type | Sim? | In repo? | Requires | Required-by | Notes |
|---|---|---|---|---|---|---|---|
| `emission_line_spectrum` | Hot rarefied gas emits at discrete wavelengths only; "fingerprint" of element; appears as bright lines on dark background | atomic | ✅ visual | — | [`bohr_third_postulate_transition_photon_emission` *(T47)*] | [`hydrogen_emission_spectrum_overview`, `balmer_series_visible`] | NCERT §12.3 + HCV §43.2. The empirical phenomenon that motivated Bohr. |
| `absorption_line_spectrum` | White light through cool gas → dark lines at same wavelengths as emission; gas absorbs only matching photons | atomic | ✅ visual | — | [`emission_line_spectrum`, `bohr_third_postulate_transition_photon_emission` *(T47)*] | — | NCERT §12.3 end. Anchor: **Fraunhofer dark lines in solar spectrum** — identification of elements in Sun. |
| `↳ kirchoffs_radiation_law_emission_absorption` | A good emitter at a wavelength is also a good absorber at that wavelength | nano | minimal | — | — | — | Bridges to T18 Thermodynamics black-body. |
| `hydrogen_emission_spectrum_overview` | H spectrum has 5 visible+UV+IR series: Lyman, Balmer, Paschen, Brackett, Pfund. Each series = transitions to same final n_f | atomic | ✅ visual | — | [`emission_line_spectrum`, `energy_level_diagram_hydrogen` *(T47)*] | [`balmer_series_visible`, `lyman_series_uv`, `paschen_series_ir`, `brackett_pfund_series_far_ir`, `rydberg_formula_general`] | NCERT Fig 12.5 + HCV Fig 43.3. |
| `balmer_series_visible` | n_f = 2; 1/λ = R(1/4 − 1/n²) for n = 3, 4, 5...; H_α = 656.3 nm (red), H_β = 486.1 nm (blue-green), H_γ = 434.1 nm (violet); series limit = 364.6 nm | atomic | ✅ animated | — | [`hydrogen_emission_spectrum_overview`, `bohr_energy_in_nth_orbit` *(T47)*] | [`rydberg_formula_general`] | NCERT §12.3.1 + eq 12.5 + Fig 12.6 + HCV eq 43.1. **THE classic hydrogen spectrum series — every Indian Class 12 student sees the H_α red line.** |
| `lyman_series_uv` | n_f = 1; transitions n → 1; 1/λ = R(1 − 1/n²); 91.2–121.6 nm; ALL in UV (invisible to eye) | atomic | ✅ animated | — | [`hydrogen_emission_spectrum_overview`, `bohr_energy_in_nth_orbit` *(T47)*] | [`rydberg_formula_general`] | NCERT eq 12.6 + HCV §43.4 "Series structure". |
| `paschen_series_ir` | n_f = 3; transitions n → 3; 820–1875 nm range; ALL in IR | atomic | ✅ animated | — | [`hydrogen_emission_spectrum_overview`, `bohr_energy_in_nth_orbit` *(T47)*] | [`rydberg_formula_general`] | NCERT eq 12.7 + HCV §43.4. |
| `brackett_pfund_series_far_ir` | Brackett: n_f = 4; Pfund: n_f = 5; both far-IR. Formulas analogous | atomic | ✅ minimal | — | [`hydrogen_emission_spectrum_overview`, `bohr_energy_in_nth_orbit` *(T47)*] | — | NCERT eq 12.8, 12.9 + HCV §43.4. Less-taught; merged per AS-G2. |
| `rydberg_formula_general` | 1/λ = RZ²(1/n_f² − 1/n_i²); R = 1.097 × 10⁷ m⁻¹; derived theoretically from Bohr energy formula | atomic | ✅ formula | — | [`bohr_energy_in_nth_orbit` *(T47)*, `bohr_third_postulate_transition_photon_emission` *(T47)*, `hydrogen_like_ion_Z_factor` *(T47)*] | [`series_limit_each_series`, `number_of_spectral_lines_combinatorial`, `hydrogen_like_ion_spectrum`] | NCERT eq 12.21–12.22 + HCV eq 43.9. **THE keystone spectral formula.** |
| `↳ rydberg_constant_theoretical_vs_empirical` | R = me⁴/(8ε₀²h³c); theoretical R = 1.03 × 10⁷ m⁻¹ very close to empirical 1.097 × 10⁷ m⁻¹. **Direct confirmation of Bohr model.** | nano | ✅ | — | [`rydberg_formula_general`] | — | NCERT eq 12.23. The validation. |
| `series_limit_each_series` | n_i → ∞: 1/λ_min = R Z²/n_f². Balmer limit = 364.6 nm; Lyman limit = 91.2 nm; Paschen limit = 820 nm | atomic | ✅ minimal | — | [`rydberg_formula_general`] | — | NCERT p.422 + HCV §43.4. Convergence wavelength of each series; beyond it = continuous spectrum. |
| `number_of_spectral_lines_combinatorial` | From state n_max, atoms can transition to any lower state → total possible lines = n(n−1)/2 | atomic | ✅ animated | — | [`rydberg_formula_general`, `energy_level_diagram_hydrogen` *(T47)*] | — | HCV §43 Worked Ex 7: "From n=4, atoms emit 6 different wavelengths" = 4(3)/2 = 6. **JEE-Mains predictable pattern.** |
| `hydrogen_like_ion_spectrum` | For He⁺ (Z=2), Li²⁺ (Z=3): wavelengths scale as 1/Z². Same Lyman/Balmer/Paschen structure but Z² shorter | atomic | ✅ animated | — | [`rydberg_formula_general`, `hydrogen_like_ion_Z_factor` *(T47)*] | — | HCV Example 43.2: He⁺ in n=3 → n=2 emits at 164 nm vs hydrogen's 656 nm. **JEE-Adv top-tier pattern.** |
| `spectral_line_doppler_shift_red_blue` | Moving source: λ_observed = λ_emitted (1 ± v/c); receding stars → red shift; approaching → blue shift | atomic | ✅ animated | — | [`doppler_effect_light` *(T44)*, `emission_line_spectrum`] | [`hubbles_law_cosmology` *(future)*] | NCERT §10.3.4 Example 10.1 cross-link. Anchor: **NASA Hubble Space Telescope + India's AstroSat (2015) measure red shifts**. |
| `x_ray_production_coolidge_tube` | Filament + metal target + high voltage (~kV); accelerated electrons strike target; X-rays emerge through Be window | atomic | ✅ visual | — | [`em_radiation_from_accelerating_charge`, `kinetic_energy_eV_conversion`] | [`x_ray_continuous_bremsstrahlung_cutoff`, `x_ray_characteristic_k_alpha_k_beta`] | HCV §44.1 + Fig 44.1. Coolidge 1913 tube design — still standard medical-imaging tube. |
| `x_ray_continuous_bremsstrahlung_cutoff` | Decelerating electrons emit continuous-wavelength X-rays; cutoff wavelength λ_min = hc/eV (depends ONLY on accelerating voltage); independent of target material | atomic | ✅ animated+formula | — | [`x_ray_production_coolidge_tube`, `photon_energy_hf` *(T46)*] | — | HCV §44.2 + Fig 44.2. **Sharp cutoff is direct evidence of photon nature.** Duane-Hunt law. |
| `x_ray_characteristic_k_alpha_k_beta` | Sharp peaks at specific wavelengths characteristic of target material; K_α = transition L→K; K_β = M→K; depends on Z of target | atomic | ✅ animated | — | [`x_ray_production_coolidge_tube`, `energy_level_diagram_hydrogen` *(T47)*] | [`moseley_law`] | HCV §44.2. Inner-shell electron transitions, NOT outer-shell like visible. |
| `moseley_law` | √ν = a(Z − b); X-ray frequency √ proportional to (Z − screening constant); led to ordering elements by Z not atomic mass | atomic | ✅ formula+visual | — | [`x_ray_characteristic_k_alpha_k_beta`] | — | HCV §44 (anticipated; mentioned briefly). Anchor: **periodic table reordering 1913 — Indian-curriculum chemistry bridge**. |
| `stimulated_emission_spontaneous_absorption` | 3 processes: (a) absorption: photon kicks atom from E₁→E₂; (b) spontaneous: E₂→E₁ random emission (Einstein A); (c) stimulated: photon causes E₂→E₁ emission of identical photon (Einstein B) | atomic | ✅ animated | — | [`bohr_third_postulate_transition_photon_emission` *(T47)*] | [`laser_population_inversion_metastable_state`, `he_ne_laser_construction`] | HCV §43.9 + Figs 43.6, 43.7. **Three-arrow Einstein 1917 framework.** |
| `↳ einstein_a_and_b_coefficients` | Spontaneous emission rate = A₂₁; stimulated rate = B₂₁ · u(ν); detailed balance gives A/B = 8πhν³/c³ | nano | minimal | — | — | — | Optional advanced; usually skipped at Class 12. |
| `laser_population_inversion_metastable_state` | Normally N₂ < N₁ (Boltzmann); need pumping to invert (N₂ > N₁); metastable state (lifetime ~ms not ~ns) accumulates population | atomic | ✅ animated | — | [`stimulated_emission_spontaneous_absorption`] | [`he_ne_laser_construction`] | HCV §43.9. The trick that makes lasing work. |
| `he_ne_laser_construction` | He (90%) + Ne (10%) gas mixture; He excited by discharge → resonantly pumps Ne to E₂ = 20.66 eV → lasing transition E₂ → E₁ at 632.8 nm (red) | atomic | ✅ visual | — | [`laser_population_inversion_metastable_state`] | — | HCV §43.9 + Fig 43.9. Anchor: **standard physics-lab He-Ne laser pointer in every Indian college**. |
| `↳ laser_properties_coherent_monochromatic_directional` | All photons same wavelength + same phase + same direction; Δλ/λ ~ 10⁻⁶; beam diverges <1 mrad | nano | ✅ | — | — | — | HCV §43.9 list. |
| `↳ laser_uses_indian_context` | Aravind Eye Hospital LASIK + medical surgery + CD/DVD readers + barcode scanners + Indian Army range-finders + fiber-optic communication (BharatNet) | nano | visual | — | — | — | Anchor-rich nano covering 6 real Indian uses. |

**Total atomics: 18.** **Total nanos: ~5.**

---

## Section B — Dependency Graph (T45 internal)

```
emission_line_spectrum
  ↳ absorption_line_spectrum
  ↳ hydrogen_emission_spectrum_overview
       ↳ balmer_series_visible
       ↳ lyman_series_uv
       ↳ paschen_series_ir
       ↳ brackett_pfund_series_far_ir
       ↳ rydberg_formula_general  ★ keystone ★
            ↳ series_limit_each_series
            ↳ number_of_spectral_lines_combinatorial
            ↳ hydrogen_like_ion_spectrum
       ↳ spectral_line_doppler_shift_red_blue  ← T44 cross-link

x_ray_production_coolidge_tube
  ↳ x_ray_continuous_bremsstrahlung_cutoff
  ↳ x_ray_characteristic_k_alpha_k_beta
       ↳ moseley_law

stimulated_emission_spontaneous_absorption  ← T47 third postulate
  ↳ laser_population_inversion_metastable_state
       ↳ he_ne_laser_construction
```

---

## Section C — Cross-Topic Dependencies (export to matrix)

**Dependencies INTO T45:**
- T47 Atomic Models: 4 prereqs (`bohr_third_postulate`, `bohr_energy_in_nth_orbit`, `energy_level_diagram_hydrogen`, `hydrogen_like_ion_Z_factor`). These foundational T47 atomics underlie ALL T45 spectra atomics. **Densest single-topic edge bundle so far** (no other Stage-2 pair has had 4+ atomics from one source).
- T44 Wave Optics `doppler_effect_light` → `spectral_line_doppler_shift_red_blue`
- T46 Dual Nature (anticipated) `photon_energy_hf` → `x_ray_continuous_bremsstrahlung_cutoff`, `x_ray_characteristic_k_alpha_k_beta`
- T29/T30 Electrostatics `em_radiation_from_accelerating_charge` (bridge atomic) → `x_ray_production_coolidge_tube`
- T18 Thermodynamics (anticipated) `kirchoffs_radiation_law` → `absorption_line_spectrum` (nano)
- math-tools `algebra_one_over_x_manipulation` → all series formulas
- math-tools `series_combinatorial_n_choose_2` → number-of-spectral-lines atomic

**Dependencies OUT of T45:**
- → T47 Atomic Models (back-edge): Spectra IS the experimental verification of Bohr model. **Bidirectional with T47.**
- → T44 Wave Optics (back-edge): `dispersion_by_prism` (T42 A22 → T44) is the operational mechanism for OBSERVING spectra (prism + spectrometer)
- → T46 Dual Nature: laser/photon nature of light reinforced
- → T48 Nuclei (anticipated): gamma-ray spectra (nuclear transitions) extend the spectroscopy framework
- → Future cosmology atomic: red-shift → Hubble's law

**Edge count for T45:** ~8 IN (heavy from T47, plus T44, T46-anticipated, math-tools) + ~5 OUT.

---

## Section D — Anchor Inventory (Indian context, STRONG density)

| Atomic | Anchor | Why Indian-specific |
|---|---|---|
| `emission_line_spectrum` | **Neon signs** in Indian retail markets (Connaught Place Delhi, Linking Road Mumbai) — discrete neon emission lines | Universal urban Indian anchor |
| `absorption_line_spectrum` | **Solar Fraunhofer dark lines** — used by **Indian Institute of Astrophysics (IIA) Kavalur** to identify Sun's composition | Indian-astronomy anchor |
| `balmer_series_visible` | The **H_α red line** is the most-recognized Indian-Class-12 spectral line; **physics-practical spectroscopy lab** in every CBSE school | Universal Indian anchor |
| `lyman_series_uv` | **UV-emitting tube lights** + sun-tan from UV exposure (Indian summer monsoon-monitoring) | Cross-subject Indian anchor |
| `paschen_series_ir` | **IR-region astronomical observations** at **IUCAA Pune + IIA Kavalur** | Indian-astronomy anchor |
| `rydberg_formula_general` | The universal formula every Indian JEE/NEET student memorizes | Universal Indian JEE-prep anchor |
| `series_limit_each_series` | Continuous-spectrum onset connects to **black-body radiation chapter** taught alongside | Cross-topic Indian anchor |
| `number_of_spectral_lines_combinatorial` | Sleeper-success JEE-Mains pattern: "from n=4, find total emission lines" → 6 | Universal Indian JEE-prep |
| `hydrogen_like_ion_spectrum` | **Meghnad Saha's ionization equation (1921)** — used for stellar spectra of singly/doubly ionized ions in stars. Used at **Saha Institute of Nuclear Physics Kolkata** | Indian-Nobel-context anchor |
| `spectral_line_doppler_shift_red_blue` | **AstroSat (India's first multi-wavelength space observatory, 2015)** + **NCERT explicit "galaxy at 306 km/s" example** | NCERT-explicit Indian-anchor |
| `x_ray_production_coolidge_tube` | **AIIMS X-ray imaging departments + every Indian hospital's diagnostic X-ray machine** uses Coolidge tube design | Universal Indian-healthcare anchor |
| `x_ray_continuous_bremsstrahlung_cutoff` | **CT-scan voltage settings** determine X-ray penetration in Indian hospitals (60 kV vs 120 kV) | Indian-medical-technology anchor |
| `x_ray_characteristic_k_alpha_k_beta` | **X-ray fluorescence (XRF) labs at CSIR labs** identify elemental composition by K_α lines | Indian-research anchor |
| `moseley_law` | Foundational ordering of periodic table — taught in **Indian chemistry curriculum Class 11** | Cross-subject Indian anchor |
| `stimulated_emission_spontaneous_absorption` | **C.V. Raman (1930 Nobel)** — Raman effect is exactly a 3-photon process where stimulated emission is critical | Indian-Nobel-context |
| `laser_population_inversion_metastable_state` | **TIFR Mumbai laser research group** + **Indian Defence DRDO laser development** | Indian-research anchor |
| `he_ne_laser_construction` | **Aravind Eye Hospital LASIK** + **AIIMS dermatology laser treatments** + **physics lab demo in every Indian engineering college** | Multiple Indian-anchor strands |

**Anchor density verdict: STRONG.** 17 of 18 atomics have ready Indian anchors. Spectroscopy is THE Indian-Nobel-bedrock topic (Raman 1930) — anchor density is at the strongest end of the STRONG bucket. Authoring multiplier 1.0×.

---

## Section E — Simulatability Tagging

| Atomic | Sim approach | Confidence |
|---|---|---|
| Emission/absorption spectrum | Color-bar visualization with discrete bright lines (emission) / dark lines (absorption) on continuous background | HIGH |
| Hydrogen spectrum overview | Side-by-side display of all 5 series with wavelength axis | HIGH |
| Balmer/Lyman/Paschen series | Animated transition arrows on energy-level diagram + corresponding spectral-line emission | HIGH (this is where T47 energy-level-diagram pays dividends) |
| Rydberg formula | Formula reveal with parameter sliders (n_f, n_i, Z) updating λ in real-time | HIGH |
| Series limit | Animation of n_i → ∞ → spectral lines crowding together → continuous spectrum onset | HIGH |
| Number-of-lines combinatorial | Tree-diagram animation from n_max state branching down | HIGH |
| Hydrogen-like ion spectrum | Toggle Z = 1 (H), 2 (He⁺), 3 (Li²⁺) — same series structure, λ scales as 1/Z² | HIGH |
| Doppler shift | Moving-source-emitter animation with spectral lines red-shifting (receding) or blue-shifting (approaching) | HIGH |
| X-ray Coolidge tube | Internal cross-section with electrons accelerating + target collisions + X-ray emission | HIGH |
| Bremsstrahlung continuous spectrum | Intensity vs wavelength plot with sharp cutoff at λ_min; cutoff shifts with voltage | HIGH |
| Characteristic X-ray K_α, K_β | Energy-level diagram showing inner-shell L→K transition | HIGH |
| Moseley law | √ν vs Z plot showing linear relationship | HIGH |
| Stimulated emission 3 processes | Side-by-side absorption / spontaneous / stimulated comparison | HIGH |
| Population inversion | Two-level system with pumping animation → metastable state filling up | HIGH |
| He-Ne laser | Cavity + mirrors + gas mixture + lasing animation | HIGH |

**Verdict: 100% high-confidence simulatable.** Atomic spectra is uniquely simulation-friendly (all are visualizable as energy-level transitions). Diamond candidate cluster (T45+T47 together are the densest, most visually rich Modern Physics content).

---

## Section F — V1 priority (deferred to Stage 5)

Tentative top candidates if forced today:
- `rydberg_formula_general` — THE keystone formula
- `balmer_series_visible` — most-taught, school-physics-practical anchor
- `hydrogen_emission_spectrum_overview` — visual organizing principle
- `hydrogen_like_ion_spectrum` — JEE-Adv pattern
- `number_of_spectral_lines_combinatorial` — JEE-Mains pattern

---

## Section G — Open Questions / Stage-4 Flags

1. **Brackett + Pfund merged into 1 atomic** (per AS-G2). JEE-Mains rarely asks them; merge is reasonable. JEE-Adv may ask. Stage 4 may split.
2. **Laser cluster (3 atomics)** could be its own micro-topic. Alternative: merge stimulated_emission + population_inversion into 1 atomic + keep he_ne_laser as engineering application. Stage 4.
3. **`einstein_a_and_b_coefficients`** kept as nano. JEE-Adv has touched this. Could elevate to atomic in Stage 4.
4. **X-ray cluster (4 atomics including Moseley)** is technically a separate sub-topic. HCV puts X-rays in its own chapter (Ch.44). Should T45 own X-rays, or should it be T45.5 spinoff? Currently T45 owns; Stage 4 may split if X-ray atomic count grows.
5. **`spectral_line_doppler_shift_red_blue`** cross-listed with T44 `doppler_effect_light`. Avoid double-counting in matrix. Currently T44 owns; T45 cites + extends to red/blue-shift astronomy context.

---

## Section H — Cross-Source Coverage Matrix

| Atomic | NCERT 12.2 Ch.12 | HCV2 Ch.43 + Ch.44 | DCP O&M |
|---|:---:|:---:|:---:|
| `emission_line_spectrum` | ✓ §12.3 | ✓ §43.2 | ✓ |
| `absorption_line_spectrum` | ✓ §12.3 end | partial | ✓ |
| `hydrogen_emission_spectrum_overview` | ✓ Fig 12.5 | ✓ Fig 43.3 | ✓ |
| `balmer_series_visible` | ✓ §12.3.1 eq 12.5 | ✓ eq 43.1 | ✓ heavily |
| `lyman_series_uv` | ✓ eq 12.6 | ✓ §43.4 | ✓ |
| `paschen_series_ir` | ✓ eq 12.7 | ✓ §43.4 | ✓ |
| `brackett_pfund_series_far_ir` | ✓ eq 12.8, 12.9 | ✓ §43.4 | rare |
| `rydberg_formula_general` | ✓ eq 12.21-12.22 | ✓ eq 43.9 | ✓ heavily |
| `series_limit_each_series` | ✓ p.422 | ✓ §43.4 | ✓ |
| `number_of_spectral_lines_combinatorial` | implicit | ✓ Worked Ex 7 | ✓ heavily |
| `hydrogen_like_ion_spectrum` | implicit | ✓ Ex 43.2 | ✓ heavily |
| `spectral_line_doppler_shift_red_blue` | ✓ Ex 10.1 (Ch.10) | rare | rare |
| `x_ray_production_coolidge_tube` | absent (Ch.12 only) | ✓ Ch.44 §44.1 | ✓ |
| `x_ray_continuous_bremsstrahlung_cutoff` | absent | ✓ §44.2 Fig 44.2 | ✓ |
| `x_ray_characteristic_k_alpha_k_beta` | absent | ✓ §44.2 | ✓ |
| `moseley_law` | absent | mentioned | ✓ |
| `stimulated_emission_spontaneous_absorption` | absent | ✓ §43.9 + Fig 43.6 | brief |
| `laser_population_inversion_metastable_state` | absent | ✓ §43.9 | brief |
| `he_ne_laser_construction` | absent | ✓ §43.9 Fig 43.8-9 | brief |

**Triple-coverage rate: ~70%.** NCERT covers hydrogen spectra strongly but OMITS X-rays + laser (these are HCV-extension topics). DCP covers all. **HCV is the dominant pedagogy source for T45** — Ch.43 + Ch.44 together comprehensively cover spectra + X-rays + laser; NCERT covers only Ch.12 hydrogen-spectrum portion. **HCV2 is now the indispensable source for Modern Physics cluster.**

---

## Section I — Anti-Plagiarism Probe

- Hydrogen spectrum series formulas (Lyman/Balmer/Paschen/Brackett/Pfund) — 1900s public-domain physics.
- Rydberg formula + Rydberg constant — public domain.
- X-ray tube schematic (Coolidge) — historical; we draw our own.
- He-Ne laser schematic (HCV Fig 43.8-9) — standard physics-lab diagram; we render our own primitive composition.
- Indian anchors (Raman, Saha, AIIMS, AstroSat) — public-domain biographical/institutional.
- Moseley plot is reproduced in chemistry textbooks; we render our own (Z vs √ν data points).

✅ Anti-plagiarism risk: LOW.

---

## Section J — Catalog Sign-off

- Total atomics: **18** + ~5 nanos
- Anchor strength: **STRONG** (17 of 18 atomics anchorable; spectroscopy is Indian-Nobel-bedrock — Raman 1930)
- Simulatability: **100% high-confidence** (Diamond candidate cluster with T47)
- Cross-topic edges: ~8 IN (heavy from T47 = 4 atomics, plus T44, T46, T18, math-tools) + ~5 OUT (back to T47, T44, T46, T48)
- Source-role triad: **HCV indispensable** (Ch.43 + Ch.44 together comprehensive; NCERT covers ~60% of Modern Physics; DCP problem-pattern heavy)
- Founder decisions: 7 (AS-G1..G7), stable 15-pilot modal
- Stage-4 flags: 5 items (Brackett/Pfund split, laser-cluster scoping, Einstein coefficients elevation, X-ray sub-topic separation, doppler-shift cross-listing)

**Status: PILOT COMPLETE.** Modern Physics cluster opener (T45 + T47) done. Next: matrix + DISCUSSIONS Session 43 update.
