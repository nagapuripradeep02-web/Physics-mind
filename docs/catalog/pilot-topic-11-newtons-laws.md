# Pilot Topic 11 — Newton's Laws of Motion & Forces

> Stage-2 pilot catalog. 28th of 44. **Mechanics cluster middle hub-topic #1 of 2** (sibling: T14 Centre of Mass / Momentum / Collisions — same session paired-batch). **First pilot authored under Stage-4-formalised criteria** (cognitive_error_target field active; anchor-bucket via strand-diversity ≥ 8 criterion).
> Sources: **NCERT Class 11 Part 1 Ch.5 Laws of Motion** (canonical spine) + **HCV Vol 1 Ch.4 The Forces + Ch.5 Newton's Laws of Motion** (derivation/pedagogy; 2-chapter treatment) + **DC Pandey Mechanics Vol 1 Ch.8 Laws of Motion** (problem patterns).
> Coverage class: **TRIPLE-COVERED**.
> Anchor density: **STRONG** (under formalised criterion) — 10 anchors across 6-7 strands (consumer transport, residential, sports/entertainment, industry, public safety, education, weak space). Newton's Laws is foundational-mechanics — anchors are pedagogically rich but industrial coupling is broad-but-shallow ("every moving thing obeys Newton") rather than deep ("Tata Steel blast furnace = Carnot cycle"). Plateau at STRONG matches T16/T27/T30 foundational-physics pattern (now 7 data points).
> **Critical role:** Newton's Laws is the most heavily-IN-degreed Mechanics hub topic. Per Stage-4 refresh: every Mechanics-cluster atomic + Gravitation + SHM + Elasticity + Fluid Mechanics + Thermodynamics (first law generalises Newton-mechanical work-energy) cites it. **At 27 pilots, forecasted IN-degree at Stage-2 closure: ~15-18 — Mechanics's clearest hub.**

---

## Founder Decisions Applied

| Tag | Decision |
|---|---|
| **NL-G1** | Atomic granularity = "one law OR one force-type OR one canonical problem-template." The three Newton's laws ship as THREE separate atomics, not bundled. Each has a distinct conceptual content (1st = inertia + frames, 2nd = quantitative F=ma, 3rd = action-reaction pair on DIFFERENT bodies). Bundling collapses the conceptual distinctions JEE/NEET stress-tests. |
| **NL-G2** | **First law = inertia + inertial-vs-non-inertial frames + Galilean invariance is ONE atomic** (`newton_first_law_atomic`). Bundles inertia concept with reference-frame concept because they're operationally inseparable: "law of inertia" is the OPERATIONAL DEFINITION of an inertial frame. Splitting destroys the operational definition. |
| **NL-G3** | **Second law is the central atomic** (`newton_second_law_atomic`) with F = ma in its instantaneous form. dp/dt form as nano (`f_eq_dp_dt_nano`). **Decision: ma vs dp/dt — primary teaching is F = ma; dp/dt is the rocket/variable-mass nano.** Rationale: ~95% of Class-11/JEE problems are constant-mass; dp/dt is the formal generalisation. Authoring F=ma first respects the cognitive load. |
| **NL-G4** | **Third law atomic ships with EXPLICIT cognitive_error_target**: "action-reaction pair always on the same body" — the single most-prevalent misconception in NCERT Ch.5 (per HCV §5.7 + DCP common-errors). Author `newton_third_law_atomic` with mandatory `action_reaction_on_different_bodies_nano` cognitive-error nano. |
| **NL-G5** | **FBD (Free Body Diagram) construction is its own atomic** (`free_body_diagram_atomic`), NOT a sub-step of any one Newton's law application. FBD is the universal cognitive tool for Mechanics; deserves first-class atomic status. **cognitive_error_target:** "drawing forces ON other bodies in same FBD" → FBD-of-ONE-body-only training. |
| **NL-G6** | **Force types — gravity, normal, tension, friction, spring, applied — each is its own atomic** (`gravity_force_atomic`, `normal_force_atomic`, `tension_force_atomic`, `friction_force_atomic`, `spring_force_atomic`, `applied_external_force_atomic`). Friction-specific deep treatment lives in T12 Friction; T11 ships the force-type-introduction atomic with cross-link. **Cognitive-error-prevention pattern:** students fail Mechanics when they don't know WHICH forces to draw on an FBD; a force-type catalog is the inventory. |
| **NL-G7** | **Pseudo-force atomic in non-inertial frames is its own atomic** (`pseudo_force_atomic`) with explicit cognitive_error_target: "pseudo force is real to observer in non-inertial frame; equivalent to mass × accel of frame, opposite direction." NCERT skips this; HCV+DCP cover. Indian JEE-Advanced problems hit it hard. Author at full depth despite NCERT-light. |
| **NL-G8** | **Constraints — string-inextensibility, pulley-massless-frictionless, surface-rigidity — ship as ONE atomic** (`mechanical_constraints_atomic`) bundling all kinematic constraint patterns. Splitting per constraint-type destroys the conceptual unity (constraints are equations relating motion of different bodies). |
| **NL-G9** | **Pulley + Atwood + connected-bodies = ONE atomic** (`connected_bodies_atomic`) bundling pulley problems with constraint atomic. Sub-cases (single fixed pulley, Atwood, movable pulley, mass-on-table connected to mass-hanging) as nanos. **Diamond candidate**: Atwood machine sim is one of physics' most pedagogically compelling simulations (visible m₁ ↔ m₂ asymmetric acceleration). |
| **NL-G10** | **Block-on-incline = ONE atomic** (`block_on_incline_atomic`) with friction-vs-no-friction nano + connected-blocks-on-double-incline nano. Most-classical Mechanics application. NCERT Ch.5 + HCV Ch.5 + DCM1 Ch.8 all spend significant pages here. |
| **NL-G11** | **STRONG anchor (under formalised criterion)** — 10 anchors × 6-7 strands. Foundational-mechanics plateau. **7th data point confirming foundational-physics plateaus at STRONG, applied-engineering reaches VERY-STRONG.** Newton's Laws anchors are pedagogically dense (every Indian household experiences them) but institutionally shallow (no single Indian institution is "the Newton's-laws institution"). |
| **NL-G12** | **`cognitive_error_target` Stage-4 field active — 5 instances captured in this catalog** (NL-G4, NL-G5, NL-G6 collective, NL-G7, NL-G8). Cognitive-error-prevention founder-decision share: 6 of 12 = 50% — **highest single-topic share observed in Stage-2.** Newton's Laws is the densest-misconception chapter in introductory mechanics — meets the high-misconception-density threshold (≥35%); EPIC-L authoring elevated-gate applies. |

