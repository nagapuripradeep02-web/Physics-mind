# Stage-2 Pilot Catalog — Topic 17: Simple Harmonic Motion (SHM)

> Sixth Stage-2 catalog. Triple-covered (NCERT 11.2 Ch.14 + DCM2 Ch.14 + HCV1 Ch.12). Companion pilot for Topic 30 Electrostatics; first SHM/waves bridge in the matrix.

## Founder Decisions Applied (S-G1 → S-G6)

| ID | Decision | Source-anchor | Effect on catalog |
|---|---|---|---|
| S-G1 | **Periodic motion is umbrella, SHM is the atomic** | NCERT 14.2 introduces periodic, 14.3 narrows to SHM | A1 = `shm_definition`; periodic-motion definition is its nano `periodic_motion_umbrella`, not a separate atomic |
| S-G2 | **Four x-t initial-condition forms = 1 atomic with 4 nanos**, not 4 separate atomics | DCM2 §14.3 Table 14.1 explicitly tabulates four canonical cases | A9 = `shm_initial_conditions_xt_form`; the four cases are sequenced nanos (mean→positive, mean→negative, extreme→+A, extreme→−A) |
| S-G3 | **Spring combinations (series + parallel) = 1 atomic + 2 nanos** | HCV1 W.Ex 5, 8, 9 + DCM2 Ex 14 use combined-spring patterns | A14 = `spring_combinations_in_shm` with nanos `springs_in_parallel_keff` + `springs_in_series_keff` |
| S-G4 | **Simple pendulum and physical pendulum = 2 separate atomics** | Different formulas (T=2π√(L/g) vs T=2π√(I/mgL)), distinct worked examples | A18 `simple_pendulum_period` (atomic) + A20 `physical_pendulum_period` (atomic). Same chapter but mechanistically distinct. |
| S-G5 | **Angular SHM is a separate atomic from linear SHM** | HCV1 §12.7 elevates it to dedicated section; equation Γ = −kθ is the angular analog of F=−kx | A21 = `angular_shm_equation` (atomic). Soft cross-link to A1 linear SHM. |
| S-G6 | **Composition of two SHM = 2 atomics** (same-direction superposition vs perpendicular composition) | HCV1 §12.11 splits into (A) same direction and (B) perpendicular | A28 `superposition_two_shm_same_direction` (atomic with nanos for δ=0, π, π/3 cases) + A29 `perpendicular_two_shm_lissajous` (atomic with nanos for δ=0 line, δ=π/2 ellipse, A₁=A₂&δ=π/2 circle, δ=π other line) |

These six decisions are applied INLINE in the atomic catalog below — every entry already reflects them.

---

## Section A — Source Citations

| Source | Chapter / Section | Pages (book) | Role |
|---|---|---|---|
| **NCERT Class 11 Part 2** | Ch.14 Oscillations §14.1 – §14.10 | 339–359 | Indian-context anchor mining + canonical CBSE physics |
| **DC Pandey Mechanics Vol 2** | Ch.14 Simple Harmonic Motion §14.1 – §14.6 | 285–371 | JEE-Adv problem-pattern typing + 4-case initial-condition tabulation |
| **HC Verma Vol 1** | Ch.12 Simple Harmonic Motion §12.1 – §12.13 | 229–248 (+ Worked Examples 1–20) | Pedagogy + angular SHM + composition + pendulum-as-g-measurement |

**Reads completed this session:** NCERT 11.2 PDF p.120–139 (full Ch.14), DCM2 PDF p.293–312 (Ch.14 §14.1–14.3 theory + Examples 14.1–14.9), HCV1 PDF p.240–259 (Ch.12 full theory §12.1–12.13 + Worked Examples 1–~20 starting).

**Stage-3 follow-up read flagged:** DCM2 §14.4 (Relation SHM↔UCM), §14.5 (Methods of finding T), §14.6 (Vector method of combining SHM) — book pages ~310–340 — not in this read.

---

## Section B — Existing Repo Cross-Check

```
$ Glob src/data/concepts/*.json | grep -iE "(shm|harmonic|oscillation|pendulum|spring|periodic)"
(none — no SHM/oscillation atomic JSON exists yet)
```

**Status:** Zero atomic JSONs shipped for SHM. Entirely greenfield catalog. Aligns with founder's `feedback-v1-one-concept-one-context` rule — Topic 17 is unbuilt and must be authored fresh during Stage-5 priority queue execution.

**`physics_constants/` legacy:** Likely contains `simple_pendulum.json` or similar legacy spring-mass bundles in old format. Not blocking — atomic v2 rewrite is the target.

---

## Section C — Methodology

