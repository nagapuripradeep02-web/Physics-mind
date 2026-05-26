# Pilot Topic 23 — Sound Waves

> Stage-2 pilot catalog. 36th of 44. **Waves middle cluster CLOSER** (T19 Wave Equation + T22 Superposition shipped Session 53 paired-batch; T23 closes the 9th major cluster — completes Waves cluster 3/3).
> Sources: **NCERT Class 11 Part 2 Ch.15 Waves §15.1-15.7** (sound-wave canonical spine — longitudinal nature + speed + intensity + pipe acoustics + Doppler) + **HCV Vol 1 Ch.16 §16.7-16.10 + Ch.17 Sound Waves** (Newton-Laplace derivation + pressure-vs-displacement formalism + Doppler full derivation) + **DC Pandey Waves/Thermo Ch.19 Sound Waves** (problem-pattern density: pipe-acoustics + Doppler problem chains).
> Coverage class: **TRIPLE-COVERED**.
> Anchor density: **VERY-STRONG** (14 anchors × 9 strands — consumer-culture + healthcare + telecom + defence + transport + research + industry + meteorology + space). **8th VERY-STRONG topic** in 36-pilot catalog. **First Waves-cluster VERY-STRONG.**
> **Critical role:** T23 formalises **longitudinal-wave physics** + **Newton-Laplace speed-of-sound** + **pipe-acoustic standing waves** + **intensity & loudness (dB scale)** + **Doppler effect** — the physics underlying ALL acoustic engineering, ultrasonic medical imaging, SONAR, audiology, traffic-radar speed-guns, astronomical red-shift analogue. **Closes T19 + T22 forward-edges**. **Closes Waves middle cluster (9th major cluster, 3/3) — all 9 major clusters now opened/closed at 36-pilot/82% checkpoint.**

---

## Founder Decisions Applied

| Tag | Decision |
|---|---|
| **SO-G1** | Atomic granularity = "one longitudinal-wave-property OR one acoustic-resonance-family OR one frequency/intensity-perception-mechanism OR one source-observer-relative-motion case." Sound-wave nature, speed (Newton-Laplace), pressure-vs-displacement formulation, pipe acoustics, intensity & loudness, Doppler = SIX separate atomics. NCERT compresses; we split per-mechanism. |
| **SO-G2** | **Longitudinal nature of sound is its own atomic** (`longitudinal_wave_sound_atomic`) — particles oscillate parallel to wave-direction, creating compressions + rarefactions. **Diamond candidate** — slinky-compression animation. **cognitive_error_target:** "sound waves are transverse like water waves" → sound is longitudinal; only string/EM waves are transverse. |
| **SO-G3** | **Pressure-vs-displacement formalism is its own atomic** (`pressure_displacement_dual_atomic`) — displacement wave s(x,t) = s₀ sin(kx−ωt); pressure variation p(x,t) = p₀ cos(kx−ωt). **Crucial:** pressure leads displacement by π/2 — pressure-antinode = displacement-node. **cognitive_error_target:** "pressure peaks where displacement peaks" → no, they are π/2 out of phase. |
| **SO-G4** | **Newton-Laplace speed of sound is its own atomic** (`speed_of_sound_newton_laplace_atomic`) — Newton: v = √(P/ρ) for isothermal compression (wrong by ~16%); Laplace correction: v = √(γP/ρ) for adiabatic compression (matches experiment). **Diamond candidate** — historical-derivation arc showing why Newton was wrong + Laplace fix. |
| **SO-G5** | **Pipe-acoustic standing waves are their own atomic** (`pipe_acoustic_resonance_atomic`) — applies T22 normal-modes to air columns. Open-open pipe (flute): f_n = nv/(2L); open-closed pipe (clarinet, single-end-closed tube): f_n = (2n−1)v/(4L). End-correction at open end ≈ 0.6r. **Cross-link to T22 normal_modes_atomic.** |
| **SO-G6** | **Intensity, decibel scale, loudness perception is its own atomic** (`intensity_loudness_db_atomic`) — I = ½ρωv·s₀² = p₀²/(2ρv); β(dB) = 10 log₁₀(I/I₀) with I₀ = 10⁻¹² W/m². **cognitive_error_target:** "double the intensity = double the loudness in dB" → no, log scale; double intensity = +3 dB. |
| **SO-G7** | **Doppler effect for sound is its own atomic** (`doppler_effect_sound_atomic`) — observer-moving + source-moving distinct mechanisms (different formulae because medium is at rest); f' = f·(v ± v_obs)/(v ∓ v_src). **Diamond candidate** — ambulance-siren-passing-by anchor. **cognitive_error_target:** "same formula whether observer or source moves" → no; medium frame breaks the symmetry. |
| **SO-G8** | **Beats applied to sound (TUNING fork beats)** = nano under T22 `beats_atomic` cross-reference, NOT new atomic. Avoids duplicate. T23 catalogs the tuning-fork application instance. |
| **SO-G9** | **Sonic-boom + supersonic Mach-cone** = nano under `doppler_effect_sound_atomic` (extreme case v_src > v). **Indian anchor: HAL Tejas + IAF Sukhoi supersonic flight tests over Pokhran.** |
| **SO-G10** | **Ultrasound (>20 kHz) + infrasound (<20 Hz)** = nano under `longitudinal_wave_sound_atomic` — same physics, different frequency-perception bands. Anchor: AIIMS + Apollo ultrasound + IMD infrasound earthquake-monitoring. |
| **SO-G11** | **VERY-STRONG anchor (formalised criterion)** — 14 anchors × 9 strands. Consumer-culture (Indian classical music + cinema + autorickshaw horn) + healthcare (ultrasound) + telecom (none — sound is short-range) + defence (DRDO SONAR submarine detection + Mach-cone fighter jets) + transport (Indian Railways horn-Doppler + Mumbai traffic) + research (IMD infrasound + CSIR-NPL acoustic standards) + industry (Indian musical instruments + cinema-audio engineering) + meteorology (IMD weather sound-Doppler) + space (ISRO rocket sonic-boom). **Meets ≥13 anchors AND ≥8 strands threshold.** **8th VERY-STRONG topic — first in Waves cluster.** |
| **SO-G12** | **Cognitive-error-prevention sub-category — 5 instances** (SO-G2 longitudinal-vs-transverse; SO-G3 pressure-displacement-phase; SO-G6 log-scale-dB; SO-G7 source-observer-asymmetry; implicit "sound speed depends on source motion" → no, depends only on medium properties). Founder-decision share: 5/12 = 42%. Above 35% elevated EPIC-L gate threshold. **Sustains 8-session cognitive-error-density window.** |

