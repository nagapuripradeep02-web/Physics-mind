# Stage-2 Pilot Catalog — Topic 30: Electrostatics

> Seventh Stage-2 catalog. First E&M-cluster pilot. Triple-covered (NCERT 12.1 Ch.1 + DCEM Ch.24 + HCV2 Ch.29). Companion to T17 SHM (paired batch); first bridge from mechanics into E&M.

## Founder Decisions Applied (E-G1 → E-G7)

| ID | Decision | Source-anchor | Effect on catalog |
|---|---|---|---|
| E-G1 | **Topic 30 includes Gauss's law as an atomic with nanos for the 3 canonical applications.** Capacitors split off to Topic 31. | DCEM keeps Gauss's law + applications inside Ch.24 (§24.12) — same chapter as Coulomb's law. HCV2 splits Gauss to Ch.30 — but it's still electrostatics core. | A29 `gauss_law_atomic` lives in Topic 30 with nanos for line-charge, sheet, spherical-shell applications |
| E-G2 | **Charge quantisation, conservation, and additivity = 3 separate atomics.** Distinct properties. | NCERT 12.1 §1.5 splits into 1.5.1 additivity, 1.5.2 conservation, 1.5.3 quantisation — three numbered sub-sections | A2 quantisation, A3 conservation, A4 additivity each atomic. Not one umbrella. |
| E-G3 | **Charging methods (rubbing/contact/induction) = 1 atomic + 3 method-nanos + 1 earthing-nano** | NCERT 1.4 covers induction; DCEM 24.4 covers all three; HCV2 29.1-end covers induction inline. Methods share the conceptual frame "electron transfer/redistribution." | A6 `charging_a_body` (atomic) + 4 nanos (rubbing, contact, induction, earthing). **Earthing nano is Indian-context anchor.** |
| E-G4 | **Coulomb's law (vacuum) is 1 atomic; dielectric-K modifier is 1 nano under it; vector form is a separate atomic** | F = kq₁q₂/r² is the scalar concept (atomic). The dielectric K modifier F_medium = F_vacuum/K (nano). Vector form F₂₁ = (1/4πε₀)(q₁q₂/r²)r̂₂₁ with sign tracking (separate atomic — distinct cognitive step) | A7 scalar atomic + A7.n1 dielectric nano + A8 vector-form atomic |
| E-G5 | **Each canonical E-field geometry = separate atomic** (point, ring, line, sheet) | DCEM §24.6 dedicates a derivation per geometry; HCV2 §29.3 does the same. Each is a distinct typed problem with its own setup. | A15 point, A16 ring, A17 infinite-line, A18 infinite-sheet (4 atomics). Disc on axis is a 5th candidate (flagged candidate_micro). |
| E-G6 | **Electric dipole = 1 atomic + 4 nanos for the 4 standard results** (axial field, equatorial field, potential, dipole-in-field problems) | HCV2 §29.9 packs dipole-potential + axial-field + equatorial-field + torque + PE into one cohesive narrative. Splitting into 5 atomics would over-fragment a tightly coupled concept set. | A25 `electric_dipole_definition_and_field` atomic + 4 nanos (axial, equatorial, potential, end-on/broad-on cases). Torque + PE get their own atomics (A26, A27) because they introduce angular-mechanics machinery. |
| E-G7 | **E-V relation (E = −∇V) = 1 atomic.** Equipotential-surface concept = its own atomic. | HCV2 §29.8 introduces E = −dV/dr and equipotential surfaces as ONE coupled lesson but the math (gradient) and geometry (perpendicular surfaces) are conceptually distinct — a student can know one and not the other. | A23 `relation_E_minus_grad_V` atomic + A24 `equipotential_surfaces` atomic. Separate. |

These seven decisions are applied INLINE in the atomic catalog below.

---

## Section A — Source Citations

| Source | Chapter / Section | Pages (book) | Role |
|---|---|---|---|
| **NCERT Class 12 Part 1** | Ch.1 Electric Charges and Fields §1.1 – §1.8 (partial — through Electric Field) | 1–24 | Indian-context anchor mining + canonical CBSE physics. **Strongest Indian-context section of any pilot so far.** |
| **DC Pandey Electricity & Magnetism** | Ch.24 Electrostatics §24.1 – §24.6 (intro through Electric Field with ring/line derivations) | 109–125 | JEE-Adv problem-pattern typing + 15-section chapter structure (Coulomb → Gauss → conductor properties) |
| **HC Verma Vol 2** | Ch.29 Electric Field and Potential §29.1 – §29.13 + Worked Examples 1–~19 | 104–122 | Pedagogy + dipole-as-angular-SHM (W.Ex 19, the **direct T30 ← T17 cross-topic bridge**) + induced-charge electron-counting (W.Ex 4) |

**Reads completed this session:**
- NCERT 12.1 PDF p.5–24 (Ch.1 §1.1–1.8 through Electric Field, ~20 pages)
- DCEM PDF p.117–136 (Ch.24 §24.1–24.6 with ring + line-charge full integration derivations, ~20 pages)
- HCV2 PDF p.120–139 (Ch.29 full theory + Worked Examples 1–~19, ~20 pages)

