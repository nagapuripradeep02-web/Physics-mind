# Pilot Topic 6 — Kinematics 1D (Motion in a Straight Line)

> Stage-2 pilot catalog. 37th of 44. **Kinematics-formalisation cluster OPENER** (sibling T7 2D Kinematics/Relative-Motion in same Session 55 paired-batch; T8 Projectile + T9 Motion-in-Plane remain for cluster closure).
> Sources: **NCERT Class 11 Part 1 Ch.3 Motion in a Straight Line** (canonical spine — position-time + velocity + acceleration + kinematic equations + relative velocity intro) + **HCV Vol 1 Ch.3 Rest and Motion: Kinematics §3.1-3.7** (derivation-rich pedagogy; rigorous definition chain) + **DC Pandey Mechanics Vol 1 Ch.6 Kinematics §6.1-6.9** (problem-pattern density: signed-velocity + reversal + graphs).
> Coverage class: **TRIPLE-COVERED**.
> Anchor density: **STRONG** (11 anchors × 7 strands — transport + sports + consumer + research + education + space + meteorology). Strong universal-everyday-life anchoring (Indian Railways + Mumbai-Bengaluru traffic + cricket + IPL pace bowlers + IIT lab inclined-plane + ISRO rocket-launch). Falls short of VERY-STRONG strand-diversity ≥8 threshold (lacks defence + telecom + healthcare strands inherent to motion-kinematics).
> **Critical role:** T6 formalises **the canonical kinematic vocabulary chain** (position → displacement → velocity → acceleration → kinematic equations) that EVERY downstream Mechanics + Wave + E&M topic depends on. **Closes T11/T12/T13/T14/T15/T17/T21 anticipated back-edges** (every Mechanics catalog assumed v, a, x conventions defined at T6). **Opens forward to T7 2D + T8 Projectile** (vector-extension of all T6 concepts).

---

## Founder Decisions Applied

| Tag | Decision |
|---|---|
| **K1-G1** | Atomic granularity = "one kinematic-quantity OR one definition-distinction OR one motion-equation-application." Position vs displacement, average vs instantaneous, kinematic equations, graphical methods = 6-8 atomics. NCERT compresses many into one chapter; we split per-distinction. |
| **K1-G2** | **Displacement-vs-distance distinction is its own atomic** (`displacement_vs_distance_atomic`) — vector with sign vs scalar always positive. **Diamond candidate** — round-trip animation showing distance accumulates but displacement returns to zero. **cognitive_error_target:** "displacement and distance are interchangeable" → vector-vs-scalar; sign carries direction in 1D. |
| **K1-G3** | **Average-vs-instantaneous velocity is its own atomic** (`avg_vs_instantaneous_velocity_atomic`) — average over finite interval vs limit as Δt→0. Foundation for calculus introduction in physics. **cognitive_error_target:** "average velocity = (v₁+v₂)/2 always" → only for constant acceleration. |
| **K1-G4** | **Acceleration as rate-of-change-of-velocity is its own atomic** (`acceleration_definition_atomic`) — a = dv/dt. **cognitive_error_target:** "negative acceleration means slowing down" → no, deceleration depends on sign of v also; negative a with negative v = speeding up. **Diamond candidate** — sign-of-a-vs-sign-of-v 2×2 matrix animation. |
| **K1-G5** | **Three kinematic equations are ONE atomic** (`kinematic_equations_constant_a_atomic`) — v = u + at; s = ut + ½at²; v² = u² + 2as. All derive from a = constant. Three equations are different rearrangements, not three concepts. **cognitive_error_target:** "memorise three formulas separately" → derive from a = constant once; use what's given. |
| **K1-G6** | **Position-time + velocity-time + acceleration-time graphs are ONE atomic** (`xt_vt_at_graphs_atomic`) — three views of same motion. Slope-of-x-t = v; slope-of-v-t = a; area-under-v-t = displacement; area-under-a-t = Δv. **Diamond candidate** — multi-panel synchronised graph animation. |
| **K1-G7** | **Free-fall under gravity is its own atomic** (`free_fall_gravity_atomic`) — specialisation of constant-acceleration with a = g downward (9.8 m/s² near Earth surface). **cognitive_error_target:** "heavier objects fall faster" → mandatory feather-vs-coin vacuum-tube demo. |
| **K1-G8** | **Sign convention is its own atomic** (`sign_convention_1d_atomic`) — pick positive direction; ALL quantities (x, v, a) carry that sign. **cognitive_error_target:** "g is always negative" → only when up is positive; if down is positive, g = +9.8. **Foundation for ALL downstream physics sign-conventions** (E-field, B-field, current direction, optics). |
| **K1-G9** | **Relative velocity in 1D is its own atomic** (`relative_velocity_1d_atomic`) — v_AB = v_A − v_B. **Subset preview of T7 2D relative motion.** **cognitive_error_target:** "relative velocity is just subtraction of speeds" → must preserve sign/direction. |
| **K1-G10** | **STRONG anchor (formalised criterion)** — 11 anchors × 7 strands. Strong transport (Indian Railways train kinematics + Mumbai traffic + Delhi Metro + Bengaluru autorickshaw acceleration) + sports (cricket pace bowler + IPL fast-bowler acceleration + Olympic 100m sprinters) + research/education (IIT physics-lab inclined-plane + CBSE/ISC physics practical) + space (ISRO rocket-launch acceleration profile) + consumer (vehicle speedometer + Apple Health step counter). Misses defence + telecom + healthcare strands → STRONG, not VERY-STRONG. **23rd foundational-physics STRONG data point.** |
| **K1-G11** | **Cognitive-error-prevention sub-category — 6 instances** (K1-G2 displacement-vs-distance; K1-G3 avg-formula-validity; K1-G4 negative-a-meaning; K1-G5 three-formulas-memorisation; K1-G7 heavier-falls-faster; K1-G8 g-sign; K1-G9 relative-velocity-direction). Founder-decision share: 6/11 = 55%. **NEW SINGLE-TOPIC HIGH** (passes T20 Fluid Mechanics 50%). **Foundation chapters carry the highest cognitive-error density — because they bake in sign-conventions, vector-vs-scalar, and instantaneous-vs-average distinctions that ALL downstream physics inherits.** |

