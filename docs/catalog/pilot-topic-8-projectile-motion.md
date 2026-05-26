# Pilot Topic 8 — Projectile Motion

> Stage-2 pilot catalog. 39th of 44. **Kinematics-formalisation cluster CLOSER (part 1 of 2)** (sibling T9 Motion-in-Plane in same Session 56 paired-batch; together they close the cluster 4/4 with T5/T6/T7).
> Sources: **NCERT Class 11 Part 1 Ch.4 §4.10 Projectile Motion** (canonical spine — horizontal + angular launch + range/height/time-of-flight) + **HCV Vol 1 Ch.3 §3.x Projectile Motion** (derivation pedagogy + projectile-on-incline + relative-projectile) + **DC Pandey Mechanics Vol 1 Ch.7 §7.7 Projectile Motion** (problem-pattern density: incline-projectile + two-projectile + max-range-edge-cases).
> Coverage class: **TRIPLE-COVERED**.
> Anchor density: **VERY-STRONG** (13 anchors × 8 strands — sports + defence + space + transport + research + consumer + entertainment + meteorology). **First Kinematics-cluster VERY-STRONG; 9th VERY-STRONG topic overall.** Cricket/IPL + DRDO missile-ballistics + ISRO sub-orbital + artillery + firefighting-water-jets + fountain-design + javelin/shot-put — projectile motion has the richest defence + sports anchoring of any kinematics topic.
> **Critical role:** T8 formalises **projectile = horizontal-uniform + vertical-free-fall (decoupled components)** + **range/max-height/time-of-flight formulae** + **projectile-on-incline** — the canonical 2D-constant-acceleration application. **Inherits T6 free-fall + T7 vector-kinematics directly** (intra-cluster forward-edges laid Session 55). **Closes T10/T13/T14 anticipated back-edges** (energy + momentum of projectiles).

---

## Founder Decisions Applied