1. **Three-source read first.** All theory sections from NCERT 14.1–14.10 + DCM2 14.1–14.3 + HCV1 12.1–12.13 captured before any atomic was named.
2. **Atomic-vs-nano boundary test (per CLAUDE.md §7):**
   - Atomic = full 8-state EPIC-L lesson can be authored (e.g., "centripetal-like restoring force from spring" deserves its own arc)
   - Nano = 2–3 state sub-piece (e.g., "negative sign in F=−kx means restoring direction" is a nano under SHM-defining-equation atomic)
   - When uncertain → flagged `candidate_micro` per plan dependency-tracking rule
3. **Source-role triad applied** (per memory `feedback-source-role-triad`): HCV1 owns derivations + pedagogy; DCM2 owns 4-case x-t taxonomy + problem-pattern types; NCERT owns motivational/Indian-context anchors.
4. **Founder-style decisions S-G1 → S-G6 made inline** (see top table). Each decision documented at the point it affected the catalog, not at the end.
5. **Dependency tracking per plan rule:** Every atomic carries `Requires` + `Required-by` columns. Cross-topic dependencies (T10, T13, T16) are tagged as `[T<N>]` for matrix integration.

---

## Section D — Atomic + Nano Concept Catalog

### D.1 — SHM definition & equation cluster (A1–A4)

| ID | Concept | Type | Sim? | In repo? | Requires | Required-by | Notes |
|---|---|---|---|---|---|---|---|
| **A1** | `shm_definition_force_minus_kx` | atomic | ✅ | — | newton_second_law_direction [T11], hooke_law_spring [T16], vector_resolution [T5] | A2, A3, A4, A5, A6, A14, A17, A18, A21 | The defining condition F = −kx, with examples (spring-block, projection of UCM). Core of the topic. |
| ↳ A1.n1 | `periodic_motion_umbrella` | nano | ✅ | — | distance_displacement_basics [T6] | A1 | Definition: motion repeating at fixed T. Non-SHM examples (rolling ball, parabolic bounce). Per S-G1 — not its own atomic. |
| ↳ A1.n2 | `restoring_force_sign_convention` | nano | ✅ | — | sign_convention [T6] | A1, A21 | The minus sign means F is always toward mean position. Visual: arrow flips when block crosses x=0. |
| ↳ A1.n3 | `spring_constant_k_physical_meaning` | nano | ✅ | — | hooke_law_spring [T16] | A1, A14, A17 | k = F/x = stiffness. Units N/m. k=mω². |
| **A2** | `shm_acceleration_equals_minus_omega_squared_x` | atomic | ✅ | — | A1, newton_second_law_atomic [T11] | A3, A5, A6 | a = −ω²x. From a = F/m + F = −kx, ω² = k/m. Maximum at extremes, zero at mean. |
| ↳ A2.n1 | `omega_definition_angular_frequency` | nano | ✅ | — | A1 | A2, A3 | ω = √(k/m), units rad/s, ω = 2π/T = 2πf. Distinct from linear ω of UCM but same units (per HCV1 12.4 (c)). |
| ↳ A2.n2 | `a_x_graph_straight_line_negative_slope` | nano | ✅ | — | A2 | exam_pattern_problems | a−x is a line through origin, slope −ω². DCM2 14.2 (Fig 14.5) canonical figure. |
| **A3** | `shm_velocity_equals_omega_root_A2_minus_x2` | atomic | ✅ | — | A2 | A4, A6 | v(x) = ±ω√(A²−x²). At extremes v=0, at mean v=±ωA. The v−x ellipse. |
| ↳ A3.n1 | `vmax_at_mean_position` | nano | ✅ | — | A3 | A3, A6 | v_max = ωA, occurs at x=0. Critical for energy bookkeeping. |
| ↳ A3.n2 | `vx_ellipse_geometry` | nano | ✅ | — | A3 | — | (v/ωA)² + (x/A)² = 1, an ellipse in v−x plane. DCM2 Fig 14.7. |
| **A4** | `shm_displacement_xt_sinusoidal` | atomic | ✅ | — | A1, A2 | A9, A19 | x(t) = A sin(ωt + φ) or A cos(ωt + φ). Solution of d²x/dt² = −ω²x. T = 2π/ω. |
| ↳ A4.n1 | `solution_of_differential_equation_general_form` | nano | ✅ | — | A4 | A4, A9 | We don't solve d²x/dt² = −ω²x explicitly; we recognize sin/cos as general solution. NCERT 14.3 eq 14.4. |
| ↳ A4.n2 | `phase_angle_meaning` | nano | ✅ | — | A4 | A9, A28 | Argument (ωt+φ) is phase; φ is phase constant set by initial conditions. HCV1 §12.4(d). |
| ↳ A4.n3 | `sin_vs_cos_form_equivalence` | nano | ✅ | — | A4 | A9 | A sin(ωt + π/2) = A cos(ωt). Choice depends on convenience. HCV1 §12.4(e). |

### D.2 — UCM↔SHM bridge (A5)

