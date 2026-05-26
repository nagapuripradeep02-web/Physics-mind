# Stage-3 Math-Tools Reference

> **Purpose:** Canonical reference for every math primitive cited as a terminator from a Stage-2 catalog. Each Stage-2 catalog's "Math-tools refs" row terminates here instead of dangling. When a new catalog ships, it cites the entry ID in this file; if a needed primitive doesn't exist yet, add it here AND flag for the founder.
>
> **Scope:** Class 9–12 CBSE Math + first-year-engineering supplements. Anything beyond engineering-math-undergrad (e.g., group theory, tensor calculus) is out of scope — physics that needs it gets remarked as "advanced math; treat formula as black box."
>
> **Status:** Stage-3 deliverable, initial draft 2026-05-25 after 15 Stage-2 pilots (matrix math-tools IN-degree = 23 at this point). Author: Claude. Founder gate: Pradeep.

---

## How this file is structured

- **Section A** — Primitive entries grouped by family. Each entry has a compact 5-row card: definition / source-of-prior-learning / physics-usage / teaching-unit-flag / common-error.
- **Section B** — Prerequisite DAG between math primitives themselves (vectors before cross-product, derivatives before integrals, etc.).
- **Section C** — Teaching-unit-vs-reference classification rule + per-primitive verdict.
- **Section D** — Cross-catalogue dependency table (which atomics in which topics terminate at which math primitive).
- **Section E** — Anticipated primitives that haven't been cited yet but Stage-2 will likely need (pre-stubbed for forward compatibility).
- **Section F** — Open questions / Stage-4 review items.

---

## Section A — Primitive entries

### A.1 Algebra primitives

#### `algebra_one_over_x_manipulation`
- **Definition:** Manipulating equations of the form 1/v − 1/u = 1/f; rearrangement, common-denominator simplification, when sign-flips cancel vs add.
- **Where students learned it:** Class 9 NCERT Math Ch.4 (Linear Equations) — but only the basic form. The 1/v - 1/u variant is *physics-specific* and most students first see it here.
- **Physics usage:** T42 A11 `thin_lens_formula`, T42 A6 `mirror_equation` (cross-cluster reuse from T41 A6), all lens-combination atomics.
- **Teaching-unit flag:** ⚠️ **Recommended teaching unit** — students consistently miscompute when u or v is negative, especially in lens combinations.
- **Common error:** Treating 1/v − 1/u as 1/(v−u) — a classic sign-and-grouping error.

#### `algebra_linear_simultaneous_equations`
- **Definition:** Solving 2-loop and 3-loop linear systems via substitution / elimination / determinants. Matrix methods optional.
- **Where students learned it:** Class 10 NCERT Math Ch.3 (Pair of Linear Equations in Two Variables) — 2-variable solid; 3-variable starts in Class 11 (Math Ch.10 inequalities, then determinants in Class 12).
- **Physics usage:** T34 A17/A19/A20 Kirchhoff's-law multi-loop circuits; T17 coupled-spring SHM (anticipated).
- **Teaching-unit flag:** ❌ Reference only — students learn it solidly in Class 10–12 Math. Just cite.
- **Common error:** Sign of EMF / current direction; not a math error but a physics convention error inherited at this stage.

#### `algebra_chain_product_rule`
- **Definition:** When n = n₁ × n₂ × n₃ (refractive indices chained across multiple interfaces), the operational rule is multiplicative chaining; arithmetic combines via successive Snell's-law applications.
- **Where students learned it:** Class 8–10 Math (basic multiplication chains). The physics-specific framing (chaining refractive indices across slab boundaries) is fresh.
- **Physics usage:** T42 A1 `refractive_index_definition` (chain), T42 A4 `lateral_shift_through_slab`, T44 `refraction_wave_theory_snells_law` (multi-medium derivation).
- **Teaching-unit flag:** ❌ Reference only.
- **Common error:** Adding rather than multiplying refractive indices; or applying it where Snell's law doesn't chain (curved surfaces).

---

### A.2 Calculus primitives