---

## Section A — Source Map

| Sub-topic | NCERT 11.1 Ch.3 | HCV V1 Ch.3 | DCM M1 Ch.6 |
|---|---|---|---|
| Position, frame of reference | §3.1-3.2 | §3.1-3.2 | §6.1 |
| Displacement vs distance | §3.3 | §3.2 | §6.2 |
| Average + instantaneous velocity | §3.4 | §3.3-3.4 | §6.3 |
| Acceleration (avg + instant) | §3.5 | §3.5 | §6.4 |
| Kinematic equations (constant a) | §3.6 | §3.6 | §6.5 |
| Graphical methods (x-t, v-t, a-t) | §3.7 | §3.7 | §6.6 |
| Free fall + g | §3.6 ex | §3.6 | §6.7 |
| Sign convention | §3.3 (implicit) | §3.4 (implicit) | §6.2 (explicit) |
| Relative velocity 1D | §3.8 | §3.8 (partial) | §6.8 |

**NCERT Ch.3 is the canonical spine** (~26 pages — one of the largest NCERT physics chapters). **HCV Ch.3 is full derivation pedagogy backbone** (signed-velocity rigor especially). DCM M1 Ch.6 carries problem-pattern density (sign-convention drills + graph-interpretation chains).

---

## Section B — Atomic + Nano Catalog

