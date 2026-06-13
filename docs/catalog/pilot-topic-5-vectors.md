# Pilot Topic 5 — Vectors (Vector Algebra & Scalars)

> **Retro-catalog, authored 2026-06-13 (Session 67); status corrected same day.** This page was
> reconstructed from 19 OLD-ARCHITECTURE vector sims that exist on disk in `src/data/concepts/` but are
> **NOT current product** — see the Build-status box below. T5 was the catalog's single largest
> hole: it carried **zero rows** yet is the most-referenced prerequisite in the whole catalog
> (`vector_resolution` is required by ~30 downstream concepts across T6/T7/T8/T11/T13/T36/T50). Creating
> it closes those dangling references. See `docs/CURRICULUM_ARCHITECTURE_PROPOSAL.md` §1 (data problem D1).
> Sources: **NCERT Class 11 Part 1 Ch.4 Motion in a Plane §4.2–4.5** (vector algebra spine — addition,
> resolution, unit vectors, scalar product) + **HC Verma Vol 1 Ch.2 "Physics and Mathematics" §2.1–2.9**
> (definition-rich pedagogy; parallelogram/triangle law, components, dot/cross product) + **DC Pandey
> Mechanics Vol 1 Ch.5 Vectors** (problem-pattern density: resultant magnitude/direction, range, special
> cases).
> Coverage class: **TRIPLE-COVERED**.
> Anchor density: **MEDIUM** — vectors are abstract math-machinery; they anchor through the *physics* they
> enable (forces on a slope, river-boat, projectile) rather than standalone Indian-context phenomena.
> **Critical role:** T5 formalises **the vector vocabulary** (what is a vector, how to add/resolve/multiply,
> what is a scalar) that EVERY Mechanics + E&M topic inherits. It is a DAG ROOT alongside T2 Units and
> T3 Math Tools.

---

## Build status — OLD ARCHITECTURE, SET ASIDE (NOT current product)

**⚠ None of the 19 sims below count as "built" at the current quality bar.** They are an OLD-ARCHITECTURE
batch (committed Apr–May 2026 by an earlier, lower-bar process) that the founder has **set aside**
(directive 2026-06-13). The ONLY real current product is the diamonds (magnetism + friction; see
`MAGNETISM_ARCHITECTURE.md` / `AUTHORING_PIPELINE.md`). These vector files exist on disk and are
registered (`src/data/concepts/<id>.json`, ids in `intentClassifier.ts` `VALID_CONCEPT_IDS`), so the
**`In repo?` column is marked `—` throughout** (= not a current-bar build) — they are **rebuild-to-diamond
candidates, not shipped lessons**. Their value here is purely structural: cataloguing them closes ~30
dangling `vector_resolution` prerequisite references and gives the future rebuild a ready skeleton.

`Disk id = catalog id (1:1)` for these files, and the four legacy bundle names
`vector_basics → unit_vector`, `vector_addition → resultant_formula`, `vector_components → vector_resolution`,
`scalar_vs_vector → current_not_vector` redirect via `CONCEPT_SYNONYMS`.

---

## Founder Decisions Applied

| Tag | Decision |
|---|---|
| **V-G1** | Atomic granularity = "one vector operation OR one vector-vs-scalar distinction." Addition, resolution, scalar multiplication, dot product, unit vectors = separate atomics. |
| **V-G2** | **The three scalar counterexamples are their own atomics** (`current_not_vector`, `pressure_scalar`, `area_vector`) — a quantity is a vector ONLY if it obeys the parallelogram law; current has direction but isn't a vector. **cognitive_error_target:** "anything with a direction is a vector." |
| **V-G3** | **The parallelogram law is the definitive test** (`parallelogram_law_test`) — promoted to its own atomic because it is the gate every "is this a vector?" question routes through. |
| **V-G4** | **Resultant magnitude, range, direction, and special cases are split** — magnitude formula is the atomic (`resultant_formula`); the 0°/90°/180° shortcuts (`special_cases`), the |A−B| ≤ R ≤ A+B bound (`range_inequality`), and the direction angle (`direction_of_resultant`) are nanos under it. |
| **V-G5** | **Resolution applications stay as nanos under `vector_resolution`** (`inclined_plane_components`, `negative_components`) — they reuse the same machinery in a force/sign context. |
| **V-G6** | **MEDIUM anchor** — vectors anchor through downstream physics, not standalone phenomena. No elevated anchor gate. |
| **V-G7** | **Nano convention note:** the 5 nanos here each exist as an old-architecture multi-state sim (3–4 states) BUILT BEFORE the "nano = 2 states" convention; marked nano by ROLE (sub-concept of a parent), not by state count. (Old files, set aside — see Build-status box.) |

