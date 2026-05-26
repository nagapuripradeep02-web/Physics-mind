# Pilot Topic 44 — Wave Optics

> Stage-2 pilot catalog. Matrix-canonical topic number: **T44**. Optics cluster closure (T41 ↔ T42 ↔ T43 ↔ **T44**).
>
> **Sources**: NCERT Class 12 Part 2 Ch.10 §10.1–10.7 (book pp.351–386) + HCV Vol 1 Ch.17 Light Waves (book pp.360–384) + DCP Optics Ch.32 Interference + Diffraction (problem patterns referenced indirectly via JEE conventions).
>
> Authored as paired-batch with T43 Optical Instruments. Session 41.

---

## Founder Decisions Applied (T44-specific, prefix WO-G*)

| # | Decision | Reason |
|---|---|---|
| **WO-G1** | **Huygens principle is its own atomic** (`huygens_principle`), separate from its applications. NCERT §10.2 + HCV §17.4 both teach it as a foundational construction tool, then apply it 3 times (§10.3 reflection, §10.3 refraction, §10.6 diffraction). **Reason:** if Huygens principle isn't taught as a discrete idea first, the three applications feel like magic. Building Huygens as the **foundational atomic** lets the three application-atomics reuse it cleanly. |
| **WO-G2** | **Wave-theory derivations of reflection/refraction are TWO atomics, not one.** Geometry differs (reflection: same medium, same v; refraction: medium change, BC = vτ vs AE = v'τ). NCERT splits them across §10.3.1, §10.3.3. The Snell's law derivation from Huygens is **conceptually the high point of Class 12 wave optics** — it must stand alone. |
| **WO-G3** | **YDSE is split into ~4 atomics**, not one omnibus "Young's experiment". Setup geometry / path difference / fringe-width formula / intensity distribution each is a separate teaching moment with its own JEE-Main problem pattern. **Reason:** students who can recite β = λD/d often cannot derive WHY path difference = xd/D — that's a Stage-4-style cognitive gap, formalized via separate atomics. |
| **WO-G4** | **Single-slit diffraction is split from YDSE proper.** NCERT §10.5 (interference) and §10.6 (diffraction) are deliberately separated; mixing them is a common student error (NCERT §10.6 quotes Feynman directly: "No one has ever been able to define the difference between interference and diffraction satisfactorily"). Splitting into separate atomics + an **explicit comparison atomic** `diffraction_vs_interference_distinction` honors NCERT's pedagogy and addresses the cognitive trap. |
| **WO-G5** | **Polarisation is split into 4 atomics, not one.** Transverse-wave proof / Malus' law / polaroid mechanism / Brewster's law are pedagogically distinct: one philosophical (proof), one formula-driven (Malus), one device (polaroid), one application (Brewster reflection). Anchor density allows: monsoon-rainbow + polaroid sunglasses + photography filters. |
| **WO-G6** | **Doppler effect for light = its own atomic**, NOT a nano of "Doppler effect" (which lives in T15 Waves). **Reason:** the formula structure is identical (Δν/ν = -v/c) but the application context is entirely astronomy (red shift, blue shift, galaxy radial velocity — Hubble's law gateway). Treating it as a wave-optics atomic with **astronomy anchor** ties to T43 (`reflecting_telescope_cassegrain_newton` → observe red-shift). |
| **WO-G7** | **Anchor density rating: STRONG.** Wave optics anchors are abundant: **monsoon rainbow** (Indian context — annual June-Sept), **YDSE physics-practical kit** (every Indian school has one), **polaroid sunglasses** (Indian markets), **CD/DVD diffraction grating** (universal teen anchor), **GMRT Pune interferometry** (radio-wave optics, conceptual extension), **rangoli sand-art diffraction** (Indian-culture anchor), **Hubble red-shift cosmology** (NCERT explicit). Authoring multiplier = **1.0×**. |

---

## Section A — Atomic + Nano Concept Table

| ID | Concept | Type | Sim? | In repo? | Requires | Required-by | Notes |
|---|---|---|---|---|---|---|---|
| `wavefront_types` | Plane / spherical / cylindrical wavefronts; locus of in-phase points | atomic | ✅ visual | — | — | [`huygens_principle`, `reflection_wave_theory`, `refraction_wave_theory_snells_law`] | NCERT §10.2 intro. |
| `huygens_principle` | Every point on wavefront = source of secondary spherical wavelets; new wavefront = tangent envelope after time τ | atomic | ✅ animated | — | [`wavefront_types`] | [`reflection_wave_theory`, `refraction_wave_theory_snells_law`, `single_slit_diffraction_geometry`] | NCERT §10.2 + HCV §17.4. The foundational atomic. |
| `↳ backward_wave_problem` | Why secondary wavelets don't generate backward wave — historical hand-wave, resolved by Kirchhoff diffraction theory | nano | minimal | — | — | — | Conceptual flag students raise; addressing it directly avoids confusion. |
| `reflection_wave_theory` | Derivation of law of reflection (i = r) using Huygens construction (BC = vτ = AE) | atomic | ✅ derivation | — | [`huygens_principle`] | — | NCERT §10.3.3 + HCV §17.5. Triangles EAC ≅ BAC → i = r. |
| `refraction_wave_theory_snells_law` | Derivation of n_1 sin i = n_2 sin r using BC = v_1τ and AE = v_2τ; n_2/n_1 = v_1/v_2 | atomic | ✅ derivation | — | [`huygens_principle`] | [`apparent_depth`, `critical_angle_TIR`, `refractive_index_definition`] | NCERT §10.3.1 + HCV §17.6. **The pedagogical centerpiece of Class 12 wave optics.** |
| `↳ wave_speed_changes_freq_does_not` | At a medium boundary, ν stays; λ and v change | nano | ✅ visual | — | — | — | NCERT Example 10.2(a). Common misconception. |
| `doppler_effect_light` | Δν/ν = −v_radial/c for v ≪ c; red shift (galaxy receding) vs blue shift (approaching) | atomic | ✅ animated | — | [`refraction_wave_theory_snells_law` *(weak)*] | — | NCERT §10.3.4 + Example 10.1 (galaxy at 306 km/s, Δλ = 0.6 nm). Anchor: **Hubble's law + Big Bang cosmology — NCERT explicit anchor**. |
| `superposition_principle_waves` | Resultant displacement = vector sum of individual displacements at a point | atomic | ✅ | — | — | [`coherent_vs_incoherent_sources`, `ydse_intensity_distribution`] | NCERT §10.4 intro. Cross-link: same principle in T15 Waves chapter. |
| `coherent_vs_incoherent_sources` | Coherent = constant phase relationship → stable interference; incoherent = random phase → intensities add (I = 2I₀) | atomic | ✅ animated | — | [`superposition_principle_waves`] | [`ydse_setup_geometry`, `ydse_intensity_distribution`] | NCERT §10.4 + Fig 10.11 (two sodium lamps → no fringes). |
| `↳ time_average_intensity_2I0` | When φ rapidly varies, ⟨cos²(φ/2)⟩ = 1/2 → I = 2I₀ | nano | ✅ | — | — | — | NCERT eq (10.13, 10.14). |
| `path_difference_phase_difference` | Δφ = (2π/λ)·Δx; constructive: Δx = nλ; destructive: Δx = (n+½)λ | atomic | ✅ animated | — | [`superposition_principle_waves`] | [`ydse_path_difference_formula`, `single_slit_minima_condition`] | NCERT eq (10.10, 10.11). |
| `ydse_setup_geometry` | Two pinholes S₁, S₂ behind master pinhole S; spherical waves interfere on distant screen | atomic | ✅ visual | — | [`coherent_vs_incoherent_sources`] | [`ydse_path_difference_formula`, `ydse_fringe_width`, `ydse_intensity_distribution`] | NCERT §10.5 + Fig 10.12. Foundational JEE Mains pattern. |
| `↳ thomas_young_locking_phases` | Master pinhole S "locks" phases — any abrupt phase change in S transfers identically to S₁, S₂ | nano | ✅ | — | — | — | NCERT §10.5. The crucial trick that made the experiment work in 1801. |
| `ydse_path_difference_formula` | Δx = xd/D for x, d ≪ D (binomial approximation) | atomic | ✅ derivation | — | [`ydse_setup_geometry`, `path_difference_phase_difference`] | [`ydse_fringe_width`, `ydse_bright_dark_positions`] | NCERT eq (10.15–10.17). Derivation uses (S₂P)² − (S₁P)² = 2xd. |
| `ydse_fringe_width` | β = λD/d (fringe spacing); uniform spacing between consecutive bright OR dark | atomic | ✅ formula | — | [`ydse_path_difference_formula`] | [`ydse_with_white_light_central_white`, `ydse_screen_distance_effect`] | NCERT eq (10.20) + HCV §17.8. **The most-asked JEE-Main formula in wave optics.** |
| `ydse_bright_dark_positions` | Bright at x_n = nλD/d; dark at x_n = (n+½)λD/d | atomic | ✅ formula | — | [`ydse_fringe_width`] | — | NCERT eq (10.18, 10.19). |
| `ydse_intensity_distribution` | I = 4I₀cos²(φ/2); periodic pattern between 0 and 4I₀ | atomic | ✅ animated | — | [`coherent_vs_incoherent_sources`, `ydse_path_difference_formula`] | [`ydse_with_white_light_central_white`] | NCERT eq (10.12) + Fig 10.14. |
| `ydse_with_white_light_central_white` | Central fringe = white (all λ overlap at Δx = 0); side fringes = coloured (red farthest, then no clear pattern) | atomic | ✅ animated | — | [`ydse_fringe_width`, `dispersion_by_prism` *(T42)*] | — | NCERT Example 10.4(f). Single Indian-context anchor: **rainbow-coloured CD reflection** (real diffraction grating but visually identical). |
| `ydse_screen_distance_effect` + 4 other parameter variations | Effect of changing D / d / slit width / wavelength / source-slit distance s | atomic (parameter-sweep) | ✅ interactive | — | [`ydse_fringe_width`] | — | NCERT Example 10.4 — multi-part. Sleeper-success JEE-Main pattern. |
| `↳ s_over_S_less_than_lambda_over_d` | Source-slit condition s/S < λ/d for fringes to be visible | nano | ✅ | — | — | — | NCERT Example 10.4(d). Causes fringes to disappear when violated — non-obvious. |
| `single_slit_diffraction_geometry` | Slit width a, screen at distance D, divide into N parallel secondary sources (Huygens); path difference between edges = a sinθ ≈ aθ | atomic | ✅ derivation | — | [`huygens_principle`, `path_difference_phase_difference`] | [`single_slit_minima_condition`, `fraunhofer_diffraction_circular`, `resolving_power_microscope` *(T43)*, `resolving_power_telescope` *(T43)*] | NCERT §10.6.1 + Fig 10.15. |
| `single_slit_minima_condition` | Zero intensity at aθ = nλ, n = ±1, ±2, ...; halve-and-cancel argument | atomic | ✅ derivation | — | [`single_slit_diffraction_geometry`] | [`fraunhofer_diffraction_circular`] | NCERT eq (10.22). Critical: n = 0 is NOT a minimum (it's the central max). |
| `single_slit_secondary_maxima` | Weaker peaks at aθ = (n+½)λ; intensity drops off rapidly | atomic | ✅ visual | — | [`single_slit_minima_condition`] | — | NCERT §10.6.1 + Fig 10.16. Third-the-slit argument explains decay. |
| `central_max_double_width` | Central bright fringe = 2λ/a wide; secondary maxima = λ/a wide | atomic | ✅ visual | — | [`single_slit_minima_condition`] | — | NCERT §10.6.1 + Fig 10.17. Why the diffraction envelope dominates intensity profile. |
| `diffraction_vs_interference_distinction` | Few sources → "interference"; many sources → "diffraction" (Feynman quote); intensity-redistribution explanation | atomic | ✅ comparison | — | [`ydse_intensity_distribution`, `single_slit_minima_condition`] | — | NCERT §10.6.1 quotes Feynman directly. **Essential cognitive-clarification atomic.** |
| `double_slit_combined_diffraction_envelope` | Real YDSE pattern = double-slit cos² × single-slit (sinα/α)² envelope; missing orders when d/a is integer | atomic | ✅ animated | — | [`ydse_intensity_distribution`, `single_slit_diffraction_geometry`] | — | NCERT §10.6.1 final + Fig 10.17. |
| `fraunhofer_diffraction_circular_aperture` | Airy pattern: central disk of radius r_0 ≈ 1.22λf/(2a); concentric rings | atomic | ✅ visual | — | [`single_slit_diffraction_geometry`] | [`resolving_power_telescope` *(T43)*, `resolving_power_microscope` *(T43)*] | NCERT §10.6.3 eq (10.24). Source of the 1.22 factor in T43. |
| `fresnel_distance_validity_ray_optics` | z_F = a²/λ; beyond z_F diffraction spreading dominates over geometric aperture; ray optics breaks down | atomic | ✅ formula | — | [`single_slit_diffraction_geometry`] | — | NCERT eq (10.31) + Example 10.7 (a = 3 mm, λ = 500 nm → z_F = 18 m). Quantifies where rays-vs-waves boundary lies. |
| `polarisation_transverse_wave_proof` | Two-polaroid experiment: rotate analyzer relative to polarizer → intensity varies from full to zero → light is transverse | atomic | ✅ animated | — | — | [`malus_law_polariser_analyzer`, `brewsters_law_reflection_polarisation`] | NCERT §10.7. Sound waves don't polarise — clinches transverse nature of EM. |
| `↳ string_analogy_for_polarisation` | Slot polariser on long string: only wave parallel to slot passes | nano | ✅ animated | — | — | — | NCERT §10.7 string analogy. Sleeper-success pedagogy. |
| `malus_law_polariser_analyzer` | I = I₀ cos²θ where θ = angle between polariser and analyzer transmission axes | atomic | ✅ animated+formula | — | [`polarisation_transverse_wave_proof`] | — | NCERT §10.7 (Malus' law). |
| `polaroid_mechanism_dichroism` | Polaroid material absorbs E-vector along one axis, transmits perpendicular axis (selective absorption) | atomic | ✅ visual | — | [`polarisation_transverse_wave_proof`] | [`malus_law_polariser_analyzer`] | NCERT §10.7. Anchor: **polaroid sunglasses** reducing road glare. |
| `brewsters_law_reflection_polarisation` | At Brewster's angle iB where tan iB = n, reflected light is fully polarised perpendicular to plane of incidence | atomic | ✅ derivation+visual | — | [`refraction_wave_theory_snells_law`, `polarisation_transverse_wave_proof`] | — | NCERT §10.7 Brewster's law. iB + rB = 90°. |
| `polarisation_by_scattering` | Rayleigh scattering polarises light; explains why sky-blue and why polaroid sunglasses block sky glare | atomic | ✅ animated | — | [`scattering_rayleigh` *(T42)*] | — | NCERT §10.7 application. Anchor: **monsoon sky** + Indian-summer hazy noon sky. |

**Total atomics: 28.** **Total nanos: ~10.**

---

## Section B — Dependency Graph (T44 internal)

```
wavefront_types
  ↳ huygens_principle  (foundational atomic)
       ↳ reflection_wave_theory
       ↳ refraction_wave_theory_snells_law
            ↳ doppler_effect_light  (weak link)
       ↳ single_slit_diffraction_geometry
            ↳ single_slit_minima_condition
                 ↳ central_max_double_width
                 ↳ single_slit_secondary_maxima
                 ↳ fraunhofer_diffraction_circular_aperture
                 ↳ fresnel_distance_validity_ray_optics
                 ↳ double_slit_combined_diffraction_envelope

superposition_principle_waves
  ↳ coherent_vs_incoherent_sources
       ↳ ydse_setup_geometry
            ↳ ydse_path_difference_formula
                 ↳ ydse_fringe_width
                      ↳ ydse_bright_dark_positions
                      ↳ ydse_with_white_light_central_white
                      ↳ ydse_screen_distance_effect
            ↳ ydse_intensity_distribution
                 ↳ double_slit_combined_diffraction_envelope
                 ↳ diffraction_vs_interference_distinction

polarisation_transverse_wave_proof  (independent root)
  ↳ malus_law_polariser_analyzer
  ↳ polaroid_mechanism_dichroism
  ↳ brewsters_law_reflection_polarisation
  ↳ polarisation_by_scattering
```

---

## Section C — Cross-Topic Dependencies (export to matrix)

**Dependencies INTO T44:**
- T15 Waves (`superposition_principle`, generic) → `superposition_principle_waves` (specific to light)
- T21 EM Waves (`em_wave_transverse_nature`) → `polarisation_transverse_wave_proof`
- T23 Sound Waves (`doppler_effect_sound`) → `doppler_effect_light` (analogy, not strict requirement)
- T42 A1 `refractive_index_definition` → `refraction_wave_theory_snells_law`
- T42 A22 `dispersion_by_prism` → `ydse_with_white_light_central_white`
- T42 A25 `scattering_rayleigh` → `polarisation_by_scattering`
- math-tools (binomial approximation a² + b² ≈ a + b²/2a for b ≪ a) → `ydse_path_difference_formula`
- math-tools (small-angle approximations sinθ ≈ θ, tanθ ≈ θ) → ALL diffraction/YDSE atomics
- math-tools (cos²(φ/2) = (1+cosφ)/2, time-averaging) → `ydse_intensity_distribution`, `malus_law_polariser_analyzer`

**Dependencies OUT of T44:**
- → T43 `resolving_power_microscope`, `resolving_power_telescope`, `oil_immersion_objective` (Rayleigh + 1.22 factor)
- → T45 Atomic Spectra (`atomic_emission_spectra` — observing doppler-shifted hydrogen lines uses red-shift atomic)
- → T46 Modern Physics (`photoelectric_effect` referenced via wave-particle duality — but NCERT Ch.10 stays purely wave)
- → T47 Dual nature (`de_broglie_wavelength` extends wave concept to matter)

**Edge count for T44**: ~12 IN (from T15, T23, T21, T42, math-tools) + ~6 OUT (to T43, T45–T47). Net heavy bidirectional with T42 + T43, confirming Optics cluster tightness.

---

## Section D — Anchor Inventory (Indian context, STRONG density)

| Atomic | Anchor | Why Indian-specific |
|---|---|---|
| `wavefront_types` | Stadium PA announcement wavefronts; **Dharma Stadium Bengaluru / Eden Gardens Kolkata acoustic design** | Concrete + Indian |
| `huygens_principle` | Water-ripple at ghat steps (Varanasi/Haridwar) → secondary wavelets visible | Cultural-physics anchor |
| `reflection_wave_theory` | School physics-practical: mirror-on-protractor | Universal Indian-student anchor |
| `refraction_wave_theory_snells_law` | Spoon-in-water at chai-tapri (street-side tea stall) | Universal + culturally Indian |
| `doppler_effect_light` | **Hubble red-shift cosmology — NCERT explicit anchor** ("306 km/s sodium-line example"); applies to **Hanle Observatory Ladakh** spectroscopy | Indian astronomy infra |
| `coherent_vs_incoherent_sources` | Two sodium street-lamps on Indian roads (incoherent, never produces fringes) vs single-laser-pointer-via-pinholes (coherent) | Concrete Indian street observation |
| `ydse_setup_geometry` | **CBSE Class 12 physics-practical YDSE kit** — every Indian board student has done this experiment | Universal Indian-curriculum anchor |
| `ydse_fringe_width` | Same physics-practical β measurement in school lab | Universal |
| `ydse_with_white_light_central_white` | **Monsoon rainbow (June-Sept across India)** — interference + dispersion; soap-film colours on Mumbai rain puddles | Universal monsoon-India anchor |
| `single_slit_diffraction_geometry` | **CD/DVD diffraction grating viewing** — every Indian teen has seen rainbow colours on old CDs | Universal teen anchor |
| `single_slit_minima_condition` | School physics-practical: razor-blade slit + filament lamp (NCERT §10.6.2 "Determine resolving power" demo) | Universal Indian-curriculum |
| `central_max_double_width` | Same razor-blade demo — visible asymmetry between central and side fringes | Universal |
| `fraunhofer_diffraction_circular_aperture` | **Star images in any astronomical telescope** — including Kavalur's | Bridges to T43 |
| `fresnel_distance_validity_ray_optics` | LED-flashlight beam spreading over 18m room — when does it stop looking like a ray? | Real measurement, accessible |
| `polarisation_transverse_wave_proof` | **Two polaroid sunglasses rotated against each other** — every Indian sunglass-wearer has seen the blackout effect | Universal anchor |
| `malus_law_polariser_analyzer` | Same polaroid-sunglass demo with angle-meter | Universal |
| `polaroid_mechanism_dichroism` | **Photography filters at Indian wedding-photographer kits** + LCD displays | Concrete Indian retail context |
| `brewsters_law_reflection_polarisation` | **Glare off wet Mumbai-monsoon roads** at sunrise/sunset — polaroid sunglasses cut this | Indian monsoon anchor |
| `polarisation_by_scattering` | **Indian monsoon-noon hazy blue sky** vs **Himalayan high-altitude deep-blue sky** (Ladakh, Spiti) — polariser reveals scattering | Geographic Indian anchor |

**Anchor density verdict: STRONG.** 19 of 19 anchorable atomics have Indian-context anchors. Authoring multiplier 1.0×.

---

## Section E — Simulatability Tagging

Wave optics is **the most simulation-friendly subdomain of all physics** alongside optical instruments. Every atomic is high-confidence:

| Category | Sim approach |
|---|---|
| Huygens construction | Animate secondary-wavelet circles → tangent-envelope as new wavefront |
| Wave-theory derivations (reflection, refraction) | Animate plane-wavefronts arriving at boundary, with vτ vs v'τ segments highlighted |
| YDSE (all 6 atomics) | Two-source ripple-tank style, animated path difference + screen intensity plot updating in real time |
| Single-slit (all 4 atomics) | Animate N-secondary-source decomposition + intensity-envelope build-up |
| Polarisation (all 4 atomics) | Animated E-vector wave + polaroid-axis rotation + intensity meter |

**100% high-confidence simulatable.** Diamond #5 candidate.

---

## Section F — V1 priority (deferred to Stage 5)

Per `feedback_v1_priority_deferred_to_stage_5.md`, no V1 queue here. Tentative top candidates if forced today:
- `huygens_principle` — foundational, JEE conceptual question
- `refraction_wave_theory_snells_law` — high JEE-conceptual weight
- `ydse_fringe_width` — most-asked JEE-Main formula
- `single_slit_minima_condition` — JEE-Main + NEET
- `malus_law_polariser_analyzer` — quick win, formula + animation

---

## Section G — Open Questions / Stage-4 Flags

1. **Should `ydse_screen_distance_effect` be ~5 nanos instead of 1 atomic?** It's NCERT Example 10.4 which has 6 sub-parts (D, λ, d, source-distance s, slit-width, white-light). Each sub-part is a distinct teaching unit. Stage 4 may split it.
2. **`double_slit_combined_diffraction_envelope`** — borderline atomic vs nano-under-`ydse_intensity_distribution`. Kept as atomic because the "missing orders when d/a integer" question is a recurring JEE-Adv pattern with its own teaching arc.
3. **Doppler effect for light** — placed in T44 per WO-G6. **Alternative argument**: it could live in T15 Waves (alongside sound Doppler) with cross-link to T44. Stage 4 to decide based on data after T45 catalog.
4. **Polarisation by reflection at Brewster's angle** vs **Polarisation by scattering** — overlap in the "two ways to polarise" teaching. Currently 2 atomics, may be 1 atomic + 2 nanos. Stage 4.
5. **HCV Ch.17 has Fresnel-biprism setup** (alternative interference source) not in NCERT. Currently OMITTED — would be a 29th atomic. Triple-coverage rule says include if DCP also has it (likely does). Flagged.

---

## Section H — Cross-Source Coverage Matrix

| Atomic | NCERT 12.2 Ch.10 | HCV1 Ch.17 | DCP Ch.32 |
|---|:---:|:---:|:---:|
| `wavefront_types` | ✓ §10.2 | ✓ §17.2 | ✓ |
| `huygens_principle` | ✓ §10.2 | ✓ §17.4 | ✓ |
| `reflection_wave_theory` | ✓ §10.3.3 | ✓ §17.5 | ✓ |
| `refraction_wave_theory_snells_law` | ✓ §10.3.1 | ✓ §17.6 | ✓ |
| `doppler_effect_light` | ✓ §10.3.4 | rarely | minimal |
| `superposition_principle_waves` | ✓ §10.4 | ✓ §17.7 | ✓ |
| `coherent_vs_incoherent_sources` | ✓ §10.4 | ✓ §17.7 | ✓ |
| `path_difference_phase_difference` | ✓ §10.4–10.5 | ✓ §17.7–17.8 | ✓ |
| `ydse_setup_geometry` | ✓ §10.5 + Fig 10.12 | ✓ §17.8 | ✓ heavily |
| `ydse_path_difference_formula` | ✓ §10.5 | ✓ §17.8 | ✓ |
| `ydse_fringe_width` | ✓ §10.5 + eq (10.20) | ✓ §17.8 | ✓ heavily |
| `ydse_bright_dark_positions` | ✓ §10.5 | ✓ §17.8 | ✓ |
| `ydse_intensity_distribution` | ✓ §10.4 + eq (10.12) | ✓ §17.9 | ✓ |
| `ydse_with_white_light_central_white` | ✓ Example 10.4(f) | ✓ §17.10 | ✓ |
| `ydse_screen_distance_effect` | ✓ Example 10.4 | ✓ §17.10 | ✓ |
| `single_slit_diffraction_geometry` | ✓ §10.6.1 | ✓ §17.11 | ✓ |
| `single_slit_minima_condition` | ✓ §10.6.1 + eq (10.22) | ✓ §17.11 | ✓ |
| `single_slit_secondary_maxima` | ✓ §10.6.1 | ✓ §17.11 | ✓ |
| `central_max_double_width` | ✓ §10.6.1 + Fig 10.16 | ✓ §17.11 | ✓ |
| `diffraction_vs_interference_distinction` | ✓ §10.6.1 + Feynman quote | partial | ✓ |
| `double_slit_combined_diffraction_envelope` | ✓ §10.6.1 + Fig 10.17 | ✓ §17.11–17.12 | ✓ |
| `fraunhofer_diffraction_circular_aperture` | ✓ §10.6.3 + eq (10.24) | partial | minimal |
| `fresnel_distance_validity_ray_optics` | ✓ §10.6.4 + eq (10.31) | partial | minimal |
| `polarisation_transverse_wave_proof` | ✓ §10.7 | ✓ §17.13 | ✓ |
| `malus_law_polariser_analyzer` | ✓ §10.7 | ✓ §17.13 | ✓ |
| `polaroid_mechanism_dichroism` | ✓ §10.7 | ✓ §17.13 | ✓ |
| `brewsters_law_reflection_polarisation` | ✓ §10.7 | ✓ §17.13 | ✓ |
| `polarisation_by_scattering` | ✓ §10.7 | partial | minimal |

**Triple-coverage rate: ~85%.** Strongest triple-coverage of any topic catalogued so far. **NCERT is the dominant pedagogy source for T44** — its YDSE derivation (eq 10.15–10.20) and diffraction derivation (eq 10.21–10.23) are the most rigorous. HCV reinforces; DCP supplies problem patterns.

---

## Section I — Anti-Plagiarism Probe

- Huygens construction is 350-year-old physics — public domain.
- YDSE diagram is universally standardized (S, S₁, S₂, D, β) — render our own labeled SVG.
- Standard formula set (β = λD/d, I = 4I₀cos²(φ/2), a sinθ = nλ, I = I₀cos²θ, tan iB = n) — no source-specific derivation paths copied.
- Indian anchors (monsoon, CBSE physics-practical, polaroid sunglasses) are our own + NCERT-aligned — none from DCP/HCV.
- Diffraction-envelope animation will be our own primitive composition.
- Feynman quote from NCERT §10.6 is a 60-word fair-use quote with attribution; will quote verbatim from NCERT (which credits Feynman Lectures).

✅ Anti-plagiarism risk: LOW.

---

## Section J — Catalog Sign-off

- Total atomics: **28** (highest of any topic so far — wave optics is genuinely the densest Class 12 chapter)
- Total nanos: ~10
- Anchor strength: **STRONG** (all 19 main atomics have Indian anchors)
- Simulatability: **100% high-confidence** (wave optics + optical instruments are the most simulation-friendly subdomain of all physics)
- Cross-topic edges: ~12 IN (T15, T23, T21, T42, math-tools), ~6 OUT (to T43, T45–T47)
- Source-role triad: NCERT is **dominant pedagogy source** here (atypical — usually HCV) because NCERT Ch.10 is exceptionally well-written. HCV reinforces; DCP provides problem patterns.
- Stage-4 flags: 5 items (YDSE-screen-distance splitting, double-slit-envelope status, Doppler location, polarisation atomic-count, Fresnel biprism inclusion)

**Status: PILOT COMPLETE.** Optics cluster T41–T44 now fully catalogued.