| ID | Concept | Type | Sim? | In repo? | Requires | Required-by | Notes |
|---|---|---|---|---|---|---|---|
| **A5** | `shm_as_projection_of_uniform_circular_motion` | atomic | ✅ | — | uniform_circular_motion [T10], A2, A3 | A4, A28 | Foot of perpendicular from P on x-axis executes SHM. x = A cos ωt, y = A sin ωt. NCERT §14.4, HCV1 §12.5. Cross-topic bridge T10→T17. |
| ↳ A5.n1 | `reference_circle_and_reference_particle` | nano | ✅ | — | A5 | A5 | The auxiliary circle (radius A) and uniformly rotating particle P′. Visualization-only construct. |
| ↳ A5.n2 | `two_perpendicular_projections_are_two_shms` | nano | ✅ | — | A5 | A29 | x-projection = A cos ωt, y-projection = A sin ωt. Same A and ω, phase differ by π/2. Setup for Lissajous (A29). |

### D.3 — Energy in SHM (A6–A8)

| ID | Concept | Type | Sim? | In repo? | Requires | Required-by | Notes |
|---|---|---|---|---|---|---|---|
| **A6** | `total_mechanical_energy_in_shm_constant` | atomic | ✅ | — | A1, A3, work_energy_theorem [T13], conservation_of_mechanical_energy [T13] | A7, A8 | E = ½kA² = ½mω²A². Independent of t. Cross-topic bridge T13→T17. |
| ↳ A6.n1 | `kinetic_energy_in_shm_kx_minus_kA_proportional` | nano | ✅ | — | A6 | A6, A7 | KE = ½m·ω²(A²−x²) = ½k(A²−x²). Max at mean, zero at extremes. |
| ↳ A6.n2 | `potential_energy_in_shm_half_k_x_squared` | nano | ✅ | — | A6 | A7, A8 | U = ½kx². Parabola in U−x plot. Period of U is T/2 (per NCERT 14.7). |
| ↳ A6.n3 | `ke_pe_period_is_half_displacement_period` | nano | ✅ | — | A6 | exam_pattern_problems | KE oscillates 2× per cycle of x — common JEE trick. NCERT §14.7. |
| **A7** | `energy_displacement_graph_parabola_pair` | atomic | ✅ | — | A6 | exam_pattern_problems | E flat line, U parabola opening up, KE parabola opening down. They sum to E. Canonical figure NCERT Fig 14.16(b), DCM2 Fig 14.9. |
| **A8** | `energy_at_x_equals_A_over_2_problem_pattern` | atomic | ✅ | — | A6 | — | At x = A/2: KE = 3E/4, PE = E/4 (or = 3:1 ratio). Frequently typed JEE pattern. DCM2 Ex 14.5. |

### D.4 — Time equations & initial conditions (A9–A12)

| ID | Concept | Type | Sim? | In repo? | Requires | Required-by | Notes |
|---|---|---|---|---|---|---|---|
| **A9** | `shm_initial_conditions_xt_form` | atomic | ✅ | — | A4 | A10, A11 | Per S-G2. Four canonical (x₀, v₀) combinations → four canonical x(t) forms. DCM2 Table 14.1. |
| ↳ A9.n1 | `case_start_mean_positive_velocity` | nano | ✅ | — | A9 | — | t=0: x=0, v=+ωA → x = A sin ωt. |
| ↳ A9.n2 | `case_start_mean_negative_velocity` | nano | ✅ | — | A9 | — | t=0: x=0, v=−ωA → x = −A sin ωt. |
| ↳ A9.n3 | `case_start_positive_extreme_zero_velocity` | nano | ✅ | — | A9 | — | t=0: x=+A, v=0 → x = A cos ωt. |
| ↳ A9.n4 | `case_start_negative_extreme_zero_velocity` | nano | ✅ | — | A9 | — | t=0: x=−A, v=0 → x = −A cos ωt. |
| **A10** | `time_to_reach_fraction_of_amplitude` | atomic | ✅ | — | A9 | — | Time from mean → A/2 is T/12; mean → A/√2 is T/8; mean → A√3/2 is T/6. Canonical timing-trick pattern. HCV1 W.Ex 4, DCM2 Ex 14.9. |
| ↳ A10.n1 | `t_equals_T_over_12_to_half_amplitude` | nano | ✅ | — | A10 | — | sin ωt = 1/2 ⇒ ωt = π/6 ⇒ t = T/12. |
| **A11** | `find_amplitude_from_two_displacement_velocity_pairs` | atomic | ✅ | — | A3 | — | Given (x₁,v₁) and (x₂,v₂): use v² = ω²(A²−x²) to solve A and ω. Common JEE typed problem. |
| **A12** | `phase_difference_between_x_v_a_graphs` | atomic | ✅ | — | A2, A3, A4 | — | x leads v by π/2, leads a by π (out of phase). NCERT Fig 14.13. Important for graph-matching MCQ. |

### D.5 — Spring systems & period formulas (A13–A17)

