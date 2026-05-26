# Pilot Topic 3 — Mathematical Tools (Calculus + Functions + Approximations for Physics)

> Stage-2 pilot catalog. 42nd of 44. **NCERT-intro straggler-pair (part 2 of 2)** (sibling T2 Units & Measurements in same Session 57 paired-batch). **NOT a cluster.** T3 is the **human-facing companion to the Stage-3 math-tools reference file** (`stage-3-math-tools.md`): that file is the internal terminator-registry; THIS catalog is the student-facing topic that TEACHES the calculus/functions/approximations layer.
> Sources: **HC Verma Vol 1 Ch.2 "Physics and Mathematics"** (the canonical STANDALONE math-tools-for-physics chapter — vectors + calculus intro + functions + approximations) + **DC Pandey Mechanics Vol 1 Ch.5 "Basic Mathematics"** (problem-pattern density: derivative/integral drill + graph problems) + **NCERT — DELEGATED** (NCERT Physics has NO standalone math-tools chapter; calculus is assumed from Class 11/12 Math Ch.13/Ch.5/Ch.7, vectors live in NCERT Physics Ch.4 = T5).
> Coverage class: **NCERT-DELEGATED** (a NEW coverage class — distinct from NCERT-OMITTED). NCERT does not OMIT this material; it DELEGATES it to the Math syllabus and uses it operationally in physics without re-teaching.
> Anchor density: **MEDIUM** (6 anchors × 4 strands — everyday-instrument + space + nuclear/decay + education/lab). Math tools are inherently abstract; anchoring comes only via APPLICATION (speedometer = derivative, odometer = integral, radioactive-dating = exponential). 2nd MEDIUM topic (joins T34) — confirms "abstract foundations anchor weakly."
> **Critical role:** T3 teaches **calculus-for-physics** (derivative as rate/slope, integral as area/accumulation), **functions & graphs** (the 5 canonical physics function-shapes + slope/area extraction), and **controlled approximations** (small-angle, binomial). **T3 is a DAG-ROOT node** alongside T2 + T5: it ABSORBS the calculus + small-angle + binomial teaching-unit terminators cited by ~10 prior pilots (T6/T8/T9/T13/T16/T17/T21/T44/etc.). **EXPLICITLY DEFERS vectors to T5** (already in repo) — no duplication. Authored 42nd because, like T2, every topic silently assumed it.

---

## Founder Decisions Applied

