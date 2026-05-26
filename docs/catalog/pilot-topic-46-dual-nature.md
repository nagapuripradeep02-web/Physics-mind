# Pilot Topic 46 — Dual Nature of Radiation and Matter

> Stage-2 pilot catalog. Matrix-canonical topic number: **T46**. Modern Physics cluster (paired with T48 Nuclei).
>
> **Sources:** NCERT Class 12 Part 2 Ch.11 §11.1–11.9 (book pp.386–405) + HCV Vol 2 Ch.40-42 photoelectric/dual-nature chapters + DCP Optics & Modern Physics Ch.33-34.
>
> Authored as paired-batch with T48 Nuclei. Session 44.

---

## Founder Decisions Applied (T46-specific, prefix DN-G*)

| # | Decision | Reason |
|---|---|---|
| **DN-G1** | **Work function as standalone atomic** (not subsumed under photoelectric). NCERT §11.2 introduces it before §11.3 photoelectric effect — it's the pre-condition. Standalone atomic with Cs (2.14 eV) → Pt (5.65 eV) range gives students a concrete table to anchor "energy needed to escape metal." |
| **DN-G2** | **Photoelectric observations as 3 separate atomics** — (a) photocurrent vs intensity, (b) photocurrent vs voltage + stopping potential, (c) stopping potential vs frequency + threshold-frequency. NCERT §11.4.1-4.3 covers each separately; each has its own JEE-Mains pattern question. Merging into one "photoelectric effect" atomic loses pedagogical structure. |
| **DN-G3** | **Wave-theory-fails-to-explain as standalone atomic.** NCERT §11.5 dedicates an entire section to it; it's the pedagogical beat that motivates Einstein's photon hypothesis. Without it, students don't see WHY Einstein's quantum picture was needed. |
| **DN-G4** | **Einstein photoelectric equation K_max = hν − φ₀ as keystone standalone atomic.** Equivalent role to Bohr energy formula in T47. Standalone teaching unit + simulation candidate. |
| **DN-G5** | **De Broglie wavelength λ = h/p + Davisson-Germer experiment as 2 separate atomics.** Theory and experimental verification are pedagogically distinct. De Broglie hypothesis (1924) and Davisson-Germer (1927) are 3 years apart — separating them respects the historical pedagogy. |
| **DN-G6** | **Heisenberg uncertainty principle as standalone atomic** with wave-packet representation as nano. Δx·Δp ≈ ℏ is the *conceptual* atomic; the wave-packet visual is the supporting nano. |
| **DN-G7** | **Anchor density STRONG.** Indian-context anchors: **Bhadla Solar Park (Rajasthan, 2245 MW)** + **Pavagada Solar Park (Karnataka, 2050 MW)** + **Rewa Solar Power Plant (MP, 750 MW)** all use photovoltaic = direct photoelectric effect. **IIT Kanpur + IIT Madras photonics labs**. **Indian Photovoltaic Society**. **C.V. Raman's quantum-optics legacy at RRI Bangalore**. Authoring multiplier 1.0×. |

---

## Section A — Atomic + Nano Concept Table