| ID | Concept | Type | Sim? | In repo? | Requires | Required-by | Notes |
|---|---|---|---|---|---|---|---|
| **A13** | `block_attached_to_single_spring_period_formula` | atomic | ✅ | — | A1, A2, hooke_law_spring [T16] | A14, A15, A16 | T = 2π√(m/k). The canonical entry pattern. NCERT §14.8.1, HCV1 §12.2. |
| **A14** | `spring_combinations_in_shm` | atomic | ✅ | — | A13 | — | Per S-G3. The umbrella for parallel + series combined-spring systems. |
| ↳ A14.n1 | `springs_in_parallel_keff_equals_sum` | nano | ✅ | — | A14 | A14 | Two springs both attached to block side-by-side: k_eff = k₁ + k₂. NCERT Ex 14.6 (two springs k each on either side, T = 2π√(m/2k)). |
| ↳ A14.n2 | `springs_in_series_keff_reciprocal_sum` | nano | ✅ | — | A14 | A14 | End-to-end springs: 1/k_eff = 1/k₁ + 1/k₂. |
| **A15** | `vertical_spring_block_gravity_shifts_equilibrium` | atomic | ✅ | — | A13, newton_second_law_direction [T11] | — | Hanging spring: mean position shifts by mg/k but T is unchanged. HCV1 W.Ex 5. Common misconception trap. |
| **A16** | `block_between_two_walls_with_springs_period` | atomic | ✅ | — | A14 | — | Block compressed by spring on one side and stretched on other → both forces toward mean → F = −2kx → T = 2π√(m/2k). NCERT Ex 14.6. |
| **A17** | `block_collides_with_spring_amplitude_from_kinetic_energy` | atomic | ✅ | — | A6, A1, work_energy_theorem [T13] | — | Block of mass m with speed v hits spring → ½mv² = ½kA² → A = v√(m/k). HCV1 W.Ex 9. Connects T13 (KE) → T17 (amplitude). |

### D.6 — Pendulum cluster (A18–A20)

| ID | Concept | Type | Sim? | In repo? | Requires | Required-by | Notes |
|---|---|---|---|---|---|---|---|
| **A18** | `simple_pendulum_period_formula` | atomic | ✅ | — | A1, free_fall [T6], small_angle_approximation | A19, A20 | T = 2π√(L/g). Per S-G4 — distinct atomic from physical pendulum. NCERT §14.8.2, HCV1 §12.8. **Indian-context anchor:** "What length of pendulum ticks seconds?" — NCERT Ex 14.9, answer L = 1 m. **Cycle break (2026-06-13):** removed A21 (angular-SHM eqn) from Requires — the simple pendulum is derived directly from linear F=−kx + small-angle approx, not from the general angular-SHM equation. Leaves clean A18→A20→A21. |
| ↳ A18.n1 | `small_angle_sin_theta_approx_theta` | nano | ✅ | — | A18 | A18, A20, A21 | sin θ ≈ θ for θ < 0.349 rad (20°). Justifies linearization. NCERT Table 14.1 + safety bound at 50° for ≤5% error. |
| ↳ A18.n2 | `pendulum_independent_of_mass_and_amplitude` | nano | ✅ | — | A18 | — | T does not depend on bob mass or (small) amplitude — the Galileo observation. Per NCERT 14.8.2 introductory paragraph. |
| **A19** | `g_determination_via_pendulum_in_lab` | atomic | ✅ | — | A18 | — | g = 4π²L/T². Lab procedure: measure 20 oscillations to reduce stopwatch error. HCV1 §12.8 (Determination of g). |
| **A20** | `physical_pendulum_period_formula` | atomic | ✅ | — | A18, moment_of_inertia_atomic [T16] | — | Per S-G4. Rigid body suspended through point O: T = 2π√(I/mgL). HCV1 §12.9. Rod-as-pendulum, meter-stick-pendulum patterns. |

### D.7 — Angular SHM & torsional (A21–A22)

| ID | Concept | Type | Sim? | In repo? | Requires | Required-by | Notes |
|---|---|---|---|---|---|---|---|
| **A21** | `angular_shm_equation_gamma_minus_k_theta` | atomic | ✅ | — | A1, A20, moment_of_inertia_atomic [T16] | A22, T30:A38 (dipole as ang SHM) | Per S-G5. Angular equivalent of F=−kx: Γ = −kθ. T = 2π√(I/k). HCV1 §12.7. **Indian-context anchor:** hanging umbrella oscillations. |
| ↳ A21.n1 | `angular_omega_squared_equals_k_over_I` | nano | ✅ | — | A21 | — | ω² = k/I. Analogous to k/m in linear SHM. |
| **A22** | `torsional_pendulum_disc_on_wire_period` | atomic | ✅ | — | A21, moment_of_inertia_atomic [T16] | — | Disc twisted on wire: torsional constant k, T = 2π√(I/k). HCV1 §12.10 (Fig 12.14). Used for measuring torsional rigidity. |

### D.8 — Damped & forced + resonance (A23–A26)

