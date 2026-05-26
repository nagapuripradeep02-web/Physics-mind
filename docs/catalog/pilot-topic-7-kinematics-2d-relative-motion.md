# Pilot Topic 7 — Kinematics 2D / Relative Motion (Motion in a Plane — Part 1)

> Stage-2 pilot catalog. 38th of 44. **Kinematics-formalisation cluster MIDDLE** (sibling T6 1D Kinematics shipped intra-session; T8 Projectile + T9 Motion-in-Plane remain for cluster closure Session 56).
> Sources: **NCERT Class 11 Part 1 Ch.4 Motion in a Plane** (canonical spine — vector-position + vector-velocity + vector-acceleration + uniform-circular-motion intro + relative-velocity 2D + projectile lead-in §4.1-4.9 excluding §4.10 which is T8 territory) + **HCV Vol 1 Ch.3 §3.8-3.11 + Ch.4 Motion in a Plane** (vector-kinematics derivation + 2D relative-motion + boat-river problems) + **DC Pandey Mechanics Vol 1 Ch.7 Motion in a Plane §7.1-7.6** (problem-pattern density: river-boat + rain-umbrella + train-platform problems).
> Coverage class: **TRIPLE-COVERED**.
> Anchor density: **STRONG** (10 anchors × 6 strands — transport + sports + consumer + research + meteorology + space). Strong river-crossing + rain-umbrella + transport-relative-motion anchoring. Misses defence + telecom + healthcare + industry strands — falls short of VERY-STRONG.
> **Critical role:** T7 formalises **vector-form kinematics** + **Galilean transformation** + **classical river/rain/train relative-motion problems** — every Mechanics + Wave + E&M topic with 2D motion (projectile, circular, EM-induction-in-rotating-frame) inherits T7 vector machinery. **Closes T8/T9/T10/T11 anticipated back-edges**. **Bridges directly to T8 Projectile + T10 Circular Motion.**

---

## Founder Decisions Applied

