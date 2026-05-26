# Pilot Topic 15 — Rotational Mechanics, Moment of Inertia & Torque

> Stage-2 pilot catalog. 30th of 44. **Mechanics cluster CLOSER** (final Mechanics topic; sibling: T18 Elasticity opens Mechanical Properties cluster in same session paired-batch).
> Sources: **NCERT Class 11 Part 1 Ch.7 System of Particles and Rotational Motion §7.6-7.14** (canonical spine — the rotational subset; §7.2-7.5 is T14 territory) + **HCV Vol 1 Ch.10 Rotational Mechanics** (derivation/pedagogy — 20 sub-sections, deepest single-chapter treatment) + **DC Pandey Mechanics Vol 2 Ch.12 Rotational Mechanics** (problem patterns — 13 sub-sections, ~120 pages).
> Coverage class: **TRIPLE-COVERED**.
> Anchor density: **STRONG** (under formalised criterion) — 12 anchors × 7 strands. Closer to VERY-STRONG borderline than T11 (broader institutional coupling: ISRO satellite attitude control + Indian Railways turbine + automotive flywheels + windmill industry + sports + dance/Bharatnatyam pirouette + military). **9th data point in foundational-mechanics anchor-bucket signal.**
> **Critical role:** Rotational Mechanics absorbs back-edges from EVERY linear-mechanics topic (T10 Circular Motion, T11 Newton's Laws, T13 Work-Energy, T14 Momentum/Collisions, T16 Gravitation, T17 SHM via torsional pendulum) PLUS forwards strongly into E&M (T35 EM Induction → rotating coil; T36 Moving Charges → magnetic dipole moment as angular momentum analog; T37 Magnetism & Matter → angular momentum quantisation in atoms). **At Stage-2 closure, forecasted IN-degree: ~10-12 — clearer secondary Mechanics hub than T17 SHM.**

---

## Founder Decisions Applied

| Tag | Decision |
|---|---|
| **RM-G1** | Atomic granularity = "one rotational-quantity OR one rotational-law OR one canonical rotational-application." Angular velocity, angular acceleration, torque, angular momentum = 4 separate atomics (each is the rotational analog of a distinct linear quantity). |
| **RM-G2** | **Moment of inertia I = Σmᵢrᵢ² is ONE atomic** (`moment_of_inertia_atomic`) bundling discrete-particles formula + continuous-body integration + parallel-axis theorem + perpendicular-axis theorem. Reason: I is the rotational mass; all four sub-concepts are operationally inseparable when computing I for any real body. **cognitive_error_target:** "I is a property of the body" → I depends on the AXIS chosen (same body has different I for different axes). |
| **RM-G3** | **Rotational kinematics is its own atomic** (`rotational_kinematics_atomic`) — ω = dθ/dt, α = dω/dt, ω = ω₀ + αt, θ = ω₀t + ½αt², ω² = ω₀² + 2αθ. **Mirrors T6 Kinematics 1D atomic structure.** Rotational analog of linear kinematics — keep parallel formulation visible. |
| **RM-G4** | **Torque is its own atomic** (`torque_atomic`) — τ = r × F (vector form); τ = rF sin θ (magnitude); torque is to angular motion what force is to linear motion. **Cross-link to T36 Moving Charges atomic τ = m × B for magnetic-dipole torque.** |
| **RM-G5** | **Newton's 2nd law for rotation is its own atomic** (`tau_eq_i_alpha_atomic`) — τ_net = Iα; central quantitative law of rotational dynamics. **Diamond candidate** — torque-vs-angular-acceleration sim is one of physics' most pedagogically compelling visualizations. |
| **RM-G6** | **Angular momentum L = Iω = r × p is its own atomic** (`angular_momentum_atomic`); conservation of angular momentum is its own atomic (`conservation_of_angular_momentum_atomic`) — split because conservation has its own derivation (from τ_ext = 0) + own boundary conditions + own applications (pirouette, planetary orbit, gyroscope precession). |
| **RM-G7** | **Rolling motion (pure rolling without slipping) is its own atomic** (`pure_rolling_atomic`) with v_CoM = Rω constraint + KE_total = ½mv² + ½Iω² + friction-as-static-not-kinetic. **cognitive_error_target:** "rolling friction = kinetic friction" → static friction provides the rotational coupling; kinetic friction only when slipping. Among the densest-misconception sub-topics in Class 11. |
| **RM-G8** | **Rotational work-energy theorem is its own atomic** (`rotational_work_energy_atomic`) — W = τ·θ; KE_rotational = ½Iω². Bridges T13 Work-Energy linear treatment to rotational case. |
| **RM-G9** | **Rolling-down-incline + rolling-with-friction = ONE atomic** (`rolling_on_incline_atomic`) with sphere-vs-cylinder-vs-ring race-down-incline as nano. **Diamond candidate** — the iconic Class 11 demo (ball-vs-ring-vs-disc sliding down ramp). |
| **RM-G10** | **Torsional pendulum is its own atomic** (`torsional_pendulum_atomic`) — bridges to T17 SHM with rotational analog (angular SHM with τ = −κθ, ω² = κ/I). Cross-link to T37 Magnetism & Matter dipole-in-field angular SHM. |
| **RM-G11** | **STRONG anchor (formalised criterion)** — 12 anchors × 7 strands. Borderline VERY-STRONG (one strand below threshold). **9th data point confirming foundational-mechanics-plateaus-at-STRONG.** Decision: STRONG. Strong industrial coupling (windmill turbines + flywheels + ISRO attitude control) but lacks single dominant institutional anchor like NTPC-for-thermodynamics. |
| **RM-G12** | **Cognitive-error-prevention sub-category — 5 instances** (RM-G2 I-depends-on-axis; RM-G7 rolling-friction-is-static; RM-G6 angular-momentum-vector-direction; RM-G4 torque-arm-perpendicular; RM-G3 rotational-direction-sign-conventions). Founder-decision share: 5/12 = 42%. Above 35% threshold; high-misconception-density chapter; elevated EPIC-L authoring gate applies. **Confirms Mechanics cluster as the densest-misconception cluster across Stage-2.** |

---

## Section A — Source Map

| Sub-topic | NCERT 11.1 Ch.7 §7.6-7.14 | HCV V1 Ch.10 | DCM2 Ch.12 |
|---|---|---|---|
| Rigid body + rotation about fixed axis | §7.6 | §10.1 | §12.1 |
| Angular velocity + angular acceleration | §7.7 | §10.2 | §12.2 |
| Rotational kinematics (ω = ω₀ + αt, etc.) | §7.8 | §10.3 | §12.3 |
| Torque + angular momentum | §7.9 | §10.4 + §10.5 | §12.4 |
| Moment of inertia | §7.10 | §10.6 + §10.7 | §12.5 |
| Theorems (parallel + perpendicular axis) | §7.11 | §10.8 | §12.6 |
| Newton's 2nd law for rotation (τ = Iα) | §7.12 | §10.9 | §12.7 |
| Rotational kinetic energy (½Iω²) | §7.13 (boxed) | §10.10 | §12.8 |
| Rolling motion (pure rolling) | §7.13 | §10.11 + §10.12 | §12.9 |
| Conservation of angular momentum | §7.14 | §10.13 | §12.10 |
| Torsional pendulum | (NCERT-not-covered) | §10.14 | §12.11 |
| Gyroscope + precession | (NCERT-light) | §10.18 | §12.12 |
| Compound bodies + rolling on incline | §7.13 (Ex 7.16) | §10.15-10.17 | §12.13 |

**NCERT §7.6-7.14 is ~22 pages**; deepest in §7.10-7.12 (moment of inertia + theorems + τ = Iα). **HCV Ch.10 is the deepest single-chapter treatment in all of HCV1** (20 sub-sections, ~36 pages). DCM2 Ch.12 carries problem-pattern depth. **Same NCERT-omission pattern as T11/T14**: torsional pendulum + gyroscope precession NCERT-not-covered; JEE-Advanced staple in HCV+DCM.

---

## Section B — Atomic + Nano Catalog

| ID | Concept | Type | Sim? | In repo? | Requires | Required-by | Notes |
|---|---|---|---|---|---|---|---|
| **rigid_body_rotation_atomic** | Rigid body = all internal distances constant; rotation about fixed axis = every point traces a circle of fixed radius around axis | atomic | ✅ | — | [vector_resolution(T5)] | [rotational_kinematics_atomic, moment_of_inertia_atomic, torque_atomic] | Foundational; defines the rotational system |
| ↳ rotation_axis_vs_translation_nano | Pure rotation = points trace circles around fixed axis (axis is stationary). Pure translation = all points have same velocity. General motion = translation + rotation about CoM | nano | ✅ | — | [rigid_body_rotation_atomic, centre_of_mass_atomic(T14)] | — | parent: rigid_body_rotation_atomic |
| **rotational_kinematics_atomic** | ω = dθ/dt; α = dω/dt; ω = ω₀ + αt; θ = ω₀t + ½αt²; ω² = ω₀² + 2αθ. **Rotational analog of T6 linear kinematics.** | atomic | ✅ | — | [rigid_body_rotation_atomic, calculus_derivative(math-tools)] | [tau_eq_i_alpha_atomic, rolling_on_incline_atomic] | RM-G3; **cognitive_error_target:** "angular and linear kinematics are different physics" → same math, different variables (mass↔I; F↔τ; v↔ω; a↔α) |
| ↳ omega_v_eq_omega_r_relation_nano | Linear velocity of point at radius r: v = ωr. Linear acceleration tangential: a_t = αr. Linear acceleration centripetal: a_c = ω²r. **Three relations bridging linear ↔ angular.** | nano | ✅ | — | [rotational_kinematics_atomic, circular_motion(T10)] | — | parent: rotational_kinematics_atomic |
| **moment_of_inertia_atomic** | I = Σmᵢrᵢ² (discrete); I = ∫r² dm (continuous). I is "rotational mass" — resists change in rotational motion. **DEPENDS ON CHOSEN AXIS.** | atomic | ✅ | — | [rigid_body_rotation_atomic, calculus_integration(math-tools)] | [tau_eq_i_alpha_atomic, rotational_work_energy_atomic, angular_momentum_atomic] | RM-G2; **Diamond candidate**; **cognitive_error_target:** "I is a property of body alone" → I depends on the AXIS |
| ↳ i_for_canonical_bodies_nano | Solid sphere: I = (2/5)MR². Hollow sphere: (2/3)MR². Disc/cylinder about axis: ½MR². Ring: MR². Rod about end: ML²/3. Rod about centre: ML²/12. **Table for V1 reference.** | nano | ✅ | — | [moment_of_inertia_atomic] | [rolling_on_incline_atomic] | parent: moment_of_inertia_atomic; **canonical-formulas table** |
| ↳ parallel_axis_theorem_nano | I_parallel = I_CoM + Md²; moment of inertia about any axis parallel to CoM-axis equals I_CoM + (mass × distance²). Allows computing I about arbitrary axis. | nano | ✅ | — | [moment_of_inertia_atomic, centre_of_mass_atomic(T14)] | — | parent: moment_of_inertia_atomic |
| ↳ perpendicular_axis_theorem_nano | For PLANAR body in xy-plane: I_z = I_x + I_y. Only valid for thin laminar (planar) bodies; not for 3D solids. **cognitive_error_target:** "perpendicular-axis applies to all bodies" → planar only. | nano | ✅ | — | [moment_of_inertia_atomic] | — | parent: moment_of_inertia_atomic |
| **torque_atomic** | τ = r × F (vector form); τ = rF sin θ (magnitude); τ is to angular motion what F is to linear motion. SI unit: N·m | atomic | ✅ | — | [rigid_body_rotation_atomic, vector_cross_product(math-tools), newton_second_law_atomic(T11)] | [tau_eq_i_alpha_atomic, angular_momentum_atomic, conservation_of_angular_momentum_atomic] | RM-G4; **cross-link to T36 magnetic dipole torque** |
| ↳ moment_arm_lever_arm_nano | τ = F × d_perpendicular = F × (r sin θ). Moment arm = perpendicular distance from axis to line-of-action of force. **cognitive_error_target:** "torque = r·F always" → r sin θ matters; force ALONG r contributes ZERO torque | nano | ✅ | — | [torque_atomic] | — | parent: torque_atomic; RM-G12 cognitive_error_target |
| ↳ couples_two_equal_opposite_forces_nano | Pair of equal-opposite forces with separation d: net force = 0; net torque = F·d (independent of axis choice). Door-handle, wrench-on-bolt examples | nano | ✅ | — | [torque_atomic] | — | parent: torque_atomic |
| **tau_eq_i_alpha_atomic** | τ_net = Iα; central quantitative law of rotational dynamics. Rotational analog of F_net = ma | atomic | ✅ | — | [torque_atomic, moment_of_inertia_atomic, rotational_kinematics_atomic, newton_second_law_atomic(T11)] | [rolling_on_incline_atomic, torsional_pendulum_atomic, rotational_work_energy_atomic] | RM-G5; **Diamond candidate** |
| ↳ rotational_vs_linear_table_nano | Side-by-side table: m↔I, F↔τ, v↔ω, a↔α, F=ma↔τ=Iα, p=mv↔L=Iω, KE=½mv²↔KE=½Iω². **Cognitive scaffold nano.** | nano | ✅ | — | [tau_eq_i_alpha_atomic] | — | parent: tau_eq_i_alpha_atomic; conceptual scaffold |
| **rotational_work_energy_atomic** | W_torque = ∫τ dθ; rotational KE = ½Iω²; total KE for rolling = ½mv² + ½Iω². Bridges T13 Work-Energy linear treatment | atomic | ✅ | — | [tau_eq_i_alpha_atomic, work_energy_theorem(T13)] | [rolling_on_incline_atomic, pure_rolling_atomic] | RM-G8 |
| **angular_momentum_atomic** | L = Iω (rotational) = r × p (general); SI unit: kg·m²/s; vector quantity; direction by right-hand rule along ω | atomic | ✅ | — | [torque_atomic, moment_of_inertia_atomic, rotational_kinematics_atomic] | [conservation_of_angular_momentum_atomic, torsional_pendulum_atomic, magnetic_dipole_moment(T36)] | RM-G6; **cognitive_error_target:** "L is a scalar" → L is a vector along the rotation axis |
| ↳ l_eq_r_cross_p_nano | For a single particle: L = r × p; for system: L_total = Σ(rᵢ × pᵢ); axis-independent definition | nano | ✅ | — | [angular_momentum_atomic, vector_cross_product(math-tools)] | — | parent: angular_momentum_atomic |
| **conservation_of_angular_momentum_atomic** | When no external torque acts (τ_ext = 0): L_total = constant. Derivation: τ_ext = dL/dt = 0 → L = const. **Pirouette, planetary Kepler-2, gyroscope-stability all apply** | atomic | ✅ | — | [angular_momentum_atomic, torque_atomic] | [pirouette_application_nano, keplers_2nd_law_application_nano(T16)] | RM-G6 |
| ↳ pirouette_application_nano | Ice-skater / Bharatnatyam dancer pirouette: arms pulled in → I decreases → ω increases (L = Iω constant). Indian classical-dance everyday observation | nano | ✅ | — | [conservation_of_angular_momentum_atomic] | — | parent: conservation_of_angular_momentum_atomic; **dance/sports-strand anchor: Bharatnatyam + ice-skating + gymnastics** |
| ↳ isro_satellite_attitude_control_nano | Geostationary satellites use reaction-wheel-based attitude control: spinning wheel inside satellite changes satellite's angular momentum; ISRO INSAT/GSAT/Cartosat all use this | nano | ✅ | — | [conservation_of_angular_momentum_atomic] | — | parent: conservation_of_angular_momentum_atomic; **space-strand anchor: ISRO** |
| ↳ keplers_2nd_law_planetary_nano | Law of equal areas: planets sweep equal areas in equal times → dA/dt = L/2m = constant (when L conserved under central force). Cross-link to T16 Gravitation | nano | ✅ | — | [conservation_of_angular_momentum_atomic, gravitation(T16)] | — | parent: conservation_of_angular_momentum_atomic; cross-link to T16 |
| **pure_rolling_atomic** | Rolling without slipping: v_CoM = Rω (constraint); contact-point velocity = 0 instantaneously; STATIC friction (not kinetic) provides the rotational coupling | atomic | ✅ | — | [rotational_kinematics_atomic, omega_v_eq_omega_r_relation_nano, friction_force_atomic(T11), centre_of_mass_atomic(T14)] | [rolling_on_incline_atomic, total_ke_rolling_nano] | RM-G7; **cognitive_error_target:** "rolling friction is kinetic" → static (contact-point momentarily at rest) |
| ↳ contact_point_instantaneous_rest_nano | Rolling-without-slipping condition: v_CoM − Rω = 0 → contact point has zero velocity at any instant. **Diamond visualisation candidate**: trace path of contact point = cycloid | nano | ✅ | — | [pure_rolling_atomic] | — | parent: pure_rolling_atomic |
| ↳ total_ke_rolling_nano | KE_total = KE_translation + KE_rotation = ½mv_CoM² + ½Iω² = ½mv² + ½I(v/R)² = ½v²(m + I/R²). Larger I/R² → more KE in rotation | nano | ✅ | — | [pure_rolling_atomic, rotational_work_energy_atomic] | — | parent: pure_rolling_atomic |
| **rolling_on_incline_atomic** | Body rolling without slipping down incline angle θ: a_CoM = g sin θ / (1 + I/(mR²)); time-to-bottom depends on I/(mR²) ratio. **Solid sphere < disc < hollow sphere < ring** | atomic | ✅ | — | [pure_rolling_atomic, tau_eq_i_alpha_atomic, block_on_incline_atomic(T11), i_for_canonical_bodies_nano] | — | RM-G9; **Diamond candidate** — sphere-vs-disc-vs-ring race-down-incline sim |
| ↳ rolling_race_demonstration_nano | Race down same incline: solid sphere wins (smallest I/mR² = 2/5); disc 2nd (1/2); hollow sphere 3rd (2/3); ring last (1.0). Iconic Class 11 demo | nano | ✅ | — | [rolling_on_incline_atomic, i_for_canonical_bodies_nano] | — | parent: rolling_on_incline_atomic |
| **torsional_pendulum_atomic** | Disc suspended by wire with torsional rigidity κ: τ = −κθ → I·d²θ/dt² = −κθ → angular SHM with ω² = κ/I; T = 2π√(I/κ) | atomic | ✅ | — | [tau_eq_i_alpha_atomic, simple_harmonic_motion(T17), angular_shm_equation(T17)] | — | RM-G10; **bridges to T17 SHM**; cross-link to T37 dipole-in-field angular SHM; NCERT-not-covered (HCV+DCM only) |
| **flywheel_application_atomic** | Wheel with large I stores rotational KE = ½Iω² and smooths angular-velocity fluctuations. Automotive engine flywheel, power-plant turbine inertia, KERS (Kinetic Energy Recovery System) all use this | atomic | ✅ | — | [moment_of_inertia_atomic, rotational_work_energy_atomic] | — | **Diamond candidate**; industry anchor; cross-link to T26 Thermodynamics IC engines |

**Atomic count:** 13. **Nano count:** ~14. **Total entries:** 27.

---

## Section C — Cross-Source Coverage Matrix

| Atomic | NCERT 11.1 Ch.7 §7.6-7.14 | HCV V1 Ch.10 | DCM2 Ch.12 | Coverage |
|---|---|---|---|---|
| rigid_body_rotation_atomic | §7.6 | §10.1 | §12.1 | TRIPLE |
| rotational_kinematics_atomic | §7.7 + §7.8 | §10.2 + §10.3 | §12.2 + §12.3 | TRIPLE |
| moment_of_inertia_atomic | §7.10 + §7.11 | §10.6-§10.8 | §12.5 + §12.6 | TRIPLE |
| torque_atomic | §7.9 | §10.4 | §12.4 | TRIPLE |
| tau_eq_i_alpha_atomic | §7.12 | §10.9 | §12.7 | TRIPLE |
| rotational_work_energy_atomic | §7.13 (boxed) | §10.10 | §12.8 | TRIPLE |
| angular_momentum_atomic | §7.9 | §10.5 | §12.4 | TRIPLE |
| conservation_of_angular_momentum_atomic | §7.14 | §10.13 | §12.10 | TRIPLE |
| pure_rolling_atomic | §7.13 | §10.11 | §12.9 | TRIPLE |
| rolling_on_incline_atomic | §7.13 (Ex 7.16) | §10.15-§10.17 | §12.13 | TRIPLE |
| torsional_pendulum_atomic | (NCERT-not-covered) | §10.14 | §12.11 | **DUAL (HCV+DCM only)** |
| flywheel_application_atomic | §7.13 (Ex implicit) | §10.10 (boxed) | §12.8 (boxed) | TRIPLE (NCERT-implicit) |

**Triple-coverage rate:** 11 of 12 atomics = **92%** with 1 DUAL atomic (torsional_pendulum_atomic — NCERT-not-covered, JEE-Advanced staple). **Reverts toward 100% after the T14 streak-break.** Mostly-TRIPLE pattern continues; same NCERT-omission pattern as T11/T14/T26 (foundational chapters omit JEE-Advanced material). **Pattern signal extended: T11 (1 NCERT-light atomic), T14 (3 DUAL atomics), T15 (1 DUAL atomic) — Mechanics cluster collectively has 5 NCERT-omitted JEE-Advanced atomics.** Recommend Stage-4 "triple-coverage-with-NCERT-omission" sub-tier from Session 50 still pending — this batch confirms the need.

---

## Section D — Stage-3 Math-Tool Dependencies

| Math-tool primitive | Used by | Status |
|---|---|---|
| `vector_cross_product` | torque_atomic, angular_momentum_atomic, l_eq_r_cross_p_nano | REQUIRED (T36 validated) |
| `calculus_derivative` (dω/dt) | rotational_kinematics_atomic | REQUIRED |
| `calculus_integration` (∫r² dm for I; ∫τ dθ for W) | moment_of_inertia_atomic, rotational_work_energy_atomic | REQUIRED |
| `vector_resolution` (incline-angle decomposition for rolling-on-incline) | rolling_on_incline_atomic | REQUIRED |
| `angular_shm_equation` (d²θ/dt² = −ω²θ) | torsional_pendulum_atomic | REQUIRED (T17 + T37 validated) |
| `system_of_linear_equations_2var` (rolling: F=ma + τ=Iα simultaneous) | rolling_on_incline_atomic | REQUIRED (T11 just-registered; **2nd cross-domain validation in same-batch — T15 confirms**) |

**ZERO new stubs registered.** All primitives REQUIRED. `system_of_linear_equations_2var` validated for the 3rd time (T11 → T14 → T15 in 2 sessions — fastest cross-domain stabilisation observed). Math-tools IN-degree unchanged: **51**.

---

## Section E — Cross-Topic Dependencies (Bidirectional Edges)

### Outgoing (T15 requires from earlier topics)

| Target topic | Edge | Reason |
|---|---|---|
| T5 Vectors | torque_atomic + angular_momentum_atomic ← vector_cross_product | Fundamental |
| T6 Kinematics 1D | rotational_kinematics_atomic ← mirrors linear-kinematics structure | Pedagogical mirror |
| T10 Circular Motion | omega_v_eq_omega_r_relation_nano ← uniform circular motion atomics | Direct extension |
| T11 Newton's Laws (back-edge) | tau_eq_i_alpha_atomic ← F = ma rotational analog; pure_rolling_atomic ← friction_force_atomic | T11 → T15 closes anticipated rotational-analog edge |
| T13 Work-Energy (back-edge) | rotational_work_energy_atomic ← W = ∫F·dx generalisation | T13 → T15 closes anticipated rotational work-energy edge |
| T14 Momentum/Collisions (back-edge) | l_eq_r_cross_p_nano ← linear_momentum atomic generalisation; conservation_of_angular_momentum_atomic ← conservation_of_momentum analog | T14 → T15 closes anticipated angular-analog edges |
| T16 Gravitation (back-edge bidirectional) | keplers_2nd_law_planetary_nano ↔ Kepler's law of equal areas | T16 already cited L-conservation in catalog; closes loop |
| T17 SHM (back-edge bidirectional) | torsional_pendulum_atomic ↔ angular SHM with τ = −κθ | T17 A21 closed; this batch fully formalises |
| **T18 Elasticity (intra-session)** | torque + I ↔ stress + Young's modulus (analogous mechanical-response framework) | Weak bidirectional intra-session |
| Math-tools | 6 primitives, zero new stubs | Math-tools file fully stable for Mechanics cluster |

### Incoming (T15 will be required by later topics)

| Source topic | Edge | Reason |
|---|---|---|
| T19/T20 Fluids + waves (future) | rotational concepts in fluid-rotation, vortex-formation | Future forward |
| T35 EM Induction (back-edge) | rotating coil ← rotational_kinematics + angular_velocity_omega | **Closes** T35 rotating-coil anticipated forward (Session 46) |
| T36 Moving Charges (back-edge) | magnetic_dipole_moment_atomic ← angular_momentum_atomic; torque-on-current-loop ← torque_atomic | **Closes** T36 anticipated forward (Session 36) — among the longest-lagged forward-edges, 14-session lag |
| T37 Magnetism & Matter (back-edge) | quantisation of angular momentum ← angular_momentum_atomic (NMR foundations); torsional pendulum analog for dipole-in-field angular SHM ← torsional_pendulum_atomic | **Closes** T37 anticipated forward (Session 48) |
| T47 Atomic Models (back-edge) | Bohr quantisation L = nℏ ← angular_momentum_atomic | **Closes** T47 angular-momentum quantisation anticipated forward (Session 43) |
| T48 Nuclei (back-edge) | nuclear spin ← angular_momentum_atomic (concept) | Weak back-edge |

### T15 ↔ T18 intra-session bidirectional edges

This paired-batch is the **first cross-cluster paired-batch in many sessions** (T15 closes Mechanics; T18 opens Mechanical Properties of Solids). Expected edge density: **3-4 edges (cross-cluster paired-pair band, per Stage-4 formalised density rule).** Observed:

| T15 atomic | ↔ | T18 atomic | Edge type |
|---|---|---|---|
| `torque_atomic` | → | `shear_stress_atomic` (T18) | Bridges (shear stress = tangential-force analog of torque applied to material) |
| `moment_of_inertia_atomic` | ↔ | `youngs_modulus_atomic` (T18) | Weak analogy (both characterise resistance to deformation) |
| `torsional_pendulum_atomic` | ↔ | `modulus_of_rigidity_atomic` (T18) | Bidirectional (κ in torsional pendulum is determined by shear modulus of wire) |
| `rigid_body_rotation_atomic` | ↔ | `rigid_body_idealisation_atomic` (T18, implicit) | Conceptual bridge (T18 elasticity = breaking the rigid-body idealisation) |

**4 bidirectional edges = cross-cluster paired-batch band (2-4 range).** First Mechanics-to-Mechanical-Properties cross-cluster pair. Matches density-rule prediction.

**Total outgoing: 10 cross-topic + 6 math-tools (zero new stubs).** **Total incoming: 5+ anticipated forward-edge closures + 4 intra-session bidirectional.** **T15 IN-degree post-session: ~8-10 — clearer secondary Mechanics hub than T17 SHM.**

---

## Section F — Real-World Anchors (STRONG, Indian-context)

| Anchor | Concept hook | Authoring use | Strand |
|---|---|---|---|
| **ISRO satellite attitude control (INSAT, GSAT, Cartosat, Chandrayaan, Mangalyaan)** | conservation_of_angular_momentum_atomic, isro_satellite_attitude_control_nano | "ISRO satellites use reaction wheels for attitude control; spinning wheel inside satellite changes satellite's angular momentum" | Space |
| **Indian classical dance — Bharatnatyam pirouette + Kathak chakkars** | conservation_of_angular_momentum_atomic, pirouette_application_nano | "Arms pulled in → I decreases → ω increases; canonical Indian-classical-dance technique" | Sports / Culture |
| **Vande Bharat + WAP-7 traction motors (Indian Railways)** | tau_eq_i_alpha_atomic, flywheel_application_atomic | "AC traction motor produces torque on wheel-axle; torque × ω = power output; modern Indian locomotives" | Transport / Industry |
| **Indian wind-energy industry (Suzlon, ReGen Powertech, Inox Wind)** | tau_eq_i_alpha_atomic, moment_of_inertia_atomic, conservation_of_angular_momentum_atomic | "Wind turbines: blade-rotation drives generator; large I = blade-design + smooth operation; Suzlon ~12 GW installed capacity" | Industry + Renewable Energy |
| **Automotive flywheels + KERS (Indian automotive — Maruti, Tata, Mahindra + Tata Motors KERS in Indian buses)** | flywheel_application_atomic, rotational_work_energy_atomic | "Flywheel stores rotational KE = ½Iω²; smooths engine power delivery; KERS recovers braking energy" | Industry / Consumer Transport |
| **Sports — Indian cricket bowling action + spin (Anil Kumble + R. Ashwin + Ravindra Jadeja)** | torque_atomic, conservation_of_angular_momentum_atomic | "Bowling spin: torque on ball at delivery → ball rotates → Magnus effect creates curve. Iconic Indian-cricket bowling moments." | Sports |
| **Sports — Indian gymnastics + diving (Dipa Karmakar) + figure skating** | conservation_of_angular_momentum_atomic, pirouette_application_nano | "Tucked vs extended body during somersault: I changes ~10×; ω changes accordingly" | Sports |
| **Bullock-cart wheel + traditional Indian potter's wheel + Ferris wheel (Mumbai, Bengaluru)** | rigid_body_rotation_atomic, rotational_kinematics_atomic | "Potter's wheel = paradigmatic rotational motion; rigid-body rotation about fixed axis" | Cultural / Residential |
| **BHEL turbines (Bhopal, Hyderabad, Trichy) — hydroelectric + thermal + nuclear** | rotational_kinematics_atomic, tau_eq_i_alpha_atomic, flywheel_application_atomic | "Turbine rotors: large I → smooth rotation despite uneven steam/water flow; BHEL manufactures rotors for NTPC + NPCIL + Indian Railways" | Industry |
| **HAL helicopter blade dynamics (Dhruv, Rudra, LCH)** | conservation_of_angular_momentum_atomic, gyroscope_precession (RM-G nano-extension) | "Helicopter main rotor: large angular momentum; precession effects in maneuvers; HAL Bangalore designs" | Aviation / Defence |
| **Indian Naval gyroscopic stabilisers (INS Vikrant + Vikramaditya)** | conservation_of_angular_momentum_atomic | "Ship gyroscopic stabiliser: spinning rotor with huge L resists rolling motion; INS Vikrant Cochin-built carrier" | Defence / Navy |
| **DRDO + Indian missile guidance (Akash, Prithvi, Agni)** | conservation_of_angular_momentum_atomic, gyroscope | "Missile inertial-navigation uses gyroscopes; angular momentum preservation guides flight path" | Defence |

**Total: 12 distinct institutional/system anchors across 7 strands** (space, sports/culture, transport, industry-renewable, industry-traditional, consumer-transport, aviation, defence, navy — count 7-8 if culture counted distinct from sports). **Falls below VERY-STRONG strand-diversity threshold of 8.** **Decision (RM-G11): STRONG**. **9th data point confirming the foundational-mechanics-plateaus-at-STRONG pattern.** Rotational mechanics has broad-and-moderate institutional coupling (especially industry-renewable + space + defence) but lacks the policy + healthcare + telecom strands that push thermodynamics + AC + communication systems to VERY-STRONG.

---

## Section G — Cognitive-Error-Prevention Decisions (Stage-4 first-class field active)

**5 of 12 founder decisions are cognitive-error-prevention type = 42%.** Above 35% threshold. High-misconception-density chapter; elevated EPIC-L gate applies.

| Tag | cognitive_error_target | Countermeasure |
|---|---|---|
| **RM-G2** | "I is a property of body alone" | Author explicit "I depends on axis" with multi-axis-of-same-body sub-state |
| **RM-G3** | "angular/linear kinematics are different physics" | Mandatory `rotational_vs_linear_table_nano` (m↔I, F↔τ, v↔ω, a↔α) |
| **RM-G4** | "torque = r·F always" | Mandatory `moment_arm_lever_arm_nano` clarifying r sin θ; force-along-r contributes ZERO |
| **RM-G6** | "L is scalar" | Author L as vector along axis; right-hand rule for direction |
| **RM-G7** | "rolling friction is kinetic" | Mandatory pure_rolling_atomic with explicit static-friction-condition |

Plus implicit: `perpendicular_axis_theorem_nano` cognitive_error_target ("perpendicular-axis applies to all bodies" → planar only).

**Cognitive-error-prevention combined Session 51 (with T18): see T18 catalog for combined session share.** T15 alone at 42% sustains the Mechanics-cluster-densest-misconception signal.

---

## Section H — V1 Priority Flags

| Atomic | V1? | Reason |
|---|---|---|
| moment_of_inertia_atomic | ✅ | Diamond candidate; foundational; **closes 5+ anticipated back-edges** |
| tau_eq_i_alpha_atomic | ✅ | Diamond candidate; rotational F=ma; high JEE/NEET problem-frequency |
| conservation_of_angular_momentum_atomic | ✅ | Diamond candidate; pirouette + ISRO sims; **bridges to T16 (Kepler) + T36/T37 (atomic angular momentum)** |
| pure_rolling_atomic + rolling_on_incline_atomic | ✅ | Diamond candidate (sphere-vs-disc-vs-ring race-down-incline sim — most iconic Class 11 demo) |
| flywheel_application_atomic | ✅ | Diamond candidate; industry anchor (BHEL turbines + automotive KERS) |
| rotational_kinematics_atomic | ⚖️ | V1.1; foundational but pedagogical mirror of T6 |
| torque_atomic + angular_momentum_atomic | ⚖️ | V1.1; ship together |
| rotational_work_energy_atomic | ⚖️ | V1.1 |
| torsional_pendulum_atomic | ⚖️ | V1.2 (NCERT-not-covered; JEE-Advanced) |
| rigid_body_rotation_atomic | ⚖️ | V1.2 (foundational conceptual) |

**V1 ship count for T15: 5 atomics.** Matches T11/T14 paired-batch. **High Diamond-candidate density** (4-5 candidates) reflects rotational mechanics as a visually-rich chapter.

---

## Section I — Open Questions

1. **Gyroscope + precession** — NCERT-light, JEE-Advanced-heavy. Author at HCV+DCM depth as separate atomic (`gyroscope_precession_atomic`) in V1.2 / Stage-4 extension.
2. **Moment of inertia for compound bodies + L-shape + T-shape** — defer to V2; can be derived via parallel-axis + perpendicular-axis theorems.
3. **General planar motion (translation + rotation about CoM)** — implicit in pure_rolling_atomic; full treatment defers to V2.
4. **Euler's equations for 3D rotation** — graduate-level; defer.
5. **T7 vs T15 boundary** — stage-1 had T7 = "System of Particles and Rotational Motion" (NCERT Ch.7) and T15 = "Rotational Mechanics" (HCV+DCM dedicated chapters). Effectively the same content split differently across sources. **Decision held: T15 is the canonical pilot; T7 considered = T15 via this catalog. Cross-reference inline.** Stage-4 numbering reconciliation item.
6. **Torsional-pendulum NCERT-absence** — confirms foundational-Mechanics omits JEE-Advanced material in NCERT (5 NCERT-omitted atomics across T11+T14+T15).
7. **Sphere-vs-disc-vs-ring race-down-incline sim** — V1 priority Diamond candidate; canonical demo.

---

## Section J — Sign-Off

- Authored: Session 51, 2026-05-25.
- Author: Claude (Architect+Engineer role).
- Coverage class: **TRIPLE (92%) with 1 DUAL atomic** (torsional_pendulum NCERT-not-covered).
- Anchor density: **STRONG** (12 anchors × 7 strands — 9th data point in foundational-Mechanics anchor signal).
- Triple-coverage rate: **92%** (11/12). Recovers toward 100% after T14's 70%; NCERT-omission pattern persists.
- Atomic count: **13**. Nano count: **14**. Total: **27 entries**.
- V1 ship count: **5 atomics**.
- **Closes 5+ anticipated back-edges** from T11+T14 + T35 rotating-coil + T36 magnetic-dipole-moment + T37 quantised-angular-momentum + T47 Bohr-L-quantisation. **Closes the 14-session-lag T36→T15 anticipated forward** (one of the longest-lagged).
- **Mechanics cluster CLOSED 10/10** — T15 is the final Mechanics topic. **6th cluster closure in Stage-2.**
- **0 new math-tools stubs registered.** `system_of_linear_equations_2var` validated for 3rd time (T11→T14→T15) — fastest stabilisation observed.
- Cognitive-error-prevention founder-decision share: **42%** (T15+T18 combined session share: see T18 catalog).
- Next pilot in this session: T18 Elasticity.

---

*Mechanics cluster CLOSED at 10/10. 6th cluster closure in Stage-2. T15 absorbs 5+ back-edges including 14-session-lagged T36 magnetic-dipole-moment ← angular_momentum. Triple-coverage recovers to 92%; NCERT-omits-JEE-Advanced pattern continues (torsional pendulum NCERT-not-covered). 9th foundational-mechanics STRONG-anchor data point.*