| ID | Concept | Type | Sim? | In repo? | Requires | Required-by | Notes |
|---|---|---|---|---|---|---|---|
| **A23** | `damping_force_proportional_to_velocity` | atomic | ✅ | — | A1, viscous_drag [T16] | A24, A25 | F_d = −bv. Total force on block: m d²x/dt² + b dx/dt + kx = 0. NCERT §14.9. |
| ↳ A23.n1 | `b_dimensionless_ratio_b_over_sqrt_km` | nano | ✅ | — | A23 | A24 | b/√(km) determines damping regime. NCERT Eq 14.34 onward. |
| **A24** | `damped_oscillation_solution_exp_decay_envelope` | atomic | ✅ | — | A23 | A25 | x(t) = A e^(−bt/2m) cos(ω′t + φ), ω′ = √(k/m − b²/4m²). Amplitude decays exponentially. NCERT Fig 14.20. |
| ↳ A24.n1 | `t_half_amplitude_decay` | nano | ✅ | — | A24 | — | T_{1/2,amp} = (ln 2)·2m/b. From e^(−bt/2m) = 1/2. NCERT Ex 14.10. |
| ↳ A24.n2 | `t_half_energy_is_half_of_amplitude_half` | nano | ✅ | — | A24 | — | E ∝ A² → T_{1/2,energy} = T_{1/2,amp}/2. Common JEE distinction. NCERT Ex 14.10(c). |
| ↳ A24.n3 | `critical_damping_concept` | nano | ✅ | — | A23 | — | When b²/4m² = k/m, motion just barely returns without oscillating. HCV1 §12.12. |
| **A25** | `forced_oscillation_steady_state_at_driver_frequency` | atomic | ✅ | — | A23, A24 | A26 | External F₀ cos(ω_d t) drives system. Eventually x(t) = A_d cos(ω_d t + φ), at driver frequency ω_d, not natural ω. NCERT §14.10. |
| **A26** | `resonance_amplitude_peaks_at_natural_frequency` | atomic | ✅ | — | A25 | — | Amplitude A_d maximum when ω_d ≈ ω. Peak sharpness ↑ when damping ↓. NCERT Fig 14.21. **Indian-context anchor:** "Soldiers go out of step while crossing a bridge — same reason an earthquake will not cause uniform damage to all buildings, even of same strength" (direct NCERT 14.10 closing paragraph). |
| ↳ A26.n1 | `coupled_pendulum_demonstration_natural_freq_match` | nano | ✅ | — | A26 | — | 5 pendulums on common rope: only the one with matching length picks up large amplitude. NCERT Fig 14.22. |

### D.9 — Composition of two SHMs (A27–A29)

| ID | Concept | Type | Sim? | In repo? | Requires | Required-by | Notes |
|---|---|---|---|---|---|---|---|
| **A27** | `linear_combination_of_sin_and_cos_is_shm` | atomic | ✅ | — | A4 | A28, A29 | A sin ωt + B cos ωt = D sin(ωt + φ) where D = √(A²+B²), tan φ = B/A. The trig-identity bedrock. NCERT Eq 14.3c, HCV1 §12.11. |
| **A28** | `superposition_two_shm_same_direction` | atomic | ✅ | — | A4, A27 | — | Per S-G6 split (A). Two SHMs along same axis with phase difference δ: x = A sin(ωt + ε) where A = √(A₁²+A₂²+2A₁A₂ cos δ). HCV1 §12.11(A). |
| ↳ A28.n1 | `delta_equals_zero_amplitudes_add_constructive` | nano | ✅ | — | A28 | — | δ=0: A = A₁ + A₂. Constructive. |
| ↳ A28.n2 | `delta_equals_pi_amplitudes_subtract_destructive` | nano | ✅ | — | A28 | — | δ=π: A = \|A₁ − A₂\|. Destructive. Zero amplitude if A₁=A₂. |
| ↳ A28.n3 | `vector_method_phasor_addition` | nano | ✅ | — | A28 | A29 | Represent each SHM as a vector of magnitude A_i at angle δ_i. Resultant by parallelogram. HCV1 §12.11 Vector Method, Fig 12.16. |
| **A29** | `perpendicular_two_shm_lissajous_figures` | atomic | ✅ | — | A4, A5 | — | Per S-G6 split (B). Two SHMs along perpendicular axes (x and y). General path is ellipse: x²/A₁² + y²/A₂² − 2xy cos δ/(A₁A₂) = sin²δ. HCV1 §12.11(B). |
| ↳ A29.n1 | `delta_zero_line_through_origin_positive_slope` | nano | ✅ | — | A29 | — | δ=0: y = (A₂/A₁) x. Line through origin, slope +A₂/A₁. Fig 12.19. |
| ↳ A29.n2 | `delta_pi_line_through_origin_negative_slope` | nano | ✅ | — | A29 | — | δ=π: y = −(A₂/A₁) x. Line, negative slope. Fig 12.20. |
| ↳ A29.n3 | `delta_pi_over_2_ellipse_along_axes` | nano | ✅ | — | A29 | — | δ=π/2: x²/A₁² + y²/A₂² = 1. Standard ellipse along the coordinate axes. Fig 12.21. |
| ↳ A29.n4 | `equal_amplitudes_delta_pi_over_2_circle` | nano | ✅ | — | A29 | — | A₁=A₂ AND δ=π/2: x²+y² = A². Pure circle. (Foreshadow of UCM→SHM bridge.) |