| Tag | Decision |
|---|---|
| **K2-G1** | Atomic granularity = "one vector-kinematic-quantity OR one relative-motion-archetype OR one component-method-application." Position-vector + velocity-vector + acceleration-vector + 2D-equations + relative-velocity-2D + 4 classical archetypes (river-boat, rain-umbrella, train-platform, two-projectile) = 6-8 atomics. T7 STOPS at vector-formalism + relative-motion; projectile-motion proper = T8. |
| **K2-G2** | **Vector position/velocity/acceleration are ONE atomic** (`vector_kinematics_2d_atomic`) — r⃗(t) = x(t) î + y(t) ĵ; v⃗ = dr⃗/dt; a⃗ = dv⃗/dt. **Componentwise**: each component obeys 1D kinematics independently. **Diamond candidate** — vector-trajectory animation with component-projection arrows. |
| **K2-G3** | **2D kinematic equations are nano under vector-kinematics** (`2d_kinematic_equations_componentwise_nano`) — same three equations as 1D, applied independently to x and y components. **cognitive_error_target:** "2D needs new formulas" → no; component-method reduces 2D to two independent 1D problems. |
| **K2-G4** | **Galilean transformation is its own atomic** (`galilean_transformation_atomic`) — v⃗_AB = v⃗_A − v⃗_B (vector subtraction). All inertial frames give the same a⃗ and Δt. **Foundation for ALL classical relative-motion problems**. **cognitive_error_target:** "frame doesn't matter, just speeds" → vector subtraction; direction matters. |
| **K2-G5** | **River-boat / boat-crossing problem is its own atomic** (`boat_river_crossing_atomic`) — boat velocity v_b in still water; river current v_r; resultant v⃗_actual = v⃗_b + v⃗_r. Two questions: (a) shortest TIME crossing (head straight across) — drift downstream; (b) shortest PATH crossing (head upstream at angle) — slower crossing. **Diamond candidate** — boat-vector animation with current. **cognitive_error_target:** "shortest time = shortest path" → no, two different optimisations. |
| **K2-G6** | **Rain-umbrella / apparent-rain-velocity problem is its own atomic** (`rain_apparent_velocity_atomic`) — rain falls at v⃗_rain (typically vertical); observer moves at v⃗_obs. **Apparent rain velocity** = v⃗_rain − v⃗_obs (Galilean). Apparent direction makes angle θ = arctan(v_obs / v_rain) with vertical. **Indian-classic monsoon problem.** **cognitive_error_target:** "umbrella tilts in direction of motion" → CORRECT direction is opposite to motion (tilt umbrella INTO rain-apparent direction). |
| **K2-G7** | **Train-platform-passenger and ground-aircraft-wind problems are nano under Galilean** (`train_platform_passenger_nano`, `aircraft_wind_correction_nano`) — same Galilean machinery applied to different real-world archetypes. Avoids atomic-proliferation. |
| **K2-G8** | **Two-projectile collision problem** = nano under T8 (projectile motion proper) — flagged here as forward-link to T8 paired-batch (Session 56). |
| **K2-G9** | **STRONG anchor (formalised criterion)** — 10 anchors × 6 strands. Strong transport (Indian-Railways trains-passing-platforms + IndiGo/Air-India aircraft-wind-correction + autorickshaw-traffic) + sports (cricket-fielder-running-to-catch + IPL-bowler-fielder-relative) + consumer (Indian monsoon rain-umbrella + Goa boat-tourism river-crossing) + research/education (CBSE physics lab vector-boat-experiment + IIT physics-practical) + space (ISRO satellite relative-velocity vs space-debris) + meteorology (IMD wind-direction relative-motion vs aircraft). Misses defence + telecom + healthcare + industry strands → STRONG. **24th foundational-physics STRONG data point.** |
| **K2-G10** | **Cognitive-error-prevention sub-category — 5 instances** (K2-G3 2D-needs-new-formulas; K2-G4 frame-doesn't-matter; K2-G5 shortest-time-equals-shortest-path; K2-G6 umbrella-tilt-direction; implicit "components are independent except cross-coupling exists"). Founder-decision share: 5/10 = 50%. **Sustains Kinematics-cluster cognitive-error density hypothesis** (T6 = 55%, T7 = 50%); both above prior session highs. **Foundation-chapter pattern confirmed.** |

---

## Section A — Source Map

| Sub-topic | NCERT 11.1 Ch.4 | HCV V1 Ch.3-4 | DCM M1 Ch.7 |
|---|---|---|---|
| Position vector | §4.1-4.2 | §4.1 | §7.1 |
| Velocity + acceleration vectors | §4.3-4.4 | §4.2-4.3 | §7.2 |
| Componentwise 2D kinematic equations | §4.5 | §4.4 | §7.3 |
| Projectile motion intro | §4.10 (T8 owns) | §4.5 (T8 owns) | §7.7 (T8 owns) |
| Uniform circular motion intro | §4.11 (T10 owns) | §4.6 (T10 owns) | §7.8 (T10 owns) |
| Relative velocity 2D | §4.9 | §3.10-3.11 | §7.4 |
| Boat-river problem | (passing) | §3.11 ex | §7.5 |
| Rain-umbrella problem | (passing) | §3.10 ex | §7.6 |

**NCERT Ch.4 is the canonical spine for vector-kinematics**. **HCV Ch.3 §3.8+ extension + Ch.4 §4.1-4.4** carries the rigorous derivation. DCM M1 Ch.7 carries problem-pattern density for all 4 classical archetypes (boat-river, rain-umbrella, train-platform, aircraft-wind).

**Cross-link to T8 + T10:** Projectile motion §4.10 + circular motion §4.11 are nominally in NCERT Ch.4 but are owned by T8 + T10 respectively. T7 stops at vector-kinematics + relative-motion foundation.

---

## Section B — Atomic + Nano Catalog

| ID | Concept | Type | Sim? | In repo? | Requires | Required-by | Notes |
|---|---|---|---|---|---|---|---|
| **vector_kinematics_2d_atomic** | Position **r⃗(t) = x(t) î + y(t) ĵ**; velocity **v⃗ = dr⃗/dt = (dx/dt) î + (dy/dt) ĵ**; acceleration **a⃗ = dv⃗/dt**. **Componentwise principle**: in absence of constraints, x-motion and y-motion are INDEPENDENT — each obeys 1D kinematics separately. | atomic | ✅ | — | [vector_resolution_atomic(T5), position_frame_of_reference_atomic(T6), avg_vs_instantaneous_velocity_atomic(T6), acceleration_definition_atomic(T6)] | [galilean_transformation_atomic, boat_river_crossing_atomic, projectile_motion_atomic(T8), uniform_circular_motion_atomic(T10)] | K2-G2; **Diamond candidate**; foundation of all 2D Mechanics |
| ↳ 2d_kinematic_equations_componentwise_nano | Same three kinematic equations as 1D applied independently to x and y: v_x = u_x + a_x·t; v_y = u_y + a_y·t; x = x₀ + u_x·t + ½·a_x·t²; y = y₀ + u_y·t + ½·a_y·t². **No new formulas** — just two parallel applications of 1D machinery. | nano | ✅ | — | [vector_kinematics_2d_atomic, kinematic_equations_constant_a_atomic(T6)] | — | parent; K2-G3; **cognitive_error_target:** "2D needs new formulas" → no, componentwise |
| ↳ parametric_2d_trajectory_nano | Eliminate t between x(t) and y(t) → trajectory y(x). For constant a⃗: trajectory is parabola in general. **Geometric vs kinematic dual representation.** Bridge to T8 projectile-motion trajectory derivation. | nano | ✅ | — | [vector_kinematics_2d_atomic, 2d_kinematic_equations_componentwise_nano] | [projectile_trajectory_parabola(T8)] | parent; bridge to T8 |
| ↳ vector_displacement_magnitude_direction_nano | |Δr⃗| = √(Δx² + Δy²); direction θ = arctan(Δy/Δx). **Pythagoras + arctan applied to displacement**. Same idea applies to velocity, acceleration. | nano | ✅ | — | [vector_kinematics_2d_atomic, vector_resolution_atomic(T5)] | — | parent |
| **galilean_transformation_atomic** | Two inertial frames S and S' with S' moving at constant velocity v⃗_S'S relative to S. **Velocity transformation:** v⃗_PS = v⃗_PS' + v⃗_S'S (velocity of particle in S = velocity in S' + velocity of S' wrt S). **Acceleration is invariant:** a⃗ same in all inertial frames. **Time is invariant** (classical, pre-relativistic). | atomic | ✅ | — | [vector_kinematics_2d_atomic, position_frame_of_reference_atomic(T6), inertial_vs_noninertial_frame_nano(T6)] | [boat_river_crossing_atomic, rain_apparent_velocity_atomic, newton_laws_in_inertial_frames(T11)] | K2-G4; foundation of classical relative-motion |
| ↳ velocity_subtraction_for_relative_v_nano | **v⃗_AB = v⃗_A − v⃗_B** (velocity of A in B's frame). Same formula in 1D and 2D. Vector subtraction = magnitude + direction (not just magnitude). | nano | ✅ | — | [galilean_transformation_atomic, vector_kinematics_2d_atomic] | — | parent |
| ↳ acceleration_invariance_inertial_nano | a⃗_PS = a⃗_PS' (acceleration the same in all inertial frames). **Why F⃗ = ma⃗ holds in any inertial frame** (Newton 1st-law statement). Bridge to T11. | nano | ✅ | — | [galilean_transformation_atomic, vector_kinematics_2d_atomic] | [newton_1st_law(T11)] | parent; bridge to T11 |
| ↳ time_invariance_classical_nano | Δt is the same for all inertial observers (classical). **Breaks down in special relativity** (v approaching c) — flagged for V2 advanced extension. For all Indian-curriculum physics (NCERT, JEE, NEET): time-invariance holds. | nano | — | — | [galilean_transformation_atomic] | — | parent; advanced extension flag |
| **boat_river_crossing_atomic** | Boat velocity v_b in still water; river current v_r downstream. **Resultant velocity** v⃗_actual = v⃗_b + v⃗_r. **Two distinct optimisations:** (a) **Shortest time**: boat heads straight across (perpendicular to bank); time = w/v_b; drift downstream = (v_r·w)/v_b. (b) **Shortest path** (= width w, no drift): boat heads upstream at angle θ such that v_b·sin(θ) = v_r; time = w/(v_b·cos(θ)) > w/v_b. | atomic | ✅ | — | [galilean_transformation_atomic, vector_kinematics_2d_atomic, vector_resolution_atomic(T5)] | — | K2-G5; **Diamond candidate**; **cognitive_error_target:** "shortest time = shortest path" → no, distinct optimisations |
| ↳ shortest_time_drift_calculation_nano | Shortest time: head perpendicular. **Crossing-time t = w / v_b** (independent of river current). **Drift x = v_r · t = (v_r · w) / v_b**. Lands x downstream of starting point. Goa-river-tourism-context-anchor. | nano | ✅ | — | [boat_river_crossing_atomic] | — | parent; **transport/consumer anchor** |
| ↳ shortest_path_angle_calculation_nano | Shortest path (no drift): need v⃗_actual perpendicular to current → v_b·sin(θ) = v_r → **θ = arcsin(v_r / v_b)**. Requires v_b > v_r (else cannot avoid drift). Crossing time = w / (v_b · cos(θ)) > w/v_b. **Slower crossing trades time for zero drift.** | nano | ✅ | — | [boat_river_crossing_atomic, vector_resolution_atomic(T5)] | — | parent; trigonometric application |
| ↳ feasibility_v_b_greater_v_r_nano | If v_b ≤ v_r: shortest-path solution doesn't exist (boat cannot make headway upstream). Boat drifts regardless of heading. **Real-world example**: Brahmaputra in monsoon (current ~10 km/hr, slow boat 5 km/hr) — boats CANNOT cross straight; drift is unavoidable. | nano | ✅ | — | [boat_river_crossing_atomic, shortest_path_angle_calculation_nano] | — | parent; physical-constraint nano |
| **rain_apparent_velocity_atomic** | Rain falls with v⃗_rain (typically vertical, downward); observer moves with v⃗_obs (typically horizontal). **Apparent rain velocity** as seen by observer = v⃗_apparent = v⃗_rain − v⃗_obs (Galilean transformation in observer's frame). **Apparent direction** makes angle θ with vertical: tan(θ) = v_obs / v_rain. | atomic | ✅ | — | [galilean_transformation_atomic, vector_kinematics_2d_atomic] | — | K2-G6; **Indian-monsoon-classic problem**; **cognitive_error_target:** umbrella-tilt-direction |
| ↳ umbrella_tilt_into_apparent_rain_nano | **Tilt umbrella INTO direction of apparent rain** (toward direction of motion). Common mis-intuition: "tilt umbrella backward to keep dry" — WRONG; that tilts away from rain. **Mandatory diagram**: stationary observer sees vertical rain → walks east → apparent rain tilts from east-down → umbrella tilts to east. | nano | ✅ | — | [rain_apparent_velocity_atomic] | — | parent; K2-G6 cognitive-error countermeasure |
| ↳ change_of_direction_when_observer_reverses_nano | If observer reverses direction, apparent-rain direction also reverses (mirror image about vertical). **Indian-monsoon biking anchor**: when biking east in rain, tilt umbrella east; when biking west, tilt umbrella west. Reversal demo. | nano | ✅ | — | [rain_apparent_velocity_atomic] | — | parent; cognitive scaffold |
| ↳ when_observer_runs_horizontal_only_nano | If v_rain is vertical and v_obs is horizontal: apparent-rain angle from vertical = arctan(v_obs / v_rain). Pure vertical rain (v_obs = 0) → no tilt. Faster observer → larger tilt. Cognitive scaffold for arctan-relationship. | nano | ✅ | — | [rain_apparent_velocity_atomic] | — | parent |
| **classical_relative_motion_archetypes_atomic** | Catalog of canonical relative-motion problem archetypes: (1) train-passenger-platform (Indian Railways daily), (2) aircraft-wind-correction (IndiGo navigation), (3) boat-river-crossing (covered separately as atomic), (4) rain-umbrella (covered separately), (5) cricket-fielder-running-to-catch (sports), (6) two-objects-meeting (general). All use **v⃗_AB = v⃗_A − v⃗_B**. | atomic | ✅ | — | [galilean_transformation_atomic, vector_kinematics_2d_atomic] | — | catalog wrapper for archetype-set; meta-atomic |
| ↳ train_platform_passenger_nano | Passenger walks on moving train. Velocity of passenger in ground frame = velocity of passenger in train frame + velocity of train in ground frame. **v⃗_PG = v⃗_PT + v⃗_TG.** Vande Bharat at 130 km/hr; passenger walking at 5 km/hr (forward in train) → 135 km/hr in ground frame. **Indian-Railways anchor.** | nano | ✅ | — | [classical_relative_motion_archetypes_atomic, galilean_transformation_atomic] | — | parent; K2-G7; **transport anchor** |
| ↳ aircraft_wind_correction_nano | IndiGo aircraft Delhi→Bengaluru: heading H ≠ track T because crosswind. v⃗_aircraft-ground = v⃗_aircraft-air + v⃗_air-ground (wind). Pilot must adjust heading to "crab" into wind. **IMD wind-velocity data + flight-planning anchor.** | nano | ✅ | — | [classical_relative_motion_archetypes_atomic, galilean_transformation_atomic] | — | parent; K2-G7; **transport/meteorology anchor** |
| ↳ cricket_fielder_running_to_catch_nano | Cricket ball travelling toward fielder at relative velocity (ball − fielder). Fielder runs in direction such that apparent-velocity vector is straight at them. **Predictive interception** = constant-bearing rule (ball appears stationary in fielder's field of view). IPL fielding-training drill. | nano | ✅ | — | [classical_relative_motion_archetypes_atomic, galilean_transformation_atomic] | — | parent; **sports anchor: IPL fielding** |
| ↳ two_objects_meeting_time_to_collision_nano | Two objects with velocities v⃗_A, v⃗_B and positions r⃗_A, r⃗_B. Relative position r⃗_AB = r⃗_A − r⃗_B; relative velocity v⃗_AB = v⃗_A − v⃗_B. They meet when r⃗_AB(t) = 0. **JEE/NEET problem-template** for two-particle kinematics. | nano | ✅ | — | [classical_relative_motion_archetypes_atomic, vector_kinematics_2d_atomic] | — | parent; problem-pattern |

**Atomic count:** 5. **Nano count:** 14. **Total entries:** 19.

---

## Section C — Cross-Source Coverage Matrix

| Atomic | NCERT 11.1 Ch.4 | HCV V1 Ch.3-4 | DCM M1 Ch.7 | Coverage |
|---|---|---|---|---|
| vector_kinematics_2d_atomic | §4.1-4.5 | §4.1-4.4 | §7.1-7.3 | TRIPLE |
| galilean_transformation_atomic | §4.9 (partial) | §3.10-3.11 | §7.4 | TRIPLE |
| boat_river_crossing_atomic | §4.9 ex (lite) | §3.11 ex | §7.5 | TRIPLE (NCERT lite) |
| rain_apparent_velocity_atomic | §4.9 ex (lite) | §3.10 ex | §7.6 | TRIPLE (NCERT lite) |
| classical_relative_motion_archetypes_atomic | §4.9 (catalog) | §3.10-3.11 (catalog) | §7.4-7.6 (catalog) | TRIPLE (all three present catalog) |

**Triple-coverage rate: 5 of 5 atomics = 100%.** **16th 100% topic in 38 pilots.** **STREAK EXTENDS TO 8 CONSECUTIVE 100% topics** (T18 → T20 → T25 → T19 → T22 → T23 → T6 → T7) — extends prior 7-consecutive record set Session 55-half.

---

## Section D — Stage-3 Math-Tool Dependencies

| Math-tool primitive | Used by | Status |
|---|---|---|
| `vector_addition_subtraction` (v⃗_A − v⃗_B) | galilean_transformation_atomic, all relative-motion atomics | REQUIRED (existing) |
| `vector_resolution_components` (decompose into x, y) | vector_kinematics_2d_atomic, boat_river_crossing_atomic | REQUIRED (existing; T5 origin) |
| `trig_arctan_for_angle` (θ = arctan(opposite/adjacent)) | rain_apparent_velocity_atomic, vector_displacement_magnitude_direction_nano | REQUIRED (existing) |
| `trig_sin_cos_for_resolution` (v_b·sin(θ), v_b·cos(θ)) | boat_river_crossing_atomic shortest-path | REQUIRED (existing) |
| `pythagoras_magnitude` (|v⃗| = √(v_x² + v_y²)) | vector_kinematics_2d_atomic | REQUIRED (existing) |
| `calculus_basic_derivative` (vector dr⃗/dt) | vector_kinematics_2d_atomic | REQUIRED (existing; T6 cross-use) |
| `algebra_simultaneous_2var` (two-objects-meeting) | classical_relative_motion_archetypes_atomic | REQUIRED (existing; cross-use) |

**ZERO new stubs registered.** All math-tools REQUIRED. Math-tools IN-degree unchanged: **52**. **Light-maintenance mode continues 6 consecutive sessions** (S50 → S51 → S52 → S53 → S54 → S55) — extends NEW LONGEST zero-stub streak.

---

## Section E — Cross-Topic Dependencies (Bidirectional Edges)

### Outgoing (T7 requires from earlier topics)

| Target topic | Edge | Reason |
|---|---|---|
| **T6 1D Kinematics (intra-session)** | All T7 atomics ← T6 1D-foundation (vector-extension) | **Intra-session bidirectional** (8 edges; see T6 §E) |
| **T5 Vectors** | vector_kinematics_2d_atomic ← T5 vector_addition + vector_resolution; boat_river_crossing ← T5 component-method | Pre-existing T5 (in repo) |
| Math-tools | 7 primitives (zero new stubs) | All REQUIRED |

### Incoming (T7 will be required by later topics)

| Source topic | Edge | Reason |
|---|---|---|
| **T8 Projectile Motion (anticipated forward)** | T8 projectile_trajectory ← T7 vector_kinematics_2d + componentwise; T8 max-range ← T7 parametric_trajectory | T8 next-session paired-batch (Session 56) |
| **T10 Circular Motion (back-edge)** | T10 uniform_circular ← T7 vector_velocity + vector_acceleration; T10 centripetal_acceleration ← T7 derivative-of-vector-velocity | **CLOSES** T10 Session-39 anticipated forward (16-session lag) |
| **T11 Newton's Laws (back-edge)** | T11 Newton-2 in inertial frame ← T7 galilean_transformation + acceleration_invariance | **CLOSES** T11 Session-50 anticipated forward (5-session lag) |
| **T13 Work-Energy (back-edge)** | T13 vector-work-energy ← T7 vector_kinematics | weak back-edge |
| **T14 Momentum (back-edge)** | T14 vector-momentum ← T7 vector_velocity | weak back-edge |
| **T15 Rotational Mechanics (back-edge)** | T15 angular_velocity-vector ← T7 vector_kinematics | weak back-edge |
| **T21 Wave Motion (back-edge weak)** | T21 wave-propagation-vector ← T7 vector_kinematics | weak |
| **T23 Sound Waves (back-edge weak)** | T23 doppler-source-observer-vector ← T7 vector_kinematics; T23 doppler signs ← T7 galilean | weak; T23 already catalogued (Session 54), edge weak |
| **T35 EM Induction (back-edge weak)** | T35 motional_emf ← T7 vector_velocity (v⃗ × B⃗) | weak |
| **T36 Moving Charges (back-edge weak)** | T36 Lorentz force ← T7 vector_velocity (qv⃗ × B⃗) | weak |
| **T38 EM Waves (back-edge weak)** | T38 wave-vector ← T7 vector-kinematic | weak |

### T6 ↔ T7 intra-session bidirectional edges (8 edges; intra-cluster chapter-adjacent — already enumerated in T6 §E)

(See T6 catalog §E for full enumeration of 8 bidirectional edges.)

**Total outgoing: 7 math-tools + 1 T5 prereq + 8 intra-session bidirectional with T6.**
**Total incoming: 1 forward to T8 (anticipated) + 1 back-edge closure to T10 + 1 back-edge closure to T11 + 6 weak back-edges to T13/T14/T15/T21/T23/T35/T36/T38.**

**Total Session 55 anticipated-forward-edge closures (T6 + T7): T6 = 8 + T7 = 2 (T10 + T11) = 10 closures.** Combined Session-50-to-Session-55: **59+ back-edges closed in 6 sessions** — extends densest-window streak further.

---

## Section F — Real-World Anchors (STRONG, Indian-context)

| Anchor | Concept hook | Authoring use | Strand |
|---|---|---|---|
| **Goa river-crossing tourism + Kerala backwater houseboats — boat-current crossings** | boat_river_crossing_atomic, shortest_time_drift_calculation_nano | "Goa-Mandovi-river boat-tour: cross from one bank to other with river current → drift; shortest-time vs shortest-path optimisation" | Transport / Consumer |
| **Indian monsoon (Mumbai-Kerala-Bengaluru) — rain-umbrella tilt** | rain_apparent_velocity_atomic, umbrella_tilt_into_apparent_rain_nano | "Walking east in Mumbai monsoon: tilt umbrella east (into apparent rain); intuition test for every Indian student" | Consumer / Meteorology |
| **Indian Railways — train-passenger-platform relative motion** | classical_relative_motion_archetypes_atomic, train_platform_passenger_nano | "Vande Bharat 130 km/hr; passenger walking 5 km/hr forward inside train; ground-frame velocity 135 km/hr" | Transport |
| **IndiGo / Air India / Vistara aircraft-wind correction (IMD wind-data inputs)** | aircraft_wind_correction_nano, galilean_transformation_atomic | "Delhi-Bengaluru flight: 30 km/hr crosswind from west → pilot crabs into wind to maintain track-direction" | Transport / Meteorology |
| **IPL fielding — fielder running to intercept ball (constant-bearing rule)** | cricket_fielder_running_to_catch_nano, galilean_transformation_atomic | "Ravindra Jadeja / Suryakumar Yadav fielding: run on constant-bearing line — ball appears stationary in fielder frame at moment of catch" | Sports |
| **Mumbai-Bengaluru autorickshaw + bike traffic — relative motion at intersections** | classical_relative_motion_archetypes_atomic, two_objects_meeting_time_to_collision_nano | "Autorickshaw crossing road at junction: relative velocity vs oncoming car; collision-avoidance is real-time T7 problem" | Transport / Consumer |
| **Brahmaputra river (Assam) — high current makes shortest-path crossing infeasible** | feasibility_v_b_greater_v_r_nano | "Brahmaputra in monsoon current >10 km/hr; slow country-boats cannot make headway upstream — physical constraint demo" | Geography / Transport |
| **IIT physics-practical lab — vector-boat-experiment with motorised platform** | vector_kinematics_2d_atomic, boat_river_crossing_atomic | "IIT Bombay + IIT Madras undergrad lab: motorised cart on linear track simulating boat; perpendicular-current via second motor — measures resultant velocity" | Research / Education |
| **ISRO satellite + space-debris relative-velocity tracking** | classical_relative_motion_archetypes_atomic, galilean_transformation_atomic | "ISRO Bengaluru ground-station tracks Cartosat / RISAT satellites + space-debris encounters; manoeuvre planning uses relative-velocity vectors" | Space |
| **CBSE Class-11 physics practical — vector-addition apparatus + boat-current simulation** | vector_kinematics_2d_atomic, boat_river_crossing_atomic | "CBSE-prescribed lab: parallelogram-of-forces / Gravesande apparatus measures vector-resultant directly" | Education |

**Total: 10 distinct institutional/system anchors across 6 strands** (transport, consumer, sports, meteorology, research, space, education-counted-as-research-extension). **Falls short of strand-diversity ≥ 8 VERY-STRONG threshold.** **Decision (K2-G9): STRONG**. **24th foundational-physics STRONG data point.** Missing defence + telecom + healthcare + industry strands (kinematics-relative-motion has weak natural anchoring in those domains).

---

## Section G — Cognitive-Error-Prevention Decisions

**5 of 10 founder decisions are cognitive-error-prevention type = 50%.** Sustains Kinematics-cluster cognitive-error density hypothesis (T6 = 55%, T7 = 50%; cluster mean so far = 52.5%).

| Tag | cognitive_error_target | Countermeasure |
|---|---|---|
| **K2-G3** | "2D needs new formulas" | Mandatory worked-example showing componentwise decomposition reduces 2D to two independent 1D problems |
| **K2-G4** | "frame doesn't matter, just subtract speeds" | Mandatory vector-subtraction emphasis: direction matters, signs preserved |
| **K2-G5** | "shortest-time crossing = shortest-path crossing" | Mandatory side-by-side comparison: time-optimal (with drift) vs path-optimal (slower) |
| **K2-G6** | "tilt umbrella backward (away from motion) to keep dry" | Mandatory tilt-into-apparent-rain diagram with explicit wrong-vs-right demo |
| **(implicit)** | "x and y components always independent" | Author: independent for free motion; coupling can occur via constraint forces (string tension, normal-reaction) → preview of T11 constraint-motion |

**Combined Session 55 cognitive-error-prevention share: T6 = 55% (6/11) + T7 = 50% (5/10) = 11 of 21 = 52%.** **NEW SESSION-HIGH** (passes Session 50 + Session 52 = 46% prior record). **Kinematics-formalisation cluster confirmed densest-misconception cluster set so far** (T6+T7 mean 52.5% > Mechanics cluster 43% > Waves cluster 41% > Thermodynamics 40%). **Foundation-chapter hypothesis validated**: chapters that bake in conventions (sign, vector, frame) carry highest cognitive-error density because they shape ALL downstream student thinking.

---

## Section H — V1 Priority Flags

| Atomic | V1? | Reason |
|---|---|---|
| vector_kinematics_2d_atomic | ✅ | Diamond candidate; foundation of all 2D Mechanics; required by T8/T10/T11 |
| galilean_transformation_atomic | ✅ | Foundation of all relative-motion; required by T11 inertial-frame discussion |
| boat_river_crossing_atomic | ✅ | Diamond candidate; Indian-tourism anchor; cognitive-error-rich (shortest-time vs shortest-path) |
| rain_apparent_velocity_atomic | ✅ | Diamond candidate; Indian-monsoon universal anchor; cognitive-error-rich (umbrella-tilt) |
| classical_relative_motion_archetypes_atomic | ⚖️ | V1.1; meta-atomic; useful as catalog wrapper but less student-direct demand |

**V1 ship count for T7: 4 atomics.** Combined Session 55 V1 ship: T6 = 5 + T7 = 4 = **9 atomics across 2 topics** — sustained authoring cadence.

---

## Section I — Open Questions

1. **Non-uniform circular motion** (changing speed in circular path) — T10 Circular Motion owns; flagged here as forward-link.
2. **Constraint motion (string, pulley, two-body coupled)** — T11 Newton's Laws + T15 Rotational; T7 stops at free-motion 2D.
3. **Relative motion in rotating frames** (Coriolis force, pseudo-forces) — advanced; flagged for V2 elective.
4. **Spacetime intervals / special-relativistic generalisation of Galilean** — flagged in `time_invariance_classical_nano`; V2 advanced.
5. **Kinematics-formalisation cluster check** — T6 + T7 done (2/4); T8 Projectile + T9 Motion-in-Plane remain. **Recommended Session 56**: T8 + T9 paired-batch (cluster closer).

---

## Section J — Sign-Off

- Authored: Session 55, 2026-05-26.
- Author: Claude (Architect+Engineer role).
- Coverage class: **TRIPLE**.
- Anchor density: **STRONG** (10 anchors × 6 strands — 24th foundational-physics STRONG data point).
- Triple-coverage rate: **100%** (5/5 atomics) — **16th observed 100% topic**; **streak extends to 8 consecutive** (T18 → T20 → T25 → T19 → T22 → T23 → T6 → T7) — beats prior 7-consecutive record set Session 55-half.
- Atomic count: **5**. Nano count: **14**. Total: **19 entries**.
- V1 ship count: **4 atomics**.
- **Closes anticipated forward-edges: 2** (T10 + T11). Combined Session 55 (T6+T7) = **10 anticipated forward closures**.
- **Kinematics-formalisation cluster OPENED 2/4 — T8 + T9 remain.**
- **0 new math-tools stubs. Light-maintenance NEW LONGEST streak at 6 consecutive sessions.**
- Cognitive-error-prevention founder-decision share: **50%** (5/10). Combined Session 55: **52% (11/21) — NEW SESSION-HIGH**.
- Next pilot batch: T8 Projectile + T9 Motion-in-Plane (Session 56 cluster closer).

---

*16th 100% topic; 24th foundational-physics STRONG. Streak = 8 consecutive 100% topics (extends record). Kinematics cluster opened 2/4; cluster cognitive-error mean = 52.5% so far — DENSEST cluster observed. Combined Session 55 anticipated forward closures = 10 in one session — also new high. 6 consecutive math-tools light-maintenance sessions.*