| ID | Concept | Type | Sim? | In repo? | Requires | Required-by | Notes |
|---|---|---|---|---|---|---|---|
| **position_frame_of_reference_atomic** | A particle's location specified by coordinates relative to a chosen origin + axes. **Frame of reference** = the coordinate system + clock from which observations are made. Motion is always relative to a frame; "absolute" rest does not exist. | atomic | ✅ | — | [vector_resolution_atomic(T5)] | [displacement_vs_distance_atomic, relative_velocity_1d_atomic, position_frame_of_reference_atomic(T7 2D extension)] | foundation; frame-relativity foreshadows special relativity (T-extra) |
| ↳ origin_choice_arbitrary_nano | Choice of origin is arbitrary — physics doesn't change. **What changes**: numerical values of x, v(if moving frame), a(if accelerating frame). **What stays the same**: relative-positions, time-intervals, accelerations between inertial frames. | nano | ✅ | — | [position_frame_of_reference_atomic] | — | parent; foundation of inertial-frame concept |
| ↳ inertial_vs_noninertial_frame_nano | **Inertial frame**: a frame in which Newton's 1st law holds (free particle moves uniformly). **Non-inertial frame**: accelerating frame (e.g., braking-car frame); pseudo-forces appear. Examples: ground-frame, train-moving-uniform-velocity = inertial; train-braking = non-inertial. | nano | ✅ | — | [position_frame_of_reference_atomic] | [newton_laws_atomic(T11)] | parent; bridge to T11 Newton's Laws |
| **displacement_vs_distance_atomic** | **Displacement** Δx = x_final − x_initial (vector in 1D = signed scalar). **Distance** = path length traversed (scalar, always ≥ 0). For round-trip: displacement = 0; distance = 2·(path length). Distance ≥ |displacement| always. | atomic | ✅ | — | [position_frame_of_reference_atomic, sign_convention_1d_atomic] | [avg_vs_instantaneous_velocity_atomic, kinematic_equations_constant_a_atomic] | K1-G2; **Diamond candidate**; **cognitive_error_target:** "displacement = distance always" — round-trip animation required |
| ↳ round_trip_displacement_zero_nano | Bengaluru→Mumbai→Bengaluru: distance = 2 × 980 km ≈ 1960 km; displacement = 0. Tabla-player travels back-and-forth between two notes: musically meaningful path; net displacement zero. **Cognitive scaffold** distinguishing scalar accumulation from vector return. | nano | ✅ | — | [displacement_vs_distance_atomic] | — | parent; **Indian-context anchor** |
| ↳ negative_displacement_meaning_nano | Choose +x to the right. Object moves 3m right then 7m left: x_final − x_initial = (0+3−7) − 0 = −4 m. Negative displacement = position now LEFT of start. Sign carries direction. | nano | ✅ | — | [displacement_vs_distance_atomic, sign_convention_1d_atomic] | — | parent; sign-mechanics scaffold |
| **avg_vs_instantaneous_velocity_atomic** | **Average velocity** v_avg = Δx/Δt over finite interval. **Instantaneous velocity** v = dx/dt = lim_{Δt→0} Δx/Δt. **Speed** = |v| = magnitude only (scalar). Average velocity ≠ average speed in general (round-trip: v_avg = 0 but avg speed ≠ 0). | atomic | ✅ | — | [displacement_vs_distance_atomic, calculus_basic_derivative(math-tools)] | [acceleration_definition_atomic, kinematic_equations_constant_a_atomic, xt_vt_at_graphs_atomic] | K1-G3; **cognitive_error_target:** "v_avg = (v₁+v₂)/2 always" → only for constant a |
| ↳ instantaneous_as_slope_of_xt_nano | Geometrically: v(t) at instant t = slope of x-t graph at that point. Tangent-line construction. **CBSE/ISC physics-practical lab**: students sketch x-t curves and compute slopes at chosen instants. | nano | ✅ | — | [avg_vs_instantaneous_velocity_atomic, xt_vt_at_graphs_atomic] | — | parent; **education anchor** |
| ↳ average_velocity_vs_average_speed_nano | Mumbai-Pune Expressway: drive 150 km in 3 hr (Mumbai→Pune). Then drive back 150 km in 2 hr. **Average velocity** = (0 km displacement) / (5 hr) = 0. **Average speed** = (300 km) / (5 hr) = 60 km/hr. Two different scalars; both useful, different questions. | nano | ✅ | — | [avg_vs_instantaneous_velocity_atomic, displacement_vs_distance_atomic] | — | parent; **transport/Indian-Highway anchor** |
| **acceleration_definition_atomic** | **Acceleration** a = dv/dt = rate of change of velocity. Average acceleration a_avg = Δv/Δt; instantaneous a = lim_{Δt→0} Δv/Δt. **Sign carries direction**: positive a means v increasing in +x direction (if v already +); but if v is −, positive a means v becoming LESS NEGATIVE (slowing down then reversing). | atomic | ✅ | — | [avg_vs_instantaneous_velocity_atomic, calculus_basic_derivative(math-tools)] | [kinematic_equations_constant_a_atomic, free_fall_gravity_atomic, newton_2nd_law_atomic(T11)] | K1-G4; **Diamond candidate**; **cognitive_error_target:** "negative a always means slowing down" → depends on sign of v |
| ↳ sign_of_a_vs_sign_of_v_2x2_matrix_nano | **4 cases** (with +x as positive): (a>0, v>0) → speeding up forward; (a>0, v<0) → slowing down then reversing forward; (a<0, v>0) → slowing down then reversing backward; (a<0, v<0) → speeding up backward. **Diamond-candidate animation**: 2×2 grid showing object behaviour each case. | nano | ✅ | — | [acceleration_definition_atomic, sign_convention_1d_atomic] | — | parent; cognitive scaffold |
| ↳ deceleration_vs_negative_acceleration_nano | **Deceleration** = magnitude of acceleration opposing velocity. **Negative acceleration** = a < 0 in chosen sign convention. These are NOT synonyms. A car moving left (v < 0) with brakes (a > 0): "decelerating" but positive a. | nano | ✅ | — | [acceleration_definition_atomic] | — | parent; cognitive scaffold |
| **kinematic_equations_constant_a_atomic** | When acceleration is constant: **(1) v = u + at**; **(2) s = ut + ½at²**; **(3) v² = u² + 2as**. All three derive from integrating a = constant; they are three rearrangements (one for each unknown). **Use what's given.** Also **s_n = u + ½a(2n−1)** for displacement in nth second. | atomic | ✅ | — | [acceleration_definition_atomic, avg_vs_instantaneous_velocity_atomic, calculus_integration(math-tools)] | [free_fall_gravity_atomic, projectile_motion_atomic(T8)] | K1-G5; **cognitive_error_target:** "memorise three formulas" → derive from a=constant once; pick by what's given |
| ↳ s_n_displacement_in_nth_second_nano | Displacement during the nth second (between t=n−1 and t=n) = u + ½a(2n−1). **Common JEE/NEET problem-template**. Derive from s_n = s(n) − s(n−1) using eq.(2). | nano | ✅ | — | [kinematic_equations_constant_a_atomic] | — | parent; problem-pattern |
| ↳ choice_of_equation_by_given_unknown_nano | If given (u, a, t) → use (1) for v. If given (u, a, t) → use (2) for s. If given (u, a, s) → use (3) for v. If given (v, u, s) → use (3) for a. **Decision-tree pedagogy** rather than blind memorisation. | nano | ✅ | — | [kinematic_equations_constant_a_atomic] | — | parent; problem-solving scaffold |
| **xt_vt_at_graphs_atomic** | Three synchronised views of same motion: **x-t graph** position vs time; **v-t graph** velocity vs time; **a-t graph** acceleration vs time. Relationships: slope of x-t = v(t); slope of v-t = a(t); area under v-t between t₁ and t₂ = Δx; area under a-t = Δv. | atomic | ✅ | — | [avg_vs_instantaneous_velocity_atomic, acceleration_definition_atomic, calculus_integration_area_under_curve(math-tools)] | [projectile_motion_atomic(T8)] | K1-G6; **Diamond candidate**; multi-panel synchronised graph animation |
| ↳ shape_decoder_table_nano | x-t straight line = uniform v; x-t parabola opening up = positive a; x-t curve flattening = decelerating; v-t horizontal = zero a (uniform motion); v-t straight rising = constant positive a; v-t straight falling = constant negative a. **Cognitive scaffold**: shape ↔ physical meaning table. | nano | ✅ | — | [xt_vt_at_graphs_atomic] | — | parent; **CBSE/ISC physics-practical pedagogy** |
| ↳ area_under_vt_equals_displacement_nano | ∫_{t₁}^{t₂} v(t) dt = x(t₂) − x(t₁) = Δx. Geometric interpretation: signed area under v-t curve gives signed displacement. **Negative areas** (below t-axis) = negative displacement (motion in −x direction). | nano | ✅ | — | [xt_vt_at_graphs_atomic, calculus_integration_area_under_curve(math-tools)] | — | parent; calculus-geometric bridge |
| **free_fall_gravity_atomic** | Specialisation of constant-a kinematics: a = g downward (= 9.81 m/s² near Earth surface; round to 10 for problems). Drop from rest: v = gt; s = ½gt²; v² = 2gs. Throw up with u: max-height at t = u/g; max-height = u²/(2g); time-of-flight (return to start) = 2u/g. | atomic | ✅ | — | [kinematic_equations_constant_a_atomic, sign_convention_1d_atomic] | [projectile_motion_atomic(T8)] | K1-G7; **cognitive_error_target:** "heavier objects fall faster" → mandatory feather-vs-coin vacuum-tube demo |
| ↳ feather_coin_vacuum_demo_nano | Aristotle: heavier falls faster (incorrect). Galileo (~1590): all bodies fall at same rate in absence of air. **Bell-jar + feather + coin demonstration**: with air, coin lands first; with vacuum, both land together. **CBSE Class-11 lab demo** + Apollo-15 hammer-feather on Moon (David Scott, 1971; relevant for Chandrayaan-curious students). | nano | ✅ | — | [free_fall_gravity_atomic] | — | parent; cognitive-error countermeasure; **education + space anchor** |
| ↳ thrown_up_kinematics_nano | Object thrown up with u (+y up): max-height at t = u/g, v = 0; max-height = u²/(2g); returns with same speed |u| at t = 2u/g, v = −u. **Symmetric in time** (up-down) but NOT in distance (max-height reached once). | nano | ✅ | — | [free_fall_gravity_atomic, kinematic_equations_constant_a_atomic] | — | parent |
| **sign_convention_1d_atomic** | **Pick a positive direction** (typically +x to the right, +y up). **EVERY quantity carries that sign**: position x, velocity v, acceleration a, force F, displacement Δx. Once chosen, stay consistent throughout the problem. **Foundation rule for all sign-bearing physics quantities downstream** (E, B, I, q, P, M_torque). | atomic | ✅ | — | [vector_resolution_atomic(T5)] | [displacement_vs_distance_atomic, acceleration_definition_atomic, free_fall_gravity_atomic, ALL downstream physics requiring sign] | K1-G8; **cognitive_error_target:** "g is always −9.81" → only when up is positive; sign-convention foundation |
| ↳ pick_axis_first_then_substitute_nano | Worked-example pedagogy: **(a) declare** "+x to the right"; **(b) write** all knowns with explicit sign (u = +5 m/s, a = −2 m/s²); **(c) substitute** into kinematic eq. **Common error**: dropping signs midway through problem. Mandatory checklist nano. | nano | ✅ | — | [sign_convention_1d_atomic] | — | parent; problem-solving discipline |
| **relative_velocity_1d_atomic** | Velocity of A relative to B: **v_AB = v_A − v_B**. If A moves at +30 m/s and B at +20 m/s (both rightward): v_AB = +10 m/s (A appears to recede from B at 10 m/s). If they move toward each other: signs differ → magnitudes add. **1D preview of T7 2D vector relative motion.** | atomic | ✅ | — | [position_frame_of_reference_atomic, sign_convention_1d_atomic] | [relative_velocity_2d_atomic(T7), boat_river_problem(T7), train_problem_classical_kinematics] | K1-G9; **cognitive_error_target:** "subtract speeds, ignore direction" → must preserve signs |
| ↳ train_passing_observer_nano | Two-train passing: same-direction (Mumbai-Delhi Rajdhani 110 km/hr passes goods 50 km/hr): relative speed = 60 km/hr; time to pass = (sum of lengths)/(rel speed). Opposite-direction: speeds add. **Classic Indian-railway-context problem.** | nano | ✅ | — | [relative_velocity_1d_atomic] | — | parent; **transport anchor** |
| ↳ pursuit_problem_nano | Pursuer at distance d, speed v_p; target at speed v_t (same direction, v_p > v_t). Catch-up time = d / (v_p − v_t). **Common JEE/NEET pattern.** | nano | ✅ | — | [relative_velocity_1d_atomic] | — | parent; problem-pattern |