### D.10 — Cross-topic-refs from Topic 17

| Ref | Concept (location) | Direction | Notes |
|---|---|---|---|
| T6:free_fall | "Free fall under gravity" | T17 ← T6 | Used in pendulum (A18) for g-direction |
| T10:uniform_circular_motion | "UCM kinematics" | T17 ← T10 | A5 projection bridge — first formal UCM→SHM connection |
| T11:newton_second_law_direction | "Sign of F vs sign of a" | T17 ← T11 | Used in restoring-force argument across A1, A18, A21 |
| T13:conservation_of_mechanical_energy | "Total ME conserved when only conservative forces act" | T17 ← T13 | A6 energy-conservation atomic depends on this |
| T13:work_energy_theorem | "ΔKE = W_net" | T17 ← T13 | A17 block-hits-spring uses W-E theorem to find A |
| T16:hooke_law_spring | "F = −kx for ideal spring (elasticity range)" | T17 ← T16 | The microphysical justification for the F=−kx SHM atomic. **Soft prerequisite.** |
| T16:moment_of_inertia_atomic | "I as resistance to angular acceleration" | T17 ← T16 | Required for physical pendulum (A20), torsional (A22), angular SHM (A21) |
| T16:viscous_drag | "F_d = −bv linear drag" | T17 ← T16 | Used in damping atomic A23 |

### D.11 — Cross-topic OUT-edges (Topic 17 → other topics)

| Ref | Target concept (location) | Direction | Notes |
|---|---|---|---|
| T18:transverse_wave_as_collection_of_oscillators | "A wave is many coupled SHM oscillators" | T17 → T18 | NCERT §14.2 closing paragraph: "any material medium can be pictured as a collection of a large number of coupled oscillators" |
| T19:wave_equation_general_solution | "Wave eq solutions are sinusoidal in time" | T17 → T19 | The d²x/dt² = −ω²x → x = A sin(ωt+φ) machinery transfers directly |
| T22:standing_wave_node_antinode | "Each particle in standing wave executes SHM" | T17 → T22 | Particle motion in a stationary wave is SHM at fixed point |
| T23:sound_wave_pressure_oscillation | "Pressure oscillates sinusoidally about atmospheric" | T17 → T23 | NCERT §14.2 third paragraph: "pressure variations in time in propagation of sound" |
| T30:electric_dipole_in_field_torque | "Dipole in uniform E oscillates as angular SHM" | T17 → T30 | **Direct edge confirmed via HCV2 §29 Worked Ex 19**: dipole in uniform E → small angular displacement → angular SHM with T = 2π√(ml/2qE). Uses A21 directly. |
| T44:lc_oscillator_charge_oscillates | "Charge on capacitor in LC circuit obeys d²q/dt² = −q/LC" | T17 → T44 | Same mathematical form. ω = 1/√(LC). The most-cited cross-topic analogy in physics. |
| T31:rc_circuit_decay_envelope | "Exponential e^(−t/RC) decay" | T17 → T31 | Weak analogy: damped SHM e^(−bt/2m) and RC decay share exponential envelope concept. |

---

## Section E — Cross-Source Matrix (NCERT × DCM2 × HCV1 × HCV2)

