# Pilot Topic 9 — Motion in a Plane: Circular Kinematics

> Stage-2 pilot catalog. 40th of 44. **Kinematics-formalisation cluster CLOSER (part 2 of 2)** (sibling T8 Projectile Motion in same Session 56 paired-batch; together they CLOSE the cluster 4/4 with T5/T6/T7). **CLOSES the 10th + final cluster.**
> Sources: **NCERT Class 11 Part 1 Ch.4 §4.11 Uniform Circular Motion** (canonical spine — angular variables + centripetal acceleration as kinematic fact) + **HCV Vol 1 Ch.4 §4.6 Circular Motion (kinematics)** (angular-variable derivation + non-uniform circular kinematics) + **DC Pandey Mechanics Vol 1 Ch.7 §7.8 Circular Motion** (problem-pattern density: angular-kinematic-equations + tangential/radial-acceleration decomposition).
> Coverage class: **TRIPLE-COVERED**.
> Anchor density: **STRONG** (10 anchors × 6 strands — transport + sports + consumer + space + entertainment + research). Strong rotational-everyday anchoring (ceiling-fan + Ferris-wheel + merry-go-round + record-player + ISRO satellite-orbit-kinematics + bike-cornering). Misses defence + healthcare + telecom strands — STRONG, not VERY-STRONG.
> **Critical role:** T9 formalises **angular kinematics** (θ, ω, α) + **centripetal acceleration as a KINEMATIC quantity** (a_c = v²/r = ω²r, arising purely from direction-change, before any force discussion) + **tangential/radial acceleration decomposition** for non-uniform circular motion. **Explicitly the KINEMATIC half of circular motion; T10 owns the DYNAMICS (forces).** **Closes T10/T15/T17/T36 anticipated back-edges** (T10 force-discussion now has its kinematic foundation; T15 angular-kinematics-mirror; T17 SHM-circular-projection; T36 cyclotron-kinematics). **CLOSES Kinematics-formalisation cluster — ALL 10 CLUSTERS COMPLETE; Stage-2 at 91%.**

---

## Founder Decisions Applied