**Atomic count:** 8. **Nano count:** 14. **Total entries:** 22.

---

## Section C — Cross-Source Coverage Matrix

| Atomic | NCERT 11.1 Ch.3 | HCV V1 Ch.3 | DCM M1 Ch.6 | Coverage |
|---|---|---|---|---|
| position_frame_of_reference_atomic | §3.1-3.2 | §3.1-3.2 | §6.1 | TRIPLE |
| displacement_vs_distance_atomic | §3.3 | §3.2 | §6.2 | TRIPLE |
| avg_vs_instantaneous_velocity_atomic | §3.4 | §3.3-3.4 | §6.3 | TRIPLE |
| acceleration_definition_atomic | §3.5 | §3.5 | §6.4 | TRIPLE |
| kinematic_equations_constant_a_atomic | §3.6 | §3.6 | §6.5 | TRIPLE |
| xt_vt_at_graphs_atomic | §3.7 | §3.7 | §6.6 | TRIPLE |
| free_fall_gravity_atomic | §3.6 ex | §3.6 | §6.7 | TRIPLE |
| sign_convention_1d_atomic | §3.3 (implicit) | §3.4 | §6.2 | TRIPLE (NCERT implicit; full in DCM + HCV) |
| relative_velocity_1d_atomic | §3.8 | §3.8 (partial) | §6.8 | TRIPLE |