#### `calculus_derivative_basics`
- **Definition:** d/dx, d/dt, dω/dt, dθ/dt — standard derivatives of polynomials, sin/cos/exp, chain rule, product rule.
- **Where students learned it:** Class 11 NCERT Math Ch.13 (Limits and Derivatives) + Class 12 Math Ch.5 (Continuity and Differentiability).
- **Physics usage:** T6 Kinematics (v = dx/dt, a = dv/dt); T10 Circular Motion A2/A3/A5 (dω/dt); T17 SHM (ẍ = −ω²x); virtually every atomic with motion.
- **Teaching-unit flag:** ❌ Reference only — universally taught in Class 11 Math, BEFORE any physics atomic needs it.
- **Common error:** Sign convention when differentiating displacement vs distance; treating |v| = dx/dt instead of dx/dt being signed.

#### `calculus_integration_basics`
- **Definition:** ∫f(x) dx, definite integral as area, substitution method, integration by parts. Specific physics-recurrent integrals: ∫x dx, ∫1/x dx, ∫sin/cos dx, ∫e^(-x) dx, ∫dx/(a² + x²).
- **Where students learned it:** Class 12 NCERT Math Ch.7 (Integrals) — comprehensive.
- **Physics usage:** T13 A2/A12/A30 work-energy theorem (∫F·dr); T16 Cavendish derivation; T31 capacitor energy (∫dW = ∫(q/C)dq); T17 SHM energy; T36 line integrals.
- **Teaching-unit flag:** ❌ Reference only.
- **Common error:** Forgetting limits of integration when computing work; sign of dr in vector integrals.

#### `calculus_minmax`
- **Definition:** dy/dx = 0 to find extrema; second-derivative test for max vs min; constrained optimization (with Lagrange multipliers — deferred to advanced).
- **Where students learned it:** Class 12 NCERT Math Ch.6 (Application of Derivatives).
- **Physics usage:** T12 N22.3 friction `minimize_F_over_theta`; T42 A20 `minimum_deviation_prism` (dD/di = 0); T44 single-slit `central_max_double_width` (envelope maxima).
- **Teaching-unit flag:** ❌ Reference only (math) but ⚠️ **physics framing teaches it** — finding optimal angle in friction is a sleeper-success atomic in T12.
- **Common error:** Forgetting to check that the extremum is a maximum (not minimum) for the physical problem at hand.

#### `calculus_partial_derivative`
- **Definition:** ∂/∂x at fixed t, and ∂/∂t at fixed x; for the wave equation ∂²y/∂t² = v²·∂²y/∂x²; gradient operator ∇ = (∂/∂x, ∂/∂y, ∂/∂z).
- **Where students learned it:** **NOT in CBSE Class 11–12 Math.** This is **first-year-engineering** content. CBSE students see ∂ symbol in physics first (Class 12 Electrostatics E = −∂V/∂x).
- **Physics usage:** T16 gravitation E = −∇V; T21 Wave Motion A6/A21/A23 wave equation; T17 SHM (the ω² = k/m derivation uses d²x/dt² which is total derivative, but the wave-equation extension uses partial).
- **Teaching-unit flag:** ✅ **REQUIRED teaching unit** — needs its own micro-explainer because students literally haven't seen the ∂ notation in math class yet.
- **Common error:** Not understanding that "at fixed t" means treating t as constant during the differentiation; confusing ∂V/∂x with dV/dx in 1D cases where they happen to be equal.

#### `calculus_for_focal_length_range`
- **Definition:** Using lens-equation algebra to derive f_max and f_min from {u_min, u_max, v_o}; bounding ranges via 1/u_min ≤ 1/v − 1/f ≤ 1/u_max.
- **Where students learned it:** No prior — physics-specific.
- **Physics usage:** T43 `accommodation_mechanism`, `myopia_correction`, `hyperopia_correction`, `presbyopia_age_related`.
- **Teaching-unit flag:** ❌ Subsumed by `algebra_one_over_x_manipulation` + `calculus_minmax`. Listed for completeness; will not be its own teaching unit.