| Tag | Decision |
|---|---|
| **MP-G1** | Atomic granularity = "one angular-kinematic-quantity OR one acceleration-decomposition OR one linear-angular-bridge." Angular variables, angular kinematic equations, centripetal-acceleration-kinematic, tangential/radial decomposition, linear-angular relations = 5 atomics. T9 is the KINEMATICS of circular motion ONLY — forces are T10. |
| **MP-G2** | **T9/T10 boundary is a hard founder decision.** **T9 = circular KINEMATICS** (angular position/velocity/acceleration; centripetal acceleration as a geometric/kinematic fact a_c = v²/r arising from velocity-direction-change). **T10 = circular DYNAMICS** (centripetal FORCE; banking; conical pendulum; vertical-circle tension). Centripetal **acceleration** is T9; centripetal **force** is T10. **cognitive_error_target:** "centripetal acceleration requires a force to exist" → no, acceleration is kinematic (direction-change); force is the dynamical CAUSE (T10). |
| **MP-G3** | **Angular variables are their own atomic** (`angular_kinematic_variables_atomic`) — angular position θ (rad), angular velocity ω = dθ/dt (rad/s), angular acceleration α = dω/dt (rad/s²). **Direct analogs of linear x, v, a** (T6). **cognitive_error_target:** "ω is measured in degrees/sec" → SI uses radians; formulae assume radians. |
| **MP-G4** | **Angular kinematic equations are nano under angular-variables** (`angular_kinematic_equations_nano`) — ω = ω₀ + αt; θ = ω₀t + ½αt²; ω² = ω₀² + 2αθ. **Identical form to T6 linear equations** with x→θ, v→ω, a→α. Reinforces linear-angular analogy. |
| **MP-G5** | **Centripetal acceleration (kinematic) is its own atomic** (`centripetal_acceleration_kinematic_atomic`) — even at constant speed, circular motion has acceleration because velocity DIRECTION changes. a_c = v²/r = ω²r, directed toward centre. **Diamond candidate** — velocity-vector-rotating animation showing Δv⃗ points inward. **cognitive_error_target:** "constant speed means zero acceleration" → speed constant but velocity (vector) changes → centripetal acceleration. |
| **MP-G6** | **Tangential + radial acceleration decomposition is its own atomic** (`tangential_radial_acceleration_atomic`) — for NON-uniform circular motion: a_total = a_tangential (= dv/dt = rα, changes speed) + a_radial (= v²/r, changes direction). Perpendicular components; magnitude = √(a_t² + a_r²). **cognitive_error_target:** "acceleration in circular motion is always centripetal" → only for uniform; non-uniform adds tangential component. |
| **MP-G7** | **Linear-angular relations are nano** (`linear_angular_relations_nano`) — v = ωr; a_tangential = αr; arc-length s = rθ. Bridge between angular and linear descriptions. Foundation for T15 rotational mechanics. |
| **MP-G8** | **Uniform circular motion period/frequency is nano** (`period_frequency_ucm_nano`) — T = 2πr/v = 2π/ω; f = 1/T = ω/(2π). Bridge to T17 SHM (circular-motion projection = SHM). |
| **MP-G9** | **STRONG anchor (formalised criterion)** — 10 anchors × 6 strands. Transport (bike/car cornering + Indian-Railways curved-track + Delhi-Metro curves) + sports (hammer-throw + discus + velodrome-cycling) + consumer (ceiling-fan + washing-machine-spin + record-player/turntable + bicycle-wheel) + space (ISRO satellite circular-orbit-kinematics + geostationary angular-velocity) + entertainment (Ferris-wheel/giant-wheel + merry-go-round + amusement-park-rotor) + research (IIT rotational-kinematics-lab + centrifuge). Misses defence + healthcare + telecom strands → STRONG. **25th foundational-physics STRONG data point.** |
| **MP-G10** | **Cognitive-error-prevention sub-category — 4 instances** (MP-G2 centripetal-acceleration-needs-force; MP-G3 ω-in-degrees; MP-G5 constant-speed-zero-acceleration; MP-G6 acceleration-always-centripetal). Founder-decision share: 4/9 = 44%. Sustains Kinematics-cluster cognitive-error density (T6 55%, T7 50%, T8 45%, T9 44% — cluster mean 48.5%). |

---

## Section A — Source Map

| Sub-topic | NCERT 11.1 Ch.4 §4.11 | HCV V1 Ch.4 §4.6 | DCM M1 Ch.7 §7.8 |
|---|---|---|---|
| Angular position/velocity/acceleration | §4.11 | §4.6.1 | §7.8.1 |
| Angular kinematic equations | §4.11 | §4.6.2 | §7.8.2 |
| Centripetal acceleration (kinematic) | §4.11 | §4.6.3 | §7.8.3 |
| Tangential + radial acceleration (non-uniform) | (lite) | §4.6.4 | §7.8.4 |
| Linear-angular relations (v=ωr etc.) | §4.11 | §4.6.1 | §7.8.1 |
| Period + frequency of UCM | §4.11 | §4.6.1 | §7.8.1 |

**NCERT §4.11 is the canonical spine for uniform-circular kinematics**. **HCV Ch.4 §4.6 carries full derivation** including non-uniform (tangential+radial) — NCERT treats non-uniform lightly. DCM M1 §7.8 carries problem-pattern density for angular-kinematic-equations + acceleration-decomposition.

**Boundary note (MP-G2):** NCERT §4.11 + §5.x (Laws of Motion) split kinematics (§4.11) from dynamics (centripetal force §5.x). T9 owns §4.11 (kinematics); T10 owns the force-side (§5.x banking/conical/vertical-circle). This catalog STOPS at centripetal-acceleration-as-kinematic-fact; centripetal-force is explicitly T10.

---