| Tag | Decision |
|---|---|
| **PR-G1** | Atomic granularity = "one projectile-launch-archetype OR one trajectory-property OR one optimisation." Horizontal-launch, angular-launch, range/height/TOF, projectile-on-incline, relative-projectile = 5-6 atomics. NCERT compresses into one §4.10; we split per-archetype + per-derived-property. |
| **PR-G2** | **Decoupling principle is its own atomic** (`projectile_decoupling_atomic`) — horizontal motion (uniform, a_x = 0) and vertical motion (free-fall, a_y = −g) are INDEPENDENT; coupled only through shared time t. **Diamond candidate** — dual-track animation: horizontal-uniform marker + vertical-accelerating marker + combined parabola. **cognitive_error_target:** "horizontal and vertical motions affect each other" → fully independent; the famous monkey-hunter + drop-vs-shoot simultaneity demo. |
| **PR-G3** | **Angular-launch trajectory is its own atomic** (`angular_projectile_trajectory_atomic`) — launch at angle θ with speed u: x = u·cosθ·t; y = u·sinθ·t − ½gt²; eliminate t → parabola y = x·tanθ − gx²/(2u²cos²θ). **Diamond candidate** — parabola-trace animation. |
| **PR-G4** | **Range, max-height, time-of-flight are ONE atomic** (`range_height_tof_atomic`) — Range R = u²sin(2θ)/g; max-height H = u²sin²θ/(2g); time-of-flight T = 2u·sinθ/g. All derive from decoupling. **cognitive_error_target:** "range is max at θ=90°" → max range at θ=45° (R ∝ sin2θ); 90° gives zero range (straight up-down). |
| **PR-G5** | **Velocity-at-top is its own nano** (`velocity_at_top_nano`) — at max-height, v_y = 0 but v_x = u·cosθ ≠ 0. **cognitive_error_target:** "at the top of trajectory velocity is zero" → only the VERTICAL component is zero; horizontal component persists. Classic JEE/NEET trap. |
| **PR-G6** | **Horizontal-launch (projectile from height) is its own atomic** (`horizontal_launch_atomic`) — launched horizontally from height h with speed u: time-to-ground t = √(2h/g) (independent of u); horizontal range = u·√(2h/g). Foundation for "drop-vs-shoot land simultaneously" demo. |
| **PR-G7** | **Projectile on inclined plane is its own atomic** (`projectile_on_incline_atomic`) — launch up/down an incline of angle α; resolve gravity along + perpendicular to incline OR use rotated-axis method. Range-up-incline + range-down-incline + max-range-angle on incline. **DCM problem-pattern-heavy.** |
| **PR-G8** | **Relative-projectile / two-projectile problems** = nano under `angular_projectile_trajectory_atomic` (`two_projectile_relative_nano`) — relative motion between two projectiles is straight-line (both share −g; relative a = 0). Elegant result; **cognitive scaffold**: "in the frame of one projectile, the other moves in a straight line at constant velocity." |
| **PR-G9** | **Air-resistance / real-projectile** = nano flagged for V2 (`air_resistance_real_projectile_nano`) — ideal-projectile (parabola) vs real (asymmetric, shorter range). Cricket/golf/artillery real-world deviation. Acknowledged but deferred. |
| **PR-G10** | **VERY-STRONG anchor (formalised criterion)** — 13 anchors × 8 strands. Sports (cricket-ball six + IPL + javelin/shot-put/long-jump Olympics + basketball-arc) + defence (DRDO Agni/Prithvi missile-ballistics + artillery range-tables + Pokhran trajectory) + space (ISRO sub-orbital + RLV-TD re-entry parabola) + transport (Mumbai-traffic-jump-stunts irrelevant; skip) + research (IIT ballistics labs) + consumer (garden-fountain + water-park-slides) + entertainment (fireworks-shell-burst-height + Diwali) + meteorology (volcanic-ejecta + hailstone-trajectory weak). **Meets ≥13 anchors AND ≥8 strands → VERY-STRONG.** **First Kinematics-cluster VERY-STRONG; 9th overall.** |
| **PR-G11** | **Cognitive-error-prevention sub-category — 5 instances** (PR-G2 horizontal-vertical-coupling; PR-G4 range-max-at-90; PR-G5 velocity-zero-at-top; implicit "heavier projectile shorter range" → mass-independent in vacuum; implicit "max-range-angle is always 45°" → only on level ground, NOT on incline). Founder-decision share: 5/11 = 45%. **Sustains Kinematics-cluster cognitive-error density** (T6 55%, T7 50%, T8 45% — cluster mean 50%). |

---

## Section A — Source Map

| Sub-topic | NCERT 11.1 Ch.4 §4.10 | HCV V1 Ch.3 | DCM M1 Ch.7 §7.7 |
|---|---|---|---|
| Decoupling of horizontal + vertical | §4.10 | §3.x intro | §7.7.1 |
| Horizontal launch (from height) | §4.10 | §3.x | §7.7.2 |
| Angular launch + parabolic trajectory | §4.10 | §3.x | §7.7.3 |
| Range, max-height, time-of-flight | §4.10 | §3.x | §7.7.4 |
| Velocity at any point / at top | §4.10 | §3.x | §7.7.5 |
| Projectile on inclined plane | (not in NCERT) | §3.x ex | §7.7.6 |
| Two-projectile / relative-projectile | (not in NCERT) | §3.x ex | §7.7.7 |

**NCERT §4.10 is the canonical spine** for level-ground projectile. **HCV Ch.3 carries derivation pedagogy** + incline-projectile + relative-projectile (NCERT-omitted JEE-Advanced material). DCM M1 §7.7 carries problem-pattern density for incline + two-projectile edge cases.

**NCERT-omission note:** projectile-on-incline + two-projectile-relative are HCV+DCM (not NCERT) — JEE-Advanced extensions. Core atomics (decoupling + angular-launch + range/height/TOF + horizontal-launch + velocity-at-top) are TRIPLE-covered; the two extension atomics are DUAL (HCV+DCM).

---

## Section B — Atomic + Nano Catalog