---

## Section A — Source Map

| Sub-topic | NCERT 11.1 Ch.4 | HCV V1 Ch.2 | DCM M1 Ch.5 |
|---|---|---|---|
| Scalars vs vectors; what is a vector | §4.2 | §2.1 | §5.1 |
| Equality, negative, parallel vectors | §4.3 | §2.2 | §5.2 |
| Scalar (k·V) multiplication | §4.3 | §2.2 | §5.2 |
| Triangle / head-to-tail addition | §4.4 | §2.3 | §5.3 |
| Parallelogram law + resultant magnitude | §4.4 | §2.4 | §5.4 |
| Resolution into components; unit vectors | §4.5 | §2.5–2.6 | §5.5 |
| Dot (scalar) product | §4.5 (intro) | §2.8 | §5.7 |
| Cross (vector) product | §4.5 (intro) | §2.9 | §5.8 |

**NCERT Ch.4 introduces vectors as the tool for 2D motion** (vectors are not a standalone NCERT chapter —
they live inside Motion in a Plane). **HCV Ch.2 is the rigorous algebra backbone.** **DCM Ch.5 carries the
problem-pattern density** (resultant magnitude/direction drills, range, special-angle shortcuts).

---

## Section B — Atomic + Nano Catalog

| ID | Concept | Type | Sim? | In repo? | Requires | Required-by | Notes |
|---|---|---|---|---|---|---|---|
| **unit_vector** | A vector of magnitude 1 that carries direction only; any vector = (magnitude) × (unit vector). Notation â = A/\|A\|. The basis of all component work. | atomic | ✅ | — | — | [vector_head_to_tail, equal_vs_parallel, vector_resolution, unit_vector_form] | DAG root; alias target of legacy `vector_basics` |
| **scalar_multiplication** | Multiplying a vector by scalar k scales its magnitude by \|k\| and keeps direction if k>0, reverses it if k<0. | atomic | ✅ | — | — | [negative_vector, parallelogram_law_test] | foundation operation |
| **negative_vector** | −A is A with the same magnitude but opposite direction (the k=−1 case of scalar multiplication). A + (−A) = 0. | atomic | ✅ | — | [scalar_multiplication] | [angle_between_vectors] | sign-of-a-vector scaffold |
| **vector_head_to_tail** | Geometric (triangle) addition: place the tail of B at the head of A; the arrow from A's tail to B's head is the resultant. Generalises to the polygon law. | atomic | ✅ | — | [unit_vector] | [resultant_formula, parallelogram_law_test] | foundational addition; alias-related to `vector_addition` |
| **equal_vs_parallel** | Equal vectors: same magnitude AND direction (position irrelevant). Parallel: same direction, any magnitude. Distinguishes "equal" from "parallel/collinear." | atomic | ✅ | — | [unit_vector] | — | **cognitive_error_target:** "vectors at different points can't be equal" |
| **angle_between_vectors** | Protocol: bring both vectors to a common tail, arrows pointing outward; the angle between them is ≤ 180°. Critical for dot/cross products and resultant direction. | atomic | ✅ | — | [negative_vector] | [resultant_formula, dot_product, vector_resolution] | **cognitive_error_target:** "measure the angle without moving both to one tail" |
| **parallelogram_law_test** | The definitive test for whether a quantity is a vector: it must add by the parallelogram (equivalently triangle) law AND obey scalar multiplication. Direction alone is not enough. | atomic | ✅ | — | [vector_head_to_tail, scalar_multiplication] | [current_not_vector, pressure_scalar, area_vector] | V-G3; the "is it a vector?" gate |
| **current_not_vector** | Electric current has a direction (along the wire) yet is a SCALAR — at a junction currents add algebraically (Kirchhoff), not by the parallelogram law. The counterexample that defines "vector." | atomic | ✅ | — | [parallelogram_law_test] | [drift_velocity(T34)] | V-G2; alias target of legacy `scalar_vs_vector`; **cognitive_error_target:** "anything with direction is a vector" |
| **pressure_scalar** | Pressure pushes in all directions at a point yet is a SCALAR; the vector is the FORCE on a chosen surface, F = P·(A n̂). Distinguishes the scalar field from the vector it generates. | atomic | ✅ | — | [current_not_vector] | [fluid_pressure_atomic(T20)] | V-G2; **cognitive_error_target:** "pressure has a direction so it's a vector" |
| **area_vector** | Area is a scalar (size of a surface) but can be promoted to a vector A = A n̂ (magnitude × outward normal) — the form used for flux. Two faces of one quantity. | atomic | ✅ | — | [parallelogram_law_test] | [electric_flux(T30), magnetic_flux_definition(T35)] | bridge to flux chapters |
| **resultant_formula** | Magnitude of A + B from the law of cosines: \|R\| = √(A² + B² + 2AB cos θ). Why scalar addition fails when θ ≠ 0. | atomic | ✅ | — | [vector_head_to_tail, angle_between_vectors] | [special_cases, range_inequality, direction_of_resultant] | V-G4; alias-related to `vector_addition` |
| ↳ special_cases | The three shortcuts: θ=0° → R = A+B; θ=90° → R = √(A²+B²); θ=180° → R = \|A−B\|. | nano | ✅ | — | [resultant_formula] | — | parent: resultant_formula; old-arch fuller multi-state build (V-G7) |
| ↳ range_inequality | The resultant is bounded: \|A−B\| ≤ R ≤ A+B. Maximum when parallel, minimum when antiparallel. | nano | ✅ | — | [resultant_formula] | — | parent: resultant_formula; old-arch fuller multi-state build (V-G7) |
| ↳ direction_of_resultant | The resultant's direction: tan α = B sin θ / (A + B cos θ), measured from A. | nano | ✅ | — | [resultant_formula] | — | parent: resultant_formula; old-arch fuller multi-state build (V-G7) |
| **vector_resolution** | Splitting a vector into perpendicular components A_x = A cos θ, A_y = A sin θ; choosing axes to simplify a problem; recovering the vector by Pythagoras. The workhorse of all 2D physics. | atomic | ✅ | — | [unit_vector, angle_between_vectors] | [inclined_plane_components, negative_components, unit_vector_form, dot_product, position_frame_of_reference_atomic(T6), sign_convention_1d_atomic(T6), vector_kinematics_2d_atomic(T7), projectile_decoupling_atomic(T8), free_body_diagram(T11), magnetic_force_direction_right_hand_rule(T36), antenna_range_formula(T50)] | V-G5; alias target of legacy `vector_components`; **the most-required concept in the whole catalog** |
| ↳ inclined_plane_components | Resolving weight on a slope: mg sin θ along the incline, mg cos θ perpendicular. The canonical resolution application. | nano | ✅ | — | [vector_resolution] | [block_on_incline(T11), friction_block_on_inclined_plane(T12)] | parent: vector_resolution; old-arch fuller multi-state build (V-G7) |
| ↳ negative_components | Components carry signs that track direction (e.g. a vector in the 2nd quadrant has negative x-component); sign ≠ size. | nano | ✅ | — | [vector_resolution] | — | parent: vector_resolution; sign-discipline scaffold (V-G7) |
| **unit_vector_form** | Writing a vector in î, ĵ, k̂ form: A = A_x î + A_y ĵ + A_z k̂. The algebraic representation behind component addition and products. | atomic | ✅ | — | [unit_vector, vector_resolution] | [dot_product] | the algebra form of resolution |
| **dot_product** | Scalar product A·B = \|A\|\|B\| cos θ = A_x B_x + A_y B_y + A_z B_z. Geometric meaning (projection/overlap); zero ⇔ perpendicular. | atomic | ✅ | — | [vector_resolution, angle_between_vectors] | [work_done_by_constant_force(T13)] | gateway to work, flux, power |