| ID | Concept | Type | Sim? | In repo? | Requires | Required-by | Notes |
|---|---|---|---|---|---|---|---|
| `work_function_phi_zero` | Min energy required for electron to escape metal surface. φ₀ in eV. Cs lowest (2.14), Pt highest (5.65). Depends on metal + surface | atomic | ✅ visual | — | [`electron_emission_modes`] | [`einstein_photoelectric_equation`, `threshold_frequency_v_zero`] | NCERT §11.2 + Table 11.1. The energy barrier electrons must overcome. |
| `electron_emission_modes` | 3 ways electrons escape: (i) thermionic (heating), (ii) field emission (~10⁸ V/m), (iii) photoelectric (light) | atomic | ✅ comparison | — | [`work_function_phi_zero`] | [`photoelectric_effect_phenomenology`] | NCERT §11.2 (i-iii). Sets context for photoelectric as one of three. |
| `photoelectric_effect_phenomenology` | Hertz 1887 + Hallwachs/Lenard 1886-1902: UV light on metal → electron emission → photocurrent. Photosensitive substances. | atomic | ✅ animated | — | [`electron_emission_modes`] | [`photocurrent_vs_intensity`, `stopping_potential_v_zero`, `threshold_frequency_v_zero`] | NCERT §11.3 + §11.3.1-3.2. Foundational phenomenon. |
| `photocurrent_vs_intensity_linear` | At fixed ν > ν₀ and fixed positive V: photocurrent ∝ intensity (linear). Saturation current = N_photoelectrons/sec | atomic | ✅ graph+animated | — | [`photoelectric_effect_phenomenology`] | [`einstein_photoelectric_equation`] | NCERT §11.4.1 + Fig 11.2. **JEE-Mains pattern: "what does intensity affect?"** |
| `photocurrent_vs_voltage_saturation` | At fixed ν, fixed intensity: photocurrent saturates at high +V (all photoelectrons collected); reverses to 0 at retarding −V (stopping potential V₀) | atomic | ✅ graph+animated | — | [`photocurrent_vs_intensity_linear`] | [`stopping_potential_v_zero`] | NCERT §11.4.2 + Fig 11.3. The I-V curve. |
| `stopping_potential_v_zero` | The minimum negative V₀ at which photocurrent = 0; relates to K_max of most energetic photoelectron via eV₀ = K_max | atomic | ✅ animated | — | [`photocurrent_vs_voltage_saturation`] | [`einstein_photoelectric_equation`, `stopping_potential_vs_frequency_linear`] | NCERT eq 11.1 + Fig 11.3. **THE key measurement-bridge to Einstein equation.** |
| `↳ stopping_potential_independent_of_intensity` | For fixed ν, V₀ does NOT depend on intensity — only on frequency + metal | nano | ✅ | — | — | — | NCERT §11.4.2 Fig 11.3. **The observation that disproves wave theory** (wave theory predicts V₀ should scale with intensity). |
| `stopping_potential_vs_frequency_linear` | V₀ vs ν straight line: slope = h/e (universal), y-intercept = −φ₀/e (metal-specific); below threshold frequency ν₀, no photoemission | atomic | ✅ graph+animated | — | [`stopping_potential_v_zero`] | [`einstein_photoelectric_equation`, `threshold_frequency_v_zero`] | NCERT §11.4.3 + Fig 11.5 + eq 11.4. **THE plot that Millikan used to measure h.** |
| `threshold_frequency_v_zero` | ν₀ = φ₀/h; minimum frequency for photoemission. Below ν₀ NO emission no matter how bright the light | atomic | ✅ formula+graph | — | [`work_function_phi_zero`, `einstein_photoelectric_equation`] | — | NCERT eq 11.3 + §11.4.3. Cs ν₀ = 5.16 × 10¹⁴ Hz (visible); Pt ν₀ = UV. |
| `photoelectric_emission_instantaneous` | Emission starts within ~10⁻⁹ s of light striking surface, even at very dim light. NOT energy-accumulation as wave theory predicts | atomic | ✅ | — | [`photoelectric_effect_phenomenology`] | [`wave_theory_fails_to_explain_photoelectric`] | NCERT §11.4.3 paragraph 4. The 4th wave-theory-failure observation. |
| `wave_theory_fails_to_explain_photoelectric` | 4 failures: (1) K_max should depend on intensity (doesn't — depends on ν); (2) no ν₀ should exist (does); (3) emission should be slow at dim light (instantaneous); (4) wave can't pump energy into one electron only | atomic | ✅ comparison | — | [`photocurrent_vs_intensity_linear`, `stopping_potential_independent_of_intensity` *(nano)*, `threshold_frequency_v_zero`, `photoelectric_emission_instantaneous`] | [`einstein_photoelectric_equation`, `photon_particle_nature_of_light`] | NCERT §11.5. **Pedagogical pivot point** — sets stage for Einstein's photon hypothesis. |
| `einstein_photoelectric_equation` | K_max = hν − φ₀ = (1/2)mv²_max = eV₀. Each photon = 1 quantum hν; absorbed by 1 electron; explains ALL 4 observations | atomic | ✅ animated+formula | — | [`work_function_phi_zero`, `wave_theory_fails_to_explain_photoelectric`, `photon_energy_hf`] | [`photon_particle_nature_of_light`, `milikan_verification_planck_constant`] | NCERT §11.6 eq 11.2 + 11.4. **Einstein's 1905 Nobel-winning equation.** THE keystone atomic of T46. |
| `↳ photoelectric_intensity_increases_count_not_energy` | Higher intensity = more photons/sec → more electrons/sec, but EACH electron still gets hν energy (not more) | nano | ✅ | — | — | — | NCERT §11.6 bullet 4. The crucial conceptual point. |
| `photon_particle_nature_of_light` | 5 properties: (i) E = hν, (ii) p = hν/c = h/λ, (iii) all photons of given ν have same E, p; intensity = N·E (count, not energy/photon); (iv) electrically neutral; (v) energy+momentum conserved in photon-particle collisions | atomic | ✅ comparison+visual | — | [`einstein_photoelectric_equation`] | [`de_broglie_wavelength`] | NCERT §11.7 (i-v). Compton scattering (1924) further confirmed. |
| `milikan_verification_planck_constant` | Millikan 1906-1916: measured V₀ vs ν slope for sodium → calculated h. Got h ≈ 6.626 × 10⁻³⁴ J·s, matching Planck. Nobel 1923 | atomic | ✅ animated | — | [`stopping_potential_vs_frequency_linear`, `einstein_photoelectric_equation`] | — | NCERT §11.6 paragraph 5. Triple-Nobel-bedrock (Planck 1918, Einstein 1921, Millikan 1923). |
| `de_broglie_wavelength_matter_waves` | All particles have a wavelength λ = h/p = h/(mv); massive objects → tiny λ (unobservable); electrons → measurable λ ~ X-ray range; **theory by symmetry: if waves are particles, particles must be waves** | atomic | ✅ animated | — | [`photon_particle_nature_of_light`] | [`de_broglie_for_accelerated_electron`, `davisson_germer_experiment`, `de_broglie_explains_bohr_postulate` *(T47 link)*] | NCERT §11.8 eq 11.5. **1924 hypothesis; 1929 Nobel.** Sleeper-success conceptual atomic. |
| `de_broglie_for_accelerated_electron` | Electron accelerated through V: K = eV, p = √(2meV), λ = h/√(2meV) = 1.227/√V nm (V in volts). For V = 100 V, λ = 0.123 nm | atomic | ✅ formula+visual | — | [`de_broglie_wavelength_matter_waves`, `kinetic_energy_from_potential`] | [`davisson_germer_experiment`] | NCERT §11.8 eq 11.9-11.11. **JEE-Mains pattern: "find λ of e⁻ at V volts."** |
| `davisson_germer_experiment` | 1927: electron gun → Ni crystal → diffraction peaks at θ=50° for V=54 V. Measured λ = 0.165 nm matches de Broglie 0.167 nm. Nobel 1937 (Davisson+Thomson) | atomic | ✅ animated | — | [`de_broglie_for_accelerated_electron`, `single_slit_diffraction_geometry` *(T44)*] | — | NCERT §11.9 + Fig 11.7. **Experimental verification of de Broglie.** |
| `↳ electron_diffraction_extends_to_other_particles` | 1989 double-slit electron interference; 1994 iodine-molecule interference (10⁶× heavier than electron). Wave nature is universal | nano | ✅ visual | — | — | — | NCERT §11.9 last paragraph. |
| `heisenberg_uncertainty_principle` | Δx · Δp ≈ ℏ (or ℏ/2 rigorously). Cannot simultaneously measure position and momentum precisely. Fundamental, not measurement-error | atomic | ✅ animated | — | [`de_broglie_wavelength_matter_waves`] | [`bohr_model_limitations` *(T47 link)*] | NCERT §11.8 eq 11.12. Bohr's "definite orbit" violates this — links to T47 limitations. |
| `↳ wave_packet_position_momentum_spread` | Localized wave packet → range of wavelengths → range of momenta. Visualizes Δx-Δp tradeoff | nano | ✅ animated | — | — | — | NCERT §11.8 Fig 11.6. |
| `photocell_applications` | Photoelectric device used in automatic doors, fire alarms, burglar alarms, light meters, traffic counters, motion-picture audio playback | atomic | ✅ visual | — | [`photoelectric_effect_phenomenology`] | — | NCERT §11.7 inset box. **Anchor-rich** — multiple Indian retail/security/film-industry uses. |

**Total atomics: 18.** **Total nanos: ~4.**

---

## Section B — Dependency Graph (T46 internal)

```
work_function_phi_zero
  ↳ electron_emission_modes
       ↳ photoelectric_effect_phenomenology
            ↳ photocurrent_vs_intensity_linear
                 ↳ photocurrent_vs_voltage_saturation
                      ↳ stopping_potential_v_zero
                           ↳ stopping_potential_vs_frequency_linear
                                ↳ threshold_frequency_v_zero
            ↳ photoelectric_emission_instantaneous
            ↳ photocell_applications
       wave_theory_fails_to_explain_photoelectric  (aggregates the 4 observation failures)
            ↳ einstein_photoelectric_equation ★ keystone ★
                 ↳ photon_particle_nature_of_light
                      ↳ de_broglie_wavelength_matter_waves
                           ↳ de_broglie_for_accelerated_electron
                                ↳ davisson_germer_experiment
                           ↳ heisenberg_uncertainty_principle
                 ↳ milikan_verification_planck_constant
```

---

## Section C — Cross-Topic Dependencies (export to matrix)

**Dependencies INTO T46:**
- T44 Wave Optics `polarisation_transverse_wave_proof` → bridges to particle-vs-wave story (T46 establishes the dual)
- T44 Wave Optics `single_slit_diffraction_geometry` → `davisson_germer_experiment` (electrons diffract; same math)
- T45 Atomic Spectra `x_ray_continuous_bremsstrahlung_cutoff` + `x_ray_characteristic_k_alpha_k_beta` → `photon_particle_nature_of_light` (cross-link, photon nature)
- T47 Atomic Models `bohr_third_postulate_transition_photon_emission` → bridges to `einstein_photoelectric_equation` (both use E = hν)
- T30 Electrostatics `electric_field_E_and_F=qE` → `electron_emission_modes` (field emission)
- T36 Moving Charges `kinetic_energy_eV_conversion` → `de_broglie_for_accelerated_electron`
- math-tools [`series_binomial_expansion_and_approximation`](stage-3-math-tools.md) → wave-packet expansion
- math-tools [`calculus_derivative_basics`](stage-3-math-tools.md) → de Broglie momentum-frequency relations

**Dependencies OUT of T46:**
- → T47 Atomic Models: `de_broglie_wavelength_matter_waves` provides retroactive justification for `bohr_second_postulate_angular_momentum_quantization`. **Bidirectional with T47.**
- → T47 Atomic Models: `heisenberg_uncertainty_principle` connects to `bohr_model_limitations`. **Bidirectional with T47.**
- → T48 Nuclei: `photon_particle_nature_of_light` → γ-ray photons in nuclear decay
- → T49 Semiconductor (anticipated): `photoelectric_effect_phenomenology` → photovoltaic effect in solar cells
- → T44 Wave Optics (back-edge): wave-particle duality framing reinforces transverse-wave proof

**Edge count for T46:** ~8 IN (T44, T45, T47, T30, T36, math-tools) + ~5 OUT (T47 back, T48, T49, T44 back).

---

## Section D — Anchor Inventory (Indian context, STRONG density)

| Atomic | Anchor | Why Indian-specific |
|---|---|---|
| `work_function_phi_zero` | Materials science labs at **IIT Kanpur + IIT Bombay** measuring work functions of new metals | Indian research anchor |
| `photoelectric_effect_phenomenology` | **Bhadla Solar Park (Rajasthan, 2245 MW)** + **Pavagada Solar Park (Karnataka, 2050 MW)** — direct photoelectric → photovoltaic | World's largest solar parks, Indian flagship |
| `photocurrent_vs_intensity_linear` | Solar panel output scales linearly with sunlight intensity — Indian rooftop solar adoption (KUSUM Yojana) | Indian-government-flagship anchor |
| `photocurrent_vs_voltage_saturation` | Photovoltaic I-V characteristic shown in **Indian PV industry datasheets** (Tata Power Solar, Adani Green) | Indian industry anchor |
| `stopping_potential_vs_frequency_linear` | Standard physics-lab experiment in **every Indian engineering college's physics lab** | Universal Indian-curriculum anchor |
| `threshold_frequency_v_zero` | Why **UV blocks ozone-layer-protection sunscreens** in Indian summer (UV-A vs UV-B threshold) | Cross-subject Indian health-anchor |
| `wave_theory_fails_to_explain_photoelectric` | Indian classroom discussion: "why did Einstein win Nobel" — standard JEE-prep conceptual question | Indian-JEE-culture anchor |
| `einstein_photoelectric_equation` | THE keystone formula taught in **every Indian Class 12 board exam preparation** | Universal Indian-curriculum |
| `photon_particle_nature_of_light` | LASER printers + smartphone camera CMOS sensors — every Indian student uses these daily | Universal Indian-teen anchor |
| `milikan_verification_planck_constant` | Coordinate timing with Indian Nobel history: Planck 1918 → Einstein 1921 → Millikan 1923 → **Raman 1930** | Indian-Nobel-context |
| `de_broglie_wavelength_matter_waves` | **Electron microscopy at TIFR Mumbai + IISc Bangalore** uses matter-wave nature directly | Indian-research anchor |
| `de_broglie_for_accelerated_electron` | Scanning electron microscope (SEM) at **CSIR labs + IIT materials labs** uses V→λ relation | Indian-industry anchor |
| `davisson_germer_experiment` | Standard demonstration in **Indian undergraduate physics labs** (recreated with thin-film diffraction) | Indian-curriculum anchor |
| `heisenberg_uncertainty_principle` | **Quantum cryptography research at ISRO + RRI Bangalore** uses this principle for unhackable communication | Indian-defense + quantum-tech anchor |
| `photocell_applications` | Automatic toll-gate sensors on **Indian highways (FASTag-adjacent IR photocells)** + **theater motion-detector lights** | Universal Indian retail-tech anchor |

**Anchor density verdict: STRONG.** Solar panels + Indian solar parks anchor 4+ atomics; electron microscopy + IIT research labs anchor 3+ atomics. Photovoltaic = direct application of T46 in India's energy transition. Authoring multiplier 1.0×.

---

## Section E — Simulatability Tagging

| Atomic | Sim approach | Confidence |
|---|---|---|
| Work function | Energy-level diagram inside metal; electron escapes if K > φ₀ | HIGH |
| Electron emission modes | Three side-by-side animations: heated wire / strong E-field / UV light | HIGH |
| Photoelectric phenomenology | Apparatus with UV source + metal plate + circuit + ammeter | HIGH |
| Photocurrent vs intensity | Slider for intensity; ammeter readout updates linearly | HIGH |
| Photocurrent vs voltage | I-V curve with sweep voltage; saturation + stopping potential reveal | HIGH |
| Stopping potential | Animation of retarding-field decelerating electrons | HIGH |
| Stopping potential vs frequency | Live-plot V₀ vs ν → straight-line slope = h/e reveal | HIGH |
| Threshold frequency | Try ν < ν₀ → no emission; ν > ν₀ → emission begins | HIGH |
| Photoelectric instantaneous | Time-lapse comparison: wave-theory prediction (slow) vs reality (~10⁻⁹ s) | HIGH |
| Wave theory fails | Side-by-side: 4 wave-theory predictions vs 4 observations | HIGH |
| Einstein equation | Single-photon-absorption animation + K_max = hν − φ₀ reveal | HIGH |
| Photon particle nature | 5-properties side-by-side comparison + photon-electron collision animation | HIGH |
| Millikan experiment | V₀ vs ν straight-line fitting animation → calculate h | HIGH |
| De Broglie wavelength | Particle → wave-packet morphing animation; λ slider | HIGH |
| De Broglie accelerated electron | V slider → λ updates via 1.227/√V relation | HIGH |
| Davisson-Germer | Electron gun → Ni crystal → diffraction peak at θ=50° | HIGH |
| Heisenberg uncertainty | Position-localized particle ↔ momentum-spread visualization | HIGH (wave-packet animation) |
| Photocell applications | 4 use-case animations: automatic door, light meter, traffic counter, alarm | MEDIUM (multi-scenario) |

**Verdict: 100% high-confidence simulatable.** T46 is unusually animation-friendly — every atomic has a discrete experimental setup with clear input/output. Strong V1 candidate cluster.

---

## Section F — V1 priority (deferred to Stage 5)

Tentative top candidates:
- `einstein_photoelectric_equation` — THE keystone
- `stopping_potential_vs_frequency_linear` — Indian-physics-lab standard
- `de_broglie_wavelength_matter_waves` — JEE conceptual core
- `de_broglie_for_accelerated_electron` — JEE-Mains formula pattern
- `davisson_germer_experiment` — experimental verification anchor

---

## Section G — Open Questions / Stage-4 Flags

1. **`photocell_applications` atomic** — borderline atomic vs cluster-of-nanos. NCERT puts it in an inset box; HCV omits. Stage 4 may demote to nano if other atomics surge in count.
2. **`heisenberg_uncertainty_principle`** — currently in T46. Could move to T47 (where it directly motivates Bohr-limitations) or to a future "Quantum Mechanics Foundations" topic. Currently T46 owns; T47 cites.
3. **`compton_scattering`** mentioned in NCERT §11.7 paragraph 1 but not given its own atomic. Stage 4 may elevate — historically important verification of photon-particle nature.
4. **`einstein_photoelectric_equation` vs `photon_energy_hf`** — partial overlap. Photon-energy is more fundamental; photoelectric equation is the specific application. Currently 2 atomics (photon-energy implicit; photoelectric explicit). Stage 4 may add explicit `photon_energy_hf` atomic if T48 γ-decay needs it.
5. **Wave-particle duality philosophical framing** — NCERT Appendix 11.1 covers Newton↔Young↔Maxwell↔Planck↔Einstein↔de Broglie history (~ ~150 word essay). Could become a context-only atomic ("history-of-wave-particle-flip-flop"). Currently omitted; Stage 4 may add.

---

## Section H — Cross-Source Coverage Matrix

| Atomic | NCERT 12.2 Ch.11 | HCV2 photoelectric chapter | DCP O&M |
|---|:---:|:---:|:---:|
| `work_function_phi_zero` | ✓ §11.2 Table 11.1 | ✓ | ✓ |
| `electron_emission_modes` | ✓ §11.2 (i-iii) | brief | brief |
| `photoelectric_effect_phenomenology` | ✓ §11.3.1-3.2 | ✓ | ✓ |
| `photocurrent_vs_intensity_linear` | ✓ §11.4.1 + Fig 11.2 | ✓ | ✓ |
| `photocurrent_vs_voltage_saturation` | ✓ §11.4.2 + Fig 11.3 | ✓ | ✓ heavily |
| `stopping_potential_v_zero` | ✓ §11.4.2 + eq 11.1 | ✓ | ✓ heavily |
| `stopping_potential_vs_frequency_linear` | ✓ §11.4.3 + Fig 11.5 | ✓ | ✓ |
| `threshold_frequency_v_zero` | ✓ eq 11.3 | ✓ | ✓ |
| `photoelectric_emission_instantaneous` | ✓ §11.4.3 | ✓ | brief |
| `wave_theory_fails_to_explain_photoelectric` | ✓ §11.5 | ✓ | partial |
| `einstein_photoelectric_equation` | ✓ §11.6 eq 11.2 + 11.4 | ✓ heavily | ✓ heavily |
| `photon_particle_nature_of_light` | ✓ §11.7 (i-v) | ✓ | ✓ |
| `milikan_verification_planck_constant` | ✓ §11.6 paragraph 5 | ✓ | brief |
| `de_broglie_wavelength_matter_waves` | ✓ §11.8 eq 11.5 | ✓ | ✓ |
| `de_broglie_for_accelerated_electron` | ✓ §11.8 eq 11.9-11.11 | ✓ | ✓ heavily |
| `davisson_germer_experiment` | ✓ §11.9 Fig 11.7 | ✓ | ✓ |
| `heisenberg_uncertainty_principle` | ✓ §11.8 eq 11.12 + Fig 11.6 | brief | brief |
| `photocell_applications` | ✓ §11.7 inset box | absent | brief |

**Triple-coverage rate: ~80%.** **HCV is dominant pedagogy source for T46** (cleanest derivation of K_max formula + de Broglie + Davisson-Germer); NCERT covers ~90% of scope including photocell applications inset; DCP is problem-pattern heavy. Continues 17-pilot pattern.

---

## Section I — Anti-Plagiarism Probe

- Einstein 1905 photoelectric equation — public domain.
- Standard apparatus diagrams (Lenard tube, Davisson-Germer setup) — render our own.
- Work function table data — published values, factual.
- Indian anchors (Bhadla, Pavagada, TIFR, IISc, RRI) — public-domain institutional facts.

✅ Anti-plagiarism risk: LOW.

---

## Section J — Catalog Sign-off

- Total atomics: **18** + ~4 nanos
- Anchor strength: **STRONG** (solar parks + electron microscopy + IIT research; 15 of 18 atomics anchorable in Indian context)
- Simulatability: **100% high-confidence** (animation-friendly experimental setups)
- Cross-topic edges: ~8 IN (T44, T45, T47, T30, T36, math-tools) + ~5 OUT (T47 back, T48, T49)
- Source-role triad: HCV2 dominant pedagogy + NCERT comprehensive anchor + DCP problem patterns
- Founder decisions: 7 (DN-G1..G7), stable 17-pilot modal
- Stage-4 flags: 5 items (photocell scope, uncertainty location, Compton elevation, photon-energy overlap, wave-particle history)

**Status: PILOT COMPLETE.** T48 next.