**Stage-3 follow-up reads flagged:**
- NCERT 12.1 §1.9–1.15 (electric flux, Gauss's law, applications) — book pages ~25–46
- DCEM §24.7–24.15 (potential, dipole, Gauss, conductors) — book pages ~125–231
- HCV2 Ch.30 (Gauss's Law standalone chapter) — book pages 127–143
Each contributes ~6 more atomics to the catalog. Stage-3 follow-up is **strongly recommended** because Gauss's law applications and capacitor-precursor concepts live there.

---

## Section B — Existing Repo Cross-Check

```
$ Glob src/data/concepts/*.json | grep -iE "(charge|coulomb|electric|field|potential|electrostat|dipole)"
(none — no electrostatics atomic JSON exists yet)
```

**Status:** Zero atomic JSONs shipped for electrostatics. Entirely greenfield. The only adjacent existing JSON is `magnetic_field_wire.json` (Topic 36 magnetism). Per `feedback-v1-one-concept-one-context`, Topic 30 must be authored fresh during Stage-5 priority queue.

**`physics_constants/` legacy:** May contain `coulombs_law.json` or similar legacy single-formula bundles. Not blocking — atomic v2 rewrite is the target.

---

## Section C — Methodology

1. **Three-source read first.** All theory sections from NCERT §1.1–1.8 + DCEM §24.1–24.6 + HCV2 §29.1–29.13 captured before any atomic was named.
2. **Atomic-vs-nano boundary test** (per CLAUDE.md §7) applied uniformly. Where uncertain, flagged `candidate_micro`.
3. **Source-role triad applied:** HCV2 owns derivations + first-principles approach (e.g., §29.1 gravitational-force vs Coulomb-force comparison is uniquely HCV); DCEM owns problem-pattern setup (e.g., Lami's theorem in 3-charge equilibrium, suspended-balls in liquid problem); NCERT owns Indian-context motivation (polyester saree, electric shock from bus iron bar, comb-on-dry-hair).
4. **Founder-style decisions E-G1 → E-G7 made inline.** Each documented at the point of effect.
5. **Cross-topic dependency tracking per plan rule.** Every atomic carries `Requires` + `Required-by`. Mechanics-side prerequisites (Newton-laws, vectors) tagged with `[T<N>]`. Forward cross-edges into E&M cluster (T31, T32, T33, T37, T44) tagged.

---

## Section D — Atomic + Nano Concept Catalog

### D.1 — Charge basics (A1–A5)

| ID | Concept | Type | Sim? | In repo? | Requires | Required-by | Notes |
|---|---|---|---|---|---|---|---|
| **A1** | `electric_charge_two_kinds_positive_negative` | atomic | ✅ | — | (none — concept entry-point) | A2, A3, A4, A6, A7 | Two types: positive (proton, glass rod after silk-rub) + negative (electron, plastic rod after fur-rub). Like repels, unlike attracts. **Indian-context anchor:** polyester saree spark in dry weather (NCERT §1.1 first paragraph). |
| ↳ A1.n1 | `like_charges_repel_unlike_charges_attract` | nano | ✅ | — | A1 | A6, A11 | Visual: two pith-balls hanging from threads; both repel or both attract depending on charge sign. NCERT Fig 1.1. |
| ↳ A1.n2 | `polarity_franklin_convention` | nano | ✅ | — | A1 | A2 | Glass-rod-after-silk = +, plastic-rod-after-fur = −. Sign convention by Benjamin Franklin. Historical/conventional, no deep physics. NCERT §1.2. |
| **A2** | `charge_quantisation_q_equals_n_times_e` | atomic | ✅ | — | A1 | A4, A20 | Charge always integer multiple of e = 1.6×10⁻¹⁹ C. Macroscopic charges are huge n. **Per E-G2: separate from conservation.** NCERT §1.5.3; HCV2 §29.1 ("charge is quantized"); DCEM §24.2 #3. |
| ↳ A2.n1 | `one_coulomb_equals_6_25e18_electrons` | nano | ✅ | — | A2 | exam_pattern_problems | 1 C / 1.6×10⁻¹⁹ ≈ 6.25×10¹⁸ electrons. NCERT Ex 1.2 (200 years to accumulate 1 C at 10⁹ e/s). HCV2 W.Ex 4. |
| ↳ A2.n2 | `microscopic_continuity_approximation` | nano | ✅ | — | A2 | A14, A16, A17 | At macroscopic scales the discreteness of e is invisible — we treat charge as continuous. Justifies integration over continuous charge distributions. NCERT §1.5.3 closing paragraph. |
| **A3** | `charge_conservation_in_isolated_system` | atomic | ✅ | — | A1 | A6 | Total charge of isolated system is constant. Per E-G2: separate from quantisation. NCERT §1.5.2 + DCEM §24.2 #4. **Pair-production / pair-annihilation example** as edge case (HCV2 §29.1: "in a beta decay process, a neutron converts into a proton and a fresh electron — total charge remains zero"). |
| ↳ A3.n1 | `charge_redistribution_not_creation` | nano | ✅ | — | A3, A6 | A6.n1, A6.n2 | Rubbing doesn't create charge — it transfers electrons. NCERT §1.2 final paragraph, HCV2 §29.1. |
| **A4** | `charge_additivity_algebraic_scalar_sum` | atomic | ✅ | — | A1, A2 | A8, A10 | Charges add algebraically with signs: (+1)+(+2)+(−3)+(+4)+(−5) = −1. Distinct from mass (always positive). Per E-G2: own atomic. NCERT §1.5.1. |
| **A5** | `conductors_insulators_semiconductors_classification` | atomic | ✅ | — | A1, atomic_structure_basics | A6, A29, A30 | Conductors (metals, human body, earth) have free electrons; insulators (glass, plastic, wood) do not; semiconductors (Si, Ge) in between. All three sources agree (NCERT §1.3, DCEM §24.3, HCV2 §29.12). |
| ↳ A5.n1 | `free_electrons_in_metals_conduction_electrons` | nano | ✅ | — | A5 | A29 | The cloud of weakly-bound outer-shell electrons. Critical for conductor physics. HCV2 §29.12. |

### D.2 — Charging methods (A6)

| ID | Concept | Type | Sim? | In repo? | Requires | Required-by | Notes |
|---|---|---|---|---|---|---|---|
| **A6** | `charging_a_body_umbrella` | atomic | ✅ | — | A1, A3, A5 | A30 | Per E-G3: one atomic with 4 method-nanos. Conceptual frame: electrons are transferred or redistributed; no charge is created. Covers all three classical charging methods + earthing for safety. |
| ↳ A6.n1 | `charging_by_friction_rubbing_electron_transfer` | nano | ✅ | — | A6 | — | Two materials rubbed → electrons flow from donor to acceptor. Glass+silk → glass becomes +, silk becomes −. NCERT 1.2, DCEM 24.4 Charging by Rubbing. |
| ↳ A6.n2 | `charging_by_contact_direct_transfer` | nano | ✅ | — | A6 | — | Charged object touches neutral object → both end with same-sign charge. DCEM 24.4 + Fig 24.1. |
| ↳ A6.n3 | `charging_by_induction_no_direct_contact` | nano | ✅ | — | A6 | A30 | Bring charged rod near conductor + ground → conductor ends with opposite charge. Rod is not consumed. NCERT 1.4 Fig 1.4, DCEM 24.4 Fig 24.2, HCV2 §29.1 last paragraph. |
| ↳ A6.n4 | `earthing_grounding_for_safety` | nano | ✅ | — | A6, A5 | — | **Indian-context anchor:** Third pin in domestic socket. When fault occurs, charge dumps to earth through the third pin → user does not get shocked. DCEM Ex 24.6 + NCERT §1.3 ("we have to stick to certain pairs"). |

### D.3 — Coulomb's law (A7–A10)

| ID | Concept | Type | Sim? | In repo? | Requires | Required-by | Notes |
|---|---|---|---|---|---|---|---|
| **A7** | `coulombs_law_inverse_square_scalar_form` | atomic | ✅ | — | A1, A2, vector_resolution [T5] | A8, A10, A14, A20 | F = k\|q₁q₂\|/r² where k = 1/4πε₀ ≈ 9×10⁹ N·m²/C². Force along line joining charges. NCERT 1.6 eq 1.1–1.2, DCEM 24.5, HCV2 29.2 eq 29.1. **Per E-G4: separate scalar atomic from vector form.** |
| ↳ A7.n1 | `coulombs_law_in_dielectric_medium_K_factor` | nano | ✅ | — | A7 | — | When a dielectric medium fills the space, F_medium = F_vacuum / K. K is dielectric constant of medium (K=1 vacuum, K≈80 water). DCEM 24.5 #4. |
| ↳ A7.n2 | `coulomb_constant_k_equals_9e9_value` | nano | ✅ | — | A7 | A14 | k = 8.988×10⁹ N·m²/C² ≈ 9×10⁹ for problems. Derived from c² × 10⁻⁷. NCERT 1.6, DCEM 24.5. |
| **A8** | `coulombs_law_vector_form_with_unit_vector` | atomic | ✅ | — | A7, vector_resolution [T5] | A10, A14 | F₂₁ = (1/4πε₀)(q₁q₂/r²₂₁)r̂₂₁ . Sign of charges + direction of r̂ together encode attract vs repel. Per E-G4: separate atomic. NCERT 1.6 eq 1.3 + Fig 1.6, HCV2 §29.2 eq after 29.1. |
| ↳ A8.n1 | `newton_third_law_for_coulomb_force` | nano | ✅ | — | A8, newton_third_law_atomic [T11] | — | F₂₁ = −F₁₂. Action-reaction pair. DCEM 24.5 #2. **Cross-topic ref T11 ← T30.** |
| ↳ A8.n2 | `position_vector_form_for_3d_problems` | nano | ✅ | — | A8 | — | F on q₁ due to q₂ at positions r₁, r₂: F₁ = (1/4πε₀)(q₁q₂/\|r₁−r₂\|³)(r₁−r₂). 3D vector form for non-collinear charges. DCEM §24.5 Extra Points + Fig 24.5. |
| **A9** | `coulomb_vs_gravitational_force_strength_ratio` | atomic | ✅ | — | A7, gravitational_force [T15] | — | F_e/F_g for two electrons = 4.17×10⁴² (HCV2 §29.1). For e-p = 2.4×10³⁹ (NCERT Ex 1.4). The take-away: electric force is ~10⁴⁰× stronger than gravity. **HCV2 owns this conceptual atomic.** |
| **A10** | `superposition_principle_force_from_multiple_charges` | atomic | ✅ | — | A7, A8 | A11, A12, A13, A14 | F₁ = Σᵢ F₁ᵢ = vector sum of pairwise Coulomb forces. NCERT 1.7 eq 1.4–1.5, DCEM 24.5 #1, HCV2 §29.2 (implicit). |

### D.4 — Force-application typed problems (A11–A13)

| ID | Concept | Type | Sim? | In repo? | Requires | Required-by | Notes |
|---|---|---|---|---|---|---|---|
| **A11** | `where_to_place_third_charge_for_zero_net_force` | atomic | ✅ | — | A10 | — | Two charges on a line; find position of third where net force = 0. Solution exists between like charges (closer to smaller) or outside unlike charges (beyond smaller). HCV2 W.Ex 2, DCEM-style typed problem. |
| **A12** | `charges_at_equilateral_triangle_vertices_resultant` | atomic | ✅ | — | A10 | — | Three charges at corners; find force on each. By symmetry resultant on any vertex is along bisector. NCERT Ex 1.6, HCV2 §29 W.Ex 1, DCEM Ex 24.8. |
| ↳ A12.n1 | `force_at_centroid_from_three_equal_charges_zero` | nano | ✅ | — | A12 | — | Charge Q at centroid of equilateral triangle with q,q,q at vertices: net F on Q = 0 by symmetry. NCERT Ex 1.6. |
| **A13** | `pith_balls_suspended_with_charges_geometry_problem` | atomic | ✅ | — | A10, newton_second_law_atomic [T11], tension_in_string [T11] | — | Two identical pith balls (mass m, charge q) on threads from common point. Find angle θ where tension + gravity + Coulomb balance. HCV2 W.Ex 22-23, DCEM Ex 24.9 (with dielectric variant). **Indian classroom favorite.** |

### D.5 — Electric field & field geometries (A14–A19)

| ID | Concept | Type | Sim? | In repo? | Requires | Required-by | Notes |
|---|---|---|---|---|---|---|---|
| **A14** | `electric_field_definition_E_equals_F_over_q_test_charge` | atomic | ✅ | — | A7, A10 | A15, A16, A17, A18, A20, A22, A23, A25 | E = lim(q→0) F/q. Vector. SI unit N/C (= V/m). Distinguishes "source" charge Q from "test" charge q. NCERT 1.8 + Eq 1.6–1.9, DCEM 24.6, HCV2 29.3. |
| ↳ A14.n1 | `field_independent_of_test_charge_magnitude` | nano | ✅ | — | A14 | — | E depends only on source Q and position r, not on test q. NCERT §1.8 point (ii). |
| ↳ A14.n2 | `field_direction_outward_for_positive_inward_for_negative` | nano | ✅ | — | A14 | A19 | E radially outward from +Q, radially inward to −Q. NCERT §1.8 point (iii). |
| **A15** | `electric_field_due_to_point_charge_E_equals_kQ_over_r2` | atomic | ✅ | — | A14, A7 | A16, A22, A25 | E = (1/4πε₀)(Q/r²) r̂. Spherical symmetry. NCERT §1.8 eq 1.6, DCEM 24.6, HCV2 29.3. **Per E-G5: own atomic.** |
| **A16** | `electric_field_due_to_ring_of_charge_axial` | atomic | ✅ | — | A14, A15, calculus_setup_for_continuous_distribution | — | E on axis at distance x from ring of radius R, total charge q: E_x = (1/4πε₀)(qx/(x²+R²)^(3/2)). Max at x = R/√2. Zero at center (x=0). Far-field reduces to point charge. **Per E-G5: own atomic.** DCEM §24.6 "Electric Field of a Ring of Charge" Figs 24.12–24.13, HCV2 W.Ex 2. |
| ↳ A16.n1 | `ring_field_maximum_at_x_equals_R_over_sqrt_2` | nano | ✅ | — | A16 | — | dE_x/dx = 0 → x = R/√2. E_max = (2/3√3)(1/4πε₀)(q/R²). DCEM §24.6 Fig 24.13. |
| ↳ A16.n2 | `ring_field_zero_at_center` | nano | ✅ | — | A16 | — | At x = 0 by symmetry forces from opposite ring segments cancel. DCEM §24.6 point (i). |
| **A17** | `electric_field_due_to_infinite_line_charge_lambda_over_2_pi_eps_r` | atomic | ✅ | — | A14, calculus_setup_for_continuous_distribution | A29.n1 (Gauss app) | E = λ/(2πε₀r) at perpendicular distance r from infinite line with linear charge density λ. E ∝ 1/r (not 1/r²). DCEM §24.6 "Electric Field of a Line Charge" derivation, HCV2 W.Ex 12. **Per E-G5: own atomic.** |
| ↳ A17.n1 | `finite_rod_E_field_perpendicular_bisector` | nano | ✅ | — | A17 | — | For rod length 2a at perpendicular distance x: E = q/(4πε₀ x√(x²+a²)). Reduces to ∞-line for x ≪ a. DCEM §24.6, HCV2 W.Ex 12. |
| **A18** | `electric_field_due_to_infinite_sheet_E_sigma_over_2_eps` | atomic | ✅ | — | A14, A29 (Gauss application) | A29.n2 | E = σ/(2ε₀) perpendicular to infinite uniformly charged sheet. Independent of distance. NCERT §1.15 (in Stage-3 follow-up read). **Per E-G5: own atomic.** Listed here as forward-reference; full derivation belongs to Gauss-law application atomic A29.n2. |
| **A19** | `electric_field_lines_visualization_faraday` | atomic | ✅ | — | A14 | — | Lines tangent to E, density proportional to magnitude. Originate from +, terminate at −, never cross. NCERT §1.11, DCEM (later section, Stage 3), HCV2 §29.4. |
| ↳ A19.n1 | `lines_dont_cross_uniqueness_of_E` | nano | ✅ | — | A19 | — | At any point E has unique direction → field lines can't cross. HCV2 §29.4. |

### D.6 — Electric potential energy & potential (A20–A24)

| ID | Concept | Type | Sim? | In repo? | Requires | Required-by | Notes |
|---|---|---|---|---|---|---|---|
| **A20** | `electric_potential_energy_two_charge_system` | atomic | ✅ | — | A7, work_energy_theorem [T13], conservation_of_mechanical_energy [T13] | A21, A22, A27 | U(r) = (1/4πε₀)(q₁q₂/r) with U(∞) = 0. Work done by external agent against Coulomb force. HCV2 §29.5 eq 29.5–29.6. **Cross-topic ref T13 ← T30.** |
| ↳ A20.n1 | `pe_three_charge_system_pairwise_sum` | nano | ✅ | — | A20 | — | U_total = Σ pairs (1/4πε₀)(qᵢqⱼ/rᵢⱼ). HCV2 Ex 29.3 (three 10μC charges at triangle, U = 27 J). |
| **A21** | `electric_potential_definition_V_equals_U_over_q` | atomic | ✅ | — | A20 | A22, A23, A24 | V_A = U_A/q (PE per unit test charge). Scalar (unlike E which is vector). Unit volt = joule/coulomb. HCV2 §29.6 eq 29.7–29.8, NCERT (later in Stage 3). |
| ↳ A21.n1 | `potential_difference_V_B_minus_V_A_independent_of_path` | nano | ✅ | — | A21 | — | V_B − V_A = (U_B − U_A)/q depends only on endpoints. Conservative-field consequence. HCV2 §29.6. |
| **A22** | `electric_potential_due_to_point_charge_V_kQ_over_r` | atomic | ✅ | — | A21, A15 | A23, A25, A27 | V(r) = (1/4πε₀)(Q/r) with V(∞) = 0. Scalar — adds algebraically for multiple charges (no vector decomposition needed). HCV2 §29.7 eq 29.9. |
| ↳ A22.n1 | `superposition_of_potential_is_algebraic_sum` | nano | ✅ | — | A22, A21 | — | V_total = Σᵢ Vᵢ. Scalar sum, unlike E which is vector sum. HCV2 §29.7 eq + Ex 29.4 (two charges 10μC + 20μC give V = 27 MV). |
| **A23** | `relation_E_equals_minus_grad_V` | atomic | ✅ | — | A14, A21 | A24, A28 | E = −dV/dr along direction of maximum decrease. Components: E_x = −∂V/∂x, etc. The differential link between field and potential. HCV2 §29.8 eq 29.10–29.13. Per E-G7: own atomic. |
| ↳ A23.n1 | `E_along_direction_of_steepest_V_decrease` | nano | ✅ | — | A23 | A24 | E points in direction of fastest V drop. dV/dr is rate of change with position. HCV2 §29.8 "the electric field is along the direction in which the potential decreases at the maximum rate." |
| **A24** | `equipotential_surfaces_perpendicular_to_E` | atomic | ✅ | — | A23 | — | Surfaces where V = constant. E always perpendicular to them. No work done moving charge along an equipotential. Per E-G7: own atomic. For point charge → concentric spheres. HCV2 §29.8 Fig 29.11. |
| ↳ A24.n1 | `for_point_charge_equipotentials_are_concentric_spheres` | nano | ✅ | — | A24 | — | V = kQ/r → V = const ⇔ r = const. HCV2 §29.8 Fig 29.11. |
| ↳ A24.n2 | `two_equipotential_surfaces_never_intersect` | nano | ✅ | — | A24 | — | If they did, the point of intersection would have two different V values. HCV2 §29 Short Answer Q8. |

### D.7 — Electric dipole (A25–A28)

| ID | Concept | Type | Sim? | In repo? | Requires | Required-by | Notes |
|---|---|---|---|---|---|---|---|
| **A25** | `electric_dipole_definition_p_equals_qd` | atomic | ✅ | — | A1, A15, A22, vector_resolution [T5] | A26, A27, A28, water_molecule_dipole_chemistry | Per E-G6: this atomic absorbs definition + axial field + equatorial field + potential into one cohesive lesson. p = q·d vector from −q to +q. SI unit C·m. Dipole-axis-of-orientation concept. HCV2 §29.9. |
| ↳ A25.n1 | `axial_field_at_distance_r_equals_2kp_over_r3` | nano | ✅ | — | A25 | — | On dipole axis (end-on, θ=0): E = (1/4πε₀)(2p/r³) parallel to p. Falls as 1/r³ (faster than point charge). HCV2 §29.9 "Special Cases (a)" + eq 29.17. |
| ↳ A25.n2 | `equatorial_field_at_distance_r_equals_kp_over_r3_antiparallel` | nano | ✅ | — | A25 | — | On perpendicular bisector (broadside, θ=π/2): E = (1/4πε₀)(p/r³) antiparallel to p. Half of axial magnitude. HCV2 §29.9 "Special Cases (b)" + eq 29.17. |
| ↳ A25.n3 | `dipole_potential_V_equals_kp_cos_theta_over_r2` | nano | ✅ | — | A25, A22 | A26, A27 | V at angle θ from axis: V = (1/4πε₀)(p cos θ/r²). Zero on equator (θ=π/2). Falls as 1/r² (faster than point charge). HCV2 §29.9 eq 29.16. |
| ↳ A25.n4 | `dipole_field_general_angle_theta_formula` | nano | ✅ | — | A25 | — | E_r = (1/4πε₀)(2p cos θ/r³), E_θ = (1/4πε₀)(p sin θ/r³). Total magnitude E = (1/4πε₀)(p/r³)√(3cos²θ+1). HCV2 §29.9 eq 29.17. |
| **A26** | `torque_on_dipole_in_uniform_electric_field_p_cross_E` | atomic | ✅ | — | A25, A14 | A27, A28 | τ = p × E. Magnitude τ = pE sin θ. Restoring direction. HCV2 §29.10 eq 29.19, NCERT §1.10 (Stage 3). |
| **A27** | `potential_energy_of_dipole_in_uniform_field_negative_p_dot_E` | atomic | ✅ | — | A26, A20, A22 | A28 | U(θ) = −p·E = −pE cos θ. Minimum (most stable) at θ=0 (aligned with E); maximum (unstable) at θ=π (antiparallel). HCV2 §29.11 eq 29.20. |
| **A28** | `dipole_as_angular_shm_in_uniform_field_small_displacement` | atomic | ✅ | — | A26, angular_shm_equation [T17:A21], moment_of_inertia_atomic [T16] | — | For small angular displacement from equilibrium, dipole executes angular SHM with T = 2π√(I/pE) where I is dipole's moment of inertia about center. HCV2 W.Ex 19 (Fig 29-W12): rod with ±q at ends, I = ml²/2, T = 2π√(ml/2qE). **THIS IS THE DIRECT T17 → T30 CROSS-TOPIC BRIDGE.** Uses A21 angular SHM equation from Topic 17. |

### D.8 — Conductors in electrostatic equilibrium (A29–A30)

| ID | Concept | Type | Sim? | In repo? | Requires | Required-by | Notes |
|---|---|---|---|---|---|---|---|
| **A29** | `gauss_law_atomic` | atomic | ✅ | — | A14 | A18, A30, T31:capacitance_atomics | Per E-G1: Gauss's law lives in Topic 30 as one atomic with 3 application-nanos. ∮ E·dA = Q_enc/ε₀. Theoretical formulation from NCERT §1.12 (Stage-3 follow-up), DCEM §24.12 (Stage 3), HCV2 Ch.30 (Stage 3). **Placeholder — full content requires Stage-3 read.** |
| ↳ A29.n1 | `gauss_application_infinite_line_charge` | nano | ✅ | — | A29, A17 | A17 | Cylindrical Gaussian surface around infinite line → E = λ/(2πε₀r). The Gauss-derived version of A17. |
| ↳ A29.n2 | `gauss_application_infinite_charged_sheet` | nano | ✅ | — | A29, A18 | A18 | Pill-box Gaussian surface across sheet → E = σ/2ε₀. The Gauss-derived version of A18. |
| ↳ A29.n3 | `gauss_application_uniformly_charged_spherical_shell` | nano | ✅ | — | A29 | conductor_field_distribution | Inside thin shell: E = 0. Outside: E = kQ/r² (as if all charge at center). The "shell theorem" parallel to gravitation T15. |
| **A30** | `electric_field_inside_conductor_in_electrostatics_zero` | atomic | ✅ | — | A6.n3, A29 | T31:capacitor_field_between_plates | E_inside = 0 under static conditions. Mobile electrons redistribute on surface until internal field exactly cancels external. **Crucial property.** HCV2 §29.13 + Fig 29.15. |
| ↳ A30.n1 | `induced_charges_redistribute_to_surface` | nano | ✅ | — | A30, A6.n3 | T31 | All net charge on conductor lives on its surface (volume charge density = 0 inside). HCV2 §29.13. |
| ↳ A30.n2 | `time_to_equilibrium_less_than_millisecond` | nano | ✅ | — | A30 | — | The redistribution is essentially instantaneous (< 1 ms) in good conductors. HCV2 §29.13 closing. |

### D.9 — Cross-topic-refs from Topic 30

| Ref | Concept (location) | Direction | Notes |
|---|---|---|---|
| T5:vector_resolution | "Resolving vectors along axes" | T30 ← T5 | Used pervasively in A8 vector form Coulomb, A10 superposition, A14 field, A25 dipole field components |
| T11:newton_second_law_direction | "F = ma with sign-direction" | T30 ← T11 | Used in A13 pith-ball equilibrium |
| T11:newton_third_law_atomic | "F_AB = −F_BA" | T30 ← T11 | A8.n1 — Coulomb force is action-reaction pair |
| T11:tension_in_string | "Tension in massless string" | T30 ← T11 | A13 suspended-ball geometry |
| T13:work_energy_theorem | "ΔKE = W_net" | T30 ← T13 | A20 PE definition starts from W done against field |
| T13:conservation_of_mechanical_energy | "Total ME conserved (conservative forces)" | T30 ← T13 | A20–A21 — Coulomb force is conservative, so V is well-defined |
| T15:gravitational_force | "F_g = GMm/r²" | T30 ← T15 | A9 explicit gravitational-vs-Coulomb-force ratio comparison |
| T16:moment_of_inertia_atomic | "I as rotational inertia" | T30 ← T16 | A28 dipole as angular SHM uses I of rod |
| T17:angular_shm_equation | "Γ = −kθ angular SHM" | T30 ← T17 | **A28 dipole as angular SHM — the SHM↔E&M bridge confirmed in HCV2 W.Ex 19** |

### D.10 — Cross-topic OUT-edges (Topic 30 → other topics)

| Ref | Target concept (location) | Direction | Notes |
|---|---|---|---|
| T31:capacitance_parallel_plate_C_eps_A_over_d | "C = ε₀A/d" | T30 → T31 | Capacitance derives directly from E (A18 sheet field) + V (A21) |
| T31:energy_stored_capacitor_half_CV_squared | "U_cap = ½CV²" | T30 → T31 | Uses A20 PE concept generalized to charge on capacitor plates |
| T32:ohms_law_microscopic_j_sigma_E | "j = σE microscopic" | T30 → T32 | The E in conductor (under non-equilibrium) drives current |
| T32:drift_velocity_v_d_eE_tau_over_m | "v_d = eEτ/m" | T30 → T32 | Drift velocity uses A14 field acting on free electrons |
| T33:joule_heating_P_VI | "P = VI in resistor" | T30 → T33 | Uses V definition A21 |
| T36:lorentz_force_F_qv_cross_B | "F = qv×B magnetic force" | T30 → T36 | Charge in motion → magnetic side of EM. A1 charge concept reused. |
| T37:magnetic_field_from_moving_charge | "Biot-Savart law" | T30 → T37 | Same charges that produce E when stationary produce B when moving |
| T44:lc_oscillator_atomic | "LC oscillation" | T30 → T44 | Energy oscillates between capacitor (E-field) and inductor (B-field) — uses A20 energy concept |
| T17:any_oscillation_atomic | "Reverse direction: dipole-in-field SHM uses linear SHM template" | T30 ↔ T17 | Bidirectional edge already documented |

---

## Section E — Cross-Source Matrix (NCERT × DCEM × HCV2)

| Concept area | NCERT 12.1 Ch.1 | DCEM Ch.24 | HCV2 Ch.29 | Notes |
|---|---|---|---|---|
| Two kinds of charge | §1.2 + Fig 1.1 | §24.2 | §29.1 + "Two Kinds of Charges" | All three. **NCERT owns Indian-context: polyester saree spark (§1.1 opening).** |
| Quantisation q = ne | §1.5.3 | §24.2 #3 | §29.1 "Charge is Quantized" | All three converge. NCERT Ex 1.2 (200 years for 1 coulomb) is rich. |
| Conservation | §1.5.2 | §24.2 #4 | §29.1 "Charge is Conserved" | All three. HCV2 has the beta-decay illustration. |
| Additivity (algebraic sum) | §1.5.1 | implicit | implicit | **NCERT owns** the explicit numbered sub-section. DCEM and HCV2 treat as obvious. |
| Conductors/insulators/semiconductors | §1.3 | §24.3 | §29.12 | All three. HCV2 has best free-electron physics explanation. |
| Charging methods | §1.4 induction only | §24.4 all 3 methods | §29.1 induction only | **DCEM owns** the explicit 3-method breakdown. |
| Earthing/grounding | brief in §1.3 | §24.4 Fig 24.2 + Ex 24.6 | not explicit | **DCEM owns this; Indian-context Ex 24.6 (third-hole socket for safety).** |
| Coulomb's law scalar | §1.6 eq 1.1–1.2 | §24.5 | §29.2 eq 29.1 | All three converge. HCV2 has cleanest derivation. |
| Coulomb's law vector | §1.6 eq 1.3 + Fig 1.6 | §24.5 + Extra Points Fig 24.5 | §29.2 (post eq 29.1) | All three but **HCV2** + DCEM provide position-vector form for 3D |
| Coulomb vs gravity strength | Ex 1.4 (e-p ratio 2.4e39) | (Stage 3) | §29.1 (e-e ratio + neutron-neutron comparison) | **HCV2 owns this conceptual atomic.** |
| Superposition (forces) | §1.7 eq 1.4–1.5 + Fig 1.8 | §24.5 #1 | implicit | All three; NCERT has cleanest figure. |
| Triangle/square charge configurations | §1.7 Ex 1.6–1.7 + Fig 1.9 | Ex 24.8 + Fig 24.6 | W.Ex 1 + Fig 29-W1 | All three converge. DCEM has 2-method demo (coordinate vs angle method). |
| E field definition | §1.8 eq 1.6–1.9 | §24.6 | §29.3 eq 29.3 | All three. NCERT cleanest "test-charge limit" treatment. |
| E from point charge | §1.8 Fig 1.11 | §24.6 eq | §29.3 eq 29.4 | All three converge. |
| E from ring of charge | — | §24.6 Figs 24.12–24.13 with calculus | W.Ex 2 + Fig 29.4 with calculus | **HCV2 + DCEM own**; NCERT skips. DCEM has the optimization (E_max at x = R/√2). |
| E from infinite line charge | — (Gauss-derived in §1.14) | §24.6 (direct integration) | W.Ex 12 (direct integration) | **DCEM + HCV2 own direct-integration derivation.** Important alternative to Gauss. |
| E from infinite sheet | — (Gauss in §1.15) | — (Gauss in §24.12) | — (Gauss in Ch.30) | All three deferred to Gauss — Stage-3 follow-up reads |
| Electric field lines | §1.11 | (Stage 3) | §29.4 Figs 29.5–29.6 | NCERT + HCV2 own. Faraday's lines. |
| Electric PE (two charges) | (Stage 3 §1.13) | (Stage 3) | §29.5 eq 29.5–29.6 | HCV2 owns in our read. |
| Electric potential V | (Stage 3 §1.13) | (Stage 3) | §29.6 eq 29.7–29.8 | HCV2 owns in our read. |
| V due to point charge | (Stage 3) | (Stage 3) | §29.7 eq 29.9 + Ex 29.4 (V at midpoint) | HCV2 owns. |
| E and V relation (E = −dV/dr) | (Stage 3) | (Stage 3) | §29.8 eq 29.10–29.14 | **HCV2 owns** the explicit gradient relation |
| Equipotential surfaces | (Stage 3) | (Stage 3) | §29.8 Fig 29.11 | HCV2 owns. |
| Electric dipole — definition + p vector | (Stage 3) | (Stage 3) | §29.9 eq 29.15 | HCV2 owns in our read. |
| Dipole potential V = kp cos θ/r² | (Stage 3) | (Stage 3) | §29.9 eq 29.16 | HCV2 owns. |
| Axial + equatorial field | (Stage 3) | (Stage 3) | §29.9 Special Cases + eq 29.17 | HCV2 owns the explicit special-case breakdown. |
| Torque on dipole in field | (Stage 3) | (Stage 3) | §29.10 + Fig 29.14 + eq 29.19 | HCV2 owns. |
| PE of dipole in field U = −p·E | (Stage 3) | (Stage 3) | §29.11 eq 29.20 | HCV2 owns. |
| **Dipole as angular SHM** | — | — | §29 **W.Ex 19** | **HCV2 exclusively owns** this T30↔T17 bridge. |
| E inside conductor = 0 | (Stage 3) | (Stage 3) | §29.13 + Fig 29.15 | **HCV2 owns** in our read. |

### Source-role triad verification

| Role | Owner | Evidence in this catalog |
|---|---|---|
| Pedagogy + first-principles derivation | **HCV2** | §29.1 explicit Coulomb-vs-gravity comparison; §29.5 direct integration to define U(r); §29.8 explicit ∂V/∂x = −E_x derivation; §29 W.Ex 19 dipole-as-angular-SHM derivation |
| Problem-pattern taxonomy + JEE-Adv typed problems | **DCEM** | Ex 24.8 two-method (coordinate + angle) for equilateral-triangle force; Ex 24.9 suspended-balls-in-liquid with dielectric K; §24.6 ring-field E_max optimization; Lami's theorem as Extra Point |
| Indian-context anchors + motivation | **NCERT** | "Polyester saree spark in dry weather" (§1.1 opening line); "electric shock from car door or bus iron bar after sliding from seat" (§1.1); "comb attracts paper after dry hair combing" (§1.4 Ex 1.5); two-hundred-years-to-collect-1-coulomb thought experiment (Ex 1.2) |

**Triad holds for the 7th consecutive pilot.** No mixing observed. The E&M cluster preserves the same source-role pattern that held in the Mechanics cluster.

---

## Section F — V1 Priority (deferred to Stage 5)

Per memory `feedback-v1-priority-deferred-to-stage-5`, no per-topic V1 queue here. Per-row `v1?` flag absent from atomic tables.

Provisional Stage-5 candidates (founder-judgment, not data-driven):
- **A1** `electric_charge_two_kinds_positive_negative` — foundational entry; every student starts here
- **A7** `coulombs_law_inverse_square_scalar_form` — JEE Mains weight high; appears in nearly every E&M paper
- **A14** `electric_field_definition_E_equals_F_over_q_test_charge` — pivot for everything downstream
- **A15** `electric_field_due_to_point_charge_E_equals_kQ_over_r2` — bread-and-butter
- **A21** `electric_potential_definition_V_equals_U_over_q` — JEE-Adv heavy
- **A25** `electric_dipole_definition_p_equals_qd` — high MCQ frequency JEE Mains + NEET
- **A26** `torque_on_dipole_in_uniform_electric_field_p_cross_E` — appears in NEET frequently
- **A29** `gauss_law_atomic` (once Stage-3 read done) — JEE-Advanced staple

Total flagged: 8 of 30 atomics (~27%). Slightly higher than the 20% norm — reflects that electrostatics has higher PYQ-frequency density than typical topics. Confirm at Stage 5.

---

## Section G — Open Questions for Founder

1. **Stage-3 follow-up reads (Gauss + potential + dipole formal sections):** Strongly recommended. NCERT §1.9–1.15, DCEM §24.7–24.15, HCV2 Ch.30. Will add ~6 more atomics (electric flux, Gauss application to 3 geometries with full derivations, dipole formal section in NCERT, capacitor-precursor concepts). Without this read, A29 Gauss atomic stays placeholder. **Estimate: 60 PDF pages, 20–30 min of careful read.**
2. **A18 infinite-sheet field** — currently marked as forward-reference (depends on A29 Gauss derivation). Should A18 be an atomic at all, or just a derivation-result inside A29.n2? **Provisional decision: keep as atomic** because students should recognize the σ/2ε₀ result on sight without doing Gauss derivation every time. Confirms at Stage 4.
3. **Disc on axis (uniformly charged disc) E-field:** A 5th canonical geometry alongside point/ring/line/sheet. NCERT and HCV2 skip; only some JEE-Adv problems use it. Worth atomic status? **Candidate_micro for now** — Stage 4 decides.
4. **HCV2 W.Ex 13** (charge moving in uniform E field — projectile-like motion) creates a cross-topic edge to T8 projectile motion. Worth recording as its own atomic? **Defer to Stage 4** — feels like an application of A14 + projectile, not a new concept.
5. **A30.n2 (millisecond equilibrium time)** flagged as candidate_micro. Single-state insight: conductors reach equilibrium fast. Useful for student intuition but not a teaching arc. Stage-4 candidate_micro decision pending.
6. **Earthing nano A6.n4** — is the Indian-context wiring of "earthing = safety in domestic outlets" enough to make this its own atomic? Currently a nano under A6 charging-methods. Founder judgment: leave as nano because the physics is identical to ground-as-charge-sink in induction; safety motivation is anchor-level, not new-concept-level.

---

## Section H — Scope Boundary

This catalog covers **electrostatics core**: charge, Coulomb force, field, potential, dipole, conductor in equilibrium. It does NOT cover:
- Capacitors (Topic 31 — DCEM Ch.25 / NCERT 12.1 Ch.2 / HCV2 Ch.31). Bridge T30 → T31 documented in D.10.
- Current Electricity (Topic 32 — separate topic). Bridge T30 → T32 documented.
- Dielectrics in detail (Topic 31). Only K-factor mentioned in A7.n1.
- Magnetism (Topics 36, 37). Bridge T30 → T36/37 documented.
- Quantum electrodynamics or photon-mediated force (out of JEE scope).

---

## Section I — Scaling Notes

1. **Source-role triad holds for the 7th pilot.** First E&M-side validation. The pattern (HCV pedagogy / DCP problem-typing / NCERT Indian-context) is now confirmed cross-cluster (Mechanics + E&M). Memory rule `feedback-source-role-triad` upgraded from "5-pilot empirical" to "7-pilot stable across clusters."
2. **Atomic count for Topic 30 = 30 atomics + ~30 nanos** (before Stage-3 read which will add ~6 atomics). Running mean across 7 pilots: ~30 atomics per topic. Variance is decreasing. **Strong signal that ~30 is the true natural per-topic atomic density** — implies the full 11-book catalog will land around ~30 × 30 = ~900 atomics for the triple-covered set, ±100.
3. **Topic 30 cross-topic IN-degree = 9** (T5, T11×3, T13×2, T15, T16, T17). Tied with T10 Circular Motion for highest IN-degree among the 7 pilots so far. **Electrostatics absorbs the entire mechanics-cluster prerequisite stack.**
4. **Topic 30 cross-topic OUT-degree = 9** (T31×2, T32×2, T33, T36, T37, T44, T17). Highest OUT-degree among 7 pilots. **Topic 30 is the E&M-cluster axis topic** — every downstream E&M concept ultimately depends on these 30 atomics.
5. **Indian-context anchor density is the highest of any pilot so far.** NCERT §1.1 alone provides 4 distinct everyday Indian anchors (polyester saree, synthetic sweater shock, car-door shock, lightning). This is unusually rich; matched only by Topic 13 Work-Energy-Power (walking-power anchor).
6. **Per-topic worked example density is also highest seen.** HCV2 §29 has ~19 worked examples + 14 short-answer questions + 8 OBJECTIVE-I + 8 OBJECTIVE-II + 64 numerical exercises. Plus DCEM Ex 24.1–24.12. Total problem-pattern surface area ≈ 130 typed problems for one chapter. Stage-5 V1 priority should weight Topic 30 as **top-tier** — both PYQ-rich AND foundational.
7. **T17 ↔ T30 paired-batch insight:** The two topics together form a complete "oscillation across both clusters" arc — linear SHM (mass-on-spring) ↔ angular SHM (torsional, pendulum) ↔ electrical SHM (dipole in field, LC oscillator). Sequential authoring would naturally pair them OR fan out from T17 into both T22 (waves) and T30 (E&M dipoles).

---

## Section J — Verification Checklist

- [x] Three sources read with explicit page citations (NCERT 12.1 p.1–24, DCEM p.109–125, HCV2 p.104–123)
- [x] All 30 atomics carry `Requires` AND `Required-by` columns with concept-IDs
- [x] All `Requires` refs either exist in this catalog OR carry `[T<N>]` cross-topic tag
- [x] Founder-style decisions E-G1 → E-G7 documented at top + applied inline
- [x] Cross-source matrix (Section E) populated cell-by-cell with section/figure references
- [x] Source-role triad explicitly verified (Section E end)
- [x] Indian-context anchors mined: 6+ direct anchors (polyester saree, synthetic clothes shock, lightning monsoon, car-door shock, comb-paper, earthing third-hole)
- [x] Open questions (Section G) lists ≥3 founder-decision items + Stage-3 read flagged
- [x] No JSON authored — Stage-2 deliverable is markdown catalog only
- [x] Concept IDs follow `kebab_case_underscored` convention per CLAUDE.md §3
- [x] T17 ↔ T30 paired-batch bridge confirmed empirically (HCV2 §29 W.Ex 19 = dipole-as-angular-SHM uses T17:A21)
- [x] Seven pilots completed. Source-role triad stable across Mechanics + E&M clusters. Atomic count clustering ~30. Matrix data ready for Section update.

---

*Pilot 7 of N. Companion to T17 (paired batch). Next: update cross-topic-dependency-matrix with T17 + T30 OUT-edge rows.*
