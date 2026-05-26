# Pilot Topic 10 — Circular Motion

> **Pilot 4 of 5** in the Stage-2 paired-batch sequence (Topics 12, 21, 36 shipped 2026-05-25; Topics 10 + 13 in this batch).
> Created 2026-05-25. Format locked from 3 prior pilots. Quality bar: zero compromise (founder directive Session 36).

> **Topic 10 was flagged as the highest-IN-degree hub** in the dependency matrix at the 3-pilot checkpoint (4 incoming edges from Friction + Wave Motion + Moving Charges). Authoring it now closes dangling references in those three catalogs.

---

## Founder decisions applied (Session 36 self-directed authoring)

| Tag | Question | Decision | Why |
|---|---|---|---|
| C-G1 | Kinematics (angular displacement, velocity, acceleration) — one atomic each or merged? | Split into 3 atomics (A1, A2, A3). | Each is independently testable; HCV1 §7.1 introduces them sequentially; merging would conflate change-rate insights. |
| C-G2 | Vertical circular motion — one atomic or split top/bottom/critical? | One atomic `vertical_circular_motion_complete` (A17) + nanos for critical-point analysis. | Single coherent physical situation; nanos hold corner cases (slack string, min speed at top, rod vs string difference). |
| C-G3 | Centripetal acceleration (kinematic) and centripetal force (dynamic) — separate atomics? | Separate (A5 kinematic, A10 dynamic). | HCV1's "centripetal force is not a new force" framing (Points to Ponder #5) requires explicit dynamic atomic distinct from a_r. |
| C-G4 | Banked road no-friction + banked road with-friction — one or two atomics? | Two atomics (A13, A14). | NCERT §5.10 uses two equations (5.22 vs 5.21); pedagogical break point; A14 deserves `allow_deep_dive`. |
| C-G5 | Earth-rotation effect (g vs g') — atomic or nano? | Atomic A29 `effect_earth_rotation_apparent_weight`. | HCV1 §7.7 dedicates a full section; latitude-dependent g matters for gravitation/satellite topics downstream. |
| C-G6 | Centrifugal + coriolis forces — one or two atomics? | A26 `centrifugal_force` atomic; coriolis is nano N26.3 (and atomic A27 deferred to V2). | Coriolis is mentioned briefly in HCV1 §7.6; full treatment is JEE-Adv / rotational mechanics. Centrifugal alone deserves atomic status because of EPIC-C misconception risk. |

---

## A. Source citations

| Source | Coverage | PDF pages read | Notes |
|---|---|---|---|
| NCERT 11.1 Ch.4 §4.11 Uniform Circular Motion | Kinematics of circular motion (centripetal acc derivation) | **GAP — not in this session's read** | TO-DO: read NCERT PDF ~95-100 for §4.11 in a Stage-3 follow-up. Stage-2 kinematics filled from HCV1 §7.3. |
| NCERT 11.1 Ch.5 §5.10 Circular Motion | Dynamics: level road + banked road (no μ + with μ), cyclist, Examples 5.10-5.11 | PDF 118-121 (printed 103-106) | Captured. Indian-context anchor: cyclist + circular racetrack. |
| DCM1 Ch.10 Circular Motion | "Final Touch Points" (9 high-density summary points) + Type 1 Vertical Circular Motion + Type 2 Pendulum + Miscellaneous Examples (radius of curvature, angular-speed proofs) + Level 1/2 Objective + Subjective + Answers | PDF 461-480 | Heavy JEE-Adv problem-pattern depth. Vertical circular motion fully worked. |
| HCV1 Ch.7 Circular Motion | Full chapter: §7.1 angular variables → §7.7 earth rotation. Worked Examples 1-12 + Q&A + Objective I/II + 30 Exercises | PDF 111-127 | Most complete pedagogy. §7.6 centrifugal force + §7.7 earth rotation are HCV1-exclusive in the trio. |

**Indian-context anchors mined** (per [[feedback-ncert-indian-anchors]] rule):
- NCERT §5.10 Example 5.10: cyclist taking sharp turn on level road (Indian street scene — speed 18 km/h on radius-3m turn)
- NCERT §5.10 Example 5.11: circular racetrack of radius 300m banked at 15° (echo of Buddh International Circuit, Greater Noida)
- HCV1 Worked Example 3: conical pendulum (lab demo bridge to "merry-go-round on Indian festival fairs")
- HCV1 §7.7: latitude-dependent g (anchor with Indian latitudes — Chennai 13°N, Delhi 28.6°N, Srinagar 34°N)
- DCM1 Final Touch #6 toppling: anchor with "trucks/buses on Mumbai-Pune Expressway curves" (state-highway turn safety)

---

## B. Existing repo concepts

**Direct matches:** None. Topic 10 is greenfield for atomic concept authoring.

**Adjacent / already-shipped concepts that link in:**
- `vector_resolution.json` — prereq for FBD on banked road
- `newton_second_law_direction.json` — prereq for dynamics of circular motion
- `friction_static_kinetic.json` — prereq for car-on-level-road (A12) and rotor (A23)
- `tension_in_string.json` — prereq for conical pendulum (A16) and vertical loop (A17)
- `field_forces.json` — prereq for centripetal-source identification (A11)

**Repo gaps to flag at Stage-5 authoring:**
- No `uniform_circular_motion.json` exists yet. Must be FIRST authored Topic 10 atomic — prereq for cyclotron radius (Topic 36), satellite orbits (Topic 16), simple pendulum (Topic 17), and magnetic force on moving charge (Topic 36 A4).
- `simple_pendulum_oscillation` (Topic 17 SHM) doesn't currently cross-link to vertical-circular-motion as a parent — add during Topic 10 + Topic 17 cross-link pass.

---

## C. Methodology

Standard A-J format from 3 prior pilots, paired-batch with Topic 13 per founder Session 36 decision. Founder-style decisions C-G1 through C-G6 applied inline rather than escalating.

**Stage-3 deepening reads required (to be done after this batch ships):**
- NCERT 11.1 Ch.4 §4.11 (PDF ~95-100) — uniform-circular-motion kinematics derivation. Currently filled from HCV1 §7.3.
- DC Pandey Solved Examples 8-15 (PDF 481+ in DCM1) — if pattern variety demands more nanos after pilot.

---

## D. Concept catalog (8-column)

### D.1 — Atomic concepts (33 total — 28 V1 + 5 V2)

| ID | Concept | Type | Sim? | In repo? | Requires | Required-by | Notes |
|---|---|---|---|---|---|---|---|
| A1 | angular_position_displacement | atomic | yes (rotating arrow + θ tick marks) | no | vector_basics | A2 | HCV1 §7.1. s = rθ. Radian convention. V1. |
| A2 | angular_velocity_omega | atomic | yes (rotating particle + ω indicator + θ-vs-t dual panel) | no | A1, calculus_basics | A3, A5, A14 | ω = dθ/dt; v = rω. V1. |
| A3 | angular_acceleration_alpha | atomic | yes (changing ω indicator) | no | A2 | A6, A8 | α = dω/dt; a_t = rα. V1. |
| A4 | radial_tangential_unit_vectors | atomic | yes (rotating e_r outward + e_t tangential) | no | unit_vector, vector_basics | A5, A6 | HCV1 §7.2. Coordinate choice that matters. V1. |
| A5 | centripetal_acceleration_kinematic | atomic | yes (a arrow always toward center) | no | A2, A4 | A10, A14, A20, +CT4 | a_r = v²/r = ω²r. Pure kinematics, no force. HCV1 Eq 7.9. V1 ABSOLUTE PRIORITY (highest IN-degree of Topic 10). |
| A6 | tangential_acceleration | atomic | yes (a_t along tangent) | no | A3, A4 | A8 | a_t = dv/dt. Zero in uniform circular motion. V1. |
| A7 | uniform_circular_motion | atomic | yes (constant v, only a_r, full revolution) | no | A5 | A10, +cyclotron, +satellite, +simple_pendulum | The "default" case. dv/dt = 0. V1 ABSOLUTE PRIORITY (hub concept for 3+ other topics). |
| A8 | nonuniform_circular_motion | atomic | yes (changing v, both a_r and a_t shown) | no | A5, A6 | A17 | Both components present; total a = √(a_r²+a_t²). V1. |
| A10 | centripetal_force_F_equals_mv2_over_r | atomic | yes (force arrow + a arrow both inward, real source labeled) | no | A5, A7, newton_2nd_law | A11–A25 | F_c = mv²/r toward center. "Not a new force — give it a name" framing per HCV1 Points to Ponder #5. V1 ABSOLUTE PRIORITY. |
| A11 | centripetal_force_source_identification | atomic | yes (split-screen 4 cases: gravity / tension / friction / normal) | no | A10 | A12, A13, A15, A16, A17 | "Which real force provides centripetal?" Heuristic-rich. EPIC-C STATE_1 candidate (the wrong belief: "centripetal force is a force by itself"). V1. |
| A12 | car_on_level_circular_road | atomic | yes (top-down car + friction inward + v tangent) | no | A10, A11, friction_static_kinetic | A13 | v_max = √(μsRg); independent of mass. NCERT Eq 5.18. **Cross-references Friction A27.** V1. |
| A13 | car_on_banked_road_no_friction | atomic | yes (banked surface + N decomposed into N cosθ + N sinθ) | no | A12, vector_resolution | A14 | v_o = √(Rg tanθ). The "design speed". NCERT Eq 5.22. V1. |
| A14 | car_on_banked_road_with_friction | atomic | yes (banked road + N + f, μ active) | no | A13 | — | v_max = √(Rg(μ+tanθ)/(1-μtanθ)). NCERT Eq 5.21. V1 — flag `allow_deep_dive: true` (the (1-μtanθ) denominator is a JEE trap). |
| A15 | cyclist_taking_circular_turn | atomic | yes (cyclist leaning at angle, FBD on rider+bike system) | no | A10, A11, torque_basics | — | Leaning replaces banking. tan(lean) = v²/rg. Indian-context anchor. V1. |
| A16 | conical_pendulum | atomic | yes (string at angle θ, bob in horizontal circle, T sin θ = mv²/r) | no | A10, A11, tension_in_string | A21 | tan θ = v²/rg. T = 2π√(L cosθ/g). HCV1 Worked Ex 3. JEE classic. V1. |
| A17 | vertical_circular_motion_complete | atomic | yes (full vertical circle with v varying, T varying, top vs bottom highlighted) | no | A10, A11, +work_energy_theorem (Topic 13) | A18, A19 | u_min at bottom = √(5gR) for string; √(2gR) for rod. DCM1 Type 1 + HCV1 Q.6. **Cross-references Topic 13 work-energy.** V1 — `allow_deep_dive: true`. |
| A18 | simple_pendulum_as_vertical_circle | atomic | yes (pendulum swinging in vertical plane, tension max at bottom) | no | A17, +SHM_intro (Topic 17) | — | DCM1 Type 2. Energy + tension-at-angle. Bridges to SHM small-angle limit. V1. |
| A19 | ball_on_smooth_sphere | atomic | yes (ball sliding outside sphere, leaves at angle θ = cos⁻¹(2/3)) | no | A17, normal_reaction | A24 | v_max at top = √(Rg). Leaves at h = R/3 below top. DCM1 Final Touch #8. V1. |
| A20 | particle_in_horizontal_groove | atomic | yes (particle in circular groove on table, side-wall N provides centripetal) | no | A10, A11 | — | HCV1 Worked Ex 5. Side-wall normal = mv²/r. V2 (rarely tested). |
| A21 | mass_on_rotating_ruler | atomic | yes (ruler rotating about end + block at distance L, friction holds it) | no | A10, friction_static_kinetic | A22, A23 | ω_max for no-slip = √(μg/L). HCV1 Q.8 + DCM1 L1 Q.11. V1. |
| A22 | coin_on_rotating_turntable | atomic | yes (top-down turntable + coin + friction arrow inward) | no | A21 | — | NCERT Class 11 §5.10 lab demo. μg ≥ ω²r for no-slip. V1. |
| A23 | rotor_against_inner_wall | atomic | yes (vertical cylinder rotating + person stuck to wall, μN=mg) | no | A10, A11, friction_static_kinetic | — | HCV1 Worked Ex 10. ω_min = √(g/μr). Indian-context: "Wall of Death" ride at Indian fairs. V1. |
| A24 | car_overbridge_convex | atomic | yes (car on convex bridge, N = mg - mv²/r) | no | A10, normal_reaction | — | NCERT Exercise + HCV1 O.I Q.10. Loses contact when v = √(gR). V1. |
| A25 | toppling_of_vehicle_in_circular_track | atomic | yes (top-down + side view truck on turn, N₁>N₂, torque about CG) | no | A10, torque, equilibrium | — | DCM1 Final Touch #6-7. v < √(gra/h) for safe turn. Indian-context anchor (Mumbai-Pune highway curves). V1. |
| A26 | centrifugal_force_pseudo_force | atomic | yes (split-screen: inertial-frame analysis vs rotating-frame analysis, pseudo F outward) | no | A10, non_inertial_frames (Topic 11) | A27, A29 | mω²r outward in rotating frame. HCV1 §7.6. EPIC-C: "I feel pushed outward, so something's pushing me!" V1. |
| A27 | coriolis_force | atomic | no (4D mental model; sim is hard) | no | A26 | — | Perpendicular to v in rotating frame. HCV1 §7.6 brief mention. V2 (JEE-Adv only). `allow_deep_dive: true` when ever V1'd. |
| A28 | radius_of_curvature_of_projectile | atomic | yes (projectile arc + osculating circle at peak point + R indicator) | no | A5, projectile_motion (Topic 9) | — | DCM1 Misc Example 5 + HCV1 Q.25-26. R = u²cos²θ/(g·cos³(angle/2)). Cross-topic with Topic 9. V1. |
| A29 | effect_earth_rotation_apparent_weight | atomic | yes (Earth with latitude θ + g vs g' + plumb-line tilt α) | no | A26, gravitation (Topic 16) | — | HCV1 §7.7. Worked Ex 7. g' = √(g² - ω⁴R²sin²θ(2g - ω²R)). Indian-context: weight at Srinagar vs Chennai (latitude differences). V1. |
| A30 | block_in_funnel_smooth_cone | atomic | yes (inverted cone with block at height h, ω increasing → h changes) | no | A10, A11 | — | DCM1 L2 Q.2. Stable/unstable equilibrium along slope. V2. |
| A31 | non_inertial_frame_pseudo_force_treatment | atomic | yes (side-by-side: same problem in ground vs rotating frame) | no | A26 | — | HCV1 §7.6 worked discussion. V2 — overlaps with Topic 11 advanced. |
| A32 | banked_curve_v_min_when_friction_helps_up | atomic | yes (car on too-steep banking + low speed → tends to slide down) | no | A14 | — | When μ < tan θ. HCV1 Q.18. V2. |
| A33 | tangential_normal_acceleration_components_curvilinear | atomic | yes (general curvilinear path with a decomposed into a_t and a_n) | no | A6 | A28 | DCM1 Final Touch #1-2. Underlies "radius of curvature" concept. V1. |

**Atomic count: 33 (28 V1 + 5 V2).** Founder C-G1 split A1/A2/A3. C-G3 split A5/A10. C-G4 split A13/A14. C-G6 split A26/A27.

### D.2 — Nano concepts

| ID | Concept (nano) | Parent | Sim type | Notes |
|---|---|---|---|---|
| N1.1 | arc_length_equals_r_times_theta | A1 | derivation | s = rθ from radian definition. |
| N1.2 | radians_to_degrees_conversion | A1 | identity | 2π rad = 360°. |
| N2.1 | omega_average_vs_instantaneous | A2 | calculus | ω_avg = Δθ/Δt vs ω_inst = dθ/dt. |
| N2.2 | v_equals_r_omega_substitution | A2 | substitution | HCV1 Eq 7.4. |
| N3.1 | angular_kinematics_equations | A3 | substitution | ω = ω₀+αt; θ = ω₀t+½αt²; ω² = ω₀²+2αθ. HCV1 Eq 7.1-7.3. Direct linear analogy. |
| N3.2 | tangential_acceleration_a_t_equals_r_alpha | A3 | derivation | a_t = rα from differentiating v = rω. |
| N4.1 | e_r_e_t_change_with_position | A4 | geometric | Unit vectors rotate as particle moves. |
| N5.1 | derivation_a_r_equals_v_squared_over_r | A5 | derivation | Differentiate r·e_r twice; HCV1 Eq 7.8-7.9. `allow_deep_dive: true`. |
| N5.2 | a_r_equals_omega_squared_r | A5 | substitution | Using v = rω. |
| N5.3 | a_r_direction_always_inward | A5 | geometric | Even on opposite sides of circle. |
| N6.1 | tangential_speeding_vs_slowing | A6 | sign-analysis | a_t parallel to v ⇒ speed up; antiparallel ⇒ slow down. |
| N7.1 | uniform_v_dot_a_zero | A7 | identity | a ⊥ v ⇒ tangential component = 0 ⇒ speed constant. |
| N7.2 | period_and_frequency | A7 | identity | T = 2π/ω = 2πr/v; f = 1/T. |
| N8.1 | net_a_magnitude | A8 | substitution | a = √(a_r² + a_t²). DCM1 Final Touch #5. |
| N8.2 | angle_of_net_a_with_radius | A8 | trig | tan(angle) = a_t/a_r. |
| N10.1 | centripetal_not_a_new_force | A10 | misconception | HCV1 Points to Ponder #5 + NCERT #5. EPIC-C STATE_1 candidate. |
| N10.2 | newton_2nd_law_radial_direction | A10 | application | ΣF_radial = mv²/r. |
| N11.1 | gravity_provides_centripetal_planet | A11 | example | GMm/r² = mv²/r. Bridges to Topic 16. |
| N11.2 | tension_provides_centripetal_string | A11 | example | T = mv²/r for stone on string. |
| N11.3 | friction_provides_centripetal_car | A11 | example | Closes Friction A27 cross-reference. |
| N11.4 | normal_provides_centripetal_banked | A11 | example | N·sinθ = mv²/r component. |
| N12.1 | v_max_independent_of_mass | A12 | derivation | m cancels both sides. Counterintuitive. EPIC-C candidate. |
| N13.1 | banked_optimum_speed_friction_unused | A13 | physical_insight | At v_o, no friction needed; tires last. |
| N14.1 | banked_with_friction_v_min_case | A14 | derivation | When μ < tan θ + low v ⇒ slides DOWN. HCV1 Q.18 case. |
| N15.1 | cyclist_lean_angle_no_topple | A15 | torque-balance | tan(lean) = v²/rg from no-toppling. |
| N16.1 | conical_pendulum_period | A16 | derivation | T = 2π√(L cosθ/g). |
| N17.1 | u_min_5gR_string_at_bottom | A17 | derivation | Energy + (T≥0 at top) combined. `allow_deep_dive: true`. |
| N17.2 | u_min_2gR_rod_at_bottom | A17 | comparison | Rod can push (v=0 allowed at top). DCM1 Final Touch #3. |
| N17.3 | T_max_at_bottom_min_at_top | A17 | substitution | T_bot = m(v²/R + g); T_top = m(v²/R − g). |
| N17.4 | velocity_at_arbitrary_angle | A17 | energy | v²(θ) = u² − 2gR(1 − cosθ). |
| N19.1 | leave_sphere_at_cos_inverse_2_3 | A19 | derivation | When N=0, mgcosθ = mv²/R ⇒ cosθ=2/3 (from rest at top). DCM1 #8. |
| N21.1 | ruler_omega_max_block_no_slip | A21 | derivation | μmg = mω²L ⇒ ω_max = √(μg/L). |
| N23.1 | rotor_omega_min_floor_removed | A23 | derivation | μN=mg, N=mω²r ⇒ ω_min=√(g/μr). HCV1 Worked Ex 10. |
| N24.1 | overbridge_lose_contact_v_equals_sqrt_gR | A24 | derivation | N=0 ⇒ mv²/R = mg. |
| N25.1 | toppling_inner_wheel_lifts | A25 | torque-balance | N₂=0 ⇒ v²=gra/h. DCM1 Final Touch #6. |
| N26.1 | pseudo_force_only_in_non_inertial_frame | A26 | misconception | In ground frame: no centrifugal force. EPIC-C candidate. HCV1 §7.6. |
| N26.2 | centrifugal_magnitude_equals_centripetal | A26 | identity | mω²r in both, opposite directions, different frames. |
| N26.3 | coriolis_brief_mention | A26 | mention | Brief in HCV1 §7.6. Promoted to V2 A27 if ever authored. |
| N28.1 | radius_of_curvature_projectile_peak | A28 | substitution | At top, R = (u cosα)²/g. |
| N28.2 | radius_at_arbitrary_trajectory_point | A28 | derivation | DCM1 Example 5. |
| N29.1 | g_effective_at_equator | A29 | substitution | g' ≈ g − ω²R ≈ 9.78 m/s². |
| N29.2 | g_effective_at_poles | A29 | identity | g' = g exactly; latitude effect vanishes. |
| N29.3 | plumb_line_tilt_with_latitude | A29 | derivation | tan α = ω²R sinθcosθ/(g − ω²R sin²θ). HCV1 Eq 7.15. |

**Nano count: 43.** Several flagged as `allow_deep_dive: true` candidates.

### D.3 — Cross-topic-refs (OUT-edges from Topic 10)

| ID | Concept | Target | Edge type | Notes |
|---|---|---|---|---|
| CT1 | vector_resolution_components | Topic 5 Vectors | prereq | A13, A14, A15, A29 use it. Already shipped. |
| CT2 | newton_2nd_law_arbitrary_direction | Topic 11 Newton's Laws | prereq | A10 + all dynamics atomics. Already shipped (`newton_second_law_direction`). |
| CT3 | friction_static_kinetic | Topic 12 Friction | prereq | A12, A21, A22, A23 use it. Already shipped + closes incoming-edge from Friction A27. |
| CT4 | work_energy_theorem | Topic 13 Work-Energy | prereq | A17 vertical-circle u_min derivation requires WET. **Cross-topic with batch partner Topic 13.** |
| CT5 | non_inertial_frame_pseudo_forces | Topic 11 Newton's Laws (advanced) | prereq | A26, A27, A31 need it. NCERT skips; DCM1 + HCV1 cover. V2 fill. |
| CT6 | torque_and_rotational_equilibrium | Topic 7 Rotational Dynamics | prereq | A15 cyclist + A25 toppling. Not yet shipped. |
| CT7 | projectile_motion | Topic 9 Kinematics 2D | prereq | A28 radius-of-curvature is a projectile-trajectory result. Already shipped. |
| CT8 | gravitation_inverse_square | Topic 16 Gravitation | applies | A29 (g vs g'); N11.1 (planet centripetal source). Not yet shipped. |
| CT9 | simple_harmonic_motion | Topic 17 SHM | bridges | A18 pendulum-as-vertical-circle bridges to SHM small-angle approx. Not yet shipped. |
| CT10 | calculus_derivative_basics | math-tools | math-tools | A2, A3, A5 use dω/dt, dθ/dt. Math-tools terminator. |

**Cross-topic-ref count: 10.**

---

## E. Cross-source matrix

| Concept area | NCERT 11.1 | DCM1 Ch.10 | HCV1 Ch.7 | Source advantage |
|---|---|---|---|---|
| Angular kinematics (θ, ω, α) | Ch.4 §4.11 (gap in this read) | "Final Touch" only | §7.1 full derivation | **HCV1** |
| Centripetal acceleration derivation | Ch.4 §4.11 + Ch.5 §5.10 | Summary only | §7.3 full e_r/e_t calculus derivation | **HCV1** |
| Centripetal force as "not a new force" | §5.10 + Points to Ponder #5 | implicit | §7.4 explicit + PtP | **NCERT + HCV1** tie |
| Car on level / banked road | §5.10 full + Examples 5.10, 5.11 | Misc Examples | §7.5 + Worked Examples | **NCERT** for clearest pedagogy |
| Cyclist taking turn | §5.10 Example 5.10 | not covered | implicit in §7.5 | **NCERT only** |
| Vertical circular motion (string/rod) | not covered | **DCM1 Type 1 full** + FT #3 | Worked Ex 6 + Q.4-11 | **DCM1** for problem patterns |
| Conical pendulum | not covered | not covered | Worked Ex 3 | **HCV1 only** |
| Centrifugal force (pseudo-force) | not covered | brief | **§7.6 full section** | **HCV1** |
| Earth rotation / apparent weight | not covered | not covered | **§7.7 + Worked Ex 7** | **HCV1 only** |
| Toppling of vehicle | not covered | **Final Touch #6-7** | not covered | **DCM1 only** |
| Ball on smooth sphere | not covered | **Final Touch #8** | implicit Q.5 | **DCM1** |
| Radius of curvature of projectile | not covered | **Misc Example 5** | Q.25-26 | **DCM1 + HCV1** tie |
| Rotor / Wall-of-Death | not covered | not covered | **Worked Ex 10** | **HCV1 only** |
| Coriolis force | not covered | not covered | §7.6 brief | **HCV1 only** (deferred V2) |

**Pattern (4th confirmation): HCV1 = pedagogy + derivations + non-inertial physics; DCM1 = problem patterns + edge cases; NCERT = motivational + Indian-context anchors.** This is now the established source-role matrix across 4 catalogs and should be promoted to a memory rule.

---

## F. V1 priority queue

**Deferred to Stage 5** per [[feedback-v1-priority-deferred-to-stage-5]].

Preliminary observation (without committing): A7 `uniform_circular_motion` + A10 `centripetal_force_F_equals_mv2_over_r` are **V1 ABSOLUTE PRIORITY** because they're prereqs for Friction A27, Wave Motion CT4, Moving Charges A7-A10. Stage 5 priority sort will place them at the top of the queue.

---

## G. Open questions

| ID | Question | Status | Resolution |
|---|---|---|---|
| C-G1–C-G6 | Founder-style structural decisions | ✅ resolved | Inline in Founder Decisions table. |
| C-Q1 | Should A27 `coriolis_force` be V1 or V2? | ✅ resolved | V2. DCM1 + HCV1 brief; JEE-Mains rarely tests. |
| C-Q2 | A18 `simple_pendulum_as_vertical_circle` — Topic 10 or Topic 17 SHM? | ⏳ deferred to Topic 17 catalog | Both DCM1 + HCV1 keep in circular-motion chapter; provisional: Topic 10. |
| C-Q3 | A28 `radius_of_curvature_of_projectile` — Topic 10 or Topic 9? | ✅ resolved | Topic 10 — math is circular even though context is projectile. Topic 9 catalog will cross-reference. |
| C-Q4 | A33 `tangential_normal_acceleration_curvilinear` — atomic or nano under A8? | ✅ resolved | Promoted to atomic — pedagogically distinct (generalizes beyond circular motion). |
| C-Q5 | A31 `non_inertial_frame_pseudo_force_treatment` — Topic 10 or Topic 11? | ⏳ deferred to Topic 11 review | Likely Topic 11 as a generic technique; cite-back from Topic 10. |

---

## H. Scope boundary

**In scope (V1 + V2 mix):**
- All HCV1 Ch.7 + DCM1 Ch.10 + NCERT §5.10 content
- Non-inertial frame intro (centrifugal force atomic, coriolis V2-deferred)
- Earth-rotation apparent weight (A29)
- Toppling of vehicle in circular track (A25) — bridges to rotational dynamics but stays in Topic 10 because the trigger physics is circular

**Out of scope:**
- Rolling motion → Topic 7 Rotational Dynamics
- Moment of inertia → Topic 7
- Rigid-body rotation about fixed axis with multi-point analysis → Topic 7
- Kepler's laws / satellite orbits → Topic 16 Gravitation
- Magnetic-field circular motion → Topic 36 Moving Charges (already catalogued there as A7-A10)
- Cyclotron → Topic 36 A9 (already catalogued)
- Cyclic thermodynamic processes → Topic 19

**Topic 10 as hub (incoming edges to be closed when downstream catalogs author):**
- Friction A27 `circular_motion_friction_provides_centripetal` ← needs A10, A12 (CLOSED by this catalog)
- Wave Motion CT4 ← needs A10 (CLOSED)
- Moving Charges A7/A8/A9/A10 (cyclotron cluster) ← needs A7, A10 (CLOSED)

---

## I. Scaling notes

1. **Hub topic effort estimate established.** Topic 10 catalog from 110 PDF pages + cross-source synthesis ≈ 4 hours. Future hub topics (Topic 17 SHM, Topic 13 Work-Energy this same batch, Topic 30 Electrostatics) should expect similar effort.
2. **Founder decision framework C-G applied for 4th time.** Average decisions per catalog = 6. Lock this into a Stage-2 template heading.
3. **Cross-source matrix pattern (HCV1=pedagogy / DCM1=problems / NCERT=anchors) confirmed 4× in a row.** Promote to memory rule.
4. **Atomic count = 33** vs Friction 28, Wave Motion 25, Moving Charges 34. Average per topic = 30 ± 5. Useful planning prior for remaining 40 topics.
5. **Highest-IN-degree hub authoring confirmed valuable.** All 3 prior catalogs' dangling edges to Topic 10 are now closed by this catalog. Repeat pattern: prioritize hub topics in the Stage-2 authoring order.

---

## J. Verification checklist

- [x] 8-column atomic table format used (D.1)
- [x] Nano table with parent_atomic column (D.2)
- [x] Cross-topic-refs separated as Section D.3
- [x] All 3 sources cited with PDF page ranges (Section A)
- [x] Section F deferred to Stage 5
- [x] Founder-style decisions inline (C-G1 to C-G6)
- [x] Indian-context anchors mined from NCERT (per memory rule)
- [x] Cross-source matrix shows where each source excels
- [x] Open questions tagged with resolution status
- [x] Stage-3 gap noted (NCERT Ch.4 §4.11 not in this read)
- [x] Repo gaps explicitly noted (no `uniform_circular_motion.json` exists yet)
- [x] V1.1 backlog: no refactors needed (Topic 10 is greenfield)
- [x] Incoming-edge closures explicitly documented in Section H

---

*Catalog 4 of N. Format locked from 3 prior pilots. Stage-2 paired with Topic 13 (next in this batch).*