#### `calculus_exponential_decay`
- **Definition:** y = y₀·e^(−t/τ); τ = time constant; half-life = τ·ln(2); the unique solution to dy/dt = −y/τ.
- **Where students learned it:** Class 11–12 Math touches e^x in Ch.13/Ch.5 derivatives. **The decay-form y = y₀e^(−t/τ) is physics-introduced** — Math doesn't motivate it.
- **Physics usage:** T34 A27 RC discharge (τ = RC); T44 LC damped oscillation (anticipated); T46 radioactivity (anticipated); T35 LR circuits (anticipated).
- **Teaching-unit flag:** ✅ **REQUIRED teaching unit** — recurring across 4+ topics; physics motivates the form; students need to see the ODE → solution path once.
- **Common error:** Misidentifying τ (taking it as the half-life instead of 1/e time); sign of exponent when current is "charging up" (1 − e^(−t/τ)) vs "decaying" (e^(−t/τ)).

#### `calculus_time_averaging_cos_squared`
- **Definition:** ⟨cos²(ωt)⟩ = 1/2 over one period; ⟨cos(ωt)·cos(ωt + φ)⟩ = (1/2)cos(φ); time-averaging operator ⟨·⟩.
- **Where students learned it:** No prior — physics-introduced via AC circuit RMS values (Class 12 Ch.7 Alternating Current).
- **Physics usage:** T44 `ydse_intensity_distribution` (incoherent ⟨I⟩ = 2I₀); T44 `malus_law_polariser_analyzer` (intensity through analyzer); T39 AC RMS (anticipated); T44 LC oscillator average energy (anticipated).
- **Teaching-unit flag:** ✅ **REQUIRED teaching unit** — first-time exposure for students; intuition that "rapid oscillation averages to half-the-peak" is non-obvious.
- **Common error:** Confusing ⟨cos²⟩ = 1/2 with ⟨cos⟩ = 0; applying time-average where it doesn't apply (coherent sources don't get averaged).

---

### A.3 Geometry primitives

#### `geometry_similar_triangles`
- **Definition:** Two triangles with equal angles have proportional sides: a/A = b/B = c/C. Sufficient conditions: AA, SSS, SAS similarity.
- **Where students learned it:** Class 10 NCERT Math Ch.6 (Triangles) — solid foundation.
- **Physics usage:** T41 A6 `mirror_equation` derivation (image triangles ~ object triangles); T42 A11 `thin_lens_formula` derivation; T43 microscope/telescope ray diagrams.
- **Teaching-unit flag:** ❌ Reference only.
- **Common error:** Identifying the wrong similar pair; sign of ratios when one triangle is "inverted" (image below axis).

---

### A.4 Trigonometry + approximations

#### `trig_small_angle_approximations`
- **Definition:** For θ in radians and θ ≪ 1: sin θ ≈ θ, tan θ ≈ θ, cos θ ≈ 1 − θ²/2 ≈ 1. **Validity boundary:** ~0.1 rad ≈ 5.7° for ~1% accuracy.
- **Where students learned it:** Class 11 NCERT Math Ch.3 (Trigonometric Functions) introduces but doesn't emphasize the approximations.
- **Physics usage:** T17 SHM pendulum (sin θ ≈ θ); T41 A13 paraxial mirror; T42 paraxial lens; T43 ALL telescope/microscope formulas; T44 single-slit diffraction (sin θ ≈ aθ).
- **Teaching-unit flag:** ✅ **REQUIRED teaching unit** — most-cited math primitive across physics (8+ atomics across 4 clusters). Needs its own micro-explainer with the validity-boundary insight.
- **Common error:** Applying it outside validity (large angles); using degree-form when formula needs radians.