**Triple-coverage rate: 9 of 9 atomics = 100%.** **15th 100% topic in 37 pilots.** **STREAK EXTENDS TO 7 CONSECUTIVE 100% topics** (T18 → T20 → T25 → T19 → T22 → T23 → T6) — extends prior 6-consecutive record set Session 54.

---

## Section D — Stage-3 Math-Tool Dependencies

| Math-tool primitive | Used by | Status |
|---|---|---|
| `calculus_basic_derivative` (dx/dt, dv/dt) | avg_vs_instantaneous_velocity_atomic, acceleration_definition_atomic | REQUIRED (existing) |
| `calculus_integration` (∫a dt = v; ∫v dt = x) | kinematic_equations_constant_a_atomic | REQUIRED (existing) |
| `calculus_integration_area_under_curve` (geometric interpretation) | xt_vt_at_graphs_atomic | REQUIRED (existing) |
| `algebra_quadratic` (s = ut + ½at² in t) | kinematic_equations_constant_a_atomic | REQUIRED (existing; validated Session 50) |
| `algebra_simultaneous_2var` (multi-unknown kinematics problems) | kinematic_equations_constant_a_atomic | REQUIRED (existing; validated Session 50) |
| `geometric_slope_of_curve` (slope-of-x-t = v) | xt_vt_at_graphs_atomic | REQUIRED (existing) |
| `algebra_signed_scalar` (sign-convention arithmetic) | sign_convention_1d_atomic, all atomics | REQUIRED (existing) |

**ZERO new stubs registered.** All math-tools REQUIRED, already validated. Math-tools IN-degree unchanged: **52**. **Light-maintenance mode continues 6 consecutive sessions** (S50 → S51 → S52 → S53 → S54 → S55) — **EXTENDS LONGEST zero-stub streak** (prior record 5 sessions).

---

## Section E — Cross-Topic Dependencies (Bidirectional Edges)

### Outgoing (T6 requires from earlier topics)

| Target topic | Edge | Reason |
|---|---|---|
| **T5 Vectors** | position_frame_of_reference_atomic ← T5 vector_resolution; sign_convention_1d ← T5 vector basics | Pre-existing T5 (in repo) |
| Math-tools | 7 primitives (zero new stubs) | All REQUIRED |

### Incoming (T6 will be required by later topics — MANY back-edge closures)