---

## Section A — Source Map

| Sub-topic | NCERT 11.1 Ch.5 | HCV V1 Ch.4 + Ch.5 | DCM1 Ch.8 |
|---|---|---|---|
| Aristotle's view + inertia + 1st law | §5.2-5.3 | §4.1 + §5.1 | §8.1 |
| Inertial vs non-inertial frames + Galilean invariance | §5.3 (boxed) | §5.6 | §8.2 |
| 2nd law (F = ma; dp/dt form) | §5.4-5.5 | §5.2-5.3 | §8.3 |
| Impulse | §5.6 | §5.4 | §8.4 |
| 3rd law (action-reaction) | §5.7 | §5.5 | §8.5 |
| Conservation of momentum | §5.8 | §5.6 + Ch.9 (T14 territory) | §8.6 |
| Equilibrium of a particle | §5.9 | §5.7 | §8.7 |
| Common forces in mechanics (gravity, normal, tension, friction, spring) | §5.10 (§5.10.1-5.10.4) | Ch.4 (§4.2-4.7) | §8.8 |
| FBD (Free body diagram) construction | §5.11 (worked examples) | §5.8 | §8.9 |
| Block-on-incline | §5.11 (Ex 5.7-5.11) | §5.9-5.10 | §8.10 |
| Pulley + connected bodies | §5.11 (Ex 5.12-5.14) | §5.11-5.13 | §8.11 |
| Friction (full treatment) | §5.10 (boxed) | Ch.6 (separate) | Ch.9 (separate) | Cross-link to T12 |
| Pseudo-force in non-inertial frames | §5.3 (boxed, light) | §5.14 (full) | §8.12 (full) |