| ID | Concept | Type | Sim? | In repo? | Requires | Required-by | Notes |
|---|---|---|---|---|---|---|---|
| **projectile_decoupling_atomic** | A projectile's motion decomposes into TWO INDEPENDENT motions: **horizontal** (uniform, a_x = 0, x = u_x·t) and **vertical** (free-fall, a_y = −g, y = u_y·t − ½gt²). The only link is the shared time t. **Neither component affects the other.** | atomic | ✅ | — | [vector_kinematics_2d_atomic(T7), free_fall_gravity_atomic(T6), 2d_kinematic_equations_componentwise_nano(T7)] | [angular_projectile_trajectory_atomic, horizontal_launch_atomic, range_height_tof_atomic] | PR-G2; **Diamond candidate**; **cognitive_error_target:** "horizontal & vertical motions affect each other" — monkey-hunter demo |
| ↳ drop_vs_shoot_simultaneity_nano | Bullet fired horizontally + bullet dropped from same height at same instant: **both hit the ground at the same time** (vertical motion identical; horizontal motion irrelevant to fall-time). Classic demonstration of decoupling. **CBSE Class-11 conceptual-favourite + Mythbusters viral demo.** | nano | ✅ | — | [projectile_decoupling_atomic, horizontal_launch_atomic] | — | parent; decoupling cognitive proof |
| ↳ monkey_hunter_demo_nano | Hunter aims directly AT a monkey hanging from a branch; monkey drops at the instant of firing. **Dart hits monkey** regardless of dart speed — because both dart and monkey fall by the same ½gt² in the same time. Decoupling masterclass. | nano | ✅ | — | [projectile_decoupling_atomic] | — | parent; cognitive scaffold |
| **angular_projectile_trajectory_atomic** | Launch at angle θ to horizontal with speed u: **x = u·cosθ·t**; **y = u·sinθ·t − ½gt²**. Eliminate t → **trajectory: y = x·tanθ − gx²/(2u²cos²θ)** = downward parabola. Symmetric about the peak. | atomic | ✅ | — | [projectile_decoupling_atomic, parametric_2d_trajectory_nano(T7)] | [range_height_tof_atomic, projectile_on_incline_atomic] | PR-G3; **Diamond candidate**; parabola-trace animation |
| ↳ parabola_symmetry_nano | Ascending half (launch→peak) is mirror-image of descending half (peak→landing) on level ground. Time-up = time-down = u·sinθ/g. Speed at any height on the way up = speed at the same height on the way down (directions differ). | nano | ✅ | — | [angular_projectile_trajectory_atomic] | — | parent; symmetry scaffold |
| ↳ two_projectile_relative_nano | Two projectiles launched simultaneously: in the frame of one, the other moves in a **STRAIGHT LINE at constant velocity** (relative acceleration = (−g) − (−g) = 0). Elegant simplification; collision-condition reduces to straight-line geometry. | nano | ✅ | — | [angular_projectile_trajectory_atomic, galilean_transformation_atomic(T7)] | — | parent; PR-G8; **JEE-Advanced; NCERT-omitted** |
| **range_height_tof_atomic** | From decoupling on level ground: **Time-of-flight T = 2u·sinθ/g**; **Max-height H = u²sin²θ/(2g)**; **Range R = u²sin(2θ)/g**. Max range at **θ = 45°** (sin2θ = 1). Complementary angles (θ and 90°−θ) give the SAME range. | atomic | ✅ | — | [angular_projectile_trajectory_atomic, projectile_decoupling_atomic, kinematic_equations_constant_a_atomic(T6)] | — | PR-G4; **cognitive_error_target:** "range max at θ=90°" → max at 45°; sin2θ form |
| ↳ complementary_angles_same_range_nano | θ = 30° and θ = 60° give the same range (sin60° = sin120°). Trade-off: 30° = flatter, faster, lower; 60° = higher, slower, same horizontal distance. Cricket-fielder-throw vs lob choice. | nano | ✅ | — | [range_height_tof_atomic] | — | parent; **sports anchor** |
| ↳ max_range_45_derivation_nano | R = u²sin(2θ)/g is maximised when sin(2θ) = 1 → 2θ = 90° → θ = 45°. R_max = u²/g. **Only true on level ground** (incline changes optimal angle — see projectile_on_incline). | nano | ✅ | — | [range_height_tof_atomic, angular_projectile_trajectory_atomic] | [projectile_on_incline_atomic] | parent; derivation + boundary-condition flag |
| ↳ velocity_at_top_nano | At max-height: **v_y = 0** but **v_x = u·cosθ ≠ 0**. Total speed at top = u·cosθ (purely horizontal). **cognitive_error_target:** "velocity is zero at the top" → only vertical component; horizontal persists. Classic JEE/NEET trap. | nano | ✅ | — | [range_height_tof_atomic, projectile_decoupling_atomic] | — | parent; PR-G5 cognitive-error countermeasure |
| **horizontal_launch_atomic** | Projectile launched HORIZONTALLY from height h with speed u: **time-to-ground t = √(2h/g)** (independent of u — pure free-fall vertically); **horizontal range = u·√(2h/g)**; lands with v_x = u, v_y = √(2gh). Trajectory = half-parabola. | atomic | ✅ | — | [projectile_decoupling_atomic, free_fall_gravity_atomic(T6)] | — | PR-G6; foundation for drop-vs-shoot demo |
| ↳ time_independent_of_launch_speed_nano | Two balls launched horizontally from the same height at different speeds (10 m/s and 50 m/s): **both land at the same time** (t = √(2h/g)); the faster one lands farther horizontally. Direct consequence of decoupling. | nano | ✅ | — | [horizontal_launch_atomic, projectile_decoupling_atomic] | — | parent; cognitive scaffold |
| ↳ table_edge_ball_roll_off_nano | Ball rolling off a table edge at speed u: classic CBSE/ISC physics-practical (measure table-height + landing-distance → compute g or u). **Indian physics-lab-standard experiment.** | nano | ✅ | — | [horizontal_launch_atomic] | — | parent; **education anchor** |
| **projectile_on_incline_atomic** | Projectile launched up/down an incline of angle α. **Rotated-axis method**: take axes along + perpendicular to incline; gravity components g·sinα (along, decelerating) + g·cosα (perpendicular). Range up-incline R_up = 2u²·sin(θ−α)·cosθ / (g·cos²α); max-range angle on incline = 45° + α/2 (up) or 45° − α/2 (down). | atomic | ✅ | — | [angular_projectile_trajectory_atomic, max_range_45_derivation_nano, vector_resolution_atomic(T5)] | — | PR-G7; **DCM-problem-heavy; HCV+DCM only (NCERT-omitted)**; **cognitive_error_target:** "max-range angle always 45°" → 45°±α/2 on incline |
| ↳ rotated_axis_method_nano | On an incline, choose x' along the slope + y' perpendicular. Then g resolves into −g·sinα (x') and −g·cosα (y'). Projectile lands when y' = 0 again. **Reduces incline-projectile to standard decoupling in rotated frame.** | nano | ✅ | — | [projectile_on_incline_atomic, vector_resolution_atomic(T5)] | — | parent; method scaffold |
| ↳ artillery_range_table_application_nano | Artillery + DRDO ballistic computations use elevation-angle vs range tables (corrected for air-resistance + terrain-slope). The incline-projectile + max-range-angle physics underpins range-table construction. **Indian-Army + DRDO Pokhran anchor.** | nano | — | — | [projectile_on_incline_atomic, range_height_tof_atomic] | — | parent; **defence anchor** |
| ↳ air_resistance_real_projectile_nano | Ideal projectile (parabola, symmetric) vs real projectile (asymmetric trajectory — steeper descent, shorter range, lower peak) due to air drag ∝ v². Cricket-ball swing + golf-ball dimples + artillery drag-correction. **Deferred to V2 advanced.** | nano | — | — | [angular_projectile_trajectory_atomic] | — | parent; PR-G9; V2 flag |