| Tag | Decision |
|---|---|
| **MT-G1** | Atomic granularity = "one calculus-operation OR one representation-skill." Derivative-as-rate, integral-as-area, functions-and-graphs, approximations = 4 atomics. T3 teaches the MATHEMATICAL-MACHINERY layer of physics — NOT the physics itself, NOT the unit/error layer (that is T2). |
| **MT-G2** | **VECTORS ARE EXPLICITLY DEFERRED TO T5.** T5 Vectors (already shipped in repo) owns vector_addition / resolution / dot-product / cross-product. T3 does NOT re-teach them. **Decision rationale:** the math-tools file lists vector primitives, but T5 is their teaching home; duplicating them in T3 would violate the no-overlap principle. T3 = calculus + functions + approximations ONLY. |
| **MT-G3** | **Derivative-as-rate-and-slope is its own atomic** (`derivative_as_rate_and_slope_atomic`) — d/dx = slope of tangent; d/dt = rate of change; physics meaning (v = dx/dt, a = dv/dt, I = dq/dt, P = dW/dt). **Teaching-unit** (owns the physics framing of math-tool `calculus_derivative_basics`). **cognitive_error_target:** "the derivative is just a formula to memorise" → it is a SLOPE / a RATE; the formula is downstream of the meaning. |
| **MT-G4** | **Integral-as-area-and-accumulation is its own atomic** (`integral_as_area_and_accumulation_atomic`) — ∫ = area under a curve = accumulated total; physics meaning (displacement = ∫v dt, work = ∫F dx, charge = ∫I dt, impulse = ∫F dt). **Teaching-unit** (owns `calculus_integration_basics` framing). **cognitive_error_target:** "integration and differentiation are unrelated operations" → they are INVERSES (Fundamental Theorem); the area-accumulation undoes the slope-rate. |
| **MT-G5** | **Functions-and-graphs-in-physics is its own atomic** (`functions_and_graphs_in_physics_atomic`) — the 5 canonical shapes: linear (y = mx + c), quadratic (parabola), inverse (1/x), sinusoidal (A sin(ωt + φ)), exponential (e^(±t/τ)); extracting physics from slope, intercept, area, curvature. **cognitive_error_target:** "the graph is just a picture of the data" → the slope and the area BOTH carry physical meaning (a v-t graph's slope = acceleration, its area = displacement). |
| **MT-G6** | **Approximations-in-physics is its own atomic** (`approximations_in_physics_atomic`) — small-angle (sin θ ≈ tan θ ≈ θ, cos θ ≈ 1 for θ ≪ 1 rad), binomial ((1 + x)ⁿ ≈ 1 + nx for x ≪ 1), the WHY (extract leading behaviour) and the validity boundary (~0.1 rad ≈ 6° for ~1% error). **Teaching-unit** (owns `trig_small_angle_approximations` + `series_binomial_expansion` framing). **cognitive_error_target:** "approximations are sloppy / less correct" → they are CONTROLLED, with a known validity range; physics is built on them (SHM, paraxial optics, g(h)). |
| **MT-G7** | **Coverage class = NCERT-DELEGATED (NEW class).** NCERT Physics has NO standalone math-tools chapter — calculus is formally taught in Class 11 Math (Ch.13 Limits & Derivatives) + Class 12 Math (Ch.5 Differentiability, Ch.7 Integrals), and NCERT Physics USES it without re-teaching. This is structurally DIFFERENT from NCERT-OMITTED (where NCERT skips JEE-Advanced extensions like incline-projectile). **Founder decision:** record T3 honestly as NCERT-DELEGATED; report triple-coverage as ~50% (2 of 4 atomics formally present via the Math syllabus; 2 of 4 are physics-pedagogy framings unique to HCV+DCM). |
| **MT-G8** | **T3 is a DAG-ROOT — it ABSORBS math-tool teaching-unit terminators.** `calculus_derivative_basics`, `calculus_integration_basics`, `trig_small_angle_approximations`, `series_binomial_expansion_and_approximation` were carried as math-tool reference entries cited by ~10 prior pilots. Founder decision: those teaching-unit references now have their student-facing home in T3's 4 atomics (the math-tools FILE remains the internal registry). math-tools IN-degree HELD at 52; flag Stage-4 to reconcile the teaching-unit ownership. **Zero NEW math-tool stubs from T3.** |
| **MT-G9** | **MEDIUM anchor (formalised criterion)** — 6 anchors × 4 strands. Everyday-instrument (speedometer = derivative; odometer = integral; the two most relatable calculus anchors) + space (ISRO trajectory integration — numerical calculus for orbit prediction) + nuclear/decay (radioactive dating + RC discharge = exponential function) + education/lab (graph-linearisation skill; reading v-t-graph slope/area in the physics lab). **Decision (MT-G9): MEDIUM** — math tools are inherently abstract; only their APPLICATIONS anchor. **2nd MEDIUM topic** (joins T34 Current Electricity); confirms the "abstract-foundation-anchors-weakly" pattern (cf. T31 Capacitors WEAK). |
| **MT-G10** | **Cognitive-error-prevention sub-category — 4 instances** (MT-G3 derivative-is-just-a-formula; MT-G4 integration/differentiation-unrelated; MT-G5 graph-is-just-a-picture; MT-G6 approximations-are-sloppy). Founder-decision share: 4/9 = 44%. T3 is misconception-rich because students arrive FEARING calculus and treat it PROCEDURALLY (memorise rules) rather than CONCEPTUALLY (slope/area/rate) — the procedural-vs-conceptual gap is the topic's defining cognitive challenge. |

---

## Section A — Source Map

| Sub-topic | NCERT (delegated) | HCV V1 Ch.2 | DCM M1 Ch.5 |
|---|---|---|---|
| Derivative as rate + slope | Math Ch.13 (not Physics) | §2.9-2.11 | §5.4 |
| Integral as area + accumulation | Math Ch.7 (Class 12, not Physics) | §2.12-2.13 | §5.5 |
| Functions + graphs in physics | embedded in Physics Ch.3 motion-graphs (partial) | §2.7-2.8 | §5.2-5.3 |
| Approximations (small-angle, binomial) | used, not formally taught | §2.14 | §5.6 |
| Vectors | **Physics Ch.4 = T5** | §2.1-2.6 | §5.1 |

**HCV Ch.2 "Physics and Mathematics" is the canonical STANDALONE spine** — the only one of the three that dedicates a chapter to physics-framed math (IIT-Kanpur pedagogical lineage). **DCM M1 Ch.5 "Basic Mathematics" carries the problem-drill.** **NCERT DELEGATES**: calculus is in the Class 11/12 MATH books, graph-reading is embedded in Physics Ch.3 (motion), vectors are in Physics Ch.4 (= T5). NCERT Physics never re-teaches calculus as its own unit.

**Delegation note (MT-G7):** This is the cleanest example in Stage-2 of the NCERT-DELEGATED pattern. The two atomics that ARE formally in the NCERT system (derivative, integral — via Class 11/12 Math) count toward triple-coverage; the two that are physics-pedagogy-only (functions-and-graphs framing as a SKILL, approximations as a controlled DISCIPLINE) are HCV+DCM-dominant. T3 makes the strategic point concrete: **math-tools live in the Math syllabus and surface operationally in physics** — which is exactly why the Stage-3 math-tools file exists as a separate reference rather than appearing as a triple-covered physics topic.

---

## Section B — Atomic + Nano Catalog

| ID | Concept | Type | Sim? | In repo? | Requires | Required-by | Notes |
|---|---|---|---|---|---|---|---|
| **derivative_as_rate_and_slope_atomic** | The derivative dy/dx = **slope of the tangent** to the y(x) curve; d/dt = **instantaneous rate of change**. Physics meaning: v = dx/dt, a = dv/dt, I = dq/dt, P = dW/dt, F = dp/dt. The standard-derivatives table (xⁿ, sin, cos, eˣ) is downstream of this geometric/rate meaning. | atomic | ✅ | — | [functions_and_graphs_in_physics_atomic] | [avg_vs_instantaneous_velocity_atomic(T6), acceleration_definition_atomic(T6), EVERY rate-defined quantity (universal); absorbs math-tool `calculus_derivative_basics`] | MT-G3; teaching-unit; **cognitive_error_target:** "derivative is just a formula to memorise" |
| ↳ slope_of_tangent_nano | Geometric meaning: the derivative at a point = the slope of the line just touching the curve there. Secant → tangent as Δx → 0. The limit definition made visual. | nano | ✅ | — | [derivative_as_rate_and_slope_atomic] | — | parent; MT-G3 geometric scaffold |
| ↳ standard_derivatives_table_nano | d(xⁿ)/dx = nxⁿ⁻¹; d(sin x)/dx = cos x; d(cos x)/dx = −sin x; d(eˣ)/dx = eˣ; chain + product rule. The operational toolkit — but taught AFTER the slope/rate meaning. | nano | ✅ | — | [derivative_as_rate_and_slope_atomic, slope_of_tangent_nano] | — | parent; operational toolkit |
| ↳ derivative_in_physics_nano | The recurring physics derivatives: v = dx/dt (speedometer reads this), a = dv/dt, I = dq/dt, P = dW/dt, F = dp/dt. Each is a RATE the student already intuits before the calculus. | nano | ✅ | — | [derivative_as_rate_and_slope_atomic] | — | parent; **everyday-instrument anchor** (speedometer) |
| **integral_as_area_and_accumulation_atomic** | The definite integral ∫ₐᵇ f(x) dx = **area under the f(x) curve** = **accumulated total**. Physics meaning: displacement = ∫v dt (area under v-t), work = ∫F dx (area under F-x), charge = ∫I dt, impulse = ∫F dt. The **Fundamental Theorem** links it to the derivative as the inverse operation. | atomic | ✅ | — | [derivative_as_rate_and_slope_atomic, functions_and_graphs_in_physics_atomic] | [s_in_equations(T6), work-energy atomics(T13), EVERY accumulated quantity (universal); absorbs math-tool `calculus_integration_basics`] | MT-G4; teaching-unit; **cognitive_error_target:** "integration & differentiation unrelated" |
| ↳ area_under_curve_nano | The integral as the limit of summed rectangles (Riemann sum) → exact area. For a v-t graph the area IS the displacement; for an F-x graph the area IS the work. Area carries physical meaning. | nano | ✅ | — | [integral_as_area_and_accumulation_atomic] | — | parent; MT-G4 geometric scaffold |
| ↳ fundamental_theorem_link_nano | Integration UNDOES differentiation: if v = dx/dt then x = ∫v dt + x₀. The derivative gives the rate; the integral accumulates it back. **The two operations are inverses** — the deepest conceptual point of T3. | nano | ✅ | — | [integral_as_area_and_accumulation_atomic, derivative_as_rate_and_slope_atomic] | — | parent; MT-G4 cognitive scaffold |
| ↳ integral_in_physics_nano | The recurring physics integrals: displacement = ∫v dt (odometer accumulates this), work = ∫F·dx, charge = ∫I dt, impulse = ∫F dt, ISRO trajectory = numerically-integrated acceleration. | nano | ✅ | — | [integral_as_area_and_accumulation_atomic] | — | parent; **everyday-instrument (odometer) + space anchor** |
| **functions_and_graphs_in_physics_atomic** | The 5 canonical physics function-shapes and how to READ them: **linear** (y = mx + c — slope m + intercept c), **quadratic** (parabola — e.g. projectile y vs x), **inverse** (1/x — e.g. Coulomb, Boyle), **sinusoidal** (A sin(ωt + φ) — SHM, waves, AC), **exponential** (e^(±t/τ) — decay/growth). Extract physics from slope, intercept, area, and curvature. | atomic | ✅ | — | [si_units_and_unit_consistency_atomic(T2)] | [derivative_as_rate_and_slope_atomic, integral_as_area_and_accumulation_atomic, xt_graph+vt_graph+at_graph(T6)] | MT-G5; **cognitive_error_target:** "graph is just a picture" |
| ↳ slope_and_intercept_reading_nano | From a straight-line graph: slope = Δy/Δx (with composite units, e.g. v-t slope is m/s² = acceleration); intercept = value at x = 0 (physical initial condition). Reading physics OFF the line. | nano | ✅ | — | [functions_and_graphs_in_physics_atomic] | — | parent; MT-G5 scaffold |
| ↳ common_physics_function_shapes_nano | The 5 shapes mapped to physics: linear (uniform motion), parabola (projectile/accelerated), 1/x (inverse-square fields, Boyle), sine (oscillation/wave), exponential (RC/radioactivity). Recognising the shape names the physics. | nano | ✅ | — | [functions_and_graphs_in_physics_atomic] | — | parent; the 5-shape catalogue |
| ↳ linearising_graphs_nano | Convert a curved relation to a straight line to extract constants: plot T² vs l (not T vs l) for a pendulum → slope gives g; log-log plots for power laws. **The core Indian-physics-lab data-analysis skill.** | nano | ✅ | — | [functions_and_graphs_in_physics_atomic, slope_and_intercept_reading_nano] | — | parent; **education/lab anchor** |
| **approximations_in_physics_atomic** | **Controlled** approximations that extract leading behaviour: **small-angle** (sin θ ≈ tan θ ≈ θ, cos θ ≈ 1 for θ ≪ 1 rad) and **binomial** ((1 + x)ⁿ ≈ 1 + nx for x ≪ 1). The WHY (keep the dominant term, drop negligible ones) and the validity boundary (~0.1 rad ≈ 6° for ~1% error). Physics is BUILT on these (SHM, paraxial optics, g at small height). | atomic | ✅ | — | [functions_and_graphs_in_physics_atomic] | [shm_atomics(T17), paraxial_optics(T41/T42), g_at_height(T16); absorbs math-tool `trig_small_angle_approximations`+`series_binomial_expansion`] | MT-G6; teaching-unit; **cognitive_error_target:** "approximations are sloppy / less correct" |
| ↳ small_angle_approximation_nano | For θ ≪ 1 rad: sin θ ≈ θ, tan θ ≈ θ, cos θ ≈ 1 − θ²/2 ≈ 1. Validity ~0.1 rad (≈ 6°) for ~1% accuracy. The reason the pendulum is SHM ONLY for small swings. **Must use radians.** | nano | ✅ | — | [approximations_in_physics_atomic] | — | parent; MT-G6 scaffold; links to T2 radian-dimensionlessness |
| ↳ binomial_first_order_nano | (1 + x)ⁿ ≈ 1 + nx for x ≪ 1 (any real n). Used for g(h) = g(1 + h/R)⁻² ≈ g(1 − 2h/R) at small height; relativistic + index-of-refraction expansions. Keep the leading correction, drop x². | nano | ✅ | — | [approximations_in_physics_atomic] | — | parent; the controlled-expansion workhorse |

**Atomic count:** 4. **Nano count:** 11. **Total entries:** 15.

---

## Section C — Cross-Source Coverage Matrix

| Atomic | NCERT (delegated) | HCV V1 Ch.2 | DCM M1 Ch.5 | Coverage |
|---|---|---|---|---|
| derivative_as_rate_and_slope_atomic | Math Ch.13 (formal) | §2.9-2.11 | §5.4 | TRIPLE (via Math syllabus) |
| integral_as_area_and_accumulation_atomic | Math Ch.7 (formal, Class 12) | §2.12-2.13 | §5.5 | TRIPLE (via Math syllabus) |
| functions_and_graphs_in_physics_atomic | Physics Ch.3 (embedded, partial) | §2.7-2.8 | §5.2-5.3 | DUAL-dominant (NCERT-Physics partial via motion-graphs) |
| approximations_in_physics_atomic | used, not taught | §2.14 | §5.6 | DUAL (HCV+DCM only as a taught discipline) |

**Triple-coverage rate: ~50% (2 of 4 atomics formally triple via the Math syllabus; 2 of 4 are HCV+DCM-dominant physics-pedagogy).** **Coverage class: NCERT-DELEGATED.** This BREAKS the 100% streak (which T2 had extended to 2) — back to 0. **Crucial distinction from T8's break:** T8 broke at 80% because NCERT OMITS a JEE-Advanced extension (incline-projectile); T3 "breaks" because NCERT DELEGATES the entire topic to the Math syllabus and embeds graph-reading in motion. **Two different mechanisms depress triple-coverage** — OMISSION (advanced extensions) vs DELEGATION (foundation lives in another subject). T3 is the canonical NCERT-DELEGATED case and the cleanest evidence for WHY the Stage-3 math-tools file is a separate reference.

---

## Section D — Stage-3 Math-Tool Dependencies

T3 is the **human-facing companion** to `stage-3-math-tools.md`. Rather than CITING math-tool primitives, T3's atomics ARE the student-facing teaching homes for several of them:

| Math-tool primitive | Relationship to T3 | Status |
|---|---|---|
| `calculus_derivative_basics` | **OWNED (teaching home) → T3 `derivative_as_rate_and_slope_atomic`** | ABSORBED (MT-G8) |
| `calculus_integration_basics` | **OWNED → T3 `integral_as_area_and_accumulation_atomic`** | ABSORBED (MT-G8) |
| `trig_small_angle_approximations` | **OWNED → T3 `approximations_in_physics_atomic`** | ABSORBED (MT-G8) |
| `series_binomial_expansion_and_approximation` | **OWNED → T3 `approximations_in_physics_atomic`** | ABSORBED (MT-G8) |
| `calculus_minmax` | used in functions_and_graphs (extrema) | REQUIRED (existing) |
| (vectors: `vector_addition`/`dot`/`cross`) | **DEFERRED to T5** (MT-G2) — NOT owned by T3 | n/a |

**ZERO new stubs registered.** T3 **ABSORBS** 4 teaching-unit math-tool primitives as a DAG-root (their student-facing home), exactly as T2 absorbed dimensional_analysis/unit_analysis and T5 owns the vector primitives. The math-tools FILE remains the internal terminator registry. Math-tools IN-degree HELD at **52**; flag Stage-4 to reconcile teaching-unit ownership across T2/T3/T5. **Light-maintenance mode continues 8 consecutive sessions** (S50 → S57) — **all of T2 + T3 added ZERO new stubs.**

---

## Section E — Cross-Topic Dependencies (Bidirectional Edges)

### Outgoing (T3 requires from earlier topics)

T3 is a **DAG-ROOT** — like T2, it requires almost nothing from physics:

| Target topic | Edge | Reason |
|---|---|---|
| **T2 Units & Measurements (intra-session)** | functions/graphs → T2 (axis units); approximations ↔ T2 (sig-figs); derivative ← T2 (error differentials) | **Intra-session bidirectional** (4 edges; foundation-intro straggler-pair) |
| **T5 Vectors (deferral, not dependency)** | vectors DEFERRED to T5 — T3 explicitly does NOT teach them | MT-G2 (a boundary, recorded as a non-edge note, not a prereq) |
| Math-tools | calculus_minmax (existing); ABSORBS derivative/integral/small-angle/binomial teaching-units | Zero new stubs; 4 absorbed |

### Incoming (T3 is required by — effectively UNIVERSAL)

| Source topic | Edge | Reason |
|---|---|---|
| **~10 prior pilots (back-edges, ABSORBED)** | T6/T8/T9 (derivative+kinematic-equations), T13 (∫F·dx work), T16 (g(h) binomial), T17 (small-angle SHM), T21/T19 (calculus wave), T41/T42 (paraxial small-angle), T44 (binomial path-diff) ← T3 | **RESOLVES** the calculus + small-angle + binomial teaching-unit terminators into their student-facing T3 home |
| **EVERY calculus-bearing / approximation-bearing atomic (implicit, universal)** | rate/area/slope/expansion machinery | Recorded as absorbed explicit references only (keeps matrix sparse) |

### T2 ↔ T3 intra-session bidirectional edges (4 edges — enumerated in T2 §E)

(See T2 catalog §E for the full enumeration of the 4 bidirectional edges: error→derivative, dim-analysis↔functions, functions→units, sig-figs↔approximations.)

**Total outgoing: 4 intra-session (with T2) + calculus_minmax (existing) + 4 absorbed teaching-unit terminators.**
**Total incoming: ~10 absorbed back-edge references (DAG-root) + universal implicit.**

**T3 is the lowest node in the dependency DAG** alongside T2 + T5 — see Part C "DAG-root" capstone observation.

---

## Section F — Real-World Anchors (MEDIUM, Indian-context)

| Anchor | Concept hook | Authoring use | Strand |
|---|---|---|---|
| **Speedometer (the derivative you read every day)** | derivative_as_rate_and_slope_atomic, derivative_in_physics_nano | "A car's speedometer displays v = dx/dt in real time — the derivative of position. The clearest everyday derivative." | Everyday-instrument |
| **Odometer (the integral you read every day)** | integral_as_area_and_accumulation_atomic, integral_in_physics_nano | "A car's odometer accumulates total distance = ∫v dt — the integral of speed. Speedometer and odometer ARE derivative and integral of each other (FTC)." | Everyday-instrument |
| **ISRO trajectory integration (orbit prediction)** | integral_as_area_and_accumulation_atomic | "ISRO numerically integrates acceleration → velocity → position to predict a launch trajectory; the integral accumulates the motion" | Space |
| **Radioactive dating + RC discharge (the exponential function)** | functions_and_graphs_in_physics_atomic, common_physics_function_shapes_nano | "Carbon-dating and a discharging capacitor both follow e^(−t/τ); recognising the exponential shape names the physics" | Nuclear/decay |
| **Pendulum T² vs l graph-linearisation (physics-lab skill)** | functions_and_graphs_in_physics_atomic, linearising_graphs_nano | "Plot T² against l (a straight line) instead of T against l (a curve) → the slope gives g. The core lab data-analysis skill" | Education/lab |
| **Small-angle pendulum + paraxial lens (the approximation that makes physics solvable)** | approximations_in_physics_atomic, small_angle_approximation_nano | "A pendulum is SHM ONLY for small swings (sin θ ≈ θ); a lens images sharply ONLY near the axis (paraxial) — both are the small-angle approximation" | Education/lab |

**Total: 6 distinct anchors across 4 strands** (everyday-instrument, space, nuclear/decay, education/lab). **Decision (MT-G9): MEDIUM** — falls well short of the STRONG threshold (≥8 anchors AND ≥5 strands). Math tools are inherently ABSTRACT; they anchor ONLY through their applications. The speedometer/odometer pair is the topic's strongest anchor (genuinely vivid — derivative and integral you read on every drive). **2nd MEDIUM topic** (joins T34 Current Electricity); together with T31 (WEAK) this confirms the **abstract-foundation-anchors-weakly** pattern: topics whose CONTENT is mathematical machinery or abstract circuit elements cannot reach the phenomenology-rich anchoring of mechanics/waves/thermal topics.

---

## Section G — Cognitive-Error-Prevention Decisions

**4 of 9 founder decisions are cognitive-error-prevention type = 44%.** T3 is misconception-rich for a distinctive reason: students arrive FEARING calculus and treat it PROCEDURALLY (memorise the rules) rather than CONCEPTUALLY (slope / area / rate / inverse-operations). The procedural-vs-conceptual gap is the topic's defining cognitive challenge.

| Tag | cognitive_error_target | Countermeasure |
|---|---|---|
| **MT-G3** | "the derivative is just a formula to memorise" | Mandatory slope-of-tangent + rate animation BEFORE the derivatives table; the formula is downstream of the meaning |
| **MT-G4** | "integration and differentiation are unrelated operations" | Mandatory Fundamental-Theorem link: integration UNDOES differentiation (speedometer ↔ odometer); area accumulates what slope measures |
| **MT-G5** | "the graph is just a picture of the data" | Mandatory slope-AND-area framing: a v-t graph's slope = acceleration, its area = displacement; the graph carries two physics quantities |
| **MT-G6** | "approximations are sloppy / less correct" | Mandatory validity-boundary framing: approximations are CONTROLLED (known error range); physics is built on them (SHM, paraxial optics, g(h)) |

**T3 cognitive-error share: 44% (4/9).** **Combined Session 57 cognitive-error share (T2 + T3): T2 = 45% (5/11) + T3 = 44% (4/9) = 9 of 20 = 45%.** The NCERT-intro straggler-pair sustains the foundation-topic high band (Kinematics cluster 48.5%, T2+T3 45%) — confirming that the FOUNDATION topics (units, math-tools, kinematics) carry the densest misconception loads precisely because they set the silent conventions and mental models everything else rests on.

---

## Section H — V1 Priority Flags

| Atomic | V1? | Reason |
|---|---|---|
| derivative_as_rate_and_slope_atomic | ✅ | Teaching-unit; the slope/rate meaning unblocks ALL of kinematics + every rate-defined quantity; speedometer anchor; highest-leverage |
| integral_as_area_and_accumulation_atomic | ✅ | Teaching-unit; area/accumulation unblocks work-energy + s-from-v; odometer anchor; the FTC inverse-link is a key aha |
| approximations_in_physics_atomic | ✅ | Teaching-unit; small-angle unblocks SHM + paraxial optics; binomial unblocks g(h); cited by 10+ atomics |
| functions_and_graphs_in_physics_atomic | ⚖️ | V1.1; graph-reading is partly taught inside T6 motion-graphs already; the linearising-graphs lab skill is the V1-worthy fragment |

**V1 ship count for T3: 3 atomics.** Combined Session 57 V1 ship: T2 = 3 + T3 = 3 = **6 atomics across 2 topics**. NCERT-intro straggler-pair cumulative: 6 atomics (all foundation-layer).

---

## Section I — Open Questions

1. **Teaching-unit ownership reconciliation** — T3 ABSORBS calculus_derivative/integration + small-angle + binomial as student-facing teaching homes (MT-G8); T2 absorbs dimensional_analysis/unit_analysis; T5 owns the vector primitives. **Stage-4 final sweep should formally map every math-tools teaching-unit to its owning physics-foundation topic (T2/T3/T5)** and recompute the math-tools IN-degree after re-homing.
2. **Is "functions_and_graphs" double-taught** (here + inside T6 motion-graphs)? Decision: T6 teaches the SPECIFIC x-t/v-t/a-t motion graphs; T3 teaches the GENERAL skill (the 5 shapes + linearisation). Slight overlap is acceptable — T3 is the general tool, T6 the kinematics application. Flag if student data shows redundancy.
3. **Should T3 atomics become real concept JSONs** in `src/data/concepts/` with their own EPIC-L paths (per Stage-3 Open-Question #2)? Strong case for derivative + integral + small-angle as standalone "math-for-physics" sims that ALL topics prerequisite-link to. Defer to V1 priority-queue (Stage-5).
4. **NCERT-DELEGATED as a formal coverage class** — T3 is the first clean case. Stage-4 should add NCERT-DELEGATED to the coverage taxonomy (alongside TRIPLE / NCERT-OMITTED / DUAL) so the distinction OMISSION-vs-DELEGATION is captured systematically.
5. **NCERT-intro straggler check** — **T2 + T3 DONE (Session 57). Stage-2 at 42/44 = 95%.** Remaining: T1 Physical World + 1 final straggler (Session 58) = **Stage-2 COMPLETE**, then the 44-pilot Stage-4 final consolidation sweep + Stage-5 transition.

---

## Section J — Sign-Off

- Authored: Session 57, 2026-05-26.
- Author: Claude (Architect+Engineer role).
- Coverage class: **NCERT-DELEGATED** (NEW class — NCERT delegates math-tools to the Math syllabus; ~50% formal triple-coverage).
- Anchor density: **MEDIUM** (6 anchors × 4 strands — 2nd MEDIUM topic; confirms abstract-foundation-anchors-weakly).
- Triple-coverage rate: **~50%** (2/4 via Math syllabus; 2/4 HCV+DCM-dominant) — **BREAKS the 100% streak at 2** (mechanism = DELEGATION, distinct from T8's OMISSION).
- Atomic count: **4**. Nano count: **11**. Total: **15 entries**.
- V1 ship count: **3 atomics**.
- **DAG-ROOT node**: absorbs `calculus_derivative_basics` + `calculus_integration_basics` + `trig_small_angle_approximations` + `series_binomial_expansion` teaching-unit terminators (~10 prior-pilot references). **Vectors DEFERRED to T5** (no overlap).
- **0 new math-tools stubs. Light-maintenance NEW LONGEST streak at 8 consecutive sessions.** 4 teaching-units ABSORBED (re-homing flagged for Stage-4).
- Cognitive-error-prevention founder-decision share: **44%** (4/9). **Combined Session 57 = 45% (9/20).**
- **Stage-2 at 42/44 = 95% after T3.**
- Next: Session 58 — T1 Physical World + 1 final straggler = **Stage-2 COMPLETE** → trigger 44-pilot Stage-4 final consolidation sweep → Stage-5 transition.

---

*42nd pilot; the human-facing companion to the Stage-3 math-tools file. NCERT-DELEGATED (NEW coverage class — distinct from NCERT-OMITTED). MEDIUM anchor (2nd MEDIUM topic; abstract foundations anchor weakly). T3 is a DAG-ROOT — it absorbs the calculus + small-angle + binomial teaching-unit terminators ~10 prior pilots silently depended on, and DEFERS vectors to T5. 44% cognitive-error share. 8 consecutive math-tools light-maintenance sessions; T2 + T3 both zero-stub. Stage-2 at 95% — one session from complete.*