| Source topic | Edge | Reason |
|---|---|---|
| **T7 2D Kinematics (intra-session)** | T6 all atomics ← T7 vector-extensions | **Intra-session bidirectional** (8 edges; see T7 §E) |
| **T11 Newton's Laws (back-edge)** | T11 newton_2nd_law ← T6 acceleration_definition + sign_convention; T11 inertial_frame ← T6 position_frame_of_reference | **CLOSES** T11 Session-50 anticipated forward (5-session lag) |
| **T12 Friction (back-edge)** | T12 friction_problems ← T6 kinematic_equations + sign_convention | **CLOSES** T12 Session-35 anticipated forward (20-session lag — matches longest-lag record) |
| **T13 Work-Energy (back-edge)** | T13 work_energy_theorem ← T6 displacement; T13 kinetic_energy ← T6 velocity-definition | **CLOSES** T13 Session-37 anticipated forward (18-session lag) |
| **T14 Momentum & Collisions (back-edge)** | T14 impulse ← T6 velocity; T14 momentum ← T6 velocity | **CLOSES** T14 Session-50 anticipated forward (5-session lag) |
| **T15 Rotational Mechanics (back-edge)** | T15 angular_kinematics ← T6 linear_kinematics analog | **CLOSES** T15 Session-51 anticipated forward (4-session lag) |
| **T17 SHM (back-edge)** | T17 SHM_at_fixed_point ← T6 avg_vs_instantaneous_velocity + acceleration_definition | **CLOSES** T17 Session-38 anticipated forward (17-session lag) |
| **T21 Wave Motion (back-edge weak)** | T21 wave_velocity ← T6 velocity-definition | **CLOSES** T21 Session-33 anticipated forward (22-session lag — **NEW LONGEST-LAG**, beats prior 20-session record) |
| **T19 Wave Equation (back-edge)** | T19 particle_vs_wave_velocity ← T6 instantaneous_velocity | **CLOSES** T19 Session-53 anticipated forward (2-session lag) |
| **T26 Thermodynamics (back-edge weak)** | T26 PV-cycle-kinematics analog (weak) | weak — no direct edge |
| **T34 Current Electricity (back-edge weak)** | T34 drift_velocity ← T6 avg_velocity formalism | weak — analogy edge |
| **T35 EM Induction (back-edge weak)** | T35 motional_emf ← T6 velocity | weak |
| **T36 Moving Charges (back-edge)** | T36 cyclotron_motion ← T6 acceleration_definition + kinematic-arc | weak forward closure |
| Math-tools | (already counted) | |

### T6 ↔ T7 intra-session bidirectional edges (8 edges; intra-cluster chapter-adjacent)

1. T6 `position_frame_of_reference_atomic` ↔ T7 `position_frame_of_reference_2d_extension` (vector-extension)
2. T6 `displacement_vs_distance_atomic` ↔ T7 `vector_displacement_2d` (vector form)
3. T6 `avg_vs_instantaneous_velocity_atomic` ↔ T7 `velocity_vector_2d` (vector form)
4. T6 `acceleration_definition_atomic` ↔ T7 `acceleration_vector_2d` (vector form)
5. T6 `kinematic_equations_constant_a_atomic` ↔ T7 `2d_kinematic_equations_componentwise` (componentwise application)
6. T6 `xt_vt_at_graphs_atomic` ↔ T7 `parametric_2d_trajectory` (2D parametric extension)
7. T6 `relative_velocity_1d_atomic` ↔ T7 `relative_velocity_2d_atomic` (vector generalisation — Galilean transformation)
8. T6 `sign_convention_1d_atomic` ↔ T7 `2d_axis_choice_convention` (axis pair vs single axis)

**8 bidirectional edges = intra-cluster chapter-adjacent density band (6-9 range).** **9th data point validating density rule.** **Same-NCERT-chapter-adjacent split** (Ch.3 → Ch.4): same predictor class as T41↔T42 (Ch.9 split = 7), T26↔T27 (adjacent = 7), T19↔T22 (Ch.14 split = 6), T11↔T14 (Ch.5+7 = 8). 8 edges sits at upper-middle of band.

**Total outgoing: 7 math-tools + 1 T5 prereq.**
**Total incoming: 8 back-edge closures (T11/T12/T13/T14/T15/T17/T19/T21) + 8 intra-session bidirectional with T7.**

**ANTICIPATED-FORWARD-EDGE CLOSURE COUNT: 8 in single topic.** Foundation chapters close most back-edges — every Mechanics + Wave catalog has been assuming T6 kinematics defined. T6 is the **single largest back-edge-closure topic** in matrix history.

---

## Section F — Real-World Anchors (STRONG, Indian-context)