**Atomic count:** 5. **Nano count:** 12. **Total entries:** 17.

---

## Section C — Cross-Source Coverage Matrix

| Atomic | NCERT 11.1 §4.10 | HCV V1 Ch.3 | DCM M1 §7.7 | Coverage |
|---|---|---|---|---|
| projectile_decoupling_atomic | §4.10 | §3.x | §7.7.1 | TRIPLE |
| angular_projectile_trajectory_atomic | §4.10 | §3.x | §7.7.3 | TRIPLE |
| range_height_tof_atomic | §4.10 | §3.x | §7.7.4 | TRIPLE |
| horizontal_launch_atomic | §4.10 | §3.x | §7.7.2 | TRIPLE |
| projectile_on_incline_atomic | (omitted) | §3.x ex | §7.7.6 | DUAL (HCV + DCM; NCERT-omitted JEE-Advanced) |

**Triple-coverage rate: 4 of 5 atomics = 80%.** **STREAK BROKEN at 8** (T8 = 80%; projectile-on-incline is HCV+DCM-only JEE-Advanced extension — NCERT 2023 omits it). Pattern consistent with T14 Momentum (70%) + T15 Rotational (92%): foundational chapters return 100%, but topics with JEE-Advanced extension atomics dip to 80-92% because NCERT omits the advanced material. **4 core atomics TRIPLE; 1 extension atomic DUAL.** Streak resets; core-physics-100% pattern holds.