---

## Section A — Source Map

| Sub-topic | NCERT 11.2 Ch.15 | HCV V1 Ch.16-17 | DCM W/T Ch.19 |
|---|---|---|---|
| Longitudinal nature of sound | §15.1 | §17.1-17.2 | §19.1 |
| Pressure-vs-displacement waves | §15.2 | §17.3 | §19.2 |
| Speed of sound (Newton + Laplace) | §15.3 | §17.4-17.5 | §19.3 |
| Speed in gases (T, humidity, density) | §15.3.1 | §17.5-17.6 | §19.3 |
| Pipe-acoustic standing waves (open + closed) | §15.4 (cross-Ch.14 §14.8) | §17.7-17.8 | §19.4 |
| Intensity, dB, loudness | §15.5 | §17.9 | §19.5 |
| Doppler effect | §15.6 | §17.10 | §19.6 |
| Sonic boom + Mach cone | (passing mention) | §17.11 | §19.7 |
| Ultrasound + infrasound + applications | (passing) | §17.12 | §19.8 |

**NCERT Ch.15 is the canonical spine** (~14 pages). **HCV Ch.17 is full pedagogical backbone** with derivations (Newton-Laplace especially). DCM W/T Ch.19 carries Doppler problem-pattern density (Indian-context: train horn, ambulance siren, radar gun).

---

## Section B — Atomic + Nano Catalog