**Atomic count:** 14. **Nano count:** 5. **Total entries:** 19.

> **Granularity gap (flagged):** the **cross (vector) product** is NOT yet a built T5 concept — downstream
> catalogs reference it as `vector_cross_product(math-tools)`. It is required by `dot_product`'s sibling
> operations and by T15 (torque, angular momentum) and T36 (Lorentz force, RHR). See Open Questions §I.1.

---

## Section C — Cross-Source Coverage Matrix

| Atomic | NCERT 11.1 Ch.4 | HCV V1 Ch.2 | DCM M1 Ch.5 | Coverage |
|---|---|---|---|---|
| unit_vector | §4.5 | §2.6 | §5.5 | TRIPLE |
| scalar_multiplication | §4.3 | §2.2 | §5.2 | TRIPLE |
| negative_vector | §4.3 | §2.2 | §5.2 | TRIPLE |
| vector_head_to_tail | §4.4 | §2.3 | §5.3 | TRIPLE |
| equal_vs_parallel | §4.3 | §2.2 | §5.2 | TRIPLE |
| angle_between_vectors | §4.4 | §2.4 | §5.4 | TRIPLE |
| parallelogram_law_test | §4.4 | §2.4 | §5.4 | TRIPLE |
| current_not_vector | §4.2 | §2.1 | §5.1 | TRIPLE (vector-test consequence) |
| pressure_scalar | (implicit §4.2) | §2.1 | §5.1 | DOUBLE+ (HCV/DCM explicit) |
| area_vector | §4.5 (flux later) | §2.7 | §5.6 | TRIPLE |
| resultant_formula | §4.4 | §2.4 | §5.4 | TRIPLE |
| vector_resolution | §4.5 | §2.5 | §5.5 | TRIPLE |
| unit_vector_form | §4.5 | §2.6 | §5.5 | TRIPLE |
| dot_product | §4.5 | §2.8 | §5.7 | TRIPLE |