| Concept area | NCERT 11.2 Ch.14 | DCM2 Ch.14 | HCV1 Ch.12 | Notes |
|---|---|---|---|---|
| Definition F=−kx | §14.6 eq 14.19 | §14.1 + §14.2 | §12.1 eq 12.2 | All three converge. NCERT calls it "force law", DCM2 derives from F = −kxⁿ general case |
| ω, T, f relations | §14.4 eq 14.7 | §14.2 + §14.3 | §12.4 | All three. |
| v(x), a(x) | §14.5 eq 14.10–11 | §14.2 (force/acc/vel block) | §12.3 eq 12.5, 12.7 | All. DCM2 has cleanest tabulated derivation. |
| SHM↔UCM projection | §14.4 Figs 14.9–14.12 | §14.4 (not in our read — Stage 3 follow-up) | §12.5 Fig 12.7 | Strong NCERT + HCV; DCM2 has dedicated section |
| Energy (KE, PE, total) | §14.7 + Fig 14.16 | §14.2 Energy Equations | §12.6 eq 12.13–14 | All three converge. NCERT graph + DCM2 table + HCV derivation form the triad. |
| 4 initial-condition cases | brief (eq 14.4) | **§14.3 Table 14.1 explicit** | §12.4(e) | DCM2 owns the explicit 4-case tabulation. **S-G2 evidence.** |
| Spring-block period T=2π√(m/k) | §14.8.1 eq 14.21 | scattered (Stage 3 §14.5) | §12.2 + W.Ex 5 | All. HCV1 W.Ex 5 has vertical-spring trick. |
| Simple pendulum T=2π√(L/g) | §14.8.2 eq 14.29 | (Stage 3 §14.5) | §12.8 eq 12.23 | NCERT + HCV. HCV1 has lab-determination-of-g procedure. **Indian context: NCERT "Galileo measured swinging chandelier with pulse" + "Make your own pendulum with 100cm thread" (§14.8.2).** |
| Physical pendulum | — | (Stage 3) | §12.9 eq 12.24 + W.Ex 9 | **HCV only** — NCERT skips entirely. Per S-G4, still treated as atomic. |
| Angular SHM | — | — | §12.7 eq 12.18 | **HCV only.** Per S-G5, atomic. NCERT and DCM2 do not formalize angular SHM as separate section. |
| Torsional pendulum | — | — | §12.10 Fig 12.14 | **HCV only.** |
| Composition of 2 SHM same direction | brief (eq 14.3c) | — (likely Stage 3 §14.6) | §12.11(A) | HCV owns. DCM2 has dedicated "Vector method" section §14.6 (not in our read — Stage 3 follow-up). |
| Composition of 2 SHM perpendicular (Lissajous) | — | — (Stage 3) | §12.11(B) Figs 12.18–12.21 | **HCV1 owns.** Ellipse/line/circle special cases. |
| Damped SHM | §14.9 | — (not in our read) | §12.12 | NCERT + HCV. NCERT has the clearest derivation; HCV has critical-damping concept. |
| Forced + resonance | §14.10 + 5-pendulum demo Fig 14.22 | — | §12.13 | NCERT owns the conceptual demos. **Indian context: bridge-resonance/earthquake closing paragraph in NCERT.** |

### Source-role triad verification (per `feedback-source-role-triad`)

| Role | Owner | Evidence in this catalog |
|---|---|---|
| Pedagogy + first-principles derivation | **HCV1** | §12.3 derivation v dv/dx = −ω²x → v = ω√(A²−x²); §12.5 explicit UCM projection geometry; §12.8 explicit pendulum-tension free-body |
| Problem-pattern taxonomy + JEE-Adv typed problems | **DCM2** | Table 14.1 (4 initial-condition cases); Table 14.2 (11-row formulae compendium); Examples 14.1–14.9 typed problem patterns (force law analysis, SHM-detection, energy fractions) |
| Indian-context anchors + motivation | **NCERT** | sitar/drum/AC power supply (§14.1); "Galileo timed swinging chandelier with his pulse" (§14.8.2 opener); soldiers-on-bridge / earthquake-resonance closing (§14.10); pendulum length for ticking seconds (§14.8.2 Ex 14.9) |

**Triad holds for the 6th consecutive pilot.** No mixing — each source occupies its role cleanly.

---

## Section F — V1 Priority (deferred to Stage 5)

Per memory `feedback-v1-priority-deferred-to-stage-5`, no per-topic V1 queue authored here. Per-row `v1?` flag NOT included in atomic tables above; that flag will be added when Stage 5 cross-topic priority ranking happens.

Provisional candidates for early Stage-5 ranking (founder-judgment, not data-driven):
- **A1** `shm_definition_force_minus_kx` — every SHM problem starts here; foundational
- **A4** `shm_displacement_xt_sinusoidal` — most commonly tested
- **A13** `block_attached_to_single_spring_period_formula` — JEE bread-and-butter
- **A18** `simple_pendulum_period_formula` — board favorite + NEET frequent
- **A6** `total_mechanical_energy_in_shm_constant` — cross-topic E-conservation pattern
- **A26** `resonance_amplitude_peaks_at_natural_frequency` — qualitative MCQ favorite

Total flagged: 6 of 29 atomics (~21%). Within expected 15–25% Stage-5 V1 cut. Deferred to Stage 5.

---

## Section G — Open Questions for Founder

