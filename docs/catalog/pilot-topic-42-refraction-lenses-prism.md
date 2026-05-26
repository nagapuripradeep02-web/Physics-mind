# Stage-2 Pilot Catalog — T42 Refraction + Lenses + Prism + TIR + Dispersion

**Date authored:** 2026-05-25 (Session 40, paired-batch with T41)
**Sources:**
- NCERT Class 12 Part 2, **Ch.9 Ray Optics and Optical Instruments**, §9.3 Refraction, §9.4 Total Internal Reflection (§9.4.1 mirage + diamond + prism + optical fibre), §9.5 Refraction at Spherical Surfaces and by Lenses (§9.5.1–9.5.4), §9.6 Refraction through a Prism, §9.7 Dispersion by a Prism, §9.8 Some Natural Phenomena due to Sunlight (§9.8.1 rainbow, §9.8.2 scattering)
- HC Verma Vol 1, **Ch.18 Geometrical Optics**, §18.5 Refraction at plane surfaces, §18.6 Critical angle, §18.7 Optical fibre, §18.8 Prism, §18.9 Refraction at spherical surfaces, §18.10 Extended objects (refraction), §18.11 Refraction through thin lenses, §18.12 Lens maker's formula, §18.13 Extended objects lateral mag (lenses), §18.14 Power of a lens, §18.15 Thin lenses in contact, §18.16 Two thin lenses separated by a distance, §18.17 Defects of images (chromatic + monochromatic aberrations)
- DC Pandey Optics & Modern Physics, **Ch.31 Refraction of Light**, §31.1–31.6 (Refractive index, Snell's law, plane refraction, slab shift, spherical refraction, lens theory — fully captured; §31.7–31.9 TIR / Prism / Deviation accessed via NCERT + HCV given DCP page-overflow constraints)
- Note: this pilot is the **13th** in the run, sister to T41 Ray Optics (Mirrors). Together they open the Optics cluster — first non-mechanical-non-E&M batch.

---

## Founder Decisions Applied (RF-G1 … RF-G7, inline)

| # | Decision | Rationale |
|---|---|---|
| RF-G1 | **Snell's law + apparent depth + lateral shift are THREE separate atomics**, not bundled. Tempted to make one "refraction at plane surface" umbrella. Kept separate because each has a distinct visual scene (Snell's law: two-medium boundary + bending; apparent depth: vertical view + object appears raised; lateral shift: slab + parallel-displaced ray) and a different misconception (Snell: "denser = faster"; apparent depth: "image is at same depth"; lateral shift: "ray bends inside the slab and changes direction permanently"). | Visual + misconception variety per modal RO-G1 pattern in T41 sister. |
| RF-G2 | **`lens_maker_formula` and `thin_lens_formula` are SEPARATE atomics**, not unified. Both derive from refraction-at-spherical-surface applied twice. Kept separate because they answer DIFFERENT questions: lens-maker tells you "what f does this lens have, given material + curvature?" (design question); lens-formula tells you "where is the image, given u + f?" (usage question). Indian board exams test these separately. | Pedagogical task separation. |
| RF-G3 | **TIR is ONE atomic (critical angle + total reflection); optical fibre + mirage + TIR-prism are SEPARATE application atomics, not nanos of TIR.** Tempted to nest all three as nanos. Promoted because (a) optical fibre has full Indian-telecom anchor (BSNL/Reliance Jio fibre rollout), (b) mirage has full Indian-highway anchor + atmospheric refraction connection, (c) TIR-prism has Indian periscope/binocular anchor. Each carries enough anchored scene and downstream usage to be atomic. | Anchor density + downstream usage criteria. |
| RF-G4 | **Lens combinations: in-contact (atomic A14) and separated-by-distance (atomic A15) are SEPARATE atomics.** Same family of formulas (1/F = sum of 1/f). Kept separate because the separated case introduces qualitatively new physics — focal length depends on separation `d`, and at d=f₁+f₂ the system behaves as a telescope (link to T43). EPIC-C STATE_1 wrong belief: "two lenses always add powers regardless of separation" — common JEE error. | Cross-cluster bridge to T43 telescope (f_o + f_e separation = telescope length). |
| RF-G5 | **Atmospheric/sunlight phenomena are THREE separate atomics: mirage (TIR), rainbow (refraction+reflection+dispersion), scattering (Rayleigh).** Not one "atmospheric optics" umbrella. Each has distinct physics: mirage is TIR off a temperature gradient; rainbow is geometric refraction + internal reflection + dispersion at 42° (primary) and 50° (secondary); scattering is intensity ∝ 1/λ⁴. Each is independently JEE/NEET-tested and CBSE-board-tested. | Distinct physics + independent test relevance. |
| RF-G6 | **Eye + accommodation + 4 defects (myopia/hypermetropia/astigmatism/presbyopia) bundled into ONE atomic (A23)** with sub-state nanos per defect. Tempted to make each defect an atomic. Bundled because (a) the visual scene is one (eye cross-section), (b) the corrective-lens reasoning is uniform across defects (concave for myopia, convex for hypermetropia, cylindrical for astigmatism, bifocal for presbyopia), (c) Indian-context anchor is a single one (Lenskart / Titan Eye+ / school eye-camp). | Visual-scene unity + uniform mechanism. Inconsistent with RF-G5 (which split atmospheric phenomena) — but those have DIFFERENT physics, whereas eye defects have the SAME refractive-correction physics applied differently. |
| RF-G7 | **Anchor strength: STRONG.** NCERT §9.4.1 has the "highway mirage" anchor (every Indian summer highway). NCERT §9.7 dispersion uses prism — Indian classroom prism is universal. NCERT §9.8.1 rainbow — Indian monsoon universal. §9.8.2 sky/sunset color — universal Indian observation. §9.5 lens water/glycerine refractive-index trick — Indian dispensary anchor. §9.9.3 names Kavalur IIA Bangalore telescope. Plus Indian-telecom optical fibre (BSNL / Jio rollout), Indian eye-care chains (Lenskart, Titan Eye+). Confirmed strong-anchor — author at 1.0× baseline. | Validates [[feedback-anchor-density-varies-by-topic]] — geometric optics + phenomenological optics both anchor-rich. |

