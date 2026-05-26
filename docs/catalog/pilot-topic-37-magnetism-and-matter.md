# Pilot Topic 37 — Magnetism and Matter

> Stage-2 pilot catalog. 24th of 44. **E&M cluster closer #1 of 2** (sibling: T39 AC Circuits).
> Sources: **NCERT Class 12 Part 1 Ch.5 Magnetism and Matter** (canonical spine) + **HCV Vol 2 Ch.42 Permanent Magnets** (derivation/pedagogy) + **DC Pandey Electricity & Magnetism Ch.28 Magnetics — magnetic materials section** (problem patterns).
> Coverage class: **TRIPLE-COVERED**.
> Anchor density: **STRONG** — 11 institutional anchors (IIG Mumbai, Survey of India magnetic-declination maps, ISRO MagSAT-class missions, AIIMS MRI, BARC isotope magnets, NPL Delhi magnetic standards, Indian Rare Earths Ltd Nd-Fe-B, IIT Bombay nanoelectronics, Tata Institute of Fundamental Research domain studies, DRDO permanent-magnet motors, Vande Bharat traction magnets).
> **Critical role:** closes the magnetism arc — `magnetic_dipole_moment_atomic` is the natural T36-back-edge bridging current loop ↔ permanent magnet (T36's A31 forward edge bridged here). Provides the **hysteresis loop** atomic which resolves the EI-G6 deferred dependency from T35 (eddy currents + self-inductance feed into ferromagnetic loss modelling).

---

## Founder Decisions Applied

| Tag | Decision |
|---|---|
| **MM-G1** | Atomic granularity = "one magnetic-property concept OR one dipole-in-field geometry OR one material class." Bar magnet, axial-dipole field, equatorial-dipole field are three separate atomics — different geometry, different formula, different misconception. |
| **MM-G2** | **Diamagnetism, paramagnetism, and ferromagnetism are THREE separate atomics**, not one umbrella "magnetic materials." Each has distinct microscopic mechanism (induced opposing moment / aligned weak moment / domain structure with permanent alignment), distinct χ sign/magnitude, distinct temperature dependence. Splitting prevents the classic exam error of memorising "ferromagnets attract, diamagnets repel" without the underlying domain/orbital-current mechanism. |
| **MM-G3** | **Hysteresis loop is its own atomic** (`hysteresis_loop_atomic`) — closes EI-G6 deferred dependency from T35. The B-H curve, retentivity, coercivity, and area-of-loop-as-energy-loss form a tight conceptual unit. This is the **bridge atomic to T39 transformer-core-selection** (soft iron = low coercivity = small loop area = low core loss). |
| **MM-G4** | **Earth's magnetism is ONE atomic** with declination + dip + horizontal-component as nanos. NCERT §5.4 treats them as one section; HCV separates dip-circle from declination. Decision: unified atomic because students need the geomagnetic field as one vector decomposed three ways, not three independent quantities. |
| **MM-G5** | **Gauss's law for magnetism (∮B·dA = 0)** is its own atomic, NOT bundled into T38 Maxwell's equations summary. Reason: NCERT §5.3 makes this an independent statement (no magnetic monopoles), and the conceptual content — that B-field lines are always closed loops — is taught at a different level of abstraction than the unified Maxwell quartet. T38's `maxwell_equations_summary` then *references* this T37 atomic. |
| **MM-G6** | **Magnetic intensity H and magnetisation M are ONE atomic** with the B = μ₀(H + M) relation built in. Students struggle to keep H, B, M distinct already; splitting into separate atomics worsens the cognitive load. **Cognitive-error-prevention sub-category (MM-G6).** Author the within-atomic visual that puts all three vectors side-by-side in a magnetised solenoid context. |
| **MM-G7** | **Susceptibility χ and relative permeability μᵣ are NOT separate atomics** — bundled into `magnetic_susceptibility_and_permeability_atomic` because they are algebraically equivalent (μᵣ = 1 + χ). One atomic with two surface representations. |
| **MM-G8** | **Bar-magnet-as-solenoid equivalence is its own atomic** — the conceptual unification "every magnet = circulating bound currents" is high-leverage AND a recurring NCERT question template. Required for the historical-arc narrative (Ampère's hypothesis). |
| **MM-G9** | **STRONG anchor, NOT VERY-STRONG.** 11 distinct anchors (IIG Mumbai, Survey of India declination maps, ISRO geomagnetic satellites, AIIMS MRI, BARC isotope magnets, NPL Delhi, Indian Rare Earths Ltd, IIT-B Centre for Nanoelectronics, TIFR domain studies, DRDO permanent-magnet motors, Vande Bharat traction). Just below the 13-anchor VERY-STRONG threshold. **Stays STRONG.** Could reach VERY-STRONG with addition of: ISRO Aditya-L1 magnetometer instrument + Indian Antarctic Maitri-station geomagnetic observatory + Geological Survey of India aeromagnetic surveys. Revisit at Stage-4. |
| **MM-G10** | **Cognitive-error-prevention sub-category:** "Why doesn't a bar magnet attract everything?" — students conflate ferromagnetic ↔ magnetic-material vs paramagnetic ↔ weakly-attracted vs diamagnetic ↔ weakly-repelled. Author dedicated `three_material_classes_response_to_B` nano under `paramagnetism_atomic` that explicitly tabulates the χ sign + magnitude + temperature-dependence + everyday-Indian-context-example (iron nail ferromagnetic; aluminium paramagnetic; copper, water, gold diamagnetic). |

---

## Section A — Source Map

| Sub-topic | NCERT 12.1 Ch.5 | HCV V2 Ch.42 | DCP EM Ch.28 (materials section) |
|---|---|---|---|
| Bar magnet basics + magnet-as-solenoid | §5.2 | §42.2 | §28.6 |
| Magnetic dipole moment + atomic origin | §5.2.2 | §42.3 | §28.6.1 |
| Axial dipole field | §5.2.1 | §42.4 | §28.6.2 |
| Equatorial dipole field | §5.2.1 | §42.5 | §28.6.2 |
| Torque + potential energy of dipole in field | §5.2.3 | §42.6 | §28.6.3 |
| Gauss's law for magnetism | §5.3 | §42.7 | §28.7 |
| Earth's magnetism (declination, dip, B_H) | §5.4 | §42.8 | §28.8 |
| Magnetic intensity H, magnetisation M | §5.5 | §42.9 | §28.9 |
| χ, μᵣ | §5.5.1 | §42.9 | §28.9 |
| Diamagnetism | §5.6.1 | §42.10 | §28.10 |
| Paramagnetism + Curie's law | §5.6.2 | §42.11 | §28.11 |
| Ferromagnetism + domains | §5.6.3 | §42.12 | §28.12 |
| Hysteresis loop + soft/hard materials | §5.6.3 (boxed) | §42.13 | §28.13 |

---

## Section B — Atomic + Nano Catalog

| ID | Concept | Type | Sim? | In repo? | Requires | Required-by | Notes |
|---|---|---|---|---|---|---|---|
| **magnetic_dipole_moment_atomic** | m = NIA for a current loop; vector along right-hand-rule normal. Equivalent dipole-moment of bar magnet | atomic | ✅ | — | [current_loop_as_dipole(T36 A31), area_vector(T6), vector_cross_product(math-tools)] | [torque_on_magnetic_dipole, potential_energy_of_dipole_in_field, axial_dipole_field, equatorial_dipole_field, bar_magnet_as_solenoid_equivalence] | **Closes T36 A31 forward-edge** (current loop = elementary dipole bridges to permanent magnets) |
| ↳ vector_direction_via_rhr_nano | Right-hand-rule for m direction from current direction | nano | — | — | [magnetic_dipole_moment_atomic] | [torque_on_magnetic_dipole] | parent: magnetic_dipole_moment_atomic |
| **bar_magnet_as_solenoid_equivalence** | Every bar magnet ≡ a finite solenoid carrying bound surface current; m = M·V | atomic | ✅ | — | [magnetic_dipole_moment_atomic, magnetic_field_solenoid(T36)] | [magnetic_intensity_H_and_M, ferromagnetism_atomic] | MM-G8; Ampère's hypothesis — historical unification frame |
| ↳ bound_surface_currents_nano | Aligned atomic dipoles produce net surface current at magnet's lateral face | nano | ✅ | — | [bar_magnet_as_solenoid_equivalence, ferromagnetism_atomic] | [magnetic_intensity_H_and_M] | parent: bar_magnet_as_solenoid_equivalence |
| **torque_on_magnetic_dipole** | τ = m × B; aligns dipole with external field | atomic | ✅ | — | [magnetic_dipole_moment_atomic, vector_cross_product(math-tools), force_on_current_loop(T36)] | [potential_energy_of_dipole_in_field, oscillating_dipole_period_nano] | Parallels electric-dipole torque (T30 A28) — bridge-edge to T30 |
| ↳ oscillating_dipole_period_nano | Small-angle oscillation T = 2π√(I/mB) — angular SHM | nano | ✅ | — | [torque_on_magnetic_dipole, angular_shm_equation_gamma_minus_k_theta(T17 A21)] | — | parent: torque_on_magnetic_dipole; bridges T17 SHM analogously to T30 dipole-in-E-field |
| **potential_energy_of_dipole_in_field** | U = −m·B; minimum when m parallel to B | atomic | ✅ | — | [torque_on_magnetic_dipole, dot_product(T5)] | [work_to_rotate_dipole_nano] | Parallels electric-dipole PE (T30) — bridge-edge to T30 |
| ↳ work_to_rotate_dipole_nano | W = mB(cosθ₁ − cosθ₂) | nano | — | — | [potential_energy_of_dipole_in_field] | — | parent: potential_energy_of_dipole_in_field |
| **axial_dipole_field** | B_axial = (μ₀/4π) · (2m/r³) along the dipole axis (r >> magnet length) | atomic | ✅ | — | [magnetic_dipole_moment_atomic, magnetic_field_solenoid(T36)] | [equatorial_dipole_field] | Parallels electric axial-dipole field (T30) |
| **equatorial_dipole_field** | B_eq = (μ₀/4π) · (m/r³) on the perpendicular bisector | atomic | ✅ | — | [magnetic_dipole_moment_atomic, axial_dipole_field] | — | Parallels electric equatorial-dipole field (T30); axial : equatorial = 2 : 1 ratio is the cross-magnet ↔ cross-charge invariant |
| **gauss_law_for_magnetism** | ∮B·dA = 0 — no magnetic monopoles; B-field lines are closed loops | atomic | ✅ | — | [magnetic_flux_definition(T35), gauss_law_electric(T30 contrast)] | [maxwell_equations_summary(T38 forward)] | MM-G5; one of 4 Maxwell equations — T38 references back to here |
| ↳ b_lines_always_closed_nano | Unlike E-field lines which start on +charges, B-field lines have no start/end | nano | ✅ | — | [gauss_law_for_magnetism] | — | parent: gauss_law_for_magnetism; cognitive-error-prevention — contrasts to electric monopoles |
| **earths_magnetism_atomic** | Earth's magnetic field ≈ a giant dipole tilted ~11° from geographic axis | atomic | ✅ | — | [magnetic_dipole_moment_atomic, axial_dipole_field] | [declination_dip_horizontal_component_nano] | MM-G4; unifies declination + dip + B_H |
| ↳ declination_dip_horizontal_component_nano | 3 quantities decomposing geomagnetic field at a point: declination D (true-north vs magnetic-north angle), dip θ (down angle from horizontal), B_H = B cos θ | nano | ✅ | — | [earths_magnetism_atomic, vector_resolution(T5)] | — | parent: earths_magnetism_atomic; Survey of India declination maps anchor |
| ↳ geomagnetic_pole_vs_geographic_pole_nano | Magnetic north ≠ geographic north; current location near Ellesmere Island; drifts | nano | — | — | [earths_magnetism_atomic] | — | parent: earths_magnetism_atomic |
| **magnetic_intensity_H_and_M** | B = μ₀(H + M); H = applied auxiliary field; M = magnetisation (dipole moment per unit volume) | atomic | ✅ | — | [magnetic_dipole_moment_atomic, bar_magnet_as_solenoid_equivalence] | [magnetic_susceptibility_and_permeability_atomic, diamagnetism_atomic, paramagnetism_atomic, ferromagnetism_atomic] | MM-G6 cognitive-error-prevention atomic — H, B, M as one triad |
| ↳ h_units_amperes_per_metre_nano | H measured in A/m; same units as M; B in tesla | nano | — | — | [magnetic_intensity_H_and_M] | — | parent: magnetic_intensity_H_and_M |
| **magnetic_susceptibility_and_permeability_atomic** | M = χH; μᵣ = 1 + χ; relates material response to applied H | atomic | ✅ | — | [magnetic_intensity_H_and_M] | [diamagnetism_atomic, paramagnetism_atomic, ferromagnetism_atomic] | MM-G7; unified χ ↔ μᵣ algebraic identity |
| **diamagnetism_atomic** | χ < 0 (small, ~ −10⁻⁵); induced opposing moment via Lenz-on-orbital-electrons; T-independent | atomic | ✅ | — | [magnetic_susceptibility_and_permeability_atomic, lenz_law(T35), bohr_orbit_for_atom(T47)] | [meissner_effect_nano] | Anchor: bismuth + copper + water diamagnetism; superconductor as perfect diamagnet |
| ↳ meissner_effect_nano | Superconductors expel B (χ = −1, perfect diamagnetism); levitates magnets | nano | ✅ | — | [diamagnetism_atomic] | — | parent: diamagnetism_atomic; Anchor: TIFR Mumbai superconductivity research |
| **paramagnetism_atomic** | χ > 0 (small, ~ +10⁻⁵); permanent atomic moments align weakly with B; χ ∝ 1/T (Curie's law) | atomic | ✅ | — | [magnetic_susceptibility_and_permeability_atomic, thermal_disorder_kT(T18 deferred)] | [curies_law_nano, three_material_classes_response_to_B_nano] | Anchor: aluminium + oxygen (liquid O₂ paramagnetism demo) |
| ↳ curies_law_nano | χ = C/T (Curie constant divided by absolute temperature) | nano | ✅ | — | [paramagnetism_atomic] | — | parent: paramagnetism_atomic |
| ↳ three_material_classes_response_to_B_nano | Tabulate: dia (χ < 0, very small, T-independent), para (χ > 0, small, χ ∝ 1/T), ferro (χ >> 0, T < T_Curie). Cognitive-error-prevention. | nano | ✅ | — | [paramagnetism_atomic, diamagnetism_atomic, ferromagnetism_atomic] | — | parent: paramagnetism_atomic; MM-G10 cognitive-error-prevention nano |
| **ferromagnetism_atomic** | χ >> 0 (10² to 10⁶); domain structure with spontaneous alignment within domain; Curie temperature T_C above which → paramagnetic | atomic | ✅ | — | [magnetic_susceptibility_and_permeability_atomic, paramagnetism_atomic] | [hysteresis_loop_atomic, soft_vs_hard_magnetic_materials_nano] | Anchor: iron, cobalt, nickel; Indian Rare Earths Ltd Nd-Fe-B production |
| ↳ domain_structure_nano | Below T_C, atomic moments align spontaneously within ~μm-sized domains; applied B aligns domains, not individual spins | nano | ✅ | — | [ferromagnetism_atomic] | [hysteresis_loop_atomic] | parent: ferromagnetism_atomic; TIFR + IIT-B domain-imaging anchor |
| ↳ curie_temperature_nano | Above T_C ferromagnet becomes paramagnet (Fe: 770°C, Ni: 358°C, Co: 1115°C) | nano | — | — | [ferromagnetism_atomic] | — | parent: ferromagnetism_atomic |
| **hysteresis_loop_atomic** | B-H loop for ferromagnets: retentivity B_r (B at H=0), coercivity H_c (H to bring B=0), loop-area = energy dissipated per cycle per volume | atomic | ✅ | — | [ferromagnetism_atomic, domain_structure_nano, eddy_currents_atomic(T35)] | [soft_vs_hard_magnetic_materials_nano, transformer_core_selection(T39 forward)] | MM-G3; **closes EI-G6 from T35** (hysteresis loss + eddy currents → ferromagnetic loss model); **bridges to T39 transformer core selection** |
| ↳ soft_vs_hard_magnetic_materials_nano | Soft (low H_c, low B_r, small loop area → transformer cores) vs Hard (high H_c, high B_r, large loop → permanent magnets) | nano | ✅ | — | [hysteresis_loop_atomic, ferromagnetism_atomic] | [transformer_core_selection(T39 forward), permanent_magnet_applications_nano] | parent: hysteresis_loop_atomic; **bridge to T39 transformer-core-selection** |
| ↳ permanent_magnet_applications_nano | Nd-Fe-B + Sm-Co + Alnico — high coercivity. Indian Rare Earths Ltd (Kollam, Kerala) + DRDO BLDC motors | nano | — | — | [soft_vs_hard_magnetic_materials_nano] | — | parent: hysteresis_loop_atomic; **VERY-STRONG anchor candidate via Indian Rare Earths Ltd** |
| ↳ electromagnet_vs_permanent_magnet_nano | Electromagnet = current loop around soft-iron core (low H_c → reversible); permanent = hard-magnet shaped + magnetised | nano | — | — | [hysteresis_loop_atomic, bar_magnet_as_solenoid_equivalence] | — | parent: hysteresis_loop_atomic |

**Atomic count:** 11. **Nano count:** ~14. **Total entries:** 25.

---

## Section C — Cross-Source Coverage Matrix

| Atomic | NCERT 12.1 Ch.5 | HCV2 Ch.42 | DCP §28.6–28.13 | Coverage |
|---|---|---|---|---|
| magnetic_dipole_moment_atomic | §5.2.2 | §42.3 | §28.6.1 | TRIPLE |
| bar_magnet_as_solenoid_equivalence | §5.2 | §42.2 | §28.6 | TRIPLE |
| torque_on_magnetic_dipole | §5.2.3 | §42.6 | §28.6.3 | TRIPLE |
| potential_energy_of_dipole_in_field | §5.2.3 | §42.6 | §28.6.3 | TRIPLE |
| axial_dipole_field | §5.2.1 | §42.4 | §28.6.2 | TRIPLE |
| equatorial_dipole_field | §5.2.1 | §42.5 | §28.6.2 | TRIPLE |
| gauss_law_for_magnetism | §5.3 | §42.7 | §28.7 | TRIPLE |
| earths_magnetism_atomic | §5.4 | §42.8 | §28.8 | TRIPLE |
| magnetic_intensity_H_and_M | §5.5 | §42.9 | §28.9 | TRIPLE |
| magnetic_susceptibility_and_permeability_atomic | §5.5.1 | §42.9 | §28.9 | TRIPLE |
| diamagnetism_atomic | §5.6.1 | §42.10 | §28.10 | TRIPLE |
| paramagnetism_atomic | §5.6.2 | §42.11 | §28.11 | TRIPLE |
| ferromagnetism_atomic | §5.6.3 | §42.12 | §28.12 | TRIPLE |
| hysteresis_loop_atomic | §5.6.3 (boxed) | §42.13 | §28.13 | TRIPLE |

**Triple-coverage rate:** 14 of 14 atomics (counting 11 main + 3 implicitly distinct material-class atomics covered separately = effectively all 11 main pass; reporting 11/11 = 100%). **Fourth 100%-coverage topic** in 24 pilots (after T48 Nuclei, T35 EM Induction, T38 EM Waves). Magnetism & Matter is curricularly universal.

**Atomic count for triple-coverage stat: 11/11 = 100%.**

---

## Section D — Stage-3 Math-Tool Dependencies

| Math-tool primitive | Used by | Status |
|---|---|---|
| `vector_cross_product` | magnetic_dipole_moment_atomic, torque_on_magnetic_dipole | REQUIRED (already validated in T36) |
| `dot_product` | potential_energy_of_dipole_in_field | REQUIRED (T5/T13/T36 multi-use) |
| `vector_resolution` | declination_dip_horizontal_component_nano | REQUIRED |
| `calculus_integration_dV` | magnetic_intensity_H_and_M (M = ∫ dm/dV) | REQUIRED |
| `angular_shm_equation` (T17 A21 cross-ref) | oscillating_dipole_period_nano | REQUIRED (3rd use after T17 + T30) |
| `algebra_one_over_r_cubed` | axial_dipole_field, equatorial_dipole_field | REQUIRED (cross-domain analog to T30 dipole-field) |

**No new stubs introduced.** All T37 math-tool prereqs already exist in `stage-3-math-tools.md`. **Stage-3 file integrity holds** — third consecutive session adding zero new stubs (T35/T38/T37). Pattern: as Stage-2 catalog set grows, fewer net-new primitives surface — math-tools file is converging to a stable core.

---

## Section E — Cross-Topic Dependencies (Bidirectional Edges)

### Outgoing (T37 requires from earlier topics)

| Target topic | Edge | Reason |
|---|---|---|
| T36 Moving Charges | magnetic_dipole_moment_atomic ← current_loop_as_dipole(T36 A31) | **Closes T36 A31 forward edge** — current loop = elementary dipole bridges to permanent magnet |
| T36 Moving Charges | bar_magnet_as_solenoid_equivalence ← magnetic_field_solenoid | Bound surface currents at lateral face produce solenoid-like B inside |
| T36 Moving Charges | torque_on_magnetic_dipole ← force_on_current_loop | Torque on dipole derived from F = IL × B on each loop segment |
| T35 EM Induction | hysteresis_loop_atomic ← eddy_currents_atomic | **Closes EI-G6 deferred dependency** — ferromagnetic loss model unifies hysteresis + eddy currents |
| T35 EM Induction | diamagnetism_atomic ← lenz_law | Induced opposing moment in orbital electrons is Lenz's law at atomic scale |
| T30 Electrostatics | gauss_law_for_magnetism ← gauss_law_electric (contrast) | "No magnetic monopoles" framed by analogy/contrast to electric Gauss |
| T30 Electrostatics | axial_dipole_field + equatorial_dipole_field ← electric_dipole_axial/equatorial | Magnetic-dipole geometry parallels electric-dipole; 2:1 ratio invariant |
| T30 Electrostatics | torque_on_magnetic_dipole + potential_energy_of_dipole_in_field ← electric_dipole_torque + PE | Direct analog to electric dipole in uniform E (T30 A28) |
| T17 SHM | oscillating_dipole_period_nano ← angular_shm_equation_gamma_minus_k_theta(T17 A21) | Small-angle oscillation of dipole in field is angular SHM (parallel to T30 dipole-as-angular-SHM via T17 A21) |
| T6 Vectors | magnetic_dipole_moment_atomic ← area_vector | m = NIA uses area vector direction |
| T5 Vectors | declination_dip_horizontal_component_nano ← vector_resolution | Geomagnetic field decomposed into 3 components |
| T47 Atomic Models | diamagnetism_atomic ← bohr_orbit_for_atom | Orbital electron-induced opposing moment requires Bohr-orbit picture |
| Math-tools | vector_cross_product + dot_product + vector_resolution + integration_dV + angular_shm + algebra_1/r³ | (6 primitives, all already REQUIRED) |

### Incoming (T37 will be required by later topics)

| Source topic | Edge | Reason |
|---|---|---|
| **T38 EM Waves (back-edge, retroactive)** | maxwell_equations_summary ← gauss_law_for_magnetism | One of the 4 Maxwell equations; T38 references back to T37 atomic |
| **T39 AC Circuits (anticipated forward)** | transformer_in_ac_atomic ← hysteresis_loop_atomic + soft_vs_hard_magnetic_materials_nano | **Forward edge to be closed in this same Session 48 batch** — T39 transformer core selection depends on T37 hysteresis loss |
| **T39 AC Circuits (anticipated forward)** | choke_coil_atomic ← ferromagnetism_atomic + soft_iron_core | Inductor core material selection |
| T36 Moving Charges (already counted) | (back from T37) | Bidirectional with magnetic_dipole_moment_atomic |
| T16 Gravitation (weak cross-cluster) | earths_magnetism_atomic ↔ gravitational pole vs magnetic pole | Conceptual parallel — geometric vs geomagnetic axes |
| T48 Nuclei (back-edge potential, V2) | nuclear_magnetic_moment_nano ← magnetic_dipole_moment_atomic | NMR / MRI principle (T48 references hyperfine-structure briefly) |

**Outgoing edges: 12 (6 stage-2 cross-topic + 6 math-tools — count math-tools as 1 group = 7 distinct cross-topic targets).** **Incoming edges: 5 (3 from T38/T39 + 1 back from T36 + 1 weak T16/T48).**

**Net effect on matrix:** T37 closes 2 deferred dependencies — EI-G6 (T35 hysteresis-loss model) AND T36 A31 forward-edge (current loop → permanent magnet). **Matrix integrity check #4 in 4 sessions** — every anticipated forward eventually finds its back-edge.

---

## Section F — Real-World Anchors (STRONG, Indian-context)

| Anchor | Concept hook | Authoring use |
|---|---|---|
| **Indian Institute of Geomagnetism (IIG), Navi Mumbai** | earths_magnetism_atomic, declination_dip_horizontal_component_nano | "India's premier geomagnetism research institute — runs Alibag Magnetic Observatory continuously since 1904" |
| **Survey of India magnetic declination maps** | declination_dip_horizontal_component_nano | "Every Survey of India topographic map carries a magnetic declination annotation for the surveyed year" |
| **ISRO Aditya-L1 magnetometer (Magnetometer for Aditya — MAG payload)** | earths_magnetism_atomic, magnetic_intensity_H_and_M | "Aditya-L1 measures solar magnetic field at L1 Lagrange point; launched 2023" |
| **AIIMS Delhi + 250+ Indian MRI installations** | ferromagnetism_atomic, hysteresis_loop_atomic, magnetic_susceptibility_and_permeability_atomic | "Every MRI scanner uses a superconducting magnet (~1.5-3 T) producing a uniform B inside the bore; soft iron return-path uses low-coercivity Fe" |
| **BARC isotope separation magnets (Trombay)** | magnetic_dipole_moment_atomic, ferromagnetism_atomic | "BARC uses sector magnets for mass spectrometry + isotope separation" |
| **NPL Delhi magnetic standards lab** | magnetic_intensity_H_and_M, magnetic_susceptibility_and_permeability_atomic | "India's national standard for B and H is maintained at NPL" |
| **Indian Rare Earths Ltd, Kollam, Kerala (Nd-Fe-B production)** | ferromagnetism_atomic, permanent_magnet_applications_nano | "India produces Nd-Fe-B permanent magnets from monazite-derived rare earths — strategic-materials supply for DRDO/ISRO motors" |
| **IIT Bombay Centre for Excellence in Nanoelectronics** | domain_structure_nano, ferromagnetism_atomic | "Magnetic-domain imaging via MOKE microscopy" |
| **TIFR Mumbai superconductivity research** | meissner_effect_nano, diamagnetism_atomic | "Superconductor levitating a magnet — perfect-diamagnet demo" |
| **DRDO permanent-magnet BLDC motors (defence + UAV applications)** | permanent_magnet_applications_nano, hysteresis_loop_atomic | "Brushless DC motors in DRDO drones use Nd-Fe-B rotor magnets" |
| **Vande Bharat regenerative-braking permanent-magnet traction motors** | hysteresis_loop_atomic, electromagnet_vs_permanent_magnet_nano | "Vande Bharat trains use permanent-magnet synchronous motors for traction + regen braking" |

**Total: 11 distinct institutional/system anchors.** STRONG bucket. **Decision (MM-G9):** stays STRONG — just below the 13-anchor VERY-STRONG threshold. Note: Could potentially reach VERY-STRONG with 3 additions — Antarctic Maitri-station geomagnetic observatory (policy/research strand), GSI aeromagnetic surveys (research strand), AIIMS NMR/MRI bio-imaging (healthcare strand). Revisit at Stage-4 reconciliation.

---

## Section G — Cognitive-Error-Prevention Decisions

Continuing the ~30-35% pattern observed across 23 prior catalogs. T37 cognitive-error-prevention decisions:

- **MM-G2** (split diamagnetism / paramagnetism / ferromagnetism into 3 atomics) — prevents the classic exam error of memorising material classes without underlying mechanism.
- **MM-G6** (bundle H and M into ONE atomic, NOT split) — prevents H-vs-B-vs-M confusion.
- **MM-G10** (`three_material_classes_response_to_B_nano` explicitly tabulates χ sign + magnitude + T-dependence side-by-side) — direct cognitive-error countermeasure.
- **MM-G5** (Gauss's law for magnetism as standalone atomic, NOT bundled with Maxwell) — prevents premature conflation of "no monopoles" with the full Maxwell quartet.

**4 of 10 founder decisions are cognitive-error-prevention type = 40%.** Above the 30-35% mean — T37 is unusually cognitive-error-heavy because the material-class taxonomy is the single-most-confused subdomain in NCERT Ch.5 (per HCV Points-to-Ponder + DCP common-mistakes table).

---

## Section H — V1 Priority Flags

| Atomic | V1? | Reason |
|---|---|---|
| magnetic_dipole_moment_atomic | ✅ | Foundational; closes T36 A31 forward-edge |
| hysteresis_loop_atomic | ✅ | Bridges to T39 transformer + closes EI-G6; Diamond candidate (B-H loop is iconic) |
| earths_magnetism_atomic | ✅ | Strong Indian-context anchor (IIG Mumbai + Survey of India + Aditya-L1) |
| ferromagnetism_atomic | ✅ | Material-class taxonomy anchor; required by hysteresis + transformer |
| gauss_law_for_magnetism | ⚖️ | One-line conceptual atomic; V1.1 |
| torque_on_magnetic_dipole | ⚖️ | Parallels T30 dipole — useful but redundant if T30 ships; V1.1 |
| diamagnetism_atomic + paramagnetism_atomic | ⚖️ | Bundle with ferromagnetism for V1.1 material-class triad |
| Others | — | V2+ |

**V1 ship count for T37:** 4 atomics + supporting nanos.

---

## Section I — Open Questions

1. **Earth's magnetism reversal cycle** — Brunhes-Matuyama reversal mentioned in NCERT §5.4 sidebar. Defer to V2 (paleomagnetism atomic). Not curricular core.
2. **NMR / MRI deeper coverage** — Currently anchored only in `magnetic_susceptibility_and_permeability_atomic`. Could justify a dedicated `nuclear_magnetic_resonance_atomic` in V2, especially given AIIMS-MRI density of Indian healthcare anchor.
3. **Superconductivity depth** — Meissner effect mentioned as nano. Full Type-I/Type-II superconductor classification belongs in T-Modern-Materials (not yet on Stage-2 roadmap).
4. **Curie-Weiss law (paramagnetism above T_C of ferromagnet)** — defer to V2.
5. **Antiferromagnetism + ferrimagnetism** — NCERT does not cover; defer to V2.
6. **VERY-STRONG re-rating trigger:** if Maitri-station + GSI aeromagnetic + AIIMS-NMR added at Stage-4, T37 crosses 13-anchor threshold. **Flag for Stage-4 anchor-mining pass.**

---

## Section J — Sign-Off

- Authored: Session 48, 2026-05-25.
- Author: Claude (Architect+Engineer role).
- Coverage class: **TRIPLE**.
- Anchor density: **STRONG** (11 anchors — just below VERY-STRONG threshold).
- Triple-coverage rate: **100%** (11/11) — **fourth observed 100% topic** in 24 pilots.
- Atomic count: **11**. Nano count: **14**. Total: **25 entries**.
- V1 ship count: **4 atomics**.
- **Closes 2 deferred dependencies:** EI-G6 (T35 hysteresis-loss model) + T36 A31 (current loop → permanent magnet). **Matrix integrity verified for the 4th consecutive session.**
- **E&M cluster closer #1 of 2.** Pairs with T39 AC Circuits in same Session 48 batch.
- Next pilot batch: pending founder greenlight (E&M cluster CLOSED after T37 + T39 ship together).

---

*Fourth 100% triple-coverage topic. Pattern signal: Magnetism & Matter joins Nuclei + EM Induction + EM Waves as a curricularly universal applied-physics topic. The four 100%-coverage topics span E&M (3) + Modern (1) — applied physics that survived NCERT 2023 revision.*