#### `trig_identities_for_min_deviation`
- **Definition:** Specific trig identities for prism: A = r₁ + r₂; (D + A)/2 = i₁ = i₂ at min-deviation; sin((A+D_min)/2) / sin(A/2) = n.
- **Where students learned it:** Trig identities (sin(A±B), product-to-sum) in Class 11 Math Ch.3. Application to prism is physics-specific.
- **Physics usage:** T42 A20 `minimum_deviation` (the formula above); A22 dispersion uses same; A24 rainbow uses similar.
- **Teaching-unit flag:** ❌ Subsumed by physics atomic T42 A20 — the math primitive itself is just standard trig.

#### `trig_dot_and_cross_geometric_meaning`
- **Definition:** **A**·**B** = |A||B|cos θ; **A**×**B** has magnitude |A||B|sin θ and direction by right-hand rule.
- **Where students learned it:** Class 11 NCERT Math doesn't introduce vector products properly until Class 12 Math Ch.10 (Vector Algebra). **Physics introduces them first** (NCERT 11.1 Ch.4 Vectors).
- **Physics usage:** All vector physics — T5, T13 (work W = F·d), T36 (Lorentz force F = qv × B), T36 (Ampere's law line integral).
- **Teaching-unit flag:** ✅ **REQUIRED teaching unit** — see also `vector_dot_product` and `vector_cross_product` in A.5.
- **Common error:** Forgetting that A·B = 0 means perpendicular (not "zero"); right-hand-rule confusion for cross product.

---

### A.5 Vector primitives

#### `vector_addition`
- **Definition:** Vector sum by triangle/parallelogram law; component form (a_x + b_x, a_y + b_y); commutative + associative.
- **Where students learned it:** Physics is the first place (NCERT 11.1 Ch.4 §4.4–4.6). Class 12 Math Ch.10 reinforces.
- **Physics usage:** T29 Coulomb superposition (vector form); T30 E-field superposition; all 2D mechanics.
- **Teaching-unit flag:** ❌ Reference only — but physics topic T5 Vectors IS the teaching ground for this. Cite T5 atomics, not this entry.
- **Common error:** Adding magnitudes |A| + |B| instead of vector sum; forgetting tail-to-head construction.

#### `vector_dot_product`
- **Definition:** **A**·**B** = a_xb_x + a_yb_y + a_zb_z = |A||B|cos θ. Scalar result.
- **Where students learned it:** T5 Vectors atomic `dot_product` is physics's teaching unit. Reinforced in Class 12 Math Ch.10.
- **Physics usage:** Work W = F·d (T13); flux ∫E·dA (T30); etc.
- **Teaching-unit flag:** ❌ Reference only — T5 owns the teaching.

#### `vector_cross_product`
- **Definition:** **A**×**B** with magnitude |A||B|sin θ; direction by right-hand rule; (**A**×**B**)_z = a_xb_y − a_yb_x.
- **Where students learned it:** Class 12 Math Ch.10 (Vector Algebra). Physics also re-teaches in T36.
- **Physics usage:** T36 A3/A4/A15/A20/A30 (Lorentz force, torque on dipole, magnetic moment); T7 torque; T10 angular momentum.
- **Teaching-unit flag:** ✅ **REQUIRED teaching unit** — right-hand rule consistently confuses students; needs its own animated explainer.
- **Common error:** Direction confusion (left-hand vs right-hand); commutation error (A×B ≠ B×A, but students treat it as commutative).

#### `vector_line_integral`
- **Definition:** ∮F·dl around a closed loop; ∫F·dr along a path; physical meaning = work done OR magnetic-field-circulation.
- **Where students learned it:** No prior in CBSE Math — **physics introduces** in T13 work-energy and reinforces in T36 Ampere's law.
- **Physics usage:** T13 work along curved path; T36 A26 Ampere's law ∮B·dl = μ₀I_enc.
- **Teaching-unit flag:** ✅ **REQUIRED teaching unit** — abstract concept; students don't intuit "circulation" without animation.
- **Common error:** Sign of dl direction in closed loop; treating the loop integral as path-independent (it is only for conservative fields, which B is not — student error).

---

### A.6 Series + expansions

#### `series_binomial_expansion_and_approximation`
- **Definition:** (1 + x)^n ≈ 1 + nx + n(n−1)x²/2 + ... ; for x ≪ 1, first-order: (1 + x)^n ≈ 1 + nx. The √(a² + b²) ≈ a + b²/2a form for b ≪ a.
- **Where students learned it:** Class 11 NCERT Math Ch.7 (Binomial Theorem) — pure form. The "approximation for small x" framing is physics-introduced.
- **Physics usage:** T16 gravitation g(h) at small height; T44 YDSE path-difference Δx ≈ xd/D (the (S₂P)² − (S₁P)² = 2xd manipulation uses this); T17 SHM Taylor of restoring force around equilibrium.
- **Teaching-unit flag:** ✅ **REQUIRED teaching unit** — the "small-quantity expansion" intuition is fundamental but Math doesn't develop it operationally.
- **Common error:** Keeping too few terms when accuracy matters; applying to large x where convergence fails.

---

### A.7 Statistical + averaging

(See `calculus_time_averaging_cos_squared` in A.2 — currently the only entry here; more will be added in AC circuits and statistical mechanics topics.)

---

## Section B — Prerequisite ordering among math primitives

Math primitives have their own DAG. Authoring sequence should respect this:

```
algebra_one_over_x_manipulation  (Class 10)
algebra_linear_simultaneous_equations  (Class 10)
geometry_similar_triangles  (Class 10)
algebra_chain_product_rule  (Class 8)
       ↓
trig_small_angle_approximations  (Class 11)
trig_dot_and_cross_geometric_meaning  (Class 11 Physics)
series_binomial_expansion_and_approximation  (Class 11 Math + Physics)
vector_addition  (Class 11 Physics)
       ↓
calculus_derivative_basics  (Class 11 Math)
       ↓
calculus_integration_basics  (Class 12 Math)
calculus_minmax  (Class 12 Math)
calculus_partial_derivative  (engineering Math — taught fresh)
       ↓
vector_dot_product  (Class 12 Math + Physics)
vector_cross_product  (Class 12 Math + Physics)
vector_line_integral  (engineering Math — taught fresh)
       ↓
calculus_exponential_decay  (physics-introduced ODE)
calculus_time_averaging_cos_squared  (physics-introduced)
trig_identities_for_min_deviation  (subsumed by atomic)
calculus_for_focal_length_range  (subsumed by atomic)
```

Authoring the **8 teaching-unit primitives** (✅ flagged above) FIRST, before any topic that depends on them, prevents cognitive-prereq failures during V1 simulation playback.

---

## Section C — Teaching-unit vs reference classification

**Rule:** A math primitive is a **teaching unit** if (a) it was first introduced in physics class, not math class, OR (b) the operational physics framing differs significantly from math-class framing, OR (c) it's cited by 5+ atomics across 2+ clusters (recurrence threshold).

**Verdict by primitive:**

| Primitive | Teaching unit? | Why |
|---|---|---|
| `algebra_one_over_x_manipulation` | ⚠️ Borderline | Math taught the form; physics-specific 1/v − 1/u manipulation is recurring error source |
| `algebra_linear_simultaneous_equations` | ❌ Reference | Solid Class 10 foundation |
| `algebra_chain_product_rule` | ❌ Reference | Trivial in math class |
| `calculus_derivative_basics` | ❌ Reference | Class 11 Math foundation |
| `calculus_integration_basics` | ❌ Reference | Class 12 Math foundation |
| `calculus_minmax` | ❌ Reference | Class 12 Math foundation |
| `calculus_partial_derivative` | ✅ **Yes** | Not in CBSE Math; physics-introduced; recurrence 3+ topics |
| `calculus_exponential_decay` | ✅ **Yes** | Physics-introduced; recurrence 4+ topics |
| `calculus_time_averaging_cos_squared` | ✅ **Yes** | Physics-introduced; non-obvious intuition |
| `geometry_similar_triangles` | ❌ Reference | Class 10 foundation |
| `trig_small_angle_approximations` | ✅ **Yes** | Highest recurrence (8+ atomics, 4 clusters); validity boundary needs explicit teaching |
| `trig_dot_and_cross_geometric_meaning` | ✅ **Yes** | Owned by T5 + T36 atomics — counts as taught when those ship |
| `vector_addition` | ❌ Reference | T5 owns it |
| `vector_dot_product` | ❌ Reference | T5 owns it |
| `vector_cross_product` | ✅ **Yes** | T36 partly owns; right-hand-rule needs animation |
| `vector_line_integral` | ✅ **Yes** | Not in CBSE Math; abstract circulation concept |
| `series_binomial_expansion_and_approximation` | ✅ **Yes** | Physics-introduced operational framing; recurrence 3+ topics |
| `trig_identities_for_min_deviation` | ❌ Reference | Subsumed by T42 A20 |
| `calculus_for_focal_length_range` | ❌ Reference | Subsumed by T43 atomics |

**8 teaching-unit math primitives** (✅) must be authored as their own micro-atomics in the V1 priority queue. The remaining 11 are pure reference (✗ / borderline) and just cite math-class.

---

## Section D — Cross-catalogue dependency table

| Math primitive | Atomics depending on it (by topic) | IN-degree |
|---|---|---|
| `algebra_one_over_x_manipulation` | T42 A11, T42 A6 (via T41), T43 (microscope/telescope formulas) | 4+ |
| `algebra_linear_simultaneous_equations` | T34 A17, A19, A20 | 3 |
| `algebra_chain_product_rule` | T42 A1, T42 A4, T44 refraction-wave derivation | 3 |
| `calculus_derivative_basics` | T6, T10 A2/A3/A5, T17 (universal motion atomics) | 8+ |
| `calculus_integration_basics` | T13 A2/A12/A30, T16 Cavendish, T31 capacitor energy, T17 SHM energy | 6+ |
| `calculus_minmax` | T12 N22.3, T42 A20, T44 single-slit envelope | 3 |
| `calculus_partial_derivative` | T16 E = −∇V, T21 A6/A21/A23 wave eq, T30 E-field gradient | 4+ |
| `calculus_exponential_decay` | T34 A27 RC | 1 (will rise — anticipates T35, T44 LC, T46) |
| `calculus_time_averaging_cos_squared` | T44 A13 intensity, T44 Malus | 2 (will rise — AC circuits, LC) |
| `geometry_similar_triangles` | T41 A6, T42 A11 | 2 |
| `trig_small_angle_approximations` | T17 pendulum, T41 A13, T42 paraxial, T43 telescope/microscope, T44 diffraction | 8+ |
| `trig_dot_and_cross_geometric_meaning` | All vector-physics atomics | universal |
| `vector_addition` | T29 Coulomb, T30 E-field, all 2D mechanics | 6+ |
| `vector_dot_product` | T13 work, T30 flux | 3+ |
| `vector_cross_product` | T36 A3/A4/A15/A20/A30, T7 torque, T10 angular momentum | 6+ |
| `vector_line_integral` | T13 work along curved path, T36 A26 Ampere | 2 |
| `series_binomial_expansion_and_approximation` | T16 g(h), T44 YDSE path-diff, T17 SHM Taylor | 3 |

**Total math-tools IN-degree at 15 pilots: 23** (matches matrix Sub-matrix B column total of 23).

---

## Section E — Anticipated primitives (Stage-2-remaining pre-stubs)

Primitives that haven't been cited yet but Stage-2 will likely need:

| Stub primitive | Anticipated topic | When added |
|---|---|---|
| `complex_numbers_phasor` | T39 AC Circuits | When T39 catalog ships |
| `logarithms` | T18 Thermodynamics (Carnot, entropy), T17 SHM (decibels), T46 radioactivity | Multiple topics |
| `second_order_ODE` | T44 LC Oscillator (anticipated as T44 in older numbering = LC; current T44 is wave optics — see numbering reconciliation flag) | LC catalog |
| `determinants_for_kirchhoff` | T34 alternative method | Optional — currently subsumed by `algebra_linear_simultaneous_equations` |
| `limits_definition_of_derivative` | T17 first-principles derivation | When needed |
| `taylor_expansion_around_equilibrium` | T17 SHM, T16 gravitation, T18 thermodynamics | Generalization of binomial |
| `divergence_curl_advanced` | T44 LC Oscillator, T38 EM Induction (Maxwell's equations) | Engineering math |
| `integration_by_parts` | T13 ∫F·dr edge cases | Subsumed by `calculus_integration_basics` |
| `dimensional_analysis` | Already cited in early pilots — should consolidate as A.8 primitive | Add now if needed |

**Action: 8 stubs identified. Will become full entries as Stage-2 catalogs surface them.**

---

## Section F — Open questions / Stage-4 review items

1. **Should "math-class" reference primitives be merged into a single "Class 9–12 CBSE Math foundations" reference, instead of itemizing each?** Pro: cleaner file. Con: loses fine-grained IN-degree analytics. Stage-4 to decide.

2. **Should physics-introduced teaching-unit primitives be promoted to their OWN atomic-or-nano in the concept JSON registry?** E.g., `partial_derivative` becomes a real concept JSON in `src/data/concepts/` with its own EPIC-L path? This would make math-tools first-class citizens in the physics curriculum. Strong case for `calculus_exponential_decay` + `time_averaging_cos_squared` + `small_angle_approximations` because they're physics-motivated.

3. **Does the teaching-unit-vs-reference split match real student knowledge gaps?** Hypothesis testable in Stage-6 student-psychology layer: if students consistently fail atomics that depend on a math-tools "reference" primitive, that primitive should be reclassified as a teaching unit.

4. **NCERT Class 11/12 Math vs Class 10 Math splits** — am I correct in saying Class 10 students "know" similar triangles but Class 9 students don't? Pedagogically, this affects V1 priority sequencing for Class-10-targeted atomics (which currently are minimal — most atomics target Class 11–12 students).

5. **JEE/NEET math-tools subset** — the JEE-Advanced syllabus includes things like calculus_partial_derivative and series_taylor_expansion as Math; the JEE-Mains + NEET syllabi often do not. Stage-5 priority queue should differentiate.

6. **Visualization of math-tools graph** — Stage-7 strategy synthesis doc would benefit from a DAG image showing math primitives → physics atomics. Currently text-only.

---

## Section G — How catalogs cite this file

Going forward, replace `→ math-tools` terminator entries with specific primitive IDs:

```markdown
| Math-tools refs (2): similar_triangles, small_angle_tan_theta_approx | → | math-tools | math-tools | ... |
```

Becomes:

```markdown
| Math-tools refs (2): [`geometry_similar_triangles`](stage-3-math-tools.md#geometry_similar_triangles), [`trig_small_angle_approximations`](stage-3-math-tools.md#trig_small_angle_approximations) | → | math-tools | math-tools | ... |
```

Matrix Part A entries also link directly. Update-log records each new primitive added.

---

## Section H — Catalog Sign-off

- 19 primitive entries authored across 7 families (Algebra, Calculus, Geometry, Trig, Vector, Series, Statistical).
- 8 marked as ✅ **REQUIRED teaching units** (need their own V1 simulations): `calculus_partial_derivative`, `calculus_exponential_decay`, `calculus_time_averaging_cos_squared`, `trig_small_angle_approximations`, `trig_dot_and_cross_geometric_meaning`, `vector_cross_product`, `vector_line_integral`, `series_binomial_expansion_and_approximation`.
- 8 anticipated stubs pre-registered for upcoming Stage-2 topics.
- 6 open questions raised for Stage-4 review.
- Cross-references to all 15 current pilots updated in Section D.

**Status: STAGE-3 INITIAL DRAFT COMPLETE.** Founder review next. The CRITICAL BLOCKER flagged in Sessions 39, 40, and 41 is now RESOLVED for the 15-pilot perimeter; will need maintenance as new Stage-2 catalogs surface new primitives.