**Triple-coverage rate: 13 of 14 atomics = 93%** (pressure_scalar is DOUBLE+; NCERT treats it implicitly).

---

## Section D — Stage-3 Math-Tool Dependencies

| Math-tool primitive | Used by | Status |
|---|---|---|
| `trigonometry_sin_cos` (components, projection) | vector_resolution, resultant_formula, dot_product | REQUIRED (existing) |
| `law_of_cosines` (resultant magnitude) | resultant_formula | REQUIRED (existing) |
| `pythagoras_theorem` (component recombination) | vector_resolution, special_cases | REQUIRED (existing) |
| `algebra_signed_scalar` (signed components) | negative_components, negative_vector | REQUIRED (existing) |
| `vector_cross_product` | (downstream T15, T36 — not a built T5 concept yet) | STUB (see §I.1) |

---

## Section E — Cross-Topic Dependencies (Bidirectional Edges)

### Outgoing (T5 requires from earlier topics)
T5 is a DAG ROOT — it requires only math-tools (trigonometry, law of cosines, Pythagoras). No physics prereqs.

### Incoming (T5 is required by later topics — the dangling-ref closures this page resolves)

| Source topic | Edge | Reason |
|---|---|---|
| **T6 Kinematics 1D** | `position_frame_of_reference_atomic` ← vector_resolution; `sign_convention_1d_atomic` ← vector_resolution | T6 §E already lists these (were dangling) |
| **T7 2D Kinematics** | `vector_kinematics_2d_atomic` ← vector_resolution, resultant_formula, dot_product | vector machinery for 2D motion |
| **T8 Projectile** | `projectile_decoupling_atomic` ← vector_resolution | resolve velocity into x/y |
| **T11 Newton's Laws** | `free_body_diagram`, `block_on_incline` ← vector_resolution, inclined_plane_components | force resolution on a slope |
| **T12 Friction** | `friction_block_on_inclined_plane` ← inclined_plane_components | mg sin θ / mg cos θ |
| **T13 Work-Energy** | `work_done_by_constant_force` ← dot_product | W = F·d |
| **T20 Fluids** | `fluid_pressure_atomic` ← pressure_scalar | scalar-pressure vs force-vector |
| **T30/T35** | `electric_flux`, `magnetic_flux_definition` ← area_vector | flux = field · area-vector |
| **T34 Current** | `drift_velocity` ← current_not_vector | current is a scalar (Kirchhoff) |
| **T36 Moving Charges** | `magnetic_force_direction_right_hand_rule` ← vector_resolution + (cross_product, §I.1) | F = qv×B direction |
| **T50 Comm** | `antenna_range_formula` ← vector_resolution | geometric line-of-sight |

**`vector_resolution` is the single most-required concept in the catalog** (~11 named downstream consumers,
~30 references counting nano-level edges). Creating this page is what makes those edges resolve on rebuild.

---

## Section F — Real-World Anchors (MEDIUM, Indian-context)