| Anchor | Concept hook | Authoring use | Strand |
|---|---|---|---|
| **Indian Railways — Rajdhani / Vande Bharat / goods-train kinematics** | relative_velocity_1d_atomic, avg_vs_instantaneous_velocity_atomic, train_passing_observer_nano | "Mumbai-Delhi Rajdhani 110 km/hr Vande Bharat 130 km/hr — passing each other on parallel tracks: relative velocity classic problem" | Transport |
| **Delhi Metro + Mumbai Metro + Bengaluru Namma Metro — acceleration profiles** | acceleration_definition_atomic, kinematic_equations_constant_a_atomic | "Metro trains accelerate at ~1 m/s² to cruise 70 km/hr in ~20 sec — classic constant-a application" | Transport |
| **Indian cricket pace bowlers (Bumrah, Shami) — ball acceleration + speed-gun** | acceleration_definition_atomic, avg_vs_instantaneous_velocity_atomic | "Bumrah delivery: ball goes 0 → 145 km/hr in arm-swing ~0.15 s (a ≈ 270 m/s² peak); speed-gun gives instantaneous v at release point" | Sports |
| **Mumbai-Pune Expressway + Yamuna Expressway — average vs instantaneous speed** | average_velocity_vs_average_speed_nano, avg_vs_instantaneous_velocity_atomic | "Mumbai-Pune 150 km in 3 hrs cruise: average speed 50 km/hr; speedometer instantaneous reading varies 0-120 km/hr" | Transport / Infrastructure |
| **Bengaluru autorickshaw + Mumbai BEST bus — stop-and-go signed velocity** | sign_convention_1d_atomic, relative_velocity_1d_atomic | "Autorickshaw turns around in traffic: velocity reverses sign; brake while reversing = positive acceleration but negative velocity (sign-paradox demo)" | Transport / Consumer |
| **Indian CBSE/ISC Class-11 physics-practical — inclined-plane + ticker-tape timer** | kinematic_equations_constant_a_atomic, xt_vt_at_graphs_atomic | "Trolley sliding down inclined plane with ticker-tape timer; measure displacement-per-interval, plot x-t and v-t — direct experimental verification of kinematic equations" | Education |
| **IIT physics labs (IITB, IITM, IITD) — free-fall apparatus + photogate timers** | free_fall_gravity_atomic, kinematic_equations_constant_a_atomic | "Standard undergrad lab: drop ball through photogates, measure g; expected ~9.78 m/s² (varies by latitude across India)" | Research / Education |
| **ISRO PSLV/GSLV rocket launches — Sriharikota — acceleration profile** | acceleration_definition_atomic, kinematic_equations_constant_a_atomic, free_fall_gravity_atomic | "PSLV launch: t=0 to ~120 sec first-stage burn; a varies 0 → 4g as mass burns off; classic non-constant-a real-world problem (extension of T6 framework)" | Space |
| **Vehicle speedometer + odometer + GPS — Indian commuter daily experience** | avg_vs_instantaneous_velocity_atomic, displacement_vs_distance_atomic | "Speedometer = instantaneous |v|; odometer = total distance (scalar, accumulating); Google Maps gives displacement (vector, point-to-point)" | Consumer |
| **Apple Health + Google Fit step-counter + run-tracking** | displacement_vs_distance_atomic, average_velocity_vs_average_speed_nano | "Step-counter counts distance walked (scalar); GPS gives displacement; Indian users 1 billion+ smartphones daily-anchor" | Consumer |
| **IMD weather-balloon ascent + descent profile** | acceleration_definition_atomic, xt_vt_at_graphs_atomic | "IMD radiosondes: balloon ascent at ~5 m/s constant; bursts at ~30 km altitude; descent under parachute — classic v-t graph problem" | Meteorology / Research |

**Total: 11 distinct institutional/system anchors across 7 strands** (transport, sports, consumer, research, education, space, meteorology). **Falls short of strand-diversity ≥ 8 VERY-STRONG threshold.** **Decision (K1-G10): STRONG**. **23rd foundational-physics STRONG data point.** Missing defence + telecom + healthcare strands — kinematics is too abstract to anchor those naturally.

---

## Section G — Cognitive-Error-Prevention Decisions

**6 of 11 founder decisions are cognitive-error-prevention type = 55%.** **NEW SINGLE-TOPIC HIGH** (passes T20 Fluid Mechanics 50%). Well above 35% threshold; elevated EPIC-L gate applies:

| Tag | cognitive_error_target | Countermeasure |
|---|---|---|
| **K1-G2** | "displacement and distance are interchangeable" | Mandatory round-trip animation (Bengaluru→Mumbai→Bengaluru) showing distance accumulates but displacement returns to zero |
| **K1-G3** | "v_avg = (v₁+v₂)/2 always" | Mandatory worked-example showing this only holds for constant a; counterexample with non-uniform motion |
| **K1-G4** | "negative a always means slowing down" | Mandatory 2×2 sign-of-a-vs-sign-of-v matrix animation |
| **K1-G5** | "memorise three formulas separately" | Decision-tree pedagogy: pick equation by given-unknown pair |
| **K1-G7** | "heavier objects fall faster" | Mandatory feather-vs-coin vacuum-tube demo + Apollo-15 hammer-feather Moon footage reference |
| **K1-G8** | "g is always −9.81" | Mandatory "pick axis FIRST then substitute" workflow nano |
| **K1-G9** | "subtract speeds, ignore direction" | Mandatory signed-velocity example (train both directions vs same direction) |