| ID | Concept | Type | Sim? | In repo? | Requires | Required-by | Notes |
|---|---|---|---|---|---|---|---|
| **longitudinal_wave_sound_atomic** | Sound is a longitudinal mechanical wave: particles of medium oscillate parallel to direction of energy propagation, creating alternating compressions (high pressure) + rarefactions (low pressure). Requires elastic medium (gas, liquid, solid) — cannot travel through vacuum. | atomic | ✅ | — | [wave_equation_pde_atomic(T19), travelling_wave_function_atomic(T19)] | [pressure_displacement_dual_atomic, speed_of_sound_newton_laplace_atomic, pipe_acoustic_resonance_atomic, intensity_loudness_db_atomic, doppler_effect_sound_atomic] | SO-G2; **Diamond candidate**; foundation of all acoustic physics; **cognitive_error_target:** longitudinal-vs-transverse |
| ↳ compression_rarefaction_pattern_nano | Compression = particles momentarily bunched → local pressure increase ΔP > 0. Rarefaction = particles momentarily spread → ΔP < 0. Pattern travels at v_sound; individual particles oscillate in-place ±s₀. **Mass NOT transported; only the disturbance.** | nano | ✅ | — | [longitudinal_wave_sound_atomic] | — | parent; **classroom slinky demo** |
| ↳ vacuum_no_sound_demonstration_nano | Bell jar with vacuum pump: ringing bell becomes silent as air is evacuated — proves sound needs medium. Contrast with light (EM wave) which propagates through vacuum. **Indian CBSE Class-11 lab demo.** | nano | ✅ | — | [longitudinal_wave_sound_atomic] | — | parent; cognitive contrast with light |
| ↳ ultrasound_infrasound_audible_bands_nano | Audible band: ~20 Hz–20 kHz (declines with age). **Ultrasound > 20 kHz** (AIIMS medical imaging, industrial NDT, dog whistles, bat echolocation). **Infrasound < 20 Hz** (elephant communication, IMD earthquake-precursor monitoring, volcano monitoring). Same physics; different perception. | nano | ✅ | — | [longitudinal_wave_sound_atomic] | — | parent; SO-G10; **healthcare + meteorology anchors** |
| **pressure_displacement_dual_atomic** | Sound wave can be described two equivalent ways: **Displacement wave** s(x,t) = s₀ sin(kx−ωt); **Pressure wave** p(x,t) = p₀ cos(kx−ωt) = BAks₀ cos(kx−ωt) (where B = bulk modulus). **Key:** pressure leads displacement by π/2 → pressure-antinode coincides with displacement-node. | atomic | ✅ | — | [longitudinal_wave_sound_atomic, wave_equation_pde_atomic(T19)] | [pipe_acoustic_resonance_atomic, intensity_loudness_db_atomic] | SO-G3; **cognitive_error_target:** "pressure peaks where displacement peaks" → no, π/2 phase shift |
| ↳ phase_shift_pi_over_2_visualisation_nano | Stationary snapshot: where particles are maximally displaced (compression edge), they are momentarily at rest — local pressure neither max nor min. Where particles cross equilibrium (max velocity), they bunch densely → max pressure. **Visualisation requires double-track animation (displacement + pressure synchronised).** | nano | ✅ | — | [pressure_displacement_dual_atomic] | — | parent; cognitive scaffold |
| ↳ pressure_amplitude_p0_formula_nano | p₀ = BAks₀ where B = bulk modulus, k = wavenumber, s₀ = displacement amplitude. For air at STP: B ≈ 1.42×10⁵ Pa; typical conversational speech p₀ ≈ 0.01 Pa with s₀ ≈ 10⁻⁸ m — extraordinarily small displacement, measurable pressure. | nano | ✅ | — | [pressure_displacement_dual_atomic, longitudinal_wave_sound_atomic] | — | parent; quantitative scale-setting |
| **speed_of_sound_newton_laplace_atomic** | Speed of sound in gas: **Newton (1687) — isothermal assumption:** v = √(P/ρ) → predicts 280 m/s at STP (wrong; measured 332 m/s, off by ~16%). **Laplace (1816) — adiabatic correction:** v = √(γP/ρ) where γ = Cp/Cv ≈ 1.40 for air → predicts 332 m/s (matches experiment). Physical reason: sound oscillations are too rapid for heat exchange → adiabatic, not isothermal. | atomic | ✅ | — | [longitudinal_wave_sound_atomic, ideal_gas_law(T27), adiabatic_process(T26)] | [pipe_acoustic_resonance_atomic, doppler_effect_sound_atomic] | SO-G4; **Diamond candidate**; classic Newton-Laplace historical-derivation arc; cross-link T26 + T27 (thermodynamics back-edge) |
| ↳ temperature_dependence_v_sqrt_T_nano | From v = √(γRT/M): v ∝ √T (at fixed γ, M). **Indian-classroom-grade rule:** v at temperature T (in K) = v₀·√(T/T₀). At T = 0°C: v = 332 m/s; at T = 30°C (Indian summer): v ≈ 350 m/s. Audible to musicians during humid Indian summers. | nano | ✅ | — | [speed_of_sound_newton_laplace_atomic, ideal_gas_law(T27)] | — | parent; **Indian-climate anchor** |
| ↳ humidity_density_dependence_nano | Humid air has slightly LOWER mean molar mass (water vapour M=18 < dry-air M=29) → v slightly HIGHER in humid air. ~0.4% increase per 50% RH change. Negligible in classroom, measurable in precision acoustic engineering (CSIR-NPL standards). | nano | ✅ | — | [speed_of_sound_newton_laplace_atomic] | — | parent |
| ↳ speed_in_liquids_solids_nano | Liquids: v = √(B/ρ); water ≈ 1480 m/s. Solids: v = √(Y/ρ); steel ≈ 5960 m/s. **Solids fastest** because Young's modulus >> bulk modulus of gas. Anchor: DRDO submarine SONAR uses water sound-speed; Indian Railways rail-track sound transmission detectable miles away (rail-ear-press folklore). | nano | ✅ | — | [speed_of_sound_newton_laplace_atomic, elasticity_atomic(T18)] | — | parent; **defence + transport anchors**; cross-link T18 |
| **pipe_acoustic_resonance_atomic** | Air columns inside pipes support standing waves of sound: pressure node ↔ displacement antinode (and vice versa) at boundaries. **Open-open pipe (flute, bansuri):** displacement antinodes at both ends → f_n = nv/(2L), all harmonics. **Open-closed pipe (clarinet, bottle):** displacement node at closed end + antinode at open end → f_n = (2n−1)v/(4L), only odd harmonics. **End-correction:** effective length = L + 0.6r at each open end. | atomic | ✅ | — | [pressure_displacement_dual_atomic, standing_waves_string_atomic(T22), normal_modes_atomic(T22), nodes_antinodes_atomic(T22)] | — | SO-G5; **Diamond candidate**; **applies T22 to air-column geometry**; bridges to Indian classical bansuri/shehnai/conch-shell physics |
| ↳ bansuri_shehnai_harmonics_nano | Indian bamboo bansuri (Hariprasad Chaurasia tradition) is open-open pipe — full harmonic series accessible (the flute "sweetness"). Shehnai is open-closed-conical-bore — only odd harmonics dominate giving distinctive "nasal" timbre. **ITC Sangeet Research Academy formal pedagogy.** | nano | ✅ | — | [pipe_acoustic_resonance_atomic] | — | parent; **consumer/culture anchor** |
| ↳ end_correction_explanation_nano | At the open end, the air column extends slightly beyond the physical mouth (because pressure-equalisation extends into open air). End-correction ≈ 0.6r where r = pipe radius. **Indian Class-11/12 physics lab resonance-column experiment with water column directly measures this.** | nano | ✅ | — | [pipe_acoustic_resonance_atomic, nodes_antinodes_atomic(T22)] | — | parent; **education anchor** |
| ↳ resonance_column_apparatus_nano | Standard CBSE/ISC + IIT physics-lab apparatus: vertical glass tube + adjustable water reservoir; tuning fork held over open top; resonance heard when air-column length = λ/4, 3λ/4, ... Measures v_sound from known fork frequency. Tests Laplace formula directly. | nano | ✅ | — | [pipe_acoustic_resonance_atomic, speed_of_sound_newton_laplace_atomic] | — | parent; **education/research anchor** |
| **intensity_loudness_db_atomic** | **Intensity** I = power/area = ½ρωv·s₀² = p₀²/(2ρv) [W/m²]. **Decibel scale (logarithmic):** β = 10 log₁₀(I/I₀) with reference I₀ = 10⁻¹² W/m² (threshold of human hearing). **Loudness perception is approximately logarithmic** (Weber-Fechner law). Conversational speech ≈ 60 dB; rock concert ≈ 110 dB; pain threshold ≈ 120 dB. | atomic | ✅ | — | [pressure_displacement_dual_atomic, wave_energy_power_atomic(T19), longitudinal_wave_sound_atomic] | [doppler_effect_sound_atomic (intensity-shift extension)] | SO-G6; **cognitive_error_target:** "double intensity = double dB" → no, double intensity = +3 dB |
| ↳ log_scale_intuition_db_nano | Each 10 dB = 10× intensity. 60 dB → 70 dB is 10× more intense, perceived as ~2× louder. Common Indian-context: autorickshaw horn at 1 m ≈ 100 dB; Mumbai traffic ambient ≈ 75 dB; library ≈ 30 dB. Cognitive scaffold: log scale matches human sensory perception. | nano | ✅ | — | [intensity_loudness_db_atomic] | — | parent; **consumer-culture anchor** |
| ↳ inverse_square_intensity_falloff_nano | Point source in 3D: I ∝ 1/r² → β decreases by 6 dB per doubling of distance. Why: same energy spreads over surface 4πr². Important for noise-pollution regulation + concert-hall design. **CPCB India noise standards reference this.** | nano | ✅ | — | [intensity_loudness_db_atomic] | — | parent; **policy anchor** |
| ↳ noise_pollution_indian_standards_nano | **CPCB (Central Pollution Control Board) India** mandates: residential zones ≤ 55 dB daytime / 45 dB night; commercial 65/55; industrial 75/70; silence-zone (hospitals, schools) 50/40. Enforcement via state pollution-control boards. | nano | — | — | [intensity_loudness_db_atomic] | — | parent; **policy anchor: CPCB + state-PCB regulation** |
| **doppler_effect_sound_atomic** | Apparent frequency f' heard by observer differs from source frequency f when source-observer-medium relative motion exists. **General formula:** f' = f·(v ± v_obs)/(v ∓ v_src) where signs depend on directions and v = sound speed in medium. **Asymmetry:** medium is at rest in lab frame — source-moving vs observer-moving give different formulae (not Galilean-equivalent). | atomic | ✅ | — | [longitudinal_wave_sound_atomic, speed_of_sound_newton_laplace_atomic, wave_parameters_atomic(T19), relative_motion_velocity_atomic(T7 — kinematics relative-motion)] | [sonic_boom_mach_cone_nano, doppler_radar_application_nano, beats_doppler_nano] | SO-G7; **Diamond candidate**; **cognitive_error_target:** source-vs-observer asymmetry due to medium frame |
| ↳ ambulance_siren_passing_by_nano | Classic anchor: ambulance approaches → f' > f (pitch rises); passes → f' < f (pitch drops). **Indian context:** police siren, ambulance horn, Indian Railways horn-doppler at level crossings — high-pitched-approaching → low-pitched-receding step-change at observer pass-by. | nano | ✅ | — | [doppler_effect_sound_atomic] | — | parent; **healthcare/transport consumer anchor** |
| ↳ source_observer_asymmetry_explanation_nano | Why two formulae? Sound wave is carried by medium (air at rest). If source moves toward observer, wavelength in front compresses (λ' < λ); v_sound unchanged → f' = v/λ' > f. If observer moves toward stationary source, λ unchanged but observer sweeps through wavefronts faster → f' = (v+v_obs)/λ > f. **Different physical mechanisms.** | nano | ✅ | — | [doppler_effect_sound_atomic, longitudinal_wave_sound_atomic] | — | parent; cognitive scaffold; **EM-wave Doppler in T38 is symmetric (relativistic) — important contrast** |
| ↳ sonic_boom_mach_cone_nano | When v_src > v_sound (supersonic): wavefronts pile up into a Mach cone of half-angle sin θ = v/v_src. Sonic boom = shockwave reaching observer. **Indian anchor: HAL Tejas LCA + IAF Sukhoi/Rafale supersonic test flights over Pokhran + Bay of Bengal corridor.** | nano | ✅ | — | [doppler_effect_sound_atomic] | — | parent; SO-G9; **defence anchor: HAL + IAF** |
| ↳ doppler_radar_application_nano | Police speed-guns + Indian traffic-radar (Delhi/Mumbai/Bengaluru): emit microwave, measure reflected-wave Doppler shift → vehicle speed. ISRO weather-radar (Doppler weather imaging): wind-velocity from rain-droplet reflection shift. **Same Doppler principle — observer + reflector + source roles inverted.** | nano | ✅ | — | [doppler_effect_sound_atomic] | — | parent; **transport + meteorology anchors** |
| ↳ beats_doppler_application_nano | Apply T22 beats to Doppler: two slightly-detuned tuning forks (e.g., 256 Hz vs 258 Hz) produce 2 Hz beats. If one fork moves, Doppler shifts its f, changing beat rate — classic Indian-physics-lab tuning-fork experiment. **Cross-reference T22 beats_atomic.** | nano | ✅ | — | [doppler_effect_sound_atomic, beats_atomic(T22)] | — | parent; SO-G8; cross-link T22 |

**Atomic count:** 6. **Nano count:** 18. **Total entries:** 24.

---

## Section C — Cross-Source Coverage Matrix

| Atomic | NCERT 11.2 Ch.15 | HCV V1 Ch.17 | DCM W/T Ch.19 | Coverage |
|---|---|---|---|---|
| longitudinal_wave_sound_atomic | §15.1 | §17.1-17.2 | §19.1 | TRIPLE |
| pressure_displacement_dual_atomic | §15.2 | §17.3 | §19.2 | TRIPLE |
| speed_of_sound_newton_laplace_atomic | §15.3 | §17.4-17.6 | §19.3 | TRIPLE |
| pipe_acoustic_resonance_atomic | §15.4 (cross-Ch.14) | §17.7-17.8 | §19.4 | TRIPLE |
| intensity_loudness_db_atomic | §15.5 | §17.9 | §19.5 | TRIPLE |
| doppler_effect_sound_atomic | §15.6 | §17.10 | §19.6 | TRIPLE |

**Triple-coverage rate: 6 of 6 atomics = 100%.** **14th 100% topic in 36 pilots.** **STREAK EXTENDS TO 6 CONSECUTIVE 100% topics** (T18 → T20 → T25 → T19 → T22 → T23) — beats prior 5-consecutive record (longest streak ever observed). All Waves cluster atomics fully triple-covered.

---

## Section D — Stage-3 Math-Tool Dependencies

| Math-tool primitive | Used by | Status |
|---|---|---|
| `trig_sinusoidal_functions` | all atomics | REQUIRED (existing) |
| `sqrt_function_dimensional` (v = √(γP/ρ)) | speed_of_sound_newton_laplace_atomic | REQUIRED (existing) |
| `logarithm_base_10` (dB scale) | intensity_loudness_db_atomic | REQUIRED (existing; validated in T46 photoelectric, T29 electric-potential) |
| `inverse_square_law_geometric` (I ∝ 1/r²) | intensity_loudness_db_atomic | REQUIRED (existing; validated in T16 gravitation, T29 electrostatics) |
| `algebra_signed_velocity_doppler` (handle ± signs for source/observer direction) | doppler_effect_sound_atomic | REQUIRED (existing; validated in T7 relative-motion) |
| `geometric_mach_cone_sin_theta` (sin θ = v/v_src for supersonic) | sonic_boom_mach_cone_nano | REQUIRED (existing trig; new application context) |
| `time_averaging_cos_squared` (I = p₀²/(2ρv) from time-averaged p²) | intensity_loudness_db_atomic | REQUIRED (5th cross-cluster validation: T44 → T38 → T39 → T22 → T23) |

**ZERO new stubs registered.** All math-tools REQUIRED, already validated. **`time_averaging_cos_squared` validated for 5th time** — **now sole most-validated Stage-3 primitive** (passes `calculus_exponential_decay` at 5; previously tied). Math-tools IN-degree unchanged: **52**. **Light-maintenance mode continues 5 consecutive sessions** (S50 → S51 → S52 → S53 → S54) — **NEW LONGEST zero-new-stub streak** (prior record 4).

---

## Section E — Cross-Topic Dependencies (Bidirectional Edges)

### Outgoing (T23 requires from earlier topics)

| Target topic | Edge | Reason |
|---|---|---|
| **T22 Superposition (intra-cluster)** | pipe_acoustic_resonance_atomic ← T22 standing_waves_string_atomic + normal_modes_atomic + nodes_antinodes_atomic; beats_doppler_application_nano ← T22 beats_atomic | **Intra-cluster bidirectional** (4 edges; chapter-adjacent NCERT Ch.14→Ch.15) |
| **T19 Wave Equation (intra-cluster)** | longitudinal_wave_sound_atomic ← T19 wave_equation_pde + travelling_wave_function; pressure_displacement_dual ← T19 wave_equation_pde; doppler ← T19 wave_parameters; intensity ← T19 wave_energy_power | **Intra-cluster bidirectional** (5 edges; chapter-adjacent T19 ↔ T23 via T22) |
| T26 Thermodynamics (back-edge) | speed_of_sound_newton_laplace_atomic ← T26 adiabatic_process_atomic (Laplace correction) | **Closes** T26 anticipated forward (Session 51) |
| T27 Kinetic Theory (back-edge) | temperature_dependence_v_sqrt_T_nano ← T27 ideal_gas_law + γ-ratio | **Closes** T27 anticipated forward (Session 51) |
| T18 Elasticity (back-edge weak) | speed_in_liquids_solids_nano ← T18 youngs_modulus_atomic + bulk_modulus_atomic | **Closes** T18 weak forward (Session 50) |
| T7 Kinematics relative-motion (back-edge weak) | doppler_effect_sound_atomic ← T7 relative_velocity (source-observer-medium frames) | weak back-edge; T7 awaits formalisation |
| T17 SHM (back-edge weak) | longitudinal_wave_sound_atomic indirect ← T17 SHM at fixed point | weak back-edge |
| Math-tools | 7 primitives (zero new stubs) | All REQUIRED |

### Incoming (T23 will be required by later topics)

| Source topic | Edge | Reason |
|---|---|---|
| T38 EM Waves (anticipated forward) | em_wave_doppler_relativistic ← contrast with doppler_effect_sound_atomic (medium-frame vs Lorentz-invariant) | T38 already catalogued; **contrast bridge** |
| T44 Wave Optics (anticipated forward) | acoustic-vs-optical-interference parallel cross-link | T44 already catalogued |
| T46 Dual Nature / T45 Atomic Spectra (weak) | red-shift astronomical applications ← Doppler analogy | weak |

### T22 ↔ T23 intra-cluster bidirectional edges (4 edges; intra-cluster chapter-adjacent)

1. T22 `standing_waves_string_atomic` ↔ T23 `pipe_acoustic_resonance_atomic` (boundary-pattern duality: fixed-string node ≡ open-pipe pressure-node)
2. T22 `normal_modes_atomic` ↔ T23 `pipe_acoustic_resonance_atomic` (f_n family applied to air column)
3. T22 `nodes_antinodes_atomic` ↔ T23 `pipe_acoustic_resonance_atomic` (pressure-node ≡ displacement-antinode duality)
4. T22 `beats_atomic` ↔ T23 `beats_doppler_application_nano` (cross-link)

### T19 ↔ T23 intra-cluster bidirectional edges (5 edges; chapter-adjacent across T22)

1. T19 `wave_equation_pde_atomic` ↔ T23 `longitudinal_wave_sound_atomic` (1D longitudinal PDE realisation)
2. T19 `travelling_wave_function_atomic` ↔ T23 `pressure_displacement_dual_atomic` (sinusoidal wave both forms)
3. T19 `wave_parameters_atomic` ↔ T23 `doppler_effect_sound_atomic` (Δf, Δλ relations)
4. T19 `wave_energy_power_atomic` ↔ T23 `intensity_loudness_db_atomic` (energy density extended to intensity)
5. T19 `wave_speed_string_atomic` indirect ↔ T23 `speed_of_sound_newton_laplace_atomic` (medium-property-derived v)

**Intra-cluster bidirectional edges total (T19 ↔ T23 + T22 ↔ T23 + T19 ↔ T22 from S53): 5 + 4 + 6 = 15 edges within the 3-topic Waves middle cluster.** **8th data point validating intra-cluster chapter-adjacent density rule (6-9 per pair).** Per-pair averages: T19-T22 = 6; T22-T23 = 4 (below range — small because beats was the main bridge); T19-T23 = 5 (within range). **Sub-pattern observed: cluster-closer pair has fewer direct edges than opener pair when middle-topic carries most bridging weight (T22 here).** Flag for Stage-4 cumulative observation.

**Total outgoing: 4 back-edge closures (T26 + T27 + T18 + indirect-T7/T17) + 7 math-tools + 9 intra-cluster bidirectional (5 T19 + 4 T22).** **Total incoming: 1 contrast bridge to T38 + 1 cross-link to T44 + weak to T46.**

---

## Section F — Real-World Anchors (VERY-STRONG, Indian-context)

| Anchor | Concept hook | Authoring use | Strand |
|---|---|---|---|
| **Indian classical bansuri / shehnai / pungi (snake-charmer flute) / conch-shell** | pipe_acoustic_resonance_atomic, bansuri_shehnai_harmonics_nano, normal_modes_atomic | "Hariprasad Chaurasia bansuri is open-open pipe; Bismillah Khan shehnai is conical-bore open-closed; conch-shell (shankha) used in temples is closed-end resonator" | Consumer / Culture |
| **Indian classical music tuning + tabla-tuning by beats** | beats_doppler_application_nano (T22 cross-link), intensity_loudness_db_atomic | "ITC Sangeet Research Academy formalises ear-training for beats + harmonics + dB-scale dynamics" | Culture / Education |
| **AIIMS + Apollo + Fortis medical ultrasound imaging (sonography)** | longitudinal_wave_sound_atomic, ultrasound_infrasound_audible_bands_nano, pressure_displacement_dual_atomic | "Medical ultrasound 2-18 MHz transducers; piezoelectric crystal sends compression-rarefaction pulses; reflection-time + Doppler-shift give vessel-flow imaging" | Healthcare |
| **DRDO Naval Physical & Oceanographic Lab (NPOL Kochi) — submarine SONAR** | longitudinal_wave_sound_atomic, speed_in_liquids_solids_nano, doppler_effect_sound_atomic | "Indian Navy submarines use active + passive SONAR; v_water ≈ 1480 m/s; Doppler distinguishes vessel motion" | Defence |
| **HAL Tejas LCA + IAF Sukhoi/Rafale supersonic over Pokhran + Bay of Bengal** | sonic_boom_mach_cone_nano, doppler_effect_sound_atomic | "Indian Air Force supersonic test corridors; sonic-boom regulation; Mach cone visible in shock-wave photography" | Defence / Aerospace |
| **Indian Railways horn + level-crossing Doppler + train horn-pitch shift** | doppler_effect_sound_atomic, ambulance_siren_passing_by_nano | "Standard Indian Railways K5LA horn ~150 dB; pitch shift audible at level crossings; rail-track speed of sound (DRDO + RDSO acoustic NDT)" | Transport |
| **CPCB India noise-pollution standards + state PCB enforcement** | intensity_loudness_db_atomic, log_scale_intuition_db_nano, noise_pollution_indian_standards_nano | "Central Pollution Control Board sets dB(A) limits for residential/commercial/industrial/silence-zones; Mumbai/Delhi/Bengaluru routinely exceed" | Policy / Public-Health |
| **CSIR-NPL (National Physical Laboratory, Delhi) — acoustic standards + sound-level calibration** | intensity_loudness_db_atomic, speed_of_sound_newton_laplace_atomic, end_correction_explanation_nano | "CSIR-NPL maintains national sound-pressure-level standards + calibrates audiometers + reference acoustic equipment" | Research / Policy |
| **IMD (India Meteorological Department) Doppler weather radar (DWR) network** | doppler_radar_application_nano, doppler_effect_sound_atomic | "IMD's 35+ DWR stations across India use Doppler-radar to track storm-wind-velocity in real time; monsoon-forecast critical" | Meteorology / Public-Service |
| **ISRO Sriharikota (SHAR) rocket launches — sonic-boom + ground-acoustics** | sonic_boom_mach_cone_nano, intensity_loudness_db_atomic, inverse_square_intensity_falloff_nano | "PSLV/GSLV launches measured at 180+ dB at launch pad; sonic-boom acoustic monitoring for villages around Sriharikota" | Space / Public-Health |
| **Indian cinema sound (Dolby Atmos installation in PVR/INOX) + film-music recording (AR Rahman studios Chennai)** | intensity_loudness_db_atomic, pipe_acoustic_resonance_atomic | "Multi-channel cinema audio engineering uses room-acoustic standing-wave + dB-curve design; AR Rahman KM Music Conservatory teaches this" | Industry / Culture |
| **Indian autorickshaw + traffic horn — Mumbai/Delhi/Bengaluru ambient noise** | intensity_loudness_db_atomic, log_scale_intuition_db_nano | "Autorickshaw horn 95-105 dB at 1 m; Mumbai traffic ambient 75-90 dB; daily ear-experience anchor for dB scale" | Consumer |
| **IMD + NCS (National Centre for Seismology) infrasound earthquake-precursor monitoring** | ultrasound_infrasound_audible_bands_nano, longitudinal_wave_sound_atomic | "NCS Delhi infrasound stations detect <20 Hz signals from earthquakes + tsunamis + volcanic activity" | Meteorology / Defence |
| **Indian musical-instrument manufacturing (Bina Musical Delhi + Hemen & Co Kolkata) — bansuri/sitar/tabla** | pipe_acoustic_resonance_atomic, normal_modes_atomic, bansuri_shehnai_harmonics_nano | "Bina Musical specifies bansuri bore-diameter + length to tune fundamental f₁; Hemen Co tunes sitar harmonics" | Industry / Culture |

**Total: 14 distinct institutional/system anchors across 9 strands** (consumer-culture, healthcare, defence, transport, policy/public-health, research, meteorology, space, industry). **Meets ≥13 anchors AND ≥8 strands → VERY-STRONG (SO-G11).** **8th VERY-STRONG topic** of 36 (T28 Modern Phenomena, T29 Electric Charges, T34 Current Electricity, T36 Magnetic Force, T11 Newton's Laws, T20 Fluid Mechanics, T25 Thermal Properties, **T23 Sound Waves**). **First Waves-cluster VERY-STRONG topic.** **VERY-STRONG share now 8/36 = 22%** (rising from 7/35 = 20% last session).

---

## Section G — Cognitive-Error-Prevention Decisions

**5 of 12 founder decisions are cognitive-error-prevention type = 42%.** Above 35% threshold; elevated EPIC-L gate applies:

| Tag | cognitive_error_target | Countermeasure |
|---|---|---|
| **SO-G2** | "sound is transverse like water waves" | Mandatory `compression_rarefaction_pattern_nano` + slinky-demo animation; contrast with T19 transverse-string |
| **SO-G3** | "pressure peaks where displacement peaks" | Mandatory `phase_shift_pi_over_2_visualisation_nano` with synchronised double-track animation |
| **SO-G6** | "double intensity = double dB / linear loudness" | Mandatory `log_scale_intuition_db_nano` with worked +3 dB ≈ doubled-intensity example |
| **SO-G7** | "Doppler is symmetric for source vs observer motion" | Mandatory `source_observer_asymmetry_explanation_nano` showing medium-frame asymmetry; contrast with T38 EM-wave relativistic Doppler |
| **(implicit)** | "sound speed depends on source motion" | Author "v_sound depends ONLY on medium (T, ρ, γ); source motion changes f and λ separately" |

**Combined Session 54 cognitive-error-prevention share: T23 = 42% (5/12) = 5 of 12 = 42%** (single-topic session). Sustains 35-50% range observed across **9 consecutive sessions** (S46-S54). **Waves cluster cognitive-error density confirmed across all 3 catalogs** (T19 36%, T22 45%, T23 42% — cluster mean 41%).

---

## Section H — V1 Priority Flags

| Atomic | V1? | Reason |
|---|---|---|
| longitudinal_wave_sound_atomic | ✅ | Foundation of all sound physics; cognitive-error rich; slinky-demo anchor |
| doppler_effect_sound_atomic | ✅ | Diamond candidate; ambulance/train/radar anchor universal in Indian context; cognitive-error rich |
| speed_of_sound_newton_laplace_atomic | ✅ | Diamond candidate; historical-derivation arc; cross-link T26+T27 thermodynamics |
| pipe_acoustic_resonance_atomic | ✅ | Diamond candidate; bansuri/shehnai/conch musical-instrument cultural anchor |
| intensity_loudness_db_atomic | ⚖️ | V1.1; CPCB noise-pollution policy anchor; everyday autorickshaw-horn dB intuition |
| pressure_displacement_dual_atomic | ⚖️ | V1.1; cognitive-scaffold for ultrasound + acoustic engineering |

**V1 ship count for T23: 4 atomics.** Matches Session 53 paired-batch cadence (T19 = 5, T22 = 4). **Session 54 V1 ship: 4 atomics.** **Waves cluster cumulative V1 ship: 5 (T19) + 4 (T22) + 4 (T23) = 13 atomics across 3 topics.**

---

## Section I — Open Questions

1. **Doppler effect generalised to relativistic / EM-wave domain** — defer to T38 explicit contrast (already catalogued; this catalog adds the cross-link forward).
2. **Hearing perception non-linearities (equal-loudness contours, phon-vs-dB)** — psychoacoustics; defer to V2.
3. **Architectural acoustics + reverberation time (Sabine equation)** — application; defer.
4. **Nonlinear acoustics + shock waves (beyond linear superposition)** — graduate; defer.
5. **Vocal-tract acoustics + speech-formant production (Indian-language phonetics — IIT-Madras speech labs)** — application; flag for V2 elective content.
6. **Waves cluster check** — T19 + T22 + T23 done. **Waves middle cluster CLOSED (3/3) — 9th major cluster fully closed.** All 9 major clusters now opened/closed at 36-pilot/82% checkpoint.

---

## Section J — Sign-Off

- Authored: Session 54, 2026-05-25.
- Author: Claude (Architect+Engineer role).
- Coverage class: **TRIPLE**.
- Anchor density: **VERY-STRONG** (14 anchors × 9 strands — **8th VERY-STRONG topic; first Waves-cluster VERY-STRONG**).
- Triple-coverage rate: **100%** (6/6 atomics) — **14th observed 100% topic**; **streak extends to 6 consecutive** (T18 → T20 → T25 → T19 → T22 → T23) — **NEW LONGEST 100% STREAK EVER**.
- Atomic count: **6**. Nano count: **18**. Total: **24 entries**.
- V1 ship count: **4 atomics**.
- **Closes anticipated forward-edges**: T26 adiabatic + T27 ideal-gas (Newton-Laplace derivation) + T18 elasticity (sound speed in solids) + intra-cluster T19/T22 bridging.
- **Waves middle cluster CLOSED (3/3) — 9th major cluster fully closed. All 9 major clusters now opened/closed at 36-pilot/82% checkpoint.**
- **0 new math-tools stubs registered. `time_averaging_cos_squared` validated 5th time → now sole most-validated Stage-3 primitive (passes `calculus_exponential_decay` at 5). Light-maintenance mode 5 consecutive sessions — NEW LONGEST zero-stub streak.**
- Cognitive-error-prevention founder-decision share: **42%** (5/12). Cluster mean across 3 Waves catalogs: 41%.
- 15 intra-cluster bidirectional edges across the 3-topic Waves middle cluster; **8th data point validating Stage-4 intra-cluster chapter-adjacent density rule (6-9 range per pair)**. Sub-pattern flagged: cluster-closer pair (T22-T23 = 4) below range when middle-topic carries bridging weight.
- Next recommended Session 55: stragglers / Kinematics-formalisation cluster opener (T6 1D Kinematics + T7 2D Kinematics+Relative-Motion + T8 Projectile-Motion). 8 pilots remain.

---

*14th 100% topic; 8th VERY-STRONG; 6th consecutive 100% (longest streak ever). 9th major cluster CLOSED (Waves complete). 5 cognitive-error-prevention decisions out of 12 — Waves cluster confirmed dense-misconception cluster (mean 41% across 3 catalogs). Math-tools light-maintenance 5 sessions running (NEW record). `time_averaging_cos_squared` now sole most-validated Stage-3 primitive at 5 cross-cluster uses. All 9 major clusters opened/closed at 82% checkpoint.*