**NCERT Ch.5 is comparatively compact** (~21 pages) — heavy on worked examples but light on derivation depth. **HCV1 splits across TWO chapters: Ch.4 (force types — gravity, normal, tension, spring; static treatment) + Ch.5 (Newton's laws + FBD + constraints + pseudo-force).** **DCM1 Ch.8 is the deepest derivation single-chapter.** The chapter-pair structure in HCV (Ch.4+Ch.5) is the only Stage-2 topic where a single Stage-1 sub-topic maps to a 2-chapter sequence in a source — unique pattern flagged for Stage-4 source-mapping consideration.

---

## Section B — Atomic + Nano Catalog

| ID | Concept | Type | Sim? | In repo? | Requires | Required-by | Notes |
|---|---|---|---|---|---|---|---|
| **newton_first_law_atomic** | A body at rest stays at rest, in uniform motion stays in uniform motion, UNLESS net external force acts; operationally defines an inertial frame | atomic | ✅ | — | [vector_resolution(T5)] | [newton_second_law_atomic, pseudo_force_atomic, equilibrium_of_particle_atomic] | NL-G2; foundational; bundles inertia + frame definition |
| ↳ inertial_vs_non_inertial_frames_nano | Inertial frame: 1st law holds. Non-inertial: 1st law fails → must add pseudo-forces. Earth's surface is approximately inertial for most problems. | nano | ✅ | — | [newton_first_law_atomic] | [pseudo_force_atomic] | parent: newton_first_law_atomic; **cognitive_error_target:** "1st law fails in moving cars" → frame-specification is mandatory before applying 1st law |
| ↳ galilean_invariance_nano | All inertial frames are equivalent; F = ma in one inertial frame holds in any other with the same form. Foundation of pre-relativistic mechanics | nano | — | — | [newton_first_law_atomic, inertial_vs_non_inertial_frames_nano] | — | parent: newton_first_law_atomic; bridge to T-relativity (deferred) |
| **newton_second_law_atomic** | F_net = ma; in vector form ΣF = m·a; central quantitative law of mechanics | atomic | ✅ | — | [newton_first_law_atomic, vector_resolution(T5), vector_addition(T5)] | [newton_third_law_atomic, work_energy_theorem(T13), gravity_force_atomic, normal_force_atomic, friction_force_atomic, connected_bodies_atomic, block_on_incline_atomic, simple_harmonic_motion(T17), first_law_atomic(T26)] | NL-G3; **Diamond candidate** — F=ma is the most-iconic mechanics sim |
| ↳ f_eq_dp_dt_nano | Generalised form: F = dp/dt = d(mv)/dt; reduces to F=ma when m constant; needed for rockets, falling chains, conveyor-belt-sand-loading problems | nano | ✅ | — | [newton_second_law_atomic, calculus_derivative(math-tools)] | [variable_mass_rocket_nano, kinetic_theory_pressure_atomic(T27)] | parent: newton_second_law_atomic; cognitive_error_target: "F=ma is universal" → F=dp/dt is universal; F=ma is the constant-m specialisation |
| ↳ impulse_change_in_momentum_nano | J = ∫F dt = Δp; impulse equals change in momentum. Carom-strike, cricket-bat-ball collision time-integrals all use this | nano | ✅ | — | [newton_second_law_atomic, f_eq_dp_dt_nano, calculus_integration(math-tools)] | [collision_atomic(T14)] | parent: newton_second_law_atomic |
| ↳ variable_mass_rocket_nano | ISRO PSLV/GSLV: M dv/dt = u·(dm/dt) − Mg; thrust = u·(rate of fuel ejection); cross-bridge to T14 momentum-conservation and Tsiolkovsky equation | nano | ✅ | — | [newton_second_law_atomic, f_eq_dp_dt_nano] | — | parent: newton_second_law_atomic; **space-strand anchor: ISRO** |
| **newton_third_law_atomic** | Every action force has an equal-and-opposite reaction force; the action-reaction PAIR acts on TWO DIFFERENT bodies | atomic | ✅ | — | [newton_second_law_atomic] | [tension_force_atomic, connected_bodies_atomic, conservation_of_momentum_atomic(T14)] | NL-G4; **cognitive_error_target:** "action and reaction on same body" → most-prevalent misconception in NCERT Ch.5 |
| ↳ action_reaction_on_different_bodies_nano | Side-by-side diagram: hand pushes wall (force ON wall by hand); wall pushes hand (force ON hand by wall). Both forces act, but on different bodies → they DO NOT cancel. **Cognitive-error-prevention nano** (mandatory per NL-G4). | nano | ✅ | — | [newton_third_law_atomic] | — | parent: newton_third_law_atomic; NL-G4 cognitive_error_target nano |
| ↳ walking_rowing_swimming_examples_nano | Walking: foot pushes earth back; earth pushes foot forward → person accelerates. Rowing: oar pushes water back; water pushes oar forward. Swimming: hand pushes water back; water pushes hand forward. **Three Indian everyday examples** | nano | ✅ | — | [newton_third_law_atomic] | — | parent: newton_third_law_atomic; **residential/sports strand anchor** |
| **gravity_force_atomic** | F_g = mg downward on Earth's surface (g ≈ 9.8 m/s²); more generally F = GMm/r²; mass × gravitational-field-strength | atomic | ✅ | — | [newton_second_law_atomic] | [normal_force_atomic, tension_force_atomic, block_on_incline_atomic, gravitation(T16)] | NL-G6; bridge atomic to T16 Gravitation |
| **normal_force_atomic** | Contact force perpendicular to the surface, magnitude adjusts to whatever keeps body from penetrating surface (it's NOT always equal to mg) | atomic | ✅ | — | [newton_second_law_atomic, gravity_force_atomic] | [friction_force_atomic, free_body_diagram_atomic, block_on_incline_atomic] | NL-G6; **cognitive_error_target:** "N = mg always" → N depends on what equation you write, varies with incline-angle/acceleration |
| ↳ normal_force_in_lift_problem_nano | In accelerating lift: N = m(g + a) upward acceleration; N = m(g − a) downward acceleration; N = 0 free-fall (passenger feels weightless). **Everyday Indian elevator examples** | nano | ✅ | — | [normal_force_atomic, newton_second_law_atomic] | — | parent: normal_force_atomic; residential strand |
| **tension_force_atomic** | Force transmitted along a string/rope; tension is uniform along massless inextensible string; tension at any point = force pulling along string at that point | atomic | ✅ | — | [newton_second_law_atomic, newton_third_law_atomic] | [connected_bodies_atomic, mechanical_constraints_atomic] | NL-G6; **cognitive_error_target:** "tension equals weight always" → tension equals force needed to maintain motion-state |
| ↳ massless_inextensible_string_constraint_nano | String mass = 0 → tension uniform along string. String inextensible → tangential velocity along string is same at every point. These are TWO separate idealisations bundled into "ideal string." | nano | ✅ | — | [tension_force_atomic, mechanical_constraints_atomic] | — | parent: tension_force_atomic |
| **friction_force_atomic** | Force opposing relative motion or tendency of motion between contacting surfaces; static μ_s (no relative motion yet) vs kinetic μ_k (motion occurring); cross-link to T12 for full derivation | atomic | ✅ | — | [newton_second_law_atomic, normal_force_atomic] | [block_on_incline_atomic, friction(T12 full treatment)] | NL-G6; cross-link to T12 Friction full atomic; T11 ships intro atomic only |
| **spring_force_atomic** | F = −kx (Hooke's law); restoring force proportional to displacement from natural length; sign convention "minus" indicates restoring | atomic | ✅ | — | [newton_second_law_atomic] | [simple_harmonic_motion(T17)] | NL-G6; **bridge to T17 SHM** (most-cited mechanics-to-oscillations atomic) |
| **applied_external_force_atomic** | Any non-internal force from outside the system (push, pull, applied tension, applied gravity-field). The "F" in F=ma typically refers to applied + reaction-from-environment | atomic | — | — | [newton_second_law_atomic] | [free_body_diagram_atomic, equilibrium_of_particle_atomic] | NL-G6; conceptual atomic (no canonical sim) |
| **pseudo_force_atomic** | In non-inertial frame with acceleration a_frame: pseudo-force F_pseudo = −m·a_frame acts on every mass m in the frame. Real to observer in that frame; vanishes in inertial frame. | atomic | ✅ | — | [newton_first_law_atomic, inertial_vs_non_inertial_frames_nano, newton_second_law_atomic] | [centrifugal_force_nano, train_acceleration_nano] | NL-G7; **cognitive_error_target:** "pseudo-force isn't real" → it's real to non-inertial-frame observer (forces are frame-dependent) |
| ↳ centrifugal_force_nano | In rotating frame: F_centrifugal = mω²r outward; explains why water-bucket-on-string works; classic NCERT/HCV example. Equivalent to centripetal-force-balance from inertial frame view. | nano | ✅ | — | [pseudo_force_atomic, circular_motion(T10)] | — | parent: pseudo_force_atomic; cross-link to T10 |
| ↳ train_acceleration_nano | Passenger in accelerating train (a_train forward): pseudo-force m·a_train backward on passenger; passenger leans back. Indian Railways everyday experience. | nano | ✅ | — | [pseudo_force_atomic] | — | parent: pseudo_force_atomic; **transport strand anchor** |
| **free_body_diagram_atomic** | Cognitive tool: isolate ONE body, draw ALL external forces ACTING ON IT, set up F_net = ma equations. THE universal mechanics workflow. | atomic | ✅ | — | [newton_second_law_atomic, gravity_force_atomic, normal_force_atomic, tension_force_atomic, friction_force_atomic] | [block_on_incline_atomic, connected_bodies_atomic, every-mechanics-application] | NL-G5; **Diamond candidate**; **cognitive_error_target:** "drawing forces ON other bodies in same FBD" → FBD-of-ONE-body-only training |
| ↳ fbd_step_by_step_nano | Step 1: identify body. Step 2: list all forces ACTING ON it (gravity, normal, tension, friction, applied, spring). Step 3: choose axes. Step 4: resolve. Step 5: write ΣF_x = ma_x and ΣF_y = ma_y. | nano | ✅ | — | [free_body_diagram_atomic] | — | parent: free_body_diagram_atomic; procedural nano |
| **equilibrium_of_particle_atomic** | Particle in equilibrium: ΣF = 0 → ΣF_x = 0 AND ΣF_y = 0; static equilibrium or dynamic-equilibrium (constant velocity); equivalent to 1st law special case | atomic | ✅ | — | [newton_first_law_atomic, free_body_diagram_atomic, vector_resolution(T5)] | [tension_in_strings_at_a_point_nano] | Bridging atomic |
| ↳ tension_in_strings_at_a_point_nano | Two strings joined at a point with weight hanging: ΣF_x = 0 (horizontal tension components cancel); ΣF_y = 0 (vertical components support weight). Classic JEE example. | nano | ✅ | — | [equilibrium_of_particle_atomic, tension_force_atomic, vector_resolution(T5)] | — | parent: equilibrium_of_particle_atomic |
| **mechanical_constraints_atomic** | Equations relating motion of different connected bodies: string-inextensibility, pulley-massless, rigid-body, surface-rigidity. Each constraint reduces # of independent variables. | atomic | ✅ | — | [tension_force_atomic, newton_second_law_atomic] | [connected_bodies_atomic, block_on_incline_atomic] | NL-G8; bundles all kinematic constraint patterns |
| ↳ pulley_constraint_v_dot_equal_nano | Single fixed pulley + inextensible string: |v₁| = |v₂| but in opposite directions; sign convention via constraint equation x₁ + x₂ = L. Differentiate twice to get a₁ = −a₂. | nano | ✅ | — | [mechanical_constraints_atomic] | [connected_bodies_atomic] | parent: mechanical_constraints_atomic |
| **connected_bodies_atomic** | Two or more bodies connected by string/rod/pulley; apply F=ma to each body separately + constraint equation; combine for system solution | atomic | ✅ | — | [newton_second_law_atomic, free_body_diagram_atomic, tension_force_atomic, mechanical_constraints_atomic] | [block_on_incline_atomic, atwood_machine_sim_nano] | NL-G9; **Diamond candidate** — Atwood machine sim |
| ↳ atwood_machine_sim_nano | Two masses m₁ + m₂ over single fixed pulley: a = g(m₁−m₂)/(m₁+m₂); T = 2gm₁m₂/(m₁+m₂). Asymmetric acceleration is visually compelling. | nano | ✅ | — | [connected_bodies_atomic] | — | parent: connected_bodies_atomic |
| ↳ block_on_table_connected_to_hanging_mass_nano | m₁ on table, string over pulley at edge, m₂ hangs: a = m₂g/(m₁+m₂); if friction on table, a = (m₂ − μm₁)g/(m₁+m₂). Classic JEE template. | nano | ✅ | — | [connected_bodies_atomic, friction_force_atomic] | — | parent: connected_bodies_atomic |
| **block_on_incline_atomic** | Block of mass m on incline angle θ: gravity component along incline = mg sin θ; perpendicular = mg cos θ; if μ < tan θ slides; if μ ≥ tan θ static | atomic | ✅ | — | [newton_second_law_atomic, free_body_diagram_atomic, friction_force_atomic, vector_resolution(T5)] | [connected_bodies_atomic] | NL-G10; **Diamond candidate** — Most-classical mechanics sim |
| ↳ angle_of_repose_nano | Angle θ at which block just begins to slide: tan θ = μ_s; static-friction threshold |
| ↳ angle_of_repose_nano | Angle θ at which block just starts sliding: tan θ = μ_s; defines the static-friction limit on incline | nano | ✅ | — | [block_on_incline_atomic, friction_force_atomic] | — | parent: block_on_incline_atomic |
| ↳ connected_blocks_on_double_incline_nano | Two blocks on opposite faces of same wedge connected by string over pulley at apex: classic IIT-Advanced problem | nano | ✅ | — | [block_on_incline_atomic, connected_bodies_atomic] | — | parent: block_on_incline_atomic |

**Atomic count:** 13. **Nano count:** ~18. **Total entries:** 31.

---

## Section C — Cross-Source Coverage Matrix

| Atomic | NCERT 11.1 Ch.5 | HCV V1 Ch.4 + Ch.5 | DCM1 Ch.8 | Coverage |
|---|---|---|---|---|
| newton_first_law_atomic | §5.2-5.3 | §5.1 | §8.1 | TRIPLE |
| newton_second_law_atomic | §5.4-5.5 | §5.2-5.3 | §8.3 | TRIPLE |
| newton_third_law_atomic | §5.7 | §5.5 | §8.5 | TRIPLE |
| gravity_force_atomic | §5.10 | Ch.4 §4.2 | §8.8 | TRIPLE |
| normal_force_atomic | §5.10 | Ch.4 §4.3 | §8.8 | TRIPLE |
| tension_force_atomic | §5.10 | Ch.4 §4.4 | §8.8 | TRIPLE |
| friction_force_atomic | §5.10 (intro) | Ch.4 §4.5 + Ch.6 full | §8.8 (intro) + Ch.9 full | TRIPLE (cross-link to T12) |
| spring_force_atomic | §5.10 | Ch.4 §4.7 | §8.8 | TRIPLE |
| applied_external_force_atomic | §5.4 (implicit) | Ch.4 §4.6 | §8.3 | TRIPLE |
| pseudo_force_atomic | §5.3 (boxed, light) | §5.14 | §8.12 | TRIPLE (NCERT-light; HCV/DCM full) |
| free_body_diagram_atomic | §5.11 (worked examples) | §5.8 | §8.9 | TRIPLE |
| equilibrium_of_particle_atomic | §5.9 | §5.7 | §8.7 | TRIPLE |
| mechanical_constraints_atomic | §5.11 (implicit) | §5.11 | §8.11 | TRIPLE (NCERT-implicit) |
| connected_bodies_atomic | §5.11 (Ex 5.12-5.14) | §5.11-5.13 | §8.11 | TRIPLE |
| block_on_incline_atomic | §5.11 (Ex 5.7-5.11) | §5.9-5.10 | §8.10 | TRIPLE |

**Triple-coverage rate:** 15 of 15 atomics = **100%**. **Eighth observed 100% topic** in 28 pilots. **Streak: 8 consecutive 100% topics** (T48 → T35 → T38 → T37 → T39 → T26 → T27 → T11). Pseudo-force atomic has NCERT-light caveat; mechanical-constraints atomic has NCERT-implicit caveat; both still TRIPLE since the concepts appear in all three sources (NCERT inline). **Newton's Laws cluster is universally triple-covered, as expected for foundational mechanics.**

---

## Section D — Stage-3 Math-Tool Dependencies

| Math-tool primitive | Used by | Status |
|---|---|---|
| `vector_resolution` (F_x, F_y) | newton_second_law_atomic, block_on_incline_atomic | REQUIRED (existing) |
| `vector_addition` (ΣF) | newton_second_law_atomic, equilibrium_of_particle_atomic | REQUIRED (existing) |
| `calculus_derivative` (dv/dt for a) | newton_second_law_atomic, f_eq_dp_dt_nano | REQUIRED |
| `calculus_integration` (impulse = ∫F dt) | impulse_change_in_momentum_nano | REQUIRED |
| `trigonometry_sin_cos` (incline-angle resolution) | block_on_incline_atomic | REQUIRED |
| `system_of_linear_equations_2var` (connected-bodies a + T) | connected_bodies_atomic, atwood_machine_sim_nano | **NEW STUB** — first explicit cross-domain registration; simultaneous equations from FBDs |

**ONE new stub registered: `system_of_linear_equations_2var`.** First Mechanics-cluster cross-domain math primitive in Stage-2 — the simultaneous-equation machinery from connected-bodies problems is a generic JEE-template skill. Math-tools IN-degree: 50 → 51.

---

## Section E — Cross-Topic Dependencies (Bidirectional Edges)

### Outgoing (T11 requires from earlier topics)

| Target topic | Edge | Reason |
|---|---|---|
| T5 Vectors | newton_second_law_atomic ← vector_addition + vector_resolution | F = ma is vectorial; requires vector toolkit |
| T7 Kinematics 1D | newton_second_law_atomic ← acceleration_definition | a in F=ma requires kinematic definition |
| T9 Kinematics 2D | block_on_incline_atomic ← projectile_acceleration_components | Inclined components mirror 2D motion |
| Math-tools | 6 primitives incl. 1 new stub (`system_of_linear_equations_2var`) | Mechanics-cluster simultaneous equations first formalised |

### Incoming (T11 is required by — closing many anticipated back-edges)

| Source topic | Edge | Reason — closes anticipated edge |
|---|---|---|
| T10 Circular Motion | newton_second_law_arbitrary_direction ← T11 | **Closes** anticipated forward-edge from T10 catalog Session 39 |
| T12 Friction | A12, A21, A22, A23 ← friction_force_atomic + newton_second_law_atomic | **Closes** T12 forward-references |
| T13 Work-Energy | work_energy_theorem ← newton_second_law_atomic + F=ma | **Closes** T13 forward-references |
| **T14 Momentum/Collisions (intra-session)** | conservation_of_momentum ↔ newton_third_law_atomic | **Closes intra-session bidirectional edge** |
| T15 Rotational Mechanics | torque ↔ F=ma rotational analog | Forward (T15 not yet catalogued) |
| T16 Gravitation | orbital_velocity_centripetal ← newton_second_law_atomic | **Closes** T16 forward-edge |
| T17 SHM | f_eq_minus_kx_atomic ← newton_second_law_atomic + spring_force_atomic | **Closes** T17 forward-edge |
| T18 Elasticity (forward) | stress_strain ← gravity/applied force concepts | Forward (T18 not yet catalogued) |
| T21 Wave Motion | wave_speed_string ← tension_force_atomic | **Closes** T21 forward-edge |
| T26 Thermodynamics | first_law_atomic ← work-energy generalised → F-dot-d generalised | **Closes** T26 anticipated edge |
| T27 Kinetic Theory | kinetic_theory_pressure_atomic ← newton_second_law_atomic + f_eq_dp_dt | **Closes** T27 forward-edge |
| T29 Electrostatics | coulombs_law (F=ma analog for electric force) | **Closes** T29 anticipated edge |
| T34 Current Electricity | drift_velocity ← F=ma applied to free electrons | **Closes** T34 anticipated edge |
| T35 EM Induction | induced_emf_uses_force_on_charge ← Lorentz force | **Closes** T35 anticipated edge |
| T36 Moving Charges | lorentz_force_atomic ← F=ma applied to charge in field | **Closes** T36 anticipated edge |
| T37 Magnetism & Matter | torque_on_dipole ← F=qE analog | Weak back-edge |
| **T14 Momentum/Collisions (intra-session)** | f_eq_dp_dt_nano ← T11 → T14 momentum conservation | **Intra-session bidirectional** |

**MASSIVE incoming back-edge resolution:** **15+ anticipated forward-edges close to T11 in this session.** As predicted by Stage-4 IN/OUT-degree refresh, T11 is the highest-incoming-edge hub in the Mechanics cluster.

### T11 ↔ T14 intra-session bidirectional edges

This paired-batch surfaces **8 bidirectional edges** between T11 and T14 (same NCERT chapter neighborhood: Ch.5 + Ch.7 with Ch.6 between; same HCV cluster: Ch.4+5 + Ch.9 with Ch.6-8 between; same DCM cluster: M1 Ch.8 + M1 Ch.10):

| T11 atomic | ↔ | T14 atomic | Edge type |
|---|---|---|---|
| `newton_second_law_atomic` (F = dp/dt) | → | `conservation_of_momentum_atomic` (Σp = const when ΣF_ext = 0) | T14 requires T11; foundational |
| `f_eq_dp_dt_nano` | ↔ | `centre_of_mass_atomic` | Bidirectional (CoM equation IS F = dP/dt for system) |
| `newton_third_law_atomic` | → | `conservation_of_momentum_atomic` | T14 requires T11; conservation follows from 3rd law |
| `impulse_change_in_momentum_nano` | ↔ | `collision_atomic` | Bidirectional (impulse = momentum change in collision) |
| `applied_external_force_atomic` | → | `system_of_particles_atomic` | T14 requires T11; external vs internal force distinction |
| `f_eq_dp_dt_nano` (variable mass) | ↔ | `rocket_equation_atomic` (T14) | Bidirectional (Tsiolkovsky) |
| `mechanical_constraints_atomic` | → | `collision_constraints_atomic` (T14, energy conservation) | T14 applies T11 |
| `connected_bodies_atomic` | ↔ | `two_body_collision_atomic` (T14) | Bidirectional (connected-bodies and collisions are dual perspectives) |

**8 bidirectional edges = chapter-adjacent intra-cluster density band (6-9 range).** **6th data point confirming the band.** T11/T14 are same Mechanics cluster + HCV-chapter-adjacent (Ch.5 + Ch.9 with Ch.6-7-8 between — moderate adjacency) + same DCM cluster.

**Total outgoing edges: 4 cross-topic + 1 new math-tools stub.** **Total incoming: 15+ back-edges + 8 intra-session bidirectional.** **T11 IN-degree post-session: ~15-18 — clearest Mechanics hub.**

---

## Section F — Real-World Anchors (STRONG, Indian-context)

| Anchor | Concept hook | Authoring use | Strand |
|---|---|---|---|
| **Indian Railways train acceleration + braking** | train_acceleration_nano, pseudo_force_atomic, impulse_change_in_momentum_nano | "Passenger leans backward on acceleration, forward on braking — pseudo-force experience for every Indian rail commuter" | Transport |
| **Indian elevators (commercial + residential)** | normal_force_in_lift_problem_nano, normal_force_atomic | "Apparent weight changes in lift acceleration; passenger experiences N ≠ mg" | Residential |
| **Cricket bat-ball collision (T20/IPL → every Indian household)** | impulse_change_in_momentum_nano, newton_third_law_atomic | "MS Dhoni helicopter-shot: impulse via wrist rotation through ball impact; force × short Δt = momentum change" | Sports / Entertainment |
| **Carrom strike on striker → coin → corner pocket** | impulse_change_in_momentum_nano, collision_atomic (T14 cross-link) | "Indian household carrom: striker imparts impulse; 2-body collision common" | Sports / Residential |
| **Maruti / Tata / Mahindra automotive braking + suspension** | newton_second_law_atomic, normal_force_atomic, friction_force_atomic | "Brake force = m·deceleration; ABS preserves static friction limit" | Industry / Consumer Transport |
| **ISRO PSLV / GSLV variable-mass rocket equation** | f_eq_dp_dt_nano, variable_mass_rocket_nano | "ISRO rocket equation: m·dv/dt = u·(dm/dt) − mg; Tsiolkovsky's rocket equation in action" | Space |
| **Indian household manual labor: rowing on Indian rivers, swimming in monsoon ponds** | walking_rowing_swimming_examples_nano | "Oar pushes water back; water pushes oar forward — Newton's 3rd law in everyday rowing on the Ganga" | Residential / Sports |
| **Bullock cart pulled by oxen** | newton_third_law_atomic, applied_external_force_atomic, friction_force_atomic | "Classical Indian everyday: ox pushes earth back; reaction pushes ox forward → cart moves" | Agriculture / Residential |
| **Indian schoolyard physics: ball thrown vertically + caught + dropped from height** | newton_first_law_atomic, gravity_force_atomic, free_body_diagram_atomic | "Class 9-11 pedagogical staple: drop ball from balcony; observe constant g; FBD = single arrow (gravity)" | Education |
| **CBSE / NCERT pedagogical sequence + State boards** | newton_first_law_atomic, newton_second_law_atomic, newton_third_law_atomic | "Newton's Laws unit is the spine of Class-11 mechanics across all 30+ state board curricula" | Education / Public Service |

**Total: 10 distinct institutional/system anchors across 6-7 strands** (transport, residential, sports/entertainment, industry, space, education, agriculture/agriculture-light, public service). **Falls short of strand-diversity ≥ 8 VERY-STRONG threshold under formalised criterion (per Stage-4-consolidation §b).** **Decision (NL-G11):** **STRONG, not VERY-STRONG.** 7th data point confirming foundational-physics-plateaus-at-STRONG pattern. Newton's Laws is pedagogically rich (every Indian student encounters it) but institutionally shallow — no single Indian institution is "the Newton's-laws institution," unlike NTPC for thermodynamics or BHEL for AC circuits.

---

## Section G — Cognitive-Error-Prevention Decisions (Stage-4 first-class field active)

**6 of 12 founder decisions are cognitive-error-prevention type = 50%.** **Highest single-topic share in Stage-2.** Newton's Laws is the densest-misconception chapter in introductory mechanics — meets the high-misconception-density threshold (≥ 35%). Per Stage-4 formalisation, elevated EPIC-L authoring gate applies:

| Tag | cognitive_error_target | Countermeasure |
|---|---|---|
| **NL-G4** | "action and reaction on same body" | Mandatory `action_reaction_on_different_bodies_nano` with side-by-side diagram |
| **NL-G5** | "drawing forces ON other bodies in same FBD" | FBD-of-ONE-body-only training; mandatory `fbd_step_by_step_nano` |
| **NL-G6** (collective) | "N = mg always" / "T = weight always" | Per-force-type force-magnitude-depends-on-net-force teaching |
| **NL-G7** | "pseudo-force isn't real" | Author from non-inertial-frame observer's perspective; equivalent-to-real |
| **NL-G2** (implicit) | "inertia means resistance to motion" | Reframe inertia as "resistance to CHANGE in motion" — frame-dependent quantity |
| **NL-G8** (implicit) | "tension equal everywhere on any string" | Massless-string condition required; real massive string has varying tension |

**Cross-pilot ranking after Stage-4 catalog field activation:** T11 Newton's Laws = 50% (highest). T26 Thermodynamics = 42%. T46 Dual Nature = 43%. T38 EM Waves = 44%. **T11 is now the canonical reference for "high-misconception-density chapter."**

---

## Section H — V1 Priority Flags

| Atomic | V1? | Reason |
|---|---|---|
| newton_second_law_atomic | ✅ | Diamond candidate — F=ma is the most-iconic Mechanics sim; foundational for all Mechanics atomics; ALL downstream topics cite it |
| newton_third_law_atomic | ✅ | Highest cognitive_error_target density; mandatory for misconception-correction launch |
| free_body_diagram_atomic | ✅ | Diamond candidate — universal Mechanics workflow tool; mandatory for sims; high cognitive_error_target density |
| connected_bodies_atomic | ✅ | Diamond candidate — Atwood sim is pedagogically compelling; closes 8 anticipated back-edges (every Mechanics application uses it) |
| block_on_incline_atomic | ✅ | Diamond candidate — most-classical Mechanics application; high JEE/NEET problem-frequency |
| newton_first_law_atomic | ⚖️ | V1.1; foundational but conceptual (sim less compelling than F=ma) |
| gravity_force_atomic + normal_force_atomic + tension_force_atomic + spring_force_atomic | ⚖️ | V1.1; force-type quartet ships together; foundational atomics |
| friction_force_atomic | ⚖️ | V1.1 cross-link to T12 Friction full atomic (already V1) |
| pseudo_force_atomic | ⚖️ | V1.2 — non-inertial frames are JEE-Advanced-heavy but NCERT-light |
| equilibrium_of_particle_atomic + mechanical_constraints_atomic | ⚖️ | V1.2 |
| applied_external_force_atomic | ⚖️ | V1.2 — conceptual, low sim-value |

**V1 ship count for T11: 5 atomics** (matches 27-pilot mean; appropriate given Diamond-candidate-density of the chapter).

---

## Section I — Open Questions

1. **HCV1 Ch.4 + Ch.5 chapter-pair source pattern** — unique 2-chapter-per-topic mapping in HCV. Stage-4 source-mapping should formalise this as a valid source pattern. Flagged.
2. **Pseudo-force depth** — NCERT-light, JEE-Advanced-heavy. NL-G7 authors at full depth despite NCERT lightness; alternative path: ship pseudo_force_atomic as V1.2-deferred. **Decision held: full-depth authoring is correct for JEE-Advanced market.**
3. **Variable-mass systems** — `f_eq_dp_dt_nano` covers rocket case; falling chain + sand-on-conveyor cases deferred to V2 / JEE-Advanced advanced nano.
4. **Friction full atomic in T11 vs T12** — T11 ships friction_force_atomic as introduction; T12 owns the full treatment (already shipped). Cross-link nano added.
5. **Newton's laws in rotating reference frames** — defers to T15 Rotational Mechanics; coriolis-force atomic to be authored there.
6. **Mass-on-pulley constraint mathematics** — explored in NL-G8; differential-form (x₁ + x₂ = L → ẋ₁ + ẋ₂ = 0) needs simulation; complex pulley systems (movable pulley with mechanical advantage) deferred.
7. **JEE-Advanced contact-force impulse problems** (jerk in pulley systems, sudden release of constraint) — deferred to V2.

---

## Section J — Sign-Off

- Authored: Session 50, 2026-05-25.
- Author: Claude (Architect+Engineer role).
- Coverage class: **TRIPLE**.
- Anchor density: **STRONG** (10 anchors across 6-7 strands — falls below VERY-STRONG strand-diversity ≥ 8 threshold per Stage-4 formalised criterion).
- Triple-coverage rate: **100%** (15/15) — **8th observed 100% topic** in 28 pilots — **8 consecutive 100% topics (record streak).**
- Atomic count: **13**. Nano count: **18**. Total: **31 entries**.
- V1 ship count: **5 atomics**.
- **Closes 15+ anticipated forward-edges** from earlier pilots — **densest single-session back-edge-closure observed** in Stage-2. T11 IN-degree post-session: ~15-18 — clearest Mechanics hub.
- **Mechanics cluster middle opener** — T14 ships in same session; T7 Rotation + T15 Rotational Mechanics + T18 Elasticity remain.
- **1 new math-tools stub registered:** `system_of_linear_equations_2var`.
- Cognitive-error-prevention founder-decision share: **50%** — **highest single-topic share in Stage-2.** First catalog under Stage-4 formalised cognitive_error_target field — 6 instances captured.
- **First Stage-4-criteria-active pilot.** Anchor-bucket determined via strand-diversity criterion; cognitive_error_target field active in Notes column.
- Next pilot in this session: T14 Momentum/Collisions.

---

*8th consecutive 100% triple-coverage topic — new record streak. T11 closes 15+ anticipated forward-edges in single session — densest back-edge-closure observed. First pilot under Stage-4-formalised criteria. Cognitive-error-prevention sub-category hits new high (50%). Foundational-mechanics-plateaus-at-STRONG pattern at 7 data points.*