## Section B — Atomic + Nano Catalog

| ID | Concept | Type | Sim? | In repo? | Requires | Required-by | Notes |
|---|---|---|---|---|---|---|---|
| **angular_kinematic_variables_atomic** | **Angular position θ** (radians, measured from reference radius); **angular velocity ω = dθ/dt** (rad/s); **angular acceleration α = dω/dt** (rad/s²). Direct rotational analogs of linear position/velocity/acceleration (T6). For rotation, these describe the motion compactly (one variable θ vs two x,y). | atomic | ✅ | — | [avg_vs_instantaneous_velocity_atomic(T6), acceleration_definition_atomic(T6), vector_kinematics_2d_atomic(T7)] | [centripetal_acceleration_kinematic_atomic, tangential_radial_acceleration_atomic, angular_kinematics_rotational(T15)] | MP-G3; **cognitive_error_target:** "ω in degrees/sec" → SI radians |
| ↳ angular_kinematic_equations_nano | For constant α: **ω = ω₀ + αt**; **θ = ω₀t + ½αt²**; **ω² = ω₀² + 2αθ**. **Identical form to T6 linear equations** (x→θ, v→ω, a→α). Same derivation; same problem-solving decision-tree. Reinforces linear-angular structural analogy. | nano | ✅ | — | [angular_kinematic_variables_atomic, kinematic_equations_constant_a_atomic(T6)] | — | parent; MP-G4; linear-analogy scaffold |
| ↳ linear_angular_relations_nano | **v = ωr** (tangential speed); **a_tangential = αr**; **arc-length s = rθ**. Convert between angular description (compact) and linear description (intuitive). Foundation for T15 rotational mechanics (every linear quantity has an angular analog). | nano | ✅ | — | [angular_kinematic_variables_atomic, vector_kinematics_2d_atomic(T7)] | [rotational_mechanics_atomics(T15)] | parent; MP-G7; bridge to T15 |
| ↳ radian_measure_why_nano | Radians (not degrees) make v = ωr and s = rθ clean (no conversion factor). 1 rad = arc-length equal to radius; full circle = 2π rad. **All physics formulae assume radians.** Common student error: plugging degrees into ω formulae. | nano | ✅ | — | [angular_kinematic_variables_atomic] | — | parent; cognitive-error countermeasure |
| **centripetal_acceleration_kinematic_atomic** | Even at CONSTANT SPEED, circular motion is ACCELERATED because the velocity DIRECTION continuously changes. The acceleration points toward the centre: **a_c = v²/r = ω²r = vω**. This is a purely KINEMATIC fact (geometric consequence of direction-change) — it exists BEFORE any discussion of what force causes it (that's T10). | atomic | ✅ | — | [angular_kinematic_variables_atomic, vector_kinematics_2d_atomic(T7), acceleration_definition_atomic(T6)] | [centripetal_force_atomic(T10), shm_as_circular_projection(T17)] | MP-G5; **Diamond candidate**; **cognitive_error_target:** "constant speed = zero acceleration" → velocity-vector changes |
| ↳ delta_v_points_inward_nano | Geometric proof: draw velocity vectors v⃗₁, v⃗₂ at two nearby points on the circle. Δv⃗ = v⃗₂ − v⃗₁ points toward the centre. As Δt→0, a⃗ = Δv⃗/Δt is exactly centripetal. **Diamond-candidate animation**: rotating velocity-vector + Δv⃗-construction showing inward direction. | nano | ✅ | — | [centripetal_acceleration_kinematic_atomic, vector_kinematics_2d_atomic(T7)] | — | parent; geometric-derivation scaffold |
| ↳ a_c_three_forms_nano | a_c = v²/r (linear-speed form) = ω²r (angular form) = vω (mixed). All equivalent via v = ωr. **Use whichever the problem gives.** Decision-tree pedagogy (mirrors T6 kinematic-equation choice). | nano | ✅ | — | [centripetal_acceleration_kinematic_atomic, linear_angular_relations_nano] | — | parent; formula-choice scaffold |
| ↳ constant_speed_not_constant_velocity_nano | Speed |v⃗| = constant; velocity v⃗ = changing (direction rotates). **Acceleration ≠ 0** despite constant speed. The deepest conceptual point of circular kinematics. **cognitive_error_target** countermeasure: explicit speed-vs-velocity distinction animation. | nano | ✅ | — | [centripetal_acceleration_kinematic_atomic] | — | parent; MP-G5 cognitive scaffold |
| **tangential_radial_acceleration_atomic** | For NON-UNIFORM circular motion (changing speed): total acceleration has TWO perpendicular components: **a_tangential = dv/dt = rα** (along velocity, changes SPEED) + **a_radial = v²/r = ω²r** (toward centre, changes DIRECTION). **a_total = √(a_t² + a_r²)**; direction makes angle arctan(a_t/a_r) with the radius. | atomic | ✅ | — | [centripetal_acceleration_kinematic_atomic, angular_kinematic_variables_atomic, vector_resolution_atomic(T5)] | — | MP-G6; **cognitive_error_target:** "acceleration in circular motion is always centripetal" → only uniform; non-uniform adds tangential |
| ↳ speeding_car_on_curve_nano | Car accelerating while rounding a bend: a_tangential (speeding up along the path) + a_radial (centripetal, turning). Total acceleration tilts forward-of-radius. **Indian-driving anchor**: accelerating out of a curve on Mumbai-Pune Expressway. | nano | ✅ | — | [tangential_radial_acceleration_atomic] | — | parent; **transport anchor** |
| ↳ uniform_is_special_case_nano | Uniform circular motion = the special case where a_tangential = 0 (constant speed). Only a_radial (centripetal) remains. Non-uniform is the general case; uniform is the simplification. Cognitive-hierarchy scaffold. | nano | ✅ | — | [tangential_radial_acceleration_atomic, centripetal_acceleration_kinematic_atomic] | — | parent |
| **uniform_circular_motion_atomic** | UCM = circular motion at CONSTANT speed. Characterised by: constant ω; constant a_c = v²/r (magnitude constant, direction rotating); **period T = 2πr/v = 2π/ω**; **frequency f = 1/T = ω/(2π)**. The canonical kinematic template for all rotational phenomena. | atomic | ✅ | — | [centripetal_acceleration_kinematic_atomic, angular_kinematic_variables_atomic] | [shm_as_circular_projection(T17), satellite_orbit_kinematics(T16)] | catalog-anchor atomic; **cognitive_error_target:** "uniform = no acceleration" (re-emphasis of MP-G5) |
| ↳ period_frequency_ucm_nano | T = 2πr/v = 2π/ω; f = 1/T = ω/(2π); ω = 2πf (angular frequency). **Bridge to T17 SHM**: projection of UCM onto a diameter = SHM (same ω). **Bridge to T16**: satellite orbital period from UCM + gravity (T16 owns the dynamics). | nano | ✅ | — | [uniform_circular_motion_atomic, angular_kinematic_variables_atomic] | [shm_atomic(T17)] | parent; MP-G8; bridge to T17 + T16 |
| ↳ ceiling_fan_turntable_anchor_nano | Ceiling-fan (~300-350 rpm = ω ≈ 31-37 rad/s); record-player/turntable (33⅓ rpm); washing-machine-spin (~1400 rpm). Everyday Indian-household UCM anchors. Compute ω, v at blade-tip, a_c. | nano | ✅ | — | [uniform_circular_motion_atomic, period_frequency_ucm_nano] | — | parent; **consumer anchor** |
| ↳ satellite_circular_orbit_kinematics_nano | ISRO geostationary satellite (GSAT series): orbital period 24 hr → ω = 2π/(24×3600) rad/s; orbital radius ~42,164 km → v ≈ 3.07 km/s; a_c = v²/r (the KINEMATIC fact; T16 supplies that gravity PROVIDES this a_c). Pure-kinematics version; dynamics in T16. | nano | ✅ | — | [uniform_circular_motion_atomic, centripetal_acceleration_kinematic_atomic] | [orbital_dynamics(T16)] | parent; **space anchor**; bridge to T16 |

**Atomic count:** 4. **Nano count:** 11. **Total entries:** 15.

---

## Section C — Cross-Source Coverage Matrix

| Atomic | NCERT 11.1 §4.11 | HCV V1 §4.6 | DCM M1 §7.8 | Coverage |
|---|---|---|---|---|
| angular_kinematic_variables_atomic | §4.11 | §4.6.1 | §7.8.1 | TRIPLE |
| centripetal_acceleration_kinematic_atomic | §4.11 | §4.6.3 | §7.8.3 | TRIPLE |
| tangential_radial_acceleration_atomic | §4.11 (lite) | §4.6.4 | §7.8.4 | TRIPLE (NCERT lite on non-uniform) |
| uniform_circular_motion_atomic | §4.11 | §4.6.1 | §7.8.1 | TRIPLE |

**Triple-coverage rate: 4 of 4 atomics = 100%.** **17th 100% topic in 40 pilots.** **STREAK RESETS** (T8 broke the 8-streak at 80% with NCERT-omitted incline-projectile; T9 restarts at 100% — new 1-topic streak). Core circular-kinematics fully triple-covered; the non-uniform-acceleration atomic is NCERT-lite but present (TRIPLE).

---

## Section D — Stage-3 Math-Tool Dependencies

| Math-tool primitive | Used by | Status |
|---|---|---|
| `calculus_basic_derivative` (ω = dθ/dt, α = dω/dt) | angular_kinematic_variables_atomic | REQUIRED (existing) |
| `algebra_quadratic` (θ = ω₀t + ½αt²) | angular_kinematic_equations_nano | REQUIRED (existing) |
| `vector_subtraction_geometric` (Δv⃗ points inward) | centripetal_acceleration_kinematic_atomic | REQUIRED (existing) |
| `trig_radian_measure` (radians, s = rθ) | angular_kinematic_variables_atomic, radian_measure_why_nano | REQUIRED (existing) |
| `pythagoras_magnitude` (a_total = √(a_t² + a_r²)) | tangential_radial_acceleration_atomic | REQUIRED (existing) |
| `algebra_ratio_proportion` (T = 2π/ω; v = ωr) | uniform_circular_motion_atomic | REQUIRED (existing) |

**ZERO new stubs registered.** All math-tools REQUIRED. Math-tools IN-degree unchanged: **52**. **Light-maintenance mode continues 7 consecutive sessions** (S50 → S56) — extends NEW LONGEST zero-stub streak. **All 4 Kinematics-cluster pilots (T6/T7/T8/T9) added ZERO new stubs** — the Stage-3 file fully anticipated the entire cluster.

---

## Section E — Cross-Topic Dependencies (Bidirectional Edges)

### Outgoing (T9 requires from earlier topics)

| Target topic | Edge | Reason |
|---|---|---|
| **T8 Projectile Motion (intra-session)** | T9 circular-kinematics ↔ T8 projectile-decoupling (both 2D-motion families) | **Intra-session bidirectional** (4 edges; see T8 §E) |
| **T7 2D Kinematics (intra-cluster)** | angular_variables ← T7 vector_kinematics; centripetal_acceleration ← T7 vector-velocity-derivative | Pre-existing intra-cluster (laid Session 55) |
| **T6 1D Kinematics (intra-cluster)** | angular_kinematic_equations ← T6 linear_kinematic_equations (analogy) | Pre-existing intra-cluster |
| **T5 Vectors** | tangential_radial_decomposition ← T5 vector_resolution | Pre-existing T5 (in repo) |
| Math-tools | 6 primitives (zero new stubs) | All REQUIRED |

### Incoming (T9 will be required by later topics)

| Source topic | Edge | Reason |
|---|---|---|
| **T10 Circular Motion DYNAMICS (back-edge — KEY)** | T10 centripetal_force ← T9 centripetal_acceleration_kinematic (force = m·a_c); T10 banking/conical/vertical-circle all ← T9 a_c | **CLOSES** T10 Session-39 anticipated forward (17-session lag) — **T9 supplies the kinematic foundation that T10's entire force-discussion assumed** |
| **T15 Rotational Mechanics (back-edge)** | T15 angular_kinematics ← T9 angular_variables (rotational-rigid-body extends point-particle angular kinematics) | **CLOSES** T15 Session-51 anticipated forward (5-session lag) |
| **T16 Gravitation (back-edge)** | T16 orbital_velocity + satellite_period ← T9 UCM + centripetal_acceleration | **CLOSES** T16 Session-40 anticipated forward (16-session lag) |
| **T17 SHM (back-edge)** | T17 SHM-as-UCM-projection ← T9 uniform_circular_motion + ω | **CLOSES** T17 Session-38 anticipated forward (18-session lag) |
| **T36 Moving Charges (back-edge)** | T36 cyclotron + circular-motion-in-B ← T9 centripetal_acceleration_kinematic | **CLOSES** T36 Session-36 anticipated forward (20-session lag) |

### T8 ↔ T9 intra-session bidirectional edges (4 edges — already enumerated in T8 §E)

(See T8 catalog §E for full enumeration of the 4 bidirectional edges.)

**Total outgoing: 6 math-tools + 1 T5 prereq + intra-cluster T6/T7 (laid) + 4 intra-session with T8.**
**Total incoming: 5 back-edge closures (T10 + T15 + T16 + T17 + T36).**

**Total Session 56 forward-edge closures (T8 + T9): T8 = 4 + T9 = 5 = 9 closures.** Combined Sessions 50-56: **68+ back-edges closed in 7 sessions** — extends densest-window streak. **T9 closes the KEY T10 dependency** (T10's entire centripetal-force discussion assumed circular-kinematics; T9 finally supplies it — 17-session lag).

---

## Section F — Real-World Anchors (STRONG, Indian-context)

| Anchor | Concept hook | Authoring use | Strand |
|---|---|---|---|
| **Ceiling fan + washing-machine-spin + mixer-grinder (Indian household)** | uniform_circular_motion_atomic, ceiling_fan_turntable_anchor_nano, centripetal_acceleration_kinematic_atomic | "Ceiling-fan ~300 rpm: compute ω, blade-tip speed, centripetal acceleration; washing-machine spin-cycle ~1400 rpm" | Consumer |
| **Bike/car cornering (Mumbai-Pune Expressway + ghats)** | centripetal_acceleration_kinematic_atomic, tangential_radial_acceleration_atomic, speeding_car_on_curve_nano | "Accelerating out of a hill-curve: tangential (speeding) + radial (turning) acceleration components combine" | Transport |
| **Indian Railways curved-track + Delhi/Mumbai Metro curves** | centripetal_acceleration_kinematic_atomic, uniform_circular_motion_atomic | "Train on curved track has centripetal acceleration v²/r; track-curvature radius sets max safe speed (force-side in T10)" | Transport |
| **Ferris wheel / giant wheel (Mumbai Esselworld, fairs, Diwali melas)** | uniform_circular_motion_atomic, period_frequency_ucm_nano, centripetal_acceleration_kinematic_atomic | "Giant-wheel period ~30-60 s; riders experience centripetal acceleration; compute ω + a_c at rim" | Entertainment |
| **Merry-go-round + amusement-park rotor (Wonderla)** | uniform_circular_motion_atomic, centripetal_acceleration_kinematic_atomic | "Rotor-ride: riders pinned to wall by required centripetal acceleration; kinematic a_c = ω²r" | Entertainment |
| **Hammer-throw + discus (Olympics/Asian-Games athletics)** | angular_kinematic_variables_atomic, tangential_radial_acceleration_atomic, linear_angular_relations_nano | "Hammer-thrower spins up (angular acceleration α), releases at max tangential speed v = ωr" | Sports |
| **Velodrome cycling (banked track) + bicycle-wheel** | uniform_circular_motion_atomic, angular_kinematic_variables_atomic, linear_angular_relations_nano | "Velodrome cyclist on banked curve; bicycle-wheel: spokes' angular velocity, rim linear speed v = ωr" | Sports / Consumer |
| **ISRO geostationary satellite (GSAT) orbital kinematics** | uniform_circular_motion_atomic, satellite_circular_orbit_kinematics_nano, centripetal_acceleration_kinematic_atomic | "GSAT geostationary: 24-hr period, ω = 2π/86400; orbital radius 42,164 km → v ≈ 3.07 km/s; a_c kinematic (gravity provides it — T16)" | Space |
| **Record-player / turntable + CD/DVD rotation** | uniform_circular_motion_atomic, angular_kinematic_variables_atomic, period_frequency_ucm_nano | "Turntable 33⅓ rpm; CD variable angular speed to keep linear read-speed constant (CLV) — angular-kinematics application" | Consumer / Research |
| **IIT rotational-kinematics lab + laboratory centrifuge** | angular_kinematic_variables_atomic, centripetal_acceleration_kinematic_atomic | "IIT undergrad lab: rotating platform with photogate measures ω, α; centrifuge a_c ~ thousands of g for sample-separation" | Research / Education |

**Total: 10 distinct institutional/system anchors across 6 strands** (consumer, transport, entertainment, sports, space, research/education). **Falls short of strand-diversity ≥ 8 VERY-STRONG threshold.** **Decision (MP-G9): STRONG**. **25th foundational-physics STRONG data point.** Misses defence + healthcare + telecom strands — circular-kinematics anchors are everyday/consumer-heavy, not defence/medical (unlike T8 projectile which had defence ballistics).

---

## Section G — Cognitive-Error-Prevention Decisions

**4 of 9 founder decisions are cognitive-error-prevention type = 44%.** Sustains Kinematics-cluster cognitive-error density (T6 55%, T7 50%, T8 45%, T9 44% — cluster mean 48.5%).

| Tag | cognitive_error_target | Countermeasure |
|---|---|---|
| **MP-G2** | "centripetal acceleration requires a force to exist" | Mandatory kinematic-first framing: a_c is geometric (direction-change); force is the CAUSE (T10). Acceleration exists kinematically before any force discussion |
| **MP-G3** | "angular velocity ω is in degrees/sec" | Mandatory radian-measure nano: SI radians; formulae assume radians |
| **MP-G5** | "constant speed means zero acceleration" | Mandatory Δv⃗-points-inward animation + speed-vs-velocity distinction (the deepest conceptual point of circular kinematics) |
| **MP-G6** | "acceleration in circular motion is always centripetal" | Mandatory tangential+radial decomposition for non-uniform; uniform is the special case (a_t = 0) |

**Combined Session 56 cognitive-error share (T8 + T9): T8 = 45% (5/11) + T9 = 44% (4/9) = 9 of 20 = 45%.** **Kinematics-formalisation cluster final mean (T6+T7+T8+T9): (55+50+45+44)/4 = 48.5% — DENSEST-misconception cluster set in Stage-2** (> Mechanics 43% > Mechanical-Properties 43% > Waves 41% > Thermodynamics 40%). **Foundation-chapter hypothesis fully validated across the complete cluster**: all 4 Kinematics pilots exceed 44% cognitive-error share. The conventions baked into kinematics (sign, vector, frame, instantaneous-vs-average, speed-vs-velocity, kinematic-vs-dynamic) are the deepest sources of downstream physics misconceptions.

---

## Section H — V1 Priority Flags

| Atomic | V1? | Reason |
|---|---|---|
| centripetal_acceleration_kinematic_atomic | ✅ | Diamond candidate; Δv⃗-inward animation; THE deepest circular-kinematics concept; required by T10/T16/T17/T36 |
| angular_kinematic_variables_atomic | ✅ | Foundational; linear-angular analogy; required by T15 rotational mechanics |
| uniform_circular_motion_atomic | ✅ | Pure-curricular essential; ceiling-fan/satellite anchors; bridge to T16/T17 |
| tangential_radial_acceleration_atomic | ⚖️ | V1.1; non-uniform circular; cognitive-error-rich but more advanced |

**V1 ship count for T9: 3 atomics.** Combined Session 56 V1 ship: T8 = 4 + T9 = 3 = **7 atomics across 2 topics**. Kinematics-formalisation cluster cumulative V1 ship: T6 = 5 + T7 = 4 + T8 = 4 + T9 = 3 = **16 atomics across 4 topics** (T5 already in repo).

---

## Section I — Open Questions

1. **Circular DYNAMICS (centripetal force, banking, conical pendulum, vertical circle)** — explicitly T10's territory (MP-G2 boundary). T9 stops at kinematic a_c.
2. **Rigid-body rotation (moment of inertia, torque, angular momentum)** — T15 Rotational Mechanics owns; T9 supplies the point-particle angular-kinematics foundation.
3. **Non-inertial rotating frames (centrifugal, Coriolis pseudo-forces)** — advanced; V2 elective (cross-link to T7 relative-motion + T10 dynamics).
4. **Precession + gyroscopic motion** — graduate; V2.
5. **SHM-as-UCM-projection** — bridge to T17 (laid as nano `period_frequency_ucm_nano`); T17 owns the SHM treatment.
6. **Kinematics-formalisation cluster check** — **T6 + T7 + T8 + T9 ALL DONE (4/4 with T5 in repo). CLUSTER CLOSED. All 10 clusters complete. Stage-2 at 40/44 = 91%.** Remaining: 4 NCERT-intro stragglers (T1-T4) + minor extensions.

---

## Section J — Sign-Off

- Authored: Session 56, 2026-05-26.
- Author: Claude (Architect+Engineer role).
- Coverage class: **TRIPLE**.
- Anchor density: **STRONG** (10 anchors × 6 strands — 25th foundational-physics STRONG data point).
- Triple-coverage rate: **100%** (4/4 atomics) — **17th observed 100% topic**; streak resets after T8's 80% break (T9 = new 1-topic streak start).
- Atomic count: **4**. Nano count: **11**. Total: **15 entries**.
- V1 ship count: **3 atomics**.
- **Closes anticipated forward-edges: 5** (T10 KEY 17-session-lag + T15 + T16 + T17 + T36). Combined Session 56 (T8+T9) = **9 forward closures**.
- **Kinematics-formalisation cluster CLOSED (4/4 with T5). ALL 10 CLUSTERS COMPLETE. Stage-2 at 91%.**
- **0 new math-tools stubs. Light-maintenance NEW LONGEST streak at 7 consecutive sessions. All 4 Kinematics-cluster pilots added ZERO stubs — Stage-3 file fully anticipated the cluster.**
- Cognitive-error-prevention founder-decision share: **44%** (4/9). **Cluster final mean (T6+T7+T8+T9) = 48.5% — DENSEST-misconception cluster in Stage-2.**
- Next: Sessions 57-58 — final 4 NCERT-intro stragglers (T1-T4) + minor extensions = pure Stage-2 closure.

---

*17th 100% topic; 25th foundational-physics STRONG. T9 enforces the kinematic-vs-dynamic boundary (a_c is T9; centripetal force is T10). Closes the KEY 17-session-lag T10 dependency + 4 more. Kinematics-formalisation cluster CLOSED — ALL 10 CLUSTERS COMPLETE at 91%. Cluster cognitive-error mean 48.5% — densest in Stage-2. 7 consecutive math-tools light-maintenance sessions; all 4 cluster pilots zero-stub.*