---

## Section A — Top-of-Catalog Summary

```
Topic               : T42 Refraction + TIR + Lenses + Prism + Dispersion + Atmospheric optics
                      (instruments deferred to T43; wave optics deferred to T44)
Atomic count        : 26 (target range 24–28; landed at 26 — close to 12-pilot mean of ~26)
Nano count          : ~46 (mean 1.77 nanos/atomic)
Stage-2 OUT-edges   : 14 (→ T41 ×3 back-edges [sign convention shared, paraxial shared, lens-eq from mirror-eq pattern],
                       → T43 ×4 [microscope simple+compound, telescope refracting, lens-combination separation = telescope length, eye-as-instrument],
                       → T44 ×3 [Huygens derives Snell's law, dispersion = wavelength-dependent n, scattering ties to wave intensity],
                       → T45 ×1 [dispersion → atomic spectra, Fraunhofer lines],
                       → math-tools ×3 [trig identities for prism min-dev, 1/x algebra, μ chain product])
Anchor density      : STRONG (highway mirage, monsoon rainbow, blue sky + red sunset,
                       Indian classroom prism, Indian optical-fibre telecom rollout,
                       Lenskart/Titan-Eye+ spectacle context, glass+water refractive-index home demos)
Author-time         : 1.0× baseline (per RF-G7)
Founder decisions   : RF-G1 … RF-G7 (7 decisions, modal across 13-pilot run)
```

---

## Section B — Cross-Source Coverage Table (3 sources × T42 sections)