| Anchor | Concept hook | Strand |
|---|---|---|
| **Loaded handcart / luggage trolley pushed up a station ramp** | inclined_plane_components, vector_resolution | Transport / everyday |
| **Tug-of-war and crane rigging (two cables at an angle)** | resultant_formula, direction_of_resultant | Engineering |
| **Kirchhoff junction in any home wiring / Indian power board** | current_not_vector | Consumer / electrical |
| **Water pressure on a dam wall / overhead tank** | pressure_scalar | Infrastructure |
| **Boat crossing a river (Ganga ferry) — velocity components** | vector_resolution, resultant_formula | Transport (preview of T7) |

**MEDIUM** — vectors anchor through the physics they enable, not as standalone phenomena. No elevated gate.

---

## Section G — Cognitive-Error-Prevention Decisions

| Tag | cognitive_error_target | Countermeasure |
|---|---|---|
| **V-G2** | "anything with a direction is a vector" | current_not_vector + pressure_scalar — direction without parallelogram-law obedience |
| **V-G2** | "pressure has a direction, so it's a vector" | pressure-on-all-faces visual; the vector is the force on a surface |
| (angle) | "measure the angle without bringing both vectors to one tail" | common-tail protocol animation in angle_between_vectors |
| (equal) | "two arrows at different points can't be equal" | translate-without-rotate demo in equal_vs_parallel |

~3–4 of the founder decisions are cognitive-error-prevention type — moderate density; the scalar-vs-vector
confusion is the dominant trap.

---

## Section H — V1 Priority Flags

| Atomic | V1? | Reason |
|---|---|---|
| vector_resolution | ✅ | **FOUNDATIONAL** — most-required concept in the catalog |
| dot_product | ✅ | gateway to work/flux/power |
| resultant_formula | ✅ | every 2D problem; built with range/direction/special-cases nanos |
| parallelogram_law_test | ✅ | the "is it a vector?" gate |
| unit_vector / unit_vector_form | ✅ | basis of all component algebra |
| angle_between_vectors | ✅ | needed by products + resultant |
| current_not_vector / pressure_scalar / area_vector | ⚖️ | scalar-counterexample set; V1.1 |
| scalar_multiplication / negative_vector / equal_vs_parallel | ⚖️ | foundational but low-glamour; V1.1 |

**All 19 exist as old-architecture files but NONE is shipped at the diamond bar** — V1 flags here are
priority notes for the eventual rebuild, not a record of completed work.

---

## Section I — Open Questions

1. **Cross (vector) product is unbuilt.** Downstream catalogs reference `vector_cross_product(math-tools)`.
   It belongs in T5 as an atomic (with the 3D right-hand-rule archetype) and is pulled by T15 (torque,
   angular momentum) and T36 (Lorentz force). **Recommend authoring `vector_cross_product` as the next T5
   atomic** — it also unblocks the curriculum-architecture queue item #2 (RHR). Flagged in the architecture
   proposal §6 (new archetype: 3D cross-product hand mesh).
2. **Nano state-count vs convention.** The 5 nanos each exist as an old-arch 3–4-state sim built before the
   "nano = 2 states" rule. Retained as-is (V-G7); not a defect.
3. **Component addition / subtraction as a standalone atomic?** Currently implied by unit_vector_form +
   resultant_formula. Consider promotion if student data shows a gap.

---

## Section J — Sign-Off

- Authored (retro-catalog): Session 67, 2026-06-13.
- Author: Claude (Architect+Engineer role).
- Coverage class: **TRIPLE**. Triple-coverage rate: **93%** (13/14; pressure_scalar DOUBLE+).
- Anchor density: **MEDIUM** (vectors anchor through downstream physics).
- Atomic count: **14**. Nano count: **5**. Total: **19 entries** — old-architecture files on disk, **set
  aside, NOT current product** (rebuild-to-diamond candidates).
- Disk id = catalog id (1:1) for these files.
- **Closes the catalog's largest dangling-reference cluster** (`vector_resolution` ~30 refs across T6/T7/T8/T11/T13/T20/T30/T34/T35/T36/T50).
- Open gap: `vector_cross_product` unbuilt — recommended next T5 atomic (unblocks architecture queue #2).

---

*The catalog's biggest hole was a chapter whose 19 sims already exist on disk — but as OLD architecture,
set aside, not current product. Cataloguing them resolves ~30 downstream prerequisite edges and hands the
future rebuild a skeleton. The only real product today is the diamonds. One real gap remains: the cross
product.*