---

## Section D — Stage-3 Math-Tool Dependencies

| Math-tool primitive | Used by | Status |
|---|---|---|
| `algebra_quadratic` (eliminate t; y(x) parabola) | angular_projectile_trajectory_atomic | REQUIRED (existing) |
| `trig_sin_cos_for_resolution` (u·cosθ, u·sinθ) | angular_projectile_trajectory_atomic, range_height_tof_atomic | REQUIRED (existing) |
| `trig_double_angle_sin2theta` (R = u²sin2θ/g) | range_height_tof_atomic | REQUIRED (existing; validated T17 SHM) |
| `calculus_minmax` (max-range dR/dθ = 0) | max_range_45_derivation_nano, projectile_on_incline_atomic | REQUIRED (existing) |
| `kinematic_equations_constant_a` (componentwise) | all atomics | REQUIRED (T6 origin) |
| `vector_resolution_components` (incline rotated-axis) | projectile_on_incline_atomic | REQUIRED (T5 origin) |
| `algebra_sqrt_function` (t = √(2h/g)) | horizontal_launch_atomic | REQUIRED (existing) |

**ZERO new stubs registered.** All math-tools REQUIRED. Math-tools IN-degree unchanged: **52**. **Light-maintenance mode continues 7 consecutive sessions** (S50 → S56) — extends NEW LONGEST zero-stub streak.

---

## Section E — Cross-Topic Dependencies (Bidirectional Edges)

### Outgoing (T8 requires from earlier topics)

| Target topic | Edge | Reason |
|---|---|---|
| **T7 2D Kinematics (intra-cluster)** | projectile_decoupling ← T7 vector_kinematics + componentwise; angular_trajectory ← T7 parametric_trajectory; two_projectile ← T7 galilean | **Closes T7 Session-55 anticipated forward** (1-session lag) |
| **T6 1D Kinematics (intra-cluster)** | horizontal_launch ← T6 free_fall; range/height/TOF ← T6 kinematic_equations | Pre-existing intra-cluster (laid Session 55) |
| **T5 Vectors** | projectile_on_incline ← T5 vector_resolution (rotated-axis) | Pre-existing T5 (in repo) |
| **T9 Motion-in-Plane (intra-session)** | projectile_decoupling ↔ T9 circular-kinematics (both 2D-constant-a families) | **Intra-session bidirectional** (4 edges; see T9 §E) |
| Math-tools | 7 primitives (zero new stubs) | All REQUIRED |

### Incoming (T8 will be required by later topics)