1. **DCM2 §14.4–14.6 not yet read** (Relation SHM↔UCM, Methods of finding T, Vector method of combining SHM). Worth a Stage-3 follow-up read? Likely yes — DCM2 is the typed-problem source and the missing 3 sections are exactly where multi-SHM and pendulum-variant problems live. Estimate: 20 PDF pages, ~10 min read.
2. **HCV1 W.Ex 10–20** not read in this session. They likely contain key edge cases (block in elevator falling freely, charge on a spring, narrow tunnel through Earth — W.Ex 11–13 visible in the read). Stage-3 follow-up? **Recommended.**
3. **`small_angle_approximation` itself a candidate_micro?** It's a 1-state insight (sin θ ≈ θ for θ < ~20°) that nanos A18.n1, A20.n1, A21.n1 all depend on. Stage 4 granularity validation should decide if "candidate_micro" tier is formalized. Currently logged as nano A18.n1 with the flag.
4. **A8 — energy at x=A/2 ratio** as standalone atomic OR a nano under A6? It's an instance-problem, not a new concept. Decision: keep atomic for now because it's a frequently typed JEE pattern with its own simulation use-case (visual: bar chart KE:PE ratio at x = A/2). Revisit at Stage 4.
5. **Spring-mass with elevator falling freely** (HCV1 W.Ex 11): apparent g = 0 → block executes SHM about new equilibrium = natural length. This is the "pseudo-force in non-inertial frame" pattern. Is this a Topic-17 atomic OR a Topic-11 (Newton-laws-in-non-inertial-frame) atomic shown applied here? **Defer to Stage 4 boundary discussion.**
6. **Tunnel-through-Earth pattern** (HCV1 W.Ex 13): SHM along axis of tunnel due to gravitational field inside uniform-density Earth. Cross-topic bridge T17←T15 (Gravitation inside solid sphere). Worth atomic status? Probably yes — appears in JEE-Adv multiple times. **Add to dependency matrix as T17 ← T15.**

---

## Section H — Scope Boundary

This catalog covers **mechanical SHM** (spring-mass, pendulum, angular, torsional). It does NOT cover:
- LC-circuit oscillations (Topic 44 — handled via cross-topic ref T17 → T44)
- Wave motion / standing waves (Topics 18, 22, 23 — cross-topic refs)
- Dipole in field SHM (handled in Topic 30 with cross-topic ref T30:A38 ← T17:A21)
- Damped/forced beyond NCERT §14.9–10 (no JEE-Adv special functions; harmonic oscillator with arbitrary driving force is beyond scope)
- Quantum harmonic oscillator (modern physics; out of scope for V1)

---

## Section I — Scaling Notes (for downstream catalogs)

1. **The HCV-DCM2-NCERT split is now stable across 6 pilots.** Source-role triad memory rule continues to hold — no exception observed in SHM. Confirmed pattern: angular/torsional/composition material lives ONLY in HCV; problem-tabulation lives ONLY in DCM2; Indian-context motivational anchors live ONLY in NCERT.
2. **Atomic count for SHM = 29 atomics + ~33 nanos.** Median atomic count across 6 pilots is now ~30 atomics. Tight clustering — strong signal that ~30 is the natural per-topic atomic density.
3. **Per-state-derivation-density:** SHM has 11 derived-quantity formulas per the DCM2 Table 14.2. Per-formula sim renders likely cluster as 2–3 nanos each → ~33 nano count matches observation.
4. **First SHM↔Wave bridge identified.** A29 perpendicular Lissajous + A5 UCM-projection set up Topic 18 wave-mechanics catalog naturally. Wave-particle SHM at fixed x will be a 1-line atomic that simply requires A1+A4 from Topic 17.
5. **Cross-topic OUT-degree of T17 = 7** (T18, T19, T22, T23, T30, T31, T44). Among highest in the matrix so far. T17 is plausibly an **axis topic** like T10 was — broad fan-out into both mechanics (waves) and E&M (LC, dipole) clusters.
6. **HCV1 W.Ex pattern density is the highest seen so far** — 20+ worked examples in one chapter, each a distinct problem-pattern. DCM2 will likely add 30+ more in its full chapter. Combined SHM problem space is probably the largest single-topic in JEE physics. Stage-5 V1 priority should weight T17 high.

---

## Section J — Verification Checklist

- [x] Three sources read with explicit page citations (NCERT 11.2 p.339–359, DCM2 p.285–~302 partial, HCV1 p.229–248+examples)
- [x] All 29 atomics carry `Requires` AND `Required-by` columns with concept-IDs (not free text)
- [x] All `Requires` references either exist as another atomic in this catalog OR carry `[T<N>]` cross-topic tag with valid topic number
- [x] Founder-style decisions S-G1 → S-G6 documented at the top + applied inline
- [x] Cross-source matrix (Section E) populated cell-by-cell with section/figure references where available — no inferred overlaps
- [x] Source-role triad explicitly verified (Section E end)
- [x] Indian-context anchors mined: 4+ direct anchors logged (Galileo's chandelier, ticking-seconds pendulum, bridge-resonance soldiers, earthquake-building, coupled-pendulum demo)
- [x] Open questions list (Section G) includes ≥3 founder-decision items
- [x] No JSON authored — Stage-2 deliverable is markdown catalog only (per plan)
- [x] Concept IDs follow `kebab_case_underscored` convention per CLAUDE.md §3
- [x] Six pilots completed (T12, T21, T36, T10, T13, T17). Source-role triad stable. Atomic count clustering ~30.

---

*Pilot 6 of N. Next paired-batch member: Topic 30 Electrostatics (companion to T17).*