**Foundation chapters carry highest cognitive-error density** because sign-conventions, vector-vs-scalar distinctions, and instantaneous-vs-average distinctions are baked in here and inherited by ALL downstream physics. **T6 establishes the 55% new single-topic high; pattern hypothesis**: Kinematics-formalisation cluster will show consistently elevated cognitive-error share (T6, T7, T8, T9 likely all >40%).

---

## Section H — V1 Priority Flags

| Atomic | V1? | Reason |
|---|---|---|
| sign_convention_1d_atomic | ✅ | **FOUNDATIONAL** — every downstream physics topic inherits sign-convention; ship in V1 even if low-glamour |
| displacement_vs_distance_atomic | ✅ | Diamond candidate; round-trip animation; foundational vector-vs-scalar distinction |
| acceleration_definition_atomic | ✅ | Diamond candidate; sign-of-a-vs-v 2×2 matrix; cognitive-error rich |
| kinematic_equations_constant_a_atomic | ✅ | Pure-curricular essential; every JEE/NEET problem |
| free_fall_gravity_atomic | ✅ | Aristotle-Galileo historical arc; feather-coin demo; universal anchor |
| xt_vt_at_graphs_atomic | ⚖️ | V1.1; multi-panel graph animation; CBSE/ISC physics-practical aligned |
| avg_vs_instantaneous_velocity_atomic | ⚖️ | V1.1; calculus-introduction bridge |
| relative_velocity_1d_atomic | ⚖️ | V1.1; transport-anchor; preview for T7 2D |
| position_frame_of_reference_atomic | ⚖️ | V1.2; abstract; less student-direct demand |

**V1 ship count for T6: 5 atomics.** Highest single-topic V1 ship count of the kinematics-formalisation cluster (because foundation-essentiality).

---

## Section I — Open Questions

1. **Non-constant acceleration motion** (a = a(t), a(x), a(v)) — covered as nanos within `acceleration_definition_atomic`; consider promotion to atomic in V2 (especially for JEE-Advanced students).
2. **Variable-mass motion / Tsiolkovsky rocket equation** — ISRO-context-strong; defer to T14 Momentum and T8 Projectile contexts.
3. **Differential-equation-style kinematics** (motion with damping, viscosity) — graduate; defer.
4. **Average velocity vs harmonic mean for special problems** (round-trip with different one-way speeds) — common JEE pattern; covered as nano under `average_velocity_vs_average_speed_nano`; consider promotion.
5. **Kinematics-formalisation cluster check** — T6 opens (1/3 or 1/4); T7 same session; T8 + T9 remain. **Recommended Session 56**: T8 Projectile Motion + T9 Motion-in-Plane (cluster closer batch).

---

## Section J — Sign-Off

- Authored: Session 55, 2026-05-26.
- Author: Claude (Architect+Engineer role).
- Coverage class: **TRIPLE**.
- Anchor density: **STRONG** (11 anchors × 7 strands — 23rd foundational-physics STRONG data point).
- Triple-coverage rate: **100%** (9/9 atomics) — **15th observed 100% topic**; **streak extends to 7 consecutive** (T18 → T20 → T25 → T19 → T22 → T23 → T6).
- Atomic count: **8**. Nano count: **14**. Total: **22 entries**.
- V1 ship count: **5 atomics** (largest single-topic V1 ship in recent sessions).
- **Closes anticipated forward-edges: 8** (T11/T12/T13/T14/T15/T17/T19/T21) — **single-largest back-edge-closure topic in matrix history**.
- **NEW LONGEST-LAG closure: 22-session lag** (T21 Session 33 → T6 Session 55 wave_velocity ← T6 velocity-definition). Beats prior 20-session record.
- **Kinematics-formalisation cluster OPENED (1/4 — T6 done; T7 same session; T8, T9 remain).**
- **0 new math-tools stubs registered. Light-maintenance mode 6 consecutive sessions — NEW LONGEST zero-stub streak.**
- Cognitive-error-prevention founder-decision share: **55%** (6/11) — **NEW SINGLE-TOPIC HIGH** (passes T20 Fluid Mechanics 50%).
- Next pilot batch: T7 2D Kinematics/Relative Motion (intra-session paired-batch with T6).

---

*15th 100% topic; 23rd foundational-physics STRONG. Streak = 7 consecutive 100% topics (longest ever). Single-largest back-edge-closure topic in matrix history (8 anticipated forwards closed). 22-session lag closed (T21 wave-velocity, beats prior 20-session record). 55% cognitive-error founder-decision share — NEW single-topic HIGH. Foundation-chapter hypothesis: kinematics-formalisation cluster all >40% cognitive-error.*