| Source topic | Edge | Reason |
|---|---|---|
| **T10 Circular Motion (back-edge)** | T10 projectile-circular-combined problems ← T8 trajectory | **CLOSES** T10 Session-39 anticipated forward (weak; 17-session lag) |
| **T13 Work-Energy (back-edge)** | T13 projectile-energy-conservation ← T8 velocity-at-any-point | **CLOSES** T13 Session-37 anticipated forward (energy of projectile; 19-session lag) |
| **T14 Momentum (back-edge)** | T14 projectile-impulse + exploding-projectile ← T8 trajectory | **CLOSES** T14 Session-50 anticipated forward (5-session lag) |
| **T16 Gravitation (back-edge weak)** | T16 orbital-as-extended-projectile ← T8 (Newton's cannonball) | weak; conceptual bridge |

### T8 ↔ T9 intra-session bidirectional edges (4 edges; intra-cluster)

1. T8 `projectile_decoupling_atomic` ↔ T9 `uniform_circular_kinematics_atomic` (both 2D-motion families with different acceleration profiles)
2. T8 `angular_projectile_trajectory_atomic` ↔ T9 `centripetal_acceleration_kinematic_atomic` (curved-path-acceleration contrast: parabola vs circle)
3. T8 `range_height_tof_atomic` ↔ T9 `angular_kinematic_variables_atomic` (time-parametrisation of curved motion)
4. T8 `velocity_at_top_nano` ↔ T9 `tangential_velocity_nano` (velocity-direction-along-path)

**4 bidirectional edges = intra-cluster cluster-CLOSER pair (below 6-9 chapter-adjacent band).** **Confirms Session-54 sub-pattern**: cluster-closer pairs sit below the 6-9 band (T22-T23 = 4; now T8-T9 = 4) because the cluster-opener pair (T6-T7 = 8) carried the bridging weight. **10th density-rule data point; 2nd cluster-closer-below-band confirmation.**

**Total outgoing: 7 math-tools + 1 T5 prereq + intra-cluster T6/T7 (laid) + 4 intra-session with T9.**
**Total incoming: 1 forward from T7 closed + 3 back-edge closures (T10 + T13 + T14) + 1 weak (T16).**

**Total Session 56 forward-edge closures (T8 portion): 4 (T7-intra + T10 + T13 + T14).** Combined Sessions 50-56 running total continuing.

---

## Section F — Real-World Anchors (VERY-STRONG, Indian-context)

| Anchor | Concept hook | Authoring use | Strand |
|---|---|---|---|
| **Cricket — six-hitting trajectory + IPL (Rohit Sharma / MS Dhoni helicopter shot)** | angular_projectile_trajectory_atomic, range_height_tof_atomic, complementary_angles_same_range_nano | "Dhoni's helicopter shot launches ball at ~30-35° for max carry; six = ~100m range; commentators' 'distance covered' is projectile range" | Sports |
| **Cricket — fast-bowler bouncer + fielder throw-to-stumps** | velocity_at_top_nano, angular_projectile_trajectory_atomic | "Fielder's flat throw (low θ, high speed) vs lob (high θ): complementary-angle trade-off in run-out decisions" | Sports |
| **DRDO Agni / Prithvi ballistic missiles — trajectory + range** | projectile_on_incline_atomic, range_height_tof_atomic, artillery_range_table_application_nano | "Agni-V ballistic trajectory = projectile + gravity-turn; range computed via elevation-angle optimisation (real version adds thrust + air-drag)" | Defence |
| **Indian Army artillery (Bofors / ATAGS / Dhanush) — range tables** | projectile_on_incline_atomic, artillery_range_table_application_nano, max_range_45_derivation_nano | "ATAGS 155mm howitzer range tables: elevation angle vs range, terrain-slope corrected — direct projectile-on-incline application" | Defence |
| **ISRO sub-orbital + RLV-TD re-entry parabola** | angular_projectile_trajectory_atomic, projectile_decoupling_atomic | "RLV-TD (Reusable Launch Vehicle Tech Demonstrator) follows ballistic-parabola during un-powered descent before glide" | Space |
| **Olympic/Asian-Games javelin (Neeraj Chopra) + shot-put + long-jump** | range_height_tof_atomic, angular_projectile_trajectory_atomic | "Neeraj Chopra's gold-medal javelin: optimal release angle ~33-36° (less than 45° because of release-height + aerodynamic lift)" | Sports |
| **Basketball / netball shooting arc** | angular_projectile_trajectory_atomic, parabola_symmetry_nano | "Free-throw arc: high-θ launch for steep descent into hoop; trajectory-optimisation by players" | Sports |
| **Firefighting water-jet + fire-tender monitor nozzles** | angular_projectile_trajectory_atomic, range_height_tof_atomic | "Fire-brigade water-jet aimed at 45° for max horizontal reach; adjust angle for height of building floor" | Public-Service / Consumer |
| **Garden fountains + water-park slides (Wonderla, Essel World)** | angular_projectile_trajectory_atomic, parabola_symmetry_nano | "Decorative fountain water-arcs are projectile parabolas; water-park slide-exits launch riders as projectiles" | Consumer / Entertainment |
| **Diwali fireworks — aerial-shell burst-height** | range_height_tof_atomic, velocity_at_top_nano | "Aerial firework shells timed to burst at max-height (v_vertical = 0) for symmetric spread; Diwali + Indian festival universal anchor" | Entertainment / Consumer |
| **Table-edge ball roll-off (CBSE/ISC physics practical)** | horizontal_launch_atomic, table_edge_ball_roll_off_nano | "Standard Class-11/12 lab: ball rolls off table edge, measure landing distance → compute launch speed or g" | Education |
| **IIT ballistics + projectile labs (photogate + high-speed-camera)** | projectile_decoupling_atomic, angular_projectile_trajectory_atomic | "IIT-Bombay + IIT-Madras undergrad labs use high-speed cameras to trace projectile parabolas + verify decoupling" | Research / Education |
| **Volcanic-ejecta + hailstone-trajectory (IMD + GSI weak)** | angular_projectile_trajectory_atomic, air_resistance_real_projectile_nano | "Volcanic-bomb ballistic trajectories (Barren Island) + hailstone fall-paths modelled as projectiles with drag" | Meteorology / Research |

**Total: 13 distinct institutional/system anchors across 8 strands** (sports, defence, space, public-service, consumer, entertainment, education/research, meteorology). **Meets ≥13 anchors AND ≥8 strands → VERY-STRONG (PR-G10).** **First Kinematics-cluster VERY-STRONG; 9th VERY-STRONG topic overall** (T48, T49, T50, T39, T26, T20, T25, T23, **T8**). Projectile motion's unique advantage: it's the ONLY kinematics topic with strong DEFENCE anchoring (ballistics) AND strong SPORTS anchoring (every Indian student watches cricket) — the dual-strand richness pushes it to VERY-STRONG where T6/T7 plateaued at STRONG. **VERY-STRONG share rises to 9/39 = 23%.**

---

## Section G — Cognitive-Error-Prevention Decisions

**5 of 11 founder decisions are cognitive-error-prevention type = 45%.** Sustains Kinematics-cluster cognitive-error density (T6 55%, T7 50%, T8 45% — cluster mean 50%).

| Tag | cognitive_error_target | Countermeasure |
|---|---|---|
| **PR-G2** | "horizontal and vertical motions affect each other" | Mandatory drop-vs-shoot simultaneity demo + monkey-hunter demo (decoupling proof) |
| **PR-G4** | "range is maximum at θ=90°" | Mandatory R ∝ sin2θ derivation showing max at 45°; 90° gives zero range |
| **PR-G5** | "velocity is zero at the top of the trajectory" | Mandatory velocity-at-top nano: only v_y = 0; v_x = u·cosθ persists |
| **(implicit)** | "heavier projectiles have shorter range" | Author: range is mass-independent in vacuum (decoupling + free-fall mass-independence from T6) |
| **(implicit)** | "max-range angle is always 45°" | Author: 45° only on level ground; on incline it's 45° ± α/2 |

**Combined Session 56 cognitive-error share (T8 portion): 45%.** Kinematics-formalisation cluster mean across T6+T7+T8 = (55+50+45)/3 = **50%** — remains DENSEST-misconception cluster set. Projectile-motion misconceptions (coupling, velocity-at-top, max-angle) are among the most classic in physics education — confirms the cluster's elevated-gate authoring priority.

---

## Section H — V1 Priority Flags

| Atomic | V1? | Reason |
|---|---|---|
| projectile_decoupling_atomic | ✅ | Diamond candidate; the single most important projectile concept; monkey-hunter demo; cognitive-error-rich |
| angular_projectile_trajectory_atomic | ✅ | Diamond candidate; parabola-trace; cricket/IPL universal anchor |
| range_height_tof_atomic | ✅ | Pure-curricular essential; every JEE/NEET projectile problem; complementary-angles + 45° |
| horizontal_launch_atomic | ✅ | drop-vs-shoot demo; table-edge lab; foundational |
| projectile_on_incline_atomic | ⚖️ | V1.1; JEE-Advanced (DUAL coverage); DRDO/artillery anchor; rotated-axis method |

**V1 ship count for T8: 4 atomics.** VERY-STRONG anchor + 4 V1 atomics — strong V1 candidate batch (defence + sports dual-anchoring makes it marketing-rich).

---

## Section I — Open Questions

1. **Air-resistance projectile (quadratic drag)** — flagged `air_resistance_real_projectile_nano`; V2 advanced (cricket-swing, golf-dimples, artillery-drag-correction).
2. **Projectile with wind (crosswind drift)** — bridges to T7 relative-motion; V2.
3. **Magnus-effect spin (cricket-ball swing, football-bend)** — fluid-dynamics; cross-link to T20; V2 advanced.
4. **Coriolis-corrected long-range ballistics** — DRDO-relevant; graduate; V2.
5. **Newton's-cannonball → orbital-motion bridge** — links T8 to T16 Gravitation; conceptual; could be a nano under angular-trajectory.
6. **Kinematics-formalisation cluster check** — T6 + T7 + T8 done; **T9 Motion-in-Plane closes the cluster this session (4/4 with T5).**

---

## Section J — Sign-Off

- Authored: Session 56, 2026-05-26.
- Author: Claude (Architect+Engineer role).
- Coverage class: **TRIPLE** (4/5 atomics; 1 DUAL extension atomic).
- Anchor density: **VERY-STRONG** (13 anchors × 8 strands — **first Kinematics-cluster VERY-STRONG; 9th VERY-STRONG overall**).
- Triple-coverage rate: **80%** (4/5 atomics) — **STREAK BROKEN at 8** (projectile-on-incline is HCV+DCM-only JEE-Advanced extension; NCERT-omitted). Core-physics-100% pattern holds; only the advanced-extension atomic dips coverage.
- Atomic count: **5**. Nano count: **12**. Total: **17 entries**.
- V1 ship count: **4 atomics**.
- **Closes anticipated forward-edges: 4** (T7-intra-cluster + T10 + T13 + T14).
- **Kinematics-formalisation cluster CLOSER (part 1) — T9 closes 4/4 this session.**
- **0 new math-tools stubs. Light-maintenance NEW LONGEST streak at 7 consecutive sessions.**
- Cognitive-error-prevention founder-decision share: **45%** (5/11). Cluster mean (T6+T7+T8) = 50%.
- Next pilot: T9 Motion-in-Plane (intra-session paired-batch; closes cluster).

---

*9th VERY-STRONG topic; FIRST Kinematics-cluster VERY-STRONG (dual defence + sports anchoring). 80% coverage — streak broken at 8 by NCERT-omitted incline-projectile extension; core 4 atomics TRIPLE. Cluster cognitive-error mean holds at 50%. 7 consecutive math-tools light-maintenance sessions. T8-T9 = 4 intra-cluster edges (2nd cluster-closer-below-band confirmation).*