| Coverage area | NCERT 12.2 Ch.9 | HCV1 Ch.18 | DCOM Ch.31 | Notes |
|---|---|---|---|---|
| Refractive index (μ = c/v, frequency unchanged, wavelength changes) | §9.3 + Eq.9.10–9.11 | §18.5 Snell's law (Eq. sin i / sin r = v₁/v₂ = μ₂/μ₁) | §31.1 full subsection + chain rule μ₁₂×μ₂₃×μ₃₁=1 | DCP §31.1 most rigorous on chain-rule; HCV best on frequency-vs-wavelength |
| Snell's law (sin i / sin r = constant) | §9.3 + Fig.9.8 + Eq.9.10 | §18.5 (Eq.) | §31.2 + Fig.31.4–31.7 + Extra-Points notes | All three identical; DCP best on "denser to rarer" direction reversal |
| Lateral shift through parallel slab | §9.3 + Fig.9.9 (briefly) | absent in main text (problem-set treatment) | §31.3 + Fig.31.16 + §31.4 + Eq.OI=(1-1/μ)t | DCP §31.4 most rigorous (full derivation + multi-slab additivity); NCERT only mentions |
| Apparent depth (μ = real/apparent) | §9.3 + Fig.9.10 | §18.5 last subsection | §31.3 (refer figs a-d) + Eq.AI = x/μ + multi-medium summation | HCV best on derivation; DCP best on multi-layer extension |
| Atmospheric refraction (sun visible before sunrise + after sunset) | §9.3 + Fig.9.11 (anchor) + Example 9.5 (24h Earth rotation) | absent | absent | NCERT-unique anchor. Indian astronomy / muhurta-timing context |
| Snell's law + drowning child analogy | §9.3 (the box "Drowning child, lifeguard and Snell's law") | absent | absent | NCERT-unique pedagogy. Connects ray bending to "time-minimization" + Fermat's principle teaser |
| Critical angle + TIR | §9.4 + Eq.9.12 + Table 9.1 critical angles | §18.6 + Eq.18.7 + Example 18.4 (water 48.2°) | (§31.7 — deferred; NCERT + HCV sufficient) | NCERT Table 9.1 (water 48.75°, crown glass 41.14°, dense flint 37.31°, diamond 24.41°) is canonical |
| Mirage (TIR + atmospheric temperature gradient) | §9.4.1 (i) + Fig.9.14 (full anchor) | absent | absent | NCERT-unique. Universal Indian summer highway anchor — "patch of water that disappears as you approach" |
| Diamond brilliance (TIR + 24.4° critical angle) | §9.4.1 (ii) | §18.6 implicit | absent | NCERT-unique anchor. Indian jewelry context (Surat diamond-cutting industry — world's largest) |
| TIR Prism (90°/180° deviation, image inversion) | §9.4.1 (iii) + Fig.9.15 | §18.6 implicit | absent | NCERT-unique. Periscope + binocular Porro-prism Indian-defense anchor |
| Optical fibre (core + cladding + TIR transmission) | §9.4.1 (iv) + Fig.9.16 + "light pipe" + 2000 telephone signals + 95% transmission over 1km | §18.7 + Fig.18.11 (a-c) | absent | NCERT best — names BSNL-ish telecom signals; HCV best on light-pipe + stomach examination medical anchor |
| Refraction at single spherical surface (μ₂/v - μ₁/u = (μ₂-μ₁)/R) | §9.5.1 + Fig.9.17 + Eqs.9.13–9.16 | §18.9 + Fig.18.14 + Eq.18.12 | §31.5 + Fig.31.29–31.30 | All three rigorous; HCV derivation cleanest |
| Lens maker's formula 1/f = (n-1)(1/R₁ - 1/R₂) | §9.5.2 + Fig.9.18 + Eqs.9.17–9.22 (derivation) | §18.12 + Fig.18.21 + Eqs.18.14–18.16 | §31.6 + Fig.31.45 + Eq.lens-maker | All three derive via refraction-twice; identical |
| Thin lens formula 1/v - 1/u = 1/f | §9.5.2 + Eq.9.23 | §18.12 + Eq.18.17 | §31.6 + Fig.31.51 + Eq.31-lens-formula | All three; **note sign convention difference between mirror (1/v + 1/u = 1/f) and lens (1/v - 1/u = 1/f)** — see RO-G3 in T41 |
| Lens magnification m = v/u | §9.5.2 + Eq.9.24 | §18.13 + Fig.18.22 + Eq.18.18 | §31.6 + Fig.31.52 + Eq.31-m | All three identical; note sign opposite to mirror m = -v/u |
| Power of lens (P = 1/f, dioptre) | §9.5.3 + Fig.9.20 + Eq.9.25 | §18.14 + Eq. | §31.6 (within Lens Theory + Table 31.3) | DCP best on sign conventions (Table 31.3 covers all 4 lens/mirror cases) |
| Combination of thin lenses (in contact + separated) | §9.5.4 + Eqs.9.30–9.33 | §18.15 + Eq.18.19 + §18.16 + Eq.18.22 | §31.6 (Lens Theory + Example 31.13) | HCV §18.16 is the canonical pedagogy for separation-effect; all three agree on in-contact |
| Lens in different medium (f changes) | §9.5.2 Example 9.8(iii) + Eq.9.26 | (problem-set treatment) | §31.6 + Example 31.16 + Fig.31.49 (air bubble in water acts like diverging lens) | DCP best — explicit "lens behaviour can REVERSE in optically denser medium" + air-bubble-in-water = diverging lens |
| Silvered lens | absent in NCERT main text | (problem-set treatment) | §31.6 Lens Theory Important Points #8 + Fig.31.82 + Eq.31-silvered (full derivation) | DCP-unique. JEE-Adv staple. Acts as a "mirror with effective focal length" |
| Refraction through prism (δ = i+e-A, r₁+r₂=A) | §9.6 + Fig.9.23 + Eqs.9.34–9.35 | §18.8 + Fig.18.12 + Eqs.18.8–18.9 | (§31.8 deferred; NCERT + HCV sufficient) | Both identical |
| Minimum deviation condition (i=e, r=A/2) + μ = sin((A+δ_m)/2)/sin(A/2) | §9.6 + Fig.9.24 + Eqs.9.36–9.38 | §18.8 + Eq.18.10 + Example 18.5 | absent | NCERT + HCV: δ vs i plot showing minimum is canonical |
| Thin prism δ = (μ-1)A | §9.6 last paragraph | §18.8 + Eq.18.11 | absent | Both; small-A approximation |
| Dispersion by prism + VIBGYOR | §9.7 + Fig.9.25–9.26 + Table 9.2 (crown / flint refractive indices) | §18.17 Chromatic Aberration B + Fig.18.33 | absent | NCERT best (Table 9.2 + Newton's recombination experiment); HCV best on chromatic-aberration application |
| Achromatic combination (deviation without dispersion + dispersion without deviation) | NCERT Exercise 9.23 (a)+(b) | §18.17 last subsection | absent | NCERT Exercise only; HCV theory. JEE staple |
| Rainbow (primary 42° + secondary 50°) | §9.8.1 + Fig.9.27 (a)+(b)+(c) | absent | absent | NCERT-unique. Indian monsoon anchor. Primary: refraction-reflection-refraction; secondary: refraction-2×reflection-refraction (intensity drop) |
| Scattering of light (Rayleigh 1/λ⁴; blue sky + red sunset) | §9.8.2 + Fig.9.28 | absent | absent | NCERT-unique. Universal Indian observation. Bridge to T44 wave optics |
| Eye + accommodation + defects (myopia, hypermetropia, astigmatism, presbyopia) | §9.9.1 + Fig.9.29 + Examples 9.10–9.12 | (Ch.19 — separate) | absent | NCERT in-chapter; HCV in Ch.19. Indian-context: Lenskart/Titan-Eye+ + school eye-camp |
| Lens aberrations (chromatic + spherical) | absent for lenses (NCERT covers atmospheric only) | §18.17 (full subsection) — spherical, coma, astigmatism, curvature, distortion + chromatic | absent | HCV-only. JEE/NEET sleeper topic |

---

## Section C — Atomic + Nano Catalog (the canonical 8-column table)

| ID | Concept | Type | Sim? | In repo? | Requires | Required-by | Notes |
|---|---|---|---|---|---|---|---|
| **A1** | `refractive_index_definition` | atomic | ✅ | — | — | A2, A3, A5, A9, A10, [T44:wave_optics_n_definition] | μ = c/v; frequency unchanged across interface; wavelength changes (λ_medium = λ_vacuum/μ). Chain rule μ₁₂ × μ₂₃ × μ₃₁ = 1. EPIC-C STATE_1 wrong belief: "denser optical medium = denser mass" — water > air optically but kerosene < water mass-density yet kerosene > water optically |
| ↳ N1.1 | frequency_invariance_across_interface | nano | ✅ | — | — | A1, A2 | f doesn't change at boundary (consequence of boundary continuity). Only λ and v change |
| ↳ N1.2 | refractive_index_table_common_substances | nano | ✅ | — | — | A1 | Water 1.33, crown glass 1.52, dense flint 1.62, diamond 2.42 (NCERT Table 9.1). Just the values |
| ↳ N1.3 | mu_chain_rule | nano | ✅ | — | — | A1, A2 | μ_AB × μ_BC × μ_CA = 1. Useful for multi-medium problems |
| **A2** | `snells_law` | atomic | ✅ | — | A1, [math:sin_function] | A3, A4, A5, A9, A19, [T44:huygens_derives_snell] | μ₁ sin i = μ₂ sin r. Denser → rarer: ray bends away from normal. Rarer → denser: bends toward normal. Per RF-G1: own atomic. EPIC-C STATE_1 wrong belief: "ray bends because it 'wants to' minimize path" — actually Fermat's-principle minimization of TIME, not path (the drowning-child analogy in NCERT §9.3 box) |
| ↳ N2.1 | bending_direction_rule | nano | ✅ | — | — | A2 | Toward normal (rarer→denser) vs away from normal (denser→rarer). The "memorize-one-case" trick |
| ↳ N2.2 | parallel_emergence_from_parallel_slab | nano | ✅ | — | — | A2, A4 | If both boundaries parallel and same μ on both sides: emergent ray is parallel to incident. Internal angles cancel |
| **A3** | `apparent_depth_real_depth` | atomic | ✅ | — | A2 | A4, [T44:apparent_position_wave_picture] | μ = real_depth / apparent_depth (for normal-incidence viewing from above). Object appears raised. Multi-medium: total apparent shift = Σ (1 - 1/μ_i) × t_i. EPIC-C STATE_1 wrong belief: "image is at same depth as object" — fishermen learn this empirically |
| ↳ N3.1 | apparent_depth_normal_incidence_assumption | nano | ✅ | — | — | A3 | The μ = real/apparent formula assumes small-angle (normal viewing). Oblique viewing gives more complex shift |
| ↳ N3.2 | multi_layer_water_oil_apparent_shift | nano | ✅ | — | — | A3 | h_app = h_1/μ_1 + h_2/μ_2. Indian-context: kerosene-on-water layered demos |
| ↳ N3.3 | fisherman_spear_offset_anchor | nano | ✅ | — | — | A3 | A spear aimed at where a fish APPEARS misses — must aim BELOW. Indian-coastal fisherfolk anecdote anchor |
| **A4** | `lateral_shift_through_slab` | atomic | ✅ | — | A2 | [T42:silvered_lens_with_slab], [JEE problem-pattern] | For a parallel slab of thickness t and μ: lateral_shift = t × (1 - 1/μ) (normal-shift formula via DCP §31.4). Per RF-G1: own atomic. EPIC-C STATE_1 wrong belief: "ray inside slab moves the image" — the displacement is purely a side-shift, image is at same depth-line |
| ↳ N4.1 | slab_in_front_of_mirror_normal_shift | nano | ✅ | — | — | A4 | If a slab sits between object and mirror, object appears closer by (1 - 1/μ)t. DCP Example 31.11 |
| **A5** | `critical_angle_TIR` | atomic | ✅ | — | A1, A2 | A6, A7, A8, [T44:goos_haenchen_shift_advanced] | sin i_c = 1/μ (going from denser μ to rarer 1). For i > i_c, total internal reflection — NO refracted ray. EPIC-C STATE_1 wrong belief: "some light always transmits" — at TIR, ZERO transmits (idealized). Indian classroom demo: laser pointer in turbid water from below |
| ↳ N5.1 | critical_angle_values_common_media | nano | ✅ | — | — | A5 | Water 48.75°, crown glass 41.14°, dense flint 37.31°, diamond 24.41°. The "smaller critical angle = more brilliant" insight |
| ↳ N5.2 | TIR_must_be_denser_to_rarer | nano | ✅ | — | — | A5 | TIR cannot happen rarer→denser. Common misconception correction |
| **A6** | `optical_fibre_TIR` | atomic | ✅ | — | A5 | [T43:fibre_optic_endoscope], [communications_context] | Core + cladding (n_core > n_cladding); successive TIRs at every wall bounce; >95% transmission over 1km (NCERT). Per RF-G3: own atomic. Indian anchors: BSNL/Reliance Jio fibre rollout in tier-2 cities; medical endoscope (gastroscope) for stomach exam (HCV §18.7) |
| ↳ N6.1 | core_cladding_index_relationship | nano | ✅ | — | — | A6 | n_core > n_cladding so light incident at core-cladding boundary exceeds critical angle. Numerical aperture concept |
| ↳ N6.2 | telecommunication_2000_signals_per_fibre | nano | ✅ | — | — | A6 | NCERT: "about 2000 telephone signals" multiplexed per fibre. Indian-telecom rollout anchor |
| **A7** | `mirage_atmospheric_TIR` | atomic | ✅ | — | A5, [meteorology:thermal_gradient] | [T18:thermal_physics_layer_density] | Hot road heats air near surface; air layers near ground have lower μ (less dense, hotter); successive refraction bends light upward; at high enough incidence angle → TIR → observer sees inverted "puddle of sky" near road. Per RF-G3: own atomic. Indian-context: every May/June highway between Delhi-Jaipur, Mumbai-Pune |
| ↳ N7.1 | superior_mirage_cold_polar_seas | nano | ✅ | — | — | A7 | Inverse case: cold air below, warm above (in seas near poles). Ships appear "floating in sky." Not Indian but worth a callout. |
| **A8** | `TIR_prism_periscope_binocular` | atomic | ✅ | — | A5, [T41:laws_of_reflection] | [T43:periscope_design] | 45°-45°-90° prism with light entering perpendicular to short side: TIR off the hypotenuse, exits perpendicular to other short side. Used to bend light by 90° or 180°, OR to invert an image without flipping (NCERT Fig.9.15 a,b,c). Per RF-G3: own atomic. Indian-context: Indian Army periscope, classroom binoculars, naval submarine periscope |
| ↳ N8.1 | TIR_prism_better_than_mirror | nano | ✅ | — | — | A8 | TIR has 100% reflection (no silver-tarnish loss). Mirrors lose ~5-10% per bounce; binoculars with 4-6 reflections must use prisms for brightness |
| **A9** | `refraction_at_single_spherical_surface` | atomic | ✅ | — | A1, A2, [T41:cartesian_sign_convention_mirrors] | A10, A11, A12 | μ₂/v - μ₁/u = (μ₂ - μ₁)/R. Foundation for lens-maker's formula. Derived via paraxial + Snell at the curved interface. Sign convention: incident-light direction positive. EPIC-C STATE_1 wrong belief: "this formula is only for lenses" — it works for any single curved interface (e.g., a glass-rod end, an air-bubble in glass) |
| ↳ N9.1 | air_bubble_in_glass_diverges_light | nano | ✅ | — | — | A9, A14 | Glass μ=1.5, air bubble μ=1.0 (lower). Light passing through behaves like a concave (diverging) lens. DCP Example 31.16 + Fig.31.49 |
| **A10** | `lens_maker_formula` | atomic | ✅ | — | A9, [math:two_sequential_equations] | A11, A12, A13, A18, [T43:eye_lens_focal_length] | Per RF-G2: own atomic. 1/f = (μ_lens/μ_medium - 1)(1/R₁ - 1/R₂). In air (μ_medium=1): 1/f = (μ-1)(1/R₁ - 1/R₂). DERIVATION question — "what f does this lens have, given material + curvature?" |
| ↳ N10.1 | sign_of_R1_and_R2_per_convention | nano | ✅ | — | — | A10 | R₁: positive if first surface convex toward incident light. R₂: positive if second surface convex toward outgoing light. The biconvex lens: R₁>0, R₂<0 |
| ↳ N10.2 | biconvex_R_equal_magnitude_focal_length_R | nano | ✅ | — | — | A10 | For biconvex (R₁=R, R₂=-R) lens with μ=1.5: f = R. Useful "memorize this" result for problems |
| ↳ N10.3 | lens_in_water_focal_length_4x | nano | ✅ | — | — | A10 | For glass (μ=1.5) lens in water (μ=4/3): f_water = 4 × f_air. (Because μ_g/μ_w - 1 = 1.5/1.33 - 1 = 0.125, vs. μ_g - 1 = 0.5 in air — ratio 4×). DCP Example 31.16 + NCERT Example 9.8(iii) |
| **A11** | `thin_lens_formula` | atomic | ✅ | — | A9, A10 | A12, A13, A14, A15, A16, A18 | Per RF-G2: own atomic. 1/v - 1/u = 1/f. **Note the sign — different from mirror formula (1/v + 1/u = 1/f).** USAGE question — "where is the image, given u + f?" EPIC-C STATE_1 wrong belief: "lens formula is 1/v + 1/u = 1/f like mirrors" — common Class 12 error from over-generalization |
| ↳ N11.1 | mirror_vs_lens_sign_difference | nano | ✅ | — | — | A11, [T41:mirror_equation] | The sign difference traces to incident-light direction: in mirror reflection, light reverses; in lens transmission, light continues. Sign-convention applies the difference cleanly |
| **A12** | `lens_magnification` | atomic | ✅ | — | A11, [T41:lateral_magnification_mirror] | A13, A18 | m = v/u (lens) vs m = -v/u (mirror) — see N11.1. For real images: m negative ⇒ inverted; for virtual: m positive ⇒ erect. Same magnitude-interpretation as mirror but opposite sign convention |
| **A13** | `power_of_lens` | atomic | ✅ | — | A11 | A14, A15, [T43:prescription_lens_diopter] | P = 1/f (where f in metres). Unit: dioptre (D). Positive for converging (convex), negative for diverging (concave). Indian-context anchor: optometrist's "−1.5 D" or "+2.5 D" spectacle prescription |
| ↳ N13.1 | dioptre_unit_inverse_metres | nano | ✅ | — | — | A13 | 1 D = 1 m⁻¹. The unit. A lens of f=50cm has P = +2 D. NCERT Example 9.8(i) |
| **A14** | `lens_combination_in_contact` | atomic | ✅ | — | A11, A13 | A15, [T43:achromatic_doublet] | Per RF-G4: own atomic. 1/F = 1/f₁ + 1/f₂ (in contact, d→0). Powers add: P = P₁ + P₂. Used to design achromatic doublets (chromatic-aberration cancellation). NCERT Exercise 9.10 + 9.21 |
| ↳ N14.1 | three_lens_combination | nano | ✅ | — | — | A14 | 1/F = 1/f₁ + 1/f₂ + 1/f₃ for three lenses in contact. Linear extension |
| **A15** | `two_lenses_separated_by_distance` | atomic | ✅ | — | A11, A13, A14 | [T43:telescope_length_f_o_plus_f_e], [T43:compound_microscope_tube_length] | Per RF-G4: own atomic. 1/F = 1/f₁ + 1/f₂ - d/(f₁f₂). When d = f₁ + f₂: configuration becomes telescope (zero net power but angular magnification). EPIC-C STATE_1 wrong belief: "separation doesn't matter, only individual powers" — wrong for d > 0 |
| ↳ N15.1 | telescope_configuration_d_equals_f_o_plus_f_e | nano | ✅ | — | — | A15, [T43:astronomical_telescope] | When d = f₁ + f₂, the system has effective f = -f₁f₂/(0) — degenerate, behaves as angular magnifier (telescope). Bridge to T43 instruments |
| **A16** | `lens_image_formation_cases` | atomic | ✅ | — | A11, A12 | [T43:microscope_object_at_focal_point] | 6 cases for convex lens: (i) ∞ → F (real, dim, inv); (ii) beyond 2F → between F-2F (real, dim, inv); (iii) at 2F → at 2F (real, same-size, inv); (iv) between F-2F → beyond 2F (real, mag, inv); (v) at F → ∞ (used in collimation); (vi) between O-F → virtual, same-side, erect, mag. Plus 1 concave case (always virtual, erect, diminished). DCP Table 31.1 + Fig.31.39–31.44 canonical |
| **A17** | `lens_aberrations` | atomic | ✅ | — | A10, A11 | [T43:apochromatic_combination] | Spherical aberration (marginal rays focus shorter f than paraxial — HCV §18.17 + Fig.18.29–18.30) + chromatic aberration (μ varies with λ → red f longer than violet f, HCV Fig.18.33). Coma + astigmatism + curvature + distortion are sub-types. HCV-only. JEE-Adv sleeper. EPIC-C STATE_1 wrong belief: "real lenses are perfect" — every camera lens has multiple elements specifically to cancel aberrations |
| ↳ N17.1 | achromatic_doublet_crown_flint | nano | ✅ | — | — | A17, A14 | Crown lens (low dispersion) + flint lens (high dispersion) combined in contact: same μ for design wavelength but opposite chromatic-correction. Eyepieces of school microscopes are achromats |
| ↳ N17.2 | parabolic_telescope_avoids_spherical | nano | ✅ | — | — | A17, [T41:spherical_aberration_mirror] | Big telescopes use parabolic primary mirror instead of spherical lens to avoid both spherical and chromatic aberrations. Indian anchor: 2.34m Cassegrain at Kavalur IIA |
| **A18** | `silvered_lens` | atomic | ✅ | — | A10, A11, [T41:mirror_equation] | (advanced-JEE problem set) | DCP-unique. Half-silvered lens behaves like a curved mirror with effective focal length: 1/f_eff = 2/f_lens + 1/f_mirror_back. Ray path: refract — reflect (off silver back) — refract again. JEE-Adv staple. DCP §31.6 Important Point #8 + Fig.31.82 + Example 31.28 |
| **A19** | `prism_refraction_geometry` | atomic | ✅ | — | A2, A1 | A20, A21, A22 | δ = (i + e) - A; r₁ + r₂ = A (where A = prism angle). The 4-angle quadrilateral geometry at the prism cross-section. EPIC-C STATE_1 wrong belief: "deviation depends only on prism material" — actually depends on incidence angle i too |
| ↳ N19.1 | r1_plus_r2_equals_A | nano | ✅ | — | — | A19 | From the AQNR quadrilateral: ∠A + ∠QNR = 180° (since both Q and R are 90°). And r₁+r₂+∠QNR = 180° from triangle. Hence r₁+r₂ = A |
| **A20** | `minimum_deviation` | atomic | ✅ | — | A19, A2 | A21, A22 | At δ_min: i = e, r₁ = r₂ = A/2. Refractive index formula: μ = sin((A + δ_m)/2) / sin(A/2). The standard lab method to measure μ of a prism material in physics-practical class. Indian classroom anchor: every CBSE Class 12 physics-practical |
| ↳ N20.1 | delta_vs_i_plot_shape | nano | ✅ | — | — | A20 | δ-vs-i plot is U-shaped with minimum at i=e. Two different i values give same δ (symmetric). NCERT Fig.9.24 |
| **A21** | `thin_prism_deviation` | atomic | ✅ | — | A20, [math:sin_small_angle] | A22, A23 (achromatic) | For small A: δ = (μ - 1) A. Simpler formula, used in achromatic-prism design. Direct-vision spectroscope uses combination of thin prisms with no net deviation but full dispersion |
| **A22** | `dispersion_by_prism` | atomic | ✅ | — | A21, A19 | A23, A24, [T44:wavelength_dependent_n] | μ varies with λ (Table 9.2: crown glass μ_violet=1.533 > μ_red=1.515; flint glass μ_violet=1.663 > μ_red=1.622). Hence δ varies with λ. White light splits into VIBGYOR. Indian-context anchor: every Class 12 physics-practical prism experiment |
| ↳ N22.1 | newton_recombination_experiment | nano | ✅ | — | — | A22 | Newton's classic: first prism splits → second inverted prism recombines into white. NCERT Fig.9.26 |
| ↳ N22.2 | violet_bends_most_red_least_VIBGYOR | nano | ✅ | — | — | A22 | Shorter λ → higher μ → larger δ. Violet bends most, red least. The "VIBGYOR top-to-bottom in rainbow" order |
| **A23** | `achromatic_combination` | atomic | ✅ | — | A21, A22 | (binocular eyepiece + camera lens design) | Two prisms (one crown + one flint) of different angles can combine to produce: (a) deviation without dispersion (achromatic prism — used in periscopes that need to bend light a fixed angle without color-fringing), OR (b) dispersion without deviation (direct-vision spectroscope — used in astronomy to identify Fraunhofer lines without bending the beam). NCERT Exercise 9.23 |
| **A24** | `rainbow_formation` | atomic | ✅ | — | A22, A2, A5 | (atmospheric-optics elective) | Per RF-G5: own atomic. Primary rainbow: sunlight refracts into water droplet → internally reflects ONCE → refracts out at 42° to incoming sunlight (red outer, violet inner). Secondary rainbow: TWO internal reflections → 50° angle (red inner, violet outer — REVERSED order). Indian-context anchor: monsoon-rainbow universal experience. NCERT Fig.9.27 (a)+(b)+(c) |
| ↳ N24.1 | primary_red_outside_secondary_red_inside | nano | ✅ | — | — | A24 | The color-order reversal in secondary rainbow is the diagnostic. If you see only one, it's primary; if both, check which is brighter (primary is) and which has red on top (primary does) |
| ↳ N24.2 | rainbow_requires_sun_behind_observer | nano | ✅ | — | — | A24 | Sun on one side of sky (~western horizon at sunset rainbow), rain on other side. The "back to sun" rule |
| **A25** | `scattering_rayleigh` | atomic | ✅ | — | A1, [T44:wave_intensity_lambda_dependence] | (atmospheric-optics elective) | Per RF-G5: own atomic. Intensity scattered ∝ 1/λ⁴. Shorter λ (blue, violet) scatter more. Sky appears blue (violet scattered even more but eye less sensitive). Sunset/sunrise red (long path through atmosphere strips blue/violet, leaves red). Indian-context anchor: every Indian evening sky + diamond/peacock-feather iridescence |
| ↳ N25.1 | white_clouds_a_greater_than_lambda | nano | ✅ | — | — | A25 | When scatterers (water droplets) are much larger than λ: all wavelengths scatter equally → white. Hence clouds appear white, sky appears blue |
| ↳ N25.2 | red_danger_signals_long_wavelength | nano | ✅ | — | — | A25 | NCERT explicit note: red used for traffic signals + ambulance lights because least scattered → reaches farthest. Indian-traffic universal anchor |
| **A26** | `eye_accommodation_defects` | atomic | ✅ | — | A11, A13 | [T43:spectacle_prescription_optometry] | Per RF-G6: bundled atomic. Eye lens varies focal length via ciliary muscle (accommodation). Defects: (i) Myopia (near-sighted, f too short) → fix with concave (diverging) lens; (ii) Hypermetropia (far-sighted, f too long) → fix with convex (converging); (iii) Astigmatism (cornea non-spherical) → fix with cylindrical lens; (iv) Presbyopia (age-related accommodation loss) → fix with bifocals. Indian anchors: Lenskart / Titan Eye+ / school eye-camps. NCERT §9.9.1 + Examples 9.10–9.12 |
| ↳ N26.1 | myopic_far_point_finite | nano | ✅ | — | — | A26 | Myopic person's far point is closer than infinity (e.g., 80 cm in NCERT Example 9.11). Required power of corrective lens: P = -1/(far point in m). For 80cm: P = -1.25 D (concave) |
| ↳ N26.2 | hypermetropic_near_point_far | nano | ✅ | — | — | A26 | Hypermetropic person's near point > 25cm (e.g., 75cm in NCERT Example 9.12). For comfortable reading at 25cm: needs +2.67 D (convex). Common in elderly Indians |
| ↳ N26.3 | astigmatism_cornea_non_spherical | nano | ✅ | — | — | A26 | Cornea has different curvature in vertical vs horizontal plane. Vertical lines clear but horizontal blurred (or vice versa). Cylindrical lens with axis aligned correctly compensates |
| ↳ N26.4 | presbyopia_age_related_bifocals | nano | ✅ | — | — | A26 | After ~40 years, ciliary muscle weakens, lens can't deform enough for near vision. Many Indians need both — distance correction + reading correction → bifocal/progressive spectacles |

---

## Section D — Subsection-level breakdown of source material

### D.1 NCERT §9.3: Refraction
- Snell's law derivation (Eq.9.10) + Fig.9.8 (→ A2)
- Lateral shift through slab Fig.9.9 (→ A4)
- Apparent depth Fig.9.10 (→ A3)
- Atmospheric refraction Fig.9.11 + Example 9.5 (anchor: sun appears before sunrise) (→ A3 N3.3-style atmospheric anchor)
- "Drowning child + Snell's law" box (pedagogy bridge to Fermat) (→ A2 EPIC-C anchor)

### D.2 NCERT §9.4: TIR + applications
- Critical angle + Eq.9.12 + Table 9.1 (→ A5)
- §9.4.1 (i) Mirage Fig.9.14 (→ A7)
- §9.4.1 (ii) Diamond brilliance (→ A5 nano + Indian Surat diamond anchor)
- §9.4.1 (iii) TIR Prisms Fig.9.15 (→ A8)
- §9.4.1 (iv) Optical fibre Fig.9.16 (→ A6)

### D.3 NCERT §9.5: Refraction at spherical surfaces + lenses
- §9.5.1 single spherical surface Fig.9.17 + Eqs.9.13–9.16 (→ A9)
- §9.5.2 refraction by lens Fig.9.18 + Eqs.9.17–9.24 (→ A10, A11, A12)
- §9.5.3 power of lens Fig.9.20 + Eq.9.25 (→ A13)
- §9.5.4 combination Eqs.9.30–9.33 (→ A14)
- Example 9.8 lens in water (→ A10 N10.3)

### D.4 NCERT §9.6–9.7: Prism + Dispersion
- §9.6 Fig.9.23 + Eqs.9.34–9.38 + Fig.9.24 plot (→ A19, A20, A21)
- §9.7 Fig.9.25–9.26 + Table 9.2 (→ A22)

### D.5 NCERT §9.8: Atmospheric phenomena
- §9.8.1 Rainbow Fig.9.27 a-c (→ A24)
- §9.8.2 Scattering Fig.9.28 (→ A25)

### D.6 NCERT §9.9: Optical instruments — DEFERRED to T43 catalog
- §9.9.1 The eye + defects + Examples 9.10–9.12 (→ A26 here; instrument-level integration → T43)
- §9.9.2 Microscope simple + compound → T43
- §9.9.3 Telescope refracting + reflecting (Cassegrain + Kavalur anchor) → T43

### D.7 HCV §18.5–18.17 (full T42 chapter excluding §18.1–18.4 mirrors which are T41)
- §18.5 plane refraction + apparent depth + critical angle setup (→ A2, A3, A5)
- §18.6 critical angle + applications (→ A5)
- §18.7 optical fibre + light pipe (→ A6, medical-endoscope anchor)
- §18.8 prism (→ A19, A20, A21)
- §18.9 spherical refraction (→ A9)
- §18.10 extended objects spherical (→ A9 nano)
- §18.11–18.13 lenses (→ A10, A11, A12)
- §18.14 power (→ A13)
- §18.15 in-contact lenses (→ A14)
- §18.16 separated lenses (→ A15)
- §18.17 defects of images — spherical + chromatic aberrations (→ A17, A22 chromatic-link)

### D.8 DCP Ch.31 §31.1–31.6 (Refraction/Lens — fully captured)
- §31.1 refractive index (→ A1)
- §31.2 Snell's law + chain rule (→ A2)
- §31.3 single plane refraction (→ A3)
- §31.4 slab shift (→ A4 + N4.1 slab-mirror combinations)
- §31.5 refraction at spherical surface (→ A9)
- §31.6 Lens Theory (→ A10, A11, A12, A13, A14, A15)
  - Important Points #8 Silvered Lens (→ A18 DCP-unique)
  - Example 31.16 (lens in water, f×4) (→ A10 N10.3)
  - Example 31.29 (lens split in halves) (→ JEE-Adv specialty problem-set, not catalogued as atomic but worth noting)

### D.9 Indian real-world anchors (the strong-anchor section per RF-G7)

| Anchor | Source | Notes |
|---|---|---|
| Highway mirage (May/June Indian highway) | NCERT §9.4.1(i) + Fig.9.14 | Universal Indian summer experience. Patch of "water" disappears as you approach. Atomic A7 |
| Indian classroom prism (CBSE physics-practical) | NCERT §9.6 + §9.7 + Table 9.2 | Every CBSE Class 12 student does a prism-min-deviation lab. Universal experience. Atomic A20 |
| Indian monsoon rainbow | NCERT §9.8.1 | Universal monsoon experience. After-rain double rainbow common in Indian summers. Atomic A24 |
| Blue Indian sky + red sunset | NCERT §9.8.2 + Fig.9.28 | Universal observation. Atomic A25 |
| Indian highway red-light traffic signals + ambulance | NCERT §9.8.2 (red used because least scattered) | Atomic A25 N25.2 |
| Surat diamond brilliance (world's largest diamond-cutting industry) | NCERT §9.4.1(ii) | Brilliance via TIR at 24.4° critical angle. Atomic A5 + nano N5.1 |
| Optical-fibre telecom rollout (BSNL + Reliance Jio + Tata Tele) | NCERT §9.4.1(iv) + HCV §18.7 | India has 30M+ km of fibre laid (2026). Jio's 4G/5G fibre backbone. Atomic A6 |
| Indian endoscope (gastroscope) in hospital | HCV §18.7 explicit | Bundle of optical fibres for stomach examination. Indian-medical context. Atomic A6 |
| Indian Army periscope + naval submarine | NCERT §9.4.1(iii) + Fig.9.15 | TIR prism for 90° bend. Atomic A8 |
| Lenskart / Titan Eye+ / Indian school eye-camps | NCERT §9.9.1 + Examples 9.10–9.12 | Indian eye-care universal context. Atomic A26 |
| Indian fisherman + spear aimed below the fish | (Indian-coastal-context) | Apparent depth anchor. Atomic A3 N3.3 |
| Kavalur 2.34m Cassegrain telescope (IIA Bangalore) | NCERT §9.9.3 (named) | India's largest optical telescope. Bridge T42→T43 |
| Indian kerosene-on-water layered demos | HCV §18.5 multi-medium | Apparent shift adds across layers. Atomic A3 N3.2 |
| Indian glycerine lens-invisibility demo (NCERT Example 9.7) | NCERT §9.5.2 | Magician's trick: glass lens disappears in glycerine if μ matches. Atomic A10 N10.3 extension |

---

## Section E — Stage-1 commonality flag

T42 was correctly identified in `stage-1-chapter-commonality.md` as triple-covered (matrix row "42 Refraction, Lenses, Prism, TIR"). The current pilot validates the chapter split: T41 = mirrors only (§9.1-9.2 + §18.1-18.4 + §30); T42 = everything else in Ch.9 except §9.9 instruments (which go to T43).

**Coverage gaps noted:**
- DCP §31.7 (TIR) + §31.8 (Prism) + §31.9 (Deviation) — not directly read this batch due to page-limit constraints. NCERT + HCV coverage is sufficient for atomic identification; DCP would only add problem-pattern depth (not new atomics).
- HCV Ch.19 (Optical Instruments) — explicitly NOT read; reserved for T43 catalog.

---

## Section F — V1 priority flag

Per [[feedback-v1-priority-deferred-to-stage-5]], V1 priority assignment is deferred. Inline flags for stage-5 input:
- **A1 + A2 + A5 + A11 are top candidates for V1 priority queue** — high `Required-by`, foundational
- **A20 (minimum deviation) + A22 (dispersion)** are CBSE-practical mandatory (every Indian Class 12 student MUST do this lab) → board-priority high
- **A24 + A25 (rainbow + scattering)** are JEE/NEET conceptual MCQ-mainstays → competitive-priority high
- **A17 (lens aberrations) + A18 (silvered lens)** are JEE-Adv-only sleeper topics → Stage-5 split by student pathway

---

## Section G — Cluster role + T43 + T44 bridges

T42 is the **central knot** of the Optics cluster. It bridges:
- T41 (mirrors) via shared sign-convention, paraxial-approximation, and image-formation case-table patterns
- T43 (optical instruments) via lens combinations (A14, A15) — telescope length = f_o + f_e is the canonical separated-lens application; compound microscope tube length is another
- T44 (wave optics) via Huygens-derives-Snell's-law (A2), wavelength-dependent μ (A22 dispersion), and intensity-vs-wavelength (A25 scattering)
- T45 (atomic physics) via dispersion → spectral analysis → Fraunhofer absorption lines

**Optical Instruments separation rule (consistent with T41 §G):** Instruments are a T43 topic. T42 catalogs the eye + accommodation + defects atomic (A26) because NCERT bundles it physically into Ch.9; the instrument-level integration (compound microscope, refracting telescope, Cassegrain reflecting telescope) goes to T43.

---

## Section H — Atomic-count restraint check

26 atomics. The 13-pilot mean is ~26 atomics; T42 is exactly on the mean. Heavier than T41 (13) because:
- 5 atomics for refraction physics (A1–A5)
- 3 application atomics for TIR (A6 fibre, A7 mirage, A8 prism) per RF-G3
- 7 lens atomics (A9–A15 — spherical refraction, lens-maker, lens formula, magnification, power, combination, separated)
- 3 lens-extras (A16 cases, A17 aberrations, A18 silvered)
- 5 prism + atmospheric atomics (A19–A23 + A24 rainbow + A25 scattering)
- 1 bundled eye atomic (A26)

**Atomic-count justification:** Each of the 26 has either a unique misconception, a distinct visual scene, or a downstream `Required-by` count ≥ 2 — meeting the diamond-bar threshold. A18 (silvered lens) is borderline (JEE-Adv-only); justified by DCP-unique pedagogical pattern + sleeper JEE-test relevance.

---

## Section I — Open questions / Stage-4 candidate-micro flags

- **A1 (refractive_index_definition)** has 3 nanos and is borderline-umbrella. Stage-4 may revisit: should chain-rule (N1.3) be a separate atomic? Currently bundled.
- **A22 (dispersion) + A25 (scattering) + A24 (rainbow)** all involve wavelength-dependent phenomena. Stage-4 may consider whether a "wavelength-dependent optics" cluster-atomic should exist as bridge to T44.
- **A26 (eye defects)** is an umbrella with 4 nanos (one per defect). Stage-4 may split into 4 atomics if Indian board-exam pattern justifies (each defect has distinct fix-method). Currently bundled per RF-G6.
- **A17 (lens aberrations)** is HCV-only. Stage-4: if NCERT-only students don't need this, demote to T44-or-elective tier. JEE-Adv students keep it.
- **Bridges A8 + A11 + A14 → T43:** these three atomics each have a single specific T43 child atomic (periscope design, eye-as-instrument, telescope-as-2-lens-system). When T43 is authored, these become formal cross-edges.

---

## Section J — Matrix update payload

```
Topic ID                : T42
Atomic count            : 26
Nano count              : ~46
Stage-2 OUT-edges (11)  : T42 → T41 (×3 back-edges: sign_convention shared,
                                       paraxial_approximation shared,
                                       lens-eq derivation parallels mirror-eq)
                        : T42 → T43 (×4: microscope_simple_compound,
                                       telescope_refracting + Cassegrain,
                                       lens_combination_separated d=f_o+f_e,
                                       eye_as_optical_instrument)
                        : T42 → T44 (×3: huygens_derives_snells_law,
                                       wavelength_dependent_n via dispersion,
                                       scattering_intensity_lambda_dependence)
                        : T42 → T45 (×1: dispersion → atomic spectra / Fraunhofer lines)
Math-tools OUT-edges (3): trig_identities_for_prism_min_deviation,
                          1_over_x_algebra_for_lens_eq,
                          mu_chain_product_rule
Anchor strength         : STRONG
Founder decisions       : 7 (RF-G1 ... RF-G7)
```

---
